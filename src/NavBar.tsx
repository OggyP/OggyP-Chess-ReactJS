import './css/navbar.scss'

interface NavBarProps {
}

function NavBar(props: NavBarProps) {
  return (
    <nav id='navbar'>
      <div className='item first'>
        <img alt='icon' src='/logo.svg' onClick={() => document.location.href = '/home'}></img>
      </div>
      <a className='item' href='/analysis/standard'>Analyse</a>
      <a className='item' href='/stockfish'>Stockfish</a>
    </nav>
  )
}

export default NavBar