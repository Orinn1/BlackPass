/* ==========================================================================
   GateFlow Landing Page Logic
   Interactive Earnings Calculator & FAQ Accordion
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initCalculator();
  initFaqAccordion();
});

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

    visitorLabel.textContent = `${visits.toLocaleString()} visits`;
    cpmLabel.textContent = `$${cpm.toFixed(2)} CPM`;
    stepLabel.textContent = steps === 1 ? '1 Step (Quick)' : steps === 2 ? '2 Steps (Optimal)' : '3 Steps (Maximum Rev)';

    // Formula: (Visits / 1000) * CPM * StepMultiplier * RevShare
    const dailyUsd = (visits / 1000) * cpm * stepMultiplier * revShare;
    const monthlyUsd = dailyUsd * 30;
    const monthlyThb = monthlyUsd * 35.5; // Approx USD to THB rate

    dailyRevEl.textContent = `$${dailyUsd.toFixed(2)}`;
    monthlyRevEl.textContent = `$${monthlyUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    thbRevEl.textContent = `≈ ${Math.round(monthlyThb).toLocaleString()} THB / month`;
  }

  visitorSlider.addEventListener('input', update);
  cpmSlider.addEventListener('input', update);
  stepSlider.addEventListener('input', update);

  update();
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
