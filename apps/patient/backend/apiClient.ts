/**
 * HealthCard Patient Portal — Dedicated Backend Client Service
 * Connects the Citizen Patient Health Records Portal to the Central Medical Server (Port 5000 / LAN IP).
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

export class PatientBackendClient {
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
          'x-role': 'Patient',
          ...(options.headers || {})
        },
        ...options
      });

      if (!response.ok) {
        throw new Error(`Patient Backend request to ${endpoint} failed: ${response.status}`);
      }

      return (await response.json()) as T;
    } catch (error) {
      console.warn(`[PatientBackend] Network request to ${endpoint} failed, falling back to safe local state:`, error);
      return null;
    }
  }

  // System Health
  async getHealth() {
    return await this.request('/health');
  }

  // Patient Profile & Digital Card
  async getMyProfile(id: string) {
    return await this.request(`/members/${encodeURIComponent(id)}`);
  }

  async getMyCards() {
    return await this.request('/cards');
  }

  // My OPD Prescriptions & Consultations
  async getMyConsultations(patientId: string) {
    return await this.request(`/hospital/consultations?patientId=${encodeURIComponent(patientId)}`);
  }

  // My Inpatient Hospitalizations & MAR Logs
  async getMyAdmissions(patientId: string) {
    return await this.request(`/hospital/admissions?patientId=${encodeURIComponent(patientId)}`);
  }

  // Hospital Doctors Directory
  async getHospitalDoctors() {
    return await this.request('/hospital/doctors');
  }

  // Hospital Services
  async getHospitalServices() {
    return await this.request('/hospital/services');
  }

  // Access Logs & Consent
  async getAccessAuditLogs() {
    return await this.request('/audit');
  }
}

export const patientBackend = new PatientBackendClient();
