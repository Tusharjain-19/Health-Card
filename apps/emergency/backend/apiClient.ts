/**
 * HealthCard Emergency & Trauma Portal — Dedicated Backend Client Service
 * Connects the Emergency & Resuscitation Portal to the Central Medical Server (Port 5000 / LAN IP).
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

export class EmergencyBackendClient {
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
          'x-role': 'Emergency',
          ...(options.headers || {})
        },
        ...options
      });

      if (!response.ok) {
        throw new Error(`Emergency Backend request to ${endpoint} failed: ${response.status}`);
      }

      return (await response.json()) as T;
    } catch (error) {
      console.warn(`[EmergencyBackend] Network request to ${endpoint} failed, falling back to safe local state:`, error);
      return null;
    }
  }

  // System Health
  async getHealth() {
    return await this.request('/health');
  }

  // Emergency Patient Lookup by Health ID or Scan
  async getPatientEmergencyProfile(id: string) {
    return await this.request(`/members/${encodeURIComponent(id)}`);
  }

  // Break-glass Access Log
  async logBreakGlassEvent(eventData: any) {
    return await this.request('/audit', {
      method: 'POST',
      body: JSON.stringify({
        action: 'BREAK_GLASS_ACCESS',
        details: eventData,
        timestamp: new Date().toISOString()
      })
    });
  }

  // Admissions (Trauma Inpatient intake)
  async getAdmissions() {
    return await this.request('/hospital/admissions');
  }

  async createEmergencyAdmission(admissionData: any) {
    return await this.request('/hospital/admissions', {
      method: 'POST',
      body: JSON.stringify(admissionData)
    });
  }

  // Doctors on duty
  async getEmergencyDoctors() {
    return await this.request('/hospital/doctors?department=Emergency');
  }
}

export const emergencyBackend = new EmergencyBackendClient();
