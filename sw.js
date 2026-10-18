/* Finance OS service worker — installable + offline + fast.
   Strategy: stale-while-revalidate. A saved copy is served instantly (so the app opens fast, even on a weak
   connection), and a fresh copy is fetched in the background for next time. Only same-origin GET requests are
   handled; Google sign-in / Drive calls are never touched.
   Every file is cached on its OWN: one missing or slow file can never stop the app from installing for offline use.
   WHEN YOU PUBLISH A NEW VERSION: change VERSION below (fos-v7, fos-v8, …). That makes every device download the
   complete new set of files together and drop the old ones, so no one ever mixes old and new files.
   (tests/logic.js checks that this list matches the scripts and styles that index.html loads.) */
const VERSION = 'fos-v7';
const CORE = [
  './',
  'index.html',
  'manifest.webmanifest',
  'icons/touch-icon.png',
  'icons/favicon-32.png',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/icon-maskable-512.png',
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
  'js/calc-more.js',
  'js/decision.js',
  'js/dashboard.js',
  'js/life.js',
  'js/playbook.js',
  'js/sources.js',
  'js/adviser.js',
  'js/statement.js',
  'js/banks.js',
  'js/jargon.js',
  'js/guides.js',
  'js/guides-1.js',
  'js/guides-2.js',
  'js/guides-3.js',
  'js/guides-4.js',
  'js/guides-5.js',
  'js/guides-6.js',
  'js/guides-7.js',
  'js/guides-8.js',
  'js/content-2.js',
  'js/lessons-a.js',
  'js/lessons-b.js',
  'js/lessons-c.js',
  'js/curriculum.js',
  'js/sync.js',
  'js/about.js',
  'js/examples.js',
  'js/calc-more-help.js',
  'js/help.js',
  'js/gate.js',
  'js/search.js',
  'js/app.js'
];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(VERSION).then((c) => Promise.all(CORE.map((u) => c.add(u).catch(() => null)))).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', (e) => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== self.location.origin) return;
  e.respondWith(caches.open(VERSION).then((cache) => cache.match(r, { ignoreSearch: true }).then((hit) => {
    const fresh = fetch(r).then((res) => { if (res && res.ok) cache.put(r, res.clone()); return res; }).catch(() => hit || cache.match('index.html'));
    return hit || fresh;
  })));
});
