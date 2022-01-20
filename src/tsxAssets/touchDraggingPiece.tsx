import { Teams, Vector } from "../chessLogic"
import { useEffect, useState } from 'react';
import { fromEvent } from 'rxjs'
import { map, tap, throttleTime } from 'rxjs/operators'

interface DragProps {
  type: string
  team: Teams
  startingMousePos: Vector
  halfBoxSize: number
  text?: number
}
function TouchDraggedPiece(props: DragProps) {
  const [position, setPosition] = useState({ "x": props.startingMousePos.x - props.halfBoxSize * (20 / 12.5), "y": props.startingMousePos.y - props.halfBoxSize * 3 })

  const mainBoard = document.getElementById("main-board")
  const bounds = (mainBoard as HTMLElement).getBoundingClientRect();

  useEffect(() => {
    const sub = fromEvent(document, 'touchmove', { passive: false }).pipe(
      tap(event => event.preventDefault()),
    ).pipe(
      throttleTime(10), // Only respond to a mousemove event every 10ms
      // tap(event => event.preventDefault()),
      map((event: any) => [event.touches[0].clientX, event.touches[0].clientY])
    )
      .subscribe(([newX, newY]) => {
        setPosition({ "x": newX - bounds.left - props.halfBoxSize * (20 / 12.5), "y": newY - bounds.top - props.halfBoxSize * 3 })
      })

    return () => {
      sub.unsubscribe()
    }
  }, [mainBoard, bounds, props.halfBoxSize])

  const classes = `piece ${(props.team === 'white') ? "l" : "d"} ${props.type} mobile-drag`;
  return (
    <div className={classes} style={{
      "transform": `translate(${position.x}px, ${position.y}px)`,
    }}>
      {props.text}
    </div>
  )
}

export default TouchDraggedPiece