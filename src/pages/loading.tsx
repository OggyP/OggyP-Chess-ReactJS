import '../css/loading.scss'

interface LoadingPageProps {
    description: string
}

function LoadingPage(props: LoadingPageProps) {
    return (
        <div className='loading'>
            <h1><span className='loading-ani'>Loading</span></h1>
            <h3>{props.description}</h3>
            <img id='oulingchess' src='/assets/images/ooooulingchessHead.png'></img>
        </div>
    )
}

export default LoadingPage