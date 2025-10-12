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

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { GameState, Player, AIDifficulty, GridCoordinate } from '@gpg/shared';
import { TicTacToeEngine, TicTacToeAI } from '@gpg/tic-tac-toe';
import type { TicTacToeMetadata, TicTacToeSymbol, TicTacToeMove } from '@gpg/tic-tac-toe';
import { createMove } from '@gpg/tic-tac-toe';
import { DualSystemProvider, TruePaperLayout, PlayerDisplay, useDualSystem } from '@gpg/framework';

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
  gamesPlayed: number;
  playerWins: number;
  aiWins: number;
  draws: number;
  lastGameDuration?: number;
}

// Enhanced GameSymbol Component (matching research example)
interface EnhancedGameSymbolProps {
  symbol: TicTacToeSymbol;
  penStyle: 'ballpoint' | 'pencil' | 'marker' | 'fountain';
  isNew?: boolean;
  size?: number;
}

const EnhancedGameSymbol: React.FC<EnhancedGameSymbolProps> = ({
  symbol,
  penStyle,
  isNew = false,
  size = 40,
}) => {
  const [animationState, setAnimationState] = useState<'idle' | 'drawing' | 'complete'>('idle');

  useEffect(() => {
    if (isNew && animationState === 'idle') {
      setAnimationState('drawing');
      const duration = penStyle === 'marker' ? 800 : penStyle === 'fountain' ? 600 : 500;
      setTimeout(() => setAnimationState('complete'), duration);
    }
  }, [isNew, penStyle, animationState]);

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

  const getAnimationProps = () => {
    if (!isNew || animationState === 'complete') return {};

    const pathLength = symbol === 'X' ? 50 : 88;
    const duration = penStyle === 'marker' ? 800 : 500;
    return {
      strokeDasharray: pathLength,
      strokeDashoffset: animationState === 'drawing' ? 0 : pathLength,
      style: {
        transition:
          animationState === 'drawing' ? `stroke-dashoffset ${duration}ms ease-out` : 'none',
      } as React.CSSProperties,
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
              transitionDelay: isNew && animationState === 'drawing' ? '200ms' : '0ms',
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

// Module-level Set to persist animated games across component unmounts
const animatedGames = new Set<string>();

// Cleanup old game animations to prevent memory leaks
const cleanupOldAnimations = () => {
  if (animatedGames.size > 100) {
    // Keep only the most recent 50 games
    const gameIds = Array.from(animatedGames);
    animatedGames.clear();
    gameIds.slice(-50).forEach(id => animatedGames.add(id));
  }
};

// Enhanced Game Board Component (matching research example)
const TicTacToeGameBoard: React.FC<{
  gameState: GameState;
  isThinking: boolean;
  isGameOver: boolean;
  onCellClick: (position: GridCoordinate) => void;
  penStyle: 'ballpoint' | 'pencil' | 'marker' | 'fountain';
  newMoves: Set<string>;
}> = ({ gameState, isThinking, isGameOver, onCellClick, penStyle, newMoves }) => {
  const metadata = gameState.metadata as unknown as TicTacToeMetadata;
  // Initialize gridAnimated based on whether this game has already been animated
  const [gridAnimated, setGridAnimated] = useState(() => {
    return gameState.id ? animatedGames.has(gameState.id) : false;
  });

  // Control grid animation - use module-level Set to persist across component unmounts
  useEffect(() => {
    const hasAnimated = animatedGames.has(gameState.id);
    console.log(
      'Grid animation useEffect - gameState.id:',
      gameState.id,
      'hasAnimated:',
      hasAnimated
    );

    if (gameState.id && !hasAnimated) {
      // New game detected - mark as animated and start animation
      console.log('NEW GAME - Starting grid animation for:', gameState.id);
      animatedGames.add(gameState.id);
      cleanupOldAnimations(); // Prevent memory leaks

      // Reset to false then animate to true
      console.log('Grid animation reset to false');
      setGridAnimated(false);

      // Use a microtask to ensure the false state is rendered first
      Promise.resolve().then(() => {
        console.log('Setting grid animation to true');
        setGridAnimated(true);
      });
    } else {
      console.log('GAME ALREADY ANIMATED - Grid should already be visible for:', gameState.id);
    }
  }, [gameState.id]);

  // Debug grid animation state
  useEffect(() => {
    console.log('Grid animation state changed to:', gridAnimated, 'for game:', gameState.id);
  }, [gridAnimated, gameState.id]);

  // Debug logging (matching research example)
  console.log('GameBoard - gameState:', gameState);
  console.log('GameBoard - metadata:', metadata);
  console.log('GameBoard - boardState:', metadata?.boardState);
  console.log('GameBoard - newMoves:', newMoves);

  // Get pen style properties (Framework pen system - matching research example)
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

  // Custom WinningLine Component (matching research example)
  const CustomWinningLine: React.FC<{ winningLine: any; penStyle: string }> = ({
    winningLine,
    penStyle: penType,
  }) => {
    if (!winningLine) return null;

    const getWinningLinePenStyle = () => {
      switch (penType) {
        case 'pencil':
          return {
            stroke: '#f59e0b',
            strokeWidth: '4',
            opacity: '0.9',
            filter: 'url(#pencilTexture)',
          };
        case 'marker':
          return {
            stroke: '#f59e0b',
            strokeWidth: '5',
            opacity: '0.95',
            filter: 'url(#markerTexture)',
          };
        case 'fountain':
          return {
            stroke: '#f59e0b',
            strokeWidth: '3',
            opacity: '0.95',
            filter: 'url(#fountainTexture)',
          };
        default: // ballpoint
          return { stroke: '#f59e0b', strokeWidth: '3', opacity: '1', filter: 'url(#roughPaper)' };
      }
    };

    // Convert grid positions to SVG coordinates
    const getLineCoordinates = () => {
      const { start, end } = winningLine;
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
        y2: endY - wobbleY,
      };
    };

    const coords = getLineCoordinates();
    const pathLength = Math.sqrt(
      Math.pow(coords.x2 - coords.x1, 2) + Math.pow(coords.y2 - coords.y1, 2)
    );

    return (
      <line
        x1={coords.x1}
        y1={coords.y1}
        x2={coords.x2}
        y2={coords.y2}
        {...getWinningLinePenStyle()}
        strokeLinecap="round"
        strokeDasharray={pathLength}
        strokeDashoffset={pathLength}
        style={{
          animation: `drawWinningLine 0.8s ease-out 0.3s forwards`,
        }}
      />
    );
  };

  return (
    <div className="framework-paper-sheet">
      {/* Framework PaperSheet Component - matching research example */}
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
        {/* Framework HandDrawnGrid Component - matching research example */}
        <div
          style={{
            position: 'absolute',
            left: '140px',
            top: '140px',
            width: '180px',
            height: '180px',
          }}
        >
          {/* SVG Filters for Framework Pen Styles - matching research example */}
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

          {/* Framework HandDrawnGrid - Animated grid lines - matching research example */}
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
              {/* Hand-drawn grid lines - stable animation */}
              <path
                d="M 61 3 Q 59.5 45 60.8 87 Q 61.2 130 59.5 177"
                {...getPenStyle()}
                fill="none"
                strokeLinecap="round"
                style={{
                  strokeDasharray: '174',
                  strokeDashoffset: gridAnimated ? '0' : '174',
                  transition: gridAnimated ? 'stroke-dashoffset 1s ease-out 0.1s' : 'none',
                }}
              />
              <path
                d="M 119 4 Q 120.8 40 119.2 85 Q 120.5 125 121 176"
                {...getPenStyle()}
                fill="none"
                strokeLinecap="round"
                style={{
                  strokeDasharray: '172',
                  strokeDashoffset: gridAnimated ? '0' : '172',
                  transition: gridAnimated ? 'stroke-dashoffset 1s ease-out 0.3s' : 'none',
                }}
              />
              <path
                d="M 3 59.5 Q 45 61 87 59.8 Q 130 60.5 177 61.2"
                {...getPenStyle()}
                fill="none"
                strokeLinecap="round"
                style={{
                  strokeDasharray: '174',
                  strokeDashoffset: gridAnimated ? '0' : '174',
                  transition: gridAnimated ? 'stroke-dashoffset 1s ease-out 0.5s' : 'none',
                }}
              />
              <path
                d="M 4 120.5 Q 42 119 88 120.8 Q 132 119.5 176 120"
                {...getPenStyle()}
                fill="none"
                strokeLinecap="round"
                style={{
                  strokeDasharray: '172',
                  strokeDashoffset: gridAnimated ? '0' : '172',
                  transition: gridAnimated ? 'stroke-dashoffset 1s ease-out 0.7s' : 'none',
                }}
              />

              {/* Framework WinningLine - Animated winning line */}
              {metadata.winningLine && (
                <CustomWinningLine winningLine={metadata.winningLine} penStyle={penStyle} />
              )}
            </g>
          </svg>

          {/* Game cells with absolute positioning - matching research example */}
          <div
            className="grid grid-cols-3"
            style={{
              width: '100%',
              height: '100%',
              gap: '0px',
            }}
          >
            {metadata?.boardState ? (
              metadata.boardState.flat().map((cell, index) => {
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
                    disabled={!!cell || isThinking || isGameOver}
                    className="hover:bg-white hover:bg-opacity-10 transition-colors disabled:cursor-not-allowed"
                    style={{
                      width: '60px',
                      height: '60px',
                      border: 'none',
                      background: 'transparent',
                      borderRadius: '4px',
                    }}
                  >
                    {/* Symbols are now positioned absolutely */}
                  </button>
                );
              })
            ) : (
              <div>Loading board state...</div>
            )}
          </div>

          {/* Symbols positioned absolutely to match grid lines */}
          {metadata?.boardState
            ? metadata.boardState.map((row, rowIndex) =>
                row.map((cell, colIndex) => {
                  if (!cell) return null;

                  const cellKey = `${colIndex}-${rowIndex}`;
                  const isNewMove = newMoves.has(cellKey);

                  return (
                    <div
                      key={`symbol-${rowIndex}-${colIndex}`}
                      style={{
                        position: 'absolute',
                        left: `${colIndex * 60 + 10}px`, // 60px per cell + 10px offset (centered in 60px cell)
                        top: `${rowIndex * 60 + 10}px`,
                        width: '40px',
                        height: '40px',
                        pointerEvents: 'none', // Don't interfere with button clicks
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <EnhancedGameSymbol
                        symbol={cell as TicTacToeSymbol}
                        penStyle={penStyle}
                        isNew={isNewMove}
                        size={40}
                      />
                    </div>
                  );
                })
              )
            : null}
        </div>
      </div>
    </div>
  );
};

// Improved Game Controls Component (Modern UI with better hierarchy)
const TicTacToeGameControls: React.FC<{
  gameConfig: GameConfig;
  gameStats: GameStats;
  isThinking: boolean;
  lastAIThinkTime: number;
  onNewGame: () => void;
  onBackToGames: () => void;
  onGetHint: () => void;
  canGetHint: boolean;
}> = ({
  gameConfig,
  gameStats,
  isThinking,
  lastAIThinkTime,
  onNewGame,
  onBackToGames,
  onGetHint,
  canGetHint,
}) => {
  const { penStyle, setPenStyle } = useDualSystem();

  return (
    <div className="space-y-5">
      {/* PRIMARY HEADER - Game Title + Main Actions */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Tic-Tac-Toe</h1>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>
              {gameConfig.gameMode === 'human-vs-ai'
                ? `Playing against AI Level ${gameConfig.aiDifficulty}`
                : 'Human vs Human Mode'}
            </span>

            {/* Game Info on same line */}
            <span className="text-gray-400">•</span>
            <span>Move {gameStats.movesPlayed}</span>
            <span className="text-gray-400">•</span>
            <span>{Math.floor((Date.now() - gameStats.gameStartTime) / 1000)}s</span>
            {isThinking && (
              <>
                <span className="text-gray-400">•</span>
                <span className="text-blue-600">🤖 AI thinking...</span>
              </>
            )}
          </div>
        </div>

        {/* Main Action Buttons with better spacing */}
        <div className="flex gap-3">
          <button
            className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 
                       hover:bg-gray-100 rounded-md transition-colors border border-gray-300"
            onClick={onBackToGames}
          >
            ← Back
          </button>
          <button
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 
                       hover:bg-blue-700 rounded-md transition-colors"
            onClick={onNewGame}
          >
            New Game
          </button>
        </div>
      </div>

      {/* SECONDARY CONTROLS - Game Tools + Stats */}
      <div
        className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 
                      pt-4 border-t border-gray-200"
      >
        {/* Game Tools */}
        <div className="flex items-center gap-6">
          {/* Pen Style Selector with proper spacing */}
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">Drawing Style:</label>
            <select
              value={penStyle}
              onChange={e => setPenStyle(e.target.value as any)}
              className="text-sm bg-white border border-gray-300 rounded-md px-3 py-1.5 
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="ballpoint">🖊️ Ballpoint</option>
              <option value="pencil">✏️ Pencil</option>
              <option value="marker">🖍️ Marker</option>
              <option value="fountain">🖋️ Fountain</option>
            </select>
          </div>

          {/* Hint Button with better spacing */}
          {canGetHint && (
            <button
              className="px-4 py-1.5 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 
                         border border-gray-300 rounded-md transition-colors disabled:opacity-50"
              onClick={onGetHint}
              disabled={isThinking}
              title="Get a hint for your next move"
            >
              💡 Hint
            </button>
          )}
        </div>

        {/* Compact Session Stats */}
        {gameStats.gamesPlayed > 0 && (
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="font-medium">Session:</span>
            <span>{gameStats.gamesPlayed} games</span>
            <span className="text-green-600 font-medium">{gameStats.playerWins}W</span>
            <span className="text-red-600 font-medium">{gameStats.aiWins}L</span>
            {gameStats.draws > 0 && (
              <span className="text-gray-600 font-medium">{gameStats.draws}D</span>
            )}
          </div>
        )}
      </div>

      {/* OPTIONAL: AI Performance Indicator */}
      {gameConfig.gameMode === 'human-vs-ai' && lastAIThinkTime > 0 && (
        <div className="flex justify-end pt-2">
          <div className="text-xs text-gray-400">AI response: {lastAIThinkTime}ms</div>
        </div>
      )}
    </div>
  );
};

// Main Game Component
const TicTacToeGameDualSystem: React.FC = () => {
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

  // Enhanced game state with animation tracking (matching research example)
  const engine = useMemo(() => new TicTacToeEngine(), []);
  const ai = useMemo(() => new TicTacToeAI(), []);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [, setGameHistory] = useState<GameState[]>([]);
  const [gameStats, setGameStats] = useState<GameStats>({
    movesPlayed: 0,
    gameStartTime: Date.now(),
    isDraw: false,
    gamesPlayed: 0,
    playerWins: 0,
    aiWins: 0,
    draws: 0,
  });
  const [isThinking, setIsThinking] = useState(false);
  const [lastAIThinkTime, setLastAIThinkTime] = useState(0);
  const [newMoves, setNewMoves] = useState<Set<string>>(new Set()); // Track new moves for animations

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
        color: '#ef4444', // Red for X
      },
      {
        id: 'player2',
        name: gameConfig.player2Name,
        isAI: gameConfig.gameMode === 'human-vs-ai',
        difficulty: gameConfig.gameMode === 'human-vs-ai' ? gameConfig.aiDifficulty : undefined,
        score: 0,
        isActive: true,
        color: '#3b82f6', // Blue for O
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
      setGameHistory([initialResult.data]);
      setNewMoves(new Set()); // Clear all animations on new game
      setGameStats(prev => ({
        ...prev,
        movesPlayed: 0,
        gameStartTime: Date.now(),
        isDraw: false,
      }));
    }
  }, [gameConfig, engine]);

  // Handle cell click (matching research example)
  const handleCellClick = useCallback(
    async (position: GridCoordinate) => {
      if (!gameState || isThinking) return;

      const currentPlayer = gameState.players[gameState.currentPlayer];
      if (currentPlayer.isAI) return; // Don't allow clicks during AI turn

      const metadata = gameState.metadata as unknown as TicTacToeMetadata;

      // Check if cell is already occupied
      if (metadata.boardState[position.y][position.x] !== null) return;

      const symbol: TicTacToeSymbol = gameState.currentPlayer === 0 ? 'X' : 'O';
      const { x, y } = position;

      // Create move using the enhanced move creator (matching research example)
      const move: TicTacToeMove = createMove(position, symbol, currentPlayer.id);

      // Validate move first
      const validation = engine.validateMove(gameState, move, currentPlayer.id);
      if (!validation.isValid) {
        console.warn('Invalid move:', validation.error);
        return;
      }

      // Apply move
      const moveResult = engine.applyMove(gameState, move);
      if (!moveResult.success) {
        console.error('Move failed:', 'error' in moveResult ? moveResult.error : 'Unknown error');
        return;
      }

      const newGameState = moveResult.data;
      console.log('Move applied - newGameState:', newGameState);
      console.log('Move applied - metadata:', newGameState.metadata);

      setGameState(newGameState);
      setGameHistory(prev => [...prev, newGameState]);
      setGameStats(prev => ({ ...prev, movesPlayed: prev.movesPlayed + 1 }));

      // Mark this move as new for animation (matching research example)
      const cellKey = `${x}-${y}`;
      console.log('Setting new move animation for:', cellKey);
      setNewMoves(new Set([cellKey]));

      // Clear new move animation after animation completes (matching research example)
      setTimeout(() => {
        setNewMoves(prev => {
          const newSet = new Set(prev);
          newSet.delete(cellKey);
          return newSet;
        });
      }, 1000);

      // Check for game end
      const terminal = engine.isTerminal(newGameState);
      if (terminal) {
        const gameDuration = Date.now() - gameStats.gameStartTime;
        setGameStats(prev => ({
          ...prev,
          winner: terminal.winner || undefined,
          isDraw: terminal.reason === 'draw',
          gamesPlayed: prev.gamesPlayed + 1,
          playerWins: terminal.winner === 'player1' ? prev.playerWins + 1 : prev.playerWins,
          aiWins: terminal.winner === 'player2' ? prev.aiWins + 1 : prev.aiWins,
          draws: terminal.reason === 'draw' ? prev.draws + 1 : prev.draws,
          lastGameDuration: gameDuration,
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
          console.error(
            'AI move failed:',
            'error' in aiMoveResult ? aiMoveResult.error : 'Unknown error'
          );
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
            setGameHistory(prev => [...prev, moveResult.data]);
            setGameStats(prev => ({ ...prev, movesPlayed: prev.movesPlayed + 1 }));

            // Mark AI move as new for animation (matching research example)
            const aiMove = aiMoveResult.data as TicTacToeMove;
            const aiPosition = aiMove.data.position;
            const aiCellKey = `${aiPosition.x}-${aiPosition.y}`;
            console.log('Setting AI move animation for:', aiCellKey);
            setNewMoves(new Set([aiCellKey]));

            // Clear AI move animation
            setTimeout(() => {
              setNewMoves(prev => {
                const newSet = new Set(prev);
                newSet.delete(aiCellKey);
                return newSet;
              });
            }, 1000);

            // Check for game end with enhanced statistics
            const terminal = engine.isTerminal(moveResult.data);
            if (terminal) {
              const gameDuration = Date.now() - gameStats.gameStartTime;
              setGameStats(prev => ({
                ...prev,
                winner: terminal.winner || undefined,
                isDraw: terminal.reason === 'draw',
                gamesPlayed: prev.gamesPlayed + 1,
                playerWins: terminal.winner === 'player1' ? prev.playerWins + 1 : prev.playerWins,
                aiWins: terminal.winner === 'player2' ? prev.aiWins + 1 : prev.aiWins,
                draws: terminal.reason === 'draw' ? prev.draws + 1 : prev.draws,
                lastGameDuration: gameDuration,
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

  // Start new game with same configuration
  const handleNewGame = () => {
    if (!gameConfig) return;

    // Create players array matching the initialization logic
    const players: Player[] = [
      {
        id: 'player1',
        name: gameConfig.player1Name,
        isAI: false,
        score: 0,
        isActive: true,
        color: '#ef4444', // Red for X
      },
      {
        id: 'player2',
        name: gameConfig.player2Name,
        isAI: gameConfig.gameMode === 'human-vs-ai',
        difficulty: gameConfig.gameMode === 'human-vs-ai' ? gameConfig.aiDifficulty : undefined,
        score: 0,
        isActive: true,
        color: '#3b82f6', // Blue for O
      },
    ];

    // Reset game state using the correct engine method
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
      setGameHistory([initialResult.data]);
      setNewMoves(new Set());
      setIsThinking(false);
      setLastAIThinkTime(0);

      // Reset current game stats but keep session stats
      setGameStats(prev => ({
        ...prev,
        winner: undefined,
        isDraw: false,
        movesPlayed: 0,
        gameStartTime: Date.now(),
        lastGameDuration: 0,
      }));
    }
  };

  // Get hint (for human players)
  const handleGetHint = useCallback(async () => {
    if (!gameState || isThinking) return;

    const currentPlayer = gameState.players[gameState.currentPlayer];
    if (currentPlayer.isAI) return;

    try {
      const hint = await ai.getHint(gameState, currentPlayer.id);
      if (hint) {
        console.log('Hint:', hint);
        alert(`💡 ${hint.explanation}\nConfidence: ${(hint.confidence * 100).toFixed(0)}%`);
      }
    } catch (error) {
      console.error('Hint error:', error);
    }
  }, [gameState, isThinking, ai]);

  if (!gameConfig || !gameState) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Loading game...</div>
        </div>
      </div>
    );
  }

  const currentPlayer = gameState.players[gameState.currentPlayer];
  const terminal = engine.isTerminal(gameState);
  const isGameOver = terminal !== null;
  const canGetHint = !currentPlayer.isAI && !isThinking && !isGameOver;

  // GameContent component that has access to DualSystem context
  const GameContent: React.FC = () => {
    const { penStyle } = useDualSystem();

    return (
      <>
        <TruePaperLayout
          header={
            <div className="bg-white border-b border-gray-200 p-6">
              <div className="max-w-4xl mx-auto">
                <TicTacToeGameControls
                  gameConfig={gameConfig}
                  gameStats={gameStats}
                  isThinking={isThinking}
                  lastAIThinkTime={lastAIThinkTime}
                  onNewGame={handleNewGame}
                  onBackToGames={() => navigate('/games')}
                  onGetHint={handleGetHint}
                  canGetHint={canGetHint}
                />
              </div>
            </div>
          }
          footer={
            <div className="bg-white border-t border-gray-200 p-6">
              <div className="max-w-4xl mx-auto">
                {/* Player Information */}
                <div className="flex items-center justify-center gap-6 mb-4">
                  <div className="px-4 py-2 rounded-lg bg-gray-50 border">
                    <PlayerDisplay
                      player={gameState.players[0]}
                      isActive={gameState.currentPlayer === 0 && !isGameOver}
                      variant="compact"
                      showScore={false}
                      showAvatar={false}
                      className="flex-shrink-0"
                      accessible={true}
                    />
                  </div>

                  <div className="text-gray-400 font-bold text-lg px-2">VS</div>

                  <div className="px-4 py-2 rounded-lg bg-gray-50 border">
                    <PlayerDisplay
                      player={gameState.players[1]}
                      isActive={gameState.currentPlayer === 1 && !isGameOver}
                      variant="compact"
                      showScore={false}
                      showAvatar={false}
                      className="flex-shrink-0"
                      accessible={true}
                    />
                  </div>
                </div>

                {/* Game End Actions */}
                {isGameOver && (
                  <div className="text-center">
                    <button
                      className="px-6 py-3 text-lg font-medium text-white bg-blue-600 border border-transparent 
                                 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onClick={handleNewGame}
                    >
                      Play Again 🎮
                    </button>
                  </div>
                )}
              </div>
            </div>
          }
          paper={
            <div className="flex-1 bg-gray-100 p-8 flex flex-col items-center justify-center min-h-96">
              {/* Game Status */}
              <div className="mb-8 text-center">
                {isGameOver ? (
                  <div className="text-2xl font-bold text-gray-900">
                    {gameStats.winner ? (
                      <div className="text-green-600">
                        🎉{' '}
                        {gameStats.winner === 'player1'
                          ? gameConfig.player1Name
                          : gameConfig.player2Name}{' '}
                        wins!
                      </div>
                    ) : (
                      <div className="text-gray-600">🤝 It's a draw!</div>
                    )}
                  </div>
                ) : (
                  <div className="text-xl font-semibold text-gray-700">
                    {isThinking ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                        🤖 AI is thinking...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <span
                          className={`inline-block w-8 h-8 rounded-lg text-lg font-bold ${
                            gameState.currentPlayer === 0
                              ? 'bg-red-100 text-red-700'
                              : 'bg-blue-100 text-blue-700'
                          } flex items-center justify-center`}
                        >
                          {gameState.currentPlayer === 0 ? '×' : 'O'}
                        </span>
                        <strong>{currentPlayer.name}'s</strong> turn
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* The Enhanced Paper Game Area - matching research example */}
              <TicTacToeGameBoard
                gameState={gameState}
                isThinking={isThinking}
                isGameOver={isGameOver}
                onCellClick={handleCellClick}
                penStyle={penStyle}
                newMoves={newMoves}
              />
            </div>
          }
        />
      </>
    );
  };

  return (
    <DualSystemProvider
      initialTheme={{
        handDrawn: {
          penStyle: 'pencil',
          enablePenSwitching: true,
          paperType: 'graph',
          paperRotation: 1.5,
          gridSize: 20,
          showGridAnimation: true,
          symbolAnimationDuration: 600,
          gridAnimationDelay: [0, 0.1, 0.2],
          showImperfections: true,
          roughnessIntensity: 0.8,
        },
        layout: { type: 'header-footer', responsive: true },
      }}
    >
      <GameContent />
    </DualSystemProvider>
  );
};

// Add CSS animations for the enhanced animations (matching research example)
const css = `
  @keyframes drawGridLine {
    from {
      stroke-dashoffset: 174;
    }
    to {
      stroke-dashoffset: 0;
    }
  }
  
  @keyframes drawGridLine2 {
    from {
      stroke-dashoffset: 172;
    }
    to {
      stroke-dashoffset: 0;
    }
  }
  
  @keyframes drawGridLine3 {
    from {
      stroke-dashoffset: 174;
    }
    to {
      stroke-dashoffset: 0;
    }
  }
  
  @keyframes drawGridLine4 {
    from {
      stroke-dashoffset: 172;
    }
    to {
      stroke-dashoffset: 0;
    }
  }
  
  @keyframes drawSymbol {
    from {
      stroke-dashoffset: var(--path-length, 50);
    }
    to {
      stroke-dashoffset: 0;
    }
  }
  
  @keyframes drawWinningLine {
    from {
      stroke-dashoffset: var(--path-length, 100);
    }
    to {
      stroke-dashoffset: 0;
    }
  }
  
  .animate-symbol-appear {
    animation: fadeIn 0.3s ease-out;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; transform: scale(0.8); }
    to { opacity: 1; transform: scale(1); }
  }
  
  .grid-line-hidden {
    opacity: 1;
  }
  
  .grid-line-animated {
    opacity: 1;
  }
`;

// Inject CSS if not already present
if (typeof document !== 'undefined' && !document.getElementById('tic-tac-toe-animations')) {
  const style = document.createElement('style');
  style.id = 'tic-tac-toe-animations';
  style.textContent = css;
  document.head.appendChild(style);
}

export default TicTacToeGameDualSystem;