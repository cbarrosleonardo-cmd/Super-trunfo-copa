// Troque a versão sempre que atualizar o index.html, para o celular baixar a nova.
const VERSION = "stc-v4";
const FILES = ["./", "./index.html", "./manifest.webmanifest", "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== VERSION && k !== "fonts").map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET") return;
  // Fontes do Google: guarda na primeira vez e usa offline depois.
  if (url.hostname.includes("fonts.googleapis.com") || url.hostname.includes("fonts.gstatic.com")) {
    e.respondWith(caches.open("fonts").then(c => c.match(e.request).then(hit => hit || fetch(e.request).then(r => { c.put(e.request, r.clone()); return r; }))));
    return;
  }
  // Arquivos do jogo: tenta a rede (para pegar atualizações) e cai no cache se estiver offline.
  e.respondWith(
    fetch(e.request).then(r => { const copy = r.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); return r; })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then(hit => hit || caches.match("./index.html")))
  );
});
