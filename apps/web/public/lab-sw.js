const PREFIX = 'marketlab-snapshot-';
const CACHE = `${PREFIX}v1`;
const PATH = '/api/lab/snapshot';
self.addEventListener('install', (event) => event.waitUntil(self.skipWaiting()));
self.addEventListener('activate', (event) =>
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names.filter((name) => name.startsWith(PREFIX) && name !== CACHE).map((name) => caches.delete(name)),
      );
      await self.clients.claim();
    })(),
  ),
);
function validSnapshot(data) {
  return (
    data &&
    typeof data === 'object' &&
    Number.isInteger(data.revision) &&
    typeof data.capturedAt === 'string' &&
    Number.isFinite(Date.parse(data.capturedAt)) &&
    Array.isArray(data.assets) &&
    data.assets.every(
      (asset) =>
        asset && typeof asset.symbol === 'string' && typeof asset.price === 'number' && Number.isFinite(asset.price),
    )
  );
}
function labeled(response, source) {
  const headers = new Headers(response.headers);
  headers.set('X-Lab-Source', source);
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers });
}
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  if (
    event.request.method !== 'GET' ||
    url.origin !== self.location.origin ||
    url.pathname !== PATH ||
    url.search !== '?mode=optimized'
  )
    return;
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 4000);
      try {
        const response = await fetch(event.request, { signal: controller.signal, cache: 'no-store' });
        if (!response.ok || !validSnapshot(await response.clone().json())) throw new Error('Snapshot unavailable');
        try {
          await cache.put(event.request, response.clone());
        } catch {
          /* The online response remains usable. */
        }
        return labeled(response, 'network');
      } catch {
        const saved = await cache.match(event.request);
        if (saved) return labeled(saved, 'saved');
        return new Response(JSON.stringify({ error: 'Snapshot unavailable' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        });
      } finally {
        clearTimeout(timer);
      }
    })(),
  );
});
