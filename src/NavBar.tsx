'use client'

import { useEffect, useState } from 'react';
import './css/navbar.scss'
import GoogleIcon from './tsxAssets/GoogleIcon';
import { gameModesList } from './helpers/gameModes'
import { checkForToken } from './helpers/getToken'

function NavBar() {
  const [open, setOpen] = useState(false);
  const [showGameModes, setShowGameModes] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(!!checkForToken())
  }, [])

  const logout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login'
  }

  return (
    <nav id='navbar' aria-label='Main Menu'>
      <ul>
        <li className='home'>
          <a href='/home'>
            <img src='/assets/images/logo/white.svg' alt='OggyP Chess logo' />
          </a>
        </li>

        <li className='widescreen-only'>
          <a onClick={() => setShowGameModes(!showGameModes)} style={{ paddingLeft: "30px", paddingRight: "30px" }}>Analyse</a>
          {showGameModes && gameModesList.map(value => {
            return <a className='drop-down' key={value[0]} href={`/analysis/${value[0]}`}>{value[1]}</a>
          })}
        </li>

        <li className='widescreen-only'>
          <a href='/stockfish'>Stockfish</a>
        </li>

        <li className='widescreen-only'>
          {loggedIn ? (
            <a onClick={logout}>Logout</a>
          ) : (
            <a href='/login'>Login</a>
          )}
        </li>

        <li className='widescreen-only mode-switch'>
          <button type='button' aria-label='Toggle colour theme'>
            <GoogleIcon name='dark_mode' />
          </button>
        </li>

        <li className='toggle-button'>
          <button type='button' onClick={() => { setOpen(!open) }} aria-label='More options'>
            <img src='/assets/images/hamburger/light.svg' alt='' />
          </button>
        </li>

        <li className={(open) ? 'submenu open' : 'submenu'}>
          <nav aria-label='Main Options'>
            <ul>
              <li>
                <div className="dropdown item">
                  <button type='button' className='dropbtn'>Analyse</button>
                  <div className="dropdown-content">
                    {gameModesList.map(value => {
                      return <a key={value[0]} href={`/analysis/${value[0]}`}>{value[1]}</a>
                    })}
                    {loggedIn ? (
                      <a onClick={logout}>Logout</a>
                    ) : (
                      <a href='/login'>Login</a>
                    )}
                  </div>
                </div>
              </li>
              <li><a href='/stockfish'>Stockfish</a></li>
              <li>
                <button type='button' aria-label='Toggle colour theme'>
                  <GoogleIcon name='dark_mode' />
                </button>
              </li>
            </ul>
          </nav>
        </li>
      </ul>
    </nav>
  )
}

export default NavBar
