import { PieceCodes, Teams, BoardPos, PieceAtPos } from './types'
import { getRayCastVectors, getVectors, convertToPosition, convertToChessNotation } from './functions'
import { Queen, Rook, Bishop, Knight, King, Pawn, pieceCodeClasses } from './pieces'
import DefaultBoard from '../default/board'
import { Vector } from '../types';

interface CastleInfoOfTeam {
    kingSide: boolean;
    queenSide: boolean;
}

interface CapturedPieces {
    white: PieceCodes[]
    black: PieceCodes[]
}

type gameOverRespone = {
    winner: Teams | "draw"
    by: string
    extraInfo?: string
} | false

class Board extends DefaultBoard {
    private _squares: Array<Array<PieceAtPos>>;
    enPassant: BoardPos | null = null;
    halfMoveNumber: number;
    halfMovesSinceCaptureOrPawnMove: number;
    castleInfo: { white: CastleInfoOfTeam, black: CastleInfoOfTeam } = {
        "white": { "kingSide": false, "queenSide": false },
        "black": { "kingSide": false, "queenSide": false }
    };
    capturedPieces: CapturedPieces = {
        white: [],
        black: []
    }
    private _pieceId = 0;
    private _repitions = new Map<string, number>()

    constructor(input: string | DefaultBoard = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1") {
        super('standard')
        this._squares = []
        for (let i = 0; i < 8; i++)
            this._squares.push([])
        if (typeof input !== 'string') {
            let board = input as Board
            for (let i = 0; i < 8; i++)
                this._squares[i] = Object.assign([], board._squares[i])
            this.halfMoveNumber = board.halfMoveNumber
            this.halfMovesSinceCaptureOrPawnMove = board.halfMovesSinceCaptureOrPawnMove
            this.castleInfo.white = Object.assign({}, board.castleInfo.white)
            this.castleInfo.black = Object.assign({}, board.castleInfo.black)
            this.enPassant = board.enPassant
            this.capturedPieces.white = Object.assign([], board.capturedPieces.white)
            this.capturedPieces.black = Object.assign([], board.capturedPieces.black)
            this._pieceId = board._pieceId
            this._repitions = new Map(board._repitions)
        } else {
            let FENparts = input.split(' ')
            if (FENparts.length !== 6) {
                console.log("Invalid FEN, There should be 6 segments. The input FEN was " + input)
                input = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
                FENparts = input.split(' ')
            }

            let rows = FENparts[0].split('/')
            if (rows.length !== 8) {
                console.log("Invalid FEN, there needs to be 8 rows specified.")
                input = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
                FENparts = input.split(' ')
                rows = FENparts[0].split('/')
            }

            let turn = (FENparts[1] === 'w') ? "white" : "black"

            this.capturedPieces = {
                white: [],
                black: []
            }

            // Set Castling
            for (let i = 0; i < FENparts[2].length; i++) {
                let char = FENparts[2][i]
                if (char !== '-') {
                    let teamOfCastlingInfo: Teams = (char === char.toUpperCase()) ? "white" : "black";
                    let sideOfCastlingInfo: "kingSide" | "queenSide" = (char.toLowerCase() === 'k') ? "kingSide" : "queenSide";
                    this.castleInfo[teamOfCastlingInfo][sideOfCastlingInfo] = true
                }
            }

            // Set Enpassant
            if (FENparts[3] !== '-')
                this.enPassant = convertToPosition(FENparts[3]) as BoardPos;

            this.halfMovesSinceCaptureOrPawnMove = Number(FENparts[4])
            this.halfMoveNumber = (Number(FENparts[5]) - 1) * 2
            if (turn === "black") this.halfMoveNumber++

            this._repitions.set(FENparts[0], 1)

            // Set Pieces
            for (let rowNum = 0; rowNum < 8; rowNum++) {
                let row = rows[rowNum]
                for (let i = 0; i < row.length; i++) {
                    let char = row[i]
                    if (!isNaN(Number(char))) {
                        // Fill with null for specified amount
                        for (let j = 0; j < Number(char); j++) {
                            this._squares[rowNum].push(null)
                        }
                    } else {
                        let lowerCaseChar: PieceCodes = char.toLowerCase() as PieceCodes
                        if (pieceCodeClasses[lowerCaseChar] !== undefined) {
                            this._pieceId++
                            if (char.toUpperCase() === char) {
                                // Piece is white
                                this._squares[rowNum].push(new pieceCodeClasses[lowerCaseChar]("white", this._pieceId))
                            } else {
                                // Piece is black
                                this._squares[rowNum].push(new pieceCodeClasses[lowerCaseChar]("black", this._pieceId))
                            }
                        }
                    }
                }
            }
        }
    }

    doMove(pieceStartingPos: BoardPos, pieceEndingPos: BoardPos) {
        const pieceToMove = this._squares[pieceStartingPos.y][pieceStartingPos.x]
        if (pieceToMove) {
            this._squares[pieceEndingPos.y][pieceEndingPos.x] = new pieceCodeClasses[pieceToMove.code](pieceToMove.team, pieceToMove.key)
            this._squares[pieceStartingPos.y][pieceStartingPos.x] = null
        }
        this.enPassant = null
    }

    promote(pos: BoardPos, pieceCode: PieceCodes, promoteTeam: Teams): void {
        this._pieceId++
        this.setPos(pos, new pieceCodeClasses[pieceCode](promoteTeam, this._pieceId))
        this.capturedPieces[promoteTeam].push(pieceCode)
        this.capturedPieces[(promoteTeam === 'white') ? 'black' : 'white'].push('p')
    }

    // prev is the move that has just been played
    // next is whose turn it is to be done now
    getTurn(type: "prev" | "next"): Teams {
        if (type === 'prev')
            return (this.halfMoveNumber % 2) ? "white" : "black"
        else
            return (this.halfMoveNumber % 2) ? "black" : "white"
    }


    isGameOverFor(team: Teams): gameOverRespone {
        let legalMoves = false
        let pos: BoardPos = { "x": 0, "y": 0 }
        for (pos.x = 0; pos.x < 8 && !legalMoves; pos.x++)
            for (pos.y = 0; pos.y < 8 && !legalMoves; pos.y++) {
                let piece = this.getPos(pos)
                if (piece && piece.team === team)
                    legalMoves = piece.getMoves(pos, this).length > 0
            }

        if (legalMoves) {
            if (this.halfMovesSinceCaptureOrPawnMove >= 100)
                return { by: '50 move rule', winner: "draw" }
            const position = this.getFen().split(' ')[0]
            if (this._repitions.has(position)) {
                const repitions = this._repitions.get(position) as number + 1
                this._repitions.set(position, repitions)
                if (repitions >= 3) return { by: "repitition", winner: "draw" }
            } else {
                this._repitions.set(position, 1)
            }
            return false
        } else {
            if (this.inCheck(team).length)
                return { by: "checkmate", winner: (team === 'white') ? "black" : "white" }
            else
                return { by: "stalemate", extraInfo: team + " in stalemate", winner: "draw" }
        }
    }

    getFen(): string {
        let FEN = ""
        for (let i = 0; i < 8; i++) {
            let emptySpaceCount = 0;
            for (let j = 0; j < 8; j++) {
                const currentSquareToCheck = this._squares[i][j]
                if (currentSquareToCheck) {
                    let pieceFENcode = (currentSquareToCheck.team === 'white') ? currentSquareToCheck.code.toUpperCase() : currentSquareToCheck.code;
                    if (emptySpaceCount > 0) {
                        FEN += emptySpaceCount.toString()
                    }
                    FEN += pieceFENcode
                    emptySpaceCount = 0
                } else {
                    emptySpaceCount++
                }
            }
            if (emptySpaceCount > 0) {
                FEN += emptySpaceCount.toString()
            }
            FEN += "/"
        }
        FEN = FEN.slice(0, -1) // Remove excess '/'
        FEN += ` ${this.getTurn('next')[0]}`
        let castlingToAdd = ''
        if (this.castleInfo.white.kingSide) castlingToAdd += 'K'
        if (this.castleInfo.white.queenSide) castlingToAdd += 'Q'
        if (this.castleInfo.black.kingSide) castlingToAdd += 'k'
        if (this.castleInfo.black.queenSide) castlingToAdd += 'q'
        if (castlingToAdd.length)
            FEN += ' ' + castlingToAdd
        else
            FEN += ' -'
        if (this.enPassant)
            FEN += ' ' + convertToChessNotation(this.enPassant)
        else
            FEN += ' -'
        FEN += ` ${this.halfMovesSinceCaptureOrPawnMove} ${1 + Math.floor(this.halfMoveNumber / 2)}`
        return FEN
    }

    swapPositions(): void {
        let pos: BoardPos = { "x": 0, "y": 0 }
        for (pos.x = 0; pos.x < 8; pos.x++)
            for (pos.y = 0; pos.y < 8; pos.y++) {
                const pieceAtPos = this._squares[pos.y][pos.x]
                if (pieceAtPos)
                    this._squares[pos.y][pos.x] = this._squares[pos.y][pos.x] = new pieceCodeClasses[pieceAtPos.code]((pieceAtPos.team === 'white') ? 'black' : 'white', this._pieceId)
            }
    }

    areLegalMoves(team: Teams): boolean {
        let pos: BoardPos = { "x": 0, "y": 0 }
        for (pos.x = 0; pos.x < 8; pos.x++)
            for (pos.y = 0; pos.y < 8; pos.y++) {
                const piece = this._squares[pos.y][pos.x]
                if (piece && piece.team === team && piece.getMoves(pos, this).length)
                    return true
            }
        return false

    }

    inCheck(team: Teams): Vector[] {
        let checkPositions: Vector[] = []

        let pos: BoardPos = { "x": 0, "y": 0 }
        for (pos.x = 0; pos.x < 8; pos.x++)
            for (pos.y = 0; pos.y < 8; pos.y++) {
                let piece = this._squares[pos.y][pos.x]
                if (piece instanceof King && piece.team === team) {
                    // Now we have the correct King to check
                    const QueenAndRookBoardPoss: BoardPos[] = [
                        { "x": 0, "y": 1 },
                        { "x": 1, "y": 0 },
                        { "x": 0, "y": -1 },
                        { "x": -1, "y": 0 }
                    ]
                    let pieces = getRayCastVectors(this, QueenAndRookBoardPoss, pos, team).pieces;

                    for (let i = 0; i < pieces.length; i++)
                        if (pieces[i] instanceof Queen || pieces[i] instanceof Rook) {
                            checkPositions.push(Object.assign({}, pos));
                            continue
                        }

                    const QueenAndBishopBoardPoss: BoardPos[] = [
                        { "x": 1, "y": 1 },
                        { "x": 1, "y": -1 },
                        { "x": -1, "y": -1 },
                        { "x": -1, "y": 1 }
                    ]
                    pieces = getRayCastVectors(this, QueenAndBishopBoardPoss, pos, team).pieces;

                    for (let i = 0; i < pieces.length; i++)
                        if (pieces[i] instanceof Queen || pieces[i] instanceof Bishop) {
                            checkPositions.push(Object.assign({}, pos));
                            continue
                        }


                    const knightBoardPoss: BoardPos[] = [
                        { "x": 2, "y": 1 },
                        { "x": 1, "y": 2 },
                        { "x": 2, "y": -1 },
                        { "x": 1, "y": -2 },
                        { "x": -1, "y": -2 },
                        { "x": -2, "y": -1 },
                        { "x": -2, "y": 1 },
                        { "x": -1, "y": 2 }
                    ]
                    pieces = getVectors(this, knightBoardPoss, pos, team).pieces;

                    for (let i = 0; i < pieces.length; i++)
                        if (pieces[i] instanceof Knight) {
                            checkPositions.push(Object.assign({}, pos));
                            continue
                        }


                    const kingBoardPoss: BoardPos[] = [
                        { "x": 0, "y": 1 },
                        { "x": 1, "y": 1 },
                        { "x": 1, "y": 0 },
                        { "x": 1, "y": -1 },
                        { "x": 0, "y": -1 },
                        { "x": -1, "y": -1 },
                        { "x": -1, "y": 0 },
                        { "x": -1, "y": 1 },
                    ]
                    pieces = getVectors(this, kingBoardPoss, pos, team).pieces;

                    for (let i = 0; i < pieces.length; i++)
                        if (pieces[i] instanceof King) {
                            checkPositions.push(Object.assign({}, pos));
                            continue
                        }


                    let pawnBoardPoss
                    if (team === "white")
                        pawnBoardPoss = [
                            { "x": 1, "y": -1 },
                            { "x": -1, "y": -1 }
                        ]
                    else
                        pawnBoardPoss = [
                            { "x": 1, "y": 1 },
                            { "x": -1, "y": 1 }
                        ]

                    pieces = getVectors(this, pawnBoardPoss, pos, team).pieces;
                    for (let i = 0; i < pieces.length; i++)
                        if (pieces[i] instanceof Pawn) {
                            checkPositions.push(Object.assign({}, pos));
                            continue
                        }
                }
            }
        return checkPositions;
    }

    getPos(position: BoardPos | null): PieceAtPos {
        if (!position) return null
        if (position.x < 0 || position.x >= 8 || position.y < 0 || position.y >= 8) return null
        return this._squares[position.y][position.x]
    }

    setPos(position: BoardPos, piece: PieceAtPos): void {
        this._squares[position.y][position.x] = piece
    }

    getShortNotation(startPos: BoardPos, endPos: BoardPos, moveType: string[], startBoard: DefaultBoard, append: string, promotionChoice?: PieceCodes): string {
        return Board.getShortNotationStatic(startPos, endPos, moveType, startBoard, append, promotionChoice)
    }

    static getShortNotationStatic(startPos: BoardPos, endPos: BoardPos, moveType: string[], startBoard: DefaultBoard, append: string, promotionChoice?: PieceCodes): string {
        const startingPiece = startBoard.getPos(startPos)
        let text = ''
        if (startingPiece) {
            if (startingPiece instanceof Pawn) {
                if (moveType.includes('capture'))
                    text += convertToChessNotation(startPos.x, 'x') + 'x'
                text += convertToChessNotation(endPos)
                if (promotionChoice)
                    text += '=' + promotionChoice.toUpperCase()
            } else {
                if (moveType.includes('castleKingSide'))
                    text = "O-O"
                else if (moveType.includes('castleQueenSide'))
                    text = "O-O-O"
                else {
                    let sameX = false
                    let sameY = false
                    let pos: BoardPos = { "x": 0, "y": 0 }
                    for (pos.x = 0; pos.x < 8; pos.x++)
                        for (pos.y = 0; pos.y < 8; pos.y++)
                            if (pos.x !== startPos.x || pos.y !== startPos.y) {
                                const piece = startBoard.getPos(pos)
                                if (piece && piece.team === startingPiece.team && piece.code === startingPiece.code) {
                                    const pieceMoves = piece.getMoves(pos, startBoard)
                                    for (let i = 0; i < pieceMoves.length; i++) {
                                        const currentMove = pieceMoves[i]
                                        if (currentMove.move.x === endPos.x && currentMove.move.y === endPos.y) {
                                            if (pos.x === startPos.x)
                                                sameX = true
                                            else if (pos.y === startPos.y)
                                                sameY = true
                                            else
                                                sameY = true
                                        }
                                    }
                                }
                            }
                    text += startingPiece.code.toUpperCase()
                    if (sameY)
                        text += convertToChessNotation(startPos.x, 'x')
                    if (sameX)
                        text += convertToChessNotation(startPos.y, 'y')
                    if (moveType.includes('capture'))
                        text += 'x'
                    text += convertToChessNotation(endPos)
                }
            }
        }
        return text + append
    }
}

export default Board