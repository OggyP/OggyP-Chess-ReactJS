import Analysis from './pages/analysis'
import ViewGame from './pages/viewGame'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/login';
import Home from './pages/home';
import NavBar from './NavBar';
import PlayGame from './pages/play'

const wsURL = "wss://chess.oggyp.com:8443"

function App() {
  return (
    <Router>
      <NavBar/>
      <Routes>
        {/* <Route exact-path='/' exact-element={<Welcome />} /> */}
        <Route path='/analysis' element={<Analysis />} />
        <Route path='/viewGame/*' element={<ViewGame url={wsURL}/>} />
        <Route path='/login' element={<Login url={wsURL}/>} />
        <Route path='/home' element={<Home url={wsURL}/>} />
        <Route path='/play' element={<PlayGame url={wsURL}/>} />
      </Routes>
    </Router>
  );
}

export default App