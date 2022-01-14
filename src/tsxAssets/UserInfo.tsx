import React, { useState, useRef } from 'react';
import { Teams } from '../chessLogic/types'

interface UserInfoProps {
  team: Teams
  username: string
  rating: number
  ratingChange?: number
  title?: string
  timer?: {
    startTime: number; // UNIX Time
    countingDown: boolean
    time: number
  }
  isTurn: boolean
}

function UserInfo(props: UserInfoProps) {

  const Ref = useRef<null | NodeJS.Timer>(null);

  const [time, setTime] = useState<number>((props.timer?.startTime || 0));

  let title = null
  if (props.title)
    title = <span className='title'>{props.title}</span>
  let ratingChange = null
  if (props.ratingChange)
    ratingChange = <span className='rating-change'>{props.ratingChange}</span>

  React.useEffect(() => {
    if (props.timer && props.timer.countingDown)
      Ref.current = setInterval(() => {
        if (props.timer) {
          const newTime = props.timer.time - ((new Date().getTime()) - props.timer.startTime)
          setTime(newTime)
        }
      }, 1000)
    else if (props.timer)
      setTime(props.timer.time)
    return () => {
      if (Ref.current) clearInterval(Ref.current);
    };
  }, [props.timer])

  let timeInSec = Math.round(time / 1000)
  if (timeInSec < 0) timeInSec = 0
  const hours = Math.floor(timeInSec / 3600)
  const mins = Math.floor((timeInSec % 3600) / 60)
  const secs = timeInSec % 60

  const timeToDisplay: string = ((hours) ? hours + ':' : '') + ((hours || mins) ? ((mins < 10) ? '0' + mins : mins) + ':' : '') + ((secs < 10) ? '0' + secs : secs)

  return <div className={props.team + ' player-info' + ((props.isTurn) ? ' isTurn' : '')}>
    <h4>{title} {props.username} <span className='rating'>{Math.round(props.rating)}</span>{ratingChange}{(props.timer) ? <span className='timer'>{timeToDisplay}</span> : null}</h4>
  </div>
}

export default UserInfo