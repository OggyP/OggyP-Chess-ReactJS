import { Teams, Vector, MovesAndBoard, PieceCodes } from './types'
import  Board from './board'
import { getVectors, legal, getRayCastVectors, addVectorsAndCheckPos } from './functions'
import ChessPiece from '../default/pieces'

let pieceCodesArray: PieceCodes[] = ['k', 'q', 'r', 'b', 'n', 'p']

const piecePoints = {
    p: 1,
    k: 69,
    q: 9,
    b: 3,
    n: 3,
    r: 5
}

class Queen extends ChessPiece {
    constructor(team: Teams, pieceId: number) {
        super(team, 'q', pieceId)
    }


    getMoves(pos: Vector, board: Board): MovesAndBoard[] {
        if (board.enPassant) return []
        
        const vectors: Vector[] = [
            { "x": 0, "y": 1 },
            { "x": 1, "y": 1 },
            { "x": 1, "y": 0 },
            { "x": 1, "y": -1 },
            { "x": 0, "y": -1 },
            { "x": -1, "y": -1 },
            { "x": -1, "y": 0 },
            { "x": -1, "y": 1 },
        ]
        let moves = getRayCastVectors(board, vectors, pos, this.team).vectors

        return moves.filter(legal, this)
    }
}


class Bishop extends ChessPiece {
    constructor(team: Teams, pieceId: number) {
        super(team, 'b', pieceId)
    }

    getMoves(pos: Vector, board: Board): MovesAndBoard[] {
        if (board.enPassant) return []

        const vectors: Vector[] = [
            { "x": 1, "y": 1 },
            { "x": 1, "y": -1 },
            { "x": -1, "y": -1 },
            { "x": -1, "y": 1 },
        ]
        let moves = getRayCastVectors(board, vectors, pos, this.team).vectors

        return moves.filter(legal, this)
    }
}

class Knight extends ChessPiece {
    constructor(team: Teams, pieceId: number) {
        super(team, 'n', pieceId)
    }

    getMoves(pos: Vector, board: Board): MovesAndBoard[] {
        if (board.enPassant) return []

        const vectors: Vector[] = [
            { "x": 2, "y": 1 },
            { "x": 1, "y": 2 },
            { "x": 2, "y": -1 },
            { "x": 1, "y": -2 },
            { "x": -1, "y": -2 },
            { "x": -2, "y": -1 },
            { "x": -2, "y": 1 },
            { "x": -1, "y": 2 }
        ]
        let moves = getVectors(board, vectors, pos, this.team).vectors

        return moves.filter(legal, this)
    }
}

class Rook extends ChessPiece {
    constructor(team: Teams, pieceId: number) {
        super(team, 'r', pieceId)
    }

    getMoves(pos: Vector, board: Board): MovesAndBoard[] {
        if (board.enPassant) return []

        const vectors: Vector[] = [
            { "x": 0, "y": 1 },
            { "x": 1, "y": 0 },
            { "x": 0, "y": -1 },
            { "x": -1, "y": 0 },
        ]
        let moves = getRayCastVectors(board, vectors, pos, this.team).vectors
        const isAtBackRow = (pos.y === ((this.team === 'white') ? 7 : 0))
        if (isAtBackRow)
            for (let i = 0; i < moves.length; i++) {
                if (pos.x === 0)
                    moves[i].board.castleInfo[this.team].queenSide = false
                if (pos.x === 7)
                    moves[i].board.castleInfo[this.team].kingSide = false
            }

        return moves.filter(legal, this)
    }
}

// Special Cases

class Pawn extends ChessPiece {
    constructor(team: Teams, pieceId: number) {
        super(team, 'p', pieceId)
    }

    getMoves(pos: Vector, board: Board): MovesAndBoard[] {
        const ownTeam = this.team
        let hasMoved = (((ownTeam === 'white') ? 6 : 1) !== pos.y) // Piece is at the starting row of pawns for it's team
        let moves: MovesAndBoard[] = []

        // Take Right
        let yMoveVal = (ownTeam === "white") ? -1 : 1
        let vectorToCheck: Vector | null = addVectorsAndCheckPos(pos, { "x": 1, "y": yMoveVal })
        if (vectorToCheck) {
            if (board.enPassant && board.enPassant.x === vectorToCheck.x && board.enPassant.y === vectorToCheck.y && board.enPassant.y === ((ownTeam === 'white') ? 2 : 5)) {
                const newBoard = new Board(board)
                newBoard.doMove(pos, vectorToCheck)
                newBoard.setPos({ "x": vectorToCheck.x, "y": pos.y }, null)
                moves.push({
                    "move": vectorToCheck,
                    "board": newBoard,
                    "moveType": ["enpassant", "capture", "p"]
                })
            } else {
                let takeRightPos = board.getPos(vectorToCheck)
                if (takeRightPos && takeRightPos.team !== ownTeam) {
                    const newBoard = new Board(board)
                    newBoard.doMove(pos, vectorToCheck)
                    moves.push({
                        "move": vectorToCheck,
                        "board": newBoard,
                        "moveType": ["capture", takeRightPos.code]
                    })
                }
            }
        }

        // Take Left
        vectorToCheck = addVectorsAndCheckPos(pos, { "x": -1, "y": yMoveVal })
        if (vectorToCheck) {
            if (board.enPassant && board.enPassant.x === vectorToCheck.x && board.enPassant.y === vectorToCheck.y && board.enPassant.y === ((ownTeam === 'white') ? 2 : 5)) {
                const newBoard = new Board(board)
                newBoard.doMove(pos, vectorToCheck)
                newBoard.setPos({ "x": vectorToCheck.x, "y": pos.y }, null)
                moves.push({
                    "move": vectorToCheck,
                    "board": newBoard,
                    "moveType": ["enpassant", "capture", "p"]
                })
            } else {
                let takeLeftPos = board.getPos(vectorToCheck)
                if (takeLeftPos && takeLeftPos.team !== ownTeam) {
                    const newBoard = new Board(board)
                    newBoard.doMove(pos, vectorToCheck)
                    moves.push({
                        "move": vectorToCheck,
                        "board": newBoard,
                        "moveType": ["capture", takeLeftPos.code]
                    })
                }
            }
        }

        // Single Move
        vectorToCheck = addVectorsAndCheckPos(pos, { "x": 0, "y": yMoveVal })
        if (vectorToCheck && !board.getPos(vectorToCheck)) {
            const newBoard = new Board(board)
            newBoard.doMove(pos, vectorToCheck)
            moves.push({
                "move": vectorToCheck,
                "board": newBoard,
                "moveType": []
            })

            // Double Move
            if (!hasMoved) {
                vectorToCheck = addVectorsAndCheckPos(pos, { "x": 0, "y": 2 * yMoveVal })
                if (vectorToCheck && !board.getPos(vectorToCheck)) {
                    const newBoard = new Board(board)
                    newBoard.doMove(pos, vectorToCheck)
                    let minusPos = newBoard.getPos(addVectorsAndCheckPos(pos, { "x": -1, "y": 2 * yMoveVal }))
                    let plusPos = newBoard.getPos(addVectorsAndCheckPos(pos, { "x": 1, "y": 2 * yMoveVal }))
                    if ((minusPos && minusPos.team !== ownTeam && minusPos.code === 'p') || (plusPos && plusPos.team !== ownTeam && plusPos.code === 'p'))
                        newBoard.enPassant = addVectorsAndCheckPos(pos, { "x": 0, "y": yMoveVal })
                    moves.push({
                        "move": vectorToCheck,
                        "board": newBoard,
                        "moveType": []
                    })
                }
            }
        }

        if (board.enPassant) {
            for (let i = 0; i < moves.length; i++) {
                if (moves[i].moveType.includes("enpassant")) {
                    return [moves[i]].filter(legal, this)
                }
            }
            return []
        }

        if (((this.team === "white") ? 1 : 6) === pos.y)
            return moves.filter(legal, this).map((item, index) => {
                item.moveType.push('promote')
                return item
            })
        else
            return moves.filter(legal, this)
    }
}

class King extends ChessPiece {
    constructor(team: Teams, pieceId: number) {
        super(team, 'k', pieceId)
    }

    getMoves(pos: Vector, board: Board): MovesAndBoard[] {
        if (board.enPassant) return []
        
        const vectors: Vector[] = [
            { "x": 0, "y": 1 },
            { "x": 1, "y": 1 },
            { "x": 1, "y": 0 },
            { "x": 1, "y": -1 },
            { "x": 0, "y": -1 },
            { "x": -1, "y": -1 },
            { "x": -1, "y": 0 },
            { "x": -1, "y": 1 },
        ]
        let moves = getVectors(board, vectors, pos, this.team).vectors
        for (let i = 0; i < moves.length; i++) {
            moves[i].board.castleInfo[this.team].kingSide = false
            moves[i].board.castleInfo[this.team].queenSide = false
        }

        if (!board.inCheck(this.team)) {
            if (board.castleInfo[this.team].kingSide && pos.x === 4 && (pos.y === 0 || pos.y === 7)) {
                let piecesInWay: PieceCodes[] = []
                for (let i = 4; i < 8; i++) {
                    const piece = board.getPos({ "x": i, "y": pos.y })
                    if (piece && piece.team === this.team) piecesInWay.push(piece.code)
                }
                if (piecesInWay.length === 2 && piecesInWay.includes('k') && piecesInWay.includes('r')) {
                    const newBoard = new Board(board)
                    const vectorToDisplay = { "x": 6, "y": pos.y }
                    if (vectorToDisplay && !board.getPos({ "x": 5, "y": pos.y }) && !board.getPos({ "x": 6, "y": pos.y })) {
                        newBoard.doMove(pos, { "x": 5, "y": pos.y })
                        if (!newBoard.inCheck(this.team)) {
                            newBoard.doMove({ "x": 5, "y": pos.y }, vectorToDisplay)
                            if (!newBoard.inCheck(this.team)) {
                                newBoard.doMove({ "x": 7, "y": pos.y }, { "x": 5, "y": pos.y })
                                newBoard.castleInfo[this.team].kingSide = false
                                moves.push({
                                    move: vectorToDisplay,
                                    board: newBoard,
                                    moveType: ["castleKingSide"]
                                })
                                const castleCaptureBoard = new Board(newBoard)
                                moves.push({
                                    move: { "x": 7, "y": pos.y },
                                    board: castleCaptureBoard,
                                    moveType: ["castleKingSide", 'captureRookCastle'],
                                    displayVector: vectorToDisplay
                                })
                            }
                        }
                    }
                }
            }
            if (board.castleInfo[this.team].queenSide && pos.x === 3 && (pos.y === 0 || pos.y === 7)) {
                let piecesInWay: PieceCodes[] = []
                for (let i = 3; i >= 0; i--) {
                    const piece = board.getPos({ "x": i, "y": pos.y })
                    if (piece && piece.team === this.team) piecesInWay.push(piece.code)
                }
                if (piecesInWay.length === 2 && piecesInWay.includes('k') && piecesInWay.includes('r')) {
                    const newBoard = new Board(board)
                    const vectorToDisplay = { "x": 1, "y": pos.y }
                    if (vectorToDisplay && !board.getPos({ "x": 2, "y": pos.y }) && !board.getPos({ "x": 1, "y": pos.y })) {
                        newBoard.doMove(pos, { "x": 2, "y": pos.y })
                        if (!newBoard.inCheck(this.team)) {
                            newBoard.doMove({ "x": 2, "y": pos.y }, vectorToDisplay)
                            if (!newBoard.inCheck(this.team)) {
                                newBoard.doMove({ "x": 0, "y": pos.y }, { "x": 2, "y": pos.y })
                                newBoard.castleInfo[this.team].queenSide = false
                                moves.push({
                                    move: vectorToDisplay,
                                    board: newBoard,
                                    moveType: ["castleQueenSide"]
                                })
                                const castleCaptureBoard = new Board(newBoard)
                                moves.push({
                                    move: { "x": 0, "y": pos.y },
                                    board: castleCaptureBoard,
                                    moveType: ["castleQueenSide", 'captureRookCastle'],
                                    displayVector: vectorToDisplay
                                })
                            }
                        }
                    }
                }
            }
        }

        return moves.filter(legal, this)
    }
}

const pieceCodeClasses = {
    "q": Queen,
    "k": King,
    "b": Bishop,
    "n": Knight,
    "r": Rook,
    "p": Pawn
}

export { ChessPiece, Queen, Rook, Bishop, Knight, Pawn, King, pieceCodeClasses, pieceCodesArray, piecePoints }