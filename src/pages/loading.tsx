import '../css/loading.scss'

interface LoadingPageProps {
    description: string
    title?: string
}

function LoadingPage(props: LoadingPageProps) {
    return (
        <div className='loading'>
            <h1><span className='loading-ani'>{(props.title) ? props.title : 'Loading'}</span></h1>
            <h3>{props.description}</h3>
            <img id='oulingchess' src={(Math.random() >= 0.98) ? '/ooooulingchessHead.png' : '/logo512.png'} alt='OggyP Chess Loading'></img>
        </div>
    )
}

export default LoadingPage