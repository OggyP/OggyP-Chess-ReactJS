import React from 'react';
import { ChessBoard, ChessGame, PieceCodes, Teams, Vector, PieceAtPos } from './chessLogic'
import PromotePiece from './tsxAssets/promotePiece'
import Board from './board'

interface GameState {
  game: ChessGame
  viewingMove: number
  validMoves: {
    "move": Vector,
    "board": ChessBoard,
    "moveType": string[]
  }[]
  gameOver: {
    winner: Teams | "draw"
    by: string
    extraInfo?: string
  } | false
  selectedPiece: Vector | null
  notFlipped: boolean
  promotionSelector: {
    team: Teams
    moveType: string[]
    board: ChessBoard
    pos: {
      start: Vector
      end: Vector
    }
  } | null
}

interface GameProps {
  startingPosition: string
  team: Teams | "any"
}

class Game extends React.Component<GameProps, GameState> {
  constructor(props: GameProps) {
    super(props)
    this.state = {
      game: new ChessGame({ fen: this.props.startingPosition }),
      viewingMove: 0,
      validMoves: [],
      notFlipped: true,
      selectedPiece: null,
      promotionSelector: null,
      gameOver: false
    }
  }

  flipBoard(): void {
    this.setState({
      "notFlipped": !this.state.notFlipped
    })
  }

  handlePromotionClick(piece: PieceCodes): void {
    const info = this.state.promotionSelector
    if (info && !this.state.gameOver && this.state.viewingMove === this.state.game.getMoveCount() && info.team === this.state.game.getLatest().board.getTurn('next')) {
      const newBoard = new ChessBoard(info.board)
      newBoard.promote(info.pos.end, piece, info.team)
      if (!newBoard.inCheck(info.team)) {
        console.log("update game prom")
        const isGameOver = newBoard.isGameOverFor(newBoard.getTurn('next'))
        this.state.game.newMove({
          board: newBoard,
          text: ChessBoard.getShortNotation(info.pos.start, info.pos.end, this.state.promotionSelector?.moveType as string[], this.latestBoard(), (isGameOver) ? "#" : ((newBoard.inCheck(newBoard.getTurn('next')) ? '+' : '')), piece),
          move: {
            start: info.pos.start,
            end: info.pos.end,
            type: this.state.promotionSelector?.moveType as string[],
          }
        })
        console.log(this.state.game.getMoveCount())
        this.setState({
          game: this.state.game,
          selectedPiece: null,
          validMoves: [],
          promotionSelector: null,
          viewingMove: this.state.viewingMove + 1,
          gameOver: isGameOver,
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

  handlePieceClick(posClicked: Vector): void {
    if (!this.state.gameOver && this.state.viewingMove === this.state.game.getMoveCount() && this.latestBoard().getPos(posClicked)?.team === this.latestBoard().getTurn('next') && (this.props.team === 'any' || this.latestBoard().getTurn('next') === this.props.team)) {
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
    if (!this.state.gameOver && this.state.viewingMove === this.state.game.getMoveCount()) {
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
      if (!isPromotion) {
        const isGameOver = newBoard.isGameOverFor(newBoard.getTurn('next'))
        this.state.game.newMove({
          board: newBoard,
          text: ChessBoard.getShortNotation(selectedPiecePos, posClicked, moveType as string[], this.latestBoard(), (isGameOver) ? "#" : ((newBoard.inCheck(newBoard.getTurn('next')) ? '+' : ''))),
          move: {
            start: selectedPiecePos,
            end: posClicked,
            type: moveType as string[]
          }
        })
        this.setState({
          game: this.state.game,
          gameOver: isGameOver,
          viewingMove: this.state.viewingMove + 1
        })
      }
    } else console.warn("Error - Wrong turn / not latest game")
  }

  goToMove(moveNum: number): void {
    if (!this.state.promotionSelector)
      this.setState({
        viewingMove: moveNum,
        validMoves: [],
        selectedPiece: null
      })
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
    if (this.state.gameOver) {
      const winner = {
        "white": "White wins by",
        "draw": "Draw by",
        "black": "Black wins by"
      }
      gameOverDisplay = <tr>
        <th scope='row'>End</th>
        <td colSpan={2}>{`${winner[this.state.gameOver.winner]} ${this.state.gameOver.by}`}</td>
      </tr>
    }

    return (
      <div className="game">
        <div className='horizontal'>
          <div id='board-wrapper'>
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
            />
            {promotionSelector}
          </div>
          <div id="previous-moves-wrapper">
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
            <p>{this.viewingBoard().getFen()}</p>
          </div>
        </div>
        <div id="game-controls">
          <button onClick={() => this.flipBoard()}>Flip Board</button>
          {resumeButton}
        </div>

      </div>
    );
  }
}

export default Game