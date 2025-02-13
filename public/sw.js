
// Version du cache
const CACHE_NAME = 'love-hotel-cache-v2';
const CURRENT_VERSION = '1.0.195'; // Synchronisé avec versionDb.ts

// Liste des ressources à mettre en cache
const CACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/icon-192.png',
  '/icon-512.png'
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installation...');
  event.waitUntil(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        console.log('[Service Worker] Mise en cache globale');
        
        // Vérifie chaque ressource individuellement
        for (const asset of CACHE_ASSETS) {
          try {
            const response = await fetch(asset);
            if (response.ok) {
              await cache.put(asset, response);
              console.log(`[Service Worker] Ressource mise en cache avec succès: ${asset}`);
            } else {
              console.warn(`[Service Worker] Échec de mise en cache pour: ${asset}`);
            }
          } catch (error) {
            console.error(`[Service Worker] Erreur lors de la mise en cache de ${asset}:`, error);
          }
        }
      } catch (error) {
        console.error('[Service Worker] Erreur lors de l\'installation:', error);
      }
    })()
  );
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activation...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Suppression de l\'ancien cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interception des requêtes
self.addEventListener('fetch', (event) => {
  event.respondWith(
    (async () => {
      try {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(event.request);
        
        if (cachedResponse) {
          console.log('[Service Worker] Utilisation du cache pour:', event.request.url);
          return cachedResponse;
        }

        console.log('[Service Worker] Récupération depuis le réseau pour:', event.request.url);
        const networkResponse = await fetch(event.request);
        
        // Met en cache uniquement les ressources statiques
        if (event.request.method === 'GET' && 
            (event.request.url.endsWith('.js') || 
             event.request.url.endsWith('.css') ||
             event.request.url.endsWith('.png') ||
             event.request.url.endsWith('.ico') ||
             event.request.url.endsWith('.json'))) {
          await cache.put(event.request, networkResponse.clone());
        }
        
        return networkResponse;
      } catch (error) {
        console.error('[Service Worker] Erreur lors de la récupération:', error);
        throw error;
      }
    })()
  );
});

// Gestion des mises à jour
self.addEventListener('message', (event) => {
  if (event.data === 'skipWaiting') {
    console.log('[Service Worker] Skip waiting...');
    self.skipWaiting();
  }
});

// Vérification des mises à jour
setInterval(() => {
  console.log('[Service Worker] Vérification des mises à jour...');
  self.registration.update();
}, 60 * 60 * 1000); // Vérifie toutes les heures

