import { PropsWithChildren, useState } from 'react';
import './css/navbar.scss';
import GoogleIcon from './tsxAssets/GoogleIcon';
import { gameModesList } from './helpers/gameModes';


interface SubmenuProps {
  name: string,
  icon?: string,
  widescreen?: boolean,
  lastElement?: boolean
}


function Submenu(props: PropsWithChildren<SubmenuProps>) {
  const [open, setOpen] = useState(false);
  const icon = (props.icon)? <GoogleIcon name={props.icon} /> : props.name;
  const classOpen = (open)? 'open ' : '';
  const classWidescreen = (props.widescreen)? 'widescreen-only ' : 'smallscreen-only ';
  const classLastElement = (props.lastElement)? 'last-element ' : 'not-last-element ';

  return (
    <li className={classOpen + classWidescreen + classLastElement + 'submenu'}>
      <button onClick={() => { setOpen(!open) }}>
        {icon}
      </button>

      <nav aria-label={props.name + ' Options'} className='submenu-contents'>
        <ul>
          {props.children}
        </ul>
      </nav>
    </li>
  )
}


function NavBar() {
  return (
    <nav id='navbar' aria-label='Main Menu'>
      <ul>
        <li className='home'>
          <a href="/home">
            <img src='/assets/images/logo/white.svg' alt='OggyP Chess logo' />
          </a>
        </li>

        <Submenu name='Analyse' widescreen>
            {gameModesList.map(value => { return (
              <li key={value[0]}>
                <a href={`/analysis/${value[0]}`}>{value[1]}</a>
              </li>
            )})}
        </Submenu>

        <li className='widescreen-only'>
          <a href="/stockfish">Stockstock</a>
        </li>

        <li className='widescreen-only'>
          <button onClick={() => { localStorage.removeItem('token'); window.location.href = '/login' }}>
            Logout
          </button>
        </li>

        <li className='first-right-element widescreen-only'>
          <button>
            <GoogleIcon name='dark_mode' />
          </button>
        </li>

        <Submenu name='Main' icon='menu' lastElement>
          <li>
            <h3>Analyse</h3>
          </li>

          {gameModesList.map(value => { return (
            <li key={'sub-' + value[0]}>
              <a href={`/analysis/${value[0]}`}>{value[1]}</a>
            </li>
          )})}

          <li>
            <hr />
          </li>

          <li>
            <a href="/stockfish">Sockfishh</a>
          </li>

          <li>
            <button onClick={() => { localStorage.removeItem('token'); window.location.href = '/login' }}>
              Logout
            </button>
          </li>

          <li>
            <button>
              <GoogleIcon name='dark_mode' />
            </button>
          </li>
        </Submenu>
      </ul>
    </nav>
  )
}

export default NavBar