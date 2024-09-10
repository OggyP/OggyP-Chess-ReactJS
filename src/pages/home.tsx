import { useEffect, useState } from 'react';
import '../css/home.scss'
import PlaySelectionMenu from './home/playSelector'
import LobbyMenu, { queueInfo } from './home/lobby'
import SpectateMenu, { spectateInfo } from './home/spectateList'
import { userInfo } from '../helpers/verifyToken'
import { wsURL, apiURL } from '../settings';
import ErrorPage from './Error';
import { formatDateShort } from '../helpers/date';
import displayRating from '../helpers/displayRating';
import { gameModesList, gameModeToName } from '../helpers/gameModes';
import ToggleMenu from '../tsxAssets/ToggleMenu';

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
        <h1 className='username'>
            <span className='underline'>
                Welcome back, 
                <span className='new-line'><br></br></span>
                <span className="space">&nbsp;</span>
                <span className='name underline'>{props.userInfo.username}</span>
            </span>
        </h1>
        <section className='user-stats'>
            <span className='type col-1'>Rating</span>
            <span className='content col-1'>{displayRating(props.userInfo)}</span>

            <span className='type col-2'># Games</span>
            <span className='content col-2'>{props.userInfo.gamesPlayed}</span>

            <span className='type col-3'>Win %</span>
            <span className='content col-3'>{Math.round(1000 * props.userInfo.wins / props.userInfo.gamesPlayed) / 10}%</span>

            <span className='type col-1'>ID</span>
            <span className='content col-1'>{props.userInfo.userId}</span>

            <span className='type col-2'>Win:Loss</span>
            <span className='content col-2'>{props.userInfo.wins}:{props.userInfo.gamesPlayed - props.userInfo.wins - props.userInfo.draws}</span>

            <span className='type col-3'>Joined</span>
            <span className='content col-3'>{formatDateShort(props.userInfo.createdAt)}</span>
        </section>
    </div>

    let games: JSX.Element[] = []
    for (let i = 0; i < gameInfo.length; i++) {
        const value = gameInfo[i]
        const urlToGoTo = '/viewGame/' + value.id + ((value.white.split('|').slice(-1)[0] === props.userInfo?.username) ? '' : '?viewAs=black')

        // let winSymbol
        // const ownTeam = (value.white.split('|').slice(-1)[0] === props.userInfo.username) ? 'white' : 'black'
        let winSymbol, result
        const ownTeam = (value.white === props.userInfo.username) ? 'white' : 'black'
        if (ownTeam === value.winner)
            winSymbol = result = 'win'
        else if (value.winner === 'draw') {
            winSymbol = result = 'draw'
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

        games.push(
            <li className='previous-game' key={value.id * 2}>
                <a className='container' href={urlToGoTo}>
                    <div className={'result ' + result}>
                        <img src={`/assets/images/previousGameMenu/${winSymbol}.svg`} alt={winSymbol} />
                    </div>
                    <div className='white'>
                        {/* <span className='number'>{symbols.white}</span> */}
                        <span className='name'>
                            {username.white}
                            {titles.white}
                        </span>
                    </div>
                    <div className='black'>
                        {/* <span className='number'>{symbols.black}</span> */}
                        <span className='name'>
                            {username.black}
                            {titles.black}
                        </span>
                    </div>
                    <div className='game-info'>
                        <p className='game-mode'>
                            {gameModeToName.get(value.gameMode)}
                        </p>
                        <p className='time-controls'>
                            {`${Number(value.timeOption.split('+')[0]) / 60} + ${value.timeOption.split('+')[1]}`}
                        </p>
                    </div>
                </a>
            </li>
        );
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
        <div id="content">
            <main>
                <PlaySelectionMenu
                    gameModes={gameModesList}
                    timeSelections={defaultTimes}
                />
                <hr />

                <div id='lobby'>
                    <LobbyMenu queues={queues} />
                    <br />
                    <SpectateMenu currentGames={currentGames} />
                </div>

                <hr />
                {/* <ToggleMenu>
                    <a href="test">test</a>
                </ToggleMenu> */}
            </main>
            <aside id="previous-games">
                <h2>Previous Games</h2>
                <ul>{games}</ul>
            </aside>
        </div>
    </div>
}

export default Home
