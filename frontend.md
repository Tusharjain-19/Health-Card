# HealthCard — frontend.md

One **Next.js (App Router) + TypeScript** app, role-based route groups, shared design system. Built mobile-first for low-end Android and slow networks across India.

---

## 1. Stack

| Concern | Choice |
|---|---|
| Framework | Next.js 15 (App Router), React 19, TypeScript strict |
| Styling | Tailwind CSS + shadcn/ui (Radix) |
| Data | `@supabase/ssr` + `@supabase/supabase-js`, TanStack Query for client cache |
| Forms | React Hook Form + Zod (schemas shared with backend) |
| i18n | `next-intl` (en, hi at launch; mr, ta, te, bn, gu, kn, ml, pa next) |
| Charts | Recharts (lab trends) |
| QR | `qrcode` (generate), `@zxing/browser` (scan from camera) |
| NFC | Web NFC (`NDEFReader`, Android Chrome only) with QR/manual fallback |
| PDF (card) | Server-side (`@react-pdf/renderer` or headless render in Edge/worker) |
| PWA | `serwist` / next-pwa: installable, offline shell, push |
| Tests | Vitest, Testing Library, Playwright |
| Monitoring | Sentry (PII-scrubbed) |

---

## 2. Folder structure

```text
healthcard/
├── src/
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── page.tsx                 # landing
│   │   │   ├── c/[token]/page.tsx       # card landing (NO PHI)
│   │   │   ├── e/[token]/page.tsx       # emergency view (limited, logged)
│   │   │   └── login/ , verify-otp/
│   │   ├── (patient)/patient/
│   │   │   ├── page.tsx                 # home
│   │   │   ├── timeline/ records/ medicines/ reports/ hospitalizations/
│   │   │   ├── access/                  # requests, grants, who-viewed
│   │   │   ├── card/                    # digital card, block, replace, track
│   │   │   ├── family/ settings/ privacy/
│   │   ├── (hospital)/hospital/
│   │   │   ├── page.tsx                 # dashboard
│   │   │   ├── scan/ patients/ [patientId]/
│   │   │   │   ├── summary/ consult/ admit/ daily/ orders/
│   │   │   ├── staff/ departments/ policies/ (admin only)
│   │   ├── (lab)/lab/                   # orders, results entry, verification
│   │   ├── (issuer)/issuer/
│   │   │   ├── members/ issue/ cards/ activation/
│   │   │   ├── designer/ templates/ print-jobs/ fulfillment/ replacements/
│   │   ├── (admin)/admin/               # orgs, verification, audit, security, support
│   │   └── api/                         # thin route handlers only
│   ├── components/
│   │   ├── ui/                          # shadcn primitives
│   │   ├── health/                      # Timeline, LabTrend, ConsentSheet, IdentityConfirm, ProvenanceBadge, CardPreview
│   │   └── layout/                      # shells per role
│   ├── lib/
│   │   ├── supabase/{client,server,middleware}.ts
│   │   ├── auth/ (guards, roles, mfa)
│   │   ├── i18n/ , format/ (IST dates, +91 phone, health-id 4-4-4)
│   │   └── validators/ (zod)
│   ├── messages/{en,hi,...}.json
│   ├── types/db.ts                      # generated from Supabase
│   └── middleware.ts
├── supabase/ (migrations, functions, tests)
└── e2e/
```

---

## 3. Route guard matrix

| Group | Allowed `app_role` | Extra |
|---|---|---|
| `/patient/*` | patient | phone-verified |
| `/hospital/*` | hospital_admin, doctor, nurse, receptionist | AAL2 (MFA), org active |
| `/lab/*` | lab_tech, lab_admin | AAL2 |
| `/issuer/*` | issuer_admin, issuer_operator | AAL2 |
| `/admin/*` | super_admin, support | AAL2 + IP allow-list |
| `/c/*`, `/e/*` | public | rate-limited, no PHI on `/c` |

`middleware.ts`: refresh session → read `app_role` claim → redirect to proper home or `/login`. Server components re-check with `supabase.auth.getUser()`.

UI hiding is **not** security: every action is enforced by RLS/Edge Functions. Nurses simply don't see "edit diagnosis" **and** can't call it.

---

## 4. Design system

**Principles**
1. **Calm clinical, not sterile**: white/soft neutrals, one strong primary (teal/blue), semantic colours for status (green active, amber pending, red blocked/critical).
2. **Big touch targets** (≥ 48 px), body text ≥ 16 px, adjustable font size (A−/A+) in settings.
3. **Icon + word** always (low literacy, multilingual).
4. **Provenance everywhere**: `ProvenanceBadge` = "Verified by ABC Hospital ✓" vs "Patient reported".
5. **Never silent overwrite**: amended items show "Amended on … (view original)".
6. Dark mode + high-contrast mode.
7. Health ID always formatted `7483 9162 5104` with copy button; mobile masked as `+91 ••••••12`.

**Tokens**: spacing 4-pt grid; radius 12/16; shadows minimal; fonts: Inter + Noto Sans (Devanagari and other Indic scripts bundled with `font-display: swap`).

---

## 5. Key screens (what to build)

### 5.1 Patient (mobile-first PWA)
1. **Login**: phone → OTP → (first time) claim profile → set language.
2. **Home**: Health ID card visual, card status chip, pending access requests (top, urgent), recent activity.
3. **Timeline**: reverse-chronological from `timeline_events`, filters (type, year, org), search; tap → detail with structured values + original doc + provenance.
4. **Medicines / Conditions / Allergies / Vaccines**: current vs past; patient can *add* → labelled "Patient reported".
5. **Reports & Lab trends**: pick a test → chart + table; reference range bands; amended flag.
6. **Hospitalizations**: admission → day cards → discharge summary.
7. **Access centre**:
   - *Requests*: org, who, why, scopes (checkboxes, mental-health off by default), duration chips (1h / 24h / 7d / 30d), Approve / Reject.
   - *Active grants* with Revoke.
   - *Who viewed my records* (from audit).
8. **My Card**: digital card, status, **Block card**, **Request replacement** (reason → warning → confirm), order tracker stepper.
9. **Emergency profile editor**: choose what appears in emergency view; preview.
10. **Family**: add dependent, guardian approvals.
11. **Privacy**: consents, download my data, request correction, grievance contact.

### 5.2 Hospital / Doctor
1. **Scan**: camera QR, NFC tap (if supported), or type Health ID/mobile. → `card-resolve`.
2. **Identity confirm sheet** (mandatory): name, age, sex, masked mobile, Health ID, photo (if any) → "Yes, this is the patient".
3. **Request access** sheet: purpose, scopes (smart defaults by purpose), duration, consent method (App / OTP / In-person).
4. **Waiting state** with live status (Realtime) → approved.
5. **Patient summary**: allergies banner (red), current meds, active conditions, recent labs, last encounters, "Related historical records" (never causal language).
6. **Consultation form**: complaint, observations, diagnosis (search ICD-10), prescription builder, investigations, follow-up → auto timeline.
7. **Admission & daily records**: day-by-day tabs; nurse view = vitals, meds administered, notes only.
8. **Break-glass**: red flow, reason required, countdown timer chip, persistent banner while active.
9. **Corrections**: "Request correction" on own org's records → new version with reason.

### 5.3 Lab
Orders queue → collect sample → enter results (structured grid: test, value, unit, ref range, flag) → attach PDF → verify (second user or same with confirmation) → publish. Amend flow with reason.

### 5.4 Card issuer
- **Members**: search, create (name, DOB, sex, mobile, email, address, emergency contact) with duplicate-match warning.
- **Issue wizard**: Generate ID → select template → generate token/QR → preview front/back → PDF → print → **verify scan (QR ✓ NFC ✓ match ✓)** → mark issued.
- **Designer**: canvas editor (logo, name, ID, QR position, NFC icon, colours, typography); versioned templates; preview with sample data. Never allow medical fields on the card.
- **Fulfillment board** (kanban): Requested → Generated → Printing → Ready → Dispatched → Delivered; failed/cancelled lanes; bulk actions; courier + AWB entry.
- **Replacements queue** with reason, old card auto-blocked.

### 5.5 Super admin
Org onboarding & verification, staff overview, audit explorer (filter by patient/staff/org), security alerts (anomalies, break-glass review), template governance, system settings, support tools (assisted account recovery with strict identity checks).

---

## 6. Core components (build once, reuse)

| Component | Notes |
|---|---|
| `<HealthIdDisplay />` | 4-4-4, copy, optional reveal mask |
| `<IdentityConfirm />` | blocks writes until confirmed; stores confirmation ts |
| `<ConsentSheet />` | scopes, duration, purpose, method; accessible, i18n |
| `<ProvenanceBadge />` | verified / patient-reported / amended |
| `<Timeline />` | virtualised list, grouped by year/month |
| `<LabTrendChart />` | ref-range band, tooltips, amended points hollow |
| `<AllergyBanner />` | always visible in clinical views |
| `<StatusStepper />` | card orders & lab orders |
| `<CardPreview />` | renders front/back from template JSON (used in designer, My Card, issuer verify) |
| `<RoleGate />` | UI-only convenience wrapper |
| `<BreakGlassBar />` | persistent, timer, end-access button |

---

## 7. Data fetching rules
- **Server Components** fetch initial data with user JWT (RLS applies).
- Mutations via **Server Actions** → call Edge Functions for privileged flows; RLS inserts for simple ones.
- Realtime subscriptions only for: access request status, notifications, card order status.
- Pagination everywhere (cursor-based); timeline loads 30 at a time.
- Never put PHI in URLs/query strings; use IDs (UUIDs) only. Patient page: `/hospital/patients/[patientId]`.
- Disable caching (`cache: 'no-store'`) for PHI responses; no PHI in service-worker cache. PWA caches **shell only**.
- Auto-logout staff after inactivity (e.g., 10 min) with warning; blur PHI when tab hidden.

---

## 8. Accessibility, language, low-bandwidth
- WCAG 2.2 AA: focus order, labels, contrast, screen-reader names, reduced motion.
- Language switcher visible on every screen; store preference in `patients.preferred_language`.
- Indic number/date formatting (IST, DD/MM/YYYY) via `Intl`.
- Budget: initial JS < 150 KB gz on patient pages; images AVIF/WebP; lazy-load charts; skeleton states.
- Works on Android 8+/Chrome; test on a ₹8,000 device profile (Lighthouse throttling).
- Offline: app shell + "You're offline" screen; **no offline PHI** in V1.
- Voice/Icon-first "Help" and WhatsApp-style simple wording; avoid medical jargon in patient UI.

---

## 9. Scanning & NFC details
- **QR scan**: `@zxing/browser` with camera permission; validate it's a `https://hc.example.in/c/<token>` URL; extract token; call `card-resolve`; never log token.
- **NFC**: feature-detect `'NDEFReader' in window` (Android Chrome, HTTPS). On tap, read URL record → same flow. iOS Safari lacks Web NFC → QR/manual fallback; native app later if needed.
- **Manual**: Health ID + patient DOB or mobile OTP (rate-limited) for no-card patients.

---

## 10. Security in the frontend
- Strict CSP, `Referrer-Policy: no-referrer` on `/c`, `/e`; `X-Frame-Options: DENY`.
- No third-party analytics scripts on authenticated pages (use privacy-friendly, PHI-free, or self-hosted).
- Sanitise any rendered rich text; no `dangerouslySetInnerHTML` for clinical notes.
- Watermark patient name/staff ID faintly on printed/exported views.
- Clipboard/screenshot: can't prevent, but log exports/downloads server-side.
- Env: only `NEXT_PUBLIC_SUPABASE_URL` and anon key in the client. Service role **never**.

---

## 11. Build order (frontend)
1. Design system + layout shells + i18n scaffolding.
2. Auth (OTP for patient, email+MFA for staff) + route guards.
3. Issuer: create member → issue card → PDF/QR → verify.
4. Patient home + My Card + Access centre.
5. Hospital: scan → identity confirm → request access → summary.
6. Consultation + timeline.
7. Card replacement + fulfillment board.
8. NFC, hospitalization, lab, emergency/break-glass.
9. Hindi + more languages, a11y audit, performance pass.

---

## 12. Working with Supabase MCP while building the frontend
- Let the agent **generate types** and **typed query helpers** after schema changes.
- Ask it to produce **Zod schemas from the DB types** to keep forms in sync.
- Use MCP **docs search** for `@supabase/ssr` patterns; don't paste real data.
- Develop against local `supabase start` or the staging project with **synthetic seed data** only.
