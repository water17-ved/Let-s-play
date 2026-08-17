/* ============================================================
   JEE Battle Arena — Service Worker
   Caches all assets for offline play
   ============================================================ */

const CACHE_NAME  = 'jba-v1.3';
const STATIC_URLS = [
    '/',
    '/index.html',
    '/app.js',
    '/manifest.json',
    '/icon.svg',
    'https://cdn.tailwindcss.com',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-solid-900.woff2',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/webfonts/fa-regular-400.woff2',
];

// ── Install: pre-cache static shell ──────────────────────────
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('[SW] Pre-caching assets');
            return cache.addAll(STATIC_URLS).catch(err => {
                console.warn('[SW] Pre-cache partial failure (ok for CDN):', err);
            });
        }).then(() => self.skipWaiting())
    );
});

// ── Activate: clean old caches ────────────────────────────────
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => {
                console.log('[SW] Deleting old cache:', k);
                return caches.delete(k);
            }))
        ).then(() => self.clients.claim())
    );
});

// ── Fetch: cache-first for static, network-first for Firebase ─
self.addEventListener('fetch', event => {
    const url = event.request.url;

    // Pass Firebase / Firestore requests straight through
    if (url.includes('firestore.googleapis.com') ||
        url.includes('firebase') ||
        url.includes('googleapis.com')) {
        return;
    }

    // Network-first for navigation
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .then(res => {
                    const clone = res.clone();
                    caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
                    return res;
                })
                .catch(() => caches.match('/index.html'))
        );
        return;
    }

    // Cache-first for everything else (JS, CSS, fonts, icons)
    event.respondWith(
        caches.match(event.request).then(cached => {
            if (cached) return cached;
            return fetch(event.request).then(res => {
                if (!res || res.status !== 200 || res.type === 'opaque') return res;
                const clone = res.clone();
                caches.open(CACHE_NAME).then(c => c.put(event.request, clone));
                return res;
            }).catch(() => {
                // Fallback for offline image requests
                if (event.request.destination === 'image') return new Response('', { status: 204 });
            });
        })
    );
});
