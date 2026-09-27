/* ==========================================================================
   BlackPass Authentication & User Session Manager
   Firebase Auth UI, Register, Login, Forgot Password, Logout & Modals
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  injectAuthModal();
  bindAuthTriggers();
  updateAuthUI(GateStore.getCurrentUser());

  // Listen to store auth changes
  window.onBlackPassAuthChanged = (user) => {
    updateAuthUI(user);
  };
});

// Inject sleek modern Auth Modal into DOM
function injectAuthModal() {
  if (document.getElementById('blackpassAuthModal')) return;

  const modalHtml = `
    <div class="modal-backdrop" id="blackpassAuthModal">
      <div class="modal-dialog" style="max-width: 420px;">
        <div class="modal-header">
          <div style="display: flex; align-items: center; gap: 8px;">
            <div style="width: 28px; height: 28px; background: linear-gradient(135deg, #6366F1, #4338CA); border-radius: 7px; display: flex; align-items: center; justify-content: center; color: white;">
              <i data-lucide="shield-check" style="width: 16px; height: 16px;"></i>
            </div>
            <h3 class="modal-title" id="authModalTitle" data-i18n="auth_signin_title">Sign In to BlackPass</h3>
          </div>
          <button class="modal-close" onclick="closeAuthModal()">
            <i data-lucide="x" style="width: 18px; height: 18px;"></i>
          </button>
        </div>

        <div class="modal-body" style="padding-top: 16px;">
          <!-- Tabs: Login vs Register -->
          <div id="authTabsContainer" style="display: flex; background: var(--bg-surface-raised); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 4px; margin-bottom: 20px;">
            <button type="button" class="btn btn-sm btn-block btn-primary" id="tabBtnSignIn" onclick="switchAuthTab('signin')" style="border-radius: var(--radius-sm); font-weight: 600;" data-i18n="auth_tab_signin">
              Sign In
            </button>
            <button type="button" class="btn btn-sm btn-block" id="tabBtnSignUp" onclick="switchAuthTab('signup')" style="border-radius: var(--radius-sm); font-weight: 600; color: var(--text-secondary);" data-i18n="auth_tab_signup">
              Create Account
            </button>
          </div>

          <!-- Sign In Form -->
          <form id="formSignIn">
            <div class="form-group">
              <label class="form-label" data-i18n="auth_label_email">Email Address</label>
              <input type="email" class="form-input" id="signInEmail" placeholder="yourname@gmail.com" required>
            </div>
            <div class="form-group" style="margin-bottom: 10px;">
              <label class="form-label" data-i18n="auth_label_pass">Password</label>
              <input type="password" class="form-input" id="signInPassword" placeholder="••••••••" required>
            </div>

            <div style="display: flex; justify-content: flex-end; margin-bottom: 18px;">
              <button type="button" onclick="switchAuthTab('forgot')" style="font-size: 12px; color: #818CF8; font-weight: 600; background: none; border: none; padding: 0; cursor: pointer;" data-i18n="auth_btn_forgot">
                Forgot Password?
              </button>
            </div>

            <button type="submit" class="btn btn-primary btn-block" id="btnSubmitSignIn" style="height: 44px;">
              <span data-i18n="auth_btn_signin">Sign In to Dashboard</span>
              <i data-lucide="arrow-right" style="width: 16px; height: 16px;"></i>
            </button>
          </form>

          <!-- Sign Up Form (Hidden by default) -->
          <form id="formSignUp" style="display: none;">
            <div class="form-group">
              <label class="form-label" data-i18n="auth_label_username">Publisher Username</label>
              <input type="text" class="form-input" id="signUpUsername" placeholder="e.g. OrinScriptz" required>
            </div>
            <div class="form-group">
              <label class="form-label" data-i18n="auth_label_email">Email Address</label>
              <input type="email" class="form-input" id="signUpEmail" placeholder="yourname@gmail.com" required>
            </div>
            <div class="form-group">
              <label class="form-label" data-i18n="auth_label_pass_min">Password (Min. 6 chars)</label>
              <input type="password" class="form-input" id="signUpPassword" placeholder="••••••••" minlength="6" required>
            </div>
            <button type="submit" class="btn btn-primary btn-block" id="btnSubmitSignUp" style="height: 44px; margin-top: 10px;">
              <span data-i18n="auth_btn_signup">Create Publisher Account</span>
              <i data-lucide="check" style="width: 16px; height: 16px;"></i>
            </button>
          </form>

          <!-- Forgot Password Form (Hidden by default) -->
          <form id="formForgot" style="display: none;">
            <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.5; margin-bottom: 18px;" data-i18n="auth_forgot_desc">
              Enter your registered email address and we will immediately send a password reset link to your email inbox.
            </p>
            <div class="form-group">
              <label class="form-label" data-i18n="auth_label_email">Account Email Address</label>
              <input type="email" class="form-input" id="forgotEmail" placeholder="yourname@gmail.com" required>
            </div>
            <button type="submit" class="btn btn-primary btn-block" id="btnSubmitForgot" style="height: 44px; margin-top: 10px;">
              <span data-i18n="auth_btn_send_reset">Send Reset Password Link</span>
              <i data-lucide="send" style="width: 16px; height: 16px;"></i>
            </button>
            <div style="text-align: center; margin-top: 18px;">
              <button type="button" onclick="switchAuthTab('signin')" style="font-size: 13px; color: var(--text-secondary); font-weight: 500; background: none; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 6px;">
                <i data-lucide="arrow-left" style="width: 14px; height: 14px;"></i>
                <span data-i18n="auth_back_to_login">Back to Sign In</span>
              </button>
            </div>
          </form>

          <div style="margin-top: 20px; text-align: center; font-size: 12px; color: var(--text-muted);">
            Protected by Cloudflare &bull; Free instant activation
          </div>
        </div>
      </div>
    </div>
  `;

  document.body.insertAdjacentHTML('beforeend', modalHtml);
  if (typeof lucide !== 'undefined') lucide.createIcons();
  if (typeof applyI18nToDOM === 'function') applyI18nToDOM();

  initAuthForms();
}

// Switch between Sign In, Sign Up, and Forgot tabs
window.switchAuthTab = function(tab) {
  const formSignIn = document.getElementById('formSignIn');
  const formSignUp = document.getElementById('formSignUp');
  const formForgot = document.getElementById('formForgot');
  const tabsContainer = document.getElementById('authTabsContainer');
  const tabSignIn = document.getElementById('tabBtnSignIn');
  const tabSignUp = document.getElementById('tabBtnSignUp');
  const modalTitle = document.getElementById('authModalTitle');

  const getText = (k, def) => (typeof getI18nText === 'function' ? getI18nText(k, def) : def);

  if (tab === 'forgot') {
    formSignIn.style.display = 'none';
    formSignUp.style.display = 'none';
    formForgot.style.display = 'block';
    if (tabsContainer) tabsContainer.style.display = 'none';
    modalTitle.textContent = getText('auth_forgot_title', 'Reset Password');
  } else if (tab === 'signup') {
    formForgot.style.display = 'none';
    formSignIn.style.display = 'none';
    formSignUp.style.display = 'block';
    if (tabsContainer) tabsContainer.style.display = 'flex';
    tabSignUp.classList.add('btn-primary');
    tabSignUp.style.color = '#FFFFFF';
    tabSignIn.classList.remove('btn-primary');
    tabSignIn.style.color = 'var(--text-secondary)';
    modalTitle.textContent = getText('auth_signup_title', 'Create Publisher Account');
  } else {
    // signin
    formForgot.style.display = 'none';
    formSignUp.style.display = 'none';
    formSignIn.style.display = 'block';
    if (tabsContainer) tabsContainer.style.display = 'flex';
    tabSignIn.classList.add('btn-primary');
    tabSignIn.style.color = '#FFFFFF';
    tabSignUp.classList.remove('btn-primary');
    tabSignUp.style.color = 'var(--text-secondary)';
    modalTitle.textContent = getText('auth_signin_title', 'Sign In to BlackPass');
  }

  if (typeof lucide !== 'undefined') lucide.createIcons();
};

window.openAuthModal = function(tab = 'signin') {
  const modal = document.getElementById('blackpassAuthModal');
  if (modal) {
    switchAuthTab(tab);
    modal.classList.add('active');
  }
};

window.closeAuthModal = function() {
  const modal = document.getElementById('blackpassAuthModal');
  if (modal) modal.classList.remove('active');
};

function initAuthForms() {
  // Sign In Form
  document.getElementById('formSignIn')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btnSubmitSignIn');
    btn.disabled = true;
    btn.innerHTML = `<i data-lucide="loader-2" class="spin" style="width:16px;height:16px;"></i> <span>Signing in...</span>`;
    lucide.createIcons();

    const email = document.getElementById('signInEmail').value.trim();
    const pass = document.getElementById('signInPassword').value;

    try {
      await GateStore.signIn(email, pass);
      closeAuthModal();
      showToast('Signed in successfully! Welcome back.', 'success');
      // If on landing page, redirect to dashboard
      if (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/')) {
        setTimeout(() => { window.location.href = 'dashboard.html'; }, 600);
      }
    } catch (err) {
      showToast(err.message || 'Failed to sign in. Check email and password.', 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = `<span>Sign In to Dashboard</span> <i data-lucide="arrow-right" style="width:16px;height:16px;"></i>`;
      lucide.createIcons();
    }
  });

  // Sign Up Form
  document.getElementById('formSignUp')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btnSubmitSignUp');
    btn.disabled = true;
    btn.innerHTML = `<i data-lucide="loader-2" class="spin" style="width:16px;height:16px;"></i> <span>Creating account...</span>`;
    lucide.createIcons();

    const username = document.getElementById('signUpUsername').value.trim();
    const email = document.getElementById('signUpEmail').value.trim();
    const pass = document.getElementById('signUpPassword').value;

    try {
      await GateStore.signUp(email, pass, username);
      closeAuthModal();
      showToast(`Account created for ${username}! Welcome to BlackPass.`, 'success');
      if (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/')) {
        setTimeout(() => { window.location.href = 'dashboard.html'; }, 600);
      }
    } catch (err) {
      showToast(err.message || 'Registration failed. Please try again.', 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = `<span>Create Publisher Account</span> <i data-lucide="check" style="width:16px;height:16px;"></i>`;
      lucide.createIcons();
    }
  });

  // Forgot Password Form
  document.getElementById('formForgot')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('btnSubmitForgot');
    btn.disabled = true;
    btn.innerHTML = `<i data-lucide="loader-2" class="spin" style="width:16px;height:16px;"></i> <span>Sending link...</span>`;
    lucide.createIcons();

    const email = document.getElementById('forgotEmail').value.trim();

    try {
      await GateStore.sendPasswordReset(email);
      showToast(`Password reset email sent to ${email}! Please check your inbox and spam folder.`, 'success', 7000);
      switchAuthTab('signin');
    } catch (err) {
      showToast(err.message || 'Failed to send password reset email. Check email address.', 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = `<span>Send Reset Password Link</span> <i data-lucide="send" style="width:16px;height:16px;"></i>`;
      lucide.createIcons();
    }
  });
}

function bindAuthTriggers() {
  document.querySelectorAll('[data-open-auth]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = btn.dataset.openAuth || 'signin';
      openAuthModal(tab);
    });
  });
}

function updateAuthUI(user) {
  const sbUsername = document.getElementById('sidebarUsername');
  const sbAvatar = document.getElementById('sidebarAvatar');
  const settingsUser = document.getElementById('settingsUsername');
  const settingsEmail = document.getElementById('settingsEmail');

  if (user) {
    const name = user.displayName || user.email.split('@')[0];
    if (sbUsername) sbUsername.textContent = name;
    if (sbAvatar) sbAvatar.textContent = name.substring(0, 2).toUpperCase();
    if (settingsUser) settingsUser.value = name;
    if (settingsEmail) settingsEmail.value = user.email;
  }
}
