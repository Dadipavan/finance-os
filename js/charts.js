/* ==========================================================================
   charts.js — dependency-free SVG charts with hover tooltips
   ========================================================================== */
window.FOS = window.FOS || {};
(function () {
  'use strict';
  const PALETTE = ['#0f8f7e', '#4c5fd5', '#d99a1f', '#d4506a', '#8e5cf0', '#3b8fc4', '#7a8794', '#6aa84f'];
  const registry = {}; let seq = 0;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const fmtY = (kind) => (v) => (kind === 'pct' ? FOS.fmt.pct(v, 0) : kind === 'num' ? FOS.fmt.num(v, 0) : FOS.fmt.short(v));
  const fullY = (kind) => (v) => (kind === 'pct' ? FOS.fmt.pct(v, 1) : kind === 'num' ? FOS.fmt.num(v, 1) : FOS.fmt.inr(v));

  function niceTicks(min, max, count = 5) {
    if (max === min) { max = min + 1; }
    const raw = (max - min) / count, mag = Math.pow(10, Math.floor(Math.log10(raw))), f = raw / mag;
    const step = (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * mag;
    const lo = Math.floor(min / step) * step, hi = Math.ceil(max / step) * step, t = [];
    for (let v = lo; v <= hi + step / 2; v += step) t.push(v);
    return t;
  }
  const legend = (series) => `<div class="legend">${series.map((s, i) => `<span><i style="background:${s.color || PALETTE[i % PALETTE.length]}"></i>${esc(s.name)}</span>`).join('')}</div>`;

  /* line / area chart. series: [{name, data:[{x,y}], color, dash}] */
  function line(o) {
    const W = 640, H = o.h || 280, m = { l: 62, r: 14, t: 12, b: 34 };
    const series = (o.series || []).filter((s) => s.data && s.data.length);
    if (!series.length) return '<p class="muted">Nothing to chart yet.</p>';
    const all = series.flatMap((s) => s.data);
    const xs = all.map((p) => p.x), ys = all.map((p) => p.y);
    const xmin = Math.min(...xs), xmax = Math.max(...xs);
    const ticks = niceTicks(Math.min(0, ...ys), Math.max(...ys));
    const ymin = ticks[0], ymax = ticks[ticks.length - 1];
    const X = (x) => m.l + (xmax === xmin ? 0.5 : (x - xmin) / (xmax - xmin)) * (W - m.l - m.r);
    const Y = (y) => H - m.b - ((y - ymin) / (ymax - ymin || 1)) * (H - m.t - m.b);
    const yf = fmtY(o.yfmt), xf = o.xfmt || ((x) => x);
    let g = ticks.map((t) => `<line class="grid" x1="${m.l}" x2="${W - m.r}" y1="${Y(t)}" y2="${Y(t)}"/><text class="ax" x="${m.l - 8}" y="${Y(t) + 4}" text-anchor="end">${yf(t)}</text>`).join('');
    const xt = Math.min(6, new Set(xs).size);
    for (let i = 0; i < xt; i++) { const x = xmin + ((xmax - xmin) * i) / Math.max(1, xt - 1); g += `<text class="ax" x="${X(x)}" y="${H - 10}" text-anchor="middle">${esc(xf(Math.round(x * 10) / 10))}</text>`; }
    series.forEach((s, i) => {
      const c = s.color || PALETTE[i % PALETTE.length];
      const d = s.data.map((p, k) => (k ? 'L' : 'M') + X(p.x).toFixed(1) + ' ' + Y(p.y).toFixed(1)).join('');
      if (o.area && i === 0) g += `<path d="${d}L${X(s.data[s.data.length - 1].x)} ${Y(ymin)}L${X(s.data[0].x)} ${Y(ymin)}Z" fill="${c}" opacity=".12"/>`;
      g += `<path class="ln" d="${d}" fill="none" stroke="${c}" stroke-width="2.4" ${s.dash ? 'stroke-dasharray="6 4"' : ''} stroke-linejoin="round"/>`;
      if (s.data.length <= 2) g += s.data.map((p) => `<circle cx="${X(p.x)}" cy="${Y(p.y)}" r="4" fill="${c}"/>`).join('');
    });
    const id = 'c' + ++seq;
    registry[id] = { kind: 'line', W, H, m, series, X, xf, yf: fullY(o.yfmt), xmin, xmax, colors: series.map((s, i) => s.color || PALETTE[i % PALETTE.length]), xLabel: o.xLabel || '' };
    const label = (o.title || 'Line chart') + ': ' + series.map((s) => `${s.name} from ${fullY(o.yfmt)(s.data[0].y)} to ${fullY(o.yfmt)(s.data[s.data.length - 1].y)}`).join('; ');
    return `<figure class="chart" data-chart="${id}"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(label)}" preserveAspectRatio="xMidYMid meet">${g}<line class="guide" y1="${m.t}" y2="${H - m.b}" x1="-10" x2="-10"/></svg><div class="tooltip" hidden></div>${series.length > 1 ? legend(series) : ''}</figure>`;
  }

  /* grouped bars. cats:[labels], series:[{name,data:[values]}] */
  function bar(o) {
    const W = 640, H = o.h || 260, m = { l: 62, r: 14, t: 12, b: 40 };
    const cats = o.cats || [], series = o.series || [];
    if (!cats.length) return '<p class="muted">Nothing to chart yet.</p>';
    const vals = series.flatMap((s) => s.data);
    const ticks = niceTicks(Math.min(0, ...vals), Math.max(0, ...vals));
    const ymin = ticks[0], ymax = ticks[ticks.length - 1];
    const Y = (y) => H - m.b - ((y - ymin) / (ymax - ymin || 1)) * (H - m.t - m.b);
    const bw = (W - m.l - m.r) / cats.length, yf = fmtY(o.yfmt);
    let g = ticks.map((t) => `<line class="grid" x1="${m.l}" x2="${W - m.r}" y1="${Y(t)}" y2="${Y(t)}"/><text class="ax" x="${m.l - 8}" y="${Y(t) + 4}" text-anchor="end">${yf(t)}</text>`).join('');
    cats.forEach((c, i) => {
      const gw = bw * 0.7, w = gw / series.length;
      series.forEach((s, k) => {
        const v = s.data[i], x = m.l + i * bw + (bw - gw) / 2 + k * w, y0 = Y(0), y1 = Y(v);
        g += `<rect class="bar" x="${x.toFixed(1)}" y="${Math.min(y0, y1).toFixed(1)}" width="${(w - 3).toFixed(1)}" height="${Math.max(1, Math.abs(y0 - y1)).toFixed(1)}" rx="3" fill="${s.color || PALETTE[k % PALETTE.length]}"/>`;
      });
      g += `<text class="ax" x="${m.l + i * bw + bw / 2}" y="${H - 16}" text-anchor="middle">${esc(c)}</text>`;
    });
    const id = 'c' + ++seq;
    registry[id] = { kind: 'bar', W, H, m, cats, series, bw, yf: fullY(o.yfmt), colors: series.map((s, i) => s.color || PALETTE[i % PALETTE.length]) };
    const label = (o.title || 'Bar chart') + ': ' + cats.map((c, i) => `${c}: ` + series.map((s) => `${s.name} ${fullY(o.yfmt)(s.data[i])}`).join(', ')).join('; ');
    return `<figure class="chart" data-chart="${id}"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(label)}">${g}</svg><div class="tooltip" hidden></div>${series.length > 1 ? legend(series) : ''}</figure>`;
  }

  /* donut. items:[{name,value}] */
  function donut(o) {
    const items = (o.items || []).filter((i) => i.value > 0), total = items.reduce((a, i) => a + i.value, 0);
    if (!total) return '<p class="muted">Add some entries to see the breakdown.</p>';
    const R = 70, r = 44, cx = 90, cy = 90; let a0 = -Math.PI / 2, paths = '';
    items.forEach((it, i) => {
      const frac = it.value / total, a1 = a0 + Math.min(frac, 0.9999) * 2 * Math.PI, large = frac > 0.5 ? 1 : 0;
      const p = (rad, a) => [cx + rad * Math.cos(a), cy + rad * Math.sin(a)].map((v) => v.toFixed(2));
      const [x0, y0] = p(R, a0), [x1, y1] = p(R, a1), [x2, y2] = p(r, a1), [x3, y3] = p(r, a0);
      paths += `<path d="M${x0} ${y0}A${R} ${R} 0 ${large} 1 ${x1} ${y1}L${x2} ${y2}A${r} ${r} 0 ${large} 0 ${x3} ${y3}Z" fill="${PALETTE[i % PALETTE.length]}"><title>${esc(it.name)}: ${FOS.fmt.inr(it.value)} (${(frac * 100).toFixed(1)}%)</title></path>`;
      a0 = a1;
    });
    const label = (o.title || 'Breakdown') + ': ' + items.map((i) => `${i.name} ${(i.value / total * 100).toFixed(0)}%`).join(', ');
    return `<div class="donut"><svg viewBox="0 0 180 180" role="img" aria-label="${esc(label)}">${paths}<text x="90" y="86" text-anchor="middle" class="dn-l">Total</text><text x="90" y="104" text-anchor="middle" class="dn-v">${FOS.fmt.short(total)}</text></svg>
      <ul class="legend col">${items.map((it, i) => `<li><i style="background:${PALETTE[i % PALETTE.length]}"></i><span>${esc(it.name)}</span><b>${FOS.fmt.inr(it.value)}</b><em>${(it.value / total * 100).toFixed(1)}%</em></li>`).join('')}</ul></div>`;
  }

  function progress(pct, label) {
    const p = Math.max(0, Math.min(100, Number.isFinite(pct) ? pct : 0));
    return `<div class="progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${p.toFixed(0)}" aria-label="${esc(label || 'Progress')}"><span style="width:${p}%"></span></div>`;
  }

  /* hover handling (delegated) */
  function onMove(e) {
    const fig = e.target.closest && e.target.closest('.chart[data-chart]'); if (!fig) return;
    const c = registry[fig.dataset.chart]; if (!c) return;
    const svg = fig.querySelector('svg'), tip = fig.querySelector('.tooltip'), rect = svg.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * c.W; let html = '', gx = -10;
    if (c.kind === 'line') {
      const first = c.series[0].data; let best = 0, bd = 1e18;
      first.forEach((p, i) => { const d = Math.abs(c.X(p.x) - px); if (d < bd) { bd = d; best = i; } });
      const x = first[best].x; gx = c.X(x);
      html = `<b>${esc(c.xLabel)} ${esc(c.xf(x))}</b>` + c.series.map((s, k) => { const p = s.data.find((q) => q.x === x) || s.data[Math.min(best, s.data.length - 1)]; return `<div><i style="background:${c.colors[k]}"></i>${esc(s.name)}: <b>${c.yf(p.y)}</b></div>`; }).join('');
      fig.querySelector('.guide').setAttribute('x1', gx), fig.querySelector('.guide').setAttribute('x2', gx);
    } else {
      const i = Math.max(0, Math.min(c.cats.length - 1, Math.floor((px - c.m.l) / c.bw)));
      html = `<b>${esc(c.cats[i])}</b>` + c.series.map((s, k) => `<div><i style="background:${c.colors[k]}"></i>${esc(s.name)}: <b>${c.yf(s.data[i])}</b></div>`).join('');
    }
    tip.innerHTML = html; tip.hidden = false;
    const fr = fig.getBoundingClientRect(); let left = e.clientX - fr.left + 14; if (left > fr.width - 190) left = e.clientX - fr.left - 190;
    tip.style.left = Math.max(4, left) + 'px'; tip.style.top = '10px';
  }
  function onLeave(e) { const fig = e.target.closest && e.target.closest('.chart[data-chart]'); if (fig) { fig.querySelector('.tooltip').hidden = true; const g = fig.querySelector('.guide'); if (g) { g.setAttribute('x1', -10); g.setAttribute('x2', -10); } } }
  document.addEventListener('pointermove', onMove);
  document.addEventListener('pointerout', (e) => { if (e.target.closest && e.target.closest('.chart') && !(e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest('.chart'))) onLeave(e); });

  FOS.charts = { line, bar, donut, progress, PALETTE };
})();
