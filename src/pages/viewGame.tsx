import React from 'react';
import '../css/index.scss';
import '../css/chess.scss';
import '../svg/assets.css'
import Game from '../game'

interface wsMsg {
  type: string
  data: any
}

function sendToWs(ws: WebSocket, eventType: string, data: any) {
  let wsMsg: wsMsg = {
    type: eventType,
    data: {}
  }

  if (data.constructor === Array) {
    data.forEach((item: [string, any]) => {
      wsMsg.data[item[0]] = item[1]
    })
  } else {
    wsMsg.data = data
  }
  if (eventType !== "login")
    console.log(JSON.stringify(wsMsg))
  ws.send(JSON.stringify(wsMsg))
}

interface ViewGameProps {
  url: string
}

interface ViewGameState {
  PGN: string | null
}

class ViewGame extends React.Component<ViewGameProps, ViewGameState>{

  ws = new WebSocket(this.props.url)
  gameId: Number;

  constructor(props: ViewGameProps) {
    super(props)

    this.gameId = Number(window.location.pathname.split('/')[2]);

    this.state = {
      PGN: null
    }

    this.ws.onmessage = (message) => {
      const event = JSON.parse(message.data)
      console.log(event)
      console.log(event.data.pgn)
      this.setState({
        PGN: event.data.pgn
      })
    }

    this.ws.onclose = function () {
    }

    this.ws.onerror = function () {
    }

    this.ws.onopen = () => {
      sendToWs(this.ws, 'viewGame', [
        ['gameId', this.gameId]
      ])
    }
  }

  render() {
    if (this.state.PGN)
      return <Game
        pgn={this.state.PGN}
        team='any'
      />
    else
      return <div>
        <h1>Loading Game | ID: {this.gameId}</h1>
      </div>
  }
}

export default ViewGame