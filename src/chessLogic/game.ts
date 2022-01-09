import Board from './board'
import { convertToPosition, convertToChessNotation } from './functions';
import { Vector, Teams, PieceCodes } from './types'

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
    if (input.pgn) {
      console.log('PGN')
      // Parse PGN
      this.startingFEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
      this.metaValues = new Map<string, string>()

      let lines = input.pgn.split('\n')
      const moves = lines.pop()?.split(' ')
      this.metaValuesOrder = []
      if (!moves) return

      lines.forEach(line => {
        if (!line) return // ignore empty lines
        const words = line.split(' ')
        const metaValueName = words[0].replace('[', '')
        this.metaValues.set(metaValueName, words[1].split('"')[1])
        this.metaValuesOrder.push(metaValueName)
      })

      if (this.metaValues.has('FEN'))
        this.startingFEN = this.metaValues.get('FEN') as string

      let board = new Board(this.startingFEN)

      this._history = [{
        board: new Board(board),
        text: "Starting Position",
        move: null
      }]

      let turn: Teams = 'white'
      for (let i = 0; i < moves.length; i++) {
        const originalPGNmove = moves[i]
        let move = moves[i].replace('+', '').replace('#', '')
        if (move.includes('.')) continue
        if (move[0] === move[0].toLowerCase()) {
          // pawn move
          let startingPos: Vector = { 'x': convertToPosition(move[0], 'x') as number, 'y': -1 }
          let endingPos: Vector
          if (move.includes('x'))
            move = move.split('x')[1]
          endingPos = convertToPosition(move) as Vector
          // now we need to find the starting y value
          let moveInfo: History | null = null
          for (let y = 0; y < 8 && !moveInfo; y++) {
            if (y === startingPos.y) continue
            startingPos.y = y
            const piece = board.getPos(startingPos)
            if (piece && piece.team === turn) {
              let moves = piece.getMoves(startingPos, board)
              for (let i = 0; i < moves.length; i++) {
                const checkMove = moves[i]
                if (checkMove.move.x === endingPos.x && checkMove.move.y === endingPos.y) {
                  board = new Board(checkMove.board)
                  moveInfo = {
                    board: checkMove.board,
                    text: originalPGNmove,
                    move: {
                      start: startingPos,
                      end: endingPos,
                      type: checkMove.moveType,
                      notation: {
                        short: originalPGNmove,
                        long: convertToChessNotation(startingPos) + convertToChessNotation(endingPos)
                      }
                    }
                  }
                  break;
                }
              }
            }
          }
          if (!moveInfo) throw new Error("No legal pawn move was found.");
          if (move[2] === '=') {
            moveInfo.board.promote(endingPos, move.split('=')[1].toLowerCase() as PieceCodes, turn)
            if (moveInfo.move)
              moveInfo.move.notation.long += move.split('=')[1].toLowerCase() as string
              board = new Board(moveInfo.board)
          }
          this.newMove(moveInfo)
        } else {
          // other piece move
          move = move.replace('x', '')
          const pieceType = move[0].toLowerCase()
          const endingPos = convertToPosition(move[1] + move[2]) as Vector
          let pos: Vector = { "x": 0, "y": 0 }
          let foundMove = false
          for (pos.x = 0; pos.x < 8 && !foundMove; pos.x++)
            for (pos.y = 0; pos.y < 8 && !foundMove; pos.y++)
              if (pos.x !== endingPos.x || pos.y !== endingPos.y) {
                let piece = board.getPos(pos)
                if (!piece || piece.team !== turn || piece.code !== pieceType) continue
                let moves = piece.getMoves(pos, board)
                for (let i = 0; i < moves.length; i++) {
                  const checkMove = moves[i]
                  if (checkMove.move.x === endingPos.x && checkMove.move.y === endingPos.y) {
                    foundMove = true
                    board = new Board(checkMove.board)
                    this.newMove({
                      board: checkMove.board,
                      text: originalPGNmove,
                      move: {
                        start: {'x': pos.x, 'y': pos.y},
                        end: endingPos,
                        type: checkMove.moveType,
                        notation: {
                          short: originalPGNmove,
                          long: convertToChessNotation(pos) + convertToChessNotation(endingPos)
                        }
                      }
                    })
                    break;
                  }
                }
              }
          if (!foundMove) throw new Error("No legal normal move found at " + originalPGNmove + " | " + board.getFen() + " Current turn: " + turn + '');

        }
        turn = (turn === 'white') ? 'black' : 'white' // invert team
      }
    }
    else if (input.fen) {
      this.metaValuesOrder = ['Event', 'Site', 'Date', 'Round', 'White', 'Black', 'Result', 'Variant', 'TimeControl', 'ECO', 'Opening']
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
      const opening: { Name: string, ECO: string } = openings[this._shortNotationMoves]
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