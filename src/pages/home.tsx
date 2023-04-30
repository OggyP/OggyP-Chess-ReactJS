import { useEffect, useState } from 'react';
import '../css/home.scss'
import PlaySelectionMenu from './home/playSelector'
import LobbyMenu, { queueInfo } from './home/lobby'
import { userInfo } from '../helpers/verifyToken'
import { wsURL, apiURL } from '../settings';
import ErrorPage from './Error';
import { formatDateShort } from '../helpers/date';
import { getProperModeName } from '../helpers/misc';

interface HomeProps {
    userInfo: userInfo | null
}

interface gameInfo {
    id: number
    gameMode: string
    white: string
    black: string
    winner: 'white' | 'black' | 'draw',
    gameOverReason: string,
    openingECO: string
    openingName: string
    timeOption: string
}

function Home(props: HomeProps) {

    const [gameInfo, setGameInfo] = useState<gameInfo[]>([])
    // const [pgnInput, setPgnInput] = useState<string>("")
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
                    if (!cancelReconnection && !error)
                        setTimeout(establishWS, 2000);
                }

                ws.onerror = (error) => {
                    console.log("Web socket error!")
                    console.error(error)
                    cancelReconnection = true
                    setError({
                        title: "Connection Issues!",
                        description: `Lost connect to the OggyP Chess Web Socket\nSocket URL: ${wsConnectionURL}`
                    })
                    window.location.reload()
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
                const rawText = await response.text()
                if (rawText) {
                    const data = await JSON.parse(rawText)
                    setGameInfo(data)
                }
            } else if (response.status === 401) {
                localStorage.removeItem('token')
                document.location.href = '/login/?ref=' + document.location.pathname + document.location.search;
            }
            else
                document.location.href = encodeURI(`/error?title=HTTP Error: ${response.status}&desc=${await response.text()}`)
        }

        getLatestGames()
    }, [props.userInfo])

    useEffect(() => {
        document.addEventListener('visibilitychange', function () {
            if (!document.hidden) {
                console.log('Focus!')
                if (error)
                    window.location.reload()
            }
        });
    }, [error])

    let userInfoPage = <div className='user-info'>
        <h1>Loading User Info</h1>
    </div>

    if (!props.userInfo) throw new Error('What how')

    userInfoPage = <div className='user-info'>
        <h1 className='username'>
            <span className='underline'>
                Welcome back, <span className='name underline'>{props.userInfo.username}</span>
            </span>
        </h1>
        <section className='user-stats'>
            <span className='type'>Rating</span><span className='content'>{Math.round(props.userInfo.rating)}</span>
            <span className='type'># Games</span><span className='content'>{props.userInfo.gamesPlayed}</span>
            <span className='type'>Win %</span><span className='content'>{Math.round(1000 * props.userInfo.wins / props.userInfo.gamesPlayed) / 10}%</span>
            <span className='type'>ID</span><span className='content'>{props.userInfo.userId}</span>
            <span className='type'>Win:Loss</span><span className='content'>{props.userInfo.wins}:{props.userInfo.gamesPlayed - props.userInfo.wins - props.userInfo.draws}</span>
            <span className='type'>Joined</span><span className='content'>{formatDateShort(props.userInfo.createdAt)}</span>
            <button className='button' onClick={() => { localStorage.removeItem('token'); window.location.href = '/login' }}>Logout</button>
        </section>
    </div>

    let games: JSX.Element[] = []
    for (let i = 0; i < gameInfo.length; i++) {
        const value = gameInfo[i]
        const urlToGoTo = '/viewGame/' + value.id + ((value.white === props.userInfo?.username) ? '' : '?viewAs=black')
        const successfullyCopied = (copiedId && copiedId === value.id)

        let winSymbol, result
        const ownTeam = (value.white === props.userInfo.username) ? 'white' : 'black'
        if (ownTeam === value.winner)
            winSymbol = result = 'win'
        else if (value.winner === 'draw') {
            winSymbol = 'handshake-light'
            result = 'draw'
        } else
            winSymbol = result = 'loss'

        let symbols = {
            white: '½',
            black: '½'
        }

        if (value.winner === 'white') {
            symbols.white = '1'
            symbols.black = '0'
        } else if (value.winner === 'black') {
            symbols.white = '0'
            symbols.black = '1'
        }


        games.push(<li className='previous-game' key={value.id * 2}>
            <a className='container' href={urlToGoTo}>
                <div className={'result ' + result}>
                    <img src={`/assets/images/previousGameMenu/${winSymbol}.svg`} alt={winSymbol} />
                </div>
                <div className='white'>
                    <span className='number'>{symbols.white}</span>
                    <span className='name'>{value.white}</span>
                </div>
                <div className='black'>
                    <span className='number'>{symbols.black}</span>
                    <span className='name'>{value.black}</span>
                </div>
                <div className='game-info'>
                    <p className='game-mode'>
                        {getProperModeName(value.gameMode)}
                    </p>
                    <p className='time-controls'>
                        {`${Number(value.timeOption.split('+')[0]) / 60} + ${value.timeOption.split('+')[1]}`}
                    </p>
                </div>
            </a>

            {/* <td onClick={() => {
                navigator.clipboard.writeText("https://chess.oggyp.com" + urlToGoTo);
                setCopiedId(value.id);
            }
            } className={'copy' + ((successfullyCopied) ? ' success' : '')}>
                {(successfullyCopied) ?
                    <span className="material-icons">done</span> :
                    <span className="material-icons">content_copy</span>} */}
        </li>)
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

    return <div id='home-wrapper' onFocus={() => {

    }}>
        {userInfoPage}
        <div id="content">
            <main>
                <PlaySelectionMenu
                    gameModes={gameModes}
                    timeSelections={defaultTimes}
                />
                <hr />

                {/* <div id='lobby'>
                    <LobbyMenu queues={queues} />
                </div>
                <hr /> */}

                <section id='lobby'>
                    <h2>Lobby</h2>
                    <ul>
                        <li className='challenge'>
                            <a className='container' href=''>
                                <span className='username'>Jamcode</span>
                                <span className='rating'>963</span>
                                <span className='mode'>Standard</span>
                                <span className='time-control'>10 + 5</span>
                            </a>
                        </li>
                    </ul>
                </section>
                <hr />
            </main>
        <aside id="previous-games">
            <h2>Previous Games</h2>
            <ul>{games}</ul>
        </aside>
        </div>
    </div>
}

export default Home
