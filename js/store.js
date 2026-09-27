/* ==========================================================================
   GateFlow Data Store & State Management
   Persistent Storage with LocalStorage & Analytics Engine
   ========================================================================== */

const STORAGE_KEYS = {
  LOCKERS: 'gateflow_lockers_v1',
  STATS: 'gateflow_analytics_v1',
  SETTINGS: 'gateflow_settings_v1',
  USER: 'gateflow_user_v1'
};

// Seed Realistic Sample Data if empty
const DEFAULT_LOCKERS = [
  {
    id: 'gf_98a72b',
    name: 'Blox Fruits Hub v4.8 Script',
    slug: 'blox-fruits-v48',
    destinationUrl: 'https://pastebin.com/raw/Bf87k2Nq',
    type: 'multistep', // multistep | direct_ad | key_gate
    steps: 3,
    timer: 8,
    antiBypass: true,
    ads: {
      popunder: true,
      banner: true,
      smartlink: true
    },
    clicks: 14820,
    unlocks: 6940,
    revenue: 41.25,
    cpm: 5.94,
    status: 'active',
    createdAt: '2026-09-18T10:30:00.000Z'
  },
  {
    id: 'gf_61b44c',
    name: 'Delta Android Key Checkpoint',
    slug: 'delta-key-pass',
    destinationUrl: 'https://key.delta-executor.com/api/redeem?token=gf_valid',
    type: 'multistep',
    steps: 2,
    timer: 6,
    antiBypass: true,
    ads: {
      popunder: true,
      banner: true,
      smartlink: false
    },
    clicks: 8420,
    unlocks: 4180,
    revenue: 23.40,
    cpm: 5.60,
    status: 'active',
    createdAt: '2026-09-22T14:15:00.000Z'
  },
  {
    id: 'gf_32c91d',
    name: 'Steal A Egg Autofarm GUI',
    slug: 'steal-egg-gui',
    destinationUrl: 'https://raw.githubusercontent.com/SampleRepo/Eggs/main/script.lua',
    type: 'multistep',
    steps: 1,
    timer: 10,
    antiBypass: false,
    ads: {
      popunder: true,
      banner: true,
      smartlink: true
    },
    clicks: 3120,
    unlocks: 1890,
    revenue: 9.85,
    cpm: 5.21,
    status: 'active',
    createdAt: '2026-09-25T08:00:00.000Z'
  }
];

const DEFAULT_SETTINGS = {
  profile: {
    username: 'OrinRankone',
    email: 'admin@blacklisthub.com',
    tier: 'Pro Publisher (92% RevShare)',
    walletMethod: 'TrueMoney Wallet',
    walletAccount: '081-XXX-XXXX',
    balance: 74.50,
    pendingPayout: 0.00
  },
  domain: {
    customDomain: 'gate.blacklisthub.com',
    verified: true
  },
  security: {
    twoFactor: false,
    antiVpn: true,
    strictIpCap: true
  },
  api: {
    apiKey: 'gf_live_99f2e718bc894d01b972e04fa',
    webhookUrl: 'https://api.blacklisthub.com/webhooks/gateflow'
  }
};

class GateFlowStore {
  constructor() {
    this.init();
  }

  init() {
    if (!localStorage.getItem(STORAGE_KEYS.LOCKERS)) {
      localStorage.setItem(STORAGE_KEYS.LOCKERS, JSON.stringify(DEFAULT_LOCKERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    }
  }

  // --- Lockers CRUD ---
  getLockers() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LOCKERS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return DEFAULT_LOCKERS;
    }
  }

  getLocker(idOrSlug) {
    const list = this.getLockers();
    return list.find(item => item.id === idOrSlug || item.slug === idOrSlug) || null;
  }

  createLocker(payload) {
    const list = this.getLockers();
    const id = 'gf_' + Math.random().toString(36).substring(2, 8);
    const slug = (payload.slug || payload.name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-');

    const newLocker = {
      id,
      name: payload.name.trim(),
      slug: slug || id,
      destinationUrl: payload.destinationUrl.trim(),
      type: payload.type || 'multistep',
      steps: Number(payload.steps) || 3,
      timer: Number(payload.timer) || 8,
      antiBypass: payload.antiBypass !== false,
      ads: {
        popunder: payload.ads?.popunder !== false,
        banner: payload.ads?.banner !== false,
        smartlink: payload.ads?.smartlink !== false
      },
      clicks: 0,
      unlocks: 0,
      revenue: 0.00,
      cpm: 5.50,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    list.unshift(newLocker);
    localStorage.setItem(STORAGE_KEYS.LOCKERS, JSON.stringify(list));
    return newLocker;
  }

  updateLocker(id, updates) {
    const list = this.getLockers();
    const index = list.findIndex(l => l.id === id);
    if (index === -1) return null;

    list[index] = { ...list[index], ...updates };
    localStorage.setItem(STORAGE_KEYS.LOCKERS, JSON.stringify(list));
    return list[index];
  }

  deleteLocker(id) {
    let list = this.getLockers();
    list = list.filter(l => l.id !== id);
    localStorage.setItem(STORAGE_KEYS.LOCKERS, JSON.stringify(list));
    return true;
  }

  // --- Interaction Tracking ---
  recordClick(idOrSlug) {
    const list = this.getLockers();
    const item = list.find(l => l.id === idOrSlug || l.slug === idOrSlug);
    if (item) {
      item.clicks = (item.clicks || 0) + 1;
      localStorage.setItem(STORAGE_KEYS.LOCKERS, JSON.stringify(list));
    }
  }

  recordUnlock(idOrSlug) {
    const list = this.getLockers();
    const item = list.find(l => l.id === idOrSlug || l.slug === idOrSlug);
    if (item) {
      item.unlocks = (item.unlocks || 0) + 1;
      // Revenue formula: around $0.0055 per unlock
      const gain = 0.0058;
      item.revenue = Number(((item.revenue || 0) + gain).toFixed(2));
      localStorage.setItem(STORAGE_KEYS.LOCKERS, JSON.stringify(list));

      // Also update wallet balance in settings
      const settings = this.getSettings();
      settings.profile.balance = Number((settings.profile.balance + gain).toFixed(2));
      this.saveSettings(settings);
    }
  }

  // --- Aggregate Metrics ---
  getMetrics() {
    const lockers = this.getLockers();
    const totalClicks = lockers.reduce((acc, l) => acc + (l.clicks || 0), 0);
    const totalUnlocks = lockers.reduce((acc, l) => acc + (l.unlocks || 0), 0);
    const totalRevenue = lockers.reduce((acc, l) => acc + (l.revenue || 0), 0);
    const avgConversion = totalClicks > 0 ? ((totalUnlocks / totalClicks) * 100).toFixed(1) : 0;
    const avgCpm = totalUnlocks > 0 ? ((totalRevenue / totalUnlocks) * 1000).toFixed(2) : '5.50';

    return {
      totalClicks,
      totalUnlocks,
      totalRevenue: totalRevenue.toFixed(2),
      avgConversion,
      avgCpm
    };
  }

  // --- Settings ---
  getSettings() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? JSON.parse(data) : DEFAULT_SETTINGS;
    } catch (e) {
      return DEFAULT_SETTINGS;
    }
  }

  saveSettings(newSettings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(newSettings));
    return newSettings;
  }
}

// Global instance
window.GateStore = new GateFlowStore();

// Global Toast Helper
window.showToast = function (message, type = 'info', duration = 3500) {
  let container = document.getElementById('toastContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toastContainer';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const iconSvg = type === 'success'
    ? `<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#10B981" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`
    : type === 'error'
    ? `<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#EF4444" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`
    : `<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#6366F1" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;

  toast.innerHTML = `
    <span>${iconSvg}</span>
    <span style="flex:1">${message}</span>
  `;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'toastFadeOut 200ms ease forwards';
    setTimeout(() => toast.remove(), 220);
  }, duration);
};
