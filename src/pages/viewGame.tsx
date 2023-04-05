import React from 'react';
import '../css/index.scss';
import '../css/chess.scss';
import '../svg/assets.scss'
import Game from '../game'
import { Teams } from '../chessLogic';
import ErrorPage from './Error';
import { GameModes } from '../chessLogic/types';
import Loading from '../pages/loading';
import { apiURL } from '../settings';

interface ViewGameProps {
}

interface ViewGameState {
    PGN: string | null
    error: null | JSX.Element
    termination: string
    gameMode: string | undefined
}

class ViewGame extends React.Component<ViewGameProps, ViewGameState>{

    gameId: number;
    urlParams = new URLSearchParams(window.location.search);

    constructor(props: ViewGameProps) {
        super(props)

        this.gameId = Number(window.location.pathname.split('/')[2]);

        if (isNaN(this.gameId)) window.location.href = '/home'

        this.state = {
            PGN: null,
            error: null,
            termination: 'Unknown',
            gameMode: undefined
        }

        let response = fetch(apiURL + "games/view/" + this.gameId, {
            method: 'GET',
        })

        response.then(async (rawData) => {
            const text = await rawData.text()
            try {
                const data = JSON.parse(text)
                console.log(data.pgn)
                this.setState({
                    PGN: data.pgn,
                    termination: data.reason,
                    gameMode: data.gameMode
                })
            } catch {
                this.setState({
                    error: <ErrorPage
                        title='Unknown Game'
                        description={text}
                    />
                })
            }
        })
    }

    render() {
        let viewAs: Teams | 'any' = 'any'
        const viewAsFromURL = this.urlParams.get('viewAs')
        if (viewAsFromURL === 'white' || viewAsFromURL === 'black' || viewAsFromURL === 'any')
            viewAs = viewAsFromURL
        if (this.state.error)
            return this.state.error
        if (this.state.PGN)
            return <Game
                pgn={this.state.PGN}
                team={viewAs}
                allowOverridingMoves={false}
                termination={this.state.termination}
                allowMoving={false}
                allowPreMoves={false}
                mode={this.state.gameMode as GameModes}
            />
        else
            return <Loading description={'Loading Game ' + this.gameId} />
    }
}

export default ViewGame