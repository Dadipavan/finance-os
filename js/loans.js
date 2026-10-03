/* ==========================================================================
   loans.js — EMI, amortization, prepayment, cards, debt calculators + loan comparison
   ========================================================================== */
(function () {
  'use strict';
  const { F, S, reg } = FOS, C = FOS.calc, fmt = FOS.fmt, ch = () => FOS.charts;
  const intRate = (k) => () => FOS.store.interest(k);

  const yearly = (rows) => {
    const out = []; let y = 1, acc = { princ: 0, int: 0 };
    rows.forEach((r, i) => { acc.princ += r.principal; acc.int += r.interest; if (r.m % 12 === 0 || i === rows.length - 1) { out.push({ y, princ: acc.princ, int: acc.int, close: r.close }); y++; acc = { princ: 0, int: 0 }; } });
    return out;
  };
  const schedTable = (rows) => ({ head: ['Month', 'Opening balance', 'EMI', 'Prepayment', 'Principal', 'Interest', 'Closing balance'], rows: rows.map((r) => [r.m, fmt.inr(r.open), fmt.inr(r.emi), r.prepay ? fmt.inr(r.prepay) : '—', fmt.inr(r.principal), fmt.inr(r.interest), fmt.inr(r.close)]) });
  const balanceChart = (rows, title) => ch().line({ title, xLabel: 'Month', yfmt: 'inr', area: true, series: [{ name: 'Outstanding balance', data: [{ x: 0, y: rows.length ? rows[0].open : 0 }].concat(rows.map((r) => ({ x: r.m, y: r.close }))) }, { name: 'Interest paid so far', data: [{ x: 0, y: 0 }].concat(rows.reduce((a, r) => { a.push({ x: r.m, y: (a.length ? a[a.length - 1].y : 0) + r.interest }); return a; }, [])) }] });

  reg({
    id: 'emi', title: 'EMI Calculator', group: 'Loans', module: 'emi', tags: 'emi loan interest installment home car personal repayment amortization',
    intro: 'Find your monthly instalment, total interest and total repayment for any reducing-balance loan.',
    fields: [F.money('p', 'Loan amount', 1000000, 20000000, 50000, { lo: 1 }), F.pct('r', 'Interest rate (per year)', 10, 30, 0.05), F.yrs('y', 'Tenure (years)', 5, 30, 0.5, { lo: 0.25, hi: 40 })],
    formula: ['EMI = P × r × (1+r)^n / ((1+r)^n − 1)'], vars: ['P = loan amount (principal)', 'r = monthly interest rate = annual rate ÷ 12 ÷ 100', 'n = number of monthly instalments', 'If r = 0 then EMI = P ÷ n'],
    assumptions: ['Reducing-balance interest, monthly instalments', 'Processing fee, GST and insurance are NOT included — see “Loan true cost”'],
    compute(v) {
      const n = Math.round(v.y * 12), res = C.amortize({ principal: v.p, rate: v.r, months: n }), rows = res.rows;
      const yr = yearly(rows);
      return {
        summary: [S('Monthly EMI', res.emi, 'inr', true), S('Total principal', v.p), S('Total interest', res.totalInterest), S('Total repayment', res.totalPaid, 'inr', true), S('Interest as % of principal', res.totalInterest / v.p * 100, 'pct')],
        charts: [ch().bar({ title: 'Principal vs interest by year', cats: yr.map((x) => 'Y' + x.y), series: [{ name: 'Principal', data: yr.map((x) => x.princ) }, { name: 'Interest', data: yr.map((x) => x.int) }], yfmt: 'inr' }), balanceChart(rows, 'Loan balance')],
        table: schedTable(rows), tableTitle: 'Monthly amortization schedule'
      };
    }
  });

  const amFields = () => [F.money('p', 'Loan amount', 1000000, 20000000, 50000, { lo: 1 }), F.pct('r', 'Interest rate', 10, 30, 0.05), F.yrs('y', 'Tenure (years)', 5, 30, 0.5, { lo: 0.25, hi: 40 }),
    F.pct('r2', 'New rate after change', 10, 30, 0.05), F.mon('rm', 'Rate changes in month (0 = never)', 0, 360, 1), F.money('extra', 'Extra monthly payment', 0, 50000, 500), F.money('lump', 'One-time prepayment', 0, 1000000, 10000), F.mon('lm', 'Prepayment in month', 12, 360, 1, { lo: 1 })];
  reg({
    id: 'amortization', title: 'Loan Amortization (rate changes & prepayments)', group: 'Loans', module: 'emi', tags: 'emi amortization schedule prepayment extra payment rate change loan',
    intro: 'A full month-by-month schedule that responds to interest-rate changes, extra monthly payments and one-time prepayments.',
    fields: amFields(),
    formula: ['Interest(month) = Opening balance × annual rate ÷ 12 ÷ 100', 'Principal(month) = EMI + extra − Interest', 'Closing = Opening − Principal − one-time prepayment'], vars: ['On a rate change the EMI stays the same and the tenure adjusts (common bank practice)', 'Extra payments reduce principal immediately, cutting future interest'],
    assumptions: ['Check your lender\'s prepayment / foreclosure charges — not included here'],
    compute(v) {
      const lumps = v.lump > 0 ? [{ month: Math.max(1, Math.round(v.lm)), amount: v.lump }] : [], rcs = v.rm > 0 ? [{ month: Math.round(v.rm), rate: v.r2 }] : [];
      const base = C.amortize({ principal: v.p, rate: v.r, months: Math.round(v.y * 12) });
      const res = C.amortize({ principal: v.p, rate: v.r, months: Math.round(v.y * 12), extra: v.extra, lumps, rateChanges: rcs });
      return {
        summary: [S('Starting EMI', res.emi, 'inr', true), S('Months to repay', res.months, 'months'), S('Total interest', res.totalInterest, 'inr', true), S('Total repayment', res.totalPaid), S('Interest vs plain schedule', res.totalInterest - base.totalInterest, 'inr'), S('Months saved / added', base.months - res.months, 'num')],
        charts: [balanceChart(res.rows, 'Balance with your assumptions')], table: schedTable(res.rows), tableTitle: 'Amortization schedule',
        notes: res.neverClears ? ['With these inputs the EMI does not cover the interest, so the loan never clears. Increase the EMI or lower the rate.'] : []
      };
    }
  });

  reg({
    id: 'prepayment', title: 'Prepayment Simulator', group: 'Loans', module: 'emi', tags: 'prepayment emi extra payment foreclosure loan save interest',
    intro: 'See exactly how much interest and time an extra payment saves.',
    fields: [F.money('p', 'Loan amount', 5000000, 50000000, 100000, { lo: 1 }), F.pct('r', 'Interest rate', 8.75, 20, 0.05), F.yrs('y', 'Tenure (years)', 20, 30, 1, { lo: 1, hi: 40 }), F.money('extra', 'Extra every month', 5000, 100000, 500), F.money('lump', 'One-time prepayment', 200000, 5000000, 10000), F.mon('lm', 'One-time prepayment in month', 12, 360, 1, { lo: 1 }), F.pct('fee', 'Prepayment charge (% of amount prepaid)', 0, 5, 0.1)],
    formula: ['Interest saved = interest(no prepayment) − interest(with prepayment) − prepayment charges'], vars: ['Floating-rate home loans for individuals often have no prepayment charge; fixed-rate and business loans often do — verify'],
    assumptions: ['EMI is unchanged; tenure shortens'],
    compute(v) {
      const n = Math.round(v.y * 12), a = C.amortize({ principal: v.p, rate: v.r, months: n }), lumps = v.lump > 0 ? [{ month: Math.round(v.lm), amount: v.lump }] : [];
      const b = C.amortize({ principal: v.p, rate: v.r, months: n, extra: v.extra, lumps });
      const prepaid = b.rows.reduce((s, r) => s + r.prepay, 0), charge = prepaid * v.fee / 100;
      return {
        summary: [S('EMI', a.emi), S('Interest — no prepayment', a.totalInterest), S('Interest — with prepayment', b.totalInterest), S('Prepayment charges', charge), S('Net interest saved', a.totalInterest - b.totalInterest - charge, 'inr', true), S('Time saved', a.months - b.months, 'months', true)],
        charts: [ch().line({ title: 'Balance comparison', xLabel: 'Month', yfmt: 'inr', series: [{ name: 'No prepayment', data: [{ x: 0, y: v.p }].concat(a.rows.map((r) => ({ x: r.m, y: r.close }))) }, { name: 'With prepayment', data: [{ x: 0, y: v.p }].concat(b.rows.map((r) => ({ x: r.m, y: r.close }))) }] })],
        notes: ['Opportunity cost: money used to prepay cannot be invested or kept as emergency cash. Compare the loan rate with what your savings could earn after tax and risk.']
      };
    }
  });

  reg({
    id: 'loancost', title: 'Loan True Cost (fees & effective rate)', group: 'Loans', module: 'loans', tags: 'loan fees processing gst effective cost apr emi personal',
    intro: 'Add processing fees and charges to see what a loan really costs and its effective annual rate.',
    fields: [F.money('p', 'Loan amount', 500000, 10000000, 25000, { lo: 1 }), F.pct('r', 'Stated interest rate', 12, 30, 0.05), F.yrs('y', 'Tenure (years)', 3, 30, 0.5, { lo: 0.25, hi: 40 }), F.pct('fee', 'Processing fee (% of loan)', 2, 5, 0.05), F.pct('gst', 'GST on fees', 18, 28, 1), F.money('ins', 'Insurance / other charges (one-time)', 0, 100000, 500), F.pct('pen', 'Prepayment / foreclosure charge', 4, 10, 0.1)],
    formula: ['Net amount received = P − (fee + GST on fee + other charges)', 'Effective rate = the monthly rate i that solves: Net received = EMI × (1 − (1+i)^−n)/i, annualised × 12'], vars: ['This is an IRR-style effective cost; it is higher than the stated rate whenever fees exist'],
    assumptions: ['Fees assumed deducted upfront'],
    compute(v) {
      const n = Math.round(v.y * 12), emi = C.emi(v.p, v.r, n), fees = v.p * v.fee / 100 * (1 + v.gst / 100) + v.ins, net = v.p - fees;
      let lo = 0, hi = 5; for (let i = 0; i < 100; i++) { const mid = (lo + hi) / 2, pv = mid === 0 ? emi * n : emi * (1 - Math.pow(1 + mid, -n)) / mid; if (pv > net) lo = mid; else hi = mid; }
      const eff = lo * 12 * 100, total = emi * n + fees;
      return { summary: [S('EMI', emi, 'inr', true), S('Total interest', emi * n - v.p), S('Fees & charges', fees), S('Net amount you receive', net), S('Total cost of borrowing', total - v.p, 'inr', true), S('Total outflow', total), S('Effective annual rate', eff, 'pct', true), S('Cost if foreclosed with full balance early', v.p * v.pen / 100, 'inr')], notes: ['Always ask the lender for the Key Fact Statement (KFS) / APR.'] };
    }
  });

  reg({
    id: 'dti', title: 'Debt-to-Income (DTI) Calculator', group: 'Debt', module: 'emi', tags: 'dti debt income ratio emi',
    intro: 'What share of your monthly income goes to debt payments?',
    fields: [F.money('inc', 'Monthly income (gross or take-home — be consistent)', 80000, 500000, 1000, { lo: 1 }), F.money('emi', 'Total EMIs per month', 20000, 200000, 500), F.money('card', 'Credit-card minimum payments', 2000, 50000, 100), F.money('other', 'Other debt payments', 0, 100000, 500)],
    formula: ['DTI = Monthly debt payments ÷ Monthly income × 100'], vars: ['Lenders often look at DTI; many prefer it below 40–50% of gross income. Rules vary — treat it as a reference, not a rule.'],
    assumptions: ['Housing rent is not counted as debt unless you add it'],
    compute(v) { const d = v.emi + v.card + v.other, dti = C.debtToIncome(d, v.inc); return { summary: [S('Total debt payments', d), S('DTI', dti, 'pct', true), S('Left after debt payments', v.inc - d)], notes: [dti > 40 ? 'Above ~40%: a lender may see this as stretched, and a drop in income would be hard to absorb.' : dti > 20 ? 'Between 20–40%: manageable for many, but check what happens if income falls.' : 'Under ~20%: debt is a small part of income.'] }; }
  });

  reg({
    id: 'utilization', title: 'Credit Utilization Calculator', group: 'Credit', module: 'score', tags: 'credit utilization score card limit',
    intro: 'How much of your credit limit are you using?',
    fields: [F.money('lim', 'Total credit limit', 300000, 2000000, 5000, { lo: 1 }), F.money('out', 'Total outstanding', 90000, 2000000, 1000)],
    formula: ['Utilization % = Outstanding ÷ Total limit × 100'], vars: ['Real credit-scoring models use many more factors and details vary by bureau; a commonly quoted guideline is to stay below ~30%'],
    assumptions: ['Utilization is one factor of several: payment history, age, mix, inquiries'],
    compute(v) { const u = C.utilization(v.lim, v.out); return { summary: [S('Utilization', u, 'pct', true), S('Available limit', Math.max(0, v.lim - v.out)), S('Outstanding to reach 30%', Math.max(0, v.out - v.lim * 0.3))], notes: [u > 100 ? 'Outstanding is above the limit — check for fees or over-limit charges.' : u > 30 ? 'Above the common 30% guideline.' : 'At or below the common 30% guideline.'] }; }
  });

  reg({
    id: 'cardpay', title: 'Credit Card Repayment Simulator', group: 'Credit', module: 'cards', tags: 'credit card repayment interest minimum due amortization apr',
    intro: 'Compare paying only the minimum with a fixed monthly payment. See how long, and how much it really costs.',
    fields: [F.money('bal', 'Outstanding balance', 100000, 1000000, 5000, { lo: 1 }), F.pct('apr', 'Interest rate (APR, per year)', () => FOS.store.interest('creditCardAPR'), 60, 0.5), F.pct('minPct', 'Minimum due (% of balance)', 5, 20, 0.5), F.money('floor', 'Minimum due floor (₹)', 200, 5000, 50), F.money('pay', 'Your fixed monthly payment', 10000, 200000, 500), F.money('fee', 'Monthly fees', 0, 2000, 10)],
    formula: ['Interest(month) = Balance × APR ÷ 12 ÷ 100', 'New balance = Balance + Interest + Fees − Payment'], vars: ['Paying only the minimum shrinks the payment with the balance, so it can take many years', 'Late fees and GST are not modelled'],
    assumptions: ['No new purchases are added; interest charged monthly on the outstanding balance'],
    compute(v) {
      const base = { balance: v.bal, apr: v.apr, minPct: v.minPct, minFloor: v.floor, fee: v.fee }, a = C.cardPayoff({ ...base, mode: 'min' }), b = C.cardPayoff({ ...base, mode: 'fixed', pay: v.pay });
      const show = (r) => ({ head: ['Month', 'Opening', 'Interest', 'Fees', 'Payment', 'Closing'], rows: r.rows.map((x) => [x.m, fmt.inr(x.open), fmt.inr(x.interest), fmt.inr(x.fee), fmt.inr(x.pay), fmt.inr(x.close)]) });
      return {
        summary: [S('Minimum-only: time to clear', a.cleared ? a.months : NaN, 'months'), S('Minimum-only: total interest', a.totInt), S('Fixed payment: time to clear', b.cleared ? b.months : NaN, 'months', true), S('Fixed payment: total interest', b.totInt, 'inr', true), S('Fixed payment: total fees', b.totFee), S('Fixed payment: total repayment', b.paid, 'inr', true)],
        charts: [ch().line({ title: 'Balance over time', xLabel: 'Month', yfmt: 'inr', series: [{ name: 'Minimum only', data: [{ x: 0, y: v.bal }].concat(a.rows.map((r) => ({ x: r.m, y: r.close }))), dash: true }, { name: 'Fixed payment', data: [{ x: 0, y: v.bal }].concat(b.rows.map((r) => ({ x: r.m, y: r.close }))) }] })],
        table: show(b), tableTitle: 'Repayment schedule (fixed payment)',
        notes: (a.cleared ? [] : ['Minimum-only did not clear within 50 years under these inputs.']).concat(b.cleared ? [] : ['Your fixed payment does not clear the balance — it is below interest + fees.'])
      };
    }
  });

  reg({
    id: 'debtpayoff', title: 'Debt Payoff: Snowball vs Avalanche', group: 'Debt', module: 'emi', tags: 'debt snowball avalanche repayment payoff',
    intro: 'Same total payment, two ordering strategies. Snowball clears the smallest balance first; avalanche targets the highest interest rate first.',
    fields: [F.money('b1', 'Debt 1 balance', 50000, 1000000, 5000), F.pct('r1', 'Debt 1 rate', 36, 60, 0.5), F.money('b2', 'Debt 2 balance', 200000, 2000000, 10000), F.pct('r2', 'Debt 2 rate', 14, 60, 0.5), F.money('b3', 'Debt 3 balance', 500000, 5000000, 25000), F.pct('r3', 'Debt 3 rate', 9, 60, 0.5), F.money('tot', 'Total you can pay per month', 30000, 300000, 1000, { lo: 1 })],
    formula: ['Each month: pay interest on every debt; put the rest of the budget on the target debt, then roll over freed money'], vars: ['Avalanche minimises total interest; snowball may help motivation. The maths shows the difference — the choice is yours.'],
    assumptions: ['Minimum payment on each debt assumed = 2% of balance + interest, for illustration'],
    compute(v) {
      const run = (order) => {
        const d = [[v.b1, v.r1], [v.b2, v.r2], [v.b3, v.r3]].map((x, i) => ({ i, b: x[0], r: x[1] })).filter((x) => x.b > 0); let m = 0, int = 0;
        while (d.some((x) => x.b > 0.5) && m < 600) {
          m++; let budget = v.tot;
          d.forEach((x) => { if (x.b <= 0) return; const i = x.b * x.r / 1200; int += i; x.b += i; const mn = Math.min(x.b, x.b * 0.02 + i); x.b -= mn; budget -= mn; });
          const tg = d.filter((x) => x.b > 0.5).sort(order)[0];
          if (tg) { const p = Math.max(0, Math.min(tg.b, budget)); tg.b -= p; }
          if (budget < -1e-6 && m > 1) { return { m: NaN, int: NaN }; }
        }
        return { m: m >= 600 ? NaN : m, int };
      };
      const sn = run((a, b) => a.b - b.b), av = run((a, b) => b.r - a.r);
      return { summary: [S('Snowball: months', sn.m, 'months'), S('Snowball: interest', sn.int), S('Avalanche: months', av.m, 'months'), S('Avalanche: interest', av.int), S('Interest difference', sn.int - av.int, 'inr', true)], notes: ['If a figure shows “—”, your monthly payment is too low to clear the debts under these assumptions.'] };
    }
  });

  reg({
    id: 'whatif-emi', title: 'What if my EMI increases?', group: 'What If', module: 'emi', tags: 'emi interest rate increase floating what if',
    intro: 'Your lender raises the rate. Does your EMI rise, or does your tenure stretch?',
    fields: [F.money('bal', 'Outstanding loan balance', 4000000, 50000000, 100000, { lo: 1 }), F.pct('r', 'Current interest rate', 8.5, 20, 0.05), F.pct('r2', 'New interest rate', 10.5, 20, 0.05), F.mon('rem', 'Remaining tenure (months)', 180, 360, 1, { lo: 1, hi: 480 })],
    formula: ['Option A: EMI_new = EMI formula with new rate over the same remaining months', 'Option B: keep the EMI and see how many months are needed'], vars: [],
    assumptions: ['Floating-rate loan, rate change takes effect from now'],
    compute(v) {
      const e0 = C.emi(v.bal, v.r, v.rem), e1 = C.emi(v.bal, v.r2, v.rem), a = C.amortize({ principal: v.bal, rate: v.r2, months: v.rem });
      const keep = (function () { const mr = v.r2 / 1200; if (e0 <= v.bal * mr) return NaN; let b = v.bal, m = 0; while (b > 0.5 && m < 1200) { b = b * (1 + mr) - e0; m++; } return m; })();
      return { summary: [S('EMI today', e0), S('EMI at new rate (same tenure)', e1, 'inr', true), S('Extra per month', e1 - e0), S('Extra over remaining term', (e1 - e0) * v.rem), S('If EMI stays same: months needed', keep, 'months', true), S('Months added', keep - v.rem, 'num')] };
    }
  });

  /* ---------- Loan comparison tool (side-by-side, no ranking) ---------- */
  FOS.tools = FOS.tools || {};
  FOS.tools.loancompare = function (root) {
    const U = FOS.ui;
    const def = (n, rate, fee) => ({ name: n, p: 1000000, r: rate, y: 5, fee, prepay: 'Check with lender' });
    let loans = [def('Loan A', 10.5, 1), def('Loan B', 11, 0), def('Loan C', 9.9, 2.5)];
    const draw = () => {
      const res = loans.map((l) => { const n = Math.round(l.y * 12), a = C.amortize({ principal: l.p, rate: l.r, months: n }), fees = l.p * l.fee / 100 * 1.18; return { ...l, emi: a.emi, int: a.totalInterest, fees, total: a.totalPaid + fees, eff: l.p > 0 ? ((a.totalInterest + fees) / l.p) * 100 : NaN }; });
      const rowf = (k, label, f) => `<tr><th scope="row">${label}</th>${res.map((r, i) => `<td>${f(r, i)}</td>`).join('')}</tr>`;
      const inp = (i, k, type, step) => `<input aria-label="${k} for ${U.esc(loans[i].name)}" class="mini" type="${type}" step="${step || 'any'}" min="0" value="${U.esc(loans[i][k])}" data-i="${i}" data-k="${k}">`;
      root.innerHTML = `<div class="card"><h3>Compare loans side by side</h3><p class="muted">Enter up to three offers. Nothing is ranked “best” — look at every row, including fees and prepayment terms.</p>
      <div class="table-scroll"><table class="data"><thead><tr><th></th>${res.map((r, i) => `<th>${inp(i, 'name', 'text')}</th>`).join('')}</tr></thead><tbody>
      ${rowf('p', 'Loan amount (₹)', (r, i) => inp(i, 'p', 'number'))}${rowf('r', 'Interest rate (%)', (r, i) => inp(i, 'r', 'number', '0.05'))}${rowf('y', 'Tenure (years)', (r, i) => inp(i, 'y', 'number', '0.5'))}${rowf('fee', 'Processing fee (% + 18% GST)', (r, i) => inp(i, 'fee', 'number', '0.1'))}${rowf('pp', 'Prepayment conditions', (r, i) => inp(i, 'prepay', 'text'))}
      <tr class="sep"><th scope="row">Calculated</th><td colspan="${res.length}"></td></tr>
      ${rowf('emi', 'EMI', (r) => '<b>' + FOS.fmt.inr(r.emi) + '</b>')}${rowf('int', 'Total interest', (r) => FOS.fmt.inr(r.int))}${rowf('fees', 'Fees incl. GST', (r) => FOS.fmt.inr(r.fees))}${rowf('tot', 'Total repayment', (r) => '<b>' + FOS.fmt.inr(r.total) + '</b>')}${rowf('eff', 'Total cost as % of loan', (r) => FOS.fmt.pct(r.eff, 1))}${rowf('ten', 'Tenure', (r) => FOS.fmt.months(r.y * 12))}
      </tbody></table></div><p class="note">Lower EMI can mean a longer tenure and more total interest. Decide using the full picture and your own priorities.</p></div>`;
    };
    root.addEventListener('change', (e) => { const i = e.target.dataset.i; if (i === undefined) return; const k = e.target.dataset.k; const val = e.target.type === 'number' ? Math.max(0, parseFloat(e.target.value) || 0) : e.target.value; loans[i][k] = k === 'y' && val < 0.25 ? 0.25 : k === 'p' && val < 1 ? 1 : val; draw(); });
    draw();
  };
})();
