/**
 * HealthCard Hospital Portal: Patient Intake, Scanner & Mandatory Identity Gate
 * Implements PRD ACC-01, ACC-02, ACC-03, ACC-04, ACC-05.
 * 1. Resolves opaque card token to masked identity
 * 2. Mandates physical in-person identity verification
 * 3. Configures purpose, duration, and multi-channel consent
 */

import { hospitalStore } from '../../shared/storage.js';
import { formatHealthId, validateHealthId } from '../../shared/utils/healthId.js';
import { calculateAge, maskMobile } from '../../shared/utils/formatters.js';
import { showToast } from '../../shared/components/toast.js';

export class IntakeView {
  constructor(container) {
    this.container = container;
    this.resolvedResult = null;
    this.stream = null;
    this.activeConsentMethod = 'app';
    this.selectedDuration = 24;
  }

  render() {
    // Check if URL has query parameter (e.g. #intake?q=7483916251)
    const hash = window.location.hash || '';
    const queryMatch = hash.match(/\?q=([^&]+)/);
    const initialQuery = queryMatch ? decodeURIComponent(queryMatch[1]) : '';

    this.container.innerHTML = `
      <div class="intake-container">
        <div class="page-header">
          <div>
            <h1 class="page-title">Patient Intake & Card Verification</h1>
            <p class="page-subtitle">Scan physical HealthCard QR/NFC or search 10-digit Health ID</p>
          </div>
          <a href="#dashboard" class="btn btn-outline">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            Back to Dashboard
          </a>
        </div>

        <div class="intake-layout">
          <!-- Left: Camera & QR Scanner -->
          <div class="scanner-box">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
              <div style="font-weight: 700; font-size: 15px; color: var(--text-main); display: flex; align-items: center; gap: 8px;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                Live Camera QR Scanner
              </div>
              <span class="badge badge-active">Camera Ready</span>
            </div>

            <!-- Video Scanning Viewport -->
            <div class="video-container" id="camera-viewport">
              <video id="scanner-video" playsinline autoplay muted></video>
              <div class="scan-crosshair">
                <div class="scan-laser-line"></div>
              </div>
              <div id="camera-placeholder" style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #0f172a; color: #94a3b8; padding: 20px; text-align: center;">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" stroke-width="1.8" style="margin-bottom: 12px;"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="7" y1="7" x2="7.01" y2="7"/><line x1="17" y1="7" x2="17.01" y2="7"/><line x1="7" y1="17" x2="7.01" y2="17"/><path d="M14 14h3v3"/></svg>
                <div style="color: #ffffff; font-weight: 600; font-size: 13.5px;">Present HealthCard QR to Camera</div>
                <div style="font-size: 11.5px; margin-top: 4px;">Hold card steady within frame for instant resolution</div>
                <button type="button" class="btn btn-sm btn-primary" id="btn-start-camera" style="margin-top: 14px;">
                  Enable Camera Stream
                </button>
              </div>
            </div>

            <!-- Demo Card Quick Scanners -->
            <div style="margin-top: 16px;">
              <div style="font-size: 12px; font-weight: 600; color: var(--text-muted); margin-bottom: 6px;">
                Instant Demo Card Scanners (Simulate QR Scan):
              </div>
              <div class="demo-pills-list">
                <button type="button" class="btn btn-sm btn-secondary btn-demo-card" data-hid="74839 16251">
                  Rahul Sharma (74839 16251)
                </button>
                <button type="button" class="btn btn-sm btn-secondary btn-demo-card" data-hid="81920 34719">
                  Ananya Deshmukh (81920 34719)
                </button>
                <button type="button" class="btn btn-sm btn-secondary btn-demo-card" data-hid="90218 54310">
                  Sunita Patel (90218 54310)
                </button>
              </div>
            </div>
          </div>

          <!-- Right: Manual Lookup & Resolution Gate -->
          <div style="display: flex; flex-direction: column; gap: 20px;">
            <!-- Manual Search Form -->
            <div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: 24px; box-shadow: var(--shadow-sm);">
              <div style="font-weight: 700; font-size: 15px; color: var(--text-main); margin-bottom: 14px; display: flex; align-items: center; gap: 8px;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                Manual Card Identifier Lookup
              </div>

              <form id="intake-lookup-form">
                <div class="form-group">
                  <label class="form-label">10-Digit Health ID or Patient Mobile Number</label>
                  <input type="text" id="intake-query-input" class="form-input font-mono" placeholder="e.g. 74839 16251 or 9876543210" value="${initialQuery}" style="font-size: 15px; font-weight: 600;" required />
                  <div class="form-hint">Format: 5-5 grouped digits. Space is added automatically.</div>
                </div>

                <button type="submit" class="btn btn-primary" style="width: 100%;">
                  Resolve Card Token (PRD ACC-01)
                </button>
              </form>
            </div>

            <!-- Dynamic Identity Gate Mount Point -->
            <div id="identity-gate-mount"></div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();

    if (initialQuery) {
      this.handleLookup(initialQuery);
    }
  }

  bindEvents() {
    // Form submission
    const form = this.container.querySelector('#intake-lookup-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = this.container.querySelector('#intake-query-input');
        if (input && input.value) {
          this.handleLookup(input.value);
        }
      });
    }

    // Auto format 5-5 Health ID while typing
    const queryInput = this.container.querySelector('#intake-query-input');
    if (queryInput) {
      queryInput.addEventListener('input', (e) => {
        const raw = e.target.value.replace(/\D/g, '');
        if (raw.length <= 10) {
          if (raw.length > 5) {
            e.target.value = `${raw.slice(0, 5)} ${raw.slice(5, 10)}`;
          } else {
            e.target.value = raw;
          }
        }
      });
    }

    // Demo card buttons
    const demoButtons = this.container.querySelectorAll('.btn-demo-card');
    demoButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const hid = btn.getAttribute('data-hid');
        const input = this.container.querySelector('#intake-query-input');
        if (input) input.value = hid;
        this.handleLookup(hid);
      });
    });

    // Start camera button
    const cameraBtn = this.container.querySelector('#btn-start-camera');
    if (cameraBtn) {
      cameraBtn.addEventListener('click', () => this.startCamera());
    }
  }

  async startCamera() {
    const video = this.container.querySelector('#scanner-video');
    const placeholder = this.container.querySelector('#camera-placeholder');

    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        this.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (video) {
          video.srcObject = this.stream;
          video.play();
          if (placeholder) placeholder.style.display = 'none';
          showToast('Camera stream active. Point towards HealthCard QR.', 'info');

          // Simulate QR decode after 2.5s for demonstration
          setTimeout(() => {
            showToast('QR Code detected! Resolving card token...', 'success');
            this.handleLookup('74839 16251');
          }, 2500);
        }
      } else {
        showToast('Camera access not supported on this browser profile.', 'warning');
      }
    } catch (e) {
      console.warn('Camera error:', e);
      showToast('Camera stream simulated for local workstation.', 'info');
      if (placeholder) {
        placeholder.innerHTML = `
          <div style="color: #14b8a6; font-weight: 700; margin-bottom: 6px;">Camera Simulator Active</div>
          <div style="font-size: 11.5px; color: #94a3b8; margin-bottom: 12px;">Webcam not connected. Use demo card buttons below.</div>
          <button type="button" class="btn btn-sm btn-primary" onclick="document.querySelector('.btn-demo-card').click()">
            Simulate Scan (Rahul Sharma)
          </button>
        `;
      }
    }
  }

  handleLookup(query) {
    const res = hospitalStore.resolveCardToken(query);
    const mount = this.container.querySelector('#identity-gate-mount');
    if (!mount) return;

    if (!res || !res.found) {
      mount.innerHTML = `
        <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: var(--radius-xl); padding: 20px; text-align: center; color: #991b1b;">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2" style="margin-bottom: 8px;"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          <div style="font-weight: 700; font-size: 14px;">Card Token Not Found</div>
          <div style="font-size: 12px; margin-top: 4px; color: #7f1d1d;">No registered active HealthCard matches identifier "${query}". Verify 10-digit Health ID or check with card issuer.</div>
        </div>
      `;
      showToast('Patient not found in registry', 'error');
      return;
    }

    this.resolvedResult = res;
    this.renderIdentityGate(mount);
    showToast('Card token resolved. In-person identity check required.', 'info');
  }

  renderIdentityGate(container) {
    const { patient, maskedIdentity } = this.resolvedResult;

    container.innerHTML = `
      <div class="identity-gate-card">
        <div class="gate-badge-banner">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <div>
            <strong>Mandatory Identity Confirmation Gate (PRD ACC-01 / ACC-02)</strong>
            <div style="font-size: 11.5px; opacity: 0.9;">Verify cardholder's physical presence before requesting longitudinal clinical access.</div>
          </div>
        </div>

        <div class="masked-profile-box">
          <img src="${maskedIdentity.photoUrl}" class="masked-avatar" alt="${maskedIdentity.fullName}" />
          <div class="masked-details">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <div class="masked-name">${maskedIdentity.fullName}</div>
              <span class="blood-group-tag">${maskedIdentity.bloodGroup}</span>
            </div>
            <div class="masked-row">
              <span class="mono-health-id">${formatHealthId(maskedIdentity.healthId)}</span>
              <span>•</span>
              <span>${calculateAge(maskedIdentity.age)}</span>
              <span>•</span>
              <span>${maskedIdentity.gender}</span>
            </div>
            <div style="font-size: 12px; color: var(--text-muted); display: flex; align-items: center; gap: 6px;">
              <span>Registered Mobile:</span>
              <strong style="color: var(--text-secondary);">${maskedIdentity.mobileMasked}</strong>
              <span class="badge badge-active" style="margin-left: 8px;">KYC ${maskedIdentity.kycStatus}</span>
            </div>
          </div>
        </div>

        <!-- Identity Confirmation Checkbox -->
        <div style="background: #fafbfc; border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 12px 14px; margin-bottom: 20px;">
          <label style="display: flex; align-items: flex-start; gap: 10px; cursor: pointer; font-size: 13px; font-weight: 600; color: var(--text-main);">
            <input type="checkbox" id="chk-confirm-presence" style="width: 18px; height: 18px; accent-color: var(--color-primary); margin-top: 1px;" />
            <span>I confirm that the patient is physically present at the clinical desk and their identity matches the presenting HealthCard.</span>
          </label>
        </div>

        <button type="button" class="btn btn-primary" id="btn-confirm-identity" style="width: 100%;" disabled>
          Confirm In-Person Identity & Configure Consent →
        </button>
      </div>
    `;

    const chk = container.querySelector('#chk-confirm-presence');
    const btn = container.querySelector('#btn-confirm-identity');

    chk.addEventListener('change', () => {
      btn.disabled = !chk.checked;
    });

    btn.addEventListener('click', () => {
      hospitalStore.confirmIdentity(patient.healthId);
      this.renderConsentDrawer(container);
    });
  }

  renderConsentDrawer(container) {
    const { patient, maskedIdentity } = this.resolvedResult;
    const staff = hospitalStore.getCurrentStaff();

    container.innerHTML = `
      <div class="identity-gate-card">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">
          <div>
            <h3 style="font-size: 16px; font-weight: 700; color: var(--text-main); margin: 0;">Access Request & Consent Center</h3>
            <p style="font-size: 12px; color: var(--text-muted); margin: 2px 0 0 0;">Patient: ${maskedIdentity.fullName} (${formatHealthId(maskedIdentity.healthId)})</p>
          </div>
          <span class="badge badge-active">Identity Confirmed</span>
        </div>

        <!-- Clinical Scopes Selector -->
        <div style="margin-bottom: 16px;">
          <label class="form-label">Clinical Data Scopes Requested (PRD ACC-03):</label>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 6px;">
            <label style="font-size: 12.5px; display: flex; align-items: center; gap: 8px;">
              <input type="checkbox" class="scope-cb" value="demographics" checked /> Demographics
            </label>
            <label style="font-size: 12.5px; display: flex; align-items: center; gap: 8px;">
              <input type="checkbox" class="scope-cb" value="allergies" checked /> Allergies & Alerts
            </label>
            <label style="font-size: 12.5px; display: flex; align-items: center; gap: 8px;">
              <input type="checkbox" class="scope-cb" value="conditions" checked /> Active Conditions
            </label>
            <label style="font-size: 12.5px; display: flex; align-items: center; gap: 8px;">
              <input type="checkbox" class="scope-cb" value="medications" checked /> Current Medications
            </label>
            <label style="font-size: 12.5px; display: flex; align-items: center; gap: 8px;">
              <input type="checkbox" class="scope-cb" value="encounters" checked /> Clinical Consultations
            </label>
            <label style="font-size: 12.5px; display: flex; align-items: center; gap: 8px;">
              <input type="checkbox" class="scope-cb" value="labs" checked /> Diagnostics & Labs
            </label>
            <label style="font-size: 12.5px; display: flex; align-items: center; gap: 8px;">
              <input type="checkbox" class="scope-cb" value="hospitalizations" checked /> Inpatient Stays (IPD)
            </label>
            <label style="font-size: 12.5px; display: flex; align-items: center; gap: 8px;">
              <input type="checkbox" class="scope-cb" value="documents" checked /> Clinical Documents
            </label>
          </div>

          <!-- Sensitive Scopes Notice -->
          <div style="margin-top: 10px; padding: 8px 12px; background: #fffbeb; border: 1px solid #fde68a; border-radius: var(--radius-md); font-size: 12px; color: #92400e;">
            <div style="font-weight: 600; margin-bottom: 2px;">Statutory Sensitive Scopes (PRD ACC-07):</div>
            <div style="display: flex; gap: 14px; margin-top: 4px;">
              <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                <input type="checkbox" class="scope-cb" value="mental_health" /> Mental Health
              </label>
              <label style="display: flex; align-items: center; gap: 6px; cursor: pointer;">
                <input type="checkbox" class="scope-cb" value="reproductive_health" /> Reproductive Health
              </label>
            </div>
          </div>
        </div>

        <!-- Purpose & Duration Grid -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
          <div>
            <label class="form-label">Purpose of Care:</label>
            <select class="form-select" id="sel-consent-purpose">
              <option value="opd">Outpatient Consultation (OPD)</option>
              <option value="emergency">Emergency Trauma Evaluation</option>
              <option value="admission">Inpatient Ward Admission (IPD)</option>
              <option value="lab_order">Diagnostic Laboratory Testing</option>
            </select>
          </div>
          <div>
            <label class="form-label">Authorization Duration:</label>
            <div style="display: flex; gap: 6px; margin-top: 4px;">
              <button type="button" class="btn btn-sm btn-outline duration-chip active" data-hours="24">24 Hours</button>
              <button type="button" class="btn btn-sm btn-outline duration-chip" data-hours="1">1 Hour</button>
              <button type="button" class="btn btn-sm btn-outline duration-chip" data-hours="168">7 Days</button>
              <button type="button" class="btn btn-sm btn-outline duration-chip" data-hours="720">30 Days</button>
            </div>
          </div>
        </div>

        <!-- Multi-Channel Consent Method Selector (PRD ACC-05) -->
        <div style="margin-bottom: 20px;">
          <label class="form-label">Patient Consent Channel:</label>
          <div style="display: flex; gap: 8px; margin-top: 6px;">
            <button type="button" class="btn btn-sm btn-outline consent-tab active" data-method="app" style="flex: 1;">
              Citizen App Push
            </button>
            <button type="button" class="btn btn-sm btn-outline consent-tab" data-method="otp" style="flex: 1;">
              Mobile SMS OTP
            </button>
            <button type="button" class="btn btn-sm btn-outline consent-tab" data-method="assisted" style="flex: 1;">
              Assisted In-Person
            </button>
          </div>

          <!-- Dynamic Method Container -->
          <div id="consent-method-body" style="margin-top: 12px; padding: 12px; background: var(--bg-surface-subtle); border-radius: var(--radius-md); border: 1px solid var(--border-color); font-size: 12.5px;">
            <div id="method-app-view">
              <div style="font-weight: 600; color: var(--color-primary);">Realtime Push Notification Broadcast</div>
              <div style="color: var(--text-muted); margin-top: 2px;">Patient will receive an instant approval request in their Citizen Portal dashboard. (Auto-approved in demo)</div>
            </div>
            <div id="method-otp-view" style="display: none;">
              <div style="font-weight: 600; color: var(--text-main); margin-bottom: 6px;">SMS OTP to ${maskedIdentity.mobileMasked}</div>
              <div style="display: flex; gap: 8px; align-items: center;">
                <input type="text" class="form-input font-mono" id="otp-input" value="482019" maxlength="6" style="width: 140px; font-weight: 700; letter-spacing: 0.1em;" />
                <span style="font-size: 11.5px; color: #15803d; font-weight: 600;">Code verified (Demo)</span>
              </div>
            </div>
            <div id="method-assisted-view" style="display: none;">
              <div style="font-weight: 600; color: var(--text-main); margin-bottom: 4px;">Assisted Statutory Flow (No Smartphone)</div>
              <div style="color: var(--text-muted); margin-bottom: 6px;">Captures clinician + witness staff ID for patient consent attribution.</div>
              <input type="text" class="form-input" id="witness-input" placeholder="Witness Staff ID (e.g. REC-104 Priya Nair)" value="REC-104 Priya Nair" />
            </div>
          </div>
        </div>

        <button type="button" class="btn btn-primary" id="btn-grant-and-open" style="width: 100%;">
          Authorize Consent & Open Patient Chart →
        </button>
      </div>
    `;

    // Duration chips handler
    const durationChips = container.querySelectorAll('.duration-chip');
    durationChips.forEach(chip => {
      chip.addEventListener('click', () => {
        durationChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.selectedDuration = parseInt(chip.getAttribute('data-hours'), 10) || 24;
      });
    });

    // Consent method tabs handler
    const methodTabs = container.querySelectorAll('.consent-tab');
    methodTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        methodTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const method = tab.getAttribute('data-method');
        this.activeConsentMethod = method;

        container.querySelector('#method-app-view').style.display = method === 'app' ? 'block' : 'none';
        container.querySelector('#method-otp-view').style.display = method === 'otp' ? 'block' : 'none';
        container.querySelector('#method-assisted-view').style.display = method === 'assisted' ? 'block' : 'none';
      });
    });

    // Final grant & navigate
    const grantBtn = container.querySelector('#btn-grant-and-open');
    grantBtn.addEventListener('click', () => {
      const selectedScopes = Array.from(container.querySelectorAll('.scope-cb:checked')).map(cb => cb.value);
      const purpose = container.querySelector('#sel-consent-purpose').value;

      hospitalStore.requestAccess({
        healthId: patient.healthId,
        scopes: selectedScopes,
        purpose,
        durationHours: this.selectedDuration,
        method: this.activeConsentMethod
      });

      showToast(`Access granted for ${maskedIdentity.fullName}. Opening chart...`, 'success');
      setTimeout(() => {
        window.location.hash = `#patient?id=${(patient.healthId || '').replace(/\s+/g, '')}`;
      }, 400);
    });
  }
}
