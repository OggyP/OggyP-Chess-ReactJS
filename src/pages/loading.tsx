import * as React from 'react';
import '../css/loading.scss'

interface LoadingPageProps {
    description: string,
    title: string
}

function LoadingPage(props: LoadingPageProps) {
    return (
        <div className='loading'>
            <h1><span className='loading-ani'>{props.title}</span></h1>
            <h3>{props.description}</h3>
            <img id='oulingchess' src='/logo512.png'></img>
        </div>
    )
}

export default LoadingPage