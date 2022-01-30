import { convertToPosition } from "./chessLogic/functions";
import { Teams, Vector, PieceCodes } from "./chessLogic/types";
import { getCookie } from "./helpers/getToken";

const debugEngine = true;

class UCIengine {
  private _engine: Worker;
  private _isready: boolean;
  private _analyseFromTeam: Teams = "white";
  private _infoBuffer: any[] = []
  multiPV: number;
  loadedNNUE: boolean = getCookie('loadNNUE') === 'true'
  _commandsQueue: string[];
  constructor(path: string, initConfigCommands: string[] = [], multiPV: number = 1) {
    this.multiPV = multiPV
    this._engine = new Worker(path)
    this._engine.onmessage = (event) => { this.onMessage(event) }
    this._isready = false;
    this._commandsQueue = initConfigCommands
    this._engine.postMessage('uci')
    this._engine.postMessage('setoption name MultiPV value ' + multiPV)
    if (this.loadedNNUE) {
      this.loadNNUE()
    }
    window.onbeforeunload = () => { this._engine.postMessage('quit') }
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

  addToQueueAndSend(cmd: string) {
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

  onMessage(event: string | { data: string }) {
    let line: string
    if (event && typeof event === "object") {
      line = event.data;
    } else {
      line = event;
    }

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
      }
    }

    if (line.startsWith('info')) {
      const lineInfo = UCIengine.parseInfoLine(line, this._analyseFromTeam)
      lineInfo.raw = line
      if (lineInfo.score) {
        this._infoBuffer.push(lineInfo)
        if (Number(lineInfo.multipv) === this.multiPV || lineInfo.score === 'mate 0') {
          const event = new CustomEvent("engine", {
            detail: this._infoBuffer
          })
          document.dispatchEvent(event);
          this._infoBuffer = []
        }
      }
    }

    if (['uciok', 'readyok'].includes(line)) {
      this._infoBuffer = [] // clear info buffer
      this._isready = true
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