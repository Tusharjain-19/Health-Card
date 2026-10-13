/**
 * HealthCard Hospital & Clinician Portal: Main Application Shell & Hash Router
 * Clean enterprise clinical architecture strictly adhering to PRD and design guidelines.
 * Features:
 * - Pure English interface with zero emojis, sharp SVG vector iconography
 * - Hospital Institutional Settings with configurable metadata & credentials
 * - Hospital Portal Login & Access Authentication
 * - Clean OPD Station without forcing hardcoded old patient charts
 * - Inpatient (IPD) Bed & Ward transfers
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
import { OpdDeskView } from './panels/opd/opdDeskView.js';
import { HospitalSettingsView } from './panels/settings/hospitalSettingsView.js';
import { HospitalAuthView } from './panels/auth/hospitalAuthView.js';
import { DEMO_HOSPITAL_STAFF } from './shared/data/demoData.js';
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
    const rawHash = (window.location.hash || '').toLowerCase();
    const session = hospitalStore.getHospitalSession();
    const isLoginRoute = rawHash.startsWith('#login') || !session;

    if (isLoginRoute) {
      // Standalone login screen without top navigation bar per user requirement
      this.appContainer.innerHTML = `
        <div class="hospital-app hospital-auth-screen" style="min-height: 100vh;">
          <main class="hospital-main" id="view-container" style="padding: 0; min-height: 100vh;"></main>
        </div>
      `;
      return;
    }

    const activeStaff = hospitalStore.getCurrentStaff();
    const settings = hospitalStore.getHospitalSettings();

    this.appContainer.innerHTML = `
      <div class="hospital-app">
        <!-- Institutional Clinical Header (Uncluttered, Clean Rectangular Controls) -->
        <header class="hospital-header">
          <a href="#dashboard" class="brand-wrapper">
            <div class="brand-emblem" style="overflow: hidden; width: 34px; height: 34px; border-radius: 9px; display: flex; align-items: center; justify-content: center; background: #ffffff; box-shadow: 0 1px 4px rgba(0,0,0,0.1); border: 1px solid #e2e8f0;">
              ${settings.logoUrl ? `<img src="${settings.logoUrl}" style="width: 100%; height: 100%; object-fit: contain;" alt="${settings.shortName}" />` : `
                <img src="/card-design/assets/healthcard-brand-mark.svg" style="width: 28px; height: 28px; object-fit: contain;" alt="NHC Brand" />
              `}
            </div>
            <div>
              <div class="brand-title">${settings.shortName || 'HealthCard Hospital'}</div>
              <div class="brand-subtitle">${settings.regNumber || 'NABH Accredited • Verified Healthcare Network'}</div>
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
            <a href="#opd" class="nav-link" id="nav-opd">
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
            <a href="#settings" class="nav-link" id="nav-settings">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              Settings
            </a>
          </nav>

          <!-- Right Header Controls: Compact Clean Authenticated Persona -->
          <div class="header-actions">
            <!-- Small Compact Persona Chip -->
            <div class="persona-switcher-compact" id="btn-persona-switcher" title="User Session Profile & Actions" style="cursor: pointer; display: flex; align-items: center; gap: 7px; padding: 3px 10px 3px 3px; background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 20px; transition: all 0.15s ease;">
              <img src="${session?.avatar || activeStaff.avatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80'}" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover; border: 1.5px solid #1d4ed8;" alt="${session?.fullName || activeStaff.fullName}" />
              <div style="font-size: 11.5px; font-weight: 700; color: #0f172a; max-width: 90px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">
                ${(session?.fullName || activeStaff.fullName).split(' ')[0]}
              </div>
              <span class="badge ${session?.role === 'HOSPITAL_ADMIN' ? 'badge-active' : 'badge-blue'}" style="font-size: 9.5px; padding: 1px 6px; text-transform: uppercase; font-weight: 700;">
                ${session?.role === 'HOSPITAL_ADMIN' ? 'Admin' : 'Doctor'}
              </span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#64748b" stroke-width="2.5"><polyline points="6 9 12 15 18 9"/></svg>
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
      this.openUserMenuModal();
    });
  }

  openUserMenuModal() {
    const session = hospitalStore.getHospitalSession();
    const activeStaff = hospitalStore.getCurrentStaff();
    const settings = hospitalStore.getHospitalSettings();

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-dialog" style="max-width: 440px;">
        <div class="modal-header">
          <div>
            <h3 style="font-size: 16px; font-weight: 700; color: var(--text-main); margin: 0;">Session Profile & Actions</h3>
            <p style="font-size: 11.5px; color: var(--text-muted); margin: 2px 0 0 0;">${settings.shortName} • Authenticated Terminal</p>
          </div>
          <button type="button" class="btn btn-sm btn-ghost modal-close" title="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div class="modal-body">
          <!-- Active User Card -->
          <div style="background: #f8fafc; border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 14px 16px; margin-bottom: 16px; display: flex; align-items: center; gap: 12px;">
            <img src="${session?.avatar || activeStaff.avatar}" style="width: 50px; height: 50px; border-radius: 50%; object-fit: cover; border: 1.5px solid var(--color-primary);" />
            <div>
              <div style="font-weight: 700; font-size: 15px; color: var(--text-main);">${session?.fullName || activeStaff.fullName}</div>
              <div style="font-size: 12px; color: var(--color-primary); font-weight: 600;">${session?.title || activeStaff.title || 'Clinician'}</div>
              <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">
                Role: <strong>${session?.role || activeStaff.role}</strong> • ${session?.department || activeStaff.department}
              </div>
            </div>
          </div>

          <!-- Quick Actions -->
          <div style="display: flex; flex-direction: column; gap: 8px;">
            <a href="#settings" class="btn btn-outline modal-close" style="justify-content: flex-start; gap: 10px; font-weight: 600; padding: 10px 14px;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              Hospital Settings & Credentials
            </a>

            <button type="button" class="btn btn-outline" id="btn-open-shift-modal" style="justify-content: flex-start; gap: 10px; font-weight: 600; padding: 10px 14px;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              Switch Clinician Shift Persona
            </button>

            <button type="button" class="btn btn-outline" id="btn-user-logout" style="justify-content: flex-start; gap: 10px; font-weight: 700; color: #dc2626; border-color: #fca5a5; background: #fff5f5; padding: 10px 14px;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2.2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Sign Out / Lock Portal Terminal
            </button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', () => overlay.remove());
    });

    overlay.querySelector('#btn-open-shift-modal')?.addEventListener('click', () => {
      overlay.remove();
      this.openShiftSwitcherModal();
    });

    overlay.querySelector('#btn-user-logout')?.addEventListener('click', () => {
      hospitalStore.logoutHospital();
      overlay.remove();
      showToast('Signed out of hospital terminal.', 'info');
      this.renderShell();
      window.location.hash = '#login';
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
    const session = hospitalStore.getHospitalSession();

    // Authentication Guard
    if (!session && route !== '#login') {
      window.location.hash = '#login';
      return;
    }

    if (session && route === '#login') {
      window.location.hash = '#dashboard';
      return;
    }

    const isLogin = route === '#login';
    const hasHeader = !!this.appContainer.querySelector('.hospital-header');

    // Ensure the shell matches the view state: no navbar on #login, navbar on authenticated pages
    if ((isLogin && hasHeader) || (!isLogin && !hasHeader) || !document.getElementById('view-container')) {
      this.renderShell();
    }

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
    if (route === '#login') {
      this.currentViewInstance = new HospitalAuthView(viewContainer, (newSession) => {
        this.renderShell();
        window.location.hash = '#dashboard';
      });
      this.currentViewInstance.render();
    } else if (route === '#dashboard' || route === '') {
      this.currentViewInstance = new HospitalDashboard(viewContainer);
      this.currentViewInstance.render();
    } else if (route === '#intake') {
      this.currentViewInstance = new IntakeView(viewContainer);
      this.currentViewInstance.render();
    } else if (route === '#opd') {
      // Clean OPD Station: does not force an old patient
      this.currentViewInstance = new OpdDeskView(viewContainer);
      this.currentViewInstance.render();
    } else if (route === '#patient') {
      const patientId = params.get('id');
      if (!patientId) {
        // No patient ID specified: redirect to OPD Station
        window.location.hash = '#opd';
        return;
      }
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
    } else if (route === '#settings') {
      this.currentViewInstance = new HospitalSettingsView(viewContainer, () => {
        this.renderShell();
        this.handleRoute();
      });
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
