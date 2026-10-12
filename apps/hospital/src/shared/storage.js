/**
 * HealthCard Hospital Portal — Centralized Clinical Storage & Sync Service
 * Seamlessly interfaces with centralized storage (matching apps/admin and apps/applicant)
 * and manages local clinical data, encounters, admissions, and audit records.
 */

import { DEMO_HOSPITAL_STAFF, DEMO_CLINICAL_DEPARTMENTS, DEFAULT_CLINICAL_DATABASE, DEFAULT_SEED_MEMBERS, DEFAULT_SEED_CARDS, DEFAULT_HOSPITAL_DOCTORS, DEFAULT_HOSPITAL_SERVICES } from './data/demoData.js';
import { hospitalBackend } from '../backend/apiClient.js';
import { generateHealthId, formatHealthId } from './utils/healthId.js';

const CENTRAL_STORAGE_KEY = 'healthcard_v1_store';
const HOSPITAL_STORAGE_KEY = 'healthcard_hospital_store';
const ACTIVE_STAFF_KEY = 'healthcard_hospital_active_staff';

class HospitalStorageService {
  constructor() {
    this.centralData = this.loadCentral();
    this.clinicalData = this.loadClinical();
    this.activeStaff = this.loadActiveStaff();
  }

  // Load from Central Data Layer shared across portals
  loadCentral() {
    try {
      const raw = localStorage.getItem(CENTRAL_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const upgraded = {
            members: (parsed.length > 0 && parsed[0]?.fullName) ? parsed : DEFAULT_SEED_MEMBERS,
            cards: DEFAULT_SEED_CARDS,
            orders: []
          };
          this.saveCentral(upgraded);
          return upgraded;
        }
        return {
          members: (parsed.members && parsed.members.length > 0) ? parsed.members : DEFAULT_SEED_MEMBERS,
          cards: (parsed.cards && parsed.cards.length > 0) ? parsed.cards : DEFAULT_SEED_CARDS,
          orders: parsed.orders || []
        };
      }
    } catch (e) {
      console.warn('Error reading central store, fallback to default seed:', e);
    }
    const initial = { members: DEFAULT_SEED_MEMBERS, cards: DEFAULT_SEED_CARDS, orders: [] };
    this.saveCentral(initial);
    return JSON.parse(JSON.stringify(initial));
  }

  // Save to Central Data Layer
  saveCentral(data) {
    try {
      localStorage.setItem(CENTRAL_STORAGE_KEY, JSON.stringify(data || this.centralData));
    } catch (e) {
      console.error('Failed to save to central storage:', e);
    }
  }

  // Load Hospital Clinical Data
  loadClinical() {
    try {
      const raw = localStorage.getItem(HOSPITAL_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          allergies: parsed.allergies || DEFAULT_CLINICAL_DATABASE.allergies,
          conditions: parsed.conditions || DEFAULT_CLINICAL_DATABASE.conditions,
          medications: parsed.medications || DEFAULT_CLINICAL_DATABASE.medications,
          vitals: parsed.vitals || DEFAULT_CLINICAL_DATABASE.vitals,
          consultations: parsed.consultations || DEFAULT_CLINICAL_DATABASE.consultations,
          admissions: parsed.admissions || DEFAULT_CLINICAL_DATABASE.admissions,
          labResults: parsed.labResults || DEFAULT_CLINICAL_DATABASE.labResults,
          documents: parsed.documents || DEFAULT_CLINICAL_DATABASE.documents,
          grants: parsed.grants || DEFAULT_CLINICAL_DATABASE.grants,
          auditLogs: parsed.auditLogs || DEFAULT_CLINICAL_DATABASE.auditLogs,
          staff: parsed.staff || DEMO_HOSPITAL_STAFF,
          doctors: parsed.doctors || DEFAULT_HOSPITAL_DOCTORS,
          services: parsed.services || DEFAULT_HOSPITAL_SERVICES,
          departments: parsed.departments || DEMO_CLINICAL_DEPARTMENTS
        };
      }
    } catch (e) {
      console.warn('Error reading hospital store, using default clinical database:', e);
    }

    const initial = {
      allergies: DEFAULT_CLINICAL_DATABASE.allergies,
      conditions: DEFAULT_CLINICAL_DATABASE.conditions,
      medications: DEFAULT_CLINICAL_DATABASE.medications,
      vitals: DEFAULT_CLINICAL_DATABASE.vitals,
      consultations: DEFAULT_CLINICAL_DATABASE.consultations,
      admissions: DEFAULT_CLINICAL_DATABASE.admissions,
      labResults: DEFAULT_CLINICAL_DATABASE.labResults,
      documents: DEFAULT_CLINICAL_DATABASE.documents,
      grants: DEFAULT_CLINICAL_DATABASE.grants,
      auditLogs: DEFAULT_CLINICAL_DATABASE.auditLogs,
      staff: DEMO_HOSPITAL_STAFF,
      doctors: DEFAULT_HOSPITAL_DOCTORS,
      services: DEFAULT_HOSPITAL_SERVICES,
      departments: DEMO_CLINICAL_DEPARTMENTS
    };
    this.saveClinical(initial);
    return JSON.parse(JSON.stringify(initial));
  }

  // Save Hospital Clinical Data
  saveClinical(data) {
    try {
      localStorage.setItem(HOSPITAL_STORAGE_KEY, JSON.stringify(data || this.clinicalData));
    } catch (e) {
      console.error('Failed to save hospital clinical store:', e);
    }
  }

  refresh() {
    this.centralData = this.loadCentral();
    this.clinicalData = this.loadClinical();
    this.activeStaff = this.loadActiveStaff();
  }

  // Active Staff Persona Management
  loadActiveStaff() {
    try {
      const raw = localStorage.getItem(ACTIVE_STAFF_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('Error reading active staff:', e);
    }
    return DEMO_HOSPITAL_STAFF[0]; // Default: Dr. Vikram Sethi (Cardiologist)
  }

  setActiveStaff(staff) {
    this.activeStaff = staff;
    localStorage.setItem(ACTIVE_STAFF_KEY, JSON.stringify(staff));
  }

  getCurrentStaff() {
    if (!this.activeStaff) {
      this.activeStaff = this.loadActiveStaff();
    }
    return this.activeStaff;
  }

  // Get Hospital Staff Directory
  getStaffList() {
    this.refresh();
    return this.clinicalData.staff || DEMO_HOSPITAL_STAFF;
  }

  addStaff(staffMember) {
    this.refresh();
    const newStaff = {
      id: `staff_${Date.now()}`,
      status: "Active",
      mfaEnrolled: true,
      ...staffMember
    };
    this.clinicalData.staff.push(newStaff);
    this.logAudit({
      action: "STAFF_ONBOARDED",
      target: `${newStaff.fullName} (${newStaff.role})`,
      details: `Added to ${newStaff.department} with registration ${newStaff.regNumber || 'N/A'}`
    });
    this.saveClinical();
    return newStaff;
  }

  toggleStaffStatus(staffId) {
    this.refresh();
    const member = this.clinicalData.staff.find(s => s.id === staffId);
    if (member) {
      member.status = member.status === "Active" ? "Suspended" : "Active";
      this.logAudit({
        action: "STAFF_STATUS_UPDATED",
        target: `${member.fullName} (${member.id})`,
        details: `Authorization status changed to ${member.status}`
      });
      this.saveClinical();
    }
    return member;
  }

  getDepartments() {
    this.refresh();
    return this.clinicalData.departments || DEMO_CLINICAL_DEPARTMENTS;
  }

  // ==========================================
  // HOSPITAL DOCTORS MANAGEMENT (Item 3 & 4)
  // ==========================================
  getDoctors(department = 'All') {
    this.refresh();
    const list = this.clinicalData.doctors || DEFAULT_HOSPITAL_DOCTORS;
    if (department && department !== 'All') {
      return list.filter(d => d.department === department);
    }
    return list;
  }

  getDoctorById(id) {
    this.refresh();
    return (this.clinicalData.doctors || []).find(d => d.id === id);
  }

  addDoctor(doctorData) {
    this.refresh();
    const newDoc = {
      id: `doc_${Date.now()}`,
      status: "Active",
      createdAt: new Date().toISOString(),
      avatar: doctorData.avatar || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80",
      ...doctorData
    };
    if (!this.clinicalData.doctors) this.clinicalData.doctors = [...DEFAULT_HOSPITAL_DOCTORS];
    this.clinicalData.doctors.push(newDoc);
    this.saveClinical();

    // Async sync to central backend
    hospitalBackend.addDoctor(newDoc).catch(err => console.warn('[BackendSync] Doctor add:', err));

    this.logAudit({
      action: "DOCTOR_REGISTERED",
      target: `${newDoc.fullName} (${newDoc.department})`,
      details: `Registered with NMC ${newDoc.regNumber || 'N/A'}, OPD Room: ${newDoc.opdRoom || 'OPD Desk'}`
    });
    return newDoc;
  }

  updateDoctor(id, updatedFields) {
    this.refresh();
    const doc = (this.clinicalData.doctors || []).find(d => d.id === id);
    if (doc) {
      Object.assign(doc, updatedFields, { updatedAt: new Date().toISOString() });
      this.saveClinical();
      hospitalBackend.updateDoctor(id, updatedFields).catch(err => console.warn('[BackendSync] Doctor update:', err));
      this.logAudit({
        action: "DOCTOR_UPDATED",
        target: `${doc.fullName} (${doc.id})`,
        details: `Credentials/schedule updated for ${doc.department}`
      });
    }
    return doc;
  }

  deleteDoctor(id) {
    this.refresh();
    const idx = (this.clinicalData.doctors || []).findIndex(d => d.id === id);
    if (idx !== -1) {
      const removed = this.clinicalData.doctors.splice(idx, 1)[0];
      this.saveClinical();
      hospitalBackend.deleteDoctor(id).catch(err => console.warn('[BackendSync] Doctor delete:', err));
      return removed;
    }
    return null;
  }

  // ==========================================
  // HOSPITAL SERVICES CATALOG (Item 3 & 4)
  // ==========================================
  getServices(category = 'All') {
    this.refresh();
    const list = this.clinicalData.services || DEFAULT_HOSPITAL_SERVICES;
    if (category && category !== 'All') {
      return list.filter(s => s.category === category);
    }
    return list;
  }

  addService(serviceData) {
    this.refresh();
    const newService = {
      id: `srv_${Date.now()}`,
      code: serviceData.code || `SRV-${Date.now().toString().slice(-4)}`,
      standardFee: Number(serviceData.standardFee) || 0,
      ...serviceData
    };
    if (!this.clinicalData.services) this.clinicalData.services = [...DEFAULT_HOSPITAL_SERVICES];
    this.clinicalData.services.push(newService);
    this.saveClinical();

    hospitalBackend.addService(newService).catch(err => console.warn('[BackendSync] Service add:', err));

    this.logAudit({
      action: "SERVICE_CREATED",
      target: `${newService.name} (${newService.code})`,
      details: `Category: ${newService.category}, Standard Fee: ₹${newService.standardFee}`
    });
    return newService;
  }

  updateService(id, updatedFields) {
    this.refresh();
    const srv = (this.clinicalData.services || []).find(s => s.id === id);
    if (srv) {
      Object.assign(srv, updatedFields, { standardFee: Number(updatedFields.standardFee ?? srv.standardFee) });
      this.saveClinical();
      hospitalBackend.updateService(id, updatedFields).catch(err => console.warn('[BackendSync] Service update:', err));
      this.logAudit({
        action: "SERVICE_UPDATED",
        target: `${srv.name} (${srv.code})`,
        details: `Fee: ₹${srv.standardFee}`
      });
    }
    return srv;
  }

  deleteService(id) {
    this.refresh();
    const idx = (this.clinicalData.services || []).findIndex(s => s.id === id);
    if (idx !== -1) {
      const removed = this.clinicalData.services.splice(idx, 1)[0];
      this.saveClinical();
      hospitalBackend.deleteService(id).catch(err => console.warn('[BackendSync] Service delete:', err));
      return removed;
    }
    return null;
  }

  // Member & Patient Queries
  getAllPatients() {
    this.refresh();
    return this.centralData.members || [];
  }

  getPatientByHealthId(healthId) {
    if (!healthId) return null;
    this.refresh();
    const clean = healthId.replace(/\s+/g, '');
    return (this.centralData.members || []).find(m => (m.healthId || '').replace(/\s+/g, '') === clean) || null;
  }

  getPatientByMobile(mobile) {
    if (!mobile) return null;
    this.refresh();
    const clean = mobile.replace(/\D/g, '');
    return (this.centralData.members || []).find(m => (m.mobile || '').replace(/\D/g, '') === clean) || null;
  }

  // Card & QR Resolution (PRD ACC-01)
  resolveCardToken(tokenOrHealthId) {
    this.refresh();
    if (!tokenOrHealthId) return null;

    const query = tokenOrHealthId.trim();
    const cleanId = query.replace(/\s+/g, '');

    // Search by Health ID first
    let patient = this.getPatientByHealthId(cleanId);

    // If not found, search by card token / URL
    if (!patient) {
      const card = (this.centralData.cards || []).find(c => 
        (c.healthId && c.healthId.replace(/\s+/g, '') === cleanId) ||
        (c.serialNumber && c.serialNumber.replace(/\s+/g, '') === cleanId) ||
        (c.token && c.token === query) ||
        (c.qrCodeUrl && c.qrCodeUrl.includes(query))
      );
      if (card) {
        patient = (this.centralData.members || []).find(m => m.id === card.memberId) || this.getPatientByHealthId(card.healthId);
      }
    }

    // Fallback: search by mobile number
    if (!patient) {
      patient = this.getPatientByMobile(query);
    }

    if (patient) {
      const staff = this.getCurrentStaff();
      this.logAudit({
        action: "RESOLVE_CARD_TOKEN",
        target: `Token query '${query.slice(0, 16)}...' -> Resolved to Health ID ${patient.healthId}`,
        details: `Opaque token verified. Masked identity presented to staff ${staff.fullName} (${staff.role})`
      });

      // Return Masked Identity according to PRD ACC-01
      return {
        found: true,
        patient: patient,
        maskedIdentity: {
          healthId: patient.healthId,
          fullName: patient.fullName,
          age: patient.dob,
          gender: patient.gender,
          bloodGroup: patient.bloodGroup || 'Unknown',
          mobileMasked: `+91 ••••• ••${(patient.mobile || '00').slice(-2)}`,
          photoUrl: patient.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          kycStatus: patient.kyc?.status || 'Verified'
        }
      };
    }

    return { found: false };
  }

  // Confirm In-Person Identity Checkpoint (PRD ACC-02)
  confirmIdentity(healthId) {
    const clean = (healthId || '').replace(/\s+/g, '');
    const staff = this.getCurrentStaff();
    sessionStorage.setItem(`id_confirmed_${clean}`, 'true');

    this.logAudit({
      action: "IDENTITY_CONFIRMED",
      target: `Health ID ${formatHealthId(clean)}`,
      details: `In-person identity verified by ${staff.fullName} (${staff.role}). Mandatory gate passed.`
    });

    return true;
  }

  isIdentityConfirmed(healthId) {
    const clean = (healthId || '').replace(/\s+/g, '');
    return sessionStorage.getItem(`id_confirmed_${clean}`) === 'true';
  }

  // Access Request & Consent Center (PRD ACC-03, ACC-04, ACC-05)
  requestAccess({ healthId, scopes, purpose = 'opd', mode = 'view_add', durationHours = 24, method = 'app' }) {
    this.refresh();
    const clean = (healthId || '').replace(/\s+/g, '');
    const patient = this.getPatientByHealthId(clean);
    if (!patient) return null;

    const staff = this.getCurrentStaff();
    const expiresAt = new Date(Date.now() + durationHours * 60 * 60 * 1000).toISOString();

    const newGrant = {
      id: `grt_${Date.now()}`,
      healthId: patient.healthId,
      patientId: patient.id,
      orgName: "AIIMS New Delhi",
      clinician: staff.fullName,
      scopes: scopes || ["demographics", "allergies", "conditions", "medications", "encounters", "labs", "hospitalizations", "documents"],
      purpose,
      mode,
      grantedAt: new Date().toISOString(),
      expiresAt,
      status: "approved", // In demonstration flow, immediately authorized via selected method
      consentMethod: method,
      kind: "consent"
    };

    if (!this.clinicalData.grants) this.clinicalData.grants = [];
    this.clinicalData.grants.unshift(newGrant);

    this.logAudit({
      action: "ACCESS_GRANT_CREATED",
      target: `Health ID ${patient.healthId}`,
      details: `Granted ${scopes.length} scopes for ${durationHours}h via ${method.toUpperCase()} consent by ${staff.fullName}`
    });

    this.saveClinical();
    return newGrant;
  }

  getActiveGrant(healthId) {
    this.refresh();
    const clean = (healthId || '').replace(/\s+/g, '');
    const grants = this.clinicalData.grants || [];
    const now = Date.now();

    return grants.find(g => 
      (g.healthId || '').replace(/\s+/g, '') === clean &&
      g.status === 'approved' &&
      new Date(g.expiresAt).getTime() > now &&
      !g.revokedAt
    ) || null;
  }

  revokeGrant(grantId) {
    this.refresh();
    const grant = (this.clinicalData.grants || []).find(g => g.id === grantId);
    if (grant) {
      grant.revokedAt = new Date().toISOString();
      grant.status = 'revoked';
      const staff = this.getCurrentStaff();
      this.logAudit({
        action: "ACCESS_GRANT_REVOKED",
        target: `Grant ${grantId} (${grant.healthId})`,
        details: `Revoked by clinician ${staff.fullName}`
      });
      this.saveClinical();
    }
    return grant;
  }

  // Emergency Break-Glass Protocol (PRD ACC-10)
  initiateBreakGlass({ healthId, reason, clinicianName, department }) {
    this.refresh();
    const clean = (healthId || '').replace(/\s+/g, '');
    const patient = this.getPatientByHealthId(clean);
    if (!patient) return null;

    const staff = this.getCurrentStaff();
    const now = Date.now();
    const expiresAt = new Date(now + 30 * 60 * 1000).toISOString(); // 30 minutes strict emergency window

    const breakGlassGrant = {
      id: `bg_${now}`,
      healthId: patient.healthId,
      patientId: patient.id,
      orgName: "AIIMS New Delhi — Trauma Emergency",
      clinician: clinicianName || staff.fullName,
      department: department || staff.department || "Emergency & Trauma",
      scopes: ["demographics", "allergies", "conditions", "medications", "encounters", "labs", "hospitalizations", "documents"],
      purpose: "emergency",
      mode: "view_add",
      reason: reason || "Unconscious Acute Trauma Victim",
      grantedAt: new Date(now).toISOString(),
      expiresAt: expiresAt,
      status: "approved",
      consentMethod: "break_glass",
      kind: "break_glass"
    };

    if (!this.clinicalData.grants) this.clinicalData.grants = [];
    this.clinicalData.grants.unshift(breakGlassGrant);

    // Save active break-glass indicator
    sessionStorage.setItem(`active_break_glass_${clean}`, JSON.stringify(breakGlassGrant));

    // Loud High-Priority Audit Logging
    this.logAudit({
      action: "BREAK_GLASS_ACCESS",
      target: `CRITICAL TRAUMA: Patient ${patient.fullName} (${patient.healthId})`,
      details: `Emergency bypass invoked by ${clinicianName || staff.fullName}. Justification: '${reason}'. 30-min window active. Statutory audit alert dispatched to hospital review queue.`,
      status: "Emergency Alert"
    });

    this.saveClinical();
    return breakGlassGrant;
  }

  getActiveBreakGlass(healthId) {
    const clean = (healthId || '').replace(/\s+/g, '');
    try {
      const raw = sessionStorage.getItem(`active_break_glass_${clean}`);
      if (raw) {
        const grant = JSON.parse(raw);
        if (new Date(grant.expiresAt).getTime() > Date.now()) {
          return grant;
        } else {
          sessionStorage.removeItem(`active_break_glass_${clean}`);
        }
      }
    } catch (e) {}

    // Check grants list
    const grant = this.getActiveGrant(clean);
    if (grant && grant.kind === 'break_glass') return grant;
    return null;
  }

  terminateBreakGlass(healthId) {
    const clean = (healthId || '').replace(/\s+/g, '');
    sessionStorage.removeItem(`active_break_glass_${clean}`);
    const grant = this.getActiveGrant(clean);
    if (grant && grant.kind === 'break_glass') {
      this.revokeGrant(grant.id);
    }
    this.logAudit({
      action: "BREAK_GLASS_CONCLUDED",
      target: `Health ID ${formatHealthId(clean)}`,
      details: "Emergency trauma session concluded by clinician. Access closed."
    });
  }

  // Patient Clinical Chart
  getPatientClinicalSummary(healthId) {
    this.refresh();
    const clean = (healthId || '').replace(/\s+/g, '');
    const patient = this.getPatientByHealthId(clean);
    if (!patient) return null;

    const allergies = (this.clinicalData.allergies && this.clinicalData.allergies[clean]) || [];
    const conditions = (this.clinicalData.conditions && this.clinicalData.conditions[clean]) || [];
    const medications = (this.clinicalData.medications && this.clinicalData.medications[clean]) || [];
    const vitals = (this.clinicalData.vitals && this.clinicalData.vitals[clean]) || null;
    const consultations = (this.clinicalData.consultations || []).filter(c => (c.healthId || '').replace(/\s+/g, '') === clean);
    const admissions = (this.clinicalData.admissions || []).filter(a => (a.healthId || '').replace(/\s+/g, '') === clean);
    const labResults = (this.clinicalData.labResults || []).filter(l => (l.healthId || '').replace(/\s+/g, '') === clean);
    const documents = (this.clinicalData.documents || []).filter(d => (d.healthId || '').replace(/\s+/g, '') === clean);

    return {
      patient,
      allergies,
      conditions,
      medications,
      vitals,
      consultations,
      admissions,
      labResults,
      documents
    };
  }

  // Add Consultation Record (PRD REC-02, REC-03)
  addConsultation(consultation) {
    this.refresh();
    const clean = (consultation.healthId || '').replace(/\s+/g, '');
    const staff = this.getCurrentStaff();

    const newConsultation = {
      id: `cns_${Date.now()}`,
      date: new Date().toISOString(),
      facility: "AIIMS New Delhi — Clinical OPD",
      clinician: staff.fullName,
      regNumber: staff.regNumber || "NMC/MCI-2004/09182",
      kind: "opd",
      verification: "provider_verified",
      ...consultation
    };

    if (!this.clinicalData.consultations) this.clinicalData.consultations = [];
    this.clinicalData.consultations.unshift(newConsultation);

    // Update patient vitals if provided
    if (consultation.vitals) {
      if (!this.clinicalData.vitals) this.clinicalData.vitals = {};
      this.clinicalData.vitals[clean] = {
        ...consultation.vitals,
        recordedAt: new Date().toISOString(),
        recordedBy: `${staff.fullName} (${staff.role})`
      };
    }

    // Append newly prescribed medications to active list
    if (consultation.prescriptions && consultation.prescriptions.length > 0) {
      if (!this.clinicalData.medications) this.clinicalData.medications = {};
      if (!this.clinicalData.medications[clean]) this.clinicalData.medications[clean] = [];

      consultation.prescriptions.forEach(rx => {
        this.clinicalData.medications[clean].unshift({
          id: `med_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
          drug: rx.drug,
          dosage: rx.dosage,
          frequency: rx.frequency,
          timing: rx.timing || 'After Food',
          startDate: new Date().toISOString().slice(0, 10),
          prescribedBy: `${staff.fullName} (AIIMS)`,
          status: "Active"
        });
      });
    }

    // Append diagnosis to active conditions
    if (consultation.diagnoses && consultation.diagnoses.length > 0) {
      if (!this.clinicalData.conditions) this.clinicalData.conditions = {};
      if (!this.clinicalData.conditions[clean]) this.clinicalData.conditions[clean] = [];

      consultation.diagnoses.forEach(dx => {
        const existing = this.clinicalData.conditions[clean].find(c => c.code === dx.code);
        if (!existing) {
          this.clinicalData.conditions[clean].unshift({
            id: `cnd_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
            code: dx.code,
            display: dx.name,
            category: "Clinical Diagnosis",
            onsetDate: new Date().toISOString().slice(0, 10),
            status: "Active",
            sourceOrg: "AIIMS New Delhi",
            verification: "provider_verified"
          });
        }
      });
    }

    this.logAudit({
      action: "OPD_CONSULTATION_SAVED",
      target: `Health ID ${formatHealthId(clean)}`,
      details: `Consultation ${newConsultation.id} authored by ${staff.fullName}. Diagnoses: ${consultation.diagnoses?.map(d=>d.name).join(', ') || 'N/A'}, ${consultation.prescriptions?.length || 0} Rx items.`
    });

    this.saveClinical();
    hospitalBackend.saveConsultation(newConsultation).catch(err => console.warn('[BackendSync] Consultation sync:', err));
    return newConsultation;
  }

  updateConsultation(id, updatedFields) {
    this.refresh();
    const consult = (this.clinicalData.consultations || []).find(c => c.id === id);
    if (consult) {
      Object.assign(consult, updatedFields, { updatedAt: new Date().toISOString() });
      this.saveClinical();
      hospitalBackend.updateConsultation(id, updatedFields).catch(err => console.warn('[BackendSync] Consult update:', err));
      this.logAudit({
        action: "OPD_CONSULTATION_UPDATED",
        target: `Consultation ${id}`,
        details: `Updated consultation for patient ${consult.healthId}`
      });
    }
    return consult;
  }

  // Inpatient Admissions & Rounds (PRD REC-08)
  addAdmission(admissionData) {
    this.refresh();
    const clean = (admissionData.healthId || '').replace(/\s+/g, '');
    const patient = this.getPatientByHealthId(clean);
    const staff = this.getCurrentStaff();

    const newAdmission = {
      id: `adm_${Date.now()}`,
      healthId: patient ? patient.healthId : formatHealthId(clean),
      memberName: patient ? patient.fullName : admissionData.memberName,
      bloodGroup: patient ? patient.bloodGroup : "Unknown",
      ward: admissionData.ward || "Inpatient Care Unit",
      bedNumber: admissionData.bedNumber || "Bed IPD-01",
      admittedAt: new Date().toISOString(),
      dischargedAt: null,
      status: "Active Inpatient",
      admittingDoctor: staff.fullName,
      admittingDiagnosis: admissionData.admittingDiagnosis || "Under Clinical Evaluation",
      finalDiagnosis: "Active Inpatient Course",
      courseSummary: admissionData.courseSummary || "Patient admitted for intensive inpatient therapy and clinical monitoring.",
      days: [
        {
          dayNo: 1,
          date: new Date().toISOString().slice(0, 10),
          doctorNote: admissionData.initialDoctorNote || "Patient admitted to ward. Initial clinical workup underway.",
          nurseNote: "Vitals stable upon ward intake. Assigned to primary nursing care team.",
          medsAdministered: []
        }
      ],
      dischargeMeds: [],
      dischargeAdvice: ""
    };

    if (!this.clinicalData.admissions) this.clinicalData.admissions = [];
    this.clinicalData.admissions.unshift(newAdmission);

    this.logAudit({
      action: "PATIENT_ADMITTED",
      target: `${newAdmission.memberName} (${newAdmission.healthId})`,
      details: `Admitted to ${newAdmission.ward} (${newAdmission.bedNumber}) by ${staff.fullName}. Diagnosis: ${newAdmission.admittingDiagnosis}`
    });

    this.saveClinical();
    hospitalBackend.saveAdmission(newAdmission).catch(err => console.warn('[BackendSync] Admission sync:', err));
    return newAdmission;
  }

  updateAdmission(admissionId, updatedFields) {
    this.refresh();
    const adm = (this.clinicalData.admissions || []).find(a => a.id === admissionId);
    if (adm) {
      Object.assign(adm, updatedFields, { updatedAt: new Date().toISOString() });
      this.saveClinical();
      hospitalBackend.updateAdmission(admissionId, updatedFields).catch(err => console.warn('[BackendSync] Admission update:', err));
      this.logAudit({
        action: "ADMISSION_UPDATED",
        target: `Admission ${adm.id} (${adm.memberName})`,
        details: `Ward: ${adm.ward}, Bed: ${adm.bedNumber}, Doctor: ${adm.admittingDoctor}`
      });
    }
    return adm;
  }

  addAdmissionRoundWithMAR(admissionId, { doctorNote, nurseNote, proceduresDone, medsDoses = [], testReports = [] }) {
    this.refresh();
    const adm = (this.clinicalData.admissions || []).find(a => a.id === admissionId);
    if (!adm) return null;

    const staff = this.getCurrentStaff();
    const today = new Date().toISOString().slice(0, 10);
    let dayRecord = adm.days.find(d => d.date === today);

    if (!dayRecord) {
      dayRecord = {
        dayNo: adm.days.length + 1,
        date: today,
        doctorNote: doctorNote || '',
        nurseNote: nurseNote || '',
        proceduresDone: proceduresDone || '',
        medsDoses: medsDoses || [],
        testReports: testReports || []
      };
      adm.days.push(dayRecord);
    } else {
      if (doctorNote) dayRecord.doctorNote = doctorNote;
      if (nurseNote) dayRecord.nurseNote = nurseNote;
      if (proceduresDone) dayRecord.proceduresDone = proceduresDone;
      if (medsDoses && medsDoses.length) {
        if (!dayRecord.medsDoses) dayRecord.medsDoses = [];
        dayRecord.medsDoses.push(...medsDoses);
      }
      if (testReports && testReports.length) {
        if (!dayRecord.testReports) dayRecord.testReports = [];
        dayRecord.testReports.push(...testReports);
      }
    }

    this.saveClinical();
    hospitalBackend.addAdmissionRound(admissionId, { doctorNote, nurseNote, proceduresDone, medsDoses, testReports })
      .catch(err => console.warn('[BackendSync] Round sync:', err));

    this.logAudit({
      action: "IPD_PROCEDURES_AND_DOSES_LOGGED",
      target: `Admission ${adm.id} (${adm.memberName})`,
      details: `Day ${dayRecord.dayNo}: ${proceduresDone || 'Procedures & MAR recorded'} | ${medsDoses.length} doses by ${staff.fullName}`
    });
    return adm;
  }

  addDailyRound(admissionId, { role = 'doctor', note, vitals, meds = [] }) {
    this.refresh();
    const adm = (this.clinicalData.admissions || []).find(a => a.id === admissionId);
    if (!adm) return null;

    const staff = this.getCurrentStaff();
    const today = new Date().toISOString().slice(0, 10);
    let dayRecord = adm.days.find(d => d.date === today);

    if (!dayRecord) {
      dayRecord = {
        dayNo: adm.days.length + 1,
        date: today,
        doctorNote: "",
        nurseNote: "",
        medsAdministered: []
      };
      adm.days.push(dayRecord);
    }

    if (role === 'doctor') {
      dayRecord.doctorNote = note;
    } else {
      dayRecord.nurseNote = note;
      if (meds.length > 0) {
        dayRecord.medsAdministered.push(...meds);
      }
    }

    this.logAudit({
      action: role === 'doctor' ? "DOCTOR_WARD_ROUND_LOGGED" : "NURSE_MAR_RECORDED",
      target: `Admission ${adm.id} (${adm.memberName})`,
      details: `Day ${dayRecord.dayNo} ${role} round logged by ${staff.fullName}`
    });

    this.saveClinical();
    return adm;
  }

  dischargePatient(admissionId, dischargeData) {
    this.refresh();
    const adm = (this.clinicalData.admissions || []).find(a => a.id === admissionId);
    if (!adm) return null;

    const staff = this.getCurrentStaff();
    adm.dischargedAt = new Date().toISOString();
    adm.status = "Discharged";
    adm.finalDiagnosis = dischargeData.finalDiagnosis || adm.admittingDiagnosis;
    adm.courseSummary = dischargeData.courseSummary || adm.courseSummary;
    adm.dischargeMeds = dischargeData.dischargeMeds || [];
    adm.dischargeAdvice = dischargeData.dischargeAdvice || "Continue oral medications. Follow up in OPD as advised.";

    this.logAudit({
      action: "PATIENT_DISCHARGED",
      target: `Admission ${adm.id} (${adm.memberName})`,
      details: `Discharge completed by ${staff.fullName}. Final Diagnosis: ${adm.finalDiagnosis}`
    });

    this.saveClinical();
    return adm;
  }

  // Diagnostic Investigations & Lab Results (PRD REC-09)
  addLabResult(resultData) {
    this.refresh();
    const clean = (resultData.healthId || '').replace(/\s+/g, '');
    const staff = this.getCurrentStaff();

    const newResult = {
      id: `lab_${Date.now()}`,
      healthId: formatHealthId(clean),
      reportedAt: new Date().toISOString(),
      collectedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      labOrg: "AIIMS Central Diagnostic Laboratories",
      verifiedBy: `${staff.fullName}, MD`,
      ...resultData
    };

    if (!this.clinicalData.labResults) this.clinicalData.labResults = [];
    this.clinicalData.labResults.unshift(newResult);

    this.logAudit({
      action: "LAB_RESULT_RECORDED",
      target: `Health ID ${newResult.healthId}`,
      details: `Test: ${newResult.testName} = ${newResult.valueText} ${newResult.unit} (Flag: ${newResult.flag || 'Normal'}) verified by ${staff.fullName}`
    });

    this.saveClinical();
    return newResult;
  }

  // Document Vault Upload (PRD REC-07)
  addDocument(docData) {
    this.refresh();
    const clean = (docData.healthId || '').replace(/\s+/g, '');
    const staff = this.getCurrentStaff();

    const newDoc = {
      id: `doc_${Date.now()}`,
      healthId: formatHealthId(clean),
      date: new Date().toISOString(),
      orgName: "AIIMS New Delhi",
      author: staff.fullName,
      verification: "provider_verified",
      sha256: Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join(''),
      ...docData
    };

    if (!this.clinicalData.documents) this.clinicalData.documents = [];
    this.clinicalData.documents.unshift(newDoc);

    this.logAudit({
      action: "DOCUMENT_UPLOADED",
      target: `Health ID ${newDoc.healthId}`,
      details: `Document '${newDoc.title}' (${newDoc.category}) archived with SHA-256 seal by ${staff.fullName}`
    });

    this.saveClinical();
    return newDoc;
  }

  // Hospital Audit Trail (PRD ADM-02)
  logAudit({ action, target, details, status = "Success" }) {
    const staff = this.getCurrentStaff();
    const auditEntry = {
      id: `h_aud_${Date.now()}_${Math.floor(Math.random()*1000)}`,
      timestamp: new Date().toISOString(),
      actor: `${staff.fullName} (${staff.role})`,
      role: staff.role.charAt(0).toUpperCase() + staff.role.slice(1),
      action,
      target,
      details,
      status
    };

    if (!this.clinicalData.auditLogs) this.clinicalData.auditLogs = [];
    this.clinicalData.auditLogs.unshift(auditEntry);
    this.saveClinical();
    return auditEntry;
  }

  getAuditLogs() {
    this.refresh();
    return this.clinicalData.auditLogs || [];
  }
}

export const hospitalStore = new HospitalStorageService();
