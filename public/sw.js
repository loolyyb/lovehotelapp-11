
// Version du cache
const CACHE_NAME = 'love-hotel-cache-v2';
const CURRENT_VERSION = '1.0.195'; // Synchronisé avec versionDb.ts

// Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installation...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Mise en cache globale');
      return cache.addAll([
        '/',
        '/index.html',
        '/manifest.json',
        '/favicon.ico',
        '/icon-192.png',
        '/icon-512.png'
      ]);
    })
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
    caches.match(event.request).then((response) => {
      if (response) {
        console.log('[Service Worker] Utilisation du cache pour:', event.request.url);
        return response;
      }
      console.log('[Service Worker] Récupération depuis le réseau pour:', event.request.url);
      return fetch(event.request);
    })
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

