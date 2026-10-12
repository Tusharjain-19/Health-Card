/**
 * HealthCard Citizen Self-Service Dashboard — Clean Minimal Light Mode
 * Matches Admin Panel design language
 */

import QRCode from 'qrcode';
import { applicantStore } from '../../shared/storage.js';
import { calculateAge } from '../../shared/formatters.js';
import { showToast } from '../../shared/toast.js';

export class ApplicantDashboard {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.onLogout = options.onLogout || null;
    this.activeMobile = sessionStorage.getItem('healthcard_active_citizen_mobile') || '9876543210';
    this.member = null;
    this.card = null;
    this.order = null;
    this.isCardFlipped = false;
    this.init();
  }

  init() {
    this.loadCitizenData();
    this.render();
    this.bindEvents();
    this.renderCardQR();
  }

  loadCitizenData() {
    this.member = applicantStore.getMemberByMobile(this.activeMobile);
    if (!this.member) {
      const all = applicantStore.getAllMembers();
      if (all.length > 0) {
        this.member = all[0];
        this.activeMobile = this.member.mobile;
        sessionStorage.setItem('healthcard_active_citizen_mobile', this.activeMobile);
      }
    }

    if (this.member) {
      this.card = applicantStore.getCardByMemberId(this.member.id);
      this.order = applicantStore.getOrderByMemberId(this.member.id);
    }
  }

  render() {
    if (!this.member) {
      this.container.innerHTML = `
        <div style="text-align:center; padding:48px 20px; background:#ffffff; border:1px solid var(--border-color); border-radius:var(--radius-lg); max-width:440px; margin:40px auto; box-shadow:var(--shadow-md);">
          <h3 style="font-size:16px; font-weight:700; color:var(--text-main);">No Active Citizen Session</h3>
          <p style="color:var(--text-muted); font-size:13px; margin:8px 0 20px;">Please sign in or create an account with Google or mobile number to view your card.</p>
          <div style="display:flex; justify-content:center; gap:10px;">
            <button type="button" class="btn btn-primary" onclick="window.location.hash='#login'">Sign In / Register</button>
            <button type="button" class="btn btn-outline" onclick="window.location.hash='#apply'">Apply Directly</button>
          </div>
        </div>
      `;
      return;
    }

    const age = calculateAge(this.member.dob);
    const templateClass = `template-${this.card?.template || 'teal'}`;
    const canEditAddress = !this.order || (this.order.status !== 'dispatched' && this.order.status !== 'delivered');
    const applicationRef = this.member.applicationRef || this.order?.orderNumber || `APP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const nowStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

    this.container.innerHTML = `
      <!-- Clean Minimal Light Header -->
      <div class="light-page-header">
        <div>
          <div style="display:inline-flex; align-items:center; gap:6px; font-size:11.5px; font-weight:700; color:var(--color-primary); background:var(--color-primary-light); border:1px solid var(--color-primary-border); padding:3px 10px; border-radius:4px; margin-bottom:6px;">
            Citizen Record Active
          </div>
          <h1 class="page-title">Citizen HealthCard Dashboard</h1>
          <div style="display:flex; gap:12px; font-size:13px; color:var(--text-muted); flex-wrap:wrap; align-items:center;">
            <span>Holder: <strong style="color:var(--text-main);">${this.member.fullName}</strong></span>
            <span>•</span>
            <span>10-Digit Health ID: <strong style="font-family:var(--font-family-mono); color:var(--color-primary);">${this.member.healthId}</strong></span>
            <span>•</span>
            <span>Blood Group: <strong style="color:var(--color-blood-red); font-weight:800;">${this.member.bloodGroup || 'O+'}</strong></span>
          </div>
        </div>

        <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
          <button type="button" class="btn btn-sm btn-outline" id="btn-view-receipt" style="gap:6px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            Official Receipt (₹50)
          </button>
          <button type="button" class="btn btn-sm btn-outline" id="btn-citizen-logout">
            Sign Out
          </button>
        </div>
      </div>

      <!-- Main Layout -->
      <div style="display:grid; grid-template-columns:420px 1fr; gap:24px; align-items:start; margin-bottom:28px;">
        
        <!-- Left: Interactive Card Flip -->
        <div style="background:#ffffff; border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:24px; box-shadow:var(--shadow-sm); text-align:center;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
            <span style="font-size:12px; font-weight:700; color:var(--text-secondary); text-transform:uppercase;">
              Digital PVC HealthCard
            </span>
            <button type="button" class="btn btn-sm btn-outline" id="btn-flip-card">
              <span id="lbl-flip-text">Flip to Back</span>
            </button>
          </div>

          <div style="display:flex; justify-content:center; margin-bottom:16px;">
            <!-- Front Face -->
            <div class="healthcard-physical ${templateClass}" id="dash-card-front" style="display:${this.isCardFlipped ? 'none' : 'flex'}; width:100%; max-width:370px; height:234px; text-align:left;">
              <div class="card-top">
                <div class="card-emblem">
                  <div class="emblem-icon">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v20M2 12h20"/></svg>
                  </div>
                  <div>
                    <div class="card-org-title">NATIONAL HEALTH REGISTRY</div>
                    <div style="font-size:7px; opacity:0.8;">MINISTRY OF HEALTH & FAMILY WELFARE</div>
                  </div>
                </div>
                <div style="font-size:9px; font-weight:800; background:rgba(255,255,255,0.2); padding:1px 6px; border-radius:3px;">
                  CR80 PVC
                </div>
              </div>

              <div class="card-middle">
                <div class="card-photo-box" style="width:62px; height:76px;">
                  <img src="${this.member.photoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(this.member.fullName)}`}" alt="${this.member.fullName}" />
                </div>
                <div class="card-info">
                  <div class="card-name" style="font-size:15px;">${this.member.fullName.toUpperCase()}</div>
                  <div class="card-meta" style="font-size:11px;">
                    DOB: ${this.member.dob} | ${this.member.gender} | 
                    Blood: <strong style="color:#ffffff; background:#dc2626; padding:1px 5px; border-radius:3px; font-weight:800;">${this.member.bloodGroup || 'O+'}</strong>
                  </div>
                  <div class="card-id-block" style="padding:3px 8px;">
                    <div class="card-id-label">NATIONAL HEALTH ID</div>
                    <div class="card-id-number" style="font-size:14px;">${this.member.healthId}</div>
                  </div>
                </div>
              </div>

              <div class="card-bottom">
                <div class="card-footer-text" style="font-size:8px;">
                  Encrypted Dynamic Token • ISO/IEC 7810 Standard
                </div>
                <span style="font-size:7.5px; opacity:0.75;">OFFICIAL CITIZEN CARD</span>
              </div>
            </div>

            <!-- Back Face -->
            <div class="healthcard-physical card-back" id="dash-card-back" style="display:${this.isCardFlipped ? 'flex' : 'none'}; width:100%; max-width:370px; height:234px; text-align:left;">
              <div class="card-magstripe" style="height:28px; margin:-18px -20px 8px;"></div>
              <div class="card-back-content">
                <div class="card-qr-box" style="width:64px; height:64px;">
                  <canvas id="dash-card-qr-canvas" width="56" height="56"></canvas>
                </div>
                <div style="flex:1; font-size:9px; line-height:1.4; opacity:0.9;">
                  <div><strong>Address:</strong> ${this.member.address?.street || ''}, ${this.member.address?.city || ''}, ${this.member.address?.state || ''} - ${this.member.address?.pinCode || ''}</div>
                  <div style="margin-top:3px;"><strong>Emergency Contact:</strong> ${this.member.emergencyContact?.name || 'Contact'} (${this.member.emergencyContact?.relation || 'Family'}) +91 ${this.member.emergencyContact?.phone || ''}</div>
                  <div style="margin-top:3px; font-size:7.5px; opacity:0.8;">
                    Helpline: 1800-11-4477 • Lost Card: healthcard.gov.in
                  </div>
                </div>
              </div>
              <div style="font-size:7.5px; opacity:0.7; border-top:1px solid rgba(255,255,255,0.15); padding-top:4px; margin-top:6px; display:flex; justify-content:space-between;">
                <span>GOVERNMENT OF INDIA</span>
                <span>SN: ${(this.member.healthId || '').replace(/\s+/g, '')}</span>
              </div>
            </div>
          </div>

          <div style="display:flex; justify-content:center; gap:8px;">
            <button type="button" class="btn btn-primary btn-sm" id="btn-download-card-png" style="flex:1; gap:6px;">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Download Card (PNG)
            </button>
            <button type="button" class="btn btn-outline btn-sm" id="btn-show-qr-modal" style="flex:1;">
              Enlarge QR Code
            </button>
          </div>
        </div>

        <!-- Right: Profile & Emergency Contact -->
        <div>
          ${this.order ? `
            <div style="background:var(--color-primary-light); border:1px solid var(--color-primary-border); border-radius:var(--radius-md); padding:14px 18px; margin-bottom:18px; display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
              <div>
                <div style="font-size:13px; font-weight:700; color:var(--color-primary);">SpeedPost Dispatch Status: <span class="badge ${this.order.status === 'delivered' ? 'badge-teal' : 'badge-blue'}">${this.order.status.toUpperCase()}</span></div>
                <div style="font-size:12px; color:var(--text-muted); margin-top:2px;">AWB: <strong style="font-family:var(--font-family-mono);">${this.order.awbNumber}</strong> • India Post</div>
              </div>
              <button type="button" class="btn btn-sm btn-primary" onclick="window.location.hash='#track?ref=${encodeURIComponent(this.order.orderNumber)}'">
                Track SpeedPost
              </button>
            </div>
          ` : ''}

          <!-- Details Card -->
          <div style="background:#ffffff; border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:20px 24px; box-shadow:var(--shadow-xs); margin-bottom:18px;">
            <div style="font-size:14px; font-weight:700; color:var(--text-main); margin-bottom:14px; border-bottom:1px solid var(--border-color); padding-bottom:8px;">
              Verified Demographic Record
            </div>
            <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:12px;">
              <div>
                <div style="font-size:11px; color:var(--text-muted); font-weight:600;">Full Legal Name</div>
                <div style="font-size:13.5px; font-weight:600; color:var(--text-main);">${this.member.fullName}</div>
              </div>
              <div>
                <div style="font-size:11px; color:var(--text-muted); font-weight:600;">DOB & Age</div>
                <div style="font-size:13.5px; font-weight:600; color:var(--text-main);">${this.member.dob} (${age} yrs)</div>
              </div>
              <div>
                <div style="font-size:11px; color:var(--text-muted); font-weight:600;">Gender</div>
                <div style="font-size:13.5px; font-weight:600; color:var(--text-main);">${this.member.gender}</div>
              </div>
              <div>
                <div style="font-size:11px; color:var(--text-muted); font-weight:600;">Blood Group Designation</div>
                <div style="font-size:14px; font-weight:800; color:var(--color-blood-red);">${this.member.bloodGroup || 'O+'}</div>
              </div>
              <div>
                <div style="font-size:11px; color:var(--text-muted); font-weight:600;">Registered Mobile</div>
                <div style="font-size:13.5px; font-weight:600; color:var(--text-main); display:flex; align-items:center; gap:6px;">
                  <span>+91 ${this.member.mobile}</span>
                  <span class="badge badge-teal" style="font-size:10px;">OTP VERIFIED</span>
                </div>
              </div>
              <div>
                <div style="font-size:11px; color:var(--text-muted); font-weight:600;">Registered Email</div>
                <div style="font-size:13.5px; font-weight:600; color:var(--text-main); display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
                  <span>${this.member.email || '—'}</span>
                  ${this.member.email ? `<span class="badge badge-teal" style="font-size:10px;">GMAIL VERIFIED</span>` : ''}
                </div>
              </div>
              <div style="grid-column:span 2;">
                <div style="font-size:11px; color:var(--text-muted); font-weight:600;">Government KYC Verification</div>
                <div style="font-size:13px; font-weight:600; color:var(--text-main); display:flex; align-items:center; gap:8px; margin-top:3px; flex-wrap:wrap;">
                  <span>${this.member.kyc?.documentType || 'Aadhaar Card'}</span>
                  ${this.member.kyc?.documentNumber ? `<span style="font-family:var(--font-family-mono); font-size:12px; background:#f1f5f9; padding:2px 7px; border-radius:4px; border:1px solid #cbd5e1;">${this.member.kyc.documentNumber}</span>` : ''}
                  <span class="badge ${this.member.kyc?.isAadhaarVerified ? 'badge-teal' : 'badge-green'}" style="font-size:10px;">
                    ${this.member.kyc?.isAadhaarVerified ? 'UIDAI OTP VERIFIED' : 'VERIFIED'}
                  </span>
                  ${this.member.kyc?.documentName ? `<span style="font-size:11px; color:var(--text-muted);">(Doc: ${this.member.kyc.documentName})</span>` : ''}
                </div>
              </div>
              <div style="grid-column:span 2;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                  <div style="font-size:11px; color:var(--text-muted); font-weight:600;">Residential Delivery Address</div>
                  ${canEditAddress ? `
                    <button type="button" class="btn btn-sm btn-ghost" id="btn-edit-address" style="color:var(--color-primary); padding:2px 6px; font-size:11.5px; font-weight:600; display:inline-flex; align-items:center; gap:4px;">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                      Edit Address
                    </button>
                  ` : ''}
                </div>
                <div id="lbl-delivery-address" style="font-size:13px; font-weight:500; color:var(--text-main); line-height:1.4;">
                  ${this.member.address?.street || ''}, ${this.member.address?.city || ''}, ${this.member.address?.state || ''} - ${this.member.address?.pinCode || ''}
                </div>
              </div>
            </div>
          </div>

          <!-- Emergency Contact Card -->
          <div style="background:#ffffff; border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:20px 24px; box-shadow:var(--shadow-xs);">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1px solid var(--border-color); padding-bottom:8px;">
              <div style="font-size:14px; font-weight:700; color:var(--text-main);">
                Emergency Trauma Contact (PRD ACC-09)
              </div>
              <button type="button" class="btn btn-sm btn-outline" id="btn-edit-emergency">Edit</button>
            </div>
            <div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:12px;">
              <div>
                <div style="font-size:11px; color:var(--text-muted); font-weight:600;">Contact Person</div>
                <div style="font-size:13.5px; font-weight:600; color:var(--text-main);">${this.member.emergencyContact?.name || 'Designated Contact'}</div>
              </div>
              <div>
                <div style="font-size:11px; color:var(--text-muted); font-weight:600;">Relationship</div>
                <div style="font-size:13.5px; font-weight:600; color:var(--text-main);">${this.member.emergencyContact?.relation || 'Family'}</div>
              </div>
              <div style="grid-column:span 2;">
                <div style="font-size:11px; color:var(--text-muted); font-weight:600;">24x7 Emergency Phone</div>
                <div style="font-size:14px; font-weight:700; color:var(--color-primary); font-family:var(--font-family-mono); display:flex; align-items:center; gap:8px;">
                  <span>+91 ${this.member.emergencyContact?.phone || '—'}</span>
                  <a href="#emergency?hid=${(this.member.healthId || '').replace(/\s+/g,'')}" class="badge badge-red" style="font-size:10px; font-weight:700; text-decoration:none;">
                    TEST FIRST-RESPONDER VIEW
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Feature 1 Modal: Official Printable A4 Acknowledgement Slip & Tax Invoice -->
      <div id="modal-view-receipt" class="modal-backdrop" style="display:none; align-items:flex-start; overflow-y:auto; padding:24px 16px;">
        <div class="modal-dialog" style="max-width:860px; width:100%; margin:20px auto; padding:24px 28px;">
          <!-- Toolbar -->
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:18px; border-bottom:1px solid var(--border-color); padding-bottom:12px;" class="receipt-modal-toolbar">
            <div style="font-weight:700; font-size:14px; color:var(--text-main); display:flex; align-items:center; gap:8px;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              <span>Official Government Enrolment Acknowledgement & Tax Invoice</span>
            </div>
            <div style="display:flex; gap:8px;">
              <button type="button" class="btn btn-sm btn-primary" id="btn-print-receipt-modal" style="gap:6px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                Print / Save PDF
              </button>
              <button type="button" class="btn btn-sm btn-outline" id="btn-close-receipt-modal">
                Close
              </button>
            </div>
          </div>

          <!-- Printable Document Body -->
          <div class="printable-acknowledgement-doc" style="box-shadow:none; border:none; padding:10px 0 0; margin:0;" id="printable-modal-doc">
            <!-- Emblem Header -->
            <div class="doc-emblem-header">
              <div class="doc-govt-titles">
                <div class="doc-seal-img">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5"><path d="M12 2v20M2 12h20"/></svg>
                </div>
                <div>
                  <div class="doc-title-main">GOVERNMENT OF INDIA • MINISTRY OF HEALTH & FAMILY WELFARE</div>
                  <div class="doc-title-sub">NATIONAL DIGITAL HEALTH MISSION • AYUSHMAN BHARAT LINKED</div>
                </div>
              </div>

              <div class="doc-doc-type-badge">
                <div class="doc-slip-title">Official Enrolment Acknowledgement & Tax Invoice</div>
                <div class="doc-slip-ref">Issued: ${nowStr}</div>
              </div>
            </div>

            <!-- Key Metrics 3-Card Strip -->
            <div class="doc-key-metrics-grid">
              <div class="metric-tile">
                <div class="metric-tile-label">10-Digit National Health ID</div>
                <div class="metric-tile-value" style="color:var(--color-primary);">${this.member.healthId}</div>
              </div>

              <div class="metric-tile">
                <div class="metric-tile-label">SpeedPost Tracking AWB</div>
                <div class="metric-tile-value" style="color:#047857;">${this.order?.awbNumber || 'IN982183749SP'}</div>
                <div style="font-size:10.5px; color:#64748b; margin-top:2px;">Estimated: 3 to 5 business days</div>
              </div>

              <div class="metric-tile">
                <div class="metric-tile-label">Application Status & Fee</div>
                <div class="metric-tile-value" style="color:#0f172a; font-size:14px;">PAID — ₹50.00</div>
                <div style="font-size:10.5px; color:#64748b; margin-top:2px;">${this.order?.payment?.mode || 'UPI / BHIM'} • Ref: ${applicationRef}</div>
              </div>
            </div>

            <!-- Section 1: Demographics -->
            <div class="doc-section-card">
              <div class="doc-section-header-light">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <span>1. Enrolled Citizen Demographics & Biological Parameters</span>
              </div>
              <div class="doc-section-body-light">
                <div class="doc-demographics-row">
                  <img src="${this.member.photoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(this.member.fullName)}`}" alt="Photo" class="doc-photo-portrait" />
                  
                  <div class="doc-details-grid">
                    <div>
                      <div class="doc-field-label">Full Legal Name</div>
                      <div class="doc-field-value" style="font-size:14px; font-weight:700;">${this.member.fullName.toUpperCase()}</div>
                    </div>

                    <div>
                      <div class="doc-field-label">Blood Group Designation</div>
                      <div class="doc-field-value">
                        <span class="badge badge-red" style="font-size:11.5px; font-weight:800; padding:2px 8px;">
                          ${this.member.bloodGroup || 'Unknown'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <div class="doc-field-label">Date of Birth & Age</div>
                      <div class="doc-field-value">${this.member.dob} (${age} Years Old)</div>
                    </div>

                    <div>
                      <div class="doc-field-label">Gender</div>
                      <div class="doc-field-value">${this.member.gender}</div>
                    </div>

                    <div>
                      <div class="doc-field-label">Identity Document & e-KYC</div>
                      <div class="doc-field-value">
                        <strong>${this.member.kyc?.documentType || 'Aadhaar Card'}</strong>: 
                        <span style="font-family:var(--font-family-mono); font-weight:700;">${this.member.kyc?.documentNumber || '—'}</span>
                        <span style="font-size:10px; color:#166534; font-weight:700; background:#ecfdf5; padding:2px 6px; border-radius:3px; border:1px solid #bbf7d0; margin-left:4px;">
                          ${this.member.kyc?.isAadhaarVerified ? '✓ UIDAI VERIFIED' : '✓ e-KYC VERIFIED'}
                        </span>
                      </div>
                    </div>

                    <div>
                      <div class="doc-field-label">Registered Contacts</div>
                      <div class="doc-field-value" style="font-size:12px;">
                        Mobile: +91 ${this.member.mobile} <span style="color:#166534; font-weight:700;">✓</span> • 
                        Email: ${this.member.email || '—'} <span style="color:#166534; font-weight:700;">✓</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Section 2: SpeedPost Dispatch -->
            <div class="doc-section-card">
              <div class="doc-section-header-light">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                <span>2. SpeedPost Doorstep Dispatch & PVC Card Specifications</span>
              </div>
              <div class="doc-section-body-light">
                <div class="doc-details-grid">
                  <div>
                    <div class="doc-field-label">SpeedPost Delivery Address</div>
                    <div class="doc-field-value" style="line-height:1.45;">
                      ${this.member.address?.street || ''}, ${this.member.address?.city || ''}, ${this.member.address?.state || ''} - ${this.member.address?.pinCode || ''}
                    </div>
                  </div>

                  <div>
                    <div class="doc-field-label">Logistics Carrier</div>
                    <div class="doc-field-value"><strong>India Post SpeedPost</strong> (Insured & Tracked Priority)</div>
                    <div style="font-size:11.5px; color:#64748b; margin-top:2px;">Transit Window: 3 to 5 business days</div>
                  </div>

                  <div>
                    <div class="doc-field-label">Card Substrate Specification</div>
                    <div class="doc-field-value">CR80 PVC (85.60 × 53.98 mm) ISO/IEC 7810 Compliant</div>
                  </div>

                  <div>
                    <div class="doc-field-label">Cryptographic Tokenization</div>
                    <div class="doc-field-value">Laser-Etched • Dynamic NFC Chip • 10-Digit Identity Token</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Section 3: Tax Invoice -->
            <div class="doc-section-card">
              <div class="doc-section-header-light">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                <span>3. Government Fee Assessment & Tax Invoice</span>
              </div>
              <table class="doc-fee-table-modern">
                <thead>
                  <tr>
                    <th style="width:10%;">S.No</th>
                    <th style="width:55%;">Service Item Description</th>
                    <th style="width:15%;">Rate (INR)</th>
                    <th style="width:20%; text-align:right;">Amount Paid</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>01</td>
                    <td>CR80 PVC Physical Card Laser Manufacturing, Dynamic NFC Chip & Digital Tokenization</td>
                    <td class="num">50.00</td>
                    <td class="num">₹50.00</td>
                  </tr>
                  <tr>
                    <td>02</td>
                    <td>Doorstep Delivery via India Post SpeedPost (Priority Tracked Network)</td>
                    <td class="num">0.00</td>
                    <td class="num" style="color:#166534; font-weight:600;">₹0.00 (FREE)</td>
                  </tr>
                  <tr>
                    <td>03</td>
                    <td>Central Goods & Services Tax (CGST 0% / Public Health Exemption)</td>
                    <td class="num">0.00</td>
                    <td class="num">₹0.00</td>
                  </tr>
                  <tr class="total-row">
                    <td colspan="3" style="text-align:right; font-size:13px; font-weight:800; color:#0f172a;">NET TOTAL AMOUNT PAID:</td>
                    <td class="num" style="color:var(--color-primary); font-size:15px; font-weight:800;">₹50.00</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Digital Stamp -->
            <div class="doc-footer-sign">
              <div class="doc-stamp-box">
                <div class="doc-qr-stamp">
                  <canvas id="receipt-modal-qr" width="60" height="60"></canvas>
                </div>
                <div class="doc-certified-badge">
                  <div><strong>DIGITALLY CERTIFIED</strong></div>
                  <div>Central Health Record Registry, Govt of India</div>
                  <div style="font-size:10.5px; color:#64748b;">Verification Token: ${applicationRef}</div>
                </div>
              </div>
              <div class="doc-sign-block">
                <div class="doc-sign-title">Competent Enrolment Authority</div>
                <div>Directorate General of Health Services</div>
                <div style="font-size:10px; color:#64748b;">Ministry of Health & Family Welfare</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Feature 3 Modal: Update Delivery Address Before Dispatch -->
      <div id="modal-edit-address" class="modal-backdrop" style="display:none;">
        <div class="modal-dialog" style="max-width:440px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; border-bottom:1px solid var(--border-color); padding-bottom:8px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <div style="width:28px; height:28px; border-radius:6px; background:var(--color-primary-light); color:var(--color-primary); display:flex; align-items:center; justify-content:center;">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
              <h3 style="font-size:15px; font-weight:700; color:var(--text-main); margin:0;">Update Delivery Address</h3>
            </div>
            <button type="button" id="btn-close-addr-modal" style="background:none; border:none; font-size:20px; cursor:pointer; color:var(--text-muted);">&times;</button>
          </div>

          <p style="font-size:12px; color:var(--text-muted); margin-bottom:14px;">
            Your card is currently in pre-dispatch status. Update your SpeedPost consignment address below:
          </p>

          <div class="form-group" style="margin-bottom:12px;">
            <label class="form-label required">Street / House / Building Address</label>
            <input type="text" class="form-input" id="inp-modal-addr-street" value="${this.member.address?.street || ''}" placeholder="House/Flat No, Street, Colony" />
          </div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; margin-bottom:12px;">
            <div class="form-group">
              <label class="form-label required">City / District</label>
              <input type="text" class="form-input" id="inp-modal-addr-city" value="${this.member.address?.city || ''}" placeholder="City" />
            </div>
            <div class="form-group">
              <label class="form-label required">PIN Code</label>
              <input type="text" class="form-input" id="inp-modal-addr-pin" maxlength="6" value="${this.member.address?.pinCode || ''}" placeholder="6-Digit PIN" />
            </div>
          </div>

          <div class="form-group" style="margin-bottom:18px;">
            <label class="form-label required">State / UT</label>
            <select class="form-select" id="sel-modal-addr-state">
              ${['Delhi', 'Maharashtra', 'Karnataka', 'Gujarat', 'Tamil Nadu', 'Uttar Pradesh', 'West Bengal', 'Rajasthan', 'Kerala', 'Telangana'].map(s => `
                <option value="${s}" ${(this.member.address?.state || 'Delhi') === s ? 'selected' : ''}>${s}</option>
              `).join('')}
            </select>
          </div>

          <div style="display:flex; justify-content:flex-end; gap:8px;">
            <button type="button" class="btn btn-outline btn-sm" id="btn-cancel-addr-modal">Cancel</button>
            <button type="button" class="btn btn-primary btn-sm" id="btn-save-addr-modal" style="font-weight:700;">Update Address</button>
          </div>
        </div>
      </div>

      <!-- Emergency Edit Modal -->
      <div id="modal-edit-emergency" class="modal-backdrop" style="display:none;">
        <div class="modal-dialog">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px; border-bottom:1px solid var(--border-color); padding-bottom:8px;">
            <h3 style="font-size:16px; font-weight:700; color:var(--text-main); margin:0;">Update Emergency Contact</h3>
            <button type="button" id="btn-close-emerg-modal" style="background:none; border:none; font-size:20px; cursor:pointer; color:var(--text-muted);">&times;</button>
          </div>
          <div class="form-group" style="margin-bottom:12px;">
            <label class="form-label required">Contact Full Name</label>
            <input type="text" class="form-input" id="inp-modal-emerg-name" value="${this.member.emergencyContact?.name || ''}" />
          </div>
          <div class="form-group" style="margin-bottom:12px;">
            <label class="form-label required">Relationship</label>
            <select class="form-select" id="sel-modal-emerg-rel">
              <option value="Spouse" ${this.member.emergencyContact?.relation === 'Spouse' ? 'selected' : ''}>Spouse</option>
              <option value="Parent" ${this.member.emergencyContact?.relation === 'Parent' ? 'selected' : ''}>Parent</option>
              <option value="Child" ${this.member.emergencyContact?.relation === 'Child' ? 'selected' : ''}>Child</option>
              <option value="Sibling" ${this.member.emergencyContact?.relation === 'Sibling' ? 'selected' : ''}>Sibling</option>
              <option value="Guardian" ${this.member.emergencyContact?.relation === 'Guardian' ? 'selected' : ''}>Guardian</option>
              <option value="Friend" ${this.member.emergencyContact?.relation === 'Friend' ? 'selected' : ''}>Friend</option>
            </select>
          </div>
          <div class="form-group" style="margin-bottom:18px;">
            <label class="form-label required">Phone Number (+91)</label>
            <input type="tel" class="form-input" id="inp-modal-emerg-phone" maxlength="10" value="${this.member.emergencyContact?.phone || ''}" />
          </div>
          <div style="display:flex; justify-content:flex-end; gap:8px;">
            <button type="button" class="btn btn-outline btn-sm" id="btn-cancel-emerg-modal">Cancel</button>
            <button type="button" class="btn btn-primary btn-sm" id="btn-save-emerg-modal">Save Changes</button>
          </div>
        </div>
      </div>

      <!-- QR Enlarge Modal -->
      <div id="modal-qr-enlarge" class="modal-backdrop" style="display:none;">
        <div class="modal-dialog" style="max-width:340px; text-align:center;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1px solid var(--border-color); padding-bottom:8px;">
            <h3 style="font-size:15px; font-weight:700; color:var(--text-main); margin:0;">National Health ID QR</h3>
            <button type="button" id="btn-close-qr-modal" style="background:none; border:none; font-size:20px; cursor:pointer; color:var(--text-muted);">&times;</button>
          </div>
          <div style="display:flex; justify-content:center; margin:14px 0;">
            <canvas id="modal-qr-canvas" width="200" height="200" style="padding:8px; background:#ffffff; border:1px solid var(--border-color); border-radius:8px;"></canvas>
          </div>
          <div style="font-family:var(--font-family-mono); font-size:16px; font-weight:700; color:var(--color-primary); letter-spacing:0.1em; margin-bottom:4px;">
            ${this.member.healthId}
          </div>
          <div style="font-size:11.5px; color:var(--text-muted); margin-bottom:12px;">
            Scan at hospital reception for contactless identity verification.
          </div>
          <a href="#emergency?hid=${(this.member.healthId || '').replace(/\s+/g,'')}" class="btn btn-sm btn-outline btn-block" style="font-size:12px; font-weight:600; color:var(--color-blood-red); border-color:var(--blood-red-border);">
            Open First-Responder Trauma View
          </a>
        </div>
      </div>
    `;
  }

  bindEvents() {
    const btnFlip = document.getElementById('btn-flip-card');
    const lblFlip = document.getElementById('lbl-flip-text');
    const cardFront = document.getElementById('dash-card-front');
    const cardBack = document.getElementById('dash-card-back');

    if (btnFlip && cardFront && cardBack) {
      btnFlip.onclick = () => {
        this.isCardFlipped = !this.isCardFlipped;
        cardFront.style.display = this.isCardFlipped ? 'none' : 'flex';
        cardBack.style.display = this.isCardFlipped ? 'flex' : 'none';
        if (lblFlip) lblFlip.textContent = this.isCardFlipped ? 'Flip to Front' : 'Flip to Back';
        if (this.isCardFlipped) this.renderCardQR();
      };
    }

    const btnLogout = document.getElementById('btn-citizen-logout');
    if (btnLogout) {
      btnLogout.onclick = () => {
        sessionStorage.removeItem('healthcard_active_citizen_mobile');
        showToast('Signed out of citizen dashboard', 'info');
        if (this.onLogout) this.onLogout();
        else window.location.hash = '#login';
      };
    }

    // Feature 2: High-Resolution Card Graphic Download
    const btnDownloadPng = document.getElementById('btn-download-card-png');
    if (btnDownloadPng) {
      btnDownloadPng.onclick = () => this.downloadCardGraphic();
    }

    // Feature 1: Official Receipt Modal
    const btnViewReceipt = document.getElementById('btn-view-receipt');
    const modalReceipt = document.getElementById('modal-view-receipt');
    const btnCloseReceipt = document.getElementById('btn-close-receipt-modal');
    const btnPrintReceipt = document.getElementById('btn-print-receipt-modal');

    if (btnViewReceipt && modalReceipt) {
      btnViewReceipt.onclick = () => {
        modalReceipt.style.display = 'flex';
        // Render QR Code stamp in receipt modal
        const canvas = document.getElementById('receipt-modal-qr');
        if (canvas) {
          QRCode.toCanvas(canvas, JSON.stringify({
            applicationRef: this.member.applicationRef,
            healthId: this.member.healthId,
            paid: "₹50.00"
          }), { width: 60, margin: 0 });
        }
      };
    }

    if (btnCloseReceipt && modalReceipt) {
      btnCloseReceipt.onclick = () => { modalReceipt.style.display = 'none'; };
    }

    if (btnPrintReceipt) {
      btnPrintReceipt.onclick = () => {
        window.print();
      };
    }

    // Feature 3: Update Delivery Address Modal
    const btnEditAddr = document.getElementById('btn-edit-address');
    const modalAddr = document.getElementById('modal-edit-address');
    const btnCloseAddr = document.getElementById('btn-close-addr-modal');
    const btnCancelAddr = document.getElementById('btn-cancel-addr-modal');
    const btnSaveAddr = document.getElementById('btn-save-addr-modal');

    if (btnEditAddr && modalAddr) {
      btnEditAddr.onclick = () => { modalAddr.style.display = 'flex'; };
    }

    const hideAddrModal = () => { if (modalAddr) modalAddr.style.display = 'none'; };
    if (btnCloseAddr) btnCloseAddr.onclick = hideAddrModal;
    if (btnCancelAddr) btnCancelAddr.onclick = hideAddrModal;

    if (btnSaveAddr) {
      btnSaveAddr.onclick = () => {
        const street = document.getElementById('inp-modal-addr-street')?.value.trim();
        const city = document.getElementById('inp-modal-addr-city')?.value.trim();
        const pinCode = document.getElementById('inp-modal-addr-pin')?.value.replace(/\D/g, '');
        const state = document.getElementById('sel-modal-addr-state')?.value || 'Delhi';

        if (!street || street.length < 5) {
          showToast('Please enter full street address', 'warning');
          return;
        }
        if (!city || city.length < 2) {
          showToast('Please enter city name', 'warning');
          return;
        }
        if (!pinCode || pinCode.length !== 6) {
          showToast('Please enter a valid 6-digit PIN code', 'warning');
          return;
        }

        applicantStore.updateMemberDetails(this.member.id, {
          address: { street, city, state, pinCode }
        });

        showToast('SpeedPost delivery routing updated successfully!', 'success');
        hideAddrModal();
        this.loadCitizenData();
        this.render();
        this.bindEvents();
        this.renderCardQR();
      };
    }

    // QR Modal
    const btnShowQr = document.getElementById('btn-show-qr-modal');
    const modalQr = document.getElementById('modal-qr-enlarge');
    const btnCloseQr = document.getElementById('btn-close-qr-modal');
    if (btnShowQr && modalQr) {
      btnShowQr.onclick = () => {
        modalQr.style.display = 'flex';
        const canvas = document.getElementById('modal-qr-canvas');
        if (canvas) {
          const cleanHid = (this.member.healthId || '').replace(/\s+/g, '');
          const emergUrl = `${window.location.origin}${window.location.pathname}#emergency?hid=${cleanHid}`;
          QRCode.toCanvas(canvas, emergUrl, { width: 200, margin: 0 });
        }
      };
      const linkEmerg = modalQr.querySelector('a[href^="#emergency"]');
      if (linkEmerg) {
        linkEmerg.onclick = () => { modalQr.style.display = 'none'; };
      }
    }
    if (btnCloseQr && modalQr) {
      btnCloseQr.onclick = () => { modalQr.style.display = 'none'; };
    }

    // Emergency Contact Modal
    const btnEditEmerg = document.getElementById('btn-edit-emergency');
    const modalEmerg = document.getElementById('modal-edit-emergency');
    const btnCloseEmerg = document.getElementById('btn-close-emerg-modal');
    const btnCancelEmerg = document.getElementById('btn-cancel-emerg-modal');
    const btnSaveEmerg = document.getElementById('btn-save-emerg-modal');

    if (btnEditEmerg && modalEmerg) {
      btnEditEmerg.onclick = () => { modalEmerg.style.display = 'flex'; };
    }
    const hideEmergModal = () => { if (modalEmerg) modalEmerg.style.display = 'none'; };
    if (btnCloseEmerg) btnCloseEmerg.onclick = hideEmergModal;
    if (btnCancelEmerg) btnCancelEmerg.onclick = hideEmergModal;

    if (btnSaveEmerg) {
      btnSaveEmerg.onclick = () => {
        const name = document.getElementById('inp-modal-emerg-name')?.value.trim();
        const rel = document.getElementById('sel-modal-emerg-rel')?.value;
        const phone = document.getElementById('inp-modal-emerg-phone')?.value.replace(/\D/g, '');

        if (!name || name.length < 2) {
          showToast('Please provide emergency contact name', 'warning');
          return;
        }
        if (!phone || phone.length !== 10) {
          showToast('Please enter a valid 10-digit phone number', 'warning');
          return;
        }

        applicantStore.updateMemberDetails(this.member.id, {
          emergencyContact: { name, relation: rel, phone }
        });

        showToast('Emergency trauma contact updated', 'success');
        hideEmergModal();
        this.loadCitizenData();
        this.render();
        this.bindEvents();
        this.renderCardQR();
      };
    }
  }

  renderCardQR() {
    if (!this.member) return;
    const canvas = document.getElementById('dash-card-qr-canvas');
    if (canvas) {
      const cleanHid = (this.member.healthId || '').replace(/\s+/g, '');
      const emergUrl = `${window.location.origin}${window.location.pathname}#emergency?hid=${cleanHid}`;
      QRCode.toCanvas(canvas, emergUrl, {
        width: 56,
        margin: 0,
        color: { dark: '#0f172a', light: '#ffffff' }
      }, (e) => {
        if (e) console.error('QR error:', e);
      });
    }
  }

  /**
   * Feature 2: High-Resolution Card Graphic Download (PNG)
   * Generates a dual-sided CR80 card mockup graphic
   */
  async downloadCardGraphic() {
    try {
      showToast('Rendering high-resolution HealthCard graphic...', 'info', 2000);

      const canvas = document.createElement('canvas');
      canvas.width = 1000;
      canvas.height = 360;
      const ctx = canvas.getContext('2d');

      // Background
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Helper for rounded rectangle
      const drawRoundRect = (x, y, w, h, r, fill) => {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
        ctx.fillStyle = fill;
        ctx.fill();
      };

      // 1. FRONT CARD (Left: x=30, y=30, w=450, h=300)
      const grad = ctx.createLinearGradient(30, 30, 480, 330);
      const template = this.card?.template || 'teal';
      if (template === 'slate') {
        grad.addColorStop(0, '#020617');
        grad.addColorStop(0.6, '#0f172a');
        grad.addColorStop(1, '#1e293b');
      } else if (template === 'blue') {
        grad.addColorStop(0, '#0a1e48');
        grad.addColorStop(0.6, '#1e40af');
        grad.addColorStop(1, '#3b82f6');
      } else {
        grad.addColorStop(0, '#064e47');
        grad.addColorStop(0.6, '#0f766e');
        grad.addColorStop(1, '#14b8a6');
      }
      drawRoundRect(30, 30, 450, 300, 16, grad);

      // Front Header
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px "IBM Plex Sans", sans-serif';
      ctx.fillText('NATIONAL HEALTH REGISTRY', 60, 65);
      ctx.font = '9px "Inter", sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.fillText('MINISTRY OF HEALTH & FAMILY WELFARE', 60, 80);

      // CR80 PVC badge
      drawRoundRect(400, 50, 60, 20, 4, 'rgba(255,255,255,0.2)');
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px "Inter", sans-serif';
      ctx.fillText('CR80 PVC', 408, 64);

      // Photo Box (x=60, y=105, w=70, h=88)
      drawRoundRect(60, 105, 70, 88, 6, '#ffffff');

      // Citizen Details
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px "IBM Plex Sans", sans-serif';
      ctx.fillText(this.member.fullName.toUpperCase(), 145, 125);

      ctx.font = '11.5px "Inter", sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.fillText(`DOB: ${this.member.dob} | ${this.member.gender}`, 145, 145);

      // Bold Red Blood Group Pill
      ctx.fillText('Blood Group:', 145, 168);
      drawRoundRect(225, 154, 46, 20, 4, '#dc2626');
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px "Inter", sans-serif';
      ctx.fillText(this.member.bloodGroup || 'O+', 235, 169);

      // 10-Digit National Health ID Block
      drawRoundRect(145, 190, 200, 36, 6, 'rgba(0,0,0,0.3)');
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.font = '8px "Inter", sans-serif';
      ctx.fillText('NATIONAL HEALTH ID', 155, 203);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 16px "JetBrains Mono", monospace';
      ctx.fillText(this.member.healthId, 155, 220);

      // Front Footer
      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
      ctx.beginPath();
      ctx.moveTo(60, 290);
      ctx.lineTo(450, 290);
      ctx.stroke();

      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.font = '9px "Inter", sans-serif';
      ctx.fillText('Encrypted Dynamic Token • ISO/IEC 7810 Standard', 60, 310);
      ctx.fillText('OFFICIAL CITIZEN CARD', 330, 310);

      // 2. BACK CARD (Right: x=520, y=30, w=450, h=300)
      drawRoundRect(520, 30, 450, 300, 16, '#0f172a');

      // Magnetic Stripe
      ctx.fillStyle = '#000000';
      ctx.fillRect(520, 65, 450, 40);

      // QR Code on Back
      const cleanHid = (this.member.healthId || '').replace(/\s+/g, '');
      const emergUrl = `${window.location.origin}${window.location.pathname}#emergency?hid=${cleanHid}`;
      const qrDataUrl = await QRCode.toDataURL(emergUrl, { width: 100, margin: 0 });

      const qrImg = new Image();
      qrImg.src = qrDataUrl;
      await new Promise(res => { qrImg.onload = res; qrImg.onerror = res; });
      drawRoundRect(550, 130, 84, 84, 6, '#ffffff');
      ctx.drawImage(qrImg, 554, 134, 76, 76);

      // Address & Emergency Info
      ctx.fillStyle = 'rgba(255,255,255,0.9)';
      ctx.font = '10px "Inter", sans-serif';
      ctx.fillText(`Address: ${this.member.address?.street || ''}, ${this.member.address?.city || ''}`, 650, 145);
      ctx.fillText(`${this.member.address?.state || ''} - ${this.member.address?.pinCode || ''}`, 650, 160);

      ctx.fillText(`Emergency: ${this.member.emergencyContact?.name || ''} (${this.member.emergencyContact?.relation || 'Family'})`, 650, 185);
      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 11px "JetBrains Mono", monospace';
      ctx.fillText(`+91 ${this.member.emergencyContact?.phone || ''}`, 650, 202);

      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = '9px "Inter", sans-serif';
      ctx.fillText('National Helpline: 1800-11-4477 • Lost Card: healthcard.gov.in', 650, 222);

      // Back Footer
      ctx.strokeStyle = 'rgba(255,255,255,0.2)';
      ctx.beginPath();
      ctx.moveTo(550, 280);
      ctx.lineTo(940, 280);
      ctx.stroke();

      ctx.fillStyle = 'rgba(255,255,255,0.75)';
      ctx.font = '9px "Inter", sans-serif';
      ctx.fillText('GOVERNMENT OF INDIA', 550, 305);
      ctx.fillText(`SN: ${(this.member.healthId || '').replace(/\s+/g, '')}`, 830, 305);

      // Trigger file download
      const link = document.createElement('a');
      link.download = `HealthCard_${(this.member.healthId || 'National').replace(/\s+/g, '')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      showToast('High-Resolution Physical HealthCard PNG saved!', 'success');
    } catch (e) {
      console.error('Card export error:', e);
      showToast('Could not export graphic. Opening print view instead.', 'info');
      window.print();
    }
  }
}
