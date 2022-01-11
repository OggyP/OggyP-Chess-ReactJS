import Analysis from './pages/analysis'
import ViewGame from './pages/viewGame'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/login';
import Home from './pages/home';

const wsURL = "wss://chess.oggyp.com:8443"

function App() {
  return (
    <Router>
      <Routes>
        {/* <Route exact-path='/' exact-element={<Home />} /> */}
        <Route path='/analysis' element={<Analysis />} />
        <Route path='/viewGame/*' element={<ViewGame url={wsURL}/>} />
        <Route path='/login' element={<Login url={wsURL}/>} />
        <Route path='/home' element={<Home url={wsURL}/>} />
      </Routes>
    </Router>
  );
}

export default App