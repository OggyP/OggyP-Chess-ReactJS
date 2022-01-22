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
        <p onClick={() => document.location.href = '/analysis'}>Analyse</p>
      </div>
      <div className='item'>
        <p onClick={() => {
          if (window.location.pathname !== '/stockfish/')
            document.location.href = '/stockfish'
          else {
            console.log('good reload')
            window.location.reload()
          }
        }}>Stockfish</p>
      </div>
    </div>
  )
}

export default NavBar