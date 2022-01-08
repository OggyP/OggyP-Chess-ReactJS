import { Teams } from "./chessLogic/types";

class UCIengine {
  private _engine: Worker;
  private _isready: boolean;
  private _analyseFromTeam: Teams = "white";
  _commandsQueue: string[];
  constructor(path: string, initConfigCommands: string[] = []) {
    this._engine = new Worker(path)
    this._engine.onmessage = (event) => { this.onMessage(event) }
    this._isready = false;
    this._commandsQueue = initConfigCommands
    console.log(this._commandsQueue)
    this._engine.postMessage('uci')
    window.onbeforeunload = () => {this._engine.postMessage('quit')}
  }

  analyse(startingFEN: string, longNotationMoves: string[]) {
    let startingTeam: Teams = (startingFEN.split(' ')[1] === 'w') ? "white" : "black"
    if (longNotationMoves.length % 2 === 1) this._analyseFromTeam = (startingTeam === 'white') ? "black" : "white"
    else this._analyseFromTeam = startingTeam
    console.log(this._analyseFromTeam + longNotationMoves.length)
    this.addToQueueAndSend('stop')
    this.addToQueueAndSend('isready')
    this.addToQueueAndSend(`position fen ${startingFEN} moves ${longNotationMoves.join(' ')}`)
    this.addToQueueAndSend('go movetime 3000')
  }

  addToQueueAndSend(cmd: string) {
    this._commandsQueue.push(cmd)
    if (this._isready) {
      this._engine.postMessage(this._commandsQueue.shift() as string);
      console.log(`SendQUE: ${cmd}`)
    }
    if (['uci', 'isready'].includes(cmd))
      this._isready = false
  }

  sendCmd(cmd: string) {
    if (this._isready) {
      console.log(`SendCMD: ${cmd}`)
      this._engine.postMessage(cmd);
      if (['uci', 'isready'].includes(cmd))
        this._isready = false
    } else
      this._commandsQueue.push(cmd)
  }

  onMessage(event: string | { data: string }) {
    let line: string
    if (event && typeof event === "object") {
      line = event.data;
    } else {
      line = event;
    }

    console.log(`Receive: ${line}`)

    if (line.startsWith('info')) {
      const lineInfo = UCIengine.parseInfoLine(line, this._analyseFromTeam)
      if (lineInfo.score) {
        const event = new CustomEvent("engine", {
          detail: lineInfo
        })
        document.dispatchEvent(event);
        console.log("SEND EVENT")
      }
    }

    if (['uciok', 'readyok'].includes(line))
      this._isready = true

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