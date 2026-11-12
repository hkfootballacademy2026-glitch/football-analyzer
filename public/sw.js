const CACHE='football-analyzer-v4-install';
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(c=>c.addAll(['/','/icon.svg','/icon-192.png','/icon-512.png','/apple-touch-icon.png','/app-qr.png','/manifest.webmanifest'])));self.skipWaiting()});
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('football-analyzer-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{if(event.request.method!=='GET'||new URL(event.request.url).origin!==location.origin)return;event.respondWith(fetch(event.request).then(res=>{if(res.ok){const clone=res.clone();caches.open(CACHE).then(c=>c.put(event.request,clone))}return res}).catch(()=>caches.match(event.request).then(hit=>hit||(event.request.mode==='navigate'?caches.match('/'):Response.error()))))});

