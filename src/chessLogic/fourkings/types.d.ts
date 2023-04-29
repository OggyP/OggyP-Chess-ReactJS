import Board from './board'
import { ChessPiece } from './pieces'

type PieceCodes = 'p' | 'r' | 'n' | 'b' | 'q' | 'k';
type Teams = 'white' | 'black';
type PieceAtPos = ChessPiece | null


interface Vector {
    x: number;
    y: number;
}

interface BoardPos {
    x: number
    y: number
    seg?: number
}

interface MovesAndBoard {
    move: Vector,
    board: Board,
    moveType: string[],
    displayVector?: Vector
}

interface VectorsAndPieces {
    pieces: ChessPiece[];
    vectors: MovesAndBoard[];
}

export type { PieceCodes, BoardPos, Teams, Vector, MovesAndBoard, PieceAtPos, VectorsAndPieces }