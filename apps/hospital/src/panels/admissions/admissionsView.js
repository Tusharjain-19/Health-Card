/**
 * HealthCard Hospital Portal: Inpatient Ward & Admissions Overview (IPD)
 * Indian Clinical Standard:
 * - Wards: Casualty / Emergency, ICU, HDU, General Wards (Male/Female), Private Rooms
 * - Fluid Ward & Bed Transfer (e.g. Casualty -> ICU -> General Ward)
 * - Daily Rounds, Nursing Handover, and Discharge Summaries
 */

import { hospitalStore } from '../../shared/storage.js';
import { formatDate } from '../../shared/utils/formatters.js';
import { formatHealthId } from '../../shared/utils/healthId.js';
import { showToast } from '../../shared/components/toast.js';

export class AdmissionsView {
  constructor(container) {
    this.container = container;
  }

  render() {
    const admissions = hospitalStore.clinicalData.admissions || [];
    const activeList = admissions.filter(a => a.status === 'Active Inpatient');
    const pastList = admissions.filter(a => a.status !== 'Active Inpatient');
    const wards = hospitalStore.getStandardWards();

    const icuCount = activeList.filter(a => (a.ward || '').toLowerCase().includes('icu')).length;
    const casualtyCount = activeList.filter(a => (a.ward || '').toLowerCase().includes('casualty') || (a.ward || '').toLowerCase().includes('emergency')).length;
    const gwCount = activeList.filter(a => (a.ward || '').toLowerCase().includes('general')).length;

    this.container.innerHTML = `
      <div class="admissions-view" style="max-width: 1200px; margin: 0 auto; padding-bottom: 40px;">
        <!-- Header -->
        <div class="page-header" style="margin-bottom: 20px;">
          <div>
            <h1 class="page-title" style="display: flex; align-items: center; gap: 8px;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2.2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M7 15h10"/><path d="M12 9v6"/></svg>
              Inpatient Department (IPD) & Ward Management (अंतरंग रोगी विभाग)
            </h1>
            <p class="page-subtitle">Real-time bed allocation, fluid ward/bed transfers, daily rounds, and discharge summaries</p>
          </div>
          <div style="display: flex; gap: 10px;">
            <button type="button" class="btn btn-primary" id="btn-top-admit" style="display: inline-flex; align-items: center; gap: 6px; font-weight: 700;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
              + Admit Patient to Ward (रोगी भर्ती)
            </button>
            <a href="#intake" class="btn btn-outline" style="display: inline-flex; align-items: center; gap: 6px;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              Patient Desk
            </a>
          </div>
        </div>

        <!-- Inpatient Capacity Strip -->
        <div class="stats-grid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px;">
          <div class="stat-card" style="background: #ffffff; border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: 18px 20px;">
            <div>
              <div class="stat-label" style="font-size: 12px; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Total Active Beds</div>
              <div class="stat-value" style="font-size: 24px; font-weight: 800; color: var(--color-primary); margin-top: 4px;">${activeList.length} Occupied</div>
              <div style="font-size: 11.5px; color: #15803d; margin-top: 4px; font-weight: 600;">Standard Occupancy: 82%</div>
            </div>
          </div>

          <div class="stat-card" style="background: #ffffff; border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: 18px 20px;">
            <div>
              <div class="stat-label" style="font-size: 12px; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">ICU & Critical Care</div>
              <div class="stat-value" style="font-size: 24px; font-weight: 800; color: #dc2626; margin-top: 4px;">${icuCount} Active</div>
              <div style="font-size: 11.5px; color: #b91c1c; margin-top: 4px; font-weight: 600;">Continuous Vital Telemetry</div>
            </div>
          </div>

          <div class="stat-card" style="background: #ffffff; border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: 18px 20px;">
            <div>
              <div class="stat-label" style="font-size: 12px; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Emergency / Casualty</div>
              <div class="stat-value" style="font-size: 24px; font-weight: 800; color: #b45309; margin-top: 4px;">${casualtyCount} Under Triage</div>
              <div style="font-size: 11.5px; color: #d97706; margin-top: 4px; font-weight: 600;">Acute Stabilization Beds</div>
            </div>
          </div>

          <div class="stat-card" style="background: #ffffff; border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: 18px 20px;">
            <div>
              <div class="stat-label" style="font-size: 12px; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Discharged & Archives</div>
              <div class="stat-value" style="font-size: 24px; font-weight: 800; color: #059669; margin-top: 4px;">${pastList.length} Summaries</div>
              <div style="font-size: 11.5px; color: #047857; margin-top: 4px; font-weight: 600;">Discharge Slips Issued</div>
            </div>
          </div>
        </div>

        <!-- Active Inpatients Table Card -->
        <div style="background: #ffffff; border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: 22px; box-shadow: 0 1px 4px rgba(0,0,0,0.05); margin-bottom: 24px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 18px; padding-bottom: 12px; border-bottom: 1px solid var(--border-color);">
            <div>
              <h3 style="font-size: 16px; font-weight: 800; color: var(--text-main); margin: 0;">Currently Admitted Patients (वार्ड में भर्ती मरीज)</h3>
              <p style="font-size: 12px; color: var(--text-muted); margin: 2px 0 0 0;">Manage daily clinical rounds, bed shifts, ward transfers, and patient discharge</p>
            </div>
            <span class="badge badge-active" style="font-size: 11.5px;">${activeList.length} Active Inpatients</span>
          </div>

          ${activeList.length === 0 ? `
            <div style="text-align: center; padding: 40px 20px; color: var(--text-muted);">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="margin-bottom: 10px; opacity: 0.5;"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M7 15h10"/><path d="M12 9v6"/></svg>
              <div style="font-weight: 700; font-size: 14px; color: var(--text-main);">No Patients Currently Admitted in Wards</div>
              <div style="font-size: 12px; margin-top: 4px;">Use the "+ Admit Patient to Ward" button above or register a new patient to admit them.</div>
            </div>
          ` : `
            <div style="display: flex; flex-direction: column; gap: 12px;">
              ${activeList.map(adm => {
                const cleanId = (adm.healthId || '').replace(/\s+/g, '');
                const patient = hospitalStore.getPatientByHealthId(cleanId);
                const isICU = (adm.ward || '').toLowerCase().includes('icu');
                const isCasualty = (adm.ward || '').toLowerCase().includes('casualty') || (adm.ward || '').toLowerCase().includes('emergency');
                const daysStay = Math.max(1, Math.ceil((Date.now() - new Date(adm.admittedAt).getTime()) / (1000 * 60 * 60 * 24)));

                return `
                  <div class="inpatient-row-card" style="background: #ffffff; border: 1.5px solid ${isICU ? '#fca5a5' : isCasualty ? '#fde68a' : 'var(--border-color)'}; border-radius: var(--radius-lg); padding: 16px 18px; display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; box-shadow: 0 1px 3px rgba(0,0,0,0.03);">
                    <!-- Patient & Bed Identity -->
                    <div style="display: flex; align-items: center; gap: 14px; min-width: 260px;">
                      <div style="width: 48px; height: 48px; border-radius: 10px; background: ${isICU ? '#fee2e2' : isCasualty ? '#fef3c7' : '#eff6ff'}; border: 1.5px solid ${isICU ? '#f87171' : isCasualty ? '#fbbf24' : '#93c5fd'}; display: flex; flex-direction: column; align-items: center; justify-content: center; flex-shrink: 0;">
                        <span style="font-size: 10px; font-weight: 800; color: ${isICU ? '#991b1b' : isCasualty ? '#92400e' : '#1d4ed8'}; text-transform: uppercase;">BED</span>
                        <span style="font-size: 13px; font-weight: 800; color: ${isICU ? '#dc2626' : isCasualty ? '#b45309' : '#1e40af'}; line-height: 1;">${adm.bedNumber || '01'}</span>
                      </div>

                      <div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                          <span style="font-weight: 800; font-size: 14.5px; color: var(--text-main);">${adm.memberName}</span>
                          <span class="blood-group-tag" style="font-size: 10px; padding: 1px 5px;">${adm.bloodGroup || patient?.bloodGroup || 'O+'}</span>
                        </div>
                        <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">
                          <span class="font-mono" style="font-weight: 600;">${formatHealthId(adm.healthId)}</span>
                          <span style="margin: 0 4px;">•</span>
                          <span class="badge ${isICU ? 'badge-emergency' : isCasualty ? 'badge-pending' : 'badge-active'}" style="font-size: 10.5px;">${adm.ward}</span>
                        </div>
                      </div>
                    </div>

                    <!-- Clinical Status & Attending Doctor -->
                    <div style="flex: 1; min-width: 220px;">
                      <div style="font-size: 13px; color: var(--text-main); font-weight: 600;">
                        ${adm.admittingDiagnosis}
                      </div>
                      <div style="font-size: 11.5px; color: var(--text-muted); margin-top: 3px; display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                        <span>Dr. ${adm.admittingDoctor}</span>
                        <span>•</span>
                        <span>Admitted ${formatDate(adm.admittedAt)} (Day ${daysStay})</span>
                        ${adm.transferHistory && adm.transferHistory.length > 0 ? `
                          <span class="badge" style="background: #e0e7ff; color: #4338ca; font-size: 10px; font-weight: 700;">
                            Transferred ${adm.transferHistory.length}x
                          </span>
                        ` : ''}
                      </div>
                    </div>

                    <!-- Quick Action Buttons -->
                    <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                      <!-- Transfer Bed / Ward Button -->
                      <button type="button" class="btn btn-sm btn-secondary btn-transfer-ward" data-admid="${adm.id}" title="Transfer Bed / Ward" style="font-weight: 700; display: inline-flex; align-items: center; gap: 5px;">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M7 16V4M7 4L3 8M7 4L11 8M17 8V20M17 20L21 16M17 20L13 16"/></svg>
                        Transfer Ward
                      </button>

                      <!-- Daily Round Note -->
                      <button type="button" class="btn btn-sm btn-outline btn-round-note" data-admid="${adm.id}" title="Add Doctor Round Note" style="font-weight: 600; display: inline-flex; align-items: center; gap: 5px;">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        Round Note
                      </button>

                      <!-- Open Chart -->
                      <a href="#patient?id=${cleanId}&tab=admissions" class="btn btn-sm btn-primary" style="font-weight: 600; padding: 6px 12px;">
                        Open Chart
                      </a>

                      <!-- Discharge Button -->
                      <button type="button" class="btn btn-sm btn-outline btn-discharge-patient" data-admid="${adm.id}" title="Discharge Patient" style="border-color: #fca5a5; color: #991b1b; font-weight: 600;">
                        Discharge
                      </button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `}
        </div>

        <!-- Historical Discharged Inpatients Archive -->
        <div style="background: #ffffff; border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: 22px; box-shadow: 0 1px 4px rgba(0,0,0,0.05);">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
            <h3 style="font-size: 15px; font-weight: 700; color: var(--text-main); margin: 0;">Discharged Patient Archive (डिस्चार्ज रिकॉर्ड)</h3>
            <span style="font-size: 12px; color: var(--text-muted);">${pastList.length} records archived</span>
          </div>

          <table class="rx-table" style="font-size: 12.5px; width: 100%;">
            <thead>
              <tr>
                <th style="width: 25%;">Patient</th>
                <th style="width: 20%;">Last Ward & Bed</th>
                <th style="width: 30%;">Final Diagnosis & Outcome</th>
                <th style="width: 15%;">Discharge Date</th>
                <th style="width: 10%;">Chart</th>
              </tr>
            </thead>
            <tbody>
              ${pastList.length === 0 ? `
                <tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 18px;">No discharged patient records yet.</td></tr>
              ` : pastList.map(adm => {
                const cleanId = (adm.healthId || '').replace(/\s+/g, '');
                return `
                  <tr>
                    <td>
                      <div style="font-weight: 700; color: var(--text-main);">${adm.memberName}</div>
                      <div class="font-mono" style="font-size: 11px; color: var(--text-muted);">${formatHealthId(adm.healthId)}</div>
                    </td>
                    <td>
                      <div>${adm.ward}</div>
                      <div style="font-size: 11px; color: var(--text-muted);">${adm.bedNumber}</div>
                    </td>
                    <td>
                      <div style="color: var(--text-main);">${adm.finalDiagnosis || adm.admittingDiagnosis}</div>
                      <div style="font-size: 11px; color: #059669; font-weight: 600;">${adm.dischargeAdvice ? adm.dischargeAdvice.slice(0, 40) + '...' : 'Discharged Stable'}</div>
                    </td>
                    <td style="color: var(--text-muted);">${formatDate(adm.dischargedAt || adm.admittedAt)}</td>
                    <td>
                      <a href="#patient?id=${cleanId}" class="btn btn-sm btn-ghost" style="color: var(--color-primary); font-weight: 600;">View</a>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  // ==========================================
  // EVENT BINDINGS
  // ==========================================
  bindEvents() {
    // Top Admit Button
    this.container.querySelector('#btn-top-admit')?.addEventListener('click', () => {
      this.openGeneralAdmitModal();
    });

    // Ward Transfer Buttons
    this.container.querySelectorAll('.btn-transfer-ward').forEach(btn => {
      btn.addEventListener('click', () => {
        const admissionId = btn.getAttribute('data-admid');
        this.openTransferModal(admissionId);
      });
    });

    // Daily Round Note Buttons
    this.container.querySelectorAll('.btn-round-note').forEach(btn => {
      btn.addEventListener('click', () => {
        const admissionId = btn.getAttribute('data-admid');
        this.openRoundModal(admissionId);
      });
    });

    // Discharge Buttons
    this.container.querySelectorAll('.btn-discharge-patient').forEach(btn => {
      btn.addEventListener('click', () => {
        const admissionId = btn.getAttribute('data-admid');
        this.openDischargeModal(admissionId);
      });
    });
  }

  // ==========================================
  // GENERAL ADMISSION MODAL
  // ==========================================
  openGeneralAdmitModal() {
    const patients = hospitalStore.getAllPatients();
    const wards = hospitalStore.getStandardWards();
    const doctors = hospitalStore.getDoctors();

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-dialog" style="max-width: 600px;">
        <div class="modal-header">
          <div>
            <h3 style="font-size: 16px; font-weight: 700; color: var(--text-main); margin: 0;">Admit Patient to Inpatient Ward (रोगी भर्ती)</h3>
            <p style="font-size: 11.5px; color: var(--text-muted); margin: 2px 0 0 0;">Select patient and allocate bed in Emergency, ICU, or General Ward</p>
          </div>
          <button type="button" class="btn btn-sm btn-ghost modal-close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <form id="general-admit-form">
          <div class="modal-body" style="display: flex; flex-direction: column; gap: 14px;">
            <div class="form-group">
              <label class="form-label" style="font-weight: 600;">Select Patient (मरीज चुनें) *</label>
              <select id="gen-patient-select" class="form-select" required>
                ${patients.map(p => `
                  <option value="${p.healthId}">${p.fullName} (${formatHealthId(p.healthId)}) - ${p.bloodGroup || 'O+'}</option>
                `).join('')}
              </select>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label" style="font-weight: 600;">Ward (वार्ड) *</label>
                <select id="gen-ward-select" class="form-select" required>
                  ${wards.map(w => `<option value="${w.name}">${w.name}</option>`).join('')}
                </select>
              </div>

              <div class="form-group">
                <label class="form-label" style="font-weight: 600;">Bed Number (बेड नंबर) *</label>
                <select id="gen-bed-select" class="form-select" required>
                  ${wards[0].beds.map(b => `<option value="${b}">${b}</option>`).join('')}
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" style="font-weight: 600;">Attending Doctor (सलाहकार डॉक्टर) *</label>
              <select id="gen-doctor-select" class="form-select" required>
                ${doctors.map(d => `<option value="${d.name}">${d.name} (${d.department})</option>`).join('')}
              </select>
            </div>

            <div class="form-group">
              <label class="form-label" style="font-weight: 600;">Admitting Diagnosis / Complaints (प्रारंभिक निदान) *</label>
              <input type="text" id="gen-diagnosis" class="form-input" placeholder="e.g. Acute Appendicitis / High Grade Fever under evaluation" required />
            </div>

            <div class="form-group">
              <label class="form-label" style="font-weight: 600;">Initial Instructions / Notes (प्रारंभिक निर्देश)</label>
              <textarea id="gen-initial-note" class="form-textarea" rows="2" placeholder="NPO after midnight, start IV fluids, urgent ultrasound abdomen."></textarea>
            </div>
          </div>

          <div class="modal-footer" style="display: flex; justify-content: flex-end; gap: 10px;">
            <button type="button" class="btn btn-secondary modal-close">Cancel</button>
            <button type="submit" class="btn btn-primary" style="font-weight: 700;">Admit Patient Now →</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(overlay);

    const wardSelect = overlay.querySelector('#gen-ward-select');
    const bedSelect = overlay.querySelector('#gen-bed-select');
    wardSelect.addEventListener('change', () => {
      const selected = wards.find(w => w.name === wardSelect.value) || wards[0];
      bedSelect.innerHTML = selected.beds.map(b => `<option value="${b}">${b}</option>`).join('');
    });

    overlay.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', () => overlay.remove());
    });

    overlay.querySelector('#general-admit-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const hid = overlay.querySelector('#gen-patient-select').value;
      const patient = hospitalStore.getPatientByHealthId(hid);
      const ward = wardSelect.value;
      const bed = bedSelect.value;
      const doctor = overlay.querySelector('#gen-doctor-select').value;
      const diagnosis = overlay.querySelector('#gen-diagnosis').value;
      const note = overlay.querySelector('#gen-initial-note').value;

      hospitalStore.addAdmission({
        healthId: hid,
        memberName: patient ? patient.fullName : 'Patient',
        ward: ward,
        bedNumber: bed,
        admittingDoctor: doctor,
        admittingDiagnosis: diagnosis,
        initialDoctorNote: note
      });

      overlay.remove();
      showToast(`Admitted ${patient?.fullName || 'Patient'} to ${ward} (${bed})`, 'success');
      this.render();
    });
  }

  // ==========================================
  // WARD / BED TRANSFER MODAL (वार्ड ट्रांसफर)
  // ==========================================
  openTransferModal(admissionId) {
    const adm = (hospitalStore.clinicalData.admissions || []).find(a => a.id === admissionId);
    if (!adm) return;

    const wards = hospitalStore.getStandardWards();

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-dialog" style="max-width: 540px;">
        <div class="modal-header">
          <div>
            <h3 style="font-size: 16px; font-weight: 700; color: var(--text-main); margin: 0;">Transfer Ward & Bed (वार्ड / बेड स्थानांतरण)</h3>
            <p style="font-size: 11.5px; color: var(--text-muted); margin: 2px 0 0 0;">Patient: <strong>${adm.memberName}</strong> (${formatHealthId(adm.healthId)})</p>
          </div>
          <button type="button" class="btn btn-sm btn-ghost modal-close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <form id="transfer-ward-form">
          <div class="modal-body" style="display: flex; flex-direction: column; gap: 14px;">
            <!-- Current Location Badge -->
            <div style="background: #f8fafc; border: 1px solid var(--border-color); border-radius: 8px; padding: 10px 14px; font-size: 12.5px; display: flex; align-items: center; justify-content: space-between;">
              <span style="color: var(--text-muted);">Current Placement:</span>
              <span style="font-weight: 700; color: var(--color-primary);">${adm.ward} • Bed ${adm.bedNumber}</span>
            </div>

            <!-- Destination Ward & Bed -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div class="form-group">
                <label class="form-label" style="font-weight: 600;">Transfer to Ward (नया वार्ड) *</label>
                <select id="trf-ward-select" class="form-select" required>
                  ${wards.map(w => `<option value="${w.name}" ${w.name === adm.ward ? 'selected' : ''}>${w.name}</option>`).join('')}
                </select>
              </div>

              <div class="form-group">
                <label class="form-label" style="font-weight: 600;">Transfer to Bed (नया बेड) *</label>
                <select id="trf-bed-select" class="form-select" required>
                  ${wards[0].beds.map(b => `<option value="${b}">${b}</option>`).join('')}
                </select>
              </div>
            </div>

            <!-- Clinical Reason for Transfer -->
            <div class="form-group">
              <label class="form-label" style="font-weight: 600;">Clinical Reason for Transfer (स्थानांतरण का कारण) *</label>
              <select id="trf-reason-select" class="form-select" required>
                <option value="Patient stabilized: Shifting from Emergency/Casualty to General Ward">Patient stabilized: Shifting from Casualty to Ward</option>
                <option value="Critical escalation: Shifting from Ward to ICU">Critical escalation: Shifting from Ward to ICU</option>
                <option value="Post-stabilization stepdown: Shifting from ICU to HDU / Ward">Post-stabilization stepdown: Shifting from ICU to Ward</option>
                <option value="Patient requested upgrade to Private Room">Patient requested upgrade to Private Room</option>
                <option value="Infection isolation requirement">Infection isolation requirement</option>
                <option value="Other clinical transfer">Other clinical transfer</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label" style="font-weight: 600;">Doctor / Handover Notes</label>
              <textarea id="trf-doctor-note" class="form-textarea" rows="2" placeholder="Vitals stable upon transfer. Nursing telemetry handover completed."></textarea>
            </div>
          </div>

          <div class="modal-footer" style="display: flex; justify-content: flex-end; gap: 10px;">
            <button type="button" class="btn btn-secondary modal-close">Cancel</button>
            <button type="submit" class="btn btn-primary" style="font-weight: 700;">Execute Ward Transfer →</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(overlay);

    const wardSelect = overlay.querySelector('#trf-ward-select');
    const bedSelect = overlay.querySelector('#trf-bed-select');

    // Populate initial beds
    const currentSelectedWard = wards.find(w => w.name === wardSelect.value) || wards[0];
    bedSelect.innerHTML = currentSelectedWard.beds.map(b => `<option value="${b}">${b}</option>`).join('');

    wardSelect.addEventListener('change', () => {
      const selected = wards.find(w => w.name === wardSelect.value) || wards[0];
      bedSelect.innerHTML = selected.beds.map(b => `<option value="${b}">${b}</option>`).join('');
    });

    overlay.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', () => overlay.remove());
    });

    overlay.querySelector('#transfer-ward-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const toWard = wardSelect.value;
      const toBed = bedSelect.value;
      const reason = overlay.querySelector('#trf-reason-select').value;
      const note = overlay.querySelector('#trf-doctor-note').value;

      hospitalStore.transferWard({
        admissionId: admissionId,
        toWard: toWard,
        toBed: toBed,
        reason: reason,
        doctorNote: note
      });

      overlay.remove();
      showToast(`Transferred ${adm.memberName} to ${toWard} (${toBed})`, 'success');
      this.render();
    });
  }

  // ==========================================
  // DOCTOR ROUND NOTE MODAL
  // ==========================================
  openRoundModal(admissionId) {
    const adm = (hospitalStore.clinicalData.admissions || []).find(a => a.id === admissionId);
    if (!adm) return;

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-dialog" style="max-width: 520px;">
        <div class="modal-header">
          <div>
            <h3 style="font-size: 16px; font-weight: 700; color: var(--text-main); margin: 0;">Add Daily Ward Round Note (दैनिक राउंड)</h3>
            <p style="font-size: 11.5px; color: var(--text-muted); margin: 2px 0 0 0;">${adm.memberName} • ${adm.ward} (Bed ${adm.bedNumber})</p>
          </div>
          <button type="button" class="btn btn-sm btn-ghost modal-close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <form id="round-note-form">
          <div class="modal-body" style="display: flex; flex-direction: column; gap: 14px;">
            <div class="form-group">
              <label class="form-label" style="font-weight: 600;">Doctor's Clinical Observations & Progress *</label>
              <textarea id="round-note-text" class="form-textarea" rows="3" placeholder="Patient afebrile. Abdominal pain subsiding. Bowel sounds present. Continue IV antibiotics." required></textarea>
            </div>

            <div class="form-group">
              <label class="form-label" style="font-weight: 600;">Nursing / Diet / Medication Directives</label>
              <input type="text" id="round-nurse-text" class="form-input" placeholder="e.g. Start soft bland diet, encourage oral fluid intake 2L/day" />
            </div>
          </div>

          <div class="modal-footer" style="display: flex; justify-content: flex-end; gap: 10px;">
            <button type="button" class="btn btn-secondary modal-close">Cancel</button>
            <button type="submit" class="btn btn-primary" style="font-weight: 700;">Save Round Note →</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', () => overlay.remove());
    });

    overlay.querySelector('#round-note-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const docNote = overlay.querySelector('#round-note-text').value;
      const nurseNote = overlay.querySelector('#round-nurse-text').value;

      hospitalStore.addAdmissionRoundWithMAR(admissionId, {
        doctorNote: docNote,
        nurseNote: nurseNote
      });

      overlay.remove();
      showToast('Daily round note recorded successfully', 'success');
      this.render();
    });
  }

  // ==========================================
  // DISCHARGE PATIENT MODAL
  // ==========================================
  openDischargeModal(admissionId) {
    const adm = (hospitalStore.clinicalData.admissions || []).find(a => a.id === admissionId);
    if (!adm) return;

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-dialog" style="max-width: 580px;">
        <div class="modal-header">
          <div>
            <h3 style="font-size: 16px; font-weight: 700; color: var(--text-main); margin: 0;">Discharge Patient (मरीज डिस्चार्ज एवं छुट्टी)</h3>
            <p style="font-size: 11.5px; color: var(--text-muted); margin: 2px 0 0 0;">${adm.memberName} (${formatHealthId(adm.healthId)})</p>
          </div>
          <button type="button" class="btn btn-sm btn-ghost modal-close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <form id="discharge-form">
          <div class="modal-body" style="display: flex; flex-direction: column; gap: 14px;">
            <div class="form-group">
              <label class="form-label" style="font-weight: 600;">Discharge Condition / Outcome *</label>
              <select id="dis-condition-select" class="form-select" required>
                <option value="Discharged Stable / Cured">Discharged Stable / Cured (रोगमुक्त / स्थिर)</option>
                <option value="Relieved / Improved">Relieved / Improved (सुधार सहित)</option>
                <option value="Referred to Higher Medical Center">Referred to Higher Medical Center (उच्च केंद्र रेफर)</option>
                <option value="LAMA (Left Against Medical Advice)">LAMA (मरीज की स्वेच्छा से छुट्टी)</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label" style="font-weight: 600;">Final Clinical Diagnosis (अंतिम निदान) *</label>
              <input type="text" id="dis-diagnosis" class="form-input" value="${adm.admittingDiagnosis}" required />
            </div>

            <div class="form-group">
              <label class="form-label" style="font-weight: 600;">Hospital Course Summary (अस्पताल में उपचार सारांश)</label>
              <textarea id="dis-summary" class="form-textarea" rows="2" placeholder="Patient admitted with acute complaints. Successfully managed with IV fluids, antibiotics, and clinical monitoring. Hemodynamically stable at discharge."></textarea>
            </div>

            <div class="form-group">
              <label class="form-label" style="font-weight: 600;">Discharge Advice & Follow-Up (डिस्चार्ज सलाह एवं अगली मुलाकात)</label>
              <textarea id="dis-advice" class="form-textarea" rows="2" placeholder="Continue oral medications for 5 days. High protein diet. Follow-up in OPD after 7 days or SOS in emergency."></textarea>
            </div>
          </div>

          <div class="modal-footer" style="display: flex; justify-content: flex-end; gap: 10px;">
            <button type="button" class="btn btn-secondary modal-close">Cancel</button>
            <button type="submit" class="btn btn-primary" style="font-weight: 700; background: #dc2626; border-color: #dc2626;">Complete Discharge & Issue Summary →</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', () => overlay.remove());
    });

    overlay.querySelector('#discharge-form').addEventListener('submit', (e) => {
      e.preventDefault();
      const finalDx = overlay.querySelector('#dis-diagnosis').value;
      const summary = overlay.querySelector('#dis-summary').value;
      const advice = overlay.querySelector('#dis-advice').value;

      hospitalStore.dischargePatient(admissionId, {
        finalDiagnosis: finalDx,
        courseSummary: summary,
        dischargeAdvice: advice
      });

      overlay.remove();
      showToast(`${adm.memberName} discharged successfully. Summary archived.`, 'success');
      this.render();
    });
  }
}
