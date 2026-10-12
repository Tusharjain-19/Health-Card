/**
 * HealthCard Hospital Portal: Institutional Healthcare Authentication View
 * Clean enterprise clinical login portal for Hospital Administrators & OPD Clinicians.
 * Strictly English UI with zero emojis and sharp SVG vector iconography.
 */

import { hospitalStore } from '../../shared/storage.js';
import { showToast } from '../../shared/components/toast.js';

export class HospitalAuthView {
  constructor(container, onLoginSuccess) {
    this.container = container;
    this.onLoginSuccess = onLoginSuccess;
  }

  render() {
    const settings = hospitalStore.getHospitalSettings();

    this.container.innerHTML = `
      <div class="hospital-auth-wrapper" style="min-height: calc(100vh - 120px); display: flex; align-items: center; justify-content: center; padding: 30px 16px;">
        <div style="background: #ffffff; border: 1px solid var(--border-color); border-radius: 16px; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.06), 0 8px 10px -6px rgba(0,0,0,0.04); max-width: 480px; width: 100%; overflow: hidden;">
          
          <!-- Institutional Header Bar -->
          <div style="background: linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%); padding: 32px 28px 26px; color: #ffffff; text-align: center; position: relative;">
            <div style="width: 56px; height: 56px; background: rgba(255,255,255,0.12); border: 1.5px solid rgba(255,255,255,0.3); border-radius: 12px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 14px;">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.2">
                <path d="M12 2v20M2 12h20"/>
              </svg>
            </div>
            
            <h2 style="font-size: 20px; font-weight: 800; margin: 0; color: #ffffff; letter-spacing: -0.3px;">
              ${settings.shortName || 'HealthCard Hospital Portal'}
            </h2>
            <p style="font-size: 12.5px; margin: 5px 0 0 0; color: #bfdbfe; font-weight: 500;">
              ${settings.hospitalName || 'Institutional Clinical Workstation'}
            </p>
            
            <div style="display: inline-flex; align-items: center; gap: 6px; margin-top: 12px; background: rgba(0,0,0,0.2); padding: 4px 12px; border-radius: 20px; font-size: 11px; font-family: monospace; color: #93c5fd;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span>${settings.regNumber || 'NABH Accredited • Verified Gateway'}</span>
            </div>
          </div>

          <!-- Login Form Card -->
          <div style="padding: 28px 28px 24px;">
            <div style="margin-bottom: 20px;">
              <h3 style="font-size: 16px; font-weight: 700; color: var(--text-main); margin: 0;">Sign In to Hospital Portal</h3>
              <p style="font-size: 12px; color: var(--text-muted); margin: 3px 0 0 0;">Enter your administrator username or clinician application credentials</p>
            </div>

            <form id="hospital-login-form">
              <div class="form-group" style="margin-bottom: 16px;">
                <label class="form-label" style="font-weight: 700; font-size: 12.5px; color: var(--text-main); display: flex; align-items: center; gap: 6px;">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  Login ID / Username / Email:
                </label>
                <input 
                  type="text" 
                  id="hosp-login-user" 
                  class="form-input" 
                  placeholder="e.g. admin@aiims.gov.in or doc.vikram" 
                  value="${settings.adminLoginId || 'admin@aiims.gov.in'}" 
                  required 
                  style="font-size: 13.5px; padding: 10px 14px;" 
                />
              </div>

              <div class="form-group" style="margin-bottom: 20px;">
                <label class="form-label" style="font-weight: 700; font-size: 12.5px; color: var(--text-main); display: flex; align-items: center; gap: 6px;">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  Security Password / Access PIN:
                </label>
                <div style="position: relative;">
                  <input 
                    type="password" 
                    id="hosp-login-pass" 
                    class="form-input" 
                    placeholder="Enter password or doctor PIN" 
                    value="${settings.adminPassword || 'admin123'}" 
                    required 
                    style="font-size: 13.5px; padding: 10px 14px; padding-right: 40px;" 
                  />
                  <button type="button" id="btn-toggle-pass-visibility" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); border: none; background: none; color: var(--text-muted); cursor: pointer; padding: 4px;" title="Toggle Password Visibility">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  </button>
                </div>
              </div>

              <!-- Quick Demo Access Chips -->
              <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px; margin-bottom: 20px;">
                <div style="font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; margin-bottom: 8px; display: flex; align-items: center; gap: 5px;">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                  1-Click Authorized Sign In (Demo Credentials):
                </div>
                
                <div style="display: flex; flex-direction: column; gap: 6px;">
                  <button type="button" class="btn btn-sm btn-outline btn-quick-login-chip" data-user="${settings.adminLoginId || 'admin@aiims.gov.in'}" data-pass="${settings.adminPassword || 'admin123'}" style="text-align: left; justify-content: space-between; font-size: 11.5px; background: #ffffff; padding: 6px 10px;">
                    <span><strong>Chief Hospital Administrator</strong> (${settings.adminLoginId || 'admin@aiims.gov.in'})</span>
                    <span class="badge badge-active" style="font-size: 10px;">Admin</span>
                  </button>
                  
                  <button type="button" class="btn btn-sm btn-outline btn-quick-login-chip" data-user="doc.vikram" data-pass="1982" style="text-align: left; justify-content: space-between; font-size: 11.5px; background: #ffffff; padding: 6px 10px;">
                    <span><strong>Dr. Vikram Sethi</strong> (Cardiology Desk)</span>
                    <span class="badge badge-blue" style="font-size: 10px;">Doctor</span>
                  </button>

                  <button type="button" class="btn btn-sm btn-outline btn-quick-login-chip" data-user="doc.neha" data-pass="2045" style="text-align: left; justify-content: space-between; font-size: 11.5px; background: #ffffff; padding: 6px 10px;">
                    <span><strong>Dr. Neha Kapoor</strong> (General Medicine)</span>
                    <span class="badge badge-blue" style="font-size: 10px;">Doctor</span>
                  </button>
                </div>
              </div>

              <div id="hosp-login-error" style="display: none; padding: 8px 12px; border-radius: 6px; background: #fee2e2; border: 1px solid #fca5a5; color: #991b1b; font-size: 12px; margin-bottom: 14px;"></div>

              <button type="submit" class="btn btn-primary" id="btn-submit-hosp-login" style="width: 100%; padding: 11px; font-weight: 700; font-size: 14px; justify-content: center; gap: 8px;">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                Sign In to Hospital Portal
              </button>
            </form>
          </div>

          <!-- Institutional Footer Note -->
          <div style="background: #f8fafc; border-top: 1px solid var(--border-color); padding: 12px 28px; text-align: center; font-size: 11px; color: var(--text-muted);">
            HealthCard National Digital Health Infrastructure • Protected by AES-256 TLS
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    const form = this.container.querySelector('#hospital-login-form');
    const userInput = this.container.querySelector('#hosp-login-user');
    const passInput = this.container.querySelector('#hosp-login-pass');
    const errorBox = this.container.querySelector('#hosp-login-error');
    const togglePassBtn = this.container.querySelector('#btn-toggle-pass-visibility');

    // Toggle password visibility
    togglePassBtn?.addEventListener('click', () => {
      if (passInput.type === 'password') {
        passInput.type = 'text';
      } else {
        passInput.type = 'password';
      }
    });

    // Quick login chips
    this.container.querySelectorAll('.btn-quick-login-chip').forEach(btn => {
      btn.addEventListener('click', () => {
        const u = btn.getAttribute('data-user');
        const p = btn.getAttribute('data-pass');
        userInput.value = u;
        passInput.value = p;
        errorBox.style.display = 'none';
        form.requestSubmit();
      });
    });

    // Form submit
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const u = userInput.value.trim();
      const p = passInput.value.trim();

      const result = hospitalStore.loginHospital(u, p);

      if (result.success) {
        showToast(`Welcome, ${result.session.fullName}! (${result.session.role})`, 'success');
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
  }
}
