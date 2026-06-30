const CACHE_NAME = 'navegue-v2'; // Mudámos a versão para forçar a atualização do telemóvel

self.addEventListener('install', event => {
  self.skipWaiting(); // Força a instalação imediata do novo motor
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(['./', './index.html', './manifest.json']);
    })
  );
});

self.addEventListener('activate', event => {
  // Limpa o lixo (cache antigo) que estava a esconder a barra de pesquisa
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  // Nova Regra: Tenta carregar sempre a versão mais recente da internet primeiro.
  // Se estiver sem internet (offline), aí sim ele usa a versão guardada.
  event.respondWith(
    fetch(event.request)
      .then(response => {
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
