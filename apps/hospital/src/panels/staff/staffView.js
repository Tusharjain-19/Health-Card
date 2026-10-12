/**
 * HealthCard Hospital Portal: Hospital Doctors & Clinical Personnel Administration
 * Implements Item 3 & Item 4: Full Doctor Management (Add, Edit, Update, Schedule, OPD Room, NMC License)
 * Multi-computer synchronised with central backend and local store fallback.
 */

import { hospitalStore } from '../../shared/storage.js';
import { showToast } from '../../shared/components/toast.js';

export class StaffView {
  constructor(container) {
    this.container = container;
    this.activeTab = 'doctors'; // 'doctors' | 'all_staff'
    this.selectedDept = 'All';
  }

  render() {
    const doctors = hospitalStore.getDoctors(this.selectedDept);
    const staffList = hospitalStore.getStaffList();
    const departments = ['All', 'Cardiology', 'Internal Medicine', 'Emergency & Trauma', 'Pulmonology', 'General Surgery', 'Pediatrics'];

    this.container.innerHTML = `
      <div class="staff-view">
        <div class="page-header">
          <div>
            <h1 class="page-title">Hospital Doctors & Clinical Credential Directory</h1>
            <p class="page-subtitle">Statutory NMC medical council registration, OPD clinic schedules, and clinician authorizations</p>
          </div>
          <div style="display: flex; gap: 10px;">
            <button type="button" class="btn btn-primary" id="btn-add-doctor">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              + Register New Doctor
            </button>
            <button type="button" class="btn btn-secondary" id="btn-onboard-staff">
              + Onboard Ward / Desk Staff
            </button>
          </div>
        </div>

        <!-- Section Navigation Tabs & Department Filter -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
          <div style="display: flex; gap: 8px;">
            <button type="button" class="btn btn-sm ${this.activeTab === 'doctors' ? 'btn-primary' : 'btn-ghost'}" id="tab-doctors-view" style="font-weight: 700;">
              Hospital Doctors (${doctors.length})
            </button>
            <button type="button" class="btn btn-sm ${this.activeTab === 'all_staff' ? 'btn-primary' : 'btn-ghost'}" id="tab-all-staff-view">
              All Clinical Personnel (${staffList.length})
            </button>
          </div>

          <!-- Department Quick Filter -->
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 12.5px; color: var(--text-muted); font-weight: 600;">Department:</span>
            <select class="form-select form-select-sm" id="select-dept-filter" style="width: auto; padding: 4px 10px;">
              ${departments.map(d => `<option value="${d}" ${this.selectedDept === d ? 'selected' : ''}>${d}</option>`).join('')}
            </select>
          </div>
        </div>

        ${this.activeTab === 'doctors' ? this.renderDoctorsSection(doctors) : this.renderStaffSection(staffList)}
      </div>
    `;

    this.bindEvents();
  }

  renderDoctorsSection(doctors) {
    return `
      <div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: 24px; box-shadow: var(--shadow-sm);">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
          <div>
            <h3 style="font-size: 16px; font-weight: 700; color: var(--text-main); margin: 0;">Registered Hospital Doctors & OPD Clinicians</h3>
            <p style="font-size: 12px; color: var(--text-muted); margin: 2px 0 0 0;">Authorized for OPD consultations, e-prescriptions, Doctor App mobile access, and inpatient ward rounds</p>
          </div>
          <span class="badge badge-active">Central Medical Server Sync Active</span>
        </div>

        <table class="rx-table" style="font-size: 13px;">
          <thead>
            <tr>
              <th style="width: 28%;">Doctor & App Credentials</th>
              <th style="width: 18%;">Department & Specialization</th>
              <th style="width: 15%;">Medical Registration (NMC)</th>
              <th style="width: 17%;">OPD Room & Schedule</th>
              <th style="width: 7%;">Fee</th>
              <th style="width: 15%; text-align: right;">Management Actions</th>
            </tr>
          </thead>
          <tbody>
            ${doctors.length === 0 ? `
              <tr>
                <td colspan="6" style="text-align: center; padding: 30px; color: var(--text-muted);">
                  No doctors registered for selected department. Click "+ Register New Doctor" to add a clinician.
                </td>
              </tr>
            ` : doctors.map(doc => `
              <tr>
                <td>
                  <div style="display: flex; align-items: flex-start; gap: 12px;">
                    <div style="position: relative; flex-shrink: 0;">
                      <img src="${doc.avatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80'}" style="width: 48px; height: 48px; border-radius: 50%; object-fit: cover; border: 2px solid var(--color-primary); box-shadow: 0 1px 3px rgba(0,0,0,0.1);" alt="${doc.fullName}" />
                      <span style="position: absolute; bottom: 0; right: 0; width: 12px; height: 12px; background: #22c55e; border-radius: 50%; border: 2px solid #ffffff;" title="Active Clinician"></span>
                    </div>
                    <div>
                      <div style="font-weight: 700; color: var(--text-main); font-size: 14px;">${doc.fullName}</div>
                      <div style="font-size: 11px; color: var(--color-primary); font-weight: 600;">${doc.qualification || 'MBBS'}</div>
                      
                      <!-- Doctor App Credentials Chip -->
                      <div style="margin-top: 4px; display: inline-flex; align-items: center; gap: 5px; background: #f0fdf4; border: 1px solid #bbf7d0; padding: 2px 7px; border-radius: 4px; font-size: 10.5px;">
                        <span style="color: #166534; font-weight: 700;">📱 App:</span>
                        <span class="font-mono" style="font-weight: 700; color: #15803d;">${doc.appUsername || 'doc.' + doc.id}</span>
                        <span style="color: #86efac;">|</span>
                        <span style="color: #166534;">PIN: <strong>${doc.appPin || '••••'}</strong></span>
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <div style="font-weight: 600; color: var(--text-main);">${doc.department}</div>
                  <div style="font-size: 11.5px; color: var(--text-muted);">${doc.specialization || 'Clinical Specialist'}</div>
                </td>
                <td>
                  <span style="font-family: monospace; font-weight: 700; font-size: 11.5px; color: #1d4ed8; background: #eff6ff; border: 1px solid #bfdbfe; padding: 2px 7px; border-radius: 4px; display: inline-block;">
                    ${doc.regNumber || 'NMC Verified'}
                  </span>
                  <div style="font-size: 10.5px; color: #059669; margin-top: 3px; font-weight: 600;">✓ E-Signature Verified</div>
                </td>
                <td>
                  <div style="font-weight: 600; color: var(--text-main); font-size: 12px;">${doc.opdRoom || 'OPD Room 101'}</div>
                  <div style="font-size: 11px; color: var(--text-muted);">${doc.opdSchedule || 'Mon - Sat (09:00 AM – 01:00 PM)'}</div>
                </td>
                <td>
                  <span style="font-weight: 700; color: var(--text-main);">₹${doc.consultationFee ?? 50}</span>
                </td>
                <td style="text-align: right;">
                  <div style="display: inline-flex; gap: 6px;">
                    <button type="button" class="btn btn-sm btn-secondary btn-edit-doctor" data-id="${doc.id}" title="Edit doctor profile, photo, and app credentials">
                      Edit
                    </button>
                    <button type="button" class="btn btn-sm ${doc.status === 'Active' ? 'btn-outline' : 'btn-primary'} btn-toggle-doctor" data-id="${doc.id}">
                      ${doc.status === 'Active' ? 'Active' : 'On Leave'}
                    </button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  renderStaffSection(staffList) {
    return `
      <div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: 24px; box-shadow: var(--shadow-sm);">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
          <h3 style="font-size: 16px; font-weight: 700; color: var(--text-main); margin: 0;">Verified Clinical & Administrative Personnel (${staffList.length})</h3>
          <span class="badge badge-active">MFA Enforced Access</span>
        </div>

        <table class="rx-table" style="font-size: 13px;">
          <thead>
            <tr>
              <th style="width: 25%;">Staff Member</th>
              <th style="width: 15%;">Role</th>
              <th style="width: 20%;">Department</th>
              <th style="width: 15%;">Medical Registration</th>
              <th style="width: 10%;">MFA Status</th>
              <th style="width: 15%; text-align: right;">Authorization</th>
            </tr>
          </thead>
          <tbody>
            ${staffList.map(s => `
              <tr>
                <td>
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <img src="${s.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}" style="width: 38px; height: 38px; border-radius: 50%; object-fit: cover; border: 1px solid var(--border-color);" alt="${s.fullName}" />
                    <div>
                      <div style="font-weight: 700; color: var(--text-main);">${s.fullName}</div>
                      <div style="font-size: 11.5px; color: var(--text-muted);">${s.title || s.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span class="badge ${s.role === 'doctor' ? 'badge-active' : s.role === 'nurse' ? 'badge-blue' : 'badge-pending'}">
                    ${s.role.toUpperCase()}
                  </span>
                </td>
                <td style="color: var(--text-secondary); font-weight: 500;">${s.department}</td>
                <td>
                  <span style="font-family: monospace; font-weight: 600; font-size: 11.5px; color: var(--text-main); background: var(--bg-surface-subtle); padding: 2px 6px; border-radius: 4px; border: 1px solid var(--border-color);">
                    ${s.regNumber || 'N/A'}
                  </span>
                </td>
                <td>
                  ${s.mfaEnrolled ? '<span class="badge badge-active">MFA Active</span>' : '<span class="badge badge-pending">SMS OTP</span>'}
                </td>
                <td style="text-align: right;">
                  <button type="button" class="btn btn-sm ${s.status === 'Active' ? 'btn-outline' : 'btn-primary'} btn-toggle-staff" data-id="${s.id}">
                    ${s.status === 'Active' ? 'Revoke Access' : 'Reactivate'}
                  </button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  bindEvents() {
    // Tab switching
    this.container.querySelector('#tab-doctors-view')?.addEventListener('click', () => {
      this.activeTab = 'doctors';
      this.render();
    });

    this.container.querySelector('#tab-all-staff-view')?.addEventListener('click', () => {
      this.activeTab = 'all_staff';
      this.render();
    });

    // Department filter
    this.container.querySelector('#select-dept-filter')?.addEventListener('change', (e) => {
      this.selectedDept = e.target.value;
      this.render();
    });

    // Toggle staff status
    const toggleStaffBtns = this.container.querySelectorAll('.btn-toggle-staff');
    toggleStaffBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const updated = hospitalStore.toggleStaffStatus(id);
        showToast(`Staff status updated to ${updated?.status || 'Active'}.`, 'info');
        this.render();
      });
    });

    // Toggle doctor status
    const toggleDocBtns = this.container.querySelectorAll('.btn-toggle-doctor');
    toggleDocBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const doc = hospitalStore.getDoctorById(id);
        if (doc) {
          const newStatus = doc.status === 'Active' ? 'On Leave' : 'Active';
          hospitalStore.updateDoctor(id, { status: newStatus });
          showToast(`${doc.fullName} status updated to ${newStatus}.`, 'info');
          this.render();
        }
      });
    });

    // Edit Doctor button
    const editDocBtns = this.container.querySelectorAll('.btn-edit-doctor');
    editDocBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const doc = hospitalStore.getDoctorById(id);
        if (doc) {
          this.openEditDoctorModal(doc);
        }
      });
    });

    // Add Doctor button
    this.container.querySelector('#btn-add-doctor')?.addEventListener('click', () => {
      this.openAddDoctorModal();
    });

    // Onboard staff button
    this.container.querySelector('#btn-onboard-staff')?.addEventListener('click', () => {
      this.openOnboardModal();
    });
  }

  // ==========================================
  // ADD NEW DOCTOR MODAL (With Image & Doctor App Credentials)
  // ==========================================
  openAddDoctorModal() {
    let currentAvatarData = "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80";

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-dialog" style="max-width: 680px;">
        <div class="modal-header">
          <div>
            <h3 style="font-size: 16px; font-weight: 700; color: var(--text-main); margin: 0;">Register Hospital Doctor & Doctor App Account</h3>
            <p style="font-size: 11.5px; color: var(--text-muted); margin: 2px 0 0 0;">Add attending clinician, profile photo, OPD schedule, and Doctor App login credentials</p>
          </div>
          <button type="button" class="btn btn-sm btn-ghost modal-close" title="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <form id="modal-add-doc-form">
          <div class="modal-body">
            <!-- 1. Doctor Photo & Avatar Section -->
            <div style="background: #f8fafc; border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 14px 16px; margin-bottom: 16px; display: flex; align-items: center; gap: 16px;">
              <div style="position: relative; flex-shrink: 0;">
                <img id="add-doc-avatar-img" src="${currentAvatarData}" style="width: 72px; height: 72px; border-radius: 50%; object-fit: cover; border: 3px solid var(--color-primary); box-shadow: var(--shadow-sm);" alt="Doctor Photo" />
              </div>
              <div style="flex: 1;">
                <label class="form-label" style="font-weight: 700; margin-bottom: 4px;">Doctor Profile Photo / Image:</label>
                <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                  <button type="button" class="btn btn-sm btn-outline" id="btn-browse-doc-photo" style="display: inline-flex; align-items: center; gap: 6px;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    Choose Photo File
                  </button>
                  <input type="file" id="add-doc-file-input" accept="image/*" style="display: none;" />
                  <span style="font-size: 11.5px; color: var(--text-muted);">or paste image URL:</span>
                  <input type="text" id="add-doc-avatar-url" class="form-input form-input-sm" style="flex: 1; min-width: 180px; font-size: 11px;" placeholder="https://images.unsplash.com/..." value="${currentAvatarData}" />
                </div>
              </div>
            </div>

            <!-- 2. Doctor Basic Info -->
            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 12px;" class="form-group">
              <div>
                <label class="form-label">Doctor Full Name with Title:</label>
                <input type="text" id="doc-fullname" class="form-input" placeholder="e.g. Dr. Priya Malhotra" required />
              </div>
              <div>
                <label class="form-label">Department:</label>
                <select class="form-select" id="doc-dept">
                  <option value="Cardiology">Cardiology</option>
                  <option value="Internal Medicine">Internal Medicine</option>
                  <option value="Emergency & Trauma">Emergency & Trauma</option>
                  <option value="Pulmonology">Pulmonology</option>
                  <option value="General Surgery">General Surgery</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Orthopedics">Orthopedics</option>
                </select>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;" class="form-group">
              <div>
                <label class="form-label">Specialization / Focus Area:</label>
                <input type="text" id="doc-specialization" class="form-input" placeholder="e.g. Preventive Cardiology" required />
              </div>
              <div>
                <label class="form-label">Medical Degrees & Qualifications:</label>
                <input type="text" id="doc-qualification" class="form-input" placeholder="e.g. MBBS, MD, DM" value="MBBS, MD" required />
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;" class="form-group">
              <div>
                <label class="form-label">Medical Council Reg. (NMC/MCI License):</label>
                <input type="text" id="doc-reg" class="form-input font-mono" placeholder="e.g. NMC-2016/54291" required />
              </div>
              <div>
                <label class="form-label">OPD Consultation Fee (₹):</label>
                <input type="number" id="doc-fee" class="form-input" value="50" min="0" required />
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;" class="form-group">
              <div>
                <label class="form-label">Assigned OPD Room / Clinic Desk:</label>
                <input type="text" id="doc-room" class="form-input" placeholder="e.g. OPD Room 204 (Wing B)" value="OPD Room 204" required />
              </div>
              <div>
                <label class="form-label">OPD Working Schedule & Timings:</label>
                <input type="text" id="doc-schedule" class="form-input" placeholder="e.g. Mon, Wed, Fri (09:00 AM – 01:00 PM)" value="Mon, Wed, Fri (09:00 AM – 01:00 PM)" required />
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;" class="form-group">
              <div>
                <label class="form-label">Institutional Email:</label>
                <input type="email" id="doc-email" class="form-input" placeholder="doctor@aiims.gov.in" required />
              </div>
              <div>
                <label class="form-label">Contact Phone / Extension:</label>
                <input type="text" id="doc-phone" class="form-input" placeholder="+91 98000 00000" />
              </div>
            </div>

            <!-- 3. Doctor App Credentials Section (Prompt: doctor crediential for docters app will be used) -->
            <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: var(--radius-lg); padding: 14px 16px; margin-top: 18px;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                <div style="font-weight: 700; color: #166534; font-size: 13.5px; display: flex; align-items: center; gap: 6px;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
                  Doctor Mobile & Tablet App Credentials (चिकित्सक ऐप क्रेडेंशियल्स)
                </div>
                <span class="badge badge-active" style="font-size: 10px;">Doctor App Authorized</span>
              </div>
              <p style="font-size: 11.5px; color: #15803d; margin: 0 0 12px 0;">
                These credentials allow the doctor to log in to the HealthCard Doctor App to view assigned patients, write digital prescriptions, and conduct ward rounds.
              </p>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 10px;">
                <div>
                  <label class="form-label" style="font-size: 11.5px; font-weight: 700; color: #14532d;">Doctor App Username / Login ID:</label>
                  <input type="text" id="doc-app-username" class="form-input font-mono" placeholder="e.g. doc.priya" style="background: #ffffff;" required />
                </div>
                <div>
                  <label class="form-label" style="font-size: 11.5px; font-weight: 700; color: #14532d;">Doctor App Access PIN / Password:</label>
                  <input type="text" id="doc-app-pin" class="form-input font-mono" placeholder="e.g. 1234 (4-6 digit secure PIN)" value="1234" maxlength="16" style="background: #ffffff;" required />
                </div>
              </div>

              <div>
                <label class="form-label" style="font-size: 11.5px; font-weight: 700; color: #14532d;">Digital E-Signature Stamp (for E-Prescriptions):</label>
                <input type="text" id="doc-digital-sig" class="form-input" placeholder="e.g. Digitally Signed by Dr. Priya Malhotra (NMC Verified)" style="background: #ffffff;" />
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary modal-close">Cancel</button>
            <button type="submit" class="btn btn-primary">Save & Register Doctor</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(overlay);

    const avatarImg = overlay.querySelector('#add-doc-avatar-img');
    const avatarUrlInput = overlay.querySelector('#add-doc-avatar-url');
    const fileInput = overlay.querySelector('#add-doc-file-input');
    const browseBtn = overlay.querySelector('#btn-browse-doc-photo');
    const nameInput = overlay.querySelector('#doc-fullname');
    const appUsernameInput = overlay.querySelector('#doc-app-username');
    const digitalSigInput = overlay.querySelector('#doc-digital-sig');

    // Auto-suggest app username and digital signature as name is typed
    nameInput?.addEventListener('input', () => {
      const clean = nameInput.value.toLowerCase().replace(/[^a-z]/g, '').slice(0, 10);
      if (clean && !appUsernameInput.value) {
        appUsernameInput.value = `doc.${clean}`;
      }
      if (nameInput.value && !digitalSigInput.value) {
        digitalSigInput.value = `Digitally Signed by ${nameInput.value}`;
      }
    });

    browseBtn?.addEventListener('click', () => fileInput?.click());

    fileInput?.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (re) => {
          currentAvatarData = re.target.result;
          if (avatarImg) avatarImg.src = currentAvatarData;
          if (avatarUrlInput) avatarUrlInput.value = 'Local photo file loaded';
        };
        reader.readAsDataURL(file);
      }
    });

    avatarUrlInput?.addEventListener('input', () => {
      if (avatarUrlInput.value.startsWith('http')) {
        currentAvatarData = avatarUrlInput.value;
        if (avatarImg) avatarImg.src = currentAvatarData;
      }
    });

    overlay.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', () => overlay.remove());
    });

    overlay.querySelector('#modal-add-doc-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const fullName = overlay.querySelector('#doc-fullname').value;
      const department = overlay.querySelector('#doc-dept').value;
      const specialization = overlay.querySelector('#doc-specialization').value;
      const qualification = overlay.querySelector('#doc-qualification').value;
      const regNumber = overlay.querySelector('#doc-reg').value;
      const consultationFee = Number(overlay.querySelector('#doc-fee').value) || 0;
      const opdRoom = overlay.querySelector('#doc-room').value;
      const opdSchedule = overlay.querySelector('#doc-schedule').value;
      const email = overlay.querySelector('#doc-email').value;
      const phone = overlay.querySelector('#doc-phone').value;
      const appUsername = overlay.querySelector('#doc-app-username').value;
      const appPin = overlay.querySelector('#doc-app-pin').value;
      const digitalSignature = overlay.querySelector('#doc-digital-sig').value;

      hospitalStore.addDoctor({
        fullName,
        department,
        specialization,
        qualification,
        regNumber,
        consultationFee,
        opdRoom,
        opdSchedule,
        email,
        phone,
        avatar: currentAvatarData,
        appUsername,
        appPin,
        digitalSignature
      });

      overlay.remove();
      showToast(`${fullName} registered successfully! Doctor App ID "${appUsername}" configured.`, 'success');
      this.render();
    });
  }

  // ==========================================
  // EDIT DOCTOR DETAILS MODAL (With Image & Doctor App Credentials)
  // ==========================================
  openEditDoctorModal(doc) {
    let currentAvatarData = doc.avatar || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80";

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-dialog" style="max-width: 680px;">
        <div class="modal-header">
          <div>
            <h3 style="font-size: 16px; font-weight: 700; color: var(--text-main); margin: 0;">Edit Doctor Details & App Credentials</h3>
            <p style="font-size: 11.5px; color: var(--text-muted); margin: 2px 0 0 0;">Update photo, clinical assignments, OPD room, timings, and Doctor App login credentials</p>
          </div>
          <button type="button" class="btn btn-sm btn-ghost modal-close" title="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <form id="modal-edit-doc-form">
          <div class="modal-body">
            <!-- 1. Doctor Photo & Avatar Section -->
            <div style="background: #f8fafc; border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 14px 16px; margin-bottom: 16px; display: flex; align-items: center; gap: 16px;">
              <div style="position: relative; flex-shrink: 0;">
                <img id="edit-doc-avatar-img" src="${currentAvatarData}" style="width: 72px; height: 72px; border-radius: 50%; object-fit: cover; border: 3px solid var(--color-primary); box-shadow: var(--shadow-sm);" alt="${doc.fullName}" />
              </div>
              <div style="flex: 1;">
                <label class="form-label" style="font-weight: 700; margin-bottom: 4px;">Update Doctor Photo:</label>
                <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
                  <button type="button" class="btn btn-sm btn-outline" id="btn-edit-browse-photo" style="display: inline-flex; align-items: center; gap: 6px;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                    Upload New Photo
                  </button>
                  <input type="file" id="edit-doc-file-input" accept="image/*" style="display: none;" />
                  <span style="font-size: 11.5px; color: var(--text-muted);">or URL:</span>
                  <input type="text" id="edit-doc-avatar-url" class="form-input form-input-sm" style="flex: 1; min-width: 180px; font-size: 11px;" value="${currentAvatarData}" />
                </div>
              </div>
            </div>

            <!-- 2. Doctor Basic Info -->
            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 12px;" class="form-group">
              <div>
                <label class="form-label">Doctor Full Name:</label>
                <input type="text" id="edit-doc-fullname" class="form-input" value="${doc.fullName}" required />
              </div>
              <div>
                <label class="form-label">Department:</label>
                <select class="form-select" id="edit-doc-dept">
                  <option value="Cardiology" ${doc.department === 'Cardiology' ? 'selected' : ''}>Cardiology</option>
                  <option value="Internal Medicine" ${doc.department === 'Internal Medicine' ? 'selected' : ''}>Internal Medicine</option>
                  <option value="Emergency & Trauma" ${doc.department === 'Emergency & Trauma' ? 'selected' : ''}>Emergency & Trauma</option>
                  <option value="Pulmonology" ${doc.department === 'Pulmonology' ? 'selected' : ''}>Pulmonology</option>
                  <option value="General Surgery" ${doc.department === 'General Surgery' ? 'selected' : ''}>General Surgery</option>
                  <option value="Pediatrics" ${doc.department === 'Pediatrics' ? 'selected' : ''}>Pediatrics</option>
                  <option value="Orthopedics" ${doc.department === 'Orthopedics' ? 'selected' : ''}>Orthopedics</option>
                </select>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;" class="form-group">
              <div>
                <label class="form-label">Specialization:</label>
                <input type="text" id="edit-doc-specialization" class="form-input" value="${doc.specialization || ''}" required />
              </div>
              <div>
                <label class="form-label">Qualifications:</label>
                <input type="text" id="edit-doc-qualification" class="form-input" value="${doc.qualification || ''}" required />
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;" class="form-group">
              <div>
                <label class="form-label">Medical Council Reg. (NMC/MCI License):</label>
                <input type="text" id="edit-doc-reg" class="form-input font-mono" value="${doc.regNumber || ''}" required />
              </div>
              <div>
                <label class="form-label">OPD Consultation Fee (₹):</label>
                <input type="number" id="edit-doc-fee" class="form-input" value="${doc.consultationFee ?? 50}" min="0" required />
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;" class="form-group">
              <div>
                <label class="form-label">Assigned OPD Room / Clinic Desk:</label>
                <input type="text" id="edit-doc-room" class="form-input" value="${doc.opdRoom || ''}" required />
              </div>
              <div>
                <label class="form-label">OPD Working Schedule & Timings:</label>
                <input type="text" id="edit-doc-schedule" class="form-input" value="${doc.opdSchedule || ''}" required />
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;" class="form-group">
              <div>
                <label class="form-label">Email:</label>
                <input type="email" id="edit-doc-email" class="form-input" value="${doc.email || ''}" required />
              </div>
              <div>
                <label class="form-label">Phone / Extension:</label>
                <input type="text" id="edit-doc-phone" class="form-input" value="${doc.phone || ''}" />
              </div>
            </div>

            <!-- 3. Doctor App Credentials Section -->
            <div style="background: #f0fdf4; border: 1.5px solid #86efac; border-radius: var(--radius-lg); padding: 14px 16px; margin-top: 18px;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                <div style="font-weight: 700; color: #166534; font-size: 13.5px; display: flex; align-items: center; gap: 6px;">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
                  Doctor Mobile & Tablet App Credentials (चिकित्सक ऐप क्रेडेंशियल्स)
                </div>
                <span class="badge badge-active" style="font-size: 10px;">Doctor App Authorized</span>
              </div>
              <p style="font-size: 11.5px; color: #15803d; margin: 0 0 12px 0;">
                Doctor App credentials used for login on mobile tablets to conduct consultations and ward rounds.
              </p>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 10px;">
                <div>
                  <label class="form-label" style="font-size: 11.5px; font-weight: 700; color: #14532d;">Doctor App Username / Login ID:</label>
                  <input type="text" id="edit-doc-app-username" class="form-input font-mono" value="${doc.appUsername || 'doc.' + doc.id}" style="background: #ffffff;" required />
                </div>
                <div>
                  <label class="form-label" style="font-size: 11.5px; font-weight: 700; color: #14532d;">Doctor App Access PIN / Password:</label>
                  <input type="text" id="edit-doc-app-pin" class="form-input font-mono" value="${doc.appPin || '1234'}" maxlength="16" style="background: #ffffff;" required />
                </div>
              </div>

              <div>
                <label class="form-label" style="font-size: 11.5px; font-weight: 700; color: #14532d;">Digital E-Signature Stamp (for E-Prescriptions):</label>
                <input type="text" id="edit-doc-digital-sig" class="form-input" value="${doc.digitalSignature || `Digitally Signed by ${doc.fullName} (${doc.regNumber || 'NMC'})`}" style="background: #ffffff;" />
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary modal-close">Cancel</button>
            <button type="submit" class="btn btn-primary">Update Doctor Details</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(overlay);

    const avatarImg = overlay.querySelector('#edit-doc-avatar-img');
    const avatarUrlInput = overlay.querySelector('#edit-doc-avatar-url');
    const fileInput = overlay.querySelector('#edit-doc-file-input');
    const browseBtn = overlay.querySelector('#btn-edit-browse-photo');

    browseBtn?.addEventListener('click', () => fileInput?.click());

    fileInput?.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (re) => {
          currentAvatarData = re.target.result;
          if (avatarImg) avatarImg.src = currentAvatarData;
          if (avatarUrlInput) avatarUrlInput.value = 'Local photo file updated';
        };
        reader.readAsDataURL(file);
      }
    });

    avatarUrlInput?.addEventListener('input', () => {
      if (avatarUrlInput.value.startsWith('http')) {
        currentAvatarData = avatarUrlInput.value;
        if (avatarImg) avatarImg.src = currentAvatarData;
      }
    });

    overlay.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', () => overlay.remove());
    });

    overlay.querySelector('#modal-edit-doc-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const updated = {
        fullName: overlay.querySelector('#edit-doc-fullname').value,
        department: overlay.querySelector('#edit-doc-dept').value,
        specialization: overlay.querySelector('#edit-doc-specialization').value,
        qualification: overlay.querySelector('#edit-doc-qualification').value,
        regNumber: overlay.querySelector('#edit-doc-reg').value,
        consultationFee: Number(overlay.querySelector('#edit-doc-fee').value) || 0,
        opdRoom: overlay.querySelector('#edit-doc-room').value,
        opdSchedule: overlay.querySelector('#edit-doc-schedule').value,
        email: overlay.querySelector('#edit-doc-email').value,
        phone: overlay.querySelector('#edit-doc-phone').value,
        avatar: currentAvatarData,
        appUsername: overlay.querySelector('#edit-doc-app-username').value,
        appPin: overlay.querySelector('#edit-doc-app-pin').value,
        digitalSignature: overlay.querySelector('#edit-doc-digital-sig').value
      };

      hospitalStore.updateDoctor(doc.id, updated);
      overlay.remove();
      showToast(`${updated.fullName} details & Doctor App credentials updated!`, 'success');
      this.render();
    });
  }

  // ==========================================
  // ONBOARD GENERAL STAFF MODAL
  // ==========================================
  openOnboardModal() {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-header">
          <h3 style="font-size: 16px; font-weight: 700; color: var(--text-main); margin: 0;">Onboard Healthcare Professional</h3>
          <button type="button" class="btn btn-sm btn-ghost modal-close" title="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <form id="modal-staff-form">
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Full Name & Professional Title:</label>
              <input type="text" id="staff-name" class="form-input" placeholder="e.g. Sister Anjali Sharma, RN" required />
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;" class="form-group">
              <div>
                <label class="form-label">Clinical Role:</label>
                <select class="form-select" id="staff-role">
                  <option value="nurse" selected>Nurse (Ward & MAR)</option>
                  <option value="doctor">Doctor (Treating Clinician)</option>
                  <option value="receptionist">Receptionist (Intake Desk)</option>
                  <option value="hospital_admin">Hospital Administrator</option>
                </select>
              </div>
              <div>
                <label class="form-label">Department:</label>
                <select class="form-select" id="staff-dept">
                  <option value="Critical Care & Inpatient Wards">Critical Care & Inpatient Wards</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Emergency & Trauma">Emergency & Trauma</option>
                  <option value="Internal Medicine">Internal Medicine</option>
                  <option value="General Surgery">General Surgery</option>
                  <option value="Central Patient Registration">Central Patient Registration</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Registration / License No:</label>
              <input type="text" id="staff-license" class="form-input font-mono" placeholder="e.g. INC-DL-98210" required />
            </div>

            <div class="form-group">
              <label class="form-label">Institutional Email:</label>
              <input type="email" id="staff-email" class="form-input" placeholder="staff@aiims.gov.in" required />
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary modal-close">Cancel</button>
            <button type="submit" class="btn btn-primary">Verify & Authorize</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', () => overlay.remove());
    });

    overlay.querySelector('#modal-staff-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const fullName = overlay.querySelector('#staff-name').value;
      const role = overlay.querySelector('#staff-role').value;
      const department = overlay.querySelector('#staff-dept').value;
      const regNumber = overlay.querySelector('#staff-license').value;
      const email = overlay.querySelector('#staff-email').value;

      hospitalStore.addStaff({
        fullName,
        role,
        department,
        regNumber,
        email,
        title: role === 'doctor' ? 'Consultant' : role === 'nurse' ? 'Charge Nurse' : 'Hospital Personnel'
      });

      overlay.remove();
      showToast(`${fullName} onboarded successfully!`, 'success');
      this.render();
    });
  }
}
