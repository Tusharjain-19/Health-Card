import { patientBackend } from '../backend/apiClient';

export { patientBackend };

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function fetchFromBackend(endpoint: string, options: RequestInit = {}) {
  const result = await patientBackend.request(endpoint, options);
  if (!result) {
    throw new Error(`Patient API request failed for ${endpoint}`);
  }
  return result;
}
