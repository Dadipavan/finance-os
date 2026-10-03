/* Finance OS service worker — makes the app installable and usable offline.
   Strategy: network-first (so a newly published version always arrives when online),
   falling back to the saved copy when offline. Only same-origin files are handled;
   Google sign-in / Drive calls are never touched. Change VERSION to force a clean cache. */
const VERSION = 'fos-v1';
const CORE = [
  './',
  'index.html',
  'manifest.webmanifest',
  'icons/apple-touch-icon.png',
  'icons/favicon-32.png',
  'css/style.css',
  'css/components.css',
  'css/responsive.css',
  'js/data.js',
  'js/calculations.js',
  'js/storage.js',
  'js/ui.js',
  'js/charts.js',
  'js/content.js',
  'js/loans.js',
  'js/investments.js',
  'js/goals.js',
  'js/budget.js',
  'js/taxes.js',
  'js/insurance.js',
  'js/scenarios.js',
  'js/decision.js',
  'js/dashboard.js',
  'js/life.js',
  'js/playbook.js',
  'js/sources.js',
  'js/adviser.js',
  'js/statement.js',
  'js/sync.js',
  'js/about.js',
  'js/examples.js',
  'js/help.js',
  'js/gate.js',
  'js/search.js',
  'js/app.js',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-512.png'
];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(VERSION).then((c) => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== self.location.origin) return;
  e.respondWith(fetch(r).then((res) => { if (res && res.ok) { const copy = res.clone(); caches.open(VERSION).then((c) => c.put(r, copy)); } return res; }).catch(() => caches.match(r, { ignoreSearch: true }).then((hit) => hit || caches.match('index.html'))));
});
