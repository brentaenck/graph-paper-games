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

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AIDifficulty } from '@gpg/shared';

interface DotsAndBoxesConfig {
  gameMode: 'human-vs-human' | 'human-vs-ai';
  player1Name: string;
  player2Name: string;
  aiDifficulty: AIDifficulty;
  gridSize: { width: number; height: number };
}

const DotsAndBoxesSetup: React.FC = () => {
  const navigate = useNavigate();
  const [config, setConfig] = useState<DotsAndBoxesConfig>({
    gameMode: 'human-vs-ai',
    player1Name: 'Player 1',
    player2Name: 'AI',
    aiDifficulty: 3,
    gridSize: { width: 4, height: 4 }, // 4x4 dots = 3x3 boxes
  });

  const handleGameModeChange = (mode: DotsAndBoxesConfig['gameMode']) => {
    setConfig(prev => ({
      ...prev,
      gameMode: mode,
      player2Name: mode === 'human-vs-ai' ? 'AI' : 'Player 2',
    }));
  };

  const handleGridSizeChange = (width: number, height: number) => {
    setConfig(prev => ({
      ...prev,
      gridSize: { width, height },
    }));
  };

  const handleStartGame = () => {
    // Navigate to the game with configuration
    navigate('/games/dots-and-boxes/play', {
      state: { gameConfig: config },
    });
  };

  const difficultyLabels: Record<AIDifficulty, string> = {
    1: 'Beginner (Random)',
    2: 'Easy (Avoids giving boxes)',
    3: 'Medium (Basic Strategy)',
    4: 'Hard (Chain Aware)',
    5: 'Expert (Look Ahead)',
    6: 'Master (Near Perfect)',
  };

  const gridSizeOptions = [
    { width: 3, height: 3, label: '3×3 Dots (2×2 Boxes)', description: 'Quick game' },
    { width: 4, height: 4, label: '4×4 Dots (3×3 Boxes)', description: 'Classic size' },
    { width: 5, height: 5, label: '5×5 Dots (4×4 Boxes)', description: 'More strategy' },
    { width: 6, height: 4, label: '6×4 Dots (5×3 Boxes)', description: 'Wide rectangle' },
    { width: 6, height: 6, label: '6×6 Dots (5×5 Boxes)', description: 'Long game' },
  ];

  const getBoxCount = () => {
    const { width, height } = config.gridSize;
    return (width - 1) * (height - 1);
  };

  const getEstimatedDuration = () => {
    const boxCount = getBoxCount();
    if (boxCount <= 4) return '2-5 minutes';
    if (boxCount <= 9) return '5-10 minutes';
    if (boxCount <= 16) return '10-15 minutes';
    return '15-25 minutes';
  };

  return (
    <div className="dots-and-boxes-setup">
      <div className="container">
        <div className="setup-header">
          <h1>Dots and Boxes Setup</h1>
          <p>Connect dots to form boxes and score the most points to win!</p>
        </div>

        <div className="setup-form">
          {/* Game Mode Selection */}
          <div className="form-section">
            <h3>Game Mode</h3>
            <div className="game-mode-options">
              <button
                className={`mode-button ${config.gameMode === 'human-vs-human' ? 'active' : ''}`}
                onClick={() => handleGameModeChange('human-vs-human')}
              >
                <div className="mode-icon">👥</div>
                <div className="mode-label">
                  <strong>Human vs Human</strong>
                  <span>Play with a friend locally</span>
                </div>
              </button>

              <button
                className={`mode-button ${config.gameMode === 'human-vs-ai' ? 'active' : ''}`}
                onClick={() => handleGameModeChange('human-vs-ai')}
              >
                <div className="mode-icon">🤖</div>
                <div className="mode-label">
                  <strong>Human vs AI</strong>
                  <span>Challenge our AI opponent</span>
                </div>
              </button>
            </div>
          </div>

          {/* Grid Size Selection */}
          <div className="form-section">
            <h3>Grid Size</h3>
            <div className="grid-size-options">
              {gridSizeOptions.map(option => (
                <button
                  key={`${option.width}x${option.height}`}
                  className={`grid-size-button ${
                    config.gridSize.width === option.width && 
                    config.gridSize.height === option.height ? 'active' : ''
                  }`}
                  onClick={() => handleGridSizeChange(option.width, option.height)}
                >
                  <div className="grid-size-visual">
                    <svg width="40" height="32" viewBox="0 0 40 32">
                      {/* Dots */}
                      {Array.from({ length: Math.min(option.height, 4) }, (_, row) =>
                        Array.from({ length: Math.min(option.width, 5) }, (_, col) => (
                          <circle
                            key={`${row}-${col}`}
                            cx={8 + col * 8}
                            cy={8 + row * 8}
                            r="1.5"
                            fill="currentColor"
                          />
                        ))
                      )}
                      {/* Sample lines */}
                      <line x1="8" y1="8" x2="16" y2="8" stroke="currentColor" strokeWidth="1" opacity="0.5" />
                      <line x1="8" y1="8" x2="8" y2="16" stroke="currentColor" strokeWidth="1" opacity="0.5" />
                    </svg>
                  </div>
                  <div className="grid-size-info">
                    <span className="grid-size-label">{option.label}</span>
                    <span className="grid-size-desc">{option.description}</span>
                  </div>
                </button>
              ))}
            </div>
            
            <div className="grid-size-summary">
              <p>
                <strong>{getBoxCount()} boxes</strong> • Estimated duration: <strong>{getEstimatedDuration()}</strong>
              </p>
            </div>
          </div>

          {/* Player Names */}
          <div className="form-section">
            <h3>Players</h3>
            <div className="player-inputs">
              <div className="player-input">
                <label htmlFor="player1">Player 1 (Red):</label>
                <input
                  id="player1"
                  type="text"
                  value={config.player1Name}
                  onChange={e => setConfig(prev => ({ ...prev, player1Name: e.target.value }))}
                  placeholder="Enter name..."
                />
              </div>

              <div className="player-input">
                <label htmlFor="player2">Player 2 (Blue):</label>
                {config.gameMode === 'human-vs-ai' ? (
                  <div className="ai-player-display">
                    <span className="ai-badge">🤖 AI Opponent</span>
                  </div>
                ) : (
                  <input
                    id="player2"
                    type="text"
                    value={config.player2Name}
                    onChange={e => setConfig(prev => ({ ...prev, player2Name: e.target.value }))}
                    placeholder="Enter name..."
                  />
                )}
              </div>
            </div>
          </div>

          {/* AI Difficulty (only shown for AI mode) */}
          {config.gameMode === 'human-vs-ai' && (
            <div className="form-section">
              <h3>AI Difficulty</h3>
              <div className="difficulty-selector">
                <input
                  type="range"
                  min="1"
                  max="6"
                  value={config.aiDifficulty}
                  onChange={e =>
                    setConfig(prev => ({
                      ...prev,
                      aiDifficulty: parseInt(e.target.value) as AIDifficulty,
                    }))
                  }
                  className="difficulty-slider"
                />
                <div className="difficulty-display">
                  <span className="difficulty-level">Level {config.aiDifficulty}</span>
                  <span className="difficulty-label">{difficultyLabels[config.aiDifficulty]}</span>
                </div>
                <div className="difficulty-markers">
                  {[1, 2, 3, 4, 5, 6].map(level => (
                    <span
                      key={level}
                      className={`difficulty-marker ${level <= config.aiDifficulty ? 'active' : ''}`}
                    />
                  ))}
                </div>
              </div>

              <div className="difficulty-info">
                <p>
                  💡 <strong>Tip:</strong>{' '}
                  {config.aiDifficulty <= 2
                    ? 'Good for learning the basics and casual play'
                    : config.aiDifficulty <= 4
                      ? 'Strategic play with chain awareness and planning'
                      : 'Advanced AI with deep analysis and near-perfect play'}
                </p>
              </div>
            </div>
          )}

          {/* Game Rules Summary */}
          <div className="form-section">
            <h3>How to Play</h3>
            <div className="rules-summary">
              <div className="rule-item">
                <span className="rule-icon">🖱️</span>
                <span>Click between dots to draw lines</span>
              </div>
              <div className="rule-item">
                <span className="rule-icon">📦</span>
                <span>Complete boxes by drawing all 4 sides</span>
              </div>
              <div className="rule-item">
                <span className="rule-icon">🔄</span>
                <span>Get another turn when you complete a box</span>
              </div>
              <div className="rule-item">
                <span className="rule-icon">🏆</span>
                <span>Player with the most boxes wins!</span>
              </div>
            </div>
          </div>

          {/* Start Game Button */}
          <div className="form-actions">
            <button className="btn btn-secondary" onClick={() => navigate('/games')}>
              ← Back to Games
            </button>

            <button
              className="btn btn-primary btn-large"
              onClick={handleStartGame}
              disabled={
                !config.player1Name.trim() ||
                (config.gameMode === 'human-vs-human' && !config.player2Name.trim())
              }
            >
              Start Game 🎮
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DotsAndBoxesSetup;