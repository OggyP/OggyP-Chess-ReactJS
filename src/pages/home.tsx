import { useEffect, useState } from 'react';
import '../css/home.scss'
import { formatDate } from '../helpers/date'
import PlaySelectionMenu from './home/playSelector'
import LobbyMenu, {queueInfo} from './home/lobby'
import { userInfo } from '../helpers/verifyToken'
import { wsURL, apiURL } from '../settings';
import ErrorPage from './Error';

interface HomeProps {
    userInfo: userInfo | null
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
    const [error, setError] = useState<null | {
        title: string,
        description: string
    }>(null)
    const [queues, setQueues] = useState<queueInfo[]>([])


    useEffect(() => {
        const establishWS = () => {
            if (props.userInfo && error === null) {
                const wsConnectionURL = `${wsURL}home/?token=${props.userInfo.tokenInfo.token}&userId=${props.userInfo.tokenInfo.userId}`
                let ws = new WebSocket(wsConnectionURL)

                let cancelReconnection = false

                ws.onmessage = (message) => {
                    const event = JSON.parse(message.data)
                    const data: any = event.data
                    console.log(event)

                    switch (event.type) {
                        case 'error':
                            cancelReconnection = true
                            setError(data)
                            break;
                        case 'queues':
                            setQueues(data)
                            break;
                        case 'redirect':
                            window.location.href = data.location
                            break;
                    }
                }

                ws.onclose = function () {
                    console.log("Web socket Closed")
                    if (!cancelReconnection)
                        setTimeout(establishWS, 2000);
                }

                ws.onerror = function (error) {
                    console.log("Web socket error!")
                    console.error(error)
                    cancelReconnection = true
                    setError({
                        title: "Connection Issues!",
                        description: `Lost connect to the OggyP Chess Web Socket\nSocket URL: ${wsConnectionURL}`
                    })
                }

                ws.onopen = () => {
                    console.log("Web Socket Connected")
                }
            }

        }
        
        establishWS()
    }, [error, props.userInfo])

    useEffect(() => {

        const getLatestGames = async () => {
            if (!props.userInfo) return
            let response = await fetch(apiURL + "games/latest", {
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

        getLatestGames()
    }, [props.userInfo])

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

    if (error) return <ErrorPage
        title={error.title} description={error.description}
    />

    return <div id='home-wrapper'>
        {userInfoPage}
        <PlaySelectionMenu
            gameModes={gameModes}
            timeSelections={defaultTimes}
        />
        <div id='lobby'>
            <LobbyMenu queues={queues} />
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
