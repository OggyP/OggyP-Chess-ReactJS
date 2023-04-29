import React from 'react';
import { gameTypeTypes, gameTypes, ChessBoardType, getChessGame, PieceCodes, Teams, PieceAtPos, convertToChessNotation, Vector, pieceStyle } from './chessLogic/chessLogic'
import PromotePiece from './tsxAssets/pieces/promotePiece'
import { pieceImageType } from './tsxAssets/pieces/pieceInfo'
import Board from './board'
import EngineInfo from './tsxAssets/engineEvalInfo'
import UCIengine from './engine'
import PreviousMoves from './tsxAssets/previousMoves'
import { sendToWs } from './helpers/wsHelper';
import UserInfoDisplay from './tsxAssets/UserInfo'
import { cancelOutCapturedMaterial as cancelOutMaterial } from './chessLogic/standard/functions';
import { MovesAndBoard } from './chessLogic/types'
import iOS from './helpers/isIOS'
import { userInfo } from './helpers/verifyToken';
import displayRating from './helpers/displayRating'
import { gameModeNamesType } from './helpers/gameModes';

const boardSize = 0.87
const minAspectRatio = 1.2

interface TimerInfo {
    startTime: number; // UNIX Time
    countingDown: boolean
    time: number
}

interface PlayerInfo {
    userId?: number,
    username: string,
    createdAt?: Date,
    wins?: number,
    draws?: number,
    gamesPlayed?: number,
    rating: number,
    gameIds?: string,
    ratingDeviation?: number,
    title?: string,
    ratingChange?: number
}

interface GameState {
    game: gameTypes
    viewingMove: number
    validMoves: MovesAndBoard[]
    selectedPiece: Vector | null
    notFlipped: boolean
    boxSize: number
    promotionSelector: {
        team: Teams
        moveType: string[]
        board: ChessBoardType
        pos: {
            start: Vector
            end: Vector
        }
    } | null
    moveRightSection: boolean
    players: {
        white: PlayerInfo
        black: PlayerInfo
    } | null
    timers?: {
        white: TimerInfo
        black: TimerInfo
    }
    premoveBoard: ChessBoardType | null
    premoves: { start: Vector, end: Vector }[]
    onMobile: boolean
    piecesStyle: pieceStyle
    boardStyle: {
        white: string,
        black: string,
    }
    loadedNNUE: boolean,
    resetGameFEN: string
    spectators: userInfo[]
}

interface GameProps {
    fen?: string
    pgn?: string
    multiplayerWs?: WebSocket
    mode: gameModeNamesType
    team: Teams | "any" | "none"
    onMounted?: Function
    players?: {
        white: PlayerInfo
        black: PlayerInfo
    }
    allowMoving: boolean
    allowPreMoves: boolean
    termination?: string
    pgnAndFenChange?: boolean
    versusStockfish?: {
        skill: number
        fastGame: boolean
    } | undefined
    allowOverridingMoves: boolean
    resetGameReloads: boolean
    viewAs: Teams
}

class Game extends React.Component<GameProps, GameState> {
    engine: UCIengine | null = null
    getDraggingPiece: Function | undefined
    clearCustomSVGS: Function | undefined
    engineMoveType = 'movetime 60000'
    gameType: gameTypeTypes

    constructor(props: GameProps) {
        super(props)
        this.gameType = getChessGame(this.props.mode)
        if (
            !(('fourkings').includes(this.props.mode)) && (
                !(props.multiplayerWs && props.team !== 'none')
                || (props.players &&
                    ((props.players.white.username === 'OggyP' && props.team === 'white')
                        || (props.players.black.username === 'OggyP' && props.team === 'black')))
            )
        ) {
            let startingCommands = [
                "isready",
                "ucinewgame"
            ]
            if (!props.versusStockfish)
                startingCommands.unshift('setoption name UCI_AnalyseMode value true')
            if (props.mode === '960')
                startingCommands.unshift('setoption name UCI_Chess960 value true')

            var wasmSupported = typeof WebAssembly === 'object' && WebAssembly.validate(Uint8Array.of(0x0, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00));

            const stockfishVersion = ("undefined" != typeof SharedArrayBuffer && !iOS()) ? '/stockfish/stockfish.js' : `/badStockfish/${wasmSupported ? 'stockfish.js' : 'stockfish.js'}`
            console.info("Using Stockfish: ", stockfishVersion)

            this.engine = new UCIengine(stockfishVersion, startingCommands, (props.versusStockfish) ? 1 : 3)
            if (props.versusStockfish)
                this.engineMoveType = this.engine.setDifficulty(props.versusStockfish.skill, props.versusStockfish.fastGame)
        }
        const windowSize = {
            width: window.innerWidth,
            height: window.innerHeight
        }
        let playerInfo = null
        const game = new this.gameType((props.fen) ? { fen: { val: props.fen } } : (props.pgn) ? { pgn: props.pgn } : { fen: { val: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1" } })
        if (props.pgn) {
            playerInfo = game.getPlayerInfo()
            game.isGameOver()
            if (props.termination) {
                const serverGameOverTypes = ['resignation', 'timeout', 'game abandoned']
                if (serverGameOverTypes.includes(props.termination)) {
                    const gameResult = game.metaValues.get('Result')
                    if (gameResult && gameResult !== '*') {
                        const gameOverScoreToWinner = {
                            '1-0': 'white',
                            '1/2-1/2': 'draw',
                            '0-1': 'black'
                        }
                        game.setGameOver({
                            winner: gameOverScoreToWinner[gameResult as '1-0' | '1/2-1/2' | '0-1'] as Teams | 'draw',
                            by: props.termination,
                        })
                    }
                }
            }
        }

        const boardStyleSavedVal = localStorage.getItem('boardStyle')
        let boardStyle: {
            white: string,
            black: string,
        }

        if (boardStyleSavedVal) {
            try {
                boardStyle = JSON.parse(boardStyleSavedVal)
            }
            catch {
                boardStyle = {
                    white: '#f0d9b5',
                    black: '#b58863',
                }
            }
        } else {
            boardStyle = {
                white: '#f0d9b5',
                black: '#b58863',
            }
        }

        this.state = {
            game: game,
            viewingMove: (this.props.multiplayerWs) ? game.getMoveCount() : 0, // make it `game.getMoveCount()` to go to the lastest move
            validMoves: [],
            notFlipped: props.viewAs === 'white',
            selectedPiece: null,
            promotionSelector: null,
            boxSize: Math.floor(Math.min(windowSize.height * boardSize, windowSize.width) / 8),
            moveRightSection: false,
            players: (props.players || playerInfo),
            premoveBoard: null,
            premoves: [],
            onMobile: windowSize.height * minAspectRatio > windowSize.width,
            piecesStyle: (localStorage.getItem('pieceStyle') as pieceStyle || 'normal'),
            boardStyle: boardStyle,
            loadedNNUE: (this.engine?.loadedNNUE || false),
            resetGameFEN: "",
            spectators: []
        }
        this.boardMoveChanged((this.props.multiplayerWs) ? game.getMoveCount() : 0, true, true)
        if (props.pgnAndFenChange) this.updateURLtoHavePGN()
    }

    gameBoardMounted(callbacks: any) {
        this.getDraggingPiece = callbacks.getDraggingPiece
        this.clearCustomSVGS = callbacks.clearCustomSVGS
    }

    flipBoard(): void {
        this.setState({
            "notFlipped": !this.state.notFlipped
        })
    }

    doEngineMove = (event: any) => {
        if (this.state.game.gameOver) return
        const move = event.detail
        this.doMove(move.startingPos, move.endingPos, move.promotion)
    }

    boardMoveChanged(moveNum: number, firstMove: boolean = false, goingToNewMove = false) {
        if (this.engine)
            if (!this.props.versusStockfish || goingToNewMove || this.state.game.gameOver)
                this.engine.go(this.state.game.startingFEN, this.state.game.getMovesTo(moveNum), this.engineMoveType)
        if (this.state.game.getMoveCount() !== moveNum && !firstMove)
            this.setState({
                premoves: [],
                premoveBoard: null
            })
        if (this.clearCustomSVGS)
            this.clearCustomSVGS()
    }

    setSpectators(spectators: userInfo[]) {
        this.setState({
            spectators: spectators
        })
    }

    customGameOver(winner: Teams | 'draw', by: string, extraInfo?: string) {
        this.state.game.setGameOver({
            winner: winner,
            by: by,
            extraInfo: extraInfo
        })
        this.setState({
            game: this.state.game
        })
    }

    handlePromotionClick(piece: PieceCodes): void {
        const info = this.state.promotionSelector
        if (info && !this.state.game.gameOver && this.state.viewingMove === this.state.game.getMoveCount() && info.team === this.state.game.getLatest().board.getTurn('next')) {
            const newBoard = new this.gameType.boardType(info.board)
            newBoard.promote(info.pos.end, piece, info.team)
            if (!newBoard.inCheck(info.team)) {
                const isGameOver = newBoard.isGameOverFor(newBoard.getTurn('next'))
                const shortNotation = newBoard.getShortNotation(info.pos.start, info.pos.end, this.state.promotionSelector?.moveType as string[], this.latestBoard(), (isGameOver && isGameOver.by === 'checkmate') ? "#" : ((newBoard.inCheck(newBoard.getTurn('next')) ? '+' : '')), piece)
                this.state.game.newMove({
                    board: newBoard,
                    text: shortNotation,
                    move: {
                        start: info.pos.start,
                        end: info.pos.end,
                        type: this.state.promotionSelector?.moveType as string[],
                        notation: {
                            short: shortNotation,
                            long: convertToChessNotation(info.pos.start) + convertToChessNotation(info.pos.end) + piece
                        }
                    }
                })
                this.state.game.setGameOver(isGameOver)
                const newViewNum = this.state.viewingMove + 1
                this.setState({
                    game: this.state.game,
                    selectedPiece: null,
                    validMoves: [],
                    promotionSelector: null,
                    viewingMove: newViewNum,
                })
                this.boardMoveChanged(newViewNum, false, true)
                if (this.props.multiplayerWs)
                    sendToWs(this.props.multiplayerWs, 'move', {
                        startingPos: [info.pos.start.x, info.pos.start.y],
                        endingPos: [info.pos.end.x, info.pos.end.y],
                        promote: piece
                    })
                if (this.props.pgnAndFenChange) this.updateURLtoHavePGN()
            }
            else
                alert("L, you can't do that because you will be in check!")
        } else
            console.warn("Promotion Turn / Piece Check Failed")
    }

    deselectPiece(): void {
        this.setState({
            validMoves: [],
            selectedPiece: null
        })
    }

    addPremove(start: Vector, end: Vector): void {
        if (!this.props.allowPreMoves || this.state.game.gameOver) return
        const premoveList = this.state.premoves.slice()
        premoveList.push({
            start: start,
            end: end
        })
        let preMoveBoard = new this.gameType.boardType(this.state.premoveBoard || this.latestBoard())
        preMoveBoard.setPos(end, preMoveBoard.getPos(start))
        preMoveBoard.setPos(start, null)
        this.setState({
            premoves: premoveList,
            premoveBoard: preMoveBoard
        })
    }

    doMove(startPos: Vector, endPos: Vector, promotion: PieceCodes | undefined = undefined) {
        const viewingLatestMove = this.viewingBoard().halfMoveNumber === this.latestBoard().halfMoveNumber
        const piece = this.latestBoard().getPos(startPos)
        if (!piece) return
        if (piece.team === this.props.team) return
        this.state.game.doMove(startPos, endPos, promotion)
        let newViewNum = this.state.viewingMove + 1

        // Pre Moves
        if (this.state.premoves.length > 0) {
            const premove = this.state.premoves.shift()
            let premoveError = false
            if (!premove) throw new Error("premove is undefined");
            const piece = this.latestBoard().getPos(premove.start)
            if (!piece) premoveError = true
            if (piece && piece.team !== this.props.team) premoveError = true
            if (this.state.game.doMove(premove.start, premove.end, undefined, false) !== true) premoveError = true
            if (premoveError)
                this.setState({
                    premoves: [],
                    premoveBoard: null
                })
            else if (this.props.allowPreMoves) {
                newViewNum++
                if (!this.state.premoves.length) {
                    this.setState({
                        premoves: [],
                        premoveBoard: null
                    })
                } else {
                    // Update Premove board
                    const newBoard = new this.gameType.boardType(this.latestBoard())
                    this.state.premoves.forEach(premove => {
                        newBoard.setPos(premove.end, newBoard.getPos(premove.start))
                        newBoard.setPos(premove.start, null)
                    })
                    this.setState({
                        premoveBoard: newBoard
                    })
                }
                if (this.props.multiplayerWs)
                    sendToWs(this.props.multiplayerWs, 'move', {
                        startingPos: [premove.start.x, premove.start.y],
                        endingPos: [premove.end.x, premove.end.y],
                    })
            }
        }

        this.setState({
            game: this.state.game,
        })
        if (viewingLatestMove) {
            this.setState({
                viewingMove: newViewNum
            })
            this.boardMoveChanged(newViewNum, false, true)
            if (this.getDraggingPiece) {
                const draggingPiece = this.getDraggingPiece()
                if (draggingPiece)
                    this.handlePieceClick(draggingPiece as Vector)
            }
        }
    }

    updateURLtoHavePGN() {
        let queries = ''
        if (this.state.game.metaValues.get('White') && this.state.game.metaValues.get('White') !== '?') {
            const toSet = encodeURIComponent(this.state.game.getPGN().replace(/ /g, '_'))
            if (toSet)
                queries = '?pgn=' + toSet
        }
        else {
            const toSet = encodeURIComponent(this.state.game.shortNotationMoves.replace(/ /g, '_'))
            if (toSet)
                queries = '?pgn=' + toSet
        }
        if (this.state.game.startingFEN && this.state.game.startingFEN !== "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1") {
            queries += ((queries) ? '&' : '?') + "fen=" + this.state.game.startingFEN.replace(/ /g, '_')
        }
        window.history.pushState('OggyP Chess Analysis', 'Shared Analysis', window.location.pathname + queries);
    }

    handlePieceClick(posClicked: Vector): void {
        if (this.props.team === 'none') return
        if (!this.state.game.gameOver
            && this.state.viewingMove === this.state.game.getMoveCount()
            && this.latestBoard().getPos(posClicked)?.team === this.latestBoard().getTurn('next')
            && (this.props.team === 'any'
                || this.latestBoard().getTurn('next') === this.props.team)) {
            const newValidMoves = this.latestBoard().getPos(posClicked)?.getMoves(posClicked, this.latestBoard())
            if (newValidMoves)
                this.setState({
                    validMoves: newValidMoves,
                    selectedPiece: posClicked
                })
        } else if (this.props.allowOverridingMoves
            && this.viewingBoard().getPos(posClicked)?.team === this.viewingBoard().getTurn('next')
            && (this.props.team === 'any'
                || this.viewingBoard().getTurn('next') === this.props.team)) {
            const newValidMoves = this.viewingBoard().getPos(posClicked)?.getMoves(posClicked, this.viewingBoard())
            if (newValidMoves)
                this.setState({
                    validMoves: newValidMoves,
                    selectedPiece: posClicked
                })
        } else if (this.state.validMoves.length || this.state.selectedPiece) {
            this.setState({
                validMoves: [],
                selectedPiece: null
            })
        }
    }

    latestBoard(): ChessBoardType {
        return this.state.game.getLatest().board
    }

    viewingBoard(): ChessBoardType {
        return this.state.game.getMove(this.state.viewingMove).board
    }

    handleMoveClick(posClicked: Vector): void {
        if (this.props.team === 'none') return
        if ((!this.state.game.gameOver
            && this.state.viewingMove === this.state.game.getMoveCount())
            || (this.props.allowOverridingMoves)) {
            let newBoard: ChessBoardType | null = null
            let moveType: string[] | null = null
            let displayPos: Vector | null = null

            if (!this.state.selectedPiece) throw new Error("selected piece is undefined");

            const selectedPiecePos = Object.assign({}, this.state.selectedPiece)

            let selectedPiece: PieceAtPos = null
            if (selectedPiecePos)
                selectedPiece = this.viewingBoard().getPos(selectedPiecePos)
            for (let i = 0; i < this.state.validMoves.length; i++) {
                const checkMove = this.state.validMoves[i]
                if (checkMove.move.x === posClicked.x && checkMove.move.y === posClicked.y) {
                    newBoard = checkMove.board
                    moveType = checkMove.moveType
                    displayPos = (checkMove.displayVector) ? checkMove.displayVector : posClicked
                }
            }

            if (!displayPos) throw new Error("Display pos is null");

            newBoard = newBoard as ChessBoardType

            if (this.state.viewingMove !== this.state.game.getMoveCount())
                this.state.game.resetToMove(this.state.viewingMove)

            let isPromotion = false
            if (selectedPiece && selectedPiecePos) {
                if (moveType && moveType.includes('promote')) {
                    isPromotion = true
                    this.setState({
                        promotionSelector: {
                            team: selectedPiece.team,
                            moveType: moveType,
                            board: newBoard,
                            pos: {
                                start: selectedPiecePos,
                                end: displayPos,
                            }
                        }
                    })
                }
            }
            else
                console.warn("The selected piece was undefined")

            this.setState({
                selectedPiece: null,
                validMoves: []
            })
            if (isPromotion) return
            const isGameOver = newBoard.isGameOverFor(newBoard.getTurn('next'))
            const shortNotation = newBoard.getShortNotation(selectedPiecePos, displayPos, moveType as string[], this.latestBoard(), (isGameOver && isGameOver.by === 'checkmate') ? "#" : ((newBoard.inCheck(newBoard.getTurn('next')) ? '+' : '')))
            this.state.game.newMove({
                board: newBoard,
                text: shortNotation,
                move: {
                    start: selectedPiecePos,
                    end: displayPos,
                    type: moveType as string[],
                    notation: {
                        short: shortNotation,
                        long: convertToChessNotation(selectedPiecePos) + convertToChessNotation(displayPos)
                    }
                }
            })
            this.state.game.setGameOver(isGameOver)
            const newViewNum = this.state.viewingMove + 1
            this.setState({
                game: this.state.game,
                viewingMove: newViewNum
            })
            this.boardMoveChanged(newViewNum, false, true)
            if (this.props.pgnAndFenChange) this.updateURLtoHavePGN()
            if (!this.props.multiplayerWs) return
            sendToWs(this.props.multiplayerWs, 'move', {
                startingPos: [selectedPiecePos.x, selectedPiecePos.y],
                endingPos: [displayPos.x, displayPos.y],
            })
        } else console.warn("Error - Wrong turn / not latest game")
    }

    goToMove(moveNum: number): void {
        if (this.state.promotionSelector) return
        this.setState({
            viewingMove: moveNum,
            validMoves: [],
            selectedPiece: null
        })
        this.boardMoveChanged(moveNum)
    }

    handleResize = (_: any) => {
        const windowSize = {
            width: window.innerWidth,
            height: window.innerHeight
        }
        const newBoxSize = Math.floor(Math.min(windowSize.height * boardSize, windowSize.width) / 8)
        const onMobile = windowSize.height * minAspectRatio > windowSize.width
        if (newBoxSize !== this.state.boxSize || onMobile !== this.state.onMobile) {
            this.setState({
                boxSize: newBoxSize,
                onMobile: windowSize.height * minAspectRatio > windowSize.width,
                validMoves: [],
                selectedPiece: null,
            })
        }
    };

    handleKeyPressed = (event: KeyboardEvent) => {
        switch (event.key) {
            case "ArrowLeft":
                event.preventDefault()
                if (this.state.viewingMove > 0) this.goToMove(this.state.viewingMove - 1)
                break;
            case "ArrowRight":
                event.preventDefault()
                if (this.state.viewingMove < this.state.game.getMoveCount()) this.goToMove(this.state.viewingMove + 1)
                break;
            case "ArrowUp":
                event.preventDefault()
                if (this.state.viewingMove !== this.state.game.getMoveCount()) this.goToMove(this.state.game.getMoveCount())
                break;
            case "ArrowDown":
                event.preventDefault()
                if (this.state.viewingMove !== 0) this.goToMove(0)
                break;
        }
    }

    updateTimer(white: TimerInfo, black: TimerInfo) {
        this.setState({
            timers: {
                white: white,
                black: black
            }
        })
    }

    resetGame(fen: string = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1") {
        if (this.props.resetGameReloads) {
            window.location.reload()
            return
        }

        const game = this.state.game
        // Need to run this becuase 
        game.startingFEN = fen
        game.shortNotationMoves = ""
        game.metaValues = new Map()
        this.setState({
            game: new this.gameType({ fen: { val: fen } })
        });
        if (this.engine) {
            this.engine.reset()
            if (this.props.versusStockfish)
                this.engineMoveType = this.engine.setDifficulty(this.props.versusStockfish.skill, this.props.versusStockfish.fastGame)
        }
        this.goToMove(0)
        this.updateURLtoHavePGN()
        window.history.pushState('OggyP Chess Analysis', 'Shared Analysis', window.location.pathname);
    }

    preventContextMenu(e: any) {
        e.preventDefault()
    }

    componentDidMount() {
        if (this.props.onMounted) {
            this.props.onMounted({
                doMove: (startPos: Vector, endPos: Vector, promotion: PieceCodes | undefined = undefined) => this.doMove(startPos, endPos, promotion),
                gameOver: (winner: Teams | 'draw', by: string, extraInfo?: string) => this.customGameOver(winner, by, extraInfo),
                updateTimer: (white: TimerInfo, black: TimerInfo) => this.updateTimer(white, black),
                setSpectators: (spectators: userInfo[]) => this.setSpectators(spectators)
            });
        }
        document.addEventListener('contextmenu', this.preventContextMenu)
        window.addEventListener("resize", this.handleResize);
        window.addEventListener("keydown", this.handleKeyPressed);
        if (this.props.versusStockfish)
            document.addEventListener("bestmove", this.doEngineMove);
    }

    componentWillUnmount() {
        document.removeEventListener('contextmenu', this.preventContextMenu)
        window.removeEventListener("resize", this.handleResize);
        window.removeEventListener("keydown", this.handleKeyPressed);
        if (this.props.versusStockfish)
            document.removeEventListener("bestmove", this.doEngineMove);
    }

    render() {
        let promotionSelector
        const promotionSelectorVal = this.state.promotionSelector

        if (this.state.game.gameOver && (!this.engine || this.engine.multiPV === 1)) {
            this.engineMoveType = 'movetime 60000'
            this.engine = new UCIengine('/stockfish/stockfish.js', [
                'setoption name UCI_AnalyseMode value true',
                "isready",
                "ucinewgame"
            ], 3)
            this.boardMoveChanged(this.state.viewingMove)
        }

        if (promotionSelectorVal) {
            const promotionChoices: PieceCodes[] = ['q', 'n', 'b', 'r']
            const promotionOptionsDisplay = promotionChoices.map((item, index) => {
                const x = promotionSelectorVal.pos.end.x
                const y = (promotionSelectorVal.team === 'white') ? index : (7 - index)
                return <PromotePiece
                    key={index}
                    style={this.state.piecesStyle}
                    team={promotionSelectorVal.team}
                    x={(this.state.notFlipped) ? x * 12.5 : (7 - x) * 12.5}
                    y={(this.state.notFlipped) ? y * 12.5 : (7 - y) * 12.5}
                    type={item}
                    onClick={() => this.handlePromotionClick(item)}
                />
            })
            promotionSelector = <div id="promotion-choice">{promotionOptionsDisplay}</div>
        }

        let engineInfo = null
        if (this.engine)
            engineInfo = <EngineInfo
                showMoves={(!this.props.versusStockfish || !!this.state.game.gameOver)}
                showEval={(!this.props.versusStockfish || !!this.state.game.gameOver)}
                mobile={this.state.onMobile}
            />

        let players: {
            white: JSX.Element | null,
            black: JSX.Element | null
        } = {
            white: null,
            black: null
        }

        const currentTurn = (this.state.game.gameOver) ? 'None' : this.latestBoard().getTurn('next')

        let timers = this.state.timers
        let cancelledOutTakenMaterial = cancelOutMaterial(this.viewingBoard().capturedPieces.white, this.viewingBoard().capturedPieces.black)
        let teamArray: Teams[] = ['white', 'black']
        teamArray.forEach((item: Teams) => {
            let team = item as Teams
            if (timers && this.state.game.gameOver)
                timers[team].countingDown = false
            players[team] = <UserInfoDisplay
                team={team}
                username={this.state.players?.[team].username || team.charAt(0).toUpperCase() + team.slice(1)}
                rating={(this.state.players) ? displayRating(this.state.players[team]) : undefined}
                timer={timers?.[team]}
                material={cancelledOutTakenMaterial[team]}
                isTurn={(currentTurn === team)}
            />
        })


        let boardToDisplay: JSX.Element
        if (!this.state.premoveBoard) {
            boardToDisplay = <Board
                board={this.viewingBoard()}
                validMoves={this.state.validMoves}
                selectedPiece={this.state.selectedPiece}
                notFlipped={this.state.notFlipped}
                onPieceClick={(posClicked: Vector) => this.handlePieceClick(posClicked)}
                onValidMoveClick={(posClicked: Vector) => this.handleMoveClick(posClicked)}
                deselectPiece={() => this.deselectPiece()}
                ownTeam={this.props.team}
                moveInfo={this.state.game.getMove(this.state.viewingMove).move}
                showingPromotionSelector={!!this.state.promotionSelector}
                boxSize={this.state.boxSize}
                haveEngine={!!this.engine && (!this.props.versusStockfish || !!this.state.game.gameOver)}
                doPremove={(start: Vector, end: Vector) => this.addPremove(start, end)}
                isLatestBoard={this.viewingBoard().halfMoveNumber === this.latestBoard().halfMoveNumber}
                onMounted={(callbacks: any) => this.gameBoardMounted(callbacks)}
                boardStyle={this.state.boardStyle}
                pieceStyle={this.state.piecesStyle}
            />
        } else {
            boardToDisplay = <Board
                board={this.state.premoveBoard}
                validMoves={[]}
                selectedPiece={this.state.selectedPiece}
                notFlipped={this.state.notFlipped}
                onPieceClick={(posClicked: Vector) => this.handlePieceClick(posClicked)}
                onValidMoveClick={(posClicked: Vector) => { }}
                deselectPiece={() => this.deselectPiece()}
                ownTeam={this.props.team}
                moveInfo={this.state.game.getMove(this.state.viewingMove).move}
                showingPromotionSelector={!!this.state.promotionSelector}
                boxSize={this.state.boxSize}
                haveEngine={!!this.engine && !this.props.versusStockfish}
                doPremove={(start: Vector, end: Vector) => this.addPremove(start, end)}
                isLatestBoard={true}
                premoves={this.state.premoves}
                deletePremoves={() => { this.setState({ premoves: [], premoveBoard: null }) }}
                onMounted={(callbacks: any) => this.gameBoardMounted(callbacks)}
                boardStyle={this.state.boardStyle}
                pieceStyle={this.state.piecesStyle}
            />
        }

        let boardAndPlayers = <div id='board-and-info'
            style={{
                flex: '0 0 ' + (this.state.boxSize * 8 + 1) + 'px'
            }}>
            {(this.state.onMobile) ? (this.state.notFlipped) ? players.black : players.white : null}
            <div
                id='board-wrapper'
                className={'board-wrapper ' + this.state.piecesStyle}
                onContextMenu={function () { return false; }}
                style={{
                    width: 8 * this.state.boxSize,
                    height: 8 * this.state.boxSize
                }}>
                {boardToDisplay}
                {promotionSelector}
            </div>
            {(this.state.onMobile) ? (!this.state.notFlipped) ? players.black : players.white : null}
            {<p className='opening'>{(this.state.game.opening.ECO) ? <span className='eco'>{this.state.game.opening.ECO}</span> : null}{this.state.game.opening.Name}</p>}
            {(this.state.onMobile) ? engineInfo : null}
            {(!this.state.onMobile) ? <div className='inline-info'>
                <p className='button-type'
                    onClick={() => {
                        if (navigator.clipboard)
                            navigator.clipboard.writeText(this.viewingBoard().getFen())
                                .then(() => {
                                    alert('Copied FEN to clipboard.');
                                })
                                .catch(err => {
                                    alert('Error in copying text: ' + err);
                                });
                    }}>
                    Copy Fen
                </p>
                {(this.props.pgnAndFenChange) ?
                    <form onSubmit={(event) => {
                        event.preventDefault()
                        if (!this.state.resetGameFEN) return
                        const inputFen = this.state.resetGameFEN.trim()
                        const fenLength = inputFen.split(' ').length
                        let finalFen = inputFen
                        if (fenLength !== 6) {
                            if (fenLength === 1) finalFen += ' w KQkq - 0 1'
                            else if (fenLength === 2) finalFen += ' KQkq - 0 1'
                            else if (fenLength === 3) finalFen += ' - 0 1'
                            else if (fenLength === 4) finalFen += ' 0 1'
                            else if (fenLength === 5) finalFen += ' 1'
                            else return
                        }
                        console.log(finalFen)
                        if (finalFen.split(' ')[0].split('/').length !== 8) return
                        console.log('no errors')
                        this.resetGame(finalFen)
                        this.setState({ resetGameFEN: "" })
                    }}>
                        <label htmlFor='current-fen'>
                            <input
                                type='text'
                                id='current-fen'
                                placeholder={this.viewingBoard().getFen()}
                                value={this.state.resetGameFEN}
                                name='board-fen'
                                onChange={(event) => {
                                    this.setState({ resetGameFEN: event.target.value })
                                }}
                            />
                        </label>
                    </form>
                    : <p>{this.viewingBoard().getFen()}</p>}
            </div>
                : null}
        </div>

        const piecesStyleSelector: pieceStyle[] = ['normal', 'medieval', 'ewan', 'sus']
        const pieceSelector = piecesStyleSelector.map((item: pieceStyle) => {
            return <div key={item} className={'piece-style-btn ' + item + ((this.state.piecesStyle === item) ? ' current' : '')} onClick={() => { this.setState({ piecesStyle: item }); localStorage.setItem('pieceStyle', item) }}>
                <img className={'display-piece n l'}
                    alt={item + " style"}
                    src={'/assets/images/svg/' + item + '/white knight.' + pieceImageType[item]}
                />
            </div>
        })

        let leftSideInfo = <div className="game-controls-info">
            <div className='col-down'>
                {(this.state.spectators.length) ? <div id="spectators-in-game-display">
                    <h1>Spectators ({this.state.spectators.length})</h1>
                    <ul>
                        {this.state.spectators.map(spectator => {
                            return <li key={spectator.userId}>{spectator.username}<span className='rating'>{displayRating(spectator)}</span></li>
                        })}
                    </ul>
                </div> : null}
                <br /><hr /><br />
                <div>
                    <h3>Board Colour Selector</h3>
                    <button onClick={() => {
                        this.setState({
                            boardStyle: {
                                white: '#f0d9b5',
                                black: '#b58863',
                            }
                        });
                        localStorage.setItem('boardStyle', JSON.stringify({
                            white: '#f0d9b5',
                            black: '#b58863',
                        }))
                    }
                    }>Lichess Colours</button>
                    <button onClick={() => {
                        this.setState({
                            boardStyle: {
                                white: '#ebecd0',
                                black: '#779556',
                            }
                        });
                        localStorage.setItem('boardStyle', JSON.stringify({
                            white: '#ebecd0',
                            black: '#779556',
                        }))
                    }
                    }>Chess.com Colours</button>
                    <br />
                    <br />
                    {(!this.state.onMobile) ? <div>
                        <label className='button-type' htmlFor="white-tile-color">Custom White Tile Colour</label>
                        <input hidden type="color" id="white-tile-color" name="favcolor" defaultValue={this.state.boardStyle.white}
                            onChange={(event) => {
                                localStorage.setItem('boardStyle', JSON.stringify({ white: event.target.value, black: this.state.boardStyle.black }));
                                this.setState({ boardStyle: { white: event.target.value, black: this.state.boardStyle.black } })
                            }} />
                        <label className='button-type' htmlFor="black-tile-color">Custom Black Tile Colour</label>
                        <input hidden type="color" id="black-tile-color" name="favcolor" defaultValue={this.state.boardStyle.black}
                            onChange={(event) => {
                                localStorage.setItem('boardStyle', JSON.stringify({ white: this.state.boardStyle.white, black: event.target.value }));
                                this.setState({ boardStyle: { white: this.state.boardStyle.white, black: event.target.value } })
                            }} />
                    </div> : null}
                    <h3>Piece Style Selector</h3>
                    {pieceSelector}
                </div>
                <br /><hr /><br />
                <div id="game-controls">
                    <h3>Game Controls</h3>
                    <button onClick={() => download('game.pgn', this.state.game.getPGN())}>Download PGN</button>
                    {(!this.state.loadedNNUE) ? <button onClick={() => { this.engine?.loadNNUE(); this.setState({ loadedNNUE: true }); localStorage.setItem('loadNNUE', 'true') }}>Load NNUE</button> : <button onClick={() => { this.engine?.loadNNUE(); this.setState({ loadedNNUE: false }); localStorage.removeItem('loadNNUE') }}>Stop Loading NNUE</button>}
                </div>
            </div>
        </div>

        let previousMovesList = <PreviousMoves
            analyseFunc={() => { }}
            allowAnalyse={(!!this.props.multiplayerWs && !!this.state.game.gameOver)}
            onMobile={this.state.onMobile}
            allowResetGame={(!this.props.multiplayerWs && this.state.game.getMoveCount() > 0)}
            ResetGameFunc={() => this.resetGame()}
            allowResign={(!!this.props.multiplayerWs && !this.state.game.gameOver)}
            resignFunc={() => {
                if (this.props.multiplayerWs)
                    sendToWs(this.props.multiplayerWs, 'game', [
                        ['option', 'resign']
                    ])
            }}
            flipBoardFunc={() => this.flipBoard()}
            notFlipped={this.state.notFlipped}
            players={players}
            engineInfo={engineInfo}
            goToMove={(i: number) => this.goToMove(i)}
            game={this.state.game}
            viewingMove={this.state.viewingMove}
            latestMove={this.state.game.getMoveCount()}
            allowCopy={(!this.props.multiplayerWs)}
        />

        return (
            <div className="game">
                <div className='horizontal-game-wrapper'
                    style={{
                        flexDirection: (this.state.onMobile) ? 'column' : 'row'
                    }}>
                    {(this.state.onMobile) ? boardAndPlayers : leftSideInfo}
                    {(this.state.onMobile) ? previousMovesList : boardAndPlayers}
                    {(this.state.onMobile) ? leftSideInfo : previousMovesList}
                </div>
            </div>
        );
    }
}

function download(filename: string, text: string): void {
    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();

    document.body.removeChild(element);
}

export default Game