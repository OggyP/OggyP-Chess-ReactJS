import React from 'react';
import { checkForToken } from '../helpers/getToken';
import Game from '../game';
import { Teams } from '../chessLogic/types';
import LoadingPage from './loading';
import ErrorPage from './Error';
import { wsURL } from '../settings';

type gameModesType = 'standard' | '960'

interface gameOptions {
    mode: gameModesType,
    time: {
        base: number,
        increment: number
    }
}

interface PlayerInfo {
    userId?: number,
    username: string,
    createdAt?: Date,
    wins?: number,
    draws?: number,
    gamesPlayed?: number,
    rating: number,
    gameIds?: string,
    ratingDeviation?: number,
    title?: string,
    ratingChange?: number
}


interface SpectateGameProps {
}

interface SpectateGameState {
    error: null | {
        title: string,
        description: string
    }
    game: JSX.Element | null
}

interface gameFoundInfo extends gameOptions {
    pgn: string
    white: PlayerInfo
    black: PlayerInfo
}

class SpectateGame extends React.Component<SpectateGameProps, SpectateGameState>{

    ws: WebSocket | undefined
    token = checkForToken()
    doMove: Function | null = null
    ownTeam: Teams | null = null
    updateTimer: Function | null = null
    serverGameOver: Function | null = null
    setSpectators: Function | null = null

    constructor(props: SpectateGameProps) {
        super(props)

        this.state = {
            game: null,
            error: null
        }

        const match = window.location.pathname.match(/\/spectate\/(?<game>[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12})/);
        if (!match || !match.groups) {
            document.location.href = '/home';
            return
        }

        const gameId = match.groups.game;

        if (!this.token) {
            document.location.href = '/login/?ref=' + document.location.pathname + document.location.search;
            return
        }

        const serverGameOverTypes = ['resignation', 'timeout', 'game abandoned']
        const establishWS = () => {
            const wsConnectionURL = `${wsURL}spectate/${gameId}/?token=${this.token?.token}&userId=${this.token?.userId}`
            this.ws = new WebSocket(wsConnectionURL)

            let cancelReconnection = false

            this.ws.onmessage = (message) => {
                if (!this.ws)
                    throw new Error("Why is this.ws undefined?!")
                const event = JSON.parse(message.data)
                const data: any = event.data
                console.log(event)
                switch (event.type) {
                    case 'error':
                        this.setState({
                            error: data
                        })
                        break;
                    case 'game':
                        this.gameFound(data)
                        break;
                    case 'move':
                        if (!this.state.game) throw new Error("Recieved move before game start");
                        if (!this.doMove) throw new Error("Do move function is null");
                        const startingPos = { 'x': data.startingPos[0], 'y': data.startingPos[1] }
                        const endingPos = { 'x': data.endingPos[0], 'y': data.endingPos[1] }
                        if (!data.promote)
                            this.doMove(startingPos, endingPos)
                        else
                            this.doMove(startingPos, endingPos, data.promote[0])
                        if (this.updateTimer && data.timer) {
                            this.updateTimer(
                                { // white
                                    startTime: (new Date()).getTime(),
                                    time: data.timer.whiteTimer.time,
                                    countingDown: data.timer.whiteTimer.isCountingDown
                                },
                                { // black
                                    startTime: (new Date()).getTime(),
                                    time: data.timer.blackTimer.time,
                                    countingDown: data.timer.blackTimer.isCountingDown
                                }
                            )
                        }
                        break;
                    case 'gameOver':
                        if (serverGameOverTypes.includes(data.by)) {
                            if (!this.serverGameOver) throw new Error("Server Game Over in play.tsx is null");
                            this.serverGameOver(data.winner, data.by, data.info)                            
                        }
                        window.history.pushState('OggyP Chess View Game', 'View Game', window.location.origin + '/viewGame/' + data.gameId);
                        break
                    case 'timerUpdate':
                        if (this.updateTimer)
                            this.updateTimer(
                                {
                                    startTime: (new Date()).getTime(),
                                    time: data.whiteTimer.time,
                                    countingDown: data.whiteTimer.isCountingDown
                                },
                                {
                                    startTime: (new Date()).getTime(),
                                    time: data.blackTimer.time,
                                    countingDown: data.blackTimer.isCountingDown
                                }
                            )
                        break
                    case 'spectators':
                        if (this.setSpectators)
                            this.setSpectators(data)
                        break
                }
            }

            this.ws.onclose = () => {
                console.log("Web socket Closed")
                if (!cancelReconnection)
                    setTimeout(establishWS, 2000);
            }

            this.ws.onerror = (error) => {
                console.log("Web socket error!")
                console.error(error)
                cancelReconnection = true
                this.setState({
                    error: {
                        title: "Connection Issues!",
                        description: `Lost connect to the OggyP Chess Web Socket\nSocket URL: ${wsConnectionURL}`
                    }
                })
                window.location.href = '/home'
            }

            this.ws.onopen = () => {
                console.log("Web Socket Connected")
                cancelReconnection = false
            }
        }

        establishWS()
    }

    gameFound(game: gameFoundInfo) {
        this.setState({
            game: <Game
                team={'none'}
                viewAs={'white'}
                mode={game.mode}
                pgn={game.pgn}
                allowOverridingMoves={false}
                resetGameReloads={true}
                multiplayerWs={this.ws}
                onMounted={(callbacks: Function) => this.gameMounted(callbacks)}
                players={{
                    white: game.white,
                    black: game.black
                }}
                allowMoving={true}
                allowPreMoves={true}
                engineEnabled={{
                    atBeginning: true,
                    atEnd: true
                }}
            />
        })
    }

    gameMounted(callbacks: any) {
        this.doMove = callbacks.doMove
        this.updateTimer = callbacks.updateTimer
        this.serverGameOver = callbacks.gameOver
        this.setSpectators = callbacks.setSpectators
    }

    regainedFocus() {
        if (!document.hidden) {
            console.log('Focus!')
            if (this.state.error)
                window.location.reload()
        }
    }

    componentDidMount(): void {
        document.addEventListener('visibilitychange', this.regainedFocus.bind(this));
    }

    componentWillUnmount(): void {
        window.removeEventListener("visibilitychange", this.regainedFocus.bind(this));
    }

    render() {
        if (this.state.error)
            return <ErrorPage
                title={this.state.error.title}
                description={this.state.error.description}
            />
        else if (this.state.game)
            return this.state.game
        else
            return <LoadingPage description='Connecting to OggyP Chess Web Socket' />
    }
}

export default SpectateGame