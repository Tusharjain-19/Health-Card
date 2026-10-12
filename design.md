# HealthCard Design System & Guidelines

## 1. Design Philosophy: Clean, Minimal, Corporate Healthcare

The HealthCard ecosystem (Admin Portal & Applicant Portal) uses a unified, professional, clinical light-mode aesthetic designed for national public health infrastructure. It eliminates dark-mode clutter, excessive gradients, and playful AI illustrations in favor of crisp enterprise typography, subtle borders, and clinical teal accents.

### Core Visual Principles
- **Pure Light Mode**: High-contrast, clean white surfaces (`#ffffff`) on a soft neutral slate canvas (`#f8fafc`).
- **Clinical Deep Teal Brand**: Deep medical teal (`#0f766e`) conveys trust, authority, and official government legitimacy.
- **Bold Red Blood Group**: Blood group designations are prominently rendered in bold high-visibility red (`#dc2626`) across all cards, summaries, and dashboards for rapid emergency trauma response.
- **5-5 Partitioned 10-Digit Health ID**: A single, lifelong 10-digit Health ID formatted exclusively with a center space (`XXXXX XXXXX`), rendered in monospace font (`JetBrains Mono`).
- **No Tick Marks in Verification**: Per regulatory and UI specifications, checkmarks/tick marks (`✓`) are removed from KYC and verification badges to avoid misleading representation of statutory identity status. Tokenized verification badges use clean pill badges instead.

---

## 2. Color Palette & Tokens

```css
:root {
  /* Surfaces & Backgrounds (Pure Light Mode) */
  --bg-app:               #f8fafc; /* Slate 50 - clean canvas */
  --bg-surface:           #ffffff; /* Pure white card surface */
  --bg-surface-subtle:    #f1f5f9; /* Slate 100 - input & inactive tabs */
  --bg-surface-hover:     #f8fafc;

  /* Primary Brand — Deep Clinical Teal */
  --color-primary:        #0f766e; /* Teal 700 - official primary */
  --color-primary-hover:  #115e59; /* Teal 800 */
  --color-primary-active: #134e4a; /* Teal 900 */
  --color-primary-light:  #f0fdfa; /* Teal 50 - subtle tints */
  --color-primary-border: #99f6e4; /* Teal 200 */

  /* Text & Contrast */
  --text-main:            #0f172a; /* Slate 900 - high contrast headings */
  --text-secondary:       #334155; /* Slate 700 - readable body text */
  --text-muted:           #64748b; /* Slate 500 - labels & captions */
  --text-light:           #94a3b8; /* Slate 400 - placeholders */
  --text-inverse:         #ffffff;

  /* Borders & Dividers */
  --border-color:         #e2e8f0; /* Slate 200 - standard hairline */
  --border-strong:        #cbd5e1; /* Slate 300 - focus & active */
  --border-subtle:        #f1f5f9; /* Slate 100 */

  /* Semantic Emergency & Status */
  --color-blood-red:      #dc2626; /* Red 600 - Blood group highlight */
  --blood-red-bg:         #fef2f2; /* Red 50 */
  --blood-red-border:     #fecaca; /* Red 200 */

  --status-active-bg:     #ecfdf5; /* Emerald 50 */
  --status-active-text:   #065f46; /* Emerald 800 */
  --status-active-border: #a7f3d0; /* Emerald 200 */

  --status-pending-bg:    #fffbeb; /* Amber 50 */
  --status-pending-text:  #92400e; /* Amber 800 */
  --status-pending-border:#fde68a; /* Amber 200 */

  --status-blue-bg:       #eff6ff; /* Blue 50 */
  --status-blue-text:     #1d4ed8; /* Blue 700 */
  --status-blue-border:   #bfdbfe; /* Blue 200 */

  /* Shadows — Subtle Enterprise Elevation */
  --shadow-xs: 0 1px 2px 0 rgba(15, 23, 42, 0.04);
  --shadow-sm: 0 1px 3px 0 rgba(15, 23, 42, 0.08), 0 1px 2px -1px rgba(15, 23, 42, 0.04);
  --shadow-md: 0 4px 6px -1px rgba(15, 23, 42, 0.07), 0 2px 4px -2px rgba(15, 23, 42, 0.04);
  --shadow-lg: 0 10px 15px -3px rgba(15, 23, 42, 0.08), 0 4px 6px -4px rgba(15, 23, 42, 0.04);

  /* Corner Radii */
  --radius-sm:   4px;
  --radius-md:   6px;
  --radius-lg:   8px;
  --radius-xl:   12px;
  --radius-full: 9999px;
}
```

---

## 3. Typography Hierarchy

Fonts loaded via Google Fonts:
1. **IBM Plex Sans**: Section titles, headings, and institutional branding.
2. **Inter**: General UI, form labels, inputs, table cells, and narrative body copy.
3. **JetBrains Mono**: 10-digit National Health ID (`XXXXX XXXXX`), SpeedPost AWB tracking numbers, OTP inputs, and serial numbers.

| Token | Family | Size | Weight | Line Height | Usage |
|---|---|---|---|---|---|
| `display-lg` | IBM Plex Sans | 24px | 700 | 32px | Page titles & primary heroes |
| `headline-md` | IBM Plex Sans | 18px | 600 | 26px | Card & container headings |
| `headline-sm` | IBM Plex Sans | 15px | 600 | 22px | Section labels & modal headers |
| `body-md` | Inter | 13.5px | 400 / 500 | 20px | Standard body & form inputs |
| `body-sm` | Inter | 12px | 500 | 16px | Meta text, timestamps, hints |
| `mono-id` | JetBrains Mono | 16px | 700 | 22px | 10-digit Health ID (`XXXXX XXXXX`) |
| `blood-group`| Inter | 13.5px | 800 | 20px | Bold red blood group (`#dc2626`) |

---

## 4. CR80 Physical Card Specification (ISO/IEC 7810)

- **Dimensions**: 85.60 mm × 53.98 mm (Standard CR80 PVC identity card).
- **Corner Radius**: 3.18 mm (approx 8px–12px on screen).
- **Front Layout**:
  - Top: Official emblem and National Health Registry title.
  - Left: Cardholder portrait (upload or live webcam capture).
  - Center/Right: Full name, DOB, Gender, **Bold Red Blood Group**, and partitioned 10-digit Health ID (`XXXXX XXXXX`).
- **Back Layout**:
  - High-coercivity magnetic stripe across the top.
  - Dynamic encrypted QR code (ISO/IEC 18004) pointing to verified digital record.
  - Delivery address, designated emergency contact name and 24/7 phone number.
  - National 24/7 helpline (`1800-11-4477`).

---

## 5. Portal Architecture & Ports

| Portal | Port | Role | Technology |
|---|---|---|---|
| **Admin Portal** | `http://localhost:3000/` | Centralized registry management, members directory, physical card printing batch queue, audit logs | Vite, Pure JS/CSS |
| **Applicant Portal** | `http://localhost:3005/` | Citizen self-service onboarding, 10-digit Health ID issuance, live card preview, SpeedPost fulfillment tracking | Vite, Pure JS/CSS |
| **Central Data Layer** | Shared Storage | `healthcard_v1_store` in LocalStorage shared across portals for instant real-time synchronization | JSON / Central Store |

---

## 6. Component Standards

### Buttons
- `.btn-primary`: Solid `#0f766e` with `#ffffff` text, 6px radius, hover to `#115e59`.
- `.btn-secondary`: Light surface with subtle border and `#334155` text.
- `.btn-outline`: Transparent background with `#cbd5e1` border and primary/secondary hover.
- `.btn-sm`: Compact 30px height for table actions and headers.

### Form Inputs
- 40px height, 6px radius, `#ffffff` background with `#e2e8f0` border. Focus state: `#0f766e` border with subtle `0 0 0 3px rgba(15, 118, 110, 0.15)` glow.
- Date of Birth: 3 separate dropdowns (Day, Month, Year) with live calculated age badge.

### Status Badges
- Pill badges (3px–4px radius, 11.5px font size, medium weight).
- Active: `#ecfdf5` background, `#065f46` text, `#a7f3d0` border.
- Pending: `#fffbeb` background, `#92400e` text, `#fde68a` border.
- SpeedPost / Transit: `#eff6ff` background, `#1d4ed8` text, `#bfdbfe` border.
- Emergency / Alert: `#fef2f2` background, `#b91c1c` text, `#fecaca` border.

---

## 7. Citizen Authentication & Card Issuance Flow
- **Authentication Modes**:
  - **Google One-Click Sign-In ("Continue with Google")**: Authentic OAuth dialog with Google account picker (e.g. Tushar Sharma, Priya Patel, or custom Google email).
  - **Mobile Number OTP**: 10-digit Indian mobile number with automated 6-digit SMS OTP verification code.
  - **Citizen Account Registration**: Full name, mobile, email, password, and DPDP Act statutory consent.
- **Cross-View Pre-filling**:
  - Upon Google login or registration, user credentials (Full Name, Email, Mobile, Profile Avatar) automatically pre-fill into the 3-section Card Application form (`#apply`).
  - Active citizen session is reflected across Header user chip, Application Wizard pre-fill banner, and Citizen Dashboard.
- **Post-Submission & Acknowledgement**:
  - Government fee assessment modal (₹50.00 PVC card manufacturing & encoding fee via UPI / Cards / NetBanking).
  - Official printable A4 Government Enrolment Acknowledgement Slip & Tax Invoice with SpeedPost tracking ID, itemized fee breakdown, and verification QR code.

---

## 8. Applicant Dashboard & Emergency Triage Capabilities
- **Feature 1 — Official Acknowledgement & Tax Invoice (Re-Print Modal)**:
  - Accessible directly from Citizen Dashboard header.
  - Renders complete official UIDAI / Ministry formatted A4 acknowledgement slip with Ashoka emblem, 10-digit Health ID, SpeedPost AWB, citizen portrait photo, verified KYC ID with UIDAI & Gmail OTP verification badges, itemized ₹50 tax invoice, and dynamic QR verification stamp.
  - Native print trigger (`window.print()`) configured for strict A4 dimensions with background-graphics preservation.
- **Feature 2 — High-Resolution Dual-Sided Card Export (PNG)**:
  - Generates crisp 1000×360 dual-sided CR80 PVC card mockups on HTML5 Canvas.
  - Front face: Teal theme gradient, Ashoka emblem, laser chip, portrait photo, citizen name, DOB, sex, bold red `#dc2626` blood group badge, 10-digit Health ID in monospace, dynamic token badge.
  - Back face: Magnetic stripe, dynamic QR code image, residential address, emergency contact, national 24x7 helpline `1800-11-4477`, serial number.
  - Auto-downloads as `HealthCard_<HealthID>.png`.
- **Feature 3 — Pre-Dispatch Delivery Address Update**:
  - Modifiable when card is in `requested`, `generated`, `printing`, or `pending` status.
  - Updates member address, synchronizes `order.deliveryAddress`, and appends an audit event to `order.history`.
- **Feature 4 — Emergency First-Responder Trauma Scan Landing Page (`#emergency`)**:
  - Public, contactless triage access via QR code scan or direct link (`#emergency?hid=...`).
  - Urgent red triage banner with live scan timestamp.
  - High-visibility **Bold Red Blood Group Tag** (`#dc2626`) with ABO/Rh emergency transfusion guidance.
  - One-tap **Call Emergency Contact** button (`tel:`) displaying relation and verified phone.
  - Quick-dial buttons for **108 (Ambulance)** and **112 (National Emergency)**.
  - Clinical markers: Allergies, Organ donor registry status (YES/NO), and Chronic conditions.
  - Section 8 DPDP Act statutory notice indicating redaction of sensitive government KYC ID numbers and full street address.


