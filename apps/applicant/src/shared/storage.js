/**
 * HealthCard Centralized Store Interface for Citizen & Applicant Portal
 * Seamlessly interfaces with centralized storage (matching apps/admin)
 */

import { generateHealthId } from './healthId.js';
import { DEFAULT_APPLICANT_SEED } from './data/demoData.js';

const STORAGE_KEY = 'healthcard_v1_store';

class ApplicantStore {
  constructor() {
    this.data = this.load();
  }

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        return {
          members: parsed.members || DEFAULT_APPLICANT_SEED.members,
          cards: parsed.cards || DEFAULT_APPLICANT_SEED.cards,
          orders: parsed.orders || DEFAULT_APPLICANT_SEED.orders,
          auditLogs: parsed.auditLogs || []
        };
      }
    } catch (e) {
      console.warn('LocalStorage error, using seed data:', e);
    }
    this.save(DEFAULT_APPLICANT_SEED);
    return JSON.parse(JSON.stringify(DEFAULT_APPLICANT_SEED));
  }

  save(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data || this.data));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }

  refresh() {
    this.data = this.load();
  }

  // Lookup member by Mobile Number
  getMemberByMobile(mobile) {
    if (!mobile) return null;
    const clean = mobile.replace(/\D/g, '');
    return this.data.members.find(m => (m.mobile || '').replace(/\D/g, '') === clean) || null;
  }

  // Lookup member by Email Address
  getMemberByEmail(email) {
    if (!email) return null;
    const clean = email.toLowerCase().trim();
    return this.data.members.find(m => (m.email || '').toLowerCase().trim() === clean) || null;
  }

  // Lookup member by 10-Digit Health ID
  getMemberByHealthId(healthId) {
    if (!healthId) return null;
    const clean = healthId.replace(/\s+/g, '');
    return this.data.members.find(m => (m.healthId || '').replace(/\s+/g, '') === clean) || null;
  }

  // Lookup card by Member ID
  getCardByMemberId(memberId) {
    if (!memberId) return null;
    return this.data.cards.find(c => c.memberId === memberId) || null;
  }

  // Lookup order by Member ID
  getOrderByMemberId(memberId) {
    if (!memberId) return null;
    return this.data.orders.find(o => o.memberId === memberId) || null;
  }

  // Get Currently Logged-in Citizen User Session
  getCurrentUser() {
    try {
      const raw = localStorage.getItem('healthcard_active_user');
      if (raw) {
        const u = JSON.parse(raw);
        // Refresh member status if available
        if (u.mobile) {
          const mem = this.getMemberByMobile(u.mobile);
          if (mem) {
            u.hasApplication = true;
            u.healthId = mem.healthId;
            u.memberId = mem.id;
          }
        }
        return u;
      }
    } catch (e) {
      console.warn('Error reading active user:', e);
    }

    const activeMob = sessionStorage.getItem('healthcard_active_citizen_mobile');
    if (activeMob) {
      const member = this.getMemberByMobile(activeMob);
      if (member) {
        return {
          id: member.id,
          fullName: member.fullName,
          email: member.email,
          mobile: member.mobile,
          avatarUrl: member.photoUrl,
          provider: 'phone',
          healthId: member.healthId,
          hasApplication: true,
          memberId: member.id
        };
      }
    }
    return null;
  }

  // Set Currently Logged-in Citizen User
  setCurrentUser(user) {
    if (!user) {
      localStorage.removeItem('healthcard_active_user');
      sessionStorage.removeItem('healthcard_active_citizen_mobile');
      return;
    }
    localStorage.setItem('healthcard_active_user', JSON.stringify(user));
    if (user.mobile) {
      sessionStorage.setItem('healthcard_active_citizen_mobile', user.mobile);
    }
  }

  // Log Out Current Citizen User
  logoutUser() {
    localStorage.removeItem('healthcard_active_user');
    sessionStorage.removeItem('healthcard_active_citizen_mobile');
  }

  // Sign In / Create Account with Google
  loginWithGoogle(googleProfile) {
    this.refresh();
    const email = (googleProfile.email || '').toLowerCase().trim();
    const existingMember = this.getMemberByEmail(email);

    const user = {
      id: `usr_g_${Date.now()}`,
      fullName: googleProfile.name || 'Google Citizen',
      email: email,
      mobile: existingMember ? existingMember.mobile : (googleProfile.mobile || ''),
      avatarUrl: googleProfile.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(googleProfile.name || 'Citizen')}`,
      provider: 'google',
      hasApplication: !!existingMember,
      healthId: existingMember ? existingMember.healthId : null,
      memberId: existingMember ? existingMember.id : null,
      loggedInAt: new Date().toISOString()
    };

    this.setCurrentUser(user);
    return { user, existingMember };
  }

  // Create a New Citizen Account (Manual Registration)
  registerAccount({ fullName, email, mobile, password }) {
    this.refresh();
    const cleanEmail = (email || '').toLowerCase().trim();
    const cleanMobile = (mobile || '').replace(/\D/g, '');
    const existingMember = this.getMemberByMobile(cleanMobile) || this.getMemberByEmail(cleanEmail);

    const user = {
      id: `usr_${Date.now()}`,
      fullName: fullName.trim(),
      email: cleanEmail,
      mobile: cleanMobile,
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(fullName)}`,
      provider: 'account',
      hasApplication: !!existingMember,
      healthId: existingMember ? existingMember.healthId : null,
      memberId: existingMember ? existingMember.id : null,
      createdAt: new Date().toISOString()
    };

    if (password) {
      this.saveCredential(cleanEmail, password);
      if (cleanMobile) this.saveCredential(cleanMobile, password);
    }

    this.setCurrentUser(user);
    return { user, existingMember };
  }

  // Get Citizen Credentials Map
  getCredentials() {
    try {
      return JSON.parse(localStorage.getItem('healthcard_citizen_credentials') || '{}');
    } catch (e) {
      return {};
    }
  }

  // Save Citizen Password Credential
  saveCredential(identifier, password) {
    if (!identifier) return;
    const creds = this.getCredentials();
    const key = String(identifier).toLowerCase().trim();
    creds[key] = {
      password: password,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem('healthcard_citizen_credentials', JSON.stringify(creds));
  }

  // Verify Citizen Password Credential
  verifyPassword(identifier, password) {
    if (!identifier || !password) return false;
    const creds = this.getCredentials();
    const key = String(identifier).toLowerCase().trim();
    if (creds[key] && creds[key].password) {
      return creds[key].password === password;
    }
    // Accept valid password for demo accounts
    return password.length >= 4;
  }

  // Reset Citizen Password via Verified OTP
  resetPassword(identifier, newPassword) {
    this.refresh();
    const cleanId = String(identifier || '').trim().toLowerCase();
    const cleanMobile = cleanId.replace(/\D/g, '');
    const member = this.getMemberByEmail(cleanId) || (cleanMobile ? this.getMemberByMobile(cleanMobile) : null);

    this.saveCredential(cleanId, newPassword);
    if (cleanMobile) this.saveCredential(cleanMobile, newPassword);
    if (member) {
      if (member.email) this.saveCredential(member.email, newPassword);
      if (member.mobile) this.saveCredential(member.mobile, newPassword);
    }

    return { success: true, member };
  }

  // Sign in via Mobile Number
  loginWithMobile(mobile) {
    this.refresh();
    const cleanMobile = (mobile || '').replace(/\D/g, '');
    const existingMember = this.getMemberByMobile(cleanMobile);

    const user = {
      id: existingMember ? existingMember.id : `usr_${Date.now()}`,
      fullName: existingMember ? existingMember.fullName : `Citizen (+91 ${cleanMobile})`,
      email: existingMember ? existingMember.email : '',
      mobile: cleanMobile,
      avatarUrl: existingMember ? existingMember.photoUrl : `https://api.dicebear.com/7.x/initials/svg?seed=${cleanMobile}`,
      provider: 'otp',
      hasApplication: !!existingMember,
      healthId: existingMember ? existingMember.healthId : null,
      memberId: existingMember ? existingMember.id : null,
      loggedInAt: new Date().toISOString()
    };

    this.setCurrentUser(user);
    return { user, existingMember };
  }

  // Lookup application or order by Ref Number, Mobile, or Health ID
  lookupApplication(query) {
    if (!query) return null;
    const q = query.trim().toUpperCase().replace(/\s+/g, '');
    const cleanDigits = query.replace(/\D/g, '');

    // Search by orderNumber or applicationRef
    let order = this.data.orders.find(o => 
      (o.orderNumber || '').toUpperCase().replace(/\s+/g, '') === q ||
      (o.awbNumber || '').toUpperCase().replace(/\s+/g, '') === q
    );

    // Search by member Health ID or mobile
    if (!order) {
      const member = this.data.members.find(m => 
        (m.applicationRef || '').toUpperCase().replace(/\s+/g, '') === q ||
        (m.healthId || '').replace(/\s+/g, '') === q ||
        (cleanDigits.length >= 10 && (m.mobile || '').replace(/\D/g, '') === cleanDigits)
      );
      if (member) {
        order = this.data.orders.find(o => o.memberId === member.id) || {
          id: `ord_${Date.now()}`,
          orderNumber: member.applicationRef || `APP-20261001-${Math.floor(1000 + Math.random() * 9000)}`,
          memberId: member.id,
          memberName: member.fullName,
          healthId: member.healthId,
          cardType: "PVC-CR80",
          template: "teal",
          status: "requested",
          deliverySpeed: "India Post SpeedPost",
          awbNumber: `IN${Math.floor(100000000 + Math.random() * 900000000)}SP`,
          deliveryAddress: `${member.address?.street || ''}, ${member.address?.city || ''}, ${member.address?.state || ''} - ${member.address?.pinCode || ''}`,
          estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: member.createdAt || new Date().toISOString(),
          history: [
            { status: "requested", note: "Citizen online application submitted & identity tokenized", timestamp: member.createdAt || new Date().toISOString() }
          ]
        };
      }
    }

    if (order) {
      const member = this.data.members.find(m => m.id === order.memberId) || null;
      const card = this.data.cards.find(c => c.memberId === order.memberId) || null;
      return { order, member, card };
    }

    return null;
  }

  // Submit New Citizen Application
  submitApplication(formData) {
    this.refresh();

    // Check duplicate per PRD ID-03
    const cleanMobile = (formData.mobile || '').replace(/\D/g, '');
    const existing = this.data.members.find(m => (m.mobile || '').replace(/\D/g, '') === cleanMobile);
    if (existing) {
      console.warn('Existing member found with mobile:', cleanMobile);
    }

    const assignedHealthId = generateHealthId();
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const applicationRef = `APP-${dateStr}-${randomSuffix}`;
    const newMemberId = `mem_${Date.now()}`;

    const newMember = {
      id: newMemberId,
      applicationRef: applicationRef,
      healthId: assignedHealthId,
      fullName: formData.fullName,
      dob: formData.dob,
      gender: formData.gender,
      mobile: formData.mobile,
      email: formData.email,
      bloodGroup: formData.bloodGroup || "Unknown",
      photoUrl: formData.photoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(formData.fullName)}`,
      kyc: {
        documentType: formData.kycType || "Aadhaar Card",
        documentNumber: formData.kycNumber || "",
        isAadhaarVerified: !!formData.isAadhaarVerified,
        status: "Verified",
        verifiedAt: new Date().toISOString(),
        documentData: formData.kycDocData || null,
        documentName: formData.kycDocName || ""
      },
      address: {
        street: formData.address?.street || "",
        city: formData.address?.city || "",
        state: formData.address?.state || "Delhi",
        pinCode: formData.address?.pinCode || ""
      },
      emergencyContact: {
        name: formData.emergencyContact?.name || "",
        relation: formData.emergencyContact?.relation || "Family",
        phone: formData.emergencyContact?.phone || ""
      },
      status: "Active",
      createdAt: new Date().toISOString()
    };

    // Create Physical Card Record
    const newCardId = `c_${Date.now()}`;
    const newCard = {
      id: newCardId,
      memberId: newMemberId,
      healthId: assignedHealthId,
      cardNumber: assignedHealthId,
      serialNumber: assignedHealthId,
      status: "Pending",
      template: formData.cardTemplate || "teal",
      qrCodeUrl: `https://hc.national.gov.in/c/${Date.now().toString(36)}`,
      issuedAt: null
    };

    // Create Fulfillment Order
    const estimatedDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();
    const awb = `IN${Math.floor(100000000 + Math.random() * 900000000)}SP`;

    const newOrder = {
      id: `ord_${Date.now()}`,
      orderNumber: applicationRef,
      memberId: newMemberId,
      memberName: newMember.fullName,
      healthId: assignedHealthId,
      cardType: "PVC-CR80",
      template: formData.cardTemplate || "teal",
      status: "requested",
      deliverySpeed: "India Post SpeedPost (Insured Tracked Delivery)",
      awbNumber: awb,
      deliveryAddress: `${newMember.address.street}, ${newMember.address.city}, ${newMember.address.state} - ${newMember.address.pinCode}`,
      estimatedDelivery: estimatedDate,
      createdAt: new Date().toISOString(),
      history: [
        {
          status: "requested",
          note: `Citizen application submitted online. KYC (${newMember.kyc.documentType}) tokenized & cryptographic identity seal generated.`,
          timestamp: new Date().toISOString()
        }
      ],
      payment: formData.payment || {
        status: "PAID",
        amount: 50.00,
        currency: "INR",
        mode: "UPI / BHIM",
        transactionId: `TXN-${Date.now()}`,
        utr: `UTR${Math.floor(100000000000 + Math.random() * 900000000000)}`,
        paidAt: new Date().toISOString()
      }
    };
    newMember.payment = newOrder.payment;

    // Audit log
    const auditEntry = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: newMember.mobile,
      role: "Citizen Applicant",
      action: "APPLICATION_SUBMITTED",
      target: `Application ${applicationRef} registered with Health ID ${assignedHealthId}`,
      status: "Success"
    };

    this.data.members.unshift(newMember);
    this.data.cards.unshift(newCard);
    this.data.orders.unshift(newOrder);
    this.data.auditLogs.unshift(auditEntry);

    this.save();

    // Update active citizen session
    const currentUser = this.getCurrentUser();
    if (currentUser) {
      currentUser.hasApplication = true;
      currentUser.healthId = assignedHealthId;
      currentUser.memberId = newMemberId;
      if (!currentUser.mobile) currentUser.mobile = newMember.mobile;
      if (!currentUser.fullName) currentUser.fullName = newMember.fullName;
      this.setCurrentUser(currentUser);
    } else {
      this.setCurrentUser({
        id: newMemberId,
        fullName: newMember.fullName,
        email: newMember.email,
        mobile: newMember.mobile,
        avatarUrl: newMember.photoUrl,
        provider: 'application',
        hasApplication: true,
        healthId: assignedHealthId,
        memberId: newMemberId
      });
    }

    return {
      member: newMember,
      order: newOrder,
      card: newCard,
      applicationRef: applicationRef,
      healthId: assignedHealthId
    };
  }

  // Update member details from applicant portal
  updateMemberDetails(memberId, fields) {
    this.refresh();
    const member = this.data.members.find(m => m.id === memberId);
    if (!member) return null;

    Object.assign(member, fields, { updatedAt: new Date().toISOString() });
    
    // Sync order if updated
    const order = this.data.orders.find(o => o.memberId === memberId);
    if (order) {
      if (fields.fullName) {
        order.memberName = fields.fullName;
      }
      if (fields.address) {
        const addr = fields.address;
        order.deliveryAddress = `${addr.street || ''}, ${addr.city || ''}, ${addr.state || ''} - ${addr.pinCode || ''}`;
        if (!order.history) order.history = [];
        order.history.push({
          status: order.status,
          note: `Delivery routing updated by citizen: ${order.deliveryAddress}`,
          timestamp: new Date().toISOString()
        });
      }
    }

    this.save();
    return member;
  }
}

export const applicantStore = new ApplicantStore();
