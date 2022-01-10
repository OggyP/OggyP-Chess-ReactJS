import Analysis from './pages/analysis'
import ViewGame from './pages/viewGame'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';


const wsURL = "wss://chess.oggyp.com:8443"

function App() {
  return (
    <Router>
      <Routes>
        {/* <Route exact-path='/' exact-element={<Home />} /> */}
        <Route path='/analysis' element={<Analysis />} />
        <Route path='/viewGame/*' element={<ViewGame url={wsURL}/>} />
        {/* <Route path='/login' element={< />} /> */}
        {/* <Route path='/sign-up' element={<SignUp />} /> */}
      </Routes>
    </Router>
  );
}

export default App