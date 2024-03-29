import React from 'react';
import { checkForToken } from '../helpers/getToken';
import Game from '../game';
import { Teams } from '../chessLogic/types';
import LoadingPage from './loading';
import ErrorPage from './Error';
import { wsURL } from '../settings';
import { GameModes } from '../chessLogic/types';
import {gameModeToName} from '../helpers/gameModes'

function leavePage(event: BeforeUnloadEvent) {
    event.returnValue = `You are still in game, are you sure you want to leave?`;
}

interface gameOptions {
    mode: GameModes,
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


interface PlayGameProps {
}

interface PlayGameState {
    queueInfo: gameOptions | null
    error: null | {
        title: string,
        description: string
    }
    game: JSX.Element | null
}

interface gameFoundInfo extends gameOptions {
    team: 'white' | 'black'
    pgn: string
    white: PlayerInfo
    black: PlayerInfo
}

class PlayGame extends React.Component<PlayGameProps, PlayGameState>{

    ws: WebSocket | undefined
    token = checkForToken()
    doMove: Function | null = null
    ownTeam: Teams | null = null
    updateTimer: Function | null = null
    serverGameOver: Function | null = null
    setSpectators: Function | null = null

    constructor(props: PlayGameProps) {
        super(props)

        this.state = {
            queueInfo: null,
            game: null,
            error: null
        }

        const match = window.location.pathname.match(/^\/play\/([^/]+)\/(\d+)\+(\d+)$/);
        if (!match) {
            document.location.href = '/home';
            return
        }

        const gameMode = match[1];
        const start = parseInt(match[2], 10);
        const inc = parseInt(match[3], 10);


        if (!this.token) {
            document.location.href = '/login/?ref=' + document.location.pathname + document.location.search;
            return
        }

        const serverGameOverTypes = ['resignation', 'timeout', 'game abandoned']
        const establishWS = () => {
            const wsConnectionURL = `${wsURL}play/${gameMode}/${start}+${inc}/?token=${this.token?.token}&userId=${this.token?.userId}`
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
                        cancelReconnection = true
                        this.setState({
                            error: data
                        })
                        break;
                    case 'queue':
                        this.setState({
                            queueInfo: data as gameOptions
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
                        window.removeEventListener('beforeunload', leavePage);
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
                    window.location.href = '/home'
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
                window.location.reload()
            }

            this.ws.onopen = () => {
                console.log("Web Socket Connected")
                cancelReconnection = false
            }
        }

        establishWS()
    }

    gameFound(game: gameFoundInfo) {
        window.addEventListener('beforeunload', leavePage);
        this.setState({
            queueInfo: null,
            game: <Game
                team={game.team}
                viewAs={game.team}
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
                    atBeginning: false,
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
        else if (this.state.queueInfo)
            return <LoadingPage
                title='Queueing'
                description={`${gameModeToName.get(this.state.queueInfo.mode as GameModes)} ${this.state.queueInfo.time.base / 60}+${this.state.queueInfo.time.increment}`}
            />
        else
            return <LoadingPage description='Connecting to OggyP Chess Web Socket' />
    }
}

export default PlayGame