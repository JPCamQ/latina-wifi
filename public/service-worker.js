const CACHE_NAME = 'latina-wifi-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/soporte',
  '/soporte/renovar',
  '/portal',
  '/noticias',
  '/images/logo.png',
  'https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap'
];

// Instalar Service Worker y guardar en caché archivos clave
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activar Service Worker y limpiar cachés antiguos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Interceptor de peticiones: Red primero, con caída en caché (Network-first)
self.addEventListener('fetch', (event) => {
  // Solo manejar peticiones GET
  if (event.request.method !== 'GET') return;
  
  // No cachear llamadas a la API
  if (event.request.url.includes('/api/')) {
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Clonar y guardar en caché si la respuesta es exitosa
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // En caso de estar desconectado, retornar desde la caché
        return caches.match(event.request);
      })
  );
});

// Escuchar notificaciones Push enviadas desde el servidor
self.addEventListener('push', (event) => {
  let data = { titulo: 'Latina WiFi', contenido: 'Nueva actualización del servicio disponible.', url: '/' };
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { titulo: 'Latina WiFi', contenido: event.data.text(), url: '/' };
    }
  }

  const options = {
    body: data.contenido,
    icon: '/images/logo.png',
    badge: '/images/logo.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.titulo, options)
  );
});

// Escuchar click en la notificación
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      const targetUrl = event.notification.data.url || '/';
      
      // Enfocar ventana si ya está abierta, de lo contrario abrir una nueva
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
