import React, { useEffect, useState } from 'react';
import { checkForToken, deleteCookie } from './getToken';
import Loading from '../pages/loading'
import ErrorPage from '../pages/Error'
import { tokenToString } from 'typescript';

interface userInfo {
    userId: number
    username: string
    createdAt: string
    wins: number
    draws: number
    gamesPlayed: number
    rating: number
    gameIds: string
    ratingDeviation: number
}

interface userInfoExport {
    userId: number
    username: string
    createdAt: string
    wins: number
    draws: number
    gamesPlayed: number
    rating: number
    gameIds: string
    ratingDeviation: number
    tokenInfo: {token: string, userId: string | number}
}

const NeedsLogin = (props: { url: string, children: React.ReactNode }) => {

    const [userInfo, setUserInfo] = useState<null | userInfo>(null);
    const [errorInfo, setErrorInfo] = useState<null | string>(null);
    const [tokenInfo, setTokenInfo] = useState<null | {token: string, userId: string | number}>(null);

    const { children } = props

    useEffect(() => {
        const getToken = async () => {
            const token = checkForToken()
            if (!token) {
                document.location.href = '/login/?ref=' + document.location.pathname + document.location.search;
                return
            } else {
                let response = await fetch(props.url + "account/token", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json;charset=utf-8'
                    },
                    body: JSON.stringify({
                        token: token.token,
                        userId: token.userId
                    })
                })

                if (response.ok) {
                    const data = await response.json()
                    setTokenInfo({
                        token: token.token,
                        userId: token.userId
                    })
                    setUserInfo(data)
                } else if (response.status === 401) {
                    deleteCookie('token')
                    document.location.href = '/login/?ref=' + document.location.pathname + document.location.search;
                } else
                    setErrorInfo(`HTTP Error: ${response.status}. ${await response.text()}`)
            }
        }

        getToken()
    }, [props.url])

    if (userInfo) {
        const childrenWithProps = React.Children.map(children, child => {
            if (React.isValidElement(child)) {
                return React.cloneElement(child, {userInfo: {...userInfo, tokenInfo: tokenInfo}})
            }
            return child
        })
        return <>{childrenWithProps}</>

    }
    else if (errorInfo) {
        return <ErrorPage description={errorInfo} title='OggyP Chess API Error' />
    } else {
        return <Loading description={"Connecting To OggyP Chess API"} />
    }
}

export default NeedsLogin
export type { userInfoExport as userInfo }