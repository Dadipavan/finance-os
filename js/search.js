/* ==========================================================================
   search.js — global search across topics, calculators, lessons, glossary,
   checklists and scenarios
   ========================================================================== */
(function () {
  'use strict';
  const U = FOS.ui, esc = U.esc;
  let index = null;
  const norm = (s) => String(s || '').toLowerCase();

  function build() {
    index = [];
    FOS.MODULES.forEach((m) => index.push({ type: 'Topic', title: m.title, sub: m.blurb, href: m.route || '#/m/' + m.id, hay: norm(m.title + ' ' + m.blurb + ' ' + m.id), w: 1 }));
    Object.values(FOS.calcs).forEach((c) => index.push({ type: /What If/.test(c.group) ? 'Scenario' : 'Calculator', title: c.title, sub: c.intro, href: '#/calc/' + c.id, hay: norm(c.title + ' ' + (c.tags || '') + ' ' + c.intro + ' ' + (c.group || '')), tags: norm(c.tags), w: 1.2 }));
    Object.entries(FOS.LESSONS).forEach(([mod, arr]) => arr.forEach((l) => index.push({ type: 'Lesson', title: l.t, sub: l.simple, href: '#/m/' + mod + '?l=' + l.id, hay: norm(l.t + ' ' + l.simple + ' ' + l.tech + ' ' + l.ex + ' ' + (l.analogy || '')), w: 1 })));
    (FOS.GUIDES || []).forEach((g) => index.push({ type: 'Guide', title: g.title, sub: g.summary.replace(/\*\*/g, ''), href: '#/guide/' + g.id, hay: norm(FOS.guideText(g)), w: 1.3 }));
    FOS.GLOSSARY.forEach((g) => index.push({ type: 'Glossary', title: (/^[A-Z/&]+$/.test(g[0]) ? 'What is ' + g[0] + '?' : g[0]), sub: g[1], href: '#/glossary?t=' + encodeURIComponent(g[0]), hay: norm(g[0] + ' ' + g[1] + ' ' + g[2] + ' ' + g[3]), term: norm(g[0]), w: 1.1 }));
    Object.entries(FOS.CHECKLISTS).forEach(([k, c]) => index.push({ type: 'Checklist', title: c.title, sub: c.items.slice(0, 3).join(' · '), href: '#/tool/checklists?chk=' + k, hay: norm(c.title + ' ' + c.items.join(' ')), w: 1 }));
    [['decision', 'Decision Engine', 'What are you about to do? costs, risks, alternatives'], ['scamchecker', 'Scam Checker', 'ponzi otp upi phishing guaranteed return'], ['loancompare', 'Loan comparison', 'compare loans side by side emi fees']].forEach(([id, t, s]) => index.push({ type: 'Tool', title: t, sub: s, href: '#/tool/' + id, hay: norm(t + ' ' + s), w: 1 }));
  }

  FOS.search = function (q) {
    if (!index) build();
    const terms = norm(q).split(/[^a-z0-9₹%/]+/).filter(Boolean); if (!terms.length) return [];
    const out = [];
    index.forEach((it) => {
      let s = 0;
      for (const t of terms) {
        const inTitle = norm(it.title).includes(t), inHay = it.hay.includes(t);
        if (!inHay && !inTitle) { s = 0; break; }
        const wordRe = new RegExp('(^|[^a-z0-9])' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '([^a-z0-9]|$)');
        s += (inTitle ? 6 : 0) + (wordRe.test(it.hay) ? 3 : 1) + (it.tags && wordRe.test(it.tags) ? 4 : 0) + (it.term === t ? 8 : 0);
      }
      if (s > 0) out.push(Object.assign({}, it, { score: s * it.w }));
    });
    return out.sort((a, b) => b.score - a.score);
  };
  FOS.searchHTML = function (q, limit) {
    const res = FOS.search(q); if (!res.length) return `<p class="muted">No results for “${esc(q)}”. Try a shorter term such as EMI, SIP or insurance.</p>`;
    const order = ['Guide', 'Calculator', 'Lesson', 'Glossary', 'Checklist', 'Scenario', 'Tool', 'Topic'], groups = {};
    res.slice(0, limit || 40).forEach((r) => { (groups[r.type] = groups[r.type] || []).push(r); });
    return order.filter((t) => groups[t]).map((t) => `<div class="sr-group"><h4>${t}s</h4>${groups[t].slice(0, limit ? 4 : 12).map((r) => `<a class="sr-item" href="${r.href}"><b>${esc(r.title)}</b><span>${esc((r.sub || '').slice(0, 110))}</span></a>`).join('')}</div>`).join('');
  };
  FOS.invalidateSearch = () => { index = null; };
})();
