/**
 * Graph Paper Games - Classic grid-based strategy games for the web
 * Copyright (c) 2025 Brent A. Enck
 * 
 * This file is part of Graph Paper Games.
 * 
 * Graph Paper Games is free software: you can redistribute it and/or modify
 * it under the terms of the MIT License as published in the LICENSE file
 * included with this source code.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * MIT License for more details.
 */

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
import SproutsSetup from './pages/SproutsSetup';
import SproutsGameDualSystem from './pages/SproutsGameDualSystem';

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
        <Route path="/games/sprouts" element={<SproutsSetup />} />
        <Route path="/games/sprouts/play" element={<SproutsGameDualSystem />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </Layout>
  );
}

export default App;