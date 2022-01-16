import { Vector } from '../chessLogic'

interface SquareProps {
  pos: Vector,
  classes: string[],
  boxSize: number
  notFlipped: boolean
}

function Square(props: SquareProps) {
  return <div className={'square ' + props.classes.join(' ')} style={{
    "top": ((props.notFlipped) ? props.pos.y : (7 - props.pos.y)) * props.boxSize + "px",
    "left": ((props.notFlipped) ? props.pos.x : (7 - props.pos.x)) * props.boxSize + "px",
  }}></div>
}

export default Square