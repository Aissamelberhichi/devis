/* ============================================================
   CCTV QUOTE PRO — app.js
   ============================================================ */
'use strict';

// ── State ────────────────────────────────────────────────────
const App = {
  data: null,
  quantities: {},
  adminMode: false,
  darkMode: false,
  company: {
    name: 'Morocco Modern Networks',
    phone: '+212 7 75 82 08 81',
    logo: null
  },
  client: { name: '', phone: '', address: '', ref: '', date: '' },
  notes: '',
  quoteNumber: '',
  quoteCounter: 1
};

// ── Boot ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  loadLocalStorage();
  await fetchData();
  renderApp();
  bindGlobalEvents();
  setupPWA();
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js').catch(() => {});
  }
});

// ── Load / Save ───────────────────────────────────────────────
function loadLocalStorage() {
  try {
    const saved = JSON.parse(localStorage.getItem('cctvApp') || '{}');
    if (saved.company) Object.assign(App.company, saved.company);
    if (saved.quantities) App.quantities = saved.quantities;
    if (saved.darkMode) App.darkMode = saved.darkMode;
    if (saved.quoteCounter) App.quoteCounter = saved.quoteCounter;
    if (saved.client) App.client = saved.client;
    if (saved.notes) App.notes = saved.notes;
  } catch (_) {}
  if (App.darkMode) document.documentElement.setAttribute('data-theme', 'dark');
}

function saveLocalStorage() {
  try {
    localStorage.setItem('cctvApp', JSON.stringify({
      company: App.company,
      quantities: App.quantities,
      darkMode: App.darkMode,
      quoteCounter: App.quoteCounter,
      client: App.client,
      notes: App.notes
    }));
  } catch (_) {}
}

// ── Inline Data (works with file:// — no server needed) ───────
const ARTICLES_DATA = {"adminCode":"2026SECURE","categories":[{"name":"CAMERA","icon":"📷","items":[{"id":"CAM001","designation":"2MP COULEUR","prixAchat":127,"prixVente":160},{"id":"CAM005","designation":"5MP","prixAchat":180,"prixVente":240},{"id":"CAM005B","designation":"5MP COULEUR","prixAchat":187,"prixVente":260},{"id":"CAM006","designation":"5MP COULEUR AUDIO","prixAchat":240,"prixVente":270}]},{"name":"DVR","icon":"🖥️","items":[{"id":"DVR001A","designation":"DVR 4 CANAUX 2MP","prixAchat":320,"prixVente":450},{"id":"DVR001B","designation":"DVR 4 CANAUX 5MP","prixAchat":320,"prixVente":650},{"id":"DVR002A","designation":"DVR 8 CANAUX 2MP","prixAchat":480,"prixVente":650},{"id":"DVR002B","designation":"DVR 8 CANAUX 5MP","prixAchat":650,"prixVente":760}]},{"name":"BLOC D'ALIMENTATION","icon":"⚡","items":[{"id":"BAL001","designation":"BLOC 12V 5A 4 SORTIES","prixAchat":68,"prixVente":120},{"id":"BAL002","designation":"BLOC 12V 10A 8 SORTIES","prixAchat":85,"prixVente":150}]},{"name":"CABLE COAXIAL","icon":"🔌","items":[{"id":"CAB001","designation":"CABLE COAXIAL RG59","prixAchat":1.9,"prixVente":3.5}]},{"name":"DISQUE DUR","icon":"💾","items":[{"id":"HDD002","designation":"DISQUE DUR SURVEILLANCE 2TO","prixAchat":590,"prixVente":1000},{"id":"HDD003","designation":"DISQUE DUR SURVEILLANCE 3TO","prixAchat":890,"prixVente":1200}]},{"name":"TUBE GORGE","icon":"🔧","items":[{"id":"TUB001","designation":"TUBE IRL GORGE 16MM","prixAchat":4,"prixVente":4.5}]},{"name":"ARMOIRE METALLIQUE","icon":"🗄️","items":[{"id":"ARM001","designation":"ARMOIRE MURALE 4U","prixAchat":185,"prixVente":350},{"id":"ARM002","designation":"ARMOIRE MURALE 6U","prixAchat":235,"prixVente":450}]},{"name":"BOITE ETANCHE","icon":"📦","items":[{"id":"BOI001","designation":"BOITE ETANCHE 100X100X50 IP65","prixAchat":10,"prixVente":10}]},{"name":"CABLE HDMI","icon":"📺","items":[{"id":"HDM001","designation":"CABLE HDMI 1.5M HAUTE VITESSE","prixAchat":35,"prixVente":50},{"id":"HDM002","designation":"CABLE HDMI 3M HAUTE VITESSE","prixAchat":55,"prixVente":75},{"id":"HDM003","designation":"CABLE HDMI 5M HAUTE VITESSE","prixAchat":80,"prixVente":110},{"id":"HDM004","designation":"CABLE HDMI 10M ACTIF","prixAchat":150,"prixVente":200},{"id":"HDM005","designation":"CABLE VGA 1.5M","prixAchat":28,"prixVente":40}]},{"name":"CONNECTEUR BNC","icon":"🔗","items":[{"id":"BNC001","designation":"CONNECTEUR BNC A SERTIR","prixAchat":2,"prixVente":3},{"id":"BNC002","designation":"CONNECTEUR BNC A VISSER","prixAchat":2,"prixVente":3},{"id":"BNC003","designation":"ADAPTATEUR BNC FEMELLE/FEMELLE","prixAchat":8,"prixVente":12},{"id":"BNC004","designation":"RACCORD BNC T SPLITTER","prixAchat":15,"prixVente":22},{"id":"BNC005","designation":"BALUN VIDEO PASSIF PAIRE (X2)","prixAchat":40,"prixVente":58}]},{"name":"CONNECTEUR ALIMENTATION","icon":"🔋","items":[{"id":"CON001","designation":"CONNECTEUR DC 2.1MM MALE A VISSER","prixAchat":2,"prixVente":3},{"id":"CON003","designation":"PAIRE CONNECTEUR SIAMOIS BNC+DC (X10)","prixAchat":55,"prixVente":80},{"id":"CON004","designation":"SPLITTER DC 1 FEMELLE / 2 MALES","prixAchat":12,"prixVente":18},{"id":"CON005","designation":"BORNIER ALIMENTATION 12V MULTI SORTIES","prixAchat":35,"prixVente":50}]},{"name":"INSTALLATION ET MISE EN SERVICE","icon":"🛠️","items":[{"id":"INS001","designation":"INSTALLATION CAMERA INTERIEURE","prixAchat":0,"prixVente":100},{"id":"INS002","designation":"INSTALLATION CAMERA EXTERIEURE","prixAchat":0,"prixVente":200},{"id":"INS003","designation":"INSTALLATION DVR/NVR + CONFIG","prixAchat":0,"prixVente":300},{"id":"INS004","designation":"TIRAGE CABLE COAXIAL (PAR METRE)","prixAchat":0,"prixVente":3},{"id":"INS005","designation":"MISE EN SERVICE + FORMATION CLIENT","prixAchat":0,"prixVente":300},{"id":"INS006","designation":"CONFIGURATION ACCES DISTANCE","prixAchat":0,"prixVente":280},{"id":"INS007","designation":"MAINTENANCE ANNUELLE SYSTEME","prixAchat":0,"prixVente":900}]}]};

async function fetchData() {
  // Data is embedded directly — works with file://, no server required.
  // To update products, edit ARTICLES_DATA above or replace with a fetch() when hosted.
  App.data = ARTICLES_DATA;
}

// ── Quote Number ──────────────────────────────────────────────
function generateQuoteNumber() {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`;
  return `DEV-${ymd}-${String(App.quoteCounter).padStart(3,'0')}`;
}

// ── Render ────────────────────────────────────────────────────
function renderApp() {
  App.quoteNumber = generateQuoteNumber();
  renderCategories();
  renderQuotePreview();
  updateSummaryBar();
  fillClientForm();
  fillCompanyForm();
}

// ── Categories ────────────────────────────────────────────────
function renderCategories(filter = '') {
  const container = document.getElementById('catalog-list');
  if (!container) return;
  container.innerHTML = '';

  App.data.categories.forEach((cat, ci) => {
    const items = filter
      ? cat.items.filter(i => i.designation.toLowerCase().includes(filter.toLowerCase()))
      : cat.items;
    if (filter && !items.length) return;

    const catSelected = items.filter(i => (App.quantities[i.id] || 0) > 0).length;
    const isOpen = filter || catSelected > 0 || document.getElementById(`cat-${ci}`)?.classList.contains('open');

    const card = document.createElement('div');
    card.className = `category-card${isOpen ? ' open' : ''}`;
    card.id = `cat-${ci}`;

    card.innerHTML = `
      <div class="category-header" onclick="toggleCategory(${ci})">
        <div class="category-icon">${cat.icon || '📦'}</div>
        <div class="category-name">${cat.name}</div>
        ${catSelected ? `<span class="category-badge">${catSelected}</span>` : ''}
        <span class="category-chevron">▼</span>
      </div>
      <div class="category-body" id="cat-body-${ci}">
        ${items.map(item => renderProductRow(item)).join('')}
      </div>`;

    container.appendChild(card);
  });

  if (!container.children.length) {
    container.innerHTML = `<div class="empty-state"><span>🔍</span><p>Aucun produit trouvé</p></div>`;
  }
  applyAdminVisuals();
}

function renderProductRow(item) {
  const qty = App.quantities[item.id] || 0;
  const lineTotal = qty * item.prixVente;
  const profit = item.prixVente - item.prixAchat;
  return `
    <div class="product-row${qty > 0 ? ' has-qty' : ''}" id="row-${item.id}">
      <div class="product-info">
        <div class="product-name" title="${item.designation}">${item.designation}</div>
        <div class="product-prices">
          <span class="price-sell">${fmtMoney(item.prixVente)} DH</span>
          <span class="price-buy">Achat: ${fmtMoney(item.prixAchat)} DH</span>
          <span class="price-profit">+${fmtMoney(profit)} DH</span>
        </div>
      </div>
      <div class="qty-control">
        <button class="qty-btn minus" onclick="changeQty('${item.id}', -1)" aria-label="Diminuer">−</button>
        <input class="qty-input" type="number" min="0" value="${qty}"
          onchange="setQty('${item.id}', this.value)"
          oninput="setQty('${item.id}', this.value)"
          aria-label="Quantité ${item.designation}">
        <button class="qty-btn plus" onclick="changeQty('${item.id}', 1)" aria-label="Augmenter">+</button>
      </div>
      <div class="line-total" id="lt-${item.id}">${qty > 0 ? fmtMoney(lineTotal) + ' DH' : '—'}</div>
    </div>`;
}

function toggleCategory(ci) {
  const card = document.getElementById(`cat-${ci}`);
  if (card) card.classList.toggle('open');
}

// ── Quantity Logic ────────────────────────────────────────────
function changeQty(id, delta) {
  const current = App.quantities[id] || 0;
  setQty(id, current + delta);
}

function setQty(id, val) {
  const n = Math.max(0, parseInt(val) || 0);
  App.quantities[id] = n;
  updateProductRow(id);
  updateSummaryBar();
  renderQuotePreview();
  saveLocalStorage();
}

function updateProductRow(id) {
  const item = findItem(id);
  if (!item) return;
  const qty = App.quantities[id] || 0;
  const row = document.getElementById(`row-${id}`);
  const ltEl = document.getElementById(`lt-${id}`);
  const inp = row?.querySelector('.qty-input');
  if (row) row.classList.toggle('has-qty', qty > 0);
  if (ltEl) ltEl.textContent = qty > 0 ? fmtMoney(qty * item.prixVente) + ' DH' : '—';
  if (inp && inp.value != qty) inp.value = qty;
}

function findItem(id) {
  for (const cat of App.data.categories) {
    const item = cat.items.find(i => i.id === id);
    if (item) return item;
  }
  return null;
}

// ── Summary ───────────────────────────────────────────────────
function getSelectedItems() {
  return Object.entries(App.quantities)
    .filter(([, q]) => q > 0)
    .map(([id, qty]) => {
      const item = findItem(id);
      return item ? { ...item, qty } : null;
    }).filter(Boolean);
}

function calcTotals() {
  const items = getSelectedItems();
  const totalVente = items.reduce((s, i) => s + i.prixVente * i.qty, 0);
  const totalAchat = items.reduce((s, i) => s + i.prixAchat * i.qty, 0);
  const totalProfit = totalVente - totalAchat;
  const margin = totalVente > 0 ? ((totalProfit / totalVente) * 100).toFixed(1) : 0;
  const count = items.reduce((s, i) => s + i.qty, 0);
  return { totalVente, totalAchat, totalProfit, margin, count, items };
}

function updateSummaryBar() {
  const t = calcTotals();
  const el = id => document.getElementById(id);
  if (el('sum-items')) el('sum-items').innerHTML = `<strong>${t.count}</strong> article${t.count !== 1 ? 's' : ''}`;
  if (el('sum-total')) el('sum-total').textContent = fmtMoney(t.totalVente) + ' DH';
  if (el('sum-admin')) {
    el('sum-admin').innerHTML = App.adminMode
      ? `Achat: ${fmtMoney(t.totalAchat)} DH · Profit: <span class="text-green font-bold">${fmtMoney(t.totalProfit)} DH</span> (${t.margin}%)`
      : '';
  }
  // Update quote tab badge
  if (el('quote-total-badge')) el('quote-total-badge').textContent = fmtMoney(t.totalVente) + ' DH';
}

// ── Admin ─────────────────────────────────────────────────────
function openAdminModal() {
  if (App.adminMode) {
    disableAdmin();
    return;
  }
  document.getElementById('admin-modal').classList.add('open');
  setTimeout(() => document.getElementById('admin-pwd').focus(), 100);
}

function checkAdminCode() {
  const pwd = document.getElementById('admin-pwd').value;
  if (pwd === App.data.adminCode) {
    enableAdmin();
    closeModal('admin-modal');
    showToast('🔓 Mode admin activé');
  } else {
    document.getElementById('admin-pwd').style.borderColor = 'var(--red)';
    document.getElementById('admin-pwd-error').style.display = 'block';
    setTimeout(() => {
      document.getElementById('admin-pwd').style.borderColor = '';
      document.getElementById('admin-pwd-error').style.display = 'none';
    }, 2000);
  }
}

function enableAdmin() {
  App.adminMode = true;
  document.body.classList.add('admin-mode');
  const btn = document.getElementById('admin-btn');
  if (btn) { btn.classList.add('active'); btn.title = 'Désactiver admin'; }
  updateAdminPanel();
  updateSummaryBar();
}

function disableAdmin() {
  App.adminMode = false;
  document.body.classList.remove('admin-mode');
  const btn = document.getElementById('admin-btn');
  if (btn) { btn.classList.remove('active'); btn.title = 'Mode admin'; }
  updateSummaryBar();
  showToast('🔒 Mode admin désactivé');
}

function updateAdminPanel() {
  const t = calcTotals();
  const el = id => document.getElementById(id);
  if (el('adm-vente')) el('adm-vente').textContent = fmtMoney(t.totalVente) + ' DH';
  if (el('adm-achat')) el('adm-achat').textContent = fmtMoney(t.totalAchat) + ' DH';
  if (el('adm-profit')) el('adm-profit').textContent = fmtMoney(t.totalProfit) + ' DH';
  if (el('adm-margin')) el('adm-margin').textContent = t.margin + '%';
}

function applyAdminVisuals() {
  if (App.adminMode) document.body.classList.add('admin-mode');
}

// ── Quote Preview ─────────────────────────────────────────────
function renderQuotePreview() {
  const t = calcTotals();
  const preview = document.getElementById('quote-content');
  if (!preview) return;

  const logoHtml = App.company.logo
    ? `<img src="${App.company.logo}" alt="Logo" class="quote-logo-area" style="max-height:60px;max-width:120px;object-fit:contain;border-radius:8px;background:rgba(255,255,255,.2);padding:4px;">`
    : `<div style="font-size:32px;text-align:right">📷</div>`;

  const tableRows = t.items.map((item, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td>${item.designation}</td>
      <td class="qty-cell">${item.qty}</td>
      <td>${fmtMoney(item.prixVente)} DH</td>
      <td style="font-weight:600">${fmtMoney(item.qty * item.prixVente)} DH</td>
    </tr>`).join('');

  const emptyMsg = t.items.length === 0
    ? `<tr><td colspan="5" style="text-align:center;color:#94A3B8;padding:24px">Aucun produit sélectionné</td></tr>` : '';

  const clientDate = App.client.date || new Date().toLocaleDateString('fr-FR');

  preview.innerHTML = `
    <div class="quote-header-band">
      <div class="quote-company-info">
        <div class="quote-company-name">${App.company.name}</div>
        <div class="quote-company-details">
          ${App.company.address}<br>
          📞 ${App.company.phone}<br>
          ✉️ ${App.company.email}
        </div>
      </div>
      <div>${logoHtml}</div>
    </div>
    <div class="quote-meta">
      <div>
        <div class="quote-number">N° DEVIS<br><strong>${App.quoteNumber}</strong></div>
        <div style="font-size:11px;color:#64748B;margin-top:4px">📅 ${clientDate}</div>
      </div>
      <div class="quote-client-box">
        <div class="quote-client-label">Client</div>
        <div class="quote-client-name">${App.client.name || '—'}</div>
        <div class="quote-client-detail">${App.client.phone || ''}</div>
        <div class="quote-client-detail">${App.client.address || ''}</div>
        ${App.client.ref ? `<div class="quote-client-detail">Réf: <strong>${App.client.ref}</strong></div>` : ''}
      </div>
    </div>
    <div class="quote-table-wrapper">
      <table class="quote-table">
        <thead>
          <tr>
            <th>#</th>
            <th>Désignation</th>
            <th>Qté</th>
            <th>P.U.</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>${tableRows || emptyMsg}</tbody>
      </table>
    </div>
    <div class="quote-totals">
      <div class="totals-row"><span>Sous-total HT</span><span>${fmtMoney(t.totalVente)} DH</span></div>
      <div class="totals-row"><span>TVA (0%)</span><span>${fmtMoney(t.totalVente * 0)} DH</span></div>
      <div class="totals-row grand"><span>TOTAL TTC</span><span>${fmtMoney(t.totalVente * 1)} DH</span></div>
    </div>
    ${App.notes ? `
    <div class="quote-notes">
      <div class="quote-notes-label">Notes</div>
      <div class="quote-notes-text">${App.notes}</div>
    </div>` : ''}
    <div class="quote-footer">
      <div class="sig-box">
        <div class="sig-label">Signature Client</div>
      </div>
      <div class="sig-box">
        <div class="sig-label">Cachet & Signature Société</div>
        <div style="font-size:10px;color:#94A3B8;margin-top:4px">${App.company.name}</div>
      </div>
    </div>
    <div class="quote-stamp">Document généré par CCTV Quote Pro · ${new Date().toLocaleDateString('fr-FR', {day:'2-digit',month:'long',year:'numeric'})}</div>`;

  // Update admin panel if visible
  if (App.adminMode) updateAdminPanel();
}

// ── Client form ───────────────────────────────────────────────
function fillClientForm() {
  const fields = ['name','phone','address','ref','date'];
  fields.forEach(f => {
    const el = document.getElementById(`client-${f}`);
    if (el) el.value = App.client[f] || '';
  });
  const notesEl = document.getElementById('quote-notes');
  if (notesEl) notesEl.value = App.notes || '';
}

function onClientChange() {
  App.client.name    = document.getElementById('client-name')?.value || '';
  App.client.phone   = document.getElementById('client-phone')?.value || '';
  App.client.address = document.getElementById('client-address')?.value || '';
  App.client.ref     = document.getElementById('client-ref')?.value || '';
  App.client.date    = document.getElementById('client-date')?.value || '';
  App.notes          = document.getElementById('quote-notes')?.value || '';
  renderQuotePreview();
  saveLocalStorage();
}

// ── Company form ──────────────────────────────────────────────
function fillCompanyForm() {
  const fields = ['name','address','phone','email'];
  fields.forEach(f => {
    const el = document.getElementById(`co-${f}`);
    if (el) el.value = App.company[f] || '';
  });
  updateLogoPreview();
}

function onCompanyChange() {
  App.company.name    = document.getElementById('co-name')?.value || '';
  App.company.address = document.getElementById('co-address')?.value || '';
  App.company.phone   = document.getElementById('co-phone')?.value || '';
  App.company.email   = document.getElementById('co-email')?.value || '';
  renderQuotePreview();
  saveLocalStorage();
}

function triggerLogoUpload() {
  document.getElementById('logo-file').click();
}

function onLogoUpload(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    App.company.logo = e.target.result;
    updateLogoPreview();
    renderQuotePreview();
    saveLocalStorage();
  };
  reader.readAsDataURL(file);
}

function updateLogoPreview() {
  const area = document.getElementById('logo-preview-area');
  if (!area) return;
  area.innerHTML = App.company.logo
    ? `<img src="${App.company.logo}" class="logo-preview" alt="Logo"><div style="font-size:11px;color:var(--text3);margin-top:6px">Cliquer pour changer</div>`
    : `<div class="logo-placeholder"><span>🏢</span>Cliquer pour ajouter un logo</div>`;
}

function removeLogo() {
  App.company.logo = null;
  updateLogoPreview();
  renderQuotePreview();
  saveLocalStorage();
}

// ── Search ────────────────────────────────────────────────────
function onSearch(val) {
  renderCategories(val.trim());
  if (val.trim()) {
    document.querySelectorAll('.category-card').forEach(c => c.classList.add('open'));
  }
}

// ── Tabs ──────────────────────────────────────────────────────
function switchTab(tab) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.toggle('active', p.id === `tab-${tab}`));
  if (tab === 'quote') renderQuotePreview();
  if (tab === 'quote' && App.adminMode) updateAdminPanel();
}

// ── Dark mode ─────────────────────────────────────────────────
function toggleDark() {
  App.darkMode = !App.darkMode;
  document.documentElement.setAttribute('data-theme', App.darkMode ? 'dark' : '');
  const btn = document.getElementById('dark-btn');
  if (btn) btn.textContent = App.darkMode ? '☀️' : '🌙';
  saveLocalStorage();
}

// ── Reset ─────────────────────────────────────────────────────
function resetQuote() {
  if (!confirm('Réinitialiser le devis ? Toutes les quantités seront remises à zéro.')) return;
  App.quantities = {};
  App.quoteCounter++;
  App.quoteNumber = generateQuoteNumber();
  saveLocalStorage();
  renderApp();
  renderCategories();
  showToast('♻️ Devis réinitialisé');
}

function duplicateQuote() {
  App.quoteCounter++;
  App.quoteNumber = generateQuoteNumber();
  saveLocalStorage();
  renderQuotePreview();
  showToast('📋 Devis dupliqué: ' + App.quoteNumber);
}

// ── PDF Export ────────────────────────────────────────────────
async function exportPDF() {
  const t = calcTotals();
  if (t.items.length === 0) { showToast('⚠️ Ajoutez des produits d\'abord'); return; }

  showToast('⏳ Génération PDF...');

  try {
    if (typeof window.jspdf === 'undefined' && typeof jsPDF === 'undefined') {
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
      await loadScript('https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js');
    }
    const { jsPDF } = window.jspdf || window;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pw = doc.internal.pageSize.getWidth();

    // Header background
    doc.setFillColor(37, 99, 235);
    doc.rect(0, 0, pw, 40, 'F');

    // Logo text or company name
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(App.company.name, 14, 16);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text([
      App.company.address,
      `Tel: ${App.company.phone}  |  Email: ${App.company.email}`
    ], 14, 24);

    // Quote number box
    doc.setFillColor(255, 255, 255, 0.2);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`DEVIS N°: ${App.quoteNumber}`, pw - 14, 14, { align: 'right' });
    const clientDate = App.client.date || new Date().toLocaleDateString('fr-FR');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date: ${clientDate}`, pw - 14, 21, { align: 'right' });

    // Client info
    doc.setTextColor(15, 23, 42);
    doc.setFillColor(239, 246, 255);
    doc.rect(0, 42, pw, 28, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text('CLIENT', 14, 50);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(App.client.name || 'Non renseigné', 14, 57);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    const clientLines = [App.client.phone, App.client.address, App.client.ref ? `Réf: ${App.client.ref}` : ''].filter(Boolean);
    doc.text(clientLines.join('  |  '), 14, 63);

    // Table
    const rows = t.items.map((item, i) => [
      i + 1,
      item.designation,
      item.qty,
      fmtMoney(item.prixVente) + ' DH',
      fmtMoney(item.qty * item.prixVente) + ' DH'
    ]);

    doc.autoTable({
      startY: 74,
      head: [['#', 'Désignation', 'Qté', 'P.U.', 'Total']],
      body: rows,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [37, 99, 235], textColor: 255, fontStyle: 'bold' },
      columnStyles: { 0: { cellWidth: 10 }, 1: { cellWidth: 'auto' }, 2: { cellWidth: 14, halign: 'center' }, 3: { cellWidth: 28, halign: 'right' }, 4: { cellWidth: 28, halign: 'right' } },
      alternateRowStyles: { fillColor: [248, 250, 255] }
    });

    const finalY = doc.lastAutoTable.finalY + 8;

    // Totals
    doc.setFillColor(239, 246, 255);
    doc.rect(pw - 80, finalY - 4, 66, 32, 'F');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text('Sous-total HT:', pw - 78, finalY + 2);
    doc.setTextColor(15, 23, 42);
    doc.text(fmtMoney(t.totalVente) + ' DH', pw - 14, finalY + 2, { align: 'right' });
    doc.setTextColor(71, 85, 105);
    doc.text('TVA (20%):', pw - 78, finalY + 10);
    doc.setTextColor(15, 23, 42);
    doc.text(fmtMoney(t.totalVente * 0.2) + ' DH', pw - 14, finalY + 10, { align: 'right' });
    doc.setFillColor(37, 99, 235);
    doc.rect(pw - 80, finalY + 14, 66, 10, 'F');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('TOTAL TTC:', pw - 78, finalY + 21);
    doc.text(fmtMoney(t.totalVente * 1.2) + ' DH', pw - 14, finalY + 21, { align: 'right' });

    // Notes
    if (App.notes) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(71, 85, 105);
      doc.text('Notes: ' + App.notes, 14, finalY + 5);
    }

    // Signatures
    const sigY = Math.max(finalY + 40, 220);
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'bold');
    doc.text('Signature Client:', 14, sigY);
    doc.setFont('helvetica', 'normal');
    doc.rect(14, sigY + 3, 70, 20);
    doc.text('Cachet & Signature Société:', pw / 2 + 10, sigY);
    doc.rect(pw / 2 + 10, sigY + 3, 70, 20);
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7);
    doc.text(App.company.name, pw / 2 + 12, sigY + 8);

    // Footer
    doc.setFontSize(7);
    doc.setTextColor(150);
    doc.setFont('helvetica', 'normal');
    doc.text(`Document généré par CCTV Quote Pro · ${new Date().toLocaleDateString('fr-FR', {day:'2-digit',month:'long',year:'numeric'})}`, pw / 2, 290, { align: 'center' });

    doc.save(`${App.quoteNumber}.pdf`);
    showToast('✅ PDF exporté: ' + App.quoteNumber);
  } catch (err) {
    console.error(err);
    showToast('❌ Erreur PDF: ' + err.message);
  }
}

function loadScript(src) {
  return new Promise((res, rej) => {
    if (document.querySelector(`script[src="${src}"]`)) { res(); return; }
    const s = document.createElement('script');
    s.src = src; s.onload = res; s.onerror = rej;
    document.head.appendChild(s);
  });
}

// ── Print ─────────────────────────────────────────────────────
function printQuote() {
  const t = calcTotals();
  if (t.items.length === 0) { showToast('⚠️ Ajoutez des produits d\'abord'); return; }
  switchTab('quote');
  setTimeout(() => window.print(), 100);
}

// ── Toast ─────────────────────────────────────────────────────
function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

// ── Modal ─────────────────────────────────────────────────────
function closeModal(id) {
  const m = document.getElementById(id);
  if (m) m.classList.remove('open');
}

// ── PWA ───────────────────────────────────────────────────────
let deferredPrompt = null;
function setupPWA() {
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;
    document.getElementById('pwa-banner')?.classList.add('visible');
  });
}
function installPWA() {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  deferredPrompt.userChoice.then(() => {
    deferredPrompt = null;
    document.getElementById('pwa-banner')?.classList.remove('visible');
  });
}

// ── Utilities ─────────────────────────────────────────────────
function fmtMoney(n) {
  return Number(n).toLocaleString('fr-MA', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

// ── Global events ─────────────────────────────────────────────
function bindGlobalEvents() {
  // Close modal on overlay click
  document.querySelectorAll('.modal-overlay').forEach(m => {
    m.addEventListener('click', e => { if (e.target === m) m.classList.remove('open'); });
  });
  // Admin pwd enter key
  document.getElementById('admin-pwd')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') checkAdminCode();
  });
  // Client fields
  ['client-name','client-phone','client-address','client-ref','client-date','quote-notes'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', onClientChange);
  });
  // Company fields
  ['co-name','co-address','co-phone','co-email'].forEach(id => {
    document.getElementById(id)?.addEventListener('input', onCompanyChange);
  });
}

// ── Expose to HTML ────────────────────────────────────────────
Object.assign(window, {
  toggleCategory, changeQty, setQty, switchTab, toggleDark,
  onSearch, openAdminModal, checkAdminCode, closeModal,
  resetQuote, duplicateQuote, exportPDF, printQuote,
  triggerLogoUpload, onLogoUpload, removeLogo, installPWA,
  onClientChange, onCompanyChange
});
