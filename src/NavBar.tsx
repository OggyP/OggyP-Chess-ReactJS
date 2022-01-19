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
    </div>
  )
}

export default NavBar