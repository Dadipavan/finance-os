/* Finance OS — small everyday calculator (round button at the bottom right). No eval: a plain chain calculator, keyboard friendly. */
(function () {
  'use strict';
  const FOS = window.FOS, U = FOS.ui;
  const OPS = { '+': (a, b) => a + b, '−': (a, b) => a - b, '×': (a, b) => a * b, '÷': (a, b) => (b === 0 ? NaN : a / b) };
  const KEYS = [['C', '⌫', '%', '÷'], ['7', '8', '9', '×'], ['4', '5', '6', '−'], ['1', '2', '3', '+'], ['±', '0', '.', '=']];
  const clean = (n) => +(+n).toPrecision(12);
  const show = (s) => { if (s === 'Error') return s; const [i, d] = String(s).split('.'); const neg = i[0] === '-'; const g = Number((neg ? i.slice(1) : i) || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 }); return (neg ? '-' : '') + g + (d !== undefined ? '.' + d : ''); };
  function open() {
    let cur = '0', acc = null, op = null, fresh = true, trail = '';
    const html = `<div class="mc"><div class="mc-trail" id="mc-trail" aria-hidden="true">&nbsp;</div><div class="mc-out" id="mc-out" role="status" aria-live="polite">0</div><div class="mc-keys">${KEYS.map((r) => r.map((k) => `<button type="button" class="mc-k${'÷×−+='.includes(k) ? ' op' : ''}" data-k="${k}">${k}</button>`).join('')).join('')}</div><p class="muted" style="margin:.5rem 0 0;font-size:.78rem">Keyboard works too: digits, + − * /, Enter, Backspace, Esc.</p></div>`;
    const box = U.modal('Calculator', html);
    const out = box.querySelector('#mc-out'), tr = box.querySelector('#mc-trail');
    const paint = () => { out.textContent = show(cur); tr.innerHTML = trail || '&nbsp;'; };
    const val = () => parseFloat(cur);
    const apply = () => { if (op && acc !== null) { const r = OPS[op](acc, val()); return isFinite(r) ? clean(r) : NaN; } return val(); };
    function press(k) {
      if (cur === 'Error' && k !== 'C') return;
      if (/^[0-9]$/.test(k)) { cur = fresh || cur === '0' ? k : (cur.replace(/[-.]/g, '').length < 15 ? cur + k : cur); fresh = false; }
      else if (k === '.') { if (fresh) { cur = '0.'; fresh = false; } else if (!cur.includes('.')) cur += '.'; }
      else if (k === 'C') { cur = '0'; acc = null; op = null; fresh = true; trail = ''; }
      else if (k === '⌫') { if (!fresh) { cur = cur.length > 1 && cur !== '-0' ? cur.slice(0, -1) : '0'; if (cur === '-') cur = '0'; } }
      else if (k === '±') { if (cur !== '0') cur = cur[0] === '-' ? cur.slice(1) : '-' + cur; }
      else if (k === '%') { cur = String(clean(val() / 100)); fresh = true; }
      else if (k === '=') { if (op) { const r = apply(); trail = show(String(acc)) + ' ' + op + ' ' + show(cur) + ' ='; cur = isNaN(r) ? 'Error' : String(r); acc = null; op = null; fresh = true; } }
      else if (OPS[k]) { if (op && !fresh) { const r = apply(); if (isNaN(r)) { cur = 'Error'; paint(); return; } acc = r; cur = String(r); } else acc = val(); op = k; fresh = true; trail = show(String(acc)) + ' ' + k; }
      paint();
    }
    box.addEventListener('click', (e) => { const b = e.target.closest('[data-k]'); if (b) press(b.dataset.k); });
    box.addEventListener('keydown', (e) => {
      const m = { '*': '×', '/': '÷', '-': '−', Enter: '=', Backspace: '⌫', Delete: 'C', c: 'C', C: 'C', '=': '=' }, k = m[e.key] || e.key;
      if (/^[0-9.+%]$/.test(k) || '×÷−=⌫C'.includes(k) && k.length === 1) { if (e.target.closest('[data-k]') && e.key === 'Enter') return; e.preventDefault(); press(k); }
    });
  }
  FOS.miniCalc = open;
  document.addEventListener('click', (e) => { if (e.target.closest && e.target.closest('#fab-calc')) open(); });
})();
