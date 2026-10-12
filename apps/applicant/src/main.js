/**
 * HealthCard Citizen & Applicant Portal — Main Application Shell & Hash Router
 * Minimal Light Mode architecture strictly matching Admin Panel
 */

import { HomeView } from './panels/home/homeView.js';
import { ApplyWizard } from './panels/apply/applyWizard.js';
import { TrackView } from './panels/track/trackView.js';
import { ApplicantDashboard } from './panels/dashboard/applicantDashboard.js';
import { ApplicantAuth } from './panels/auth/applicantAuth.js';
import { EmergencyView } from './panels/emergency/emergencyView.js';
import { NotFoundView } from './panels/error/notFoundView.js';
import { applicantStore } from './shared/storage.js';

export class ApplicantPortalApp {
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
    const currentUser = applicantStore.getCurrentUser();
    const currentHash = (window.location.hash || '').split('?')[0].toLowerCase();
    const isAuthPage = (currentHash === '#login' || currentHash === '#register');

    this.appContainer.innerHTML = `
      <div class="applicant-app">
        <!-- Minimal Light Portal Header -->
        <header class="portal-header ${isAuthPage ? 'auth-header' : ''}">
          <a href="#home" class="brand-wrapper">
            <div class="brand-emblem">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v20M2 12h20"/></svg>
            </div>
            <div>
              <div class="brand-title">HealthCard</div>
              <div class="brand-subtitle">Citizen Application & Issuance Portal</div>
            </div>
          </a>

          <!-- Main Navigation Tabs -->
          <nav class="header-nav">
            <a href="#home" class="nav-item" id="nav-home">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              Home
            </a>
            <a href="#apply" class="nav-item" id="nav-apply">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
              Apply for Card
            </a>
            <a href="#track" class="nav-item" id="nav-track">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              Track Delivery
            </a>
            <a href="#dashboard" class="nav-item" id="nav-dashboard">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              Citizen Dashboard
            </a>
          </nav>

          <!-- Right Status & Login -->
          <div class="header-actions">
            <div class="status-pill">
              <span class="pulse-dot"></span>
              <span>Registry Live</span>
            </div>

            <div id="user-header-slot">
              ${currentUser ? `
                <div style="display:flex; align-items:center; gap:8px;">
                  <a href="#dashboard" class="user-profile-chip" title="Citizen Profile">
                    <img src="${currentUser.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentUser.fullName)}`}" class="user-chip-avatar" alt="User avatar" />
                    <span style="font-weight:600; font-size:12.5px; color:var(--text-main);">${currentUser.fullName.split(' ')[0]}</span>
                  </a>
                  <button type="button" class="btn btn-sm btn-ghost" id="btn-header-logout" title="Sign Out" style="color:var(--text-muted); padding:4px 6px;">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  </button>
                </div>
              ` : `
                <div style="display:flex; align-items:center; gap:8px;">
                  <a href="#login" class="btn btn-sm btn-outline" id="nav-login" style="font-size:12px; font-weight:600;">
                    Sign In
                  </a>
                  <a href="#register" class="btn btn-sm btn-primary" id="nav-register" style="font-size:12px; font-weight:600;">
                    Create Account
                  </a>
                </div>
              `}
            </div>
          </div>
        </header>

        <!-- Main View Mount -->
        <main class="applicant-main" id="view-container"></main>

        <!-- Rich Multi-Column Portal Footer (Hidden on #login and #register) -->
        <footer class="portal-footer-rich ${isAuthPage ? 'auth-footer' : ''}">
          <div class="footer-container">
            <div class="footer-grid">
              
              <!-- Column 1: Registry Brand & Mandate -->
              <div class="footer-col col-brand">
                <div class="footer-brand-title">
                  <div class="brand-emblem-sm">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v20M2 12h20"/></svg>
                  </div>
                  <span>National HealthCard Registry</span>
                </div>
                <p class="footer-desc">
                  An apex initiative under the Digital India Health Mission, providing every citizen a tamper-proof CR80 PVC identity with unified nationwide hospital interoperability.
                </p>
                <div class="footer-emblems-row">
                  <span class="govt-tag">Ministry of Health & Family Welfare</span>
                  <span class="govt-tag">Digital India</span>
                </div>
              </div>

              <!-- Column 2: Citizen Services -->
              <div class="footer-col">
                <h4 class="footer-col-heading">Citizen Services</h4>
                <ul class="footer-links">
                  <li><a href="#home">Portal Overview</a></li>
                  <li><a href="#apply">Apply for CR80 PVC Card</a></li>
                  <li><a href="#track">SpeedPost Track & Trace</a></li>
                  <li><a href="#dashboard">Citizen Dashboard & Re-Print</a></li>
                  <li><a href="#emergency?hid=7483916251">Contactless Paramedic Triage</a></li>
                  <li><a href="#login">Citizen Identity Login</a></li>
                </ul>
              </div>

              <!-- Column 3: 24x7 Support & Helplines -->
              <div class="footer-col">
                <h4 class="footer-col-heading">24×7 Citizen Support</h4>
                <div class="support-item">
                  <div class="support-icon">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  </div>
                  <div>
                    <div class="support-lbl">National Toll-Free Helpline:</div>
                    <a href="tel:1800114477" class="support-val">1800-11-4477 (Toll-Free)</a>
                  </div>
                </div>

                <div class="support-item">
                  <div class="support-icon emergency-icon">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  </div>
                  <div>
                    <div class="support-lbl">Medical Emergency / Ambulance:</div>
                    <div class="support-val" style="color:var(--color-blood-red); font-weight:800;">Dial 108 / 112 (Instant)</div>
                  </div>
                </div>

                <div class="support-item">
                  <div class="support-icon">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  </div>
                  <div>
                    <div class="support-lbl">Grievance & Support Email:</div>
                    <a href="mailto:support@healthcard.gov.in" class="support-val">support@healthcard.gov.in</a>
                  </div>
                </div>
              </div>

              <!-- Column 4: Compliance & Technical Security -->
              <div class="footer-col">
                <h4 class="footer-col-heading">Statutory & Standards</h4>
                <div class="compliance-badge-list">
                  <div class="comp-badge-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0f766e" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    <span>DPDP Act 2023 Compliant</span>
                  </div>
                  <div class="comp-badge-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0f766e" stroke-width="2.5"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M7 8h10M7 12h6"/></svg>
                    <span>ISO/IEC 7810 ID-1 Physical Spec</span>
                  </div>
                  <div class="comp-badge-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0f766e" stroke-width="2.5"><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                    <span>NTAG 424 DNA AES-128 NFC</span>
                  </div>
                  <div class="comp-badge-item">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0f766e" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    <span>CERT-In Audited Architecture</span>
                  </div>
                </div>
              </div>

            </div>

            <!-- Bottom Sub-bar -->
            <div class="footer-sub-bar">
              <div class="footer-copy">
                © 2026 National Health Registry, Ministry of Health & Family Welfare, Govt. of India. All rights reserved.
              </div>
              <div class="footer-legal-links">
                <a href="#home">Terms of Service</a>
                <span>•</span>
                <a href="#home">Privacy Policy</a>
                <span>•</span>
                <a href="#home">Hyperlink Policy</a>
                <span>•</span>
                <a href="#home">Accessibility Statement</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    `;

    // Bind logout button: directly redirect to #login
    const btnLogout = document.getElementById('btn-header-logout');
    if (btnLogout) {
      btnLogout.onclick = () => {
        applicantStore.logoutUser();
        window.location.hash = '#login';
        this.renderShell();
        this.handleRoute();
      };
    }
  }

  bindGlobalEvents() {
    window.addEventListener('hashchange', () => this.handleRoute());
  }

  handleRoute() {
    const rawHash = window.location.hash || '#home';
    let [route, queryString] = rawHash.split('?');
    route = route.toLowerCase();

    // Route default fallback
    if (!route || route === '#') {
      route = '#home';
    }

    // Clean up active cameras when navigating
    if (this.currentViewInstance && typeof this.currentViewInstance.stopCamera === 'function') {
      this.currentViewInstance.stopCamera();
    }

    const queryParams = new URLSearchParams(queryString || '');
    const refParam = queryParams.get('ref') || '';
    const modeParam = queryParams.get('mode') || (route === '#register' ? 'signup' : 'signin');

    // Active Tab Navigation & Auth Header / Footer Visibility Toggle
    const isAuthPage = (route === '#login' || route === '#register');
    const headerEl = document.querySelector('.portal-header');
    const footerEl = document.querySelector('.portal-footer-rich');
    
    if (headerEl) {
      if (isAuthPage) {
        headerEl.classList.add('auth-header');
      } else {
        headerEl.classList.remove('auth-header');
      }
    }

    if (footerEl) {
      if (isAuthPage) {
        footerEl.classList.add('auth-footer');
      } else {
        footerEl.classList.remove('auth-footer');
      }
    }

    document.querySelectorAll('.header-nav .nav-item').forEach(el => el.classList.remove('active'));

    const container = document.getElementById('view-container');
    if (!container) return;

    if (route === '#home') {
      document.getElementById('nav-home')?.classList.add('active');
      this.currentViewInstance = new HomeView('view-container');
    } else if (route === '#apply') {
      document.getElementById('nav-apply')?.classList.add('active');
      this.currentViewInstance = new ApplyWizard('view-container');
    } else if (route === '#track') {
      document.getElementById('nav-track')?.classList.add('active');
      this.currentViewInstance = new TrackView('view-container', { query: refParam });
    } else if (route === '#dashboard') {
      document.getElementById('nav-dashboard')?.classList.add('active');
      this.currentViewInstance = new ApplicantDashboard('view-container', {
        onLogout: () => {
          applicantStore.logoutUser();
          window.location.hash = '#login';
          this.renderShell();
          this.handleRoute();
        }
      });
    } else if (route === '#login' || route === '#register') {
      this.currentViewInstance = new ApplicantAuth('view-container', {
        mode: modeParam,
        onLoginSuccess: () => {
          window.location.hash = '#home';
          this.renderShell();
          this.handleRoute();
        }
      });
    } else if (route === '#emergency') {
      const hidParam = queryParams.get('hid') || '';
      const idParam = queryParams.get('id') || '';
      this.currentViewInstance = new EmergencyView('view-container', {
        hid: hidParam,
        memberId: idParam
      });
    } else {
      // Custom 404 Error Page for unmatched routes
      this.currentViewInstance = new NotFoundView('view-container', {
        route: rawHash
      });
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// Immediate robust mounting
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new ApplicantPortalApp());
} else {
  new ApplicantPortalApp();
}
