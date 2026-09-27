/* ==========================================================================
   GateFlow Landing Page Logic
   Interactive Earnings Calculator & FAQ Accordion
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initHeroShortener();
  initCalculator();
  initFaqAccordion();
});

// ShrinkEarn-Style Public Shortener Logic
function initHeroShortener() {
  const form = document.getElementById('publicShortenForm');
  const resultBox = document.getElementById('publicShortenResult');
  const linkText = document.getElementById('publicGeneratedLink');
  const copyBtn = document.getElementById('btnCopyPublicShort');
  const testBtn = document.getElementById('btnTestPublicShort');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const urlInput = document.getElementById('publicTargetUrl');
    const aliasInput = document.getElementById('publicAliasInput');
    const targetUrl = urlInput ? urlInput.value.trim() : '';
    let alias = aliasInput ? aliasInput.value.trim() : '';

    if (!targetUrl) return;

    if (!alias) {
      alias = 'bp-' + Math.random().toString(36).substring(2, 7);
    } else {
      alias = alias.toLowerCase().replace(/[^a-z0-9-_]/g, '-').replace(/-+/g, '-');
    }

    // Ensure user has a tracking ID in localStorage if not logged in
    let anonId = localStorage.getItem('blackpass_creator_uid');
    if (!anonId) {
      anonId = 'creator_' + Math.random().toString(36).substring(2, 9);
      localStorage.setItem('blackpass_creator_uid', anonId);
    }

    const newLocker = await GateStore.createLocker({
      name: `Public Link: ${alias}`,
      destinationUrl: targetUrl,
      slug: alias,
      steps: 3,
      timer: 30,
      antiBypass: true,
      ads: { popunder: false, banner: true, smartlink: true },
      userId: GateStore.currentUser ? GateStore.currentUser.uid : anonId
    });

    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const baseUrl = isLocal ? `http://${window.location.host}` : window.location.origin;
    const shortUrl = `${baseUrl}/l/${newLocker.slug}`;

    if (linkText) linkText.textContent = shortUrl;
    if (testBtn) testBtn.href = shortUrl;
    if (resultBox) {
      resultBox.style.display = 'block';
      resultBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    if (copyBtn) {
      copyBtn.onclick = () => {
        navigator.clipboard.writeText(shortUrl).then(() => {
          showToast('คัดลอกลิงก์เรียบร้อยแล้ว!', 'success');
        }).catch(() => {
          showToast(`Link: ${shortUrl}`, 'info');
        });
      };
    }

    if (typeof lucide !== 'undefined') lucide.createIcons();
    showToast('ย่อลิงก์สำเร็จ! ลิงก์นี้พร้อมสร้างรายได้ทันที', 'success', 5000);
  });
}

// Interactive Live Calculator
function initCalculator() {
  const visitorSlider = document.getElementById('calcVisitorSlider');
  const cpmSlider = document.getElementById('calcCpmSlider');
  const stepSlider = document.getElementById('calcStepSlider');

  const visitorLabel = document.getElementById('calcVisitorLabel');
  const cpmLabel = document.getElementById('calcCpmLabel');
  const stepLabel = document.getElementById('calcStepLabel');

  const monthlyRevEl = document.getElementById('calcMonthlyRevenue');
  const thbRevEl = document.getElementById('calcThbRevenue');
  const dailyRevEl = document.getElementById('calcDailyRevenue');

  if (!visitorSlider || !cpmSlider || !stepSlider) return;

  function update() {
    const visits = parseInt(visitorSlider.value, 10);
    const cpm = parseFloat(cpmSlider.value);
    const steps = parseInt(stepSlider.value, 10);

    // Multiplier based on steps (1 step = 1.0, 2 steps = 1.7, 3 steps = 2.4)
    const stepMultiplier = steps === 1 ? 1.0 : steps === 2 ? 1.7 : 2.4;
    const revShare = 0.92; // 92% Pro revshare

    const visitsText = (typeof getI18nText === 'function' && window.currentAppLanguage === 'th') ? 'ครั้ง/วัน' : 'visits';
    visitorLabel.textContent = `${visits.toLocaleString()} ${visitsText}`;
    cpmLabel.textContent = `$${cpm.toFixed(2)} CPM`;
    
    const step1 = typeof getI18nText === 'function' ? getI18nText('calc_step_1', '1 Step (Quick)') : '1 Step (Quick)';
    const step2 = typeof getI18nText === 'function' ? getI18nText('calc_step_2', '2 Steps (Optimal)') : '2 Steps (Optimal)';
    const step3 = typeof getI18nText === 'function' ? getI18nText('calc_step_3', '3 Steps (Maximum Rev)') : '3 Steps (Maximum Rev)';
    stepLabel.textContent = steps === 1 ? step1 : steps === 2 ? step2 : step3;

    // Formula: (Visits / 1000) * CPM * StepMultiplier * RevShare
    const dailyUsd = (visits / 1000) * cpm * stepMultiplier * revShare;
    const monthlyUsd = dailyUsd * 30;
    const monthlyThb = monthlyUsd * 35.5; // Approx USD to THB rate

    const perMonthText = (typeof getI18nText === 'function' && window.currentAppLanguage === 'th') ? 'บาท / เดือน' : 'THB / month';

    dailyRevEl.textContent = `$${dailyUsd.toFixed(2)}`;
    monthlyRevEl.textContent = `$${monthlyUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    thbRevEl.textContent = `≈ ${Math.round(monthlyThb).toLocaleString()} ${perMonthText}`;
  }

  visitorSlider.addEventListener('input', update);
  cpmSlider.addEventListener('input', update);
  stepSlider.addEventListener('input', update);

  update();

  window.addEventListener('blackpass_lang_changed', update);
  const oldLangChange = window.onLanguageChanged;
  window.onLanguageChanged = (lang) => {
    if (oldLangChange) oldLangChange(lang);
    update();
  };
}

// FAQ Accordion
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (!question) return;

    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      // Close others
      faqItems.forEach(i => i.classList.remove('active'));
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });
}
