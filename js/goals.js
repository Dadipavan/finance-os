/* ==========================================================================
   goals.js — goal planner, education / marriage / child, retirement, FI,
   emergency fund, job-loss, net-worth calculator, life simulator, goals tool
   ========================================================================== */
(function () {
  'use strict';
  const { F, S, reg } = FOS, C = FOS.calc, fmt = FOS.fmt, ch = () => FOS.charts;
  const DISC = FOS.ui.disclaimer;

  /* ---------- shared "future cost vs savings" model ---------- */
  function futureGoal(o) {
    return {
      id: o.id, title: o.title, group: 'Goals', module: o.module, tags: o.tags, intro: o.intro,
      fields: o.fields,
      formula: ['Future cost = Cost today × (1 + inflation)^years', 'Projected savings = Current × (1+r)^years + monthly SIP future value', 'Required monthly = (Future cost − FV of current savings) ÷ SIP factor'],
      vars: ['r = return assumption; SIP factor = future value of ₹1 invested monthly'], assumptions: ['Inflation and returns are assumptions; education and wedding costs often rise faster than general inflation', DISC],
      compute(v) {
        const years = o.years(v), n = Math.round(years * 12), fc = C.futureCost(v.cost, v.inf, years);
        const proj = (r) => v.cur * Math.pow(1 + r / 100, years) + C.sipFV(v.mon, r, n);
        const req = (r) => C.requiredMonthly(fc, v.cur, r, n);
        const sc = [Math.max(0, v.r - 3), v.r, v.r + 3];
        return {
          summary: [S('Years remaining', years, 'years'), S('Cost in today\'s money', v.cost), S('Estimated future cost', fc, 'inr', true), S('Projected savings (base)', proj(v.r), 'inr', true), S(proj(v.r) >= fc ? 'Surplus under assumptions' : 'Gap under assumptions', Math.abs(proj(v.r) - fc), 'inr'), S('Monthly needed to reach it (base)', req(v.r), 'inr', true)],
          table: { head: ['Return assumption', 'Projected savings', 'vs future cost', 'Monthly needed'], rows: sc.map((r) => [r + '%', fmt.inr(proj(r)), (proj(r) >= fc ? 'Surplus ' : 'Gap ') + fmt.inr(Math.abs(proj(r) - fc)), fmt.inr(req(r))]) }, tableTitle: 'Scenarios (not predictions)',
          notes: [DISC]
        };
      }
    };
  }
  const commonFut = (cost, years, mon) => [F.money('cost', 'Cost today', cost, 10000000, 50000, { lo: 1 }), F.pct('inf', 'Education / cost inflation', 8, 15, 0.1), years, F.money('cur', 'Current savings for this goal', 0, 5000000, 10000), F.pct('r', 'Return assumption', 9, 20, 0.1), F.money('mon', 'Monthly contribution', mon, 100000, 500)];
  reg(futureGoal({ id: 'edu', module: 'education', title: 'Education Cost Planner', tags: 'education college fees inflation future cost plan', intro: 'How much will a course cost when you need it, and what monthly amount could get you there?',
    fields: commonFut(2000000, F.yrs('yrs', 'Years remaining', 8, 25, 0.5, { lo: 0.25 }), 10000), years: (v) => v.yrs }));
  reg(futureGoal({ id: 'marriage', module: 'marriage', title: 'Marriage / Family Event Planner', tags: 'marriage wedding family planner cost', intro: 'Model a future family expense. This is a calculation, not a view on how anyone should celebrate.',
    fields: commonFut(1500000, F.yrs('yrs', 'Years remaining', 4, 20, 0.5, { lo: 0.25 }), 15000), years: (v) => v.yrs }));
  reg(futureGoal({ id: 'child', module: 'children', title: 'Child Education Planner', tags: 'child children education sukanya plan', intro: 'From your child\'s current age to the age the money is needed.',
    fields: [F.num('age', 'Child\'s current age', 2, 17, 1, { hi: 25 }), F.num('eage', 'Age when money is needed', 18, 25, 1, { lo: 1, hi: 30 })].concat(commonFut(2500000, { id: 'dummy', hidden: true }, 8000).filter((f) => !f.hidden)), years: (v) => Math.max(0, v.eage - v.age) }));

  reg({
    id: 'goal', title: 'Goal Planner', group: 'Goals', module: 'goals', tags: 'goal planner target amount deadline monthly contribution saving',
    intro: 'For any goal — a laptop, bike, car or house: how much per month, under your assumptions?',
    fields: [F.money('target', 'Target amount (today\'s price)', 100000, 10000000, 5000, { lo: 1 }), F.money('cur', 'Already saved', 10000, 5000000, 1000), F.yrs('yrs', 'Deadline (years)', 2, 30, 0.25, { lo: 0.1 }), F.pct('inf', 'Price inflation', 5, 15, 0.1), F.pct('r', 'Return assumption (use low for short goals)', 6, 15, 0.1)],
    formula: ['Target at deadline = Target × (1+inflation)^years', 'Monthly = (Target_future − Current×(1+r)^t) ÷ SIP factor'], vars: [], assumptions: ['For goals under ~3 years, many prefer low-volatility options; equity can fall right before the deadline'],
    compute(v) { const fut = C.futureCost(v.target, v.inf, v.yrs), n = Math.round(v.yrs * 12), m = C.requiredMonthly(fut, v.cur, v.r, n); return { summary: [S('Target at deadline', fut, 'inr', true), S('Required monthly contribution', m, 'inr', true), S('Total you contribute', m * n), S('Returns contribute (assumed)', Math.max(0, fut - v.cur - m * n))], notes: [DISC] }; }
  });

  reg({
    id: 'retirement', title: 'Retirement Planner', group: 'Retirement', module: 'retirement', tags: 'retirement corpus planner inflation withdrawal nps epf',
    intro: 'Estimate the corpus your future spending might require and compare it with where your savings could get you — under assumptions you control.',
    fields: [F.num('age', 'Current age', 30, 60, 1, { lo: 18, hi: 80 }), F.num('ret', 'Retirement age', () => FOS.store.assume('retirementAge'), 70, 1, { lo: 25, hi: 90 }), F.money('exp', 'Current monthly expenses', 50000, 500000, 1000, { lo: 1 }), F.pct('inf', 'Inflation', () => FOS.store.assume('inflation'), 12, 0.1), F.money('cur', 'Current investments', 500000, 20000000, 50000), F.money('mon', 'Monthly investment', 20000, 300000, 1000), F.pct('r', 'Return before retirement', 11, 18, 0.1), F.pct('pr', 'Return after retirement', () => FOS.store.assume('postRetirementReturn'), 12, 0.1), F.num('life', 'Life expectancy', () => FOS.store.assume('lifeExpectancy'), 100, 1, { lo: 40, hi: 110 })],
    formula: ['Future annual expense = Current × 12 × (1+i)^years', 'Corpus needed = Σ withdrawals discounted at real post-retirement return', 'Projected = Current×(1+r)^t + SIP FV'], vars: ['Real return = (1+post-return)/(1+inflation) − 1', 'Withdrawals assumed at start of each year, rising with inflation'], assumptions: ['Life expectancy, inflation and returns are assumptions; pensions, EPF, rental income are not included — add them to “current investments” if you wish', 'Healthcare inflation can exceed general inflation', DISC],
    compute(v) {
      if (v.ret <= v.age) return { summary: [], notes: ['Retirement age must be after your current age.'] };
      const base = (r) => C.retirement({ age: v.age, retAge: v.ret, monthlyExp: v.exp, inflation: v.inf, current: v.cur, monthly: v.mon, ret: r, lifeExp: v.life, postReturn: v.pr });
      const b = base(v.r), sc = [Math.max(0, v.r - 3), v.r, v.r + 2].map((r) => ({ r, o: base(r) }));
      const pts = []; for (let y = 0; y <= b.yrs; y++) pts.push({ x: v.age + y, y: v.cur * Math.pow(1 + v.r / 100, y) + C.sipFV(v.mon, v.r, y * 12) });
      return {
        summary: [S('Current annual expenses', v.exp * 12), S('Estimated annual expenses at retirement', b.futureAnnual), S('Estimated corpus needed', b.needed, 'inr', true), S('Projected corpus (base)', b.projected, 'inr', true), S(b.gap >= 0 ? 'Surplus under assumptions' : 'Gap under assumptions', Math.abs(b.gap), 'inr', true), S('Extra monthly investment to close a gap', b.gap < 0 ? C.requiredMonthly(b.needed - 0, v.cur, v.r, b.yrs * 12) - v.mon : 0, 'inr')],
        table: { head: ['Return assumption', 'Projected corpus', 'Needed', 'Gap / surplus'], rows: sc.map((s) => [s.r + '%', fmt.inr(s.o.projected), fmt.inr(s.o.needed), (s.o.gap >= 0 ? '+' : '−') + fmt.inr(Math.abs(s.o.gap)).replace('-', '')]) }, tableTitle: 'Scenarios (not predictions)',
        charts: [ch().line({ title: 'Projected corpus by age', xLabel: 'Age', yfmt: 'inr', area: true, series: [{ name: 'Projected corpus', data: pts }, { name: 'Estimated need', data: pts.map((p) => ({ x: p.x, y: b.needed })), dash: true }] })], notes: [DISC]
      };
    }
  });

  reg({
    id: 'fi', title: 'Financial Independence Calculator', group: 'Retirement', module: 'fi', tags: 'financial independence fire corpus savings rate years to fi',
    intro: 'When could your investments cover your expenses? Explore how savings rate and returns change the answer.',
    fields: [F.money('exp', 'Monthly expenses', 50000, 500000, 1000, { lo: 1 }), F.money('inv', 'Current investments', 500000, 50000000, 50000), F.money('sav', 'Monthly investing', 30000, 300000, 1000), F.pct('r', 'Return assumption', 10, 18, 0.1), F.pct('inf', 'Inflation', () => FOS.store.assume('inflation'), 12, 0.1), F.pct('wr', 'Sustainable withdrawal rate assumption', 3.5, 8, 0.1, { lo: 0.5 })],
    formula: ['FI number = Annual expenses ÷ withdrawal rate', 'Each year: Corpus = Corpus × (1+r) + yearly investing;  FI number grows with inflation'], vars: ['A 3–4% withdrawal rate is a widely discussed rule of thumb; it is NOT a guarantee'], assumptions: ['Investing amount stays constant in today\'s rupees? No — it is constant in nominal terms here (conservative if your income grows)', DISC],
    compute(v) {
      const run = (r) => { let c = v.inv, e = v.exp * 12; for (let y = 0; y <= 70; y++) { const need = e / (v.wr / 100); if (c >= need) return { years: y, need, c }; c = c * (1 + r / 100) + v.sav * 12 * (1 + r / 200); e *= 1 + v.inf / 100; } return { years: NaN }; };
      const b = run(v.r), rows = [Math.max(0, v.r - 3), v.r, v.r + 3].map((r) => { const o = run(r); return [r + '%', Number.isFinite(o.years) ? o.years + ' years' : 'Not within 70 years', Number.isFinite(o.years) ? fmt.inr(o.need) : '—']; });
      const pts = [], tg = []; { let c = v.inv, e = v.exp * 12; for (let y = 0; y <= Math.min(45, Number.isFinite(b.years) ? b.years + 5 : 40); y++) { pts.push({ x: y, y: c }); tg.push({ x: y, y: e / (v.wr / 100) }); c = c * (1 + v.r / 100) + v.sav * 12 * (1 + v.r / 200); e *= 1 + v.inf / 100; } }
      return { summary: [S('FI number today', v.exp * 12 / (v.wr / 100), 'inr', true), S('Current savings rate needs income — see dashboard', v.inv, 'inr'), S('Years to FI (base)', b.years, 'years', true), S('FI number at that time', b.need, 'inr')], table: { head: ['Return assumption', 'Years to FI', 'FI number then'], rows }, tableTitle: 'Scenarios', charts: [ch().line({ xLabel: 'Year', yfmt: 'inr', series: [{ name: 'Your investments', data: pts }, { name: 'FI number (inflating)', data: tg, dash: true }] })], notes: [DISC] };
    }
  });

  reg({
    id: 'emergency', title: 'Emergency Fund Calculator', group: 'Protection', module: 'emergency', tags: 'emergency fund months expenses buffer liquid',
    intro: 'Explore 3, 6, 9 and 12 months of cover. No single number is right for everyone.',
    fields: [F.money('ess', 'Monthly essential expenses', 30000, 300000, 500, { lo: 1 }), F.money('debt', 'Monthly debt payments (EMIs, minimum dues)', 10000, 200000, 500), F.sel('stab', 'Income stability', '1', [['0', 'Very stable (salaried, secure)'], ['1', 'Moderately stable'], ['2', 'Variable / self-employed / commission']]), F.num('dep', 'Dependents', 1, 8, 1), F.sel('ins', 'Health insurance in place?', '1', [['1', 'Yes, adequate'], ['0', 'No / unsure']]), F.money('have', 'Existing liquid savings for emergencies', 50000, 2000000, 1000), F.money('save', 'Monthly amount you can add', 5000, 100000, 500)],
    formula: ['Target = (Essential expenses + Debt payments) × months', 'Months to fill = Gap ÷ Monthly contribution'], vars: [], assumptions: ['Factors such as variable income, dependents and lack of health insurance often argue for a larger buffer — but it is your judgement'],
    compute(v) {
      const burn = v.ess + v.debt, months = FOS.store.get() && FOS.FINANCIAL_ASSUMPTIONS.emergencyMonths, factors = (v.stab >= 2 ? 1 : 0) + (v.dep > 0 ? 1 : 0) + (+v.ins === 0 ? 1 : 0) + (v.stab == 1 ? 0.5 : 0);
      return { summary: [S('Monthly cover needed', burn), S('You currently cover', burn > 0 ? v.have / burn : NaN, 'months', true), S('Factors that often argue for a larger buffer', factors, 'num')],
        table: { head: ['Months of cover', 'Target amount', 'Gap', 'Time to fill'], rows: months.map((m) => { const t = burn * m, g = Math.max(0, t - v.have); return [m + ' months', fmt.inr(t), fmt.inr(g), g <= 0 ? 'Covered' : v.save > 0 ? fmt.months(Math.ceil(g / v.save)) : '—']; }) }, tableTitle: 'Scenarios',
        actions: [{ label: 'Record my existing savings as Emergency Fund (asset)', run: () => FOS.recordEF(v.have) }],
        notes: ['Keep this in instantly accessible, low-risk places (savings account, liquid fund, short FD) — not in volatile investments.'] };
    }
  });
  FOS.recordEF = function (value) {
    FOS.store.update((s) => { const a = s.assets.find((x) => x.cat === 'Emergency Fund' && x.name === 'Emergency fund'); if (a) a.value = value; else s.assets.push({ id: FOS.store.uid(), name: 'Emergency fund', cat: 'Emergency Fund', value }); });
    FOS.ui.toast('Emergency Fund saved — see your Dashboard.');
  };

  reg({
    id: 'whatif-job', title: 'What if I lose my job?', group: 'What If', module: 'emergency', tags: 'job loss unemployment months coverage what if emergency',
    intro: 'How long could you last with no salary?',
    fields: [F.money('sav', 'Liquid savings (incl. emergency fund)', () => Math.round(FOS.metrics().liquid) || 200000, 3000000, 5000), F.money('ess', 'Monthly essential expenses', () => Math.round(FOS.metrics().essential) || 30000, 300000, 500, { lo: 1 }), F.money('debt', 'Monthly debt payments', () => Math.round(FOS.metrics().emi) || 10000, 200000, 500), F.money('other', 'Other monthly income (spouse, rent, severance ÷ months)', 0, 200000, 500), F.money('ins', 'Insurance / benefits that pay monthly', 0, 100000, 500)],
    formula: ['Months of coverage = Savings ÷ (Essentials + Debt payments − Other income − Benefits)'], vars: [], assumptions: ['Assumes expenses stay constant and no one-off bills; medical emergencies would shorten this'],
    compute(v) { const burn = v.ess + v.debt - v.other - v.ins, m = (b) => (b > 0 ? v.sav / b : Infinity);
      const rows = [0, 10, 20, 30].map((c) => { const b = (v.ess * (1 - c / 100)) + v.debt - v.other - v.ins; return [c + '% cut in essentials', fmt.inr(Math.max(0, b)), b <= 0 ? 'Indefinite' : fmt.months(v.sav / b)]; });
      return { summary: [S('Net monthly outflow', Math.max(0, burn)), S('Approx. months of coverage', Number.isFinite(m(burn)) ? m(burn) : NaN, 'months', true)], table: { head: ['Scenario', 'Monthly outflow', 'Coverage'], rows }, tableTitle: 'If you cut spending', notes: burn <= 0 ? ['Your other income covers your outflow in this scenario.'] : [] }; }
  });

  reg({
    id: 'networthcalc', title: 'Net Worth Calculator', group: 'Net Worth', module: 'networth', tags: 'net worth assets liabilities calculator',
    intro: 'Net Worth = Assets − Liabilities. Enter approximate values; for a saved tracker use the Net Worth tool.',
    fields: [F.money('a1', 'Cash & bank', 100000, 5000000, 5000), F.money('a2', 'FD / RD', 100000, 5000000, 5000), F.money('a3', 'Investments (stocks, funds, EPF, PPF)', 100000, 20000000, 5000), F.money('a4', 'Gold', 0, 5000000, 5000), F.money('a5', 'Property (market value)', 0, 50000000, 50000), F.money('a6', 'Vehicle (resale value)', 0, 5000000, 5000), F.money('a7', 'Other assets', 0, 5000000, 5000), F.money('l1', 'Credit card dues', 0, 1000000, 1000), F.money('l2', 'Personal loans', 0, 5000000, 5000), F.money('l3', 'Vehicle loan', 0, 5000000, 5000), F.money('l4', 'Home loan', 0, 50000000, 50000), F.money('l5', 'Education loan', 0, 5000000, 5000), F.money('l6', 'Other liabilities', 0, 5000000, 5000)],
    formula: ['Net Worth = Total Assets − Total Liabilities'], vars: ['Use what you could realistically sell for, not what you paid'], assumptions: [],
    compute(v) { const A = v.a1 + v.a2 + v.a3 + v.a4 + v.a5 + v.a6 + v.a7, L = v.l1 + v.l2 + v.l3 + v.l4 + v.l5 + v.l6; return { summary: [S('Total assets', A), S('Total liabilities', L), S('Net worth', A - L, 'inr', true), S('Liabilities as % of assets', A > 0 ? L / A * 100 : NaN, 'pct')], charts: [ch().bar({ cats: ['Assets', 'Liabilities', 'Net worth'], series: [{ name: 'Amount', data: [A, L, A - L] }], yfmt: 'inr' })] }; }
  });

  reg({
    id: 'lifesim', title: 'Financial Life Simulator', group: 'Simulators', module: 'fi', tags: 'life simulator financial journey age income net worth projection',
    intro: 'A mathematical scenario model of a hypothetical financial journey. Change any assumption and watch the path change.',
    fields: [F.num('age', 'Age', 25, 60, 1, { lo: 16, hi: 80 }), F.money('inc', 'Monthly take-home income', 50000, 500000, 1000, { lo: 1 }), F.pct('g', 'Income growth per year', 7, 20, 0.5), F.money('exp', 'Monthly expenses', 30000, 400000, 1000), F.pct('inf', 'Inflation', () => FOS.store.assume('inflation'), 12, 0.1), F.money('sav', 'Current savings + investments', 100000, 20000000, 10000), F.money('debt', 'Current debt', 0, 10000000, 25000), F.pct('dr', 'Debt interest rate', 10, 30, 0.1), F.yrs('dy', 'Years to repay debt', 5, 30, 1, { lo: 1 }), F.pct('r', 'Return before retirement', 10, 18, 0.1), F.pct('pr', 'Return after retirement', () => FOS.store.assume('postRetirementReturn'), 12, 0.1), F.num('ret', 'Retirement age', () => FOS.store.assume('retirementAge'), 70, 1, { lo: 30, hi: 90 }), F.num('life', 'Simulate until age', () => FOS.store.assume('lifeExpectancy'), 100, 1, { lo: 40, hi: 110 })],
    formula: ['Each year: Pool = Pool × (1 + return) + Income − Expenses − Debt payment', 'Income grows by the growth rate until retirement; expenses grow by inflation', 'Net worth = Pool − Debt outstanding'], vars: ['After retirement, income is zero and the pool funds expenses'], assumptions: ['This is a mathematical scenario model, not a prediction of your future.', 'Taxes are assumed included in “take-home”. One-time events (house, children) are not modelled — add them by changing expenses.'],
    compute(v) {
      if (v.life <= v.age || v.ret <= v.age) return { summary: [], notes: ['Retirement and end ages must be above current age.'] };
      let pool = v.sav, debt = v.debt, inc = v.inc * 12, exp = v.exp * 12, dp = C.emi(v.debt, v.dr, Math.round(v.dy * 12)) * 12, rows = [], pts = [], depleted = null;
      for (let a = v.age; a <= v.life; a++) {
        const working = a < v.ret, interest = debt * v.dr / 100, pay = debt > 0 ? Math.min(dp, debt + interest) : 0;
        debt = Math.max(0, debt + interest - pay);
        const income = working ? inc : 0, surplus = income - exp - pay;
        pool = pool * (1 + (working ? v.r : v.pr) / 100) + surplus;
        if (pool < 0 && depleted === null) depleted = a;
        rows.push([a, fmt.inr(income), fmt.inr(exp), fmt.inr(surplus), fmt.inr(pool), fmt.inr(debt), fmt.inr(pool - debt)]); pts.push({ x: a, y: pool - debt });
        if (working) inc *= 1 + v.g / 100; exp *= 1 + v.inf / 100;
      }
      const atRet = pts.find((p) => p.x === v.ret);
      return { summary: [S('Net worth at retirement (scenario)', atRet ? atRet.y : NaN, 'inr', true), S('Net worth at end age', pts[pts.length - 1].y, 'inr'), S('Savings pool runs out at age', depleted === null ? 'Does not run out' : 'Age ' + depleted, 'text', true)], charts: [ch().line({ title: 'Net worth by age', xLabel: 'Age', yfmt: 'inr', area: true, series: [{ name: 'Net worth (scenario)', data: pts }] })], table: { head: ['Age', 'Income', 'Expenses', 'Saved (after debt)', 'Investments & savings', 'Debt', 'Net worth'], rows }, tableTitle: 'Year-by-year scenario', notes: [depleted === null ? 'Under these assumptions the pool lasts to the end age. Try lower returns or higher inflation to see sensitivity.' : 'Under these assumptions the pool is exhausted at age ' + depleted + '. Change assumptions to explore.', 'This is a mathematical scenario model, not a prediction of your future.'] };
    }
  });

  /* ---------- Goals tool (saved goals) ---------- */
  FOS.tools.goals = function (root) {
    const U = FOS.ui, types = ['Emergency Fund', 'Laptop', 'Phone', 'Bike', 'Car', 'House', 'Education', 'Travel', 'Marriage', 'Children', 'Retirement', 'Financial Independence', 'Other'];
    root.innerHTML = `<div class="card"><h3>My goals</h3><p class="muted">Add goals and see the monthly amount each one needs under your own inflation and return assumptions. Progress feeds your dashboard.</p><div id="goal-list"></div><div id="goal-sum"></div></div>`;
    const req = (g) => {
      const t = +g.target || 0, cur = +g.current || 0, dl = g.deadline ? (new Date(g.deadline) - new Date()) / (365.25 * 864e5) : 0;
      if (t <= 0) return '<span class="muted">Enter a target</span>'; if (!g.deadline) return '<span class="muted">Add a deadline</span>'; if (dl <= 0) return '<span class="warn-t">Deadline passed</span>';
      const fut = C.futureCost(t, +g.inflation || 0, dl), m = C.requiredMonthly(fut, cur, +g.ret || 0, Math.round(dl * 12));
      return `<b>${fmt.inr(m)}</b>/mo <small class="muted">(target then ${fmt.inr(fut)})</small>`;
    };
    FOS.crud(U.$('#goal-list', root), {
      list: (s) => s.goals, addLabel: 'Add goal', empty: 'No goals yet. Try adding an emergency fund.',
      cols: [{ k: 'name', label: 'Goal name', type: 'text' }, { k: 'type', label: 'Type', type: 'select', options: types }, { k: 'target', label: 'Target (today ₹)', type: 'money' }, { k: 'current', label: 'Saved so far', type: 'money' }, { k: 'deadline', label: 'Deadline', type: 'date' }, { k: 'inflation', label: 'Inflation %', type: 'number' }, { k: 'ret', label: 'Return %', type: 'number' }],
      blank: () => ({ name: '', type: 'Emergency Fund', target: '', current: '', deadline: '', inflation: 5, ret: 6 }),
      computed: { label: 'Required contribution', fn: req },
      footer: (items) => items.length ? `<div class="goal-bars">${items.map((g) => `<div><div class="between"><span>${U.esc(g.name || g.type)}</span><b>${fmt.pct((+g.current || 0) / (+g.target || 1) * 100, 0)}</b></div>${ch().progress((+g.current || 0) / (+g.target || 1) * 100, g.name)}</div>`).join('')}</div>` : ''
    });
  };
})();
