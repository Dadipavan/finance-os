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
  FOS.tools.snapshot = (root) => { const sr = sourceOf(); root.innerHTML = `<div class="card"><h3>MY FINANCIAL SNAPSHOT</h3>${snapshotHTML(FOS.metrics())}<p class="note">Income comes from ${esc(sr.inc)}. Expenses come from ${esc(sr.exp)}. Change them in <a href="#/tool/budget">Budget</a> or by running <b>Start my financial journey</b> again.</p></div>`; animateKpis(root); };

  /* ---------- dashboard ---------- */
  function upcoming(days) {
    const now = new Date(); now.setHours(0, 0, 0, 0); const lim = new Date(now.getTime() + days * 864e5), out = [];
    store.get().reminders.forEach((r) => { let d = r.date ? new Date(r.date) : null; if (!d || isNaN(d)) return; const step = { monthly: 1, quarterly: 3, yearly: 12 }[r.freq]; while (step && d < now) d = new Date(d.getFullYear(), d.getMonth() + step, d.getDate()); if (d >= now && d <= lim) out.push({ name: r.title, date: d, amt: r.amount }); });
    store.get().recurring.forEach((r) => { if (!r.renew) return; const d = new Date(r.renew); if (d >= now && d <= lim) out.push({ name: r.name + ' (renewal)', date: d, amt: r.amount }); });
    return out.sort((a, b) => a.date - b.date);
  }
  FOS.upcoming = upcoming;

  // where the dashboard's income and expense numbers come from (so the user is never surprised)
  function sourceOf() {
    const st = store.get(), b = st.budget, p = st.profile, m = FOS.metrics();
    if (m.fromForm) return { inc: 'your “Start my financial journey” answers', exp: 'your “Start my financial journey” answers' };
    const inc = n(b.income) ? 'your Budget (monthly income)' : n(p.monthlyIncome) ? 'your “Start my financial journey” answers' : n(p.annualIncome) ? 'your yearly income ÷ 12 (journey form)' : 'nothing entered yet';
    const exp = b.items.length ? `your Budget (${b.items.filter((i) => i.kind !== 'save').length} spending lines; savings lines excluded)` : n(p.monthlyExpenses) ? 'your “Start my financial journey” answers' : 'nothing entered yet';
    return { inc, exp };
  }
  FOS.numberSource = sourceOf;
  /* ---------- "How is this calculated?" (uses the user's own numbers and says where each one came from) ---------- */
  function howCalculated(m) {
    const s = store.get(), b = s.budget, p = s.profile, I = (v) => fmt.inr(v), P = (v) => (Number.isFinite(v) ? fmt.pct(v, 1) : '—');
    const src = sourceOf(), incSrc = src.inc, expSrc = src.exp;
    const efCats = 'assets in the “Emergency Fund” category + the “current” amount of any Emergency Fund goal';
    const rows = [
      ['Monthly income', I(m.income), 'Taken from ' + incSrc + '.'],
      ['Monthly expenses', I(m.expenses), 'Taken from ' + expSrc + '.'],
      ['Monthly savings', I(m.savings), `Income − expenses = ${I(m.income)} − ${I(m.expenses)}. Can be negative if you spend more than you earn.`],
      ['Savings rate', P(m.savingsRate), `Savings ÷ income × 100 = ${I(m.savings)} ÷ ${I(m.income)}. Aim for 20% or more.`],
      ['Total assets', I(m.assets), `Add up every row in Net Worth → Assets (${s.assets.length} rows). Use today’s market value, not what you paid.`],
      ['Total liabilities', I(m.liabilities), `Add up the outstanding amount of every row in Net Worth → Liabilities (${s.liabilities.length} rows).`],
      ['Net worth', I(m.netWorth), `Assets − liabilities = ${I(m.assets)} − ${I(m.liabilities)}.`],
      ['Emergency fund', I(m.ef), 'Counted from ' + efCats + '. Savings accounts are not counted unless you put them in that category.'],
      ['Emergency months', Number.isFinite(m.efMonths) ? m.efMonths.toFixed(1) + ' months' : '—', `Emergency fund ÷ essential monthly expenses (${I(m.essential)}; your “need” lines if you made a budget, otherwise all expenses). Target 6.`],
      ['Debt-to-income', P(m.dti), `All monthly EMIs ÷ monthly income × 100 = ${I(m.emi)} ÷ ${I(m.income)}. Keep it under 35–40%.`],
      ['Liquid months', Number.isFinite(m.liquidMonths) ? m.liquidMonths.toFixed(1) + ' months' : '—', `(Cash + bank + emergency fund) ÷ (essential expenses + EMIs) = ${I(m.liquid)} ÷ ${I(m.essential + m.emi)}.`],
      ['Goal progress', m.goalProgress.length ? m.goalProgress.length + ' goal(s)' : '—', 'For each goal: amount saved so far ÷ target amount × 100, capped at 100%.']
    ];
    return `<section class="card calc-how"><details${/^(1|true)$/.test(String(localStorage.getItem('fos.howOpen'))) ? ' open' : ''} id="how-calc"><summary><b>How is each number calculated?</b> <span class="muted">— with your own figures and where each came from</span></summary><div class="table-scroll"><table class="data"><thead><tr><th>Number</th><th>Your value</th><th>How it is worked out</th></tr></thead><tbody>${rows.map((r) => `<tr><th scope="row" data-label="Number">${esc(r[0])}</th><td data-label="Your value"><b>${esc(r[1])}</b></td><td data-label="How">${esc(r[2])}</td></tr>`).join('')}</tbody></table></div><p class="note">Nothing here is estimated or assumed. Every figure comes from what you typed in <a href="#/tool/budget">Budget</a>, <a href="#/tool/networth">Net Worth</a>, <a href="#/tool/goals">Goals</a> or the <b>Start my financial journey</b> form. If a number looks wrong, fix the source row, not this page. Monthly statements use only your logged entries (see <a href="#/tool/statement">Monthly Statement</a>).</p></details></section>`;
  }
  FOS.tools.dashboard = function (root) {
    const s = store.get(), m = FOS.metrics(), empty = !m.income && !s.assets.length && !s.liabilities.length && !s.goals.length;
    const up = upcoming(30), by = (arr) => Object.entries(arr.reduce((a, x) => { a[x.cat] = (a[x.cat] || 0) + n(x.value); return a; }, {})).map(([name, value]) => ({ name, value }));
    const snaps = [...s.snapshots].sort((a, b) => a.date.localeCompare(b.date));
    root.innerHTML = `${empty ? `<div class="card hero-empty"><h3>Welcome. Your dashboard is empty — and that\'s fine.</h3><p>Answer a few optional questions, add a budget, or explore a sample to see how it works.</p><div class="row-actions"><button class="btn primary" data-act="onboard">START MY FINANCIAL JOURNEY</button><button class="btn" data-act="sample">Load sample data</button><a class="btn ghost" href="#/tool/budget">Create a budget</a></div></div>` : ''}
      <div class="kpis big">${kpi('Monthly income', fmt.inr(m.income), '', { num: m.income })}${kpi('Monthly expenses', fmt.inr(m.expenses), '', { num: m.expenses })}${kpi('Monthly savings', fmt.inr(m.savings), '', { num: m.savings })}${kpi('Savings rate', fmt.pct(m.savingsRate, 1), '', { num: m.savingsRate, f: 'pct', tip: 'Savings ÷ Income × 100' })}${kpi('Total assets', fmt.inr(m.assets), '', { num: m.assets })}${kpi('Total liabilities', fmt.inr(m.liabilities), '', { num: m.liabilities })}${kpi('Net worth', fmt.inr(m.netWorth), 'assets − liabilities', { num: m.netWorth, hi: true })}${kpi('Emergency fund', fmt.inr(m.ef), Number.isFinite(m.efMonths) ? `${fmt.months(m.efMonths)} of essentials` : 'add essentials in Budget', { num: m.ef })}${kpi('Total investments', fmt.inr(m.investments), '', { num: m.investments })}${kpi('Total debt', fmt.inr(m.liabilities), m.emi ? `EMIs ${fmt.inr(m.emi)}/mo` : '', { num: m.liabilities })}${kpi('Recurring expenses', fmt.inr(m.recurringMonthly), 'per month', { num: m.recurringMonthly })}${kpi('Upcoming (30 days)', up.length + '', up[0] ? esc(up[0].name) + ' · ' + fmt.date(up[0].date) : 'nothing due')}</div>
      ${howCalculated(m)}
      <div class="grid-2">
        <div class="card"><h3>Income vs expenses</h3>${ch().bar({ title: 'Income vs expenses', cats: ['Income', 'Expenses', 'Savings'], series: [{ name: 'Monthly', data: [m.income, m.expenses, Math.max(0, m.savings)], color: ch().PALETTE[0] }], yfmt: 'inr' })}</div>
        <div class="card"><h3>Asset allocation</h3>${ch().donut({ title: 'Assets', items: by(s.assets) })}</div>
        <div class="card"><h3>Liability breakdown</h3>${ch().donut({ title: 'Liabilities', items: by(s.liabilities) })}</div>
        <div class="card"><h3>Goal progress</h3>${m.goalProgress.length ? m.goalProgress.map((g) => `<div class="between"><span>${esc(g.name || 'Goal')}</span><b>${fmt.pct(g.pct, 0)}</b></div>${ch().progress(g.pct, g.name)}`).join('') : '<p class="muted">No goals yet. <a href="#/tool/goals">Create one</a>.</p>'}</div>
        <div class="card"><h3>Net worth timeline</h3>${snaps.length > 1 ? ch().line({ title: 'Net worth', xLabel: '', yfmt: 'inr', area: true, xfmt: (x) => (snaps[Math.round(x)] || {}).date || '', series: [{ name: 'Net worth', data: snaps.map((p, i) => ({ x: i, y: p.nw })) }] }) : '<p class="muted">Save monthly snapshots to see your timeline. One is saved by the button below.</p>'}<div class="row-actions"><button class="btn" data-act="snap">Save this month\'s snapshot</button></div></div>
        <div class="card"><h3>Savings trend</h3>${snaps.filter((p) => Number.isFinite(p.savings)).length > 1 ? ch().line({ title: 'Monthly savings', xfmt: (x) => (snaps[Math.round(x)] || {}).date || '', yfmt: 'inr', series: [{ name: 'Monthly savings', data: snaps.map((p, i) => ({ x: i, y: p.savings })).filter((p) => Number.isFinite(p.y)) }] }) : '<p class="muted">Appears once two months have recorded income and expenses (Month-End Close).</p>'}</div>
      </div>
      <div class="card"><h3>Upcoming payments</h3>${up.length ? `<ul class="plain">${up.map((u) => `<li><b>${fmt.date(u.date)}</b> — ${esc(u.name)} ${u.amt ? '· ' + fmt.inr(+u.amt) : ''}</li>`).join('')}</ul>` : '<p class="muted">Add due dates in <a href="#/tool/reminders">Reminders</a>.</p>'}</div>
      ${!(s.meta && s.meta.lastExport) ? '<div class="card"><p class="status warn">Your data is stored only in this browser. <a href="#/settings">Export a backup</a> now and then so you can restore it anywhere.</p></div>' : ''}
      <div class="card quote"><p>You don't need to become a financial expert overnight. You need to understand the important numbers before making important decisions.</p></div>
      <p class="safety">${SAFETY}</p>`;
    animateKpis(root);
    const hw = root.querySelector('#how-calc'); if (hw) hw.addEventListener('toggle', () => { try { localStorage.setItem('fos.howOpen', hw.open ? '1' : '0'); } catch (e) {} });
    root.onclick = (e) => { const a = e.target.closest('[data-act]'); if (!a) return; if (a.dataset.act === 'onboard') FOS.onboarding(); if (a.dataset.act === 'sample') FOS.loadSample(); if (a.dataset.act === 'snap') { FOS.saveSnapshot(); FOS.route(); } };
  };

  FOS.saveSnapshot = function (monthKey) {
    // Balances are today's figures (entered by you). Income / spending / saving are stored ONLY if you recorded them for that month — otherwise null, never a guess.
    const m = FOS.metrics(), d = typeof monthKey === 'string' ? monthKey : new Date().toISOString().slice(0, 7), f = FOS.monthFacts ? FOS.monthFacts(d) : { income: null, expenses: null };
    store.update((s) => { const rec = { date: d, assets: m.assets, liabilities: m.liabilities, nw: m.netWorth, income: f.income, expenses: f.expenses, savings: f.income !== null && f.expenses !== null ? f.income - f.expenses : null }; const i = s.snapshots.findIndex((x) => x.date === d && !x.sample); if (i >= 0) s.snapshots[i] = rec; else s.snapshots.push(rec); });
    U.toast('Snapshot saved for ' + d);
  };

  FOS.loadSample = function () {
    if (!confirm('Load a sample profile? This replaces your current data in this browser (export first if unsure).')) return;
    const u = store.uid, now = new Date();
    store.update((s) => {
      s.meta.sample = true; s.profile.sampleSet = true;
      Object.assign(s.profile, { age: 28, monthlyIncome: 60000, annualIncome: 720000, monthlyExpenses: 40000, dependents: 0, retAge: 60, hasHealth: true, healthCover: 500000, hasTerm: false, onboarded: true });
      s.budget = { sample: true, method: '50-30-20', income: 60000, items: [['Rent', 12000, 'need'], ['Food', 6000, 'need'], ['Transport', 4000, 'need'], ['Utilities', 3000, 'need'], ['Subscriptions', 1000, 'want'], ['Entertainment', 3000, 'want'], ['Investments', 15000, 'save'], ['Emergency Fund', 5000, 'save'], ['Other', 2000, 'want']].map(([name, amount, kind]) => ({ id: u(), name, amount, kind, spent: '', sample: true })) };
      s.assets = [['Savings account', 'Bank', 80000], ['Emergency fund', 'Emergency Fund', 50000], ['Fixed deposit', 'FD', 100000], ['Index fund SIP', 'Investments', 180000], ['Phone / laptop', 'Other', 40000]].map(([name, cat, value]) => ({ id: u(), name, cat, value }));
      s.liabilities = [{ id: u(), name: 'Credit card dues', cat: 'Credit card', value: 20000, emi: 0 }, { id: u(), name: 'Personal loan', cat: 'Personal loan', value: 150000, emi: 5000 }];
      s.goals = [{ id: u(), name: 'Emergency fund', type: 'Emergency Fund', target: 240000, current: 0, deadline: '', inflation: 5, ret: 6 }, { id: u(), name: 'Laptop', type: 'Laptop', target: 90000, current: 30000, deadline: new Date(now.getFullYear() + 1, now.getMonth(), 1).toISOString().slice(0, 10), inflation: 5, ret: 6 }];
      s.recurring = [['Streaming', 'OTT / streaming', 499, 'monthly'], ['Gym', 'Gym / fitness', 1500, 'monthly'], ['Cloud storage', 'Cloud storage', 1300, 'yearly']].map(([name, cat, amount, freq]) => ({ id: u(), name, cat, amount, freq, renew: '' }));
      s.reminders = [{ id: u(), title: 'Credit card due', date: new Date(now.getFullYear(), now.getMonth(), Math.min(28, now.getDate() + 5)).toISOString().slice(0, 10), freq: 'monthly', amount: 20000, note: '' }];
      const tag = (arr) => arr.map((x) => Object.assign({}, x, { sample: true }));
      s.snapshots = Array.from({ length: 6 }, (_, i) => { const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1); const nw = 300000 + i * 28000; return { date: d.toISOString().slice(0, 7), assets: nw + 170000, liabilities: 170000, nw, income: 60000, expenses: 40000 + (i % 2) * 1500, savings: 20000 - (i % 2) * 1500 }; });
    });
    store.update((s) => { s.budget.sample = true; ['assets', 'liabilities', 'goals', 'recurring', 'reminders', 'snapshots'].forEach((k) => { s[k] = s[k].map((x) => Object.assign({}, x, { sample: true })); }); s.budget.items = s.budget.items.map((x) => Object.assign({}, x, { sample: true })); });
    U.toast('Sample data loaded — these are example numbers, not yours. Remove them in Settings.'); FOS.route();
  };

  FOS.hasSample = () => !!(store.get().meta && store.get().meta.sample);
  // Removes ONLY what the sample created; anything you added yourself stays.
  FOS.removeSample = function () {
    store.update((s) => {
      ['assets', 'liabilities', 'goals', 'recurring', 'reminders', 'snapshots', 'records', 'expenses'].forEach((k) => { s[k] = (s[k] || []).filter((x) => !x.sample); });
      s.budget.items = s.budget.items.filter((x) => !x.sample);
      if (s.budget.sample) { s.budget = { method: 'custom', income: '', items: s.budget.items }; }
      if (s.profile.sampleSet) { const d = { age: '', monthlyIncome: '', annualIncome: '', monthlyExpenses: '', dependents: '', retAge: 60, hasHealth: false, healthCover: '', hasTerm: false, termCover: '', onboarded: false }; Object.assign(s.profile, d); delete s.profile.sampleSet; }
      s.meta.sample = false;
    });
    U.toast('Sample data removed.'); FOS.route();
  };

  /* ---------- onboarding ---------- */
  FOS.onboarding = function () {
    const p = Object.assign({}, store.get().profile); let step = 0;
    delete p.numbersFrom; // decided again at the review step from what you type now
    const wasSample = !!(store.get().meta && store.get().meta.sample) || !!p.sampleSet;
    // sample numbers must never be pre-filled as if they were yours
    if (wasSample) ['age', 'monthlyIncome', 'annualIncome', 'monthlyExpenses', 'savings', 'investments', 'loans', 'emi', 'cards', 'dependents', 'healthCover', 'termCover'].forEach((k) => { p[k] = ''; });
    const num = (v) => +v || 0;
    const fld = (k, label, hint, o = {}) => `<div class="field"><label>${label}<input class="input" data-p="${k}" type="number" inputmode="decimal" min="${o.min === undefined ? 0 : o.min}"${o.max ? ` max="${o.max}"` : ''} placeholder="${o.ph || ''}" value="${esc(p[k] === undefined || p[k] === null ? '' : p[k])}"></label><small class="hint">${hint}</small></div>`;
    const review = () => {
      const inc = num(p.monthlyIncome) || num(p.annualIncome) / 12, exp = num(p.monthlyExpenses), sur = inc - exp, emi = num(p.emi);
      const row = (l, v, note) => `<tr><th scope="row">${l}</th><td>${v}</td><td class="muted">${note}</td></tr>`;
      const rows = [
        inc ? row('Monthly income', fmt.inr(inc), 'Used for every affordability and savings answer') : row('Monthly income', '— not given', 'Without it, savings rate, EMI load and tax advice stay blank'),
        p.monthlyExpenses !== '' ? row('Monthly expenses', fmt.inr(exp), inc ? `You keep ${fmt.inr(sur)} a month (${Math.round(sur / inc * 100)}% savings rate)` : '') : '',
        exp && num(p.savings) ? row('Emergency fund', (Math.min(num(p.emergencyFund), num(p.savings)) / exp).toFixed(1) + ' months', num(p.emergencyFund) ? 'Target is 6 months of expenses' : 'None earmarked. Savings of ' + fmt.inr(num(p.savings)) + ' would last ' + (num(p.savings) / exp).toFixed(1) + ' months, but only money kept as emergency fund is counted') : '',
        inc && emi ? row('EMI load', Math.round(emi / inc * 100) + '% of income', 'Keep this under 35–40%') : '',
        row('Health insurance', p.hasHealth ? 'Yes' + (num(p.healthCover) ? ' · ' + fmt.inr(num(p.healthCover)) : '') : 'No', p.hasHealth ? '' : 'You will see this as a priority in My Suggestions'),
        row('Term life insurance', p.hasTerm ? 'Yes' + (num(p.termCover) ? ' · ' + fmt.inr(num(p.termCover)) : '') : 'No', +p.dependents && !p.hasTerm ? 'You have dependents — this matters' : '')
      ].join('');
      const made = [num(p.savings) && 'asset “Savings”', num(p.investments) && 'asset “Investments”', num(p.loans) && 'liability “Loans”', num(p.cards) && 'liability “Credit-card dues”'].filter(Boolean);
      const bs = store.get().budget, hasOwnBudget = !wasSample && (bs.items.length > 0 || n(bs.income) > 0), typed = p.monthlyIncome !== '' || p.monthlyExpenses !== '' || p.annualIncome !== '';
      if (p.numbersFrom !== 'form' && p.numbersFrom !== 'budget') p.numbersFrom = typed || !hasOwnBudget ? 'form' : 'budget';
      const chooser = hasOwnBudget ? `<div class="field"><label>You already have a Budget. Which income and expense numbers should the dashboard use?<select class="input" data-p="numbersFrom"><option value="form" ${p.numbersFrom === 'form' ? 'selected' : ''}>The numbers I typed here (expenses ${fmt.inr(num(p.monthlyExpenses))})</option><option value="budget" ${p.numbersFrom === 'budget' ? 'selected' : ''}>My Budget (expenses ${fmt.inr(bs.items.filter((i) => i.kind !== 'save').reduce((a, i) => a + num(i.amount), 0))})</option></select></label><small class="hint">Your Budget is never deleted. You can switch any time by editing the Budget or running this form again.</small></div>` : '';
      return `${chooser}<div class="table-scroll"><table class="data"><tbody>${rows}</tbody></table></div><div class="g-note gn-ex"><span class="gn-ic" aria-hidden="true">📒</span><div class="gn-b"><b class="gn-t">What will be created</b><div>Your profile${made.length ? ', plus ' + made.join(', ') + ' in Net Worth' : ''}. Nothing is sent anywhere. You can edit or delete every number later in <b>Net Worth</b>, <b>Budget</b> or <b>Settings</b>.</div></div></div>`;
    };
    const steps = [
      ['Welcome', 'What this is, and what you get', () => `<div class="onb-intro"><p>This builds your <b>starting picture</b> in about <b>4 minutes</b>: how much you earn and spend, what you own and owe, and how protected you are.</p><ul class="onb-list"><li><b>What you get:</b> your savings rate, emergency-fund months, EMI load, net worth, an insurance check, and an ordered “what to do next” list in <b>My Suggestions</b> and <b>My Action Plan</b>.</li><li><b>Everything is optional.</b> Leave a box empty if you don’t know it. Rough numbers are fine; you can correct them later.</li><li><b>Private:</b> numbers stay in this browser (and your own Google Drive if you turn sync on). No account, no server.</li><li><b>Never type</b> Aadhaar, PAN, account or card numbers, passwords, OTPs, PINs or CVVs. This form never needs them.</li></ul><p class="muted">Steps: 1 About you · 2 Income &amp; spending · 3 Savings &amp; debts · 4 Protection &amp; goals · 5 Review.</p></div>`],
      ['1. About you', 'Age and family decide how much insurance and how much risk make sense.', () => `<div class="fields">${fld('age', 'Your age (years)', 'Sets your investing horizon and insurance need.', { max: 110, ph: 'e.g. 30' })}${fld('dependents', 'Dependents (people who rely on your income)', 'Spouse, children, parents you support. Enter 0 if none.', { ph: 'e.g. 2' })}${fld('retAge', 'Age you want to retire', 'Used by the retirement and financial-independence calculators. Default 60.', { min: 30, max: 80, ph: '60' })}<div class="field"><label>How well do you understand investment risk?<select class="input" data-p="riskUnderstanding">${['Not at all', 'A little', 'Somewhat', 'Fairly well', 'Very well'].map((t, i) => `<option value="${i + 1}" ${+p.riskUnderstanding === i + 1 ? 'selected' : ''}>${t}</option>`).join('')}</select></label><small class="hint">Honest answer please — it limits how aggressive the suggested mix is.</small></div></div>`],
      ['2. Income & spending', 'Take-home means what reaches your bank account after tax and PF.', () => `<div class="fields">${fld('monthlyIncome', 'Monthly income, take-home (₹)', 'Salary credited per month. For irregular income, use an average of the last 6 months.', { ph: 'e.g. 60000' })}${fld('annualIncome', 'Yearly income, before tax (₹) — optional', 'Your CTC or gross for the year. Used for the tax calculators. Left blank = monthly × 12.', { ph: 'e.g. 900000' })}${fld('monthlyExpenses', 'Monthly expenses (₹)', 'Everything you spend in a month: rent, food, bills, EMIs, fuel, outings. Check last month’s UPI/bank statement for a real number.', { ph: 'e.g. 40000' })}</div>`],
      ['3. Savings & debts', 'What you own and what you owe today. Rounded numbers are fine.', () => `<div class="fields">${fld('savings', 'Savings in bank and cash (₹)', 'Savings account + cash + liquid money you can use this week. Not FDs you can’t break.', { ph: 'e.g. 150000' })}${fld('emergencyFund', 'Of that, kept as emergency fund (₹)', 'The part of your savings you have set aside only for emergencies (job loss, medical). It is counted in the “Emergency months” number. Enter 0 if none is earmarked.', { ph: 'e.g. 100000' })}${fld('investments', 'Investments (₹)', 'Current value of mutual funds, stocks, FDs, PPF/EPF/NPS, gold. Use today’s value, not what you paid.', { ph: 'e.g. 400000' })}${fld('loans', 'Loans outstanding (₹)', 'Total still to repay on home, car, personal and education loans.', { ph: 'e.g. 2500000' })}${fld('emi', 'Total monthly EMIs (₹)', 'Add up every loan EMI you pay each month.', { ph: 'e.g. 22000' })}${fld('cards', 'Credit-card dues (₹)', 'Unpaid balance across cards right now. Costs 36–42% a year, so it comes first in your plan.', { ph: 'e.g. 0' })}</div>`],
      ['4. Protection & goals', 'Insurance is checked before investing. Goals tell the plan what to save for.', () => `<div class="fields"><div class="field"><label class="check"><input type="checkbox" data-p="hasHealth" ${p.hasHealth ? 'checked' : ''}> I have health insurance (not only from my employer)</label></div>${fld('healthCover', 'Health cover (₹)', 'Total sum insured, e.g. 1000000 for ₹10 lakh.', { ph: 'e.g. 1000000' })}<div class="field"><label class="check"><input type="checkbox" data-p="hasTerm" ${p.hasTerm ? 'checked' : ''}> I have term life insurance</label></div>${fld('termCover', 'Term cover (₹)', 'Sum assured, e.g. 10000000 for ₹1 crore.', { ph: 'e.g. 10000000' })}</div><fieldset><legend>Goals I am thinking about</legend><div class="chips">${['Emergency Fund', 'Laptop', 'Phone', 'Bike', 'Car', 'House', 'Education', 'Travel', 'Marriage', 'Children', 'Retirement', 'Financial Independence'].map((g) => `<label class="chip check"><input type="checkbox" data-goal="${g}" ${p.goalsInterest.includes(g) ? 'checked' : ''}> ${g}</label>`).join('')}</div><small class="hint">Tick any. You will set amounts and dates in Financial Goals afterwards.</small></fieldset>`],
      ['5. Review', 'Check this once. Go Back to change anything.', review]
    ];
    const box = U.modal('Start my financial journey', '', { wide: true });
    const body = box.querySelector('.modal-body');
    const collect = () => { U.$$('[data-p]', body).forEach((e) => { p[e.dataset.p] = e.type === 'checkbox' ? e.checked : e.value === '' ? '' : (isNaN(+e.value) ? e.value : Math.max(0, +e.value)); }); const g = U.$$('[data-goal]', body); if (g.length) p.goalsInterest = g.filter((e) => e.checked).map((e) => e.dataset.goal); };
    const draw = () => {
      const st = steps[step], last = step === steps.length - 1;
      body.innerHTML = `<div class="steps" aria-label="Step ${step + 1} of ${steps.length}">${steps.map((x, i) => `<span class="${i === step ? 'on' : i < step ? 'done' : ''}">${i + 1}</span>`).join('')}</div><h3>${st[0]}</h3><p class="lead">${st[1]}</p>${step > 0 && !last ? `<p class="muted">Optional — skip anything you prefer not to share.</p>` : ''}${st[2]()}${step > 0 && !last ? `<div class="safety">${SAFETY}</div>` : ''}<div class="row-actions">${step > 0 ? '<button class="btn ghost" data-nav="-1">Back</button>' : ''}<button class="btn primary" data-nav="1">${step === 0 ? 'Let’s start' : last ? 'Create my snapshot' : 'Next'}</button></div>`;
      const m = body.closest('.modal, [role=dialog]') || body; if (m.scrollTo) m.scrollTo(0, 0);
    };
    body.onclick = (e) => {
      const b = e.target.closest('[data-nav]'); if (!b) return; collect(); step += +b.dataset.nav || 0;
      if (step >= steps.length) {
        if (wasSample) { const keepToast = U.toast; U.toast = () => {}; FOS.removeSample(); U.toast = keepToast; }
        store.update((s) => {
          Object.assign(s.profile, p, { onboarded: true, numbersFrom: p.numbersFrom === 'budget' ? 'budget' : 'form' }); delete s.profile.sampleSet;
          if (!(+s.profile.annualIncome) && +s.profile.monthlyIncome) s.profile.annualIncome = s.profile.monthlyIncome * 12;
          if (!(+s.profile.monthlyIncome) && +s.profile.annualIncome) s.profile.monthlyIncome = Math.round(s.profile.annualIncome / 12);
          s.assets = s.assets.filter((a) => a.src !== 'onboarding'); s.liabilities = s.liabilities.filter((a) => a.src !== 'onboarding');
          const ef = Math.min(+p.emergencyFund || 0, +p.savings || 0);
          if (ef > 0) s.assets.push({ id: store.uid(), name: 'Emergency fund (from journey form)', cat: 'Emergency Fund', value: ef, src: 'onboarding' });
          if ((+p.savings || 0) - ef > 0) s.assets.push({ id: store.uid(), name: 'Savings (from journey form)', cat: 'Bank', value: (+p.savings || 0) - ef, src: 'onboarding' });
          if (+p.investments) s.assets.push({ id: store.uid(), name: 'Investments (from journey form)', cat: 'Investments', value: +p.investments, src: 'onboarding' });
          if (+p.loans) s.liabilities.push({ id: store.uid(), name: 'Loans (from journey form)', cat: 'Other', value: +p.loans, emi: +p.emi || 0, src: 'onboarding' });
          if (+p.cards) s.liabilities.push({ id: store.uid(), name: 'Credit-card dues (from journey form)', cat: 'Credit card', value: +p.cards, emi: 0, src: 'onboarding' });
        });
        U.closeModal(); U.toast('Done. Your snapshot is ready — next: open My Suggestions'); FOS.go('#/tool/snapshot'); return;
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
    const t = (head, rows) => `<div class="table-scroll"><table class="data"><thead><tr>${head.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join('')}</tr>`).join('') || `<tr><td colspan="${head.length}">None recorded</td></tr>`}</tbody></table></div>`;
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
