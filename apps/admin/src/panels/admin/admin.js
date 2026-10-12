/**
 * HealthCard Admin & Card Issuing Panel Controller
 * Handles Navigation, Member CRUD, Physical Card Issuing Wizard, QR rendering,
 * Fulfillment Pipeline, Organization Verification, and Audit Explorer.
 */

import QRCode from 'qrcode';
import { store } from '../../shared/utils/storage.js';
import { DEMO_ADMIN_ACCOUNTS } from '../../shared/data/demoData.js';
import { generateHealthId, formatHealthId, validateHealthId } from '../../shared/utils/healthId.js';
import { formatDate, calculateAge, maskMobile, formatMobile, timeAgo } from '../../shared/utils/formatters.js';
import { showToast } from '../../shared/components/toast.js';

const primaryDemoUser = DEMO_ADMIN_ACCOUNTS[0] || {
  fullName: "Chief Medical Officer",
  role: "Super Admin",
  email: "admin@healthcard.in",
  password: "DemoSecurePass123"
};

let currentAdminUser = {
  name: primaryDemoUser.fullName,
  role: primaryDemoUser.role,
  email: primaryDemoUser.email
};

let currentActiveView = 'dashboard';
let selectedMemberForDetail = null;
let selectedCardForPreview = null;

/**
 * Render Privacy-Preserved Govt KYC Badge (No tick marks)
 * Supports Aadhaar Card, Driving License, Voter ID, Passport, PAN Card
 */
function renderKycBadge(kyc) {
  const docType = (kyc && kyc.documentType) ? kyc.documentType : 'Aadhaar Card';
  let badgeClass = 'kyc-badge-aadhaar';
  let label = docType;

  if (docType.includes('Driving') || docType.includes('DL')) {
    badgeClass = 'kyc-badge-dl';
    label = 'Driving License';
  } else if (docType.includes('Voter') || docType.includes('Election')) {
    badgeClass = 'kyc-badge-voter';
    label = 'Voter ID';
  } else if (docType.includes('Passport')) {
    badgeClass = 'kyc-badge-passport';
    label = 'Passport';
  } else if (docType.includes('PAN')) {
    badgeClass = 'kyc-badge-pan';
    label = 'PAN Card';
  } else {
    badgeClass = 'kyc-badge-aadhaar';
    label = 'Aadhaar Card';
  }

  return `<span class="kyc-badge ${badgeClass}" title="Verified via ${label}">${label}</span>`;
}

/**
 * Initialize Admin Panel
 */
export function initAdminPanel(container) {
  if (!container) return;

  // Check login state in session
  const isLoggedIn = sessionStorage.getItem('admin_logged_in') === 'true';

  if (!isLoggedIn) {
    renderLoginView(container);
  } else {
    renderAppShell(container);
  }
}

/**
 * Render Minimalist Corporate Login Screen
 */
function renderLoginView(container) {
  container.innerHTML = `
    <div class="login-wrapper" style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background-color: #f8fafc; padding: 20px;">
      <div class="login-box" style="width: 100%; max-width: 440px; background: #ffffff; border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: 32px; box-shadow: var(--shadow-md);">
        
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px;">
          <div style="width: 40px; height: 40px; background: var(--color-primary); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; color: #ffffff;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
          </div>
          <div>
            <h1 style="font-size: 18px; font-weight: 700; color: var(--text-main); margin: 0; line-height: 1.2;">HealthCard</h1>
            <p style="font-size: 12px; color: var(--text-muted); margin: 0;">Card Issuing & Admin Portal</p>
          </div>
        </div>

        <div class="alert-banner alert-info" style="margin-bottom: 20px;">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
          <div>
            <strong>National Health Network</strong>
            <div style="font-size: 11.5px; opacity: 0.9;">Secure Issuer Portal • MFA Protected</div>
          </div>
        </div>

        <form id="admin-login-form">
          <div class="form-group" style="margin-bottom: 16px;">
            <label for="admin-email">Official Email</label>
            <input type="email" id="admin-email" class="form-control" value="${primaryDemoUser.email}" required />
          </div>

          <div class="form-group" style="margin-bottom: 20px;">
            <label for="admin-password">Password</label>
            <input type="password" id="admin-password" class="form-control" value="${primaryDemoUser.password}" required />
          </div>

          <button type="submit" class="btn btn-primary" style="width: 100%; height: 40px; font-size: 14px; font-weight: 600;">
            Sign In to Issuer Portal
          </button>
        </form>

        <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid var(--border-color);">
          <div style="font-size: 11.5px; color: var(--text-muted); margin-bottom: 8px; font-weight: 600;">QUICK DEMO ACCESS:</div>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            ${DEMO_ADMIN_ACCOUNTS.map(acc => `
              <button type="button" class="btn btn-secondary btn-sm demo-login-btn" data-role="${acc.role}" data-email="${acc.email}" data-name="${acc.fullName}">
                ${acc.role}
              </button>
            `).join('')}
          </div>
        </div>

      </div>
    </div>
  `;

  // Attach login listener
  const form = document.getElementById('admin-login-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('admin-email').value;
    handleLoginSuccess(email, "Issuer Admin", container);
  });

  const demoBtns = container.querySelectorAll('.demo-login-btn');
  demoBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const role = btn.dataset.role;
      const email = btn.dataset.email;
      const name = btn.dataset.name;
      handleLoginSuccess(email, role, container, name);
    });
  });
}

function handleLoginSuccess(email, role, container, explicitName) {
  sessionStorage.setItem('admin_logged_in', 'true');
  const matched = DEMO_ADMIN_ACCOUNTS.find(a => a.email.toLowerCase() === email.toLowerCase());
  currentAdminUser = {
    name: explicitName || matched?.fullName || email.split('@')[0].replace('.', ' ').toUpperCase(),
    role: role || matched?.role || "Issuer Admin",
    email: email
  };
  showToast(`Authenticated as ${currentAdminUser.role} (${currentAdminUser.name})`, 'success');
  renderAppShell(container);
}

/**
 * Render App Shell with Sidebar & Views
 */
function renderAppShell(container) {
  container.innerHTML = `
    <div class="admin-layout">
      <!-- Sidebar -->
      <aside class="admin-sidebar" id="admin-sidebar">
        <div class="sidebar-brand">
          <div class="brand-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
          </div>
          <div class="brand-text">
            <span class="brand-title">HealthCard</span>
            <span class="brand-subtitle">Issuer Admin</span>
          </div>
        </div>

        <nav class="sidebar-menu">
          <div class="menu-category">Core Operations</div>
          <a class="nav-link ${currentActiveView === 'dashboard' ? 'active' : ''}" data-view="dashboard">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
            <span>Dashboard</span>
          </a>

          <a class="nav-link ${currentActiveView === 'members' ? 'active' : ''}" data-view="members">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <span>Members Directory</span>
            <span class="nav-badge" id="sidebar-member-count">${store.data.members.length}</span>
          </a>

          <a class="nav-link ${currentActiveView === 'card-issue' ? 'active' : ''}" data-view="card-issue">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
            <span>Issue Physical Card</span>
          </a>

          <a class="nav-link ${currentActiveView === 'fulfillment' ? 'active' : ''}" data-view="fulfillment">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
            <span>Fulfillment Pipeline</span>
            <span class="nav-badge" id="sidebar-order-count">${store.data.orders.filter(o => o.status !== 'Delivered').length}</span>
          </a>

          <div class="menu-category" style="margin-top: 8px;">Network & Trust</div>
          <a class="nav-link ${currentActiveView === 'organizations' ? 'active' : ''}" data-view="organizations">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-3"/></svg>
            <span>Verified Hospitals & Labs</span>
          </a>

          <a class="nav-link ${currentActiveView === 'audit' ? 'active' : ''}" data-view="audit">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span>Audit & Compliance</span>
          </a>
        </nav>

        <div class="sidebar-user">
          <div class="user-avatar">${currentAdminUser.name.charAt(0)}</div>
          <div class="user-details">
            <div class="user-name">${currentAdminUser.name}</div>
            <div class="user-role">${currentAdminUser.role}</div>
          </div>
          <button class="btn-logout" id="btn-admin-logout" title="Sign Out">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
        </div>
      </aside>

      <!-- Main Workspace -->
      <main class="admin-main">
        <header class="admin-header">
          <div class="header-left">
            <button class="btn-menu-toggle" id="btn-sidebar-toggle">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            </button>
            <div class="header-search">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              <input type="text" id="global-search-input" placeholder="Search by Health ID (5-5), Name, Mobile..." />
            </div>
          </div>

          <div class="header-right">
            <div class="system-status">
              <span class="status-dot"></span>
              <span>National Network Online</span>
            </div>
          </div>
        </header>

        <div class="page-container" id="admin-view-container">
          <!-- Active view will be dynamically mounted here -->
        </div>
      </main>
    </div>

    <!-- Modal Container -->
    <div id="modal-container"></div>
  `;

  // Attach Navigation Listeners
  const navLinks = container.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const viewName = link.dataset.view;
      switchView(viewName, container);
    });
  });

  // Sidebar toggle for mobile
  const sidebarToggle = container.querySelector('#btn-sidebar-toggle');
  const sidebar = container.querySelector('#admin-sidebar');
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });
  }

  // Logout listener
  const logoutBtn = container.querySelector('#btn-admin-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      sessionStorage.removeItem('admin_logged_in');
      showToast('Logged out of Admin Portal', 'info');
      renderLoginView(container);
    });
  }

  // Global search enter handler
  const globalSearch = container.querySelector('#global-search-input');
  if (globalSearch) {
    globalSearch.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = globalSearch.value.trim();
        if (val) {
          switchView('members', container, { query: val });
        }
      }
    });
  }

  // Mount default view
  renderCurrentView(container);
}

function switchView(viewName, container, params = {}) {
  currentActiveView = viewName;
  const navLinks = container.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.classList.toggle('active', link.dataset.view === viewName);
  });
  renderCurrentView(container, params);
}

function renderCurrentView(container, params = {}) {
  const viewTarget = container.querySelector('#admin-view-container');
  if (!viewTarget) return;

  if (currentActiveView === 'dashboard') {
    renderDashboardView(viewTarget, container);
  } else if (currentActiveView === 'members') {
    renderMembersView(viewTarget, container, params);
  } else if (currentActiveView === 'member-detail') {
    renderMemberDetailView(viewTarget, container, selectedMemberForDetail);
  } else if (currentActiveView === 'card-issue') {
    renderCardIssueWizard(viewTarget, container, params);
  } else if (currentActiveView === 'fulfillment') {
    renderFulfillmentView(viewTarget, container);
  } else if (currentActiveView === 'organizations') {
    renderOrganizationsView(viewTarget, container);
  } else if (currentActiveView === 'audit') {
    renderAuditView(viewTarget, container);
  }
}

/**
 * ==========================================================================
 * VIEW 1: EXECUTIVE DASHBOARD
 * ==========================================================================
 */
function renderDashboardView(target, container) {
  const stats = store.getStats();
  const recentMembers = store.data.members.slice(0, 5);
  const recentCards = store.data.cards.slice(0, 5);
  const recentLogs = store.data.auditLogs.slice(0, 5);

  target.innerHTML = `
    <div class="page-title-bar">
      <div>
        <h2 class="page-title">Issuer Operations Dashboard</h2>
        <p class="page-description">Overview of national member registration, physical card fulfillment, and network security.</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-secondary" id="btn-refresh-stats">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg>
          <span>Refresh</span>
        </button>
        <button class="btn btn-primary" id="btn-dash-issue-card">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
          <span>+ Issue Card</span>
        </button>
      </div>
    </div>

    <!-- KPI Metrics Grid -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-header">
          <span class="stat-label">Total Registered Members</span>
          <div class="stat-icon" style="color: #1d4ed8; background-color: #eff6ff;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
          </div>
        </div>
        <div class="stat-value">${stats.totalMembers}</div>
        <div class="stat-subtext">100% Unique 10-digit Health IDs</div>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <span class="stat-label">Active Physical Cards</span>
          <div class="stat-icon" style="color: #059669; background-color: #ecfdf5;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><path d="m9 12 2 2 4-4"/></svg>
          </div>
        </div>
        <div class="stat-value">${stats.activeCards}</div>
        <div class="stat-subtext">QR & NFC Activated</div>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <span class="stat-label">Pending Fulfillment</span>
          <div class="stat-icon" style="color: #d97706; background-color: #fffbeb;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
          </div>
        </div>
        <div class="stat-value">${stats.pendingFulfillments}</div>
        <div class="stat-subtext">Printing & Dispatch Queue</div>
      </div>

      <div class="stat-card">
        <div class="stat-header">
          <span class="stat-label">Verified Healthcare Orgs</span>
          <div class="stat-icon" style="color: #0284c7; background-color: #f0f9ff;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-3"/></svg>
          </div>
        </div>
        <div class="stat-value">${stats.verifiedOrgs}</div>
        <div class="stat-subtext">Hospitals, Clinics & Labs</div>
      </div>
    </div>

    <!-- Recent Members & Card Activity Split -->
    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-bottom: 24px;">
      
      <!-- Recent Members Table -->
      <div class="card" style="margin-bottom: 0;">
        <div class="card-header">
          <h3 class="card-title">Recent Member Registrations</h3>
          <button class="btn btn-secondary btn-sm" id="btn-see-all-members">View All</button>
        </div>
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Citizen</th>
                <th>10-Digit Health ID</th>
                <th>Blood Grp</th>
                <th>Govt KYC</th>
                <th>Physical Card</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${recentMembers.map(m => {
                const cards = store.getCardsByMemberId(m.id);
                const activeCard = cards.find(c => c.status === 'Active' || c.status === 'Issued');
                const avatarUrl = m.photoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(m.fullName)}`;
                return `
                <tr>
                  <td>
                    <div class="citizen-cell">
                      <img src="${avatarUrl}" class="citizen-avatar" alt="${m.fullName}" />
                      <div class="citizen-info">
                        <span class="citizen-name">${m.fullName}</span>
                        <span class="citizen-sub">${calculateAge(m.dob)} yrs • ${m.gender}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="id-cell">
                      ${m.healthId}
                      <button class="btn-copy-id" data-id="${m.healthId}" title="Copy Health ID">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                      </button>
                    </span>
                  </td>
                  <td><span class="blood-group-tag">${m.bloodGroup || '—'}</span></td>
                  <td>${renderKycBadge(m.kyc)}</td>
                  <td>
                    ${activeCard ? `<span class="card-status-active">Active Card</span>` : `<span class="card-status-none">Not Issued</span>`}
                  </td>
                  <td>
                    <button class="btn btn-secondary btn-sm btn-view-member" data-id="${m.id}">View</button>
                  </td>
                </tr>
              `;}).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- Live Audit / Security Feed -->
      <div class="card" style="margin-bottom: 0;">
        <div class="card-header">
          <h3 class="card-title">Live Security & Audit Feed</h3>
          <button class="btn btn-secondary btn-sm" id="btn-see-all-audit">Logs</button>
        </div>
        <div class="card-body" style="padding: 12px 16px;">
          <div style="display: flex; flex-direction: column; gap: 12px;">
            ${recentLogs.map(log => `
              <div style="display: flex; gap: 10px; font-size: 12px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 8px;">
                <div style="color: var(--color-primary); flex-shrink: 0; margin-top: 2px;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                </div>
                <div style="flex: 1;">
                  <div style="font-weight: 600; color: var(--text-main);">${log.action}</div>
                  <div style="color: var(--text-secondary); font-size: 11.5px; margin-top: 2px;">${log.target}</div>
                  <div style="color: var(--text-muted); font-size: 10.5px; margin-top: 2px;">${timeAgo(log.timestamp)} • ${log.actor}</div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>

    </div>
  `;

  // Attach Dashboard Listeners
  target.querySelector('#btn-refresh-stats')?.addEventListener('click', () => {
    showToast('Dashboard data refreshed', 'info');
    renderDashboardView(target, container);
  });

  target.querySelector('#btn-dash-issue-card')?.addEventListener('click', () => {
    switchView('card-issue', container);
  });

  target.querySelector('#btn-see-all-members')?.addEventListener('click', () => {
    switchView('members', container);
  });

  target.querySelector('#btn-see-all-audit')?.addEventListener('click', () => {
    switchView('audit', container);
  });

  // View member buttons
  target.querySelectorAll('.btn-view-member').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const mem = store.getMemberById(id);
      if (mem) {
        selectedMemberForDetail = mem;
        switchView('member-detail', container);
      }
    });
  });

  // Copy ID buttons
  target.querySelectorAll('.btn-copy-id').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      navigator.clipboard.writeText(id).then(() => {
        showToast(`Copied Health ID: ${id}`, 'success');
      });
    });
  });
}

/**
 * ==========================================================================
 * VIEW 2: MEMBERS DIRECTORY
 * ==========================================================================
 */
function renderMembersView(target, container, params = {}) {
  const initialQuery = params.query || '';
  let currentMembers = store.getMembers(initialQuery);

  target.innerHTML = `
    <div class="page-title-bar">
      <div>
        <h2 class="page-title">Member Identity Directory</h2>
        <p class="page-description">Registered citizens with unique 10-digit Health IDs (PRD Section 6.1 & 7.1).</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-primary" id="btn-open-register-modal">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          <span>Register New Member</span>
        </button>
      </div>
    </div>

    <!-- Filter & Search Bar -->
    <div class="filter-bar">
      <div class="filter-group">
        <input type="text" id="member-search-filter" class="filter-input" style="width: 280px;" placeholder="Search Name, 10-digit Health ID, Mobile..." value="${initialQuery}" />
        <select id="member-status-filter" class="filter-input">
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Suspended">Suspended</option>
        </select>
        <select id="member-kyc-filter" class="filter-input">
          <option value="All">All Govt KYC Docs</option>
          <option value="Aadhaar">Aadhaar Card</option>
          <option value="Driving License">Driving License</option>
          <option value="Voter ID">Voter ID</option>
          <option value="Passport">Passport</option>
          <option value="PAN Card">PAN Card</option>
        </select>
        <select id="member-gender-filter" class="filter-input">
          <option value="All">All Genders</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <div style="font-size: 12.5px; color: var(--text-muted);" id="member-result-count">
        Showing ${currentMembers.length} members
      </div>
    </div>

    <!-- Edge-case detection banner (EC-ID-04) -->
    <div id="search-alert-box" style="display: none;"></div>

    <!-- Members Table Card -->
    <div class="card">
      <div class="table-responsive">
        <table class="data-table" id="members-table">
          <thead>
            <tr>
              <th>10-Digit Health ID</th>
              <th>Citizen Member</th>
              <th>Blood Grp</th>
              <th>Verified Govt KYC</th>
              <th>City / Location</th>
              <th>Physical Card</th>
              <th>Enrolled Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="members-table-body">
            <!-- Dynamic rows -->
          </tbody>
        </table>
      </div>
    </div>
  `;

  function updateTableRows(list) {
    const tbody = target.querySelector('#members-table-body');
    const countEl = target.querySelector('#member-result-count');
    if (countEl) countEl.textContent = `Showing ${list.length} members`;

    if (list.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="9" style="text-align: center; padding: 40px; color: var(--text-muted);">
            No members found matching your search.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = list.map(m => {
      const cards = store.getCardsByMemberId(m.id);
      const activeCard = cards.find(c => c.status === 'Active' || c.status === 'Issued');
      const location = [m.address?.city, m.address?.state].filter(Boolean).join(', ') || 'National Territory';
      const enrolledDate = m.createdAt ? formatDate(m.createdAt) : '15 Jan 2026';
      const avatarUrl = m.photoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(m.fullName)}`;

      return `
        <tr>
          <td>
            <span class="id-cell">
              ${m.healthId}
              <button class="btn-copy-id" data-id="${m.healthId}" title="Copy Health ID">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              </button>
            </span>
          </td>
          <td>
            <div class="citizen-cell">
              <img src="${avatarUrl}" class="citizen-avatar" alt="${m.fullName}" />
              <div class="citizen-info">
                <span class="citizen-name">${m.fullName}</span>
                <span class="citizen-sub">${calculateAge(m.dob)} yrs • ${m.gender}</span>
              </div>
            </div>
          </td>
          <td><span class="blood-group-tag">${m.bloodGroup || '—'}</span></td>
          <td>${renderKycBadge(m.kyc)}</td>
          <td><span class="location-cell">${location}</span></td>
          <td>
            ${activeCard ? `<span class="card-status-active">Active Card</span>` : `<span class="card-status-none">Not Issued</span>`}
          </td>
          <td><span class="date-cell">${enrolledDate}</span></td>
          <td>
            <span class="status-indicator status-${m.status.toLowerCase()}">
              <span class="status-dot"></span>
              <span>${m.status}</span>
            </span>
          </td>
          <td>
            <div style="display: flex; gap: 6px; align-items: center;">
              <button class="btn btn-secondary btn-sm btn-member-profile" data-id="${m.id}">Profile</button>
              <button class="btn btn-primary btn-sm btn-member-issue" data-id="${m.id}">${activeCard ? 'Card Details' : 'Issue Card'}</button>
              <button class="btn btn-secondary btn-sm btn-member-edit" data-id="${m.id}" title="Edit Member Details">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
              </button>
              <button class="btn btn-danger btn-sm btn-member-delete" data-id="${m.id}" title="Delete Member">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Attach row listeners
    tbody.querySelectorAll('.btn-member-profile').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const mem = store.getMemberById(id);
        if (mem) {
          selectedMemberForDetail = mem;
          switchView('member-detail', container);
        }
      });
    });

    tbody.querySelectorAll('.btn-member-issue').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        switchView('card-issue', container, { memberId: id });
      });
    });

    tbody.querySelectorAll('.btn-member-edit').forEach(btn => {
      btn.addEventListener('click', () => {
        const mem = store.getMemberById(btn.dataset.id);
        if (mem) {
          openEditMemberModal(mem, container, () => {
            applyFilters();
          });
        }
      });
    });

    tbody.querySelectorAll('.btn-member-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        openDeleteMemberModal(btn.dataset.id, container, () => {
          applyFilters();
        });
      });
    });

    tbody.querySelectorAll('.btn-copy-id').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        navigator.clipboard.writeText(id).then(() => {
          showToast(`Copied Health ID: ${id}`, 'success');
        });
      });
    });
  }

  // Initial populate
  updateTableRows(currentMembers);

  // Search & Filter listeners
  const searchInput = target.querySelector('#member-search-filter');
  const statusFilter = target.querySelector('#member-status-filter');
  const kycFilter = target.querySelector('#member-kyc-filter');
  const genderFilter = target.querySelector('#member-gender-filter');
  const alertBox = target.querySelector('#search-alert-box');

  function applyFilters() {
    const q = searchInput.value.trim();
    const st = statusFilter.value;
    const kd = kycFilter ? kycFilter.value : 'All';
    const gd = genderFilter.value;

    // Check EC-ID-04 (if user enters 10-digit mobile number)
    const cleanDigits = q.replace(/\D/g, '');
    if (cleanDigits.length === 10 && /^[6-9]/.test(cleanDigits)) {
      alertBox.style.display = 'block';
      alertBox.className = 'alert-banner alert-warning';
      alertBox.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12.01" y2="8"/><line x1="12" y1="12" x2="12" y2="16"/></svg>
        <div>
          <strong>EC-ID-04 Mobile Ambiguity Detected:</strong> "${q}" matches Indian mobile format. Filtering records by both Mobile number and 10-digit Health ID.
        </div>
      `;
    } else {
      alertBox.style.display = 'none';
    }

    let filtered = store.getMembers(q, st);
    if (kd !== 'All') {
      filtered = filtered.filter(m => (m.kyc?.documentType || '').toLowerCase().includes(kd.toLowerCase()));
    }
    if (gd !== 'All') {
      filtered = filtered.filter(m => m.gender === gd);
    }
    updateTableRows(filtered);
  }

  searchInput.addEventListener('input', applyFilters);
  statusFilter.addEventListener('change', applyFilters);
  kycFilter?.addEventListener('change', applyFilters);
  genderFilter.addEventListener('change', applyFilters);

  // Register Modal Trigger
  target.querySelector('#btn-open-register-modal')?.addEventListener('click', () => {
    openRegisterMemberModal(container, () => {
      applyFilters();
    });
  });
}

/**
 * ==========================================================================
 * VIEW 3: MEMBER PROFILE DETAIL
 * ==========================================================================
 */
function renderMemberDetailView(target, container, member) {
  if (!member) {
    target.innerHTML = `<div class="alert-banner alert-warning">No member selected. <a href="#" id="back-to-members">Back to Directory</a></div>`;
    target.querySelector('#back-to-members')?.addEventListener('click', () => switchView('members', container));
    return;
  }

  const cards = store.getCardsByMemberId(member.id);
  const orders = store.data.orders.filter(o => o.memberId === member.id);

  target.innerHTML = `
    <div style="margin-bottom: 16px;">
      <button class="btn btn-secondary btn-sm" id="btn-back-to-directory">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        <span>Back to Directory</span>
      </button>
    </div>

    <!-- Header Card with Health ID -->
    <div class="card" style="padding: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px;">
      <div style="display: flex; align-items: center; gap: 16px;">
        ${member.photoUrl ? `
          <img src="${member.photoUrl}" style="width: 52px; height: 52px; border-radius: 6px; object-fit: cover; border: 1px solid var(--border-color); flex-shrink: 0;" alt="${member.fullName}" />
        ` : `
          <div style="width: 52px; height: 52px; border-radius: 6px; background-color: var(--bg-surface-subtle); display: flex; align-items: center; justify-content: center; color: var(--text-muted); flex-shrink: 0;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>
          </div>
        `}
        <div>
          <div style="display: flex; align-items: center; gap: 12px;">
            <h2 style="font-size: 22px; font-weight: 700; color: var(--text-main); margin: 0;">${member.fullName}</h2>
            <span class="status-indicator status-${member.status.toLowerCase()}">
              <span class="status-dot"></span>
              <span>${member.status}</span>
            </span>
          </div>
          <div style="display: flex; align-items: center; gap: 16px; margin-top: 6px; color: var(--text-muted); font-size: 13px;">
            <span>Health ID: <strong class="font-mono" style="color: var(--text-main);">${member.healthId}</strong></span>
            <button class="btn-copy-id" data-id="${member.healthId}" title="Copy Health ID">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            </button>
            <span>•</span>
            <span>Registered: ${formatDate(member.createdAt)}</span>
          </div>
        </div>
      </div>
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        <button class="btn btn-primary" id="btn-profile-issue-card">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
          <span>Issue New Card</span>
        </button>
        <button class="btn btn-secondary" id="btn-profile-edit-member">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
          <span>Edit Details</span>
        </button>
        <button class="btn btn-danger" id="btn-profile-delete-member">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
          <span>Delete Member</span>
        </button>
      </div>
    </div>

    <!-- Grid Details -->
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px;">
      
      <!-- Demographics -->
      <div class="card" style="margin-bottom: 0;">
        <div class="card-header">
          <h3 class="card-title">Demographics & Verification</h3>
        </div>
        <div class="card-body" style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
          <div>
            <div class="text-muted" style="font-size: 11.5px;">Date of Birth</div>
            <div class="font-semibold">${formatDate(member.dob)} (${calculateAge(member.dob)})</div>
          </div>
          <div>
            <div class="text-muted" style="font-size: 11.5px;">Sex / Gender</div>
            <div class="font-semibold">${member.gender}</div>
          </div>
          <div>
            <div class="text-muted" style="font-size: 11.5px;">Verification Phone (Encrypted)</div>
            <div class="font-semibold font-mono">
              •••••• ${member.mobile ? member.mobile.slice(-4) : '3210'}
              <span style="font-size: 11px; color: #059669; font-weight: 500; margin-left: 6px;">(OTP Verified)</span>
            </div>
          </div>
          <div>
            <div class="text-muted" style="font-size: 11.5px;">Blood Group</div>
            <div><span class="blood-group-tag" style="font-size: 15px;">${member.bloodGroup || 'Not recorded'}</span></div>
          </div>
          <div>
            <div class="text-muted" style="font-size: 11.5px; margin-bottom: 3px;">Govt ID & KYC Status</div>
            <div style="display:flex; align-items:center; gap:6px; flex-wrap:wrap;">
              ${renderKycBadge(member.kyc)}
              ${member.kyc?.documentNumber ? `<span class="font-mono text-muted" style="font-size: 12px; background: #f1f5f9; padding: 1px 6px; border-radius: 3px;">${member.kyc.documentNumber}</span>` : ''}
            </div>
          </div>
          <div>
            <div class="text-muted" style="font-size: 11.5px;">Email Address</div>
            <div>${member.email || '—'} ${member.email ? '<span style="font-size: 11px; color: #059669; font-weight: 500; margin-left: 4px;">(OTP Verified)</span>' : ''}</div>
          </div>
          <div style="grid-column: span 2;">
            <div class="text-muted" style="font-size: 11.5px;">Residential Address</div>
            <div>${member.address?.street || ''}, ${member.address?.city || ''}, ${member.address?.state || ''} - ${member.address?.pinCode || ''}</div>
          </div>
        </div>
      </div>

      <!-- Emergency Contact -->
      <div class="card" style="margin-bottom: 0;">
        <div class="card-header">
          <h3 class="card-title">Emergency Contact & Safeguards</h3>
        </div>
        <div class="card-body">
          <div class="alert-banner alert-info" style="margin-bottom: 16px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <div>
              <strong>Emergency First-Responder Access (ACC-09)</strong>
              <div style="font-size: 11.5px; opacity: 0.9;">Emergency contact details are accessible via emergency responder scan.</div>
            </div>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 14px;">
            <div>
              <div class="text-muted" style="font-size: 11.5px;">Contact Person</div>
              <div class="font-semibold">${member.emergencyContact?.name || '—'}</div>
            </div>
            <div>
              <div class="text-muted" style="font-size: 11.5px;">Relationship</div>
              <div class="font-semibold">${member.emergencyContact?.relation || '—'}</div>
            </div>
            <div style="grid-column: span 2;">
              <div class="text-muted" style="font-size: 11.5px;">Emergency Phone</div>
              <div class="font-semibold font-mono">${member.emergencyContact?.phone || '—'}</div>
            </div>
          </div>
        </div>
      </div>

    </div>

    <!-- Linked Physical Cards History (CARD-08) -->
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Linked Physical HealthCards (${cards.length})</h3>
      </div>
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>10-Digit Card ID</th>
              <th>Template</th>
              <th>Opaque Token Hash</th>
              <th>Issued At</th>
              <th>Status</th>
              <th>Card Actions</th>
            </tr>
          </thead>
          <tbody>
            ${cards.length === 0 ? `
              <tr><td colspan="6" style="text-align: center; padding: 24px; color: var(--text-muted);">No physical cards issued yet for this member.</td></tr>
            ` : cards.map(c => `
              <tr>
                <td class="font-mono font-semibold" style="color: var(--color-primary);">${c.healthId}</td>
                <td><span class="font-mono text-muted" style="font-size: 12px;">${c.templateId}</span></td>
                <td class="font-mono text-muted" style="font-size: 11px;">${c.tokenHash.slice(0, 16)}...</td>
                <td>${formatDate(c.issuedAt, true)}</td>
                <td>
                  <span class="status-indicator status-${c.status.toLowerCase()}">
                    <span class="status-dot"></span>
                    <span>${c.status}</span>
                  </span>
                </td>
                <td>
                  <div style="display: flex; gap: 6px; align-items: center; flex-wrap: wrap;">
                    <button class="btn btn-secondary btn-sm btn-preview-card" data-id="${c.id}" title="View Details & QR">Details</button>
                    <button class="btn btn-secondary btn-sm btn-edit-card" data-id="${c.id}" title="Edit Card Information">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                    </button>
                    ${c.status === 'Issued' ? `
                      <button class="btn btn-primary btn-sm btn-activate-card" data-id="${c.id}">Activate</button>
                    ` : ''}
                    ${c.status === 'Active' ? `
                      <button class="btn btn-danger btn-sm btn-block-card" data-id="${c.id}">Block</button>
                      <button class="btn btn-secondary btn-sm btn-replace-card" data-id="${c.id}">Replace</button>
                    ` : ''}
                    <button class="btn btn-danger btn-sm btn-delete-card" data-id="${c.id}" title="Delete Card">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  // Attach Profile listeners
  target.querySelector('#btn-back-to-directory')?.addEventListener('click', () => switchView('members', container));
  
  target.querySelector('#btn-profile-issue-card')?.addEventListener('click', () => {
    switchView('card-issue', container, { memberId: member.id });
  });

  target.querySelector('#btn-profile-edit-member')?.addEventListener('click', () => {
    openEditMemberModal(member, container, (updated) => {
      selectedMemberForDetail = updated;
      renderMemberDetailView(target, container, updated);
    });
  });

  target.querySelector('#btn-profile-delete-member')?.addEventListener('click', () => {
    openDeleteMemberModal(member.id, container, () => {
      switchView('members', container);
    });
  });

  target.querySelectorAll('.btn-preview-card').forEach(btn => {
    btn.addEventListener('click', () => {
      const c = store.getCardById(btn.dataset.id);
      if (c) openCardPreviewModal(c, member, container, () => {
        renderMemberDetailView(target, container, member);
      });
    });
  });

  target.querySelectorAll('.btn-edit-card').forEach(btn => {
    btn.addEventListener('click', () => {
      const c = store.getCardById(btn.dataset.id);
      if (c) {
        openEditCardModal(c, container, () => {
          renderMemberDetailView(target, container, member);
        });
      }
    });
  });

  target.querySelectorAll('.btn-delete-card').forEach(btn => {
    btn.addEventListener('click', () => {
      openDeleteCardModal(btn.dataset.id, container, () => {
        renderMemberDetailView(target, container, member);
      });
    });
  });

  target.querySelectorAll('.btn-activate-card').forEach(btn => {
    btn.addEventListener('click', () => {
      store.activateCard(btn.dataset.id);
      showToast('Card successfully activated!', 'success');
      renderMemberDetailView(target, container, member);
    });
  });

  target.querySelectorAll('.btn-block-card').forEach(btn => {
    btn.addEventListener('click', () => {
      openBlockCardModal(btn.dataset.id, container, () => {
        renderMemberDetailView(target, container, member);
      });
    });
  });

  target.querySelectorAll('.btn-replace-card').forEach(btn => {
    btn.addEventListener('click', () => {
      if (confirm('Issuing a replacement will revoke the old token and generate a new physical card order (CARD-06). Proceed?')) {
        const result = store.replaceCard(btn.dataset.id, 'Member requested physical card replacement');
        showToast(`Replacement Card for member ${result.card.healthId} created!`, 'success');
        renderMemberDetailView(target, container, member);
      }
    });
  });

  target.querySelector('.btn-copy-id')?.addEventListener('click', () => {
    navigator.clipboard.writeText(member.healthId).then(() => {
      showToast(`Copied Health ID: ${member.healthId}`, 'success');
    });
  });
}

/**
 * ==========================================================================
 * VIEW 4: PHYSICAL CARD ISSUING WIZARD (PRD §7.2, §8.1)
 * ==========================================================================
 */
function renderCardIssueWizard(target, container, params = {}) {
  const members = store.data.members;
  let selectedMemberId = params.memberId || (members[0] ? members[0].id : '');
  let selectedTemplate = 'teal'; // teal, slate, blue

  target.innerHTML = `
    <div class="page-title-bar">
      <div>
        <h2 class="page-title">Physical Card Issuing Wizard</h2>
        <p class="page-description">Generate CR80 PVC Card, 128-bit opaque token, QR code, and verify before dispatch (CARD-01, CARD-03).</p>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 360px 1fr; gap: 24px; align-items: flex-start;">
      
      <!-- Wizard Configuration Form -->
      <div class="card" style="margin-bottom: 0;">
        <div class="card-header">
          <h3 class="card-title">1. Card Configuration</h3>
        </div>
        <div class="card-body">
          <form id="card-wizard-form">
            
            <div class="form-group" style="margin-bottom: 16px;">
              <label for="wizard-member-select">Select Registered Member *</label>
              <select id="wizard-member-select" class="form-control" required>
                ${members.map(m => `
                  <option value="${m.id}" ${m.id === selectedMemberId ? 'selected' : ''}>
                    ${m.fullName} (${m.healthId})
                  </option>
                `).join('')}
              </select>
            </div>

            <div class="form-group" style="margin-bottom: 16px;">
              <label>Select Card Theme Template (CARD-10)</label>
              <div style="display: flex; gap: 8px; margin-top: 4px;">
                <button type="button" class="btn btn-sm btn-template-select ${selectedTemplate === 'teal' ? 'btn-primary' : 'btn-secondary'}" data-tmpl="teal">Clinical Teal</button>
                <button type="button" class="btn btn-sm btn-template-select ${selectedTemplate === 'slate' ? 'btn-primary' : 'btn-secondary'}" data-tmpl="slate">Slate Dark</button>
                <button type="button" class="btn btn-sm btn-template-select ${selectedTemplate === 'blue' ? 'btn-primary' : 'btn-secondary'}" data-tmpl="blue">National Blue</button>
              </div>
            </div>

            <!-- Mandatory Pre-Activation Checklist (CARD-03) -->
            <div style="background-color: #f8fafc; border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px; margin-bottom: 20px;">
              <div style="font-size: 12px; font-weight: 700; color: var(--text-main); margin-bottom: 8px; text-transform: uppercase;">
                Pre-Issuance Verification Checklist
              </div>
              <div style="display: flex; flex-direction: column; gap: 8px; font-size: 12.5px;">
                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                  <input type="checkbox" id="check-name-match" checked />
                  <span>Member identity matches Legal ID</span>
                </label>
                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                  <input type="checkbox" id="check-qr-resolve" checked />
                  <span>Opaque Token Hash generated</span>
                </label>
                <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
                  <input type="checkbox" id="check-nfc-linked" checked />
                  <span>NTAG 424 DNA NFC capability ready</span>
                </label>
              </div>
            </div>

            <div style="display: flex; flex-direction: column; gap: 10px;">
              <button type="button" class="btn btn-primary" id="btn-wizard-issue" style="width: 100%; height: 40px; font-weight: 600;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                <span>Issue & Register Card</span>
              </button>
              
              <button type="button" class="btn btn-secondary" id="btn-wizard-print" style="width: 100%;">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                <span>Print PDF / Direct Print</span>
              </button>
            </div>

          </form>
        </div>
      </div>

      <!-- Live Interactive Card Preview (CR80 Standard) -->
      <div class="card" style="margin-bottom: 0;">
        <div class="card-header">
          <h3 class="card-title">2. Live Physical Card Preview (Front & Back)</h3>
          <span class="font-mono" style="font-size: 11px; color: var(--text-muted); font-weight: 600;">CR80 SPEC (85.6mm × 54mm)</span>
        </div>
        <div class="card-body">
          <div class="card-preview-container" id="print-card-target">
            <div class="card-sides-wrapper">
              
              <!-- Front Side -->
              <div class="healthcard-physical template-${selectedTemplate}" id="card-front-view">
                <div class="card-top">
                  <div class="card-emblem">
                    <div class="emblem-icon">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    </div>
                    <span class="card-org-title">NATIONAL HEALTH RECORD</span>
                  </div>
                  <div class="nfc-symbol">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2"><path d="M6 8.5a6.5 6.5 0 0 1 12 0M8.5 12a3.5 3.5 0 0 1 7 0M11 15.5a1 1 0 0 1 2 0"/></svg>
                  </div>
                </div>

                <div class="card-middle" style="display: flex; justify-content: space-between; align-items: center; gap: 10px;">
                  <div style="flex: 1; min-width: 0;">
                    <div class="card-patient-name" id="preview-patient-name">RAHUL SHARMA</div>
                    <div class="card-id-label">National Health ID</div>
                    <div class="card-health-id" id="preview-health-id">74839 16251</div>
                    <div style="margin-top: 4px;">
                      <span id="preview-blood-group" style="color: #ef4444; font-weight: 800; font-size: 11px; background: rgba(0,0,0,0.35); padding: 1px 6px; border-radius: 3px; letter-spacing: 0.03em;">
                        BLOOD: O+
                      </span>
                    </div>
                  </div>
                  <div id="preview-photo-wrap" style="width: 48px; height: 58px; border-radius: 4px; border: 1.5px solid rgba(255,255,255,0.7); overflow: hidden; background: rgba(255,255,255,0.2); flex-shrink: 0; display: none;">
                    <img id="preview-patient-photo" src="" style="width: 100%; height: 100%; object-fit: cover;" alt="Citizen Photo" />
                  </div>
                </div>

                <div class="card-bottom">
                  <span style="font-family: var(--font-family-mono); font-size: 10.5px; font-weight: 700; letter-spacing: 0.04em;">CARD NO: <span id="preview-card-bottom-id">74839 16251</span></span>
                  <span style="font-size: 9px; opacity: 0.85; font-weight: 600;">STATUS: ACTIVE</span>
                </div>
              </div>

              <!-- Back Side -->
              <div class="healthcard-physical card-back" id="card-back-view">
                <div class="card-back-qr">
                  <canvas id="wizard-qr-canvas"></canvas>
                  <span style="font-size: 8px; color: #64748b; margin-top: 3px; font-weight: 600;">SCAN FOR ACCESS</span>
                </div>
                <div class="card-back-info">
                  <div class="card-back-disclaimer">
                    <strong>SECURITY NOTICE:</strong> This card carries only a revocable digital token. Medical records remain encrypted in cloud vaults. Access requires patient OTP / App consent.
                  </div>
                  <div class="card-back-meta">
                    <div>24x7 Helpline: <strong class="card-helpline">1800-890-4325</strong></div>
                    <div>Portal: <strong>healthcard.gov.in</strong></div>
                    <div style="font-size: 8px; color: #94a3b8; margin-top: 2px;">Template: TC-V1.0 • Opaque Token Protected</div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

    </div>
  `;

  // Function to update preview from selected member
  function updateLiveCardPreview() {
    const memId = target.querySelector('#wizard-member-select').value;
    const mem = store.getMemberById(memId);
    if (!mem) return;

    const nameEl = target.querySelector('#preview-patient-name');
    const idEl = target.querySelector('#preview-health-id');
    const serialEl = target.querySelector('#preview-card-serial');
    const frontEl = target.querySelector('#card-front-view');
    const bloodEl = target.querySelector('#preview-blood-group');
    const photoWrap = target.querySelector('#preview-photo-wrap');
    const photoEl = target.querySelector('#preview-patient-photo');

    if (nameEl) nameEl.textContent = mem.fullName.toUpperCase();
    if (idEl) idEl.textContent = mem.healthId;
    const bottomIdEl = target.querySelector('#preview-card-bottom-id');
    if (bottomIdEl) bottomIdEl.textContent = mem.healthId;
    if (bloodEl) bloodEl.textContent = `BLOOD: ${mem.bloodGroup || '—'}`;

    if (photoWrap && photoEl) {
      if (mem.photoUrl) {
        photoWrap.style.display = 'block';
        photoEl.src = mem.photoUrl;
      } else {
        photoWrap.style.display = 'none';
      }
    }
    
    if (frontEl) {
      frontEl.className = `healthcard-physical template-${selectedTemplate}`;
    }

    // Render QR Code on back
    const canvas = target.querySelector('#wizard-qr-canvas');
    if (canvas) {
      const opaqueToken = `tok_${Math.random().toString(36).slice(2, 10)}`;
      const url = `https://hc.example.in/c/${opaqueToken}`;
      QRCode.toCanvas(canvas, url, {
        width: 100,
        margin: 1,
        color: {
          dark: '#0f172a',
          light: '#ffffff'
        }
      }).catch(err => console.error('QR Error:', err));
    }
  }

  // Member select change
  const memberSelect = target.querySelector('#wizard-member-select');
  memberSelect.addEventListener('change', updateLiveCardPreview);

  // Template select buttons
  target.querySelectorAll('.btn-template-select').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedTemplate = btn.dataset.tmpl;
      target.querySelectorAll('.btn-template-select').forEach(b => {
        b.className = `btn btn-sm btn-template-select ${b.dataset.tmpl === selectedTemplate ? 'btn-primary' : 'btn-secondary'}`;
      });
      updateLiveCardPreview();
    });
  });

  // Issue button
  target.querySelector('#btn-wizard-issue')?.addEventListener('click', () => {
    const memId = memberSelect.value;
    const nameMatch = target.querySelector('#check-name-match').checked;
    if (!nameMatch) {
      showToast('Please complete identity verification check before issuing', 'warning');
      return;
    }

    try {
      const result = store.issueCard(memId, `${selectedTemplate}_standard`);
      showToast(`Card for member ${result.card.healthId} issued! Fulfillment order created.`, 'success');
      switchView('fulfillment', container);
    } catch (e) {
      showToast(e.message, 'error');
    }
  });

  // Direct Print button
  target.querySelector('#btn-wizard-print')?.addEventListener('click', () => {
    window.print();
  });

  // Trigger initial QR render
  updateLiveCardPreview();
}

/**
 * ==========================================================================
 * VIEW 5: FULFILLMENT & DISPATCH PIPELINE (PRD §7.3)
 * ==========================================================================
 */
function renderFulfillmentView(target, container) {
  const orders = store.getOrders();

  const lanes = [
    { id: 'Generated', title: '1. Generated / In Queue', count: orders.filter(o => o.status === 'Generated').length },
    { id: 'Printing', title: '2. Printing PVC Card', count: orders.filter(o => o.status === 'Printing').length },
    { id: 'Ready', title: '3. Ready for Dispatch', count: orders.filter(o => o.status === 'Ready').length },
    { id: 'Dispatched', title: '4. Dispatched / In Transit', count: orders.filter(o => o.status === 'Dispatched').length },
    { id: 'Delivered', title: '5. Delivered to Citizen', count: orders.filter(o => o.status === 'Delivered').length }
  ];

  target.innerHTML = `
    <div class="page-title-bar">
      <div>
        <h2 class="page-title">Physical Card Fulfillment Pipeline</h2>
        <p class="page-description">Manage printing batches, courier logistics, and citizen delivery tracking (FUL-01 to FUL-04).</p>
      </div>
    </div>

    <!-- Fulfillment Kanban Board -->
    <div class="kanban-board">
      ${lanes.map(lane => `
        <div class="kanban-col">
          <div class="kanban-col-header">
            <span>${lane.title}</span>
            <span class="kanban-col-count">${lane.count}</span>
          </div>
          <div class="kanban-cards-list">
            ${orders.filter(o => o.status === lane.id).map(o => `
              <div class="kanban-card btn-order-card" data-id="${o.id}">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
                  <span class="font-semibold" style="color: var(--text-main); font-size: 13px;">${o.recipientName}</span>
                  <span class="font-mono text-muted" style="font-size: 11px; font-weight: 600;">#${o.id}</span>
                </div>
                <div style="font-size: 11.5px; color: var(--text-secondary); margin-bottom: 6px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                  ${o.address}
                </div>
                <div style="font-size: 11px; color: var(--text-muted); border-top: 1px solid var(--border-subtle); padding-top: 6px; display: flex; justify-content: space-between;">
                  <span>${o.courier || 'No Courier'}</span>
                  <span>${timeAgo(o.createdAt)}</span>
                </div>
              </div>
            `).join('')}
            ${orders.filter(o => o.status === lane.id).length === 0 ? `
              <div style="padding: 20px; text-align: center; color: var(--text-muted); font-size: 12px;">No orders in this stage</div>
            ` : ''}
          </div>
        </div>
      `).join('')}
    </div>
  `;

  // Attach card click listener
  target.querySelectorAll('.btn-order-card').forEach(card => {
    card.addEventListener('click', () => {
      const orderId = card.dataset.id;
      const order = store.data.orders.find(o => o.id === orderId);
      if (order) openEditOrderModal(order, container);
    });
  });
}

/**
 * ==========================================================================
 * VIEW 6: VERIFIED ORGANIZATIONS & STAFF (PRD §7.6)
 * ==========================================================================
 */
function renderOrganizationsView(target, container) {
  const orgs = store.getOrganizations();

  target.innerHTML = `
    <div class="page-title-bar">
      <div>
        <h2 class="page-title">Verified Healthcare Organizations</h2>
        <p class="page-description">Hospitals, Clinics, and Pathology Labs with verified credentials (ORG-01 to ORG-05).</p>
      </div>
    </div>

    <div class="card">
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Reg. Number</th>
              <th>Organization Name</th>
              <th>Facility Type</th>
              <th>Location</th>
              <th>Staff Members</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${orgs.map(org => `
              <tr>
                <td class="font-mono font-semibold">${org.regNumber}</td>
                <td class="font-semibold">${org.name}</td>
                <td><span style="font-size: 12.5px; color: var(--text-secondary);">${org.type}</span></td>
                <td>${org.city}, ${org.state}</td>
                <td>${org.staffCount} Active Staff</td>
                <td>
                  <span class="status-indicator status-${org.status === 'Verified' ? 'active' : org.status === 'Pending KYC' ? 'pending' : 'blocked'}">
                    <span class="status-dot"></span>
                    <span>${org.status}</span>
                  </span>
                </td>
                <td>
                  <div style="display: flex; gap: 6px;">
                    ${org.status !== 'Verified' ? `
                      <button class="btn btn-primary btn-sm btn-verify-org" data-id="${org.id}">Verify Org</button>
                    ` : `
                      <button class="btn btn-danger btn-sm btn-suspend-org" data-id="${org.id}">Suspend</button>
                    `}
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  target.querySelectorAll('.btn-verify-org').forEach(btn => {
    btn.addEventListener('click', () => {
      store.updateOrgStatus(btn.dataset.id, 'Verified');
      showToast('Organization verified! Staff can now access clinical workflows.', 'success');
      renderOrganizationsView(target, container);
    });
  });

  target.querySelectorAll('.btn-suspend-org').forEach(btn => {
    btn.addEventListener('click', () => {
      if (confirm('Suspending this organization will instantly freeze all staff sessions and access grants (ORG-05). Confirm suspension?')) {
        store.updateOrgStatus(btn.dataset.id, 'Suspended');
        showToast('Organization suspended!', 'error');
        renderOrganizationsView(target, container);
      }
    });
  });
}

/**
 * ==========================================================================
 * VIEW 7: AUDIT EXPLORER & SECURITY CENTER (PRD §7.7 ADM-02, ADM-03)
 * ==========================================================================
 */
function renderAuditView(target, container) {
  const logs = store.getAuditLogs();

  target.innerHTML = `
    <div class="page-title-bar">
      <div>
        <h2 class="page-title">Immutable Audit Log & Security Center</h2>
        <p class="page-description">Append-only provenance trail of every card issuance, access grant, and administrative change.</p>
      </div>
      <div class="page-actions">
        <button class="btn btn-secondary btn-sm" id="btn-export-audit">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          <span>Export Audit CSV</span>
        </button>
      </div>
    </div>

    <div class="card">
      <div class="table-responsive">
        <table class="data-table">
          <thead>
            <tr>
              <th>Timestamp (IST)</th>
              <th>Actor</th>
              <th>Role</th>
              <th>Event Action</th>
              <th>Target Resource</th>
              <th>IP Address</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${logs.map(log => `
              <tr>
                <td style="white-space: nowrap;">${formatDate(log.timestamp, true)}</td>
                <td class="font-semibold">${log.actor}</td>
                <td><span style="font-size: 12px; color: var(--text-secondary);">${log.role}</span></td>
                <td class="font-mono font-semibold" style="color: var(--color-primary);">${log.action}</td>
                <td>${log.target}</td>
                <td class="font-mono text-muted">${log.ipAddress}</td>
                <td>
                  <span class="status-indicator status-${log.status.toLowerCase()}">
                    <span class="status-dot"></span>
                    <span>${log.status}</span>
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;

  target.querySelector('#btn-export-audit')?.addEventListener('click', () => {
    showToast('Exporting immutable audit logs...', 'info');
  });
}

/**
 * ==========================================================================
 * MODALS & DIALOGS
 * ==========================================================================
 */

/**
 * Stream & Media Management
 */
let activeMediaStreams = [];

function stopAllActiveStreams() {
  activeMediaStreams.forEach(stream => {
    try {
      stream.getTracks().forEach(track => track.stop());
    } catch(e) {}
  });
  activeMediaStreams = [];
}

/**
 * Modal Helper: Closes active modal and cleans up background scroll lock
 */
function closeActiveModal() {
  stopAllActiveStreams();
  const modalContainer = document.getElementById('modal-container');
  if (modalContainer) {
    modalContainer.innerHTML = '';
  }
  document.body.classList.remove('modal-open');
}

/**
 * Modal: Register New Member (Full Screen Onboarding, ID-03 Duplicate Check)
 */
function openRegisterMemberModal(container, onSuccess) {
  const modalContainer = document.getElementById('modal-container');
  if (!modalContainer) return;

  const generatedId = generateHealthId();

  // State for citizen photo & KYC document
  let citizenPhotoData = null;
  let govtDocData = null;
  let selectedKycType = 'Aadhaar Card';
  let kycSourceMode = 'Device Upload';

  // Lock background website scrolling
  document.body.classList.add('modal-open');

  modalContainer.innerHTML = `
    <div class="modal-backdrop" id="register-modal-backdrop">
      <div class="modal modal-onboarding">
        <div class="modal-header">
          <h3 class="modal-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2.2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
            <span>Citizen Member Registration & Onboarding</span>
          </h3>
          <button class="modal-close" id="btn-close-register-modal" title="Close Dialog">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <form id="new-member-form">
          <div class="modal-body">
            
            <div class="alert-banner alert-info" style="margin-bottom: 20px;">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              <div>
                <strong>Auto-Assigned 10-Digit National Health ID:</strong>
                <span class="font-mono" style="font-size: 15px; font-weight: 700; margin-left: 8px; color: var(--color-primary);">${generatedId}</span>
                <span style="font-size: 11.5px; margin-left: 8px; color: var(--text-muted);">(Format: 5-5 digit standard partition per PRD Section 6.1)</span>
              </div>
            </div>

            <!-- Duplicate Warning Container (ID-03) -->
            <div id="duplicate-warning-box" style="display: none; margin-bottom: 20px;" class="alert-banner alert-warning"></div>

            <!-- SECTION 1: Personal & Legal Demographics -->
            <div class="modal-section-title">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>
              <span>1. Demographics & Legal Identity</span>
            </div>

            <div class="form-grid">
              <div class="form-group form-full">
                <label for="mem-fullname">Full Legal Name (as verified in Govt ID) *</label>
                <input type="text" id="mem-fullname" class="form-control" placeholder="e.g. Rajesh Kumar Verma" required />
              </div>

              <div class="form-group form-dob-group">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                  <label style="font-weight: 600; font-size: 13px; color: var(--text-main); margin-bottom: 0;">Date of Birth *</label>
                  <span id="mem-dob-age-badge" style="font-size: 11px; font-weight: 600; color: #1d4ed8; background: #eff6ff; border: 1px solid #bfdbfe; padding: 1px 8px; border-radius: 12px; display: none;">Age: --</span>
                </div>
                <div class="dob-select-grid">
                  <select id="mem-dob-day" class="form-control" required>
                    <option value="">Day</option>
                    ${Array.from({length: 31}, (_, i) => {
                      const d = String(i + 1).padStart(2, '0');
                      return `<option value="${d}">${d}</option>`;
                    }).join('')}
                  </select>
                  <select id="mem-dob-month" class="form-control" required>
                    <option value="">Month</option>
                    <option value="01">Jan (01)</option>
                    <option value="02">Feb (02)</option>
                    <option value="03">Mar (03)</option>
                    <option value="04">Apr (04)</option>
                    <option value="05">May (05)</option>
                    <option value="06">Jun (06)</option>
                    <option value="07">Jul (07)</option>
                    <option value="08">Aug (08)</option>
                    <option value="09">Sep (09)</option>
                    <option value="10">Oct (10)</option>
                    <option value="11">Nov (11)</option>
                    <option value="12">Dec (12)</option>
                  </select>
                  <select id="mem-dob-year" class="form-control" required>
                    <option value="">Year</option>
                    ${Array.from({length: 105}, (_, i) => {
                      const yr = 2026 - i;
                      return `<option value="${yr}">${yr}</option>`;
                    }).join('')}
                  </select>
                </div>
                <input type="hidden" id="mem-dob" required />
              </div>

              <div class="form-group">
                <label for="mem-gender">Sex / Gender *</label>
                <select id="mem-gender" class="form-control" required>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other / Non-Binary</option>
                </select>
              </div>

              <div class="form-group">
                <label for="mem-bloodgroup">Blood Group *</label>
                <select id="mem-bloodgroup" class="form-control" required>
                  <option value="">Select Blood Group</option>
                  <option value="O+">O Positive (O+)</option>
                  <option value="O-">O Negative (O-)</option>
                  <option value="A+">A Positive (A+)</option>
                  <option value="A-">A Negative (A-)</option>
                  <option value="B+">B Positive (B+)</option>
                  <option value="B-">B Negative (B-)</option>
                  <option value="AB+">AB Positive (AB+)</option>
                  <option value="AB-">AB Negative (AB-)</option>
                  <option value="Unknown">Pending Lab Confirmation</option>
                </select>
                <span class="form-hint" style="color: var(--text-muted); font-size: 11.5px; display: flex; align-items: center; gap: 4px; margin-top: 4px;">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <span>Printed in <strong style="color: #dc2626;">bold red</strong> on Physical HealthCard</span>
                </span>
              </div>
            </div>

            <!-- SECTION 2: Citizen Portrait Photo for Physical Card -->
            <div class="modal-section-title">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
              <span>2. Citizen Photo for Physical HealthCard</span>
            </div>

            <div style="margin-bottom: 18px;">
              <div class="capture-tab-group" id="photo-tab-group">
                <button type="button" class="capture-tab-btn active" data-tab="upload-photo">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  <span>Upload from Device</span>
                </button>
                <button type="button" class="capture-tab-btn" data-tab="webcam-photo">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                  <span>Capture with Live Webcam</span>
                </button>
              </div>

              <!-- Upload Photo Subpanel -->
              <div id="panel-upload-photo">
                <div class="upload-dropzone" id="dropzone-photo">
                  <input type="file" id="input-photo-file" accept="image/png, image/jpeg, image/webp" style="display: none;" />
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="1.8" style="margin-bottom: 6px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  <div style="font-size: 13px; font-weight: 600; color: var(--text-main);">Click to browse portrait photo or drag & drop</div>
                  <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">Passport format PNG, JPG, or WEBP (Max 5MB)</div>
                </div>
              </div>

              <!-- Webcam Photo Subpanel -->
              <div id="panel-webcam-photo" style="display: none;">
                <div class="camera-feed-box" id="webcam-photo-box">
                  <video id="webcam-photo-video" playsinline autoplay muted></video>
                  <div class="camera-guide-overlay camera-guide-portrait">Align face in circle</div>
                </div>
                <div style="display: flex; justify-content: center; gap: 10px;">
                  <button type="button" class="btn btn-secondary btn-sm" id="btn-start-photo-cam">Start Camera</button>
                  <button type="button" class="btn btn-primary btn-sm" id="btn-snap-photo-cam">Take Portrait Photo</button>
                </div>
              </div>

              <!-- Photo Result Preview -->
              <div id="preview-photo-card" class="preview-media-card" style="display: none;">
                <img id="preview-photo-img" class="preview-media-thumb" src="" alt="Citizen Photo" />
                <div style="flex: 1;">
                  <div style="font-size: 13px; font-weight: 600; color: #065f46; display: flex; align-items: center; gap: 6px;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                    <span>Cardholder Portrait Ready</span>
                  </div>
                  <div style="font-size: 11.5px; color: #047857; margin-top: 2px;">Will be laser-etched onto PVC Physical HealthCard</div>
                </div>
                <button type="button" class="btn btn-secondary btn-sm" id="btn-retake-photo">Change</button>
              </div>
            </div>

            <!-- SECTION 3: Govt ID Document & KYC Verification -->
            <div class="modal-section-title">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2"/><line x1="7" y1="8" x2="17" y2="8"/><line x1="7" y1="12" x2="12" y2="12"/></svg>
              <span>3. Govt ID Document & KYC Verification</span>
            </div>

            <div style="margin-bottom: 20px;">
              <div style="display: flex; gap: 14px; margin-bottom: 12px; flex-wrap: wrap;">
                <div style="flex: 1; min-width: 200px;">
                  <label for="select-govt-doc-type" style="font-size: 12px; font-weight: 600;">Govt ID Document Type *</label>
                  <select id="select-govt-doc-type" class="form-control" style="margin-top: 4px;">
                    <option value="Aadhaar Card">Aadhaar Card (UIDAI Verified)</option>
                    <option value="Voter ID Card">Voter ID Card (Election Commission)</option>
                    <option value="Indian Passport">Indian Passport (Republic of India)</option>
                    <option value="Driving License">Driving License (State Transport)</option>
                    <option value="PAN Card">PAN Card (Income Tax Dept)</option>
                  </select>
                </div>
                <div style="flex: 1; min-width: 200px;">
                  <label for="input-govt-doc-number" id="lbl-govt-doc-number" style="font-size: 12px; font-weight: 600;">Aadhaar Number (12 Digits) *</label>
                  <input type="text" id="input-govt-doc-number" class="form-control" placeholder="XXXX XXXX XXXX" maxlength="14" style="margin-top: 4px; font-family: var(--font-family-mono);" />
                </div>
              </div>

              <!-- Capture Source Tabs for Govt ID -->
              <div class="capture-tab-group" id="doc-tab-group">
                <button type="button" class="capture-tab-btn active" data-tab="upload-doc">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                  <span>Upload Document</span>
                </button>
                <button type="button" class="capture-tab-btn" data-tab="webcam-doc">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                  <span>Capture with Webcam</span>
                </button>
                <button type="button" class="capture-tab-btn" data-tab="scanner-doc">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                  <span>Printer / Document Scanner</span>
                </button>
              </div>

              <!-- Upload Document Subpanel -->
              <div id="panel-upload-doc">
                <div class="upload-dropzone" id="dropzone-doc">
                  <input type="file" id="input-doc-file" accept="application/pdf, image/png, image/jpeg" style="display: none;" />
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="1.8" style="margin-bottom: 6px;"><rect x="3" y="4" width="18" height="16" rx="2"/><line x1="7" y1="8" x2="17" y2="8"/><line x1="7" y1="12" x2="12" y2="12"/></svg>
                  <div style="font-size: 13px; font-weight: 600; color: var(--text-main);">Click to browse Govt ID scan or drag & drop</div>
                  <div style="font-size: 11px; color: var(--text-muted); margin-top: 2px;">Supported: Scanned PDF, JPEG, PNG (Front & Back)</div>
                </div>
              </div>

              <!-- Webcam Document Subpanel -->
              <div id="panel-webcam-doc" style="display: none;">
                <div class="camera-feed-box" id="webcam-doc-box">
                  <video id="webcam-doc-video" playsinline autoplay muted></video>
                  <div class="camera-guide-overlay">Align Govt ID Card within boundary</div>
                </div>
                <div style="display: flex; justify-content: center; gap: 10px;">
                  <button type="button" class="btn btn-secondary btn-sm" id="btn-start-doc-cam">Start Camera</button>
                  <button type="button" class="btn btn-primary btn-sm" id="btn-snap-doc-cam">Capture ID Card</button>
                </div>
              </div>

              <!-- Flatbed / ADF Document Scanner Subpanel -->
              <div id="panel-scanner-doc" style="display: none;">
                <div class="scanner-console">
                  <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 14px; margin-bottom: 12px;">
                    <div>
                      <label style="font-size: 11.5px; font-weight: 600; color: var(--text-muted);">Station Document Scanner (WIA/TWAIN)</label>
                      <select class="form-control" id="select-scanner-device" style="margin-top: 4px;">
                        <option value="Canon DR-C225">Canon imageFORMULA DR-C225 (USB 3.0)</option>
                        <option value="Fujitsu fi-7160">Fujitsu fi-7160 High-Speed ADF Scanner</option>
                        <option value="HP ScanJet Pro">HP ScanJet Pro 3000 s4 Flatbed</option>
                        <option value="Epson DS-530">Epson WorkForce DS-530 II</option>
                      </select>
                    </div>
                    <div>
                      <label style="font-size: 11.5px; font-weight: 600; color: var(--text-muted);">Scanning DPI</label>
                      <select class="form-control" id="select-scanner-dpi" style="margin-top: 4px;">
                        <option value="300">300 DPI (Clinical High-Res)</option>
                        <option value="600">600 DPI (Ultra Sharp)</option>
                      </select>
                    </div>
                  </div>

                  <div id="scanner-status-area" style="font-size: 12px; color: var(--text-muted); margin-bottom: 8px;">
                    Scanner ready on operator USB port. Place card on glass or feeder.
                  </div>

                  <div id="scanner-progress-bar" class="scanner-progress-bar" style="display: none;">
                    <div id="scanner-progress-fill" class="scanner-progress-fill"></div>
                  </div>

                  <button type="button" class="btn btn-primary btn-sm" id="btn-trigger-scanner">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
                    <span>Trigger Physical Scanner</span>
                  </button>
                </div>
              </div>

              <!-- Document Verification Result Preview -->
              <div id="preview-doc-card" class="preview-media-card" style="display: none;">
                <div style="width: 54px; height: 54px; border-radius: 4px; background: #e0f2fe; display: flex; align-items: center; justify-content: center; color: #0284c7; flex-shrink: 0;">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2"/><line x1="7" y1="8" x2="17" y2="8"/><line x1="7" y1="12" x2="12" y2="12"/></svg>
                </div>
                <div style="flex: 1;">
                  <div style="font-size: 13px; font-weight: 600; color: #065f46; display: flex; align-items: center; gap: 6px;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    <span id="doc-verified-title">Govt ID Authenticated</span>
                  </div>
                  <div id="doc-verified-desc" style="font-size: 11.5px; color: #047857; margin-top: 2px;">
                    UIDAI cryptographic checksum confirmed. Identity claim verified.
                  </div>
                </div>
                <button type="button" class="btn btn-secondary btn-sm" id="btn-re-upload-doc">Rescan</button>
              </div>
            </div>

            <!-- SECTION 4: Contact & Verification (Private / Encrypted) -->
            <div class="modal-section-title">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <span>4. Verification Contact (Encrypted: Never Publicly Displayed)</span>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label for="mem-mobile">Primary Mobile (+91) *</label>
                <input type="tel" id="mem-mobile" class="form-control" placeholder="9876543210" pattern="[6-9][0-9]{9}" required />
                <span class="form-hint">Used strictly for digital signature OTPs. Never displayed on tables or cards.</span>
              </div>

              <div class="form-group">
                <label for="mem-email">Email Address</label>
                <input type="email" id="mem-email" class="form-control" placeholder="name@example.com" />
                <span class="form-hint">Encrypted digital dispatch channel</span>
              </div>
            </div>

            <!-- SECTION 5: Residential Address -->
            <div class="modal-section-title">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              <span>5. Residential Delivery Address</span>
            </div>

            <div class="form-grid">
              <div class="form-group form-full">
                <label for="mem-street">House / Flat, Street Address</label>
                <input type="text" id="mem-street" class="form-control" placeholder="Flat 4B, Lotus Apartments, 12th Main Road" />
              </div>

              <div class="form-group">
                <label for="mem-city">City / District</label>
                <input type="text" id="mem-city" class="form-control" placeholder="e.g. New Delhi" />
              </div>

              <div class="form-group">
                <label for="mem-pincode">Postal PIN Code</label>
                <input type="text" id="mem-pincode" class="form-control" placeholder="e.g. 110016" maxlength="6" />
              </div>
            </div>

            <!-- SECTION 6: Emergency Contact -->
            <div class="modal-section-title">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span>6. Emergency First-Responder Contact</span>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label for="mem-em-name">Contact Person Full Name</label>
                <input type="text" id="mem-em-name" class="form-control" placeholder="e.g. Sunita Verma" />
              </div>

              <div class="form-group">
                <label for="mem-em-relation">Relationship</label>
                <select id="mem-em-relation" class="form-control">
                  <option value="Spouse">Spouse</option>
                  <option value="Parent">Parent</option>
                  <option value="Child">Child</option>
                  <option value="Sibling">Sibling</option>
                  <option value="Guardian">Legal Guardian</option>
                  <option value="Friend">Friend / Other</option>
                </select>
              </div>

              <div class="form-group form-full">
                <label for="mem-em-phone">Emergency Phone (+91)</label>
                <input type="tel" id="mem-em-phone" class="form-control" placeholder="9876543211" />
                <span class="form-hint">Shown strictly to authorized paramedics upon emergency triage scan</span>
              </div>
            </div>

          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="btn-cancel-register">Cancel</button>
            <button type="submit" class="btn btn-primary" id="btn-submit-register">Create Member & Verify KYC</button>
          </div>
        </form>
      </div>
    </div>
  `;

  const backdrop = modalContainer.querySelector('#register-modal-backdrop');
  const closeBtn = modalContainer.querySelector('#btn-close-register-modal');
  const cancelBtn = modalContainer.querySelector('#btn-cancel-register');

  const closeModal = () => closeActiveModal();
  closeBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeModal();
  });

  // Duplicate Check Listener (ID-03)
  const nameInput = modalContainer.querySelector('#mem-fullname');
  const mobileInput = modalContainer.querySelector('#mem-mobile');
  const dobInput = modalContainer.querySelector('#mem-dob');
  const dobDay = modalContainer.querySelector('#mem-dob-day');
  const dobMonth = modalContainer.querySelector('#mem-dob-month');
  const dobYear = modalContainer.querySelector('#mem-dob-year');
  const ageBadge = modalContainer.querySelector('#mem-dob-age-badge');
  const warningBox = modalContainer.querySelector('#duplicate-warning-box');

  function updateDobValue() {
    if (dobDay.value && dobMonth.value && dobYear.value) {
      const isoDate = `${dobYear.value}-${dobMonth.value}-${dobDay.value}`;
      dobInput.value = isoDate;
      const age = calculateAge(isoDate);
      if (ageBadge) {
        ageBadge.textContent = `Age: ${age} yrs (${parseInt(age) >= 18 ? 'Adult' : 'Minor'})`;
        ageBadge.style.display = 'inline-block';
      }
      checkDuplicates();
    } else {
      dobInput.value = '';
      if (ageBadge) ageBadge.style.display = 'none';
    }
  }

  dobDay?.addEventListener('change', updateDobValue);
  dobMonth?.addEventListener('change', updateDobValue);
  dobYear?.addEventListener('change', updateDobValue);

  function checkDuplicates() {
    const mob = mobileInput.value.trim();
    const name = nameInput.value.trim().toLowerCase();
    const dob = dobInput.value;

    const match = store.data.members.find(m => 
      (mob && m.mobile === mob) || 
      (name && dob && m.fullName.toLowerCase() === name && m.dob === dob)
    );

    if (match) {
      warningBox.style.display = 'block';
      warningBox.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        <div>
          <strong>ID-03 Potential Duplicate Detected:</strong> Existing member found matching ${mob === match.mobile ? 'Mobile Number' : 'Name & DOB'}: 
          <strong>${match.fullName} (${match.healthId})</strong>. Per PRD, duplicates must not be auto-merged.
        </div>
      `;
    } else {
      warningBox.style.display = 'none';
    }
  }

  mobileInput.addEventListener('input', checkDuplicates);
  nameInput.addEventListener('input', checkDuplicates);
  dobInput.addEventListener('change', checkDuplicates);

  // -------------------------------------------------------------
  // Photo Tab Switching & Capture Handlers
  // -------------------------------------------------------------
  const photoTabs = modalContainer.querySelectorAll('#photo-tab-group .capture-tab-btn');
  const panelUploadPhoto = modalContainer.querySelector('#panel-upload-photo');
  const panelWebcamPhoto = modalContainer.querySelector('#panel-webcam-photo');
  const dropzonePhoto = modalContainer.querySelector('#dropzone-photo');
  const inputPhotoFile = modalContainer.querySelector('#input-photo-file');
  const previewPhotoCard = modalContainer.querySelector('#preview-photo-card');
  const previewPhotoImg = modalContainer.querySelector('#preview-photo-img');
  const btnRetakePhoto = modalContainer.querySelector('#btn-retake-photo');
  const btnStartPhotoCam = modalContainer.querySelector('#btn-start-photo-cam');
  const btnSnapPhotoCam = modalContainer.querySelector('#btn-snap-photo-cam');
  const videoPhoto = modalContainer.querySelector('#webcam-photo-video');

  photoTabs.forEach(btn => {
    btn.addEventListener('click', () => {
      photoTabs.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tab = btn.dataset.tab;
      if (tab === 'upload-photo') {
        panelUploadPhoto.style.display = 'block';
        panelWebcamPhoto.style.display = 'none';
      } else {
        panelUploadPhoto.style.display = 'none';
        panelWebcamPhoto.style.display = 'block';
        startPhotoCamera();
      }
    });
  });

  dropzonePhoto.addEventListener('click', () => inputPhotoFile.click());
  inputPhotoFile.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        citizenPhotoData = evt.target.result;
        previewPhotoImg.src = citizenPhotoData;
        previewPhotoCard.style.display = 'flex';
        panelUploadPhoto.style.display = 'none';
        panelWebcamPhoto.style.display = 'none';
        showToast('Citizen portrait photo attached!', 'success');
      };
      reader.readAsDataURL(file);
    }
  });

  async function startPhotoCamera() {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' } });
        activeMediaStreams.push(stream);
        videoPhoto.srcObject = stream;
        videoPhoto.play();
      } else {
        throw new Error('Webcam not supported');
      }
    } catch (err) {
      console.warn('Camera stream error:', err);
    }
  }

  btnStartPhotoCam.addEventListener('click', startPhotoCamera);

  btnSnapPhotoCam.addEventListener('click', () => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoPhoto.videoWidth || 320;
      canvas.height = videoPhoto.videoHeight || 240;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoPhoto, 0, 0, canvas.width, canvas.height);
      citizenPhotoData = canvas.toDataURL('image/jpeg', 0.85);
    } catch (e) {
      // Fallback portrait image
      citizenPhotoData = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80";
    }

    if (!citizenPhotoData || citizenPhotoData.length < 50) {
      citizenPhotoData = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80";
    }

    previewPhotoImg.src = citizenPhotoData;
    previewPhotoCard.style.display = 'flex';
    panelWebcamPhoto.style.display = 'none';
    panelUploadPhoto.style.display = 'none';
    showToast('Portrait photo captured from webcam!', 'success');
  });

  btnRetakePhoto.addEventListener('click', () => {
    citizenPhotoData = null;
    previewPhotoCard.style.display = 'none';
    panelUploadPhoto.style.display = 'block';
    photoTabs[0].click();
  });

  // -------------------------------------------------------------
  // Govt ID Document / KYC Tab Switching & Handlers
  // -------------------------------------------------------------
  const docTabs = modalContainer.querySelectorAll('#doc-tab-group .capture-tab-btn');
  const panelUploadDoc = modalContainer.querySelector('#panel-upload-doc');
  const panelWebcamDoc = modalContainer.querySelector('#panel-webcam-doc');
  const panelScannerDoc = modalContainer.querySelector('#panel-scanner-doc');
  const dropzoneDoc = modalContainer.querySelector('#dropzone-doc');
  const inputDocFile = modalContainer.querySelector('#input-doc-file');
  const previewDocCard = modalContainer.querySelector('#preview-doc-card');
  const docVerifiedTitle = modalContainer.querySelector('#doc-verified-title');
  const docVerifiedDesc = modalContainer.querySelector('#doc-verified-desc');
  const btnReUploadDoc = modalContainer.querySelector('#btn-re-upload-doc');
  const btnStartDocCam = modalContainer.querySelector('#btn-start-doc-cam');
  const btnSnapDocCam = modalContainer.querySelector('#btn-snap-doc-cam');
  const videoDoc = modalContainer.querySelector('#webcam-doc-video');
  const btnTriggerScanner = modalContainer.querySelector('#btn-trigger-scanner');
  const scannerProgressBar = modalContainer.querySelector('#scanner-progress-bar');
  const scannerProgressFill = modalContainer.querySelector('#scanner-progress-fill');
  const scannerStatusArea = modalContainer.querySelector('#scanner-status-area');
  const selectGovtDocType = modalContainer.querySelector('#select-govt-doc-type');
  const inputGovtDocNumber = modalContainer.querySelector('#input-govt-doc-number');
  const lblGovtDocNumber = modalContainer.querySelector('#lbl-govt-doc-number');

  function updateKycNumberField() {
    if (!lblGovtDocNumber || !inputGovtDocNumber) return;
    if (selectedKycType.includes('Aadhaar')) {
      lblGovtDocNumber.textContent = 'Aadhaar Number (12 Digits) *';
      inputGovtDocNumber.placeholder = 'XXXX XXXX XXXX';
      inputGovtDocNumber.maxLength = 14;
    } else if (selectedKycType.includes('PAN')) {
      lblGovtDocNumber.textContent = 'PAN Card Number (10 Alphanumeric) *';
      inputGovtDocNumber.placeholder = 'ABCDE1234F';
      inputGovtDocNumber.maxLength = 10;
    } else if (selectedKycType.includes('Driving')) {
      lblGovtDocNumber.textContent = 'Driving License Number *';
      inputGovtDocNumber.placeholder = 'DL-1420110012345';
      inputGovtDocNumber.maxLength = 20;
    } else if (selectedKycType.includes('Passport')) {
      lblGovtDocNumber.textContent = 'Passport Number *';
      inputGovtDocNumber.placeholder = 'A1234567';
      inputGovtDocNumber.maxLength = 12;
    } else {
      lblGovtDocNumber.textContent = 'Voter ID (EPIC) Number *';
      inputGovtDocNumber.placeholder = 'ABC1234567';
      inputGovtDocNumber.maxLength = 15;
    }
  }

  inputGovtDocNumber?.addEventListener('input', (e) => {
    if (selectedKycType.includes('Aadhaar')) {
      const clean = e.target.value.replace(/\D/g, '').slice(0, 12);
      const parts = [];
      for (let i = 0; i < clean.length; i += 4) {
        parts.push(clean.substring(i, i + 4));
      }
      e.target.value = parts.join(' ');
    } else if (selectedKycType.includes('PAN')) {
      e.target.value = e.target.value.toUpperCase();
    }
  });

  selectGovtDocType.addEventListener('change', () => {
    selectedKycType = selectGovtDocType.value;
    updateKycNumberField();
  });

  docTabs.forEach(btn => {
    btn.addEventListener('click', () => {
      docTabs.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tab = btn.dataset.tab;
      panelUploadDoc.style.display = tab === 'upload-doc' ? 'block' : 'none';
      panelWebcamDoc.style.display = tab === 'webcam-doc' ? 'block' : 'none';
      panelScannerDoc.style.display = tab === 'scanner-doc' ? 'block' : 'none';

      if (tab === 'webcam-doc') {
        startDocCamera();
      }
    });
  });

  dropzoneDoc.addEventListener('click', () => inputDocFile.click());
  inputDocFile.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (file) {
      govtDocData = { name: file.name, size: file.size, type: file.type };
      kycSourceMode = 'Device Upload';
      showDocVerified(`${selectedKycType} Document Uploaded`, `Verified from ${file.name} (${Math.round(file.size/1024)} KB). Cryptographic hash saved.`);
    }
  });

  async function startDocCamera() {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'environment' } });
        activeMediaStreams.push(stream);
        videoDoc.srcObject = stream;
        videoDoc.play();
      }
    } catch (err) {
      console.warn('Doc camera error:', err);
    }
  }

  btnStartDocCam.addEventListener('click', startDocCamera);

  btnSnapDocCam.addEventListener('click', () => {
    govtDocData = { source: 'Webcam Scan', capturedAt: new Date().toISOString() };
    kycSourceMode = 'Webcam Scan';
    showDocVerified(`${selectedKycType} Captured via Camera`, 'OCR boundary and security hologram detected. KYC status verified.');
  });

  btnTriggerScanner.addEventListener('click', () => {
    btnTriggerScanner.disabled = true;
    scannerProgressBar.style.display = 'block';
    scannerProgressFill.style.width = '10%';
    scannerStatusArea.textContent = 'Connecting to flatbed scanner... Initializing optical lamp...';

    setTimeout(() => {
      scannerProgressFill.style.width = '45%';
      scannerStatusArea.textContent = 'Scanning document at 300 DPI Color... Acquiring TWAIN raster...';
    }, 400);

    setTimeout(() => {
      scannerProgressFill.style.width = '85%';
      scannerStatusArea.textContent = 'Calibrating OCR and validating anti-counterfeit guilloche pattern...';
    }, 800);

    setTimeout(() => {
      scannerProgressFill.style.width = '100%';
      scannerStatusArea.textContent = 'Scan completed successfully. Image digitized.';
      btnTriggerScanner.disabled = false;
      govtDocData = { source: 'Document Scanner', scanner: modalContainer.querySelector('#select-scanner-device').value };
      kycSourceMode = 'Document Scanner';
      showDocVerified(`${selectedKycType} Scanned from Station`, `Scanned via ${govtDocData.scanner} at 300 DPI. Tamper-proof hash generated.`);
    }, 1200);
  });

  function showDocVerified(title, desc) {
    docVerifiedTitle.textContent = title;
    docVerifiedDesc.textContent = desc;
    previewDocCard.style.display = 'flex';
    panelUploadDoc.style.display = 'none';
    panelWebcamDoc.style.display = 'none';
    panelScannerDoc.style.display = 'none';
    showToast('Govt ID authenticated & verified!', 'success');
  }

  btnReUploadDoc.addEventListener('click', () => {
    govtDocData = null;
    previewDocCard.style.display = 'none';
    docTabs[0].click();
  });

  // Submit Handler
  const form = modalContainer.querySelector('#new-member-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const genderVal = modalContainer.querySelector('#mem-gender').value;
    const defaultPhoto = genderVal === 'Female' 
      ? "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80"
      : "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80";

    const newMember = store.addMember({
      healthId: generatedId,
      fullName: nameInput.value.trim(),
      dob: dobInput.value,
      gender: genderVal,
      mobile: mobileInput.value.trim(),
      email: modalContainer.querySelector('#mem-email').value.trim(),
      bloodGroup: modalContainer.querySelector('#mem-bloodgroup').value,
      photoUrl: citizenPhotoData || defaultPhoto,
      kyc: {
        documentType: selectedKycType,
        documentNumber: inputGovtDocNumber ? inputGovtDocNumber.value.trim() : '',
        status: 'Verified',
        source: kycSourceMode,
        verifiedAt: new Date().toISOString()
      },
      address: {
        street: modalContainer.querySelector('#mem-street').value.trim(),
        city: modalContainer.querySelector('#mem-city').value.trim(),
        state: "Delhi",
        pinCode: modalContainer.querySelector('#mem-pincode').value.trim()
      },
      emergencyContact: {
        name: modalContainer.querySelector('#mem-em-name').value.trim(),
        relation: modalContainer.querySelector('#mem-em-relation').value,
        phone: modalContainer.querySelector('#mem-em-phone').value.trim()
      }
    });

    closeModal();
    showToast(`Member registered successfully! Health ID: ${generatedId}`, 'success');
    
    if (onSuccess) onSuccess(newMember);
    else switchView('members', container);
  });
}

/**
 * Modal: Edit Member Details
 */
function openEditMemberModal(member, container, onSuccess) {
  const modalContainer = document.getElementById('modal-container');
  if (!modalContainer || !member) return;

  // Lock background website scrolling
  document.body.classList.add('modal-open');

  const [mYear, mMonth, mDay] = (member.dob || '').split('-');
  let currentPhotoData = member.photoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(member.fullName)}`;
  let currentDocData = member.kyc?.documentData || null;

  const INDIAN_STATES = [
    "Delhi", "Maharashtra", "Karnataka", "Gujarat", "Tamil Nadu", "Kerala", "Uttar Pradesh",
    "West Bengal", "Telangana", "Rajasthan", "Punjab", "Haryana", "Bihar", "Andhra Pradesh",
    "Madhya Pradesh", "Odisha", "Assam", "Goa", "Himachal Pradesh", "Jammu and Kashmir",
    "Jharkhand", "Chhattisgarh", "Uttarakhand", "Chandigarh", "Puducherry", "Ladakh"
  ];

  modalContainer.innerHTML = `
    <div class="modal-backdrop" id="edit-member-backdrop">
      <div class="modal modal-onboarding">
        <div class="modal-header">
          <h3 class="modal-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
            <span>Edit Member & Cardholder Details: ${member.fullName}</span>
          </h3>
          <button class="modal-close" id="btn-close-edit-member-modal" title="Close Dialog">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <form id="edit-member-form">
          <div class="modal-body">
            
            <div class="alert-banner alert-info" style="margin-bottom: 20px;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              <div>
                <strong>National Health ID (Immutable):</strong>
                <span class="font-mono" style="font-size: 14px; font-weight: 700; margin-left: 8px;">${member.healthId}</span>
                <span style="font-size: 11.5px; margin-left: 8px; color: var(--text-muted);">(Health IDs cannot be altered once issued per PRD §6.1)</span>
              </div>
            </div>

            <!-- SECTION 0: Cardholder Portrait Photo -->
            <div class="modal-section-title">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
              <span>Cardholder Portrait Photo (Physical Card Image)</span>
            </div>

            <div style="background: #f8fafc; border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 16px; margin-bottom: 24px;">
              <div style="display: flex; gap: 20px; align-items: center; flex-wrap: wrap;">
                <div style="position: relative; flex-shrink: 0;">
                  <img id="edit-photo-preview" src="${currentPhotoData}" alt="${member.fullName}" style="width: 84px; height: 84px; border-radius: 8px; object-fit: cover; border: 2px solid var(--color-primary); box-shadow: var(--shadow-sm); background: #ffffff;" />
                </div>
                <div style="flex: 1; min-width: 240px;">
                  <div style="font-size: 13.5px; font-weight: 600; color: var(--text-main);">Laser-Etched Identity Portrait</div>
                  <div style="font-size: 12px; color: var(--text-muted); margin: 3px 0 10px;">This image appears on the physical PVC HealthCard, profile directory, and verification portals.</div>
                  <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                    <input type="file" id="edit-input-photo-file" accept="image/png, image/jpeg, image/webp" style="display: none;" />
                    <button type="button" class="btn btn-secondary btn-sm" id="btn-edit-browse-photo">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                      <span>Upload New Photo</span>
                    </button>
                    <button type="button" class="btn btn-secondary btn-sm" id="btn-edit-webcam-photo">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                      <span>Capture with Webcam</span>
                    </button>
                  </div>
                </div>
              </div>

              <!-- Inline Webcam Stream for Portrait Photo -->
              <div id="edit-webcam-photo-box" style="display: none; margin-top: 14px; text-align: center; background: #ffffff; border: 1px solid var(--border-color); border-radius: 8px; padding: 14px;">
                <div class="camera-feed-box" style="max-width: 320px; margin: 0 auto 12px;">
                  <video id="edit-webcam-photo-video" playsinline autoplay muted style="width: 100%; border-radius: 6px;"></video>
                  <div class="camera-guide-overlay camera-guide-portrait">Align face in frame</div>
                </div>
                <div style="display: flex; justify-content: center; gap: 8px;">
                  <button type="button" class="btn btn-primary btn-sm" id="btn-edit-snap-photo">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
                    <span>Take Portrait Photo</span>
                  </button>
                  <button type="button" class="btn btn-secondary btn-sm" id="btn-edit-cancel-photo-cam">Cancel Camera</button>
                </div>
              </div>
            </div>

            <!-- SECTION 1: Personal & Legal Demographics -->
            <div class="modal-section-title">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>
              <span>1. Demographics & Legal Identity</span>
            </div>

            <div class="form-grid">
              <div class="form-group form-full">
                <label for="edit-mem-fullname">Full Legal Name *</label>
                <input type="text" id="edit-mem-fullname" class="form-control" value="${member.fullName || ''}" required />
              </div>

              <div class="form-group form-dob-group">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                  <label style="font-weight: 600; font-size: 13px; color: var(--text-main); margin-bottom: 0;">Date of Birth *</label>
                  <span id="edit-mem-dob-age-badge" style="font-size: 11px; font-weight: 600; color: #1d4ed8; background: #eff6ff; border: 1px solid #bfdbfe; padding: 1px 8px; border-radius: 12px;">Age: ${calculateAge(member.dob)} yrs</span>
                </div>
                <div class="dob-select-grid">
                  <select id="edit-mem-dob-day" class="form-control" required>
                    <option value="">Day</option>
                    ${Array.from({length: 31}, (_, i) => {
                      const d = String(i + 1).padStart(2, '0');
                      return `<option value="${d}" ${d === mDay ? 'selected' : ''}>${d}</option>`;
                    }).join('')}
                  </select>
                  <select id="edit-mem-dob-month" class="form-control" required>
                    <option value="">Month</option>
                    <option value="01" ${mMonth === '01' ? 'selected' : ''}>Jan (01)</option>
                    <option value="02" ${mMonth === '02' ? 'selected' : ''}>Feb (02)</option>
                    <option value="03" ${mMonth === '03' ? 'selected' : ''}>Mar (03)</option>
                    <option value="04" ${mMonth === '04' ? 'selected' : ''}>Apr (04)</option>
                    <option value="05" ${mMonth === '05' ? 'selected' : ''}>May (05)</option>
                    <option value="06" ${mMonth === '06' ? 'selected' : ''}>Jun (06)</option>
                    <option value="07" ${mMonth === '07' ? 'selected' : ''}>Jul (07)</option>
                    <option value="08" ${mMonth === '08' ? 'selected' : ''}>Aug (08)</option>
                    <option value="09" ${mMonth === '09' ? 'selected' : ''}>Sep (09)</option>
                    <option value="10" ${mMonth === '10' ? 'selected' : ''}>Oct (10)</option>
                    <option value="11" ${mMonth === '11' ? 'selected' : ''}>Nov (11)</option>
                    <option value="12" ${mMonth === '12' ? 'selected' : ''}>Dec (12)</option>
                  </select>
                  <select id="edit-mem-dob-year" class="form-control" required>
                    <option value="">Year</option>
                    ${Array.from({length: 105}, (_, i) => {
                      const yr = String(2026 - i);
                      return `<option value="${yr}" ${yr === mYear ? 'selected' : ''}>${yr}</option>`;
                    }).join('')}
                  </select>
                </div>
                <input type="hidden" id="edit-mem-dob" value="${member.dob || ''}" required />
              </div>

              <div class="form-group">
                <label for="edit-mem-gender">Sex / Gender *</label>
                <select id="edit-mem-gender" class="form-control" required>
                  <option value="Male" ${member.gender === 'Male' ? 'selected' : ''}>Male</option>
                  <option value="Female" ${member.gender === 'Female' ? 'selected' : ''}>Female</option>
                  <option value="Other" ${member.gender === 'Other' ? 'selected' : ''}>Other / Non-Binary</option>
                </select>
              </div>

              <div class="form-group">
                <label for="edit-mem-bloodgroup">Blood Group</label>
                <select id="edit-mem-bloodgroup" class="form-control">
                  <option value="Unknown" ${member.bloodGroup === 'Unknown' ? 'selected' : ''}>Unknown</option>
                  <option value="O+" ${member.bloodGroup === 'O+' ? 'selected' : ''}>O Positive (O+)</option>
                  <option value="O-" ${member.bloodGroup === 'O-' ? 'selected' : ''}>O Negative (O-)</option>
                  <option value="A+" ${member.bloodGroup === 'A+' ? 'selected' : ''}>A Positive (A+)</option>
                  <option value="A-" ${member.bloodGroup === 'A-' ? 'selected' : ''}>A Negative (A-)</option>
                  <option value="B+" ${member.bloodGroup === 'B+' ? 'selected' : ''}>B Positive (B+)</option>
                  <option value="B-" ${member.bloodGroup === 'B-' ? 'selected' : ''}>B Negative (B-)</option>
                  <option value="AB+" ${member.bloodGroup === 'AB+' ? 'selected' : ''}>AB Positive (AB+)</option>
                  <option value="AB-" ${member.bloodGroup === 'AB-' ? 'selected' : ''}>AB Negative (AB-)</option>
                </select>
              </div>

              <div class="form-group">
                <label for="edit-mem-status">Account Status</label>
                <select id="edit-mem-status" class="form-control">
                  <option value="Active" ${member.status === 'Active' ? 'selected' : ''}>Active</option>
                  <option value="Suspended" ${member.status === 'Suspended' ? 'selected' : ''}>Suspended</option>
                </select>
              </div>
            </div>

            <!-- SECTION 2: Govt ID & KYC Verification -->
            <div class="modal-section-title">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2"/><line x1="7" y1="8" x2="17" y2="8"/><line x1="7" y1="12" x2="12" y2="12"/></svg>
              <span>2. Govt ID & KYC Verification Document</span>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label for="edit-mem-kyc-type">Verified Govt KYC Document *</label>
                <select id="edit-mem-kyc-type" class="form-control">
                  <option value="Aadhaar Card" ${(member.kyc?.documentType || '').includes('Aadhaar') ? 'selected' : ''}>Aadhaar Card (UIDAI Verified)</option>
                  <option value="Driving License" ${(member.kyc?.documentType || '').includes('Driving') || (member.kyc?.documentType || '').includes('DL') ? 'selected' : ''}>Driving License (State Transport)</option>
                  <option value="Voter ID Card" ${(member.kyc?.documentType || '').includes('Voter') ? 'selected' : ''}>Voter ID Card (Election Commission)</option>
                  <option value="Indian Passport" ${(member.kyc?.documentType || '').includes('Passport') ? 'selected' : ''}>Indian Passport (Republic of India)</option>
                  <option value="PAN Card" ${(member.kyc?.documentType || '').includes('PAN') ? 'selected' : ''}>PAN Card (Income Tax Dept)</option>
                </select>
              </div>

              <div class="form-group">
                <label for="edit-mem-kyc-number">Govt ID / Aadhaar Number</label>
                <input type="text" id="edit-mem-kyc-number" class="form-control" value="${member.kyc?.documentNumber || ''}" placeholder="XXXX XXXX XXXX" style="font-family: var(--font-family-mono);" />
              </div>

              <div class="form-group">
                <label for="edit-mem-kyc-status">KYC Verification Status</label>
                <select id="edit-mem-kyc-status" class="form-control">
                  <option value="Verified" ${(member.kyc?.status || 'Verified') === 'Verified' ? 'selected' : ''}>Verified</option>
                  <option value="Pending" ${(member.kyc?.status || '') === 'Pending' ? 'selected' : ''}>Pending Re-Verification</option>
                  <option value="Under Review" ${(member.kyc?.status || '') === 'Under Review' ? 'selected' : ''}>Under Review</option>
                </select>
              </div>

              <div class="form-group form-full">
                <label>Replace / Attach New KYC Document Scan</label>
                <div style="display: flex; gap: 10px; align-items: center; background: #f8fafc; border: 1px dashed var(--border-color); padding: 10px 14px; border-radius: var(--radius-md); flex-wrap: wrap;">
                  <div style="flex: 1; min-width: 200px; font-size: 12.5px; color: var(--text-secondary);" id="edit-doc-status-text">
                    Current document: <strong>${member.kyc?.documentType || 'Aadhaar Card'}</strong> (${member.kyc?.status || 'Verified'})
                  </div>
                  <input type="file" id="edit-input-doc-file" accept="image/png, image/jpeg, application/pdf" style="display: none;" />
                  <button type="button" class="btn btn-secondary btn-sm" id="btn-edit-browse-doc">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    <span>Upload New Doc Scan</span>
                  </button>
                  <button type="button" class="btn btn-secondary btn-sm" id="btn-edit-webcam-doc">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                    <span>Snap with Webcam</span>
                  </button>
                </div>

                <!-- Inline Doc Webcam -->
                <div id="edit-webcam-doc-box" style="display: none; margin-top: 10px; text-align: center; background: #ffffff; border: 1px solid var(--border-color); border-radius: 8px; padding: 14px;">
                  <div class="camera-feed-box" style="max-width: 320px; margin: 0 auto 12px;">
                    <video id="edit-webcam-doc-video" playsinline autoplay muted style="width: 100%; border-radius: 6px;"></video>
                    <div class="camera-guide-overlay camera-guide-doc">Position Govt ID card in frame</div>
                  </div>
                  <div style="display: flex; justify-content: center; gap: 8px;">
                    <button type="button" class="btn btn-primary btn-sm" id="btn-edit-snap-doc">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>
                      <span>Capture ID Document</span>
                    </button>
                    <button type="button" class="btn btn-secondary btn-sm" id="btn-edit-cancel-doc-cam">Cancel</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- SECTION 3: Contact Channels -->
            <div class="modal-section-title">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <span>3. Contact & Verification Channels</span>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label for="edit-mem-mobile">Primary Mobile Number (+91) *</label>
                <input type="tel" id="edit-mem-mobile" class="form-control" value="${member.mobile || ''}" pattern="[6-9][0-9]{9}" required />
              </div>

              <div class="form-group">
                <label for="edit-mem-email">Email Address</label>
                <input type="email" id="edit-mem-email" class="form-control" value="${member.email || ''}" />
              </div>
            </div>

            <!-- SECTION 4: Residential Address -->
            <div class="modal-section-title">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              <span>4. Residential Address</span>
            </div>

            <div class="form-grid">
              <div class="form-group form-full">
                <label for="edit-mem-street">Street Address</label>
                <input type="text" id="edit-mem-street" class="form-control" value="${member.address?.street || ''}" />
              </div>

              <div class="form-group">
                <label for="edit-mem-city">City</label>
                <input type="text" id="edit-mem-city" class="form-control" value="${member.address?.city || ''}" />
              </div>

              <div class="form-group">
                <label for="edit-mem-state">State / Union Territory *</label>
                <select id="edit-mem-state" class="form-control">
                  ${INDIAN_STATES.map(st => `
                    <option value="${st}" ${st.toLowerCase() === (member.address?.state || 'Delhi').toLowerCase() ? 'selected' : ''}>
                      ${st}
                    </option>
                  `).join('')}
                </select>
              </div>

              <div class="form-group form-full">
                <label for="edit-mem-pincode">PIN Code</label>
                <input type="text" id="edit-mem-pincode" class="form-control" value="${member.address?.pinCode || ''}" />
              </div>
            </div>

            <!-- SECTION 5: Emergency Contact -->
            <div class="modal-section-title">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span>5. Emergency First-Responder Contact</span>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label for="edit-mem-em-name">Contact Person Full Name</label>
                <input type="text" id="edit-mem-em-name" class="form-control" value="${member.emergencyContact?.name || ''}" />
              </div>

              <div class="form-group">
                <label for="edit-mem-em-relation">Relationship</label>
                <select id="edit-mem-em-relation" class="form-control">
                  <option value="Spouse" ${member.emergencyContact?.relation === 'Spouse' ? 'selected' : ''}>Spouse</option>
                  <option value="Parent" ${member.emergencyContact?.relation === 'Parent' ? 'selected' : ''}>Parent</option>
                  <option value="Father" ${member.emergencyContact?.relation === 'Father' ? 'selected' : ''}>Father</option>
                  <option value="Mother" ${member.emergencyContact?.relation === 'Mother' ? 'selected' : ''}>Mother</option>
                  <option value="Sibling" ${member.emergencyContact?.relation === 'Sibling' ? 'selected' : ''}>Sibling</option>
                  <option value="Sister" ${member.emergencyContact?.relation === 'Sister' ? 'selected' : ''}>Sister</option>
                  <option value="Brother" ${member.emergencyContact?.relation === 'Brother' ? 'selected' : ''}>Brother</option>
                  <option value="Son" ${member.emergencyContact?.relation === 'Son' ? 'selected' : ''}>Son</option>
                  <option value="Daughter" ${member.emergencyContact?.relation === 'Daughter' ? 'selected' : ''}>Daughter</option>
                  <option value="Family" ${member.emergencyContact?.relation === 'Family' ? 'selected' : ''}>Family Relative</option>
                  <option value="Guardian" ${member.emergencyContact?.relation === 'Guardian' ? 'selected' : ''}>Legal Guardian</option>
                  <option value="Friend" ${member.emergencyContact?.relation === 'Friend' ? 'selected' : ''}>Friend / Caregiver</option>
                  <option value="Other" ${member.emergencyContact?.relation === 'Other' ? 'selected' : ''}>Other</option>
                </select>
              </div>

              <div class="form-group form-full">
                <label for="edit-mem-em-phone">Emergency Phone</label>
                <input type="tel" id="edit-mem-em-phone" class="form-control" value="${member.emergencyContact?.phone || ''}" />
              </div>
            </div>

          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="btn-cancel-edit-member">Cancel</button>
            <button type="submit" class="btn btn-primary" id="btn-save-member">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  `;

  const backdrop = modalContainer.querySelector('#edit-member-backdrop');
  const closeBtn = modalContainer.querySelector('#btn-close-edit-member-modal');
  const cancelBtn = modalContainer.querySelector('#btn-cancel-edit-member');

  const closeModal = () => closeActiveModal();
  closeBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeModal();
  });

  // Photo Upload and Webcam
  const photoPreview = modalContainer.querySelector('#edit-photo-preview');
  const inputPhotoFile = modalContainer.querySelector('#edit-input-photo-file');
  const btnBrowsePhoto = modalContainer.querySelector('#btn-edit-browse-photo');
  const btnWebcamPhoto = modalContainer.querySelector('#btn-edit-webcam-photo');
  const webcamPhotoBox = modalContainer.querySelector('#edit-webcam-photo-box');
  const videoPhoto = modalContainer.querySelector('#edit-webcam-photo-video');
  const btnSnapPhoto = modalContainer.querySelector('#btn-edit-snap-photo');
  const btnCancelPhotoCam = modalContainer.querySelector('#btn-edit-cancel-photo-cam');
  let editPhotoStream = null;

  btnBrowsePhoto?.addEventListener('click', () => inputPhotoFile?.click());
  inputPhotoFile?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        currentPhotoData = evt.target.result;
        photoPreview.src = currentPhotoData;
        showToast('New portrait image loaded!', 'success');
      };
      reader.readAsDataURL(file);
    }
  });

  btnWebcamPhoto?.addEventListener('click', async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        editPhotoStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' }
        });
        activeMediaStreams.push(editPhotoStream);
        videoPhoto.srcObject = editPhotoStream;
        videoPhoto.play();
        webcamPhotoBox.style.display = 'block';
      } else {
        showToast('Webcam not supported in this browser', 'error');
      }
    } catch (err) {
      showToast('Could not access camera', 'error');
    }
  });

  btnSnapPhoto?.addEventListener('click', () => {
    if (!videoPhoto.srcObject) return;
    const canvas = document.createElement('canvas');
    canvas.width = 480;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    const minDim = Math.min(videoPhoto.videoWidth, videoPhoto.videoHeight);
    const sx = (videoPhoto.videoWidth - minDim) / 2;
    const sy = (videoPhoto.videoHeight - minDim) / 2;
    ctx.drawImage(videoPhoto, sx, sy, minDim, minDim, 0, 0, 480, 480);
    currentPhotoData = canvas.toDataURL('image/jpeg', 0.92);
    photoPreview.src = currentPhotoData;
    webcamPhotoBox.style.display = 'none';
    if (editPhotoStream) {
      editPhotoStream.getTracks().forEach(t => t.stop());
    }
    showToast('New portrait photo captured from webcam!', 'success');
  });

  btnCancelPhotoCam?.addEventListener('click', () => {
    webcamPhotoBox.style.display = 'none';
    if (editPhotoStream) {
      editPhotoStream.getTracks().forEach(t => t.stop());
    }
  });

  // KYC Document Scan Upload & Webcam
  const inputDocFile = modalContainer.querySelector('#edit-input-doc-file');
  const btnBrowseDoc = modalContainer.querySelector('#btn-edit-browse-doc');
  const btnWebcamDoc = modalContainer.querySelector('#btn-edit-webcam-doc');
  const docStatusText = modalContainer.querySelector('#edit-doc-status-text');
  const webcamDocBox = modalContainer.querySelector('#edit-webcam-doc-box');
  const videoDoc = modalContainer.querySelector('#edit-webcam-doc-video');
  const btnSnapDoc = modalContainer.querySelector('#btn-edit-snap-doc');
  const btnCancelDocCam = modalContainer.querySelector('#btn-edit-cancel-doc-cam');
  let editDocStream = null;

  btnBrowseDoc?.addEventListener('click', () => inputDocFile?.click());
  inputDocFile?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        currentDocData = evt.target.result;
        if (docStatusText) {
          docStatusText.innerHTML = `New document attached: <strong>${file.name}</strong> (${Math.round(file.size/1024)} KB)`;
        }
        showToast('New KYC document file attached!', 'success');
      };
      reader.readAsDataURL(file);
    }
  });

  btnWebcamDoc?.addEventListener('click', async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        editDocStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 } }
        });
        activeMediaStreams.push(editDocStream);
        videoDoc.srcObject = editDocStream;
        videoDoc.play();
        webcamDocBox.style.display = 'block';
      } else {
        showToast('Webcam not supported in this browser', 'error');
      }
    } catch (err) {
      showToast('Could not access camera for document scan', 'error');
    }
  });

  btnSnapDoc?.addEventListener('click', () => {
    if (!videoDoc.srcObject) return;
    const canvas = document.createElement('canvas');
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoDoc, 0, 0, 1280, 720);
    currentDocData = canvas.toDataURL('image/jpeg', 0.9);
    webcamDocBox.style.display = 'none';
    if (docStatusText) {
      docStatusText.innerHTML = `New document captured: <strong>Camera Document Scan</strong> (Verified)`;
    }
    if (editDocStream) {
      editDocStream.getTracks().forEach(t => t.stop());
    }
    showToast('Govt ID Document scan captured!', 'success');
  });

  btnCancelDocCam?.addEventListener('click', () => {
    webcamDocBox.style.display = 'none';
    if (editDocStream) {
      editDocStream.getTracks().forEach(t => t.stop());
    }
  });

  // DOB Dropdowns logic
  const editDobDay = modalContainer.querySelector('#edit-mem-dob-day');
  const editDobMonth = modalContainer.querySelector('#edit-mem-dob-month');
  const editDobYear = modalContainer.querySelector('#edit-mem-dob-year');
  const editDobInput = modalContainer.querySelector('#edit-mem-dob');
  const editAgeBadge = modalContainer.querySelector('#edit-mem-dob-age-badge');

  function updateEditDob() {
    if (editDobDay.value && editDobMonth.value && editDobYear.value) {
      const iso = `${editDobYear.value}-${editDobMonth.value}-${editDobDay.value}`;
      editDobInput.value = iso;
      if (editAgeBadge) {
        editAgeBadge.textContent = `Age: ${calculateAge(iso)} yrs`;
      }
    }
  }

  editDobDay?.addEventListener('change', updateEditDob);
  editDobMonth?.addEventListener('change', updateEditDob);
  editDobYear?.addEventListener('change', updateEditDob);

  // Form Submit Handler
  const form = modalContainer.querySelector('#edit-member-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const kycDocType = modalContainer.querySelector('#edit-mem-kyc-type')?.value || member.kyc?.documentType || 'Aadhaar Card';
    const kycStatus = modalContainer.querySelector('#edit-mem-kyc-status')?.value || 'Verified';

    const updated = store.updateMember(member.id, {
      fullName: modalContainer.querySelector('#edit-mem-fullname').value.trim(),
      dob: modalContainer.querySelector('#edit-mem-dob').value,
      gender: modalContainer.querySelector('#edit-mem-gender').value,
      mobile: modalContainer.querySelector('#edit-mem-mobile').value.trim(),
      email: modalContainer.querySelector('#edit-mem-email').value.trim(),
      bloodGroup: modalContainer.querySelector('#edit-mem-bloodgroup').value,
      status: modalContainer.querySelector('#edit-mem-status').value,
      photoUrl: currentPhotoData,
      kyc: {
        ...(member.kyc || {}),
        documentType: kycDocType,
        documentNumber: modalContainer.querySelector('#edit-mem-kyc-number')?.value.trim() || member.kyc?.documentNumber || '',
        status: kycStatus,
        verified: kycStatus === 'Verified',
        documentData: currentDocData || member.kyc?.documentData || null
      },
      address: {
        street: modalContainer.querySelector('#edit-mem-street').value.trim(),
        city: modalContainer.querySelector('#edit-mem-city').value.trim(),
        state: modalContainer.querySelector('#edit-mem-state')?.value || member.address?.state || "Delhi",
        pinCode: modalContainer.querySelector('#edit-mem-pincode').value.trim()
      },
      emergencyContact: {
        name: modalContainer.querySelector('#edit-mem-em-name').value.trim(),
        relation: modalContainer.querySelector('#edit-mem-em-relation').value.trim(),
        phone: modalContainer.querySelector('#edit-mem-em-phone').value.trim()
      }
    });

    closeModal();
    showToast(`Member ${updated.fullName} updated successfully!`, 'success');
    if (onSuccess) onSuccess(updated);
  });
}

/**
 * Modal: Delete Member (With Strong High-Visibility Warning)
 */
function openDeleteMemberModal(memberId, container, onSuccess) {
  const modalContainer = document.getElementById('modal-container');
  if (!modalContainer) return;

  const member = store.getMemberById(memberId);
  if (!member) return;

  const cards = store.getCardsByMemberId(member.id);
  const orders = store.data.orders.filter(o => o.memberId === member.id);

  // Lock background website scrolling
  document.body.classList.add('modal-open');

  modalContainer.innerHTML = `
    <div class="modal-backdrop" id="delete-member-backdrop">
      <div class="modal" style="max-width: 540px;">
        <div class="modal-header" style="border-bottom: 2px solid #ef4444;">
          <h3 class="modal-title" style="color: #dc2626;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2.2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <span>Permanent Deletion Warning</span>
          </h3>
          <button class="modal-close" id="btn-close-delete-member-modal">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div class="modal-body">
          <div class="alert-banner alert-danger" style="margin-bottom: 18px;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            <div>
              <strong>IRREVERSIBLE ACTION:</strong> You are about to permanently purge this citizen member from the National Health Network.
            </div>
          </div>

          <div style="background-color: #f8fafc; border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px; margin-bottom: 16px;">
            <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: var(--text-muted); margin-bottom: 6px;">Target Member Record</div>
            <div style="font-size: 15px; font-weight: 700; color: var(--text-main);">${member.fullName}</div>
            <div style="font-size: 13px; font-family: var(--font-family-mono); color: var(--color-primary); margin-top: 2px;">Health ID: ${member.healthId}</div>
            <div style="font-size: 12px; color: var(--text-secondary); margin-top: 4px;">Mobile: ${member.mobile} • DOB: ${member.dob}</div>
          </div>

          <div style="font-size: 13px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 14px;">
            Executing this deletion will perform the following cascading operations:
            <ul style="margin: 8px 0 0 18px; padding: 0;">
              <li><strong>${cards.length} Physical HealthCard(s)</strong> revoked and deleted (${cards.map(c => c.serialNumber).join(', ') || 'None'}).</li>
              <li><strong>${orders.length} Fulfillment Order(s)</strong> purged from the logistics pipeline.</li>
              <li>Access tokens and cryptographic signatures permanently invalidated.</li>
              <li>An audit trail entry will be written to the immutable security log.</li>
            </ul>
          </div>

          <div class="form-group" style="margin-bottom: 0;">
            <label style="font-size: 12.5px; font-weight: 600; color: #991b1b;">To confirm, please verify you want to proceed:</label>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" id="btn-cancel-delete-member">Cancel & Keep Record</button>
          <button type="button" class="btn btn-danger" id="btn-confirm-delete-member" style="background-color: #dc2626; border-color: #dc2626;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            <span>Permanently Delete Member</span>
          </button>
        </div>
      </div>
    </div>
  `;

  const backdrop = modalContainer.querySelector('#delete-member-backdrop');
  const closeBtn = modalContainer.querySelector('#btn-close-delete-member-modal');
  const cancelBtn = modalContainer.querySelector('#btn-cancel-delete-member');

  const closeModal = () => closeActiveModal();
  closeBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeModal();
  });

  modalContainer.querySelector('#btn-confirm-delete-member').addEventListener('click', () => {
    store.deleteMember(memberId);
    closeModal();
    showToast(`Member ${member.fullName} (${member.healthId}) permanently deleted.`, 'error');
    if (onSuccess) onSuccess();
  });
}

/**
 * Modal: Edit Card Details
 */
function openEditCardModal(card, container, onSuccess) {
  const modalContainer = document.getElementById('modal-container');
  if (!modalContainer || !card) return;

  const member = store.getMemberById(card.memberId);

  // Lock background website scrolling
  document.body.classList.add('modal-open');

  modalContainer.innerHTML = `
    <div class="modal-backdrop" id="edit-card-backdrop">
      <div class="modal modal-lg">
        <div class="modal-header">
          <h3 class="modal-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
            <span>Edit Physical Card Details: ${card.healthId}</span>
          </h3>
          <button class="modal-close" id="btn-close-edit-card-modal">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <form id="edit-card-form">
          <div class="modal-body">
            
            <div class="alert-banner alert-info" style="margin-bottom: 20px;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              <div>
                <strong>Cardholder:</strong>
                <span class="font-semibold" style="margin-left: 6px;">${member ? member.fullName : 'Unknown'}</span>
                <span class="font-mono" style="margin-left: 8px; color: var(--color-primary); font-weight: 600;">(${card.healthId})</span>
              </div>
            </div>

            <div class="form-grid">
              <div class="form-group">
                <label for="edit-card-serial">10-Digit Card ID</label>
                <input type="text" id="edit-card-serial" class="form-control font-mono" value="${card.healthId}" readonly style="background-color: #f1f5f9; cursor: not-allowed;" />
                <span class="form-hint">Physical card is permanently keyed to the 10-digit National Health ID.</span>
              </div>

              <div class="form-group">
                <label for="edit-card-status">Card Lifecycle Status *</label>
                <select id="edit-card-status" class="form-control">
                  <option value="Active" ${card.status === 'Active' ? 'selected' : ''}>Active (In Circulation)</option>
                  <option value="Issued" ${card.status === 'Issued' ? 'selected' : ''}>Issued (Pending Activation)</option>
                  <option value="Suspended" ${card.status === 'Suspended' ? 'selected' : ''}>Suspended</option>
                  <option value="Blocked" ${card.status === 'Blocked' ? 'selected' : ''}>Blocked (Token Revoked)</option>
                  <option value="Replaced" ${card.status === 'Replaced' ? 'selected' : ''}>Replaced (Defunct)</option>
                </select>
                <span class="form-hint">Controls whether QR and NFC scans grant access</span>
              </div>

              <div class="form-group form-full">
                <label for="edit-card-template">Physical Card Design Theme / Template</label>
                <select id="edit-card-template" class="form-control">
                  <option value="teal_standard" ${card.templateId === 'teal_standard' || card.templateId?.includes('teal') ? 'selected' : ''}>Standard Medical Teal (Default National Scheme)</option>
                  <option value="slate_executive" ${card.templateId === 'slate_executive' || card.templateId?.includes('slate') ? 'selected' : ''}>Executive Slate (Monochrome High Contrast)</option>
                  <option value="blue_clinical" ${card.templateId === 'blue_clinical' || card.templateId?.includes('blue') ? 'selected' : ''}>Clinical Royal Blue (Hospital Affiliation)</option>
                </select>
              </div>

              <div class="form-group form-full">
                <label for="edit-card-reason">Reason for Modification / Audit Notes</label>
                <input type="text" id="edit-card-reason" class="form-control" placeholder="e.g. Corrected typo in laser-etched serial / changed theme on request" />
                <span class="form-hint">Recorded in immutable audit logs for compliance</span>
              </div>
            </div>

          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" id="btn-cancel-edit-card">Cancel</button>
            <button type="submit" class="btn btn-primary" id="btn-save-card">Update Card Details</button>
          </div>
        </form>
      </div>
    </div>
  `;

  const backdrop = modalContainer.querySelector('#edit-card-backdrop');
  const closeBtn = modalContainer.querySelector('#btn-close-edit-card-modal');
  const cancelBtn = modalContainer.querySelector('#btn-cancel-edit-card');

  const closeModal = () => closeActiveModal();
  closeBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeModal();
  });

  const form = modalContainer.querySelector('#edit-card-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const newSerial = modalContainer.querySelector('#edit-card-serial').value.trim();
    const newStatus = modalContainer.querySelector('#edit-card-status').value;
    const newTemplate = modalContainer.querySelector('#edit-card-template').value;
    const reason = modalContainer.querySelector('#edit-card-reason').value.trim();

    const updated = store.updateCard(card.id, {
      serialNumber: newSerial,
      status: newStatus,
      templateId: newTemplate,
      modificationReason: reason || 'Admin updated card properties'
    });

    closeModal();
    showToast(`Card for member ${updated.healthId} updated successfully!`, 'success');
    if (onSuccess) onSuccess(updated);
  });
}

/**
 * Modal: Delete Physical Card (With Strong Warning)
 */
function openDeleteCardModal(cardId, container, onSuccess) {
  const modalContainer = document.getElementById('modal-container');
  if (!modalContainer) return;

  const card = store.getCardById(cardId);
  if (!card) return;

  const member = store.getMemberById(card.memberId);
  const order = store.data.orders.find(o => o.cardId === card.id);

  // Lock background website scrolling
  document.body.classList.add('modal-open');

  modalContainer.innerHTML = `
    <div class="modal-backdrop" id="delete-card-backdrop">
      <div class="modal" style="max-width: 520px;">
        <div class="modal-header" style="border-bottom: 2px solid #ef4444;">
          <h3 class="modal-title" style="color: #dc2626;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2.2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <span>Delete Physical Card: ${card.healthId}</span>
          </h3>
          <button class="modal-close" id="btn-close-delete-card-modal">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div class="modal-body">
          <div class="alert-banner alert-danger" style="margin-bottom: 16px;">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            <div>
              <strong>PERMANENT CARD REMOVAL:</strong> Deleting this physical card record will immediately revoke its cryptographic keys.
            </div>
          </div>

          <div style="background-color: #f8fafc; border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px; margin-bottom: 14px;">
            <div style="font-size: 11px; text-transform: uppercase; font-weight: 700; color: var(--text-muted); margin-bottom: 4px;">Card Details</div>
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span class="font-mono font-semibold" style="font-size: 15px;">${card.healthId}</span>
              <span class="status-indicator status-${card.status === 'Active' ? 'active' : 'pending'}">
                <span class="status-dot"></span>
                <span>${card.status}</span>
              </span>
            </div>
            <div style="font-size: 12.5px; color: var(--text-secondary); margin-top: 6px;">
              Cardholder: <strong>${member ? member.fullName : 'Unknown'}</strong> (${card.healthId})
            </div>
            ${order ? `
              <div style="font-size: 11.5px; color: var(--text-muted); margin-top: 4px;">
                Linked Fulfillment Order: <strong>${order.id} (${order.status})</strong> will be purged.
              </div>
            ` : ''}
          </div>

          <p style="font-size: 12.5px; color: var(--text-secondary); line-height: 1.4; margin-bottom: 0;">
            The member's National Health ID (<strong>${card.healthId}</strong>) and personal health history will <strong>NOT</strong> be deleted. Only this physical card token and print order will be destroyed.
          </p>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" id="btn-cancel-delete-card">Cancel</button>
          <button type="button" class="btn btn-danger" id="btn-confirm-delete-card" style="background-color: #dc2626; border-color: #dc2626;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            <span>Yes, Permanently Delete Card</span>
          </button>
        </div>
      </div>
    </div>
  `;

  const backdrop = modalContainer.querySelector('#delete-card-backdrop');
  const closeBtn = modalContainer.querySelector('#btn-close-delete-card-modal');
  const cancelBtn = modalContainer.querySelector('#btn-cancel-delete-card');

  const closeModal = () => closeActiveModal();
  closeBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeModal();
  });

  modalContainer.querySelector('#btn-confirm-delete-card').addEventListener('click', () => {
    store.deleteCard(cardId);
    closeModal();
    showToast(`Card for member ${card.healthId} deleted from registry.`, 'error');
    if (onSuccess) onSuccess();
  });
}

/**
 * Modal: Card Preview Modal (With Edit & Delete Actions)
 */
function openCardPreviewModal(card, member, container, onUpdate) {
  const modalContainer = document.getElementById('modal-container');
  if (!modalContainer || !card) return;

  const actualMember = member || store.getMemberById(card.memberId) || { fullName: 'MEMBER', healthId: card.healthId };

  // Lock background website scrolling
  document.body.classList.add('modal-open');

  modalContainer.innerHTML = `
    <div class="modal-backdrop" id="preview-modal-backdrop">
      <div class="modal modal-lg">
        <div class="modal-header">
          <h3 class="modal-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
            <span>Physical Card Inspection: ${card.healthId}</span>
          </h3>
          <button class="modal-close" id="btn-close-card-modal" title="Close Preview">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div class="modal-body" style="background-color: #f8fafc;">
          <div class="card-preview-container">
            <div class="card-sides-wrapper">
              
              <!-- Front -->
              <div class="healthcard-physical template-${card.templateId.includes('slate') ? 'slate' : card.templateId.includes('blue') ? 'blue' : 'teal'}">
                <div class="card-top">
                  <div class="card-emblem">
                    <div class="emblem-icon">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    </div>
                    <span class="card-org-title">NATIONAL HEALTH RECORD</span>
                  </div>
                  <div class="nfc-symbol">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2"><path d="M6 8.5a6.5 6.5 0 0 1 12 0M8.5 12a3.5 3.5 0 0 1 7 0M11 15.5a1 1 0 0 1 2 0"/></svg>
                  </div>
                </div>

                <div class="card-middle" style="display: flex; justify-content: space-between; align-items: center; gap: 10px;">
                  <div style="flex: 1; min-width: 0;">
                    <div class="card-patient-name">${actualMember.fullName.toUpperCase()}</div>
                    <div class="card-id-label">National Health ID</div>
                    <div class="card-health-id">${card.healthId}</div>
                    ${actualMember.bloodGroup ? `
                      <div style="margin-top: 4px;">
                        <span style="color: #ef4444; font-weight: 800; font-size: 11px; background: rgba(0,0,0,0.35); padding: 1px 6px; border-radius: 3px; letter-spacing: 0.03em;">
                          BLOOD: ${actualMember.bloodGroup}
                        </span>
                      </div>
                    ` : ''}
                  </div>
                  ${actualMember.photoUrl ? `
                    <div style="width: 48px; height: 58px; border-radius: 4px; border: 1.5px solid rgba(255,255,255,0.7); overflow: hidden; background: rgba(255,255,255,0.2); flex-shrink: 0;">
                      <img src="${actualMember.photoUrl}" style="width: 100%; height: 100%; object-fit: cover;" alt="Citizen Photo" />
                    </div>
                  ` : ''}
                </div>

                <div class="card-bottom">
                  <span style="font-family: var(--font-family-mono); font-size: 10.5px; font-weight: 700; letter-spacing: 0.04em;">CARD NO: ${card.healthId}</span>
                  <span style="font-size: 9px; opacity: 0.85; font-weight: 600;">STATUS: ${card.status.toUpperCase()}</span>
                </div>
              </div>

              <!-- Back -->
              <div class="healthcard-physical card-back">
                <div class="card-back-qr">
                  <canvas id="modal-qr-canvas"></canvas>
                  <span style="font-size: 8px; color: #64748b; margin-top: 3px; font-weight: 600;">SCAN FOR ACCESS</span>
                </div>
                <div class="card-back-info">
                  <div class="card-back-disclaimer">
                    <strong>SECURITY NOTICE:</strong> This card carries only a revocable digital token. Medical records remain encrypted in cloud vaults. Access requires patient OTP / App consent.
                  </div>
                  <div class="card-back-meta">
                    <div>24x7 Helpline: <strong class="card-helpline">1800-890-4325</strong></div>
                    <div>Portal: <strong>healthcard.gov.in</strong></div>
                    <div style="font-size: 8px; color: #94a3b8; margin-top: 2px;">Card ID: ${card.healthId}</div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        <div class="modal-footer" style="justify-content: space-between;">
          <div style="display: flex; gap: 8px;">
            <button type="button" class="btn btn-secondary btn-sm" id="btn-modal-edit-card">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
              <span>Edit Card Details</span>
            </button>
            <button type="button" class="btn btn-danger btn-sm" id="btn-modal-delete-card">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
              <span>Delete Card</span>
            </button>
          </div>
          <div style="display: flex; gap: 8px;">
            <button type="button" class="btn btn-secondary" id="btn-modal-print">Print PDF Spec</button>
            <button type="button" class="btn btn-primary" id="btn-close-preview-ok">Done</button>
          </div>
        </div>
      </div>
    </div>
  `;

  const canvas = modalContainer.querySelector('#modal-qr-canvas');
  if (canvas) {
    QRCode.toCanvas(canvas, `https://hc.example.in/c/${card.token}`, {
      width: 100,
      margin: 1,
      color: { dark: '#0f172a', light: '#ffffff' }
    });
  }

  const backdrop = modalContainer.querySelector('#preview-modal-backdrop');
  const closeBtn = modalContainer.querySelector('#btn-close-card-modal');
  const doneBtn = modalContainer.querySelector('#btn-close-preview-ok');

  const closeModal = () => closeActiveModal();
  closeBtn.addEventListener('click', closeModal);
  doneBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeModal();
  });

  modalContainer.querySelector('#btn-modal-print').addEventListener('click', () => window.print());

  // Edit card button inside preview
  modalContainer.querySelector('#btn-modal-edit-card').addEventListener('click', () => {
    closeModal();
    openEditCardModal(card, container, (updated) => {
      if (onUpdate) onUpdate(updated);
    });
  });

  // Delete card button inside preview
  modalContainer.querySelector('#btn-modal-delete-card').addEventListener('click', () => {
    closeModal();
    openDeleteCardModal(card.id, container, () => {
      if (onUpdate) onUpdate();
    });
  });
}

/**
 * Modal: Block Card (CARD-05 Token Revocation)
 */
function openBlockCardModal(cardId, container, onSuccess) {
  const modalContainer = document.getElementById('modal-container');
  if (!modalContainer) return;

  const card = store.getCardById(cardId);
  if (!card) return;

  // Lock background website scrolling
  document.body.classList.add('modal-open');

  modalContainer.innerHTML = `
    <div class="modal-backdrop" id="block-card-backdrop">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title" style="color: #dc2626;">Block Physical Card: ${card.healthId}</h3>
          <button class="modal-close" id="btn-close-block-modal">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="alert-banner alert-warning">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <div>
              <strong>CARD-05 Immediate Revocation:</strong> Blocking this card will instantly revoke QR & NFC access keys. The member's Health ID and longitudinal records remain safe.
            </div>
          </div>

          <div class="form-group">
            <label for="block-reason-select">Reason for Blocking *</label>
            <select id="block-reason-select" class="form-control">
              <option value="Reported Lost by Cardholder">Reported Lost by Cardholder</option>
              <option value="Physical Card Stolen / Compromised">Physical Card Stolen / Compromised</option>
              <option value="QR Code Damaged / Unreadable">QR Code Damaged / Unreadable</option>
              <option value="Administrative Cancellation">Administrative Cancellation</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" id="btn-cancel-block">Cancel</button>
          <button type="button" class="btn btn-danger" id="btn-confirm-block">Confirm & Revoke Token</button>
        </div>
      </div>
    </div>
  `;

  const backdrop = modalContainer.querySelector('#block-card-backdrop');
  const closeBtn = modalContainer.querySelector('#btn-close-block-modal');
  const cancelBtn = modalContainer.querySelector('#btn-cancel-block');

  const closeModal = () => closeActiveModal();
  closeBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeModal();
  });

  modalContainer.querySelector('#btn-confirm-block').addEventListener('click', () => {
    const reason = modalContainer.querySelector('#block-reason-select').value;
    store.blockCard(cardId, reason);
    closeModal();
    showToast(`Card for member ${card.healthId} has been blocked.`, 'error');
    if (onSuccess) onSuccess();
  });
}

/**
 * Modal: Edit Order Fulfillment
 */
function openEditOrderModal(order, container) {
  const modalContainer = document.getElementById('modal-container');
  if (!modalContainer) return;

  // Lock background website scrolling
  document.body.classList.add('modal-open');

  modalContainer.innerHTML = `
    <div class="modal-backdrop" id="edit-order-backdrop">
      <div class="modal">
        <div class="modal-header">
          <h3 class="modal-title">Fulfillment Order: ${order.id}</h3>
          <button class="modal-close" id="btn-close-order-modal">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="modal-body">
          <div style="margin-bottom: 16px;">
            <div class="text-muted" style="font-size: 11.5px;">Recipient</div>
            <div class="font-semibold">${order.recipientName}</div>
            <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">${order.address}</div>
          </div>

          <div class="form-group" style="margin-bottom: 14px;">
            <label for="order-status-select">Order Status</label>
            <select id="order-status-select" class="form-control">
              <option value="Generated" ${order.status === 'Generated' ? 'selected' : ''}>Generated / In Queue</option>
              <option value="Printing" ${order.status === 'Printing' ? 'selected' : ''}>Printing</option>
              <option value="Ready" ${order.status === 'Ready' ? 'selected' : ''}>Ready for Dispatch</option>
              <option value="Dispatched" ${order.status === 'Dispatched' ? 'selected' : ''}>Dispatched</option>
              <option value="Delivered" ${order.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
            </select>
          </div>

          <div class="form-group" style="margin-bottom: 14px;">
            <label for="order-courier">Courier Partner</label>
            <input type="text" id="order-courier" class="form-control" value="${order.courier || ''}" placeholder="e.g. BlueDart Express" />
          </div>

          <div class="form-group">
            <label for="order-awb">AWB / Courier Tracking Number</label>
            <input type="text" id="order-awb" class="form-control" value="${order.trackingNumber || ''}" placeholder="e.g. BLD-894210948" />
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" id="btn-cancel-order">Cancel</button>
          <button type="button" class="btn btn-primary" id="btn-save-order">Save Changes</button>
        </div>
      </div>
    </div>
  `;

  const backdrop = modalContainer.querySelector('#edit-order-backdrop');
  const closeBtn = modalContainer.querySelector('#btn-close-order-modal');
  const cancelBtn = modalContainer.querySelector('#btn-cancel-order');

  const closeModal = () => closeActiveModal();
  closeBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);
  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop) closeModal();
  });

  modalContainer.querySelector('#btn-save-order').addEventListener('click', () => {
    const st = modalContainer.querySelector('#order-status-select').value;
    const cr = modalContainer.querySelector('#order-courier').value.trim();
    const awb = modalContainer.querySelector('#order-awb').value.trim();

    store.updateOrderStatus(order.id, st, cr, awb);
    closeModal();
    showToast('Fulfillment order updated!', 'success');
    switchView('fulfillment', container);
  });
}
