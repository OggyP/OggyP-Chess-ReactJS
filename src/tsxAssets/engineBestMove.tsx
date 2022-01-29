import Square from './square'
import React, { useState } from 'react'
import { Vector } from '../chessLogic/types';
import { convertToPosition } from '../chessLogic/functions';
import { Arrow } from './custom-svgs';

function EngineBestMove(props: { notFlipped: boolean; boxSize: number }) {
  const [bestMove, setBestMove] = useState<{
    startingPos: Vector
    endingPos: Vector
  } | null>(null);



  React.useEffect(() => {
    const handleEngineOutput = (event: any) => {
      const info = event.detail
      if (info.score) {
        if (info.pv) {
          const pvMoves = info.pv.split(' ')
          if (pvMoves.length) {
            const move = pvMoves[0]
            setBestMove({
              startingPos: {
                'x': convertToPosition(move[0], 'x') as number,
                'y': convertToPosition(move[1], 'y') as number
              },
              endingPos: {
                'x': convertToPosition(move[2], 'x') as number,
                'y': convertToPosition(move[3], 'y') as number
              }
            })
          }
        } else {
          setBestMove(null)
        }
      } else if (info.startingPos.x && (!bestMove ||
        info.startingPos.x !== bestMove.startingPos.x ||
        info.startingPos.y !== bestMove.startingPos.y ||
        info.endingPos.x !== bestMove.endingPos.x ||
        info.endingPos.y !== bestMove.endingPos.y)) {
        setBestMove(info)
      }
    };

    document.addEventListener('engine', handleEngineOutput);

    // cleanup this component
    return () => {
      document.removeEventListener('engine', handleEngineOutput);
    };
  }, [bestMove]);

  if (bestMove) {
    return <Arrow
      start={bestMove.startingPos}
      end={bestMove.endingPos}
      colour='blue'
      notFlipped={props.notFlipped}
    />
  }
  return null
}

export default EngineBestMove