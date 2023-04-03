import { PieceCodes, Teams, Vector, PieceAtPos, GameModes } from './chessLogic/types'
import { convertToChessNotation } from './chessLogic/standard/functions'
import { Queen, Rook, Bishop, Knight, ChessPiece, Pawn, King } from './chessLogic/standard/pieces'
import GameStandard from './chessLogic/standard/game'
import GameFisherRandom from './chessLogic/960/game'
import Board from './chessLogic/default/board'

function getChessGame(mode: GameModes) {
    if (mode === 'standard')
        return GameStandard
    if (mode === '960') {
        return GameFisherRandom

    }
    return GameStandard
}

type pieceStyle = 'normal' | 'medieval' | 'ewan' | 'sus'

export { Board as ChessBoardType, getChessGame, ChessPiece, King, Queen, Rook, Bishop, Knight, Pawn, convertToChessNotation }
export type { Teams, Vector, PieceCodes, PieceAtPos, pieceStyle }