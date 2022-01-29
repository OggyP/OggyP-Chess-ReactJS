import { ChessBoard } from '../chessLogic'
import {ChessPiece} from './pieces'

type PieceCodes = 'p' | 'r' | 'n' | 'b' | 'q' | 'k';
type Teams = 'white' | 'black';
type PieceAtPos = ChessPiece | null

interface Vector {
    x: number;
    y: number;
}

interface MovesAndBoard {
    move: Vector,
    board: ChessBoard,
    moveType: string[],
    displayVector?: Vector
}

interface VectorsAndPieces {
    pieces: ChessPiece[];
    vectors: MovesAndBoard[];
}

export type { PieceCodes, Teams, Vector, MovesAndBoard, PieceAtPos, VectorsAndPieces }