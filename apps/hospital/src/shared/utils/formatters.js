/**
2:  * HealthCard Hospital & Clinician Portal — Formatting Utilities
3:  * Adheres to Indian date formats (DD/MM/YYYY, IST), phone numbers (+91), and masked privacy views.
4:  */

export function formatDate(dateStr, includeTime = false) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '—';
    
    const day = String(d.getDate()).padStart(2, '0');
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = monthNames[d.getMonth()];
    const year = d.getFullYear();

    if (!includeTime) {
      return `${day} ${month} ${year}`;
    }

    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;

    return `${day} ${month} ${year}, ${hours}:${minutes} ${ampm}`;
  } catch (e) {
    return '—';
  }
}

export function calculateAge(dobStr) {
  if (!dobStr) return '—';
  const birth = new Date(dobStr);
  const now = new Date();
  if (isNaN(birth.getTime())) return '—';
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) {
    age--;
  }
  return age >= 0 ? `${age} yrs` : '—';
}

export function maskMobile(mobile) {
  if (!mobile) return '—';
  const clean = mobile.replace(/\D/g, '');
  if (clean.length < 4) return mobile;
  const last2 = clean.slice(-2);
  return `+91 ••••• ••${last2}`;
}

export function formatMobile(mobile) {
  if (!mobile) return '—';
  const clean = mobile.replace(/\D/g, '');
  if (clean.length === 10) {
    return `+91 ${clean.slice(0, 5)} ${clean.slice(5, 10)}`;
  }
  return mobile;
}

export function timeAgo(dateStr) {
  if (!dateStr) return '';
  const past = new Date(dateStr).getTime();
  const now = Date.now();
  const diffSec = Math.floor((now - past) / 1000);

  if (diffSec < 60) return 'Just now';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
  if (diffSec < 604800) return `${Math.floor(diffSec / 86400)}d ago`;
  return formatDate(dateStr);
}
