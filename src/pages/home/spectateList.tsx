interface user {
    userId: number,
    username: string,
    createdAt: Date,
    wins: number,
    draws: number,
    gamesPlayed: number,
    rating: number,
    gameIds: string,
    ratingDeviation: number,
    title?: string,
    ratingChange?: number
}

type gameModesType = 'standard' | '960'

interface gameOptions {
    mode: gameModesType,
    time: {
        base: number,
        increment: number
    }
}

interface spectateInfo {
    gameId: string
    players: {
        white: user,
        black: user
    }
    gameInfo: gameOptions
}

interface SpectateMenuProps {
    currentGames: spectateInfo[]
}

function SpectateMenu(props: SpectateMenuProps) {

    const fullChessModeNames = {
        'standard': 'Standard',
        '960': '960'
    }

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
                    <td>{data.players.white.username} <span className="rating">{data.players.white.rating}</span></td>
                    <td>{data.players.black.username} <span className="rating">{data.players.black.rating}</span></td>
                    <td>{fullChessModeNames[data.gameInfo.mode]} {data.gameInfo.time.base / 60}+{data.gameInfo.time.increment}</td>
                </tr>
            ))}
        </tbody>
    </table>
}

export default SpectateMenu
export type { spectateInfo }