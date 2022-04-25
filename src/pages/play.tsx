import React from 'react';
import { sendToWs } from '../helpers/wsHelper'
import { checkForToken, tokenType } from '../helpers/getToken';
import Game from '../game';
import { Teams } from '../chessLogic/types';
import { Mutex } from 'async-mutex';
import CheckGameMode from '../helpers/gameModeChecker'

interface PlayGameProps {
    url: string
}

interface PlayGameState {
    queueInfo: {
        mode: string
        start: number
        increment: number
    } | null
    game: JSX.Element | null
}

class PlayGame extends React.Component<PlayGameProps, PlayGameState>{

    ws = new WebSocket(this.props.url)
    token = checkForToken()
    doMove: Function | null = null
    ownTeam: Teams | null = null
    updateTimer: Function | null = null
    serverGameOver: Function | null = null
    moveMutex = new Mutex();

    constructor(props: PlayGameProps) {
        super(props)

        const queryParams = new URLSearchParams(window.location.search);

        const queueMode = queryParams.get('mode')

        this.state = {
            queueInfo: null,
            game: null
        }

        if (!this.token) {
            document.location.href = '/login/?ref=' + document.location.pathname + document.location.search;
            return
        }
        else if (!queueMode) {
            document.location.href = '/home';
            return
        }

        const serverGameOverTypes = ['resignation', 'timeout', 'game abandoned']

        this.ws.onmessage = (message) => {
            const event = JSON.parse(message.data)
            const data: any = event.data
            console.log(event)
            switch (event.type) {
                case 'error':
                    break;
                case 'login':
                    sendToWs(this.ws, 'queue', [['mode', queueMode.replace('|', '+')]])
                    break;
                case 'gameFound':
                    const gameMode = CheckGameMode(queueMode.split(' ')[0])
                    if (!gameMode) {
                        console.error("Invalid Game Mode: ", queueMode.split(' ')[0])
                        return
                    }
                    this.ownTeam = (data.player) ? 'white' : 'black'
                    this.setState({
                        queueInfo: null,
                        game: <Game
                            team={this.ownTeam}
                            mode={gameMode}
                            fen={data.board[1]}
                            multiplayerWs={this.ws}
                            onMounted={(callbacks: Function) => this.gameMounted(callbacks)}
                            players={{
                                white: {
                                    username: data.white[0],
                                    rating: data.white[1]
                                },
                                black: {
                                    username: data.black[0],
                                    rating: data.black[1]
                                }
                            }
                            }
                            allowMoving={true}
                            allowPreMoves={true}
                        />
                    })
                    break;
                case 'queue':
                    this.setState({
                        queueInfo: {
                            mode: data.mode,
                            start: data.startTime / 60000,
                            increment: data.increment / 1000
                        }
                    })
                    break;
                case 'move':

                    this.moveMutex
                        .runExclusive(() => {
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
                        })
                    break;
                case 'gameOver':
                    if (serverGameOverTypes.includes(data.info)) {
                        if (!this.serverGameOver) throw new Error("Server Game Over in play.tsx is null");
                        const gameOverScoreToWinner = {
                            '1-0': 'white',
                            '1/2-1/2': 'draw',
                            '0-1': 'black'
                        }
                        this.serverGameOver(gameOverScoreToWinner[data.type as '1-0' | '1/2-1/2' | '0-1'], data.info)
                    }
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
            }
        }

        this.ws.onclose = function () {
        }

        this.ws.onerror = function () {
        }

        this.ws.onopen = () => {
            const token = this.token as tokenType
            sendToWs(this.ws, "token", [
                ['token', token.token],
                ['userId', token.userId]
            ])
        }
    }

    gameMounted(callbacks: any) {
        this.doMove = callbacks.doMove
        this.updateTimer = callbacks.updateTimer
        this.serverGameOver = callbacks.gameOver
    }

    render() {
        const fullChessModeNames = {
            'standard': 'Standard Chess',
            '960': 'Chess 960'
        }

        if (this.state.game)
            return this.state.game
        else if (!this.state.queueInfo)
            return <h1>Loading Multiplayer Game</h1>
        else
            return <div>
                <h1>Queueing for</h1>
                <h2>{fullChessModeNames[this.state.queueInfo.mode as 'standard' | '960']} {this.state.queueInfo.start}+{this.state.queueInfo.increment}</h2>
            </div>
    }
}

export default PlayGame