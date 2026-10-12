/**
 * Official Indian Physical HealthCard Dynamic Renderer
 * Portrait CR80 PVC ISO/IEC 7810 ID-1 Standard (53.98mm × 85.60mm)
 * Compatible with Admin Panel, Applicant Portal, and Standalone Design System
 */

export class HealthCardRenderer {
  /**
   * Format any 10-digit Health ID into 5 - 5 partitioned format (e.g. 12345 - 67890)
   */
  static formatHealthId(rawId, isEmpty = false) {
    if (isEmpty || !rawId) return '_ _ _ _ _  -  _ _ _ _ _';
    const digits = String(rawId).replace(/[^0-9]/g, '');
    if (digits.length >= 10) {
      return `${digits.slice(0, 5)} - ${digits.slice(5, 10)}`;
    } else if (digits.length > 5) {
      return `${digits.slice(0, 5)} - ${digits.slice(5)}`;
    }
    return digits || '_ _ _ _ _  -  _ _ _ _ _';
  }

  /**
   * Render Portrait Front HTML
   * @param {Object} data - { fullName, healthId, bloodGroup, dob, gender, cardNo, isEmpty }
   * @param {Object} options - { qrCodeDataUrl, assetsBasePath }
   */
  static renderFront(data = {}, options = {}) {
    const isEmpty = Boolean(data.isEmpty || (!data.fullName && !data.healthId));
    const assetsPath = options.assetsBasePath || '/card-design/assets';

    const name = isEmpty ? '_ _ _ _ _ _ _ _ _ _ _ _' : (data.fullName || '').trim().toUpperCase() || 'RAHUL SHARMA';
    const healthIdFormatted = this.formatHealthId(data.healthId, isEmpty);
    const blood = isEmpty ? '—' : (data.bloodGroup || '').trim() || 'O+';
    const dob = isEmpty ? 'DD / MM / YYYY' : (data.dob || '15/08/1992');
    const gender = isEmpty ? '— / —' : ((data.gender || '').toUpperCase() || 'MALE / पुरुष');
    const cardNo = isEmpty ? 'HC — — — — — —' : (data.cardNo || (data.healthId ? `HC${String(data.healthId).replace(/[^0-9]/g, '')}` : 'HC9876543210'));
    const qrSrc = options.qrCodeDataUrl || '';

    return `
      <div class="indian-healthcard-portrait front-face ${isEmpty ? 'template-empty-mode' : ''}" data-health-id="${data.healthId || ''}">
        <!-- Authentic Guilloche Multi-Color Rosette Lathe Background & Ashoka Watermark -->
        <div class="card-guilloche-bg"></div>
        <div class="card-ashoka-watermark"></div>
        <div class="card-perimeter-border"></div>

        <!-- Top Deep Teal Official Government Header -->
        <div class="portrait-header">
          <!-- Left: Ministry of Health & Family Welfare Official Seal -->
          <div class="header-seal-left">
            <img src="${assetsPath}/ministry-of-health-india.svg" class="seal-icon" alt="MoHFW Seal" onerror="this.style.opacity='0.5'" />
            <div class="seal-fallback-text">
              <span>स्वास्थ्य मंत्रालय</span>
              <span>MoHFW INDIA</span>
            </div>
          </div>

          <!-- Center: Bilingual Titles -->
          <div class="header-center-titles">
            <div class="title-hindi">राष्ट्रीय स्वास्थ्य कार्ड</div>
            <div class="title-english">NATIONAL HEALTH CARD</div>
          </div>

          <!-- Right: State Emblem of India (Ashoka Lion Capital with सत्यमेव जयते) -->
          <div class="header-emblem-right">
            <img src="${assetsPath}/emblem-of-india.svg" class="lion-emblem" alt="Emblem of India" onerror="this.style.opacity='0.5'" />
            <div class="emblem-motto">सत्यमेव जयते</div>
          </div>
        </div>

        <!-- Tricolor Security Accent Ribbon -->
        <div class="tricolor-ribbon">
          <div class="stripe-saffron"></div>
          <div class="stripe-white"></div>
          <div class="stripe-green"></div>
        </div>

        <!-- Card Body Content -->
        <div class="portrait-body">
          
          <!-- Health ID Pill Box & Contactless Wave Symbol -->
          <div class="health-id-row">
            <div class="health-id-pill-box">
              <div class="id-label">स्वास्थ्य आईडी सं. / HEALTH ID NO.</div>
              <div class="id-value font-mono ${isEmpty ? 'placeholder-slot' : ''}">${healthIdFormatted}</div>
            </div>

            <div class="nfc-wave-container" title="Contactless Smart Card (NFC)">
              <svg width="34" height="34" viewBox="0 0 40 40" fill="none">
                <g stroke="#0f172a" stroke-width="3.6" stroke-linecap="round">
                  <path d="M12 16C13.8 17.5 15 19.6 15 22C15 24.4 13.8 26.5 12 28"/>
                  <path d="M18 12C20.8 14.5 22.5 18 22.5 22C22.5 26 20.8 29.5 18 32"/>
                  <path d="M24 8C27.8 11.5 30 16.5 30 22C30 27.5 27.8 32.5 24 36"/>
                  <path d="M30 4C35 8.5 37.5 14.8 37.5 22C37.5 29.2 35 35.5 30 40"/>
                </g>
              </svg>
            </div>
          </div>

          <!-- Main Split Section: Demographics on Left, Blood & QR on Right -->
          <div class="data-split-section">
            
            <!-- Left: Citizen Demographics -->
            <div class="demographics-col">
              <div class="field-group">
                <div class="field-label">नाम / NAME</div>
                <div class="field-val-name ${isEmpty ? 'placeholder-slot' : ''}">${name}</div>
              </div>

              <div class="field-group">
                <div class="field-label">जन्मतिथि / DOB</div>
                <div class="field-val ${isEmpty ? 'placeholder-slot' : ''}">${dob}</div>
              </div>

              <div class="field-group">
                <div class="field-label">लिंग / GENDER</div>
                <div class="field-val ${isEmpty ? 'placeholder-slot' : ''}">${gender}</div>
              </div>

              <div class="field-group">
                <div class="field-label">कार्ड क्र. / CARD NO.</div>
                <div class="field-val font-mono ${isEmpty ? 'placeholder-slot' : ''}">${cardNo}</div>
              </div>
            </div>

            <!-- Right: Prominent Framed Blood Group & Dedicated QR Code -->
            <div class="emergency-col">
              <!-- Big Framed Emergency Blood Group Box -->
              <div class="blood-group-box">
                <div class="blood-lbl-hi">रक्त समूह /</div>
                <div class="blood-lbl-en">BLOOD GROUP</div>
                <div class="blood-big-val ${isEmpty ? 'placeholder-slot' : ''}">${blood}</div>
              </div>

              <!-- Dedicated High-Contrast Square QR Code Enclosure -->
              <div class="qr-code-enclosure">
                ${qrSrc ? `<img src="${qrSrc}" class="qr-code-img" alt="Health ID QR Code" />` : `
                  <div class="qr-placeholder-matrix" id="target-qr-canvas-wrap">
                    <svg width="86" height="86" viewBox="0 0 100 100" fill="#0f172a">
                      <!-- Corner Target 1 -->
                      <rect x="0" y="0" width="28" height="28" rx="3"/>
                      <rect x="5" y="5" width="18" height="18" fill="#ffffff" rx="1"/>
                      <rect x="9" y="9" width="10" height="10" rx="1"/>
                      <!-- Corner Target 2 -->
                      <rect x="72" y="0" width="28" height="28" rx="3"/>
                      <rect x="77" y="5" width="18" height="18" fill="#ffffff" rx="1"/>
                      <rect x="81" y="9" width="10" height="10" rx="1"/>
                      <!-- Corner Target 3 -->
                      <rect x="0" y="72" width="28" height="28" rx="3"/>
                      <rect x="5" y="77" width="18" height="18" fill="#ffffff" rx="1"/>
                      <rect x="9" y="81" width="10" height="10" rx="1"/>
                      <!-- Pre-Printed Center Shield -->
                      <rect x="36" y="8" width="10" height="10"/>
                      <rect x="54" y="8" width="10" height="10"/>
                      <rect x="36" y="36" width="28" height="28" fill="#047857" rx="4"/>
                      <path d="M48 42h4v6h6v4h-6v6h-4v-6h-6v-4h6v-6z" fill="#ffffff"/>
                      <rect x="72" y="72" width="12" height="12"/>
                      <rect x="50" y="78" width="10" height="10"/>
                    </svg>
                  </div>
                `}
              </div>
            </div>

          </div>

        </div>

        <!-- Bottom Security Tricolor Ribbon -->
        <div class="tricolor-ribbon ribbon-bottom">
          <div class="stripe-saffron"></div>
          <div class="stripe-white"></div>
          <div class="stripe-green"></div>
        </div>
      </div>
    `;
  }

  /**
   * Render Portrait Back HTML
   * @param {Object} data - { cardNo, emergencyContact, helpline, isEmpty }
   * @param {Object} options - { assetsBasePath }
   */
  static renderBack(data = {}, options = {}) {
    const isEmpty = Boolean(data.isEmpty);
    const assetsPath = options.assetsBasePath || '/card-design/assets';
    const cardNo = isEmpty ? 'SERIAT — — — — —' : (data.cardNo || (data.healthId ? `SERIAT${String(data.healthId).replace(/[^0-9]/g, '')}` : 'SERIAT6543210'));
    const helpline = data.helpline || '1800-890-4325';

    return `
      <div class="indian-healthcard-portrait back-face ${isEmpty ? 'template-empty-mode' : ''}">
        <!-- Background Security Pattern & Ashoka Watermark -->
        <div class="card-guilloche-bg"></div>
        <div class="card-ashoka-watermark" style="top:32%;"></div>
        <div class="card-perimeter-border"></div>

        <!-- Instructions Header -->
        <div class="back-instructions-header">
          <div class="instr-title-hi">महत्वपूर्ण निर्देश</div>
          <div class="instr-title-en">IMPORTANT INSTRUCTIONS</div>
        </div>

        <!-- 4 Instructions (Exact Match to Reference Image) -->
        <div class="instructions-list">
          <div class="instr-item">
            <div class="instr-hi">1. यह कार्ड केवल स्वास्थ्य सेवाओं के लिए है।</div>
            <div class="instr-en">This card is for healthcare services only.</div>
          </div>

          <div class="instr-item">
            <div class="instr-hi">2. खोने पर हेल्पलाइन को सूचित करें।</div>
            <div class="instr-en">Inform helpline immediately if lost.</div>
          </div>

          <div class="instr-item">
            <div class="instr-hi">3. यह कार्ड अहस्तांतरणीय है।</div>
            <div class="instr-en">This card is non-transferable.</div>
          </div>

          <div class="instr-item">
            <div class="instr-hi">4. आपातकाल में QR कोड स्कैन करें।</div>
            <div class="instr-en">Scan QR code in emergency for medical info.</div>
          </div>
        </div>

        <!-- Middle Tricolor Security Ribbon Divider -->
        <div class="tricolor-ribbon">
          <div class="stripe-saffron"></div>
          <div class="stripe-white"></div>
          <div class="stripe-green"></div>
        </div>

        <!-- Authority Signatory & Helpline Section -->
        <div class="back-authority-section">
          <div class="auth-left">
            <div class="auth-header-line">
              <img src="${assetsPath}/emblem-of-india.svg" class="lion-emblem-small" alt="Emblem of India" onerror="this.style.opacity='0.5'" />
              <div>
                <div class="auth-name-hi">राष्ट्रीय स्वास्थ्य प्राधिकरण</div>
                <div class="auth-name-en">national health authority</div>
              </div>
            </div>
            <div class="signatory-text">
              <div>Authorized Signatory</div>
              <div class="sign-hi">निदेशक / Director</div>
            </div>
          </div>

          <div class="auth-right">
            <div class="help-hi">हेल्पलाइन / HELPLINE: 104</div>
            <div class="help-number font-mono">${helpline}</div>
            <div class="help-url">🌐 www.nha.gov.in</div>
          </div>
        </div>

        <!-- High-Density Linear Barcode Section -->
        <div class="barcode-container">
          <div class="barcode-lines"></div>
          <div class="barcode-serial font-mono ${isEmpty ? 'placeholder-slot' : ''}">${cardNo}</div>
        </div>

        <!-- Bottom Security Tricolor Ribbon -->
        <div class="tricolor-ribbon ribbon-bottom">
          <div class="stripe-saffron"></div>
          <div class="stripe-white"></div>
          <div class="stripe-green"></div>
        </div>
      </div>
    `;
  }
}
