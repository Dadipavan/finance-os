/* ==========================================================================
   gate.js — access key asked once on each device before the app opens.
   Only a salted, iterated SHA-256 hash of the key is stored here (never the key itself).
   It is checked in the browser, so it keeps ordinary visitors out but cannot stop a technically
   skilled person who edits the files, and anyone who knows the key can share it.
   To change the key: compute a new hash (see README -> "Change the access key") and replace SALT / HASH.
   Set required: false to switch the gate off.
   ========================================================================== */
window.FOS = window.FOS || {};
(function () {
  'use strict';
  const CFG = { required: true, salt: 'd4/G72SgToOzUA+cME/+pQ==', hash: 'IlS/Wt45LTJW7vD3xG6jG8XVbFkoKs3nXbvO1fS1qRw=', rounds: 20000, contact: 'Enter the access key you were given.' };
  const LS = 'fos.gate';

  /* ---- small pure-JavaScript SHA-256 (works in every browser, no secure-page requirement) ---- */
  const K = [0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5, 0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174, 0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da, 0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967, 0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85, 0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070, 0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3, 0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2];
  function sha256(msg) { // msg: array of bytes -> array of 32 bytes
    const H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19], l = msg.length, w = new Array(64);
    const m = msg.slice(); m.push(0x80); while (m.length % 64 !== 56) m.push(0);
    const hi = Math.floor((l * 8) / 4294967296), lo = (l * 8) >>> 0; [hi, lo].forEach((x) => { m.push((x >>> 24) & 255, (x >>> 16) & 255, (x >>> 8) & 255, x & 255); });
    const rr = (x, n) => (x >>> n) | (x << (32 - n));
    for (let o = 0; o < m.length; o += 64) {
      for (let i = 0; i < 16; i++) w[i] = (m[o + 4 * i] << 24) | (m[o + 4 * i + 1] << 16) | (m[o + 4 * i + 2] << 8) | m[o + 4 * i + 3];
      for (let i = 16; i < 64; i++) { const s0 = rr(w[i - 15], 7) ^ rr(w[i - 15], 18) ^ (w[i - 15] >>> 3), s1 = rr(w[i - 2], 17) ^ rr(w[i - 2], 19) ^ (w[i - 2] >>> 10); w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0; }
      let [a, b, c, d, e, f, g, h] = H;
      for (let i = 0; i < 64; i++) { const S1 = rr(e, 6) ^ rr(e, 11) ^ rr(e, 25), ch = (e & f) ^ (~e & g), t1 = (h + S1 + ch + K[i] + w[i]) | 0, S0 = rr(a, 2) ^ rr(a, 13) ^ rr(a, 22), mj = (a & b) ^ (a & c) ^ (b & c), t2 = (S0 + mj) | 0; h = g; g = f; f = e; e = (d + t1) | 0; d = c; c = b; b = a; a = (t1 + t2) | 0; }
      H[0] = (H[0] + a) | 0; H[1] = (H[1] + b) | 0; H[2] = (H[2] + c) | 0; H[3] = (H[3] + d) | 0; H[4] = (H[4] + e) | 0; H[5] = (H[5] + f) | 0; H[6] = (H[6] + g) | 0; H[7] = (H[7] + h) | 0;
    }
    const out = []; H.forEach((x) => { out.push((x >>> 24) & 255, (x >>> 16) & 255, (x >>> 8) & 255, x & 255); }); return out;
  }
  const utf8 = (s) => Array.from(unescape(encodeURIComponent(s))).map((c) => c.charCodeAt(0));
  const b64 = (bytes) => { const c = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'; let o = ''; for (let i = 0; i < bytes.length; i += 3) { const a = bytes[i], b = bytes[i + 1], d = bytes[i + 2], n = (a << 16) | ((b || 0) << 8) | (d || 0); o += c[(n >> 18) & 63] + c[(n >> 12) & 63] + (b === undefined ? '=' : c[(n >> 6) & 63]) + (d === undefined ? '=' : c[n & 63]); } return o; };
  const unb64 = (t) => { const c = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/', o = []; t = t.replace(/=+$/, ''); for (let i = 0; i < t.length; i += 4) { const n = (c.indexOf(t[i]) << 18) | (c.indexOf(t[i + 1]) << 12) | ((c.indexOf(t[i + 2]) & 63) << 6) | (c.indexOf(t[i + 3]) & 63); o.push((n >> 16) & 255); if (i + 2 < t.length) o.push((n >> 8) & 255); if (i + 3 < t.length) o.push(n & 255); } return o; };
  // salted, iterated hash: h0 = SHA256(salt + key); h(i+1) = SHA256(h(i) + key)
  function derive(key, saltB64, rounds) { const k = utf8(String(key)), salt = unb64(saltB64); let h = sha256(salt.concat(k)); for (let i = 1; i < rounds; i++) h = sha256(h.concat(k)); return b64(h); }
  const same = (a, b) => { if (a.length !== b.length) return false; let r = 0; for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i); return r === 0; };

  FOS.gate = {
    cfg: CFG, sha256, derive, b64, utf8,
    check(key) { return same(derive(key.trim(), CFG.salt, CFG.rounds), CFG.hash); },
    isOpen() { try { return !CFG.required || same(localStorage.getItem(LS) || '', CFG.hash); } catch (e) { return !CFG.required; } },
    forget() { try { localStorage.removeItem(LS); localStorage.removeItem('fos.setup'); } catch (e) { /* ignore */ } },
    setupDone: () => { try { return localStorage.getItem('fos.setup') === '1'; } catch (e) { return false; } }
  };

  /* ---- first-run setup: Step 1 access key (a field) -> Step 2 connect Drive (first time only) ---- */
  const SETUP = 'fos.setup';
  const setupDone = () => { try { return localStorage.getItem(SETUP) === '1'; } catch (e) { return false; } };
  const driveAvailable = () => !!(FOS.drive && FOS.drive.configured());
  FOS.accessGate = function (done) {
    const keyOk = FOS.gate.isOpen(), needDrive = driveAvailable() && !setupDone();
    if (keyOk && !needDrive) return done();
    const d = document.createElement('div'); d.className = 'lock-screen';
    const finish = () => { try { localStorage.setItem(SETUP, '1'); } catch (e) { /* ignore */ } d.remove(); done(); };
    const step1 = () => {
      d.innerHTML = '<form class="lock-box" autocomplete="off"><div class="logo-lg">🔑</div><h1>Finance OS</h1><ol class="setup-steps"><li class="on">1 · Access key</li><li>2 · Google Drive</li></ol><label class="lbl" for="gate-key">Access key</label><input class="input" type="password" id="gate-key" placeholder="Enter the key you were given" autocomplete="off" autocapitalize="off" spellcheck="false"><label class="check"><input type="checkbox" id="gate-show"> Show key</label><p class="err" id="gate-err" role="alert"></p><button class="btn primary lg" type="submit">Verify key</button><p class="note">' + FOS.ui.esc(CFG.contact) + ' You enter the key <b>once for life</b>: it is remembered in your own Google Drive.</p>' + (driveAvailable() ? '<hr><p class="note"><b>Already entered your key before</b> (another phone or browser)?</p><button class="btn" type="button" id="gate-drive">Continue with Google Drive</button><p class="err" id="gate-derr" role="alert"></p>' : '') + '</form>';
      const inp = d.querySelector('#gate-key'); inp.focus(); d.querySelector('#gate-show').onchange = (e) => { inp.type = e.target.checked ? 'text' : 'password'; };
      const gd = d.querySelector('#gate-drive');
      if (gd) gd.onclick = async () => {
        const derr = d.querySelector('#gate-derr'); gd.disabled = true; derr.textContent = 'Opening Google…';
        try {
          if (await FOS.drive.checkAccess(CFG.hash, true)) { try { localStorage.setItem(LS, CFG.hash); } catch (x) { /* ignore */ } derr.textContent = 'Recognised — loading your data…'; try { await FOS.syncNow(false); } catch (x) { /* data sync can be retried in Settings */ } finish(); }
          else { derr.textContent = 'No saved key found in this Google account (or the key has changed). Enter the key above.'; gd.disabled = false; }
        } catch (e) { derr.textContent = e.message; gd.disabled = false; }
      };
      d.querySelector('form').onsubmit = (e) => {
        e.preventDefault(); const err = d.querySelector('#gate-err'); err.textContent = 'Checking…';
        setTimeout(() => { if (FOS.gate.check(inp.value)) { try { localStorage.setItem(LS, CFG.hash); } catch (x) { /* private mode: asked again next time */ } if (driveAvailable() && !setupDone()) step2(); else finish(); } else err.textContent = 'That key is not correct.'; }, 30);
      };
    };
    const step2 = () => {
      d.innerHTML = '<div class="lock-box"><div class="logo-lg">☁️</div><h1>Key verified ✓</h1><ol class="setup-steps"><li class="done">1 · Access key</li><li class="on">2 · Google Drive</li></ol><p>Connect your Google Drive so your data is saved in <b>your own</b> Drive and follows you to every device. Your key is remembered there <b>for life</b>: on a new phone or browser you will just press <i>Continue with Google Drive</i> and never type the key again. You do this <b>only this first time</b>.</p><p class="err" id="gd-err" role="alert"></p><button class="btn primary lg" id="gd-go">Connect Google Drive</button><button class="btn ghost" id="gd-skip">Skip for now</button><p class="note">Skipping is fine — connect later in Settings. You will not be asked again on this device.</p></div>';
      d.querySelector('#gd-go').onclick = async () => { const err = d.querySelector('#gd-err'), btn = d.querySelector('#gd-go'); btn.disabled = true; err.textContent = 'Opening Google…'; try { await FOS.syncNow(true); if (FOS.drive.connected()) { try { await FOS.drive.recordAccess(CFG.hash); } catch (x) { /* retried on next sync */ } finish(); } else { err.textContent = 'Not connected yet — you can try again or skip.'; btn.disabled = false; } } catch (e) { err.textContent = e.message; btn.disabled = false; } };
      d.querySelector('#gd-skip').onclick = finish;
    };
    document.body.appendChild(d); if (keyOk) step2(); else step1();
  };

  FOS.renderGateSettings = function (el) {
    el.innerHTML = '<h2>Access key</h2>' + (CFG.required ? '<p>The access key was accepted on this device.</p><div class="row-actions"><button class="btn ghost" id="gate-forget">Forget the key on this device</button></div><p class="note">Your data is not deleted; you will be asked for the key the next time you open the app.</p>' : '<p>No access key is required on this copy of the app.</p>');
    const b = el.querySelector('#gate-forget'); if (b) b.onclick = () => { FOS.gate.forget(); location.reload(); };
  };
})();
