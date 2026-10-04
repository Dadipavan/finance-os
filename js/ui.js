/* ==========================================================================
   ui.js — small DOM helpers (escape, toast, modal, animated numbers)
   ========================================================================== */
window.FOS = window.FOS || {};
(function () {
  'use strict';
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const reduceMotion = () => FOS.store.get().settings.reduceMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let toastTimer;
  function toast(msg) {
    let t = $('#toast'); if (!t) return;
    t.textContent = msg; t.classList.add('show'); clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), Math.min(7000, 2400 + String(msg).length * 40));
  }

  let lastFocus = null;
  function modal(title, html, opts = {}) {
    const root = $('#modal-root'); lastFocus = document.activeElement;
    root.innerHTML = `<div class="modal-back" data-close><div class="modal ${opts.wide ? 'wide' : ''}" role="dialog" aria-modal="true" aria-label="${esc(title)}" tabindex="-1">
      <div class="modal-head"><h2>${esc(title)}</h2><button class="icon-btn" data-close aria-label="Close dialog">✕</button></div>
      <div class="modal-body">${html}</div></div></div>`;
    const box = $('.modal', root); box.focus();
    root.onclick = (e) => { if (e.target.hasAttribute && e.target.hasAttribute('data-close') && (e.target.classList.contains('modal-back') || e.target.classList.contains('icon-btn'))) closeModal(); };
    root.onkeydown = (e) => { if (e.key === 'Escape') closeModal(); };
    return box;
  }
  function closeModal() { const root = $('#modal-root'); root.innerHTML = ''; if (lastFocus && lastFocus.focus) lastFocus.focus(); }

  // Animate a number inside an element
  function animate(el, to, format) {
    if (!el) return;
    const from = +el.dataset.val;
    el.dataset.val = to;
    if (!Number.isFinite(to) || !Number.isFinite(from) || reduceMotion() || from === to) { el.textContent = format(to); return; }
    const t0 = performance.now(), dur = 350;
    const step = (t) => {
      const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
      el.textContent = format(from + (to - from) * e);
      if (k < 1 && +el.dataset.val === to) requestAnimationFrame(step); else el.textContent = format(to);
    };
    requestAnimationFrame(step);
  }

  function download(name, text, type = 'text/plain') {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  async function copy(text) {
    try { await navigator.clipboard.writeText(text); toast('Copied to clipboard'); }
    catch (e) { const t = document.createElement('textarea'); t.value = text; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); toast('Copied to clipboard'); } catch (x) { toast('Copy failed — select and copy manually'); } t.remove(); }
  }
  // Refuse anything that looks like a secret or long account/card number
  function looksSensitive(str) {
    const s = String(str || '');
    return /\d{12,}/.test(s.replace(/[\s-]/g, '')) || /\b(password|passwd|otp|cvv|cvc|upi\s*pin|atm\s*pin|net\s*banking|aadhaar|aadhar)\b/i.test(s);
  }
  const SENSITIVE_MSG = 'This looks like a card/account number or a secret (password, OTP, PIN, CVV, Aadhaar). Finance OS never needs these — please remove it.';
  const parse = (v) => { const x = parseFloat(String(v).replace(/,/g, '')); return Number.isFinite(x) ? x : 0; };
  const tip = (t) => `<span class="tip" tabindex="0" role="note" aria-label="${esc(t)}" data-tip="${esc(t)}">ⓘ</span>`;
  const disclaimer = 'Projection based on the assumed return.';

  FOS.ui = { esc, $, $$, toast, modal, closeModal, animate, download, copy, looksSensitive, SENSITIVE_MSG, parse, tip, disclaimer, reduceMotion };
})();

/* ---------- calculator registry helpers (used by every *.js feature file) ---------- */
(function () {
  'use strict';
  FOS.calcs = {};
  FOS.reg = (c) => { FOS.calcs[c.id] = c; return c; };
  // fld(type,id,label,def,min,max,step,extra) — min/max = slider range, lo/hi = hard validation bounds
  const fld = (type, id, label, def, min, max, step, x) => Object.assign({ type, id, label, def, min, max, step, lo: 0, hi: ({ pct: 100, yrs: 100, mon: 1200, num: 1e9 })[type] || 1e12 }, x || {});
  FOS.F = {
    money: (id, label, def, max, step, x) => fld('money', id, label, def, 0, max, step || Math.max(1, Math.round(max / 200)), x),
    pct: (id, label, def, max, step, x) => fld('pct', id, label, def, 0, max, step || 0.1, x),
    yrs: (id, label, def, max, step, x) => fld('yrs', id, label, def, 0, max, step || 1, x),
    mon: (id, label, def, max, step, x) => fld('mon', id, label, def, 0, max, step || 1, x),
    num: (id, label, def, max, step, x) => fld('num', id, label, def, 0, max, step || 1, x),
    sel: (id, label, def, options, x) => Object.assign({ type: 'sel', id, label, def, options, lo: -1e12, hi: 1e12 }, x || {})
  };
  FOS.S = (l, v, f, hi) => ({ l, v, f: f || 'inr', hi: !!hi });
})();

/* ---------- generic inline-editable list (budget items, assets, goals, reminders ...) ---------- */
(function () {
  'use strict';
  const { esc } = FOS.ui;
  FOS.crud = function (root, cfg) {
    const store = FOS.store;
    const list = () => cfg.list(store.get());
    const cell = (c, it) => {
      const v = it[c.k] ?? '';
      const common = `data-k="${c.k}" aria-label="${esc(c.label)}" class="cell"`;
      if (c.type === 'select') return `<select ${common}>${c.options.map((o) => { const [val, lab] = Array.isArray(o) ? o : [o, o]; return `<option value="${esc(val)}" ${String(val) === String(v) ? 'selected' : ''}>${esc(lab)}</option>`; }).join('')}</select>`;
      if (c.type === 'money') return `<input ${common} type="number" min="0" step="any" inputmode="decimal" enterkeyhint="done" value="${esc(v)}" placeholder="₹">`;
      if (c.type === 'number') return `<input ${common} type="number" min="0" step="any" inputmode="decimal" enterkeyhint="done" value="${esc(v)}">`;
      if (c.type === 'date') return `<input ${common} type="date" value="${esc(v)}">`;
      return `<input ${common} type="text" maxlength="80" value="${esc(v)}" autocomplete="off" enterkeyhint="done">`;
    };
    const cols = () => cfg.cols.filter((c) => !c.hide || !c.hide(store.get()));
    let shown = cfg.pageSize || 60;
    function draw() {
      const all = list(), items = all.slice(0, shown), cs = cols();
      root.innerHTML = `<div class="table-scroll crud-wrap"><table class="data crud"><thead><tr>${cs.map((c) => `<th scope="col">${esc(c.label)}</th>`).join('')}${cfg.computed ? `<th scope="col">${esc(cfg.computed.label)}</th>` : ''}<th><span class="sr">Remove</span></th></tr></thead><tbody>
        ${items.length ? items.map((it) => `<tr data-id="${it.id}">${cs.map((c) => `<td data-label="${esc(c.label)}">${cell(c, it)}</td>`).join('')}${cfg.computed ? `<td class="comp" data-label="${esc(cfg.computed.label)}">${cfg.computed.fn(it)}</td>` : ''}<td class="del"><button class="icon-btn" data-del="${it.id}" aria-label="Remove row">🗑</button></td></tr>`).join('') : `<tr><td colspan="${cs.length + 2}" class="muted">${esc(cfg.empty || 'Nothing here yet.')}</td></tr>`}
        </tbody></table></div>${all.length > shown ? `<div class="row-actions"><button class="btn ghost" data-more>Show ${Math.min(100, all.length - shown)} more (showing ${shown} of ${FOS.fmt.num(all.length)})</button></div>` : ''}<div class="row-actions"><button class="btn" data-add>＋ ${esc(cfg.addLabel || 'Add')}</button>${cfg.extraButtons || ''}</div><div class="crud-foot">${cfg.footer ? cfg.footer(all) : ''}</div>`;
    }
    root.onclick = (e) => {
      if (e.target.closest('[data-more]')) { shown += 100; draw(); return; }
      if (e.target.closest('[data-add]')) { store.update((s) => { const row = Object.assign({ id: store.uid() }, cfg.blank()); if (cfg.addToTop) cfg.list(s).unshift(row); else cfg.list(s).push(row); }); if (!cfg.addToTop) shown = Math.max(shown, list().length); draw(); cfg.onChange && cfg.onChange(); const nr = root.querySelector(cfg.addToTop ? 'tbody tr:first-child input' : 'tbody tr:last-child input'); if (nr) nr.focus(); }
      const d = e.target.closest('[data-del]');
      if (d) { store.update((s) => { const a = cfg.list(s); const i = a.findIndex((x) => x.id === d.dataset.del); if (i >= 0) a.splice(i, 1); }); draw(); cfg.onChange && cfg.onChange(); }
    };
    root.onchange = (e) => {
      const tr = e.target.closest('tr[data-id]'); if (!tr || !e.target.dataset.k) return;
      const c = cfg.cols.find((x) => x.k === e.target.dataset.k); let val = e.target.value;
      if (c.type === 'text' && FOS.ui.looksSensitive(val)) { FOS.ui.toast(FOS.ui.SENSITIVE_MSG); e.target.value = ''; val = ''; }
      if (c.type === 'money' || c.type === 'number') { val = val === '' ? '' : Math.max(0, parseFloat(val) || 0); e.target.value = val; }
      store.update((s) => { const it = cfg.list(s).find((x) => x.id === tr.dataset.id); if (it) { it[c.k] = val; if (cfg.touch) cfg.touch(it, c.k); } });
      if (cfg.computed) { const it = list().find((x) => x.id === tr.dataset.id); tr.querySelector('.comp').innerHTML = cfg.computed.fn(it); }
      const f = root.querySelector('.crud-foot'); if (f && cfg.footer) f.innerHTML = cfg.footer(list());
      if (cfg.redraw) draw();
      cfg.onChange && cfg.onChange();
    };
    draw();
    return { draw };
  };
  FOS.tools = FOS.tools || {};
})();

/* ---------- tabs helper ---------- */
FOS.tabs = function (root, tabs, start) {
  const id = 't' + Math.random().toString(36).slice(2, 6);
  root.innerHTML = `<div class="tabs" role="tablist">${tabs.map((t, i) => `<button role="tab" class="tab" id="${id}-${i}" aria-selected="false" data-i="${i}">${FOS.ui.esc(t.label)}</button>`).join('')}</div><div class="tabpanel" role="tabpanel"></div>`;
  const panel = root.querySelector('.tabpanel');
  const show = (i) => { root.querySelectorAll('.tab').forEach((b, k) => { b.setAttribute('aria-selected', k === i); b.tabIndex = k === i ? 0 : -1; }); panel.setAttribute('aria-labelledby', `${id}-${i}`); panel.innerHTML = ''; tabs[i].render(panel); };
  root.querySelector('.tabs').addEventListener('click', (e) => { const b = e.target.closest('.tab'); if (b) show(+b.dataset.i); });
  root.querySelector('.tabs').addEventListener('keydown', (e) => { const cur = +(document.activeElement.dataset.i); if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { const n = (cur + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length; show(n); root.querySelector(`[data-i="${n}"]`).focus(); } });
  show(start || 0);
};
