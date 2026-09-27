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

  const getTitles = () => ({
    overview: typeof getI18nText === 'function' ? getI18nText('menu_overview', 'Platform Overview') : 'Platform Overview',
    lockers: typeof getI18nText === 'function' ? getI18nText('menu_lockers', 'Locker Management') : 'Locker Management',
    analytics: typeof getI18nText === 'function' ? getI18nText('menu_analytics', 'Performance Analytics') : 'Performance Analytics',
    payouts: typeof getI18nText === 'function' ? getI18nText('menu_payouts', 'Payouts & Wallet') : 'Payouts & Wallet',
    settings: typeof getI18nText === 'function' ? getI18nText('menu_settings', 'Settings & API Keys') : 'Settings & API Keys'
  });

  sidebarItems.forEach(item => {
    item.addEventListener('click', () => {
      const viewKey = item.dataset.view;
      sidebarItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      views.forEach(v => v.classList.remove('active'));
      const activeView = document.getElementById(`view${capitalize(viewKey)}`);
      if (activeView) activeView.classList.add('active');

      const titles = getTitles();
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

  // Language Change Listener
  window.onLanguageChanged = (lang) => {
    renderDashboardStats();
    renderLockersTable('lockersTableBody');
    renderLockersTable('allLockersTableBody');
    const activeItem = document.querySelector('.sidebar-item.active[data-view]');
    if (activeItem && pageTitle) {
      const titles = getTitles();
      if (titles[activeItem.dataset.view]) {
        pageTitle.textContent = titles[activeItem.dataset.view];
      }
    }
  };
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

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const metrics = GateStore.getMetrics();
  const hasData = Number(metrics.totalClicks) > 0 || Number(metrics.totalRevenue) > 0;

  const dataMap = {
    clicks: hasData ? [0, 0, 0, 0, 0, 0, Number(metrics.totalClicks)] : [0, 0, 0, 0, 0, 0, 0],
    unlocks: hasData ? [0, 0, 0, 0, 0, 0, Number(metrics.totalUnlocks)] : [0, 0, 0, 0, 0, 0, 0],
    revenue: hasData ? [0, 0, 0, 0, 0, 0, Number(metrics.totalRevenue)] : [0, 0, 0, 0, 0, 0, 0]
  };

  const values = dataMap[currentChartMetric] || [0, 0, 0, 0, 0, 0, 0];
  const maxVal = Math.max(...values, 10);
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

  const emptyText = (typeof getI18nText === 'function' && window.currentAppLanguage === 'th')
    ? 'ยังไม่มีข้อมูลสถิติรายวัน (ระบบจะเริ่มบันทึกอัตโนมัติเมื่อมีคนคลิกเข้าสู่ Locker)'
    : 'No daily telemetry recorded yet. Live traffic will appear here as users engage.';

  tbody.innerHTML = `
    <tr>
      <td colspan="7" style="text-align: center; padding: 36px 20px; color: var(--text-muted);">
        <i data-lucide="inbox" style="width: 24px; height: 24px; margin: 0 auto 8px; display: block; opacity: 0.4;"></i>
        <span>${emptyText}</span>
      </td>
    </tr>
  `;
  if (typeof lucide !== 'undefined') lucide.createIcons();
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

  // Listen for background Firestore locker sync updates
  window.onLockersUpdated = () => {
    renderDashboardStats();
    renderLockersTable('lockersTableBody');
    renderLockersTable('allLockersTableBody');
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('inputLockerName').value;
    const destinationUrl = document.getElementById('inputDestinationUrl').value;
    const slug = document.getElementById('inputLockerSlug').value;
    const steps = document.getElementById('inputLockerSteps').value;
    const timer = document.getElementById('inputLockerTimer').value;
    const popunder = document.getElementById('togglePopunder').checked;
    const banner = document.getElementById('toggleBanner').checked;
    const antiBypass = document.getElementById('toggleAntiBypass').checked;
    const smartlinkUrl = document.getElementById('inputLockerSmartlink')?.value || '';

    const newLocker = await GateStore.createLocker({
      name,
      destinationUrl,
      slug,
      steps: Number(steps),
      timer: Number(timer),
      antiBypass,
      smartlinkUrl,
      ads: { popunder, banner, smartlink: true }
    });

    closeCreateModal();
    form.reset();
    renderDashboardStats();
    renderLockersTable('lockersTableBody');
    renderLockersTable('allLockersTableBody');

    showToast(`Content Locker "${newLocker.name}" created and synced online!`, 'success');
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

document.getElementById('btnConfirmDelete')?.addEventListener('click', async () => {
  if (currentDeletingLockerId) {
    await GateStore.deleteLocker(currentDeletingLockerId);
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
function loadSettingsToUI() {
  const settings = GateStore.getSettings();

  const usernameInput = document.getElementById('settingsUsername');
  if (usernameInput && settings.profile?.username) {
    usernameInput.value = settings.profile.username;
  }

  const emailInput = document.getElementById('settingsEmail');
  if (emailInput) {
    emailInput.value = settings.profile?.email || (GateStore.currentUser ? GateStore.currentUser.email : '');
  }

  const customDomainInput = document.getElementById('settingsCustomDomain');
  if (customDomainInput && settings.customDomain) {
    customDomainInput.value = settings.customDomain;
  }

  const webhookInput = document.getElementById('settingsWebhookUrl');
  if (webhookInput && settings.api?.webhookUrl) {
    webhookInput.value = settings.api.webhookUrl;
  }

  const networkSelect = document.getElementById('settingsAdNetwork');
  if (networkSelect && settings.ads?.network) {
    networkSelect.value = settings.ads.network;
  }

  const smartlinkInput = document.getElementById('settingsSmartlinkUrl');
  if (smartlinkInput && settings.ads?.smartlinkUrl) {
    smartlinkInput.value = settings.ads.smartlinkUrl;
  }

  const popunderInput = document.getElementById('settingsPopunderScript');
  if (popunderInput && settings.ads?.popunderScript) {
    popunderInput.value = settings.ads.popunderScript;
  }

  const bannerInput = document.getElementById('settingsBannerCode');
  if (bannerInput && settings.ads?.bannerCode) {
    bannerInput.value = settings.ads.bannerCode;
  }
}

function initSettingsForm() {
  loadSettingsToUI();

  // Save Publisher Profile
  document.getElementById('btnSaveProfile')?.addEventListener('click', () => {
    const username = document.getElementById('settingsUsername').value;
    const email = document.getElementById('settingsEmail').value;
    const settings = GateStore.getSettings();
    settings.profile.username = username;
    settings.profile.email = email;
    GateStore.saveSettings(settings);

    const sbUsername = document.getElementById('sidebarUsername');
    if (sbUsername) sbUsername.textContent = username;

    const msg = (typeof getI18nText === 'function' && window.currentAppLanguage === 'th') ? 'บันทึกข้อมูลส่วนตัวสำเร็จแล้ว' : 'Publisher profile saved successfully.';
    showToast(msg, 'success');
  });

  // Save Ad Network & Monetization Configuration
  document.getElementById('btnSaveAdSettings')?.addEventListener('click', () => {
    const network = document.getElementById('settingsAdNetwork')?.value || 'adsterra';
    const smartlinkUrl = (document.getElementById('settingsSmartlinkUrl')?.value || '').trim();
    const popunderScript = (document.getElementById('settingsPopunderScript')?.value || '').trim();
    const bannerCode = (document.getElementById('settingsBannerCode')?.value || '').trim();

    const settings = GateStore.getSettings();
    settings.ads = {
      network,
      smartlinkUrl,
      popunderScript,
      bannerCode
    };
    GateStore.saveSettings(settings);

    const msg = (typeof getI18nText === 'function' && window.currentAppLanguage === 'th')
      ? 'บันทึกการตั้งค่าโฆษณาเรียบร้อยแล้ว! ทุกคลิกจะสร้างรายได้เข้าบัญชีของคุณโดยตรง'
      : 'Ad Network configuration saved! Traffic will now monetize directly to your account.';
    showToast(msg, 'success');
  });

  // Save Custom Domain
  document.getElementById('btnSaveCustomDomain')?.addEventListener('click', () => {
    const domain = (document.getElementById('settingsCustomDomain')?.value || '').trim();
    const settings = GateStore.getSettings();
    settings.customDomain = domain;
    GateStore.saveSettings(settings);

    const msg = (typeof getI18nText === 'function' && window.currentAppLanguage === 'th') ? 'บันทึกโดเมนกำหนดเองเรียบร้อยแล้ว' : 'Custom domain saved successfully.';
    showToast(msg, 'success');
  });

  // Save API & Webhook
  document.getElementById('btnSaveApiSettings')?.addEventListener('click', () => {
    const webhookUrl = document.getElementById('settingsWebhookUrl').value;
    const settings = GateStore.getSettings();
    settings.api = settings.api || {};
    settings.api.webhookUrl = webhookUrl;
    GateStore.saveSettings(settings);
    const msg = (typeof getI18nText === 'function' && window.currentAppLanguage === 'th') ? 'บันทึกการตั้งค่า Webhook & API เรียบร้อยแล้ว' : 'Webhook endpoint and API parameters updated.';
    showToast(msg, 'success');
  });

  // Danger Zone: Reset
  document.getElementById('btnResetAllData')?.addEventListener('click', () => {
    const confirmMsg = typeof getI18nText === 'function' ? getI18nText('reset_confirm_msg', 'คุณต้องการรีเซ็ตข้อมูลทั้งหมดในระบบให้เป็นค่าว่างเปล่า (0) ใช่หรือไม่?') : 'Are you sure you want to reset all platform data to completely empty (0)?';
    if (confirm(confirmMsg)) {
      GateStore.resetAllData();
      renderDashboardStats();
      renderLockersTable('lockersTableBody');
      renderLockersTable('allLockersTableBody');
      drawChart();
      renderAnalyticsDailyTable();
      loadSettingsToUI();
      const successMsg = typeof getI18nText === 'function' ? getI18nText('reset_success_msg', 'รีเซ็ตข้อมูลทั้งหมดเป็นค่าว่างเรียบร้อยแล้ว!') : 'All platform data reset to blank successfully!';
      showToast(successMsg, 'success');
    }
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
