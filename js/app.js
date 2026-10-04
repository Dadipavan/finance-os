/* ==========================================================================
   app.js — router, navigation, calculator engine, module pages, quizzes,
   glossary, library, settings, home.
   ========================================================================== */
(function () {
  'use strict';
  const U = FOS.ui, store = FOS.store, fmt = FOS.fmt, esc = U.esc, $ = U.$, $$ = U.$$, ch = FOS.charts;
  const main = () => $('#main');
  const NAV_EXTRA = [['Snapshot', '#/tool/snapshot'], ['Expense log', '#/tool/expenses'], ['Life ladder', '#/tool/ladder'], ['Business ideas', '#/tool/bizideas'], ['Reminders', '#/tool/reminders'], ['Records', '#/tool/records'], ['Life timeline', '#/tool/timeline'], ['Life simulator', '#/calc/lifesim'], ['Recurring expenses', '#/tool/recurring'], ['Purchase analyzer', '#/tool/purchase']];
  const modById = (id) => FOS.MODULES.find((m) => m.id === id);
  const modHref = (m) => m.route || '#/m/' + m.id;

  /* ---------------- settings → DOM ---------------- */
  function applySettings() {
    const s = store.get().settings, r = document.documentElement;
    r.dataset.theme = s.theme; r.dataset.text = s.textSize; r.dataset.contrast = s.contrast ? 'high' : 'normal'; r.dataset.motion = s.reduceMotion ? 'reduce' : 'full';
    $$('[data-theme-btn]').forEach((b) => { b.textContent = s.theme === 'dark' ? '☀' : '☾'; b.setAttribute('aria-label', s.theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'); });
  }

  /* ---------------- navigation ---------------- */
  const isPhone = () => !!(window.matchMedia && window.matchMedia('(max-width: 980px)').matches);
  function buildNav() {
    const groups = []; FOS.MODULES.forEach((m, i) => { let g = groups.find((x) => x.n === m.grp); if (!g) { g = { n: m.grp, items: [] }; groups.push(g); } g.items.push([m, i + 1]); });
    const link = (m, n) => `<a href="${modHref(m)}" data-nav="${m.id}"><i>${n}</i><span>${esc(m.title)}</span></a>`;
    $('#nav').innerHTML = `<div class="drawer-head"><b>Menu</b><button class="icon-btn" data-theme-btn aria-label="Toggle dark mode">☾</button><button class="icon-btn" id="drawer-close" aria-label="Close menu">✕</button></div>`
      + groups.map((g) => `<details class="nav-group" data-g="${esc(g.n)}" ${isPhone() && !['Start', 'Foundations'].includes(g.n) ? '' : 'open'}><summary><h3>${esc(g.n)}</h3></summary>${g.items.map(([m, n]) => link(m, n)).join('')}</details>`).join('')
      + `<details class="nav-group" ${isPhone() ? '' : 'open'}><summary><h3>My space</h3></summary>${NAV_EXTRA.map(([t, h]) => `<a href="${h}" data-nav-h="${h}"><i>•</i><span>${esc(t)}</span></a>`).join('')}</details>`;
  }
  function markNav() {
    const h = location.hash.split('?')[0] || '#/home';
    $$('#nav a').forEach((a) => { const on = a.getAttribute('href') === h || (a.dataset.nav && (h === '#/m/' + a.dataset.nav || h === '#/tool/' + (modById(a.dataset.nav) || {}).tool)); if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
    if (isPhone()) { const act = $('#nav a[aria-current="page"]'); if (act && act.closest) { const d = act.closest('details'); if (d) d.open = true; } }
    $$('.bn a').forEach((a) => a.classList.toggle('on', a.getAttribute('href') === h));
  }

  /* ---------------- router ---------------- */
  function parse() {
    const raw = (location.hash || '#/home').slice(1), [path, qs] = raw.split('?'), seg = path.split('/').filter(Boolean), q = {};
    (qs || '').split('&').forEach((p) => { const [k, v] = p.split('='); if (k) q[k] = decodeURIComponent(v || ''); });
    return { seg, q };
  }
  function page(title, html, after) {
    document.title = title + ' · Finance OS';
    main().innerHTML = html; if (after) after(main());
    window.scrollTo(0, 0); const h = $('h1', main()); if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); }
    const live = $('#live'); if (live) live.textContent = 'Opened ' + title;
    if (isPhone()) $$('details.about', main()).forEach((d) => { d.open = false; });
    markNav(); document.body.classList.remove('nav-open', 'search-open');
  }
  FOS.route = function () {
    if (store.isLocked()) return;
    const { seg, q } = parse(), r = seg[0] || 'home';
    try {
      if (r === 'home') return home();
      if (r === 'dashboard') return toolPage('dashboard', 'My Money Dashboard', 'Everything you have, owe, earn and spend — in one calm view.');
      if (r === 'm') return modulePage(seg[1], q);
      if (r === 'calc') return calcPage(seg[1]);
      if (r === 'tool') { const m = FOS.MODULES.find((x) => x.tool === seg[1]); return m ? modulePage(m.id, q) : toolPage(seg[1], ({ snapshot: 'My Financial Snapshot', reminders: 'Reminders', records: 'Records', timeline: 'Life Timeline', recurring: 'Recurring Expense Auditor', purchase: 'Purchase Analyzer' })[seg[1]] || 'Tool'); }
      if (r === 'calculators') return library();
      if (r === 'help') return page('Help', '<h1 class="ph">How to use Finance OS</h1>' + FOS.helpHTML(), () => { if (q.s) FOS.openHelpSection(q.s); });
      if (r === 'guide') { const g = FOS.GUIDES.find((x) => x.id === seg[1]); if (!g) return toolPage('guides', 'Expert Guides', ''); return page(g.title, FOS.guideHTML(g), (el) => FOS.guideAfter(g, el)); }
      if (r === 'sources') return toolPage('sources', 'Data & Sources', 'Official links for every number, and the update centre that recalculates the whole app.');
      if (r === 'glossary') return glossary(q.t);
      if (r === 'reports') return page('My Reports', '<h1 class="ph">My Reports</h1>' + FOS.aboutHTML('page', 'reports') + '<div id="rep"></div>', () => FOS.renderReports($('#rep')));
      if (r === 'settings') return settings();
      if (r === 'search') { const term = decodeURIComponent(seg.slice(1).join('/')); return page('Search: ' + term, `<h1 class="ph">Search results for “${esc(term)}”</h1><div class="card">${FOS.searchHTML(term)}</div>`); }
      return home();
    } catch (e) { console.error(e); page('Something went wrong', `<h1 class="ph">Something went wrong</h1><div class="card"><p>This page hit an unexpected error: <code>${esc(e.message)}</code>. Your data is safe in this browser.</p><a class="btn" href="#/home">Go home</a></div>`); }
  };

  // Navigate without rendering twice: setting the hash already triggers a render unless it is unchanged.
  FOS.go = (h) => { if ((location.hash || '') === h) FOS.route(); else location.hash = h; };
  const route0 = FOS.route;
  FOS.route = function () { route0(); if (!store.isLocked()) { try { FOS.renderNotices && FOS.renderNotices(); } catch (e) { /* notices are optional */ } } };

  function toolPage(id, title, blurb) {
    page(title, `<h1 class="ph">${esc(title)}</h1>${blurb ? `<p class="lead">${esc(blurb)}</p>` : ''}${FOS.aboutHTML('tool', id)}<div id="tool"></div>`, () => { const f = FOS.tools[id]; if (f) f($('#tool')); else $('#tool').innerHTML = '<p>Tool not found.</p>'; });
  }

  /* ---------------- home ---------------- */
  function home() {
    const m = FOS.metrics(), onboarded = store.get().profile.onboarded;
    page('Home', `<section class="hero"><div class="hero-in"><p class="eyebrow">Personal Finance Operating System · private, offline, free</p><h1>YOUR MONEY.<br>YOUR DECISIONS.<br>YOUR FUTURE.</h1><p class="sub">Understand money before money controls your life.</p>
      <ul class="verbs">${['Learn', 'Calculate', 'Compare', 'Plan', 'Protect', 'Grow'].map((v) => `<li>${v}</li>`).join('')}</ul>
      <p class="newhere"><b>Start here:</b> the first button asks ~15 optional questions (about 4 minutes) and builds your personal snapshot. <br>New here? <a href="#/help">Read the quick guide (first 10 minutes)</a> · <a href="#/help?s=phone">Install on your phone</a></p><div class="cta"><button class="btn primary lg" id="h-start">START MY FINANCIAL JOURNEY</button><a class="btn lg" href="#/dashboard">OPEN MONEY DASHBOARD</a><a class="btn lg" href="#/calculators">EXPLORE CALCULATORS</a><a class="btn lg" href="#/m/basics">LEARN FINANCE FROM ZERO</a></div></div></section>
      ${onboarded || m.income ? `<section class="card"><h2>Your snapshot</h2>${snapMini(m)}<a class="btn ghost" href="#/dashboard">Open full dashboard →</a></section>` : ''}
      <section class="card flow"><h2>How every decision should flow</h2><ol class="steps-flow">${['LEARN', 'UNDERSTAND', 'CALCULATE', 'COMPARE', 'CHECK RISKS', 'TAXES / FEES', 'OPPORTUNITY COST', 'LONG-TERM IMPACT', 'YOU DECIDE'].map((s) => `<li>${s}</li>`).join('')}</ol><p class="muted">Finance OS shows the facts, the full cost, the risks and the alternatives — and then gives you a clear verdict with the numbers behind it.</p></section>
      <section class="card"><h2>Your financial journey</h2><p class="muted">From a ₹50 purchase to financial independence. Each step opens the matching module.</p><ol class="journey">${FOS.JOURNEY.map(([t, mod], i) => `<li><a href="#/m/${mod}"><b>${i + 1}</b><span>${esc(t)}</span></a></li>`).join('')}</ol></section>
      <section class="grid-3">
        <a class="card feature" href="#/m/decision"><h3>Decision Engine</h3><p>WHAT ARE YOU ABOUT TO DO? Costs, fees, taxes, risks, worst case and alternatives — never a yes/no.</p></a>
        <a class="card feature" href="#/calc/oppcost"><h3>Opportunity Cost</h3><p>What could the same money become under hypothetical assumptions? Clearly labelled, never guaranteed.</p></a>
        <a class="card feature" href="#/m/scenarios"><h3>WHAT IF?</h3><p>Job loss, rate rise, inflation, a market fall — simulate the maths before life does.</p></a>
        <a class="card feature" href="#/m/health"><h3>Transparent health</h3><p>No mystery score. Every metric shows how it is calculated and where it falls short.</p></a>
        <a class="card feature" href="#/m/checklists"><h3>Checklists</h3><p>Before you pay, sign, borrow or invest. Interactive and saved locally.</p></a>
        <a class="card feature" href="#/m/scams"><h3>Scam Protection</h3><p>Spot ponzi, OTP, UPI and fake-app patterns with a quick checker.</p></a>
        <a class="card feature" href="#/m/suggestions"><h3>My Suggestions</h3><p>A prioritised to-do list from your own savings, spending and debts — tick items off as you go.</p></a>
        <a class="card feature" href="#/m/insights"><h3>My Money Review</h3><p>Your own numbers turned into observations, questions and ideas to earn and save more.</p></a>
        <a class="card feature" href="#/m/bizstart"><h3>Start a Business</h3><p>Practical steps: validate, numbers, structure, registrations, funding, taxes, first 90 days.</p></a>
        <a class="card feature" href="#/calc/afford"><h3>Can I afford it?</h3><p>Car 20/4/10, home, bike and phone guidelines — with the highest price that fits.</p></a></section>
      <section class="card quote"><p>You don't need to become a financial expert overnight. You need to understand the important numbers before making important decisions.</p></section>
      <p class="safety">🔒 Local-first: everything you enter stays in this browser. Never enter Aadhaar, PAN, account or card numbers, passwords, OTPs, PINs or CVVs.</p>`, (el) => { $('#h-start', el).onclick = FOS.onboarding; });
  }
  function snapMini(m) { return `<div class="kpis"><div class="kpi"><span>Income</span><b>${fmt.inr(m.income)}</b></div><div class="kpi"><span>Savings rate</span><b>${fmt.pct(m.savingsRate, 1)}</b></div><div class="kpi"><span>Emergency fund</span><b>${Number.isFinite(m.efMonths) ? fmt.months(m.efMonths) : fmt.inr(m.ef)}</b></div><div class="kpi hi"><span>Net worth</span><b>${fmt.inr(m.netWorth)}</b></div></div>`; }

  /* ---------------- module page ---------------- */
  function modulePage(id, q) {
    const m = modById(id); if (!m) return home();
    const lessons = FOS.LESSONS[id] || [], quiz = FOS.QUIZ[id] || [], pr = store.get().progress, idx = FOS.MODULES.indexOf(m) + 1;
    const calcs = m.calcs.map((c) => FOS.calcs[c]).filter(Boolean);
    const related = Object.values(FOS.calcs).filter((c) => c.module === id && !m.calcs.includes(c.id));
    const html = `<div class="crumb"><a href="#/home">Home</a> › <span>${esc(m.grp)}</span></div><header class="mod-head"><span class="mod-n">${idx}</span><div><h1 class="ph">${esc(m.title)}</h1><p class="lead">${esc(m.blurb)}</p>${m.lvl ? `<span class="pill info">Level ${m.lvl} — ${esc(FOS.LEVELS[m.lvl])}</span>` : ''}</div></header>
      ${FOS.guideFor && FOS.guideFor(id) ? `<a class="card guide-cta" href="#/guide/${FOS.guideFor(id).id}"><span class="gc-ic">📘</span><div><b>Expert guide: ${esc(FOS.guideFor(id).title)}</b><p>${esc(FOS.guideFor(id).summary.replace(/\*\*/g, ''))}</p><small>${esc(FOS.guideFor(id).read || '')} · types, documents to check, costs, traps and my recommendation →</small></div></a>` : ''}
      ${m.tool ? FOS.aboutHTML('tool', m.tool) + '<div id="tool"></div>' : ''}
      ${calcs.length || related.length ? `<section><h2>Calculators</h2><div class="cards">${calcs.concat(related).map((c) => calcCard(c)).join('')}</div></section>` : ''}
      ${lessons.length ? `<section><h2>Lessons</h2>${lessons.map((l, i) => lessonHTML(l, pr.lessons[l.id], q.l ? q.l === l.id : i === 0, m)).join('')}</section>` : ''}
      ${m.chk.length ? `<section><h2>Checklists</h2>${m.chk.map((k) => `<div class="card" id="chk-${k}"></div>`).join('')}</section>` : ''}
      ${quiz.length ? `<section><h2>Quiz</h2><div class="card" id="quiz"></div></section>` : ''}
`;
    page(m.title, html, (el) => {
      if (m.tool) FOS.tools[m.tool] ? FOS.tools[m.tool]($('#tool', el)) : ($('#tool', el).innerHTML = '');
      m.chk.forEach((k) => FOS.renderChecklist($('#chk-' + k, el), k));
      if (quiz.length) FOS.renderQuiz($('#quiz', el), id);
      el.onchange = (e) => { const b = e.target.closest('[data-read]'); if (b) { store.update((s) => { s.progress.lessons[b.dataset.read] = b.checked; }); U.toast(b.checked ? 'Lesson marked as read' : 'Marked unread'); } };
      if (q.l) { const t = $('#les-' + q.l, el); if (t) t.scrollIntoView(); }
    });
  }
  const calcCard = (c) => `<a class="card calc-card" href="#/calc/${c.id}"><small>${esc(c.group || '')}</small><h3>${esc(c.title)}</h3><p>${esc((c.intro || '').slice(0, 110))}${(c.intro || '').length > 110 ? '…' : ''}</p></a>`;
  function lessonHTML(l, read, open, m) {
    const list = (a) => `<ul>${a.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`;
    const calcs = m.calcs.slice(0, 3).map((c) => FOS.calcs[c]).filter(Boolean);
    return `<details class="lesson" id="les-${l.id}" ${open ? 'open' : ''}><summary><b>${esc(l.t)}</b>${read ? '<span class="pill good">Read ✓</span>' : ''}</summary>
      ${l.analogy ? `<blockquote class="analogy"><span>🧠 Analogy</span>${esc(l.analogy)}</blockquote>` : ''}
      <h4>Simple explanation</h4><p>${esc(l.simple)}</p><h4>Technical explanation</h4><p>${esc(l.tech)}</p><h4>Real-world example</h4><p class="example">${esc(l.ex)}</p>
      <h4>What it costs / what can go wrong</h4><p>${esc(l.risks)}</p><h4>What to check</h4>${list(l.check)}<h4>Common mistakes</h4>${list(l.mistakes)}
      ${calcs.length ? `<h4>Try the calculator</h4><p>${calcs.map((c) => `<a class="btn ghost sm" href="#/calc/${c.id}">${esc(c.title)}</a>`).join(' ')}</p>` : ''}
      <label class="check"><input type="checkbox" data-read="${l.id}" ${read ? 'checked' : ''}> Mark this lesson as read</label></details>`;
  }

  /* ---------------- calculator page + engine ---------------- */
  function calcPage(id) {
    const c = FOS.calcs[id]; if (!c) return library();
    const m = modById(c.module);
    page(c.title, `<div class="crumb"><a href="#/calculators">Calculators</a> › <span>${esc(c.group || '')}</span></div><h1 class="ph">${esc(c.title)}</h1><p class="lead">${esc(c.intro)}</p>${FOS.aboutHTML('calc', id)}${m ? `<p class="muted">Related module: <a href="${modHref(m)}">${esc(m.title)}</a></p>` : ''}<div id="calc"></div>`, () => FOS.renderCalc($('#calc'), id));
  }
  const FM = {
    inr: (v) => fmt.inr(v, Math.abs(v) < 100 && Math.abs(v % 1) > 0.004 ? 2 : 0), pct: (v) => fmt.pct(v, 2), num: (v) => fmt.num(v, Math.abs(v) < 100 ? 1 : 0), months: (v) => fmt.months(Math.round(v)),
    years: (v) => fmt.years(v), x: (v) => fmt.num(v, 1) + '×', yn: (v) => (v ? 'Yes' : 'No'), text: (v) => String(v)
  };
  const showVal = (f, v) => (f === 'text' ? String(v) : Number.isFinite(v) ? (FM[f] || FM.inr)(v) : '—');
  FOS.showVal = showVal;
  const UNIT = { money: ['₹', ''], pct: ['', '%'], yrs: ['', 'yrs'], mon: ['', 'mo'], num: ['', ''] };

  FOS.renderCalc = function (el, id, opts = {}) {
    const c = FOS.calcs[id]; if (!c) { el.innerHTML = '<p>Calculator not found.</p>'; return; }
    const vals = {}, resolve = (f) => (typeof f.def === 'function' ? f.def() : f.def);
    const resetVals = () => c.fields.forEach((f) => { vals[f.id] = resolve(f); });
    resetVals();
    const fieldHTML = (f) => {
      const v = vals[f.id];
      if (f.type === 'sel') return `<div class="field" data-field="${f.id}"><label for="in-${id}-${f.id}">${esc(f.label)}</label><select class="input" id="in-${id}-${f.id}" data-id="${f.id}">${f.options.map((o) => { const [a, b] = Array.isArray(o) ? o : [o, o]; return `<option value="${esc(a)}" ${String(a) === String(v) ? 'selected' : ''}>${esc(b)}</option>`; }).join('')}</select></div>`;
      const [pre, suf] = UNIT[f.type] || ['', ''];
      return `<div class="field" data-field="${f.id}"><label for="in-${id}-${f.id}">${esc(f.label)}</label><div class="inp">${pre ? `<span class="pre">${pre}</span>` : ''}<input class="input" id="in-${id}-${f.id}" type="number" inputmode="decimal" step="any" data-id="${f.id}" value="${v}">${suf ? `<span class="suf">${suf}</span>` : ''}</div><input class="slider" type="range" min="${f.min}" max="${Math.max(f.max, +v || 0)}" step="${f.step}" value="${v}" data-slide="${f.id}" aria-label="${esc(f.label)} slider"><div class="hint"></div><div class="err" role="alert"></div></div>`;
    };
    el.innerHTML = `<div class="calc"><section class="card calc-in" aria-label="Inputs"><div class="fields one">${c.fields.map(fieldHTML).join('')}</div><div class="row-actions"><button class="btn ghost" data-a="reset">↺ Reset</button></div><div class="mini-res" data-mini aria-hidden="true"></div></section>
      <section class="calc-out" aria-live="polite"><div class="res-sum"></div><div class="res-extra"></div>
      <div class="row-actions out-actions"><button class="btn" data-a="copy">Copy results</button><button class="btn" data-a="print">Print</button><button class="btn" data-a="download">Download summary</button><span class="sp"></span>${['A', 'B', 'C'].map((k) => `<button class="btn ghost" data-a="save" data-k="${k}">Save as ${k}</button>`).join('')}</div><div class="compare"></div></section></div>
      <section class="card formula-box"><h3>Formula &amp; assumptions</h3>${(c.formula || []).map((f) => `<pre class="formula">${esc(f)}</pre>`).join('')}${(c.vars || []).length ? `<ul>${c.vars.map((v) => `<li>${esc(v)}</li>`).join('')}</ul>` : ''}${(c.assumptions || []).length ? `<h4><span class="badge">ASSUMPTIONS</span></h4><ul>${c.assumptions.map((v) => `<li>${esc(v)}</li>`).join('')}</ul>` : ''}<p class="note">Projections use the assumptions listed above; change them and the result changes.</p></section>${FOS.exampleHTML ? FOS.exampleHTML(id) : ''}`;
    const sumEl = $('.res-sum', el), extraEl = $('.res-extra', el), cmpEl = $('.compare', el);
    let last = null, pending = 0, valid = true, tableOpen = false, lastTable = null, firstDraw = true;
    const tableHTML = (t) => `<div class="table-scroll"><table class="data"><thead><tr>${t.head.map((h) => `<th scope="col">${esc(h)}</th>`).join('')}</tr></thead><tbody>${t.rows.map((r) => `<tr>${r.map((cell, i) => (i === 0 ? `<th scope="row">${esc(cell)}</th>` : `<td>${esc(cell)}</td>`)).join('')}</tr>`).join('')}</tbody></table></div>`;

    const validate = () => {
      valid = true;
      c.fields.forEach((f) => {
        if (f.type === 'sel') return;
        const fe = $(`[data-field="${f.id}"]`, el), err = $('.err', fe), raw = vals[f.id]; let msg = '';
        if (raw === '' || raw === null || !Number.isFinite(+raw)) msg = 'Please enter a number.';
        else if (+raw < f.lo) msg = f.lo === 0 ? 'Value cannot be negative.' : `Enter at least ${fmt.num(f.lo, 2)}.`;
        else if (+raw > f.hi) msg = `Enter ${fmt.num(f.hi, 2)} or less.`;
        err.textContent = msg; fe.classList.toggle('bad', !!msg); if (msg) valid = false;
        const hint = $('.hint', fe); if (hint) hint.textContent = !msg && f.type === 'money' && +raw >= 1000 ? '= ' + fmt.short(+raw) : '';
      });
    };
    const numeric = () => { const v = {}; c.fields.forEach((f) => { const r = vals[f.id]; v[f.id] = f.type === 'sel' ? (r !== '' && !isNaN(+r) ? +r : r) : +r; }); return v; };

    function draw() {
      pending = 0; validate();
      if (!valid) { const mn = $('[data-mini]', el); if (mn) mn.innerHTML = '<div><span>Fix the highlighted input</span></div>'; sumEl.classList.add('dim'); if (!$('.invalid', sumEl)) sumEl.insertAdjacentHTML('afterbegin', '<p class="invalid status warn">Please fix the highlighted inputs to see results.</p>'); return; }
      sumEl.classList.remove('dim');
      let res; try { res = c.compute(numeric()) || {}; } catch (e) { console.error(e); sumEl.innerHTML = '<p class="status warn">These inputs could not be calculated. Try different values.</p>'; return; }
      last = res; const items = res.summary || [];
      const mini = $('[data-mini]', el), top = items.find((x) => x.hi) || items[0]; if (mini) mini.innerHTML = top ? `<div><span>${esc(top.l)}</span><b>${esc(showVal(top.f, top.v))}</b></div><a href="#" data-a="toresults">See all ↓</a>` : '';
      const same = $$('.res', sumEl).length === items.length && items.every((it, i) => $$('.res span', sumEl)[i] && $$('.res span', sumEl)[i].textContent === it.l);
      if (same) { $$('.res b', sumEl).forEach((b, i) => { const it = items[i]; if (it.f === 'text' || it.f === 'yn' || !Number.isFinite(it.v)) { b.textContent = showVal(it.f, it.v); b.dataset.val = ''; } else U.animate(b, it.v, (x) => showVal(it.f, x)); }); $$('.invalid', sumEl).forEach((x) => x.remove()); }
      else sumEl.innerHTML = `<div class="res-grid">${items.map((it) => `<div class="res ${it.hi ? 'hi' : ''}"><span>${esc(it.l)}</span><b data-val="${Number.isFinite(it.v) ? it.v : ''}">${esc(showVal(it.f, it.v))}</b></div>`).join('')}</div>`;
      let x = '';
      (res.charts || []).forEach((h) => { x += `<div class="card chart-card">${h}</div>`; });
      if (res.html) x += `<div class="card">${res.html}</div>`;
      lastTable = res.table || null;
      if (res.table) { const t = res.table; x += t.rows.length > 20 ? `<details class="card lazy" ${tableOpen ? 'open' : ''}><summary><b>${esc(res.tableTitle || 'Table')}</b> (${t.rows.length} rows — tap to expand)</summary><div class="lazy-body">${tableOpen ? tableHTML(t) : ''}</div></details>` : `<div class="card"><h4>${esc(res.tableTitle || 'Table')}</h4>${tableHTML(t)}</div>`; }
      if ((res.notes || []).length) x += `<div class="card notes">${res.notes.map((n) => `<p>${esc(n)}</p>`).join('')}</div>`;
      if ((res.actions || []).length) x += `<div class="row-actions">${res.actions.map((a, i) => `<button class="btn primary" data-a="act" data-i="${i}">${esc(a.label)}</button>`).join('')}</div>`;
      extraEl.innerHTML = x;
      if (firstDraw) { firstDraw = false; const co = $('.calc-out', el); if (co) co.classList.add('no-anim'); }
    }
    // a plain short timer (not requestAnimationFrame): rAF pauses in unfocused/hidden windows, which would leave results stale
    const schedule = () => { if (!pending) pending = setTimeout(draw, 16); };

    const textSummary = () => {
      const res = last || {}, lines = [c.title, new Date().toLocaleDateString('en-IN'), '', 'INPUTS'];
      c.fields.forEach((f) => lines.push(`${f.label}: ${f.type === 'money' ? fmt.inr(+vals[f.id]) : vals[f.id]}`));
      lines.push('', 'RESULTS'); (res.summary || []).forEach((s) => lines.push(`${s.l}: ${showVal(s.f, s.v)}`));
      (res.notes || []).forEach((n) => lines.push('Note: ' + n));
      lines.push('', 'FORMULA'); (c.formula || []).forEach((f) => lines.push(f));
      lines.push('', 'ASSUMPTIONS'); (c.assumptions || []).forEach((a) => lines.push('- ' + a));
      return lines.join('\n');
    };
    function drawCompare() {
      const saved = (store.get().calcSaved[id]) || {}, keys = Object.keys(saved).sort(); if (!keys.length) { cmpEl.innerHTML = ''; return; }
      const differs = (f) => keys.length === 1 || new Set(keys.map((k) => String(saved[k].values[f.id]))).size > 1;
      const inRows = c.fields.filter(differs).map((f) => `<tr><th scope="row">${esc(f.label)}</th>${keys.map((k) => `<td>${esc(f.type === 'money' ? fmt.inr(+saved[k].values[f.id]) : saved[k].values[f.id])}</td>`).join('')}</tr>`).join('');
      const first = saved[keys[0]].summary || [];
      const outRows = first.map((s, i) => `<tr><th scope="row">${esc(s.l)}</th>${keys.map((k) => `<td>${esc(((saved[k].summary || [])[i] || {}).t || '—')}</td>`).join('')}</tr>`).join('');
      cmpEl.innerHTML = `<div class="card"><div class="between"><h4>Scenario comparison</h4><button class="btn ghost sm" data-a="clear">Clear scenarios</button></div><div class="table-scroll"><table class="data"><thead><tr><th></th>${keys.map((k) => `<th>Scenario ${k} <button class="link" data-a="load" data-k="${k}">load</button></th>`).join('')}</tr></thead><tbody><tr class="sep"><th>Inputs</th><td colspan="${keys.length}"></td></tr>${inRows}<tr class="sep"><th>Results</th><td colspan="${keys.length}"></td></tr>${outRows}</tbody></table></div><p class="note">Each scenario is a hypothetical calculation — none is certain or recommended.</p></div>`;
    }
    const sync = (fid) => { const f = c.fields.find((x) => x.id === fid), fe = $(`[data-field="${fid}"]`, el); if (!f || f.type === 'sel') return; const n = $('[data-id]', fe), s = $('[data-slide]', fe); if (n && document.activeElement !== n) n.value = vals[fid]; if (s) { s.max = Math.max(f.max, +vals[fid] || 0); s.value = vals[fid]; const span = (+s.max - f.min) || 1; if (s.style && typeof s.style.setProperty === 'function') s.style.setProperty('--p', Math.max(0, Math.min(100, ((+vals[fid] - f.min) / span) * 100)) + '%'); } };

    el.addEventListener('input', (e) => {
      const t = e.target; if (t.dataset.id) { vals[t.dataset.id] = t.value; sync(t.dataset.id); schedule(); }
      else if (t.dataset.slide) { vals[t.dataset.slide] = t.value; const n = $(`[data-id="${t.dataset.slide}"]`, el); n.value = t.value; if (t.style && typeof t.style.setProperty === 'function') { const f = c.fields.find((x) => x.id === t.dataset.slide), span = (+t.max - f.min) || 1; t.style.setProperty('--p', Math.max(0, Math.min(100, ((+t.value - f.min) / span) * 100)) + '%'); } schedule(); }
    });
    el.addEventListener('toggle', (e) => { const d = e.target; if (!d || !d.classList || !d.classList.contains || !d.classList.contains('lazy')) return; tableOpen = !!d.open; if (d.open && lastTable) { const b = d.querySelector('.lazy-body'); if (b && !b.innerHTML) b.innerHTML = tableHTML(lastTable); } }, true);
    el.addEventListener('change', (e) => { const t = e.target; if (t.tagName === 'SELECT' && t.dataset.id) { vals[t.dataset.id] = t.value; schedule(); } });
    el.addEventListener('click', (e) => {
      const b = e.target.closest('[data-a]'); if (!b) return; const a = b.dataset.a;
      if (a === 'toresults') { e.preventDefault(); sumEl.scrollIntoView({ behavior: 'smooth', block: 'start' }); return; }
      if (a === 'reset') { resetVals(); c.fields.forEach((f) => { const fe = $(`[data-field="${f.id}"]`, el); if (f.type === 'sel') $('select', fe).value = vals[f.id]; else sync(f.id); }); c.fields.forEach((f) => sync(f.id)); draw(); U.toast('Inputs reset'); }
      if (a === 'copy') U.copy(textSummary());
      if (a === 'print') window.print();
      if (a === 'download') U.download(id + '-summary.txt', textSummary());
      if (a === 'save') { if (!valid || !last) return U.toast('Fix the inputs first.'); store.update((s) => { s.calcSaved[id] = s.calcSaved[id] || {}; s.calcSaved[id][b.dataset.k] = { values: Object.assign({}, vals), summary: (last.summary || []).map((x) => ({ l: x.l, t: showVal(x.f, x.v) })), at: Date.now() }; }); drawCompare(); U.toast('Saved as Scenario ' + b.dataset.k); }
      if (a === 'clear') { store.update((s) => { delete s.calcSaved[id]; }); drawCompare(); }
      if (a === 'load') { const sc = store.get().calcSaved[id][b.dataset.k]; Object.assign(vals, sc.values); c.fields.forEach((f) => { const fe = $(`[data-field="${f.id}"]`, el); if (f.type === 'sel') $('select', fe).value = vals[f.id]; else { $('[data-id]', fe).value = vals[f.id]; sync(f.id); } }); draw(); }
      if (a === 'act' && last && last.actions) { last.actions[+b.dataset.i].run(); }
      if (a === 'example' && FOS.exampleValues) { Object.assign(vals, FOS.exampleValues(id)); c.fields.forEach((f) => { const fe = $(`[data-field="${f.id}"]`, el); if (f.type === 'sel') $('select', fe).value = vals[f.id]; else { $('[data-id]', fe).value = vals[f.id]; sync(f.id); } }); draw(); window.scrollTo(0, 0); U.toast('Example loaded into the calculator'); }
    });
    c.fields.forEach((f) => sync(f.id)); draw(); drawCompare();
  };

  /* ---------------- quiz ---------------- */
  FOS.renderQuiz = function (el, modId) {
    const qs = FOS.QUIZ[modId], answered = {};
    const draw = () => {
      el.innerHTML = `<p class="muted">${qs.length} questions · you need 60% to pass · progress is saved on this device.</p>${qs.map((q, i) => `<div class="q" data-qi="${i}"><p><b>${i + 1}.</b> ${esc(q.q)}</p>${q.t === 'calc' ? `<input class="input" type="number" step="any" inputmode="decimal" aria-label="Your answer" ${answered[i] ? 'disabled' : ''}>` : q.o.map((o, k) => `<label class="opt"><input type="radio" name="q${i}" value="${k}" ${answered[i] ? 'disabled' : ''}> ${esc(o)}</label>`).join('')}<div class="row-actions"><button class="btn sm" data-check="${i}" ${answered[i] ? 'disabled' : ''}>Check answer</button></div><div class="fb" aria-live="polite"></div></div>`).join('')}<div id="qscore"></div>`;
    };
    draw();
    el.onclick = (e) => {
      const b = e.target.closest('[data-check]'); if (!b) return; const i = +b.dataset.check, q = qs[i], box = $(`[data-qi="${i}"]`, el); let ok = false, given;
      if (q.t === 'calc') { const v = parseFloat($('input', box).value); if (!Number.isFinite(v)) return U.toast('Enter a number first.'); ok = Math.abs(v - q.a) <= (q.tol || 0) + 1e-9; given = v; }
      else { const r = $('input:checked', box); if (!r) return U.toast('Select an answer first.'); given = +r.value; ok = given === q.a; }
      answered[i] = ok ? 1 : -1; b.disabled = true; $$('input', box).forEach((x) => { x.disabled = true; });
      const rel = q.rel && FOS.calcs[q.rel] ? `<a href="#/calc/${q.rel}">Related: ${esc(FOS.calcs[q.rel].title)}</a>` : '';
      $('.fb', box).innerHTML = `<div class="status ${ok ? 'ok' : 'bad'}"><b>${ok ? '✓ Correct' : '✗ Not quite'}</b><p>Correct answer: <b>${q.t === 'calc' ? fmt.num(q.a, 2) : esc(q.o[q.a])}</b></p><p>${esc(q.e)}</p>${ok ? '' : `<p><i>Why the other options are wrong:</i> ${esc(q.w)}</p>`}${q.t !== 'calc' && ok ? `<p><i>Other options:</i> ${esc(q.w)}</p>` : ''}<p>${rel}</p></div>`;
      if (Object.keys(answered).length === qs.length) {
        const score = Object.values(answered).filter((x) => x === 1).length; store.update((s) => { const p = s.progress.quiz[modId] || { best: 0, total: qs.length }; p.best = Math.max(p.best, score); p.total = qs.length; p.last = score; s.progress.quiz[modId] = p; });
        $('#qscore', el).innerHTML = `<div class="status ${score / qs.length >= 0.6 ? 'ok' : 'warn'}"><b>Score ${score}/${qs.length}</b> — ${score / qs.length >= 0.6 ? 'Passed. This counts towards your level.' : 'Below 60%. Review the lessons and try again.'} <button class="btn sm" data-retry>Try again</button></div>`;
      }
    };
    el.addEventListener('click', (e) => { if (e.target.hasAttribute('data-retry')) { Object.keys(answered).forEach((k) => delete answered[k]); draw(); } });
  };

  /* ---------------- calculator library ---------------- */
  function library() {
    const all = Object.values(FOS.calcs), groups = [...new Set(all.map((c) => c.group))];
    page('Calculator Library', `<h1 class="ph">Calculator Library</h1><p class="lead">${all.length} calculators. Every one shows its formula and assumptions, works offline, and never sends data anywhere.</p>${FOS.aboutHTML('page', 'calculators')}
      <div class="toolbar"><input class="input" id="lib-q" type="search" placeholder="Filter calculators… (e.g. loan, SIP, tax)" aria-label="Filter calculators"><div class="chips" id="lib-g"><button class="chip on" data-g="">All</button>${groups.map((g) => `<button class="chip" data-g="${esc(g)}">${esc(g)}</button>`).join('')}</div></div><div class="cards" id="lib-list"></div>`, (el) => {
      let g = '', qv = '';
      const draw = () => { const t = qv.toLowerCase(); $('#lib-list', el).innerHTML = all.filter((c) => (!g || c.group === g) && (!t || (c.title + c.tags + c.intro).toLowerCase().includes(t))).map(calcCard).join('') || '<p class="muted">No calculator matches.</p>'; };
      $('#lib-q', el).oninput = (e) => { qv = e.target.value; draw(); };
      $('#lib-g', el).onclick = (e) => { const b = e.target.closest('[data-g]'); if (!b) return; g = b.dataset.g; $$('#lib-g .chip', el).forEach((x) => x.classList.toggle('on', x === b)); draw(); };
      draw();
    });
  }

  /* ---------------- glossary ---------------- */
  function glossary(open) {
    const G = FOS.GLOSSARY.slice().sort((a, b) => a[0].localeCompare(b[0]));
    page('Glossary', `<h1 class="ph">Glossary</h1><p class="lead">${G.length} terms in plain English and technical form.</p>${FOS.aboutHTML('page', 'glossary')}<div class="toolbar"><input class="input" id="gl-q" type="search" placeholder="Search terms: APR, EMI, CAGR, SIP, NAV…" aria-label="Search glossary"></div><div id="gl-list"></div>`, (el) => {
      const draw = (t) => {
        const q = (t || '').toLowerCase(), list = G.filter((g) => !q || g.slice(0, 4).join(' ').toLowerCase().includes(q));
        $('#gl-list', el).innerHTML = list.map((g) => { const c = FOS.calcs[g[4]]; return `<details class="gl" id="gl-${esc(g[0].replace(/\W+/g, '_'))}" ${open && g[0] === open ? 'open' : ''}><summary><b>${esc(g[0])}</b> — ${esc(g[1])}</summary><dl><dt>Simple meaning</dt><dd>${esc(g[1])}</dd><dt>Technical meaning</dt><dd>${esc(g[2])}</dd><dt>Example</dt><dd>${esc(g[3])}</dd>${c ? `<dt>Related calculator</dt><dd><a href="#/calc/${c.id}">${esc(c.title)}</a></dd>` : ''}<dt>Related topics</dt><dd>${g[5].map((r) => `<a href="#/glossary?t=${encodeURIComponent(r)}">${esc(r)}</a>`).join(', ')}</dd></dl></details>`; }).join('') || '<p class="muted">No matching term.</p>';
        if (open) { const t2 = $('#gl-' + open.replace(/\W+/g, '_'), el); if (t2) t2.scrollIntoView(); }
      };
      $('#gl-q', el).oninput = (e) => { open = ''; draw(e.target.value); }; draw('');
    });
  }

  /* ---------------- settings ---------------- */
  function settings() {
    const s = store.get(), ov = s.overrides;
    const rateRow = (k, label, cur, def) => `<label class="rate-row"><span>${esc(label)}</span><input class="input mini" type="number" inputmode="decimal" step="0.05" min="0" data-ov="${k}" value="${ov[k] !== undefined && ov[k] !== '' ? ov[k] : ''}" placeholder="${def}"><small>default ${def}</small></label>`;
    page('Settings', `<h1 class="ph">Settings</h1>${FOS.aboutHTML('page', 'settings')}<nav class="jump" aria-label="Jump to a section">${[['sec-look', 'Appearance'], ['sec-install', 'Install'], ['sec-rates', 'Rates'], ['sec-gate', 'Access key'], ['sec-lock', 'Lock'], ['sec-sync', 'Drive'], ['sec-test', 'Test'], ['sec-data', 'My data']].map(([id, t]) => `<button class="chip" data-jump="${id}">${t}</button>`).join('')}</nav>
      <section class="card" id="sec-look"><h2>Appearance &amp; accessibility</h2><div class="fields">
        <div class="field"><label for="st-theme">Theme</label><select class="input" id="st-theme"><option value="light" ${s.settings.theme === 'light' ? 'selected' : ''}>Light</option><option value="dark" ${s.settings.theme === 'dark' ? 'selected' : ''}>Dark</option></select></div>
        <div class="field"><label for="st-text">Text size</label><select class="input" id="st-text"><option value="normal" ${s.settings.textSize === 'normal' ? 'selected' : ''}>Normal</option><option value="large" ${s.settings.textSize === 'large' ? 'selected' : ''}>Large</option><option value="xlarge" ${s.settings.textSize === 'xlarge' ? 'selected' : ''}>Extra large</option></select></div>
        <div class="field"><label class="check"><input type="checkbox" id="st-contrast" ${s.settings.contrast ? 'checked' : ''}> High contrast</label></div>
        <div class="field"><label class="check"><input type="checkbox" id="st-motion" ${s.settings.reduceMotion ? 'checked' : ''}> Reduce motion</label></div></div></section>
      <section class="card" id="sec-rates"><h2>Rates, tax rules &amp; limits</h2><p>Keep the numbers current from the official sites. Edit once; every calculator, lesson table and report recalculates.</p><div class="row-actions"><a class="btn primary" href="#/sources">Open Data &amp; Sources</a></div></section>
      <section class="card" id="sec-install"><h2>Install on your phone or computer</h2><p>Add Finance OS to your home screen so it opens like an app and works offline.</p><div class="row-actions"><button class="btn primary" data-install hidden>Install Finance OS</button></div><p class="note"><b>Android (Chrome):</b> menu ⋮ → Install app / Add to Home screen. <b>iPhone (Safari):</b> Share → Add to Home Screen. <b>Computer (Chrome/Edge):</b> the install icon in the address bar.</p></section>
      <section class="card" id="sec-gate"></section>
      <section class="card" id="sec-lock"></section>
      <section class="card" id="sec-sync"></section>
      <section class="card" id="sec-test"></section>
      <section class="card" id="sec-data"><h2>Your data — private and local</h2><p>Everything is stored in this browser (localStorage). Nothing is sent anywhere. Clearing browser data erases it, so export a backup now and then or turn on Google Drive sync. Current size: <b id="st-size"></b>.</p>
        <div class="row-actions"><button class="btn" id="st-export">Export my data (JSON)</button><label class="btn file">Import my data<input type="file" id="st-import" accept="application/json,.json" hidden></label><button class="btn ghost" id="st-sample">Load sample data</button>${FOS.hasSample && FOS.hasSample() ? '<button class="btn" id="st-sample-clear">Remove sample data</button>' : ''}<button class="btn danger" id="st-delete">Delete all my data</button></div></section>
      <section class="card"><h2>Privacy</h2><p>Everything is stored in this browser only and never sent anywhere. Export a backup regularly. Never type card or account numbers, passwords, OTPs, PINs or CVVs.</p></section>`, (el) => {
      U.$$('[data-install]', el).forEach((b) => { b.hidden = !FOS.installEvent; b.onclick = async () => { if (!FOS.installEvent) return; FOS.installEvent.prompt(); await FOS.installEvent.userChoice; FOS.installEvent = null; b.hidden = true; }; });
      if (FOS.renderGateSettings) FOS.renderGateSettings($('#sec-gate', el));
      FOS.renderLockSettings($('#sec-lock', el)); FOS.renderSyncSettings($('#sec-sync', el)); FOS.renderTestBox($('#sec-test', el));
      const sz = JSON.stringify(store.get()).length; $('#st-size', el).textContent = (sz / 1024).toFixed(0) + ' KB of about 5,000 KB available in this browser';
      U.$$('[data-jump]', el).forEach((b) => { b.onclick = () => { const t = document.getElementById(b.dataset.jump); if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }; });
      const set = (fn) => { store.update(fn); applySettings(); };
      $('#st-theme', el).onchange = (e) => set((st) => { st.settings.theme = e.target.value; });
      $('#st-text', el).onchange = (e) => set((st) => { st.settings.textSize = e.target.value; });
      $('#st-contrast', el).onchange = (e) => set((st) => { st.settings.contrast = e.target.checked; });
      $('#st-motion', el).onchange = (e) => set((st) => { st.settings.reduceMotion = e.target.checked; });
      $('#st-export', el).onclick = () => { U.download('finance-os-data-' + new Date().toISOString().slice(0, 10) + '.json', store.exportJSON(), 'application/json'); };
      $('#st-import', el).onchange = (e) => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = async () => { try { if (!confirm('Importing replaces the data currently in this browser. Continue?')) return; try { store.importJSON(r.result); } catch (err) { if (!err.needsPass) throw err; const p = prompt('This backup is encrypted. Enter its passphrase:'); if (!p) return; await store.importEncrypted(r.result, p); } applySettings(); U.toast('Data imported'); FOS.go('#/dashboard'); } catch (err) { U.toast(err.message); } }; r.readAsText(f); };
      $('#st-sample', el).onclick = FOS.loadSample;
      const sc = $('#st-sample-clear', el); if (sc) sc.onclick = () => { if (confirm('Remove all sample data? Anything you added yourself stays.')) FOS.removeSample(); };
      $('#st-delete', el).onclick = () => { if (prompt('This permanently deletes everything stored by Finance OS in this browser. Type DELETE to confirm.') === 'DELETE') { store.reset(); applySettings(); U.toast('All data deleted'); FOS.go('#/home'); } };
    });
  }

  /* ---------------- quick checks (phone: replaces the floating buttons) ---------------- */
  FOS.quickSheet = function () {
    const box = U.modal('Quick checks', `<div class="sheet-actions"><button class="sheet-btn" data-q="pay"><b>CHECK BEFORE I PAY</b><span>A 1-minute check for any purchase</span></button><button class="sheet-btn" data-q="sign"><b>BEFORE YOU SIGN</b><span>Checklist for loans, insurance, cards, property</span></button><a class="sheet-btn" href="#/m/suggestions" data-q="go"><b>My Suggestions</b><span>What to do next, based on your numbers</span></a><a class="sheet-btn" href="#/m/decision" data-q="go"><b>Decision Engine</b><span>Full costs, risks and a clear verdict</span></a><a class="sheet-btn" href="#/tool/expenses" data-q="go"><b>Log an expense</b><span>Add what you just spent</span></a><a class="sheet-btn" href="#/tool/monthend" data-q="go"><b>Month-End Close</b><span>Two minutes to close the month</span></a></div>`);
    box.onclick = (e) => { const b = e.target.closest('[data-q]'); if (!b) return; const q = b.dataset.q; U.closeModal(); if (q === 'pay') FOS.payModal(); if (q === 'sign') FOS.signModal(); };
  };

  /* ---------------- boot ---------------- */
  function boot() {
    applySettings(); buildNav();
    document.addEventListener('click', (e) => { if (e.target.closest && e.target.closest('[data-theme-btn]')) { store.update((s) => { s.settings.theme = s.settings.theme === 'dark' ? 'light' : 'dark'; }); applySettings(); } if (e.target.closest && e.target.closest('#drawer-close')) document.body.classList.remove('nav-open'); });
    $('#menu-btn').onclick = () => document.body.classList.toggle('nav-open');
    $('#scrim').onclick = () => document.body.classList.remove('nav-open');
    $('#nav').addEventListener('click', (e) => { if (e.target.closest && e.target.closest('a')) document.body.classList.remove('nav-open'); });
    $('#fab-pay').onclick = FOS.payModal; $('#fab-sign').onclick = FOS.signModal; $('#bn-check').onclick = FOS.quickSheet;
    $('#bell-btn').onclick = (e) => { e.stopPropagation(); FOS.toggleNotices(); };
    // iPhone only opens the keyboard when focus happens INSIDE the tap, so focus synchronously (no timeout)
    $('#search-toggle').onclick = () => { const open = document.body.classList.toggle('search-open'); if (open) { const i = $('#gsearch'); void i.offsetWidth; i.focus(); } };
    // Every field: right keyboard, always reachable, kept in view
    // Keyboard logic applies ONLY to fields that open a keyboard. Date / month / time pickers and dropdowns are native sheets:
    // scrolling or re-laying-out the page while they open makes the phone close them, so they are left completely alone.
    const KBD = 'input:not([type]), input[type=text], input[type=number], input[type=search], input[type=email], input[type=tel], input[type=url], input[type=password], textarea';
    const isField = (t) => !!(t && t.matches && t.matches(KBD));
    document.addEventListener('focusin', (e) => {
      const t = e.target; if (!isField(t)) return;
      if (t.tagName === 'INPUT') { if (t.type === 'number' && !t.getAttribute('inputmode')) t.setAttribute('inputmode', 'decimal'); if ((t.type === 'text' || t.type === 'search') && !t.getAttribute('enterkeyhint')) t.setAttribute('enterkeyhint', 'done'); }
      document.body.classList.add('kbd-open');
      if (isPhone()) setTimeout(() => { if (document.activeElement === t) { try { t.scrollIntoView({ block: 'center', behavior: 'smooth' }); } catch (x) { /* older browsers */ } } }, 350);
    });
    document.addEventListener('focusout', () => { setTimeout(() => { if (!isField(document.activeElement)) document.body.classList.remove('kbd-open'); }, 120); });
    // On computers, Chrome/Edge open the date picker only from the little calendar icon: make a click anywhere in the field open it
    document.addEventListener('click', (e) => { const t = e.target; if (t && t.matches && t.matches('input[type=date], input[type=month], input[type=time], input[type=datetime-local]') && window.matchMedia && window.matchMedia('(pointer: fine)').matches && typeof t.showPicker === 'function') { try { t.showPicker(); } catch (x) { /* already open or not allowed */ } } });
    // tapping the ₹ or % beside a number box (or the gap around it) focuses the box, inside the tap
    document.addEventListener('click', (e) => { const w = e.target.closest && e.target.closest('.inp'); if (w && e.target.tagName !== 'INPUT') { const i = w.querySelector('input'); if (i) i.focus(); } });
    $$('[data-bn-menu]').forEach((b) => { b.onclick = () => document.body.classList.toggle('nav-open'); });
    const inp = $('#gsearch'), pop = $('#search-pop');
    inp.oninput = () => { const q = inp.value.trim(); if (!q) { pop.hidden = true; return; } pop.innerHTML = FOS.searchHTML(q, 4) + `<a class="sr-all" href="#/search/${encodeURIComponent(q)}">See all results for “${esc(q)}”</a>`; pop.hidden = false; };
    inp.onkeydown = (e) => { if (e.key === 'Enter' && inp.value.trim()) { location.hash = '#/search/' + encodeURIComponent(inp.value.trim()); pop.hidden = true; } if (e.key === 'Escape') { pop.hidden = true; inp.blur(); } };
    document.addEventListener('click', (e) => { if (!e.target.closest('#notice-panel') && !e.target.closest('#bell-btn') && FOS.closeNotices) FOS.closeNotices(); if (!e.target.closest('.search')) { pop.hidden = true; if (!e.target.closest('#search-toggle')) document.body.classList.remove('search-open'); } });
    document.addEventListener('keydown', (e) => { if (!/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { if (e.key === '/') { e.preventDefault(); inp.focus(); } else if (e.key === '?') { location.hash = '#/help'; } } });
    pop.onclick = () => { pop.hidden = true; inp.value = ''; document.body.classList.remove('search-open'); };
    document.addEventListener('click', (e) => { const t = e.target.closest && e.target.closest('[data-h]'); if (t) { e.preventDefault(); FOS.openHelpSection(t.dataset.h); } });
    window.addEventListener('hashchange', FOS.route);
    const start = () => { applySettings(); FOS.route(); FOS.checkReminders && FOS.checkReminders(); FOS.initIdle && FOS.initIdle(); FOS.syncResume && FOS.syncResume(); };
    const go = () => { if (store.isLocked()) FOS.showUnlock(start); else start(); };
    if (FOS.accessGate) FOS.accessGate(go); else go();
    // Installable + offline: register the service worker on https (GitHub Pages) only
    if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol) && location.hostname !== 'localhost' || ('serviceWorker' in navigator && location.hostname === 'localhost')) { navigator.serviceWorker.register('sw.js').catch(() => { /* offline support is optional */ }); }
    window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); FOS.installEvent = e; U.$$('[data-install]').forEach((b) => { b.hidden = false; }); });
    window.addEventListener('appinstalled', () => { FOS.installEvent = null; U.toast('Installed — open Finance OS from your home screen.'); });
  }
  document.addEventListener('DOMContentLoaded', boot);
})();
