import '../css/index.scss';
import '../css/chess.scss';
import '../svg/assets.css'
import Game from '../game'

function StockfishGame() {
  return <Game
    team='white'
    allowMoving={true}
    allowPreMoves={true}
    versusStockfish={20}
  />
}

export default StockfishGame