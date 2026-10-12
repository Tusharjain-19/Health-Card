# HealthCard — Multi-Portal Monorepo

> One person → one lifelong health record → a revocable physical card as the key.

## Architecture Highlights
- **7 Independent Frontend Apps**: Completely separate frontends with no shared UI code for complete deployment isolation.
- **1 Central Backend / API**: Single secure Node.js + Express / Supabase API enforcing RBAC, RLS, and immutable audit logs.
- **Centralized Data & Storage**: Encrypted storage for KYC documents, lab reports, and CR80 card PDFs.

### Portals Directory
| Portal | Subdomain | Purpose |
|---|---|---|
| `apps/admin` | `admin.healthcard.in` | Card Issuing, Member Management, Fulfillment & Org Compliance |
| `apps/applicant` | `apply.healthcard.in` | Citizen application, KYC documents, Face & Biometric verification |
| `apps/patient` | `patient.healthcard.in` | Citizen timeline, digital card, OTP consents, and audit access log |
| `apps/hospital` | `hospital.healthcard.in` | Reception check-in, admissions, and hospital administrative controls |
| `apps/doctor` | `doctor.healthcard.in` | Clinical consultations, ICD-10 diagnoses, and structured prescriptions |
| `apps/laboratory` | `lab.healthcard.in` | Sample collection, structured test entry, and pathology sign-off |
| `apps/emergency` | `emergency.healthcard.in` | First-responder critical profile & 30-min break-glass access |
