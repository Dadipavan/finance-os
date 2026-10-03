/* ==========================================================================
   sync.js — optional Google Drive auto-sync (your own hidden app folder),
   passphrase lock screen, idle auto-lock, settings panels.
   Google's sign-in script is loaded only when you press Connect / Sync.
   ========================================================================== */
(function () {
  'use strict';
  const U = FOS.ui, esc = U.esc, store = FOS.store, fmt = FOS.fmt;
  const CID = 'fos.gclient', CONN = 'fos.gconnected', NAME = 'finance-os-data.json';
  let token = null, tokenExp = 0, timer = null, suppress = false, warned = false, busy = false;
  // Put YOUR Google OAuth client ID here once (it is public by design, not a secret). Then users never type it.
  const DEFAULT_CLIENT_ID = '';
  const clientId = () => localStorage.getItem(CID) || DEFAULT_CLIENT_ID;
  const connected = () => localStorage.getItem(CONN) === '1' && !!clientId();
  FOS.drive = { configured: () => !!clientId(), connected: () => connected(), recordAccess: (h) => recordAccess(h), checkAccess: (h, i) => checkAccess(h, i) };
  FOS.syncNeeded = () => connected() && !(token && Date.now() < tokenExp - 60000);

  /* ---------------- Google auth + Drive REST ---------------- */
  function loadGIS() {
    return new Promise((res, rej) => {
      if (window.google && window.google.accounts && window.google.accounts.oauth2) return res();
      const s = document.createElement('script'); s.src = 'https://accounts.google.com/gsi/client'; s.onload = res; s.onerror = () => rej(new Error('Could not load Google sign-in (are you online?)')); document.head.appendChild(s);
    });
  }
  async function getToken(interactive) {
    if (token && Date.now() < tokenExp - 60000) return token;
    if (!clientId()) throw new Error('Enter your Google client ID first.');
    await loadGIS();
    return new Promise((res, rej) => {
      const tc = window.google.accounts.oauth2.initTokenClient({ client_id: clientId(), scope: 'https://www.googleapis.com/auth/drive.appdata', callback: (r) => { if (r.error) return rej(new Error(r.error_description || r.error)); token = r.access_token; tokenExp = Date.now() + (r.expires_in || 3600) * 1000; localStorage.setItem(CONN, '1'); res(token); }, error_callback: (e) => rej(new Error('Sign-in did not complete (' + (e && e.type ? e.type : 'closed') + ')')) });
      tc.requestAccessToken({ prompt: interactive ? 'consent' : '' });
    });
  }
  async function api(url, opts) {
    const t = await getToken(false), r = await fetch(url, Object.assign({}, opts, { headers: Object.assign({ Authorization: 'Bearer ' + t }, (opts || {}).headers) }));
    if (r.status === 401) { token = null; throw new Error('Google sign-in expired — press Sync now.'); }
    if (!r.ok) throw new Error('Google Drive error ' + r.status); return r;
  }
  const findFile = async (name) => { const r = await api('https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&fields=files(id,name,modifiedTime)&q=' + encodeURIComponent("name='" + name + "'")); return (await r.json()).files[0] || null; };
  const readFile = async (id) => (await api('https://www.googleapis.com/drive/v3/files/' + id + '?alt=media')).text();
  async function writeFile(name, text, id) {
    if (id) { await api('https://www.googleapis.com/upload/drive/v3/files/' + id + '?uploadType=media', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: text }); return id; }
    const b = 'fos' + Math.random().toString(36).slice(2), body = `--${b}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${JSON.stringify({ name, parents: ['appDataFolder'] })}\r\n--${b}\r\nContent-Type: application/json\r\n\r\n${text}\r\n--${b}--`;
    return (await (await api('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', { method: 'POST', headers: { 'Content-Type': 'multipart/related; boundary=' + b }, body })).json()).id;
  }
  /* ---- "key verified" record kept in the user's own Drive: lifetime, works on any new device ---- */
  const ACCESS_FILE = 'finance-os-access.json';
  async function recordAccess(hash) {
    if (localStorage.getItem('fos.accessRecorded') === hash) return;
    const f = await findFile(ACCESS_FILE); await writeFile(ACCESS_FILE, JSON.stringify({ v: 1, hash, verifiedAt: new Date().toISOString() }), f && f.id);
    localStorage.setItem('fos.accessRecorded', hash);
  }
  async function checkAccess(hash, interactive) {
    await getToken(interactive !== false); const f = await findFile(ACCESS_FILE); if (!f) return false;
    try { const o = JSON.parse(await readFile(f.id)); return !!o && o.hash === hash; } catch (e) { return false; }
  }
  const payload = async () => (store.hasLock() ? store.exportEncrypted(store.sessionPass()) : JSON.stringify({ app: 'finance-os', version: 1, exportedAt: new Date().toISOString(), data: store.get() }, null, 2));

  async function push() {
    const text = await payload(), f = await findFile(NAME); await writeFile(NAME, text, f && f.id);
    const mon = new Date().toISOString().slice(0, 7);
    if (store.get().meta.lastArchive !== mon) { const an = 'archive-' + mon + '.json', af = await findFile(an); await writeFile(an, text, af && af.id); suppress = true; store.update((s) => { s.meta.lastArchive = mon; }); suppress = false; }
    suppress = true; store.update((s) => { s.meta.lastSync = new Date().toISOString(); }); suppress = false;
    if (FOS.gate && FOS.gate.isOpen() && FOS.gate.cfg.required) { try { await recordAccess(FOS.gate.cfg.hash); } catch (e) { /* best effort */ } }
  }
  async function remoteObject(f) {
    const text = await readFile(f.id); let plain = text;
    if (FOS.crypto.isEncrypted(text)) { const pass = store.sessionPass() || prompt('Your Drive data is encrypted. Enter its passphrase:'); if (!pass) throw new Error('Passphrase needed to read the Drive copy.'); plain = await store.decryptText(text, pass); }
    return { plain, obj: JSON.parse(plain) };
  }
  // Two-way sync: newer wins, you decide when they conflict
  FOS.syncNow = async function (interactive) {
    if (busy) return; busy = true; setStatus('Syncing…');
    try {
      await getToken(interactive !== false);
      const f = await findFile(NAME);
      if (!f) { await push(); setStatus('Uploaded. Your data is now in Google Drive.'); return; }
      const r = await remoteObject(f), rt = (r.obj.data && r.obj.data.meta && r.obj.data.meta.updatedAt) || '', lt = store.get().meta.updatedAt || '';
      if (rt && rt > lt) {
        if (confirm(`Google Drive has NEWER data (saved ${fmt.date(rt)}).\n\nOK = load the Drive copy onto this device (replaces what is here).\nCancel = keep this device's data and overwrite Drive.`)) { store.importJSON(r.plain); setStatus('Loaded from Google Drive.'); FOS.route(); return; }
      }
      await push(); setStatus('Synced ' + new Date().toLocaleTimeString('en-IN'));
    } catch (e) { setStatus('Sync problem: ' + e.message); U.toast(e.message); } finally { busy = false; }
  };
  store.subscribe(() => { if (suppress || !connected()) return; clearTimeout(timer); timer = setTimeout(async () => { if (!(token && Date.now() < tokenExp - 60000)) { if (!warned) { warned = true; U.toast('Google Drive sync paused — open Settings or the banner and press Sync now.'); } return; } try { await push(); setStatus('Synced ' + new Date().toLocaleTimeString('en-IN')); } catch (e) { setStatus('Sync problem: ' + e.message); } }, 5000); });
  function setStatus(t) { const el = document.getElementById('sync-status'); if (el) el.textContent = t; }

  // On later opens: quietly renew the Google sign-in and sync, without asking again. If the browser needs a click, the banner offers it.
  FOS.syncResume = function () { if (!connected()) return; getToken(false).then(() => FOS.syncNow(false)).catch(() => { /* the banner offers "Sign in & sync" */ }); };

  /* ---------------- settings panels ---------------- */
  FOS.renderSyncSettings = function (el) {
    const last = store.get().meta.lastSync;
    el.innerHTML = `<h2>Google Drive auto-sync</h2><p>Keeps one encrypted-or-plain file in a hidden app folder of <b>your own</b> Google Drive, plus a monthly archive copy. Only this app can see that folder. Needs a free one-time setup (steps below) and only works on the published https address.</p>
      <div class="fields"><div class="field wide"><label>Google OAuth client ID<input class="input" id="gs-cid" placeholder="123456-abc.apps.googleusercontent.com" value="${esc(clientId())}" autocomplete="off"></label></div></div>
      <div class="row-actions"><button class="btn primary" id="gs-connect">Connect &amp; sync</button><button class="btn" id="gs-sync">Sync now</button><button class="btn ghost" id="gs-off">Disconnect</button></div>
      <p id="sync-status" class="status">${connected() ? 'Connected. ' + (last ? 'Last synced ' + fmt.date(last) + '.' : 'Press Sync now.') : 'Not connected.'}</p>
      <details><summary><b>One-time setup (about 10 minutes)</b></summary><ol><li>Open <a href="https://console.cloud.google.com" target="_blank" rel="noopener">console.cloud.google.com</a>, create a project (any name).</li><li>APIs &amp; Services → Library → enable <b>Google Drive API</b>.</li><li>OAuth consent screen → External → fill the app name and your email → add the scope <code>…/auth/drive.appdata</code> → under <b>Test users</b> add your own Gmail.</li><li>Credentials → Create credentials → <b>OAuth client ID</b> → type <b>Web application</b> → Authorised JavaScript origins: <code>https://&lt;your-username&gt;.github.io</code> (origin only, no path).</li><li>Copy the client ID above, press Connect &amp; sync, and allow access.</li></ol><p class="note">Per browser session, press <b>Sync now</b> once (Google requires a click to sign in). After that, every change uploads automatically a few seconds after you make it. A new device: connect, and choose to load the Drive copy.</p></details>`;
    el.querySelector('#gs-connect').onclick = () => { const v = el.querySelector('#gs-cid').value.trim(); if (!/\.apps\.googleusercontent\.com$/.test(v)) return U.toast('That does not look like a Google client ID.'); localStorage.setItem(CID, v); FOS.syncNow(true); };
    el.querySelector('#gs-sync').onclick = () => FOS.syncNow(true);
    el.querySelector('#gs-off').onclick = () => { localStorage.removeItem(CONN); token = null; setStatus('Disconnected. Your Drive copy is untouched.'); };
  };

  FOS.renderLockSettings = function (el) {
    const on = store.hasLock(), idle = localStorage.getItem('fos.idle') || '0';
    el.innerHTML = `<h2>Password lock &amp; encryption</h2><p>${on ? '🔒 <b>On.</b> Your data is stored encrypted (AES-256) in this browser and asked for a passphrase every time you open the app. Nobody with your device or your Drive file can read it without the passphrase.' : 'Off. Turn it on to require a passphrase to open the app and to store everything encrypted — on this device and in Google Drive.'}</p>
      ${on ? `<div class="row-actions"><button class="btn" id="lk-lock">Lock now</button><button class="btn" id="lk-export">Export encrypted backup</button><button class="btn" id="lk-change">Change passphrase</button><button class="btn danger" id="lk-off">Turn lock off</button></div><div class="field" style="max-width:300px"><label>Auto-lock when idle<select class="input" id="lk-idle">${[['0', 'Never'], ['5', '5 minutes'], ['15', '15 minutes'], ['60', '1 hour']].map(([v, l]) => `<option value="${v}" ${v === idle ? 'selected' : ''}>${l}</option>`).join('')}</select></label></div>`
      : `<div class="fields"><div class="field"><label>Passphrase (8+ characters)<input class="input" type="password" id="lk-p1" autocomplete="new-password"></label></div><div class="field"><label>Repeat passphrase<input class="input" type="password" id="lk-p2" autocomplete="new-password"></label></div></div><label class="check"><input type="checkbox" id="lk-ack"> I understand that a forgotten passphrase <b>cannot be recovered</b>; I keep a plain export somewhere safe.</label><div class="row-actions"><button class="btn primary" id="lk-on">Turn on password lock</button></div>`}`;
    const q = (id) => el.querySelector(id), redraw = () => FOS.renderLockSettings(el);
    if (on) {
      q('#lk-lock').onclick = () => location.reload();
      q('#lk-idle').onchange = (e) => { localStorage.setItem('fos.idle', e.target.value); U.toast('Saved'); };
      q('#lk-export').onclick = async () => { try { U.download('finance-os-encrypted-' + new Date().toISOString().slice(0, 10) + '.json', await store.exportEncrypted(store.sessionPass()), 'application/json'); } catch (e) { U.toast(e.message); } };
      q('#lk-change').onclick = async () => { const p = prompt('New passphrase (8+ characters):'); if (!p) return; if (prompt('Repeat the new passphrase:') !== p) return U.toast('They did not match.'); try { await store.enableLock(p); store.save(); U.toast('Passphrase changed.'); } catch (e) { U.toast(e.message); } };
      q('#lk-off').onclick = async () => { if (!confirm('Turn off the lock? Your data will be stored unencrypted in this browser again.')) return; await store.disableLock(); U.toast('Lock turned off.'); redraw(); };
    } else {
      q('#lk-on').onclick = async () => {
        const a = q('#lk-p1').value, b = q('#lk-p2').value; if (a !== b) return U.toast('The passphrases do not match.'); if (!q('#lk-ack').checked) return U.toast('Please tick the box to confirm.');
        try { await store.enableLock(a); store.save(); U.toast('Lock is on. Encryption self-test passed.'); redraw(); } catch (e) { U.toast(e.message); }
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
    q('#tb-save').onclick = () => { try { localStorage.setItem('fos.test', 'ok'); const r = localStorage.getItem('fos.test') === 'ok'; localStorage.removeItem('fos.test'); q('#tb-saveout').innerHTML = (r ? ok('Saving works.') : no('Saving did not work.')) + `<div>Your data uses about ${(JSON.stringify(store.get()).length / 1024).toFixed(0)} KB of roughly 5,000 KB available.</div>`; } catch (e) { q('#tb-saveout').innerHTML = no('This browser blocks saving (private mode or storage full): ' + e.message); } };
    q('#tb-enc').onclick = async () => { q('#tb-encout').textContent = 'Testing…'; try { const good = await store.selfTestCrypto(); q('#tb-encout').innerHTML = good ? ok('Encryption works: data encrypts, decrypts, and a wrong passphrase is refused.') : no('Encryption self-test failed.'); } catch (e) { q('#tb-encout').innerHTML = no(e.message); } };
    q('#tb-drive').onclick = async () => {
      const out = q('#tb-driveout'); if (!clientId()) { out.innerHTML = no('No Google client ID is set. Add it in js/sync.js (DEFAULT_CLIENT_ID) or in the Google Drive section above.'); return; }
      let log = ''; const step = (t, good) => { log += good ? ok(t) : no(t); out.innerHTML = log; };
      try {
        out.textContent = 'Opening Google sign-in…'; await getToken(true); step('Signed in to Google.', true);
        const id = await writeFile('finance-os-test.json', JSON.stringify({ test: Date.now() })); step('Wrote a small test file to your Drive app folder.', true);
        const back = JSON.parse(await readFile(id)); step(back.test ? 'Read it back correctly.' : 'Read-back failed.', !!back.test);
        await api('https://www.googleapis.com/drive/v3/files/' + id, { method: 'DELETE' }); step('Cleaned up the test file. Drive sync will work.', true);
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
  FOS.showUnlock = function (done) {
    const d = document.createElement('div'); d.className = 'lock-screen'; d.innerHTML = `<form class="lock-box" autocomplete="off"><div class="logo-lg">🔒</div><h1>Finance OS</h1><p>Enter your passphrase to open your data.</p><input class="input" type="password" id="lk-pass" placeholder="Passphrase" autocomplete="current-password" autofocus><p class="err" id="lk-err" role="alert"></p><button class="btn primary lg" type="submit">Unlock</button><p class="note">Forgot it? The data cannot be recovered without it — restore from your plain export, or a Drive copy, instead.</p></form>`;
    document.body.appendChild(d); d.querySelector('#lk-pass').focus();
    d.querySelector('form').onsubmit = async (e) => { e.preventDefault(); const err = d.querySelector('#lk-err'); err.textContent = ''; try { await store.unlock(d.querySelector('#lk-pass').value); d.remove(); done(); } catch (x) { err.textContent = x.message; } };
  };
  FOS.initIdle = function () {
    const mins = +(localStorage.getItem('fos.idle') || 0); if (!mins || !store.hasLock()) return; let t;
    const reset = () => { clearTimeout(t); t = setTimeout(() => location.reload(), mins * 60000); };
    ['pointerdown', 'keydown', 'scroll'].forEach((ev) => document.addEventListener(ev, reset, { passive: true })); reset();
  };
})();
