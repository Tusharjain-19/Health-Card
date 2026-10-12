/**
 * HealthCard — Admin & Card Issuing Portal Entry Point
 * Exclusively focused on Admin & Card Issuing Management.
 */

import { initAdminPanel } from './panels/admin/admin.js';

document.addEventListener('DOMContentLoaded', () => {
  const appContainer = document.getElementById('app');
  if (!appContainer) return;

  // Initialize Admin Panel directly
  initAdminPanel(appContainer);
});
