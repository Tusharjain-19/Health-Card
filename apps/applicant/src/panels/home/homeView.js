/**
 * HealthCard Citizen & Applicant Portal: Hero Overview & Landing View (PRD HOME-01)
 * High-impact hero section with interactive 3D parallax physical card, 4-action grid,
 * "About the HealthCard" deep dive, how it works pipeline, and live trust metrics.
 */

import { applicantStore } from '../../shared/storage.js';

export class HomeView {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.isCardFlipped = false;

    // Single Official Showcase Citizen (Authentic Indian Citizen)
    this.citizen = {
      name: 'ANANYA DESHMUKH',
      photo: '/citizen_portrait.jpg',
      dob: '28/11/1994',
      sex: 'F',
      blood: 'B+',
      healthId: '81920 34719',
      address: '12B, Bandra West, Mumbai - 400050',
      emergency: 'Sanjay Deshmukh (Father) +91 98123 45679',
      frontGradient: 'linear-gradient(135deg, #0a1e48 0%, #1e40af 60%, #3b82f6 100%)',
      backGradient: 'linear-gradient(135deg, #091326 0%, #0f1e3d 100%)'
    };

    this.init();
  }

  init() {
    this.render();
    this.bindEvents();
  }

  render() {
    const p = this.citizen;

    this.container.innerHTML = `
      <div class="home-page-container">
        
        <!-- HERO SECTION -->
        <section class="hero-section">
          <div class="hero-content">
            <div class="hero-badge">
              <span class="hero-badge-dot"></span>
              <span>National Health Authority • Digital India Initiative</span>
            </div>

            <h1 class="hero-title">
              One Citizen. One Lifetime <span class="hero-title-highlight">Health Identity.</span>
            </h1>

            <p class="hero-subtitle">
              Apply for your unique 10-digit National Health ID and high-durability physical CR80 PVC HealthCard. Seamless interoperability across 45,000+ government and private hospitals nationwide.
            </p>

            <!-- Hero Action Buttons -->
            <div class="hero-actions">
              <a href="#apply" class="btn btn-primary hero-btn-main">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
                <span>Apply for HealthCard Now</span>
              </a>

              <a href="#track" class="btn btn-outline hero-btn-sub">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span>Track Delivery Status</span>
              </a>

              <a href="#emergency?hid=${p.healthId.replace(/\s/g, '')}" class="btn btn-ghost hero-btn-ghost" id="hero-btn-emergency" title="Contactless First-Responder Scan">
                <span class="emergency-badge-dot"></span>
                <span>Emergency Triage Demo</span>
              </a>
            </div>

            <!-- Trust Stats -->
            <div class="hero-trust-bar">
              <div class="trust-item">
                <div class="trust-number">4.2M+</div>
                <div class="trust-label">Active Cards Issued</div>
              </div>
              <div class="trust-divider"></div>
              <div class="trust-item">
                <div class="trust-number">100%</div>
                <div class="trust-label">DPDP Act Compliant</div>
              </div>
              <div class="trust-divider"></div>
              <div class="trust-item">
                <div class="trust-number">3-5 Days</div>
                <div class="trust-label">SpeedPost Delivery</div>
              </div>
            </div>
          </div>

          <!-- 3D Parallax Interactive Card Showcase -->
          <div class="hero-card-viewport" id="hero-card-viewport">
            <div class="hero-card-3d-wrapper" id="hero-card-3d">
              
              <!-- Front Face of Card -->
              <div class="hero-physical-card card-front" id="hero-card-front" style="display:${this.isCardFlipped ? 'none' : 'flex'}; background: ${p.frontGradient};">
                <div class="hcard-top">
                  <div class="hcard-emblem">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5"><path d="M12 2v20M2 12h20"/></svg>
                  </div>
                  <div>
                    <div class="hcard-govt-title">NATIONAL HEALTH REGISTRY</div>
                    <div class="hcard-govt-sub">GOVERNMENT OF INDIA</div>
                  </div>
                  <div class="hcard-chip-slot">
                    <div class="gold-chip"></div>
                  </div>
                </div>

                <div class="hcard-middle">
                  <div class="hcard-photo-box">
                    <img src="${p.photo}" alt="${p.name}" class="hcard-photo" id="hcard-photo-el" />
                  </div>
                  <div class="hcard-details">
                    <div class="hcard-name" id="hcard-name-el">${p.name}</div>
                    <div class="hcard-meta">
                      DOB: <span id="hcard-dob-el">${p.dob}</span> | Sex: <span id="hcard-sex-el">${p.sex}</span>
                    </div>
                    <div class="hcard-blood-box">
                      <span>BLOOD:</span>
                      <strong class="hcard-blood-val" id="hcard-blood-el">${p.blood}</strong>
                    </div>
                    <div class="hcard-id-block">
                      <div class="hcard-id-label">NATIONAL HEALTH ID</div>
                      <div class="hcard-id-number" id="hcard-id-el">${p.healthId}</div>
                    </div>
                  </div>
                </div>

                <div class="hcard-bottom">
                  <span>CR80 PVC • NTAG 424 DNA NFC</span>
                  <span class="hcard-seal">GOVT VERIFIED</span>
                </div>
              </div>

              <!-- Back Face of Card -->
              <div class="hero-physical-card card-back" id="hero-card-back" style="display:${this.isCardFlipped ? 'flex' : 'none'}; background: ${p.backGradient};">
                <div class="hcard-magstripe"></div>
                <div class="hcard-back-body">
                  <div class="hcard-qr-box">
                    <canvas id="hero-card-qr-canvas" width="60" height="60"></canvas>
                  </div>
                  <div class="hcard-back-text">
                    <div id="hcard-back-addr"><strong>Address:</strong> ${p.address}</div>
                    <div style="margin-top:3px;" id="hcard-back-emg"><strong>Emergency:</strong> ${p.emergency}</div>
                    <div style="font-size:7.5px; opacity:0.8; margin-top:3px;">24x7 Helpline: 1800-11-4477 • Lost Card: healthcard.gov.in</div>
                  </div>
                </div>
                <div class="hcard-back-footer">
                  <span>MINISTRY OF HEALTH & FAMILY WELFARE</span>
                  <span id="hcard-back-sn">SN: ${p.healthId.replace(/\s/g, '')}</span>
                </div>
              </div>

            </div>

            <!-- 3D Card Control Buttons -->
            <div class="hero-card-controls">
              <button type="button" class="btn btn-xs btn-outline" id="btn-hero-flip-card">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
                <span id="lbl-hero-flip">${this.isCardFlipped ? 'Flip to Card Front' : 'Flip to Card Back'}</span>
              </button>
              <span class="parallax-hint">Interactive 3D Tilt Enabled</span>
            </div>

          </div>
        </section>

        <!-- 4 CORE CITIZEN ACTION CARDS GRID -->
        <section class="section-actions-grid">
          <div class="section-header-centered">
            <h2 class="section-title">Citizen Self-Service Actions</h2>
            <p class="section-subtitle">Everything you need to apply, manage, verify, and utilize your National HealthCard.</p>
          </div>

          <div class="action-cards-grid">
            <!-- Card 1: Apply -->
            <a href="#apply" class="service-action-card">
              <div class="service-icon-box" style="background:#eff6ff; color:#1d4ed8; border-color:#bfdbfe;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
              </div>
              <h3 class="service-card-title">Apply for New HealthCard</h3>
              <p class="service-card-desc">
                Instant digital enrolment with UIDAI Aadhaar OTP and Gmail verification. Fast ₹50 PVC card manufacturing.
              </p>
              <div class="service-card-link">
                <span>Start Application</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
            </a>

            <!-- Card 2: Track -->
            <a href="#track" class="service-action-card">
              <div class="service-icon-box" style="background:#eff6ff; color:#1d4ed8; border-color:#bfdbfe;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <h3 class="service-card-title">Track Card & Dispatch</h3>
              <p class="service-card-desc">
                Real-time India Post SpeedPost AWB tracking with an arrow-line connected 5-stage progress pipeline.
              </p>
              <div class="service-card-link">
                <span>Track Consignment</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
            </a>

            <!-- Card 3: Dashboard -->
            <a href="#dashboard" class="service-action-card">
              <div class="service-icon-box" style="background:#f8fafc; color:#334155; border-color:#cbd5e1;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
              <h3 class="service-card-title">Citizen Dashboard</h3>
              <p class="service-card-desc">
                View your active card, export high-DPI dual-sided PNG graphics, update delivery address, or re-print official receipts.
              </p>
              <div class="service-card-link">
                <span>Open Dashboard</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
            </a>

            <!-- Card 4: Emergency Triage -->
            <a href="#emergency?hid=7483916251" class="service-action-card">
              <div class="service-icon-box" style="background:#fef2f2; color:#dc2626; border-color:#fecaca;">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M2 12h20"/></svg>
              </div>
              <h3 class="service-card-title">Emergency Trauma Scan</h3>
              <p class="service-card-desc">
                Contactless field triage screen for paramedics with bold red blood group mandate and one-touch guardian calling.
              </p>
              <div class="service-card-link" style="color:#dc2626;">
                <span>View Emergency Triage</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
            </a>
          </div>
        </section>

        <!-- ABOUT THE HEALTHCARD DEEP-DIVE -->
        <section class="section-about-card">
          <div class="about-grid">
            <div class="about-text-col">
              <div class="section-tag-pill">ENGINEERED FOR LIFELONG RESILIENCE</div>
              <h2 class="about-headline">About the Physical HealthCard</h2>
              <p class="about-paragraph">
                The National HealthCard is manufactured in strict compliance with ISO/IEC 7810 ID-1 standards. Unlike standard laminated cards, each card is laser-etched on high-grade solid PVC, ensuring that critical demographic and medical markers remain permanent and readable for over a decade.
              </p>

              <div class="about-feature-list">
                <div class="about-feature-item">
                  <div class="af-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h10M7 12h6"/></svg>
                  </div>
                  <div>
                    <strong class="af-title">CR80 PVC High-Durability Substrate</strong>
                    <p class="af-desc">Credit-card size (85.60 × 53.98 mm), waterproof, heat-resistant, and tamper-evident with anti-scratch UV protective gloss.</p>
                  </div>
                </div>

                <div class="about-feature-item">
                  <div class="af-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                  </div>
                  <div>
                    <strong class="af-title">Dynamic NTAG 424 DNA NFC Chip</strong>
                    <p class="af-desc">Enables contactless hospital check-in with AES-128 cryptographic key tokenization to prevent cloning or counterfeiting.</p>
                  </div>
                </div>

                <div class="about-feature-item">
                  <div class="af-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                  </div>
                  <div>
                    <strong class="af-title">Contactless Paramedic QR Triage (PRD ACC-09)</strong>
                    <p class="af-desc">The back QR allows emergency doctors to view verified blood groups and call guardians immediately while strictly protecting Aadhaar privacy.</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="about-visual-col">
              <div class="about-spec-box">
                <div class="spec-header">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                  <span>Technical Card Specifications</span>
                </div>
                <div class="spec-table">
                  <div class="spec-row">
                    <span class="spec-k">Dimensions:</span>
                    <span class="spec-v">85.60 × 53.98 × 0.76 mm</span>
                  </div>
                  <div class="spec-row">
                    <span class="spec-k">Material:</span>
                    <span class="spec-v">100% Solid Industrial PVC (CR80)</span>
                  </div>
                  <div class="spec-row">
                    <span class="spec-k">NFC Protocol:</span>
                    <span class="spec-v">ISO/IEC 14443 Type A</span>
                  </div>
                  <div class="spec-row">
                    <span class="spec-k">Encryption:</span>
                    <span class="spec-v">SUN Cryptographic CMAC</span>
                  </div>
                  <div class="spec-row">
                    <span class="spec-k">Print Method:</span>
                    <span class="spec-v">Direct Laser Thermal Re-transfer</span>
                  </div>
                  <div class="spec-row">
                    <span class="spec-k">Fulfillment:</span>
                    <span class="spec-v">India Post SpeedPost Priority</span>
                  </div>
                </div>

                <div class="spec-footer-badge">
                  <span style="display:inline-flex; align-items:center; gap:6px;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    Ministry of Health & Family Welfare Approved
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 3-STEP PIPELINE SECTION -->
        <section class="section-how-it-works">
          <div class="section-header-centered">
            <h2 class="section-title">How It Works in 3 Steps</h2>
            <p class="section-subtitle">A seamless journey from online application to doorstep delivery.</p>
          </div>

          <div class="steps-flow-row">
            <div class="step-flow-card">
              <div class="step-number-tag">01</div>
              <h4 class="step-card-title">Apply & Verify Identity</h4>
              <p class="step-card-desc">Enter demographic details, upload identity proof, and verify via instant UIDAI Aadhaar & Gmail OTP.</p>
            </div>

            <div class="flow-arrow-divider">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
            </div>

            <div class="step-flow-card">
              <div class="step-number-tag">02</div>
              <h4 class="step-card-title">Laser Engraving & Tokenization</h4>
              <p class="step-card-desc">Government Central Bureau engraves your 10-digit Health ID and encodes cryptographic keys onto the NFC chip.</p>
            </div>

            <div class="flow-arrow-divider">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
            </div>

            <div class="step-flow-card">
              <div class="step-number-tag">03</div>
              <h4 class="step-card-title">SpeedPost Doorstep Delivery</h4>
              <p class="step-card-desc">Your physical card is safely sealed and dispatched via India Post SpeedPost directly to your residence within 3-5 days.</p>
            </div>
          </div>
        </section>

        <!-- CTA BOTTOM STRIP -->
        <section class="section-bottom-cta">
          <div class="cta-banner">
            <div>
              <h3 class="cta-heading">Ready to Get Your National HealthCard?</h3>
              <p class="cta-desc">Join millions of Indian citizens with a verified digital and physical health identity.</p>
            </div>
            <div class="cta-buttons">
              <a href="#apply" class="btn btn-primary" style="height:44px; padding:0 24px; font-weight:700;">Apply Online (₹50)</a>
              <a href="#login" class="btn btn-outline" style="height:44px; padding:0 20px; font-weight:600;">Citizen Sign In</a>
            </div>
          </div>
        </section>

      </div>
    `;
  }

  bindEvents() {
    // Card Flip Action
    const btnFlip = document.getElementById('btn-hero-flip-card');
    const lblFlip = document.getElementById('lbl-hero-flip');
    const frontCard = document.getElementById('hero-card-front');
    const backCard = document.getElementById('hero-card-back');

    if (btnFlip && frontCard && backCard) {
      btnFlip.onclick = () => {
        this.isCardFlipped = !this.isCardFlipped;
        if (this.isCardFlipped) {
          frontCard.style.display = 'none';
          backCard.style.display = 'flex';
          lblFlip.textContent = 'Flip to Card Front';
        } else {
          frontCard.style.display = 'flex';
          backCard.style.display = 'none';
          lblFlip.textContent = 'Flip to Card Back';
        }
      };
    }

    // Parallax 3D Card Tilt on Mouse Move
    const viewport = document.getElementById('hero-card-viewport');
    const card3D = document.getElementById('hero-card-3d');

    if (viewport && card3D) {
      viewport.addEventListener('mousemove', (e) => {
        const rect = viewport.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = ((y - centerY) / centerY) * -12; // tilt angle
        const rotateY = ((x - centerX) / centerX) * 14;

        card3D.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;
      });

      viewport.addEventListener('mouseleave', () => {
        card3D.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
      });
    }

    // Dynamic QR Code Rendering for Citizen
    const qrCanvas = document.getElementById('hero-card-qr-canvas');
    if (qrCanvas) {
      const cleanHid = this.citizen.healthId.replace(/\s/g, '');
      import('qrcode').then(QRCodeModule => {
        const QRCode = QRCodeModule.default || QRCodeModule;
        QRCode.toCanvas(qrCanvas, `${window.location.origin}${window.location.pathname}#emergency?hid=${cleanHid}`, {
          width: 60,
          margin: 0,
          color: { dark: '#0f172a', light: '#ffffff' }
        }, (e) => { if (e) console.error(e); });
      }).catch(err => console.warn('QR error:', err));
    }
  }
}
