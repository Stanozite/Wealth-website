/* ============================================================
   Wealth Compass · shared footer (inject into first <footer>)
   ============================================================ */
(function () {
  'use strict';

  var TOOL_COLS = [
    {
      th: 'เริ่มต้น', en: 'Get started',
      links: [
        { href: 'financial-health-score.html', th: 'เช็คสุขภาพการเงิน', en: 'Financial health score' },
        { href: 'budget-planner.html', th: 'วางแผนงบประมาณ', en: 'Budget planner' },
        { href: 'emergency-fund.html', th: 'เงินสำรองฉุกเฉิน', en: 'Emergency fund' },
        { href: 'net-worth.html', th: 'ความมั่งคั่งสุทธิ', en: 'Net worth' }
      ]
    },
    {
      th: 'ลงทุน & ภาษี', en: 'Invest & tax',
      links: [
        { href: 'risk-profile.html', th: 'แบบประเมินความเสี่ยง', en: 'Risk profile' },
        { href: 'compound-dca.html', th: 'ดอกเบี้ยทบต้น & DCA', en: 'Compound & DCA' },
        { href: 'tax-calculator.html', th: 'คำนวณภาษี', en: 'Tax calculator' },
        { href: 'tax-deduction-optimizer.html', th: 'วางแผนลดหย่อน', en: 'Deduction optimizer' }
      ]
    },
    {
      th: 'อนาคต & ปกป้อง', en: 'Future & protect',
      links: [
        { href: 'retirement-simulator.html', th: 'จำลองแผนเกษียณ', en: 'Retirement simulator' },
        { href: 'debt-payoff.html', th: 'ปลดหนี้', en: 'Debt payoff' },
        { href: 'insurance-needs.html', th: 'ทุนประกันที่ควรมี', en: 'Insurance needs' },
        { href: 'snapshot.html', th: 'ภาพรวมการเงิน', en: 'My Snapshot' },
        { href: 'services.html', th: 'บริการ', en: 'Services' },
        { href: 'blog.html', th: 'ความรู้การเงิน', en: 'Learn' },
        { href: 'index.html#consult', th: 'นัดปรึกษา', en: 'Book a consult' }
      ]
    }
  ];

  function build() {
    var footer = document.querySelector('footer');
    if (!footer) { return; }
    var B = window.BRAND || {};
    var year = new Date().getFullYear();

    var html = '<div class="site-footer"><div class="inner"><div class="cols">';
    html += '<div>';
    html += '<div class="brand-line">' + ((B.product && B.product.en) || 'Wealth Compass') + '</div>';
    html += '<p style="font-size:14px;line-height:1.7;">';
    html += '<span class="lang-th">' + ((B.tagline && B.tagline.th) || '') + '</span>';
    html += '<span class="lang-en">' + ((B.tagline && B.tagline.en) || '') + '</span></p>';
    html += '<p style="font-size:13px;margin-top:14px;color:rgba(255,255,255,0.55);">';
    html += '<span class="lang-th">โดย ' + ((B.firm && B.firm.th) || '') + '</span>';
    html += '<span class="lang-en">by ' + ((B.firm && B.firm.en) || '') + '</span></p>';
    html += '</div>';

    for (var c = 0; c < TOOL_COLS.length; c++) {
      var col = TOOL_COLS[c];
      html += '<div><h4><span class="lang-th">' + col.th + '</span><span class="lang-en">' + col.en + '</span></h4>';
      for (var i = 0; i < col.links.length; i++) {
        var l = col.links[i];
        html += '<a href="' + l.href + '"><span class="lang-th">' + l.th + '</span><span class="lang-en">' + l.en + '</span></a>';
      }
      html += '</div>';
    }
    html += '</div>'; /* cols */

    html += '<div class="legal">';
    html += '<div>© ' + year + ' ' + ((B.firm && B.firm.en) || 'Wealth Compass') + '. ';
    html += '<span class="lang-th">สงวนลิขสิทธิ์</span><span class="lang-en">All rights reserved.</span></div>';
    html += '<div><span class="lang-th">เครื่องมือนี้ให้ข้อมูลเพื่อการศึกษา ไม่ใช่คำแนะนำการลงทุนรายบุคคล</span>';
    html += '<span class="lang-en">Tools are for education · not personalized investment advice.</span></div>';
    html += '</div>';
    html += '</div></div>';

    footer.innerHTML = html;
    footer.setAttribute('role', 'contentinfo');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else { build(); }
})();
