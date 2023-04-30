import { useState } from 'react';
import './css/navbar.scss'
import GoogleIcon from './tsxAssets/GoogleIcon';

interface NavBarProps {
}

function NavBar(props: NavBarProps) {
  const [open, setOpen] = useState(false);

  return (
    <nav id='navbar' aria-label='Main Menu'>
      <ul>
        <li className='home'>
          <a href='/home'>
            <img src='/assets/images/logo/white.svg' alt='OggyP Chess logo' />
          </a>
        </li>

        <li className='widescreen-only'>
          <a href='/analysis/standard'>Analyse</a>
        </li>
        <li className='widescreen-only'>
          <a href='/stockfish'>Stockfish</a>
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

        <li className={(open)? 'submenu open': 'submenu'}>
          <nav aria-label='Main Options'>
            <ul>
              <li><a href='/analysis/standard'>Analyse</a></li>
              <li><a href='/stockfish'>Stockfish</a></li>
              <li>
                <button>
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