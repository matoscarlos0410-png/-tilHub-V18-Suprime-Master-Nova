/* =========================================================
   ÚTILHUB V18 — NOVA FLOW
   Service Worker
   ========================================================= */

const CACHE_NAME = "utilhub-v18-nova-flow-v1";

const APP_FILES = [
  "./",
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.webmanifest"
];

/* ---------------------------------------------------------
   INSTALACIÓN
   --------------------------------------------------------- */

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_FILES))
      .then(() => self.skipWaiting())
      .catch(error => {
        console.warn("ÚtilHub SW: error durante instalación:", error);
      })
  );
});

/* ---------------------------------------------------------
   ACTIVACIÓN
   Elimina versiones antiguas del caché
   --------------------------------------------------------- */

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

/* ---------------------------------------------------------
   PETICIONES
   - Archivos propios: caché primero
   - APIs externas: red
   - Si no hay internet: intenta caché
   --------------------------------------------------------- */

self.addEventListener("fetch", event => {
  const request = event.request;

  // Solo manejar GET
  if (request.method !== "GET") return;

  const url = new URL(request.url);

  // No interceptar APIs externas
  if (url.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(request)
          .then(networkResponse => {
            // Guardar únicamente respuestas válidas
            if (
              networkResponse &&
              networkResponse.status === 200 &&
              networkResponse.type === "basic"
            ) {
              const copy = networkResponse.clone();

              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(request, copy);
                });
            }

            return networkResponse;
          })
          .catch(() => {
            // Si solicitan una página y no hay internet,
            // mostrar index.html
            if (request.mode === "navigate") {
              return caches.match("./index.html");
            }

            return new Response(
              "Contenido no disponible sin conexión.",
              {
                status: 503,
                statusText: "Offline",
                headers: {
                  "Content-Type": "text/plain; charset=utf-8"
                }
              }
            );
          });
      })
  );
});

/* ---------------------------------------------------------
   MENSAJES DESDE ÚTILHUB
   --------------------------------------------------------- */

self.addEventListener("message", event => {
  if (!event.data) return;

  // Activar inmediatamente una nueva versión
  if (event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }

  // Limpiar completamente el caché
  if (event.data.type === "CLEAR_CACHE") {
    caches.keys()
      .then(keys =>
        Promise.all(
          keys.map(key => caches.delete(key))
        )
      )
      .then(() => {
        console.log("ÚtilHub: caché eliminado.");
      });
  }
});

/* ---------------------------------------------------------
   FIN — ÚTILHUB V18
   --------------------------------------------------------- */
