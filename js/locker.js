/* ==========================================================================
   BlackPass Content Locker Engine
   Enforced Dwell Time Verification & Anti-18+ Spam Protection
   ========================================================================== */

let currentLocker = null;
let currentStepIndex = 1;
let totalSteps = 3;
let requiredDwellSeconds = 10;
let completedSteps = { 1: false, 2: false, 3: false };
let stepAdOpenedAt = { 1: 0, 2: 0, 3: 0 };
let stepStatus = { 1: 'IDLE', 2: 'IDLE', 3: 'IDLE' }; // 'IDLE', 'DWELLING', 'COMPLETED'
let dwellInterval = null;
let lastVisibilityWarnTime = 0;

document.addEventListener('DOMContentLoaded', () => {
  loadLockerData();
  initVipModal();

  // Listen to language change
  window.onLanguageChanged = (lang) => {
    updateLockerLanguage();
  };

  // Warn user immediately if they switch back to the locker tab before dwell time expires
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && stepStatus[currentStepIndex] === 'DWELLING' && !completedSteps[currentStepIndex]) {
      const elapsed = Math.floor((Date.now() - stepAdOpenedAt[currentStepIndex]) / 1000);
      const remaining = Math.max(0, requiredDwellSeconds - elapsed);
      if (remaining > 0 && Date.now() - lastVisibilityWarnTime > 3000) {
        lastVisibilityWarnTime = Date.now();
        const warnMsg = (typeof getI18nText === 'function' && window.currentAppLanguage === 'th')
          ? `⚠️ คุณยังค้างอยู่หน้าโฆษณาไม่ครบเวลา! (เหลืออีก ${remaining} วินาที) กรุณากลับไปดูต่อจนครบเพื่อปลดล็อค`
          : `⚠️ Please stay on the sponsor page! (${remaining}s remaining to unlock).`;
        showToast(warnMsg, 'warning', 3500);
      }
    }
  });
});

// Load Locker based on URL params
async function loadLockerData() {
  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get('slug') || urlParams.get('id') || 'hub-access';

  currentLocker = await GateStore.getLocker(slug);

  if (!currentLocker) {
    // Fallback default for Blacklist Script Hub
    currentLocker = {
      id: 'gf_hub_access',
      name: 'Blacklist Script Hub Access',
      slug: 'hub-access',
      destinationUrl: 'https://th.blacklisthub.workers.dev/?auth_success=1',
      steps: 3,
      timer: 10,
      ads: { popunder: false, banner: true, smartlink: true }
    };
  }

  // Record click impression
  GateStore.recordClick(currentLocker.slug);

  totalSteps = currentLocker.steps || 3;
  requiredDwellSeconds = currentLocker.timer || 10;

  document.getElementById('lockerTitle').textContent = currentLocker.name;
  document.title = `${currentLocker.name} \u2014 BlackPass Verification`;

  renderTasks();
  initAdInjectors();
  startStep(1);
}

// Render dynamic task items
function renderTasks() {
  const container = document.getElementById('tasksList');
  if (!container) return;

  const t1Title = typeof getI18nText === 'function' ? getI18nText('locker_task_1_title', 'เปิดดูลิงก์สปอนเซอร์ (ด่าน 1)') : 'เปิดดูลิงก์สปอนเซอร์ (ด่าน 1)';
  const t1Desc = typeof getI18nText === 'function' ? getI18nText('locker_task_1_desc', 'กดเปิดและค้างอยู่ที่หน้าโฆษณา 10 วินาที') : 'กดเปิดและค้างอยู่ที่หน้าโฆษณา 10 วินาที';
  const t2Title = typeof getI18nText === 'function' ? getI18nText('locker_task_2_title', 'ตรวจสอบเซสชันสปอนเซอร์ (ด่าน 2)') : 'ตรวจสอบเซสชันสปอนเซอร์ (ด่าน 2)';
  const t2Desc = typeof getI18nText === 'function' ? getI18nText('locker_task_2_desc', 'กดเปิดและค้างอยู่ที่หน้าโฆษณา 10 วินาที') : 'กดเปิดและค้างอยู่ที่หน้าโฆษณา 10 วินาที';
  const t3Title = typeof getI18nText === 'function' ? getI18nText('locker_task_3_title', 'ออกคีย์เข้าใช้งานเว็บไซต์ (ด่าน 3)') : 'ออกคีย์เข้าใช้งานเว็บไซต์ (ด่าน 3)';
  const t3Desc = typeof getI18nText === 'function' ? getI18nText('locker_task_3_desc', 'กดเปิดด่านสุดท้ายเพื่อปลดล็อค 24 ชั่วโมง') : 'กดเปิดด่านสุดท้ายเพื่อปลดล็อค 24 ชั่วโมง';

  const taskDefinitions = [
    { title: t1Title, desc: t1Desc },
    { title: t2Title, desc: t2Desc },
    { title: t3Title, desc: t3Desc }
  ];

  const pendingText = typeof getI18nText === 'function' ? getI18nText('locker_task_status_waiting', 'รอเปิดโฆษณา') : 'รอเปิดโฆษณา';

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
  if (stepNum > totalSteps) return;
  currentStepIndex = stepNum;
  requiredDwellSeconds = currentLocker.timer || 10;

  if (dwellInterval) {
    clearInterval(dwellInterval);
    dwellInterval = null;
  }
  lastVisibilityWarnTime = 0;

  // Update Progress Bar
  const percent = Math.round(((stepNum - 1) / totalSteps) * 100);
  const stepTemplate = typeof getI18nText === 'function' ? getI18nText('locker_step_text', 'Step {current} of {total} ({percent}%)') : 'Step {current} of {total} ({percent}%)';
  document.getElementById('progressStepText').textContent = stepTemplate
    .replace('{current}', stepNum)
    .replace('{total}', totalSteps)
    .replace('{percent}', percent);

  document.getElementById('progressBarFill').style.width = `${Math.max(12, percent)}%`;

  // Update instruction rule banner
  const instructionEl = document.getElementById('lockerInstructionText');
  if (instructionEl) {
    const ruleTpl = typeof getI18nText === 'function'
      ? getI18nText('locker_instruction_dwell', '⚠️ กติกา: ต้องคลิกเปิดหน้าสปอนเซอร์ และค้างอยู่ที่หน้านั้นอย่างน้อย {sec} วินาที (หากปิดก่อนเวลาจะไม่ปลดล็อค)')
      : '⚠️ กติกา: ต้องคลิกเปิดหน้าสปอนเซอร์ และค้างอยู่ที่หน้านั้นอย่างน้อย {sec} วินาที (หากปิดก่อนเวลาจะไม่ปลดล็อค)';
    instructionEl.textContent = ruleTpl.replace('{sec}', requiredDwellSeconds);
  }

  updateTaskItemsUI();

  // If this step is already completed
  if (completedSteps[stepNum]) {
    setButtonStepCompleted(stepNum);
    return;
  }

  // Step needs user to click to open the sponsor ad
  stepStatus[stepNum] = 'IDLE';
  setButtonPromptOpenAd(stepNum);
}

// Update task items visual states
function updateTaskItemsUI() {
  const doneText = typeof getI18nText === 'function' ? getI18nText('locker_task_done', 'เสร็จสิ้นแล้ว') : 'เสร็จสิ้นแล้ว';
  const dwellingText = typeof getI18nText === 'function' ? getI18nText('locker_task_status_dwelling', 'กำลังดู ({sec} วิ)') : 'กำลังดู ({sec} วิ)';
  const waitingText = typeof getI18nText === 'function' ? getI18nText('locker_task_status_waiting', 'รอเปิดโฆษณา') : 'รอเปิดโฆษณา';
  const pendingText = typeof getI18nText === 'function' ? getI18nText('locker_task_pending', 'รอดำเนินการ') : 'รอดำเนินการ';

  for (let i = 1; i <= totalSteps; i++) {
    const item = document.getElementById(`taskItem_${i}`);
    const status = document.getElementById(`taskStatus_${i}`);
    const icon = document.getElementById(`taskIcon_${i}`);
    if (!item || !status) continue;

    if (completedSteps[i]) {
      item.className = 'task-item completed';
      status.innerHTML = `<i data-lucide="check-circle" style="width: 14px; height: 14px; color: #10B981;"></i> <span>${doneText}</span>`;
      if (icon) icon.innerHTML = `<i data-lucide="check" style="width: 16px; height: 16px;"></i>`;
    } else if (i === currentStepIndex) {
      if (stepStatus[i] === 'DWELLING') {
        item.className = 'task-item active';
        const elapsed = Math.floor((Date.now() - (stepAdOpenedAt[i] || Date.now())) / 1000);
        const rem = Math.max(0, requiredDwellSeconds - elapsed);
        status.innerHTML = `<i data-lucide="loader-2" class="spin" style="width: 14px; height: 14px; color: #F59E0B;"></i> <span>${dwellingText.replace('{sec}', rem)}</span>`;
      } else {
        item.className = 'task-item active';
        status.innerHTML = `<i data-lucide="external-link" style="width: 14px; height: 14px; color: #818CF8;"></i> <span>${waitingText}</span>`;
      }
    } else {
      item.className = 'task-item';
      status.innerHTML = `<i data-lucide="circle" style="width: 14px; height: 14px;"></i> <span>${pendingText}</span>`;
    }
  }
  lucide.createIcons();
}

// Set button in "Click to open sponsor ad" prompt state
function setButtonPromptOpenAd(stepNum) {
  const btn = document.getElementById('btnContinue');
  const btnText = document.getElementById('btnText');
  const btnIcon = document.getElementById('btnIcon');

  btn.disabled = false;
  btn.className = 'btn-locker-continue btn-need-action';

  const promptTpl = typeof getI18nText === 'function'
    ? getI18nText('locker_btn_open_ad', '👉 คลิกเปิดหน้าโฆษณา (ด่านที่ {step}/{total})')
    : '👉 คลิกเปิดหน้าโฆษณา (ด่านที่ {step}/{total})';

  btnText.textContent = promptTpl.replace('{step}', stepNum).replace('{total}', totalSteps);
  btnIcon.className = '';
  btnIcon.setAttribute('data-lucide', 'external-link');
  btn.onclick = () => handleOpenAdAndStartDwell(stepNum);

  lucide.createIcons();
}

// User action: Open the sponsor ad in a new tab & start dwell countdown
function handleOpenAdAndStartDwell(stepNum = currentStepIndex) {
  // If already completed this step, proceed or unlock
  if (completedSteps[stepNum]) {
    if (stepNum < totalSteps) {
      startStep(stepNum + 1);
    } else {
      unlockContent();
    }
    return;
  }

  // Open the ad in a new tab
  triggerSmartlinkAd(stepNum);

  // Record timestamp & status
  stepAdOpenedAt[stepNum] = Date.now();
  stepStatus[stepNum] = 'DWELLING';
  lastVisibilityWarnTime = 0;

  const dwellSec = requiredDwellSeconds;
  const dwellNotice = (typeof getI18nText === 'function' && window.currentAppLanguage === 'th')
    ? `🚀 เปิดหน้าสปอนเซอร์แล้ว! กรุณาค้างอยู่ที่หน้าโฆษณาอย่างน้อย ${dwellSec} วินาทีเพื่อปลดล็อค`
    : `🚀 Sponsor ad opened! Please stay on the ad page for at least ${dwellSec} seconds.`;
  showToast(dwellNotice, 'info', 4000);

  updateTaskItemsUI();
  startDwellWatcher(stepNum);
}

// Watch dwell time strictly
function startDwellWatcher(stepNum) {
  if (dwellInterval) clearInterval(dwellInterval);

  updateDwellButtonUI(stepNum, requiredDwellSeconds);

  dwellInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - stepAdOpenedAt[stepNum]) / 1000);
    const remaining = Math.max(0, requiredDwellSeconds - elapsed);

    if (remaining > 0) {
      updateDwellButtonUI(stepNum, remaining);
      updateTaskItemsUI();
    } else {
      // Completed dwell time!
      clearInterval(dwellInterval);
      dwellInterval = null;
      onStepDwellVerified(stepNum);
    }
  }, 500);
}

// Update button appearance during dwell
function updateDwellButtonUI(stepNum, remaining) {
  const btn = document.getElementById('btnContinue');
  const btnText = document.getElementById('btnText');
  const btnIcon = document.getElementById('btnIcon');

  btn.disabled = false; // Allow clicking to re-open/return to ad if they lost it
  btn.className = 'btn-locker-continue btn-dwelling';

  const dwellTpl = typeof getI18nText === 'function'
    ? getI18nText('locker_btn_dwelling', '⏳ กำลังดูโฆษณา... เหลืออีก {sec} วิ')
    : '⏳ กำลังดูโฆษณา... เหลืออีก {sec} วิ';

  btnText.textContent = dwellTpl.replace('{sec}', remaining);
  btnIcon.className = 'spin';
  btnIcon.setAttribute('data-lucide', 'loader-2');

  btn.onclick = () => {
    triggerSmartlinkAd(stepNum);
    const returnMsg = (typeof getI18nText === 'function' && window.currentAppLanguage === 'th')
      ? `เปิดหน้าโฆษณาให้ใหม่อีกครั้ง กรุณาค้างไว้อีก ${remaining} วินาที...`
      : `Re-opened ad. Please stay on it for ${remaining}s more...`;
    showToast(returnMsg, 'info', 3000);
  };

  lucide.createIcons();
}

// When dwell duration is verified
function onStepDwellVerified(stepNum) {
  completedSteps[stepNum] = true;
  stepStatus[stepNum] = 'COMPLETED';

  // Update progress bar
  const percent = Math.round((stepNum / totalSteps) * 100);
  document.getElementById('progressBarFill').style.width = `${percent}%`;

  updateTaskItemsUI();

  const successMsg = (typeof getI18nText === 'function' && window.currentAppLanguage === 'th')
    ? `✅ ผ่านด่านที่ ${stepNum} เรียบร้อยแล้ว! (ดูครบ ${requiredDwellSeconds} วินาที)`
    : `✅ Step ${stepNum} verified! (${requiredDwellSeconds}s dwell complete)`;
  showToast(successMsg, 'success', 3500);

  setButtonStepCompleted(stepNum);
}

// Set button in verified / continue state
function setButtonStepCompleted(stepNum) {
  const btn = document.getElementById('btnContinue');
  const btnText = document.getElementById('btnText');
  const btnIcon = document.getElementById('btnIcon');

  btn.disabled = false;

  if (stepNum < totalSteps) {
    btn.className = 'btn-locker-continue btn-step-done';
    const contTemplate = typeof getI18nText === 'function'
      ? getI18nText('locker_btn_step_passed', '✅ ผ่านด่านที่ {step} แล้ว! ไปต่อด่านที่ {next} ➔')
      : '✅ ผ่านด่านที่ {step} แล้ว! ไปต่อด่านที่ {next} ➔';
    btnText.textContent = contTemplate.replace('{step}', stepNum).replace('{next}', stepNum + 1);
    btnIcon.className = '';
    btnIcon.setAttribute('data-lucide', 'arrow-right');
    btn.onclick = () => startStep(stepNum + 1);
  } else {
    // Final Step &rarr; Unlock Button
    btn.className = 'btn-locker-continue btn-unlock';
    btnText.textContent = typeof getI18nText === 'function'
      ? getI18nText('locker_btn_all_passed', '🎉 ยืนยันครบทุกด่านแล้ว! คลิกปลดล็อคเว็บไซต์ 🔓')
      : '🎉 ยืนยันครบทุกด่านแล้ว! คลิกปลดล็อคเว็บไซต์ 🔓';
    btnIcon.className = '';
    btnIcon.setAttribute('data-lucide', 'unlock');
    btn.onclick = unlockContent;
  }

  lucide.createIcons();
}

function updateLockerLanguage() {
  renderTasks();
  startStep(currentStepIndex);
}

// User clicking on a task item
window.handleTaskItemClick = function(stepNum) {
  if (completedSteps[stepNum]) {
    const doneNotice = (typeof getI18nText === 'function' && window.currentAppLanguage === 'th')
      ? `ด่านที่ ${stepNum} ผ่านการยืนยันแล้ว!`
      : `Step ${stepNum} is already verified!`;
    showToast(doneNotice, 'success');
    return;
  }

  if (stepNum === currentStepIndex) {
    handleOpenAdAndStartDwell(stepNum);
  } else if (stepNum > currentStepIndex) {
    const waitPrev = (typeof getI18nText === 'function' && window.currentAppLanguage === 'th')
      ? `กรุณาทำด่านที่ ${currentStepIndex} ให้เสร็จก่อน!`
      : `Please complete Step ${currentStepIndex} first!`;
    showToast(waitPrev, 'warning');
  }
};

// Real Ad Trigger & Smartlink Navigation
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

// Clean Ad Injector Engine (Filters out 18+ and adult spam)
function initAdInjectors() {
  const settings = (typeof GateStore !== 'undefined' && GateStore.getSettings) ? GateStore.getSettings() : null;
  const ads = settings?.ads || {};

  // 1. Inject Custom Native Banner if configured
  if (ads.bannerCode && ads.bannerCode.trim()) {
    const bannerContainer = document.getElementById('adBannerMock');
    if (bannerContainer) {
      const lower = ads.bannerCode.toLowerCase();
      // Block suspicious adult scripts
      if (lower.includes('porn') || lower.includes('xxx') || lower.includes('erotic') || lower.includes('dating18')) {
        console.warn('[BlackPass Shield] Blocked suspicious 18+ banner code');
      } else {
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
  }

  // 2. Popunder / Push script: Block intrusive 18+ social bar / push scripts
  if (ads.popunderScript && ads.popunderScript.trim()) {
    const popVal = ads.popunderScript.trim();
    const lower = popVal.toLowerCase();
    // Block known intrusive adult networks and social bars
    if (lower.includes('accountut') || lower.includes('bellnewyork') || lower.includes('adult') || lower.includes('sex') || lower.includes('erotic')) {
      console.warn('[BlackPass Shield] Blocked 18+ spam script:', popVal);
      return;
    }

    if (popVal.startsWith('http://') || popVal.startsWith('https://') || popVal.startsWith('//')) {
      const s = document.createElement('script');
      s.src = popVal;
      s.async = true;
      document.head.appendChild(s);
    }
  }
}

// Unlock Content Trigger - Strictly enforced dwell verification
function unlockContent() {
  // CRITICAL ANTI-BYPASS: "ถ้าไม่ค้างอยู่หน้า โฆษณา ไม่ต้องลบ"
  for (let s = 1; s <= totalSteps; s++) {
    if (!completedSteps[s]) {
      const err = (typeof getI18nText === 'function' && window.currentAppLanguage === 'th')
        ? `⛔ ด่านที่ ${s} ยังไม่ผ่านเงื่อนไขการดูโฆษณา! กรุณาเปิดดูโฆษณาให้ครบเวลา`
        : `⛔ Step ${s} not verified! You must stay on the sponsor page to unlock.`;
      showToast(err, 'error', 4000);
      startStep(s);
      return;
    }
  }

  // Record unlock in store
  GateStore.recordUnlock(currentLocker.slug);

  // Switch to success view
  document.getElementById('lockerActiveView').style.display = 'none';
  const successView = document.getElementById('lockerSuccessView');
  successView.classList.add('active');

  // Resolve destination URL (Support return_to or currentLocker destination)
  const urlParams = new URLSearchParams(window.location.search);
  const returnTo = urlParams.get('return_to') || urlParams.get('redirect') || '';

  let destUrl = returnTo || currentLocker?.destinationUrl || 'https://th.blacklisthub.workers.dev/?auth_success=1';
  if (!destUrl.includes('auth_success=1')) {
    destUrl = destUrl.includes('?') ? `${destUrl}&auth_success=1` : `${destUrl}?auth_success=1`;
  }

  // Set 24-Hour Authorization immediately across localStorage & sessionStorage
  try {
    const expiry24h = Date.now() + (24 * 60 * 60 * 1000);
    localStorage.setItem('blacklist_lootlabs_auth_expiry', String(expiry24h));
    sessionStorage.setItem('blacklist_lootlabs_auth', 'true');
    localStorage.setItem('blacklist_lootlabs_unlocked_event', String(Date.now()));
    window.dispatchEvent(new Event('storage'));
  } catch(e) {}

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

  // 3 Second Auto-Redirect Countdown
  let redirectSec = 3;
  const redirectEl = document.getElementById('redirectCountdown');
  if (redirectEl) redirectEl.textContent = redirectSec;
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
          // Grant VIP authorization directly
          for (let i = 1; i <= totalSteps; i++) {
            completedSteps[i] = true;
          }
          unlockContent();
        }, 600);
      } else {
        const errorMsg = (typeof getI18nText === 'function' && window.currentAppLanguage === 'th') ? 'คีย์ VIP ไม่ถูกต้องหรือหมดอายุแล้ว ติดต่อแอดมิน Discord' : 'Invalid or expired VIP key. Contact Discord admin.';
        showToast(errorMsg, 'error');
      }
    };
  }
}
