import Piece from './tsxAssets/piece'
import DraggedPiece from './tsxAssets/draggingPiece'
import TouchDraggedPiece from './tsxAssets/touchDraggingPiece'
import Square from './tsxAssets/square'
import ValidMove from './tsxAssets/validMove'
import Coords from './tsxAssets/coords'
import { Arrow, Circle } from './tsxAssets/custom-svgs'
import { ChessBoard, ChessPiece, convertToChessNotation, Teams, Vector } from './chessLogic'
import React from 'react';
import EngineBestMove from './tsxAssets/engineBestMove'
import { timeStamp } from 'console'

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
  boxSize: number
  showingPromotionSelector: boolean
  haveEngine: boolean
  doPremove: Function
  isLatestBoard: boolean
  premoves?: { start: Vector, end: Vector }[]
  deletePremoves?: Function
  onMounted?: Function
  boardStyle: {
    white: string,
    black: string,
  }
}
interface BoardState {
  pieceBeingDragged: Vector | null
  beingDraggedPieceKey: number | null
  dragType: 'mouse' | 'touch' | null
  arrowDrag: {
    start: Vector
    end: Vector
  } | null
  customSVG: {
    arrows: [Vector, Vector][]
    circles: Vector[]
  }
}
class Board extends React.Component<BoardProps, BoardState> {
  mousePos: Vector;
  posSelected: Vector | null;
  constructor(props: BoardProps) {
    super(props)
    this.state = {
      pieceBeingDragged: null,
      beingDraggedPieceKey: null,
      dragType: null,
      arrowDrag: null,
      customSVG: {
        arrows: [],
        circles: []
      }
    }
    this.mousePos = { "x": 0, "y": 0 }
    this.posSelected = { "x": 0, "y": 0 }
  }

  componentDidMount() {
    if (this.props.onMounted) {
      this.props.onMounted({
        getDraggingPiece: () => { return this.state.pieceBeingDragged },
        clearCustomSVGS: () => {this.clearCustomSVGS()}
      });
    }
    console.log('setup')
    window.addEventListener("mousedown", this.mouseDown);
    window.addEventListener("mouseup", this.mouseUp);
    window.addEventListener("mousemove", this._onMouseMove);
    window.addEventListener("touchstart", this._onTouchStart);
    window.addEventListener("touchend", this._onTouchEnd);
  }

  componentWillUnmount() {
    console.log('unmount')
    window.removeEventListener("mousedown", this.mouseDown);
    window.removeEventListener("mouseup", this.mouseUp);
    window.removeEventListener("mousemove", this._onMouseMove);
    window.removeEventListener("touchstart", this._onTouchStart);
    window.removeEventListener("touchend", this._onTouchEnd);
  }

  private _onTouchStart = (event: TouchEvent) => {
    const mainBoard = document.getElementById("main-board")
    if (!mainBoard) return
    const bounds = mainBoard.getBoundingClientRect();
    let coordPressed = { "x": event.touches[0].clientX - bounds.left, "y": event.touches[0].clientY - bounds.top }
    this.mousePos = coordPressed
    let posSelected: Vector;
    if (this.props.notFlipped)
      posSelected = { "x": Math.floor(coordPressed.x / this.props.boxSize), "y": Math.floor(coordPressed.y / this.props.boxSize) }
    else
      posSelected = { "x": 7 - Math.floor(coordPressed.x / this.props.boxSize), "y": 7 - Math.floor(coordPressed.y / this.props.boxSize) }
    if (posSelected.x >= 0 && posSelected.x < 8 && posSelected.y >= 0 && posSelected.y < 8) {
      this.posClicked(posSelected, 'touch')
    }
  }

  private _onTouchEnd = (event: TouchEvent) => {
    const mainBoard = document.getElementById("main-board")
    if (!mainBoard) return
    const bounds = mainBoard.getBoundingClientRect();
    let coordPressed = { "x": event.changedTouches[0].clientX - bounds.left, "y": event.changedTouches[0].clientY - bounds.top }
    this.mousePos = coordPressed
    let posSelected: Vector;
    if (this.props.notFlipped)
      posSelected = { "x": Math.floor(coordPressed.x / this.props.boxSize), "y": Math.floor(coordPressed.y / this.props.boxSize) }
    else
      posSelected = { "x": 7 - Math.floor(coordPressed.x / this.props.boxSize), "y": 7 - Math.floor(coordPressed.y / this.props.boxSize) }
    this.posReleased(posSelected)
  }

  mouseDown = (event: MouseEvent) => {
    event.stopImmediatePropagation()
    console.log(this.mousePos, event, this.props.boxSize, this)
    let posSelected: Vector;
    if (this.props.notFlipped)
      posSelected = { "x": Math.floor(this.mousePos.x / this.props.boxSize), "y": Math.floor(this.mousePos.y / this.props.boxSize) }
    else
      posSelected = { "x": 7 - Math.floor(this.mousePos.x / this.props.boxSize), "y": 7 - Math.floor(this.mousePos.y / this.props.boxSize) }
    if (posSelected.x >= 0 && posSelected.x < 8 && posSelected.y >= 0 && posSelected.y < 8) {
      console.log(posSelected)
      if (event.button === 0) {
        this.posClicked(posSelected, 'mouse')
        this.clearCustomSVGS()
      }
      else if (event.button === 2) {
        if (this.props.deletePremoves && this.props.premoves && this.props.premoves.length > 0)
          this.props.deletePremoves()
        else {
          this.setState({
            arrowDrag: {
              start: posSelected,
              end: posSelected
            }
          })
        }
      }
    }
  }

  clearCustomSVGS() {
    if (this.state.customSVG.circles.length > 0 || this.state.customSVG.arrows.length > 0)
      this.setState({
        customSVG: {
          arrows: [],
          circles: []
        }
      })
  }

  posClicked(posSelected: Vector, dragType: 'mouse' | 'touch'): void {
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

    if (piece && (this.props.ownTeam === 'any' || piece.team === this.props.ownTeam)) {
      if (!this.posSelected || (this.posSelected.x !== posSelected.x || this.posSelected.y !== posSelected.y))
        this.props.onPieceClick(posSelected)
      this.setState({
        pieceBeingDragged: posSelected,
        beingDraggedPieceKey: piece.key,
        dragType: dragType
      })
    }
  }

  mouseUp = () => {
    if (this.state.pieceBeingDragged) {
      let posSelected: Vector;
      if (this.props.notFlipped)
        posSelected = { "x": Math.floor(this.mousePos.x / this.props.boxSize), "y": Math.floor(this.mousePos.y / this.props.boxSize) }
      else
        posSelected = { "x": 7 - Math.floor(this.mousePos.x / this.props.boxSize), "y": 7 - Math.floor(this.mousePos.y / this.props.boxSize) }

      this.posReleased(posSelected)
    } else if (this.state.arrowDrag) {
      const currentCustomSVGS = this.state.customSVG
      if (this.state.arrowDrag.start.x !== this.state.arrowDrag.end.x || this.state.arrowDrag.start.y !== this.state.arrowDrag.end.y)
        // arrow
        currentCustomSVGS.arrows.push([this.state.arrowDrag.start, this.state.arrowDrag.end])
      else
        // circle
        currentCustomSVGS.circles.push(this.state.arrowDrag.start)
      this.setState({
        arrowDrag: null,
        customSVG: currentCustomSVGS
      })
    }
  }

  posReleased(posSelected: Vector) {
    if (!this.state.pieceBeingDragged) return
    for (let i = 0; i < this.props.validMoves.length; i++) {
      const validMoveToCheck = this.props.validMoves[i]
      if (posSelected.x === validMoveToCheck.move.x && posSelected.y === validMoveToCheck.move.y) {
        this.setState({
          pieceBeingDragged: null,
          beingDraggedPieceKey: null,
          dragType: null
        })
        this.props.onValidMoveClick(posSelected)
        return
      }
    }

    if (posSelected.x !== this.state.pieceBeingDragged.x || posSelected.y !== this.state.pieceBeingDragged.y) {
      if (this.props.isLatestBoard && this.props.board.getTurn('next') !== this.props.ownTeam) {
        // handle pre moves
        console.log(this.props)
        this.props.doPremove(this.state.pieceBeingDragged, posSelected)
      }
      this.props.deselectPiece()
      this.posSelected = null
    } else if (this.props.deletePremoves) {
      this.props.deletePremoves()
    }

    this.setState({
      pieceBeingDragged: null,
      beingDraggedPieceKey: null,
      dragType: null
    })
  }

  offScreen() {
    if (this.state.pieceBeingDragged) {

      this.props.deselectPiece()
      this.posSelected = null

      this.setState({
        pieceBeingDragged: null,
        beingDraggedPieceKey: null,
        dragType: null
      })
    }
  }

  private _onMouseMove = (event: MouseEvent) => {
    const mainBoard = document.getElementById("main-board")
    if (mainBoard) {
      const bounds = mainBoard.getBoundingClientRect();
      this.mousePos = { "x": event.clientX - bounds.left, "y": event.clientY - bounds.top }
      if (this.state.arrowDrag) {
        let posSelected: Vector;
        if (this.props.notFlipped)
          posSelected = { "x": Math.floor(this.mousePos.x / this.props.boxSize), "y": Math.floor(this.mousePos.y / this.props.boxSize) }
        else
          posSelected = { "x": 7 - Math.floor(this.mousePos.x / this.props.boxSize), "y": 7 - Math.floor(this.mousePos.y / this.props.boxSize) }
        if (posSelected.x !== this.state.arrowDrag.end.x || posSelected.y !== this.state.arrowDrag.end.y) {
          this.setState({
            arrowDrag: {
              start: this.state.arrowDrag.start,
              end: posSelected
            }
          })
        }
      }
    }
  }

  render() {
    console.log(this)
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
        if (item.piece.key !== this.state.beingDraggedPieceKey)
          return [null, 1000]
        if (this.props.showingPromotionSelector)
          return [null, 1000]
        if (this.state.dragType === 'mouse')
          return [<DraggedPiece key={item.piece.key}
            type={item.piece.code}
            team={item.piece.team}
            startingMousePos={this.mousePos}
            halfBoxSize={this.props.boxSize / 2}
          />, item.piece.key]
        else
          return [<TouchDraggedPiece key={item.piece.key}
            type={item.piece.code}
            team={item.piece.team}
            startingMousePos={this.mousePos}
            halfBoxSize={this.props.boxSize / 2}
          />, item.piece.key]
      } else
        return [<Piece key={item.piece.key}
          type={item.piece.code}
          team={item.piece.team}
          x={this.props.boxSize * ((this.props.notFlipped) ? item.pos.x : 7 - item.pos.x)}
          y={this.props.boxSize * ((this.props.notFlipped) ? item.pos.y : 7 - item.pos.y)}
          showAnimation={true}
          isGhost={false}
        // text={item.piece.code + ' ' + item.piece.team}
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
        boxSize={this.props.boxSize}
      />;
    })

    let ghostPiece = null
    if (this.props.selectedPiece) {
      const piece = this.props.board.getPos(this.props.selectedPiece)
      if (piece)
        ghostPiece = <Piece
          type={piece.code}
          team={piece.team}
          x={this.props.boxSize * ((this.props.notFlipped) ? this.props.selectedPiece.x : 7 - this.props.selectedPiece.x)}
          y={this.props.boxSize * ((this.props.notFlipped) ? this.props.selectedPiece.y : 7 - this.props.selectedPiece.y)}
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
          boxSize={this.props.boxSize}
          pos={this.props.moveInfo.start}
          classes={[prevTurnInReferenceToSelf, "prevMove", "start"]}
          notFlipped={this.props.notFlipped}
        ></Square>,
        <Square
          key={"end"}
          boxSize={this.props.boxSize}
          pos={this.props.moveInfo.end}
          classes={[prevTurnInReferenceToSelf, "prevMove", "end"]}
          notFlipped={this.props.notFlipped}
        ></Square>
      ]

    let preMoveSquaresStart: JSX.Element[] | null = null
    let preMoveSquaresEnd: JSX.Element[] | null = null
    if (this.props.premoves) {
      preMoveSquaresStart = this.props.premoves.map((item, index) => {
        return <Square
          key={index}
          boxSize={this.props.boxSize}
          pos={item.start}
          notFlipped={this.props.notFlipped}
          classes={['premove', 'end']}
        />
      })

      preMoveSquaresEnd = this.props.premoves.map((item, index) => {
        return <Square
          key={index}
          boxSize={this.props.boxSize}
          pos={item.end}
          notFlipped={this.props.notFlipped}
          classes={['premove', 'end']}
        />
      })
    }

    const svgArrows = this.state.customSVG.arrows.map((item, index) => {
      return <Arrow key={index} start={item[0]} end={item[1]} notFlipped={this.props.notFlipped} />
    })

    const svgCircle = this.state.customSVG.circles.map((item, index) => {
      return <Circle key={index} pos={item} notFlipped={this.props.notFlipped} />
    })

    return (
      <div id='main-board' className='chess-board'>
        <div id='board-svg'>
          {/* <xml version="1.0" encoding="UTF-8" standalone="no" /> */}
          <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 8 8" shapeRendering="crispEdges">
            <g id="a">
              <g id="b">
                <g id="c">
                  <g id="d">
                    <rect width="1" height="1" fill={this.props.boardStyle.white} id="e" />
                    <use x="1" y="1" href="#e" xlinkHref="#e" />
                    <rect y="1" width="1" height="1" fill={this.props.boardStyle.black} id="f" />
                    <use x="1" y="-1" href="#f" xlinkHref="#f" />
                  </g>
                  <use x="2" href="#d" xlinkHref="#d" />
                </g>
                <use x="4" href="#c" xlinkHref="#c" />
              </g>
              <use y="2" href="#b" xlinkHref="#b" />
            </g>
            <use y="4" href="#a" xlinkHref="#a" />
          </svg>
        </div>
        <div id='legal-moves-layer'>
          {legalMovesToDisplay}
          {inCheckPos}
          {squares}
          {preMoveSquaresStart}
          {preMoveSquaresEnd}
        </div>
        <div id='pieces-layer'>
          {piecesToDisplay}
          {ghostPiece}
        </div>
        <svg id='custom-svg' viewBox='0 0 8 8'>
          <defs>
            <marker id="arrowhead-pb" orient="auto" markerWidth="4" markerHeight="8" refX="2.05" refY="2.01">
              <path d="M0,0 V4 L3,2 Z" fill="#003088"></path>
            </marker>
            <marker id="arrowhead-g" orient="auto" markerWidth="4" markerHeight="8" refX="2.05" refY="2.01">
              <path d="M0,0 V4 L3,2 Z" fill="#15781B"></path>
            </marker>
          </defs>
          <g>
            {
              (this.state.arrowDrag) ?
                (this.state.arrowDrag.start.x !== this.state.arrowDrag.end.x || this.state.arrowDrag.start.y !== this.state.arrowDrag.end.y) ?
                  <Arrow start={this.state.arrowDrag.start} end={this.state.arrowDrag.end} notFlipped={this.props.notFlipped} /> :
                  <Circle pos={this.state.arrowDrag.start} notFlipped={this.props.notFlipped} />
                : null
            }
            {svgArrows}
            {svgCircle}
          </g>
        </svg>

        {(this.props.haveEngine) ? <EngineBestMove
          notFlipped={this.props.notFlipped}
          boxSize={this.props.boxSize}
        /> : null}
        <Coords
          notFlipped={this.props.notFlipped}
        />
      </div>
    );
  }
}

export default Board