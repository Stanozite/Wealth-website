/* ============================================================
   Wealth Compass · shared navigation (inject into first <nav>)
   Edit link list here once → all pages update.
   ============================================================ */
(function () {
  'use strict';

  var LINKS = [
    { href: 'index.html', th: 'หน้าแรก', en: 'Home' },
    { href: 'index.html#tools', th: 'เครื่องมือทั้งหมด', en: 'All tools' },
    { href: 'snapshot.html', th: 'ภาพรวมการเงิน', en: 'My Snapshot' },
    { href: 'blog.html', th: 'ความรู้', en: 'Learn' },
    { href: 'services.html', th: 'บริการ', en: 'Services' }
  ];

  function currentPage() {
    var p = window.location.pathname.split('/').pop() || 'index.html';
    return p === '' ? 'index.html' : p;
  }

  function build() {
    var nav = document.querySelector('nav');
    if (!nav) { return; }
    var B = window.BRAND || { product: { th: 'Wealth Compass', en: 'Wealth Compass' }, mark: 'W' };
    var page = currentPage();

    var html = '';
    html += '<div class="nav-wrap"><div class="nav-inner">';
    html += '<a class="nav-brand" href="index.html" aria-label="' + B.product.en + ' home">';
    html += '<span class="mark" aria-hidden="true">' + B.mark + '</span>';
    html += '<span>' + B.product.en + '</span></a>';
    html += '<ul class="nav-links">';
    for (var i = 0; i < LINKS.length; i++) {
      var active = (LINKS[i].href.split('#')[0] === page && LINKS[i].href.indexOf('#') === -1) ? ' class="active"' : '';
      html += '<li><a href="' + LINKS[i].href + '"' + active + '>';
      html += '<span class="lang-th">' + LINKS[i].th + '</span><span class="lang-en">' + LINKS[i].en + '</span>';
      html += '</a></li>';
    }
    html += '</ul>';
    html += '<div class="lang-toggle" role="group" aria-label="Language">';
    html += '<button type="button" data-lang="th">ไทย</button>';
    html += '<button type="button" data-lang="en">EN</button>';
    html += '</div>';
    html += '<a class="btn btn-primary btn-sm nav-cta" href="index.html#consult">';
    html += '<span class="lang-th">นัดปรึกษา</span><span class="lang-en">Book a consult</span></a>';
    html += '<button class="hamburger" type="button" aria-label="Open menu" aria-expanded="false"><span></span><span></span><span></span></button>';
    html += '</div>';
    html += '<div class="mobile-menu" id="wc-mobile-menu">';
    for (var j = 0; j < LINKS.length; j++) {
      html += '<a href="' + LINKS[j].href + '"><span class="lang-th">' + LINKS[j].th + '</span><span class="lang-en">' + LINKS[j].en + '</span></a>';
    }
    html += '<a href="index.html#consult" style="color:var(--positive);font-weight:800;"><span class="lang-th">นัดปรึกษาฟรี</span><span class="lang-en">Book a free consult</span></a>';
    html += '</div></div>';

    nav.innerHTML = html;
    nav.setAttribute('role', 'navigation');
    nav.setAttribute('aria-label', 'Main navigation');

    /* language toggle */
    var btns = nav.querySelectorAll('.lang-toggle button');
    for (var k = 0; k < btns.length; k++) {
      (function (btn) {
        btn.addEventListener('click', function () {
          if (window.WC) { window.WC.setLang(btn.getAttribute('data-lang')); }
        });
      })(btns[k]);
    }
    /* sync initial toggle state */
    if (window.WC) { window.WC.setLang(window.WC.getLang()); }

    /* hamburger */
    var burger = nav.querySelector('.hamburger');
    var menu = nav.querySelector('.mobile-menu');
    if (burger && menu) {
      burger.addEventListener('click', function () {
        var open = menu.classList.toggle('open');
        burger.setAttribute('aria-expanded', open ? 'true' : 'false');
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else { build(); }
})();
