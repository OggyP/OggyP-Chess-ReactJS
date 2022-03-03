import React, { useState } from 'react'
import { Vector } from '../chessLogic/types';
import { convertToPosition, VecSame } from '../chessLogic/functions';
import { Arrow } from './custom-svgs';

function EngineBestMove(props: { notFlipped: boolean; boxSize: number }) {
  const [bestMoves, setBestMoves] = useState<({
    startingPos: Vector
    endingPos: Vector
  } | null)[]>([]);

  React.useEffect(() => {
    const handleEngineOutput = (event: any) => {
      const info = event.detail
      if (info[0].score) {
        const bestMoves = info.map((item: any, index: number) => {
          if (item.pv) {
            const pvMoves = item.pv.split(' ')
            if (pvMoves.length) {
              const move = pvMoves[0]
              return {
                startingPos: {
                  'x': convertToPosition(move[0], 'x') as number,
                  'y': convertToPosition(move[1], 'y') as number
                },
                endingPos: {
                  'x': convertToPosition(move[2], 'x') as number,
                  'y': convertToPosition(move[3], 'y') as number
                }
              }
            } else
              return null
          } else {
            return null
          }
        })
        setBestMoves(bestMoves)
      } else if (info.startingPos.x && (!bestMoves[0] ||
        !VecSame(info.startingPos, bestMoves[0].startingPos) ||
        !VecSame(info.endingPos, bestMoves[0].endingPos))) {
        const bestMovesList = bestMoves.slice()
        bestMovesList[0] = info
        setBestMoves(bestMovesList)
      }
    };

    document.addEventListener('engine', handleEngineOutput);

    // cleanup this component
    return () => {
      document.removeEventListener('engine', handleEngineOutput);
    };
  }, [bestMoves]);

  if (bestMoves.length) {
    const BestMoveArrows = bestMoves.map((item, index) => {
      if (!item) return null
      for (let i = 0; i < index; i++) {
        const checkEngineMove = bestMoves[i]
        if (!checkEngineMove) continue
        if (VecSame(item.startingPos, checkEngineMove.startingPos) && VecSame(item.endingPos, checkEngineMove.endingPos))
          return null
      }
      return <Arrow
        key={index}
        strokeWidth={0.20 - (index * 0.05)}
        opacity={0.5 - (index * 0.15)}
        colour={(index === 0) ? 'purple' : 'blue'}
        notFlipped={props.notFlipped}
        start={item.startingPos}
        end={item.endingPos} />
    })
    return <g>
      {BestMoveArrows}
    </g>
  }
  return null
}

export default EngineBestMove