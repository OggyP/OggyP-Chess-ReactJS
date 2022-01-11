import React from 'react';
import { sendToWs } from '../helpers/wsHelper'
import '../css/home.scss'
import { checkForToken, deleteCookie } from '../helpers/getToken';

interface HomeProps {
  url: string
}

interface HomeState {
  userInfo: userInfo | null
  gameInfo: gameInfo[]
}

interface token {
  token: string;
  userId: string;
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
      gameInfo: []
    }

    if (!this.token) {
      document.location.href = '/login';
      return
    }

    this.token = this.token as token

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
      const token = this.token as token
      sendToWs(this.ws, "token", [
        ['token', token.token],
        ['userId', token.userId]
      ])
    }
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
      return <tr key={value.id} onClick={() => document.location.href = '/viewGame/' + value.id}>
        <th scope='row' className='game-id'>{value.id}</th>
        <td>{value.white}</td>
        <td>{value.score}</td>
        <td>{value.black}</td>
        <td>{value.gameMode}</td>
      </tr>
    })
    return <div className='home-wrapper'>
      <div className='user-info-wrapper'>
        {userInfoPage}
      </div>
      <table>
        <thead></thead>
        <tbody>
          {games}
        </tbody>
      </table>
    </div>
  }
}

export default Home