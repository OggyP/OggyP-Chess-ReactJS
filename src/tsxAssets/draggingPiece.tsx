import { Teams, Vector } from "../chessLogic"
import { useEffect, useState } from 'react';
import { fromEvent } from 'rxjs'
import { map, throttleTime } from 'rxjs/operators'

interface DragProps {
  type: string
  team: Teams
  startingMousePos: Vector
  halfBoxSize: number
  text?: number
}
function DraggedPiece(props: DragProps) {
  const [position, setPosition] = useState({ "x": props.startingMousePos.x - props.halfBoxSize, "y": props.startingMousePos.y - props.halfBoxSize })

  const mainBoard = document.getElementById("main-board")
  const bounds = (mainBoard as HTMLElement).getBoundingClientRect();

  useEffect(() => {
    const sub = fromEvent(document, 'mousemove').pipe(
      throttleTime(10), // Only respond to a mousemove event every 10ms
      map((event: any) => [event.clientX, event.clientY])
    )
      .subscribe(([newX, newY]) => {
        setPosition({ "x": newX - bounds.left - props.halfBoxSize, "y": newY - bounds.top - props.halfBoxSize })
      })

    return () => {
      sub.unsubscribe()
    }
  }, [mainBoard, bounds, props.halfBoxSize])

  const classes = `piece ${(props.team === 'white') ? "l" : "d"} ${props.type}`;
  return (
    <div className={classes} style={{
      "transform": `translate(${position.x}px, ${position.y}px)`,
    }}>
      {props.text}
    </div>
  )
}

export default DraggedPiece