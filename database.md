# HealthCard — database.md

Postgres on Supabase (Mumbai region). Everything below is migration-ready SQL. Put it in `supabase/migrations/` as ordered files.

---

## 1. Design rules

1. **Person ≠ Card ≠ Account.** `patients` (the person), `health_cards` (many per patient), `auth.users` (login, optional link).
2. **Never store the raw card token.** Store `sha256(token)` only.
3. **Append-only clinical data.** Corrections create new rows pointing to the old one (`supersedes_id`). No `UPDATE`/`DELETE` for clinical tables (enforced by trigger).
4. **Provenance on every clinical row:** `source_org_id`, `entered_by`, `verification` (`provider_verified` | `patient_reported`).
5. **RLS on every table.** No table in `public` without `enable row level security`.
6. **PHI never in logs, URLs, or error messages.**
7. UUID primary keys; `timestamptz` everywhere (store UTC, display IST).

---

## 2. Extensions & enums

```sql
create extension if not exists pgcrypto;
create extension if not exists pg_trgm;   -- fuzzy name matching / search

create type org_type as enum ('hospital','clinic','lab','issuer','platform');
create type staff_role as enum (
  'super_admin','support','issuer_admin','issuer_operator',
  'hospital_admin','doctor','nurse','receptionist','lab_tech','lab_admin');
create type card_status as enum
  ('created','pending','issued','active','suspended','lost','blocked','replaced');
create type verification as enum ('provider_verified','patient_reported');
create type access_status as enum
  ('pending','approved','rejected','expired','revoked');
create type order_type as enum ('new','reprint','replacement');
create type order_status as enum
  ('requested','generated','printing','ready','dispatched','delivered','failed','cancelled');
create type patient_status as enum ('active','deceased','merged','restricted');
```

---

## 3. Identity

```sql
-- 12-digit Health ID generator: random, non-sequential, with Verhoeff-style check not required
create or replace function gen_health_id() returns text
language plpgsql as $$
declare v text;
begin
  loop
    v := lpad((floor(random()*1e12))::bigint::text, 12, '0');
    -- avoid leading zero for nicer display & obvious patterns
    continue when left(v,1) = '0';
    exit when not exists (select 1 from patients where health_id = v);
  end loop;
  return v;
end $$;
-- NOTE: for production use gen_random_bytes-based randomness instead of random().

create table patients (
  id uuid primary key default gen_random_uuid(),
  health_id char(12) unique not null check (health_id ~ '^[0-9]{12}$'),
  auth_user_id uuid unique references auth.users(id),   -- null until patient claims account
  full_name text not null,
  dob date not null,
  sex text check (sex in ('male','female','other','unknown')),
  mobile_e164 text,            -- +91XXXXXXXXXX
  email text,
  preferred_language text default 'en',
  address jsonb,
  blood_group text,            -- patient-reported until provider-verified
  status patient_status not null default 'active',
  merged_into uuid references patients(id),
  created_by uuid,             -- staff id
  created_at timestamptz default now()
);
create index on patients using gin (full_name gin_trgm_ops);
create index on patients (mobile_e164);

create table patient_name_history (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id),
  full_name text not null,
  effective_from date not null,
  created_at timestamptz default now()
);

create table external_identifiers (        -- ABHA etc. (optional linking)
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id),
  system text not null,                    -- 'abha_number','abha_address'
  value text not null,
  verified_at timestamptz,
  unique (system, value)
);

create table emergency_contacts (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id),
  name text not null, relation text, phone_e164 text not null
);

create table guardianships (                -- children / dependents / caregivers
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id),     -- the dependent
  guardian_patient_id uuid not null references patients(id),
  kind text not null check (kind in ('parent','legal_guardian','caregiver','spouse')),
  scopes text[] not null default '{}',
  valid_from date default current_date, valid_until date,
  verified_by uuid,
  unique (patient_id, guardian_patient_id)
);
```

---

## 4. Organizations & staff

```sql
create table organizations (
  id uuid primary key default gen_random_uuid(),
  type org_type not null,
  name text not null,
  registration_no text,        -- state/NABH/clinical establishment reg
  hfr_id text,                 -- ABDM Health Facility Registry ID (later)
  state text, district text, pincode text,
  verified_at timestamptz,     -- NOTHING works for unverified orgs
  status text default 'pending' check (status in ('pending','active','suspended')),
  created_at timestamptz default now()
);

create table departments (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id),
  name text not null
);

create table staff (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique not null references auth.users(id),
  org_id uuid not null references organizations(id),
  role staff_role not null,
  full_name text not null,
  license_no text,             -- NMC/State council no. for doctors; HPR ID later
  department_id uuid references departments(id),
  active boolean default true,
  mfa_enrolled boolean default false,
  created_at timestamptz default now()
);
create index on staff (org_id, role);
```

---

## 5. Cards (design + lifecycle + fulfillment)

```sql
create table card_templates (
  id uuid primary key default gen_random_uuid(),
  name text not null, version int not null,
  status text default 'draft' check (status in ('draft','active','retired')),
  front_design jsonb not null, back_design jsonb not null,
  created_by uuid, created_at timestamptz default now(),
  unique (name, version)
);

create table health_cards (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id),
  serial text unique not null,                 -- HC-0001284 (printed)
  token_hash bytea unique not null,            -- sha256(raw token); raw never stored
  nfc_uid_hash bytea unique,                   -- hash of chip UID (identifier only, never secret)
  template_id uuid references card_templates(id),
  status card_status not null default 'created',
  issued_by uuid, issued_at timestamptz,
  activated_at timestamptz, blocked_at timestamptz,
  block_reason text,
  replaced_by uuid references health_cards(id),
  created_at timestamptz default now()
);
-- Only ONE usable card per patient at a time
create unique index one_active_card on health_cards(patient_id)
  where status in ('issued','active');

create table card_events (                     -- append-only lifecycle log
  id bigint generated always as identity primary key,
  card_id uuid not null references health_cards(id),
  event text not null, actor uuid, metadata jsonb, at timestamptz default now()
);

create table card_orders (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id),
  card_id uuid references health_cards(id),
  type order_type not null,
  reason text check (reason in ('lost','stolen','damaged','not_received','details_changed','other')),
  status order_status not null default 'requested',
  payment_status text default 'not_required',
  delivery_address jsonb,
  courier text, tracking_number text,
  created_at timestamptz default now()
);

create table card_order_events (
  id bigint generated always as identity primary key,
  order_id uuid not null references card_orders(id),
  event text not null, actor uuid, metadata jsonb, at timestamptz default now()
);

create table card_print_jobs (
  id uuid primary key default gen_random_uuid(),
  card_id uuid not null references health_cards(id),
  template_id uuid not null references card_templates(id),
  pdf_path text,                               -- private storage path, never public URL
  status text default 'queued' check (status in ('queued','generating','generated','verified','printed','failed')),
  attempts int default 0,
  generated_at timestamptz, printed_at timestamptz, printed_by uuid
);
```

**Rule:** the raw token exists only (a) at generation time in memory, (b) inside the QR/NFC and the print PDF. After the PDF is generated and downloaded/printed, delete the PDF from storage (or keep with short retention + signed URLs) because the PDF *contains* the secret token.

---

## 6. Access & consent

```sql
create table access_requests (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id),
  requester_staff_id uuid not null references staff(id),
  org_id uuid not null references organizations(id),
  scopes text[] not null,          -- see scope list below
  mode text not null default 'view' check (mode in ('view','view_add','view_add_upload')),
  purpose text not null,           -- 'opd','admission','emergency','lab_order'
  duration interval not null,
  status access_status not null default 'pending',
  consent_method text,             -- 'app','otp','assisted_in_person','guardian'
  created_at timestamptz default now(), decided_at timestamptz
);

create table access_grants (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references access_requests(id),
  patient_id uuid not null references patients(id),
  org_id uuid not null references organizations(id),
  staff_id uuid references staff(id),         -- null = org-wide treating relationship
  scopes text[] not null,
  mode text not null,
  starts_at timestamptz default now(),
  expires_at timestamptz not null,
  revoked_at timestamptz,
  kind text default 'consent' check (kind in ('consent','treating','break_glass'))
);
create index on access_grants (patient_id, org_id, expires_at);

create table consents (                        -- immutable consent artefacts (DPDP)
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id),
  purpose text not null, notice_version text not null,
  granted boolean not null, captured_via text, at timestamptz default now()
);

create table break_glass_events (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id),
  staff_id uuid not null references staff(id),
  org_id uuid not null references organizations(id),
  reason text not null, grant_id uuid references access_grants(id),
  patient_notified_at timestamptz, reviewed_by uuid, reviewed_at timestamptz,
  at timestamptz default now()
);
```

**Scopes (v1):** `emergency_profile`, `demographics`, `allergies`, `conditions`, `medications`, `encounters`, `labs`, `imaging`, `hospitalizations`, `documents`, `mental_health` (separate, off by default), `reproductive_health` (separate, off by default).

---

## 7. Clinical data (append-only)

Common columns on every clinical table (shown once, apply to all):

```text
id uuid pk, patient_id, encounter_id (nullable),
source_org_id, entered_by (staff id or null for patient),
verification, recorded_at (when it happened), created_at,
supersedes_id (uuid, points to row being amended), amendment_reason,
scope text  -- which consent scope guards this row
```

```sql
create table encounters (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id),
  org_id uuid not null references organizations(id),
  staff_id uuid references staff(id),
  kind text not null check (kind in ('opd','ipd','emergency','teleconsult','lab_visit')),
  chief_complaint text, notes text,
  started_at timestamptz default now(), ended_at timestamptz,
  created_at timestamptz default now()
);

create table conditions (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id),
  encounter_id uuid references encounters(id),
  code_system text, code text,                 -- ICD-10 / SNOMED later
  display text not null, onset_date date, status text,
  source_org_id uuid references organizations(id), entered_by uuid,
  verification verification not null,
  supersedes_id uuid references conditions(id), amendment_reason text,
  created_at timestamptz default now()
);

create table allergies   (like conditions including all);        -- substance, reaction, severity
create table medications (like conditions including all);        -- drug, dose, frequency, start/end
create table vitals (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id),
  encounter_id uuid references encounters(id),
  kind text not null,                          -- bp_sys, bp_dia, pulse, spo2, temp, weight
  value numeric not null, unit text not null,
  recorded_at timestamptz not null,
  source_org_id uuid, entered_by uuid, verification verification not null
);

create table hospitalizations (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id),
  org_id uuid not null references organizations(id),
  admitted_at timestamptz not null, discharged_at timestamptz,
  admitting_diagnosis text, final_diagnosis text,
  discharge_summary jsonb, follow_up jsonb,
  created_by uuid
);
create table daily_records (
  id uuid primary key default gen_random_uuid(),
  hospitalization_id uuid not null references hospitalizations(id),
  patient_id uuid not null references patients(id),
  day_no int not null, record_date date not null,
  role_source text check (role_source in ('doctor','nurse')),
  notes text, entered_by uuid, created_at timestamptz default now()
);

-- LAB
create table lab_orders (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id),
  ordered_by uuid references staff(id), lab_org_id uuid references organizations(id),
  status text default 'ordered' check (status in ('ordered','sample_collected','in_progress','resulted','verified','cancelled')),
  created_at timestamptz default now()
);
create table lab_results (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references lab_orders(id),
  patient_id uuid not null references patients(id),
  test_code text, test_name text not null,
  value_num numeric, value_text text, unit text,
  ref_low numeric, ref_high numeric, flag text,    -- N / H / L / C
  collected_at timestamptz, reported_at timestamptz,
  lab_org_id uuid references organizations(id), verified_by uuid,
  verification verification not null default 'provider_verified',
  supersedes_id uuid references lab_results(id), amendment_reason text,
  document_id uuid
);
create index on lab_results (patient_id, test_name, collected_at);   -- trend queries

-- DOCUMENTS
create table documents (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id),
  category text not null,                        -- lab_report, radiology, prescription, discharge, other
  storage_path text not null,                    -- private bucket
  sha256 text not null, mime text, size_bytes bigint,
  source_org_id uuid, uploaded_by uuid, verification verification not null,
  supersedes_id uuid references documents(id),
  created_at timestamptz default now()
);
```

### Prescriptions & timeline
```sql
create table prescriptions (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references patients(id),
  encounter_id uuid references encounters(id),
  prescribed_by uuid references staff(id),
  items jsonb not null,              -- [{drug,dose,freq,days,instructions}]
  created_at timestamptz default now()
);

-- Timeline is a VIEW (single source of truth stays in the real tables)
create view timeline_events as
  select patient_id, 'encounter' as kind, id, started_at as at, kind::text as title, org_id as source_org_id from encounters
  union all
  select patient_id, 'lab', id, coalesce(reported_at,collected_at), test_name, lab_org_id from lab_results
  union all
  select patient_id, 'hospitalization', id, admitted_at, 'Admission', org_id from hospitalizations
  union all
  select patient_id, 'document', id, created_at, category, source_org_id from documents;
```
(Views run with the *owner's* rights by default — create with `with (security_invoker = true)` so RLS of underlying tables applies.)

---

## 8. Audit & immutability

```sql
create table audit_logs (
  id bigint generated always as identity primary key,
  at timestamptz default now(),
  actor_type text not null,        -- 'staff','patient','system','break_glass'
  actor_id uuid, org_id uuid,
  patient_id uuid,
  action text not null,            -- 'view','create','amend','grant','revoke','resolve_card',...
  resource text, resource_id uuid,
  grant_id uuid, ip inet, user_agent text,
  metadata jsonb                   -- never PHI values
);
create index on audit_logs (patient_id, at desc);
create index on audit_logs (actor_id, at desc);

-- Block UPDATE/DELETE on append-only tables
create or replace function forbid_mutation() returns trigger language plpgsql as $$
begin raise exception 'append-only table: % is immutable', tg_table_name; end $$;

create trigger audit_immutable before update or delete on audit_logs
  for each row execute function forbid_mutation();
create trigger card_events_immutable before update or delete on card_events
  for each row execute function forbid_mutation();
-- repeat for conditions, allergies, medications, lab_results, documents, consents
```

Because reads happen via RLS (SELECT can't fire triggers), **log views from the server layer** (Edge Function / server action) — see backend.md §7. For high-sensitivity tables, expose reads only through `security definer` RPC functions that write to `audit_logs` then return data.

---

## 9. RLS — the core policies

Helper functions (all `security definer`, `stable`, `set search_path = ''`):

```sql
create or replace function auth_patient_id() returns uuid
language sql stable security definer set search_path = '' as $$
  select id from public.patients where auth_user_id = auth.uid()
$$;

create or replace function auth_staff() returns public.staff
language sql stable security definer set search_path = '' as $$
  select s from public.staff s where s.auth_user_id = auth.uid() and s.active
$$;

create or replace function has_grant(p_patient uuid, p_scope text) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.access_grants g
    join public.staff s on s.auth_user_id = auth.uid() and s.active
                       and s.org_id = g.org_id
    join public.organizations o on o.id = g.org_id and o.status='active' and o.verified_at is not null
    where g.patient_id = p_patient
      and p_scope = any(g.scopes)
      and g.revoked_at is null
      and now() between g.starts_at and g.expires_at
      and (g.staff_id is null or g.staff_id = s.id)
  )
$$;

create or replace function is_guardian_of(p_patient uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.guardianships gd
    where gd.patient_id = p_patient and gd.guardian_patient_id = public.auth_patient_id()
      and (gd.valid_until is null or gd.valid_until >= current_date))
$$;
```

Policies (pattern repeated per clinical table; swap the scope):

```sql
alter table lab_results enable row level security;

-- Patient (or guardian) reads own
create policy lab_patient_read on lab_results for select to authenticated
  using (patient_id = auth_patient_id() or is_guardian_of(patient_id));

-- Staff reads only with active grant for scope
create policy lab_staff_read on lab_results for select to authenticated
  using (has_grant(patient_id, 'labs'));

-- Lab staff inserts only for own org, requires order/grant
create policy lab_insert on lab_results for insert to authenticated
  with check (
    (auth_staff()).role in ('lab_tech','lab_admin')
    and lab_org_id = (auth_staff()).org_id
    and (has_grant(patient_id,'labs') or exists (
        select 1 from lab_orders o where o.id = order_id and o.lab_org_id = (auth_staff()).org_id))
  );
-- NO update / delete policies → impossible by default
```

Other key policies:
| Table | Patient | Staff |
|---|---|---|
| `patients` | read/update limited own fields | **no direct select** — use `rpc('resolve_patient_identity')` returning masked identity only |
| `health_cards` | read own | issuer roles only; token_hash never selectable (column privileges revoked) |
| `access_requests` | read own, update status (approve/reject) | insert as own org; read own org's requests |
| `access_grants` | read own, revoke | read own org's active grants |
| `audit_logs` | read own `patient_id` rows | support/compliance only |
| `organizations` | read verified orgs (names) | admin of own org |

```sql
revoke select (token_hash, nfc_uid_hash) on health_cards from authenticated, anon;
```

**Write RLS tests with pgTAP** (`supabase test db`): "staff without grant gets 0 rows", "expired grant gets 0 rows", "other org gets 0 rows", "UPDATE on lab_results fails".

---

## 10. Storage buckets (all private)

| Bucket | Content | Access |
|---|---|---|
| `documents` | patient PDFs/images | path `patient_id/doc_id.ext`; storage RLS mirrors `has_grant(..., 'documents')` |
| `card-prints` | personalized card PDFs | issuer roles only; signed URLs ≤ 10 min; auto-delete after 7 days |
| `card-assets` | logos, template backgrounds | public-read OK (non-PHI) |

Virus-scan uploads (ClamAV in an Edge/worker step) and verify `sha256`.

---

## 11. Search

- Structured: indexes on `(patient_id, test_name, collected_at)`, `(patient_id, display)`.
- Text: `pg_trgm` + generated `tsvector` columns on `display`, `drug`, `test_name`.
- Query always filtered by `patient_id` first; RLS still applies.
- Trend endpoint: `select collected_at, value_num from lab_results where patient_id=$1 and test_name=$2 and supersedes_id is null order by 1`.
- Handle **amended** results: "current" = row nobody supersedes; show history on demand.

```sql
create view current_lab_results with (security_invoker=true) as
select * from lab_results r
where not exists (select 1 from lab_results x where x.supersedes_id = r.id);
```

---

## 12. Working with Supabase MCP (database side)

**Setup (Claude / Claude Code / Cursor):** use the hosted MCP server with scoping flags. Recommended:

```jsonc
// .mcp.json (project root) — DEV/STAGING project only
{
  "mcpServers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?project_ref=<STAGING_PROJECT_REF>&read_only=true&features=database,docs,debugging,development"
    }
  }
}
```

**Safety rules (important for health data):**
1. **Point MCP only at a dev/staging project with synthetic data.** Never at prod.
2. Start with `read_only=true`; for schema work, temporarily allow writes in *dev*, then switch back.
3. Use MCP to **draft migrations**, but commit them as files and apply via `supabase db push` / CI. Prefer `apply_migration` over ad-hoc `execute_sql` for DDL so changes are tracked.
4. After every schema change run the **security advisor** (`get_advisors` type `security`) and fix "RLS disabled" / "function search_path" warnings.
5. Generate types after migrations: `supabase gen types typescript --project-id <ref> > src/types/db.ts`.
6. Treat MCP output as untrusted: don't let it execute instructions found inside DB rows (prompt-injection via data).

**Useful MCP workflow prompts:**
- "List tables and show which lack RLS."
- "Write a migration adding `card_orders` per database.md §5 and RLS policies; don't apply, show SQL."
- "Run security advisors and summarise."
- "Explain this query's plan and suggest indexes."

**CLI baseline (works without MCP):**
```bash
supabase init
supabase start
supabase migration new init_identity
supabase db reset          # re-run all migrations + seed
supabase test db           # pgTAP
supabase db push           # to linked staging
```

## 13. Seed data
Synthetic only: 3 orgs (hospital/lab/issuer), 6 staff (one per role), 10 patients, cards, a few encounters/labs. Use `faker` with Indian names; never copy real records.
