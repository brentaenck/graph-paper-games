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

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { GameState, Player, AIDifficulty, GameSettings } from '@gpg/shared';
import { DotsAndBoxesEngine, DotsAndBoxesAI, createMove } from '@gpg/dots-and-boxes';
import type { DotsAndBoxesMetadata } from '@gpg/dots-and-boxes';
import { 
  DualSystemProvider, 
  TruePaperLayout, 
  PlayerDisplay, 
  useDualSystem,
  generateHandDrawnDots,
  generateHandDrawnLinePath
} from '@gpg/framework';

interface DotsAndBoxesConfig {
  gameMode: 'human-vs-human' | 'human-vs-ai';
  player1Name: string;
  player2Name: string;
  aiDifficulty: AIDifficulty;
  gridSize: { width: number; height: number };
}


// Enhanced GameLine Component for drawing lines
/*interface GameLineProps {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  isDrawn: boolean;
  isNew?: boolean;
  penStyle: 'ballpoint' | 'pencil' | 'marker' | 'fountain';
}*/

/*const GameLine: React.FC<GameLineProps> = ({
  startX, 
  startY, 
  endX, 
  endY, 
  isDrawn, 
  isNew = false, 
  penStyle 
}) => {
  const [animationState, setAnimationState] = useState<'idle' | 'drawing' | 'complete'>('idle');

  useEffect(() => {
    if (isNew && isDrawn && animationState === 'idle') {
      setAnimationState('drawing');
      const duration = penStyle === 'marker' ? 600 : penStyle === 'fountain' ? 500 : 400;
      setTimeout(() => setAnimationState('complete'), duration);
    }
  }, [isNew, isDrawn, penStyle, animationState]);

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
          strokeWidth: '2.5',
          opacity: '1',
          filter: 'url(#roughPaper)',
        };
    }
  };

  const getAnimationProps = () => {
    if (!isNew || !isDrawn || animationState === 'complete') return {};

    const pathLength = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
    const duration = penStyle === 'marker' ? 600 : 400;
    return {
      strokeDasharray: pathLength,
      strokeDashoffset: animationState === 'drawing' ? 0 : pathLength,
      style: {
        transition: animationState === 'drawing' ? `stroke-dashoffset ${duration}ms ease-out` : 'none',
      } as React.CSSProperties,
    };
  };

  if (!isDrawn) return null;

  return (
    <line
      x1={startX}
      y1={startY}
      x2={endX}
      y2={endY}
      {...getPenStyle()}
      {...getAnimationProps()}
      strokeLinecap="round"
    />
  );
};*/

// CompletedBox Component for showing owned boxes
/*interface CompletedBoxProps {
  x: number;
  y: number;
  width: number;
  height: number;
  owner: string;
  players: readonly Player[];
  isNew?: boolean;
}*/

/*const CompletedBox: React.FC<CompletedBoxProps> = ({ x, y, width, height, owner, players, isNew = false }) => {
  const player = players.find(p => p.id === owner);
  const color = player?.color || '#ef4444';
  
  return (
    <rect
      x={x + 3}
      y={y + 3}
      width={width - 6}
      height={height - 6}
      fill={color}
      opacity={isNew ? 0 : 0.15}
      rx={4}
      style={{
        animation: isNew ? 'boxComplete 0.5s ease-out forwards' : undefined,
      }}
    />
  );
};*/

// Module-level Set to persist animated games across component unmounts
// const animatedGames = new Set<string>();

// Cleanup old game animations to prevent memory leaks
/*const cleanupOldAnimations = () => {
  if (animatedGames.size > 100) {
    const gameIds = Array.from(animatedGames);
    animatedGames.clear();
    gameIds.slice(-50).forEach(id => animatedGames.add(id));
  }
};*/

// Enhanced Game Board Component with Graph Paper Grid
interface DotsAndBoxesGameBoardProps {
  gameState: GameState;
  onLineClick: (lineType: 'horizontal' | 'vertical', row: number, col: number) => void;
  newMoves: Set<string>;
  isThinking: boolean;
  penStyle: 'ballpoint' | 'pencil' | 'marker' | 'fountain';
}

/*
 * ENHANCED COORDINATE SYSTEM WITH GRAPH PAPER:
 * 
 * For a 3x3 dot grid with graph paper background:
 * - Graph paper provides authentic grid lines
 * - Hand-drawn dots overlay on the grid intersections
 * - Player lines are drawn with pen-style effects
 * - Completed boxes show with colored fills
 */
const DotsAndBoxesGameBoard: React.FC<DotsAndBoxesGameBoardProps> = ({
  gameState,
  onLineClick,
  newMoves,
  isThinking,
  penStyle
}) => {
  const metadata = gameState.metadata as unknown as DotsAndBoxesMetadata;
  const { gridSize, horizontalLines, verticalLines, completedBoxes } = metadata;
  
  const cellSize = 80;
  const padding = 60;
  const boardWidth = (gridSize.width - 1) * cellSize;
  const boardHeight = (gridSize.height - 1) * cellSize;
  const totalWidth = boardWidth + (padding * 2);
  const totalHeight = boardHeight + (padding * 2);

  // Generate hand-drawn dots for this pen style
  const handDrawnDots = useMemo(
    () => generateHandDrawnDots(gridSize.width, gridSize.height, cellSize, penStyle, padding),
    [gridSize.width, gridSize.height, cellSize, penStyle, padding]
  );

  // Get pen style properties
  const getPenStyleProps = () => {
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

  // Helper to get line position (coordinates within the SVG, no additional offset needed)
  const getLinePosition = (lineType: 'horizontal' | 'vertical', row: number, col: number) => {
    if (lineType === 'horizontal') {
      return {
        x1: padding + col * cellSize,
        y1: padding + row * cellSize,
        x2: padding + (col + 1) * cellSize,
        y2: padding + row * cellSize,
      };
    } else {
      return {
        x1: padding + col * cellSize,
        y1: padding + row * cellSize,
        x2: padding + col * cellSize,
        y2: padding + (row + 1) * cellSize,
      };
    }
  };
  
  // Check if a line is drawn
  const isLineDrawn = (lineType: 'horizontal' | 'vertical', row: number, col: number): boolean => {
    if (lineType === 'horizontal') {
      return horizontalLines[row] && horizontalLines[row][col] === true;
    } else {
      return verticalLines[row] && verticalLines[row][col] === true;
    }
  };
  
  // Check if a line is newly animated
  const isLineNew = (lineType: 'horizontal' | 'vertical', row: number, col: number): boolean => {
    const lineKey = `${lineType === 'horizontal' ? 'h' : 'v'}-${row}-${col}`;
    return newMoves.has(lineKey);
  };
  
  return (
    <div className="framework-paper-sheet">
      {/* Graph Paper Background */}
      <div
        className="graph-paper shadow-lg"
        style={{
          width: `${totalWidth + 120}px`,
          height: `${totalHeight + 120}px`,
          transform: 'rotate(-0.2deg)',
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
        {/* Game Area */}
        <div
          style={{
            position: 'absolute',
            left: '60px',
            top: '60px',
            width: `${totalWidth}px`,
            height: `${totalHeight}px`,
          }}
        >
          {/* SVG for game elements */}
          <svg
            width={totalWidth}
            height={totalHeight}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              cursor: isThinking ? 'wait' : 'pointer'
            }}
          >
            {/* SVG Filters for pen styles */}
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
              
              {/* Animation styles */}
              <style>{`
                @keyframes drawHandDrawnLine {
                  from {
                    stroke-dashoffset: var(--path-length);
                  }
                  to {
                    stroke-dashoffset: 0;
                  }
                }
                @keyframes boxComplete {
                  from { opacity: 0; transform: scale(0.8); }
                  to { opacity: 0.25; transform: scale(1); }
                }
              `}</style>
            </defs>

            {/* Hand-drawn dots */}
            <g className="hand-drawn-dots">
              {handDrawnDots.map((dot: any, index: number) => (
                <path
                  key={`dot-${index}`}
                  d={dot.variation}
                  {...getPenStyleProps()}
                  fill={getPenStyleProps().stroke}
                  strokeWidth="0"
                />
              ))}
            </g>
        
            {/* Horizontal lines */}
            <g className="horizontal-lines">
              {Array.from({ length: gridSize.height }, (_, row) => 
                Array.from({ length: gridSize.width - 1 }, (_, col) => {
                  const drawn = isLineDrawn('horizontal', row, col);
                  const isNew = isLineNew('horizontal', row, col);
                  const pos = getLinePosition('horizontal', row, col);
                  
                  if (!drawn) {
                    return (
                      <g key={`h-line-${row}-${col}`}>
                        {/* Invisible clickable area */}
                        <line
                          x1={pos.x1 + 8}
                          y1={pos.y1}
                          x2={pos.x2 - 8}
                          y2={pos.y2}
                          stroke="transparent"
                          strokeWidth={16}
                          style={{ cursor: isThinking ? 'wait' : 'pointer' }}
                          onClick={(e) => {
                            if (!isThinking) {
                              onLineClick('horizontal', row, col);
                            }
                            e.stopPropagation();
                          }}
                        />
                        {/* Hover indicator - now clickable */}
                        <line
                          x1={pos.x1}
                          y1={pos.y1}
                          x2={pos.x2}
                          y2={pos.y2}
                          stroke="#94a3b8"
                          strokeWidth={8}
                          strokeDasharray="4,4"
                          opacity={0.3}
                          className="hover-line"
                          style={{ cursor: isThinking ? 'wait' : 'pointer' }}
                          onClick={(e) => {
                            if (!isThinking) {
                              onLineClick('horizontal', row, col);
                            }
                            e.stopPropagation();
                          }}
                        />
                      </g>
                    );
                  }

                  // Generate hand-drawn line path
                  const linePath = generateHandDrawnLinePath(pos.x1, pos.y1, pos.x2, pos.y2, penStyle);
                  const pathLength = Math.sqrt(Math.pow(pos.x2 - pos.x1, 2) + Math.pow(pos.y2 - pos.y1, 2));

                  return (
                    <path
                      key={`h-line-${row}-${col}-drawn`}
                      d={linePath}
                      {...getPenStyleProps()}
                      fill="none"
                      strokeLinecap="round"
                      style={{
                        strokeDasharray: isNew ? pathLength : 'none',
                        strokeDashoffset: isNew ? 0 : 'none',
                        animation: isNew ? 'drawHandDrawnLine 0.6s ease-out' : 'none',
                        '--path-length': `${pathLength}px`
                      } as React.CSSProperties}
                    />
                  );
                })
              )}
            </g>
            
            {/* Vertical lines */}
            <g className="vertical-lines">
              {Array.from({ length: gridSize.height - 1 }, (_, row) => 
                Array.from({ length: gridSize.width }, (_, col) => {
                  const drawn = isLineDrawn('vertical', row, col);
                  const isNew = isLineNew('vertical', row, col);
                  const pos = getLinePosition('vertical', row, col);
                  
                  if (!drawn) {
                    return (
                      <g key={`v-line-${row}-${col}`}>
                        {/* Invisible clickable area */}
                        <line
                          x1={pos.x1}
                          y1={pos.y1 + 8}
                          x2={pos.x2}
                          y2={pos.y2 - 8}
                          stroke="transparent"
                          strokeWidth={16}
                          style={{ cursor: isThinking ? 'wait' : 'pointer' }}
                          onClick={(e) => {
                            if (!isThinking) {
                              onLineClick('vertical', row, col);
                            }
                            e.stopPropagation();
                          }}
                        />
                        {/* Hover indicator - now clickable */}
                        <line
                          x1={pos.x1}
                          y1={pos.y1}
                          x2={pos.x2}
                          y2={pos.y2}
                          stroke="#94a3b8"
                          strokeWidth={8}
                          strokeDasharray="4,4"
                          opacity={0.3}
                          className="hover-line"
                          style={{ cursor: isThinking ? 'wait' : 'pointer' }}
                          onClick={(e) => {
                            if (!isThinking) {
                              onLineClick('vertical', row, col);
                            }
                            e.stopPropagation();
                          }}
                        />
                      </g>
                    );
                  }

                  // Generate hand-drawn line path
                  const linePath = generateHandDrawnLinePath(pos.x1, pos.y1, pos.x2, pos.y2, penStyle);
                  const pathLength = Math.sqrt(Math.pow(pos.x2 - pos.x1, 2) + Math.pow(pos.y2 - pos.y1, 2));

                  return (
                    <path
                      key={`v-line-${row}-${col}-drawn`}
                      d={linePath}
                      {...getPenStyleProps()}
                      fill="none"
                      strokeLinecap="round"
                      style={{
                        strokeDasharray: isNew ? pathLength : 'none',
                        strokeDashoffset: isNew ? 0 : 'none',
                        animation: isNew ? 'drawHandDrawnLine 0.6s ease-out' : 'none',
                        '--path-length': `${pathLength}px`
                      } as React.CSSProperties}
                    />
                  );
                })
              )}
            </g>
        
            {/* Completed boxes */}
            <g className="completed-boxes">
              {Array.from({ length: gridSize.height - 1 }, (_, row) => 
                Array.from({ length: gridSize.width - 1 }, (_, col) => {
                  const owner = completedBoxes[row] && completedBoxes[row][col];
                  if (!owner) return null;
                  
                  const player = gameState.players.find(p => p.id === owner);
                  const color = player?.color || '#ef4444';
                  const isNew = newMoves.has(`box-${row}-${col}`);
                  
                  return (
                    <rect
                      key={`box-${row}-${col}`}
                      x={padding + col * cellSize + 8}
                      y={padding + row * cellSize + 8}
                      width={cellSize - 16}
                      height={cellSize - 16}
                      fill={color}
                      opacity={isNew ? 0 : 0.25}
                      rx={6}
                      style={{
                        animation: isNew ? 'boxComplete 0.5s ease-out forwards' : undefined
                      }}
                    />
                  );
                })
              )}
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
};

// Game Controls Component
const DotsAndBoxesGameControls: React.FC<{
  gameConfig: DotsAndBoxesConfig;
  gameState: GameState;
  isThinking: boolean;
  onNewGame: () => void;
  onBackToGames: () => void;
  onGetHint: () => void;
  canGetHint: boolean;
}> = ({
  gameConfig,
  gameState,
  isThinking,
  onNewGame,
  onBackToGames,
  onGetHint,
  canGetHint,
}) => {
  const metadata = gameState.metadata as unknown as DotsAndBoxesMetadata;
  const currentPlayer = gameState.players[gameState.currentPlayer];
  
  const getGameStatus = () => {
    const terminal = gameState.metadata && (gameState.metadata as any).gamePhase === 'finished';
    
    if (terminal) {
      const scores = metadata.playerScores;
      if (scores[0] > scores[1]) {
        return `🎉 ${gameState.players[0].name} wins!`;
      } else if (scores[1] > scores[0]) {
        return `🎉 ${gameState.players[1].name} wins!`;
      } else {
        return '🤝 It\'s a draw!';
      }
    }
    
    if (isThinking && currentPlayer.isAI) {
      return '🤖 AI is thinking...';
    }
    
    return `${currentPlayer.name}'s turn`;
  };
  
  return (
    <div className="space-y-4">
      {/* Primary Status */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex-1">
          <div className="text-lg font-bold text-gray-900">{getGameStatus()}</div>
          <div className="text-sm text-gray-600">
            Grid: {metadata.gridSize.width}×{metadata.gridSize.height} • 
            Scores: {metadata.playerScores.join(' - ')}
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white 
                       hover:bg-gray-100 rounded-md transition-colors border border-gray-300"
            onClick={onBackToGames}
          >
            ← Back
          </button>
          <button
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 
                       hover:bg-green-700 rounded-md transition-colors"
            onClick={onNewGame}
          >
            New Game
          </button>
        </div>
      </div>
      
      {/* Secondary Controls */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pt-4 border-t border-gray-200">
        <div className="flex items-center gap-6">
          {canGetHint && (
            <button
              className="px-4 py-1.5 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 
                         border border-gray-300 rounded-md transition-colors disabled:opacity-50"
              onClick={onGetHint}
              disabled={isThinking}
            >
              💡 Hint
            </button>
          )}
          
          <div className="text-sm text-gray-500">
            {gameConfig.gameMode === 'human-vs-ai' ? 
              `Level ${gameConfig.aiDifficulty} AI` : 
              'Human vs Human'
            }
          </div>
        </div>
      </div>
    </div>
  );
};


// Main Game Component
const DotsAndBoxesGameDualSystem: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Get game config from navigation state
  const gameConfig = location.state?.gameConfig as DotsAndBoxesConfig;

  // Redirect to setup if no config
  useEffect(() => {
    if (!gameConfig) {
      navigate('/games/dots-and-boxes');
    }
  }, [gameConfig, navigate]);

  // Game state
  const engine = useMemo(() => new DotsAndBoxesEngine(), []);
  const ai = useMemo(() => new DotsAndBoxesAI(), []);
  const [gameState, setGameState] = useState<GameState | null>(null);
  /*const [gameStats, setGameStats] = useState<GameStats>({
    movesPlayed: 0,
    gameStartTime: Date.now(),
    isDraw: false,
    gamesPlayed: 0,
    playerWins: 0,
    aiWins: 0,
    draws: 0,
  });*/
  const [isThinking, setIsThinking] = useState(false);
  const [newMoves, setNewMoves] = useState<Set<string>>(new Set());

  // Initialize game
  useEffect(() => {
    if (!gameConfig) {
      return;
    }

    const players: Player[] = [
      {
        id: 'player1',
        name: gameConfig.player1Name,
        isAI: false,
        score: 0,
        isActive: true,
        color: '#ef4444', // Red
      },
      {
        id: 'player2',
        name: gameConfig.player2Name,
        isAI: gameConfig.gameMode === 'human-vs-ai',
        difficulty: gameConfig.gameMode === 'human-vs-ai' ? gameConfig.aiDifficulty : undefined,
        score: 0,
        isActive: true,
        color: '#3b82f6', // Blue
      },
    ];

    const gameSettings: GameSettings & { gridSize: { width: number; height: number } } = {
      gameType: 'dots-and-boxes',
      playerCount: 2,
      enableAI: gameConfig.gameMode === 'human-vs-ai',
      difficulty: gameConfig.aiDifficulty,
      gridSize: gameConfig.gridSize,
      customRules: {
        gameMode: gameConfig.gameMode,
        player1Name: gameConfig.player1Name,
        player2Name: gameConfig.player2Name,
        aiDifficulty: gameConfig.aiDifficulty,
      },
    };
    
    try {
      const initialResult = engine.createInitialState(gameSettings, players);

      if (initialResult.success) {
        setGameState(initialResult.data);
        setNewMoves(new Set());
        // setGameStats(prev => ({
        //   ...prev,
        //   movesPlayed: 0,
        //   gameStartTime: Date.now(),
        //   isDraw: false,
        // }));
      } else {
        console.error('DotsAndBoxes - Failed to initialize game:', initialResult.error);
      }
    } catch (error) {
      console.error('DotsAndBoxes - Exception during game initialization:', error);
    }
  }, [gameConfig, engine]);

  // Handle AI moves automatically
  useEffect(() => {
    if (!gameState || isThinking) {
      return;
    }
    
    const currentPlayer = gameState.players[gameState.currentPlayer];
    if (!currentPlayer.isAI) {
      return;
    }
    
    // Check if game is over
    const terminal = engine.isTerminal(gameState);
    if (terminal) {
      return;
    }
    
    setIsThinking(true);
    
    if (!ai || !ai.getMove) {
      console.error('DotsAndBoxes - AI instance or getMove method not available');
      setIsThinking(false);
      return;
    }
    
    // Process AI move immediately (no timeout)
    const processAIMove = async () => {
      try {
        const aiMoveResult = await ai.getMove(gameState, gameConfig.aiDifficulty, currentPlayer.id);
        
        if (aiMoveResult && aiMoveResult.success) {
          const aiMoveApplied = engine.applyMove(gameState, aiMoveResult.data);
          
          if (aiMoveApplied.success) {
            setGameState(aiMoveApplied.data);
            
            // Handle AI move animations
            const aiMove = aiMoveResult.data;
            const aiLineKey = `${aiMove.type === 'horizontal' ? 'h' : 'v'}-${aiMove.position.row}-${aiMove.position.col}`;
            setNewMoves(new Set([aiLineKey]));
            
            setTimeout(() => {
              setNewMoves(new Set());
            }, 1000);
          } else {
            console.error('DotsAndBoxes - Failed to apply AI move:', aiMoveApplied.error);
          }
        } else {
          console.error('DotsAndBoxes - AI failed to generate move:', aiMoveResult);
        }
      } catch (error) {
        console.error('DotsAndBoxes - AI move exception:', error);
      } finally {
        setIsThinking(false);
      }
    };
    
    processAIMove();
  }, [gameState?.id, gameState?.currentPlayer, gameState?.turnNumber, isThinking, ai, engine, gameConfig.aiDifficulty]);

  // Fallback: Reset isThinking if it's been stuck for too long
  useEffect(() => {
    if (!isThinking) return;
    
    const fallbackTimeout = setTimeout(() => {
      console.warn('DotsAndBoxes - AI took too long, resetting isThinking state');
      setIsThinking(false);
    }, 10000); // 10 second timeout
    
    return () => {
      clearTimeout(fallbackTimeout);
    };
  }, [isThinking]);

  // Handle line click
  const handleLineClick = useCallback(
    async (lineType: 'horizontal' | 'vertical', row: number, col: number) => {
      if (!gameState || isThinking) {
        return;
      }

      const currentPlayer = gameState.players[gameState.currentPlayer];
      
      if (currentPlayer.isAI) {
        return; // Don't allow clicks during AI turn
      }

      // Create move
      const move = createMove({
        lineType,
        position: { row, col },
        playerId: currentPlayer.id,
      });

      // Validate and apply move
      const validation = engine.validateMove(gameState, move, currentPlayer.id);
      if (!validation.isValid) {
        console.warn('Invalid move:', validation.error);
        return;
      }

      const moveResult = engine.applyMove(gameState, move);
      if (!moveResult.success) {
        console.error('Move failed:', moveResult.error);
        return;
      }

      const newGameState = moveResult.data;
      const newMetadata = newGameState.metadata as unknown as DotsAndBoxesMetadata;
      
      setGameState(newGameState);

      // Mark new moves for animation
      const lineKey = `${lineType === 'horizontal' ? 'h' : 'v'}-${row}-${col}`;
      const newAnimations = new Set([lineKey]);
      
      // Check for newly completed boxes
      if (newMetadata.lastMoveCompletedBoxes > 0) {
        // Add box animations - this is simplified, you'd need to track which specific boxes were completed
        // For now, just animate any new boxes
        newMetadata.completedBoxes.forEach((boxRow: (string | null)[], rowIndex: number) => {
          boxRow.forEach((owner: string | null, colIndex: number) => {
            if (owner) {
              newAnimations.add(`box-${rowIndex}-${colIndex}`);
            }
          });
        });
      }
      
      setNewMoves(newAnimations);

      // Clear animations after 1 second
      setTimeout(() => {
        setNewMoves(new Set());
      }, 1000);

      // Check for game end
      const terminal = engine.isTerminal(newGameState);
      if (terminal) {
        return;
      }
    },
    [gameState, isThinking, engine, ai, gameConfig.aiDifficulty]
  );

  // New game handler
  const handleNewGame = useCallback(() => {
    if (!gameConfig) return;
    // Trigger re-initialization by updating game config timestamp
    navigate('/games/dots-and-boxes/play', {
      state: { gameConfig: { ...gameConfig, timestamp: Date.now() } },
    });
  }, [gameConfig, navigate]);

  // Hint handler
  const handleGetHint = useCallback(async () => {
    if (!gameState || isThinking) return;
    
    const currentPlayer = gameState.players[gameState.currentPlayer];
    if (currentPlayer.isAI) return;

    try {
      const hint = await ai.getHint(gameState, currentPlayer.id);
      if (hint) {
        alert(`Hint: ${hint.explanation} (${hint.strategicReason})`);
      }
    } catch (error) {
      console.error('Failed to get hint:', error);
    }
  }, [gameState, ai, isThinking]);

  if (!gameConfig) {
    return <div>Loading... (No game config)</div>;
  }
  
  if (!gameState) {
    return <div>Loading... (No game state)</div>;
  }

  const metadata = gameState.metadata as unknown as DotsAndBoxesMetadata;
  const currentPlayer = gameState.players[gameState.currentPlayer];
  const terminal = engine.isTerminal(gameState);
  const isGameOver = !!terminal;
  const canGetHint = gameConfig.gameMode === 'human-vs-ai' && !currentPlayer.isAI && !isGameOver;
  
  // GameContent component that has access to DualSystem context
  const GameContent: React.FC = () => {
    const { penStyle } = useDualSystem();

    return (
      <TruePaperLayout
        header={
          <div className="bg-white border-b border-gray-200 p-6">
            <div className="max-w-4xl mx-auto">
              <DotsAndBoxesGameControls
                gameConfig={gameConfig}
                gameState={gameState}
                isThinking={isThinking}
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
                    showScore={true}
                    showAvatar={false}
                    className="flex-shrink-0"
                    accessible={true}
                  />
                  <div className="text-xs text-center mt-1 text-gray-500">
                    {metadata.playerScores[0]} boxes
                  </div>
                </div>

                <div className="text-gray-400 font-bold text-lg px-2">VS</div>

                <div className="px-4 py-2 rounded-lg bg-gray-50 border">
                  <PlayerDisplay
                    player={gameState.players[1]}
                    isActive={gameState.currentPlayer === 1 && !isGameOver}
                    variant="compact"
                    showScore={true}
                    showAvatar={false}
                    className="flex-shrink-0"
                    accessible={true}
                  />
                  <div className="text-xs text-center mt-1 text-gray-500">
                    {metadata.playerScores[1]} boxes
                  </div>
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
                  {terminal?.winner ? (
                    <div className="text-green-600">
                      🎉{' '}
                      {terminal.winner === 'player1'
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
                        {gameState.currentPlayer === 0 ? '●' : '●'}
                      </span>
                      <strong>{currentPlayer.name}'s</strong> turn
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* The Enhanced Paper Game Area */}
            <DotsAndBoxesGameBoard
              gameState={gameState}
              isThinking={isThinking}
              onLineClick={handleLineClick}
              penStyle={penStyle}
              newMoves={newMoves}
            />
          </div>
        }
      />
    );
  };

  return (
    <DualSystemProvider
      initialTheme={{
        handDrawn: {
          penStyle: 'pencil',
          enablePenSwitching: true,
          paperType: 'graph',
          paperRotation: 0.2,
          gridSize: 20,
          showGridAnimation: false, // Subtle for dots and boxes
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

export default DotsAndBoxesGameDualSystem;