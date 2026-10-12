/**
 * HealthCard Centralized Node.js Backend Server
 * Provides REST APIs for Admin, Applicant, Doctor, Emergency, Hospital, Lab, and Patient Panels.
 * Enables real-time synchronization across multiple workstations on the local hospital network.
 * Port: 5000 (Configurable via PORT env)
 */
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-actor', 'x-hospital-id']
}));

// Generous payload limit to handle medical document, scan, and test report uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Data Directory and Persistent Store Path
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');

function ensureDirectories() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Helper to get local network IP addresses for multi-computer access
function getLocalNetworkIps() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  for (const name of Object.keys(interfaces)) {
    for (const net of interfaces[name] || []) {
      if (net.family === 'IPv4' && !net.internal) {
        addresses.push({ interface: name, ip: net.address });
      }
    }
  }
  return addresses;
}

// Master Seed Data with Hospital Doctors, Clinical Services, OPD Prescriptions, and IPD Rounds
const defaultData = {
  // Hospital Profile
  hospitalProfile: {
    id: "hosp_aiims_01",
    name: "All India Institute of Medical Sciences (AIIMS)",
    registrationNo: "HOSP-DL-00192",
    accreditation: "NABH Accredited Tertiary Care Center",
    address: "Ansari Nagar East, Gautam Nagar, New Delhi, Delhi 110029",
    phone: "+91 11 2658 8500",
    email: "clinical.services@aiims.gov.in",
    emergencyHelpline: "108 / 112",
    totalBeds: 2478,
    icuBeds: 280,
    activeDepartments: 28
  },

  // 1. Hospital Doctors Directory (Full CRUD)
  doctors: [
    {
      id: "doc_01",
      fullName: "Dr. Vikram Sethi",
      department: "Cardiology",
      specialization: "Interventional Cardiology & Cardiac Critical Care",
      qualification: "MBBS, MD (Medicine), DM (Cardiology), FACC",
      regNumber: "NMC/MCI-2004/09182",
      email: "dr.vikram@aiims.gov.in",
      phone: "+91 97234 56789",
      opdRoom: "OPD Room 204 (Cardiology Wing)",
      opdSchedule: "Mon, Wed, Fri (09:00 AM – 01:00 PM)",
      consultationFee: 0,
      avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80",
      status: "Active",
      createdAt: "2026-08-01T00:00:00Z"
    },
    {
      id: "doc_02",
      fullName: "Dr. Neha Kapoor",
      department: "Internal Medicine",
      specialization: "General Medicine, Diabetology & Metabolic Health",
      qualification: "MBBS, MD (Internal Medicine)",
      regNumber: "DMC-2011/48102",
      email: "dr.neha@aiims.gov.in",
      phone: "+91 98111 22334",
      opdRoom: "OPD Room 112 (General Medicine)",
      opdSchedule: "Tue, Thu, Sat (09:00 AM – 02:00 PM)",
      consultationFee: 0,
      avatar: "https://images.unsplash.com/photo-1594824813590-4890c5f242e2?w=150&auto=format&fit=crop&q=80",
      status: "Active",
      createdAt: "2026-08-05T00:00:00Z"
    },
    {
      id: "doc_03",
      fullName: "Dr. Amit Verma",
      department: "Emergency & Trauma",
      specialization: "Emergency Medicine, Resuscitation & Trauma Surgery",
      qualification: "MBBS, MS (General Surgery), FACEM",
      regNumber: "MMC-2015/38192",
      email: "dr.amit@aiims.gov.in",
      phone: "+91 98222 33445",
      opdRoom: "Emergency Trauma Bay 01",
      opdSchedule: "24x7 Emergency Shifts",
      consultationFee: 0,
      avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80",
      status: "Active",
      createdAt: "2026-08-10T00:00:00Z"
    },
    {
      id: "doc_04",
      fullName: "Dr. Sunita Rao",
      department: "Pulmonology",
      specialization: "Respiratory & Critical Care Medicine",
      qualification: "MBBS, MD (Pulmonary Medicine)",
      regNumber: "KMC-2012/10492",
      email: "dr.sunita.rao@aiims.gov.in",
      phone: "+91 98451 22339",
      opdRoom: "OPD Room 310 (Chest Clinic)",
      opdSchedule: "Mon, Thu (10:00 AM – 02:00 PM)",
      consultationFee: 0,
      avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80",
      status: "Active",
      createdAt: "2026-08-20T00:00:00Z"
    }
  ],

  // 2. Hospital Clinical Services Catalog (Full CRUD)
  services: [
    {
      id: "srv_01",
      code: "OPD-CONSULT",
      name: "Outpatient Clinical Consultation",
      department: "General Medicine / Specialty",
      category: "Consultation",
      standardFee: 50,
      description: "Comprehensive physical examination, history review, provisional diagnosis, and e-prescription issuance."
    },
    {
      id: "srv_02",
      code: "EMERG-RESUS",
      name: "Emergency Resuscitation & Trauma Stabilization",
      department: "Emergency & Trauma",
      category: "Emergency",
      standardFee: 250,
      description: "Immediate advanced life support, trauma airway management, rapid triage, and hemodynamic resuscitation."
    },
    {
      id: "srv_03",
      code: "IPD-GEN-BED",
      name: "Inpatient General Ward Bed & Nursing Care (Per Day)",
      department: "Inpatient Wards",
      category: "Inpatient",
      standardFee: 500,
      description: "Routine ward accommodation, daily resident physician rounds, 24/7 nursing vitals, and medication administration."
    },
    {
      id: "srv_04",
      code: "IPD-ICU-BED",
      name: "Intensive Care Unit (ICU) Critical Bed (Per Day)",
      department: "Critical Care",
      category: "Inpatient",
      standardFee: 2500,
      description: "Dedicated intensive care bed with continuous multi-channel cardiac telemetry, invasive arterial monitoring, and 1:1 nursing."
    },
    {
      id: "srv_05",
      code: "DIAG-ECG-12",
      name: "12-Lead Resting Electrocardiogram (ECG)",
      department: "Cardiology",
      category: "Diagnostics",
      standardFee: 150,
      description: "High-resolution computerized 12-lead resting cardiac rhythm and ST-segment evaluation."
    },
    {
      id: "srv_06",
      code: "RAD-CHEST-PA",
      name: "Digital Chest Radiograph (X-Ray PA View)",
      department: "Radiology",
      category: "Imaging",
      standardFee: 200,
      description: "Digital radiographic evaluation of pulmonary parenchyma, pleural spaces, and cardiothoracic silhouette."
    },
    {
      id: "srv_07",
      code: "LAB-HBA1C",
      name: "HbA1c (Glycated Hemoglobin HPLC Test)",
      department: "Biochemistry",
      category: "Laboratory",
      standardFee: 300,
      description: "Standardized gold-standard HPLC automated estimation of 3-month glycemic control."
    },
    {
      id: "srv_08",
      code: "LAB-LIPID",
      name: "Complete Lipid Profile (Cholesterol, LDL, HDL, Triglycerides)",
      department: "Biochemistry",
      category: "Laboratory",
      standardFee: 350,
      description: "Fractionated automated lipid analysis for cardiovascular risk stratification."
    }
  ],

  // 3. Registered Patients / Monorepo Members
  members: [
    {
      id: "mem_001",
      applicationRef: "APP-20260915-1082",
      healthId: "74839 16251",
      fullName: "Rahul Sharma",
      dob: "1988-04-12",
      gender: "Male",
      mobile: "9876543210",
      email: "rahul.sharma@example.com",
      bloodGroup: "O+",
      address: {
        street: "42, Green Park Avenue",
        city: "New Delhi",
        state: "Delhi",
        pinCode: "110016"
      },
      emergencyContact: {
        name: "Pooja Sharma",
        relation: "Spouse",
        phone: "9876543211"
      },
      status: "Active",
      photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
      kyc: {
        documentType: "Aadhaar Card",
        documentNumber: "5829 4018 9201",
        status: "Verified"
      },
      createdAt: "2026-09-15T10:30:00Z"
    },
    {
      id: "mem_002",
      applicationRef: "APP-20260918-3491",
      healthId: "81920 34719",
      fullName: "Ananya Deshmukh",
      dob: "1994-11-28",
      gender: "Female",
      mobile: "9812345678",
      email: "ananya.d@example.com",
      bloodGroup: "B+",
      address: {
        street: "12B, Bandra West",
        city: "Mumbai",
        state: "Maharashtra",
        pinCode: "400050"
      },
      emergencyContact: {
        name: "Sanjay Deshmukh",
        relation: "Father",
        phone: "9812345679"
      },
      status: "Active",
      photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
      kyc: {
        documentType: "Voter ID",
        documentNumber: "EPIC9482014",
        status: "Verified"
      },
      createdAt: "2026-09-18T14:15:00Z"
    },
    {
      id: "mem_004",
      applicationRef: "APP-20260925-8812",
      healthId: "90218 54310",
      fullName: "Sunita Patel",
      dob: "1962-01-19",
      gender: "Female",
      mobile: "9654321098",
      email: "sunita.patel@example.com",
      bloodGroup: "AB+",
      address: {
        street: "15, Navrangpura",
        city: "Ahmedabad",
        state: "Gujarat",
        pinCode: "380009"
      },
      emergencyContact: {
        name: "Amit Patel",
        relation: "Son",
        phone: "9654321099"
      },
      status: "Active",
      photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
      kyc: {
        documentType: "Driving License",
        documentNumber: "DL-042011001928",
        status: "Verified"
      },
      createdAt: "2026-09-25T11:45:00Z"
    }
  ],

  // 4. Issued Physical Cards
  cards: [
    {
      id: "card_001",
      memberId: "mem_001",
      healthId: "74839 16251",
      serialNumber: "74839 16251",
      token: "tok_7483916251",
      tokenHash: "hash_7483916251",
      templateId: "teal_standard",
      status: "Active",
      issuedAt: "2026-09-15T11:00:00Z",
      activatedAt: "2026-09-16T09:20:00Z"
    },
    {
      id: "card_002",
      memberId: "mem_002",
      healthId: "81920 34719",
      serialNumber: "81920 34719",
      token: "tok_8192034719",
      tokenHash: "hash_8192034719",
      templateId: "slate_enterprise",
      status: "Active",
      issuedAt: "2026-09-18T14:30:00Z",
      activatedAt: "2026-09-19T10:15:00Z"
    },
    {
      id: "card_004",
      memberId: "mem_004",
      healthId: "90218 54310",
      serialNumber: "90218 54310",
      token: "tok_9021854310",
      tokenHash: "hash_9021854310",
      templateId: "teal_standard",
      status: "Active",
      issuedAt: "2026-09-25T12:00:00Z",
      activatedAt: "2026-09-26T09:00:00Z"
    }
  ],

  // 5. OPD Consultations & Prescriptions (with doctor selection & uploaded reports)
  consultations: [
    {
      id: "cns_001",
      healthId: "74839 16251",
      doctorId: "doc_01",
      doctorName: "Dr. Vikram Sethi",
      department: "Cardiology",
      facility: "AIIMS New Delhi — Cardiology OPD",
      date: "2026-09-28T10:30:00Z",
      chiefComplaint: "Routine 6-month cardiovascular and diabetic review. Occasional mild fatigue.",
      duration: "3 weeks",
      examination: "Well oriented, conscious. S1, S2 heard normal. Chest clear bilaterally. Per abdomen soft. Pedal pulses palpable.",
      vitals: { bpSys: 126, bpDia: 82, pulse: 74, spo2: 98, temp: 98.4, weight: 76.2 },
      diagnoses: [
        { code: "I10", name: "Essential (Primary) Hypertension" },
        { code: "E11.9", name: "Type 2 Diabetes Mellitus" }
      ],
      prescriptions: [
        { drug: "Telmisartan", dosage: "40 mg", frequency: "OD", timing: "Morning after food", days: 90 },
        { drug: "Metformin SR", dosage: "500 mg", frequency: "BD", timing: "After meals", days: 90 },
        { drug: "Atorvastatin", dosage: "10 mg", frequency: "OD (HS)", timing: "At bedtime", days: 90 }
      ],
      investigationsOrdered: ["HbA1c", "Lipid Profile", "Serum Creatinine"],
      uploadedReports: [
        { name: "Prior_Lipid_Profile_Report.pdf", size: "240 KB", uploadedAt: "2026-09-28T10:35:00Z" }
      ],
      advice: "Maintain low sodium diet (<5g/day). 30 mins brisk walk daily. Review with reports in 2 weeks.",
      followUpDate: "2026-10-15",
      verification: "provider_verified"
    }
  ],

  // 6. Inpatient Admissions (IPD) — daily procedures, dose tracker, reports
  admissions: [
    {
      id: "adm_001",
      healthId: "74839 16251",
      memberName: "Rahul Sharma",
      bloodGroup: "O+",
      ward: "General Medical Ward",
      bedNumber: "Bed GW-14",
      admittingDoctorId: "doc_01",
      admittingDoctor: "Dr. Vikram Sethi",
      admittedAt: "2026-08-12T09:30:00Z",
      dischargedAt: "2026-08-15T15:00:00Z",
      status: "Discharged",
      admittingDiagnosis: "Acute Viral Gastroenteritis with Dehydration",
      finalDiagnosis: "Acute Infective Gastroenteritis (Resolved), Hypokalemia (Corrected)",
      courseSummary: "Patient managed with IV fluid rehydration, antiemetics, and electrolyte correction. Discharged stable.",
      days: [
        {
          dayNo: 1,
          date: "2026-08-12",
          doctorNote: "Patient arrived with vomiting and loose stools. IV access established. IV fluids initiated. Electrolytes sent.",
          nurseNote: "Vitals: BP 106/70, Pulse 98. Output 450ml in 6h. Infusion running smoothly.",
          proceduresDone: "Peripheral IV Cannulation 20G left forearm, Intravenous Rehydration therapy, Stool analysis collection.",
          medsDoses: [
            { drug: "IV Ondansetron", dose: "4 mg", route: "IV", time: "10:00 AM", status: "Given", nurse: "Sister Rekha" },
            { drug: "IV Pantoprazole", dose: "40 mg", route: "IV", time: "10:15 AM", status: "Given", nurse: "Sister Rekha" },
            { drug: "IV Ringer Lactate", dose: "1000 mL", route: "IV Infusion", time: "11:00 AM", status: "Given", nurse: "Sister Rekha" }
          ],
          testReports: [
            { name: "Serum_Electrolytes_Day1.pdf", value: "Na: 136, K: 3.4 mEq/L (Low)", uploadedAt: "2026-08-12T13:00:00Z" }
          ]
        },
        {
          dayNo: 2,
          date: "2026-08-13",
          doctorNote: "Vomiting subsided. Diarrhea controlled. Potassium normalized to 3.9 mEq/L. Shifted to oral fluids.",
          nurseNote: "Vitals: BP 118/76, Pulse 82. Tolerating soft diet well. Ambulated comfortably.",
          proceduresDone: "Electrolyte review, dietary advancement to oral fluids, discontinuation of IV fluids.",
          medsDoses: [
            { drug: "Oral Probiotic Spores", dose: "2 Billion", route: "Oral", time: "08:30 AM", status: "Given", nurse: "Nurse Sunita" },
            { drug: "Oral ORS Fluid", dose: "1000 mL", route: "Oral", time: "12:00 PM", status: "Given", nurse: "Nurse Sunita" }
          ],
          testReports: [
            { name: "Serum_Electrolytes_Day2_Normal.pdf", value: "K: 3.9 mEq/L (Normal)", uploadedAt: "2026-08-13T11:00:00Z" }
          ]
        }
      ],
      dischargeMeds: [
        { drug: "Oral Probiotic Spores", dosage: "2 Billion Spores", frequency: "BD", days: 5 },
        { drug: "Oral Zinc Gluconate", dosage: "20 mg", frequency: "OD", days: 7 }
      ],
      dischargeAdvice: "Avoid outside food for 10 days. Continue boiled water. Resume routine Telmisartan."
    }
  ],

  // 7. Clinical Audit Logs
  auditLogs: [
    {
      id: "aud_001",
      timestamp: new Date().toISOString(),
      actor: "Dr. Vikram Sethi (Cardiology)",
      role: "Doctor",
      action: "OPD_CONSULTATION_SAVED",
      target: "Rahul Sharma (74839 16251)",
      details: "Authored consultation cns_001 with 3 Rx items and 3 lab orders",
      status: "Success",
      ipAddress: "127.0.0.1"
    }
  ]
};

function loadDatabase() {
  ensureDirectories();
  if (fs.existsSync(DATA_FILE)) {
    try {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(content);
      return {
        hospitalProfile: parsed.hospitalProfile || defaultData.hospitalProfile,
        doctors: parsed.doctors || defaultData.doctors,
        services: parsed.services || defaultData.services,
        members: parsed.members || defaultData.members,
        cards: parsed.cards || defaultData.cards,
        consultations: parsed.consultations || defaultData.consultations,
        admissions: parsed.admissions || defaultData.admissions,
        auditLogs: parsed.auditLogs || defaultData.auditLogs
      };
    } catch (e) {
      console.error('Error reading store.json, using default database:', e);
      return defaultData;
    }
  } else {
    fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2));
    return defaultData;
  }
}

function saveDatabase(data) {
  ensureDirectories();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data || db, null, 2));
}

let db = loadDatabase();

// ============================================================================
// REST API ROUTES
// ============================================================================

// 1. System Health & Network Workstation Info (For multiple computer access)
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'HealthCard Central Medical Server',
    version: '2.0.0',
    port: PORT,
    timestamp: new Date().toISOString(),
    networkIps: getLocalNetworkIps()
  });
});

app.get('/api/hospital/network-info', (req, res) => {
  const ips = getLocalNetworkIps();
  res.json({
    serverPort: PORT,
    hospitalPortalPort: 3004,
    adminPortalPort: 3000,
    applicantPortalPort: 3001,
    doctorPortalPort: 3002,
    emergencyPortalPort: 3003,
    laboratoryPortalPort: 3005,
    patientPortalPort: 3006,
    networkAddresses: ips.map(i => ({
      interface: i.interface,
      ip: i.ip,
      hospitalUrl: `http://${i.ip}:3004/`,
      apiUrl: `http://${i.ip}:${PORT}/api`
    }))
  });
});

// 2. Hospital Profile & Statistics
app.get('/api/hospital/profile', (req, res) => {
  res.json(db.hospitalProfile);
});

app.put('/api/hospital/profile', (req, res) => {
  Object.assign(db.hospitalProfile, req.body, { updatedAt: new Date().toISOString() });
  saveDatabase(db);
  res.json(db.hospitalProfile);
});

app.get('/api/stats', (req, res) => {
  res.json({
    totalMembers: db.members.length,
    activeCards: db.cards.filter(c => c.status === 'Active').length,
    activeDoctors: db.doctors.filter(d => d.status === 'Active').length,
    activeServices: db.services.length,
    totalConsultations: db.consultations.length,
    activeAdmissions: db.admissions.filter(a => a.status === 'Active Inpatient').length,
    totalDischarged: db.admissions.filter(a => a.status === 'Discharged').length,
    recentAudit: db.auditLogs.slice(-6).reverse()
  });
});

// 3. DOCTORS MANAGEMENT (Full CRUD per Item 3)
app.get('/api/hospital/doctors', (req, res) => {
  const { department, status } = req.query;
  let list = db.doctors;
  if (department && department !== 'All') list = list.filter(d => d.department === department);
  if (status) list = list.filter(d => d.status === status);
  res.json(list);
});

app.post('/api/hospital/doctors', (req, res) => {
  const { fullName, department, specialization, qualification, regNumber, email, phone, opdRoom, opdSchedule, consultationFee } = req.body;
  if (!fullName || !department) {
    return res.status(400).json({ error: 'Doctor Full Name and Department are required' });
  }

  const newDoctor = {
    id: `doc_${Date.now()}`,
    fullName: fullName.trim(),
    department,
    specialization: specialization || `${department} Specialist`,
    qualification: qualification || 'MBBS',
    regNumber: regNumber || `NMC-${Date.now().toString().slice(-6)}`,
    email: email || '',
    phone: phone || '',
    opdRoom: opdRoom || 'OPD Consultation Room',
    opdSchedule: opdSchedule || 'Mon - Fri (09:00 AM – 01:00 PM)',
    consultationFee: Number(consultationFee) || 0,
    avatar: req.body.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`,
    status: 'Active',
    createdAt: new Date().toISOString()
  };

  db.doctors.push(newDoctor);
  db.auditLogs.unshift({
    id: `aud_${Date.now()}`,
    timestamp: new Date().toISOString(),
    actor: req.headers['x-actor'] || 'Hospital Administrator',
    role: 'Admin',
    action: 'DOCTOR_ONBOARDED',
    target: `${newDoctor.fullName} (${newDoctor.regNumber})`,
    details: `Added to ${newDoctor.department}. OPD: ${newDoctor.opdRoom}`,
    status: 'Success'
  });

  saveDatabase(db);
  res.status(201).json(newDoctor);
});

app.put('/api/hospital/doctors/:id', (req, res) => {
  const doctor = db.doctors.find(d => d.id === req.params.id);
  if (!doctor) return res.status(404).json({ error: 'Doctor not found' });

  Object.assign(doctor, req.body, { updatedAt: new Date().toISOString() });
  saveDatabase(db);
  res.json(doctor);
});

app.delete('/api/hospital/doctors/:id', (req, res) => {
  const idx = db.doctors.findIndex(d => d.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Doctor not found' });

  const removed = db.doctors.splice(idx, 1)[0];
  saveDatabase(db);
  res.json({ success: true, removed });
});

// 4. HOSPITAL SERVICES MANAGEMENT (Full CRUD per Item 3)
app.get('/api/hospital/services', (req, res) => {
  res.json(db.services);
});

app.post('/api/hospital/services', (req, res) => {
  const { name, code, department, category, standardFee, description } = req.body;
  if (!name || !category) return res.status(400).json({ error: 'Service name and category required' });

  const newService = {
    id: `srv_${Date.now()}`,
    name,
    code: code || `SRV-${Date.now().toString().slice(-4)}`,
    department: department || 'Clinical',
    category,
    standardFee: Number(standardFee) || 0,
    description: description || ''
  };

  db.services.push(newService);
  saveDatabase(db);
  res.status(201).json(newService);
});

app.put('/api/hospital/services/:id', (req, res) => {
  const service = db.services.find(s => s.id === req.params.id);
  if (!service) return res.status(404).json({ error: 'Service not found' });

  Object.assign(service, req.body);
  saveDatabase(db);
  res.json(service);
});

app.delete('/api/hospital/services/:id', (req, res) => {
  const idx = db.services.findIndex(s => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Service not found' });

  const removed = db.services.splice(idx, 1)[0];
  saveDatabase(db);
  res.json({ success: true, removed });
});

// 5. OPD PRESCRIPTIONS & CONSULTATIONS (with Reports Upload per Item 3)
app.get('/api/hospital/consultations', (req, res) => {
  const { healthId } = req.query;
  let list = db.consultations;
  if (healthId) {
    const clean = healthId.replace(/\s+/g, '');
    list = list.filter(c => (c.healthId || '').replace(/\s+/g, '') === clean);
  }
  res.json(list);
});

app.post('/api/hospital/consultations', (req, res) => {
  const { healthId, doctorId, chiefComplaint, examination, vitals, diagnoses, prescriptions, investigationsOrdered, uploadedReports, advice, followUpDate } = req.body;
  if (!healthId) return res.status(400).json({ error: 'Patient Health ID required' });

  const doctor = db.doctors.find(d => d.id === doctorId) || db.doctors[0];

  const newConsultation = {
    id: `cns_${Date.now()}`,
    healthId,
    doctorId: doctor ? doctor.id : null,
    doctorName: doctor ? doctor.fullName : (req.body.doctorName || 'Attending Clinician'),
    department: doctor ? doctor.department : (req.body.department || 'Clinical OPD'),
    facility: db.hospitalProfile.name,
    date: new Date().toISOString(),
    chiefComplaint: chiefComplaint || 'Routine medical review',
    duration: req.body.duration || '1 week',
    examination: examination || 'Clinical observations recorded.',
    vitals: vitals || {},
    diagnoses: diagnoses || [],
    prescriptions: prescriptions || [],
    investigationsOrdered: investigationsOrdered || [],
    uploadedReports: uploadedReports || [],
    advice: advice || 'Continue prescribed therapy.',
    followUpDate: followUpDate || null,
    verification: 'provider_verified'
  };

  db.consultations.unshift(newConsultation);

  db.auditLogs.unshift({
    id: `aud_${Date.now()}`,
    timestamp: new Date().toISOString(),
    actor: newConsultation.doctorName,
    role: 'Doctor',
    action: 'OPD_CONSULTATION_SAVED',
    target: `Patient ${newConsultation.healthId}`,
    details: `Consultation recorded with ${newConsultation.prescriptions.length} prescribed drugs and ${newConsultation.uploadedReports.length} reports attached.`,
    status: 'Success'
  });

  saveDatabase(db);
  res.status(201).json(newConsultation);
});

app.put('/api/hospital/consultations/:id', (req, res) => {
  const consult = db.consultations.find(c => c.id === req.params.id);
  if (!consult) return res.status(404).json({ error: 'Consultation not found' });

  Object.assign(consult, req.body, { updatedAt: new Date().toISOString() });
  saveDatabase(db);
  res.json(consult);
});

// 6. INPATIENT ADMISSIONS (IPD) — Procedures, MAR Doses & Test Reports (per Item 3)
app.get('/api/hospital/admissions', (req, res) => {
  const { status, healthId } = req.query;
  let list = db.admissions;
  if (status) list = list.filter(a => a.status === status);
  if (healthId) {
    const clean = healthId.replace(/\s+/g, '');
    list = list.filter(a => (a.healthId || '').replace(/\s+/g, '') === clean);
  }
  res.json(list);
});

app.post('/api/hospital/admissions', (req, res) => {
  const { healthId, memberName, ward, bedNumber, admittingDoctorId, admittingDiagnosis, initialDoctorNote, serviceId } = req.body;
  if (!healthId || !ward) return res.status(400).json({ error: 'Health ID and Ward required' });

  const doctor = db.doctors.find(d => d.id === admittingDoctorId) || db.doctors[0];
  const member = db.members.find(m => m.healthId.replace(/\s+/g, '') === healthId.replace(/\s+/g, ''));

  const newAdmission = {
    id: `adm_${Date.now()}`,
    healthId,
    memberName: memberName || (member ? member.fullName : 'Inpatient'),
    bloodGroup: member ? member.bloodGroup : 'O+',
    ward,
    bedNumber: bedNumber || `Bed-${Math.floor(10 + Math.random()*89)}`,
    admittingDoctorId: doctor ? doctor.id : null,
    admittingDoctor: doctor ? doctor.fullName : 'Attending Consultant',
    serviceId: serviceId || null,
    admittedAt: new Date().toISOString(),
    dischargedAt: null,
    status: 'Active Inpatient',
    admittingDiagnosis: admittingDiagnosis || 'Inpatient Evaluation',
    finalDiagnosis: 'Active Course Under Observation',
    courseSummary: 'Patient admitted for specialized inpatient monitoring and therapy.',
    days: [
      {
        dayNo: 1,
        date: new Date().toISOString().slice(0, 10),
        doctorNote: initialDoctorNote || 'Patient admitted to ward. Baseline workup underway.',
        nurseNote: 'Vitals stable on admission. Primary nursing team assigned.',
        proceduresDone: 'Ward intake assessment, vital telemetry, IV access setup.',
        medsDoses: [],
        testReports: []
      }
    ],
    dischargeMeds: [],
    dischargeAdvice: ''
  };

  db.admissions.unshift(newAdmission);

  db.auditLogs.unshift({
    id: `aud_${Date.now()}`,
    timestamp: new Date().toISOString(),
    actor: newAdmission.admittingDoctor,
    role: 'Doctor',
    action: 'PATIENT_ADMITTED',
    target: `${newAdmission.memberName} (${newAdmission.healthId})`,
    details: `Admitted to ${newAdmission.ward} (${newAdmission.bedNumber}). Diagnosis: ${newAdmission.admittingDiagnosis}`,
    status: 'Success'
  });

  saveDatabase(db);
  res.status(201).json(newAdmission);
});

// Update admission or add daily round / dose / procedures / reports
app.post('/api/hospital/admissions/:id/rounds', (req, res) => {
  const adm = db.admissions.find(a => a.id === req.params.id);
  if (!adm) return res.status(404).json({ error: 'Admission not found' });

  const { doctorNote, nurseNote, proceduresDone, medsDoses, testReports } = req.body;
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
    if (medsDoses && medsDoses.length) dayRecord.medsDoses.push(...medsDoses);
    if (testReports && testReports.length) dayRecord.testReports.push(...testReports);
  }

  saveDatabase(db);
  res.json(adm);
});

// Inpatient Discharge
app.post('/api/hospital/admissions/:id/discharge', (req, res) => {
  const adm = db.admissions.find(a => a.id === req.params.id);
  if (!adm) return res.status(404).json({ error: 'Admission not found' });

  const { finalDiagnosis, courseSummary, dischargeMeds, dischargeAdvice } = req.body;
  adm.status = 'Discharged';
  adm.dischargedAt = new Date().toISOString();
  if (finalDiagnosis) adm.finalDiagnosis = finalDiagnosis;
  if (courseSummary) adm.courseSummary = courseSummary;
  if (dischargeMeds) adm.dischargeMeds = dischargeMeds;
  if (dischargeAdvice) adm.dischargeAdvice = dischargeAdvice;

  saveDatabase(db);
  res.json(adm);
});

// Update Inpatient Admission Details (Bed, Ward, Diagnosis, Attending Doctor, etc.)
app.put('/api/hospital/admissions/:id', (req, res) => {
  const adm = db.admissions.find(a => a.id === req.params.id);
  if (!adm) return res.status(404).json({ error: 'Admission not found' });

  Object.assign(adm, req.body, { updatedAt: new Date().toISOString() });
  saveDatabase(db);
  res.json(adm);
});

// Delete / Cancel Admission
app.delete('/api/hospital/admissions/:id', (req, res) => {
  const idx = db.admissions.findIndex(a => a.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Admission not found' });

  const removed = db.admissions.splice(idx, 1)[0];
  saveDatabase(db);
  res.json({ success: true, removed });
});

// 7. General Member / Patient Lookup & CRUD
app.get('/api/members', (req, res) => {
  const { query } = req.query;
  let list = db.members;
  if (query) {
    const q = query.toLowerCase().replace(/\s+/g, '');
    list = list.filter(m => 
      m.fullName.toLowerCase().includes(query.toLowerCase()) ||
      m.healthId.replace(/\s+/g, '').includes(q) ||
      (m.mobile && m.mobile.includes(q))
    );
  }
  res.json(list);
});

app.put('/api/members/:id', (req, res) => {
  const member = db.members.find(m => m.id === req.params.id || m.healthId.replace(/\s+/g, '') === req.params.id.replace(/\s+/g, ''));
  if (!member) return res.status(404).json({ error: 'Member not found' });

  Object.assign(member, req.body, { updatedAt: new Date().toISOString() });
  saveDatabase(db);
  res.json(member);
});

// 8. Audit Trail API
app.get('/api/audit', (req, res) => {
  res.json(db.auditLogs);
});

// Start Express Server on 0.0.0.0 so all computers on LAN can connect!
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[HealthCard Backend] Central Medical Server listening on port ${PORT}`);
    const ips = getLocalNetworkIps();
    console.log(`[HealthCard Backend] Localhost: http://localhost:${PORT}`);
    ips.forEach(ip => {
      console.log(`[HealthCard Backend] LAN Workstation Access: http://${ip.ip}:${PORT}/api`);
    });
  });
}

export default app;
