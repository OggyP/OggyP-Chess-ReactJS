/* Legacy stub — stockfish service worker caching was removed.
 * Stream-caching the WASM produced empty/corrupt entries and broke loads.
 * Repeat visits now rely on normal browser HTTP caching (immutable headers).
 */
self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting())
})

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys()
    await Promise.all(
      keys
        .filter((key) => key.startsWith('oggyp-stockfish-'))
        .map((key) => caches.delete(key))
    )
    await self.registration.unregister()
  })())
})
