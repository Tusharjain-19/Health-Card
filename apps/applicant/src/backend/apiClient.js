/**
 * HealthCard Applicant Portal: Dedicated Backend Client Service
 * Connects the Applicant / Citizen Portal to the Central Medical Server (Port 5000 / LAN IP).
 * Safe local store fallback preserved per user requirement.
 */

const getApiBaseUrl = () => {
  const customUrl = localStorage.getItem('healthcard_backend_url');
  if (customUrl) return customUrl;
  const host = (typeof window !== 'undefined' && window.location.hostname) || 'localhost';
  return `http://${host}:5000/api`;
};

class ApplicantBackendClient {
  constructor() {
    this.baseUrl = getApiBaseUrl();
  }

  setBaseUrl(url) {
    this.baseUrl = url;
    localStorage.setItem('healthcard_backend_url', url);
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'x-role': 'Applicant',
          ...(options.headers || {})
        },
        ...options
      });

      if (!response.ok) {
        throw new Error(`Applicant Backend request to ${endpoint} failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.warn(`[ApplicantBackend] Network error for ${endpoint}, falling back to local storage:`, error);
      return null;
    }
  }

  // System Health
  async getHealth() {
    return await this.request('/health');
  }

  // Members / Applicants
  async getMembers(query = '') {
    const q = query ? `?query=${encodeURIComponent(query)}` : '';
    return await this.request(`/members${q}`);
  }

  async getMemberById(id) {
    return await this.request(`/members/${encodeURIComponent(id)}`);
  }

  async registerMember(memberData) {
    return await this.request('/members', {
      method: 'POST',
      body: JSON.stringify(memberData)
    });
  }

  async updateMember(id, memberData) {
    return await this.request(`/members/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(memberData)
    });
  }

  // Cards & Issuance
  async getCards() {
    return await this.request('/cards');
  }

  async issueCard(cardData) {
    return await this.request('/cards', {
      method: 'POST',
      body: JSON.stringify(cardData)
    });
  }

  // Orders
  async getOrders() {
    return await this.request('/orders');
  }

  async createOrder(orderData) {
    return await this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
  }

  // Audit Logs
  async getAuditLogs() {
    return await this.request('/audit');
  }
}

export const applicantBackend = new ApplicantBackendClient();
