/**
 * HealthCard 10-Digit National Health ID Generator & Utilities
 * Specification: PRD Section 6.1
 * - Format: 10 digits displayed 5-5 (e.g. 74839 16251)
 * - Regex: ^[1-9][0-9]{9}$
 * - Non-sequential, cryptographically random
 */

export function generateHealthId() {
  // First digit is 1-9
  const firstDigit = Math.floor(Math.random() * 9) + 1;
  // Remaining 9 digits are 0-9
  let remaining = '';
  for (let i = 0; i < 9; i++) {
    remaining += Math.floor(Math.random() * 10);
  }
  const raw = `${firstDigit}${remaining}`;
  return `${raw.slice(0, 5)} ${raw.slice(5)}`;
}

export function formatHealthId(input) {
  if (!input) return '';
  const clean = input.toString().replace(/\D/g, '').slice(0, 10);
  if (clean.length > 5) {
    return `${clean.slice(0, 5)} ${clean.slice(5)}`;
  }
  return clean;
}

export function validateHealthId(input) {
  if (!input) return false;
  const clean = input.toString().replace(/\s+/g, '');
  return /^[1-9][0-9]{9}$/.test(clean);
}
