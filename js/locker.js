/* ==========================================================================
   BlackPass Content Locker Engine
   3 Buttons Model — 30 Seconds Dwell Time Each (Anti-Cheat & Strict Away-Detection)
   RULE: Countdown ONLY runs while the user is actually viewing the sponsor ad!
   If the user stays on the locker page, countdown is 100% PAUSED / FROZEN.
   ========================================================================== */

let currentLocker = null;
const totalSteps = 3;
const requiredDwellSeconds = 30; // 30 seconds dwell time per button
let completedSteps = { 1: false, 2: false, 3: false };
let secondsOnAd = { 1: 0, 2: 0, 3: 0 }; // Accumulated seconds actually spent away on ad tab
let dwellSessionStart = { 1: null, 2: null, 3: null };
let activeDwellingStep = null;
let backgroundTicker = null;
let lastToastTime = 0;

document.addEventListener('DOMContentLoaded', () => {
  loadLockerData();
  initVipModal();

  // Listen to language change
  window.onLanguageChanged = (lang) => {
    updateLockerLanguage();
  };

  // Watch tab visibility and focus: Pause when on locker tab, run when away on ad tab
  document.addEventListener('visibilitychange', handleTabStateChange);
  window.addEventListener('blur', handleTabStateChange);
  window.addEventListener('focus', handleTabStateChange);

  // Start background ticker
  startBackgroundTicker();
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
      timer: 30,
      ads: { popunder: false, banner: true, smartlink: true }
    };
  }

  // Record click impression
  GateStore.recordClick(currentLocker.slug);

  document.getElementById('lockerTitle').textContent = currentLocker.name;
  document.title = `${currentLocker.name} \u2014 BlackPass 30s Verification`;

  // Update instruction rule banner
  const instructionEl = document.getElementById('lockerInstructionText');
  if (instructionEl) {
    instructionEl.textContent = (typeof getI18nText === 'function' && window.currentAppLanguage === 'th')
      ? '⚠️ กติกา: กดทำภารกิจให้ครบทั้ง 3 ปุ่ม โดยต้องค้างอยู่ที่หน้าโฆษณาปุ่มละ 30 วินาที จึงจะปลดล็อคเว็บไซต์'
      : '⚠️ Rule: Complete all 3 buttons by staying on each sponsor ad for 30 seconds to unlock the website.';
  }

  renderTaskButtons();
  initAdInjectors();
  updateProgressUI();
  updateBottomButtonUI();
}

// Render 3 Interactive Task Buttons
function renderTaskButtons() {
  const container = document.getElementById('tasksList');
  if (!container) return;

  const t1Title = typeof getI18nText === 'function' ? getI18nText('locker_task_1_title', 'ปุ่มที่ 1: สปอนเซอร์เซิร์ฟเวอร์หลัก (30 วิ)') : 'ปุ่มที่ 1: สปอนเซอร์เซิร์ฟเวอร์หลัก (30 วิ)';
  const t1Desc = typeof getI18nText === 'function' ? getI18nText('locker_task_1_desc', 'กดเปิดโฆษณาตัวที่ 1 และค้างไว้ 30 วินาที') : 'กดเปิดโฆษณาตัวที่ 1 และค้างไว้ 30 วินาที';
  const t2Title = typeof getI18nText === 'function' ? getI18nText('locker_task_2_title', 'ปุ่มที่ 2: สปอนเซอร์ความปลอดภัย (30 วิ)') : 'ปุ่มที่ 2: สปอนเซอร์ความปลอดภัย (30 วิ)';
  const t2Desc = typeof getI18nText === 'function' ? getI18nText('locker_task_2_desc', 'กดเปิดโฆษณาตัวที่ 2 และค้างไว้ 30 วินาที') : 'กดเปิดโฆษณาตัวที่ 2 และค้างไว้ 30 วินาที';
  const t3Title = typeof getI18nText === 'function' ? getI18nText('locker_task_3_title', 'ปุ่มที่ 3: รับสิทธิ์เข้าเว็บฮับ 24 ชม. (30 วิ)') : 'ปุ่มที่ 3: รับสิทธิ์เข้าเว็บฮับ 24 ชม. (30 วิ)';
  const t3Desc = typeof getI18nText === 'function' ? getI18nText('locker_task_3_desc', 'กดเปิดโฆษณาตัวสุดท้ายและค้างไว้ 30 วินาที') : 'กดเปิดโฆษณาตัวสุดท้ายและค้างไว้ 30 วินาที';

  const taskDefinitions = [
    { title: t1Title, desc: t1Desc, icon: 'eye' },
    { title: t2Title, desc: t2Desc, icon: 'shield' },
    { title: t3Title, desc: t3Desc, icon: 'key' }
  ];

  let html = '';
  for (let i = 1; i <= totalSteps; i++) {
    const def = taskDefinitions[i - 1];
    html += `
      <div class="task-item" id="taskItem_${i}" onclick="handleTaskButtonClick(${i})">
        <div class="task-left">
          <div class="task-icon" id="taskIcon_${i}">
            <i data-lucide="${def.icon}" style="width: 16px; height: 16px;"></i>
          </div>
          <div class="task-info">
            <span class="task-title">${def.title}</span>
            <span class="task-desc" id="taskDesc_${i}">${def.desc}</span>
          </div>
        </div>
        <div class="task-status-indicator" id="taskPill_${i}">
          <!-- Pill action injected dynamically -->
        </div>
      </div>
    `;
  }

  container.innerHTML = html;
  updateButtonsVisualState();
  lucide.createIcons();
}

// Update the visual state of the 3 buttons
function updateButtonsVisualState() {
  const readyText = typeof getI18nText === 'function' ? getI18nText('locker_action_ready', '👉 กดเริ่ม (30 วิ)') : '👉 กดเริ่ม (30 วิ)';
  const doneText = typeof getI18nText === 'function' ? getI18nText('locker_action_done', '✅ ผ่านแล้ว') : '✅ ผ่านแล้ว';
  const lockedText = typeof getI18nText === 'function' ? getI18nText('locker_action_locked', '🔒 รอด่านก่อนหน้า') : '🔒 รอด่านก่อนหน้า';
  const pausedTpl = typeof getI18nText === 'function' ? getI18nText('locker_action_paused', '⏸️ หยุดนับ (เหลืออีก {sec} วิ)') : '⏸️ หยุดนับ (เหลืออีก {sec} วิ)';

  const isUserAway = document.hidden || !document.hasFocus();

  for (let i = 1; i <= totalSteps; i++) {
    const item = document.getElementById(`taskItem_${i}`);
    const pill = document.getElementById(`taskPill_${i}`);
    const icon = document.getElementById(`taskIcon_${i}`);
    const desc = document.getElementById(`taskDesc_${i}`);
    if (!item || !pill) continue;

    if (completedSteps[i]) {
      // 1. Completed State
      item.className = 'task-item completed';
      pill.innerHTML = `<div class="btn-task-action completed"><i data-lucide="check-circle" style="width: 14px; height: 14px;"></i> <span>${doneText}</span></div>`;
      if (icon) icon.innerHTML = `<i data-lucide="check" style="width: 16px; height: 16px;"></i>`;
      if (desc) desc.textContent = (typeof getI18nText === 'function' && window.currentAppLanguage === 'th') ? '✅ ดูครบ 30 วินาทีเรียบร้อยแล้ว' : '✅ 30s completed';
      if (desc) desc.style.color = 'var(--text-muted)';
    } else if (activeDwellingStep === i) {
      const currentSpent = secondsOnAd[i] + (isUserAway && dwellSessionStart[i] ? Math.floor((Date.now() - dwellSessionStart[i]) / 1000) : 0);
      const remaining = Math.max(0, requiredDwellSeconds - currentSpent);

      if (isUserAway) {
        // 2. Currently Away on Ad Tab (Active Counting)
        item.className = 'task-item dwelling';
        pill.innerHTML = `<div class="btn-task-action dwelling"><i data-lucide="loader-2" class="spin" style="width: 14px; height: 14px;"></i> <span>⏳ ค้างอีก ${remaining} วิ</span></div>`;
      } else {
        // 3. User is on Locker Tab -> PAUSED! DOES NOT COUNT!
        item.className = 'task-item paused';
        pill.innerHTML = `<div class="btn-task-action paused"><i data-lucide="pause-circle" style="width: 14px; height: 14px;"></i> <span>${pausedTpl.replace('{sec}', remaining)}</span></div>`;
        if (desc) {
          desc.textContent = (typeof getI18nText === 'function' && window.currentAppLanguage === 'th')
            ? `⚠️ เวลาหยุดนับ! คลิกที่นี่เพื่อสลับไปค้างหน้าโฆษณาอีก ${remaining} วิ`
            : `⚠️ Timer paused! Click to switch back to ad for ${remaining}s more`;
          desc.style.color = '#F87171';
        }
      }
    } else if (i === 1 || completedSteps[i - 1]) {
      // 4. Unlocked / Ready to Click
      item.className = 'task-item ready-to-click';
      pill.innerHTML = `<div class="btn-task-action ready"><span>${readyText}</span></div>`;
      if (desc) {
        desc.textContent = (i === 1)
          ? ((typeof getI18nText === 'function' && window.currentAppLanguage === 'th') ? 'กดเปิดโฆษณาตัวที่ 1 และค้างไว้ 30 วินาที' : 'Click to open ad and dwell for 30s')
          : (i === 2)
            ? ((typeof getI18nText === 'function' && window.currentAppLanguage === 'th') ? 'กดเปิดโฆษณาตัวที่ 2 และค้างไว้ 30 วินาที' : 'Click to open ad and dwell for 30s')
            : ((typeof getI18nText === 'function' && window.currentAppLanguage === 'th') ? 'กดเปิดโฆษณาตัวสุดท้ายและค้างไว้ 30 วินาที' : 'Click to open ad and dwell for 30s');
        desc.style.color = 'var(--text-muted)';
      }
    } else {
      // 5. Locked State
      item.className = 'task-item locked';
      pill.innerHTML = `<div class="btn-task-action locked"><i data-lucide="lock" style="width: 12px; height: 12px;"></i> <span>${lockedText}</span></div>`;
      if (desc) desc.style.color = 'var(--text-muted)';
    }
  }

  lucide.createIcons();
}

// User clicking directly on one of the 3 Task Buttons
window.handleTaskButtonClick = function(btnIndex) {
  // Check if previous buttons completed
  if (btnIndex > 1 && !completedSteps[btnIndex - 1]) {
    const prevWarn = (typeof getI18nText === 'function' && window.currentAppLanguage === 'th')
      ? `⚠️ กรุณากดทำปุ่มที่ ${btnIndex - 1} ให้ผ่านก่อน!`
      : `⚠️ Please complete Button ${btnIndex - 1} first!`;
    showToast(prevWarn, 'warning', 3500);
    return;
  }

  // Already completed this button
  if (completedSteps[btnIndex]) {
    const doneNotice = (typeof getI18nText === 'function' && window.currentAppLanguage === 'th')
      ? `✅ ปุ่มที่ ${btnIndex} ผ่านการยืนยัน 30 วินาทีเรียบร้อยแล้ว!`
      : `✅ Button ${btnIndex} has already completed the 30s dwell!`;
    showToast(doneNotice, 'success', 2500);
    return;
  }

  // Set active step
  activeDwellingStep = btnIndex;

  // If already partially dwelt, re-open ad to continue
  const remaining = requiredDwellSeconds - (secondsOnAd[btnIndex] || 0);

  // Open the ad in a new tab
  triggerSmartlinkAd(btnIndex);

  // Set session start time when leaving
  dwellSessionStart[btnIndex] = Date.now();

  const startMsg = (typeof getI18nText === 'function' && window.currentAppLanguage === 'th')
    ? `🚀 เปิดหน้าโฆษณาแล้ว! กรุณาสลับไปค้างอยู่ที่หน้าโฆษณาอีก ${remaining} วิ (เวลานับเฉพาะตอนเปิดแท็บนั้น)`
    : `🚀 Ad opened! Please switch to and stay on the ad tab for ${remaining}s (Timer only runs while viewing ad).`;
  showToast(startMsg, 'info', 4500);

  updateButtonsVisualState();
  updateProgressUI();
};

// Handle Tab Switching (Visibility & Focus)
function handleTabStateChange() {
  if (!activeDwellingStep || completedSteps[activeDwellingStep]) return;
  const step = activeDwellingStep;
  const isUserAway = document.hidden || !document.hasFocus();

  if (isUserAway) {
    // User is on the ad tab! Start or continue measuring time away
    if (!dwellSessionStart[step]) {
      dwellSessionStart[step] = Date.now();
    }
  } else {
    // User returned to locker tab!
    // Commit the time spent on the ad tab
    if (dwellSessionStart[step]) {
      const awaySeconds = Math.floor((Date.now() - dwellSessionStart[step]) / 1000);
      secondsOnAd[step] += awaySeconds;
      dwellSessionStart[step] = null;
    }

    // Check if 30 seconds threshold met
    if (secondsOnAd[step] >= requiredDwellSeconds) {
      onButtonDwellVerified(step);
    } else {
      // Returned early -> PAUSE TIMER! IT DOES NOT COUNT HERE!
      const remaining = requiredDwellSeconds - secondsOnAd[step];
      document.title = `⏸️ (${remaining}s) หยุดนับเวลา! สลับไปหน้าโฆษณาเพื่อให้นับต่อ`;

      if (Date.now() - lastToastTime > 3000) {
        lastToastTime = Date.now();
        const toastMsg = (typeof getI18nText === 'function' && window.currentAppLanguage === 'th')
          ? `⏸️ หยุดนับเวลา! คุณค้างหน้าโฆษณาไปแล้ว ${secondsOnAd[step]}/30 วิ (เหลืออีก ${remaining} วิ) เวลานับต่อเฉพาะตอนเปิดแท็บโฆษณาเท่านั้น`
          : `⏸️ Timer paused! You spent ${secondsOnAd[step]}/30s. Timer only runs while you are on the ad page.`;
        showToast(toastMsg, 'warning', 4500);
      }

      updateButtonsVisualState();
      updateProgressUI();
    }
  }
}

// Background Ticker: Updates document title while away and verifies completion
function startBackgroundTicker() {
  if (backgroundTicker) clearInterval(backgroundTicker);

  backgroundTicker = setInterval(() => {
    if (!activeDwellingStep || completedSteps[activeDwellingStep]) return;
    const step = activeDwellingStep;
    const isUserAway = document.hidden || !document.hasFocus();

    if (isUserAway && dwellSessionStart[step]) {
      const currentAway = Math.floor((Date.now() - dwellSessionStart[step]) / 1000);
      const total = secondsOnAd[step] + currentAway;
      const remaining = Math.max(0, requiredDwellSeconds - total);

      if (remaining > 0) {
        document.title = `⏳ (${remaining}s) ค้างอยู่หน้าโฆษณา...`;
      } else {
        document.title = `✅ (ครบ 30 วิแล้ว!) สลับกลับมาหน้านี้ได้เลย`;
      }

      // If user stayed away full 30 seconds
      if (remaining <= 0) {
        secondsOnAd[step] = requiredDwellSeconds;
        dwellSessionStart[step] = null;
        onButtonDwellVerified(step);
      }
    }
  }, 500);
}

// When a button completes its 30s dwell verification
function onButtonDwellVerified(btnIndex) {
  completedSteps[btnIndex] = true;
  activeDwellingStep = null;
  dwellSessionStart[btnIndex] = null;
  secondsOnAd[btnIndex] = requiredDwellSeconds;

  document.title = `${currentLocker.name} \u2014 BlackPass 30s Verification`;

  updateButtonsVisualState();
  updateProgressUI();
  updateBottomButtonUI();

  const successMsg = (typeof getI18nText === 'function' && window.currentAppLanguage === 'th')
    ? `✅ ปุ่มที่ ${btnIndex} ผ่านแล้ว! (ดูครบ 30 วินาทีเต็ม)`
    : `✅ Button ${btnIndex} Verified! (30s dwell completed)`;
  showToast(successMsg, 'success', 3500);

  // Check if all 3 buttons are completed!
  if (completedSteps[1] && completedSteps[2] && completedSteps[3]) {
    const allDoneMsg = (typeof getI18nText === 'function' && window.currentAppLanguage === 'th')
      ? '🎉 ยอดเยี่ยม! ผ่านครบทั้ง 3 ปุ่มแล้ว กำลังปลดล็อคเข้าสู่เว็บไซต์...'
      : '🎉 Excellent! All 3 buttons verified! Unlocking website...';
    showToast(allDoneMsg, 'success', 4000);

    setTimeout(() => {
      unlockContent();
    }, 1200);
  }
}

// Progress Bar & Step Text Calculation
function updateProgressUI() {
  const doneCount = [completedSteps[1], completedSteps[2], completedSteps[3]].filter(Boolean).length;
  let fraction = doneCount / totalSteps;

  if (activeDwellingStep && !completedSteps[activeDwellingStep]) {
    const isUserAway = document.hidden || !document.hasFocus();
    const currentSpent = secondsOnAd[activeDwellingStep] + (isUserAway && dwellSessionStart[activeDwellingStep] ? Math.floor((Date.now() - dwellSessionStart[activeDwellingStep]) / 1000) : 0);
    const currentProgress = Math.min(1, currentSpent / requiredDwellSeconds);
    fraction = (doneCount + currentProgress) / totalSteps;
  }

  const percent = Math.min(100, Math.round(fraction * 100));

  const stepTemplate = typeof getI18nText === 'function'
    ? getI18nText('locker_step_text', 'ทำสำเร็จ {current} จาก {total} ปุ่ม ({percent}%)')
    : 'ทำสำเร็จ {current} จาก {total} ปุ่ม ({percent}%)';

  document.getElementById('progressStepText').textContent = stepTemplate
    .replace('{current}', doneCount)
    .replace('{total}', totalSteps)
    .replace('{percent}', percent);

  document.getElementById('progressBarFill').style.width = `${Math.max(8, percent)}%`;
}

// Bottom Action / Unlock Status Button
function updateBottomButtonUI() {
  const btn = document.getElementById('btnContinue');
  const btnText = document.getElementById('btnText');
  const btnIcon = document.getElementById('btnIcon');
  if (!btn || !btnText) return;

  const doneCount = [completedSteps[1], completedSteps[2], completedSteps[3]].filter(Boolean).length;

  if (doneCount >= totalSteps) {
    // All 3 Completed!
    btn.disabled = false;
    btn.className = 'btn-locker-continue btn-unlock';
    btnText.textContent = typeof getI18nText === 'function'
      ? getI18nText('locker_bottom_unlock', '🎉 ผ่านครบทั้ง 3 ปุ่มแล้ว! ปลดล็อคเข้าสู่เว็บไซต์ 🔓')
      : '🎉 ผ่านครบทั้ง 3 ปุ่มแล้ว! ปลดล็อคเข้าสู่เว็บไซต์ 🔓';
    btnIcon.className = '';
    btnIcon.setAttribute('data-lucide', 'unlock');
    btn.onclick = () => unlockContent();
  } else {
    // Waiting for completion
    btn.disabled = true;
    btn.className = 'btn-locker-continue';
    const waitingTpl = typeof getI18nText === 'function'
      ? getI18nText('locker_bottom_waiting', '🔒 กดทำภารกิจให้ครบ 3 ปุ่ม (ผ่านแล้ว {done}/3)')
      : '🔒 กดทำภารกิจให้ครบ 3 ปุ่ม (ผ่านแล้ว {done}/3)';
    btnText.textContent = waitingTpl.replace('{done}', doneCount);
    btnIcon.className = '';
    btnIcon.setAttribute('data-lucide', 'lock');
  }

  lucide.createIcons();
}

function updateLockerLanguage() {
  renderTaskButtons();
  updateProgressUI();
  updateBottomButtonUI();
}

// Real Ad Trigger (Links 1, 2, 3)
function triggerSmartlinkAd(btnIndex = 1) {
  const settings = (typeof GateStore !== 'undefined' && GateStore.getSettings) ? GateStore.getSettings() : null;
  const globalAds = settings?.ads || {};

  // Check step-specific URLs (OrinRankone 3 Adsterra Smartlinks)
  let stepUrl = '';
  if (btnIndex === 1) stepUrl = globalAds.step1Url || 'https://asiafilm.org/4/1c188bbb2ce8a02bfa3ee2ad75de4c53';
  else if (btnIndex === 2) stepUrl = globalAds.step2Url || 'https://asiafilm.org/4/d8707d797617eddbed2038e5921285e3';
  else if (btnIndex === 3) stepUrl = globalAds.step3Url || 'https://asiafilm.org/4/15645e0d7a0b92a6fcc92b70cbee607d';

  const targetSmartlink = (stepUrl && stepUrl.trim())
    ? stepUrl.trim()
    : (globalAds.smartlinkUrl && globalAds.smartlinkUrl.trim())
      ? globalAds.smartlinkUrl.trim()
      : 'https://asiafilm.org/4/1c188bbb2ce8a02bfa3ee2ad75de4c53';

  try {
    const adWindow = window.open(targetSmartlink, '_blank');
    if (!adWindow || adWindow.closed || typeof adWindow.closed === 'undefined') {
      showToast('⚠️ เบราว์เซอร์บล็อกป๊อปอัป! กรุณากด "อนุญาตป๊อปอัป" ด้านบนของเบราว์เซอร์เพื่อให้เปิดหน้าโฆษณาได้', 'warning', 5000);
    }
  } catch (e) {
    console.warn('[BlackPass] Popup blocked by browser policy:', e);
    showToast('⚠️ เบราว์เซอร์บล็อกป๊อปอัป! กรุณาอนุญาตป๊อปอัปในแถบ URL', 'warning', 5000);
  }
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

  // 2. Popunder script: Block intrusive 18+ social bar / push scripts
  if (ads.popunderScript && ads.popunderScript.trim()) {
    const popVal = ads.popunderScript.trim();
    const lower = popVal.toLowerCase();
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

// Unlock Content Trigger - Strictly enforced dwell verification on all 3 buttons
function unlockContent() {
  // CRITICAL CHECK: Must complete all 3 buttons 30s dwell
  for (let s = 1; s <= totalSteps; s++) {
    if (!completedSteps[s]) {
      const err = (typeof getI18nText === 'function' && window.currentAppLanguage === 'th')
        ? `⛔ ปุ่มที่ ${s} ยังไม่ผ่านการดูโฆษณา 30 วินาที! กรุณากดทำภารกิจให้ครบ`
        : `⛔ Button ${s} not verified for 30s! Please complete all 3 buttons.`;
      showToast(err, 'error', 4000);
      return;
    }
  }

  // Record unlock in store
  GateStore.recordUnlock(currentLocker.slug);

  // Switch to success view
  document.getElementById('lockerActiveView').style.display = 'none';
  const successView = document.getElementById('lockerSuccessView');
  successView.classList.add('active');

  // Resolve destination URL
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
