import './css/navbar.scss' 

interface NavBarProps {
}

function NavBar(props: NavBarProps) {
  return (
    <div id='navbar'>
      <img alt='icon' src='/logo.svg' onClick={() => document.location.href = '/home'}></img>
      <p className='item' onClick={() => document.location.href = '/analysis'}>Analyse</p>
    </div>
  )
}

export default NavBar