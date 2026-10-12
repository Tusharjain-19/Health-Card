/**
 * HealthCard Hospital & Clinician Portal: Main Application Shell & Hash Router
 * Clean enterprise clinical architecture strictly adhering to PRD and design guidelines.
 * Features:
 * - Rectangular navigation buttons with border-radius (zero AI gimmickry)
 * - Multi-Computer LAN Workstation Connect & Synchronization
 * - Integrated Services & Tariffs catalog manager
 * - Doctor & Staff Credentials directory
 * - Outpatient & Inpatient workflows
 */

import { hospitalStore } from './shared/storage.js';
import { HospitalDashboard } from './panels/dashboard/hospitalDashboard.js';
import { IntakeView } from './panels/intake/intakeView.js';
import { PatientWorkspace } from './panels/patient/patientWorkspace.js';
import { AdmissionsView } from './panels/admissions/admissionsView.js';
import { ServicesView } from './panels/services/servicesView.js';
import { LabsView } from './panels/labs/labsView.js';
import { StaffView } from './panels/staff/staffView.js';
import { AuditView } from './panels/audit/auditView.js';
import { DEMO_HOSPITAL_STAFF } from './shared/data/demoData.js';
import { hospitalBackend } from './backend/apiClient.js';
import { showToast } from './shared/components/toast.js';

export class HospitalApp {
  constructor() {
    this.appContainer = document.getElementById('app');
    this.currentViewInstance = null;
    this.init();
  }

  init() {
    this.renderShell();
    this.bindGlobalEvents();
    this.handleRoute();
  }

  renderShell() {
    const activeStaff = hospitalStore.getCurrentStaff();

    this.appContainer.innerHTML = `
      <div class="hospital-app">
        <!-- Institutional Clinical Header (Uncluttered, No AI, Clean Rectangular Buttons) -->
        <header class="hospital-header">
          <a href="#dashboard" class="brand-wrapper">
            <div class="brand-emblem">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 2v20M2 12h20"/></svg>
            </div>
            <div>
              <div class="brand-title">HealthCard Hospital</div>
              <div class="brand-subtitle">AIIMS New Delhi • NABH Verified</div>
            </div>
          </a>

          <!-- Main Clinical Navigation Tabs -->
          <nav class="header-nav">
            <a href="#dashboard" class="nav-link" id="nav-dashboard">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              Dashboard
            </a>
            <a href="#intake" class="nav-link" id="nav-intake">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              Patient Desk & Scan
            </a>
            <a href="#patient?id=7483916251&tab=consultation" class="nav-link" id="nav-patient">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              OPD Prescriptions
            </a>
            <a href="#admissions" class="nav-link" id="nav-admissions">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M7 15h10"/><path d="M12 9v6"/></svg>
              Inpatient (IPD)
            </a>
            <a href="#staff" class="nav-link" id="nav-staff">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              Hospital Doctors
            </a>
            <a href="#services" class="nav-link" id="nav-services">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v12M6 12h12"/></svg>
              Services & Tariffs
            </a>
          </nav>

          <!-- Right Header Controls: Multi-PC Workstation Sync & Shift Persona -->
          <div class="header-actions">
            <!-- Multi-Computer LAN Workstation Connect -->
            <div id="btn-network-sync" class="network-sync-pill" title="Hospital LAN Synchronizer (Port 5000)">
              <span class="live-dot"></span>
              <span>LAN Live (5000)</span>
            </div>

            <!-- Active Shift Persona Chip -->
            <div class="persona-switcher" id="btn-persona-switcher" title="Click to Switch Clinician / Shift Persona">
              <img src="${activeStaff.avatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80'}" class="persona-avatar" alt="${activeStaff.fullName}" />
              <div class="persona-info">
                <div class="persona-name">${activeStaff.fullName.split(' ')[0]} ${activeStaff.fullName.split(' ')[1] || ''}</div>
                <div class="persona-role">${activeStaff.role.toUpperCase()} ▾</div>
              </div>
            </div>
          </div>
        </header>

        <!-- Main Workspace Container -->
        <main class="hospital-main" id="view-container"></main>
      </div>
    `;

    this.bindHeaderEvents();
  }

  bindHeaderEvents() {
    const switcher = this.appContainer.querySelector('#btn-persona-switcher');
    switcher?.addEventListener('click', () => {
      this.openShiftSwitcherModal();
    });

    const netSyncBtn = this.appContainer.querySelector('#btn-network-sync');
    netSyncBtn?.addEventListener('click', () => {
      this.openNetworkSyncModal();
    });
  }

  // ==========================================
  // MULTI-COMPUTER LAN SYNC MODAL (Item 4)
  // ==========================================
  async openNetworkSyncModal() {
    const netInfo = await hospitalBackend.getNetworkInfo();
    const currentBaseUrl = hospitalBackend.baseUrl;
    const currentHost = window.location.hostname || 'localhost';

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-dialog" style="max-width: 620px;">
        <div class="modal-header">
          <div>
            <h3 style="font-size: 16px; font-weight: 700; color: var(--text-main); margin: 0;">Hospital Multi-Workstation Synchronization</h3>
            <p style="font-size: 11.5px; color: var(--text-muted); margin: 2px 0 0 0;">Manage hospital portal access across multiple counter PCs on the local network</p>
          </div>
          <button type="button" class="btn btn-sm btn-ghost modal-close" title="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div class="modal-body">
          <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 14px; margin-bottom: 16px;">
            <div style="display: flex; align-items: center; gap: 8px; font-weight: 700; color: #166534; font-size: 13.5px; margin-bottom: 4px;">
              <span style="width: 8px; height: 8px; border-radius: 50%; background: #166534;"></span>
              Central Medical Server Active on Port 5000 (0.0.0.0)
            </div>
            <div style="font-size: 12px; color: #15803d;">
              All additions and edits to Doctors, Services, OPD Consultations, and IPD Inpatient records sync in real-time across all connected computers in the hospital.
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" style="font-weight: 700;">LAN Access URLs for Other Hospital Computers:</label>
            <div style="display: flex; flex-direction: column; gap: 8px;">
              ${(netInfo && netInfo.workstationUrls && netInfo.workstationUrls.length > 0) ? netInfo.workstationUrls.map(u => `
                <div style="display: flex; align-items: center; justify-content: space-between; background: #f8fafc; border: 1px solid var(--border-color); padding: 8px 12px; border-radius: 6px; font-size: 12.5px;">
                  <div>
                    <span style="font-weight: 700; color: var(--text-main);">${u.name}:</span>
                    <code style="font-family: monospace; color: #1d4ed8; margin-left: 6px; font-weight: 700;">${u.hospitalUrl}</code>
                  </div>
                  <button type="button" class="btn btn-sm btn-ghost btn-copy-url" data-url="${u.hospitalUrl}" style="color: #1d4ed8;">Copy</button>
                </div>
              `).join('') : `
                <div style="background: #f8fafc; border: 1px solid var(--border-color); padding: 8px 12px; border-radius: 6px; font-size: 12.5px;">
                  <strong>Local Station:</strong> <code>http://${currentHost}:3004</code> (Backend: <code>${currentBaseUrl}</code>)
                </div>
              `}
            </div>
            <p style="font-size: 11px; color: var(--text-muted); margin-top: 6px;">Open these links on OPD desks, Reception, IPD Nursing counters, or Lab terminals connected to the hospital Wi-Fi / LAN.</p>
          </div>

          <div class="form-group">
            <label class="form-label" style="font-weight: 700;">Central Medical Server URL:</label>
            <div style="display: flex; gap: 8px;">
              <input type="text" id="input-custom-backend" class="form-input font-mono" value="${currentBaseUrl}" style="flex: 1;" />
              <button type="button" class="btn btn-secondary" id="btn-test-ping">Test Ping</button>
            </div>
          </div>

          <div id="ping-status-alert" style="display: none; padding: 8px 12px; border-radius: 6px; font-size: 12px;"></div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary modal-close">Close</button>
          <button type="button" class="btn btn-primary" id="btn-save-backend-url">Save Server Config</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', () => overlay.remove());
    });

    // Copy URL handler
    overlay.querySelectorAll('.btn-copy-url').forEach(btn => {
      btn.addEventListener('click', () => {
        const url = btn.getAttribute('data-url');
        navigator.clipboard.writeText(url);
        showToast(`Copied ${url} to clipboard!`, 'info');
      });
    });

    // Test ping
    overlay.querySelector('#btn-test-ping')?.addEventListener('click', async () => {
      const alertBox = overlay.querySelector('#ping-status-alert');
      alertBox.style.display = 'block';
      alertBox.style.background = '#eff6ff';
      alertBox.style.color = '#1d4ed8';
      alertBox.textContent = 'Pinging Central Medical Server at port 5000...';

      const health = await hospitalBackend.getHealth();
      if (health && health.status === 'healthy') {
        alertBox.style.background = '#f0fdf4';
        alertBox.style.color = '#15803d';
        alertBox.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" style="display:inline-block; vertical-align:-2px; margin-right:4px;"><path d="M20 6L9 17l-5-5"/></svg>Connection successful! Server Version: ${health.version} • Status: ${health.status}`;
      } else {
        alertBox.style.background = '#fef2f2';
        alertBox.style.color = '#dc2626';
        alertBox.textContent = 'Server response pending or offline. Local storage fallback active.';
      }
    });

    // Save custom backend URL
    overlay.querySelector('#btn-save-backend-url')?.addEventListener('click', () => {
      const newUrl = overlay.querySelector('#input-custom-backend').value.trim();
      if (newUrl) {
        hospitalBackend.setBaseUrl(newUrl);
        showToast(`Server URL updated to ${newUrl}`, 'success');
        overlay.remove();
      }
    });
  }

  openShiftSwitcherModal() {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-dialog" style="max-width: 520px;">
        <div class="modal-header">
          <div>
            <h3 style="font-size: 16px; font-weight: 700; color: var(--text-main); margin: 0;">Switch Healthcare Staff Persona</h3>
            <p style="font-size: 11.5px; color: var(--text-muted); margin: 2px 0 0 0;">Select role to test clinical access permissions and department workflows</p>
          </div>
          <button type="button" class="btn btn-sm btn-ghost modal-close" title="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div class="modal-body">
          <div style="display: flex; flex-direction: column; gap: 10px;">
            ${DEMO_HOSPITAL_STAFF.map(s => `
              <div class="persona-option-card" data-staffid="${s.id}" style="display: flex; align-items: center; justify-content: space-between; padding: 12px 14px; border: 1px solid var(--border-color); border-radius: var(--radius-lg); background: #ffffff; cursor: pointer; transition: all 0.15s ease;" onmouseover="this.style.borderColor='var(--color-primary)'" onmouseout="this.style.borderColor='var(--border-color)'">
                <div style="display: flex; align-items: center; gap: 12px;">
                  <img src="${s.avatar}" style="width: 44px; height: 44px; border-radius: 50%; object-fit: cover; border: 1px solid var(--border-color);" alt="${s.fullName}" />
                  <div>
                    <div style="font-weight: 700; font-size: 14px; color: var(--text-main);">${s.fullName}</div>
                    <div style="font-size: 12px; color: var(--color-primary); font-weight: 600;">${s.title}</div>
                    <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">${s.department} • ${s.regNumber || 'Staff ID'}</div>
                  </div>
                </div>

                <span class="badge ${s.role === 'doctor' ? 'badge-active' : s.role === 'nurse' ? 'badge-blue' : 'badge-pending'}">
                  ${s.role.toUpperCase()}
                </span>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary modal-close">Cancel</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', () => overlay.remove());
    });

    overlay.querySelectorAll('.persona-option-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-staffid');
        const selected = DEMO_HOSPITAL_STAFF.find(s => s.id === id);
        if (selected) {
          hospitalStore.setActiveStaff(selected);
          overlay.remove();
          showToast(`Shift switched to ${selected.fullName} (${selected.role.toUpperCase()})`, 'info');
          this.renderShell();
          this.handleRoute();
        }
      });
    });
  }

  bindGlobalEvents() {
    window.addEventListener('hashchange', () => this.handleRoute());
  }

  handleRoute() {
    const rawHash = window.location.hash || '#dashboard';
    const [path, queryString] = rawHash.split('?');
    const route = path.toLowerCase();
    const viewContainer = document.getElementById('view-container');
    if (!viewContainer) return;

    // Update active nav styling
    const navLinks = this.appContainer.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      const href = link.getAttribute('href') || '';
      const hrefPath = href.split('?')[0].toLowerCase();
      if (hrefPath === route || (route === '' && hrefPath === '#dashboard')) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Parse query params
    const params = new URLSearchParams(queryString || '');

    // Route matching
    if (route === '#dashboard' || route === '') {
      this.currentViewInstance = new HospitalDashboard(viewContainer);
      this.currentViewInstance.render();
    } else if (route === '#intake') {
      this.currentViewInstance = new IntakeView(viewContainer);
      this.currentViewInstance.render();
    } else if (route === '#patient') {
      const patientId = params.get('id') || '7483916251'; // default to Rahul Sharma
      this.currentViewInstance = new PatientWorkspace(viewContainer, patientId);
      this.currentViewInstance.render();
    } else if (route === '#admissions') {
      this.currentViewInstance = new AdmissionsView(viewContainer);
      this.currentViewInstance.render();
    } else if (route === '#services') {
      this.currentViewInstance = new ServicesView(viewContainer);
      this.currentViewInstance.render();
    } else if (route === '#labs') {
      this.currentViewInstance = new LabsView(viewContainer);
      this.currentViewInstance.render();
    } else if (route === '#staff') {
      this.currentViewInstance = new StaffView(viewContainer);
      this.currentViewInstance.render();
    } else if (route === '#audit') {
      this.currentViewInstance = new AuditView(viewContainer);
      this.currentViewInstance.render();
    } else {
      window.location.hash = '#dashboard';
    }

    window.scrollTo(0, 0);
  }
}

// Bootstrap on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  new HospitalApp();
});
