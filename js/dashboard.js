/* ==========================================================================
   GateFlow Dashboard JavaScript Logic
   Interactive UI, Real-time Charts, Modal & CRUD Operations
   ========================================================================== */

let currentDeletingLockerId = null;
let currentChartMetric = 'clicks'; // clicks | unlocks | revenue

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  renderDashboardStats();
  renderLockersTable();
  renderChart();
  renderAnalyticsDailyTable();
  initCreateLockerForm();
  initPayoutForm();
  initSettingsForm();
  initSearch();
});

// Navigation Handling
function initNavigation() {
  const sidebarItems = document.querySelectorAll('.sidebar-item[data-view]');
  const views = document.querySelectorAll('.dashboard-view');
  const pageTitle = document.getElementById('pageTitle');

  const titles = {
    overview: 'Platform Overview',
    lockers: 'Locker Management',
    analytics: 'Performance Analytics',
    payouts: 'Payouts & Wallet',
    settings: 'Settings & API Keys'
  };

  sidebarItems.forEach(item => {
    item.addEventListener('click', () => {
      const viewKey = item.dataset.view;
      sidebarItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      views.forEach(v => v.classList.remove('active'));
      const activeView = document.getElementById(`view${capitalize(viewKey)}`);
      if (activeView) activeView.classList.add('active');

      if (pageTitle && titles[viewKey]) {
        pageTitle.textContent = titles[viewKey];
      }

      if (viewKey === 'lockers') {
        renderLockersTable('allLockersTableBody');
      }

      lucide.createIcons();
    });
  });

  // Topbar Create button
  document.getElementById('btnOpenCreateLocker')?.addEventListener('click', openCreateModal);
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Render Overview Metrics
function renderDashboardStats() {
  const metrics = GateStore.getMetrics();
  const settings = GateStore.getSettings();

  const totalClicksEl = document.getElementById('statTotalClicks');
  const totalOffersEl = document.getElementById('statTotalOffers');
  const totalUnlocksEl = document.getElementById('statTotalUnlocks');
  const totalRevenueEl = document.getElementById('statTotalRevenue');
  const conversionEl = document.getElementById('statConversion');
  const topbarBalanceEl = document.getElementById('topbarBalance');
  const payoutBalanceEl = document.getElementById('payoutAvailableBalance');
  const countBadge = document.getElementById('lockerCountBadge');

  if (totalClicksEl) totalClicksEl.textContent = metrics.totalClicks.toLocaleString();
  if (totalOffersEl) totalOffersEl.textContent = metrics.totalUnlocks.toLocaleString();
  if (totalUnlocksEl) totalUnlocksEl.textContent = metrics.totalUnlocks.toLocaleString();
  if (totalRevenueEl) totalRevenueEl.textContent = `$${metrics.totalRevenue}`;
  if (conversionEl) conversionEl.textContent = `${metrics.avgConversion}%`;

  const balanceFormatted = `$${settings.profile.balance.toFixed(2)}`;
  if (topbarBalanceEl) topbarBalanceEl.textContent = balanceFormatted;
  if (payoutBalanceEl) payoutBalanceEl.textContent = balanceFormatted;

  const lockers = GateStore.getLockers();
  if (countBadge) countBadge.textContent = `${lockers.length} Active`;
}

// Render Lockers Table
function renderLockersTable(targetTbodyId = 'lockersTableBody', filterQuery = '') {
  const tbody = document.getElementById(targetTbodyId);
  if (!tbody) return;

  const lockers = GateStore.getLockers();
  const filtered = lockers.filter(l => {
    if (!filterQuery) return true;
    const q = filterQuery.toLowerCase();
    return l.name.toLowerCase().includes(q) || l.slug.toLowerCase().includes(q);
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7">
          <div class="empty-state">
            <i data-lucide="inbox" class="empty-state-icon"></i>
            <h4 class="empty-state-title">No lockers found</h4>
            <p class="empty-state-desc">You don't have any content lockers matching this query. Create your first link to start monetizing.</p>
            <button class="btn btn-primary btn-sm" onclick="openCreateModal()">Create Locker</button>
          </div>
        </td>
      </tr>
    `;
    lucide.createIcons();
    return;
  }

  tbody.innerHTML = filtered.map(l => {
    const lockerUrl = `locker.html?slug=${l.slug}`;
    return `
      <tr>
        <td>
          <div class="cell-locker-name">
            <span>${escapeHtml(l.name)}</span>
            <span class="cell-slug">blackpass.link/l/${escapeHtml(l.slug)}</span>
          </div>
        </td>
        <td>
          <span class="cell-url-truncate" title="${escapeHtml(l.destinationUrl)}">
            ${escapeHtml(l.destinationUrl)}
          </span>
        </td>
        <td>
          <span class="badge badge-muted">
            ${l.steps} Step${l.steps > 1 ? 's' : ''} &bull; ${l.timer}s
          </span>
        </td>
        <td>
          <strong style="color: #F8FAFC;">${(l.clicks || 0).toLocaleString()}</strong>
          <span style="color: var(--text-muted); font-size: 12px;"> / ${(l.unlocks || 0).toLocaleString()}</span>
        </td>
        <td>
          <strong style="color: #10B981; font-family: var(--font-mono);">$${(l.revenue || 0).toFixed(2)}</strong>
        </td>
        <td>
          <span class="badge badge-success">Active</span>
        </td>
        <td style="text-align: right;">
          <div class="cell-actions" style="justify-content: flex-end;">
            <button class="action-btn" title="Copy Short Link" onclick="copyLockerLink('${l.slug}')">
              <i data-lucide="copy" style="width: 14px; height: 14px;"></i>
            </button>
            <a href="${lockerUrl}" target="_blank" class="action-btn" title="Test Live Gate">
              <i data-lucide="external-link" style="width: 14px; height: 14px;"></i>
            </a>
            <button class="action-btn delete-btn" title="Delete Locker" onclick="promptDeleteLocker('${l.id}')">
              <i data-lucide="trash-2" style="width: 14px; height: 14px;"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');

  lucide.createIcons();
}

// Copy Locker Link
window.copyLockerLink = function(slug) {
  const fullUrl = `${window.location.origin}${window.location.pathname.replace('dashboard.html', '')}locker.html?slug=${slug}`;
  navigator.clipboard.writeText(fullUrl).then(() => {
    showToast('Locker link copied to clipboard!', 'success');
  }).catch(() => {
    showToast(`Link: ${fullUrl}`, 'info');
  });
};

// Search Filter
function initSearch() {
  const searchInput = document.getElementById('searchLockersInput');
  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    renderLockersTable('lockersTableBody', e.target.value.trim());
  });
}

// SVG Activity Chart Engine
function renderChart() {
  const container = document.getElementById('chartContainer');
  if (!container) return;

  const tabs = document.querySelectorAll('.chart-tab-btn');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentChartMetric = tab.dataset.chartMetric;
      drawChart();
    });
  });

  drawChart();
}

function drawChart() {
  const container = document.getElementById('chartContainer');
  if (!container) return;

  // Mock 7-day data
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dataMap = {
    clicks: [2840, 3120, 3950, 4200, 4890, 5600, 6120],
    unlocks: [1420, 1590, 1980, 2150, 2480, 2810, 3090],
    revenue: [8.50, 9.40, 11.20, 12.80, 14.50, 16.20, 17.90]
  };

  const values = dataMap[currentChartMetric];
  const maxVal = Math.max(...values) * 1.15;
  const width = container.clientWidth || 700;
  const height = 220;
  const padBottom = 30;
  const padTop = 20;
  const padLeft = 45;
  const padRight = 20;

  const chartW = width - padLeft - padRight;
  const chartH = height - padTop - padBottom;

  const points = values.map((v, i) => {
    const x = padLeft + (i / (values.length - 1)) * chartW;
    const y = padTop + chartH - (v / maxVal) * chartH;
    return { x, y, v, day: days[i] };
  });

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${padTop + chartH} L ${points[0].x} ${padTop + chartH} Z`;

  const lineColor = currentChartMetric === 'revenue' ? '#10B981' : '#6366F1';
  const fillColor = currentChartMetric === 'revenue' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(99, 102, 241, 0.12)';

  let svgHtml = `
    <svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}" style="overflow: visible;">
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${lineColor}" stop-opacity="0.25"/>
          <stop offset="100%" stop-color="${lineColor}" stop-opacity="0.0"/>
        </linearGradient>
      </defs>

      <!-- Horizontal gridlines -->
      <line x1="${padLeft}" y1="${padTop + chartH * 0.25}" x2="${width - padRight}" y2="${padTop + chartH * 0.25}" stroke="rgba(255,255,255,0.05)" stroke-dasharray="4"/>
      <line x1="${padLeft}" y1="${padTop + chartH * 0.5}" x2="${width - padRight}" y2="${padTop + chartH * 0.5}" stroke="rgba(255,255,255,0.05)" stroke-dasharray="4"/>
      <line x1="${padLeft}" y1="${padTop + chartH * 0.75}" x2="${width - padRight}" y2="${padTop + chartH * 0.75}" stroke="rgba(255,255,255,0.05)" stroke-dasharray="4"/>
      <line x1="${padLeft}" y1="${padTop + chartH}" x2="${width - padRight}" y2="${padTop + chartH}" stroke="rgba(255,255,255,0.1)"/>

      <!-- Fill Area -->
      <path d="${areaD}" fill="url(#chartGrad)" />

      <!-- Stroke Line -->
      <path d="${pathD}" fill="none" stroke="${lineColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />

      <!-- Data Dots and Labels -->
      ${points.map(p => `
        <circle cx="${p.x}" cy="${p.y}" r="4" fill="${lineColor}" stroke="#0E121B" stroke-width="2"/>
        <text x="${p.x}" y="${height - 8}" text-anchor="middle" fill="#64748B" font-size="11" font-weight="600">${p.day}</text>
        <text x="${p.x}" y="${p.y - 10}" text-anchor="middle" fill="#F8FAFC" font-size="11" font-family="'JetBrains Mono', monospace" font-weight="600">${currentChartMetric === 'revenue' ? '$' + p.v.toFixed(2) : p.v.toLocaleString()}</text>
      `).join('')}
    </svg>
  `;

  container.innerHTML = svgHtml;
}

// Render Daily Analytics Table
function renderAnalyticsDailyTable() {
  const tbody = document.getElementById('analyticsDailyTbody');
  if (!tbody) return;

  const mockRows = [
    { date: '2026-09-26', clicks: 6120, visitors: 4890, tasks: 3090, rate: '50.4%', cpm: '$5.80', rev: '$17.90' },
    { date: '2026-09-25', clicks: 5600, visitors: 4420, tasks: 2810, rate: '50.1%', cpm: '$5.76', rev: '$16.20' },
    { date: '2026-09-24', clicks: 4890, visitors: 3910, tasks: 2480, rate: '50.7%', cpm: '$5.84', rev: '$14.50' },
    { date: '2026-09-23', clicks: 4200, visitors: 3350, tasks: 2150, rate: '51.1%', cpm: '$5.95', rev: '$12.80' },
    { date: '2026-09-22', clicks: 3950, visitors: 3120, tasks: 1980, rate: '50.1%', cpm: '$5.65', rev: '$11.20' },
    { date: '2026-09-21', clicks: 3120, visitors: 2510, tasks: 1590, rate: '50.9%', cpm: '$5.91', rev: '$9.40' },
    { date: '2026-09-20', clicks: 2840, visitors: 2280, tasks: 1420, rate: '50.0%', cpm: '$5.98', rev: '$8.50' }
  ];

  tbody.innerHTML = mockRows.map(r => `
    <tr>
      <td style="font-family: var(--font-mono); font-weight: 500;">${r.date}</td>
      <td>${r.clicks.toLocaleString()}</td>
      <td>${r.visitors.toLocaleString()}</td>
      <td><strong style="color: #F8FAFC;">${r.tasks.toLocaleString()}</strong></td>
      <td><span class="badge badge-success">${r.rate}</span></td>
      <td>${r.cpm}</td>
      <td><strong style="color: #10B981; font-family: var(--font-mono);">${r.rev}</strong></td>
    </tr>
  `).join('');
}

// Modal Management: Create Locker
window.openCreateModal = function() {
  const modal = document.getElementById('createLockerModal');
  if (modal) modal.classList.add('active');
};

window.closeCreateModal = function() {
  const modal = document.getElementById('createLockerModal');
  if (modal) modal.classList.remove('active');
};

function initCreateLockerForm() {
  const form = document.getElementById('createLockerForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('inputLockerName').value;
    const destinationUrl = document.getElementById('inputDestinationUrl').value;
    const slug = document.getElementById('inputLockerSlug').value;
    const steps = document.getElementById('inputLockerSteps').value;
    const timer = document.getElementById('inputLockerTimer').value;
    const popunder = document.getElementById('togglePopunder').checked;
    const banner = document.getElementById('toggleBanner').checked;
    const antiBypass = document.getElementById('toggleAntiBypass').checked;

    const newLocker = GateStore.createLocker({
      name,
      destinationUrl,
      slug,
      steps: Number(steps),
      timer: Number(timer),
      antiBypass,
      ads: { popunder, banner, smartlink: true }
    });

    closeCreateModal();
    form.reset();
    renderDashboardStats();
    renderLockersTable('lockersTableBody');
    renderLockersTable('allLockersTableBody');

    showToast(`Content Locker "${newLocker.name}" created successfully!`, 'success');
  });
}

// Modal Management: Delete Locker
window.promptDeleteLocker = function(id) {
  currentDeletingLockerId = id;
  const modal = document.getElementById('deleteModal');
  if (modal) modal.classList.add('active');
};

window.closeDeleteModal = function() {
  currentDeletingLockerId = null;
  const modal = document.getElementById('deleteModal');
  if (modal) modal.classList.remove('active');
};

document.getElementById('btnConfirmDelete')?.addEventListener('click', () => {
  if (currentDeletingLockerId) {
    GateStore.deleteLocker(currentDeletingLockerId);
    closeDeleteModal();
    renderDashboardStats();
    renderLockersTable('lockersTableBody');
    renderLockersTable('allLockersTableBody');
    showToast('Locker permanently deleted.', 'info');
  }
});

// Payout Form
function initPayoutForm() {
  const form = document.getElementById('payoutForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const settings = GateStore.getSettings();

    if (settings.profile.balance < 5.0) {
      showToast('Minimum withdrawal amount is $5.00', 'error');
      return;
    }

    const withdrawnAmount = settings.profile.balance;
    settings.profile.balance = 0.00;
    settings.profile.pendingPayout = withdrawnAmount;
    GateStore.saveSettings(settings);

    renderDashboardStats();
    showToast(`Payout request for $${withdrawnAmount.toFixed(2)} submitted! Estimated transfer: 15 mins.`, 'success', 5000);
  });
}

// Settings Handlers
function initSettingsForm() {
  document.getElementById('btnSaveProfile')?.addEventListener('click', () => {
    const username = document.getElementById('settingsUsername').value;
    const email = document.getElementById('settingsEmail').value;
    const settings = GateStore.getSettings();
    settings.profile.username = username;
    settings.profile.email = email;
    GateStore.saveSettings(settings);

    const sbUsername = document.getElementById('sidebarUsername');
    if (sbUsername) sbUsername.textContent = username;

    showToast('Publisher profile saved successfully.', 'success');
  });

  document.getElementById('btnSaveApiSettings')?.addEventListener('click', () => {
    const webhookUrl = document.getElementById('settingsWebhookUrl').value;
    const settings = GateStore.getSettings();
    settings.api.webhookUrl = webhookUrl;
    GateStore.saveSettings(settings);
    showToast('Webhook endpoint and API parameters updated.', 'success');
  });
}

window.toggleApiKeyVisibility = function() {
  const input = document.getElementById('settingsApiKey');
  if (input) {
    input.type = input.type === 'password' ? 'text' : 'password';
  }
};

window.copyApiKey = function() {
  const input = document.getElementById('settingsApiKey');
  if (input) {
    navigator.clipboard.writeText(input.value);
    showToast('API Key copied to clipboard!', 'success');
  }
};

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, m => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[m]));
}
