/**
 * HealthCard Hospital Portal: Simplified Dashboard
 * Clean, task-focused home page for real hospital staff.
 * Quick actions: Scan QR, Search Patient, Write Rx, Admit, Upload Scan
 */

import { hospitalStore } from '../../shared/storage.js';
import { formatDate, calculateAge, timeAgo } from '../../shared/utils/formatters.js';
import { formatHealthId } from '../../shared/utils/healthId.js';
import { QRScannerModal } from './qrScannerModal.js';
import { DocumentScannerModal } from './scannerModal.js';
import { showToast } from '../../shared/components/toast.js';

export class HospitalDashboard {
  constructor(container) {
    this.container = container;
  }

  render() {
    const patients = hospitalStore.getAllPatients();
    const activeStaff = hospitalStore.getCurrentStaff();
    const admissions = (hospitalStore.clinicalData.admissions || []).filter(a => a.status === 'Active Inpatient');
    const recentConsults = (hospitalStore.clinicalData.consultations || []).slice(0, 5);

    this.container.innerHTML = `
      <div class="dashboard-view">
        <!-- Welcome Strip -->
        <div style="margin-bottom: 24px;">
          <h1 class="page-title" style="margin-bottom: 4px;">Welcome, ${activeStaff.fullName.split(' ').slice(0, 2).join(' ')}</h1>
          <p class="page-subtitle">${activeStaff.department || 'General Medicine'} | ${new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <!-- Primary Action: Patient Search + QR Scan -->
        <div style="background: #ffffff; border: 1.5px solid var(--color-primary); border-radius: var(--radius-xl); padding: 20px 24px; margin-bottom: 24px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
          <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 14px;">
            <div style="width: 40px; height: 40px; background: var(--color-primary-light); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </div>
            <div>
              <div style="font-size: 15px; font-weight: 700; color: var(--text-main);">Find Patient</div>
              <div style="font-size: 12px; color: var(--text-muted);">Enter Health ID, mobile number, or scan the HealthCard QR code</div>
            </div>
          </div>

          <form id="dashboard-search-form" style="display: flex; gap: 8px;">
            <input type="text" id="quick-search-input" class="form-input font-mono" placeholder="Health ID (e.g. 74839 16251) or Mobile Number" style="flex: 1; font-size: 14px; font-weight: 600; padding: 10px 14px;" />
            <button type="submit" class="btn btn-primary" style="padding: 10px 20px; white-space: nowrap;">
              Open Chart
            </button>
            <button type="button" class="btn btn-secondary" id="btn-scan-qr" style="padding: 10px 16px; white-space: nowrap; display: inline-flex; align-items: center; gap: 6px;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              Scan QR
            </button>
          </form>
        </div>

        <!-- Quick Action Cards -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 24px;">
          <!-- Patient Desk & QR Scan -->
          <button type="button" class="quick-action-tile" id="btn-quick-desk">
            <div class="quick-tile-icon" style="background: #eff6ff; color: #1d4ed8;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <div class="quick-tile-label">Patient Desk & Scan</div>
          </button>

          <!-- Register Walk-In Patient -->
          <button type="button" class="quick-action-tile" id="btn-quick-register">
            <div class="quick-tile-icon" style="background: #ecfdf5; color: #059669;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            </div>
            <div class="quick-tile-label">New Walk-In Patient</div>
          </button>

          <!-- Upload / Scan Document -->
          <button type="button" class="quick-action-tile" id="btn-quick-upload">
            <div class="quick-tile-icon" style="background: #fef3c7; color: #b45309;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            </div>
            <div class="quick-tile-label">Upload Paper Slip</div>
          </button>

          <!-- Inpatient Wards (IPD) -->
          <button type="button" class="quick-action-tile" id="btn-quick-admit">
            <div class="quick-tile-icon" style="background: #f5f3ff; color: #7c3aed;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M7 15h10"/><path d="M12 9v6"/></svg>
            </div>
            <div class="quick-tile-label">Inpatient Wards (IPD)</div>
          </button>
        </div>

        <!-- Two Column Layout: Patient Queue + Active IPD -->
        <div style="display: grid; grid-template-columns: 1.4fr 1fr; gap: 20px;">
          <!-- Today's OPD Queue -->
          <div style="background: #ffffff; border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; padding-bottom: 10px; border-bottom: 1px solid var(--border-color);">
              <div>
                <h3 style="font-size: 15px; font-weight: 700; color: var(--text-main); margin: 0;">Today's Patients</h3>
                <p style="font-size: 11.5px; color: var(--text-muted); margin: 2px 0 0 0;">${patients.length} registered in system</p>
              </div>
              <a href="#intake" class="btn btn-sm btn-outline" style="display: inline-flex; align-items: center; gap: 4px;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 5v14M5 12h14"/></svg>
                New Patient
              </a>
            </div>

            <div style="display: flex; flex-direction: column; gap: 8px; max-height: 380px; overflow-y: auto;">
              ${patients.length === 0 ? `
                <div style="text-align: center; padding: 30px; color: var(--text-muted); font-size: 13px;">
                  No patients registered yet. Scan a HealthCard to begin.
                </div>
              ` : patients.map(p => {
                const cleanId = (p.healthId || '').replace(/\s+/g, '');
                return `
                  <div class="patient-row-card" data-pid="${cleanId}">
                    <div style="display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0;">
                      <img src="${p.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}" style="width: 40px; height: 40px; border-radius: 8px; object-fit: cover; border: 1px solid var(--border-color); flex-shrink: 0;" alt="${p.fullName}" />
                      <div style="min-width: 0;">
                        <div style="display: flex; align-items: center; gap: 6px;">
                          <span style="font-weight: 700; font-size: 13.5px; color: var(--text-main);">${p.fullName}</span>
                          <span class="blood-group-tag" style="font-size: 10px; padding: 1px 5px;">${p.bloodGroup || 'O+'}</span>
                        </div>
                        <div style="font-size: 11.5px; color: var(--text-muted); margin-top: 1px;">
                          <span class="font-mono" style="font-weight: 600;">${formatHealthId(p.healthId)}</span>
                          <span style="margin: 0 4px;">|</span>
                          <span>${calculateAge(p.dob)}</span>
                          <span style="margin: 0 4px;">|</span>
                          <span>${p.gender || 'Male'}</span>
                        </div>
                      </div>
                    </div>

                    <div style="display: flex; align-items: center; gap: 6px; flex-shrink: 0;">
                      <a href="#patient?id=${cleanId}" class="btn btn-sm btn-primary" title="Write Prescription" style="padding: 5px 10px; font-size: 11.5px;">
                        OPD Rx
                      </a>
                      <button type="button" class="btn btn-sm btn-secondary btn-row-upload" data-patientid="${cleanId}" title="Upload Scan" style="padding: 5px 10px; font-size: 11.5px;">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                        Upload
                      </button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Right Column: Active IPD + Recent Activity -->
          <div style="display: flex; flex-direction: column; gap: 16px;">
            <!-- Active Inpatient Summary -->
            <div style="background: #ffffff; border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: 18px; box-shadow: 0 1px 3px rgba(0,0,0,0.04);">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid var(--border-color);">
                <h3 style="font-size: 14px; font-weight: 700; color: var(--text-main); margin: 0;">Active Inpatients (IPD)</h3>
                <a href="#admissions" class="btn btn-sm btn-outline" style="font-size: 11px;">View All</a>
              </div>

              ${admissions.length === 0 ? `
                <div style="text-align: center; padding: 20px; color: var(--text-muted); font-size: 12.5px;">
                  No active inpatient admissions
                </div>
              ` : admissions.map(adm => `
                <div style="padding: 10px 12px; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; margin-bottom: 8px;">
                  <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                      <div style="font-weight: 700; font-size: 13px; color: #0369a1;">${adm.memberName || adm.patientName || 'Patient'}</div>
                      <div style="font-size: 11.5px; color: #0284c7; margin-top: 2px;">
                        ${adm.ward || 'General Ward'} | Bed ${adm.bedNumber || adm.bed || '12'}
                      </div>
                    </div>
                    <span class="badge" style="background: #e0f2fe; color: #0369a1; font-weight: 700; font-size: 10.5px;">${adm.status || 'Active'}</span>
                  </div>
                  <div style="font-size: 11px; color: var(--text-secondary); margin-top: 4px;">
                    Dr. ${adm.admittingDoctor || adm.attendingDoctor || 'Vikram Sethi'} | ${adm.admittingDiagnosis || adm.primaryDiagnosis || 'Under Observation'}
                  </div>
                </div>
              `).join('')}
            </div>

            <!-- Quick Stats -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
              <div style="background: #ffffff; border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 14px 16px; text-align: center;">
                <div style="font-size: 24px; font-weight: 800; color: var(--color-primary);">${patients.length}</div>
                <div style="font-size: 11.5px; color: var(--text-muted); font-weight: 600;">Registered Patients</div>
              </div>
              <div style="background: #ffffff; border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 14px 16px; text-align: center;">
                <div style="font-size: 24px; font-weight: 800; color: #0369a1;">${admissions.length}</div>
                <div style="font-size: 11.5px; color: var(--text-muted); font-weight: 600;">Active IPD Beds</div>
              </div>
              <div style="background: #ffffff; border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 14px 16px; text-align: center;">
                <div style="font-size: 24px; font-weight: 800; color: #059669;">${recentConsults.length}</div>
                <div style="font-size: 11.5px; color: var(--text-muted); font-weight: 600;">OPD Consultations</div>
              </div>
              <div style="background: #ffffff; border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 14px 16px; text-align: center;">
                <div style="font-size: 24px; font-weight: 800; color: #7c3aed;">${(hospitalStore.getDoctors() || []).length}</div>
                <div style="font-size: 11.5px; color: var(--text-muted); font-weight: 600;">Hospital Doctors</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    // Search form -> routes to Patient Desk for instant verified actions
    const form = this.container.querySelector('#dashboard-search-form');
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = this.container.querySelector('#quick-search-input');
      const query = (input?.value || '').trim();
      if (query) {
        window.location.hash = `#intake?q=${encodeURIComponent(query)}`;
      }
    });

    // Auto-format Health ID
    const searchInput = this.container.querySelector('#quick-search-input');
    searchInput?.addEventListener('input', (e) => {
      const raw = e.target.value.replace(/\D/g, '');
      if (raw.length <= 10 && /^\d+$/.test(e.target.value.replace(/\s/g, ''))) {
        e.target.value = raw.length > 5 ? `${raw.slice(0, 5)} ${raw.slice(5, 10)}` : raw;
      }
    });

    // QR Scanner button -> routes to Patient Desk with result
    this.container.querySelector('#btn-scan-qr')?.addEventListener('click', () => {
      new QRScannerModal({
        onResult: (result) => {
          window.location.hash = `#intake?q=${encodeURIComponent(result.patient.healthId)}`;
        }
      }).open();
    });

    // Quick Desk
    this.container.querySelector('#btn-quick-desk')?.addEventListener('click', () => {
      window.location.hash = '#intake';
    });

    // Quick Register
    this.container.querySelector('#btn-quick-register')?.addEventListener('click', () => {
      window.location.hash = '#intake?tab=register';
    });

    // Quick Upload
    this.container.querySelector('#btn-quick-upload')?.addEventListener('click', () => {
      new DocumentScannerModal({ category: 'OPD Doctor Prescription Slip' }).open();
    });

    // Quick Inpatient Wards (IPD)
    this.container.querySelector('#btn-quick-admit')?.addEventListener('click', () => {
      window.location.hash = '#admissions';
    });

    // Per-patient upload buttons
    this.container.querySelectorAll('.btn-row-upload').forEach(btn => {
      btn.addEventListener('click', () => {
        const patientId = btn.getAttribute('data-patientid');
        new DocumentScannerModal({
          patientId: patientId,
          category: 'OPD Doctor Prescription Slip'
        }).open();
      });
    });
  }
}
