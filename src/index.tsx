import ReactDOM from 'react-dom';
import './css/index.scss';
import './css/chess.scss';
import './svg/assets.css'
import Game from './game'

console.info("OggyP is awesome!")

ReactDOM.render(
  <Game
    startingPosition='rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'
    team='any'
  />,
  document.getElementById('root')
);