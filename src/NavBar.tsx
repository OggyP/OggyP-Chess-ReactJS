import './css/navbar.scss'

interface NavBarProps {
}

function NavBar(props: NavBarProps) {
  return (
    <div id='navbar'>
      <div className='item first'>
        <img alt='icon' src='/logo.svg' onClick={() => document.location.href = '/home'}></img>
      </div>
      <div className='item'>
        <a href='/analysis'>Analyse</a>
      </div>
      <div className='item'>
        <a href='/stockfish'>Stockfish</a>
      </div>
    </div>
  )
}

export default NavBar