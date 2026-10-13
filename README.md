# 🇮🇳 National Sovereign HealthCard (NHC) System

> **Official Ayushman Bharat Digital Mission (ABDM) & National Health Authority (NHA) Aligned Monorepo**  
> *"One Citizen → One Lifelong Health Record → A Revocable Physical Smart Card as the Key."*

---

## 🏛️ Executive Overview

The **National Sovereign HealthCard (NHC)** platform is a unified, federated digital health and physical credential infrastructure designed for sovereign citizen health identification across the Republic of India. Aligned with the **Ayushman Bharat Digital Mission (ABDM)** and **National Health Authority (NHA)** standards, the platform bridges physical smart card technology with decentralized electronic health records (EHR).

Citizens are issued a secure, tamper-evident **CR80 PVC Physical HealthCard** featuring a cryptographic 2D QR matrix and NFC contactless identifier. This physical card acts as an air-gapped authentication key: doctors, hospitals, laboratories, and emergency responders can verify patient identity, read vital emergency triage metrics, and request consent-based medical record access without exposing unencrypted Personally Identifiable Information (PII).

---

## 💎 Sovereign CR80 Card Specification

The physical HealthCard follows strict international identification card standards:

| Specification Parameter | Technical Standard / Details |
|---|---|
| **Form Factor** | ISO/IEC 7810 ID-1 Standard (85.60 mm × 53.98 mm × 0.76 mm) |
| **Material** | High-Durability Polyvinyl Chloride (PVC) / Polycarbonate with Gloss Over-Laminate |
| **Sovereign Identifier** | 10-Digit Cryptographic Health ID in **5-5 grouping** (e.g., `74839 16251`) |
| **Typography** | Bilingual English (`Plus Jakarta Sans` / `Inter`) and Hindi (`Noto Sans Devanagari`) |
| **Date of Birth** | Strict `DD / MM / YYYY` format aligned with national registry records |
| **Blood Group Format** | Clinical ABO + Rh representation with suffix (e.g., `A- NEG`, `O+ POS`, `B+ POS`) |
| **Contactless Technology** | ISO/IEC 14443 Type A / NFC contactless smart chip indication |
| **Anti-Counterfeiting** | Micro-guilloche geometric security patterns, Ashoka Chakra watermark, and sovereign holographic seal |
| **2D QR Matrix** | High-density dynamic QR code encoding cryptographic signed token URL (Zero raw PII) |
| **Card Back Face** | NHA statutory disclaimer, national emergency helplines (108 / 112 / 1075), emergency next-of-kin contact, and verified hospital check-in QR code |

---

## 🏗️ Monorepo Architecture & Applications

This repository is structured as a modular, federated monorepo containing **7 independent front-end applications**, a shared design engine, and a centralized backend API:

```
health-card/
├── apps/
│   ├── admin/             # Port 3000 — Issuer Administration & Physical Card Fulfillment
│   ├── applicant/         # Port 3001 — Citizen Registration, KYC & Card Application Portal
│   ├── patient/           # Port 3002 — Patient Digital Health Record (PHR) & Consent Gateway
│   ├── doctor/            # Port 3003 — Clinical Doctor Desk, ICD-10 Diagnoses & Prescriptions
│   ├── hospital/          # Port 3004 — Hospital OPD Reception, Admissions & Verification Desk
│   ├── laboratory/        # Port 3005 — Diagnostic Lab Workspace, Sample Tracking & Pathology
│   └── emergency/         # Port 3006 — First-Responder Emergency Triage (30-min break-glass)
│
├── card-design/           # Sovereign Card Design System, Vector Assets & HealthCardRenderer
├── backend/               # Centralized Node.js / Express REST API & Cryptographic Token Engine
├── database/              # PostgreSQL Schemas, Row-Level Security (RLS) & Seed Migrations
└── docs/                  # Architectural Specifications, Security Protocols & PRD Documents
```

### 📱 Portal Directory & Roles

| Application | Subdomain / Port | Target Audience | Primary Capabilities |
|---|---|---|---|
| **`apps/admin`** | `admin.healthcard.in` (3000) | State & NHA Issuing Authority | Citizen KYC verification, physical CR80 card generation, custom unregistered card issuance, print-ready A4 PDF export, and fulfillment lifecycle tracking. |
| **`apps/applicant`** | `apply.healthcard.in` (3001) | Citizens / Applicants | Multi-step enrollment wizard, instant 10-digit Health ID allocation, live 3D holographic tilt card preview, SpeedPost dispatch tracking, and PDF print slip download. |
| **`apps/patient`** | `patient.healthcard.in` (3002) | Verified Citizens | Personal Health Record (PHR) timeline, active digital HealthCard, emergency profile setup, consent management, and token revocation controls. |
| **`apps/hospital`** | `hospital.healthcard.in` (3004) | Hospital Front Desk & OPD | High-speed webcam 2D QR matrix scanning, citizen check-in, bed allocation, emergency admissions, and institutional license credentialing. |
| **`apps/doctor`** | `doctor.healthcard.in` (3003) | Certified Medical Practitioners | Tele-consultations, clinical encounter notes, ICD-10 problem lists, structured e-prescriptions, and laboratory order issuance. |
| **`apps/laboratory`** | `lab.healthcard.in` (3005) | Diagnostic Labs & Pathology | Barcode sample intake, clinical chemistry / hematology result entry, reference ranges, and pathologist digital signatures. |
| **`apps/emergency`** | `emergency.healthcard.in` (3006) | Ambulances & Emergency Rooms | Instant triage scan displaying Blood Group, Critical Allergies, and Emergency Contacts with an audited 30-minute break-glass emergency access log. |

---

## 🚀 Key Technical Features

### 1. 🖨️ Sovereign Physical Card Issuance & PDF Export Engine
- **Custom Unregistered & Registered Member Issuance**: Administrators can issue official physical cards to existing verified members or instantly onboard walk-in citizens (`+ Create Custom / Unregistered Card`) with live identity verification.
- **Government A4 Print Slip PDF (`jsPDF`)**: Generates 1:1 scale (85.6 mm × 54 mm) Front & Back card cutouts with dashed lamination guidelines, official Ministry of Health headers, tricolor security ribbons, and a verified citizen metadata table.
- **Direct CR80 2-Page PVC PDF**: Native two-page landscape vector PDF ready for industrial Fargo, Zebra, and Evolis dual-sided card printers.
- **High-Resolution PNG Composite**: 2200 × 700 px dual-sided PNG card mockup exporter for digital wallets and offline citizen backup.

### 2. 🪪 Live 3D Holographic Tilt Card Viewport
- Built using vanilla CSS 3D transforms (`perspective`, `rotateX`, `rotateY`, `scale3d`).
- Interactive pointer/mouse tracking simulates authentic PVC card physical weight, specular metallic reflections, and dynamic holographic sheen.
- Flawless responsiveness across desktop, tablet, and mobile displays without layout clipping or horizontal overflow.

### 3. 🔐 Zero-PII Cryptographic Verification Matrix
- **No Unencrypted PII in QR Code**: The 2D QR matrix contains **no raw names, dates of birth, or Aadhaar numbers**.
- **Cryptographic Ephemeral Token**: Encodes a signed URL with a UUIDv4 token hashed via SHA-256 (`https://hc.national.gov.in/c/{healthId}?tok={uuid}`).
- **Instant Revocation (CARD-05)**: If a physical card is lost or stolen, administrators or citizens can revoke the token. Scanners instantly detect and block revoked physical cards while preserving the citizen's lifelong health records.

---

## 🛠️ Tech Stack

- **Frontend Core**: Vanilla JavaScript (ES6+ Modules), HTML5 Semantic Structure, Custom CSS3 Design System with CSS Variables.
- **Bundler & Tooling**: [Vite 8](https://vitejs.dev/) with hot module replacement (HMR) and optimized rollup production bundling.
- **Document & PDF Generation**: [jsPDF](https://github.com/parallax/jsPDF) for client-side vector-accurate printable document generation.
- **2D QR Matrix**: [QRCode.js](https://github.com/soldair/node-qrcode) (generation) and [jsQR](https://github.com/cozmo/jsQR) (real-time webcam video parsing).
- **Backend & Storage**: Node.js, Express, RESTful APIs, and browser `localStorage` / `sessionStorage` fallback stores for offline and low-connectivity resilience.
- **Typography**: Google Fonts (`Plus Jakarta Sans`, `Inter`, `Noto Sans Devanagari`, `JetBrains Mono`).

---

## ⚡ Getting Started & Local Development

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher (or `pnpm` / `yarn`)
- **Git**

### Installation

Clone the repository and install dependencies for the portals:

```bash
# Clone the repository
git clone https://github.com/Tusharjain-19/Health-Card.git
cd Health-Card

# Install dependencies for Admin Portal
cd apps/admin
npm install

# Install dependencies for Citizen Application Portal
cd ../applicant
npm install

# Install dependencies for Hospital Desk Portal
cd ../hospital
npm install

# Return to root
cd ../..
```

### Running Local Development Servers

You can launch each portal independently:

```bash
# Run Admin Portal (Port 3000)
cd apps/admin
npm run dev

# Run Citizen Application Portal (Port 3001)
cd apps/applicant
npm run dev

# Run Hospital Desk Portal (Port 3004)
cd apps/hospital
npm run dev
```

| Portal | Local URL | Default Access / Demo Credentials |
|---|---|---|
| **Admin Portal** | `http://localhost:3000` | Click **"Issuer Admin"** quick login |
| **Citizen Application Portal** | `http://localhost:3001` | Direct public citizen registration & dashboard |
| **Hospital Reception Desk** | `http://localhost:3004` | Click **"Apollo Indraprastha"** quick login |

### Building for Production

To validate and create production-ready bundles:

```bash
# Production build for Admin
cd apps/admin && npm run build

# Production build for Applicant
cd ../applicant && npm run build

# Production build for Hospital
cd ../hospital && npm run build
```

---

## 🔒 Security, Privacy & Compliance Guidelines

1. **DISHA & ABDM Compliance**: Fully compliant with the *Digital Information Security in Healthcare Act (DISHA)* and National Digital Health Mission standards.
2. **Consent-Driven Architecture**: Medical histories can only be accessed with explicit citizen OTP approval or physical card presentation.
3. **Emergency Break-Glass Protocol**: Emergency physicians can bypass standard consent for unconscious patients; every break-glass access triggers immediate SMS alerts to registered emergency contacts and logs immutable audit trails.
4. **Hygienic Repository Practices**: All secrets, private keys, environment files (`.env*`), and sensitive documents are excluded via `.gitignore`.

---

## 📄 License & Attribution

Distributed under the **MIT License**. Maintained for the sovereign digital public infrastructure of India.  
For technical inquiries, contributions, or institutional onboarding, please submit an issue or pull request to the repository.
