import React from 'react';
import { ChessBoard, ChessGame, PieceCodes, Teams, Vector, PieceAtPos, convertToChessNotation } from './chessLogic'
import PromotePiece from './tsxAssets/promotePiece'
import Board from './board'
import EngineInfo from './tsxAssets/engineEvalInfo'
import UCIengine from './engine'
import { sendToWs } from './helpers/wsHelper';
import UserInfoDisplay from './tsxAssets/UserInfo'

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
  termination?: string
}

class Game extends React.Component<GameProps, GameState> {
  engine: UCIengine | null = null

  constructor(props: GameProps) {
    super(props)
    if (!this.props.multiplayerWs)
      this.engine = new UCIengine('/stockfish/stockfish.js', [
        "setoption name Use NNUE value true",
        "isready",
        "ucinewgame"
      ])
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
    this.state = {
      game: game,
      viewingMove: 0, // make it `game.getMoveCount()` to go to the lastest move
      validMoves: [],
      notFlipped: (props.team === 'any' || props.team === 'white'),
      selectedPiece: null,
      promotionSelector: null,
      boxSize: Math.floor(Math.min(windowSize.height * 0.7, windowSize.width) / 8),
      moveRightSection: false,
      players: (props.players || playerInfo)
    }
    this.boardMoveChanged(0)
  }

  flipBoard(): void {
    this.setState({
      "notFlipped": !this.state.notFlipped
    })
  }

  boardMoveChanged(moveNum: number) {
    if (this.engine)
      this.engine.analyse(this.state.game.startingFEN, this.state.game.getMovesTo(moveNum))
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
        this.boardMoveChanged(newViewNum)
        if (this.props.multiplayerWs)
          sendToWs(this.props.multiplayerWs, 'move', {
            startingPos: [info.pos.start.x, info.pos.start.y],
            endingPos: [info.pos.end.x, info.pos.end.y],
            promote: piece + ((info.team === 'white') ? 'l' : 'd')
          })
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

  doMove(startPos: Vector, endPos: Vector, promotion: PieceCodes | undefined = undefined) {
    const piece = this.latestBoard().getPos(startPos)
    if (!piece) return
    if (piece.team === this.props.team) return
    const moves = piece.getMoves(startPos, this.latestBoard())
    for (let i = 0; i < moves.length; i++) {
      const move = moves[i]
      if (move.move.x !== endPos.x || move.move.y !== endPos.y) continue
      const newBoard = new ChessBoard(move.board)
      if (promotion) {
        newBoard.promote(endPos, promotion, newBoard.getTurn('prev'))
      }
      const isGameOver = newBoard.isGameOverFor(newBoard.getTurn('next'))
      const shortNotation = ChessBoard.getShortNotation(startPos, endPos, move.moveType, this.latestBoard(), (isGameOver && isGameOver.by === 'checkmate') ? "#" : ((newBoard.inCheck(newBoard.getTurn('next')) ? '+' : '')), promotion)
      this.state.game.newMove({
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
      this.state.game.setGameOver(isGameOver)
      const newViewNum = this.state.viewingMove + 1
      this.setState({
        game: this.state.game,
        viewingMove: newViewNum
      })
      this.boardMoveChanged(newViewNum)
    }
  }

  handlePieceClick(posClicked: Vector): void {
    if (!this.state.game.gameOver && this.state.viewingMove === this.state.game.getMoveCount() && this.latestBoard().getPos(posClicked)?.team === this.latestBoard().getTurn('next') && (this.props.team === 'any' || this.latestBoard().getTurn('next') === this.props.team)) {
      const newValidMoves = this.latestBoard().getPos(posClicked)?.getMoves(posClicked, this.latestBoard())
      if (newValidMoves)
        this.setState({
          validMoves: newValidMoves,
          selectedPiece: posClicked
        })
    } else {
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
      this.boardMoveChanged(newViewNum)
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
    const newBoxSize = Math.floor(Math.min(windowSize.height * 0.7, windowSize.width) / 8)
    if (newBoxSize !== this.state.boxSize)
      this.setState({
        boxSize: newBoxSize
      })
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

  componentDidMount() {
    if (this.props.onMounted) {
      this.props.onMounted({
        doMove: (startPos: Vector, endPos: Vector, promotion: PieceCodes | undefined = undefined) => this.doMove(startPos, endPos, promotion),
        gameOver: (winner: Teams | 'draw', by: string, extraInfo?: string) => this.customGameOver(winner, by, extraInfo),
        updateTimer: (white: TimerInfo, black: TimerInfo) => this.updateTimer(white, black)
      });
    }
    window.addEventListener("resize", this.handleResize);
    window.addEventListener("keydown", this.handleKeyPressed);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.handleResize);
    window.removeEventListener("keydown", this.handleKeyPressed);
  }

  render() {
    let promotionSelector
    const promotionSelectorVal = this.state.promotionSelector
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

    let moveRows: React.DetailedHTMLProps<React.HTMLAttributes<HTMLTableRowElement>, HTMLTableRowElement>[] = []
    let currentRow: React.DetailedHTMLProps<React.TdHTMLAttributes<HTMLTableCellElement>, HTMLTableCellElement>[] = []
    for (let i = 1; i <= this.state.game.getMoveCount(); i++) {
      const move = this.state.game.getMove(i)
      if (i !== 1 && i % 2 === 1) // is white's turn and is not the first turn
      {
        moveRows.push(
          <tr key={i}><th scope='row'><p>{Math.floor(i / 2)}</p></th>{currentRow}</tr>
        )
        currentRow = []
      }
      currentRow.push(
        <td key={i} onClick={() => this.goToMove(i)} className={(this.state.viewingMove === i) ? 'current-move' : ''}><p>{move.text}</p></td>
      )
    }
    if (currentRow.length > 0) moveRows.push(
      <tr key={this.state.game.getMoveCount() + 1}><th scope='row'><p>{Math.floor((this.state.game.getMoveCount() + 1) / 2)}</p></th>{currentRow}</tr>
    )

    let resumeButton = null
    if (this.state.viewingMove !== this.state.game.getMoveCount())
      resumeButton = <button onClick={() => this.setState({
        viewingMove: this.state.game.getMoveCount()
      })}>Resume</button>


    let gameOverDisplay = null
    if (this.state.game.gameOver) {
      const winner = {
        "white": "White wins by",
        "draw": "Draw by",
        "black": "Black wins by"
      }
      gameOverDisplay = <tr className='game-over'>
        <th scope='row'>End</th>
        <td colSpan={2}>{`${winner[this.state.game.gameOver.winner]} ${this.state.game.gameOver.by}`}</td>
      </tr>
    }

    let engineInfo = null
    if (this.engine)
      engineInfo = <EngineInfo />

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

    return (
      <div className="game">
        <div className='horizontal-game-wrapper'>
          <div className='board-and-players'>
            {(this.state.notFlipped) ? players.black : players.white}
            <div id='board-wrapper' style={{
              width: 8 * this.state.boxSize,
              height: 8 * this.state.boxSize
            }}>
              <Board
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
                haveEngine={!!this.engine}
              />
              {promotionSelector}
            </div>
            {(!this.state.notFlipped) ? players.black : players.white}
          </div>
          <div id="previous-moves-wrapper" style={{
            height: 8 * this.state.boxSize
          }}>
            {engineInfo}
            <table id="previous-moves">
              <thead>
                <tr>
                  <th scope="col">move #</th>
                  <th scope="col">White</th>
                  <th scope="col">Black</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope='row'><p>0</p></th>
                  <td colSpan={2} onClick={() => this.goToMove(0)} className={(this.state.viewingMove === 0) ? 'current-move' : ''}><p>Starting Position</p></td>
                </tr>
                {moveRows}
                {gameOverDisplay}
              </tbody>
            </table>
          </div>
        </div>

        <div id="game-info">
          <div id="current-board">
            <p className='opening'><span className='eco'>{this.state.game.opening.ECO}</span>{this.state.game.opening.Name}</p>
            <p>{this.viewingBoard().getFen()}</p>
          </div>
        </div>
        <div id="game-controls">
          <button onClick={() => download('game.pgn', this.state.game.getPGN())}>Download PGN</button>
          <button onClick={() => this.flipBoard()}>Flip Board</button>
          {resumeButton}
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