/* curriculum.js — Learning Paths: a step-by-step curriculum for every stage of life, with your progress.
   Each path lists modules in a sensible order; progress comes from lessons read, quizzes passed and checklists ticked. */
window.FOS = window.FOS || {};
(function () {
  'use strict';
  const U = FOS.ui, esc = U.esc, store = FOS.store;
  const PATHS = [
    ['Start from zero', 'Never managed money? Begin here.', ['basics', 'income', 'budgeting', 'spending', 'mindset', 'banking', 'emergency', 'insurance']],
    ['Student to first job', 'Your first salary, first credit card and first SIP.', ['firstjob', 'income', 'banking', 'cards', 'score', 'emergency', 'insurance', 'investing']],
    ['Build wealth', 'From a first SIP to a written, tax-aware portfolio.', ['investing', 'mutualfunds', 'stocks', 'bonds', 'gold', 'govt', 'economy', 'advinvest', 'tax', 'taxadv']],
    ['Home, family and children', 'Big purchases and the people who depend on you.', ['loans', 'emi', 'property', 'rental', 'marriage', 'family', 'women', 'children', 'education', 'vehicle']],
    ['Career, business and equity', 'Earning more and building something of your own.', ['earnmore', 'career', 'business', 'bizstart', 'bizacct', 'startup']],
    ['Protect what you have', 'Cover, safety, rights and your legacy.', ['insurance', 'emergency', 'scams', 'digital', 'rights', 'socialsec', 'estate']],
    ['Retirement and later life', 'Planning the income and the safety net for the years after work.', ['retirement', 'fi', 'networth', 'seniors', 'estate']],
    ['Global and advanced', 'Living abroad, returning and complex situations.', ['nri', 'taxadv', 'advinvest', 'crypto', 'scenarios', 'decision']]
  ];
  FOS.PATHS = PATHS;
  // how far you are through one module: lessons read + quiz passed (0..1), or null if it has neither
  function modProgress(id, P) {
    const x = P.mods.find((m) => m.m.id === id); if (x) return { pct: ((x.lessons ? x.read / x.lessons : 1) + (x.hasQ ? (x.q && x.q.best / x.q.total >= 0.6 ? 1 : 0) : 1)) / 2, x };
    return null;
  }
  FOS.tools.paths = function (root) {
    const P = FOS.progress(), byId = (id) => FOS.MODULES.find((m) => m.id === id);
    const cards = PATHS.map(([title, blurb, ids]) => {
      const mods = ids.map(byId).filter(Boolean), prog = mods.map((m) => modProgress(m.id, P)), have = prog.filter(Boolean), pct = have.length ? Math.round(have.reduce((a, p) => a + p.pct, 0) / have.length * 100) : 0;
      const next = mods.find((m, i) => prog[i] && prog[i].pct < 1) || mods[0];
      return `<section class="card"><div class="between"><h3>${esc(title)}</h3><b>${pct}%</b></div><p class="muted">${esc(blurb)}</p>${FOS.charts.progress(pct, title)}
        <ol class="plain">${mods.map((m, i) => { const p = prog[i], g = FOS.guideFor && FOS.guideFor(m.id); return `<li><a href="#/m/${m.id}"><b>${esc(m.title)}</b></a> ${p ? `<span class="pill ${p.pct >= 1 ? 'good' : p.pct > 0 ? 'watch' : 'info'}">${p.pct >= 1 ? 'Done ✓' : Math.round(p.pct * 100) + '%'}</span>` : ''}${g ? ` · <a href="#/guide/${g.id}">expert guide</a>` : ''}</li>`; }).join('')}</ol>
        ${next ? `<a class="btn primary" href="#/m/${next.id}">${pct > 0 ? 'Continue' : 'Start'}: ${esc(next.title)} →</a>` : ''}</section>`;
    }).join('');
    root.innerHTML = `<div class="card"><h3>Learning paths</h3><p class="muted">Pick the path that matches where you are. Inside each module: read the lessons, take the quiz, open the expert guide, and use the calculators. Your progress is saved on this device.</p></div>${cards}`;
  };
})();
