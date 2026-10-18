/* ==========================================================================
   storage.js — local-first state. Everything stays in this browser.
   Safety rules (learned the hard way):
   · JSON that comes from outside (import, Drive, config files) is rebuilt key by key before use — no __proto__ tricks, bounded size.
   · Sample data runs as an isolated DEMO in memory. It can never write to your saved data or to Google Drive.
   · Every action that replaces your data first keeps a local safety copy (Settings → Safety copies).
   · A save that cannot be read is kept aside and never overwritten silently.
   ========================================================================== */
window.FOS = window.FOS || {};
(function () {
  'use strict';
  const KEY = 'fos.state.v1';
  const LISTS = ['assets', 'liabilities', 'goals', 'recurring', 'reminders', 'records', 'timeline', 'expenses', 'snapshots', 'bankRates', 'quotes'];
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
    settings: { theme: 'auto', textSize: 'normal', contrast: false, reduceMotion: false, notify: false }
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
  const BAD = (k) => k === '__proto__' || k === 'constructor' || k === 'prototype';
  const isObj = (x) => !!x && typeof x === 'object' && !Array.isArray(x);
  const pristine = {}; CFG.forEach((k) => { pristine[k] = clone(FOS[k]); });
  // deep merge that can never reach Object.prototype: dangerous keys are skipped
  const dm = (t, p) => { Object.keys(p).forEach((k) => { if (BAD(k)) return; if (isObj(p[k]) && isObj(t[k])) dm(t[k], p[k]); else t[k] = clone(p[k]); }); };

  /* ---- untrusted JSON (imports, Drive files, config patches): rebuilt key by key, depth and size bounded ---- */
  function clean(v, depth) {
    if (depth > 14) return null;
    if (Array.isArray(v)) return v.slice(0, 50000).map((x) => clean(x, depth + 1));
    if (v && typeof v === 'object') { const o = {}; Object.keys(v).forEach((k) => { if (!BAD(k)) o[k] = clean(v[k], depth + 1); }); return o; }
    if (typeof v === 'number') return Number.isFinite(v) ? v : 0;
    if (typeof v === 'string') return v.length > 20000 ? v.slice(0, 20000) : v;
    return typeof v === 'boolean' || v === null ? v : null;
  }
  const SAFE_ID = /^[\w.:-]{1,80}$/, YM = /^\d{4}-\d{2}$/;
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  FOS.sanitize = clean;
  function sanitizeState(raw) {
    const s = clean(raw, 0);
    if (!isObj(s)) throw new Error('The data is not in the expected format.');
    ['profile', 'budget', 'months', 'suggestDone', 'meta', 'configPatch', 'progress', 'checklists', 'calcSaved', 'overrides', 'settings'].forEach((k) => { if (k in s && !isObj(s[k])) delete s[k]; });
    LISTS.forEach((k) => {
      if (!(k in s)) return;
      if (!Array.isArray(s[k])) { delete s[k]; return; }
      s[k] = s[k].filter(isObj);
      s[k].forEach((it) => { if (it.id !== undefined && !SAFE_ID.test(String(it.id))) it.id = 'x' + uid(); else if (it.id !== undefined) it.id = String(it.id); });
    });
    if (s.snapshots) s.snapshots = s.snapshots.filter((x) => YM.test(String(x.date))).map((x) => Object.assign(x, { date: String(x.date) }));
    if (s.budget && 'items' in s.budget) { s.budget.items = Array.isArray(s.budget.items) ? s.budget.items.filter(isObj) : []; s.budget.items.forEach((it) => { if (it.id !== undefined && !SAFE_ID.test(String(it.id))) it.id = 'x' + uid(); }); }
    if (s.months) Object.keys(s.months).forEach((k) => { if (!YM.test(k) || !isObj(s.months[k])) delete s.months[k]; });
    if (s.configPatch) Object.keys(s.configPatch).forEach((k) => { if (!CFG.includes(k) || !isObj(s.configPatch[k])) delete s.configPatch[k]; });
    return s;
  }
  const cleanPatch = (p) => { const c = isObj(p) ? clean(p, 0) : {}; Object.keys(c).forEach((k) => { if (!CFG.includes(k) || !isObj(c[k])) delete c[k]; }); return c; };

  // The default tax year follows today's date (so the app rolls forward on 1 April) unless you pinned a year in Data & Sources.
  function resolveTaxYear(patch) {
    const T = FOS.TAX_RULES, pinned = patch && patch.TAX_RULES && patch.TAX_RULES.defaultYear;
    if (pinned && pinned !== 'auto' && T.years[pinned]) { T.defaultYear = pinned; return; }
    const cur = FOS.dates ? FOS.dates.fy(new Date()) : '', keys = Object.keys(T.years).sort(), past = keys.filter((k) => k <= cur);
    T.defaultYear = T.years[cur] ? cur : (past.length ? past[past.length - 1] : keys[keys.length - 1]);
  }
  function applyPatch(patch) {
    patch = cleanPatch(patch);
    CFG.forEach((k) => { const fresh = clone(pristine[k]); Object.keys(FOS[k]).forEach((x) => { if (!(x in fresh)) delete FOS[k][x]; }); dm(FOS[k], fresh); if (k === 'TAX_RULES') Object.keys(FOS[k].years).forEach((y) => { if (!(y in fresh.years)) delete FOS[k].years[y]; }); });
    CFG.forEach((k) => { if (patch[k]) { try { dm(FOS[k], patch[k]); } catch (e) { console.warn('Ignored a bad configuration patch for ' + k, e); } } });
    resolveTaxYear(patch);
    if (FOS.calc && FOS.calc.setSipMethod) FOS.calc.setSipMethod(FOS.FINANCIAL_ASSUMPTIONS.sipMethod);
  }
  FOS.pristineConfig = pristine;

  /* ---- optional passphrase lock: AES-256-GCM, key from PBKDF2-SHA256 (WebCrypto). Nothing readable is stored while locked ---- */
  const ENC = 'fos.state.enc', ITER_OLD = 250000, ITER_NEW = 600000, enc8 = { encode: (t) => new TextEncoder().encode(t) }, dec8 = { decode: (b) => new TextDecoder().decode(b) };
  const b64 = (buf) => { let s = ''; new Uint8Array(buf).forEach((c) => { s += String.fromCharCode(c); }); return btoa(s); };
  const unb64 = (t) => Uint8Array.from(atob(t), (c) => c.charCodeAt(0));
  const subtle = () => { if (!(window.crypto && window.crypto.subtle)) throw new Error('Encryption needs a secure (https) page in a modern browser.'); return window.crypto.subtle; };
  async function deriveKey(pass, salt, iter) { const base = await subtle().importKey('raw', enc8.encode(pass), 'PBKDF2', false, ['deriveKey']); return subtle().deriveKey({ name: 'PBKDF2', salt, iterations: iter, hash: 'SHA-256' }, base, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']); }
  async function encryptWith(key, salt, text, iter) { const iv = window.crypto.getRandomValues(new Uint8Array(12)), ct = await subtle().encrypt({ name: 'AES-GCM', iv }, key, enc8.encode(text)); return JSON.stringify({ fos: 'enc1', iter, salt: b64(salt), iv: b64(iv), ct: b64(ct) }); }
  // the iteration count comes from the file (older backups used 250,000); clamp it so a hostile file cannot freeze the browser
  async function decryptBlob(blobText, pass) { const b = JSON.parse(blobText); if (b.fos !== 'enc1') throw new Error('Not an encrypted Finance OS file.'); const iter = Math.min(2000000, Math.max(10000, +b.iter || ITER_OLD)), salt = unb64(b.salt), key = await deriveKey(pass, salt, iter); try { const pt = await subtle().decrypt({ name: 'AES-GCM', iv: unb64(b.iv) }, key, unb64(b.ct)); return { text: dec8.decode(pt), key, salt, iter }; } catch (e) { throw new Error('Wrong passphrase, or the file is damaged.'); } }
  let lockKey = null, lockSalt = null, lockIter = ITER_NEW, locked = false, sessionPass = null, chain = Promise.resolve(), inflight = 0;
  FOS.crypto = { isEncrypted: (t) => { try { return JSON.parse(t).fos === 'enc1'; } catch (e) { return false; } } };

  /* ---- hashing and counting: used to tell "changed since last sync" from "just saved again" ---- */
  const stable = (v) => (Array.isArray(v) ? '[' + v.map(stable).join(',') + ']' : v && typeof v === 'object' ? '{' + Object.keys(v).sort().map((k) => JSON.stringify(k) + ':' + stable(v[k])).join(',') + '}' : JSON.stringify(v));
  const h53 = (str) => { let h1 = 0xdeadbeef, h2 = 0x41c6ce57; for (let i = 0; i < str.length; i++) { const c = str.charCodeAt(i); h1 = Math.imul(h1 ^ c, 2654435761); h2 = Math.imul(h2 ^ c, 1597334677); } h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909); h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909); return (4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(36); };
  const VOLATILE = ['updatedAt', 'lastSync', 'lastArchive', 'lastExport'];
  function hashOf(st) { const m = Object.assign({}, st.meta); VOLATILE.forEach((k) => { delete m[k]; }); return h53(stable(Object.assign({}, st, { meta: m }))); }
  // how much of YOUR data is in a state (sample rows, seeded bank rows and the default timeline do not count)
  function counts(st) {
    const c = {}; let total = 0;
    LISTS.forEach((k) => { if (k === 'timeline') return; c[k] = (st[k] || []).filter((x) => x && !x.sample && !x.seed).length; total += c[k]; });
    c.budget = ((st.budget && st.budget.items) || []).filter((x) => x && !x.sample).length; total += c.budget;
    c.months = Object.keys(st.months || {}).length; total += c.months;
    c.total = total; return c;
  }
  function hasUserData(st) { const p = st.profile || {}; return counts(st).total > 0 || (!p.sampleSet && (!!p.onboarded || ['monthlyIncome', 'annualIncome', 'monthlyExpenses'].some((k) => +p[k] > 0))); }
  function summaryOf(st) {
    const c = counts(st), bits = [[c.assets, 'assets'], [c.liabilities, 'loans/dues'], [c.goals, 'goals'], [c.expenses, 'expenses'], [c.snapshots, 'month snapshots'], [c.budget, 'budget lines'], [c.reminders + c.records + c.recurring, 'reminders/records']].filter((x) => x[0] > 0).map((x) => x[0] + ' ' + x[1]);
    const sample = !!(st.meta && st.meta.sample) || (st.assets || []).some((a) => a.sample);
    return { counts: c, sample, empty: !hasUserData(st), text: bits.length ? bits.join(' · ') : 'no records yet' };
  }

  let state = defaults(), real = null, demo = false, readOnly = false, loadProblem = null;
  const subs = [];
  // Future-proofing: older saved data is upgraded here. Add a step per version; never delete fields.
  function migrate(s) { if (!s.version) s.version = 1; ['assets', 'liabilities', 'goals', 'recurring', 'reminders', 'records', 'timeline', 'expenses'].forEach((k) => { (s[k] || []).forEach((it, i) => { if (it && !it.id) it.id = 'm' + k.slice(0, 2) + i + Math.random().toString(36).slice(2, 6); }); }); return s; }
  const prep = (raw) => migrate(merge(defaults(), sanitizeState(raw)));

  function load() {
    let raw = null, enc = null;
    try { raw = localStorage.getItem(KEY); enc = localStorage.getItem(ENC); } catch (e) { /* storage blocked: the app still works, nothing is saved */ }
    try {
      if (raw) state = prep(JSON.parse(raw));
      else if (enc) { locked = true; state = defaults(); }
      applyPatch(state.configPatch);
    } catch (e) {
      // An unreadable save is NEVER overwritten: keep the original text aside, run read-only and let the user decide.
      console.warn('Could not read saved data', e);
      let copy = ''; try { copy = KEY + '.unreadable.' + Date.now().toString(36); localStorage.setItem(copy, raw || ''); } catch (x) { copy = ''; }
      loadProblem = { message: e.message, copy, text: raw || '' }; readOnly = true; state = defaults(); applyPatch({});
    }
  }
  function writeState() {
    if (demo || readOnly) return;
    const snapshot = JSON.stringify(state);
    if (lockKey) {
      inflight++;
      chain = chain.then(() => encryptWith(lockKey, lockSalt, snapshot, lockIter)).then((blob) => { localStorage.setItem(ENC, blob); }).catch((e) => { FOS.ui && FOS.ui.toast('Could not save encrypted data: ' + e.message); }).then(() => { inflight--; });
    } else localStorage.setItem(KEY, snapshot);
    try { localStorage.setItem('fos.theme', state.settings.theme); } catch (e) { /* ignore */ }
  }
  // Writing the whole data set on every keystroke is slow on phones with a long history, so writes are coalesced:
  // saved ~300 ms after the last change (150 ms when encrypted), and immediately when the page is hidden or closed.
  let writeTimer = null, pendingWrite = false; const clr = (t) => { if (typeof clearTimeout === 'function') clearTimeout(t); };
  function flush() {
    if (!pendingWrite || locked || demo || readOnly) return; pendingWrite = false; clr(writeTimer);
    try { writeState(); dailyCopy(); } catch (e) { FOS.ui && FOS.ui.toast('Could not save — browser storage may be full or blocked.'); }
  }
  function save(o) {
    if (locked || readOnly) return;
    if (!(o && o.touch === false)) state.meta.updatedAt = new Date().toISOString();
    if (!demo) {
      if (typeof setTimeout === 'function') { pendingWrite = true; clr(writeTimer); writeTimer = setTimeout(flush, lockKey ? 150 : 300); }
      else { try { writeState(); } catch (e) { FOS.ui && FOS.ui.toast('Could not save — browser storage may be full or blocked.'); } }
    }
    subs.forEach((f) => f(state, o || {}));
  }
  if (typeof window.addEventListener === 'function') {
    window.addEventListener('pagehide', flush);
    // encrypted saves finish asynchronously: if one is still running, ask the browser to wait instead of losing the last edit
    window.addEventListener('beforeunload', (e) => { flush(); if (inflight > 0 && e && e.preventDefault) { e.preventDefault(); e.returnValue = ''; } });
  }
  if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') flush(); });

  /* ---- local safety copies: a ring of 3, taken before anything that replaces your data ---- */
  const SNAP = 'fos.snap.', SNAPIDX = 'fos.snap.idx';
  const snapIds = () => { try { const a = JSON.parse(localStorage.getItem(SNAPIDX) || '[]'); return Array.isArray(a) ? a.filter((x) => typeof x === 'string' && /^[\w]+$/.test(x)) : []; } catch (e) { return []; } };
  const saveIds = (a) => { try { localStorage.setItem(SNAPIDX, JSON.stringify(a)); } catch (e) { /* ignore */ } };
  // The state is captured synchronously; encryption (when the lock is on) finishes afterwards.
  async function snapshot(reason) {
    if (demo || readOnly || locked || !hasUserData(state)) return null;
    try {
      const text = JSON.stringify(state), n = counts(state).total, id = Date.now().toString(36) + Math.random().toString(36).slice(2, 5), isEnc = !!lockKey;   // captured now: the lock may change while we wait
      const body = isEnc ? await encryptWith(lockKey, lockSalt, text, lockIter) : text, rec = JSON.stringify({ id, t: new Date().toISOString(), reason: reason || '', enc: isEnc, n, body });
      const ids = snapIds();
      for (let tries = 0; ; tries++) {
        try { localStorage.setItem(SNAP + id, rec); break; }
        catch (e) { if (!ids.length || tries >= 3) return null; try { localStorage.removeItem(SNAP + ids.shift()); } catch (x) { /* ignore */ } }
      }
      ids.push(id); while (ids.length > 3) { try { localStorage.removeItem(SNAP + ids.shift()); } catch (x) { /* ignore */ } }
      saveIds(ids); return id;
    } catch (e) { return null; }
  }
  function dailyCopy() { try { const last = +localStorage.getItem('fos.snap.last') || 0; if (Date.now() - last < 864e5 || !hasUserData(state)) return; localStorage.setItem('fos.snap.last', String(Date.now())); snapshot('daily copy'); } catch (e) { /* ignore */ } }
  function snapshotList() { return snapIds().map((id) => { try { const r = JSON.parse(localStorage.getItem(SNAP + id)); return r && { id: r.id, t: r.t, reason: r.reason, enc: r.enc, n: r.n }; } catch (e) { return null; } }).filter(Boolean).reverse(); }
  function purgeSnapshots() { snapIds().forEach((id) => { try { localStorage.removeItem(SNAP + id); } catch (e) { /* ignore */ } }); try { localStorage.removeItem(SNAPIDX); localStorage.removeItem('fos.snap.last'); } catch (e) { /* ignore */ } }
  async function restoreSnapshot(id) {
    let r = null; try { r = JSON.parse(localStorage.getItem(SNAP + id) || 'null'); } catch (e) { /* handled below */ }
    if (!r) throw new Error('That safety copy is no longer available.');
    let text = r.body; if (r.enc) { if (!sessionPass) throw new Error('Unlock the app with your passphrase first.'); text = (await decryptBlob(r.body, sessionPass)).text; }
    replaceState(JSON.parse(text), { reason: 'before restoring a safety copy' });
  }

  /* ---- replacing the data: always cleaned, always preceded by a safety copy ---- */
  function replaceState(data, o) {
    o = o || {};
    if (demo) throw new Error('You are in demo mode — exit the demo first so nothing is mixed up.');
    const next = prep(data);
    snapshot(o.reason || 'before replacing data');
    state = next; applyPatch(state.configPatch);
    if (o.touch === false && data && data.meta && data.meta.updatedAt) state.meta.updatedAt = String(data.meta.updatedAt);
    save({ touch: o.touch !== false, replaced: true, source: o.source });
  }

  /* ---- demo mode: sample numbers live in memory only; your saved data on disk is never touched ---- */
  function enterDemo(sample) {
    if (demo) return;
    flush(); real = state; demo = true; pendingWrite = false; clr(writeTimer);
    state = prep(sample); applyPatch(state.configPatch);
    subs.forEach((f) => f(state, { demo: true, quiet: true }));
  }
  function exitDemo() {
    if (!demo) return;
    state = real; real = null; demo = false; applyPatch(state.configPatch);
    subs.forEach((f) => f(state, { demo: false, quiet: true }));
  }

  FOS.store = {
    get: () => state,
    save, uid, load, flush, snapshot, replaceState, hash: (st) => hashOf(st || state), counts: (st) => counts(st || state), hasUserData: (st) => hasUserData(st || state), summary: (st) => summaryOf(st || state),
    prepare: prep, snapshots: snapshotList, restoreSnapshot, purgeSnapshots,
    isDemo: () => demo, enterDemo, exitDemo,
    loadProblem: () => loadProblem,
    resolveLoadProblem(action) {   // 'fresh' = start empty (the unreadable text stays in its own key); 'retry' = reload the page
      if (!loadProblem) return;
      if (action === 'fresh') { readOnly = false; loadProblem = null; state = defaults(); applyPatch({}); subs.forEach((f) => f(state, { quiet: true })); }
    },
    setConfigPatch(p) { state.meta.configChecked = new Date().toISOString(); state.configPatch = cleanPatch(p); applyPatch(state.configPatch); save(); },
    mergeConfigPatch(p) { state.meta.configChecked = new Date().toISOString(); const cur = clone(state.configPatch || {}); dm(cur, cleanPatch(p)); state.configPatch = cur; applyPatch(cur); save(); },
    subscribe: (f) => subs.push(f),
    update(fn, o) { fn(state); save(o); },
    exportJSON() { state.meta.lastExport = new Date().toISOString(); if (!demo) { pendingWrite = false; try { writeState(); } catch (e) { /* ignore */ } } return JSON.stringify({ app: 'finance-os', version: 1, exportedAt: new Date().toISOString(), data: state }, null, 2); },
    importJSON(text, opts) {
      let o; try { o = JSON.parse(text); } catch (e) { throw new Error('That file is not valid JSON.'); }
      if (o && o.fos === 'enc1') { const er = new Error('This file is encrypted — enter your passphrase.'); er.needsPass = true; throw er; }
      if (!o || o.app !== 'finance-os' || !isObj(o.data)) throw new Error('This does not look like a Finance OS export.');
      replaceState(o.data, Object.assign({ reason: 'before importing a file' }, opts));
    },
    async selfTestCrypto() { const salt = window.crypto.getRandomValues(new Uint8Array(16)), key = await deriveKey('self-test-passphrase', salt, 20000), msg = 'finance-os ' + Math.random(), blob = await encryptWith(key, salt, msg, 20000), back = await decryptBlob(blob, 'self-test-passphrase'); let wrongRejected = false; try { await decryptBlob(blob, 'wrong'); } catch (e) { wrongRejected = true; } return back.text === msg && wrongRejected; },
    isLocked: () => locked, hasLock: () => !!lockKey || locked, sessionPass: () => sessionPass,
    async unlock(pass) {
      const blob = localStorage.getItem(ENC), r = await decryptBlob(blob, pass);
      state = prep(JSON.parse(r.text)); applyPatch(state.configPatch); lockKey = r.key; lockSalt = r.salt; lockIter = r.iter; sessionPass = pass; locked = false;
      if (r.iter < ITER_NEW) upgradeKdf(pass).catch(() => { /* keeps working with the old strength */ });
    },
    async enableLock(pass) {
      if (demo) throw new Error('Exit the demo first.');
      if (!pass || pass.length < 8) throw new Error('Use a passphrase of at least 8 characters.');
      const salt = window.crypto.getRandomValues(new Uint8Array(16)), key = await deriveKey(pass, salt, ITER_NEW), text = JSON.stringify(state);
      const blob = await encryptWith(key, salt, text, ITER_NEW), back = await decryptBlob(blob, pass);        // self-test: must round-trip exactly
      if (back.text !== text) throw new Error('Encryption self-test failed — nothing was changed.');
      localStorage.setItem(ENC, blob); localStorage.removeItem(KEY); lockKey = key; lockSalt = salt; lockIter = ITER_NEW; sessionPass = pass;
      purgeSnapshots();   // older safety copies are plain text; they would defeat the lock
    },
    async disableLock() { if (!demo) localStorage.setItem(KEY, JSON.stringify(state)); localStorage.removeItem(ENC); lockKey = null; lockSalt = null; sessionPass = null; },
    // used by Google Drive sync: same key, new random IV — no second 600,000-round key derivation per upload
    async encryptForSync(text) { return lockKey ? encryptWith(lockKey, lockSalt, text, lockIter) : text; },
    async exportEncrypted(pass) { const salt = window.crypto.getRandomValues(new Uint8Array(16)), key = await deriveKey(pass, salt, ITER_NEW); return encryptWith(key, salt, JSON.stringify({ app: 'finance-os', version: 1, exportedAt: new Date().toISOString(), data: state }), ITER_NEW); },
    async decryptText(text, pass) { return (await decryptBlob(text, pass)).text; },
    async importEncrypted(text, pass) { const r = await decryptBlob(text, pass); this.importJSON(r.text); },
    reset(o) {
      if (demo) { exitDemo(); return; }
      snapshot('before “Delete all my data”');
      pendingWrite = false; clr(writeTimer); state = defaults(); applyPatch({}); lockKey = null; lockSalt = null; locked = false; sessionPass = null; readOnly = false; loadProblem = null;
      try { localStorage.removeItem(KEY); localStorage.removeItem(ENC); localStorage.removeItem('fos.theme'); if (o && o.eraseCopies) purgeSnapshots(); } catch (e) { /* ignore */ }
      subs.forEach((f) => f(state, { reset: true, quiet: true }));
    },
    // Config lookup honouring user overrides
    rate(key, fallback) { const v = state.overrides['rate.' + key]; return v !== undefined && v !== '' ? +v : fallback; },
    schemeRate(id) { const v = state.overrides['scheme.' + id]; return v !== undefined && v !== '' ? +v : FOS.GOVERNMENT_SCHEMES.schemes[id].rate; },
    assume(key) { const v = state.overrides['assume.' + key]; return v !== undefined && v !== '' ? +v : FOS.FINANCIAL_ASSUMPTIONS[key]; },
    interest(key) { const v = state.overrides['rate.' + key]; return v !== undefined && v !== '' ? +v : FOS.INTEREST_RATES.rates[key].rate; }
  };
  // Older backups are encrypted with fewer PBKDF2 rounds; the first unlock re-keys them at today's strength.
  async function upgradeKdf(pass) { const salt = window.crypto.getRandomValues(new Uint8Array(16)), key = await deriveKey(pass, salt, ITER_NEW); lockKey = key; lockSalt = salt; lockIter = ITER_NEW; pendingWrite = true; flush(); }
  load();
  FOS.deviceId = function () { try { let d = localStorage.getItem('fos.device'); if (!d) { d = Math.random().toString(36).slice(2, 8); localStorage.setItem('fos.device', d); } return d; } catch (e) { return 'device'; } };
  // Ask the browser not to evict our data when storage is tight (Chrome/Firefox/Safari 17+); harmless if refused.
  FOS.requestPersistence = function () { try { if (navigator.storage && navigator.storage.persist) return navigator.storage.persist().catch(() => false); } catch (e) { /* ignore */ } return Promise.resolve(false); };

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
    // The same emergency money is often recorded twice (as an asset AND as the "saved so far" of an Emergency Fund goal): count it once, take the larger.
    const efGoals = sum(s.goals.filter((g) => g.type === 'Emergency Fund'), (g) => g.current);
    const efAssets = byCat(s.assets, 'Emergency Fund'), ef = Math.max(efAssets, efGoals);
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
