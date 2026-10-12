# Official Indian Physical HealthCard Design System (CR80 Portrait PVC)

Designed for the **National Health Authority (NHA)**, **Ministry of Health & Family Welfare (MoHFW)**, and **Ayushman Bharat Digital Mission (ABDM)** ecosystem.

Modelled directly after authentic Indian official identity cards with **zero AI/synthetic face clutter**, incorporating **genuine vector emblems sourced from Wikimedia Commons and official Indian government specifications**, focusing on **official credibility, tangible physical realism, anti-counterfeit security patterns, and emergency clinical utility**.

---

## 1. Physical Specifications (ISO/IEC 7810 ID-1 / CR80 Portrait)

| Specification | Metric Value | Imperial / Screen Value |
|---|---|---|
| **Width** | 53.98 mm | 2.125 inches (350px display scale) |
| **Height** | 85.60 mm | 3.370 inches (554px display scale) |
| **Orientation** | Portrait (Vertical) | CR80 ID-1 Standard vertical format |
| **Thickness** | 0.76 mm | 30 mil (Standard PVC smart card) |
| **Corner Radius** | 3.18 mm | 14px display corner radius |
| **Material Base** | Polyvinyl Chloride (PVC) / PETG Composite | High-durability laminated plastic with protective anti-scratch overlay |

---

## 2. Authentic Government Vector Assets

All assets are 100% authentic, high-resolution vector SVGs:

1. **State Emblem of India (`emblem-of-india.svg`)**:
   - Official Ashoka Lion Capital with *सत्यमेव जयते* motto inscribed below in Devanagari script.
   - Sourced from [Wikimedia Commons: File:Emblem_of_India.svg](https://commons.wikimedia.org/wiki/File:Emblem_of_India.svg).
2. **Ministry of Health & Family Welfare Seal (`ministry-of-health-india.svg`)**:
   - Official MoHFW circular authority seal with dual-language laurel ring text.
   - Sourced from [Wikimedia Commons: File:Ministry_of_Health_India.svg](https://commons.wikimedia.org/wiki/File:Ministry_of_Health_India.svg).
3. **Ashoka Chakra (`ashoka-chakra.svg`)**:
   - Authentic 24-spoke Dharma Chakra in navy blue (`#000080`), positioned as a central security watermark.
   - Sourced from [Wikimedia Commons: File:Ashoka_Chakra.svg](https://commons.wikimedia.org/wiki/File:Ashoka_Chakra.svg).
4. **Rod of Asclepius (`rod-of-asclepius.svg`)**:
   - Universal medical staff symbol with entwined serpent.
   - Sourced from [Wikimedia Commons: File:Rod_of_Asclepius2.svg](https://commons.wikimedia.org/wiki/File:Rod_of_Asclepius2.svg).
5. **Contactless NFC Transmission Symbol (`nfc-wave-black.svg`)**:
   - Standard 4-wave contactless smart transmission arc symbol (ISO 14443).
   - Modeled after CityPNG contactless icon.
6. **Multi-Color Guilloche Rosette Lathe (`guilloche-portrait-bg.svg`)**:
   - Intricate mathematical spirograph lathe rosette curves in fine pastel cyan, soft saffron, emerald green, and light purple security inks to eliminate empty dead space and provide banknote-grade anti-counterfeiting.

---

## 3. Card Anatomy & Layout

### Front Face
- **Top Deep Teal Header**: Deep teal (`#0d4d42`) with MoHFW seal on the left, bilingual titles `राष्ट्रीय स्वास्थ्य कार्ड / NATIONAL HEALTH CARD` in center, and State Emblem of India on the right with *सत्यमेव जयते*.
- **Tricolor Accent Ribbon**: Saffron (`#F97316`), White, and Green (`#138808`) hairline band.
- **10-Digit Health ID Box**: Highlighted green bordered pill box with 5–5 partitioned format (`12345 - 67890`) + Contactless NFC wave icon.
- **Left Demographics Column**: Citizen Name, DOB, Gender, and Card Serial Number.
- **Right Emergency Column**:
  - **BIG Framed Blood Group Box**: Distinct red border (`#B91C1C`) with extra-large bold red type (`O+`).
  - **Dedicated Square QR Code Housing**: Real-time auto-generated 2D QR Code matching that exact Health ID.
- **Zero AI Face Clutter**: Real Indian health cards in this format do not display citizen face photos, prioritizing clean readability.
- **Anti-Counterfeit Background**: Delicate Guilloche waves, 24-spoke Ashoka Chakra watermark, and microtext perimeter border.

### Back Face
- **Top Header**: `महत्वपूर्ण निर्देश / IMPORTANT INSTRUCTIONS`.
- **4 Official Statutory Guidelines** (Hindi & English):
  1. यह कार्ड केवल स्वास्थ्य सेवाओं के लिए है। / This card is for healthcare services only.
  2. खोने पर हेल्पलाइन को सूचित करें। / Inform helpline immediately if lost.
  3. यह कार्ड अहस्तांतरणीय है। / This card is non-transferable.
  4. आपातकाल में QR कोड स्कैन करें। / Scan QR code in emergency for medical info.
- **Middle Tricolor Divider Ribbon**.
- **Signatory & Helpline Section**:
  - National Health Authority seal + Authorized Signatory / Director (`निदेशक / Director`).
  - 24x7 Helpline `104` / `1800-890-4325` and portal `www.nha.gov.in`.
- **High-Density Linear Barcode**: Code 128 barcode simulation + Serial No (`SERIAT6543210`).
- **Bottom Tricolor Stripe**.

---

## 4. Admin Panel & Dynamic Issuance Integration

- **Live QR Auto-Generation**: Bundled standalone client QR generator (`scripts/qrcode.min.js`) automatically encodes the citizen's verification payload in real-time as data is entered.
- **Empty Template Mode**: Clicking "Make Card Empty (Template Mode)" switches the card into an unpopulated pre-printed template with clean dashed entry slots (`_ _ _ _ _ - _ _ _ _ _`, `[NAME]`, `DD/MM/YYYY`, `—`), ready for dynamic personalization in the Admin Issuance Wizard.
- **Print Ready (1:1 Scale)**: CSS print rules formatted to exactly 53.98mm × 85.60mm for dye-sublimation PVC card printers or standard A4 card laminators.

---

## 5. File Architecture

```
card-design/
├── README.md                      # Comprehensive design specification
├── index.html                     # Interactive physical showcase & Admin simulator
├── styles/
│   └── card.css                   # Portrait CR80 CSS, Guilloche styles & print rules
├── scripts/
│   ├── healthCardRenderer.js      # Dynamic JS class for Admin / Applicant card rendering
│   └── qrcode.min.js              # Bundled standalone QR code generation engine
├── cards/
│   ├── healthcard-front.svg       # Standalone 630×1000 print-ready vector file (FRONT)
│   └── healthcard-back.svg        # Standalone 630×1000 print-ready vector file (BACK)
└── assets/
    ├── emblem-of-india.svg        # Authentic Ashoka Lion Capital (Wikimedia)
    ├── ministry-of-health-india.svg# Authentic MoHFW official seal (Wikimedia)
    ├── ashoka-chakra.svg          # 24-spoke Dharma Chakra (Wikimedia)
    ├── rod-of-asclepius.svg       # Medical staff vector (Wikimedia)
    ├── nfc-wave-black.svg         # Contactless transmission icon
    ├── guilloche-portrait-bg.svg  # Multi-color rosette security background (Img 2)
    └── guilloche-rosette-security.svg# Concentric Guilloche lathe pattern
```
