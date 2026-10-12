export const DEFAULT_SEED_MEMBERS = [
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
    address: { street: "42, Green Park Avenue", city: "New Delhi", state: "Delhi", pinCode: "110016" },
    emergencyContact: { name: "Pooja Sharma", relation: "Spouse", phone: "9876543211" },
    status: "Active",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    kyc: { documentType: "Aadhaar Card", documentNumber: "5829 4018 9201", status: "Verified" }
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
    address: { street: "12B, Bandra West", city: "Mumbai", state: "Maharashtra", pinCode: "400050" },
    emergencyContact: { name: "Sanjay Deshmukh", relation: "Father", phone: "9812345679" },
    status: "Active",
    photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80",
    kyc: { documentType: "Voter ID", documentNumber: "EPIC9482014", status: "Verified" }
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
    address: { street: "15, Navrangpura", city: "Ahmedabad", state: "Gujarat", pinCode: "380009" },
    emergencyContact: { name: "Amit Patel", relation: "Son", phone: "9654321099" },
    status: "Active",
    photoUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80",
    kyc: { documentType: "Driving License", documentNumber: "DL-042011001928", status: "Verified" }
  }
];

export const DEFAULT_SEED_CARDS = [
  {
    id: "card_001",
    memberId: "mem_001",
    healthId: "74839 16251",
    serialNumber: "74839 16251",
    token: "tok_7483916251",
    status: "Active",
    template: "teal",
    qrCodeUrl: "https://hc.national.gov.in/c/7483916251"
  },
  {
    id: "card_002",
    memberId: "mem_002",
    healthId: "81920 34719",
    serialNumber: "81920 34719",
    token: "tok_8192034719",
    status: "Active",
    template: "slate",
    qrCodeUrl: "https://hc.national.gov.in/c/8192034719"
  },
  {
    id: "card_004",
    memberId: "mem_004",
    healthId: "90218 54310",
    serialNumber: "90218 54310",
    token: "tok_9021854310",
    status: "Active",
    template: "teal",
    qrCodeUrl: "https://hc.national.gov.in/c/9021854310"
  }
];



export const DEMO_HOSPITAL_STAFF = [
  {
    id: "doc_01",
    fullName: "Dr. Vikram Sethi",
    role: "doctor",
    title: "Chief Consultant Cardiologist",
    department: "Cardiology",
    regNumber: "NMC/MCI-2004/09182",
    email: "dr.vikram@aiims.gov.in",
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80",
    phone: "+91 97234 56789",
    mfaEnrolled: true,
    status: "Active"
  },
  {
    id: "doc_02",
    fullName: "Dr. Neha Kapoor",
    role: "doctor",
    title: "Senior Consultant Physician",
    department: "Internal Medicine",
    regNumber: "DMC-2011/48102",
    email: "dr.neha@aiims.gov.in",
    avatar: "https://images.unsplash.com/photo-1594824813590-4890c5f242e2?w=150&auto=format&fit=crop&q=80",
    phone: "+91 98111 22334",
    mfaEnrolled: true,
    status: "Active"
  },
  {
    id: "doc_03",
    fullName: "Dr. Amit Verma",
    role: "doctor",
    title: "Trauma & Emergency Specialist",
    department: "Emergency & Trauma",
    regNumber: "MMC-2015/38192",
    email: "dr.amit@aiims.gov.in",
    avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80",
    phone: "+91 98222 33445",
    mfaEnrolled: true,
    status: "Active"
  },
  {
    id: "nurse_01",
    fullName: "Sister Rekha Varghese",
    role: "nurse",
    title: "ICU & Inpatient Charge Nurse",
    department: "Critical Care & Inpatient Wards",
    regNumber: "INC-DL-98210",
    email: "rekha.v@aiims.gov.in",
    avatar: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=150&auto=format&fit=crop&q=80",
    phone: "+91 98333 44556",
    mfaEnrolled: true,
    status: "Active"
  },
  {
    id: "reception_01",
    fullName: "Priya Nair",
    role: "receptionist",
    title: "Front Desk & Triage Coordinator",
    department: "Central Patient Registration",
    regNumber: "STAFF-REC-104",
    email: "priya.nair@aiims.gov.in",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80",
    phone: "+91 98444 55667",
    mfaEnrolled: false,
    status: "Active"
  },
  {
    id: "admin_01",
    fullName: "Rajesh Sharma",
    role: "hospital_admin",
    title: "Medical Superintendent & Org Admin",
    department: "Hospital Administration",
    regNumber: "ADMIN-MS-001",
    email: "ms.sharma@aiims.gov.in",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    phone: "+91 98555 66778",
    mfaEnrolled: true,
    status: "Active"
  }
];

export const DEMO_CLINICAL_DEPARTMENTS = [
  { id: "dept_01", name: "Emergency & Trauma Center", code: "EMERG", activeDoctors: 4, waitingPatients: 3 },
  { id: "dept_02", name: "Cardiology & Cardiac Care", code: "CARDIO", activeDoctors: 6, waitingPatients: 8 },
  { id: "dept_03", name: "Internal Medicine", code: "MED", activeDoctors: 8, waitingPatients: 14 },
  { id: "dept_04", name: "Inpatient Wards & ICU", code: "IPD", activeDoctors: 5, waitingPatients: 12 },
  { id: "dept_05", name: "Orthopedics & Joint Care", code: "ORTHO", activeDoctors: 4, waitingPatients: 6 },
  { id: "dept_06", name: "Diagnostic Pathology & Lab", code: "LAB", activeDoctors: 3, waitingPatients: 19 }
];

export const DEFAULT_CLINICAL_DATABASE = {
  // Allergies mapped by patient Health ID (without spaces)
  allergies: {
    "7483916251": [
      {
        id: "alg_01",
        substance: "Penicillin & Beta-Lactams",
        category: "Drug",
        severity: "Severe (High Alert)",
        reaction: "Anaphylaxis, Laryngeal Edema & Urticaria",
        recordedAt: "2023-04-10T11:00:00Z",
        sourceOrg: "Apollo Hospitals, New Delhi",
        verification: "provider_verified"
      },
      {
        id: "alg_02",
        substance: "Aspirin & NSAIDs",
        category: "Drug",
        severity: "Moderate",
        reaction: "Bronchospasm & Facial Flushing",
        recordedAt: "2024-02-18T14:30:00Z",
        sourceOrg: "AIIMS New Delhi",
        verification: "provider_verified"
      }
    ],
    "8192034719": [
      {
        id: "alg_03",
        substance: "Sulfonamide Antibiotics (Sulfa Drugs)",
        category: "Drug",
        severity: "Moderate",
        reaction: "Generalized Maculopapular Rash",
        recordedAt: "2022-09-05T09:15:00Z",
        sourceOrg: "Lilavati Hospital, Mumbai",
        verification: "provider_verified"
      }
    ],
    "9021854310": [
      {
        id: "alg_04",
        substance: "Shellfish / Prawns",
        category: "Food",
        severity: "Severe",
        reaction: "Angioedema & Dyspnea",
        recordedAt: "2021-11-20T16:00:00Z",
        sourceOrg: "Sterling Hospital, Ahmedabad",
        verification: "provider_verified"
      }
    ]
  },

  // Active chronic conditions mapped by Health ID
  conditions: {
    "7483916251": [
      {
        id: "cnd_01",
        code: "I10",
        display: "Essential (Primary) Hypertension",
        category: "Cardiovascular",
        onsetDate: "2023-01-15",
        status: "Active / Controlled",
        sourceOrg: "AIIMS New Delhi",
        verification: "provider_verified"
      },
      {
        id: "cnd_02",
        code: "E11",
        display: "Type 2 Diabetes Mellitus (Without Complications)",
        category: "Endocrine",
        onsetDate: "2024-03-22",
        status: "Active / Under Diet & Meds",
        sourceOrg: "AIIMS New Delhi",
        verification: "provider_verified"
      },
      {
        id: "cnd_03",
        code: "E78.0",
        display: "Pure Hypercholesterolemia",
        category: "Metabolic",
        onsetDate: "2024-03-22",
        status: "Active",
        sourceOrg: "AIIMS New Delhi",
        verification: "provider_verified"
      }
    ],
    "8192034719": [
      {
        id: "cnd_04",
        code: "J30.1",
        display: "Allergic Rhinitis due to Pollen",
        category: "Respiratory",
        onsetDate: "2021-08-10",
        status: "Active / Seasonal",
        sourceOrg: "Lilavati Hospital, Mumbai",
        verification: "provider_verified"
      },
      {
        id: "cnd_05",
        code: "J45.2",
        display: "Mild Intermittent Asthma",
        category: "Respiratory",
        onsetDate: "2023-05-14",
        status: "Active",
        sourceOrg: "Lilavati Hospital, Mumbai",
        verification: "provider_verified"
      }
    ],
    "9021854310": [
      {
        id: "cnd_06",
        code: "M17.0",
        display: "Primary Osteoarthritis of Bilateral Knees",
        category: "Musculoskeletal",
        onsetDate: "2020-02-12",
        status: "Chronic / Managed",
        sourceOrg: "Sterling Hospital, Ahmedabad",
        verification: "provider_verified"
      },
      {
        id: "cnd_07",
        code: "E03.9",
        display: "Primary Hypothyroidism",
        category: "Endocrine",
        onsetDate: "2019-10-04",
        status: "Active / Controlled",
        sourceOrg: "Sterling Hospital, Ahmedabad",
        verification: "provider_verified"
      }
    ]
  },

  // Active medications mapped by Health ID
  medications: {
    "7483916251": [
      {
        id: "med_01",
        drug: "Telmisartan",
        dosage: "40 mg",
        frequency: "OD (Once Daily)",
        timing: "Morning after breakfast",
        startDate: "2023-01-20",
        prescribedBy: "Dr. Vikram Sethi (AIIMS)",
        status: "Active"
      },
      {
        id: "med_02",
        drug: "Metformin Sustained Release",
        dosage: "500 mg",
        frequency: "BD (Twice Daily)",
        timing: "After meals (Morning & Night)",
        startDate: "2024-03-25",
        prescribedBy: "Dr. Neha Kapoor (AIIMS)",
        status: "Active"
      },
      {
        id: "med_03",
        drug: "Atorvastatin",
        dosage: "10 mg",
        frequency: "OD (Bedtime)",
        timing: "At night before sleep",
        startDate: "2024-03-25",
        prescribedBy: "Dr. Vikram Sethi (AIIMS)",
        status: "Active"
      }
    ],
    "8192034719": [
      {
        id: "med_04",
        drug: "Montelukast + Levocetirizine",
        dosage: "10 mg / 5 mg",
        frequency: "OD (Night)",
        timing: "At bedtime",
        startDate: "2024-06-10",
        prescribedBy: "Dr. S. Mehta (Lilavati)",
        status: "Active"
      },
      {
        id: "med_05",
        drug: "Budesonide Dry Powder Inhaler",
        dosage: "200 mcg",
        frequency: "BD",
        timing: "Rinse mouth after inhalation",
        startDate: "2024-06-10",
        prescribedBy: "Dr. S. Mehta (Lilavati)",
        status: "Active"
      }
    ],
    "9021854310": [
      {
        id: "med_06",
        drug: "Levothyroxine Sodium",
        dosage: "50 mcg",
        frequency: "OD (Empty Stomach)",
        timing: "Early morning 30 mins before tea/breakfast",
        startDate: "2021-01-15",
        prescribedBy: "Dr. P. Shah (Sterling)",
        status: "Active"
      },
      {
        id: "med_07",
        drug: "Calcium Carbonate + Vitamin D3",
        dosage: "500 mg / 400 IU",
        frequency: "OD",
        timing: "After lunch",
        startDate: "2023-09-01",
        prescribedBy: "Dr. K. Patel (Sterling)",
        status: "Active"
      }
    ]
  },

  // Most recent recorded vitals
  vitals: {
    "7483916251": {
      bpSys: 126,
      bpDia: 82,
      pulse: 74,
      spo2: 98,
      temp: 98.4,
      respRate: 16,
      weight: 76.2,
      height: 175,
      bmi: 24.9,
      recordedAt: "2026-09-28T10:15:00Z",
      recordedBy: "Sister Rekha Varghese (AIIMS)"
    },
    "8192034719": {
      bpSys: 114,
      bpDia: 74,
      pulse: 78,
      spo2: 99,
      temp: 98.2,
      respRate: 15,
      weight: 58.0,
      height: 162,
      bmi: 22.1,
      recordedAt: "2026-09-20T11:45:00Z",
      recordedBy: "Nurse Pooja (Lilavati)"
    },
    "9021854310": {
      bpSys: 138,
      bpDia: 86,
      pulse: 70,
      spo2: 97,
      temp: 98.6,
      respRate: 17,
      weight: 68.5,
      height: 156,
      bmi: 28.1,
      recordedAt: "2026-09-25T09:30:00Z",
      recordedBy: "Nurse Anjali (Sterling)"
    }
  },

  // Historical consultations / OPD encounters
  consultations: [
    {
      id: "cns_001",
      healthId: "74839 16251",
      date: "2026-09-28T10:30:00Z",
      facility: "AIIMS New Delhi: Department of Cardiology",
      clinician: "Dr. Vikram Sethi",
      regNumber: "NMC/MCI-2004/09182",
      kind: "opd",
      chiefComplaint: "Routine 6-month cardiovascular and diabetic review. Occasional mild fatigue after exertion.",
      duration: "3 weeks",
      examination: "Well oriented, conscious. S1, S2 heard normal, no murmurs. Chest clear bilaterally, vesicular breath sounds. Per abdomen soft, non-tender. Bilateral pedal pulses palpable, no edema.",
      vitals: { bpSys: 126, bpDia: 82, pulse: 74, spo2: 98, temp: 98.4, weight: 76.2 },
      diagnoses: [
        { code: "I10", name: "Essential Hypertension (Well Controlled)" },
        { code: "E11.9", name: "Type 2 Diabetes Mellitus" }
      ],
      prescriptions: [
        { drug: "Telmisartan", dosage: "40 mg", frequency: "OD", timing: "Morning after breakfast", days: 90 },
        { drug: "Metformin SR", dosage: "500 mg", frequency: "BD", timing: "After meals", days: 90 },
        { drug: "Atorvastatin", dosage: "10 mg", frequency: "OD (HS)", timing: "At bedtime", days: 90 }
      ],
      investigationsOrdered: ["HbA1c", "Lipid Profile", "Serum Creatinine", "Urine Microalbumin"],
      advice: "Maintain low sodium diet (<5g/day). 30 mins brisk walk daily. Self-monitor fasting blood glucose twice weekly. Review with reports in 2 weeks.",
      followUpDate: "2026-10-15",
      verification: "provider_verified"
    },
    {
      id: "cns_002",
      healthId: "74839 16251",
      date: "2026-03-25T11:15:00Z",
      facility: "Apollo Multispeciality Hospitals, Bangalore",
      clinician: "Dr. Neha Kapoor",
      regNumber: "DMC-2011/48102",
      kind: "opd",
      chiefComplaint: "Mild polyuria and post-prandial heaviness. Borderline high blood sugar during executive health check.",
      duration: "1 month",
      examination: "Vitals stable. BMI 25.4. Thyroid normal, no lymphadenopathy. Cardiovascular and respiratory exams within normal limits.",
      vitals: { bpSys: 134, bpDia: 88, pulse: 76, spo2: 98, temp: 98.6, weight: 77.8 },
      diagnoses: [
        { code: "E11", name: "Type 2 Diabetes Mellitus (Newly Diagnosed)" },
        { code: "E78.0", name: "Hypercholesterolemia" }
      ],
      prescriptions: [
        { drug: "Metformin SR", dosage: "500 mg", frequency: "OD", timing: "After dinner", days: 30 },
        { drug: "Atorvastatin", dosage: "10 mg", frequency: "OD (HS)", timing: "At night", days: 30 }
      ],
      investigationsOrdered: ["Fasting Blood Sugar", "HbA1c", "Lipid Profile"],
      advice: "Diabetes educator counselling completed. Carbohydrate restricted diet initiated.",
      followUpDate: "2026-04-25",
      verification: "provider_verified"
    },
    {
      id: "cns_003",
      healthId: "81920 34719",
      date: "2026-06-10T14:00:00Z",
      facility: "Lilavati Hospital & Research Centre, Mumbai",
      clinician: "Dr. S. Mehta",
      regNumber: "MMC-2009/11928",
      kind: "opd",
      chiefComplaint: "Allergic nasal congestion, clear rhinorrhea, sneezing paroxysms, and nocturnal dry cough.",
      duration: "2 weeks",
      examination: "Bilateral nasal turbinates pale and edematous with clear discharge. Pharynx clear. Chest bilateral mild end-expiratory wheeze.",
      vitals: { bpSys: 114, bpDia: 74, pulse: 78, spo2: 99, temp: 98.2, weight: 58.0 },
      diagnoses: [
        { code: "J30.1", name: "Allergic Rhinitis" },
        { code: "J45.2", name: "Mild Intermittent Asthma" }
      ],
      prescriptions: [
        { drug: "Montelukast + Levocetirizine", dosage: "10 mg / 5 mg", frequency: "OD", timing: "At bedtime", days: 14 },
        { drug: "Budesonide Inhaler", dosage: "200 mcg", frequency: "BD", timing: "Morning & Night", days: 30 },
        { drug: "Fluticasone Nasal Spray", dosage: "50 mcg", frequency: "OD", timing: "2 sprays each nostril", days: 14 }
      ],
      investigationsOrdered: ["Complete Blood Count (Absolute Eosinophil Count)"],
      advice: "Avoid direct exposure to dust and room coolers. Steam inhalation twice daily.",
      followUpDate: "2026-06-25",
      verification: "provider_verified"
    }
  ],

  // Inpatient admissions (IPD)
  admissions: [
    {
      id: "adm_001",
      healthId: "74839 16251",
      memberName: "Rahul Sharma",
      bloodGroup: "O+",
      ward: "General Ward (Deluxe)",
      bedNumber: "Bed GW-14",
      admittedAt: "2026-08-12T09:30:00Z",
      dischargedAt: "2026-08-15T15:00:00Z",
      status: "Discharged",
      admittingDoctor: "Dr. Vikram Sethi",
      admittingDiagnosis: "Acute Viral Gastroenteritis with Moderate Dehydration & Electrolyte Imbalance",
      finalDiagnosis: "Acute Infective Gastroenteritis (Resolved), Hypokalemia (Corrected)",
      courseSummary: "Patient presented with acute onset watery diarrhea (6-7 episodes) and repeated vomiting with orthostatic dizziness. Successfully treated with intravenous isotonic fluid rehydration, antiemetics, and oral probiotics. Electrolytes normalized by Day 2. Patient tolerated soft diet by Day 3 and was discharged hemodynamically stable.",
      days: [
        {
          dayNo: 1,
          date: "2026-08-12",
          doctorNote: "Patient arrived via Emergency triage. Tachycardic, dry oral mucosa. IV access secured. IV Ringer Lactate 1000ml started over 4 hours. Stool routine and serum electrolytes sent.",
          nurseNote: "Vitals: BP 106/70, Pulse 98 bpm, Temp 99.1°F. IV line patent on left forearm. Urine output 450ml in first 6 hours.",
          medsAdministered: [
            { drug: "IV Ondansetron 4mg", time: "10:00 AM", nurse: "Sister Rekha" },
            { drug: "IV Pantoprazole 40mg", time: "10:15 AM", nurse: "Sister Rekha" },
            { drug: "IV Ringer Lactate 1000ml", time: "11:00 AM", nurse: "Sister Rekha" }
          ]
        },
        {
          dayNo: 2,
          date: "2026-08-13",
          doctorNote: "Vomiting subsided. Diarrhea reduced to 2 semi-formed stools. Potassium 3.8 mEq/L (normal). Shifted from IV to oral hydration (ORS) and soft bland diet.",
          nurseNote: "Vitals: BP 118/76, Pulse 82 bpm, Temp 98.4°F. Patient ambulating comfortably. Adequate oral intake.",
          medsAdministered: [
            { drug: "Oral Probiotic Capsule", time: "08:30 AM", nurse: "Nurse Sunita" },
            { drug: "Oral ORS 1 Liter", time: "12:00 PM", nurse: "Nurse Sunita" },
            { drug: "Oral Zinc 20mg", time: "02:00 PM", nurse: "Nurse Sunita" }
          ]
        },
        {
          dayNo: 3,
          date: "2026-08-14",
          doctorNote: "Patient feeling healthy and energetic. Normal bowel movement. Vitals completely stable. Planned for discharge tomorrow morning.",
          nurseNote: "Vitals: BP 122/80, Pulse 76 bpm. IV cannula removed. Ready for discharge counselling.",
          medsAdministered: [
            { drug: "Oral Probiotic Capsule", time: "08:30 AM", nurse: "Sister Rekha" },
            { drug: "Oral Zinc 20mg", time: "02:00 PM", nurse: "Sister Rekha" }
          ]
        }
      ],
      dischargeMeds: [
        { drug: "Bacillus clausii Probiotic Spores", dosage: "2 Billion Spores", frequency: "BD", days: 5 },
        { drug: "Zinc Gluconate", dosage: "20 mg", frequency: "OD", days: 7 },
        { drug: "Oral Rehydration Salts (ORS)", dosage: "1 Sachet in 1L water", frequency: "SOS", days: 3 }
      ],
      dischargeAdvice: "Avoid raw / outside food for 10 days. Continue boiled and cooled water. Resume routine blood pressure and diabetic medication."
    },
    {
      id: "adm_002",
      healthId: "90218 54310",
      memberName: "Sunita Patel",
      bloodGroup: "AB+",
      ward: "Orthopedic Care Unit",
      bedNumber: "Bed OR-06",
      admittedAt: "2026-10-10T08:00:00Z",
      dischargedAt: null,
      status: "Active Inpatient",
      admittingDoctor: "Dr. Amit Verma",
      admittingDiagnosis: "Right Knee Joint Effusion with Severe Osteoarthritis Exacerbation",
      finalDiagnosis: "Under Active Inpatient Evaluation",
      courseSummary: "Undergoing joint aspiration, anti-inflammatory therapy, and physical mobility evaluation.",
      days: [
        {
          dayNo: 1,
          date: "2026-10-10",
          doctorNote: "Right knee swollen, tender with palpable fluid collection. Diagnostic arthrocentesis performed under aseptic precautions. Sent for synovial fluid analysis.",
          nurseNote: "Vitals: BP 136/84, Pulse 72 bpm. Ice packs applied. Limb elevated on pillow. Pain score 7/10.",
          medsAdministered: [
            { drug: "IV Paracetamol 1g", time: "09:30 AM", nurse: "Sister Rekha" },
            { drug: "Oral Tramadol 50mg", time: "02:00 PM", nurse: "Sister Rekha" }
          ]
        },
        {
          dayNo: 2,
          date: "2026-10-11",
          doctorNote: "Knee effusion reduced by 60%. Synovial fluid non-inflammatory, crystal negative. Physical therapy range-of-motion exercises initiated.",
          nurseNote: "Vitals: BP 130/80, Pulse 70 bpm. Patient able to bear partial weight with walker. Pain score 3/10.",
          medsAdministered: [
            { drug: "Oral Paracetamol 650mg", time: "08:00 AM", nurse: "Nurse Sunita" },
            { drug: "Knee Cryotherapy Session", time: "11:30 AM", nurse: "Nurse Sunita" }
          ]
        }
      ],
      dischargeMeds: [],
      dischargeAdvice: ""
    }
  ],

  // Diagnostic investigations & structured lab results
  labResults: [
    {
      id: "lab_001",
      healthId: "74839 16251",
      testName: "HbA1c (Glycated Hemoglobin)",
      category: "Diabetes & Endocrinology",
      collectedAt: "2026-09-28T07:30:00Z",
      reportedAt: "2026-09-28T14:00:00Z",
      labOrg: "Dr. Lal PathLabs Central Facility, New Delhi",
      verifiedBy: "Dr. K. Saxena, MD (Pathology)",
      valueNum: 6.5,
      valueText: "6.5",
      unit: "%",
      refLow: 4.0,
      refHigh: 5.6,
      flag: "H", // High / Prediabetes / Diabetic target
      clinicalNote: "Target for adult diabetic: < 7.0%. Well controlled.",
      history: [
        { date: "2024-03-22", value: 7.8, flag: "H" },
        { date: "2025-02-15", value: 7.1, flag: "H" },
        { date: "2025-10-04", value: 6.8, flag: "H" },
        { date: "2026-09-28", value: 6.5, flag: "H" }
      ]
    },
    {
      id: "lab_002",
      healthId: "74839 16251",
      testName: "Fasting Blood Glucose",
      category: "Diabetes & Endocrinology",
      collectedAt: "2026-09-28T07:30:00Z",
      reportedAt: "2026-09-28T11:00:00Z",
      labOrg: "Dr. Lal PathLabs Central Facility, New Delhi",
      verifiedBy: "Dr. K. Saxena, MD (Pathology)",
      valueNum: 112,
      valueText: "112",
      unit: "mg/dL",
      refLow: 70,
      refHigh: 100,
      flag: "H",
      clinicalNote: "Impaired Fasting Glucose. Within target for treated diabetic.",
      history: [
        { date: "2024-03-22", value: 148, flag: "H" },
        { date: "2025-02-15", value: 126, flag: "H" },
        { date: "2025-10-04", value: 118, flag: "H" },
        { date: "2026-09-28", value: 112, flag: "H" }
      ]
    },
    {
      id: "lab_003",
      healthId: "74839 16251",
      testName: "Serum Creatinine",
      category: "Renal Function",
      collectedAt: "2026-09-28T07:30:00Z",
      reportedAt: "2026-09-28T12:30:00Z",
      labOrg: "Dr. Lal PathLabs Central Facility, New Delhi",
      verifiedBy: "Dr. K. Saxena, MD (Pathology)",
      valueNum: 0.92,
      valueText: "0.92",
      unit: "mg/dL",
      refLow: 0.70,
      refHigh: 1.30,
      flag: "N", // Normal
      clinicalNote: "Estimated GFR > 90 mL/min/1.73m². Normal renal clearance.",
      history: [
        { date: "2024-03-22", value: 0.95, flag: "N" },
        { date: "2025-10-04", value: 0.90, flag: "N" },
        { date: "2026-09-28", value: 0.92, flag: "N" }
      ]
    },
    {
      id: "lab_004",
      healthId: "74839 16251",
      testName: "Lipid Profile: LDL Cholesterol",
      category: "Lipid Panel",
      collectedAt: "2026-09-28T07:30:00Z",
      reportedAt: "2026-09-28T14:30:00Z",
      labOrg: "Dr. Lal PathLabs Central Facility, New Delhi",
      verifiedBy: "Dr. K. Saxena, MD (Pathology)",
      valueNum: 94,
      valueText: "94",
      unit: "mg/dL",
      refLow: 0,
      refHigh: 100,
      flag: "N",
      clinicalNote: "Optimal for high-risk diabetic patient (<100 mg/dL).",
      history: [
        { date: "2024-03-22", value: 142, flag: "H" },
        { date: "2025-02-15", value: 118, flag: "H" },
        { date: "2025-10-04", value: 104, flag: "H" },
        { date: "2026-09-28", value: 94, flag: "N" }
      ]
    },
    {
      id: "lab_005",
      healthId: "81920 34719",
      testName: "Absolute Eosinophil Count (AEC)",
      category: "Hematology & Allergy",
      collectedAt: "2026-06-10T08:00:00Z",
      reportedAt: "2026-06-10T12:00:00Z",
      labOrg: "Lilavati Diagnostic Services, Mumbai",
      verifiedBy: "Dr. M. Choksi, MD",
      valueNum: 580,
      valueText: "580",
      unit: "/mcL",
      refLow: 40,
      refHigh: 450,
      flag: "H",
      clinicalNote: "Mild peripheral eosinophilia consistent with allergic airway disease.",
      history: [
        { date: "2024-01-10", value: 410, flag: "N" },
        { date: "2026-06-10", value: 580, flag: "H" }
      ]
    }
  ],

  // Clinical documents & radiology vault
  documents: [
    {
      id: "doc_rec_01",
      healthId: "74839 16251",
      title: "Inpatient Discharge Summary Certificate",
      category: "Discharge Summary",
      date: "2026-08-15T15:00:00Z",
      orgName: "Apollo Multispeciality Hospitals, Bangalore",
      author: "Dr. Vikram Sethi, MD, DM",
      mime: "application/pdf",
      size: "248 KB",
      sha256: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
      verification: "provider_verified",
      previewText: "ADMISSION COURSE & DISCHARGE REPORT\nPatient Rahul Sharma admitted on 12-Aug-2026 for acute viral gastroenteritis with moderate dehydration. Successfully managed with IV hydration and antiemetics. Discharged stable on 15-Aug-2026 with oral probiotic regimen."
    },
    {
      id: "doc_rec_02",
      healthId: "74839 16251",
      title: "Chest X-Ray PA View (Digital Radiology)",
      category: "Radiology & Imaging",
      date: "2026-08-12T11:30:00Z",
      orgName: "Apollo Diagnostic Imaging",
      author: "Dr. R. Bannerjee, MD (Radiology)",
      mime: "image/jpeg",
      size: "1.4 MB",
      sha256: "8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4",
      verification: "provider_verified",
      previewText: "RADIOLOGICAL REPORT: CHEST PA\nTrachea central. Bilateral lung fields clear. No focal consolidation, pneumothorax, or pleural effusion. Cardiothoracic ratio within normal limits (<0.5). Both costophrenic angles sharp. Impression: Normal Chest Radiograph."
    },
    {
      id: "doc_rec_03",
      healthId: "74839 16251",
      title: "12-Lead Electrocardiogram (ECG)",
      category: "Cardiology Investigation",
      date: "2026-09-28T10:20:00Z",
      orgName: "AIIMS New Delhi: Cardiology OPD",
      author: "Dr. Vikram Sethi",
      mime: "image/jpeg",
      size: "520 KB",
      sha256: "5d41402abc4b2a76b9719d911017c592",
      verification: "provider_verified",
      previewText: "12-LEAD RESTING ECG INTERPRETATION\nRate: 74 bpm. Rhythm: Normal sinus rhythm. PR Interval: 154 ms. QRS Duration: 88 ms. QT/QTc: 388/412 ms. Normal axis (+45°). No pathological Q waves or ST-T changes. Impression: Normal adult ECG."
    },
    {
      id: "doc_rec_04",
      healthId: "81920 34719",
      title: "Pulmonary Function Test (Spirometry)",
      category: "Pulmonary Diagnostics",
      date: "2026-06-10T11:00:00Z",
      orgName: "Lilavati Respiratory Lab, Mumbai",
      author: "Dr. S. Mehta",
      mime: "application/pdf",
      size: "380 KB",
      sha256: "a6c507c936087d7b3eb8538ef4cc0f3a",
      verification: "provider_verified",
      previewText: "SPIROMETRY REPORT\nFEV1: 84% predicted. FVC: 90% predicted. FEV1/FVC ratio: 78%. Post-bronchodilator test shows 14% improvement in FEV1 (+240ml). Impression: Reversible mild airway obstruction consistent with bronchial asthma."
    }
  ],

  // Access requests & active grants
  grants: [
    {
      id: "grt_001",
      healthId: "74839 16251",
      orgName: "AIIMS New Delhi",
      clinician: "Dr. Vikram Sethi",
      scopes: ["demographics", "allergies", "conditions", "medications", "encounters", "labs", "hospitalizations", "documents"],
      purpose: "opd",
      mode: "view_add",
      grantedAt: "2026-09-28T10:00:00Z",
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      status: "approved",
      consentMethod: "app"
    }
  ],

  // Hospital Audit Log Records
  auditLogs: [
    {
      id: "h_aud_001",
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      actor: "Dr. Vikram Sethi (Cardiologist)",
      role: "Doctor",
      action: "OPD_CONSULTATION_SAVED",
      target: "Patient Rahul Sharma (74839 16251)",
      details: "Created Consultation cns_001 with 3 Rx items and 4 lab orders",
      status: "Success"
    },
    {
      id: "h_aud_002",
      timestamp: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
      actor: "Priya Nair (Front Desk)",
      role: "Receptionist",
      action: "IDENTITY_CONFIRMED",
      target: "Patient Rahul Sharma (74839 16251)",
      details: "Physical card presented. In-person identity confirmed via photo & masked mobile match",
      status: "Success"
    },
    {
      id: "h_aud_003",
      timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
      actor: "Priya Nair (Front Desk)",
      role: "Receptionist",
      action: "RESOLVE_CARD_TOKEN",
      target: "Token tok_7483916251 via Live Camera QR",
      details: "Opaque token resolved. Masked identity returned to front desk triage",
      status: "Success"
    },
    {
      id: "h_aud_004",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      actor: "Sister Rekha Varghese",
      role: "Nurse",
      action: "WARD_VITALS_RECORDED",
      target: "Patient Sunita Patel (90218 54310)",
      details: "Bed OR-06: BP 130/80 mmHg, Pulse 70 bpm, Pain score 3/10",
      status: "Success"
    }
  ]
};

export const DEFAULT_HOSPITAL_DOCTORS = [
  {
    id: "doc_01",
    fullName: "Dr. Vikram Sethi",
    department: "Cardiology",
    specialization: "Interventional Cardiology & Preventive Medicine",
    qualification: "MBBS, MD (Medicine), DM (Cardiology), FACC",
    regNumber: "NMC/MCI-2004/09182",
    email: "dr.vikram@aiims.gov.in",
    phone: "+91 97234 56789",
    opdRoom: "OPD Suite 204 (Cardiology Wing)",
    opdSchedule: "Mon, Wed, Fri (09:00 AM – 01:00 PM)",
    consultationFee: 50,
    avatar: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80",
    status: "Active"
  },
  {
    id: "doc_02",
    fullName: "Dr. Neha Kapoor",
    department: "Internal Medicine",
    specialization: "Endocrinology & Diabetic Foot Management",
    qualification: "MBBS, MD (General Medicine)",
    regNumber: "DMC-2011/48102",
    email: "dr.neha@aiims.gov.in",
    phone: "+91 98111 22334",
    opdRoom: "OPD Room 108 (Medicine Block)",
    opdSchedule: "Tue, Thu, Sat (09:00 AM – 02:00 PM)",
    consultationFee: 50,
    avatar: "https://images.unsplash.com/photo-1594824813590-4890c5f242e2?w=150&auto=format&fit=crop&q=80",
    status: "Active"
  },
  {
    id: "doc_03",
    fullName: "Dr. Amit Verma",
    department: "Emergency & Trauma",
    specialization: "Emergency Medicine & Acute Trauma Resuscitation",
    qualification: "MBBS, MS (General Surgery), FACEM",
    regNumber: "MMC-2015/38192",
    email: "dr.amit@aiims.gov.in",
    phone: "+91 98222 33445",
    opdRoom: "Emergency Trauma Bay 01",
    opdSchedule: "24x7 Emergency Shifts",
    consultationFee: 0,
    avatar: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80",
    status: "Active"
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
    consultationFee: 50,
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80",
    status: "Active"
  }
];

export const DEFAULT_HOSPITAL_SERVICES = [
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
    category: "Diagnostic",
    standardFee: 300,
    description: "Standard 12-lead calibrated electrocardiography with computerized rhythm measurement and cardiologist review."
  },
  {
    id: "srv_06",
    code: "LAB-CBC",
    name: "Complete Blood Count with Differential (CBC)",
    department: "Pathology",
    category: "Laboratory",
    standardFee: 220,
    description: "Automated 5-part hematology analyzer count: Hb, RBC, WBC differential, Platelets, MCV, MCH, MCHC."
  },
  {
    id: "srv_07",
    code: "LAB-LIPID",
    name: "Comprehensive Lipid Profile",
    department: "Biochemistry",
    category: "Laboratory",
    standardFee: 450,
    description: "Total Cholesterol, Triglycerides, HDL, LDL, VLDL, and Total/HDL atherogenic ratio."
  },
  {
    id: "srv_08",
    code: "LAB-HBA1C",
    name: "Glycated Hemoglobin (HbA1c) Automated Assay",
    department: "Biochemistry",
    category: "Laboratory",
    standardFee: 400,
    description: "HPLC reference method for assessing 3-month mean glycemic control."
  },
  {
    id: "srv_09",
    code: "RAD-CHEST-XR",
    name: "Digital Chest Radiograph (X-Ray PA View)",
    department: "Radiology",
    category: "Radiology",
    standardFee: 350,
    description: "High-resolution digital radiography of thoracic cavity and cardiopulmonary structures."
  },
  {
    id: "srv_10",
    code: "SURG-APPEN",
    name: "Laparoscopic Appendectomy Procedure",
    department: "General Surgery",
    category: "Procedure",
    standardFee: 18000,
    description: "Minimally invasive laparoscopic removal of inflamed vermiform appendix under general anesthesia."
  }
];
