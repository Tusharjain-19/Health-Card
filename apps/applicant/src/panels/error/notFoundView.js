/**
 * HealthCard Citizen & Applicant Portal — Custom 404 & Service Error View
 * Clean light mode error recovery interface strictly matching design language
 */

export class NotFoundView {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.attemptedRoute = options.route || window.location.hash || '#';
    this.init();
  }

  init() {
    this.render();
  }

  render() {
    this.container.innerHTML = `
      <div class="not-found-container">
        <div class="not-found-card">
          <div class="not-found-badge">
            <span class="pulse-dot"></span>
            <span>Error 404 • Route Not Found</span>
          </div>

          <div class="not-found-icon-box">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><path d="M16 16s-1.5-2-4-2-4 2-4 2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>
          </div>

          <h1 class="not-found-title">Page or Record Not Found</h1>
          
          <p class="not-found-desc">
            The requested destination <code class="route-code">${this.attemptedRoute}</code> does not match any active service route in the National HealthCard Citizen Portal.
          </p>

          <div class="not-found-actions">
            <a href="#home" class="btn btn-primary" style="height:42px; font-weight:700;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              <span>Return to Portal Home</span>
            </a>

            <a href="#apply" class="btn btn-outline" style="height:42px; font-weight:600;">
              Apply for HealthCard
            </a>

            <a href="#track" class="btn btn-outline" style="height:42px; font-weight:600;">
              Track Delivery
            </a>
          </div>

          <div class="not-found-support-note">
            Need urgent assistance? Call National Health Toll-Free Helpline: <strong>1800-11-4477</strong> (24×7 Available)
          </div>
        </div>
      </div>
    `;
  }
}
