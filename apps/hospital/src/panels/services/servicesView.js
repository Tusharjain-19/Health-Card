/**
 * HealthCard Hospital Portal — Hospital Clinical Services Catalog Management
 * Implements Item 3 & 4: Manage all hospital services, diagnostic tests, bed tariffs, and consultations.
 * Full CRUD (Add, Edit, Update, Delete) synced across workstations.
 */

import { hospitalStore } from '../../shared/storage.js';
import { showToast } from '../../shared/components/toast.js';

export class ServicesView {
  constructor(container) {
    this.container = container;
    this.selectedCategory = 'All';
    this.searchQuery = '';
  }

  render() {
    let services = hospitalStore.getServices(this.selectedCategory);
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      services = services.filter(s => 
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.department.toLowerCase().includes(q)
      );
    }

    const categories = ['All', 'Consultation', 'Inpatient', 'Emergency', 'Diagnostic', 'Laboratory', 'Procedure'];

    this.container.innerHTML = `
      <div class="services-view">
        <div class="page-header">
          <div>
            <h1 class="page-title">Hospital Clinical Services & Tariffs Catalog</h1>
            <p class="page-subtitle">Configure outpatient consultations, ward bed categories, diagnostic assays, and clinical procedures</p>
          </div>
          <button type="button" class="btn btn-primary" id="btn-add-service">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            + Create New Clinical Service
          </button>
        </div>

        <!-- Filter & Search Toolbar -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
          <!-- Category Chips -->
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            ${categories.map(c => `
              <button type="button" class="btn btn-sm ${this.selectedCategory === c ? 'btn-primary' : 'btn-ghost'} btn-cat-filter" data-cat="${c}" style="font-weight: 600;">
                ${c}
              </button>
            `).join('')}
          </div>

          <!-- Search Input -->
          <div style="display: flex; align-items: center; gap: 8px;">
            <input type="text" id="service-search-input" class="form-input form-input-sm" placeholder="Search service name or code..." value="${this.searchQuery}" style="width: 250px;" />
            ${this.searchQuery ? `<button type="button" class="btn btn-sm btn-ghost" id="btn-clear-search">✕</button>` : ''}
          </div>
        </div>

        <!-- Services Catalog Table -->
        <div style="background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-xl); padding: 24px; box-shadow: var(--shadow-sm);">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
            <div>
              <h3 style="font-size: 16px; font-weight: 700; color: var(--text-main); margin: 0;">Institutional Service Catalog (${services.length} active)</h3>
              <p style="font-size: 12px; color: var(--text-muted); margin: 2px 0 0 0;">Standard fees applied during OPD consultation billing and IPD ward discharge</p>
            </div>
            <span class="badge badge-active">Central Billing Catalog</span>
          </div>

          <table class="rx-table" style="font-size: 13px;">
            <thead>
              <tr>
                <th style="width: 14%;">Service Code</th>
                <th style="width: 26%;">Service Name & Description</th>
                <th style="width: 16%;">Department</th>
                <th style="width: 14%;">Category</th>
                <th style="width: 12%;">Standard Fee (₹)</th>
                <th style="width: 18%; text-align: right;">Catalog Actions</th>
              </tr>
            </thead>
            <tbody>
              ${services.length === 0 ? `
                <tr>
                  <td colspan="6" style="text-align: center; padding: 36px; color: var(--text-muted);">
                    No clinical services found matching criteria. Click "+ Create New Clinical Service" to add.
                  </td>
                </tr>
              ` : services.map(s => `
                <tr>
                  <td>
                    <span style="font-family: monospace; font-weight: 700; font-size: 11.5px; color: #0f766e; background: #f0fdfa; border: 1px solid #99f6e4; padding: 3px 8px; border-radius: 4px;">
                      ${s.code}
                    </span>
                  </td>
                  <td>
                    <div style="font-weight: 700; color: var(--text-main); font-size: 13.5px;">${s.name}</div>
                    <div style="font-size: 11.5px; color: var(--text-muted); margin-top: 2px;">${s.description || 'Standard institutional clinical service.'}</div>
                  </td>
                  <td style="color: var(--text-secondary); font-weight: 500;">
                    ${s.department}
                  </td>
                  <td>
                    <span class="badge ${
                      s.category === 'Emergency' ? 'badge-pending' :
                      s.category === 'Inpatient' ? 'badge-blue' :
                      s.category === 'Procedure' ? 'badge-pending' : 'badge-active'
                    }">
                      ${s.category}
                    </span>
                  </td>
                  <td>
                    <div style="font-weight: 800; font-size: 14px; color: var(--text-main);">
                      ${s.standardFee === 0 ? '<span style="color: #15803d;">Free / Subsidized</span>' : `₹${s.standardFee.toLocaleString('en-IN')}`}
                    </div>
                  </td>
                  <td style="text-align: right;">
                    <div style="display: inline-flex; gap: 6px;">
                      <button type="button" class="btn btn-sm btn-secondary btn-edit-service" data-id="${s.id}">
                        Edit Fee / Details
                      </button>
                      <button type="button" class="btn btn-sm btn-ghost btn-del-service" data-id="${s.id}" style="color: #dc2626;" title="Remove service">
                        ✕
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    // Category filter buttons
    const catBtns = this.container.querySelectorAll('.btn-cat-filter');
    catBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.selectedCategory = btn.getAttribute('data-cat');
        this.render();
      });
    });

    // Search query input
    const searchInput = this.container.querySelector('#service-search-input');
    searchInput?.addEventListener('input', (e) => {
      this.searchQuery = e.target.value.trim();
      this.render();
    });

    // Clear search
    this.container.querySelector('#btn-clear-search')?.addEventListener('click', () => {
      this.searchQuery = '';
      this.render();
    });

    // Add Service button
    this.container.querySelector('#btn-add-service')?.addEventListener('click', () => {
      this.openAddServiceModal();
    });

    // Edit Service buttons
    const editBtns = this.container.querySelectorAll('.btn-edit-service');
    editBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const srv = hospitalStore.getServices().find(s => s.id === id);
        if (srv) {
          this.openEditServiceModal(srv);
        }
      });
    });

    // Delete Service buttons
    const delBtns = this.container.querySelectorAll('.btn-del-service');
    delBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        const srv = hospitalStore.getServices().find(s => s.id === id);
        if (srv && confirm(`Are you sure you want to remove "${srv.name}" from hospital services?`)) {
          hospitalStore.deleteService(id);
          showToast(`Service "${srv.name}" removed from catalog.`, 'info');
          this.render();
        }
      });
    });
  }

  // ==========================================
  // ADD SERVICE MODAL (Item 3 & 4)
  // ==========================================
  openAddServiceModal() {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-dialog" style="max-width: 600px;">
        <div class="modal-header">
          <div>
            <h3 style="font-size: 16px; font-weight: 700; color: var(--text-main); margin: 0;">Add Hospital Clinical Service</h3>
            <p style="font-size: 11.5px; color: var(--text-muted); margin: 2px 0 0 0;">Define tariff, category, and department for clinical orders and billing</p>
          </div>
          <button type="button" class="btn btn-sm btn-ghost modal-close">✕</button>
        </div>

        <form id="modal-add-service-form">
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Service Title / Name:</label>
              <input type="text" id="srv-name" class="form-input" placeholder="e.g. Special Outpatient Cardiology Consultation" required />
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;" class="form-group">
              <div>
                <label class="form-label">Service Code:</label>
                <input type="text" id="srv-code" class="form-input font-mono" placeholder="e.g. OPD-SPEC-CARD" required />
              </div>
              <div>
                <label class="form-label">Category:</label>
                <select class="form-select" id="srv-cat">
                  <option value="Consultation" selected>Consultation</option>
                  <option value="Inpatient">Inpatient (Ward / Bed)</option>
                  <option value="Emergency">Emergency & Resus</option>
                  <option value="Diagnostic">Diagnostic (ECG / Echo)</option>
                  <option value="Laboratory">Laboratory & Pathology</option>
                  <option value="Procedure">Surgical / Clinical Procedure</option>
                </select>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;" class="form-group">
              <div>
                <label class="form-label">Responsible Department:</label>
                <select class="form-select" id="srv-dept">
                  <option value="General Medicine / Specialty">General Medicine / Specialty</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Inpatient Wards">Inpatient Wards</option>
                  <option value="Critical Care">Critical Care (ICU / CCU)</option>
                  <option value="Emergency & Trauma">Emergency & Trauma</option>
                  <option value="Pathology">Pathology</option>
                  <option value="Biochemistry">Biochemistry</option>
                  <option value="Radiology">Radiology</option>
                  <option value="General Surgery">General Surgery</option>
                </select>
              </div>
              <div>
                <label class="form-label">Standard Institutional Fee (₹):</label>
                <input type="number" id="srv-fee" class="form-input" placeholder="0" min="0" value="100" required />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Clinical Description / Inclusions:</label>
              <textarea id="srv-desc" class="form-textarea" placeholder="Detail clinical scope, materials included, or diagnostic assay method...">Includes clinical evaluation and e-prescription issuance.</textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary modal-close">Cancel</button>
            <button type="submit" class="btn btn-primary">Save to Services Catalog</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', () => overlay.remove());
    });

    overlay.querySelector('#modal-add-service-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = overlay.querySelector('#srv-name').value;
      const code = overlay.querySelector('#srv-code').value;
      const category = overlay.querySelector('#srv-cat').value;
      const department = overlay.querySelector('#srv-dept').value;
      const standardFee = Number(overlay.querySelector('#srv-fee').value) || 0;
      const description = overlay.querySelector('#srv-desc').value;

      hospitalStore.addService({
        name,
        code,
        category,
        department,
        standardFee,
        description
      });

      overlay.remove();
      showToast(`Service "${name}" added to catalog!`, 'success');
      this.render();
    });
  }

  // ==========================================
  // EDIT SERVICE MODAL (Item 4)
  // ==========================================
  openEditServiceModal(srv) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-dialog" style="max-width: 600px;">
        <div class="modal-header">
          <div>
            <h3 style="font-size: 16px; font-weight: 700; color: var(--text-main); margin: 0;">Edit Clinical Service Details</h3>
            <p style="font-size: 11.5px; color: var(--text-muted); margin: 2px 0 0 0;">Update service code, fee, department or clinical descriptions</p>
          </div>
          <button type="button" class="btn btn-sm btn-ghost modal-close">✕</button>
        </div>

        <form id="modal-edit-service-form">
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label">Service Title / Name:</label>
              <input type="text" id="edit-srv-name" class="form-input" value="${srv.name}" required />
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;" class="form-group">
              <div>
                <label class="form-label">Service Code:</label>
                <input type="text" id="edit-srv-code" class="form-input font-mono" value="${srv.code}" required />
              </div>
              <div>
                <label class="form-label">Category:</label>
                <select class="form-select" id="edit-srv-cat">
                  <option value="Consultation" ${srv.category === 'Consultation' ? 'selected' : ''}>Consultation</option>
                  <option value="Inpatient" ${srv.category === 'Inpatient' ? 'selected' : ''}>Inpatient (Ward / Bed)</option>
                  <option value="Emergency" ${srv.category === 'Emergency' ? 'selected' : ''}>Emergency & Resus</option>
                  <option value="Diagnostic" ${srv.category === 'Diagnostic' ? 'selected' : ''}>Diagnostic (ECG / Echo)</option>
                  <option value="Laboratory" ${srv.category === 'Laboratory' ? 'selected' : ''}>Laboratory & Pathology</option>
                  <option value="Procedure" ${srv.category === 'Procedure' ? 'selected' : ''}>Surgical / Clinical Procedure</option>
                </select>
              </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;" class="form-group">
              <div>
                <label class="form-label">Department:</label>
                <input type="text" id="edit-srv-dept" class="form-input" value="${srv.department}" required />
              </div>
              <div>
                <label class="form-label">Standard Institutional Fee (₹):</label>
                <input type="number" id="edit-srv-fee" class="form-input" value="${srv.standardFee}" min="0" required />
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Clinical Description / Inclusions:</label>
              <textarea id="edit-srv-desc" class="form-textarea">${srv.description || ''}</textarea>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary modal-close">Cancel</button>
            <button type="submit" class="btn btn-primary">Update Service</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(overlay);

    overlay.querySelectorAll('.modal-close').forEach(btn => {
      btn.addEventListener('click', () => overlay.remove());
    });

    overlay.querySelector('#modal-edit-service-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const updated = {
        name: overlay.querySelector('#edit-srv-name').value,
        code: overlay.querySelector('#edit-srv-code').value,
        category: overlay.querySelector('#edit-srv-cat').value,
        department: overlay.querySelector('#edit-srv-dept').value,
        standardFee: Number(overlay.querySelector('#edit-srv-fee').value) || 0,
        description: overlay.querySelector('#edit-srv-desc').value
      };

      hospitalStore.updateService(srv.id, updated);
      overlay.remove();
      showToast(`Service "${updated.name}" updated successfully across network!`, 'success');
      this.render();
    });
  }
}
