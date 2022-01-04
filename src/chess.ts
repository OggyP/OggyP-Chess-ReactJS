import { start } from "repl";

type PieceCodes = 'p' | 'r' | 'n' | 'b' | 'q' | 'k';
type Teams = 'white' | 'black';

interface VectorsAndPieces {
    pieces: ChessPiece[];
    vectors: MovesAndBoard[];
}

type PieceAtPos = ChessPiece | null

class ChessPiece {
    team: Teams;
    code: PieceCodes;
    key: number;

    constructor(team: Teams, pieceCode: PieceCodes, pieceId: number) {
        this.team = team;
        this.code = pieceCode;
        this.key = pieceId;
    }

    getMoves(pos: Vector, board: Board): MovesAndBoard[] {
        return []
    }

    getTeam(): Teams {
        return this.team
    }
}

interface Vector {
    x: number;
    y: number;
}

interface MovesAndBoard {
    "move": Vector,
    "board": Board,
    "moveType": string[]
}

class Queen extends ChessPiece {
    constructor(team: Teams, pieceId: number) {
        super(team, 'q', pieceId)
    }


    getMoves(pos: Vector, board: Board): MovesAndBoard[] {
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
        let moves = getRayCastVectors(board, vectors, pos, super.getTeam()).vectors

        return moves.filter(legal, this)
    }
}

class King extends ChessPiece {
    constructor(team: Teams, pieceId: number) {
        super(team, 'k', pieceId)
    }

    getMoves(pos: Vector, board: Board): MovesAndBoard[] {
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
        let moves = getVectors(board, vectors, pos, super.getTeam()).vectors
        for (let i = 0; i < moves.length; i++) {
            moves[i].board.castleInfo[this.team].kingSide = false
            moves[i].board.castleInfo[this.team].queenSide = false
        }

        if (!board.inCheck(this.team)) {
            if (board.castleInfo[this.team].kingSide) {
                let piecesInWay: PieceCodes[] = []
                for (let i = 4; i < 8; i++) {
                    const piece = board.getPos({ "x": i, "y": pos.y })
                    if (piece && piece.team === this.team) piecesInWay.push(piece.code)
                }
                if (piecesInWay.length === 2 && piecesInWay.includes('k') && piecesInWay.includes('r')) {
                    let newBoard = new Board(board)
                    const vectorToDisplay = { "x": 6, "y": pos.y }
                    if (vectorToDisplay) {
                        newBoard.doMove(pos, { "x": 5, "y": pos.y })
                        if (!newBoard.inCheck(this.team)) {
                            newBoard.doMove({ "x": 5, "y": pos.y }, vectorToDisplay)
                            if (!newBoard.inCheck(this.team)) {
                                newBoard.doMove({ "x": 7, "y": pos.y }, { "x": 5, "y": pos.y })
                                newBoard.castleInfo[this.team].kingSide = false
                                newBoard.castleInfo[this.team].queenSide = false
                                moves.push({
                                    "move": vectorToDisplay,
                                    "board": newBoard,
                                    "moveType": ["castleKingSide"]
                                })
                            }
                        }
                    }
                }
            }
            if (board.castleInfo[this.team].queenSide) {
                let piecesInWay: PieceCodes[] = []
                for (let i = 4; i >= 0; i--) {
                    const piece = board.getPos({ "x": i, "y": pos.y })
                    if (piece && piece.team === this.team) piecesInWay.push(piece.code)
                }
                if (piecesInWay.length === 2 && piecesInWay.includes('k') && piecesInWay.includes('r')) {
                    const newBoard = new Board(board)
                    const vectorToDisplay = { "x": 2, "y": pos.y }
                    if (vectorToDisplay) {
                        newBoard.doMove(pos, { "x": 3, "y": pos.y })
                        if (!newBoard.inCheck(this.team)) {
                            newBoard.doMove({ "x": 3, "y": pos.y }, vectorToDisplay)
                            if (!newBoard.inCheck(this.team)) {
                                newBoard.doMove({ "x": 0, "y": pos.y }, { "x": 3, "y": pos.y })
                                newBoard.castleInfo[this.team].kingSide = false
                                newBoard.castleInfo[this.team].queenSide = false
                                moves.push({
                                    "move": vectorToDisplay,
                                    "board": newBoard,
                                    "moveType": ["castleQueenSide"]
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

class Bishop extends ChessPiece {
    constructor(team: Teams, pieceId: number) {
        super(team, 'b', pieceId)
    }

    getMoves(pos: Vector, board: Board): MovesAndBoard[] {
        const vectors: Vector[] = [
            { "x": 1, "y": 1 },
            { "x": 1, "y": -1 },
            { "x": -1, "y": -1 },
            { "x": -1, "y": 1 },
        ]
        let moves = getRayCastVectors(board, vectors, pos, super.getTeam()).vectors

        return moves.filter(legal, this)
    }
}

class Knight extends ChessPiece {
    constructor(team: Teams, pieceId: number) {
        super(team, 'n', pieceId)
    }

    getMoves(pos: Vector, board: Board): MovesAndBoard[] {
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
        let moves = getVectors(board, vectors, pos, super.getTeam()).vectors

        return moves.filter(legal, this)
    }
}

class Rook extends ChessPiece {
    constructor(team: Teams, pieceId: number) {
        super(team, 'r', pieceId)
    }

    getMoves(pos: Vector, board: Board): MovesAndBoard[] {
        const vectors: Vector[] = [
            { "x": 0, "y": 1 },
            { "x": 1, "y": 0 },
            { "x": 0, "y": -1 },
            { "x": -1, "y": 0 },
        ]
        let moves = getRayCastVectors(board, vectors, pos, super.getTeam()).vectors
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

class Pawn extends ChessPiece {
    constructor(team: Teams, pieceId: number) {
        super(team, 'p', pieceId)
    }

    getMoves(pos: Vector, board: Board): MovesAndBoard[] {
        const ownTeam = super.getTeam()
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
                    "moveType": ["enpassant", "capture"]
                })
            } else {
                let takeRightPos = board.getPos(vectorToCheck)
                if (takeRightPos && takeRightPos.team !== ownTeam) {
                    const newBoard = new Board(board)
                    newBoard.doMove(pos, vectorToCheck)
                    moves.push({
                        "move": vectorToCheck,
                        "board": newBoard,
                        "moveType": ["capture"]
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
                    "moveType": ["enpassant", "capture"]
                })
            } else {
                let takeLeftPos = board.getPos(vectorToCheck)
                if (takeLeftPos && takeLeftPos.team !== ownTeam) {
                    const newBoard = new Board(board)
                    newBoard.doMove(pos, vectorToCheck)
                    moves.push({
                        "move": vectorToCheck,
                        "board": newBoard,
                        "moveType": ["capture"]
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
                    newBoard.enPassant = addVectorsAndCheckPos(pos, { "x": 0, "y": yMoveVal })
                    moves.push({
                        "move": vectorToCheck,
                        "board": newBoard,
                        "moveType": []
                    })
                }
            }
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

function legal(this: ChessPiece, value: MovesAndBoard): boolean {
    if (this instanceof Pawn || value.moveType.includes('capture')) value.board.halfMovesSinceCaptureOrPawnMove = 0
    else value.board.halfMovesSinceCaptureOrPawnMove++
    value.board.halfMoveNumber++
    return !value.board.inCheck(this.team)
}

function addVectorsAndCheckPos(vector1: Vector, vector2: Vector): Vector | null {
    let returnVector: Vector = {
        "x": vector1.x + vector2.x,
        "y": vector1.y + vector2.y
    }
    if (returnVector.x >= 0 && returnVector.x < 8 && returnVector.y >= 0 && returnVector.y < 8)
        return returnVector
    else return null
}

const pieceCodeClasses = {
    "q": Queen,
    "k": King,
    "b": Bishop,
    "n": Knight,
    "r": Rook,
    "p": Pawn
}

function getRayCastVectors(board: Board, vectors: Vector[], position: Vector, team: Teams): VectorsAndPieces {
    let validVectors: MovesAndBoard[] = []
    let collidedPieces: ChessPiece[] = []
    for (let i = 0; i < vectors.length; i++) {
        let vector = vectors[i];
        let currentCoords: Vector = {
            "x": vector.x + position.x,
            "y": vector.y + position.y
        }
        let vectorValid = true;
        while (vectorValid && currentCoords.x >= 0 && currentCoords.y >= 0 && currentCoords.x < 8 && currentCoords.y < 8) {
            let currentPiece: PieceAtPos = board.getPos(currentCoords);
            if (currentPiece === null) {
                const newBoard = new Board(board)
                newBoard.doMove(position, currentCoords)
                validVectors.push({
                    "move": Object.assign({}, currentCoords),
                    "board": newBoard,
                    "moveType": []
                })
            } else if (currentPiece.team === team) {
                vectorValid = false;
            } else {
                collidedPieces.push(currentPiece)
                const newBoard = new Board(board)
                newBoard.doMove(position, currentCoords)
                validVectors.push({
                    "move": Object.assign({}, currentCoords),
                    "board": newBoard,
                    "moveType": ["capture"]
                })
                vectorValid = false;
            }
            currentCoords.x += vector.x;
            currentCoords.y += vector.y;
        }
    }
    return {
        "pieces": collidedPieces,
        "vectors": validVectors
    };
}

function getVectors(board: Board, vectors: Vector[], position: Vector, team: Teams): VectorsAndPieces {
    let validVectors: MovesAndBoard[] = []
    let collidedPieces: ChessPiece[] = []
    for (let i = 0; i < vectors.length; i++) {
        let vector = vectors[i];
        let currentCoords: Vector = {
            "x": vector.x + position.x,
            "y": vector.y + position.y
        }
        if (currentCoords.x >= 0 && currentCoords.y >= 0 && currentCoords.x < 8 && currentCoords.y < 8) {
            let currentPiece: PieceAtPos = board.getPos(currentCoords);
            if (currentPiece === null) {
                const newBoard = new Board(board)
                newBoard.doMove(position, currentCoords)
                validVectors.push({
                    "move": Object.assign({}, currentCoords),
                    "board": newBoard,
                    "moveType": []
                })
            } else if (currentPiece.team !== team) {
                collidedPieces.push(currentPiece)
                const newBoard = new Board(board)
                newBoard.doMove(position, currentCoords)
                validVectors.push({
                    "move": Object.assign({}, currentCoords),
                    "board": newBoard,
                    "moveType": ["capture"]
                })
            }
        }
    }
    return {
        "pieces": collidedPieces,
        "vectors": validVectors
    };
}

interface CastleInfoOfTeam {
    kingSide: boolean;
    queenSide: boolean;
}

type gameOverRespone = {
    winner: Teams | "draw"
    by: string
    extraInfo?: string
} | false

class Board {
    private _squares: Array<Array<PieceAtPos>>;
    enPassant: Vector | null = null;
    halfMoveNumber: number;
    halfMovesSinceCaptureOrPawnMove: number;
    castleInfo: { white: CastleInfoOfTeam, black: CastleInfoOfTeam } = {
        "white": { "kingSide": false, "queenSide": false },
        "black": { "kingSide": false, "queenSide": false }
    };
    private _pieceId = 0;

    constructor(input: string | Board = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1") {
        this._squares = []
        for (let i = 0; i < 8; i++)
            this._squares.push([])
        if (input instanceof Board) {
            for (let i = 0; i < 8; i++)
                this._squares[i] = Object.assign([], input._squares[i])
            this.halfMoveNumber = input.halfMoveNumber
            this.halfMovesSinceCaptureOrPawnMove = input.halfMovesSinceCaptureOrPawnMove
            this.castleInfo.white = Object.assign({}, input.castleInfo.white)
            this.castleInfo.black = Object.assign({}, input.castleInfo.black)
            this.enPassant = input.enPassant
            this._pieceId = input._pieceId
        } else {
            let FENparts = input.split(' ')
            if (FENparts.length !== 6)
                throw new Error("Invalid FEN, There should be 6 segments.")

            let turn = (FENparts[1] === 'w') ? "white" : "black"

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
                this.enPassant = convertToPosition(FENparts[3]);

            this.halfMovesSinceCaptureOrPawnMove = Number(FENparts[4])
            this.halfMoveNumber = (Number(FENparts[5]) - 1) * 2
            if (turn === "black") this.halfMoveNumber++

            // Set Pieces
            let rows = FENparts[0].split('/')
            if (rows.length !== 8)
                throw new Error("Invalid FEN, there needs to be 8 rows specified.")

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

    doMove(pieceStartingPos: Vector, pieceEndingPos: Vector) {
        const pieceToMove = this._squares[pieceStartingPos.y][pieceStartingPos.x]
        if (pieceToMove) {
            this._squares[pieceEndingPos.y][pieceEndingPos.x] = new pieceCodeClasses[pieceToMove.code](pieceToMove.team, pieceToMove.key)
            this._squares[pieceStartingPos.y][pieceStartingPos.x] = null
        }
        this.enPassant = null
    }

    promote(pos: Vector, pieceCode: PieceCodes, promoteTeam: Teams): void {
        this._pieceId++
        this.setPos(pos, new pieceCodeClasses[pieceCode](promoteTeam, this._pieceId))
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
        let pos: Vector = { "x": 0, "y": 0 }
        for (pos.x = 0; pos.x < 8 && !legalMoves; pos.x++)
            for (pos.y = 0; pos.y < 8 && !legalMoves; pos.y++) {
                let piece = this.getPos(pos)
                if (piece && piece.team === team)
                    legalMoves = piece.getMoves(pos, this).length > 0
            }

        if (legalMoves) {
            if (this.halfMovesSinceCaptureOrPawnMove >= 100)
                return { by: '50 move rule', winner: "draw" }
            console.log(JSON.stringify(this._squares))
            return false
        } else {
            if (this.inCheck(team))
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
        let pos: Vector = { "x": 0, "y": 0 }
        for (pos.x = 0; pos.x < 8; pos.x++)
            for (pos.y = 0; pos.y < 8; pos.y++) {
                const pieceAtPos = this._squares[pos.y][pos.x]
                if (pieceAtPos)
                    this._squares[pos.y][pos.x] = this._squares[pos.y][pos.x] = new pieceCodeClasses[pieceAtPos.code]((pieceAtPos.team === 'white') ? 'black' : 'white', this._pieceId)
            }
    }

    areLegalMoves(team: Teams): boolean {
        let pos: Vector = { "x": 0, "y": 0 }
        for (pos.x = 0; pos.x < 8; pos.x++)
            for (pos.y = 0; pos.y < 8; pos.y++) {
                const piece = this._squares[pos.y][pos.x]
                if (piece && piece.team === team && piece.getMoves(pos, this).length)
                    return true
            }
        return false

    }

    inCheck(team: Teams): boolean {
        let pos: Vector = { "x": 0, "y": 0 }
        for (pos.x = 0; pos.x < 8; pos.x++)
            for (pos.y = 0; pos.y < 8; pos.y++) {
                let piece = this._squares[pos.y][pos.x]
                if (piece instanceof King && piece.team === team) {
                    // Now we have the correct King to check
                    const QueenAndRookVectors: Vector[] = [
                        { "x": 0, "y": 1 },
                        { "x": 1, "y": 0 },
                        { "x": 0, "y": -1 },
                        { "x": -1, "y": 0 }
                    ]
                    let pieces = getRayCastVectors(this, QueenAndRookVectors, pos, team).pieces;

                    for (let i = 0; i < pieces.length; i++)
                        if (pieces[i] instanceof Queen || pieces[i] instanceof Rook)
                            return true;

                    const QueenAndBishopVectors: Vector[] = [
                        { "x": 1, "y": 1 },
                        { "x": 1, "y": -1 },
                        { "x": -1, "y": -1 },
                        { "x": -1, "y": 1 }
                    ]
                    pieces = getRayCastVectors(this, QueenAndBishopVectors, pos, team).pieces;

                    for (let i = 0; i < pieces.length; i++)
                        if (pieces[i] instanceof Queen || pieces[i] instanceof Bishop)
                            return true;

                    const knightVectors: Vector[] = [
                        { "x": 2, "y": 1 },
                        { "x": 1, "y": 2 },
                        { "x": 2, "y": -1 },
                        { "x": 1, "y": -2 },
                        { "x": -1, "y": -2 },
                        { "x": -2, "y": -1 },
                        { "x": -2, "y": 1 },
                        { "x": -1, "y": 2 }
                    ]
                    pieces = getVectors(this, knightVectors, pos, team).pieces;

                    for (let i = 0; i < pieces.length; i++)
                        if (pieces[i] instanceof Knight)
                            return true;

                    const kingVectors: Vector[] = [
                        { "x": 0, "y": 1 },
                        { "x": 1, "y": 1 },
                        { "x": 1, "y": 0 },
                        { "x": 1, "y": -1 },
                        { "x": 0, "y": -1 },
                        { "x": -1, "y": -1 },
                        { "x": -1, "y": 0 },
                        { "x": -1, "y": 1 },
                    ]
                    pieces = getVectors(this, kingVectors, pos, team).pieces;

                    for (let i = 0; i < pieces.length; i++)
                        if (pieces[i] instanceof King)
                            return true;

                    let pawnVectors
                    if (team === "white")
                        pawnVectors = [
                            { "x": 1, "y": -1 },
                            { "x": -1, "y": -1 }
                        ]
                    else
                        pawnVectors = [
                            { "x": 1, "y": 1 },
                            { "x": -1, "y": 1 }
                        ]

                    pieces = getVectors(this, pawnVectors, pos, team).pieces;
                    for (let i = 0; i < pieces.length; i++)
                        if (pieces[i] instanceof Pawn)
                            return true;
                }
            }
        return false;
    }

    getPos(position: Vector): PieceAtPos {
        if (position.x < 0 || position.x >= 8 || position.y < 0 || position.y >= 8) return null
        return this._squares[position.y][position.x]
    }

    setPos(position: Vector, piece: PieceAtPos): void {
        this._squares[position.y][position.x] = piece
    }

    static getShortNotation(startPos: Vector, endPos: Vector, moveType: string[], startBoard: Board, append: string, promotionChoice?: PieceCodes): string {
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
                    let pos: Vector = { "x": 0, "y": 0 }
                    for (pos.x = 0; pos.x < 8; pos.x++)
                        for (pos.y = 0; pos.y < 8; pos.y++)
                            if (pos.x !== startPos.x || pos.y !== startPos.y) {
                                const piece = startBoard.getPos(pos)
                                if (piece && piece.team === startingPiece.team && piece.code === startingPiece.code) {
                                    const pieceMoves = piece.getMoves(pos, startBoard)
                                    for (let i = 0; i < pieceMoves.length; i++) {
                                        const currentMove = pieceMoves[i]
                                        if (currentMove.move.x === endPos.x && currentMove.move.y === endPos.y) {
                                            console.log(pos)
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

function convertToChessNotation(position: Vector | number, coord?: 'x' | 'y'): string {
    if (coord) {
        if (coord === 'x') {
            return String.fromCharCode(97 + (position as number))
        } else {
            return (8 - (position as number)).toString()
        }
    } else {
        position = position as Vector
        return String.fromCharCode(97 + position.x) + (8 - position.y);
    }
}

function convertToPosition(notation: string): Vector {
    return { "x": parseInt(notation[0], 36) - 10, "y": 8 - Number(notation[1]) };
}

export { Board as ChessBoard, Game as ChessGame, ChessPiece, King, Queen, Rook, Bishop, Knight, Pawn, convertToChessNotation }