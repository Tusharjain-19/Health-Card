import { laboratoryBackend } from '../backend/apiClient';

export { laboratoryBackend };

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function fetchFromBackend(endpoint: string, options: RequestInit = {}) {
  const result = await laboratoryBackend.request(endpoint, options);
  if (!result) {
    throw new Error(`Laboratory API request failed for ${endpoint}`);
  }
  return result;
}
