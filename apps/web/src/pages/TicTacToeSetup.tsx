import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AIDifficulty } from '@gpg/shared';

interface GameConfig {
  gameMode: 'human-vs-human' | 'human-vs-ai';
  player1Name: string;
  player2Name: string;
  aiDifficulty: AIDifficulty;
}

const TicTacToeSetup: React.FC = () => {
  const navigate = useNavigate();
  const [config, setConfig] = useState<GameConfig>({
    gameMode: 'human-vs-ai',
    player1Name: 'Player 1',
    player2Name: 'AI',
    aiDifficulty: 3,
  });

  const handleGameModeChange = (mode: GameConfig['gameMode']) => {
    setConfig(prev => ({
      ...prev,
      gameMode: mode,
      player2Name: mode === 'human-vs-ai' ? 'AI' : 'Player 2',
    }));
  };

  const handleStartGame = () => {
    // Navigate to the actual game with configuration
    navigate('/games/tic-tac-toe/play', {
      state: { gameConfig: config },
    });
  };

  const difficultyLabels: Record<AIDifficulty, string> = {
    1: 'Beginner (Random)',
    2: 'Easy (Defensive)',
    3: 'Medium (Basic Strategy)',
    4: 'Hard (Smart)',
    5: 'Expert (Very Smart)',
    6: 'Master (Unbeatable)',
  };

  return (
    <div className="tic-tac-toe-setup">
      <div className="container">
        <div className="setup-header">
          <h1>Tic-Tac-Toe Setup</h1>
          <p>Configure your game settings and start playing!</p>
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

          {/* Player Names */}
          <div className="form-section">
            <h3>Players</h3>
            <div className="player-inputs">
              <div className="player-input">
                <label htmlFor="player1">Player 1 (X):</label>
                <input
                  id="player1"
                  type="text"
                  value={config.player1Name}
                  onChange={e => setConfig(prev => ({ ...prev, player1Name: e.target.value }))}
                  placeholder="Enter name..."
                />
              </div>

              <div className="player-input">
                <label htmlFor="player2">Player 2 (O):</label>
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
                    ? 'Good for beginners and casual play'
                    : config.aiDifficulty <= 4
                      ? 'Challenging but fair for most players'
                      : 'Prepare for a serious challenge!'}
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
              Start Game 🎮
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicTacToeSetup;
