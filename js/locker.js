/* ==========================================================================
   BlackPass Content Locker Engine
   Step Progression, Anti-Bypass Validation, Bilingual & Unlock Execution
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

  // Listen to language change
  window.onLanguageChanged = (lang) => {
    updateLockerLanguage();
  };
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
  initAdInjectors();
  startStep(1);
}

// Render dynamic task items
function renderTasks() {
  const container = document.getElementById('tasksList');
  if (!container) return;

  const t1Title = typeof getI18nText === 'function' ? getI18nText('locker_task_1_title', 'Visit Sponsor Article') : 'Visit Sponsor Article';
  const t1Desc = typeof getI18nText === 'function' ? getI18nText('locker_task_1_desc', 'Browse sponsored site for a few seconds') : 'Browse sponsored site for a few seconds';
  const t2Title = typeof getI18nText === 'function' ? getI18nText('locker_task_2_title', 'Verify Browser Telemetry') : 'Verify Browser Telemetry';
  const t2Desc = typeof getI18nText === 'function' ? getI18nText('locker_task_2_desc', 'Ensure active human browser session') : 'Ensure active human browser session';
  const t3Title = typeof getI18nText === 'function' ? getI18nText('locker_task_3_title', 'Issue Encrypted Access Key') : 'Issue Encrypted Access Key';
  const t3Desc = typeof getI18nText === 'function' ? getI18nText('locker_task_3_desc', 'Generate 24-hour verification token') : 'Generate 24-hour verification token';

  const taskDefinitions = [
    { title: t1Title, desc: t1Desc },
    { title: t2Title, desc: t2Desc },
    { title: t3Title, desc: t3Desc }
  ];

  const pendingText = typeof getI18nText === 'function' ? getI18nText('locker_task_pending', 'Pending') : 'Pending';

  let html = '';
  for (let i = 1; i <= totalSteps; i++) {
    const def = taskDefinitions[i - 1] || { title: `Step ${i}`, desc: 'Complete required checkpoint' };
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
          <span>${pendingText}</span>
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
  const stepTemplate = typeof getI18nText === 'function' ? getI18nText('locker_step_text', 'Step {current} of {total} ({percent}%)') : 'Step {current} of {total} ({percent}%)';
  document.getElementById('progressStepText').textContent = stepTemplate
    .replace('{current}', stepNum)
    .replace('{total}', totalSteps)
    .replace('{percent}', percent);

  document.getElementById('progressBarFill').style.width = `${percent}%`;

  const doneText = typeof getI18nText === 'function' ? getI18nText('locker_task_done', 'Done') : 'Done';
  const activeText = typeof getI18nText === 'function' ? getI18nText('locker_task_active', 'Active') : 'Active';
  const pendingText = typeof getI18nText === 'function' ? getI18nText('locker_task_pending', 'Pending') : 'Pending';

  // Update Task Items Classes
  for (let i = 1; i <= totalSteps; i++) {
    const item = document.getElementById(`taskItem_${i}`);
    const status = document.getElementById(`taskStatus_${i}`);
    const icon = document.getElementById(`taskIcon_${i}`);
    if (!item) continue;

    if (i < stepNum) {
      item.className = 'task-item completed';
      if (status) status.innerHTML = `<i data-lucide="check-circle" style="width: 14px; height: 14px; color: #10B981;"></i> <span>${doneText}</span>`;
      if (icon) icon.innerHTML = `<i data-lucide="check" style="width: 16px; height: 16px;"></i>`;
    } else if (i === stepNum) {
      item.className = 'task-item active';
      if (status) status.innerHTML = `<i data-lucide="loader-2" class="spin" style="width: 14px; height: 14px; color: #A5B4FC;"></i> <span>${activeText}</span>`;
    } else {
      item.className = 'task-item';
      if (status) status.innerHTML = `<i data-lucide="circle" style="width: 14px; height: 14px;"></i> <span>${pendingText}</span>`;
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

  const waitTemplate = typeof getI18nText === 'function' ? getI18nText('locker_wait', 'Please wait {sec} seconds...') : 'Please wait {sec} seconds...';

  btn.disabled = true;
  btn.className = 'btn-locker-continue';
  btnText.textContent = waitTemplate.replace('{sec}', timerSecondsRemaining);
  btnIcon.className = 'spin';
  btnIcon.setAttribute('data-lucide', 'loader-2');
  lucide.createIcons();

  timerInterval = setInterval(() => {
    // If tab is inactive, pause countdown (Anti-Bypass Feature)
    if (document.hidden) return;

    timerSecondsRemaining--;

    if (timerSecondsRemaining > 0) {
      const waitTpl = typeof getI18nText === 'function' ? getI18nText('locker_wait', 'Please wait {sec} seconds...') : 'Please wait {sec} seconds...';
      btnText.textContent = waitTpl.replace('{sec}', timerSecondsRemaining);
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
    const contTemplate = typeof getI18nText === 'function' ? getI18nText('locker_continue', 'Continue to Step {next}') : 'Continue to Step {next}';
    btnText.textContent = contTemplate.replace('{next}', currentStepIndex + 1);
    btnIcon.className = '';
    btnIcon.setAttribute('data-lucide', 'arrow-right');
    btn.onclick = () => {
      // Trigger Popunder Ad on click
      if (currentLocker.ads?.popunder) {
        simulatePopunderAd(currentStepIndex + 1);
      }
      startStep(currentStepIndex + 1);
    };
  } else {
    // Final Step &rarr; Unlock Button
    btn.className = 'btn-locker-continue btn-unlock';
    btnText.textContent = typeof getI18nText === 'function' ? getI18nText('locker_unlock_btn', 'Unlock Content Now') : 'Unlock Content Now';
    btnIcon.className = '';
    btnIcon.setAttribute('data-lucide', 'unlock');
    btn.onclick = unlockContent;
  }

  lucide.createIcons();
}

function updateLockerLanguage() {
  renderTasks();

  const percent = Math.round((currentStepIndex / totalSteps) * 100);
  const stepTemplate = typeof getI18nText === 'function' ? getI18nText('locker_step_text', 'Step {current} of {total} ({percent}%)') : 'Step {current} of {total} ({percent}%)';
  document.getElementById('progressStepText').textContent = stepTemplate
    .replace('{current}', currentStepIndex)
    .replace('{total}', totalSteps)
    .replace('{percent}', percent);

  const doneText = typeof getI18nText === 'function' ? getI18nText('locker_task_done', 'Done') : 'Done';
  const activeText = typeof getI18nText === 'function' ? getI18nText('locker_task_active', 'Active') : 'Active';
  const pendingText = typeof getI18nText === 'function' ? getI18nText('locker_task_pending', 'Pending') : 'Pending';

  for (let i = 1; i <= totalSteps; i++) {
    const item = document.getElementById(`taskItem_${i}`);
    const status = document.getElementById(`taskStatus_${i}`);
    if (!item || !status) continue;
    if (i < currentStepIndex) {
      status.innerHTML = `<i data-lucide="check-circle" style="width: 14px; height: 14px; color: #10B981;"></i> <span>${doneText}</span>`;
    } else if (i === currentStepIndex) {
      status.innerHTML = `<i data-lucide="loader-2" class="spin" style="width: 14px; height: 14px; color: #A5B4FC;"></i> <span>${activeText}</span>`;
    } else {
      status.innerHTML = `<i data-lucide="circle" style="width: 14px; height: 14px;"></i> <span>${pendingText}</span>`;
    }
  }

  const btn = document.getElementById('btnContinue');
  const btnText = document.getElementById('btnText');
  if (btn && btnText) {
    if (timerInterval) {
      const waitTpl = typeof getI18nText === 'function' ? getI18nText('locker_wait', 'Please wait {sec} seconds...') : 'Please wait {sec} seconds...';
      btnText.textContent = waitTpl.replace('{sec}', timerSecondsRemaining);
    } else if (!btn.disabled) {
      if (currentStepIndex < totalSteps) {
        const contTemplate = typeof getI18nText === 'function' ? getI18nText('locker_continue', 'Continue to Step {next}') : 'Continue to Step {next}';
        btnText.textContent = contTemplate.replace('{next}', currentStepIndex + 1);
      } else {
        btnText.textContent = typeof getI18nText === 'function' ? getI18nText('locker_unlock_btn', 'Unlock Content Now') : 'Unlock Content Now';
      }
    }
  }

  lucide.createIcons();
}

// User clicking on a task item
window.handleTaskItemClick = function(stepNum) {
  if (stepNum === currentStepIndex && !isStepTaskTriggered) {
    isStepTaskTriggered = true;
    simulatePopunderAd(stepNum);
    const notice = (typeof getI18nText === 'function' && window.currentAppLanguage === 'th') ? 'เปิดหน้าสปอนเซอร์แล้ว กรุณาเปิดหน้านี้ค้างไว้จนกว่าเวลานับถอยหลังจะหมด' : 'Sponsor link opened in new tab. Keep this page active.';
    showToast(notice, 'info');
  }
};

// Real Ad Trigger & Popunder Execution Engine
function triggerSmartlinkAd(stepNum = currentStepIndex) {
  const settings = (typeof GateStore !== 'undefined' && GateStore.getSettings) ? GateStore.getSettings() : null;
  const globalAds = settings?.ads || {};

  // Check step-specific URLs first (OrinRankone Adsterra Smartlinks)
  let stepUrl = '';
  if (stepNum === 1) stepUrl = globalAds.step1Url || 'https://asiafilm.org/4/1c188bbb2ce8a02bfa3ee2ad75de4c53';
  else if (stepNum === 2) stepUrl = globalAds.step2Url || 'https://asiafilm.org/4/d8707d797617eddbed2038e5921285e3';
  else if (stepNum === 3) stepUrl = globalAds.step3Url || 'https://asiafilm.org/4/15645e0d7a0b92a6fcc92b70cbee607d';

  // Prioritize Locker-specific smartlink, then step-specific, then fallback to global smartlink
  const targetSmartlink = (currentLocker?.smartlinkUrl && currentLocker.smartlinkUrl.trim())
    ? currentLocker.smartlinkUrl.trim()
    : (stepUrl && stepUrl.trim())
      ? stepUrl.trim()
      : (globalAds.smartlinkUrl && globalAds.smartlinkUrl.trim())
        ? globalAds.smartlinkUrl.trim()
        : 'https://asiafilm.org/4/1c188bbb2ce8a02bfa3ee2ad75de4c53';

  try {
    const adWindow = window.open(targetSmartlink, '_blank');
    if (adWindow) {
      window.focus();
    }
  } catch (e) {
    console.warn('[BlackPass] Popup blocked by browser policy:', e);
  }
}

// Backward-compatible alias
function simulatePopunderAd(stepNum) {
  triggerSmartlinkAd(stepNum);
}

// Initialize dynamic banner and popunder script injection
function initAdInjectors() {
  const settings = (typeof GateStore !== 'undefined' && GateStore.getSettings) ? GateStore.getSettings() : null;
  const ads = settings?.ads || {};

  // 1. Inject Custom Native Banner if configured
  if (ads.bannerCode && ads.bannerCode.trim()) {
    const bannerContainer = document.getElementById('adBannerMock');
    if (bannerContainer) {
      bannerContainer.innerHTML = ads.bannerCode;
      const scripts = Array.from(bannerContainer.querySelectorAll('script'));
      scripts.forEach(oldScript => {
        const newScript = document.createElement('script');
        Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
        newScript.appendChild(document.createTextNode(oldScript.innerHTML));
        oldScript.parentNode.replaceChild(newScript, oldScript);
      });
    }
  }

  // 2. Inject Popunder / Push script if configured
  if (ads.popunderScript && ads.popunderScript.trim()) {
    const popVal = ads.popunderScript.trim();
    if (popVal.startsWith('http://') || popVal.startsWith('https://') || popVal.startsWith('//')) {
      const s = document.createElement('script');
      s.src = popVal;
      s.async = true;
      document.head.appendChild(s);
    } else if (popVal.includes('<script')) {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = popVal;
      const sTags = tempDiv.querySelectorAll('script');
      sTags.forEach(st => {
        const s = document.createElement('script');
        if (st.src) s.src = st.src;
        if (st.innerHTML) s.innerHTML = st.innerHTML;
        document.head.appendChild(s);
      });
    }
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
      const copyNotice = (typeof getI18nText === 'function' && window.currentAppLanguage === 'th') ? 'คัดลอกลิงก์ปลายทางเรียบร้อยแล้ว!' : 'Destination link copied to clipboard!';
      showToast(copyNotice, 'success');
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
        const enterKeyMsg = (typeof getI18nText === 'function' && window.currentAppLanguage === 'th') ? 'กรุณากรอกคีย์ VIP ของคุณ' : 'Please enter your VIP Key';
        showToast(enterKeyMsg, 'error');
        return;
      }

      // Valid test keys
      if (key.includes('VIP') || key === 'ADMIN' || key === 'BYPASS' || key === '30BAHT') {
        closeVipModal();
        const successMsg = (typeof getI18nText === 'function' && window.currentAppLanguage === 'th') ? 'ตรวจสอบคีย์ VIP สำเร็จ! กำลังข้ามด่านทั้งหมด...' : 'VIP Key validated! Bypassing all tasks...';
        showToast(successMsg, 'success', 2000);
        setTimeout(() => {
          unlockContent();
        }, 600);
      } else {
        const errorMsg = (typeof getI18nText === 'function' && window.currentAppLanguage === 'th') ? 'คีย์ VIP ไม่ถูกต้องหรือหมดอายุแล้ว ติดต่อแอดมิน Discord' : 'Invalid or expired VIP key. Contact Discord admin.';
        showToast(errorMsg, 'error');
      }
    };
  }
}
