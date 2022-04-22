import { Teams, Vector, MovesAndBoard, PieceCodes } from '../types'
import  Board from './board'

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



export default ChessPiece