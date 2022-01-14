import Square from './square'
import React, { useState } from 'react'
import { Vector } from '../chessLogic/types';
import { convertToPosition } from '../chessLogic/functions';

function EngineBestMove(props: { notFlipped: boolean }) {
  const [bestMove, setBestMove] = useState<{
    startingPos: Vector
    endingPos: Vector
  } | null>(null);



  React.useEffect(() => {
    const handleEngineOutput = (event: any) => {
      const info = event.detail
      console.log(info)
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
          console.log('set to null')
          setBestMove(null)
        }
      } else if (info.startingPos.x && (!bestMove ||
        info.startingPos.x !== bestMove.startingPos.x ||
        info.startingPos.y !== bestMove.startingPos.y ||
        info.endingPos.x !== bestMove.endingPos.x ||
        info.endingPos.y !== bestMove.endingPos.y)) {
        console.log('set to val non score')
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
    return <div id="best-move">
      <Square
        classes={['from']}
        pos={bestMove.startingPos}
        notFlipped={props.notFlipped}
      />
      <Square
        classes={['to']}
        pos={bestMove.endingPos}
        notFlipped={props.notFlipped}
      />
    </div>
  }
  return null
}

export default EngineBestMove