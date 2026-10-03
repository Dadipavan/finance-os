/* ==========================================================================
   dashboard.js — Money Dashboard, snapshot, onboarding, net worth, health, reports
   ========================================================================== */
(function () {
  'use strict';
  const C = FOS.calc, fmt = FOS.fmt, U = FOS.ui, esc = U.esc, ch = () => FOS.charts, store = FOS.store;
  const ASSET_CATS = ['Cash', 'Bank', 'FD', 'RD', 'Investments', 'Gold', 'Property', 'Vehicle', 'Emergency Fund', 'Other'];
  const LIAB_CATS = ['Credit card', 'Personal loan', 'Vehicle loan', 'Home loan', 'Education loan', 'Other'];
  const SAFETY = '🔒 Never enter Aadhaar, PAN, bank account or card numbers, passwords, OTPs, PINs or CVVs. Your data stays in this browser.';
  const n = (x) => (Number.isFinite(+x) ? +x : 0);
  const kpi = (label, val, sub, o = {}) => `<div class="kpi ${o.hi ? 'hi' : ''}"><span>${label}${o.tip ? U.tip(o.tip) : ''}</span><b ${o.num !== undefined ? `data-n="${Number.isFinite(o.num) ? o.num : ''}" data-f="${o.f || 'inr'}"` : ''}>${val}</b>${sub ? `<small>${sub}</small>` : ''}</div>`;
  const fm = { inr: (v) => fmt.inr(v), pct: (v) => fmt.pct(v, 1), months: (v) => fmt.months(v) };
  function animateKpis(root) { U.$$('[data-n]', root).forEach((el) => { if (el.dataset.n === '') { el.textContent = '—'; return; } const to = +el.dataset.n, f = fm[el.dataset.f] || fm.inr; if (!Number.isFinite(to)) { el.textContent = '—'; return; } el.dataset.val = 0; U.animate(el, to, f); }); }

  /* ---------- snapshot ---------- */
  function snapshotHTML(m) {
    return `<div class="kpis">${kpi('Income (monthly)', fmt.inr(m.income), '', { num: m.income })}${kpi('Expenses (monthly)', fmt.inr(m.expenses), '', { num: m.expenses })}${kpi('Savings (monthly)', fmt.inr(m.savings), 'income − expenses', { num: m.savings })}${kpi('Savings rate', fmt.pct(m.savingsRate, 1), 'savings ÷ income', { num: m.savingsRate, f: 'pct' })}${kpi('Debt (total)', fmt.inr(m.liabilities), '', { num: m.liabilities })}${kpi('Debt-to-income', fmt.pct(m.dti, 1), 'EMIs ÷ income', { num: m.dti, f: 'pct' })}${kpi('Emergency fund', fmt.inr(m.ef), Number.isFinite(m.efMonths) ? fmt.months(m.efMonths) + ' of essentials' : '', { num: m.ef })}${kpi('Investments', fmt.inr(m.investments), '', { num: m.investments })}${kpi('Net worth', fmt.inr(m.netWorth), 'assets − liabilities', { num: m.netWorth, hi: true })}${kpi('Goals', store.get().goals.length + '', 'tracked')}</div>`;
  }
  FOS.tools.snapshot = (root) => { root.innerHTML = `<div class="card"><h3>MY FINANCIAL SNAPSHOT</h3>${snapshotHTML(FOS.metrics())}</div>`; animateKpis(root); };

  /* ---------- dashboard ---------- */
  function upcoming(days) {
    const now = new Date(); now.setHours(0, 0, 0, 0); const lim = new Date(now.getTime() + days * 864e5), out = [];
    store.get().reminders.forEach((r) => { let d = r.date ? new Date(r.date) : null; if (!d || isNaN(d)) return; const step = { monthly: 1, quarterly: 3, yearly: 12 }[r.freq]; while (step && d < now) d = new Date(d.getFullYear(), d.getMonth() + step, d.getDate()); if (d >= now && d <= lim) out.push({ name: r.title, date: d, amt: r.amount }); });
    store.get().recurring.forEach((r) => { if (!r.renew) return; const d = new Date(r.renew); if (d >= now && d <= lim) out.push({ name: r.name + ' (renewal)', date: d, amt: r.amount }); });
    return out.sort((a, b) => a.date - b.date);
  }
  FOS.upcoming = upcoming;
  FOS.tools.dashboard = function (root) {
    const s = store.get(), m = FOS.metrics(), empty = !m.income && !s.assets.length && !s.liabilities.length && !s.goals.length;
    const up = upcoming(30), by = (arr) => Object.entries(arr.reduce((a, x) => { a[x.cat] = (a[x.cat] || 0) + n(x.value); return a; }, {})).map(([name, value]) => ({ name, value }));
    const snaps = [...s.snapshots].sort((a, b) => a.date.localeCompare(b.date));
    root.innerHTML = `${empty ? `<div class="card hero-empty"><h3>Welcome. Your dashboard is empty — and that\'s fine.</h3><p>Answer a few optional questions, add a budget, or explore a sample to see how it works.</p><div class="row-actions"><button class="btn primary" data-act="onboard">START MY FINANCIAL JOURNEY</button><button class="btn" data-act="sample">Load sample data</button><a class="btn ghost" href="#/tool/budget">Create a budget</a></div></div>` : ''}
      <div class="kpis big">${kpi('Monthly income', fmt.inr(m.income), '', { num: m.income })}${kpi('Monthly expenses', fmt.inr(m.expenses), '', { num: m.expenses })}${kpi('Monthly savings', fmt.inr(m.savings), '', { num: m.savings })}${kpi('Savings rate', fmt.pct(m.savingsRate, 1), '', { num: m.savingsRate, f: 'pct', tip: 'Savings ÷ Income × 100' })}${kpi('Total assets', fmt.inr(m.assets), '', { num: m.assets })}${kpi('Total liabilities', fmt.inr(m.liabilities), '', { num: m.liabilities })}${kpi('Net worth', fmt.inr(m.netWorth), 'assets − liabilities', { num: m.netWorth, hi: true })}${kpi('Emergency fund', fmt.inr(m.ef), Number.isFinite(m.efMonths) ? `${fmt.months(m.efMonths)} of essentials` : 'add essentials in Budget', { num: m.ef })}${kpi('Total investments', fmt.inr(m.investments), '', { num: m.investments })}${kpi('Total debt', fmt.inr(m.liabilities), m.emi ? `EMIs ${fmt.inr(m.emi)}/mo` : '', { num: m.liabilities })}${kpi('Recurring expenses', fmt.inr(m.recurringMonthly), 'per month', { num: m.recurringMonthly })}${kpi('Upcoming (30 days)', up.length + '', up[0] ? esc(up[0].name) + ' · ' + fmt.date(up[0].date) : 'nothing due')}</div>
      <div class="grid-2">
        <div class="card"><h3>Income vs expenses</h3>${ch().bar({ title: 'Income vs expenses', cats: ['Income', 'Expenses', 'Savings'], series: [{ name: 'Monthly', data: [m.income, m.expenses, Math.max(0, m.savings)], color: ch().PALETTE[0] }], yfmt: 'inr' })}</div>
        <div class="card"><h3>Asset allocation</h3>${ch().donut({ title: 'Assets', items: by(s.assets) })}</div>
        <div class="card"><h3>Liability breakdown</h3>${ch().donut({ title: 'Liabilities', items: by(s.liabilities) })}</div>
        <div class="card"><h3>Goal progress</h3>${m.goalProgress.length ? m.goalProgress.map((g) => `<div class="between"><span>${esc(g.name || 'Goal')}</span><b>${fmt.pct(g.pct, 0)}</b></div>${ch().progress(g.pct, g.name)}`).join('') : '<p class="muted">No goals yet. <a href="#/tool/goals">Create one</a>.</p>'}</div>
        <div class="card"><h3>Net worth timeline</h3>${snaps.length > 1 ? ch().line({ title: 'Net worth', xLabel: '', yfmt: 'inr', area: true, xfmt: (x) => (snaps[Math.round(x)] || {}).date || '', series: [{ name: 'Net worth', data: snaps.map((p, i) => ({ x: i, y: p.nw })) }] }) : '<p class="muted">Save monthly snapshots to see your timeline. One is saved by the button below.</p>'}<div class="row-actions"><button class="btn" data-act="snap">Save this month\'s snapshot</button></div></div>
        <div class="card"><h3>Savings trend</h3>${snaps.length > 1 ? ch().line({ title: 'Monthly savings', xfmt: (x) => (snaps[Math.round(x)] || {}).date || '', yfmt: 'inr', series: [{ name: 'Monthly savings', data: snaps.map((p, i) => ({ x: i, y: p.savings })) }] }) : '<p class="muted">Appears after two or more snapshots.</p>'}</div>
      </div>
      <div class="card"><h3>Upcoming payments</h3>${up.length ? `<ul class="plain">${up.map((u) => `<li><b>${fmt.date(u.date)}</b> — ${esc(u.name)} ${u.amt ? '· ' + fmt.inr(+u.amt) : ''}</li>`).join('')}</ul>` : '<p class="muted">Add due dates in <a href="#/tool/reminders">Reminders</a>.</p>'}</div>
      ${!(s.meta && s.meta.lastExport) ? '<div class="card"><p class="status warn">Your data is stored only in this browser. <a href="#/settings">Export a backup</a> now and then so you can restore it anywhere.</p></div>' : ''}
      <div class="card quote"><p>You don't need to become a financial expert overnight. You need to understand the important numbers before making important decisions.</p></div>
      <p class="safety">${SAFETY}</p>`;
    animateKpis(root);
    root.onclick = (e) => { const a = e.target.closest('[data-act]'); if (!a) return; if (a.dataset.act === 'onboard') FOS.onboarding(); if (a.dataset.act === 'sample') FOS.loadSample(); if (a.dataset.act === 'snap') { FOS.saveSnapshot(); FOS.route(); } };
  };

  FOS.saveSnapshot = function (monthKey) {
    const m = FOS.metrics(), d = typeof monthKey === 'string' ? monthKey : new Date().toISOString().slice(0, 7), row = FOS.statement ? FOS.statement(d, d).months[0] : null;
    store.update((s) => { const rec = { date: d, assets: m.assets, liabilities: m.liabilities, nw: m.netWorth, income: row ? row.income : m.income, expenses: row ? row.expenses : m.expenses, savings: row ? row.savings : m.savings }; const i = s.snapshots.findIndex((x) => x.date === d); if (i >= 0) s.snapshots[i] = rec; else s.snapshots.push(rec); });
    U.toast('Snapshot saved for ' + d);
  };

  FOS.loadSample = function () {
    if (!confirm('Load a sample profile? This replaces your current data in this browser (export first if unsure).')) return;
    const u = store.uid, now = new Date();
    store.update((s) => {
      Object.assign(s.profile, { age: 28, monthlyIncome: 60000, annualIncome: 720000, monthlyExpenses: 40000, dependents: 0, retAge: 60, hasHealth: true, healthCover: 500000, hasTerm: false, onboarded: true });
      s.budget = { method: '50-30-20', income: 60000, items: [['Rent', 12000, 'need'], ['Food', 6000, 'need'], ['Transport', 4000, 'need'], ['Utilities', 3000, 'need'], ['Subscriptions', 1000, 'want'], ['Entertainment', 3000, 'want'], ['Investments', 15000, 'save'], ['Emergency Fund', 5000, 'save'], ['Other', 2000, 'want']].map(([name, amount, kind]) => ({ id: u(), name, amount, kind, spent: '' })) };
      s.assets = [['Savings account', 'Bank', 80000], ['Emergency fund', 'Emergency Fund', 50000], ['Fixed deposit', 'FD', 100000], ['Index fund SIP', 'Investments', 180000], ['Phone / laptop', 'Other', 40000]].map(([name, cat, value]) => ({ id: u(), name, cat, value }));
      s.liabilities = [{ id: u(), name: 'Credit card dues', cat: 'Credit card', value: 20000, emi: 0 }, { id: u(), name: 'Personal loan', cat: 'Personal loan', value: 150000, emi: 5000 }];
      s.goals = [{ id: u(), name: 'Emergency fund', type: 'Emergency Fund', target: 240000, current: 0, deadline: '', inflation: 5, ret: 6 }, { id: u(), name: 'Laptop', type: 'Laptop', target: 90000, current: 30000, deadline: new Date(now.getFullYear() + 1, now.getMonth(), 1).toISOString().slice(0, 10), inflation: 5, ret: 6 }];
      s.recurring = [['Streaming', 'OTT / streaming', 499, 'monthly'], ['Gym', 'Gym / fitness', 1500, 'monthly'], ['Cloud storage', 'Cloud storage', 1300, 'yearly']].map(([name, cat, amount, freq]) => ({ id: u(), name, cat, amount, freq, renew: '' }));
      s.reminders = [{ id: u(), title: 'Credit card due', date: new Date(now.getFullYear(), now.getMonth(), Math.min(28, now.getDate() + 5)).toISOString().slice(0, 10), freq: 'monthly', amount: 20000, note: '' }];
      s.snapshots = Array.from({ length: 6 }, (_, i) => { const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1); const nw = 300000 + i * 28000; return { date: d.toISOString().slice(0, 7), assets: nw + 170000, liabilities: 170000, nw, income: 60000, expenses: 40000 + (i % 2) * 1500, savings: 20000 - (i % 2) * 1500 }; });
    });
    U.toast('Sample data loaded — these are illustrative numbers.'); FOS.route();
  };

  /* ---------- onboarding ---------- */
  FOS.onboarding = function () {
    const p = Object.assign({}, store.get().profile); let step = 0;
    const steps = [
      ['About you', `<div class="fields"><div class="field"><label>Age<input class="input" data-p="age" type="number" min="0" max="110" value="${esc(p.age)}"></label></div><div class="field"><label>Dependents (people who rely on your income)<input class="input" data-p="dependents" type="number" min="0" value="${esc(p.dependents)}"></label></div><div class="field"><label>Target retirement age<input class="input" data-p="retAge" type="number" min="30" max="80" value="${esc(p.retAge)}"></label></div><div class="field"><label>How well do you understand investment risk?<select class="input" data-p="riskUnderstanding">${['Not at all', 'A little', 'Somewhat', 'Fairly well', 'Very well'].map((t, i) => `<option value="${i + 1}" ${+p.riskUnderstanding === i + 1 ? 'selected' : ''}>${t}</option>`).join('')}</select></label></div></div>`],
      ['Income & spending', `<div class="fields"><div class="field"><label>Monthly income, take-home (₹)<input class="input" data-p="monthlyIncome" type="number" min="0" value="${esc(p.monthlyIncome)}"></label></div><div class="field"><label>Annual income (₹) — optional<input class="input" data-p="annualIncome" type="number" min="0" value="${esc(p.annualIncome)}"></label></div><div class="field"><label>Monthly expenses (₹)<input class="input" data-p="monthlyExpenses" type="number" min="0" value="${esc(p.monthlyExpenses)}"></label></div></div>`],
      ['Savings & debts', `<div class="fields"><div class="field"><label>Savings in bank/cash (₹)<input class="input" data-p="savings" type="number" min="0" value="${esc(p.savings)}"></label></div><div class="field"><label>Investments (₹)<input class="input" data-p="investments" type="number" min="0" value="${esc(p.investments)}"></label></div><div class="field"><label>Loans outstanding (₹)<input class="input" data-p="loans" type="number" min="0" value="${esc(p.loans)}"></label></div><div class="field"><label>Total monthly EMIs (₹)<input class="input" data-p="emi" type="number" min="0" value="${esc(p.emi || '')}"></label></div><div class="field"><label>Credit-card dues (₹)<input class="input" data-p="cards" type="number" min="0" value="${esc(p.cards)}"></label></div></div>`],
      ['Protection & goals', `<div class="fields"><div class="field"><label class="check"><input type="checkbox" data-p="hasHealth" ${p.hasHealth ? 'checked' : ''}> I have health insurance</label></div><div class="field"><label>Health cover (₹)<input class="input" data-p="healthCover" type="number" min="0" value="${esc(p.healthCover)}"></label></div><div class="field"><label class="check"><input type="checkbox" data-p="hasTerm" ${p.hasTerm ? 'checked' : ''}> I have term life insurance</label></div><div class="field"><label>Term cover (₹)<input class="input" data-p="termCover" type="number" min="0" value="${esc(p.termCover)}"></label></div></div><fieldset><legend>Goals I am thinking about</legend><div class="chips">${['Emergency Fund', 'Laptop', 'Phone', 'Bike', 'Car', 'House', 'Education', 'Travel', 'Marriage', 'Children', 'Retirement', 'Financial Independence'].map((g) => `<label class="chip check"><input type="checkbox" data-goal="${g}" ${p.goalsInterest.includes(g) ? 'checked' : ''}> ${g}</label>`).join('')}</div></fieldset>`]
    ];
    const box = U.modal('Build my financial snapshot', '', { wide: true });
    const body = box.querySelector('.modal-body');
    const collect = () => { U.$$('[data-p]', body).forEach((e) => { p[e.dataset.p] = e.type === 'checkbox' ? e.checked : e.value === '' ? '' : (isNaN(+e.value) ? e.value : Math.max(0, +e.value)); }); const g = U.$$('[data-goal]', body); if (g.length) p.goalsInterest = g.filter((e) => e.checked).map((e) => e.dataset.goal); };
    const draw = () => {
      body.innerHTML = `<div class="steps">${steps.map((s, i) => `<span class="${i === step ? 'on' : i < step ? 'done' : ''}">${i + 1}</span>`).join('')}</div><h3>${steps[step][0]}</h3><p class="muted">Everything is optional. Skip anything you prefer not to share — it never leaves this device.</p><div class="safety">${SAFETY}</div>${steps[step][1]}<div class="row-actions">${step > 0 ? '<button class="btn ghost" data-nav="-1">Back</button>' : ''}<button class="btn primary" data-nav="1">${step === steps.length - 1 ? 'Create my snapshot' : 'Next'}</button></div>`;
    };
    body.onclick = (e) => {
      const b = e.target.closest('[data-nav]'); if (!b) return; collect(); step += +b.dataset.nav;
      if (step >= steps.length) {
        store.update((s) => {
          Object.assign(s.profile, p, { onboarded: true });
          if (!(+s.profile.annualIncome) && +s.profile.monthlyIncome) s.profile.annualIncome = s.profile.monthlyIncome * 12;
          if (!(+s.profile.monthlyIncome) && +s.profile.annualIncome) s.profile.monthlyIncome = Math.round(s.profile.annualIncome / 12);
          s.assets = s.assets.filter((a) => a.src !== 'onboarding'); s.liabilities = s.liabilities.filter((a) => a.src !== 'onboarding');
          if (+p.savings) s.assets.push({ id: store.uid(), name: 'Savings (onboarding)', cat: 'Bank', value: +p.savings, src: 'onboarding' });
          if (+p.investments) s.assets.push({ id: store.uid(), name: 'Investments (onboarding)', cat: 'Investments', value: +p.investments, src: 'onboarding' });
          if (+p.loans) s.liabilities.push({ id: store.uid(), name: 'Loans (onboarding)', cat: 'Personal loan', value: +p.loans, emi: +p.emi || 0, src: 'onboarding' });
          if (+p.cards) s.liabilities.push({ id: store.uid(), name: 'Credit-card dues (onboarding)', cat: 'Credit card', value: +p.cards, emi: 0, src: 'onboarding' });
        });
        U.closeModal(); U.toast('Snapshot created'); location.hash = '#/tool/snapshot'; FOS.route(); return;
      }
      step = Math.max(0, step); draw();
    };
    draw();
  };

  /* ---------- net worth tracker ---------- */
  FOS.tools.networth = function (root) {
    root.innerHTML = `<div class="card"><h3>Net Worth = Total Assets − Total Liabilities</h3><div id="nw-kpis"></div><div class="grid-2"><div><h4>Assets</h4><div id="nw-a"></div></div><div><h4>Liabilities</h4><div id="nw-l"></div></div></div></div><div class="card"><h3>Monthly snapshots &amp; timeline</h3><div class="row-actions"><button class="btn primary" id="nw-snap">Save this month\'s snapshot</button></div><div id="nw-tl"></div></div>`;
    const draw = () => {
      const m = FOS.metrics(), s = store.get(), snaps = [...s.snapshots].sort((a, b) => a.date.localeCompare(b.date));
      root.querySelector('#nw-kpis').innerHTML = `<div class="kpis">${kpi('Total assets', fmt.inr(m.assets))}${kpi('Total liabilities', fmt.inr(m.liabilities))}${kpi('Net worth', fmt.inr(m.netWorth), '', { hi: true })}</div>`;
      root.querySelector('#nw-tl').innerHTML = (snaps.length > 1 ? ch().line({ title: 'Net worth over time', xfmt: (x) => (snaps[Math.round(x)] || {}).date || '', yfmt: 'inr', area: true, series: [{ name: 'Net worth', data: snaps.map((p, i) => ({ x: i, y: p.nw })) }, { name: 'Assets', data: snaps.map((p, i) => ({ x: i, y: p.assets })), dash: true }, { name: 'Liabilities', data: snaps.map((p, i) => ({ x: i, y: p.liabilities })), dash: true }] }) : '<p class="muted">Save at least two monthly snapshots to see the timeline.</p>') + (snaps.length ? `<div class="table-scroll"><table class="data"><thead><tr><th>Month</th><th>Assets</th><th>Liabilities</th><th>Net worth</th><th></th></tr></thead><tbody>${snaps.map((x) => `<tr><td>${x.date}</td><td>${fmt.inr(x.assets)}</td><td>${fmt.inr(x.liabilities)}</td><td><b>${fmt.inr(x.nw)}</b></td><td><button class="icon-btn" data-del="${x.date}" aria-label="Delete snapshot ${x.date}">🗑</button></td></tr>`).join('')}</tbody></table></div>` : '');
    };
    FOS.crud(root.querySelector('#nw-a'), { list: (s) => s.assets, addLabel: 'Add asset', empty: 'Add cash, FD, investments, gold, property…', cols: [{ k: 'name', label: 'Name', type: 'text' }, { k: 'cat', label: 'Category', type: 'select', options: ASSET_CATS }, { k: 'value', label: 'Value ₹', type: 'money' }], blank: () => ({ name: '', cat: 'Bank', value: '' }), onChange: draw });
    FOS.crud(root.querySelector('#nw-l'), { list: (s) => s.liabilities, addLabel: 'Add liability', empty: 'Add credit-card dues, loans…', cols: [{ k: 'name', label: 'Name', type: 'text' }, { k: 'cat', label: 'Category', type: 'select', options: LIAB_CATS }, { k: 'value', label: 'Outstanding ₹', type: 'money' }, { k: 'emi', label: 'EMI / month ₹', type: 'money' }, { k: 'rate', label: 'Interest % (optional)', type: 'number' }], blank: () => ({ name: '', cat: 'Personal loan', value: '', emi: '', rate: '' }), onChange: draw });
    root.querySelector('#nw-snap').onclick = () => { FOS.saveSnapshot(); draw(); };
    root.addEventListener('click', (e) => { const d = e.target.closest('#nw-tl [data-del]'); if (d) { store.update((s) => { s.snapshots = s.snapshots.filter((x) => x.date !== d.dataset.del); }); draw(); } });
    draw();
  };

  /* ---------- financial health (transparent) ---------- */
  FOS.healthMetrics = function () {
    const m = FOS.metrics(), p = store.get().profile, B = FOS.FINANCIAL_ASSUMPTIONS.benchmarks, s = store.get();
    const st = (ok, watch) => (ok ? 'good' : watch ? 'watch' : 'low');
    const has = (x) => Number.isFinite(x) && x !== 0;
    const annualInc = m.income * 12, termRef = annualInc * B.termCoverMultiple;
    const goalAvg = m.goalProgress.length ? m.goalProgress.reduce((a, g) => a + g.pct, 0) / m.goalProgress.length : NaN;
    const snaps = [...s.snapshots].sort((a, b) => a.date.localeCompare(b.date));
    return [
      { name: 'Emergency fund', value: Number.isFinite(m.efMonths) ? fmt.months(m.efMonths) + ' of essential expenses' : 'Not enough data', status: !Number.isFinite(m.efMonths) ? 'na' : m.efMonths >= B.emergencyMonthsOk ? 'good' : m.efMonths >= B.emergencyMonthsLow ? 'watch' : 'low', how: 'Emergency Fund ÷ monthly essential expenses (needs from Budget).', means: `Rule of thumb: ${B.emergencyMonthsLow}–${B.emergencyMonthsOk}+ months is commonly discussed.`, why: 'It stops a bad month from forcing debt or forced selling.', lim: 'The right number depends on income stability, dependents and insurance.' },
      { name: 'Savings', value: fmt.pct(m.savingsRate, 1) + ' savings rate', status: !Number.isFinite(m.savingsRate) ? 'na' : m.savingsRate >= B.savingsRateOk ? 'good' : m.savingsRate >= B.savingsRateLow ? 'watch' : 'low', how: '(Income − expenses) ÷ income × 100.', means: `Reference bands: under ${B.savingsRateLow}% low, ${B.savingsRateLow}–${B.savingsRateOk}% building, above ${B.savingsRateOk}% strong.`, why: 'Savings fund goals, buffers and investing.', lim: 'High rent cities, early career or large one-time goals can justify lower rates.' },
      { name: 'Debt', value: fmt.pct(m.dti, 1) + ' of income to EMIs', status: !Number.isFinite(m.dti) ? 'na' : m.dti <= B.dtiOk ? 'good' : m.dti <= B.dtiHigh ? 'watch' : 'low', how: 'Monthly EMIs ÷ monthly income × 100 (liabilities table).', means: `Up to ${B.dtiOk}% comfortable, ${B.dtiOk}–${B.dtiHigh}% stretched, above ${B.dtiHigh}% heavy — reference bands only.`, why: 'EMIs are fixed; income is not.', lim: 'Does not count rent, and ignores interest rates — a 36% card balance is worse than a 9% home loan.' },
      { name: 'Insurance', value: `${p.hasHealth ? 'Health ✓' : 'Health ✗'} · ${p.hasTerm ? 'Term ✓' : 'Term ✗'}`, status: p.hasHealth && (p.hasTerm || !+p.dependents) ? 'good' : p.hasHealth ? 'watch' : 'low', how: 'From your onboarding answers. Term cover reference = ' + B.termCoverMultiple + '× annual income' + (annualInc ? ' (' + fmt.inr(termRef) + ')' : '') + '.', means: 'Checks that major risks (hospital bills, loss of income for dependants) are covered at all.', why: 'One large event can erase years of savings.', lim: 'We cannot see policy quality, exclusions or adequacy; see the Insurance checklist.' },
      { name: 'Investing', value: has(m.investments) ? fmt.inr(m.investments) + (m.expenses ? ` ≈ ${(m.investments / (m.expenses * 12)).toFixed(1)} years of expenses` : '') : 'No investments recorded', status: !has(m.investments) ? 'na' : 'info', how: 'Investments, FD, RD and gold assets; compared with annual expenses.', means: 'Shows how many years of spending your invested money could cover (information only).', why: 'Investments are what lets money outgrow inflation over long periods.', lim: 'No benchmark shown: what is “enough” depends on your age and goals.' },
      { name: 'Goals', value: Number.isFinite(goalAvg) ? fmt.pct(goalAvg, 0) + ' average progress' : 'No goals yet', status: !Number.isFinite(goalAvg) ? 'na' : 'info', how: 'Average of (current ÷ target) across your goals.', means: 'A simple progress view, not a verdict on whether you are on time.', why: 'Goals turn saving into a purpose.', lim: 'Ignores deadlines and inflation — check each goal\'s required contribution.' },
      { name: 'Net worth', value: fmt.inr(m.netWorth) + (snaps.length > 1 ? (snaps[snaps.length - 1].nw >= snaps[snaps.length - 2].nw ? ' (up vs last snapshot)' : ' (down vs last snapshot)') : ''), status: !(m.assets || m.liabilities) ? 'na' : m.netWorth > 0 ? 'good' : 'watch', how: 'Total assets − total liabilities; trend from monthly snapshots.', means: 'Positive means you own more than you owe.', why: 'It is the scoreboard of your financial position over time.', lim: 'Includes illiquid items like property; market values move.' },
      { name: 'Cash flow', value: fmt.inr(m.savings) + ' per month', status: !m.income ? 'na' : m.savings > 0 ? 'good' : m.savings === 0 ? 'watch' : 'low', how: 'Monthly income − monthly expenses.', means: 'Positive = money left each month; negative = being funded by savings or debt.', why: 'Everything else depends on this number.', lim: 'Irregular income and annual expenses can make one month misleading.' }
    ];
  };
  FOS.tools.health = function (root) {
    const lab = { good: 'Comfortable', watch: 'Watch', low: 'Needs attention', info: 'Information', na: 'Add data' };
    const items = FOS.healthMetrics();
    root.innerHTML = `<div class="card"><h3>Financial health — transparent metrics</h3><p class="muted">No single mysterious score. Each metric shows how it was calculated, what it means, why it matters, and where it falls short. The bands are rules of thumb — not personal advice.</p>
      <div class="health">${items.map((h) => `<details class="hm" ${h.status === 'low' ? 'open' : ''}><summary><span class="status-dot ${h.status}" aria-hidden="true"></span><b>${esc(h.name)}</b><span class="hv">${esc(h.value)}</span><span class="pill ${h.status}">${lab[h.status]}</span></summary><dl><dt>How it was calculated</dt><dd>${esc(h.how)}</dd><dt>What it means</dt><dd>${esc(h.means)}</dd><dt>Why it matters</dt><dd>${esc(h.why)}</dd><dt>Limitations</dt><dd>${esc(h.lim)}</dd></dl></details>`).join('')}</div></div>`;
  };

  /* ---------- reports ---------- */
  FOS.reportHTML = function () {
    const s = store.get(), m = FOS.metrics(), p = s.profile, health = FOS.healthMetrics();
    const t = (head, rows) => `<table class="data"><thead><tr>${head.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('') || `<tr><td colspan="${head.length}">None recorded</td></tr>`}</tbody></table>`;
    const saved = Object.entries(s.calcSaved).flatMap(([id, arr]) => Object.entries(arr).map(([k, sc]) => [esc((FOS.calcs[id] || { title: id }).title), 'Scenario ' + k, (sc.summary || []).map((x) => esc(x.l) + ': ' + esc(x.t)).join('; ')]));
    return `<article class="report"><header><h2>My Financial Report</h2><p class="muted">Generated ${new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })} · Stored only in this browser</p></header>
      <h3>Snapshot</h3>${t(['Income (monthly)', 'Expenses (monthly)', 'Savings', 'Savings rate', 'Net worth'], [[fmt.inr(m.income), fmt.inr(m.expenses), fmt.inr(m.savings), fmt.pct(m.savingsRate, 1), fmt.inr(m.netWorth)]])}
      <h3>Assets (${fmt.inr(m.assets)})</h3>${t(['Name', 'Category', 'Value'], s.assets.map((a) => [esc(a.name), esc(a.cat), fmt.inr(n(a.value))]))}
      <h3>Liabilities (${fmt.inr(m.liabilities)})</h3>${t(['Name', 'Category', 'Outstanding', 'EMI'], s.liabilities.map((a) => [esc(a.name), esc(a.cat), fmt.inr(n(a.value)), fmt.inr(n(a.emi))]))}
      <h3>Debt &amp; emergency fund</h3>${t(['Debt-to-income', 'Emergency fund', 'Months covered', 'Investments'], [[fmt.pct(m.dti, 1), fmt.inr(m.ef), Number.isFinite(m.efMonths) ? fmt.months(m.efMonths) : '—', fmt.inr(m.investments)]])}
      <h3>Insurance</h3><p>Health: ${p.hasHealth ? 'Yes' + (p.healthCover ? ' — cover ' + fmt.inr(+p.healthCover) : '') : 'Not recorded'} · Term: ${p.hasTerm ? 'Yes' + (p.termCover ? ' — cover ' + fmt.inr(+p.termCover) : '') : 'Not recorded'}</p>
      <h3>Goals</h3>${t(['Goal', 'Target', 'Saved', 'Progress', 'Deadline'], s.goals.map((g) => [esc(g.name || g.type), fmt.inr(n(g.target)), fmt.inr(n(g.current)), fmt.pct(n(g.target) ? n(g.current) / n(g.target) * 100 : 0, 0), esc(g.deadline || '—')]))}
      <h3>Recurring expenses (${fmt.inr(m.recurringMonthly)}/month, ${fmt.inr(m.recurringMonthly * 12)}/year)</h3>${t(['Name', 'Amount', 'Billed'], s.recurring.map((r) => [esc(r.name), fmt.inr(n(r.amount)), esc(r.freq)]))}
      <h3>Financial health (transparent metrics)</h3>${t(['Metric', 'Value', 'Status', 'How calculated'], health.map((h) => [esc(h.name), esc(h.value), esc(h.status), esc(h.how)]))}
      ${saved.length ? `<h3>Saved calculator scenarios</h3>${t(['Calculator', 'Scenario', 'Results'], saved)}` : ''}
      <h3>Observations from My Money Review</h3>${FOS.insightsHTML ? FOS.insightsHTML(true) : ''}
      <footer><p class="note">Projections use the assumptions shown in each calculator.</p></footer></article>`;
  };
  FOS.renderReports = function (root) {
    root.innerHTML = `<div class="card no-print"><h3>MY FINANCIAL REPORT</h3><p class="muted">A printable summary built from your local data. Use Print → “Save as PDF” in your browser.</p><div class="row-actions"><button class="btn primary" id="r-print">Print / Save as PDF</button><button class="btn" id="r-html">Download HTML</button><button class="btn" id="r-txt">Download text summary</button><button class="btn ghost" id="r-json">Export JSON</button></div></div>${FOS.reportHTML()}`;
    root.querySelector('#r-print').onclick = () => window.print();
    root.querySelector('#r-html').onclick = () => U.download('my-financial-report.html', `<!doctype html><meta charset="utf-8"><title>My Financial Report</title><style>body{font:15px system-ui;max-width:860px;margin:2rem auto;padding:0 1rem}table{border-collapse:collapse;width:100%;margin:.5rem 0 1rem}th,td{border:1px solid #ccc;padding:6px 8px;text-align:left}</style>${FOS.reportHTML()}`, 'text/html');
    root.querySelector('#r-txt').onclick = () => { const m = FOS.metrics(); U.download('financial-summary.txt', `MY FINANCIAL SUMMARY (${new Date().toLocaleDateString('en-IN')})\nIncome/month: ${fmt.inr(m.income)}\nExpenses/month: ${fmt.inr(m.expenses)}\nSavings: ${fmt.inr(m.savings)} (${fmt.pct(m.savingsRate, 1)})\nAssets: ${fmt.inr(m.assets)}\nLiabilities: ${fmt.inr(m.liabilities)}\nNet worth: ${fmt.inr(m.netWorth)}\nEmergency fund: ${fmt.inr(m.ef)}

Projections use the assumptions shown in each calculator.`); };
    root.querySelector('#r-json').onclick = () => U.download('finance-os-data.json', store.exportJSON(), 'application/json');
  };
})();
