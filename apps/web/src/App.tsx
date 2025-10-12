import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import DemoPage from './pages/DemoPage';
import GamesPage from './pages/GamesPage';
import AboutPage from './pages/AboutPage';
import TicTacToeSetup from './pages/TicTacToeSetup';
import TicTacToeGameDualSystem from './pages/TicTacToeGameDualSystem';
import DotsAndBoxesSetup from './pages/DotsAndBoxesSetup';
import DotsAndBoxesGameDualSystem from './pages/DotsAndBoxesGameDualSystem';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/demo" element={<DemoPage />} />
        <Route path="/games" element={<GamesPage />} />
        <Route path="/games/tic-tac-toe" element={<TicTacToeSetup />} />
        <Route path="/games/tic-tac-toe/play" element={<TicTacToeGameDualSystem />} />
        <Route path="/games/dots-and-boxes" element={<DotsAndBoxesSetup />} />
        <Route path="/games/dots-and-boxes/play" element={<DotsAndBoxesGameDualSystem />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
