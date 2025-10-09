/**
 * @fileoverview TicTacToeFramework - Production-ready tic-tac-toe using the dual design system framework
 *
 * This component demonstrates the full integration of the existing TicTacToeEngine
 * with the new dual design system framework components. It shows how games will
 * work in production using the framework architecture.
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { TicTacToeEngine } from '../../../../games/tic-tac-toe/src/engine';
import { TicTacToeAI } from '../../../../games/tic-tac-toe/src/ai';
import { createMove } from '../../../../games/tic-tac-toe/src/utils';
import type { GameState, Player, GameSettings, Move, Result, GridCoordinate } from '@gpg/shared';
import type {
  TicTacToeMove,
  TicTacToeSymbol,
  TicTacToeMetadata,
} from '../../../../games/tic-tac-toe/src/types';

// Framework types (simulated - these would come from @gpg/framework in production)
type PenStyle = 'ballpoint' | 'pencil' | 'marker' | 'fountain';
type UITheme = 'light' | 'dark' | 'system';

// ============================================================================
// Framework Components Simulation
// ============================================================================
// In production, these would be imported from @gpg/framework

interface DualSystemProviderProps {
  children: React.ReactNode;
  initialTheme?: { handDrawn?: { penStyle?: PenStyle }; ui?: { theme?: UITheme } };
  enableAnimations?: boolean;
}

const DualSystemProvider: React.FC<DualSystemProviderProps> = ({
  children,
  initialTheme = {},
  enableAnimations = true,
}) => {
  const [penStyle, setPenStyle] = useState<PenStyle>(
    initialTheme?.handDrawn?.penStyle || 'ballpoint'
  );
  const [uiTheme, setUITheme] = useState<UITheme>(initialTheme?.ui?.theme || 'light');

  return (
    <div
      className={`dual-system-root ui-theme-${uiTheme} paper-pen-${penStyle}`}
      data-pen-style={penStyle}
      data-ui-theme={uiTheme}
      data-animations-enabled={enableAnimations}
      style={
        {
          '--current-pen-style': penStyle,
          '--current-ui-theme': uiTheme,
        } as React.CSSProperties
      }
    >
      {/* Framework Context Provider would go here */}
      <DualSystemContext.Provider value={{ penStyle, setPenStyle, uiTheme, setUITheme }}>
        {children}
      </DualSystemContext.Provider>
    </div>
  );
};

const DualSystemContext = React.createContext<{
  penStyle: PenStyle;
  setPenStyle: (style: PenStyle) => void;
  uiTheme: UITheme;
  setUITheme: (theme: UITheme) => void;
}>({
  penStyle: 'ballpoint',
  setPenStyle: () => {},
  uiTheme: 'light',
  setUITheme: () => {},
});

const useDualSystem = () => React.useContext(DualSystemContext);

// Framework PlayerDisplay Component (simplified)
interface PlayerDisplayProps {
  player: Player;
  isActive?: boolean;
  variant?: 'default' | 'compact';
  showScore?: boolean;
  symbol?: TicTacToeSymbol;
}

const PlayerDisplay: React.FC<PlayerDisplayProps> = ({
  player,
  isActive = false,
  variant = 'default',
  showScore = true,
  symbol,
}) => (
  <div
    className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
      isActive
        ? 'bg-blue-50 border-2 border-blue-200 ring-2 ring-blue-100'
        : 'bg-gray-50 border border-gray-200'
    }`}
  >
    <div
      className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-xl transition-all ${
        isActive
          ? symbol === 'X'
            ? 'bg-red-100 border-2 border-red-400 text-red-700'
            : 'bg-blue-100 border-2 border-blue-400 text-blue-700'
          : 'bg-gray-100 text-gray-500'
      }`}
    >
      {symbol || '?'}
    </div>
    <div className="flex-1">
      <p className="ui-text font-medium">{player.name}</p>
      {showScore && <p className="ui-text-sm ui-text-muted">Score: {player.score}</p>}
      <div className="flex gap-2 mt-1">
        {isActive && <span className="ui-badge ui-badge-primary ui-badge-sm">Active</span>}
        {player.isAI && (
          <span className="ui-badge ui-badge-secondary ui-badge-sm">
            AI Level {player.difficulty}
          </span>
        )}
      </div>
    </div>
  </div>
);

// Framework TruePaperLayout Component (simplified)
interface TruePaperLayoutProps {
  header?: React.ReactNode;
  footer?: React.ReactNode;
  paper: React.ReactNode;
  responsive?: boolean;
}

const TruePaperLayout: React.FC<TruePaperLayoutProps> = ({
  header,
  footer,
  paper,
  responsive = true,
}) => (
  <div
    className={`true-paper-layout ${responsive ? 'responsive' : ''}`}
    style={{
      display: 'grid',
      gridTemplate: `
      "header" auto
      "paper" 1fr  
      "footer" auto
      / 1fr
    `,
      minHeight: '100vh',
      gap: '1rem',
      padding: '1rem',
    }}
  >
    {header && (
      <header className="ui-layout-section" style={{ gridArea: 'header' }}>
        {header}
      </header>
    )}

    <main
      className="paper-layout-section"
      style={{
        gridArea: 'paper',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '500px',
        backgroundColor: 'var(--ui-background, #f9fafb)',
      }}
    >
      {paper}
    </main>

    {footer && (
      <footer className="ui-layout-section" style={{ gridArea: 'footer' }}>
        {footer}
      </footer>
    )}
  </div>
);

// ============================================================================
// Game Board Component (Using Framework Architecture)
// ============================================================================

interface GameBoardProps {
  gameState: GameState;
  onCellClick: (position: GridCoordinate) => void;
  disabled?: boolean;
  penStyle: PenStyle;
}

const GameBoard: React.FC<GameBoardProps> = ({
  gameState,
  onCellClick,
  disabled = false,
  penStyle,
}) => {
  const metadata = gameState.metadata as unknown as TicTacToeMetadata;

  // Get pen style properties (Framework pen system)
  const getPenStyle = () => {
    switch (penStyle) {
      case 'pencil':
        return {
          stroke: '#374151',
          strokeWidth: '2.5',
          opacity: '0.8',
          filter: 'url(#pencilTexture)',
        };
      case 'marker':
        return {
          stroke: '#1e40af',
          strokeWidth: '3.5',
          opacity: '0.85',
          filter: 'url(#markerTexture)',
        };
      case 'fountain':
        return {
          stroke: '#1e3a8a',
          strokeWidth: '2',
          opacity: '0.9',
          filter: 'url(#fountainTexture)',
        };
      default: // ballpoint
        return {
          stroke: 'var(--sketch-primary)',
          strokeWidth: '2',
          opacity: '1',
          filter: 'url(#roughPaper)',
        };
    }
  };

  // Framework PaperSheet + HandDrawnGrid + GameSymbol integration
  return (
    <div className="framework-paper-sheet">
      {/* Framework PaperSheet Component */}
      <div
        className="graph-paper shadow-lg"
        style={{
          width: '480px',
          height: '480px',
          transform: 'rotate(-0.3deg)',
          background: 'var(--paper-white, #fefcf8)',
          backgroundImage: `
            linear-gradient(var(--grid-light-blue, rgba(59, 130, 246, 0.3)) 1px, transparent 1px),
            linear-gradient(90deg, var(--grid-light-blue, rgba(59, 130, 246, 0.3)) 1px, transparent 1px)
          `,
          backgroundSize: '20px 20px',
          backgroundPosition: '0px 0px',
          position: 'relative',
        }}
      >
        {/* Framework HandDrawnGrid Component */}
        <div
          style={{
            position: 'absolute',
            left: '140px',
            top: '140px',
            width: '180px',
            height: '180px',
          }}
        >
          {/* SVG Filters for Framework Pen Styles */}
          <svg width="0" height="0" style={{ position: 'absolute' }}>
            <defs>
              <filter id="roughPaper" x="0%" y="0%" width="100%" height="100%">
                <feTurbulence baseFrequency="0.04" numOctaves="5" result="noise" seed="1" />
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.8" />
              </filter>
              <filter id="pencilTexture" x="0%" y="0%" width="100%" height="100%">
                <feTurbulence baseFrequency="0.3" numOctaves="4" result="grain" seed="2" />
                <feDisplacementMap in="SourceGraphic" in2="grain" scale="1.2" />
                <feGaussianBlur stdDeviation="0.3" />
              </filter>
              <filter id="markerTexture" x="0%" y="0%" width="100%" height="100%">
                <feGaussianBlur stdDeviation="0.2" result="blur" />
                <feTurbulence baseFrequency="0.08" numOctaves="3" result="texture" seed="3" />
                <feDisplacementMap in="blur" in2="texture" scale="0.3" />
              </filter>
              <filter id="fountainTexture" x="0%" y="0%" width="100%" height="100%">
                <feTurbulence baseFrequency="0.15" numOctaves="3" result="flow" seed="4" />
                <feDisplacementMap in="SourceGraphic" in2="flow" scale="0.6" />
              </filter>
            </defs>
          </svg>

          {/* Framework HandDrawnGrid - Animated grid lines */}
          <svg
            width="180"
            height="180"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              pointerEvents: 'none',
            }}
          >
            <g>
              {/* Hand-drawn grid lines with framework pen style */}
              <path
                d="M 61 3 Q 59.5 45 60.8 87 Q 61.2 130 59.5 177"
                {...getPenStyle()}
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M 119 4 Q 120.8 40 119.2 85 Q 120.5 125 121 176"
                {...getPenStyle()}
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M 3 59.5 Q 45 61 87 59.8 Q 130 60.5 177 61.2"
                {...getPenStyle()}
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M 4 120.5 Q 42 119 88 120.8 Q 132 119.5 176 120"
                {...getPenStyle()}
                fill="none"
                strokeLinecap="round"
              />
            </g>
          </svg>

          {/* Game cells using framework GameSymbol components */}
          <div
            className="grid grid-cols-3"
            style={{
              width: '100%',
              height: '100%',
              gap: '0px',
            }}
          >
            {metadata.boardState.flat().map((cell, index) => {
              const x = index % 3;
              const y = Math.floor(index / 3);
              const position: GridCoordinate = { x, y };

              return (
                <button
                  key={index}
                  onClick={() => onCellClick(position)}
                  disabled={!!cell || disabled}
                  className="flex items-center justify-center hover:bg-white hover:bg-opacity-10 transition-colors disabled:cursor-not-allowed"
                  style={{
                    width: '60px',
                    height: '60px',
                    border: 'none',
                    background: 'transparent',
                    borderRadius: '4px',
                  }}
                >
                  {/* Framework GameSymbol - X */}
                  {cell === 'X' && (
                    <svg width="40" height="40" viewBox="0 0 40 40">
                      <path
                        d="M 8 8 L 32 32"
                        {...getPenStyle()}
                        fill="none"
                        strokeLinecap="round"
                      />
                      <path
                        d="M 32 8 L 8 32"
                        {...getPenStyle()}
                        fill="none"
                        strokeLinecap="round"
                      />
                    </svg>
                  )}
                  {/* Framework GameSymbol - O */}
                  {cell === 'O' && (
                    <svg width="40" height="40" viewBox="0 0 40 40">
                      <circle
                        cx="20"
                        cy="20"
                        r="14"
                        {...getPenStyle()}
                        fill="none"
                        strokeLinecap="round"
                      />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Main TicTacToe Framework Component
// ============================================================================

const TicTacToeFramework: React.FC = () => {
  // Game engine and AI instances
  const engine = useMemo(() => new TicTacToeEngine(), []);
  const ai = useMemo(() => new TicTacToeAI(), []);

  // Game state
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [gameHistory, setGameHistory] = useState<GameState[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [gameStats, setGameStats] = useState({
    gamesPlayed: 0,
    playerWins: 0,
    aiWins: 0,
    draws: 0,
  });

  // Framework state
  const [penStyle, setPenStyle] = useState<PenStyle>('ballpoint');
  const [players, setPlayers] = useState<Player[]>([
    {
      id: 'human',
      name: 'You',
      color: '#ef4444',
      isAI: false,
      score: 0,
      isActive: true,
    },
    {
      id: 'ai',
      name: 'AI Assistant',
      color: '#3b82f6',
      isAI: true,
      difficulty: 3,
      score: 0,
      isActive: false,
    },
  ]);

  // Initialize game
  const initializeGame = useCallback(() => {
    const gameSettings: GameSettings = {
      gameType: 'tic-tac-toe',
      playerCount: 2,
      enableAI: true,
      difficulty: 3,
    };

    const result = engine.createInitialState(gameSettings, players);
    if (result.success) {
      setGameState(result.data);
      setGameHistory([result.data]);
    } else {
      console.error('Failed to initialize game:', result.error);
    }
  }, [engine, players]);

  // Initialize on mount
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  // Handle cell click
  const handleCellClick = useCallback(
    async (position: GridCoordinate) => {
      if (!gameState || isThinking) return;

      const currentPlayer = gameState.players[gameState.currentPlayer];
      if (currentPlayer.isAI) return; // Don't allow clicking during AI turn

      try {
        // Get symbol for current player
        const symbol: TicTacToeSymbol = gameState.currentPlayer === 0 ? 'X' : 'O';

        // Create move (position, symbol, playerId)
        const move: TicTacToeMove = createMove(position, symbol, currentPlayer.id);

        // Validate move
        const validation = engine.validateMove(gameState, move, currentPlayer.id);
        if (!validation.isValid) {
          console.warn('Invalid move:', validation.error);
          return;
        }

        // Apply move
        const result = engine.applyMove(gameState, move);
        if (!result.success) {
          console.error('Failed to apply move:', result.error);
          return;
        }

        const newGameState = result.data;
        setGameState(newGameState);
        setGameHistory(prev => [...prev, newGameState]);

        // Check if game is over
        const gameOverResult = engine.isTerminal(newGameState);
        if (gameOverResult) {
          setGameStats(prev => ({
            ...prev,
            gamesPlayed: prev.gamesPlayed + 1,
            playerWins: gameOverResult.winner === 'human' ? prev.playerWins + 1 : prev.playerWins,
            aiWins: gameOverResult.winner === 'ai' ? prev.aiWins + 1 : prev.aiWins,
            draws: gameOverResult.reason === 'draw' ? prev.draws + 1 : prev.draws,
          }));
          return;
        }

        // AI turn
        if (newGameState.players[newGameState.currentPlayer].isAI) {
          setIsThinking(true);

          // Add realistic thinking delay
          setTimeout(
            async () => {
              try {
                const aiMoveResult = await ai.getMove(newGameState, 3, 'ai');
                if (aiMoveResult.success) {
                  // The AI.getMove already returns a complete move object
                  const aiMove = aiMoveResult.data;

                  const aiResult = engine.applyMove(newGameState, aiMove);
                  if (aiResult.success) {
                    setGameState(aiResult.data);
                    setGameHistory(prev => [...prev, aiResult.data]);

                    // Check if AI won
                    const aiGameOverResult = engine.isTerminal(aiResult.data);
                    if (aiGameOverResult) {
                      setGameStats(prev => ({
                        ...prev,
                        gamesPlayed: prev.gamesPlayed + 1,
                        playerWins:
                          aiGameOverResult.winner === 'human'
                            ? prev.playerWins + 1
                            : prev.playerWins,
                        aiWins: aiGameOverResult.winner === 'ai' ? prev.aiWins + 1 : prev.aiWins,
                        draws: aiGameOverResult.reason === 'draw' ? prev.draws + 1 : prev.draws,
                      }));
                    }
                  }
                }
              } catch (error) {
                console.error('AI move failed:', error);
              } finally {
                setIsThinking(false);
              }
            },
            500 + Math.random() * 1000
          ); // 0.5-1.5s thinking time
        }
      } catch (error) {
        console.error('Move handling failed:', error);
      }
    },
    [gameState, engine, ai, isThinking]
  );

  // Get current game status
  const getGameStatus = () => {
    if (!gameState) return { status: 'loading', message: 'Initializing game...' };

    const gameOverResult = engine.isTerminal(gameState);
    if (gameOverResult) {
      if (gameOverResult.reason === 'draw') {
        return { status: 'draw', message: "It's a draw!" };
      } else if (gameOverResult.winner === 'human') {
        return { status: 'win', message: 'You won! 🎉' };
      } else {
        return { status: 'lose', message: 'AI wins this round!' };
      }
    }

    const currentPlayer = gameState.players[gameState.currentPlayer];
    if (isThinking) {
      return { status: 'thinking', message: 'AI is thinking...' };
    } else if (currentPlayer.isAI) {
      return { status: 'ai-turn', message: "AI's turn" };
    } else {
      return { status: 'your-turn', message: 'Your turn' };
    }
  };

  const gameStatus = getGameStatus();
  const isGameOver = gameState ? !!engine.isTerminal(gameState) : false;

  // Update player active states
  const updatedPlayers = players.map((player, index) => ({
    ...player,
    isActive: gameState?.currentPlayer === index && !isGameOver,
    score: index === 0 ? gameStats.playerWins : gameStats.aiWins,
  }));

  if (!gameState) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="ui-text">Loading framework integration...</div>
      </div>
    );
  }

  return (
    <DualSystemProvider
      initialTheme={{
        handDrawn: { penStyle },
        ui: { theme: 'light' },
      }}
      enableAnimations={true}
    >
      <div className="space-y-6">
        {/* Framework Integration Header */}
        <div className="ui-card">
          <div className="ui-card-header">
            <h1 className="ui-card-title text-2xl">🎯 Framework Integration: Tic-Tac-Toe</h1>
          </div>
          <div className="ui-card-body">
            <div className="ui-alert ui-alert-success">
              <strong>Production Integration:</strong> This demonstrates the full integration of the
              existing TicTacToeEngine with the dual design system framework. Real game logic +
              framework components!
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="ui-text-sm">
                <strong>Games Played:</strong> {gameStats.gamesPlayed}
              </div>
              <div className="ui-text-sm">
                <strong>Your Wins:</strong> {gameStats.playerWins}
              </div>
              <div className="ui-text-sm">
                <strong>AI Wins:</strong> {gameStats.aiWins} | <strong>Draws:</strong>{' '}
                {gameStats.draws}
              </div>
            </div>
          </div>
        </div>

        {/* Framework Game using TruePaperLayout */}
        <TruePaperLayout
          responsive={true}
          // Modern UI Header - Framework PlayerDisplay components
          header={
            <div className="flex justify-between items-center">
              <div className="flex gap-6">
                <PlayerDisplay
                  player={updatedPlayers[0]}
                  isActive={updatedPlayers[0].isActive}
                  symbol="X"
                />
                <PlayerDisplay
                  player={updatedPlayers[1]}
                  isActive={updatedPlayers[1].isActive}
                  symbol="O"
                />
              </div>

              <div className="text-right">
                <div
                  className={`ui-badge ui-badge-lg ${
                    gameStatus.status === 'win'
                      ? 'ui-badge-success'
                      : gameStatus.status === 'lose'
                        ? 'ui-badge-danger'
                        : gameStatus.status === 'draw'
                          ? 'ui-badge-warning'
                          : 'ui-badge-primary'
                  }`}
                >
                  {gameStatus.message}
                </div>
                {isThinking && (
                  <div className="mt-2">
                    <div className="ui-loading inline-block mr-2"></div>
                    <span className="ui-text-sm ui-text-muted">
                      Difficulty: Level {players[1].difficulty}
                    </span>
                  </div>
                )}
              </div>
            </div>
          }
          // Pure Paper Game Area - Framework components only
          paper={
            <GameBoard
              gameState={gameState}
              onCellClick={handleCellClick}
              disabled={isGameOver || isThinking}
              penStyle={penStyle}
            />
          }
          // Modern UI Footer - Framework controls
          footer={
            <div className="flex justify-between items-center">
              <div className="flex gap-3">
                <button
                  onClick={initializeGame}
                  className="ui-button ui-button-primary"
                  disabled={isThinking}
                >
                  🔄 New Game
                </button>

                <div className="flex items-center gap-2">
                  <label className="ui-text-sm font-medium">Framework Pen Style:</label>
                  <select
                    value={penStyle}
                    onChange={e => setPenStyle(e.target.value as PenStyle)}
                    className="ui-input ui-text-sm"
                    style={{ width: 'auto', minWidth: '140px' }}
                    disabled={isThinking}
                  >
                    <option value="ballpoint">🖊️ Ballpoint</option>
                    <option value="pencil">✏️ Pencil</option>
                    <option value="marker">🖍️ Marker</option>
                    <option value="fountain">🖋️ Fountain Pen</option>
                  </select>
                </div>
              </div>

              <div className="ui-text-sm ui-text-muted">
                Turn #{gameState.turnNumber} • Move History: {gameState.moves.length}
              </div>
            </div>
          }
        />
      </div>
    </DualSystemProvider>
  );
};

export default TicTacToeFramework;
