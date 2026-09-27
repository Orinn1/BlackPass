/* ==========================================================================
   BlackPass — Firebase Configuration & Initialization
   ========================================================================== */

const firebaseConfig = {
  apiKey: "AIzaSyDNL_9G6wCQXRLBpigUM4fMHDaUE7qLhsQ",
  authDomain: "blackpass-db.firebaseapp.com",
  projectId: "blackpass-db",
  storageBucket: "blackpass-db.firebasestorage.app",
  messagingSenderId: "448364214443",
  appId: "1:448364214443:web:796dbdff70d1f44abb1fee",
  measurementId: "G-FBHHE670C5"
};

// Initialize Firebase if compat SDK loaded
let fbApp = null;
let fbAuth = null;
let fbDb = null;

if (typeof firebase !== 'undefined') {
  try {
    if (!firebase.apps.length) {
      fbApp = firebase.initializeApp(firebaseConfig);
    } else {
      fbApp = firebase.app();
    }
    fbAuth = firebase.auth();
    fbDb = firebase.firestore();
    console.log('[BlackPass] Firebase connected successfully to blackpass-db');
  } catch (err) {
    console.warn('[BlackPass] Firebase init warning:', err);
  }
}

window.fbApp = fbApp;
window.fbAuth = fbAuth;
window.fbDb = fbDb;
window.FIREBASE_CONFIG = firebaseConfig;
