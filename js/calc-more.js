/* ==========================================================================
   calc-more.js — calculators for real life beyond the basics: salary extras (gratuity, EPF, job offers, ESOP tax),
   retirement withdrawals, home-loan tax benefit, loan transfer, traditional-policy returns, advance tax, GST, property-sale tax,
   rental yield, residential status, SIP return (XIRR), rebalancing, education-loan moratorium and startup maths.
   Every rate or limit comes from the configuration (data.js) — nothing time-sensitive is hard-coded here.
   ========================================================================== */
(function () {
  'use strict';
  const { F, S, reg } = FOS, C = FOS.calc, fmt = FOS.fmt, ch = () => FOS.charts, A = () => FOS.FINANCIAL_ASSUMPTIONS, DISC = FOS.ui.disclaimer;
  const yr = () => FOS.TAX_RULES.years[FOS.TAX_RULES.defaultYear];
  const cessMul = () => 1 + (yr().regimes.new.cessPct || 0) / 100;
  const unverified = () => (yr().verified === false ? ['The tax rules for ' + yr().label + ' are an UNVERIFIED copy of the previous year — check them in Data & Sources.'] : []);
  const text = (l, v, hi) => S(l, v, 'text', hi);

  /* ---------------- salary extras ---------------- */
  reg({
    id: 'gratuity', title: 'Gratuity Calculator', group: 'Income', module: 'income', tags: 'gratuity retirement benefit service years basic da employer five years payment of gratuity act',
    intro: 'Gratuity is a lump sum your employer pays after long service. See what the formula gives and what the legal ceiling does to it.',
    fields: [F.money('basic', 'Last drawn monthly basic + dearness allowance', 60000, 500000, 1000, { lo: 1 }), F.yrs('yrs', 'Years of service with this employer', 10, 45, 0.5, { lo: 0.5 }), F.sel('cov', 'Is your employer covered by the Payment of Gratuity Act?', '1', [['1', 'Yes (most firms with 10 or more employees)'], ['0', 'No (the employer pays under its own policy)']])],
    formula: ['Covered by the Act: Gratuity = last drawn (basic + DA) × 15 ÷ 26 × completed years of service', 'Not covered: Gratuity = last drawn (basic + DA) × 15 ÷ 30 × completed years of service', 'A final part-year of more than 6 months counts as a full year'],
    vars: ['“Completed years” rounds a final part-year of more than 6 months up to a full year', 'The legal ceiling and tax-free limit (₹20 lakh by default) are set in Data & Sources — verify the current figure'],
    assumptions: ['Gratuity is normally payable after 5 years of continuous service (exceptions include death or disablement)', 'The new Labour Codes can change what counts as “wages” and the eligibility of fixed-term staff — ask HR how your employer applies them'],
    compute(v) {
      const whole = Math.floor(v.yrs), svc = whole + ((v.yrs - whole) * 12 > 6 ? 1 : 0), per = +v.cov === 1 ? 26 : 30, raw = v.basic * 15 / per * svc, cap = A().salary.gratuityCap, due = +v.cov === 1 ? Math.min(raw, cap) : raw;
      return { summary: [S('Years counted', svc, 'years'), S('Gratuity as per the formula', raw, 'inr', true), S('Payable after the legal ceiling', due, 'inr', true), S('Tax-free limit (private sector, lifetime)', cap)],
        notes: [svc < 5 ? 'With fewer than 5 years of service gratuity is normally not payable.' : 'You are past the usual 5-year eligibility.', 'The tax-free amount is the lowest of: what you receive, the formula amount and the ceiling. Anything an employer pays above that is taxed as salary.', DISC] };
    }
  });

  reg({
    id: 'epf', title: 'EPF / VPF Corpus Calculator', group: 'Retirement', module: 'retirement', tags: 'epf pf provident fund vpf employee employer eps pension corpus interest uan',
    intro: 'Project your provident-fund balance with yearly pay rises and an optional VPF top-up, and see the EPS pension you may be entitled to.',
    fields: [F.money('basic', 'Monthly basic + DA today', 50000, 300000, 1000, { lo: 1 }), F.pct('emp', 'Your contribution (% of basic)', () => A().salary.employeePfPctOfBasic, 100, 1), F.pct('vpf', 'Extra voluntary contribution — VPF (% of basic)', 0, 88, 1), F.pct('g', 'Yearly pay rise', 6, 20, 0.5), F.yrs('y', 'Years until you stop contributing', 20, 40, 1, { lo: 1 }), F.money('cur', 'Balance already in your EPF', 0, 20000000, 10000), F.pct('r', 'EPF interest rate', () => FOS.store.interest('epf'), 12, 0.05)],
    formula: ['Each month: your share + the employer\'s EPF share are added; interest = opening balance × rate ÷ 12, credited at the end of the year', 'The employer pays 12% of basic: 8.33% of basic (up to the EPS wage ceiling) goes to the EPS pension, the rest to your EPF', 'EPS pension ≈ pensionable salary (capped) × years of pensionable service ÷ 70'],
    vars: ['Interest on contributions above ₹2.5 lakh a year (employee share) is taxable — the result flags it', 'The EPS pension needs at least 10 years of service and starts from age 58'],
    assumptions: ['The EPF rate is declared yearly by the EPFO and can change — update it in Data & Sources', DISC],
    compute(v) {
      const er = A().salary.employerPfPctOfBasic / 100, epsPct = A().salary.epsPct / 100, ceil = A().salary.epsWageCeiling, inf = FOS.store.assume('inflation'), years = Math.round(v.y);
      let bal = v.cur, basic = v.basic, mine = 0, theirs = 0, interest = 0, maxYear = 0, last = v.basic; const pts = [{ x: 0, y: bal }];
      for (let y = 1; y <= years; y++) {
        let accr = 0, yMine = 0; last = basic;
        for (let m = 0; m < 12; m++) { const e = basic * (v.emp + v.vpf) / 100, p = Math.max(0, basic * er - Math.min(basic, ceil) * epsPct); accr += bal * v.r / 1200; bal += e + p; mine += e; theirs += p; yMine += e; }
        bal += accr; interest += accr; maxYear = Math.max(maxYear, yMine); pts.push({ x: y, y: bal }); basic *= 1 + v.g / 100;
      }
      const pension = years >= 10 ? Math.min(last, ceil) * years / 70 : 0;
      return { summary: [S('EPF balance at the end', bal, 'inr', true), S('In today\'s money (after inflation)', C.deflate(bal, inf, years), 'inr', true), S('Your contributions', mine), S('Employer contributions to EPF', theirs), S('Interest earned', interest), S('EPS pension per month (from age 58)', pension)],
        charts: [ch().line({ title: 'EPF balance', xLabel: 'Year', yfmt: 'inr', area: true, series: [{ name: 'EPF balance', data: pts }] })],
        notes: (maxYear > 250000 ? ['Your own contributions exceed ₹2.5 lakh in some years: the interest on the excess is taxable every year.'] : []).concat(years < 10 ? ['EPS pension needs at least 10 years of service.'] : [], [DISC]) };
    }
  });

  reg({
    id: 'offercompare', title: 'Job Offer Comparison (in-hand pay)', group: 'Income', module: 'income', tags: 'job offer compare ctc in hand take home salary negotiation switch variable bonus relocation',
    intro: 'Two offers, one fair comparison: what actually reaches your bank account after PF and tax, plus joining bonus and the extra cost of living.',
    fields: [F.money('ctcA', 'Offer A — yearly CTC', 1200000, 50000000, 50000, { lo: 1 }), F.money('varA', 'Offer A — variable pay inside the CTC', 100000, 20000000, 10000), F.money('bonA', 'Offer A — one-time joining bonus', 0, 5000000, 10000), F.money('ctcB', 'Offer B — yearly CTC', 1500000, 50000000, 50000, { lo: 1 }), F.money('varB', 'Offer B — variable pay inside the CTC', 300000, 20000000, 10000), F.money('bonB', 'Offer B — one-time joining bonus', 100000, 5000000, 10000), F.pct('pay', 'Share of the variable pay you expect to receive', 80, 150, 5), F.pct('basic', 'Basic salary as % of fixed pay', 40, 70, 1), F.pct('pf', 'Employer PF (% of basic)', () => A().salary.employerPfPctOfBasic, 12, 0.5), F.money('rent', 'Extra monthly living cost at B compared with A (rent, commute)', 0, 200000, 500), F.yrs('yrs', 'Compare over (years)', 3, 10, 1, { lo: 1 })],
    formula: ['Fixed pay = CTC − variable; PF = basic × PF %', 'Taxable = fixed − employer PF + expected variable − standard deduction; tax from the default year\'s new-regime slabs', 'In-hand = fixed − employer PF − your PF + expected variable − tax'],
    vars: ['Employee PF is assumed equal to the employer share', 'Joining bonus is shown separately and is taxable in practice — it is added untaxed here, so treat it as an upper bound'],
    assumptions: ['New regime is used for both offers; ESOPs, insurance, notice-period buy-outs and clawbacks are not modelled', DISC],
    compute(v) {
      const rg = yr().regimes.new, inHand = (ctc, vp) => { const fixed = Math.max(0, ctc - vp), pfAmt = fixed * v.basic / 100 * v.pf / 100, gross = fixed - pfAmt + vp * v.pay / 100, tax = C.incomeTax(Math.max(0, gross - rg.stdDeduction), rg).total; return { tax, pf: pfAmt, net: gross - pfAmt - tax }; };
      const a = inHand(v.ctcA, v.varA), b = inHand(v.ctcB, v.varB), totA = a.net * v.yrs + v.bonA, totB = b.net * v.yrs + v.bonB - v.rent * 12 * v.yrs;
      return { summary: [S('Offer A: in-hand per month', a.net / 12, 'inr', true), S('Offer B: in-hand per month', b.net / 12, 'inr', true), S('Difference per month (B − A)', (b.net - a.net) / 12 - v.rent), S('Offer A: tax per year', a.tax), S('Offer B: tax per year', b.tax), S('Offer A: total over ' + v.yrs + ' years (with bonus)', totA), S('Offer B: total over ' + v.yrs + ' years (with bonus, after extra living cost)', totB, 'inr', true), S('Difference over ' + v.yrs + ' years (B − A)', totB - totA, 'inr', true)],
        notes: ['Money is only part of a job decision: growth, learning, stability, location and the people matter too.'].concat(unverified(), [DISC]) };
    }
  });

  reg({
    id: 'esoptax', title: 'ESOP / RSU Tax Estimator', group: 'Income', module: 'career', tags: 'esop rsu stock options exercise perquisite capital gains tax employee shares startup',
    intro: 'Stock options are taxed twice: when you exercise (as salary) and when you sell (as capital gains). See both and what you keep.',
    fields: [F.num('qty', 'Number of shares', 1000, 10000000, 100, { lo: 1 }), F.money('ex', 'Exercise price per share', 10, 1000000, 1), F.money('fmv', 'Fair market value per share on the day you exercise', 200, 10000000, 1), F.money('sell', 'Price per share when you sell', 400, 10000000, 1), F.mon('hold', 'Months you hold the shares after exercising', 30, 600, 1), F.sel('kind', 'The shares are', 'unlisted', [['unlisted', 'Unlisted (a private company)'], ['listed', 'Listed on a stock exchange']]), F.pct('slab', 'Your income-tax slab rate', 30, 40, 1)],
    formula: ['Perquisite at exercise = (FMV − exercise price) × shares, taxed as salary at your slab (+ cess)', 'Capital gain at sale = (sale price − FMV) × shares', 'Unlisted shares: long-term after 24 months (12.5%), else slab. Listed: long-term after 12 months (12.5% above the yearly exemption), else 20%'],
    vars: ['Rates and holding periods come from the tax configuration for the default year', 'Employees of DPIIT-recognised startups may defer the perquisite tax — not modelled'],
    assumptions: ['Surcharge is ignored; foreign RSUs (currency, Schedule FA reporting, foreign tax credit) are not modelled', DISC],
    compute(v) {
      const cg = yr().capitalGains, perq = Math.max(0, (v.fmv - v.ex) * v.qty), perqTax = perq * v.slab / 100 * cessMul(), gain = (v.sell - v.fmv) * v.qty, listed = v.kind === 'listed', long = v.hold > (listed ? 12 : 24);
      const rate = long ? (cg.equityLTCG.rate) : listed ? cg.equitySTCG.rate : v.slab, exempt = listed && long ? Math.min(Math.max(0, gain), cg.equityLTCG.exemption || 0) : 0, gainTax = Math.max(0, gain - exempt) * rate / 100 * cessMul();
      const cost = v.ex * v.qty, proceeds = v.sell * v.qty, total = perqTax + gainTax;
      return { summary: [S('Perquisite taxed as salary at exercise', perq), S('Tax at exercise', perqTax, 'inr', true), S('Capital gain at sale', gain), text('Gain is', long ? 'Long-term' : 'Short-term'), S('Tax on the gain (incl. cess)', gainTax, 'inr', true), S('Total tax', total, 'inr', true), S('You keep (sale value − exercise cost − tax)', proceeds - cost - total, 'inr', true)],
        notes: ['The exercise tax is due even if you cannot sell the shares yet (common in private companies). Plan for that cash.', 'If the sale price is below the exercise-day value the loss is a capital loss; it can only be set against capital gains.'].concat(unverified(), [DISC]) };
    }
  });

  /* ---------------- retirement, deposits, policies ---------------- */
  reg({
    id: 'swp', title: 'Withdrawal Planner (SWP / retirement income)', group: 'Retirement', module: 'retirement', tags: 'swp systematic withdrawal plan retirement income corpus last how long safe withdrawal rate monthly pension inflation',
    intro: 'How long will your money last if you take a monthly income from it? Also finds the highest starting withdrawal that lasts the whole plan.',
    fields: [F.money('corpus', 'Money you start with', 10000000, 500000000, 100000, { lo: 1 }), F.money('w', 'Monthly withdrawal at the start', 50000, 5000000, 1000, { lo: 1 }), F.pct('r', 'Return on the money that remains (per year)', () => FOS.store.assume('postRetirementReturn'), 15, 0.1), F.pct('inf', 'Yearly increase in your withdrawal (inflation)', () => FOS.store.assume('inflation'), 12, 0.1), F.yrs('y', 'Years to plan for', 30, 60, 1, { lo: 1 })],
    formula: ['Each month: balance = balance × (1 + monthly return) − withdrawal', 'The withdrawal grows by the inflation rate once every 12 months', 'Safe starting withdrawal = the largest withdrawal for which the balance never runs out within the plan'],
    vars: ['Withdrawals are taken at the end of each month after that month\'s growth', 'Monthly return follows the convention chosen in Data & Sources (SIP method)'],
    assumptions: ['A constant return — real markets fall and rise, and a bad first few years hurts far more than later ones (sequence-of-returns risk)', DISC],
    compute(v) {
      const i = C.monthlyRate(v.r), n = Math.round(v.y * 12);
      const run = (w0) => { let bal = v.corpus, w = w0, wd = 0, dep = null; const pts = [{ x: 0, y: bal }]; for (let m = 1; m <= n; m++) { if (m > 1 && (m - 1) % 12 === 0) w *= 1 + v.inf / 100; bal = bal * (1 + i) - w; if (bal < 0) { wd += w + bal; dep = m; bal = 0; pts.push({ x: m / 12, y: 0 }); break; } wd += w; if (m % 12 === 0) pts.push({ x: m / 12, y: bal }); } return { bal, wd, dep, pts }; };
      const r0 = run(v.w); let lo = 0, hi = v.corpus; for (let k = 0; k < 60; k++) { const mid = (lo + hi) / 2; if (run(mid).dep === null) lo = mid; else hi = mid; }
      const lasts = r0.dep === null ? 'Beyond the ' + v.y + '-year plan' : Math.floor((r0.dep - 1) / 12) + ' years ' + ((r0.dep - 1) % 12) + ' months';
      return { summary: [text('Your money lasts', lasts, true), S('Balance at the end of the plan', r0.bal, 'inr', true), S('Total withdrawn', r0.wd), S('First-year withdrawal rate', v.w * 12 / v.corpus * 100, 'pct'), S('Highest starting monthly withdrawal that lasts the whole plan', lo, 'inr', true)],
        charts: [ch().line({ title: 'Balance over time', xLabel: 'Year', yfmt: 'inr', area: true, series: [{ name: 'Balance', data: r0.pts }] })],
        notes: [r0.dep === null ? 'Under these assumptions the money outlasts the plan. Try a lower return or higher inflation to test how fragile that is.' : 'Under these assumptions the money runs out. Options: a smaller withdrawal, a longer working life, more savings or income that covers part of the spending.', DISC] };
    }
  });

  reg({
    id: 'policyirr', title: 'Endowment / Money-back Policy: your real return', group: 'Insurance', module: 'insurance', tags: 'endowment money back ulip policy irr return maturity bonus term insurance buy term invest rest traditional plan',
    intro: 'Insurance agents quote the maturity amount, not the return. This turns your premiums and the promised payout into a yearly return, and compares it with a term plan plus investing the difference.',
    fields: [F.money('prem', 'Premium per year', 100000, 2000000, 5000, { lo: 1 }), F.yrs('ppt', 'Years you pay the premium', 15, 40, 1, { lo: 1 }), F.yrs('term', 'Policy term (years)', 20, 50, 1, { lo: 1 }), F.money('mat', 'Total you receive in the end (maturity + bonuses)', 2500000, 100000000, 10000, { lo: 1 }), F.money('sa', 'Life cover (sum assured)', 1500000, 100000000, 100000), F.money('tprem', 'Yearly premium of a pure term plan with the same cover', 6000, 500000, 500), F.pct('alt', 'Return you could earn by investing instead (per year)', 8, 20, 0.5)],
    formula: ['Your yearly return (IRR) = the rate that makes (premiums paid) and (money received) equal in value', 'Alternative = term plan for the whole term, and the rest of each year\'s policy premium invested at the return you choose; it also pays the term premium in the years you would no longer pay the policy premium'],
    vars: ['Premiums are assumed paid at the start of each year and the payout at the end of the term', 'Use the maturity figure from the policy\'s benefit illustration, not an agent\'s verbal estimate'],
    assumptions: ['Both paths give the same life cover for the term; the alternative\'s investment return is an assumption, not a promise', 'Tax on maturity depends on the premium-to-cover ratio and the policy date — verify with Section 10(10D)', DISC],
    compute(v) {
      const term = Math.round(v.term), ppt = Math.min(Math.round(v.ppt), term), flows = Array.from({ length: term + 1 }, (_, k) => (k < ppt ? -v.prem : 0)); flows[term] += v.mat;
      const irr = C.irr(flows) * 100; let pot = 0; for (let k = 0; k < term; k++) pot += ((k < ppt ? v.prem : 0) - v.tprem) * Math.pow(1 + v.alt / 100, term - k);
      return { summary: [S('Total premiums paid', v.prem * ppt), S('Total you receive', v.mat), S('Your yearly return from the policy (IRR)', irr, 'pct', true), S('Term plan + investing the rest (end value)', pot, 'inr', true), S('Difference (term + invest − policy)', pot - v.mat, 'inr', true), S('Life cover in both cases', v.sa)],
        notes: ['Most endowment and money-back plans return roughly 4–6% a year; a bank FD or PPF usually beats that, and a term plan costs a fraction of the premium for the same cover.', 'If the policy is already running, compare the surrender value with continuing — do not stop in a hurry; ask the insurer for the paid-up and surrender figures.'] };
    }
  });

  /* ---------------- loans and tax ---------------- */
  reg({
    id: 'homeloantax', title: 'Home Loan Tax Benefit', group: 'Loans', module: 'loans', tags: 'home loan tax benefit section 24 80c interest principal deduction joint co-borrower old regime',
    intro: 'How much tax does a home loan save in its first year? Works out the interest and principal deductions and the loan\'s cost after tax.',
    fields: [F.money('p', 'Loan amount', 5000000, 100000000, 100000, { lo: 1 }), F.pct('r', 'Interest rate', () => FOS.store.interest('homeLoan'), 20, 0.05), F.yrs('y', 'Tenure (years)', 20, 30, 1, { lo: 1, hi: 40 }), F.sel('co', 'Borrowers sharing the loan equally', '1', [['1', 'Only me'], ['2', 'Two borrowers']]), F.sel('type', 'The house is', 'self', [['self', 'Self-occupied (I live in it)'], ['let', 'Let out on rent']]), F.sel('reg', 'Tax regime you file under', 'old', [['old', 'Old regime (deductions allowed)'], ['new', 'New regime']]), F.pct('slab', 'Your income-tax slab rate', 30, 40, 1), F.money('o80c', 'Other 80C savings each borrower already makes (EPF, PPF, ELSS, insurance…)', 0, 150000, 5000)],
    formula: ['Interest deduction (old regime) = the lower of the interest paid and the yearly limit, for each borrower', 'Principal repaid counts under Section 80C together with your other 80C savings (limit shared)', 'Tax saved = (interest deduction + 80C deduction) × slab rate × (1 + cess)'],
    vars: ['Limits come from the tax configuration for the default year (₹2 lakh interest on a self-occupied home, ₹1.5 lakh under 80C)', 'Let-out house: interest is set against the rent first; the loss you can set against other income is capped at the same yearly limit and the rest carries forward'],
    assumptions: ['Year-1 figures use the first 12 EMIs; later years have less interest and more principal', 'The new regime allows no deduction for a self-occupied home\'s interest or for 80C', 'Stamp-duty and other schemes (such as interest subsidies) are not included'],
    compute(v) {
      const am = C.amortize({ principal: v.p, rate: v.r, months: Math.round(v.y * 12) }), first = am.rows.slice(0, 12), int1 = first.reduce((a, r) => a + r.interest, 0), pr1 = first.reduce((a, r) => a + r.principal, 0), co = +v.co, d = yr().deductionsOld, old = v.reg === 'old';
      const dInt = old ? Math.min(int1 / co, d['Home-loan interest (self-occupied)']) : 0, d80 = old ? Math.min(pr1 / co, Math.max(0, d['80C'] - v.o80c)) : 0, mul = v.slab / 100 * cessMul();
      const saveInt = dInt * co * mul, saveAll = saveInt + d80 * co * mul, eff = int1 > 0 ? v.r * (1 - saveInt / int1) : v.r;
      return { summary: [S('Interest paid in year 1', int1), S('Principal repaid in year 1', pr1), S('Interest deduction used (each borrower)', dInt), S('80C deduction from principal (each borrower)', d80), S('Tax saved in year 1 (all borrowers)', saveAll, 'inr', true), S('Loan\'s effective interest rate after the interest tax benefit', eff, 'pct', true)],
        notes: [old ? 'Only the old regime gives these deductions. Compare both regimes with the Tax Optimizer before deciding.' : 'You chose the new regime, which gives no deduction here.', v.type === 'let' ? 'A let-out house follows different rules (interest is set against the rent first); treat the figures above as a guide.' : ''].filter(Boolean).concat(unverified()) };
    }
  });

  reg({
    id: 'balancetransfer', title: 'Loan Balance Transfer: is switching worth it?', group: 'Loans', module: 'loans', tags: 'balance transfer home loan switch lender lower rate refinance processing fee foreclosure savings break even',
    intro: 'A new lender offers a lower rate. After fees and charges, does switching actually save money, and when do you break even?',
    fields: [F.money('p', 'Outstanding loan', 3000000, 100000000, 100000, { lo: 1 }), F.pct('r0', 'Your current interest rate', 9.5, 30, 0.05), F.pct('r1', 'New lender\'s interest rate', 8.75, 30, 0.05), F.mon('n', 'Months remaining', 180, 480, 1, { lo: 1 }), F.pct('fee', 'New lender\'s processing fee (% of loan, before GST)', 0.5, 5, 0.05), F.pct('gst', 'GST on the fee', 18, 28, 1), F.money('oth', 'Legal, valuation and other charges', 10000, 500000, 500), F.pct('pen', 'Foreclosure charge on the old loan (%)', 0, 5, 0.1)],
    formula: ['Saving = (old EMI − new EMI) × months − switching costs', 'Switching costs = fee × (1 + GST) + other charges + foreclosure charge', 'Break-even month = switching costs ÷ monthly saving'],
    vars: ['The tenure is kept the same, so the comparison is like for like', 'Floating-rate home loans for individuals normally have no foreclosure charge'],
    assumptions: ['The new rate stays below the old one for the whole period — floating rates move for everyone', 'Ask your current lender to match the new rate first; many will for a small fee'],
    compute(v) {
      const e0 = C.emi(v.p, v.r0, v.n), e1 = C.emi(v.p, v.r1, v.n), fees = v.p * v.fee / 100 * (1 + v.gst / 100) + v.oth + v.p * v.pen / 100, mo = e0 - e1, save = mo * v.n - fees;
      return { summary: [S('Current EMI', e0), S('EMI after switching', e1), S('Saved every month', mo), S('One-time switching cost', fees), S('Net saving over the remaining loan', save, 'inr', true), S('Months to recover the switching cost', mo > 0 ? fees / mo : NaN, 'months', true)],
        notes: [mo <= 0 ? 'The new rate is not lower, so switching cannot save money on interest.' : save > 0 ? 'Switching saves money if you keep the loan to its end. If you plan to prepay or sell before the break-even month, it may not.' : 'The costs outweigh the saving over this period.', 'A rate gap of about 0.5–1 percentage point or more, with many years left, is when a switch is usually worth a closer look.'] };
    }
  });

  reg({
    id: 'advancetax', title: 'Advance Tax Planner', group: 'Tax', module: 'tax', tags: 'advance tax instalments due dates 234b 234c freelancer business capital gains interest presumptive',
    intro: 'If your tax after TDS is ₹10,000 or more, you pay it in instalments during the year. See the dates, the amounts and what skipping them costs.',
    fields: [F.money('tax', 'Your tax for the year after TDS and TCS', 120000, 100000000, 5000), F.sel('kind', 'You are', 'normal', [['normal', 'A salaried person with other income, a business or a professional'], ['presumptive', 'Using the presumptive scheme (44AD / 44ADA)']]), F.sel('sr', 'Resident senior citizen (60+) with no business income?', '0', [['0', 'No'], ['1', 'Yes — advance tax does not apply']])],
    formula: ['Normal: 15% by 15 Jun, 45% by 15 Sep, 75% by 15 Dec, 100% by 15 Mar (cumulative)', 'Presumptive scheme: 100% by 15 Mar', 'Interest (Section 234C) ≈ 1% a month on each shortfall: 3 months for the first three instalments, 1 month for March'],
    vars: ['The ₹10,000 threshold comes from the tax configuration', 'Interest under 234B (paying less than 90% of the final tax by 31 March) is separate and not included'],
    assumptions: ['Dates are the usual statutory dates — confirm them each year on incometax.gov.in', 'Pay online with challan 280 (“Advance tax”) and keep the receipt'],
    compute(v) {
      const y0 = +(/(\d{4})/.exec(FOS.TAX_RULES.defaultYear) || [0, new Date().getFullYear()])[1], limit = (yr().other || {}).advanceTaxThreshold || 10000, need = v.tax >= limit && +v.sr !== 1;
      const plan = v.kind === 'presumptive' ? [['15 Mar ' + (y0 + 1), 100]] : [['15 Jun ' + y0, 15], ['15 Sep ' + y0, 45], ['15 Dec ' + y0, 75], ['15 Mar ' + (y0 + 1), 100]];
      const months = v.kind === 'presumptive' ? [1] : [3, 3, 3, 1], rows = plan.map(([d, c], k) => [d, c + '%', fmt.inr(v.tax * (c - (k ? plan[k - 1][1] : 0)) / 100)]);
      const lateAll = plan.slice(0, -1).reduce((a, [, c], k) => a + v.tax * c / 100 * 0.01 * months[k], 0);   // shortfall × 1% × months, for every instalment before the last
      return { summary: [text('Advance tax applies?', need ? 'Yes' : 'No', true), S('Tax to pay in instalments', need ? v.tax : 0, 'inr', true), S('Interest if you pay nothing until the last date (approx.)', need ? lateAll : 0)],
        table: { head: ['Pay by', 'Cumulative share', 'Amount in this instalment'], rows: need ? rows : [] }, tableTitle: 'Your instalments',
        notes: [need ? 'Each instalment is a cumulative target: whatever you have already paid counts.' : 'Below the threshold (or for a resident senior with no business income) no advance tax is due — you settle the tax when you file.', 'Capital gains and dividends are also covered by the same schedule; paying in the instalment after the gain arises avoids interest.'].concat(unverified()) };
    }
  });

  reg({
    id: 'propertycg', title: 'Tax on Selling a Property', group: 'Tax', module: 'property', tags: 'property sale capital gains ltcg stcg indexation cii 12.5 20 percent land house flat exemption 54 54ec 54f',
    intro: 'Selling a house, flat or plot? See the capital-gains tax under both methods the law allows (no indexation at 12.5%, or indexation at 20% for older purchases) and which is lower.',
    fields: [F.money('buy', 'What you paid for it', 3000000, 1000000000, 100000, { lo: 1 }), F.sel('buyfy', 'Financial year you bought it in', 'FY2015-16', Object.keys(FOS.TAX_RULES.cii).sort().reverse().map((k) => [k, k + '  (index ' + FOS.TAX_RULES.cii[k] + ')'])), F.money('imp', 'Improvements you paid for (renovation, additions)', 0, 1000000000, 50000), F.money('sell', 'Sale price', 8000000, 2000000000, 100000, { lo: 1 }), F.money('exp', 'Brokerage and other cost of selling', 80000, 100000000, 5000), F.num('salecii', 'Cost Inflation Index of the year you sell in', () => Math.max.apply(null, Object.values(FOS.TAX_RULES.cii)), 2000, 1, { lo: 1 }), F.mon('months', 'Months you held it', 120, 720, 1, { lo: 1 }), F.sel('pre', 'Did you acquire it before 23 July 2024?', '1', [['1', 'Yes'], ['0', 'No']]), F.pct('slab', 'Your slab rate (used only for gains within 24 months)', 30, 40, 1)],
    formula: ['Method A (all sales): tax = 12.5% × (sale − selling cost − purchase − improvements)', 'Method B (bought before 23 Jul 2024, resident individual / HUF): tax = 20% × (sale − selling cost − indexed purchase and improvements); indexed cost = cost × (index of sale year ÷ index of purchase year)', 'Held 24 months or less: the gain is added to income and taxed at your slab'],
    vars: ['Rates and the 24-month limit come from the tax configuration; the Cost Inflation Index table is in Data & Sources — enter the notified index for your year of sale', 'Improvements are assumed made in the purchase year (index of that year)'],
    assumptions: ['Cess is included; surcharge is ignored', 'Exemptions under Sections 54, 54F and 54EC can reduce or remove this tax — see the notes', 'Property bought before April 2001 uses its 1 April 2001 value as cost — not modelled'],
    compute(v) {
      const cii = FOS.TAX_RULES.cii, c0 = cii[v.buyfy], cg = yr().capitalGains, pr = cg.property || { rate: 12.5, indexedRate: 20 }, cm = cessMul(), cost = v.buy + v.imp, net = v.sell - v.exp;
      if (v.months <= 24) { const gain = net - cost, tax = Math.max(0, gain) * v.slab / 100 * cm; return { summary: [text('Gain is', 'Short-term (held 24 months or less)', true), S('Gain', gain, 'inr', true), S('Tax at your slab (incl. cess)', tax, 'inr', true), S('Left after tax', gain - tax)], notes: ['Short-term property gains are added to your other income.', 'Sections 54/54F do not apply to short-term gains.'] }; }
      const gainA = net - cost, taxA = Math.max(0, gainA) * pr.rate / 100 * cm, idx = c0 ? cost * v.salecii / c0 : NaN, gainB = net - idx, taxB = Math.max(0, gainB) * pr.indexedRate / 100 * cm, canB = +v.pre === 1 && Number.isFinite(idx), useB = canB && taxB < taxA, tax = useB ? taxB : taxA;
      return { summary: [text('Gain is', 'Long-term (held more than 24 months)', true), S('Method A: gain without indexation', gainA), S('Method A: tax', taxA, 'inr'), S('Method B: indexed cost', canB ? idx : NaN), S('Method B: gain with indexation', canB ? gainB : NaN), S('Method B: tax', canB ? taxB : NaN, 'inr'), text('Lower tax', useB ? 'Method B (20% with indexation)' : 'Method A (12.5%, no indexation)', true), S('Tax payable (incl. cess)', tax, 'inr', true), S('Left after tax', net - cost - tax, 'inr', true)],
        notes: ['Reinvesting the gain can reduce the tax: Section 54 (buy or build another residential house within the time limits), 54F (net sale proceeds of other assets into a house), 54EC (bonds, up to a yearly limit, within 6 months). Conditions and caps apply — read them on incometax.gov.in.', 'The buyer deducts TDS on the sale (1% when the price is ₹50 lakh or more; much higher if you are a non-resident). It is credited against this tax.', 'The capital-gains figure is the same on a bigger or smaller sale price only if the sale price is not below the government (circle) value — check stamp-duty value rules.'].concat(unverified()) };
    }
  });

  reg({
    id: 'gst', title: 'GST Calculator', group: 'Business', module: 'bizacct', tags: 'gst calculator tax invoice cgst sgst igst inclusive exclusive rate add remove input credit',
    intro: 'Add GST to a price or take it out of a GST-inclusive price, and see the CGST/SGST or IGST split for your invoice.',
    fields: [F.money('amt', 'Amount', 10000, 1000000000, 100, { lo: 0.01 }), F.sel('rate', 'GST rate on the item', '18', [['0', '0%'], ['3', '3% (gold, silver)'], ['5', '5%'], ['12', '12% (older rate)'], ['18', '18%'], ['28', '28% (older rate)'], ['40', '40%']]), F.sel('mode', 'The amount you entered', 'excl', [['excl', 'is before GST — add GST'], ['incl', 'already includes GST — take it out']]), F.sel('sup', 'The sale is', 'intra', [['intra', 'Within one state (CGST + SGST)'], ['inter', 'Between states (IGST)']])],
    formula: ['Before GST: GST = amount × rate; total = amount + GST', 'Including GST: base = amount ÷ (1 + rate); GST = amount − base', 'Within a state the GST splits equally into CGST and SGST; between states it is all IGST'],
    vars: ['GST rates were simplified in 2025 and may change again — use the rate printed for your item and verify on gst.gov.in'],
    assumptions: ['Cess and special levies on some goods (for example tobacco, luxury cars) are not included'],
    compute(v) {
      const r = v.rate / 100, base = v.mode === 'incl' ? v.amt / (1 + r) : v.amt, g = base * r, inter = v.sup === 'inter';
      return { summary: [S('Price before GST', base), S('GST', g, 'inr', true), S('Total with GST', base + g, 'inr', true), S(inter ? 'IGST' : 'CGST', inter ? g : g / 2), S(inter ? 'SGST / UTGST' : 'SGST / UTGST', inter ? 0 : g / 2)],
        notes: ['If you are GST-registered, the GST you pay on business purchases can be claimed back as input tax credit; the GST you collect is paid to the government after setting off that credit.'] };
    }
  });

  /* ---------------- property, residency, investing, student loans, startups, net worth ---------------- */
  reg({
    id: 'rentalyield', title: 'Rental Yield & Property Return', group: 'Property', module: 'rental', tags: 'rental yield property investment rent roi vacancy maintenance appreciation tax landlord reit fd comparison',
    intro: 'Is a rented-out property a good investment? Works out gross yield, yield after costs and tax, and the total return including price growth, against a bank FD.',
    fields: [F.money('price', 'Property value today', 6000000, 500000000, 100000, { lo: 1 }), F.money('rent', 'Monthly rent', 20000, 5000000, 500), F.num('vac', 'Months empty per year', 1, 12, 0.5, { hi: 12 }), F.money('cost', 'Yearly maintenance, property tax and repairs you pay', 40000, 50000000, 1000), F.pct('app', 'Yearly price growth you assume', 5, 20, 0.5), F.pct('slab', 'Your income-tax slab rate', 30, 40, 1)],
    formula: ['Gross yield = yearly rent ÷ price', 'Net yield = (rent received − costs − tax) ÷ price', 'Tax = 70% of the rent received × slab rate × (1 + cess)  (30% standard deduction on net annual value)', 'Total return = net yield + price growth'],
    vars: ['Loan interest, if any, is not included — a loan makes both the return and the risk larger', 'Capital-gains tax on a future sale is not deducted from the price growth'],
    assumptions: ['Property is illiquid and expensive to buy and sell (stamp duty, brokerage); listed REITs and FDs are easier to exit', DISC],
    compute(v) {
      const rec = v.rent * Math.max(0, 12 - v.vac), tax = rec * 0.7 * v.slab / 100 * cessMul(), net = rec - v.cost - tax, fd = FOS.store.interest('fd1y'), fdPost = fd * (1 - v.slab / 100 * cessMul());
      return { summary: [S('Gross rental yield', v.rent * 12 / v.price * 100, 'pct'), S('Rent actually received per year', rec), S('Tax on the rent (est.)', tax), S('Net yield after costs and tax', net / v.price * 100, 'pct', true), S('Net yield + price growth', net / v.price * 100 + v.app, 'pct', true), S('A bank FD after tax, for comparison', fdPost, 'pct')],
        notes: ['In many Indian cities rental yields are only 2–4% of the price, so most of the return depends on price growth.', 'A property that is empty or needs repairs can turn the net yield negative.'].concat(unverified()) };
    }
  });

  reg({
    id: 'residency', title: 'Residential Status (Resident / NRI) Checker', group: 'Tax', module: 'nri', tags: 'residential status nri resident rnor non resident 182 days 120 days deemed resident income tax india foreign',
    intro: 'Your tax in India depends on your residential status for the year, not on your citizenship. Enter your days in India to see where you stand.',
    fields: [F.num('d0', 'Days you spent in India this financial year', 150, 366, 1), F.num('d4', 'Days you spent in India in the 4 years before this one (total)', 400, 1461, 1), F.sel('cit', 'You are', '1', [['1', 'An Indian citizen'], ['2', 'A person of Indian origin (PIO)'], ['0', 'A foreign national']]), F.sel('purpose', 'This year you…', 'normal', [['normal', 'lived abroad and visited India (or no special case)'], ['leave', 'left India for a job abroad or as ship crew'], ['visit', 'came to India on a visit (citizen / person of Indian origin)']]), F.sel('inc15', 'Indian income (excluding foreign sources) above ₹15 lakh this year?', '0', [['0', 'No'], ['1', 'Yes']]), F.sel('untaxed', 'Are you NOT liable to tax in any other country?', '0', [['0', 'I am taxed elsewhere'], ['1', 'I am not liable to tax anywhere']]), F.sel('nr9', 'Were you a non-resident in 9 of the last 10 years?', '0', [['0', 'No'], ['1', 'Yes']]), F.num('d7', 'Days in India in the 7 years before this one (total)', 1000, 2557, 1)],
    formula: ['Resident if you were in India 182 days or more this year, OR 60 days or more this year and 365 days or more in the 4 years before', 'Citizens / persons of Indian origin: 60 becomes 182 when leaving for a job abroad or as crew, and 120 when visiting with Indian income above ₹15 lakh', 'Resident but NOT ordinarily resident (RNOR): non-resident in 9 of the last 10 years, or 729 days or fewer in India in the last 7 years; also a citizen deemed resident (income above ₹15 lakh and not taxed anywhere)'],
    vars: ['Resident and ordinarily resident: all your world-wide income is taxed in India', 'RNOR: Indian income and business controlled from India; most foreign income is not', 'Non-resident: only income earned or received in India'],
    assumptions: ['This is the INCOME-TAX test. The foreign-exchange law (FEMA) uses a different test based on your intention and stay, which decides what bank accounts and investments you may hold', 'Rules for the counting days and the ₹15 lakh limit are in the Income-tax Act — verify with a chartered accountant for your own case'],
    compute(v) {
      const cz = +v.cit === 1, pio = +v.cit === 2, leave = v.purpose === 'leave', visit = v.purpose === 'visit', inc15 = +v.inc15 === 1;
      let resident = v.d0 >= 182;
      if (!resident) { const th = cz && leave ? 0 : (cz || pio) && visit && inc15 ? 120 : 60; resident = th > 0 && v.d0 >= th && v.d4 >= 365; }   // leaving for a job abroad: only the 182-day test applies
      const deemed = !resident && cz && inc15 && +v.untaxed === 1;   // citizens with Indian income above ₹15 lakh who are taxed nowhere else are deemed resident (but not ordinarily)
      let status = 'Non-resident (NRI)', scope = 'Only income earned or received in India is taxed here.';
      if (resident || deemed) { const rnor = deemed || +v.nr9 === 1 || v.d7 <= 729; status = rnor ? 'Resident but not ordinarily resident (RNOR)' : 'Resident and ordinarily resident (ROR)'; scope = rnor ? 'Indian income (and business controlled from India) is taxed; most foreign income is not.' : 'Your world-wide income is taxed in India; claim a credit for foreign tax where a tax treaty allows.'; }
      return { summary: [text('Residential status for this year', status, true), text('What India taxes', scope)],
        notes: ['Bank accounts must match your status: an NRI moves savings to NRE / NRO accounts; a returning NRI converts them. Ask the bank.', 'Interest on an NRE account is tax-free only while you are a non-resident; once you become resident it is taxable.', 'If you are close to a limit, a day or two can change your status — keep passport stamps or e-gate records.'] };
    }
  });

  reg({
    id: 'xirr', title: 'SIP Return Finder (XIRR)', group: 'Returns', module: 'advinvest', tags: 'xirr sip return mutual fund irr annualised actual return monthly investment current value',
    intro: 'You invested every month and the fund is now worth some amount. What yearly return did you actually earn? XIRR is the right measure when money goes in at different dates.',
    fields: [F.money('m', 'Monthly SIP amount', 10000, 10000000, 500, { lo: 1 }), F.mon('n', 'Number of monthly instalments so far', 36, 600, 1, { lo: 1 }), F.money('lump', 'Any lump sum put in at the start', 0, 1000000000, 10000), F.money('cur', 'Value of the investment today', 450000, 10000000000, 10000, { lo: 1 })],
    formula: ['XIRR = the yearly rate r that solves: Σ (cash flow ÷ (1 + r)^(years since first flow)) = 0', 'Instalments are negative flows at the start of each month; today\'s value is the positive flow at the end'],
    vars: ['Your fund house\'s statement shows XIRR too — use this to check it or to compare funds'],
    assumptions: ['Instalments are exactly one month apart; exit loads and taxes on redemption are not deducted'],
    compute(v) {
      const n = Math.round(v.n), flows = [{ t: 0, v: -(v.lump + v.m) }]; for (let k = 1; k < n; k++) flows.push({ t: k / 12, v: -v.m }); flows.push({ t: n / 12, v: v.cur });
      const x = C.xirr(flows) * 100, put = v.lump + v.m * n;
      return { summary: [S('Total invested', put), S('Value today', v.cur), S('Gain', v.cur - put), S('Yearly return (XIRR)', x, 'pct', true), S('Absolute return', put > 0 ? (v.cur - put) / put * 100 : NaN, 'pct')], notes: ['An absolute return hides how long the money was invested; XIRR turns it into a yearly rate you can compare with an FD or another fund.'] };
    }
  });

  reg({
    id: 'rebalance', title: 'Portfolio Rebalancing Helper', group: 'Investing', module: 'advinvest', tags: 'rebalance rebalancing portfolio asset allocation target equity debt gold drift buy sell new money',
    intro: 'Markets move your mix away from your plan. See how far you have drifted and the buy / sell amounts that restore it — or how new money alone can do it without selling.',
    fields: [F.money('eq', 'Equity today (stocks, equity funds)', 1200000, 1000000000, 10000), F.money('debt', 'Debt today (FD, bonds, debt funds, PPF, EPF)', 600000, 1000000000, 10000), F.money('gold', 'Gold today', 150000, 1000000000, 10000), F.money('cash', 'Cash / liquid today', 50000, 1000000000, 10000), F.pct('teq', 'Target equity %', 60, 100, 1), F.pct('tdebt', 'Target debt %', 25, 100, 1), F.pct('tgold', 'Target gold %', 10, 100, 1), F.money('new', 'New money you can invest now', 100000, 1000000000, 10000)],
    formula: ['Target amount = target % × (portfolio + new money)', 'Full rebalance: buy or sell the difference between the target and what you hold', 'Using new money only: put the new money into the assets furthest below target, without selling'],
    vars: ['Cash target = 100% − the other targets', 'Selling can trigger tax and exit loads — using new money first avoids both'],
    assumptions: ['Rebalance on a schedule (yearly) or when an asset drifts more than 5 percentage points from target, not on market headlines', DISC],
    compute(v) {
      const cur = [v.eq, v.debt, v.gold, v.cash], tg = [v.teq, v.tdebt, v.tgold, Math.max(0, 100 - v.teq - v.tdebt - v.tgold)], names = ['Equity', 'Debt', 'Gold', 'Cash'], total = cur.reduce((a, b) => a + b, 0), post = total + v.new, tamt = tg.map((t) => t * post / 100), diff = tamt.map((t, i) => t - cur[i]);
      const short = diff.map((d) => Math.max(0, d)), sumShort = short.reduce((a, b) => a + b, 0), put = short.map((s) => (sumShort > 0 ? s * Math.min(1, v.new / sumShort) : 0)), spare = Math.max(0, v.new - put.reduce((a, b) => a + b, 0)), put2 = put.map((p, i) => p + spare * tg[i] / 100);
      const act = (d) => (Math.abs(d) < 1 ? 'Hold' : (d > 0 ? 'Buy ' : 'Sell ') + fmt.inr(Math.abs(d)));
      const drift = cur.map((c, i) => (total > 0 ? c / total * 100 : 0) - tg[i]), worst = Math.max.apply(null, drift.map(Math.abs));
      return { summary: [S('Portfolio today', total), S('Largest drift from target', worst, 'pct', true), S('Equity now vs target', total > 0 ? v.eq / total * 100 : NaN, 'pct'), S('Needs rebalancing? (drift over 5 points)', worst > 5 ? 1 : 0, 'yn')],
        table: { head: ['Asset', 'Now', 'Target', 'Full rebalance', 'With new money only'], rows: names.map((nm, i) => [nm, fmt.pct(total > 0 ? cur[i] / total * 100 : 0, 1), fmt.pct(tg[i], 0), act(diff[i]), 'Buy ' + fmt.inr(put2[i])]) }, tableTitle: 'What to do',
        notes: [v.teq + v.tdebt + v.tgold > 100 ? 'Your targets add up to more than 100% — lower one of them.' : 'New money is shared first to the assets below target, and the leftover follows your target mix.', DISC] };
    }
  });

  reg({
    id: 'edumoratorium', title: 'Education Loan with Moratorium', group: 'Goals', module: 'education', tags: 'education loan moratorium study interest capitalised emi repay abroad simple interest 80e',
    intro: 'During a course and the grace period after it, an education loan builds up interest. Compare paying that interest as you go with letting it be added to the loan.',
    fields: [F.money('p', 'Loan amount', 1500000, 100000000, 50000, { lo: 1 }), F.pct('r', 'Interest rate', () => FOS.store.interest('educationLoan'), 20, 0.05), F.yrs('study', 'Course length (years)', 2, 8, 0.5, { lo: 0.5 }), F.mon('mor', 'Extra months of grace after the course', 12, 24, 1), F.yrs('rep', 'Repayment period after that (years)', 10, 20, 1, { lo: 1 })],
    formula: ['Interest during study and grace = loan × rate × time (simple interest)', 'Option A: do nothing — the interest is added to the loan when repayment starts, then EMI on the bigger loan', 'Option B: pay the interest every month during the course; only the grace-period interest is added'],
    vars: ['The loan is treated as paid out at the start; real loans are released in instalments, so true interest is a little lower', 'Interest on an education loan is deductible under Section 80E for 8 years (old regime) — verify'],
    assumptions: ['Simple interest during the moratorium, as most banks charge', 'Some schemes give an interest subsidy during the course for eligible students — check before assuming you will pay it'],
    compute(v) {
      const s = Math.round(v.study * 12), accA = v.p * v.r / 1200 * (s + v.mor), pA = v.p + accA, eA = C.emi(pA, v.r, Math.round(v.rep * 12)), totA = eA * Math.round(v.rep * 12);
      const paidB = v.p * v.r / 1200 * s, accB = v.p * v.r / 1200 * v.mor, pB = v.p + accB, eB = C.emi(pB, v.r, Math.round(v.rep * 12)), totB = eB * Math.round(v.rep * 12) + paidB;
      return { summary: [S('A: loan balance when repayment starts', pA), S('A: EMI', eA, 'inr', true), S('A: total you pay', totA), S('B: loan balance when repayment starts', pB), S('B: EMI', eB, 'inr', true), S('B: total you pay (incl. interest during the course)', totB), S('Saved by paying interest during the course', totA - totB, 'inr', true)],
        notes: ['Paying the interest as you study costs cash now (' + fmt.inr(v.p * v.r / 1200) + ' a month) but saves interest-on-interest later. If a parent or you can afford it, it is the cheaper route.', 'Choose a repayment period you can handle on a realistic starting salary — see the Affordability and DTI checks.'] };
    }
  });

  reg({
    id: 'dilution', title: 'Startup Dilution: what do founders keep?', group: 'Business', module: 'startup', tags: 'startup dilution equity founder ownership funding round seed series a esop pool valuation pre money post money',
    intro: 'Every funding round and every employee-option pool shrinks the founders\' share. See how much is left after up to three rounds.',
    fields: [F.pct('own', 'Founders\' ownership before the first round', 100, 100, 1), F.num('pre1', 'Seed: pre-money valuation (₹ crore)', 8, 100000, 1, { lo: 0.1 }), F.num('raise1', 'Seed: money raised (₹ crore)', 2, 100000, 0.5), F.pct('esop1', 'Seed: employee-option pool created (% of the company)', 8, 40, 1), F.num('pre2', 'Series A: pre-money valuation (₹ crore)', 40, 100000, 1, { lo: 0.1 }), F.num('raise2', 'Series A: money raised (₹ crore)', 10, 100000, 0.5), F.pct('esop2', 'Series A: extra option pool (% of the company)', 4, 40, 1), F.num('pre3', 'Series B: pre-money valuation (₹ crore)', 200, 100000, 1, { lo: 0.1 }), F.num('raise3', 'Series B: money raised (₹ crore)', 50, 100000, 1), F.pct('esop3', 'Series B: extra option pool (% of the company)', 3, 40, 1)],
    formula: ['Post-money = pre-money + money raised;  investors get raised ÷ post-money', 'New option pool takes its share of the company at the same time', 'Founders after the round = founders before × (1 − investor share − pool share)'],
    vars: ['A round with 0 raised is skipped', 'Founders\' value = their share × post-money valuation (a paper value, not cash)'],
    assumptions: ['No secondary sales, no convertible notes or SAFEs, no anti-dilution clauses — those change the picture', DISC],
    compute(v) {
      let own = v.own; const rows = [], rounds = [['Seed', v.pre1, v.raise1, v.esop1], ['Series A', v.pre2, v.raise2, v.esop2], ['Series B', v.pre3, v.raise3, v.esop3]];
      rounds.forEach(([nm, pre, rs, ep]) => { if (!(rs > 0)) return; const post = pre + rs, inv = rs / post * 100; own = own * Math.max(0, 1 - inv / 100 - ep / 100); rows.push([nm, fmt.num(post, 1) + ' cr', fmt.pct(inv, 1), fmt.pct(ep, 0), fmt.pct(own, 1), fmt.num(own / 100 * post, 1) + ' cr']); });
      return { summary: [S('Founders\' share after all rounds', own, 'pct', true), S('Total dilution', v.own - own, 'pct')], table: { head: ['Round', 'Post-money', 'New investors', 'Option pool', 'Founders keep', 'Founders\' stake value'], rows }, tableTitle: 'Round by round', notes: ['Dilution is not bad by itself: a smaller share of a much bigger company can be worth far more. What matters is whether each round buys growth worth more than the share given up.', DISC] };
    }
  });

  reg({
    id: 'unitecon', title: 'Unit Economics: LTV, CAC and payback', group: 'Business', module: 'startup', tags: 'unit economics ltv cac payback churn customer lifetime value acquisition cost margin subscription saas',
    intro: 'Does each customer earn back what it cost to win them? The three numbers every business should know: lifetime value, acquisition cost and payback time.',
    fields: [F.money('arpu', 'Revenue per customer per month', 1000, 100000000, 50, { lo: 1 }), F.pct('gm', 'Gross margin on that revenue', 60, 100, 1, { lo: 1 }), F.pct('churn', 'Customers lost each month', 5, 100, 0.5, { lo: 0.1 }), F.money('cac', 'Cost to win one customer (marketing + sales)', 3000, 1000000000, 100, { lo: 1 })],
    formula: ['Margin per customer per month = revenue × gross margin', 'Lifetime = 1 ÷ monthly churn;  LTV = margin per month × lifetime', 'Payback (months) = CAC ÷ margin per month;  LTV : CAC = LTV ÷ CAC'],
    vars: ['A common rule of thumb: LTV : CAC of 3 or more, payback within 12 months', 'Use margin, not revenue: revenue ignores what it costs you to serve the customer'],
    assumptions: ['Churn is constant and customers do not return after leaving; real churn is usually highest in the first months'],
    compute(v) {
      const mg = v.arpu * v.gm / 100, life = 1 / (v.churn / 100), ltv = mg * life, pay = v.cac / mg;
      return { summary: [S('Margin per customer per month', mg), S('Average customer lifetime', life, 'months'), S('Lifetime value (LTV)', ltv, 'inr', true), S('LTV : CAC', ltv / v.cac, 'x', true), S('Payback time', pay, 'months', true)], notes: [ltv / v.cac >= 3 ? 'LTV is comfortably above CAC.' : ltv / v.cac >= 1 ? 'Customers repay their cost but with little room — improve margin, churn or CAC.' : 'Each customer costs more to win than they will ever return. Fix this before spending more on growth.'] };
    }
  });

  reg({
    id: 'networthage', title: 'Net Worth by Age: where do you stand?', group: 'Net Worth', module: 'networth', tags: 'net worth by age benchmark milestone multiple of income savings target on track',
    intro: 'A rough yardstick: financial planners often quote a net worth of about 1× yearly income at 30 and 3× at 40, rising to about 8× at 60. Where do you stand?',
    fields: [F.num('age', 'Your age', 32, 75, 1, { lo: 20, hi: 75 }), F.money('inc', 'Your yearly gross income', 1200000, 1000000000, 50000, { lo: 1 }), F.money('nw', 'Your net worth today (assets − debts)', 1500000, 10000000000, 50000)],
    formula: ['Benchmark = multiple for your age (from the table in Data & Sources) × your yearly income', 'Between the listed ages the multiple is interpolated'],
    vars: ['Net worth here usually means everything you own minus everything you owe, including your home'],
    assumptions: ['These multiples come from US-style retirement studies; in India property is a bigger share of wealth and families support each other more, so use this for direction only', 'Starting late or earning less is not a verdict — it only tells you how much faster you need to save'],
    compute(v) {
      const t = A().netWorthMultiples; let m = t[t.length - 1][1]; if (v.age <= t[0][0]) m = t[0][1] * v.age / t[0][0]; else for (let k = 1; k < t.length; k++) if (v.age <= t[k][0]) { const [a0, m0] = t[k - 1], [a1, m1] = t[k]; m = m0 + (m1 - m0) * (v.age - a0) / (a1 - a0); break; }
      const bench = m * v.inc, ratio = v.nw / v.inc;
      return { summary: [S('Benchmark multiple for your age', m, 'x'), S('Benchmark net worth', bench, 'inr', true), S('Your net worth as a multiple of income', ratio, 'x', true), S(v.nw >= bench ? 'Ahead of the benchmark by' : 'Behind the benchmark by', Math.abs(v.nw - bench), 'inr', true)], notes: [v.nw >= bench ? 'You are at or above the yardstick for your age. Keep the habits going and protect what you have (insurance, nominees, a will).' : 'You are below the yardstick. Use the Goal Planner and SIP calculator to see what monthly amount closes the gap by 60.', DISC] };
    }
  });
})();
