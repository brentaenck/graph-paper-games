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

import { useNavigate } from 'react-router-dom';

const GamesPage = () => {
  const navigate = useNavigate();

  const handlePlayTicTacToe = () => {
    navigate('/games/tic-tac-toe');
  };

  const handlePlayDotsAndBoxes = () => {
    navigate('/games/dots-and-boxes');
  };

  const handlePlaySprouts = () => {
    navigate('/games/sprouts');
  };

  return (
    <div className="games-page">
      <div className="hero-section">
        <h1>Available Games</h1>
        <p>Choose from our collection of classic grid-based strategy games</p>
      </div>

      <div className="games-grid">
        <div className="game-card">
          <h3>Tic-Tac-Toe</h3>
          <p>The classic 3x3 strategy game with AI opponents</p>
          <div className="game-status">
            <span className="status-badge available">Ready to Play!</span>
          </div>
          <button className="btn-primary" onClick={handlePlayTicTacToe}>
            Play Game
          </button>
        </div>

        <div className="game-card">
          <h3>Sprouts</h3>
          <p>Connect points with curves in this topological puzzle game</p>
          <div className="game-status">
            <span className="status-badge available">Ready to Play!</span>
          </div>
          <button className="btn-primary" onClick={handlePlaySprouts}>
            Play Game
          </button>
        </div>

        <div className="game-card">
          <h3>Connect Four</h3>
          <p>Drop pieces to get four in a row</p>
          <div className="game-status">
            <span className="status-badge coming-soon">Coming Soon</span>
          </div>
          <button className="btn-primary" disabled>
            Play Game
          </button>
        </div>

        <div className="game-card">
          <h3>Dots and Boxes</h3>
          <p>Connect dots to form boxes and score points</p>
          <div className="game-status">
            <span className="status-badge available">Ready to Play!</span>
          </div>
          <button className="btn-primary" onClick={handlePlayDotsAndBoxes}>
            Play Game
          </button>
        </div>

        <div className="game-card">
          <h3>Battleship</h3>
          <p>Hunt and sink your opponent's fleet</p>
          <div className="game-status">
            <span className="status-badge planned">Planned</span>
          </div>
          <button className="btn-primary" disabled>
            Play Game
          </button>
        </div>
      </div>

      <div className="development-notice">
        <h2>In Development</h2>
        <p>We're actively building our game collection! Each game will feature:</p>
        <ul>
          <li>AI opponents with multiple difficulty levels (1-6)</li>
          <li>Local pass-and-play multiplayer</li>
          <li>Responsive design for all screen sizes</li>
          <li>Accessibility features for all players</li>
        </ul>
        <p>
          Want to contribute? Check out our{' '}
          <a href="https://github.com/GraphPaperGames" target="_blank" rel="noopener noreferrer">
            GitHub repository
          </a>{' '}
          for development guidelines and open issues.
        </p>
      </div>
    </div>
  );
};

export default GamesPage;