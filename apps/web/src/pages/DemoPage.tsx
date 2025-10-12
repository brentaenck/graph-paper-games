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

import { useState, useCallback, useEffect, useMemo } from 'react';
import {
  DualSystemProvider,
  TruePaperLayout,
  PaperSheet,
  HandDrawnGrid,
  EventBus,
  createCustomGrid,
} from '@gpg/framework';
import type { PenStyle, Player } from '@gpg/shared';

// Game cell for Territory Claim demo
interface GameCell {
  x: number;
  y: number;
  owner: Player | null;
  isNew?: boolean;
}

// Complete demo game state
interface DemoGameState {
  board: GameCell[];
  currentPlayer: Player;
  gameStatus: 'setup' | 'playing' | 'paused' | 'finished';
  winner: Player | null;
  turnCount: number;
  gameId: string;
  scores: { [playerId: string]: number };
}

const createDemoPlayers = (): [Player, Player] => [
  {
    id: 'player1',
    name: 'Alice',
    color: '#ef4444',
    isAI: false,
    score: 2,
    isActive: true,
  },
  {
    id: 'player2',
    name: 'Bob (AI)',
    color: '#3b82f6',
    isAI: true,
    score: 1,
    isActive: false,
  },
];

const createGameBoard = (width: number = 4, height: number = 3): GameCell[] => {
  const board: GameCell[] = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      board.push({ x, y, owner: null });
    }
  }
  return board;
};

// Internal demo component that uses the dual system context
const DemoPageContent = () => {
  // Enhanced game state for Territory Claim
  const [gridSize] = useState({ width: 4, height: 3 });
  const [players] = useState(() => createDemoPlayers());
  const [gameState, setGameState] = useState<DemoGameState>(() => ({
    board: createGameBoard(4, 3),
    currentPlayer: createDemoPlayers()[0],
    gameStatus: 'setup',
    winner: null,
    turnCount: 0,
    gameId: `game-${Date.now()}`,
    scores: { player1: 0, player2: 0 },
  }));
  const [hoveredCell, setHoveredCell] = useState<{ x: number; y: number } | null>(null);
  const [gameLog, setGameLog] = useState<string[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [newMoves, setNewMoves] = useState<Set<string>>(new Set());
  const [penStyle, setPenStyle] = useState<PenStyle>('ballpoint');
  const [gameCount, setGameCount] = useState(1);
  const [eventLog, setEventLog] = useState<string[]>([]);
  
  // Access dual system context (for future use)
  // const { theme } = useDualSystem();

  // Initialize game when component mounts
  useEffect(() => {
    if (gameState.gameStatus === 'setup') {
      setGameState(prev => ({
        ...prev,
        gameStatus: 'playing',
        currentPlayer: players[0],
      }));
      addToLog('Game started! Alice goes first.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameState.gameStatus, players]);

  // Set up EventBus listener for demonstration
  useEffect(() => {
    const unsubscribe = EventBus.subscribe('game:*', (event: { type: string, data: unknown }) => {
      console.log('EventBus received:', event.type, event.data);
      setEventLog(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${event.type}`]);
    });

    return unsubscribe;
  }, []);

  // Add message to game log
  const addToLog = useCallback((message: string) => {
    setGameLog(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${message}`]);
  }, []);

  // Helper function to advance to next player
  const nextTurn = useCallback(() => {
    const nextIndex = (currentPlayerIndex + 1) % players.length;
    const nextPlayer = players[nextIndex];
    setCurrentPlayerIndex(nextIndex);
    setGameState(prev => ({
      ...prev,
      currentPlayer: nextPlayer,
      turnCount: prev.turnCount + 1,
    }));
    addToLog(`${nextPlayer.name}'s turn (Turn ${Math.floor(gameState.turnCount / 2) + 1})`);

    // Emit EventBus event to demonstrate framework integration
    EventBus.emit({
      type: 'game:turn-changed',
      timestamp: new Date(),
      data: {
        previousPlayer: players[currentPlayerIndex],
        currentPlayer: nextPlayer,
        turnNumber: gameState.turnCount + 1,
      },
    });
  }, [currentPlayerIndex, players, gameState.turnCount, addToLog]);

  // Calculate current scores
  const calculateScores = useCallback((board: GameCell[]) => {
    const scores = { player1: 0, player2: 0 };
    board.forEach(cell => {
      if (cell.owner) {
        scores[cell.owner.id as 'player1' | 'player2']++;
      }
    });
    return scores;
  }, []);

  // Check if game is complete (all cells claimed)
  const checkGameComplete = useCallback((board: GameCell[]) => {
    return board.every(cell => cell.owner !== null);
  }, []);

  // Determine winner based on scores
  const determineWinner = useCallback((scores: { [key: string]: number }) => {
    const player1Score = scores.player1 || 0;
    const player2Score = scores.player2 || 0;
    
    if (player1Score > player2Score) return players[0];
    if (player2Score > player1Score) return players[1];
    return null; // Draw
  }, [players]);

  // Handle cell clicks - claim territory for current player
  const handleCellClick = useCallback(
    (x: number, y: number) => {
      const cellIndex = y * gridSize.width + x;
      const cell = gameState.board[cellIndex];
      
      if (gameState.gameStatus !== 'playing' || cell.owner !== null) {
        return;
      }

      const currentPlayer = gameState.currentPlayer;
      const cellKey = `${x}-${y}`;

      // Mark this move as new for animation
      setNewMoves(prev => new Set(prev).add(cellKey));
      
      // Clear the new move flag after animation
      setTimeout(() => {
        setNewMoves(prev => {
          const newSet = new Set(prev);
          newSet.delete(cellKey);
          return newSet;
        });
      }, 1000);

      // Update board with the move
      setGameState(prev => {
        const newBoard = prev.board.map(c => 
          c.x === x && c.y === y 
            ? { ...c, owner: currentPlayer, isNew: true }
            : c
        );

        const newScores = calculateScores(newBoard);
        const gameComplete = checkGameComplete(newBoard);
        const winner = gameComplete ? determineWinner(newScores) : null;

        return {
          ...prev,
          board: newBoard,
          scores: newScores,
          winner,
          gameStatus: gameComplete ? 'finished' : 'playing',
        };
      });

      addToLog(`${currentPlayer.name} claimed territory at (${x}, ${y})`);

      // Check if game is complete, otherwise advance turn
      setTimeout(() => {
        const updatedBoard = gameState.board.map(c => 
          c.x === x && c.y === y ? { ...c, owner: currentPlayer } : c
        );
        
        const newScores = calculateScores(updatedBoard);
        const gameComplete = checkGameComplete(updatedBoard);
        
        if (!gameComplete) {
          nextTurn();
        } else {
          const winner = determineWinner(newScores);
          if (winner) {
            addToLog(`🎉 ${winner.name} wins with ${newScores[winner.id as 'player1' | 'player2']} territories!`);
          } else {
            addToLog(`🤝 Game ends in a draw! Both players have ${newScores.player1} territories.`);
          }
          EventBus.emit({
            type: 'game:ended',
            timestamp: new Date(),
            data: {
              winner,
              scores: newScores,
              reason: 'all-territories-claimed',
            },
          });
        }
      }, 100);
    },
    [gameState, gridSize.width, addToLog, nextTurn, calculateScores, checkGameComplete, determineWinner]
  );

  // Handle cell hover
  const handleCellHover = useCallback((x: number | null, y: number | null) => {
    setHoveredCell(x !== null && y !== null ? { x, y } : null);
  }, []);

  // Reset game
  const resetGame = useCallback(() => {
    setCurrentPlayerIndex(0);
    setGameState({
      board: createGameBoard(gridSize.width, gridSize.height),
      currentPlayer: players[0],
      gameStatus: 'setup',
      winner: null,
      turnCount: 0,
      gameId: `game-${Date.now()}`,
      scores: { player1: 0, player2: 0 },
    });
    setGameLog([]);
    setNewMoves(new Set());
    setGameCount(prev => prev + 1);
  }, [players, gridSize]);

  // Pause/Resume game
  const togglePause = useCallback(() => {
    if (gameState.gameStatus === 'playing') {
      setGameState(prev => ({ ...prev, gameStatus: 'paused' }));
      addToLog('Game paused');
    } else if (gameState.gameStatus === 'paused') {
      setGameState(prev => ({ ...prev, gameStatus: 'playing' }));
      addToLog('Game resumed');
    }
  }, [gameState.gameStatus, addToLog]);

  // Create grid configuration
  const gridConfig = useMemo(() => {
    return createCustomGrid(gridSize.width, gridSize.height, {
      cellSize: 60,
      showAnimation: true,
      showImperfections: true,
    });
  }, [gridSize]);

  // Update players based on current game state
  const updatedPlayers = useMemo(() => players.map(player => ({
    ...player,
    isActive: player.id === gameState.currentPlayer.id,
    score: gameState.scores[player.id] || 0,
  })), [players, gameState.currentPlayer.id, gameState.scores]);

  return (
    <TruePaperLayout
      header={
        <div className="space-y-4">
          <div className="text-center">
            <h1 className="ui-text ui-text-2xl font-bold mb-2">🏆 Territory Claim - Framework Demo</h1>
            <p className="ui-text ui-text-muted max-w-2xl mx-auto">
              Take turns claiming territory! Click empty boxes to place your initial and claim them. 
              The player with the most territories when the board is full wins.
            </p>
          </div>
          
          {/* Enhanced Player Display */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center bg-gray-50 p-4 rounded-lg">
            {/* Player 1 */}
            <div
              className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                updatedPlayers[0].isActive
                  ? 'bg-blue-50 border-2 border-blue-200'
                  : 'bg-gray-50 border border-gray-200'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg ${
                  updatedPlayers[0].isActive
                    ? 'bg-red-100 border-2 border-red-400 text-red-700'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {updatedPlayers[0].name[0]}
              </div>
              <div>
                <p className="ui-text font-medium" style={{ color: updatedPlayers[0].color }}>{updatedPlayers[0].name}</p>
                <p className="ui-text-sm ui-text-muted">Territories: {updatedPlayers[0].score} • {updatedPlayers[0].isAI ? 'AI' : 'Human'}</p>
                {updatedPlayers[0].isActive && gameState.gameStatus === 'playing' && (
                  <span className="ui-badge ui-badge-primary ui-badge-sm">Your Turn</span>
                )}
              </div>
            </div>

            {/* Game Status */}
            <div className="text-center">
              {gameState.winner ? (
                gameState.winner.name === 'draw' ? (
                  <div>
                    <span className="ui-badge ui-badge-warning ui-badge-lg">🤝 Draw!</span>
                    <p className="ui-text-sm ui-text-muted mt-1">Equal territories!</p>
                  </div>
                ) : (
                  <div>
                    <span className="ui-badge ui-badge-success ui-badge-lg">🎉 {gameState.winner.name} Wins!</span>
                    <p className="ui-text-sm ui-text-muted mt-1">{gameState.scores[gameState.winner.id]} territories</p>
                  </div>
                )
              ) : gameState.gameStatus === 'paused' ? (
                <div>
                  <span className="ui-badge ui-badge-warning ui-badge-lg">⏸️ Game Paused</span>
                  <p className="ui-text-sm ui-text-muted mt-1">Click Resume to continue</p>
                </div>
              ) : (
                <div>
                  <span className="ui-badge ui-badge-primary ui-badge-lg">
                    {gameState.currentPlayer.name}'s Turn
                  </span>
                  <p className="ui-text-sm ui-text-muted mt-1">Turn {gameState.turnCount + 1} • Game #{gameCount}</p>
                </div>
              )}
            </div>

            {/* Player 2 */}
            <div
              className={`flex items-center gap-3 md:justify-end p-3 rounded-lg transition-all duration-200 ${
                updatedPlayers[1].isActive
                  ? 'bg-blue-50 border-2 border-blue-200'
                  : 'bg-gray-50 border border-gray-200'
              }`}
            >
              <div className="order-2 md:order-1">
                <p className="ui-text font-medium" style={{ color: updatedPlayers[1].color }}>{updatedPlayers[1].name}</p>
                <p className="ui-text-sm ui-text-muted">Territories: {updatedPlayers[1].score} • {updatedPlayers[1].isAI ? 'AI' : 'Human'}</p>
                {updatedPlayers[1].isActive && gameState.gameStatus === 'playing' && (
                  <span className="ui-badge ui-badge-primary ui-badge-sm">AI Turn</span>
                )}
              </div>
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg order-1 md:order-2 ${
                  updatedPlayers[1].isActive
                    ? 'bg-blue-100 border-2 border-blue-400 text-blue-700'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {updatedPlayers[1].name[0]}
              </div>
            </div>
          </div>
        </div>
      }
      paper={
        <PaperSheet
          gameWidth={gridSize.width * 3}  // Grid units: 3 units per cell (60px)
          gameHeight={gridSize.height * 3}
          gridSize={20}  // Use 20px grid size for paper background
          onPaper={true}
          className="mx-auto"
        >
          <div
            style={{
              position: 'relative',
              width: `${gridSize.width * 60}px`,
              height: `${gridSize.height * 60}px`,
            }}
          >
            {/* Hand-drawn grid */}
            <HandDrawnGrid 
              columns={gridConfig.columns}
              rows={gridConfig.rows}
              cellSize={gridConfig.cellSize}
              showAnimation={gridConfig.showAnimation}
              showImperfections={gridConfig.showImperfections}
              width={gridSize.width * 60}
              height={gridSize.height * 60}
              onPaper={true} 
              animate={true} 
            />
            
            {/* Interactive overlay */}
            <div
              className="demo-interactive-grid"
              style={{
                position: 'absolute',
                top: '0px',
                left: '0px',
                width: `${gridSize.width * 60}px`,
                height: `${gridSize.height * 60}px`,
                display: 'grid',
                gridTemplateColumns: `repeat(${gridSize.width}, 60px)`,
                gridTemplateRows: `repeat(${gridSize.height}, 60px)`,
                gridGap: '0px',
                gap: '0px',
                zIndex: 10,
              }}
            >
              {gameState.board.map((cell, index) => {
                const isHovered = hoveredCell && hoveredCell.x === cell.x && hoveredCell.y === cell.y;
                const cellKey = `${cell.x}-${cell.y}`;
                const isNewMove = newMoves.has(cellKey);
                
                return (
                  <button
                    key={index}
                    onClick={() => handleCellClick(cell.x, cell.y)}
                    onMouseEnter={() => handleCellHover(cell.x, cell.y)}
                    onMouseLeave={() => handleCellHover(null, null)}
                    disabled={!!cell.owner || gameState.gameStatus !== 'playing'}
                    className="flex items-center justify-center hover:bg-white hover:bg-opacity-10 transition-colors disabled:cursor-not-allowed"
                    style={{
                      width: '60px',
                      height: '60px',
                      border: 'none',
                      background: cell.owner 
                        ? `${cell.owner.color}20` 
                        : isHovered 
                        ? 'rgba(16, 185, 129, 0.1)' 
                        : 'transparent',
                      borderRadius: '4px',
                    }}
                  >
                    {/* Player Initial */}
                    {cell.owner && (
                      <div 
                        className={`font-bold text-2xl ${isNewMove ? 'animate-pulse' : ''}`}
                        style={{ color: cell.owner.color }}
                      >
                        {cell.owner.name[0]}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </PaperSheet>
      }
      footer={
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Game Controls */}
            <div className="ui-card ui-card-body">
              <h3 className="ui-text ui-text-lg font-semibold mb-4">Game Controls</h3>
              
              {/* Current Player Display */}
              <div className="flex justify-between items-center mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="ui-text">
                  <span className="font-medium">Current Player:</span>
                  <span 
                    className="ml-2 font-bold"
                    style={{ color: gameState.currentPlayer.color }}
                  >
                    {gameState.currentPlayer.name} ({gameState.currentPlayer.name[0]})
                  </span>
                </div>
                {gameState.winner && (
                  <span className="ui-badge ui-badge-success">
                    🎉 {gameState.winner.name} Wins!
                  </span>
                )}
              </div>
              
              {/* Controls */}
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={togglePause}
                  className="ui-button ui-button-secondary"
                  disabled={gameState.gameStatus === 'finished'}
                >
                  {gameState.gameStatus === 'paused' ? 'Resume' : 'Pause'}
                </button>
                <button onClick={resetGame} className="ui-button ui-button-primary">
                  🔄 New Game
                </button>
              </div>
              
              {/* Pen Style Selector */}
              <div className="mt-4">
                <label className="ui-text ui-text-sm font-medium mb-2 block">Pen Style:</label>
                <select
                  value={penStyle}
                  onChange={e => setPenStyle(e.target.value as PenStyle)}
                  className="ui-input"
                >
                  <option value="ballpoint">🖊️ Ballpoint</option>
                  <option value="pencil">✏️ Pencil</option>
                  <option value="marker">🖍️ Marker</option>
                  <option value="fountain">🖋️ Fountain Pen</option>
                </select>
              </div>
            </div>
            
            {/* Game Status */}
            <div className="ui-card ui-card-body">
              <h3 className="ui-text ui-text-lg font-semibold mb-4">Game Status</h3>
              <div className="space-y-3 ui-text ui-text-sm">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="font-medium capitalize">{gameState.gameStatus}</span>
                </div>
                <div className="flex justify-between">
                  <span>Turn:</span>
                  <span className="font-medium">{gameState.turnCount + 1}</span>
                </div>
                <div className="flex justify-between">
                  <span>Alice's Territories:</span>
                  <span className="font-medium" style={{ color: players[0].color }}>{gameState.scores.player1}</span>
                </div>
                <div className="flex justify-between">
                  <span>Bob's Territories:</span>
                  <span className="font-medium" style={{ color: players[1].color }}>{gameState.scores.player2}</span>
                </div>
                <div className="flex justify-between">
                  <span>Remaining:</span>
                  <span className="font-medium">{gridSize.width * gridSize.height - gameState.board.filter(c => c.owner).length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Game ID:</span>
                  <span className="font-mono text-xs">{gameState.gameId.slice(-8)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Game Log */}
            <div className="ui-card ui-card-body">
              <h3 className="ui-text ui-text-lg font-semibold mb-4">Game Log</h3>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {gameLog.length === 0 ? (
                  <p className="ui-text ui-text-muted ui-text-sm">No moves yet. Click a cell to start!</p>
                ) : (
                  gameLog.map((log, index) => (
                    <div key={index} className="ui-text ui-text-sm font-mono p-2 bg-gray-50 rounded">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {/* EventBus Integration Demo */}
            <div className="ui-card ui-card-body">
              <h3 className="ui-text ui-text-lg font-semibold mb-4">🔄 EventBus Demo</h3>
              <div className="space-y-1 max-h-32 overflow-y-auto mb-4">
                {eventLog.length === 0 ? (
                  <p className="ui-text ui-text-muted ui-text-sm">No events yet. Make a move to see EventBus in action!</p>
                ) : (
                  eventLog.map((event, index) => (
                    <div key={index} className="ui-text ui-text-xs font-mono p-1 bg-blue-50 rounded text-blue-800">
                      {event}
                    </div>
                  ))
                )}
              </div>
              <ul className="space-y-1 ui-text ui-text-sm">
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span><strong>EventBus:</strong> Game event communication</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span><strong>Event Types:</strong> turn-changed, game:ended</span>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Framework Components Status */}
          <div className="ui-card ui-card-body">
            <h3 className="ui-text ui-text-lg font-semibold mb-4">🎆 Complete Territory Claim Demo</h3>
            <ul className="space-y-2 ui-text ui-text-sm">
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span><strong>Territory Claim Game:</strong> Turn-based gameplay with scoring</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span><strong>Enhanced Game Controls:</strong> Pause/Resume & Reset</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span><strong>Game Status Tracking:</strong> Turns, scores, territories</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span><strong>Real-time Game Log:</strong> Timestamped events</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span><strong>EventBus Integration:</strong> Event-driven architecture</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span><strong>Enhanced Interactions:</strong> Hover effects & animations</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span><strong>HandDrawnGrid:</strong> Paper grid rendering</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span><strong>Dual Design System:</strong> Modern UI + Hand-drawn elements</span>
              </li>
            </ul>
            <p className="ui-text ui-text-xs ui-text-muted mt-3">
              This comprehensive demo showcases the complete Dual Design System with
              full game management, EventBus integration, and Territory Claim gameplay!
            </p>
          </div>
        </div>
      }
      layoutType="header-footer"
      responsive={true}
    />
  );
};

// Main component with DualSystemProvider
const DemoPage = () => {
  return (
    <DualSystemProvider
      initialTheme={{
        ui: {
          theme: 'light',
          primaryColor: '#3b82f6',
          borderRadius: '0.375rem',
          fontFamily: 'ui-sans-serif, system-ui, sans-serif',
        },
        handDrawn: {
          penStyle: 'ballpoint',
          enablePenSwitching: true,
          paperType: 'graph',
          paperRotation: -0.3,
          gridSize: 20,
          showGridAnimation: true,
          symbolAnimationDuration: 1200,
          gridAnimationDelay: [0, 100, 200, 300, 400, 500, 600, 700, 800],
          showImperfections: true,
          roughnessIntensity: 0.3,
        },
        layout: {
          type: 'header-footer',
          responsive: true,
        },
      }}
      enableAnimations={true}
      enablePenSwitching={true}
    >
      <DemoPageContent />
    </DualSystemProvider>
  );
};

export default DemoPage;