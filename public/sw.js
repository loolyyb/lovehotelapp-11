
// Version du cache
const CACHE_VERSION = 'v1.0.1';

// Liste des ressources à mettre en cache
const STATIC_CACHE = `static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `dynamic-${CACHE_VERSION}`;
const STATIC_FILES = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installation');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('[Service Worker] Mise en cache globale');
        return cache.addAll(STATIC_FILES);
      })
  );
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activation');
  event.waitUntil(
    caches.keys()
      .then(keyList => {
        return Promise.all(keyList.map(key => {
          if (key !== STATIC_CACHE && key !== DYNAMIC_CACHE) {
            console.log('[Service Worker] Suppression de l\'ancien cache', key);
            return caches.delete(key);
          }
        }));
      })
  );
  return self.clients.claim();
});

// Interception des requêtes
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Ne pas intercepter les requêtes suivantes
  if (url.hostname.includes('supabase.co') || // Supabase requests
      url.pathname.startsWith('/rest/') ||    // REST API
      url.pathname.includes('/auth/') ||      // Auth requests
      url.pathname.includes('/realtime/') ||  // Realtime/WebSocket
      url.searchParams.has('apikey')) {       // Supabase API key requests
    return;
  }

  event.respondWith(
    (async () => {
      try {
        // Pour les requêtes non-GET, aller directement au réseau
        if (event.request.method !== 'GET') {
          return fetch(event.request);
        }
        
        // Pour les fichiers JS, toujours aller chercher la dernière version
        if (url.pathname.endsWith('.js')) {
          const networkResponse = await fetch(event.request);
          // Mettre en cache la nouvelle version
          const cache = await caches.open(DYNAMIC_CACHE);
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        }

        // Stratégie Cache First pour les autres ressources
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }

        // Si pas en cache, aller chercher sur le réseau
        const networkResponse = await fetch(event.request);
        // Mettre en cache la réponse
        const cache = await caches.open(DYNAMIC_CACHE);
        cache.put(event.request, networkResponse.clone());
        return networkResponse;
      } catch (error) {
        console.error('[Service Worker] Erreur:', error);
        
        // Retourner la version en cache si disponible
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // Si pas de cache, retourner une erreur
        return new Response('Network error happened', {
          status: 408,
          headers: { 'Content-Type': 'text/plain' },
        });
      }
    })()
  );
});

// Message handler
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

