/* ==========================================================================
   GateFlow Content Locker Engine
   Step Progression, Anti-Bypass Validation & Unlock Execution
   ========================================================================== */

let currentLocker = null;
let currentStepIndex = 1;
let totalSteps = 3;
let timerSecondsRemaining = 8;
let timerInterval = null;
let isStepTaskTriggered = false;

document.addEventListener('DOMContentLoaded', () => {
  loadLockerData();
  initVipModal();
});

// Load Locker based on URL params
async function loadLockerData() {
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get('slug') || urlParams.get('id') || 'blox-fruits-v48';

  currentLocker = await GateStore.getLocker(slug);

  if (!currentLocker) {
    // Fallback default
    currentLocker = {
      id: 'gf_fallback',
      name: 'Blox Fruits Hub v4.8 Script',
      slug: 'blox-fruits-v48',
      destinationUrl: 'https://pastebin.com/raw/Bf87k2Nq',
      steps: 3,
      timer: 8,
      ads: { popunder: true, banner: true, smartlink: true }
    };
  }

  // Record click impression
  GateStore.recordClick(currentLocker.slug);

  totalSteps = currentLocker.steps || 3;
  document.getElementById('lockerTitle').textContent = currentLocker.name;
  document.title = `${currentLocker.name} &mdash; BlackPass Verification`;

  renderTasks();
  startStep(1);
}

// Render dynamic task items
function renderTasks() {
  const container = document.getElementById('tasksList');
  if (!container) return;

  const taskDefinitions = [
    { title: 'Visit Sponsor Article', desc: 'Browse sponsored site for a few seconds' },
    { title: 'Verify Browser Telemetry', desc: 'Ensure active human browser session' },
    { title: 'Issue Encrypted Access Key', desc: 'Generate 24-hour verification token' }
  ];

  let html = '';
  for (let i = 1; i <= totalSteps; i++) {
    const def = taskDefinitions[i - 1] || { title: `Verification Step ${i}`, desc: 'Complete required checkpoint' };
    html += `
      <div class="task-item" id="taskItem_${i}" onclick="handleTaskItemClick(${i})">
        <div class="task-left">
          <div class="task-icon" id="taskIcon_${i}">
            <i data-lucide="${i === 1 ? 'eye' : i === 2 ? 'shield' : 'key'}" style="width: 16px; height: 16px;"></i>
          </div>
          <div class="task-info">
            <span class="task-title">${def.title}</span>
            <span class="task-desc">${def.desc}</span>
          </div>
        </div>
        <div class="task-status-indicator" id="taskStatus_${i}">
          <i data-lucide="circle" style="width: 14px; height: 14px;"></i>
          <span>Pending</span>
        </div>
      </div>
    `;
  }

  container.innerHTML = html;
  lucide.createIcons();
}

// Start a specific step
function startStep(stepNum) {
  currentStepIndex = stepNum;
  timerSecondsRemaining = currentLocker.timer || (stepNum === 1 ? 8 : stepNum === 2 ? 5 : 3);
  isStepTaskTriggered = false;

  // Update Progress Bar
  const percent = Math.round((stepNum / totalSteps) * 100);
  document.getElementById('progressStepText').textContent = `Step ${stepNum} of ${totalSteps} (${percent}%)`;
  document.getElementById('progressBarFill').style.width = `${percent}%`;

  // Update Task Items Classes
  for (let i = 1; i <= totalSteps; i++) {
    const item = document.getElementById(`taskItem_${i}`);
    const status = document.getElementById(`taskStatus_${i}`);
    const icon = document.getElementById(`taskIcon_${i}`);
    if (!item) continue;

    if (i < stepNum) {
      item.className = 'task-item completed';
      if (status) status.innerHTML = `<i data-lucide="check-circle" style="width: 14px; height: 14px; color: #10B981;"></i> <span>Done</span>`;
      if (icon) icon.innerHTML = `<i data-lucide="check" style="width: 16px; height: 16px;"></i>`;
    } else if (i === stepNum) {
      item.className = 'task-item active';
      if (status) status.innerHTML = `<i data-lucide="loader-2" class="spin" style="width: 14px; height: 14px; color: #A5B4FC;"></i> <span>Active</span>`;
    } else {
      item.className = 'task-item';
      if (status) status.innerHTML = `<i data-lucide="circle" style="width: 14px; height: 14px;"></i> <span>Pending</span>`;
    }
  }
  lucide.createIcons();

  startTimer();
}

// Timer countdown logic
function startTimer() {
  if (timerInterval) clearInterval(timerInterval);

  const btn = document.getElementById('btnContinue');
  const btnText = document.getElementById('btnText');
  const btnIcon = document.getElementById('btnIcon');

  btn.disabled = true;
  btn.className = 'btn-locker-continue';
  btnText.textContent = `Please wait ${timerSecondsRemaining} seconds...`;
  btnIcon.className = 'spin';
  btnIcon.setAttribute('data-lucide', 'loader-2');
  lucide.createIcons();

  timerInterval = setInterval(() => {
    // If tab is inactive, pause countdown (Anti-Bypass Feature)
    if (document.hidden) return;

    timerSecondsRemaining--;

    if (timerSecondsRemaining > 0) {
      btnText.textContent = `Please wait ${timerSecondsRemaining} seconds...`;
    } else {
      clearInterval(timerInterval);
      timerInterval = null;
      onStepTimerFinished();
    }
  }, 1000);
}

// When step timer finishes
function onStepTimerFinished() {
  const btn = document.getElementById('btnContinue');
  const btnText = document.getElementById('btnText');
  const btnIcon = document.getElementById('btnIcon');

  btn.disabled = false;

  if (currentStepIndex < totalSteps) {
    btnText.textContent = `Continue to Step ${currentStepIndex + 1}`;
    btnIcon.className = '';
    btnIcon.setAttribute('data-lucide', 'arrow-right');
    btn.onclick = () => {
      // Trigger Popunder Ad simulation on click
      if (currentLocker.ads?.popunder) {
        simulatePopunderAd();
      }
      startStep(currentStepIndex + 1);
    };
  } else {
    // Final Step &rarr; Unlock Button
    btn.className = 'btn-locker-continue btn-unlock';
    btnText.textContent = 'Unlock Content Now';
    btnIcon.className = '';
    btnIcon.setAttribute('data-lucide', 'unlock');
    btn.onclick = unlockContent;
  }

  lucide.createIcons();
}

// User clicking on a task item
window.handleTaskItemClick = function(stepNum) {
  if (stepNum === currentStepIndex && !isStepTaskTriggered) {
    isStepTaskTriggered = true;
    simulatePopunderAd();
    showToast('Sponsor link opened in new tab. Keep this page active.', 'info');
  }
};

// Simulate Adsterra / PopAds Popunder tab
function simulatePopunderAd() {
  try {
    const dummyWindow = window.open('https://bellnewyork.org', '_blank');
    if (dummyWindow) {
      // Focus back to locker
      window.focus();
    }
  } catch (e) {
    // Popups blocked by browser
  }
}

// Unlock Content Trigger
function unlockContent() {
  // Record unlock in store
  GateStore.recordUnlock(currentLocker.slug);

  // Switch to success view
  document.getElementById('lockerActiveView').style.display = 'none';
  const successView = document.getElementById('lockerSuccessView');
  successView.classList.add('active');

  const destUrl = currentLocker.destinationUrl || 'https://pastebin.com/raw/Bf87k2Nq';
  document.getElementById('destinationUrlDisplay').textContent = destUrl;

  // Access Destination Button
  document.getElementById('btnAccessDestination').onclick = () => {
    window.location.href = destUrl;
  };

  // Copy Link Button
  document.getElementById('btnCopyDestination').onclick = () => {
    navigator.clipboard.writeText(destUrl).then(() => {
      showToast('Destination link copied to clipboard!', 'success');
    });
  };

  // 5 Second Auto-Redirect Countdown
  let redirectSec = 5;
  const redirectEl = document.getElementById('redirectCountdown');
  const redirectInterval = setInterval(() => {
    redirectSec--;
    if (redirectEl) redirectEl.textContent = redirectSec;
    if (redirectSec <= 0) {
      clearInterval(redirectInterval);
      window.location.href = destUrl;
    }
  }, 1000);

  lucide.createIcons();
}

// VIP Modal Logic
function initVipModal() {
  const btnOpen = document.getElementById('btnOpenVipModal');
  const modal = document.getElementById('vipModal');
  const btnSubmit = document.getElementById('btnSubmitVipKey');
  const input = document.getElementById('inputVipKey');

  if (btnOpen) {
    btnOpen.onclick = () => modal.classList.add('active');
  }

  window.closeVipModal = function() {
    if (modal) modal.classList.remove('active');
  };

  if (btnSubmit) {
    btnSubmit.onclick = () => {
      const key = (input.value || '').trim().toUpperCase();
      if (!key) {
        showToast('Please enter your VIP Key', 'error');
        return;
      }

      // Valid test keys
      if (key.includes('VIP') || key === 'ADMIN' || key === 'BYPASS' || key === '30BAHT') {
        closeVipModal();
        showToast('VIP Key validated! Bypassing all tasks...', 'success', 2000);
        setTimeout(() => {
          unlockContent();
        }, 600);
      } else {
        showToast('Invalid or expired VIP key. Contact Discord admin.', 'error');
      }
    };
  }
}
