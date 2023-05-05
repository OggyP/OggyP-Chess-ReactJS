import '../css/index.scss';
import '../css/chess.scss';
import '../svg/assets.scss'
import Game from '../game'
import { checkGameMode } from '../helpers/gameModes'
import LoadingPage from './loading';
import checkIfRedirectNeeded from '../helpers/redirect';

function AnalysisPage() {

    checkIfRedirectNeeded()

    const urlParams = new URLSearchParams(window.location.search);
    console.log(window.location.pathname.split('/')[2])
    const gameMode = checkGameMode(window.location.pathname.split('/')[2])

    if (!gameMode) {
        window.location.href = '/analysis/standard' + window.location.search
        return <LoadingPage description='Redirecting' />
    }

    let pgn: string = ''
    let startingFen: string | undefined = undefined
    if (urlParams.has('pgn'))
        pgn = (urlParams.get('pgn') as string).replace(/_/g, ' ')
    if (urlParams.has('fen'))
        startingFen = (urlParams.get('fen') as string).replace(/_/g, ' ')

    if (startingFen)
        pgn = `[FEN "${startingFen}"]\n\n` + pgn

    console.log(pgn)

    return <Game
        team='any'
        viewAs='white'
        resetGameReloads={false}
        allowOverridingMoves={true}
        mode={gameMode}
        allowMoving={true}
        allowPreMoves={false}
        pgn={(pgn.length) ? pgn : undefined}
        pgnAndFenChange={true}
        engineEnabled={{
            atBeginning: true,
            atEnd: true
        }}
    />
}

export default AnalysisPage