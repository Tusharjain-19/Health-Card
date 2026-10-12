/**
 * HealthCard Hospital Portal: Hospital Institutional Settings & Administration View
 * Allows updating all hospital profile metadata, institutional credentials, OPD timings,
 * bed capacities, and letterhead headers.
 * 100% English UI, zero emojis, sharp SVG vector iconography.
 */

import { hospitalStore } from '../../shared/storage.js';
import { showToast } from '../../shared/components/toast.js';

export class HospitalSettingsView {
  constructor(container, onSettingsUpdated) {
    this.container = container;
    this.onSettingsUpdated = onSettingsUpdated;
  }

  render() {
    const settings = hospitalStore.getHospitalSettings();
    const doctors = hospitalStore.getDoctors();
    const activeStaff = hospitalStore.getCurrentStaff();

    this.container.innerHTML = `
      <div class="hospital-settings-view" style="max-width: 1100px; margin: 0 auto; padding-bottom: 60px;">
        <!-- Header -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 14px;">
          <div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="width: 36px; height: 36px; background: var(--color-primary-light); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: var(--color-primary);">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              </div>
              <div>
                <h1 style="font-size: 20px; font-weight: 800; color: var(--text-main); margin: 0;">Hospital Profile & System Configuration</h1>
                <p style="font-size: 12.5px; color: var(--text-muted); margin: 2px 0 0 0;">Manage hospital facility metadata, operating hours, administrative credentials, and printable letterheads</p>
              </div>
            </div>
          </div>

          <div style="display: flex; gap: 8px;">
            <button type="submit" form="hospital-settings-form" class="btn btn-primary" style="font-weight: 700; display: inline-flex; align-items: center; gap: 6px;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              Save Hospital Details
            </button>
          </div>
        </div>

        <form id="hospital-settings-form">
          <!-- Section 1: Institutional Identity & Accreditation -->
          <div style="background: #ffffff; border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: 22px 24px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 10px;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2.2"><path d="M12 2v20M2 12h20"/></svg>
              <h3 style="font-size: 15px; font-weight: 700; color: var(--text-main); margin: 0;">Institutional Identity & Licensing</h3>
            </div>

            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 16px; margin-bottom: 14px;">
              <div>
                <label class="form-label" style="font-weight: 700;">Full Hospital / Medical Center Name:</label>
                <input type="text" id="set-hospital-name" class="form-input" value="${settings.hospitalName}" required />
              </div>
              <div>
                <label class="form-label" style="font-weight: 700;">Short Display Name (Navbar):</label>
                <input type="text" id="set-short-name" class="form-input" value="${settings.shortName}" required />
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 14px;">
              <div>
                <label class="form-label" style="font-weight: 700;">Facility Subtitle / Department Scope:</label>
                <input type="text" id="set-tagline" class="form-input" value="${settings.tagline}" />
              </div>
              <div>
                <label class="form-label" style="font-weight: 700;">Registration & Accreditation Number:</label>
                <input type="text" id="set-reg-number" class="form-input" value="${settings.regNumber}" placeholder="e.g. HOSP-DL-00192 • NABH Accredited" required />
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 16px;">
              <div>
                <label class="form-label">Physical Postal Address:</label>
                <input type="text" id="set-address" class="form-input" value="${settings.address}" required />
              </div>
              <div>
                <label class="form-label">City:</label>
                <input type="text" id="set-city" class="form-input" value="${settings.city}" required />
              </div>
              <div>
                <label class="form-label">State / Region:</label>
                <input type="text" id="set-state" class="form-input" value="${settings.state}" required />
              </div>
            </div>
          </div>

          <!-- Section 2: Contact & Emergency Helplines -->
          <div style="background: #ffffff; border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: 22px 24px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 10px;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2.2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <h3 style="font-size: 15px; font-weight: 700; color: var(--text-main); margin: 0;">Institutional Contact & 24x7 Emergency Helplines</h3>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 14px;">
              <div>
                <label class="form-label" style="font-weight: 700;">General Reception Phone:</label>
                <input type="text" id="set-phone" class="form-input" value="${settings.contactPhone}" required />
              </div>
              <div>
                <label class="form-label" style="font-weight: 700; color: #dc2626;">24x7 Emergency Helpline:</label>
                <input type="text" id="set-helpline" class="form-input font-bold" value="${settings.emergencyHelpline}" required />
              </div>
              <div>
                <label class="form-label">Official Email:</label>
                <input type="email" id="set-email" class="form-input" value="${settings.email}" required />
              </div>
              <div>
                <label class="form-label">Official Website:</label>
                <input type="url" id="set-website" class="form-input" value="${settings.website}" />
              </div>
            </div>
          </div>

          <!-- Section 3: Clinical Timings & Capacity Configuration -->
          <div style="background: #ffffff; border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: 22px 24px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 10px;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2.2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              <h3 style="font-size: 15px; font-weight: 700; color: var(--text-main); margin: 0;">Clinical Operations, Timings & Bed Capacity</h3>
            </div>

            <div style="display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 16px; margin-bottom: 14px;">
              <div>
                <label class="form-label" style="font-weight: 700;">OPD Consultation Timings:</label>
                <input type="text" id="set-opd-timings" class="form-input" value="${settings.opdTimings}" required />
              </div>
              <div>
                <label class="form-label" style="font-weight: 700;">Total Inpatient Beds:</label>
                <input type="number" id="set-total-beds" class="form-input font-mono" value="${settings.totalBeds}" required />
              </div>
              <div>
                <label class="form-label" style="font-weight: 700;">ICU / HDU Critical Beds:</label>
                <input type="number" id="set-icu-beds" class="form-input font-mono" value="${settings.icuBeds}" required />
              </div>
            </div>

            <div>
              <label class="form-label" style="font-weight: 700;">Official Prescription Letterhead Title (Printout):</label>
              <input type="text" id="set-letterhead" class="form-input" value="${settings.letterheadHeader}" required />
            </div>
          </div>

          <!-- Section 4: Hospital Administrator Credentials & Security Management -->
          <div style="background: #ffffff; border: 1.5px solid #cbd5e1; border-radius: var(--radius-xl); padding: 22px 24px; margin-bottom: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 10px;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" stroke-width="2.2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                <h3 style="font-size: 15px; font-weight: 700; color: #1e3a8a; margin: 0;">Hospital Portal Administrator Credentials</h3>
              </div>
              <span class="badge badge-active">Admin Security</span>
            </div>

            <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 14px;">
              These credentials are provided to the chief hospital administrator to sign in to the portal and configure clinical workflows.
            </p>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
              <div>
                <label class="form-label" style="font-weight: 700;">Administrator Login ID / Email:</label>
                <input type="text" id="set-admin-user" class="form-input font-bold" value="${settings.adminLoginId || 'admin@aiims.gov.in'}" required />
              </div>
              <div>
                <label class="form-label" style="font-weight: 700;">Administrator Password:</label>
                <input type="text" id="set-admin-pass" class="form-input font-mono font-bold" value="${settings.adminPassword || 'admin123'}" required />
              </div>
            </div>
          </div>

          <!-- Section 5: Clinician Mobile & Workstation Directory -->
          <div style="background: #f8fafc; border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: 20px 24px; margin-bottom: 24px;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
              <div style="font-weight: 700; font-size: 13.5px; color: var(--text-main); display: flex; align-items: center; gap: 6px;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                Active Clinician Login Credentials (${doctors.length} Doctors):
              </div>
              <a href="#staff" class="btn btn-sm btn-outline" style="font-size: 11.5px;">Manage Doctors in Staff View</a>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 10px;">
              ${doctors.map(d => `
                <div style="background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 12px; display: flex; align-items: center; gap: 10px;">
                  <img src="${d.avatar}" style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover; border: 1px solid #cbd5e1;" />
                  <div style="flex: 1; min-width: 0;">
                    <div style="font-weight: 700; font-size: 12.5px; color: var(--text-main); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${d.fullName}</div>
                    <div style="font-size: 11px; color: var(--text-muted);">${d.department}</div>
                    <div style="font-size: 11px; color: #1d4ed8; font-family: monospace; font-weight: 600;">
                      ID: ${d.appUsername} | PIN: ${d.appPin}
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Bottom Form Actions -->
          <div style="display: flex; justify-content: flex-end; gap: 12px; padding-top: 10px;">
            <button type="submit" class="btn btn-primary" style="padding: 10px 24px; font-size: 14px; font-weight: 700;">
              Save & Apply Hospital Settings
            </button>
          </div>
        </form>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    const form = this.container.querySelector('#hospital-settings-form');
    form?.addEventListener('submit', (e) => {
      e.preventDefault();

      const updated = {
        hospitalName: this.container.querySelector('#set-hospital-name').value.trim(),
        shortName: this.container.querySelector('#set-short-name').value.trim(),
        tagline: this.container.querySelector('#set-tagline').value.trim(),
        regNumber: this.container.querySelector('#set-reg-number').value.trim(),
        address: this.container.querySelector('#set-address').value.trim(),
        city: this.container.querySelector('#set-city').value.trim(),
        state: this.container.querySelector('#set-state').value.trim(),
        contactPhone: this.container.querySelector('#set-phone').value.trim(),
        emergencyHelpline: this.container.querySelector('#set-helpline').value.trim(),
        email: this.container.querySelector('#set-email').value.trim(),
        website: this.container.querySelector('#set-website').value.trim(),
        opdTimings: this.container.querySelector('#set-opd-timings').value.trim(),
        totalBeds: this.container.querySelector('#set-total-beds').value.trim(),
        icuBeds: this.container.querySelector('#set-icu-beds').value.trim(),
        letterheadHeader: this.container.querySelector('#set-letterhead').value.trim(),
        adminLoginId: this.container.querySelector('#set-admin-user').value.trim(),
        adminPassword: this.container.querySelector('#set-admin-pass').value.trim()
      };

      const saved = hospitalStore.updateHospitalSettings(updated);
      showToast(`Hospital details and administrative settings saved successfully!`, 'success');

      if (typeof this.onSettingsUpdated === 'function') {
        this.onSettingsUpdated(saved);
      }
    });
  }
}
