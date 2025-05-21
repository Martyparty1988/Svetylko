const CACHE_NAME = 'svetylko-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
  // Přidejte další soubory, které chcete cachovat
];

// Instalace service workeru
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

// Aktivace service workeru
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Zachycení fetch požadavků
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - vrátit odpověď z cache
        if (response) {
          return response;
        }

        // Pokud není v cache, stáhneme z internetu
        return fetch(event.request)
          .then(response => {
            // Ujistíme se, že máme validní odpověď
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Klonujeme odpověď, protože tělo odpovědi je stream, který může být použit pouze jednou
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          });
      })
  );
});
