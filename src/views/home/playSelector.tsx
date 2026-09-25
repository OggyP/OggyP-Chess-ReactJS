import { useState } from 'react';

interface PlaySelectionMenuProps {
    gameModes: [string, string][]
    timeSelections: ([number, number] | string)[]
}

function PlaySelectionMenu(props: PlaySelectionMenuProps) {
    const [selectedGameMode, setGameMode] = useState<string | null>(null)
    // const [open, setOpen] = useState<string>('open');
    
    // useEffect(() => {
    //     setOpen(localStorage.getItem('PlaySelectionMenu-open') ?? 'open');
    // }, []);

    // const toggleOpen = () => {
    //     if (open === 'open') {
    //         setOpen('closed');
    //         localStorage.setItem('PlaySelectionMenu-open', 'closed');
    //     } else {
    //         setOpen('open');
    //         localStorage.setItem('PlaySelectionMenu-open', 'open');
    //     }
    // };

    const gameModeSelection = props.gameModes.map((gameMode) => {
        return <button key={gameMode[0]} type='button' onClick={() => setGameMode(gameMode[0])} className={(selectedGameMode && selectedGameMode === gameMode[0]) ? 'selected' : ''}>
            {gameMode[1]}
        </button>
    })


    const timeSelection = props.timeSelections.map((time, index) => {
        if (typeof time === 'string' || time instanceof String) {
            // Custom time
            if (selectedGameMode)
                return <button type='button' key={index}>{time}</button>
            else
                return <button type='button' className='disabled' key={index} disabled>{time}</button>
        } else {
            // Preset time
            if (selectedGameMode)
                return <button
                    type='button'
                    key={index}
                    onClick={() => { window.location.href = `/play/${selectedGameMode}/${Math.round(time[0]*60)}+${Math.round(time[1])}` }}>
                    {time[0]} + {time[1]}
                </button>
            else
                return <button
                    type='button'
                    key={index}
                    className='disabled'
                    disabled>
                    {time[0]} + {time[1]}
                </button>
        }
    })

    return <div id='play-selector' /* className={open} */>
        <h2>Play A Game</h2>
        <h3>Mode</h3>
        {/* <button onClick={toggleOpen}>toggle</button> */}
        <div className='game-modes'>
            {gameModeSelection}
        </div>
        <h3>Time Controls</h3>
        <div className='time-selections'>
            {timeSelection}
        </div>
    </div>
}

export default PlaySelectionMenu