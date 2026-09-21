'use client'

import '../css/index.scss';
import '../css/chess.scss';
import '../svg/assets.scss'
import Game from '../game'
import { checkGameMode } from '../helpers/gameModes'
import LoadingPage from './loading';
import checkIfRedirectNeeded from '../helpers/redirect';

interface AnalysisPageProps {
    mode: string
    pgn?: string | null
    fen?: string | null
}

function AnalysisPage({ mode, pgn: pgnParam, fen: fenParam }: AnalysisPageProps) {

    checkIfRedirectNeeded()

    const gameMode = checkGameMode(mode)

    if (!gameMode) {
        window.location.href = '/analysis/standard' + window.location.search
        return <LoadingPage description='Redirecting' />
    }

    let pgn: string = ''
    let startingFen: string | undefined = undefined
    if (pgnParam)
        pgn = pgnParam.replace(/_/g, ' ')
    if (fenParam)
        startingFen = fenParam.replace(/_/g, ' ')

    if (startingFen)
        pgn = `[FEN "${startingFen}"]\n\n` + pgn

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
