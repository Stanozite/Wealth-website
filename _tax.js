/* ============================================================
   Wealth Compass · shared Thai personal income-tax engine (window.WC_TAX)
   Pure logic, no DOM. Year-keyed config so adding a future tax year
   = add one entry to TAX_YEARS.
   Compatibility: var + string concat only (per playbook §8.8).
   All rules reference ปีภาษี 2567 (Thai tax year 2024, B.E. 2567),
   source: Revenue Department (rd.go.th).
   ============================================================ */
(function () {
  'use strict';

  /* ---------- year-keyed config ---------- */
  /* ปีภาษี 2567 · progressive ladder 0–35%, [ceiling, rate] pairs.
     Each slice taxes only income within [previous ceiling, this ceiling]. */
  var TAX_YEARS = {
    2567: {
      brackets: [
        [150000, 0],      // ปีภาษี 2567: 0–150,000 ยกเว้น
        [300000, 0.05],   // ปีภาษี 2567: 150,001–300,000 → 5%
        [500000, 0.10],   // ปีภาษี 2567: 300,001–500,000 → 10%
        [750000, 0.15],   // ปีภาษี 2567: 500,001–750,000 → 15%
        [1000000, 0.20],  // ปีภาษี 2567: 750,001–1,000,000 → 20%
        [2000000, 0.25],  // ปีภาษี 2567: 1,000,001–2,000,000 → 25%
        [5000000, 0.30],  // ปีภาษี 2567: 2,000,001–5,000,000 → 30%
        [Infinity, 0.35]  // ปีภาษี 2567: เกิน 5,000,000 → 35%
      ],
      personalAllowance: 60000,  // ปีภาษี 2567: ค่าลดหย่อนส่วนตัว
      spouseAllowance: 60000,    // ปีภาษี 2567: คู่สมรสไม่มีเงินได้
      expenseRate: 0.5,          // ปีภาษี 2567: เงินเดือน 40(1)+(2) หักเหมา 50%
      expenseCap: 100000,        // ปีภาษี 2567: เพดานค่าใช้จ่าย 40(1)+(2) = 100,000
      ssoMax: 9000,              // ปีภาษี 2567: ประกันสังคมสูงสุด 9,000
      elderlyExempt: 190000      // ปีภาษี 2567: ยกเว้นเงินได้ผู้มีอายุ 65 ปีขึ้นไป 190,000
    }
  };

  /* resolve a year config; fall back to the only/first defined year */
  function cfg(year) {
    var c = TAX_YEARS[year];
    if (c) { return c; }
    // default to 2567 if an unknown year is requested
    return TAX_YEARS[2567];
  }

  /* ---------- progressive ladder ---------- */
  /* computeTax(netIncome, year) →
       { tax, marginalRate, effectiveRate, perBracket:[{floor,ceil,rate,taxable,tax}] }
     effectiveRate here = tax / netIncome (over the taxable base). */
  function computeTax(netIncome, year) {
    var c = cfg(year);
    var brackets = c.brackets;
    var net = netIncome > 0 ? netIncome : 0;
    var tax = 0;
    var marginalRate = 0;
    var perBracket = [];
    var floor = 0;
    for (var i = 0; i < brackets.length; i++) {
      var ceil = brackets[i][0];
      var rate = brackets[i][1];
      var taxable = Math.max(0, Math.min(net, ceil) - floor);
      var t = taxable * rate;
      tax += t;
      perBracket.push({ floor: floor, ceil: ceil, rate: rate, taxable: taxable, tax: t });
      if (net > floor) { marginalRate = rate; }
      floor = ceil;
    }
    return {
      tax: tax,
      marginalRate: marginalRate,
      effectiveRate: net > 0 ? tax / net : 0,
      perBracket: perBracket
    };
  }

  /* ---------- เหมา expense deduction by income category ---------- */
  /* expenseDeduction(amount, category, year) → baht of deduction.
     'category' is the Thai มาตรา 40 sub-type as a string.
     Rates per ปีภาษี 2567:
       40(1) salary, 40(2) commission/freelance-for-hire:
         50% combined, cap 100,000 (the cap is shared 40(1)+40(2) at the
         caller level; per-row this returns 50% capped 100,000).
       40(3) royalties/goodwill: 50%, cap 100,000.
       40(5) rental: เหมา 30% (or actual; we use เหมา 30% default).
       40(6) liberal professions (medicine/law/eng/arch/acct/fine-arts):
         medicine 60%, others 30% · liberal default 30% (note: doctor 60%).
       40(7) contractor (supplying both materials & labour): 60%.
       40(8) business/other: 60% default (เหมา rate varies by trade,
         60% is the common เหมา ceiling). */
  function expenseDeduction(amount, category, year) {
    var amt = amount > 0 ? amount : 0;
    var rate;
    switch (String(category)) {
      case '40(1)':
      case '40(2)':
        // ปีภาษี 2567: 50% cap 100,000 (shared cap handled by caller for combined 40(1)+(2))
        return Math.min(amt * 0.5, 100000);
      case '40(3)':
        // ปีภาษี 2567: royalties 50% cap 100,000
        return Math.min(amt * 0.5, 100000);
      case '40(5)':
        // ปีภาษี 2567: rental เหมา 30% (or actual · เหมา default here)
        rate = 0.30;
        return amt * rate;
      case '40(6)':
        // ปีภาษี 2567: liberal professions 30% default (medicine 60%)
        rate = 0.30;
        return amt * rate;
      case '40(7)':
        // ปีภาษี 2567: contractor 60%
        rate = 0.60;
        return amt * rate;
      case '40(8)':
        // ปีภาษี 2567: business/other 60% default
        rate = 0.60;
        return amt * rate;
      default:
        return 0;
    }
  }

  /* ---------- helper: floor of the next bracket above net ---------- */
  /* nextBracketFloor(net, year) → the ceiling of the bracket the net income
     currently sits in = the entry threshold of the NEXT bracket up.
     Returns Infinity if already in the top bracket. */
  function nextBracketFloor(net, year) {
    var c = cfg(year);
    var brackets = c.brackets;
    var n = net > 0 ? net : 0;
    for (var i = 0; i < brackets.length; i++) {
      var ceil = brackets[i][0];
      if (n < ceil) { return ceil; }
    }
    return Infinity;
  }

  /* idempotent export */
  window.WC_TAX = {
    TAX_YEARS: TAX_YEARS,
    computeTax: computeTax,
    expenseDeduction: expenseDeduction,
    nextBracketFloor: nextBracketFloor
  };
})();
