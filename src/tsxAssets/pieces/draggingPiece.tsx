import { pieceStyle, Teams, Vector } from "../../chessLogic"
import { useEffect, useState } from 'react';
import { fromEvent } from 'rxjs'
import { map, throttleTime } from 'rxjs/operators'
import { pieceTypeToName, pieceImageType } from './pieceInfo'
import { PieceCodes } from '../../chessLogic'

interface DragProps {
    type: PieceCodes
    team: Teams
    startingMousePos: Vector
    halfBoxSize: number
    style: pieceStyle
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
        <img className={classes} style={{
            "transform": `translate(${position.x}px, ${position.y}px)`,
        }}
        alt={props.text?.toString()}
        src={'/assets/images/svg/' + props.style + '/' + props.team + " " + pieceTypeToName[props.type] + '.' + pieceImageType[props.style]}
        />
    )
}

export default DraggedPiece