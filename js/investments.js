/* ==========================================================================
   investments.js — growth, returns, deposits, bonds, gold, crypto, opportunity cost
   ========================================================================== */
(function () {
  'use strict';
  const { F, S, reg } = FOS, C = FOS.calc, fmt = FOS.fmt, ch = () => FOS.charts;
  const DISC = 'Projection based on the assumed return.';

  /* Opportunity-cost matrix: value of a lump sum and/or monthly amount under hypothetical returns */
  FOS.opp = function (lump, monthly, years, rates) {
    const A = FOS.FINANCIAL_ASSUMPTIONS; years = years || A.oppYears; rates = rates || A.oppRates;
    const rows = years.map((y) => [y + ' years'].concat(rates.map((r) => fmt.inr(C.sipFV(monthly, r, y * 12) + lump * Math.pow(1 + r / 100, y)))));
    return { head: ['If kept for'].concat(rates.map((r) => (r === 0 ? '0% (kept as cash)' : r + '% / yr (hypothetical)'))), rows };
  };
  FOS.oppHTML = function (lump, monthly) {
    const t = FOS.opp(lump, monthly);
    return `<div class="table-scroll"><table class="data"><thead><tr>${t.head.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${t.rows.map((r) => `<tr>${r.map((c, i) => (i ? `<td>${c}</td>` : `<th scope="row">${c}</th>`)).join('')}</tr>`).join('')}</tbody></table></div><p class="note"><b>Assumption-based.</b> ${DISC} Taxes, fees and inflation are not deducted.</p>`;
  };

  const growth = (series) => ch().line({ title: 'Growth', xLabel: 'Year', yfmt: 'inr', area: true, series });

  reg({ id: 'simple', title: 'Simple Interest', group: 'Growth', module: 'basics', tags: 'simple interest',
    intro: 'Interest earned only on the original amount.',
    fields: [F.money('p', 'Principal', 100000, 5000000, 5000), F.pct('r', 'Rate per year', 7, 30, 0.1), F.yrs('t', 'Time (years)', 5, 40, 0.5)],
    formula: ['I = P × r × t', 'A = P + I'], vars: ['P = principal', 'r = annual rate as a decimal', 't = years'], assumptions: [],
    compute: (v) => ({ summary: [S('Interest earned', C.simpleInterest(v.p, v.r, v.t), 'inr', true), S('Maturity amount', v.p + C.simpleInterest(v.p, v.r, v.t))] }) });

  reg({ id: 'compound', title: 'Compound Interest', group: 'Growth', module: 'basics', tags: 'compound interest compounding apy',
    intro: 'Interest on interest — the engine behind long-term growth.',
    fields: [F.money('p', 'Principal', 100000, 5000000, 5000), F.pct('r', 'Rate per year', 8, 30, 0.1), F.yrs('t', 'Time (years)', 10, 40, 0.5), F.sel('n', 'Compounding', '4', [['1', 'Yearly'], ['2', 'Half-yearly'], ['4', 'Quarterly'], ['12', 'Monthly'], ['365', 'Daily']])],
    formula: ['A = P (1 + r/n)^(n t)', 'APY = (1 + r/n)^n − 1'], vars: ['P = principal', 'r = annual rate (decimal)', 'n = compounding periods per year', 't = years'], assumptions: ['Rate is constant and no withdrawals; taxes ignored'],
    compute(v) { const a = C.compound(v.p, v.r, v.n, v.t), apy = (Math.pow(1 + v.r / 100 / v.n, v.n) - 1) * 100; const pts = []; for (let y = 0; y <= Math.ceil(v.t); y++) pts.push({ x: y, y: C.compound(v.p, v.r, v.n, Math.min(y, v.t)) }); const simple = pts.map((p) => ({ x: p.x, y: v.p + C.simpleInterest(v.p, v.r, Math.min(p.x, v.t)) }));
      return { summary: [S('Maturity amount', a, 'inr', true), S('Interest earned', a - v.p), S('Effective annual yield (APY)', apy, 'pct'), S('Same with simple interest', v.p + C.simpleInterest(v.p, v.r, v.t))], charts: [ch().line({ xLabel: 'Year', yfmt: 'inr', series: [{ name: 'Compound', data: pts }, { name: 'Simple', data: simple, dash: true }] })] }; } });

  reg({ id: 'inflation', title: 'Inflation Calculator', group: 'Growth', module: 'basics', tags: 'inflation purchasing power future cost',
    intro: 'What will today\'s cost be later, and what will today\'s money buy?',
    fields: [F.money('c', 'Cost today', 100000, 5000000, 5000), F.pct('i', 'Inflation per year', () => FOS.store.assume('inflation'), 15, 0.1), F.yrs('t', 'Years', 10, 40, 1)],
    formula: ['Future cost = Cost × (1 + i)^t', 'Purchasing power of ₹X after t years = X ÷ (1 + i)^t'], vars: ['i = inflation as a decimal'], assumptions: ['Inflation is uncertain; your personal inflation can differ from headline inflation'],
    compute(v) { const pts = [], pp = []; for (let y = 0; y <= v.t; y++) { pts.push({ x: y, y: C.futureCost(v.c, v.i, y) }); pp.push({ x: y, y: C.deflate(v.c, v.i, y) }); }
      return { summary: [S('Same item costs', C.futureCost(v.c, v.i, v.t), 'inr', true), S('Increase', C.futureCost(v.c, v.i, v.t) - v.c), S('Today\'s money buys (in today\'s terms)', C.deflate(v.c, v.i, v.t), 'inr', true), S('Prices double in about', v.i > 0 ? 72 / v.i : NaN, 'years')], charts: [ch().line({ xLabel: 'Year', yfmt: 'inr', series: [{ name: 'Future cost of the item', data: pts }, { name: 'Buying power of the same ₹', data: pp }] })] }; } });

  reg({ id: 'fv', title: 'Future Value', group: 'Growth', module: 'oppcost', tags: 'future value fv time value of money',
    intro: 'What a sum (and regular deposits) could be worth in the future under an assumed return.',
    fields: [F.money('pv', 'Present amount', 100000, 5000000, 5000), F.money('pmt', 'Monthly deposit', 5000, 100000, 500), F.pct('r', 'Return assumption', 8, 25, 0.1), F.yrs('t', 'Years', 10, 40, 1)],
    formula: ['FV = PV (1+r)^t + PMT × ((1+i)^n − 1)/i × (1+i)', 'i = r/12, n = 12 t'], vars: [], assumptions: [DISC],
    compute(v) { const val = v.pv * Math.pow(1 + v.r / 100, v.t) + C.sipFV(v.pmt, v.r, v.t * 12); return { summary: [S('Future value (assumption)', val, 'inr', true), S('You put in', v.pv + v.pmt * v.t * 12), S('Growth from assumed returns', val - v.pv - v.pmt * v.t * 12)], notes: [DISC] }; } });

  reg({ id: 'pv', title: 'Present Value', group: 'Growth', module: 'oppcost', tags: 'present value discount pv time value',
    intro: 'What a future amount is worth today.',
    fields: [F.money('fv', 'Future amount', 1000000, 50000000, 10000), F.pct('r', 'Discount rate', 7, 25, 0.1), F.yrs('t', 'Years', 10, 40, 1)],
    formula: ['PV = FV ÷ (1 + r)^t'], vars: ['r = discount rate (inflation or expected return)'], assumptions: [],
    compute: (v) => ({ summary: [S('Present value', C.pv(v.fv, v.r, v.t), 'inr', true), S('Difference', v.fv - C.pv(v.fv, v.r, v.t))] }) });

  reg({ id: 'cagr', title: 'CAGR Calculator', group: 'Returns', module: 'stocks', tags: 'cagr compound annual growth rate return xirr',
    intro: 'The steady yearly rate that connects a starting and ending value.',
    fields: [F.money('s', 'Starting value', 100000, 5000000, 5000, { lo: 1 }), F.money('e', 'Ending value', 250000, 10000000, 5000), F.yrs('t', 'Years', 7, 40, 0.5, { lo: 0.1 })],
    formula: ['CAGR = (End ÷ Start)^(1/t) − 1'], vars: ['It smooths out ups and downs — the actual path may have been very bumpy'], assumptions: ['No additional deposits or withdrawals (use XIRR for those)'],
    compute: (v) => ({ summary: [S('CAGR', C.cagr(v.s, v.e, v.t), 'pct', true), S('Absolute return', (v.e - v.s) / v.s * 100, 'pct'), S('Gain / loss', v.e - v.s)] }) });

  reg({ id: 'sip', title: 'SIP Calculator', group: 'Investing', module: 'mutualfunds', tags: 'sip systematic investment plan mutual fund monthly invest',
    intro: 'What regular monthly investing could grow to under a hypothetical return — with optional yearly step-up.',
    fields: [F.money('m', 'Monthly investment', 10000, 100000, 500, { lo: 1 }), F.yrs('y', 'Duration (years)', 10, 40, 1, { min: 1, lo: 0.5 }), F.pct('r', 'Return assumption (per year)', 12, 20, 0.1), F.pct('step', 'Yearly step-up in SIP', 0, 25, 1), F.pct('inf', 'Inflation (for today\'s-money view)', () => FOS.store.assume('inflation'), 12, 0.1)],
    formula: ['FV = P × ((1+i)^n − 1) ÷ i × (1+i)', 'i = annual rate ÷ 12, n = months'], vars: ['P = monthly investment', 'Step-up multiplies P once every 12 months'], assumptions: ['Constant return — real markets move up and down', 'Taxes, expense ratios and exit loads not deducted', DISC],
    compute(v) { const s = C.sipSeries(v.m, v.r, v.y, v.step), last = s[s.length - 1], low = C.sipFV(v.m, Math.max(0, v.r - 4), v.y * 12, v.step), flat = C.sipFV(v.m, 0, v.y * 12, v.step);
      return { summary: [S('Total invested', last.invested), S('Hypothetical future value', last.value, 'inr', true), S('Hypothetical gain', last.value - last.invested), S('In today\'s money (after inflation)', C.deflate(last.value, v.inf, v.y)), S('If return were ' + Math.max(0, v.r - 4) + '% instead', low), S('If return were 0%', flat)],
        charts: [growth([{ name: 'Hypothetical value', data: s.map((p) => ({ x: p.x, y: p.value })) }, { name: 'Amount invested', data: s.map((p) => ({ x: p.x, y: p.invested })), dash: true }])], notes: [DISC] }; } });

  reg({ id: 'lumpsum', title: 'Lumpsum Calculator', group: 'Investing', module: 'mutualfunds', tags: 'lumpsum one time investment',
    intro: 'A one-time investment under three hypothetical returns.',
    fields: [F.money('p', 'Investment', 500000, 10000000, 10000, { lo: 1 }), F.yrs('y', 'Years', 10, 40, 1), F.pct('r', 'Base return assumption', 10, 20, 0.1), F.pct('d', 'Scenario spread (± points)', 3, 10, 0.5)],
    formula: ['FV = P × (1 + r)^t'], vars: [], assumptions: [DISC],
    compute(v) { const f = (r) => C.fv(v.p, Math.max(0, r), v.y); return { summary: [S('Conservative (' + Math.max(0, v.r - v.d) + '%)', f(v.r - v.d)), S('Base (' + v.r + '%)', f(v.r), 'inr', true), S('Alternative (' + (v.r + v.d) + '%)', f(v.r + v.d)), S('Cash under the mattress (0%)', v.p)], charts: [growth([0, 1, 2].map((k) => ({ name: ['Conservative', 'Base', 'Alternative'][k], data: Array.from({ length: Math.ceil(v.y) + 1 }, (_, y) => ({ x: y, y: C.fv(v.p, Math.max(0, v.r + (k - 1) * v.d), Math.min(y, v.y)) })) }))) ], notes: [DISC] }; } });

  reg({ id: 'fd', title: 'FD Calculator', group: 'Deposits', module: 'banking', tags: 'fd fixed deposit interest maturity',
    intro: 'Maturity value of a fixed deposit.',
    fields: [F.money('p', 'Deposit', 200000, 5000000, 5000, { lo: 1 }), F.pct('r', 'Interest rate', () => FOS.store.interest('fd1y'), 12, 0.05), F.yrs('y', 'Years', 3, 10, 0.25, { lo: 0.1 }), F.sel('n', 'Compounding', '4', [['1', 'Yearly'], ['4', 'Quarterly'], ['12', 'Monthly']]), F.pct('tax', 'Your tax slab (to estimate post-tax)', 20, 40, 1), F.pct('inf', 'Inflation', () => FOS.store.assume('inflation'), 12, 0.1)],
    formula: ['A = P (1 + r/n)^(n t)'], vars: ['Interest is taxable as per slab; TDS may apply above a threshold'], assumptions: ['Rate fixed for the tenure; premature withdrawal penalty not modelled'],
    compute(v) { const a = C.fd(v.p, v.r, v.y, v.n), gain = a - v.p, post = gain * (1 - v.tax / 100), tyield = (Math.pow((v.p + post) / v.p, 1 / v.y) - 1) * 100;
      return { summary: [S('Maturity (pre-tax)', a, 'inr', true), S('Interest earned', gain), S('Tax on interest (est.)', gain * v.tax / 100), S('Post-tax maturity', v.p + post), S('Post-tax annual return', tyield, 'pct'), S('Post-tax return after inflation (approx.)', ((1 + tyield / 100) / (1 + v.inf / 100) - 1) * 100, 'pct', true)], notes: ['If the post-inflation return is near or below zero, purchasing power did not grow.'] }; } });

  reg({ id: 'rd', title: 'RD Calculator', group: 'Deposits', module: 'banking', tags: 'rd recurring deposit monthly',
    intro: 'Maturity value of a recurring deposit.',
    fields: [F.money('m', 'Monthly deposit', 5000, 100000, 500, { lo: 1 }), F.pct('r', 'Interest rate', () => FOS.store.interest('rd'), 12, 0.05), F.mon('n', 'Months', 60, 120, 1, { lo: 1 })],
    formula: ['Each instalment k grows as m × (1 + r/4)^(4 × months_remaining/12) (quarterly compounding)'], vars: [], assumptions: ['Banks differ slightly in how they compute RD interest'],
    compute(v) { const a = C.rd(v.m, v.r, v.n); return { summary: [S('Maturity value', a, 'inr', true), S('Total deposited', v.m * v.n), S('Interest earned', a - v.m * v.n)] }; } });

  reg({ id: 'ppf', title: 'PPF Calculator', group: 'Government', module: 'govt', tags: 'ppf public provident fund government scheme',
    intro: 'PPF maturity using the rate stored in the central scheme configuration (editable in Settings).',
    fields: [F.money('d', 'Yearly deposit', 150000, 150000, 5000, { hi: 150000 }), F.pct('r', 'PPF rate (from config)', () => FOS.store.schemeRate('PPF'), 12, 0.05), F.yrs('y', 'Years', 15, 30, 1, { lo: 1 })],
    formula: ['Balance_end_of_year = (Balance + Deposit) × (1 + r)'], vars: ['Rate is set by government and may change; yearly limit comes from the scheme config'], assumptions: ['Deposit at the start of each year; the real calculation uses the lowest monthly balance'],
    compute(v) { const o = C.annualDeposits(v.d, v.r, v.y); return { summary: [S('Maturity value', o.final, 'inr', true), S('Total deposited', v.d * v.y), S('Interest earned', o.final - v.d * v.y)], charts: [growth([{ name: 'PPF balance', data: o.series.map((p) => ({ x: p.x, y: p.value })) }, { name: 'Deposited', data: o.series.map((p) => ({ x: p.x, y: p.invested })), dash: true }])], notes: ['Source: ' + FOS.GOVERNMENT_SCHEMES.meta.source + ' — Verify before acting.'] }; } });

  reg({ id: 'nps', title: 'NPS Calculator', group: 'Government', module: 'retirement', tags: 'nps national pension system retirement annuity',
    intro: 'Estimate NPS corpus at retirement and a monthly pension from the annuity portion.',
    fields: [F.money('m', 'Monthly contribution', 10000, 100000, 500, { lo: 1 }), F.num('age', 'Current age', 30, 60, 1, { lo: 18, hi: 70 }), F.num('ret', 'Retirement age', 60, 70, 1, { lo: 40, hi: 75 }), F.pct('r', 'Return assumption', () => FOS.store.interest('npsReturn'), 15, 0.1), F.pct('ann', 'Share used to buy annuity', 40, 100, 5), F.pct('ar', 'Annuity rate', 6, 10, 0.1)],
    formula: ['Corpus = SIP future value to retirement age', 'Lump sum = Corpus × (1 − annuity %)', 'Monthly pension = Corpus × annuity % × annuity rate ÷ 12'], vars: [], assumptions: ['Minimum annuity share and withdrawal rules are set by the regulator and can change — verify', DISC],
    compute(v) { const y = Math.max(0, v.ret - v.age), c = C.sipFV(v.m, v.r, y * 12); return { summary: [S('Corpus at retirement', c, 'inr', true), S('Lump sum available', c * (1 - v.ann / 100)), S('Annuity purchase amount', c * v.ann / 100), S('Estimated monthly pension', c * v.ann / 100 * v.ar / 100 / 12, 'inr', true), S('Total contributed', v.m * y * 12)], notes: [DISC] }; } });

  reg({ id: 'fees', title: 'Investment Fee Impact', group: 'Investing', module: 'mutualfunds', tags: 'fee expense ratio impact mutual fund direct regular cost',
    intro: 'A 1% fee sounds small. Over decades it is not.',
    fields: [F.money('m', 'Monthly investment', 10000, 100000, 500), F.money('lump', 'Starting lump sum', 0, 5000000, 10000), F.yrs('y', 'Years', 20, 40, 1, { lo: 1 }), F.pct('r', 'Gross return (before fees)', 12, 20, 0.1), F.pct('f1', 'Low-cost fund expense ratio', 0.3, 3, 0.05), F.pct('f2', 'High-cost fund expense ratio', 1.8, 3, 0.05)],
    formula: ['Net return = Gross return − Expense ratio', 'Fee cost = FV(low fee) − FV(high fee)'], vars: [], assumptions: ['Same gross return assumed for both funds — in reality funds differ in more than fees', DISC],
    compute(v) { const f = (fee) => C.sipWithLump(v.m, v.r - fee, v.y, 0, v.lump), a = f(v.f1), b = f(v.f2);
      return { summary: [S('Value with low fee', a), S('Value with high fee', b), S('Cost of the higher fee', a - b, 'inr', true), S('Share of the low-fee outcome lost', (a - b) / a * 100, 'pct'), S('Total invested', v.m * v.y * 12 + v.lump)], notes: [DISC] }; } });

  reg({ id: 'absreturn', title: 'Absolute Return', group: 'Returns', module: 'stocks', tags: 'absolute return gain percent',
    intro: 'Total gain or loss in percentage, ignoring time.', fields: [F.money('b', 'Buy value', 100000, 5000000, 5000, { lo: 1 }), F.money('s', 'Current / sell value', 120000, 5000000, 5000), F.money('x', 'Charges & taxes paid', 500, 100000, 100)],
    formula: ['Absolute return % = (Sell − Buy − Charges) ÷ Buy × 100'], vars: [], assumptions: ['Ignores how long you held — compare using CAGR'],
    compute: (v) => ({ summary: [S('Net gain / loss', v.s - v.b - v.x, 'inr', true), S('Absolute return', (v.s - v.b - v.x) / v.b * 100, 'pct', true)] }) });

  reg({ id: 'dividend', title: 'Dividend Yield', group: 'Returns', module: 'stocks', tags: 'dividend yield share',
    intro: 'Annual dividend relative to price.', fields: [F.money('d', 'Annual dividend per share', 10, 500, 1), F.money('p', 'Share price', 400, 20000, 10, { lo: 1 }), F.num('q', 'Shares owned', 100, 10000, 1)],
    formula: ['Dividend yield = Dividend per share ÷ Price × 100'], vars: ['Dividends are not guaranteed and are taxable as per slab'], assumptions: [],
    compute: (v) => ({ summary: [S('Dividend yield', v.d / v.p * 100, 'pct', true), S('Yearly dividend income', v.d * v.q), S('Investment value', v.p * v.q)] }) });

  reg({ id: 'pe', title: 'P/E, EPS & Valuation Ratios', group: 'Returns', module: 'stocks', tags: 'pe price earnings eps pb roe valuation market cap',
    intro: 'Understand a company\'s ratios. A ratio describes the past; it does not predict the price.',
    fields: [F.money('price', 'Share price', 500, 20000, 5, { lo: 1 }), F.money('profit', 'Net profit (₹ crore)', 100, 10000, 10, { lo: 0 }), F.money('shares', 'Shares outstanding (crore)', 10, 1000, 1, { lo: 0.01 }), F.money('equity', 'Shareholders\' equity (₹ crore)', 800, 50000, 10, { lo: 0.01 })],
    formula: ['EPS = Net profit ÷ Shares', 'P/E = Price ÷ EPS', 'Book value/share = Equity ÷ Shares; P/B = Price ÷ BVPS', 'ROE = Net profit ÷ Equity × 100', 'Market cap = Price × Shares'], vars: [], assumptions: ['No view is offered on whether a ratio is “cheap” or “expensive”'],
    compute(v) { const eps = v.profit / v.shares; return { summary: [S('EPS', eps, 'inr', true), S('P/E', eps > 0 ? v.price / eps : NaN, 'x', true), S('Book value per share', v.equity / v.shares), S('P/B', v.price / (v.equity / v.shares), 'x'), S('ROE', v.profit / v.equity * 100, 'pct'), S('Market cap (₹ crore)', v.price * v.shares, 'num')], notes: eps <= 0 ? ['Loss-making: P/E is not meaningful.'] : [] }; } });

  reg({ id: 'allocation', title: 'Portfolio Allocation', group: 'Investing', module: 'investing', tags: 'portfolio allocation diversification asset',
    intro: 'See how your holdings are split — concentration is a risk worth noticing.',
    fields: [F.money('eq', 'Equity (stocks, equity funds)', 500000, 10000000, 10000), F.money('debt', 'Debt (FD, bonds, debt funds)', 300000, 10000000, 10000), F.money('gold', 'Gold', 100000, 5000000, 5000), F.money('re', 'Real estate (investment)', 0, 50000000, 50000), F.money('cash', 'Cash / savings', 100000, 5000000, 5000), F.money('other', 'Other / crypto', 0, 5000000, 5000)],
    formula: ['Weight = Holding ÷ Total × 100'], vars: [], assumptions: ['There is no single correct allocation; it depends on goals, horizon and risk capacity'],
    compute(v) { const t = v.eq + v.debt + v.gold + v.re + v.cash + v.other, w = (x) => (t > 0 ? x / t * 100 : 0); return { summary: [S('Total', t, 'inr', true), S('Equity', w(v.eq), 'pct'), S('Debt', w(v.debt), 'pct'), S('Gold', w(v.gold), 'pct'), S('Real estate', w(v.re), 'pct'), S('Cash', w(v.cash), 'pct'), S('Other / crypto', w(v.other), 'pct')], charts: [ch().donut({ title: 'Allocation', items: [{ name: 'Equity', value: v.eq }, { name: 'Debt', value: v.debt }, { name: 'Gold', value: v.gold }, { name: 'Real estate', value: v.re }, { name: 'Cash', value: v.cash }, { name: 'Other / crypto', value: v.other }] })] }; } });

  reg({ id: 'bond', title: 'Bond Price, Yield & Duration', group: 'Fixed Income', module: 'bonds', tags: 'bond price yield duration coupon face value interest rate risk',
    intro: 'Why bond prices fall when interest rates rise — and by how much.',
    fields: [F.money('face', 'Face value', 1000, 100000, 100, { lo: 1 }), F.pct('c', 'Coupon rate', 8, 15, 0.1), F.pct('y', 'Market yield (required return)', 8, 20, 0.1), F.yrs('t', 'Years to maturity', 5, 30, 1, { lo: 1 }), F.sel('f', 'Coupons per year', '1', [['1', 'Yearly'], ['2', 'Half-yearly']])],
    formula: ['Price = Σ Coupon/(1+y)^k + Face/(1+y)^n', 'Modified duration ≈ % price change for a 1% yield change'], vars: [], assumptions: ['Credit / default risk is not modelled — a higher yield often reflects higher credit risk'],
    compute(v) { const b = C.bond(v.face, v.c, v.y, v.t, +v.f), up = C.bond(v.face, v.c, v.y + 1, v.t, +v.f), dn = C.bond(v.face, v.c, Math.max(0, v.y - 1), v.t, +v.f); return { summary: [S('Price', b.price, 'inr', true), S('Current yield', b.currentYield, 'pct'), S('Macaulay duration', b.macaulay, 'years'), S('Modified duration', b.modified, 'num'), S('Price if yield +1%', up.price), S('Price if yield −1%', dn.price)], notes: ['A bond held to maturity returns face value if the issuer does not default; price swings matter if you sell earlier.'] }; } });

  reg({ id: 'goldcalc', title: 'Gold: Cost Comparison', group: 'Alternatives', module: 'gold', tags: 'gold jewellery etf digital gold sgb making charges',
    intro: 'Compare what ₹ you actually end up with across gold forms after charges, under one assumed gold-price path.',
    fields: [F.money('amt', 'Money to put in gold', 500000, 5000000, 10000, { lo: 1 }), F.yrs('y', 'Years held', 10, 30, 1, { lo: 0.5 }), F.pct('g', 'Assumed gold price growth/year', 7, 20, 0.5), F.pct('mk', 'Jewellery making + wastage', 12, 25, 0.5), F.pct('gst', 'GST on gold / making', 3, 10, 0.5), F.pct('sell', 'Jewellery buy-back deduction', 5, 25, 0.5), F.pct('lock', 'Locker / storage per year (% of value)', 0.5, 3, 0.1), F.pct('etf', 'Gold ETF/fund expense ratio', 0.5, 3, 0.05)],
    formula: ['Net grams bought = (Amount ÷ (1 + GST)) × (1 − making%) ÷ price (jewellery)', 'Value = grams × future price × (1 − buy-back deduction) − storage'], vars: [], assumptions: ['Capital-gains tax is not deducted; rules differ by instrument and holding period', DISC],
    compute(v) { const grow = Math.pow(1 + v.g / 100, v.y), jew = v.amt / (1 + v.gst / 100) * (1 - v.mk / 100) * grow * (1 - v.sell / 100) - v.amt * v.lock / 100 * v.y, coin = v.amt / (1 + v.gst / 100) * grow * (1 - 0.02) - v.amt * v.lock / 100 * v.y, etf = v.amt * Math.pow(1 + (v.g - v.etf) / 100, v.y);
      return { summary: [S('Jewellery (after making, GST, buy-back, locker)', jew), S('Physical coin / bar', coin), S('Gold ETF / fund (expense ratio)', etf), S('Gold price alone, no costs', v.amt * grow)], notes: ['Liquidity, purity risk, storage safety and taxes differ. Sovereign Gold Bond terms/availability change — verify.', DISC] }; } });

  reg({ id: 'cryptoscen', title: 'Crypto Scenario Calculator', group: 'Alternatives', module: 'crypto', tags: 'crypto bitcoin scenario loss volatility tax total loss',
    intro: 'What a position becomes under a range of price moves — including total loss. These are scenarios, not predictions.',
    fields: [F.money('inv', 'Amount invested', 100000, 2000000, 5000, { lo: 1 }), F.pct('fee', 'Trading + spread cost (each way)', 1, 5, 0.1), F.pct('tax', 'Tax on gains', () => FOS.TAX_RULES.years[FOS.TAX_RULES.defaultYear].capitalGains.crypto.rate, 50, 0.5), F.pct('tds', 'TDS on sale', () => FOS.TAX_RULES.years[FOS.TAX_RULES.defaultYear].capitalGains.crypto.tds, 5, 0.1), F.money('nw', 'Your total net worth (for context)', 1000000, 50000000, 50000)],
    formula: ['Value = Investment × (1 + move%) after entry/exit costs', 'Tax = gains × tax rate (losses cannot offset other income under current rules — verify)'], vars: [], assumptions: ['Tax rate pulled from the tax config for the default year — verify', 'NOT a prediction. Crypto can fall 80%+ or go to zero.'],
    compute(v) { const moves = [100, 50, 20, 0, -20, -50, -80, -100], base = v.inv * (1 - v.fee / 100); const rows = moves.map((m) => { const gross = Math.max(0, base * (1 + m / 100)), out = gross * (1 - v.fee / 100), gain = out - v.inv, tax = gain > 0 ? gain * v.tax / 100 : 0, net = out - tax; return [(m > 0 ? '+' : '') + m + '%', fmt.inr(out), fmt.inr(tax), fmt.inr(net), fmt.inr(net - v.inv), v.nw > 0 ? fmt.pct((net - v.inv) / v.nw * 100, 1) : '—']; });
      return { summary: [S('Worst case (−100%)', -v.inv, 'inr', true), S('Share of net worth at risk', v.nw > 0 ? v.inv / v.nw * 100 : NaN, 'pct'), S('TDS on a sale of this size', v.inv * v.tds / 100)], table: { head: ['Price move', 'Sale value', 'Tax', 'After tax', 'Profit / loss', 'Effect on net worth'], rows }, tableTitle: 'Scenario table', notes: ['Scenarios are illustrations, not forecasts. Before buying, run the Crypto checklist and the scam checker.'] }; } });

  reg({ id: 'oppcost', title: 'Opportunity Cost Calculator', group: 'Decision', module: 'oppcost', tags: 'opportunity cost spend save invest hypothetical what could it become',
    intro: 'Spend today vs save vs invest under hypothetical assumptions. The cost of a choice includes what you gave up.',
    fields: [F.money('lump', 'One-time amount', 50000, 5000000, 1000), F.money('mon', 'Recurring monthly amount', 0, 200000, 100)],
    formula: ['Spent: ₹0 remains', 'Saved as cash: amount (0%)', 'Invested: Lump × (1+r)^t + monthly FV'], vars: [], assumptions: [DISC],
    compute: (v) => ({ summary: [S('If spent today', 0), S('If kept as cash for 10 yrs', v.lump + v.mon * 120, 'inr'), S('Total you would put in over 10 yrs', v.lump + v.mon * 120)], html: FOS.oppHTML(v.lump, v.mon) }) });
})();
