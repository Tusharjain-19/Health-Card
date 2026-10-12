/**
 * HealthCard Application Tracking & Physical Card Fulfillment View
 * Clean Minimal Light Mode matching Admin Panel & design.md
 */

import { applicantStore } from '../../shared/storage.js';
import { formatDate, formatRelativeTime } from '../../shared/formatters.js';
import { showToast } from '../../shared/toast.js';

export class TrackView {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.initialQuery = options.query || '';
    this.activeResult = null;
    this.init();
  }

  init() {
    this.render();
    this.bindEvents();
    if (this.initialQuery) {
      this.performLookup(this.initialQuery);
    }
  }

  render() {
    this.container.innerHTML = `
      <div class="light-page-header">
        <div>
          <div style="display:inline-flex; align-items:center; gap:6px; font-size:11.5px; font-weight:700; color:var(--color-primary); background:var(--color-primary-light); border:1px solid var(--color-primary-border); padding:3px 10px; border-radius:4px; margin-bottom:8px;">
            India Post SpeedPost Integrated
          </div>
          <h1 class="page-title">Track HealthCard Application & Dispatch</h1>
          <p class="page-subtitle">
            Enter your Application Reference number, 10-Digit Health ID, or Mobile number to check manufacturing and courier transit.
          </p>
        </div>
      </div>

      <!-- Quick Demo Chips Bar -->
      <div style="background:#ffffff; border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:16px 20px; margin-bottom:20px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px; box-shadow:var(--shadow-xs);">
        <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap;">
          <span style="font-size:12px; font-weight:600; color:var(--text-muted);">Quick Demos:</span>
          <button type="button" class="btn btn-sm btn-outline btn-demo-chip" data-query="APP-20260915-1082">
            Rahul Sharma (Delivered)
          </button>
          <button type="button" class="btn btn-sm btn-outline btn-demo-chip" data-query="APP-20260918-3491">
            Ananya Deshmukh (Dispatched)
          </button>
          <button type="button" class="btn btn-sm btn-outline btn-demo-chip" data-query="9654321098">
            Sunita Patel (Active)
          </button>
        </div>
      </div>

      <!-- Search Input Card -->
      <div style="background:#ffffff; border:1px solid var(--border-color); border-radius:var(--radius-lg); padding:24px; box-shadow:var(--shadow-xs); margin-bottom:24px;">
        <label class="form-label required" style="font-size:13.5px; font-weight:600; margin-bottom:8px;">
          Search by Application Ref, 10-Digit Health ID, Mobile, or AWB
        </label>
        <div style="display:flex; gap:10px; max-width:680px;">
          <input 
            type="text" 
            class="form-input" 
            id="inp-track-query" 
            placeholder="e.g. APP-20260915-1082, 74839 16251, or 9876543210" 
            value="${this.initialQuery}"
            style="font-size:14px; font-weight:600;" 
          />
          <button type="button" class="btn btn-primary" id="btn-perform-track" style="padding:0 22px;">
            Track Status
          </button>
        </div>
      </div>

      <!-- Result Container -->
      <div id="track-result-container">
        ${this.renderPlaceholderState()}
      </div>
    `;
  }

  renderPlaceholderState() {
    return `
      <div style="text-align:center; padding:44px 20px; background:#ffffff; border:1px dashed var(--border-color); border-radius:var(--radius-lg);">
        <h3 style="font-size:15px; font-weight:700; color:var(--text-main); margin-bottom:4px;">No Active Query</h3>
        <p style="font-size:12.5px; color:var(--text-muted); max-width:440px; margin:0 auto;">
          Enter your reference number or click one of the quick test demos above to see real-time 5-stage fulfillment status.
        </p>
      </div>
    `;
  }

  renderNotFoundState(query) {
    return `
      <div style="text-align:center; padding:40px 20px; background:#ffffff; border:1px solid var(--blood-red-border); border-radius:var(--radius-lg);">
        <h3 style="font-size:16px; font-weight:700; color:var(--color-blood-red); margin-bottom:4px;">Record Not Found</h3>
        <p style="font-size:13px; color:var(--text-secondary); max-width:420px; margin:0 auto 16px;">
          No application matches "<strong>${query}</strong>". Please verify your reference number.
        </p>
        <button type="button" class="btn btn-primary btn-sm" onclick="window.location.hash='#apply'">Apply for New Card</button>
      </div>
    `;
  }

  renderResultView(data) {
    const { order, member } = data;
    const STAGES = [
      { key: 'requested', stepNumber: 1, title: 'Application Submitted', desc: 'Citizen identity tokenized & application submitted online' },
      { key: 'generated', stepNumber: 2, title: 'Bureau Verified', desc: 'Demographic and KYC verified against National Registry' },
      { key: 'printing', stepNumber: 3, title: 'Laser-Etched & Encrypted', desc: 'CR80 PVC engraved & dynamic NFC cryptographic keys tokenized' },
      { key: 'dispatched', stepNumber: 4, title: 'Dispatched via SpeedPost', desc: 'Handed over to India Post tracked courier network' },
      { key: 'delivered', stepNumber: 5, title: 'Delivered & Activated', desc: 'Physical card safely delivered to citizen residence' }
    ];

    const stageOrder = ['requested', 'generated', 'printing', 'dispatched', 'delivered'];
    const currentStatus = order.status || 'requested';
    const currentIndex = stageOrder.indexOf(currentStatus);

    return `
      <div class="tracking-pipeline-card">
        <!-- Top Status & Consignment Header -->
        <div class="tracking-header-bar">
          <div>
            <div style="display:flex; align-items:center; gap:10px; margin-bottom:6px; flex-wrap:wrap;">
              <h2 style="font-size:20px; font-weight:800; color:var(--text-main); margin:0;">
                ${order.memberName || member?.fullName || 'Citizen'}
              </h2>
              <span class="badge ${currentStatus === 'delivered' ? 'badge-teal' : (currentStatus === 'dispatched' ? 'badge-blue' : 'badge-amber')}" style="text-transform:uppercase; font-size:11px; font-weight:700; padding:3px 10px;">
                ${currentStatus}
              </span>
            </div>
            <div style="font-size:12.5px; color:var(--text-muted); display:flex; gap:16px; flex-wrap:wrap; align-items:center;">
              <span>Application Ref: <strong style="font-family:var(--font-family-mono); color:var(--text-secondary);">${order.orderNumber}</strong></span>
              <span>10-Digit Health ID: <strong style="font-family:var(--font-family-mono); color:var(--color-primary); font-size:13.5px;">${order.healthId || member?.healthId}</strong></span>
              <span>Blood Group: <strong style="color:var(--color-blood-red); font-weight:800;">${member?.bloodGroup || 'Unknown'}</strong></span>
            </div>
          </div>

          <div class="tracking-awb-box">
            <div style="font-size:10.5px; color:var(--text-muted); font-weight:700; text-transform:uppercase; letter-spacing:0.04em;">SpeedPost Consignment AWB</div>
            <div style="display:inline-flex; align-items:center; gap:8px; margin-top:4px;">
              <span class="awb-pill-code">
                ${order.awbNumber || 'IN-PENDING'}
              </span>
              <button type="button" class="btn btn-sm btn-outline" id="btn-copy-awb" title="Copy SpeedPost Tracking Number" style="padding:3px 8px; font-size:11.5px;">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                Copy
              </button>
            </div>
          </div>
        </div>

        <!-- 1. Horizontal Connected Arrow Stepper Pipeline -->
        <div style="margin:28px 0 12px;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <h3 style="font-size:14px; font-weight:800; color:var(--text-main); margin:0;">
              Fulfillment Pipeline (5-Stage Connected Progress)
            </h3>
            <span style="font-size:12px; color:var(--color-primary); font-weight:700;">
              Stage ${currentIndex + 1} of 5 Active
            </span>
          </div>

          <div class="horizontal-arrow-stepper">
            ${STAGES.map((stg, idx) => {
              const isPast = idx < currentIndex;
              const isCurrent = idx === currentIndex;
              const isUpcoming = idx > currentIndex;

              let nodeClass = 'upcoming';
              if (isPast) nodeClass = 'completed';
              else if (isCurrent) nodeClass = 'current';

              const hasNext = idx < STAGES.length - 1;
              let connectorClass = 'upcoming';
              if (idx < currentIndex) connectorClass = 'completed';
              else if (idx === currentIndex) connectorClass = 'active';

              return `
                <div class="stepper-node ${nodeClass}">
                  <div class="node-icon-circle">
                    ${isPast ? `
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                    ` : (isCurrent ? `
                      <span class="stepper-pulse-dot"></span>
                    ` : `
                      <span>${stg.stepNumber}</span>
                    `)}
                  </div>
                  <div class="node-title">${stg.title}</div>
                  <div class="node-status-tag">
                    ${isPast ? 'Done' : (isCurrent ? 'In Progress' : 'Pending')}
                  </div>
                </div>

                ${hasNext ? `
                  <div class="stepper-arrow-connector ${connectorClass}">
                    <div class="arrow-line-track"></div>
                    <div class="arrow-pointer">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </div>
                  </div>
                ` : ''}
              `;
            }).join('')}
          </div>
        </div>

        <!-- 2. Detailed Vertical Milestone Timeline with Connected Arrow Lines -->
        <div style="margin:28px 0 24px;">
          <h4 style="font-size:13px; font-weight:800; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.04em; margin-bottom:16px;">
            Milestone Activity & Transit Log
          </h4>

          <div class="tracking-vertical-timeline">
            ${STAGES.map((stg, idx) => {
              const isPast = idx < currentIndex;
              const isCurrent = idx === currentIndex;
              const isLast = idx === STAGES.length - 1;

              let rowClass = 'upcoming';
              if (isPast) rowClass = 'completed';
              else if (isCurrent) rowClass = 'current';

              const historyItem = (order.history || []).find(h => h.status === stg.key);

              return `
                <div class="vertical-step-row ${rowClass}">
                  ${!isLast ? `
                    <div class="vertical-track-connector">
                      <div class="vertical-track-arrow">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 5v14M5 13l7 7 7-7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                      </div>
                    </div>
                  ` : ''}

                  <div class="vertical-step-node">
                    ${isPast ? `
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
                    ` : (isCurrent ? `
                      <span class="stepper-pulse-dot"></span>
                    ` : `
                      <span>${stg.stepNumber}</span>
                    `)}
                  </div>

                  <div class="vertical-step-card">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:4px; flex-wrap:wrap; gap:8px;">
                      <div style="font-size:13.5px; font-weight:700; color:var(--text-main);">
                        ${stg.title}
                      </div>
                      ${isCurrent ? `
                        <span class="badge badge-teal" style="font-size:10.5px;">Active Stage</span>
                      ` : (isPast ? `
                        <span style="font-size:11px; color:#047857; font-weight:700; display:inline-flex; align-items:center; gap:4px;">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg>
                          Completed
                        </span>
                      ` : `
                        <span style="font-size:11px; color:#94a3b8; font-weight:600;">Upcoming</span>
                      `)}
                    </div>
                    <div style="font-size:12.5px; color:var(--text-secondary); line-height:1.45;">
                      ${historyItem?.note || stg.desc}
                    </div>
                    ${historyItem?.timestamp ? `
                      <div style="font-size:11px; color:var(--text-muted); margin-top:6px; font-weight:500;">
                        Logged: ${formatDate(historyItem.timestamp)} (${formatRelativeTime(historyItem.timestamp)})
                      </div>
                    ` : ''}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- 3. Logistics & Emergency Information Grid -->
        <div class="tracking-logistics-grid">
          <div class="logistics-cell">
            <div class="logistics-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              <span>Delivery Address</span>
            </div>
            <div class="logistics-value">${order.deliveryAddress}</div>
          </div>

          <div class="logistics-cell">
            <div class="logistics-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
              <span>Carrier & Transit</span>
            </div>
            <div class="logistics-value">${order.deliverySpeed || 'India Post SpeedPost (Priority Tracked)'}</div>
            <div style="font-size:11.5px; color:var(--color-primary); font-weight:600; margin-top:3px;">
              Target Arrival: ${formatDate(order.estimatedDelivery)}
            </div>
          </div>

          <div class="logistics-cell">
            <div class="logistics-label">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              <span>Designated Emergency Contact</span>
            </div>
            <div class="logistics-value">
              ${member?.emergencyContact?.name || 'Contact'} (${member?.emergencyContact?.relation || 'Family'})
            </div>
            <div style="font-size:12px; font-family:var(--font-family-mono); font-weight:700; color:#0f172a; margin-top:3px;">
              +91 ${member?.emergencyContact?.phone || '—'}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    const btn = document.getElementById('btn-perform-track');
    const inp = document.getElementById('inp-track-query');

    if (btn && inp) {
      btn.onclick = () => {
        const q = inp.value.trim();
        if (!q) {
          showToast('Please enter an Application Ref, Health ID, or Mobile', 'warning');
          return;
        }
        this.performLookup(q);
      };
      inp.onkeydown = (e) => { if (e.key === 'Enter') btn.click(); };
    }

    this.container.querySelectorAll('.btn-demo-chip').forEach(chip => {
      chip.onclick = () => {
        const q = chip.getAttribute('data-query');
        if (inp) inp.value = q;
        this.performLookup(q);
      };
    });
  }

  performLookup(query) {
    const res = applicantStore.lookupApplication(query);
    const container = document.getElementById('track-result-container');
    if (!container) return;

    if (res) {
      this.activeResult = res;
      container.innerHTML = this.renderResultView(res);
      showToast(`Tracking record loaded for ${res.order.memberName || 'Applicant'}`, 'success');

      document.getElementById('btn-copy-awb')?.addEventListener('click', () => {
        navigator.clipboard.writeText(res.order.awbNumber || '');
        showToast('SpeedPost AWB copied to clipboard: ' + res.order.awbNumber, 'info');
      });
    } else {
      this.activeResult = null;
      container.innerHTML = this.renderNotFoundState(query);
      showToast(`No application found for "${query}"`, 'error');
    }
  }
}
