/* ==========================================================================
   debt-basic.js — Basic Debt Interest Calculator for informal, everyday borrowing and lending.
   Type the amount, then the interest the way you were told it — "₹2 interest" (₹2 per ₹100 every month), % a month or % a year —
   choose how you pay (monthly or every quarter) and how the debt is repaid, and see the rupees and paise straight away.
   (Loaded after invest.js and before shortforms.js so it gets the same help lines and short-forms box as every other calculator.)
   ========================================================================== */
(function () {
  'use strict';
  const { F, S, reg } = FOS, fmt = FOS.fmt, ch = () => FOS.charts;
  const r2 = (v) => fmt.inr(v, 2);
  const MODES = [['rs', '₹ per ₹100 every month — “2 rupees interest” (rupees)'], ['pm', '% per month'], ['py', '% per year']];
  const STYLES = [['io', 'Pay only the interest each time; give the principal back at the end'], ['emi', 'Equal instalments that clear the principal and interest'], ['simple', 'Pay nothing until the end; simple interest on the original amount'], ['acc', 'Pay nothing until the end; unpaid interest is added and earns interest too']];

  reg({
    id: 'debtinterest', title: 'Basic Debt Interest Calculator (₹ per ₹100, %, paise)', group: 'Debt', module: 'emi', tags: 'debt interest rupees two rupees interest per hundred monthly quarterly private loan hand loan lender borrower paise simple compound moneylender',
    intro: 'Borrowed or lent money at “₹2 interest”? Enter the amount and the rate the way you were told it, and see the interest in rupees and paise.',
    fields: [F.money('p', 'Amount borrowed (principal)', 100000, 5000000, 1000, { lo: 0.01 }), F.sel('mode', 'How was the interest told to you?', 'rs', MODES), F.num('rate', 'The interest number (for “₹2 interest” type 2)', 2, 100, 0.05, { lo: 0, hi: 100 }), F.sel('freq', 'How often will you pay?', '1', [['1', 'Every month'], ['3', 'Every quarter (3 months)']]), F.sel('style', 'How is the debt repaid?', 'io', STYLES), F.mon('n', 'For how long (months)', 12, 120, 1, { lo: 1, hi: 600 })],
    formula: ['Monthly rate = ₹ per ₹100 ÷ 100      (₹2 per ₹100 a month = 2% a month = 24% a year)', 'A quarter\'s rate = 3 × the monthly rate', 'Interest only / simple: interest each period = Principal × rate for the period;   total = Principal × rate × number of periods', 'Equal instalments: payment = P × r × (1 + r)^n ÷ ((1 + r)^n − 1), where r = rate for the period and n = number of periods', 'Unpaid interest added: amount owed = Principal × (1 + r)^n'],
    vars: ['“₹2 interest” in everyday lending almost always means ₹2 for every ₹100, every month — that is 24% a year, not 2% a year', 'Periods are counted in whole months or quarters; if the time is not a whole number of quarters it is rounded up to the next quarter', 'Amounts are shown to the paisa'],
    assumptions: ['The rate stays the same for the whole time and every payment is made on time', 'Where an agreement adds penalties, fees or “interest on interest”, the real cost will be higher — read the note and agree it in writing', 'Lending rules for private lenders differ by state; a very high rate may not be enforceable, and moneylenders may need a licence (verify)'],
    compute(v) {
      const rm = v.mode === 'py' ? v.rate / 1200 : v.rate / 100, k = +v.freq === 3 ? 3 : 1, rp = rm * k, n = Math.ceil(Math.max(0, v.n) / k), P = v.p, unit = k === 3 ? 'quarter' : 'month';
      const rows = [], pts = [{ x: 0, y: 0 }], owe = [{ x: 0, y: P }];
      let bal = P, paidInt = 0, pay = 0, total = 0, first = 0;
      const lab = (i) => (k === 3 ? 'Quarter ' + i + ' (month ' + i * 3 + ')' : 'Month ' + i);
      const push = (i, youPay, intr, princ, owed) => { rows.push([lab(i), r2(youPay), r2(intr), r2(princ), r2(paidInt), r2(owed)]); pts.push({ x: i * k, y: paidInt }); owe.push({ x: i * k, y: owed }); };
      if (v.style === 'emi') {
        pay = n > 0 ? (rp > 0 ? P * rp * Math.pow(1 + rp, n) / (Math.pow(1 + rp, n) - 1) : P / n) : 0;
        for (let i = 1; i <= n; i++) { const intr = bal * rp, princ = Math.min(bal, pay - intr); bal = Math.max(0, bal - princ); paidInt += intr; if (i === 1) first = intr; push(i, intr + princ, intr, princ, bal); }
        total = pay * n;
      } else if (v.style === 'io') {
        pay = P * rp; first = pay;
        for (let i = 1; i <= n; i++) { paidInt += pay; push(i, i === n ? pay + P : pay, pay, i === n ? P : 0, i === n ? 0 : P); }
        total = P + pay * n;
      } else if (v.style === 'simple') {
        first = P * rp;
        for (let i = 1; i <= n; i++) { paidInt += first; push(i, i === n ? P + paidInt : 0, i === n ? paidInt : 0, i === n ? P : 0, i === n ? 0 : P + paidInt); }
        total = P + first * n;
      } else {
        first = P * rp;
        for (let i = 1; i <= n; i++) { const intr = bal * rp; bal += intr; paidInt += intr; push(i, i === n ? bal : 0, 0, 0, i === n ? 0 : bal); }
        total = bal;
      }
      const interest = total - P, perHundred = rm * 100, yearSimple = rm * 1200, effective = (Math.pow(1 + rm, 12) - 1) * 100;
      const payLabel = v.style === 'emi' ? 'Instalment each ' + unit : v.style === 'io' ? 'Interest you pay each ' + unit : 'Paid before the end';
      const summary = [S('Interest for the first ' + unit, first, 'inr2', true), S(payLabel, v.style === 'simple' || v.style === 'acc' ? 0 : pay, 'inr2', true), S('Total interest', interest, 'inr2', true), S('Total you pay back (principal + interest)', total, 'inr2', true), S('Interest as a share of the amount borrowed', P > 0 ? interest / P * 100 : 0, 'pct'), S('Same rate in rupees per ₹100 every month', perHundred, 'inr2'), S('Same rate as % a year (simple)', yearSimple, 'pct'), S('If unpaid interest were added every month, the yearly cost would be', effective, 'pct'), S('Number of payments', v.style === 'simple' || v.style === 'acc' ? 1 : n, 'num')];
      const notes = [];
      if (rm > 0) notes.push('At ' + fmt.inr(perHundred, 2) + ' per ₹100 every month, ' + r2(P) + ' costs ' + r2(P * rm) + ' in interest each month — that is ' + fmt.pct(yearSimple, 2) + ' a year.');
      if (v.n % k !== 0) notes.push('The time is not a whole number of quarters, so it is rounded up to ' + n + ' quarters (' + n * 3 + ' months).');
      if (v.style === 'io') notes.push('Paying only the interest never reduces what you owe: the full ' + r2(P) + ' is still due on the last day.');
      if (v.style === 'acc') notes.push('Adding unpaid interest to the debt is the most expensive way to borrow. Compare the total with the “simple interest” option to see the difference.');
      if (yearSimple >= 36) notes.push('This rate is above 36% a year. Compare it with a bank loan, and check that the lender is allowed to charge it where you live.');
      notes.push('Ask for the terms in writing, with the amount, the rate, the dates and what happens if a payment is late. Pay by bank or UPI so there is a record.');
      return { summary, charts: [ch().line({ title: 'Interest so far and what you owe', xLabel: 'Months', yfmt: 'inr', series: [{ name: 'Interest paid or added so far', data: pts }, { name: 'What you still owe', data: owe, dash: true }] })],
        table: { head: ['When', 'You pay', 'Of which interest', 'Of which principal', 'Interest so far', 'You still owe'], rows }, tableTitle: 'Period by period', notes };
    }
  });

  FOS.ABOUT.calc.debtinterest = ['Works out the interest on an everyday loan told as “₹2 interest”, a % a month or a % a year, in rupees and paise, for monthly or quarterly payments.', 'You lent or borrowed money from a person or a local lender and want to know what it really costs.', 'Start with "Total interest" and "Total you pay back". The "same rate as % a year" line turns “₹2 interest” into a yearly figure you can compare with a bank loan.'];
  FOS.EXAMPLES.debtinterest = ['Ramesh borrows ₹50,000 from a local lender at “₹2 interest” (₹2 for every ₹100, every month). He pays only the interest each month for 12 months and returns the principal at the end.', { p: 50000 }, ['The money you borrow.', 'Choose how the lender told you the rate: ₹ per ₹100 every month, % a month or % a year.', 'The number itself: for “₹2 interest” type 2.', 'Whether you pay every month or every 3 months.', 'How the debt is cleared: interest only, equal instalments, or everything at the end.', 'How many months the debt runs.']];
})();
