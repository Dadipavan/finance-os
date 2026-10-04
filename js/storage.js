/* ==========================================================================
   storage.js — local-first state. Everything stays in this browser.
   ========================================================================== */
window.FOS = window.FOS || {};
(function () {
  'use strict';
  const KEY = 'fos.state.v1';
  const defaults = () => ({
    version: 1,
    profile: { age: '', monthlyIncome: '', annualIncome: '', monthlyExpenses: '', savings: '', investments: '', loans: '', cards: '', dependents: '', retAge: 60, riskUnderstanding: 3, hasHealth: false, healthCover: '', hasTerm: false, termCover: '', hasMotor: false, goalsInterest: [], onboarded: false },
    budget: { method: 'custom', income: '', items: [] },
    assets: [], liabilities: [], snapshots: [], expenses: [], months: {}, suggestDone: {}, bankRates: [], quotes: [], meta: { bankSeeded: false, bankChecked: '', bankSnooze: '', lastExport: '', configChecked: '', noticeSnooze: '', updatedAt: '', lastSync: '', lastArchive: '' }, configPatch: {}, goals: [], recurring: [], reminders: [], records: [],
    timeline: [
      { id: 'tl1', age: 18, text: 'Open first bank account' }, { id: 'tl2', age: 22, text: 'First salary' }, { id: 'tl3', age: 25, text: 'Emergency fund' },
      { id: 'tl4', age: 28, text: 'Vehicle' }, { id: 'tl5', age: 30, text: 'House planning' }, { id: 'tl6', age: 35, text: 'Family goals' },
      { id: 'tl7', age: 45, text: 'Wealth accumulation' }, { id: 'tl8', age: 60, text: 'Retirement' }
    ],
    progress: { lessons: {}, quiz: {} }, checklists: {}, calcSaved: {}, overrides: {},
    settings: { theme: 'light', textSize: 'normal', contrast: false, reduceMotion: false, notify: false }
  });

  const merge = (base, inc) => {
    if (Array.isArray(base) || typeof base !== 'object' || base === null) return inc === undefined ? base : inc;
    const out = {};
    for (const k of Object.keys(base)) out[k] = inc && k in inc ? (typeof base[k] === 'object' && !Array.isArray(base[k]) && base[k] !== null ? merge(base[k], inc[k]) : inc[k]) : base[k];
    if (inc) for (const k of Object.keys(inc)) if (!(k in out)) out[k] = inc[k];
    return out;
  };

  /* ---- configuration patching: user-updated tax rules / rates / limits (Data & Sources) ---- */
  const CFG = ['TAX_RULES', 'GOVERNMENT_SCHEMES', 'INTEREST_RATES', 'FINANCIAL_ASSUMPTIONS'];
  const clone = (x) => JSON.parse(JSON.stringify(x));
  const pristine = {}; CFG.forEach((k) => { pristine[k] = clone(FOS[k]); });
  const dm = (t, p) => { Object.keys(p).forEach((k) => { if (p[k] && typeof p[k] === 'object' && !Array.isArray(p[k]) && t[k] && typeof t[k] === 'object' && !Array.isArray(t[k])) dm(t[k], p[k]); else t[k] = clone(p[k]); }); };
  function applyPatch(patch) {
    CFG.forEach((k) => { const fresh = clone(pristine[k]); Object.keys(FOS[k]).forEach((x) => { if (!(x in fresh)) delete FOS[k][x]; }); dm(FOS[k], fresh); if (k === 'TAX_RULES') Object.keys(FOS[k].years).forEach((y) => { if (!(y in fresh.years)) delete FOS[k].years[y]; }); });
    CFG.forEach((k) => { if (patch && patch[k]) dm(FOS[k], patch[k]); });
    if (FOS.calc && FOS.calc.setSipMethod) FOS.calc.setSipMethod(FOS.FINANCIAL_ASSUMPTIONS.sipMethod);
  }
  FOS.pristineConfig = pristine;

  /* ---- optional passphrase lock: AES-256-GCM, key from PBKDF2-SHA256 (WebCrypto). Nothing readable is stored while locked ---- */
  const ENC = 'fos.state.enc', ITER = 250000, enc8 = { encode: (t) => new TextEncoder().encode(t) }, dec8 = { decode: (b) => new TextDecoder().decode(b) };
  const b64 = (buf) => { let s = ''; new Uint8Array(buf).forEach((c) => { s += String.fromCharCode(c); }); return btoa(s); };
  const unb64 = (t) => Uint8Array.from(atob(t), (c) => c.charCodeAt(0));
  const subtle = () => { if (!(window.crypto && window.crypto.subtle)) throw new Error('Encryption needs a secure (https) page in a modern browser.'); return window.crypto.subtle; };
  async function deriveKey(pass, salt) { const base = await subtle().importKey('raw', enc8.encode(pass), 'PBKDF2', false, ['deriveKey']); return subtle().deriveKey({ name: 'PBKDF2', salt, iterations: ITER, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']); }
  async function encryptWith(key, salt, text) { const iv = window.crypto.getRandomValues(new Uint8Array(12)), ct = await subtle().encrypt({ name: 'AES-GCM', iv }, key, enc8.encode(text)); return JSON.stringify({ fos: 'enc1', iter: ITER, salt: b64(salt), iv: b64(iv), ct: b64(ct) }); }
  async function decryptBlob(blobText, pass) { const b = JSON.parse(blobText); if (b.fos !== 'enc1') throw new Error('Not an encrypted Finance OS file.'); const salt = unb64(b.salt), key = await deriveKey(pass, salt); try { const pt = await subtle().decrypt({ name: 'AES-GCM', iv: unb64(b.iv) }, key, unb64(b.ct)); return { text: dec8.decode(pt), key, salt }; } catch (e) { throw new Error('Wrong passphrase, or the file is damaged.'); } }
  let lockKey = null, lockSalt = null, locked = false, sessionPass = null, chain = Promise.resolve();
  FOS.crypto = { isEncrypted: (t) => { try { return JSON.parse(t).fos === 'enc1'; } catch (e) { return false; } } };

  let state = defaults();
  const subs = [];
  // Future-proofing: older saved data is upgraded here. Add a step per version; never delete fields.
  function migrate(s) { if (!s.version) s.version = 1; ['assets', 'liabilities', 'goals', 'recurring', 'reminders', 'records', 'timeline', 'expenses'].forEach((k) => { (s[k] || []).forEach((it, i) => { if (it && !it.id) it.id = 'm' + k.slice(0, 2) + i + Math.random().toString(36).slice(2, 6); }); }); return s; }
  function load() {
    try { const raw = localStorage.getItem(KEY); if (raw) state = migrate(merge(defaults(), JSON.parse(raw))); else if (localStorage.getItem(ENC)) { locked = true; state = defaults(); } applyPatch(state.configPatch); } catch (e) { console.warn('Could not read saved data', e); state = defaults(); }
  }
  function writeState() {
    const snapshot = JSON.stringify(state);
    if (lockKey) { chain = chain.then(() => encryptWith(lockKey, lockSalt, snapshot)).then((blob) => { localStorage.setItem(ENC, blob); }).catch((e) => { FOS.ui && FOS.ui.toast('Could not save encrypted data: ' + e.message); }); }
    else localStorage.setItem(KEY, snapshot);
    localStorage.setItem('fos.theme', state.settings.theme);
  }
  // Writing the whole data set on every keystroke is slow on phones with a long history, so writes are coalesced:
  // saved ~300 ms after the last change, and immediately when the page is hidden or closed.
  let writeTimer = null, pendingWrite = false; const clr = (t) => { if (typeof clearTimeout === 'function') clearTimeout(t); };
  function flush() {
    if (!pendingWrite || locked) return; pendingWrite = false; clr(writeTimer);
    try { writeState(); } catch (e) { FOS.ui && FOS.ui.toast('Could not save — browser storage may be full or blocked.'); }
  }
  function save() {
    if (locked) return;
    state.meta.updatedAt = new Date().toISOString();
    if (typeof setTimeout === 'function') { pendingWrite = true; clr(writeTimer); writeTimer = setTimeout(flush, 300); }
    else { try { writeState(); } catch (e) { FOS.ui && FOS.ui.toast('Could not save — browser storage may be full or blocked.'); } }
    subs.forEach((f) => f(state));
  }
  if (typeof window.addEventListener === 'function') { window.addEventListener('pagehide', flush); window.addEventListener('beforeunload', flush); }
  if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush(); });
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

  FOS.store = {
    get: () => state,
    save, uid, load, flush,
    setConfigPatch(p) { state.meta.configChecked = new Date().toISOString(); state.configPatch = p || {}; applyPatch(state.configPatch); save(); },
    mergeConfigPatch(p) { state.meta.configChecked = new Date().toISOString(); const cur = clone(state.configPatch || {}); dm(cur, p); state.configPatch = cur; applyPatch(cur); save(); },
    subscribe: (f) => subs.push(f),
    update(fn) { fn(state); save(); },
    exportJSON() { state.meta.lastExport = new Date().toISOString(); pendingWrite = false; try { writeState(); } catch (e) { /* ignore */ } return JSON.stringify({ app: 'finance-os', version: 1, exportedAt: new Date().toISOString(), data: state }, null, 2); },
    importJSON(text) {
      let o; try { o = JSON.parse(text); } catch (e) { throw new Error('That file is not valid JSON.'); }
      if (o && o.fos === 'enc1') { const er = new Error('This file is encrypted — enter your passphrase.'); er.needsPass = true; throw er; }
      if (!o || o.app !== 'finance-os' || typeof o.data !== 'object') throw new Error('This does not look like a Finance OS export.');
      state = migrate(merge(defaults(), o.data)); applyPatch(state.configPatch); save();
    },
    async selfTestCrypto() { const salt = window.crypto.getRandomValues(new Uint8Array(16)), key = await deriveKey('self-test-passphrase', salt), msg = 'finance-os ' + Math.random(), blob = await encryptWith(key, salt, msg), back = await decryptBlob(blob, 'self-test-passphrase'); let wrongRejected = false; try { await decryptBlob(blob, 'wrong'); } catch (e) { wrongRejected = true; } return back.text === msg && wrongRejected; },
    isLocked: () => locked, hasLock: () => !!lockKey || locked, sessionPass: () => sessionPass,
    async unlock(pass) { const blob = localStorage.getItem(ENC); const r = await decryptBlob(blob, pass); state = merge(defaults(), JSON.parse(r.text)); applyPatch(state.configPatch); lockKey = r.key; lockSalt = r.salt; sessionPass = pass; locked = false; },
    async enableLock(pass) {
      if (!pass || pass.length < 8) throw new Error('Use a passphrase of at least 8 characters.');
      const salt = window.crypto.getRandomValues(new Uint8Array(16)), key = await deriveKey(pass, salt), text = JSON.stringify(state);
      const blob = await encryptWith(key, salt, text), back = await decryptBlob(blob, pass);        // self-test: must round-trip exactly
      if (back.text !== text) throw new Error('Encryption self-test failed — nothing was changed.');
      localStorage.setItem(ENC, blob); localStorage.removeItem(KEY); lockKey = key; lockSalt = salt; sessionPass = pass;
    },
    async disableLock() { localStorage.setItem(KEY, JSON.stringify(state)); localStorage.removeItem(ENC); lockKey = null; lockSalt = null; sessionPass = null; },
    async exportEncrypted(pass) { const salt = window.crypto.getRandomValues(new Uint8Array(16)), key = await deriveKey(pass, salt); return encryptWith(key, salt, JSON.stringify({ app: 'finance-os', version: 1, exportedAt: new Date().toISOString(), data: state })); },
    async decryptText(text, pass) { return (await decryptBlob(text, pass)).text; },
    async importEncrypted(text, pass) { const r = await decryptBlob(text, pass); this.importJSON(r.text); },
    reset() { pendingWrite = false; clr(writeTimer); state = defaults(); applyPatch({}); lockKey = null; locked = false; sessionPass = null; try { localStorage.removeItem(KEY); localStorage.removeItem(ENC); localStorage.removeItem('fos.theme'); } catch (e) { /* ignore */ } subs.forEach((f) => f(state)); },
    // Config lookup honouring user overrides (Settings → Rates & Assumptions)
    rate(key, fallback) { const v = state.overrides['rate.' + key]; return v !== undefined && v !== '' ? +v : fallback; },
    schemeRate(id) { const v = state.overrides['scheme.' + id]; return v !== undefined && v !== '' ? +v : FOS.GOVERNMENT_SCHEMES.schemes[id].rate; },
    assume(key) { const v = state.overrides['assume.' + key]; return v !== undefined && v !== '' ? +v : FOS.FINANCIAL_ASSUMPTIONS[key]; },
    interest(key) { const v = state.overrides['rate.' + key]; return v !== undefined && v !== '' ? +v : FOS.INTEREST_RATES.rates[key].rate; }
  };
  load();

  /* ---------- derived metrics: the single source for dashboard / health / reports ---------- */
  const n = (x) => (Number.isFinite(+x) ? +x : 0);
  const sum = (a, f) => a.reduce((s, x) => s + n(f(x)), 0);
  FOS.metrics = function () {
    const s = state, p = s.profile, b = s.budget;
    const hasBudget = b.items.length > 0 || n(b.income) > 0;
    // numbersFrom === 'form': the user typed income/expenses in "Start my financial journey" and chose those over the Budget tool
    const fromForm = p.numbersFrom === 'form';
    const income = fromForm ? (n(p.monthlyIncome) || n(p.annualIncome) / 12) : (n(b.income) || n(p.monthlyIncome) || n(p.annualIncome) / 12);
    const budgetExp = sum(b.items.filter((i) => i.kind !== 'save'), (i) => i.amount);
    const budgetNeed = sum(b.items.filter((i) => i.kind === 'need'), (i) => i.amount);
    const budgetSave = p.numbersFrom === 'form' ? 0 : sum(b.items.filter((i) => i.kind === 'save'), (i) => i.amount);
    const expenses = fromForm ? n(p.monthlyExpenses) : (b.items.length ? budgetExp : n(p.monthlyExpenses));
    const essential = !fromForm && b.items.length && budgetNeed > 0 ? budgetNeed : expenses;
    const savings = income - expenses;
    const assets = sum(s.assets, (a) => a.value), liabilities = sum(s.liabilities, (l) => l.value);
    const byCat = (arr, c) => sum(arr.filter((x) => x.cat === c), (x) => x.value);
    const efGoals = sum(s.goals.filter((g) => g.type === 'Emergency Fund'), (g) => g.current);
    const ef = byCat(s.assets, 'Emergency Fund') + efGoals;
    const liquid = byCat(s.assets, 'Cash') + byCat(s.assets, 'Bank') + ef;
    const investments = byCat(s.assets, 'Investments') + byCat(s.assets, 'FD') + byCat(s.assets, 'RD') + byCat(s.assets, 'Gold');
    const emi = sum(s.liabilities, (l) => l.emi);
    const recurringMonthly = sum(s.recurring, (r) => FOS.freqToMonthly(r.amount, r.freq));
    return {
      hasBudget, fromForm, income, expenses, essential, savings, budgetSave, savingsRate: income > 0 ? (savings / income) * 100 : NaN,
      assets, liabilities, netWorth: assets - liabilities, ef, liquid, investments, emi,
      dti: income > 0 ? (emi / income) * 100 : NaN, efMonths: essential > 0 ? ef / essential : NaN,
      liquidMonths: essential + emi > 0 ? liquid / (essential + emi) : NaN, recurringMonthly,
      goalProgress: s.goals.map((g) => ({ name: g.name, pct: n(g.target) > 0 ? Math.min(100, (n(g.current) / n(g.target)) * 100) : 0 }))
    };
  };
  FOS.freqToMonthly = (amt, f) => n(amt) * ({ daily: 30.4375, weekly: 52 / 12, monthly: 1, quarterly: 1 / 3, yearly: 1 / 12, once: 0 }[f] ?? 1);
})();
