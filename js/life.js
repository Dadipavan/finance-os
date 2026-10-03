/* ==========================================================================
   life.js — reminders, records organiser, life timeline, checklists, knowledge levels
   ========================================================================== */
(function () {
  'use strict';
  const fmt = FOS.fmt, U = FOS.ui, esc = U.esc, store = FOS.store;

  /* ---------- reminders ---------- */
  const TYPES = ['Credit card due date', 'Loan EMI', 'Insurance renewal', 'Subscription renewal', 'Investment / SIP', 'Tax deadline', 'FD maturity', 'Document expiry'];
  FOS.tools.reminders = function (root) {
    root.innerHTML = `<div class="card"><h3>Reminders</h3><p class="muted">You decide what to track — nothing is created automatically. Reminders show inside the app, and as a browser notification only if you enable it.</p>
      <div class="chips">${TYPES.map((t) => `<button class="chip" data-type="${esc(t)}">＋ ${esc(t)}</button>`).join('')}</div>
      <div class="row-actions"><button class="btn" id="rm-notify">${store.get().settings.notify ? '🔔 Browser notifications on' : '🔔 Enable browser notifications'}</button></div><div id="rm-list"></div><div id="rm-due"></div></div>`;
    const due = () => { const d = FOS.upcoming(14); root.querySelector('#rm-due').innerHTML = d.length ? `<h4>Coming up (14 days)</h4><ul class="plain">${d.map((x) => `<li><b>${fmt.date(x.date)}</b> — ${esc(x.name)}</li>`).join('')}</ul>` : ''; };
    const crud = FOS.crud(root.querySelector('#rm-list'), { list: (s) => s.reminders, addLabel: 'Add reminder', empty: 'No reminders yet.', cols: [{ k: 'title', label: 'Description', type: 'text' }, { k: 'date', label: 'Reminder date', type: 'date' }, { k: 'freq', label: 'Frequency', type: 'select', options: [['once', 'Once'], ['monthly', 'Monthly'], ['quarterly', 'Quarterly'], ['yearly', 'Yearly']] }, { k: 'amount', label: 'Amount ₹ (optional)', type: 'money' }], blank: () => ({ title: '', date: '', freq: 'once', amount: '' }), onChange: due });
    root.querySelector('.chips').onclick = (e) => { const b = e.target.closest('[data-type]'); if (!b) return; store.update((s) => s.reminders.push({ id: store.uid(), title: b.dataset.type, date: '', freq: /EMI|card|SIP/i.test(b.dataset.type) ? 'monthly' : 'yearly', amount: '' })); crud.draw(); due(); };
    root.querySelector('#rm-notify').onclick = async () => {
      if (!('Notification' in window)) return U.toast('This browser does not support notifications.');
      const p = await Notification.requestPermission();
      store.update((s) => { s.settings.notify = p === 'granted'; });
      U.toast(p === 'granted' ? 'Notifications enabled.' : 'Permission not granted.'); root.querySelector('#rm-notify').textContent = p === 'granted' ? '🔔 Browser notifications on' : '🔔 Enable browser notifications';
    };
    due();
  };
  /* Is the built-in tax / rate data stale? (pure: easy to test) */
  FOS.dataNotice = function (now) {
    now = now || new Date(); const meta = store.get().meta || {}, day = 864e5;
    if (meta.noticeSnooze && now - new Date(meta.noticeSnooze) < 0) return null;
    const y = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1, fy = 'FY' + y + '-' + String(y + 1).slice(2);
    if (!FOS.TAX_RULES.years[fy]) return { kind: 'year', text: `A new financial year (${fy}) has started and your tax rules are still for ${FOS.TAX_RULES.defaultYear}. Check the Budget changes and update the few numbers that changed.` };
    const last = meta.configChecked ? new Date(meta.configChecked) : null;
    if (!last || now - last > 90 * day) return { kind: 'stale', text: last ? `Rates and limits were last checked on ${fmt.date(last)}. Small-savings and bank rates change every few months.` : 'Rates and limits are still the built-in defaults. Check them against the official sites once so your results use current numbers.' };
    return null;
  };
  /* ---------- notices: one tidy card each; collapses to a single line on phones ---------- */
  const dismissed = () => { try { return JSON.parse(sessionStorage.getItem('fos.dismissed') || '[]'); } catch (e) { return []; } };
  FOS.buildNotices = function (now) {
    const out = [], soon = FOS.upcoming(3), mn = FOS.monthNotice && FOS.monthNotice(now), note = FOS.dataNotice(now);
    if (soon.length) out.push({ id: 'due', icon: '⏰', tone: 'warn', title: 'Due soon', text: soon.slice(0, 3).map((x) => x.name + ' · ' + fmt.date(x.date)).join('\n'), actions: [{ label: 'Open reminders', href: '#/tool/reminders', primary: true }] });
    if (mn) out.push({ id: 'month', icon: '🗓', tone: 'info', title: 'Close ' + FOS.monthLabel(mn.key), text: 'Add last month\'s expenses, update balances and save it — about two minutes.', actions: [{ label: 'Close month', href: '#/tool/monthend', primary: true }, { label: 'Later', act: 'month-later' }] });
    if (FOS.syncNeeded && FOS.syncNeeded()) out.push({ id: 'sync', icon: '☁️', tone: 'info', title: 'Google Drive sync', text: 'A quick sign-in is needed to keep your data backed up.', actions: [{ label: 'Sign in & sync', act: 'sync-go', primary: true }] });
    if (note) out.push({ id: 'data', icon: '📅', tone: 'warn', title: note.kind === 'year' ? 'New financial year' : 'Check your rates', text: note.text, actions: [{ label: 'Update now', href: '#/sources', primary: true }, { label: 'I\'ve checked', act: 'data-ok' }, { label: 'Later', act: 'data-later' }] });
    return out.filter((n) => dismissed().indexOf(n.id) < 0);
  };
  FOS.renderNotices = function () {
    const bar = U.$('#alert-bar'); if (!bar) return; const list = FOS.buildNotices();
    if (!list.length) { bar.hidden = true; bar.innerHTML = ''; return; }
    const card = (n) => `<article class="notice ${n.tone}" data-n="${n.id}"><span class="n-ic" aria-hidden="true">${n.icon}</span><div class="n-b"><h3>${esc(n.title)}</h3><p>${esc(n.text).replace(/\n/g, '<br>')}</p><div class="n-act">${n.actions.map((x) => x.href ? `<a class="btn sm ${x.primary ? 'primary' : 'ghost'}" href="${x.href}">${esc(x.label)}</a>` : `<button class="btn sm ${x.primary ? 'primary' : 'ghost'}" data-act="${x.act}">${esc(x.label)}</button>`).join('')}</div></div><button class="n-x" data-dismiss="${n.id}" aria-label="Dismiss ${esc(n.title)}">✕</button></article>`;
    const phone = window.matchMedia && window.matchMedia('(max-width: 980px)').matches;
    bar.hidden = false;
    bar.innerHTML = list.length === 1 ? `<div class="n-list">${card(list[0])}</div>` : `<details class="notices" ${phone ? '' : 'open'}><summary><span aria-hidden="true">🔔</span> <b>${list.length} notices</b><span class="n-first"> — ${esc(list[0].title)}${list.length > 1 ? ' and more' : ''}</span><span class="n-chev" aria-hidden="true">▾</span></summary><div class="n-list">${list.map(card).join('')}</div></details>`;
    bar.onclick = (e) => {
      const d = e.target.closest('[data-dismiss]'), a = e.target.closest('[data-act]');
      const hide = (id) => { try { const x = dismissed(); x.push(id); sessionStorage.setItem('fos.dismissed', JSON.stringify(x)); } catch (er) { /* ignore */ } FOS.renderNotices(); };
      if (d) return hide(d.dataset.dismiss);
      if (!a) return; const k = a.dataset.act, id = a.closest('[data-n]').dataset.n;
      if (k === 'sync-go') { hide(id); FOS.syncNow(true); }
      if (k === 'month-later') { store.update((s) => { s.meta.monthSnooze = new Date(Date.now() + 2 * 864e5).toISOString(); }); hide(id); }
      if (k === 'data-ok') { store.update((s) => { s.meta.configChecked = new Date().toISOString(); }); hide(id); }
      if (k === 'data-later') { store.update((s) => { s.meta.noticeSnooze = new Date(Date.now() + 30 * 864e5).toISOString(); }); hide(id); }
    };
  };
  FOS.checkReminders = function () {
    const soon = FOS.upcoming(3);
    FOS.renderNotices();
    if (soon.length && store.get().settings.notify && 'Notification' in window && Notification.permission === 'granted') {
      const key = 'fos.notified.' + new Date().toISOString().slice(0, 10);
      if (!sessionStorage.getItem(key)) { sessionStorage.setItem(key, '1'); try { new Notification('Finance OS reminder', { body: soon.slice(0, 3).map((x) => x.name + ' – ' + fmt.date(x.date)).join('\n') }); } catch (e) { /* ignore */ } }
    }
  };

  /* ---------- records ---------- */
  FOS.tools.records = function (root) {
    root.innerHTML = `<div class="card"><h3>Document &amp; record organiser</h3><div class="safety">🔒 Store names, providers, amounts and dates only. Never put policy/account/card numbers, passwords, OTPs, PINs or CVVs here — entries that look like secrets are rejected.</div><div id="rec-list"></div></div>`;
    FOS.crud(root.querySelector('#rec-list'), { list: (s) => s.records, addLabel: 'Add record', empty: 'Track insurance policies, loans, cards, FDs and renewal dates.',
      cols: [{ k: 'type', label: 'Type', type: 'select', options: ['Insurance policy', 'Loan', 'Credit card', 'Investment', 'FD', 'Important document', 'Other'] }, { k: 'name', label: 'Name / provider', type: 'text' }, { k: 'amount', label: 'Cover / amount ₹', type: 'money' }, { k: 'renew', label: 'Renewal / maturity', type: 'date' }, { k: 'nominee', label: 'Nominee', type: 'text' }, { k: 'note', label: 'Note', type: 'text' }],
      blank: () => ({ type: 'Insurance policy', name: '', amount: '', renew: '', nominee: '', note: '' }) });
  };

  /* ---------- timeline ---------- */
  FOS.tools.timeline = function (root) {
    root.innerHTML = `<div class="card"><h3>My financial life timeline</h3><p class="muted">Edit the milestones to match your own life. Your current age (from onboarding) is marked.</p><div id="tl-vis"></div><div id="tl-list"></div></div>`;
    const vis = () => { const age = +store.get().profile.age, items = [...store.get().timeline].filter((t) => t.text).sort((a, b) => +a.age - +b.age); root.querySelector('#tl-vis').innerHTML = `<ol class="timeline">${items.map((t) => `<li class="${age && +t.age <= age ? 'past' : ''}"><span class="age">Age ${esc(t.age)}</span><span>${esc(t.text)}</span>${age && +t.age === age ? '<em>← you are here</em>' : ''}</li>`).join('')}</ol>`; };
    FOS.crud(root.querySelector('#tl-list'), { list: (s) => s.timeline, addLabel: 'Add milestone', cols: [{ k: 'age', label: 'Age', type: 'number' }, { k: 'text', label: 'Milestone', type: 'text' }], blank: () => ({ age: '', text: '' }), onChange: vis });
    vis();
  };

  /* ---------- checklists ---------- */
  FOS.renderChecklist = function (el, id) {
    const c = FOS.CHECKLISTS[id]; if (!c) { el.innerHTML = ''; return; }
    const draw = () => {
      const st = store.get().checklists[id] || {}, done = c.items.filter((_, i) => st[i]).length;
      el.innerHTML = `<div class="between"><h4>${esc(c.title)}</h4><b>${done}/${c.items.length}</b></div>${FOS.charts.progress(done / c.items.length * 100, c.title)}<ul class="checklist">${c.items.map((t, i) => `<li><label><input type="checkbox" data-i="${i}" ${st[i] ? 'checked' : ''}> <span>${esc(t)}</span></label></li>`).join('')}</ul><div class="row-actions"><button class="btn ghost" data-reset>Reset checklist</button></div>${done === c.items.length ? '<p class="status ok">✓ All points checked. The decision is still yours — take your time.</p>' : ''}`;
    };
    el.onchange = (e) => { if (e.target.dataset.i === undefined) return; store.update((s) => { s.checklists[id] = s.checklists[id] || {}; s.checklists[id][e.target.dataset.i] = e.target.checked; }); draw(); };
    el.onclick = (e) => { if (e.target.hasAttribute('data-reset')) { store.update((s) => { s.checklists[id] = {}; }); draw(); } };
    draw();
  };
  FOS.tools.checklists = function (root) {
    const ids = Object.keys(FOS.CHECKLISTS);
    root.innerHTML = `<div class="card"><h3>Checklist center</h3><p class="muted">Tick each item only when you have the answer. Progress is saved locally.</p><label class="lbl" for="cl-sel">Choose a checklist</label><select id="cl-sel" class="input">${ids.map((k) => `<option value="${k}">${esc(FOS.CHECKLISTS[k].title)}</option>`).join('')}</select><div id="cl-body"></div></div>`;
    const sel = root.querySelector('#cl-sel'), initial = (location.hash.match(/chk=([\w-]+)/) || [])[1];
    if (initial && FOS.CHECKLISTS[initial]) sel.value = initial;
    const draw = () => FOS.renderChecklist(root.querySelector('#cl-body'), sel.value);
    sel.onchange = draw; draw();
  };

  /* ---------- knowledge levels ---------- */
  FOS.progress = function () {
    const pr = store.get().progress, lessons = FOS.LESSONS || {}, quiz = FOS.QUIZ || {};
    const mods = FOS.MODULES.filter((m) => m.lvl).map((m) => {
      const L = lessons[m.id] || [], read = L.filter((l) => pr.lessons[l.id]).length, q = pr.quiz[m.id], hasQ = (quiz[m.id] || []).length > 0;
      const passed = !hasQ || (q && q.best / q.total >= 0.6);
      return { m, lessons: L.length, read, q, hasQ, done: (L.length === 0 || read === L.length) && passed };
    });
    const levels = FOS.LEVELS.map((name, i) => {
      if (i === 0) return { i, name, mods: [], done: true, pct: 100 };
      const ms = mods.filter((x) => x.m.lvl === i), done = ms.filter((x) => x.done).length;
      return { i, name, mods: ms, done: ms.length > 0 && done === ms.length, pct: ms.length ? done / ms.length * 100 : 0 };
    });
    let cur = 0; for (let i = 1; i < levels.length; i++) { if (levels[i].done) cur = i; else break; }
    return { mods, levels, cur };
  };
  FOS.tools.knowledge = function (root) {
    const P = FOS.progress(), total = P.mods.reduce((a, x) => a + x.lessons, 0), read = P.mods.reduce((a, x) => a + x.read, 0);
    root.innerHTML = `<div class="card"><h3>LEVEL ${P.cur} — ${esc(FOS.LEVELS[P.cur])}</h3><p class="muted">Finish all lessons (mark as read) and pass each module quiz (60%+) to complete its level. Progress is stored only on this device.</p>${FOS.charts.progress(total ? read / total * 100 : 0, 'Lessons read')}<p>${read} of ${total} lessons read.</p>
      <ol class="levels">${P.levels.map((l) => `<li class="${l.done ? 'done' : l.i === P.cur + 1 ? 'next' : ''}"><div class="between"><b>LEVEL ${l.i} — ${esc(l.name)}</b><span>${l.i === 0 ? 'Start here' : l.done ? '✓ Complete' : Math.round(l.pct) + '%'}</span></div>${l.mods.length ? `<ul>${l.mods.map((x) => `<li><a href="#/m/${x.m.id}">${esc(x.m.title)}</a> — ${x.lessons ? `${x.read}/${x.lessons} lessons` : 'tools'}${x.hasQ ? `, quiz ${x.q ? x.q.best + '/' + x.q.total : 'not taken'}` : ''}${x.done ? ' ✓' : ''}</li>`).join('')}</ul>` : ''}</li>`).join('')}</ol></div>`;
  };
})();
