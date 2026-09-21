'use client'

import { useEffect, useState } from 'react'
import '../css/loading.scss'

interface LoadingPageProps {
    description: string
    title?: string
}

function LoadingPage(props: LoadingPageProps) {
    const [imgSrc, setImgSrc] = useState('/logo512.png')

    useEffect(() => {
        if (Math.random() >= 0.95) {
            setImgSrc('/ooooulingchessHead.png')
        }
    }, [])

    return (
        <div className='loading'>
            <h1><span className='loading-ani'>{(props.title) ? props.title : 'Loading'}</span></h1>
            <h3>{props.description}</h3>
            <img id='oulingchess' src={imgSrc} alt='OggyP Chess Loading'></img>
        </div>
    )
}

export default LoadingPage
