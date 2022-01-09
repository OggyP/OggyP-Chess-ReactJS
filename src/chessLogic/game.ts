import Board from './board'
import { Vector } from './types'

async function getJSON(path: string, callback: Function) {
  return callback(await fetch(path).then(r => r.json()));
}

let openings: any
getJSON('/assets/openings.json', (data: object) => { openings = data; console.log(openings) })

interface GameConstuctorInput {
  fen?: {
    val: string
    meta?: Map<string, string>
  }
  pgn?: string
}

interface History {
  board: Board
  text: string
  move: {
    start: Vector
    end: Vector
    type: string[]
    notation: {
      short: string
      long: string
    }
  } | null
}

interface Opening {
  Name: string,
  ECO: string | null
}

class Game {
  private _history: History[] = [];
  private _shortNotationMoves: string = ''
  public startingFEN: string;
  public metaValues: Map<string, string>;
  public metaValuesOrder: string[];
  public opening: Opening = {
    "Name": "Starting Position",
    "ECO": null
  }
  constructor(input: GameConstuctorInput) {
    this.metaValuesOrder = ['Event', 'Site', 'Date', 'Round', 'White', 'Black', 'Result', 'Variant', 'TimeControl', 'ECO', 'Opening']
    if (input.pgn) {
      this.startingFEN = ''
      const currentDate = new Date()
      this.metaValues = new Map([
        ['Event', "Online Match"],
        ['Site', 'https://chess.oggyp.com'],
        ['Date', currentDate.getFullYear() + '.' + currentDate.getMonth() + '.' + currentDate.getDate()],
        ['Round', '?'],
        ['White', '?'],
        ['Black', '?'],
        ['Result', '*'],
        ['Variant', 'Standard'],
        ['TimeControl', '-'],
        ['ECO', '?'],
        ['Opening', '?']
      ])
    }
    else if (input.fen) {
      if (input.fen.meta)
        this.metaValues = input.fen.meta
      else {
        const currentDate = new Date()
        this.metaValues = new Map([
          ['Event', "Online Match"],
          ['Site', 'https://chess.oggyp.com'],
          ['Date', currentDate.getFullYear() + '.' + currentDate.getMonth() + '.' + currentDate.getDate()],
          ['Round', '?'],
          ['White', '?'],
          ['Black', '?'],
          ['Result', '*'],
          ['Variant', 'Standard'],
          ['TimeControl', '-'],
          ['ECO', '?'],
          ['Opening', '?']
        ])
      }
      this._history = [{
        board: new Board(input.fen.val),
        text: "Starting Position",
        move: null
      }]
      this.startingFEN = input.fen.val
    } else
      throw (new Error("You must specify either a FEN or PGN to track game history."))
  }

  getMoveCount(): number {
    return this._history.length - 1
  }

  getMove(moveNum: number): History {
    return this._history[moveNum]
  }

  getLatest(): History {
    return this._history[this.getMoveCount()]
  }

  newMove(move: History) {
    this._history.push(move)

    let i = this.getMoveCount()
    const moveInfo = move.move
    if (moveInfo) {
      if (i % 2 === 1) {
        this._shortNotationMoves += ((i !== 1) ? ' ' : '') + ((i - 1) / 2 + 1) + '.'
      }
      this._shortNotationMoves += ' ' + moveInfo.notation.short
    }

    if (openings) {
      console.log(this._shortNotationMoves)
      const opening: {Name: string, ECO: string} = openings[this._shortNotationMoves]
      console.log(opening)
      if (this.getMoveCount() < 25 && opening) {
        console.log("Update " + opening)
        this.metaValues.set('Opening', opening.Name)
        this.metaValues.set('ECO', opening.ECO)
        this.opening = opening as Opening
      }
    }
  }

  getPGN(): string {
    let pgn: string = ''
    this.metaValuesOrder.forEach(value => {
      pgn += `[${value} "${this.metaValues.get(value)}"]\n`
    })
    pgn += '\n' + this._shortNotationMoves
    return pgn
  }

  // Returns the moves in long notation from the starting position
  getMovesTo(halfMoveNum: number): string[] {
    let moves: string[] = []
    for (let i = 0; i <= halfMoveNum; i++) {
      const move = this._history[i].move
      if (move)
        moves.push(move.notation.long)
    }
    return moves
  }
}

export default Game