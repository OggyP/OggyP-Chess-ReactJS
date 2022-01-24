import Analysis from './pages/analysis'
import ViewGame from './pages/viewGame'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/login';
import Register from './pages/register';
import Home from './pages/home';
import NavBar from './NavBar';
import PlayGame from './pages/play'
import ErrorPage from './pages/Error'
import WelcomePage from './pages/Welcome'
import VersusStockfish from './pages/stockfish'

import './css/all.scss'
import './css/normalise.css'

const wsURL = "wss://chess.oggyp.com:8443"

function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        <Route path='/' element={<WelcomePage />} />
        <Route path='/analysis' element={<Analysis />} />
        <Route path='/viewGame/*' element={<ViewGame url={wsURL} />} />
        <Route path='/login' element={<Login url={wsURL} />} />
        <Route path='/register' element={<Register url={wsURL} />} />
        <Route path='/home' element={<Home url={wsURL} />} />
        <Route path='/play' element={<PlayGame url={wsURL} />} />
        <Route path='/stockfish' element={<VersusStockfish />} />
        <Route path='*' element={<ErrorPage title='404 Page Not Found' description='' />} />
      </Routes>
    </Router>
  );
}

export default App