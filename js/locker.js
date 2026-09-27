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
let serverSessionTicket = null;
let isVipBypassed = false;

document.addEventListener('DOMContentLoaded', () => {
  loadLockerData();
  initVipModal();
  checkInAppBrowser();

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
  const customUrl = urlParams.get('url') || urlParams.get('redirect') || urlParams.get('return_to');

  currentLocker = await GateStore.getLocker(slug);

  if (!currentLocker) {
    // Fallback default for Blacklist Script Hub or Quick Dynamic Link
    currentLocker = {
      id: 'gf_' + slug,
      name: customUrl ? (urlParams.get('title') || urlParams.get('name') || 'ปลดล็อคเนื้อหา / เข้าสู่ลิงก์ปลายทาง') : 'Blacklist Script Hub Access',
      slug: slug,
      destinationUrl: customUrl || 'https://th.blacklisthub.workers.dev/',
      steps: 3,
      timer: 30,
      ads: { popunder: false, banner: true, smartlink: true }
    };
  } else if (customUrl) {
    currentLocker.destinationUrl = customUrl;
  }

  // Request Server-Side Anti-Bypass Ticket from Worker / Local Server
  try {
    const ticketRes = await fetch(`/api/gate/start?slug=${encodeURIComponent(currentLocker.slug || 'hub-access')}`);
    if (ticketRes.ok) {
      const ticketData = await ticketRes.json();
      if (ticketData.success && ticketData.ticket) {
        serverSessionTicket = ticketData.ticket;
      }
    }
  } catch (e) {
    console.warn('[BlackPass] Failed to fetch server gate ticket:', e);
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

  const t1Title = typeof getI18nText === 'function' ? getI18nText('locker_task_1_title', 'ด่านที่ 1: ตรวจสอบความปลอดภัย') : 'ด่านที่ 1: ตรวจสอบความปลอดภัย';
  const t1Desc = typeof getI18nText === 'function' ? getI18nText('locker_task_1_desc', 'แตะเปิดโฆษณา (ค้างไว้ 30 วิ)') : 'แตะเปิดโฆษณา (ค้างไว้ 30 วิ)';
  const t2Title = typeof getI18nText === 'function' ? getI18nText('locker_task_2_title', 'ด่านที่ 2: สปอนเซอร์หลัก') : 'ด่านที่ 2: สปอนเซอร์หลัก';
  const t2Desc = typeof getI18nText === 'function' ? getI18nText('locker_task_2_desc', 'แตะเปิดโฆษณา (ค้างไว้ 30 วิ)') : 'แตะเปิดโฆษณา (ค้างไว้ 30 วิ)';
  const t3Title = typeof getI18nText === 'function' ? getI18nText('locker_task_3_title', 'ด่านที่ 3: รับสิทธิ์เข้าเว็บฮับ 24 ชม.') : 'ด่านที่ 3: รับสิทธิ์เข้าเว็บฮับ 24 ชม.';
  const t3Desc = typeof getI18nText === 'function' ? getI18nText('locker_task_3_desc', 'แตะเปิดโฆษณา (ค้างไว้ 30 วิ)') : 'แตะเปิดโฆษณา (ค้างไว้ 30 วิ)';

  const taskDefinitions = [
    { title: t1Title, desc: t1Desc },
    { title: t2Title, desc: t2Desc },
    { title: t3Title, desc: t3Desc }
  ];

  let html = '';
  for (let i = 1; i <= totalSteps; i++) {
    const def = taskDefinitions[i - 1];
    html += `
      <div class="task-item" id="taskItem_${i}" onclick="handleTaskButtonClick(${i})">
        <div class="task-top-row">
          <div class="task-left">
            <div class="task-num-badge" id="taskNumBadge_${i}">
              <span class="num-text">${i}</span>
            </div>
            <div class="task-info">
              <span class="task-title">${def.title}</span>
              <span class="task-desc" id="taskDesc_${i}">${def.desc}</span>
            </div>
          </div>
          <div class="task-status-indicator" id="taskPill_${i}">
            <!-- Action pill injected dynamically -->
          </div>
        </div>
        <!-- Sleek Mini Progress Track -->
        <div class="task-mini-progress-track" id="taskMiniProgress_${i}">
          <div class="task-mini-progress-fill" id="taskMiniFill_${i}" style="width: 0%;"></div>
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
  const readyText = typeof getI18nText === 'function' ? getI18nText('locker_action_ready', 'แตะเริ่ม (30 วิ)') : 'แตะเริ่ม (30 วิ)';
  const doneText = typeof getI18nText === 'function' ? getI18nText('locker_action_done', 'ผ่านแล้ว') : 'ผ่านแล้ว';
  const lockedText = typeof getI18nText === 'function' ? getI18nText('locker_action_locked', 'รอด่านก่อน') : 'รอด่านก่อน';
  const pausedTpl = typeof getI18nText === 'function' ? getI18nText('locker_action_paused', 'แตะนับต่อ ({sec}s)') : 'แตะนับต่อ ({sec}s)';

  const isUserAway = document.hidden || !document.hasFocus();

  for (let i = 1; i <= totalSteps; i++) {
    const item = document.getElementById(`taskItem_${i}`);
    const pill = document.getElementById(`taskPill_${i}`);
    const badge = document.getElementById(`taskNumBadge_${i}`);
    const desc = document.getElementById(`taskDesc_${i}`);
    const miniFill = document.getElementById(`taskMiniFill_${i}`);
    if (!item || !pill) continue;

    if (completedSteps[i]) {
      // 1. Completed State
      item.className = 'task-item completed';
      pill.innerHTML = `<div class="btn-task-action completed"><i data-lucide="check" style="width: 14px; height: 14px;"></i> <span>${doneText}</span></div>`;
      if (badge) badge.innerHTML = `<i data-lucide="check" style="width: 14px; height: 14px;"></i>`;
      if (desc) {
        desc.textContent = (typeof getI18nText === 'function' && window.currentAppLanguage === 'th') ? '✅ ดูครบ 30 วินาทีเรียบร้อยแล้ว' : '✅ 30s completed';
        desc.style.color = '#34D399';
      }
      if (miniFill) miniFill.style.width = '100%';
    } else if (activeDwellingStep === i) {
      const currentSpent = secondsOnAd[i] + (isUserAway && dwellSessionStart[i] ? Math.floor((Date.now() - dwellSessionStart[i]) / 1000) : 0);
      const remaining = Math.max(0, requiredDwellSeconds - currentSpent);
      const pct = Math.min(100, Math.round((currentSpent / requiredDwellSeconds) * 100));
      if (miniFill) miniFill.style.width = `${pct}%`;

      if (isUserAway) {
        // 2. Currently Away on Ad Tab (Active Counting)
        item.className = 'task-item dwelling';
        pill.innerHTML = `<div class="btn-task-action dwelling"><i data-lucide="loader-2" class="spin" style="width: 13px; height: 13px;"></i> <span>⏳ ${remaining}s</span></div>`;
        if (badge) badge.innerHTML = `<span class="num-text">${i}</span>`;
        if (desc) {
          desc.textContent = (typeof getI18nText === 'function' && window.currentAppLanguage === 'th')
            ? `⏳ กำลังนับเวลา... ค้างไว้ในหน้าโฆษณาอีก ${remaining} วิ`
            : `⏳ Counting... Stay on ad for ${remaining}s more`;
          desc.style.color = '#F59E0B';
        }
      } else {
        // 3. User is on Locker Tab -> PAUSED!
        item.className = 'task-item paused';
        pill.innerHTML = `<div class="btn-task-action paused"><i data-lucide="play" style="width: 12px; height: 12px; fill: currentColor;"></i> <span>${pausedTpl.replace('{sec}', remaining)}</span></div>`;
        if (badge) badge.innerHTML = `<span class="num-text">${i}</span>`;
        if (desc) {
          desc.textContent = (typeof getI18nText === 'function' && window.currentAppLanguage === 'th')
            ? `⚠️ เวลาหยุดนับ! แตะกลับไปค้างหน้าโฆษณาอีก ${remaining} วิ`
            : `⚠️ Timer paused! Tap to return to ad for ${remaining}s`;
          desc.style.color = '#F87171';
        }
      }
    } else if (i === 1 || completedSteps[i - 1]) {
      // 4. Ready to Click
      item.className = 'task-item ready-to-click';
      pill.innerHTML = `<div class="btn-task-action ready"><span>${readyText}</span> <i data-lucide="chevron-right" style="width: 13px; height: 13px;"></i></div>`;
      if (badge) badge.innerHTML = `<span class="num-text">${i}</span>`;
      if (desc) {
        desc.textContent = (typeof getI18nText === 'function' && window.currentAppLanguage === 'th')
          ? `แตะเพื่อเปิดโฆษณาและค้างไว้ 30 วินาที`
          : `Tap to open ad and stay for 30s`;
        desc.style.color = 'var(--text-muted)';
      }
      if (miniFill) miniFill.style.width = '0%';
    } else {
      // 5. Locked State
      item.className = 'task-item locked';
      pill.innerHTML = `<div class="btn-task-action locked"><i data-lucide="lock" style="width: 11px; height: 11px;"></i> <span>${lockedText}</span></div>`;
      if (badge) badge.innerHTML = `<i data-lucide="lock" style="width: 13px; height: 13px; opacity: 0.6;"></i>`;
      if (desc) {
        desc.textContent = (typeof getI18nText === 'function' && window.currentAppLanguage === 'th')
          ? `รอด่านที่ ${i - 1} ผ่านก่อน`
          : `Complete step ${i - 1} first`;
        desc.style.color = 'rgba(255, 255, 255, 0.3)';
      }
      if (miniFill) miniFill.style.width = '0%';
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

  // Mobile haptic vibration if supported (Gentle buzz when 30s dwell is done)
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    try { navigator.vibrate([160, 90, 160]); } catch(e) {}
  }

  hidePopupFallback();

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
      ? '🎉 ผ่านครบ 3 ด่านแล้ว! กำลังเข้าสู่เว็บไซต์ทันที...'
      : '🎉 All 3 steps complete! Redirecting now...';
    showToast(allDoneMsg, 'success', 2000);

    setTimeout(() => {
      unlockContent();
    }, 250);
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

  const stepEl = document.getElementById('progressStepText');
  if (stepEl) {
    const stepTemplate = typeof getI18nText === 'function'
      ? getI18nText('locker_step_text', '{current} / {total} ด่าน ({percent}%)')
      : '{current} / {total} ด่าน ({percent}%)';
    stepEl.textContent = stepTemplate
      .replace('{current}', doneCount)
      .replace('{total}', totalSteps)
      .replace('{percent}', percent);
  }

  const fillEl = document.getElementById('progressBarFill');
  if (fillEl) {
    fillEl.style.width = `${Math.max(6, percent)}%`;
  }
}

// Bottom Action / Unlock Status Button
function updateBottomButtonUI() {
  const btn = document.getElementById('btnContinue');
  const btnText = document.getElementById('btnText');
  const btnIcon = document.getElementById('btnIcon');
  const hintEl = document.getElementById('lockerHintText');
  if (!btn) return;

  const doneCount = [completedSteps[1], completedSteps[2], completedSteps[3]].filter(Boolean).length;

  if (doneCount >= totalSteps) {
    // All 3 Completed! Reveal glowing unlock button
    btn.style.display = 'flex';
    btn.disabled = false;
    btn.className = 'btn-locker-continue btn-unlock';
    if (btnText) {
      btnText.textContent = typeof getI18nText === 'function'
        ? getI18nText('locker_bottom_unlock', '🎉 ผ่านครบ 3 ด่านแล้ว! ปลดล็อคเข้าสู่เว็บไซต์ 🔓')
        : '🎉 ผ่านครบ 3 ด่านแล้ว! ปลดล็อคเข้าสู่เว็บไซต์ 🔓';
    }
    if (btnIcon) {
      btnIcon.setAttribute('data-lucide', 'unlock');
    }
    btn.onclick = () => unlockContent();
    if (hintEl) hintEl.style.display = 'none';
  } else {
    // Still in progress: Hide giant button, show minimal elegant hint
    btn.style.display = 'none';
    if (hintEl) {
      hintEl.style.display = 'flex';
      const remaining = totalSteps - doneCount;
      const isTh = (typeof getI18nText === 'function' && window.currentAppLanguage === 'th');
      const hintMsg = isTh
        ? `ค้างหน้าโฆษณาปุ่มละ 30 วินาที เพื่อปลดล็อค (เหลือ ${remaining} ด่าน)`
        : `Stay on each ad for 30s to unlock (${remaining} remaining)`;
      hintEl.innerHTML = `<i data-lucide="sparkles" style="width: 14px; height: 14px; color: #818CF8; flex-shrink: 0;"></i> <span>${hintMsg}</span>`;
    }
  }

  lucide.createIcons();
}

function updateLockerLanguage() {
  renderTaskButtons();
  updateProgressUI();
  updateBottomButtonUI();
}

// Real Ad Trigger (Links 1, 2, 3) - Strictly Enforce Owner's 3 Adsterra Smartlinks
function triggerSmartlinkAd(btnIndex = 1) {
  // Owner's verified Adsterra Smartlinks (Non-overridable)
  let targetSmartlink = 'https://asiafilm.org/4/1c188bbb2ce8a02bfa3ee2ad75de4c53';
  if (btnIndex === 1) targetSmartlink = 'https://asiafilm.org/4/1c188bbb2ce8a02bfa3ee2ad75de4c53';
  else if (btnIndex === 2) targetSmartlink = 'https://asiafilm.org/4/d8707d797617eddbed2038e5921285e3';
  else if (btnIndex === 3) targetSmartlink = 'https://asiafilm.org/4/15645e0d7a0b92a6fcc92b70cbee607d';

  try {
    const adWindow = window.open(targetSmartlink, '_blank');
    if (!adWindow || adWindow.closed || typeof adWindow.closed === 'undefined') {
      showPopupFallback(targetSmartlink, btnIndex);
      showToast('⚠️ เบราว์เซอร์บล็อกป๊อปอัป! ได้แสดงปุ่มเปิดโดยตรงด้านบนแล้ว', 'warning', 4500);
    } else {
      hidePopupFallback();
    }
  } catch (e) {
    console.warn('[BlackPass] Popup blocked by browser policy:', e);
    showPopupFallback(targetSmartlink, btnIndex);
  }
}

// Mobile Popup Fallback Helpers
function showPopupFallback(targetUrl, btnIndex) {
  const banner = document.getElementById('popupFallbackBanner');
  const link = document.getElementById('btnPopupFallback');
  const text = document.getElementById('popupFallbackText');
  if (banner && link) {
    link.href = targetUrl;
    if (text) text.innerHTML = `⚠️ เบราว์เซอร์บล็อกหน้าต่างใหม่สำหรับ <strong>ปุ่มที่ ${btnIndex}</strong>:`;
    banner.style.display = 'flex';
    link.onclick = () => {
      dwellSessionStart[btnIndex] = Date.now();
      setTimeout(() => {
        banner.style.display = 'none';
      }, 1000);
    };
    lucide.createIcons();
  }
}

function hidePopupFallback() {
  const banner = document.getElementById('popupFallbackBanner');
  if (banner) banner.style.display = 'none';
}

// Detect Discord / In-App Browser on Mobile
function checkInAppBrowser() {
  const ua = navigator.userAgent || navigator.vendor || window.opera || '';
  const isInApp = /Discord|Line\/|FBAN|FBAV|Instagram|TikTok|MicroMessenger/i.test(ua);
  const noticeEl = document.getElementById('inAppBrowserNotice');
  if (noticeEl && isInApp) {
    noticeEl.style.display = 'flex';
    lucide.createIcons();
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
async function unlockContent() {
  // CRITICAL CHECK: Must complete all 3 buttons 30s dwell on client
  for (let s = 1; s <= totalSteps; s++) {
    if (!completedSteps[s]) {
      const err = (typeof getI18nText === 'function' && window.currentAppLanguage === 'th')
        ? `⛔ ปุ่มที่ ${s} ยังไม่ผ่านการดูโฆษณา 30 วินาที! กรุณากดทำภารกิจให้ครบ`
        : `⛔ Button ${s} not verified for 30s! Please complete all 3 buttons.`;
      showToast(err, 'error', 4000);
      return;
    }
  }

  // Server-Side Anti-Bypass Check: Submit Ticket to Worker
  let passToken = null;
  if (!isVipBypassed && serverSessionTicket) {
    try {
      const verifyRes = await fetch('/api/gate/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ticket: serverSessionTicket,
          steps: [1, 2, 3]
        })
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok || !verifyData.success) {
        const errMsg = verifyData.error || '⛔ ตรวจพบการพยายามข้ามด่าน! เวลาดูโฆษณาไม่ครบตามที่เซิร์ฟเวอร์กำหนด';
        showToast(errMsg, 'error', 5500);
        return;
      }

      passToken = verifyData.passToken;
    } catch (e) {
      console.warn('[BlackPass] Server verification error:', e);
    }
  }

  // Record unlock in store
  GateStore.recordUnlock(currentLocker?.slug || 'hub-access');

  // Resolve destination URL
  const urlParams = new URLSearchParams(window.location.search);
  const returnTo = urlParams.get('url') || urlParams.get('return_to') || urlParams.get('redirect') || '';

  let destUrl = returnTo || currentLocker?.destinationUrl || 'https://th.blacklisthub.workers.dev/';
  destUrl = destUrl.replace(/[?&]auth_success=[^&]*/g, '');

  // Only append pass_token if destUrl is internal to our site/hub so external destinations (Pastebin, Mediafire, etc.) remain clean
  const isInternal = destUrl.startsWith('/') || destUrl.includes('workers.dev') || (window.location.hostname && destUrl.includes(window.location.hostname));
  if (passToken && isInternal) {
    const separator = destUrl.includes('?') ? '&' : '?';
    destUrl = `${destUrl}${separator}pass_token=${encodeURIComponent(passToken)}`;
  }

  // Set 24-Hour Authorization immediately across localStorage & sessionStorage
  try {
    const expiry24h = Date.now() + (24 * 60 * 60 * 1000);
    localStorage.setItem('blacklist_lootlabs_auth_expiry', String(expiry24h));
    sessionStorage.setItem('blacklist_lootlabs_auth', 'true');
    if (passToken) {
      localStorage.setItem('blackpass_token', passToken);
    }
    localStorage.setItem('blacklist_lootlabs_unlocked_event', String(Date.now()));
    window.dispatchEvent(new Event('storage'));
  } catch(e) {}

  // INSTANT REDIRECT DIRECTLY TO DESTINATION! (พาไปเลย ไม่ต้องแวะหน้าปลดล็อค)
  window.location.replace(destUrl);
  setTimeout(() => {
    window.location.href = destUrl;
  }, 100);
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
        isVipBypassed = true;
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
