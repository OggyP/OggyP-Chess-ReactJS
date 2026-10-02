'use client'

import React from 'react';
import '../css/index.scss';
import '../css/chess.scss';
import '../svg/assets.scss'
import Game from '../game'
import { Teams } from '../chessLogic/chessLogic';
import ErrorPage from './Error';
import { GameModes } from '../chessLogic/types';
import Loading from './loading';
import { apiURL } from '../settings';
import { ChatMessage } from '../tsxAssets/gameChat';
import { parsePlayerName } from '../helpers/playerName';

interface ViewGameProps {
    gameId: string
    viewAs?: string | null
}

interface PlayerInfo {
    username: string
    rating: number
    title?: string
    ratingChange?: number
}

interface ViewGameState {
    PGN: string | null
    error: null | React.ReactElement
    termination: string
    gameMode: string | undefined
    messages: ChatMessage[]
    players: {
        white: PlayerInfo
        black: PlayerInfo
    } | null
}

function playerFromApi(rawName: string, rating?: number, ratingChange?: number): PlayerInfo {
    const { title, username } = parsePlayerName(rawName)
    return {
        title,
        username,
        rating: typeof rating === 'number' ? rating : 0,
        ratingChange: typeof ratingChange === 'number' ? ratingChange : undefined,
    }
}

class ViewGame extends React.Component<ViewGameProps, ViewGameState>{

    gameId: number;
    private cancelled = false

    constructor(props: ViewGameProps) {
        super(props)

        this.gameId = Number(props.gameId);

        if (isNaN(this.gameId)) window.location.href = '/home'

        this.state = {
            PGN: null,
            error: null,
            termination: 'Unknown',
            gameMode: undefined,
            messages: [],
            players: null,
        }
    }

    componentDidMount() {
        this.cancelled = false
        fetch(apiURL + "games/view/" + this.gameId, {
            method: 'GET',
        }).then(async (rawData) => {
            const text = await rawData.text()
            if (this.cancelled) return
            try {
                const data = JSON.parse(text)
                console.log(data.pgn)
                this.setState({
                    PGN: data.pgn,
                    termination: data.gameOverReason,
                    gameMode: data.gameMode,
                    messages: Array.isArray(data.messages) ? data.messages : [],
                    players: {
                        white: playerFromApi(data.white, data.whiteRating, data.whiteRatingChange),
                        black: playerFromApi(data.black, data.blackRating, data.blackRatingChange),
                    },
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

    componentWillUnmount() {
        this.cancelled = true
    }

    render() {
        let viewAs: Teams = 'white'
        const viewAsFromURL = this.props.viewAs
        if (viewAsFromURL === 'white' || viewAsFromURL === 'black')
            viewAs = viewAsFromURL
        if (this.state.error)
            return this.state.error
        if (this.state.PGN)
            return <Game
                resetGameReloads={true}
                pgn={this.state.PGN}
                team='any'
                viewAs={viewAs}
                allowOverridingMoves={true}
                termination={this.state.termination}
                allowMoving={false}
                allowPreMoves={false}
                mode={this.state.gameMode as GameModes}
                players={this.state.players || undefined}
                engineEnabled={{
                    atBeginning: true,
                    atEnd: true
                }}
                initialChatMessages={this.state.messages}
                chatReplay={true}
            />
        else
            return <Loading description={'Loading Game ' + this.gameId} />
    }
}

export default ViewGame
