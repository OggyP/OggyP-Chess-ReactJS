import displayRating from '../../helpers/displayRating';
import { gameModeToName } from '../../helpers/gameModes';
import { userInfo } from '../../helpers/verifyToken';

type gameModesType = 'standard' | '960'

interface gameOptions {
    mode: gameModesType,
    time: {
        base: number,
        increment: number
    }
}


interface queueInfo {
    player: userInfo
    gameInfo: gameOptions
}

interface LobbyMenuProps {
    queues: queueInfo[]
}

function LobbyMenu(props: LobbyMenuProps) {
    return (
        <section className='lobby-section'>
            <h2>Lobby</h2>
            {props.queues.length === 0 ? (
                <p>No queues available</p>
            ) : (
                <ul>
                    {props.queues.map((data, index) => (
                        <li className='challenge' key={index}>
                            <a className='container' href={`/play/${data.gameInfo.mode}/${data.gameInfo.time.base}%2B${data.gameInfo.time.increment}`}>
                                <span className='user'>
                                    <span className='name'>{(data.player.title) ? <span className='title'>{data.player.title}</span> : null}{data.player.username}</span>
                                    <span className='rating'>{displayRating(data.player)}</span>
                                </span>
                                <span className='game-info'>
                                    <span className='mode'>{gameModeToName.get(data.gameInfo.mode)}</span>
                                    <span className='time-control'>{data.gameInfo.time.base / 60} + {data.gameInfo.time.increment}</span>
                                </span>
                            </a>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}

export default LobbyMenu
export type {queueInfo}
