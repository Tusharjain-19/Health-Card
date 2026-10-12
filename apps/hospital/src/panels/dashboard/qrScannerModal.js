/**
 * HealthCard QR Scanner Modal
 * Uses jsQR library for real-time camera QR code scanning.
 * Only accepts QR codes matching the HealthCard format:
 *   - https://hc.national.gov.in/c/{healthId}
 *   - tok_{token}
 *   - Raw 10-digit Health ID
 */

import jsQR from 'jsqr';
import { hospitalStore } from '../../shared/storage.js';
import { showToast } from '../../shared/components/toast.js';

const HC_QR_PATTERN = /^https:\/\/hc\.national\.gov\.in\/c\/(\d{10})/;
const HC_TOKEN_PATTERN = /^tok_/;
const HC_RAW_ID_PATTERN = /^\d{10}$/;

export class QRScannerModal {
  constructor(options = {}) {
    this.onResult = options.onResult || null;
    this.overlay = null;
    this.video = null;
    this.canvas = null;
    this.ctx = null;
    this.stream = null;
    this.animFrame = null;
    this.scanning = false;
  }

  open() {
    this.overlay = document.createElement('div');
    this.overlay.className = 'modal-overlay';
    this.overlay.style.zIndex = '9999';
    this.overlay.innerHTML = `
      <div class="modal-dialog" style="max-width: 560px;">
        <div class="modal-header">
          <div>
            <h3 style="font-size: 16px; font-weight: 700; color: var(--text-main); margin: 0;">Scan HealthCard QR Code</h3>
            <p style="font-size: 11.5px; color: var(--text-muted); margin: 2px 0 0 0;">Point camera at the QR code on the patient's physical HealthCard</p>
          </div>
          <button type="button" class="btn btn-sm btn-ghost modal-close-btn" title="Close">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div class="modal-body" style="padding: 0;">
          <div id="qr-camera-wrapper" style="position: relative; width: 100%; aspect-ratio: 4/3; background: #0f172a; border-radius: 0 0 8px 8px; overflow: hidden;">
            <video id="qr-video" playsinline autoplay muted style="width: 100%; height: 100%; object-fit: cover;"></video>
            <canvas id="qr-canvas" style="display: none;"></canvas>

            <!-- Scan overlay crosshair -->
            <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; pointer-events: none;">
              <div style="width: 200px; height: 200px; border: 2px solid rgba(20, 184, 166, 0.6); border-radius: 12px; position: relative;">
                <div style="position: absolute; top: -2px; left: -2px; width: 24px; height: 24px; border-top: 3px solid #14b8a6; border-left: 3px solid #14b8a6; border-radius: 4px 0 0 0;"></div>
                <div style="position: absolute; top: -2px; right: -2px; width: 24px; height: 24px; border-top: 3px solid #14b8a6; border-right: 3px solid #14b8a6; border-radius: 0 4px 0 0;"></div>
                <div style="position: absolute; bottom: -2px; left: -2px; width: 24px; height: 24px; border-bottom: 3px solid #14b8a6; border-left: 3px solid #14b8a6; border-radius: 0 0 0 4px;"></div>
                <div style="position: absolute; bottom: -2px; right: -2px; width: 24px; height: 24px; border-bottom: 3px solid #14b8a6; border-right: 3px solid #14b8a6; border-radius: 0 0 4px 0;"></div>
                <div id="qr-scan-line" style="position: absolute; left: 4px; right: 4px; height: 2px; background: linear-gradient(90deg, transparent, #14b8a6, transparent); top: 50%; animation: scanPulse 2s ease-in-out infinite;"></div>
              </div>
            </div>

            <!-- Status message -->
            <div id="qr-status" style="position: absolute; bottom: 0; left: 0; right: 0; padding: 10px 16px; background: linear-gradient(transparent, rgba(0,0,0,0.7)); color: #e2e8f0; font-size: 12.5px; text-align: center; font-weight: 600;">
              Initializing camera...
            </div>
          </div>

          <!-- Manual entry fallback -->
          <div style="padding: 16px 20px; border-top: 1px solid var(--border-color);">
            <div style="font-size: 12px; font-weight: 600; color: var(--text-muted); margin-bottom: 8px;">Or enter Health ID manually:</div>
            <form id="qr-manual-form" style="display: flex; gap: 8px;">
              <input type="text" id="qr-manual-input" class="form-input font-mono" placeholder="74839 16251" style="flex: 1; font-weight: 600;" />
              <button type="submit" class="btn btn-primary">Lookup</button>
            </form>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.overlay);

    // Add scan animation keyframes
    if (!document.getElementById('qr-scan-keyframes')) {
      const style = document.createElement('style');
      style.id = 'qr-scan-keyframes';
      style.textContent = `
        @keyframes scanPulse {
          0%, 100% { top: 10%; opacity: 0.4; }
          50% { top: 85%; opacity: 1; }
        }
      `;
      document.head.appendChild(style);
    }

    this.bindEvents();
    this.startCamera();
  }

  bindEvents() {
    this.overlay.querySelector('.modal-close-btn')?.addEventListener('click', () => this.close());
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) this.close();
    });

    const form = this.overlay.querySelector('#qr-manual-form');
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = this.overlay.querySelector('#qr-manual-input');
      const val = (input?.value || '').trim();
      if (val) this.processQRData(val);
    });

    // Auto-format Health ID input
    const input = this.overlay.querySelector('#qr-manual-input');
    input?.addEventListener('input', (e) => {
      const raw = e.target.value.replace(/\D/g, '');
      if (raw.length <= 10) {
        e.target.value = raw.length > 5 ? `${raw.slice(0, 5)} ${raw.slice(5, 10)}` : raw;
      }
    });
  }

  async startCamera() {
    const statusEl = this.overlay?.querySelector('#qr-status');
    this.video = this.overlay?.querySelector('#qr-video');
    this.canvas = this.overlay?.querySelector('#qr-canvas');

    if (!this.video || !this.canvas) return;
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API not available');
      }

      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
      });

      this.video.srcObject = this.stream;
      await this.video.play();

      if (statusEl) statusEl.textContent = 'Camera active. Scanning for HealthCard QR...';
      this.scanning = true;
      this.scanFrame();

    } catch (err) {
      console.warn('Camera error:', err);
      if (statusEl) {
        statusEl.innerHTML = `
          <span style="color: #fbbf24;">Camera unavailable.</span> Use manual Health ID entry below, or try demo cards:
          <div style="display: flex; gap: 6px; justify-content: center; margin-top: 8px;">
            <button type="button" class="btn btn-sm btn-secondary btn-demo-qr" data-payload="https://hc.national.gov.in/c/7483916251?tok=tok_7483916251">Rahul (74839 16251)</button>
            <button type="button" class="btn btn-sm btn-secondary btn-demo-qr" data-payload="https://hc.national.gov.in/c/8192034719?tok=tok_8192034719">Ananya (81920 34719)</button>
            <button type="button" class="btn btn-sm btn-secondary btn-demo-qr" data-payload="https://hc.national.gov.in/c/9021854310?tok=tok_9021854310">Sunita (90218 54310)</button>
          </div>
        `;
        statusEl.querySelectorAll('.btn-demo-qr').forEach(btn => {
          btn.addEventListener('click', () => {
            this.processQRData(btn.getAttribute('data-payload'));
          });
        });
      }
    }
  }

  scanFrame() {
    if (!this.scanning || !this.video || !this.ctx) return;

    if (this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
      this.canvas.width = this.video.videoWidth;
      this.canvas.height = this.video.videoHeight;
      this.ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);

      const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert'
      });

      if (code && code.data) {
        this.scanning = false;
        this.processQRData(code.data);
        return;
      }
    }

    this.animFrame = requestAnimationFrame(() => this.scanFrame());
  }

  processQRData(rawData) {
    const data = (rawData || '').trim();

    // 1. Check HealthCard URL pattern: https://hc.national.gov.in/c/7483916251?tok=...
    const urlMatch = data.match(HC_QR_PATTERN);
    if (urlMatch) {
      const healthId = urlMatch[1];
      this.resolveAndNavigate(healthId, data);
      return;
    }

    // 2. Check token pattern: tok_xxxxx
    if (HC_TOKEN_PATTERN.test(data)) {
      this.resolveAndNavigate(data, data);
      return;
    }

    // 3. Check raw 10-digit Health ID
    const cleanDigits = data.replace(/\s+/g, '');
    if (HC_RAW_ID_PATTERN.test(cleanDigits)) {
      this.resolveAndNavigate(cleanDigits, data);
      return;
    }

    // 4. Not a HealthCard QR
    showToast('This QR code is not a valid HealthCard. Only HealthCard QR codes are accepted.', 'error');
    const statusEl = this.overlay?.querySelector('#qr-status');
    if (statusEl) {
      statusEl.innerHTML = '<span style="color: #f87171;">Invalid QR detected.</span> Only HealthCard QR codes are accepted. Scanning...';
    }

    // Resume scanning after rejection
    setTimeout(() => {
      this.scanning = true;
      this.scanFrame();
    }, 1500);
  }

  resolveAndNavigate(query, rawPayload) {
    const result = hospitalStore.resolveCardToken(query);

    if (result && result.found) {
      showToast(`HealthCard verified: ${result.maskedIdentity.fullName}`, 'success');
      this.close();

      const cleanId = (result.patient.healthId || '').replace(/\s+/g, '');
      if (this.onResult) {
        this.onResult(result);
      } else {
        window.location.hash = `#patient?id=${cleanId}`;
      }
    } else {
      showToast('HealthCard QR scanned but patient not found in registry.', 'error');
      const statusEl = this.overlay?.querySelector('#qr-status');
      if (statusEl) {
        statusEl.innerHTML = '<span style="color: #f87171;">Patient not found.</span> Verify card is registered. Scanning...';
      }
      setTimeout(() => {
        this.scanning = true;
        this.scanFrame();
      }, 2000);
    }
  }

  close() {
    this.scanning = false;
    if (this.animFrame) {
      cancelAnimationFrame(this.animFrame);
      this.animFrame = null;
    }
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
  }
}
