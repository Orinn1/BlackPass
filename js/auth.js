/* ==========================================================================
   BlackPass Authentication & User Session Manager
   Firebase Auth UI, Register, Login, Logout & Modals
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
            <h3 class="modal-title" id="authModalTitle">Sign In to BlackPass</h3>
          </div>
          <button class="modal-close" onclick="closeAuthModal()">
            <i data-lucide="x" style="width: 18px; height: 18px;"></i>
          </button>
        </div>

        <div class="modal-body" style="padding-top: 16px;">
          <!-- Tabs: Login vs Register -->
          <div style="display: flex; background: var(--bg-surface-raised); border: 1px solid var(--border-subtle); border-radius: var(--radius-md); padding: 4px; margin-bottom: 20px;">
            <button type="button" class="btn btn-sm btn-block active" id="tabBtnSignIn" onclick="switchAuthTab('signin')" style="border-radius: var(--radius-sm); font-weight: 600;">
              Sign In
            </button>
            <button type="button" class="btn btn-sm btn-block" id="tabBtnSignUp" onclick="switchAuthTab('signup')" style="border-radius: var(--radius-sm); font-weight: 600; color: var(--text-secondary);">
              Create Account
            </button>
          </div>

          <!-- Sign In Form -->
          <form id="formSignIn">
            <div class="form-group">
              <label class="form-label">Email Address</label>
              <input type="email" class="form-input" id="signInEmail" placeholder="yourname@gmail.com" required>
            </div>
            <div class="form-group">
              <label class="form-label">Password</label>
              <input type="password" class="form-input" id="signInPassword" placeholder="••••••••" required>
            </div>
            <button type="submit" class="btn btn-primary btn-block" id="btnSubmitSignIn" style="height: 44px; margin-top: 10px;">
              <span>Sign In to Dashboard</span>
              <i data-lucide="arrow-right" style="width: 16px; height: 16px;"></i>
            </button>
          </form>

          <!-- Sign Up Form (Hidden by default) -->
          <form id="formSignUp" style="display: none;">
            <div class="form-group">
              <label class="form-label">Publisher Username</label>
              <input type="text" class="form-input" id="signUpUsername" placeholder="e.g. OrinScriptz" required>
            </div>
            <div class="form-group">
              <label class="form-label">Email Address</label>
              <input type="email" class="form-input" id="signUpEmail" placeholder="yourname@gmail.com" required>
            </div>
            <div class="form-group">
              <label class="form-label">Password (Min. 6 chars)</label>
              <input type="password" class="form-input" id="signUpPassword" placeholder="••••••••" minlength="6" required>
            </div>
            <button type="submit" class="btn btn-primary btn-block" id="btnSubmitSignUp" style="height: 44px; margin-top: 10px;">
              <span>Create Publisher Account</span>
              <i data-lucide="check" style="width: 16px; height: 16px;"></i>
            </button>
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

  initAuthForms();
}

// Switch between Sign In and Sign Up tabs
window.switchAuthTab = function(tab) {
  const formSignIn = document.getElementById('formSignIn');
  const formSignUp = document.getElementById('formSignUp');
  const tabSignIn = document.getElementById('tabBtnSignIn');
  const tabSignUp = document.getElementById('tabBtnSignUp');
  const modalTitle = document.getElementById('authModalTitle');

  if (tab === 'signup') {
    formSignIn.style.display = 'none';
    formSignUp.style.display = 'block';
    tabSignUp.classList.add('btn-primary');
    tabSignUp.style.color = '#FFFFFF';
    tabSignIn.classList.remove('btn-primary');
    tabSignIn.style.color = 'var(--text-secondary)';
    modalTitle.textContent = 'Create Publisher Account';
  } else {
    formSignUp.style.display = 'none';
    formSignIn.style.display = 'block';
    tabSignIn.classList.add('btn-primary');
    tabSignIn.style.color = '#FFFFFF';
    tabSignUp.classList.remove('btn-primary');
    tabSignUp.style.color = 'var(--text-secondary)';
    modalTitle.textContent = 'Sign In to BlackPass';
  }
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
}

function bindAuthTriggers() {
  // Bind links with #auth or data-auth
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
