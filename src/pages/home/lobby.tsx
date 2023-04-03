import React, { useState } from 'react';

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


interface queueInfo {
    player: user
    gameInfo: gameOptions
}

interface LobbyMenuProps {
    queues: queueInfo[]
}

function LobbyMenu(props: LobbyMenuProps) {

    const fullChessModeNames = {
        'standard': 'Standard',
        '960': '960'
    }

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
                    <td>{data.player.username}</td>
                    <td>{data.player.rating}{(data.player.ratingDeviation > 125) ? '?' : ''}</td>
                    <td>{data.gameInfo.time.base / 60}+{data.gameInfo.time.increment}</td>
                    <td>{fullChessModeNames[data.gameInfo.mode]}</td>
                </tr>
            ))}
        </tbody>
    </table>
}

export default LobbyMenu
export type {queueInfo}