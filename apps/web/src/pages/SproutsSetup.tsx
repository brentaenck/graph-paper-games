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

interface GameConfig {
  gameMode: 'human-vs-human' | 'human-vs-ai';
  player1Name: string;
  player2Name: string;
  aiDifficulty: AIDifficulty;
  initialPoints: 3 | 4 | 5;
}

const SproutsSetup: React.FC = () => {
  const navigate = useNavigate();
  const [config, setConfig] = useState<GameConfig>({
    gameMode: 'human-vs-ai',
    player1Name: 'Player 1',
    player2Name: 'AI',
    aiDifficulty: 3,
    initialPoints: 3,
  });

  const handleGameModeChange = (mode: GameConfig['gameMode']) => {
    setConfig(prev => ({
      ...prev,
      gameMode: mode,
      player2Name: mode === 'human-vs-ai' ? 'AI' : 'Player 2',
    }));
  };

  const handleStartGame = () => {
    // Navigate to the game with configuration
    navigate('/games/sprouts/play', {
      state: { gameConfig: config },
    });
  };

  const difficultyLabels: Record<AIDifficulty, string> = {
    1: 'Beginner (Random)',
    2: 'Easy (Basic Strategy)',
    3: 'Medium (Smart Moves)', 
    4: 'Hard (Strategic)',
    5: 'Expert (Advanced)',
    6: 'Master (Minimax AI)',
  };

  const pointsInfo = {
    3: { label: 'Quick Game', description: 'Fast-paced, typically 2-4 moves' },
    4: { label: 'Standard Game', description: 'Balanced gameplay, 3-6 moves' },
    5: { label: 'Extended Game', description: 'Longer strategic play, 4-8 moves' },
  };

  return (
    <div className="sprouts-setup">
      <div className="container">
        <div className="setup-header">
          <h1>Sprouts Setup</h1>
          <p>Configure your Sprouts game and prepare for topological challenges!</p>
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

          {/* Starting Points Configuration */}
          <div className="form-section">
            <h3>Starting Points</h3>
            <div className="points-options">
              {([3, 4, 5] as const).map(points => (
                <button
                  key={points}
                  className={`points-button ${config.initialPoints === points ? 'active' : ''}`}
                  onClick={() => setConfig(prev => ({ ...prev, initialPoints: points }))}
                >
                  <div className="points-number">{points}</div>
                  <div className="points-info">
                    <strong>{pointsInfo[points].label}</strong>
                    <span>{pointsInfo[points].description}</span>
                  </div>
                </button>
              ))}
            </div>
            <div className="game-rules-hint">
              <p>
                💡 <strong>How Sprouts Works:</strong> Draw curves between points without crossing existing lines. 
                A new point appears on each curve you draw. Points can have at most 3 connections. 
                The last player able to move wins!
              </p>
            </div>
          </div>

          {/* Player Names */}
          <div className="form-section">
            <h3>Players</h3>
            <div className="player-inputs">
              <div className="player-input">
                <label htmlFor="player1">Player 1:</label>
                <input
                  id="player1"
                  type="text"
                  value={config.player1Name}
                  onChange={e => setConfig(prev => ({ ...prev, player1Name: e.target.value }))}
                  placeholder="Enter name..."
                />
              </div>

              <div className="player-input">
                <label htmlFor="player2">Player 2:</label>
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
                    ? 'Good for learning the rules and basic strategy'
                    : config.aiDifficulty <= 4
                      ? 'Challenging but fair - tests your topological thinking'
                      : 'Prepare for serious strategic depth and minimax AI!'}
                </p>
              </div>
            </div>
          )}

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
              Start Sprouts Game 🌱
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SproutsSetup;