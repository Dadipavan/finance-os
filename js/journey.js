/* ==========================================================================
   journey.js — "My Journey": your money life as CHAPTERS.
   · One chapter is LIVE (the one every screen and calculator uses). It has a start date.
   · When life changes you can start a NEW chapter: the old one is closed with an end date and saved as plain, readable lines
     (income, spending, loans, net worth, goals, what changed) plus your own note. Closed chapters stay readable but never feed today's numbers.
   · Everything you have entered carries forward into the new chapter — you only edit what changed.
   Closed chapters are part of your export and Google Drive sync (storage.js / sync.js).
   ========================================================================== */
(function () {
  'use strict';
  const U = FOS.ui, esc = U.esc, store = FOS.store, D = FOS.dates, inr = (v) => FOS.fmt.inr(v), n = (x) => (Number.isFinite(+x) ? +x : 0);
  const J = FOS.journey = {};
  const ISO = /^\d{4}-\d{2}-\d{2}$/;
  const today = () => D.iso(new Date());
  const days = (a, b) => Math.max(0, Math.round((D.parse(b) - D.parse(a)) / 86400000));
  const long = (iso) => { try { return D.parse(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }); } catch (e) { return iso; } };
  const span = (d) => (d < 45 ? d + ' days' : d < 700 ? Math.round(d / 30.44) + ' months' : (d / 365.25).toFixed(1) + ' years');

  // the day the live chapter began: what you saved, else the earliest record the app can find, else today
  function guessStart(s) {
    const c = [];
    (s.snapshots || []).forEach((x) => { if (/^\d{4}-\d{2}/.test(x.date)) c.push(x.date.slice(0, 7) + '-01'); });
    (s.expenses || []).forEach((x) => { if (ISO.test(String(x.date || ''))) c.push(x.date); });
    c.sort();
    return c[0] && c[0] <= today() ? c[0] : today();
  }
  J.current = function () {
    const s = store.get(), j = s.journey || (s.journey = { start: '', title: '', note: '' });
    if (!ISO.test(j.start || '')) { const start = guessStart(s); store.update((st) => { st.journey = Object.assign({ title: '', note: '' }, st.journey, { start }); }, { touch: false }); return Object.assign({}, store.get().journey); }
    return Object.assign({ title: '', note: '' }, j);
  };
  J.closed = () => [...(store.get().chapters || [])].sort((a, b) => (a.start < b.start ? -1 : a.start > b.start ? 1 : (a.no || 0) - (b.no || 0)));
  const nextNo = () => J.closed().reduce((m, c) => Math.max(m, c.no || 0), 0) + 1;

  // a frozen copy of the facts that matter, taken from the live data
  J.facts = function () {
    const s = store.get(), m = FOS.metrics();
    return {
      income: Math.round(m.income), expenses: Math.round(m.expenses), savings: Math.round(m.savings), savingsRate: Number.isFinite(m.savingsRate) ? Math.round(m.savingsRate * 10) / 10 : null,
      assets: Math.round(m.assets), liabilities: Math.round(m.liabilities), netWorth: Math.round(m.netWorth), emi: Math.round(m.emi), efMonths: Number.isFinite(m.efMonths) ? Math.round(m.efMonths * 10) / 10 : null,
      loans: s.liabilities.filter((l) => !l.sample).map((l) => ({ name: String(l.name || 'Loan'), owed: Math.round(n(l.value)), emi: Math.round(n(l.emi)), rate: l.rate === undefined || l.rate === '' ? null : n(l.rate) })),
      assetList: s.assets.filter((a) => !a.sample).map((a) => ({ name: String(a.name || 'Asset'), cat: String(a.cat || ''), value: Math.round(n(a.value)) })),
      goals: s.goals.filter((g) => !g.sample).map((g) => ({ name: String(g.name || 'Goal'), target: Math.round(n(g.target)), saved: Math.round(n(g.current)) }))
    };
  };
  const pctChange = (a, b) => (a > 0 ? (b - a) / a * 100 : null);
  const moved = (label, a, b) => {
    if (a === b) return label + ' stayed at ' + inr(b) + '.';
    const p = pctChange(a, b);
    return label + ' went ' + (b > a ? 'up' : 'down') + ' from ' + inr(a) + ' to ' + inr(b) + (p === null ? '' : ' (' + (p > 0 ? '+' : '') + p.toFixed(0) + '%)') + '.';
  };
  // plain-English lines describing a chapter; `prev` is the chapter before it (or null)
  J.lines = function (f, start, end, prev) {
    const L = [];
    L.push('This chapter ran from ' + long(start) + ' to ' + long(end) + ' (' + span(days(start, end)) + ').');
    if (f.income || f.expenses) L.push('Monthly income was ' + inr(f.income) + ' and spending ' + inr(f.expenses) + ', leaving ' + inr(f.savings) + (f.savingsRate !== null ? ' (' + f.savingsRate + '% of income saved).' : '.'));
    L.push('You owned ' + inr(f.assets) + ', owed ' + inr(f.liabilities) + ', so your net worth was ' + inr(f.netWorth) + '.');
    if (prev && prev.facts) {
      const p = prev.facts;
      if (p.income !== f.income && (p.income || f.income)) L.push(moved('Income', p.income, f.income));
      if (p.expenses !== f.expenses && (p.expenses || f.expenses)) L.push(moved('Spending', p.expenses, f.expenses));
      L.push(moved('Net worth', p.netWorth, f.netWorth));
      const had = new Set((p.loans || []).map((l) => l.name.toLowerCase())), now = new Set(f.loans.map((l) => l.name.toLowerCase()));
      const cleared = (p.loans || []).filter((l) => !now.has(l.name.toLowerCase())).map((l) => l.name), added = f.loans.filter((l) => !had.has(l.name.toLowerCase())).map((l) => l.name);
      if (cleared.length) L.push('Loans or dues no longer on the list: ' + cleared.join(', ') + '.');
      if (added.length) L.push('New loans or dues: ' + added.join(', ') + '.');
    }
    if (f.loans.length) {
      L.push('Loans and dues at the end: ' + f.loans.map((l) => l.name + ' — owed ' + inr(l.owed) + (l.emi ? ', EMI ' + inr(l.emi) : '') + (l.rate !== null ? ', ' + l.rate + '%' : '')).join('; ') + '.');
      if (f.income > 0) L.push('Monthly EMIs came to ' + inr(f.emi) + ', which is ' + (f.emi / f.income * 100).toFixed(0) + '% of income.');
    } else L.push('You had no loans or dues recorded.');
    if (f.efMonths !== null && f.expenses > 0) L.push('Your emergency money covered about ' + f.efMonths + ' months of spending.');
    f.goals.forEach((g) => L.push('Goal “' + g.name + '”: ' + inr(g.saved) + ' saved of ' + inr(g.target) + (g.target > 0 ? ' (' + Math.min(100, Math.round(g.saved / g.target * 100)) + '%).' : '.')));
    return L;
  };

  // close the live chapter on `end`, keep it as readable lines, and open the next one (everything carries forward)
  J.close = function (o) {
    const cur = J.current(), end = ISO.test(o.end || '') ? o.end : today();
    if (!(D.parse(end) && end >= cur.start)) throw new Error('The end date must be on or after the start date (' + long(cur.start) + ').');
    if (end > today()) throw new Error('The end date cannot be in the future.');
    const sorted = J.closed(), prev = sorted[sorted.length - 1] || null, f = J.facts(), no = nextNo();
    const rec = { id: store.uid(), no, title: cur.title || 'Chapter ' + no, start: cur.start, end, facts: f, lines: J.lines(f, cur.start, end, prev), note: String(o.note || cur.note || '').slice(0, 2000), closedAt: new Date().toISOString() };
    store.update((s) => {
      s.chapters = (s.chapters || []).concat([rec]);
      s.journey = { start: end, title: String(o.title || '').slice(0, 80) || 'Chapter ' + (no + 1), note: '' };
    });
    return rec;
  };

  /* ---------------- the page ---------------- */
  FOS.ABOUT.tool.journey = ['Your money life in chapters: the current chapter is live; every earlier one is saved as readable lines you can open any time.', 'Start a new chapter when something big changes — a new salary, a new loan, a loan cleared, a move or a new goal. Everything you entered carries forward.'];

  const factRows = (f) => `<div class="res-grid">${[['Monthly income', inr(f.income)], ['Monthly spending', inr(f.expenses)], ['Net worth', inr(f.netWorth)], ['Loan EMIs a month', inr(f.emi)]].map(([a, b]) => `<div class="res"><span>${esc(a)}</span><b>${esc(b)}</b></div>`).join('')}</div>`;
  const sensitive = (v) => { if (U.looksSensitive(v)) { U.toast(U.SENSITIVE_MSG); return true; } return false; };

  FOS.tools.journey = function (root) {
    function draw() {
      const cur = J.current(), f = J.facts(), list = J.closed(), age = days(cur.start, today());
      const rows = list.concat([{ no: '', title: cur.title || 'Chapter ' + nextNo() + ' (current)', start: cur.start, end: '', facts: f, live: true }]);
      root.innerHTML = `
        <div class="card"><div class="between"><h3>Current chapter <span class="pill good">live</span></h3><span class="muted">${esc(span(age))} so far</span></div>
          <div class="fields">
            <div class="field"><label for="jr-title">Chapter name</label><input class="input" id="jr-title" maxlength="80" value="${esc(cur.title)}" placeholder="Chapter ${nextNo()}"></div>
            <div class="field"><label for="jr-start">Started on</label><input class="input" id="jr-start" type="date" max="${today()}" value="${esc(cur.start)}"><small class="hint">Taken from when you began; change it if your journey really started earlier.</small></div>
            <div class="field wide"><label for="jr-note">Notes for this chapter (optional)</label><textarea class="input" id="jr-note" rows="2" maxlength="2000" placeholder="What is going on in this phase of your life?">${esc(cur.note)}</textarea></div>
          </div>
          ${factRows(f)}
          <p class="note">These are your live numbers — the dashboard and every calculator use them. Edit them in <a href="#/tool/snapshot">Snapshot</a>, <a href="#/tool/budget">Budget</a> or <a href="#/m/networth">Net worth</a>.</p>
          <div class="row-actions"><button class="btn primary" id="jr-new">Something changed — start a new chapter</button></div></div>
        ${list.length ? `<div class="card"><h3>How the chapters compare</h3><div class="table-scroll"><table class="data"><thead><tr><th scope="col">Chapter</th><th scope="col">Period</th><th scope="col">Income / mo</th><th scope="col">Spending / mo</th><th scope="col">EMIs / mo</th><th scope="col">Net worth</th></tr></thead><tbody>${rows.map((c) => `<tr><th scope="row">${esc(c.title)}</th><td>${esc(long(c.start))} – ${c.live ? 'now' : esc(long(c.end))}</td><td>${esc(inr(c.facts.income))}</td><td>${esc(inr(c.facts.expenses))}</td><td>${esc(inr(c.facts.emi))}</td><td>${esc(inr(c.facts.netWorth))}</td></tr>`).join('')}</tbody></table></div></div>` : ''}
        <div class="card"><h3>Earlier chapters</h3>${list.length ? '<p class="muted">Closed chapters are frozen. Open one to read what happened. You can still add your own words to the note.</p>' : '<p class="muted">Nothing here yet. When you close the current chapter it will appear here, with an end date and the lines of what happened.</p>'}
          ${[...list].reverse().map((c) => `<details class="gsec" data-ch="${esc(c.id)}"><summary><b>${esc(c.title)}</b> · ${esc(long(c.start))} – ${esc(long(c.end))}</summary>
            <ul>${(c.lines || []).map((l) => `<li>${esc(l)}</li>`).join('')}</ul>
            <div class="field"><label>Your note on this chapter</label><textarea class="input" rows="2" maxlength="2000" data-cnote="${esc(c.id)}">${esc(c.note || '')}</textarea></div></details>`).join('')}</div>`;
    }
    draw();

    root.addEventListener('change', (e) => {
      const t = e.target;
      if (t.id === 'jr-title' || t.id === 'jr-note') { if (sensitive(t.value)) { t.value = ''; return; } const base = J.current(); store.update((s) => { s.journey = Object.assign({}, base, { [t.id === 'jr-title' ? 'title' : 'note']: t.value.slice(0, t.id === 'jr-title' ? 80 : 2000) }); }); }
      else if (t.id === 'jr-start') {
        const v = t.value, last = J.closed().pop();
        if (!ISO.test(v) || v > today()) { U.toast('Choose a start date that is not in the future.'); draw(); return; }
        if (last && v < last.end) { U.toast('This chapter cannot start before the previous one ended (' + long(last.end) + ').'); draw(); return; }
        const base = J.current(); store.update((s) => { s.journey = Object.assign({}, base, { start: v }); }); draw();
      } else if (t.dataset.cnote) {
        if (sensitive(t.value)) { t.value = ''; return; }
        store.update((s) => { const c = (s.chapters || []).find((x) => x.id === t.dataset.cnote); if (c) c.note = t.value.slice(0, 2000); });
      }
    });

    root.addEventListener('click', (e) => {
      if (!e.target.closest('#jr-new')) return;
      J.dialog({ onUpdate: () => { location.hash = '#/tool/snapshot'; }, onNew: draw });
    });
  };

  // The choice that appears whenever you start your journey again (and from the button on the My Journey page):
  // update the current chapter, or close it with an end date and begin a new one. opts.onUpdate / opts.onNew run afterwards.
  J.dialog = function (opts) {
    const cur = J.current();
    const box = U.modal('Your journey has changed?', `<p>You started <b>${esc(cur.title || 'your current chapter')}</b> on ${esc(long(cur.start))}. Pick what fits:</p>
      <div class="sheet-actions"><button class="sheet-btn" data-a="update"><b>Update the current chapter</b><span>A correction or a small change. Keep the same chapter and edit the numbers.</span></button>
      <button class="sheet-btn" data-a="new"><b>Start a new chapter</b><span>A real change (new salary, new loan, loan cleared). The current chapter is closed with today as its end date and saved as readable lines you can read any time.</span></button></div>`);
    box.addEventListener('click', (ev) => {
      const b = ev.target.closest('[data-a]'); if (!b) return;
      if (b.dataset.a === 'update') { U.closeModal(); if (opts.onUpdate) opts.onUpdate(); return; }
      const f = J.facts(), prev = J.closed().pop();
      box.querySelector('.modal-body').innerHTML = `<p class="muted">Closing <b>${esc(cur.title || 'this chapter')}</b>, which started on ${esc(long(cur.start))}. Your income, loans, assets and goals all <b>carry forward</b> into the new chapter — you only change what is different.</p>
        <div class="fields"><div class="field"><label for="jn-end">This chapter ended on</label><input class="input" id="jn-end" type="date" min="${esc(cur.start)}" max="${today()}" value="${today()}"></div>
        <div class="field"><label for="jn-title">Name the new chapter</label><input class="input" id="jn-title" maxlength="80" placeholder="e.g. After the promotion"></div>
        <div class="field wide"><label for="jn-note">What changed? (saved with the closed chapter)</label><textarea class="input" id="jn-note" rows="2" maxlength="2000" placeholder="e.g. Salary went up, car loan cleared, new home loan started">${esc(cur.note)}</textarea></div></div>
        <h4>What will be saved for the closed chapter</h4><ul class="small">${J.lines(f, cur.start, today(), prev).map((l) => `<li>${esc(l)}</li>`).join('')}</ul>
        <div class="row-actions"><button class="btn primary" id="jn-go">Close it and start the new chapter</button><button class="btn ghost" id="jn-cancel">Cancel</button></div>`;
      box.querySelector('#jn-cancel').onclick = () => U.closeModal();
      box.querySelector('#jn-go').onclick = () => {
        const end = box.querySelector('#jn-end').value, title = box.querySelector('#jn-title').value, note = box.querySelector('#jn-note').value;
        if (sensitive(title) || sensitive(note)) return;
        try { J.close({ end, title, note }); } catch (err) { U.toast(err.message); return; }
        U.closeModal(); U.toast('Chapter saved. Now update what changed.'); if (opts.onNew) opts.onNew();
      };
    });
  };

  /* "Start my financial journey" (home page and dashboard) handles chapters by itself:
     first time → the chapter simply starts today; coming back with data → you are asked: update this chapter, or close it and begin a new one. */
  const startForm = FOS.onboarding;
  if (typeof startForm === 'function') {
    FOS.onboarding = function () {
      if (store.isDemo()) return startForm();
      const s = store.get(), returning = !!s.profile.onboarded && !s.profile.sampleSet && store.hasUserData();
      if (!returning) { if (!ISO.test((s.journey || {}).start || '')) store.update((st) => { st.journey = Object.assign({ title: '', note: '' }, st.journey, { start: today() }); }, { touch: false }); return startForm(); }
      J.dialog({ onUpdate: startForm, onNew: startForm });
    };
  }
})();
