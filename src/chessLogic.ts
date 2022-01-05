import { PieceCodes, Teams, Vector, PieceAtPos } from './chessLogic/types'
import { convertToChessNotation } from './chessLogic/functions'
import { Queen, Rook, Bishop, Knight, ChessPiece, Pawn, King } from './chessLogic/pieces'
import Board from './chessLogic/board'

interface GameConstuctorInput {
    fen?: string
    pgn?: string
}

interface History {
    board: Board
    text: string
    move: {
        start: Vector
        end: Vector
        type: string[]
    } | null
}

class Game {
    private _history: History[] = []
    constructor(input: GameConstuctorInput) {
        if (input.pgn) {

        }
        else if (input.fen) {
            this._history = [{
                board: new Board(input.fen),
                text: "Starting Position",
                move: null
            }]
        }
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
    }
}

export { Board as ChessBoard, Game as ChessGame, ChessPiece, King, Queen, Rook, Bishop, Knight, Pawn, convertToChessNotation }
export type { Teams, Vector, PieceCodes, PieceAtPos }