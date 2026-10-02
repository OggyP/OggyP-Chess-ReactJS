import iOS from './isIOS'
import {
    resolveStockfish,
    StockfishTier,
    StockfishVariant,
} from './stockfishPaths'

/**
 * Stockfish caching strategy:
 * - Long-lived Cache-Control headers on /stockfish/* (see next.config.mjs)
 * - No service worker: SW stream-caching caused empty WASM bodies and hung loads
 * - On startup we unregister any old stockfish SWs left from earlier attempts
 */

let cleanupPromise: Promise<void> | null = null

function fullWasmPathForCurrentDevice(): string | null {
    const resolved = resolveStockfish('full' as StockfishTier, iOS())
    if (resolved.variant === 'full')
        return '/stockfish/full/stockfish.wasm'
    if (resolved.variant === 'full-single')
        return '/stockfish/full-single/stockfish.wasm'
    return null
}

/** Remove broken stockfish service workers / caches from earlier implementations. */
function cleanupLegacyStockfishServiceWorkers(): Promise<void> {
    if (typeof window === 'undefined')
        return Promise.resolve()
    if (!cleanupPromise) {
        cleanupPromise = (async () => {
            try {
                if ('serviceWorker' in navigator) {
                    const regs = await navigator.serviceWorker.getRegistrations()
                    await Promise.all(
                        regs
                            .filter((reg) => {
                                const url = reg.active?.scriptURL || reg.installing?.scriptURL || reg.waiting?.scriptURL || ''
                                return url.includes('/stockfish/')
                            })
                            .map((reg) => reg.unregister())
                    )
                }
                if (typeof caches !== 'undefined') {
                    const keys = await caches.keys()
                    await Promise.all(
                        keys
                            .filter((key) => key.startsWith('oggyp-stockfish-'))
                            .map((key) => caches.delete(key))
                    )
                }
            } catch (err) {
                console.warn('[stockfish] legacy SW cleanup failed', err)
            }
        })()
    }
    return cleanupPromise
}

/**
 * Prepare for full-engine load: clear legacy SW so it can't serve empty WASM,
 * then let the engine worker fetch the file (browser HTTP cache keeps it after).
 */
async function prepareFullStockfishCache(
    _onProgress?: (percent: number) => void
): Promise<{ cached: boolean }> {
    await cleanupLegacyStockfishServiceWorkers()

    // Best-effort: if the browser already has the wasm in HTTP cache, a HEAD
    // (or quick GET of 0 bytes via range) isn't reliable cross-browser, so we
    // just report "not pre-cached" and show worker download progress instead.
    return { cached: false }
}

async function isFullStockfishCached(): Promise<boolean> {
    return false
}

export {
    cleanupLegacyStockfishServiceWorkers,
    prepareFullStockfishCache,
    isFullStockfishCached,
    fullWasmPathForCurrentDevice,
}

// Keep type-only re-export surface quiet for unused variant helper
export type { StockfishVariant }
