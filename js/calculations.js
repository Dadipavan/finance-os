/* ==========================================================================
   calculations.js — pure financial math + number formatting (no DOM)
   Every function documents its formula. Inputs are plain numbers; rates are
   annual percentages (10 = 10%) unless named otherwise.
   ========================================================================== */
window.FOS = window.FOS || {};
(function () {
  'use strict';
  const C = {};
  const num = (x) => (Number.isFinite(x) ? x : 0);
  const r2 = (x) => Math.round((num(x) + Number.EPSILON) * 100) / 100;

  /* ---------- formatting ---------- */
  const fmt = {
    num(n, d = 0) { if (!Number.isFinite(n)) return '—'; return n.toLocaleString('en-IN', { maximumFractionDigits: d, minimumFractionDigits: 0 }); },
    inr(n, d = 0) { if (!Number.isFinite(n)) return '—'; const s = Math.abs(n).toLocaleString('en-IN', { maximumFractionDigits: d, minimumFractionDigits: d }); return (n < 0 && Math.abs(n) >= Math.pow(10, -d) / 2 ? '-' : '') + '₹' + s; },
    // short: ₹1.25 Cr / ₹4.5 L / ₹12.3K
    short(n) {
      if (!Number.isFinite(n)) return '—';
      const a = Math.abs(n), s = n < 0 ? '-' : '';
      if (a >= 1e7) return s + '₹' + +(a / 1e7).toFixed(2) + ' Cr';
      if (a >= 1e5) return s + '₹' + +(a / 1e5).toFixed(2) + ' L';
      if (a >= 1e3) return s + '₹' + +(a / 1e3).toFixed(1) + 'K';
      return s + '₹' + Math.round(a);
    },
    pct(n, d = 1) { return Number.isFinite(n) ? n.toLocaleString('en-IN', { maximumFractionDigits: d }) + '%' : '—'; },
    months(m) { if (!Number.isFinite(m)) return '—'; const y = Math.floor(m / 12), mo = Math.round(m % 12); return (y ? y + ' yr ' : '') + (mo || !y ? mo + ' mo' : '').trim(); },
    years(y) { return Number.isFinite(y) ? +y.toFixed(1) + ' yrs' : '—'; },
    date(d) { try { return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); } catch (e) { return '—'; } }
  };

  /* ---------- basic time value ---------- */
  // I = P × r × t
  C.simpleInterest = (P, r, t) => (P * r * t) / 100;
  // A = P (1 + r/n)^(n t)
  C.compound = (P, r, n, t) => P * Math.pow(1 + r / 100 / n, n * t);
  // Future cost = cost × (1+i)^t
  C.futureCost = (c, inf, yrs) => c * Math.pow(1 + inf / 100, yrs);
  // Today's value of a future amount: A / (1+i)^t
  C.deflate = (a, inf, yrs) => a / Math.pow(1 + inf / 100, yrs);
  C.fv = (pv, r, yrs) => pv * Math.pow(1 + r / 100, yrs);
  C.pv = (fv, r, yrs) => fv / Math.pow(1 + r / 100, yrs);
  // CAGR = (End/Start)^(1/t) − 1
  C.cagr = (s, e, t) => (s > 0 && t > 0 && e >= 0 ? (Math.pow(e / s, 1 / t) - 1) * 100 : NaN);

  /* ---------- SIP / lumpsum ---------- */
  // Annuity-due FV: P × ((1+i)^n − 1)/i × (1+i), i = r/12. Optional annual step-up.
  C.sipFV = function (monthly, annualRate, months, stepUpPct = 0) {
    const i = annualRate / 1200;
    let bal = 0, p = monthly;
    for (let m = 1; m <= months; m++) {
      if (m > 1 && (m - 1) % 12 === 0) p *= 1 + stepUpPct / 100;
      bal = (bal + p) * (1 + i);
    }
    return bal;
  };
  C.sipSeries = function (monthly, annualRate, years, stepUpPct = 0, lump = 0) {
    const out = [{ x: 0, invested: lump, value: lump }];
    const i = annualRate / 1200;
    let bal = lump, inv = lump, p = monthly;
    for (let m = 1; m <= Math.round(years * 12); m++) {
      if (m > 1 && (m - 1) % 12 === 0) p *= 1 + stepUpPct / 100;
      bal = (bal + p) * (1 + i); inv += p;
      if (m % 12 === 0) out.push({ x: m / 12, invested: inv, value: bal });
    }
    // lump compounds yearly-equivalent monthly; recompute value to include it consistently
    return out;
  };
  C.sipWithLump = function (monthly, annualRate, years, stepUpPct, lump) {
    const n = Math.round(years * 12);
    return C.sipFV(monthly, annualRate, n, stepUpPct) + lump * Math.pow(1 + annualRate / 1200, n);
  };

  /* ---------- loans ---------- */
  // EMI = P r (1+r)^n / ((1+r)^n − 1), r monthly rate
  C.emi = function (principal, annualRate, months) {
    if (!(principal > 0) || !(months > 0)) return 0;
    const r = annualRate / 12 / 100;
    if (r === 0) return principal / months;
    const f = Math.pow(1 + r, months);
    return (principal * r * f) / (f - 1);
  };
  /* Amortization with extra monthly payment, one-time prepayments and rate changes.
     On a rate change the EMI stays the same and tenure adjusts (common bank practice). */
  C.amortize = function (o) {
    const months = Math.round(o.months);
    let bal = o.principal, rate = o.rate, emi = C.emi(o.principal, o.rate, months);
    const rows = []; let totInt = 0, totPaid = 0, neverClears = false;
    const extra = o.extra || 0, lumps = o.lumps || [], rcs = o.rateChanges || [];
    for (let m = 1; bal > 0.005; m++) {
      if (m > 1200) { neverClears = true; break; }
      const rc = rcs.find((x) => x.month === m); if (rc) rate = rc.rate;
      const mr = rate / 1200, open = bal, interest = bal * mr;
      if (emi <= interest + 0.0001 && mr > 0 && extra === 0) { if (m > months + 600) { neverClears = true; break; } }
      let pay = Math.min(emi + extra, open + interest);
      let princ = pay - interest;
      if (princ < 0) { princ = 0; pay = interest; }
      const lump = Math.min(lumps.filter((l) => l.month === m).reduce((a, l) => a + l.amount, 0), Math.max(0, open - princ));
      const sched = Math.min(emi, pay), prepay = pay - sched + lump;
      bal = Math.max(0, open - princ - lump);
      totInt += interest; totPaid += pay + lump;
      rows.push({ m, open, emi: sched, prepay, principal: princ + lump, interest, close: bal });
    }
    return { emi, rows, totalInterest: totInt, totalPaid: totPaid, months: rows.length, neverClears };
  };
  C.debtToIncome = (payments, income) => (income > 0 ? (payments / income) * 100 : NaN);
  C.utilization = (limit, out) => (limit > 0 ? (out / limit) * 100 : NaN);
  C.savingsRate = (savings, income) => (income > 0 ? (savings / income) * 100 : NaN);

  /* ---------- deposits ---------- */
  // FD: A = P (1 + r/n)^(n t), default quarterly (n=4)
  C.fd = (P, r, years, n = 4) => C.compound(P, r, n, years);
  // RD: each instalment compounds quarterly for its remaining time
  C.rd = function (monthly, rate, months) {
    let tot = 0;
    for (let k = 1; k <= months; k++) tot += monthly * Math.pow(1 + rate / 400, (4 * (months - k + 1)) / 12);
    return tot;
  };
  // Annual deposit, annual compounding, deposit at start of year
  C.annualDeposits = function (dep, rate, years) {
    let bal = 0; const s = [{ x: 0, value: 0, invested: 0 }];
    for (let y = 1; y <= years; y++) { bal = (bal + dep) * (1 + rate / 100); s.push({ x: y, value: bal, invested: dep * y }); }
    return { final: bal, series: s };
  };

  /* ---------- goals / retirement ---------- */
  // Required monthly contribution so that current*(1+r)^t + SIP = target
  C.requiredMonthly = function (target, current, annualRate, months) {
    if (months <= 0) return Math.max(0, target - current);
    const fvCur = current * Math.pow(1 + annualRate / 1200, months);
    const gap = target - fvCur; if (gap <= 0) return 0;
    const unit = C.sipFV(1, annualRate, months);
    return unit > 0 ? gap / unit : gap / months;
  };
  // Annuity-due factor over N years with real rate rr
  C.annuityDue = (rr, N) => (Math.abs(rr) < 1e-9 ? N : ((1 - Math.pow(1 + rr, -N)) / rr) * (1 + rr));
  C.retirement = function (o) {
    const yrs = Math.max(0, o.retAge - o.age), N = Math.max(1, o.lifeExp - o.retAge);
    const futureAnnual = o.monthlyExp * 12 * Math.pow(1 + o.inflation / 100, yrs);
    const rr = (1 + o.postReturn / 100) / (1 + o.inflation / 100) - 1;
    const needed = futureAnnual * C.annuityDue(rr, N);
    const projected = o.current * Math.pow(1 + o.ret / 100, yrs) + C.sipFV(o.monthly, o.ret, yrs * 12);
    return { yrs, N, futureAnnual, needed, projected, gap: projected - needed };
  };

  /* ---------- tax ---------- */
  C.incomeTax = function (taxable, regime) {
    taxable = Math.max(0, taxable);
    let tax = 0, prev = 0;
    for (const [lim, rate] of regime.slabs) {
      const upper = lim === null ? Infinity : lim;
      if (taxable > prev) tax += (Math.min(taxable, upper) - prev) * rate / 100;
      prev = upper; if (taxable <= upper) break;
    }
    let rebate = 0;
    const rb = regime.rebate;
    if (rb) {
      if (taxable <= rb.limit) rebate = Math.min(tax, rb.max);
      else if (rb.marginalRelief && tax > taxable - rb.limit) rebate = tax - (taxable - rb.limit);
    }
    const base = Math.max(0, tax - rebate), cess = base * (regime.cessPct || 0) / 100;
    return { slabTax: tax, rebate, cess, total: base + cess };
  };

  /* ---------- cards ---------- */
  C.cardPayoff = function (o) {
    let bal = o.balance; const mr = o.apr / 1200, rows = []; let totInt = 0, totFee = 0, paid = 0;
    for (let m = 1; bal > 0.005 && m <= 600; m++) {
      const interest = bal * mr, fee = o.fee || 0, due = bal + interest + fee;
      const minDue = Math.min(due, Math.max(o.minFloor || 0, (o.minPct / 100) * bal + 0));
      let pay = o.mode === 'min' ? Math.max(minDue, 0) : Math.min(due, Math.max(o.pay, minDue));
      const open = bal; bal = due - pay; totInt += interest; totFee += fee; paid += pay;
      rows.push({ m, open, interest, fee, pay, close: bal });
      if (pay <= interest + fee + 0.0001 && m > 12 && bal >= open) break;
    }
    return { rows, totInt, totFee, paid, months: rows.length, cleared: bal <= 0.005 };
  };

  /* ---------- bonds ---------- */
  C.bond = function (face, couponPct, yieldPct, years, freq = 1) {
    const n = Math.round(years * freq), c = face * couponPct / 100 / freq, y = yieldPct / 100 / freq;
    let price = 0, wt = 0;
    for (let k = 1; k <= n; k++) { const cf = c + (k === n ? face : 0), d = cf / Math.pow(1 + y, k); price += d; wt += d * k; }
    const mac = price > 0 ? wt / price / freq : 0;
    return { price, macaulay: mac, modified: mac / (1 + y), currentYield: price > 0 ? (face * couponPct / 100) / price * 100 : NaN };
  };

  /* ---------- rent vs buy (monthly simulation) ----------
     Buyer: pays down payment + fees upfront, then EMI + maintenance + property tax.
     Renter: invests that upfront money, pays rent. Whoever spends less each month
     invests the difference at the alternative return. Compare net positions. */
  C.rentVsBuy = function (o) {
    const n = Math.round(o.years * 12), loan = Math.max(0, o.price - o.down);
    const emi = C.emi(loan, o.loanRate, Math.round(o.tenureYears * 12));
    const mr = o.loanRate / 1200, ir = o.altReturn / 1200, g = Math.pow(1 + o.appreciation / 100, 1 / 12);
    let bal = loan, value = o.price, rent = o.rent, buyerInv = 0;
    let renterInv = o.down + o.price * o.feesPct / 100;
    const series = [{ x: 0, buy: o.price - loan - o.price * o.feesPct / 100, rent: renterInv }];
    for (let m = 1; m <= n; m++) {
      if (m > 1 && (m - 1) % 12 === 0) rent *= 1 + o.rentInfl / 100;
      value *= g;
      const interest = bal * mr, pay = bal > 0 ? Math.min(emi, bal + interest) : 0;
      bal = Math.max(0, bal - (pay - interest));
      const buyerOut = pay + o.maintenance + o.price * o.propTaxPct / 1200;
      renterInv *= 1 + ir; buyerInv *= 1 + ir;
      if (buyerOut >= rent) renterInv += buyerOut - rent; else buyerInv += rent - buyerOut;
      if (m % 12 === 0) series.push({ x: m / 12, buy: value * (1 - o.sellCostPct / 100) - bal + buyerInv, rent: renterInv });
    }
    const buyNet = value * (1 - o.sellCostPct / 100) - bal + buyerInv;
    return { emi, buyNet, rentNet: renterInv, value, loanLeft: bal, finalRent: rent, series };
  };

  C.r2 = r2; C.fmt = fmt; C.num = num;
  FOS.calc = C; FOS.fmt = fmt;
})();
