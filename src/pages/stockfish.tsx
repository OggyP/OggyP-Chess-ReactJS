import '../css/index.scss';
import '../css/chess.scss';
import '../svg/assets.scss'
import Game from '../game'
import { useState } from 'react';

function StockfishGame() {
  const [difficulty, setDifficulty] = useState<number>(5);
  const [fastGame, setFastGame] = useState<boolean>(true);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  if (gameStarted)
    return <Game
      team='white'
      mode={'standard'}
      allowMoving={true}
      allowPreMoves={true}
      versusStockfish={{
        skill: difficulty,
        fastGame: fastGame
      }}
      players={{
        white: {
          username: 'You',
          rating: 0
        },
        black: {
          username: 'Stockfish Level ' + difficulty,
          rating: 0
        }
      }}
    />
  return <div className='full-screen-menu'>
    <h2>Choose Stockfish Difficulty</h2>
    <h3>Level {difficulty}</h3>
    <input type="range" min="0" max="20" defaultValue={5} id="stockfish-slider" onChange={(event) => setDifficulty(event.currentTarget.valueAsNumber)} />
    {(difficulty >= 15) ?
      (fastGame) ?
        <button onClick={() => setFastGame(false)}>Disable Fast Stockfish Moving</button> :
        <button onClick={() => setFastGame(true)}>Enable Fast Stockfish Moving</button>
      : null
    }
    <br />
    <br />
    <button onClick={() => setGameStarted(true)}>Play</button>
  </div>
}

export default StockfishGame