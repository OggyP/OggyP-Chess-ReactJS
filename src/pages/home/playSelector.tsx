import { useEffect, useState } from 'react';

interface PlaySelectionMenuProps {
    gameModes: [string, string][]
    timeSelections: ([number, number] | string)[]
}

function PlaySelectionMenu(props: PlaySelectionMenuProps) {
    const [selectedGameMode, setGameMode] = useState<string | null>(null)
    const [open, setOpen] = useState<string>('open');
    
    useEffect(() => {
        setOpen(localStorage.getItem('PlaySelectionMenu-open') ?? 'open');
    }, []);

    const toggleOpen = () => {
        if (open === 'open') {
            setOpen('closed');
            localStorage.setItem('PlaySelectionMenu-open', 'closed');
        } else {
            setOpen('open');
            localStorage.setItem('PlaySelectionMenu-open', 'open');
        }
    };

    const colAmt = Math.floor(Math.sqrt(props.timeSelections.length))
    const rowAmt = Math.ceil(props.timeSelections.length / colAmt)

    const gameModeSelection = props.gameModes.map((gameMode, index) => {
        const modeSelected = selectedGameMode && selectedGameMode === gameMode[0];
        const classSelected = modeSelected? 'selected ' : '';
        return <button key={gameMode[0]} onClick={() => setGameMode(gameMode[0])} className={classSelected + 'mode-' + gameMode[0]}>
            {gameMode[1]}
        </button>
    })


    const timeSelection = props.timeSelections.map((time, index) => {
        if (typeof time === 'string' || time instanceof String) {
            // Custom time
            if (selectedGameMode)
                return <button key={index}>{time}</button>
            else
                return <button className='disabled' key={index}>{time}</button>
        } else {
            // Preset time
            if (selectedGameMode)
                return <button
                    key={index}
                    onClick={() => { window.location.href = `/play/${selectedGameMode}/${Math.round(time[0]*60)}+${Math.round(time[1])}` }}>
                    {time[0]} + {time[1]}
                </button>
            else
                return <button
                    key={index}
                    className='disabled'>
                    {time[0]} + {time[1]}
                </button>
        }
    })

    return <div id='play-selector' className={open}>
        <h2>Play A Game</h2>
        <h3>Mode</h3>
        {/* <button onClick={toggleOpen}>toggle</button> */}
        <div className='game-modes'>
            {gameModeSelection}
        </div>
        <h3>Time Controls</h3>
        <div className='time-selections' style={{
            gridTemplateColumns: `repeat(${colAmt}, 1fr)`,
            gridTemplateRows: `repeat(${rowAmt}, 1fr)`
        }}>
            {timeSelection}
        </div>
    </div>
}

export default PlaySelectionMenu