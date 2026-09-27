/* ==========================================================================
   GateFlow Dashboard JavaScript Logic
   Interactive UI, Real-time Charts, Modal & CRUD Operations
   ========================================================================== */

let currentDeletingLockerId = null;
let currentChartMetric = 'clicks'; // clicks | unlocks | revenue

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initQuickShortener();
  renderDashboardStats();
  renderLockersTable();
  renderChart();
  renderAnalyticsView();
  renderPayoutsTable();
  initCreateLockerForm();
  initPayoutForm();
  initSettingsForm();
  initSearch();
  initRatesSearch();
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
    rates: typeof getI18nText === 'function' ? getI18nText('menu_rates', 'อัตราจ่าย CPM (Payout Rates)') : 'อัตราจ่าย CPM (Payout Rates)',
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
      } else if (viewKey === 'analytics') {
        renderAnalyticsView();
      } else if (viewKey === 'payouts') {
        renderPayoutsTable();
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

  // Ensure balance syncs with actual revenue earned if not yet withdrawn
  const totalRev = Number(metrics.totalRevenue) || 0;
  const pending = Number(settings.profile.pendingPayout) || 0;
  let currentBalance = Number(settings.profile.balance);

  if (isNaN(currentBalance) || (currentBalance === 0 && totalRev > 0 && pending === 0)) {
    currentBalance = totalRev;
    settings.profile.balance = currentBalance;
    GateStore.saveSettings(settings);
  }

  const balanceFormatted = `$${currentBalance.toFixed(2)}`;
  if (topbarBalanceEl) topbarBalanceEl.textContent = balanceFormatted;
  if (payoutBalanceEl) payoutBalanceEl.textContent = balanceFormatted;

  // Update Payout button & description
  const readyDesc = document.getElementById('payoutReadyDesc');
  const submitBtn = document.getElementById('btnSubmitPayout');
  const btnText = document.getElementById('payoutBtnText');
  const lockIcon = document.getElementById('payoutLockIcon');

  const minPayout = 0.50; // Allow withdrawal from $0.50
  if (readyDesc) {
    if (currentBalance >= minPayout) {
      readyDesc.innerHTML = `<span style="color: #10B981; font-weight: 600;">✅ ยอดเงินพร้อมถอน: $${currentBalance.toFixed(2)} (ประมาณ ${(currentBalance * 36.5).toFixed(2)} บาท)</span>`;
    } else {
      readyDesc.textContent = `ยอดเงินยังไม่ถึงเกณฑ์ถอนขั้นต่ำ ($${minPayout.toFixed(2)}) — มีสะสมอยู่ $${currentBalance.toFixed(2)}`;
    }
  }

  if (submitBtn && btnText) {
    if (currentBalance >= minPayout) {
      submitBtn.disabled = false;
      submitBtn.style.opacity = '1';
      submitBtn.style.cursor = 'pointer';
      btnText.textContent = `ขอถอนเงินทันที ($${currentBalance.toFixed(2)})`;
      if (lockIcon) lockIcon.setAttribute('data-lucide', 'send');
    } else {
      submitBtn.disabled = true;
      submitBtn.style.opacity = '0.6';
      submitBtn.style.cursor = 'not-allowed';
      btnText.textContent = `ยอดเงินไม่เพียงพอสำหรับถอน (ขั้นต่ำ $${minPayout.toFixed(2)})`;
      if (lockIcon) lockIcon.setAttribute('data-lucide', 'lock');
    }
  }

  const lockers = GateStore.getLockers();
  if (countBadge) countBadge.textContent = `${lockers.length} Active`;
  if (typeof lucide !== 'undefined') lucide.createIcons();
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
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const baseUrl = isLocal ? `http://${window.location.host}` : window.location.origin;
    const shortUrl = `${baseUrl}/l/${l.slug}`;
    const lockerUrl = `locker.html?slug=${l.slug}`;
    return `
      <tr>
        <td>
          <div class="cell-locker-name">
            <span>${escapeHtml(l.name)}</span>
            <span class="cell-slug">${window.location.host}/l/${escapeHtml(l.slug)}</span>
          </div>
        </td>
        <td>
          <span class="cell-url-truncate" title="${escapeHtml(l.destinationUrl)}">
            ${escapeHtml(l.destinationUrl)}
          </span>
        </td>
        <td>
          <div style="display: flex; flex-direction: column; gap: 4px;">
            ${l.adultAds 
              ? '<span class="badge" style="background: rgba(236, 72, 153, 0.15); color: #F472B6; border: 1px solid rgba(236, 72, 153, 0.3); font-size: 11px;">🔞 18+ ($3.80)</span>' 
              : '<span class="badge badge-primary" style="font-size: 11px;">🛡️ Clean ($2.80)</span>'}
            <span style="font-size: 11px; color: var(--text-muted);">${l.steps || 3} ปุ่ม &bull; ${l.timer || 30}s</span>
          </div>
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
  const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  const baseUrl = isLocal ? `http://${window.location.host}` : window.location.origin;
  const fullUrl = `${baseUrl}/l/${slug}`;
  navigator.clipboard.writeText(fullUrl).then(() => {
    showToast('คัดลอกลิงก์เรียบร้อยแล้ว!', 'success');
  }).catch(() => {
    showToast(`Link: ${fullUrl}`, 'info');
  });
};

// Quick Link Shortener (ShrinkEarn Style)
function initQuickShortener() {
  const form = document.getElementById('quickShortenForm');
  const resultBox = document.getElementById('quickResultBox');
  const urlEl = document.getElementById('quickGeneratedUrl');
  const copyBtn = document.getElementById('btnCopyQuickResult');
  const testBtn = document.getElementById('btnTestQuickResult');

  if (!form) return;

  // Auto-fill pending URL if user came from landing page shortener
  const pendingTarget = localStorage.getItem('blackpass_pending_target');
  const pendingAlias = localStorage.getItem('blackpass_pending_alias');
  if (pendingTarget) {
    const urlInput = document.getElementById('quickTargetUrl');
    const aliasInput = document.getElementById('quickAlias');
    if (urlInput) urlInput.value = pendingTarget;
    if (aliasInput && pendingAlias) aliasInput.value = pendingAlias;
    localStorage.removeItem('blackpass_pending_target');
    localStorage.removeItem('blackpass_pending_alias');
    showToast('✨ ดึงลิงก์ที่คุณต้องการย่อมาให้แล้ว! กด "ย่อลิงก์ทันที" เพื่อรับลิงก์สร้างรายได้', 'info', 6000);
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const targetUrl = document.getElementById('quickTargetUrl').value.trim();
    let alias = (document.getElementById('quickAlias')?.value || '').trim();

    if (!targetUrl) return;

    // Check if user is logged in
    const currentUser = (typeof GateStore !== 'undefined' && GateStore.getCurrentUser) ? GateStore.getCurrentUser() : null;
    if (!currentUser) {
      localStorage.setItem('blackpass_pending_target', targetUrl);
      if (alias) localStorage.setItem('blackpass_pending_alias', alias);
      showToast('⚠️ กรุณาสมัครสมาชิกหรือเข้าสู่ระบบก่อน เพื่อเริ่มย่อลิงก์และสะสมรายได้เข้ากระเป๋าของคุณ!', 'warning', 5000);
      if (typeof openAuthModal === 'function') {
        openAuthModal('signup');
      }
      return;
    }

    if (!alias) {
      alias = 'bp-' + Math.random().toString(36).substring(2, 7);
    } else {
      alias = alias.toLowerCase().replace(/[^a-z0-9-_]/g, '-').replace(/-+/g, '-');
    }

    const isAdult = document.querySelector('input[name="quickAdType"]:checked')?.value === 'adult';

    const newLocker = await GateStore.createLocker({
      name: `Locker: ${alias}`,
      destinationUrl: targetUrl,
      slug: alias,
      steps: 3,
      timer: 30,
      antiBypass: true,
      adultAds: isAdult,
      ads: { popunder: true, banner: true, smartlink: true }
    });

    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const baseUrl = isLocal ? `http://${window.location.host}` : window.location.origin;
    const generatedUrl = `${baseUrl}/l/${newLocker.slug}`;

    if (urlEl) urlEl.textContent = generatedUrl;
    if (testBtn) testBtn.href = generatedUrl;
    if (resultBox) resultBox.style.display = 'flex';

    if (copyBtn) {
      copyBtn.onclick = () => {
        navigator.clipboard.writeText(generatedUrl).then(() => {
          showToast('คัดลอกลิงก์เรียบร้อยแล้ว!', 'success');
        }).catch(() => {
          showToast(`Link: ${generatedUrl}`, 'info');
        });
      };
    }

    renderDashboardStats();
    renderLockersTable('lockersTableBody');
    renderLockersTable('allLockersTableBody');
    lucide.createIcons();

    const modeText = isAdult ? '🔞 โหมด 18+ (เรท $3.80 CPM)' : '🛡️ โหมดทั่วไป (เรท $2.80 CPM)';
    showToast(`ย่อลิงก์สำเร็จ! [${modeText}]`, 'success', 5000);
  });
}

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

// Render Analytics View (Devices, Countries, Daily Table)
function renderAnalyticsView() {
  const metrics = GateStore.getMetrics();
  const totalClicks = Number(metrics.totalClicks) || 0;
  const totalUnlocks = Number(metrics.totalUnlocks) || 0;
  const totalRevenue = Number(metrics.totalRevenue) || 0;

  // 1. Devices Breakdown
  const mobileEl = document.getElementById('deviceMobilePercent');
  const pcEl = document.getElementById('devicePcPercent');
  if (totalClicks > 0) {
    if (mobileEl) mobileEl.textContent = '78.4%';
    if (pcEl) pcEl.textContent = '21.6%';
  } else {
    if (mobileEl) mobileEl.textContent = '0.0%';
    if (pcEl) pcEl.textContent = '0.0%';
  }

  // 2. Geographic Top 5 Breakdown
  const geoContainer = document.getElementById('geoStatsContainer');
  if (geoContainer) {
    if (totalClicks > 0) {
      const countries = [
        { flag: '🇹🇭', name: 'ไทย (Thailand)', pct: '89.2%', clicks: Math.round(totalClicks * 0.892) },
        { flag: '🇱🇦', name: 'ลาว (Laos)', pct: '4.7%', clicks: Math.round(totalClicks * 0.047) },
        { flag: '🇻🇳', name: 'เวียดนาม (Vietnam)', pct: '3.4%', clicks: Math.round(totalClicks * 0.034) },
        { flag: '🇺🇸', name: 'สหรัฐอเมริกา (United States)', pct: '2.0%', clicks: Math.round(totalClicks * 0.02) },
        { flag: '🌐', name: 'อื่นๆ (Others)', pct: '0.7%', clicks: Math.max(1, Math.round(totalClicks * 0.007)) }
      ];

      geoContainer.innerHTML = countries.map(c => `
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <div style="display: flex; justify-content: space-between; font-size: 13px;">
            <span style="display: flex; align-items: center; gap: 6px;">
              <span>${c.flag}</span>
              <strong style="color: #FFFFFF;">${c.name}</strong>
            </span>
            <span style="font-family: var(--font-mono); color: #38BDF8; font-weight: 700;">${c.pct} (${c.clicks} คลิก)</span>
          </div>
          <div style="width: 100%; height: 6px; background: var(--bg-surface-raised); border-radius: 4px; overflow: hidden;">
            <div style="width: ${c.pct}; height: 100%; background: linear-gradient(90deg, #6366F1, #38BDF8); border-radius: 4px;"></div>
          </div>
        </div>
      `).join('');
    } else {
      geoContainer.innerHTML = `
        <div style="text-align: center; padding: 32px 10px; color: var(--text-muted); font-size: 13px;">
          <i data-lucide="globe" style="width: 24px; height: 24px; margin: 0 auto 8px; display: block; opacity: 0.4;"></i>
          <span>ยังไม่มีทราฟฟิกแยกตามประเทศ (ระบบจะประมวลผลทันทีเมื่อมีผู้เข้าชม)</span>
        </div>
      `;
    }
  }

  // 3. Daily table
  renderAnalyticsDailyTable();
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

// Render Daily Analytics Table
function renderAnalyticsDailyTable() {
  const tbody = document.getElementById('analyticsDailyTbody');
  if (!tbody) return;

  const metrics = GateStore.getMetrics();
  const totalClicks = Number(metrics.totalClicks) || 0;
  const totalUnlocks = Number(metrics.totalUnlocks) || 0;
  const totalRevenue = Number(metrics.totalRevenue) || 0;

  if (totalClicks === 0) {
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
    return;
  }

  const now = new Date();
  const rows = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
    const isToday = i === 0;

    const clicks = isToday ? totalClicks : 0;
    const uniques = isToday ? Math.round(totalClicks * 0.88) : 0;
    const unlocks = isToday ? totalUnlocks : 0;
    const rate = clicks > 0 ? ((unlocks / clicks) * 100).toFixed(1) + '%' : '0.0%';
    const cpm = unlocks > 0 ? '$' + ((totalRevenue / unlocks) * 1000).toFixed(2) : '$0.00';
    const rev = isToday ? '$' + totalRevenue.toFixed(2) : '$0.00';

    rows.push(`
      <tr>
        <td><strong style="color: #FFFFFF;">${dateStr}</strong> ${isToday ? '<span class="badge badge-success" style="font-size:10px; margin-left:4px;">วันนี้</span>' : ''}</td>
        <td><strong style="color: #F8FAFC;">${clicks.toLocaleString()}</strong></td>
        <td><span style="color: var(--text-secondary);">${uniques.toLocaleString()}</span></td>
        <td><strong style="color: #38BDF8;">${unlocks.toLocaleString()}</strong></td>
        <td><span class="badge ${isToday ? 'badge-success' : 'badge-muted'}">${rate}</span></td>
        <td><span style="font-family: var(--font-mono); color: #A5B4FC;">${cpm}</span></td>
        <td><strong style="color: #10B981; font-family: var(--font-mono);">${rev}</strong></td>
      </tr>
    `);
  }

  tbody.innerHTML = rows.join('');
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

// Modal Management: Create Locker
window.openCreateModal = function() {
  const currentUser = (typeof GateStore !== 'undefined' && GateStore.getCurrentUser) ? GateStore.getCurrentUser() : null;
  if (!currentUser) {
    showToast('⚠️ กรุณาสมัครสมาชิกหรือเข้าสู่ระบบก่อนสร้าง Locker!', 'warning', 5000);
    if (typeof openAuthModal === 'function') {
      openAuthModal('signup');
    }
    return;
  }
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

    const destinationUrl = document.getElementById('inputDestinationUrl').value.trim();
    let name = document.getElementById('inputLockerName')?.value.trim();
    let slug = document.getElementById('inputLockerSlug')?.value.trim();
    const isAdult = document.querySelector('input[name="modalAdType"]:checked')?.value === 'adult';

    if (!destinationUrl) return;

    if (!name) {
      name = slug ? `Locker: ${slug}` : 'My Short Link';
    }

    if (!slug) {
      slug = 'bp-' + Math.random().toString(36).substring(2, 7);
    } else {
      slug = slug.toLowerCase().replace(/[^a-z0-9-_]/g, '-').replace(/-+/g, '-');
    }

    const newLocker = await GateStore.createLocker({
      name,
      destinationUrl,
      slug,
      steps: 3,
      timer: 30,
      antiBypass: true,
      adultAds: isAdult,
      smartlinkUrl: '', // Always enforce central Adsterra direct network
      ads: { popunder: true, banner: true, smartlink: true }
    });

    closeCreateModal();
    form.reset();
    renderDashboardStats();
    renderLockersTable('lockersTableBody');
    renderLockersTable('allLockersTableBody');

    const modeText = isAdult ? '🔞 โหมด 18+ (เรท $3.80 CPM)' : '🛡️ โหมดทั่วไป (เรท $2.80 CPM)';
    showToast(`สร้าง Locker "${newLocker.name}" สำเร็จ! [${modeText}]`, 'success', 5000);
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

// Payout Form & History
function initPayoutForm() {
  const form = document.getElementById('payoutForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const currentUser = (typeof GateStore !== 'undefined' && GateStore.getCurrentUser) ? GateStore.getCurrentUser() : null;
    if (!currentUser) {
      showToast('⚠️ กรุณาสมัครสมาชิกหรือเข้าสู่ระบบก่อนทำการขอถอนเงิน!', 'warning', 5000);
      if (typeof openAuthModal === 'function') {
        openAuthModal('signup');
      }
      return;
    }

    const settings = GateStore.getSettings();
    const minPayout = 0.50; // allow withdrawal from $0.50

    const currentBalance = Number(settings.profile.balance) || 0;
    if (currentBalance < minPayout) {
      showToast(`ยอดเงินยังไม่ถึงเกณฑ์ถอนขั้นต่ำ $${minPayout.toFixed(2)}`, 'error');
      return;
    }

    const methodSelect = document.getElementById('payoutMethodSelect');
    const accountInput = document.getElementById('payoutAccountInput');
    const method = methodSelect ? methodSelect.options[methodSelect.selectedIndex].text : 'TrueMoney Wallet';
    const account = accountInput ? accountInput.value.trim() : '';

    if (!account) {
      showToast('กรุณากรอกเบอร์โทรศัพท์หรือเลขบัญชีรับเงิน', 'warning');
      return;
    }

    const withdrawnAmount = currentBalance;
    settings.profile.balance = 0.00;
    settings.profile.pendingPayout = (Number(settings.profile.pendingPayout) || 0) + withdrawnAmount;
    GateStore.saveSettings(settings);

    // Save transaction
    const newTxn = {
      id: 'TXN-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
      date: new Date().toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
      method: method,
      account: account,
      usd: withdrawnAmount.toFixed(2),
      thb: (withdrawnAmount * 36.5).toFixed(2),
      status: 'Pending'
    };

    try {
      const txns = JSON.parse(localStorage.getItem('blackpass_payout_history') || '[]');
      txns.unshift(newTxn);
      localStorage.setItem('blackpass_payout_history', JSON.stringify(txns));
    } catch(e) {}

    if (accountInput) accountInput.value = '';
    renderDashboardStats();
    renderPayoutsTable();

    showToast(`ส่งคำขอถอนเงิน $${withdrawnAmount.toFixed(2)} (${(withdrawnAmount * 36.5).toFixed(2)} บาท) สำเร็จ! แอดมินจะดำเนินการโอนให้เร็วที่สุด`, 'success', 6000);
  });
}

function renderPayoutsTable() {
  const tbody = document.getElementById('payoutTransactionsBody');
  if (!tbody) return;

  let txns = [];
  try {
    txns = JSON.parse(localStorage.getItem('blackpass_payout_history') || '[]');
  } catch(e) {}

  if (txns.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; padding: 32px 20px; color: var(--text-muted);" data-i18n="table_no_payouts">
          ยังไม่มีประวัติการทำรายการถอนเงิน
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = txns.map(t => `
    <tr>
      <td><span style="font-family: var(--font-mono); color: #A5B4FC; font-weight: 600;">${t.id}</span></td>
      <td><span style="color: var(--text-secondary); font-size: 13px;">${t.date}</span></td>
      <td>
        <span style="display: flex; align-items: center; gap: 6px;">
          <i data-lucide="credit-card" style="width: 14px; height: 14px; color: #38BDF8;"></i>
          <span style="color: #FFFFFF; font-weight: 500;">${t.method}</span>
          <small style="color: var(--text-muted);">(${t.account})</small>
        </span>
      </td>
      <td><strong style="color: #10B981; font-family: var(--font-mono);">$${t.usd}</strong></td>
      <td><span style="color: #F8FAFC; font-weight: 600;">฿${t.thb}</span></td>
      <td>
        <span class="badge ${t.status === 'Completed' ? 'badge-success' : 'badge-warning'}">
          ${t.status === 'Completed' ? 'โอนสำเร็จ' : 'กำลังดำเนินการ (10-30 น.)'}
        </span>
      </td>
    </tr>
  `).join('');

  if (typeof lucide !== 'undefined') lucide.createIcons();
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

  const s1Input = document.getElementById('settingsStep1Url');
  if (s1Input && settings.ads?.step1Url) {
    s1Input.value = settings.ads.step1Url;
  }

  const s2Input = document.getElementById('settingsStep2Url');
  if (s2Input && settings.ads?.step2Url) {
    s2Input.value = settings.ads.step2Url;
  }

  const s3Input = document.getElementById('settingsStep3Url');
  if (s3Input && settings.ads?.step3Url) {
    s3Input.value = settings.ads.step3Url;
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
    const step1Url = (document.getElementById('settingsStep1Url')?.value || '').trim();
    const step2Url = (document.getElementById('settingsStep2Url')?.value || '').trim();
    const step3Url = (document.getElementById('settingsStep3Url')?.value || '').trim();
    const popunderScript = (document.getElementById('settingsPopunderScript')?.value || '').trim();
    const bannerCode = (document.getElementById('settingsBannerCode')?.value || '').trim();

    const settings = GateStore.getSettings();
    settings.ads = {
      network,
      smartlinkUrl,
      step1Url,
      step2Url,
      step3Url,
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

// Rates Table Country Filter
function initRatesSearch() {
  const searchInput = document.getElementById('searchRatesInput');
  const tableBody = document.getElementById('ratesTableBody');
  if (!searchInput || !tableBody) return;

  searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase().trim();
    const rows = tableBody.querySelectorAll('tr');
    rows.forEach(row => {
      const text = row.textContent.toLowerCase();
      row.style.display = text.includes(term) ? '' : 'none';
    });
  });
}

