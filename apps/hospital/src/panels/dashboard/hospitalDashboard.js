/**
 * HealthCard Hospital Portal — Main Dashboard & Rapid Clinical Workbench
 * Provides fast 1-click access to OPD Prescriptions, physical paper scan uploads,
 * IPD Bed Admissions & MAR trackers, universal search, and document scanning.
 */

import { hospitalStore } from '../../shared/storage.js';
import { formatDate, calculateAge, timeAgo } from '../../shared/utils/formatters.js';
import { formatHealthId } from '../../shared/utils/healthId.js';
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
    const labResults = hospitalStore.clinicalData.labResults || [];
    const departments = hospitalStore.getDepartments();

    this.container.innerHTML = `
      <div class="dashboard-view">
        <!-- Top Institutional Welcome Bar -->
        <div class="page-header" style="margin-bottom: 16px;">
          <div>
            <h1 class="page-title">Hospital Clinical Workbench</h1>
            <p class="page-subtitle">AIIMS New Delhi • National Health Authority Verified Provider</p>
          </div>
          <div style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
            <button type="button" class="btn btn-secondary" id="btn-open-universal-scanner">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
              🖨️ Scan / Upload Document
            </button>
            <a href="#patient?id=7483916251" class="btn btn-primary" id="btn-quick-new-opd">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 5v14M5 12h14"/></svg>
              + Fast OPD Prescription
            </a>
          </div>
        </div>

        <!-- Universal Patient Card Lookup & Intake Bar -->
        <div style="background: #ffffff; border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: 18px 24px; margin-bottom: 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); display: flex; align-items: center; justify-content: space-between; gap: 20px; flex-wrap: wrap;">
          <div style="display: flex; align-items: center; gap: 14px; flex: 1; min-width: 280px;">
            <div style="width: 42px; height: 42px; background: var(--color-primary-light); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; color: var(--color-primary); flex-shrink: 0;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            </div>
            <div>
              <div style="font-size: 14px; font-weight: 700; color: var(--text-main);">Rapid Patient Lookup & HealthCard Access</div>
              <div style="font-size: 12px; color: var(--text-muted);">Enter 10-Digit Health ID (e.g. 74839 16251) or Registered Mobile Number</div>
            </div>
          </div>

          <form id="dashboard-search-form" style="display: flex; gap: 8px; flex: 1; max-width: 520px; width: 100%;">
            <input type="text" id="quick-search-input" class="form-input font-mono" placeholder="74839 16251 or 9876543210" style="font-size: 14px; font-weight: 600;" />
            <button type="submit" class="btn btn-primary" style="padding: 0 20px; white-space: nowrap;">
              Open Chart
            </button>
            <button type="button" class="btn btn-secondary" id="btn-scan-qr-modal" title="Scan Patient Card QR" style="white-space: nowrap;">
              📷 Scan QR
            </button>
          </form>
        </div>

        <!-- FAST CLINICAL ACTION HUB (Item 1 & 3: Easy to use for real hospital staff) -->
        <div class="fast-action-grid">
          <!-- Action 1: Fast OPD Prescriptions & Scans -->
          <div class="fast-action-card card-opd">
            <div>
              <div class="fast-card-header">
                <div class="fast-card-icon opd">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                </div>
                <div>
                  <div class="fast-card-title">Fast OPD Prescription</div>
                  <div class="fast-card-desc">Issue e-prescriptions or upload scanned paper slips from printer directly to HealthCard.</div>
                </div>
              </div>
            </div>

            <div class="fast-card-actions">
              <a href="#patient?id=7483916251" class="btn btn-sm btn-primary">
                + Write Digital Rx
              </a>
              <button type="button" class="btn btn-sm btn-secondary btn-fast-scan-opd">
                🖨️ Upload / Scan Slip
              </button>
            </div>
          </div>

          <!-- Action 2: Fast Inpatient IPD & MAR Doses -->
          <div class="fast-action-card card-ipd">
            <div>
              <div class="fast-card-header">
                <div class="fast-card-icon ipd">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M7 15h10"/><path d="M12 9v6"/></svg>
                </div>
                <div>
                  <div class="fast-card-title">Inpatient (IPD) & MAR</div>
                  <div class="fast-card-desc">Admit to ward beds, record daily clinical procedures, and administer medication doses.</div>
                </div>
              </div>
            </div>

            <div class="fast-card-actions">
              <a href="#admissions" class="btn btn-sm btn-primary">
                + Inpatient Bed Roster
              </a>
              <button type="button" class="btn btn-sm btn-secondary btn-fast-ipd-mar">
                💉 Log Daily Procedures & Doses
              </button>
            </div>
          </div>

          <!-- Action 3: Dedicated Physical Document Scanner -->
          <div class="fast-action-card card-scan">
            <div>
              <div class="fast-card-header">
                <div class="fast-card-icon scan">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                </div>
                <div>
                  <div class="fast-card-title">Document & Test Scanner</div>
                  <div class="fast-card-desc">Upload printer scanner outputs, lab PDFs, X-Rays, or snap live document photos.</div>
                </div>
              </div>
            </div>

            <div class="fast-card-actions">
              <button type="button" class="btn btn-sm btn-primary btn-fast-open-scanner">
                🖨️ Launch Scanner Tool
              </button>
            </div>
          </div>

          <!-- Action 4: Hospital Doctors & Tariffs -->
          <div class="fast-action-card card-staff">
            <div>
              <div class="fast-card-header">
                <div class="fast-card-icon staff">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                </div>
                <div>
                  <div class="fast-card-title">Doctors & Tariffs</div>
                  <div class="fast-card-desc">Manage registered doctors, OPD rooms, consultation hours, and clinical service tariffs.</div>
                </div>
              </div>
            </div>

            <div class="fast-card-actions">
              <a href="#staff" class="btn btn-sm btn-primary">
                👨‍⚕️ Doctors Directory
              </a>
              <a href="#services" class="btn btn-sm btn-secondary">
                🏷️ Tariffs & Services
              </a>
            </div>
          </div>
        </div>

        <!-- Main Workbench Roster & Queues -->
        <div style="display: grid; grid-template-columns: 1.3fr 1fr; gap: 24px;">
          <!-- Left Column: Active Patient Registry & Today's OPD Queue -->
          <div style="background: #ffffff; border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; border-bottom: 1px solid var(--border-color); padding-bottom: 12px;">
              <div>
                <h3 style="font-size: 16px; font-weight: 700; color: var(--text-main); margin: 0;">Today's OPD Patient Queue & Triage</h3>
                <p style="font-size: 12px; color: var(--text-muted); margin: 2px 0 0 0;">Fast 1-click prescription writing and paper slip scanning</p>
              </div>
              <span class="badge badge-active">${patients.length} Registered</span>
            </div>

            <div style="display: flex; flex-direction: column; gap: 12px;">
              ${patients.length === 0 ? `
                <div style="text-align: center; padding: 30px; color: var(--text-muted);">
                  No patient records found in registry.
                </div>
              ` : patients.map(p => {
                const cleanId = (p.healthId || '').replace(/\s+/g, '');
                return `
                  <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; background: #f8fafc; border-radius: var(--radius-lg); border: 1px solid var(--border-color); transition: all 0.15s ease;" onmouseover="this.style.borderColor='#94a3b8'" onmouseout="this.style.borderColor='var(--border-color)'">
                    <div style="display: flex; align-items: center; gap: 12px;">
                      <img src="${p.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}" style="width: 44px; height: 44px; border-radius: var(--radius-md); object-fit: cover; border: 1px solid var(--border-color);" alt="${p.fullName}" />
                      <div>
                        <div style="display: flex; align-items: center; gap: 8px;">
                          <span style="font-weight: 700; font-size: 14px; color: var(--text-main);">${p.fullName}</span>
                          <span class="blood-group-tag">${p.bloodGroup || 'O+'}</span>
                        </div>
                        <div style="display: flex; align-items: center; gap: 8px; margin-top: 3px; font-size: 12px; color: var(--text-muted);">
                          <span class="font-mono" style="font-weight: 600; color: var(--text-secondary);">${formatHealthId(p.healthId)}</span>
                          <span>•</span>
                          <span>${calculateAge(p.dob)}</span>
                          <span>•</span>
                          <span>${p.gender || 'Male'}</span>
                        </div>
                      </div>
                    </div>

                    <div style="display: flex; align-items: center; gap: 6px;">
                      <a href="#patient?id=${cleanId}" class="btn btn-sm btn-primary" title="Write Digital OPD Prescription">
                        📝 OPD Rx
                      </a>
                      <button type="button" class="btn btn-sm btn-secondary btn-row-scan-slip" data-patientid="${cleanId}" title="Scan or Upload Scanned Paper Slip for ${p.fullName}">
                        🖨️ Scan Slip
                      </button>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Right Column: Active Inpatient Wards (IPD) Summary -->
          <div style="display: flex; flex-direction: column; gap: 24px;">
            <div style="background: #ffffff; border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; border-bottom: 1px solid var(--border-color); padding-bottom: 10px;">
                <div>
                  <h3 style="font-size: 15px; font-weight: 700; color: var(--text-main); margin: 0;">Active Inpatients (IPD Wards)</h3>
                  <p style="font-size: 11.5px; color: var(--text-muted); margin: 2px 0 0 0;">General & ICU Bed Admissions with MAR</p>
                </div>
                <a href="#admissions" class="btn btn-sm btn-outline">+ Bed Roster</a>
              </div>

              <div style="display: flex; flex-direction: column; gap: 10px;">
                ${admissions.length === 0 ? `
                  <div style="text-align: center; padding: 20px; color: var(--text-muted); font-size: 12.5px;">No active inpatient admissions.</div>
                ` : admissions.map(adm => `
                  <div style="padding: 12px; background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                      <div>
                        <div style="font-weight: 700; font-size: 13.5px; color: #0369a1;">${adm.memberName || adm.patientName || 'Admitted Patient'}</div>
                        <div style="font-size: 12px; color: #0284c7; margin-top: 2px;">
                          <strong>${adm.ward || 'General Ward'}</strong> • Bed ${adm.bedNumber || adm.bed || '12'}
                        </div>
                      </div>
                      <span class="badge" style="background: #e0f2fe; color: #0369a1; font-weight: 700;">${adm.status || 'Active Inpatient'}</span>
                    </div>
                    <div style="font-size: 11.5px; color: var(--text-secondary); margin-top: 6px;">
                      Attending: ${adm.admittingDoctor || adm.attendingDoctor || 'Dr. Vikram Sethi'} • Dx: ${adm.admittingDiagnosis || adm.primaryDiagnosis || 'Observation'}
                    </div>
                    <div style="margin-top: 8px; display: flex; justify-content: flex-end;">
                      <a href="#admissions" class="btn btn-sm btn-secondary" style="font-size: 11.5px; padding: 3px 8px;">
                        💉 View Procedures & MAR Doses →
                      </a>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Clinical Departments Overview -->
            <div style="background: #ffffff; border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
              <h3 style="font-size: 15px; font-weight: 700; color: var(--text-main); margin-bottom: 12px;">Clinical Departments Status</h3>
              <div style="display: flex; flex-direction: column; gap: 8px;">
                ${departments.map(dept => `
                  <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px; border-radius: var(--radius-md); background: #fafbfc; border: 1px solid var(--border-subtle);">
                    <div>
                      <div style="font-weight: 600; font-size: 13px; color: var(--text-main);">${dept.name}</div>
                      <div style="font-size: 11.5px; color: var(--text-muted);">${dept.activeDoctors} Doctors On Duty</div>
                    </div>
                    <span class="badge badge-blue">${dept.waitingPatients} in queue</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    // 1. Universal Search Form
    const form = this.container.querySelector('#dashboard-search-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = this.container.querySelector('#quick-search-input');
        const query = (input?.value || '').trim();
        if (query) {
          const clean = query.replace(/\s+/g, '');
          window.location.hash = `#patient?id=${encodeURIComponent(clean)}`;
        }
      });
    }

    // 2. Open Scanner modal from top banner
    this.container.querySelector('#btn-open-universal-scanner')?.addEventListener('click', () => {
      new DocumentScannerModal().open();
    });

    // 3. Fast Scan button on OPD card
    this.container.querySelector('.btn-fast-scan-opd')?.addEventListener('click', () => {
      new DocumentScannerModal({ category: 'OPD Doctor Prescription Slip' }).open();
    });

    // 4. Fast Scan button on Scanner card
    this.container.querySelector('.btn-fast-open-scanner')?.addEventListener('click', () => {
      new DocumentScannerModal().open();
    });

    // 5. Fast IPD MAR button
    this.container.querySelector('.btn-fast-ipd-mar')?.addEventListener('click', () => {
      window.location.hash = '#admissions';
    });

    // 6. Fast Scan Slip on each patient row
    this.container.querySelectorAll('.btn-row-scan-slip').forEach(btn => {
      btn.addEventListener('click', () => {
        const patientId = btn.getAttribute('data-patientid');
        new DocumentScannerModal({
          patientId: patientId,
          category: 'OPD Doctor Prescription Slip'
        }).open();
      });
    });

    // 7. QR Scan trigger
    this.container.querySelector('#btn-scan-qr-modal')?.addEventListener('click', () => {
      showToast('Simulating Card QR Camera Scan...', 'info');
      setTimeout(() => {
        window.location.hash = '#patient?id=7483916251';
      }, 500);
    });
  }
}
