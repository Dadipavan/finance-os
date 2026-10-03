/* ==========================================================================
   adviser.js — My Action Plan, Grow My Money (return ladder), Tax Optimizer, HRA
   Turns your numbers into a concrete, ordered plan with amounts.
   ========================================================================== */
(function () {
  'use strict';
  const { F, S, reg } = FOS, C = FOS.calc, fmt = FOS.fmt, U = FOS.ui, esc = U.esc, store = FOS.store, ch = () => FOS.charts;
  const inr = fmt.inr, pc = (x, d) => fmt.pct(x, d === undefined ? 1 : d);
  const yr = () => FOS.TAX_RULES.years[FOS.TAX_RULES.defaultYear];
  const cess = () => 1 + (yr().regimes.new.cessPct || 0) / 100;

  /* ---------------- tax helpers ---------------- */
  function marginalRate(annualGross) {
    const r = yr().regimes.new, ti = Math.max(0, annualGross - r.stdDeduction); if (ti <= (r.rebate ? r.rebate.limit : 0)) return 0;
    let prev = 0, rate = 0; for (const [lim, rt] of r.slabs) { if (ti > prev) rate = rt; prev = lim === null ? Infinity : lim; if (ti <= prev) break; } return rate;
  }
  FOS.marginalRate = marginalRate;
  const hraExempt = (basicYr, hraYr, rentMo, metro) => Math.max(0, Math.min(hraYr, rentMo * 12 - 0.1 * basicYr, (metro ? 0.5 : 0.4) * basicYr));
  function taxFor(o, regimeKey, x) {
    const y = yr(), r = y.regimes[regimeKey], d = y.deductionsOld, std = Math.min(o.salary, r.stdDeduction);
    let ti = o.salary + o.other - std;
    if (regimeKey === 'new') ti -= Math.min(o.empNps, o.salary);
    else {
      const c80 = Math.min(o.d80c + (x.d80c || 0), d['80C']), nps = Math.min(o.nps + (x.nps || 0), d['NPS 80CCD(1B)']);
      const h = Math.min(o.homeInt + (x.homeInt || 0), d['Home-loan interest (self-occupied)']);
      const self = Math.min(o.d80dSelf + (x.d80dSelf || 0), d['80D (self/family, <60)']), par = Math.min(o.d80dPar + (x.d80dPar || 0), o.parSenior ? d['80D (parents, senior)'] : d['80D (parents, <60)']);
      ti -= hraExempt(o.basic, o.hra, o.rent, o.metro) + c80 + nps + h + self + par + o.eduInt;
      ti -= Math.min(o.empNps, o.salary);
    }
    return C.incomeTax(Math.max(0, ti), r).total;
  }
  const taxOptFields = () => [F.money('salary', 'Annual gross salary', () => Math.round((+store.get().profile.annualIncome || FOS.metrics().income * 12) * 1.0) || 1500000, 10000000, 50000, { lo: 0 }), F.money('other', 'Other income (interest, rent, etc.)', 30000, 2000000, 5000), F.money('basic', 'Annual basic salary', 600000, 5000000, 25000), F.money('hra', 'HRA received per year', 240000, 2000000, 10000), F.money('rent', 'Rent you pay per month', 20000, 200000, 500), F.sel('metro', 'City', '1', [['1', 'Metro (Delhi, Mumbai, Kolkata, Chennai — 50%)'], ['0', 'Other (40%)']]), F.money('d80c', '80C already used (EPF, PPF, ELSS, life premium…)', 150000, 150000, 5000), F.money('nps', 'Your own NPS (80CCD(1B))', 0, 50000, 1000), F.money('empNps', 'Employer NPS contribution', 0, 500000, 5000), F.money('d80dSelf', '80D health premium — self/family', 0, 25000, 500), F.money('d80dPar', '80D health premium — parents', 0, 50000, 500), F.sel('parSenior', 'Parents are 60+?', '0', [['0', 'No'], ['1', 'Yes']]), F.money('homeInt', 'Home-loan interest (self-occupied)', 0, 200000, 5000), F.money('eduInt', 'Education-loan interest', 0, 500000, 5000)];
  reg({
    id: 'taxopt', title: 'Tax Optimizer — best regime and the deductions worth using', group: 'Tax', module: 'tax', tags: 'tax optimizer save tax regime old new 80c 80d nps hra deductions plan',
    intro: 'Compares the new and old regime on your actual numbers, tells you which to file under, and shows exactly how much tax each unused deduction would save.',
    fields: taxOptFields(),
    formula: ['Tax(new) = slabs on (income − standard deduction − employer NPS)', 'Tax(old) = slabs on (income − standard deduction − HRA exemption − 80C − NPS − 80D − home-loan interest − education-loan interest − employer NPS)', 'Saving from a lever = Tax(old now) − Tax(old with the lever fully used)'],
    vars: ['HRA exemption = least of HRA received, rent − 10% of basic, and 50% (metro) / 40% of basic', 'Limits and slabs come from TAX_RULES for the default year (Data & Sources)'],
    assumptions: ['Salary treated as fully taxable salary income; surcharge not modelled'],
    compute(v) {
      const o = Object.assign({}, v, { metro: +v.metro === 1, parSenior: +v.parSenior === 1, otherInterest: 0 }), d = yr().deductionsOld;
      const tn = taxFor(o, 'new', {}), to = taxFor(o, 'old', {}), best = tn <= to ? 'NEW' : 'OLD', save = Math.abs(tn - to);
      const levers = [['80C room', 'd80c', Math.max(0, d['80C'] - o.d80c), 'EPF/VPF, PPF, ELSS, term premium, tuition — only if you would save this anyway'], ['NPS extra (80CCD(1B))', 'nps', Math.max(0, d['NPS 80CCD(1B)'] - o.nps), 'Locked until retirement; part is annuity'], ['80D — self/family', 'd80dSelf', Math.max(0, d['80D (self/family, <60)'] - o.d80dSelf), 'Health insurance you should hold anyway'], ['80D — parents', 'd80dPar', Math.max(0, (o.parSenior ? d['80D (parents, senior)'] : d['80D (parents, <60)']) - o.d80dPar), 'Health cover for parents']];
      const rows = levers.map(([n, k, room, note]) => [n, inr(room), room > 0 ? inr(Math.max(0, to - taxFor(o, 'old', { [k]: room }))) : '—', note]);
      const all = {}; levers.forEach(([, k, room]) => { all[k] = room; }); const toFull = taxFor(o, 'old', all);
      const hx = hraExempt(o.basic, o.hra, o.rent, o.metro);
      return {
        summary: [S('Tax — new regime', tn, 'inr', true), S('Tax — old regime (as entered)', to, 'inr', true), S('FILE UNDER', best + ' regime', 'text', true), S('You save by choosing it', save, 'inr', true), S('Old regime with every lever fully used', toFull), S('HRA exemption (old regime)', hx)],
        table: { head: ['Lever', 'Room left', 'Tax saved if used (old regime)', 'Note'], rows }, tableTitle: 'Deductions still available',
        notes: [`Recommendation: file under the ${best} regime — about ${inr(save)} less tax than the other, on these numbers.`, toFull < Math.min(tn, to) ? `If you actually fill every lever, the old regime drops to ${inr(toFull)}, which is ${inr(Math.min(tn, to) - toFull)} below your current best. That is worth doing only for money you would invest or insure anyway — never lock cash up just for the deduction.` : 'Even with every lever used, the new regime remains at least as good.', 'Illegal shortcuts (fake rent receipts, hidden income) are never worth the risk — the legitimate levers above are the ones to use.']
      };
    }
  });
  reg({ id: 'hra', title: 'HRA Exemption Calculator', group: 'Tax', module: 'tax', tags: 'hra house rent allowance exemption old regime rent receipt',
    intro: 'How much of your HRA is tax-free under the old regime.',
    fields: [F.money('basic', 'Annual basic salary', 600000, 5000000, 25000), F.money('hra', 'HRA received per year', 240000, 2000000, 10000), F.money('rent', 'Rent paid per month', 20000, 200000, 500), F.sel('metro', 'City', '1', [['1', 'Metro — 50% of basic'], ['0', 'Other — 40% of basic']])],
    formula: ['Exempt HRA = least of: HRA received; rent paid − 10% of basic; 50% (metro) or 40% of basic'], vars: ['Needs genuine rent paid; rent above ₹1 lakh a year needs the landlord\'s PAN'], assumptions: ['Old regime only'],
    compute(v) { const a = v.hra, b = Math.max(0, v.rent * 12 - 0.1 * v.basic), c = (+v.metro ? 0.5 : 0.4) * v.basic, ex = Math.min(a, b, c); return { summary: [S('HRA received', a), S('Rent − 10% of basic', b), S('50% / 40% of basic', c), S('Tax-free HRA', ex, 'inr', true), S('Taxable HRA', a - ex)] }; } });

  /* ---------------- Grow My Money: the return ladder ---------------- */
  const defaultRate = { 'Credit card': () => store.interest('creditCardAPR'), 'Personal loan': () => store.interest('personalLoan'), 'Vehicle loan': () => store.interest('carLoan'), 'Home loan': () => store.interest('homeLoan'), 'Education loan': () => store.interest('educationLoan'), Other: () => store.interest('personalLoan') };
  const liabRate = (l) => (l.rate !== undefined && l.rate !== '' ? +l.rate : (defaultRate[l.cat] || defaultRate.Other)());
  FOS.liabRate = liabRate;
  function ladderRows(slab) {
    const inf = store.assume('inflation'), cs = cess(), post = (r, mode) => (mode === 'free' ? r : mode === 'ltcg' ? r * (1 - 0.125 * cs) : mode === 'nps' ? r * (1 - 0.4 * slab / 100 * cs) : r * (1 - slab / 100 * cs));
    const o = [['Savings account', store.interest('savingsAccount'), 'slab', 'Very low', 'Instant', 'Emergency money only — not for growth'], ['Bank fixed deposit', store.interest('fd1y'), 'slab', 'Very low', 'Medium (penalty)', 'Goals 1–5 years away'], ['Recurring deposit', store.interest('rd'), 'slab', 'Very low', 'Medium', 'Building the saving habit, short goals'], ['Post Office / NSC (5y)', store.schemeRate('NSC'), 'slab', 'Very low', 'Low', 'Safe 5-year money'], ['PPF', store.schemeRate('PPF'), 'free', 'Very low', 'Low (15y)', 'Core safe long-term money, tax-free'], ['EPF / VPF (salaried)', store.interest('epf'), 'free', 'Very low', 'Low', 'Highest safe return for most salaried people'], ['Sukanya Samriddhi', store.schemeRate('SSY'), 'free', 'Very low', 'Low', 'Girl child education/marriage'], ['SCSS (age 60+)', store.schemeRate('SCSS'), 'slab', 'Very low', 'Low–Medium', 'Retirement income'], ['Debt mutual fund', store.assume('debtReturn'), 'slab', 'Low–Medium', 'High', '1–3 year money'], ['Gold (ETF / SGB)', store.assume('goldReturn'), 'ltcg', 'Medium', 'High', '5–10% of the portfolio'], ['NPS', store.interest('npsReturn'), 'nps', 'Medium', 'Very low (till 60)', 'Retirement, plus extra tax deduction'], ['Equity index fund (assumed)', store.assume('equityReturn'), 'ltcg', 'High', 'High', '7+ year money; the main long-term growth engine']];
    const rows = o.map(([n, r, m, risk, liq, fit]) => ({ n, pre: r, post: post(r, m), tax: m === 'free' ? 'Tax-free*' : m === 'slab' ? 'Taxed at your slab' : m === 'ltcg' ? 'Long-term gains rate' : 'Partly taxable', risk, liq, fit, kind: 'invest', real: ((1 + post(r, m) / 100) / (1 + inf / 100) - 1) * 100 }));
    store.get().liabilities.filter((l) => +l.value > 0).forEach((l) => { const r = liabRate(l); rows.push({ n: 'Repay: ' + (l.name || l.cat), pre: r, post: r, tax: 'No tax — saved interest', risk: 'None (guaranteed)', liq: 'n/a', fit: 'Every ₹ repaid earns exactly this, risk-free', kind: 'debt', real: ((1 + r / 100) / (1 + inf / 100) - 1) * 100, bal: +l.value }); });
    return rows.sort((a, b) => b.post - a.post);
  }
  FOS.ladderRows = ladderRows;
  FOS.tools.growth = function (root) {
    const m = FOS.metrics(), dflt = marginalRate(Math.max(m.income * 12, 0)) || 0;
    root.innerHTML = `<div class="card"><h3>Where each rupee works hardest</h3><p class="muted">Every option ranked by what you actually keep after tax — and what is left after inflation. Debts you owe appear as “guaranteed returns”: repaying a 42% card beats almost everything else. Equity and gold figures are assumptions, not promises (set them in Data &amp; Sources).</p>
      <div class="fields"><div class="field"><label>Your tax slab %<select class="input" id="g-slab">${[0, 5, 10, 15, 20, 25, 30].map((s) => `<option ${s === dflt ? 'selected' : ''}>${s}</option>`).join('')}</select></label></div><div class="field"><label>Monthly amount to place (₹)<input class="input" id="g-amt" type="number" min="0" value="${Math.max(0, Math.round(m.savings / 1000) * 1000) || 10000}"></label></div></div></div><div id="g-out"></div>`;
    const draw = () => {
      const slab = +root.querySelector('#g-slab').value, rows = ladderRows(slab);
      root.querySelector('#g-out').innerHTML = `<div class="card"><div class="table-scroll"><table class="data schemes"><thead><tr><th>Option</th><th>Return % (pre-tax)</th><th>You keep % (post-tax)</th><th>After inflation %</th><th>Risk</th><th>Access</th><th>Best used for</th></tr></thead><tbody>${rows.map((r) => `<tr class="${r.kind === 'debt' ? 'row-debt' : ''}"><th scope="row">${esc(r.n)}${r.kind === 'debt' ? `<br><small class="muted">owed ${inr(r.bal)}</small>` : ''}</th><td>${pc(r.pre, 2)}</td><td><b>${pc(r.post, 2)}</b></td><td>${pc(r.real, 2)}</td><td>${esc(r.risk)}</td><td>${esc(r.liq)}</td><td>${esc(r.fit)}</td></tr>`).join('')}</tbody></table></div><p class="note">* Tax-free subject to the scheme\'s current limits. Risky options can return less than shown, or lose money.</p></div>
        <div class="card"><h3>The order that grows money fastest</h3><ol class="ordered"><li><b>Clear expensive debt first</b> — anything above ~12–15% (cards, instant and personal loans). It is the best risk-free return available.</li><li><b>Build the emergency fund</b> (3–6 months) so you never borrow in a crisis.</li><li><b>Use the tax-free, high-safe-return buckets</b> — EPF/VPF and PPF — as the safe core.</li><li><b>Put long-term money into broad equity index funds</b> (7+ years) for growth above inflation; keep gold ~5–10%.</li><li><b>Use deductions that match what you were going to do anyway</b> (see Tax Optimizer), then raise income and lower costs — they compound too.</li></ol>
        <div class="row-actions"><a class="btn primary" href="#/m/plan">Build my action plan</a><a class="btn" href="#/calc/taxopt">Tax optimizer</a><a class="btn" href="#/calc/sip">SIP calculator</a></div></div>`;
    };
    root.addEventListener('input', draw); root.addEventListener('change', draw); draw();
  };

  /* ---------------- Action plan ---------------- */
  FOS.actionPlan = function () {
    const m = FOS.metrics(), s = store.get(), p = s.profile, B = FOS.FINANCIAL_ASSUMPTIONS.benchmarks, acts = [], age = +p.age || 30, dep = +p.dependents || 0;
    const annual = (+p.annualIncome || m.income * 12), burn = m.essential + m.emi;
    let S0 = Math.max(0, m.savings); const plan = { surplus: S0, phases: [] };
    const A = (n, title, why, href, amount) => acts.push({ n, title, why, href, amount });
    if (!m.income || !m.expenses) { A(1, 'Enter your income and monthly expenses', 'Every number in this plan comes from them. Use the Budget tool or the onboarding wizard (about 5 minutes).', '#/tool/budget'); return { acts, plan, m }; }
    if (m.savings < 0) A(1, `Close the ${inr(-m.savings)} monthly gap first`, `You spend more than you earn. List every expense in the Expense Log, classify needs vs wants, and cut or re-price the three biggest categories until income covers spending. Until then, do not take on new EMIs.`, '#/tool/expenses');
    // debt
    const debts = s.liabilities.filter((l) => +l.value > 0 && liabRate(l) >= 12).sort((a, b) => liabRate(b) - liabRate(a)), dsum = debts.reduce((a, l) => a + +l.value, 0);
    let debtAlloc = 0, efAlloc = 0, invest = 0, efGap = Math.max(0, burn * 6 - m.ef);
    if (S0 > 0) {
      if (dsum > 0) { debtAlloc = Math.min(S0 * (m.efMonths >= 3 ? 0.9 : 0.7), dsum); efAlloc = Math.min(S0 - debtAlloc, efGap); }
      else efAlloc = Math.min(S0 * (m.efMonths >= 6 ? 0 : 0.6), efGap);
      invest = Math.max(0, S0 - debtAlloc - efAlloc);
    }
    if (dsum > 0) {
      const w = debts[0], r = liabRate(w) / 1200, mo = debtAlloc > 0 ? (r > 0 && debtAlloc > dsum * r ? Math.ceil(-Math.log(1 - dsum * r / debtAlloc) / Math.log(1 + r)) : Math.ceil(dsum / debtAlloc)) : NaN;
      A(acts.length + 1, `Pay off expensive debt: ${inr(dsum)} costing up to ${liabRate(w).toFixed(0)}%`, `Put ${inr(debtAlloc)} a month on the highest-rate debt first (${w.name || w.cat}), minimums on the rest, no new card spending. ${Number.isFinite(mo) ? `Clears in about ${fmt.months(mo)}.` : ''} Repaying a ${liabRate(w).toFixed(0)}% debt is a risk-free ${liabRate(w).toFixed(0)}% return — better than any investment on offer.`, '#/calc/debtpayoff', debtAlloc);
    }
    if (efGap > 0) A(acts.length + 1, m.ef ? `Grow your emergency fund to 6 months (${inr(burn * 6)})` : `Start an emergency fund: target ${inr(burn * 6)}`, `You have ${inr(m.ef)} (${Number.isFinite(m.efMonths) ? m.efMonths.toFixed(1) : '0'} months). ${efAlloc > 0 ? `Move ${inr(efAlloc)} a month — about ${fmt.months(Math.ceil(efGap / efAlloc))} to finish.` : 'Direct the next savings here.'} Keep it in a savings account or liquid fund, separate from spending money.`, '#/calc/emergency', efAlloc);
    // insurance
    if (!p.hasHealth) A(acts.length + 1, `Buy health insurance — ${dep || annual > 1500000 ? '₹10 lakh' : '₹5 lakh'} cover as a base`, `Choose a policy with no room-rent cap, low co-pay and a short waiting period for pre-existing conditions; add a super top-up for cheap extra cover. One hospital bill can cost more than your whole emergency fund.`, '#/m/insurance');
    if (dep > 0 && !p.hasTerm) A(acts.length + 1, `Buy term life cover of about ${inr(Math.round(annual * 12 / 1e5) * 1e5)}`, `Roughly 12× annual income is a solid starting point for ${dep} dependant${dep > 1 ? 's' : ''}; refine it in the Life Cover Estimator (loans and assets change it). Pure term only — keep investing separate.`, '#/calc/cover');
    // tax
    const o = { salary: annual, other: 0, basic: annual * 0.4, hra: annual * 0.16, rent: 0, metro: false, d80c: 0, nps: 0, empNps: 0, d80dSelf: 0, d80dPar: 0, parSenior: false, homeInt: 0, eduInt: 0, otherInterest: 0 };
    const tn = taxFor(o, 'new', {});
    A(acts.length + 1, `Tax: your estimated bill is about ${inr(tn)} a year under the new regime`, annual * 1 <= 1275000 ? 'At this income the new-regime rebate makes tax effectively nil — no need to buy products for tax saving. Still file your return.' : 'Run the Tax Optimizer with your real HRA, rent, 80C, NPS and health premiums: it tells you which regime to file under and the exact tax each unused deduction saves. Use deductions only for money you would invest or insure anyway.', '#/calc/taxopt');
    // invest
    const eqPct = Math.max(20, Math.min(80, 100 - age + ([-15, -7, 0, 5, 10][(+p.riskUnderstanding || 3) - 1]))), gold = 10, debtPct = 100 - eqPct - gold, blend = (eqPct * store.assume('equityReturn') + gold * store.assume('goldReturn') + debtPct * store.assume('debtReturn')) / 100;
    plan.alloc = { eq: eqPct, gold, debt: debtPct, blend };
    if (invest > 0 || (dsum === 0 && efGap === 0 && m.savings > 0)) {
      const amt = Math.round(invest / 500) * 500 || Math.round(m.savings / 500) * 500;
      A(acts.length + 1, `Invest ${inr(amt)} a month: ${eqPct}% equity index fund · ${gold}% gold · ${debtPct}% PPF/EPF/debt`, `Split by age ${age} and your risk comfort. Equity: broad-market index fund, direct plan, via SIP — for money you will not touch for 7+ years. Debt: VPF/PPF first (tax-free). Gold: ETF or sovereign gold bonds when available. At an assumed ${blend.toFixed(1)}% blended return this grows to about ${inr(C.sipFV(amt, blend, 120))} in 10 years, ${inr(C.sipFV(amt, blend, 240))} in 20 and ${inr(C.sipFV(amt, blend, 360))} in 30 — assumption, not a promise. Raise the SIP 10% every year.`, '#/calc/sip', amt);
      plan.sip = amt;
    }
    // goals
    const req = s.goals.reduce((a, g) => { const dl = g.deadline ? (new Date(g.deadline) - new Date()) / (365.25 * 864e5) : 0; if (!(+g.target > 0) || dl <= 0) return a; return a + C.requiredMonthly(C.futureCost(+g.target, +g.inflation || 0, dl), +g.current || 0, +g.ret || 0, Math.round(dl * 12)); }, 0);
    if (req > 0) A(acts.length + 1, `Fund your goals: they need ${inr(req)} a month`, req > Math.max(S0, 1) ? `Your surplus (${inr(S0)}) is below this. Either lengthen deadlines, lower targets, or raise income — decide which goal matters most and fund it first.` : 'Your surplus covers it — earmark the money to each goal so it does not leak.', '#/tool/goals', req);
    // earn / save more
    const target = m.income * 0.2, gap = Math.max(0, target - Math.max(0, m.savings));
    if (gap > 0) A(acts.length + 1, `Reach a 20% savings rate: find ${inr(gap)} a month`, `Either cut spending by ${inr(gap)} (start with housing, transport, food), or earn ${inr(gap / 0.8)} more. A side income or skill upgrade is usually the larger lever over 10 years — see the idea finder.`, '#/m/earnmore');
    A(acts.length + 1, 'Protect it: nominees, records, annual review, backup', 'Add nominees everywhere, list policies and accounts in Records, take a net-worth snapshot every quarter, and export a data backup. Put the review date in Reminders.', '#/tool/ladder');
    plan.phases = [['Now', dsum > 0 ? 'Debt ' + inr(debtAlloc) : '', efAlloc > 0 ? 'Emergency fund ' + inr(efAlloc) : '', invest > 0 ? 'Invest ' + inr(invest) : ''].filter(Boolean)];
    return { acts, plan, m };
  };
  FOS.tools.plan = function (root) {
    const { acts, plan, m } = FOS.actionPlan();
    root.innerHTML = `<div class="card"><h3>Your action plan</h3><p class="muted">Built from your numbers, in the order that grows money fastest. Do 1, then 2… Update your data and the plan updates.</p>${m.income ? `<div class="kpis"><div class="kpi"><span>Monthly surplus</span><b>${inr(plan.surplus)}</b></div><div class="kpi"><span>Savings rate</span><b>${pc(m.savingsRate)}</b></div><div class="kpi"><span>Emergency cover</span><b>${Number.isFinite(m.efMonths) ? m.efMonths.toFixed(1) + ' mo' : '—'}</b></div><div class="kpi hi"><span>Net worth</span><b>${inr(m.netWorth)}</b></div></div>` : ''}</div>
      <ol class="plan">${acts.map((a) => `<li><div class="plan-n">${a.n}</div><div class="plan-b"><h4>${esc(a.title)}</h4><p>${esc(a.why)}</p></div><div class="plan-a">${a.amount ? `<b>${inr(a.amount)}</b><small>per month</small>` : ''}<a class="btn sm" href="${a.href}">Open tool</a></div></li>`).join('')}</ol>
      ${plan.alloc ? `<div class="card"><h3>Suggested long-term mix</h3>${ch().donut({ title: 'Allocation', items: [{ name: 'Equity index fund', value: plan.alloc.eq }, { name: 'Gold', value: plan.alloc.gold }, { name: 'PPF / EPF / debt', value: plan.alloc.debt }] })}<p class="note">Rule used: equity ≈ 100 − your age, adjusted for how well you say you understand risk, 10% gold, the rest in safe debt. Rebalance once a year.</p></div>` : ''}
      <div class="row-actions"><a class="btn" href="#/m/growth">Where each ₹ works hardest</a><a class="btn" href="#/m/insights">My Money Review</a><button class="btn" id="pl-print">Print / Save as PDF</button></div>`;
    root.querySelector('#pl-print').onclick = () => window.print();
  };
})();
