/* ==========================================================================
   sources.js — Data & Sources: official links, and the update centre that lets you
   change tax rules, scheme rates, limits and assumptions. Every calculator recalculates.
   ========================================================================== */
(function () {
  'use strict';
  const fmt = FOS.fmt, U = FOS.ui, esc = U.esc, store = FOS.store;
  const today = () => new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  // [category, what to look up, url, where it is used in the app]
  const SOURCES = [
    ['Income tax', 'Slabs, rebate, standard deduction, cess — both regimes', 'https://www.incometax.gov.in', 'Tax Center, Salary analyzer, Tax optimizer, My Plan'],
    ['Income tax', 'Union Budget documents and tax memoranda (what changed this year)', 'https://www.indiabudget.gov.in', 'TAX_RULES (all years)'],
    ['Income tax', 'Due dates: ITR, advance tax, TDS (Compliance calendar)', 'https://www.incometax.gov.in', 'Tax calendar lesson, Reminders'],
    ['Income tax', 'Form 26AS / AIS (your own TDS and income records — login required)', 'https://www.incometax.gov.in', 'Filing checks'],
    ['GST', 'GST rates, registration thresholds, returns calendar', 'https://www.gst.gov.in', 'Business guide'],
    ['Small savings', 'PPF / NSC / KVP / SCSS / SSY / Post Office rates (notified every quarter)', 'https://www.indiapost.gov.in', 'Government & Post Office schemes, PPF calculator, Grow My Money'],
    ['Small savings', 'National Savings Institute — scheme rules, limits', 'https://www.nsiindia.gov.in', 'GOVERNMENT_SCHEMES'],
    ['Small savings', 'Ministry of Finance / Dept. of Economic Affairs — quarterly rate notifications', 'https://dea.gov.in', 'GOVERNMENT_SCHEMES rates'],
    ['Banks & RBI', 'RBI — policy rate, circulars, bank rules, deposit rules', 'https://www.rbi.org.in', 'Banking, Loans, Interest rates'],
    ['Banks & RBI', 'RBI Retail Direct — government securities and floating-rate bonds', 'https://rbiretaildirect.org.in', 'Bonds / Fixed income'],
    ['Banks & RBI', 'DICGC — deposit insurance limit and covered banks', 'https://www.dicgc.org.in', 'Banking lesson'],
    ['Banks & RBI', 'RBI Sachet — check if a deposit-taker or lender is registered', 'https://sachet.rbi.org.in', 'Scam checker'],
    ['Banks & RBI', 'Your own bank / lender websites — FD, loan, card rates and fees', 'https://www.rbi.org.in', 'INTEREST_RATES defaults'],
    ['Investing', 'AMFI — mutual fund NAVs, expense ratios, categories', 'https://www.amfiindia.com', 'Mutual funds'],
    ['Investing', 'SEBI — regulations, registered intermediaries, investor alerts', 'https://www.sebi.gov.in', 'Stocks, Mutual funds, Scam centre'],
    ['Investing', 'SEBI SCORES — file investor complaints', 'https://scores.sebi.gov.in', 'Scam centre'],
    ['Investing', 'NSE and BSE — prices, indices, listed-company filings', 'https://www.nseindia.com', 'Stocks'],
    ['Investing', 'BSE India — filings, results, shareholding', 'https://www.bseindia.com', 'Stocks'],
    ['Retirement', 'EPFO — EPF declared interest rate, passbook, UAN services', 'https://www.epfindia.gov.in', 'EPF / VPF return in Grow My Money'],
    ['Retirement', 'NPS Trust and PFRDA — NPS rules, fund returns, annuity rules', 'https://npstrust.org.in', 'NPS calculator'],
    ['Retirement', 'PFRDA — regulator for pensions', 'https://www.pfrda.org.in', 'NPS rules'],
    ['Insurance', 'IRDAI — insurer registry, claim-settlement data, regulations', 'https://irdai.gov.in', 'Insurance'],
    ['Credit', 'CIBIL — credit score and report (free annual report available)', 'https://www.cibil.com', 'Credit score'],
    ['Vehicles', 'Parivahan — vehicle registration, transfer forms, fees, licences', 'https://parivahan.gov.in', 'Used-vehicle checklist'],
    ['Vehicles', 'Vahan citizen services — check registration details by number', 'https://vahan.parivahan.gov.in', 'Used-vehicle checklist'],
    ['Vehicles', 'e-Challan — pending traffic fines against a registration number', 'https://echallan.parivahan.gov.in', 'Used-vehicle checklist'],
    ['Business', 'Udyam registration (MSME) — free', 'https://udyamregistration.gov.in', 'Start a Business'],
    ['Business', 'MCA — company / LLP / OPC registration', 'https://www.mca.gov.in', 'Start a Business'],
    ['Business', 'Startup India — recognition, schemes', 'https://www.startupindia.gov.in', 'Start a Business'],
    ['Business', 'Mudra loans (PMMY)', 'https://www.mudra.org.in', 'Start a Business, funding'],
    ['Business', 'CGTMSE — collateral-free credit guarantee', 'https://www.cgtmse.in', 'Start a Business, funding'],
    ['Business', 'PMEGP — subsidy for new micro-enterprises', 'https://www.kviconline.gov.in/pmegpeportal', 'Start a Business, funding'],
    ['Business', 'FSSAI — food business licences and registration', 'https://foscos.fssai.gov.in', 'Food business ideas'],
    ['Telangana / AP', 'Telangana single-window clearance (TG-iPASS)', 'https://ipass.telangana.gov.in', 'Business guide (state support)'],
    ['Telangana / AP', 'T-Hub — startup incubator', 'https://t-hub.co', 'Business guide'],
    ['Telangana / AP', 'WE Hub — women entrepreneurs', 'https://wehub.telangana.gov.in', 'Business guide'],
    ['Telangana / AP', 'Andhra Pradesh Industries department', 'https://apindustries.gov.in', 'Business guide'],
    ['Safety', 'National cyber-crime reporting portal (helpline 1930)', 'https://cybercrime.gov.in', 'Scam centre']
  ];
  FOS.SOURCES = SOURCES;
  const link = (u) => `<a href="${u}" target="_blank" rel="noopener noreferrer">${esc(u.replace(/^https?:\/\/(www\.)?/, ''))}</a>`;

  function tabSources(el) {
    const cats = [...new Set(SOURCES.map((s) => s[0]))];
    el.innerHTML = `<div class="card"><h3>Where to find each number</h3><p class="muted">Open the official site, find the figure, then enter it in <b>Update tax rules</b> or <b>Update rates &amp; limits</b>. Every calculator, lesson table and report recalculates from that single place. Addresses are home pages of the official bodies; the exact page for a figure may move, so use the site\'s search for the phrases shown.</p>
      ${cats.map((c) => `<h4>${esc(c)}</h4><div class="table-scroll"><table class="data schemes"><thead><tr><th>What to look up</th><th>Official website</th><th>Used in this app</th></tr></thead><tbody>${SOURCES.filter((s) => s[0] === c).map((s) => `<tr><td>${esc(s[1])}</td><td>${link(s[2])}</td><td>${esc(s[3])}</td></tr>`).join('')}</tbody></table></div>`).join('')}</div>
      <div class="card"><h3>What the app currently holds</h3>${[['Tax rules', FOS.TAX_RULES.years[FOS.TAX_RULES.defaultYear]], ['Government scheme rates', FOS.GOVERNMENT_SCHEMES.meta], ['Interest rates', FOS.INTEREST_RATES.meta], ['Planning assumptions', FOS.FINANCIAL_ASSUMPTIONS.meta]].map(([n, m]) => `<p><b>${esc(n)}</b> — applicable: ${esc(m.label || m.period || '')} · last updated: ${esc(m.lastUpdated)}</p>`).join('')}</div>`;
  }

  /* ---------- tax editor ---------- */
  function tabTax(el) {
    let yr = FOS.TAX_RULES.defaultYear;
    const draw = () => {
      const T = FOS.TAX_RULES, y = T.years[yr], num = (id, v, step) => `<input class="input mini" type="number" inputmode="decimal" step="${step || 'any'}" data-p="${id}" value="${v === null || v === undefined ? '' : v}">`;
      const regime = (k) => { const r = y.regimes[k]; return `<div class="card"><h4>${esc(r.name)}</h4><div class="fields"><div class="field"><label>Standard deduction ₹${num(k + '.std', r.stdDeduction)}</label></div><div class="field"><label>Cess %${num(k + '.cess', r.cessPct)}</label></div><div class="field"><label>Rebate applies up to taxable income ₹${num(k + '.rl', r.rebate.limit)}</label></div><div class="field"><label>Maximum rebate ₹${num(k + '.rm', r.rebate.max)}</label></div><div class="field"><label class="check"><input type="checkbox" data-p="${k}.mr" ${r.rebate.marginalRelief ? 'checked' : ''}> Marginal relief just above the limit</label></div></div><table class="data crud"><thead><tr><th>Slab up to ₹ (blank = no limit)</th><th>Rate %</th></tr></thead><tbody>${r.slabs.map((s, i) => `<tr><td>${num(k + '.su' + i, s[0])}</td><td>${num(k + '.sr' + i, s[1])}</td></tr>`).join('')}</tbody></table></div>`; };
      const cg = y.capitalGains;
      el.innerHTML = `<div class="card"><h3>Update tax rules</h3><p class="muted">Pick a year, change the numbers from the Income Tax Department / Budget, and save. Add a new year when the Budget changes the rules; you can make it the default so every calculator uses it.</p>
        <div class="row-actions"><select class="input" id="tx-y" style="max-width:260px">${Object.keys(T.years).map((k) => `<option ${k === yr ? 'selected' : ''}>${k}</option>`).join('')}</select><button class="btn" id="tx-new">＋ Add a new year (copy this one)</button><span class="muted">Default year now: <b>${esc(T.defaultYear)}</b></span></div>
        <div class="fields"><div class="field"><label>Label<input class="input" data-p="label" value="${esc(y.label)}"></label></div><div class="field"><label>Source note<input class="input" data-p="source" value="${esc(y.source)}"></label></div></div></div>
        <div class="grid-2">${regime('new')}${regime('old')}</div>
        <div class="card"><h4>Capital gains &amp; other</h4><div class="fields">
          <div class="field"><label>Equity short-term rate %${num('cg.stcg', cg.equitySTCG.rate)}</label></div><div class="field"><label>Equity long-term rate %${num('cg.ltcg', cg.equityLTCG.rate)}</label></div><div class="field"><label>Equity long-term yearly exemption ₹${num('cg.ex', cg.equityLTCG.exemption)}</label></div><div class="field"><label>Gold gains rate %${num('cg.gold', cg.gold.rate)}</label></div><div class="field"><label>Crypto rate %${num('cg.cr', cg.crypto.rate)}</label></div><div class="field"><label>Crypto TDS %${num('cg.crt', cg.crypto.tds)}</label></div><div class="field"><label>FD-interest TDS threshold ₹${num('oth.tds', y.other.tdsOnFDInterestThreshold)}</label></div></div>
          <h4>Old-regime deduction limits</h4><div class="fields">${Object.entries(y.deductionsOld).map(([k, v]) => `<div class="field"><label>${esc(k)} ₹<input class="input mini" type="number" inputmode="decimal" data-d="${esc(k)}" value="${v}"></label></div>`).join('')}</div></div>
        <div class="row-actions"><label class="check"><input type="checkbox" id="tx-def" ${T.defaultYear === yr ? 'checked' : ''}> Use ${esc(yr)} as the default year everywhere</label><button class="btn primary" id="tx-save">Save tax rules</button><button class="btn ghost" id="tx-reset">Restore built-in values for ${esc(yr)}</button></div>`;
      el.querySelector('#tx-y').onchange = (e) => { yr = e.target.value; draw(); };
      el.querySelector('#tx-new').onclick = () => { const n = prompt('Name of the new year, e.g. FY2026-27'); if (!n || !/^[\w\- ]{4,14}$/.test(n)) return; if (T.years[n]) return U.toast('That year already exists.'); const c = JSON.parse(JSON.stringify(y)); c.label = n + ' (copy — update the numbers)'; c.lastUpdated = 'Copied on ' + today(); store.mergeConfigPatch({ TAX_RULES: { years: { [n]: c } } }); yr = n; U.toast('Year added — edit the numbers and save.'); draw(); };
      el.querySelector('#tx-save').onclick = () => {
        const g = (id) => el.querySelector(`[data-p="${id}"]`), n = (id) => { const v = g(id).value; return v === '' ? null : Math.max(0, parseFloat(v) || 0); };
        const reg = (k, r) => ({ name: r.name, stdDeduction: n(k + '.std') || 0, cessPct: n(k + '.cess') || 0, rebate: { limit: n(k + '.rl') || 0, max: n(k + '.rm') || 0, marginalRelief: g(k + '.mr').checked }, slabs: r.slabs.map((s, i) => [n(k + '.su' + i), n(k + '.sr' + i) || 0]) });
        const d = {}; el.querySelectorAll('[data-d]').forEach((i) => { d[i.dataset.d] = Math.max(0, parseFloat(i.value) || 0); });
        const patch = { years: { [yr]: { label: g('label').value, source: g('source').value, lastUpdated: 'Updated by you on ' + today(), note: 'Entered from official source', regimes: { new: reg('new', y.regimes.new), old: reg('old', y.regimes.old) }, deductionsOld: d, capitalGains: { equitySTCG: { rate: n('cg.stcg') }, equityLTCG: { rate: n('cg.ltcg'), exemption: n('cg.ex') }, gold: { rate: n('cg.gold') }, crypto: { rate: n('cg.cr'), tds: n('cg.crt') } }, other: { tdsOnFDInterestThreshold: n('oth.tds') } } } };
        if (el.querySelector('#tx-def').checked) patch.defaultYear = yr;
        store.mergeConfigPatch({ TAX_RULES: patch }); U.toast('Tax rules saved — calculators now use these numbers.'); draw();
      };
      el.querySelector('#tx-reset').onclick = () => { const p = JSON.parse(JSON.stringify(store.get().configPatch || {})); if (p.TAX_RULES && p.TAX_RULES.years) delete p.TAX_RULES.years[yr]; store.setConfigPatch(p); if (!FOS.TAX_RULES.years[yr]) yr = FOS.TAX_RULES.defaultYear; U.toast('Restored.'); draw(); };
    };
    draw();
  }

  /* ---------- rates editor ---------- */
  function tabRates(el) {
    const G = FOS.GOVERNMENT_SCHEMES, I = FOS.INTEREST_RATES, A = FOS.FINANCIAL_ASSUMPTIONS, C0 = FOS.calc;
    const inp = (id, v, step) => `<input class="input mini" type="number" inputmode="decimal" step="${step || 'any'}" min="0" data-r="${id}" value="${v === null || v === undefined ? '' : v}">`;
    el.innerHTML = `<div class="card"><h3>Update rates &amp; limits</h3><p class="muted">Type the figures you found on the official sites. Saved values replace the built-in defaults everywhere.</p>
      <h4>Government &amp; Post Office schemes</h4><div class="table-scroll"><table class="data crud"><thead><tr><th>Scheme</th><th>Rate % p.a.</th><th>Minimum ₹</th><th>Maximum ₹ (blank = none)</th></tr></thead><tbody>${Object.entries(G.schemes).map(([k, s]) => `<tr><th scope="row">${k}<br><small class="muted">${esc(s.name)}</small></th><td>${inp('S.' + k + '.rate', s.rate, '0.01')}</td><td>${inp('S.' + k + '.min', s.min)}</td><td>${inp('S.' + k + '.max', s.max)}</td></tr>`).join('')}</tbody></table></div>
      <h4>Market interest rates (%)</h4><div class="fields">${Object.entries(I.rates).map(([k, r]) => `<div class="field"><label>${esc(r.label)}${inp('I.' + k, r.rate, '0.05')}</label></div>`).join('')}</div>
      <h4>How SIP future value is calculated</h4><div class="field wide"><select class="input" data-r="A.sipMethod">${Object.entries(C0.SIP_METHODS).map(([k, t]) => `<option value="${k}" ${A.sipMethod === k ? 'selected' : ''}>${esc(t)}</option>`).join('')}</select><p class="note">Every calculator that projects regular investing (SIP, retirement, goals, NPS, FI, what-if) follows this one setting. The SIP calculator shows all four side by side.</p></div>
      <h4>Planning assumptions</h4><div class="fields">${[['inflation', 'Inflation %'], ['equityReturn', 'Equity return assumption %'], ['debtReturn', 'Debt return assumption %'], ['goldReturn', 'Gold return assumption %'], ['postRetirementReturn', 'Post-retirement return %'], ['retirementAge', 'Retirement age'], ['lifeExpectancy', 'Life expectancy']].map(([k, l]) => `<div class="field"><label>${l}${inp('A.' + k, A[k])}</label></div>`).join('')}</div>
      <div class="row-actions"><button class="btn primary" id="rt-save">Save rates &amp; limits</button></div></div>`;
    el.querySelector('#rt-save').onclick = () => {
      const val = (id) => { const v = el.querySelector(`[data-r="${id}"]`).value; return v === '' ? null : Math.max(0, parseFloat(v) || 0); };
      const patch = { GOVERNMENT_SCHEMES: { meta: { lastUpdated: 'Updated by you on ' + today() }, schemes: {} }, INTEREST_RATES: { meta: { lastUpdated: 'Updated by you on ' + today() }, rates: {} }, FINANCIAL_ASSUMPTIONS: {} };
      Object.keys(G.schemes).forEach((k) => { patch.GOVERNMENT_SCHEMES.schemes[k] = { rate: val('S.' + k + '.rate'), min: val('S.' + k + '.min'), max: val('S.' + k + '.max') }; });
      Object.keys(I.rates).forEach((k) => { patch.INTEREST_RATES.rates[k] = { rate: val('I.' + k) }; });
      ['inflation', 'equityReturn', 'debtReturn', 'goldReturn', 'postRetirementReturn', 'retirementAge', 'lifeExpectancy'].forEach((k) => { patch.FINANCIAL_ASSUMPTIONS[k] = val('A.' + k); });
      patch.FINANCIAL_ASSUMPTIONS.sipMethod = el.querySelector('[data-r="A.sipMethod"]').value;
      store.state_overrides_clear && store.state_overrides_clear();
      store.update((s) => { s.overrides = {}; }); store.mergeConfigPatch(patch); U.toast('Saved — everything now uses your numbers.');
    };
  }

  /* ---------- import / export ---------- */
  function tabFile(el) {
    const keys = ['TAX_RULES', 'GOVERNMENT_SCHEMES', 'INTEREST_RATES', 'FINANCIAL_ASSUMPTIONS'];
    el.innerHTML = `<div class="card"><h3>Data file</h3><p class="muted">Share the figures with me (or any tool) as one JSON file: download the template, fill it in, then load it here. Only the four configuration sections are accepted; your personal data is untouched.</p>
      <div class="row-actions"><button class="btn" id="df-dl">Download current configuration</button><label class="btn file">Load a configuration file<input type="file" id="df-up" accept="application/json,.json" hidden></label><button class="btn danger" id="df-reset">Remove all my updates (back to built-in)</button></div>
      <h4>Or paste a partial update</h4><textarea class="input" id="df-txt" rows="9" spellcheck="false" placeholder='{"GOVERNMENT_SCHEMES":{"schemes":{"PPF":{"rate":7.1}}},"INTEREST_RATES":{"rates":{"fd1y":{"rate":6.8}}}}'></textarea><div class="row-actions"><button class="btn primary" id="df-apply">Apply</button></div></div>`;
    const apply = (txt) => { let o; try { o = JSON.parse(txt); } catch (e) { return U.toast('That is not valid JSON.'); } if (!o || typeof o !== 'object' || Object.keys(o).some((k) => !keys.includes(k))) return U.toast('Only ' + keys.join(', ') + ' sections are allowed.'); store.mergeConfigPatch(o); U.toast('Configuration updated.'); };
    el.querySelector('#df-dl').onclick = () => U.download('finance-os-config.json', JSON.stringify({ TAX_RULES: FOS.TAX_RULES, GOVERNMENT_SCHEMES: FOS.GOVERNMENT_SCHEMES, INTEREST_RATES: FOS.INTEREST_RATES, FINANCIAL_ASSUMPTIONS: FOS.FINANCIAL_ASSUMPTIONS }, null, 2), 'application/json');
    el.querySelector('#df-up').onchange = (e) => { const f = e.target.files[0]; if (!f) return; const r = new FileReader(); r.onload = () => apply(r.result); r.readAsText(f); };
    el.querySelector('#df-apply').onclick = () => apply(el.querySelector('#df-txt').value);
    el.querySelector('#df-reset').onclick = () => { if (confirm('Remove all configuration updates and return to the built-in values?')) { store.setConfigPatch({}); U.toast('Back to built-in values.'); } };
  }

  FOS.tools.sources = (root) => FOS.tabs(root, [{ label: 'Where to find the numbers', render: tabSources }, { label: 'Update tax rules', render: tabTax }, { label: 'Update rates & limits', render: tabRates }, { label: 'Data file', render: tabFile }]);
})();
