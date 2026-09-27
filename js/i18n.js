/* ==========================================================================
   BlackPass — Bilingual Engine (TH 🇹🇭 / EN 🇺🇸)
   High-performance language switcher & localization dictionary
   ========================================================================== */

const I18N_DICTIONARY = {
  th: {
    // Navigation
    nav_features: 'ฟีเจอร์เด่น',
    nav_how: 'ขั้นตอนการทำงาน',
    nav_calc: 'คำนวณรายได้',
    nav_pricing: 'ส่วนแบ่งรายได้',
    nav_rates: 'อัตราจ่าย (Rates)',
    nav_faq: 'คำถามพบบ่อย',
    nav_signin: 'เข้าสู่ระบบ',
    nav_create: 'สร้าง Locker',
    nav_create_account: 'สมัครสมาชิก',
    nav_logout: 'ออกจากระบบ',

    // Hero
    hero_badge: 'เวอร์ชัน 2.4 เปิดใช้งานแล้ว &mdash; ส่วนแบ่งรายได้สูงสุด 92%',
    hero_title: 'สร้างรายได้จากทุกลิงก์ ด้วยระบบด่านโฆษณาผลตอบแทนสูง',
    hero_desc: 'เปลี่ยนสคริปต์ Roblox, ไฟล์ดาวน์โหลด และลิงก์เนื้อหาของคุณให้เป็นรายได้ต่อเนื่อง ด้วยระบบด่านภารกิจ, ระบบกันบอท Anti-Bypass และระบบถอนเงินเข้า TrueMoney / PromptPay ทันใจ',
    hero_btn_create: 'สร้าง Locker ของคุณ',
    hero_btn_demo: 'ทดสอบหน้าด่านตัวอย่าง',

    // Calculator
    calc_title: 'เครื่องคำนวณรายได้แบบ Real-time',
    calc_subtitle: 'ประเมินรายได้รายเดือนของคุณตามจำนวนคนเข้าและเรท CPM',
    calc_badge: 'สูตร CPM สด',
    calc_label_visitors: 'จำนวนคนคลิกต่อวัน',
    calc_label_cpm: 'เรท CPM โดยเฉลี่ย',
    calc_label_steps: 'จำนวนด่านข้ามโฆษณา',
    calc_est_monthly: 'ประมาณการรายได้ต่อเดือน',
    calc_daily_avg: 'เฉลี่ยต่อวัน',
    calc_payout_cut: 'ส่วนแบ่งรายได้',
    calc_step_1: '1 ด่าน (ผ่านไว)',
    calc_step_2: '2 ด่าน (แนะนำ)',
    calc_step_3: '3 ด่าน (กำไรสูงสุด)',

    // Stats
    stat_unlocks: 'ยอดปลดล็อคทั้งหมด',
    stat_paid: 'จ่ายเงินให้สมาชิกแล้ว',
    stat_latency: 'ความเร็วในการโหลดด่าน',
    stat_accuracy: 'ความแม่นยำระบบกันโกง',

    // Features
    feat_tag: 'ฟีเจอร์แพลตฟอร์ม',
    feat_title: 'ออกแบบเพื่อความปลอดภัยและรายได้สูงสุด',
    feat_desc: 'ทุกเครื่องมือถูกสร้างมาเพื่อปกป้องลิงก์สคริปต์ของคุณ พร้อมดันรายได้จากผู้ชมทุกคนให้ได้มากที่สุด',
    feat_1_title: 'ระบบป้องกัน Anti-Bypass',
    feat_1_desc: 'บล็อกพวกใช้ Tampermonkey, สคริปต์ Bypass และการกด Inspect element ด้วยระบบตรวจสอบเวลาและ Token แบบฝั่งเซิร์ฟเวอร์',
    feat_2_title: 'ระบบด่าน 1–3 ขั้นตอน',
    feat_2_desc: 'เลือกระบบด่านได้ 1, 2 หรือ 3 สเต็ป ผสมผสานตัวนับเวลา ลิงก์สปอนเซอร์ และ Captcha เพื่อดันยอดเงินสูงสุด',
    feat_3_title: 'รองรับทุกค่ายโฆษณา',
    feat_3_desc: 'เชื่อมต่อ Adsterra, PopAds, Monetag หรือ Smartlink ตรง เปิด-ปิด Popunder, แบนเนอร์ ได้ง่ายในคลิกเดียว',
    feat_4_title: 'ถอนเงินผ่านช่องทางไทย',
    feat_4_desc: 'ถอนเงินสะดวกเข้า TrueMoney Wallet, พร้อมเพย์ (PromptPay), PayPal หรือ Crypto (USDT) ขั้นต่ำเพียง $5.00',
    feat_5_title: 'ระบบสถิติแบบละเอียด',
    feat_5_desc: 'ดูกราฟยอดวิวสด อัตราการผ่านด่าน แยกตามประเทศ (ไทย, เวียดนาม, อเมริกา) และประเภทอุปกรณ์',
    feat_6_title: 'รองรับ Custom Domain',
    feat_6_desc: 'นำโดเมนของคุณเองมาผูก (CNAME) เพื่อป้องกันการถูก AdBlock บล็อค และสร้างความน่าเชื่อถือให้กับแบรนด์',

    // How It Works
    how_tag: 'ขั้นตอนการเริ่มต้น',
    how_title: 'เริ่มต้นสร้างรายได้ใน 3 นาที',
    how_desc: 'ระบบถูกออกแบบมาให้เรียบง่าย เพียงนำลิงก์มาวาง ตั้งค่าด่าน แล้วแชร์ลง Discord หรือ YouTube ได้ทันที',
    how_step_1_title: '1. วางลิงก์ปลายทางของคุณ',
    how_step_1_desc: 'ใส่ลิงก์สคริปต์ Pastebin, MediaFire หรือคีย์เข้าถึงที่คุณต้องการล็อก',
    how_step_2_title: '2. กำหนดด่านและตัวนับเวลา',
    how_step_2_desc: 'เลือกระหว่าง 1 ถึง 3 ขั้นตอน ตั้งเวลานับถอยหลัง และเปิดระบบโฆษณาที่ต้องการ',
    how_step_3_title: '3. รับเงินเข้ากระเป๋าต่อเนื่อง',
    how_step_3_desc: 'เมื่อผู้ใช้ปลดล็อคผ่านด่าน รายได้จะเข้าวอลเล็ตทันที ถอนเงินได้ทุกวัน',

    // Pricing / RevShare
    pricing_tag: 'โมเดลส่วนแบ่งรายได้',
    pricing_title: 'ส่วนแบ่งรายได้สูงที่สุดในวงการ',
    pricing_desc: 'เราเชื่อมั่นว่าครีเอเตอร์ควรได้รับผลตอบแทนที่คุ้มค่ากับผลงานของตนเอง',
    tier_free_title: 'Standard Publisher',
    tier_free_cut: '85% ส่วนแบ่งรายได้',
    tier_free_desc: 'เหมาะสำหรับผู้เริ่มต้นแชร์สคริปต์และลิงก์ดาวน์โหลดทั่วไป',
    tier_pro_title: 'Pro Developer',
    tier_pro_cut: '92% ส่วนแบ่งรายได้',
    tier_pro_desc: 'สำหรับเจ้าของช่อง YouTube และผู้พัฒนาสคริปต์ยอดนิยม',
    tier_ent_title: 'Network / Enterprise',
    tier_ent_cut: '96% ส่วนแบ่งรายได้',
    tier_ent_desc: 'สำหรับทีมงานขนาดใหญ่และเจ้าของฮับสคริปต์ที่มีทราฟฟิกสูง',

    // FAQ
    faq_tag: 'คำถามที่พบบ่อย',
    faq_title: 'มีข้อสงสัย? เรามีคำตอบ',
    faq_desc: 'ข้อมูลเกี่ยวกับความปลอดภัย การถอนเงิน และระบบป้องกันบอท',
    faq_q1: 'BlackPass ป้องกันบอทและส่วนขยาย Bypass ได้อย่างไร?',
    faq_a1: 'ระบบของเราไม่เคยแสดงลิงก์ปลายทางในโค้ด HTML หรือฝั่งเบราว์เซอร์ ลิงก์จะถูกเข้ารหัสและส่งมอบเมื่อเซิร์ฟเวอร์ตรวจสอบโทเค็นเวลาที่ถูกต้องเท่านั้น',
    faq_q2: 'รองรับช่องทางการถอนเงินอะไรบ้าง?',
    faq_a2: 'รองรับ TrueMoney Wallet, PromptPay, PayPal และ Crypto (USDT TRC-20) ขั้นต่ำเพียง $5.00 เงินเข้าไวภายใน 10-30 นาที',
    faq_q3: 'สามารถล็อกโค้ด Lua สคริปต์ตรงๆ โดยไม่ต้องใช้ลิงก์ภายนอกได้หรือไม่?',
    faq_a3: 'ได้แน่นอน! BlackPass มีระบบแสดงกล่องคัดลอกโค้ดสคริปต์หรือ License Key ให้ผู้ใช้กดคัดลอกได้ทันทีหลังผ่านด่าน',

    // Footer
    footer_tagline: 'Monetize Every Click &mdash; สร้างรายได้จากทุกลิงก์เข้าถึงของคุณ',
    footer_rights: '&copy; 2026 BlackPass Systems Inc. สงวนลิขสิทธิ์ทั้งหมด',

    // Dashboard Sidebar & Topbar
    menu_main: 'เมนูหลัก',
    menu_finances: 'การเงิน & กระเป๋า',
    menu_system: 'ระบบ & การตั้งค่า',
    menu_overview: 'ภาพรวม',
    menu_lockers: 'Locker ทั้งหมด',
    menu_analytics: 'สถิติเชิงลึก',
    menu_payouts: 'กระเป๋าเงิน & ถอนเงิน',
    menu_rates: 'อัตราจ่าย CPM (Payout Rates)',
    menu_settings: 'ตั้งค่า & API',
    topbar_available: 'ยอดเงินพร้อมถอน:',
    btn_create_locker: 'สร้าง Locker ใหม่',

    // Metric Cards
    card_clicks: 'ยอดคลิกทั้งหมด',
    card_offers: 'ผ่านด่านสำเร็จ',
    card_unlocks: 'ปลดล็อคเนื้อหา',
    card_revenue: 'รายได้สุทธิ',
    card_conversion: 'อัตราความสำเร็จ',
    trend_clicks: '0% สัปดาห์นี้',
    trend_offers: '0% สัปดาห์นี้',
    trend_unlocks: '0% เทียบ 7 วันก่อน',
    trend_revenue: 'รอการสร้างรายได้',
    trend_conversion: 'ยังไม่มีข้อมูล',

    // Chart
    chart_title: 'กราฟสถิติประสิทธิภาพย้อนหลัง 7 วัน',
    chart_desc: 'เปรียบเทียบยอดคนคลิกเข้าและยอดคนปลดล็อคสคริปต์สำเร็จ',
    chart_tab_clicks: 'คลิก',
    chart_tab_unlocks: 'ปลดล็อค',
    chart_tab_revenue: 'รายได้ ($)',
    chart_empty_note: 'ยังไม่มีข้อมูลสถิติ (ระบบพร้อมรับทราฟฟิกเมื่อมีคนเข้าลิงก์)',

    // Table
    table_title: 'รายการ Content Locker ที่เปิดใช้งาน',
    table_search_placeholder: 'ค้นหาชื่อ Locker หรือ Slug...',
    th_locker: 'ชื่อ Locker / ลิงก์ย่อ',
    th_dest: 'ลิงก์ปลายทาง (Target)',
    th_config: 'การตั้งค่า',
    th_clicks_unlocks: 'คลิก / ปลดล็อค',
    th_revenue: 'รายได้ ($)',
    th_status: 'สถานะ',
    th_actions: 'จัดการ',
    status_active: 'ใช้งานอยู่',
    status_paused: 'หยุดชั่วคราว',
    btn_copy_link: 'คัดลอกลิงก์',
    btn_delete_locker: 'ลบ Locker',

    // Analytics Deep Dive
    analytics_geo_title: 'สถิติผู้ชมตามประเทศ (Top 5)',
    geo_no_data: 'ยังไม่มีทราฟฟิกแยกตามประเทศ (ระบบจะประมวลผลทันทีเมื่อมีผู้เข้าชม)',
    analytics_device_title: 'สัดส่วนอุปกรณ์ของผู้เข้าชม',
    analytics_device_mobile: 'มือถือ (Android / iOS)',
    analytics_device_mobile_sub: 'ผู้เล่น Roblox Mobile, Delta & Fluxus',
    analytics_device_pc: 'คอมพิวเตอร์ (Windows / Mac)',
    analytics_device_pc_sub: 'ผู้เล่น PC Executors & Script Hubs',
    analytics_daily_title: 'สถิติรายวันย้อนหลัง 7 วัน',
    table_no_data: 'ยังไม่มีข้อมูลสถิติรายวัน (ระบบจะเริ่มบันทึกอัตโนมัติเมื่อมีคนคลิกเข้าสู่ Locker)',
    th_date: 'วันที่',
    th_raw_clicks: 'ยอดคลิกดิบ',
    th_unique_visitors: 'ผู้ชมไม่ซ้ำ',
    th_completed_tasks: 'ทำภารกิจสำเร็จ',
    th_unlock_rate: 'อัตราปลดล็อค',
    th_avg_cpm: 'เรท CPM เฉลี่ย',
    th_net_earnings: 'รายได้สุทธิ',

    // Payouts View
    payout_active_balance: 'ยอดเงินคงเหลือในกระเป๋า',
    payout_ready_desc: 'ยอดเงินยังไม่ถึงเกณฑ์ถอนขั้นต่ำ ($5.00)',
    payout_dest_label: 'ช่องทางการรับเงิน',
    payout_account_label: 'เบอร์โทรศัพท์ / เลขบัญชี / กระเป๋าเงิน',
    payout_btn_submit: 'ยอดเงินไม่เพียงพอสำหรับถอน ($0.00)',
    payout_policy_title: 'นโยบายและความปลอดภัยในการจ่ายเงิน',
    payout_policy_1_title: 'ประมวลผลด่วนในไทย:',
    payout_policy_1_desc: 'TrueMoney Wallet และ PromptPay เงินเข้าภายใน 10-30 นาที',
    payout_policy_2_title: 'ฟรีค่าธรรมเนียมการโอน:',
    payout_policy_2_desc: 'BlackPass ออกค่าธรรมเนียมและ Gas fee ให้สมาชิกทั้งหมด',
    payout_policy_3_title: 'ระบบป้องกันการโกง:',
    payout_policy_3_desc: 'ตรวจสอบทราฟฟิกด้วย AI และ Adsterra Anti-Fraud ก่อนโอนเงิน',
    payout_recent_title: 'ประวัติการทำรายการถอนเงินล่าสุด',
    table_no_payouts: 'ยังไม่มีประวัติการทำรายการถอนเงิน',
    th_txn_id: 'รหัสธุรกรรม',
    th_txn_date: 'วันที่ขอถอน',
    th_txn_dest: 'ช่องทางรับเงิน',
    th_txn_usd: 'จำนวน ($)',
    th_txn_thb: 'จำนวน (บาท)',
    th_txn_status: 'สถานะ',
    txn_status_completed: 'โอนสำเร็จ',
    txn_status_processing: 'กำลังดำเนินการ',

    // Settings View
    settings_profile_title: 'ข้อมูลบัญชี Publisher',
    settings_profile_desc: 'ข้อมูลส่วนตัวและระดับส่วนแบ่งรายได้ของคุณ',
    settings_label_user: 'ชื่อผู้ใช้ (Username)',
    settings_label_email: 'อีเมล',
    settings_label_tier: 'ระดับสมาชิก',
    settings_domain_title: 'เชื่อมต่อ Custom Domain',
    settings_domain_desc: 'ใช้โดเมนของคุณเองเพื่อหลบ AdBlock และเพิ่มความน่าเชื่อถือ',
    settings_label_domain: 'โดเมนของคุณ (FQDN)',
    settings_cname_hint: 'ชี้ CNAME ไปที่: <code>cname.blackpass.link</code>',
    settings_btn_save_domain: 'บันทึกโดเมน',
    settings_api_title: 'API & Webhook Postback',
    settings_api_desc: 'เชื่อมต่อ API Key เข้ากับบอท Discord หรือเว็บไซต์ของคุณ',
    settings_label_apikey: 'Live API Secret Key',
    settings_label_webhook: 'URL รับ Webhook เมื่อผ่านด่าน',
    settings_webhook_hint: 'ระบบจะยิง JSON payload พร้อมลายเซ็นยืนยันเมื่อผู้ใช้ปลดล็อค',
    settings_btn_save_api: 'บันทึกการตั้งค่า API',

    // Ad Network & Monetization Settings
    settings_ads_title: 'ตั้งค่าเครือข่ายโฆษณา (Ad Network & Monetization)',
    settings_ads_desc: 'เชื่อมต่อ Smartlink / Direct Link หรือสคริปต์โฆษณา (Adsterra, Monetag) เพื่อรับเงินเข้าบัญชีคุณโดยตรง',
    settings_ads_network_label: 'เครือข่ายโฆษณาหลัก',
    settings_ads_smartlink_label: 'ลิงก์ Smartlink / Direct Link หลัก (แนะนำอันดับ 1)',
    settings_ads_smartlink_placeholder: 'https://www.profitablecpmrate.com/xxxxx หรือ https://otergroo.net/...',
    settings_ads_smartlink_hint: 'เมื่อผู้ใช้คลิกทำภารกิจหรือกดต่อไป ระบบจะเปิด Smartlink นี้เพื่อสร้างรายได้ CPM ให้คุณทันที',
    settings_ads_popunder_label: 'สคริปต์ Popunder (ตัวเลือกเสริม)',
    settings_ads_popunder_placeholder: 'วางแท็ก <script> หรือ URL สคริปต์ Popunder จากค่ายโฆษณา',
    settings_ads_popunder_hint: 'โฆษณาหน้าต่างซ้อนหลัง จะทำงานอัตโนมัติเมื่อผู้ใช้คลิกหน้า Locker',
    settings_ads_banner_label: 'โค้ด Native Banner (กล่องสปอนเซอร์)',
    settings_ads_banner_placeholder: 'วางโค้ด HTML / Script แบนเนอร์ขนาด 300x250 หรือ 468x60',
    settings_ads_banner_hint: 'โค้ดนี้จะไปแสดงในกล่องสปอนเซอร์ของหน้า Locker แทนข้อความเริ่มต้น',
    settings_ads_split_title: 'สูตรผสม 3 ค่ายแยกตาม 3 ด่าน (รายได้คูณ 3)',
    settings_ads_split_desc: 'แยกค่ายโฆษณาคนละค่ายในแต่ละด่าน เพื่อให้ผู้ใช้ไม่ถูกนับเป็น IP ซ้ำ และสร้างรายได้เต็ม 100% ทั้ง 3 ด่าน',
    settings_ads_step1_label: 'ด่านที่ 1 (แนะนำ: PopAds — ถอนตอนไหนก็ได้)',
    settings_ads_step1_placeholder: 'https://... ลิงก์ PopAds หรือ Direct Link ด่าน 1',
    settings_ads_step2_label: 'ด่านที่ 2 (แนะนำ: Adsterra — CPM สูงสุด)',
    settings_ads_step2_placeholder: 'https://... ลิงก์ Adsterra Smartlink ด่าน 2',
    settings_ads_step3_label: 'ด่านที่ 3 (แนะนำ: Monetag — โหลดไว)',
    settings_ads_step3_placeholder: 'https://... ลิงก์ Monetag Smartlink ด่าน 3',
    settings_btn_save_ads: 'บันทึกการตั้งค่าโฆษณา',

    settings_danger_title: 'จัดการข้อมูลระบบ (Data Reset)',
    settings_danger_desc: 'รีเซ็ตสถิติ ยอดเงิน และรายการ Locker ทั้งหมดในเครื่องให้เป็นค่าว่างเปล่า (0)',
    btn_reset_data: 'ล้างข้อมูลทั้งหมดให้ว่างเปล่า',
    reset_confirm_msg: 'คุณต้องการรีเซ็ตข้อมูลทั้งหมดในระบบให้เป็นค่าว่างเปล่า (0) ใช่หรือไม่?',
    reset_success_msg: 'รีเซ็ตข้อมูลทั้งหมดเป็นค่าว่างเรียบร้อยแล้ว!',

    // Create Locker Modal
    modal_create_title: 'สร้าง Content Locker ใหม่',
    modal_name_label: 'ชื่อ Locker *',
    modal_name_placeholder: 'เช่น Blox Fruits Autofarm Script v4.9',
    modal_name_hint: 'ชื่อนี้จะแสดงเป็นหัวข้อในหน้าด่านข้ามโฆษณาของคุณ',
    modal_dest_label: 'ลิงก์ปลายทาง / สคริปต์ *',
    modal_dest_placeholder: 'https://pastebin.com/raw/...',
    modal_dest_hint: 'สคริปต์, คีย์ หรือไฟล์ที่จะปล่อยให้ผู้ใช้หลังทำภารกิจเสร็จ',
    modal_smartlink_label: 'ลิงก์ Smartlink เฉพาะ Locker นี้ (ทางเลือก)',
    modal_smartlink_placeholder: 'เว้นว่างไว้เพื่อใช้ Smartlink หลักจากหน้า Settings',
    modal_smartlink_hint: 'หากใส่ ลิงก์นี้จะถูกเปิดแทน Smartlink หลักเมื่อผู้ใช้ทำด่านนี้',
    modal_slug_label: 'ลิงก์ย่อกำหนดเอง (Slug)',
    modal_slug_placeholder: 'blox-fruits-v49',
    modal_steps_label: 'จำนวนขั้นตอน (Steps)',
    modal_step_1: '1 ขั้นตอน (ปลดล็อคไว)',
    modal_step_2: '2 ขั้นตอน (สมดุล แนะนำ)',
    modal_step_3: '3 ขั้นตอน (ผลกำไรสูงสุด)',
    modal_timer_label: 'เวลานับถอยหลังต่อขั้นตอน',
    modal_timer_5: '5 วินาที (เร็วมาก)',
    modal_timer_8: '8 วินาที (แนะนำ)',
    modal_timer_10: '10 วินาที (มาตรฐาน)',
    modal_timer_15: '15 วินาที (ดูโฆษณานานสุด)',
    modal_ad_settings: 'ตั้งค่าตำแหน่งโฆษณา & รูปแบบ',
    modal_popunder_title: 'โฆษณา Popunder',
    modal_popunder_desc: 'CPM สูงจากการคลิกแรก',
    modal_banner_title: 'แบนเนอร์ Native Banner',
    modal_banner_desc: 'รับเงินจากการแสดงผลหน้าเว็บ',
    modal_antibypass_title: 'ระบบคุ้มครอง Anti-Bypass',
    modal_antibypass_desc: 'บล็อกการกด Inspect element และส่วนขยายข้ามด่าน',
    modal_btn_cancel: 'ยกเลิก',
    modal_btn_deploy: 'สร้างและเปิดใช้งาน Locker',

    // Delete Modal
    modal_delete_title: 'ยืนยันการลบ Locker?',
    modal_delete_desc: 'คุณแน่ใจหรือไม่ว่าต้องการลบ Content Locker นี้? ผู้ใช้ที่คลิกลิงก์นี้ใน Discord หรือ YouTube จะไม่สามารถปลดล็อคได้อีกต่อไป',
    modal_btn_confirm_delete: 'ยืนยันการลบ',

    // Locker Page
    locker_brand_badge: 'BlackPass ระบบยืนยันตัวตน',
    locker_default_title: 'เนื้อหาถูกจำกัดสิทธิ์การเข้าถึง',
    locker_default_desc: 'กรุณาทำตามขั้นตอนด้านล่างเพื่อยืนยันเซสชันและปลดล็อคเนื้อหาสคริปต์ของคุณ',
    locker_progress_label: 'ความคืบหน้า',
    locker_step_text: 'ทำสำเร็จ {current} จาก {total} ปุ่ม ({percent}%)',
    locker_task_1_title: 'ปุ่มที่ 1: สปอนเซอร์เซิร์ฟเวอร์หลัก (30 วิ)',
    locker_task_1_desc: 'กดเปิดโฆษณาตัวที่ 1 และค้างไว้ 30 วินาที',
    locker_task_2_title: 'ปุ่มที่ 2: สปอนเซอร์ความปลอดภัย (30 วิ)',
    locker_task_2_desc: 'กดเปิดโฆษณาตัวที่ 2 และค้างไว้ 30 วินาที',
    locker_task_3_title: 'ปุ่มที่ 3: รับสิทธิ์เข้าเว็บฮับ 24 ชม. (30 วิ)',
    locker_task_3_desc: 'กดเปิดโฆษณาตัวสุดท้ายและค้างไว้ 30 วินาที',
    locker_task_pending: 'รอดำเนินการ',
    locker_task_active: 'กำลังทำรายการ',
    locker_task_done: 'เสร็จสิ้นแล้ว',
    locker_sponsor_badge: 'ผู้สนับสนุนการปลดล็อคอย่างเป็นทางการ',
    locker_wait: 'กรุณารออีก {sec} วินาที...',
    locker_continue: 'ไปขั้นตอนถัดไป',
    locker_unlock_btn: 'ปลดล็อคเนื้อหาทันที',
    locker_vip_btn: 'มีคีย์ VIP?',
    locker_footer_shield: 'คุ้มครองด้วยระบบ Anti-Bypass v2.4',
    locker_btn_open_ad: '👉 คลิกเปิดโฆษณา (ปุ่มที่ {step}/{total})',
    locker_btn_dwelling: '⏳ กำลังดูโฆษณา... เหลืออีก {sec} วิ',
    locker_btn_return_too_soon: '⚠️ กรุณาค้างอยู่หน้าโฆษณาอีก {sec} วิ (คลิกกลับไปดู)',
    locker_btn_step_passed: '✅ ผ่านปุ่มที่ {step} แล้ว! ไปต่อปุ่มที่ {next} ➔',
    locker_btn_all_passed: '🎉 ผ่านครบทั้ง 3 ปุ่มแล้ว! ปลดล็อคเข้าสู่เว็บไซต์ 🔓',
    locker_instruction_dwell: '⚠️ กติกา: กดทำภารกิจให้ครบทั้ง 3 ปุ่ม โดยต้องค้างอยู่ที่หน้าโฆษณาปุ่มละ 30 วินาที จึงจะปลดล็อคเว็บไซต์',
    locker_task_status_waiting: 'รอเปิดโฆษณา',
    locker_task_status_dwelling: 'กำลังดู ({sec} วิ)',
    locker_toast_early_return: '⚠️ คุณยังค้างอยู่หน้าโฆษณาไม่ครบ 30 วินาที! (เหลืออีก {sec} วิ) กรุณากลับไปดูต่อจนครบเพื่อปลดล็อค',
    locker_action_ready: '👉 กดเริ่ม (30 วิ)',
    locker_action_dwelling: '⏳ ค้างอีก {sec} วิ',
    locker_action_paused: '⏸️ หยุดนับ (เหลืออีก {sec} วิ)',
    locker_action_done: '✅ ผ่านแล้ว',
    locker_action_locked: '🔒 รอด่านก่อนหน้า',
    locker_desc_paused: '⚠️ เวลาหยุดนับ! คลิกเพื่อสลับไปค้างหน้าโฆษณาอีก {sec} วิ',
    locker_bottom_waiting: '🔒 กดทำภารกิจให้ครบ 3 ปุ่ม (ผ่านแล้ว {done}/3)',
    locker_bottom_unlock: '🎉 ผ่านครบทั้ง 3 ปุ่มแล้ว! ปลดล็อคเข้าสู่เว็บไซต์ 🔓',

    // Unlocked Success Page
    unlocked_title: 'ปลดล็อคสำเร็จแล้ว!',
    unlocked_desc: 'ยืนยันตัวตนเรียบร้อย ระบบจะจดจำเครื่องนี้ไว้ใช้งานได้ตลอด 24 ชั่วโมง',
    unlocked_access_btn: 'เข้าสู่เนื้อหา / รับสคริปต์',
    unlocked_copy_btn: 'คัดลอกลิงก์ปลายทาง',
    unlocked_redirect_text: 'กำลังพาวาร์ปไปปลายทางในอีก {sec} วินาที...',

    // VIP Modal
    vip_modal_title: 'ข้ามด่านด้วยคีย์ VIP ทันที',
    vip_modal_desc: 'หากคุณมียศ VIP ใน Discord (30 บาทถาวร) หรือมีคีย์ข้ามด่าน สามารถกรอกรหัสด้านล่างเพื่อปลดล็อคสคริปต์ทันทีโดยไม่ต้องดูโฆษณา',
    vip_input_label: 'รหัส VIP License Key',
    vip_input_placeholder: 'เช่น VIP-PASS-2026',
    vip_hint: 'ทิป: พิมพ์ <code>VIP30</code> เพื่อทดสอบการข้ามด่านทันที',
    vip_redeem_btn: 'ยืนยันและปลดล็อค',

    // Auth
    auth_signin_title: 'เข้าสู่ระบบ BlackPass',
    auth_signup_title: 'สร้างบัญชี Publisher',
    auth_forgot_title: 'รีเซ็ตรหัสผ่าน',
    auth_tab_signin: 'เข้าสู่ระบบ',
    auth_tab_signup: 'สมัครสมาชิก',
    auth_label_username: 'ชื่อผู้ใช้ (Username)',
    auth_label_email: 'ที่อยู่อีเมล',
    auth_label_pass: 'รหัสผ่าน',
    auth_label_pass_min: 'รหัสผ่าน (ขั้นต่ำ 6 ตัวอักษร)',
    auth_btn_signin: 'เข้าสู่ Dashboard',
    auth_btn_signup: 'สร้างบัญชีผู้ใช้ใหม่',
    auth_btn_forgot: 'ลืมรหัสผ่าน?',
    auth_btn_send_reset: 'ส่งลิงก์รีเซ็ตรหัสผ่าน',
    auth_forgot_desc: 'กรอกอีเมลที่คุณใช้สมัคร แล้วระบบจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่เข้ากล่องข้อความอีเมลของคุณทันที',
    auth_back_to_login: 'กลับไปหน้าเข้าสู่ระบบ'
  },

  en: {
    // Navigation
    nav_features: 'Features',
    nav_how: 'How It Works',
    nav_calc: 'Calculator',
    nav_pricing: 'RevShare',
    nav_rates: 'Payout Rates',
    nav_faq: 'FAQ',
    nav_signin: 'Sign In',
    nav_create: 'Create Locker',
    nav_create_account: 'Create Account',
    nav_logout: 'Logout',

    // Hero
    hero_badge: 'Version 2.4 Live &mdash; 92% Highest RevShare in Industry',
    hero_title: 'Monetize Every Click With High-Yield Access Gates',
    hero_desc: 'Turn your Roblox scripts, gaming tools, and exclusive content into recurring revenue. Engineered with multi-step task walls, anti-bypass security, and instant payouts.',
    hero_btn_create: 'Create Your Locker',
    hero_btn_demo: 'Test Live Gate Demo',

    // Calculator
    calc_title: 'Interactive Revenue Estimator',
    calc_subtitle: 'Calculate your projected monthly earnings based on your current audience volume.',
    calc_badge: 'Live CPM Formula',
    calc_label_visitors: 'Daily Link Visitors',
    calc_label_cpm: 'Expected CPM Rate',
    calc_label_steps: 'Gate Step Strategy',
    calc_est_monthly: 'Estimated Monthly Revenue',
    calc_daily_avg: 'Daily Average',
    calc_payout_cut: 'Est. Payout Cut',
    calc_step_1: '1 Step (Quick Unlock)',
    calc_step_2: '2 Steps (Balanced Revenue)',
    calc_step_3: '3 Steps (Maximum Profit)',

    // Stats
    stat_unlocks: 'Content Unlocks Processed',
    stat_paid: 'Paid Directly to Publishers',
    stat_latency: 'Global Edge Gate Latency',
    stat_accuracy: 'Anti-Bypass Shield Accuracy',

    // Features
    feat_tag: 'Platform Features',
    feat_title: 'Built for Performance and Security',
    feat_desc: 'Everything you need to safeguard your intellectual property while maximizing revenue from every viewer.',
    feat_1_title: 'Anti-Bypass Defense',
    feat_1_desc: 'Stop Tampermonkey users, inspect element tricks, and automated bypass bots with time-gated server validation and dynamic session tokens.',
    feat_2_title: 'Multi-Step Task Walls',
    feat_2_desc: 'Configure 1, 2, or 3 step gates. Combine countdown timers, sponsor article visits, and captcha verification for maximum payout.',
    feat_3_title: 'Ad Network Flexibility',
    feat_3_desc: 'Connect directly to Adsterra, PopAds, Monetag, or your custom smartlinks. Toggle popunders, banners, or direct campaigns in 1 click.',
    feat_4_title: 'Instant Local Payouts',
    feat_4_desc: 'Withdraw your earnings directly to TrueMoney Wallet, PromptPay, PayPal, or Crypto (USDT) with low $5.00 minimum payout thresholds.',
    feat_5_title: 'Granular Analytics',
    feat_5_desc: 'Real-time telemetry showing unique impressions, completion rates, country tier breakdown, and revenue per thousand visits (CPM).',
    feat_6_title: 'Custom Domain Support',
    feat_6_desc: 'Bring your own custom domain or subdomain to eliminate ad-block penalties and protect your brand reputation with clean links.',

    // How It Works
    how_tag: 'Workflow',
    how_title: 'Start Earning in 3 Simple Steps',
    how_desc: 'BlackPass makes link monetization effortless. Configure your link, deploy your gate, and start earning today.',
    how_step_1_title: '1. Wrap Your Links',
    how_step_1_desc: 'Paste your raw Pastebin Lua script, MediaFire link, or software download URL into BlackPass.',
    how_step_2_title: '2. Configure Task Walls',
    how_step_2_desc: 'Choose 1 to 3 checkpoint steps, adjust countdown timers, and enable ad placements.',
    how_step_3_title: '3. Cash Out Daily',
    how_step_3_desc: 'Watch your real-time revenue climb as visitors complete steps. Withdraw daily with zero hidden fees.',

    // Pricing / RevShare
    pricing_tag: 'RevShare Model',
    pricing_title: 'The Industry\'s Highest Payout Splits',
    pricing_desc: 'We prioritize creators with transparent economics and market-leading revshare rates.',
    tier_free_title: 'Standard Publisher',
    tier_free_cut: '85% Revenue Share',
    tier_free_desc: 'Perfect for creators starting out with script sharing and community downloads.',
    tier_pro_title: 'Pro Developer',
    tier_pro_cut: '92% Revenue Share',
    tier_pro_desc: 'For YouTube creators, established scripthubs, and active communities.',
    tier_ent_title: 'Network / Enterprise',
    tier_ent_cut: '96% Revenue Share',
    tier_ent_desc: 'For large networks, high-traffic portals, and enterprise distributors.',

    // FAQ
    faq_tag: 'FAQ',
    faq_title: 'Frequently Asked Questions',
    faq_desc: 'Everything you need to know about security, payouts, and our bypass protection.',
    faq_q1: 'How does BlackPass prevent Tampermonkey & Bypass extensions?',
    faq_a1: 'Our system never leaks the final destination link inside HTML or client scripts. Destination links are securely stored in the backend and released only after the browser proves a verified time-stamped token signed with cryptographic integrity.',
    faq_q2: 'What payment methods are supported for withdrawals?',
    faq_a2: 'We support TrueMoney Wallet, PromptPay, PayPal, Bank Transfer, and Crypto (USDT TRC20 / Polygon) with a minimal $5.00 cashout threshold.',
    faq_q3: 'Can I lock direct scripts or keys without an external link?',
    faq_a3: 'Yes! In addition to URLs, BlackPass supports Raw Lua Script and Access Key lockers. The unlocked state displays a one-click copy box directly to your user.',

    // Footer
    footer_tagline: 'Monetize Every Click &mdash; High-yield access gates & content lockers.',
    footer_rights: '&copy; 2026 BlackPass Systems Inc. All rights reserved.',

    // Dashboard Sidebar & Topbar
    menu_main: 'Main Menu',
    menu_finances: 'Finances',
    menu_system: 'System',
    menu_overview: 'Overview',
    menu_lockers: 'My Lockers',
    menu_analytics: 'Analytics',
    menu_payouts: 'Payouts & Wallet',
    menu_rates: 'Payout Rates (CPM)',
    menu_settings: 'Settings & API',
    topbar_available: 'Available:',
    btn_create_locker: 'Create Locker',

    // Metric Cards
    card_clicks: 'Total Clicks',
    card_offers: 'Completed Offers',
    card_unlocks: 'Content Unlocks',
    card_revenue: 'Net Revenue',
    card_conversion: 'Conversion Rate',
    trend_clicks: '0% this week',
    trend_offers: '0% this week',
    trend_unlocks: '0% vs last 7d',
    trend_revenue: 'Awaiting traffic',
    trend_conversion: 'No data yet',

    // Chart
    chart_title: 'Weekly Performance Telemetry',
    chart_desc: 'Daily clicks vs completed unlocks across your active link gates.',
    chart_tab_clicks: 'Clicks',
    chart_tab_unlocks: 'Unlocks',
    chart_tab_revenue: 'Revenue ($)',
    chart_empty_note: 'No traffic activity recorded yet (Ready to capture link clicks)',

    // Table
    table_title: 'Active Content Lockers',
    table_search_placeholder: 'Search locker name or slug...',
    th_locker: 'Locker / Slug',
    th_dest: 'Destination Target',
    th_config: 'Config',
    th_clicks_unlocks: 'Clicks / Unlocks',
    th_revenue: 'Revenue ($)',
    th_status: 'Status',
    th_actions: 'Actions',
    status_active: 'Active',
    status_paused: 'Paused',
    btn_copy_link: 'Copy Link',
    btn_delete_locker: 'Delete',

    // Analytics Deep Dive
    analytics_geo_title: 'Traffic by Geography (Top 5)',
    geo_no_data: 'No country breakdown data yet. Telemetry resolves automatically on user visits.',
    analytics_device_title: 'Device Split',
    analytics_device_mobile: 'Mobile Devices (Android / iOS)',
    analytics_device_mobile_sub: 'Roblox Mobile, Delta & Fluxus players',
    analytics_device_pc: 'Desktop (Windows / Mac)',
    analytics_device_pc_sub: 'PC Executors & Scripthubs',
    analytics_daily_title: 'Daily Conversion Breakdown (Last 7 Days)',
    table_no_data: 'No daily telemetry recorded yet. Live traffic will appear here as users engage.',
    th_date: 'Date',
    th_raw_clicks: 'Raw Clicks',
    th_unique_visitors: 'Unique Visitors',
    th_completed_tasks: 'Completed Tasks',
    th_unlock_rate: 'Unlock Rate',
    th_avg_cpm: 'Avg CPM',
    th_net_earnings: 'Net Earnings',

    // Payouts View
    payout_active_balance: 'Active Balance',
    payout_ready_desc: 'Minimum threshold not reached yet (< $5.00)',
    payout_dest_label: 'Withdrawal Destination',
    payout_account_label: 'Account Number / Phone / Wallet Address',
    payout_btn_submit: 'Insufficient balance to cash out ($0.00)',
    payout_policy_title: 'Payout Policy & Security',
    payout_policy_1_title: 'Instant Local Processing:',
    payout_policy_1_desc: 'TrueMoney Wallet & PromptPay payouts process within 10-30 minutes.',
    payout_policy_2_title: 'Zero Hidden Fees:',
    payout_policy_2_desc: 'BlackPass absorbs network gas and processing fees for Pro publishers.',
    payout_policy_3_title: 'Fraud Guard:',
    payout_policy_3_desc: 'Traffic verified against Adsterra & Cloudflare bot-score databases before release.',
    payout_recent_title: 'Recent Payout Transactions',
    table_no_payouts: 'No payout transactions recorded yet.',
    th_txn_id: 'Transaction ID',
    th_txn_date: 'Requested Date',
    th_txn_dest: 'Destination',
    th_txn_usd: 'Amount ($)',
    th_txn_thb: 'Amount (THB)',
    th_txn_status: 'Status',
    txn_status_completed: 'Completed',
    txn_status_processing: 'Processing',

    // Settings View
    settings_profile_title: 'Publisher Profile',
    settings_profile_desc: 'Your public publisher profile and revshare tier information.',
    settings_label_user: 'Username',
    settings_label_email: 'Email Address',
    settings_label_tier: 'RevShare Tier',
    settings_domain_title: 'Custom Domain Integration',
    settings_domain_desc: 'Use your own custom branding or domain to bypass adblockers.',
    settings_label_domain: 'Custom Domain (FQDN)',
    settings_cname_hint: 'Point CNAME record to: <code>cname.blackpass.link</code>',
    settings_btn_save_domain: 'Save Domain Config',
    settings_api_title: 'API & Webhooks',
    settings_api_desc: 'Connect your Discord bot or web service to BlackPass programmatically.',
    settings_label_apikey: 'Live API Secret Key',
    settings_label_webhook: 'Unlock Webhook Postback URL',
    settings_webhook_hint: 'Sends signed JSON payload when a user successfully finishes all tasks.',
    settings_btn_save_api: 'Update API Config',

    // Ad Network & Monetization Settings
    settings_ads_title: 'Ad Networks & Monetization Engine',
    settings_ads_desc: 'Connect your Smartlink / Direct Link or script tags (Adsterra, Monetag) to receive 100% of ad revenue.',
    settings_ads_network_label: 'Primary Ad Network',
    settings_ads_smartlink_label: 'Global Direct Link / Smartlink URL (Top Recommended)',
    settings_ads_smartlink_placeholder: 'https://www.profitablecpmrate.com/xxxxx or https://otergroo.net/...',
    settings_ads_smartlink_hint: 'When a visitor clicks to complete tasks or clicks Continue, this smartlink triggers CPM earnings directly to your account.',
    settings_ads_popunder_label: 'Popunder Ad Script / URL (Optional)',
    settings_ads_popunder_placeholder: 'Paste your <script> tag or popunder script URL',
    settings_ads_popunder_hint: 'Background popunder triggers when the visitor interacts with the locker.',
    settings_ads_banner_label: 'Native Banner HTML / Script (Sponsor Slot)',
    settings_ads_banner_placeholder: 'Paste 300x250 or responsive banner code here',
    settings_ads_banner_hint: 'Injected into the official sponsor placement slot on the locker page.',
    settings_ads_split_title: '3-Step Stacking Strategy (3x Revenue Multiplier)',
    settings_ads_split_desc: 'Assign separate networks to each step to prevent duplicate IP penalties and capture 100% full CPM across all 3 steps.',
    settings_ads_step1_label: 'Step 1 (Recommended: PopAds — Withdraw Anytime)',
    settings_ads_step1_placeholder: 'https://... PopAds or Step 1 link',
    settings_ads_step2_label: 'Step 2 (Recommended: Adsterra — Highest CPM)',
    settings_ads_step2_placeholder: 'https://... Adsterra Smartlink for Step 2',
    settings_ads_step3_label: 'Step 3 (Recommended: Monetag — Fast & Reliable)',
    settings_ads_step3_placeholder: 'https://... Monetag Smartlink for Step 3',
    settings_btn_save_ads: 'Save Ad Network Config',

    settings_danger_title: 'System Data Reset',
    settings_danger_desc: 'Reset all local stats, balances, and locker items to clean 0.',
    btn_reset_data: 'Reset All Platform Data',
    reset_confirm_msg: 'Are you sure you want to reset all platform data to completely empty (0)?',
    reset_success_msg: 'All platform data reset to blank successfully!',

    // Create Locker Modal
    modal_create_title: 'Create Content Locker',
    modal_name_label: 'Locker Name *',
    modal_name_placeholder: 'e.g. Blox Fruits Autofarm Script v4.9',
    modal_name_hint: 'Displayed to your visitors on the access gate title.',
    modal_dest_label: 'Destination URL / Content *',
    modal_dest_placeholder: 'https://pastebin.com/raw/...',
    modal_dest_hint: 'The target script, key, or download file released after completion.',
    modal_smartlink_label: 'Custom Smartlink for this Locker (Optional)',
    modal_smartlink_placeholder: 'Leave blank to use global Smartlink from Settings',
    modal_smartlink_hint: 'Overrides the global smartlink when visitors complete this specific locker.',
    modal_slug_label: 'Custom Slug (Short URL)',
    modal_slug_placeholder: 'blox-fruits-v49',
    modal_steps_label: 'Gate Step Count',
    modal_step_1: '1 Step (Quick Unlock)',
    modal_step_2: '2 Steps (Balanced Revenue)',
    modal_step_3: '3 Steps (Maximum Profit)',
    modal_timer_label: 'Countdown Duration per Step',
    modal_timer_5: '5 Seconds (Very Fast)',
    modal_timer_8: '8 Seconds (Recommended)',
    modal_timer_10: '10 Seconds (Standard)',
    modal_timer_15: '15 Seconds (High Ad Exposure)',
    modal_ad_settings: 'Ad Placements & Yield Engine',
    modal_popunder_title: 'Popunder Ad',
    modal_popunder_desc: 'High-CPM 1st click',
    modal_banner_title: 'Native Banner',
    modal_banner_desc: 'Impression reward',
    modal_antibypass_title: 'Anti-Bypass Shield',
    modal_antibypass_desc: 'Block inspect element & bypass extensions',
    modal_btn_cancel: 'Cancel',
    modal_btn_deploy: 'Deploy Locker',

    // Delete Modal
    modal_delete_title: 'Delete Locker?',
    modal_delete_desc: 'Are you sure you want to permanently delete this content locker? Any user clicking this link in Discord or YouTube will no longer be able to unlock the content.',
    modal_btn_confirm_delete: 'Delete Locker',

    // Locker Page
    locker_brand_badge: 'BlackPass Verification',
    locker_default_title: 'Content Access Restricted',
    locker_default_desc: 'Complete the required steps below to verify your session and unlock your destination.',
    locker_progress_label: 'PROGRESS',
    locker_step_text: 'Completed {current} of {total} Buttons ({percent}%)',
    locker_task_1_title: 'Button 1: Primary Sponsor (30s)',
    locker_task_1_desc: 'Click to open sponsor ad and dwell for 30 seconds',
    locker_task_2_title: 'Button 2: Security Partner (30s)',
    locker_task_2_desc: 'Click to open sponsor ad and dwell for 30 seconds',
    locker_task_3_title: 'Button 3: 24h Hub Access Pass (30s)',
    locker_task_3_desc: 'Click to open final sponsor ad and dwell for 30 seconds',
    locker_task_pending: 'Pending',
    locker_task_active: 'In Progress',
    locker_task_done: 'Completed',
    locker_sponsor_badge: 'SPONSORED VERIFICATION PARTNER',
    locker_wait: 'Please wait {sec} seconds...',
    locker_continue: 'Continue to Next Step',
    locker_unlock_btn: 'Unlock Content Now',
    locker_vip_btn: 'VIP Key?',
    locker_footer_shield: 'Protected by Anti-Bypass v2.4',
    locker_btn_open_ad: '👉 Click to Open Sponsor Ad (Button {step}/{total})',
    locker_btn_dwelling: '⏳ Viewing Sponsor Ad... {sec}s left',
    locker_btn_return_too_soon: '⚠️ Stay on sponsor page for {sec}s (Click to return)',
    locker_btn_step_passed: '✅ Button {step} Verified! Proceed to Button {next} ➔',
    locker_btn_all_passed: '🎉 All 3 Buttons Complete! Click to Unlock 🔓',
    locker_instruction_dwell: '⚠️ Unlock Rule: Complete all 3 buttons by staying on each sponsor ad for 30 seconds to unlock the website.',
    locker_task_status_waiting: 'Waiting to Open',
    locker_task_status_dwelling: 'Viewing Ad ({sec}s)',
    locker_toast_early_return: '⚠️ You returned before 30s! ({sec}s remaining). Please stay on the sponsor page to unlock.',
    locker_action_ready: '👉 Start (30s)',
    locker_action_dwelling: '⏳ {sec}s left',
    locker_action_paused: '⏸️ Paused ({sec}s left)',
    locker_action_done: '✅ Done',
    locker_action_locked: '🔒 Locked',
    locker_desc_paused: '⚠️ Timer paused! Click to switch to ad for {sec}s more',
    locker_bottom_waiting: '🔒 Complete all 3 buttons ({done}/3 done)',
    locker_bottom_unlock: '🎉 All 3 Buttons Done! Click to Unlock 🔓',

    // Unlocked Success Page
    unlocked_title: 'Content Unlocked!',
    unlocked_desc: 'Your access has been verified successfully. Your device is remembered for 24 hours.',
    unlocked_access_btn: 'Access Content Now',
    unlocked_copy_btn: 'Copy Destination Link',
    unlocked_redirect_text: 'Auto-redirecting in {sec} seconds...',

    // VIP Modal
    vip_modal_title: 'VIP Instant Bypass',
    vip_modal_desc: 'If you have purchased a VIP role in Discord (30 Baht permanent) or hold an access bypass key, enter it below to skip all verification tasks immediately.',
    vip_input_label: 'VIP License Key',
    vip_input_placeholder: 'e.g. VIP-PASS-2026',
    vip_hint: 'Tip: Enter <code>VIP30</code> to test instant bypass.',
    vip_redeem_btn: 'Redeem & Unlock',

    // Auth
    auth_signin_title: 'Sign In to BlackPass',
    auth_signup_title: 'Create Publisher Account',
    auth_forgot_title: 'Reset Password',
    auth_tab_signin: 'Sign In',
    auth_tab_signup: 'Create Account',
    auth_label_username: 'Publisher Username',
    auth_label_email: 'Email Address',
    auth_label_pass: 'Password',
    auth_label_pass_min: 'Password (Min. 6 chars)',
    auth_btn_signin: 'Sign In to Dashboard',
    auth_btn_signup: 'Create Publisher Account',
    auth_btn_forgot: 'Forgot Password?',
    auth_btn_send_reset: 'Send Reset Password Link',
    auth_forgot_desc: 'Enter your registered email address and we will immediately send a password reset link to your email inbox.',
    auth_back_to_login: 'Back to Sign In'
  }
};

let currentAppLanguage = localStorage.getItem('blackpass_lang') || 'th';

function getI18nText(key, fallback = '') {
  const dict = I18N_DICTIONARY[currentAppLanguage] || I18N_DICTIONARY.th;
  return dict[key] || fallback || key;
}

function setAppLanguage(lang) {
  if (lang !== 'th' && lang !== 'en') lang = 'th';
  currentAppLanguage = lang;
  localStorage.setItem('blackpass_lang', lang);

  // Apply to DOM
  applyI18nToDOM();

  // Notify listeners
  if (window.onLanguageChanged && typeof window.onLanguageChanged === 'function') {
    window.onLanguageChanged(lang);
  }
}

function applyI18nToDOM() {
  const dict = I18N_DICTIONARY[currentAppLanguage] || I18N_DICTIONARY.th;

  // Set HTML lang attribute
  if (document.documentElement) {
    document.documentElement.setAttribute('lang', currentAppLanguage);
  }

  // Elements with data-i18n
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (dict[key]) {
      el.innerHTML = dict[key];
    }
  });

  // Placeholders with data-i18n-placeholder
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (dict[key]) {
      el.setAttribute('placeholder', dict[key]);
    }
  });

  // Highlight active language button
  document.querySelectorAll('.lang-btn').forEach(btn => {
    if (btn.dataset.lang === currentAppLanguage) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

// Auto-run on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    applyI18nToDOM();
  });
} else {
  applyI18nToDOM();
}

window.I18N_DICTIONARY = I18N_DICTIONARY;
window.getI18nText = getI18nText;
window.setAppLanguage = setAppLanguage;
window.applyI18nToDOM = applyI18nToDOM;
