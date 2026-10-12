/**
 * HealthCard Hospital Portal: Outpatient Department (OPD) Desk View
 * High-efficiency clinical workstation for doctors and OPD staff.
 * Clean English UI, zero emojis, sharp SVG vector iconography.
 * Does not force-load any old patient by default.
 */

import { hospitalStore } from '../../shared/storage.js';
import { formatHealthId } from '../../shared/utils/healthId.js';
import { calculateAge } from '../../shared/utils/formatters.js';
import { QRScannerModal } from '../dashboard/qrScannerModal.js';
import { showToast } from '../../shared/components/toast.js';

export class OpdDeskView {
  constructor(container) {
    this.container = container;
  }

  render() {
    const patients = hospitalStore.getAllPatients();
    const activeStaff = hospitalStore.getCurrentStaff();
    const settings = hospitalStore.getHospitalSettings();
    const recentConsults = (hospitalStore.clinicalData.consultations || []).slice(0, 6);

    this.container.innerHTML = `
      <div class="opd-desk-view" style="max-width: 1200px; margin: 0 auto; padding-bottom: 50px;">
        <!-- Top Institutional Strip -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 14px;">
          <div>
            <div style="display: flex; align-items: center; gap: 10px;">
              <div style="width: 38px; height: 38px; background: var(--color-primary-light); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: var(--color-primary);">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              </div>
              <div>
                <h1 style="font-size: 20px; font-weight: 800; color: var(--text-main); margin: 0;">Outpatient Department (OPD) Desk</h1>
                <p style="font-size: 12.5px; color: var(--text-muted); margin: 2px 0 0 0;">
                  ${settings.hospitalName || 'AIIMS Hospital'} • Duty Clinician: <strong>${activeStaff.fullName}</strong> (${activeStaff.department || 'Consultant'})
                </p>
              </div>
            </div>
          </div>

          <div style="display: flex; gap: 8px; align-items: center;">
            <a href="#intake" class="btn btn-outline" style="display: inline-flex; align-items: center; gap: 6px; font-size: 12.5px;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
              New Patient Registration
            </a>
          </div>
        </div>

        <!-- Fast Patient Lookup Bar (Search by Card ID, Mobile, or Name) -->
        <div style="background: #ffffff; border: 1.5px solid var(--color-primary); border-radius: var(--radius-xl); padding: 22px 24px; margin-bottom: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
            <label style="font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; display: flex; align-items: center; gap: 6px;">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              Enter HealthCard ID, 10-Digit Mobile Number, or Patient Name:
            </label>
            <span style="font-size: 11px; color: var(--color-primary); font-weight: 600;">Central Health Network Sync Active</span>
          </div>

          <form id="opd-search-patient-form" style="display: flex; gap: 8px;">
            <input 
              type="text" 
              id="opd-find-input" 
              class="form-input" 
              placeholder="e.g. 74839 16251 or 9876543210 or Rahul Sharma..." 
              style="font-size: 14px; font-weight: 600; padding: 12px 16px; flex: 1;" 
              required 
            />
            <button type="submit" class="btn btn-primary" style="padding: 12px 22px; font-weight: 700; white-space: nowrap; display: inline-flex; align-items: center; gap: 6px;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              Open Consultation
            </button>
            <button type="button" class="btn btn-secondary" id="btn-opd-scan-qr" style="padding: 12px 18px; white-space: nowrap; display: inline-flex; align-items: center; gap: 6px;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              Scan Card QR
            </button>
          </form>
          <div id="opd-search-feedback" style="display: none; margin-top: 10px; font-size: 12px;"></div>
        </div>

        <!-- Two Column OPD Roster: Today's Registered Queue & Recent Consultations -->
        <div style="display: grid; grid-template-columns: 1.4fr 1fr; gap: 20px;">
          
          <!-- Column 1: Today's OPD Patients Queue -->
          <div style="background: #ffffff; border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid var(--border-color);">
              <div>
                <h3 style="font-size: 15px; font-weight: 700; color: var(--text-main); margin: 0;">Today's Registered Patients</h3>
                <p style="font-size: 11.5px; color: var(--text-muted); margin: 2px 0 0 0;">Select any patient to start a new outpatient consultation</p>
              </div>
              <span class="badge badge-active">${patients.length} in Queue</span>
            </div>

            <div style="display: flex; flex-direction: column; gap: 10px;">
              ${patients.length === 0 ? `
                <div style="text-align: center; padding: 40px 20px; color: var(--text-muted); font-size: 13px;">
                  No patients registered today. Enter a Card ID or mobile number above to begin.
                </div>
              ` : patients.map(p => {
                const cleanId = (p.healthId || '').replace(/\s+/g, '');
                return `
                  <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; background: #f8fafc; border: 1px solid var(--border-color); border-radius: var(--radius-lg); transition: border-color 0.15s ease;">
                    <div style="display: flex; align-items: center; gap: 12px; min-width: 0;">
                      <img src="${p.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}" style="width: 44px; height: 44px; border-radius: 8px; object-fit: cover; border: 1.5px solid var(--border-color);" alt="${p.fullName}" />
                      <div style="min-width: 0;">
                        <div style="display: flex; align-items: center; gap: 6px;">
                          <span style="font-weight: 700; font-size: 14px; color: var(--text-main);">${p.fullName}</span>
                          <span class="blood-group-tag" style="font-size: 10px; padding: 1px 5px;">${p.bloodGroup || 'O+'}</span>
                        </div>
                        <div style="font-size: 11.5px; color: var(--text-muted); margin-top: 2px;">
                          <span class="font-mono" style="font-weight: 600; color: var(--color-primary);">${formatHealthId(p.healthId)}</span>
                          <span style="margin: 0 4px;">•</span>
                          <span>${calculateAge(p.dob)}</span>
                          <span style="margin: 0 4px;">•</span>
                          <span>${p.gender || 'Male'}</span>
                          <span style="margin: 0 4px;">•</span>
                          <span>Mob: ${p.mobile}</span>
                        </div>
                      </div>
                    </div>

                    <div style="display: flex; align-items: center; gap: 8px; flex-shrink: 0;">
                      <a href="#patient?id=${cleanId}&tab=consultation" class="btn btn-sm btn-primary" style="font-weight: 700; font-size: 12px; padding: 6px 12px; display: inline-flex; align-items: center; gap: 5px;">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        Start Consultation
                      </a>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Column 2: Recent Consultations & OPD Information -->
          <div style="display: flex; flex-direction: column; gap: 16px;">
            <!-- OPD Operating Hours & Duty Card -->
            <div style="background: #ffffff; border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: 18px 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
              <div style="font-size: 12px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 8px;">
                OPD Clinic Operational Info:
              </div>
              
              <div style="display: flex; flex-direction: column; gap: 8px; font-size: 12.5px;">
                <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px;">
                  <span style="color: var(--text-secondary);">Operating Hours:</span>
                  <strong>${settings.opdTimings || '08:00 AM – 04:00 PM'}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px;">
                  <span style="color: var(--text-secondary);">Attending Doctor:</span>
                  <strong>${activeStaff.fullName}</strong>
                </div>
                <div style="display: flex; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px;">
                  <span style="color: var(--text-secondary);">Department:</span>
                  <strong>${activeStaff.department || 'General Medicine'}</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: var(--text-secondary);">OPD Consultation Fee:</span>
                  <strong style="color: #15803d;">₹50 (Government Subsidized)</strong>
                </div>
              </div>
            </div>

            <!-- Recent OPD Encounters Handled -->
            <div style="background: #ffffff; border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: 18px 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
              <div style="font-size: 13.5px; font-weight: 700; color: var(--text-main); margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
                <span>Recent Consultations Completed:</span>
                <span class="badge badge-blue" style="font-size: 10px;">${recentConsults.length} Recorded</span>
              </div>

              ${recentConsults.length === 0 ? `
                <div style="font-size: 12px; color: var(--text-muted); text-align: center; padding: 20px 0;">No consultations logged today yet.</div>
              ` : `
                <div style="display: flex; flex-direction: column; gap: 8px;">
                  ${recentConsults.map(c => `
                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px 10px; font-size: 12px;">
                      <div style="display: flex; justify-content: space-between; align-items: center;">
                        <strong style="color: var(--text-main);">${c.diagnoses?.[0]?.name || 'Clinical Encounter'}</strong>
                        <span style="font-size: 10.5px; color: var(--text-muted);">${c.date ? new Date(c.date).toLocaleDateString() : 'Today'}</span>
                      </div>
                      <div style="font-size: 11px; color: var(--text-secondary); margin-top: 2px;">
                        Patient ID: <span class="font-mono">${c.healthId}</span> • Clinician: ${c.clinician}
                      </div>
                    </div>
                  `).join('')}
                </div>
              `}
            </div>
          </div>

        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    const form = this.container.querySelector('#opd-search-patient-form');
    const input = this.container.querySelector('#opd-find-input');
    const feedback = this.container.querySelector('#opd-search-feedback');
    const qrBtn = this.container.querySelector('#btn-opd-scan-qr');

    const handlePatientSearch = () => {
      const q = (input.value || '').trim();
      if (!q) return;

      const resolved = hospitalStore.resolveCardToken(q);
      const targetPatient = resolved?.found ? resolved.patient : hospitalStore.getPatientByHealthId(q);

      if (targetPatient) {
        const cleanId = (targetPatient.healthId || targetPatient.id || '').replace(/\s+/g, '');
        window.location.hash = `#patient?id=${cleanId}&tab=consultation`;
        showToast(`Loaded records for ${targetPatient.fullName}!`, 'success');
      } else {
        // Fallback: search by name in all patients
        const all = hospitalStore.getAllPatients();
        const matched = all.filter(p => p.fullName.toLowerCase().includes(q.toLowerCase()) || p.mobile.includes(q));
        if (matched.length > 0) {
          const first = matched[0];
          const cleanId = (first.healthId || first.id || '').replace(/\s+/g, '');
          window.location.hash = `#patient?id=${cleanId}&tab=consultation`;
          showToast(`Loaded records for ${first.fullName}!`, 'success');
        } else {
          feedback.style.display = 'block';
          feedback.style.color = '#dc2626';
          feedback.innerHTML = `No patient found matching "<strong>${q}</strong>". Check the Card ID or mobile number, or <a href="#intake" style="color:#1d4ed8; text-decoration:underline;">register as a new patient</a>.`;
        }
      }
    };

    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      handlePatientSearch();
    });

    qrBtn?.addEventListener('click', () => {
      new QRScannerModal((scannedData) => {
        if (scannedData) {
          const resolved = hospitalStore.resolveCardToken(scannedData);
          if (resolved?.found && resolved.patient) {
            const cleanId = (resolved.patient.healthId || resolved.patient.id || '').replace(/\s+/g, '');
            window.location.hash = `#patient?id=${cleanId}&tab=consultation`;
            showToast(`Card QR verified! Loaded ${resolved.patient.fullName}`, 'success');
          } else {
            input.value = scannedData;
            handlePatientSearch();
          }
        }
      });
    });
  }
}
