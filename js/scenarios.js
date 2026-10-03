/* ==========================================================================
   scenarios.js — rent vs buy, vehicle cost, business maths, WHAT IF? simulators
   ========================================================================== */
(function () {
  'use strict';
  const { F, S, reg } = FOS, C = FOS.calc, fmt = FOS.fmt, U = FOS.ui, ch = () => FOS.charts;
  const DISC = U.disclaimer;

  reg({
    id: 'rentbuy', title: 'Rent vs Buy', group: 'Property', module: 'property', tags: 'rent vs buy house property home loan appreciation down payment',
    intro: 'Compare the financial position after N years if you buy versus rent and invest the difference. Property appreciation and investment return are assumptions — the result flips when they change.',
    fields: [F.money('price', 'Property price', 6000000, 50000000, 100000, { lo: 1 }), F.money('down', 'Down payment', 1200000, 20000000, 50000), F.pct('lr', 'Home-loan interest', () => FOS.store.interest('homeLoan'), 15, 0.05), F.yrs('ten', 'Loan tenure (years)', 20, 30, 1, { lo: 1 }), F.money('rent', 'Monthly rent for similar home', 20000, 300000, 1000), F.pct('ri', 'Rent increase per year', 5, 15, 0.5), F.pct('app', 'Property appreciation per year', 5, 15, 0.5), F.money('mnt', 'Maintenance / society per month', 3000, 30000, 250), F.pct('ptx', 'Property tax etc. (% of price per year)', 0.2, 2, 0.05), F.pct('fee', 'Stamp duty, registration, brokerage (% of price)', 7, 12, 0.5), F.pct('sell', 'Cost of selling (% of value)', 2, 6, 0.5), F.pct('alt', 'Return on the alternative investment', 9, 18, 0.5), F.yrs('yrs', 'Compare after (years)', 15, 30, 1, { lo: 1 })],
    formula: ['Buyer net worth = Property value × (1 − selling cost) − Loan outstanding + any invested surplus', 'Renter net worth = (Down payment + fees) invested + monthly difference invested, compounding at the alternative return'], vars: ['Each month, whichever option costs less invests the difference'], assumptions: ['Interest tax benefits, rental yield and liquidity are not modelled', 'Appreciation and returns are assumptions, not forecasts', DISC],
    compute(v) {
      const run = (app, alt) => C.rentVsBuy({ years: v.yrs, price: v.price, down: Math.min(v.down, v.price), loanRate: v.lr, tenureYears: v.ten, rent: v.rent, rentInfl: v.ri, appreciation: app, maintenance: v.mnt, propTaxPct: v.ptx, feesPct: v.fee, sellCostPct: v.sell, altReturn: alt });
      const b = run(v.app, v.alt), scen = [['Low appreciation / high return', Math.max(0, v.app - 3), v.alt + 2], ['Base', v.app, v.alt], ['High appreciation / low return', v.app + 3, Math.max(0, v.alt - 2)]];
      return { summary: [S('EMI', b.emi, 'inr', true), S('Buy: net position', b.buyNet, 'inr', true), S('Rent + invest: net position', b.rentNet, 'inr', true), S('Difference (buy − rent)', b.buyNet - b.rentNet), S('Property value at end', b.value), S('Rent at end', b.finalRent)],
        table: { head: ['Scenario', 'Appreciation', 'Alt. return', 'Buy', 'Rent + invest', 'Difference'], rows: scen.map(([n, a, r]) => { const o = run(a, r); return [n, a + '%', r + '%', fmt.inr(o.buyNet), fmt.inr(o.rentNet), fmt.inr(o.buyNet - o.rentNet)]; }) }, tableTitle: 'Scenarios — none is a prediction',
        charts: [ch().line({ title: 'Net position over time', xLabel: 'Year', yfmt: 'inr', series: [{ name: 'Buy', data: b.series.map((p) => ({ x: p.x, y: p.buy })) }, { name: 'Rent + invest', data: b.series.map((p) => ({ x: p.x, y: p.rent })) }] })], notes: ['Non-financial factors — stability, freedom to move, pride of ownership — matter too and are yours to weigh.', DISC] };
    }
  });

  reg({
    id: 'car', title: 'Vehicle Cost Calculator', group: 'Vehicle', module: 'vehicle', tags: 'car vehicle bike cost per km fuel insurance depreciation loan ownership',
    intro: 'What does a vehicle really cost per month, per year, over 5 years and per kilometre?',
    fields: [F.money('price', 'On-road purchase price', 900000, 5000000, 25000, { lo: 1 }), F.money('down', 'Down payment', 180000, 5000000, 10000), F.pct('r', 'Loan interest', () => FOS.store.interest('carLoan'), 20, 0.05), F.yrs('ten', 'Loan tenure (years)', 5, 8, 1, { lo: 0.5 }), F.money('ins', 'Insurance per year', 30000, 100000, 500), F.money('km', 'Kilometres per month', 800, 5000, 50, { lo: 1 }), F.money('mileage', 'Mileage (km per litre/kWh-equivalent)', 15, 40, 0.5, { lo: 0.1 }), F.money('fuel', 'Fuel price per litre', 100, 200, 1), F.money('svc', 'Service & maintenance per year', 18000, 100000, 500), F.money('park', 'Parking / tolls per month', 1500, 10000, 100), F.money('tax', 'Road tax, registration (one-time, if not in price)', 0, 500000, 5000), F.pct('dep', 'Depreciation per year (declining)', 12, 30, 0.5)],
    formula: ['Monthly cost = EMI + fuel + (insurance + service)/12 + parking + depreciation/12', 'Cost per km = Monthly cost ÷ km per month'], vars: ['Depreciation (loss of resale value) is a real cost even though no cash leaves your account'], assumptions: ['Constant fuel price and usage; no major repairs'],
    compute(v) {
      const loan = Math.max(0, v.price - v.down), emi = C.emi(loan, v.r, Math.round(v.ten * 12)), fuel = v.km / v.mileage * v.fuel, dep5 = v.price - v.price * Math.pow(1 - v.dep / 100, 5), depY1 = v.price * v.dep / 100;
      const am = C.amortize({ principal: loan, rate: v.r, months: Math.round(v.ten * 12) }), owed = am.rows.length >= 60 ? am.rows[59].close : 0, resale5 = v.price * Math.pow(1 - v.dep / 100, 5), emiPeriod = Math.min(60, Math.round(v.ten * 12)), cash5 = v.down + v.tax + emi * emiPeriod + (fuel + v.park) * 60 + (v.ins + v.svc) * 5, mon = emi + fuel + v.park + (v.ins + v.svc + depY1) / 12, net5 = cash5 - (resale5 - owed);
      return { summary: [S('EMI', emi), S('Fuel per month', fuel), S('Monthly cost incl. depreciation', mon, 'inr', true), S('Annual cost', mon * 12, 'inr', true), S('Cash out over 5 years', cash5), S('5-year net cost (cash out − resale + loan still owed)', net5, 'inr', true), S('Interest paid over loan', emi * Math.round(v.ten * 12) - loan), S('Cost per km', mon / v.km, 'inr', true), S('Resale value after 5 years', v.price * Math.pow(1 - v.dep / 100, 5))],
        notes: ['5-year net cost = cash spent minus what you could sell it for after repaying any loan still owed.', 'Compare with cab / public transport / used car alternatives using your real usage.'] };
    }
  });

  reg({ id: 'breakeven', title: 'Break-even Calculator', group: 'Business', module: 'business', tags: 'break even business fixed cost variable cost selling price units margin',
    intro: 'How many units must you sell before you stop losing money?',
    fields: [F.money('fix', 'Fixed costs per month (rent, salaries, loan EMI…)', 100000, 5000000, 5000), F.money('var', 'Variable cost per unit', 60, 10000, 1), F.money('price', 'Selling price per unit', 100, 20000, 1, { lo: 0.01 })],
    formula: ['Break-even units = Fixed costs ÷ (Price − Variable cost)', 'Break-even revenue = Units × Price'], vars: ['Contribution margin = Price − Variable cost'], assumptions: ['Costs stay constant across the volume range'],
    compute(v) { const cm = v.price - v.var; if (cm <= 0) return { summary: [S('Contribution per unit', cm)], notes: ['Price must exceed variable cost, otherwise every sale increases the loss.'] }; const u = Math.ceil(v.fix / cm);
      const pts = []; const mx = u * 2; for (let i = 0; i <= 10; i++) { const q = mx * i / 10; pts.push({ q, rev: q * v.price, cost: v.fix + q * v.var }); }
      return { summary: [S('Contribution per unit', cm), S('Contribution margin', cm / v.price * 100, 'pct'), S('Break-even units', u, 'num', true), S('Break-even revenue', u * v.price, 'inr', true)], charts: [ch().line({ xLabel: 'Units', yfmt: 'inr', series: [{ name: 'Revenue', data: pts.map((p) => ({ x: Math.round(p.q), y: p.rev })) }, { name: 'Total cost', data: pts.map((p) => ({ x: Math.round(p.q), y: p.cost })) }] })] }; } });

  reg({ id: 'roi', title: 'ROI, Margins & Business Returns', group: 'Business', module: 'business', tags: 'roi margin profit revenue gross operating net roic roe',
    intro: 'Understand the layers of profit and the return on what was invested.',
    fields: [F.money('rev', 'Revenue', 5000000, 100000000, 100000, { lo: 1 }), F.money('cogs', 'Cost of goods / direct costs', 3000000, 100000000, 100000), F.money('opex', 'Operating expenses', 1000000, 50000000, 50000), F.money('int', 'Interest + tax + other', 200000, 20000000, 10000), F.money('inv', 'Capital invested', 2000000, 100000000, 100000, { lo: 1 })],
    formula: ['Gross profit = Revenue − Direct costs', 'Operating profit = Gross − Operating expenses', 'Net profit = Operating profit − Interest & tax', 'ROI = Net profit ÷ Capital invested × 100'], vars: ['ROIC = NOPAT ÷ invested capital (approximated here with operating profit)'], assumptions: [],
    compute(v) { const gp = v.rev - v.cogs, op = gp - v.opex, np = op - v.int; return { summary: [S('Gross profit', gp), S('Gross margin', gp / v.rev * 100, 'pct'), S('Operating profit', op), S('Operating margin', op / v.rev * 100, 'pct'), S('Net profit', np, 'inr', true), S('Net margin', np / v.rev * 100, 'pct'), S('ROI', np / v.inv * 100, 'pct', true), S('Return on invested capital (approx.)', op / v.inv * 100, 'pct')] }; } });

  reg({ id: 'runway', title: 'Cash Runway & Burn Rate', group: 'Business', module: 'business', tags: 'runway burn rate cash startup months',
    intro: 'How long can the business operate before cash runs out?',
    fields: [F.money('cash', 'Cash in bank', 1200000, 50000000, 50000), F.money('exp', 'Monthly expenses', 300000, 5000000, 10000, { lo: 1 }), F.money('rev', 'Monthly revenue (cash received)', 100000, 5000000, 10000), F.pct('g', 'Monthly revenue growth', 0, 30, 0.5)],
    formula: ['Net burn = Expenses − Revenue', 'Runway (months) = Cash ÷ Net burn'], vars: [], assumptions: ['Expenses constant; growth compounding monthly if entered'],
    compute(v) { const burn = v.exp - v.rev; let c = v.cash, m = 0, rev = v.rev; while (c > 0 && m < 240) { c += rev - v.exp; rev *= 1 + v.g / 100; m++; if (rev >= v.exp && c > 0 && m > 1) { m = 999; break; } } return { summary: [S('Net monthly burn', Math.max(0, burn)), S('Runway at today\'s burn', burn > 0 ? v.cash / burn : NaN, 'months', true), S('Runway with growth assumption', m >= 240 || m === 999 ? NaN : m, 'months')], notes: [burn <= 0 ? 'Revenue covers expenses in this scenario.' : 'Plan funding or cost cuts well before runway reaches 6 months.'] }; } });

  /* ---------------- WHAT IF simulations ---------------- */
  reg({ id: 'whatif-salary', title: 'What if my salary increases?', group: 'What If', module: 'scenarios', tags: 'what if salary raise hike increase 10% invest',
    intro: 'A raise can disappear into lifestyle. See what happens to savings if some of it is set aside.',
    fields: [F.money('inc', 'Monthly take-home', () => Math.round(FOS.metrics().income) || 60000, 1000000, 1000, { lo: 1 }), F.money('exp', 'Monthly expenses', () => Math.round(FOS.metrics().expenses) || 40000, 1000000, 1000), F.pct('raise', 'Raise', 10, 50, 1), F.pct('inv', 'Share of the raise you save/invest', 50, 100, 5), F.pct('r', 'Return assumption', 10, 18, 0.5), F.yrs('y', 'Years', 10, 30, 1)],
    formula: ['Extra income = Income × raise %', 'Extra saved = Extra income × share saved'], vars: [], assumptions: [DISC],
    compute(v) { const extra = v.inc * v.raise / 100, es = extra * v.inv / 100; return { summary: [S('Extra monthly income', extra), S('Extra saved per month', es, 'inr', true), S('Savings rate before', C.savingsRate(v.inc - v.exp, v.inc), 'pct'), S('Savings rate after', C.savingsRate(v.inc + extra - v.exp - (extra - es), v.inc + extra), 'pct', true), S('Hypothetical value of extra savings', C.sipFV(es, v.r, v.y * 12))], notes: [DISC] }; } });

  reg({ id: 'whatif-inflation', title: 'What if inflation increases?', group: 'What If', module: 'scenarios', tags: 'what if inflation 8% purchasing power rises',
    intro: 'Test 3% to 10% inflation on a sum of money and on a monthly expense.',
    fields: [F.money('amt', 'Amount of money today', 1000000, 50000000, 50000, { lo: 1 }), F.money('exp', 'Monthly expense today', 50000, 500000, 1000), F.yrs('y', 'Years', 15, 40, 1, { lo: 1 })],
    formula: ['Future expense = Expense × (1+i)^t', 'Today\'s-money value = Amount ÷ (1+i)^t'], vars: [], assumptions: [],
    compute(v) { const rates = [3, 4, 5, 6, 7, 8, 10]; return { summary: [], table: { head: ['Inflation', 'What ' + fmt.short(v.amt) + ' buys in today\'s money', 'Loss of buying power', 'Monthly expense then'], rows: rates.map((i) => [i + '%', fmt.inr(C.deflate(v.amt, i, v.y)), fmt.pct((1 - 1 / Math.pow(1 + i / 100, v.y)) * 100, 0), fmt.inr(C.futureCost(v.exp, i, v.y))]) }, tableTitle: 'After ' + v.y + ' years', charts: [ch().line({ xLabel: 'Year', yfmt: 'inr', series: [3, 6, 8, 10].map((i) => ({ name: i + '% inflation', data: Array.from({ length: Math.ceil(v.y) + 1 }, (_, t) => ({ x: t, y: C.deflate(v.amt, i, t) })) })) })] }; } });

  reg({ id: 'whatif-fall', title: 'What if my investment falls 50%?', group: 'What If', module: 'scenarios', tags: 'what if investment falls crash drawdown 50% recovery',
    intro: 'A drop is easy to say and hard to live through. Here is the arithmetic of recovering.',
    fields: [F.money('val', 'Portfolio value', () => Math.round(FOS.metrics().investments) || 1000000, 50000000, 50000, { lo: 1 }), F.pct('fall', 'Fall', 50, 100, 1, { hi: 99.9 }), F.pct('r', 'Assumed annual recovery growth', 10, 25, 0.5, { lo: 0.1 }), F.money('need', 'Money you would need within 1 year', 200000, 10000000, 10000)],
    formula: ['Value after fall = Value × (1 − fall)', 'Gain needed to recover = 1 ÷ (1 − fall) − 1', 'Years to recover = ln(1 ÷ (1 − fall)) ÷ ln(1 + r)'], vars: [], assumptions: ['Markets do not recover on a schedule; some assets never do'],
    compute(v) { const after = v.val * (1 - v.fall / 100), g = 1 / (1 - v.fall / 100) - 1; return { summary: [S('Value after fall', after, 'inr', true), S('Loss', v.val - after), S('Gain needed to get back', g * 100, 'pct', true), S('Years to recover at assumed growth', Math.log(1 + g) / Math.log(1 + v.r / 100), 'years'), S('Can you meet your 1-year need from the rest?', after >= v.need ? 1 : 0, 'yn')], notes: ['If money is needed soon, the value after a fall is what you can actually use. This is why short-term goals usually sit in low-volatility assets.'] }; } });

  reg({ id: 'whatif-rent', title: 'What if my rent increases?', group: 'What If', module: 'scenarios', tags: 'what if rent increase',
    intro: 'Rent compounds too.',
    fields: [F.money('rent', 'Monthly rent', 20000, 300000, 500, { lo: 1 }), F.pct('g', 'Yearly increase', 8, 20, 0.5), F.yrs('y', 'Years', 10, 30, 1, { lo: 1 }), F.money('inc', 'Monthly income', () => Math.round(FOS.metrics().income) || 80000, 1000000, 1000, { lo: 1 })],
    formula: ['Rent in year t = Rent × (1+g)^(t−1)'], vars: [], assumptions: [],
    compute(v) { let tot = 0; const pts = []; if (v.y < 1) return { summary: [S('Total rent paid', 0)] }; for (let i = 1; i <= v.y; i++) { const r = v.rent * Math.pow(1 + v.g / 100, i - 1); tot += r * 12; pts.push({ x: i, y: r }); } return { summary: [S('Rent in final year (monthly)', pts[pts.length - 1].y, 'inr', true), S('Total rent paid', tot, 'inr', true), S('Rent as % of today\'s income (final year)', pts[pts.length - 1].y / v.inc * 100, 'pct')], charts: [ch().line({ xLabel: 'Year', yfmt: 'inr', series: [{ name: 'Monthly rent', data: pts }] })] }; } });

  reg({ id: 'whatif-invest', title: 'What if I invest more each month?', group: 'What If', module: 'scenarios', tags: 'what if invest more sip 5000 10000 15000 20000',
    intro: 'Compare ₹5,000 to ₹20,000 per month under the same hypothetical return.',
    fields: [F.yrs('y', 'Years', 15, 40, 1, { lo: 1 }), F.pct('r', 'Return assumption', 12, 20, 0.5), F.pct('inf', 'Inflation (for today\'s-money view)', () => FOS.store.assume('inflation'), 12, 0.1)],
    formula: ['FV = P × ((1+i)^n − 1) ÷ i × (1+i)'], vars: [], assumptions: [DISC],
    compute(v) { const amts = [5000, 10000, 15000, 20000]; return { summary: [], table: { head: ['Monthly', 'Total invested', 'Hypothetical value', 'In today\'s money', 'If return were 4 points lower'], rows: amts.map((a) => { const f = C.sipFV(a, v.r, v.y * 12); return [fmt.inr(a), fmt.inr(a * v.y * 12), fmt.inr(f), fmt.inr(C.deflate(f, v.inf, v.y)), fmt.inr(C.sipFV(a, Math.max(0, v.r - 4), v.y * 12))]; }) }, tableTitle: 'Illustrative outcomes', charts: [ch().line({ xLabel: 'Year', yfmt: 'inr', series: amts.map((a) => ({ name: fmt.inr(a) + '/mo', data: Array.from({ length: Math.ceil(v.y) + 1 }, (_, t) => ({ x: t, y: C.sipFV(a, v.r, t * 12) })) })) })], notes: [DISC] }; } });

  reg({ id: 'whatif-retire', title: 'What if I retire earlier?', group: 'What If', module: 'scenarios', tags: 'what if retire earlier early retirement age',
    intro: 'Each year earlier means one fewer year of saving and one more year of spending.',
    fields: [F.num('age', 'Current age', 30, 60, 1, { lo: 18, hi: 70 }), F.money('exp', 'Monthly expenses today', 50000, 500000, 1000, { lo: 1 }), F.pct('inf', 'Inflation', () => FOS.store.assume('inflation'), 12, 0.1), F.money('cur', 'Current investments', 500000, 50000000, 50000), F.money('mon', 'Monthly investment', 25000, 300000, 1000), F.pct('r', 'Return before retirement', 11, 18, 0.5), F.pct('pr', 'Return after retirement', () => FOS.store.assume('postRetirementReturn'), 12, 0.5), F.num('life', 'Life expectancy', () => FOS.store.assume('lifeExpectancy'), 100, 1, { lo: 40, hi: 110 })],
    formula: ['Same model as the Retirement Planner, run for several retirement ages'], vars: [], assumptions: [DISC],
    compute(v) { const ages = [50, 55, 58, 60, 65].filter((a) => a > v.age); return { summary: [], table: { head: ['Retire at', 'Corpus needed', 'Projected', 'Gap / surplus'], rows: ages.map((a) => { const o = C.retirement({ age: v.age, retAge: a, monthlyExp: v.exp, inflation: v.inf, current: v.cur, monthly: v.mon, ret: v.r, lifeExp: v.life, postReturn: v.pr }); return [a, fmt.inr(o.needed), fmt.inr(o.projected), (o.gap >= 0 ? 'Surplus ' : 'Gap ') + fmt.inr(Math.abs(o.gap))]; }) }, tableTitle: 'Scenarios (not predictions)', notes: [DISC] }; } });

  /* ---------------- WHAT IF? tool ---------------- */
  FOS.tools.scenarios = function (root) {
    const ids = ['whatif-salary', 'whatif-inflation', 'whatif-job', 'whatif-emi', 'whatif-fall', 'whatif-rent', 'whatif-invest', 'whatif-retire'];
    root.innerHTML = `<div class="card"><h3>WHAT IF?</h3><p class="muted">Every scenario is a mathematical simulation using your inputs — never a prediction. Your profile and dashboard numbers pre-fill where available.</p><div id="wi-host"></div></div>`;
    FOS.tabs(root.querySelector('#wi-host'), ids.map((id) => ({ label: FOS.calcs[id].title.replace('What if ', '').replace('?', ''), render: (el) => FOS.renderCalc(el, id, { embedded: true }) })));
  };
})();
