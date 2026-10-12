/**
 * HealthCard Admin Portal — Dedicated Backend Client Service
 * Connects the Admin Panel to the Central Medical Server (Port 5000 / LAN IP).
 * Safe local store fallback preserved per user requirement.
 */

const getApiBaseUrl = () => {
  const customUrl = localStorage.getItem('healthcard_backend_url');
  if (customUrl) return customUrl;
  const host = (typeof window !== 'undefined' && window.location.hostname) || 'localhost';
  return `http://${host}:5000/api`;
};

class AdminBackendClient {
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
          'x-role': 'Admin',
          ...(options.headers || {})
        },
        ...options
      });

      if (!response.ok) {
        throw new Error(`Admin Backend request to ${endpoint} failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.warn(`[AdminBackend] Network error for ${endpoint}, falling back to local storage:`, error);
      return null;
    }
  }

  // System Health
  async getHealth() {
    return await this.request('/health');
  }

  // Network Interfaces for LAN Workstations
  async getNetworkInfo() {
    return await this.request('/hospital/network-info');
  }

  // Registered Citizens / Members
  async getMembers(query = '') {
    const q = query ? `?query=${encodeURIComponent(query)}` : '';
    return await this.request(`/members${q}`);
  }

  async updateMember(id, memberData) {
    return await this.request(`/members/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(memberData)
    });
  }

  // Cards & Approvals
  async getCards() {
    return await this.request('/cards');
  }

  // Hospital Registrations
  async getHospitalProfile() {
    return await this.request('/hospital/profile');
  }

  async getDoctors(dept = 'All') {
    return await this.request(`/hospital/doctors?department=${encodeURIComponent(dept)}`);
  }

  async getServices() {
    return await this.request('/hospital/services');
  }

  // Audit Logs
  async getAuditLogs() {
    return await this.request('/audit');
  }
}

export const adminBackend = new AdminBackendClient();
