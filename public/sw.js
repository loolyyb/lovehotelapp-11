// Version du cache
const CACHE_NAME = 'love-hotel-cache-v2';
const CURRENT_VERSION = '1.0.195'; // Synchronisé avec versionDb.ts

// Liste des ressources statiques à mettre en cache
const STATIC_ASSETS = [
  '/.htaccess',
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
        console.log('[Service Worker] Mise en cache des ressources statiques');
        
        for (const asset of STATIC_ASSETS) {
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
        // Ne pas mettre en cache les requêtes non GET
        if (event.request.method !== 'GET') {
          return fetch(event.request);
        }

        const url = new URL(event.request.url);
        
        // Pour les fichiers JS, toujours aller chercher la dernière version
        if (url.pathname.endsWith('.js')) {
          try {
            console.log('[Service Worker] Récupération du fichier JS depuis le réseau:', url.pathname);
            const response = await fetch(event.request);
            if (!response || response.status !== 200) {
              throw new Error('Fichier JS non trouvé');
            }
            return response;
          } catch (error) {
            console.error('[Service Worker] Erreur lors de la récupération du fichier JS:', error);
            // En cas d'erreur, essayer de retourner la version en cache
            const cache = await caches.open(CACHE_NAME);
            const cachedResponse = await cache.match(event.request);
            if (cachedResponse) {
              return cachedResponse;
            }
            throw error;
          }
        }

        // Pour les autres ressources, vérifier d'abord le cache
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(event.request);
        
        if (cachedResponse) {
          console.log('[Service Worker] Utilisation du cache pour:', event.request.url);
          return cachedResponse;
        }

        // Si pas en cache, récupérer depuis le réseau
        console.log('[Service Worker] Récupération depuis le réseau pour:', event.request.url);
        const networkResponse = await fetch(event.request);
        
        // Mettre en cache uniquement les ressources statiques
        if (STATIC_ASSETS.includes(url.pathname) || 
            url.pathname.endsWith('.css') ||
            url.pathname.endsWith('.png') ||
            url.pathname.endsWith('.ico') ||
            url.pathname.endsWith('.json')) {
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

// Gérer les événements push
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    
    event.waitUntil(
      self.registration.showNotification(data.title, {
        body: data.body,
        icon: data.icon,
        data: data.data,
      })
    );
  } catch (error) {
    console.error('[Service Worker] Erreur lors du traitement de la notification push:', error);
  }
});

// Gérer les clics sur les notifications
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.notification.data?.url) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
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
