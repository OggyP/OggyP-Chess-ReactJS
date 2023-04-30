import { PieceCodes, Teams, Vector, PieceAtPos, GameModes } from './types'
import { convertToChessNotation } from './standard/functions'
import { Queen, Rook, Bishop, Knight, ChessPiece, Pawn, King } from './standard/pieces'
import GameStandard from './standard/game'
import GameFisherRandom from './960/game'
import GameFourKings from './fourkings/game'
import Board from './default/board'

function getChessGame(mode: GameModes) {
    if (mode === 'standard')
        return GameStandard
    if (mode === '960')
        return GameFisherRandom
    if (mode === 'fourkings')
        return GameFourKings
    return GameStandard
}

type pieceStyle = 'normal' | 'medieval' | 'ewan' | 'sus'

type gameTypeTypes = typeof GameStandard | typeof GameFisherRandom | typeof GameFourKings
type gameTypes = GameStandard | GameFisherRandom | GameFourKings


export { Board as ChessBoardType, getChessGame, ChessPiece, King, Queen, Rook, Bishop, Knight, Pawn, convertToChessNotation }
export type { Teams, Vector, PieceCodes, PieceAtPos, pieceStyle, gameTypeTypes, gameTypes }