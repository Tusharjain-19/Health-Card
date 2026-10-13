# Official Indian National HealthCard (ABDM / MoHFW) Design System

Master specifications for the official **National Health Card**, aligned with the Ministry of Health & Family Welfare (MoHFW), National Health Authority (NHA), and Ayushman Bharat Digital Mission (ABDM).

---

## 1. Master Design Templates

The definitive design for the National Health Card is established by:
- **Master Vector File**: `HEALTH CARD.pdf`
- **Official Front Face**: `cards/1.png` (1050 × 600 px, Aspect Ratio 1.75 / 7:4)
- **Official Back Face**: `cards/2.png` (1050 × 600 px, Aspect Ratio 1.75 / 7:4)

All static design components (State Emblem of India, Ministry of Health and Family Welfare bilingual heading, decorative Tiranga wave, Rod of Asclepius, central Ashoka Chakra watermark, contactless wave symbol, pre-printed field labels, QR code framing brackets, and back statutory guidelines) are integrated directly into the master templates.

---

## 2. Dynamic Overlay Geometry

Dynamic personalization overlays are positioned using percentage coordinates relative to the 1050 × 600 canvas:

### Front Face (`cards/1.png`)
| Element | Left | Top | Width | Height | Format / Notes |
|---|---|---|---|---|---|
| **Citizen Photo** | 3.9% | 35.1% | 17.0% | 38.5% | `img` or fallback silhouette |
| **Full Name** | 37.0% | 35.5% | — | — | Bold uppercase |
| **Date of Birth** | 30.5% | 42.5% | — | — | DD-MM-YYYY |
| **Gender** | 39.0% | 49.0% | — | — | MALE / FEMALE / OTHER |
| **Blood Group** | 28.5% | 59.2% | 12.0% | 5.5% | Blood group badge (e.g. O+ POS) |
| **Health ID (10 digits)** | 37.5% | 71.8% | — | — | Directly under label: `XXXXX XXXXX` |
| **Front QR Code** | 76.6% | 35.0% | 16.4% | 28.7% | 2D QR Code within green corner brackets |

### Back Face (`cards/2.png`)
| Element | Left | Top | Width | Height | Format / Notes |
|---|---|---|---|---|---|
| **Permanent Address** | 23.5% | 32.5% | 50.0% | auto | Multiline street, city, state, pin |
| **Emergency Contact** | 32.0% | 62.2% | — | — | Mobile phone number with +91 |
| **Organ Donor Pledge** | 24.5% | 69.8% | — | — | YES / NO pledge status |
| **Hospital Triage QR** | 76.6% | 35.0% | 16.4% | 25.0% | Encrypted medical emergency triage payload |

---

## 3. High-Resolution Export Engine

Export functions in `HealthCardRenderer`:
- `HealthCardRenderer.renderCard(data, face, options)`: Returns responsive HTML markup with container-query font scaling.
- `HealthCardRenderer.exportCardCanvas(data, face, options)`: Generates high-res 1050 × 600 PNG.
- `HealthCardRenderer.exportDualCompositeCanvas(data, options)`: Generates high-res 2200 × 700 dual-sided printable card PNG with Front & Back side by side.
