/* ============================================================
   Wealth Compass · article registry (single source of truth)
   Powers blog.html hub + related-article widgets + homepage.

   DUAL-MODE: the baked-in ARTICLES below always work (static
   fallback). If Supabase is configured (_brand.js + _supabase.js
   loaded before this file), published rows from the `articles`
   table are merged in automatically:
     - DB row with same slug as a static article -> overrides its
       card fields (title/desc/thumb/emoji/readMin/tags/series...)
     - DB row with a new slug -> appears as a new article, served
       by article.html?slug=<slug>
   Any card list rendered via WC_articles.render() re-renders
   automatically when DB data arrives.

   Learning-hub fields (all optional except the originals):
     tags:     ['behavior','henry']   -> tag cloud + recommend score
     series:   {id:'foundations', order:2}
     featured: true
     related:  ['net-worth.html', ...]  editorial "read next" override
   Compatibility: var + string concat only.
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

  /* closed tag taxonomy · th/en labels for the tag cloud.
     Keep editor-controlled (no free typing) so recommend scoring stays clean. */
  var TAGS = {
    behavior:        { th: 'พฤติกรรมเงิน', en: 'Behavior' },
    henry:           { th: 'รายได้สูงยังไม่รวย', en: 'HENRY' },
    psychology:      { th: 'จิตวิทยาลงทุน', en: 'Psychology' },
    framework:       { th: 'กรอบตัดสินใจ', en: 'Framework' },
    cashflow:        { th: 'กระแสเงินสด', en: 'Cash flow' },
    budgeting:       { th: 'จัดงบ', en: 'Budgeting' },
    'investing-start': { th: 'เริ่มลงทุน', en: 'Start investing' },
    timing:          { th: 'จังหวะเวลา', en: 'Timing' },
    portfolio:       { th: 'จัดพอร์ต', en: 'Portfolio' },
    risk:            { th: 'ความเสี่ยง', en: 'Risk' },
    compounding:     { th: 'ทบต้น', en: 'Compounding' },
    funds:           { th: 'กองทุน', en: 'Funds' },
    retirement:      { th: 'เกษียณ', en: 'Retirement' },
    sequence:        { th: 'ลำดับผลตอบแทน', en: 'Sequence risk' },
    inflation:       { th: 'เงินเฟ้อ', en: 'Inflation' },
    tax:             { th: 'ภาษี', en: 'Tax' },
    deductions:      { th: 'ลดหย่อน', en: 'Deductions' },
    insurance:       { th: 'ประกัน', en: 'Insurance' },
    protection:      { th: 'คุ้มครอง', en: 'Protection' },
    debt:            { th: 'หนี้', en: 'Debt' },
    networth:        { th: 'ความมั่งคั่งสุทธิ', en: 'Net worth' },
    fire:            { th: 'FIRE', en: 'FIRE' }
  };

  /* reading paths · order = slug list (with .html); level for the "learning" feel */
  var SERIES = {
    foundations: {
      th: 'รากฐานก่อนรวย', en: 'Foundations first', level: 'พื้นฐาน',
      order: ['net-worth-why-it-matters.html', 'lifestyle-inflation-save-your-raise.html', 'bonus-what-to-do-first.html', 'how-much-to-save.html', 'emergency-fund-guide.html']
    },
    'invest-psych': {
      th: 'จิตวิทยาการลงทุน', en: 'The investor mindset', level: 'กลาง',
      order: ['risk-profile-explained.html', 'checking-portfolio-too-often.html', 'portfolio-by-function.html']
    },
    'retire-survive': {
      th: 'เกษียณให้รอด', en: 'Retire and stay retired', level: 'กลาง',
      order: ['retirement-how-much.html', 'sequence-of-returns-risk.html', 'real-inflation-vs-cpi.html', 'fire-movement-thailand.html']
    }
  };

  /* "เริ่มต้นที่นี่" on-ramp for first-time readers */
  var START_HERE = ['financial-health-check.html', 'net-worth-why-it-matters.html'];

  /* static articles · slug = real .html file, thumb = local SVG art */
  var STATIC_ARTICLES = [
    {
      slug: 'inflation-erodes-cash.html',
      pillar: 'invest', emoji: '💸', date: '2026-07-05', readMin: 6,
      thumb: 'thumbs/inflation-erodes-cash.svg',
      title: { th: 'เงินสดไม่ใช่ที่ปลอดภัยเสมอไป — เงินเฟ้อกินเงินคุณเงียบ ๆ ทุกปี', en: 'Cash isn\'t always safe — inflation quietly eats it every year' },
      desc: { th: 'เงินสดดูปลอดภัยเพราะตัวเลขในบัญชีไม่ลด แต่ "อำนาจซื้อ" ลดลงทุกปีตามเงินเฟ้อ — ฿1 ล้านวันนี้ อีก 30 ปีที่เงินเฟ้อ 3% ซื้อของได้เท่าราว ฿4 แสน นี่คือภาษีเงียบของคนถือเงินสดล้วน', en: 'Cash looks safe because the number never drops — but its purchasing power falls every year with inflation. ฿1M today buys about ฿410k in 30 years at 3% inflation: the silent tax on holding only cash.' },
      tool: 'compound-dca.html',
      tags: ['inflation', 'framework', 'compounding'],
      related: ['real-inflation-vs-cpi.html', 'growth-of-one-baht.html', 'risk-of-ruin.html']
    },
    {
      slug: 'odds-of-a-green-year.html',
      pillar: 'invest', emoji: '🟢', date: '2026-07-05', readMin: 6,
      thumb: 'thumbs/odds-of-a-green-year.svg',
      title: { th: 'ยิ่งถือนาน โอกาสได้ปีบวกยิ่งสูง — เวลาอยู่ข้างนักลงทุน', en: 'The longer you hold, the better your odds of a positive return' },
      desc: { th: 'ในกรอบ 1 ปี ตลาดขึ้นหรือลงเกือบเหมือนโยนเหรียญ แต่พอยืดเป็น 5–10–20 ปี สัดส่วนช่วงที่ได้ผลตอบแทนบวกเข้าใกล้เกือบ 100% เวลาไม่การันตีกำไร แต่เปลี่ยนเกมจากพนันเป็นความน่าจะเป็นที่เข้าข้างคุณ', en: 'Over one year the market is nearly a coin flip; over 5–10–20 years the share of positive periods approaches ~100%. Time doesn\'t guarantee gains, but it tilts the odds in your favor.' },
      tool: 'risk-profile.html',
      tags: ['timing', 'risk', 'framework'],
      related: ['time-shrinks-the-range.html', 'missing-the-best-days.html', 'markets-that-went-to-zero.html']
    },
    {
      slug: 'luck-vs-skill.html',
      pillar: 'invest', emoji: '🍀', date: '2026-07-05', readMin: 7,
      thumb: 'thumbs/luck-vs-skill.svg',
      title: { th: 'โชคหรือฝีมือ? ยิ่งกิจกรรมมีโชคมาก ผลงานดี ๆ ยิ่งหลอกตา', en: 'Luck or skill? The more luck involved, the more a good record can fool you' },
      desc: { th: 'กรอบคิดของ Michael Mauboussin — ทุกกิจกรรมอยู่บนสเปกตรัมโชค↔ฝีมือ การลงทุนระยะสั้นมีโชคปนสูง คนกำไรงามปีนี้อาจแค่โชค ไม่ใช่เก่ง บทเรียนคือดู "กระบวนการ" ไม่ใช่ผลลัพธ์ครั้งเดียว', en: 'Michael Mauboussin\'s framework: every activity sits on a luck↔skill spectrum, and short-term investing is heavy on luck — this year\'s big winner may just be lucky, not skilled. Judge the process, not one outcome.' },
      tool: 'risk-profile.html',
      tags: ['psychology', 'framework', 'behavior'],
      related: ['most-active-funds-lose.html', 'tails-drive-everything.html', 'the-behavior-gap.html']
    },
    {
      slug: 'risk-of-ruin.html',
      pillar: 'invest', emoji: '⚠️', date: '2026-07-05', readMin: 7,
      thumb: 'thumbs/risk-of-ruin.svg',
      title: { th: 'ทำไมห้าม all-in — คณิตของการอยู่รอด', en: 'Why you never bet it all — the math of survival' },
      desc: { th: 'การทบต้นต้องการ "การอยู่รอด" ก่อนเสมอ ขาดทุน −100% ครั้งเดียวจบเกมถาวร ไม่ว่าก่อนหน้าจะกำไรแค่ไหน พอร์ตที่โตช้าแต่ไม่เคยแตะศูนย์ ชนะพอร์ตที่โตเร็วแต่มีโอกาสล้างพอร์ต', en: 'Compounding needs survival first — one −100% loss ends the game permanently, no matter the gains before it. A slow portfolio that never hits zero beats a fast one that can be wiped out.' },
      tool: 'risk-profile.html',
      tags: ['risk', 'framework', 'portfolio'],
      related: ['loss-recovery-math.html', 'tails-drive-everything.html', 'volatility-is-the-fee.html']
    },
    {
      slug: 'bears-are-regular.html',
      pillar: 'invest', emoji: '🐻', date: '2026-07-05', readMin: 7,
      thumb: 'thumbs/bears-are-regular.svg',
      title: { th: 'ตลาดหมีมาเป็นประจำ — ไม่ใช่ความผิดปกติ แต่คือค่าผ่านประตู', en: 'Bear markets are regular — not an anomaly, but the price of admission' },
      desc: { th: 'ตลอดกว่าศตวรรษ ตลาดหมี (ตกจากจุดสูงสุด ≥20%) เกิดซ้ำ ๆ ทุกไม่กี่ปี เป็นส่วนหนึ่งของวัฏจักรปกติ คนที่มองมันเป็นเหตุพิเศษที่ต้องหนีมักขายผิดจังหวะ คนที่รู้ว่ามัน "จะมาแน่" จะเตรียมใจและอยู่รอด', en: 'Over a century, bear markets (a ≥20% fall from the peak) recur every few years — part of the normal cycle. Those who treat them as emergencies sell at the wrong time; those who expect them survive.' },
      tool: 'risk-profile.html',
      tags: ['risk', 'behavior', 'framework'],
      related: ['missing-the-best-days.html', 'volatility-is-the-fee.html', 'the-emotional-cycle.html']
    },
    {
      slug: 'growth-of-one-baht.html',
      pillar: 'invest', emoji: '🌳', date: '2026-07-05', readMin: 6,
      thumb: 'thumbs/growth-of-one-baht.svg',
      title: { th: 'พลังของการทบต้น: ฿1 ที่ 7% ต่อปี 100 ปี กลายเป็นเกือบ ฿868', en: 'The power of compounding: ฿1 at 7% a year for 100 years ≈ ฿868' },
      desc: { th: 'การทบต้นดูช้าจนน่าเบื่อช่วงต้น แต่ปลายทางระเบิด — เกือบทั้งหมดของการเติบโตกระจุกช่วงท้าย นี่คือเหตุผลที่ "เวลา" คือวัตถุดิบทรงพลังที่สุด และทำไมเริ่มเร็วชนะเริ่มด้วยเงินเยอะ (ภาพประกอบที่ 7% ก่อนหักเงินเฟ้อ)', en: 'Compounding looks boringly slow early, then explodes — almost all the growth clusters at the end. Why time is the most powerful input, and why starting early beats starting big (illustrative 7%, before inflation).' },
      tool: 'compound-dca.html',
      tags: ['compounding', 'timing', 'framework'],
      related: ['compound-interest-power.html', 'rule-of-72.html', 'savings-rate-beats-returns-early.html']
    },
    {
      slug: 'the-behavior-gap.html',
      pillar: 'invest', emoji: '🧠', date: '2026-07-05', readMin: 6,
      thumb: 'thumbs/the-behavior-gap.svg',
      title: { th: 'ช่องว่างพฤติกรรม — ทำไมนักลงทุนมักได้น้อยกว่ากองทุนที่ตัวเองถือ', en: 'The behavior gap — why investors usually earn less than their own funds' },
      desc: { th: 'กองทุนหนึ่งอาจให้ผลตอบแทนดี แต่ "นักลงทุนโดยเฉลี่ย" ในกองนั้นมักได้น้อยกว่า เพราะซื้อตอนขึ้น (โลภ) ขายตอนตก (กลัว) ซ้ำ ๆ ช่องว่างนี้เกิดจากพฤติกรรม ไม่ใช่การเลือกกองผิด — เปลี่ยนพฤติกรรมช่วยได้', en: 'A fund can perform well while its average investor earns less — buying high on greed and selling low on fear, over and over. The gap comes from behavior, not fund choice; changing behavior closes it.' },
      tool: 'risk-profile.html',
      tags: ['behavior', 'psychology', 'timing'],
      related: ['checking-portfolio-too-often.html', 'the-emotional-cycle.html', 'missing-the-best-days.html']
    },
    {
      slug: 'home-bias-trap.html',
      pillar: 'invest', emoji: '🌏', date: '2026-07-05', readMin: 6,
      thumb: 'thumbs/home-bias-trap.svg',
      title: { th: 'กับดักลงทุนแต่ในบ้าน — ทำไมพอร์ตคนไทยเสี่ยงกระจุกโดยไม่รู้ตัว', en: 'The home-bias trap — why a Thai portfolio is more concentrated than it looks' },
      desc: { th: 'คนมักลงทุนหนักในตลาดประเทศตัวเองเพราะคุ้นเคย (home bias) แต่หุ้นไทยเป็นสัดส่วนเล็กมากของตลาดโลก การถือเกือบทั้งพอร์ตเป็นหุ้นไทยคือเดิมพันกับเศรษฐกิจ ค่าเงิน การเมืองเดียว — ความเสี่ยงกระจุกที่มองไม่เห็น', en: 'People overweight their home market because it feels familiar (home bias) — but Thai equities are a tiny slice of the world. Holding almost all Thai stocks bets everything on one economy, currency, and politics: hidden concentration risk.' },
      tool: 'risk-profile.html',
      tags: ['portfolio', 'risk', 'framework'],
      related: ['markets-that-went-to-zero.html', 'diversification-free-lunch.html', 'returns-rotate-diversification.html']
    },
    {
      slug: 'returns-rotate-diversification.html',
      pillar: 'invest', emoji: '🔀', date: '2026-07-05', readMin: 7,
      thumb: 'thumbs/returns-rotate-diversification.svg',
      title: { th: 'ทำไมผู้ชนะเปลี่ยนทุกปี — และเหตุผลที่การกระจายชนะการเดา', en: 'Why the winner changes every year — and why diversification beats guessing' },
      desc: { th: 'แต่ละปีมีสินทรัพย์คนละประเภทที่ผลตอบแทนนำ (หุ้นไทย หุ้นโลก ตราสารหนี้ ทอง เงินสด) โดยไม่มีลำดับที่คาดเดาได้ การไล่ซื้อผู้ชนะปีที่แล้วคือเกมที่แพ้ ถือแบบกระจายแปลว่ามีส่วนของผู้นำปีนี้เสมอ', en: 'Each year a different asset class leads — Thai stocks, global stocks, bonds, gold, cash — in an order almost no one predicts. Chasing last year\'s winner is a losing game; diversifying means you always own part of this year\'s leader.' },
      tool: 'risk-profile.html',
      tags: ['portfolio', 'risk', 'behavior'],
      related: ['diversification-free-lunch.html', 'the-60-40-portfolio.html', 'few-stocks-make-all-the-money.html']
    },
    {
      slug: 'diversification-free-lunch.html',
      pillar: 'invest', emoji: '🍱', date: '2026-07-05', readMin: 7,
      thumb: 'thumbs/diversification-free-lunch.svg',
      title: { th: 'อาหารกลางวันฟรีมื้อเดียวในการลงทุน — การกระจายที่ลดความเสี่ยงโดยไม่ลดผลตอบแทนที่คาดหวัง', en: 'The only free lunch in investing — diversification' },
      desc: { th: 'การผสมสินทรัพย์ที่ไม่ขึ้นลงพร้อมกัน ช่วยลดความผันผวนของพอร์ตได้โดยไม่ลดผลตอบแทนที่คาดหวัง — สิ่งที่ใกล้เคียงกับ "อาหารกลางวันฟรี" ที่สุดในโลกการเงิน แนวคิดที่มักยกให้ Harry Markowitz', en: 'Blending assets that don\'t rise and fall together lowers a portfolio\'s volatility without lowering its expected return — the closest thing to a free lunch in finance, an idea usually credited to Harry Markowitz.' },
      tool: 'risk-profile.html',
      tags: ['portfolio', 'risk', 'framework'],
      related: ['returns-rotate-diversification.html', 'the-60-40-portfolio.html', 'few-stocks-make-all-the-money.html']
    },
    {
      slug: 'price-sets-return.html',
      pillar: 'invest', emoji: '🏷️', date: '2026-07-05', readMin: 7,
      thumb: 'thumbs/price-sets-return.svg',
      title: { th: 'ราคาที่คุณจ่าย กำหนดผลตอบแทนที่คุณจะได้', en: 'The price you pay sets the return you get' },
      desc: { th: 'ราคาที่จ่ายวันนี้คือคำทำนายผลตอบแทนระยะยาวที่ดีที่สุดที่เรามี · ซื้อตลาดตอนถูก ผลตอบแทน 10 ปีข้างหน้ามักสูง ซื้อตอนแพงมักต่ำ (อ้างงาน CAPE ของ Robert Shiller และวินัยแบบ Graham/Buffett) บริษัทดีถ้าซื้อแพงเกินไปก็ยังทำให้จนได้', en: 'How expensive the market is on the day you buy is the best long-run predictor of return we have — buy cheap and the next decade tends to pay well, buy dear and it tends to disappoint (per Robert Shiller\'s CAPE).' },
      tool: 'risk-profile.html',
      tags: ['framework', 'risk', 'timing'],
      related: ['extremes-revert.html', 'volatility-is-the-fee.html', 'time-shrinks-the-range.html']
    },
    {
      slug: 'extremes-revert.html',
      pillar: 'invest', emoji: '↩️', date: '2026-07-05', readMin: 6,
      thumb: 'thumbs/extremes-revert.svg',
      title: { th: 'ของสุดขั้วมักกลับสู่ค่ากลาง — แต่ตามจังหวะของมันเอง', en: 'Extremes revert — but on their own schedule' },
      desc: { th: 'ผลตอบแทนที่สูงผิดปกติ มูลค่าที่แพงลิ่ว หรือกองที่ร้อนแรงสุด มักกลับสู่ค่าเฉลี่ยระยะยาว (mean reversion) · ใช้ตั้งความคาดหวังได้ดี แต่เป็นนาฬิกาจับจังหวะที่แย่ เพราะของสุดขั้วอยู่สุดขั้วได้นานกว่าที่คุณจะทนไหว', en: 'Unusually high returns, sky-high valuations, or a red-hot manager tend to drift back to their long-run average — great for setting expectations, but a terrible market-timing clock, because extremes can stay extreme longer than you can bear.' },
      tool: 'risk-profile.html',
      tags: ['framework', 'behavior', 'timing'],
      related: ['price-sets-return.html', 'missing-the-best-days.html', 'the-emotional-cycle.html']
    },
    {
      slug: 'bubbles-rhyme.html',
      pillar: 'invest', emoji: '🫧', date: '2026-07-05', readMin: 7,
      thumb: 'thumbs/bubbles-rhyme.svg',
      title: { th: 'ฟองสบู่ไม่ซ้ำรอยเดิม แต่มันคล้องจองกัน — ทิวลิป ดอตคอม คริปโต', en: 'Bubbles don\'t repeat, but they rhyme — tulips, dot-com, crypto' },
      desc: { th: 'จากทิวลิปฮอลันดา สู่ฟองสบู่ดอตคอม จนถึงคริปโต · ฟองสบู่การเงินทุกยุคเล่นตามสคริปต์อารมณ์เดียวกัน — เรื่องจริง เงินหาง่าย ความคลั่ง "รอบนี้ไม่เหมือนเดิม" และการพังทลาย รู้แพตเทิร์นไม่ช่วยให้ทายจุดสูงสุดได้ แต่ช่วยไม่ให้คุณเป็นคนซื้อคนสุดท้าย', en: 'From Dutch tulips to the dot-com crash to crypto, every bubble runs the same emotional script — a real story, easy money, "this time is different" mania, and the collapse. Knowing the pattern won\'t call the top, but it keeps you from being the last buyer.' },
      tool: 'risk-profile.html',
      tags: ['psychology', 'behavior', 'framework'],
      related: ['the-emotional-cycle.html', 'markets-that-went-to-zero.html', 'volatility-is-the-fee.html']
    },
    {
      slug: 'markets-that-went-to-zero.html',
      pillar: 'invest', emoji: '🕳️', date: '2026-07-05', readMin: 7,
      thumb: 'thumbs/markets-that-went-to-zero.svg',
      title: { th: 'ตลาดหุ้นที่หายไปเป็นศูนย์ — อคติผู้รอดชีวิตที่ทำให้ "หุ้นขึ้นเสมอ" หลอกเรา', en: 'The stock markets that went to zero — the survivorship bias behind "stocks always go up"' },
      desc: { th: 'เรามักยก "หุ้นขึ้นเสมอ" จากตลาดที่รอดชีวิตอย่างสหรัฐฯ และอังกฤษ แต่ผู้ลงทุนในรัสเซีย (1917) และจีน (1949) เสียทุกอย่างถาวร กราฟระยะยาวที่ปลอบใจคืออคติผู้รอดชีวิต และบทเรียนคือทำไมการกระจายข้ามประเทศถึงสำคัญ', en: '"Stocks always go up" comes from survivor markets like the US and UK — but investors in Russia (1917) and China (1949) lost everything permanently. That comforting long-run chart is survivorship bias, and the lesson is why cross-country diversification matters.' },
      tool: 'risk-profile.html',
      tags: ['risk', 'portfolio', 'framework'],
      related: ['bubbles-rhyme.html', 'few-stocks-make-all-the-money.html', 'diversification-free-lunch.html']
    },
    {
      slug: 'the-emotional-cycle.html',
      pillar: 'invest', emoji: '🎭', date: '2026-07-05', readMin: 6,
      thumb: 'thumbs/the-emotional-cycle.svg',
      title: { th: 'วงจรอารมณ์นักลงทุน — จุดที่เสี่ยงที่สุดคือตอนที่รู้สึกดีที่สุด', en: 'The cycle of investor emotion — peak risk feels like peak confidence' },
      desc: { th: 'ตลาดเคลื่อนไปตามวงจรอารมณ์ที่วนซ้ำ · มองโลกดี ตื่นเต้น ยูโฟเรียที่จุดสูงสุด แล้วกังวล กลัว สิ้นหวังที่จุดต่ำสุด กับดักคือความเสี่ยงสูงสุดกลับรู้สึกเหมือนมั่นใจที่สุด กฎที่เขียนไว้ช่วยกันคุณจากอารมณ์ตัวเอง', en: 'Markets run on a repeating emotional loop — optimism, excitement, euphoria at the top, then anxiety, fear, and despair at the bottom. The trap is that peak risk feels like peak confidence; written rules protect you from your own emotions.' },
      tool: 'risk-profile.html',
      tags: ['psychology', 'behavior', 'timing'],
      related: ['bubbles-rhyme.html', 'checking-portfolio-too-often.html', 'volatility-is-the-fee.html']
    },
    {
      slug: 'the-rebalancing-bonus.html',
      pillar: 'invest', emoji: '🔁', date: '2026-07-05', readMin: 7,
      thumb: 'thumbs/the-rebalancing-bonus.svg',
      title: { th: 'โบนัสจากการปรับสมดุลพอร์ต — บังคับตัวเองซื้อถูก ขายแพง อย่างเป็นระบบ', en: 'The rebalancing bonus — a system that forces you to buy low and sell high' },
      desc: { th: 'ปรับสมดุลพอร์ตกลับสู่สัดส่วนเป้าหมาย คือการตัดกำไรตัวที่วิ่งแรงไปเติมตัวที่ราคาตก · ซื้อถูกขายแพงเชิงกลไกที่คนส่วนใหญ่ทำไม่ได้เพราะอารมณ์ ทำตามปฏิทิน ไม่ใช่ตามข่าว', en: 'Rebalancing back to your target mix means trimming what has run up to top up what has fallen — buying low and selling high mechanically, something most people can\'t do on emotion. Do it by the calendar, not the news.' },
      tool: 'risk-profile.html',
      tags: ['portfolio', 'framework', 'behavior'],
      related: ['the-60-40-portfolio.html', 'returns-rotate-diversification.html', 'checking-portfolio-too-often.html']
    },
    {
      slug: 'tails-drive-everything.html',
      pillar: 'invest', emoji: '🎲', date: '2026-07-05', readMin: 6,
      thumb: 'thumbs/tails-drive-everything.svg',
      title: { th: 'หางยาวขับเคลื่อนทุกอย่าง — ทำไมไม่กี่ครั้งที่ถูก สำคัญกว่าจำนวนครั้งที่ผิด', en: 'Tails drive everything — why a few big wins matter more than being right often' },
      desc: { th: 'ทั้งในการลงทุนและการงาน ผลลัพธ์ส่วนใหญ่มาจากเหตุการณ์เพียงหยิบมือ คุณผิดได้เกือบตลอดเวลาแล้วยังชนะใหญ่ได้ ถ้ายังอยู่รอดพอจะเจอเหตุการณ์ปลายหางไม่กี่ครั้ง และไม่ปล่อยให้หายนะครั้งเดียวจบเกม', en: 'In investing and careers alike, almost the entire result comes from a handful of events. You can be wrong most of the time and still win big — if you survive long enough to catch the few tail events, and never let one disaster end the game (per Housel/Taleb).' },
      tool: 'risk-profile.html',
      tags: ['psychology', 'risk', 'framework'],
      related: ['few-stocks-make-all-the-money.html', 'wealth-is-what-you-dont-see.html', 'markets-that-went-to-zero.html']
    },
    {
      slug: 'most-active-funds-lose.html',
      pillar: 'invest', emoji: '🏳️', date: '2026-07-05', readMin: 7,
      thumb: 'thumbs/most-active-funds-lose.svg',
      title: { th: 'ทำไมกองทุน active ส่วนใหญ่แพ้ดัชนี — ยิ่งเวลานานยิ่งชัด', en: 'Why most active funds lose to the index — and it gets worse with time' },
      desc: { th: 'ปีแล้วปีเล่า กองทุน active ส่วนใหญ่ให้ผลตอบแทนต่ำกว่าดัชนีที่ใช้เทียบ และยิ่งวัดนานสัดส่วนที่ชนะยิ่งหด อ้างอิง SPIVA scorecard ของ S&P · สาเหตุหลักคือค่าธรรมเนียมที่ทบต้นสวนทาง และการเอาชนะตลาดสม่ำเสมอนั้นหายาก', en: 'Year after year, most active funds return less than their benchmark, and the longer you measure, the smaller the share that beats it (per S&P\'s SPIVA scorecard). The main culprit is fees compounding against you — consistently beating the market is rare.' },
      tool: 'risk-profile.html',
      tags: ['funds', 'framework', 'portfolio'],
      related: ['fund-fees-index-funds.html', 'few-stocks-make-all-the-money.html', 'volatility-is-the-fee.html']
    },
    {
      slug: 'lifestyle-inflation-save-your-raise.html',
      pillar: 'foundation', emoji: '🪜', date: '2026-07-05', readMin: 6,
      thumb: 'thumbs/lifestyle-inflation-save-your-raise.svg',
      title: { th: 'เงินเดือนขึ้น 20% แต่สิ้นปีเงินเก็บเท่าเดิม', en: 'Your raise keeps disappearing: the lifestyle-inflation trap' },
      desc: { th: 'ทำไมรายได้ที่เพิ่มขึ้นถึงหายไปทุกปี lifestyle inflation ทำงานยังไง และกฎแบ่งครึ่งเงินที่เพิ่มขึ้นที่ทำให้อัตราการออมโตเองทุกครั้งที่เงินเดือนขึ้น', en: 'Why your pay rises vanish every year, how lifestyle inflation works, and the split-the-raise rule that ratchets your savings rate up automatically.' },
      tool: 'net-worth.html',
      tags: ['behavior', 'henry', 'cashflow', 'networth'], series: { id: 'foundations', order: 2 },
      related: ['net-worth-why-it-matters.html', 'bonus-what-to-do-first.html', 'how-much-to-save.html']
    },
    {
      slug: 'loss-recovery-math.html',
      pillar: 'invest', emoji: '📉', date: '2026-07-05', readMin: 7,
      thumb: 'thumbs/loss-recovery-math.svg',
      title: { th: 'ขาดทุน 50% ต้องกำไร 100% ถึงเท่าทุน — คณิตที่เปลี่ยนวิธีมองความเสี่ยง', en: 'A 50% loss needs a 100% gain just to break even' },
      desc: { th: 'ทำไมการกู้คืนขาดทุนถึงไม่สมมาตร — ยิ่งขาดทุนก้อนใหญ่ยิ่งต้องกำไรทวีคูณ และทำไมการเลี่ยงหายนะสำคัญกว่าไล่ผลตอบแทน', en: 'Why loss recovery is asymmetric — big losses need exponentially bigger gains — and why avoiding catastrophe beats chasing returns.' },
      tool: 'risk-profile.html',
      tags: ['risk', 'portfolio', 'framework'],
      related: ['risk-profile-explained.html', 'sequence-of-returns-risk.html', 'the-60-40-portfolio.html']
    },
    {
      slug: 'wealth-is-what-you-dont-see.html',
      pillar: 'foundation', emoji: '🫥', date: '2026-07-05', readMin: 6,
      thumb: 'thumbs/wealth-is-what-you-dont-see.svg',
      title: { th: 'ความมั่งคั่งคือสิ่งที่คุณมองไม่เห็น', en: 'Wealth is what you don\'t see' },
      desc: { th: 'เราตัดสินความรวยจากสิ่งที่คนใช้จ่าย แต่ความมั่งคั่งจริงคือเงินที่ไม่ได้ใช้ซึ่งมองไม่เห็น จึงลอกสัญญาณผิด (แนวคิด Morgan Housel)', en: 'We judge wealth by what people spend, but real wealth is the money not spent — which is invisible, so we copy the wrong signal (per Morgan Housel).' },
      tool: 'net-worth.html',
      tags: ['networth', 'behavior', 'henry'],
      related: ['lifestyle-inflation-save-your-raise.html', 'net-worth-why-it-matters.html', 'knowing-what-is-enough.html']
    },
    {
      slug: 'savings-rate-beats-returns-early.html',
      pillar: 'invest', emoji: '🌱', date: '2026-07-05', readMin: 7,
      thumb: 'thumbs/savings-rate-beats-returns-early.svg',
      title: { th: 'ช่วงแรกของการลงทุน "อัตราการออม" สำคัญกว่า "ผลตอบแทน"', en: 'Early on, your savings rate matters more than your return' },
      desc: { th: 'เมื่อพอร์ตยังเล็ก เงินที่เติมทุกเดือนขับเคลื่อนการเติบโตมากกว่า % ผลตอบแทน · ผลตอบแทนมาครองทีหลัง — จุดตัดที่มือใหม่ควรเข้าใจ', en: 'When the pot is small, monthly contributions drive growth far more than the return %; returns take over later — the crossover beginners should understand.' },
      tool: 'compound-dca.html',
      tags: ['investing-start', 'compounding', 'behavior'],
      related: ['compound-interest-power.html', 'dont-wait-for-lump-sum.html', 'rule-of-72.html']
    },
    {
      slug: 'missing-the-best-days.html',
      pillar: 'invest', emoji: '⚡', date: '2026-07-05', readMin: 7,
      thumb: 'thumbs/missing-the-best-days.svg',
      title: { th: 'พลาดแค่ 10 วันที่ดีที่สุด ผลตอบแทนหายครึ่ง — แต่มีข้อโต้แย้งที่ต้องรู้', en: 'Miss the 10 best days and returns halve — with the rebuttal you must know' },
      desc: { th: 'สถิติ "อยู่ในตลาด" คลาสสิก และข้อโต้แย้งที่ซื่อสัตย์: วันดีที่สุดมักอยู่ติดวันแย่ที่สุด จับจังหวะเลี่ยงวันร้ายมักพลาดวันดีไปด้วย', en: 'The classic "stay invested" stat and its honest rebuttal: best days cluster next to worst days, so trying to dodge the bad ones usually costs you the good ones too.' },
      tool: 'risk-profile.html',
      tags: ['behavior', 'risk', 'timing'],
      related: ['dont-wait-for-lump-sum.html', 'checking-portfolio-too-often.html', 'volatility-is-the-fee.html']
    },
    {
      slug: 'rule-of-72.html',
      pillar: 'invest', emoji: '⏱️', date: '2026-07-05', readMin: 6,
      thumb: 'thumbs/rule-of-72.svg',
      title: { th: 'กฎ 72 — คำนวณในหัวว่าเงินจะโตเท่าตัวในกี่ปี', en: 'The Rule of 72 — double your money in your head' },
      desc: { th: '72 ÷ อัตราต่อปี ≈ จำนวนปีที่เงินโตเท่าตัว · ทางลัดคิดในหัวที่ทำให้พลังทบต้น ต้นทุนเงินเฟ้อ และค่าธรรมเนียม เห็นภาพทันที', en: '72 ÷ your annual rate ≈ years to double — a mental shortcut that makes compounding, inflation, and fees instantly visible.' },
      tool: 'compound-dca.html',
      tags: ['compounding', 'framework', 'investing-start'],
      related: ['compound-interest-power.html', 'savings-rate-beats-returns-early.html', 'real-inflation-vs-cpi.html']
    },
    {
      slug: 'time-shrinks-the-range.html',
      pillar: 'invest', emoji: '📏', date: '2026-07-05', readMin: 7,
      thumb: 'thumbs/time-shrinks-the-range.svg',
      title: { th: 'ยิ่งถือนาน ช่วงผลลัพธ์ยิ่งแคบ — ทำไมเวลาคือเพื่อนของนักลงทุน', en: 'The longer you hold, the narrower the range of outcomes' },
      desc: { th: 'หนึ่งปีตลาดทำอะไรก็ได้ แต่ 10-20 ปี ช่วงผลตอบแทนต่อปีแคบลงและเลื่อนไปทางบวก · เวลาไม่ได้ลบความเสี่ยง แต่บีบอัดมัน', en: 'Over a year the market can do anything; over 10-20 years the annualized range narrows and drifts positive. Time doesn\'t remove risk, it compresses it.' },
      tool: 'retirement-simulator.html',
      tags: ['risk', 'framework', 'retirement'],
      related: ['risk-profile-explained.html', 'dont-wait-for-lump-sum.html', 'sequence-of-returns-risk.html']
    },
    {
      slug: 'the-60-40-portfolio.html',
      pillar: 'invest', emoji: '⚖️', date: '2026-07-05', readMin: 7,
      thumb: 'thumbs/the-60-40-portfolio.svg',
      title: { th: 'พอร์ต 60/40 — น่าเบื่อ แต่ทนทานอย่างน่าประหลาด', en: 'The 60/40 portfolio — boring, and surprisingly hard to beat' },
      desc: { th: 'หุ้น 60% เป็นเครื่องยนต์ ตราสารหนี้ 40% เป็นโช้คอัพ · ทำไมความสมดุลที่น่าเบื่อถึงถือไหวจริง และบังคับซื้อถูกขายแพงผ่าน rebalancing', en: 'Stocks are the engine, bonds the shock absorber — why the boring balance is one you can actually hold, and how rebalancing enforces buy-low/sell-high.' },
      tool: 'risk-profile.html',
      tags: ['portfolio', 'framework', 'risk'],
      related: ['risk-profile-explained.html', 'portfolio-by-function.html', 'loss-recovery-math.html']
    },
    {
      slug: 'knowing-what-is-enough.html',
      pillar: 'foundation', emoji: '🎯', date: '2026-07-05', readMin: 6,
      thumb: 'thumbs/knowing-what-is-enough.svg',
      title: { th: 'รู้จักคำว่า "พอ" — บันไดไลฟ์สไตล์ที่หมุนขึ้นได้ทางเดียว', en: 'Knowing what is "enough"' },
      desc: { th: 'ถ้าไม่นิยามคำว่า "พอ" ความอยากจะโตตามรายได้ไปเรื่อยๆ และไม่เคยรู้สึกรวยไม่ว่าหาได้เท่าไหร่ · การตั้งเส้น "พอ" คือสิ่งที่ทำให้ไปถึงจริง (แนวคิด Housel)', en: 'Without a defined "enough," desires rise with income forever and you never feel wealthy. Defining "enough" is what lets you arrive (per Housel).' },
      tool: 'budget-planner.html',
      tags: ['behavior', 'henry', 'cashflow'],
      related: ['lifestyle-inflation-save-your-raise.html', 'wealth-is-what-you-dont-see.html', 'bonus-what-to-do-first.html']
    },
    {
      slug: 'volatility-is-the-fee.html',
      pillar: 'invest', emoji: '🎢', date: '2026-07-05', readMin: 6,
      thumb: 'thumbs/volatility-is-the-fee.svg',
      title: { th: 'ความผันผวนคือค่าธรรมเนียม ไม่ใช่ค่าปรับ', en: 'Volatility is the fee, not the fine' },
      desc: { th: 'ผลตอบแทนตลาดไม่ฟรี — ค่าเข้าชมคือการทนความผันผวน · คนที่มองว่ามันคือค่าปรับแล้วหนี จ่ายแพงกว่าคนที่ยอมรับว่าเป็นค่าธรรมเนียม (แนวคิด Housel)', en: 'Market returns aren\'t free — the price of admission is enduring the swings; those who treat volatility as a fine and flee pay far more (per Housel).' },
      tool: 'risk-profile.html',
      tags: ['psychology', 'behavior', 'risk'],
      related: ['risk-profile-explained.html', 'checking-portfolio-too-often.html', 'missing-the-best-days.html']
    },
    {
      slug: 'few-stocks-make-all-the-money.html',
      pillar: 'invest', emoji: '🎰', date: '2026-07-05', readMin: 7,
      thumb: 'thumbs/few-stocks-make-all-the-money.svg',
      title: { th: 'หุ้นไม่กี่ตัวสร้างผลตอบแทนเกือบทั้งหมด — ทำไมการกระจายถึงชนะการเลือก', en: 'A few stocks make all the money — why diversification beats picking' },
      desc: { th: 'งานวิจัยพบว่าหุ้นส่วนน้อยขับเคลื่อนความมั่งคั่งระยะยาวเกือบทั้งหมด ขณะที่ส่วนใหญ่แพ้แม้แต่พันธบัตร · ความเบ้นี้คือเหตุผลที่การกระจายเงียบๆ ชนะ (อ้างงาน Bessembinder)', en: 'Research finds a tiny minority of stocks drive nearly all long-run wealth while most lag even bills — the skew is why broad diversification quietly wins (per Bessembinder).' },
      tool: 'risk-profile.html',
      tags: ['portfolio', 'risk', 'framework'],
      related: ['fund-fees-index-funds.html', 'portfolio-by-function.html', 'risk-profile-explained.html']
    },
    {
      slug: 'bonus-what-to-do-first.html',
      pillar: 'foundation', emoji: '🎁', date: '2026-07-05', readMin: 6,
      thumb: 'thumbs/bonus-what-to-do-first.svg',
      title: { th: 'โบนัสออกแล้ว! สิ่งแรกที่ควรทำ ไม่ใช่รีบลงทุน', en: 'Got your bonus? The first move isn\'t investing' },
      desc: { th: 'ทำไมสิ่งแรกที่ควรทำกับโบนัสคืออุดรูรั่ว (เงินสำรอง หนี้แพง เพดานลดหย่อน) ก่อนลงทุน และวิธีไม่ให้โบนัสตั้งมาตรฐานไลฟ์สไตล์ใหม่', en: 'Why the smart first move with a bonus is plugging leaks (buffer, high-interest debt, tax room) before investing, and not letting it inflate your lifestyle.' },
      tool: 'budget-planner.html',
      tags: ['cashflow', 'behavior', 'henry'], series: { id: 'foundations', order: 3 },
      related: ['lifestyle-inflation-save-your-raise.html', 'how-much-to-save.html', 'debt-snowball-avalanche.html']
    },
    {
      slug: 'dont-wait-for-lump-sum.html',
      pillar: 'invest', emoji: '⏳', date: '2026-07-05', readMin: 7,
      thumb: 'thumbs/dont-wait-for-lump-sum.svg',
      title: { th: '"รอมีเงินก้อนค่อยลงทุน" คือคำแนะนำที่ฟังดูดีแต่แพงที่สุด', en: '"Wait for a lump sum to invest" is the most expensive good-sounding advice' },
      desc: { th: 'ทำไมการรอสะสมเงินก้อนก่อนลงทุนถึงแพงกว่าที่คิด เพราะเสียเวลาทบต้น เริ่มทีละน้อยดีกว่าอย่างไร และเมื่อไหร่ที่การรอถึงถูกต้อง', en: 'Why waiting to save up a lump sum costs more than you think · lost compounding time · how starting small wins, and when waiting is right.' },
      tool: 'compound-dca.html',
      tags: ['investing-start', 'timing', 'behavior'],
      related: ['compound-interest-power.html', 'dca-how-to-start.html', 'emergency-fund-guide.html']
    },
    {
      slug: 'checking-portfolio-too-often.html',
      pillar: 'invest', emoji: '📱', date: '2026-07-05', readMin: 6,
      thumb: 'thumbs/checking-portfolio-too-often.svg',
      title: { th: 'ทำไมเช็คพอร์ตทุกวันทำให้ตัดสินใจแย่ลง', en: 'Why checking your portfolio daily makes your decisions worse' },
      desc: { th: 'myopic loss aversion ทำงานยังไง ยิ่งเช็คบ่อยยิ่งเห็นการขาดทุนบ่อยและยิ่งอยากขายผิดจังหวะ · เช็คให้น้อยลง ตัดสินใจดีขึ้น', en: 'How myopic loss aversion works · the more often you look, the more losses you feel and the worse you sell · check less, decide better.' },
      tool: 'risk-profile.html',
      tags: ['psychology', 'behavior', 'portfolio'], series: { id: 'invest-psych', order: 2 },
      related: ['risk-profile-explained.html', 'portfolio-by-function.html', 'dca-how-to-start.html']
    },
    {
      slug: 'portfolio-by-function.html',
      pillar: 'invest', emoji: '🧩', date: '2026-07-05', readMin: 7,
      thumb: 'thumbs/portfolio-by-function.svg',
      title: { th: 'คนส่วนใหญ่ไม่ได้ขาดทุนเพราะเลือกหุ้นผิด แต่จัดพอร์ตผิด', en: 'Most people don\'t lose from picking wrong — they lose from structuring wrong' },
      desc: { th: 'ก่อนซื้ออะไร ให้เงินแต่ละก้อนมี "หน้าที่" (ปกป้อง / ทบต้น / ยอมเสียได้) · โครงสร้างพอร์ตสำคัญกว่าการเลือกหุ้น', en: 'Before buying, give each part of your money a job (protect / compound / can-lose) · structure matters more than stock picking.' },
      tool: 'risk-profile.html',
      tags: ['portfolio', 'framework', 'risk'], series: { id: 'invest-psych', order: 3 },
      related: ['risk-profile-explained.html', 'checking-portfolio-too-often.html', 'net-worth-why-it-matters.html']
    },
    {
      slug: 'sequence-of-returns-risk.html',
      pillar: 'retire', emoji: '📉', date: '2026-07-05', readMin: 8,
      thumb: 'thumbs/sequence-of-returns-risk.svg',
      title: { th: 'ตลาดพัง 5 ปีแรกหลังเกษียณ อันตรายกว่าพังตอนอายุ 40 หลายเท่า', en: 'A crash in your first 5 retirement years is far more dangerous than one at 40' },
      desc: { th: 'sequence-of-returns risk · ลำดับผลตอบแทนสำคัญมากเมื่อเริ่มถอนเงิน "retirement red zone" และวิธีป้องกันด้วยกันชนเงินสดกับการถอนแบบยืดหยุ่น', en: 'Sequence-of-returns risk · why the ORDER of returns matters once you\'re withdrawing, the retirement red zone, and how to guard against it.' },
      tool: 'retirement-simulator.html',
      tags: ['retirement', 'sequence', 'risk'], series: { id: 'retire-survive', order: 2 },
      related: ['retirement-how-much.html', 'real-inflation-vs-cpi.html', 'fire-movement-thailand.html']
    },
    {
      slug: 'real-inflation-vs-cpi.html',
      pillar: 'retire', emoji: '🎈', date: '2026-07-05', readMin: 7,
      thumb: 'thumbs/real-inflation-vs-cpi.svg',
      title: { th: 'เงินเฟ้อไทย "ต่ำ" แต่ค่าใช้จ่ายจริงของคุณไม่เคยต่ำ', en: 'Thai inflation looks low, but your real cost of living never is' },
      desc: { th: 'ทำไม CPI ที่ประกาศไม่ใช่เงินเฟ้อของคุณ ค่ารักษาพยาบาลและค่าเทอมมักขึ้นเร็วกว่าค่าเฉลี่ย และทำไมวางแผนเกษียณต้องใช้ตะกร้าเงินเฟ้อของตัวเอง', en: 'Why headline CPI isn\'t your inflation, why healthcare and education rise faster, and why retirement planning needs your own inflation basket.' },
      tool: 'retirement-simulator.html',
      tags: ['inflation', 'retirement'], series: { id: 'retire-survive', order: 3 },
      related: ['retirement-how-much.html', 'sequence-of-returns-risk.html', 'social-security-pension.html']
    },
    {
      slug: 'fire-movement-thailand.html',
      pillar: 'retire', emoji: '🔥', date: '2026-06-12', readMin: 8,
      thumb: 'thumbs/fire-movement-thailand.svg',
      title: { th: 'FIRE คืออะไร? เกษียณก่อน 40 ในไทยทำได้จริงไหม', en: 'What is FIRE? Early retirement in Thailand, realistically' },
      desc: { th: 'ขบวนการ FIRE เกษียณเร็วด้วยเลข 25 เท่า อัตราออม 50%+ ทำได้จริงแค่ไหนในบริบทไทย พร้อมตัวอย่างคำนวณ', en: 'The FIRE movement, the 25x number and 50%+ savings rates · how realistic is it in Thailand?' },
      tool: 'retirement-simulator.html',
      tags: ['fire', 'retirement', 'framework'], series: { id: 'retire-survive', order: 4 }
    },
    {
      slug: 'social-security-pension.html',
      pillar: 'retire', emoji: '🏛️', date: '2026-06-12', readMin: 8,
      thumb: 'thumbs/social-security-pension.svg',
      title: { th: 'ประกันสังคม ม.33 ได้บำนาญเท่าไหร่? คำนวณเงินชราภาพให้ดูชัดๆ', en: 'Thai social security pension: how much will you actually get?' },
      desc: { th: 'สูตรคำนวณบำนาญชราภาพประกันสังคม มาตรา 33/39 ได้เดือนละเท่าไหร่ พอใช้ไหม และต้องเติมอีกแค่ไหน', en: 'The Thai SSO pension formula, what it pays monthly, and the gap you need to fill yourself.' },
      tool: 'retirement-simulator.html',
      tags: ['retirement', 'framework']
    },
    {
      slug: 'dca-how-to-start.html',
      pillar: 'invest', emoji: '🗓️', date: '2026-06-12', readMin: 7,
      thumb: 'thumbs/dca-how-to-start.svg',
      title: { th: 'DCA คืออะไร? เริ่มลงทุนรายเดือนฉบับมือใหม่ (พิสูจน์ด้วยตัวเลข)', en: 'What is DCA? Monthly investing for beginners, proven with numbers' },
      desc: { th: 'DCA ตัดอารมณ์ออกจากการลงทุนยังไง เทียบ DCA vs ลงก้อนเดียว vs จับจังหวะตลาด พร้อมขั้นตอนเริ่มจริง', en: 'How dollar-cost averaging removes emotion · DCA vs lump sum vs market timing, with real steps.' },
      tool: 'compound-dca.html',
      tags: ['investing-start', 'behavior', 'timing']
    },
    {
      slug: 'fund-fees-index-funds.html',
      pillar: 'invest', emoji: '🧮', date: '2026-06-12', readMin: 7,
      thumb: 'thumbs/fund-fees-index-funds.svg',
      title: { th: 'ค่าธรรมเนียมกองทุน 1.5% ไม่ใช่เรื่องเล็ก · Index Fund คือทางออก?', en: 'Fund fees of 1.5% are not small · are index funds the answer?' },
      desc: { th: 'เปิดวิธีอ่าน TER กองทุนรวมไทย ค่าธรรมเนียมกินผลตอบแทนทบต้นแค่ไหนใน 20 ปี และทำไมกองทุน index ถูกกว่า 5 เท่า', en: 'How to read Thai fund TERs, what fees compound to over 20 years, and why index funds cost 5x less.' },
      tool: 'compound-dca.html',
      tags: ['funds', 'compounding', 'investing-start']
    },
    {
      slug: 'risk-profile-explained.html',
      pillar: 'invest', emoji: '🎯', date: '2026-06-12', readMin: 6,
      thumb: 'thumbs/risk-profile-explained.svg',
      title: { th: 'ก่อนซื้อกองทุน รู้จัก Risk Profile ของตัวเองหรือยัง?', en: 'Know your risk profile before you buy any fund' },
      desc: { th: 'ความเสี่ยง "รับได้" กับ "รับไหว" ต่างกันยังไง ทำไมพอร์ตที่ดีที่สุดคือพอร์ตที่คุณถือผ่านตลาดแดงได้', en: 'Risk willingness vs capacity · and why the best portfolio is the one you can hold through a crash.' },
      tool: 'risk-profile.html',
      tags: ['portfolio', 'psychology', 'risk'], series: { id: 'invest-psych', order: 1 }
    },
    {
      slug: 'net-worth-why-it-matters.html',
      pillar: 'foundation', emoji: '🏛️', date: '2026-06-12', readMin: 6,
      thumb: 'thumbs/net-worth-why-it-matters.svg',
      title: { th: 'Net Worth คืออะไร? ตัวเลขเดียวที่บอกฐานะการเงินจริงของคุณ', en: 'Net worth: the one number that tells your true financial position' },
      desc: { th: 'รายได้สูงไม่ได้แปลว่ารวย · วิธีคำนวณความมั่งคั่งสุทธิ ตีมูลค่าทรัพย์สินแบบ realistic และเป้าตามช่วงอายุ', en: 'High income ≠ wealthy. How to compute net worth, value assets realistically, and age-based targets.' },
      tool: 'net-worth.html', featured: true,
      tags: ['networth', 'framework', 'henry'], series: { id: 'foundations', order: 1 },
      related: ['lifestyle-inflation-save-your-raise.html', 'how-much-to-save.html', 'financial-health-check.html']
    },
    {
      slug: 'financial-health-check.html',
      pillar: 'foundation', emoji: '❤️', date: '2026-06-12', readMin: 6,
      thumb: 'thumbs/financial-health-check.svg',
      title: { th: 'เช็คสุขภาพการเงิน 8 ข้อ · คุณ "แข็งแรง" หรือแค่ "ยังไหว"?', en: 'The 8-point financial health check: thriving or just coping?' },
      desc: { th: 'กรอบ Spend/Save/Borrow/Plan ระดับสากล 8 ตัวชี้วัดที่บอกว่าการเงินคุณแข็งแรงจริงไหม พร้อมแบบทดสอบฟรี 3 นาที', en: 'The global Spend/Save/Borrow/Plan framework · 8 indicators of real financial health, free 3-minute test.' },
      tool: 'financial-health-score.html',
      tags: ['framework', 'budgeting']
    },
    {
      slug: 'term-vs-whole-life.html',
      pillar: 'protect', emoji: '🛡️', date: '2026-06-12', readMin: 8,
      thumb: 'thumbs/term-vs-whole-life.svg',
      title: { th: 'ประกันชีวิต Term vs Whole Life ต่างกันยังไง ซื้อแบบไหนดี?', en: 'Term vs whole life insurance: which should you buy?' },
      desc: { th: 'เทียบประกันชีวิตแบบชั่วระยะเวลากับตลอดชีพ เบี้ยต่างกัน 10 เท่า ความคุ้มครองเท่ากัน · ใครเหมาะแบบไหน', en: 'Term costs 10x less for the same cover · who each type actually fits, without the sales pitch.' },
      tool: 'insurance-needs.html',
      tags: ['insurance', 'protection', 'framework']
    },
    {
      slug: 'health-insurance-guide.html',
      pillar: 'protect', emoji: '🏥', date: '2026-06-12', readMin: 8,
      thumb: 'thumbs/health-insurance-guide.svg',
      title: { th: 'ประกันสุขภาพจำเป็นไหม? เลือกยังไงไม่ให้เบี้ยบานปลายทาง', en: 'Do you need health insurance in Thailand? How to choose well' },
      desc: { th: 'ค่ารักษาโรงพยาบาลเอกชนแพงแค่ไหน สิทธิที่มีอยู่แล้วครอบคลุมอะไร และวิธีเลือกแผนเหมาจ่ายไม่ให้จ่ายเกินจำเป็น', en: 'Private hospital costs, what your existing coverage already pays, and choosing a plan without overpaying.' },
      tool: 'insurance-needs.html',
      tags: ['insurance', 'protection']
    },
    {
      slug: 'income-tax-guide.html',
      pillar: 'tax', emoji: '📋', date: '2026-06-12', readMin: 9,
      thumb: 'thumbs/income-tax-guide.svg',
      title: { th: 'ภาษีเงินได้บุคคลธรรมดา 2567: วิธีคำนวณขั้นบันไดแบบเข้าใจใน 10 นาที', en: 'Thai personal income tax: the bracket system explained in 10 minutes' },
      desc: { th: 'เงินได้สุทธิคิดยังไง ขั้นบันไดภาษี 5-35% ทำงานแบบไหน และความเข้าใจผิดเรื่อง "ขึ้น bracket แล้วโดนทั้งก้อน"', en: 'How Thai taxable income works, the 5-35% ladder, and the bracket myth that costs people money.' },
      tool: 'tax-calculator.html',
      tags: ['tax', 'framework']
    },
    {
      slug: 'rmf-vs-thaiesg.html',
      pillar: 'tax', emoji: '⚖️', date: '2026-06-12', readMin: 8,
      thumb: 'thumbs/rmf-vs-thaiesg.svg',
      title: { th: 'RMF vs ThaiESG ซื้ออะไรก่อน? เทียบชัดๆ เพดาน เงื่อนไข ระยะถือ', en: 'RMF vs ThaiESG: which to buy first? Caps, conditions, lock-ups' },
      desc: { th: 'กองทุนลดหย่อนภาษี 2 ตัวหลัก ต่างกันที่เพดาน ระยะถือครอง และเหมาะกับใคร พร้อมลำดับซื้อที่ฉลาดตามฐานภาษี', en: 'Thailand’s two main tax funds compared · caps, holding periods, and the smart buying order by tax bracket.' },
      tool: 'tax-deduction-optimizer.html',
      tags: ['tax', 'deductions', 'funds']
    },
    {
      slug: 'refinance-home-loan.html',
      pillar: 'debt', emoji: '🏠', date: '2026-06-12', readMin: 8,
      thumb: 'thumbs/refinance-home-loan.svg',
      title: { th: 'รีไฟแนนซ์บ้านคุ้มไหม? วิธีคิดให้ขาดก่อนย้ายธนาคาร', en: 'Refinancing your Thai home loan: when it actually pays off' },
      desc: { th: 'ดอกเบี้ยลอยตัวหลังปี 3 แพงแค่ไหน ค่าใช้จ่ายรีไฟแนนซ์มีอะไรบ้าง และสูตรคุ้มทุนที่ตัดสินใจได้ใน 5 นาที', en: 'Post-teaser floating rates, the real costs of refinancing, and a 5-minute break-even formula.' },
      tool: 'debt-payoff.html',
      tags: ['debt', 'framework']
    },
    {
      slug: 'retirement-how-much.html',
      pillar: 'retire', emoji: '🌅', date: '2026-06-11', readMin: 8,
      thumb: 'thumbs/retirement-how-much.svg',
      title: { th: 'เกษียณต้องมีเงินเท่าไหร่ถึงพอ? (สูตรคิดง่ายๆ + กฎ 4%)', en: 'How much do you need to retire? The 4% rule explained' },
      desc: { th: 'คำนวณเงินเกษียณที่ต้องมีจริง ด้วยกฎ 25 เท่าและกฎ 4% พร้อมตัวอย่างคนไทยและเครื่องมือจำลองฟรี', en: 'Work out your real retirement number with the 25x and 4% rules · with Thai examples and a free simulator.' },
      tool: 'retirement-simulator.html', featured: true,
      tags: ['retirement', 'framework', 'inflation', 'fire'], series: { id: 'retire-survive', order: 1 },
      related: ['sequence-of-returns-risk.html', 'real-inflation-vs-cpi.html', 'fire-movement-thailand.html']
    },
    {
      slug: 'tax-deductions-2567.html',
      pillar: 'tax', emoji: '🧾', date: '2026-06-11', readMin: 10,
      thumb: 'thumbs/tax-deductions-2567.svg',
      title: { th: 'ลดหย่อนภาษี 2567 มีอะไรบ้าง? RMF SSF ThaiESG ประกัน ครบจบที่เดียว', en: 'Thai tax deductions 2024: RMF, SSF, ThaiESG and insurance' },
      desc: { th: 'รวมรายการลดหย่อนภาษีปี 2567 ทุกตัว เพดานเท่าไหร่ ซื้ออะไรก่อน พร้อมวิธีคำนวณเงินที่ประหยัดได้จริง', en: 'Every Thai 2024 tax deduction, its cap, what to buy first, and how much you actually save.' },
      tool: 'tax-deduction-optimizer.html', featured: true,
      tags: ['tax', 'deductions'],
      related: ['rmf-vs-thaiesg.html', 'income-tax-guide.html']
    },
    {
      slug: 'how-much-to-save.html',
      pillar: 'foundation', emoji: '📊', date: '2026-06-11', readMin: 7,
      thumb: 'thumbs/how-much-to-save.svg',
      title: { th: 'เงินเดือน 30,000 / 50,000 ควรเก็บเท่าไหร่? แบ่งเงินยังไงให้เหลือ', en: 'How much should you save on a 30k/50k salary?' },
      desc: { th: 'สูตรแบ่งเงินเดือน 50/30/20 ปรับให้เข้ากับค่าครองชีพไทย เก็บเท่าไหร่ถึงพอ พร้อมตัวอย่างจริงทุกช่วงเงินเดือน', en: 'The 50/30/20 split adapted to Thai cost of living, with real examples for every salary band.' },
      tool: 'budget-planner.html',
      tags: ['budgeting', 'cashflow'], series: { id: 'foundations', order: 4 }
    },
    {
      slug: 'emergency-fund-guide.html',
      pillar: 'foundation', emoji: '🛟', date: '2026-06-11', readMin: 6,
      thumb: 'thumbs/emergency-fund-guide.svg',
      title: { th: 'เงินสำรองฉุกเฉินควรมีเท่าไหร่? (3-6 เดือน เก็บที่ไหนดี)', en: 'How big should your emergency fund be?' },
      desc: { th: 'ทำไมต้องมีเงินสำรอง 3-6 เดือน ฟรีแลนซ์ต้องมีเท่าไหร่ เก็บที่ไหนให้สภาพคล่องดีและไม่หาย', en: 'Why 3-6 months, how much freelancers need, and where to park it for liquidity and safety.' },
      tool: 'emergency-fund.html',
      tags: ['cashflow', 'budgeting'], series: { id: 'foundations', order: 5 }
    },
    {
      slug: 'compound-interest-power.html',
      pillar: 'invest', emoji: '📈', date: '2026-06-11', readMin: 7,
      thumb: 'thumbs/compound-interest-power.svg',
      title: { th: 'พลังดอกเบี้ยทบต้น: เริ่มเร็ว 5 ปี ปลายทางต่างกันล้าน', en: 'The power of compounding: why starting 5 years earlier matters' },
      desc: { th: 'ดอกเบี้ยทบต้นทำงานยังไง ทำไมเวลาสำคัญกว่าจำนวนเงิน และทำไมค่าธรรมเนียม 1% กินเงินคุณมหาศาล', en: 'How compounding works, why time beats amount, and why a 1% fee quietly costs a fortune.' },
      tool: 'compound-dca.html',
      tags: ['compounding', 'investing-start', 'timing']
    },
    {
      slug: 'debt-snowball-avalanche.html',
      pillar: 'debt', emoji: '⛓️', date: '2026-06-11', readMin: 7,
      thumb: 'thumbs/debt-snowball-avalanche.svg',
      title: { th: 'ปลดหนี้บัตรเครดิตวิธีไหนดี? Snowball vs Avalanche', en: 'Snowball vs avalanche: the smartest way to pay off debt' },
      desc: { th: 'เทียบ 2 วิธีปลดหนี้ยอดนิยม วิธีไหนประหยัดดอกเบี้ย วิธีไหนชนะใจ และทำไมจ่ายขั้นต่ำคือกับดัก', en: 'Compare the two popular payoff methods, which saves more interest, and why minimum payments are a trap.' },
      tool: 'debt-payoff.html',
      tags: ['debt', 'behavior']
    }
  ];

  /* live list (starts static, may be replaced after DB load) */
  var LIST = STATIC_ARTICLES.slice();

  /* remember every render call so we can replay it when DB data lands */
  var RENDERED = [];

  /* one slug identity everywhere · strips .html so static + DB rows compare equal */
  function normSlug(s) { return String(s || '').replace(/\.html$/, ''); }

  function hrefFor(a) {
    if (a.dynamic) { return 'article.html?slug=' + encodeURIComponent(normSlug(a.slug)); }
    return a.slug;
  }

  function bySlug(slug) {
    var key = normSlug(slug);
    for (var i = 0; i < LIST.length; i++) {
      if (normSlug(LIST[i].slug) === key) { return LIST[i]; }
    }
    return null;
  }

  function fmtDate(d, lang) {
    /* d = 'YYYY-MM-DD' -> 'D MMM YY' */
    if (!d) { return ''; }
    var mTh = ['ม.ค.','ก.พ.','มี.ค.','เม.ย.','พ.ค.','มิ.ย.','ก.ค.','ส.ค.','ก.ย.','ต.ค.','พ.ย.','ธ.ค.'];
    var mEn = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var p = d.split('-');
    if (p.length < 3) { return ''; }
    var mi = parseInt(p[1], 10) - 1;
    if (mi < 0 || mi > 11) { return ''; }
    var yy = (lang === 'th') ? (parseInt(p[0], 10) + 543) % 100 : parseInt(p[0], 10) % 100;
    return parseInt(p[2], 10) + ' ' + (lang === 'th' ? mTh[mi] : mEn[mi]) + ' ' + yy;
  }

  function cardHTML(a, lang) {
    var p = PILLARS[a.pillar] || { th: '', en: '', badge: 'green' };
    var readTxt = lang === 'th' ? ('อ่าน ' + a.readMin + ' นาที') : (a.readMin + ' min read');
    var dateTxt = fmtDate(a.date, lang);
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
    html += '<div class="meta" style="font-size:12.5px;color:var(--muted);font-weight:600;">' + readTxt + (dateTxt ? (' · ' + dateTxt) : '') + '</div>';
    html += '<span class="link"><span class="lang-th">อ่านต่อ</span><span class="lang-en">Read</span> →</span>';
    html += '</div></a>';
    return html;
  }

  function matchesQuery(a, q, lang) {
    if (!q) { return true; }
    var hay = (a.title.th + ' ' + (a.title.en || '') + ' ' + a.desc.th + ' ' + (a.desc.en || '')).toLowerCase();
    var tg = a.tags || [];
    for (var i = 0; i < tg.length; i++) {
      var tl = TAGS[tg[i]];
      hay += ' ' + tg[i] + ' ' + (tl ? (tl.th + ' ' + tl.en) : '');
    }
    return hay.toLowerCase().indexOf(q.toLowerCase()) > -1;
  }

  function applyOpts(list, opts) {
    var out = list.filter(function (a) { return normSlug(a.slug) !== normSlug(opts.exclude); });
    if (opts.filterPillar && opts.filterPillar !== 'all') {
      out = out.filter(function (a) { return a.pillar === opts.filterPillar; });
    }
    if (opts.tag && opts.tag !== 'all') {
      out = out.filter(function (a) { return (a.tags || []).indexOf(opts.tag) > -1; });
    }
    if (opts.query) {
      var lang = (window.WC && window.WC.getLang) ? window.WC.getLang() : 'th';
      out = out.filter(function (a) { return matchesQuery(a, opts.query, lang); });
    }
    if (opts.sort === 'quick') {
      out = out.slice().sort(function (x, y) { return x.readMin - y.readMin; });
    } else if (opts.sort === 'newest' || !opts.sort) {
      out = out.slice().sort(function (x, y) { return (y.date || '').localeCompare(x.date || ''); });
    }
    if (opts.pillar) { /* soft-priority same pillar (legacy behavior) */
      var same = out.filter(function (a) { return a.pillar === opts.pillar; });
      var rest = out.filter(function (a) { return a.pillar !== opts.pillar; });
      out = same.concat(rest);
    }
    if (opts.limit) { out = out.slice(0, opts.limit); }
    return out;
  }

  function doRender(targetSel, opts) {
    opts = opts || {};
    var host = document.querySelector(targetSel);
    if (!host) { return; }
    var lang = (window.WC && window.WC.getLang) ? window.WC.getLang() : 'th';
    var list = applyOpts(LIST, opts);
    if (!list.length && opts.emptyHTML) { host.innerHTML = opts.emptyHTML; return; }
    var html = '';
    for (var i = 0; i < list.length; i++) { html += cardHTML(list[i], lang); }
    host.innerHTML = html;
  }

  function rerenderAll() {
    for (var i = 0; i < RENDERED.length; i++) {
      doRender(RENDERED[i].sel, RENDERED[i].opts);
    }
  }

  /* ---------- discovery helpers ---------- */

  function tagCounts() {
    var counts = {};
    for (var i = 0; i < LIST.length; i++) {
      var tg = LIST[i].tags || [];
      for (var j = 0; j < tg.length; j++) {
        counts[tg[j]] = (counts[tg[j]] || 0) + 1;
      }
    }
    var arr = [];
    for (var k in counts) {
      if (Object.prototype.hasOwnProperty.call(counts, k)) {
        arr.push({ tag: k, count: counts[k], label: TAGS[k] || { th: k, en: k } });
      }
    }
    arr.sort(function (a, b) { return b.count - a.count; });
    return arr;
  }

  function featuredList(n) {
    var out = LIST.filter(function (a) { return a.featured; });
    out.sort(function (x, y) { return (y.date || '').localeCompare(x.date || ''); });
    return n ? out.slice(0, n) : out;
  }

  function recentList(n) {
    var out = LIST.slice().sort(function (x, y) { return (y.date || '').localeCompare(x.date || ''); });
    return n ? out.slice(0, n) : out;
  }

  function startHere() {
    var out = [];
    for (var i = 0; i < START_HERE.length; i++) {
      var a = bySlug(START_HERE[i]);
      if (a) { out.push(a); }
    }
    return out;
  }

  function seriesList() {
    var out = [];
    for (var id in SERIES) {
      if (!Object.prototype.hasOwnProperty.call(SERIES, id)) { continue; }
      var s = SERIES[id];
      var items = [];
      for (var i = 0; i < s.order.length; i++) {
        var a = bySlug(s.order[i]);
        if (a) { items.push(a); }
      }
      if (items.length) { out.push({ id: id, th: s.th, en: s.en, level: s.level, items: items }); }
    }
    return out;
  }

  /* prev/next within an article's series */
  function seriesNav(slug) {
    var a = bySlug(slug);
    if (!a || !a.series || !SERIES[a.series.id]) { return null; }
    var s = SERIES[a.series.id];
    var order = s.order;
    var idx = -1;
    for (var i = 0; i < order.length; i++) { if (normSlug(order[i]) === normSlug(slug)) { idx = i; break; } }
    if (idx < 0) { return null; }
    return {
      id: a.series.id, th: s.th, en: s.en, pos: idx + 1, total: order.length,
      prev: idx > 0 ? bySlug(order[idx - 1]) : null,
      next: idx < order.length - 1 ? bySlug(order[idx + 1]) : null
    };
  }

  /* scored "read next" · related[] override first, then similarity, dedup + diversity */
  function recommend(slug, n) {
    n = n || 3;
    var cur = bySlug(slug);
    if (!cur) { return recentList(n); }
    var used = {};
    used[normSlug(slug)] = 1;
    var picks = [];
    var i, cand;

    /* 0 · skip the series prev/next (shown separately) so they don't repeat */
    var nav = seriesNav(slug);
    if (nav) {
      if (nav.prev) { used[normSlug(nav.prev.slug)] = 1; }
      if (nav.next) { used[normSlug(nav.next.slug)] = 1; }
    }

    /* 1 · editorial override */
    var rel = cur.related || [];
    for (i = 0; i < rel.length && picks.length < n; i++) {
      cand = bySlug(rel[i]);
      if (cand && !used[normSlug(cand.slug)]) { used[normSlug(cand.slug)] = 1; picks.push(cand); }
    }

    /* 2 · similarity score */
    var curTags = cur.tags || [];
    var scored = [];
    for (i = 0; i < LIST.length; i++) {
      cand = LIST[i];
      if (used[normSlug(cand.slug)]) { continue; }
      var s = 0, ct = cand.tags || [], j;
      for (j = 0; j < ct.length; j++) { if (curTags.indexOf(ct[j]) > -1) { s += 3; } }
      if (cand.series && cur.series && cand.series.id === cur.series.id) { s += 2; }
      if (cand.tool && cur.tool && cand.tool === cur.tool) { s += 2; }
      if (cand.pillar === cur.pillar) { s += 1; }
      if (s > 0) { scored.push({ a: cand, s: s }); }
    }
    /* tie-break: higher score, then newer -> variety, avoids always surfacing same hub */
    scored.sort(function (x, y) {
      if (y.s !== x.s) { return y.s - x.s; }
      return (y.a.date || '').localeCompare(x.a.date || '');
    });
    for (i = 0; i < scored.length && picks.length < n; i++) {
      if (!used[normSlug(scored[i].a.slug)]) { used[normSlug(scored[i].a.slug)] = 1; picks.push(scored[i].a); }
    }

    /* 3 · fallback fill · same pillar then recent */
    if (picks.length < n) {
      var fill = applyOpts(LIST, { pillar: cur.pillar, exclude: slug });
      for (i = 0; i < fill.length && picks.length < n; i++) {
        if (!used[normSlug(fill[i].slug)]) { used[normSlug(fill[i].slug)] = 1; picks.push(fill[i]); }
      }
    }
    return picks;
  }

  function renderCards(targetSel, arr) {
    var host = document.querySelector(targetSel);
    if (!host) { return; }
    var lang = (window.WC && window.WC.getLang) ? window.WC.getLang() : 'th';
    var html = '';
    for (var i = 0; i < arr.length; i++) { html += cardHTML(arr[i], lang); }
    host.innerHTML = html;
  }

  /* escape text coming from the DB before it enters card innerHTML */
  function esc(s) {
    return String(s || '')
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function toArr(v) {
    if (!v) { return []; }
    if (Object.prototype.toString.call(v) === '[object Array]') { return v; }
    if (typeof v === 'string') { try { var p = JSON.parse(v); return toArr(p); } catch (e) { return []; } }
    return [];
  }

  function mergeDb(rows) {
    if (!rows || !rows.length) { return; }
    var byKey = {};
    var i;
    for (i = 0; i < STATIC_ARTICLES.length; i++) {
      byKey[normSlug(STATIC_ARTICLES[i].slug)] = STATIC_ARTICLES[i];
    }
    var merged = STATIC_ARTICLES.slice();
    for (i = 0; i < rows.length; i++) {
      var r = rows[i];
      var key = normSlug(r.slug);
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
        tool: r.tool_slug || null,
        tags: toArr(r.tags),
        series: (r.series && r.series.id) ? { id: esc(r.series.id), order: r.series.order || 0 } : null,
        featured: !!r.featured,
        related: toArr(r.related)
      };
      var existing = byKey[key];
      if (existing) {
        /* DB overrides display + learning-hub fields; keep static href */
        existing.title = entry.title;
        existing.desc = entry.desc;
        existing.emoji = entry.emoji;
        existing.readMin = entry.readMin;
        if (entry.thumb) { existing.thumb = entry.thumb; }
        if (entry.tags.length) { existing.tags = entry.tags; }
        if (entry.series) { existing.series = entry.series; }
        if (entry.related.length) { existing.related = entry.related; }
        if (r.featured != null) { existing.featured = entry.featured; }
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

  window.ARTICLES = LIST; /* legacy reference */
  window.ARTICLE_PILLARS = PILLARS;

  window.WC_articles = {
    list: function () { return LIST.slice(); },
    pillars: PILLARS,
    tags: TAGS,
    series: SERIES,
    hrefFor: hrefFor,
    bySlug: bySlug,
    normSlug: normSlug,
    fmtDate: fmtDate,
    tagCounts: tagCounts,
    featured: featuredList,
    recent: recentList,
    startHere: startHere,
    seriesList: seriesList,
    seriesNav: seriesNav,
    recommend: recommend,
    renderCards: renderCards,
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
