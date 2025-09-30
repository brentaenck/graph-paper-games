import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { GameState, Player, AIDifficulty, Move } from '@gpg/shared';
import { TicTacToeEngine, TicTacToeAI } from '@gpg/tic-tac-toe';
import type { TicTacToeMetadata, TicTacToeSymbol } from '@gpg/tic-tac-toe';

interface GameConfig {
  gameMode: 'human-vs-human' | 'human-vs-ai';
  player1Name: string;
  player2Name: string;
  aiDifficulty: AIDifficulty;
}

interface GameStats {
  movesPlayed: number;
  gameStartTime: number;
  winner?: string;
  isDraw: boolean;
}

const TicTacToeGame: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Get game config from navigation state
  const gameConfig = location.state?.gameConfig as GameConfig;

  // Redirect to setup if no config
  useEffect(() => {
    if (!gameConfig) {
      navigate('/games/tic-tac-toe');
    }
  }, [gameConfig, navigate]);

  // Game state
  const [engine] = useState(() => new TicTacToeEngine());
  const [ai] = useState(() => new TicTacToeAI());
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [gameStats, setGameStats] = useState<GameStats>({
    movesPlayed: 0,
    gameStartTime: Date.now(),
    isDraw: false,
  });
  const [isThinking, setIsThinking] = useState(false);
  const [lastAIThinkTime, setLastAIThinkTime] = useState(0);

  // Initialize game
  useEffect(() => {
    if (!gameConfig) return;

    const players: Player[] = [
      {
        id: 'player1',
        name: gameConfig.player1Name,
        isAI: false,
        score: 0,
        isActive: true,
      },
      {
        id: 'player2',
        name: gameConfig.player2Name,
        isAI: gameConfig.gameMode === 'human-vs-ai',
        difficulty: gameConfig.gameMode === 'human-vs-ai' ? gameConfig.aiDifficulty : undefined,
        score: 0,
        isActive: true,
      },
    ];

    const initialResult = engine.createInitialState(
      {
        gameType: 'tic-tac-toe',
        playerCount: 2,
        enableAI: gameConfig.gameMode === 'human-vs-ai',
        difficulty: gameConfig.aiDifficulty,
      },
      players
    );

    if (initialResult.success) {
      setGameState(initialResult.data);
      setGameStats({
        movesPlayed: 0,
        gameStartTime: Date.now(),
        isDraw: false,
      });
    }
  }, [gameConfig, engine]);

  // Handle cell click
  const handleCellClick = useCallback(
    async (row: number, col: number) => {
      if (!gameState || isThinking) return;

      const currentPlayer = gameState.players[gameState.currentPlayer];
      if (currentPlayer.isAI) return; // Don't allow clicks during AI turn

      const metadata = gameState.metadata as unknown as TicTacToeMetadata;

      // Check if cell is already occupied
      if (metadata.boardState[row][col] !== null) return;

      const symbol: TicTacToeSymbol = gameState.currentPlayer === 0 ? 'X' : 'O';

      // Create move
      const move: Move = {
        id: `move-${Date.now()}`,
        type: 'place',
        playerId: currentPlayer.id,
        timestamp: new Date(),
        data: {
          position: { x: col, y: row },
          symbol,
        },
      };

      // Apply move
      const moveResult = engine.applyMove(gameState, move);
      if (!moveResult.success) {
        console.error('Move failed:', moveResult.error);
        return;
      }

      const newGameState = moveResult.data;
      setGameState(newGameState);
      setGameStats(prev => ({ ...prev, movesPlayed: prev.movesPlayed + 1 }));

      // Check for game end
      const terminal = engine.isTerminal(newGameState);
      if (terminal) {
        setGameStats(prev => ({
          ...prev,
          winner: terminal.winner || undefined,
          isDraw: terminal.reason === 'draw',
        }));
        return;
      }

      // If next player is AI, trigger AI move
      const nextPlayer = newGameState.players[newGameState.currentPlayer];
      if (nextPlayer.isAI) {
        handleAIMove(newGameState);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [gameState, isThinking, engine]
  );

  // Handle AI move
  const handleAIMove = useCallback(
    async (currentState: GameState) => {
      if (!gameConfig || gameConfig.gameMode !== 'human-vs-ai') return;

      setIsThinking(true);
      const startTime = Date.now();

      try {
        const aiPlayer = currentState.players[currentState.currentPlayer];
        const aiMoveResult = await ai.getMove(currentState, gameConfig.aiDifficulty, aiPlayer.id);

        const thinkTime = Date.now() - startTime;
        setLastAIThinkTime(thinkTime);

        if (!aiMoveResult.success) {
          console.error('AI move failed:', aiMoveResult.error);
          setIsThinking(false);
          return;
        }

        // Small delay to show "thinking" state
        const minDelay = 500;
        const remainingDelay = Math.max(0, minDelay - thinkTime);

        setTimeout(() => {
          const moveResult = engine.applyMove(currentState, aiMoveResult.data);
          if (moveResult.success) {
            setGameState(moveResult.data);
            setGameStats(prev => ({ ...prev, movesPlayed: prev.movesPlayed + 1 }));

            // Check for game end
            const terminal = engine.isTerminal(moveResult.data);
            if (terminal) {
              setGameStats(prev => ({
                ...prev,
                winner: terminal.winner || undefined,
                isDraw: terminal.reason === 'draw',
              }));
            }
          }
          setIsThinking(false);
        }, remainingDelay);
      } catch (error) {
        console.error('AI move error:', error);
        setIsThinking(false);
      }
    },
    [ai, engine, gameConfig]
  );

  // Start new game
  const handleNewGame = () => {
    navigate('/games/tic-tac-toe', { replace: true });
  };

  // Get hint (for human players)
  const handleGetHint = useCallback(async () => {
    if (!gameState || isThinking) return;

    const currentPlayer = gameState.players[gameState.currentPlayer];
    if (currentPlayer.isAI) return;

    try {
      const hint = await ai.getHint(gameState, currentPlayer.id);
      if (hint) {
        // Visual hint could be implemented here
        console.log('Hint:', hint);
        alert(`💡 ${hint.explanation}\nConfidence: ${(hint.confidence * 100).toFixed(0)}%`);
      }
    } catch (error) {
      console.error('Hint error:', error);
    }
  }, [gameState, isThinking, ai]);

  if (!gameConfig || !gameState) {
    return <div>Loading...</div>;
  }

  const metadata = gameState.metadata as unknown as TicTacToeMetadata;
  const currentPlayer = gameState.players[gameState.currentPlayer];
  const terminal = engine.isTerminal(gameState);
  const isGameOver = terminal !== null;

  return (
    <div className="tic-tac-toe-game">
      <div className="container">
        {/* Game Header */}
        <div className="game-header">
          <div className="game-title">
            <h1>Tic-Tac-Toe</h1>
            <div className="game-mode-badge">
              {gameConfig.gameMode === 'human-vs-ai'
                ? `🤖 vs AI Level ${gameConfig.aiDifficulty}`
                : '👥 Human vs Human'}
            </div>
          </div>

          <div className="game-controls">
            <button className="btn btn-secondary" onClick={() => navigate('/games')}>
              ← Games Menu
            </button>
            <button className="btn btn-primary" onClick={handleNewGame}>
              New Game
            </button>
          </div>
        </div>

        {/* Game Status */}
        <div className="game-status">
          {isGameOver ? (
            <div className="game-over">
              {gameStats.winner ? (
                <div className="winner-announcement">
                  🎉{' '}
                  <strong>
                    {gameStats.winner === 'player1'
                      ? gameConfig.player1Name
                      : gameConfig.player2Name}
                  </strong>{' '}
                  wins!
                </div>
              ) : (
                <div className="draw-announcement">🤝 It's a draw!</div>
              )}
            </div>
          ) : (
            <div className="current-turn">
              {isThinking ? (
                <div className="ai-thinking">🤖 AI is thinking...</div>
              ) : (
                <div className="player-turn">
                  <span
                    className={`player-symbol symbol-${gameState.currentPlayer === 0 ? 'x' : 'o'}`}
                  >
                    {gameState.currentPlayer === 0 ? 'X' : 'O'}
                  </span>
                  <strong>{currentPlayer.name}'s</strong> turn
                </div>
              )}
            </div>
          )}
        </div>

        {/* Game Board */}
        <div className="game-board-container">
          <div className="tic-tac-toe-board">
            {metadata.boardState.map((row: (TicTacToeSymbol | null)[], rowIndex: number) =>
              row.map((cell: TicTacToeSymbol | null, colIndex: number) => (
                <button
                  key={`${rowIndex}-${colIndex}`}
                  className={`board-cell ${cell ? 'occupied' : 'empty'} ${
                    isThinking || isGameOver || currentPlayer.isAI ? 'disabled' : ''
                  }`}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                  disabled={isThinking || isGameOver || currentPlayer.isAI}
                  aria-label={`Cell ${rowIndex + 1}, ${colIndex + 1}${cell ? ` - ${cell}` : ' - empty'}`}
                >
                  {cell && <span className={`symbol symbol-${cell.toLowerCase()}`}>{cell}</span>}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Game Info & Actions */}
        <div className="game-info">
          <div className="game-stats">
            <div className="stat">
              <span className="stat-label">Moves:</span>
              <span className="stat-value">{gameStats.movesPlayed}</span>
            </div>
            <div className="stat">
              <span className="stat-label">Time:</span>
              <span className="stat-value">
                {Math.floor((Date.now() - gameStats.gameStartTime) / 1000)}s
              </span>
            </div>
            {gameConfig.gameMode === 'human-vs-ai' && lastAIThinkTime > 0 && (
              <div className="stat">
                <span className="stat-label">AI Think Time:</span>
                <span className="stat-value">{lastAIThinkTime}ms</span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          {!isGameOver && (
            <div className="game-actions">
              {!currentPlayer.isAI && !isThinking && (
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={handleGetHint}
                  title="Get a hint for your next move"
                >
                  💡 Hint
                </button>
              )}
            </div>
          )}

          {isGameOver && (
            <div className="game-end-actions">
              <button className="btn btn-primary btn-large" onClick={handleNewGame}>
                Play Again 🎮
              </button>
            </div>
          )}
        </div>

        {/* Player Info */}
        <div className="player-info">
          <div className={`player-card ${gameState.currentPlayer === 0 ? 'active' : ''}`}>
            <div className="player-symbol symbol-x">X</div>
            <div className="player-details">
              <strong>{gameConfig.player1Name}</strong>
              <span>Player 1</span>
            </div>
          </div>

          <div className="vs-divider">VS</div>

          <div className={`player-card ${gameState.currentPlayer === 1 ? 'active' : ''}`}>
            <div className="player-symbol symbol-o">O</div>
            <div className="player-details">
              <strong>{gameConfig.player2Name}</strong>
              <span>
                {gameConfig.gameMode === 'human-vs-ai'
                  ? `AI Level ${gameConfig.aiDifficulty}`
                  : 'Player 2'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicTacToeGame;
