import React from 'react';
import { ChessGame as game } from '../chessLogic'

interface PreviousMovesProps {
  onMobile: boolean,
  notFlipped: boolean;
  players: {
    white: JSX.Element | null,
    black: JSX.Element | null
  },
  engineInfo: JSX.Element | null,
  goToMove: Function,
  game: game,
  viewingMove: number,
  latestMove: number,
}

function PreviousMoves(props: PreviousMovesProps) {
  let moveRows: React.DetailedHTMLProps<React.HTMLAttributes<HTMLTableRowElement>, HTMLTableRowElement>[] = []
  let currentRow: React.DetailedHTMLProps<React.TdHTMLAttributes<HTMLTableCellElement>, HTMLTableCellElement>[] = []
  for (let i = 1; i <= props.game.getMoveCount(); i++) {
    const move = props.game.getMove(i)
    if (i !== 1 && i % 2 === 1) // is white's turn and is not the first turn
    {
      moveRows.push(
        <tr key={i}><th scope='row'><p>{Math.floor(i / 2)}</p></th>{currentRow}</tr>
      )
      currentRow = []
    }
    currentRow.push(
      <td key={i} onClick={() => props.goToMove(i)} className={(props.viewingMove === i) ? 'current-move' : ''}><p>{move.text}</p></td>
    )
  }
  if (currentRow.length > 0) moveRows.push(
    <tr key={props.game.getMoveCount() + 1}><th scope='row'><p>{Math.floor((props.game.getMoveCount() + 1) / 2)}</p></th>{currentRow}</tr>
  )

  let gameOverDisplay: JSX.Element | null = null
  if (props.game.gameOver) {
    const winner = {
      "white": "White wins by",
      "draw": "Draw by",
      "black": "Black wins by"
    }
    const scoreVal = {
      'white': '1-0',
      'draw': '1/2-1/2',
      'black': '0-1'
    }
    gameOverDisplay = <div className='game-over'>
      {scoreVal[props.game.gameOver.winner]}<br />{winner[props.game.gameOver.winner]} {props.game.gameOver.by}
    </div>
  }

  const gameControls = <div id='game-viewmove-controls'>
    <p onClick={() => { if (props.viewingMove !== 0) props.goToMove(0) }} className={(props.viewingMove === 0) ? 'disabled' : ''}>
      <span className="material-icons-sharp">
        first_page
      </span>
    </p>
    <p onClick={() => { if (props.viewingMove !== 0) props.goToMove(props.viewingMove - 1) }} className={(props.viewingMove === 0) ? 'disabled' : ''}>
      <span className="material-icons-sharp">
        chevron_left
      </span>
    </p>
    <p onClick={() => { if (props.viewingMove !== props.latestMove) props.goToMove(props.viewingMove + 1) }} className={(props.latestMove === props.viewingMove) ? 'disabled' : ''}>
      <span className="material-icons-sharp">
        chevron_right
      </span>
    </p>
    <p onClick={() => { if (props.viewingMove !== props.latestMove) props.goToMove(props.latestMove) }} className={(props.latestMove === props.viewingMove) ? 'disabled' : ''}>
      <span className="material-icons-sharp">
        last_page
      </span>
    </p>
  </div>

  return <div id="previous-moves-wrapper" className={(props.onMobile) ? 'mobile' : ''}>
    <div className='col-down moves'>
      {(props.onMobile) ? gameOverDisplay : null}
      {(props.onMobile) ? gameControls : null}
      {(!props.onMobile) ? (props.notFlipped) ? props.players.black : props.players.white : null}
      <div className='scollable'>
        {(!props.onMobile) ? props.engineInfo : null}
        <table id="previous-moves">
          <thead>
            <tr>
              <th scope="col"></th>
              <th scope="col">White</th>
              <th scope="col">Black</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th scope='row'><p>0</p></th>
              <td colSpan={2} onClick={() => props.goToMove(0)} className={(props.viewingMove === 0) ? 'current-move' : ''}><p>Starting Position</p></td>
            </tr>
            {moveRows}
          </tbody>
        </table>
      </div>
      {(!props.onMobile) ? gameOverDisplay : null}
      {(!props.onMobile) ? (!props.notFlipped) ? <div style={{ verticalAlign: "bottom" }}>{props.players.black}</div> : props.players.white : null}
      {(!props.onMobile) ? gameControls : null}
    </div>
  </div>
}

export default PreviousMoves