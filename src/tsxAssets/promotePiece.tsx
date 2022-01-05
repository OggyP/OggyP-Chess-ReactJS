import React from 'react';
import { Teams } from '../chessLogic'

interface PromotePieceProps {
  type: string
  team: Teams
  x: number
  y: number
  onClick: React.MouseEventHandler<HTMLDivElement>
}
function PromotePiece(props: PromotePieceProps) {
  const classes = `piece ${(props.team === 'white') ? "l" : "d"} ${props.type}`;
  return (
    <div className='square' style={{ "top": props.y + "%", "left": props.x + "%" }}>
      <div onClick={props.onClick} className={classes}>
      </div>
    </div>
  )
}

export default PromotePiece