import Piece from './tsxAssets/piece'
import DraggedPiece from './tsxAssets/draggingPiece'
import Square from './tsxAssets/square'
import ValidMove from './tsxAssets/validMove'
import { ChessBoard, ChessPiece, Teams, Vector } from './chessLogic'
import React from 'react';

interface piecesArray {
  piece: ChessPiece
  pos: { x: number, y: number }
}

interface BoardProps {
  board: ChessBoard
  validMoves: {
    "move": { "x": number, "y": number },
    "board": ChessBoard,
    "moveType": string[]
  }[]
  selectedPiece: { "x": number, "y": number } | null
  notFlipped: boolean
  onPieceClick: Function
  onValidMoveClick: Function
  deselectPiece: Function
  ownTeam: Teams | "any"
  moveInfo: {
    start: Vector
    end: Vector
    type: string[]
  } | null
  showingPromotionSelector: boolean
}
interface BoardState {
  pieceBeingDragged: Vector | null
}
class Board extends React.Component<BoardProps, BoardState> {
  mousePos: Vector;
  posSelected: Vector | null;
  constructor(props: BoardProps) {
    super(props)
    this.state = {
      pieceBeingDragged: null,
    }
    this.mousePos = { "x": 0, "y": 0 }
    this.posSelected = { "x": 0, "y": 0 }
  }

  mouseDown() {
    let posSelected: Vector;
    if (this.props.notFlipped)
      posSelected = { "x": Math.floor(this.mousePos.x / 100), "y": Math.floor(this.mousePos.y / 100) }
    else
      posSelected = { "x": 7 - Math.floor(this.mousePos.x / 100), "y": 7 - Math.floor(this.mousePos.y / 100) }
    if (this.props.selectedPiece) {
      for (let i = 0; i < this.props.validMoves.length; i++) {
        const validMoveToCheck = this.props.validMoves[i]
        if (posSelected.x === validMoveToCheck.move.x && posSelected.y === validMoveToCheck.move.y) {
          this.props.onValidMoveClick(posSelected)
          return
        }
      }
      this.props.deselectPiece()
    }

    const piece = this.props.board.getPos(posSelected)

    if (piece && piece.team === this.props.board.getTurn('next') && (this.props.ownTeam === 'any' || piece.team === this.props.ownTeam)) {
      if (!this.posSelected || (this.posSelected.x !== posSelected.x || this.posSelected.y !== posSelected.y))
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
        posSelected = { "x": Math.floor(this.mousePos.x / 100), "y": Math.floor(this.mousePos.y / 100) }
      else
        posSelected = { "x": 7 - Math.floor(this.mousePos.x / 100), "y": 7 - Math.floor(this.mousePos.y / 100) }

      if (posSelected.x !== this.state.pieceBeingDragged.x || posSelected.y !== this.state.pieceBeingDragged.y) {
        this.props.deselectPiece()
        this.posSelected = null
      }

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

  offScreen() {
    if (this.state.pieceBeingDragged) {

      this.props.deselectPiece()
      this.posSelected = null

      this.setState({
        pieceBeingDragged: null
      })
    }
  }

  private _onMouseMove(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    const mainBoard = document.getElementById("main-board")
    if (mainBoard) {
      const bounds = mainBoard.getBoundingClientRect();
      this.mousePos = { "x": event.clientX - bounds.left, "y": event.clientY - bounds.top }
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
    const currentTurn = this.props.board.getTurn('next')
    const prevTurnInReferenceToSelf = (this.props.ownTeam === 'any') ? (this.props.board.getTurn('prev') === 'white') ? "self" : "other" : (this.props.ownTeam === this.props.board.getTurn('prev')) ? "self" : "other"
    const inCheck = this.props.board.inCheck(currentTurn)
    let inCheckPos: Vector | React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement> | null = null
    let unsortedPieces: ([JSX.Element, number] | [null, number])[] = pieces.map((item, index) => {
      if (inCheck && item.piece.code === 'k' && item.piece.team === currentTurn)
        inCheckPos = item.pos
      if (pieceBeingDragged && (pieceBeingDragged.x === item.pos.x && pieceBeingDragged.y === item.pos.y)) {
        if (this.props.showingPromotionSelector)
          return [null, 1000]
        return [<DraggedPiece key={item.piece.key}
          type={item.piece.code}
          team={item.piece.team}
          startingMousePos={this.mousePos}
        />, item.piece.key]
      } else
        return [<Piece key={item.piece.key}
          type={item.piece.code}
          team={item.piece.team}
          x={100 * ((this.props.notFlipped) ? item.pos.x : 7 - item.pos.x)}
          y={100 * ((this.props.notFlipped) ? item.pos.y : 7 - item.pos.y)}
          showAnimation={true}
          isGhost={false}
        />, item.piece.key]
    })
    unsortedPieces.sort(function (a, b) { return a[1] - b[1] })
    const piecesToDisplay = unsortedPieces.map((item, index) => {
      return item[0]
    })

    const legalMovesToDisplay = this.props.validMoves.map((item, index) => {
      return <ValidMove
        key={item.move.x.toString() + item.move.y.toString()}
        isCapture={(item.moveType.includes('capture'))}
        x={(this.props.notFlipped) ? item.move.x : 7 - item.move.x}
        y={(this.props.notFlipped) ? item.move.y : 7 - item.move.y}
      />;
    })

    let ghostPiece = null
    if (this.props.selectedPiece) {
      const piece = this.props.board.getPos(this.props.selectedPiece)
      if (piece)
        ghostPiece = <Piece
          type={piece.code}
          team={piece.team}
          x={100 * ((this.props.notFlipped) ? this.props.selectedPiece.x : 7 - this.props.selectedPiece.x)}
          y={100 * ((this.props.notFlipped) ? this.props.selectedPiece.y : 7 - this.props.selectedPiece.y)}
          showAnimation={false}
          isGhost={true}
        />;
    }

    if (inCheckPos) {
      inCheckPos = inCheckPos as Vector
      inCheckPos = <div className='square check' style={{ "top": ((this.props.notFlipped) ? 12.5 * inCheckPos.y : 12.5 * (7 - inCheckPos.y)) + "%", "left": ((this.props.notFlipped) ? 12.5 * inCheckPos.x : 12.5 * (7 - inCheckPos.x)) + "%" }}></div>
    }

    let squares: JSX.Element[] | null = null
    if (this.props.moveInfo)
      squares = [
        <Square
          key={"start"}
          pos={(this.props.notFlipped) ? this.props.moveInfo.start : { "x": 7 - this.props.moveInfo.start.x, "y": 7 - this.props.moveInfo.start.y }}
          classes={[prevTurnInReferenceToSelf, "prevMove", "start"]}
        ></Square>,
        <Square
          key={"end"}
          pos={(this.props.notFlipped) ? this.props.moveInfo.end : { "x": 7 - this.props.moveInfo.end.x, "y": 7 - this.props.moveInfo.end.y }}
          classes={[prevTurnInReferenceToSelf, "prevMove", "end"]}
        ></Square>
      ]


    console.log("Render Board")

    return (
      <div id='main-board' onMouseMove={this._onMouseMove.bind(this)} onMouseDown={() => this.mouseDown()} onMouseUp={() => this.mouseUp()} onMouseLeave={() => this.offScreen()}>
        <div id='legal-moves-layer'>
          {legalMovesToDisplay}
          {inCheckPos}
          {squares}
        </div>
        <div id='pieces-layer'>
          {piecesToDisplay}
          {ghostPiece}
        </div>
      </div>
    );
  }
}

export default Board