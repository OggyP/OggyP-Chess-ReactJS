import iOS from './isIOS'
import {
    resolveStockfish,
    StockfishTier,
    StockfishVariant,
} from './stockfishPaths'

export const STOCKFISH_CACHE_NAME = 'oggyp-stockfish-19'

const FULL_ASSETS: Record<'full' | 'full-single', string[]> = {
    full: [
        '/stockfish/full/stockfish.js',
        '/stockfish/full/stockfish.wasm',
    ],
    'full-single': [
        '/stockfish/full-single/stockfish.js',
        '/stockfish/full-single/stockfish.wasm',
    ],
}

let registrationPromise: Promise<ServiceWorkerRegistration | null> | null = null

function fullAssetsForCurrentDevice(): { variant: StockfishVariant; paths: string[] } {
    const resolved = resolveStockfish('full' as StockfishTier, iOS())
    if (resolved.variant === 'full' || resolved.variant === 'full-single') {
        return { variant: resolved.variant, paths: FULL_ASSETS[resolved.variant] }
    }
    return { variant: resolved.variant, paths: [] }
}

/** Register the Stockfish service worker (idempotent). */
function ensureStockfishServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator))
        return Promise.resolve(null)

    if (!registrationPromise) {
        registrationPromise = navigator.serviceWorker
            .register('/stockfish/sw.js', { scope: '/stockfish/' })
            .then(async (reg) => {
                await navigator.serviceWorker.ready
                return reg
            })
            .catch((err) => {
                console.warn('[stockfish] service worker registration failed', err)
                registrationPromise = null
                return null
            })
    }
    return registrationPromise
}

async function arePathsCached(paths: string[]): Promise<boolean> {
    if (!paths.length || typeof caches === 'undefined')
        return false
    try {
        const cache = await caches.open(STOCKFISH_CACHE_NAME)
        const results = await Promise.all(paths.map((path) => cache.match(path)))
        return results.every(Boolean)
    } catch {
        return false
    }
}

/** True if the full engine for this device is already in Cache Storage. */
async function isFullStockfishCached(): Promise<boolean> {
    const { paths } = fullAssetsForCurrentDevice()
    return arePathsCached(paths)
}

/**
 * Ensure the SW is controlling /stockfish/ and report whether the full
 * engine is already cached (so the UI can skip "downloading" messaging).
 */
async function prepareFullStockfishCache(): Promise<{ cached: boolean }> {
    await ensureStockfishServiceWorker()
    const cached = await isFullStockfishCached()
    return { cached }
}

export {
    ensureStockfishServiceWorker,
    isFullStockfishCached,
    prepareFullStockfishCache,
    fullAssetsForCurrentDevice,
}
