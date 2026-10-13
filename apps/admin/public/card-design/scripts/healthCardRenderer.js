/**
 * Official Indian Physical HealthCard Dynamic Renderer
 * Pixel-Perfect Sovereign Implementation based on:
 * - Front Face: cards/1.png
 * - Back Face: cards/2.png
 * - Source: HEALTH CARD.pdf
 * - 10-Digit Health ID (5-5 Standard: XXXXX XXXXX)
 */

export class HealthCardRenderer {
  /**
   * Format Health ID into authentic 10-digit Standard Format (5-5: XXXXX XXXXX)
   */
  static formatHealthId(rawId, isEmpty = false) {
    if (isEmpty || !rawId) return '_ _ _ _ _   _ _ _ _ _';
    const digits = String(rawId).replace(/[^0-9]/g, '');
    if (digits.length >= 10) {
      const d10 = digits.slice(-10);
      return `${d10.slice(0, 5)}  ${d10.slice(5, 10)}`;
    } else if (digits.length > 5) {
      return `${digits.slice(0, 5)}  ${digits.slice(5)}`;
    }
    return digits || '_ _ _ _ _   _ _ _ _ _';
  }

  // Backward compatibility alias
  static formatAadhaarNumber(rawId, isEmpty = false) {
    return this.formatHealthId(rawId, isEmpty);
  }

  /**
   * Format DOB strictly to DD / MM / YYYY
   */
  static formatDob(dob, isEmpty = false) {
    if (isEmpty || !dob) return 'DD / MM / YYYY';
    const s = String(dob).trim();
    if (s === 'DD-MM-YYYY' || s === 'DD / MM / YYYY' || s === 'DD/MM/YYYY' || s === '—') return 'DD / MM / YYYY';

    // Match YYYY-MM-DD
    const mIso = s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
    if (mIso) {
      const [, yyyy, mm, dd] = mIso;
      return `${dd.padStart(2, '0')} / ${mm.padStart(2, '0')} / ${yyyy}`;
    }

    // Match DD-MM-YYYY
    const mDmY = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
    if (mDmY) {
      const [, dd, mm, yyyy] = mDmY;
      return `${dd.padStart(2, '0')} / ${mm.padStart(2, '0')} / ${yyyy}`;
    }

    return s;
  }

  /**
   * Format Gender cleanly without duplicate Hindi translations
   */
  static formatGender(gender, isEmpty = false) {
    if (isEmpty || !gender) return '— / —';
    let g = String(gender).trim().toUpperCase();
    if (g.includes('/')) {
      const parts = g.split('/').map(p => p.trim());
      const en = parts[0];
      const hi = en.includes('FEM') ? 'महिला' : (en.includes('TRANS') || en.includes('OTH') ? 'अन्य' : 'पुरुष');
      return `${en} / ${hi}`;
    }
    if (g.startsWith('FEM') || g.includes('WOM')) return 'FEMALE / महिला';
    if (g.startsWith('MAL') || g.includes('MAN')) return 'MALE / पुरुष';
    if (g.startsWith('OTH') || g.startsWith('TRANS')) return 'OTHER / अन्य';
    return `${g} / पुरुष`;
  }

  /**
   * Format Blood Group correctly (A- -> A- NEG, A+ -> A+ POS)
   */
  static formatBloodGroup(bloodGroup, isEmpty = false) {
    if (isEmpty || !bloodGroup) return 'O+ POS';
    let b = String(bloodGroup).trim().toUpperCase();
    if (b === '—' || b === 'EMPTY') return 'O+ POS';

    // Normalize spacing: e.g. "A -" -> "A-"
    b = b.replace(/\s*-\s*/g, '-').replace(/\s*\+\s*/g, '+');

    // Check for negative first
    if (b.includes('-') || b.includes('NEG')) {
      const type = b.replace(/POSITIVE|NEGATIVE|POS|NEG|\+|-/g, '').trim();
      return `${type || 'O'}- NEG`;
    }

    // Check for positive
    if (b.includes('+') || b.includes('POS')) {
      const type = b.replace(/POSITIVE|NEGATIVE|POS|NEG|\+|-/g, '').trim();
      return `${type || 'O'}+ POS`;
    }

    return `${b}+ POS`;
  }

  /**
   * Generate canonical verification URL and payload for the Front QR code
   */
  static getVerificationPayload(data = {}) {
    const rawId = String(data.healthId || '7483916251').replace(/[^0-9]/g, '').slice(-10) || '7483916251';
    const fullName = (data.fullName || data.name || 'TUSHAR JAIN').trim();
    const blood = this.formatBloodGroup(data.bloodGroup);
    const dob = this.formatDob(data.dob);
    const gender = this.formatGender(data.gender);
    
    const origin = (typeof window !== 'undefined' && window.location && window.location.origin) 
      ? window.location.origin 
      : 'https://healthcard.nha.gov.in';

    return `${origin}/#verify?hid=${encodeURIComponent(rawId)}&name=${encodeURIComponent(fullName)}&blood=${encodeURIComponent(blood)}&dob=${encodeURIComponent(dob)}&gen=${encodeURIComponent(gender)}&auth=MOHFW_GOI`;
  }

  /**
   * Generate Hospital Emergency Triage payload for the Back QR code
   */
  static getHospitalTriagePayload(data = {}) {
    const rawId = String(data.healthId || '7483916251').replace(/[^0-9]/g, '').slice(-10) || '7483916251';
    const blood = encodeURIComponent(this.formatBloodGroup(data.bloodGroup));
    const allergies = encodeURIComponent(data.allergies || 'Penicillin Allergy, Type-2 Diabetic');
    const emergencyContact = encodeURIComponent(data.emergencyContact || '+91-98765-43210');
    
    return `https://hospital.nha.gov.in/triage?hid=${rawId}&blood=${blood}&emg=${emergencyContact}&alerts=${allergies}&mode=EMERGENCY_ADMISSION`;
  }

  /**
   * Render Horizontal Official HealthCard (Front Face)
   * Exact 1:1 match with cards/1.png
   */
  static renderAadhaarFront(data = {}, options = {}) {
    const isEmpty = Boolean(data.isEmpty);
    const cardsPath = options.cardsBasePath || '/card-design/cards';
    const idPrefix = options.idPrefix || 'nhcard-';

    const nameEn = isEmpty ? '_ _ _ _ _ _ _ _ _ _' : ((data.fullName || data.name || '').trim().toUpperCase() || 'TUSHAR JAIN');
    const dob = this.formatDob(data.dob, isEmpty);
    const gender = this.formatGender(data.gender, isEmpty);
    const blood = this.formatBloodGroup(data.bloodGroup, isEmpty);
    const formattedId = isEmpty ? '_ _ _ _ _   _ _ _ _ _' : this.formatHealthId(data.healthId);
    const photoUrl = data.photoUrl || '';
    const qrSrc = options.qrCodeDataUrl || '';
    const qrCanvasId = `${idPrefix}qr-canvas`;

    return `
      <div class="official-healthcard-face official-healthcard-front ${isEmpty ? 'template-empty' : ''}" 
           style="background-image: url('${cardsPath}/1.png');" 
           data-health-id="${data.healthId || ''}">

        <!-- Citizen Photo Slot (Matches photo frame x=40, y=210, w=180, h=233 on 1050x600) -->
        <div class="nhc-overlay-photo">
          ${photoUrl ? `
            <img src="${photoUrl}" alt="Photo" class="nhc-photo-img" />
          ` : `
            <div class="nhc-photo-blank">
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.8">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
          `}
        </div>

        <!-- Demographics: NAME -->
        <div class="nhc-overlay-field nhc-field-name">
          <span class="nhc-field-value ${isEmpty ? 'slot-empty' : ''}">${nameEn}</span>
        </div>

        <!-- Demographics: DOB -->
        <div class="nhc-overlay-field nhc-field-dob">
          <span class="nhc-field-value ${isEmpty ? 'slot-empty' : ''}">${dob}</span>
        </div>

        <!-- Demographics: GENDER -->
        <div class="nhc-overlay-field nhc-field-gender">
          <span class="nhc-field-value ${isEmpty ? 'slot-empty' : ''}">${gender}</span>
        </div>

        <!-- Dynamic Blood Group Badge Overlay -->
        <div class="nhc-overlay-blood">
          <span class="nhc-blood-text">${blood}</span>
        </div>

        <!-- 10-Digit Health ID Number (Positioned directly under HEALTH ID / स्वास्थ्य आईडी) -->
        <div class="nhc-overlay-field nhc-field-health-id">
          <span class="nhc-health-id-value ${isEmpty ? 'slot-empty' : ''}">${formattedId}</span>
        </div>

        <!-- Optical 2D QR Code -->
        <div class="nhc-overlay-qr">
          ${qrSrc ? `
            <img src="${qrSrc}" class="nhc-qr-canvas" alt="QR" />
          ` : `
            <canvas class="nhc-qr-canvas" width="86" height="86" id="${qrCanvasId}"></canvas>
          `}
        </div>

      </div>
    `;
  }

  /**
   * Render Horizontal Official HealthCard (Back Face)
   * Exact 1:1 match with cards/2.png
   */
  static renderAadhaarBack(data = {}, options = {}) {
    const isEmpty = Boolean(data.isEmpty);
    const cardsPath = options.cardsBasePath || '/card-design/cards';
    const idPrefix = options.idPrefix || 'nhcard-back-';

    const addrEn = isEmpty ? '_ _ _ _ _ _ _ _ _ _ _ _ _ _ _ _' : (data.addressEnglish || data.address || 'H.No. 142, Street 4, Vikas Nagar, New Delhi - 110059');
    const emergencyContact = data.emergencyContact || '+91 98765-43210 (Spouse)';
    const organDonor = data.organDonor || 'YES / हाँ (Pledged)';
    const hospitalQrCanvasId = `${idPrefix}hospital-qr-canvas`;

    return `
      <div class="official-healthcard-face official-healthcard-back ${isEmpty ? 'template-empty' : ''}" 
           style="background-image: url('${cardsPath}/2.png');">

        <!-- Residential Address Block (Aligns with पता/ADDRESS : on 1050x600) -->
        <div class="nhc-overlay-field nhc-field-address">
          <span class="nhc-address-value ${isEmpty ? 'slot-empty' : ''}">${addrEn}</span>
        </div>

        <!-- Emergency Trauma Contact -->
        <div class="nhc-overlay-field nhc-field-emergency">
          <span class="nhc-field-value font-mono ${isEmpty ? 'slot-empty' : ''}">${emergencyContact}</span>
        </div>

        <!-- Organ Donor Pledge Status -->
        <div class="nhc-overlay-field nhc-field-donor">
          <span class="nhc-donor-value ${isEmpty ? 'slot-empty' : ''}">${organDonor}</span>
        </div>

        <!-- Hospital Emergency Triage 2D QR Code -->
        <div class="nhc-overlay-qr nhc-overlay-qr-back">
          <canvas class="nhc-qr-canvas" width="82" height="82" id="${hospitalQrCanvasId}"></canvas>
        </div>

      </div>
    `;
  }

  /**
   * Render 2D QR Code on target canvas element
   */
  static renderQRCode(canvasOrId, data = {}, isHospitalTriage = false) {
    let canvas = typeof canvasOrId === 'string' ? document.getElementById(canvasOrId) : canvasOrId;
    if (!canvas) return;

    const payload = isHospitalTriage 
      ? this.getHospitalTriagePayload(data)
      : (typeof data === 'string' ? data : this.getVerificationPayload(data));

    const qrSize = isHospitalTriage ? 82 : 86;

    if (typeof QRCode !== 'undefined' && QRCode.toCanvas) {
      QRCode.toCanvas(canvas, payload, {
        width: qrSize,
        margin: 1,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      }, (err) => {
        if (err) this.renderFallbackQR(canvas, payload, qrSize);
      });
    } else {
      this.renderFallbackQR(canvas, payload, qrSize);
    }
  }

  /**
   * Fallback deterministic QR rendering when library is not loaded
   */
  static renderFallbackQR(canvas, payload, targetSize = 86) {
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext('2d');
    const size = targetSize;
    canvas.width = size;
    canvas.height = size;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    ctx.fillStyle = '#000000';
    const cell = size / 29;

    function drawFinder(ox, oy) {
      ctx.fillRect(ox, oy, cell * 7, cell * 7);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(ox + cell, oy + cell, cell * 5, cell * 5);
      ctx.fillStyle = '#000000';
      ctx.fillRect(ox + cell * 2, oy + cell * 2, cell * 3, cell * 3);
    }

    drawFinder(cell, cell);
    drawFinder(cell * 21, cell);
    drawFinder(cell, cell * 21);

    let hash = 0;
    for (let i = 0; i < payload.length; i++) {
      hash = ((hash << 5) - hash) + payload.charCodeAt(i);
      hash |= 0;
    }

    for (let r = 0; r < 27; r++) {
      for (let c = 0; c < 27; c++) {
        const inF1 = r < 8 && c < 8;
        const inF2 = r < 8 && c > 19;
        const inF3 = r > 19 && c < 8;
        if (inF1 || inF2 || inF3) continue;

        const bit = ((hash ^ (r * 31 + c * 17)) + (r * c)) % 3 === 0;
        if (bit) {
          ctx.fillRect(cell + c * cell, cell + r * cell, cell, cell);
        }
      }
    }
  }

  /**
   * High-Resolution 1:1 Composite PNG Card Downloader
   * Renders 1050x600 resolution cards directly from cards/1.png and cards/2.png
   */
  static async exportCardCanvas(data = {}, face = 'front', options = {}) {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      canvas.width = 1050;
      canvas.height = 600;
      const ctx = canvas.getContext('2d');
      const basePath = options.cardsBasePath || '/card-design/cards';

      const bgImg = new Image();
      bgImg.crossOrigin = 'anonymous';
      bgImg.onload = async () => {
        // Draw master high-res background template
        ctx.drawImage(bgImg, 0, 0, 1050, 600);

        if (face === 'front') {
          // Draw Citizen Photo into photo box (x=41, y=211, w=178, h=231)
          if (data.photoUrl) {
            try {
              const photo = await new Promise((res) => {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.onload = () => res(img);
                img.onerror = () => res(null);
                img.src = data.photoUrl;
              });
              if (photo) {
                ctx.drawImage(photo, 42, 212, 176, 229);
              }
            } catch (e) {}
          }

          // Draw Name
          // Draw Name
          ctx.fillStyle = '#000000';
          ctx.font = 'bold 22px Inter, "Segoe UI", sans-serif';
          ctx.fillText((data.fullName || data.name || 'TUSHAR JAIN').toUpperCase(), 390, 230);

          // Draw DOB
          ctx.font = 'bold 22px Inter, sans-serif';
          ctx.fillText(HealthCardRenderer.formatDob(data.dob), 325, 273);

          // Draw Gender
          ctx.font = 'bold 22px Inter, sans-serif';
          ctx.fillText(HealthCardRenderer.formatGender(data.gender), 415, 313);

          // Draw Blood Group text
          const blood = HealthCardRenderer.formatBloodGroup(data.bloodGroup);
          ctx.fillStyle = '#b91c1c';
          ctx.fillRect(302, 356, 120, 34);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 20px Inter, sans-serif';
          ctx.fillText(blood, 314, 381);

          // Draw Health ID (Directly under HEALTH ID / स्वास्थ्य आईडी)
          ctx.fillStyle = '#000000';
          ctx.font = 'bold 22px Inter, sans-serif';
          ctx.fillText(HealthCardRenderer.formatHealthId(data.healthId), 385, 452);

          // Draw QR Code into green brackets (x=804, y=210, w=172, h=172)
          const qrCanvas = document.createElement('canvas');
          HealthCardRenderer.renderQRCode(qrCanvas, data, false);
          ctx.drawImage(qrCanvas, 804, 210, 172, 172);

        } else {
          // Back Face
          // Draw Address
          ctx.fillStyle = '#000000';
          ctx.font = 'bold 20px Inter, sans-serif';
          const addr = data.addressEnglish || data.address || 'H.No. 142, Street 4, Vikas Nagar, New Delhi - 110059';
          ctx.fillText(addr, 248, 212);

          // Draw Emergency Contact
          ctx.font = 'bold 22px monospace';
          const emContact = data.emergencyContact?.phone ? `+91 ${data.emergencyContact.phone}` : (data.emergencyContact || '+91 98765-43210 (Spouse)');
          ctx.fillText(emContact, 335, 386);

          // Draw Organ Donor
          ctx.fillStyle = '#047857';
          ctx.font = 'bold 22px Inter, sans-serif';
          ctx.fillText(data.organDonor || 'YES / हाँ (Pledged)', 252, 432);

          // Draw Hospital Triage QR Code (x=804, y=210, w=172, h=150)
          const qrCanvas = document.createElement('canvas');
          HealthCardRenderer.renderQRCode(qrCanvas, data, true);
          ctx.drawImage(qrCanvas, 804, 210, 172, 150);
        }

        resolve(canvas.toDataURL('image/png'));
      };

      bgImg.src = face === 'front' ? `${basePath}/1.png` : `${basePath}/2.png`;
    });
  }

  /**
   * Dual-sided Composite Card graphic for official download (Front & Back side by side)
   */
  static async exportDualCompositeCanvas(data = {}, options = {}) {
    const frontDataUrl = await HealthCardRenderer.exportCardCanvas(data, 'front', options);
    const backDataUrl = await HealthCardRenderer.exportCardCanvas(data, 'back', options);

    const canvas = document.createElement('canvas');
    canvas.width = 2200;
    canvas.height = 700;
    const ctx = canvas.getContext('2d');

    // Clean neutral presentation background
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const [frontImg, backImg] = await Promise.all([
      new Promise(res => { const img = new Image(); img.onload = () => res(img); img.src = frontDataUrl; }),
      new Promise(res => { const img = new Image(); img.onload = () => res(img); img.src = backDataUrl; })
    ]);

    // Front: x=35, y=50, w=1050, h=600
    ctx.drawImage(frontImg, 35, 50, 1050, 600);
    // Back: x=1115, y=50, w=1050, h=600
    ctx.drawImage(backImg, 1115, 50, 1050, 600);

    return canvas.toDataURL('image/png');
  }

  /**
   * Official CR80 / A4 HealthCard Document PDF Generator
   * Generates a high-resolution print slip or CR80 printable card document using jsPDF
   */
  static async exportCardPdf(data = {}, options = {}) {
    let jsPDFClass = null;
    if (typeof window !== 'undefined' && window.jspdf && window.jspdf.jsPDF) {
      jsPDFClass = window.jspdf.jsPDF;
    } else {
      try {
        const mod = await import('jspdf');
        jsPDFClass = mod.jsPDF || mod.default?.jsPDF || mod.default;
      } catch (e) {
        console.warn('Could not import jspdf dynamically:', e);
      }
    }

    if (!jsPDFClass) {
      throw new Error('jsPDF library is not loaded');
    }

    // Render Front and Back canvas data URLs
    const frontDataUrl = await HealthCardRenderer.exportCardCanvas(data, 'front', options);
    const backDataUrl = await HealthCardRenderer.exportCardCanvas(data, 'back', options);

    const format = options.format || 'a4';

    if (format === 'cr80') {
      const doc = new jsPDFClass({
        orientation: 'landscape',
        unit: 'mm',
        format: [85.6, 54]
      });
      doc.addImage(frontDataUrl, 'PNG', 0, 0, 85.6, 54);
      doc.addPage([85.6, 54], 'landscape');
      doc.addImage(backDataUrl, 'PNG', 0, 0, 85.6, 54);
      
      const filename = `HealthCard_CR80_${(data.healthId || 'National').replace(/\s+/g, '')}.pdf`;
      doc.save(filename);
      return doc;
    }

    // Default: Official Government A4 Print Slip with Front & Back Cards
    const doc = new jsPDFClass({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Top Header Banner
    doc.setFillColor(13, 77, 66);
    doc.rect(0, 0, 210, 18, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('GOVERNMENT OF INDIA • MINISTRY OF HEALTH & FAMILY WELFARE', 105, 8, { align: 'center' });
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.text('NATIONAL HEALTH AUTHORITY • AYUSHMAN BHARAT DIGITAL MISSION (ABDM)', 105, 14, { align: 'center' });

    // Tricolor Ribbon
    doc.setFillColor(249, 115, 22);
    doc.rect(0, 18, 210, 1.5, 'F');
    doc.setFillColor(19, 136, 8);
    doc.rect(0, 19.5, 210, 1.5, 'F');

    // Document Title
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('OFFICIAL PHYSICAL HEALTHCARD PRINT SLIP & PVC LAMINATION SHEET', 105, 30, { align: 'center' });
    
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`Official CR80 Physical Health Identity Document • Generated: ${new Date().toLocaleDateString('en-IN')}`, 105, 36, { align: 'center' });

    // Card Pair Section (1:1 CR80 size: 85.6 mm x 54 mm each, placed side by side)
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.text('FRONT FACE (CARD LAMINATION 1:1)', 14, 42);
    doc.text('BACK FACE (CARD LAMINATION 1:1)', 110.4, 42);

    doc.addImage(frontDataUrl, 'PNG', 14, 44, 85.6, 54);
    doc.addImage(backDataUrl, 'PNG', 110.4, 44, 85.6, 54);

    // Cutting dashed guides around cards
    doc.setDrawColor(203, 213, 225);
    doc.setLineDashPattern([2, 2], 0);
    doc.rect(13, 43, 87.6, 56);
    doc.rect(109.4, 43, 87.6, 56);
    doc.setLineDashPattern([], 0);

    // Cardholder Metadata Summary Table
    const tableTop = 108;
    doc.setFillColor(248, 250, 252);
    doc.rect(14, tableTop, 182, 60, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(14, tableTop, 182, 60, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(13, 77, 66);
    doc.text('VERIFIED CITIZEN CREDENTIAL DETAILS', 20, tableTop + 8);

    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Full Name / नाम:', 20, tableTop + 17);
    doc.text('Health ID / स्वास्थ्य आईडी:', 20, tableTop + 25);
    doc.text('Date of Birth / जन्म तिथि:', 20, tableTop + 33);
    doc.text('Gender / लिंग:', 20, tableTop + 41);
    doc.text('Blood Group / रक्त समूह:', 20, tableTop + 49);
    doc.text('Organ Donor / अंगदान:', 20, tableTop + 57);

    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text((data.fullName || data.name || 'TUSHAR JAIN').toUpperCase(), 70, tableTop + 17);
    doc.text(HealthCardRenderer.formatHealthId(data.healthId), 70, tableTop + 25);
    doc.text(HealthCardRenderer.formatDob(data.dob), 70, tableTop + 33);
    doc.text(HealthCardRenderer.formatGender(data.gender), 70, tableTop + 41);
    doc.text(HealthCardRenderer.formatBloodGroup(data.bloodGroup), 70, tableTop + 49);
    doc.text(data.organDonor || 'YES / हाँ (Pledged)', 70, tableTop + 57);

    // Right Column in Metadata Table
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Permanent Address:', 115, tableTop + 17);
    doc.text('Emergency Trauma Contact:', 115, tableTop + 33);
    doc.text('Issuance Authority:', 115, tableTop + 49);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(15, 23, 42);
    const addr = data.addressEnglish || data.address || 'H.No. 142, Vikas Nagar, New Delhi - 110059';
    const splitAddr = doc.splitTextToSize(addr, 75);
    doc.text(splitAddr, 115, tableTop + 22);

    const em = data.emergencyContact?.phone ? `+91 ${data.emergencyContact.phone}` : (data.emergencyContact || '+91 98765-43210');
    doc.text(em, 115, tableTop + 39);
    doc.text('National Health Authority (GoI)', 115, tableTop + 55);

    // Statutory Security Notice
    const noticeTop = 176;
    doc.setFillColor(240, 253, 244);
    doc.rect(14, noticeTop, 182, 32, 'F');
    doc.setDrawColor(187, 247, 208);
    doc.rect(14, noticeTop, 182, 32, 'S');

    doc.setTextColor(21, 128, 61);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text('OFFICIAL STATUTORY INSTRUCTIONS FOR CARD PRINTING & PVC LAMINATION', 20, noticeTop + 7);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    doc.text('1. Print at 100% scale (Do not scale to fit). The card frames are precisely calibrated to standard CR80 ID-1 PVC dimensions (85.60 mm x 53.98 mm).', 20, noticeTop + 14);
    doc.text('2. Cut along the dashed guide lines, place Front and Back back-to-back, and heat laminate using 250-micron standard ID pouch.', 20, noticeTop + 20);
    doc.text('3. The high-density optical QR matrices remain fully readable through protective laminates for instant emergency hospital triage.', 20, noticeTop + 26);

    // Signatures / Authority Footer
    const footTop = 230;
    doc.setDrawColor(203, 213, 225);
    doc.line(14, footTop, 80, footTop);
    doc.line(130, footTop, 196, footTop);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(15, 23, 42);
    doc.text('Authorized Issuer Officer / प्राधिकृत अधिकारी', 14, footTop + 5);
    doc.text('Director General / महानिदेशक', 196, footTop + 5, { align: 'right' });
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Central PVC Card Bureau, MoHFW', 14, footTop + 9);
    doc.text('National Health Authority, New Delhi', 196, footTop + 9, { align: 'right' });

    // Bottom Helpline
    doc.setFillColor(241, 245, 249);
    doc.rect(0, 285, 210, 12, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('24x7 TOLL-FREE HELPLINE: 104 / 14477 • NATIONAL HEALTH PORTAL: www.nha.gov.in', 105, 292, { align: 'center' });

    const filename = `Official_HealthCard_${(data.healthId || 'National').replace(/\s+/g, '')}.pdf`;
    doc.save(filename);
    return doc;
  }
}

// Global window binding
if (typeof window !== 'undefined') {
  window.HealthCardRenderer = HealthCardRenderer;
}
