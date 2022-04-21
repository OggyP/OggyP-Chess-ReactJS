import { useState } from 'react';

interface PlaySelectionMenuProps {
    gameModes: [string, string][]
    timeSelections: ([number, number] | string)[]
}

function PlaySelectionMenu(props: PlaySelectionMenuProps) {
    const [selectedGameMode, setGameMode] = useState<string | null>(null)

    const colAmt = Math.floor(Math.sqrt(props.timeSelections.length))
    const rowAmt = Math.ceil(props.timeSelections.length / colAmt)

    const gameModeSelection = props.gameModes.map((gameMode, index) => {
        return <div key={gameMode[0]} onClick={() => setGameMode(gameMode[0])} className={(selectedGameMode && selectedGameMode === gameMode[0]) ? 'selected button' : 'button'}>
            {gameMode[1]}
        </div>
    })


    const timeSelection = props.timeSelections.map((time, index) => {
        if (typeof time === 'string' || time instanceof String) {
            // Custom time
            if (selectedGameMode)
                return <div className='button' key={index}>{time}</div>
            else
                return <div className='button disabled' key={index}>{time}</div>
        } else {
            // Preset time
            if (selectedGameMode)
                return <div
                    key={index}
                    onClick={() => { window.location.href = '/play/?mode=' + encodeURIComponent(`${selectedGameMode} ${time[0]}|${time[1]}`) }}>
                    {time[0]}+{time[1]}
                </div>
            else
                return <div
                    key={index}
                    className='disabled'>
                    {time[0]}+{time[1]}
                </div>
        }
    })

    return <div id='play-selector'>
        <div className='game-modes'>
            {gameModeSelection}
        </div>
        <div className='time-selections' style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${colAmt}, 1fr)`,
            gridTemplateRows: `repeat(${rowAmt}, 1fr)`,
            gridColumnGap: '20px',
            gridRowGap: '20px',
            flexGrow: rowAmt
        }}>
            {timeSelection}
        </div>
    </div>
}

export default PlaySelectionMenu