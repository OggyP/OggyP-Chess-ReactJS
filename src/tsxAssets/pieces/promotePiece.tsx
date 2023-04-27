import React from 'react';
import { pieceStyle, Teams } from '../../chessLogic'
import { pieceImageType, pieceTypeToName } from './pieceInfo'
import { PieceCodes } from '../../chessLogic'

interface PromotePieceProps {
    type: PieceCodes
    team: Teams
    x: number
    y: number
    style: pieceStyle
    onClick: React.MouseEventHandler<HTMLDivElement>
}
function PromotePiece(props: PromotePieceProps) {
    const classes = `piece ${(props.team === 'white') ? "l" : "d"} ${props.type}`;
    return (
        <div className='square' style={{ "top": props.y + "%", "left": props.x + "%" }}>
            <img onClick={props.onClick} className={classes}
                alt={pieceTypeToName[props.type]}
                src={'/assets/images/svg/' + props.style + '/' + props.team + " " + pieceTypeToName[props.type] + '.' + pieceImageType[props.style]}
            />
        </div>
    )
}

export default PromotePiece