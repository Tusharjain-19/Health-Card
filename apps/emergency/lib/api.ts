import { emergencyBackend } from '../backend/apiClient';

export { emergencyBackend };

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function fetchFromBackend(endpoint: string, options: RequestInit = {}) {
  const result = await emergencyBackend.request(endpoint, options);
  if (!result) {
    throw new Error(`Emergency API request failed for ${endpoint}`);
  }
  return result;
}
