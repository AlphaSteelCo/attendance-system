/* Service Worker — سیستەمی ئامادەبوونی کارمەندان
   ئەرک: کاشکردنی فایلە سەرەکییەکانی ئەپەکە بۆ ئەوەی بەبێ ئینتەرنێت بکرێتەوە.
   تێبینی: ئەم فایلە تەنها فایلەکانی خودی ئەپ کاش دەکات (HTML/CSS/JS ناوخۆیی).
   داتای کارمەندان و ئامادەبوون خۆی لە IndexedDB/SQLite ناوخۆیی ئەپەکەدا هەڵدەگیرێت
   و کاتێک ئینتەرنێت هەبێت خۆکارانە لەگەڵ Supabase هاوکات دەبێتەوە (لە index.html دا). */

const CACHE_NAME = 'attendance-app-v2';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // هەریەکە بە تەنها کاش بکە، ئەگەر فایلێک نەدۆزرایەوە هەڵە مەدە هەموو ئینستۆڵکردنەکە
      return Promise.all(
        APP_SHELL.map((url) =>
          cache.add(url).catch((err) => console.warn('cache add failed:', url, err))
        )
      );
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  // تەنها داواکارییەکانی هەمان سایت کاش بکە (نەک داواکارییەکانی Supabase API)
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  const isAppPage = req.mode === 'navigate' || req.destination === 'document' ||
    url.pathname.endsWith('/') || url.pathname.endsWith('index.html');

  if (isAppPage) {
    // تۆڕ-یەکەم: هەمیشە هەوڵ بدە نوێترین وەشان بهێنیت، تەنها کاتێک ئۆفلاینیت کاشەکە بەکاربهێنە
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const resClone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
          }
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }

  // فایلە جێگیرەکان (ئایکۆن، مانیفێست): کاش-یەکەم، لەگەڵ تازەکردنەوەی کاشی لە پشتەوە
  event.respondWith(
    caches.match(req).then((cached) => {
      const networkFetch = fetch(req)
        .then((res) => {
          if (res && res.ok) {
            const resClone = res.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
          }
          return res;
        })
        .catch(() => cached);
      return cached || networkFetch;
    })
  );
});
