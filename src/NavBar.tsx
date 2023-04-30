import './css/navbar.scss'
import { gameModesList } from './helpers/gameModes'

interface NavBarProps {
}

function NavBar(props: NavBarProps) {
    return (
        <nav id='navbar'>
            <div className='item first'>
                <img alt='icon' src='/logo.svg' onClick={() => document.location.href = '/home'}></img>
            </div>
            <div className="dropdown item">
                <button className='dropbtn'>Analyse<i className="fa fa-caret-down"></i></button>
                <div className="dropdown-content">
                    {gameModesList.map(value => {
                        return <a key={value[0]} href={`/analysis/${value[0]}`}>{value[1]}</a>
                    })}
                </div>
            </div>
            <a className='item' href='/stockfish'>Stockfish</a>
        </nav>
    )
}

export default NavBar