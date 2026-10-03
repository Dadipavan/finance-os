/* ==========================================================================
   taxes.js — tax calculators and the configurable tax / scheme viewers
   All numbers come from TAX_RULES / GOVERNMENT_SCHEMES (data.js) — never inline.
   ========================================================================== */
(function () {
  'use strict';
  const { F, S, reg } = FOS, C = FOS.calc, fmt = FOS.fmt, U = FOS.ui, esc = U.esc;
  const yearsOpt = () => Object.keys(FOS.TAX_RULES.years).map((k) => [k, FOS.TAX_RULES.years[k].label]);

  FOS.sourceBlock = (meta) => `<div class="source" role="note"><b>Source:</b> ${esc(meta.source)} · <b>Last updated:</b> ${esc(meta.lastUpdated)} · <b>Applicable:</b> ${esc(meta.period || meta.label || '')} · <b class="warn-t">${esc(meta.note || 'Verify before acting')}</b></div>`;

  reg({
    id: 'incometax', title: 'Income Tax Estimator (New vs Old regime)', group: 'Tax', module: 'tax', tags: 'income tax slab regime new old rebate cess deduction 80c tds',
    intro: 'Estimate tax under both regimes using the rules for the selected year from the configuration.',
    fields: [F.sel('yr', 'Tax year', () => FOS.TAX_RULES.defaultYear, yearsOpt()), F.money('sal', 'Annual salary / business income', 1500000, 10000000, 50000), F.money('oth', 'Other income (interest, rent etc.)', 50000, 2000000, 5000), F.money('ded', 'Old-regime deductions (80C, 80D, NPS, home-loan interest…)', 200000, 1000000, 5000)],
    formula: ['Taxable income = Income − Standard deduction (− deductions in old regime)', 'Tax = Σ (slab portion × slab rate), minus rebate, plus 4% cess'], vars: ['Marginal relief near the rebate limit is modelled for the new regime where configured'], assumptions: ['Capital gains and special-rate income are not included (use the Capital Gains tool)', 'Surcharge is not modelled (applies to very high incomes)'],
    compute(v) {
      const yr = FOS.TAX_RULES.years[v.yr] || FOS.TAX_RULES.years[FOS.TAX_RULES.defaultYear], gross = v.sal + v.oth;
      const calc = (k) => { const r = yr.regimes[k], ti = Math.max(0, gross - r.stdDeduction - (k === 'old' ? v.ded : 0)); return { ti, ...C.incomeTax(ti, r) }; };
      const n = calc('new'), o = calc('old');
      return { summary: [S('New regime: taxable income', n.ti), S('New regime: tax', n.total, 'inr', true), S('Old regime: taxable income', o.ti), S('Old regime: tax', o.total, 'inr', true), S('Difference (old − new)', o.total - n.total), S('New regime: average rate', gross > 0 ? n.total / gross * 100 : NaN, 'pct'), S('Old regime: average rate', gross > 0 ? o.total / gross * 100 : NaN, 'pct')],
        table: { head: ['', 'New regime', 'Old regime'], rows: [['Standard deduction', fmt.inr(yr.regimes.new.stdDeduction), fmt.inr(yr.regimes.old.stdDeduction)], ['Slab tax', fmt.inr(n.slabTax), fmt.inr(o.slabTax)], ['Rebate', fmt.inr(n.rebate), fmt.inr(o.rebate)], ['Cess', fmt.inr(n.cess), fmt.inr(o.cess)], ['Total tax', fmt.inr(n.total), fmt.inr(o.total)]] }, tableTitle: 'Breakdown',
        notes: ['Rules used: ' + yr.label + ' — ' + yr.note + '. Source: ' + yr.source + '.', 'Which regime suits you depends on the deductions you will actually use; recompute every year.'] };
    }
  });

  reg({
    id: 'capgains', title: 'Capital Gains Tax Estimator', group: 'Tax', module: 'tax', tags: 'capital gains ltcg stcg equity mutual fund gold crypto tax',
    intro: 'Estimate tax on a sale using the rates in the tax configuration.',
    fields: [F.sel('yr', 'Tax year', () => FOS.TAX_RULES.defaultYear, yearsOpt()), F.sel('kind', 'What did you sell?', 'equityLTCG', [['equityLTCG', 'Listed equity / equity MF — held > 12 months'], ['equitySTCG', 'Listed equity / equity MF — held ≤ 12 months'], ['debtMF', 'Debt mutual fund (slab rate)'], ['gold', 'Gold (configured rate)'], ['crypto', 'Crypto / digital asset']]), F.money('buy', 'Purchase cost', 500000, 10000000, 10000), F.money('sell', 'Sale value', 800000, 10000000, 10000), F.pct('slab', 'Your slab rate (for slab-taxed items)', 20, 40, 1)],
    formula: ['Gain = Sale − Cost', 'Tax = (Gain − exemption) × rate × (1 + cess)'], vars: [], assumptions: ['Indexation, grandfathering and holding-period rules differ by instrument and date — verify', 'Crypto: losses cannot be set off against other income under current rules (configured note)'],
    compute(v) {
      const yr = FOS.TAX_RULES.years[v.yr], cg = yr.capitalGains[v.kind], gain = v.sell - v.buy, cess = yr.other.standardCess || 0;
      const rate = cg.rate === 'slab' ? v.slab : cg.rate, taxable = Math.max(0, gain - (cg.exemption || 0)), tax = gain > 0 ? taxable * rate / 100 * (1 + cess / 100) : 0;
      return { summary: [S('Gain / loss', gain, 'inr', true), S('Exemption applied', gain > 0 ? Math.min(gain, cg.exemption || 0) : 0), S('Rate used', rate, 'pct'), S('Estimated tax (incl. cess)', tax, 'inr', true), S('Gain after tax', gain - tax)], notes: [cg.note, 'Rules: ' + yr.label + '. ' + yr.note] };
    }
  });

  /* ---------- Tax center (education + rules viewer) ---------- */
  const CONCEPTS = [
    ['Financial year (FY) & Assessment year (AY)', 'FY is 1 April–31 March in which you earn. AY is the following year in which the income is assessed. Example: salary earned between 1 April 2030 and 31 March 2031 (FY 2030-31) is reported in AY 2031-32.'],
    ['Income heads', 'Salary, house property, business/profession, capital gains, other sources (interest, dividends). Each has its own rules.'],
    ['TDS', 'Tax Deducted at Source: payers (employer, bank) deduct tax in advance. It is a credit against your final tax — check Form 26AS / AIS.'],
    ['Slabs & regimes', 'Tax is computed slab-wise; you choose between the new regime (lower rates, few deductions) and the old (higher rates, many deductions). Compare every year.'],
    ['Deductions & exemptions', 'Old regime: 80C (PPF, ELSS, EPF, life insurance…), 80D (health insurance), NPS extra, home-loan interest. Exemptions reduce taxable income; deductions subtract from it.'],
    ['Interest income', 'FD/savings interest is added to income and taxed at your slab. TDS may apply above a threshold, but you still owe the full slab tax.'],
    ['Capital gains', 'Profit on selling assets. Short-term vs long-term depends on holding period and asset. See the Capital Gains tool and the configured rates.'],
    ['Dividends', 'Taxable in the hands of the recipient at slab rates.'],
    ['Property taxation', 'Rental income (after standard deduction), home-loan interest, capital gains on sale, stamp duty/registration — each treated differently.'],
    ['Digital assets', 'Crypto and other virtual digital assets have a specific flat rate, limits on loss set-off and TDS on transfers (see configuration; verify current rules).'],
    ['Filing', 'File your return by the due date even when TDS covers your tax — it builds a record and enables refunds.']
  ];
  FOS.tools.taxinfo = function (root) {
    FOS.tabs(root, [
      { label: 'Concepts', render: (el) => { el.innerHTML = `<div class="card"><h3>Tax concepts</h3>${CONCEPTS.map(([t, d]) => `<details><summary>${esc(t)}</summary><p>${esc(d)}</p></details>`).join('')}<p class="note">Rules change with every Budget — update them in Data &amp; Sources.</p></div>`; } },
      { label: 'Rules by year', render: (el) => {
        const draw = (k) => {
          const y = FOS.TAX_RULES.years[k], slabTable = (r) => { let prev = 0; return `<table class="data"><thead><tr><th>Income slab</th><th>Rate</th></tr></thead><tbody>${r.slabs.map(([lim, rate]) => { const row = `<tr><td>${lim === null ? 'Above ' + fmt.inr(prev) : fmt.inr(prev) + ' – ' + fmt.inr(lim)}</td><td>${rate}%</td></tr>`; prev = lim; return row; }).join('')}</tbody></table><p class="muted">Standard deduction ${fmt.inr(r.stdDeduction)} · Rebate up to ${fmt.inr(r.rebate.max)} if taxable income ≤ ${fmt.inr(r.rebate.limit)} · Cess ${r.cessPct}%</p>`; };
          el.innerHTML = `<div class="card"><label class="lbl" for="ty">Tax year</label><select id="ty" class="input">${yearsOpt().map(([a, b]) => `<option value="${a}" ${a === k ? 'selected' : ''}>${esc(b)}</option>`).join('')}</select>${FOS.sourceBlock({ source: y.source, lastUpdated: y.lastUpdated, period: y.label, note: y.note })}
            <div class="grid-2"><div><h4>${esc(y.regimes.new.name)}</h4>${slabTable(y.regimes.new)}</div><div><h4>${esc(y.regimes.old.name)}</h4>${slabTable(y.regimes.old)}</div></div>
            <h4>Old-regime deduction limits</h4><ul>${Object.entries(y.deductionsOld).map(([a, b]) => `<li>${esc(a)}: up to ${fmt.inr(b)}</li>`).join('')}</ul>
            <h4>Capital gains</h4><ul>${Object.entries(y.capitalGains).map(([a, b]) => `<li><b>${esc(a)}</b>: ${b.rate === 'slab' ? 'slab rate' : b.rate + '%'}${b.exemption ? ' (exemption ' + fmt.inr(b.exemption) + ')' : ''}${b.tds ? ', TDS ' + b.tds + '%' : ''} — ${esc(b.note || '')}</li>`).join('')}</ul>
            <p class="note">These values live in <code>TAX_RULES</code> in <code>js/data.js</code>. Edit that one object and every calculator and screen updates.</p></div>`;
          el.querySelector('#ty').onchange = (e) => draw(e.target.value);
        };
        draw(FOS.TAX_RULES.defaultYear);
      } },
      { label: 'Tax calculators', render: (el) => { el.innerHTML = `<div class="card"><p>Open the calculators:</p><div class="row-actions"><a class="btn" href="#/calc/incometax">Income tax estimator</a><a class="btn" href="#/calc/capgains">Capital gains estimator</a><a class="btn" href="#/calc/salary">Salary / CTC analyzer</a></div></div>`; } }
    ]);
  };

  /* ---------- scheme viewer ---------- */
  function schemes(root, ids) {
    const G = FOS.GOVERNMENT_SCHEMES, list = ids || Object.keys(G.schemes), rows = [['Purpose', 'purpose'], ['Eligibility', 'eligibility'], ['Minimum', 'min'], ['Maximum', 'max'], ['Tenure', 'tenure'], ['Interest mechanism', 'mechanism'], ['Tax treatment', 'tax'], ['Withdrawal', 'withdrawal'], ['Lock-in', 'lockin'], ['Risk', 'risk'], ['Liquidity', 'liquidity']];
    const val = (s, k) => (k === 'min' || k === 'max' ? (s[k] == null ? 'No fixed limit' : fmt.inr(s[k])) : esc(s[k]));
    root.innerHTML = `<div class="card"><h3>Scheme data (configurable)</h3>${FOS.sourceBlock(G.meta)}<p class="muted">Rates, limits and tax treatment change. Edit <code>GOVERNMENT_SCHEMES</code> in <code>js/data.js</code>, or override a rate in Settings → Rates &amp; Assumptions.</p>
      <div class="table-scroll"><table class="data schemes"><thead><tr><th>Item</th>${list.map((id) => `<th>${esc(id)}<br><small>${esc(G.schemes[id].name)}</small></th>`).join('')}</tr></thead><tbody>
      <tr><th scope="row">Interest rate (p.a.)</th>${list.map((id) => `<td><b>${FOS.store.schemeRate(id)}%</b></td>`).join('')}</tr>
      ${rows.map(([l, k]) => `<tr><th scope="row">${l}</th>${list.map((id) => `<td>${val(G.schemes[id], k)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>
      <div class="row-actions"><a class="btn" href="#/calc/ppf">PPF calculator</a><a class="btn" href="#/calc/fd">FD calculator</a><a class="btn" href="#/calc/rd">RD calculator</a></div></div>`;
  }
  FOS.tools.schemes = (root) => schemes(root);
  FOS.tools['schemes-post'] = (root) => schemes(root, ['POSB', 'POTD', 'PORD', 'MIS', 'NSC', 'KVP', 'SCSS', 'SSY']);
})();
