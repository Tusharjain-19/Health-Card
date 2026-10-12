/**
 * HealthCard Doctor Portal — Dedicated Backend Client Service
 * Connects the Clinician Portal to the Central Medical Server (Port 5000 / LAN IP).
 * Safe local mock fallback preserved per user requirement.
 */

const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    const customUrl = localStorage.getItem('healthcard_backend_url');
    if (customUrl) return customUrl;
    const host = window.location.hostname || 'localhost';
    return `http://${host}:5000/api`;
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
};

export class DoctorBackendClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = getApiBaseUrl();
  }

  setBaseUrl(url: string) {
    this.baseUrl = url;
    if (typeof window !== 'undefined') {
      localStorage.setItem('healthcard_backend_url', url);
    }
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T | null> {
    const url = `${this.baseUrl}${endpoint}`;
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          'x-role': 'Doctor',
          ...(options.headers || {})
        },
        ...options
      });

      if (!response.ok) {
        throw new Error(`Doctor Backend request to ${endpoint} failed: ${response.status}`);
      }

      return (await response.json()) as T;
    } catch (error) {
      console.warn(`[DoctorBackend] Network request to ${endpoint} failed, falling back to safe local state:`, error);
      return null;
    }
  }

  // System Health
  async getHealth() {
    return await this.request('/health');
  }

  // Patients / Health IDs
  async getPatients(query: string = '') {
    const q = query ? `?query=${encodeURIComponent(query)}` : '';
    return await this.request(`/members${q}`);
  }

  async getPatientById(id: string) {
    return await this.request(`/members/${encodeURIComponent(id)}`);
  }

  // Hospital Doctors & Profiles
  async getDoctors(dept: string = 'All') {
    return await this.request(`/hospital/doctors?department=${encodeURIComponent(dept)}`);
  }

  // Clinical Consultations & Prescriptions (OPD)
  async getConsultations(patientId?: string) {
    const q = patientId ? `?patientId=${encodeURIComponent(patientId)}` : '';
    return await this.request(`/hospital/consultations${q}`);
  }

  async saveConsultation(consultationData: any) {
    return await this.request('/hospital/consultations', {
      method: 'POST',
      body: JSON.stringify(consultationData)
    });
  }

  async updateConsultation(id: string, consultationData: any) {
    return await this.request(`/hospital/consultations/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(consultationData)
    });
  }

  // Inpatient Hospitalizations & MAR Doses (IPD)
  async getAdmissions(patientId?: string) {
    const q = patientId ? `?patientId=${encodeURIComponent(patientId)}` : '';
    return await this.request(`/hospital/admissions${q}`);
  }

  async addAdmissionRound(admissionId: string, roundData: any) {
    return await this.request(`/hospital/admissions/${encodeURIComponent(admissionId)}/rounds`, {
      method: 'POST',
      body: JSON.stringify(roundData)
    });
  }

  // Services Catalog
  async getServices() {
    return await this.request('/hospital/services');
  }

  // Audit Logs
  async getAuditLogs() {
    return await this.request('/audit');
  }
}

export const doctorBackend = new DoctorBackendClient();
