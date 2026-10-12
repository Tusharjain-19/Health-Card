# HealthCard — Product Requirements Document (PRD)

| | |
|---|---|
| **Product** | HealthCard — portable, patient-controlled lifelong health record with a physical QR + NFC card |
| **Version** | 1.0 (draft for build) |
| **Date** | 1 Oct 2026 |
| **Owner** | Tushar |
| **Status** | Draft — pending legal/compliance review before any production use with real patient data |
| **Companion docs** | `architecture.md`, `database.md`, `backend.md`, `frontend.md` |

---

## 0. Change log

| Version | Change |
|---|---|
| 1.0 | Initial PRD. **Health ID changed from 12-digit (4-4-4) to 10-digit (5-5).** Card management & fulfillment added. Edge-case catalogue added. |

---

## 1. Executive summary

India's patients carry their medical history in fragments: paper files, WhatsApp images, email PDFs, and separate hospital systems. HealthCard gives every person **one lifelong health record**, reachable through a **physical card (QR + NFC)** that carries only a revocable token — never medical data. Hospitals, clinics and labs contribute structured, source-verified records; the **patient controls who sees what, for how long**, and can see every access.

**Positioning (important):** HealthCard is *not* a replacement for ABHA/ABDM or for hospital HMIS. It is a **continuity layer**: physical card + simple identity + provider workflow + structured longitudinal timeline, interoperable with ABDM over time. Our 10-digit number is a **platform Health ID**, never marketed as Aadhaar/ABHA.

---

## 2. Problem statement

1. A patient's history lives in many systems with no single, simple identity connecting it.
2. Patients change hospitals; context is lost, tests are repeated, allergies are missed.
3. Records are PDFs/photos: not searchable, not trendable, not verifiable.
4. Patients without smartphones/email are excluded from app-first systems.
5. Emergency responders have no fast, safe way to see critical info (blood group, allergies).
6. Existing ID cards leak risk: anyone with a photo of a QR/ID could try to access data.

---

## 3. Goals, non-goals, success metrics

### 3.1 Goals
- G1. One person → one record, regardless of provider.
- G2. Card-based entry that is fast for staff and safe for patients.
- G3. Consent-first, auditable access (granular scope + expiry).
- G4. Structured, provenance-labelled records with trends.
- G5. Work for all of India: multilingual, low-bandwidth, phone-OTP, assisted flows.
- G6. Be ready for interoperability (FHIR/ABDM) without depending on it for V1.

### 3.2 Non-goals (V1–V2)
- Not an HMIS/EMR replacement (billing, pharmacy, bed management).
- No autonomous diagnosis or treatment suggestions.
- No insurance claims, e-pharmacy, teleconsultation video, wearables (V3 at earliest).
- No offline PHI sync in V1.
- Not a government identity document.

### 3.3 Success metrics

| Area | Metric | V1 target (pilot) |
|---|---|---|
| Adoption | Cards issued | 1,000 in first pilot cluster |
| Activation | % issued cards activated within 14 days | ≥ 70% |
| Provider | Verified orgs actively adding records weekly | ≥ 10 |
| Speed | Card scan → identity confirm (p95) | < 5 s |
| Speed | Request → patient approve → data visible (median) | < 90 s |
| Trust | Access requests approved by patients | ≥ 80% |
| Safety | Wrong-patient write incidents | 0 |
| Security | Unauthorised access incidents | 0 |
| Fulfillment | Card issued → delivered | ≤ 7 days (pilot) |
| Reliability | Uptime (core APIs) | ≥ 99.5% |

---

## 4. Users & personas

| Persona | Description | Key needs |
|---|---|---|
| **Patient (smartphone)** | Urban/semi-urban adult | See timeline, approve access, track card |
| **Patient (no smartphone)** | Elderly / rural | Card works; consent via OTP/assisted flow; no app dependence |
| **Guardian / caregiver** | Parent of child, adult child of elderly parent | Manage dependent's access; limited scopes |
| **Receptionist** | Hospital front desk | Fast find/scan, avoid duplicates, confirm identity |
| **Doctor** | Treating clinician | Relevant history in seconds; add consultation |
| **Nurse** | Ward staff | Vitals, med administration, nursing notes only |
| **Lab technician/admin** | Diagnostic lab | Enter structured results, verify, amend with reason |
| **Hospital/Org admin** | Manages org staff & policies | Staff onboarding, role control, audit view |
| **Card issuer operator/admin** | Issues & fulfils cards | Create members, print, verify, dispatch |
| **Platform admin / support / compliance** | Our team | Verify orgs, audit, disputes, security |
| **Emergency responder** | Paramedic/ER staff | Critical info fast; break-glass if needed |

---

## 5. Scope by release

| Release | Contents |
|---|---|
| **V1 (MVP)** | Issuer panel (member, Health ID, card, QR, print PDF, email) · Patient OTP login · Patient home/timeline/access centre/My Card · Hospital portal (staff MFA, scan/search, identity confirm, access request, summary, consultation) · RLS + audit from day 1 · English + Hindi |
| **V1.5** | NFC (NTAG 424 DNA) · Hospitalization + daily records · Lab portal & structured results & trends · Emergency profile + break-glass · Replacement flow + fulfillment board + tracking · Card designer/templates · 2+ more languages |
| **V2** | FHIR export/import · ABHA/ABDM linking · Guardian/family accounts · Offline-tolerant intake · AI summaries (read-only) · Patient-reported record verification workflow |
| **V3** | Enterprise API · Insurance/pharmacy · Wearables · Multi-state provider network |

---

## 6. Health ID & card specification (updated)

### 6.1 Health ID
| Property | Specification |
|---|---|
| Format | **10 digits**, displayed **5-5** — e.g. `74839 16251` |
| Storage | `char(10)`, regex `^[1-9][0-9]{9}$`, **unique** |
| Generation | Cryptographically random; non-sequential; first digit 1–9 |
| Capacity | 9 × 10⁹ possible IDs (population of India ≈ 1.4 × 10⁹) |
| Check digit | **None.** A check digit would cut capacity to ~9 × 10⁸ — less than India's population. Typos are caught by mandatory identity confirmation (name, age, masked mobile), not by arithmetic. |
| Derived from | Nothing (not DOB, mobile, name, location) |
| Authentication value | **None.** Health ID is a lookup key, not a secret. |
| Branding | "HealthCard ID". Never "Aadhaar", never "ABHA". |
| Future-proofing | Column and API types allow a later move to 12 digits without schema redesign (treat as opaque string; width centralised in one constant). |

**Consequences of a 10-digit space (design must handle):**
- At national scale the ID space is ~15% occupied, so a random guess hits a real person fairly often. Therefore: **Health ID alone never reveals anything**; lookup requires authenticated staff, rate limiting, and a second factor (DOB or mobile match or OTP).
- A 10-digit number looks like an Indian mobile number → UI must label fields clearly, group 5-5, and detect/redirect when a user pastes a mobile number into the Health ID field (see EC-ID-04).

### 6.2 Card
| Property | Specification |
|---|---|
| Physical | PVC/PET card, CR80 (85.6 × 54 mm), QR on front or back, NFC chip (NTAG 424 DNA preferred) |
| Printed | HealthCard logo, patient name, Health ID `74839 16251`, card serial (e.g. `HC-0001284`), QR, NFC symbol, support URL/number, template version code |
| **Never printed** | Diagnoses, medicines, reports, blood group (unless patient opts into emergency print in V2), DOB, mobile |
| QR content | `https://hc.<domain>/c/<token>` — opaque 128-bit token, **not** the Health ID |
| NFC content | Same URL form; with NTAG 424 DNA: unique per-tap signed (CMAC + counter) |
| Token storage | Only `sha256(token)` in database |
| Lifecycle | `created → pending → issued → active → (suspended \| lost \| blocked) → replaced` |
| Cardinality | Exactly **one** usable card per patient at a time; unlimited historical cards |

---

## 7. Functional requirements

Priority: **P0** = must for V1, **P1** = V1.5, **P2** = V2+. IDs are referenced by tests.

### 7.1 Identity & accounts (ID)
| ID | Requirement | Pri |
|---|---|---|
| ID-01 | Issuer can create a member with: full name*, DOB*, sex, mobile, email, address, emergency contact. | P0 |
| ID-02 | System generates a unique random 10-digit Health ID (5-5 display) on member creation. | P0 |
| ID-03 | Duplicate detection (fuzzy name + DOB + mobile) runs before creation; warns, never auto-merges. | P0 |
| ID-04 | Patient logs in via mobile OTP; first login claims the profile by matching mobile on file. | P0 |
| ID-05 | Patient can update contact details/language; identity-critical fields (name, DOB) change only via verified correction request. | P0 |
| ID-06 | Name change keeps history (`patient_name_history`); old documents remain as issued. | P1 |
| ID-07 | Guardianship: guardian linked to dependent; child → adult transition flow. | P2 |
| ID-08 | Optional linking of external identifiers (ABHA number/address) with verification. | P2 |
| ID-09 | Patient status: active, restricted, deceased, merged. | P1 |

### 7.2 Card issuing & lifecycle (CARD)
| ID | Requirement | Pri |
|---|---|---|
| CARD-01 | Generate card + opaque token on issuing; store hash only. | P0 |
| CARD-02 | Generate print-ready PDF (front/back) from a template, automatically. | P0 |
| CARD-03 | Pre-activation verification: member ↔ card serial ↔ QR ↔ (NFC) match before status `issued`. | P0 |
| CARD-04 | Activation by patient (scan/login/confirm) or by issuer admin; patient activation is the default. | P0 |
| CARD-05 | Block card (lost/stolen/compromised) by patient (self-service), issuer, or support; takes effect immediately for QR and NFC. | P0 |
| CARD-06 | Replacement creates a **new token** and card; Health ID unchanged; old card → `replaced`. | P0 |
| CARD-07 | Reprint (same token) allowed only while card has never been delivered/activated. | P1 |
| CARD-08 | Card history per patient (all cards, reasons, actors). | P0 |
| CARD-09 | NFC write/link with `nfc_uid_hash` and (preferred) secure dynamic messaging. | P1 |
| CARD-10 | Template system: versioned templates; each card records `template_id`/version/generated_by/at. | P1 |
| CARD-11 | Card Designer (logo, org name, layout, QR position, fonts); medical fields prohibited. | P1 |
| CARD-12 | Digital card in patient app (view; show QR for scanning). | P0 |

### 7.3 Fulfillment & notifications (FUL)
| ID | Requirement | Pri |
|---|---|---|
| FUL-01 | Order record per issuance/replacement/reprint with status events. | P0 |
| FUL-02 | Statuses: requested → generated → printing → ready → dispatched → delivered (+ failed/cancelled). | P1 |
| FUL-03 | Fulfillment board for issuer (filters, bulk status change, AWB/courier entry). | P1 |
| FUL-04 | Patient order tracker with status steps and courier link. | P1 |
| FUL-05 | Emails: card issued, dispatched, delivered, replaced, blocked, security alert. Email contains **secure link**, never the QR PDF as attachment. | P0 |
| FUL-06 | SMS for critical events (card blocked, access request when no app installed). | P1 |
| FUL-07 | Optional paid replacement (card + delivery fee) with payment status. | P2 |
| FUL-08 | Idempotent jobs: PDF/email/job retries never duplicate cards or emails. | P0 |

### 7.4 Access, consent & emergency (ACC)
| ID | Requirement | Pri |
|---|---|---|
| ACC-01 | Staff scan QR/NFC or search by Health ID (+ second factor) → **masked identity only**. | P0 |
| ACC-02 | Mandatory identity confirmation before any further action. | P0 |
| ACC-03 | Access request: scopes, mode (view / view+add / view+add+upload), purpose, duration. | P0 |
| ACC-04 | Patient approves/rejects in-app; can edit scopes/duration before approving. | P0 |
| ACC-05 | Alternate consent: OTP to patient's mobile (no smartphone) and assisted in-person with witness. | P1 |
| ACC-06 | Grants expire automatically; patient can revoke any time; effect immediate. | P0 |
| ACC-07 | Sensitive scopes (mental health, reproductive health) off by default, separately consented. | P1 |
| ACC-08 | Treating-relationship grant for admissions (org-wide for stay duration). | P1 |
| ACC-09 | Emergency profile (patient-configurable): name, blood group, allergies, critical conditions, key meds, emergency contact. | P1 |
| ACC-10 | Break-glass: verified clinician + reason → 30-min emergency-scope grant; logged; patient notified; org admin review. | P1 |
| ACC-11 | Guardian can approve/deny for dependent. | P2 |
| ACC-12 | Patient "Who accessed my records" log. | P0 |

### 7.5 Clinical records (REC)
| ID | Requirement | Pri |
|---|---|---|
| REC-01 | Timeline (unified, chronological, filterable, searchable). | P0 |
| REC-02 | Consultation: complaint, observations, diagnosis, treatment, prescription, investigations, follow-up. | P0 |
| REC-03 | Medicines, conditions, allergies, vitals as structured data. | P0 |
| REC-04 | Every record has provenance: source org, entered-by, verification (`provider_verified` / `patient_reported`), timestamp. | P0 |
| REC-05 | Append-only with amendments (`supersedes_id` + reason); original viewable. | P0 |
| REC-06 | Patient can add self-reported entries, clearly labelled. | P1 |
| REC-07 | Documents (PDF/image) stored privately with hash; linked to structured data. | P1 |
| REC-08 | Hospitalization: admission → daily records → discharge; nurse-limited scope. | P1 |
| REC-09 | Lab orders → results (structured: value, unit, range, flag) → verification → amendments. | P1 |
| REC-10 | Lab trend charts per test; amended values flagged. | P1 |
| REC-11 | Conflicting data display (e.g., blood group mismatch) instead of auto-correct. | P1 |
| REC-12 | "Related historical records" wording only; no causal claims. | P0 |
| REC-13 | Correction workflow: request → approval by authoring org → new version. | P1 |
| REC-14 | Search across structured data (test names, drugs, diagnoses). | P1 |

### 7.6 Organizations & staff (ORG)
| ID | Requirement | Pri |
|---|---|---|
| ORG-01 | Org onboarding with registration number; **platform verification before any access**. | P0 |
| ORG-02 | Invite-only staff; role-based permissions; MFA mandatory. | P0 |
| ORG-03 | Staff deactivation immediately removes access; historical attribution preserved. | P0 |
| ORG-04 | Doctor licence number captured (verification against registry later). | P1 |
| ORG-05 | Org suspension (compliance) freezes all org staff access. | P1 |

### 7.7 Admin, support & compliance (ADM)
| ID | Requirement | Pri |
|---|---|---|
| ADM-01 | Dashboard: members, cards, orgs, requests, alerts. | P1 |
| ADM-02 | Audit explorer (by patient/staff/org/time). | P0 |
| ADM-03 | Anomaly alerts (mass viewing, invalid-token bursts, break-glass abuse). | P1 |
| ADM-04 | Assisted account recovery with strict identity checks. | P1 |
| ADM-05 | Data-subject request handling (export, correction, withdrawal, grievance). | P1 |

---

## 8. Key user flows

### 8.1 Issue card (issuer)
Create member → duplicate check → Health ID generated → pick template → card + token → PDF → email secure link → print → **verify (QR ✓ NFC ✓ match ✓)** → dispatch → patient activates.

### 8.2 Hospital visit
Scan/search → masked identity → **confirm** → request (scopes/duration/purpose) → patient approves (app/OTP/assisted) → summary → consult → record added → timeline updates → grant expires.

### 8.3 Lost card
Patient app → My Card → "Lost" → warning → confirm → old card blocked instantly → replacement order → new token/PDF → print → dispatch → activate. Health ID, history, grants unchanged.

### 8.4 Emergency
Responder scans → emergency view (limited) → if more needed → break-glass (reason) → 30-min scope → logged → patient notified.

---

## 9. Non-functional requirements

| Category | Requirement |
|---|---|
| **Security** | TLS 1.2+; encryption at rest; MFA for all staff; RLS on every table; no PHI in logs/URLs; secrets in Vault; pen-test before first real hospital |
| **Privacy** | Purpose-limited consent; data minimisation; DPDP Act 2023/Rules 2025 aligned; grievance contact; children's data safeguards |
| **Residency** | PHI stored and backed up in India |
| **Performance** | Card resolve p95 < 300 ms server time; page load < 3 s on 3G for patient home; timeline first paint < 2 s |
| **Availability** | 99.5% (V1) → 99.9% (V2); PITR backups; quarterly restore drills |
| **Scalability** | Design for 10M+ members, 10k+ orgs; partition `audit_logs` and `lab_results` by time when > 100M rows; read replicas later |
| **Accessibility** | WCAG 2.2 AA; ≥16 px body; ≥48 px targets; screen-reader labels |
| **Localisation** | en + hi at launch; Indic fonts; IST and DD/MM/YYYY; +91 formatting |
| **Compatibility** | Android 8+ Chrome, iOS Safari 15+, desktop Chrome/Edge/Firefox; PWA |
| **Auditability** | Immutable audit log; all grants, views, writes, blocks, break-glass recorded |
| **Retention** | Defined policy: clinical records vs account deletion; legal-hold capability |
| **Observability** | PII-scrubbed logs, metrics, alerts, runbooks |

---

## 10. Data model summary
See `database.md`. Core entities: `patients`, `health_cards`, `card_events`, `card_orders`, `card_templates`, `card_print_jobs`, `organizations`, `staff`, `access_requests`, `access_grants`, `consents`, `break_glass_events`, `encounters`, `conditions`, `allergies`, `medications`, `vitals`, `hospitalizations`, `daily_records`, `lab_orders`, `lab_results`, `documents`, `audit_logs`, `guardianships`, `external_identifiers`.

---

## 11. Privacy, security & compliance requirements
- Consent artefact stored for every grant (what, who, when, purpose, expiry, method).
- Right to access/export, correction, withdrawal; clinical-retention exceptions explained in notice.
- Breach response plan incl. regulator/user notification timelines per DPDP Rules.
- Verifiable guardian consent for minors.
- Clear separation of **account deletion** vs **clinical record retention**.
- ABDM alignment: privacy-by-design, need-to-know, interoperability.
- **Legal review required** (healthcare data, DPDP, Telemedicine/clinical records norms, state rules) before pilots with real data.

---

## 12. Analytics & telemetry
Product analytics must be **PHI-free** (event names + IDs only, no values): cards issued/activated, scan success/fail, consent request→decision time, replacement requests, search usage, language usage, errors. Self-hosted or privacy-first analytics only on authenticated pages.

---

## 13. Dependencies & assumptions

| Dependency | Notes |
|---|---|
| Supabase (Mumbai) | DB/Auth/Storage/Edge Functions |
| SMS provider + **DLT registration** | Mandatory for OTP in India; start early |
| Email provider | Resend/SES with verified domain (SPF/DKIM/DMARC) |
| Card printer + NFC encoder/vendor | NTAG 424 DNA availability and key management |
| Courier partner | Manual in V1; API in V1.5 |
| Pilot hospitals/labs | Needed to validate workflow |
| Legal counsel | DPDP/health compliance |

Assumptions: pilot starts in one city/cluster; hospitals keep their existing HMIS; patients have a mobile number (not necessarily smartphone).

---

## 14. Risks & mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Hospitals don't adopt (extra work) | High | Make data entry faster than status quo; start with clinics/labs; import PDFs |
| Overlap with ABDM/ABHA | High | Position as physical + workflow layer; plan ABDM linking |
| Data breach | Critical | RLS, MFA, audit, minimal exposure, pen-test, incident plan |
| Wrong-patient entries | Critical | Identity-confirm gates; duplicate controls; amendments |
| 10-digit ID guessing | Medium | ID never grants access; second factor; rate limits |
| SMS/DLT delays | Medium | Start registration early; email fallback for staff |
| Card cost/logistics | Medium | Digital card first; paid replacement; batch printing |
| Regulatory change | Medium | Counsel; modular consent + retention |
| Solo-builder scope creep | High | Strict phase gates; V1 limited to P0 list |

---

## 15. Open questions
1. Who is the legal "data fiduciary" — us, the hospital, or joint?
2. Will pilot hospitals insist on ABDM linkage from day one?
3. Card cost target per unit, and who pays (patient, hospital, sponsor)?
4. Is the emergency profile opt-in or opt-out by default?
5. Minimum doctor verification standard for pilots (manual licence check vs registry)?
6. Do we need an assisted-consent witness rule per state?
7. Is a 10-digit ID acceptable long-term, or should we reserve 12-digit migration now?

---

## 16. Edge-case catalogue

Format: **ID — Scenario → Required behaviour**. Each becomes at least one test.

### 16.1 Health ID
- **EC-ID-01** — Random generator produces an existing ID → retry until unique; unique constraint is the final guard; alert if retries > 5.
- **EC-ID-02** — ID space exhaustion/high density (> 70% used) → monitoring alert; migration plan to 12 digits (opaque-string design).
- **EC-ID-03** — User mistypes one digit and lands on another real person → identity confirmation (name/age/masked mobile) mandatory; second factor (DOB/OTP) required; never show records.
- **EC-ID-04** — Staff enters a 10-digit **mobile number** into the Health ID field → detect mobile pattern/ambiguity, show "That looks like a mobile number. Search by mobile instead?".
- **EC-ID-05** — Attacker enumerates Health IDs → rate limit per staff/IP, uniform responses, anomaly alert, temporary lockout.
- **EC-ID-06** — ID pasted with spaces/dashes/zero-width characters → normalise to digits before validation.
- **EC-ID-07** — Leading zero typed/assumed (IDs start 1–9) → reject with helpful message.
- **EC-ID-08** — Two patients with same name, DOB, mobile (twins/family phone) → treated as potential duplicates; manual review; never auto-merge; allow shared mobile with distinct profiles.
- **EC-ID-09** — Merged duplicates → winner keeps Health ID; loser marked `merged` and redirects; history re-linked with audit; reversible by compliance within window.

### 16.2 Card, QR & NFC
- **EC-CARD-01** — QR photographed/shared → token alone shows only a public landing page; no PHI; staff must be authenticated; patient consent still required.
- **EC-CARD-02** — Card found by stranger → public page offers "Report found card"; no identity shown.
- **EC-CARD-03** — Blocked card scanned → "This card is not active" (no patient details); event logged; optionally alert patient.
- **EC-CARD-04** — Old (replaced) card used → same as blocked; never silently works.
- **EC-CARD-05** — NFC tag cloned (UID copy) → UID is not a secret; with NTAG 424 DNA, replayed/stale counter rejected; flag anomaly.
- **EC-CARD-06** — QR damaged/unreadable → fallback: Health ID + DOB/mobile OTP.
- **EC-CARD-07** — NFC unsupported device (iOS/Web NFC) → QR/manual fallback, no dead end.
- **EC-CARD-08** — Print job produced wrong person's name/QR → mandatory verification scan before `issued`; mismatch blocks activation; wrong card destroyed and token revoked.
- **EC-CARD-09** — Card activated by wrong person (delivered to neighbour) → activation requires login as the owner (mobile OTP bound to profile) — a stranger cannot activate.
- **EC-CARD-10** — Duplicate issuance requests (double-click/retry) → idempotency key; one card only; unique partial index enforces one usable card.
- **EC-CARD-11** — Replacement requested while previous replacement in progress → show existing order; prevent duplicate cards.
- **EC-CARD-12** — Card in transit when patient blocks it → block works at once; delivered card arrives dead; new order triggered.
- **EC-CARD-13** — Card delivered to wrong address/returned → status `failed`, re-dispatch or cancel; address change requires verification.
- **EC-CARD-14** — PDF generation fails midway → job retried (backoff); card stays `pending`; no email sent until PDF exists.
- **EC-CARD-15** — Print PDF leaked (contains token) → short-lived signed URLs, auto-delete after retention window; if leak suspected, block and reissue.
- **EC-CARD-16** — Template changed after card generation → old cards keep their template version; reprint uses stored version.
- **EC-CARD-17** — Patient lacks email → SMS/letter alternatives; issuer prints and hands over in person.
- **EC-CARD-18** — NFC key/secret compromised at vendor → rotate keys, mass-reissue plan, per-batch key IDs recorded.
- **EC-CARD-19** — Patient wants to deactivate card but keep account → allowed ("suspended"); digital access remains.

### 16.3 Authentication & accounts
- **EC-AUTH-01** — Mobile number recycled by telecom (new owner) → claim requires more than OTP for first activation (card-delivery or issuer verification); on number change, require verification; alert old email.
- **EC-AUTH-02** — Patient changes/loses mobile → recovery via support with identity verification + cooling-off period + notification.
- **EC-AUTH-03** — OTP not received (DLT/network) → resend with throttle; fallback to email OTP if present; assisted flow for staff.
- **EC-AUTH-04** — OTP brute force → 3 attempts, lockout, exponential delay.
- **EC-AUTH-05** — Staff leaves hospital → deactivation revokes sessions at next refresh and blocks at DB check immediately.
- **EC-AUTH-06** — Staff shares credentials → MFA, concurrent session alerts, device list.
- **EC-AUTH-07** — Staff belongs to two organizations → one role per org context with explicit org switch; grants never cross orgs.
- **EC-AUTH-08** — Session left open on shared hospital PC → idle timeout, PHI blur on tab hidden, re-auth for sensitive actions.
- **EC-AUTH-09** — Patient has no phone at all → profile held by issuer-assisted path with guardian/relative as caregiver; consent via assisted in-person flow.
- **EC-AUTH-10** — Two family members share one phone → separate profiles tied to same number; OTP login asks "who?" only after verifying; no cross-profile exposure.

### 16.4 Consent & access
- **EC-ACC-01** — Patient unreachable/unconscious → emergency profile / break-glass only; no normal grant possible.
- **EC-ACC-02** — Patient approves then regrets → revoke effective immediately; data already viewed is logged; staff UI loses data on next fetch.
- **EC-ACC-03** — Grant expires mid-consultation → UI warns 5 min before; extension request flow; writes after expiry fail with clear message; drafts retained locally (non-PHI-sensitive fields only) or saved server-side as draft by the same staff.
- **EC-ACC-04** — Staff requests broader scopes than purpose justifies → defaults by purpose; extra scopes need explicit patient approval; logged.
- **EC-ACC-05** — Request spam from one org → rate limit; patient can block an org; flagged to admin.
- **EC-ACC-06** — Approval via OTP given to wrong person (relative's phone) → OTP is sent to patient mobile only; assisted flow requires witness + ID flag; flagged for review.
- **EC-ACC-07** — Org suspended mid-grant → all org grants inactive instantly (checked in `has_grant`).
- **EC-ACC-08** — Treating-relationship grant outlives discharge → auto-expire at discharge + grace; patient notified.
- **EC-ACC-09** — Break-glass abused → mandatory reason, 30-min cap, org admin review within 24h, anomaly alerts, repeated abuse → org compliance case.
- **EC-ACC-10** — Patient is minor → guardian approves; at 18, control moves to patient with notification and re-consent.
- **EC-ACC-11** — Guardian conflict (both parents, disputed custody) → verified legal guardian designation; disputes handled by support/legal; restrict access pending resolution.
- **EC-ACC-12** — Dependent adult (dementia) → caregiver with documented authority; limited scopes; audit highlighted.
- **EC-ACC-13** — Sensitive scope (mental health) requested → separate explicit consent screen; default not selected.
- **EC-ACC-14** — Patient deceased → status `deceased`; access only per legal rules/next-of-kin process; cards blocked; no new grants by patient.

### 16.5 Clinical data integrity
- **EC-REC-01** — Wrong-patient record entered → correction by authoring org: original retained, flagged "entered in error", moved to correct patient with audit; both patients notified as per policy.
- **EC-REC-02** — Doctor edits past note → creates amendment version; original visible; reason required.
- **EC-REC-03** — Two providers disagree (diagnosis/blood group) → show both with source; "conflicting information" banner; never auto-resolve.
- **EC-REC-04** — Lab amends result → new version linked; patient notified; trends show amended marker.
- **EC-REC-05** — Self-reported entry contradicts provider data → both shown; provider-verified emphasised; labelled.
- **EC-REC-06** — Unit mismatch (mg/dL vs mmol/L) → store unit explicitly; convert only for display with note; never mix in trend without conversion.
- **EC-REC-07** — Missing reference range → show value without flag; don't infer.
- **EC-REC-08** — Duplicate document upload → hash match warns; allow link instead of duplicate.
- **EC-REC-09** — Malware/oversized/corrupt upload → scan, size/type limits, reject with message.
- **EC-REC-10** — Backdated entries (record date ≠ entry date) → keep both `recorded_at` and `created_at`; timeline sorts by clinical date, shows entry date on detail.
- **EC-REC-11** — Timezone/date confusion → store UTC, display IST, show ISO on exports.
- **EC-REC-12** — Doctor leaves org; their entries stay attributed to them and the org; shown as "former staff".
- **EC-REC-13** — Org shuts down → historical records remain as source records; org status `closed`; no new contributions; platform retains per retention policy.
- **EC-REC-14** — Same patient, different spelling/transliteration of name (Hindi/English) → store original script + transliteration; search is tolerant (trigram/phonetic); display preferred language.
- **EC-REC-15** — Unknown DOB (common in India: only age/year) → allow `dob_estimated` flag and year-only DOB; show "~" in UI; matching adjusts.
- **EC-REC-16** — Gender-diverse patients → inclusive sex/gender fields (include "other"/"prefer not to say") without breaking clinical logic.

### 16.6 Fulfillment
- **EC-FUL-01** — Courier tracking unavailable → manual status with note; patient sees "Dispatched" without false precision.
- **EC-FUL-02** — Patient changes address after dispatch → blocked/flagged; support-mediated redirect.
- **EC-FUL-03** — Payment taken, card not generated (failure) → automatic refund/retry queue; alert admin.
- **EC-FUL-04** — Bulk batch print with one bad record → batch continues; failures isolated and listed.
- **EC-FUL-05** — Email bounces → mark `bounced`; fallback SMS; flag on member; don't retry forever.
- **EC-FUL-06** — Replacement fraud (many replacements for one patient) → limit per period; flag; manual review.
- **EC-FUL-07** — Card never received → "Not received" reason → block old, reship; investigate.

### 16.7 Infrastructure & operations
- **EC-OPS-01** — Hospital internet down (V1) → clear "online required" screen; manual fallback process; V2 offline intake queue.
- **EC-OPS-02** — SMS provider outage → email OTP fallback for staff; patients queue and retry; status banner.
- **EC-OPS-03** — Supabase region outage → read-only status page; PITR/restore plan; comms template.
- **EC-OPS-04** — Migration breaks RLS (data exposure) → CI RLS test suite blocks deploy; advisors run on every migration.
- **EC-OPS-05** — Rate limiter store unavailable → fail closed for sensitive endpoints (resolve, OTP).
- **EC-OPS-06** — Token hashing key/pepper rotation → versioned hashes (`hash_version`), dual-lookup during migration.
- **EC-OPS-07** — Slow network (2G/3G) → resumable uploads, skeleton UI, small payloads; no timeouts that duplicate writes (idempotency keys).
- **EC-OPS-08** — Duplicate form submissions (double tap) → idempotency keys for consult/lab/order creation.
- **EC-OPS-09** — Accidental production use of real data in staging → policy + synthetic-data enforcement; DB-level environment banner.
- **EC-OPS-10** — Audit-log growth → partitioning, archival to cold storage, never deletion within retention period.

### 16.8 Legal, privacy & ethics
- **EC-LEG-01** — Patient requests deletion → distinguish account vs clinical record; explain retention; execute allowed deletions; record the decision.
- **EC-LEG-02** — Police/court request → only via compliance workflow with documented order; patient notified where law allows; fully audited.
- **EC-LEG-03** — Insurance/employer pressure to show records → no direct access; only patient-initiated share with explicit scope/expiry.
- **EC-LEG-04** — Minor's sensitive health data (e.g., reproductive health) → follow applicable law; guardian visibility rules configurable per jurisdiction and scope.
- **EC-LEG-05** — Cross-border access (NRI/travel) → region lock default; explicit policy needed before enabling.
- **EC-LEG-06** — Patient dies and family requests records → next-of-kin verification process; limited export per policy and law.
- **EC-LEG-07** — AI summaries (V2) show wrong inference → AI labelled as summary of sources, links to originals, no diagnostic language, can be hidden.

---

## 17. Acceptance criteria — examples (Given/When/Then)

**AC-01 Issue card**
Given an issuer operator with a verified org, when they create a member with required fields, then a unique 10-digit Health ID is generated and displayed as `XXXXX XXXXX`, a card in status `pending` exists, and a print job is queued.

**AC-02 Resolve**
Given an active staff member in a verified org, when they scan a valid active card, then they see only name, age, sex, masked mobile and Health ID, and an audit entry `resolve_card` is written.

**AC-03 Invalid/blocked token**
Given a blocked or unknown token, when scanned, then the response contains no patient data and is indistinguishable in shape/latency from other negatives; an audit event is recorded.

**AC-04 Consent**
Given a pending request, when the patient approves with a 24 h duration, then a grant is created with `expires_at = now()+24h`; staff can read only approved scopes; after expiry reads return zero rows.

**AC-05 Revoke**
Given an active grant, when the patient revokes it, then the next staff read returns zero rows and the staff UI shows "Access ended".

**AC-06 Replacement**
Given an active card, when the patient confirms "Lost", then the old card is blocked immediately, a new card with a new token exists, the Health ID is unchanged, and an order with events is created.

**AC-07 Immutability**
Given a saved lab result, when any user attempts UPDATE/DELETE, then the operation is rejected; an amendment creates a new row referencing the original.

**AC-08 Wrong patient**
Given a doctor about to sign a consult, when identity confirmation has not been completed for this session, then saving is blocked.

**AC-09 Health ID format**
Given any generated Health ID, then it matches `^[1-9][0-9]{9}$`, is unique, and is displayed in 5-5 grouping; input with spaces/dashes is normalised.

---

## 18. Project file structure (professional layout)

```text
healthcard/
├── README.md
├── docs/
│   ├── PRD.md
│   ├── architecture.md
│   ├── database.md
│   ├── backend.md
│   ├── frontend.md
│   ├── security/
│   │   ├── threat-model.md
│   │   ├── incident-response.md
│   │   └── data-retention.md
│   ├── compliance/
│   │   ├── dpdp-checklist.md
│   │   ├── consent-notice-v1.md
│   │   └── abdm-alignment.md
│   ├── runbooks/ (card-recall.md, sms-outage.md, restore-drill.md)
│   └── adr/                          # architecture decision records
│       ├── 0001-supabase-over-firebase.md
│       ├── 0002-10-digit-health-id.md
│       └── 0003-append-only-clinical-data.md
│
├── apps/
│   └── web/                          # single Next.js app (role-based route groups)
│       ├── src/
│       │   ├── app/
│       │   │   ├── (public)/ { page.tsx, c/[token], e/[token], login, verify-otp }
│       │   │   ├── (patient)/patient/ { timeline, records, medicines, reports, hospitalizations, access, card, family, privacy, settings }
│       │   │   ├── (hospital)/hospital/ { scan, patients/[patientId]/{summary,consult,admit,daily,orders}, staff, policies }
│       │   │   ├── (lab)/lab/ { orders, results, verification }
│       │   │   ├── (issuer)/issuer/ { members, issue, cards, activation, replacements, fulfillment, designer, templates, print-jobs }
│       │   │   ├── (admin)/admin/ { orgs, audit, security, support, system }
│       │   │   └── api/ (thin handlers)
│       │   ├── components/ { ui, health, layout }
│       │   ├── lib/ { supabase, auth, i18n, format, validators }
│       │   ├── messages/ { en.json, hi.json, ... }
│       │   ├── types/db.ts
│       │   └── middleware.ts
│       ├── public/ (icons, manifest, fonts)
│       ├── e2e/ (Playwright)
│       └── package.json
│
├── packages/
│   ├── config/ (eslint, tsconfig, tailwind preset)
│   ├── ui/ (shared components if a second app is added)
│   ├── schemas/ (Zod schemas shared by web + functions)
│   ├── card-generator/ (template → PDF/PNG, QR)
│   ├── email/ (React Email templates)
│   ├── fhir/ (mappers: DB ⇄ FHIR R4) — V2
│   └── permissions/ (scope & role constants)
│
├── supabase/
│   ├── config.toml
│   ├── migrations/
│   │   ├── 0001_extensions_enums.sql
│   │   ├── 0002_identity.sql
│   │   ├── 0003_orgs_staff.sql
│   │   ├── 0004_cards_fulfillment.sql
│   │   ├── 0005_access_consent.sql
│   │   ├── 0006_clinical.sql
│   │   ├── 0007_audit_immutability.sql
│   │   ├── 0008_rls_helpers_policies.sql
│   │   └── 0009_storage_policies.sql
│   ├── functions/
│   │   ├── _shared/ { crypto.ts, ratelimit.ts, audit.ts, auth.ts }
│   │   ├── card-issue/ card-resolve/ card-block/ card-replace/
│   │   ├── access-request/ access-decide/ access-revoke/ break-glass/
│   │   ├── pdf-generate/ email-send/ otp/ patient-match/ audit-view/
│   ├── tests/ (pgTAP RLS tests)
│   └── seed.sql                      # synthetic data only
│
├── .github/workflows/ (ci.yml: lint, typecheck, unit, pgTAP, e2e, deploy)
├── .mcp.json                         # Supabase MCP → STAGING only, read_only
├── .env.example                      # no real secrets
└── turbo.json / pnpm-workspace.yaml
```

---

## 19. Milestones (indicative, solo builder + part-time)

| Weeks | Milestone | Exit criteria |
|---|---|---|
| 1–2 | Foundations | Repo, CI, Supabase local, migrations 0001–0003, auth (OTP + staff MFA), design system shell |
| 3–4 | Issuer & cards | Create member, 10-digit ID, token, QR, PDF, email, verify, activation |
| 5–6 | Patient + consent | Home, My Card, access centre, request/approve/revoke, audit view; RLS tests green |
| 7–8 | Hospital portal | Scan/search, identity confirm, summary, consultation, timeline |
| 9–10 | Hardening | Security review, performance, a11y, Hindi, seed pilot, demo |
| 11–16 | V1.5 | NFC, hospitalization, lab, emergency/break-glass, replacement + fulfillment |

---

## 20. Definition of Done (per feature)
- [ ] Requirement ID(s) referenced; acceptance criteria written
- [ ] RLS/permissions implemented **and** tested (positive + negative)
- [ ] Audit events emitted
- [ ] Edge cases from §16 covered or consciously deferred (documented)
- [ ] i18n strings externalised (en + hi)
- [ ] Accessible (keyboard, labels, contrast)
- [ ] No PHI in logs/analytics
- [ ] Docs updated; migration reviewed
