import { Teams } from '../chessLogic'

interface PieceProps {
  type: string
  team: Teams
  x: number
  y: number
  showAnimation: boolean
  isGhost: boolean
  text?: string
}
function Piece(props: PieceProps) {
  const classes = `piece ${(props.team === 'white') ? "l" : "d"} ${props.type}${(props.showAnimation) ? " ani" : ""}${(props.isGhost) ? " ghost" : ""}`;
  return (
    <div className={classes} style={{
      "transform": `translate(${props.x}px, ${props.y}px)`,
    }}>
      {props.text}
    </div>
  )
}

export default Piece;