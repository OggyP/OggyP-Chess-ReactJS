import { GameModes } from "../chessLogic/types";

const gameModeToName: Map<string, string> = new Map([
    ['standard', 'Standard'],
    ['960', 'Chess960'],
    ['fourkings', 'Four Kings']
])

const gameModesList: [string, string][] = [
    ['standard', 'Standard'],
    ['960', 'Chess 960'],
    ['fourkings', 'Four Kings']
]

const validGameModes = ['standard', '960', 'fourkings']
type gameModeNamesType = 'standard' | '960' | 'fourkings'

function checkGameMode(gameMode: string): GameModes | null {
    if (validGameModes.includes(gameMode))
        return gameMode as GameModes
    return null
}

export { gameModeToName, gameModesList, checkGameMode, validGameModes }
export type { GameModes, gameModeNamesType }