/**
 * HealthCard Citizen & Applicant Portal — Master Demo & Seed Data
 * Centralized dummy dataset for testing, initial seeding, and quick authentication
 */

export const DEFAULT_APPLICANT_SEED = {
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
        isAadhaarVerified: true,
        documentName: "Aadhaar_Card_Front_Back.pdf",
        status: "Verified",
        verifiedAt: "2026-09-15T10:30:00Z"
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
      photoUrl: "/citizen_portrait.jpg",
      kyc: {
        documentType: "Voter ID",
        documentNumber: "EPIC9482014",
        isAadhaarVerified: false,
        documentName: "Voter_ID_Scan.jpg",
        status: "Verified",
        verifiedAt: "2026-09-18T14:15:00Z"
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
        isAadhaarVerified: false,
        documentName: "Driving_License_Copy.png",
        status: "Verified",
        verifiedAt: "2026-09-25T11:45:00Z"
      },
      createdAt: "2026-09-25T11:45:00Z"
    }
  ],
  cards: [
    {
      id: "card_001",
      memberId: "mem_001",
      healthId: "74839 16251",
      cardNumber: "74839 16251",
      serialNumber: "74839 16251",
      status: "Active",
      template: "teal",
      qrCodeUrl: "https://hc.national.gov.in/c/7483916251",
      issuedAt: "2026-09-16T11:00:00Z"
    },
    {
      id: "card_002",
      memberId: "mem_002",
      healthId: "81920 34719",
      cardNumber: "81920 34719",
      serialNumber: "81920 34719",
      status: "Active",
      template: "slate",
      qrCodeUrl: "https://hc.national.gov.in/c/8192034719",
      issuedAt: "2026-09-19T09:30:00Z"
    }
  ],
  orders: [
    {
      id: "ord_001",
      orderNumber: "APP-20260915-1082",
      memberId: "mem_001",
      memberName: "Rahul Sharma",
      healthId: "74839 16251",
      cardType: "PVC-CR80",
      template: "teal",
      status: "delivered",
      deliverySpeed: "India Post SpeedPost",
      awbNumber: "IN982183749SP",
      deliveryAddress: "42, Green Park Avenue, New Delhi, Delhi - 110016",
      estimatedDelivery: "2026-09-21T18:00:00Z",
      createdAt: "2026-09-15T10:35:00Z",
      history: [
        { status: "requested", note: "Citizen online application submitted", timestamp: "2026-09-15T10:35:00Z" },
        { status: "generated", note: "Card artwork and NTAG 424 DNA signature built", timestamp: "2026-09-15T12:00:00Z" },
        { status: "printing", note: "PVC laser-etching underway", timestamp: "2026-09-15T15:30:00Z" },
        { status: "dispatched", note: "Handed over to India Post SpeedPost (AWB: IN982183749SP)", timestamp: "2026-09-16T09:00:00Z" },
        { status: "delivered", note: "Delivered to citizen & verified by OTP", timestamp: "2026-09-19T14:20:00Z" }
      ]
    },
    {
      id: "ord_002",
      orderNumber: "APP-20260918-3491",
      memberId: "mem_002",
      memberName: "Ananya Deshmukh",
      healthId: "81920 34719",
      cardType: "PVC-CR80",
      template: "slate",
      status: "dispatched",
      deliverySpeed: "India Post SpeedPost",
      awbNumber: "IN847291039SP",
      deliveryAddress: "12B, Bandra West, Mumbai, Maharashtra - 400050",
      estimatedDelivery: "2026-10-04T18:00:00Z",
      createdAt: "2026-09-18T14:20:00Z",
      history: [
        { status: "requested", note: "Citizen online application submitted", timestamp: "2026-09-18T14:20:00Z" },
        { status: "generated", note: "Bureau identity verification approved", timestamp: "2026-09-18T16:00:00Z" },
        { status: "printing", note: "Card encoded with CMAC token", timestamp: "2026-09-19T10:00:00Z" },
        { status: "dispatched", note: "In transit via India Post SpeedPost", timestamp: "2026-09-20T08:30:00Z" }
      ]
    }
  ],
  auditLogs: []
};

/**
 * Quick Test Citizen Profiles for Login / Auth Views
 */
export const DEMO_CITIZEN_PROFILES = [
  {
    name: "Rahul Sharma",
    mobile: "9876543210",
    email: "rahul.sharma@example.com",
    healthId: "74839 16251",
    bloodGroup: "O+",
    badgeText: "Active Card",
    badgeClass: "badge-teal"
  },
  {
    name: "Ananya Deshmukh",
    mobile: "9812345678",
    email: "ananya.d@example.com",
    healthId: "81920 34719",
    bloodGroup: "B+",
    badgeText: "SpeedPost In Transit",
    badgeClass: "badge-blue"
  },
  {
    name: "Sunita Patel",
    mobile: "9654321098",
    email: "sunita.patel@example.com",
    healthId: "90218 54310",
    bloodGroup: "AB+",
    badgeText: "Verified Citizen",
    badgeClass: "badge-teal"
  }
];

/**
 * Pre-configured Google OAuth Profiles for Demonstration
 */
export const DEMO_GOOGLE_ACCOUNTS = [
  {
    name: "Tushar Sharma",
    email: "tushar.sharma.in@gmail.com",
    avatarInitial: "T",
    avatarBg: "#0f766e",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Tushar",
    badgeText: "Recommended",
    badgeClass: "badge-teal"
  },
  {
    name: "Priya Patel",
    email: "priya.patel.health@gmail.com",
    avatarInitial: "P",
    avatarBg: "#3b82f6",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Priya",
    badgeText: "",
    badgeClass: ""
  }
];
