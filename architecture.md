# HealthCard — architecture.md

> One person → one lifelong health record → a revocable physical card as the key.
> Read order: **architecture.md → database.md → backend.md → frontend.md**

---

## 1. Honest analysis of the blueprint (what I kept, cut, added)

### Kept (these are the core)
- Person ≠ Card separation (replace card, never the person).
- Card carries **only an opaque token**, never medical data.
- Consent-first access, granular scopes, expiry, full audit log.
- Provenance on every record (who/where/verified or patient-reported).
- Append-only records with amendments (never overwrite).
- Structured data + original document together.
- Emergency profile + break-glass with logging.

### Cut / deferred (to keep it shippable and safe)
| Item | Decision | Why |
|---|---|---|
| Pharmacy, billing/subscriptions, insurance, wearables | **Defer to V3** | Each is its own product. |
| Offline-tolerant hospital workflows | **Defer to V2** | Offline PHI sync is a security project by itself. |
| Replacing hospital HMIS | **Never** | Be the continuity layer; integrate via API/FHIR. |
| Autonomous AI diagnosis | **Never** | AI only summarises/searches records, later. |
| Courier integration, payments for replacement | **V1.5** | Use manual status updates first. |
| Separate "Doctor portal" app | **Merge into Hospital app (role-based)** | One codebase, fewer deployments. |
| Monorepo with 5 separate apps | **One Next.js app, route groups per role** | Same backend/identity; split later if needed. |

### Added (missing from the blueprint, needed for all-India scale)
1. **ABDM/ABHA linking layer** — optional `external_identifiers` table (ABHA number/address). Your 12-digit ID is a *platform* ID; never market it as Aadhaar/ABHA.
2. **Multilingual UI from day 1** — Hindi + English at launch, i18n framework ready for 10+ Indian languages.
3. **Low-literacy / low-bandwidth mode** — large type, icon-first, PWA, works on 3G and cheap Android.
4. **Phone-OTP login (India reality)** — not email-first. Many patients have a mobile number but no email.
5. **Assisted-consent for people without smartphones** — hospital-side OTP to the patient's mobile, or in-person consent captured with staff identity + witness, all logged.
6. **Facility verification** — hospitals/labs must be verified (registration number, KYC) before getting any access. Link toward ABDM HFR/HPR IDs later.
7. **Data residency** — host DB in India (Mumbai region). Keep PHI inside India.
8. **Rate limiting + abuse detection** on card resolve (prevents enumeration of Health IDs/tokens).
9. **Data-retention & erasure policy** designed in (DPDP Act 2023 + 2025 Rules). Get legal review before production.
10. **Idempotent jobs + outbox** for PDF/email so card issuing never half-completes.

---

## 2. System overview

```text
                     ┌─────────────────────────────────────────┐
                     │            Next.js (Vercel)             │
                     │  /patient /hospital /lab /issuer /admin │
                     │  /e/[token] (emergency)  /c/[token]     │
                     └──────────────┬──────────────────────────┘
                                    │  supabase-js (user JWT)
        ┌───────────────────────────┼──────────────────────────────┐
        │                  SUPABASE (Mumbai)                       │
        │  Auth ─ Postgres + RLS ─ Storage ─ Realtime ─ Edge Fns   │
        │                                                          │
        │  Edge Functions (service role, server-only):             │
        │   card-resolve · card-issue · access-grant ·             │
        │   break-glass · pdf-generate · email-send · otp          │
        └───────┬──────────────────────┬───────────────────┬───────┘
                │                      │                   │
          Email provider          SMS/OTP provider     (Later) ABDM,
          (Resend/SES)            (MSG91 / Twilio)     FHIR gateway
```

**Principle:** the browser may only read/write what **RLS** allows. Anything sensitive (token resolution, break-glass, issuing cards, generating PDFs) goes through **Edge Functions / server routes** using the service role. Never expose the service-role key to the client.

---

## 3. Trust boundaries & threat model (short)

| Threat | Mitigation |
|---|---|
| Photo of QR taken | QR = opaque, revocable token. Resolve returns **identity confirmation only**, never records. Records need consent. |
| NFC cloning | NFC stores the same opaque token (or a rotating signed one on NTAG 424 DNA). UID is never a secret. |
| Token/Health-ID enumeration | 128-bit random tokens, constant-time responses, rate limit per IP/staff, alert on scans of invalid tokens. |
| Staff snooping | Every read logged; patient sees "who viewed". Anomaly alerts (staff viewing many patients w/o encounter). |
| Wrong-patient writes | Mandatory identity-confirm step before any write. |
| Insider/DB admin | Column encryption for most sensitive fields, least-privilege roles, no PHI in logs. |
| Stolen staff session | Short JWT life, MFA for staff, device/session list, instant revoke. |
| Lost card | Block → token revoked instantly; replacement gets new token. |

---

## 4. Access model (the heart)

```text
Scan/enter → resolve token → "Is this Tushar Jain, 29, M, mobile ••••12?"  (identity only)
         → staff confirms patient identity
         → create access_request (scopes + duration + purpose)
         → patient approves (app / OTP / assisted consent)
         → access_grant (scoped, expiring)
         → every read checks grant in RLS
         → expiry or revoke → data closed
```

Alternate paths:
- **Emergency view**: public-to-authenticated-responder, shows only the emergency profile.
- **Break-glass**: verified clinician + reason → 30-min grant to emergency scopes, loudly logged, patient notified after.
- **Treating-relationship grant**: patient pre-authorises a hospital for an admission period (e.g., 30 days) so daily care isn't blocked by repeated OTPs.

---

## 5. Environments & delivery

| Env | Supabase project | Purpose |
|---|---|---|
| local | `supabase start` (Docker) | Dev, migrations, seed data |
| staging | `healthcard-staging` | Test with **synthetic data only** |
| prod | `healthcard-prod` (Mumbai) | Real data; no MCP write access |

- All schema changes = **migration files in git**. No dashboard edits in prod.
- CI: lint → typecheck → unit tests → pgTAP/RLS tests → deploy preview → migrate staging.
- **Never use real patient data in dev/staging.**

---

## 6. Supabase vs Firebase — decision

**Use Supabase (Postgres).** Reasons specific to this product:
- Health data is highly **relational** (patient → encounters → diagnoses → labs → documents). SQL joins, constraints, and views fit; Firestore forces denormalisation.
- **Row Level Security** expresses "only with an active, unexpired, scoped grant" directly in the DB. Firestore rules can't join across collections easily.
- Append-only/versioned tables, triggers, and audit logging are natural in Postgres.
- Postgres is portable (no vendor lock-in) — important for hospital/government deals and FHIR exports.
- India region available.

**Where Firebase would still help:** push notifications (FCM) and Crashlytics in a future native app — use *alongside* Supabase, not instead of it.

Firebase MCP is covered in backend.md §12 as an alternative path, but I recommend against it for the core record store.

---

## 7. Phased roadmap

**V1 (MVP, 8–10 weeks solo)**
Issuer panel (create member, Health ID, card token, QR, PDF, email) · Patient app (OTP login, card view, timeline, access requests/approve/revoke, access log) · Hospital portal (staff login, resolve card, request access, view, add consultation) · RLS + audit from day one.

**V1.5**
NFC (NTAG 424 DNA) · Hospitalization + daily records · Lab portal + structured results + trends · Emergency profile + break-glass · Card replacement flow + fulfillment tracking · Hindi + 2 more languages.

**V2**
FHIR export/import · ABDM/ABHA linking · Guardian/family accounts · Offline-tolerant intake · AI summaries (read-only).

**V3**
Enterprise API · Insurance/pharmacy · Wearables · Multi-state provider network.

---

## 8. Compliance checklist (not legal advice — get counsel)
- DPDP Act 2023 / Rules 2025: notice, purpose-limited consent, withdrawal, grievance officer, breach reporting, children's data (verifiable guardian consent).
- Consent artefacts stored immutably (what, who, when, purpose, expiry).
- Encryption in transit (TLS) and at rest; field-level encryption for most sensitive notes.
- Retention policy: distinguish *account deletion* from *clinical record retention*.
- ABDM alignment: privacy-by-design, need-to-know access, interoperability.
- Security: MFA for staff, audit log immutability, pen-test before first real hospital, incident-response plan.
