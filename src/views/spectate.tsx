'use client'

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
    gameId: string
}

interface SpectateGameState {
    error: null | {
        title: string,
        description: string
    }
    game: React.ReactElement | null
}

interface gameFoundInfo extends gameOptions {
    pgn: string
    white: PlayerInfo
    black: PlayerInfo
}

class SpectateGame extends React.Component<SpectateGameProps, SpectateGameState>{

    ws: WebSocket | undefined
    wsConnectionURL: string | null = null
    /** True from unmount onwards — nothing may open or keep a socket after that */
    disposed = false
    /** True once the connection failed or the server kicked us: never connect again after that */
    connectionClosed = false
    token = checkForToken()
    doMove: Function | null = null
    ownTeam: Teams | null = null
    updateTimer: Function | null = null
    serverGameOver: Function | null = null
    setSpectators: Function | null = null
    addChatMessage: Function | null = null
    setChatMessages: Function | null = null
    pendingChatMessages: any[] = []
    pendingChatHistory: any[] | null = null

    constructor(props: SpectateGameProps) {
        super(props)

        this.state = {
            game: null,
            error: null
        }

        const uuidRe = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
        if (!uuidRe.test(props.gameId)) {
            document.location.href = '/home';
            return
        }

        if (!this.token) {
            document.location.href = '/login/?ref=' + document.location.pathname + document.location.search;
            return
        }

        this.wsConnectionURL = `${wsURL}spectate/${props.gameId}/?token=${this.token.token}&userId=${this.token.userId}`
    }

    /**
     * Exactly one spectate socket per mount: the socket belongs to the component, so a
     * socket that has been superseded and a component that has been unmounted can never
     * open another connection. Previously every closed socket scheduled a fresh
     * connection, which turned any single closed socket into a connect-every-2s loop.
     */
    connectWs() {
        if (this.disposed || this.ws || !this.wsConnectionURL)
            return

        const wsConnectionURL = this.wsConnectionURL
        const ws = new WebSocket(wsConnectionURL)
        this.ws = ws

        const serverGameOverTypes = ['resignation', 'timeout', 'game abandoned']

        ws.onmessage = (message) => {
            if (this.ws !== ws) return
            const event = JSON.parse(message.data)
            const data: any = event.data
            console.log(event)
            switch (event.type) {
                case 'error':
                    // Server side refusals (game gone, signed in elsewhere, ...) are final
                    this.connectionClosed = true
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
                    window.history.pushState(null, '', window.location.origin + '/viewGame/' + data.gameId);
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
                case 'chat':
                    if (this.addChatMessage)
                        this.addChatMessage(data)
                    else
                        this.pendingChatMessages.push(data)
                    break
                case 'chatHistory':
                    if (this.setChatMessages)
                        this.setChatMessages(data)
                    else
                        this.pendingChatHistory = data
                    break
            }
        }

        ws.onclose = () => {
            console.log("Web socket Closed")
            if (this.ws !== ws)
                return
            this.ws = undefined
            if (this.disposed || this.connectionClosed)
                return
            // The server closed the socket, which is final: no reconnect
            this.connectionClosed = true
            this.setState({
                error: {
                    title: "Connection Lost!",
                    description: `The connection to the OggyP Chess Web Socket was closed\nSocket URL: ${wsConnectionURL}`
                }
            })
        }

        ws.onerror = (error) => {
            console.log("Web socket error!")
            console.error(error)
            if (this.ws !== ws)
                return
            this.connectionClosed = true
            this.setState({
                error: {
                    title: "Connection Issues!",
                    description: `Lost connect to the OggyP Chess Web Socket\nSocket URL: ${wsConnectionURL}`
                }
            })
        }

        ws.onopen = () => {
            console.log("Web Socket Connected")
        }
    }

    /** Closes the socket and makes sure nothing can ever connect again */
    disposeWs() {
        this.disposed = true
        const ws = this.ws
        this.ws = undefined
        if (ws && (ws.readyState === WebSocket.CONNECTING || ws.readyState === WebSocket.OPEN))
            ws.close()
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
        this.addChatMessage = callbacks.addChatMessage
        this.setChatMessages = callbacks.setChatMessages
        if (this.pendingChatHistory && this.setChatMessages) {
            this.setChatMessages(this.pendingChatHistory)
            this.pendingChatHistory = null
        }
        if (this.pendingChatMessages.length && this.addChatMessage) {
            this.pendingChatMessages.forEach((msg) => this.addChatMessage!(msg))
            this.pendingChatMessages = []
        }
    }

    regainedFocus = () => {
        if (!document.hidden && !this.disposed) {
            console.log('Focus!')
            if (this.state.error)
                window.location.reload()
        }
    }

    componentDidMount(): void {
        document.addEventListener('visibilitychange', this.regainedFocus);
        this.connectWs()
    }

    componentWillUnmount(): void {
        document.removeEventListener("visibilitychange", this.regainedFocus);
        this.disposeWs()
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
