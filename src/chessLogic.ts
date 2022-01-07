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
        notation: {
            short: string
            long: string
        }
    } | null
}

class Game {
    private _history: History[] = []
    public startingFEN: string;
    constructor(input: GameConstuctorInput) {
        if (input.pgn) {
            this.startingFEN = ''
        }
        else if (input.fen) {
            this._history = [{
                board: new Board(input.fen),
                text: "Starting Position",
                move: null
            }]
            this.startingFEN = input.fen
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

export { Board as ChessBoard, Game as ChessGame, ChessPiece, King, Queen, Rook, Bishop, Knight, Pawn, convertToChessNotation }
export type { Teams, Vector, PieceCodes, PieceAtPos }