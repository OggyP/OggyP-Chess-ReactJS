import { Teams, Vector, MovesAndBoard, PieceCodes } from './types'
import Board from './board'
import { getVectors, legal, getRayCastVectors, addVectorsAndCheckPos, normaliseDirection } from './functions'
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

        if ((pos.y === 0 && this.team === 'black') || (pos.y === 7 && this.team === 'white')) {
            if (board.castleInfo[this.team].includes(pos.x)) {
                for (let i = 0; i < moves.length; i++) {
                    moves[i].board.castleInfo[this.team] = moves[i].board.castleInfo[this.team].filter((value) => {
                        return value !== pos.x
                    })
                }
            }
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
        for (let i = 0; i < moves.length; i++)
            moves[i].board.castleInfo[this.team] = []

        if (!board.inCheck(this.team).length && (pos.y === 0 || pos.y === 7)) {
            for (let rookXpos of board.castleInfo[this.team]) {
                // Find the rook's position
                let rookPos: Vector = {
                    x: rookXpos,
                    y: pos.y
                }
                const rook = board.getPos(rookPos)
                if (!rook || rook.code !== 'r' || rook.team !== this.team)
                    continue

                const dirFromKingToRook = normaliseDirection(pos.x, rookPos.x)
                if (dirFromKingToRook === 0) throw new Error("Bruh dir from king is 0")

                const kingEndXval = (dirFromKingToRook > 0) ? 6 : 2
                const rookEndXval = (dirFromKingToRook > 0) ? 5 : 3

                // Check no pieces are in the way for the king
                const normalisedDirForKing = normaliseDirection(pos.x, kingEndXval)
                let piecesInWayForKing: ChessPiece[] = []
                let kingCheckPos: Vector = {
                    x: pos.x + normalisedDirForKing,
                    y: pos.y
                }
                while (kingCheckPos.x !== kingEndXval + normalisedDirForKing) {
                    const piece = board.getPos(kingCheckPos)
                    if (piece)
                        piecesInWayForKing.push(piece)
                    kingCheckPos.x += normalisedDirForKing
                }
                if ((piecesInWayForKing.length === 1 && piecesInWayForKing[0].code === 'r' && piecesInWayForKing[0].team === this.team) || piecesInWayForKing.length === 0) {
                    // Check no pieces are in the way for the rook
                    const normalisedDirForRook = normaliseDirection(rookPos.x, rookEndXval)

                    let piecesInWayForRook: ChessPiece[] = []
                    let rookCheckPos: Vector = {
                        x: rookPos.x + normalisedDirForRook,
                        y: pos.y
                    }
                    while (rookCheckPos.x !== rookEndXval + normalisedDirForRook) {
                        const piece = board.getPos(rookCheckPos)
                        if (piece)
                            piecesInWayForRook.push(piece)
                        rookCheckPos.x += normalisedDirForRook
                    }

                    if ((piecesInWayForRook.length === 1 && piecesInWayForRook[0].code === 'k' && piecesInWayForRook[0].team === this.team) || piecesInWayForRook.length === 0) {
                        const rook = board.getPos(rookPos)

                        // Ensure the king isn't at any point in check
                        kingCheckPos = {
                            x: pos.x + normalisedDirForKing,
                            y: pos.y
                        }
                        let inCheck = false
                        const newBoard = new Board(board)
                        newBoard.setPos(rookPos, null)

                        while (kingCheckPos.x !== kingEndXval + normalisedDirForKing) {
                            newBoard.doMove({
                                x: kingCheckPos.x - normalisedDirForKing,
                                y: pos.y
                            }, kingCheckPos)
                            inCheck = !!(newBoard.inCheck(this.team).length)
                            if (inCheck) break
                            kingCheckPos.x += normalisedDirForKing
                        }
                        if (!inCheck) {
                            newBoard.setPos({ "x": rookEndXval, "y": pos.y }, rook)
                            newBoard.castleInfo[this.team] = []
                            moves.push({
                                move: { "x": rookPos.x, "y": pos.y },
                                board: new Board(newBoard),
                                moveType: ["castleKingSide", 'captureRookCastle'],
                                // displayVector: { x: 5, y: pos.y }
                            })
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