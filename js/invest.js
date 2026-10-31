/* ==========================================================================
   invest.js — the saving & investing schemes that were missing as calculators (NSC, SSY, SCSS, KVP, post-office MIS, SGB, STP),
   tax-saving helpers (80C + NPS planner, taxable vs tax-free yield), the cost of starting late, and the big one:
   "Where should I invest?" — one amount, every option side by side, with the tax saved and the tax paid.
   Every rate, limit and tax rule comes from the configuration (data.js / Data & Sources) — nothing time-sensitive is hard-coded here.
   (Loaded after about.js, examples.js and calc-more-help.js: it adds the About text and the worked example of each tool it registers.)
   ========================================================================== */
(function () {
  'use strict';
  const { F, S, reg } = FOS, C = FOS.calc, fmt = FOS.fmt, ch = () => FOS.charts, DISC = FOS.ui.disclaimer;
  const yr = () => FOS.TAX_RULES.years[FOS.TAX_RULES.defaultYear];
  const cessMul = () => 1 + (yr().other.standardCess || 0) / 100;
  const sch = (id) => FOS.store.schemeRate(id), SC = (id) => FOS.GOVERNMENT_SCHEMES.schemes[id];
  const assume = (k) => () => FOS.store.assume(k);
  const ded = (prefix) => { const d = yr().deductionsOld, k = Object.keys(d).find((x) => x.indexOf(prefix) === 0); return k ? d[k] : 0; };
  const unverified = () => (yr().verified === false ? ['The tax rules for ' + yr().label + ' are an UNVERIFIED copy of the previous year — check them in Data & Sources.'] : []);
  const SLABS = [['0', '0% (income below the tax-free limit)'], ['5', '5%'], ['10', '10%'], ['15', '15%'], ['20', '20%'], ['25', '25%'], ['30', '30%']];
  const slabSel = () => F.sel('slab', 'Your income-tax slab (the rate on your last rupee of income)', '30', SLABS);
  const regimeSel = () => F.sel('regime', 'Your tax regime', 'new', [['new', 'New regime (no 80C / NPS deduction)'], ['old', 'Old regime (80C and NPS 80CCD(1B) deductions)']]);
  const eff = (slab) => slab * cessMul() / 100;                 // slab rate plus cess, as a fraction
  const TAXNOTE = 'Tax is estimated at your slab rate plus cess. Your real tax depends on your whole income — use the Tax Optimizer for the exact figure.';

  /* ---------------- NSC ---------------- */
  reg({
    id: 'nsc', title: 'NSC Calculator (National Savings Certificate)', group: 'Government', module: 'govt', tags: 'nsc national savings certificate post office 80c five year fixed rate',
    intro: 'A 5-year post-office certificate. See what it pays at maturity, the tax on its interest, and the tax you save under Section 80C.',
    fields: [F.money('amt', 'Amount you put in the certificate', 100000, 2000000, 1000, { lo: SC('NSC').min }), F.pct('r', 'NSC interest rate (yearly, added to the balance every year)', () => sch('NSC'), 12, 0.05), slabSel(), regimeSel(), F.money('used', 'Other 80C investments you already make each year', 0, 150000, 5000), F.pct('inf', 'Expected inflation (for the real-return line)', assume('inflation'), 15, 0.1)],
    formula: ['Maturity = Amount × (1 + r)^5      (interest is compounded once a year, paid at maturity)', 'Interest in year k = Amount × (1 + r)^(k−1) × r', 'Tax on interest = interest × (slab rate + cess), payable every year as it accrues', 'Tax saved on the deposit (old regime) = the lower of (Amount, 80C room left) × (slab rate + cess)'],
    vars: ['r = the rate fixed on the day you buy; it stays the same for the whole 5 years', 'The interest of years 1–4 is treated as “reinvested”, so it can also count towards 80C in those years (old regime, if room is left) — that extra saving is shown separately', 'The interest of year 5 does not get the 80C benefit'],
    assumptions: ['The rate is reset every quarter by the government — enter the rate on your certificate or update it in Data & Sources (verify)', 'Interest is taxable every year, although you receive it only at maturity; no TDS is cut, but you must report it yourself', TAXNOTE],
    compute(v) {
      const e = eff(v.slab), old = v.regime === 'old', cap = ded('80C'), room = Math.max(0, cap - v.used), r = v.r / 100;
      const mat = v.amt * Math.pow(1 + r, 5), interest = mat - v.amt, rows = []; let eligible = 0;
      for (let k = 1; k <= 5; k++) { const i = v.amt * Math.pow(1 + r, k - 1) * r, el = k <= 4 ? Math.min(i, room) : 0; if (old) eligible += el; rows.push([String(k), fmt.inr(i), fmt.inr(v.amt * Math.pow(1 + r, k)), fmt.inr(i * e), old && k <= 4 ? fmt.inr(el * e) : '—']); }
      const taxInt = interest * e, post = mat - taxInt, savedDep = old ? Math.min(v.amt, room) * e : 0, savedInt = eligible * e, saved = savedDep + savedInt;
      const retPost = (Math.pow(post / v.amt, 1 / 5) - 1) * 100, retAll = savedDep < v.amt ? (Math.pow((post + savedInt) / (v.amt - savedDep), 1 / 5) - 1) * 100 : NaN;
      return { summary: [S('Maturity amount after 5 years', mat, 'inr', true), S('Interest earned', interest), S('Tax on the interest (estimate)', taxInt), S('Maturity after tax', post, 'inr', true), S('Tax saved on the deposit (80C)', savedDep), S('Tax saved on reinvested interest (years 1–4)', savedInt), S('Yearly return after tax', retPost, 'pct'), S('Yearly return after tax on what you really pay (amount minus tax saved)', Number.isFinite(retAll) ? retAll : retPost, 'pct'), S('After inflation (approx.)', ((1 + retPost / 100) / (1 + v.inf / 100) - 1) * 100, 'pct')],
        charts: [ch().line({ title: 'NSC balance', xLabel: 'Year', yfmt: 'inr', area: true, series: [{ name: 'Balance', data: [0, 1, 2, 3, 4, 5].map((k) => ({ x: k, y: v.amt * Math.pow(1 + r, k) })) }] })],
        table: { head: ['Year', 'Interest this year', 'Balance at year end', 'Tax on that interest', 'Tax saved (80C) on reinvested interest'], rows }, tableTitle: 'Year by year',
        notes: [old ? 'Under the old regime, 80C is capped at ' + fmt.inr(cap) + ' a year in total (EPF, PPF, insurance, tuition fees and others share it). You told us ' + fmt.inr(v.used) + ' is already used.' : 'The new regime has no 80C deduction, so the tax saved is zero — compare both regimes before you rely on this benefit.', 'Early exit is allowed only in special cases (such as the holder\'s death), so treat the money as locked for 5 years.'].concat(unverified(), [DISC]) };
    }
  });

  /* ---------------- SSY ---------------- */
  reg({
    id: 'ssy', title: 'SSY Calculator (Sukanya Samriddhi Yojana)', group: 'Government', module: 'govt', tags: 'ssy sukanya samriddhi girl child daughter education marriage 80c',
    intro: 'A savings account for a girl child. See the money at maturity (21 years after opening), what you can take out at 18, and the tax you save.',
    fields: [F.money('dep', 'Amount you deposit every year', 100000, 150000, 5000, { lo: SC('SSY').min, hi: SC('SSY').max }), F.pct('r', 'SSY interest rate (yearly, added every year)', () => sch('SSY'), 12, 0.05), F.yrs('dy', 'Years you will keep depositing (at most 15)', 15, 15, 1, { lo: 1, hi: 15 }), F.num('age', 'Girl\'s age when the account is opened', 2, 10, 1, { lo: 0, hi: 10 }), slabSel(), regimeSel(), F.money('used', 'Other 80C investments you already make each year', 0, 150000, 5000)],
    formula: ['Each year: balance = (balance + deposit) × (1 + r)      (deposits stop after your chosen years; interest keeps being added until year 21)', 'Maturity = the balance at the end of year 21 from opening', 'Allowed withdrawal at 18 = 50% of the balance at the end of the previous year (for education or marriage)', 'Tax saved (old regime) = the lower of (deposit, 80C room left) × (slab rate + cess), for each year you deposit'],
    vars: ['r = the rate for the quarter, which can change; the same rate is assumed all the way here', 'The real rule credits interest on the lowest balance between the 5th and the end of each month; depositing before the 5th of the month (or in April) gets the full benefit — this calculator assumes that', 'Deposits are accepted for 15 years only, but the account keeps earning interest until it is 21 years old'],
    assumptions: ['Interest and the maturity amount are tax-free under the old regime; check the position under the new regime in Data & Sources (verify)', 'Only a girl child below 10 years can be the account holder; a family can usually open two such accounts (exceptions apply)', TAXNOTE],
    compute(v) {
      const r = v.r / 100, dy = Math.max(1, Math.round(v.dy)), cap = ded('80C'), room = Math.max(0, cap - v.used), e = eff(v.slab), old = v.regime === 'old';
      let bal = 0, inv = 0; const pts = [{ x: 0, y: 0 }], bals = [0], rows = [];
      for (let y = 1; y <= 21; y++) { const d = y <= dy ? v.dep : 0, open = bal; bal = (bal + d) * (1 + r); inv += d; pts.push({ x: y, y: bal }); bals.push(bal); if (y % 3 === 0 || y === 21 || y === dy) rows.push([String(y), d ? fmt.inr(d) : 'stopped', fmt.inr(inv), fmt.inr(bal - inv), fmt.inr(bal)]); }
      const at18 = Math.round(18 - v.age), half = at18 >= 1 && at18 <= 21 ? bals[at18 - 1] / 2 : 0, saved = old ? Math.min(v.dep, room) * e * dy : 0;
      return { summary: [S('Money at maturity (year 21)', bal, 'inr', true), S('Total deposited', inv), S('Interest earned (tax-free in the old regime)', bal - inv), S('Girl\'s age at maturity', v.age + 21, 'years'), S('You may withdraw at age 18 (up to)', half, 'inr', true), S('Tax saved on deposits over the years (80C)', saved, 'inr', true), S('Share of the maturity that is interest', bal > 0 ? (bal - inv) / bal * 100 : 0, 'pct')],
        charts: [ch().line({ title: 'SSY balance', xLabel: 'Year since opening', yfmt: 'inr', area: true, series: [{ name: 'Balance', data: pts }] })],
        table: { head: ['Year', 'Deposit that year', 'Total deposited', 'Interest so far', 'Balance'], rows }, tableTitle: 'Every third year',
        notes: ['After the deposit years the money is not added to, but it still earns the full SSY rate — that is why the last 6 years matter.', old ? '' : 'The new regime has no 80C deduction, so no tax is saved on the deposits.', unverified()[0] || '', DISC].filter(Boolean) };
    }
  });

  /* ---------------- SCSS ---------------- */
  reg({
    id: 'scss', title: 'SCSS Calculator (Senior Citizens Savings Scheme)', group: 'Government', module: 'seniors', tags: 'scss senior citizen savings scheme quarterly income pension retired 60 80c tds 15h',
    intro: 'Regular quarterly income for people aged 60 and above. See the payout, the tax on it and what you really keep each month.',
    fields: [F.money('amt', 'Amount you deposit', 1500000, 3000000, 10000, { lo: SC('SCSS').min, hi: SC('SCSS').max }), F.pct('r', 'SCSS interest rate (yearly, paid out every quarter)', () => sch('SCSS'), 12, 0.05), slabSel(), regimeSel(), F.money('other', 'Other bank / post-office interest you earn each year', 0, 1000000, 5000), F.money('used', 'Other 80C investments you already make each year', 0, 150000, 5000)],
    formula: ['Interest each quarter = Amount × r ÷ 4      (paid out, NOT added to the balance)', 'Interest each year = Amount × r', 'Tax on interest = (interest − 80TTB deduction, old regime) × (slab rate + cess)', 'Monthly income after tax = (yearly interest − tax) ÷ 12'],
    vars: ['SCSS interest is not compounded: you receive it, so it must be spent or reinvested by you', '80TTB (old regime only) lets a senior citizen deduct interest on deposits up to a limit; it is shared with your other bank and post-office interest, which is why we ask for that', 'The principal also counts for 80C in the year of deposit (old regime)'],
    assumptions: ['The account runs for 5 years and can be extended once by 3 years; early closure costs a penalty — verify the current rule', 'TDS is cut when the yearly interest crosses the senior-citizen limit (verify the figure); if your total tax is nil, give the bank Form 15H each year to avoid TDS', 'The rate is reset every quarter for new deposits, but your account keeps the rate on the day you opened it', TAXNOTE],
    compute(v) {
      const e = eff(v.slab), old = v.regime === 'old', yearly = v.amt * v.r / 100, ttb = old ? Math.min(yearly, Math.max(0, ded('80TTB') - v.other)) : 0, tax = Math.max(0, yearly - ttb) * e;
      const room = Math.max(0, ded('80C') - v.used), save80C = old ? Math.min(v.amt, room) * e : 0, netYear = yearly - tax, rows = [];
      for (let k = 1; k <= 5; k++) rows.push([String(k), fmt.inr(yearly), fmt.inr(tax), fmt.inr(netYear), fmt.inr(netYear / 12)]);
      return { summary: [S('You receive every quarter', yearly / 4, 'inr', true), S('Interest in a year', yearly), S('Tax on it each year (estimate)', tax), S('Monthly income after tax', netYear / 12, 'inr', true), S('Yield after tax', v.amt > 0 ? netYear / v.amt * 100 : 0, 'pct'), S('Interest over 5 years', yearly * 5), S('Principal returned at the end', v.amt), S('Tax saved on the deposit in year 1 (80C)', save80C)],
        table: { head: ['Year', 'Interest received', 'Tax', 'Left after tax', 'Per month'], rows }, tableTitle: 'Income year by year',
        notes: ['Ask the bank or post office for Form 15H if your total income is below the taxable limit — otherwise TDS may be cut even though no tax is due.', old ? '80TTB used: ' + fmt.inr(ttb) + ' a year.' : 'The new regime allows no 80TTB deduction and no 80C, so the whole interest is taxed at your slab.', 'Compare with the Post Office Monthly Income Scheme and a bank FD: SCSS usually pays more, but only for age 60+ and up to the limit.'].concat(unverified(), [DISC]) };
    }
  });

  /* ---------------- KVP ---------------- */
  reg({
    id: 'kvp', title: 'KVP Calculator (Kisan Vikas Patra)', group: 'Government', module: 'govt', tags: 'kvp kisan vikas patra double money 115 months post office certificate',
    intro: 'A post-office certificate that doubles your money in a fixed number of months. Find that time, and the value if you hold less or more.',
    fields: [F.money('amt', 'Amount you invest', 100000, 2000000, 1000, { lo: SC('KVP').min }), F.pct('r', 'KVP interest rate (yearly, added every year)', () => sch('KVP'), 12, 0.05, { lo: 0.1 }), F.yrs('y', 'How long you will hold it (years)', 10, 20, 0.5, { lo: 0.5 }), slabSel(), F.pct('inf', 'Expected inflation', assume('inflation'), 15, 0.1)],
    formula: ['Months to double = ln(2) ÷ ln(1 + r) × 12', 'Value after t years = Amount × (1 + r)^t', 'Rule of 72 check: years to double ≈ 72 ÷ rate'],
    vars: ['r = the yearly rate; the government chooses the number of months so that ₹1,000 becomes ₹2,000 at the end', 'The certificate has a lock-in of about 2½ years before it can be cashed early — verify the current rule'],
    assumptions: ['If you hold longer than the doubling period, this calculator assumes you re-buy a new KVP at the same rate (the real rate then will differ)', 'Interest is taxable; individuals who follow the cash system usually pay it in the year they receive it — all in one year can push you into a higher slab, so check with a CA (verify)', TAXNOTE],
    compute(v) {
      const r = v.r / 100, dblY = Math.log(2) / Math.log(1 + r), months = Math.round(dblY * 12);
      const val = v.y <= dblY ? v.amt * Math.pow(1 + r, v.y) : v.amt * 2 * Math.pow(1 + r, v.y - dblY), gain = val - v.amt, e = eff(v.slab), tax = gain * e, post = val - tax;
      return { summary: [S('Time to double your money', months, 'months', true), S('Doubled amount', v.amt * 2), S('Value after your holding period', val, 'inr', true), S('Interest earned', gain), S('Tax on it (estimate)', tax), S('Value after tax', post), S('Yearly return before tax', r * 100, 'pct'), S('Yearly return after tax', (Math.pow(post / v.amt, 1 / v.y) - 1) * 100, 'pct'), S('Rule-of-72 estimate of doubling', 72 / v.r, 'years')],
        notes: [v.y * 12 < 30 ? 'Holding for less than about 30 months is normally not allowed — check the lock-in on your certificate.' : 'You are past the usual lock-in.', v.y > dblY ? 'Beyond the doubling period the figure assumes you buy a new certificate at the same rate.' : '', DISC].filter(Boolean).concat(unverified()) };
    }
  });

  /* ---------------- Post Office MIS ---------------- */
  reg({
    id: 'pomis', title: 'Post Office Monthly Income Scheme (MIS) Calculator', group: 'Government', module: 'postoffice', tags: 'post office mis monthly income scheme pomis regular income five year joint account',
    intro: 'Put a lump sum in for 5 years and receive the interest every month. See the income, the tax and a smarter use of each payout.',
    fields: [F.money('amt', 'Amount you deposit', 900000, 1500000, 10000, { lo: SC('MIS').min, hi: SC('MIS').jointMax || SC('MIS').max }), F.sel('holder', 'Account type', 'single', [['single', 'Single holder (lower limit)'], ['joint', 'Joint (higher limit)']]), F.pct('r', 'MIS interest rate (yearly, paid every month)', () => sch('MIS'), 12, 0.05), slabSel(), F.pct('rd', 'Rate on the recurring deposit where you could park each payout', () => sch('PORD'), 12, 0.05)],
    formula: ['Monthly income = Amount × r ÷ 12      (paid out, not compounded)', 'Total interest over 5 years = Amount × r × 5', 'If every payout goes into a 5-year RD: Principal + RD maturity of the monthly payout', 'Tax = interest × (slab rate + cess), every year'],
    vars: ['The limit differs for a single and a joint account and is set in Data & Sources (verify)', 'MIS interest is fully taxable; there is no 80C benefit on the deposit', 'Early closure is allowed only after 1 year, with a deduction'],
    assumptions: ['The RD alternative assumes you invest the whole payout every month for the full 5 years; RD interest is taxable too', TAXNOTE],
    compute(v) {
      const single = SC('MIS').max, joint = SC('MIS').jointMax || SC('MIS').max, limit = v.holder === 'joint' ? joint : single, amt = Math.min(v.amt, limit), r = v.r / 100, mon = amt * r / 12, e = eff(v.slab);
      const interest = mon * 60, tax = interest * e, rdVal = C.rd(mon, v.rd, 60), keep = amt + rdVal;
      return { summary: [S('Monthly income', mon, 'inr', true), S('Monthly income after tax', mon * (1 - e), 'inr', true), S('Interest in 5 years', interest), S('Tax on it (estimate)', tax), S('Yield after tax', (1 - e) * v.r, 'pct'), S('Principal returned at the end', amt), S('If you invest each payout in an RD instead of spending it: total at the end', keep, 'inr', true), S('That is a gain over the plain MIS of', rdVal - interest)],
        notes: [v.amt > limit ? 'You entered more than the limit for this account type; the figures use ' + fmt.inr(limit) + '.' : '', 'The RD route works only if you can resist spending the payouts. Interest on the RD is taxable as well.', 'MIS is for income. If you do not need the income, a 5-year NSC compounds the same money and also counts for 80C in the old regime.', DISC].filter(Boolean).concat(unverified()) };
    }
  });

  /* ---------------- SGB ---------------- */
  reg({
    id: 'sgb', title: 'Sovereign Gold Bond (SGB) vs Gold ETF', group: 'Alternatives', module: 'gold', tags: 'sgb sovereign gold bond gold etf 2.5 interest tax free maturity rbi',
    intro: 'A government gold bond pays 2.5% a year on top of the gold price. Compare it with a gold ETF after tax.',
    fields: [F.money('amt', 'Amount you invest', 100000, 5000000, 5000, { lo: 1 }), F.money('price', 'Gold price per gram on the issue / purchase date', 6000, 30000, 100, { lo: 1 }), F.pct('g', 'Assumed gold-price growth per year', assume('goldReturn'), 20, 0.5), F.yrs('y', 'Years you hold (8 = full term; early exit possible from year 5)', 8, 8, 1, { lo: 5, hi: 8 }), F.pct('i', 'SGB interest on the issue value (yearly, paid half-yearly)', 2.5, 5, 0.1), slabSel(), F.pct('exp', 'Gold ETF yearly cost (expense ratio)', 0.5, 3, 0.05)],
    formula: ['Grams = Amount ÷ price per gram', 'SGB value = grams × future price + interest received (2.5% × Amount a year)', 'Future price = price × (1 + g)^t', 'SGB: interest taxed at slab; the gain on redemption by the RBI is tax-free', 'Gold ETF: value = Amount × (1 + g − cost)^t; the gain is taxed at the long-term gold rate if held more than 12 months'],
    vars: ['g is an assumption, not a forecast; gold can fall for years', 'The 2.5% is paid on the issue price, not on today\'s price', 'The tax-free redemption applies when you hold the bond to maturity or redeem with the RBI after year 5; selling on the exchange to another buyer is taxed like any other gold'],
    assumptions: ['New SGB tranches have not been issued for a long time (verify). You can still buy existing bonds from the stock exchange at a market price, which may be above or below gold', 'The gold ETF gain is taxed at the rate in the tax configuration (verify); no 1.25 lakh exemption applies to gold', DISC],
    compute(v) {
      const e = eff(v.slab), grams = v.amt / v.price, fut = v.price * Math.pow(1 + v.g / 100, v.y), goldVal = grams * fut, intr = v.amt * v.i / 100 * v.y, intrTax = intr * e, sgb = goldVal + intr - intrTax;
      const etfVal = v.amt * Math.pow(1 + (v.g - v.exp) / 100, v.y), etfTax = Math.max(0, etfVal - v.amt) * yr().capitalGains.gold.rate / 100 * cessMul(), etf = etfVal - etfTax;
      return { summary: [S('Grams of gold', grams, 'num'), S('Gold value at the end', goldVal), S('Interest received over the years', intr), S('Tax on that interest', intrTax), S('SGB: total after tax', sgb, 'inr', true), S('Gold ETF: total after tax', etf, 'inr', true), S('SGB ahead of the ETF by', sgb - etf, 'inr', true), S('SGB yearly return after tax', (Math.pow(sgb / v.amt, 1 / v.y) - 1) * 100, 'pct'), S('ETF yearly return after tax', (Math.pow(etf / v.amt, 1 / v.y) - 1) * 100, 'pct')],
        notes: ['Both options move with the gold price. The SGB\'s edge comes from the 2.5% interest and the tax-free gain — but only for a bond held to maturity or redeemed through the RBI.', 'If the gold price does not rise, the SGB still pays 2.5% and returns the issue-price value in rupees at the market price on redemption.', DISC].concat(unverified()) };
    }
  });

  /* ---------------- STP ---------------- */
  reg({
    id: 'stp', title: 'STP Calculator (Systematic Transfer Plan)', group: 'Investing', module: 'mutualfunds', tags: 'stp systematic transfer plan lump sum liquid debt fund to equity staggered entry',
    intro: 'You have a lump sum. Move it into equity in monthly steps from a debt fund — and see when that helps and when it costs you.',
    fields: [F.money('lump', 'Lump sum you have now', 1000000, 20000000, 10000, { lo: 1 }), F.mon('n', 'Spread the move over (months)', 12, 60, 1, { lo: 1, hi: 120 }), F.pct('eq', 'Assumed equity-fund return (yearly)', assume('equityReturn'), 25, 0.5), F.pct('debt', 'Assumed debt-fund return (yearly)', assume('debtReturn'), 15, 0.5), F.yrs('y', 'Total time you will stay invested (years)', 5, 30, 1, { lo: 1, hi: 40 })],
    formula: ['Each month the plan moves (money still in debt ÷ months left) into equity; the rest earns the debt return', 'Monthly rates are (1 + yearly rate)^(1/12) − 1', 'Compared with: all in equity today, and all left in the debt fund'],
    vars: ['The “market dip” case lowers equity by 20% over the first 6 months and then grows at your assumed return — it shows the case where STP helps', 'Switching out of a debt fund is a sale: tax and exit load apply to each transfer (not modelled — verify)'],
    assumptions: ['Equity and debt returns are assumptions, not promises; real markets are bumpy', 'Before tax, exit load and expense differences', DISC],
    compute(v) {
      const H = Math.round(v.y * 12), n = Math.min(Math.round(v.n), H), md = Math.pow(1 + v.debt / 100, 1 / 12) - 1, me = Math.pow(1 + v.eq / 100, 1 / 12) - 1, dip = Math.pow(0.8, 1 / 6) - 1;
      const run = (eqRate, stp) => { let d = stp ? v.lump : 0, q = stp ? 0 : v.lump; for (let m = 1; m <= H; m++) { if (stp && m <= n) { const x = d / (n - m + 1); d -= x; q += x; } d *= 1 + md; q *= 1 + eqRate(m); } return d + q; };
      const base = (m) => me, dipPath = (m) => (m <= 6 ? dip : me);
      const stpBase = run(base, true), lumpBase = run(base, false), stpDip = run(dipPath, true), lumpDip = run(dipPath, false), debtOnly = v.lump * Math.pow(1 + md, H);
      return { summary: [S('STP: value at the end', stpBase, 'inr', true), S('All in equity today: value at the end', lumpBase, 'inr', true), S('All left in the debt fund', debtOnly), S('STP vs all-in, if markets just grow', stpBase - lumpBase), S('STP: value if equity falls 20% in the first 6 months', stpDip, 'inr', true), S('All-in: value in that same dip', lumpDip, 'inr', true), S('STP vs all-in, in the dip', stpDip - lumpDip)],
        notes: ['If markets keep rising, the part of your money waiting in the debt fund misses some growth — STP lowers the regret of investing just before a fall, and costs a little when markets only go up.', 'STP is a way to manage the fear of bad timing, not a way to earn more. Over long periods, investing at once has usually done better when markets rose; STP helps most if you would otherwise stay out or panic.', 'Each transfer out of a debt fund is a sale for tax. Check the tax and exit load of the specific funds.', DISC] };
    }
  });

  /* ---------------- 80C + NPS planner ---------------- */
  reg({
    id: 'sec80c', title: '80C & NPS Tax-Saving Planner (old regime)', group: 'Tax', module: 'tax', tags: '80c 80ccd nps elss ppf tax saving deduction planner old regime lic tuition home loan principal',
    intro: 'Add what you already invest each year. See how much of the 80C limit is left, the tax you save, and the options to fill the gap.',
    fields: [F.money('epf', 'Your EPF / VPF contribution (a year)', 60000, 150000, 1000), F.money('lic', 'Life-insurance premium (a year)', 0, 150000, 1000), F.money('hl', 'Home-loan principal repaid (a year)', 0, 500000, 1000), F.money('tui', 'Children\'s tuition fees (a year)', 0, 300000, 1000), F.money('ppf', 'PPF deposits (a year)', 0, 150000, 1000), F.money('elss', 'ELSS mutual funds (a year)', 0, 300000, 1000), F.money('oth', '5-year tax-saver FD, NSC, SSY and others (a year)', 0, 300000, 1000), F.money('nps', 'Extra NPS contribution of your own, under 80CCD(1B) (a year)', 0, 200000, 1000), slabSel()],
    formula: ['Counted under 80C = lowest of (total of all 80C items, the 80C limit)', 'Room left = limit − counted', 'Tax saved = amount counted × (slab rate + cess)', 'Extra NPS: the lowest of (your contribution, the 80CCD(1B) limit) × (slab rate + cess)'],
    vars: ['The 80C limit and the 80CCD(1B) limit come from the tax configuration (verify each year)', 'Amounts above the limit give no extra tax benefit', 'Employer NPS contribution (80CCD(2)) is separate and is not counted here'],
    assumptions: ['These deductions are available only in the OLD regime. If you choose the new regime they do nothing — use the Tax Optimizer to see which regime is cheaper for you', TAXNOTE],
    compute(v) {
      const cap = ded('80C'), cap1b = ded('NPS'), e = eff(v.slab), total = v.epf + v.lic + v.hl + v.tui + v.ppf + v.elss + v.oth, counted = Math.min(total, cap), room = Math.max(0, cap - total), wasted = Math.max(0, total - cap), saved = counted * e, nps = Math.min(v.nps, cap1b), npsSaved = nps * e;
      const fill = [['ELSS mutual fund', '3 years', 'Market-linked; can fall', 'ELSS gains are taxed at the equity rate; the 3-year lock-in is the shortest in 80C'], ['PPF', '15 years (part-withdrawal from year 7)', 'Sovereign; rate can change', 'Interest and maturity tax-free'], ['5-year bank / post-office tax-saver FD', '5 years', 'Bank or sovereign', 'Interest is taxable each year'], ['NSC', '5 years', 'Sovereign', 'Interest taxable; years 1–4 interest counts for 80C again'], ['Sukanya Samriddhi (girl child)', 'Until the girl is 21', 'Sovereign', 'Interest and maturity tax-free']].map((x) => [x[0], x[1], x[2], x[3]]);
      return { summary: [S('Total of your 80C items', total), S('Counted (up to the limit)', counted, 'inr', true), S('Room still left under 80C', room, 'inr', true), S('Tax saved by 80C (estimate)', saved, 'inr', true), S('Extra tax you would save by using the remaining room', room * e), S('Extra NPS counted under 80CCD(1B)', nps), S('Tax saved by the extra NPS', npsSaved, 'inr', true), S('Total tax saved this year', saved + npsSaved, 'inr', true), S('Money invested above the limit that earns no deduction', wasted)],
        table: { head: ['Option to fill the room', 'Lock-in', 'Risk', 'Tax note'], rows: fill }, tableTitle: 'Ways to use the remaining 80C room',
        notes: ['Do not buy a product only to save tax. A ' + fmt.inr(Math.max(room, 0)) + ' investment that locks your money for 15 years to save ' + fmt.inr(room * e) + ' is worth it only if you would have saved that money anyway.', 'These deductions apply only in the old regime. Compare regimes with the Tax Optimizer first.'].concat(unverified()) };
    }
  });

  /* ---------------- taxable vs tax-free yield ---------------- */
  reg({
    id: 'taxeq', title: 'Taxable vs Tax-free Yield', group: 'Tax', module: 'tax', tags: 'tax equivalent yield post tax return fd interest tax free bond ppf compare slab',
    intro: 'A 7.5% FD and a 7.1% PPF are not the same once tax is taken out. Compare them on what you actually keep.',
    fields: [F.pct('t', 'Yield of the taxable option (an FD or a bond)', 7.5, 15, 0.05), F.pct('f', 'Yield of the tax-free option (PPF, tax-free bond)', 7.1, 15, 0.05), slabSel(), F.pct('inf', 'Expected inflation', assume('inflation'), 15, 0.1)],
    formula: ['Yield after tax = taxable yield × (1 − (slab rate + cess))', 'Taxable yield that equals a tax-free yield = tax-free yield ÷ (1 − (slab rate + cess))'],
    vars: ['The slab rate is your marginal rate — the rate on your last rupee of income', 'Cess is added to the slab rate'],
    assumptions: ['Both investments assumed to be held for the same time and compounded the same way', TAXNOTE],
    compute(v) {
      const e = eff(v.slab), post = v.t * (1 - e), need = v.f / (1 - e);
      return { summary: [S('Taxable option, after tax', post, 'pct', true), S('Tax-free option', v.f, 'pct', true), S('Taxable yield needed to match the tax-free option', need, 'pct', true), S('The better one after tax', post > v.f ? 'Taxable option' : post < v.f ? 'Tax-free option' : 'They are equal', 'text'), S('Taxable option after tax and inflation (approx.)', ((1 + post / 100) / (1 + v.inf / 100) - 1) * 100, 'pct'), S('Tax-free option after inflation (approx.)', ((1 + v.f / 100) / (1 + v.inf / 100) - 1) * 100, 'pct')],
        notes: ['At the 30% slab a tax-free 7.1% equals a taxable ' + (7.1 / (1 - 0.3 * cessMul())).toFixed(2) + '% — higher than almost any FD. At a lower slab the gap shrinks.', 'Remember lock-ins and limits: a tax-free product that locks money for 15 years is not directly comparable with a 1-year FD.'] };
    }
  });

  /* ---------------- cost of starting late ---------------- */
  reg({
    id: 'delaycost', title: 'Cost of Starting Late', group: 'Investing', module: 'investing', tags: 'delay late start procrastination sip waiting cost compounding catch up',
    intro: 'Waiting a few years looks harmless. See the amount it costs, and how much more you would need to invest each month to catch up.',
    fields: [F.money('m', 'Monthly amount you plan to invest', 10000, 200000, 500, { lo: 1 }), F.pct('r', 'Assumed yearly return', assume('equityReturn'), 25, 0.5), F.yrs('y', 'Total time until you need the money (years)', 25, 40, 1, { lo: 2, hi: 50 }), F.yrs('d', 'How many years you wait before starting', 5, 20, 1, { lo: 0, hi: 40 })],
    formula: ['Start now: value = SIP of the monthly amount for all the years', 'Start late: the same SIP, but only for (years − delay)', 'Catch-up amount = the monthly SIP that reaches the “start now” value in the shorter time'],
    vars: ['Both paths end on the same day; only the start date differs', 'The return is an assumption, not a promise'],
    assumptions: ['Uses the SIP convention chosen in Data & Sources → Planning assumptions', DISC],
    compute(v) {
      const n = Math.round(v.y * 12), late = Math.max(0, n - Math.round(v.d * 12)), now = C.sipFV(v.m, v.r, n), lateV = late > 0 ? C.sipFV(v.m, v.r, late) : 0, catchUp = late > 0 ? C.requiredMonthly(now, 0, v.r, late) : NaN;
      return { summary: [S('If you start now', now, 'inr', true), S('If you start after the wait', lateV, 'inr', true), S('What waiting costs you', now - lateV, 'inr', true), S('Share of the final value lost', now > 0 ? (now - lateV) / now * 100 : 0, 'pct'), S('You invest less by', v.m * (n - late)), S('Monthly amount needed to catch up after the wait', Number.isFinite(catchUp) ? catchUp : 0, 'inr', true), S('That is more than your plan by', Number.isFinite(catchUp) ? catchUp - v.m : 0)],
        charts: [ch().line({ title: 'Starting now vs starting late', xLabel: 'Year', yfmt: 'inr', series: [{ name: 'Start now', data: C.sipSeries(v.m, v.r, v.y).map((p) => ({ x: p.x, y: p.value })) }, { name: 'Start after the wait', data: [{ x: 0, y: 0 }].concat(C.sipSeries(v.m, v.r, Math.max(0, late / 12)).map((p) => ({ x: p.x + (n - late) / 12, y: p.value }))) }] })],
        notes: ['The early years do the heaviest work because the money has the longest time to compound; the cost of waiting grows with how long the plan runs.', DISC] };
    }
  });

  /* ======================================================================
     WHERE SHOULD I INVEST? — one amount, every option, side by side
     ====================================================================== */
  const SAFE = 'Fixed return, government-backed', BANK = 'Fixed return, bank', MKT = 'Market-linked';
  // value of monthly deposits that earn interest on the running balance (PPF / SSY style: deposit by the 5th, credited once a year)
  const ppfLike = (md, depYears, rate, y) => { let bal = 0, inv = 0; for (let yy = 1; yy <= y; yy++) { let acc = 0; for (let m = 1; m <= 12; m++) { if (yy <= depYears) { bal += md; inv += md; } acc += bal * rate / 1200; } bal += acc; } return { inv, val: bal }; };
  // yearly return that turns a stream of monthly net outlay into the final value (bisection) — used to compare options fairly
  const irrMonthly = (net, n, val) => { if (!(net > 0) || !(val > 0)) return NaN; let lo = -0.05, hi = 0.1; const f = (i) => { let s = 0; for (let k = 1; k <= n; k++) s += net * Math.pow(1 + i, n - k + 1); return s; }; for (let it = 0; it < 60; it++) { const mid = (lo + hi) / 2; if (f(mid) < val) lo = mid; else hi = mid; } return (Math.pow(1 + (lo + hi) / 2, 12) - 1) * 100; };

  function buildOptions(v, sh) {
    const monthly = v.mode === 'm', L = v.amt, e = eff(v.slab), old = v.regime === 'old', room = Math.max(0, ded('80C') - v.used), cap1b = ded('NPS'), cess = cessMul(), cg = yr().capitalGains;
    const eqR = Math.max(0, v.eq + sh), goldR = Math.max(0, v.gold + sh), debtR = Math.max(0, v.debt + sh / 2), npsR = Math.max(0, FOS.store.interest('npsReturn') + sh * 0.75);
    const stcg = cg.equitySTCG.rate / 100 * cess, ltcg = cg.equityLTCG.rate / 100 * cess, ex = cg.equityLTCG.exemption || 0, goldTax = cg.gold.rate / 100 * cess, etfCost = 0.5;
    const eqTax = (gain, y) => (gain <= 0 ? 0 : y <= 1 ? gain * stcg : Math.max(0, gain - ex) * ltcg), goldGainTax = (gain) => Math.max(0, gain) * goldTax, slabTax = (gain) => Math.max(0, gain) * e;
    const dsave = (yearly, cap, y, once) => (old ? Math.min(yearly, cap) * e * (once ? 1 : y) : 0);
    const ppfCap = SC('PPF').max, ssyCap = SC('SSY').max, scssCap = SC('SCSS').max;
    const o = [];
    const add = (k, name, lock, risk, at, extra) => o.push(Object.assign({ k, name, lock, risk, at }, extra || {}));
    if (monthly) {
      const yearly = L * 12, md = (cap) => Math.min(L, cap / 12);
      add('base', 'Keep it as cash (no interest)', 'None', 'Inflation slowly eats it', (y) => ({ inv: L * 12 * y, val: L * 12 * y, tax: 0, save: 0 }));
      add('bank', 'Savings account', 'None', BANK, (y) => { const inv = L * 12 * y, val = C.rd(L, FOS.store.interest('savingsAccount'), 12 * y); return { inv, val, tax: slabTax(val - inv), save: 0 }; });
      add('bank', 'Bank recurring deposit (RD)', 'Fixed term; penalty on early exit', BANK + ' (insured up to the deposit-insurance limit)', (y) => { const inv = L * 12 * y, val = C.rd(L, FOS.store.interest('rd'), 12 * y); return { inv, val, tax: slabTax(val - inv), save: 0 }; });
      add('safe', 'Post Office RD', '5 years; part-withdrawal after 1 year', SAFE, (y) => { const inv = L * 12 * y, val = C.rd(L, sch('PORD'), 12 * y); return { inv, val, tax: slabTax(val - inv), save: 0 }; });
      add('safe', 'PPF', '15 years (part-withdrawal from year 7)', SAFE + '; interest and maturity tax-free', (y) => { const r = ppfLike(md(ppfCap), y, sch('PPF'), y); return { inv: r.inv, val: r.val, tax: 0, save: dsave(md(ppfCap) * 12, room, y) }; });
      if (+v.girl === 1) add('safe', 'Sukanya Samriddhi (girl child)', 'Until the girl is 21 (50% after 18)', SAFE + '; interest and maturity tax-free', (y) => { const r = ppfLike(md(ssyCap), Math.min(15, y), sch('SSY'), y); return { inv: r.inv, val: r.val, tax: 0, save: dsave(md(ssyCap) * 12, room, Math.min(15, y)) }; });
      add('mkt', 'NPS (Tier 1) — corpus', 'Until age 60; 60% comes back tax-free, 40% must buy a pension', MKT + ' (equity / debt mix)', (y) => { const inv = L * 12 * y, val = C.sipFV(L, npsR, 12 * y); return { inv, val, tax: 0, save: dsave(yearly, cap1b, y) }; });
      add('mkt', 'ELSS tax-saving mutual fund', '3 years (each instalment)', MKT + ' (equity)', (y) => { const inv = L * 12 * y, val = C.sipFV(L, eqR, 12 * y); return { inv, val, tax: eqTax(val - inv, y), save: dsave(yearly, room, y) }; });
      add('mkt', 'Equity index-fund SIP', 'None (sell any day)', MKT + ' (equity — can fall 30–50%)', (y) => { const inv = L * 12 * y, val = C.sipFV(L, eqR, 12 * y); return { inv, val, tax: eqTax(val - inv, y), save: 0 }; });
      add('mkt', 'Debt mutual-fund SIP', 'None (sell any day)', MKT + ' (interest-rate and credit risk)', (y) => { const inv = L * 12 * y, val = C.sipFV(L, debtR, 12 * y); return { inv, val, tax: slabTax(val - inv), save: 0 }; });
      add('mkt', 'Gold ETF / gold fund SIP', 'None (sell any day)', MKT + ' (gold price)', (y) => { const inv = L * 12 * y, val = C.sipFV(L, Math.max(0, goldR - etfCost), 12 * y); return { inv, val, tax: goldGainTax(val - inv), save: 0 }; });
    } else {
      add('base', 'Keep it as cash (no interest)', 'None', 'Inflation slowly eats it', (y) => ({ inv: L, val: L, tax: 0, save: 0 }));
      add('bank', 'Savings account', 'None', BANK, (y) => ({ inv: L, val: C.compound(L, FOS.store.interest('savingsAccount'), 4, y), tax: slabTax(C.compound(L, FOS.store.interest('savingsAccount'), 4, y) - L), save: 0 }));
      add('bank', 'Bank fixed deposit (FD)', 'Fixed term; penalty on early exit', BANK + ' (insured up to the deposit-insurance limit)', (y) => { const val = C.fd(L, FOS.store.interest('fd1y'), y, 4); return { inv: L, val, tax: slabTax(val - L), save: 0 }; });
      add('safe', 'Post Office Time Deposit', '6 months minimum; 1/2/3/5-year terms', SAFE, (y) => { const val = C.fd(L, sch('POTD'), y, 4); return { inv: L, val, tax: slabTax(val - L), save: old && y >= 5 ? Math.min(L, room) * e : 0 }; });
      add('safe', 'NSC (5 years)', '5 years', SAFE, (y) => { const val = L * Math.pow(1 + sch('NSC') / 100, y); return { inv: L, val, tax: slabTax(val - L), save: dsave(L, room, y, true) }; });
      add('safe', 'KVP (doubles your money)', 'About 2½ years', SAFE, (y) => { const val = L * Math.pow(1 + sch('KVP') / 100, y); return { inv: L, val, tax: slabTax(val - L), save: 0 }; });
      add('safe', 'PPF (one deposit, kept)', '15 years (part-withdrawal from year 7)', SAFE + '; interest and maturity tax-free', (y) => { const d = Math.min(L, ppfCap); return { inv: d, val: d * Math.pow(1 + sch('PPF') / 100, y), tax: 0, save: dsave(d, room, y, true) }; });
      if (+v.girl === 1) add('safe', 'Sukanya Samriddhi (one deposit, kept)', 'Until the girl is 21', SAFE + '; interest and maturity tax-free', (y) => { const d = Math.min(L, ssyCap); return { inv: d, val: d * Math.pow(1 + sch('SSY') / 100, y), tax: 0, save: dsave(d, room, y, true) }; });
      if (+v.senior === 1) add('safe', 'SCSS (age 60+) — principal + interest paid out', '5 years', SAFE + '; interest paid out, not compounded', (y) => { const d = Math.min(L, scssCap), val = d + d * sch('SCSS') / 100 * y; return { inv: d, val, tax: slabTax(val - d), save: dsave(d, room, y, true) }; });
      add('safe', 'Post Office MIS — principal + interest paid out', '5 years; exit after 1 year with a deduction', SAFE + '; interest paid out, not compounded', (y) => { const d = Math.min(L, SC('MIS').max), val = d + d * sch('MIS') / 100 * y; return { inv: d, val, tax: slabTax(val - d), save: 0 }; });
      add('mkt', 'NPS (Tier 1) — corpus', 'Until age 60; 60% comes back tax-free, 40% must buy a pension', MKT + ' (equity / debt mix)', (y) => ({ inv: L, val: L * Math.pow(1 + npsR / 100, y), tax: 0, save: dsave(L, cap1b, y, true) }));
      add('mkt', 'ELSS tax-saving mutual fund', '3 years', MKT + ' (equity)', (y) => { const val = L * Math.pow(1 + eqR / 100, y); return { inv: L, val, tax: eqTax(val - L, y), save: dsave(L, room, y, true) }; });
      add('mkt', 'Equity index fund', 'None (sell any day)', MKT + ' (equity — can fall 30–50%)', (y) => { const val = L * Math.pow(1 + eqR / 100, y); return { inv: L, val, tax: eqTax(val - L, y), save: 0 }; });
      add('mkt', 'Debt mutual fund', 'None (sell any day)', MKT + ' (interest-rate and credit risk)', (y) => { const val = L * Math.pow(1 + debtR / 100, y); return { inv: L, val, tax: slabTax(val - L), save: 0 }; });
      add('mkt', 'Gold ETF / gold fund', 'None (sell any day)', MKT + ' (gold price)', (y) => { const val = L * Math.pow(1 + Math.max(0, goldR - etfCost) / 100, y); return { inv: L, val, tax: goldGainTax(val - L), save: 0 }; });
      if (v.y >= 5 && v.y <= 8) add('mkt', 'Sovereign Gold Bond (if you can buy one)', '8 years (RBI exit from year 5)', MKT + ' (gold price) + sovereign backing', (y) => { const val = L * Math.pow(1 + goldR / 100, y) + L * 0.025 * y; return { inv: L, val, tax: slabTax(L * 0.025 * y), save: 0 }; });
    }
    return o;
  }

  const LOCKYEARS = { 'PPF': 15, 'PPF (one deposit, kept)': 15, 'NSC (5 years)': 5, 'KVP (doubles your money)': 2.5, 'ELSS tax-saving mutual fund': 3, 'Post Office RD': 5, 'Post Office MIS — principal + interest paid out': 5, 'SCSS (age 60+) — principal + interest paid out': 5, 'Sukanya Samriddhi (girl child)': 21, 'Sukanya Samriddhi (one deposit, kept)': 21, 'Sovereign Gold Bond (if you can buy one)': 5 };

  reg({
    id: 'investcompare', title: 'Where should I invest? Every option side by side', group: 'Investing', module: 'investing', tags: 'where to invest compare options ppf nsc fd rd elss nps sip gold tax saved post tax return monthly lump sum decision best',
    intro: 'Tell us how much you can invest and for how long. See what each option gives you after tax, how much tax it saves, and the lock-in and risk that come with it.',
    fields: [F.sel('mode', 'How will you invest?', 'm', [['m', 'A fixed amount every month'], ['l', 'One lump sum, once']]), F.money('amt', 'Amount (each month, or the one-time amount)', 10000, 5000000, 500, { lo: 1 }), F.yrs('y', 'How long can you stay invested (years)', 10, 40, 1, { lo: 1, hi: 40 }), regimeSel(), slabSel(), F.money('used', '80C room already used (EPF, insurance, home-loan principal …) — old regime', 0, 150000, 5000), F.sel('senior', 'Are you a senior citizen (60 or older)?', '0', [['0', 'No'], ['1', 'Yes — include SCSS']]), F.sel('girl', 'Do you have a girl child under 10?', '0', [['0', 'No'], ['1', 'Yes — include Sukanya Samriddhi']]), F.pct('eq', 'Equity return you assume (yearly)', assume('equityReturn'), 25, 0.5), F.pct('debt', 'Debt-fund return you assume (yearly)', assume('debtReturn'), 15, 0.5), F.pct('gold', 'Gold return you assume (yearly)', assume('goldReturn'), 20, 0.5), F.pct('inf', 'Inflation you assume (yearly)', assume('inflation'), 15, 0.1)],
    formula: ['Value at the end = the amount grown at each option\'s rate (fixed-return options use their published rate; market-linked options use YOUR assumed return)', 'Tax on returns = the gain × the rule for that option (slab rate + cess for interest; the equity or gold capital-gains rate for funds; nil for PPF / SSY)', 'Tax saved = the deductible amount × (slab rate + cess) — old regime only (80C for PPF, ELSS, NSC, SSY; 80CCD(1B) for NPS)', 'Total benefit = value after tax + tax saved.   Gain = total benefit − what you put in', 'Yearly return = the rate that turns your net outlay (what you put in minus tax saved) into the value after tax'],
    vars: ['Each option is shown as if it were your ONLY 80C investment; the 80C limit is shared, so do not add the “tax saved” of several options together', 'Options with a payout (SCSS, MIS) show principal plus interest received, not reinvested', 'NPS: 60% of the corpus is tax-free; the other 40% buys a pension that is taxed when you receive it — not deducted here', 'Fixed-return rates come from Data & Sources and change every quarter (verify)'],
    assumptions: ['Market-linked returns are NOT promises: the second table shows what happens if they fall short or surprise, and the real path will be bumpier', 'Equity gains are taxed as long-term when held more than a year, with the yearly exemption used once; many small SIP units held under a year would be taxed higher', 'Ignores brokerage, fund cost differences beyond a 0.5% gold-fund cost, exit loads, TDS timing and the effect on your slab', TAXNOTE],
    compute(v) {
      const L = v.amt, Y = Math.max(1, Math.round(v.y)), monthly = v.mode === 'm', opts = buildOptions(v, 0), n = 12 * Y;
      const rows = opts.map((o) => { const a = o.at(Y), after = a.val - a.tax, total = after + a.save, gain = total - a.inv, real = C.deflate(total, v.inf, Y), net = a.inv - a.save, full = monthly ? L * 12 * Y : L;
        const ret = monthly ? irrMonthly(net / n, n, after) : (net > 0 && after > 0 ? (Math.pow(after / net, 1 / Y) - 1) * 100 : NaN), label = o.name + (a.inv < full - 0.5 ? ' — only ' + fmt.inr(a.inv) + ' of your ' + fmt.inr(full) + ' fits' : '');
        return Object.assign({}, o, a, { after, total, gain, real, ret, label, capped: a.inv < full - 0.5 }); }).sort((a, b) => (Number.isFinite(b.ret) ? b.ret : -1e9) - (Number.isFinite(a.ret) ? a.ret : -1e9) || b.total - a.total);
      const best = rows[0], safe = rows.find((x) => x.k === 'safe' || x.k === 'bank'), mkt = rows.find((x) => x.k === 'mkt'), cash = rows.find((x) => x.k === 'base'), invested = cash.inv;
      const top = rows.filter((x) => !x.capped).slice(0, 4), chart = ch().line({ title: 'How the best options grow (after tax, including tax saved)', xLabel: 'Year', yfmt: 'inr', series: top.map((o) => ({ name: o.label, data: Array.from({ length: Y + 1 }, (_, y) => { if (!y) return { x: 0, y: monthly ? 0 : o.at(1).inv }; const a = o.at(y); return { x: y, y: a.val - a.tax + a.save }; }) })).concat([{ name: 'What you put in', dash: true, data: Array.from({ length: Y + 1 }, (_, y) => ({ x: y, y: y ? cash.at(y).inv : (monthly ? 0 : cash.at(1).inv) })) }]) });
      const low = buildOptions(v, -4), high = buildOptions(v, 4), exp = buildOptions(v, 0), mk = exp.filter((o) => o.k === 'mkt');
      const val = (list, name) => { const o = list.find((x) => x.name === name), a = o.at(Y); return a.val - a.tax; };
      const scen = mk.map((o) => [o.name, fmt.inr(val(low, o.name)), fmt.inr(val(exp, o.name)), fmt.inr(val(high, o.name))]);
      const locked = rows.filter((o) => LOCKYEARS[o.name] && Y < LOCKYEARS[o.name]).map((o) => o.name + ' (' + LOCKYEARS[o.name] + ' yrs)');
      const anyCapped = rows.some((o) => o.capped), old = v.regime === 'old';
      return { summary: [S(monthly ? 'Total you put in' : 'You put in', invested, 'inr'), S('Highest yearly return after tax', best.label, 'text', true), S('…its yearly return', Number.isFinite(best.ret) ? best.ret : 0, 'pct', true), S('…its total benefit (value after tax + tax saved)', best.total, 'inr'), S('Best fixed-return option', safe ? safe.label : '—', 'text'), S('…its yearly return', safe && Number.isFinite(safe.ret) ? safe.ret : 0, 'pct'), S('…its total benefit', safe ? safe.total : 0), S('Best market-linked option (if returns match your assumption)', mkt ? mkt.label : '—', 'text'), S('…its yearly return', mkt && Number.isFinite(mkt.ret) ? mkt.ret : 0, 'pct'), S('…its total benefit', mkt ? mkt.total : 0), S('Tax saved by the best tax-saving option (old regime)', Math.max(0, ...rows.map((x) => x.save)), 'inr'), S('If you just keep it as cash: buying power left, in today\'s money', C.deflate(invested, v.inf, Y), 'inr')],
        charts: [chart],
        table: { head: ['Option (best yearly return first)', 'You put in', 'Value after tax', 'Tax saved up front', 'Total benefit', 'Gain over what you put in', 'Yearly return*', 'Total in today\'s money', 'Lock-in', 'Risk'], rows: rows.map((o) => [o.label, fmt.inr(o.inv), fmt.inr(o.after), o.save ? fmt.inr(o.save) : '—', fmt.inr(o.total), fmt.inr(o.gain), Number.isFinite(o.ret) ? (Math.abs(o.ret) < 0.005 ? 0 : o.ret).toFixed(2) + '%' : '—', fmt.inr(o.real), o.lock, o.risk]) }, tableTitle: 'Every option, ranked by yearly return after tax',
        html: `<h4>What if markets disappoint — or surprise?</h4><p class="muted">Value after tax for the market-linked options if the returns you assumed are 4 points lower or 4 points higher (gold and equity), with proportionate moves for debt and NPS. Fixed-return options do not change.</p>` + (FOS.ui && FOS.tableHTML ? FOS.tableHTML(['Option', 'If returns are lower', 'At your assumption', 'If returns are higher'], scen) : ''),
        notes: [(old ? 'Old regime: tax saved assumes you use the deduction in full. ' : 'New regime: no 80C or NPS(1B) deduction applies, so “tax saved” is nil — switch the regime above to see the old-regime effect, and use the Tax Optimizer to see which regime is cheaper for you. ') + 'Each option is shown as if it were your only 80C investment.', locked.length ? 'Your time horizon is shorter than the lock-in of: ' + locked.join(', ') + '. Money in those is not available, or is penalised, if you need it earlier.' : '', anyCapped ? 'Options marked “only … fits” have a ceiling on how much they take. The rest of your money needs another home, so their totals are smaller than the others — judge them by the yearly return.' : '', 'Fixed-term options (NSC, KVP, time deposits, RD, SCSS, MIS) shown for longer than their term assume you renew at the same rate; real rates will differ. The Sovereign Gold Bond appears only for 5–8 year horizons.', '*Yearly return is approximate: it spreads your tax saving evenly and uses the value after tax. It is useful for comparing options, not as a promise.', 'The “best” option on paper is not automatically right for you: match each rupee to a goal and a date first (emergency money should never sit in a lock-in or in equity), then use this table to choose among the options that fit.', DISC].filter(Boolean).concat(unverified()) };
    }
  });

  // small helper used by the scenario table above
  FOS.tableHTML = FOS.tableHTML || ((head, rows) => `<div class="table-scroll"><table class="data"><thead><tr>${head.map((h) => `<th scope="col">${FOS.ui.esc(h)}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c, i) => (i ? `<td>${FOS.ui.esc(c)}</td>` : `<th scope="row">${FOS.ui.esc(c)}</th>`)).join('')}</tr>`).join('')}</tbody></table></div>`);

  /* ---------------- About text + worked examples for the tools above ---------------- */
  Object.assign(FOS.ABOUT.calc, {
    nsc: ['Shows what a National Savings Certificate pays after 5 years, the tax on its yearly interest and the tax you can save under Section 80C.', 'You are choosing between a post-office certificate, a bank FD and other tax-saving options.', 'Read "Maturity after tax" for what you keep, and the last line for the return once the 80C saving is counted. The table shows each year\'s interest and tax.'],
    ssy: ['Projects a Sukanya Samriddhi account to its maturity 21 years after opening, including what you can take out at 18 and the tax you save.', 'You have a daughter below 10 and want to see what regular yearly deposits become.', 'The big number is the money at maturity; "Withdraw at 18" is the amount available for education. Note how much of the final amount is interest.'],
    scss: ['Shows the quarterly income, the tax and the monthly in-hand amount from the Senior Citizens Savings Scheme.', 'You are 60 or older and want regular, safe income from a lump sum.', 'Look at "Monthly income after tax" and the yield after tax; compare these with an FD and the Post Office Monthly Income Scheme.'],
    kvp: ['Finds how long a Kisan Vikas Patra takes to double your money and its value if you hold it for a shorter or longer time.', 'You want a simple fixed-rate certificate and wonder how long the doubling takes.', 'Read "Time to double" first, then the value after tax at your holding period.'],
    pomis: ['Works out the monthly income from the Post Office Monthly Income Scheme and compares spending the payout with putting it in a recurring deposit.', 'You want a steady monthly amount from a lump sum for 5 years.', 'Compare the plain income with the "invest each payout in an RD" total at the end; the gap is the extra you earn if you do not spend the payout.'],
    sgb: ['Compares a Sovereign Gold Bond (gold price plus 2.5% yearly interest, tax-free gain at maturity) with a gold ETF, after tax.', 'You want gold in your portfolio and are choosing between a bond and an ETF.', 'The line "SGB ahead of the ETF by" shows the benefit of the interest and the tax-free redemption under your assumed gold price.'],
    stp: ['Compares moving a lump sum into equity in monthly steps (STP) with investing it all at once, in a normal market and in a market dip.', 'You have received a bonus, sale proceeds or maturity money and fear investing it just before a fall.', 'Compare the two scenarios: STP trails when markets rise and protects when they dip. It lowers regret; it does not raise the expected return.'],
    sec80c: ['Adds up what you invest for tax saving, shows how much of the 80C limit is left and the tax you save, including extra NPS.', 'You are in the old regime (or considering it) and want to use the deductions without overspending.', 'Check "Room still left" and "Total tax saved". The table lists ways to use the room, each with its lock-in and risk.'],
    taxeq: ['Compares a taxable return (FD, bond) with a tax-free one (PPF, tax-free bond) on what you keep after tax.', 'You are choosing between an FD and PPF or another tax-free option.', 'The line "Taxable yield needed to match" is the FD rate you would need to equal the tax-free one at your slab.'],
    delaycost: ['Shows what waiting a few years before you start investing costs, and the monthly amount that would catch you up.', 'You are postponing a SIP, or someone you know is.', 'The cost of waiting is the gap between the two final values. The catch-up amount is how much more you must invest each month if you start late.'],
    investcompare: ['Takes one amount, monthly or lump sum, and one time period, and shows what every common option gives you after tax, the tax each saves, and its lock-in and risk.', 'You have money to invest and want to see all the choices side by side before deciding.', 'Start with the ranked table: "Total benefit" is the value after tax plus the tax saved. Then look at the lock-in and risk columns, and the table of lower and higher market returns.']
  });
  const note = (...n) => n;
  Object.assign(FOS.EXAMPLES, {
    nsc: ['Meera invests ₹1 lakh in an NSC. She is in the 30% slab, uses the old regime and already puts ₹50,000 a year into 80C.', { used: 50000, regime: 'old' }, note('The amount you put in the certificate.', 'The rate printed on the certificate; it stays the same for 5 years.', 'Your income-tax slab, used to estimate tax on the interest.', 'Old regime allows an 80C deduction; the new regime does not.', 'The part of the ₹1.5 lakh 80C limit already used by EPF, insurance and so on.', 'Expected yearly inflation, to show the return in real terms.')],
    ssy: ['Rahul opens an SSY for his 2-year-old daughter and deposits ₹1 lakh a year for 15 years. He is in the 30% slab and uses the old regime.', { regime: 'old' }, note('The amount you deposit every year (₹250 to ₹1.5 lakh).', 'The SSY rate for the quarter; assumed to stay the same.', 'How many years you will deposit; the maximum is 15.', 'The girl\'s age when the account is opened; she must be under 10.', 'Your income-tax slab, used for the tax-saving estimate.', 'The old regime allows 80C; the new regime does not.', 'Other 80C investments you already make each year.')],
    scss: ['Mr Iyer, 62, retires and deposits ₹15 lakh in the SCSS. He is in the 20% slab, uses the old regime and earns ₹20,000 interest from savings accounts.', { slab: 20, regime: 'old', other: 20000 }, note('The amount you deposit (up to the scheme limit).', 'The rate for your account; paid out every quarter.', 'Your income-tax slab, to estimate tax on the interest.', 'Old regime allows 80C and 80TTB; the new regime does not.', 'Interest from your other savings accounts and deposits, which shares the 80TTB limit.', 'Other 80C investments you make each year.')],
    kvp: ['Asha invests ₹1 lakh in a Kisan Vikas Patra and holds it for 10 years. She is in the 20% slab.', { slab: 20 }, note('The amount you invest.', 'The rate for the certificate you buy.', 'How many years you will hold it.', 'Your income-tax slab, to estimate the tax on the interest.', 'Expected yearly inflation.')],
    pomis: ['Kiran, a retiree, puts ₹9 lakh in the Post Office MIS and thinks of putting each payout in a recurring deposit. He is in the 10% slab.', { slab: 10 }, note('The amount you deposit.', 'Single holders have a lower limit than joint holders.', 'The scheme\'s yearly rate, paid monthly.', 'Your income-tax slab.', 'The rate on the recurring deposit where each payout could be saved.')],
    sgb: ['Dev invests ₹1 lakh in a Sovereign Gold Bond at ₹6,000 a gram, holds it 8 years and assumes the gold price grows 8% a year. He is in the 30% slab.', { g: 8 }, note('The amount you invest in gold.', 'The price of a gram when you buy.', 'The yearly rise in the gold price you assume (an assumption, not a forecast).', 'How many years you hold; 8 is the full term.', 'The bond\'s yearly interest on the issue value.', 'Your income-tax slab, for tax on the interest.', 'The yearly cost of a gold ETF, for the comparison.')],
    stp: ['Nisha receives a ₹10 lakh bonus. She compares investing it all in equity now with a 12-month STP, over 5 years.', {}, note('The lump sum you have now.', 'Over how many months you will move it from debt to equity.', 'The yearly equity return you assume.', 'The yearly return you assume while the money waits in the debt fund.', 'The total time you will stay invested.')],
    sec80c: ['Tanvir pays ₹60,000 into EPF, ₹30,000 for insurance, ₹40,000 as home-loan principal and ₹20,000 into PPF, plus ₹30,000 into NPS on his own. He is in the 30% slab.', { epf: 60000, lic: 30000, hl: 40000, ppf: 20000, nps: 30000 }, note('What is deducted from your salary for EPF or VPF.', 'The premium you pay for life insurance.', 'The principal part of your home-loan EMIs.', 'Fees paid for children\'s education.', 'Money you put in PPF during the year.', 'Money you put in tax-saving mutual funds (ELSS).', 'Money in tax-saver FDs, NSC, SSY and similar.', 'Your own extra NPS contribution, which has a separate limit.', 'Your income-tax slab.')],
    taxeq: ['Priya compares a 7.5% bank FD with a 7.1% PPF. She is in the 30% slab.', {}, note('The interest rate on the taxable option.', 'The rate on the tax-free option.', 'Your income-tax slab.', 'Expected yearly inflation.')],
    delaycost: ['Sam plans to invest ₹10,000 a month for 25 years, but wants to start 5 years later. What does the wait cost?', {}, note('What you plan to invest every month.', 'The yearly return you assume.', 'How many years until you need the money.', 'How many years you wait before starting.')],
    investcompare: ['Rohit, 30, new regime, 30% slab, wants to invest ₹10,000 a month for 15 years and sees every option side by side.', { y: 15 }, note('Whether you invest monthly or once.', 'The monthly or one-time amount.', 'How long you can leave the money.', 'Old regime shows the 80C and NPS tax savings; new regime shows none.', 'Your income-tax slab.', 'How much of the 80C limit is already used.', 'Choose Yes to include the Senior Citizens Savings Scheme.', 'Choose Yes to include Sukanya Samriddhi.', 'The yearly equity return you assume; not a promise.', 'The yearly debt-fund return you assume.', 'The yearly gold return you assume.', 'The yearly inflation you assume, to show buying power.')]
  });
})();
