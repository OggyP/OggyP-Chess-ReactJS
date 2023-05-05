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

    return <table>
        <thead>
            <tr>
                <th className='player'>White</th>
                <th className='player'>Black</th>
                <th className='time'>Game Mode</th>
            </tr>
        </thead>
        <tbody>
            {props.currentGames.map((data, index) => (
                <tr key={index} onClick={() => window.location.href = `/spectate/${data.gameId}`}>
                    <td>{(data.players.white.title) ? <span className='title'>{data.players.white.title}</span> : null}{data.players.white.username} <span className="rating">{displayRating(data.players.white)}</span></td>
                    <td>{(data.players.black.title) ? <span className='title'>{data.players.black.title}</span> : null}{data.players.black.username} <span className="rating">{displayRating(data.players.black)}</span></td>
                    <td>{gameModeToName.get(data.gameInfo.mode)} {data.gameInfo.time.base / 60}+{data.gameInfo.time.increment}</td>
                </tr>
            ))}
        </tbody>
    </table>
}

export default SpectateMenu
export type { spectateInfo }