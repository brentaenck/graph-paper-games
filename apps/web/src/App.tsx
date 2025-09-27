import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import DemoPage from './pages/DemoPage';
import GameLoopDemo from './pages/GameLoopDemo';
import GamesPage from './pages/GamesPage';
import AboutPage from './pages/AboutPage';
import TicTacToeSetup from './pages/TicTacToeSetup';
import TicTacToeGame from './pages/TicTacToeGame';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/demo" element={<DemoPage />} />
        <Route path="/game-loop" element={<GameLoopDemo />} />
        <Route path="/games" element={<GamesPage />} />
        <Route path="/games/tic-tac-toe" element={<TicTacToeSetup />} />
        <Route path="/games/tic-tac-toe/play" element={<TicTacToeGame />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
