// Service Worker — SIMRS Terpadu
// Strategi: cache-first untuk app shell, supaya aplikasi tetap bisa dibuka offline.
// Data pasien/kunjungan/transaksi tersimpan di localStorage milik browser (per perangkat),
// bukan lewat service worker ini.
//
// PENTING: SW_VERSION harus dinaikkan setiap kali app.js/style.css/qrcode.lib.js berubah,
// supaya browser tahu ada versi baru dan mengambil file segar (bukan memakai cache lama selamanya).
const SW_VERSION = 'v3';
const CACHE_NAME = 'simrs-terpadu-' + SW_VERSION;
const APP_SHELL = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './qrcode.lib.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-512-maskable.png',
  './apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchAndUpdate = fetch(event.request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => cached || caches.match('./index.html'));
      // Jaga service worker tetap hidup sampai pembaruan cache di latar belakang selesai,
      // supaya kunjungan BERIKUTNYA mendapat file yang sudah segar (bukan macet di cache lama).
      event.waitUntil(fetchAndUpdate.catch(() => {}));
      return cached || fetchAndUpdate;
    })
  );
});
