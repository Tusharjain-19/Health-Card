# Official Indian Physical HealthCard Design System (CR80 PVC)

Designed for the **National Health Authority (NHA)** & **Ayushman Bharat Digital Mission (ABDM)** ecosystem.

Inspired by authentic Indian government identity documents (Aadhaar, CGHS, Ayushman Bharat PM-JAY, Driving License) with **zero flashy futuristic / synthwave tropes**, focusing on **official credibility, tangible physical realism, and clinical emergency utility**.

---

## 1. Physical Specifications (ISO/IEC 7810 ID-1 / CR80)

| Specification | Metric Value | Imperial / Screen Value |
|---|---|---|
| **Width** | 85.60 mm | 3.370 inches (520px standard display) |
| **Height** | 53.98 mm | 2.125 inches (328px standard display) |
| **Thickness** | 0.76 mm | 30 mil (Standard PVC smart card) |
| **Corner Radius** | 3.18 mm | Approx 12px–14px corner radius |
| **Aspect Ratio** | 1.5858 : 1 | Universal credit card / Aadhaar PVC ratio |
| **Material Base** | Polyvinyl Chloride (PVC) / PETG Composite | High-durability laminated plastic with protective anti-scratch overlay |

---

## 2. Front Face Anatomy & Security Features

The front of the card is structured into 3 distinct functional zones to eliminate personal clutter while providing maximum emergency clinical visibility:

### 1. Official National Identity Header
- **Subtle Tricolor Accent Ribbon**: Saffron (`#F97316`), White, and India Green (`#047857`) hairline security thread.
- **Official Dual-Language Title**: 
  - `राष्ट्रीय स्वास्थ्य प्राधिकरण • भारत सरकार`
  - `NATIONAL HEALTH AUTHORITY • GOVERNMENT OF INDIA`
  - `HEALTHCARD DIGITAL IDENTITY SYSTEM`
- **National Health Authority Emblem**: Combines the Ashoka Lion/Chakra authority motif with the clinical Asclepius rod and red emergency medical cross.
- **Optically Variable Device (OVD) Hologram**: Rainbow diffractive foil security seal with microtext `SECURE • NHA`.
- **Contactless NFC Smart Transmission Waves**: Official ISO/IEC 14443 symbol.

### 2. Patient Identity & Critical Emergency Data (Zero Clutter)
- **Official Citizen Name**: Large, authoritative uppercase format with Devanagari transliteration (`RAHUL SHARMA / राहुल शर्मा`).
- **Compact DOB & Gender**: `जन्म तिथि / DOB: 14/08/1992 | लिंग / GENDER: MALE / पुरूष`.
- **NO Plaintext Mobile Number or Full Residential Address on Front**: Preserves citizen privacy during routine physical display (Section 8 DPDP Act compliance).

### 3. BIG High-Visibility Emergency Blood Group
- **First-Responder Life-Saving Priority**: In trauma resuscitation, paramedics need the patient's blood type in 1 second.
- **Design**: Distinct clinical emergency red pill (`#B91C1C`) with an emergency droplet icon, white clinical border, and extra-large bold type: `BLOOD GROUP • O+ POSITIVE`.

### 4. 10-Digit National Health ID in 5–5 Partition
- **Partitioned Format**: Exactly 5 digits + space + 5 digits (`48291 73019`).
- **Monospace Typography**: Rendered in `JetBrains Mono` inside a dedicated pale-mint security housing with center alignment divider.

### 5. Dedicated High-Contrast 2D QR Code Matrix
- **Dedicated Square Enclosure**: 96×96 clean white boundary with anti-glare spacing.
- **Optical Scanner Alignment Corners**: Bold green corner brackets that enable instant camera autofocus locking even under dim ambulance or trauma ward lighting.
- **Payload**: Tokenized, encrypted pointer resolving to the patient's emergency allergy and EHR profile on ABDM gateway.

### 6. Anti-Counterfeiting Background Patterns
- **Multi-Wave Guilloche Lathe Grid**: Mathematical sine and cosine harmonic curves etched at 6% opacity across the PVC substrate.
- **Ashoka Dharma Chakra Watermark**: Central 24-spoke wheel faintly visible through the center of the card.
- **Laser-Engraved Serial Tracking**: Unique card serial printed along the bottom edge (`№ HC-IND-2026-9481028-IN`).
- **Microtext Security Line**: Hairline band containing repetitive micro-printing:
  `• भारत सरकार • GOVERNMENT OF INDIA • NATIONAL HEALTH AUTHORITY • HEALTHCARD SECURE CITIZEN ID •`

---

## 3. Back Face Anatomy & Hospital Instructions

1. **HiCo Magnetic Stripe**: Standard ISO 7811 high-coercivity stripe across the upper back for magnetic card swipe terminals.
2. **Authorized Signature / Digital Embed Panel**: White tamper-evident signing panel with CVC security verification code (`729`).
3. **Statutory Hospital & Clinician Instructions**: Clear guidelines in Hindi and English explaining encrypted data handling and return procedure.
4. **Emergency Next-of-Kin Contact & Jurisdiction**: Spouse/Parent emergency contact name and phone number (`+91 98765 43210`) plus state jurisdiction.
5. **Government Digital Certification Stamp**: Cryptographic SHA-256 / RSA-4096 issuance badge and 24x7 toll-free health helpline (`1800-11-4477`).

---

## 4. Directory Structure of Design Assets

```
card-design/
├── README.md                      # This comprehensive design specification
├── index.html                     # Interactive 3D flip card showcase & live inspector
├── styles/
│   └── card.css                   # Realistic physical PVC card CSS & print styles
├── cards/
│   ├── healthcard-front.svg       # Standalone 1000×630 print-ready vector file (FRONT)
│   └── healthcard-back.svg        # Standalone 1000×630 print-ready vector file (BACK)
└── assets/
    ├── national-health-emblem.svg # Official NHA healthcare authority emblem
    ├── guilloche-security-bg.svg  # Anti-counterfeit mathematical guilloche pattern
    ├── ashoka-chakra-watermark.svg# 24-Spoke Dharma Chakra watermark vector
    ├── holographic-security-seal.svg # Metallic optical hologram foil patch
    ├── nfc-contactless-symbol.svg # ISO 14443 contactless smart card wave symbol
    ├── blood-group-badge.svg      # High-visibility emergency clinical blood badge
    ├── tricolor-security-ribbon.svg # Indian Saffron-White-Green micro-band
    └── qr-code-frame.svg          # QR code security frame with alignment brackets
```

---

## 5. Color Palette Tokens

| Name | Hex Code | Purpose |
|---|---|---|
| **India Green (Primary)** | `#047857` / `#064E3B` | Official authority headers, emblem, borders |
| **Deep Saffron (Kesari)** | `#F97316` | Top & bottom security ribbon accent |
| **Emergency Blood Red** | `#B91C1C` / `#DC2626` | High-visibility emergency blood group badge |
| **Dharma Chakra Navy** | `#000080` | Watermark, central hub, microtext hairline |
| **Pale Mint Tint** | `#F0FDF4` | Health ID housing & biometric verify pills |
| **PVC Substrate Base** | `#FCFDFD` | Genuine laminated off-white card core |
| **Text Dark (Headings)** | `#0F172A` | Patient name, Health ID numbers, serials |
| **Text Secondary** | `#334155` | Devanagari labels, instructions |
