/**
 * HealthCard Citizen Authentication & Account Creation View
 * Clean Minimal Light Mode matching Admin Panel design language
 * 
 * Features:
 * - Continue with Google (with realistic Google Account Picker Modal)
 * - Sign In & Create Account tabs
 * - Mobile OTP verification & Email/Password sign-in
 * - Instant Demo citizen accounts (Rahul Sharma, Ananya Deshmukh, Sunita Patel)
 * - Immediate seamless transition to "Apply for Card" with pre-filled details
 */

import { applicantStore } from '../../shared/storage.js';
import { showToast } from '../../shared/toast.js';
import { DEMO_CITIZEN_PROFILES, DEMO_GOOGLE_ACCOUNTS } from '../../shared/data/demoData.js';

export class ApplicantAuth {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.onLoginSuccess = options.onLoginSuccess || null;
    this.mode = options.mode || 'signin'; // 'signin' or 'signup'
    this.signinMethod = 'mobile'; // 'mobile' or 'email'
    this.pendingMobile = '';
    this.generatedOtp = '';
    this.forgotPendingIdentifier = '';
    this.forgotGeneratedOtp = '';
    this.init();
  }

  init() {
    this.render();
    this.bindEvents();
  }

  setMode(mode) {
    this.mode = mode;
    this.render();
    this.bindEvents();
  }

  render() {
    const currentUser = applicantStore.getCurrentUser();

    this.container.innerHTML = `
      <div class="auth-page-container">
        <div class="auth-center-shell">
          
          <!-- Auth Card -->
          <div class="auth-card">
            
            <!-- Government & Registry Branding Header -->
            <div class="auth-header">
            <div class="auth-emblem">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v20M2 12h20"/></svg>
            </div>
            <h1 class="auth-title">Citizen Identity & Access</h1>
            <p class="auth-subtitle">
              Sign in or create an account to apply for, manage, and track your lifelong National HealthCard.
            </p>
          </div>

          <!-- If already logged in: Show active profile with "Apply for Card" CTA -->
          ${currentUser ? `
            <div class="auth-logged-in-box">
              <div class="auth-profile-row">
                <img src="${currentUser.avatarUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentUser.fullName)}`}" class="auth-profile-avatar" alt="User avatar" />
                <div>
                  <div class="auth-profile-name">${currentUser.fullName}</div>
                  <div class="auth-profile-meta">${currentUser.email || currentUser.mobile} • <span class="badge badge-teal" style="font-size:10px; padding:1px 6px;">Signed In (${currentUser.provider || 'Citizen'})</span></div>
                  ${currentUser.healthId ? `<div style="font-size:11.5px; font-weight:700; color:var(--text-main); margin-top:2px; font-family:var(--font-family-mono);">Health ID: ${currentUser.healthId}</div>` : ''}
                </div>
              </div>

              <div class="auth-action-stack">
                <a href="#apply" class="btn btn-primary btn-block" style="height:42px; font-weight:700; font-size:13.5px; gap:8px;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
                  ${currentUser.hasApplication ? 'Apply for Another Card / Family' : 'Apply for Your HealthCard Now'}
                </a>

                <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; margin-top:8px;">
                  <a href="#dashboard" class="btn btn-outline" style="font-size:12.5px;">
                    Citizen Dashboard
                  </a>
                  <a href="#track" class="btn btn-outline" style="font-size:12.5px;">
                    Track Delivery
                  </a>
                </div>

                <button type="button" class="btn btn-sm btn-ghost" id="btn-auth-switch-user" style="margin-top:14px; color:var(--text-muted); font-size:11.5px;">
                  Sign out or use another account
                </button>
              </div>
            </div>
          ` : `
            <!-- Tab Controls: Sign In vs Create Account -->
            <div class="auth-mode-tabs">
              <button type="button" class="auth-mode-tab ${this.mode === 'signin' ? 'active' : ''}" id="tab-btn-signin">
                Sign In
              </button>
              <button type="button" class="auth-mode-tab ${this.mode === 'signup' ? 'active' : ''}" id="tab-btn-signup">
                Create Account
              </button>
            </div>

            <!-- Google One-Click Social Auth -->
            <div style="padding: 20px 24px 0;">
              <button type="button" class="btn-google-auth" id="btn-google-auth" title="Sign in with your Google account">
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Continue with Google</span>
              </button>

              <div class="auth-divider">
                <span>or continue with citizen details</span>
              </div>
            </div>

            <!-- Tab 1: SIGN IN CONTENT -->
            <div id="auth-panel-signin" style="display:${this.mode === 'signin' ? 'block' : 'none'}; padding: 0 24px 24px;">
              <!-- Signin Method Sub-Tabs -->
              <div class="segmented-control" style="margin-bottom:18px;">
                <button type="button" class="segmented-btn ${this.signinMethod === 'mobile' ? 'active' : ''}" id="btn-method-mobile">
                  Mobile OTP
                </button>
                <button type="button" class="segmented-btn ${this.signinMethod === 'email' ? 'active' : ''}" id="btn-method-email">
                  Email & Password
                </button>
              </div>

              <!-- Mobile OTP Flow -->
              <div id="signin-flow-mobile" style="display:${this.signinMethod === 'mobile' ? 'block' : 'none'};">
                <!-- Mobile Step -->
                <div id="auth-step-mobile">
                  <div class="form-group" style="margin-bottom:16px;">
                    <label class="form-label required">Registered Indian Mobile Number</label>
                    <div style="display:flex; gap:8px;">
                      <div class="input-prefix-box">+91</div>
                      <input type="tel" class="form-input" id="inp-login-mobile" placeholder="98765 43210" maxlength="10" style="font-size:14px; font-weight:600;" />
                    </div>
                    <span class="form-hint">Enter your 10-digit mobile used during registration or card apply.</span>
                  </div>

                  <button type="button" class="btn btn-primary btn-block" id="btn-request-otp" style="height:40px;">
                    Send Verification Code (OTP)
                  </button>
                </div>

                <!-- OTP Step -->
                <div id="auth-step-otp" style="display:none;">
                  <div class="otp-banner">
                    <span>Code sent to <strong id="lbl-masked-mobile">+91 ••••• •••••</strong></span>
                    <button type="button" id="btn-change-mobile" class="link-btn">Change</button>
                  </div>

                  <div class="form-group" style="margin-bottom:16px;">
                    <label class="form-label required">Enter 6-Digit OTP</label>
                    <input type="text" class="form-input" id="inp-login-otp" placeholder="••••••" maxlength="6" style="font-family:var(--font-family-mono); font-size:18px; letter-spacing:0.25em; text-align:center; font-weight:700;" />
                  </div>

                  <button type="button" class="btn btn-primary btn-block" id="btn-confirm-login" style="height:40px;">
                    Verify & Enter Portal
                  </button>
                </div>
              </div>

              <!-- Email & Password Flow -->
              <div id="signin-flow-email" style="display:${this.signinMethod === 'email' ? 'block' : 'none'};">
                <div class="form-group" style="margin-bottom:14px;">
                  <label class="form-label required">Email Address</label>
                  <input type="email" class="form-input" id="inp-login-email" placeholder="name@domain.com" />
                </div>

                <div class="form-group" style="margin-bottom:18px;">
                  <div style="display:flex; justify-content:space-between; align-items:center;">
                    <label class="form-label required" style="margin:0;">Password</label>
                    <button type="button" id="link-forgot-pw" class="link-btn" style="font-size:11.5px; color:var(--color-primary); font-weight:600; text-decoration:none;">Forgot Password?</button>
                  </div>
                  <input type="password" class="form-input" id="inp-login-password" placeholder="••••••••" />
                </div>

                <button type="button" class="btn btn-primary btn-block" id="btn-confirm-email-login" style="height:40px;">
                  Sign In to HealthCard
                </button>
              </div>

              <!-- Quick Demo Citizen Profiles -->
              <div class="demo-citizens-section">
                <div class="demo-citizens-title">Quick Test Citizen Profiles</div>
                <div style="display:flex; flex-direction:column; gap:6px;">
                  ${DEMO_CITIZEN_PROFILES.map(p => `
                    <button type="button" class="btn-quick-citizen" data-mobile="${p.mobile}" data-name="${p.name}">
                      <div>
                        <div class="qc-name">${p.name}</div>
                        <div class="qc-meta">Health ID: ${p.healthId} • Blood: <strong style="color:var(--color-blood-red); font-weight:800;">${p.bloodGroup}</strong></div>
                      </div>
                      <span class="badge ${p.badgeClass}" style="font-size:10.5px;">${p.badgeText}</span>
                    </button>
                  `).join('')}
                </div>
              </div>

              <div class="auth-footer-prompt">
                Don't have an account yet? 
                <button type="button" id="prompt-to-signup" class="link-btn" style="font-weight:700;">Create an account</button>
              </div>
            </div>

            <!-- Tab 2: CREATE ACCOUNT CONTENT -->
            <div id="auth-panel-signup" style="display:${this.mode === 'signup' ? 'block' : 'none'}; padding: 0 24px 24px;">
              <form id="form-create-account" onsubmit="return false;">
                
                <div class="form-group" style="margin-bottom:12px;">
                  <label class="form-label required">Full Legal Name (as per Govt ID)</label>
                  <input type="text" class="form-input" id="inp-signup-name" placeholder="e.g. Ramesh Chandra Verma" required />
                </div>

                <div class="form-group" style="margin-bottom:12px;">
                  <label class="form-label required">Indian Mobile Number</label>
                  <div style="display:flex; gap:8px;">
                    <div class="input-prefix-box">+91</div>
                    <input type="tel" class="form-input" id="inp-signup-mobile" placeholder="98765 43210" maxlength="10" required />
                  </div>
                  <span class="form-hint">Used for 2-factor OTP and delivery updates.</span>
                </div>

                <div class="form-group" style="margin-bottom:12px;">
                  <label class="form-label required">Email Address</label>
                  <input type="email" class="form-input" id="inp-signup-email" placeholder="ramesh.verma@example.com" required />
                </div>

                <div class="form-group" style="margin-bottom:16px;">
                  <label class="form-label required">Create Password</label>
                  <input type="password" class="form-input" id="inp-signup-password" placeholder="At least 6 characters" required />
                </div>

                <div class="consent-box" style="margin-bottom:18px; padding:10px 12px; background:var(--bg-surface-subtle); border:1px solid var(--border-color); border-radius:var(--radius-md);">
                  <label style="display:flex; align-items:flex-start; gap:8px; font-size:11.5px; color:var(--text-secondary); cursor:pointer;">
                    <input type="checkbox" id="chk-signup-consent" checked style="margin-top:2px;" />
                    <span>I consent to create my Digital Health Identity under <strong>DPDP Act 2023</strong> and agree to receive updates via SMS and SpeedPost.</span>
                  </label>
                </div>

                <button type="submit" class="btn btn-primary btn-block" id="btn-submit-signup" style="height:42px; font-weight:700;">
                  Create Citizen Account & Apply for Card
                </button>
              </form>

              <div class="auth-footer-prompt">
                Already registered with HealthCard? 
                <button type="button" id="prompt-to-signin" class="link-btn" style="font-weight:700;">Sign in here</button>
              </div>
            </div>
          `}

          </div>

          <!-- Return to Portal Home Link -->
          <div class="auth-return-slot">
            <a href="#home" class="auth-return-link">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
              <span>Return to Portal Home</span>
            </a>
          </div>
        </div>

        <!-- Google Account Picker Dialog (Modal) -->
        <div class="modal-backdrop" id="google-picker-modal" style="display:none;">
          <div class="google-modal-box">
            
            <div class="google-modal-top">
              <svg width="24" height="24" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <div style="margin-top:8px;">
                <div style="font-weight:700; font-size:15px; color:#1f2937;">Choose a Google Account</div>
                <div style="font-size:12px; color:#6b7280;">to continue to National HealthCard Registry</div>
              </div>
            </div>

            <!-- List of Google Accounts -->
            <div class="google-accounts-list">
              ${DEMO_GOOGLE_ACCOUNTS.map(g => `
                <div class="google-account-item" data-name="${g.name}" data-email="${g.email}" data-pic="${g.avatarUrl}">
                  <div class="google-avatar-circle" style="background:${g.avatarBg}; color:#ffffff;">${g.avatarInitial}</div>
                  <div style="text-align:left; flex:1;">
                    <div class="google-acc-name">${g.name}</div>
                    <div class="google-acc-email">${g.email}</div>
                  </div>
                  ${g.badgeText ? `<span class="badge ${g.badgeClass}" style="font-size:9.5px;">${g.badgeText}</span>` : ''}
                </div>
              `).join('')}

              <!-- Custom Google Entry -->
              <div class="google-account-item" id="google-use-custom">
                <div class="google-avatar-circle" style="background:#f1f5f9; color:#475569; border:1px dashed #94a3b8;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
                </div>
                <div style="text-align:left; flex:1;">
                  <div class="google-acc-name">Use another Google account</div>
                  <div class="google-acc-email">Enter your name and Gmail address</div>
                </div>
              </div>
            </div>

            <!-- Custom Input Drawer (Hidden by default) -->
            <div id="google-custom-drawer" style="display:none; padding:12px 16px; background:#f8fafc; border-top:1px solid #e2e8f0;">
              <div class="form-group" style="margin-bottom:8px;">
                <label class="form-label" style="font-size:11px;">Your Full Name</label>
                <input type="text" class="form-input form-input-sm" id="inp-custom-gname" placeholder="e.g. Vikram Malhotra" />
              </div>
              <div class="form-group" style="margin-bottom:10px;">
                <label class="form-label" style="font-size:11px;">Gmail Address</label>
                <input type="email" class="form-input form-input-sm" id="inp-custom-gmail" placeholder="vikram@gmail.com" />
              </div>
              <button type="button" class="btn btn-sm btn-primary" id="btn-submit-custom-google" style="width:100%;">
                Sign in with this Google Account
              </button>
            </div>

            <div class="google-modal-footer">
              <span style="font-size:11px; color:#6b7280;">Secure OAuth 2.0 Auth</span>
              <button type="button" class="btn btn-sm btn-outline" id="btn-cancel-google">Cancel</button>
            </div>

          </div>
        </div>

        <!-- Post-Login Onboarding / Welcome Modal -->
        <div class="modal-backdrop" id="auth-welcome-modal" style="display:none;">
          <div class="modal-dialog" style="max-width:440px; text-align:center;">
            
            <div style="width:48px; height:48px; border-radius:50%; background:#ecfdf5; border:1px solid #a7f3d0; color:#059669; display:inline-flex; align-items:center; justify-content:center; margin-bottom:12px;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            </div>

            <h3 style="font-size:18px; font-weight:700; color:var(--text-main); margin-bottom:4px;" id="welcome-title">Welcome to HealthCard</h3>
            <p style="font-size:12.5px; color:var(--text-secondary); margin-bottom:20px;" id="welcome-subtitle">
              Your account has been connected. You can now issue your 10-digit lifelong National Health ID and order your CR80 PVC card.
            </p>

            <div class="auth-welcome-actions">
              <a href="#home" class="btn btn-primary btn-block" style="height:44px; font-size:14px; font-weight:700; gap:8px;" id="welcome-btn-home">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                Enter Citizen Portal (Home)
              </a>

              <a href="#apply" class="btn btn-outline btn-block" style="height:40px; font-size:13px; font-weight:600; gap:8px; margin-top:8px;" id="welcome-btn-apply">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/></svg>
                Apply for HealthCard (₹50)
              </a>

              <a href="#dashboard" class="btn btn-ghost btn-block" style="height:36px; font-size:12px; margin-top:6px;">
                Go to Citizen Dashboard
              </a>
            </div>

          </div>
        </div>

        <!-- Forgot Password Modal -->
        <div class="modal-backdrop" id="modal-forgot-password" style="display:none;">
          <div class="modal-dialog" style="max-width:440px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; border-bottom:1px solid var(--border-color); padding-bottom:12px;">
              <div style="display:flex; align-items:center; gap:8px;">
                <div style="width:32px; height:32px; border-radius:6px; background:var(--color-primary-light); color:var(--color-primary); display:flex; align-items:center; justify-content:center;">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
                <div>
                  <h3 style="font-size:15px; font-weight:700; color:var(--text-main); margin:0;">Reset Citizen Password</h3>
                  <div style="font-size:11px; color:var(--text-muted);">Self-Service Account Recovery</div>
                </div>
              </div>
              <button type="button" class="btn btn-sm btn-ghost" id="btn-close-forgot-pw" style="color:var(--text-muted); padding:4px 8px;" title="Close">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            <!-- Step 1: Identify Account -->
            <div id="forgot-step-1">
              <p style="font-size:12.5px; color:var(--text-secondary); line-height:1.45; margin-bottom:16px;">
                Enter your registered Indian Mobile Number or Email Address. We will send a secure 6-digit recovery OTP code.
              </p>

              <div class="form-group" style="margin-bottom:16px;">
                <label class="form-label required">Registered Mobile or Email</label>
                <input type="text" class="form-input" id="inp-forgot-identifier" placeholder="e.g. 9876543210 or citizen@gmail.com" />
                <span class="form-hint">Matches your National HealthCard registration record.</span>
              </div>

              <div style="display:flex; gap:10px; justify-content:flex-end;">
                <button type="button" class="btn btn-outline btn-sm" id="btn-cancel-forgot-1">Cancel</button>
                <button type="button" class="btn btn-primary btn-sm" id="btn-send-forgot-otp" style="font-weight:700;">
                  Send Recovery OTP
                </button>
              </div>
            </div>

            <!-- Step 2: Verify Recovery OTP -->
            <div id="forgot-step-2" style="display:none;">
              <div class="otp-banner" style="margin-bottom:14px;">
                <span>Security Code sent to <strong id="lbl-forgot-target">•••••</strong></span>
                <button type="button" id="btn-forgot-change-id" class="link-btn">Change</button>
              </div>

              <p style="font-size:12px; color:var(--text-secondary); margin-bottom:14px;">
                Please enter the 6-digit verification code below to authorize password reset.
              </p>

              <div class="form-group" style="margin-bottom:16px;">
                <label class="form-label required">6-Digit Verification Code</label>
                <input type="text" class="form-input" id="inp-forgot-otp" placeholder="••••••" maxlength="6" style="font-family:var(--font-family-mono); font-size:18px; letter-spacing:0.25em; text-align:center; font-weight:700;" />
                <div style="display:flex; justify-content:space-between; margin-top:6px; font-size:11px;">
                  <span style="color:var(--text-muted);">Valid for 10 minutes</span>
                  <button type="button" id="btn-forgot-resend" class="link-btn" style="font-weight:600;">Resend OTP</button>
                </div>
              </div>

              <div style="display:flex; gap:10px; justify-content:flex-end;">
                <button type="button" class="btn btn-outline btn-sm" id="btn-cancel-forgot-2">Back</button>
                <button type="button" class="btn btn-primary btn-sm" id="btn-verify-forgot-otp" style="font-weight:700;">
                  Verify & Continue
                </button>
              </div>
            </div>

            <!-- Step 3: Set New Password -->
            <div id="forgot-step-3" style="display:none;">
              <div style="background:#ecfdf5; border:1px solid #a7f3d0; border-radius:6px; padding:10px 12px; margin-bottom:14px; font-size:11.5px; color:#065f46; display:flex; align-items:center; gap:8px;">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                <span>Identity verified via OTP. Choose a strong new password.</span>
              </div>

              <div class="form-group" style="margin-bottom:12px;">
                <label class="form-label required">New Password</label>
                <div style="position:relative;">
                  <input type="password" class="form-input" id="inp-forgot-new-pw" placeholder="At least 6 characters" style="padding-right:36px;" />
                  <button type="button" class="btn-toggle-pw" id="btn-toggle-new-pw" style="position:absolute; right:8px; top:50%; transform:translateY(-50%); background:none; border:none; color:var(--text-muted); cursor:pointer; padding:4px;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  </button>
                </div>
              </div>

              <div class="form-group" style="margin-bottom:16px;">
                <label class="form-label required">Confirm New Password</label>
                <input type="password" class="form-input" id="inp-forgot-confirm-pw" placeholder="Re-enter new password" />
              </div>

              <div style="display:flex; gap:10px; justify-content:flex-end;">
                <button type="button" class="btn btn-outline btn-sm" id="btn-cancel-forgot-3">Cancel</button>
                <button type="button" class="btn btn-primary btn-sm" id="btn-save-new-pw" style="font-weight:700;">
                  Update Password & Sign In
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    `;
  }

  bindEvents() {
    // Mode Switching: Sign In vs Create Account
    const tabSignIn = document.getElementById('tab-btn-signin');
    const tabSignUp = document.getElementById('tab-btn-signup');
    const promptSignUp = document.getElementById('prompt-to-signup');
    const promptSignIn = document.getElementById('prompt-to-signin');

    if (tabSignIn) tabSignIn.onclick = () => this.setMode('signin');
    if (tabSignUp) tabSignUp.onclick = () => this.setMode('signup');
    if (promptSignUp) promptSignUp.onclick = () => this.setMode('signup');
    if (promptSignIn) promptSignIn.onclick = () => this.setMode('signin');

    // Signin Method Switching: Mobile OTP vs Email/Password
    const btnMethodMobile = document.getElementById('btn-method-mobile');
    const btnMethodEmail = document.getElementById('btn-method-email');
    const flowMobile = document.getElementById('signin-flow-mobile');
    const flowEmail = document.getElementById('signin-flow-email');

    if (btnMethodMobile && btnMethodEmail) {
      btnMethodMobile.onclick = () => {
        this.signinMethod = 'mobile';
        btnMethodMobile.classList.add('active');
        btnMethodEmail.classList.remove('active');
        if (flowMobile) flowMobile.style.display = 'block';
        if (flowEmail) flowEmail.style.display = 'none';
      };

      btnMethodEmail.onclick = () => {
        this.signinMethod = 'email';
        btnMethodEmail.classList.add('active');
        btnMethodMobile.classList.remove('active');
        if (flowMobile) flowMobile.style.display = 'none';
        if (flowEmail) flowEmail.style.display = 'block';
      };
    }

    // Google Sign-In Trigger
    const btnGoogleAuth = document.getElementById('btn-google-auth');
    const googleModal = document.getElementById('google-picker-modal');
    const btnCancelGoogle = document.getElementById('btn-cancel-google');

    if (btnGoogleAuth && googleModal) {
      btnGoogleAuth.onclick = () => {
        googleModal.style.display = 'flex';
      };
    }

    if (btnCancelGoogle && googleModal) {
      btnCancelGoogle.onclick = () => {
        googleModal.style.display = 'none';
      };
    }

    // Google Account Picker Items
    this.container.querySelectorAll('.google-account-item[data-name]').forEach(item => {
      item.onclick = () => {
        const name = item.getAttribute('data-name');
        const email = item.getAttribute('data-email');
        const pic = item.getAttribute('data-pic');
        this.handleGoogleSuccess({ name, email, picture: pic });
      };
    });

    // Custom Google Account Drawer Toggle
    const btnUseCustom = document.getElementById('google-use-custom');
    const customDrawer = document.getElementById('google-custom-drawer');
    const btnSubmitCustom = document.getElementById('btn-submit-custom-google');

    if (btnUseCustom && customDrawer) {
      btnUseCustom.onclick = () => {
        customDrawer.style.display = customDrawer.style.display === 'none' ? 'block' : 'none';
      };
    }

    if (btnSubmitCustom) {
      btnSubmitCustom.onclick = () => {
        const name = document.getElementById('inp-custom-gname')?.value.trim();
        const email = document.getElementById('inp-custom-gmail')?.value.trim();
        if (!name || name.length < 2) {
          showToast('Please enter your full name', 'warning');
          return;
        }
        if (!email || !email.includes('@')) {
          showToast('Please enter a valid Gmail address', 'warning');
          return;
        }
        this.handleGoogleSuccess({
          name: name,
          email: email,
          picture: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`
        });
      };
    }

    // Mobile OTP Flow
    const btnRequest = document.getElementById('btn-request-otp');
    const inpMobile = document.getElementById('inp-login-mobile');
    const stepMobile = document.getElementById('auth-step-mobile');
    const stepOtp = document.getElementById('auth-step-otp');
    const inpOtp = document.getElementById('inp-login-otp');
    const btnConfirm = document.getElementById('btn-confirm-login');
    const btnChange = document.getElementById('btn-change-mobile');
    const lblMasked = document.getElementById('lbl-masked-mobile');

    if (btnRequest && inpMobile) {
      btnRequest.onclick = () => {
        const raw = inpMobile.value.replace(/\D/g, '');
        if (raw.length !== 10) {
          showToast('Please enter a valid 10-digit mobile number', 'warning');
          return;
        }

        this.pendingMobile = raw;
        const code = String(Math.floor(100000 + Math.random() * 900000));
        this.generatedOtp = code;

        showToast(`SMS Verification Code sent to +91 ${raw}: [ ${code} ]`, 'info', 8000);

        if (lblMasked) lblMasked.textContent = `+91 ${raw.slice(0, 2)}•••• ••${raw.slice(-2)}`;
        if (inpOtp) inpOtp.value = code;
        if (stepMobile) stepMobile.style.display = 'none';
        if (stepOtp) stepOtp.style.display = 'block';
      };
    }

    if (btnChange && stepMobile && stepOtp) {
      btnChange.onclick = () => {
        stepOtp.style.display = 'none';
        stepMobile.style.display = 'block';
      };
    }

    if (btnConfirm && inpOtp) {
      btnConfirm.onclick = () => {
        const entered = inpOtp.value.trim();
        if (!entered || entered.length !== 6) {
          showToast('Please enter the 6-digit OTP code', 'warning');
          return;
        }

        const { user, existingMember } = applicantStore.loginWithMobile(this.pendingMobile);
        showToast('Login successful! Welcome to HealthCard.', 'success');
        this.promptPostAuth(user, existingMember);
      };
    }

    // Email & Password Sign In
    const btnEmailLogin = document.getElementById('btn-confirm-email-login');
    if (btnEmailLogin) {
      btnEmailLogin.onclick = () => {
        const email = document.getElementById('inp-login-email')?.value.trim();
        const pw = document.getElementById('inp-login-password')?.value;
        if (!email || !email.includes('@')) {
          showToast('Please enter a valid email address', 'warning');
          return;
        }
        if (!pw || pw.length < 4) {
          showToast('Please enter your password', 'warning');
          return;
        }

        if (!applicantStore.verifyPassword(email, pw)) {
          showToast('Incorrect password. Click "Forgot Password?" to reset.', 'error');
          return;
        }

        const member = applicantStore.getMemberByEmail(email);
        const user = {
          id: member ? member.id : `usr_${Date.now()}`,
          fullName: member ? member.fullName : email.split('@')[0],
          email: email,
          mobile: member ? member.mobile : '',
          avatarUrl: member ? member.photoUrl : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(email)}`,
          provider: 'email',
          hasApplication: !!member,
          healthId: member ? member.healthId : null,
          memberId: member ? member.id : null
        };
        applicantStore.setCurrentUser(user);
        showToast(`Welcome back, ${user.fullName}!`, 'success');
        this.promptPostAuth(user, member);
      };
    }

    // Create Account Form Submission
    const signupForm = document.getElementById('form-create-account');
    if (signupForm) {
      signupForm.onsubmit = (e) => {
        e.preventDefault();
        const name = document.getElementById('inp-signup-name')?.value.trim();
        const mobile = document.getElementById('inp-signup-mobile')?.value.replace(/\D/g, '');
        const email = document.getElementById('inp-signup-email')?.value.trim();
        const pw = document.getElementById('inp-signup-password')?.value;
        const consent = document.getElementById('chk-signup-consent')?.checked;

        if (!name || name.length < 3) {
          showToast('Please enter your full legal name', 'warning');
          return;
        }
        if (!mobile || mobile.length !== 10) {
          showToast('Please enter a valid 10-digit mobile number', 'warning');
          return;
        }
        if (!email || !email.includes('@')) {
          showToast('Please enter a valid email address', 'warning');
          return;
        }
        if (!pw || pw.length < 6) {
          showToast('Password must be at least 6 characters', 'warning');
          return;
        }
        if (!consent) {
          showToast('Please consent to statutory DPDP Act terms', 'warning');
          return;
        }

        const { user, existingMember } = applicantStore.registerAccount({
          fullName: name,
          mobile: mobile,
          email: email,
          password: pw
        });

        showToast('Citizen account created successfully!', 'success');
        this.promptPostAuth(user, existingMember);
      };
    }

    // Quick Test Citizen Profile Buttons
    this.container.querySelectorAll('.btn-quick-citizen').forEach(btn => {
      btn.onclick = () => {
        const mob = btn.getAttribute('data-mobile');
        const { user, existingMember } = applicantStore.loginWithMobile(mob);
        showToast(`Signed in as demo citizen (${user.fullName})`, 'success');
        this.promptPostAuth(user, existingMember);
      };
    });

    // Switch / Sign Out User Button
    const btnSwitch = document.getElementById('btn-auth-switch-user');
    if (btnSwitch) {
      btnSwitch.onclick = () => {
        applicantStore.logoutUser();
        showToast('Signed out of citizen session.', 'info');
        this.render();
        this.bindEvents();
        if (this.onLoginSuccess) this.onLoginSuccess();
      };
    }

    // Forgot Password Flow
    const linkForgotPw = document.getElementById('link-forgot-pw');
    const modalForgot = document.getElementById('modal-forgot-password');
    const btnCloseForgot = document.getElementById('btn-close-forgot-pw');
    const step1 = document.getElementById('forgot-step-1');
    const step2 = document.getElementById('forgot-step-2');
    const step3 = document.getElementById('forgot-step-3');

    const inpForgotId = document.getElementById('inp-forgot-identifier');
    const btnSendForgotOtp = document.getElementById('btn-send-forgot-otp');
    const btnCancel1 = document.getElementById('btn-cancel-forgot-1');

    const lblForgotTarget = document.getElementById('lbl-forgot-target');
    const inpForgotOtp = document.getElementById('inp-forgot-otp');
    const btnVerifyForgotOtp = document.getElementById('btn-verify-forgot-otp');
    const btnForgotResend = document.getElementById('btn-forgot-resend');
    const btnForgotChangeId = document.getElementById('btn-forgot-change-id');
    const btnCancel2 = document.getElementById('btn-cancel-forgot-2');

    const inpForgotNewPw = document.getElementById('inp-forgot-new-pw');
    const inpForgotConfirmPw = document.getElementById('inp-forgot-confirm-pw');
    const btnToggleNewPw = document.getElementById('btn-toggle-new-pw');
    const btnSaveNewPw = document.getElementById('btn-save-new-pw');
    const btnCancel3 = document.getElementById('btn-cancel-forgot-3');

    const closeForgotModal = () => {
      if (modalForgot) modalForgot.style.display = 'none';
    };

    if (linkForgotPw && modalForgot) {
      linkForgotPw.onclick = (e) => {
        e.preventDefault();
        const typedEmail = document.getElementById('inp-login-email')?.value.trim();
        const typedMobile = document.getElementById('inp-login-mobile')?.value.trim();
        if (inpForgotId) {
          inpForgotId.value = typedEmail || typedMobile || '';
        }

        if (step1) step1.style.display = 'block';
        if (step2) step2.style.display = 'none';
        if (step3) step3.style.display = 'none';

        modalForgot.style.display = 'flex';
        setTimeout(() => inpForgotId?.focus(), 100);
      };
    }

    [btnCloseForgot, btnCancel1, btnCancel2, btnCancel3].forEach(btn => {
      if (btn) btn.onclick = closeForgotModal;
    });

    const triggerSendOtp = () => {
      const rawId = (inpForgotId?.value || '').trim();
      if (!rawId || rawId.length < 4) {
        showToast('Please enter your registered mobile number or email', 'warning');
        inpForgotId?.focus();
        return;
      }

      this.forgotPendingIdentifier = rawId;
      const code = String(Math.floor(100000 + Math.random() * 900000));
      this.forgotGeneratedOtp = code;

      // Mask display
      let masked = rawId;
      if (rawId.includes('@')) {
        const [uName, uDomain] = rawId.split('@');
        masked = `${uName.slice(0, 2)}••••@${uDomain}`;
      } else {
        const clean = rawId.replace(/\D/g, '');
        masked = `+91 ${clean.slice(0, 2)}•••• ••${clean.slice(-2)}`;
      }

      if (lblForgotTarget) lblForgotTarget.textContent = masked;
      if (inpForgotOtp) inpForgotOtp.value = code;

      showToast(`Password Reset Security Code sent to ${masked}: [ ${code} ]`, 'info', 9000);

      if (step1) step1.style.display = 'none';
      if (step2) step2.style.display = 'block';
      if (step3) step3.style.display = 'none';
      setTimeout(() => inpForgotOtp?.focus(), 100);
    };

    if (btnSendForgotOtp) {
      btnSendForgotOtp.onclick = triggerSendOtp;
    }

    if (btnForgotResend) {
      btnForgotResend.onclick = triggerSendOtp;
    }

    if (btnForgotChangeId) {
      btnForgotChangeId.onclick = () => {
        if (step1) step1.style.display = 'block';
        if (step2) step2.style.display = 'none';
        if (step3) step3.style.display = 'none';
        setTimeout(() => inpForgotId?.focus(), 100);
      };
    }

    if (btnVerifyForgotOtp) {
      btnVerifyForgotOtp.onclick = () => {
        const entered = (inpForgotOtp?.value || '').replace(/\D/g, '');
        if (entered.length !== 6) {
          showToast('Please enter the 6-digit verification code', 'warning');
          inpForgotOtp?.focus();
          return;
        }

        if (this.forgotGeneratedOtp && entered !== this.forgotGeneratedOtp) {
          showToast('Invalid verification code. Please check and try again.', 'error');
          return;
        }

        showToast('Identity verified via OTP. Please enter your new password.', 'success');
        if (step1) step1.style.display = 'none';
        if (step2) step2.style.display = 'none';
        if (step3) step3.style.display = 'block';
        setTimeout(() => inpForgotNewPw?.focus(), 100);
      };
    }

    if (btnToggleNewPw && inpForgotNewPw) {
      btnToggleNewPw.onclick = () => {
        const isPw = inpForgotNewPw.type === 'password';
        inpForgotNewPw.type = isPw ? 'text' : 'password';
      };
    }

    if (btnSaveNewPw) {
      btnSaveNewPw.onclick = () => {
        const newPw = inpForgotNewPw?.value || '';
        const confirmPw = inpForgotConfirmPw?.value || '';

        if (!newPw || newPw.length < 6) {
          showToast('New password must be at least 6 characters long', 'warning');
          inpForgotNewPw?.focus();
          return;
        }

        if (newPw !== confirmPw) {
          showToast('Passwords do not match. Please re-enter.', 'warning');
          inpForgotConfirmPw?.focus();
          return;
        }

        const id = this.forgotPendingIdentifier;
        applicantStore.resetPassword(id, newPw);

        const cleanMobile = id.replace(/\D/g, '');
        const member = applicantStore.getMemberByEmail(id) || (cleanMobile.length === 10 ? applicantStore.getMemberByMobile(cleanMobile) : null);

        const user = {
          id: member ? member.id : `usr_${Date.now()}`,
          fullName: member ? member.fullName : (id.includes('@') ? id.split('@')[0] : `Citizen (+91 ${cleanMobile})`),
          email: member ? member.email : (id.includes('@') ? id : ''),
          mobile: member ? member.mobile : (cleanMobile.length === 10 ? cleanMobile : ''),
          avatarUrl: member ? member.photoUrl : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(id)}`,
          provider: 'password_reset',
          hasApplication: !!member,
          healthId: member ? member.healthId : null,
          memberId: member ? member.id : null,
          loggedInAt: new Date().toISOString()
        };

        applicantStore.setCurrentUser(user);
        closeForgotModal();
        showToast(`Password successfully updated! Welcome back, ${user.fullName}.`, 'success');
        this.promptPostAuth(user, member);
      };
    }
  }

  handleGoogleSuccess(googleProfile) {
    const googleModal = document.getElementById('google-picker-modal');
    if (googleModal) googleModal.style.display = 'none';

    const { user, existingMember } = applicantStore.loginWithGoogle(googleProfile);
    showToast(`Signed in with Google as ${user.fullName}`, 'success');
    this.promptPostAuth(user, existingMember);
  }

  promptPostAuth(user, existingMember) {
    const welcomeModal = document.getElementById('auth-welcome-modal');
    const welcomeTitle = document.getElementById('welcome-title');
    const welcomeSub = document.getElementById('welcome-subtitle');
    const btnApply = document.getElementById('welcome-btn-apply');

    if (welcomeModal) {
      if (existingMember) {
        if (welcomeTitle) welcomeTitle.textContent = `Welcome Back, ${user.fullName.split(' ')[0]}!`;
        if (welcomeSub) {
          welcomeSub.innerHTML = `
            You have an existing HealthCard profile registered with Health ID <strong style="font-family:var(--font-family-mono);">${existingMember.healthId}</strong>.
          `;
        }
        if (btnApply) {
          btnApply.textContent = 'Apply for Another Card / Family';
        }
      } else {
        if (welcomeTitle) welcomeTitle.textContent = `Welcome, ${user.fullName.split(' ')[0]}!`;
        if (welcomeSub) {
          welcomeSub.innerHTML = `
            Your account is verified. You are now ready to apply for your lifelong 10-digit National Health ID and order your CR80 PVC card.
          `;
        }
        if (btnApply) {
          btnApply.textContent = 'Apply for HealthCard Now →';
        }
      }

      welcomeModal.style.display = 'flex';

      // Auto-refresh shell
      if (this.onLoginSuccess) this.onLoginSuccess();
    } else {
      if (this.onLoginSuccess) this.onLoginSuccess();
      else window.location.hash = '#apply';
    }
  }
}
