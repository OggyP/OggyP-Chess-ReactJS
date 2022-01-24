import './css/navbar.scss'

interface NavBarProps {
}

function NavBar(props: NavBarProps) {
  return (
    <div id='navbar'>
      <div className='item first'>
        <img alt='icon' src='/logo.svg' onClick={() => document.location.href = '/home'}></img>
      </div>
      <a className='item' href='/analysis'>Analyse</a>
      <a className='item' href='/stockfish'>Stockfish</a>
    </div>
  )
}

export default NavBar