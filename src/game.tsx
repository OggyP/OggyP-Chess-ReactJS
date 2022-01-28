import React from 'react';
import { ChessBoard, ChessGame, PieceCodes, Teams, PieceAtPos, convertToChessNotation, Vector, Pawn } from './chessLogic'
import PromotePiece from './tsxAssets/promotePiece'
import Board from './board'
import EngineInfo from './tsxAssets/engineEvalInfo'
import UCIengine from './engine'
import PreviousMoves from './tsxAssets/previousMoves'
import { sendToWs } from './helpers/wsHelper';
import UserInfoDisplay from './tsxAssets/UserInfo'
import { deleteCookie, getCookie, setCookie } from './helpers/getToken';
import { addVectorsAndCheckPos } from './chessLogic/functions';

const boardSize = 0.87
const minAspectRatio = 1.2

interface TimerInfo {
  startTime: number; // UNIX Time
  countingDown: boolean
  time: number
}

interface PlayerInfo {
  username: string
  rating: number
  ratingChange?: number
  title?: string
}

interface GameState {
  game: ChessGame
  viewingMove: number
  validMoves: {
    "move": Vector,
    "board": ChessBoard,
    "moveType": string[]
  }[]
  selectedPiece: Vector | null
  notFlipped: boolean
  boxSize: number
  promotionSelector: {
    team: Teams
    moveType: string[]
    board: ChessBoard
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
  premoveBoard: ChessBoard | null
  premoves: { start: Vector, end: Vector }[]
  onMobile: boolean
  piecesStyle: string
  boardStyle: {
    white: string,
    black: string,
  }
  loadedNNUE: boolean
}

interface GameProps {
  fen?: string
  pgn?: string
  multiplayerWs?: WebSocket
  team: Teams | "any"
  onMounted?: Function
  players?: {
    white: PlayerInfo
    black: PlayerInfo
  }
  allowMoving: boolean
  allowPreMoves: boolean
  termination?: string
  canSharePGN?: boolean
  versusStockfish?: {
    skill: number
    fastGame: boolean
  } | undefined
}

class Game extends React.Component<GameProps, GameState> {
  engine: UCIengine | null = null
  getDraggingPiece: Function | undefined
  engineMoveType = 'movetime 10000'

  constructor(props: GameProps) {
    super(props)
    if (!props.multiplayerWs || (props.players && ((props.players.white.username === 'OggyP' && props.team === 'white') || (props.players.black.username === 'OggyP' && props.team === 'black')))) {
      let startingCommands = [
        "isready",
        "ucinewgame"
      ]
      if (props.versusStockfish) {
        if (props.versusStockfish.skill !== 20) startingCommands.unshift('setoption name Skill Level value ' + props.versusStockfish.skill)

        if (!props.versusStockfish.fastGame || props.versusStockfish.skill <= 15) {
          let depth: number | null = null
          if (props.versusStockfish.skill < 2) {
            depth = 1;
          } else if (props.versusStockfish.skill < 5) {
            depth = 2;
          } else if (props.versusStockfish.skill < 10) {
            depth = 3;
          } else if (props.versusStockfish.skill < 15) {
            depth = 4;
          } else {
            this.engineMoveType = 'movetime 10000'
          }
          if (depth)
            this.engineMoveType = 'move depth ' + depth
        } else
          this.engineMoveType = 'movetime 1000'
      }
      console.log(this.engineMoveType)
      this.engine = new UCIengine('/stockfish/stockfish.js', startingCommands)
    }
    const windowSize = {
      width: window.innerWidth,
      height: window.innerHeight
    }
    let playerInfo = null
    const game = new ChessGame((props.fen) ? { fen: { val: props.fen } } : (props.pgn) ? { pgn: props.pgn } : { fen: { val: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1" } })
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

    const boardStyleSavedVal = getCookie('boardStyle')
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
      viewingMove: 0, // make it `game.getMoveCount()` to go to the lastest move
      validMoves: [],
      notFlipped: (props.team === 'any' || props.team === 'white'),
      selectedPiece: null,
      promotionSelector: null,
      boxSize: Math.floor(Math.min(windowSize.height * boardSize, windowSize.width) / 8),
      moveRightSection: false,
      players: (props.players || playerInfo),
      premoveBoard: null,
      premoves: [],
      onMobile: windowSize.height * minAspectRatio > windowSize.width,
      piecesStyle: (getCookie('pieceStyle') || 'normal'),
      boardStyle: boardStyle,
      loadedNNUE: (this.engine?.loadedNNUE || false),
    }
    this.boardMoveChanged(0, true, true)
    if (props.canSharePGN) this.updateURLtoHavePGN()
  }

  gameBoardMounted(callbacks: any) {
    this.getDraggingPiece = callbacks.getDraggingPiece
  }

  flipBoard(): void {
    this.setState({
      "notFlipped": !this.state.notFlipped
    })
  }

  doEngineMove = (event: any) => {
    const move = event.detail
    console.log(move)
    this.doMove(move.startingPos, move.endingPos, move.promotion)
  }

  boardMoveChanged(moveNum: number, firstMove: boolean = false, goingToNewMove = false) {
    if (this.engine)
      if (!this.props.versusStockfish || goingToNewMove)
        this.engine.go(this.state.game.startingFEN, this.state.game.getMovesTo(moveNum), this.engineMoveType)
    if (this.state.game.getMoveCount() !== moveNum && !firstMove)
      this.setState({
        premoves: [],
        premoveBoard: null
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
      const newBoard = new ChessBoard(info.board)
      newBoard.promote(info.pos.end, piece, info.team)
      if (!newBoard.inCheck(info.team)) {
        const isGameOver = newBoard.isGameOverFor(newBoard.getTurn('next'))
        const shortNotation = ChessBoard.getShortNotation(info.pos.start, info.pos.end, this.state.promotionSelector?.moveType as string[], this.latestBoard(), (isGameOver && isGameOver.by === 'checkmate') ? "#" : ((newBoard.inCheck(newBoard.getTurn('next')) ? '+' : '')), piece)
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
            promote: piece + ((info.team === 'white') ? 'l' : 'd')
          })
        if (this.props.canSharePGN) this.updateURLtoHavePGN()
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
    if (!this.props.allowPreMoves) return
    const premoveList = this.state.premoves.slice()
    premoveList.push({
      start: start,
      end: end
    })
    let preMoveBoard = new ChessBoard(this.state.premoveBoard || this.latestBoard())
    preMoveBoard.setPos(end, preMoveBoard.getPos(start))
    preMoveBoard.setPos(start, null)
    this.setState({
      premoves: premoveList,
      premoveBoard: preMoveBoard
    })
  }

  doMove(startPos: Vector, endPos: Vector, promotion: PieceCodes | undefined = undefined) {
    const piece = this.latestBoard().getPos(startPos)
    if (!piece) return
    if (piece.team === this.props.team) return
    this.state.game.doMove(startPos, endPos, promotion)
    let newViewNum = this.state.viewingMove + 1

    const latestBoard = this.state.game.getLatest().board
    if (latestBoard.enPassant) {
      console.log('enpassant available')
      // person who just moved is white then check for black
      const pawnMoveDirection: number = ((piece.team === 'white') ? 1 : -1)
      // Plus x 
      const xOffsets = [-1, 1]
      for (let i = 0; i < xOffsets.length; i++) {
        const checkPos = addVectorsAndCheckPos(latestBoard.enPassant, { x: xOffsets[i], y: -pawnMoveDirection })
        console.log(checkPos)
        if (!checkPos) continue
        const checkPiece = latestBoard.getPos(checkPos)
        if (!checkPiece || checkPiece.team === piece.team || !(checkPiece instanceof Pawn)) continue // if same as person who just moved
        if (this.state.game.doMove(checkPos, latestBoard.enPassant)) {
          newViewNum++
          this.setState({
            premoves: [],
            premoveBoard: null
          })
          if (this.props.multiplayerWs)
            sendToWs(this.props.multiplayerWs, 'move', {
              startingPos: [checkPos.x, checkPos.y],
              endingPos: [latestBoard.enPassant.x, latestBoard.enPassant.y],
            })
          break
        }
      }
    }

    // Pre Moves
    if (this.state.premoves.length > 0 && !this.state.game.gameOver) {
      const premove = this.state.premoves.shift()
      console.log(premove)
      let premoveError = false
      if (!premove) throw new Error("premove is undefined");
      const piece = this.latestBoard().getPos(premove.start)
      if (!piece) premoveError = true
      if (piece && piece.team !== this.props.team) premoveError = true
      if (!this.state.game.doMove(premove.start, premove.end, undefined, false)) premoveError = true
      console.log('Premove ' + premoveError + ' ' + this.latestBoard().getFen())
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
          const newBoard = new ChessBoard(this.latestBoard())
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
      viewingMove: newViewNum
    })
    this.boardMoveChanged(newViewNum, false, true)
    if (this.getDraggingPiece) {
      const draggingPiece = this.getDraggingPiece()
      if (draggingPiece)
        this.handlePieceClick(draggingPiece as Vector)
    }
  }

  updateURLtoHavePGN() {
    if (this.state.game.metaValues.get('White') && this.state.game.metaValues.get('White') !== '?')
      window.history.pushState('OggyP Chess Analysis', 'Shared Analysis', '/analysis/?pgn=' + encodeURIComponent(this.state.game.getPGN().replace(/ /g, '_')));
    else
      window.history.pushState('OggyP Chess Analysis', 'Shared Analysis', '/analysis/?pgn=' + encodeURIComponent(this.state.game.shortNotationMoves.replace(/ /g, '_')));
  }

  handlePieceClick(posClicked: Vector): void {
    if (!this.state.game.gameOver && this.state.viewingMove === this.state.game.getMoveCount() && this.latestBoard().getPos(posClicked)?.team === this.latestBoard().getTurn('next') && (this.props.team === 'any' || this.latestBoard().getTurn('next') === this.props.team)) {
      const newValidMoves = this.latestBoard().getPos(posClicked)?.getMoves(posClicked, this.latestBoard())
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

  latestBoard(): ChessBoard {
    return this.state.game.getLatest().board
  }

  viewingBoard(): ChessBoard {
    return this.state.game.getMove(this.state.viewingMove).board
  }

  handleMoveClick(posClicked: Vector): void {
    if (!this.state.game.gameOver && this.state.viewingMove === this.state.game.getMoveCount()) {
      let newBoard: ChessBoard | null = null
      let moveType: string[] | null = null

      if (!this.state.selectedPiece) throw new Error("selected piece is undefined");

      const selectedPiecePos = Object.assign({}, this.state.selectedPiece)

      let selectedPiece: PieceAtPos = null
      if (selectedPiecePos)
        selectedPiece = this.latestBoard().getPos(selectedPiecePos)
      for (let i = 0; i < this.state.validMoves.length; i++) {
        const checkMove = this.state.validMoves[i]
        if (checkMove.move.x === posClicked.x && checkMove.move.y === posClicked.y) {
          newBoard = checkMove.board
          moveType = checkMove.moveType
        }
      }

      newBoard = newBoard as ChessBoard

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
                end: posClicked,
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
      const shortNotation = ChessBoard.getShortNotation(selectedPiecePos, posClicked, moveType as string[], this.latestBoard(), (isGameOver && isGameOver.by === 'checkmate') ? "#" : ((newBoard.inCheck(newBoard.getTurn('next')) ? '+' : '')))
      this.state.game.newMove({
        board: newBoard,
        text: shortNotation,
        move: {
          start: selectedPiecePos,
          end: posClicked,
          type: moveType as string[],
          notation: {
            short: shortNotation,
            long: convertToChessNotation(selectedPiecePos) + convertToChessNotation(posClicked)
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
      if (this.props.canSharePGN) this.updateURLtoHavePGN()
      if (!this.props.multiplayerWs) return
      sendToWs(this.props.multiplayerWs, 'move', {
        startingPos: [selectedPiecePos.x, selectedPiecePos.y],
        endingPos: [posClicked.x, posClicked.y],
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

  preventContextMenu(e: any) {
    e.preventDefault()
  }

  componentDidMount() {
    if (this.props.onMounted) {
      this.props.onMounted({
        doMove: (startPos: Vector, endPos: Vector, promotion: PieceCodes | undefined = undefined) => this.doMove(startPos, endPos, promotion),
        gameOver: (winner: Teams | 'draw', by: string, extraInfo?: string) => this.customGameOver(winner, by, extraInfo),
        updateTimer: (white: TimerInfo, black: TimerInfo) => this.updateTimer(white, black)
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

    if (!this.engine && this.state.game.gameOver)
      this.engine = new UCIengine('/stockfish/stockfish.js', [
        "isready",
        "ucinewgame"
      ])

    if (promotionSelectorVal) {
      const promotionChoices: PieceCodes[] = ['q', 'n', 'b', 'r']
      const promotionOptionsDisplay = promotionChoices.map((item, index) => {
        const x = promotionSelectorVal.pos.end.x
        const y = (promotionSelectorVal.team === 'white') ? index : (7 - index)
        return <PromotePiece
          key={index}
          team={promotionSelectorVal.team}
          x={(this.state.notFlipped) ? x * 12.5 : (7 - x) * 12.5}
          y={(this.state.notFlipped) ? y * 12.5 : (7 - y) * 12.5}
          type={item}
          onClick={() => this.handlePromotionClick(item)}
        />
      })
      promotionSelector = <div id="promotion-choice">{promotionOptionsDisplay}</div>
    }

    let resumeButton = null
    if (this.state.viewingMove !== this.state.game.getMoveCount())
      resumeButton = <button onClick={() => this.setState({
        viewingMove: this.state.game.getMoveCount()
      })}>Resume</button>

    let engineInfo = null
    if (this.engine)
      engineInfo = <EngineInfo
        showMoves={(!this.props.versusStockfish)}
        showEval={(!this.props.versusStockfish)}
      />

    let players: {
      white: JSX.Element | null,
      black: JSX.Element | null
    } = {
      white: null,
      black: null
    }

    const currentTurn = (this.state.game.gameOver) ? 'None' : this.latestBoard().getTurn('next')

    if (this.state.players) {
      players.white = <UserInfoDisplay
        team='white'
        username={this.state.players.white.username}
        rating={this.state.players.white.rating}
        timer={this.state.timers?.white}
        isTurn={(currentTurn === 'white')}
      />
      players.black = <UserInfoDisplay
        team='black'
        username={this.state.players.black.username}
        rating={this.state.players.black.rating}
        timer={this.state.timers?.black}
        isTurn={(currentTurn === 'black')}
      />
    }

    let boardToDisplay: JSX.Element
    console.log('boxsize', this.state.boxSize)
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
        haveEngine={!!this.engine && !this.props.versusStockfish}
        doPremove={(start: Vector, end: Vector) => this.addPremove(start, end)}
        isLatestBoard={this.viewingBoard().halfMoveNumber === this.latestBoard().halfMoveNumber}
        onMounted={(callbacks: any) => this.gameBoardMounted(callbacks)}
        boardStyle={this.state.boardStyle}
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
      {(!this.state.onMobile) ? <p>{this.viewingBoard().getFen()}</p> : null}
    </div>

    const piecesStyleSelector = ['normal', 'medieval', 'ewan', 'sus']
    const pieceSelector = piecesStyleSelector.map((item) => {
      return <div key={item} className={'piece-style-btn ' + item + ((this.state.piecesStyle === item) ? ' current' : '')} onClick={() => { this.setState({ piecesStyle: item }); setCookie('pieceStyle', item, 100) }}>
        <div className={'display-piece n l'} />
      </div>
    })

    let leftSideInfo = <div className="game-controls-info">
      <div className='col-down'>
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
            setCookie('boardStyle', JSON.stringify({
              white: '#f0d9b5',
              black: '#b58863',
            }), 100)
          }
          }>Lichess Colours</button>
          <button onClick={() => {
            this.setState({
              boardStyle: {
                white: '#ebecd0',
                black: '#779556',
              }
            });
            setCookie('boardStyle', JSON.stringify({
              white: '#ebecd0',
              black: '#779556',
            }), 100)
          }
          }>Chess.com Colours</button>
          <br />
          <br />
          <label className='button-type' htmlFor="white-tile-color">Custom White Tile Colour</label>
          <input hidden type="color" id="white-tile-color" name="favcolor" defaultValue={this.state.boardStyle.white} onChange={(event) => { setCookie('boardStyle', JSON.stringify({ white: event.target.value, black: this.state.boardStyle.black }), 100); this.setState({ boardStyle: { white: event.target.value, black: this.state.boardStyle.black } }) }} />
          <label className='button-type' htmlFor="black-tile-color">Custom Black Tile Colour</label>
          <input hidden type="color" id="black-tile-color" name="favcolor" defaultValue={this.state.boardStyle.black} onChange={(event) => { setCookie('boardStyle', JSON.stringify({ white: this.state.boardStyle.white, black: event.target.value }), 100); this.setState({ boardStyle: { white: this.state.boardStyle.white, black: event.target.value } }) }} />
          <h3>Piece Style Selector</h3>
          {pieceSelector}
        </div>
        <br /><hr /><br />
        <div id="game-controls">
          <h3>Game Controls</h3>
          {resumeButton}
          <button onClick={() => download('game.pgn', this.state.game.getPGN())}>Download PGN</button>
          <button onClick={() => this.flipBoard()}>Flip Board</button>
          {(!this.state.loadedNNUE) ? <button onClick={() => { this.engine?.loadNNUE(); this.setState({ loadedNNUE: true }); setCookie('loadNNUE', 'true', 100) }}>Load NNUE</button> : <button onClick={() => { this.engine?.loadNNUE(); this.setState({ loadedNNUE: false }); deleteCookie('loadNNUE') }}>Stop Loading NNUE</button>}
          {(!this.props.pgn && !this.props.multiplayerWs) ? <button onClick={() => {
            if (this.engine)
              this.engine.reset()
            this.setState({
              game: new ChessGame({ fen: { val: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1" } })
            });
            this.goToMove(0)
          }}>Reset Game</button> : null}
        </div>
      </div>
    </div>

    let previousMovesList = <PreviousMoves
      onMobile={this.state.onMobile}
      notFlipped={this.state.notFlipped}
      players={players}
      engineInfo={engineInfo}
      goToMove={(i: number) => this.goToMove(i)}
      game={this.state.game}
      viewingMove={this.state.viewingMove}
      latestMove={this.state.game.getMoveCount()}
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