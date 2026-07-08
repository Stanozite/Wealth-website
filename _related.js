/* ============================================================
   Wealth Compass · shared "read next" for every article page.
   ONE mechanism (replaces the old per-page inline #related script):
     - fills  #related  with WC_articles.recommend(current, 3)
     - inserts a series prev/next bar before the related section
       when the current article belongs to a series
   Current article = derived from the URL path (no per-page slug).
   Re-renders on language switch and when Supabase data arrives.
   var + string concat only · no eval (CSP-safe) · inline styles use theme vars.
   ============================================================ */
(function () {
  'use strict';

  function slugFromPath() {
    var p = (location.pathname.split('/').pop() || '');
    if (!p || p.indexOf('.html') < 0) {
      /* dynamic DB article: article.html?slug=xxx */
      var m = location.search.match(/[?&]slug=([^&]+)/);
      if (m) { return decodeURIComponent(m[1]).replace(/\.html$/, ''); }
    }
    return p.replace(/\.html$/, '');
  }

  function lang() { return (window.WC && window.WC.getLang) ? window.WC.getLang() : 'th'; }
  function t(th, en) { return '<span class="lang-th">' + th + '</span><span class="lang-en">' + en + '</span>'; }
  function ttl(a) { return lang() === 'th' ? a.title.th : (a.title.en || a.title.th); }

  function renderSeriesNav(A, slug) {
    var nav = A.seriesNav ? A.seriesNav(slug) : null;
    var host = document.querySelector('#series-nav');
    if (!nav) { if (host) { host.innerHTML = ''; } return; }
    if (!host) {
      var rel = document.querySelector('#related');
      if (!rel) { return; }
      var sec = (rel.closest ? rel.closest('section') : null);
      host = document.createElement('div');
      host.id = 'series-nav';
      if (sec && sec.parentNode) { sec.parentNode.insertBefore(host, sec); }
      else { rel.parentNode.insertBefore(host, rel); }
    }
    var box = 'background:var(--bright-soft);border:1px solid var(--bright-2);border-radius:14px;padding:14px 18px;';
    var lnk = 'color:var(--positive);font-weight:700;text-decoration:none;font-size:13.5px;max-width:48%;';
    var html = '<div class="container" style="padding-top:8px;padding-bottom:8px;"><div style="' + box + '">';
    html += '<div style="font-weight:700;color:var(--forest);font-size:14px;margin-bottom:10px;">📚 ' + t(nav.th, nav.en) + ' · ' + t('ตอนที่ ' + nav.pos + '/' + nav.total, 'Part ' + nav.pos + '/' + nav.total) + '</div>';
    html += '<div style="display:flex;justify-content:space-between;gap:14px;flex-wrap:wrap;">';
    html += nav.prev ? ('<a href="' + nav.prev.slug + '" style="' + lnk + '">← ' + t('ตอนก่อน', 'Previous') + ': ' + ttl(nav.prev) + '</a>') : '<span></span>';
    html += nav.next ? ('<a href="' + nav.next.slug + '" style="' + lnk + 'text-align:right;">' + t('ตอนต่อไป', 'Next') + ': ' + ttl(nav.next) + ' →</a>') : '<span></span>';
    html += '</div></div></div>';
    host.innerHTML = html;
  }

  function render() {
    var A = window.WC_articles;
    if (!A || !A.recommend) { return; }
    var slug = slugFromPath();
    renderSeriesNav(A, slug);
    if (document.querySelector('#related') && A.renderCards) {
      A.renderCards('#related', A.recommend(slug, 3));
    }
  }

  render();
  window.addEventListener('wc:lang', render);
  window.addEventListener('wc:articles', render);
})();
