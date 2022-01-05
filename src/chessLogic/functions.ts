import Board from './board'
import { Teams, Vector, MovesAndBoard, PieceAtPos, VectorsAndPieces } from './types'
import { ChessPiece, Pawn } from './pieces'

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


export { getRayCastVectors, getVectors, legal, addVectorsAndCheckPos, convertToChessNotation, convertToPosition }