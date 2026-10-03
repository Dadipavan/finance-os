/* ==========================================================================
   statement.js — Monthly statement ("where did my money go"), month-end close,
   month-end notice, recurring calendar reminder (.ics)
   ========================================================================== */
(function () {
  'use strict';
  const C = FOS.calc, fmt = FOS.fmt, U = FOS.ui, esc = U.esc, store = FOS.store, ch = () => FOS.charts;
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const label = (k) => (k ? MONTHS[+k.slice(5, 7) - 1] + ' ' + k.slice(0, 4) : '');
  const mk = (d) => String(d).slice(0, 7);
  const keyOf = (y, m) => y + '-' + String(m + 1).padStart(2, '0');
  const prevKey = (now) => { const d = new Date((now || new Date()).getFullYear(), (now || new Date()).getMonth() - 1, 1); return keyOf(d.getFullYear(), d.getMonth()); };
  const curKey = (now) => keyOf((now || new Date()).getFullYear(), (now || new Date()).getMonth());
  const range = (from, to) => { const out = []; let [y, m] = from.split('-').map(Number); const [y2, m2] = to.split('-').map(Number); while ((y < y2 || (y === y2 && m <= m2)) && out.length < 120) { out.push(keyOf(y, m - 1)); m++; if (m > 12) { m = 1; y++; } } return out; };
  FOS.monthLabel = label;

  /* ---------- statement data (pure) ----------
     RULE: only numbers the user actually entered are ever shown. A month with nothing recorded is
     "no data" (never estimated from the budget), months before the first record are not shown, and
     sample data is ignored. Unknown values are null, never 0 or a guess. */
  FOS.monthFacts = function (m) {
    const s = store.get(), all = s.expenses.filter((e) => e.date && +e.amount > 0 && mk(e.date) === m), rec = s.months[m] && s.months[m].income !== '' && s.months[m].income !== undefined;
    const spent = all.reduce((a, e) => a + +e.amount, 0);
    return { count: all.length, expenses: all.length ? spent : null, income: rec ? +s.months[m].income : null, snapshot: s.snapshots.find((x) => x.date === m && !x.sample) || null };
  };
  FOS.statement = function (from, to, cat, now) {
    const s = store.get(), log = s.expenses.filter((e) => e.date && +e.amount > 0), real = s.snapshots.filter((x) => !x.sample), snaps = {}; real.forEach((x) => { snaps[x.date] = x; });
    const has = new Set(); log.forEach((e) => has.add(mk(e.date))); Object.keys(s.months).forEach((k) => { const v = s.months[k]; if (v && v.income !== '' && v.income !== undefined) has.add(k); }); real.forEach((x) => has.add(x.date));
    const start = [...has].sort()[0] || null, cur = curKey(now);
    let f = from <= to ? from : to, t = from <= to ? to : from; const clamped = !!(start && f < start), future = t > cur; if (start && f < start) f = start; if (t > cur) t = cur;
    const months = start && f <= t ? range(f, t) : [];
    const rows = months.map((m) => {
      const facts = FOS.monthFacts(m), entries = log.filter((e) => mk(e.date) === m && (!cat || e.cat === cat));
      const byCat = {}; entries.forEach((e) => { byCat[e.cat] = (byCat[e.cat] || 0) + +e.amount; });
      const expenses = facts.count ? Object.values(byCat).reduce((a, b2) => a + b2, 0) : null, income = facts.income;
      return { m, has: has.has(m), income, expenses, byCat, entries, savings: !cat && income !== null && expenses !== null ? income - expenses : null, nw: snaps[m] ? snaps[m].nw : null, count: facts.count };
    });
    const add = (f2) => rows.reduce((a, r) => a + (f2(r) || 0), 0), byCat = {}, byMode = {}, tx = [];
    rows.forEach((r) => { Object.entries(r.byCat).forEach(([k, v]) => { byCat[k] = (byCat[k] || 0) + v; }); r.entries.forEach((e) => { byMode[e.mode || 'Not recorded'] = (byMode[e.mode || 'Not recorded'] || 0) + +e.amount; tx.push(e); }); });
    tx.sort((a, b2) => (a.date < b2.date ? 1 : -1));
    const both = rows.filter((r) => r.savings !== null), income = add((r) => r.income), expenses = add((r) => r.expenses), savings = both.reduce((a, r) => a + r.savings, 0), incomeOfBoth = both.reduce((a, r) => a + r.income, 0);
    const first = rows[0], prevKeyStr = first ? (() => { const [y, mo] = first.m.split('-').map(Number); return keyOf(mo === 1 ? y - 1 : y, mo === 1 ? 11 : mo - 2); })() : null, prev = prevKeyStr ? snaps[prevKeyStr] : null, last = rows[rows.length - 1];
    return {
      months: rows, start, clamped, future, from: f, to: t, income, expenses, savings, rate: incomeOfBoth > 0 ? savings / incomeOfBoth * 100 : NaN,
      incomeKnown: rows.some((r) => r.income !== null), expensesKnown: rows.some((r) => r.expenses !== null), savingsKnown: both.length > 0,
      noData: rows.filter((r) => !r.has).map((r) => r.m), missingIncome: rows.filter((r) => r.income === null && r.expenses !== null).map((r) => r.m),
      byCat, byMode, tx, nwStart: prev ? prev.nw : null, nwEnd: last && last.nw !== null ? last.nw : null, budget: s.budget.items.filter((i) => i.kind !== 'save' && !i.sample), hasAny: !!start
    };
  };
  FOS.statementCSV = (st) => ['date,category,amount,payment mode,note'].concat(st.tx.map((e) => [e.date, '"' + String(e.cat).replace(/"/g, '""') + '"', e.amount, e.mode || '', '"' + String(e.note || '').replace(/"/g, '""') + '"'].join(','))).join('\n');

  function slipHTML(st, cat) {
    const val = (x) => (x === null || x === undefined || !Number.isFinite(x) ? '—' : fmt.inr(x));
    if (!st.hasAny) return '<article class="slip"><p class="status warn"><b>No records yet.</b> Nothing has been entered, so there is nothing to show. Log expenses in the Expense Log and record your income in Month-End Close — only what you enter appears here.</p></article>';
    if (!st.months.length) return `<article class="slip"><p class="status warn">Your records start in <b>${label(st.start)}</b>. There is nothing recorded for the period you chose.</p></article>`;
    const title = st.from === st.to ? label(st.from) : label(st.from) + ' – ' + label(st.to), tot = Object.values(st.byCat).reduce((a, b) => a + b, 0);
    const cats = Object.entries(st.byCat).sort((a, b) => b[1] - a[1]); let cum = 0;
    const bud = (c) => { const b = st.budget.find((i) => (i.name || '').toLowerCase() === c.toLowerCase()); return b ? +b.amount * st.months.length : null; };
    const notes = [st.clamped ? `Your records start in <b>${label(st.start)}</b>; earlier months are not shown.` : '', st.future ? 'Future months are not shown.' : '', st.noData.length ? `No data recorded for: ${st.noData.map(label).join(', ')}. These months are left out of the totals — nothing is estimated.` : '', st.missingIncome.length ? `Income was not recorded for ${st.missingIncome.map(label).join(', ')}, so savings cannot be worked out for ${st.missingIncome.length > 1 ? 'those months' : 'that month'}. Record it in <a href="#/tool/monthend">Month-End Close</a>.` : ''].filter(Boolean);
    return `<article class="slip"><header><h2>Money statement — ${esc(title)}${cat ? ' · ' + esc(cat) : ''}</h2><p class="muted">Generated ${new Date().toLocaleDateString('en-IN', { dateStyle: 'long' })} · only figures you entered</p>${store.get().meta.sample ? '<p class="status warn">Sample data is loaded — remove it in Settings so it cannot mix with yours.</p>' : ''}${notes.map((n) => `<p class="note">${n}</p>`).join('')}</header>
      <div class="kpis"><div class="kpi"><span>Income recorded</span><b>${st.incomeKnown ? fmt.inr(st.income) : '—'}</b></div><div class="kpi"><span>Spent (logged)</span><b>${st.expensesKnown ? fmt.inr(st.expenses) : '—'}</b></div><div class="kpi hi"><span>Saved</span><b>${st.savingsKnown ? fmt.inr(st.savings) : '—'}</b></div><div class="kpi"><span>Savings rate</span><b>${fmt.pct(st.rate, 1)}</b></div>${st.nwEnd !== null ? `<div class="kpi"><span>Net worth (end)</span><b>${fmt.inr(st.nwEnd)}</b>${st.nwStart !== null ? `<small>${st.nwEnd - st.nwStart >= 0 ? '▲' : '▼'} ${fmt.inr(Math.abs(st.nwEnd - st.nwStart))} vs previous month</small>` : ''}</div>` : ''}</div>
      ${cats.length ? `<div class="grid-2"><div>${ch().donut({ title: 'Where the money went', items: cats.map(([name, value]) => ({ name, value })) })}</div><div><h4>Where every rupee went</h4><div class="table-scroll"><table class="data"><thead><tr><th>Category</th><th>Amount</th><th>% of spending</th><th>Running total</th>${st.from === st.to ? '<th>Budget</th>' : ''}</tr></thead><tbody>${cats.map(([c, v]) => { cum += v; const b = bud(c); return `<tr><th scope="row">${esc(c)}</th><td>${fmt.inr(v)}</td><td>${fmt.pct(v / tot * 100, 1)}</td><td>${fmt.inr(cum)}</td>${st.from === st.to ? `<td>${b === null ? '—' : fmt.inr(b) + (v > b ? ' <span class="warn-t">over</span>' : '')}</td>` : ''}</tr>`; }).join('')}<tr class="sep"><th>Total</th><td>${fmt.inr(tot)}</td><td>100%</td><td></td>${st.from === st.to ? '<td></td>' : ''}</tr></tbody></table></div></div></div>` : '<p class="muted">No expenses logged in this period. Add them in the Expense Log.</p>'}
      ${st.months.length > 1 ? `<h4>Month by month</h4><div class="table-scroll"><table class="data"><thead><tr><th>Month</th><th>Income</th><th>Spent</th><th>Saved</th><th>Rate</th><th>Net worth</th></tr></thead><tbody>${st.months.map((r) => (r.has ? `<tr><th scope="row">${label(r.m)}</th><td>${val(r.income)}</td><td>${val(r.expenses)}</td><td>${val(r.savings)}</td><td>${r.savings !== null && r.income > 0 ? fmt.pct(r.savings / r.income * 100, 0) : '—'}</td><td>${val(r.nw)}</td></tr>` : `<tr><th scope="row">${label(r.m)}</th><td colspan="5" class="muted">No data recorded</td></tr>`)).join('')}</tbody></table></div><p class="note">“—” means you did not record that figure. Nothing is estimated.</p>${st.months.filter((r) => r.has).length > 1 ? ch().bar({ title: 'Income vs spending by month', cats: st.months.filter((r) => r.has).map((r) => label(r.m)), series: [{ name: 'Income', data: st.months.filter((r) => r.has).map((r) => r.income || 0) }, { name: 'Spent', data: st.months.filter((r) => r.has).map((r) => r.expenses || 0) }], yfmt: 'inr' }) : ''}` : ''}
      ${Object.keys(st.byMode).length ? `<h4>How you paid</h4><div class="table-scroll"><table class="data"><tbody>${Object.entries(st.byMode).sort((a, b) => b[1] - a[1]).map(([k, v]) => `<tr><th scope="row">${esc(k)}</th><td>${fmt.inr(v)}</td><td>${fmt.pct(v / (tot || 1) * 100, 0)}</td></tr>`).join('')}</tbody></table></div>` : ''}
      ${st.tx.length ? `<details class="card"><summary><b>All ${st.tx.length} transactions</b></summary><div class="table-scroll"><table class="data"><thead><tr><th>Date</th><th>Category</th><th>Amount</th><th>Paid by</th><th>Note</th></tr></thead><tbody>${st.tx.slice(0, 500).map((e) => `<tr><td>${esc(e.date)}</td><td>${esc(e.cat)}</td><td>${fmt.inr(+e.amount)}</td><td>${esc(e.mode || '')}</td><td>${esc(e.note || '')}</td></tr>`).join('')}</tbody></table></div></details>` : ''}</article>`;
  }

  FOS.tools.statement = function (root) {
    const now = new Date(), cats = [...new Set(store.get().expenses.map((e) => e.cat))].sort(), last = prevKey(now);
    root.innerHTML = `<div class="card"><h3>Monthly statement — where did my money go?</h3><div class="fields"><div class="field"><label>From<input class="input" type="month" id="st-f" value="${last}"></label></div><div class="field"><label>To<input class="input" type="month" id="st-t" value="${last}"></label></div><div class="field"><label>Category<select class="input" id="st-c"><option value="">All categories</option>${cats.map((c) => `<option>${esc(c)}</option>`).join('')}</select></label></div></div>
      <div class="chips" id="st-pre"><button class="chip" data-p="this">This month</button><button class="chip" data-p="last">Last month</button><button class="chip" data-p="3">Last 3 months</button><button class="chip" data-p="6">Last 6 months</button><button class="chip" data-p="12">Last 12 months</button><button class="chip" data-p="fy">This financial year</button><button class="chip" data-p="year">This calendar year</button></div></div>
      <div id="st-out"></div><div class="row-actions no-print"><button class="btn primary" id="st-print">Print / Save as PDF</button><button class="btn" id="st-html">Download slip (HTML)</button><button class="btn" id="st-csv">Download transactions (CSV)</button><a class="btn ghost" href="#/tool/monthend">Month-end close</a></div>`;
    const g = (id) => root.querySelector(id);
    const draw = () => { const f = g('#st-f').value || last, t = g('#st-t').value || f, c = g('#st-c').value, st = FOS.statement(f, t, c); g('#st-out').innerHTML = slipHTML(st, c); root._st = st; };
    g('#st-pre').onclick = (e) => {
      const p = e.target.dataset.p; if (!p) return; const cur = curKey(now), y = now.getFullYear(), fyStart = now.getMonth() >= 3 ? y : y - 1;
      const back = (n) => { const d = new Date(y, now.getMonth() - n, 1); return keyOf(d.getFullYear(), d.getMonth()); };
      const map = { this: [cur, cur], last: [last, last], 3: [back(3), last], 6: [back(6), last], 12: [back(12), last], fy: [fyStart + '-04', cur], year: [y + '-01', cur] };
      [g('#st-f').value, g('#st-t').value] = map[p]; draw();
    };
    root.oninput = (e) => { if (e.target.closest('.fields')) draw(); };
    g('#st-print').onclick = () => window.print();
    g('#st-html').onclick = () => U.download('money-statement-' + g('#st-f').value + '.html', `<!doctype html><meta charset="utf-8"><title>Money statement</title><style>body{font:15px system-ui;max-width:860px;margin:2rem auto;padding:0 1rem}table{border-collapse:collapse;width:100%;margin:.5rem 0 1rem}th,td{border:1px solid #ccc;padding:6px 8px;text-align:left}.kpis{display:flex;gap:1rem;flex-wrap:wrap}.kpi{border:1px solid #ccc;padding:.6rem 1rem;border-radius:8px}.kpi b{display:block;font-size:1.2rem}svg{max-width:220px}</style>` + g('#st-out').innerHTML, 'text/html');
    g('#st-csv').onclick = () => { if (!root._st || !root._st.tx.length) return U.toast('No transactions in this period.'); U.download('transactions-' + g('#st-f').value + '.csv', FOS.statementCSV(root._st), 'text/csv'); };
    draw();
  };

  /* ---------- month-end close ---------- */
  FOS.tools.monthend = function (root) {
    const now = new Date(); let month = now.getDate() <= 10 ? prevKey(now) : curKey(now);
    const draw = () => {
      const s = store.get(), facts = FOS.monthFacts(month), rec = s.months[month] || {}, snap = facts.snapshot;
      root.innerHTML = `<div class="card"><h3>Month-end close — ${esc(label(month))}</h3><p class="muted">Four quick steps, about two minutes. Doing this each month is what builds your history, statements and trends.</p>
        <div class="fields"><div class="field"><label>Month<input class="input" type="month" id="me-m" value="${month}"></label></div></div>
        <h4>1 · Income you actually received</h4><div class="fields"><div class="field"><label>Total income this month (₹)<input class="input" id="me-inc" type="number" min="0" step="any" value="${esc(rec.income === undefined ? '' : rec.income)}" placeholder="enter what you received"></label></div></div>
        <h4>2 · Expenses</h4><p>${facts.count ? `<b>${facts.count}</b> entries logged, totalling <b>${fmt.inr(facts.expenses)}</b>.` : '<span class="warn-t">Nothing logged for this month.</span>'} <a href="#/tool/expenses">Open the Expense Log</a> to add or correct entries.</p>
        <h4>3 · Balances today</h4><p class="muted">Update what you hold and owe (bank, investments, loans, card dues).</p><div class="grid-2"><div id="me-a"></div><div id="me-l"></div></div>
        <h4>4 · Save and view</h4><div class="row-actions"><button class="btn primary" id="me-save">Save ${esc(label(month))} and create snapshot</button><a class="btn" href="#/tool/statement">View statement</a></div>${snap ? `<p class="status ok">✓ ${esc(label(month))} is closed (net worth ${fmt.inr(snap.nw)}). Saving again updates it.</p>` : ''}
        <h4>Never forget</h4><p class="muted">A website cannot message you while it is closed. Download a recurring calendar reminder for the last day of every month, and this page will also remind you when you open the app.</p><div class="row-actions"><button class="btn" id="me-ics">Download monthly calendar reminder (.ics)</button></div></div>`;
      const nwRow = (list) => ({ list: (st2) => list(st2), onChange: () => {} });
      FOS.crud(root.querySelector('#me-a'), { list: (st2) => st2.assets, addLabel: 'Add asset', empty: 'No assets yet.', cols: [{ k: 'name', label: 'Asset', type: 'text' }, { k: 'cat', label: 'Type', type: 'select', options: ['Cash', 'Bank', 'FD', 'RD', 'Investments', 'Gold', 'Property', 'Vehicle', 'Emergency Fund', 'Other'] }, { k: 'value', label: 'Value ₹', type: 'money' }], blank: () => ({ name: '', cat: 'Bank', value: '' }) });
      FOS.crud(root.querySelector('#me-l'), { list: (st2) => st2.liabilities, addLabel: 'Add liability', empty: 'No loans or dues.', cols: [{ k: 'name', label: 'Liability', type: 'text' }, { k: 'cat', label: 'Type', type: 'select', options: ['Credit card', 'Personal loan', 'Vehicle loan', 'Home loan', 'Education loan', 'Other'] }, { k: 'value', label: 'Outstanding ₹', type: 'money' }, { k: 'emi', label: 'EMI ₹', type: 'money' }], blank: () => ({ name: '', cat: 'Personal loan', value: '', emi: '' }) });
      root.querySelector('#me-m').onchange = (e) => { month = e.target.value || month; draw(); };
      root.querySelector('#me-save').onclick = () => {
        const v = root.querySelector('#me-inc').value;
        store.update((s2) => { s2.months[month] = Object.assign({}, s2.months[month], { income: v === '' ? '' : Math.max(0, parseFloat(v) || 0) }); });
        FOS.saveSnapshot(month); U.toast(label(month) + ' saved'); draw();
      };
      root.querySelector('#me-ics').onclick = () => U.download('finance-os-month-end.ics', FOS.monthEndICS(), 'text/calendar');
    };
    draw();
  };

  /* ---------- month-end notice + calendar reminder ---------- */
  FOS.monthNotice = function (now) {
    now = now || new Date(); const s = store.get(), m = FOS.metrics();
    if (!(m.income > 0 || s.assets.length || s.expenses.length)) return null;
    if (s.meta.monthSnooze && now < new Date(s.meta.monthSnooze)) return null;
    const p = prevKey(now); if (s.snapshots.some((x) => x.date === p)) return null;
    return { key: p, text: `${label(p)} is not closed yet. Add last month's expenses, update your balances and save it — about two minutes.` };
  };
  FOS.monthEndICS = function (now) {
    now = now || new Date(); const pad = (n) => String(n).padStart(2, '0'), last = new Date(now.getFullYear(), now.getMonth() + 1, 0), ds = last.getFullYear() + pad(last.getMonth() + 1) + pad(last.getDate()) + 'T090000', stamp = now.toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z';
    const site = (typeof location !== 'undefined' && /^https?:/.test(location.href)) ? location.href.split('#')[0] : 'your Finance OS page';
    return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Finance OS//Month end//EN', 'BEGIN:VEVENT', 'UID:finance-os-month-end@local', 'DTSTAMP:' + stamp, 'DTSTART:' + ds, 'DTEND:' + ds.replace('090000', '093000'), 'RRULE:FREQ=MONTHLY;BYMONTHDAY=-1', 'SUMMARY:Finance OS - close the month', 'DESCRIPTION:Log this month\'s expenses, update balances and save the snapshot. Open ' + site + '#/tool/monthend', 'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:Close the month in Finance OS', 'TRIGGER:PT0S', 'END:VALARM', 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
  };
})();
