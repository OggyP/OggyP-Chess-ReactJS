import { useState } from 'react';
import './css/navbar.scss'
import GoogleIcon from './tsxAssets/GoogleIcon';
import { gameModesList } from './helpers/gameModes'

interface NavBarProps {
}

function NavBar(props: NavBarProps) {
  const [open, setOpen] = useState(false);

  const [showGameModes, setShowGameModes] = useState(false);

  return (
    <nav id='navbar' aria-label='Main Menu'>
      <ul>
        
        {/* <li className='home'>
          <a href='/home'>
            <img src='/assets/images/logo/white.svg' alt='OggyP Chess logo' />
          </a>
        </li>

        <li className={((open) ? 'submenu open' : 'submenu') + ' widescreen-only'}>
          <nav aria-label='Analysis Options'>
            <ul>
              <li>
                <div className="dropdown item">
                  <button className='dropbtn'>Analyse<i className="fa fa-caret-down"></i></button>
                  <div className="dropdown-content">
                    {gameModesList.map(value => {
                      return <a key={value[0]} href={`/analysis/${value[0]}`}>{value[1]}</a>
                    })}
                    <a onClick={() => { localStorage.removeItem('token'); window.location.href = '/login' }}>
                      Logout
                    </a>
                  </div>
                </div>
              </li>
              <li><a href='/stockfish'>Stockfish</a></li>
              <li>
                <button>
                  <GoogleIcon name='dark_mode' />
                </button>
              </li>
            </ul>
          </nav>
        </li>

        <li className='widescreen-only'>
          <button onClick={() => setShowGameModes(!showGameModes)} style={{paddingLeft: "30px", paddingRight: "30px"}}>Analyse</button>
          {showGameModes && gameModesList.map(value => {
            return <a className='drop-down' key={value[0]} href={`/analysis/${value[0]}`}>{value[1]}</a>
          })}
        </li>

        <li className='widescreen-only'>
          <a href='/stockfish'>Stockfish</a>
        </li>

        <li className='widescreen-only'>
          <button onClick={() => { localStorage.removeItem('token'); window.location.href = '/login' }}>
            Logout
          </button>
        </li>

        <li className='widescreen-only mode-switch'>
          <button>
            <GoogleIcon name='dark_mode' />
          </button>
        </li>

        <li className='toggle-button'>
          <button onClick={() => { setOpen(!open) }}>
            <img src='/assets/images/hamburger/light.svg' alt='More Options button' />
          </button>
        </li>

        <li className={(open) ? 'submenu open' : 'submenu'}>
          <nav aria-label='Main Options'>
            <ul>
              <li>
                <div className="dropdown item">
                  <button className='dropbtn'>Analyse<i className="fa fa-caret-down"></i></button>
                  <div className="dropdown-content">
                    {gameModesList.map(value => {
                      return <a key={value[0]} href={`/analysis/${value[0]}`}>{value[1]}</a>
                    })}
                    <a onClick={() => { localStorage.removeItem('token'); window.location.href = '/login' }}>
                      Logout
                    </a>
                  </div>
                </div>
              </li>
              <li><a href='/stockfish'>Stockfish</a></li>
              <li>
                <button>
                  <GoogleIcon name='dark_mode' />
                </button>
              </li>
            </ul>
          </nav>
        </li> */}
      </ul>
    </nav>
  )
}

export default NavBar