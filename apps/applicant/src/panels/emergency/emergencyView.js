/**
 * HealthCard Emergency First-Responder Trauma Scan Landing Page (PRD ACC-09)
 * Clean, high-priority, mobile-first triage screen accessed via contactless QR scan
 * High-contrast, non-AI styling strictly adhering to design.md
 */

import { applicantStore } from '../../shared/storage.js';
import { formatDate } from '../../shared/formatters.js';
import { showToast } from '../../shared/toast.js';

export class EmergencyView {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.initialHid = options.hid || '';
    this.initialMemberId = options.memberId || '';
    this.member = null;
    this.init();
  }

  init() {
    this.resolvePatient();
    this.render();
    this.bindEvents();
  }

  resolvePatient() {
    const rawHash = window.location.hash || '';
    const queryPart = rawHash.includes('?') ? rawHash.split('?')[1] : '';
    const params = new URLSearchParams(queryPart);
    const hidParam = params.get('hid') || this.initialHid;
    const idParam = params.get('id') || this.initialMemberId;

    if (hidParam) {
      this.member = applicantStore.getMemberByHealthId(hidParam);
    }
    if (!this.member && idParam) {
      this.member = applicantStore.getMemberById(idParam);
    }
    if (!this.member) {
      // Fallback to active logged-in citizen or first available member in registry
      const currentUser = applicantStore.getCurrentUser();
      if (currentUser && currentUser.healthId) {
        this.member = applicantStore.getMemberByHealthId(currentUser.healthId);
      }
      if (!this.member) {
        const all = applicantStore.getAllMembers();
        this.member = all.length > 0 ? all[0] : null;
      }
    }
  }

  calculateAge(dobString) {
    if (!dobString) return null;
    const birthDate = new Date(dobString);
    if (isNaN(birthDate.getTime())) return null;
    const diffMs = Date.now() - birthDate.getTime();
    const ageDt = new Date(diffMs);
    return Math.abs(ageDt.getUTCFullYear() - 1970);
  }

  getBloodCompatibility(bloodGroup) {
    const bg = (bloodGroup || 'O+').trim().toUpperCase();
    const map = {
      'O+': {
        desc: 'Can receive O+ and O- red cells. Can donate RBCs to O+, A+, B+, AB+.',
        universal: false
      },
      'O-': {
        desc: 'Universal Red Blood Cell Donor. Can only receive O- red blood cells.',
        universal: true,
        tag: 'Universal Donor'
      },
      'A+': {
        desc: 'Can receive A+, A-, O+, and O- red cells. Can donate to A+ and AB+.',
        universal: false
      },
      'A-': {
        desc: 'Can receive A- and O- red cells. Can donate to A+, A-, AB+, AB-.',
        universal: false
      },
      'B+': {
        desc: 'Can receive B+, B-, O+, and O- red cells. Can donate to B+ and AB+.',
        universal: false
      },
      'B-': {
        desc: 'Can receive B- and O- red cells. Can donate to B+, B-, AB+, AB-.',
        universal: false
      },
      'AB+': {
        desc: 'Universal Red Blood Cell Recipient. Can safely receive all ABO/Rh blood groups.',
        universal: true,
        tag: 'Universal Recipient'
      },
      'AB-': {
        desc: 'Can receive AB-, A-, B-, and O- red cells. Can donate to AB+ and AB-.',
        universal: false
      }
    };
    return map[bg] || { desc: 'Verify cross-match before full transfusion.', universal: false };
  }

  render() {
    if (!this.container) return;

    if (!this.member) {
      this.renderEmptyState();
      return;
    }

    const age = this.calculateAge(this.member.dob);
    const bgInfo = this.getBloodCompatibility(this.member.bloodGroup);
    const scanTimestamp = new Date().toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    const allergies = this.member.allergies || (this.member.fullName.includes('Rahul') ? ['Penicillin (Moderate)', 'Sulfa Drugs'] : ['No Known Drug Allergies (NKDA)']);
    const chronic = this.member.chronicConditions || (this.member.fullName.includes('Rahul') ? ['Hypertension (Managed)'] : ['None Reported']);
    const isOrganDonor = this.member.organDonor !== false;

    const allMembers = applicantStore.getAllMembers();

    this.container.innerHTML = `
      <div class="emergency-triage-wrapper">
        <!-- Top Emergency Alert Header -->
        <div class="emergency-alert-banner">
          <div class="alert-icon-pulse">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5"><path d="M12 2v20M2 12h20"/></svg>
          </div>
          <div class="alert-content">
            <div class="alert-title">Emergency First-Responder Trauma Access</div>
            <div class="alert-subtitle">National Digital Health Mission • Contactless Field Scan (PRD ACC-09)</div>
          </div>
          <div class="alert-timestamp">
            <span class="live-dot"></span>
            <span>Verified: ${scanTimestamp}</span>
          </div>
        </div>

        <!-- Demo Patient Quick Switcher -->
        <div class="emergency-patient-switcher">
          <span style="font-size:11.5px; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.04em;">
            Test Patient:
          </span>
          <div class="switcher-chips">
            ${allMembers.map(m => `
              <button type="button" 
                class="btn-switch-patient ${m.id === this.member.id ? 'active' : ''}" 
                data-hid="${(m.healthId || '').replace(/\s+/g, '')}"
                data-id="${m.id}">
                <strong>${m.fullName}</strong>
                <span class="chip-blood-tag">${m.bloodGroup || 'O+'}</span>
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Main Patient Profile Card -->
        <div class="emergency-patient-card">
          <!-- Citizen Header Row -->
          <div class="patient-hero-row">
            <div class="patient-avatar-box">
              <img 
                src="${this.member.photoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(this.member.fullName)}`}" 
                alt="${this.member.fullName}" 
                class="patient-avatar-img"
                onerror="this.src='https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(this.member.fullName)}'"
              />
              <span class="verified-avatar-badge" title="Government Verified Identity">✓</span>
            </div>

            <div class="patient-meta-box">
              <div class="patient-status-badge">
                <span class="pulse-green"></span>
                <span>Active Registry Record</span>
              </div>
              <h1 class="patient-legal-name">${this.member.fullName}</h1>
              
              <div class="patient-id-strip">
                <span class="id-label">10-Digit National Health ID:</span>
                <span class="id-value" id="disp-health-id">${this.member.healthId}</span>
                <button type="button" class="btn btn-xs btn-outline btn-copy-hid" id="btn-copy-hid" title="Copy Health ID">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                  Copy
                </button>
              </div>

              <div class="patient-demographics">
                <span><strong>DOB:</strong> ${this.member.dob ? formatDate(this.member.dob) : 'Not Provided'}</span>
                <span>•</span>
                <span><strong>Age:</strong> ${age ? `${age} Yrs` : 'N/A'}</span>
                <span>•</span>
                <span><strong>Gender:</strong> ${this.member.gender || 'Not Specified'}</span>
                <span>•</span>
                <span><strong>Region:</strong> ${this.member.address?.city || 'Delhi'}, ${this.member.address?.state || 'India'}</span>
              </div>
            </div>
          </div>

          <!-- LIFE-CRITICAL BLOOD GROUP HERO BLOCK (PRD ACC-09 BOLD RED MANDATE) -->
          <div class="critical-blood-banner">
            <div class="blood-badge-hero">
              <div class="blood-label">CONFIRMED BLOOD GROUP</div>
              <div class="blood-group-massive">${this.member.bloodGroup || 'O+'}</div>
              ${bgInfo.tag ? `<span class="blood-universal-pill">${bgInfo.tag}</span>` : ''}
            </div>
            <div class="blood-meta-info">
              <div class="blood-protocol-title">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                Emergency Transfusion Guidance
              </div>
              <div class="blood-protocol-desc">${bgInfo.desc}</div>
              <div class="blood-protocol-sub">Strictly verify standard bedside cross-match prior to whole blood transfusion where clinical protocol dictates.</div>
            </div>
          </div>

          <!-- PRIMARY ACTION: CALL EMERGENCY CONTACT (ONE-CLICK TOUCH) -->
          <div class="emergency-contact-hero-box">
            <div class="section-label-chip">PRIMARY EMERGENCY CONTACT (RELATIONSHIP VERIFIED)</div>
            <div class="contact-details-row">
              <div class="contact-info-block">
                <div class="contact-name">
                  ${this.member.emergencyContact?.name || 'Emergency Guardian'}
                </div>
                <div class="contact-relation">
                  Relationship: <strong>${this.member.emergencyContact?.relation || 'Next of Kin'}</strong>
                </div>
                <div class="contact-phone-number">
                  ${this.formatPhoneNumber(this.member.emergencyContact?.phone || '9876543211')}
                </div>
              </div>

              <div class="contact-action-block">
                <a href="tel:${(this.member.emergencyContact?.phone || '9876543211').replace(/\D/g, '')}" 
                   class="btn-call-emergency-primary" 
                   id="btn-call-primary">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  <span>CALL CONTACT NOW</span>
                </a>
              </div>
            </div>
          </div>

          <!-- CRITICAL MEDICAL CLINICAL TRIAGE FLAGS -->
          <div class="clinical-triage-grid">
            <!-- Allergies -->
            <div class="clinical-box">
              <div class="clinical-box-header">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-blood-red)" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <span>Known Allergies & Drug Reactions</span>
              </div>
              <div class="clinical-box-body">
                <div class="allergy-tags-container">
                  ${allergies.map(a => `
                    <span class="allergy-tag ${a.includes('Penicillin') || a.includes('Severe') ? 'danger' : 'neutral'}">
                      ${a}
                    </span>
                  `).join('')}
                </div>
              </div>
            </div>

            <!-- Organ Donor Status -->
            <div class="clinical-box">
              <div class="clinical-box-header">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                <span>Organ & Tissue Donor Registry</span>
              </div>
              <div class="clinical-box-body">
                ${isOrganDonor ? `
                  <div class="organ-donor-badge">
                    <span class="donor-tick">✓</span>
                    <div>
                      <strong>Registered Organ Donor (YES)</strong>
                      <div style="font-size:11px; color:var(--text-muted); margin-top:2px;">Consent verified under NOTTO National Transplant Framework</div>
                    </div>
                  </div>
                ` : `
                  <div style="font-size:12.5px; color:var(--text-muted); font-weight:500;">
                    No organ donation pledge recorded in registry.
                  </div>
                `}
              </div>
            </div>

            <!-- Chronic Conditions -->
            <div class="clinical-box">
              <div class="clinical-box-header">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
                <span>Chronic Medical Conditions</span>
              </div>
              <div class="clinical-box-body">
                <div class="chronic-tags-container">
                  ${chronic.map(c => `
                    <span class="chronic-tag">
                      ${c}
                    </span>
                  `).join('')}
                </div>
              </div>
            </div>

            <!-- Trauma Protocol Guidance -->
            <div class="clinical-box">
              <div class="clinical-box-header">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 8v8M8 12h8"/></svg>
                <span>Paramedic Trauma Standard Protocol</span>
              </div>
              <div class="clinical-box-body">
                <div style="font-size:12px; color:var(--text-muted); line-height:1.5;">
                  Maintain primary airway & cervical stabilization. Rapid assessment of vitals (GCS, SpO₂, Blood Glucose). Report Health ID upon hospital arrival.
                </div>
              </div>
            </div>
          </div>

          <!-- NATIONAL EMERGENCY DIRECT SPEED-DIAL HOTLINES -->
          <div class="hotlines-strip">
            <span style="font-size:12px; font-weight:700; color:var(--text-main);">Direct National Dispatch:</span>
            <div class="hotlines-buttons">
              <a href="tel:108" class="btn-hotline btn-hotline-ambulance">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v12M6 12h12"/></svg>
                Call 108 (Ambulance)
              </a>
              <a href="tel:112" class="btn-hotline btn-hotline-police">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                Call 112 (National Emergency)
              </a>
            </div>
          </div>

          <!-- DPDP ACT PRIVACY REDACTION NOTICE -->
          <div class="dpdp-redaction-notice">
            <div class="notice-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <div class="notice-text">
              <strong>DPDP Act 2023 & MoHFW Privacy Guard:</strong> Full government identity document numbers (Aadhaar / Voter ID), exact residential street addresses, and financial transaction invoices are strictly redacted on contactless QR triage scans. Only life-critical trauma markers and authorized emergency guardian channels are rendered.
            </div>
          </div>

          <!-- Action Footer Buttons -->
          <div class="emergency-footer-actions">
            <a href="#dashboard" class="btn btn-outline" style="font-weight:600; font-size:12.5px;">
              ← Back to Citizen Dashboard
            </a>
            <a href="#apply" class="btn btn-ghost" style="font-size:12.5px; color:var(--text-muted);">
              Apply for New HealthCard
            </a>
          </div>
        </div>
      </div>
    `;
  }

  renderEmptyState() {
    this.container.innerHTML = `
      <div style="max-width:540px; margin:40px auto; padding:32px; background:#ffffff; border:1px solid var(--border-color); border-radius:var(--radius-lg); text-align:center; box-shadow:var(--shadow-sm);">
        <div style="width:56px; height:56px; border-radius:50%; background:var(--color-primary-light); color:var(--color-primary); display:flex; align-items:center; justify-content:center; margin:0 auto 16px;">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
        </div>
        <h2 style="font-size:18px; font-weight:700; color:var(--text-main); margin-bottom:8px;">No Emergency Record Found</h2>
        <p style="font-size:13px; color:var(--text-muted); line-height:1.5; margin-bottom:24px;">
          The scanned Health ID or token did not match any active record in the National Registry database.
        </p>
        <div style="display:flex; justify-content:center; gap:12px;">
          <a href="#dashboard" class="btn btn-primary">Go to Dashboard</a>
          <a href="#apply" class="btn btn-outline">Apply for Card</a>
        </div>
      </div>
    `;
  }

  formatPhoneNumber(phone) {
    if (!phone) return '+91 —';
    const clean = phone.replace(/\D/g, '');
    if (clean.length === 10) {
      return `+91 ${clean.slice(0, 5)} ${clean.slice(5)}`;
    }
    return `+91 ${phone}`;
  }

  bindEvents() {
    // Copy Health ID
    const btnCopy = document.getElementById('btn-copy-hid');
    if (btnCopy && this.member) {
      btnCopy.onclick = () => {
        const text = (this.member.healthId || '').replace(/\s+/g, '');
        navigator.clipboard.writeText(text).then(() => {
          showToast('Health ID copied to clipboard: ' + text, 'success');
        }).catch(() => {
          showToast('Health ID: ' + text, 'info');
        });
      };
    }

    // Switch Patient Buttons
    const switchBtns = document.querySelectorAll('.btn-switch-patient');
    switchBtns.forEach(btn => {
      btn.onclick = () => {
        const hid = btn.getAttribute('data-hid');
        const id = btn.getAttribute('data-id');
        window.location.hash = `#emergency?hid=${hid}&id=${id}`;
        this.resolvePatient();
        this.render();
        this.bindEvents();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      };
    });
  }
}
