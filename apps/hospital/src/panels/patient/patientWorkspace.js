/**
 * HealthCard Hospital Portal: Patient Clinical Workspace & Chart Controller
 * Implements:
 * 1. Persistent High-Alert Allergy Strip & Bold Red Blood Group Tag
 * 2. Longitudinal Medical Timeline with Provenance Badges
 * 3. OPD Consultation Suite & Dynamic E-Prescription Builder with Printable Slip
 * 4. Inpatient Ward Management (IPD) with Doctor Rounds & Nurse MAR
 * 5. Diagnostic Labs Grid & Interactive Trend Charts
 * 6. Clinical Document Vault with SHA-256 Verification Seal
 * 7. 30-Minute Break-Glass Emergency Bypass Protocol
 */

import { hospitalStore } from '../../shared/storage.js';
import { formatHealthId } from '../../shared/utils/healthId.js';
import { formatDate, calculateAge, maskMobile } from '../../shared/utils/formatters.js';
import { showToast } from '../../shared/components/toast.js';

export class PatientWorkspace {
  constructor(container, healthId) {
    this.container = container;
    this.healthId = (healthId || '').replace(/\s+/g, '');
    this.activeTab = 'summary';
    this.timelineFilter = 'all';
    this.activeBreakGlassTimer = null;
    this.pendingUploadedReports = [];
    this.editingConsultationId = null;
  }

  render() {
    const summary = hospitalStore.getPatientClinicalSummary(this.healthId);

    if (!summary || !summary.patient) {
      this.container.innerHTML = `
        <div style="text-align: center; padding: 60px 20px; background: #ffffff; border-radius: var(--radius-xl); border: 1px solid var(--border-color); max-width: 600px; margin: 40px auto;">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2" style="margin-bottom: 16px;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <h2 style="font-size: 20px; font-weight: 700; color: var(--text-main); margin-bottom: 8px;">Patient Record Not Found</h2>
          <p style="font-size: 13.5px; color: var(--text-muted); margin-bottom: 20px;">Health ID "${this.healthId}" does not exist in the central registry.</p>
          <a href="#intake" class="btn btn-primary">Return to Patient Intake</a>
        </div>
      `;
      return;
    }

    const { patient, allergies, conditions, medications, vitals } = summary;
    const activeBreakGlass = hospitalStore.getActiveBreakGlass(this.healthId);
    const activeStaff = hospitalStore.getCurrentStaff();

    this.container.innerHTML = `
      <div class="patient-workspace">
        <!-- Floating Break Glass Bar (if active) -->
        ${activeBreakGlass ? `
          <div class="break-glass-bar">
            <div class="break-glass-left">
              <span class="break-glass-pulse"></span>
              <span style="display: inline-flex; align-items: center; gap: 6px;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                ACTIVE EMERGENCY BREAK-GLASS SESSION
              </span>
              <span style="font-weight: 400; opacity: 0.9;">• Clinician: ${activeBreakGlass.clinician} (${activeBreakGlass.department || 'Trauma'})</span>
              <span style="font-weight: 400; opacity: 0.9;">• Reason: "${activeBreakGlass.reason}"</span>
            </div>
            <div style="display: flex; align-items: center; gap: 12px;">
              <span class="countdown-chip" id="break-glass-timer-display">29:54 Left</span>
              <button type="button" class="btn btn-sm btn-outline" id="btn-end-breakglass" style="border-color: #fca5a5; color: #991b1b; background: #ffffff;">
                End Emergency Session
              </button>
            </div>
          </div>
        ` : ''}

        <!-- Persistent High-Alert Red Allergy Banner -->
        ${allergies.length > 0 ? `
          <div class="allergy-alert-strip">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2.2" style="flex-shrink: 0;"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <div style="flex: 1; display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
              <span style="font-size: 13px; font-weight: 700; color: #991b1b; text-transform: uppercase;">SEVERE CLINICAL ALLERGIES:</span>
              ${allergies.map(a => `
                <span class="allergy-pill" title="${a.reaction}">
                  ${a.substance} (${a.severity.split(' ')[0]})
                </span>
              `).join('')}
            </div>
            <span style="font-size: 11.5px; color: #b91c1c; font-weight: 600;">DO NOT ADMINISTER CONTRAINDICATED DRUGS</span>
          </div>
        ` : ''}

        <!-- Primary Patient Metadata Header Card -->
        <div class="patient-clinical-header">
          <div class="patient-info-strip">
            <div class="patient-primary-meta">
              <img src="${patient.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}" class="patient-photo" alt="${patient.fullName}" />
              <div>
                <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                  <h2 style="font-size: 20px; font-weight: 700; color: var(--text-main); margin: 0;">${patient.fullName}</h2>
                  <span class="blood-group-tag" title="High-Visibility Emergency Trauma Tag">${patient.bloodGroup || 'O+'}</span>
                  <span class="badge badge-active">Active Citizen Record</span>
                </div>
                <div style="display: flex; align-items: center; gap: 12px; margin-top: 4px; font-size: 13px; color: var(--text-secondary); flex-wrap: wrap;">
                  <span class="mono-health-id">${formatHealthId(patient.healthId)}</span>
                  <span>•</span>
                  <span>${calculateAge(patient.dob)}</span>
                  <span>•</span>
                  <span>${patient.gender || 'Male'}</span>
                  <span>•</span>
                  <span>Mobile: ${maskMobile(patient.mobile)}</span>
                  <span>•</span>
                  <span style="color: var(--text-muted);">Emergency: ${patient.emergencyContact?.name || 'Pooja'} (${patient.emergencyContact?.phone || '+91 9876543211'})</span>
                </div>
              </div>
            </div>

            <!-- Header Fast Action Buttons -->
            <div style="display: flex; gap: 8px; align-items: center;">
              <button type="button" class="btn btn-sm btn-emergency" id="btn-trigger-breakglass" ${activeBreakGlass ? 'disabled' : ''}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
                Break-Glass (30m)
              </button>
              <button type="button" class="btn btn-sm btn-primary" id="btn-start-consultation">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                New Consultation
              </button>
              <button type="button" class="btn btn-sm btn-secondary" id="btn-admit-ward">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M7 15h10"/><path d="M12 9v6"/></svg>
                Admit to Ward
              </button>
            </div>
          </div>

          <!-- Quick Vitals & Active Conditions Strip -->
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--border-color);">
            <div>
              <div style="font-size: 11.5px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 6px;">Active Chronic Conditions:</div>
              <div style="display: flex; flex-wrap: wrap; gap: 6px;">
                ${conditions.length === 0 ? '<span style="font-size: 12.5px; color: var(--text-muted);">None reported</span>' : conditions.map(c => `
                  <span class="badge badge-blue" title="${c.display} (${c.code})">${c.display}</span>
                `).join('')}
              </div>
            </div>

            <div>
              <div style="font-size: 11.5px; font-weight: 700; color: var(--text-muted); text-transform: uppercase; margin-bottom: 6px;">Latest Recorded Vitals:</div>
              <div style="display: flex; gap: 12px; font-size: 12.5px; color: var(--text-secondary); flex-wrap: wrap;">
                ${vitals ? `
                  <span>BP: <strong>${vitals.bpSys}/${vitals.bpDia} mmHg</strong></span>
                  <span>Pulse: <strong>${vitals.pulse} bpm</strong></span>
                  <span>SpO2: <strong>${vitals.spo2}%</strong></span>
                  <span>Temp: <strong>${vitals.temp}°F</strong></span>
                  <span>BMI: <strong>${vitals.bmi || '24.9'}</strong></span>
                ` : '<span>No vitals recorded today</span>'}
              </div>
            </div>
          </div>
        </div>

        <!-- Clinical Navigation Tabs -->
        <div class="clinical-tabs">
          <button type="button" class="tab-btn ${this.activeTab === 'summary' ? 'active' : ''}" data-tab="summary">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            Summary & Longitudinal Timeline
          </button>
          <button type="button" class="tab-btn ${this.activeTab === 'consultation' ? 'active' : ''}" data-tab="consultation">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            OPD Consultation & E-Prescription
          </button>
          <button type="button" class="tab-btn ${this.activeTab === 'admissions' ? 'active' : ''}" data-tab="admissions">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M7 15h10"/><path d="M12 9v6"/></svg>
            Inpatient Stays (IPD) & MAR
          </button>
          <button type="button" class="tab-btn ${this.activeTab === 'labs' ? 'active' : ''}" data-tab="labs">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 2v7.31"/><path d="M14 2v7.31"/><path d="M8.5 2h7"/><path d="M14 9.3a6.5 6.5 0 1 1-4 0"/></svg>
            Diagnostics & Lab Trends
          </button>
          <button type="button" class="tab-btn ${this.activeTab === 'documents' ? 'active' : ''}" data-tab="documents">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
            Document Vault & Imaging
          </button>
          <button type="button" class="tab-btn ${this.activeTab === 'emergency' ? 'active' : ''}" data-tab="emergency" style="color: #dc2626;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#dc2626" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
            Emergency Trauma View
          </button>
        </div>

        <!-- Dynamic Clinical Tab Mount Point -->
        <div id="clinical-tab-viewport"></div>
      </div>

      <!-- Printable A4 Prescription Slip (Targeted by window.print()) -->
      <div class="printable-rx-container" id="printable-rx-slot"></div>
    `;

    this.renderCurrentTab();
    this.bindEvents();

    if (activeBreakGlass) {
      this.initBreakGlassTimer();
    }
  }

  bindEvents() {
    // Sub-nav tab switching
    const tabs = this.container.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.activeTab = tab.getAttribute('data-tab');
        this.renderCurrentTab();
      });
    });

    // Quick Action: Start Consultation
    const consultBtn = this.container.querySelector('#btn-start-consultation');
    if (consultBtn) {
      consultBtn.addEventListener('click', () => {
        const tabBtn = this.container.querySelector('[data-tab="consultation"]');
        if (tabBtn) tabBtn.click();
      });
    }

    // Quick Action: Admit to Ward
    const admitBtn = this.container.querySelector('#btn-admit-ward');
    if (admitBtn) {
      admitBtn.addEventListener('click', () => {
        const tabBtn = this.container.querySelector('[data-tab="admissions"]');
        if (tabBtn) tabBtn.click();
      });
    }

    // Trigger Break-Glass Emergency Modal
    const bgBtn = this.container.querySelector('#btn-trigger-breakglass');
    if (bgBtn) {
      bgBtn.addEventListener('click', () => this.openBreakGlassModal());
    }

    // End Break Glass Session
    const endBgBtn = this.container.querySelector('#btn-end-breakglass');
    if (endBgBtn) {
      endBgBtn.addEventListener('click', () => {
        hospitalStore.terminateBreakGlass(this.healthId);
        showToast('Break-Glass emergency session concluded.', 'info');
        this.render();
      });
    }
  }

  renderCurrentTab() {
    const mount = this.container.querySelector('#clinical-tab-viewport');
    if (!mount) return;

    if (this.activeTab === 'summary') {
      this.renderTimelineTab(mount);
    } else if (this.activeTab === 'consultation') {
      this.renderConsultationTab(mount);
    } else if (this.activeTab === 'admissions') {
      this.renderAdmissionsTab(mount);
    } else if (this.activeTab === 'labs') {
      this.renderLabsTab(mount);
    } else if (this.activeTab === 'documents') {
      this.renderDocumentsTab(mount);
    } else if (this.activeTab === 'emergency') {
      this.renderEmergencyTab(mount);
    }
  }

  // ==========================================================================
  // TAB 1: Longitudinal Medical Timeline (PRD REC-01, REC-04)
  // ==========================================================================
  renderTimelineTab(container) {
    const summary = hospitalStore.getPatientClinicalSummary(this.healthId);
    const { consultations, admissions, labResults, documents } = summary;

    // Combine all records into single chronological stream
    const events = [];

    consultations.forEach(c => {
      events.push({
        type: 'consultation',
        title: `Outpatient Consultation: ${c.diagnoses?.[0]?.name || 'Clinical Review'}`,
        facility: c.facility,
        clinician: `${c.clinician} (${c.regNumber || 'NMC Verified'})`,
        date: c.date,
        details: c.chiefComplaint,
        badge: 'Provider Verified',
        badgeClass: 'badge-active',
        payload: c
      });
    });

    admissions.forEach(a => {
      events.push({
        type: 'admission',
        title: `Inpatient Admission: ${a.admittingDiagnosis}`,
        facility: 'AIIMS New Delhi: General Inpatient Wards',
        clinician: `Dr. Vikram Sethi (Admitting Consultant)`,
        date: a.admittedAt,
        details: `Stay: ${a.ward} (${a.bedNumber}) • Status: ${a.status}. ${a.courseSummary}`,
        badge: 'Provider Verified',
        badgeClass: 'badge-active',
        payload: a
      });
    });

    labResults.forEach(l => {
      events.push({
        type: 'lab',
        title: `Diagnostic Lab: ${l.testName} = ${l.valueText} ${l.unit}`,
        facility: l.labOrg,
        clinician: l.verifiedBy,
        date: l.reportedAt,
        details: `Reference Interval: ${l.refLow} - ${l.refHigh} ${l.unit} • Flag: ${l.flag === 'H' ? 'High' : l.flag === 'L' ? 'Low' : 'Normal'}`,
        badge: 'NABL Lab Verified',
        badgeClass: 'badge-blue',
        payload: l
      });
    });

    documents.forEach(d => {
      events.push({
        type: 'document',
        title: `Clinical Archive: ${d.title}`,
        facility: d.orgName,
        clinician: d.author,
        date: d.date,
        details: `${d.category} (${d.size}) • SHA-256 Verified Archive`,
        badge: 'Encrypted Vault',
        badgeClass: 'badge-active',
        payload: d
      });
    });

    // Sort reverse-chronologically
    events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    container.innerHTML = `
      <div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: 24px; box-shadow: var(--shadow-sm);">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
          <div>
            <h3 style="font-size: 16px; font-weight: 700; color: var(--text-main); margin: 0;">Longitudinal Medical Timeline</h3>
            <p style="font-size: 12px; color: var(--text-muted); margin: 2px 0 0 0;">Unified lifelong clinical records across all healthcare institutions</p>
          </div>
          
          <div style="display: flex; gap: 6px;">
            <button type="button" class="btn btn-sm btn-outline tl-filter active" data-filter="all">All Records (${events.length})</button>
            <button type="button" class="btn btn-sm btn-outline tl-filter" data-filter="consultation">OPD Consults</button>
            <button type="button" class="btn btn-sm btn-outline tl-filter" data-filter="admission">Inpatient Stays</button>
            <button type="button" class="btn btn-sm btn-outline tl-filter" data-filter="lab">Lab Results</button>
            <button type="button" class="btn btn-sm btn-outline tl-filter" data-filter="document">Documents</button>
          </div>
        </div>

        <div class="timeline-container" id="timeline-events-mount">
          ${events.map(ev => `
            <div class="timeline-event-card" data-type="${ev.type}">
              <div class="timeline-dot"></div>
              <div class="timeline-header">
                <div>
                  <div style="font-size: 14.5px; font-weight: 700; color: var(--text-main);">${ev.title}</div>
                  <div style="font-size: 12px; color: var(--text-muted); margin-top: 2px;">
                    ${ev.facility} • Treating Clinician: <strong>${ev.clinician}</strong>
                  </div>
                </div>
                <div style="text-align: right;">
                  <span class="provenance-tag ${ev.badgeClass}">${ev.badge}</span>
                  <div style="font-size: 11.5px; color: var(--text-muted); margin-top: 3px;">${formatDate(ev.date, true)}</div>
                </div>
              </div>
              <div style="font-size: 13px; color: var(--text-secondary); line-height: 1.4; background: var(--bg-surface-subtle); padding: 10px 12px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
                ${ev.details}

                ${ev.type === 'consultation' && ev.payload.uploadedReports && ev.payload.uploadedReports.length > 0 ? `
                  <div style="margin-top: 10px; padding-top: 8px; border-top: 1px dashed #cbd5e1;">
                    <strong style="font-size: 11.5px; color: #0f172a;">Attached Prescription Scans & Diagnostic Reports:</strong>
                    <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 6px;">
                      ${ev.payload.uploadedReports.map(rep => `
                        <span class="badge badge-blue" style="font-size: 11px; display: inline-flex; align-items: center; gap: 4px;">
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                          ${rep.name} (${rep.size || 'Attached'})
                          ${rep.dataUrl ? `<a href="${rep.dataUrl}" target="_blank" style="margin-left: 4px; color: #1d4ed8; font-weight: 700; text-decoration: underline;">Preview</a>` : ''}
                        </span>
                      `).join('')}
                    </div>
                  </div>
                ` : ''}

                ${ev.type === 'consultation' ? `
                  <div style="display: flex; justify-content: flex-end; margin-top: 8px;">
                    <button type="button" class="btn btn-sm btn-secondary btn-edit-consult" data-cid="${ev.payload.id}">
                      Edit Consultation Details
                    </button>
                  </div>
                ` : ''}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // Filter handling
    const filterBtns = container.querySelectorAll('.tl-filter');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.getAttribute('data-filter');
        const cards = container.querySelectorAll('.timeline-event-card');
        cards.forEach(card => {
          if (filter === 'all' || card.getAttribute('data-type') === filter) {
            card.style.display = 'block';
          } else {
            card.style.display = 'none';
          }
        });
      });
    });

    // Edit consultation click
    container.querySelectorAll('.btn-edit-consult').forEach(btn => {
      btn.addEventListener('click', () => {
        const cid = btn.getAttribute('data-cid');
        this.openEditConsultationModal(cid);
      });
    });
  }

  // ==========================================================================
  // TAB 2: OPD Consultation Suite & E-Prescription Builder (PRD REC-02, REC-03)
  // ==========================================================================
  renderConsultationTab(container) {
    const summary = hospitalStore.getPatientClinicalSummary(this.healthId);
    const { patient, vitals } = summary;
    const staff = hospitalStore.getCurrentStaff();
    const doctors = hospitalStore.getDoctors();
    const services = hospitalStore.getServices();

    container.innerHTML = `
      <div class="consultation-form-card">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; border-bottom: 1px solid var(--border-color); padding-bottom: 12px;">
          <div>
            <h3 style="font-size: 17px; font-weight: 700; color: var(--text-main); margin: 0;">Outpatient Consultation & E-Prescription Suite</h3>
            <p style="font-size: 12.5px; color: var(--text-muted); margin: 2px 0 0 0;">AIIMS Outpatient Department • Regulated by National Medical Commission (NMC)</p>
          </div>
          <span class="badge badge-active">OPD Session Active</span>
        </div>

        <form id="consultation-form">
          <!-- Doctor Assignment & Services Tariff Strip (Item 3) -->
          <div style="background: #f8fafc; border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 14px 16px; margin-bottom: 20px;">
            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 14px; margin-bottom: 12px;">
              <div>
                <label class="form-label" style="font-weight: 700; color: var(--text-main);">Attending Hospital Doctor / Clinician:</label>
                <select class="form-select" id="consult-doctor-select" required>
                  ${doctors.map(d => `
                    <option value="${d.id}" data-name="${d.fullName}" data-dept="${d.department}" data-reg="${d.regNumber || ''}" ${d.fullName === staff.fullName ? 'selected' : ''}>
                      ${d.fullName}: ${d.department} • ${d.specialization || 'Consultant'} (${d.opdRoom || 'OPD'})
                    </option>
                  `).join('')}
                </select>
              </div>
              <div>
                <label class="form-label" style="font-weight: 700; color: var(--text-main);">Clinical Encounter Type:</label>
                <select class="form-select" id="consult-encounter-type">
                  <option value="OPD Regular">OPD Regular Consultation</option>
                  <option value="OPD Follow-up">OPD Follow-up Review</option>
                  <option value="Specialist Referral">Specialist Referral</option>
                </select>
              </div>
            </div>

            <div>
              <label class="form-label" style="font-weight: 700; color: var(--text-main); margin-bottom: 6px;">Hospital Clinical Services & Tariffs Applied:</label>
              <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                ${services.slice(0, 6).map(s => `
                  <label style="display: flex; align-items: center; gap: 6px; font-size: 12px; background: #ffffff; padding: 5px 10px; border-radius: 6px; border: 1px solid var(--border-color); cursor: pointer;">
                    <input type="checkbox" class="consult-service-cb" value="${s.id}" data-name="${s.name}" data-fee="${s.standardFee}" ${s.code === 'OPD-CONSULT' ? 'checked' : ''} />
                    <span><strong>${s.name}</strong> (₹${s.standardFee})</span>
                  </label>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- 1. Chief Complaints -->
          <div class="form-group">
            <label class="form-label">Chief Clinical Complaints & Duration:</label>
            <div style="display: flex; gap: 10px;">
              <input type="text" id="consult-complaints" class="form-input" placeholder="e.g. Occasional retrosternal heaviness, shortness of breath on climbing stairs..." value="Review of hypertension and glycemic control. Mild headache." required style="flex: 2;" />
              <input type="text" id="consult-duration" class="form-input" placeholder="Duration (e.g. 5 days, 2 weeks)" value="1 week" style="flex: 1;" />
            </div>
          </div>

          <!-- 2. Systemic Examination Notes -->
          <div class="form-group">
            <label class="form-label">Clinical Examination & Systemic Findings:</label>
            <textarea id="consult-exam" class="form-textarea" placeholder="Physical observations, cardiovascular, respiratory, and abdominal examination...">Conscious, oriented. S1 S2 heard normal. Bilateral air entry clear. Per abdomen soft, non-tender. Bilateral pedal edema absent.</textarea>
          </div>

          <!-- 3. Current Vitals Capture -->
          <div class="section-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            Encounter Vitals
          </div>
          <div class="vitals-inputs-grid">
            <div>
              <label class="form-label">BP (Systolic)</label>
              <input type="number" id="vital-bp-sys" class="form-input" value="${vitals?.bpSys || 128}" />
            </div>
            <div>
              <label class="form-label">BP (Diastolic)</label>
              <input type="number" id="vital-bp-dia" class="form-input" value="${vitals?.bpDia || 82}" />
            </div>
            <div>
              <label class="form-label">Heart Rate (bpm)</label>
              <input type="number" id="vital-pulse" class="form-input" value="${vitals?.pulse || 74}" />
            </div>
            <div>
              <label class="form-label">SpO2 (%)</label>
              <input type="number" id="vital-spo2" class="form-input" value="${vitals?.spo2 || 98}" />
            </div>
            <div>
              <label class="form-label">Temp (°F)</label>
              <input type="number" step="0.1" id="vital-temp" class="form-input" value="${vitals?.temp || 98.4}" />
            </div>
            <div>
              <label class="form-label">Weight (kg)</label>
              <input type="number" step="0.5" id="vital-weight" class="form-input" value="${vitals?.weight || 76.5}" />
            </div>
          </div>

          <!-- 4. ICD-10 Clinical Diagnosis Tagging -->
          <div class="section-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
            ICD-10 Clinical Diagnosis
          </div>
          <div style="display: flex; gap: 8px; margin-bottom: 12px;">
            <select class="form-select" id="consult-dx-select">
              <option value="I10|Essential (Primary) Hypertension">I10: Essential (Primary) Hypertension</option>
              <option value="E11.9|Type 2 Diabetes Mellitus without complications">E11.9: Type 2 Diabetes Mellitus without complications</option>
              <option value="E78.0|Pure Hypercholesterolemia">E78.0: Pure Hypercholesterolemia</option>
              <option value="J20.9|Acute Bronchitis, unspecified">J20.9: Acute Bronchitis, unspecified</option>
              <option value="J30.1|Allergic Rhinitis due to pollen">J30.1: Allergic Rhinitis due to pollen</option>
              <option value="M17.0|Primary Bilateral Osteoarthritis of Knee">M17.0: Primary Bilateral Osteoarthritis of Knee</option>
              <option value="K21.9|Gastro-esophageal Reflux Disease (GERD)">K21.9: Gastro-esophageal Reflux Disease (GERD)</option>
            </select>
            <button type="button" class="btn btn-secondary" id="btn-add-dx">Add Diagnosis</button>
          </div>
          <div id="dx-tags-container" style="display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px;">
            <span class="badge badge-active" data-code="I10" data-name="Essential (Primary) Hypertension">
              I10: Essential (Primary) Hypertension
              <button type="button" style="border:none; background:none; cursor:pointer; color:#065f46; margin-left:4px;" onclick="this.parentElement.remove()">×</button>
            </span>
            <span class="badge badge-active" data-code="E11.9" data-name="Type 2 Diabetes Mellitus without complications">
              E11.9: Type 2 Diabetes Mellitus
              <button type="button" style="border:none; background:none; cursor:pointer; color:#065f46; margin-left:4px;" onclick="this.parentElement.remove()">×</button>
            </span>
          </div>

          <!-- 5. Dynamic E-Prescription Multi-Row Builder -->
          <div class="section-title" style="justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/></svg>
              Dynamic E-Prescription Builder (Rx)
            </div>
            <button type="button" class="btn btn-sm btn-secondary" id="btn-add-rx-row">
              + Add Medicine
            </button>
          </div>

          <table class="rx-table" id="rx-builder-table">
            <thead>
              <tr>
                <th style="width: 30%;">Drug Name</th>
                <th style="width: 15%;">Dosage</th>
                <th style="width: 15%;">Frequency</th>
                <th style="width: 20%;">Timing / Food</th>
                <th style="width: 12%;">Days</th>
                <th style="width: 8%;">Action</th>
              </tr>
            </thead>
            <tbody id="rx-rows-body">
              <tr>
                <td><input type="text" class="form-input rx-drug" value="Telmisartan" /></td>
                <td><input type="text" class="form-input rx-dose" value="40 mg" /></td>
                <td>
                  <select class="form-select rx-freq">
                    <option value="OD" selected>OD (Once Daily)</option>
                    <option value="BD">BD (Twice Daily)</option>
                    <option value="TDS">TDS (Thrice Daily)</option>
                    <option value="SOS">SOS (As Needed)</option>
                  </select>
                </td>
                <td><input type="text" class="form-input rx-timing" value="Morning after food" /></td>
                <td><input type="number" class="form-input rx-days" value="90" /></td>
                <td><button type="button" class="btn btn-sm btn-ghost" onclick="this.closest('tr').remove()" style="color: #dc2626;">×</button></td>
              </tr>
              <tr>
                <td><input type="text" class="form-input rx-drug" value="Metformin SR" /></td>
                <td><input type="text" class="form-input rx-dose" value="500 mg" /></td>
                <td>
                  <select class="form-select rx-freq">
                    <option value="OD">OD (Once Daily)</option>
                    <option value="BD" selected>BD (Twice Daily)</option>
                    <option value="TDS">TDS (Thrice Daily)</option>
                    <option value="SOS">SOS (As Needed)</option>
                  </select>
                </td>
                <td><input type="text" class="form-input rx-timing" value="After lunch & dinner" /></td>
                <td><input type="number" class="form-input rx-days" value="90" /></td>
                <td><button type="button" class="btn btn-sm btn-ghost" onclick="this.closest('tr').remove()" style="color: #dc2626;">×</button></td>
              </tr>
              <tr>
                <td><input type="text" class="form-input rx-drug" value="Atorvastatin" /></td>
                <td><input type="text" class="form-input rx-dose" value="10 mg" /></td>
                <td>
                  <select class="form-select rx-freq">
                    <option value="OD" selected>OD (Once Daily)</option>
                    <option value="BD">BD (Twice Daily)</option>
                  </select>
                </td>
                <td><input type="text" class="form-input rx-timing" value="At bedtime" /></td>
                <td><input type="number" class="form-input rx-days" value="90" /></td>
                <td><button type="button" class="btn btn-sm btn-ghost" onclick="this.closest('tr').remove()" style="color: #dc2626;">×</button></td>
              </tr>
            </tbody>
          </table>

          <!-- 6. Diagnostic Investigations Orders -->
          <div class="section-title" style="margin-top: 24px;">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            Diagnostic Investigations Ordered
          </div>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 8px; margin-bottom: 20px;">
            <label style="font-size: 12.5px; display: flex; align-items: center; gap: 8px;">
              <input type="checkbox" class="inv-order" value="HbA1c" checked /> HbA1c (Glycated Hb)
            </label>
            <label style="font-size: 12.5px; display: flex; align-items: center; gap: 8px;">
              <input type="checkbox" class="inv-order" value="Lipid Profile" checked /> Complete Lipid Profile
            </label>
            <label style="font-size: 12.5px; display: flex; align-items: center; gap: 8px;">
              <input type="checkbox" class="inv-order" value="Serum Creatinine" checked /> Serum Creatinine & eGFR
            </label>
            <label style="font-size: 12.5px; display: flex; align-items: center; gap: 8px;">
              <input type="checkbox" class="inv-order" value="Urine Microalbumin" checked /> Urine Microalbumin
            </label>
            <label style="font-size: 12.5px; display: flex; align-items: center; gap: 8px;">
              <input type="checkbox" class="inv-order" value="12-Lead ECG" /> 12-Lead Resting ECG
            </label>
          </div>

          <!-- 6B. Upload Physical Prescription Scans & Diagnostic Reports (Item 3) -->
          <div class="section-title" style="margin-top: 24px; justify-content: space-between;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
              Upload Prescription Scans & Diagnostic Test Reports
            </div>
            <div>
              <button type="button" class="btn btn-sm btn-outline" id="btn-browse-reports">
                + Upload Scans / Reports
              </button>
              <input type="file" id="consult-file-uploader" multiple accept=".pdf,image/*" style="display: none;" />
            </div>
          </div>

          <div style="background: #f8fafc; border: 1.5px dashed #cbd5e1; border-radius: 8px; padding: 14px 16px; margin-bottom: 20px;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <div style="font-size: 12.5px; color: var(--text-secondary);">
                Attach paper prescription scans, prior records, ECG traces, or lab result PDFs to this e-prescription.
              </div>
              <span style="font-size: 11.5px; color: #1d4ed8; font-weight: 700;" id="consult-file-count-badge">${this.pendingUploadedReports.length} reports attached</span>
            </div>
            <div id="consult-uploaded-chips-list" style="display: flex; flex-wrap: wrap; gap: 8px; margin-top: 10px;">
              ${this.pendingUploadedReports.map((file, idx) => `
                <div style="display: inline-flex; align-items: center; gap: 8px; background: #ffffff; border: 1px solid #cbd5e1; padding: 4px 10px; border-radius: 6px; font-size: 12px;">
                  <span style="display: inline-flex; align-items: center; gap: 5px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg><strong>${file.name}</strong> (${file.size})</span>
                  ${file.dataUrl ? `<a href="${file.dataUrl}" target="_blank" style="color: #1d4ed8; font-weight: 600; text-decoration: underline;">Preview</a>` : ''}
                  <button type="button" style="border: none; background: none; color: #dc2626; cursor: pointer; display: inline-flex; align-items: center;" data-idx="${idx}" class="btn-remove-report" title="Remove report">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- 7. Advice & Follow Up -->
          <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 16px; margin-bottom: 24px;">
            <div>
              <label class="form-label">Clinical Lifestyle & Dietary Advice:</label>
              <textarea id="consult-advice" class="form-textarea">Diet: Low salt (<5g/day), refined sugar restricted. 30 minutes daily walking. Self-monitor blood pressure twice weekly.</textarea>
            </div>
            <div>
              <label class="form-label">Follow-up Review Date:</label>
              <input type="date" id="consult-followup" class="form-input" value="2026-10-28" />
            </div>
          </div>

          <!-- Bottom Form Actions -->
          <div style="display: flex; gap: 12px; justify-content: flex-end; padding-top: 16px; border-top: 1px solid var(--border-color);">
            <button type="button" class="btn btn-secondary" id="btn-print-rx">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
              Print Official Prescription Slip
            </button>
            <button type="submit" class="btn btn-primary" id="btn-save-consult">
              Save Clinical Consultation & Prescriptions
            </button>
          </div>
        </form>
      </div>
    `;

    // File upload handler for prescription scans & reports (Item 3)
    const fileInput = container.querySelector('#consult-file-uploader');
    const browseBtn = container.querySelector('#btn-browse-reports');
    const chipsList = container.querySelector('#consult-uploaded-chips-list');
    const countBadge = container.querySelector('#consult-file-count-badge');

    const updateChips = () => {
      if (!chipsList) return;
      if (countBadge) countBadge.textContent = `${this.pendingUploadedReports.length} reports attached`;
      chipsList.innerHTML = this.pendingUploadedReports.map((file, idx) => `
        <div style="display: inline-flex; align-items: center; gap: 8px; background: #ffffff; border: 1px solid #cbd5e1; padding: 4px 10px; border-radius: 6px; font-size: 12px;">
          <span style="display: inline-flex; align-items: center; gap: 5px;"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg><strong>${file.name}</strong> (${file.size})</span>
          ${file.dataUrl ? `<a href="${file.dataUrl}" target="_blank" style="color: #1d4ed8; font-weight: 600; text-decoration: underline;">Preview</a>` : ''}
          <button type="button" style="border: none; background: none; color: #dc2626; cursor: pointer; display: inline-flex; align-items: center;" data-idx="${idx}" class="btn-remove-report" title="Remove report">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      `).join('');

      chipsList.querySelectorAll('.btn-remove-report').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const idx = parseInt(btn.getAttribute('data-idx'), 10);
          this.pendingUploadedReports.splice(idx, 1);
          updateChips();
        });
      });
    };

    browseBtn?.addEventListener('click', () => fileInput?.click());

    fileInput?.addEventListener('change', (e) => {
      const files = Array.from(e.target.files || []);
      files.forEach(f => {
        const reader = new FileReader();
        reader.onload = (re) => {
          this.pendingUploadedReports.push({
            name: f.name,
            size: (f.size / 1024).toFixed(1) + ' KB',
            type: f.type,
            dataUrl: re.target.result,
            uploadedAt: new Date().toISOString()
          });
          updateChips();
        };
        reader.readAsDataURL(f);
      });
    });

    chipsList?.querySelectorAll('.btn-remove-report').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        this.pendingUploadedReports.splice(idx, 1);
        updateChips();
      });
    });

    // Add diagnosis button handler
    const addDxBtn = container.querySelector('#btn-add-dx');
    addDxBtn?.addEventListener('click', () => {
      const select = container.querySelector('#consult-dx-select');
      const [code, name] = (select.value || '').split('|');
      const tagContainer = container.querySelector('#dx-tags-container');

      const span = document.createElement('span');
      span.className = 'badge badge-active';
      span.setAttribute('data-code', code);
      span.setAttribute('data-name', name);
      span.innerHTML = `
        ${code}: ${name}
        <button type="button" style="border:none; background:none; cursor:pointer; color:#065f46; margin-left:4px;" onclick="this.parentElement.remove()">×</button>
      `;
      tagContainer.appendChild(span);
    });

    // Add medicine row handler
    const addRxBtn = container.querySelector('#btn-add-rx-row');
    addRxBtn?.addEventListener('click', () => {
      const tbody = container.querySelector('#rx-rows-body');
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><input type="text" class="form-input rx-drug" placeholder="Drug name" /></td>
        <td><input type="text" class="form-input rx-dose" placeholder="e.g. 500 mg" /></td>
        <td>
          <select class="form-select rx-freq">
            <option value="OD">OD (Once Daily)</option>
            <option value="BD">BD (Twice Daily)</option>
            <option value="TDS">TDS (Thrice Daily)</option>
            <option value="SOS">SOS (As Needed)</option>
          </select>
        </td>
        <td><input type="text" class="form-input rx-timing" value="After food" /></td>
        <td><input type="number" class="form-input rx-days" value="30" /></td>
        <td><button type="button" class="btn btn-sm btn-ghost" onclick="this.closest('tr').remove()" style="color: #dc2626;">×</button></td>
      `;
      tbody.appendChild(tr);
    });

    // Save Consultation Form Submit
    const form = container.querySelector('#consultation-form');
    form?.addEventListener('submit', (e) => {
      e.preventDefault();

      // Collect doctor info
      const docSelect = container.querySelector('#consult-doctor-select');
      const selectedOption = docSelect ? docSelect.options[docSelect.selectedIndex] : null;
      const doctorId = docSelect ? docSelect.value : null;
      const doctorName = selectedOption ? selectedOption.getAttribute('data-name') : staff.fullName;
      const doctorDept = selectedOption ? selectedOption.getAttribute('data-dept') : staff.department;
      const doctorReg = selectedOption ? selectedOption.getAttribute('data-reg') : (staff.regNumber || 'NMC Verified');

      // Collect services
      const selectedServices = Array.from(container.querySelectorAll('.consult-service-cb:checked')).map(cb => ({
        id: cb.value,
        name: cb.getAttribute('data-name'),
        fee: Number(cb.getAttribute('data-fee')) || 0
      }));

      // Collect data
      const chiefComplaint = container.querySelector('#consult-complaints').value;
      const duration = container.querySelector('#consult-duration').value;
      const examination = container.querySelector('#consult-exam').value;
      const advice = container.querySelector('#consult-advice').value;
      const followUpDate = container.querySelector('#consult-followup').value;

      const vitalsData = {
        bpSys: parseInt(container.querySelector('#vital-bp-sys').value, 10),
        bpDia: parseInt(container.querySelector('#vital-bp-dia').value, 10),
        pulse: parseInt(container.querySelector('#vital-pulse').value, 10),
        spo2: parseInt(container.querySelector('#vital-spo2').value, 10),
        temp: parseFloat(container.querySelector('#vital-temp').value),
        weight: parseFloat(container.querySelector('#vital-weight').value)
      };

      const diagnoses = Array.from(container.querySelectorAll('#dx-tags-container .badge')).map(tag => ({
        code: tag.getAttribute('data-code'),
        name: tag.getAttribute('data-name')
      }));

      const prescriptions = Array.from(container.querySelectorAll('#rx-rows-body tr')).map(row => ({
        drug: row.querySelector('.rx-drug').value,
        dosage: row.querySelector('.rx-dose').value,
        frequency: row.querySelector('.rx-freq').value,
        timing: row.querySelector('.rx-timing').value,
        days: parseInt(row.querySelector('.rx-days').value, 10) || 30
      })).filter(rx => rx.drug.trim());

      const investigationsOrdered = Array.from(container.querySelectorAll('.inv-order:checked')).map(cb => cb.value);

      hospitalStore.addConsultation({
        healthId: this.healthId,
        doctorId,
        clinician: doctorName,
        doctorName,
        department: doctorDept,
        regNumber: doctorReg,
        services: selectedServices,
        chiefComplaint,
        duration,
        examination,
        vitals: vitalsData,
        diagnoses,
        prescriptions,
        investigationsOrdered,
        uploadedReports: [...this.pendingUploadedReports],
        advice,
        followUpDate
      });

      this.pendingUploadedReports = [];
      showToast('Consultation & prescriptions saved successfully! Attached reports synced.', 'success');
      this.activeTab = 'summary';
    });

    // Print Rx Slip
    const printBtn = container.querySelector('#btn-print-rx');
    printBtn?.addEventListener('click', () => {
      this.printPrescription();
    });
  }

  printPrescription() {
    const summary = hospitalStore.getPatientClinicalSummary(this.healthId);
    const { patient } = summary;
    const staff = hospitalStore.getCurrentStaff();

    const slot = document.getElementById('printable-rx-slot');
    if (!slot) return;

    slot.innerHTML = `
      <div style="max-width: 800px; margin: 0 auto; border: 2px solid #1d4ed8; padding: 24px; border-radius: 8px;">
        <!-- Letterhead Header -->
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #1d4ed8; padding-bottom: 16px; margin-bottom: 16px;">
          <div>
            <h1 style="font-size: 22px; font-weight: 800; color: #1d4ed8; margin: 0;">ALL INDIA INSTITUTE OF MEDICAL SCIENCES</h1>
            <p style="font-size: 13px; color: #334155; margin: 2px 0 0 0;">Ansari Nagar, New Delhi - 110029 • Outpatient Clinical Services</p>
            <p style="font-size: 11px; color: #64748b; margin: 2px 0 0 0;">Clinical Establishment Registration: HOSP-DL-00192 • NABH Accredited</p>
          </div>
          <div style="text-align: right;">
            <div style="font-size: 14px; font-weight: 700; color: #0f172a;">${staff.fullName}</div>
            <div style="font-size: 12px; color: #64748b;">${staff.title}</div>
            <div style="font-size: 11px; font-family: monospace; color: #1d4ed8; font-weight: 700;">Reg No: ${staff.regNumber || 'NMC-2004/09182'}</div>
          </div>
        </div>

        <!-- Patient Demographics Strip -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; background: #f8fafc; padding: 10px 14px; border-radius: 6px; font-size: 13px; margin-bottom: 20px; border: 1px solid #e2e8f0;">
          <div><strong>Patient Name:</strong> ${patient.fullName}</div>
          <div><strong>Age / Sex:</strong> ${calculateAge(patient.dob)} / ${patient.gender}</div>
          <div><strong>Blood Group:</strong> <span style="color: #dc2626; font-weight: 800;">${patient.bloodGroup || 'O+'}</span></div>
          <div><strong>Health ID:</strong> <span style="font-family: monospace; font-weight: 700;">${formatHealthId(patient.healthId)}</span></div>
        </div>

        <!-- Rx Symbol -->
        <div style="font-size: 28px; font-weight: 800; font-family: serif; color: #1d4ed8; margin-bottom: 10px;">℞</div>

        <!-- Medicines Table -->
        <table style="width: 100%; border-collapse: collapse; font-size: 13.5px; margin-bottom: 24px;">
          <thead>
            <tr style="background: #f1f5f9; border-bottom: 2px solid #cbd5e1;">
              <th style="padding: 8px; text-align: left;">#</th>
              <th style="padding: 8px; text-align: left;">Medicine Name</th>
              <th style="padding: 8px; text-align: left;">Dosage</th>
              <th style="padding: 8px; text-align: left;">Frequency</th>
              <th style="padding: 8px; text-align: left;">Timing</th>
              <th style="padding: 8px; text-align: left;">Duration</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">1</td>
              <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: 700;">Telmisartan</td>
              <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">40 mg</td>
              <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">Once Daily (OD)</td>
              <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">Morning after food</td>
              <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">90 Days</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">2</td>
              <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: 700;">Metformin SR</td>
              <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">500 mg</td>
              <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">Twice Daily (BD)</td>
              <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">After meals</td>
              <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">90 Days</td>
            </tr>
            <tr>
              <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">3</td>
              <td style="padding: 8px; border-bottom: 1px solid #e2e8f0; font-weight: 700;">Atorvastatin</td>
              <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">10 mg</td>
              <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">Once Daily (HS)</td>
              <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">At bedtime</td>
              <td style="padding: 8px; border-bottom: 1px solid #e2e8f0;">90 Days</td>
            </tr>
          </tbody>
        </table>

        <!-- Clinical Advice -->
        <div style="background: #fafbfc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; font-size: 13px; margin-bottom: 30px;">
          <strong>Dietary & Clinical Advice:</strong> Low salt (<5g/day), refined sugar restricted. 30 minutes daily walking. Self-monitor blood pressure twice weekly. Review in OPD with lab reports.
        </div>

        <!-- Doctor Signature Stamp -->
        <div style="display: flex; justify-content: space-between; align-items: flex-end; padding-top: 20px;">
          <div style="font-size: 11px; color: #64748b;">
            <div>Digitally generated via HealthCard National Health Infrastructure</div>
            <div>Verification Code: <strong>HC-RX-${Date.now().toString(36).toUpperCase()}</strong></div>
          </div>
          <div style="text-align: right; border-top: 1px solid #0f172a; padding-top: 6px; width: 220px;">
            <div style="font-weight: 700; font-size: 13.5px;">${staff.fullName}</div>
            <div style="font-size: 11px; color: #64748b;">Digital Signature Verified</div>
          </div>
        </div>
      </div>
    `;

    window.print();
  }

  // ==========================================================================
  // TAB 3: Inpatient Ward Stays (IPD) & MAR (PRD REC-08, Item 3 & 4)
  // ==========================================================================
  renderAdmissionsTab(container) {
    const summary = hospitalStore.getPatientClinicalSummary(this.healthId);
    const { admissions, patient } = summary;

    container.innerHTML = `
      <div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: 24px; box-shadow: var(--shadow-sm);">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
          <div>
            <h3 style="font-size: 16px; font-weight: 700; color: var(--text-main); margin: 0;">Inpatient Ward Hospitalizations (IPD)</h3>
            <p style="font-size: 12px; color: var(--text-muted); margin: 2px 0 0 0;">Day-by-day clinical rounds, procedures performed, Medication Administration Records (MAR), and lab reports</p>
          </div>
          <button type="button" class="btn btn-sm btn-primary" id="btn-modal-admit">
            + New Inpatient Admission
          </button>
        </div>

        ${admissions.length === 0 ? `
          <div style="text-align: center; padding: 40px; color: var(--text-muted); background: var(--bg-surface-subtle); border-radius: var(--radius-lg);">
            No inpatient admission records for this patient. Click "New Inpatient Admission" to admit to ward.
          </div>
        ` : admissions.map(adm => `
          <div style="border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 18px; margin-bottom: 24px; background: #fafbfc;">
            <!-- Admission Meta Header & Inpatient Actions -->
            <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 16px; border-bottom: 1px solid var(--border-color); padding-bottom: 12px; flex-wrap: wrap; gap: 10px;">
              <div>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="font-weight: 800; font-size: 15px; color: var(--text-main);">${adm.admittingDiagnosis}</span>
                  <span class="badge ${adm.status === 'Active Inpatient' ? 'badge-active' : 'badge-pending'}">${adm.status}</span>
                </div>
                <div style="font-size: 12px; color: var(--text-muted); margin-top: 4px;">
                  Location: <strong>${adm.ward} (${adm.bedNumber})</strong> • Admitted: <strong>${formatDate(adm.admittedAt)}</strong> • Attending: <strong>${adm.admittingDoctor}</strong>
                </div>
              </div>

              <!-- Inpatient Action Buttons (Item 3 & 4) -->
              <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                ${adm.status === 'Active Inpatient' ? `
                  <button type="button" class="btn btn-sm btn-primary btn-log-round" data-admid="${adm.id}">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    + Log Procedures & MAR Doses
                  </button>
                  <button type="button" class="btn btn-sm btn-secondary btn-edit-admission" data-admid="${adm.id}">
                    Edit Stay Details
                  </button>
                  <button type="button" class="btn btn-sm btn-outline btn-discharge-adm" data-admid="${adm.id}" style="color: #065f46; border-color: #a7f3d0;">
                    Discharge
                  </button>
                ` : `
                  <span style="font-size: 12px; color: #15803d; font-weight: 600; padding: 4px 8px; background: #ecfdf5; border-radius: 4px;">
                    Discharged on ${formatDate(adm.dischargedAt)}
                  </span>
                `}
              </div>
            </div>

            <!-- Day by Day Rounds, Procedures & MAR -->
            <div style="font-size: 13px; font-weight: 700; color: var(--text-secondary); margin-bottom: 10px;">Day-by-Day Inpatient Course & Clinical Procedures:</div>
            <div style="display: flex; flex-direction: column; gap: 14px;">
              ${adm.days.map(d => `
                <div style="background: #ffffff; border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 14px 16px; box-shadow: 0 1px 2px rgba(0,0,0,0.02);">
                  <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; border-bottom: 1px solid var(--border-subtle); padding-bottom: 6px;">
                    <span style="font-weight: 800; font-size: 13.5px; color: var(--color-primary);">Day ${d.dayNo} (${formatDate(d.date)})</span>
                    <span style="font-size: 11px; color: var(--text-muted); font-weight: 600;">Daily Clinical Log</span>
                  </div>

                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 10px;">
                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 8px 12px; border-radius: 6px;">
                      <strong style="font-size: 11.5px; color: #0f172a; text-transform: uppercase;">Doctor Ward Note:</strong>
                      <div style="font-size: 12px; color: #334155; margin-top: 2px;">${d.doctorNote || 'Rounds completed. Patient responding well to treatment.'}</div>
                    </div>
                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 8px 12px; border-radius: 6px;">
                      <strong style="font-size: 11.5px; color: #0f172a; text-transform: uppercase;">Nursing Observation:</strong>
                      <div style="font-size: 12px; color: #334155; margin-top: 2px;">${d.nurseNote || 'Vitals monitored regularly. Care protocol followed.'}</div>
                    </div>
                  </div>

                  <!-- 1. Clinical Procedures Done ("what they are doing") -->
                  <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 6px; padding: 10px 12px; margin-bottom: 10px;">
                    <strong style="font-size: 12px; color: #166534; display: flex; align-items: center; gap: 6px;">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
                      Clinical Procedures Performed:
                    </strong>
                    <div style="font-size: 12.5px; color: #15803d; margin-top: 3px;">
                      ${d.proceduresDone || 'Peripheral IV cannula maintenance, vitals telemetry monitoring, fluid hydration therapy.'}
                    </div>
                  </div>

                  <!-- 2. Medication Administration Records ("dose and all") -->
                  <div style="margin-bottom: 10px;">
                    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
                      <strong style="font-size: 12px; color: #0f172a; display: flex; align-items: center; gap: 6px;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>
                        Medication Administration Records (Doses Administered):
                      </strong>
                    </div>

                    <table class="rx-table" style="font-size: 12px; margin-top: 4px;">
                      <thead>
                        <tr>
                          <th style="width: 25%;">Drug Name</th>
                          <th style="width: 15%;">Dose</th>
                          <th style="width: 15%;">Route</th>
                          <th style="width: 15%;">Time</th>
                          <th style="width: 15%;">Status</th>
                          <th style="width: 15%;">Nurse Stamp</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${((d.medsDoses && d.medsDoses.length > 0) ? d.medsDoses : (d.medsAdministered || [])).length === 0 ? `
                          <tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 8px;">No medication doses logged for this round.</td></tr>
                        ` : ((d.medsDoses && d.medsDoses.length > 0) ? d.medsDoses : d.medsAdministered).map(m => `
                          <tr>
                            <td style="font-weight: 700; color: var(--text-main);">${m.drug}</td>
                            <td>${m.dose || 'Standard dose'}</td>
                            <td><span class="badge badge-active">${m.route || 'IV'}</span></td>
                            <td>${m.time || '10:00 AM'}</td>
                            <td><span style="color: #15803d; font-weight: 700;">● ${m.status || 'Given'}</span></td>
                            <td style="font-size: 11.5px; color: var(--text-muted);">${m.nurse || 'Ward Nurse'}</td>
                          </tr>
                        `).join('')}
                      </tbody>
                    </table>
                  </div>

                  <!-- 3. Attached Inpatient Diagnostic Test Reports -->
                  ${d.testReports && d.testReports.length > 0 ? `
                    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 8px 12px;">
                      <strong style="font-size: 11.5px; color: #0f172a;">Attached Inpatient Test Reports:</strong>
                      <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 4px;">
                        ${d.testReports.map(tr => `
                          <span class="badge badge-blue" style="font-size: 11.5px; padding: 4px 8px; display: inline-flex; align-items: center; gap: 5px;">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
                            ${tr.name} ${tr.value ? `- <em>${tr.value}</em>` : ''}
                          </span>
                        `).join('')}
                      </div>
                    </div>
                  ` : ''}
                </div>
              `).join('')}
            </div>

            <!-- Discharge Summary Preview (if discharged) -->
            ${adm.status === 'Discharged' ? `
              <div style="margin-top: 14px; padding: 12px; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: var(--radius-md); font-size: 12.5px; color: #065f46;">
                <strong>Official Discharge Course:</strong> ${adm.courseSummary}
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
    `;

    // Modal admit button
    const modalAdmitBtn = container.querySelector('#btn-modal-admit');
    modalAdmitBtn?.addEventListener('click', () => {
      this.openAdmitModal();
    });

    // Log Round & Procedures button
    container.querySelectorAll('.btn-log-round').forEach(btn => {
      btn.addEventListener('click', () => {
        const admId = btn.getAttribute('data-admid');
        this.openLogRoundModal(admId);
      });
    });

    // Edit Admission Details button
    container.querySelectorAll('.btn-edit-admission').forEach(btn => {
      btn.addEventListener('click', () => {
        const admId = btn.getAttribute('data-admid');
        this.openEditAdmissionModal(admId);
      });
    });

    // Discharge button
    const dischargeBtns = container.querySelectorAll('.btn-discharge-adm');
    dischargeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const admId = btn.getAttribute('data-admid');
        this.openDischargeModal(admId);
      });
    });
  }

  // ==========================================================================
  // TAB 4: Diagnostic Investigations & Lab Trends (PRD REC-09, REC-10)
  // ==========================================================================
  renderLabsTab(container) {
    const summary = hospitalStore.getPatientClinicalSummary(this.healthId);
    const { labResults } = summary;

    container.innerHTML = `
      <div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: 24px; box-shadow: var(--shadow-sm);">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
          <div>
            <h3 style="font-size: 16px; font-weight: 700; color: var(--text-main); margin: 0;">Diagnostic Investigations & Structured Results</h3>
            <p style="font-size: 12px; color: var(--text-muted); margin: 2px 0 0 0;">NABL accredited lab values, reference intervals, and historical trend monitoring</p>
          </div>
          <button type="button" class="btn btn-sm btn-primary" id="btn-add-lab-result">
            + Enter Lab Results
          </button>
        </div>

        <!-- Interactive SVG Trend Chart: HbA1c -->
        <div style="background: #ffffff; border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 18px; margin-bottom: 24px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
            <div>
              <div style="font-weight: 700; font-size: 14px; color: var(--text-main);">Longitudinal Trend: Glycated Hemoglobin (HbA1c %)</div>
              <div style="font-size: 11.5px; color: var(--text-muted);">Normal Reference Band: 4.0% – 5.6% | Diabetic Target: < 7.0%</div>
            </div>
            <span class="badge badge-active">Improving Trend (7.8% → 6.5%)</span>
          </div>

          <!-- SVG Trend Visualization -->
          <svg viewBox="0 0 600 120" style="width: 100%; height: 120px; overflow: visible;">
            <!-- Normal reference band -->
            <rect x="0" y="65" width="600" height="25" fill="#f0fdf4" opacity="0.8" />
            <line x1="0" y1="65" x2="600" y2="65" stroke="#a7f3d0" stroke-dasharray="3 3" />
            <line x1="0" y1="90" x2="600" y2="90" stroke="#a7f3d0" stroke-dasharray="3 3" />
            
            <!-- Trend line -->
            <polyline fill="none" stroke="#1d4ed8" stroke-width="3" points="50,20 200,42 380,50 540,60" />

            <!-- Data points -->
            <circle cx="50" cy="20" r="5" fill="#1d4ed8" />
            <text x="50" y="10" font-size="11" font-weight="700" text-anchor="middle" fill="#0f172a">7.8% (2024)</text>

            <circle cx="200" cy="42" r="5" fill="#1d4ed8" />
            <text x="200" y="32" font-size="11" font-weight="700" text-anchor="middle" fill="#0f172a">7.1% (Feb '25)</text>

            <circle cx="380" cy="50" r="5" fill="#1d4ed8" />
            <text x="380" y="40" font-size="11" font-weight="700" text-anchor="middle" fill="#0f172a">6.8% (Oct '25)</text>

            <circle cx="540" cy="60" r="6" fill="#15803d" stroke="#ffffff" stroke-width="2" />
            <text x="540" y="50" font-size="11" font-weight="700" text-anchor="middle" fill="#15803d">6.5% (Sep '26)</text>
          </svg>
        </div>

        <!-- Structured Lab Results Table -->
        <table class="rx-table" style="font-size: 13px;">
          <thead>
            <tr>
              <th style="width: 30%;">Test Name</th>
              <th style="width: 15%;">Result Value</th>
              <th style="width: 15%;">Reference Interval</th>
              <th style="width: 12%;">Flag</th>
              <th style="width: 18%;">Reporting Facility</th>
              <th style="width: 10%;">Date</th>
            </tr>
          </thead>
          <tbody>
            ${labResults.map(lab => `
              <tr>
                <td style="font-weight: 600; color: var(--text-main);">${lab.testName}</td>
                <td>
                  <strong style="color: ${lab.flag === 'H' ? '#b45309' : lab.flag === 'C' ? '#dc2626' : '#0f172a'};">${lab.valueText} ${lab.unit}</strong>
                </td>
                <td style="color: var(--text-muted);">${lab.refLow} – ${lab.refHigh} ${lab.unit}</td>
                <td>
                  ${lab.flag === 'H' ? '<span class="badge badge-pending">HIGH (H)</span>' : lab.flag === 'C' ? '<span class="badge badge-emergency">CRITICAL (C)</span>' : '<span class="badge badge-active">NORMAL (N)</span>'}
                </td>
                <td style="font-size: 12px; color: var(--text-secondary);">${lab.labOrg.split(',')[0]}</td>
                <td style="font-size: 12px; color: var(--text-muted);">${formatDate(lab.reportedAt)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    // Add lab result modal
    const addLabBtn = container.querySelector('#btn-add-lab-result');
    addLabBtn?.addEventListener('click', () => {
      this.openAddLabModal();
    });
  }

  // ==========================================================================
  // TAB 5: Clinical Document Vault & Imaging (PRD REC-07)
  // ==========================================================================
  renderDocumentsTab(container) {
    const summary = hospitalStore.getPatientClinicalSummary(this.healthId);
    const { documents } = summary;

    container.innerHTML = `
      <div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: 24px; box-shadow: var(--shadow-sm);">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
          <div>
            <h3 style="font-size: 16px; font-weight: 700; color: var(--text-main); margin: 0;">Clinical Document Vault & Diagnostic Imaging</h3>
            <p style="font-size: 12px; color: var(--text-muted); margin: 2px 0 0 0;">Cryptographically sealed medical archives with SHA-256 integrity checks</p>
          </div>
          <button type="button" class="btn btn-sm btn-primary" id="btn-upload-doc">
            + Archive New Document
          </button>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px;">
          ${documents.map(doc => `
            <div style="background: #ffffff; border: 1px solid var(--border-color); border-radius: var(--radius-lg); padding: 16px; box-shadow: var(--shadow-xs); display: flex; flex-direction: column; justify-content: space-between; transition: all 0.15s ease;" onmouseover="this.style.borderColor='var(--border-strong)'" onmouseout="this.style.borderColor='var(--border-color)'">
              <div>
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                  <span class="badge badge-blue">${doc.category}</span>
                  <span style="font-size: 11px; color: var(--text-muted);">${doc.size || '340 KB'}</span>
                </div>
                <div style="font-weight: 700; font-size: 14px; color: var(--text-main); margin-bottom: 4px;">${doc.title}</div>
                <div style="font-size: 11.5px; color: var(--text-muted); margin-bottom: 8px;">${doc.orgName} • ${formatDate(doc.date)}</div>
                <div style="font-size: 12px; color: var(--text-secondary); line-height: 1.3; background: var(--bg-surface-subtle); padding: 8px; border-radius: 4px; margin-bottom: 12px; max-height: 60px; overflow: hidden;">
                  ${doc.previewText || 'Cryptographically verified report stored on health network.'}
                </div>
              </div>

              <div>
                <div style="font-size: 10px; font-family: monospace; color: var(--text-muted); margin-bottom: 8px; word-break: break-all;">
                  SHA-256: ${doc.sha256.slice(0, 24)}...
                </div>
                <button type="button" class="btn btn-sm btn-outline btn-view-doc" data-docid="${doc.id}" style="width: 100%;">
                  Open Fullscreen Preview
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // View doc buttons
    const viewBtns = container.querySelectorAll('.btn-view-doc');
    viewBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const docId = btn.getAttribute('data-docid');
        this.openDocumentModal(docId);
      });
    });

    // Upload doc button
    const uploadBtn = container.querySelector('#btn-upload-doc');
    uploadBtn?.addEventListener('click', () => {
      this.openUploadDocModal();
    });
  }

  // ==========================================================================
  // TAB 6: Emergency Trauma View (PRD ACC-09)
  // ==========================================================================
  renderEmergencyTab(container) {
    const summary = hospitalStore.getPatientClinicalSummary(this.healthId);
    const { patient, allergies, conditions, medications } = summary;

    container.innerHTML = `
      <div style="background: #ffffff; border: 2px solid #fecaca; border-radius: var(--radius-xl); padding: 24px; box-shadow: var(--shadow-md);">
        <!-- Urgent Red Emergency Banner -->
        <div style="background: #fef2f2; border: 1.5px solid #fecaca; border-radius: var(--radius-lg); padding: 16px 20px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 14px;">
          <div style="display: flex; align-items: center; gap: 14px;">
            <div style="width: 48px; height: 48px; background: #dc2626; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: #ffffff; flex-shrink: 0;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 2v20M2 12h20"/></svg>
            </div>
            <div>
              <h3 style="font-size: 18px; font-weight: 800; color: #991b1b; margin: 0;">EMERGENCY FIRST-RESPONDER TRAUMA PROFILE</h3>
              <p style="font-size: 12px; color: #b91c1c; margin: 2px 0 0 0;">Authorized for acute trauma triage, EMS paramedics, and emergency room clinicians</p>
            </div>
          </div>
          
          <div style="display: flex; gap: 8px;">
            <a href="tel:108" class="btn btn-sm btn-emergency" style="font-weight: 700;">Dial 108 (Ambulance)</a>
            <a href="tel:112" class="btn btn-sm btn-secondary" style="font-weight: 700;">Dial 112 (National)</a>
          </div>
        </div>

        <!-- High-Visibility Blood Group & Compatibility Box -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 24px;">
          <div style="background: #fef2f2; border: 2px solid #fca5a5; border-radius: var(--radius-xl); padding: 24px; text-align: center;">
            <div style="font-size: 13px; font-weight: 700; color: #991b1b; text-transform: uppercase;">PATIENT BLOOD GROUP:</div>
            <div style="font-size: 56px; font-weight: 900; color: #dc2626; line-height: 1.1; margin: 8px 0; font-family: var(--font-family-sans);">
              ${patient.bloodGroup || 'O+'}
            </div>
            <div style="font-size: 12.5px; font-weight: 600; color: #7f1d1d;">
              Emergency Transfusion Guidance: Can receive ${patient.bloodGroup === 'O+' ? 'O+, O-' : patient.bloodGroup === 'B+' ? 'B+, B-, O+, O-' : 'Compatible units'}
            </div>
          </div>

          <div style="background: #fafbfc; border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: 20px; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              <div style="font-size: 13px; font-weight: 700; color: var(--text-main); margin-bottom: 6px;">Designated Emergency Contact:</div>
              <div style="font-size: 16px; font-weight: 700; color: var(--color-primary);">${patient.emergencyContact?.name || 'Pooja Sharma'}</div>
              <div style="font-size: 12.5px; color: var(--text-muted); margin-top: 2px;">Relationship: <strong>${patient.emergencyContact?.relation || 'Spouse'}</strong></div>
              <div style="font-size: 14px; font-weight: 700; font-family: monospace; color: var(--text-main); margin-top: 6px;">${patient.emergencyContact?.phone || '+91 9876543211'}</div>
            </div>

            <a href="tel:${patient.emergencyContact?.phone || '9876543211'}" class="btn btn-primary" style="margin-top: 14px; text-decoration: none;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              Call Designated Contact Now
            </a>
          </div>
        </div>

        <!-- Severe Allergies & Critical Contraindications -->
        <div style="margin-bottom: 20px;">
          <h4 style="font-size: 14px; font-weight: 700; color: #991b1b; margin-bottom: 8px;">Critical Allergies & Contraindications:</h4>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${allergies.map(a => `
              <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: var(--radius-md); padding: 10px 14px; display: flex; align-items: center; justify-content: space-between;">
                <div>
                  <strong style="color: #dc2626; font-size: 13.5px;">${a.substance}</strong>
                  <span style="font-size: 12px; color: #7f1d1d; margin-left: 8px;">— Reaction: ${a.reaction}</span>
                </div>
                <span class="badge badge-emergency">${a.severity}</span>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Section 8 DPDP Act Statutory Notice -->
        <div style="font-size: 11.5px; color: var(--text-muted); background: #f8fafc; border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 10px 14px; line-height: 1.4;">
          <strong>Section 8 DPDP Act 2023 Statutory Notice:</strong> In compliance with the Digital Personal Data Protection Act, sensitive statutory government identity numbers (Aadhaar / Voter ID) and full residential street address are redacted from emergency trauma views to protect patient privacy while preserving life-critical emergency data.
        </div>
      </div>
    `;
  }

  // ==========================================================================
  // BREAK GLASS EMERGENCY MODAL & LIVE TIMER
  // ==========================================================================
  openBreakGlassModal() {
    const summary = hospitalStore.getPatientClinicalSummary(this.healthId);
    const { patient } = summary;
    const staff = hospitalStore.getCurrentStaff();

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-header" style="background: #fef2f2; border-bottom: 1px solid #fecaca;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="color: #dc2626; display: flex; align-items: center;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polygon points="7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            </span>
            <div>
              <h3 style="font-size: 16px; font-weight: 800; color: #991b1b; margin: 0;">Break-Glass Emergency Bypass Protocol</h3>
              <p style="font-size: 11.5px; color: #b91c1c; margin: 2px 0 0 0;">PRD ACC-10 Statutory Clinician Override</p>
            </div>
          </div>
          <button type="button" class="btn btn-sm btn-ghost modal-close" title="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div class="modal-body">
          <div style="background: #fff1f2; border: 1px solid #fecdd3; border-radius: var(--radius-md); padding: 12px; font-size: 12.5px; color: #881337; margin-bottom: 16px; line-height: 1.4;">
            <strong>Statutory Warning:</strong> Break-Glass bypasses standard patient consent for acute life-threatening trauma. 
            All access is <strong>strictly logged</strong> with clinician timestamp, immediate audit alert dispatched to the medical superintendent, and notification transmitted to the citizen.
          </div>

          <div class="form-group">
            <label class="form-label">Treating Patient:</label>
            <div style="font-weight: 700; font-size: 14px; color: var(--text-main);">${patient.fullName} (${formatHealthId(patient.healthId)})</div>
          </div>

          <div class="form-group">
            <label class="form-label">Mandatory Clinical Justification / Emergency Reason:</label>
            <select class="form-select" id="bg-reason-select" style="font-weight: 600;">
              <option value="Unconscious Acute Trauma Victim: Immediate Resuscitation">Unconscious Acute Trauma Victim: Immediate Resuscitation</option>
              <option value="Acute Anaphylactic Shock with Airway Compromise">Acute Anaphylactic Shock with Airway Compromise</option>
              <option value="Severe Cardiac Arrest / Ventricular Fibrillation">Severe Cardiac Arrest / Ventricular Fibrillation</option>
              <option value="Altered Mental Status / Poisoning / Coma Triage">Altered Mental Status / Poisoning / Coma Triage</option>
              <option value="Critical Pediatric Trauma without Present Guardian">Critical Pediatric Trauma without Present Guardian</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Authorizing Clinician:</label>
            <div style="font-size: 13px; color: var(--text-secondary); background: #f8fafc; padding: 8px 12px; border-radius: 6px; border: 1px solid var(--border-color);">
              <strong>${staff.fullName}</strong> (${staff.title}) • License: <strong>${staff.regNumber || 'NMC Verified'}</strong>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary modal-close">Cancel</button>
          <button type="button" class="btn btn-emergency" id="btn-confirm-breakglass">
            Authorize 30-Min Emergency Scope
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', () => overlay.remove());
    });

    overlay.querySelector('#btn-confirm-breakglass')?.addEventListener('click', () => {
      const reason = overlay.querySelector('#bg-reason-select').value;
      hospitalStore.initiateBreakGlass({
        healthId: this.healthId,
        reason,
        clinicianName: staff.fullName,
        department: staff.department
      });

      overlay.remove();
      showToast('Break-Glass emergency access granted! 30-min timer active.', 'emergency');
      this.render();
    });
  }

  initBreakGlassTimer() {
    if (this.activeBreakGlassTimer) {
      clearInterval(this.activeBreakGlassTimer);
    }

    const updateTimer = () => {
      const active = hospitalStore.getActiveBreakGlass(this.healthId);
      const display = document.getElementById('break-glass-timer-display');
      if (!active || !display) {
        clearInterval(this.activeBreakGlassTimer);
        return;
      }

      const diffMs = new Date(active.expiresAt).getTime() - Date.now();
      if (diffMs <= 0) {
        clearInterval(this.activeBreakGlassTimer);
        hospitalStore.terminateBreakGlass(this.healthId);
        showToast('Break-Glass 30-min window expired.', 'warning');
        this.render();
        return;
      }

      const mins = Math.floor(diffMs / 60000);
      const secs = Math.floor((diffMs % 60000) / 1000);
      display.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')} Left`;
    };

    this.activeBreakGlassTimer = setInterval(updateTimer, 1000);
    updateTimer();
  }

  // ==========================================================================
  // INPATIENT ADMISSION & DISCHARGE MODALS
  // ==========================================================================
  openAdmitModal() {
    const summary = hospitalStore.getPatientClinicalSummary(this.healthId);
    const { patient } = summary;
    const doctors = hospitalStore.getDoctors();
    const inpatientServices = hospitalStore.getServices('Inpatient');

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-dialog" style="max-width: 620px;">
        <div class="modal-header">
          <div>
            <h3 style="font-size: 16px; font-weight: 700; color: var(--text-main); margin: 0;">Inpatient Ward Admission (IPD)</h3>
            <p style="font-size: 11.5px; color: var(--text-muted); margin: 2px 0 0 0;">Assign admitting doctor, ward category, bed and initial orders</p>
          </div>
          <button type="button" class="btn btn-sm btn-ghost modal-close" title="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <form id="modal-admit-form">
          <div class="modal-body">
            <!-- Doctor Assignment & Service Category (Item 3) -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;" class="form-group">
              <div>
                <label class="form-label" style="font-weight: 700;">Admitting Hospital Doctor:</label>
                <select class="form-select" id="admit-doctor-select" required>
                  ${doctors.map(d => `
                    <option value="${d.id}" data-name="${d.fullName}" data-dept="${d.department}">
                      ${d.fullName} (${d.department})
                    </option>
                  `).join('')}
                </select>
              </div>
              <div>
                <label class="form-label" style="font-weight: 700;">Ward Service Category:</label>
                <select class="form-select" id="admit-service-select">
                  ${inpatientServices.map(s => `
                    <option value="${s.id}" data-name="${s.name}" data-fee="${s.standardFee}">
                      ${s.name} (₹${s.standardFee}/day)
                    </option>
                  `).join('')}
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Admitting Diagnosis & Clinical Indication:</label>
              <input type="text" id="admit-dx" class="form-input" placeholder="e.g. Acute Appendicitis with Localized Peritonitis" required />
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;" class="form-group">
              <div>
                <label class="form-label">Ward Category:</label>
                <select class="form-select" id="admit-ward">
                  <option value="General Medical Ward" selected>General Medical Ward</option>
                  <option value="Intensive Care Unit (ICU)">Intensive Care Unit (ICU)</option>
                  <option value="Coronary Care Unit (CCU)">Coronary Care Unit (CCU)</option>
                  <option value="Surgical High Dependency">Surgical High Dependency</option>
                  <option value="Orthopedic Ward">Orthopedic Ward</option>
                </select>
              </div>
              <div>
                <label class="form-label">Bed Assignment:</label>
                <input type="text" id="admit-bed" class="form-input font-mono" value="Bed GW-${Math.floor(10 + Math.random()*89)}" required />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Initial Doctor Clinical Assessment & Inpatient Plan:</label>
              <textarea id="admit-notes" class="form-textarea" placeholder="Admission examination, fluid protocol, vitals review...">Patient admitted for inpatient stabilization, parenteral therapy, and continuous monitoring.</textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary modal-close">Cancel</button>
            <button type="submit" class="btn btn-primary">Confirm Admission</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', () => overlay.remove());
    });

    overlay.querySelector('#modal-admit-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const docSelect = overlay.querySelector('#admit-doctor-select');
      const selectedDocOpt = docSelect ? docSelect.options[docSelect.selectedIndex] : null;
      const admittingDoctorId = docSelect ? docSelect.value : null;
      const admittingDoctor = selectedDocOpt ? selectedDocOpt.getAttribute('data-name') : 'Attending Consultant';

      const srvSelect = overlay.querySelector('#admit-service-select');
      const serviceId = srvSelect ? srvSelect.value : null;

      const admittingDiagnosis = overlay.querySelector('#admit-dx').value;
      const ward = overlay.querySelector('#admit-ward').value;
      const bedNumber = overlay.querySelector('#admit-bed').value;
      const initialDoctorNote = overlay.querySelector('#admit-notes').value;

      hospitalStore.addAdmission({
        healthId: this.healthId,
        memberName: patient.fullName,
        admittingDoctorId,
        admittingDoctor,
        serviceId,
        admittingDiagnosis,
        ward,
        bedNumber,
        initialDoctorNote
      });

      overlay.remove();
      showToast(`Patient admitted to ${ward} (${bedNumber}) under ${admittingDoctor}`, 'success');
      this.activeTab = 'admissions';
      this.render();
    });
  }

  // ==========================================================================
  // LOG INPATIENT ROUND, PROCEDURES & MAR DOSES MODAL (Item 3)
  // ==========================================================================
  openLogRoundModal(admissionId) {
    const summary = hospitalStore.getPatientClinicalSummary(this.healthId);
    const adm = (summary.admissions || []).find(a => a.id === admissionId);
    if (!adm) return;

    let roundReports = [];

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-dialog" style="max-width: 720px;">
        <div class="modal-header">
          <div>
            <h3 style="font-size: 16px; font-weight: 700; color: var(--text-main); margin: 0;">Log Ward Round, Procedures & MAR Doses</h3>
            <p style="font-size: 11.5px; color: var(--text-muted); margin: 2px 0 0 0;">Inpatient: ${adm.memberName} • Location: ${adm.ward} (${adm.bedNumber})</p>
          </div>
          <button type="button" class="btn btn-sm btn-ghost modal-close" title="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <form id="modal-round-form">
          <div class="modal-body" style="max-height: 70vh; overflow-y: auto;">
            <!-- Notes -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;" class="form-group">
              <div>
                <label class="form-label">Doctor Clinical Round Note:</label>
                <textarea id="round-doc-note" class="form-textarea" placeholder="Clinical evaluation, systemic findings...">Patient evaluated on morning rounds. Hemodynamics stable. Vitals maintained.</textarea>
              </div>
              <div>
                <label class="form-label">Nursing Observation & Care Note:</label>
                <textarea id="round-nurse-note" class="form-textarea" placeholder="Fluid intake, urine output, comfort...">Vitals checked Q4H. Infusion running smoothly. Good urine output.</textarea>
              </div>
            </div>

            <!-- 1. Procedures Done ("what they are doing") -->
            <div class="form-group" style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 12px; border-radius: 6px;">
              <label class="form-label" style="font-weight: 700; color: #166534; display: flex; align-items: center; gap: 6px;">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>
                Clinical Procedures Performed Today ("What they are doing"):
              </label>
              <textarea id="round-procedures" class="form-textarea" placeholder="e.g. Peripheral IV cannulation 20G left forearm, Arterial blood gas collection, Nebulization with Levolin Q6H, Chest physiotherapy" style="border-color: #86efac;">Peripheral IV line dressing change, Vitals telemetry monitoring, Nebulization therapy Q8H, Soft diet continuation.</textarea>
            </div>

            <!-- 2. MAR Medication Doses Tracker ("dose and all") -->
            <div class="section-title" style="justify-content: space-between; margin-top: 16px;">
              <div style="display: flex; align-items: center; gap: 6px;">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>
                Medication Administration Records (Doses Administered):
              </div>
              <button type="button" class="btn btn-sm btn-secondary" id="btn-add-mar-row">
                + Add Dose
              </button>
            </div>

            <table class="rx-table" style="font-size: 12px; margin-bottom: 16px;">
              <thead>
                <tr>
                  <th style="width: 25%;">Drug Name</th>
                  <th style="width: 15%;">Dose</th>
                  <th style="width: 15%;">Route</th>
                  <th style="width: 15%;">Time</th>
                  <th style="width: 20%;">Nurse Name</th>
                  <th style="width: 10%;">Remove</th>
                </tr>
              </thead>
              <tbody id="mar-rows-body">
                <tr>
                  <td><input type="text" class="form-input mar-drug" value="IV Ondansetron" /></td>
                  <td><input type="text" class="form-input mar-dose" value="4 mg" /></td>
                  <td>
                    <select class="form-select mar-route">
                      <option value="IV" selected>IV</option>
                      <option value="Oral">Oral</option>
                      <option value="SC">SC</option>
                      <option value="Infusion">Infusion</option>
                    </select>
                  </td>
                  <td><input type="text" class="form-input mar-time" value="09:00 AM" /></td>
                  <td><input type="text" class="form-input mar-nurse" value="Sister Rekha" /></td>
                  <td><button type="button" class="btn btn-sm btn-ghost" onclick="this.closest('tr').remove()" style="color: #dc2626;" title="Remove dose"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></td>
                </tr>
                <tr>
                  <td><input type="text" class="form-input mar-drug" value="IV Pantoprazole" /></td>
                  <td><input type="text" class="form-input mar-dose" value="40 mg" /></td>
                  <td>
                    <select class="form-select mar-route">
                      <option value="IV" selected>IV</option>
                      <option value="Oral">Oral</option>
                      <option value="SC">SC</option>
                      <option value="Infusion">Infusion</option>
                    </select>
                  </td>
                  <td><input type="text" class="form-input mar-time" value="09:15 AM" /></td>
                  <td><input type="text" class="form-input mar-nurse" value="Sister Rekha" /></td>
                  <td><button type="button" class="btn btn-sm btn-ghost" onclick="this.closest('tr').remove()" style="color: #dc2626;" title="Remove dose"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></td>
                </tr>
              </tbody>
            </table>

            <!-- 3. Upload Inpatient Test Reports (Item 3) -->
            <div class="section-title" style="justify-content: space-between; margin-top: 16px;">
              <div style="display: flex; align-items: center; gap: 6px;">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                Attach Inpatient Lab / Diagnostic Test Reports:
              </div>
              <div>
                <button type="button" class="btn btn-sm btn-outline" id="btn-browse-ipd-reports">+ Upload Report</button>
                <input type="file" id="ipd-report-uploader" multiple accept=".pdf,image/*" style="display: none;" />
              </div>
            </div>

            <div style="background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 6px; padding: 10px; margin-bottom: 10px;">
              <div id="ipd-uploaded-chips" style="display: flex; gap: 8px; flex-wrap: wrap;">
                <span style="font-size: 11.5px; color: var(--text-muted);">No reports attached for this round yet.</span>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary modal-close">Cancel</button>
            <button type="submit" class="btn btn-primary">Save Round, Procedures & Doses</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', () => overlay.remove());
    });

    // Add MAR row button
    overlay.querySelector('#btn-add-mar-row')?.addEventListener('click', () => {
      const tbody = overlay.querySelector('#mar-rows-body');
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td><input type="text" class="form-input mar-drug" placeholder="Drug name" /></td>
        <td><input type="text" class="form-input mar-dose" placeholder="e.g. 500 mg" /></td>
        <td>
          <select class="form-select mar-route">
            <option value="IV">IV</option>
            <option value="Oral">Oral</option>
            <option value="SC">SC</option>
            <option value="Infusion">Infusion</option>
          </select>
        </td>
        <td><input type="text" class="form-input mar-time" value="${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}" /></td>
        <td><input type="text" class="form-input mar-nurse" value="Staff Nurse" /></td>
        <td><button type="button" class="btn btn-sm btn-ghost" onclick="this.closest('tr').remove()" style="color: #dc2626;" title="Remove dose"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg></button></td>
      `;
      tbody.appendChild(tr);
    });

    // Report upload
    const ipdFileInput = overlay.querySelector('#ipd-report-uploader');
    const ipdBrowseBtn = overlay.querySelector('#btn-browse-ipd-reports');
    const ipdChips = overlay.querySelector('#ipd-uploaded-chips');

    const updateIpdChips = () => {
      if (!ipdChips) return;
      if (roundReports.length === 0) {
        ipdChips.innerHTML = `<span style="font-size: 11.5px; color: var(--text-muted);">No reports attached for this round yet.</span>`;
        return;
      }
      ipdChips.innerHTML = roundReports.map((file, idx) => `
        <span class="badge badge-blue" style="display: inline-flex; align-items: center; gap: 6px;">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          ${file.name} (${file.size})
          <button type="button" style="border:none; background:none; cursor:pointer; color:#dc2626; display:inline-flex; align-items:center;" data-idx="${idx}" class="btn-del-ipd-rep" title="Remove attachment">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </span>
      `).join('');

      ipdChips.querySelectorAll('.btn-del-ipd-rep').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const idx = parseInt(e.target.getAttribute('data-idx'), 10);
          roundReports.splice(idx, 1);
          updateIpdChips();
        });
      });
    };

    ipdBrowseBtn?.addEventListener('click', () => ipdFileInput?.click());

    ipdFileInput?.addEventListener('change', (e) => {
      const files = Array.from(e.target.files || []);
      files.forEach(f => {
        const reader = new FileReader();
        reader.onload = (re) => {
          roundReports.push({
            name: f.name,
            size: (f.size / 1024).toFixed(1) + ' KB',
            type: f.type,
            dataUrl: re.target.result,
            uploadedAt: new Date().toISOString()
          });
          updateIpdChips();
        };
        reader.readAsDataURL(f);
      });
    });

    // Form submit
    overlay.querySelector('#modal-round-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const doctorNote = overlay.querySelector('#round-doc-note').value;
      const nurseNote = overlay.querySelector('#round-nurse-note').value;
      const proceduresDone = overlay.querySelector('#round-procedures').value;

      const marRows = Array.from(overlay.querySelectorAll('#mar-rows-body tr'));
      const medsDoses = marRows.map(row => ({
        drug: row.querySelector('.mar-drug').value,
        dose: row.querySelector('.mar-dose').value,
        route: row.querySelector('.mar-route').value,
        time: row.querySelector('.mar-time').value,
        nurse: row.querySelector('.mar-nurse').value,
        status: 'Given'
      })).filter(m => m.drug.trim());

      hospitalStore.addAdmissionRoundWithMAR(admissionId, {
        doctorNote,
        nurseNote,
        proceduresDone,
        medsDoses,
        testReports: roundReports
      });

      overlay.remove();
      showToast('Daily ward round, procedures, and MAR doses logged successfully!', 'success');
      this.render();
    });
  }

  // ==========================================================================
  // EDIT ADMISSION DETAILS MODAL (Item 4)
  // ==========================================================================
  openEditAdmissionModal(admissionId) {
    const summary = hospitalStore.getPatientClinicalSummary(this.healthId);
    const adm = (summary.admissions || []).find(a => a.id === admissionId);
    if (!adm) return;

    const doctors = hospitalStore.getDoctors();

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-dialog" style="max-width: 600px;">
        <div class="modal-header">
          <div>
            <h3 style="font-size: 16px; font-weight: 700; color: var(--text-main); margin: 0;">Edit Inpatient Stay Details</h3>
            <p style="font-size: 11.5px; color: var(--text-muted); margin: 2px 0 0 0;">Update bed assignment, ward category, attending doctor, and clinical diagnosis</p>
          </div>
          <button type="button" class="btn btn-sm btn-ghost modal-close" title="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <form id="modal-edit-adm-form">
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Admitting Clinical Diagnosis:</label>
              <input type="text" id="edit-adm-dx" class="form-input" value="${adm.admittingDiagnosis}" required />
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;" class="form-group">
              <div>
                <label class="form-label">Ward Category:</label>
                <select class="form-select" id="edit-adm-ward">
                  <option value="General Medical Ward" ${adm.ward.includes('General') ? 'selected' : ''}>General Medical Ward</option>
                  <option value="Intensive Care Unit (ICU)" ${adm.ward.includes('ICU') ? 'selected' : ''}>Intensive Care Unit (ICU)</option>
                  <option value="Coronary Care Unit (CCU)" ${adm.ward.includes('CCU') ? 'selected' : ''}>Coronary Care Unit (CCU)</option>
                  <option value="Surgical High Dependency" ${adm.ward.includes('Surgical') ? 'selected' : ''}>Surgical High Dependency</option>
                  <option value="Orthopedic Ward" ${adm.ward.includes('Orthopedic') ? 'selected' : ''}>Orthopedic Ward</option>
                </select>
              </div>
              <div>
                <label class="form-label">Bed Assignment:</label>
                <input type="text" id="edit-adm-bed" class="form-input font-mono" value="${adm.bedNumber}" required />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Attending Consultant Doctor:</label>
              <select class="form-select" id="edit-adm-doctor" required>
                ${doctors.map(d => `
                  <option value="${d.id}" data-name="${d.fullName}" ${adm.admittingDoctor === d.fullName ? 'selected' : ''}>
                    ${d.fullName}: ${d.department}
                  </option>
                `).join('')}
              </select>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary modal-close">Cancel</button>
            <button type="submit" class="btn btn-primary">Update Inpatient Details</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', () => overlay.remove());
    });

    overlay.querySelector('#modal-edit-adm-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const docSelect = overlay.querySelector('#edit-adm-doctor');
      const selectedOption = docSelect ? docSelect.options[docSelect.selectedIndex] : null;
      const doctorName = selectedOption ? selectedOption.getAttribute('data-name') : adm.admittingDoctor;

      const updated = {
        admittingDiagnosis: overlay.querySelector('#edit-adm-dx').value,
        ward: overlay.querySelector('#edit-adm-ward').value,
        bedNumber: overlay.querySelector('#edit-adm-bed').value,
        admittingDoctorId: docSelect ? docSelect.value : null,
        admittingDoctor: doctorName
      };

      hospitalStore.updateAdmission(admissionId, updated);
      overlay.remove();
      showToast('Inpatient stay details updated successfully!', 'success');
      this.render();
    });
  }

  // ==========================================================================
  // EDIT CONSULTATION MODAL (Item 4)
  // ==========================================================================
  openEditConsultationModal(consultId) {
    const summary = hospitalStore.getPatientClinicalSummary(this.healthId);
    const consult = (summary.consultations || []).find(c => c.id === consultId);
    if (!consult) return;

    let editReports = [...(consult.uploadedReports || [])];

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-dialog" style="max-width: 650px;">
        <div class="modal-header">
          <div>
            <h3 style="font-size: 16px; font-weight: 700; color: var(--text-main); margin: 0;">Edit Consultation Record</h3>
            <p style="font-size: 11.5px; color: var(--text-muted); margin: 2px 0 0 0;">Consultation: ${consult.id} • Attending: ${consult.clinician || consult.doctorName || 'Doctor'}</p>
          </div>
          <button type="button" class="btn btn-sm btn-ghost modal-close" title="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <form id="modal-edit-consult-form">
          <div class="modal-body" style="max-height: 70vh; overflow-y: auto;">
            <div class="form-group">
              <label class="form-label">Chief Clinical Complaints & Duration:</label>
              <input type="text" id="edit-consult-complaint" class="form-input" value="${consult.chiefComplaint || ''}" required />
            </div>

            <div class="form-group">
              <label class="form-label">Clinical Examination & Systemic Findings:</label>
              <textarea id="edit-consult-exam" class="form-textarea">${consult.examination || ''}</textarea>
            </div>

            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 12px;" class="form-group">
              <div>
                <label class="form-label">Dietary & Clinical Advice:</label>
                <textarea id="edit-consult-advice" class="form-textarea">${consult.advice || ''}</textarea>
              </div>
              <div>
                <label class="form-label">Follow-up Date:</label>
                <input type="date" id="edit-consult-followup" class="form-input" value="${consult.followUpDate || ''}" />
              </div>
            </div>

            <!-- Attached Reports -->
            <div class="section-title" style="justify-content: space-between; margin-top: 14px;">
              <div style="display: flex; align-items: center; gap: 6px;">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                Prescription Scans & Diagnostic Reports:
              </div>
              <div>
                <button type="button" class="btn btn-sm btn-outline" id="btn-edit-add-report">+ Add File</button>
                <input type="file" id="edit-report-file-input" multiple accept=".pdf,image/*" style="display: none;" />
              </div>
            </div>

            <div style="background: #f8fafc; border: 1px dashed #cbd5e1; border-radius: 6px; padding: 10px;">
              <div id="edit-consult-chips-list" style="display: flex; gap: 8px; flex-wrap: wrap;"></div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary modal-close">Cancel</button>
            <button type="submit" class="btn btn-primary">Update Consultation Record</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', () => overlay.remove());
    });

    const editFileInput = overlay.querySelector('#edit-report-file-input');
    const editBrowseBtn = overlay.querySelector('#btn-edit-add-report');
    const editChips = overlay.querySelector('#edit-consult-chips-list');

    const renderEditChips = () => {
      if (!editChips) return;
      if (editReports.length === 0) {
        editChips.innerHTML = `<span style="font-size: 11.5px; color: var(--text-muted);">No attached scans or reports.</span>`;
        return;
      }
      editChips.innerHTML = editReports.map((file, idx) => `
        <span class="badge badge-blue" style="display: inline-flex; align-items: center; gap: 6px;">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          ${file.name} (${file.size || 'Attached'})
          <button type="button" style="border:none; background:none; cursor:pointer; color:#dc2626; display:inline-flex; align-items:center;" data-idx="${idx}" class="btn-del-edit-rep" title="Remove attachment">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </span>
      `).join('');

      editChips.querySelectorAll('.btn-del-edit-rep').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const idx = parseInt(e.target.getAttribute('data-idx'), 10);
          editReports.splice(idx, 1);
          renderEditChips();
        });
      });
    };

    renderEditChips();

    editBrowseBtn?.addEventListener('click', () => editFileInput?.click());

    editFileInput?.addEventListener('change', (e) => {
      const files = Array.from(e.target.files || []);
      files.forEach(f => {
        const reader = new FileReader();
        reader.onload = (re) => {
          editReports.push({
            name: f.name,
            size: (f.size / 1024).toFixed(1) + ' KB',
            type: f.type,
            dataUrl: re.target.result,
            uploadedAt: new Date().toISOString()
          });
          renderEditChips();
        };
        reader.readAsDataURL(f);
      });
    });

    overlay.querySelector('#modal-edit-consult-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const updated = {
        chiefComplaint: overlay.querySelector('#edit-consult-complaint').value,
        examination: overlay.querySelector('#edit-consult-exam').value,
        advice: overlay.querySelector('#edit-consult-advice').value,
        followUpDate: overlay.querySelector('#edit-consult-followup').value,
        uploadedReports: editReports
      };

      hospitalStore.updateConsultation(consultId, updated);
      overlay.remove();
      showToast('Consultation updated successfully across network!', 'success');
      this.render();
    });
  }

  openDischargeModal(admissionId) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-header">
          <h3 style="font-size: 16px; font-weight: 700; color: var(--text-main); margin: 0;">Generate Inpatient Discharge Certificate</h3>
          <button type="button" class="btn btn-sm btn-ghost modal-close" title="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <form id="modal-discharge-form">
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Final Clinical Diagnosis:</label>
              <input type="text" id="dc-final-dx" class="form-input" value="Acute Infective Gastroenteritis (Resolved), Hypokalemia (Corrected)" required />
            </div>

            <div class="form-group">
              <label class="form-label">Hospital Course Summary:</label>
              <textarea id="dc-course" class="form-textarea" required>Patient successfully completed inpatient hydration protocol. Vitals stable, oral intake normal. Discharged in stable hemodynamic status.</textarea>
            </div>

            <div class="form-group">
              <label class="form-label">Post-Discharge Instructions:</label>
              <textarea id="dc-advice" class="form-textarea">Continue oral probiotics for 5 days. Low residue diet. Review in OPD after 1 week.</textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary modal-close">Cancel</button>
            <button type="submit" class="btn btn-primary">Sign & Authorize Discharge</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', () => overlay.remove());
    });

    overlay.querySelector('#modal-discharge-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const finalDiagnosis = overlay.querySelector('#dc-final-dx').value;
      const courseSummary = overlay.querySelector('#dc-course').value;
      const dischargeAdvice = overlay.querySelector('#dc-advice').value;

      hospitalStore.dischargePatient(admissionId, {
        finalDiagnosis,
        courseSummary,
        dischargeAdvice
      });

      overlay.remove();
      showToast('Discharge certificate generated and authorized.', 'success');
      this.activeTab = 'admissions';
      this.render();
    });
  }

  // ==========================================================================
  // LAB ENTRY & DOCUMENT MODALS
  // ==========================================================================
  openAddLabModal() {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-header">
          <h3 style="font-size: 16px; font-weight: 700; color: var(--text-main); margin: 0;">Enter Diagnostic Investigation Result</h3>
          <button type="button" class="btn btn-sm btn-ghost modal-close" title="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <form id="modal-lab-form">
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Test Name:</label>
              <input type="text" id="lab-test-name" class="form-input" placeholder="e.g. Serum Creatinine, HbA1c, Fasting Glucose" value="Serum Potassium (K+)" required />
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;" class="form-group">
              <div>
                <label class="form-label">Result Value:</label>
                <input type="text" id="lab-val" class="form-input" value="4.2" required />
              </div>
              <div>
                <label class="form-label">Unit of Measure:</label>
                <input type="text" id="lab-unit" class="form-input" value="mEq/L" required />
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 12px;" class="form-group">
              <div>
                <label class="form-label">Ref Low:</label>
                <input type="number" step="0.1" id="lab-ref-low" class="form-input" value="3.5" />
              </div>
              <div>
                <label class="form-label">Ref High:</label>
                <input type="number" step="0.1" id="lab-ref-high" class="form-input" value="5.1" />
              </div>
              <div>
                <label class="form-label">Flag:</label>
                <select class="form-select" id="lab-flag">
                  <option value="N">Normal (N)</option>
                  <option value="H">High (H)</option>
                  <option value="L">Low (L)</option>
                  <option value="C">Critical (C)</option>
                </select>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary modal-close">Cancel</button>
            <button type="submit" class="btn btn-primary">Save & Publish Result</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', () => overlay.remove());
    });

    overlay.querySelector('#modal-lab-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const testName = overlay.querySelector('#lab-test-name').value;
      const valueText = overlay.querySelector('#lab-val').value;
      const unit = overlay.querySelector('#lab-unit').value;
      const refLow = parseFloat(overlay.querySelector('#lab-ref-low').value);
      const refHigh = parseFloat(overlay.querySelector('#lab-ref-high').value);
      const flag = overlay.querySelector('#lab-flag').value;

      hospitalStore.addLabResult({
        healthId: this.healthId,
        testName,
        valueNum: parseFloat(valueText) || 0,
        valueText,
        unit,
        refLow,
        refHigh,
        flag
      });

      overlay.remove();
      showToast('Lab result recorded and published.', 'success');
      this.activeTab = 'labs';
      this.render();
    });
  }

  openDocumentModal(docId) {
    const summary = hospitalStore.getPatientClinicalSummary(this.healthId);
    const doc = summary.documents.find(d => d.id === docId);
    if (!doc) return;

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-dialog" style="max-width: 760px;">
        <div class="modal-header">
          <div>
            <h3 style="font-size: 16px; font-weight: 700; color: var(--text-main); margin: 0;">${doc.title}</h3>
            <p style="font-size: 11.5px; color: var(--text-muted); margin: 2px 0 0 0;">${doc.category} • ${doc.orgName} • Author: ${doc.author}</p>
          </div>
          <button type="button" class="btn btn-sm btn-ghost modal-close" title="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div class="modal-body">
          <div style="background: #ffffff; border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 20px; color: var(--text-main); font-family: var(--font-family-sans); font-size: 13px; line-height: 1.6; white-space: pre-wrap; max-height: 380px; overflow-y: auto; box-shadow: inset 0 1px 2px rgba(0,0,0,0.02);">
${doc.previewText || 'Cryptographically verified clinical document content.'}
          </div>

          <div style="margin-top: 16px; padding: 10px 14px; background: #f8fafc; border: 1px solid var(--border-color); border-radius: var(--radius-md); font-size: 11px; font-family: monospace; color: var(--text-muted);">
            <div>DIGITAL PROVENANCE & INTEGRITY SEAL:</div>
            <div>SHA-256 HASH: <strong>${doc.sha256}</strong></div>
            <div>STATUS: Provider Verified by National Health Network</div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary modal-close">Close Preview</button>
          <button type="button" class="btn btn-primary" onclick="window.print()">Print Document</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', () => overlay.remove());
    });
  }

  openUploadDocModal() {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-dialog">
        <div class="modal-header">
          <h3 style="font-size: 16px; font-weight: 700; color: var(--text-main); margin: 0;">Archive New Clinical Document</h3>
          <button type="button" class="btn btn-sm btn-ghost modal-close" title="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <form id="modal-upload-form">
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Document Title:</label>
              <input type="text" id="up-title" class="form-input" placeholder="e.g. 2D Echocardiography Color Doppler Report" required />
            </div>

            <div class="form-group">
              <label class="form-label">Document Category:</label>
              <select class="form-select" id="up-cat">
                <option value="Radiology & Imaging">Radiology & Imaging (X-Ray / MRI / CT / Echo)</option>
                <option value="Discharge Summary">Discharge Summary</option>
                <option value="Operative Notes">Operative & Surgical Notes</option>
                <option value="Pathology Report">Pathology & Lab Report</option>
                <option value="Prescription">Outside Prescription Copy</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label">Clinical Narrative / Findings Preview:</label>
              <textarea id="up-preview" class="form-textarea" placeholder="Paste findings or summary..." required>Normal left ventricular size and systolic function. LVEF 62%. No regional wall motion abnormality. Valves structurally normal.</textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary modal-close">Cancel</button>
            <button type="submit" class="btn btn-primary">Archive with SHA-256 Seal</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', () => overlay.remove());
    });

    overlay.querySelector('#modal-upload-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = overlay.querySelector('#up-title').value;
      const category = overlay.querySelector('#up-cat').value;
      const previewText = overlay.querySelector('#up-preview').value;

      hospitalStore.addDocument({
        healthId: this.healthId,
        title,
        category,
        previewText,
        size: "410 KB"
      });

      overlay.remove();
      showToast('Document archived with cryptographic hash seal.', 'success');
      this.activeTab = 'documents';
      this.render();
    });
  }
}
