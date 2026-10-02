import { convertToPosition } from "./chessLogic/standard/functions";
import { Teams, Vector, PieceCodes } from "./chessLogic/types";

const debugEngine = false;

export interface UCIengineOptions {
    path: string
    initConfigCommands?: string[]
    multiPV?: number
    label?: string
    onProgress?: (percent: number) => void
    onReady?: () => void
}

class UCIengine {
    private _engine: Worker;
    private _isready: boolean;
    private _analyseFromTeam: Teams = "white";
    private _infoBuffer: any[] = []
    private _progressChannel: MessageChannel | null = null
    private _terminated = false
    multiPV: number;
    label: string
    loadedNNUE: boolean = false
    _commandsQueue: string[];

    constructor(pathOrOptions: string | UCIengineOptions, initConfigCommands: string[] = [], multiPV: number = 1) {
        const options: UCIengineOptions = typeof pathOrOptions === 'string'
            ? { path: pathOrOptions, initConfigCommands, multiPV }
            : pathOrOptions

        this.multiPV = options.multiPV ?? 1
        this.label = options.label || 'Stockfish'
        this._commandsQueue = [...(options.initConfigCommands || [])]
        this._isready = false
        this._engine = new Worker(options.path)
        this._engine.onmessage = (event) => {
            this.onMessage(event)
        }

        if (options.onProgress && typeof MessageChannel === 'function') {
            this.setupDownloadProgress(options.onProgress)
        }

        this._engine.postMessage('uci')
        this._engine.postMessage('setoption name MultiPV value ' + this.multiPV)

        if (options.onReady) {
            const previousOnReady = options.onReady
            // Fire once the first readyok arrives after startup commands flush.
            const originalQueue = this._commandsQueue.slice()
            this._commandsQueue = [
                ...originalQueue,
                'isready',
            ]
            const checkReady = () => {
                if (this._terminated) return
                previousOnReady()
            }
            // Hook via a one-shot flag after isready completes — handled in onMessage.
            ;(this as any)._onReadyOnce = checkReady
        }

        window.addEventListener('beforeunload', this._onBeforeUnload)
    }

    private _onBeforeUnload = () => {
        this.quit()
    }

    private setupDownloadProgress(onProgress: (percent: number) => void) {
        this._progressChannel = new MessageChannel()
        this._progressChannel.port1.onmessage = (ev) => {
            const data = ev.data || {}
            if (typeof data.percent === 'number') {
                onProgress(Math.max(0, Math.min(100, Math.round(data.percent * 100))))
            }
            if (data.percent === 1) {
                try { this._progressChannel?.port1.close() } catch { /* ignore */ }
                this._progressChannel = null
            }
        }

        this._engine.postMessage('setoption name CanOutputEngineDownloadProgress')
        const handleProgressSupport = (e: MessageEvent) => {
            if (e.data === 'info WillOutputEngineDownloadProgress') {
                e.stopImmediatePropagation?.()
                if (this._progressChannel) {
                    this._engine.postMessage(
                        { progressPort: this._progressChannel.port2 },
                        [this._progressChannel.port2]
                    )
                }
                this._engine.removeEventListener('message', handleProgressSupport)
            }
        }
        this._engine.addEventListener('message', handleProgressSupport)
    }

    go(startingFEN: string, longNotationMoves: string[], type: string) {
        let startingTeam: Teams = (startingFEN.split(' ')[1] === 'w') ? "white" : "black"
        if (longNotationMoves.length % 2 === 1) this._analyseFromTeam = (startingTeam === 'white') ? "black" : "white"
        else this._analyseFromTeam = startingTeam
        this.addToQueueAndSend('stop')
        this.addToQueueAndSend('isready')
        this.addToQueueAndSend(`position fen ${startingFEN} moves ${longNotationMoves.join(' ')}`)
        this.addToQueueAndSend('go ' + type)
    }

    reset() {
        this.addToQueueAndSend('stop')
        this.addToQueueAndSend('isready')
        this.addToQueueAndSend('ucinewgame')
    }

    setDifficulty(skill: number, fastGame: boolean) {
        this.addToQueueAndSend('stop')
        this.addToQueueAndSend('isready')

        if (skill !== 20) this.addToQueueAndSend('setoption name Skill Level value ' + skill)

        let engineMoveType = 'movetime 60000'

        if (!fastGame || skill <= 15) {
            let depth: number | null = null
            if (skill < 2) {
                depth = 1;
            } else if (skill < 5) {
                depth = 2;
            } else if (skill < 10) {
                depth = 3;
            } else if (skill < 15) {
                depth = 4;
            } else {
                engineMoveType = 'movetime 10000'
            }
            if (depth)
                engineMoveType = 'move depth ' + depth
        } else
            engineMoveType = 'movetime 1000'
        return engineMoveType
    }

    addToQueueAndSend(cmd: string) {
        if (this._terminated) return
        this._commandsQueue.push(cmd)
        if (this._isready) {
            const cmdToSend = this._commandsQueue.shift() as string
            if (debugEngine) console.log("SendC " + cmdToSend)
            this._engine.postMessage(cmdToSend);
        }
        if (['uci', 'isready'].includes(cmd))
            this._isready = false
    }

    sendCmd(cmd: string) {
        if (this._terminated) return
        if (this._isready) {
            this._engine.postMessage(cmd);
            if (debugEngine) console.log("SendD " + cmd)
            if (['uci', 'isready'].includes(cmd))
                this._isready = false
        } else
            this._commandsQueue.push(cmd)
    }

    loadNNUE() {
        this.addToQueueAndSend('stop')
        this.addToQueueAndSend('isready')
        this.addToQueueAndSend('setoption name Use NNUE value true')
        this.loadedNNUE = true
    }

    quit() {
        if (this._terminated) return
        this._terminated = true
        window.removeEventListener('beforeunload', this._onBeforeUnload)
        try {
            this._engine.postMessage('quit')
        } catch { /* ignore */ }
        try {
            this._engine.terminate()
        } catch { /* ignore */ }
        try {
            this._progressChannel?.port1.close()
        } catch { /* ignore */ }
        this._progressChannel = null
    }

    onMessage(event: string | { data: string }) {
        let line: string
        if (event && typeof event === "object") {
            line = event.data;
        } else {
            line = event;
        }

        // Ignore non-string worker messages (e.g. progress port handshake objects)
        if (typeof line !== 'string') return

        if (debugEngine) console.log(`Receive: ${line}`)

        if (line.startsWith('bestmove')) {
            if (line === 'bestmove (none)') return
            const move = line.split(' ')[1]
            const bestMove: {
                startingPos: Vector
                endingPos: Vector
                promotion?: PieceCodes
            } = {
                startingPos: {
                    'x': convertToPosition(move[0], 'x') as number,
                    'y': convertToPosition(move[1], 'y') as number
                },
                endingPos: {
                    'x': convertToPosition(move[2], 'x') as number,
                    'y': convertToPosition(move[3], 'y') as number
                }
            }
            if (this._isready) {
                if (move.length === 5) {
                    bestMove.promotion = move[4] as PieceCodes
                }
                const event = new CustomEvent("bestmove", {
                    detail: bestMove
                })
                document.dispatchEvent(event);
                if (this._infoBuffer.length) {
                    const event = new CustomEvent("engine", {
                        detail: this._infoBuffer
                    })
                    document.dispatchEvent(event);
                    this._infoBuffer = []
                }
            }
        }

        if (line.startsWith('info')) {
            const lineInfo = UCIengine.parseInfoLine(line, this._analyseFromTeam)
            lineInfo.raw = line
            if (lineInfo.score) {
                if (Number(lineInfo.multipv) === this.multiPV || lineInfo.score === 'mate 0') {
                    this._infoBuffer.push(lineInfo)
                    const event = new CustomEvent("engine", {
                        detail: this._infoBuffer
                    })
                    document.dispatchEvent(event);
                    this._infoBuffer = []
                } else if (Number(lineInfo.multipv) <= this._infoBuffer.length) {
                    const event = new CustomEvent("engine", {
                        detail: this._infoBuffer
                    })
                    document.dispatchEvent(event);
                    this._infoBuffer = [lineInfo]
                } else
                    this._infoBuffer.push(lineInfo)
            }
        }

        if (['uciok', 'readyok'].includes(line)) {
            this._infoBuffer = [] // clear info buffer
            this._isready = true
            if (line === 'readyok' && (this as any)._onReadyOnce) {
                const cb = (this as any)._onReadyOnce
                ;(this as any)._onReadyOnce = null
                cb()
            }
        }

        while (this._commandsQueue.length > 0 && this._isready) {
            let popCmd = this._commandsQueue.shift() as string
            this.sendCmd(popCmd)
        }
    }

    static parseInfoLine(line: string, turn: Teams) {
        const infoTypes = ['depth', 'seldepth', 'multipv', 'score', 'nodes', 'nps', 'hashfull', 'tbhits', 'time', 'pv', 'string']
        let info: any = {}
        let currentInfoType = ''
        let words = line.split(' ')
        for (let i = 0; i < words.length; i++) {
            let word = words[i]
            if (word === 'info') continue
            if (infoTypes.includes(word)) {
                currentInfoType = word
                continue
            }
            if (info.hasOwnProperty(currentInfoType)) {
                let wordToAdd: string | number = word
                if (currentInfoType === 'score' && turn === 'black')
                    if (!isNaN(Number(wordToAdd))) wordToAdd = -Number(wordToAdd)
                info[currentInfoType] += ' ' + wordToAdd
            } else {
                info[currentInfoType] = word
            }
        }
        return info
    }
}

export default UCIengine
