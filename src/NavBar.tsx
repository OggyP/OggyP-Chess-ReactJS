'use client'

import { PropsWithChildren, useEffect, useRef, useState } from 'react';
import './css/navbar.scss'
import GoogleIcon from './tsxAssets/GoogleIcon';
import { gameModesList } from './helpers/gameModes'
import { checkForToken } from './helpers/getToken'

interface SubmenuProps {
  name: string
  icon?: string
  widescreen?: boolean
  lastElement?: boolean
}

function Submenu(props: PropsWithChildren<SubmenuProps>) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLLIElement>(null)
  const trigger = props.icon ? <GoogleIcon name={props.icon} /> : props.name
  const classOpen = open ? 'open ' : ''
  const classWidescreen = props.widescreen ? 'widescreen-only ' : 'smallscreen-only '
  const classLastElement = props.lastElement ? 'last-element ' : 'not-last-element '

  useEffect(() => {
    if (!open) return

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node | null
      if (target && rootRef.current && !rootRef.current.contains(target)) {
        setOpen(false)
      }
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('mousedown', onPointerDown)
    document.addEventListener('touchstart', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('mousedown', onPointerDown)
      document.removeEventListener('touchstart', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <li
      ref={rootRef}
      className={classOpen + classWidescreen + classLastElement + 'submenu'}
    >
      <button
        type='button'
        aria-expanded={open}
        aria-haspopup='true'
        aria-label={props.icon ? props.name : undefined}
        onClick={() => setOpen(!open)}
      >
        {trigger}
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
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    setLoggedIn(!!checkForToken())
  }, [])

  const logout = () => {
    localStorage.removeItem('token')
    window.location.href = '/login'
  }

  const authControl = (key: string) => loggedIn ? (
    <button key={key} type='button' onClick={logout}>Logout</button>
  ) : (
    <a key={key} href='/login'>Login</a>
  )

  return (
    <nav id='navbar' aria-label='Main Menu'>
      <ul>
        <li className='home'>
          <a href='/home'>
            <img src='/assets/images/logo/white.svg' alt='OggyP Chess logo' />
          </a>
        </li>

        <Submenu name='Analyse' widescreen>
          {gameModesList.map(value => (
            <li key={value[0]}>
              <a href={`/analysis/${value[0]}`}>{value[1]}</a>
            </li>
          ))}
        </Submenu>

        <li className='widescreen-only'>
          <a href='/stockfish'>Stockfish</a>
        </li>

        <li className='widescreen-only first-right-element'>
          {authControl('desktop-auth')}
        </li>

        <Submenu name='Menu' icon='menu' lastElement>
          <li>
            <h3>Analyse</h3>
          </li>

          {gameModesList.map(value => (
            <li key={'sub-' + value[0]}>
              <a href={`/analysis/${value[0]}`}>{value[1]}</a>
            </li>
          ))}

          <li>
            <hr />
          </li>

          <li>
            <a href='/stockfish'>Stockfish</a>
          </li>

          <li>
            {authControl('mobile-auth')}
          </li>
        </Submenu>
      </ul>
    </nav>
  )
}

export default NavBar
