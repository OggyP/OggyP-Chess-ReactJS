import React from 'react';
import '../css/index.scss';
import '../css/chess.scss';
import '../svg/assets.scss'
import Game from '../game'
import { sendToWs } from '../helpers/wsHelper'
import { Teams } from '../chessLogic';
import ErrorPage from './Error';

interface ViewGameProps {
  url: string
}

interface ViewGameState {
  PGN: string | null
  error: null | JSX.Element
  termination: string
}

class ViewGame extends React.Component<ViewGameProps, ViewGameState>{

  ws = new WebSocket(this.props.url)
  gameId: number;
  urlParams = new URLSearchParams(window.location.search);

  constructor(props: ViewGameProps) {
    super(props)

    this.gameId = Number(window.location.pathname.split('/')[2]);

    if (isNaN(this.gameId)) window.location.href = '/home'

    this.state = {
      PGN: null,
      error: null,
      termination: 'Unknown'
    }

    this.ws.onmessage = (message) => {
      const event = JSON.parse(message.data)
      const data = event.data
      switch (event.type) {
        case 'guestView':
          console.log(data.pgn)
          this.setState({
            PGN: data.pgn,
            termination: data.termination
          })
          break
        case 'error':
          this.setState({
            error: <ErrorPage
              title='Unknown Game'
              description={message.data}
            />
          })
          break;
      }
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
        termination={this.state.termination}
        allowMoving={false}
        allowPreMoves={false}
      />
    else
      return <div>
        <h1>Loading Game | ID: {this.gameId}</h1>
        <p>If this persists, this game may not exist.</p>
      </div>
  }
}

export default ViewGame