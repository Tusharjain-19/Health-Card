/**
 * HealthCard Hospital Portal: Dedicated Backend Client Service
 * Connects the Hospital Panel to the Central Medical Server (Port 5000 / LAN IP).
 * Provides network sync across multiple computers, fallbacks to local store if offline.
 */

const getApiBaseUrl = () => {
  // Check if custom server URL is stored in settings/localStorage
  const customUrl = localStorage.getItem('healthcard_backend_url');
  if (customUrl) return customUrl;

  // If accessed from another computer on the LAN, connect to the same host on port 5000
  const host = window.location.hostname || 'localhost';
  return `http://${host}:5000/api`;
};

class HospitalBackendClient {
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
          'x-actor': sessionStorage.getItem('hospital_actor') || 'Dr. Vikram Sethi',
          'x-hospital-id': 'hosp_aiims_01',
          ...(options.headers || {})
        },
        ...options
      });

      if (!response.ok) {
        throw new Error(`Backend request to ${endpoint} failed: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.warn(`[BackendClient] Network error for ${endpoint}, falling back to local storage:`, error);
      return null;
    }
  }

  // System Health & Multi-Computer Network Addresses
  async getHealth() {
    return await this.request('/health');
  }

  async getNetworkInfo() {
    return await this.request('/hospital/network-info');
  }

  // Hospital Institutional Profile
  async getHospitalProfile() {
    return await this.request('/hospital/profile');
  }

  async updateHospitalProfile(profile) {
    return await this.request('/hospital/profile', {
      method: 'PUT',
      body: JSON.stringify(profile)
    });
  }

  // Hospital Doctors CRUD
  async getDoctors(department = 'All') {
    return await this.request(`/hospital/doctors?department=${encodeURIComponent(department)}`);
  }

  async addDoctor(doctorData) {
    return await this.request('/hospital/doctors', {
      method: 'POST',
      body: JSON.stringify(doctorData)
    });
  }

  async updateDoctor(id, updatedFields) {
    return await this.request(`/hospital/doctors/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(updatedFields)
    });
  }

  async deleteDoctor(id) {
    return await this.request(`/hospital/doctors/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
  }

  // Hospital Clinical Services CRUD
  async getServices() {
    return await this.request('/hospital/services');
  }

  async addService(serviceData) {
    return await this.request('/hospital/services', {
      method: 'POST',
      body: JSON.stringify(serviceData)
    });
  }

  async updateService(id, updatedFields) {
    return await this.request(`/hospital/services/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(updatedFields)
    });
  }

  async deleteService(id) {
    return await this.request(`/hospital/services/${encodeURIComponent(id)}`, {
      method: 'DELETE'
    });
  }

  // OPD Consultations & Prescriptions
  async getConsultations(healthId = '') {
    const q = healthId ? `?healthId=${encodeURIComponent(healthId)}` : '';
    return await this.request(`/hospital/consultations${q}`);
  }

  async saveConsultation(consultationData) {
    return await this.request('/hospital/consultations', {
      method: 'POST',
      body: JSON.stringify(consultationData)
    });
  }

  async updateConsultation(id, updatedData) {
    return await this.request(`/hospital/consultations/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(updatedData)
    });
  }

  // Inpatient Admissions (IPD)
  async getAdmissions(status = '', healthId = '') {
    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (healthId) params.set('healthId', healthId);
    const q = params.toString() ? `?${params.toString()}` : '';
    return await this.request(`/hospital/admissions${q}`);
  }

  async saveAdmission(admissionData) {
    return await this.request('/hospital/admissions', {
      method: 'POST',
      body: JSON.stringify(admissionData)
    });
  }

  async addAdmissionRound(admissionId, roundData) {
    return await this.request(`/hospital/admissions/${encodeURIComponent(admissionId)}/rounds`, {
      method: 'POST',
      body: JSON.stringify(roundData)
    });
  }

  async dischargePatient(admissionId, dischargeData) {
    return await this.request(`/hospital/admissions/${encodeURIComponent(admissionId)}/discharge`, {
      method: 'POST',
      body: JSON.stringify(dischargeData)
    });
  }

  async updateAdmission(admissionId, updatedFields) {
    return await this.request(`/hospital/admissions/${encodeURIComponent(admissionId)}`, {
      method: 'PUT',
      body: JSON.stringify(updatedFields)
    });
  }

  async deleteAdmission(admissionId) {
    return await this.request(`/hospital/admissions/${encodeURIComponent(admissionId)}`, {
      method: 'DELETE'
    });
  }

  // Registered Patients / Members
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

  // Audit Logs
  async getAuditLogs() {
    return await this.request('/audit');
  }
}

export const hospitalBackend = new HospitalBackendClient();
