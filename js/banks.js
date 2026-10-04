/* ==========================================================================
   banks.js — Bank Rates Book: the real banks YOU use and their current rates,
   with FD and loan comparison. Rates change often, so you enter/refresh them
   (the app reminds you at the start of every financial year).
   ========================================================================== */
(function () {
  'use strict';
  const C = FOS.calc, fmt = FOS.fmt, U = FOS.ui, esc = U.esc, store = FOS.store, ch = () => FOS.charts;
  const today = () => new Date().toISOString().slice(0, 10);
  const TYPES = ['PSU bank', 'Private bank', 'Small finance bank', 'Cooperative bank', 'Post office', 'NBFC / housing finance', 'Other'];
  // Representative starting figures (from your study guide, "verify with the bank"). Replace them with the real current numbers.
  const SEED = [['State Bank of India (SBI)', 'PSU bank', 6.5, 6.5, 6.5, 6.5], ['Punjab National Bank (PNB)', 'PSU bank', 6.75, 6.8, 7.0, 6.5], ['Bank of Baroda (BoB)', 'PSU bank', 6.85, 7.15, 6.8, 6.8], ['HDFC Bank', 'Private bank', 6.6, 7.0, 6.95, 6.9], ['ICICI Bank', 'Private bank', 6.7, 7.0, 6.9, 6.9], ['Axis Bank', 'Private bank', 6.7, 7.1, 7.0, 7.0], ['Kotak Mahindra Bank', 'Private bank', 6.7, 7.0, 6.9, 6.8], ['AU Small Finance Bank', 'Small finance bank', 7.25, 7.75, 7.5, 7.25], ['Equitas Small Finance Bank', 'Small finance bank', 7.5, 8.0, 7.75, 7.25], ['Ujjivan Small Finance Bank', 'Small finance bank', 7.5, 7.95, 7.2, 7.2]];
  FOS.seedBanks = function () {
    store.update((s) => { if (s.meta.bankSeeded) return; s.meta.bankSeeded = true; SEED.forEach(([name, type, a, b, c, d]) => s.bankRates.push({ id: store.uid(), name, type, savings: '', fd1: a, fd2: b, fd3: c, fd5: d, senior: 0.5, rd: '', home: '', car: '', personal: '', updated: '', seed: true, source: '' })); });
  };
  const num = (x) => (x === '' || x === null || x === undefined || !Number.isFinite(+x) ? null : +x);
  const FYSTART = (now) => { now = now || new Date(); const y = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1; return y + '-04-01'; };
  // true when the rates you entered are older than this financial year, or older than ~4 months
  FOS.bankRatesStale = function (now) {
    const s = store.get(); if (!s.bankRates.length) return null; now = now || new Date();
    if (s.meta.bankSnooze && now < new Date(s.meta.bankSnooze)) return null;
    const dates = s.bankRates.map((b) => b.updated).filter(Boolean).concat(s.meta.bankChecked ? [s.meta.bankChecked.slice(0, 10)] : []).sort(), last = dates[dates.length - 1] || null;
    if (!last) return { text: 'The bank rates in your Rates Book are only sample figures. Replace them with your banks\' current rates (about 5 minutes).' };
    if (last < FYSTART(now)) return { text: 'A new financial year has started. Bank FD and loan rates have probably changed since ' + fmt.date(last) + ' — update the banks you use.' };
    if ((now - new Date(last)) / 864e5 > 120) return { text: 'Bank rates were last updated on ' + fmt.date(last) + '. Rates change often — refresh them.' };
    return null;
  };
  FOS.bankCompareFD = function (o) {   // o: {amount, years (1|2|3|5), senior, slab}
    const key = { 1: 'fd1', 2: 'fd2', 3: 'fd3', 5: 'fd5' }[o.years];
    return store.get().bankRates.map((b) => { const base = num(b[key]); if (base === null) return null; const rate = base + (o.senior ? (num(b.senior) || 0) : 0), A = C.fd(o.amount, rate, o.years, 4), gain = A - o.amount, post = o.amount + gain * (1 - o.slab / 100); return { id: b.id, name: b.name, type: b.type, rate, maturity: A, gain, post, seed: !!b.seed, over: Math.max(0, o.amount - 500000) }; }).filter(Boolean).sort((p, q) => q.post - p.post);
  };
  FOS.bankCompareLoan = function (o) {  // o: {kind: home|car|personal, amount, years}
    return store.get().bankRates.map((b) => { const r = num(b[o.kind]); if (r === null) return null; const n = Math.round(o.years * 12), emi = C.emi(o.amount, r, n); return { id: b.id, name: b.name, type: b.type, rate: r, emi, interest: emi * n - o.amount, total: emi * n }; }).filter(Boolean).sort((p, q) => p.interest - q.interest);
  };

  FOS.tools.bankrates = function (root) {
    FOS.seedBanks();
    FOS.tabs(root, [
      { label: 'My rates book', render: (el) => {
        const s = store.get(), sample = s.bankRates.filter((b) => b.seed).length;
        el.innerHTML = `<div class="card"><h3>The real banks I use — and their rates today</h3><p class="muted">Rates change, so this is <b>your</b> book: type what your bank shows on its website or app. Editing a rate stamps today's date on that bank. ${sample ? `<b class="warn-t">${sample} rows are only representative sample figures</b> (shown with “sample”) — replace them with the bank's current numbers.` : ''}</p>
          <div class="row-actions"><button class="btn" id="bk-checked">I checked all of these today</button><button class="btn ghost" id="bk-clear">Remove the sample banks</button></div><div id="bk-list"></div>
          <p class="note"><b>Where to find a rate:</b> the bank's website → “Interest rates” (FD / savings) and “Loans” pages, or the branch rate card. Small-savings rates are in Data &amp; Sources. Always note the date — banks revise rates several times a year.</p></div>`;
        FOS.crud(el.querySelector('#bk-list'), { list: (st) => st.bankRates, addLabel: 'Add a bank', pageSize: 40,
          cols: [{ k: 'name', label: 'Bank', type: 'text' }, { k: 'type', label: 'Type', type: 'select', options: TYPES }, { k: 'savings', label: 'Savings %', type: 'number' }, { k: 'fd1', label: 'FD 1 yr %', type: 'number' }, { k: 'fd2', label: 'FD 2 yr %', type: 'number' }, { k: 'fd3', label: 'FD 3 yr %', type: 'number' }, { k: 'fd5', label: 'FD 5 yr %', type: 'number' }, { k: 'senior', label: 'Senior extra %', type: 'number' }, { k: 'rd', label: 'RD %', type: 'number' }, { k: 'home', label: 'Home loan %', type: 'number' }, { k: 'car', label: 'Car loan %', type: 'number' }, { k: 'personal', label: 'Personal loan %', type: 'number' }, { k: 'updated', label: 'Updated', type: 'date' }, { k: 'source', label: 'Where I saw it', type: 'text' }],
          blank: () => ({ name: '', type: 'Private bank', savings: '', fd1: '', fd2: '', fd3: '', fd5: '', senior: 0.5, rd: '', home: '', car: '', personal: '', updated: today(), source: '' }),
          touch: (it, k) => { if (/^(savings|fd\d|senior|rd|home|car|personal)$/.test(k)) { it.updated = today(); it.seed = false; } }, empty: 'Add the banks you use.' });
        el.querySelector('#bk-checked').onclick = () => { store.update((st) => { st.meta.bankChecked = new Date().toISOString(); st.bankRates.forEach((b) => { if (!b.seed) b.updated = today(); }); }); U.toast('Saved — reminder reset'); };
        el.querySelector('#bk-clear').onclick = () => { if (confirm('Remove the sample banks? Rows you edited yourself stay.')) { store.update((st) => { st.bankRates = st.bankRates.filter((b) => !b.seed); }); FOS.route(); } };
      } },
      { label: 'Compare FD rates', render: (el) => {
        el.innerHTML = `<div class="card"><h3>Which bank pays me the most on an FD?</h3><div class="fields"><div class="field"><label>Amount ₹<input class="input" id="cf-a" type="number" inputmode="decimal" min="0" value="300000"></label></div><div class="field"><label>Tenure<select class="input" id="cf-t"><option value="1">1 year</option><option value="2">2 years</option><option value="3">3 years</option><option value="5" selected>5 years</option></select></label></div><div class="field"><label>Senior citizen?<select class="input" id="cf-s"><option value="0">No</option><option value="1">Yes (adds the extra %)</option></select></label></div><div class="field"><label>Your tax slab %<select class="input" id="cf-x">${[0, 5, 10, 15, 20, 25, 30].map((x) => `<option ${x === 20 ? 'selected' : ''}>${x}</option>`).join('')}</select></label></div></div><div id="cf-out"></div></div>`;
        const draw = () => { const o = { amount: Math.max(0, +el.querySelector('#cf-a').value || 0), years: +el.querySelector('#cf-t').value, senior: el.querySelector('#cf-s').value === '1', slab: +el.querySelector('#cf-x').value }, rows = FOS.bankCompareFD(o), best = rows[0];
          el.querySelector('#cf-out').innerHTML = rows.length ? `<div class="table-scroll"><table class="data"><thead><tr><th>Bank</th><th>Rate</th><th>Maturity</th><th>After tax</th><th>vs best</th></tr></thead><tbody>${rows.map((r, i) => `<tr><th scope="row">${i === 0 ? '🥇 ' : ''}${esc(r.name)}<br><small class="muted">${esc(r.type)}${r.seed ? ' · sample rate' : ''}</small></th><td>${fmt.pct(r.rate, 2)}</td><td>${fmt.inr(r.maturity)}</td><td><b>${fmt.inr(r.post)}</b></td><td>${i === 0 ? '—' : '−' + fmt.inr(best.post - r.post)}</td></tr>`).join('')}</tbody></table></div>${ch().bar({ title: 'After-tax maturity by bank', cats: rows.slice(0, 8).map((r) => r.name.split(' ')[0]), series: [{ name: 'After tax', data: rows.slice(0, 8).map((r) => r.post) }], yfmt: 'inr' })}<p class="note">${o.amount > 500000 ? `<b class="warn-t">Deposit insurance covers up to ₹5 lakh per depositor per bank.</b> You are placing ${fmt.inr(o.amount)} — consider splitting it across banks. ` : ''}Interest compounded quarterly. Higher rate usually means a smaller or riskier bank: check it is RBI-regulated and DICGC-covered. Early withdrawal usually cuts the rate by ~0.5–1%.</p>` : '<p class="muted">Enter FD rates in “My rates book” first.</p>'; };
        el.oninput = draw; el.onchange = draw; draw();
      } },
      { label: 'Compare loan rates', render: (el) => {
        el.innerHTML = `<div class="card"><h3>Which bank is cheapest for my loan?</h3><div class="fields"><div class="field"><label>Loan type<select class="input" id="cl-k"><option value="home">Home loan</option><option value="car">Car / vehicle loan</option><option value="personal">Personal loan</option></select></label></div><div class="field"><label>Amount ₹<input class="input" id="cl-a" type="number" inputmode="decimal" min="0" value="3000000"></label></div><div class="field"><label>Tenure (years)<input class="input" id="cl-y" type="number" inputmode="decimal" min="1" max="40" value="20"></label></div></div><div id="cl-out"></div></div>`;
        const draw = () => { const o = { kind: el.querySelector('#cl-k').value, amount: Math.max(0, +el.querySelector('#cl-a').value || 0), years: Math.min(40, Math.max(1, +el.querySelector('#cl-y').value || 1)) }, rows = FOS.bankCompareLoan(o), best = rows[0];
          el.querySelector('#cl-out').innerHTML = rows.length ? `<div class="table-scroll"><table class="data"><thead><tr><th>Bank</th><th>Rate</th><th>EMI</th><th>Total interest</th><th>vs cheapest</th></tr></thead><tbody>${rows.map((r, i) => `<tr><th scope="row">${i === 0 ? '🥇 ' : ''}${esc(r.name)}<br><small class="muted">${esc(r.type)}</small></th><td>${fmt.pct(r.rate, 2)}</td><td>${fmt.inr(r.emi)}</td><td><b>${fmt.inr(r.interest)}</b></td><td>${i === 0 ? '—' : '+' + fmt.inr(r.interest - best.interest)}</td></tr>`).join('')}</tbody></table></div><p class="note">Rate is not the whole price: add the processing fee, GST, insurance and prepayment terms — use the <a href="#/calc/loancost">Loan true cost</a> calculator. Floating-rate loans change when the lender's benchmark changes.</p>` : '<p class="muted">No bank has a rate filled in for this loan type yet. Add it in “My rates book”.</p>'; };
        el.oninput = draw; el.onchange = draw; draw();
      } }
    ]);
  };

  /* ---------------- insurance quote comparison ---------------- */
  FOS.quoteStats = function (items) {
    const ok = items.filter((q) => +q.cover > 0 && +q.premium > 0).map((q) => Object.assign({}, q, { perLakh: +q.premium / (+q.cover / 1e5), tenYear: +q.premium * 10, flags: [+q.copay > 0 ? 'co-pay ' + q.copay + '%' : '', +q.waiting > 3 ? 'waiting period ' + q.waiting + ' yrs' : '', q.claim !== '' && +q.claim < 95 ? 'claim ratio ' + q.claim + '%' : ''].filter(Boolean) }));
    const by = {}; ok.forEach((q) => { (by[q.kind] = by[q.kind] || []).push(q); }); Object.values(by).forEach((a) => a.sort((p, q) => p.perLakh - q.perLakh));
    return by;
  };
  FOS.tools.quotes = function (root) {
    root.innerHTML = `<div class="card"><h3>Compare insurance quotes side by side</h3><p class="muted">Enter each quote you get (from an insurer's website, an aggregator or an agent). The cheapest premium is <b>not</b> automatically the best — the flags show what is being traded away.</p><div id="q-list"></div><div id="q-out"></div></div>`;
    const draw = () => { const by = FOS.quoteStats(store.get().quotes); root.querySelector('#q-out').innerHTML = Object.keys(by).length ? Object.entries(by).map(([k, a]) => `<h4>${esc(k)} — ranked by premium per ₹1 lakh of cover</h4><div class="table-scroll"><table class="data"><thead><tr><th>Insurer</th><th>Cover</th><th>Premium / yr</th><th>Per ₹1 lakh</th><th>10 years*</th><th>Watch out</th></tr></thead><tbody>${a.map((q, i) => `<tr><th scope="row">${i === 0 ? '🥇 ' : ''}${esc(q.insurer || 'Unnamed')}</th><td>${fmt.inr(+q.cover)}</td><td>${fmt.inr(+q.premium)}</td><td><b>${fmt.inr(q.perLakh, 1)}</b></td><td>${fmt.inr(q.tenYear)}</td><td>${q.flags.length ? esc(q.flags.join(' · ')) : '—'}</td></tr>`).join('')}</tbody></table></div>`).join('') + '<p class="note">* Flat ten-year total; real premiums rise with age and claims. Before choosing: read the exclusions, the waiting periods, the room-rent limit (health), the claim settlement ratio and the network hospitals / garages near you.</p>' : ''; };
    FOS.crud(root.querySelector('#q-list'), { list: (s) => s.quotes, addLabel: 'Add a quote', empty: 'No quotes yet.',
      cols: [{ k: 'insurer', label: 'Insurer / plan', type: 'text' }, { k: 'kind', label: 'Type', type: 'select', options: ['Health', 'Term life', 'Motor', 'Personal accident', 'Travel', 'Home', 'Other'] }, { k: 'cover', label: 'Cover ₹', type: 'money' }, { k: 'premium', label: 'Premium ₹/yr', type: 'money' }, { k: 'copay', label: 'Co-pay %', type: 'number' }, { k: 'waiting', label: 'Pre-existing waiting (yrs)', type: 'number' }, { k: 'claim', label: 'Claim settlement %', type: 'number' }, { k: 'notes', label: 'Notes (room-rent cap, exclusions…)', type: 'text' }],
      blank: () => ({ insurer: '', kind: 'Health', cover: '', premium: '', copay: 0, waiting: '', claim: '', notes: '' }), onChange: draw });
    draw();
  };
})();
