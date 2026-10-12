/**
 * HealthCard Citizen Application: World-Class Minimal Light Mode
 * Features:
 * - Side-by-Side Split Architecture: Real-time Live CR80 Card Preview (Sticky Left) + Unified Form Flow (Right)
 * - 8-Pill Blood Group Grid (Highlight in bold red #dc2626)
 * - Segmented Gender Control
 * - Pre-allocated 10-Digit Health ID in 5-5 partition (XXXXX XXXXX)
 * - Instant Mobile OTP Verification Modal
 * - Government Fee & Payment Gateway Modal (₹50.00 PVC card fee via UPI / Card / NetBanking)
 * - Official Printable Government Acknowledgement Document & Payment Receipt with A4 print layout
 */

import QRCode from 'qrcode';
import { applicantStore } from '../../shared/storage.js';
import { generateHealthId } from '../../shared/healthId.js';
import { calculateAge, formatDate } from '../../shared/formatters.js';
import { showToast } from '../../shared/toast.js';

export const INDIAN_STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam",
  "Bihar", "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir",
  "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh",
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha",
  "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export class ApplyWizard {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.cameraStream = null;
    this.isCardFlipped = false;
    this.selectedPaymentMode = 'UPI / QR';

    const currentUser = applicantStore.getCurrentUser();
    this.currentUser = currentUser;

    // Form State
    this.formData = {
      fullName: currentUser?.fullName || '',
      dobDay: '15',
      dobMonth: '08',
      dobYear: '1995',
      dob: '1995-08-15',
      gender: 'Male',
      bloodGroup: 'B+',
      healthIdPreview: generateHealthId(),
      kycType: 'Aadhaar Card',
      kycNumber: '',
      isAadhaarVerified: false,
      kycDocData: null,
      kycDocName: '',
      kycDocSize: '',
      kycDocType: '',
      photoUrl: currentUser?.avatarUrl || '',
      photoName: currentUser?.fullName ? 'Google_Profile_Portrait.jpg' : '',
      photoSize: '185 KB',
      mobile: currentUser?.mobile || '',
      email: currentUser?.email || '',
      isOtpVerified: !!(currentUser && currentUser.mobile),
      isEmailVerified: !!(currentUser && currentUser.email && currentUser.provider === 'google'),
      street: '',
      city: '',
      state: 'Delhi',
      pinCode: '',
      emergencyName: '',
      emergencyRelation: 'Parent',
      emergencyPhone: '',
      cardTemplate: 'teal',
      agreedToConsent: false
    };

    this.generatedAadhaarOtp = '';
    this.generatedEmailOtp = '';

    this.init();
  }

  getKycNumberLabel() {
    switch (this.formData.kycType) {
      case 'Aadhaar Card': return '12-Digit Aadhaar Number (UIDAI)';
      case 'PAN Card': return '10-Character Permanent Account Number (PAN)';
      case 'Driving License': return 'Driving License Number (DL)';
      case 'Voter ID': return 'Voter ID (EPIC) Number';
      case 'Passport': return 'Indian Passport Number';
      default: return 'Government ID Document Number';
    }
  }

  getKycPlaceholder() {
    switch (this.formData.kycType) {
      case 'Aadhaar Card': return 'XXXX XXXX XXXX';
      case 'PAN Card': return 'ABCDE1234F';
      case 'Driving License': return 'DL-1420110012345';
      case 'Voter ID': return 'ABC1234567';
      case 'Passport': return 'A1234567';
      default: return 'Enter Document Number';
    }
  }

  getKycMaxlength() {
    switch (this.formData.kycType) {
      case 'Aadhaar Card': return 14;
      case 'PAN Card': return 10;
      case 'Driving License': return 16;
      case 'Voter ID': return 12;
      case 'Passport': return 9;
      default: return 20;
    }
  }

  formatAadhaar(val) {
    const raw = (val || '').replace(/\D/g, '').slice(0, 12);
    const parts = [];
    for (let i = 0; i < raw.length; i += 4) {
      parts.push(raw.slice(i, i + 4));
    }
    return parts.join(' ');
  }

  openAadhaarOtpModal() {
    const raw = (this.formData.kycNumber || '').replace(/\D/g, '');
    if (raw.length !== 12) {
      showToast('Please enter a valid 12-digit Aadhaar number before requesting OTP', 'warning');
      document.getElementById('inp-kyc-number')?.focus();
      return;
    }
    const code = String(Math.floor(100000 + Math.random() * 900000));
    this.generatedAadhaarOtp = code;
    const last4 = raw.slice(-4);

    const modal = document.getElementById('modal-aadhaar-otp');
    const lbl = document.getElementById('lbl-aadhaar-last4');
    const inp = document.getElementById('inp-modal-aadhaar-otp');

    if (lbl) lbl.textContent = `•••• •••• ${last4}`;
    if (inp) inp.value = code;

    showToast(`[UIDAI Aadhaar OTP] Your verification code is: [ ${code} ]`, 'info', 8000);
    if (modal) modal.style.display = 'flex';
  }

  openEmailOtpModal() {
    const email = (this.formData.email || '').trim();
    if (!email || !email.includes('@') || !email.includes('.')) {
      showToast('Please enter a valid email address (e.g. citizen@gmail.com)', 'warning');
      document.getElementById('inp-email')?.focus();
      return;
    }

    const code = String(Math.floor(100000 + Math.random() * 900000));
    this.generatedEmailOtp = code;

    const modal = document.getElementById('modal-email-otp');
    const lbl = document.getElementById('lbl-email-otp-target');
    const inp = document.getElementById('inp-modal-email-otp');

    if (lbl) lbl.textContent = email;
    if (inp) inp.value = code;

    showToast(`[Gmail Security OTP] Verification code sent to ${email}: [ ${code} ]`, 'info', 8000);
    if (modal) modal.style.display = 'flex';
  }

  init() {
    this.render();
    this.bindEvents();
    this.updateCardPreview();
  }

  render() {
    const age = calculateAge(this.formData.dob);

    this.container.innerHTML = `
      <!-- Page Header -->
      <div class="page-header-bar">
        <div>
          <h1 class="page-title">Citizen Registration & Card Issuance</h1>
          <p class="page-description">
            Complete your online application to generate a lifelong 10-digit National Health ID and order your laser-etched PVC CR80 HealthCard.
          </p>
        </div>
        <div style="display:flex; align-items:center; gap:8px;">
          <span class="badge badge-teal" style="font-weight:700;">SpeedPost Priority Dispatch</span>
        </div>
      </div>

      <!-- Master Split Layout: Sticky Live Preview + Form Flow -->
      <div class="apply-split-grid" id="apply-main-wrapper">
        
        <!-- LEFT COLUMN: Sticky Live CR80 Card Preview -->
        <div class="card-preview-sticky">
          <div class="card-preview-box">
            <div class="card-preview-header">
              <span class="card-preview-title">Live Physical Card (CR80)</span>
              <button type="button" class="btn btn-sm btn-outline" id="btn-flip-preview" style="height:26px; padding:2px 8px; font-size:11.5px;">
                <span id="lbl-flip-btn">View Back</span>
              </button>
            </div>

            <!-- Card Visual Stage -->
            <div style="display:flex; justify-content:center;">
              
              <!-- Front Face -->
              <div class="healthcard-physical template-${this.formData.cardTemplate}" id="preview-card-front" style="display:${this.isCardFlipped ? 'none' : 'flex'};">
                <div class="card-top">
                  <div class="card-emblem">
                    <div class="emblem-icon">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v20M2 12h20"/></svg>
                    </div>
                    <div>
                      <div class="card-org-title">NATIONAL HEALTH RECORD</div>
                      <div style="font-size:7px; opacity:0.8;">MINISTRY OF HEALTH & FAMILY WELFARE</div>
                    </div>
                  </div>
                  <div style="font-size:8.5px; font-weight:800; background:rgba(255,255,255,0.2); padding:1px 6px; border-radius:3px;">
                    CR80 PVC
                  </div>
                </div>

                <div class="card-middle">
                  <div class="card-photo-box">
                    <img id="card-front-photo" src="${this.formData.photoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(this.formData.fullName || 'Citizen')}`}" alt="Cardholder" />
                  </div>
                  <div class="card-info">
                    <div class="card-name" id="card-front-name">${(this.formData.fullName || 'CITIZEN NAME').toUpperCase()}</div>
                    <div class="card-meta">
                      DOB: <span id="card-front-dob">${this.formData.dob}</span> | 
                      Blood: <strong style="color:#ffffff; background:#dc2626; padding:1px 5px; border-radius:3px; font-weight:800;" id="card-front-blood">${this.formData.bloodGroup}</strong>
                    </div>
                    <div class="card-id-block">
                      <div class="card-id-label">NATIONAL HEALTH ID</div>
                      <div class="card-id-number" id="card-front-healthid">${this.formData.healthIdPreview}</div>
                    </div>
                  </div>
                </div>

                <div class="card-bottom">
                  <div class="card-footer-text">
                    NTAG 424 DNA NFC • ISO/IEC 7810
                  </div>
                  <span style="font-size:7.5px; opacity:0.8;">OFFICIAL CITIZEN CARD</span>
                </div>
              </div>

              <!-- Back Face -->
              <div class="healthcard-physical card-back" id="preview-card-back" style="display:${this.isCardFlipped ? 'flex' : 'none'};">
                <div class="card-magstripe"></div>
                <div class="card-back-content">
                  <div class="card-qr-box">
                    <canvas id="card-back-qr" width="56" height="56"></canvas>
                  </div>
                  <div style="flex:1; font-size:9px; line-height:1.35; opacity:0.9;">
                    <div><strong>Address:</strong> <span id="card-back-address">${this.formData.street || 'Address'}, ${this.formData.city || 'City'}, ${this.formData.state || 'Delhi'} - ${this.formData.pinCode || '110016'}</span></div>
                    <div style="margin-top:3px;"><strong>Emergency Contact:</strong> <span id="card-back-emergency">${this.formData.emergencyName || 'Designated Contact'} (${this.formData.emergencyRelation || 'Parent'}) +91 ${this.formData.emergencyPhone || '9876543210'}</span></div>
                    <div style="margin-top:3px; font-size:7.5px; opacity:0.8;">
                      Helpline: 1800-11-4477 • Lost Card: healthcard.gov.in
                    </div>
                  </div>
                </div>
                <div style="font-size:7.5px; opacity:0.7; border-top:1px solid rgba(255,255,255,0.15); padding-top:4px; margin-top:6px; display:flex; justify-content:space-between;">
                  <span>GOVERNMENT OF INDIA</span>
                  <span id="card-back-serial">SN: ${this.formData.healthIdPreview.replace(/\s+/g, '')}</span>
                </div>
              </div>

            </div>

            <!-- Card Color Switcher -->
            <div class="preview-controls-row">
              <span style="font-size:11.5px; font-weight:600; color:var(--text-muted);">PVC Theme:</span>
              <div class="theme-pill-group">
                <div class="theme-pill theme-pill-teal ${this.formData.cardTemplate === 'teal' ? 'active' : ''}" data-theme="teal" title="Clinical Teal"></div>
                <div class="theme-pill theme-pill-slate ${this.formData.cardTemplate === 'slate' ? 'active' : ''}" data-theme="slate" title="Executive Slate"></div>
                <div class="theme-pill theme-pill-blue ${this.formData.cardTemplate === 'blue' ? 'active' : ''}" data-theme="blue" title="National Blue"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- RIGHT COLUMN: Streamlined Form Card -->
        <div class="form-flow-card">
          <form id="unified-apply-form" autocomplete="off" onsubmit="return false;">
            
            <!-- Citizen Account Banner / Google Fast-Track Notice -->
            ${this.currentUser ? `
              <div class="wizard-auth-alert wizard-auth-verified" style="display:flex; align-items:center; justify-content:space-between; padding:12px 16px; background:#f0fdf4; border:1px solid #bbf7d0; border-radius:var(--radius-md); margin-bottom:18px;">
                <div style="display:flex; align-items:center; gap:10px;">
                  <img src="${this.currentUser.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(this.currentUser.fullName)}`}" style="width:34px; height:34px; border-radius:50%; object-fit:cover; border:1.5px solid #10b981;" alt="avatar" />
                  <div>
                    <div style="font-size:13px; font-weight:700; color:#14532d;">
                      Applying as ${this.currentUser.fullName} <span class="badge badge-teal" style="font-size:10px; padding:1px 6px; margin-left:4px;">${this.currentUser.provider === 'google' ? 'Google Account' : 'Citizen Account'}</span>
                    </div>
                    <div style="font-size:11.5px; color:#166534;">${this.currentUser.email || this.currentUser.mobile} • Profile details pre-filled for rapid issuance</div>
                  </div>
                </div>
                <a href="#login" class="btn btn-sm btn-outline" style="font-size:11.5px; height:28px; background:#ffffff;">Switch Account</a>
              </div>
            ` : `
              <div class="wizard-auth-alert wizard-auth-guest" style="display:flex; align-items:center; justify-content:space-between; padding:12px 16px; background:#f8fafc; border:1px solid var(--border-color); border-radius:var(--radius-md); margin-bottom:18px;">
                <div style="display:flex; align-items:center; gap:10px;">
                  <div style="width:32px; height:32px; background:#ffffff; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 1px 3px rgba(0,0,0,0.08); flex-shrink:0;">
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                  </div>
                  <div>
                    <div style="font-size:12.5px; font-weight:700; color:var(--text-main);">Fast-Track Application with Google</div>
                    <div style="font-size:11.5px; color:var(--text-muted);">Sign in or create account to auto-fill your name, email & photo in 1 click</div>
                  </div>
                </div>
                <a href="#login" class="btn btn-sm btn-outline" style="font-size:12px; height:30px; background:#ffffff; font-weight:600; gap:6px;">
                  Sign In / Sign Up
                </a>
              </div>
            `}

            <!-- SECTION 1: Personal Demographics & Blood Group -->
            <div class="form-section-block">
              <div class="section-title-wrap">
                <div class="section-badge-num">1</div>
                <div>
                  <h3 class="section-title">Identity & Demographics</h3>
                  <div class="section-sub">Legal details as officially recorded in national registers.</div>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group form-col-full">
                  <label class="form-label required">Full Legal Name</label>
                  <input type="text" class="form-input" id="inp-fullname" placeholder="e.g. Ramesh Kumar Verma" value="${this.formData.fullName}" required />
                  <span class="form-hint">Must match name on government identity document.</span>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2px;">
                    <label class="form-label required" style="margin-bottom:0;">Date of Birth</label>
                    <span id="badge-calculated-age" class="badge badge-teal" style="font-weight:700; font-size:11px;">
                      ${age ? `${age} Yrs` : 'Age: --'}
                    </span>
                  </div>
                  <div class="dob-tri-select">
                    <select class="form-select" id="sel-dob-day">
                      <option value="">Day</option>
                      ${Array.from({ length: 31 }, (_, i) => {
                        const d = String(i + 1).padStart(2, '0');
                        return `<option value="${d}" ${this.formData.dobDay === d ? 'selected' : ''}>${d}</option>`;
                      }).join('')}
                    </select>
                    <select class="form-select" id="sel-dob-month">
                      <option value="">Month</option>
                      ${[
                        { m: '01', name: 'Jan' }, { m: '02', name: 'Feb' }, { m: '03', name: 'Mar' },
                        { m: '04', name: 'Apr' }, { m: '05', name: 'May' }, { m: '06', name: 'Jun' },
                        { m: '07', name: 'Jul' }, { m: '08', name: 'Aug' }, { m: '09', name: 'Sep' },
                        { m: '10', name: 'Oct' }, { m: '11', name: 'Nov' }, { m: '12', name: 'Dec' }
                      ].map(item => `<option value="${item.m}" ${this.formData.dobMonth === item.m ? 'selected' : ''}>${item.name}</option>`).join('')}
                    </select>
                    <select class="form-select" id="sel-dob-year">
                      <option value="">Year</option>
                      ${Array.from({ length: 105 }, (_, i) => {
                        const y = String(2026 - i);
                        return `<option value="${y}" ${this.formData.dobYear === y ? 'selected' : ''}>${y}</option>`;
                      }).join('')}
                    </select>
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label required">Gender</label>
                  <div class="segmented-control" id="gender-segmented-control">
                    <button type="button" class="segmented-btn ${this.formData.gender === 'Male' ? 'active' : ''}" data-gender="Male">Male</button>
                    <button type="button" class="segmented-btn ${this.formData.gender === 'Female' ? 'active' : ''}" data-gender="Female">Female</button>
                    <button type="button" class="segmented-btn ${this.formData.gender === 'Other' ? 'active' : ''}" data-gender="Other">Other</button>
                  </div>
                </div>
              </div>

              <!-- Blood Group 8-Pill Interactive Grid -->
              <div class="form-row">
                <div class="form-group form-col-full">
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                    <label class="form-label required" style="margin-bottom:0;">
                      Blood Group 
                      <span style="color:var(--color-blood-red); font-weight:800; font-size:11.5px; margin-left:4px;">(Printed on Physical Card)</span>
                    </label>
                    <span style="font-size:11px; color:var(--color-blood-red); font-weight:600;">Trauma care parameter</span>
                  </div>
                  <div class="blood-pill-grid" id="blood-group-pills">
                    ${BLOOD_GROUPS.map(bg => `
                      <button type="button" class="blood-pill ${this.formData.bloodGroup === bg ? 'active' : ''}" data-bg="${bg}">
                        ${bg}
                      </button>
                    `).join('')}
                  </div>
                </div>
              </div>

              <!-- 10-Digit Health ID Pre-allocation -->
              <div class="form-row">
                <div class="form-group form-col-full">
                  <label class="form-label">Pre-Allocated 10-Digit National Health ID</label>
                  <div style="display:flex; gap:8px;">
                    <input type="text" class="form-input font-mono" value="${this.formData.healthIdPreview}" readonly style="font-weight:700; letter-spacing:0.12em; background-color:var(--bg-surface-subtle); color:var(--color-primary);" />
                    <button type="button" class="btn btn-outline btn-sm" id="btn-regen-healthid" title="Generate alternate available ID">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
                    </button>
                  </div>
                  <span class="form-hint">Lifelong 10-digit number in 5-5 partition.</span>
                </div>
              </div>
            </div>

            <!-- SECTION 2: Government KYC Document & Portrait Photo -->
            <div class="form-section-block">
              <div class="section-title-wrap">
                <div class="section-badge-num">2</div>
                <div>
                  <h3 class="section-title">Government KYC & Portrait Photo</h3>
                  <div class="section-sub">Identity authentication under DPDP Act 2023 with privacy tokenization.</div>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group form-col-full">
                  <label class="form-label required">Government Verification Document</label>
                  <select class="form-select" id="sel-kyc-type">
                    <option value="Aadhaar Card" ${this.formData.kycType === 'Aadhaar Card' ? 'selected' : ''}>Aadhaar Card (UIDAI Verified)</option>
                    <option value="Driving License" ${this.formData.kycType === 'Driving License' ? 'selected' : ''}>Driving License (MoRTH Sarathi)</option>
                    <option value="Voter ID" ${this.formData.kycType === 'Voter ID' ? 'selected' : ''}>Voter ID Card (Election Commission of India)</option>
                    <option value="Passport" ${this.formData.kycType === 'Passport' ? 'selected' : ''}>Indian Passport (Consular Services)</option>
                    <option value="PAN Card" ${this.formData.kycType === 'PAN Card' ? 'selected' : ''}>PAN Card (Income Tax Department)</option>
                  </select>
                </div>
              </div>

              <!-- Dynamic Document Number & Aadhaar OTP Row -->
              <div class="form-row">
                <div class="form-group form-col-full" id="kyc-number-group">
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2px;">
                    <label class="form-label required" id="lbl-kyc-number" style="margin-bottom:0;">
                      ${this.getKycNumberLabel()}
                    </label>
                    ${this.formData.kycType === 'Aadhaar Card' && this.formData.isAadhaarVerified ? `
                      <span class="badge badge-teal" style="font-weight:700; font-size:11px; display:inline-flex; align-items:center; gap:4px;">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg>
                        UIDAI Verified
                      </span>
                    ` : ''}
                  </div>
                  <div style="display:flex; gap:8px;">
                    <input 
                      type="text" 
                      class="form-input font-mono" 
                      id="inp-kyc-number" 
                      placeholder="${this.getKycPlaceholder()}" 
                      value="${this.formData.kycNumber}" 
                      maxlength="${this.getKycMaxlength()}" 
                      style="font-weight:700; letter-spacing:0.08em; font-size:14px;" 
                      ${this.formData.kycType === 'Aadhaar Card' && this.formData.isAadhaarVerified ? 'readonly' : ''}
                      required 
                    />
                    ${this.formData.kycType === 'Aadhaar Card' ? `
                      <button 
                        type="button" 
                        class="btn btn-sm ${this.formData.isAadhaarVerified ? 'btn-secondary' : 'btn-primary'}" 
                        id="btn-trigger-aadhaar-otp" 
                        style="white-space:nowrap; padding:0 14px;"
                        ${this.formData.isAadhaarVerified ? 'disabled' : ''}
                      >
                        ${this.formData.isAadhaarVerified ? 'Aadhaar Verified' : 'Verify with UIDAI OTP'}
                      </button>
                    ` : ''}
                  </div>
                  <div id="aadhaar-status-hint">
                    ${this.formData.kycType === 'Aadhaar Card' ? (
                      this.formData.isAadhaarVerified ? `
                        <span class="badge badge-teal" style="margin-top:4px; font-weight:700; font-size:11px;">
                          UIDAI e-KYC Verified (Token: UIDAI-${(this.formData.kycNumber || '1234').replace(/\s/g,'').slice(-4)}-AUTH)
                        </span>
                      ` : `
                        <span class="form-hint">Enter your 12-digit Aadhaar number and click 'Verify with UIDAI OTP' to authenticate.</span>
                      `
                    ) : `
                      <span class="form-hint">Enter valid document number as printed on your official document.</span>
                    `}
                  </div>
                </div>
              </div>

              <!-- KYC Document Input -->
              <div class="form-row">
                <div class="form-group form-col-full">
                  <label class="form-label required">Government KYC Document Copy (Front & Back)</label>
                  
                  ${this.formData.kycDocData ? `
                    <!-- Detailed Upload Preview Card for KYC Document -->
                    <div class="detailed-upload-card" id="kyc-doc-detail-card">
                      <div class="duc-preview-thumb">
                        ${this.formData.kycDocData.startsWith('data:image') ? `
                          <img src="${this.formData.kycDocData}" class="duc-img" alt="KYC Document Preview" />
                        ` : `
                          <div class="duc-pdf-badge">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                            <span>PDF</span>
                          </div>
                        `}
                      </div>
                      <div class="duc-meta-col">
                        <div class="duc-filename">${this.formData.kycDocName || 'KYC_Document.jpg'}</div>
                        <div class="duc-specs">
                          <span>${this.formData.kycDocSize || '340 KB'}</span> • 
                          <span>${this.formData.kycType}</span> • 
                          <span class="duc-verified-text">Ready for Tokenized Storage</span>
                        </div>
                        <div class="duc-badge-row">
                          <span class="badge badge-teal" style="font-size:10px;">Scanned & Validated</span>
                          <span class="badge badge-slate" style="font-size:10px;">DPDP 2023 Encrypted</span>
                        </div>
                      </div>
                      <div class="duc-action-col">
                        <button type="button" class="btn btn-sm btn-outline" id="btn-reupload-kyc">Change</button>
                        <button type="button" class="btn btn-sm btn-ghost" id="btn-remove-kyc" style="color:#dc2626;">Remove</button>
                      </div>
                    </div>
                  ` : `
                    <div class="media-action-row">
                      <button type="button" class="btn btn-sm btn-outline" id="btn-kyc-mode-upload" style="flex:1;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                        Upload ID File
                      </button>
                      <button type="button" class="btn btn-sm btn-outline" id="btn-kyc-mode-camera" style="flex:1;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                        Capture via Camera
                      </button>
                    </div>

                    <div id="kyc-upload-zone" class="upload-clean-box">
                      <input type="file" id="inp-kyc-file" accept="image/*,application/pdf" style="display:none;" />
                      <div style="font-weight:600; font-size:12.5px; color:var(--text-main);">Click to browse or drop Government ID copy</div>
                      <div style="font-size:11.5px; color:var(--text-muted); margin-top:2px;">PDF, PNG, or JPG (up to 10 MB)</div>
                    </div>

                    <!-- Webcam Capture Feed for KYC -->
                    <div id="kyc-camera-zone" style="display:none; text-align:center;">
                      <div class="webcam-live-box">
                        <video id="kyc-camera-video" autoplay playsinline></video>
                        <div class="camera-guide-overlay camera-guide-doc">Place ID Card Flat Inside Frame</div>
                      </div>
                      <div style="display:flex; justify-content:center; gap:8px;">
                        <button type="button" class="btn btn-primary btn-sm" id="btn-kyc-snap">Capture ID Frame</button>
                        <button type="button" class="btn btn-outline btn-sm" id="btn-kyc-cam-cancel">Cancel Camera</button>
                      </div>
                    </div>
                  `}
                </div>
              </div>

              <!-- Cardholder Photo Input -->
              <div class="form-row">
                <div class="form-group form-col-full">
                  <label class="form-label required">Cardholder Portrait Photo (Printed on Physical CR80 Card)</label>
                  
                  ${this.formData.photoUrl ? `
                    <!-- Detailed Upload Preview Card for Portrait Photo -->
                    <div class="detailed-upload-card" id="photo-detail-card">
                      <div class="duc-preview-thumb photo-thumb-circle">
                        <img src="${this.formData.photoUrl}" class="duc-photo-img" alt="Cardholder Portrait" />
                      </div>
                      <div class="duc-meta-col">
                        <div class="duc-filename">${this.formData.photoName || 'Cardholder_Portrait_HD.jpg'}</div>
                        <div class="duc-specs">
                          <span>CR80 PVC Compliant (35 × 45 mm)</span> • 
                          <span>${this.formData.photoSize || '185 KB'}</span> • 
                          <span class="duc-verified-text">High-Resolution</span>
                        </div>
                        <div class="duc-badge-row">
                          <span class="badge badge-teal" style="font-size:10px;">Laser-Etch Ready</span>
                          <span class="badge badge-blue" style="font-size:10px;">Synced to Live Physical Card</span>
                        </div>
                      </div>
                      <div class="duc-action-col">
                        <button type="button" class="btn btn-sm btn-outline" id="btn-reupload-photo">Change</button>
                        <button type="button" class="btn btn-sm btn-ghost" id="btn-remove-photo" style="color:#dc2626;">Remove</button>
                      </div>
                    </div>
                  ` : `
                    <div class="media-action-row">
                      <button type="button" class="btn btn-sm btn-outline" id="btn-photo-mode-camera" style="flex:1;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                        Use Live Webcam
                      </button>
                      <button type="button" class="btn btn-sm btn-outline" id="btn-photo-mode-upload" style="flex:1;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                        Upload Photo
                      </button>
                    </div>

                    <div id="photo-upload-zone" class="upload-clean-box">
                      <input type="file" id="inp-photo-file" accept="image/jpeg,image/png,image/webp" style="display:none;" />
                      <div style="font-weight:600; font-size:12.5px; color:var(--text-main);">Click to browse passport portrait</div>
                      <div style="font-size:11.5px; color:var(--text-muted); margin-top:2px;">Light background recommended. Max 5 MB.</div>
                    </div>

                    <div id="photo-camera-zone" style="display:none; text-align:center;">
                      <div class="webcam-live-box">
                        <video id="photo-camera-video" autoplay playsinline></video>
                        <div class="camera-guide-overlay camera-guide-portrait">Align Face Inside Oval</div>
                      </div>
                      <div style="display:flex; justify-content:center; gap:8px;">
                        <button type="button" class="btn btn-primary btn-sm" id="btn-photo-snap">Snap Portrait Photo</button>
                        <button type="button" class="btn btn-outline btn-sm" id="btn-photo-cam-cancel">Cancel Camera</button>
                      </div>
                    </div>
                  `}
                </div>
              </div>
            </div>

            <!-- SECTION 3: Contact, Mobile OTP & Doorstep Delivery -->
            <div class="form-section-block">
              <div class="section-title-wrap">
                <div class="section-badge-num">3</div>
                <div>
                  <h3 class="section-title">Contact, OTP & Delivery Address</h3>
                  <div class="section-sub">Physical card dispatch address & emergency trauma contact.</div>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label required">Primary Mobile Number</label>
                  <div style="display:flex; gap:6px;">
                    <div style="display:flex; align-items:center; padding:0 10px; background:var(--bg-surface-subtle); border:1px solid var(--border-color); border-radius:var(--radius-md); font-weight:700; color:var(--text-secondary); font-size:12.5px;">
                      +91
                    </div>
                    <input type="tel" class="form-input" id="inp-mobile" placeholder="98765 43210" maxlength="10" value="${this.formData.mobile}" required />
                    <button type="button" class="btn btn-primary btn-sm" id="btn-trigger-otp" style="white-space:nowrap; padding:0 14px;">
                      ${this.formData.isOtpVerified ? 'Verified' : 'Verify Mobile'}
                    </button>
                  </div>
                  <div id="otp-status-badge" style="margin-top:3px;">
                    ${this.formData.isOtpVerified ? `
                      <span class="badge badge-teal" style="font-weight:700;">Mobile Verified via OTP</span>
                    ` : `
                      <span class="form-hint">Click 'Verify Mobile' to receive OTP code.</span>
                    `}
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label required">Email Address (Gmail / Corporate)</label>
                  <div style="display:flex; gap:6px;">
                    <input type="email" class="form-input" id="inp-email" placeholder="name@gmail.com" value="${this.formData.email}" required />
                    <button type="button" class="btn btn-sm ${this.formData.isEmailVerified ? 'btn-secondary' : 'btn-primary'}" id="btn-trigger-email-otp" style="white-space:nowrap; padding:0 14px;" ${this.formData.isEmailVerified ? 'disabled' : ''}>
                      ${this.formData.isEmailVerified ? 'Verified' : 'Verify Email'}
                    </button>
                  </div>
                  <div id="email-otp-status-badge" style="margin-top:3px;">
                    ${this.formData.isEmailVerified ? `
                      <span class="badge badge-teal" style="font-weight:700;">Email Verified via OTP</span>
                    ` : `
                      <span class="form-hint">Click 'Verify Email' to receive 6-digit OTP code on your Gmail.</span>
                    `}
                  </div>
                </div>
              </div>

              <!-- Emergency Trauma Contact -->
              <div class="form-row">
                <div class="form-group form-col-full">
                  <label class="form-label required">Designated Emergency Contact Person (PRD ACC-09)</label>
                  <input type="text" class="form-input" id="inp-emergency-name" placeholder="e.g. Sunita Sharma" value="${this.formData.emergencyName}" required />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label required">Emergency Relationship</label>
                  <select class="form-select" id="sel-emergency-relation">
                    <option value="Spouse" ${this.formData.emergencyRelation === 'Spouse' ? 'selected' : ''}>Spouse</option>
                    <option value="Parent" ${this.formData.emergencyRelation === 'Parent' ? 'selected' : ''}>Parent</option>
                    <option value="Child" ${this.formData.emergencyRelation === 'Child' ? 'selected' : ''}>Child</option>
                    <option value="Sibling" ${this.formData.emergencyRelation === 'Sibling' ? 'selected' : ''}>Sibling</option>
                    <option value="Guardian" ${this.formData.emergencyRelation === 'Guardian' ? 'selected' : ''}>Guardian</option>
                    <option value="Friend" ${this.formData.emergencyRelation === 'Friend' ? 'selected' : ''}>Trusted Relative</option>
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label required">Emergency Phone (+91)</label>
                  <input type="tel" class="form-input" id="inp-emergency-phone" placeholder="98765 00000" maxlength="10" value="${this.formData.emergencyPhone}" required />
                </div>
              </div>

              <!-- Delivery Address -->
              <div class="form-row">
                <div class="form-group form-col-full">
                  <label class="form-label required">Flat / House / Block No. & Street Delivery Address</label>
                  <input type="text" class="form-input" id="inp-street" placeholder="e.g. Flat 402, Sai Residency, MG Road" value="${this.formData.street}" required />
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label required">City / District / Town</label>
                  <input type="text" class="form-input" id="inp-city" placeholder="e.g. New Delhi" value="${this.formData.city}" required />
                </div>

                <div class="form-group">
                  <label class="form-label required">State / Union Territory (36 States/UTs)</label>
                  <select class="form-select" id="sel-state">
                    ${INDIAN_STATES.map(st => `<option value="${st}" ${this.formData.state === st ? 'selected' : ''}>${st}</option>`).join('')}
                  </select>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label required">6-Digit PIN Code</label>
                  <input type="text" class="form-input font-mono" id="inp-pincode" placeholder="110016" maxlength="6" value="${this.formData.pinCode}" style="font-weight:700;" required />
                </div>

                <div class="form-group">
                  <label class="form-label">Delivery Service</label>
                  <div style="display:flex; align-items:center; gap:8px; padding:8px 12px; background:var(--bg-surface-subtle); border:1px solid var(--border-color); border-radius:var(--radius-md);">
                    <span class="badge badge-teal" style="font-weight:700;">SpeedPost</span>
                    <span style="font-size:12px; font-weight:600; color:var(--text-main);">India Post Tracked Insured Delivery</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Submit Action Bar with Consent -->
            <div class="submit-action-bar">
              <label style="display:flex; align-items:flex-start; gap:10px; cursor:pointer; max-width:560px;">
                <input type="checkbox" id="chk-dpdp-consent" ${this.formData.agreedToConsent ? 'checked' : ''} style="margin-top:3px; accent-color:var(--color-primary);" />
                <span style="font-size:12px; color:var(--text-main); line-height:1.4;">
                  I certify that all details provided are true. I consent to generation of my 10-digit National Health ID and creation of my physical CR80 PVC HealthCard under <strong>DPDP Act 2023</strong>.
                </span>
              </label>

              <button type="button" class="btn btn-primary" id="btn-submit-application" style="height:42px; padding:0 24px; font-size:14px; font-weight:600;">
                Proceed to Payment & Submit (₹50)
              </button>
            </div>

          </form>
        </div>

      </div>

      <!-- Real-time Mobile OTP Verification Modal -->
      <div id="modal-otp" class="modal-backdrop" style="display:none;">
        <div class="modal-dialog">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <div style="width:28px; height:28px; border-radius:50%; background:var(--color-primary-light); color:var(--color-primary); display:flex; align-items:center; justify-content:center;">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
              </div>
              <h3 style="font-size:16px; font-weight:700; color:var(--text-main); margin:0;">Verify Mobile via OTP</h3>
            </div>
            <button type="button" id="btn-close-otp-modal" style="background:none; border:none; font-size:20px; cursor:pointer; color:var(--text-muted);">&times;</button>
          </div>

          <p style="font-size:12.5px; color:var(--text-muted); margin-bottom:16px;">
            A simulated 6-digit verification code has been dispatched to <strong id="lbl-otp-phone">+91 ••••• •••••</strong>.
          </p>

          <div class="form-group" style="margin-bottom:18px;">
            <label class="form-label required">Enter 6-Digit OTP</label>
            <input type="text" class="form-input" id="inp-modal-otp" placeholder="••••••" maxlength="6" style="font-family:var(--font-family-mono); font-size:18px; letter-spacing:0.25em; text-align:center; font-weight:700;" />
            <span class="form-hint" style="text-align:center;">Enter code from notification prompt.</span>
          </div>

          <div style="display:flex; justify-content:flex-end; gap:8px;">
            <button type="button" class="btn btn-outline btn-sm" id="btn-cancel-otp">Cancel</button>
            <button type="button" class="btn btn-primary btn-sm" id="btn-verify-modal-otp">Verify OTP</button>
          </div>
        </div>
      </div>

      <!-- Real-time Aadhaar UIDAI OTP Verification Modal -->
      <div id="modal-aadhaar-otp" class="modal-backdrop" style="display:none;">
        <div class="modal-dialog" style="max-width:440px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1px solid var(--border-color); padding-bottom:10px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <div style="width:32px; height:32px; border-radius:50%; background:#f0fdf4; color:#15803d; border:1px solid #bbf7d0; display:flex; align-items:center; justify-content:center;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <div>
                <h3 style="font-size:16px; font-weight:700; color:var(--text-main); margin:0;">UIDAI Aadhaar Verification</h3>
                <span style="font-size:11px; color:var(--text-muted);">Unique Identification Authority of India e-KYC</span>
              </div>
            </div>
            <button type="button" id="btn-close-aadhaar-modal" style="background:none; border:none; font-size:20px; cursor:pointer; color:var(--text-muted);">&times;</button>
          </div>

          <p style="font-size:12.5px; color:var(--text-muted); margin-bottom:16px; line-height:1.45;">
            A 6-digit Aadhaar authentication OTP has been dispatched to the mobile number registered with Aadhaar <strong id="lbl-aadhaar-last4" style="font-family:var(--font-family-mono);">•••• •••• ••••</strong>.
          </p>

          <div class="form-group" style="margin-bottom:18px;">
            <label class="form-label required">Enter 6-Digit Aadhaar OTP</label>
            <input type="text" class="form-input" id="inp-modal-aadhaar-otp" placeholder="••••••" maxlength="6" style="font-family:var(--font-family-mono); font-size:18px; letter-spacing:0.25em; text-align:center; font-weight:700;" />
            <span class="form-hint" style="text-align:center;">Simulated UIDAI SMS Code auto-dispatched to prompt.</span>
          </div>

          <div style="display:flex; justify-content:flex-end; gap:8px;">
            <button type="button" class="btn btn-outline btn-sm" id="btn-cancel-aadhaar-otp">Cancel</button>
            <button type="button" class="btn btn-primary btn-sm" id="btn-verify-modal-aadhaar-otp">Verify Aadhaar e-KYC</button>
          </div>
        </div>
      </div>

      <!-- Real-time Gmail / Email OTP Verification Modal -->
      <div id="modal-email-otp" class="modal-backdrop" style="display:none;">
        <div class="modal-dialog" style="max-width:440px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1px solid var(--border-color); padding-bottom:10px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <div style="width:32px; height:32px; border-radius:50%; background:#eff6ff; color:#1d4ed8; border:1px solid #bfdbfe; display:flex; align-items:center; justify-content:center;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </div>
              <div>
                <h3 style="font-size:16px; font-weight:700; color:var(--text-main); margin:0;">Gmail / Email Verification</h3>
                <span style="font-size:11px; color:var(--text-muted);">National Health Registry Email Authentication</span>
              </div>
            </div>
            <button type="button" id="btn-close-email-modal" style="background:none; border:none; font-size:20px; cursor:pointer; color:var(--text-muted);">&times;</button>
          </div>

          <p style="font-size:12.5px; color:var(--text-muted); margin-bottom:16px; line-height:1.45;">
            A 6-digit security code has been dispatched to <strong id="lbl-email-otp-target">citizen@gmail.com</strong>.
          </p>

          <div class="form-group" style="margin-bottom:18px;">
            <label class="form-label required">Enter 6-Digit Email OTP</label>
            <input type="text" class="form-input" id="inp-modal-email-otp" placeholder="••••••" maxlength="6" style="font-family:var(--font-family-mono); font-size:18px; letter-spacing:0.25em; text-align:center; font-weight:700;" />
            <span class="form-hint" style="text-align:center;">Enter code from Gmail security notification.</span>
          </div>

          <div style="display:flex; justify-content:flex-end; gap:8px;">
            <button type="button" class="btn btn-outline btn-sm" id="btn-cancel-email-otp">Cancel</button>
            <button type="button" class="btn btn-primary btn-sm" id="btn-verify-modal-email-otp">Verify Email Code</button>
          </div>
        </div>
      </div>

      <!-- Payment Gateway & Card Issuance Fee Modal -->
      <div id="modal-payment" class="modal-backdrop" style="display:none;">
        <div class="modal-dialog" style="max-width:480px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; border-bottom:1px solid var(--border-color); padding-bottom:10px;">
            <div style="display:flex; align-items:center; gap:8px;">
              <div style="width:28px; height:28px; border-radius:50%; background:var(--color-primary-light); color:var(--color-primary); display:flex; align-items:center; justify-content:center;">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
              </div>
              <div>
                <h3 style="font-size:16px; font-weight:700; color:var(--text-main); margin:0;">National HealthCard Issuance Fee</h3>
                <span style="font-size:11px; color:var(--text-muted);">Ministry of Health & Family Welfare Gateway</span>
              </div>
            </div>
            <button type="button" id="btn-close-payment-modal" style="background:none; border:none; font-size:20px; cursor:pointer; color:var(--text-muted);">&times;</button>
          </div>

          <!-- Fee Summary Breakdown Table -->
          <div style="background:var(--bg-surface-subtle); border:1px solid var(--border-color); border-radius:var(--radius-md); padding:12px 16px; margin-bottom:16px; font-size:12.5px;">
            <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
              <span style="color:var(--text-secondary);">CR80 PVC Laser-Etched Card Substrate</span>
              <strong style="font-family:var(--font-family-mono);">₹50.00</strong>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
              <span style="color:var(--text-secondary);">India Post SpeedPost Insured Courier</span>
              <span style="color:#166534; font-weight:700;">FREE (Govt Subsidized)</span>
            </div>
            <div style="display:flex; justify-content:space-between; border-top:1px dashed var(--border-strong); padding-top:8px; margin-top:8px;">
              <strong style="color:var(--text-main); font-size:13.5px;">Total Amount Payable</strong>
              <strong style="color:var(--color-primary); font-family:var(--font-family-mono); font-size:16px;">₹50.00</strong>
            </div>
          </div>

          <!-- Payment Mode Selection -->
          <div style="font-size:12px; font-weight:700; color:var(--text-main); margin-bottom:6px;">
            Select Payment Method:
          </div>
          <div class="payment-option-grid" id="payment-options">
            <div class="payment-option-card active" data-mode="UPI / QR">
              <div class="payment-option-title">UPI / QR</div>
              <div class="payment-option-sub">GPay, PhonePe, BHIM</div>
            </div>
            <div class="payment-option-card" data-mode="Debit Card">
              <div class="payment-option-title">Cards</div>
              <div class="payment-option-sub">RuPay, Visa, MC</div>
            </div>
            <div class="payment-option-card" data-mode="Net Banking">
              <div class="payment-option-title">Net Banking</div>
              <div class="payment-option-sub">SBI, HDFC, ICICI</div>
            </div>
          </div>

          <!-- Simulated UPI Display -->
          <div id="upi-display-area" style="text-align:center; padding:12px; background:#f8fafc; border:1px solid #e2e8f0; border-radius:var(--radius-md); margin-bottom:16px;">
            <div style="font-size:11.5px; color:var(--text-muted); margin-bottom:4px;">Virtual Payment Address: <strong>healthcard@gov</strong></div>
            <div style="font-size:11px; color:#166534; font-weight:600;">Simulated Gateway Test Mode • 1-Click Instant Authorization</div>
          </div>

          <div style="display:flex; justify-content:flex-end; gap:8px;">
            <button type="button" class="btn btn-outline btn-sm" id="btn-cancel-payment">Cancel</button>
            <button type="button" class="btn btn-primary" id="btn-confirm-payment" style="padding:0 20px; font-weight:600;">
              Pay ₹50.00 & Generate Receipt
            </button>
          </div>
        </div>
      </div>

      <!-- Official Printable Acknowledgement Slip & Receipt Container -->
      <div id="application-receipt-container" style="display:none;"></div>
    `;
  }

  bindEvents() {
    // 1. Flip Preview Button
    const flipBtn = document.getElementById('btn-flip-preview');
    const lblFlip = document.getElementById('lbl-flip-btn');
    const frontCard = document.getElementById('preview-card-front');
    const backCard = document.getElementById('preview-card-back');

    if (flipBtn && frontCard && backCard) {
      flipBtn.onclick = () => {
        this.isCardFlipped = !this.isCardFlipped;
        frontCard.style.display = this.isCardFlipped ? 'none' : 'flex';
        backCard.style.display = this.isCardFlipped ? 'flex' : 'none';
        if (lblFlip) lblFlip.textContent = this.isCardFlipped ? 'View Front' : 'View Back';
        if (this.isCardFlipped) this.updateCardPreview();
      };
    }

    // 2. Color Theme Switcher
    this.container.querySelectorAll('.theme-pill').forEach(pill => {
      pill.onclick = () => {
        const theme = pill.dataset.theme;
        this.formData.cardTemplate = theme;
        this.container.querySelectorAll('.theme-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        if (frontCard) frontCard.className = `healthcard-physical template-${theme}`;
      };
    });

    // 3. Name Real-time Update
    const inpName = document.getElementById('inp-fullname');
    if (inpName) {
      inpName.oninput = (e) => {
        this.formData.fullName = e.target.value;
        this.updateCardPreview();
      };
    }

    // 4. DOB Real-time Update
    const selDay = document.getElementById('sel-dob-day');
    const selMonth = document.getElementById('sel-dob-month');
    const selYear = document.getElementById('sel-dob-year');
    const updateDob = () => {
      if (selDay && selMonth && selYear) {
        this.formData.dobDay = selDay.value;
        this.formData.dobMonth = selMonth.value;
        this.formData.dobYear = selYear.value;
        if (selDay.value && selMonth.value && selYear.value) {
          this.formData.dob = `${selYear.value}-${selMonth.value}-${selDay.value}`;
          const age = calculateAge(this.formData.dob);
          const badge = document.getElementById('badge-calculated-age');
          if (badge) badge.textContent = age ? `${age} Yrs` : 'Age: --';
          this.updateCardPreview();
        }
      }
    };
    if (selDay) selDay.onchange = updateDob;
    if (selMonth) selMonth.onchange = updateDob;
    if (selYear) selYear.onchange = updateDob;

    // 5. Gender Segmented Control
    this.container.querySelectorAll('#gender-segmented-control .segmented-btn').forEach(btn => {
      btn.onclick = () => {
        this.container.querySelectorAll('#gender-segmented-control .segmented-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.formData.gender = btn.dataset.gender;
        this.updateCardPreview();
      };
    });

    // 6. Blood Group 8-Pill Selector Grid
    this.container.querySelectorAll('#blood-group-pills .blood-pill').forEach(pill => {
      pill.onclick = () => {
        this.container.querySelectorAll('#blood-group-pills .blood-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        this.formData.bloodGroup = pill.dataset.bg;
        this.updateCardPreview();
      };
    });

    // 7. Regenerate Health ID
    const btnRegenId = document.getElementById('btn-regen-healthid');
    if (btnRegenId) {
      btnRegenId.onclick = () => {
        this.formData.healthIdPreview = generateHealthId();
        showToast('Generated fresh 10-digit Health ID: ' + this.formData.healthIdPreview, 'info');
        const frontId = document.getElementById('card-front-healthid');
        const serial = document.getElementById('card-back-serial');
        if (frontId) frontId.textContent = this.formData.healthIdPreview;
        if (serial) serial.textContent = `SN: ${this.formData.healthIdPreview.replace(/\s+/g, '')}`;
        this.updateCardPreview();
      };
    }

    // 8. KYC Document selection & modes
    const selKyc = document.getElementById('sel-kyc-type');
    if (selKyc) {
      selKyc.onchange = (e) => {
        this.formData.kycType = e.target.value;
        this.formData.kycNumber = '';
        this.formData.isAadhaarVerified = false;
        this.render();
        this.bindEvents();
        this.updateCardPreview();
      };
    }

    // Dynamic KYC Document Number Input
    const inpKycNum = document.getElementById('inp-kyc-number');
    if (inpKycNum) {
      inpKycNum.oninput = (e) => {
        if (this.formData.kycType === 'Aadhaar Card') {
          const formatted = this.formatAadhaar(e.target.value);
          e.target.value = formatted;
          this.formData.kycNumber = formatted;
          this.formData.isAadhaarVerified = false;
          const btnAadhaar = document.getElementById('btn-trigger-aadhaar-otp');
          if (btnAadhaar) {
            btnAadhaar.disabled = false;
            btnAadhaar.className = 'btn btn-sm btn-primary';
            btnAadhaar.textContent = 'Verify with UIDAI OTP';
          }
          const hint = document.getElementById('aadhaar-status-hint');
          if (hint) {
            hint.innerHTML = `<span class="form-hint">Enter your 12-digit Aadhaar number and click 'Verify with UIDAI OTP' to authenticate.</span>`;
          }
        } else if (this.formData.kycType === 'PAN Card') {
          e.target.value = e.target.value.toUpperCase();
          this.formData.kycNumber = e.target.value;
        } else {
          this.formData.kycNumber = e.target.value;
        }
      };
    }

    // Aadhaar OTP Verification Trigger & Modal
    const btnTriggerAadhaar = document.getElementById('btn-trigger-aadhaar-otp');
    if (btnTriggerAadhaar) {
      btnTriggerAadhaar.onclick = () => this.openAadhaarOtpModal();
    }
    const btnCloseAadhaar = document.getElementById('btn-close-aadhaar-modal');
    const btnCancelAadhaar = document.getElementById('btn-cancel-aadhaar-otp');
    const modalAadhaar = document.getElementById('modal-aadhaar-otp');
    const closeAadhaarModal = () => { if (modalAadhaar) modalAadhaar.style.display = 'none'; };
    if (btnCloseAadhaar) btnCloseAadhaar.onclick = closeAadhaarModal;
    if (btnCancelAadhaar) btnCancelAadhaar.onclick = closeAadhaarModal;

    const btnVerifyAadhaar = document.getElementById('btn-verify-modal-aadhaar-otp');
    const inpModalAadhaar = document.getElementById('inp-modal-aadhaar-otp');
    if (btnVerifyAadhaar && inpModalAadhaar) {
      btnVerifyAadhaar.onclick = () => {
        const val = inpModalAadhaar.value.trim();
        if (val.length !== 6) {
          showToast('Please enter the 6-digit Aadhaar OTP', 'warning');
          return;
        }
        this.formData.isAadhaarVerified = true;
        closeAadhaarModal();
        showToast('Aadhaar e-KYC verified successfully with UIDAI!', 'success');
        this.render();
        this.bindEvents();
        this.updateCardPreview();
      };
    }

    // KYC File upload & Camera controls
    const btnKycUpload = document.getElementById('btn-kyc-mode-upload');
    const btnKycCam = document.getElementById('btn-kyc-mode-camera');
    const kycUploadZone = document.getElementById('kyc-upload-zone');
    const kycCameraZone = document.getElementById('kyc-camera-zone');
    const inpKycFile = document.getElementById('inp-kyc-file');
    const btnReuploadKyc = document.getElementById('btn-reupload-kyc');
    const btnRemoveKyc = document.getElementById('btn-remove-kyc');

    if (btnReuploadKyc && inpKycFile) btnReuploadKyc.onclick = () => inpKycFile.click();
    if (btnRemoveKyc) {
      btnRemoveKyc.onclick = () => {
        this.formData.kycDocData = null;
        this.formData.kycDocName = '';
        this.formData.kycDocSize = '';
        this.render();
        this.bindEvents();
      };
    }

    if (btnKycUpload && kycUploadZone && kycCameraZone) {
      btnKycUpload.onclick = () => {
        this.stopCamera();
        kycUploadZone.style.display = 'block';
        kycCameraZone.style.display = 'none';
      };
    }
    if (btnKycCam && kycUploadZone && kycCameraZone) {
      btnKycCam.onclick = () => {
        kycUploadZone.style.display = 'none';
        kycCameraZone.style.display = 'block';
        this.startCamera('kyc-camera-video');
      };
    }
    if (kycUploadZone && inpKycFile) {
      kycUploadZone.onclick = () => inpKycFile.click();
      inpKycFile.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          this.formData.kycDocName = file.name;
          this.formData.kycDocSize = (file.size / 1024).toFixed(1) + ' KB';
          this.formData.kycDocType = file.type;
          const reader = new FileReader();
          reader.onload = (re) => {
            this.formData.kycDocData = re.target.result;
            showToast('Document uploaded: ' + file.name + ` (${this.formData.kycDocSize})`, 'success');
            this.render();
            this.bindEvents();
          };
          reader.readAsDataURL(file);
        }
      };
    }
    const btnKycSnap = document.getElementById('btn-kyc-snap');
    if (btnKycSnap) {
      btnKycSnap.onclick = () => {
        const dataUrl = this.captureCameraFrame('kyc-camera-video');
        if (dataUrl) {
          this.formData.kycDocData = dataUrl;
          this.formData.kycDocName = `KYC_Webcam_${Date.now()}.png`;
          this.formData.kycDocSize = '320 KB';
          this.stopCamera();
          showToast('KYC document captured', 'success');
          this.render();
          this.bindEvents();
        }
      };
    }
    const btnKycCamCancel = document.getElementById('btn-kyc-cam-cancel');
    if (btnKycCamCancel) {
      btnKycCamCancel.onclick = () => {
        this.stopCamera();
        if (kycUploadZone) kycUploadZone.style.display = 'block';
        if (kycCameraZone) kycCameraZone.style.display = 'none';
      };
    }

    // 9. Photo capture & upload
    const btnPhotoUpload = document.getElementById('btn-photo-mode-upload');
    const btnPhotoCam = document.getElementById('btn-photo-mode-camera');
    const photoUploadZone = document.getElementById('photo-upload-zone');
    const photoCameraZone = document.getElementById('photo-camera-zone');
    const inpPhotoFile = document.getElementById('inp-photo-file');
    const btnReuploadPhoto = document.getElementById('btn-reupload-photo');
    const btnRemovePhoto = document.getElementById('btn-remove-photo');

    if (btnReuploadPhoto && inpPhotoFile) btnReuploadPhoto.onclick = () => inpPhotoFile.click();
    if (btnRemovePhoto) {
      btnRemovePhoto.onclick = () => {
        this.formData.photoUrl = '';
        this.formData.photoName = '';
        this.formData.photoSize = '';
        this.render();
        this.bindEvents();
        this.updateCardPreview();
      };
    }

    if (btnPhotoUpload && photoUploadZone && photoCameraZone) {
      btnPhotoUpload.onclick = () => {
        this.stopCamera();
        photoUploadZone.style.display = 'block';
        photoCameraZone.style.display = 'none';
      };
    }
    if (btnPhotoCam && photoUploadZone && photoCameraZone) {
      btnPhotoCam.onclick = () => {
        photoUploadZone.style.display = 'none';
        photoCameraZone.style.display = 'block';
        this.startCamera('photo-camera-video');
      };
    }
    if (photoUploadZone && inpPhotoFile) {
      photoUploadZone.onclick = () => inpPhotoFile.click();
      inpPhotoFile.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          this.formData.photoName = file.name;
          this.formData.photoSize = (file.size / 1024).toFixed(1) + ' KB';
          const reader = new FileReader();
          reader.onload = (re) => {
            this.formData.photoUrl = re.target.result;
            showToast('Portrait photo uploaded' + ` (${this.formData.photoSize})`, 'success');
            this.render();
            this.bindEvents();
            this.updateCardPreview();
          };
          reader.readAsDataURL(file);
        }
      };
    }
    const btnPhotoSnap = document.getElementById('btn-photo-snap');
    if (btnPhotoSnap) {
      btnPhotoSnap.onclick = () => {
        const dataUrl = this.captureCameraFrame('photo-camera-video');
        if (dataUrl) {
          this.formData.photoUrl = dataUrl;
          this.formData.photoName = `Portrait_Webcam_${Date.now()}.png`;
          this.formData.photoSize = '210 KB';
          this.stopCamera();
          showToast('Portrait photo captured', 'success');
          this.render();
          this.bindEvents();
          this.updateCardPreview();
        }
      };
    }
    const btnPhotoCamCancel = document.getElementById('btn-photo-cam-cancel');
    if (btnPhotoCamCancel) {
      btnPhotoCamCancel.onclick = () => {
        this.stopCamera();
        if (photoUploadZone) photoUploadZone.style.display = 'block';
        if (photoCameraZone) photoCameraZone.style.display = 'none';
      };
    }

    // 10. Contact & OTP
    const inpMobile = document.getElementById('inp-mobile');
    if (inpMobile) {
      inpMobile.oninput = (e) => {
        this.formData.mobile = e.target.value.replace(/\D/g, '').slice(0, 10);
      };
    }
    const btnTriggerOtp = document.getElementById('btn-trigger-otp');
    if (btnTriggerOtp) {
      btnTriggerOtp.onclick = () => this.openOtpModal();
    }
    const inpEmail = document.getElementById('inp-email');
    if (inpEmail) {
      inpEmail.oninput = (e) => {
        this.formData.email = e.target.value;
        this.formData.isEmailVerified = false;
        const btnEm = document.getElementById('btn-trigger-email-otp');
        if (btnEm) {
          btnEm.disabled = false;
          btnEm.className = 'btn btn-sm btn-primary';
          btnEm.textContent = 'Verify Email';
        }
        const badge = document.getElementById('email-otp-status-badge');
        if (badge) {
          badge.innerHTML = `<span class="form-hint">Click 'Verify Email' to receive 6-digit OTP code on your Gmail.</span>`;
        }
      };
    }

    // Email OTP Trigger & Modal
    const btnTriggerEmailOtp = document.getElementById('btn-trigger-email-otp');
    if (btnTriggerEmailOtp) {
      btnTriggerEmailOtp.onclick = () => this.openEmailOtpModal();
    }
    const btnCloseEmail = document.getElementById('btn-close-email-modal');
    const btnCancelEmail = document.getElementById('btn-cancel-email-otp');
    const modalEmail = document.getElementById('modal-email-otp');
    const closeEmailModal = () => { if (modalEmail) modalEmail.style.display = 'none'; };
    if (btnCloseEmail) btnCloseEmail.onclick = closeEmailModal;
    if (btnCancelEmail) btnCancelEmail.onclick = closeEmailModal;

    const btnVerifyEmail = document.getElementById('btn-verify-modal-email-otp');
    const inpModalEmail = document.getElementById('inp-modal-email-otp');
    if (btnVerifyEmail && inpModalEmail) {
      btnVerifyEmail.onclick = () => {
        const val = inpModalEmail.value.trim();
        if (val.length !== 6) {
          showToast('Please enter the 6-digit Email OTP', 'warning');
          return;
        }
        this.formData.isEmailVerified = true;
        closeEmailModal();
        showToast('Email address verified via OTP!', 'success');
        this.render();
        this.bindEvents();
      };
    }

    // 11. Address inputs
    const inpStreet = document.getElementById('inp-street');
    if (inpStreet) inpStreet.oninput = (e) => { this.formData.street = e.target.value; this.updateCardPreview(); };
    const inpCity = document.getElementById('inp-city');
    if (inpCity) inpCity.oninput = (e) => { this.formData.city = e.target.value; this.updateCardPreview(); };
    const selState = document.getElementById('sel-state');
    if (selState) selState.onchange = (e) => { this.formData.state = e.target.value; this.updateCardPreview(); };
    const inpPincode = document.getElementById('inp-pincode');
    if (inpPincode) inpPincode.oninput = (e) => { this.formData.pinCode = e.target.value.replace(/\D/g, '').slice(0, 6); this.updateCardPreview(); };

    // 12. Emergency inputs
    const inpEmergName = document.getElementById('inp-emergency-name');
    if (inpEmergName) inpEmergName.oninput = (e) => { this.formData.emergencyName = e.target.value; this.updateCardPreview(); };
    const selEmergRel = document.getElementById('sel-emergency-relation');
    if (selEmergRel) selEmergRel.onchange = (e) => { this.formData.emergencyRelation = e.target.value; this.updateCardPreview(); };
    const inpEmergPhone = document.getElementById('inp-emergency-phone');
    if (inpEmergPhone) inpEmergPhone.oninput = (e) => { this.formData.emergencyPhone = e.target.value.replace(/\D/g, '').slice(0, 10); this.updateCardPreview(); };

    // 13. Consent & Submit Trigger
    const chkConsent = document.getElementById('chk-dpdp-consent');
    if (chkConsent) {
      chkConsent.onchange = (e) => { this.formData.agreedToConsent = e.target.checked; };
    }
    const btnSubmit = document.getElementById('btn-submit-application');
    if (btnSubmit) {
      btnSubmit.onclick = () => {
        if (this.validateForm()) {
          this.openPaymentModal();
        }
      };
    }

    // Modal OTP Events
    const modalOtp = document.getElementById('modal-otp');
    const btnCloseOtp = document.getElementById('btn-close-otp-modal');
    const btnCancelOtp = document.getElementById('btn-cancel-otp');
    const btnVerifyOtp = document.getElementById('btn-verify-modal-otp');
    const inpModalOtp = document.getElementById('inp-modal-otp');

    const closeOtp = () => { if (modalOtp) modalOtp.style.display = 'none'; };
    if (btnCloseOtp) btnCloseOtp.onclick = closeOtp;
    if (btnCancelOtp) btnCancelOtp.onclick = closeOtp;

    if (btnVerifyOtp && inpModalOtp) {
      btnVerifyOtp.onclick = () => {
        const val = inpModalOtp.value.trim();
        if (!val || val.length !== 6) {
          showToast('Please enter the 6-digit OTP code', 'warning');
          return;
        }
        this.formData.isOtpVerified = true;
        closeOtp();
        showToast('Mobile verified successfully via OTP', 'success');
        const badgeSlot = document.getElementById('otp-status-badge');
        if (badgeSlot) {
          badgeSlot.innerHTML = `<span class="badge badge-teal" style="font-weight:700;">Mobile Verified via OTP</span>`;
        }
        if (btnTriggerOtp) btnTriggerOtp.textContent = 'Verified';
      };
    }

    // Modal Payment Events
    const modalPayment = document.getElementById('modal-payment');
    const btnClosePay = document.getElementById('btn-close-payment-modal');
    const btnCancelPay = document.getElementById('btn-cancel-payment');
    const btnConfirmPay = document.getElementById('btn-confirm-payment');

    const closePayment = () => { if (modalPayment) modalPayment.style.display = 'none'; };
    if (btnClosePay) btnClosePay.onclick = closePayment;
    if (btnCancelPay) btnCancelPay.onclick = closePayment;

    this.container.querySelectorAll('.payment-option-card').forEach(card => {
      card.onclick = () => {
        this.container.querySelectorAll('.payment-option-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        this.selectedPaymentMode = card.dataset.mode;
      };
    });

    if (btnConfirmPay) {
      btnConfirmPay.onclick = () => {
        btnConfirmPay.disabled = true;
        btnConfirmPay.textContent = 'Processing Payment...';
        setTimeout(() => {
          closePayment();
          this.executeFinalIssue();
        }, 600);
      };
    }
  }

  openOtpModal() {
    if (!this.formData.mobile || this.formData.mobile.length !== 10) {
      showToast('Please enter a valid 10-digit mobile number first', 'warning');
      return;
    }
    const code = String(Math.floor(100000 + Math.random() * 900000));
    this.generatedDemoOtp = code;
    showToast(`SMS Verification Code sent to +91 ${this.formData.mobile}: [ ${code} ]`, 'info', 8000);

    const modal = document.getElementById('modal-otp');
    const lbl = document.getElementById('lbl-otp-phone');
    const inp = document.getElementById('inp-modal-otp');

    if (lbl) lbl.textContent = `+91 ${this.formData.mobile.slice(0, 5)} ${this.formData.mobile.slice(5)}`;
    if (inp) inp.value = code;
    if (modal) modal.style.display = 'flex';
  }

  openPaymentModal() {
    const modal = document.getElementById('modal-payment');
    if (modal) modal.style.display = 'flex';
  }

  updateCardPreview() {
    const nameEl = document.getElementById('card-front-name');
    if (nameEl) nameEl.textContent = (this.formData.fullName || 'CITIZEN NAME').toUpperCase();

    const dobEl = document.getElementById('card-front-dob');
    if (dobEl) dobEl.textContent = this.formData.dob || '1995-08-15';

    const bloodEl = document.getElementById('card-front-blood');
    if (bloodEl) bloodEl.textContent = this.formData.bloodGroup || 'O+';

    const idEl = document.getElementById('card-front-healthid');
    if (idEl) idEl.textContent = this.formData.healthIdPreview;

    const photoEl = document.getElementById('card-front-photo');
    if (photoEl) {
      photoEl.src = this.formData.photoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(this.formData.fullName || 'Citizen')}`;
    }

    const addrEl = document.getElementById('card-back-address');
    if (addrEl) {
      addrEl.textContent = `${this.formData.street || 'Address'}, ${this.formData.city || 'City'}, ${this.formData.state || 'Delhi'} - ${this.formData.pinCode || '110016'}`;
    }

    const emergEl = document.getElementById('card-back-emergency');
    if (emergEl) {
      emergEl.textContent = `${this.formData.emergencyName || 'Designated Contact'} (${this.formData.emergencyRelation || 'Parent'}) +91 ${this.formData.emergencyPhone || '9876543210'}`;
    }

    const serialEl = document.getElementById('card-back-serial');
    if (serialEl) serialEl.textContent = `SN: ${this.formData.healthIdPreview.replace(/\s+/g, '')}`;

    const canvas = document.getElementById('card-back-qr');
    if (canvas) {
      QRCode.toCanvas(canvas, JSON.stringify({
        healthId: this.formData.healthIdPreview.replace(/\s+/g, ''),
        name: this.formData.fullName || 'CITIZEN',
        blood: this.formData.bloodGroup || 'O+'
      }), { width: 56, margin: 0, color: { dark: '#0f172a', light: '#ffffff' } }, (e) => {
        if (e) console.error('QR error:', e);
      });
    }
  }

  async startCamera(videoId) {
    this.stopCamera();
    const video = document.getElementById(videoId);
    if (!video) return;

    try {
      this.cameraStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: false
      });
      video.srcObject = this.cameraStream;
    } catch (e) {
      console.warn('Camera access unavailable:', e);
      showToast('Camera not available or access denied. Please upload a file.', 'warning');
    }
  }

  stopCamera() {
    if (this.cameraStream) {
      this.cameraStream.getTracks().forEach(t => t.stop());
      this.cameraStream = null;
    }
  }

  captureCameraFrame(videoId) {
    const video = document.getElementById(videoId);
    if (!video || !this.cameraStream) return null;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.9);
  }

  validateForm() {
    if (!this.formData.fullName || this.formData.fullName.trim().length < 3) {
      showToast('Please enter your full legal name (at least 3 letters)', 'warning');
      document.getElementById('inp-fullname')?.focus();
      return false;
    }
    if (!this.formData.kycNumber || this.formData.kycNumber.trim().length < 4) {
      showToast(`Please enter your ${this.formData.kycType} number`, 'warning');
      document.getElementById('inp-kyc-number')?.focus();
      return false;
    }
    if (this.formData.kycType === 'Aadhaar Card') {
      const cleanAadhaar = this.formData.kycNumber.replace(/\D/g, '');
      if (cleanAadhaar.length !== 12) {
        showToast('Please enter a full 12-digit Aadhaar number', 'warning');
        document.getElementById('inp-kyc-number')?.focus();
        return false;
      }
      if (!this.formData.isAadhaarVerified) {
        showToast('Please verify your Aadhaar number with UIDAI OTP', 'warning');
        this.openAadhaarOtpModal();
        return false;
      }
    }
    if (!this.formData.kycDocData && !this.formData.kycDocName) {
      showToast('Please upload or capture your Government KYC document copy', 'warning');
      return false;
    }
    if (!this.formData.mobile || this.formData.mobile.length !== 10) {
      showToast('Please enter a valid 10-digit mobile number', 'warning');
      document.getElementById('inp-mobile')?.focus();
      return false;
    }
    if (!this.formData.isOtpVerified) {
      this.openOtpModal();
      return false;
    }
    if (!this.formData.email || !this.formData.email.includes('@')) {
      showToast('Please provide a valid email address', 'warning');
      document.getElementById('inp-email')?.focus();
      return false;
    }
    if (!this.formData.isEmailVerified) {
      showToast('Please verify your Gmail / Email address with OTP', 'warning');
      this.openEmailOtpModal();
      return false;
    }
    if (!this.formData.street || this.formData.street.trim().length < 5) {
      showToast('Please enter complete street delivery address', 'warning');
      document.getElementById('inp-street')?.focus();
      return false;
    }
    if (!this.formData.city || this.formData.city.trim().length < 2) {
      showToast('Please enter your city/district', 'warning');
      document.getElementById('inp-city')?.focus();
      return false;
    }
    if (!this.formData.pinCode || this.formData.pinCode.length !== 6) {
      showToast('Please enter a valid 6-digit Indian PIN code', 'warning');
      document.getElementById('inp-pincode')?.focus();
      return false;
    }
    if (!this.formData.emergencyName || this.formData.emergencyName.trim().length < 2) {
      showToast('Please designate an emergency contact name', 'warning');
      document.getElementById('inp-emergency-name')?.focus();
      return false;
    }
    if (!this.formData.emergencyPhone || this.formData.emergencyPhone.length !== 10) {
      showToast('Please enter a 10-digit emergency contact phone', 'warning');
      document.getElementById('inp-emergency-phone')?.focus();
      return false;
    }
    const chk = document.getElementById('chk-dpdp-consent');
    if (!chk || !chk.checked) {
      showToast('Please accept the DPDP Act statutory consent checkbox to issue your HealthCard', 'warning');
      return false;
    }
    return true;
  }

  executeFinalIssue() {
    const txnId = `TXN-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-${Math.floor(100000 + Math.random() * 900000)}`;
    const utr = `UTR${Math.floor(100000000000 + Math.random() * 900000000000)}`;

    const payload = {
      fullName: this.formData.fullName,
      dob: this.formData.dob,
      gender: this.formData.gender,
      bloodGroup: this.formData.bloodGroup,
      mobile: this.formData.mobile,
      email: this.formData.email,
      photoUrl: this.formData.photoUrl,
      kycType: this.formData.kycType,
      kycNumber: this.formData.kycNumber,
      isAadhaarVerified: this.formData.isAadhaarVerified,
      kycDocData: this.formData.kycDocData,
      kycDocName: this.formData.kycDocName,
      address: {
        street: this.formData.street,
        city: this.formData.city,
        state: this.formData.state,
        pinCode: this.formData.pinCode
      },
      emergencyContact: {
        name: this.formData.emergencyName,
        relation: this.formData.emergencyRelation,
        phone: this.formData.emergencyPhone
      },
      cardTemplate: this.formData.cardTemplate,
      payment: {
        status: "PAID",
        amount: 50.00,
        currency: "INR",
        mode: this.selectedPaymentMode,
        transactionId: txnId,
        utr: utr,
        paidAt: new Date().toISOString()
      }
    };

    const result = applicantStore.submitApplication(payload);
    showToast('Payment verified & Application Registered! HealthCard Issued.', 'success', 6000);

    const mainWrapper = document.getElementById('apply-main-wrapper');
    const pageHeader = document.querySelector('.page-header-bar');
    const receiptContainer = document.getElementById('application-receipt-container');

    if (mainWrapper) mainWrapper.style.display = 'none';
    if (pageHeader) pageHeader.style.display = 'none';

    if (receiptContainer) {
      receiptContainer.style.display = 'block';
      this.renderOfficialAcknowledgementSlip(receiptContainer, result);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  /**
   * Render Official Printable Government Acknowledgement Document & Payment Receipt
   * Matches UIDAI / Passport Sewa / Income Tax official format with clean A4 print support
   */
  renderOfficialAcknowledgementSlip(container, result) {
    const { member, order, applicationRef, healthId } = result;
    const nowStr = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    const age = calculateAge(member.dob);

    container.innerHTML = `
      <div class="receipt-page-container">
        <!-- Top Success Feedback Banner (Hidden on print) -->
        <div class="receipt-success-banner">
          <div class="receipt-success-left">
            <div class="receipt-check-circle">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <div>
              <div class="receipt-success-title">Enrolment Application Registered & Fee Paid Successfully</div>
              <div class="receipt-success-sub">Application Ref: <strong>${applicationRef}</strong> • 10-Digit National Health ID Generated</div>
            </div>
          </div>
          <span style="display:inline-flex; align-items:center; gap:6px; font-size:11.5px; font-weight:700; color:#166534; background:#dcfce7; padding:4px 10px; border-radius:9999px;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg>
            ₹50.00 Confirmed
          </span>
        </div>

        <!-- Action Toolbar (Hidden during print) -->
        <div class="doc-action-bar">
          <div style="display:flex; gap:8px; flex-wrap:wrap;">
            <button type="button" class="btn btn-primary btn-sm" id="btn-print-doc">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
              Print / Save PDF Receipt
            </button>

            <button type="button" class="btn btn-outline btn-sm" id="btn-track-consignment">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Track SpeedPost (${order.awbNumber})
            </button>

            <button type="button" class="btn btn-outline btn-sm" id="btn-open-citizen-dashboard">
              Citizen Dashboard
            </button>
          </div>

          <button type="button" class="btn btn-ghost btn-sm" id="btn-apply-another" style="color:var(--text-muted); font-size:12px;">
            + Apply for Another Member
          </button>
        </div>

        <!-- Official A4 Printable Acknowledgement Document (Pure Light Scheme) -->
        <div class="printable-acknowledgement-doc" id="printable-area">
          
          <!-- Government Header -->
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
              <div class="metric-tile-value" style="color:var(--color-primary);">${healthId}</div>
            </div>

            <div class="metric-tile">
              <div class="metric-tile-label">SpeedPost Tracking AWB</div>
              <div class="metric-tile-value" style="color:#047857;">${order.awbNumber}</div>
              <div style="font-size:10.5px; color:#64748b; margin-top:2px;">Estimated: 3 to 5 business days</div>
            </div>

            <div class="metric-tile">
              <div class="metric-tile-label">Application Status & Fee</div>
              <div class="metric-tile-value" style="color:#0f172a; font-size:14px;">PAID: ₹50.00</div>
              <div style="font-size:10.5px; color:#64748b; margin-top:2px;">${order.payment?.mode || 'UPI / BHIM'} • Ref: ${applicationRef}</div>
            </div>
          </div>

          <!-- Section 1: Enrolled Citizen Demographics -->
          <div class="doc-section-card">
            <div class="doc-section-header-light">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              <span>1. Enrolled Citizen Demographics & Biological Parameters</span>
            </div>
            <div class="doc-section-body-light">
              <div class="doc-demographics-row">
                <img src="${member.photoUrl}" alt="Photo" class="doc-photo-portrait" />
                
                <div class="doc-details-grid">
                  <div>
                    <div class="doc-field-label">Full Legal Name</div>
                    <div class="doc-field-value" style="font-size:14px; font-weight:700;">${member.fullName.toUpperCase()}</div>
                  </div>

                  <div>
                    <div class="doc-field-label">Blood Group Designation</div>
                    <div class="doc-field-value">
                      <span class="badge badge-red" style="font-size:11.5px; font-weight:800; padding:2px 8px;">
                        ${member.bloodGroup || 'Unknown'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div class="doc-field-label">Date of Birth & Age</div>
                    <div class="doc-field-value">${member.dob} (${age} Years Old)</div>
                  </div>

                  <div>
                    <div class="doc-field-label">Gender</div>
                    <div class="doc-field-value">${member.gender}</div>
                  </div>

                  <div>
                    <div class="doc-field-label">Identity Document & e-KYC</div>
                    <div class="doc-field-value">
                      <strong>${member.kyc?.documentType || 'Aadhaar Card'}</strong>: 
                      <span style="font-family:var(--font-family-mono); font-weight:700;">${member.kyc?.documentNumber || '-'}</span>
                      <span style="font-size:10px; color:#166534; font-weight:700; background:#ecfdf5; padding:2px 6px; border-radius:3px; border:1px solid #bbf7d0; margin-left:4px; display:inline-flex; align-items:center; gap:3px;">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg>
                        ${member.kyc?.isAadhaarVerified ? 'UIDAI VERIFIED' : 'e-KYC VERIFIED'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div class="doc-field-label">Registered Contacts</div>
                    <div class="doc-field-value" style="font-size:12px;">
                      Mobile: +91 ${member.mobile} <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#166534" stroke-width="3" style="display:inline-block; vertical-align:-1px;"><path d="M20 6L9 17l-5-5"/></svg> • 
                      Email: ${member.email || '-'} <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#166534" stroke-width="3" style="display:inline-block; vertical-align:-1px;"><path d="M20 6L9 17l-5-5"/></svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Section 2: Consignment Logistics & Delivery Routing -->
          <div class="doc-section-card">
            <div class="doc-section-header-light">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
              <span>2. SpeedPost Doorstep Dispatch & PVC Card Specifications</span>
            </div>
            <div class="doc-section-body-light">
              <div class="doc-details-grid">
                <div>
                  <div class="doc-field-label">SpeedPost Delivery Address</div>
                  <div class="doc-field-value" style="line-height:1.45;">${order.deliveryAddress}</div>
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

          <!-- Section 3: Designated Emergency Trauma Care Contact -->
          <div class="doc-section-card">
            <div class="doc-section-header-light">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <span>3. Designated Emergency Trauma Care Contact (PRD ACC-09)</span>
            </div>
            <div class="doc-section-body-light">
              <div class="doc-details-grid">
                <div>
                  <div class="doc-field-label">Emergency Guardian Name</div>
                  <div class="doc-field-value"><strong>${member.emergencyContact?.name || 'Designated Contact'}</strong></div>
                </div>

                <div>
                  <div class="doc-field-label">Relationship to Cardholder</div>
                  <div class="doc-field-value">${member.emergencyContact?.relation || 'Family'}</div>
                </div>

                <div>
                  <div class="doc-field-label">24x7 Emergency Contact Phone</div>
                  <div class="doc-field-value" style="font-family:var(--font-family-mono); font-weight:700;">+91 ${member.emergencyContact?.phone || '-'}</div>
                </div>

                <div>
                  <div class="doc-field-label">Trauma Hotline Integration</div>
                  <div class="doc-field-value">Contactless triage QR linked to National Emergency (108/112)</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Section 4: Government Fee Assessment & Tax Invoice -->
          <div class="doc-section-card">
            <div class="doc-section-header-light">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              <span>4. Government Fee Assessment & Tax Invoice</span>
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

          <!-- Digital Verification Stamp & Footer Seal -->
          <div class="doc-footer-sign">
            <div class="doc-stamp-box">
              <div class="doc-qr-stamp">
                <canvas id="doc-receipt-qr" width="60" height="60"></canvas>
              </div>
              <div class="doc-certified-badge">
                <div><strong>DIGITALLY CERTIFIED</strong></div>
                <div>Central Health Record Registry, Govt of India</div>
                <div style="font-size:10.5px; color:#64748b;">Verification Token: ${applicationRef}</div>
              </div>
            </div>

            <div class="doc-sign-block">
              <div class="doc-sign-title">Competent Authority / Registrar</div>
              <div>Ministry of Health & Family Welfare</div>
              <div style="font-size:10px; margin-top:2px;">(Computer-generated legal acknowledgement. No physical signature required)</div>
            </div>
          </div>

        </div>
      </div>
    `;

    // Render verification QR code inside acknowledgement document
    const qrCanvas = document.getElementById('doc-receipt-qr');
    if (qrCanvas) {
      QRCode.toCanvas(qrCanvas, JSON.stringify({
        ref: applicationRef,
        healthId: healthId.replace(/\s+/g, ''),
        name: member.fullName,
        awb: order.awbNumber,
        paid: 'INR 50.00',
        txn: order.payment?.transactionId
      }), { width: 60, margin: 0 }, (e) => {
        if (e) console.error('Doc QR error:', e);
      });
    }

    // Attach Action Listeners
    document.getElementById('btn-print-doc')?.addEventListener('click', () => {
      window.print();
    });

    document.getElementById('btn-track-consignment')?.addEventListener('click', () => {
      window.location.hash = `#track?ref=${encodeURIComponent(applicationRef)}`;
    });

    document.getElementById('btn-open-citizen-dashboard')?.addEventListener('click', () => {
      sessionStorage.setItem('healthcard_active_citizen_mobile', member.mobile);
      window.location.hash = '#dashboard';
    });

    document.getElementById('btn-apply-another')?.addEventListener('click', () => {
      window.location.reload();
    });
  }
}
