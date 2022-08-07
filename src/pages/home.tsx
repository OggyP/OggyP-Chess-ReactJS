import React from 'react';
import { sendToWs } from '../helpers/wsHelper'
import '../css/home.scss'
import { checkForToken, deleteCookie, tokenType } from '../helpers/getToken';
import { formatDate } from '../helpers/date'
import PlaySelectionMenu from './home/playSelector'

interface HomeProps {
    url: string
}

interface HomeState {
    userInfo: userInfo | null
    gameInfo: gameInfo[]
    pgnInput: string
    copiedId: null | number
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
            pgnInput: '',
            copiedId: null
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

    render() {
        let userInfoPage = <div className='user-info'>
            <h1>Loading User Info</h1>
        </div>
        if (this.state.userInfo) {
            userInfoPage = <div className='user-info'>
                <h1 className='username'>{this.state.userInfo.username}  <span className='user-id'>ID: {this.state.userInfo.userId}</span></h1>
                <h3 className='rating'>Rating: {Math.round(this.state.userInfo.rating)}</h3>
                <h3 className='sign-up-date'>Signed Up: {formatDate(this.state.userInfo.signUpDate)}</h3>
                <button className='button' onClick={() => {deleteCookie('token'); window.location.href = '/login'}}>Log Out</button>
            </div>
        }
        let games: JSX.Element[] = []
        for (let i = 0; i < this.state.gameInfo.length; i++) {
            const value = this.state.gameInfo[i]
            const urlToGoTo = '/viewGame/' + value.id + ((value.white === this.state.userInfo?.username) ? '' : '?viewAs=black')
            const successfullyCopied = (this.state.copiedId && this.state.copiedId === value.id)
            games.push(<tr className='game-normal-info' key={value.id * 2}>
                <td onClick={() => document.location.href = urlToGoTo} className='username white'>{value.white}</td>
                <td onClick={() => document.location.href = urlToGoTo} className='result'>{value.score}</td>
                <td onClick={() => document.location.href = urlToGoTo} className='username black'>{value.black}</td>
                <td onClick={() => { navigator.clipboard.writeText("https://chess.oggyp.com" + urlToGoTo); this.setState({ copiedId: value.id }) }} className={'copy' + ((successfullyCopied) ? ' success' : '')}>
                    {(successfullyCopied) ?
                        <span className="material-icons">done</span> :
                        <span className="material-icons">content_copy</span>}
                </td>
            </tr>)
        }

        const defaultTimes: ([number, number] | string)[] = [
            [0.5, 0],
            [0.5, 1],
            [1, 0],
            [1, 1],
            [3, 0],
            [5, 0],
            [5, 3],
            [10, 0],
            [10, 5],
            [30, 0],
            [30, 20],
            "Custom"
        ]

        const gameModes: [string, string][] = [
            ['standard', 'Standard Chess'],
            ['960', 'Chess 960']
        ]

        // const fullChessModeNames = {
        //     'standard': 'Standard Chess',
        //     '960': 'Chess 960'
        // }

        return <div id='home-wrapper'>
            {userInfoPage}
            <PlaySelectionMenu
                gameModes={gameModes}
                timeSelections={defaultTimes}
            />
            <div id='pgn-input-wrapper'>
                <label htmlFor='pgn-input'><h3>PGN Input</h3></label>
                <textarea id='pgn-input' onChange={(event) => this.setState({ pgnInput: event.target.value })}></textarea>
                {
                    (this.state.pgnInput) ?
                        <button onClick={() => { window.location.href = '/analysis/?pgn=' + encodeURIComponent(this.state.pgnInput) }}>Import</button>
                        : null
                }
            </div>
            <div id="previous-games">
                <h3>Previous Games</h3>
                <table>
                    <colgroup>
                        <col className='username white' />
                        <col className='result' />
                        <col className='username black' />
                    </colgroup>
                    <thead>
                    </thead>
                    <tbody>
                        {games}
                    </tbody>
                </table>
            </div>
        </div>
    }
}

export default Home
