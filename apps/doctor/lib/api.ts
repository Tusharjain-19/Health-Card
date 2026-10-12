import { doctorBackend } from '../backend/apiClient';

export { doctorBackend };

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function fetchFromBackend(endpoint: string, options: RequestInit = {}) {
  const result = await doctorBackend.request(endpoint, options);
  if (!result) {
    throw new Error(`Doctor API request failed for ${endpoint}`);
  }
  return result;
}
