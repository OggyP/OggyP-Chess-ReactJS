import '../css/index.scss';
import '../css/chess.scss';
import '../svg/assets.css'
import Game from '../game'

console.info("OggyP is awesome!")

function AnalysisPage() {

  const urlParams = new URLSearchParams(window.location.search);

  let pgn: string | undefined = undefined
  if (urlParams.has('pgn'))
    pgn = (urlParams.get('pgn') as string).replace(/_/g, ' ')

  return <Game
    team='any'
    allowMoving={true}
    allowPreMoves={false}
    pgn={pgn}
    canSharePGN={true}
  />
}

export default AnalysisPage