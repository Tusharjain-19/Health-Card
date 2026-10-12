/**
 * HealthCard Hospital Portal: Institutional Healthcare Gateway & Auth View
 * Sleek Left-Right layout with punchy taglines, minimal text, Indian Govt multi-document licensing,
 * custom branding logo uploads, zero emojis, and sharp SVG vector icons throughout.
 */

import { hospitalStore } from '../../shared/storage.js';
import { showToast } from '../../shared/components/toast.js';

export class HospitalAuthView {
  constructor(container, onLoginSuccess) {
    this.container = container;
    this.onLoginSuccess = onLoginSuccess;
    this.activeTab = 'signin'; // 'signin' | 'apply'
    this.pendingAppReceipt = null;
    this.editMode = false;

    // Working state for apply form
    this.attachedDocs = [
      { id: 'doc_cea', name: 'Clinical_Establishment_Form_C.pdf', type: 'Clinical Establishment Act License', size: '1.4 MB' },
      { id: 'doc_bmw', name: 'Biomedical_Waste_Pollution_NOC.pdf', type: 'Pollution Control Board (BMW)', size: '820 KB' }
    ];
    this.hospitalLogoUrl = 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=120&auto=format&fit=crop&q=80';
  }

  render() {
    this.container.innerHTML = `
      <div class="auth-gateway-container" style="min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 32px 20px; background: #f8fafc;">
        
        <div style="max-width: 1060px; width: 100%; display: grid; grid-template-columns: 1fr 1.15fr; gap: 36px; align-items: center;">
          
          <!-- LEFT COLUMN: BRANDING, LOGO & PUNCHY TAGLINES -->
          <div class="auth-left-banner" style="padding: 12px 16px;">
            <!-- Official HealthCard Emblem -->
            <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 22px;">
              <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%); border-radius: 13px; display: flex; align-items: center; justify-content: center; color: #ffffff; box-shadow: 0 8px 18px -4px rgba(29, 78, 216, 0.4);">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <path d="M16 2.5L27 6.8V15.5C27 22.8 22.3 28.1 16 30C9.7 28.1 5 22.8 5 15.5V6.8L16 2.5Z" fill="#1d4ed8"/>
                  <path d="M16 4.3L25.2 7.9V15.5C25.2 21.6 21.2 26.2 16 28C10.8 26.2 6.8 21.6 6.8 15.5V7.9L16 4.3Z" stroke="#93c5fd" stroke-width="0.9" stroke-opacity="0.7"/>
                  <path d="M16 9V23M9 16H23" stroke="#ffffff" stroke-width="2.6" stroke-linecap="round"/>
                  <path d="M7 16H11.5L13.5 12.5L16 20.5L18.5 13.5L20.5 16H25" stroke="#a7f3d0" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                  <circle cx="16" cy="16" r="2.2" fill="#10b981"/>
                  <circle cx="16" cy="16" r="1.1" fill="#ffffff"/>
                </svg>
              </div>
              <div>
                <div style="font-size: 20px; font-weight: 800; color: #0f172a; line-height: 1.1; letter-spacing: -0.3px;">HealthCard</div>
                <div style="font-size: 11.5px; font-weight: 700; color: #1d4ed8; text-transform: uppercase; letter-spacing: 0.05em;">Institutional Hospital Gateway</div>
              </div>
            </div>

            <!-- Big Punchy Taglines (1-2 Lines Max) -->
            <h1 style="font-size: 32px; font-weight: 800; color: #0f172a; line-height: 1.15; margin: 0 0 10px 0; letter-spacing: -0.5px;">
              Instant Care.<br /><span style="color: #1d4ed8;">Zero Paperwork.</span>
            </h1>
            <p style="font-size: 14px; color: #475569; margin: 0 0 24px 0; line-height: 1.45; font-weight: 500;">
              The digital clinical operating system for India's hospitals, trauma centers & doctors.
            </p>

            <!-- 1-Liner Feature Tiles (Pure SVG, Zero Emojis) -->
            <div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: 24px;">
              <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 11px 14px; display: flex; align-items: center; gap: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
                <div style="width: 32px; height: 32px; border-radius: 8px; background: #eff6ff; color: #2563eb; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                  </svg>
                </div>
                <div style="font-size: 12.5px; color: #1e293b; line-height: 1.35;">
                  <strong>5-Sec Emergency Scan:</strong> Instant allergy, blood group & trauma alerts.
                </div>
              </div>

              <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 11px 14px; display: flex; align-items: center; gap: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
                <div style="width: 32px; height: 32px; border-radius: 8px; background: #ecfdf5; color: #059669; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                    <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                    <path d="M9 14l2 2 4-4"/>
                  </svg>
                </div>
                <div style="font-size: 12.5px; color: #1e293b; line-height: 1.35;">
                  <strong>1-Click Digital OPD:</strong> Write prescriptions, order labs & dispense.
                </div>
              </div>

              <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 11px 14px; display: flex; align-items: center; gap: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
                <div style="width: 32px; height: 32px; border-radius: 8px; background: #fef3c7; color: #d97706; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                    <polyline points="9 12 11 14 15 10"/>
                  </svg>
                </div>
                <div style="font-size: 12.5px; color: #1e293b; line-height: 1.35;">
                  <strong>ABDM & NDHM Certified:</strong> 100% consent-driven, 256-bit encrypted vaults.
                </div>
              </div>

              <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 11px 14px; display: flex; align-items: center; gap: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.02);">
                <div style="width: 32px; height: 32px; border-radius: 8px; background: #fdf2f8; color: #be185d; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                    <path d="M3 21h18M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/>
                    <path d="M12 7v8M8 11h8"/>
                  </svg>
                </div>
                <div style="font-size: 12.5px; color: #1e293b; line-height: 1.35;">
                  <strong>10,000+ Empanelled Network:</strong> AIIMS, Apollo, Fortis, Max & more.
                </div>
              </div>
            </div>

            <!-- Live Status Ticker -->
            <div style="display: inline-flex; align-items: center; gap: 8px; background: #f1f5f9; border: 1px solid #e2e8f0; padding: 5px 12px; border-radius: 20px; font-size: 11.5px; color: #475569; font-weight: 600;">
              <span style="width: 8px; height: 8px; border-radius: 50%; background: #10b981; display: inline-block;"></span>
              <span>National Health Grid Online • 14,200+ Beds Connected • 99.98% Uptime</span>
            </div>
          </div>

          <!-- RIGHT COLUMN: SNAPPY ACTION CARD -->
          <div class="auth-right-card" style="background: #ffffff; border: 1px solid #cbd5e1; border-radius: 16px; box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.08); overflow: hidden;">
            
            <!-- Tab Switcher -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; background: #f1f5f9; border-bottom: 1px solid #e2e8f0; padding: 4px;">
              <button type="button" class="tab-btn" id="btn-tab-signin" style="padding: 10px; border: none; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.15s ease; background: ${this.activeTab === 'signin' ? '#ffffff' : 'transparent'}; color: ${this.activeTab === 'signin' ? '#1d4ed8' : '#64748b'}; box-shadow: ${this.activeTab === 'signin' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'};">
                Institutional Sign In
              </button>
              <button type="button" class="tab-btn" id="btn-tab-apply" style="padding: 10px; border: none; border-radius: 8px; font-size: 13px; font-weight: 700; cursor: pointer; transition: all 0.15s ease; background: ${this.activeTab === 'apply' ? '#ffffff' : 'transparent'}; color: ${this.activeTab === 'apply' ? '#1d4ed8' : '#64748b'}; box-shadow: ${this.activeTab === 'apply' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none'};">
                Apply for Credentials
              </button>
            </div>

            <div style="padding: 22px 24px;">
              ${this.activeTab === 'signin' ? this.renderSignInSection() : this.renderApplySection()}
            </div>

            <!-- Footer Bar -->
            <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 10px 24px; display: flex; align-items: center; justify-content: space-between; font-size: 11px; color: #64748b;">
              <span>National HealthCard Rails • AES-256 TLS</span>
              <span style="font-weight: 600; color: #1d4ed8;">Helpline: 1800-890-4325</span>
            </div>
          </div>

        </div>

      </div>

      <!-- Modal Slot for Change Password & Edit Dialogs -->
      <div id="auth-modal-slot"></div>
    `;

    this.bindEvents();
  }

  // RENDER TAB 1: SIGN IN
  renderSignInSection() {
    const defaultHosp = hospitalStore.getRegisteredHospitals()[0] || {};

    return `
      <div>
        <!-- 1-Line Info Banner -->
        <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 8px 12px; margin-bottom: 16px; font-size: 12px; color: #1e3a8a; display: flex; align-items: center; gap: 8px;">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" stroke-width="2.5" style="flex-shrink: 0;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          <span><strong>What is this?</strong> Portal for hospitals & doctors to verify patient HealthCards & EHRs.</span>
        </div>

        <form id="hosp-login-form">
          <!-- Login ID -->
          <div class="form-group" style="margin-bottom: 12px;">
            <label class="form-label" style="font-weight: 700; font-size: 12px; margin-bottom: 4px;">Hospital Login ID / Doctor Username</label>
            <input 
              type="text" 
              id="hosp-login-user" 
              class="form-input" 
              placeholder="e.g. admin@apollo.health or doc.vikram" 
              value="${defaultHosp.adminLoginId || 'admin@aiims.gov.in'}" 
              required 
              style="font-size: 13.5px; padding: 9px 12px; width: 100%;" 
            />
          </div>

          <!-- Dynamic 1-Line Credential Detector -->
          <div id="live-credential-detector" style="margin-bottom: 12px; border-radius: 6px; padding: 7px 10px; font-size: 11.5px; border: 1px solid #bfdbfe; background: #f0f7ff; display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 8px; overflow: hidden;">
              <span style="font-weight: 700; color: #1e3a8a;" id="detector-title">AIIMS New Delhi</span>
              <span style="color: #64748b;" id="detector-desc">• Apex Govt Hospital</span>
            </div>
            <span id="detector-badge" class="badge badge-active" style="font-size: 9.5px; padding: 2px 6px;">Verified</span>
          </div>

          <!-- Password / PIN -->
          <div class="form-group" style="margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
              <label class="form-label" style="font-weight: 700; font-size: 12px; margin-bottom: 0;">Password / Access PIN</label>
              <button type="button" id="btn-open-change-pass" style="border: none; background: none; color: #1d4ed8; font-size: 11.5px; font-weight: 600; cursor: pointer; padding: 0; text-decoration: underline;">
                Change Password / PIN?
              </button>
            </div>
            <div style="position: relative;">
              <input 
                type="password" 
                id="hosp-login-pass" 
                class="form-input" 
                placeholder="Enter password or doctor PIN" 
                value="${defaultHosp.adminPassword || 'admin123'}" 
                required 
                style="font-size: 13.5px; padding: 9px 12px; padding-right: 36px; width: 100%;" 
              />
              <button type="button" id="btn-toggle-pass" style="position: absolute; right: 8px; top: 50%; transform: translateY(-50%); border: none; background: none; color: #64748b; cursor: pointer; padding: 4px;" title="Toggle Password">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
            </div>
          </div>

          <div id="hosp-login-error" style="display: none; padding: 8px 12px; border-radius: 6px; background: #fee2e2; border: 1px solid #fca5a5; color: #991b1b; font-size: 11.5px; margin-bottom: 12px;"></div>

          <button type="submit" class="btn btn-primary" style="width: 100%; padding: 10px; font-weight: 700; font-size: 13.5px; justify-content: center; gap: 8px;">
            Sign In to Hospital Portal &rarr;
          </button>
        </form>

        <!-- 1-Click Multi-Hospital Badges (Pure SVG Icons, Zero Emojis) -->
        <div style="margin-top: 16px; padding-top: 14px; border-top: 1px solid #e2e8f0;">
          <div style="font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 8px;">
            1-Click Empanelled Hospital Switcher:
          </div>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            <button type="button" class="btn btn-sm btn-outline btn-quick-chip" data-user="admin@aiims.gov.in" data-pass="admin123" style="font-size: 11px; padding: 4px 8px; background: #ffffff; display: inline-flex; align-items: center; gap: 5px;">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" stroke-width="2.2"><path d="M3 21h18M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/><path d="M12 7v8M8 11h8"/></svg>
              <span>AIIMS Delhi</span>
            </button>
            <button type="button" class="btn btn-sm btn-outline btn-quick-chip" data-user="admin@apollo.health" data-pass="apollo123" style="font-size: 11px; padding: 4px 8px; background: #ffffff; display: inline-flex; align-items: center; gap: 5px;">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
              <span>Apollo</span>
            </button>
            <button type="button" class="btn btn-sm btn-outline btn-quick-chip" data-user="admin@fortis.in" data-pass="fortis123" style="font-size: 11px; padding: 4px 8px; background: #ffffff; display: inline-flex; align-items: center; gap: 5px;">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2.2"><path d="M19.5 12.572l-7.5 7.428l-7.5 -7.428a5 5 0 1 1 7.5 -6.566a5 5 0 1 1 7.5 6.572"/></svg>
              <span>Fortis</span>
            </button>
            <button type="button" class="btn btn-sm btn-outline btn-quick-chip" data-user="admin@maxhealthcare.in" data-pass="maxpass" style="font-size: 11px; padding: 4px 8px; background: #ffffff; display: inline-flex; align-items: center; gap: 5px;">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#b45309" stroke-width="2.2"><path d="M12 2v20M2 12h20"/></svg>
              <span>Max Health</span>
            </button>
            <button type="button" class="btn btn-sm btn-outline btn-quick-chip" data-user="doc.vikram" data-pass="1982" style="font-size: 11px; padding: 4px 8px; background: #ffffff; display: inline-flex; align-items: center; gap: 5px;">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" stroke-width="2.2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/></svg>
              <span>Dr. Vikram</span>
            </button>
          </div>
        </div>

        <div style="text-align: center; margin-top: 14px; font-size: 11.5px; color: #64748b;">
          Not empanelled yet? 
          <a href="javascript:void(0)" id="link-go-apply" style="color: #1d4ed8; font-weight: 700; text-decoration: underline; margin-left: 3px;">
            Apply for credentials in 2 minutes &rarr;
          </a>
        </div>
      </div>
    `;
  }

  // RENDER TAB 2: APPLY FOR CREDENTIALS
  renderApplySection() {
    if (this.pendingAppReceipt) {
      return this.renderApplicationReceipt(this.pendingAppReceipt);
    }

    return `
      <div>
        <div style="margin-bottom: 14px; display: flex; justify-content: space-between; align-items: flex-start;">
          <div>
            <h2 style="font-size: 15px; font-weight: 800; color: #0f172a; margin: 0 0 2px 0;">Hospital Empanelment Application</h2>
            <p style="font-size: 11.5px; color: #64748b; margin: 0;">Submit hospital registration, licenses & branding for Central Admin credential issuance</p>
          </div>
          <span class="badge badge-active" style="font-size: 10px;">Form C Compliant</span>
        </div>

        <form id="hosp-apply-form">
          <!-- Step 1: Hospital Details -->
          <div style="display: grid; grid-template-columns: 1.3fr 1fr; gap: 10px; margin-bottom: 10px;">
            <div class="form-group">
              <label class="form-label" style="font-weight: 700; font-size: 11px;">Hospital Legal Name *</label>
              <input type="text" id="app-hosp-name" class="form-input" placeholder="e.g. Manipal Hospital Dwarka" required style="font-size: 12px; padding: 7px 10px;" />
            </div>
            <div class="form-group">
              <label class="form-label" style="font-weight: 700; font-size: 11px;">State Reg / License No *</label>
              <input type="text" id="app-hosp-regno" class="form-input" placeholder="e.g. HOSP-DL-09941" required style="font-size: 12px; padding: 7px 10px;" />
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 10px;">
            <div class="form-group">
              <label class="form-label" style="font-weight: 700; font-size: 11px;">Facility Category *</label>
              <select id="app-hosp-type" class="form-input" style="font-size: 12px; padding: 7px 10px;">
                <option value="Private Multispecialty">Private Multispecialty</option>
                <option value="Government Apex Institute">Govt Apex Institute</option>
                <option value="Super-Specialty Hospital">Super-Specialty</option>
                <option value="Civil / District Hospital">Civil Hospital</option>
                <option value="Diagnostic Center">Diagnostic Center</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" style="font-weight: 700; font-size: 11px;">City *</label>
              <input type="text" id="app-hosp-city" class="form-input" value="New Delhi" required style="font-size: 12px; padding: 7px 10px;" />
            </div>
            <div class="form-group">
              <label class="form-label" style="font-weight: 700; font-size: 11px;">Total Beds *</label>
              <input type="number" id="app-hosp-beds" class="form-input" value="300" required style="font-size: 12px; padding: 7px 10px;" />
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">
            <div class="form-group">
              <label class="form-label" style="font-weight: 700; font-size: 11px;">Nodal Officer / Medical Director *</label>
              <input type="text" id="app-hosp-admin" class="form-input" placeholder="e.g. Dr. Sunita Rao" required style="font-size: 12px; padding: 7px 10px;" />
            </div>
            <div class="form-group">
              <label class="form-label" style="font-weight: 700; font-size: 11px;">Official Email (Credentials dispatched here) *</label>
              <input type="email" id="app-hosp-email" class="form-input" placeholder="e.g. admin@manipal.org" required style="font-size: 12px; padding: 7px 10px;" />
            </div>
          </div>

          <!-- Step 2: MANDATORY INDIAN GOVT REGULATORY DOCUMENT UPLOADS -->
          <div style="background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 10px 12px; margin-bottom: 12px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
              <span style="font-size: 11.5px; font-weight: 700; color: #0f172a; display: flex; align-items: center; gap: 6px;">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" stroke-width="2.2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                Mandatory Indian Govt Licenses & Regulatory Docs:
              </span>
              <span style="font-size: 10px; color: #1d4ed8; font-weight: 700;">${this.attachedDocs.length} Attached</span>
            </div>

            <!-- Attached Doc Chips with Pure SVG Check & Remove Icons -->
            <div id="attached-docs-list" style="display: flex; flex-direction: column; gap: 5px; margin-bottom: 8px;">
              ${this.attachedDocs.map((doc, idx) => `
                <div style="display: flex; justify-content: space-between; align-items: center; background: #ffffff; border: 1px solid #e2e8f0; padding: 5px 8px; border-radius: 6px; font-size: 11px;">
                  <div style="display: flex; align-items: center; gap: 6px; overflow: hidden;">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.6"><polyline points="20 6 9 17 4 12"/></svg>
                    <strong style="color: #1e293b;">${doc.type}:</strong>
                    <span style="color: #64748b; font-family: monospace;">${doc.name} (${doc.size})</span>
                  </div>
                  <button type="button" class="btn-remove-doc" data-idx="${idx}" style="border: none; background: none; color: #dc2626; cursor: pointer; padding: 2px 4px; display: flex; align-items: center;" title="Remove Document">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              `).join('')}
            </div>

            <!-- Document Upload Trigger Buttons -->
            <div style="display: flex; gap: 6px; flex-wrap: wrap; align-items: center;">
              <input type="file" id="input-license-file" accept=".pdf,.png,.jpg,.jpeg" style="display: none;" />
              <button type="button" class="btn btn-sm btn-outline" id="btn-browse-doc" style="font-size: 10.5px; padding: 4px 8px; display: inline-flex; align-items: center; gap: 4px;">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                <span>Upload PDF / Image</span>
              </button>
              <button type="button" class="btn btn-sm btn-outline btn-add-preset-doc" data-type="NABH Accreditation Certificate" data-name="NABH_National_Accreditation_Cert.pdf" style="font-size: 10.5px; padding: 4px 8px; display: inline-flex; align-items: center; gap: 4px;">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                <span>Add NABH Cert</span>
              </button>
              <button type="button" class="btn btn-sm btn-outline btn-add-preset-doc" data-type="Fire Safety NOC" data-name="State_Fire_Safety_NOC_2026.pdf" style="font-size: 10.5px; padding: 4px 8px; display: inline-flex; align-items: center; gap: 4px;">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
                <span>Add Fire NOC</span>
              </button>
            </div>
          </div>

          <!-- Step 3: HOSPITAL BRANDING & LOGO UPLOAD -->
          <div style="background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 8px; padding: 10px 12px; margin-bottom: 14px;">
            <div style="font-size: 11.5px; font-weight: 700; color: #0f172a; margin-bottom: 6px; display: flex; align-items: center; justify-content: space-between;">
              <span>Hospital Logo & Visual Branding (Appears in Portal Header):</span>
              <span style="font-size: 10px; color: #059669; font-weight: 600;">Live Preview Enabled</span>
            </div>

            <div style="display: flex; align-items: center; gap: 12px;">
              <!-- Logo Preview -->
              <div style="width: 44px; height: 44px; border-radius: 8px; border: 1.5px solid #cbd5e1; background: #ffffff; display: flex; align-items: center; justify-content: center; overflow: hidden; flex-shrink: 0;">
                <img id="preview-hosp-logo" src="${this.hospitalLogoUrl}" style="width: 100%; height: 100%; object-fit: cover;" alt="Logo" />
              </div>

              <div style="flex: 1;">
                <div style="display: flex; gap: 6px; margin-bottom: 4px;">
                  <input type="file" id="input-logo-file" accept="image/*" style="display: none;" />
                  <button type="button" class="btn btn-sm btn-outline" id="btn-browse-logo" style="font-size: 10.5px; padding: 4px 8px; display: inline-flex; align-items: center; gap: 4px;">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    <span>Upload Custom Logo</span>
                  </button>
                  <button type="button" class="btn btn-sm btn-outline btn-preset-logo" data-url="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=120&auto=format&fit=crop&q=80" style="font-size: 10.5px; padding: 4px 8px;">
                    Preset 1
                  </button>
                  <button type="button" class="btn btn-sm btn-outline btn-preset-logo" data-url="https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=120&auto=format&fit=crop&q=80" style="font-size: 10.5px; padding: 4px 8px;">
                    Preset 2
                  </button>
                </div>
                <div style="font-size: 10px; color: #64748b;">This logo will be displayed on your hospital workstation navbar & prescriptions.</div>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div style="display: flex; gap: 8px;">
            <button type="button" class="btn btn-secondary" id="btn-cancel-apply" style="flex: 1; padding: 8px; font-size: 12px;">
              Back to Sign In
            </button>
            <button type="submit" class="btn btn-primary" style="flex: 2; padding: 8px; font-weight: 700; font-size: 13px;">
              Submit for Central Admin Review &rarr;
            </button>
          </div>
        </form>
      </div>
    `;
  }

  // RENDER APPLICATION RECEIPT WITH EDIT & PREVIEW
  renderApplicationReceipt(app) {
    return `
      <div>
        <div style="text-align: center; margin-bottom: 12px;">
          <div style="width: 42px; height: 42px; background: #ecfdf5; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; color: #059669; margin-bottom: 6px;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
          </div>
          <h2 style="font-size: 16px; font-weight: 800; color: #0f172a; margin: 0 0 2px 0;">Hospital Application Registered!</h2>
          <div style="font-size: 11.5px; color: #64748b;">Tracking Reference: <strong class="font-mono" style="color: #1d4ed8;">${app.refNumber}</strong></div>
        </div>

        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 14px; margin-bottom: 14px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              ${app.logoUrl ? `<img src="${app.logoUrl}" style="width: 28px; height: 28px; border-radius: 6px; object-fit: cover;" />` : ''}
              <div>
                <strong style="font-size: 13px; color: #0f172a;">${app.hospitalName}</strong>
                <div style="font-size: 10.5px; color: #64748b;">${app.regNumber} • ${app.city}, ${app.state}</div>
              </div>
            </div>
            <button type="button" class="btn btn-sm btn-outline" id="btn-edit-receipt" style="font-size: 11px; padding: 3px 8px; display: inline-flex; align-items: center; gap: 4px;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
              <span>Edit Details</span>
            </button>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; font-size: 11.5px; margin-bottom: 6px;">
            <div><span style="color: #64748b;">Nodal Officer:</span> <strong>${app.adminName}</strong></div>
            <div><span style="color: #64748b;">Dispatch Email:</span> <strong style="color: #1d4ed8;">${app.email}</strong></div>
            <div><span style="color: #64748b;">Bed Count:</span> <strong>${app.totalBeds || 100} Beds</strong></div>
            <div><span style="color: #64748b;">Attached Licenses:</span> <strong>${(app.documents || []).length || this.attachedDocs.length} Docs</strong></div>
          </div>

          <div style="border-top: 1px solid #e2e8f0; padding-top: 6px; display: flex; align-items: center; justify-content: space-between;">
            <span style="font-size: 11px; color: #64748b;">Status:</span>
            <span class="badge ${app.status === 'APPROVED' ? 'badge-active' : 'badge-blue'}" style="font-size: 10.5px; font-weight: 700;">
              ${app.status === 'APPROVED' ? 'APPROVED & CREDENTIALS ACTIVE' : 'PENDING CENTRAL ADMIN REVIEW'}
            </span>
          </div>
        </div>

        ${app.status === 'APPROVED' ? `
          <div style="background: #ecfdf5; border: 1.5px solid #a7f3d0; border-radius: 8px; padding: 10px 12px; margin-bottom: 14px;">
            <div style="font-size: 11.5px; font-weight: 700; color: #065f46; margin-bottom: 4px;">
              Official Credentials Issued by Central Admin:
            </div>
            <div style="display: flex; gap: 12px; font-size: 12px; font-family: monospace; background: #ffffff; padding: 6px 10px; border-radius: 6px; border: 1px solid #d1fae5;">
              <div>Login ID: <strong>${app.issuedLoginId}</strong></div>
              <div>Password: <strong>${app.issuedPassword}</strong></div>
            </div>
          </div>
        ` : `
          <!-- Simulation Shortcut for Admin Review Testing -->
          <div style="background: #eff6ff; border: 1px dashed #93c5fd; border-radius: 8px; padding: 10px 12px; margin-bottom: 14px; display: flex; align-items: center; justify-content: space-between;">
            <div style="font-size: 11px; color: #1e3a8a;">
              <strong>Testing credential flow?</strong> Trigger instant Central Admin approval:
            </div>
            <button type="button" class="btn btn-sm btn-primary" id="btn-simulate-admin-approval" style="font-size: 11px; padding: 4px 10px; white-space: nowrap;">
              Fast-Track Approval
            </button>
          </div>
        `}

        <div style="display: flex; gap: 8px;">
          <button type="button" class="btn btn-outline" id="btn-receipt-new-app" style="flex: 1; padding: 8px; font-size: 11.5px;">
            New Registration
          </button>
          <button type="button" class="btn btn-primary" id="btn-receipt-go-login" style="flex: 2; padding: 8px; font-weight: 700; font-size: 12.5px;">
            ${app.status === 'APPROVED' ? 'Sign In With Issued Credentials &rarr;' : 'Go to Sign In Terminal'}
          </button>
        </div>
      </div>
    `;
  }

  bindEvents() {
    // Tab switching
    this.container.querySelector('#btn-tab-signin')?.addEventListener('click', () => {
      this.activeTab = 'signin';
      this.render();
    });

    this.container.querySelector('#btn-tab-apply')?.addEventListener('click', () => {
      this.activeTab = 'apply';
      this.render();
    });

    this.container.querySelector('#link-go-apply')?.addEventListener('click', () => {
      this.activeTab = 'apply';
      this.render();
    });

    // SIGN IN EVENTS
    if (this.activeTab === 'signin') {
      const form = this.container.querySelector('#hosp-login-form');
      const userInput = this.container.querySelector('#hosp-login-user');
      const passInput = this.container.querySelector('#hosp-login-pass');
      const errorBox = this.container.querySelector('#hosp-login-error');
      const togglePass = this.container.querySelector('#btn-toggle-pass');

      // Live 1-Line Credential Detector
      const updateDetector = () => {
        const u = (userInput.value || '').trim();
        const detBox = this.container.querySelector('#live-credential-detector');
        const detTitle = this.container.querySelector('#detector-title');
        const detDesc = this.container.querySelector('#detector-desc');
        const detBadge = this.container.querySelector('#detector-badge');

        if (!detBox || !detTitle) return;

        const info = hospitalStore.identifyCredential(u);
        if (info) {
          detBox.style.display = 'flex';
          detBox.style.background = '#f0f7ff';
          detBox.style.borderColor = '#bfdbfe';
          detTitle.textContent = info.shortName || info.name;
          detDesc.textContent = `• ${info.typeLabel || info.regNumber || 'Verified'}`;
          detBadge.className = 'badge badge-active';
          detBadge.textContent = 'Verified';
        } else {
          if (u.length > 3) {
            detBox.style.display = 'flex';
            detBox.style.background = '#fef2f2';
            detBox.style.borderColor = '#fecaca';
            detTitle.textContent = 'Unregistered ID';
            detDesc.textContent = '• Apply for credentials';
            detBadge.className = 'badge badge-danger';
            detBadge.textContent = 'New';
          } else {
            detBox.style.display = 'none';
          }
        }
      };

      userInput?.addEventListener('input', updateDetector);
      updateDetector();

      // Toggle pass
      togglePass?.addEventListener('click', () => {
        passInput.type = passInput.type === 'password' ? 'text' : 'password';
      });

      // Quick Chips
      this.container.querySelectorAll('.btn-quick-chip').forEach(btn => {
        btn.addEventListener('click', () => {
          userInput.value = btn.dataset.user;
          passInput.value = btn.dataset.pass;
          errorBox.style.display = 'none';
          updateDetector();
          form.requestSubmit();
        });
      });

      // Submit
      form?.addEventListener('submit', (e) => {
        e.preventDefault();
        const u = userInput.value.trim();
        const p = passInput.value.trim();

        const result = hospitalStore.loginHospital(u, p);
        if (result.success) {
          showToast(`Welcome! Authenticated to ${result.hospital?.shortName || result.session.hospitalName || 'Workstation'}`, 'success');
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

      // Change Password Dialog
      this.container.querySelector('#btn-open-change-pass')?.addEventListener('click', () => {
        this.openChangePasswordModal(userInput.value.trim());
      });
    }

    // APPLY EVENTS
    if (this.activeTab === 'apply' && !this.pendingAppReceipt) {
      const applyForm = this.container.querySelector('#hosp-apply-form');
      this.container.querySelector('#btn-cancel-apply')?.addEventListener('click', () => {
        this.activeTab = 'signin';
        this.render();
      });

      // Doc upload simulation
      const fileInput = this.container.querySelector('#input-license-file');
      this.container.querySelector('#btn-browse-doc')?.addEventListener('click', () => fileInput.click());
      fileInput?.addEventListener('change', (e) => {
        const file = e.target.files?.[0];
        if (file) {
          this.attachedDocs.push({
            id: `doc_${Date.now()}`,
            name: file.name,
            type: 'State Clinical Document',
            size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`
          });
          showToast(`Document ${file.name} attached!`, 'success');
          this.render();
        }
      });

      // Preset doc buttons
      this.container.querySelectorAll('.btn-add-preset-doc').forEach(btn => {
        btn.addEventListener('click', () => {
          this.attachedDocs.push({
            id: `doc_${Date.now()}`,
            name: btn.dataset.name,
            type: btn.dataset.type,
            size: '1.2 MB'
          });
          showToast(`Attached ${btn.dataset.type}!`, 'success');
          this.render();
        });
      });

      // Remove doc
      this.container.querySelectorAll('.btn-remove-doc').forEach(btn => {
        btn.addEventListener('click', () => {
          const idx = parseInt(btn.dataset.idx, 10);
          this.attachedDocs.splice(idx, 1);
          this.render();
        });
      });

      // Logo upload
      const logoFileInput = this.container.querySelector('#input-logo-file');
      this.container.querySelector('#btn-browse-logo')?.addEventListener('click', () => logoFileInput.click());
      logoFileInput?.addEventListener('change', (e) => {
        const file = e.target.files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (evt) => {
            this.hospitalLogoUrl = evt.target.result;
            showToast('Hospital custom logo loaded!', 'success');
            this.render();
          };
          reader.readAsDataURL(file);
        }
      });

      this.container.querySelectorAll('.btn-preset-logo').forEach(btn => {
        btn.addEventListener('click', () => {
          this.hospitalLogoUrl = btn.dataset.url;
          showToast('Preset logo selected!', 'info');
          this.render();
        });
      });

      // Form submit
      applyForm?.addEventListener('submit', (e) => {
        e.preventDefault();
        const data = {
          hospitalName: this.container.querySelector('#app-hosp-name').value.trim(),
          shortName: this.container.querySelector('#app-hosp-name').value.trim(),
          regNumber: this.container.querySelector('#app-hosp-regno').value.trim(),
          type: this.container.querySelector('#app-hosp-type').value,
          city: this.container.querySelector('#app-hosp-city').value.trim(),
          state: 'Delhi',
          totalBeds: this.container.querySelector('#app-hosp-beds').value.trim(),
          adminName: this.container.querySelector('#app-hosp-admin').value.trim(),
          email: this.container.querySelector('#app-hosp-email').value.trim(),
          phone: '+91 11 4987 6543',
          logoUrl: this.hospitalLogoUrl,
          documents: this.attachedDocs
        };

        const submitted = hospitalStore.submitHospitalApplication(data);
        this.pendingAppReceipt = submitted;
        showToast(`Application ${submitted.refNumber} submitted!`, 'success');
        this.render();
      });
    }

    // RECEIPT EVENTS
    if (this.activeTab === 'apply' && this.pendingAppReceipt) {
      // Simulate admin approval
      this.container.querySelector('#btn-simulate-admin-approval')?.addEventListener('click', () => {
        const approved = hospitalStore.approveHospitalApplication(this.pendingAppReceipt.id);
        if (approved.success) {
          this.pendingAppReceipt = approved.application;
          showToast(`Application Approved! Credentials dispatched to ${approved.credentials.loginId}`, 'success');
          this.render();
        }
      });

      // Edit details button
      this.container.querySelector('#btn-edit-receipt')?.addEventListener('click', () => {
        this.openEditApplicationModal(this.pendingAppReceipt);
      });

      // New registration
      this.container.querySelector('#btn-receipt-new-app')?.addEventListener('click', () => {
        this.pendingAppReceipt = null;
        this.render();
      });

      // Go to login
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

  // MODAL: EDIT APPLICATION DETAILS
  openEditApplicationModal(app) {
    const slot = this.container.querySelector('#auth-modal-slot');
    if (!slot) return;

    slot.innerHTML = `
      <div class="modal-overlay" style="display: flex;">
        <div class="modal-dialog" style="max-width: 480px;">
          <div class="modal-header">
            <div>
              <h3 style="font-size: 15px; font-weight: 700; margin: 0;">Edit Hospital Application Details</h3>
              <p style="font-size: 11px; color: #64748b; margin: 2px 0 0 0;">Ref: ${app.refNumber}</p>
            </div>
            <button type="button" class="btn btn-sm btn-ghost modal-close">&times;</button>
          </div>

          <form id="form-edit-app">
            <div class="modal-body" style="padding: 16px;">
              <div class="form-group" style="margin-bottom: 10px;">
                <label class="form-label" style="font-weight: 700; font-size: 11px;">Hospital Name</label>
                <input type="text" id="edit-app-name" class="form-input" value="${app.hospitalName}" required style="font-size: 12px;" />
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
                <div class="form-group">
                  <label class="form-label" style="font-weight: 700; font-size: 11px;">Registration Number</label>
                  <input type="text" id="edit-app-regno" class="form-input" value="${app.regNumber}" required style="font-size: 12px;" />
                </div>
                <div class="form-group">
                  <label class="form-label" style="font-weight: 700; font-size: 11px;">Total Beds</label>
                  <input type="number" id="edit-app-beds" class="form-input" value="${app.totalBeds || 100}" required style="font-size: 12px;" />
                </div>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;">
                <div class="form-group">
                  <label class="form-label" style="font-weight: 700; font-size: 11px;">Nodal Administrator</label>
                  <input type="text" id="edit-app-admin" class="form-input" value="${app.adminName}" required style="font-size: 12px;" />
                </div>
                <div class="form-group">
                  <label class="form-label" style="font-weight: 700; font-size: 11px;">Dispatch Email</label>
                  <input type="email" id="edit-app-email" class="form-input" value="${app.email}" required style="font-size: 12px;" />
                </div>
              </div>
            </div>

            <div class="modal-footer" style="padding: 10px 16px; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 8px;">
              <button type="button" class="btn btn-secondary modal-close" style="font-size: 12px;">Cancel</button>
              <button type="submit" class="btn btn-primary" style="font-weight: 700; font-size: 12px;">Save Changes</button>
            </div>
          </form>
        </div>
      </div>
    `;

    slot.querySelectorAll('.modal-close').forEach(b => b.addEventListener('click', () => { slot.innerHTML = ''; }));

    slot.querySelector('#form-edit-app')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const updated = hospitalStore.updateHospitalApplication(app.id, {
        hospitalName: slot.querySelector('#edit-app-name').value.trim(),
        regNumber: slot.querySelector('#edit-app-regno').value.trim(),
        totalBeds: slot.querySelector('#edit-app-beds').value.trim(),
        adminName: slot.querySelector('#edit-app-admin').value.trim(),
        email: slot.querySelector('#edit-app-email').value.trim()
      });

      if (updated) {
        this.pendingAppReceipt = updated;
        slot.innerHTML = '';
        showToast('Application details updated!', 'success');
        this.render();
      }
    });
  }

  // MODAL: CHANGE PASSWORD / RESET PIN
  openChangePasswordModal(prefillUser = '') {
    const slot = this.container.querySelector('#auth-modal-slot');
    if (!slot) return;

    slot.innerHTML = `
      <div class="modal-overlay" style="display: flex;">
        <div class="modal-dialog" style="max-width: 400px;">
          <div class="modal-header">
            <div>
              <h3 style="font-size: 15px; font-weight: 700; margin: 0;">Change Password / PIN</h3>
              <p style="font-size: 11px; color: #64748b; margin: 2px 0 0 0;">Update institutional admin password or doctor PIN</p>
            </div>
            <button type="button" class="btn btn-sm btn-ghost modal-close">&times;</button>
          </div>

          <form id="form-cp">
            <div class="modal-body" style="padding: 16px;">
              <div class="form-group" style="margin-bottom: 10px;">
                <label class="form-label" style="font-weight: 700; font-size: 11px;">Username / Login ID</label>
                <input type="text" id="cp-user" class="form-input" value="${prefillUser}" required style="font-size: 12px;" />
              </div>
              <div class="form-group" style="margin-bottom: 10px;">
                <label class="form-label" style="font-weight: 700; font-size: 11px;">Current / Temporary Password</label>
                <input type="password" id="cp-old" class="form-input" required style="font-size: 12px;" />
              </div>
              <div class="form-group" style="margin-bottom: 10px;">
                <label class="form-label" style="font-weight: 700; font-size: 11px;">New Password / PIN (Min 4 chars)</label>
                <input type="password" id="cp-new" class="form-input" minlength="4" required style="font-size: 12px;" />
              </div>
              <div class="form-group" style="margin-bottom: 12px;">
                <label class="form-label" style="font-weight: 700; font-size: 11px;">Confirm New Password</label>
                <input type="password" id="cp-confirm" class="form-input" minlength="4" required style="font-size: 12px;" />
              </div>
              <div id="cp-err" style="display: none; padding: 6px 10px; border-radius: 6px; background: #fee2e2; color: #991b1b; font-size: 11px; margin-bottom: 10px;"></div>
            </div>

            <div class="modal-footer" style="padding: 10px 16px; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 8px;">
              <button type="button" class="btn btn-secondary modal-close" style="font-size: 12px;">Cancel</button>
              <button type="submit" class="btn btn-primary" style="font-weight: 700; font-size: 12px;">Update Password</button>
            </div>
          </form>
        </div>
      </div>
    `;

    slot.querySelectorAll('.modal-close').forEach(b => b.addEventListener('click', () => { slot.innerHTML = ''; }));

    const form = slot.querySelector('#form-cp');
    const errBox = slot.querySelector('#cp-err');

    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const u = slot.querySelector('#cp-user').value.trim();
      const oldP = slot.querySelector('#cp-old').value.trim();
      const newP = slot.querySelector('#cp-new').value.trim();
      const confirmP = slot.querySelector('#cp-confirm').value.trim();

      if (newP !== confirmP) {
        errBox.textContent = 'New passwords do not match.';
        errBox.style.display = 'block';
        return;
      }

      const res = hospitalStore.changeHospitalPassword(u, oldP, newP);
      if (res.success) {
        slot.innerHTML = '';
        showToast('Password updated! You can now sign in.', 'success');
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
