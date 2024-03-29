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
    return <table>
        <thead>
            <tr>
                <th className='player'>Player</th>
                <th className='rating'>Rating</th>
                <th className='time'>Time</th>
                <th className='mode'>Mode</th>
            </tr>
        </thead>
        <tbody>
            {props.queues.map((data, index) => (
                <tr key={index} onClick={() => window.location.href = `/play/${data.gameInfo.mode}/${data.gameInfo.time.base}+${data.gameInfo.time.increment}`}>
                    <td>{(data.player.title) ? <span className='title'>{data.player.title}</span> : null}{data.player.username}</td>
                    <td>{displayRating(data.player)}</td>
                    <td>{data.gameInfo.time.base / 60}+{data.gameInfo.time.increment}</td>
                    <td>{gameModeToName.get(data.gameInfo.mode)}</td>
                </tr>
            ))}
        </tbody>
    </table>
}

export default LobbyMenu
export type {queueInfo}