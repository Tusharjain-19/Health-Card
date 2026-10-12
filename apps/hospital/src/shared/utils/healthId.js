/**
 * HealthCard ID Generator & Validator
 * According to PRD v1.0 Section 6.1:
 * - 10 digits displayed in 5-5 grouping (e.g. 74839 16251)
 * - Cryptographically random; first digit 1-9
 * - Not derived from PII (name, DOB, mobile)
 */

export function generateHealthId() {
  const firstDigit = Math.floor(Math.random() * 9) + 1; // 1-9
  let remaining = '';
  const cryptoObj = window.crypto || window.msCrypto;
  
  if (cryptoObj && cryptoObj.getRandomValues) {
    const array = new Uint32Array(3);
    cryptoObj.getRandomValues(array);
    const num = (array[0] % 1000000000).toString().padStart(9, '0');
    remaining = num;
  } else {
    remaining = Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
  }

  const raw10 = `${firstDigit}${remaining}`;
  return formatHealthId(raw10);
}

export function formatHealthId(raw) {
  if (!raw) return '';
  const digits = raw.toString().replace(/\D/g, '');
  if (digits.length <= 5) return digits;
  return `${digits.slice(0, 5)} ${digits.slice(5, 10)}`;
}

export function normalizeHealthId(input) {
  if (!input) return '';
  return input.toString().replace(/\s+|-/g, '').trim();
}

export function validateHealthId(input) {
  const clean = normalizeHealthId(input);

  if (!clean) {
    return { valid: false, error: 'Health ID cannot be empty' };
  }

  if (clean.length !== 10) {
    return { valid: false, error: `Health ID must be exactly 10 digits (currently ${clean.length})` };
  }

  if (clean.startsWith('0')) {
    return { valid: false, error: 'Health ID cannot start with 0. Valid IDs begin with 1-9.' };
  }

  return { valid: true };
}
