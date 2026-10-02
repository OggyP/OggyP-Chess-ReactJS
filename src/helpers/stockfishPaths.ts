export type StockfishTier = 'lite' | 'full'
export type StockfishVariant = 'full' | 'full-single' | 'lite' | 'lite-single' | 'asm'

const PREFER_FULL_KEY = 'preferFullStockfish'

function wasmSupported(): boolean {
    return typeof WebAssembly === 'object'
        && WebAssembly.validate(Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00))
}

function canUseThreads(isIOS: boolean): boolean {
    return typeof SharedArrayBuffer !== 'undefined' && !isIOS
}

function getPreferFullStockfish(): boolean {
    try {
        return localStorage.getItem(PREFER_FULL_KEY) === 'true'
    } catch {
        return false
    }
}

function setPreferFullStockfish(enabled: boolean) {
    try {
        localStorage.setItem(PREFER_FULL_KEY, enabled ? 'true' : 'false')
    } catch {
        // ignore quota / private mode
    }
}

function resolveStockfish(tier: StockfishTier, isIOS: boolean): { path: string; variant: StockfishVariant; label: string } {
    if (tier === 'full') {
        if (canUseThreads(isIOS)) {
            return {
                path: '/stockfish/full/stockfish.js',
                variant: 'full',
                label: 'Stockfish 19 Full',
            }
        }
        if (wasmSupported()) {
            return {
                path: '/stockfish/full-single/stockfish.js',
                variant: 'full-single',
                label: 'Stockfish 19 Full',
            }
        }
        return {
            path: '/badStockfish/stockfish-asm.js',
            variant: 'asm',
            label: 'Stockfish 19 ASM',
        }
    }

    if (canUseThreads(isIOS)) {
        return {
            path: '/stockfish/stockfish.js',
            variant: 'lite',
            label: 'Stockfish 19 Lite',
        }
    }
    if (wasmSupported()) {
        return {
            path: '/badStockfish/stockfish.js',
            variant: 'lite-single',
            label: 'Stockfish 19 Lite',
        }
    }
    return {
        path: '/badStockfish/stockfish-asm.js',
        variant: 'asm',
        label: 'Stockfish 19 ASM',
    }
}

function isFullVariant(variant: StockfishVariant): boolean {
    return variant === 'full' || variant === 'full-single'
}

export {
    PREFER_FULL_KEY,
    getPreferFullStockfish,
    setPreferFullStockfish,
    resolveStockfish,
    canUseThreads,
    wasmSupported,
    isFullVariant,
}
