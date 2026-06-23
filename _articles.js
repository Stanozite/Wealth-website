/* ============================================================
   Wealth Compass · article registry (single source of truth)
   Powers blog.html index + related-article widgets + homepage.

   DUAL-MODE: the baked-in ARTICLES below always work (static
   fallback). If Supabase is configured (_brand.js + _supabase.js
   loaded before this file), published rows from the `articles`
   table are merged in automatically:
     - DB row with same slug as a static article → overrides its
       card fields (title/desc/thumb/emoji/readMin)
     - DB row with a new slug → appears as a new article, served
       by article.html?slug=<slug>
   Any card list rendered via WC_articles.render() re-renders
   automatically when DB data arrives · pages need no extra code.
   ============================================================ */
(function () {
  'use strict';

  var PILLARS = {
    foundation: { th: 'รากฐาน', en: 'Foundation', badge: 'green' },
    debt:       { th: 'หนี้สิน', en: 'Debt', badge: 'red' },
    invest:     { th: 'ลงทุน', en: 'Invest', badge: 'blue' },
    tax:        { th: 'ภาษี', en: 'Tax', badge: 'amber' },
    protect:    { th: 'ปกป้อง', en: 'Protect', badge: 'green' },
    retire:     { th: 'เกษียณ', en: 'Retire', badge: 'violet' }
  };

  /* static articles · slug = real .html file, thumb = local SVG art */
  var STATIC_ARTICLES = [
    {
      slug: 'fire-movement-thailand.html',
      pillar: 'retire', emoji: '🔥', date: '2026-06-12', readMin: 8,
      thumb: 'thumbs/fire-movement-thailand.svg',
      title: { th: 'FIRE คืออะไร? เกษียณก่อน 40 ในไทยทำได้จริงไหม', en: 'What is FIRE? Early retirement in Thailand, realistically' },
      desc: { th: 'ขบวนการ FIRE เกษียณเร็วด้วยเลข 25 เท่า อัตราออม 50%+ ทำได้จริงแค่ไหนในบริบทไทย พร้อมตัวอย่างคำนวณ', en: 'The FIRE movement, the 25x number and 50%+ savings rates · how realistic is it in Thailand?' },
      tool: 'retirement-simulator.html'
    },
    {
      slug: 'social-security-pension.html',
      pillar: 'retire', emoji: '🏛️', date: '2026-06-12', readMin: 8,
      thumb: 'thumbs/social-security-pension.svg',
      title: { th: 'ประกันสังคม ม.33 ได้บำนาญเท่าไหร่? คำนวณเงินชราภาพให้ดูชัดๆ', en: 'Thai social security pension: how much will you actually get?' },
      desc: { th: 'สูตรคำนวณบำนาญชราภาพประกันสังคม มาตรา 33/39 ได้เดือนละเท่าไหร่ พอใช้ไหม และต้องเติมอีกแค่ไหน', en: 'The Thai SSO pension formula, what it pays monthly, and the gap you need to fill yourself.' },
      tool: 'retirement-simulator.html'
    },
    {
      slug: 'dca-how-to-start.html',
      pillar: 'invest', emoji: '🗓️', date: '2026-06-12', readMin: 7,
      thumb: 'thumbs/dca-how-to-start.svg',
      title: { th: 'DCA คืออะไร? เริ่มลงทุนรายเดือนฉบับมือใหม่ (พิสูจน์ด้วยตัวเลข)', en: 'What is DCA? Monthly investing for beginners, proven with numbers' },
      desc: { th: 'DCA ตัดอารมณ์ออกจากการลงทุนยังไง เทียบ DCA vs ลงก้อนเดียว vs จับจังหวะตลาด พร้อมขั้นตอนเริ่มจริง', en: 'How dollar-cost averaging removes emotion · DCA vs lump sum vs market timing, with real steps.' },
      tool: 'compound-dca.html'
    },
    {
      slug: 'fund-fees-index-funds.html',
      pillar: 'invest', emoji: '🧮', date: '2026-06-12', readMin: 7,
      thumb: 'thumbs/fund-fees-index-funds.svg',
      title: { th: 'ค่าธรรมเนียมกองทุน 1.5% ไม่ใช่เรื่องเล็ก · Index Fund คือทางออก?', en: 'Fund fees of 1.5% are not small · are index funds the answer?' },
      desc: { th: 'เปิดวิธีอ่าน TER กองทุนรวมไทย ค่าธรรมเนียมกินผลตอบแทนทบต้นแค่ไหนใน 20 ปี และทำไมกองทุน index ถูกกว่า 5 เท่า', en: 'How to read Thai fund TERs, what fees compound to over 20 years, and why index funds cost 5x less.' },
      tool: 'compound-dca.html'
    },
    {
      slug: 'risk-profile-explained.html',
      pillar: 'invest', emoji: '🎯', date: '2026-06-12', readMin: 6,
      thumb: 'thumbs/risk-profile-explained.svg',
      title: { th: 'ก่อนซื้อกองทุน รู้จัก Risk Profile ของตัวเองหรือยัง?', en: 'Know your risk profile before you buy any fund' },
      desc: { th: 'ความเสี่ยง "รับได้" กับ "รับไหว" ต่างกันยังไง ทำไมพอร์ตที่ดีที่สุดคือพอร์ตที่คุณถือผ่านตลาดแดงได้', en: 'Risk willingness vs capacity · and why the best portfolio is the one you can hold through a crash.' },
      tool: 'risk-profile.html'
    },
    {
      slug: 'net-worth-why-it-matters.html',
      pillar: 'foundation', emoji: '🏛️', date: '2026-06-12', readMin: 6,
      thumb: 'thumbs/net-worth-why-it-matters.svg',
      title: { th: 'Net Worth คืออะไร? ตัวเลขเดียวที่บอกฐานะการเงินจริงของคุณ', en: 'Net worth: the one number that tells your true financial position' },
      desc: { th: 'รายได้สูงไม่ได้แปลว่ารวย · วิธีคำนวณความมั่งคั่งสุทธิ ตีมูลค่าทรัพย์สินแบบ realistic และเป้าตามช่วงอายุ', en: 'High income ≠ wealthy. How to compute net worth, value assets realistically, and age-based targets.' },
      tool: 'net-worth.html'
    },
    {
      slug: 'financial-health-check.html',
      pillar: 'foundation', emoji: '❤️', date: '2026-06-12', readMin: 6,
      thumb: 'thumbs/financial-health-check.svg',
      title: { th: 'เช็คสุขภาพการเงิน 8 ข้อ · คุณ "แข็งแรง" หรือแค่ "ยังไหว"?', en: 'The 8-point financial health check: thriving or just coping?' },
      desc: { th: 'กรอบ Spend/Save/Borrow/Plan ระดับสากล 8 ตัวชี้วัดที่บอกว่าการเงินคุณแข็งแรงจริงไหม พร้อมแบบทดสอบฟรี 3 นาที', en: 'The global Spend/Save/Borrow/Plan framework · 8 indicators of real financial health, free 3-minute test.' },
      tool: 'financial-health-score.html'
    },
    {
      slug: 'term-vs-whole-life.html',
      pillar: 'protect', emoji: '🛡️', date: '2026-06-12', readMin: 8,
      thumb: 'thumbs/term-vs-whole-life.svg',
      title: { th: 'ประกันชีวิต Term vs Whole Life ต่างกันยังไง ซื้อแบบไหนดี?', en: 'Term vs whole life insurance: which should you buy?' },
      desc: { th: 'เทียบประกันชีวิตแบบชั่วระยะเวลากับตลอดชีพ เบี้ยต่างกัน 10 เท่า ความคุ้มครองเท่ากัน · ใครเหมาะแบบไหน', en: 'Term costs 10x less for the same cover · who each type actually fits, without the sales pitch.' },
      tool: 'insurance-needs.html'
    },
    {
      slug: 'health-insurance-guide.html',
      pillar: 'protect', emoji: '🏥', date: '2026-06-12', readMin: 8,
      thumb: 'thumbs/health-insurance-guide.svg',
      title: { th: 'ประกันสุขภาพจำเป็นไหม? เลือกยังไงไม่ให้เบี้ยบานปลายทาง', en: 'Do you need health insurance in Thailand? How to choose well' },
      desc: { th: 'ค่ารักษาโรงพยาบาลเอกชนแพงแค่ไหน สิทธิที่มีอยู่แล้วครอบคลุมอะไร และวิธีเลือกแผนเหมาจ่ายไม่ให้จ่ายเกินจำเป็น', en: 'Private hospital costs, what your existing coverage already pays, and choosing a plan without overpaying.' },
      tool: 'insurance-needs.html'
    },
    {
      slug: 'income-tax-guide.html',
      pillar: 'tax', emoji: '📋', date: '2026-06-12', readMin: 9,
      thumb: 'thumbs/income-tax-guide.svg',
      title: { th: 'ภาษีเงินได้บุคคลธรรมดา 2567: วิธีคำนวณขั้นบันไดแบบเข้าใจใน 10 นาที', en: 'Thai personal income tax: the bracket system explained in 10 minutes' },
      desc: { th: 'เงินได้สุทธิคิดยังไง ขั้นบันไดภาษี 5-35% ทำงานแบบไหน และความเข้าใจผิดเรื่อง "ขึ้น bracket แล้วโดนทั้งก้อน"', en: 'How Thai taxable income works, the 5-35% ladder, and the bracket myth that costs people money.' },
      tool: 'tax-calculator.html'
    },
    {
      slug: 'rmf-vs-thaiesg.html',
      pillar: 'tax', emoji: '⚖️', date: '2026-06-12', readMin: 8,
      thumb: 'thumbs/rmf-vs-thaiesg.svg',
      title: { th: 'RMF vs ThaiESG ซื้ออะไรก่อน? เทียบชัดๆ เพดาน เงื่อนไข ระยะถือ', en: 'RMF vs ThaiESG: which to buy first? Caps, conditions, lock-ups' },
      desc: { th: 'กองทุนลดหย่อนภาษี 2 ตัวหลัก ต่างกันที่เพดาน ระยะถือครอง และเหมาะกับใคร พร้อมลำดับซื้อที่ฉลาดตามฐานภาษี', en: 'Thailand’s two main tax funds compared · caps, holding periods, and the smart buying order by tax bracket.' },
      tool: 'tax-deduction-optimizer.html'
    },
    {
      slug: 'refinance-home-loan.html',
      pillar: 'debt', emoji: '🏠', date: '2026-06-12', readMin: 8,
      thumb: 'thumbs/refinance-home-loan.svg',
      title: { th: 'รีไฟแนนซ์บ้านคุ้มไหม? วิธีคิดให้ขาดก่อนย้ายธนาคาร', en: 'Refinancing your Thai home loan: when it actually pays off' },
      desc: { th: 'ดอกเบี้ยลอยตัวหลังปี 3 แพงแค่ไหน ค่าใช้จ่ายรีไฟแนนซ์มีอะไรบ้าง และสูตรคุ้มทุนที่ตัดสินใจได้ใน 5 นาที', en: 'Post-teaser floating rates, the real costs of refinancing, and a 5-minute break-even formula.' },
      tool: 'debt-payoff.html'
    },
    {
      slug: 'retirement-how-much.html',
      pillar: 'retire', emoji: '🌅', date: '2026-06-11', readMin: 8,
      thumb: 'thumbs/retirement-how-much.svg',
      title: { th: 'เกษียณต้องมีเงินเท่าไหร่ถึงพอ? (สูตรคิดง่ายๆ + กฎ 4%)', en: 'How much do you need to retire? The 4% rule explained' },
      desc: { th: 'คำนวณเงินเกษียณที่ต้องมีจริง ด้วยกฎ 25 เท่าและกฎ 4% พร้อมตัวอย่างคนไทยและเครื่องมือจำลองฟรี', en: 'Work out your real retirement number with the 25x and 4% rules · with Thai examples and a free simulator.' },
      tool: 'retirement-simulator.html'
    },
    {
      slug: 'tax-deductions-2567.html',
      pillar: 'tax', emoji: '🧾', date: '2026-06-11', readMin: 10,
      thumb: 'thumbs/tax-deductions-2567.svg',
      title: { th: 'ลดหย่อนภาษี 2567 มีอะไรบ้าง? RMF SSF ThaiESG ประกัน ครบจบที่เดียว', en: 'Thai tax deductions 2024: RMF, SSF, ThaiESG and insurance' },
      desc: { th: 'รวมรายการลดหย่อนภาษีปี 2567 ทุกตัว เพดานเท่าไหร่ ซื้ออะไรก่อน พร้อมวิธีคำนวณเงินที่ประหยัดได้จริง', en: 'Every Thai 2024 tax deduction, its cap, what to buy first, and how much you actually save.' },
      tool: 'tax-deduction-optimizer.html'
    },
    {
      slug: 'how-much-to-save.html',
      pillar: 'foundation', emoji: '📊', date: '2026-06-11', readMin: 7,
      thumb: 'thumbs/how-much-to-save.svg',
      title: { th: 'เงินเดือน 30,000 / 50,000 ควรเก็บเท่าไหร่? แบ่งเงินยังไงให้เหลือ', en: 'How much should you save on a 30k/50k salary?' },
      desc: { th: 'สูตรแบ่งเงินเดือน 50/30/20 ปรับให้เข้ากับค่าครองชีพไทย เก็บเท่าไหร่ถึงพอ พร้อมตัวอย่างจริงทุกช่วงเงินเดือน', en: 'The 50/30/20 split adapted to Thai cost of living, with real examples for every salary band.' },
      tool: 'budget-planner.html'
    },
    {
      slug: 'emergency-fund-guide.html',
      pillar: 'foundation', emoji: '🛟', date: '2026-06-11', readMin: 6,
      thumb: 'thumbs/emergency-fund-guide.svg',
      title: { th: 'เงินสำรองฉุกเฉินควรมีเท่าไหร่? (3-6 เดือน เก็บที่ไหนดี)', en: 'How big should your emergency fund be?' },
      desc: { th: 'ทำไมต้องมีเงินสำรอง 3-6 เดือน ฟรีแลนซ์ต้องมีเท่าไหร่ เก็บที่ไหนให้สภาพคล่องดีและไม่หาย', en: 'Why 3-6 months, how much freelancers need, and where to park it for liquidity and safety.' },
      tool: 'emergency-fund.html'
    },
    {
      slug: 'compound-interest-power.html',
      pillar: 'invest', emoji: '📈', date: '2026-06-11', readMin: 7,
      thumb: 'thumbs/compound-interest-power.svg',
      title: { th: 'พลังดอกเบี้ยทบต้น: เริ่มเร็ว 5 ปี ปลายทางต่างกันล้าน', en: 'The power of compounding: why starting 5 years earlier matters' },
      desc: { th: 'ดอกเบี้ยทบต้นทำงานยังไง ทำไมเวลาสำคัญกว่าจำนวนเงิน และทำไมค่าธรรมเนียม 1% กินเงินคุณมหาศาล', en: 'How compounding works, why time beats amount, and why a 1% fee quietly costs a fortune.' },
      tool: 'compound-dca.html'
    },
    {
      slug: 'debt-snowball-avalanche.html',
      pillar: 'debt', emoji: '⛓️', date: '2026-06-11', readMin: 7,
      thumb: 'thumbs/debt-snowball-avalanche.svg',
      title: { th: 'ปลดหนี้บัตรเครดิตวิธีไหนดี? Snowball vs Avalanche', en: 'Snowball vs avalanche: the smartest way to pay off debt' },
      desc: { th: 'เทียบ 2 วิธีปลดหนี้ยอดนิยม วิธีไหนประหยัดดอกเบี้ย วิธีไหนชนะใจ และทำไมจ่ายขั้นต่ำคือกับดัก', en: 'Compare the two popular payoff methods, which saves more interest, and why minimum payments are a trap.' },
      tool: 'debt-payoff.html'
    }
  ];

  /* live list (starts static, may be replaced after DB load) */
  var LIST = STATIC_ARTICLES.slice();

  /* remember every render call so we can replay it when DB data lands */
  var RENDERED = [];

  function hrefFor(a) {
    if (a.dynamic) { return 'article.html?slug=' + encodeURIComponent(a.slug); }
    return a.slug;
  }

  function cardHTML(a, lang) {
    var p = PILLARS[a.pillar] || { th: '', en: '', badge: 'green' };
    var readTxt = lang === 'th' ? ('อ่าน ' + a.readMin + ' นาที') : (a.readMin + ' min read');
    var html = '<a class="tool-card article-card" href="' + hrefFor(a) + '">';
    html += '<div class="thumb">';
    /* emoji fallback layer · shows if thumb is missing or fails to load (onerror) */
    html += '<div class="thumb-fallback">' + (a.emoji || '📄') + '</div>';
    if (a.thumb) {
      html += '<img src="' + a.thumb + '" alt="" loading="lazy" onerror="this.style.display=\'none\'"/>';
    }
    html += '<span class="badge ' + p.badge + '"><span class="lang-th">' + p.th + '</span><span class="lang-en">' + p.en + '</span></span>';
    html += '</div>';
    html += '<div class="body">';
    html += '<h3>' + (lang === 'th' ? a.title.th : (a.title.en || a.title.th)) + '</h3>';
    html += '<p>' + (lang === 'th' ? a.desc.th : (a.desc.en || a.desc.th)) + '</p>';
    html += '<div style="font-size:12.5px;color:var(--muted);font-weight:600;">' + readTxt + '</div>';
    html += '<span class="link"><span class="lang-th">อ่านต่อ</span><span class="lang-en">Read</span> →</span>';
    html += '</div></a>';
    return html;
  }

  function doRender(targetSel, opts) {
    opts = opts || {};
    var host = document.querySelector(targetSel);
    if (!host) { return; }
    var lang = (window.WC && window.WC.getLang) ? window.WC.getLang() : 'th';
    var list = LIST.filter(function (a) { return a.slug !== opts.exclude; });
    if (opts.filterPillar && opts.filterPillar !== 'all') {
      list = list.filter(function (a) { return a.pillar === opts.filterPillar; });
    }
    if (opts.pillar) {
      var same = list.filter(function (a) { return a.pillar === opts.pillar; });
      var rest = list.filter(function (a) { return a.pillar !== opts.pillar; });
      list = same.concat(rest);
    }
    if (opts.limit) { list = list.slice(0, opts.limit); }
    var html = '';
    for (var i = 0; i < list.length; i++) { html += cardHTML(list[i], lang); }
    host.innerHTML = html;
  }

  function rerenderAll() {
    for (var i = 0; i < RENDERED.length; i++) {
      doRender(RENDERED[i].sel, RENDERED[i].opts);
    }
  }

  /* escape text coming from the DB before it enters card innerHTML */
  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function mergeDb(rows) {
    if (!rows || !rows.length) { return; }
    var bySlug = {};
    var i;
    for (i = 0; i < STATIC_ARTICLES.length; i++) {
      bySlug[STATIC_ARTICLES[i].slug.replace('.html', '')] = STATIC_ARTICLES[i];
    }
    var merged = STATIC_ARTICLES.slice();
    for (i = 0; i < rows.length; i++) {
      var r = rows[i];
      var key = String(r.slug || '').replace('.html', '');
      var entry = {
        slug: key,
        dynamic: true,
        pillar: PILLARS[r.pillar] ? r.pillar : 'foundation',
        emoji: esc(r.emoji || '📄'),
        date: (r.created_at || '').slice(0, 10),
        readMin: r.read_min || 7,
        thumb: r.thumb_url ? esc(r.thumb_url) : null,
        title: { th: esc(r.title_th), en: esc(r.title_en) },
        desc: { th: esc(r.desc_th), en: esc(r.desc_en) },
        tool: r.tool_slug || null
      };
      var existing = bySlug[key];
      if (existing) {
        /* DB overrides the static card's display fields; keep static href */
        existing.title = entry.title;
        existing.desc = entry.desc;
        existing.emoji = entry.emoji;
        existing.readMin = entry.readMin;
        if (entry.thumb) { existing.thumb = entry.thumb; }
      } else {
        merged.unshift(entry); /* new DB articles first (newest content) */
      }
    }
    LIST = merged;
    rerenderAll();
    try { window.dispatchEvent(new CustomEvent('wc:articles')); } catch (e) {}
  }

  /* try DB once per page load */
  function loadDb() {
    if (window.WC_DB && window.WC_DB.configured && window.WC_DB.configured()) {
      window.WC_DB.articles.listPublished().then(mergeDb);
    }
  }

  window.ARTICLES = LIST; /* legacy reference (blog.html uses WC_articles.list() below) */
  window.ARTICLE_PILLARS = PILLARS;

  window.WC_articles = {
    list: function () { return LIST.slice(); },
    pillars: PILLARS,
    hrefFor: hrefFor,
    render: function (targetSel, opts) {
      /* register for auto re-render on lang change + DB arrival */
      var known = false;
      for (var i = 0; i < RENDERED.length; i++) {
        if (RENDERED[i].sel === targetSel) { RENDERED[i].opts = opts; known = true; }
      }
      if (!known) { RENDERED.push({ sel: targetSel, opts: opts }); }
      doRender(targetSel, opts);
    }
  };

  window.addEventListener('wc:lang', rerenderAll);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadDb);
  } else { loadDb(); }
})();
