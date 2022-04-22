import Board from './board'
import { Teams, Vector, MovesAndBoard, PieceAtPos, VectorsAndPieces, PieceCodes } from './types'
import { ChessPiece, Pawn, pieceCodesArray, piecePoints } from './pieces'

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
                    "moveType": ["capture", currentPiece.code]
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
                    "moveType": ["capture", currentPiece.code]
                })
            }
        }
    }
    return {
        "pieces": collidedPieces,
        "vectors": validVectors
    };
}

function legal(this: ChessPiece, value: MovesAndBoard): boolean {
    if (this instanceof Pawn || value.moveType.includes('capture')) value.board.halfMovesSinceCaptureOrPawnMove = 0
    else value.board.halfMovesSinceCaptureOrPawnMove++
    if (value.moveType.includes('capture')) {
        for (let i = 0; i < value.moveType.length; i++)
            if (pieceCodesArray.includes(value.moveType[i] as PieceCodes))
                value.board.capturedPieces[value.board.getTurn('next')].push(value.moveType[i] as PieceCodes)
    }
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

function convertToPosition(notation: string, coord?: 'x' | 'y'): Vector | number {
    if (!coord)
        return { "x": parseInt(notation[0], 36) - 10, "y": 8 - Number(notation[1]) };
    else
        if (coord === 'x')
            return parseInt(notation, 36) - 10
        else
            return 8 - Number(notation)
}

function VecSame(v1: Vector, v2: Vector) {
    return (v1.x === v2.x && v1.y === v2.y)
}

function arrayToCountObj(array: any[]) {
    let counts: any = {}
    for (let i = 0; i < array.length; i++) {
        const item = array[i]
        if (counts[item])
            counts[item]++
        else
            counts[item] = 1
    }
    return counts
}

function cancelOutCapturedMaterial(p1: PieceCodes[], p2: PieceCodes[]) {
    let materialP1 = arrayToCountObj(p1)
    let materialP2 = arrayToCountObj(p2)

    let checkedPieces = []

    for (let item in materialP1) {
        if (materialP2[item]) {
            let minSame = Math.min(materialP1[item], materialP2[item])
            materialP1[item] -= minSame
            materialP2[item] -= minSame
        }
        checkedPieces.push(item)
    }

    materialP1.points = 0
    materialP2.points = 0

    for (let item in materialP1)
        if (item !== 'points')
            materialP1.points += materialP1[item] * piecePoints[item as PieceCodes]

    for (let item in materialP2)
        if (item !== 'points')
            materialP2.points += materialP2[item] * piecePoints[item as PieceCodes]

    console.log(materialP1.points)

    let minPoints = Math.min(materialP1.points, materialP2.points)
    materialP1.points -= minPoints
    materialP2.points -= minPoints

    return {
        white: materialP1,
        black: materialP2
    }
}

export { getRayCastVectors, getVectors, legal, addVectorsAndCheckPos, convertToChessNotation, convertToPosition, VecSame, cancelOutCapturedMaterial }