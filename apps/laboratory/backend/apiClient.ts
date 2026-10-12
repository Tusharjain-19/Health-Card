/**
 * HealthCard Diagnostic Laboratory Portal — Dedicated Backend Client Service
 * Connects the Laboratory & Pathology Portal to the Central Medical Server (Port 5000 / LAN IP).
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

export class LaboratoryBackendClient {
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
          'x-role': 'Laboratory',
          ...(options.headers || {})
        },
        ...options
      });

      if (!response.ok) {
        throw new Error(`Laboratory Backend request to ${endpoint} failed: ${response.status}`);
      }

      return (await response.json()) as T;
    } catch (error) {
      console.warn(`[LaboratoryBackend] Network request to ${endpoint} failed, falling back to safe local state:`, error);
      return null;
    }
  }

  // System Health
  async getHealth() {
    return await this.request('/health');
  }

  // Diagnostic Test Services Catalog
  async getLabServices() {
    return await this.request('/hospital/services');
  }

  // Inpatient & OPD Tests & Diagnostic Reports
  async getConsultationReports(patientId?: string) {
    const q = patientId ? `?patientId=${encodeURIComponent(patientId)}` : '';
    return await this.request(`/hospital/consultations${q}`);
  }

  // Upload or Update Test Result
  async uploadReport(testId: string, reportPayload: any) {
    return await this.request(`/hospital/reports/${encodeURIComponent(testId)}`, {
      method: 'POST',
      body: JSON.stringify(reportPayload)
    });
  }

  // Patients
  async getPatient(patientId: string) {
    return await this.request(`/members/${encodeURIComponent(patientId)}`);
  }

  // Audit
  async logLabActivity(details: any) {
    return await this.request('/audit', {
      method: 'POST',
      body: JSON.stringify({
        action: 'LAB_DIAGNOSTIC_ACTION',
        details,
        timestamp: new Date().toISOString()
      })
    });
  }
}

export const laboratoryBackend = new LaboratoryBackendClient();
