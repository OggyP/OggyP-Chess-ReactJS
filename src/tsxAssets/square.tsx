import { Vector } from '../chessLogic'

interface SquareProps {
  pos: Vector,
  classes: string[]
  notFlipped: boolean
}
function Square(props: SquareProps) {
  return <div className={'square ' + props.classes.join(' ')} style={{
    "top": ((props.notFlipped) ? props.pos.y : (7 - props.pos.y)) * 12.5 + "%",
    "left": ((props.notFlipped) ? props.pos.x : (7 - props.pos.x)) * 12.5 + "%",
  }}></div>
}

export default Square