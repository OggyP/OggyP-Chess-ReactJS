import '../css/index.scss';
import '../css/chess.scss';
import '../svg/assets.css'
import Game from '../game'

console.info("OggyP is awesome!")

const pawnPGN =
  '[Event "Online Match"]\n' +
  '[Site "https://chess.oggyp.com"]\n' +
  '[Date "2022.0.9"]\n' +
  '[Round "?"]\n' +
  '[White "?"]\n' +
  '[Black "?"]\n' +
  '[Result "*"]\n' +
  '[Variant "Standard"]\n' +
  '[TimeControl "-"]\n' +
  '[ECO "C20"]\n' +
  '[Opening "King\'s Pawn Game: Beyer Gambit"]\n' +
  '\n' +
  '1. e4 e5 2. d4 d5 3. c4 c5 4. exd5 cxd4 5. f4 e4 6. Nf3 exf3 7. g4 f2+ 8. Ke2 d3+ 9. Kxd3 f5 10. Bh3 f1=N 11. gxf5 Ne3'

function AnalysisPage() {
  return <Game
    pgn={pawnPGN}
    team='any'
  />
}

export default AnalysisPage