/**
 * HealthCard Hospital Portal: Inpatient Ward & Admissions Overview (IPD)
 * Displays active admissions across ICU, CCU, General Wards, and provides 1-click round access.
 */

import { hospitalStore } from '../../shared/storage.js';
import { formatDate } from '../../shared/utils/formatters.js';
import { formatHealthId } from '../../shared/utils/healthId.js';

export class AdmissionsView {
  constructor(container) {
    this.container = container;
  }

  render() {
    const admissions = hospitalStore.clinicalData.admissions || [];
    const activeList = admissions.filter(a => a.status === 'Active Inpatient');
    const pastList = admissions.filter(a => a.status !== 'Active Inpatient');

    this.container.innerHTML = `
      <div class="admissions-view">
        <div class="page-header">
          <div>
            <h1 class="page-title">Inpatient Ward Management (IPD)</h1>
            <p class="page-subtitle">Bed tracking, daily clinical rounds, nursing MAR, and discharge records</p>
          </div>
          <div style="display: flex; gap: 8px;">
            <a href="#intake" class="btn btn-primary">
              + Admit New Patient
            </a>
          </div>
        </div>

        <!-- Inpatient Capacity Strip -->
        <div class="stats-grid" style="margin-bottom: 24px;">
          <div class="stat-card">
            <div>
              <div class="stat-label">Active Inpatient Beds</div>
              <div class="stat-value">${activeList.length} Beds</div>
              <div style="font-size: 11.5px; color: #15803d; margin-top: 4px;">Bed Occupancy: 84%</div>
            </div>
            <div class="stat-icon blue">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M7 15h10"/><path d="M12 9v6"/></svg>
            </div>
          </div>

          <div class="stat-card">
            <div>
              <div class="stat-label">ICU & Critical Care</div>
              <div class="stat-value" style="color: #b45309;">2 Active</div>
              <div style="font-size: 11.5px; color: #b45309; margin-top: 4px;">Continuous Vital Telemetry</div>
            </div>
            <div class="stat-icon amber">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            </div>
          </div>

          <div class="stat-card">
            <div>
              <div class="stat-label">Discharged This Month</div>
              <div class="stat-value">${pastList.length + 12}</div>
              <div style="font-size: 11.5px; color: var(--text-muted); margin-top: 4px;">Certificates Generated</div>
            </div>
            <div class="stat-icon teal">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
          </div>
        </div>

        <!-- Active Inpatients Table -->
        <div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: 24px; box-shadow: var(--shadow-sm); margin-bottom: 24px;">
          <h3 style="font-size: 16px; font-weight: 700; color: var(--text-main); margin-bottom: 16px;">Currently Admitted Patients</h3>
          
          <table class="rx-table" style="font-size: 13px;">
            <thead>
              <tr>
                <th style="width: 20%;">Patient Name</th>
                <th style="width: 15%;">Ward & Bed</th>
                <th style="width: 25%;">Admitting Diagnosis</th>
                <th style="width: 15%;">Attending Doctor</th>
                <th style="width: 10%;">Admitted</th>
                <th style="width: 15%;">Action</th>
              </tr>
            </thead>
            <tbody>
              ${activeList.length === 0 ? `
                <tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 20px;">No patients currently admitted in ward.</td></tr>
              ` : activeList.map(adm => `
                <tr>
                  <td>
                    <div style="font-weight: 700; color: var(--text-main);">${adm.memberName}</div>
                    <div style="font-size: 11.5px; font-family: monospace; color: var(--text-muted);">${formatHealthId(adm.healthId)}</div>
                  </td>
                  <td>
                    <div style="font-weight: 600; color: var(--color-primary);">${adm.bedNumber}</div>
                    <div style="font-size: 11px; color: var(--text-muted);">${adm.ward}</div>
                  </td>
                  <td style="color: var(--text-secondary);">${adm.admittingDiagnosis}</td>
                  <td style="font-weight: 600;">${adm.admittingDoctor}</td>
                  <td style="font-size: 12px; color: var(--text-muted);">${formatDate(adm.admittedAt)}</td>
                  <td>
                    <a href="#patient?id=${(adm.healthId || '').replace(/\s+/g, '')}" class="btn btn-sm btn-primary">
                      Open Ward Rounds
                    </a>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- Historical Admissions -->
        <div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: 24px; box-shadow: var(--shadow-sm);">
          <h3 style="font-size: 16px; font-weight: 700; color: var(--text-main); margin-bottom: 16px;">Discharged Inpatient Archive</h3>
          <table class="rx-table" style="font-size: 13px;">
            <thead>
              <tr>
                <th>Patient</th>
                <th>Final Diagnosis</th>
                <th>Hospital Stay</th>
                <th>Attending Doctor</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              ${pastList.map(adm => `
                <tr>
                  <td>
                    <div style="font-weight: 700; color: var(--text-main);">${adm.memberName}</div>
                    <div style="font-size: 11.5px; font-family: monospace; color: var(--text-muted);">${formatHealthId(adm.healthId)}</div>
                  </td>
                  <td>${adm.finalDiagnosis || adm.admittingDiagnosis}</td>
                  <td style="font-size: 12px; color: var(--text-muted);">${formatDate(adm.admittedAt)} → ${formatDate(adm.dischargedAt)}</td>
                  <td>${adm.admittingDoctor}</td>
                  <td><span class="badge badge-active">Discharged</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }
}
