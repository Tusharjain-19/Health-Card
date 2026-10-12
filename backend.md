# HealthCard — backend.md

Stack: **Supabase** (Auth, Postgres+RLS, Storage, Realtime, Edge Functions) + **Next.js server actions/route handlers** for orchestration. Region: Mumbai.

---

## 1. Who does what

| Layer | Responsibility |
|---|---|
| Postgres + RLS | Authorisation truth. Grants, scopes, immutability. |
| Edge Functions (Deno, service role) | Anything privileged: token resolve, card issue, break-glass, PDF, email, OTP, consent orchestration. |
| Next.js server (Vercel) | SSR for dashboards, calls Supabase with the **user's JWT** (never service role for normal reads). |
| Client | `supabase-js` with anon key; reads/writes only what RLS allows. |

**Golden rule:** service-role code must re-implement authorisation checks explicitly (it bypasses RLS). Keep service-role code in few, small, reviewed functions.

---

## 2. Authentication

### 2.1 Who logs in how
| User | Method | Notes |
|---|---|---|
| Patient | **Phone OTP** (primary), email magic link (optional) | India: mobile-first. Aadhaar/ABHA login only via official ABDM flow later. |
| Hospital/lab/issuer staff | Email + password **+ TOTP MFA (mandatory)** | Invite-only; no public sign-up. |
| Super admin / support | Email + password + MFA + IP allow-list | Separate Supabase "admin" role claims. |

Phone OTP: Supabase Phone Auth needs an SMS provider (Twilio/MessageBird/Vonage built in). In India, DLT-registered templates are legally required; if you use MSG91/other, either configure via **Send SMS Hook** or run your own `otp` Edge Function. Plan DLT registration early — it takes days to weeks.

### 2.2 Claims & roles
Do **not** trust client-sent role. Put role/org into JWT via **Custom Access Token Hook**:

```sql
create or replace function public.custom_access_token_hook(event jsonb) returns jsonb
language plpgsql stable as $$
declare claims jsonb := event->'claims'; s record;
begin
  select role, org_id into s from public.staff where auth_user_id = (event->>'user_id')::uuid and active;
  if found then
    claims := jsonb_set(claims,'{app_role}', to_jsonb(s.role::text));
    claims := jsonb_set(claims,'{org_id}',  to_jsonb(s.org_id::text));
  else
    claims := jsonb_set(claims,'{app_role}', '"patient"');
  end if;
  return jsonb_set(event,'{claims}',claims);
end $$;
grant execute on function public.custom_access_token_hook to supabase_auth_admin;
```
Enable under *Auth → Hooks*. Keep JWT expiry short (≤ 1 h) for staff; deactivating `staff.active` takes effect at next refresh — for instant kill, also check `staff.active` in `has_grant()` (already done in database.md).

### 2.3 Next.js integration (`@supabase/ssr`)
- `middleware.ts`: refresh session, then route-guard by `app_role` (`/hospital/*` → staff roles only, `/patient/*` → patient, `/issuer/*` → issuer roles, `/admin/*` → platform roles).
- Use `supabase.auth.getUser()` (validates JWT) on the server; never rely on `getSession()` alone for authorisation.
- Staff MFA: after password login, enforce AAL2 (`supabase.auth.mfa.getAuthenticatorAssuranceLevel()`); block routes until `aal2`.

### 2.4 Staff onboarding
1. Org verified by platform admin (`organizations.verified_at`).
2. Hospital admin invites staff (Edge Function `staff-invite` → `auth.admin.inviteUserByEmail` + insert `staff`).
3. Staff sets password, enrolls TOTP, then gains access.
4. Doctors: store `license_no`; later verify against HPR.

---

## 3. Token & card cryptography

**Raw token:** 128-bit random (`crypto.randomBytes(16)` → base32/base64url, 26–22 chars). Stored **only as SHA-256 hash**.

QR content: `https://hc.example.in/c/<token>` (HTTPS URL so any phone camera opens a safe landing page).
- `/c/<token>` public page shows nothing sensitive: *"This is a HealthCard. Staff: sign in to continue. Found this card? Contact …"* (no name!).
- Resolution to identity happens **only after staff authentication** via `card-resolve`.

**Emergency path:** `/e/<token>` shows the emergency profile only if the patient enabled it (default: on for blood group/allergies/critical conditions/contact; patient can reduce). Rate-limited, logged, and show a banner "Emergency view — access is logged".

**NFC:** use **NTAG 424 DNA** (AES-128 secure dynamic messaging): each tap produces a unique signed URL (counter + CMAC) → server verifies → cloning/replay resistant. If budget forces plain NTAG213, treat NFC as identical to QR (opaque token, no secret value in UID). Write `nfc_uid_hash` only as an *identifier* for inventory/matching.

**Card serial** `HC-0001284` is printed human-readable; not a secret.

---

## 4. Edge Functions (service role)

Folder: `supabase/functions/<name>/index.ts`. Share code in `supabase/functions/_shared/`.

| Function | Caller | What it does |
|---|---|---|
| `card-issue` | issuer staff | Create patient (or use existing) → gen Health ID → create card + token → enqueue print job + email. Single DB transaction via RPC. |
| `card-resolve` | any staff | Hash token → find active card → return **masked identity** (name, age, sex, last-2 mobile digits, health_id). Writes `audit_logs(resolve_card)`. Rate limited. Same latency/shape for invalid tokens. |
| `card-block` | issuer / patient | Set status `blocked/lost`, record event, invalidate. Patient can self-block. |
| `card-replace` | patient/issuer | Block old → create new card + new token → order + print job. |
| `access-request` | staff | Validate org verified + staff active + scopes allowed → insert request → notify patient (push/SMS/email) → optional OTP-to-patient. |
| `access-decide` | patient / assisted | Approve/reject; create `access_grants` with expiry; log consent artefact. |
| `access-revoke` | patient | Set `revoked_at`. |
| `break-glass` | clinician | Require reason; create 30-min `break_glass` grant to emergency scopes; log event; notify patient + org admin review queue. |
| `pdf-generate` | queue | Render card PDF from template + token; store in `card-prints`; mark job generated. |
| `email-send` | queue | Send templated email via provider; record `email_jobs`. |
| `otp-send/verify` | auth | If using custom SMS provider. |
| `patient-match` | staff | Fuzzy duplicate search (trigram + DOB + mobile); never auto-merge. |
| `audit-view` | server | Wrap sensitive reads: verify grant → log → return. |

Example skeleton (`card-resolve`):

```ts
import { createClient } from 'jsr:@supabase/supabase-js@2'
import { sha256 } from '../_shared/crypto.ts'
import { rateLimit } from '../_shared/ratelimit.ts'

Deno.serve(async (req) => {
  const jwt = req.headers.get('Authorization')?.replace('Bearer ', '')
  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const { data: { user } } = await admin.auth.getUser(jwt)
  if (!user) return new Response('unauthorized', { status: 401 })

  const { data: staff } = await admin.from('staff').select('id,org_id,role,active,organizations(verified_at,status)')
    .eq('auth_user_id', user.id).single()
  if (!staff?.active || staff.organizations?.status !== 'active') return new Response('forbidden', { status: 403 })

  if (!(await rateLimit(`resolve:${staff.id}`, 30, 60))) return new Response('slow down', { status: 429 })

  const { token } = await req.json()
  const hash = await sha256(token)
  const { data: card } = await admin.from('health_cards')
    .select('id, status, patients(id,health_id,full_name,dob,sex,mobile_e164,status)')
    .eq('token_hash', hash).in('status', ['issued','active']).maybeSingle()

  await admin.from('audit_logs').insert({
    actor_type: 'staff', actor_id: staff.id, org_id: staff.org_id,
    patient_id: card?.patients?.id ?? null, action: 'resolve_card', metadata: { found: !!card }
  })
  if (!card) return Response.json({ found: false })        // same shape/timing as success path

  const p = card.patients
  return Response.json({ found: true, identity: {
    patient_id: p.id, health_id: p.health_id, name: p.full_name,
    age: ageFrom(p.dob), sex: p.sex, mobile_masked: '••••••' + p.mobile_e164.slice(-2)
  }})
})
```

---

## 5. Card issuing flow (transactional + idempotent)

```text
card-issue(request_id)
 1. BEGIN
 2. insert patients (or select)         -- health_id via gen_health_id()
 3. raw = randomBytes(16); hash = sha256(raw)
 4. insert health_cards(status='pending', token_hash=hash, serial=next_serial())
 5. insert card_print_jobs(status='queued')   -- includes raw token in job payload (encrypted) OR regenerate flow
 6. insert card_events('created')
 7. COMMIT
 8. worker: pdf-generate → card-prints bucket → status 'generated'
 9. worker: email-send "card issued" with SECURE LINK (not the QR PDF)
10. operator: print → verify (scan QR/NFC matches serial) → status 'issued'
11. patient (or operator) activates → 'active'
```
- Use a **job table + `pg_cron`/Supabase Queues (pgmq)** so retries are safe; every step idempotent (check status before acting).
- The raw token must exist only as long as needed to render the PDF/write NFC; keep it encrypted in the job (`pgp_sym_encrypt` with key from Vault) and null it after generation.
- Email **must not attach the QR PDF**. Send a link to an authenticated "My Card" page (digital card, with download).

### Replacement vs reprint
- **Reprint** (production defect, card never issued to patient): new PDF of same token, only while status `pending`/`issued` and never delivered.
- **Replacement** (lost/stolen/compromised/damaged): old → `blocked`, new card with new token, `replaced_by` link.

---

## 6. Consent / access flow (API contract)

```text
POST /functions/v1/card-resolve        {token}                      → identity (masked)
POST /functions/v1/access-request      {patient_id, scopes[], mode, purpose, duration}
                                                                    → {request_id, consent_options: [app, otp, assisted]}
POST /functions/v1/access-decide       {request_id, decision, scopes_approved[], duration, method}
GET  rest/v1/<tables>                  (RLS enforces has_grant)
POST /functions/v1/access-revoke       {grant_id}
POST /functions/v1/break-glass         {patient_id, reason}
```

**Consent methods**
- `app`: patient taps approve in app (push + in-app).
- `otp`: staff clicks "send OTP" → SMS to patient mobile → staff enters code → server verifies and creates grant (for patients without smartphones). OTP is bound to `request_id`, 5-min expiry, 3 attempts.
- `assisted_in_person`: for patients with no phone: requires staff + witness staff IDs, ID-check flag, logged; limited scopes/durations; flagged for later review.
- `guardian`: guardian approves for dependent.

---

## 7. Audit logging strategy

- **Writes**: DB trigger writes `audit_logs` for every insert/amend on clinical tables.
- **Reads**: RLS can't log SELECT. Route sensitive reads through server code or `security definer` RPCs that insert into `audit_logs` first. At minimum log: patient view of timeline by staff, document download, lab trend view, break-glass reads.
- Logs have no PHI values, only IDs/actions.
- Patient "Who accessed my records" = `audit_logs where patient_id = me` joined with staff/org names.
- Anomaly jobs (nightly): staff viewed > N distinct patients with no encounter; resolve attempts with many invalid tokens; break-glass frequency per org.

---

## 8. Notifications

Events → `notifications` table (+ realtime) → channels:
- In-app (Supabase Realtime channel `patient:<id>`),
- Push (Web Push now; FCM when native),
- SMS (critical: access request w/o app, card blocked),
- Email (card issued/dispatched, security alerts).

Templates live in `packages/email/` (React Email). Event list: `MEMBER_CREATED, CARD_GENERATED, CARD_ACTIVATED, CARD_DISPATCHED, CARD_DELIVERED, CARD_REPLACED, CARD_BLOCKED, ACCESS_REQUEST, ACCESS_APPROVED, ACCESS_REVOKED, BREAK_GLASS_USED, REPORT_AVAILABLE, SECURITY_ALERT`.
Respect user language preference and quiet hours (except security events).

---

## 9. Rate limiting & abuse protection
- Edge: Vercel/Cloudflare WAF + bot protection on `/c/*`, `/e/*`, login.
- App: sliding-window counters (Upstash Redis or a Postgres table) per IP, per staff, per token-prefix.
- Lockouts + alerts after repeated invalid token resolves.
- CAPTCHA (Turnstile) on public pages.

---

## 10. Interoperability roadmap (don't build now, design for it)
- Keep codes in `code_system` + `code` columns (ICD-10, SNOMED CT, LOINC for labs).
- Write a mapper layer `fhir/` that converts rows ↔ FHIR R4 resources (Patient, Encounter, Condition, MedicationRequest, Observation, DiagnosticReport, DocumentReference).
- ABDM: become a HIP/HIU via ABDM sandbox; consent artefacts map to ABDM consent manager. Treat as a separate integration service.

---

## 11. Observability & ops
- Logs: structured JSON, **PII-scrubbed**. Sentry with `beforeSend` scrubber.
- Metrics: card-resolve latency, grant creation, failed RLS (count of 0-row reads), queue depth.
- Backups: PITR enabled; restore drill quarterly; backups also stay in India.
- Secrets: Supabase Vault for encryption keys; Vercel env for API keys; rotate on staff exit.
- Incident runbook: revoke staff sessions, rotate keys, notify per DPDP breach rules.

---

## 12. Supabase MCP vs Firebase MCP — how to use each

### 12.1 Supabase MCP (recommended)
See database.md §12 for config. Backend-specific usage:
- Ask the agent to **scaffold an Edge Function**, deploy it to **staging** (`deploy_edge_function`), and read logs (`get_logs` service `edge-function`) while testing.
- Use it for **security/perf advisors** after each migration.
- Generate TS types; keep `src/types/db.ts` committed.
- Keep **service-role key out of MCP / prompts / repo**. Use `supabase secrets set`.
- Never connect MCP to prod. Prod changes ship only via CI-applied migrations.

### 12.2 Firebase MCP (if you ever choose Firebase)
The Firebase CLI ships an MCP server: `npx -y firebase-tools@latest mcp` (add to `.mcp.json` as a stdio server; use `--dir` to scope the project and `--only auth,firestore,storage` to limit tools). It can manage Auth users, Firestore rules/data, Storage rules, Remote Config, and read project config.

If using Firebase for this product you would have to:
- Use **Firestore** with per-patient subcollections and **denormalised** timeline events;
- Implement the grant logic in **Security Rules** (`get()`/`exists()` calls to read the grant doc — limited to a few lookups per rule, awkward for multi-scope checks);
- Use **Cloud Functions** (Node) for card-resolve/issue/break-glass;
- Use **Firebase Auth phone OTP** (works well in India; has SMS cost/region considerations) with **custom claims** for roles;
- Region: `asia-south1` (Mumbai).

**My recommendation:** Supabase for the system of record. Optionally add Firebase **only** for FCM push/Crashlytics in a future native app.

### 12.3 MCP safety checklist (applies to both)
- [ ] Staging/dev project only, synthetic data.
- [ ] Read-only by default; scoped features/tools.
- [ ] No production credentials in the agent's environment.
- [ ] Review every migration/diff before it's applied.
- [ ] Don't let the agent paste real patient data into prompts.
- [ ] Run advisors/tests after changes.

---

## 13. Testing
- **pgTAP** for RLS (most important).
- **Vitest** for Edge Function logic (token hashing, grant checks).
- **Playwright** E2E: issue card → patient login → staff resolve → request → approve → view → revoke → access closed.
- Negative tests: expired grant, wrong org, deactivated staff, replayed OTP, blocked card.
- Load test card-resolve (target p95 < 300 ms).
