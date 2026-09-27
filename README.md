# BlackPass &mdash; Monetize Every Click
> Production-Ready Content Locker & Link Monetization Platform (SaaS Architecture)

BlackPass is an enterprise-grade link monetization, content locker, and ad-gate platform designed to maximize publisher revenue from scripts, gaming tools, software, and exclusive downloads.

---

## 🚀 Features Overview

- **Modern Dark SaaS Design**: Built using high-conversion, professional UI inspired by Stripe, Supabase, and Vercel. Zero generic AI templates, floating blobs, or gaudy neon glows.
- **Interactive Live Revenue Estimator**: Real-time slider calculation for daily traffic, CPM rates, and multi-step yield projections with USD and THB conversion.
- **Publisher Dashboard**:
  - Live Overview stats (Total Clicks, Completed Offers, Content Unlocks, Net Revenue, Conversion Rate).
  - Weekly Performance SVG Telemetry Chart with interactive tabs.
  - Granular Analytics (Top Countries with TH/VN/US/BR breakdown, Device split 72% Mobile / 28% Desktop).
  - Payouts & Wallet System with TrueMoney Wallet, PromptPay, PayPal, and USDT support.
  - Custom Domain CNAME verification simulator.
  - Developer Secret API Key and Webhook Postback configuration.
- **Content Locker / Access Gate (`locker.html`)**:
  - Mobile-first, sub-40ms edge performance.
  - Configurable 1 to 3 step gates with countdown timer and anti-cheat tab-blur pauses.
  - Direct integration ready for Adsterra (Native Banner, Popunder, Smartlink) and PopAds.
  - VIP Instant Key Bypass modal for paid Discord subscribers (e.g. 30 Baht permanent).
  - Success State with destination link preview, one-click copy, and automatic 5-second redirect.
- **Persistent Data Engine**: Client-side state managed via `GateStore` with `localStorage` persistence, pre-loaded with realistic sample data.

---

## 📂 Project Structure

```
gateflow/
├── index.html          # Landing Page with Hero, Features, Pricing, and Calculator
├── dashboard.html      # Publisher Management Dashboard & Analytics
├── locker.html         # Live Access Gate / Content Locker experience
├── css/
│   ├── main.css        # Design system tokens, buttons, badges, typography, resets
│   ├── landing.css     # Landing page hero, calculator card, feature grid, FAQ
│   ├── dashboard.css   # Sidebar, topbar, metric cards, chart, data tables, modals
│   └── locker.css      # Mobile-first locker container, progress bar, timer button
└── js/
    ├── store.js        # Persistent data store, lockers CRUD, metrics, settings
    ├── landing.js      # Interactive calculator logic & FAQ accordion
    ├── dashboard.js    # Dashboard navigation, chart engine, table rendering, modals
    └── locker.js       # Gate step execution, timer countdown, unlock logic, VIP bypass
```

---

## ⚡ How to Run Locally

You can open `gateflow/index.html` directly in any web browser, or serve it using any static HTTP server:

```powershell
# Using Python
python -m http.server 3000

# Using Node / npx
npx serve gateflow
```

- **Landing Page**: `http://localhost:3000/index.html`
- **Publisher Dashboard**: `http://localhost:3000/dashboard.html`
- **Live Locker Gate**: `http://localhost:3000/locker.html?slug=blox-fruits-v48`
