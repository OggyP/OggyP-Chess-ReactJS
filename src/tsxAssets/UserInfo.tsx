import React, { useState, useRef } from 'react';
import { pieceCodesArray } from '../chessLogic/standard/pieces';
import { Teams } from '../chessLogic/types'

interface UserInfoProps {
    team: Teams
    username: string
    rating?: number
    ratingChange?: number
    title?: string
    timer?: {
        startTime: number; // UNIX Time
        countingDown: boolean
        time: number
    }
    material: any
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

    let material = ""

    for (let i = 0; i < pieceCodesArray.length; i++) {
        const pieceCode = pieceCodesArray[i]
        if (props.material[pieceCode])
            material += pieceCode.repeat(props.material[pieceCode] as number)
    }

    console.log(props.material)

    return <div className={props.team + ' player-info' + ((props.isTurn) ? ' isTurn' : '')}>
        <h4>
            {title && title + " "}
            {props.username + " "}
            {props.rating ? <span className='rating'>{Math.round(props.rating).toString() + " "}</span> : null}{ratingChange}
        </h4>
        <div className='material pieces'>{material.toUpperCase().split('').map(((item: string, index: number) => {
            return <img key={item + index} src={'/assets/images/materialCount/' + item + '.svg'} alt={item}></img>
        }))}</div>
        {props.material.points ? <p className='material points'> +{props.material.points}</p> : null}
        {(props.timer) ? <h4 className='timer'>
           {timeToDisplay}
        </h4> : null}
    </div>
}

export default UserInfo