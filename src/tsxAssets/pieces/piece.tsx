import { pieceStyle, Teams } from '../../chessLogic'
import { pieceImageType, pieceTypeToName } from './pieceInfo'
import { PieceCodes } from '../../chessLogic'

interface PieceProps {
    type: PieceCodes
    team: Teams
    x: number
    y: number
    showAnimation: boolean
    isGhost: boolean
    style: pieceStyle
    text?: string
}
function Piece(props: PieceProps) {
    const classes = `piece ${(props.team === 'white') ? "l" : "d"} ${props.type}${(props.showAnimation) ? " ani" : ""}${(props.isGhost) ? " ghost" : ""}`;
    return (
        <img className={classes} style={{
            "transform": `translate(${props.x}px, ${props.y}px)`,
        }}
        alt={props.text}
        src={'/assets/images/svg/' + props.style + '/' + props.team + " " + pieceTypeToName[props.type] + '.' + pieceImageType[props.style]}
        />
    )
}

export default Piece;