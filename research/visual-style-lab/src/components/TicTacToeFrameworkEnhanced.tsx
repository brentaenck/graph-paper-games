/**
 * @fileoverview TicTacToeFrameworkEnhanced - Production framework with full animation system
 * 
 * This enhanced version demonstrates the complete dual design system with:
 * - Animated symbol drawing (X and O symbols draw in real-time)
 * - Progressive grid line animations
 * - Winning line animations
 * - Smooth pen style transitions
 * - Enhanced visual feedback
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { TicTacToeEngine } from '../../../../games/tic-tac-toe/src/engine';
import { TicTacToeAI } from '../../../../games/tic-tac-toe/src/ai';
import { createMove } from '../../../../games/tic-tac-toe/src/utils';
import type { 
  GameState, 
  Player, 
  GameSettings, 
  Move,
  Result,
  GridCoordinate 
} from '@gpg/shared';
import type { 
  TicTacToeMove, 
  TicTacToeSymbol, 
  TicTacToeMetadata 
} from '../../../../games/tic-tac-toe/src/types';

// Framework types
type PenStyle = 'ballpoint' | 'pencil' | 'marker' | 'fountain';
type UITheme = 'light' | 'dark' | 'system';

// ============================================================================
// Enhanced Framework Animation System
// ============================================================================

// Framework GameSymbol Animation Hook
const useGameSymbolAnimation = (isVisible: boolean, penStyle: PenStyle) => {
  const [animationState, setAnimationState] = useState<'idle' | 'drawing' | 'complete'>('idle');
  
  useEffect(() => {
    if (isVisible && animationState === 'idle') {
      setAnimationState('drawing');
      const duration = penStyle === 'marker' ? 800 : penStyle === 'fountain' ? 600 : 500;
      setTimeout(() => setAnimationState('complete'), duration);
    }
  }, [isVisible, penStyle, animationState]);
  
  return animationState;
};

// Framework GameSymbol Component with Full Animations
interface GameSymbolProps {
  symbol: TicTacToeSymbol;
  penStyle: PenStyle;
  isNew?: boolean;
  size?: number;
}

const GameSymbol: React.FC<GameSymbolProps> = ({ 
  symbol, 
  penStyle, 
  isNew = false, 
  size = 40 
}) => {
  const animationState = useGameSymbolAnimation(isNew, penStyle);
  
  const getPenStyle = () => {
    switch (penStyle) {
      case 'pencil':
        return { stroke: '#374151', strokeWidth: '2.5', opacity: '0.8', filter: 'url(#pencilTexture)' };
      case 'marker':
        return { stroke: '#1e40af', strokeWidth: '3.5', opacity: '0.85', filter: 'url(#markerTexture)' };
      case 'fountain':
        return { stroke: '#1e3a8a', strokeWidth: '2', opacity: '0.9', filter: 'url(#fountainTexture)' };
      default: // ballpoint
        return { stroke: 'var(--sketch-primary)', strokeWidth: '2', opacity: '1', filter: 'url(#roughPaper)' };
    }
  };
  
  const getAnimationProps = () => {
    if (!isNew || animationState === 'complete') return {};
    
    const pathLength = symbol === 'X' ? 50 : 88; // Approximate path lengths
    return {
      strokeDasharray: pathLength,
      strokeDashoffset: animationState === 'drawing' ? 0 : pathLength,
      style: {
        animation: animationState === 'drawing' ? `drawSymbol ${penStyle === 'marker' ? 800 : 500}ms ease-out forwards` : undefined,
        '--path-length': pathLength
      } as React.CSSProperties
    };
  };
  
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox={`0 0 ${size} ${size}`}
      className={isNew && animationState !== 'complete' ? 'animate-symbol-appear' : ''}
    >
      {symbol === 'X' && (
        <g>
          <path 
            d={`M ${size * 0.2} ${size * 0.2} L ${size * 0.8} ${size * 0.8}`} 
            {...getPenStyle()} 
            {...getAnimationProps()}
            fill="none" 
            strokeLinecap="round" 
          />
          <path 
            d={`M ${size * 0.8} ${size * 0.2} L ${size * 0.2} ${size * 0.8}`} 
            {...getPenStyle()} 
            {...getAnimationProps()}
            fill="none" 
            strokeLinecap="round" 
            style={{
              ...getAnimationProps().style,
              animationDelay: '200ms'
            }}
          />
        </g>
      )}
      {symbol === 'O' && (
        <circle 
          cx={size / 2} 
          cy={size / 2} 
          r={size * 0.35} 
          {...getPenStyle()} 
          {...getAnimationProps()}
          fill="none" 
          strokeLinecap="round" 
        />
      )}
    </svg>
  );
};

// ============================================================================
// Framework Context and Layout Components
// ============================================================================

interface DualSystemProviderProps {
  children: React.ReactNode;
  initialTheme?: { handDrawn?: { penStyle?: PenStyle }; ui?: { theme?: UITheme } };
  enableAnimations?: boolean;
}

const DualSystemProvider: React.FC<DualSystemProviderProps> = ({ 
  children, 
  initialTheme = {}, 
  enableAnimations = true 
}) => {
  const [penStyle, setPenStyle] = useState<PenStyle>(initialTheme?.handDrawn?.penStyle || 'ballpoint');
  const [uiTheme, setUITheme] = useState<UITheme>(initialTheme?.ui?.theme || 'light');

  return (
    <div 
      className={`dual-system-root ui-theme-${uiTheme} paper-pen-${penStyle}`}
      data-pen-style={penStyle}
      data-ui-theme={uiTheme}
      data-animations-enabled={enableAnimations}
      style={{ 
        '--current-pen-style': penStyle,
        '--current-ui-theme': uiTheme 
      } as React.CSSProperties}
    >
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
  setUITheme: () => {}
});

const useDualSystem = () => React.useContext(DualSystemContext);

// Framework PlayerDisplay Component
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
  symbol 
}) => (
  <div className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
    isActive ? 'bg-blue-50 border-2 border-blue-200 ring-2 ring-blue-100' : 'bg-gray-50 border border-gray-200'
  }`}>
    <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-xl transition-all ${
      isActive 
        ? symbol === 'X' 
          ? 'bg-red-100 border-2 border-red-400 text-red-700' 
          : 'bg-blue-100 border-2 border-blue-400 text-blue-700'
        : 'bg-gray-100 text-gray-500'
    }`}>
      {symbol || '?'}
    </div>
    <div className="flex-1">
      <p className="ui-text font-medium">{player.name}</p>
      {showScore && <p className="ui-text-sm ui-text-muted">Score: {player.score}</p>}
      <div className="flex gap-2 mt-1">
        {isActive && <span className="ui-badge ui-badge-primary ui-badge-sm">Active</span>}
        {player.isAI && <span className="ui-badge ui-badge-secondary ui-badge-sm">AI Level {player.difficulty}</span>}
      </div>
    </div>
  </div>
);

// Framework TruePaperLayout Component
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
  responsive = true 
}) => (
  <div className={`true-paper-layout ${responsive ? 'responsive' : ''}`} style={{
    display: 'grid',
    gridTemplate: `
      "header" auto
      "paper" 1fr  
      "footer" auto
      / 1fr
    `,
    minHeight: '100vh',
    gap: '1rem',
    padding: '1rem'
  }}>
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
        backgroundColor: 'var(--ui-background, #f9fafb)'
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
// Enhanced Game Board with Animations
// ============================================================================

interface GameBoardProps {
  gameState: GameState;
  onCellClick: (position: GridCoordinate) => void;
  disabled?: boolean;
  penStyle: PenStyle;
  newMoves: Set<string>;
}

// Framework WinningLine Component
interface WinningLineProps {
  winningLine: any; // WinningLine from game types
  penStyle: PenStyle;
}

const WinningLine: React.FC<WinningLineProps> = ({ winningLine, penStyle }) => {
  if (!winningLine) return null;
  
  const getPenStyle = () => {
    switch (penStyle) {
      case 'pencil':
        return { stroke: '#f59e0b', strokeWidth: '4', opacity: '0.9', filter: 'url(#pencilTexture)' };
      case 'marker':
        return { stroke: '#f59e0b', strokeWidth: '5', opacity: '0.95', filter: 'url(#markerTexture)' };
      case 'fountain':
        return { stroke: '#f59e0b', strokeWidth: '3', opacity: '0.95', filter: 'url(#fountainTexture)' };
      default: // ballpoint
        return { stroke: '#f59e0b', strokeWidth: '3', opacity: '1', filter: 'url(#roughPaper)' };
    }
  };
  
  // Convert grid positions to SVG coordinates
  const getLineCoordinates = () => {
    const { start, end, type } = winningLine;
    const cellSize = 60;
    const offset = 30; // Half cell size for center
    
    const startX = start.x * cellSize + offset;
    const startY = start.y * cellSize + offset;
    const endX = end.x * cellSize + offset;
    const endY = end.y * cellSize + offset;
    
    // Add slight hand-drawn wobble
    const wobbleX = (Math.random() - 0.5) * 4;
    const wobbleY = (Math.random() - 0.5) * 4;
    
    return {
      x1: startX + wobbleX,
      y1: startY + wobbleY,
      x2: endX - wobbleX,
      y2: endY - wobbleY
    };
  };
  
  const coords = getLineCoordinates();
  const pathLength = Math.sqrt(Math.pow(coords.x2 - coords.x1, 2) + Math.pow(coords.y2 - coords.y1, 2));
  
  return (
    <line
      x1={coords.x1}
      y1={coords.y1}
      x2={coords.x2}
      y2={coords.y2}
      {...getPenStyle()}
      strokeLinecap="round"
      strokeDasharray={pathLength}
      strokeDashoffset={pathLength}
      style={{
        animation: `drawWinningLine 0.8s ease-out 0.3s forwards`
      }}
    />
  );
};

const GameBoard: React.FC<GameBoardProps> = ({ 
  gameState, 
  onCellClick, 
  disabled = false,
  penStyle,
  newMoves 
}) => {
  const metadata = gameState.metadata as unknown as TicTacToeMetadata;
  
  // Debug logging
  console.log('GameBoard - gameState:', gameState);
  console.log('GameBoard - metadata:', metadata);
  console.log('GameBoard - boardState:', metadata?.boardState);
  console.log('GameBoard - newMoves:', newMoves);
  
  // Get pen style properties (Framework pen system)
  const getPenStyle = () => {
    switch (penStyle) {
      case 'pencil':
        return { stroke: '#374151', strokeWidth: '2.5', opacity: '0.8', filter: 'url(#pencilTexture)' };
      case 'marker':
        return { stroke: '#1e40af', strokeWidth: '3.5', opacity: '0.85', filter: 'url(#markerTexture)' };
      case 'fountain':
        return { stroke: '#1e3a8a', strokeWidth: '2', opacity: '0.9', filter: 'url(#fountainTexture)' };
      default: // ballpoint
        return { stroke: 'var(--sketch-primary)', strokeWidth: '2', opacity: '1', filter: 'url(#roughPaper)' };
    }
  };

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
          position: 'relative'
        }}
      >
        {/* Framework HandDrawnGrid Component */}
        <div 
          style={{
            position: 'absolute',
            left: '140px',
            top: '140px',
            width: '180px',
            height: '180px'
          }}
        >
          {/* SVG Filters for Framework Pen Styles */}
          <svg width="0" height="0" style={{ position: 'absolute' }}>
            <defs>
              <filter id="roughPaper" x="0%" y="0%" width="100%" height="100%">
                <feTurbulence baseFrequency="0.04" numOctaves="5" result="noise" seed="1"/>
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.8"/>
              </filter>
              <filter id="pencilTexture" x="0%" y="0%" width="100%" height="100%">
                <feTurbulence baseFrequency="0.3" numOctaves="4" result="grain" seed="2"/>
                <feDisplacementMap in="SourceGraphic" in2="grain" scale="1.2"/>
                <feGaussianBlur stdDeviation="0.3"/>
              </filter>
              <filter id="markerTexture" x="0%" y="0%" width="100%" height="100%">
                <feGaussianBlur stdDeviation="0.2" result="blur"/>
                <feTurbulence baseFrequency="0.08" numOctaves="3" result="texture" seed="3"/>
                <feDisplacementMap in="blur" in2="texture" scale="0.3"/>
              </filter>
              <filter id="fountainTexture" x="0%" y="0%" width="100%" height="100%">
                <feTurbulence baseFrequency="0.15" numOctaves="3" result="flow" seed="4"/>
                <feDisplacementMap in="SourceGraphic" in2="flow" scale="0.6"/>
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
              pointerEvents: 'none'
            }}
          >
            <g>
              {/* Hand-drawn grid lines with progressive animation */}
              <path 
                d="M 61 3 Q 59.5 45 60.8 87 Q 61.2 130 59.5 177" 
                {...getPenStyle()} 
                fill="none" 
                strokeLinecap="round"
                className="grid-line-animate"
                style={{
                  animation: 'drawGridLine 1s ease-out forwards',
                  animationDelay: '0.1s'
                }}
              />
              <path 
                d="M 119 4 Q 120.8 40 119.2 85 Q 120.5 125 121 176" 
                {...getPenStyle()} 
                fill="none" 
                strokeLinecap="round"
                className="grid-line-animate"
                style={{
                  animation: 'drawGridLine 1s ease-out forwards',
                  animationDelay: '0.3s'
                }}
              />
              <path 
                d="M 3 59.5 Q 45 61 87 59.8 Q 130 60.5 177 61.2" 
                {...getPenStyle()} 
                fill="none" 
                strokeLinecap="round"
                className="grid-line-animate"
                style={{
                  animation: 'drawGridLine 1s ease-out forwards',
                  animationDelay: '0.5s'
                }}
              />
              <path 
                d="M 4 120.5 Q 42 119 88 120.8 Q 132 119.5 176 120" 
                {...getPenStyle()} 
                fill="none" 
                strokeLinecap="round"
                className="grid-line-animate"
                style={{
                  animation: 'drawGridLine 1s ease-out forwards',
                  animationDelay: '0.7s'
                }}
              />
              
              {/* Framework WinningLine - Animated winning line */}
              {metadata.winningLine && (
                <WinningLine
                  winningLine={metadata.winningLine}
                  penStyle={penStyle}
                />
              )}
            </g>
          </svg>
          
          {/* Game cells using enhanced GameSymbol components */}
          <div 
            className="grid grid-cols-3"
            style={{
              width: '100%',
              height: '100%',
              gap: '0px'
            }}
          >
            {metadata?.boardState ? metadata.boardState.flat().map((cell, index) => {
              const x = index % 3;
              const y = Math.floor(index / 3);
              const position: GridCoordinate = { x, y };
              const cellKey = `${x}-${y}`;
              const isNewMove = newMoves.has(cellKey);
              
              console.log(`Cell ${index} (${x},${y}):`, cell, 'isNew:', isNewMove);
              
              return (
                <button
                  key={index}
                  onClick={() => {
                    console.log('Cell clicked:', position);
                    onCellClick(position);
                  }}
                  disabled={!!cell || disabled}
                  className="flex items-center justify-center hover:bg-white hover:bg-opacity-10 transition-colors disabled:cursor-not-allowed"
                  style={{
                    width: '60px',
                    height: '60px',
                    border: 'none',
                    background: 'transparent',
                    borderRadius: '4px'
                  }}
                >
                  {/* Enhanced GameSymbol Components with Animation */}
                  {cell && (
                    <GameSymbol 
                      symbol={cell as TicTacToeSymbol}
                      penStyle={penStyle}
                      isNew={isNewMove}
                      size={40}
                    />
                  )}
                </button>
              );
            }) : <div>Loading board state...</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Main Enhanced TicTacToe Framework Component
// ============================================================================

const TicTacToeFrameworkEnhanced: React.FC = () => {
  // Game engine and AI instances
  const engine = useMemo(() => new TicTacToeEngine(), []);
  const ai = useMemo(() => new TicTacToeAI(), []);
  
  // Enhanced game state with animation tracking
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [gameHistory, setGameHistory] = useState<GameState[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [newMoves, setNewMoves] = useState<Set<string>>(new Set()); // Track new moves for animations
  const [gameStats, setGameStats] = useState({
    gamesPlayed: 0,
    playerWins: 0,
    aiWins: 0,
    draws: 0
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
      isActive: true
    },
    {
      id: 'ai',
      name: 'AI Assistant',
      color: '#3b82f6',
      isAI: true,
      difficulty: 3,
      score: 0,
      isActive: false
    }
  ]);

  // Initialize game with enhanced state management
  const initializeGame = useCallback(() => {
    const gameSettings: GameSettings = {
      gameType: 'tic-tac-toe',
      playerCount: 2,
      enableAI: true,
      difficulty: 3
    };

    const result = engine.createInitialState(gameSettings, players);
    if (result.success) {
      setGameState(result.data);
      setGameHistory([result.data]);
      setNewMoves(new Set()); // Clear all animations on new game
    } else {
      console.error('Failed to initialize game:', result.error);
    }
  }, [engine, players]);

  // Initialize on mount
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  // Enhanced cell click with animation handling
  const handleCellClick = useCallback(async (position: GridCoordinate) => {
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
      console.log('Move applied - newGameState:', newGameState);
      console.log('Move applied - metadata:', newGameState.metadata);
      
      setGameState(newGameState);
      setGameHistory(prev => [...prev, newGameState]);
      
      // Mark this move as new for animation
      const cellKey = `${position.x}-${position.y}`;
      console.log('Setting new move animation for:', cellKey);
      setNewMoves(new Set([cellKey]));
      
      // Clear new move animation after animation completes
      setTimeout(() => {
        setNewMoves(prev => {
          const newSet = new Set(prev);
          newSet.delete(cellKey);
          return newSet;
        });
      }, 1000);

      // Check if game is over
      const gameOverResult = engine.isTerminal(newGameState);
      if (gameOverResult) {
        setGameStats(prev => ({
          ...prev,
          gamesPlayed: prev.gamesPlayed + 1,
          playerWins: gameOverResult.winner === 'human' ? prev.playerWins + 1 : prev.playerWins,
          aiWins: gameOverResult.winner === 'ai' ? prev.aiWins + 1 : prev.aiWins,
          draws: gameOverResult.reason === 'draw' ? prev.draws + 1 : prev.draws
        }));
        return;
      }

      // AI turn with enhanced animation
      if (newGameState.players[newGameState.currentPlayer].isAI) {
        setIsThinking(true);
        
        // Add realistic thinking delay
        setTimeout(async () => {
          try {
            const aiMoveResult = await ai.getMove(newGameState, 3, 'ai');
            if (aiMoveResult.success) {
              // The AI.getMove already returns a complete move object
              const aiMove = aiMoveResult.data;

              const aiResult = engine.applyMove(newGameState, aiMove);
              if (aiResult.success) {
                setGameState(aiResult.data);
                setGameHistory(prev => [...prev, aiResult.data]);
                
                // Mark AI move as new for animation
                const aiPosition = aiMove.data.position;
                const aiCellKey = `${aiPosition.x}-${aiPosition.y}`;
                setNewMoves(new Set([aiCellKey]));
                
                // Clear AI move animation
                setTimeout(() => {
                  setNewMoves(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(aiCellKey);
                    return newSet;
                  });
                }, 1000);

                // Check if AI won
                const aiGameOverResult = engine.isTerminal(aiResult.data);
                if (aiGameOverResult) {
                  setGameStats(prev => ({
                    ...prev,
                    gamesPlayed: prev.gamesPlayed + 1,
                    playerWins: aiGameOverResult.winner === 'human' ? prev.playerWins + 1 : prev.playerWins,
                    aiWins: aiGameOverResult.winner === 'ai' ? prev.aiWins + 1 : prev.aiWins,
                    draws: aiGameOverResult.reason === 'draw' ? prev.draws + 1 : prev.draws
                  }));
                }
              }
            }
          } catch (error) {
            console.error('AI move failed:', error);
          } finally {
            setIsThinking(false);
          }
        }, 500 + Math.random() * 1000); // 0.5-1.5s thinking time
      }
    } catch (error) {
      console.error('Move handling failed:', error);
    }
  }, [gameState, engine, ai, isThinking]);

  // Get current game status
  const getGameStatus = () => {
    if (!gameState) return { status: 'loading', message: 'Initializing enhanced framework...' };

    const gameOverResult = engine.isTerminal(gameState);
    if (gameOverResult) {
      if (gameOverResult.reason === 'draw') {
        return { status: 'draw', message: 'It\'s a draw!' };
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
      return { status: 'ai-turn', message: 'AI\'s turn' };
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
    score: index === 0 ? gameStats.playerWins : gameStats.aiWins
  }));

  if (!gameState) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="ui-text">Loading enhanced framework integration...</div>
      </div>
    );
  }

  return (
    <DualSystemProvider 
      initialTheme={{ 
        handDrawn: { penStyle },
        ui: { theme: 'light' }
      }}
      enableAnimations={true}
    >
      <div className="space-y-6">
        {/* Enhanced Framework Integration Header */}
        <div className="ui-card">
          <div className="ui-card-header">
            <h1 className="ui-card-title text-2xl">✨ Enhanced Framework: Full Animation System</h1>
          </div>
          <div className="ui-card-body">
            <div className="ui-alert ui-alert-success">
              <strong>Enhanced Production Integration:</strong> Complete dual design system with animated 
              symbol drawing, progressive grid animations, and smooth pen style transitions!
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
              <div className="ui-text-sm">
                <strong>Games:</strong> {gameStats.gamesPlayed}
              </div>
              <div className="ui-text-sm">
                <strong>Your Wins:</strong> {gameStats.playerWins}
              </div>
              <div className="ui-text-sm">
                <strong>AI Wins:</strong> {gameStats.aiWins}
              </div>
              <div className="ui-text-sm">
                <strong>Draws:</strong> {gameStats.draws}
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Framework Game using TruePaperLayout */}
        <TruePaperLayout
          responsive={true}
          
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
                <div className={`ui-badge ui-badge-lg ${
                  gameStatus.status === 'win' ? 'ui-badge-success' :
                  gameStatus.status === 'lose' ? 'ui-badge-danger' :
                  gameStatus.status === 'draw' ? 'ui-badge-warning' :
                  'ui-badge-primary'
                }`}>
                  {gameStatus.message}
                </div>
                {isThinking && (
                  <div className="mt-2">
                    <div className="ui-loading inline-block mr-2"></div>
                    <span className="ui-text-sm ui-text-muted">Analyzing with Level {players[1].difficulty} AI</span>
                  </div>
                )}
              </div>
            </div>
          }
          
          paper={
            <GameBoard
              gameState={gameState}
              onCellClick={handleCellClick}
              disabled={isGameOver || isThinking}
              penStyle={penStyle}
              newMoves={newMoves}
            />
          }
          
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
                  <label className="ui-text-sm font-medium">Enhanced Pen Style:</label>
                  <select 
                    value={penStyle}
                    onChange={(e) => setPenStyle(e.target.value as PenStyle)}
                    className="ui-input ui-text-sm"
                    style={{ width: 'auto', minWidth: '140px' }}
                    disabled={isThinking}
                  >
                    <option value="ballpoint">🖊️ Ballpoint (Fast)</option>
                    <option value="pencil">✏️ Pencil (Textured)</option>
                    <option value="marker">🖍️ Marker (Thick)</option>
                    <option value="fountain">🖋️ Fountain Pen (Elegant)</option>
                  </select>
                </div>
              </div>
              
              <div className="ui-text-sm ui-text-muted">
                Turn #{gameState.turnNumber} • Enhanced Animations: {newMoves.size > 0 ? 'Active' : 'Ready'}
              </div>
            </div>
          }
        />
      </div>
    </DualSystemProvider>
  );
};

export default TicTacToeFrameworkEnhanced;