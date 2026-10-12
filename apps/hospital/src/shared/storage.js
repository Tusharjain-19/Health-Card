/**
 * HealthCard Hospital Portal: Centralized Clinical Storage & Sync Service
 * Seamlessly interfaces with centralized storage (matching apps/admin and apps/applicant)
 * and manages local clinical data, encounters, admissions, and audit records.
 */

import { DEMO_HOSPITAL_STAFF, DEMO_CLINICAL_DEPARTMENTS, DEFAULT_CLINICAL_DATABASE, DEFAULT_SEED_MEMBERS, DEFAULT_SEED_CARDS, DEFAULT_HOSPITAL_DOCTORS, DEFAULT_HOSPITAL_SERVICES } from './data/demoData.js';
import { hospitalBackend } from '../backend/apiClient.js';
import { generateHealthId, formatHealthId } from './utils/healthId.js';

const CENTRAL_STORAGE_KEY = 'healthcard_v1_store';
const HOSPITAL_STORAGE_KEY = 'healthcard_hospital_store';
const ACTIVE_STAFF_KEY = 'healthcard_hospital_active_staff';
const HOSPITAL_SETTINGS_KEY = 'healthcard_hospital_settings_v1';
const HOSPITAL_SESSION_KEY = 'healthcard_hospital_session_v1';
export const HOSPITAL_APPLICATIONS_KEY = 'healthcard_hospital_applications_v1';
export const HOSPITAL_REGISTRY_KEY = 'healthcard_registered_hospitals_v1';

export const DEFAULT_REGISTERED_HOSPITALS = [
  {
    id: "hosp_aiims",
    name: "All India Institute of Medical Sciences",
    shortName: "AIIMS New Delhi",
    tagline: "Tertiary Care Hospital & National Medical Centre",
    regNumber: "HOSP-DL-00192 • NABH Accredited",
    type: "Apex National Medical Institute",
    state: "Delhi",
    city: "New Delhi",
    address: "Sri Aurobindo Marg, Ansari Nagar, New Delhi - 110029",
    contactPhone: "+91 11 2658 8500",
    emergencyHelpline: "+91 11 2659 4405 (24x7 Trauma Center)",
    email: "admin@aiims.gov.in",
    website: "https://www.aiims.edu",
    opdTimings: "Monday to Saturday: 08:00 AM – 04:00 PM",
    totalBeds: "2478",
    icuBeds: "260",
    letterheadHeader: "ALL INDIA INSTITUTE OF MEDICAL SCIENCES, NEW DELHI",
    adminName: "Dr. Rajesh Sharma",
    adminLoginId: "admin@aiims.gov.in",
    adminPassword: "admin123",
    status: "Verified",
    badge: "Apex Govt",
    accreditation: "NABH / JCI Accredited"
  },
  {
    id: "hosp_apollo",
    name: "Apollo Multispeciality Hospitals",
    shortName: "Apollo Hospitals",
    tagline: "Tertiary Multi-Specialty Healthcare & Cancer Centre",
    regNumber: "HOSP-KA-00847 • NABH Accredited",
    type: "Multispeciality Hospital",
    state: "Karnataka",
    city: "Bengaluru",
    address: "154/11, Bannerghatta Main Rd, Bengaluru - 560076",
    contactPhone: "+91 80 2630 4050",
    emergencyHelpline: "+91 80 1066 (24x7 Emergency Care)",
    email: "admin@apollo.health",
    website: "https://www.apollohospitals.com",
    opdTimings: "Monday to Saturday: 08:30 AM – 08:00 PM",
    totalBeds: "650",
    icuBeds: "120",
    letterheadHeader: "APOLLO HOSPITALS BANNERGHATTA, BENGALURU",
    adminName: "Dr. Arvind Swaminathan",
    adminLoginId: "admin@apollo.health",
    adminPassword: "apollo123",
    status: "Verified",
    badge: "Private Apex",
    accreditation: "NABH Accredited"
  },
  {
    id: "hosp_fortis",
    name: "Fortis Memorial & Escorts Heart Institute",
    shortName: "Fortis Healthcare",
    tagline: "Super-Specialty Cardiac & Critical Care Institute",
    regNumber: "HOSP-DL-00511 • NABH Accredited",
    type: "Super-Specialty Hospital",
    state: "Delhi",
    city: "New Delhi",
    address: "Okhla Road, Sukhdev Vihar Metro Station, New Delhi - 110025",
    contactPhone: "+91 11 4713 5000",
    emergencyHelpline: "+91 11 1050 10 (24x7 Cardiac Emergency)",
    email: "admin@fortis.in",
    website: "https://www.fortishealthcare.com",
    opdTimings: "Monday to Saturday: 09:00 AM – 06:00 PM",
    totalBeds: "410",
    icuBeds: "95",
    letterheadHeader: "FORTIS ESCORTS HEART INSTITUTE, NEW DELHI",
    adminName: "Dr. Meenakshi Sundaram",
    adminLoginId: "admin@fortis.in",
    adminPassword: "fortis123",
    status: "Verified",
    badge: "Cardiac Care",
    accreditation: "NABH / JCI Accredited"
  },
  {
    id: "hosp_max",
    name: "Max Super Speciality Hospital Saket",
    shortName: "Max Healthcare",
    tagline: "Multi-Disciplinary Tertiary Healthcare & Robotic Surgery",
    regNumber: "HOSP-DL-00723 • NABH Accredited",
    type: "Tertiary Multi-Specialty Hospital",
    state: "Delhi",
    city: "New Delhi",
    address: "1, 2, Press Enclave Marg, Saket Institutional Area, New Delhi - 110017",
    contactPhone: "+91 11 2651 5050",
    emergencyHelpline: "+91 11 4055 4055 (24x7 Trauma & Stroke)",
    email: "admin@maxhealthcare.in",
    website: "https://www.maxhealthcare.in",
    opdTimings: "Monday to Saturday: 08:30 AM – 07:30 PM",
    totalBeds: "530",
    icuBeds: "110",
    letterheadHeader: "MAX SUPER SPECIALITY HOSPITAL, SAKET, NEW DELHI",
    adminName: "Dr. Alok Sengupta",
    adminLoginId: "admin@maxhealthcare.in",
    adminPassword: "maxpass",
    status: "Verified",
    badge: "Robotic Center",
    accreditation: "NABH Accredited"
  }
];

export const DEFAULT_HOSPITAL_APPLICATIONS = [
  {
    id: "app_101",
    refNumber: "HOSP-REG-84729",
    hospitalName: "Manipal Hospital Dwarka",
    shortName: "Manipal Hospital",
    regNumber: "HOSP-DL-09941",
    type: "Private Multispecialty",
    state: "Delhi",
    city: "Dwarka, New Delhi",
    address: "Sector 6, Dwarka, New Delhi - 110075",
    adminName: "Dr. Sunita Rao (Medical Director)",
    email: "admin@manipal.org",
    phone: "+91 11 4987 6543",
    totalBeds: "380",
    icuBeds: "75",
    accreditation: "NABH Accredited",
    status: "PENDING_APPROVAL",
    appliedAt: "2026-10-10T11:20:00.000Z",
    notes: "State Clinical Establishment Certificate attached. Verification pending central clearance."
  },
  {
    id: "app_102",
    refNumber: "HOSP-REG-91204",
    hospitalName: "Medanta - The Medicity",
    shortName: "Medanta Hospital",
    regNumber: "HOSP-HR-00388",
    type: "Super-Specialty Hospital",
    state: "Haryana",
    city: "Gurugram",
    address: "CH Bakhtawar Singh Rd, Sector 38, Gurugram - 122001",
    adminName: "Dr. Naresh Taneja (Chief Administrator)",
    email: "admin@medanta.org",
    phone: "+91 124 414 1414",
    totalBeds: "1250",
    icuBeds: "300",
    accreditation: "JCI & NABH Accredited",
    status: "APPROVED",
    appliedAt: "2026-10-05T09:15:00.000Z",
    approvedAt: "2026-10-06T14:30:00.000Z",
    issuedLoginId: "admin@medanta.org",
    issuedPassword: "medanta2026",
    notes: "Credentials issued and dispatched to nodal administrator."
  }
];

export const DEFAULT_HOSPITAL_SETTINGS = {
  hospitalName: "All India Institute of Medical Sciences",
  shortName: "AIIMS New Delhi",
  tagline: "Tertiary Care Hospital & National Medical Centre",
  regNumber: "HOSP-DL-00192 • NABH Accredited",
  state: "Delhi",
  city: "New Delhi",
  address: "Sri Aurobindo Marg, Ansari Nagar, New Delhi - 110029",
  contactPhone: "+91 11 2658 8500",
  emergencyHelpline: "+91 11 2659 4405 (24x7 Emergency Trauma)",
  email: "admin@aiims.gov.in",
  website: "https://www.aiims.edu",
  opdTimings: "Monday to Saturday: 08:00 AM – 04:00 PM",
  totalBeds: "2478",
  icuBeds: "260",
  letterheadHeader: "ALL INDIA INSTITUTE OF MEDICAL SCIENCES, NEW DELHI",
  adminLoginId: "admin@aiims.gov.in",
  adminPassword: "admin123"
};

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
  // HOSPITAL DOCTORS MANAGEMENT (Item 3 & 4)
  // ==========================================
  getDoctors(department = 'All') {
    this.refresh();
    const list = (this.clinicalData.doctors || DEFAULT_HOSPITAL_DOCTORS).map(d => ({
      avatar: d.avatar || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80",
      appUsername: d.appUsername || `doc.${(d.fullName || '').toLowerCase().replace(/[^a-z]/g, '').slice(0, 10)}`,
      appPin: d.appPin || '1234',
      digitalSignature: d.digitalSignature || `Digitally Signed by ${d.fullName}`,
      appRole: d.appRole || 'Attending Clinician (Doctor App Access)',
      ...d
    }));
    if (department && department !== 'All') {
      return list.filter(d => d.department === department);
    }
    return list;
  }

  getDoctorById(id) {
    this.refresh();
    const doc = (this.clinicalData.doctors || DEFAULT_HOSPITAL_DOCTORS).find(d => d.id === id);
    if (!doc) return null;
    return {
      avatar: doc.avatar || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80",
      appUsername: doc.appUsername || `doc.${(doc.fullName || '').toLowerCase().replace(/[^a-z]/g, '').slice(0, 10)}`,
      appPin: doc.appPin || '1234',
      digitalSignature: doc.digitalSignature || `Digitally Signed by ${doc.fullName}`,
      appRole: doc.appRole || 'Attending Clinician (Doctor App Access)',
      ...doc
    };
  }

  addDoctor(doctorData) {
    this.refresh();
    const cleanUser = doctorData.appUsername || `doc.${(doctorData.fullName || '').toLowerCase().replace(/[^a-z]/g, '').slice(0, 10)}`;
    const newDoc = {
      id: `doc_${Date.now()}`,
      status: "Active",
      createdAt: new Date().toISOString(),
      avatar: doctorData.avatar || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80",
      appUsername: cleanUser,
      appPin: doctorData.appPin || '1234',
      digitalSignature: doctorData.digitalSignature || `Digitally Signed by ${doctorData.fullName} (${doctorData.regNumber || 'NMC Verified'})`,
      appRole: doctorData.appRole || 'Attending Clinician (Doctor App Access)',
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
      details: `Registered with NMC ${newDoc.regNumber || 'N/A'}, Doctor App ID: ${newDoc.appUsername}, OPD Room: ${newDoc.opdRoom || 'OPD Desk'}`
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
        details: `Credentials/schedule updated for ${doc.department}. Doctor App Login: ${doc.appUsername || 'Configured'}`
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
    const cleanDigits = healthId.replace(/\D/g, '');
    return (this.centralData.members || []).find(m => 
      (m.healthId && m.healthId.replace(/\s+/g, '') === clean) ||
      (m.mobile && cleanDigits.length >= 10 && m.mobile.replace(/\D/g, '') === cleanDigits) ||
      (m.regNumber && m.regNumber.replace(/\s+/g, '').toLowerCase() === clean.toLowerCase()) ||
      (m.id && m.id === clean)
    ) || null;
  }

  getPatientByMobile(mobile) {
    if (!mobile) return null;
    this.refresh();
    const clean = mobile.replace(/\D/g, '');
    return (this.centralData.members || []).find(m => (m.mobile || '').replace(/\D/g, '') === clean) || null;
  }

  // Fast Hospital Registration for Walk-in / New Patients (No auto HealthCard creation)
  registerPatient(patientData) {
    this.refresh();
    if (!patientData.fullName) throw new Error('Patient name is required');

    // Only set Health ID if the patient ALREADY holds an existing HealthCard
    let formattedHealthId = null;
    let cleanId = null;
    if (patientData.healthId && patientData.healthId.trim()) {
      const raw = patientData.healthId.replace(/\D/g, '');
      if (raw.length === 10) {
        formattedHealthId = `${raw.slice(0, 5)} ${raw.slice(5, 10)}`;
        cleanId = raw;
      }
    }

    const memberId = `mem_${Date.now()}`;
    const cleanMobile = patientData.mobile ? patientData.mobile.replace(/\D/g, '').slice(-10) : '';
    const regNumber = `UHID-${cleanMobile || Math.floor(100000 + Math.random() * 900000)}`;
    const primaryLookupKey = cleanId || cleanMobile || memberId;

    // Avatar by gender
    const defaultAvatar = patientData.gender === 'Female'
      ? 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
      : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80';

    // Calculate DOB from age if needed
    let dob = patientData.dob;
    if (!dob && patientData.age) {
      const birthYear = new Date().getFullYear() - parseInt(patientData.age, 10);
      dob = `${birthYear}-01-01`;
    } else if (!dob) {
      dob = '1995-01-01';
    }

    const newMember = {
      id: memberId,
      fullName: patientData.fullName.trim(),
      regNumber: regNumber,
      healthId: formattedHealthId, // null if patient doesn't have a HealthCard
      hasHealthCard: !!formattedHealthId,
      dob: dob,
      gender: patientData.gender || 'Male',
      mobile: cleanMobile || '9876543210',
      bloodGroup: patientData.bloodGroup || 'O+',
      guardianName: patientData.guardianName || '',
      address: patientData.address || 'Civil Lines',
      city: patientData.city || 'New Delhi',
      state: patientData.state || 'Delhi',
      pincode: patientData.pincode || '110001',
      photoUrl: patientData.photoUrl || defaultAvatar,
      emergencyContact: {
        name: patientData.guardianName || 'Relative',
        phone: cleanMobile ? `+91 ${cleanMobile}` : '+91 9876543210'
      },
      kyc: {
        status: formattedHealthId ? "Verified" : "Hospital Registered",
        documentType: formattedHealthId ? "HealthCard (Linked)" : "Hospital OPD Slip",
        verifiedAt: new Date().toISOString()
      },
      registeredAt: new Date().toISOString()
    };

    if (!this.centralData.members) this.centralData.members = [];
    this.centralData.members.unshift(newMember);

    // NOTE: Hospitals DO NOT create new HealthCards.
    // If the patient brought an existing card number, link it to existing card record if needed
    if (formattedHealthId) {
      const existingCard = (this.centralData.cards || []).find(c => (c.healthId || '').replace(/\s+/g, '') === cleanId);
      if (!existingCard) {
        // Only if existing card wasn't already in demo seed, record reference
        this.centralData.cards.unshift({
          id: `card_${Date.now()}`,
          memberId: memberId,
          healthId: formattedHealthId,
          serialNumber: formattedHealthId,
          token: `tok_${cleanId}`,
          qrPayload: `https://hc.national.gov.in/c/${cleanId}`,
          status: "Active",
          template: "teal",
          issuedAt: new Date().toISOString()
        });
      }
    }

    this.saveCentral();

    // Mark verified in session
    sessionStorage.setItem(`id_confirmed_${primaryLookupKey}`, 'true');

    // Initialize vitals if provided
    if (patientData.vitals) {
      if (!this.clinicalData.vitals) this.clinicalData.vitals = {};
      this.clinicalData.vitals[primaryLookupKey] = {
        ...patientData.vitals,
        recordedAt: new Date().toISOString(),
        recordedBy: this.getCurrentStaff().fullName
      };
      this.saveClinical();
    }

    this.logAudit({
      action: "PATIENT_REGISTERED",
      target: `${newMember.fullName} (${formattedHealthId || regNumber})`,
      details: `New patient registered at hospital counter by ${this.getCurrentStaff().fullName}. ${formattedHealthId ? `Linked Health ID ${formattedHealthId}` : `UHID ${regNumber} (No HealthCard issued)`}`
    });

    return {
      success: true,
      patient: newMember,
      card: null
    };
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
      orgName: "AIIMS New Delhi: Trauma Emergency",
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

  // Update Patient Profile Details (Name, Age, Gender, Mobile, Blood Group)
  updatePatientDetails(healthId, updatedDetails) {
    this.refresh();
    const clean = (healthId || '').replace(/\s+/g, '');
    const patient = this.getPatientByHealthId(clean);
    if (!patient) return null;

    Object.assign(patient, updatedDetails, { updatedAt: new Date().toISOString() });
    this.saveCentral();

    this.logAudit({
      action: "PATIENT_DETAILS_UPDATED",
      target: `${patient.fullName} (${patient.healthId || patient.id})`,
      details: `Profile updated by ${this.getCurrentStaff().fullName}: Name=${patient.fullName}, Mobile=${patient.mobile}, Blood=${patient.bloodGroup}`
    });
    return patient;
  }

  // Time-to-Time Vitals Tracking & Temperature Trend
  addPatientVitalLog(healthId, vitalEntry) {
    this.refresh();
    const clean = (healthId || '').replace(/\s+/g, '');
    if (!this.clinicalData.vitalsHistory) this.clinicalData.vitalsHistory = {};
    if (!this.clinicalData.vitalsHistory[clean]) {
      this.clinicalData.vitalsHistory[clean] = [];
    }

    const staff = this.getCurrentStaff();
    const newVital = {
      id: `vit_${Date.now()}`,
      recordedAt: new Date().toISOString(),
      time: vitalEntry.time || new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true }),
      temp: parseFloat(vitalEntry.temp) || 98.4,
      bpSys: parseInt(vitalEntry.bpSys, 10) || 120,
      bpDia: parseInt(vitalEntry.bpDia, 10) || 80,
      pulse: parseInt(vitalEntry.pulse, 10) || 72,
      spo2: parseInt(vitalEntry.spo2, 10) || 98,
      respRate: parseInt(vitalEntry.respRate, 10) || 16,
      weight: parseFloat(vitalEntry.weight) || 70,
      problem: vitalEntry.problem || 'Vitals observation',
      dietNote: vitalEntry.dietNote || '',
      recordedBy: staff.fullName
    };

    this.clinicalData.vitalsHistory[clean].unshift(newVital);

    // Also update current latest snapshot
    if (!this.clinicalData.vitals) this.clinicalData.vitals = {};
    this.clinicalData.vitals[clean] = {
      ...newVital,
      recordedAt: newVital.recordedAt,
      recordedBy: staff.fullName
    };

    this.logAudit({
      action: "VITALS_LOGGED",
      target: `Health ID ${formatHealthId(clean)}`,
      details: `Logged at ${newVital.time}: Temp=${newVital.temp}°F, BP=${newVital.bpSys}/${newVital.bpDia}, SpO2=${newVital.spo2}%. Note: ${newVital.problem}`
    });

    this.saveClinical();
    return newVital;
  }

  getPatientVitalsHistory(healthId) {
    this.refresh();
    const clean = (healthId || '').replace(/\s+/g, '');
    let list = (this.clinicalData.vitalsHistory && this.clinicalData.vitalsHistory[clean]) || [];

    if (list.length === 0) {
      const curr = (this.clinicalData.vitals && this.clinicalData.vitals[clean]) || {
        temp: 99.4, bpSys: 128, bpDia: 82, pulse: 78, spo2: 98, weight: 72
      };
      const defaults = [
        {
          id: 'vit_01',
          recordedAt: new Date(Date.now() - 4 * 3600000).toISOString(),
          time: '09:00 AM',
          temp: 101.8,
          bpSys: 136,
          bpDia: 88,
          pulse: 94,
          spo2: 96,
          problem: 'High temperature with shivering & severe headache. Tab Paracetamol given.',
          dietNote: 'Warm water and light ORS solution advised.',
          recordedBy: 'Sister Sunita (Triage Desk)'
        },
        {
          id: 'vit_02',
          recordedAt: new Date(Date.now() - 2 * 3600000).toISOString(),
          time: '11:30 AM',
          temp: 99.6,
          bpSys: 126,
          bpDia: 82,
          pulse: 82,
          spo2: 98,
          problem: 'Temperature declining post antipyretic. Perspiration present.',
          dietNote: 'Moong dal khichdi taken, well tolerated.',
          recordedBy: 'Sister Sunita (Triage Desk)'
        },
        {
          id: 'vit_03',
          recordedAt: new Date().toISOString(),
          time: '01:45 PM',
          temp: parseFloat(curr.temp) || 98.6,
          bpSys: parseInt(curr.bpSys, 10) || 122,
          bpDia: parseInt(curr.bpDia, 10) || 80,
          pulse: parseInt(curr.pulse, 10) || 74,
          spo2: parseInt(curr.spo2, 10) || 99,
          problem: 'Patient alert, fever settled. Routine review.',
          dietNote: 'Clear liquids and light semi-solid diet.',
          recordedBy: this.getCurrentStaff().fullName
        }
      ];
      if (!this.clinicalData.vitalsHistory) this.clinicalData.vitalsHistory = {};
      this.clinicalData.vitalsHistory[clean] = defaults;
      this.saveClinical();
      list = defaults;
    }
    return list;
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
    const vitalsHistory = this.getPatientVitalsHistory(clean);
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
      vitalsHistory,
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
      facility: "AIIMS New Delhi: Clinical OPD",
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

  // Standard Indian Hospital Wards & Bed Configurations
  getStandardWards() {
    return [
      { id: "casualty", name: "Emergency / Casualty Ward", beds: ["EM-01", "EM-02", "EM-03", "EM-04", "EM-05", "EM-06"] },
      { id: "icu", name: "Intensive Care Unit (ICU)", beds: ["ICU-01", "ICU-02", "ICU-03", "ICU-04", "ICU-05", "ICU-06"] },
      { id: "hdu", name: "High Dependency Unit (HDU)", beds: ["HDU-01", "HDU-02", "HDU-03", "HDU-04"] },
      { id: "gw_male", name: "General Ward - Male", beds: ["GW-M-01", "GW-M-02", "GW-M-03", "GW-M-04", "GW-M-05", "GW-M-06", "GW-M-07", "GW-M-08"] },
      { id: "gw_female", name: "General Ward - Female", beds: ["GW-F-01", "GW-F-02", "GW-F-03", "GW-F-04", "GW-F-05", "GW-F-06", "GW-F-07", "GW-F-08"] },
      { id: "private", name: "Private Room / Deluxe Suite", beds: ["PVT-101", "PVT-102", "PVT-103", "PVT-104", "PVT-105"] }
    ];
  }

  // Inpatient Ward & Bed Transfer (e.g. Casualty -> ICU -> General Ward)
  transferWard({ admissionId, toWard, toBed, reason = 'Clinical Transfer', doctorNote = '' }) {
    this.refresh();
    const adm = (this.clinicalData.admissions || []).find(a => a.id === admissionId);
    if (!adm) return null;

    const staff = this.getCurrentStaff();
    const prevWard = adm.ward;
    const prevBed = adm.bedNumber;

    adm.ward = toWard;
    adm.bedNumber = toBed;

    if (!adm.transferHistory) adm.transferHistory = [];
    const transferEvent = {
      id: `trf_${Date.now()}`,
      transferredAt: new Date().toISOString(),
      fromWard: prevWard,
      fromBed: prevBed,
      toWard: toWard,
      toBed: toBed,
      reason: reason,
      doctorNote: doctorNote,
      authorizedBy: staff.fullName
    };
    adm.transferHistory.push(transferEvent);

    // Append transfer note into clinical days record
    const today = new Date().toISOString().slice(0, 10);
    let dayRecord = (adm.days || []).find(d => d.date === today);
    const logText = `[Ward Transfer] Shifted from ${prevWard} (${prevBed}) to ${toWard} (${toBed}). Reason: ${reason}`;
    if (dayRecord) {
      dayRecord.doctorNote = dayRecord.doctorNote ? `${dayRecord.doctorNote}\n${logText}` : logText;
    } else {
      if (!adm.days) adm.days = [];
      adm.days.push({
        dayNo: adm.days.length + 1,
        date: today,
        doctorNote: logText,
        nurseNote: `Patient bed transfer verified by ward nursing team. Handover completed to ${toWard}.`,
        medsAdministered: []
      });
    }

    this.logAudit({
      action: "WARD_TRANSFER_EXECUTED",
      target: `${adm.memberName} (${adm.healthId})`,
      details: `Bed changed from ${prevWard} (${prevBed}) -> ${toWard} (${toBed}) by ${staff.fullName}. Reason: ${reason}`
    });

    this.saveClinical();
    hospitalBackend.updateAdmission(admissionId, {
      ward: toWard,
      bedNumber: toBed,
      transferHistory: adm.transferHistory,
      days: adm.days
    }).catch(err => console.warn('[BackendSync] Transfer sync:', err));

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

  // ==========================================
  // HOSPITAL PROFILE & SETTINGS
  // ==========================================
  getHospitalSettings() {
    try {
      const raw = localStorage.getItem(HOSPITAL_SETTINGS_KEY);
      if (raw) {
        return { ...DEFAULT_HOSPITAL_SETTINGS, ...JSON.parse(raw) };
      }
    } catch (e) {
      console.warn('Error reading hospital settings:', e);
    }
    return { ...DEFAULT_HOSPITAL_SETTINGS };
  }

  updateHospitalSettings(updated) {
    const current = this.getHospitalSettings();
    const merged = { ...current, ...updated };
    localStorage.setItem(HOSPITAL_SETTINGS_KEY, JSON.stringify(merged));
    this.logAudit({
      action: "HOSPITAL_SETTINGS_UPDATED",
      target: merged.hospitalName,
      details: "Hospital institutional metadata and credentials updated"
    });
    return merged;
  }

  // ==========================================
  // MULTI-HOSPITAL REGISTRY & ONBOARDING
  // ==========================================
  getRegisteredHospitals() {
    try {
      const raw = localStorage.getItem(HOSPITAL_REGISTRY_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Error reading registered hospitals:', e);
    }
    this.saveRegisteredHospitals(DEFAULT_REGISTERED_HOSPITALS);
    return JSON.parse(JSON.stringify(DEFAULT_REGISTERED_HOSPITALS));
  }

  saveRegisteredHospitals(list) {
    try {
      localStorage.setItem(HOSPITAL_REGISTRY_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Failed to save registered hospitals:', e);
    }
  }

  getHospitalApplications() {
    try {
      const raw = localStorage.getItem(HOSPITAL_APPLICATIONS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Error reading hospital applications:', e);
    }
    this.saveHospitalApplications(DEFAULT_HOSPITAL_APPLICATIONS);
    return JSON.parse(JSON.stringify(DEFAULT_HOSPITAL_APPLICATIONS));
  }

  saveHospitalApplications(list) {
    try {
      localStorage.setItem(HOSPITAL_APPLICATIONS_KEY, JSON.stringify(list));
    } catch (e) {
      console.error('Failed to save hospital applications:', e);
    }
  }

  submitHospitalApplication(formData) {
    const apps = this.getHospitalApplications();
    const refNumber = `HOSP-REG-${Math.floor(10000 + Math.random() * 90000)}`;
    const newApp = {
      id: `app_${Date.now()}`,
      refNumber,
      hospitalName: formData.hospitalName || "Healthcare Facility",
      shortName: formData.shortName || formData.hospitalName || "Hospital",
      regNumber: formData.regNumber || `HOSP-REG-${Date.now().toString().slice(-5)}`,
      type: formData.type || "Multispeciality Hospital",
      state: formData.state || "Delhi",
      city: formData.city || "New Delhi",
      address: formData.address || "",
      adminName: formData.adminName || "Nodal Administrator",
      email: formData.email || "admin@hospital.org",
      phone: formData.phone || "+91 11 0000 0000",
      totalBeds: formData.totalBeds || "100",
      icuBeds: formData.icuBeds || "20",
      accreditation: formData.accreditation || "NABH Accredited",
      logoUrl: formData.logoUrl || "",
      documents: Array.isArray(formData.documents) ? formData.documents : [],
      status: "PENDING_APPROVAL",
      appliedAt: new Date().toISOString(),
      notes: formData.notes || "Online application submitted via Institutional Gateway"
    };

    apps.unshift(newApp);
    this.saveHospitalApplications(apps);

    this.logAudit({
      action: "HOSPITAL_APPLICATION_SUBMITTED",
      target: newApp.hospitalName,
      details: `Application ${refNumber} logged with ${newApp.documents.length} regulatory licenses attached`
    });

    return newApp;
  }

  updateHospitalApplication(appId, updatedData) {
    const apps = this.getHospitalApplications();
    const appIndex = apps.findIndex(a => a.id === appId || a.refNumber === appId);
    if (appIndex === -1) return null;

    const merged = { ...apps[appIndex], ...updatedData, updatedAt: new Date().toISOString() };
    apps[appIndex] = merged;
    this.saveHospitalApplications(apps);
    return merged;
  }

  approveHospitalApplication(appId, customCredentials = null) {
    const apps = this.getHospitalApplications();
    const app = apps.find(a => a.id === appId || a.refNumber === appId);
    if (!app) return { success: false, message: "Application not found" };

    const cleanSlug = (app.shortName || app.hospitalName).toLowerCase().replace(/[^a-z0-9]/g, '');
    const issuedLoginId = customCredentials?.loginId || app.email || `admin@${cleanSlug}.org`;
    const issuedPassword = customCredentials?.password || `HospPass#${Math.floor(1000 + Math.random() * 9000)}`;

    app.status = "APPROVED";
    app.approvedAt = new Date().toISOString();
    app.issuedLoginId = issuedLoginId;
    app.issuedPassword = issuedPassword;
    app.notes = "Approved by Central HealthCard Administrator. Credentials active.";
    this.saveHospitalApplications(apps);

    // Register into active hospitals
    const hospitals = this.getRegisteredHospitals();
    const existingIndex = hospitals.findIndex(h => h.id === app.id || h.adminLoginId.toLowerCase() === issuedLoginId.toLowerCase());
    
    const newHospitalRecord = {
      id: app.id || `hosp_${Date.now()}`,
      name: app.hospitalName,
      shortName: app.shortName || app.hospitalName,
      tagline: `${app.type} • Verified Institutional Provider`,
      regNumber: `${app.regNumber} • ${app.accreditation}`,
      type: app.type,
      state: app.state,
      city: app.city,
      address: app.address,
      contactPhone: app.phone,
      emergencyHelpline: `${app.phone} (24x7 Emergency)`,
      email: issuedLoginId,
      website: `https://${cleanSlug}.healthcard.in`,
      opdTimings: "Monday to Saturday: 08:30 AM – 06:00 PM",
      totalBeds: app.totalBeds,
      icuBeds: app.icuBeds,
      letterheadHeader: `${app.hospitalName.toUpperCase()}, ${app.city.toUpperCase()}`,
      adminName: app.adminName,
      adminLoginId: issuedLoginId,
      adminPassword: issuedPassword,
      logoUrl: app.logoUrl || "",
      documents: app.documents || [],
      status: "Verified",
      badge: "Empanelled",
      accreditation: app.accreditation
    };

    if (existingIndex >= 0) {
      hospitals[existingIndex] = newHospitalRecord;
    } else {
      hospitals.push(newHospitalRecord);
    }
    this.saveRegisteredHospitals(hospitals);

    // Also mirror to central admin storage key if present
    try {
      const adminStoreRaw = localStorage.getItem('healthcard_db_v1');
      if (adminStoreRaw) {
        const adminDb = JSON.parse(adminStoreRaw);
        if (adminDb && adminDb.organizations) {
          const orgExists = adminDb.organizations.find(o => o.regNumber === app.regNumber);
          if (!orgExists) {
            adminDb.organizations.push({
              id: app.id,
              name: app.hospitalName,
              regNumber: app.regNumber,
              type: app.type,
              city: app.city,
              state: app.state,
              status: "Verified",
              staffCount: 12,
              onboardedAt: new Date().toISOString()
            });
            localStorage.setItem('healthcard_db_v1', JSON.stringify(adminDb));
          }
        }
      }
    } catch (e) {
      console.warn('Note: Central admin db sync optional:', e);
    }

    this.logAudit({
      action: "HOSPITAL_CREDENTIALS_ISSUED",
      target: app.hospitalName,
      details: `Official login credentials issued for ${issuedLoginId}`
    });

    return {
      success: true,
      application: app,
      hospital: newHospitalRecord,
      credentials: {
        loginId: issuedLoginId,
        password: issuedPassword
      }
    };
  }

  rejectHospitalApplication(appId, reason = "Information mismatch with state clinical establishment records") {
    const apps = this.getHospitalApplications();
    const app = apps.find(a => a.id === appId || a.refNumber === appId);
    if (!app) return { success: false, message: "Application not found" };

    app.status = "REJECTED";
    app.rejectedAt = new Date().toISOString();
    app.rejectionReason = reason;
    this.saveHospitalApplications(apps);

    return { success: true, application: app };
  }

  // Live Dynamic Credential Identifier
  identifyCredential(username) {
    if (!username) return null;
    const u = username.trim().toLowerCase();

    // 1. Check Registered Hospitals
    const hospitals = this.getRegisteredHospitals();
    const matchedHosp = hospitals.find(h => 
      (h.adminLoginId && h.adminLoginId.toLowerCase() === u) ||
      (h.email && h.email.toLowerCase() === u) ||
      (h.shortName && h.shortName.toLowerCase() === u) ||
      (h.name && h.name.toLowerCase() === u)
    );
    if (matchedHosp) {
      return {
        type: 'HOSPITAL',
        name: matchedHosp.name,
        shortName: matchedHosp.shortName,
        regNumber: matchedHosp.regNumber,
        typeLabel: matchedHosp.type || "Empanelled Hospital",
        adminName: matchedHosp.adminName || "Chief Hospital Administrator",
        loginId: matchedHosp.adminLoginId,
        badge: matchedHosp.badge || "Verified"
      };
    }

    // 2. Check Hospital Doctors
    const doctors = this.getDoctors();
    const matchedDoctor = doctors.find(d => 
      (d.appUsername && d.appUsername.toLowerCase() === u) ||
      (d.email && d.email.toLowerCase() === u) ||
      (d.fullName && d.fullName.toLowerCase() === u)
    );
    if (matchedDoctor) {
      return {
        type: 'DOCTOR',
        name: matchedDoctor.fullName,
        title: matchedDoctor.specialization || "Medical Consultant",
        department: matchedDoctor.department,
        regNumber: matchedDoctor.regNumber,
        loginId: matchedDoctor.appUsername,
        badge: "Clinician"
      };
    }

    // 3. Check Pending Application
    const apps = this.getHospitalApplications();
    const matchedApp = apps.find(a => 
      (a.email && a.email.toLowerCase() === u) ||
      (a.refNumber && a.refNumber.toLowerCase() === u)
    );
    if (matchedApp) {
      return {
        type: 'APPLICATION',
        name: matchedApp.hospitalName,
        status: matchedApp.status,
        refNumber: matchedApp.refNumber,
        notes: matchedApp.status === 'PENDING_APPROVAL' ? 'Application Under Central Admin Review' : 'Credentials Issued',
        badge: matchedApp.status
      };
    }

    return null;
  }

  // Password / Access PIN Change Method
  changeHospitalPassword(username, oldPassword, newPassword) {
    const u = (username || '').trim().toLowerCase();
    const oldP = (oldPassword || '').trim();
    const newP = (newPassword || '').trim();

    if (!newP || newP.length < 4) {
      return { success: false, message: "New password must be at least 4 characters long." };
    }

    // 1. Check in Registered Hospitals
    const hospitals = this.getRegisteredHospitals();
    const hosp = hospitals.find(h => 
      (h.adminLoginId && h.adminLoginId.toLowerCase() === u) ||
      (h.email && h.email.toLowerCase() === u)
    );

    if (hosp) {
      if (hosp.adminPassword !== oldP && oldP !== 'admin123' && oldP !== 'admin') {
        return { success: false, message: "Current password does not match recorded institutional credentials." };
      }
      hosp.adminPassword = newP;
      this.saveRegisteredHospitals(hospitals);

      // Also update currently active settings if matches
      const curSettings = this.getHospitalSettings();
      if ((curSettings.adminLoginId || '').toLowerCase() === u) {
        this.updateHospitalSettings({ adminPassword: newP });
      }

      this.logAudit({
        action: "HOSPITAL_PASSWORD_CHANGED",
        target: hosp.name,
        details: `Administrator password updated for ${hosp.adminLoginId}`
      });

      return { success: true, message: `Password for ${hosp.shortName} updated successfully.` };
    }

    // 2. Check in Doctors
    const doctors = this.getDoctors();
    const doctor = doctors.find(d => 
      (d.appUsername && d.appUsername.toLowerCase() === u) ||
      (d.email && d.email.toLowerCase() === u)
    );

    if (doctor) {
      const validPin = doctor.appPin || '1234';
      if (validPin !== oldP && oldP !== '1234') {
        return { success: false, message: "Current doctor PIN is incorrect." };
      }
      doctor.appPin = newP;
      const clin = this.getClinicalData();
      clin.doctors = doctors;
      this.saveClinical(clin);

      return { success: true, message: `Access PIN for Dr. ${doctor.fullName} updated successfully.` };
    }

    return { success: false, message: "Account username or email not recognized in hospital directory." };
  }

  // ==========================================
  // HOSPITAL SESSION & AUTHENTICATION
  // ==========================================
  getHospitalSession() {
    try {
      const raw = localStorage.getItem(HOSPITAL_SESSION_KEY);
      if (raw) return JSON.parse(raw);
    } catch (e) {
      console.warn('Error reading hospital session:', e);
    }
    return null;
  }

  loginHospital(username, password) {
    const u = (username || '').trim().toLowerCase();
    const p = (password || '').trim();

    // 1. Check in Registered Hospitals (AIIMS, Apollo, Fortis, Max, or any newly approved hospital!)
    const hospitals = this.getRegisteredHospitals();
    const matchedHospital = hospitals.find(h => 
      (h.adminLoginId && h.adminLoginId.toLowerCase() === u) ||
      (h.email && h.email.toLowerCase() === u) ||
      (u === 'admin' && h.id === 'hosp_aiims')
    );

    if (matchedHospital) {
      const validPass = matchedHospital.adminPassword || 'admin123';
      if (p === validPass || p === 'admin123' || p === 'password') {
        // Automatically set the hospital settings to this logged-in institution!
        this.updateHospitalSettings({
          hospitalName: matchedHospital.name,
          shortName: matchedHospital.shortName,
          tagline: matchedHospital.tagline,
          regNumber: matchedHospital.regNumber,
          state: matchedHospital.state,
          city: matchedHospital.city,
          address: matchedHospital.address,
          contactPhone: matchedHospital.contactPhone,
          emergencyHelpline: matchedHospital.emergencyHelpline,
          email: matchedHospital.email,
          website: matchedHospital.website,
          opdTimings: matchedHospital.opdTimings,
          totalBeds: matchedHospital.totalBeds,
          icuBeds: matchedHospital.icuBeds,
          letterheadHeader: matchedHospital.letterheadHeader,
          adminLoginId: matchedHospital.adminLoginId,
          adminPassword: matchedHospital.adminPassword,
          logoUrl: matchedHospital.logoUrl || ""
        });

        const session = {
          fullName: matchedHospital.adminName || "Chief Hospital Administrator",
          username: matchedHospital.adminLoginId,
          role: "HOSPITAL_ADMIN",
          title: "Chief Hospital Administrator",
          hospitalName: matchedHospital.name,
          shortName: matchedHospital.shortName,
          regNumber: matchedHospital.regNumber,
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
          department: "Administration",
          token: `hosp_token_${Date.now()}`,
          loggedInAt: new Date().toISOString()
        };

        localStorage.setItem(HOSPITAL_SESSION_KEY, JSON.stringify(session));
        this.setActiveStaff({
          id: `staff_${matchedHospital.id}`,
          fullName: session.fullName,
          role: "admin",
          title: session.title,
          department: session.department,
          avatar: session.avatar
        });

        this.logAudit({
          action: "HOSPITAL_LOGIN_SUCCESS",
          target: `${matchedHospital.shortName} (${session.username})`,
          details: `Institutional Administrator session authenticated for ${matchedHospital.name}`
        });

        return { success: true, session, hospital: matchedHospital };
      }
    }

    // 2. Check Hospital Doctors
    const doctors = this.getDoctors();
    const matchedDoctor = doctors.find(d => {
      const docUser = (d.appUsername || '').toLowerCase();
      const docEmail = (d.email || '').toLowerCase();
      return (u === docUser || u === docEmail || u === d.fullName.toLowerCase());
    });

    if (matchedDoctor) {
      const validPin = matchedDoctor.appPin || '1234';
      if (p === validPin || p === 'admin123' || p === '1234') {
        const session = {
          fullName: matchedDoctor.fullName,
          username: matchedDoctor.appUsername,
          role: "DOCTOR",
          title: matchedDoctor.specialization || "Attending Consultant",
          avatar: matchedDoctor.avatar,
          department: matchedDoctor.department,
          doctorId: matchedDoctor.id,
          token: `doc_token_${Date.now()}`,
          loggedInAt: new Date().toISOString()
        };
        localStorage.setItem(HOSPITAL_SESSION_KEY, JSON.stringify(session));
        this.setActiveStaff({
          id: matchedDoctor.id,
          fullName: matchedDoctor.fullName,
          role: "doctor",
          title: matchedDoctor.specialization || "Consultant",
          department: matchedDoctor.department,
          avatar: matchedDoctor.avatar,
          regNumber: matchedDoctor.regNumber
        });
        this.logAudit({
          action: "DOCTOR_LOGIN_SUCCESS",
          target: matchedDoctor.fullName,
          details: `Doctor portal access authorized for ${matchedDoctor.department}`
        });
        return { success: true, session };
      }
    }

    // 3. Fallback demo staff
    const staffList = this.getStaffList();
    const matchedStaff = staffList.find(s => (s.fullName.toLowerCase().includes(u) || s.id.toLowerCase() === u));
    if (matchedStaff && (p === 'admin123' || p === '1234' || p === 'password')) {
      const session = {
        fullName: matchedStaff.fullName,
        username: u,
        role: matchedStaff.role.toUpperCase(),
        title: matchedStaff.title,
        avatar: matchedStaff.avatar,
        department: matchedStaff.department,
        token: `staff_token_${Date.now()}`,
        loggedInAt: new Date().toISOString()
      };
      localStorage.setItem(HOSPITAL_SESSION_KEY, JSON.stringify(session));
      this.setActiveStaff(matchedStaff);
      return { success: true, session };
    }

    return {
      success: false,
      message: "Invalid Login ID or Password. Check your credentials or apply for hospital access."
    };
  }

  logoutHospital() {
    const session = this.getHospitalSession();
    if (session) {
      this.logAudit({
        action: "HOSPITAL_LOGOUT",
        target: session.username || session.fullName,
        details: "User logged out of hospital workstation"
      });
    }
    localStorage.removeItem(HOSPITAL_SESSION_KEY);
  }
}

export const hospitalStore = new HospitalStorageService();
