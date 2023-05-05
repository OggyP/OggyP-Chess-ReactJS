import { useEffect, useState } from 'react';
import '../css/home.scss'
import PlaySelectionMenu from './home/playSelector'
import LobbyMenu, { queueInfo } from './home/lobby'
import SpectateMenu, { spectateInfo } from './home/spectateList'
import { userInfo } from '../helpers/verifyToken'
import { wsURL, apiURL } from '../settings';
import ErrorPage from './Error';
import displayRating from '../helpers/displayRating';
import { gameModesList, gameModeToShortName } from '../helpers/gameModes';

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
    const [error, setError] = useState<null | {
        title: string,
        description: string
    }>(null)
    const [queues, setQueues] = useState<queueInfo[]>([])
    const [currentGames, setCurrentGames] = useState<spectateInfo[]>([])


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
                        case 'spectateGames':
                            setCurrentGames(data)
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
        <h1 className='username'>{(props.userInfo.title) ? <span className='title'>{props.userInfo.title}</span> : null}{props.userInfo.username}  <span className='user-id'>ID: {props.userInfo.userId}</span></h1>
        <h3 className='user-stats'>Rating | {displayRating(props.userInfo)}</h3>
        <h3 className='user-stats'>Win% | {Math.round(1000 * props.userInfo.wins / props.userInfo.gamesPlayed) / 10}%</h3>
        <h3 className='user-stats'>Win:Loss | {props.userInfo.wins}:{props.userInfo.gamesPlayed - props.userInfo.wins - props.userInfo.draws}</h3>
        <h3 className='user-stats'>#Games | {props.userInfo.gamesPlayed}</h3>
        <button className='button' onClick={() => { localStorage.removeItem('token'); window.location.href = '/login' }}>Log Out</button>
    </div>

    let games: JSX.Element[] = []
    for (let i = 0; i < gameInfo.length; i++) {
        const value = gameInfo[i]
        const urlToGoTo = '/viewGame/' + value.id + ((value.white.split('|').slice(-1)[0] === props.userInfo?.username) ? '' : '?viewAs=black')

        let winSymbol
        const ownTeam = (value.white.split('|').slice(-1)[0] === props.userInfo.username) ? 'white' : 'black'
        if (ownTeam === value.winner)
            winSymbol = 'win'
        else if (value.winner === 'draw')
            winSymbol = 'draw'
        else
            winSymbol = 'loss'

        let symbols = {
            white: '1/2',
            black: '1/2'
        }

        if (value.winner === 'white') {
            symbols.white = '1'
            symbols.black = '0'
        } else if (value.winner === 'black') {
            symbols.white = '0'
            symbols.black = '1'
        }


        // Usernames in previous games are stores as TITLE|username
        let split = {
            white: value.white.split('|'),
            black: value.black.split('|')
        }

        let username = {
            white: split.white.slice(-1),
            black: split.black.slice(-1)
        }


        let titles = {
            white: (split.white.length === 2) ? <span className='title'>{split.white[0]}</span> : null,
            black: (split.black.length === 2) ? <span className='title'>{split.black[0]}</span> : null
        }




        games.push(<li className='game-normal-info' key={value.id * 2} onClick={() => window.location.href = urlToGoTo}>
            <div className='container'>
                <div className='result'>
                    <img src={`/assets/images/previousGameMenu/${winSymbol}.svg`} alt={winSymbol} />
                </div>
                <div className='username'>
                    <div className='white'>
                        <p>{symbols.white}  {titles.white}{username.white}</p>
                    </div>
                    <div className='black'>
                        <p>{symbols.black}  {titles.black}{username.black}</p>
                    </div>
                </div>
                <div className='game-info'>
                    <div className='game-mode'>
                        <p>{gameModeToShortName.get(value.gameMode)}</p>
                    </div>
                    <div className='time-controls'>
                        <p>{`${Number(value.timeOption.split('+')[0]) / 60}+${value.timeOption.split('+')[1]}`}</p>
                    </div>
                </div>
            </div>
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

    if (error) return <ErrorPage
        title={error.title} description={error.description}
    />

    return <div id='home-wrapper' onFocus={() => {

    }}>
        {userInfoPage}
        <PlaySelectionMenu
            gameModes={gameModesList}
            timeSelections={defaultTimes}
        />
        <div id='lobby'>
            <h2>Lobby</h2>
            <LobbyMenu queues={queues} />
            <br />
            <h2>Spectate</h2>
            <SpectateMenu currentGames={currentGames} />
        </div>
        <div id="previous-games">
            <h2>Previous Games</h2>
            <ul>{games}</ul>
        </div>
    </div>
}

export default Home
