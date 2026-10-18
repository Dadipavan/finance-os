/* ==========================================================================
   sync.js — optional Google Drive backup & sync (a hidden app folder in YOUR Drive),
   passphrase lock screen, idle auto-lock, settings panels.
   Google's sign-in script is loaded only when you connect or sync.

   How it stays safe
   · This device remembers what it last synced (a version number and a content hash). From that it can tell
     "I changed something" from "Drive changed" — it never guesses from clocks.
   · It only uploads when Drive still holds what this device last saw. If both sides changed (or this device has never
     met the Drive file), it asks you: use Drive / keep this device / merge. It never overwrites silently.
   · Before a Drive copy is replaced, a copy is kept (history-*.json, newest 14). Monthly archives are created once, never overwritten.
   · Version history lists every copy plus Drive's own earlier revisions of the file, with a preview, so a bad day can be undone.
   · Demo mode and the locked screen never sync.
   Google gives a browser-only app one-hour sign-ins. To make that painless the sign-in is remembered on this device,
   the account is pre-selected, consent is not asked again, and renewal is attempted quietly on your next tap.
   ========================================================================== */
(function () {
  'use strict';
  const U = FOS.ui, esc = U.esc, store = FOS.store, fmt = FOS.fmt, D = FOS.dates;
  const CID = 'fos.gclient', CONN = 'fos.gconnected', TOK = 'fos.gtoken', EMAIL = 'fos.gemail', INFO = 'fos.syncinfo';
  const NAME = 'finance-os-data.json', ACCESS_FILE = 'finance-os-access.json', SCOPE = 'https://www.googleapis.com/auth/drive.appdata';
  const DRIVE = 'https://www.googleapis.com/drive/v3/', UPLOAD = 'https://www.googleapis.com/upload/drive/v3/', KEEP_HISTORY = 14;
  let token = null, tokenExp = 0, timer = null, busy = false, again = false, paused = false, armed = false, lastTry = 0, silentFailAt = 0, warned = false, forceSafety = false;
  // Put YOUR Google OAuth client ID here once (it is public by design, not a secret). Then users never type it.
  const DEFAULT_CLIENT_ID = '';
  const ls = { get: (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } }, del: (k) => { try { localStorage.removeItem(k); } catch (e) { /* ignore */ } } };
  const clientId = () => ls.get(CID) || DEFAULT_CLIENT_ID;
  const connected = () => ls.get(CONN) === '1' && !!clientId();
  const valid = () => !!token && Date.now() < tokenExp - 60000;
  const needSignIn = (msg) => { const e = new Error(msg || 'Sign in to Google to sync.'); e.code = 'need_signin'; return e; };
  const dt = (iso) => { const d = new Date(iso); return isNaN(d) ? '—' : d.toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }); };
  const kb = (n) => (n === undefined ? '' : n < 1024 ? n + ' B' : (n / 1024).toFixed(0) + ' KB');

  // the sign-in is kept for the hour Google grants it, so a reload does not ask again
  (function restore() { try { const t = JSON.parse(ls.get(TOK) || 'null'); if (t && t.t && t.exp > Date.now() + 60000) { token = t.t; tokenExp = t.exp; } else ls.del(TOK); } catch (e) { ls.del(TOK); } })();
  function setToken(t, secs) { token = t; tokenExp = Date.now() + (secs || 3600) * 1000; ls.set(TOK, JSON.stringify({ t: token, exp: tokenExp })); ls.set(CONN, '1'); }
  function clearToken() { token = null; tokenExp = 0; ls.del(TOK); }
  const readInfo = () => { try { const i = JSON.parse(ls.get(INFO) || 'null'); return i && typeof i === 'object' ? i : {}; } catch (e) { return {}; } };
  const writeInfo = (i) => ls.set(INFO, JSON.stringify(i));

  /* ---------------- status chip (top bar) + listeners ---------------- */
  const status = { kind: 'off', text: '' };
  const CHIP = { idle: ['✓', 'Google Drive: up to date'], ok: ['✓', 'Google Drive: up to date'], syncing: ['↻', 'Syncing with Google Drive…'], needsignin: ['!', 'Google Drive: tap to sign in'], conflict: ['⚠', 'Google Drive: needs your decision'], error: ['✕', 'Google Drive: problem — tap for details'], offline: ['–', 'Offline — will sync later'], paused: ['‖', 'Sync paused'] };
  function paintChip() {
    const b = typeof document !== 'undefined' && document.getElementById ? document.getElementById('sync-btn') : null; if (!b) return;
    const k = connected() && !store.isDemo() ? (status.kind === 'off' ? (valid() ? 'ok' : 'needsignin') : status.kind) : 'off';
    b.hidden = k === 'off' || !clientId(); b.dataset.state = k;
    const c = CHIP[k] || CHIP.ok, mark = b.querySelector('.sy-mark'); if (mark) mark.textContent = c[0];
    const label = (status.text && k !== 'ok' ? status.text : c[1]); b.title = label; b.setAttribute('aria-label', label);
  }
  function setStatus(kind, text) { status.kind = kind; status.text = text || ''; paintChip(); const el = document.getElementById && document.getElementById('sync-status'); if (el) el.textContent = status.text; }
  FOS.syncStatus = () => status;

  /* ---------------- Google sign-in + Drive REST ---------------- */
  function loadGIS() {
    return new Promise((res, rej) => {
      if (window.google && window.google.accounts && window.google.accounts.oauth2) return res();
      const s = document.createElement('script'); s.src = 'https://accounts.google.com/gsi/client'; s.onload = res; s.onerror = () => { const e = new Error('Could not load Google sign-in (are you online?)'); e.code = 'offline'; rej(e); }; document.head.appendChild(s);
    });
  }
  // Turn Google's cryptic codes into something you can act on
  function friendly(code, desc) {
    const c = String(code || ''), fix = ' If Google showed "Access blocked" or "has not completed the verification process": open Google Cloud → OAuth consent screen (Google Auth Platform → Audience) and add your Gmail under Test users — or, better, press Publish app (“In production”) so sign-in does not expire every week — then try again.';
    if (/access_denied/.test(c)) return 'Google blocked this sign-in (access_denied).' + fix;
    if (/popup_closed|popup_failed|closed/.test(c)) return 'The Google window was closed or blocked before it finished. Allow pop-ups for this site and tap Sign in again.';
    if (/invalid_client|origin_mismatch|redirect_uri/.test(c) || /origin/.test(String(desc || ''))) return 'Google does not recognise this website address for your client ID. In Google Cloud → Credentials, set Authorized JavaScript origins to exactly your site address (https://<username>.github.io, no path, no trailing slash).';
    if (/interaction_required|login_required|consent_required/.test(c)) return 'Google needs you to sign in again.';
    return 'Google sign-in did not complete (' + (c || 'closed') + ').' + fix;
  }
  // prompt: '' = Google decides (consent only the first time); 'none' = never show anything (used for quiet renewal)
  function requestToken(prompt) {
    return loadGIS().then(() => new Promise((res, rej) => {
      const hint = ls.get(EMAIL) || undefined;
      const tc = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId(), scope: SCOPE, hint,
        callback: (r) => { if (r.error) { const e = new Error(friendly(r.error, r.error_description)); e.code = r.error; return rej(e); } setToken(r.access_token, r.expires_in); learnEmail(); res(token); },
        error_callback: (e) => { const er = new Error(friendly(e && e.type)); er.code = (e && e.type) || 'closed'; rej(er); }
      });
      tc.requestAccessToken({ prompt, hint });
    }));
  }
  // mode: 'none' = background (never opens a Google window) · 'silent' = quiet renewal, only from a tap · 'interactive' = the Sign in button
  async function ensureToken(mode) {
    if (valid()) return token;
    if (!clientId()) throw needSignIn('Enter your Google client ID first.');
    if (mode === 'interactive') return requestToken('');
    if (mode === 'silent') return requestToken('none');
    throw needSignIn();
  }
  async function api(url, opts, mode) {
    const t = await ensureToken(mode || 'none'), r = await fetch(url, Object.assign({}, opts, { headers: Object.assign({ Authorization: 'Bearer ' + t }, (opts || {}).headers) }));
    if (r.status === 401) { clearToken(); throw needSignIn('Google sign-in expired.'); }
    if (r.status === 403) throw new Error('Google Drive refused the request (403). Check that the Google Drive API is enabled for your project and the drive.appdata scope is on the consent screen.');
    if (r.status === 429 || r.status >= 500) throw new Error('Google Drive is busy right now (' + r.status + '). It will retry.');
    if (!r.ok) throw new Error('Google Drive error ' + r.status); return r;
  }
  const Q = encodeURIComponent;
  const listFiles = async (q, mode) => (await (await api(DRIVE + 'files?spaces=appDataFolder&pageSize=200&orderBy=modifiedTime%20desc&fields=files(id,name,modifiedTime,size,version)' + (q ? '&q=' + Q(q) : ''), null, mode)).json()).files || [];
  const findMeta = async (name, mode) => (await listFiles("name='" + name + "'", mode))[0] || null;
  const readFile = async (id, mode) => (await api(DRIVE + 'files/' + id + '?alt=media', null, mode)).text();
  const deleteFile = (id, mode) => api(DRIVE + 'files/' + id, { method: 'DELETE' }, mode);
  async function writeFile(name, text, id, mode) {
    if (id) return (await api(UPLOAD + 'files/' + id + '?uploadType=media&fields=id,version,modifiedTime', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: text }, mode)).json();
    const b = 'fos' + Math.random().toString(36).slice(2), body = `--${b}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify({ name, parents: ['appDataFolder'] })}\r\n--${b}\r\nContent-Type: application/json\r\n\r\n${text}\r\n--${b}--`;
    return (await api(UPLOAD + 'files?uploadType=multipart&fields=id,version,modifiedTime', { method: 'POST', headers: { 'Content-Type': 'multipart/related; boundary=' + b }, body }, mode)).json();
  }
  async function copyFile(id, name, mode) {
    try { return await (await api(DRIVE + 'files/' + id + '/copy?fields=id', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name, parents: ['appDataFolder'] }) }, mode)).json(); }
    catch (e) { if (e.code === 'need_signin') throw e; return writeFile(name, await readFile(id, mode), null, mode); }   // fall back to download + upload
  }
  async function learnEmail() {
    try { if (ls.get(EMAIL)) return; const j = await (await api(DRIVE + 'about?fields=user(emailAddress)', null, 'none')).json(); if (j && j.user && j.user.emailAddress) { ls.set(EMAIL, j.user.emailAddress); paintChip(); } } catch (e) { /* the account name is only a convenience */ }
  }

  /* ---- "key verified" record kept in the user's own Drive: lifetime, works on any new device ---- */
  async function recordAccess(hash) {
    if (ls.get('fos.accessRecorded') === hash) return;
    const f = await findMeta(ACCESS_FILE, 'none'); await writeFile(ACCESS_FILE, JSON.stringify({ v: 1, hash, verifiedAt: new Date().toISOString() }), f && f.id, 'none');
    ls.set('fos.accessRecorded', hash);
  }
  async function checkAccess(hash, interactive) {
    await ensureToken(interactive !== false ? 'interactive' : 'none'); const f = await findMeta(ACCESS_FILE, 'none'); if (!f) return false;
    try { const o = JSON.parse(await readFile(f.id, 'none')); return !!o && o.hash === hash; } catch (e) { return false; }
  }
  FOS.drive = { configured: () => !!clientId(), connected: () => connected(), recordAccess, checkAccess };
  FOS.syncNeeded = () => connected() && !valid();

  /* ---------------- reading, writing and merging copies ---------------- */
  async function payload() {
    const text = JSON.stringify({ app: 'finance-os', version: 1, exportedAt: new Date().toISOString(), device: FOS.deviceId(), data: store.get() });
    return store.hasLock() ? store.encryptForSync(text) : text;
  }
  async function parseRemote(text) {
    let plain = text;
    if (FOS.crypto.isEncrypted(text)) { const pass = store.sessionPass() || (typeof prompt === 'function' ? prompt('This Google Drive copy is encrypted. Enter its passphrase:') : null); if (!pass) throw new Error('A passphrase is needed to read this encrypted copy.'); plain = await store.decryptText(text, pass); }
    let obj; try { obj = JSON.parse(plain); } catch (e) { throw new Error('That copy could not be read (it is damaged).'); }
    if (!obj || obj.app !== 'finance-os' || !obj.data || typeof obj.data !== 'object') throw new Error('That file is not a Finance OS backup.');
    return { obj, state: store.prepare(obj.data), plain, text, device: obj.device || '', exportedAt: obj.exportedAt || '' };
  }
  // Union of two copies: rows are matched by id (this device wins a tie), rows only on one side are kept, flags are OR-ed.
  function mergeStates(local, remote) {
    const cp = (x) => JSON.parse(JSON.stringify(x)), out = cp(remote), has = (v) => v !== '' && v !== undefined && v !== null;
    ['assets', 'liabilities', 'goals', 'recurring', 'reminders', 'records', 'expenses', 'quotes', 'bankRates', 'timeline'].forEach((k) => {
      const seen = {}, rows = []; (local[k] || []).forEach((x) => { rows.push(x); seen[x.id] = 1; }); (remote[k] || []).forEach((x) => { if (!seen[x.id]) rows.push(x); }); out[k] = cp(rows);
    });
    const sn = {}; (remote.snapshots || []).forEach((x) => { sn[x.date] = x; }); (local.snapshots || []).forEach((x) => { sn[x.date] = x; }); out.snapshots = cp(Object.keys(sn).sort().map((k) => sn[k]));
    out.budget = cp(remote.budget || {}); const lb = local.budget || {}; if ((lb.items || []).length || has(lb.income)) { out.budget.method = lb.method || out.budget.method; if (has(lb.income)) out.budget.income = lb.income; const seen = {}, rows = []; (lb.items || []).forEach((x) => { rows.push(x); seen[x.id] = 1; }); ((remote.budget || {}).items || []).forEach((x) => { if (!seen[x.id]) rows.push(x); }); out.budget.items = cp(rows); }
    out.profile = cp(remote.profile || {}); Object.keys(local.profile || {}).forEach((k) => { const v = local.profile[k]; if (typeof v === 'boolean') out.profile[k] = v || !!out.profile[k]; else if (has(v) && !(Array.isArray(v) && !v.length)) out.profile[k] = cp(v); });
    out.months = cp(remote.months || {}); Object.keys(local.months || {}).forEach((m) => { out.months[m] = Object.assign({}, out.months[m], cp(local.months[m])); });
    const lp = local.progress || { lessons: {}, quiz: {} }, rp = remote.progress || { lessons: {}, quiz: {} };
    out.progress = { lessons: Object.assign({}, rp.lessons, lp.lessons), quiz: Object.assign({}, rp.quiz) };
    Object.keys(lp.quiz || {}).forEach((k) => { const a = lp.quiz[k], b = out.progress.quiz[k]; out.progress.quiz[k] = !b || (a && a.best >= b.best) ? cp(a) : b; });
    out.checklists = cp(remote.checklists || {}); Object.keys(local.checklists || {}).forEach((k) => { out.checklists[k] = Object.assign({}, out.checklists[k], cp(local.checklists[k])); });
    out.calcSaved = Object.assign({}, cp(remote.calcSaved || {}), cp(local.calcSaved || {})); out.suggestDone = Object.assign({}, remote.suggestDone, local.suggestDone);
    out.configPatch = cp(remote.configPatch || {}); Object.keys(local.configPatch || {}).forEach((k) => { out.configPatch[k] = Object.assign({}, out.configPatch[k], cp(local.configPatch[k])); });
    out.overrides = Object.assign({}, remote.overrides, local.overrides); out.settings = cp(local.settings || remote.settings); out.meta = Object.assign({}, remote.meta, local.meta);
    return out;
  }
  FOS.mergeStates = mergeStates;
  const stamp = (iso) => String(iso || new Date().toISOString()).replace(/[-:]/g, '').replace(/\.\d+/, '').slice(0, 15) + 'Z';
  // keep a copy of what is on Drive BEFORE it is replaced; prune to the newest KEEP_HISTORY
  async function safetyCopy(remote, info) {
    await copyFile(remote.id, 'history-' + stamp(remote.modifiedTime) + '-' + FOS.deviceId() + '.json', 'none'); info.hist = Date.now();
    const old = (await listFiles('', 'none')).filter((f) => /^history-/.test(f.name)).sort((a, b) => (a.name < b.name ? 1 : -1)).slice(KEEP_HISTORY);
    for (const f of old) { try { await deleteFile(f.id, 'none'); } catch (e) { /* pruning is best effort */ } }
  }
  async function monthlyArchive(text, info) {
    const m = D.month(new Date()); if (info.arch === m) return;
    const an = 'archive-' + m + '.json'; if (!(await findMeta(an, 'none'))) await writeFile(an, text, null, 'none');   // created once, never overwritten
    info.arch = m;
  }
  // the hash and the uploaded text are taken in the same tick, so they always describe the same data
  async function packet() { const h = store.hash(), text = await payload(); return { h, text }; }
  async function push(remote, info, p, opts) {
    opts = opts || {};
    if (remote && (opts.safety || forceSafety || !info.hist || Date.now() - info.hist > 6 * 36e5)) { await safetyCopy(remote, info); forceSafety = false; }
    const res = await writeFile(NAME, p.text, remote && remote.id, 'none');
    Object.assign(info, { version: String(res.version), hash: p.h, fileId: res.id, at: new Date().toISOString() }); writeInfo(info);   // recorded at once: the upload has happened
    try { await monthlyArchive(p.text, info); writeInfo(info); } catch (e) { /* the archive is a bonus; the main copy is safe */ }
    if (FOS.gate && FOS.gate.isOpen() && FOS.gate.cfg.required) { try { await recordAccess(FOS.gate.cfg.hash); } catch (e) { /* best effort */ } }
  }
  function pull(r, remote, info, how) {
    store.replaceState(r.obj.data, { reason: 'before taking the Google Drive copy', touch: false, source: 'drive' });
    Object.assign(info, { version: String(remote.version), hash: store.hash(), fileId: remote.id, at: new Date().toISOString() }); writeInfo(info);
    if (how !== 'quiet' && !/INPUT|TEXTAREA|SELECT/.test(((document.activeElement || {}).tagName) || '') && FOS.route) FOS.route();
    if (how === 'auto') U.toast('Updated from Google Drive (changes made on another device).');
  }

  /* ---------------- the sync decision ---------------- */
  const done = (text) => { setStatus('ok', text || ('Synced ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }))); };
  async function cycle(o) {
    const info = readInfo(), remote = await findMeta(NAME, 'none');
    if (!remote) { await push(null, info, await packet()); return done('Uploaded your data to Google Drive.'); }
    const first = !info.version || info.fileId !== remote.id, changed = first || String(remote.version) !== String(info.version);
    let h = store.hash(), dirty = h !== info.hash;
    if (!first && !changed && !dirty) { info.at = new Date().toISOString(); writeInfo(info); return done(); }
    if (!first && !changed && dirty) { await push(remote, info, await packet()); return done(); }
    // Drive holds something this device has not seen (or has never met): read it before deciding anything
    const r = await parseRemote(await readFile(remote.id, 'none'));
    h = store.hash(); dirty = h !== info.hash;
    const rh = store.hash(r.state), rEmpty = !store.hasUserData(r.state), lEmpty = !store.hasUserData(store.get());
    if (rh === h) { Object.assign(info, { version: String(remote.version), hash: h, fileId: remote.id, at: new Date().toISOString() }); writeInfo(info); return done(); }   // identical content
    if (first && lEmpty && rEmpty) { Object.assign(info, { version: String(remote.version), hash: h, fileId: remote.id }); writeInfo(info); return done(); }
    if ((first && lEmpty) || (!first && !dirty)) { pull(r, remote, info, o.auto ? 'auto' : 'user'); return done(first ? 'Loaded your data from Google Drive.' : 'Updated from Google Drive.'); }
    if (first && rEmpty) { await push(remote, info, await packet(), { safety: true }); return done('Uploaded your data to Google Drive.'); }
    return resolveConflict(r, remote, info, o);
  }
  async function resolveConflict(r, remote, info, o) {
    if (paused && o.auto) { setStatus('conflict', 'Your data differs from Google Drive — tap the cloud to decide.'); return; }
    const choice = await askConflict(r, remote);
    // anything else (dialog closed, unknown answer) = do nothing; the app never overwrites on a guess
    if (choice !== 'remote' && choice !== 'merge' && choice !== 'local') { paused = true; setStatus('conflict', 'Sync paused — your data differs from Google Drive. Tap the cloud to decide.'); return; }
    paused = false;
    if (choice === 'remote') { pull(r, remote, info, 'user'); return done('Loaded the Google Drive copy.'); }
    if (choice === 'merge') { store.replaceState(mergeStates(store.get(), r.state), { reason: 'before merging with Google Drive' }); }
    await push(remote, info, await packet(), { safety: true });
    return done(choice === 'merge' ? 'Merged this device with Google Drive.' : 'Replaced the Google Drive copy with this device (the old one is in Version history).');
  }
  function askConflict(r, remote) {
    return new Promise((resolve) => {
      let finished = false; const fin = (v) => { if (!finished) { finished = true; resolve(v); } };
      const mine = store.summary(), theirs = store.summary(r.state), L = store.get().meta.updatedAt;
      const card = (title, s, when, extra) => `<div class="card cmp-card"><h4>${title}</h4><p><b>${esc(s.text)}</b></p><p class="muted">${when ? 'Last changed ' + esc(dt(when)) + '.' : ''} ${extra || ''}</p>${s.sample ? '<p class="status warn">Contains sample/demo rows.</p>' : ''}</div>`;
      const box = U.modal('Your data differs from Google Drive', `<p>This device and your Google Drive copy have different data. Nothing has been changed yet — choose what to keep. Whichever you pick, the other side is saved first so you can bring it back from <b>Version history</b>.</p>
        <div class="grid-2">${card('This device', mine, L, '')}${card('Google Drive', theirs, r.exportedAt || remote.modifiedTime, r.device ? 'Saved by device ' + esc(r.device) + '.' : '')}</div>
        <div class="sheet-actions">
          <button class="sheet-btn" data-pick="merge"><b>Merge both (recommended if you used both)</b><span>Keeps every row from both. A row deleted on one side may come back.</span></button>
          <button class="sheet-btn" data-pick="remote"><b>Use the Google Drive copy</b><span>Replaces this device's data. A safety copy of this device's data is kept first.</span></button>
          <button class="sheet-btn" data-pick="local"><b>Keep this device's data</b><span>Replaces the Drive copy. The old Drive copy is kept in Version history.</span></button>
          <button class="sheet-btn" data-pick="later"><b>Decide later</b><span>Sync pauses; nothing is lost. Tap the cloud icon when you are ready.</span></button></div>`, { wide: true, onClose: () => fin('later') });
      box.onclick = (e) => { const b = e.target.closest('[data-pick]'); if (!b) return; fin(b.dataset.pick); U.closeModal(); };
    });
  }

  async function run(o) {
    o = o || {};
    if (store.isDemo()) { setStatus('off', 'Demo mode — nothing is synced.'); return; }
    if (store.isLocked() || store.loadProblem()) return;
    if (!connected() && !o.interactive) return;
    if (busy) { again = true; return; }
    if (paused && !o.user) return;
    busy = true; lastTry = Date.now(); setStatus('syncing', 'Syncing…');
    try { await ensureToken(o.interactive ? 'interactive' : o.silent ? 'silent' : 'none'); await cycle(o); }
    catch (e) { fail(e, o); }
    finally { busy = false; if (again) { again = false; schedule(1500); } }
  }
  function fail(e, o) {
    const offline = e.code === 'offline' || (typeof navigator !== 'undefined' && navigator.onLine === false) || (e instanceof TypeError && /fetch|network|load failed|connection/i.test(e.message));
    if (offline) return setStatus('offline', 'Offline — will sync when you are back online.');
    if (e.code === 'need_signin' || /popup|interaction|login_required|consent_required|closed/i.test(e.code || '')) {
      setStatus('needsignin', o.user ? e.message : 'Tap the cloud to sign in to Google.'); armRenewal();
      if (o.user) U.toast(e.message); else if (!warned) { warned = true; U.toast('Google Drive sync is waiting for you to sign in (tap the cloud icon).'); }
      return;
    }
    setStatus('error', 'Sync problem: ' + e.message); if (o.user) U.toast(e.message);
  }
  function schedule(ms) { if (typeof setTimeout !== 'function') return; clearTimeout(timer); timer = setTimeout(() => run({ auto: true }), ms); }
  // On your next tap or key press, try to renew Google's sign-in without any screen (it only works when Google can do it silently).
  function armRenewal() {
    if (armed || !connected() || typeof document === 'undefined' || !document.addEventListener || Date.now() - silentFailAt < 30 * 60000) return; armed = true;
    const go = async () => {
      document.removeEventListener('click', go, true); document.removeEventListener('keydown', go, true); armed = false;
      if (valid() || !connected() || store.isDemo()) return;
      try { await ensureToken('silent'); run({ auto: true }); } catch (e) { silentFailAt = Date.now(); setStatus('needsignin', 'Tap the cloud to sign in to Google.'); }
    };
    document.addEventListener('click', go, true); document.addEventListener('keydown', go, true);
  }
  FOS.syncNow = (interactive) => { paused = false; return run({ user: true, interactive: interactive !== false }); };
  FOS.signIn = () => { paused = false; return run({ user: true, interactive: true }); };
  FOS.syncAskAgain = () => { paused = false; return run({ user: true, interactive: valid() ? false : true }); };
  FOS.syncResume = function () { if (!connected()) { paintChip(); return; } if (valid()) run({ auto: true }); else { setStatus('needsignin', 'Tap the cloud to sign in to Google.'); armRenewal(); } };
  FOS.driveDisconnect = function () { ls.del(CONN); ls.del(EMAIL); clearToken(); paused = false; setStatus('off', 'Signed out. Your Drive copies are untouched.'); };
  store.subscribe((st, o) => { if (o && (o.quiet || o.demo || o.source === 'drive')) return; if (!connected()) return; schedule(5000); });
  if (typeof document !== 'undefined' && document.addEventListener) {
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && connected() && Date.now() - lastTry > 300000) run({ auto: true }); });
    if (typeof window.addEventListener === 'function') window.addEventListener('online', () => { if (connected()) schedule(1500); });
  }
  if (typeof setInterval === 'function') setInterval(() => { if (connected() && typeof document !== 'undefined' && document.visibilityState === 'visible' && Date.now() - lastTry > 600000) run({ auto: true }); }, 120000);

  /* ---------------- version history & restore ---------------- */
  const KIND = { main: 'Current Google Drive copy', rev: 'Earlier version of the main file (kept by Google for about 30 days)', hist: 'Safety copy saved before an overwrite', arch: 'Monthly archive' };
  const fromStamp = (s) => { const m = /(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})/.exec(s); return m ? `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:00Z` : ''; };
  FOS.openHistory = async function () {
    const box = U.modal('Version history & restore', '<p class="muted">Loading your Google Drive copies…</p>', { wide: true });
    const body = box.querySelector('.modal-body');
    try {
      await ensureToken('interactive');
      const files = await listFiles('', 'interactive'), main = files.find((f) => f.name === NAME), rows = [];
      if (main) rows.push({ kind: 'main', when: main.modifiedTime, size: +main.size, get: () => readFile(main.id, 'interactive') });
      let revNote = '';
      if (main) { try { const revs = (await (await api(DRIVE + 'files/' + main.id + '/revisions?pageSize=200&fields=revisions(id,modifiedTime,size)', null, 'interactive')).json()).revisions || []; revs.slice(0, -1).forEach((v) => rows.push({ kind: 'rev', when: v.modifiedTime, size: +v.size, get: () => api(DRIVE + 'files/' + main.id + '/revisions/' + v.id + '?alt=media', null, 'interactive').then((r) => r.text()) })); } catch (e) { revNote = 'Google did not return earlier revisions of the main file.'; } }
      files.filter((f) => /^history-/.test(f.name)).forEach((f) => rows.push({ kind: 'hist', when: fromStamp(f.name) || f.modifiedTime, size: +f.size, get: () => readFile(f.id, 'interactive') }));
      files.filter((f) => /^archive-\d{4}-\d{2}\.json$/.test(f.name)).forEach((f) => rows.push({ kind: 'arch', when: f.modifiedTime, label: 'Monthly archive · ' + f.name.slice(8, 15), size: +f.size, get: () => readFile(f.id, 'interactive') }));
      rows.sort((a, b) => (a.when < b.when ? 1 : -1));
      body.innerHTML = `<p>Every copy below is a full backup of your data. <b>Preview</b> shows what it contains (look for your real numbers, not sample ones), <b>Download</b> saves it as a file, and <b>Restore</b> loads it into this device (a safety copy of the current data is kept first, and Drive will then hold the restored version).</p>${revNote ? `<p class="status warn">${esc(revNote)}</p>` : ''}
        ${rows.length ? `<div class="table-scroll"><table class="data hist"><thead><tr><th>Saved</th><th>What it is</th><th>Size</th><th></th></tr></thead><tbody>${rows.map((r, i) => `<tr data-i="${i}"><th scope="row">${esc(dt(r.when))}</th><td>${esc(r.label || KIND[r.kind])}<div class="hist-sum muted"></div></td><td>${kb(r.size)}</td><td class="hist-act"><button class="btn sm" data-a="preview">Preview</button> <button class="btn sm" data-a="download">Download</button> <button class="btn sm primary" data-a="restore">Restore</button></td></tr>`).join('')}</tbody></table></div>` : '<p class="muted">Google Drive holds no copies yet.</p>'}
        <p class="note">Google keeps earlier revisions of a file for about 30 days. This app also keeps its own safety copies (newest ${KEEP_HISTORY}) and one archive per month.</p>`;
      body.onclick = async (e) => {
        const b = e.target.closest('[data-a]'); if (!b) return; const tr = b.closest('tr'), row = rows[+tr.dataset.i], sum = tr.querySelector('.hist-sum'); b.disabled = true;
        try {
          const text = await row.get();
          if (b.dataset.a === 'download') { U.download('finance-os-' + row.kind + '-' + stamp(row.when) + '.json', text, 'application/json'); }
          else {
            const r = await parseRemote(text), s = store.summary(r.state), m = r.state.assets.reduce((a, x) => a + (+x.value || 0), 0) - r.state.liabilities.reduce((a, x) => a + (+x.value || 0), 0);
            sum.innerHTML = `<b>${esc(s.text)}</b>${s.counts.total ? ` · net worth ${esc(fmt.inr(m))}` : ''}${s.sample ? ' · <span class="warn-t">contains sample rows</span>' : ''}${s.empty ? ' · <span class="warn-t">no real data</span>' : ''}`;
            if (b.dataset.a === 'restore') {
              if (!confirm(`Restore this copy from ${dt(row.when)}?\n\n${s.text}\n\nYour current data on this device is saved as a safety copy first, and Google Drive will be updated to match.`)) { b.disabled = false; return; }
              store.replaceState(r.obj.data, { reason: 'before restoring a Google Drive copy' }); forceSafety = true; paused = false;
              U.closeModal(); U.toast('Restored. Saving to Google Drive…'); if (FOS.route) FOS.route(); run({ user: true, interactive: false });
            }
          }
        } catch (er) { sum.innerHTML = `<span class="warn-t">${esc(er.message)}</span>`; }
        b.disabled = false;
      };
    } catch (e) { body.innerHTML = `<p class="status warn">${esc(e.message)}</p>`; }
  };
  // Deletes every copy this app wrote to Drive (data, history, archives). Called only after an explicit confirmation.
  FOS.driveDeleteAll = async function (includeAccess) {
    await ensureToken('interactive'); const files = await listFiles('', 'interactive');
    for (const f of files) { if (f.name === ACCESS_FILE && !includeAccess) continue; await deleteFile(f.id, 'interactive'); }
    writeInfo({}); return files.length;
  };
  // After the password lock is switched on: remove older plain-text copies from Drive so nothing readable is left behind.
  FOS.drivePurgeOld = async function () {
    const files = (await listFiles('', 'interactive')).filter((f) => /^(history-|archive-)/.test(f.name)); for (const f of files) await deleteFile(f.id, 'interactive'); return files.length;
  };

  /* ---------------- settings panels ---------------- */
  FOS.renderSyncSettings = function (el) {
    const info = readInfo(), email = ls.get(EMAIL), on = connected();
    const state = on ? (valid() ? 'Signed in' + (email ? ' as <b>' + esc(email) + '</b>' : '') + '.' : 'Not signed in right now' + (email ? ' (account <b>' + esc(email) + '</b>)' : '') + '.') : 'Not connected.';
    el.innerHTML = `<h2>Google Drive backup &amp; sync</h2><p>Keeps one copy of your data, a few safety copies and a monthly archive in a hidden app folder of <b>your own</b> Google Drive (only this app can see it). ${store.hasLock() ? 'Everything uploaded is encrypted with your passphrase.' : 'Turn on the password lock to encrypt what is uploaded.'}</p>
      <p>${state} <span id="sync-status" class="status">${esc(status.text || (info.at ? 'Last synced ' + dt(info.at) + '.' : ''))}</span></p>
      <div class="row-actions"><button class="btn primary" id="gs-signin">${on ? 'Sign in with Google' : 'Connect &amp; sign in with Google'}</button><button class="btn" id="gs-sync">Sync now</button><button class="btn" id="gs-hist">Version history &amp; restore</button><button class="btn ghost" id="gs-off">Sign out</button></div>
      <details ${on ? '' : 'open'}><summary><b>Google client ID &amp; one-time setup (about 10 minutes)</b></summary>
        <div class="fields"><div class="field wide"><label>Google OAuth client ID<input class="input" id="gs-cid" placeholder="123456-abc.apps.googleusercontent.com" value="${esc(clientId())}" autocomplete="off"></label></div></div>
        <ol><li>Open <a href="https://console.cloud.google.com" target="_blank" rel="noopener">console.cloud.google.com</a>, create a project (any name).</li><li>APIs &amp; Services → Library → enable <b>Google Drive API</b>.</li><li>OAuth consent screen → External → fill the app name and your email → add the scope <code>…/auth/drive.appdata</code> → then press <b>Publish app</b> so the status is <b>In production</b> (this scope is not sensitive, so no review is needed). In “Testing” mode Google forgets your sign-in every 7 days.</li><li>Credentials → Create credentials → <b>OAuth client ID</b> → type <b>Web application</b> → Authorised JavaScript origins: <code>https://&lt;your-username&gt;.github.io</code> (origin only, no path).</li><li>Paste the client ID above and press <b>Connect &amp; sign in</b>.</li></ol></details>
      <details><summary><b>Why does Google ask me to sign in again?</b></summary><p>A website that has no server of its own can only get a <b>one-hour</b> sign-in from Google. Finance OS therefore (1) remembers the sign-in for that hour even if you reload, (2) remembers your account so Google does not ask you to choose it or to approve again, (3) tries to renew quietly on your next tap, and (4) never blocks the app — your data is always on this device, and changes upload as soon as you are signed in. If Google still asks every time: make sure the consent screen is <b>In production</b>, allow pop-ups for this site, stay signed in to Google in this browser, and install the app to your home screen.</p></details>`;
    const q = (id) => el.querySelector(id);
    q('#gs-signin').onclick = () => { const v = q('#gs-cid').value.trim(); if (v && v !== clientId()) { if (!/\.apps\.googleusercontent\.com$/.test(v)) return U.toast('That does not look like a Google client ID.'); ls.set(CID, v); } if (!clientId()) return U.toast('Paste your Google client ID first.'); FOS.signIn().then(() => FOS.renderSyncSettings(el)); };
    q('#gs-sync').onclick = () => { if (!connected()) return U.toast('Connect and sign in first.'); FOS.syncNow(true).then(() => FOS.renderSyncSettings(el)); };
    q('#gs-hist').onclick = () => { if (!clientId()) return U.toast('Paste your Google client ID and connect first.'); FOS.openHistory(); };
    q('#gs-off').onclick = () => { FOS.driveDisconnect(); FOS.renderSyncSettings(el); };
    setStatus(status.kind, status.text);
  };

  FOS.renderLockSettings = function (el) {
    const on = store.hasLock(), idle = ls.get('fos.idle') || '0';
    el.innerHTML = `<h2>Password lock &amp; encryption</h2><p>${on ? '🔒 <b>On.</b> Your data is stored encrypted (AES-256) in this browser and asked for a passphrase every time you open the app. Copies uploaded to Google Drive are encrypted too. Safety copies made <i>before</i> you turned the lock on may still be readable in Google Drive — use “Delete old Drive copies” below.' : 'Off. Turn it on to require a passphrase to open the app and to store everything encrypted — on this device and in Google Drive.'}</p>
      ${on ? `<div class="row-actions"><button class="btn" id="lk-lock">Lock now</button><button class="btn" id="lk-export">Export encrypted backup</button><button class="btn" id="lk-change">Change passphrase</button><button class="btn" id="lk-purge">Delete old Drive copies</button><button class="btn danger" id="lk-off">Turn lock off</button></div><div class="field" style="max-width:300px"><label>Auto-lock when idle<select class="input" id="lk-idle">${[['0', 'Never'], ['5', '5 minutes'], ['15', '15 minutes'], ['60', '1 hour']].map(([v, l]) => `<option value="${v}" ${v === idle ? 'selected' : ''}>${l}</option>`).join('')}</select></label></div>`
      : `<div class="fields"><div class="field"><label>Passphrase (8+ characters)<input class="input" type="password" id="lk-p1" autocomplete="new-password"></label></div><div class="field"><label>Repeat passphrase<input class="input" type="password" id="lk-p2" autocomplete="new-password"></label></div></div><label class="check"><input type="checkbox" id="lk-ack"> I understand that a forgotten passphrase <b>cannot be recovered</b>; I keep a plain export somewhere safe.</label><div class="row-actions"><button class="btn primary" id="lk-on">Turn on password lock</button></div>`}`;
    const q = (id) => el.querySelector(id), redraw = () => FOS.renderLockSettings(el);
    if (on) {
      q('#lk-lock').onclick = () => { store.flush(); setTimeout(() => location.reload(), 400); };
      q('#lk-idle').onchange = (e) => { ls.set('fos.idle', e.target.value); U.toast('Saved'); };
      q('#lk-export').onclick = async () => { try { U.download('finance-os-encrypted-' + D.iso() + '.json', await store.exportEncrypted(store.sessionPass()), 'application/json'); } catch (e) { U.toast(e.message); } };
      q('#lk-change').onclick = async () => { const p = prompt('New passphrase (8+ characters):'); if (!p) return; if (prompt('Repeat the new passphrase:') !== p) return U.toast('They did not match.'); try { await store.enableLock(p); store.save(); U.toast('Passphrase changed.'); } catch (e) { U.toast(e.message); } };
      q('#lk-purge').onclick = async () => { if (!connected()) return U.toast('Google Drive is not connected.'); if (!confirm('Delete the older safety copies and monthly archives in Google Drive? They may hold readable (unencrypted) data from before the lock. New encrypted ones are made as you work.')) return; try { const n = await FOS.drivePurgeOld(); U.toast(n + ' old Drive copies deleted.'); } catch (e) { U.toast(e.message); } };
      q('#lk-off').onclick = async () => { if (!confirm('Turn off the lock? Your data will be stored unencrypted in this browser again.')) return; await store.disableLock(); U.toast('Lock turned off.'); redraw(); };
    } else {
      q('#lk-on').onclick = async () => {
        const a = q('#lk-p1').value, b = q('#lk-p2').value; if (a !== b) return U.toast('The passphrases do not match.'); if (!q('#lk-ack').checked) return U.toast('Please tick the box to confirm.');
        try {
          await store.enableLock(a); store.save(); U.toast('Lock is on. Encryption self-test passed.'); redraw();
          if (connected() && confirm('Also delete the older unencrypted copies in Google Drive? (Recommended — otherwise they stay readable.)')) { try { await FOS.drivePurgeOld(); } catch (e) { U.toast(e.message); } }
        } catch (e) { U.toast(e.message); }
      };
    }
  };

  /* ---------------- Settings: test box ---------------- */
  FOS.renderTestBox = function (el) {
    el.innerHTML = `<h2>Test box</h2><p>Check that everything works on <b>this device</b> before you rely on it. Nothing here changes your data.</p><div class="testbox">
      <h4>1 · Access key</h4><div class="t-row"><input class="input" type="password" id="tb-key" placeholder="Type a key to test" autocomplete="off" style="max-width:320px"><button class="btn" id="tb-keybtn">Test key</button></div><div class="t-out" id="tb-keyout"></div>
      <h4>2 · Saving on this device</h4><div class="t-row"><button class="btn" id="tb-save">Test saving</button></div><div class="t-out" id="tb-saveout"></div>
      <h4>3 · Encryption (password lock)</h4><div class="t-row"><button class="btn" id="tb-enc">Test encryption</button></div><div class="t-out" id="tb-encout"></div>
      <h4>4 · Google Drive connection</h4><div class="t-row"><button class="btn" id="tb-drive">Test Google Drive</button></div><div class="t-out" id="tb-driveout"></div>
      <h4>5 · Phone / offline readiness</h4><div class="t-row"><button class="btn" id="tb-pwa">Check install &amp; offline</button></div><div class="t-out" id="tb-pwaout"></div></div>`;
    const q = (id) => el.querySelector(id), ok = (t) => `<div class="okk">✓ ${U.esc(t)}</div>`, no = (t) => `<div class="bad">✗ ${U.esc(t)}</div>`;
    q('#tb-keybtn').onclick = () => { const v = q('#tb-key').value; q('#tb-keyout').innerHTML = !v.trim() ? no('Type a key first.') : (FOS.gate && FOS.gate.check(v)) ? ok('This key is correct.') : no('This key is not correct.'); };
    q('#tb-save').onclick = async () => {
      try { localStorage.setItem('fos.test', 'ok'); const r = localStorage.getItem('fos.test') === 'ok'; localStorage.removeItem('fos.test'); const persisted = await FOS.requestPersistence();
        q('#tb-saveout').innerHTML = (r ? ok('Saving works.') : no('Saving did not work.')) + `<div>Your data uses about ${(JSON.stringify(store.get()).length / 1024).toFixed(0)} KB of roughly 5,000 KB available.</div>` + (persisted ? ok('The browser has promised not to erase this data when space is tight.') : '<div class="muted">The browser has not promised to keep this data. Installing the app to your home screen and keeping a Drive copy protects you.</div>');
      } catch (e) { q('#tb-saveout').innerHTML = no('This browser blocks saving (private mode or storage full): ' + e.message); }
    };
    q('#tb-enc').onclick = async () => { q('#tb-encout').textContent = 'Testing…'; try { const good = await store.selfTestCrypto(); q('#tb-encout').innerHTML = good ? ok('Encryption works: data encrypts, decrypts, and a wrong passphrase is refused.') : no('Encryption self-test failed.'); } catch (e) { q('#tb-encout').innerHTML = no(e.message); } };
    q('#tb-drive').onclick = async () => {
      const out = q('#tb-driveout'); if (!clientId()) { out.innerHTML = no('No Google client ID is set. Add it in js/sync.js (DEFAULT_CLIENT_ID) or in the Google Drive section above.'); return; }
      let log = ''; const step = (t, good) => { log += good ? ok(t) : no(t); out.innerHTML = log; };
      try {
        out.textContent = 'Opening Google sign-in…'; await ensureToken('interactive'); step('Signed in to Google.', true);
        const meta = await writeFile('finance-os-test.json', JSON.stringify({ test: Date.now() }), null, 'interactive'); step('Wrote a small test file to your Drive app folder.', true);
        const back = JSON.parse(await readFile(meta.id, 'interactive')); step(back.test ? 'Read it back correctly.' : 'Read-back failed.', !!back.test);
        await deleteFile(meta.id, 'interactive'); step('Cleaned up the test file. Drive sync will work.', true);
        try { await api(DRIVE + 'files/' + (await findMeta(NAME, 'interactive') || { id: 'x' }).id + '/revisions?fields=revisions(id)', null, 'interactive'); step('Google returns earlier versions of your file (Version history will work).', true); } catch (e) { step('Earlier versions are not available from Google for this file (the app still keeps its own safety copies).', false); }
      } catch (e) { step(e.message, false); }
    };
    q('#tb-pwa').onclick = async () => {
      const out = q('#tb-pwaout'); let log = '';
      const add = (good, t) => { log += good ? ok(t) : no(t); };
      add(!!document.querySelector('link[rel="manifest"]'), 'App manifest is present (needed to install).');
      const sw = 'serviceWorker' in navigator; add(sw, sw ? 'This browser supports offline apps.' : 'This browser does not support offline apps.');
      if (sw) { const reg = await navigator.serviceWorker.getRegistration().catch(() => null); add(!!reg, reg ? 'Offline support is active on this device.' : 'Offline support is not active yet (it activates on the published https address, after one visit).'); }
      add(window.matchMedia && window.matchMedia('(display-mode: standalone)').matches, window.matchMedia && window.matchMedia('(display-mode: standalone)').matches ? 'You are running it as an installed app.' : 'Running in a normal browser tab (install it from the browser menu to get the app).');
      out.innerHTML = log;
    };
  };

  /* ---------------- unlock screen + idle lock ---------------- */
  FOS.showUnlock = function (done2) {
    const d = document.createElement('div'); d.className = 'lock-screen'; d.innerHTML = `<form class="lock-box" autocomplete="off"><div class="logo-lg">🔒</div><h1>Finance OS</h1><p>Enter your passphrase to open your data.</p><input class="input" type="password" id="lk-pass" placeholder="Passphrase" autocomplete="current-password" autofocus><p class="err" id="lk-err" role="alert"></p><button class="btn primary lg" type="submit">Unlock</button><p class="note">Forgot it? The data cannot be recovered without it — restore from your plain export, or a Drive copy, instead.</p></form>`;
    document.body.appendChild(d); d.querySelector('#lk-pass').focus();
    d.querySelector('form').onsubmit = async (e) => { e.preventDefault(); const err = d.querySelector('#lk-err'); err.textContent = ''; try { await store.unlock(d.querySelector('#lk-pass').value); d.remove(); done2(); } catch (x) { err.textContent = x.message; } };
  };
  FOS.initIdle = function () {
    const mins = +(ls.get('fos.idle') || 0); if (!mins || !store.hasLock()) return; let t;
    const reset = () => { clearTimeout(t); t = setTimeout(() => { store.flush(); setTimeout(() => location.reload(), 400); }, mins * 60000); };
    ['pointerdown', 'keydown', 'scroll'].forEach((ev) => document.addEventListener(ev, reset, { passive: true })); reset();
  };
  // the cloud icon in the top bar: sign in / decide a conflict / open the sync settings
  FOS.syncChipClick = function () {
    if (status.kind === 'needsignin' || !valid()) { FOS.signIn(); return; }
    if (status.kind === 'conflict') { FOS.syncAskAgain(); return; }
    location.hash = '#/settings'; setTimeout(() => { const t = document.getElementById('sec-sync'); if (t && t.scrollIntoView) t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 250);
  };
  FOS.paintSyncChip = paintChip;
})();
