import { GameModes } from "../chessLogic/types"

const validGameModes = ['standard', '960']
function checkGameMode(gameMode: string): GameModes | null {
    if (validGameModes.includes(gameMode))
        return gameMode as GameModes
    return null
}

export default checkGameMode