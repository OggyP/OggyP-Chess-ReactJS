import React, { useEffect, useState } from 'react';
import { sendToWs } from '../helpers/wsHelper'
import '../css/home.scss'
import { checkForToken, deleteCookie, tokenType } from '../helpers/getToken';
import { formatDate } from '../helpers/date'
import PlaySelectionMenu from './home/playSelector'
import { userInfo } from '../helpers/verifyToken'

interface HomeProps {
    userInfo: userInfo | null
    url: string
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

function Home(props: HomeProps) {

    const [gameInfo, setGameInfo] = useState<gameInfo[]>([])
    const [pgnInput, setPgnInput] = useState<string>("")
    const [copiedId, setCopiedId] = useState<null | number>(null)

    useEffect(() => {
        const getLatestGames = async () => {
            if (props.userInfo) {
                let response = await fetch(props.url + "games/latest", {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json;charset=utf-8',
                        'Token': props.userInfo.tokenInfo.token,
                        'User-Id': props.userInfo.tokenInfo.userId.toString()
                    }
                })

                if (response.ok) {
                    const data = await response.json()
                    setGameInfo(data)
                } else
                    document.location.href = encodeURI(`/error?title=HTTP Error: ${response.status}&desc=${await response.text()}`)
            }
        }

        getLatestGames()
    }, [props.url])

    let userInfoPage = <div className='user-info'>
        <h1>Loading User Info</h1>
    </div>

    if (props.userInfo)
        userInfoPage = <div className='user-info'>
            <h1 className='username'>{props.userInfo.username}  <span className='user-id'>ID: {props.userInfo.userId}</span></h1>
            <h3 className='rating'>Rating: {Math.round(props.userInfo.rating)}</h3>
            <h3 className='sign-up-date'>Signed Up: {formatDate(new Date(props.userInfo.createdAt))}</h3>
        </div>

    let games: JSX.Element[] = []
    for (let i = 0; i < gameInfo.length; i++) {
        const value = gameInfo[i]
        const urlToGoTo = '/viewGame/' + value.id + ((value.white === props.userInfo?.username) ? '' : '?viewAs=black')
        const successfullyCopied = (copiedId && copiedId === value.id)
        games.push(<tr className='game-normal-info' key={value.id * 2}>
            <td onClick={() => document.location.href = urlToGoTo} className='username white'>{value.white}</td>
            <td onClick={() => document.location.href = urlToGoTo} className='result'>{value.score}</td>
            <td onClick={() => document.location.href = urlToGoTo} className='username black'>{value.black}</td>
            <td onClick={() => {
                navigator.clipboard.writeText("https://chess.oggyp.com" + urlToGoTo);
                setCopiedId(value.id);
            }
            } className={'copy' + ((successfullyCopied) ? ' success' : '')}>
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
            <textarea id='pgn-input' onChange={(event) => setPgnInput(event.target.value)}></textarea>
            {
                (pgnInput) ?
                    <button onClick={() => { window.location.href = '/analysis/?pgn=' + encodeURIComponent(pgnInput) }}>Import</button>
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

export default Home
