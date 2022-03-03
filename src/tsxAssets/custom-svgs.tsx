// How lichess does it
//<line stroke="#15781B" stroke-width="0.15625" stroke-linecap="round" marker-end="url(#arrowhead-g)" opacity="1" x1="0.5" y1="0.5" x2="0.5" y2="-0.1875" cgHash="824,824,e4,e5,green,true"></line>
//<circle stroke="#15781B" stroke-width="0.0625" fill="none" opacity="1" cx="-3.5" cy="0.5" r="0.46875" cgHash="824,824,a4,green"></circle>

import { Vector } from '../chessLogic'

interface ArrowProps {
  start: Vector
  end: Vector
  notFlipped: boolean
  colour: 'green' | 'blue' | 'green-drag' | 'purple'
  strokeWidth?: number
  opacity?: number
}

const colourToHex = {
  green: '#15781b',
  blue: '#003088',
  purple: '#b500ff',
  'green-drag': '#15781b'
  
}

function Arrow(props: ArrowProps) {
  return (
    <line
      stroke={colourToHex[props.colour]}
      strokeWidth={(!props.strokeWidth) ? 0.15625 : props.strokeWidth}
      strokeLinecap="round"
      markerEnd={'url(#arrowhead-' + props.colour[0] + ')'}
      opacity={(!props.opacity) ? 0.5 : props.opacity}

      x1={((props.notFlipped) ? props.start.x : 7 - props.start.x) + 0.5}
      y1={((props.notFlipped) ? props.start.y : 7 - props.start.y) + 0.5}

      x2={((props.notFlipped) ? props.end.x : 7 - props.end.x) + 0.5}
      y2={((props.notFlipped) ? props.end.y : 7 - props.end.y) + 0.5}
    />
  )
}

interface CircleProps {
  pos: Vector
  notFlipped: boolean
  colour: 'green' | 'blue' | 'green-drag' | 'purple'
  strokeWidth?: number
}
function Circle(props: CircleProps) {
  return (
    <circle stroke={colourToHex[props.colour]} strokeWidth={(!props.strokeWidth) ? 0.0625 : props.strokeWidth} fill="none" opacity="0.5"
      r="0.46875"
      cx={((props.notFlipped) ? props.pos.x : 7 - props.pos.x) + 0.5}
      cy={((props.notFlipped) ? props.pos.y : 7 - props.pos.y) + 0.5}
    />
  )
}

export { Arrow, Circle }