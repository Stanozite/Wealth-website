/* ============================================================
   Wealth Compass · shared app helpers (window.WC)
   i18n toggle (CSS-driven .lang-th/.lang-en), number formatting,
   reveal-on-scroll, lead form handler.
   Compatibility: var + string concat only (per playbook §8.8).
   ============================================================ */
(function () {
  'use strict';

  var LANG_KEY = 'wc_lang';

  function getLang() {
    try { return localStorage.getItem(LANG_KEY) || 'th'; } catch (e) { return 'th'; }
  }

  function setLang(lang) {
    document.documentElement.setAttribute('lang', lang);
    try { localStorage.setItem(LANG_KEY, lang); } catch (e) {}
    // update all toggle buttons
    var btns = document.querySelectorAll('.lang-toggle button');
    for (var i = 0; i < btns.length; i++) {
      var on = btns[i].getAttribute('data-lang') === lang;
      if (on) { btns[i].classList.add('on'); } else { btns[i].classList.remove('on'); }
    }
    // let pages re-render dynamic text
    try { window.dispatchEvent(new CustomEvent('wc:lang', { detail: { lang: lang } })); } catch (e) {}
  }

  /* number formatting · Thai baht, tabular */
  function fmt(n, decimals) {
    if (n === null || n === undefined || isNaN(n)) { return '–'; }
    var d = (decimals === undefined) ? 0 : decimals;
    return Number(n).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
  }
  function fmtBaht(n, decimals) { return '฿' + fmt(n, decimals); }
  function fmtPct(n, decimals) {
    var d = (decimals === undefined) ? 1 : decimals;
    return fmt(n, d) + '%';
  }
  /* parse "1,500,000" → 1500000 */
  function parseNum(v) {
    if (typeof v === 'number') { return v; }
    var s = String(v || '').replace(/[,฿\s]/g, '');
    var n = parseFloat(s);
    return isNaN(n) ? 0 : n;
  }
  /* live thousand-separator on text inputs with data-num */
  function bindNumInputs(scope) {
    var els = (scope || document).querySelectorAll('input[data-num]');
    for (var i = 0; i < els.length; i++) {
      (function (el) {
        el.addEventListener('input', function () {
          var raw = parseNum(el.value);
          var caretFromEnd = el.value.length - (el.selectionStart || 0);
          el.value = raw === 0 && el.value !== '0' ? el.value.replace(/[^0-9.]/g, '') : fmt(raw);
          var pos = Math.max(0, el.value.length - caretFromEnd);
          try { el.setSelectionRange(pos, pos); } catch (e) {}
        });
      })(els[i]);
    }
  }

  /* reveal on scroll */
  function initReveal() {
    var els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      for (var i = 0; i < els.length; i++) { els[i].classList.add('visible'); }
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      for (var j = 0; j < entries.length; j++) {
        if (entries[j].isIntersecting) {
          entries[j].target.classList.add('visible');
          io.unobserve(entries[j].target);
        }
      }
    }, { threshold: 0.12 });
    for (var k = 0; k < els.length; k++) { io.observe(els[k]); }
  }

  /* ---------- shared profile (entered once, reused everywhere) ---------- */
  var PROFILE_KEY = 'wc_profile';
  function profileGet() {
    try { return JSON.parse(localStorage.getItem(PROFILE_KEY) || '{}') || {}; } catch (e) { return {}; }
  }
  function profileSet(patch) {
    var p = profileGet();
    for (var k in patch) { if (patch.hasOwnProperty(k) && patch[k] !== '' && patch[k] != null) { p[k] = patch[k]; } }
    try { localStorage.setItem(PROFILE_KEY, JSON.stringify(p)); } catch (e) {}
    return p;
  }

  /* ---------- findings store (each tool writes one; snapshot reads all) ----------
     schema per tool key:
       { tool, labelTh, labelEn, status:'good'|'warn'|'bad',
         headlineTh, headlineEn, monthlyClaim:Number, updated:isoString } */
  var FINDINGS_KEY = 'wc_findings';
  function getFindings() {
    try { return JSON.parse(localStorage.getItem(FINDINGS_KEY) || '{}') || {}; } catch (e) { return {}; }
  }
  function saveFinding(key, obj) {
    if (!key || !obj) { return; }
    var all = getFindings();
    obj.updated = new Date().toISOString();
    all[key] = obj;
    try { localStorage.setItem(FINDINGS_KEY, JSON.stringify(all)); } catch (e) {}
    try { window.dispatchEvent(new CustomEvent('wc:finding', { detail: { key: key } })); } catch (e) {}
  }

  /* ---------- PDPA consent: injected into every lead form, blocks submit ---------- */
  function ensureConsent(formEl) {
    if (formEl.querySelector('.consent-row')) { return formEl.querySelector('.consent-row input'); }
    var btn = formEl.querySelector('button[type="submit"], button:not([type])');
    var row = document.createElement('label');
    row.className = 'consent-row';
    row.innerHTML =
      '<input type="checkbox" name="consent" required/>' +
      '<span class="lang-th">ยินยอมให้เก็บชื่อและอีเมลเพื่อติดต่อกลับ ตาม ' +
        '<a href="privacy.html" target="_blank">นโยบายความเป็นส่วนตัว</a></span>' +
      '<span class="lang-en">I agree to store my name and email to be contacted, per the ' +
        '<a href="privacy.html" target="_blank">privacy policy</a>.</span>';
    if (btn) { formEl.insertBefore(row, btn); } else { formEl.appendChild(row); }
    return row.querySelector('input');
  }

  /* lead form → Formspree (or mailto fallback while not configured) */
  function bindLeadForm(formEl) {
    if (!formEl) { return; }
    var consent = ensureConsent(formEl);
    formEl.addEventListener('submit', function (ev) {
      ev.preventDefault();
      var ok = formEl.querySelector('.msg.ok');
      var err = formEl.querySelector('.msg.err');
      if (ok) { ok.classList.remove('show'); }
      if (err) { err.classList.remove('show'); }
      var endpoint = (window.BRAND && window.BRAND.formspree) || '';
      var data = new FormData(formEl);
      data.append('page', window.location.pathname);
      if (!endpoint) {
        // not configured yet · graceful: open mail client
        var email = (window.BRAND && window.BRAND.email) || '';
        var body = '';
        data.forEach && data.forEach(function (v, k) { body += k + ': ' + v + '%0D%0A'; });
        window.location.href = 'mailto:' + email + '?subject=Lead from Wealth Compass&body=' + body;
        if (ok) { ok.classList.add('show'); }
        return;
      }
      fetch(endpoint, { method: 'POST', body: data, headers: { 'Accept': 'application/json' } })
        .then(function (res) {
          if (res.ok) { formEl.reset(); if (ok) { ok.classList.add('show'); } }
          else if (err) { err.classList.add('show'); }
        })
        .catch(function () { if (err) { err.classList.add('show'); } });
    });
  }

  /* ---------- auto-persist tool inputs across navigation ----------
     every calculator remembers what you typed and restores it on return.
     EXCLUDES lead forms + admin (PII never auto-stored). */
  function persistInputs() {
    if (/admin/.test(location.pathname)) { return; }
    var key = 'wc_inputs_' + (location.pathname.replace(/[^a-z0-9]/gi, '_') || 'root');
    function skip(el) {
      var ty = (el.type || '').toLowerCase();
      if (!el.id) { return true; }
      if (ty === 'submit' || ty === 'button' || ty === 'file' || ty === 'password' || ty === 'hidden') { return true; }
      if (el.name === 'consent') { return true; }
      if (el.closest && el.closest('form[data-lead]')) { return true; }
      if (el.closest && el.closest('.lang-toggle')) { return true; }
      return false;
    }
    function fields() { return document.querySelectorAll('input[id], select[id], textarea[id]'); }
    /* restore */
    var saved;
    try { saved = JSON.parse(localStorage.getItem(key) || '{}'); } catch (e) { saved = {}; }
    var fs = fields(), el, i;
    for (i = 0; i < fs.length; i++) {
      el = fs[i];
      if (skip(el)) { continue; }
      if (!saved.hasOwnProperty(el.id)) { continue; }
      var ty = (el.type || '').toLowerCase();
      if (ty === 'checkbox' || ty === 'radio') { el.checked = !!saved[el.id]; }
      else { el.value = saved[el.id]; }
      try { el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); } catch (e) {}
    }
    /* save on any change */
    function save() {
      var data = {}, ff = fields(), e2, j, t2;
      for (j = 0; j < ff.length; j++) {
        e2 = ff[j];
        if (skip(e2)) { continue; }
        t2 = (e2.type || '').toLowerCase();
        data[e2.id] = (t2 === 'checkbox' || t2 === 'radio') ? e2.checked : e2.value;
      }
      try { localStorage.setItem(key, JSON.stringify(data)); } catch (e) {}
    }
    document.addEventListener('input', save, true);
    document.addEventListener('change', save, true);
  }

  /* boot */
  function init() {
    setLang(getLang());
    initReveal();
    bindNumInputs(document);
    persistInputs();
    var forms = document.querySelectorAll('form[data-lead]');
    for (var i = 0; i < forms.length; i++) { bindLeadForm(forms[i]); }
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }

  window.WC = {
    getLang: getLang, setLang: setLang,
    fmt: fmt, fmtBaht: fmtBaht, fmtPct: fmtPct, parseNum: parseNum,
    bindNumInputs: bindNumInputs,
    profile: { get: profileGet, set: profileSet },
    saveFinding: saveFinding, getFindings: getFindings
  };
})();
