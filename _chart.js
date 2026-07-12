/* ============================================================
   Wealth Compass · _chart.js — reusable inline-SVG chart engine
   For the evergreen investing-truth article library. Built once,
   reused by every chart-heavy story. No external libs (CSP-safe:
   inline SVG only). var + string concat only.

   Every chart ships with a SOURCE attribution line + a small brand
   watermark baked in, so charts travel with credit ("recreate,
   don't repost"). Colours come from the house theme.

   API — each returns the SVG markup and (if target given) injects it:
     WC_CHART.line(target, opts)
     WC_CHART.area(target, opts)      // line(s) with filled area under the first
     WC_CHART.bars(target, opts)
     WC_CHART.quilt(target, opts)     // returns-quilt grid (B1)
     WC_CHART.fmt.baht|usd|pct|mult|comma|compact

   Common opts: {
     series:[{name, color, values:[...], dash:false}],  // values align to xLabels
     xLabels:[...], title, source, note,
     yFmt:'comma'|'pct'|'mult'|'baht'|'usd'|fn, yMin, yMax,
     height (default 300), highlightLast:false
   }
   ============================================================ */
(function () {
  'use strict';

  /* house palette — reuses pillar badge hues so charts match the site */
  var PALETTE = ['#163300', '#2f6db0', '#b45309', '#a8200d', '#6a4c93', '#2e6e6a', '#5d7079'];
  var INK = '#163300', GRID = '#e6ebe4', AXIS = '#8a97a0', MUTED = '#5b6b63', BRIGHT = '#9fe870';

  var W = 700, PADL = 62, PADR = 20, PADT = 40, PADB = 58; /* viewBox width fixed; height variable */

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* ---------- number formatters ---------- */
  function comma(n) {
    var s = (Math.round(n * 100) / 100).toString().split('.');
    s[0] = s[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return s.join('.');
  }
  function compact(n) {
    var a = Math.abs(n);
    if (a >= 1e12) { return (n / 1e12).toFixed(1) + 'T'; }
    if (a >= 1e9) { return (n / 1e9).toFixed(1) + 'B'; }
    if (a >= 1e6) { return (n / 1e6).toFixed(1) + 'M'; }
    if (a >= 1e3) { return (n / 1e3).toFixed(0) + 'K'; }
    return comma(n);
  }
  var fmt = {
    comma: comma, compact: compact,
    baht: function (n) { return '฿' + compact(n); },
    usd: function (n) { return '$' + compact(n); },
    pct: function (n) { return (Math.round(n * 10) / 10) + '%'; },
    mult: function (n) { return comma(n) + '×'; },
    plain: function (n) { return comma(n); }
  };
  function resolveFmt(y) {
    if (typeof y === 'function') { return y; }
    return fmt[y] || fmt.comma;
  }

  /* ---------- scale helpers ---------- */
  function niceBounds(min, max) {
    if (min === max) { max = min + 1; }
    var range = max - min, step = Math.pow(10, Math.floor(Math.log(range / 4) / Math.LN10));
    var err = (range / 4) / step;
    if (err >= 7.5) { step *= 10; } else if (err >= 3) { step *= 5; } else if (err >= 1.5) { step *= 2; }
    var lo = Math.floor(min / step) * step, hi = Math.ceil(max / step) * step;
    var ticks = [], v;
    for (v = lo; v <= hi + step / 2; v += step) { ticks.push(v); }
    return { lo: lo, hi: hi, ticks: ticks };
  }

  /* ---------- shared frame: title, axes, legend, source, watermark ---------- */
  function frame(o, plotFn, extra) {
    var H = o.height || 300;
    var innerW = W - PADL - PADR, innerH = H - PADT - PADB;
    var yf = resolveFmt(o.yFmt);
    var series = o.series || [];
    var xLabels = o.xLabels || [];

    /* y bounds from data unless given */
    var lo = o.yMin, hi = o.yMax, i, j;
    if (lo == null || hi == null) {
      var mn = Infinity, mx = -Infinity;
      for (i = 0; i < series.length; i++) {
        for (j = 0; j < series[i].values.length; j++) {
          var vv = series[i].values[j];
          if (vv == null) { continue; }
          if (vv < mn) { mn = vv; } if (vv > mx) { mx = vv; }
        }
      }
      if (extra && extra.forceZero) { mn = Math.min(mn, 0); }
      var nb = niceBounds(mn, mx);
      if (lo == null) { lo = nb.lo; } if (hi == null) { hi = nb.hi; }
    }
    var nbT = niceBounds(lo, hi); var ticks = nbT.ticks; lo = nbT.lo; hi = nbT.hi;

    function xAt(idx, count) { return PADL + (count <= 1 ? innerW / 2 : innerW * idx / (count - 1)); }
    function yAt(v) { return PADT + innerH - innerH * (v - lo) / (hi - lo); }
    function xBand(idx, count) { return PADL + innerW * (idx + 0.5) / count; }

    var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(o.title || 'chart') +
      '" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;font-family:\'IBM Plex Sans Thai\',sans-serif;">';
    svg += '<rect x="0" y="0" width="' + W + '" height="' + H + '" fill="#fbfdf9"/>';

    /* title */
    if (o.title) {
      svg += '<text x="' + PADL + '" y="24" font-size="15" font-weight="700" fill="' + INK + '">' + esc(o.title) + '</text>';
    }

    /* y gridlines + labels */
    for (i = 0; i < ticks.length; i++) {
      var ty = yAt(ticks[i]);
      svg += '<line x1="' + PADL + '" y1="' + ty + '" x2="' + (W - PADR) + '" y2="' + ty + '" stroke="' + GRID + '" stroke-width="1"/>';
      svg += '<text x="' + (PADL - 8) + '" y="' + (ty + 4) + '" font-size="11" fill="' + MUTED + '" text-anchor="end">' + esc(yf(ticks[i])) + '</text>';
    }
    /* x labels (thinned to ~8 max) */
    var xc = xLabels.length, everyX = Math.ceil(xc / 8) || 1;
    for (i = 0; i < xc; i++) {
      if (i % everyX !== 0 && i !== xc - 1) { continue; }
      var xx = (extra && extra.band) ? xBand(i, xc) : xAt(i, xc);
      svg += '<text x="' + xx + '" y="' + (H - PADB + 18) + '" font-size="11" fill="' + MUTED + '" text-anchor="middle">' + esc(xLabels[i]) + '</text>';
    }
    /* axis baseline */
    svg += '<line x1="' + PADL + '" y1="' + (PADT + innerH) + '" x2="' + (W - PADR) + '" y2="' + (PADT + innerH) + '" stroke="' + AXIS + '" stroke-width="1.5"/>';

    /* plot body */
    svg += plotFn({ xAt: xAt, yAt: yAt, xBand: xBand, innerW: innerW, innerH: innerH, lo: lo, hi: hi, yf: yf });

    /* legend */
    if (series.length > 1 || (series[0] && series[0].name)) {
      var lx = PADL, ly = H - 14;
      for (i = 0; i < series.length; i++) {
        var col = series[i].color || PALETTE[i % PALETTE.length];
        var lbl = series[i].name || ('Series ' + (i + 1));
        svg += '<rect x="' + lx + '" y="' + (ly - 8) + '" width="14" height="4" rx="2" fill="' + col + '"/>';
        svg += '<text x="' + (lx + 20) + '" y="' + (ly - 3) + '" font-size="11.5" fill="' + INK + '" font-weight="600">' + esc(lbl) + '</text>';
        lx += 20 + (lbl.length * 7.2) + 22;
      }
    }

    /* source attribution + brand watermark (baked in — charts travel with credit) */
    if (o.source) {
      svg += '<text x="' + PADL + '" y="' + (H - 2) + '" font-size="9.5" fill="' + MUTED + '">' + esc('ที่มา: ' + o.source) + '</text>';
    }
    svg += '<text x="' + (W - PADR) + '" y="' + (H - 2) + '" font-size="9.5" fill="' + MUTED + '" text-anchor="end" opacity="0.8">wealthcompass</text>';

    svg += '</svg>';
    return svg;
  }

  function pointsStr(vals, ctx, count) {
    var p = '', i;
    for (i = 0; i < vals.length; i++) {
      if (vals[i] == null) { continue; }
      p += (p ? ' ' : '') + ctx.xAt(i, count).toFixed(1) + ',' + ctx.yAt(vals[i]).toFixed(1);
    }
    return p;
  }

  /* ---------- LINE ---------- */
  function line(target, o) {
    var svg = frame(o, function (ctx) {
      var s = '', i, series = o.series, count = (o.xLabels || []).length || (series[0] ? series[0].values.length : 0);
      for (i = 0; i < series.length; i++) {
        var col = series[i].color || PALETTE[i % PALETTE.length];
        var dash = series[i].dash ? ' stroke-dasharray="6 5"' : '';
        s += '<polyline points="' + pointsStr(series[i].values, ctx, count) + '" fill="none" stroke="' + col +
          '" stroke-width="' + (series[i].width || 2.5) + '" stroke-linejoin="round" stroke-linecap="round"' + dash + '/>';
        if (o.highlightLast && series[i].values.length) {
          var lv = series[i].values[series[i].values.length - 1];
          s += '<circle cx="' + ctx.xAt(series[i].values.length - 1, count).toFixed(1) + '" cy="' + ctx.yAt(lv).toFixed(1) +
            '" r="4" fill="' + col + '"/>';
        }
      }
      return s;
    });
    return inject(target, svg);
  }

  /* ---------- AREA (fills under first series) ---------- */
  function area(target, o) {
    var svg = frame(o, function (ctx) {
      var s = '', i, series = o.series, count = (o.xLabels || []).length || series[0].values.length;
      var first = series[0], base = ctx.yAt(ctx.lo);
      var pts = pointsStr(first.values, ctx, count);
      var firstX = ctx.xAt(0, count).toFixed(1), lastX = ctx.xAt(first.values.length - 1, count).toFixed(1);
      s += '<polygon points="' + firstX + ',' + base + ' ' + pts + ' ' + lastX + ',' + base + '" fill="' + BRIGHT + '" fill-opacity="0.18"/>';
      for (i = 0; i < series.length; i++) {
        var col = series[i].color || PALETTE[i % PALETTE.length];
        var dash = series[i].dash ? ' stroke-dasharray="6 5"' : '';
        s += '<polyline points="' + pointsStr(series[i].values, ctx, count) + '" fill="none" stroke="' + col +
          '" stroke-width="' + (series[i].width || 2.5) + '" stroke-linejoin="round"' + dash + '/>';
      }
      return s;
    });
    return inject(target, svg);
  }

  /* ---------- BARS (single series, or grouped) ---------- */
  function bars(target, o) {
    var svg = frame(o, function (ctx) {
      var s = '', i, k, series = o.series, count = (o.xLabels || []).length;
      var groupW = ctx.innerW / count, gap = groupW * 0.28, barW = (groupW - gap) / series.length;
      for (i = 0; i < count; i++) {
        for (k = 0; k < series.length; k++) {
          var v = series[k].values[i]; if (v == null) { continue; }
          var col = series[k].color || PALETTE[k % PALETTE.length];
          var x = PADL + groupW * i + gap / 2 + barW * k;
          var y = ctx.yAt(Math.max(v, ctx.lo)), y0 = ctx.yAt(Math.max(ctx.lo, 0));
          var top = Math.min(y, y0), h = Math.abs(y - y0);
          s += '<rect x="' + x.toFixed(1) + '" y="' + top.toFixed(1) + '" width="' + (barW - 2).toFixed(1) +
            '" height="' + h.toFixed(1) + '" rx="2" fill="' + col + '"/>';
        }
      }
      return s;
    }, { band: true, forceZero: true });
    return inject(target, svg);
  }

  /* ---------- QUILT (returns rotate — colored grid, B1) ---------- */
  /* opts: { cols:[year labels], rows:[{name}], data:[[{label,rank}]] per col ], height } */
  function quilt(target, o) {
    var H = o.height || 320, cols = o.cols || [], rowsN = o.rows || 8;
    var padL = 8, padT = o.title ? 34 : 8, padB = 26, padR = 8;
    var innerW = W - padL - padR, innerH = H - padT - padB;
    var cw = innerW / cols.length, ch = innerH / rowsN;
    /* rank → colour (best green → worst clay) */
    var scale = ['#1f7a3f', '#4e9a4e', '#8bbf5c', '#c9d98a', '#e8d3a0', '#e0a86b', '#cf7a53', '#a8200d'];
    var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="' + esc(o.title || 'quilt') +
      '" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:auto;font-family:\'IBM Plex Sans Thai\',sans-serif;">';
    svg += '<rect width="' + W + '" height="' + H + '" fill="#fbfdf9"/>';
    if (o.title) { svg += '<text x="' + padL + '" y="22" font-size="15" font-weight="700" fill="' + INK + '">' + esc(o.title) + '</text>'; }
    var c, r;
    for (c = 0; c < cols.length; c++) {
      var colData = o.data[c] || [];
      for (r = 0; r < colData.length && r < rowsN; r++) {
        var cell = colData[r];
        var x = padL + cw * c, y = padT + ch * r;
        var col = scale[Math.min(cell.rank == null ? r : cell.rank, scale.length - 1)];
        svg += '<rect x="' + (x + 1).toFixed(1) + '" y="' + (y + 1).toFixed(1) + '" width="' + (cw - 2).toFixed(1) +
          '" height="' + (ch - 2).toFixed(1) + '" rx="2" fill="' + col + '"/>';
        if (ch > 16 && cw > 34) {
          svg += '<text x="' + (x + cw / 2).toFixed(1) + '" y="' + (y + ch / 2 + 3.5).toFixed(1) +
            '" font-size="9.5" fill="#fff" text-anchor="middle" font-weight="600">' + esc(cell.label) + '</text>';
        }
      }
      svg += '<text x="' + (padL + cw * c + cw / 2).toFixed(1) + '" y="' + (H - 10) + '" font-size="10" fill="' + MUTED +
        '" text-anchor="middle">' + esc(cols[c]) + '</text>';
    }
    if (o.source) { svg += '<text x="' + padL + '" y="' + (H - 1) + '" font-size="9" fill="' + MUTED + '">' + esc('ที่มา: ' + o.source) + '</text>'; }
    svg += '<text x="' + (W - padR) + '" y="' + (H - 1) + '" font-size="9" fill="' + MUTED + '" text-anchor="end" opacity="0.8">wealthcompass</text>';
    svg += '</svg>';
    return inject(target, svg);
  }

  function inject(target, svg) {
    if (target) {
      var host = (typeof target === 'string') ? document.querySelector(target) : target;
      if (host) { host.innerHTML = svg; }
    }
    return svg;
  }

  window.WC_CHART = { line: line, area: area, bars: bars, quilt: quilt, fmt: fmt, palette: PALETTE };
})();
