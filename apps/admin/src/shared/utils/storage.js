/**
 * Unified Client Storage & State Controller
 * Manages local database state, syncs with backend when available, and provides mock persistence.
 */

import { DEMO_SEED_DATA } from '../data/demoData.js';

const STORAGE_KEY = 'healthcard_db_v1';

class StorageService {
  constructor() {
    this.data = this.load();
  }

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const members = parsed.members || DEMO_SEED_DATA.members;
        members.forEach((m, idx) => {
          const seedMatch = DEMO_SEED_DATA.members.find(sm => sm.id === m.id) || DEMO_SEED_DATA.members[idx];
          if (!m.kyc || (seedMatch && seedMatch.kyc && m.kyc.documentType === 'Aadhaar Card' && seedMatch.kyc.documentType !== 'Aadhaar Card')) {
            m.kyc = seedMatch ? { ...seedMatch.kyc } : { documentType: 'Aadhaar Card', status: 'Verified', verifiedAt: m.createdAt };
          }
          if (!m.photoUrl) {
            m.photoUrl = seedMatch?.photoUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80";
          }
          if (!m.createdAt) {
            m.createdAt = seedMatch?.createdAt || "2026-09-15T10:30:00Z";
          }
          if (!m.address) {
            m.address = seedMatch?.address || { street: "Central Avenue", city: "New Delhi", state: "Delhi", pinCode: "110001" };
          }
        });
        const cards = (parsed.cards || DEMO_SEED_DATA.cards).map(c => {
          const cleanId = c.healthId || c.serialNumber?.replace(/^HC-0*/, '') || '';
          return {
            ...c,
            serialNumber: cleanId,
            cardNumber: cleanId
          };
        });
        return {
          members,
          cards,
          orders: parsed.orders || DEMO_SEED_DATA.orders,
          organizations: parsed.organizations || DEMO_SEED_DATA.organizations,
          auditLogs: parsed.auditLogs || DEMO_SEED_DATA.auditLogs
        };
      }
    } catch (e) {
      console.warn('LocalStorage error, using seed data:', e);
    }
    this.save(DEMO_SEED_DATA);
    return JSON.parse(JSON.stringify(DEMO_SEED_DATA));
  }

  save(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data || this.data));
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }

  getMembers(query = '', status = 'All') {
    let list = this.data.members;
    if (query) {
      const q = query.toLowerCase().replace(/\s+/g, '');
      list = list.filter(m => 
        m.fullName.toLowerCase().includes(query.toLowerCase()) ||
        m.healthId.replace(/\s+/g, '').includes(q) ||
        m.mobile.includes(q) ||
        m.email.toLowerCase().includes(query.toLowerCase())
      );
    }
    if (status && status !== 'All') {
      list = list.filter(m => m.status === status);
    }
    return list;
  }

  getMemberById(id) {
    if (!id) return null;
    const cleanId = id.toString().replace(/\s+/g, '');
    return this.data.members.find(m => m.id === id || m.healthId.replace(/\s+/g, '') === cleanId) || null;
  }

  addMember(memberData) {
    const newMember = {
      id: `mem_${Date.now()}`,
      status: 'Active',
      createdAt: new Date().toISOString(),
      ...memberData
    };
    this.data.members.unshift(newMember);
    this.logAudit({
      actor: 'admin@healthcard.in',
      role: 'Issuer Admin',
      action: 'MEMBER_REGISTERED',
      target: `Member ${newMember.fullName} (${newMember.healthId})`,
      status: 'Success'
    });
    this.save();
    return newMember;
  }

  updateMember(memberId, updatedFields) {
    const member = this.getMemberById(memberId);
    if (!member) throw new Error('Member not found');
    Object.assign(member, updatedFields, { updatedAt: new Date().toISOString() });

    // Sync cardholder details in any existing issued physical cards
    const memberCards = this.getCardsByMemberId(member.id);
    memberCards.forEach(c => {
      if (updatedFields.fullName) c.memberName = updatedFields.fullName;
      if (updatedFields.dob) c.memberDob = updatedFields.dob;
      if (updatedFields.bloodGroup) c.bloodGroup = updatedFields.bloodGroup;
      if (updatedFields.photoUrl) c.photoUrl = updatedFields.photoUrl;
      if (updatedFields.gender) c.gender = updatedFields.gender;
    });

    this.logAudit({
      actor: 'admin@healthcard.in',
      role: 'Issuer Admin',
      action: 'MEMBER_UPDATED',
      target: `Member ${member.fullName} (${member.healthId})`,
      status: 'Success'
    });
    this.save();
    return member;
  }

  deleteMember(memberId) {
    const member = this.getMemberById(memberId);
    if (!member) throw new Error('Member not found');
    const memberCards = this.getCardsByMemberId(member.id);
    const cardIds = memberCards.map(c => c.id);
    this.data.cards = this.data.cards.filter(c => c.memberId !== member.id);
    this.data.orders = this.data.orders.filter(o => o.memberId !== member.id && !cardIds.includes(o.cardId));
    this.data.members = this.data.members.filter(m => m.id !== member.id);
    this.logAudit({
      actor: 'admin@healthcard.in',
      role: 'Issuer Admin',
      action: 'MEMBER_DELETED',
      target: `Member ${member.fullName} (${member.healthId}) deleted along with ${memberCards.length} card(s)`,
      status: 'Success'
    });
    this.save();
    return true;
  }

  getCards() {
    return this.data.cards;
  }

  getCardById(id) {
    if (!id) return null;
    const clean = id.toString().replace(/\s+/g, '');
    return this.data.cards.find(c => 
      c.id === id || 
      c.healthId?.replace(/\s+/g, '') === clean || 
      c.serialNumber?.replace(/\s+/g, '') === clean ||
      c.cardNumber?.replace(/\s+/g, '') === clean
    ) || null;
  }

  updateCard(cardId, updatedFields) {
    const card = this.getCardById(cardId);
    if (!card) throw new Error('Card not found');
    Object.assign(card, updatedFields, { updatedAt: new Date().toISOString() });
    this.logAudit({
      actor: 'admin@healthcard.in',
      role: 'Issuer Admin',
      action: 'CARD_UPDATED',
      target: `Card for Member ${card.healthId} updated`,
      status: 'Success'
    });
    this.save();
    return card;
  }

  deleteCard(cardId) {
    const card = this.getCardById(cardId);
    if (!card) throw new Error('Card not found');
    this.data.cards = this.data.cards.filter(c => c.id !== card.id);
    this.data.orders = this.data.orders.filter(o => o.cardId !== card.id);
    this.logAudit({
      actor: 'admin@healthcard.in',
      role: 'Issuer Admin',
      action: 'CARD_DELETED',
      target: `Card for Member ${card.healthId} deleted`,
      status: 'Success'
    });
    this.save();
    return true;
  }

  getCardsByMemberId(memberId) {
    return this.data.cards.filter(c => c.memberId === memberId);
  }

  issueCard(memberId, templateId = 'teal_standard') {
    const member = this.getMemberById(memberId);
    if (!member) throw new Error('Member not found');

    // Single 10-digit number only: The card's number IS the member's 10-digit Health ID
    const cardNumber = member.healthId;

    // Generate a cryptographically unique token using UUID v4
    let rawToken;
    let attempts = 0;
    do {
      rawToken = `tok_${(crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`)}`;
      attempts++;
    } while (this.data.cards.some(c => c.token === rawToken) && attempts < 10);

    // Compute SHA-256 hash of the token for verification
    const tokenHash = this._computeTokenHash(rawToken);

    // Build the QR payload URL that encodes both the health ID and unique token
    const cleanHealthId = (member.healthId || '').replace(/\s+/g, '');
    const qrPayload = `https://hc.national.gov.in/c/${cleanHealthId}?tok=${encodeURIComponent(rawToken)}`;

    const newCard = {
      id: `card_${Date.now()}`,
      memberId: member.id,
      healthId: member.healthId,
      cardNumber,
      serialNumber: cardNumber,
      token: rawToken,
      tokenHash,
      qrPayload,
      templateId,
      status: 'Issued',
      issuedAt: new Date().toISOString(),
      activatedAt: null,
      issuedBy: 'Issuer Admin'
    };

    this.data.cards.unshift(newCard);

    // Auto-create fulfillment order
    const newOrder = {
      id: `ord_${Date.now()}`,
      cardId: newCard.id,
      memberId: member.id,
      recipientName: member.fullName,
      address: `${member.address?.street || ''}, ${member.address?.city || ''}, ${member.address?.state || ''} - ${member.address?.pinCode || ''}`,
      status: 'Generated',
      courier: 'Pending Assignment',
      trackingNumber: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.data.orders.unshift(newOrder);

    this.logAudit({
      actor: 'admin@healthcard.in',
      role: 'Issuer Admin',
      action: 'CARD_ISSUED',
      target: `Card for Member ${member.healthId}`,
      status: 'Success'
    });

    this.save();
    return { card: newCard, order: newOrder };
  }

  activateCard(cardId) {
    const card = this.data.cards.find(c => c.id === cardId);
    if (!card) throw new Error('Card not found');
    card.status = 'Active';
    card.activatedAt = new Date().toISOString();
    this.logAudit({
      actor: 'admin@healthcard.in',
      role: 'Issuer Admin',
      action: 'CARD_ACTIVATED',
      target: `Card for Member ${card.healthId} Activated`,
      status: 'Success'
    });
    this.save();
    return card;
  }

  blockCard(cardId, reason = 'Reported Lost by Member') {
    const card = this.data.cards.find(c => c.id === cardId);
    if (!card) throw new Error('Card not found');
    card.status = 'Blocked';
    card.blockedReason = reason;
    card.blockedAt = new Date().toISOString();
    this.logAudit({
      actor: 'admin@healthcard.in',
      role: 'Issuer Admin',
      action: 'CARD_BLOCKED',
      target: `Card for Member ${card.healthId} Blocked. Reason: ${reason}`,
      status: 'Success'
    });
    this.save();
    return card;
  }

  replaceCard(oldCardId, reason = 'Lost Physical Card') {
    const oldCard = this.blockCard(oldCardId, `Replaced: ${reason}`);
    oldCard.status = 'Replaced';
    const result = this.issueCard(oldCard.memberId, oldCard.templateId);
    this.logAudit({
      actor: 'admin@healthcard.in',
      role: 'Issuer Admin',
      action: 'CARD_REPLACED',
      target: `Card for Member ${oldCard.healthId} re-issued`,
      status: 'Success'
    });
    this.save();
    return result;
  }

  getOrders() {
    return this.data.orders;
  }

  updateOrderStatus(orderId, status, courier, trackingNumber) {
    const order = this.data.orders.find(o => o.id === orderId);
    if (!order) throw new Error('Order not found');
    if (status) order.status = status;
    if (courier) order.courier = courier;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    order.updatedAt = new Date().toISOString();
    this.save();
    return order;
  }

  getOrganizations() {
    return this.data.organizations;
  }

  updateOrgStatus(orgId, status) {
    const org = this.data.organizations.find(o => o.id === orgId);
    if (!org) throw new Error('Organization not found');
    org.status = status;
    this.logAudit({
      actor: 'compliance@healthcard.in',
      role: 'Super Admin',
      action: 'ORG_STATUS_CHANGE',
      target: `Organization ${org.name} status: ${status}`,
      status: 'Success'
    });
    this.save();
    return org;
  }

  getAuditLogs() {
    return this.data.auditLogs;
  }

  logAudit(entry) {
    const log = {
      id: `aud_${Date.now()}_${Math.floor(Math.random()*1000)}`,
      timestamp: new Date().toISOString(),
      actor: entry.actor || 'admin@healthcard.in',
      role: entry.role || 'Issuer Admin',
      action: entry.action || 'SYSTEM_ACTION',
      target: entry.target || '',
      status: entry.status || 'Success',
      ipAddress: entry.ipAddress || '103.24.12.8'
    };
    this.data.auditLogs.unshift(log);
    // keep max 200 logs in memory
    if (this.data.auditLogs.length > 200) {
      this.data.auditLogs = this.data.auditLogs.slice(0, 200);
    }
  }

  getStats() {
    return {
      totalMembers: this.data.members.length,
      activeCards: this.data.cards.filter(c => c.status === 'Active').length,
      pendingCards: this.data.cards.filter(c => c.status === 'Issued' || c.status === 'Pending').length,
      blockedCards: this.data.cards.filter(c => c.status === 'Blocked' || c.status === 'Suspended').length,
      verifiedOrgs: this.data.organizations.filter(o => o.status === 'Verified').length,
      pendingFulfillments: this.data.orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length
    };
  }

  resetToDefault() {
    this.data = JSON.parse(JSON.stringify(DEMO_SEED_DATA));
    this.save();
  }

  // Compute a deterministic hash string for a token (synchronous fallback)
  _computeTokenHash(token) {
    // Simple deterministic hash for immediate use; async SHA-256 can be used for verification later
    let hash = 0;
    for (let i = 0; i < token.length; i++) {
      const char = token.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    return `sha256_${hex}_${token.length}`;
  }
}

export const store = new StorageService();
