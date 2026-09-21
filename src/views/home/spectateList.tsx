import displayRating from '../../helpers/displayRating';
import { userInfo } from '../../helpers/verifyToken';
import { gameModeToName, GameModes } from '../../helpers/gameModes';

interface gameOptions {
    mode: GameModes,
    time: {
        base: number,
        increment: number
    }
}

interface spectateInfo {
    gameId: string
    players: {
        white: userInfo,
        black: userInfo
    }
    gameInfo: gameOptions
}

interface SpectateMenuProps {
    currentGames: spectateInfo[]
}

function SpectateMenu(props: SpectateMenuProps) {
    if (props.currentGames.length === 0) {
        return (
            <section id='lobby' style={{ width: '100%', textAlign: 'center' }}>
                <h2>Spectate</h2>
                <p>No games available to spectate</p>
            </section>
        );
    } else {
        return (
            <section id='lobby'>
                <h2>Spectate</h2>
                <ul>
                    {props.currentGames.map((data, index) => (
                        <li className='challenge' key={index} style={{ marginBottom: '10px' }}>
                            <a className='container' href={`/spectate/${data.gameId}`}>
                                <span className='user-spectate'>
                                    <span className='name'>{(data.players.white.title) ? <span className='title'>{data.players.white.title}</span> : null}{data.players.white.username}</span>
                                    <span className='rating'>{displayRating(data.players.white)}</span>
                                </span>
                                <span style={{ margin: '0 10px' }}>Vs</span>
                                <span className='user-spectate'>
                                    <span className='name'>{(data.players.black.title) ? <span className='title'>{data.players.black.title}</span> : null}{data.players.black.username}</span>
                                    <span className='rating'>{displayRating(data.players.black)}</span>
                                </span>
                                <span className='game-info'>
                                    <span className='mode'>{gameModeToName.get(data.gameInfo.mode)}</span>
                                    <span className='time-control'>{data.gameInfo.time.base / 60} + {data.gameInfo.time.increment}</span>
                                </span>
                            </a>
                        </li>
                    ))}
                </ul>
            </section>
        );
    }
}

export default SpectateMenu
export type { spectateInfo }