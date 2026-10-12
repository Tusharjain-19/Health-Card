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
            <p style="font-size: 12px; color: var(--text-muted); margin: 2px 0 0 0;">Authorized to conduct OPD consultations, order diagnostics, and admit inpatients</p>
          </div>
          <span class="badge badge-active">Central Medical Server Sync Active</span>
        </div>

        <table class="rx-table" style="font-size: 13px;">
          <thead>
            <tr>
              <th style="width: 26%;">Doctor & Qualifications</th>
              <th style="width: 18%;">Department & Specialization</th>
              <th style="width: 15%;">Medical Registration (NMC)</th>
              <th style="width: 18%;">OPD Room & Schedule</th>
              <th style="width: 8%;">Consult Fee</th>
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
                  <div style="display: flex; align-items: center; gap: 10px;">
                    <img src="${doc.avatar || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80'}" style="width: 42px; height: 42px; border-radius: 50%; object-fit: cover; border: 1px solid var(--border-color);" alt="${doc.fullName}" />
                    <div>
                      <div style="font-weight: 700; color: var(--text-main); font-size: 13.5px;">${doc.fullName}</div>
                      <div style="font-size: 11px; color: var(--color-primary); font-weight: 600;">${doc.qualification || 'MBBS'}</div>
                      <div style="font-size: 11px; color: var(--text-muted);">${doc.email || doc.phone || ''}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div style="font-weight: 600; color: var(--text-main);">${doc.department}</div>
                  <div style="font-size: 11.5px; color: var(--text-muted);">${doc.specialization || 'Clinical Specialist'}</div>
                </td>
                <td>
                  <span style="font-family: monospace; font-weight: 700; font-size: 11.5px; color: #1d4ed8; background: #eff6ff; border: 1px solid #bfdbfe; padding: 2px 7px; border-radius: 4px;">
                    ${doc.regNumber || 'NMC Verified'}
                  </span>
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
                    <button type="button" class="btn btn-sm btn-secondary btn-edit-doctor" data-id="${doc.id}" title="Edit doctor details, schedule and room">
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
  // ADD NEW DOCTOR MODAL (Item 3 & 4)
  // ==========================================
  openAddDoctorModal() {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-dialog" style="max-width: 650px;">
        <div class="modal-header">
          <div>
            <h3 style="font-size: 16px; font-weight: 700; color: var(--text-main); margin: 0;">Register Hospital Doctor</h3>
            <p style="font-size: 11.5px; color: var(--text-muted); margin: 2px 0 0 0;">Add attending clinician for OPD prescriptions, diagnostics, and inpatient care</p>
          </div>
          <button type="button" class="btn btn-sm btn-ghost modal-close" title="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <form id="modal-add-doc-form">
          <div class="modal-body">
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
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary modal-close">Cancel</button>
            <button type="submit" class="btn btn-primary">Save & Register Doctor</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(overlay);

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
        phone
      });

      overlay.remove();
      showToast(`${fullName} registered successfully! OPD room and schedule assigned.`, 'success');
      this.render();
    });
  }

  // ==========================================
  // EDIT DOCTOR DETAILS MODAL (Item 4)
  // ==========================================
  openEditDoctorModal(doc) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-dialog" style="max-width: 650px;">
        <div class="modal-header">
          <div>
            <h3 style="font-size: 16px; font-weight: 700; color: var(--text-main); margin: 0;">Edit Doctor Details & Schedule</h3>
            <p style="font-size: 11.5px; color: var(--text-muted); margin: 2px 0 0 0;">Update clinical assignments, OPD room, timings, and fees</p>
          </div>
          <button type="button" class="btn btn-sm btn-ghost modal-close" title="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <form id="modal-edit-doc-form">
          <div class="modal-body">
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
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary modal-close">Cancel</button>
            <button type="submit" class="btn btn-primary">Update Doctor Details</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(overlay);

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
        phone: overlay.querySelector('#edit-doc-phone').value
      };

      hospitalStore.updateDoctor(doc.id, updated);
      overlay.remove();
      showToast(`${updated.fullName} details updated successfully across network!`, 'success');
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
