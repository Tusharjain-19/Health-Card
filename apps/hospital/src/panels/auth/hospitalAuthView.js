/**
 * HealthCard Hospital Portal: Institutional Healthcare Gateway & Authentication View
 * Unified National Gateway for Empanelled Hospitals, Trauma Centers & Clinicians.
 * Strictly English UI with zero emojis and sharp SVG vector illustrations.
 */

import { hospitalStore } from '../../shared/storage.js';
import { showToast } from '../../shared/components/toast.js';

export class HospitalAuthView {
  constructor(container, onLoginSuccess) {
    this.container = container;
    this.onLoginSuccess = onLoginSuccess;
    this.activeTab = 'signin'; // 'signin' | 'apply' | 'explainer'
    this.pendingAppReceipt = null;
  }

  render() {
    this.container.innerHTML = `
      <div class="hospital-auth-wrapper" style="min-height: calc(100vh - 90px); display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 24px 16px; background: linear-gradient(180deg, #f0fdf4 0%, #f8fafc 40%, #ffffff 100%);">
        
        <!-- Brand & Gateway Illustration Hero Banner -->
        <div style="text-align: center; max-width: 680px; margin-bottom: 24px;">
          <!-- SVG Network Shield Crest -->
          <div style="display: inline-flex; align-items: center; justify-content: center; width: 72px; height: 72px; background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%); border-radius: 18px; box-shadow: 0 10px 25px -5px rgba(29, 78, 216, 0.35); margin-bottom: 14px; position: relative;">
            <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <path d="M12 8v8M8 12h8" stroke-width="2.4"/>
            </svg>
            <div style="position: absolute; -top: 4px; -right: 4px; width: 14px; height: 14px; background: #10b981; border: 2.5px solid #ffffff; border-radius: 50%;" title="Network Online"></div>
          </div>

          <h1 style="font-size: 24px; font-weight: 800; color: #0f172a; margin: 0 0 6px 0; letter-spacing: -0.5px;">
            National Institutional Healthcare Gateway
          </h1>
          <p style="font-size: 13.5px; color: #475569; margin: 0; line-height: 1.5; font-weight: 500;">
            Unified Clinical Workstation for Empanelled Hospitals, Medical Colleges, Trauma Units & Registered Clinicians
          </p>

          <!-- Security Badges Row -->
          <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin-top: 12px; flex-wrap: wrap;">
            <span style="display: inline-flex; align-items: center; gap: 5px; background: #eff6ff; border: 1px solid #bfdbfe; color: #1d4ed8; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              ABDM & NDHM Compliant
            </span>
            <span style="display: inline-flex; align-items: center; gap: 5px; background: #ecfdf5; border: 1px solid #a7f3d0; color: #047857; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              256-Bit Encrypted Vault
            </span>
            <span style="display: inline-flex; align-items: center; gap: 5px; background: #f8fafc; border: 1px solid #e2e8f0; color: #475569; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              NABH & State Reg Verified
            </span>
          </div>
        </div>

        <!-- Main Card Container -->
        <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; box-shadow: 0 12px 32px -8px rgba(15, 23, 42, 0.08), 0 4px 12px -2px rgba(15, 23, 42, 0.04); max-width: 540px; width: 100%; overflow: hidden;">
          
          <!-- Navigation Tabs -->
          <div style="display: grid; grid-template-columns: 1.2fr 1.4fr 1.1fr; background: #f8fafc; border-bottom: 1px solid #e2e8f0; padding: 4px;">
            <button type="button" class="auth-tab-btn" id="tab-btn-signin" style="padding: 10px 8px; border: none; background: ${this.activeTab === 'signin' ? '#ffffff' : 'transparent'}; color: ${this.activeTab === 'signin' ? '#1d4ed8' : '#64748b'}; font-weight: 700; font-size: 12.5px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; box-shadow: ${this.activeTab === 'signin' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none'}; transition: all 0.15s ease;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
              Sign In
            </button>
            <button type="button" class="auth-tab-btn" id="tab-btn-apply" style="padding: 10px 8px; border: none; background: ${this.activeTab === 'apply' ? '#ffffff' : 'transparent'}; color: ${this.activeTab === 'apply' ? '#1d4ed8' : '#64748b'}; font-weight: 700; font-size: 12.5px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; box-shadow: ${this.activeTab === 'apply' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none'}; transition: all 0.15s ease;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
              Apply for Access
            </button>
            <button type="button" class="auth-tab-btn" id="tab-btn-explainer" style="padding: 10px 8px; border: none; background: ${this.activeTab === 'explainer' ? '#ffffff' : 'transparent'}; color: ${this.activeTab === 'explainer' ? '#1d4ed8' : '#64748b'}; font-weight: 700; font-size: 12.5px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 6px; box-shadow: ${this.activeTab === 'explainer' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none'}; transition: all 0.15s ease;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              What is this?
            </button>
          </div>

          <!-- Dynamic Tab Content Body -->
          <div id="auth-tab-content-container" style="padding: 24px 26px;">
            ${this.renderActiveTabContent()}
          </div>

          <!-- Footer Information Bar -->
          <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 12px 24px; display: flex; align-items: center; justify-content: space-between; font-size: 11px; color: #64748b;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span>National Health Infrastructure</span>
            </div>
            <a href="javascript:void(0)" id="link-open-explainer-footer" style="color: #1d4ed8; text-decoration: none; font-weight: 600;">
              How verification works &rarr;
            </a>
          </div>
        </div>

        <!-- Help Link Under Card -->
        <div style="margin-top: 16px; font-size: 12px; color: #64748b; text-align: center;">
          Need assistance or clinical support? Contact <strong>1800-890-4325</strong> or email <strong>support@healthcard.gov.in</strong>
        </div>

      </div>

      <!-- Container for Password Change Modal -->
      <div id="auth-modal-slot"></div>
    `;

    this.bindEvents();
  }

  renderActiveTabContent() {
    if (this.activeTab === 'signin') {
      return this.renderSignInTab();
    } else if (this.activeTab === 'apply') {
      return this.renderApplyTab();
    } else if (this.activeTab === 'explainer') {
      return this.renderExplainerTab();
    }
    return '';
  }

  // TAB 1: INSTITUTIONAL SIGN IN
  renderSignInTab() {
    const defaultHosp = hospitalStore.getRegisteredHospitals()[0] || {};

    return `
      <div>
        <div style="margin-bottom: 18px;">
          <h2 style="font-size: 16.5px; font-weight: 700; color: #0f172a; margin: 0 0 4px 0;">Sign In to Institutional Workstation</h2>
          <p style="font-size: 12px; color: #64748b; margin: 0;">Enter your hospital administrator or authorized doctor application credentials</p>
        </div>

        <!-- What is this? Info Pill Callout -->
        <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 10px 12px; margin-bottom: 18px; display: flex; align-items: flex-start; gap: 10px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" stroke-width="2.5" style="flex-shrink: 0; margin-top: 2px;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          <div style="font-size: 11.5px; color: #1e3a8a; line-height: 1.45;">
            <strong>What is this portal?</strong> A secured clinical interface for empanelled hospitals & clinics to scan HealthCards, write digital OPD notes, and access emergency records. 
            <a href="javascript:void(0)" id="link-expand-explainer" style="color: #1d4ed8; font-weight: 700; text-decoration: underline; margin-left: 4px;">Learn more</a>
          </div>
        </div>

        <form id="hospital-login-form">
          <!-- Username / ID -->
          <div class="form-group" style="margin-bottom: 14px;">
            <label class="form-label" style="font-weight: 700; font-size: 12px; color: #1e293b; display: flex; justify-content: space-between; align-items: center;">
              <span style="display: flex; align-items: center; gap: 6px;">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                Hospital Login ID / Clinician Username:
              </span>
            </label>
            <input 
              type="text" 
              id="hosp-login-user" 
              class="form-input" 
              placeholder="e.g. admin@apollo.health or doc.vikram" 
              value="${defaultHosp.adminLoginId || 'admin@aiims.gov.in'}" 
              required 
              style="font-size: 13.5px; padding: 10px 14px; width: 100%;" 
            />
          </div>

          <!-- Dynamic Hospital Credential Recognition Banner -->
          <div id="live-credential-detector" style="margin-bottom: 14px; border-radius: 8px; padding: 10px 12px; font-size: 12px; border: 1px solid #bfdbfe; background: #f0f7ff; display: flex; align-items: center; gap: 10px;">
            <div style="width: 28px; height: 28px; border-radius: 6px; background: #dbeafe; display: flex; align-items: center; justify-content: center; color: #1d4ed8; flex-shrink: 0;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 2v20M2 12h20"/></svg>
            </div>
            <div style="flex: 1;">
              <div id="detector-title" style="font-weight: 700; color: #1e3a8a;">AIIMS New Delhi</div>
              <div id="detector-desc" style="font-size: 11px; color: #3b82f6;">Apex National Medical Institute • HOSP-DL-00192</div>
            </div>
            <span id="detector-badge" class="badge badge-active" style="font-size: 10px;">Recognized</span>
          </div>

          <!-- Password / PIN Input -->
          <div class="form-group" style="margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <label class="form-label" style="font-weight: 700; font-size: 12px; color: #1e293b; display: flex; align-items: center; gap: 6px; margin-bottom: 0;">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                Security Password / Doctor Access PIN:
              </label>
              <button type="button" id="btn-open-change-pass-modal" style="border: none; background: none; color: #1d4ed8; font-size: 11.5px; font-weight: 600; cursor: pointer; padding: 0; text-decoration: underline;">
                Change Password / PIN?
              </button>
            </div>
            <div style="position: relative;">
              <input 
                type="password" 
                id="hosp-login-pass" 
                class="form-input" 
                placeholder="Enter password or 4-digit PIN" 
                value="${defaultHosp.adminPassword || 'admin123'}" 
                required 
                style="font-size: 13.5px; padding: 10px 14px; padding-right: 40px; width: 100%;" 
              />
              <button type="button" id="btn-toggle-pass-visibility" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); border: none; background: none; color: #64748b; cursor: pointer; padding: 4px;" title="Toggle Password Visibility">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
            </div>
          </div>

          <!-- Error Alert Banner -->
          <div id="hosp-login-error" style="display: none; padding: 10px 12px; border-radius: 8px; background: #fee2e2; border: 1px solid #fca5a5; color: #991b1b; font-size: 12px; margin-bottom: 14px;"></div>

          <!-- Submit Button -->
          <button type="submit" class="btn btn-primary" id="btn-submit-hosp-login" style="width: 100%; padding: 12px; font-weight: 700; font-size: 14px; justify-content: center; gap: 8px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
            Sign In to Hospital Portal
          </button>
        </form>

        <!-- Divider -->
        <div style="display: flex; align-items: center; margin: 20px 0 16px; color: #94a3b8; font-size: 11px; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em;">
          <div style="flex: 1; height: 1px; background: #e2e8f0;"></div>
          <span style="padding: 0 10px;">1-Click Empanelled Hospital Switcher</span>
          <div style="flex: 1; height: 1px; background: #e2e8f0;"></div>
        </div>

        <!-- Multi-Hospital Demo Access Chips (AIIMS, Apollo, Fortis, Max, Clinicians) -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
          <button type="button" class="btn btn-outline btn-quick-hosp" data-user="admin@aiims.gov.in" data-pass="admin123" style="text-align: left; padding: 8px 10px; font-size: 11.5px; background: #f8fafc; border-radius: 8px; justify-content: flex-start; gap: 8px;">
            <div style="width: 22px; height: 22px; border-radius: 4px; background: #dbeafe; color: #1d4ed8; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 11px;">AI</div>
            <div style="overflow: hidden;">
              <div style="font-weight: 700; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">AIIMS New Delhi</div>
              <div style="font-size: 10px; color: #64748b;">Apex Govt Hospital</div>
            </div>
          </button>

          <button type="button" class="btn btn-outline btn-quick-hosp" data-user="admin@apollo.health" data-pass="apollo123" style="text-align: left; padding: 8px 10px; font-size: 11.5px; background: #f8fafc; border-radius: 8px; justify-content: flex-start; gap: 8px;">
            <div style="width: 22px; height: 22px; border-radius: 4px; background: #dcfce7; color: #15803d; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 11px;">AP</div>
            <div style="overflow: hidden;">
              <div style="font-weight: 700; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Apollo Hospitals</div>
              <div style="font-size: 10px; color: #64748b;">Multispeciality</div>
            </div>
          </button>

          <button type="button" class="btn btn-outline btn-quick-hosp" data-user="admin@fortis.in" data-pass="fortis123" style="text-align: left; padding: 8px 10px; font-size: 11.5px; background: #f8fafc; border-radius: 8px; justify-content: flex-start; gap: 8px;">
            <div style="width: 22px; height: 22px; border-radius: 4px; background: #fee2e2; color: #b91c1c; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 11px;">FO</div>
            <div style="overflow: hidden;">
              <div style="font-weight: 700; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Fortis Healthcare</div>
              <div style="font-size: 10px; color: #64748b;">Cardiac & Trauma</div>
            </div>
          </button>

          <button type="button" class="btn btn-outline btn-quick-hosp" data-user="admin@maxhealthcare.in" data-pass="maxpass" style="text-align: left; padding: 8px 10px; font-size: 11.5px; background: #f8fafc; border-radius: 8px; justify-content: flex-start; gap: 8px;">
            <div style="width: 22px; height: 22px; border-radius: 4px; background: #fef3c7; color: #b45309; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 11px;">MX</div>
            <div style="overflow: hidden;">
              <div style="font-weight: 700; color: #0f172a; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">Max Healthcare</div>
              <div style="font-size: 10px; color: #64748b;">Robotic Surgery</div>
            </div>
          </button>
        </div>

        <!-- Clinicians quick row -->
        <div style="display: flex; gap: 8px; margin-top: 8px;">
          <button type="button" class="btn btn-outline btn-quick-hosp" data-user="doc.vikram" data-pass="1982" style="flex: 1; padding: 6px 10px; font-size: 11px; justify-content: center; gap: 6px;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/></svg>
            <span>Dr. Vikram Sethi (Cardiology)</span>
          </button>
          <button type="button" class="btn btn-outline btn-quick-hosp" data-user="doc.neha" data-pass="2045" style="flex: 1; padding: 6px 10px; font-size: 11px; justify-content: center; gap: 6px;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/></svg>
            <span>Dr. Neha Kapoor (General Med)</span>
          </button>
        </div>

        <!-- Apply Callout Footer Link -->
        <div style="text-align: center; margin-top: 18px; padding-top: 14px; border-top: 1px dashed #e2e8f0; font-size: 12px; color: #64748b;">
          Hospital not registered yet? 
          <a href="javascript:void(0)" id="link-switch-to-apply" style="color: #1d4ed8; font-weight: 700; text-decoration: underline; margin-left: 4px;">
            Apply for Hospital Credentials &rarr;
          </a>
        </div>
      </div>
    `;
  }

  // TAB 2: APPLY FOR HOSPITAL CREDENTIALS
  renderApplyTab() {
    if (this.pendingAppReceipt) {
      return this.renderApplicationReceipt(this.pendingAppReceipt);
    }

    return `
      <div>
        <div style="margin-bottom: 16px;">
          <div style="display: inline-flex; align-items: center; gap: 6px; background: #ecfdf5; border: 1px solid #a7f3d0; color: #047857; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; margin-bottom: 6px;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            National Healthcare Registry Registration
          </div>
          <h2 style="font-size: 16.5px; font-weight: 700; color: #0f172a; margin: 0 0 4px 0;">Apply for Hospital Portal Credentials</h2>
          <p style="font-size: 12px; color: #64748b; margin: 0;">Submit clinical establishment details to Central HealthCard Administrator for credential issuance</p>
        </div>

        <form id="hospital-apply-form">
          <!-- Hospital Name & Reg Number -->
          <div style="display: grid; grid-template-columns: 1.4fr 1fr; gap: 12px; margin-bottom: 12px;">
            <div class="form-group">
              <label class="form-label" style="font-weight: 700; font-size: 11.5px;">Hospital Legal Name *</label>
              <input type="text" id="reg-hosp-name" class="form-input" placeholder="e.g. Manipal Hospital Dwarka" required style="font-size: 12.5px; padding: 8px 12px;" />
            </div>
            <div class="form-group">
              <label class="form-label" style="font-weight: 700; font-size: 11.5px;">State Clinical Reg. No *</label>
              <input type="text" id="reg-hosp-regno" class="form-input" placeholder="e.g. HOSP-DL-09941" required style="font-size: 12.5px; padding: 8px 12px;" />
            </div>
          </div>

          <!-- Short Name & Type -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
            <div class="form-group">
              <label class="form-label" style="font-weight: 700; font-size: 11.5px;">Short Display Name *</label>
              <input type="text" id="reg-hosp-shortname" class="form-input" placeholder="e.g. Manipal Hospital" required style="font-size: 12.5px; padding: 8px 12px;" />
            </div>
            <div class="form-group">
              <label class="form-label" style="font-weight: 700; font-size: 11.5px;">Facility Category *</label>
              <select id="reg-hosp-type" class="form-input" required style="font-size: 12.5px; padding: 8px 12px;">
                <option value="Private Multispecialty">Private Multispecialty</option>
                <option value="Government Apex Institute">Government Apex Institute</option>
                <option value="Super-Specialty Hospital">Super-Specialty Hospital</option>
                <option value="District Civil Hospital">District Civil Hospital</option>
                <option value="Charitable / Trust Hospital">Charitable / Trust Hospital</option>
                <option value="Primary Healthcare Center">Primary Healthcare Center</option>
              </select>
            </div>
          </div>

          <!-- State & City -->
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 12px;">
            <div class="form-group">
              <label class="form-label" style="font-weight: 700; font-size: 11.5px;">State / UT *</label>
              <input type="text" id="reg-hosp-state" class="form-input" placeholder="e.g. Delhi" value="Delhi" required style="font-size: 12.5px; padding: 8px 12px;" />
            </div>
            <div class="form-group">
              <label class="form-label" style="font-weight: 700; font-size: 11.5px;">City *</label>
              <input type="text" id="reg-hosp-city" class="form-input" placeholder="e.g. Dwarka" value="New Delhi" required style="font-size: 12.5px; padding: 8px 12px;" />
            </div>
            <div class="form-group">
              <label class="form-label" style="font-weight: 700; font-size: 11.5px;">Total Beds *</label>
              <input type="number" id="reg-hosp-beds" class="form-input" placeholder="e.g. 350" value="350" required style="font-size: 12.5px; padding: 8px 12px;" />
            </div>
          </div>

          <!-- Nodal Administrator Name & Official Email -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
            <div class="form-group">
              <label class="form-label" style="font-weight: 700; font-size: 11.5px;">Medical Director / Nodal Officer *</label>
              <input type="text" id="reg-hosp-adminname" class="form-input" placeholder="e.g. Dr. Sunita Rao" required style="font-size: 12.5px; padding: 8px 12px;" />
            </div>
            <div class="form-group">
              <label class="form-label" style="font-weight: 700; font-size: 11.5px;">Official Email (Credentials sent here) *</label>
              <input type="email" id="reg-hosp-email" class="form-input" placeholder="e.g. admin@manipal.org" required style="font-size: 12.5px; padding: 8px 12px;" />
            </div>
          </div>

          <!-- Contact Helpline & Accreditation -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
            <div class="form-group">
              <label class="form-label" style="font-weight: 700; font-size: 11.5px;">Emergency Phone / Helpline *</label>
              <input type="text" id="reg-hosp-phone" class="form-input" placeholder="e.g. +91 11 4987 6543" required style="font-size: 12.5px; padding: 8px 12px;" />
            </div>
            <div class="form-group">
              <label class="form-label" style="font-weight: 700; font-size: 11.5px;">Accreditation Status *</label>
              <select id="reg-hosp-accreditation" class="form-input" style="font-size: 12.5px; padding: 8px 12px;">
                <option value="NABH Accredited">NABH Accredited</option>
                <option value="JCI & NABH Accredited">JCI & NABH Accredited</option>
                <option value="State Clinical Establishment Reg">State Clinical Establishment Reg</option>
                <option value="NABL Certified">NABL Certified</option>
              </select>
            </div>
          </div>

          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; margin-bottom: 16px; font-size: 11.5px; color: #475569; display: flex; align-items: center; gap: 8px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2.2" style="flex-shrink: 0;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            <span>Central HealthCard Administrators verify submitted state registration before issuing Login ID and temporary password.</span>
          </div>

          <div style="display: flex; gap: 10px;">
            <button type="button" class="btn btn-secondary" id="btn-cancel-apply" style="flex: 1; padding: 10px;">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary" id="btn-submit-hospital-reg" style="flex: 2; padding: 10px; font-weight: 700;">
              Submit Hospital Registration &rarr;
            </button>
          </div>
        </form>
      </div>
    `;
  }

  // Application Receipt Screen
  renderApplicationReceipt(app) {
    return `
      <div>
        <div style="text-align: center; margin-bottom: 18px;">
          <div style="width: 52px; height: 52px; background: #ecfdf5; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; color: #059669; margin-bottom: 10px;">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h2 style="font-size: 17px; font-weight: 800; color: #0f172a; margin: 0 0 4px 0;">Hospital Application Registered!</h2>
          <p style="font-size: 12px; color: #64748b; margin: 0;">Application Ref: <strong class="font-mono" style="color: #1d4ed8;">${app.refNumber}</strong></p>
        </div>

        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px 16px; margin-bottom: 18px;">
          <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: #64748b; margin-bottom: 8px;">Registration Summary</div>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px; margin-bottom: 8px;">
            <div>
              <span style="color: #64748b;">Hospital:</span>
              <div style="font-weight: 700; color: #0f172a;">${app.hospitalName}</div>
            </div>
            <div>
              <span style="color: #64748b;">Registration No:</span>
              <div style="font-weight: 700; color: #0f172a;">${app.regNumber}</div>
            </div>
            <div>
              <span style="color: #64748b;">Nodal Officer:</span>
              <div style="font-weight: 700; color: #0f172a;">${app.adminName}</div>
            </div>
            <div>
              <span style="color: #64748b;">Credential Dispatch:</span>
              <div style="font-weight: 700; color: #1d4ed8;">${app.email}</div>
            </div>
          </div>

          <div style="border-top: 1px solid #e2e8f0; padding-top: 8px; display: flex; align-items: center; justify-content: space-between;">
            <span style="font-size: 11.5px; color: #64748b;">Application Status:</span>
            <span class="badge ${app.status === 'APPROVED' ? 'badge-active' : 'badge-blue'}" style="font-size: 11px; font-weight: 700;">
              ${app.status === 'APPROVED' ? 'APPROVED & ISSUED' : 'PENDING ADMIN APPROVAL'}
            </span>
          </div>
        </div>

        ${app.status === 'APPROVED' ? `
          <div style="background: #ecfdf5; border: 1.5px solid #a7f3d0; border-radius: 10px; padding: 14px; margin-bottom: 18px;">
            <div style="font-size: 12px; font-weight: 700; color: #065f46; margin-bottom: 6px; display: flex; align-items: center; gap: 6px;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              Central Admin Issued Credentials:
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px; background: #ffffff; padding: 8px 12px; border-radius: 6px; border: 1px solid #d1fae5;">
              <div>
                <span style="color: #047857; font-size: 11px;">Assigned Login ID:</span>
                <div class="font-mono font-bold" style="color: #065f46;">${app.issuedLoginId}</div>
              </div>
              <div>
                <span style="color: #047857; font-size: 11px;">Temporary Password:</span>
                <div class="font-mono font-bold" style="color: #065f46;">${app.issuedPassword}</div>
              </div>
            </div>
            <div style="font-size: 11px; color: #047857; margin-top: 6px;">
              Note: You can change this password anytime using "Change Password / PIN" or in Hospital Settings.
            </div>
          </div>
        ` : `
          <!-- Simulation Shortcut for Reviewer / Admin Testing -->
          <div style="background: #eff6ff; border: 1px dashed #93c5fd; border-radius: 8px; padding: 12px; margin-bottom: 18px;">
            <div style="font-size: 11.5px; font-weight: 700; color: #1e3a8a; margin-bottom: 4px;">
              Testing Central Admin Approval Flow?
            </div>
            <div style="font-size: 11px; color: #3b82f6; margin-bottom: 10px;">
              This application has been transmitted to Central HealthCard Admin Panel. You can also trigger instant credential issuance right here:
            </div>
            <button type="button" class="btn btn-sm btn-primary" id="btn-simulate-admin-approval" style="width: 100%; font-size: 12px; justify-content: center; gap: 6px;">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              Fast-Track Central Admin Approval (Demo Action)
            </button>
          </div>
        `}

        <div style="display: flex; gap: 10px;">
          <button type="button" class="btn btn-outline" id="btn-receipt-new-app" style="flex: 1; padding: 10px; font-size: 12px;">
            New Registration
          </button>
          <button type="button" class="btn btn-primary" id="btn-receipt-go-login" style="flex: 2; padding: 10px; font-weight: 700; font-size: 13px;">
            ${app.status === 'APPROVED' ? 'Sign In With Issued Credentials &rarr;' : 'Go to Sign In Terminal'}
          </button>
        </div>
      </div>
    `;
  }

  // TAB 3: "WHAT IS THIS?" EXPLAINER TAB
  renderExplainerTab() {
    return `
      <div>
        <div style="margin-bottom: 16px;">
          <h2 style="font-size: 16.5px; font-weight: 700; color: #0f172a; margin: 0 0 4px 0;">What is the Hospital Gateway Portal?</h2>
          <p style="font-size: 12px; color: #64748b; margin: 0;">Institutional overview of the National HealthCard Clinical Network</p>
        </div>

        <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px;">
          
          <!-- Item 1 -->
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 14px; display: flex; gap: 12px;">
            <div style="width: 32px; height: 32px; border-radius: 8px; background: #eff6ff; color: #1d4ed8; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <div>
              <div style="font-weight: 700; font-size: 13px; color: #0f172a;">1. Multi-Hospital National Network</div>
              <div style="font-size: 11.5px; color: #475569; margin-top: 2px; line-height: 1.45;">
                This gateway connects all empanelled medical centers across India — including AIIMS, Apollo, Fortis, Max, and verified state hospitals. It is not limited to any single institution.
              </div>
            </div>
          </div>

          <!-- Item 2 -->
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 14px; display: flex; gap: 12px;">
            <div style="width: 32px; height: 32px; border-radius: 8px; background: #fef2f2; color: #dc2626; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            </div>
            <div>
              <div style="font-weight: 700; font-size: 13px; color: #0f172a;">2. Emergency Health Records Access</div>
              <div style="font-size: 11.5px; color: #475569; margin-top: 2px; line-height: 1.45;">
                Trauma desks and emergency physicians can scan a patient's physical HealthCard or enter their 10-digit ID to view blood type, drug allergies, active chronic diagnoses, and emergency contacts within 5 seconds.
              </div>
            </div>
          </div>

          <!-- Item 3 -->
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 14px; display: flex; gap: 12px;">
            <div style="width: 32px; height: 32px; border-radius: 8px; background: #ecfdf5; color: #059669; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            </div>
            <div>
              <div style="font-weight: 700; font-size: 13px; color: #0f172a;">3. Digital OPD & Inpatient Wards</div>
              <div style="font-size: 11.5px; color: #475569; margin-top: 2px; line-height: 1.45;">
                Clinicians write clean digital prescriptions with standard dosage frequency, order laboratory tests, and manage inpatient ward & bed transfers with complete audit accountability.
              </div>
            </div>
          </div>

          <!-- Item 4 -->
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 14px; display: flex; gap: 12px;">
            <div style="width: 32px; height: 32px; border-radius: 8px; background: #fef3c7; color: #b45309; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
            <div>
              <div style="font-weight: 700; font-size: 13px; color: #0f172a;">4. Credentialing & Central Admin Verification</div>
              <div style="font-size: 11.5px; color: #475569; margin-top: 2px; line-height: 1.45;">
                Only hospitals whose state medical council registrations have been verified by the Central Admin Panel receive login credentials. Once issued, administrators can change passwords at will.
              </div>
            </div>
          </div>

        </div>

        <button type="button" class="btn btn-primary" id="btn-explainer-go-signin" style="width: 100%; padding: 11px; font-weight: 700; justify-content: center; gap: 6px;">
          Proceed to Sign In &rarr;
        </button>
      </div>
    `;
  }

  bindEvents() {
    // Tab Switching
    this.container.querySelector('#tab-btn-signin')?.addEventListener('click', () => {
      this.activeTab = 'signin';
      this.render();
    });

    this.container.querySelector('#tab-btn-apply')?.addEventListener('click', () => {
      this.activeTab = 'apply';
      this.render();
    });

    this.container.querySelector('#tab-btn-explainer')?.addEventListener('click', () => {
      this.activeTab = 'explainer';
      this.render();
    });

    this.container.querySelector('#link-expand-explainer')?.addEventListener('click', () => {
      this.activeTab = 'explainer';
      this.render();
    });

    this.container.querySelector('#link-open-explainer-footer')?.addEventListener('click', () => {
      this.activeTab = 'explainer';
      this.render();
    });

    this.container.querySelector('#link-switch-to-apply')?.addEventListener('click', () => {
      this.activeTab = 'apply';
      this.render();
    });

    this.container.querySelector('#btn-explainer-go-signin')?.addEventListener('click', () => {
      this.activeTab = 'signin';
      this.render();
    });

    // Sign In View Events
    if (this.activeTab === 'signin') {
      const form = this.container.querySelector('#hospital-login-form');
      const userInput = this.container.querySelector('#hosp-login-user');
      const passInput = this.container.querySelector('#hosp-login-pass');
      const errorBox = this.container.querySelector('#hosp-login-error');
      const togglePassBtn = this.container.querySelector('#btn-toggle-pass-visibility');

      // Live Dynamic Credential Detection
      const updateLiveDetection = () => {
        const u = (userInput.value || '').trim();
        const detBox = this.container.querySelector('#live-credential-detector');
        const detTitle = this.container.querySelector('#detector-title');
        const detDesc = this.container.querySelector('#detector-desc');
        const detBadge = this.container.querySelector('#detector-badge');

        if (!detBox || !detTitle) return;

        const info = hospitalStore.identifyCredential(u);
        if (info) {
          detBox.style.display = 'flex';
          if (info.type === 'HOSPITAL') {
            detBox.style.background = '#f0f7ff';
            detBox.style.borderColor = '#bfdbfe';
            detTitle.textContent = info.name;
            detDesc.textContent = `${info.typeLabel} • ${info.regNumber}`;
            detBadge.className = 'badge badge-active';
            detBadge.textContent = 'Verified Hospital';
          } else if (info.type === 'DOCTOR') {
            detBox.style.background = '#f0fdf4';
            detBox.style.borderColor = '#bbf7d0';
            detTitle.textContent = info.name;
            detDesc.textContent = `${info.title} (${info.department})`;
            detBadge.className = 'badge badge-blue';
            detBadge.textContent = 'Clinician Desk';
          } else if (info.type === 'APPLICATION') {
            detBox.style.background = '#fffbeb';
            detBox.style.borderColor = '#fde68a';
            detTitle.textContent = info.name;
            detDesc.textContent = `Ref: ${info.refNumber} • ${info.notes}`;
            detBadge.className = 'badge badge-pending';
            detBadge.textContent = info.status;
          }
        } else {
          if (u.length > 3) {
            detBox.style.display = 'flex';
            detBox.style.background = '#fef2f2';
            detBox.style.borderColor = '#fecaca';
            detTitle.textContent = 'Unrecognized Credential';
            detDesc.textContent = 'Hospital not found in registry. Apply online to obtain credentials.';
            detBadge.className = 'badge badge-danger';
            detBadge.textContent = 'Unregistered';
          } else {
            detBox.style.display = 'none';
          }
        }
      };

      userInput?.addEventListener('input', updateLiveDetection);
      // Run once on initial render
      updateLiveDetection();

      // Password toggle
      togglePassBtn?.addEventListener('click', () => {
        if (passInput.type === 'password') {
          passInput.type = 'text';
        } else {
          passInput.type = 'password';
        }
      });

      // Quick switch chips
      this.container.querySelectorAll('.btn-quick-hosp').forEach(btn => {
        btn.addEventListener('click', () => {
          userInput.value = btn.getAttribute('data-user');
          passInput.value = btn.getAttribute('data-pass');
          errorBox.style.display = 'none';
          updateLiveDetection();
          form.requestSubmit();
        });
      });

      // Sign In Submit
      form?.addEventListener('submit', (e) => {
        e.preventDefault();
        const u = userInput.value.trim();
        const p = passInput.value.trim();

        const result = hospitalStore.loginHospital(u, p);

        if (result.success) {
          const hospName = result.hospital ? result.hospital.shortName : result.session.hospitalName || 'Workstation';
          showToast(`Welcome! Authenticated to ${hospName} (${result.session.role})`, 'success');
          if (typeof this.onLoginSuccess === 'function') {
            this.onLoginSuccess(result.session);
          } else {
            window.location.hash = '#dashboard';
          }
        } else {
          errorBox.textContent = result.message || 'Invalid Login ID or Password.';
          errorBox.style.display = 'block';
        }
      });

      // Change Password Modal Trigger
      this.container.querySelector('#btn-open-change-pass-modal')?.addEventListener('click', () => {
        this.openChangePasswordModal(userInput.value.trim());
      });
    }

    // Apply View Events
    if (this.activeTab === 'apply' && !this.pendingAppReceipt) {
      const applyForm = this.container.querySelector('#hospital-apply-form');
      this.container.querySelector('#btn-cancel-apply')?.addEventListener('click', () => {
        this.activeTab = 'signin';
        this.render();
      });

      applyForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const data = {
          hospitalName: this.container.querySelector('#reg-hosp-name').value.trim(),
          shortName: this.container.querySelector('#reg-hosp-shortname').value.trim(),
          regNumber: this.container.querySelector('#reg-hosp-regno').value.trim(),
          type: this.container.querySelector('#reg-hosp-type').value,
          state: this.container.querySelector('#reg-hosp-state').value.trim(),
          city: this.container.querySelector('#reg-hosp-city').value.trim(),
          totalBeds: this.container.querySelector('#reg-hosp-beds').value.trim(),
          adminName: this.container.querySelector('#reg-hosp-adminname').value.trim(),
          email: this.container.querySelector('#reg-hosp-email').value.trim(),
          phone: this.container.querySelector('#reg-hosp-phone').value.trim(),
          accreditation: this.container.querySelector('#reg-hosp-accreditation').value
        };

        const submitted = hospitalStore.submitHospitalApplication(data);
        this.pendingAppReceipt = submitted;
        showToast(`Hospital registration submitted! Ref: ${submitted.refNumber}`, 'success');
        this.render();
      });
    }

    // Receipt Events
    if (this.activeTab === 'apply' && this.pendingAppReceipt) {
      this.container.querySelector('#btn-simulate-admin-approval')?.addEventListener('click', () => {
        const approved = hospitalStore.approveHospitalApplication(this.pendingAppReceipt.id);
        if (approved.success) {
          this.pendingAppReceipt = approved.application;
          showToast(`Application Approved! Credentials dispatched to ${approved.credentials.loginId}`, 'success');
          this.render();
        }
      });

      this.container.querySelector('#btn-receipt-new-app')?.addEventListener('click', () => {
        this.pendingAppReceipt = null;
        this.render();
      });

      this.container.querySelector('#btn-receipt-go-login')?.addEventListener('click', () => {
        const issuedLoginId = this.pendingAppReceipt.issuedLoginId;
        const issuedPassword = this.pendingAppReceipt.issuedPassword;
        this.activeTab = 'signin';
        this.render();

        if (issuedLoginId) {
          const uInput = this.container.querySelector('#hosp-login-user');
          const pInput = this.container.querySelector('#hosp-login-pass');
          if (uInput && pInput) {
            uInput.value = issuedLoginId;
            pInput.value = issuedPassword || '';
            uInput.dispatchEvent(new Event('input'));
          }
        }
      });
    }
  }

  // POPUP MODAL: CHANGE PASSWORD / RESET PIN
  openChangePasswordModal(prefillUsername = '') {
    const modalSlot = this.container.querySelector('#auth-modal-slot');
    if (!modalSlot) return;

    modalSlot.innerHTML = `
      <div class="modal-overlay" style="display: flex;">
        <div class="modal-dialog" style="max-width: 440px;">
          <div class="modal-header">
            <div>
              <h3 style="font-size: 16px; font-weight: 700; color: #0f172a; margin: 0;">Change Password / Access PIN</h3>
              <p style="font-size: 11.5px; color: #64748b; margin: 2px 0 0 0;">Update institutional admin password or clinician PIN</p>
            </div>
            <button type="button" class="btn btn-sm btn-ghost modal-close" id="btn-close-pwd-modal" title="Close">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          <form id="form-change-password">
            <div class="modal-body" style="padding: 20px;">
              <div class="form-group" style="margin-bottom: 14px;">
                <label class="form-label" style="font-weight: 700; font-size: 12px;">Login ID / Username *</label>
                <input type="text" id="cp-user" class="form-input" value="${prefillUsername}" placeholder="e.g. admin@apollo.health" required style="font-size: 13px;" />
              </div>

              <div class="form-group" style="margin-bottom: 14px;">
                <label class="form-label" style="font-weight: 700; font-size: 12px;">Current / Temporary Password *</label>
                <input type="password" id="cp-old-pass" class="form-input" placeholder="Current or admin-issued password" required style="font-size: 13px;" />
              </div>

              <div class="form-group" style="margin-bottom: 14px;">
                <label class="form-label" style="font-weight: 700; font-size: 12px;">New Security Password / PIN *</label>
                <input type="password" id="cp-new-pass" class="form-input" placeholder="At least 4 characters" required minlength="4" style="font-size: 13px;" />
              </div>

              <div class="form-group" style="margin-bottom: 16px;">
                <label class="form-label" style="font-weight: 700; font-size: 12px;">Confirm New Password *</label>
                <input type="password" id="cp-confirm-pass" class="form-input" placeholder="Re-enter new password" required minlength="4" style="font-size: 13px;" />
              </div>

              <div id="cp-error-box" style="display: none; padding: 8px 12px; border-radius: 6px; background: #fee2e2; border: 1px solid #fca5a5; color: #991b1b; font-size: 12px; margin-bottom: 14px;"></div>
            </div>

            <div class="modal-footer" style="padding: 12px 20px; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 8px;">
              <button type="button" class="btn btn-secondary modal-close" id="btn-cancel-pwd">Cancel</button>
              <button type="submit" class="btn btn-primary" style="font-weight: 700;">Update Password</button>
            </div>
          </form>
        </div>
      </div>
    `;

    const overlay = modalSlot.querySelector('.modal-overlay');
    const closeBtns = modalSlot.querySelectorAll('.modal-close');
    closeBtns.forEach(b => b.addEventListener('click', () => { modalSlot.innerHTML = ''; }));

    const form = modalSlot.querySelector('#form-change-password');
    const errBox = modalSlot.querySelector('#cp-error-box');

    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const u = modalSlot.querySelector('#cp-user').value.trim();
      const oldP = modalSlot.querySelector('#cp-old-pass').value.trim();
      const newP = modalSlot.querySelector('#cp-new-pass').value.trim();
      const confirmP = modalSlot.querySelector('#cp-confirm-pass').value.trim();

      if (newP !== confirmP) {
        errBox.textContent = 'New password and confirmation do not match.';
        errBox.style.display = 'block';
        return;
      }

      const res = hospitalStore.changeHospitalPassword(u, oldP, newP);
      if (res.success) {
        modalSlot.innerHTML = '';
        showToast(res.message || 'Password changed successfully! You can now sign in.', 'success');
        const loginUserInput = this.container.querySelector('#hosp-login-user');
        const loginPassInput = this.container.querySelector('#hosp-login-pass');
        if (loginUserInput && loginPassInput) {
          loginUserInput.value = u;
          loginPassInput.value = newP;
        }
      } else {
        errBox.textContent = res.message || 'Failed to update password.';
        errBox.style.display = 'block';
      }
    });
  }
}
