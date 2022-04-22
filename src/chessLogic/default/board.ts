import {BoardPos, PieceAtPos, PieceCodes, Teams } from '../types'

type gameOverRespone = {
    winner: Teams | "draw"
    by: string
    extraInfo?: string
} | false

interface CapturedPieces {
    white: PieceCodes[]
    black: PieceCodes[]
}

class DefaultBoard {
    gameMode: string | null = null
    capturedPieces: CapturedPieces = {
        white: [],
        black: []
    }
    halfMoveNumber: number = 0
    constructor(input: string | DefaultBoard) {
        if (typeof input === 'string')
            this.gameMode = input
    }

    promote(pos: BoardPos, pieceCode: PieceCodes, promoteTeam: Teams): void {

    }

    forcedEnpassant(ws: WebSocket | undefined, team: Teams) {
        return false
    }

    doMove(pieceStartingPos: BoardPos, pieceEndingPos: BoardPos) {

    }

    doNotationMove(move: string) {

    }

    getTurn(type: "prev" | "next"): Teams {
        return 'white'
    }

    isGameOverFor(team: Teams): gameOverRespone {
        return false
    }

    getFen(): string {
        return 'FEN'
    }

    areLegalMoves(team: Teams): boolean {
        return true
    }

    inCheck(team: Teams): boolean {
        return false
    }

    getPos(position: BoardPos): PieceAtPos {
        return null
    }

    setPos(position: BoardPos, Piece: PieceAtPos): void {

    }

    static getShortNotation(startPos: BoardPos, endPos: BoardPos, moveType: string[], startBoard: DefaultBoard, append: string, promotionChoice?: PieceCodes): string {
        return 'a1'
    }
}

export default DefaultBoard 