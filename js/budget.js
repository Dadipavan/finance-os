/* ==========================================================================
   budget.js — salary, savings rate, subscriptions, budgeting engine,
   everyday-spending engine, purchase analyzer, recurring auditor, CHECK BEFORE I PAY
   ========================================================================== */
(function () {
  'use strict';
  const { F, S, reg } = FOS, C = FOS.calc, fmt = FOS.fmt, U = FOS.ui, ch = () => FOS.charts;
  const esc = U.esc;

  reg({
    id: 'savingsrate', title: 'Savings Rate Calculator', group: 'Budget', module: 'budgeting', tags: 'savings rate income expenses save percent',
    intro: 'What share of your income do you keep?',
    fields: [F.money('inc', 'Monthly income (take-home)', () => Math.round(FOS.metrics().income) || 60000, 1000000, 1000, { lo: 1 }), F.money('exp', 'Monthly expenses (excluding investing)', () => Math.round(FOS.metrics().expenses) || 40000, 1000000, 1000)],
    formula: ['Savings Rate = Savings ÷ Income × 100', 'Savings = Income − Expenses'], vars: ['Includes money you invest or set aside; excludes debt principal unless you count it as saving'], assumptions: ['Different people count EMIs and insurance differently; be consistent'],
    compute(v) { const s = v.inc - v.exp; return { summary: [S('Monthly savings', s, 'inr', true), S('Savings rate', C.savingsRate(s, v.inc), 'pct', true), S('Annual savings', s * 12)], notes: [s < 0 ? 'You are spending more than you earn — the gap is being funded by savings or debt.' : 'Benchmarks like 20% are rules of thumb; what matters is your goals and your stability.'] }; }
  });

  reg({
    id: 'salary', title: 'Salary / CTC Analyzer', group: 'Income', module: 'income', tags: 'salary ctc take home gross basic pf tax deductions in hand paycheck',
    intro: 'From CTC to what reaches your bank account. Tax uses the rules in the central tax configuration (default year), so it updates when the configuration changes.',
    fields: [F.money('ctc', 'Annual CTC', 1200000, 10000000, 50000, { lo: 1 }), F.pct('basic', 'Basic salary as % of CTC', 40, 70, 1), F.pct('epf', 'Employer PF (% of basic)', () => FOS.FINANCIAL_ASSUMPTIONS.salary.employerPfPctOfBasic, 12, 0.5), F.pct('eepf', 'Your PF (% of basic)', () => FOS.FINANCIAL_ASSUMPTIONS.salary.employeePfPctOfBasic, 12, 0.5), F.pct('grat', 'Gratuity (% of basic)', () => FOS.FINANCIAL_ASSUMPTIONS.salary.gratuityPctOfBasic, 6, 0.01), F.money('var', 'Variable pay / bonus inside CTC (yearly)', 100000, 3000000, 10000), F.money('oth', 'Other employer benefits in CTC (yearly: insurance etc.)', 20000, 500000, 1000), F.money('pt', 'Professional tax (monthly)', () => FOS.FINANCIAL_ASSUMPTIONS.salary.professionalTaxMonthly, 500, 10, { hi: 2500 }), F.money('od', 'Other monthly deductions', 0, 50000, 100), F.sel('reg', 'Tax regime', 'new', [['new', 'New regime'], ['old', 'Old regime']]), F.money('ded', 'Old-regime deductions you will claim (80C, 80D etc.)', 150000, 500000, 5000)],
    formula: ['Gross salary = CTC − Employer PF − Gratuity − Other benefits', 'Taxable income = Gross − Standard deduction (− deductions if old regime)', 'Take-home = Gross − Your PF − Income tax − Professional tax − Other deductions'], vars: ['Tax is computed slab-wise from TAX_RULES for the default year, including rebate and cess'], assumptions: ['PF and gratuity assumed inside CTC. Company structures differ widely — check your offer letter', 'Variable pay is treated as paid yearly; monthly figure below shows fixed take-home'],
    compute(v) {
      const yr = FOS.TAX_RULES.years[FOS.TAX_RULES.defaultYear], rg = yr.regimes[v.reg], basic = v.ctc * v.basic / 100, epf = basic * v.epf / 100, grat = basic * v.grat / 100;
      const gross = Math.max(0, v.ctc - epf - grat - v.oth), eepf = basic * v.eepf / 100;
      const taxable = Math.max(0, gross - rg.stdDeduction - (v.reg === 'old' ? v.ded + 0 : 0)), t = C.incomeTax(taxable, rg);
      const takeYr = gross - eepf - t.total - v.pt * 12 - v.od * 12, fixedMonthly = (gross - v.var - eepf - t.total - v.pt * 12 - v.od * 12) / 12;
      return {
        summary: [S('CTC', v.ctc), S('Gross salary', gross), S('Estimated income tax (incl. cess)', t.total), S('Total deductions', gross - takeYr + 0), S('Estimated annual take-home', takeYr, 'inr', true), S('Monthly equivalent', takeYr / 12, 'inr', true), S('Monthly fixed take-home (excluding variable)', fixedMonthly), S('Take-home as % of CTC', takeYr / v.ctc * 100, 'pct')],
        charts: [ch().donut({ title: 'Where CTC goes', items: [{ name: 'Take-home', value: Math.max(0, takeYr) }, { name: 'Income tax', value: t.total }, { name: 'Your PF', value: eepf }, { name: 'Employer PF + gratuity + benefits', value: epf + grat + v.oth }, { name: 'Prof. tax + other', value: (v.pt + v.od) * 12 }] })],
        notes: ['Tax year used: ' + yr.label + ' (' + yr.note + '). Source: ' + yr.source + '.']
      };
    }
  });

  reg({
    id: 'subscription', title: 'Subscription / Recurring Cost', group: 'Budget', module: 'spending', tags: 'subscription recurring ott streaming monthly annual cost',
    intro: 'Small monthly amounts add up. See 1, 5 and 10 year costs.',
    fields: [F.money('amt', 'Amount per billing', 499, 10000, 10, { lo: 1 }), F.sel('freq', 'Billed', 'monthly', [['monthly', 'Monthly'], ['quarterly', 'Quarterly'], ['yearly', 'Yearly'], ['weekly', 'Weekly'], ['daily', 'Daily']]), F.num('n', 'How many such subscriptions', 5, 30, 1, { lo: 1 }), F.pct('inf', 'Yearly price increase', 8, 25, 0.5)],
    formula: ['Monthly = Amount × billings per month × count', 'Year t cost = Annual × (1 + increase)^(t−1)'], vars: [], assumptions: ['Price increases are an assumption'],
    compute(v) { const m = FOS.freqToMonthly(v.amt, v.freq) * v.n, cum = (y) => { let t = 0; for (let i = 0; i < y; i++) t += m * 12 * Math.pow(1 + v.inf / 100, i); return t; }; return { summary: [S('Monthly', m), S('Annual', m * 12, 'inr', true), S('5-year (with increases)', cum(5)), S('10-year (with increases)', cum(10))], html: `<h4>If the same money were invested instead (hypothetical)</h4>` + FOS.oppHTML(0, m) }; }
  });

  /* =========================== BUDGET TOOL =========================== */
  const METHODS = {
    custom: ['Custom budget', 'Create your own categories and amounts.'],
    '50-30-20': ['50 / 30 / 20', '≈50% of income to needs, 30% to wants, 20% to savings & debt reduction. A starting template — adjust for your life.'],
    zero: ['Zero-based', 'Income − every planned rupee = 0. Every rupee gets a job (including savings).'],
    pyf: ['Pay yourself first', 'Set the savings amounts first, as if they were a bill; the rest is for spending.'],
    envelope: ['Envelope method', 'Each category is an envelope. Enter what you have spent; when an envelope is empty, spending stops.']
  };
  FOS.tools.budget = function (root) {
    const store = FOS.store;
    const draw = () => {
      const s = store.get(), b = s.budget, m = METHODS[b.method] || METHODS.custom;
      root.innerHTML = `<div class="card"><div class="grid-2">
        <div><label class="lbl" for="bm">Budgeting method</label><select id="bm" class="input">${Object.entries(METHODS).map(([k, v]) => `<option value="${k}" ${b.method === k ? 'selected' : ''}>${v[0]}</option>`).join('')}</select><p class="muted">${esc(m[1])}</p></div>
        <div><label class="lbl" for="binc">Monthly income (take-home ₹)</label><input id="binc" class="input" type="number" min="0" step="any" inputmode="decimal" value="${esc(b.income)}" placeholder="e.g. 60000"></div></div>
        <div class="row-actions"><button class="btn ghost" id="b-5030">Apply 50/30/20 to my income</button><button class="btn ghost" id="b-ex">Load ₹60,000 example</button><button class="btn ghost" id="b-clear">Clear budget</button></div></div>
        <div class="card"><h3>Categories</h3><div id="bitems"></div></div><div id="bsum"></div>`;
      const sum = () => {
        const s2 = store.get(), bb = s2.budget, inc = +bb.income || 0, it = bb.items, tot = (k) => it.filter((x) => x.kind === k).reduce((a, x) => a + (+x.amount || 0), 0);
        const need = tot('need'), want = tot('want'), save = tot('save'), all = need + want + save, left = inc - all, exp = need + want;
        const kpi = (l, v, sub) => `<div class="kpi"><span>${l}</span><b>${v}</b>${sub ? `<small>${sub}</small>` : ''}</div>`;
        let guide = '';
        const p = (x) => (inc > 0 ? x / inc * 100 : 0);
        if (bb.method === '50-30-20') guide = `<h4>50 / 30 / 20 check</h4>` + [['Needs', need, 50], ['Wants', want, 30], ['Savings & debt reduction', save, 20]].map(([n, v, t]) => `<div class="between"><span>${n}: <b>${fmt.pct(p(v), 0)}</b> <small class="muted">(template ${t}%)</small></span><span>${fmt.inr(v)}</span></div>${ch().progress(p(v) / t * 50, n)}`).join('') + `<p class="note">The template is a starting point, not a rule. High rent cities, EMIs or dependents can legitimately change the shape.</p>`;
        if (bb.method === 'zero') guide = `<h4>Zero-based check</h4><div class="status ${Math.abs(left) < 1 ? 'ok' : left < 0 ? 'bad' : 'warn'}">${Math.abs(left) < 1 ? '✓ Every rupee has a job.' : left < 0 ? `Over-allocated by ${fmt.inr(-left)} — reduce something.` : `${fmt.inr(left)} is still unassigned. Give it a job (saving, buffer, goal).`}</div>`;
        if (bb.method === 'pyf') guide = `<h4>Pay yourself first</h4><p>Savings set aside first: <b>${fmt.inr(save)}</b> (${fmt.pct(p(save), 0)} of income). Left to spend after that: <b>${fmt.inr(inc - save)}</b>; planned spending ${fmt.inr(exp)}.</p>`;
        if (bb.method === 'envelope') guide = `<h4>Envelopes</h4>` + (it.filter((x) => x.kind !== 'save' && +x.amount > 0).map((x) => { const rem = (+x.amount || 0) - (+x.spent || 0); return `<div class="between"><span>${esc(x.name || 'Unnamed')}</span><span class="${rem < 0 ? 'warn-t' : ''}">${rem < 0 ? 'Over by ' + fmt.inr(-rem) : fmt.inr(rem) + ' left'}</span></div>${ch().progress((+x.spent || 0) / x.amount * 100, x.name)}`; }).join('') || '<p class="muted">Add categories with amounts.</p>');
        root.querySelector('#bsum').innerHTML = `<div class="card"><h3>Budget summary</h3><div class="kpis">${kpi('Income', fmt.inr(inc))}${kpi('Total expenses', fmt.inr(exp), 'needs + wants')}${kpi('Allocated to saving', fmt.inr(save))}${kpi('Remaining (unallocated)', fmt.inr(left), left < 0 ? 'over budget' : '')}${kpi('Savings rate', fmt.pct(C.savingsRate(inc - exp, inc), 1), 'income − expenses')}${kpi('Annualised spending', fmt.inr(exp * 12))}</div>
          <div class="grid-2"><div>${ch().donut({ title: 'Budget categories', items: it.map((x) => ({ name: x.name || 'Unnamed', value: +x.amount || 0 })) })}</div><div>${guide}</div></div>
          <h4>Category percentages</h4><div class="table-scroll"><table class="data"><thead><tr><th>Category</th><th>Monthly</th><th>% of income</th><th>Annual</th></tr></thead><tbody>${it.map((x) => `<tr><td>${esc(x.name || 'Unnamed')}</td><td>${fmt.inr(+x.amount || 0)}</td><td>${fmt.pct(p(+x.amount || 0), 1)}</td><td>${fmt.inr((+x.amount || 0) * 12)}</td></tr>`).join('')}</tbody></table></div></div>`;
      };
      FOS.crud(root.querySelector('#bitems'), {
        list: (st) => st.budget.items, addLabel: 'Add category', empty: 'Add rent, food, transport… or load the example.',
        cols: [{ k: 'name', label: 'Category', type: 'text' }, { k: 'kind', label: 'Type', type: 'select', options: [['need', 'Need'], ['want', 'Want'], ['save', 'Saving / investing']] }, { k: 'amount', label: 'Monthly ₹', type: 'money' }, { k: 'spent', label: 'Spent so far ₹', type: 'money', hide: (st) => st.budget.method !== 'envelope' }],
        blank: () => ({ name: '', kind: 'need', amount: '', spent: '' }), onChange: sum
      });
      sum();
      const bm = root.querySelector('#bm'); bm.onchange = () => { store.update((st) => { st.budget.method = bm.value; }); draw(); };
      root.querySelector('#binc').onchange = (e) => { store.update((st) => { st.budget.income = Math.max(0, parseFloat(e.target.value) || 0); }); sum(); };
      const set = (items) => { store.update((st) => { st.budget.items = items.map((i) => Object.assign({ id: store.uid(), spent: '' }, i)); }); draw(); };
      root.querySelector('#b-ex').onclick = () => { store.update((st) => { st.budget.income = 60000; }); set([['Rent', 12000, 'need'], ['Food', 6000, 'need'], ['Transport', 4000, 'need'], ['Utilities', 3000, 'need'], ['Subscriptions', 1000, 'want'], ['Entertainment', 3000, 'want'], ['Investments', 15000, 'save'], ['Emergency Fund', 5000, 'save'], ['Other', 2000, 'want']].map(([name, amount, kind]) => ({ name, amount, kind }))); U.toast('Example loaded — this is an illustration, not advice.'); };
      root.querySelector('#b-5030').onclick = () => { const inc = +store.get().budget.income; if (!(inc > 0)) return U.toast('Enter your monthly income first.'); set([{ name: 'Needs (rent, food, bills, EMIs)', kind: 'need', amount: Math.round(inc * 0.5) }, { name: 'Wants', kind: 'want', amount: Math.round(inc * 0.3) }, { name: 'Savings & debt reduction', kind: 'save', amount: Math.round(inc * 0.2) }]); };
      root.querySelector('#b-clear').onclick = () => { if (confirm('Remove all budget categories?')) set([]); };
    };
    draw();
  };

  /* =========================== SPENDING TOOLS =========================== */
  const PURCHASES = {
    vegetables: ['Vegetables / groceries', [['price', 'Spend per shopping trip', 300], ['times', 'Trips per month', 12], ['alt', 'Cheaper alternative per trip', 250]]],
    coffee: ['Coffee / tea', [['price', 'Price per cup', 200], ['times', 'Cups per month', 30], ['alt', 'Home-made cost per cup', 30]]],
    food: ['Eating out / delivery', [['price', 'Per order (incl. fees)', 450], ['times', 'Orders per month', 12], ['alt', 'Cooking at home per meal', 120]]],
    clothing: ['Clothing', [['price', 'Average spend per purchase', 2500], ['times', 'Purchases per month', 2], ['alt', 'Cheaper alternative', 1500]]],
    travel: ['Travel', [['price', 'Cost per trip (all-in)', 25000], ['times', 'Trips per year ÷ 12 → per month', 0.33], ['alt', 'Cheaper alternative trip', 15000]]],
    phone: ['Phone', [['price', 'Price', 70000], ['mode', 'Payment', 'emi'], ['down', 'Down payment', 10000], ['rate', 'Loan interest % (incl. hidden “no-cost” charges)', 14], ['tenure', 'Tenure (months)', 12], ['life', 'Expected lifespan (years)', 3], ['annual', 'Repair / protection per year', 2000], ['resale', 'Resale / trade-in value at end', 12000], ['onetime', 'Accessories, cover, etc.', 2500], ['alt', 'Alternative phone price', 35000]]],
    laptop: ['Laptop', [['price', 'Price', 90000], ['mode', 'Payment', 'cash'], ['down', 'Down payment', 0], ['rate', 'Loan interest %', 14], ['tenure', 'Tenure (months)', 12], ['life', 'Expected lifespan (years)', 4], ['annual', 'Repair / warranty extension per year', 2000], ['resale', 'Resale value at end', 10000], ['onetime', 'Software, bag, etc.', 5000], ['alt', 'Alternative laptop price', 60000]]],
    tv: ['TV / appliance', [['price', 'Price', 45000], ['mode', 'Payment', 'cash'], ['down', 'Down payment', 0], ['rate', 'Loan interest %', 14], ['tenure', 'Tenure (months)', 12], ['life', 'Lifespan (years)', 8], ['run', 'Extra electricity per month', 150], ['annual', 'Maintenance per year', 500], ['resale', 'Resale value', 3000], ['alt', 'Alternative price', 30000]]],
    furniture: ['Furniture', [['price', 'Price', 60000], ['mode', 'Payment', 'cash'], ['down', 'Down payment', 0], ['rate', 'Loan interest %', 14], ['tenure', 'Tenure (months)', 12], ['life', 'Lifespan (years)', 10], ['onetime', 'Delivery + assembly', 2500], ['resale', 'Resale value', 5000], ['alt', 'Alternative price', 40000]]],
    bike: ['Bike / scooter', [['price', 'On-road price', 110000], ['mode', 'Payment', 'emi'], ['down', 'Down payment', 20000], ['rate', 'Loan interest %', 11], ['tenure', 'Tenure (months)', 36], ['life', 'Years you will use it', 6], ['run', 'Fuel + parking per month', 1800], ['annual', 'Insurance per year', 3500], ['annual2', 'Servicing per year', 4000], ['resale', 'Resale value at end', 35000], ['onetime', 'Registration, taxes, accessories', 15000], ['alt', 'Alternative (e.g. used / public transport cost over life)', 0]]],
    car: ['Car', [['price', 'Purchase price (ex-showroom)', 900000], ['mode', 'Payment', 'emi'], ['down', 'Down payment', 150000], ['rate', 'Loan interest %', () => FOS.store.interest('carLoan')], ['tenure', 'Loan tenure (months)', 60], ['life', 'Years you will use it', 7], ['run', 'Fuel + parking per month', 7000], ['annual', 'Insurance per year', 30000], ['annual2', 'Maintenance per year', 18000], ['resale', 'Resale value at end', 350000], ['onetime', 'Registration, road tax, accessories', 120000], ['alt', 'Alternative: cab/rental cost per month × 12 × years', 0]]],
    house: ['House', [['price', 'Property price', 6000000], ['mode', 'Payment', 'emi'], ['down', 'Down payment', 1200000], ['rate', 'Loan interest %', () => FOS.store.interest('homeLoan')], ['tenure', 'Loan tenure (months)', 240], ['life', 'Years you will hold it', 15], ['run', 'Maintenance + society per month', 3000], ['annual', 'Property tax per year', 10000], ['resale', 'Expected sale value (an assumption)', 9000000], ['onetime', 'Stamp duty, registration, brokerage, interiors', 600000], ['rent', 'Rent you would pay instead (per month)', 20000]]],
    education: ['Education', [['price', 'Course fee', 1500000], ['mode', 'Payment', 'emi'], ['down', 'Paid from savings', 300000], ['rate', 'Education loan interest %', () => FOS.store.interest('educationLoan')], ['tenure', 'Repayment months', 84], ['life', 'Course duration (years)', 2], ['run', 'Living/other cost per month', 20000], ['onetime', 'Application, visa, books', 50000], ['resale', 'Expected extra income (optional, total over period)', 0], ['alt', 'Alternative course fee', 600000]]]
  };
  const resolveD = (d) => (typeof d === 'function' ? d() : d);
  function purchaseTool(root) {
    root.innerHTML = `<div class="card"><h3>Universal purchase analyzer</h3><p class="muted">Pick what you are buying. The questions change to match. The result is the <b>total cost of ownership</b> — not just the price tag.</p>
      <label class="lbl" for="ptype">What are you buying?</label><select id="ptype" class="input">${Object.entries(PURCHASES).map(([k, v]) => `<option value="${k}">${v[0]}</option>`).join('')}</select><div id="pform" class="fields"></div><div id="pres"></div></div>`;
    const form = root.querySelector('#pform');
    const build = () => {
      const t = PURCHASES[root.querySelector('#ptype').value];
      form.innerHTML = t[1].map(([k, l, d]) => k === 'mode' ? `<div class="field"><label>${l}<select data-k="mode" class="input"><option value="cash" ${d === 'cash' ? 'selected' : ''}>Cash / one-time</option><option value="emi" ${d === 'emi' ? 'selected' : ''}>EMI / loan</option></select></label></div>` : `<div class="field"><label>${esc(l)}<input class="input" data-k="${k}" type="number" min="0" step="any" inputmode="decimal" value="${resolveD(d)}"></label></div>`).join('');
      run();
    };
    const run = () => {
      const v = {}; form.querySelectorAll('[data-k]').forEach((e) => { v[e.dataset.k] = e.dataset.k === 'mode' ? e.value : Math.max(0, parseFloat(e.value) || 0); });
      const t = PURCHASES[root.querySelector('#ptype').value], out = root.querySelector('#pres'), kpi = (l, x, hi) => `<div class="kpi ${hi ? 'hi' : ''}"><span>${l}</span><b>${x}</b></div>`;
      if ('times' in v) {
        const m = v.price * v.times, save = (v.price - (v.alt || 0)) * v.times;
        out.innerHTML = `<div class="kpis">${kpi('Per day', fmt.inr(m / 30.4375, 0))}${kpi('Per week', fmt.inr(m * 12 / 52))}${kpi('Per month', fmt.inr(m), 1)}${kpi('Per year', fmt.inr(m * 12), 1)}${kpi('5 years', fmt.inr(m * 60))}${kpi('10 years', fmt.inr(m * 120))}${v.alt ? kpi('Difference vs alternative / year', fmt.inr(save * 12)) : ''}</div><h4>What could the same monthly amount become? (hypothetical)</h4>${FOS.oppHTML(0, m)}`;
        return;
      }
      const emiMode = v.mode === 'emi', loan = emiMode ? Math.max(0, v.price - (v.down || 0)) : 0, n = Math.round(v.tenure || 0), emi = emiMode ? C.emi(loan, v.rate || 0, n) : 0, interest = emiMode ? emi * n - loan : 0;
      const upfront = (emiMode ? Math.min(v.price, v.down || 0) : v.price) + (v.onetime || 0), life = Math.max(0.1, v.life || 1);
      const running = ((v.run || 0) * 12 + (v.annual || 0) + (v.annual2 || 0)) * life, rentSaved = (v.rent || 0) * 12 * life;
      const tco = upfront + emi * n + running - (v.resale || 0), perMonth = tco / (life * 12);
      out.innerHTML = `<div class="kpis">${kpi('Paid upfront', fmt.inr(upfront))}${emiMode ? kpi('EMI', fmt.inr(emi) + ' × ' + n) : ''}${emiMode ? kpi('Interest paid', fmt.inr(interest), 1) : ''}${kpi('Running costs over life', fmt.inr(running))}${kpi('Minus resale / trade-in', fmt.inr(v.resale || 0))}${kpi('Total cost of ownership', fmt.inr(tco), 1)}${kpi('Per month of use', fmt.inr(perMonth), 1)}${kpi('Price tag vs real cost', fmt.pct(v.price > 0 ? tco / v.price * 100 : NaN, 0))}${v.alt ? kpi('Price difference vs alternative', fmt.inr(v.price - v.alt)) : ''}${v.rent ? kpi('Rent you would pay over same period', fmt.inr(rentSaved)) : ''}</div>
        <h4>Opportunity cost of the upfront money (hypothetical)</h4>${FOS.oppHTML(upfront, 0)}${emiMode ? `<p class="note">Your EMIs (${fmt.inr(emi)} × ${n}) could also have been invested instead: at a hypothetical 10% that is ≈ ${fmt.inr(C.sipFV(emi, 10, n))} after ${n} months.</p>` : ''}
        <p class="note"><b>Also ask:</b> warranty terms, return policy, hidden fees, insurance, resale value. Taxes/duties are included only if you entered them.</p>`;
    };
    root.querySelector('#ptype').onchange = build; form.oninput = run; build();
  }

  function spendTool(root) {
    root.innerHTML = `<div class="card"><h3>BEFORE I SPEND MONEY</h3><p class="muted">Tell me what you are about to spend on and how often. I will show what it really adds up to.</p>
      <div class="fields">
        <div class="field"><label>Item<input class="input" id="s-item" type="text" maxlength="60" value="Coffee"></label></div>
        <div class="field"><label>Price (₹)<input class="input" id="s-price" type="number" min="0" step="any" inputmode="decimal" value="200"></label></div>
        <div class="field"><label>How often<select class="input" id="s-freq"><option value="daily" selected>Daily</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="yearly">Yearly</option><option value="once">One time</option></select></label></div>
        <div class="field"><label>Purpose<input class="input" id="s-purpose" type="text" maxlength="80" placeholder="Why am I buying this?"></label></div>
        <div class="field"><label>Need or want<select class="input" id="s-nw"><option>Need</option><option selected>Want</option><option>Habit</option></select></label></div>
        <div class="field"><label>Payment method<select class="input" id="s-pay"><option>UPI / cash</option><option>Debit card</option><option>Credit card (paid in full)</option><option>Credit card (may carry balance)</option><option>EMI</option></select></label></div>
      </div><div id="s-out"></div></div>`;
    const run = () => {
      const price = Math.max(0, parseFloat(root.querySelector('#s-price').value) || 0), f = root.querySelector('#s-freq').value, out = root.querySelector('#s-out'), item = root.querySelector('#s-item').value;
      if (U.looksSensitive(item + root.querySelector('#s-purpose').value)) { out.innerHTML = `<p class="warn-t">${U.SENSITIVE_MSG}</p>`; return; }
      const monthly = f === 'once' ? 0 : FOS.freqToMonthly(price, f), daily = f === 'once' ? 0 : monthly * 12 / 365.25, kpi = (l, x, hi) => `<div class="kpi ${hi ? 'hi' : ''}"><span>${l}</span><b>${x}</b></div>`;
      const pay = root.querySelector('#s-pay').value, m = FOS.metrics();
      out.innerHTML = f === 'once' ? `<div class="kpis">${kpi('One-time cost', fmt.inr(price), 1)}${m.income > 0 ? kpi('As % of monthly income', fmt.pct(price / m.income * 100, 1)) : ''}</div><h4>What could this amount become? (hypothetical)</h4>${FOS.oppHTML(price, 0)}` :
        `<div class="kpis">${kpi('Daily', fmt.inr(daily, 0))}${kpi('Weekly', fmt.inr(monthly * 12 / 52))}${kpi('Monthly', fmt.inr(monthly), 1)}${kpi('Annual', fmt.inr(monthly * 12), 1)}${kpi('5 years', fmt.inr(monthly * 60))}${kpi('10 years', fmt.inr(monthly * 120))}${m.income > 0 ? kpi('Share of monthly income', fmt.pct(monthly / m.income * 100, 1)) : ''}</div><h4>What could the same amount become under different hypothetical assumptions?</h4>${FOS.oppHTML(0, monthly)}`;
      if (/may carry|EMI/.test(pay)) out.innerHTML += `<p class="note warn">Paying by “${esc(pay)}” can add interest (credit-card APR is often ~36–45%). Check total cost before you commit.</p>`;
      if (f !== 'once') out.innerHTML += `<div class="row-actions"><button class="btn" id="s-add">Add to my recurring-expense auditor</button></div>`;
    };
    root.oninput = run; root.onchange = run; run();
    root.onclick = (e) => { if (e.target.id === 's-add') { const price = parseFloat(root.querySelector('#s-price').value) || 0; FOS.store.update((s) => s.recurring.push({ id: FOS.store.uid(), name: root.querySelector('#s-item').value || 'Expense', cat: 'Other', amount: price, freq: root.querySelector('#s-freq').value, renew: '' })); U.toast('Added to the recurring-expense auditor.'); } };
  }

  function recurringTool(root) {
    const cats = ['OTT / streaming', 'Apps', 'Cloud storage', 'Gym / fitness', 'Software', 'Memberships', 'Insurance', 'Subscription', 'Other'];
    root.innerHTML = `<div class="card"><h3>Recurring expense auditor</h3><p class="muted">List everything that bills you repeatedly. Review it every few months — cancel what you no longer use.</p><div id="rec-list"></div></div>`;
    FOS.crud(root.querySelector('#rec-list'), {
      list: (s) => s.recurring, addLabel: 'Add recurring expense', empty: 'Add Netflix, gym, cloud storage, insurance…',
      cols: [{ k: 'name', label: 'Name', type: 'text' }, { k: 'cat', label: 'Category', type: 'select', options: cats }, { k: 'amount', label: 'Amount ₹', type: 'money' }, { k: 'freq', label: 'Billed', type: 'select', options: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly'] }, { k: 'renew', label: 'Next renewal', type: 'date' }],
      blank: () => ({ name: '', cat: 'Subscription', amount: '', freq: 'monthly', renew: '' }),
      computed: { label: 'Monthly / Annual / 5-yr / 10-yr', fn: (r) => { const m = FOS.freqToMonthly(r.amount, r.freq); return `${fmt.inr(m)} · ${fmt.inr(m * 12)} · ${fmt.inr(m * 60)} · ${fmt.inr(m * 120)}`; } },
      footer: (items) => { const m = items.reduce((a, r) => a + FOS.freqToMonthly(r.amount, r.freq), 0); return `<div class="kpis"><div class="kpi hi"><span>Total per month</span><b>${fmt.inr(m)}</b></div><div class="kpi"><span>Per year</span><b>${fmt.inr(m * 12)}</b></div><div class="kpi"><span>5 years</span><b>${fmt.inr(m * 60)}</b></div><div class="kpi"><span>10 years</span><b>${fmt.inr(m * 120)}</b></div></div>`; }
    });
  }
  FOS.tools.recurring = recurringTool;
  FOS.tools.purchase = purchaseTool;
  FOS.tools.spending = function (root) {
    FOS.tabs(root, [{ label: 'Before I spend', render: spendTool }, { label: 'Purchase analyzer', render: purchaseTool }, { label: 'Recurring expenses', render: recurringTool }]);
  };

  /* =========================== CHECK BEFORE I PAY =========================== */
  FOS.payModal = function () {
    const html = `<p class="muted">Quick check — nothing is stored. Takes under a minute.</p><div class="fields">
      <div class="field"><label>What are you buying?<input class="input" id="p-what" type="text" maxlength="60" placeholder="e.g. Phone"></label></div>
      <div class="field"><label>Price (₹)<input class="input" id="p-price" type="number" min="0" step="any" inputmode="decimal" value="0"></label></div>
      <div class="field"><label>Recurring cost per month (₹)<input class="input" id="p-rec" type="number" inputmode="decimal" min="0" step="any" value="0"></label></div>
      <div class="field"><label>Hidden / extra fees (₹)<input class="input" id="p-fee" type="number" inputmode="decimal" min="0" step="any" value="0"></label></div>
      <div class="field"><label>Cash or EMI?<select class="input" id="p-mode"><option value="cash">Cash / one-time</option><option value="emi">EMI</option></select></label></div>
      <div class="field emi-only" hidden><label>EMI interest % per year<input class="input" id="p-rate" type="number" inputmode="decimal" min="0" step="any" value="14"></label></div>
      <div class="field emi-only" hidden><label>EMI months<input class="input" id="p-ten" type="number" inputmode="decimal" min="1" step="1" value="12"></label></div>
      <div class="field"><label>Need or want?<select class="input" id="p-nw"><option>Need</option><option selected>Want</option></select></label></div>
      <div class="field"><label>Alternative price (₹, optional)<input class="input" id="p-alt" type="number" inputmode="decimal" min="0" step="any" value="0"></label></div>
      <div class="field"><label>Return policy<select class="input" id="p-ret"><option>Unknown</option><option>No returns</option><option>7 days</option><option>30 days</option></select></label></div>
      <div class="field"><label>Warranty<select class="input" id="p-war"><option>Unknown</option><option>None</option><option>Up to 1 year</option><option>More than 1 year</option></select></label></div></div><div id="p-out"></div>`;
    const box = U.modal('CHECK BEFORE I PAY', html, { wide: true });
    const g = (id) => box.querySelector('#' + id), n = (id) => Math.max(0, parseFloat(g(id).value) || 0);
    const run = () => {
      const emi = g('p-mode').value === 'emi'; box.querySelectorAll('.emi-only').forEach((e) => { e.hidden = !emi; });
      const price = n('p-price'), fee = n('p-fee'), rec = n('p-rec'), months = Math.round(n('p-ten')) || 1, e = emi ? C.emi(price, n('p-rate'), months) : 0, interest = emi ? e * months - price : 0, m = FOS.metrics();
      const total = price + fee + interest, first = total + rec * 12, kp = (l, x, hi) => `<div class="kpi ${hi ? 'hi' : ''}"><span>${l}</span><b>${x}</b></div>`;
      const warn = [];
      if (g('p-ret').value === 'No returns' || g('p-ret').value === 'Unknown') warn.push('Return policy is ' + g('p-ret').value.toLowerCase() + ' — you may not be able to undo this.');
      if (g('p-war').value === 'None' || g('p-war').value === 'Unknown') warn.push('Warranty is ' + g('p-war').value.toLowerCase() + ' — repairs would be at your cost.');
      if (emi) warn.push(`EMI adds ${fmt.inr(interest)} of interest on top of the price. “No-cost EMI” usually hides this in a discount you lose or a fee.`);
      if (m.liquid > 0 && total > m.liquid * 0.25) warn.push(`This is ${fmt.pct(total / m.liquid * 100, 0)} of your liquid savings.`);
      if (m.income > 0 && total > m.income) warn.push('This is more than one month of your income.');
      g('p-out').innerHTML = `<div class="kpis">${kp('Total cost', fmt.inr(total), 1)}${kp('First-year cost (with recurring)', fmt.inr(first))}${kp('Interest', fmt.inr(interest))}${kp('Fees', fmt.inr(fee))}${g('p-alt').value > 0 ? kp('Alternative saves', fmt.inr(total - n('p-alt'))) : ''}</div>
        <h4>Opportunity cost — the same money invested (hypothetical)</h4>${FOS.oppHTML(price + fee, rec)}
        ${warn.length ? `<ul class="warnlist">${warn.map((w) => `<li>${esc(w)}</li>`).join('')}</ul>` : ''}
        <p class="note">${g('p-nw').value === 'Want' ? 'You marked this as a want. A common habit: wait 24–72 hours, then decide.' : 'Marked as a need — compare at least two options.'} This is not advice — the decision is yours.</p>
        <div class="row-actions"><a class="btn" href="#/tool/decision" data-close-modal>Open the full Decision Engine</a></div>`;
    };
    box.oninput = run; box.onchange = run; box.onclick = (e) => { if (e.target.hasAttribute('data-close-modal')) U.closeModal(); }; run();
  };

  /* =========================== BEFORE YOU SIGN =========================== */
  FOS.signModal = function () {
    const keys = Object.keys(FOS.CHECKLISTS).filter((k) => k.startsWith('sign-'));
    const box = U.modal('BEFORE YOU SIGN', `<p class="muted">Pick what you are about to sign and tick each point only when you have the answer in writing.</p><label class="lbl" for="sg">Document</label><select id="sg" class="input">${keys.map((k) => `<option value="${k}">${esc(FOS.CHECKLISTS[k].title.replace('Before you sign — ', ''))}</option>`).join('')}<option value="contract">Contract (general)</option></select><div id="sg-list"></div>`, { wide: true });
    const draw = () => FOS.renderChecklist(box.querySelector('#sg-list'), box.querySelector('#sg').value);
    box.querySelector('#sg').onchange = draw; draw();
  };
})();
