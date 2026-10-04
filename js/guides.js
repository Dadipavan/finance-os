/* ==========================================================================
   guides.js — the EXPERT GUIDE engine.
   Every knowledge module has one in-depth guide (content lives in guides-*.js):
   what it is → every type/option → how it works → who benefits (with numbers) →
   real documents & identifiers to check → costs → how to choose → traps → tax →
   "My recommendation" → checklist → where to verify.
   Section format:  ['Heading', 'paragraph', ['ul', ...], ['ol', ...], ['tbl', [head], [[row]...]], ['tip', text], ['warn', text], ['ex', text]]
   ========================================================================== */
window.FOS = window.FOS || {};
(function () {
  'use strict';
  const U = FOS.ui, esc = U.esc, store = FOS.store;
  FOS.GUIDES = [];
  FOS.G = (g) => { FOS.GUIDES.push(g); return g; };
  const byId = (id) => FOS.GUIDES.find((g) => g.id === id);
  FOS.guideFor = (moduleId) => FOS.GUIDES.find((g) => g.module === moduleId);
  const inline = (t) => esc(t).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
  const block = (b) => {
    if (typeof b === 'string') return `<p>${inline(b)}</p>`;
    const [k, ...r] = b;
    if (k === 'ul') return `<ul>${r.map((x) => `<li>${inline(x)}</li>`).join('')}</ul>`;
    if (k === 'ol') return `<ol>${r.map((x) => `<li>${inline(x)}</li>`).join('')}</ol>`;
    if (k === 'tbl') return `<div class="table-scroll"><table class="data schemes"><thead><tr>${r[0].map((h) => `<th>${inline(h)}</th>`).join('')}</tr></thead><tbody>${r[1].map((row) => `<tr>${row.map((c, i) => (i === 0 ? `<th scope="row">${inline(c)}</th>` : `<td>${inline(c)}</td>`)).join('')}</tr>`).join('')}</tbody></table></div>`;
    if (k === 'tip') return `<div class="g-note gn-tip"><span class="gn-ic" aria-hidden="true">💡</span><div class="gn-b"><b class="gn-t">Tip</b><div>${inline(r[0])}</div></div></div>`;
    if (k === 'warn') return `<div class="g-note gn-warn"><span class="gn-ic" aria-hidden="true">⚠️</span><div class="gn-b"><b class="gn-t">Watch out</b><div>${inline(r[0])}</div></div></div>`;
    if (k === 'ex') return `<div class="g-note gn-ex"><span class="gn-ic" aria-hidden="true">📒</span><div class="gn-b"><b class="gn-t">Example</b><div>${inline(r[0])}</div></div></div>`;
    return '';
  };
  const plain = (g) => g.title + ' ' + g.summary + ' ' + g.sections.map((s) => s[0] + ' ' + s.slice(1).map((b) => (typeof b === 'string' ? b : b.slice(1).flat(2).join(' '))).join(' ')).join(' ') + ' ' + (g.advisor || []).join(' ');
  FOS.guideText = plain;

  FOS.guideHTML = function (g) {
    const prog = (store.get().checklists['guide-' + g.id]) || {}, done = (g.checklist || []).filter((_, i) => prog[i]).length, m = FOS.MODULES.find((x) => x.id === g.module);
    const related = (g.calcs || []).map((c) => FOS.calcs[c]).filter(Boolean), tools = g.tools || [];
    return `<div class="crumb"><a href="#/tool/guides">Expert guides</a> › <span>${esc(g.cat)}</span></div>
      <h1 class="ph">${esc(g.title)}</h1><p class="lead">${inline(g.summary)}</p>
      <div class="g-meta"><span class="pill info">${esc(g.read || '15 min read')}</span>${m ? `<a class="pill" href="#/m/${m.id}">Lessons &amp; quiz: ${esc(m.title)}</a>` : ''}${related.map((c) => `<a class="pill good" href="#/calc/${c.id}">🧮 ${esc(c.title)}</a>`).join('')}${tools.map(([t, h]) => `<a class="pill good" href="${h}">🛠 ${esc(t)}</a>`).join('')}</div>
      <nav class="jump" aria-label="Sections in this guide">${g.sections.map((s, i) => `<button class="chip" data-gj="${i}">${esc(s[0])}</button>`).join('')}<button class="chip on" data-gj="advisor">My recommendation</button><button class="chip" data-gj="check">Checklist</button></nav>
      ${g.sections.map((s, i) => `<details class="gsec" id="gs-${i}" ${i < 2 ? 'open' : ''}><summary><b>${i + 1}. ${esc(s[0])}</b></summary>${s.slice(1).map(block).join('')}</details>`).join('')}
      <section class="card advisor" id="gs-advisor"><h2>🧭 My recommendation</h2><p class="muted">What I would do in your position, in order. Adjust for your income, dependants and goals.</p><ol>${(g.advisor || []).map((x) => `<li>${inline(x)}</li>`).join('')}</ol></section>
      <section class="card" id="gs-check"><div class="between"><h2>✅ Your checklist</h2><b id="gc-count">${done}/${(g.checklist || []).length}</b></div>${FOS.charts.progress((g.checklist || []).length ? done / g.checklist.length * 100 : 0, 'Checklist progress')}<ul class="checklist">${(g.checklist || []).map((t, i) => `<li><label><input type="checkbox" data-gc="${i}" ${prog[i] ? 'checked' : ''}> <span>${inline(t)}</span></label></li>`).join('')}</ul></section>
      ${(g.verify || []).length ? `<section class="card note"><h4>Where to verify (figures change)</h4><ul>${g.verify.map((v) => `<li>${inline(v)}</li>`).join('')}</ul><p class="note">Update current rates and rules in <a href="#/sources">Data &amp; Sources</a>.</p></section>` : ''}`;
  };
  FOS.guideAfter = function (g, el) {
    el.addEventListener('click', (e) => { const b = e.target.closest('[data-gj]'); if (!b) return; const t = document.getElementById('gs-' + b.dataset.gj); if (t) { if (t.tagName === 'DETAILS') t.open = true; t.scrollIntoView({ behavior: 'smooth', block: 'start' }); } });
    el.addEventListener('change', (e) => { const c = e.target.closest('[data-gc]'); if (!c) return; store.update((s) => { const k = 'guide-' + g.id; s.checklists[k] = s.checklists[k] || {}; s.checklists[k][c.dataset.gc] = c.checked; }); const n = Object.values(store.get().checklists['guide-' + g.id]).filter(Boolean).length, cnt = el.querySelector('#gc-count'); if (cnt) cnt.textContent = n + '/' + g.checklist.length; const bar = el.querySelector('#gs-check .progress span'); if (bar) bar.style.width = (n / g.checklist.length * 100) + '%'; });
    if (window.matchMedia && window.matchMedia('(min-width: 981px)').matches) el.querySelectorAll('details.gsec').forEach((d) => { d.open = true; });
  };

  // library page (all guides, by category, with search)
  FOS.tools.guides = function (root) {
    const cats = [...new Set(FOS.GUIDES.map((g) => g.cat))]; let cat = '', q = '';
    const draw = () => {
      const t = q.toLowerCase(), list = FOS.GUIDES.filter((g) => (!cat || g.cat === cat) && (!t || plain(g).toLowerCase().includes(t)));
      root.querySelector('#gl-list').innerHTML = list.length ? list.map((g) => `<a class="card calc-card guide-card" href="#/guide/${g.id}"><small>${esc(g.cat)} · ${esc(g.read || '')}</small><h3>${esc(g.title)}</h3><p>${inline(g.summary)}</p></a>`).join('') : '<p class="muted">No guide matches.</p>';
    };
    root.innerHTML = `<div class="card"><h3>${FOS.GUIDES.length} expert guides — one for every topic</h3><p class="muted">Each guide takes you from zero to expert: every type and option, how it really works, who benefits (with numbers), the exact documents and identifiers to check, the costs and traps, tax, then <b>my recommendation</b> and a checklist.</p><input class="input" id="gl-q" type="search" placeholder="Search guides: insurance, chassis number, home loan, SIP…" aria-label="Search guides"><div class="chips" id="gl-c"><button class="chip on" data-c="">All</button>${cats.map((c) => `<button class="chip" data-c="${esc(c)}">${esc(c)}</button>`).join('')}</div></div><div class="cards" id="gl-list"></div>`;
    root.querySelector('#gl-q').oninput = (e) => { q = e.target.value; draw(); };
    root.querySelector('#gl-c').onclick = (e) => { const b = e.target.closest('[data-c]'); if (!b) return; cat = b.dataset.c; root.querySelectorAll('#gl-c .chip').forEach((x) => x.classList.toggle('on', x === b)); draw(); };
    draw();
  };
})();
