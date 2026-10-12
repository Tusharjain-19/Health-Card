/**
 * HealthCard Hospital Portal: Centralized Diagnostic Labs Board
 * Tracks pending investigations, ordered tests, structured lab results, and validation.
 */

import { hospitalStore } from '../../shared/storage.js';
import { formatDate } from '../../shared/utils/formatters.js';
import { formatHealthId } from '../../shared/utils/healthId.js';

export class LabsView {
  constructor(container) {
    this.container = container;
  }

  render() {
    const labResults = hospitalStore.clinicalData.labResults || [];

    this.container.innerHTML = `
      <div class="labs-view">
        <div class="page-header">
          <div>
            <h1 class="page-title">Diagnostic Investigations & Laboratory</h1>
            <p class="page-subtitle">Central diagnostic board, specimen queue, and validated test reporting</p>
          </div>
          <div style="display: flex; gap: 8px;">
            <a href="#intake" class="btn btn-primary">
              Order New Investigation
            </a>
          </div>
        </div>

        <!-- Investigation Pipeline Summary -->
        <div class="stats-grid" style="margin-bottom: 24px;">
          <div class="stat-card">
            <div>
              <div class="stat-label">Pending Specimens</div>
              <div class="stat-value">6</div>
              <div style="font-size: 11.5px; color: #b45309; margin-top: 4px;">Phlebotomy & Sample Queue</div>
            </div>
            <div class="stat-icon amber">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 2v7.31"/><path d="M14 2v7.31"/><path d="M8.5 2h7"/><path d="M14 9.3a6.5 6.5 0 1 1-4 0"/></svg>
            </div>
          </div>

          <div class="stat-card">
            <div>
              <div class="stat-label">Results Ready for Review</div>
              <div class="stat-value">${labResults.length}</div>
              <div style="font-size: 11.5px; color: #15803d; margin-top: 4px;">Clinician Verification Done</div>
            </div>
            <div class="stat-icon teal">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
          </div>

          <div class="stat-card">
            <div>
              <div class="stat-label">Critical Alerts (C)</div>
              <div class="stat-value" style="color: #dc2626;">0</div>
              <div style="font-size: 11.5px; color: var(--text-muted); margin-top: 4px;">Immediate Physician Escalation</div>
            </div>
            <div class="stat-icon red">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/></svg>
            </div>
          </div>
        </div>

        <!-- Master Lab Results Table -->
        <div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: 24px; box-shadow: var(--shadow-sm);">
          <h3 style="font-size: 16px; font-weight: 700; color: var(--text-main); margin-bottom: 16px;">Validated Laboratory Investigations</h3>
          
          <table class="rx-table" style="font-size: 13px;">
            <thead>
              <tr>
                <th style="width: 18%;">Patient</th>
                <th style="width: 25%;">Test Name & Category</th>
                <th style="width: 15%;">Result Value</th>
                <th style="width: 15%;">Reference Range</th>
                <th style="width: 12%;">Status Flag</th>
                <th style="width: 15%;">Verified By</th>
              </tr>
            </thead>
            <tbody>
              ${labResults.map(lab => `
                <tr>
                  <td>
                    <div style="font-weight: 700; color: var(--text-main);">
                      <a href="#patient?id=${(lab.healthId || '').replace(/\s+/g, '')}" style="color: var(--color-primary);">
                        ${lab.healthId}
                      </a>
                    </div>
                  </td>
                  <td>
                    <div style="font-weight: 600; color: var(--text-main);">${lab.testName}</div>
                    <div style="font-size: 11px; color: var(--text-muted);">${lab.category || 'Clinical Pathology'}</div>
                  </td>
                  <td>
                    <strong style="color: ${lab.flag === 'H' ? '#b45309' : lab.flag === 'C' ? '#dc2626' : '#0f172a'};">${lab.valueText} ${lab.unit}</strong>
                  </td>
                  <td style="color: var(--text-muted);">${lab.refLow} – ${lab.refHigh} ${lab.unit}</td>
                  <td>
                    ${lab.flag === 'H' ? '<span class="badge badge-pending">HIGH (H)</span>' : lab.flag === 'C' ? '<span class="badge badge-emergency">CRITICAL (C)</span>' : '<span class="badge badge-active">NORMAL (N)</span>'}
                  </td>
                  <td>
                    <div style="font-size: 12px; font-weight: 600;">${lab.verifiedBy}</div>
                    <div style="font-size: 11px; color: var(--text-muted);">${formatDate(lab.reportedAt)}</div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }
}
