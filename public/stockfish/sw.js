/* Stockfish asset cache — keeps the large full engine on disk between visits.
 * Scope: /stockfish/ (register with { scope: '/stockfish/' })
 */
const CACHE_NAME = 'oggyp-stockfish-19'

self.addEventListener('install', (event) => {
  // Activate immediately so the next stockfish fetch can hit this worker.
  event.waitUntil(self.skipWaiting())
})

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys()
    await Promise.all(
      keys
        .filter((key) => key.startsWith('oggyp-stockfish-') && key !== CACHE_NAME)
        .map((key) => caches.delete(key))
    )
    await self.clients.claim()
  })())
})

function isStockfishAsset(url) {
  return url.origin === self.location.origin
    && url.pathname.startsWith('/stockfish/')
    && (url.pathname.endsWith('.js') || url.pathname.endsWith('.wasm'))
}

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)
  if (event.request.method !== 'GET' || !isStockfishAsset(url))
    return

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME)
    const cached = await cache.match(event.request)
    if (cached)
      return cached

    const response = await fetch(event.request)
    if (response.ok) {
      // Clone before the engine consumes the body (including streaming reads).
      try {
        await cache.put(event.request, response.clone())
      } catch (err) {
        // Quota or opaque failures — still return the network response.
        console.warn('[stockfish-sw] cache put failed', err)
      }
    }
    return response
  })())
})
