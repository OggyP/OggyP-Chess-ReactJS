

import React from 'react';
import { sendToWs } from '../helpers/wsHelper'
import '../css/login.scss'
import { checkForToken, tokenType } from '../helpers/getToken';
import Game from '../game';
import { Teams } from '../chessLogic/types';

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

  constructor(props: PlayGameProps) {
    super(props)

    const queryParams = new URLSearchParams(window.location.search);

    const queueMode = queryParams.get('mode')
    console.log(queueMode)

    this.state = {
      queueInfo: null,
      game: null
    }

    if (!this.token || !queueMode) {
      document.location.href = '/home';
      return
    }

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
          this.ownTeam = (data.player) ? 'white' : 'black'
          this.setState({
            queueInfo: null,
            game: <Game
              team={this.ownTeam}
              fen={data.board[1]}
              multiplayerWs={this.ws}
              onMounted={(callbacks: Function) => this.gameMounted(callbacks)}
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
          if (!this.state.game) throw new Error("Recieved move before game start");
          if (!this.doMove) throw new Error("Do move function is null");
          const startingPos = {'x': data.startingPos[0], 'y': data.startingPos[1]}
          const endingPos = {'x': data.endingPos[0], 'y': data.endingPos[1]}
          if (!data.promote)
            this.doMove(startingPos, endingPos)
          else
            this.doMove(startingPos, endingPos, data.promote[0])
          break;
      }
      console.log("PLAY TSX")
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
    console.log("Game Mounted")
    this.doMove = callbacks.doMove
    console.log(this.doMove)
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