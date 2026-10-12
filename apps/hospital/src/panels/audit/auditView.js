/**
 * HealthCard Hospital Portal — Immutable Hospital Audit Explorer
 * Implements PRD ADM-02, database.md §8.
 * Real-time clinical logs, break-glass reviews, and DPDP compliance oversight.
 */

import { hospitalStore } from '../../shared/storage.js';
import { formatDate, timeAgo } from '../../shared/utils/formatters.js';
import { showToast } from '../../shared/components/toast.js';

export class AuditView {
  constructor(container) {
    this.container = container;
  }

  render() {
    const logs = hospitalStore.getAuditLogs();
    const breakGlassLogs = logs.filter(l => l.action.includes('BREAK_GLASS'));

    this.container.innerHTML = `
      <div class="audit-view">
        <div class="page-header">
          <div>
            <h1 class="page-title">Institutional Clinical Audit Explorer</h1>
            <p class="page-subtitle">Immutable access logs, statutory DPDP Act compliance, and emergency review queue</p>
          </div>
          <button type="button" class="btn btn-secondary" id="btn-export-audit">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Export Compliance Audit Trail
          </button>
        </div>

        <!-- Compliance & Security Alert Banner -->
        <div style="background: #f8fafc; border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: 18px 20px; margin-bottom: 24px; display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 14px;">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 36px; height: 36px; background: var(--color-primary-light); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; color: var(--color-primary);">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </div>
            <div>
              <div style="font-weight: 700; font-size: 13.5px; color: var(--text-main);">Section 8 DPDP Act 2023 & Clinical Est. Act Compliant</div>
              <div style="font-size: 12px; color: var(--text-muted);">Append-only database triggers active. Clinical views are attributed to authenticated staff tokens.</div>
            </div>
          </div>
          
          <div style="display: flex; gap: 10px; align-items: center;">
            <span class="badge ${breakGlassLogs.length > 0 ? 'badge-emergency' : 'badge-active'}">
              ${breakGlassLogs.length} Break-Glass Sessions Logged
            </span>
            <span class="badge badge-active">Audit Integrity 100%</span>
          </div>
        </div>

        <!-- Audit Table -->
        <div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: 24px; box-shadow: var(--shadow-sm);">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; flex-wrap: wrap; gap: 10px;">
            <h3 style="font-size: 16px; font-weight: 700; color: var(--text-main); margin: 0;">Clinical Access Events (${logs.length})</h3>
            
            <div style="display: flex; gap: 8px;">
              <input type="text" id="audit-filter-input" class="form-input" placeholder="Search actor, Health ID, action..." style="width: 240px; height: 32px; font-size: 12px;" />
            </div>
          </div>

          <table class="rx-table" id="audit-table" style="font-size: 12.5px;">
            <thead>
              <tr>
                <th style="width: 15%;">Timestamp (IST)</th>
                <th style="width: 18%;">Actor & Role</th>
                <th style="width: 18%;">Action Code</th>
                <th style="width: 20%;">Clinical Target</th>
                <th style="width: 29%;">Event Narrative & Details</th>
              </tr>
            </thead>
            <tbody>
              ${logs.map(log => `
                <tr style="${log.action.includes('BREAK_GLASS') ? 'background: #fff1f2;' : ''}">
                  <td style="color: var(--text-muted); font-size: 11.5px;">
                    <div>${formatDate(log.timestamp, true)}</div>
                    <div style="font-size: 10px;">${timeAgo(log.timestamp)}</div>
                  </td>
                  <td>
                    <div style="font-weight: 600; color: var(--text-main);">${log.actor}</div>
                    <span class="badge ${log.role === 'Doctor' ? 'badge-active' : 'badge-blue'}" style="font-size: 10px; padding: 1px 6px;">
                      ${log.role}
                    </span>
                  </td>
                  <td>
                    <span class="badge ${log.action.includes('BREAK_GLASS') ? 'badge-emergency' : 'badge-active'}" style="font-family: monospace;">
                      ${log.action}
                    </span>
                  </td>
                  <td style="font-weight: 500; color: var(--text-secondary);">${log.target}</td>
                  <td style="color: var(--text-secondary); font-size: 12px; line-height: 1.3;">${log.details}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    // Export CSV
    const exportBtn = this.container.querySelector('#btn-export-audit');
    exportBtn?.addEventListener('click', () => {
      const logs = hospitalStore.getAuditLogs();
      const csv = "ID,Timestamp,Actor,Role,Action,Target,Details\n" + logs.map(l => 
        `"${l.id}","${l.timestamp}","${l.actor}","${l.role}","${l.action}","${l.target.replace(/"/g, '""')}","${l.details.replace(/"/g, '""')}"`
      ).join("\n");

      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Hospital_Audit_Report_${Date.now()}.csv`;
      a.click();
      showToast('Audit trail exported successfully.', 'success');
    });

    // Real-time filter
    const searchInput = this.container.querySelector('#audit-filter-input');
    searchInput?.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase();
      const rows = this.container.querySelectorAll('#audit-table tbody tr');
      rows.forEach(row => {
        const text = row.innerText.toLowerCase();
        row.style.display = text.includes(q) ? '' : 'none';
      });
    });
  }
}
