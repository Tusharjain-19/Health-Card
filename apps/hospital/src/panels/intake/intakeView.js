/**
 * HealthCard Hospital Portal: Patient Desk & Registration (मरीज पंजीकरण एवं कार्ड डेस्क)
 * Clean, accessible Indian hospital reception and clinical intake workflow:
 * 1. Fast lookup via real camera QR scan or 10-digit Health ID / Mobile
 * 2. 1-Minute walk-in patient registration with auto-issued 10-digit Health ID
 * 3. Immediate 4-way action hub: Write OPD Rx, Upload paper slip, Admit to IPD, or Open chart
 */

import jsQR from 'jsqr';
import { hospitalStore } from '../../shared/storage.js';
import { formatHealthId } from '../../shared/utils/healthId.js';
import { calculateAge, maskMobile } from '../../shared/utils/formatters.js';
import { showToast } from '../../shared/components/toast.js';
import { DocumentScannerModal } from '../dashboard/scannerModal.js';

export class IntakeView {
  constructor(container) {
    this.container = container;
    this.activeTab = 'search'; // 'search' or 'register'
    this.resolvedPatient = null;
    this.stream = null;
    this.scanningAnimFrame = null;
    this.videoEl = null;
    this.canvasEl = null;
    this.canvasCtx = null;
  }

  render() {
    // Check if query params exist (e.g. #intake?q=7483916251 or #intake?tab=register)
    const hash = window.location.hash || '';
    const queryMatch = hash.match(/[?&]q=([^&]+)/);
    const initialQuery = queryMatch ? decodeURIComponent(queryMatch[1]) : '';
    const tabMatch = hash.match(/[?&]tab=([^&]+)/);
    if (tabMatch && tabMatch[1] === 'register') {
      this.activeTab = 'register';
    }

    this.container.innerHTML = `
      <div class="intake-container" style="max-width: 1040px; margin: 0 auto; padding-bottom: 40px;">
        <!-- Header Strip -->
        <div class="page-header" style="margin-bottom: 20px;">
          <div>
            <h1 class="page-title" style="display: flex; align-items: center; gap: 8px;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2.2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              Patient Reception & HealthCard Desk (मरीज पंजीकरण)
            </h1>
            <p class="page-subtitle">Verify HealthCard with live camera QR scan, search existing citizens, or register new walk-in patients</p>
          </div>
          <a href="#dashboard" class="btn btn-outline" style="display: inline-flex; align-items: center; gap: 6px;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            Dashboard
          </a>
        </div>

        <!-- Mode Tabs -->
        <div style="display: flex; gap: 8px; margin-bottom: 24px; border-bottom: 2px solid var(--border-color); padding-bottom: 2px;">
          <button type="button" class="intake-tab-btn ${this.activeTab === 'search' ? 'active' : ''}" id="tab-btn-search" style="padding: 10px 20px; font-size: 14px; font-weight: 700; border: none; background: transparent; cursor: pointer; color: ${this.activeTab === 'search' ? 'var(--color-primary)' : 'var(--text-muted)'}; border-bottom: 3px solid ${this.activeTab === 'search' ? 'var(--color-primary)' : 'transparent'}; margin-bottom: -4px; display: inline-flex; align-items: center; gap: 8px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            1. Find Patient / Scan HealthCard (मौजूदा मरीज)
          </button>
          <button type="button" class="intake-tab-btn ${this.activeTab === 'register' ? 'active' : ''}" id="tab-btn-register" style="padding: 10px 20px; font-size: 14px; font-weight: 700; border: none; background: transparent; cursor: pointer; color: ${this.activeTab === 'register' ? 'var(--color-primary)' : 'var(--text-muted)'}; border-bottom: 3px solid ${this.activeTab === 'register' ? 'var(--color-primary)' : 'transparent'}; margin-bottom: -4px; display: inline-flex; align-items: center; gap: 8px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            2. Register New Patient (नया मरीज पंजीकरण)
          </button>
        </div>

        <!-- Dynamic Content Body -->
        <div id="intake-main-content">
          ${this.activeTab === 'search' ? this.renderSearchView(initialQuery) : this.renderRegisterView()}
        </div>

        <!-- Dynamic Patient Action Hub (Mount Point) -->
        <div id="patient-action-hub-mount" style="margin-top: 24px;"></div>
      </div>
    `;

    this.bindEvents();

    if (initialQuery && this.activeTab === 'search') {
      this.handleLookup(initialQuery);
    }
  }

  // ==========================================
  // VIEW 1: SEARCH & LIVE QR SCANNER
  // ==========================================
  renderSearchView(initialQuery = '') {
    return `
      <div style="display: grid; grid-template-columns: 1.1fr 1fr; gap: 24px;">
        <!-- Left: Live Camera QR Scanner -->
        <div style="background: #ffffff; border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: 20px; box-shadow: 0 1px 4px rgba(0,0,0,0.05);">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
            <div style="font-weight: 700; font-size: 14.5px; color: var(--text-main); display: flex; align-items: center; gap: 8px;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
              Live Camera QR Scanner
            </div>
            <span class="badge" id="camera-status-badge" style="background: #eff6ff; color: #1d4ed8; font-size: 11px;">Real-Time</span>
          </div>

          <!-- Video Camera Viewport -->
          <div style="position: relative; width: 100%; aspect-ratio: 4/3; background: #0f172a; border-radius: var(--radius-lg); overflow: hidden; display: flex; align-items: center; justify-content: center;">
            <video id="intake-video" playsinline autoplay muted style="width: 100%; height: 100%; object-fit: cover;"></video>
            <canvas id="intake-canvas" style="display: none;"></canvas>

            <!-- Scanning overlay / reticle -->
            <div id="intake-scanner-overlay" style="position: absolute; inset: 0; pointer-events: none; display: flex; align-items: center; justify-content: center;">
              <div style="width: 180px; height: 180px; border: 2px solid rgba(20, 184, 166, 0.85); border-radius: 12px; position: relative; box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.45);">
                <div style="position: absolute; top: 0; left: 0; right: 0; height: 2px; background: #14b8a6; animation: scanLaser 2s infinite ease-in-out; box-shadow: 0 0 8px #14b8a6;"></div>
              </div>
            </div>

            <!-- Placeholder overlay if camera not yet started -->
            <div id="intake-cam-placeholder" style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #0f172a; color: #94a3b8; padding: 20px; text-align: center;">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" stroke-width="1.8" style="margin-bottom: 12px;"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="7" y1="7" x2="7.01" y2="7"/><line x1="17" y1="7" x2="17.01" y2="7"/><line x1="7" y1="17" x2="7.01" y2="17"/><path d="M14 14h3v3"/></svg>
              <div style="color: #ffffff; font-weight: 700; font-size: 14px;">Present Physical HealthCard to Camera</div>
              <div style="font-size: 12px; margin-top: 4px; color: #94a3b8;">Scanner only resolves genuine HealthCard QR tokens</div>
              <button type="button" class="btn btn-sm btn-primary" id="btn-start-intake-camera" style="margin-top: 14px; display: inline-flex; align-items: center; gap: 6px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                Enable Camera Scanner
              </button>
            </div>
          </div>

          <!-- Quick Test Demo Patients -->
          <div style="margin-top: 16px; border-top: 1px solid var(--border-color); padding-top: 12px;">
            <div style="font-size: 11.5px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 8px;">
              Quick Demo Health Cards (Simulate Scan):
            </div>
            <div style="display: flex; flex-direction: column; gap: 6px;">
              <button type="button" class="btn btn-sm btn-secondary btn-quick-select" data-hid="74839 16251" style="justify-content: space-between; text-align: left; padding: 7px 12px;">
                <span><strong>Rahul Sharma</strong> (31y, M)</span>
                <span class="font-mono" style="color: var(--color-primary); font-size: 11px;">74839 16251</span>
              </button>
              <button type="button" class="btn btn-sm btn-secondary btn-quick-select" data-hid="81920 34719" style="justify-content: space-between; text-align: left; padding: 7px 12px;">
                <span><strong>Ananya Deshmukh</strong> (28y, F)</span>
                <span class="font-mono" style="color: var(--color-primary); font-size: 11px;">81920 34719</span>
              </button>
              <button type="button" class="btn btn-sm btn-secondary btn-quick-select" data-hid="90218 54310" style="justify-content: space-between; text-align: left; padding: 7px 12px;">
                <span><strong>Sunita Patel</strong> (54y, F)</span>
                <span class="font-mono" style="color: var(--color-primary); font-size: 11px;">90218 54310</span>
              </button>
            </div>
          </div>
        </div>

        <!-- Right: Manual Search Form -->
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <div style="background: #ffffff; border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: 22px; box-shadow: 0 1px 4px rgba(0,0,0,0.05);">
            <div style="font-weight: 700; font-size: 15px; color: var(--text-main); margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              Manual Patient Search
            </div>

            <form id="intake-search-form">
              <div class="form-group" style="margin-bottom: 14px;">
                <label class="form-label" style="font-weight: 600;">10-Digit Health ID or Mobile Number</label>
                <input type="text" id="intake-search-input" class="form-input font-mono" placeholder="e.g. 74839 16251 or 9876543210" value="${initialQuery}" style="font-size: 15px; font-weight: 700; padding: 10px 14px;" required />
                <div class="form-hint" style="font-size: 11.5px; margin-top: 4px; color: var(--text-muted);">Auto-groups 10 digits as 5-5 format. Press Enter to search.</div>
              </div>

              <div style="display: flex; gap: 10px;">
                <button type="submit" class="btn btn-primary" style="flex: 1; padding: 10px 16px; font-weight: 700;">
                  Find Patient
                </button>
                <button type="button" class="btn btn-secondary" id="btn-switch-to-register" style="padding: 10px 16px; white-space: nowrap;">
                  + New Walk-In
                </button>
              </div>
            </form>
          </div>

          <!-- Helpful Counter Tips -->
          <div style="background: #f8fafc; border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 16px; font-size: 12px; color: var(--text-secondary);">
            <div style="font-weight: 700; color: var(--text-main); margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0284c7" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              Hospital Reception Desk Guide
            </div>
            <ul style="margin: 0; padding-left: 18px; line-height: 1.5; color: var(--text-muted);">
              <li>If the patient holds a physical card, point their QR code to the scanner.</li>
              <li>For returning patients without card, enter registered 10-digit mobile number.</li>
              <li>For brand-new patients, click <strong>"+ New Walk-In"</strong> to issue an active 10-digit Health ID in under 60 seconds.</li>
            </ul>
          </div>
        </div>
      </div>
    `;
  }

  // ==========================================
  // VIEW 2: REGISTER NEW PATIENT
  // ==========================================
  renderRegisterView() {
    return `
      <div style="background: #ffffff; border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: 26px; box-shadow: 0 1px 4px rgba(0,0,0,0.05);">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; padding-bottom: 14px; border-bottom: 1px solid var(--border-color);">
          <div>
            <h2 style="font-size: 17px; font-weight: 700; color: var(--text-main); margin: 0;">New Patient Registration (नया मरीज पंजीकरण)</h2>
            <p style="font-size: 12px; color: var(--text-muted); margin: 3px 0 0 0;">Fill basic patient details to immediately issue an active HealthCard and assign 10-digit Health ID</p>
          </div>
          <span class="badge badge-active">Instant Registration</span>
        </div>

        <form id="new-patient-form">
          <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 16px; margin-bottom: 16px;">
            <div class="form-group">
              <label class="form-label" style="font-weight: 600;">Full Patient Name (पूरा नाम) *</label>
              <input type="text" id="reg-name" class="form-input" placeholder="e.g. Ramesh Kumar Gupta" required />
            </div>

            <div class="form-group">
              <label class="form-label" style="font-weight: 600;">Age in Years (उम्र) *</label>
              <input type="number" id="reg-age" class="form-input" placeholder="e.g. 42" min="1" max="120" required />
            </div>

            <div class="form-group">
              <label class="form-label" style="font-weight: 600;">Gender (लिंग) *</label>
              <select id="reg-gender" class="form-select" required>
                <option value="Male">Male (पुरुष)</option>
                <option value="Female">Female (महिला)</option>
                <option value="Other">Other (अन्य)</option>
              </select>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1.5fr 1fr 1.5fr; gap: 16px; margin-bottom: 16px;">
            <div class="form-group">
              <label class="form-label" style="font-weight: 600;">Mobile Number (मोबाइल नंबर) *</label>
              <input type="tel" id="reg-mobile" class="form-input font-mono" placeholder="10-digit mobile (e.g. 9811223344)" maxlength="10" required />
            </div>

            <div class="form-group">
              <label class="form-label" style="font-weight: 600;">Blood Group (रक्त समूह)</label>
              <select id="reg-blood" class="form-select">
                <option value="O+">O+</option>
                <option value="A+">A+</option>
                <option value="B+">B+</option>
                <option value="AB+">AB+</option>
                <option value="O-">O-</option>
                <option value="A-">A-</option>
                <option value="B-">B-</option>
                <option value="AB-">AB-</option>
                <option value="Unknown">Unknown</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label" style="font-weight: 600;">Father / Spouse / Guardian Name</label>
              <input type="text" id="reg-guardian" class="form-input" placeholder="e.g. Suresh Gupta" />
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 16px; margin-bottom: 16px;">
            <div class="form-group">
              <label class="form-label" style="font-weight: 600;">Residential Address (स्थानीय पता)</label>
              <input type="text" id="reg-address" class="form-input" placeholder="Street / Colony / Ward" value="Civil Lines" />
            </div>

            <div class="form-group">
              <label class="form-label" style="font-weight: 600;">City (शहर)</label>
              <input type="text" id="reg-city" class="form-input" placeholder="City" value="New Delhi" />
            </div>

            <div class="form-group">
              <label class="form-label" style="font-weight: 600;">Pincode (पिन कोड)</label>
              <input type="text" id="reg-pincode" class="form-input font-mono" placeholder="Pincode" value="110029" maxlength="6" />
            </div>
          </div>

          <!-- Existing HealthCard Option (Optional) -->
          <div style="background: #f8fafc; border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 14px 18px; margin-bottom: 22px;">
            <div style="font-weight: 700; color: var(--text-main); font-size: 13.5px; margin-bottom: 4px; display: flex; align-items: center; gap: 6px;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M7 15h10"/><path d="M7 11h10"/></svg>
              Existing HealthCard / ABHA Number (Optional / यदि मरीज के पास पहले से हो)
            </div>
            <div style="font-size: 12px; color: var(--text-muted); margin-bottom: 8px;">
              Hospitals register patients without generating new HealthCards. If the patient holds an official HealthCard, enter their 10-digit number below to link records. If not, leave blank.
            </div>
            <input type="text" id="reg-existing-hid" class="form-input font-mono" placeholder="10-digit Health ID (e.g. 74839 16251) - Leave blank if no card" maxlength="11" style="max-width: 320px;" />
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 12px;">
            <button type="button" class="btn btn-secondary" id="btn-cancel-register">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" style="padding: 11px 24px; font-weight: 700;">
              Register Patient & Open Action Options →
            </button>
          </div>
        </form>
      </div>
    `;
  }

  // ==========================================
  // PATIENT ACTION HUB (INSTANT ACTIONS)
  // ==========================================
  renderActionHub(patient) {
    const mount = this.container.querySelector('#patient-action-hub-mount');
    if (!mount) return;

    const cleanId = (patient.healthId || patient.mobile || patient.id || '').replace(/\s+/g, '');

    mount.innerHTML = `
      <div style="background: #ffffff; border: 2px solid var(--color-primary); border-radius: var(--radius-xl); padding: 24px; box-shadow: 0 4px 16px rgba(0,0,0,0.08); animation: fadeIn 0.2s ease;">
        <!-- Verified Patient Header -->
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1.5px solid var(--border-color); padding-bottom: 16px; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
          <div style="display: flex; align-items: center; gap: 14px;">
            <img src="${patient.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}" style="width: 56px; height: 56px; border-radius: 12px; object-fit: cover; border: 2px solid var(--color-primary);" alt="${patient.fullName}" />
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <h3 style="font-size: 18px; font-weight: 800; color: var(--text-main); margin: 0;">${patient.fullName}</h3>
                <span class="blood-group-tag" style="font-size: 12px; padding: 2px 7px;">${patient.bloodGroup || 'O+'}</span>
                ${patient.healthId ? `
                  <span class="badge badge-active" style="font-size: 11px;">Verified HealthCard</span>
                ` : `
                  <span class="badge badge-pending" style="font-size: 11px;">Hospital Registered (${patient.regNumber || 'Walk-In'})</span>
                `}
              </div>
              <div style="display: flex; align-items: center; gap: 10px; font-size: 12.5px; color: var(--text-secondary); margin-top: 4px;">
                ${patient.healthId ? `
                  <span class="font-mono" style="font-weight: 700; color: var(--color-primary);">${formatHealthId(patient.healthId)}</span>
                ` : `
                  <span class="font-mono" style="font-weight: 700; color: #b45309;">${patient.regNumber || 'UHID Registered'}</span>
                  <span class="badge" style="background: #fef3c7; color: #b45309; font-size: 10px; font-weight: 600;">No HealthCard</span>
                `}
                <span>•</span>
                <span>${calculateAge(patient.dob)}</span>
                <span>•</span>
                <span>${patient.gender || 'Male'}</span>
                <span>•</span>
                <span>Mobile: ${maskMobile(patient.mobile)}</span>
                <span>•</span>
                <span>${patient.city || 'New Delhi'}</span>
              </div>
            </div>
          </div>

          <button type="button" class="btn btn-sm btn-outline" id="btn-reset-intake" style="display: inline-flex; align-items: center; gap: 6px;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            Select Another Patient
          </button>
        </div>

        <!-- 4-Way Action Title -->
        <div style="margin-bottom: 14px;">
          <div style="font-weight: 700; font-size: 14.5px; color: var(--text-main);">Select Action for ${patient.fullName}:</div>
          <div style="font-size: 12px; color: var(--text-muted);">Choose outpatient consultation, paper slip upload, inpatient ward admission, or complete clinical chart</div>
        </div>

        <!-- 4 Big Task-Focused Action Tiles -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px;">
          <!-- 1. Write OPD Rx -->
          <button type="button" class="intake-action-card" id="btn-action-opd" style="background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: var(--radius-lg); padding: 18px 16px; text-align: left; cursor: pointer; transition: all 0.15s ease; display: flex; flex-direction: column; gap: 8px;">
            <div style="width: 36px; height: 36px; border-radius: 8px; background: #dbeafe; color: #1d4ed8; display: flex; align-items: center; justify-content: center;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            </div>
            <div>
              <div style="font-weight: 800; font-size: 14px; color: #1e40af;">Write OPD Rx</div>
              <div style="font-size: 11.5px; color: #3b82f6; margin-top: 2px;">ओपीडी पर्ची बनाएं (1-0-1 dosage, advice)</div>
            </div>
          </button>

          <!-- 2. Upload / Scan Paper Slip -->
          <button type="button" class="intake-action-card" id="btn-action-upload" style="background: #fef3c7; border: 1.5px solid #fde68a; border-radius: var(--radius-lg); padding: 18px 16px; text-align: left; cursor: pointer; transition: all 0.15s ease; display: flex; flex-direction: column; gap: 8px;">
            <div style="width: 36px; height: 36px; border-radius: 8px; background: #fef3c7; color: #b45309; display: flex; align-items: center; justify-content: center;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            </div>
            <div>
              <div style="font-weight: 800; font-size: 14px; color: #92400e;">Upload / Scan Slip</div>
              <div style="font-size: 11.5px; color: #d97706; margin-top: 2px;">कागजी पर्ची / रिपोर्ट फोटो अपलोड</div>
            </div>
          </button>

          <!-- 3. Admit to IPD -->
          <button type="button" class="intake-action-card" id="btn-action-admit" style="background: #ecfdf5; border: 1.5px solid #a7f3d0; border-radius: var(--radius-lg); padding: 18px 16px; text-align: left; cursor: pointer; transition: all 0.15s ease; display: flex; flex-direction: column; gap: 8px;">
            <div style="width: 36px; height: 36px; border-radius: 8px; background: #d1fae5; color: #047857; display: flex; align-items: center; justify-content: center;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M7 15h10"/><path d="M12 9v6"/></svg>
            </div>
            <div>
              <div style="font-weight: 800; font-size: 14px; color: #065f46;">Admit to IPD Ward</div>
              <div style="font-size: 11.5px; color: #059669; margin-top: 2px;">अस्पताल में भर्ती (ICU / General Ward)</div>
            </div>
          </button>

          <!-- 4. Open Complete Chart -->
          <button type="button" class="intake-action-card" id="btn-action-chart" style="background: #f5f3ff; border: 1.5px solid #ddd6fe; border-radius: var(--radius-lg); padding: 18px 16px; text-align: left; cursor: pointer; transition: all 0.15s ease; display: flex; flex-direction: column; gap: 8px;">
            <div style="width: 36px; height: 36px; border-radius: 8px; background: #ede9fe; color: #6d28d9; display: flex; align-items: center; justify-content: center;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            </div>
            <div>
              <div style="font-weight: 800; font-size: 14px; color: #5b21b6;">View Medical Chart</div>
              <div style="font-size: 11.5px; color: #7c3aed; margin-top: 2px;">संपूर्ण मेडिकल रिकॉर्ड एवं इतिहास</div>
            </div>
          </button>
        </div>
      </div>
    `;

    // Bind Hub Action Buttons
    mount.querySelector('#btn-reset-intake')?.addEventListener('click', () => {
      this.resolvedPatient = null;
      mount.innerHTML = '';
      showToast('Desk reset. Ready for next patient.', 'info');
    });

    mount.querySelector('#btn-action-opd')?.addEventListener('click', () => {
      window.location.hash = `#patient?id=${cleanId}&tab=consultation`;
    });

    mount.querySelector('#btn-action-upload')?.addEventListener('click', () => {
      new DocumentScannerModal({
        patientId: cleanId,
        category: 'OPD Doctor Prescription Slip'
      }).open();
    });

    mount.querySelector('#btn-action-admit')?.addEventListener('click', () => {
      this.openQuickAdmitModal(patient);
    });

    mount.querySelector('#btn-action-chart')?.addEventListener('click', () => {
      window.location.hash = `#patient?id=${cleanId}`;
    });

    // Scroll to action hub smoothly
    mount.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // ==========================================
  // QUICK ADMIT MODAL (IPD BHARTI)
  // ==========================================
  openQuickAdmitModal(patient) {
    const wards = hospitalStore.getStandardWards();
    const doctors = hospitalStore.getDoctors();
    const currentStaff = hospitalStore.getCurrentStaff();

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-dialog" style="max-width: 580px;">
        <div class="modal-header">
          <div>
            <h3 style="font-size: 16px; font-weight: 700; color: var(--text-main); margin: 0;">Inpatient Ward Admission (मरीज भर्ती)</h3>
            <p style="font-size: 11.5px; color: var(--text-muted); margin: 2px 0 0 0;">Admit ${patient.fullName} (${formatHealthId(patient.healthId)})</p>
          </div>
          <button type="button" class="btn btn-sm btn-ghost modal-close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <form id="quick-admit-form">
          <div class="modal-body" style="display: flex; flex-direction: column; gap: 14px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label" style="font-weight: 600;">Admission Ward (वार्ड) *</label>
                <select id="admit-ward-select" class="form-select" required>
                  ${wards.map(w => `<option value="${w.name}">${w.name}</option>`).join('')}
                </select>
              </div>

              <div class="form-group">
                <label class="form-label" style="font-weight: 600;">Bed Number (बेड नंबर) *</label>
                <select id="admit-bed-select" class="form-select" required>
                  ${wards[0].beds.map(b => `<option value="${b}">${b}</option>`).join('')}
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" style="font-weight: 600;">Attending Doctor (सलाहकार डॉक्टर) *</label>
              <select id="admit-doctor-select" class="form-select" required>
                ${doctors.map(d => `<option value="${d.name}">${d.name} (${d.department})</option>`).join('')}
              </select>
            </div>

            <div class="form-group">
              <label class="form-label" style="font-weight: 600;">Admitting Diagnosis / Chief Complaints (प्रारंभिक निदान) *</label>
              <input type="text" id="admit-diagnosis" class="form-input" placeholder="e.g. Acute Gastroenteritis with severe dehydration" required />
            </div>

            <div class="form-group">
              <label class="form-label" style="font-weight: 600;">Initial Doctor Intake Note (प्रारंभिक निर्देश)</label>
              <textarea id="admit-initial-note" class="form-textarea" rows="2" placeholder="Start IV fluids, maintain intake/output chart, urgent CBC & serum electrolytes."></textarea>
            </div>
          </div>

          <div class="modal-footer" style="display: flex; justify-content: flex-end; gap: 10px;">
            <button type="button" class="btn btn-secondary modal-close">Cancel</button>
            <button type="submit" class="btn btn-primary" style="font-weight: 700;">Confirm Ward Admission →</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(overlay);

    // Update beds when ward changes
    const wardSelect = overlay.querySelector('#admit-ward-select');
    const bedSelect = overlay.querySelector('#admit-bed-select');
    wardSelect.addEventListener('change', () => {
      const selectedWard = wards.find(w => w.name === wardSelect.value) || wards[0];
      bedSelect.innerHTML = selectedWard.beds.map(b => `<option value="${b}">${b}</option>`).join('');
    });

    // Close buttons
    overlay.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', () => overlay.remove());
    });

    // Submit admission
    overlay.querySelector('#quick-admit-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const ward = wardSelect.value;
      const bed = bedSelect.value;
      const doctor = overlay.querySelector('#admit-doctor-select').value;
      const diagnosis = overlay.querySelector('#admit-diagnosis').value;
      const initialNote = overlay.querySelector('#admit-initial-note').value;

      hospitalStore.addAdmission({
        healthId: patient.healthId,
        memberName: patient.fullName,
        ward: ward,
        bedNumber: bed,
        admittingDoctor: doctor,
        admittingDiagnosis: diagnosis,
        initialDoctorNote: initialNote
      });

      overlay.remove();
      showToast(`${patient.fullName} admitted to ${ward} (${bed}) successfully!`, 'success');
      window.location.hash = '#admissions';
    });
  }

  // ==========================================
  // EVENT BINDINGS
  // ==========================================
  bindEvents() {
    // Mode Tab Buttons
    this.container.querySelector('#tab-btn-search')?.addEventListener('click', () => {
      this.activeTab = 'search';
      this.render();
    });

    this.container.querySelector('#tab-btn-register')?.addEventListener('click', () => {
      this.activeTab = 'register';
      this.render();
    });

    this.container.querySelector('#btn-switch-to-register')?.addEventListener('click', () => {
      this.activeTab = 'register';
      this.render();
    });

    // Search Form Submit
    const searchForm = this.container.querySelector('#intake-search-form');
    searchForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = this.container.querySelector('#intake-search-input');
      if (input && input.value) {
        this.handleLookup(input.value);
      }
    });

    // 10-digit auto-grouping on search input
    const searchInput = this.container.querySelector('#intake-search-input');
    searchInput?.addEventListener('input', (e) => {
      const raw = e.target.value.replace(/\D/g, '');
      if (raw.length <= 10 && /^\d+$/.test(e.target.value.replace(/\s/g, ''))) {
        e.target.value = raw.length > 5 ? `${raw.slice(0, 5)} ${raw.slice(5, 10)}` : raw;
      }
    });

    // Quick select buttons
    this.container.querySelectorAll('.btn-quick-select').forEach(btn => {
      btn.addEventListener('click', () => {
        const hid = btn.getAttribute('data-hid');
        const input = this.container.querySelector('#intake-search-input');
        if (input) input.value = hid;
        this.handleLookup(hid);
      });
    });

    // Start Camera Button
    this.container.querySelector('#btn-start-intake-camera')?.addEventListener('click', () => {
      this.startCamera();
    });

    // Auto-group 10-digit existing Health ID if typed
    const existingHidInput = this.container.querySelector('#reg-existing-hid');
    existingHidInput?.addEventListener('input', (e) => {
      const raw = e.target.value.replace(/\D/g, '');
      if (raw.length <= 10) {
        e.target.value = raw.length > 5 ? `${raw.slice(0, 5)} ${raw.slice(5, 10)}` : raw;
      }
    });

    // Cancel Registration
    this.container.querySelector('#btn-cancel-register')?.addEventListener('click', () => {
      this.activeTab = 'search';
      this.render();
    });

    // Register Form Submit
    const regForm = this.container.querySelector('#new-patient-form');
    regForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleRegister();
    });
  }

  // ==========================================
  // REAL CAMERA QR SCANNER (jsQR Engine)
  // ==========================================
  async startCamera() {
    this.videoEl = this.container.querySelector('#intake-video');
    this.canvasEl = this.container.querySelector('#intake-canvas');
    const placeholder = this.container.querySelector('#intake-cam-placeholder');
    const statusBadge = this.container.querySelector('#camera-status-badge');

    if (!this.canvasEl) return;
    this.canvasCtx = this.canvasEl.getContext('2d', { willReadFrequently: true });

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });

      if (this.videoEl) {
        this.videoEl.srcObject = this.stream;
        this.videoEl.setAttribute('playsinline', 'true');
        await this.videoEl.play();

        if (placeholder) placeholder.style.display = 'none';
        if (statusBadge) {
          statusBadge.textContent = 'Camera Active';
          statusBadge.style.background = '#dcfce7';
          statusBadge.style.color = '#15803d';
        }

        showToast('Camera active. Point towards HealthCard QR code.', 'info');
        this.scanVideoFrame();
      }
    } catch (err) {
      console.warn('Camera stream error:', err);
      showToast('Camera unavailable. Use manual search or demo cards.', 'warning');
      if (placeholder) {
        placeholder.innerHTML = `
          <div style="color: #ef4444; font-weight: 700; margin-bottom: 6px;">Camera Access Denied / Unavailable</div>
          <div style="font-size: 11.5px; color: #94a3b8; margin-bottom: 12px;">Webcam not connected or permission blocked.</div>
          <button type="button" class="btn btn-sm btn-primary" id="btn-fallback-rahul">
            Simulate Scan (Rahul Sharma)
          </button>
        `;
        placeholder.querySelector('#btn-fallback-rahul')?.addEventListener('click', () => {
          this.handleLookup('74839 16251');
        });
      }
    }
  }

  scanVideoFrame() {
    if (!this.videoEl || this.videoEl.readyState !== this.videoEl.HAVE_ENOUGH_DATA) {
      this.scanningAnimFrame = requestAnimationFrame(() => this.scanVideoFrame());
      return;
    }

    this.canvasEl.width = this.videoEl.videoWidth;
    this.canvasEl.height = this.videoEl.videoHeight;
    this.canvasCtx.drawImage(this.videoEl.video, 0, 0, this.canvasEl.width, this.canvasEl.height);

    const imageData = this.canvasCtx.getImageData(0, 0, this.canvasEl.width, this.canvasEl.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height, {
      inversionAttempts: 'dontInvert'
    });

    if (code && code.data) {
      const parsedQuery = this.extractHealthIdFromQR(code.data);
      if (parsedQuery) {
        this.stopCamera();
        showToast('Valid HealthCard QR detected!', 'success');
        this.handleLookup(parsedQuery);
        return;
      }
    }

    this.scanningAnimFrame = requestAnimationFrame(() => this.scanVideoFrame());
  }

  extractHealthIdFromQR(rawValue) {
    if (!rawValue) return null;
    const str = rawValue.trim();

    // 1. URL pattern: https://hc.national.gov.in/c/{healthId}
    const urlMatch = str.match(/hc\.national\.gov\.in\/c\/([A-Za-z0-9_]+)/i);
    if (urlMatch) return urlMatch[1];

    // 2. Token pattern: tok_{token}
    if (str.startsWith('tok_')) return str;

    // 3. 10-digit number
    const digitsOnly = str.replace(/\D/g, '');
    if (digitsOnly.length === 10) return digitsOnly;

    return null;
  }

  stopCamera() {
    if (this.scanningAnimFrame) {
      cancelAnimationFrame(this.scanningAnimFrame);
      this.scanningAnimFrame = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
      this.stream = null;
    }
  }

  // ==========================================
  // PATIENT LOOKUP HANDLER
  // ==========================================
  handleLookup(query) {
    const res = hospitalStore.resolveCardToken(query);
    const mount = this.container.querySelector('#patient-action-hub-mount');
    if (!mount) return;

    if (!res || !res.found || !res.patient) {
      mount.innerHTML = `
        <div style="background: #fef2f2; border: 1.5px solid #fecaca; border-radius: var(--radius-xl); padding: 22px; text-align: center; color: #991b1b; animation: fadeIn 0.2s ease;">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2" style="margin-bottom: 8px;"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          <div style="font-weight: 700; font-size: 15px;">No Patient Found for "${query}"</div>
          <div style="font-size: 12.5px; margin-top: 4px; color: #7f1d1d; max-width: 480px; margin-left: auto; margin-right: auto;">
            This identifier is not registered yet. You can register them as a walk-in patient in under 60 seconds.
          </div>
          <button type="button" class="btn btn-primary" id="btn-goto-register-unfound" style="margin-top: 14px;">
            + Register New Walk-In Patient Now
          </button>
        </div>
      `;

      mount.querySelector('#btn-goto-register-unfound')?.addEventListener('click', () => {
        this.activeTab = 'register';
        this.render();
      });

      showToast('Patient not found in registry', 'error');
      return;
    }

    this.resolvedPatient = res.patient;
    this.renderActionHub(res.patient);
    showToast(`Found patient: ${res.patient.fullName}`, 'success');
  }

  // ==========================================
  // NEW PATIENT REGISTRATION HANDLER
  // ==========================================
  handleRegister() {
    const name = this.container.querySelector('#reg-name').value.trim();
    const age = this.container.querySelector('#reg-age').value.trim();
    const gender = this.container.querySelector('#reg-gender').value;
    const mobile = this.container.querySelector('#reg-mobile').value.trim();
    const bloodGroup = this.container.querySelector('#reg-blood').value;
    const guardian = this.container.querySelector('#reg-guardian').value.trim();
    const address = this.container.querySelector('#reg-address').value.trim();
    const city = this.container.querySelector('#reg-city').value.trim();
    const pincode = this.container.querySelector('#reg-pincode').value.trim();

    const existingHid = this.container.querySelector('#reg-existing-hid')?.value.trim();

    try {
      const result = hospitalStore.registerPatient({
        fullName: name,
        age: age,
        gender: gender,
        mobile: mobile,
        bloodGroup: bloodGroup,
        guardianName: guardian,
        address: address,
        city: city,
        pincode: pincode,
        healthId: existingHid || null
      });

      if (result && result.patient) {
        const msg = result.patient.healthId
          ? `Patient registered with Health ID ${result.patient.healthId}`
          : `Patient registered successfully (UHID: ${result.patient.regNumber})`;
        showToast(msg, 'success');
        this.resolvedPatient = result.patient;
        this.renderActionHub(result.patient);
      }
    } catch (err) {
      showToast(err.message || 'Registration failed', 'error');
    }
  }
}
