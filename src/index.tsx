import React, { FC, ReactElement, ReactNode } from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import './chess.css';
import './assets.css'
import { ChessBoard, ChessPiece } from './chess'

type Teams = "white" | "black"
type PieceCodes = 'p' | 'r' | 'n' | 'b' | 'q' | 'k';
type PieceAtPos = ChessPiece | null

interface PieceProps {
  type: string
  team: Teams
  x: number
  y: number
}

function Piece(props: PieceProps) {
  const classes = `piece ${(props.team === 'white') ? "l" : "d"} ${props.type}`;
  return (
    <div className={classes} style={{ "transform": `translate(${props.x}px, ${props.y}px)` }}>
    </div>
  )
}

interface PromotePieceProps {
  type: string
  team: Teams
  x: number
  y: number
  onClick: React.MouseEventHandler<HTMLDivElement>
}

function PromotePiece(props: PromotePieceProps) {
  const classes = `piece ${(props.team === 'white') ? "l" : "d"} ${props.type}`;
  return (
    <div className='square' style={{ "top": props.y + "%", "left": props.x + "%" }}>
      <div onClick={props.onClick} className={classes}>
      </div>
    </div>
  )
}

interface ValidMoveProps {
  x: number
  y: number
  isCapture: boolean
  // onClick: React.MouseEventHandler<HTMLDivElement>
}

function ValidMove(props: ValidMoveProps) {
  const classes = `valid-move ${(props.isCapture) ? " capture" : ""}`;
  return (
    <div className={classes} style={{ "transform": `translate(${props.x * 100}px, ${props.y * 100}px)` }}>
    </div>
  )
}

interface piecesArray {
  piece: ChessPiece
  pos: { x: number, y: number }
}

interface BoardProps {
  board: ChessBoard
  validMoves: {
    "move": { "x": number, "y": number },
    "board": ChessBoard,
    "moveType": string
  }[]
  selectedPiece: { "x": number, "y": number } | null
  notFlipped: boolean
  onPieceClick: Function
  onValidMoveClick: Function
}

interface BoardState {
  pieceBeingDragged: Vector | null
  mousePos: Vector
}

class Board extends React.Component<BoardProps, BoardState> {
  constructor(props: BoardProps) {
    super(props)
    this.state = {
      pieceBeingDragged: null,
      mousePos: { "x": 0, "y": 0 }
    }
  }

  mouseDown() {
    let posSelected: Vector;
    if (this.props.notFlipped)
      posSelected = { "x": Math.floor(this.state.mousePos.x / 100), "y": Math.floor(this.state.mousePos.y / 100) }
    else
      posSelected = { "x": 7 - Math.floor(this.state.mousePos.x / 100), "y": 7 - Math.floor(this.state.mousePos.y / 100) }
    if (this.props.selectedPiece) {
      for (let i = 0; i < this.props.validMoves.length; i++) {
        const validMoveToCheck = this.props.validMoves[i]
        if (posSelected.x === validMoveToCheck.move.x && posSelected.y === validMoveToCheck.move.y) {
          this.props.onValidMoveClick(posSelected)
          return
        }
      }

    }

    if (this.props.board.getPos(posSelected)) {
      this.props.onPieceClick(posSelected)
      this.setState({
        pieceBeingDragged: posSelected
      })
    }
  }

  mouseUp() {

    if (this.state.pieceBeingDragged) {
      let posSelected: Vector;
      if (this.props.notFlipped)
        posSelected = { "x": Math.floor(this.state.mousePos.x / 100), "y": Math.floor(this.state.mousePos.y / 100) }
      else
        posSelected = { "x": 7 - Math.floor(this.state.mousePos.x / 100), "y": 7 - Math.floor(this.state.mousePos.y / 100) }


      for (let i = 0; i < this.props.validMoves.length; i++) {
        const validMoveToCheck = this.props.validMoves[i]
        if (posSelected.x === validMoveToCheck.move.x && posSelected.y === validMoveToCheck.move.y) {
          this.props.onValidMoveClick(posSelected)
          return
        }
      }

      this.setState({
        pieceBeingDragged: null
      })
    }
  }

  private _onMouseMove(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    const mainBoard = document.getElementById("main-board")
    if (mainBoard) {
      var bounds = mainBoard.getBoundingClientRect();
      this.setState({
        mousePos: { "x": event.clientX - bounds.left, "y": event.clientY - bounds.top }
      })
    }
  }

  render() {
    let pieces: piecesArray[] = []
    for (let x = 0; x < 8; x++)
      for (let y = 0; y < 8; y++) {
        const boardSquare = this.props.board.getPos({ "x": x, "y": y })
        if (boardSquare)
          pieces.push({ "piece": boardSquare, "pos": { "x": x, "y": y } })
      }
    const pieceBeingDragged = this.state.pieceBeingDragged
    const piecesToDisplay = pieces.map((item, index) => {
      if (pieceBeingDragged && (pieceBeingDragged.x === item.pos.x && pieceBeingDragged.y === item.pos.y)) {
        return <Piece key={item.piece.key}
          type={item.piece.code}
          team={item.piece.team}
          x={this.state.mousePos.x - 50}
          y={this.state.mousePos.y - 50}
        />;
      } else
        return <Piece key={item.piece.key}
          type={item.piece.code}
          team={item.piece.team}
          x={100 * ((this.props.notFlipped) ? item.pos.x : 7 - item.pos.x)}
          y={100 * ((this.props.notFlipped) ? item.pos.y : 7 - item.pos.y)}
        />;
    })

    const legalMovesToDisplay = this.props.validMoves.map((item, index) => {
      return <ValidMove
        key={item.move.x.toString() + item.move.y.toString()}
        isCapture={(item.moveType.includes('capture'))}
        x={(this.props.notFlipped) ? item.move.x : 7 - item.move.x}
        y={(this.props.notFlipped) ? item.move.y : 7 - item.move.y}
      // onClick={() => this.props.onValidMoveClick({ "x": item.move.x, "y": item.move.y })}
      // onClick={() => this.props.onClick(i)}
      />;
    })


    return (
      <div id='main-board' onMouseMove={this._onMouseMove.bind(this)} onMouseDown={() => this.mouseDown()} onMouseUp={() => this.mouseUp()} onMouseLeave={() => this.mouseUp()}>
        <div id='legal-moves-layer'>
          {legalMovesToDisplay}
        </div>
        <div id='pieces-layer'>
          {piecesToDisplay}
        </div>
      </div>
    );
  }
}

interface GameState {
  // history: { squares: string | null }[],
  // turn: Teams
}

interface Vector { "x": number, "y": number }

interface GameState {
  currentBoard: ChessBoard
  validMoves: {
    "move": Vector,
    "board": ChessBoard,
    "moveType": string
  }[]
  selectedPiece: Vector | null
  notFlipped: boolean
  promotionSelector: {
    team: Teams
    pos: Vector
  } | null
}

class Game extends React.Component<{}, GameState> {
  constructor(props: BoardProps) {
    super(props)
    this.state = {
      currentBoard: new ChessBoard("rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"),
      validMoves: [],
      notFlipped: true,
      selectedPiece: null,
      promotionSelector: null
    }
  }

  flipBoard(): void {
    this.setState({
      "notFlipped": !this.state.notFlipped
    })
  }

  swapPositions(): void {
    const newBoard = new ChessBoard(this.state.currentBoard)
    newBoard.swapPositions()
    this.setState({
      currentBoard: newBoard
    })
  }

  handlePromotionClick(piece: PieceCodes): void {
    const newBoard = new ChessBoard(this.state.currentBoard)
    newBoard.promote(this.state.promotionSelector?.pos as Vector, piece, this.state.promotionSelector?.team as Teams)
    if (!newBoard.inCheck(this.state.promotionSelector?.team as Teams))
      this.setState({
        "currentBoard": newBoard,
        "selectedPiece": null,
        "validMoves": [],
        "promotionSelector": null
      })
    else
      alert("L, you can't do that because you will be in check!")
  }

  handlePieceClick(posClicked: Vector): void {
    const newValidMoves = this.state.currentBoard.getPos(posClicked)?.getMoves(posClicked, this.state.currentBoard)
    if (newValidMoves)
      this.setState({
        validMoves: newValidMoves,
        selectedPiece: posClicked
      })
  }

  handleMoveClick(posClicked: Vector): void {
    let newBoard: ChessBoard | null = null
    let moveType: string | null = null

    const selectedPiecePos = this.state.selectedPiece
    let selectedPiece: PieceAtPos = null
    if (selectedPiecePos)
      selectedPiece = this.state.currentBoard.getPos(selectedPiecePos)
    for (let i = 0; i < this.state.validMoves.length; i++) {
      const checkMove = this.state.validMoves[i]
      if (checkMove.move.x === posClicked.x && checkMove.move.y === posClicked.y) {
        newBoard = checkMove.board
        moveType = checkMove.moveType
      }
    }

    if (selectedPiece && selectedPiecePos) {
      if (moveType && moveType.includes('promote')) {
        this.setState({
          "promotionSelector": {
            "team": selectedPiece.team,
            "pos": posClicked
          }
        })
      }
    }
    else
      console.warn("The selected piece was undefined")

    // newBoard = new ChessBoard(this.state.currentBoard)
    // console.log(newBoard)
    if (newBoard)
      this.setState({
        "currentBoard": newBoard,
        "selectedPiece": null,
        "validMoves": []
      })
  }

  render() {
    let promotionSelector
    const promotionSelectorVal = this.state.promotionSelector
    if (promotionSelectorVal) {
      const promotionChoices: PieceCodes[] = ['q', 'n', 'r', 'b', 'k', 'p']
      const promotionOptionsDisplay = promotionChoices.map((item, index) => {
        const x = promotionSelectorVal.pos.x
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

    return (
      <div className="game">
        <div id='board-wrapper'>
          <Board
            board={this.state.currentBoard}
            validMoves={this.state.validMoves}
            selectedPiece={this.state.selectedPiece}
            notFlipped={this.state.notFlipped}
            onPieceClick={(posClicked: Vector) => this.handlePieceClick(posClicked)}
            onValidMoveClick={(posClicked: Vector) => this.handleMoveClick(posClicked)}
          />
          {promotionSelector}
        </div>
        <button onClick={() => this.flipBoard()}>Flip Board</button>
        <button onClick={() => this.swapPositions()}>Swap Positions</button>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(
  <Game />,
  document.getElementById('root')
);