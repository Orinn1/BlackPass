/* ==========================================================================
   BlackPass Data Store & Real Firebase Integration
   Hybrid Architecture: Realtime Firestore + Auth + Offline Fallback
   ========================================================================== */

const STORAGE_KEYS = {
  LOCKERS: 'blackpass_lockers_v1',
  SETTINGS: 'blackpass_settings_v1',
  AUTH_USER: 'blackpass_auth_user_v1'
};

const DEFAULT_LOCKERS = [
  {
    id: 'bp_blox48',
    userId: 'default_admin',
    name: 'Blox Fruits Hub v4.8 Script',
    slug: 'blox-fruits-v48',
    destinationUrl: 'https://pastebin.com/raw/Bf87k2Nq',
    type: 'multistep',
    steps: 3,
    timer: 8,
    antiBypass: true,
    ads: { popunder: true, banner: true, smartlink: true },
    clicks: 14820,
    unlocks: 6940,
    revenue: 41.25,
    cpm: 5.94,
    status: 'active',
    createdAt: new Date().toISOString()
  },
  {
    id: 'bp_delta24',
    userId: 'default_admin',
    name: 'Delta Android Key Checkpoint',
    slug: 'delta-key-pass',
    destinationUrl: 'https://key.delta-executor.com/api/redeem?token=bp_valid',
    type: 'multistep',
    steps: 2,
    timer: 6,
    antiBypass: true,
    ads: { popunder: true, banner: true, smartlink: false },
    clicks: 8420,
    unlocks: 4180,
    revenue: 23.40,
    cpm: 5.60,
    status: 'active',
    createdAt: new Date().toISOString()
  }
];

class BlackPassStore {
  constructor() {
    this.currentUser = null;
    this.cachedLockers = [];
    this.init();
  }

  init() {
    // Load local cache first
    try {
      const localData = localStorage.getItem(STORAGE_KEYS.LOCKERS);
      this.cachedLockers = localData ? JSON.parse(localData) : DEFAULT_LOCKERS;
    } catch (e) {
      this.cachedLockers = DEFAULT_LOCKERS;
    }

    // Load cached user session
    try {
      const cachedUser = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
      if (cachedUser) {
        this.currentUser = JSON.parse(cachedUser);
      }
    } catch (e) {}

    // Attach Firebase Auth state listener if SDK loaded
    this.initAuthListener();
  }

  initAuthListener() {
    if (typeof firebase !== 'undefined' && firebase.auth) {
      firebase.auth().onAuthStateChanged(async (user) => {
        if (user) {
          this.currentUser = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || user.email.split('@')[0],
            isAnonymous: user.isAnonymous
          };
          localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(this.currentUser));
          // Sync profile & lockers from Firestore
          await this.syncUserFromFirestore(user.uid);
          await this.syncLockersFromFirestore();
        } else {
          this.currentUser = null;
          localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
        }

        // Notify subscribers
        if (window.onBlackPassAuthChanged) {
          window.onBlackPassAuthChanged(this.currentUser);
        }
      });
    }
  }

  // --- Authentication Methods ---
  async signUp(email, password, username = '') {
    if (!window.fbAuth) {
      // Offline fallback
      this.currentUser = {
        uid: 'user_' + Math.random().toString(36).substring(2, 8),
        email,
        displayName: username || email.split('@')[0]
      };
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(this.currentUser));
      return this.currentUser;
    }

    const cred = await window.fbAuth.createUserWithEmailAndPassword(email, password);
    const user = cred.user;

    if (username) {
      await user.updateProfile({ displayName: username }).catch(() => {});
    }

    // Create user profile in Firestore
    if (window.fbDb) {
      await window.fbDb.collection('users').doc(user.uid).set({
        uid: user.uid,
        email: user.email,
        username: username || user.email.split('@')[0],
        balance: 0.00,
        tier: 'Standard (85%)',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      }).catch(console.warn);
    }

    return user;
  }

  async signIn(email, password) {
    if (!window.fbAuth) {
      this.currentUser = {
        uid: 'user_local',
        email,
        displayName: email.split('@')[0]
      };
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(this.currentUser));
      return this.currentUser;
    }

    const cred = await window.fbAuth.signInWithEmailAndPassword(email, password);
    return cred.user;
  }

  async signOut() {
    if (window.fbAuth) {
      await window.fbAuth.signOut().catch(() => {});
    }
    this.currentUser = null;
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    if (window.onBlackPassAuthChanged) {
      window.onBlackPassAuthChanged(null);
    }
  }

  isLoggedIn() {
    return this.currentUser !== null;
  }

  getCurrentUser() {
    return this.currentUser;
  }

  // --- Firestore Syncing ---
  async syncUserFromFirestore(uid) {
    if (!window.fbDb) return;
    try {
      const doc = await window.fbDb.collection('users').doc(uid).get();
      if (doc.exists) {
        const data = doc.data();
        const settings = this.getSettings();
        settings.profile.username = data.username || settings.profile.username;
        settings.profile.email = data.email || settings.profile.email;
        settings.profile.balance = typeof data.balance === 'number' ? data.balance : settings.profile.balance;
        this.saveSettings(settings);
      }
    } catch (e) {
      console.warn('[BlackPass] Firestore user sync failed:', e);
    }
  }

  async syncLockersFromFirestore() {
    if (!window.fbDb) return;
    try {
      let query = window.fbDb.collection('lockers');
      if (this.currentUser && this.currentUser.uid) {
        // Query lockers owned by this user
        query = query.where('userId', '==', this.currentUser.uid);
      }

      const snapshot = await query.limit(50).get();
      if (!snapshot.empty) {
        const firestoreList = [];
        snapshot.forEach(doc => {
          firestoreList.push({ id: doc.id, ...doc.data() });
        });
        if (firestoreList.length > 0) {
          this.cachedLockers = firestoreList;
          localStorage.setItem(STORAGE_KEYS.LOCKERS, JSON.stringify(firestoreList));
          if (window.onLockersUpdated) window.onLockersUpdated();
        }
      }
    } catch (e) {
      console.warn('[BlackPass] Firestore lockers sync failed:', e);
    }
  }

  // --- Lockers CRUD ---
  getLockers() {
    return this.cachedLockers;
  }

  async getLocker(idOrSlug) {
    // 1. Check local cache
    let found = this.cachedLockers.find(l => l.id === idOrSlug || l.slug === idOrSlug);
    if (found) return found;

    // 2. Fetch from Firestore (Allows anyone on mobile / external to resolve any locker!)
    if (window.fbDb) {
      try {
        const snapshot = await window.fbDb.collection('lockers')
          .where('slug', '==', idOrSlug)
          .limit(1)
          .get();

        if (!snapshot.empty) {
          const doc = snapshot.docs[0];
          return { id: doc.id, ...doc.data() };
        }
      } catch (e) {
        console.warn('[BlackPass] Failed to fetch locker from Firestore:', e);
      }
    }

    return null;
  }

  async createLocker(payload) {
    const id = 'bp_' + Math.random().toString(36).substring(2, 8);
    const slug = (payload.slug || payload.name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9-]/g, '-')
      .replace(/-+/g, '-');

    const userId = this.currentUser ? this.currentUser.uid : 'anonymous_publisher';

    const newLocker = {
      id,
      userId,
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

    // Update local cache
    this.cachedLockers.unshift(newLocker);
    localStorage.setItem(STORAGE_KEYS.LOCKERS, JSON.stringify(this.cachedLockers));

    // Save to Firestore so it is globally accessible on mobile & external devices
    if (window.fbDb) {
      window.fbDb.collection('lockers').doc(id).set(newLocker).catch(err => {
        console.warn('[BlackPass] Firestore save locker error:', err);
      });
    }

    return newLocker;
  }

  async deleteLocker(id) {
    this.cachedLockers = this.cachedLockers.filter(l => l.id !== id);
    localStorage.setItem(STORAGE_KEYS.LOCKERS, JSON.stringify(this.cachedLockers));

    if (window.fbDb) {
      window.fbDb.collection('lockers').doc(id).delete().catch(console.warn);
    }
    return true;
  }

  // --- Telemetry Recording ---
  async recordClick(slug) {
    // 1. Update local cache
    const item = this.cachedLockers.find(l => l.slug === slug);
    if (item) {
      item.clicks = (item.clicks || 0) + 1;
      localStorage.setItem(STORAGE_KEYS.LOCKERS, JSON.stringify(this.cachedLockers));
    }

    // 2. Increment in Firestore
    if (window.fbDb) {
      try {
        const snap = await window.fbDb.collection('lockers').where('slug', '==', slug).limit(1).get();
        if (!snap.empty) {
          const docRef = snap.docs[0].ref;
          docRef.update({
            clicks: firebase.firestore.FieldValue.increment(1)
          });
        }
      } catch (e) {}
    }
  }

  async recordUnlock(slug) {
    const gain = 0.0058; // approx revenue per unlock

    // 1. Update local cache
    const item = this.cachedLockers.find(l => l.slug === slug);
    if (item) {
      item.unlocks = (item.unlocks || 0) + 1;
      item.revenue = Number(((item.revenue || 0) + gain).toFixed(2));
      localStorage.setItem(STORAGE_KEYS.LOCKERS, JSON.stringify(this.cachedLockers));
    }

    // Update local wallet
    const settings = this.getSettings();
    settings.profile.balance = Number((settings.profile.balance + gain).toFixed(2));
    this.saveSettings(settings);

    // 2. Increment in Firestore
    if (window.fbDb) {
      try {
        const snap = await window.fbDb.collection('lockers').where('slug', '==', slug).limit(1).get();
        if (!snap.empty) {
          const docRef = snap.docs[0].ref;
          const ownerId = snap.docs[0].data().userId;

          docRef.update({
            unlocks: firebase.firestore.FieldValue.increment(1),
            revenue: firebase.firestore.FieldValue.increment(gain)
          });

          // Also increment owner's balance in users collection
          if (ownerId && ownerId !== 'default_admin') {
            window.fbDb.collection('users').doc(ownerId).update({
              balance: firebase.firestore.FieldValue.increment(gain)
            }).catch(() => {});
          }
        }
      } catch (e) {}
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
    const defaultSettings = {
      profile: {
        username: this.currentUser ? this.currentUser.displayName : 'OrinRankone',
        email: this.currentUser ? this.currentUser.email : 'admin@blacklisthub.com',
        tier: 'Pro Publisher (92% RevShare)',
        walletMethod: 'TrueMoney Wallet',
        walletAccount: '081-XXX-XXXX',
        balance: 74.50,
        pendingPayout: 0.00
      }
    };

    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? JSON.parse(data) : defaultSettings;
    } catch (e) {
      return defaultSettings;
    }
  }

  saveSettings(newSettings) {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(newSettings));
    return newSettings;
  }
}

// Global instance
window.GateStore = new BlackPassStore();

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
