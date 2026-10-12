/**
 * Standard Formatters for Dates, Ages, Mobiles, and Timestamps
 */

export function formatDate(isoString) {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  } catch (e) {
    return isoString;
  }
}

export function calculateAge(dobIso) {
  if (!dobIso) return '—';
  try {
    const birthDate = new Date(dobIso);
    if (isNaN(birthDate.getTime())) return '—';
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age > 0 ? age : 0;
  } catch (e) {
    return '—';
  }
}

export function formatDOBFromParts(day, month, year) {
  if (!day || !month || !year) return '';
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function maskMobile(mobile) {
  if (!mobile) return '•••••• ••••';
  const clean = mobile.replace(/\D/g, '');
  if (clean.length < 10) return mobile;
  return `•••••• ${clean.slice(-4)}`;
}

export function formatMobile(mobile) {
  if (!mobile) return '';
  const clean = mobile.replace(/\D/g, '').slice(0, 10);
  if (clean.length === 10) {
    return `+91 ${clean.slice(0, 5)} ${clean.slice(5)}`;
  }
  return clean;
}

export function timeAgo(isoString) {
  if (!isoString) return '—';
  try {
    const d = new Date(isoString);
    const now = new Date();
    const diffSec = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return `${Math.floor(diffSec / 86400)}d ago`;
  } catch (e) {
    return '—';
  }
}

export const formatRelativeTime = timeAgo;
