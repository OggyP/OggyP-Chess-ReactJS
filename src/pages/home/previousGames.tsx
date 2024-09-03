import React from 'react';
import { userInfo } from '../../helpers/verifyToken';
import { gameModeToName } from '../../helpers/gameModes';

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

function PreviousGames(props: { gameInfo: gameInfo[], userInfo: userInfo }) {
    let games: JSX.Element[] = []
    for (let i = 0; i < props.gameInfo.length; i++) {
        const value = props.gameInfo[i]
        const urlToGoTo = '/viewGame/' + value.id + ((value.white.split('|').slice(-1)[0] === props.userInfo?.username) ? '' : '?viewAs=black')
        
        // Usernames in previous games are stores as TITLE|username
        let split = {
            white: value.white.split('|'),
            black: value.black.split('|')
        }

        let username = {
            white: split.white.slice(-1)[0],
            black: split.black.slice(-1)[0]
        }
        
        // let winSymbol
        // const ownTeam = (value.white.split('|').slice(-1)[0] === props.userInfo.username) ? 'white' : 'black'
        let winSymbol = 'loss'
        let result
        const ownTeam = (username.white === props.userInfo.username) ? 'white' : 'black'
        if (ownTeam === value.winner)
            winSymbol = result = 'win'
        else if (value.winner === 'draw') {
            winSymbol = 'handshake-light'
            result = 'draw'
        }

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
                        <span className='number'>{symbols.white}</span>
                        <span className='name'>
                            {titles.white ? <span className='title'>{titles.white}</span> : null}
                            {username.white}
                        </span>
                    </div>
                    <div className='black'>
                        <span className='number'>{symbols.black}</span>
                        <span className='name'>
                            {titles.black ? <span className='title'>{titles.black}</span> : null}
                            {username.black}
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

    return <ul>{games}</ul>
}

export default PreviousGames