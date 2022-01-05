import { Vector } from '../chessLogic'

interface SquareProps {
  pos: Vector,
  classes: string[]
}
function Square(props: SquareProps) {
  return <div className={'square ' + props.classes.join(' ')} style={{
    "top": props.pos.y * 12.5 + "%",
    "left": props.pos.x * 12.5 + "%",
  }}></div>
}

export default Square