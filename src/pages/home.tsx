import React from 'react';
import { sendToWs } from '../helpers/wsHelper'
import '../css/home.scss'
import { checkForToken, deleteCookie, tokenType } from '../helpers/getToken';

interface HomeProps {
  url: string
}

interface HomeState {
  userInfo: userInfo | null
  gameInfo: gameInfo[]
  start: number | null,
  inc: number | null,
  mode: string | null,
  pgnInput: string
}

interface userInfo {
  username: string
  userId: number
  rating: number
  signUpDate: number
}

interface gameInfo {
  id: number
  white: string
  black: string
  score: string
  reason: string
  gameMode: string
  opening: string
  createdAt: string
}

class Home extends React.Component<HomeProps, HomeState>{

  ws = new WebSocket(this.props.url)
  token = checkForToken()

  constructor(props: HomeProps) {
    super(props)

    this.state = {
      userInfo: null,
      gameInfo: [],
      start: null,
      inc: null,
      mode: null,
      pgnInput: ''
    }

    if (!this.token) {
      document.location.href = '/login';
      return
    }

    this.ws.onmessage = (message) => {
      const event = JSON.parse(message.data)
      const data = event.data
      console.log(event)
      switch (event.type) {
        case 'login':
          if (data.status === 'success') {
            this.setState({
              userInfo: {
                username: data.username,
                userId: data.userId,
                signUpDate: data.signUp,
                rating: data.rating
              }
            })
          } else {
            document.location.href = '/login';
            deleteCookie('token')
          }
          break;
        case 'recentGames':
          this.setState({
            gameInfo: data.gameList
          })
          break;
      }

    }

    this.ws.onclose = () => {

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

  playGame() {
    document.location.href = `/play/?mode=${this.state.mode} ${this.state.start}|${this.state.inc}`
  }

  render() {
    let userInfoPage = <div>
      <h1>Loading User Info</h1>
    </div>
    if (this.state.userInfo) {
      userInfoPage = <div>
        <h1 className='username'>{this.state.userInfo.username}  <span className='user-id'>ID: {this.state.userInfo.userId}</span></h1>
        <h3 className='rating'>Rating: {Math.round(this.state.userInfo.rating)}</h3>
        <h3 className='sign-up-date'>Signed Up: {this.state.userInfo.signUpDate}</h3>
      </div>
    }
    let games = this.state.gameInfo.map((value, index) => {
      return <tr key={value.id} onClick={() => document.location.href = '/viewGame/' + value.id + ((value.white === this.state.userInfo?.username) ? '' : '?viewAs=black')}>
        <th scope='row' className='game-id'>{value.id}</th>
        <td>{value.white}</td>
        <td>{value.score}</td>
        <td>{value.black}</td>
        <td>{value.gameMode}</td>
      </tr>
    })

    const startTime = [0.5, 1, 2, 3, 5, 10, 15, 30]
    const incTime = [0, 1, 2, 3, 5, 10, 20]

    const startTimeSelector = startTime.map((item, index) => {
      return <label htmlFor={"time-control-start-" + item} className="button" key={index}>
        {item}
        <input onChange={() => this.setState({ start: item })} type="radio" id={"time-control-start-" + item} name="time-control-start" value={item} />
      </label>
    })

    const incTimeSelector = incTime.map((item, index) => {
      return <label htmlFor={"time-control-inc-" + item} className="button" key={index}>
        {item}
        <input onChange={() => this.setState({ inc: item })} type="radio" id={"time-control-inc-" + item} name="time-control-inc" value={item} />
      </label>
    })

    const fullChessModeNames = {
      'standard': 'Standard Chess',
      '960': 'Chess 960'
    }

    let playButton = null
    if (this.state.mode !== null && this.state.inc !== null && this.state.start !== null)
      playButton = <button onClick={() => this.playGame()}>Play {(this.state.mode) ? fullChessModeNames[this.state.mode as 'standard' | '960'] : null} {this.state.start}+{this.state.inc}</button>
    else console.log(this.state)

    return <div className='home-wrapper'>
      <div className='horizontal'>
        <div className='left'>
          {userInfoPage}
          <div className='play'>
            <h2>Play</h2>
            <hr />
            <h3>Starting Time (Mins)</h3>
            <div className='time-selector'>
              {startTimeSelector}
            </div>
            <hr />
            <h3>Increment Time (Secs)</h3>
            <div className='time-selector'>
              {incTimeSelector}
            </div>
            <hr />
            <h3>Chess Mode</h3>
            <div className='mode-selector'>
              <label htmlFor="mode-control-standard" className="button">
                Standard
                <input onChange={() => this.setState({ mode: 'standard' })} type="radio" id="mode-control-standard" name="chess-mode" value="Standard Chess" />
              </label>
              <label htmlFor="mode-control-960" className="button">
                Chess 960
                <input onChange={() => this.setState({ mode: '960' })} type="radio" id="mode-control-960" name="chess-mode" value="Chess 960" />
              </label>
            </div>
            <hr />
            {playButton}
          </div>
          <div id='pgn-input-wrapper'>
            <label htmlFor='pgn-input'><h3>PGN Input</h3></label>
            <textarea id='pgn-input' onChange={(event) => this.setState({ pgnInput: event.target.value })}></textarea>
            {
              (this.state.pgnInput) ?
                <button onClick={() => { window.location.href = '/analysis/?pgn=' + encodeURIComponent(this.state.pgnInput) }}>Import</button>
                : null
            }
          </div>
        </div>
        <table>
          <thead></thead>
          <tbody>
            {games}
          </tbody>
        </table>
      </div>
    </div>
  }
}

export default Home