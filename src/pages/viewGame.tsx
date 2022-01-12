import React from 'react';
import '../css/index.scss';
import '../css/chess.scss';
import '../svg/assets.css'
import Game from '../game'
import { sendToWs } from '../helpers/wsHelper'
import { Teams } from '../chessLogic';

interface ViewGameProps {
  url: string
}

interface ViewGameState {
  PGN: string | null
}

class ViewGame extends React.Component<ViewGameProps, ViewGameState>{

  ws = new WebSocket(this.props.url)
  gameId: Number;
  urlParams = new URLSearchParams(window.location.search);

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
    let viewAs: Teams | 'any' = 'any'
    const viewAsFromURL = this.urlParams.get('viewAs')
    if (viewAsFromURL === 'white' || viewAsFromURL === 'black' || viewAsFromURL === 'any')
      viewAs = viewAsFromURL
    if (this.state.PGN)
      return <Game
        pgn={this.state.PGN}
        team={viewAs}
      />
    else
      return <div>
        <h1>Loading Game | ID: {this.gameId}</h1>
      </div>
  }
}

export default ViewGame