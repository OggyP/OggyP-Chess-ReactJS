import DefaultBoard from '../default/board';
import Board from './board'
import { convertToPosition, convertToChessNotation } from './functions';
import { Pawn } from './pieces';
import { Vector, Teams, PieceCodes } from './types'
import genBoard from './startingPosition'

async function getJSON(path: string, callback: Function) {
    return callback(await fetch(path).then(r => r.json()));
}

interface GameConstuctorInput {
    fen?: {
        val: string
        meta?: Map<string, string>
    }
    pgn?: string
}

type GameOverType = {
    winner: Teams | "draw"
    by: string
    extraInfo?: string
} | false

interface History {
    board: DefaultBoard
    text: string
    move: {
        start: Vector
        end: Vector
        type: string[]
        notation: {
            short: string
            long: string
        }
    } | null
}

interface PlayerInfo {
    username: string
    rating: number
}

interface Opening {
    Name: string,
    ECO: string | null
}

class Game {
    static openings: any;
    static boardType = Board
    static genBoard = () => genBoard(Math.floor(Math.random() * 961))
    private _history: History[] = [];
    public shortNotationMoves: string = ''
    public gameOver: GameOverType = false
    public startingFEN: string;
    public metaValues: Map<string, string>;
    public metaValuesOrder: string[];
    public opening: Opening = {
        "Name": "Custom Position",
        "ECO": null
    }
    constructor(input: GameConstuctorInput) {
        getJSON('/assets/openings.json', (data: object) => { Game.openings = data; this.checkForOpening() })
        this.metaValuesOrder = ['Event', 'Site', 'Date', 'Round', 'White', 'Black', 'WhiteElo', 'BlackElo', 'Result', 'Variant', 'TimeControl', 'ECO', 'Opening', 'FEN']
        if (input.pgn) {
            // Parse PGN
            this.startingFEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w AHah - 0 1"
            const currentDate = new Date()
            this.metaValues = new Map([
                ['Event', '?'],
                ['Site', 'https://chess.oggyp.com'],
                ['Date', currentDate.getFullYear() + '.' + currentDate.getMonth() + '.' + currentDate.getDate()],
                ['Round', '?'],
                ['White', '?'],
                ['Black', '?'],
                ['Result', '*'],
                ['Variant', 'Standard'],
                ['TimeControl', '-'],
                ['ECO', '?'],
                ['Opening', '?']
            ])

            let lines = input.pgn.split('\n')
            const lastLine = (lines.pop() as string)?.split('{')
            let lastLineParsed = lastLine[0]
            for (let i = 1; i < lastLine?.length; i++) {
                const splitExtraComment = lastLine[i].split(') ')
                if (splitExtraComment.length === 2)
                    lastLineParsed += splitExtraComment[1]
                else
                    lastLineParsed += lastLine[i].split('} ')[1]
            }

            lastLineParsed = lastLineParsed.replace(/\?(!|)/g, '')
            lastLineParsed = lastLineParsed.replace(/\.\.\./g, '.')

            const moves = lastLineParsed.split(' ')
            if (moves.length === 1 && moves[0] === '') moves.pop()
            this.metaValuesOrder = []
            if (!moves) return

            lines.forEach(line => {
                if (!line) return // ignore empty lines
                const words = line.split(' ')
                const metaValueName = words[0].replace('[', '')
                this.metaValues.set(metaValueName, line.split('"')[1])
                if (!this.metaValuesOrder.includes(metaValueName))
                    this.metaValuesOrder.push(metaValueName)
            })

            if (this.metaValues.has('FEN'))
                this.startingFEN = this.metaValues.get('FEN') as string

            let board = new Board(this.startingFEN)

            this._history = [{
                board: new Board(board),
                text: "Starting Position",
                move: null
            }]

            let turn: Teams = 'white'
            for (let i = 0; i < moves.length; i++) {
                const originalPGNmove = moves[i]
                let move = moves[i].replace('+', '').replace('#', '')
                if (!isNaN(Number(move[0]))) {
                    if (i === moves.length - 1) {
                        const gameOverScoreToWinner = new Map([
                            ['1-0', 'white',],
                            ['1/2-1/2', 'draw'],
                            ['0-1', 'black']
                        ])
                        const winner = gameOverScoreToWinner.get(move)
                        if (winner)
                            this.setGameOver({
                                winner: winner as Teams | "draw",
                                by: 'Unknown'
                            })
                    }
                    continue
                }
                if (move === 'O-O-O' || move === '0-0-0' || move === 'O-O' || move === '0-0') { // O and 0 just to be sure 
                    const kingRow = (turn === 'white') ? 7 : 0
                    const lookingForTag = (move === 'O-O' || move === '0-0') ? 'castleKingSide' : 'castleQueenSide'
                    let moveFound = false;
                    
                    for (let x = 0; x < 8; x++) {
                        const pos = {
                            x: x,
                            y: kingRow
                        }
                        const piece = board.getPos(pos)
                        if (piece && piece.team === turn) {
                            const movesList = piece.getMoves(pos, board)
                            for (let i = 0; i < movesList.length; i++) {
                                const checkMove = movesList[i]
                                if (checkMove.moveType.includes(lookingForTag)) {
                                    board = new Board(checkMove.board)
                                    this.newMove({
                                        board: checkMove.board,
                                        text: originalPGNmove,
                                        move: {
                                            start: pos,
                                            end: checkMove.move,
                                            type: checkMove.moveType,
                                            notation: {
                                                short: originalPGNmove,
                                                long: convertToChessNotation(pos) + convertToChessNotation(checkMove.move)
                                            }
                                        }
                                    })
                                    moveFound = true;
                                    break;
                                }
                            }
                        }
                    }
                    if (!moveFound) {
                        console.warn('No legal castle found. ', board.getFen())
                        break;
                    }
                } else if (move[0] === move[0].toLowerCase()) {
                    // pawn move
                    let startingPos: Vector = { 'x': convertToPosition(move[0], 'x') as number, 'y': -1 }
                    let endingPos: Vector
                    if (move.includes('x'))
                        move = move.split('x')[1]
                    endingPos = convertToPosition(move) as Vector
                    // now we need to find the starting y value
                    let moveInfo: History | null = null
                    for (let y = 0; y < 8 && !moveInfo; y++) {
                        if (y === startingPos.y) continue
                        startingPos.y = y
                        const piece = board.getPos(startingPos)
                        if (piece && piece instanceof Pawn && piece.team === turn) {
                            let moves = piece.getMoves(startingPos, board)
                            for (let i = 0; i < moves.length; i++) {
                                const checkMove = moves[i]
                                if (checkMove.move.x === endingPos.x && checkMove.move.y === endingPos.y) {
                                    board = new Board(checkMove.board)
                                    moveInfo = {
                                        board: checkMove.board,
                                        text: originalPGNmove,
                                        move: {
                                            start: startingPos,
                                            end: endingPos,
                                            type: checkMove.moveType,
                                            notation: {
                                                short: originalPGNmove,
                                                long: convertToChessNotation(startingPos) + convertToChessNotation(endingPos)
                                            }
                                        }
                                    }
                                    break;
                                }
                            }
                        }
                    }
                    if (!moveInfo) {
                        console.warn("No legal pawn move was found. ", board.getFen())
                        break;
                    }
                    if (move[2] === '=') {
                        moveInfo.board.promote(endingPos, move.split('=')[1].toLowerCase() as PieceCodes, turn)
                        if (moveInfo.move)
                            moveInfo.move.notation.long += move.split('=')[1].toLowerCase() as string
                        board = new Board(moveInfo.board)
                    }
                    this.newMove(moveInfo)
                } else {
                    // other piece move
                    move = move.replace('x', '')
                    const pieceType = move[0].toLowerCase()
                    const endingPos = convertToPosition(move.slice(-2)) as Vector
                    const requirementsOptions = move.slice(1, -2)
                    let requirements: {
                        'x': number | null,
                        'y': number | null,
                    } = {
                        'x': null,
                        'y': null,
                    }
                    for (let j = 0; j < requirementsOptions.length; j++) {
                        if (isNaN(Number(requirementsOptions[j])))
                            // Letter X
                            requirements.x = convertToPosition(requirementsOptions[j], 'x') as number
                        else
                            // Number Y
                            requirements.y = convertToPosition(requirementsOptions[j], 'y') as number
                    }
                    let pos: Vector = { "x": 0, "y": 0 }
                    let foundMove = false
                    for (pos.x = 0; pos.x < 8 && !foundMove; pos.x++)
                        for (pos.y = 0; pos.y < 8 && !foundMove; pos.y++)
                            if (pos.x !== endingPos.x || pos.y !== endingPos.y) {
                                if (requirements.x && requirements.x !== pos.x) continue
                                if (requirements.y && requirements.y !== pos.y) continue
                                let piece = board.getPos(pos)
                                if (!piece || piece.team !== turn || piece.code !== pieceType) continue
                                let moves = piece.getMoves(pos, board)
                                for (let i = 0; i < moves.length; i++) {
                                    const checkMove = moves[i]
                                    if (checkMove.move.x === endingPos.x && checkMove.move.y === endingPos.y) {
                                        foundMove = true
                                        board = new Board(checkMove.board)
                                        this.newMove({
                                            board: checkMove.board,
                                            text: originalPGNmove,
                                            move: {
                                                start: { 'x': pos.x, 'y': pos.y },
                                                end: endingPos,
                                                type: checkMove.moveType,
                                                notation: {
                                                    short: originalPGNmove,
                                                    long: convertToChessNotation(pos) + convertToChessNotation(endingPos)
                                                }
                                            }
                                        })
                                        break;
                                    }
                                }
                            }
                    if (!foundMove) {
                        console.warn("No legal normal move found at " + originalPGNmove + " | " + board.getFen() + " Current turn: " + turn + '')
                        break;
                    }
                }
                turn = (turn === 'white') ? 'black' : 'white' // invert team
                this.gameOver = board.isGameOverFor(turn)
            }
        }
        else if (input.fen) {
            if (input.fen.meta)
                this.metaValues = input.fen.meta
            else {
                const currentDate = new Date()
                this.metaValues = new Map([
                    ['Event', '?'],
                    ['Site', 'https://chess.oggyp.com'],
                    ['Date', currentDate.getFullYear() + '.' + currentDate.getMonth() + '.' + currentDate.getDate()],
                    ['Round', '?'],
                    ['White', '?'],
                    ['Black', '?'],
                    ['Result', '*'],
                    ['Variant', 'Standard'],
                    ['TimeControl', '-'],
                    ['ECO', '?'],
                    ['Opening', '?'],
                    ['FEN', input.fen.val]
                ])
            }
            this._history = [{
                board: new Board(input.fen.val),
                text: "Starting Position",
                move: null
            }]
            this.startingFEN = input.fen.val
        } else
            throw (new Error("You must specify either a FEN or PGN to track game history."))
    }

    checkForOpening(): void {
    }

    getPlayerInfo(): {
        white: PlayerInfo
        black: PlayerInfo
    } | null {
        if (this.metaValues.has('White') && this.metaValues.has('Black') && (this.metaValues.get('White') !== '?' || this.metaValues.get('Black') !== '?')) {
            let ratings = {
                white: (this.metaValues.has('WhiteElo')) ? Number(this.metaValues.get('WhiteElo')) : 0,
                black: (this.metaValues.has('BlackElo')) ? Number(this.metaValues.get('BlackElo')) : 0
            }
            return {
                white: {
                    username: this.metaValues.get('White') as string,
                    rating: ratings.white
                },
                black: {
                    username: this.metaValues.get('Black') as string,
                    rating: ratings.black
                }
            }
        }
        return null
    }

    setGameOver(gameOver: GameOverType) {
        this.gameOver = gameOver
        if (this.gameOver) {
            const gameOverWinTypes = {
                'white': '1-0',
                'draw': '1/2-1/2',
                'black': '0-1'
            }
            if (this.metaValues.has('Result'))
                this.metaValues.set('Result', gameOverWinTypes[this.gameOver.winner])
        }
    }

    getMoveCount(): number {
        return this._history.length - 1
    }

    getMove(moveNum: number): History {
        return this._history[moveNum]
    }

    getLatest(): History {
        return this._history[this.getMoveCount()]
    }

    isGameOver(): GameOverType {
        const gameOverInfo = this.getLatest().board.isGameOverFor(this.getLatest().board.getTurn('next'))
        if (gameOverInfo) {
            const gameOverWinTypes = {
                'white': '1-0',
                'draw': '1/2-1/2',
                'black': '0-1'
            }
            const gameOverType = gameOverWinTypes[gameOverInfo.winner]
            if (this.metaValues.has('Result'))
                this.metaValues.set('Result', gameOverType)
            this.gameOver = gameOverInfo
        }
        return gameOverInfo
    }

    doMove(startPos: Vector, endPos: Vector, promotion: PieceCodes | undefined = undefined, allowPromotion = true): true | string {
        const latestBoard = this.getLatest().board
        const piece = latestBoard.getPos(startPos)
        if (!piece) return `Wrong piece being moved\n${latestBoard.getFen()}`
        if (piece.team !== latestBoard.getTurn('next')) return `It is not your turn\n${latestBoard.getFen()}`
        const moves = piece.getMoves(startPos, latestBoard)
        for (let i = 0; i < moves.length; i++) {
            const move = moves[i]
            if (!allowPromotion && move.moveType.includes('promote')) return `Attempted to promote\n${latestBoard.getFen()}`
            if (move.move.x !== endPos.x || move.move.y !== endPos.y) continue
            const newBoard = new Board(move.board)
            if (promotion) {
                if (!['p', 'r', 'n', 'b', 'q', 'k'].includes(promotion)) return `Invalid promotion piece ${promotion}`
                newBoard.promote(endPos, promotion, newBoard.getTurn('prev'))
            }
            const isGameOver = newBoard.isGameOverFor(newBoard.getTurn('next'))
            const shortNotation = newBoard.getShortNotation(startPos, endPos, move.moveType, latestBoard as Board, (isGameOver && isGameOver.by === 'checkmate') ? "#" : ((newBoard.inCheck(newBoard.getTurn('next')).length ? '+' : '')), promotion)
            this.newMove({
                board: newBoard,
                text: shortNotation,
                move: {
                    start: startPos,
                    end: endPos,
                    type: move.moveType,
                    notation: {
                        short: shortNotation,
                        long: convertToChessNotation(startPos) + convertToChessNotation(endPos) + ((promotion) ? promotion : '')
                    }
                }
            })
            this.setGameOver(isGameOver)
            return true
        }
        return `No legal move found\n${latestBoard.getFen()}`
    }

    newMove(move: History) {
        this._history.push(move)

        let i = this.getMoveCount()
        const moveInfo = move.move
        if (moveInfo) {
            if (i % 2 === 1) {
                this.shortNotationMoves += ((i !== 1) ? ' ' : '') + ((i - 1) / 2 + 1) + '.'
            }
            this.shortNotationMoves += ' ' + moveInfo.notation.short
        }
    }

    resetToMove(moveNum: number) {
        const newHistory = this._history.slice(0, moveNum + 1)
        this._history = newHistory

        this.shortNotationMoves = ''
        for (let i = 0; i < this._history.length; i++) {
            const move = this._history[i]
            const moveInfo = move.move
            if (moveInfo) {
                if (i % 2 === 1) {
                    this.shortNotationMoves += ((i !== 1) ? ' ' : '') + ((i - 1) / 2 + 1) + '.'
                }
                this.shortNotationMoves += ' ' + moveInfo.notation.short
            }
        }

        if (!Game.openings) return
        const opening: { Name: string, ECO: string } = Game.openings[this.shortNotationMoves]
        if (this.getMoveCount() < 25 && opening) {
            this.metaValues.set('Opening', opening.Name)
            this.metaValues.set('ECO', opening.ECO)
            this.opening = opening as Opening
        }
    }

    getPGN(): string {
        let pgn: string = ''
        this.metaValuesOrder.forEach(value => {
            pgn += `[${value} "${this.metaValues.get(value)}"]\n`
        })
        pgn += '\n' + this.shortNotationMoves
        const gameOverWinTypes = {
            'white': '1-0',
            'draw': '1/2-1/2',
            'black': '0-1'
        }
        if (this.gameOver) pgn += ' ' + gameOverWinTypes[this.gameOver.winner]
        return pgn
    }

    // Returns the moves in long notation from the starting position
    getMovesTo(halfMoveNum: number): string[] {
        let moves: string[] = []
        for (let i = 0; i <= halfMoveNum; i++) {
            const move = this._history[i].move
            if (move)
                moves.push(move.notation.long)
        }
        return moves
    }
}

export default Game