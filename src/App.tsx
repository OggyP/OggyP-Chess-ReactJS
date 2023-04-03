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
import Loading from './pages/loading';
import VersusStockfish from './pages/stockfish'
import NeedsLogin from './helpers/verifyToken'

import './css/all.scss'
import './css/normalise.scss'

function App() {
    let params = new URLSearchParams(document.location.search);
    return (
        <Router>
            <NavBar />
            <Routes>
                <Route path='/' element={<WelcomePage />} />
                <Route path='/analysis/*' element={<Analysis />} />
                <Route path='/viewGame/*' element={<ViewGame />} />
                <Route path='/login' element={<Login />} />
                <Route path='/register' element={<Register />} />
                <Route path='/home' element={
                    <NeedsLogin>
                        <Home userInfo={null} />
                    </NeedsLogin>
                } />
                <Route path='/play/*' element={
                    <NeedsLogin>
                        <PlayGame />
                    </NeedsLogin>
                } />
                <Route path='/stockfish' element={<VersusStockfish />} />
                <Route path='/loading' element={<Loading description='Do a barrel roll!' />} />
                <Route path='/error' element={<ErrorPage title={params.get('title') || "Unknown Error"} description={params.get('desc') || ""} />} />
                <Route path='*' element={<ErrorPage title='404 Page Not Found' description='' />} />
            </Routes>
        </Router>
    );
}

export default App