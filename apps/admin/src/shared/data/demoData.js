/**
 * HealthCard — Dedicated Demonstration & Seed Dataset
 * 
 * This file serves as the single source of truth for mock/demo records,
 * separating demonstration data entirely from application logic and storage routines.
 */

export const DEMO_ADMIN_ACCOUNTS = [
  {
    id: "adm_01",
    email: "admin@healthcard.in",
    password: "DemoSecurePass123",
    role: "Super Admin",
    fullName: "Chief Medical Officer",
    department: "National Health Authority"
  },
  {
    id: "adm_02",
    email: "issuer@healthcard.in",
    password: "DemoSecurePass123",
    role: "Issuer Admin",
    fullName: "Card Issuance Lead",
    department: "National Printing & Distribution Bureau"
  },
  {
    id: "adm_03",
    email: "operator@healthcard.in",
    password: "DemoSecurePass123",
    role: "Card Operator",
    fullName: "Regional Enrolment Officer",
    department: "Delhi Central Enrolment Station"
  },
  {
    id: "adm_04",
    email: "auditor@healthcard.in",
    password: "DemoSecurePass123",
    role: "Compliance Auditor",
    fullName: "Vigilance Officer",
    department: "Security, Privacy & Audit Oversight"
  }
];

export const DEMO_MEMBERS = [
  {
    id: "mem_001",
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
      isAadhaarVerified: true,
      status: "Verified",
      verifiedAt: "2026-09-15T10:30:00Z"
    },
    createdAt: "2026-09-15T10:30:00Z"
  },
  {
    id: "mem_002",
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
      status: "Verified",
      verifiedAt: "2026-09-18T14:15:00Z"
    },
    createdAt: "2026-09-18T14:15:00Z"
  },
  {
    id: "mem_003",
    healthId: "65019 48203",
    fullName: "Dr. Vikram Sethi",
    dob: "1975-08-03",
    gender: "Male",
    mobile: "9723456789",
    email: "vikram.sethi@example.com",
    bloodGroup: "A+",
    address: {
      street: "88, Indiranagar 100ft Road",
      city: "Bengaluru",
      state: "Karnataka",
      pinCode: "560038"
    },
    emergencyContact: {
      name: "Meera Sethi",
      relation: "Spouse",
      phone: "9723456780"
    },
    status: "Active",
    photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    kyc: {
      documentType: "Passport",
      documentNumber: "Z9401824",
      status: "Verified",
      verifiedAt: "2026-09-22T09:00:00Z"
    },
    createdAt: "2026-09-22T09:00:00Z"
  },
  {
    id: "mem_004",
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
      status: "Verified",
      verifiedAt: "2026-09-25T11:45:00Z"
    },
    createdAt: "2026-09-25T11:45:00Z"
  },
  {
    id: "mem_005",
    healthId: "51239 88102",
    fullName: "Rajesh Kumar Nair",
    dob: "1990-06-15",
    gender: "Male",
    mobile: "9845123456",
    email: "rajesh.nair@example.com",
    bloodGroup: "O-",
    address: {
      street: "7/14 Marine Drive",
      city: "Kochi",
      state: "Kerala",
      pinCode: "682011"
    },
    emergencyContact: {
      name: "Deepa Nair",
      relation: "Sister",
      phone: "9845123457"
    },
    status: "Active",
    photoUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80",
    kyc: {
      documentType: "Aadhaar Card",
      documentNumber: "8492 1048 3918",
      isAadhaarVerified: true,
      status: "Verified",
      verifiedAt: "2026-09-27T08:15:00Z"
    },
    createdAt: "2026-09-27T08:15:00Z"
  },
  {
    id: "mem_006",
    healthId: "33891 70415",
    fullName: "Priya Sundaram",
    dob: "1999-03-24",
    gender: "Female",
    mobile: "9444123890",
    email: "priya.s@example.com",
    bloodGroup: "B-",
    address: {
      street: "24, Anna Salai",
      city: "Chennai",
      state: "Tamil Nadu",
      pinCode: "600002"
    },
    emergencyContact: {
      name: "K. Sundaram",
      relation: "Father",
      phone: "9444123891"
    },
    status: "Active",
    photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    kyc: {
      documentType: "PAN Card",
      documentNumber: "ABCDE1234F",
      status: "Verified",
      verifiedAt: "2026-09-29T14:20:00Z"
    },
    createdAt: "2026-09-29T14:20:00Z"
  }
];

export const DEMO_CARDS = [
  {
    id: "card_001",
    memberId: "mem_001",
    healthId: "74839 16251",
    cardNumber: "74839 16251",
    serialNumber: "74839 16251",
    token: "tok_a8f93c0192e47b8d",
    tokenHash: "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    templateId: "teal_standard",
    status: "Active",
    issuedAt: "2026-09-15T11:00:00Z",
    activatedAt: "2026-09-16T09:20:00Z",
    issuedBy: "Issuer Admin"
  },
  {
    id: "card_002",
    memberId: "mem_002",
    healthId: "81920 34719",
    cardNumber: "81920 34719",
    serialNumber: "81920 34719",
    token: "tok_f7e21a90c4b6381d",
    tokenHash: "f1a23b45c67d890ef123456789abcdef0123456789abcdef0123456789abcdef",
    templateId: "teal_standard",
    status: "Active",
    issuedAt: "2026-09-18T14:30:00Z",
    activatedAt: "2026-09-19T10:15:00Z",
    issuedBy: "Issuer Admin"
  },
  {
    id: "card_003",
    memberId: "mem_003",
    healthId: "65019 48203",
    cardNumber: "65019 48203",
    serialNumber: "65019 48203",
    token: "tok_b4c5d6e7f8a90123",
    tokenHash: "1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    templateId: "slate_executive",
    status: "Issued",
    issuedAt: "2026-09-22T09:30:00Z",
    activatedAt: null,
    issuedBy: "Issuer Admin"
  },
  {
    id: "card_004",
    memberId: "mem_005",
    healthId: "51239 88102",
    cardNumber: "51239 88102",
    serialNumber: "51239 88102",
    token: "tok_c981240fd712bc90",
    tokenHash: "a4f891b02938cf12948120394810293840192834019283401928340192834019",
    templateId: "blue_clinical",
    status: "Active",
    issuedAt: "2026-09-27T09:00:00Z",
    activatedAt: "2026-09-27T15:30:00Z",
    issuedBy: "Card Operator"
  }
];

export const DEMO_ORDERS = [
  {
    id: "ord_001",
    cardId: "card_001",
    memberId: "mem_001",
    recipientName: "Rahul Sharma",
    address: "42, Green Park Avenue, New Delhi, Delhi - 110016",
    status: "Delivered",
    courier: "BlueDart Express",
    trackingNumber: "BLD-894210948",
    createdAt: "2026-09-15T11:05:00Z",
    updatedAt: "2026-09-17T16:00:00Z"
  },
  {
    id: "ord_002",
    cardId: "card_002",
    memberId: "mem_002",
    recipientName: "Ananya Deshmukh",
    address: "12B, Bandra West, Mumbai, Maharashtra - 400050",
    status: "Delivered",
    courier: "Delhivery Surface",
    trackingNumber: "DLV-773829104",
    createdAt: "2026-09-18T14:35:00Z",
    updatedAt: "2026-09-20T12:30:00Z"
  },
  {
    id: "ord_003",
    cardId: "card_003",
    memberId: "mem_003",
    recipientName: "Dr. Vikram Sethi",
    address: "88, Indiranagar 100ft Road, Bengaluru, Karnataka - 560038",
    status: "Dispatched",
    courier: "DTDC Priority",
    trackingNumber: "DTDC-482019482",
    createdAt: "2026-09-22T09:35:00Z",
    updatedAt: "2026-09-23T10:00:00Z"
  },
  {
    id: "ord_004",
    cardId: "card_004",
    memberId: "mem_005",
    recipientName: "Rajesh Kumar Nair",
    address: "7/14 Marine Drive, Kochi, Kerala - 682011",
    status: "Printing",
    courier: "India Post Speed Post",
    trackingNumber: "SP-883019284IN",
    createdAt: "2026-09-27T09:10:00Z",
    updatedAt: "2026-09-28T11:00:00Z"
  }
];

export const DEMO_ORGANIZATIONS = [
  {
    id: "org_001",
    name: "All India Institute of Medical Sciences (AIIMS)",
    regNumber: "HOSP-DL-00192",
    type: "Super-Specialty Hospital",
    city: "New Delhi",
    state: "Delhi",
    status: "Verified",
    staffCount: 142,
    onboardedAt: "2026-08-01T00:00:00Z"
  },
  {
    id: "org_002",
    name: "Apollo Multispeciality Hospitals",
    regNumber: "HOSP-KA-00847",
    type: "Hospital & Diagnostics",
    city: "Bengaluru",
    state: "Karnataka",
    status: "Verified",
    staffCount: 88,
    onboardedAt: "2026-08-10T00:00:00Z"
  },
  {
    id: "org_003",
    name: "Dr. Lal PathLabs Central Facility",
    regNumber: "LAB-DL-00412",
    type: "Diagnostic Laboratory",
    city: "New Delhi",
    state: "Delhi",
    status: "Verified",
    staffCount: 35,
    onboardedAt: "2026-08-20T00:00:00Z"
  },
  {
    id: "org_004",
    name: "CityCare Polyclinic & Diagnostics",
    regNumber: "CLN-MH-00918",
    type: "Day Clinic",
    city: "Pune",
    state: "Maharashtra",
    status: "Pending KYC",
    staffCount: 6,
    onboardedAt: "2026-09-28T00:00:00Z"
  },
  {
    id: "org_005",
    name: "Fortis Escorts Heart Institute",
    regNumber: "HOSP-DL-00511",
    type: "Super-Specialty Hospital",
    city: "New Delhi",
    state: "Delhi",
    status: "Verified",
    staffCount: 110,
    onboardedAt: "2026-08-15T00:00:00Z"
  }
];

export const DEMO_AUDIT_LOGS = [
  {
    id: "aud_001",
    timestamp: "2026-10-01T08:30:12Z",
    actor: "admin@healthcard.in",
    role: "Issuer Admin",
    action: "CARD_ISSUED",
    target: "Card for Member 65019 48203",
    status: "Success",
    ipAddress: "103.24.12.8"
  },
  {
    id: "aud_002",
    timestamp: "2026-10-01T07:15:40Z",
    actor: "operator_04@healthcard.in",
    role: "Card Issuer Operator",
    action: "MEMBER_REGISTERED",
    target: "Member Sunita Patel (90218 54310)",
    status: "Success",
    ipAddress: "103.24.12.9"
  },
  {
    id: "aud_003",
    timestamp: "2026-09-30T16:45:00Z",
    actor: "system_fulfillment",
    role: "Fulfillment Service",
    action: "ORDER_STATUS_CHANGED",
    target: "Order ord_003 -> Dispatched (AWB: DTDC-482019482)",
    status: "Success",
    ipAddress: "127.0.0.1"
  },
  {
    id: "aud_004",
    timestamp: "2026-09-30T12:00:22Z",
    actor: "compliance@healthcard.in",
    role: "Super Admin",
    action: "ORG_VERIFIED",
    target: "Organization: Dr. Lal PathLabs Central Facility",
    status: "Success",
    ipAddress: "14.139.60.2"
  },
  {
    id: "aud_005",
    timestamp: "2026-09-29T11:18:05Z",
    actor: "admin@healthcard.in",
    role: "Issuer Admin",
    action: "CARD_ISSUED",
    target: "Card for Member 51239 88102",
    status: "Success",
    ipAddress: "103.24.12.8"
  }
];

export const DEMO_SEED_DATA = {
  members: DEMO_MEMBERS,
  cards: DEMO_CARDS,
  orders: DEMO_ORDERS,
  organizations: DEMO_ORGANIZATIONS,
  auditLogs: DEMO_AUDIT_LOGS
};
