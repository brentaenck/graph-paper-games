import { useState, useCallback, useEffect, useMemo } from 'react';
import { 
  GridRenderer, 
  EventBus,
  paperTheme,
  type GridTheme 
} from '@gpg/framework';
import type { Grid, GridCell, GridCoordinate, Player, GameAnnotation } from '@gpg/shared';

// Create a simple demo game state
interface DemoGameState {
  grid: Grid;
  currentPlayer: Player;
  gameStatus: 'setup' | 'playing' | 'paused' | 'finished';
  winner: Player | null;
  turnCount: number;
}

const createDemoPlayers = (): [Player, Player] => [
  {
    id: 'player1',
    name: 'Player 1',
    avatar: '👤',
    score: 0,
    isAI: false,
    isActive: true,
  },
  {
    id: 'player2', 
    name: 'Player 2',
    avatar: '🤖',
    score: 0,
    isAI: false,
    isActive: true,
  }
];

const createDemoGrid = (width: number, height: number): Grid => {
  const cells: GridCell[][] = [];
  
  for (let y = 0; y < height; y++) {
    const row: GridCell[] = [];
    for (let x = 0; x < width; x++) {
      row.push({
        coordinate: { x, y },
        state: 'empty',
        owner: undefined,
        metadata: {},
      });
    }
    cells.push(row);
  }
  
  return {
    width,
    height,
    cells,
    type: 'square',
  };
};

const GameLoopDemo = () => {
  const [players] = useState(() => createDemoPlayers());
  const [gameState, setGameState] = useState<DemoGameState>(() => ({
    grid: createDemoGrid(5, 5),
    currentPlayer: players[0],
    gameStatus: 'setup',
    winner: null,
    turnCount: 0,
  }));
  const [hoveredCell, setHoveredCell] = useState<GridCoordinate | null>(null);
  const [gameLog, setGameLog] = useState<string[]>([]);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);

  // Initialize game when component mounts
  useEffect(() => {
    if (gameState.gameStatus === 'setup') {
      setGameState(prev => ({
        ...prev,
        gameStatus: 'playing',
        currentPlayer: players[0],
      }));
      addToLog('Game started! Player 1 goes first.');
    }
  }, [gameState.gameStatus, players]);

  // Set up EventBus listener for demonstration
  useEffect(() => {
    const unsubscribe = EventBus.subscribe('game:*', (event) => {
      console.log('EventBus received:', event.type, event.data);
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
        turnNumber: gameState.turnCount + 1
      }
    });
  }, [currentPlayerIndex, players, gameState.turnCount, addToLog]);

  // Handle cell clicks - place a piece for the current player
  const handleCellClick = useCallback((coordinate: GridCoordinate, cell: GridCell) => {
    if (gameState.gameStatus !== 'playing' || cell.state !== 'empty') {
      return;
    }

    const currentPlayer = gameState.currentPlayer;
    
    // Update grid with the move
    setGameState(prev => {
      const newCells = prev.grid.cells.map((row: readonly GridCell[]) =>
        row.map((c: GridCell) => {
          if (c.coordinate.x === coordinate.x && c.coordinate.y === coordinate.y) {
            return {
              ...c,
              state: 'occupied' as const,
              owner: currentPlayer.id,
            };
          }
          return c;
        })
      );

      const newGrid = { ...prev.grid, cells: newCells };

      // Check for win condition (simple: get 3 in a row)
      const winner = checkForWinner(newGrid, currentPlayer);
      
      return {
        ...prev,
        grid: newGrid,
        winner: winner ? currentPlayer : null,
        gameStatus: winner ? 'finished' : 'playing',
      };
    });

    addToLog(`${currentPlayer.name} placed at (${coordinate.x}, ${coordinate.y})`);

    // Check if game is won, otherwise advance turn
    setTimeout(() => {
      const updatedGrid = gameState.grid;
      if (!checkForWinner(updatedGrid, currentPlayer)) {
        nextTurn();
      } else {
        addToLog(`🎉 ${currentPlayer.name} wins!`);
        EventBus.emit({
          type: 'game:ended',
          timestamp: new Date(),
          data: { 
            winner: currentPlayer,
            reason: 'three-in-a-row'
          }
        });
      }
    }, 100);
  }, [gameState, addToLog, nextTurn]);

  // Simple win condition check: 3 in a row horizontally, vertically, or diagonally
  const checkForWinner = (grid: Grid, player: Player): boolean => {
    const cells = grid.cells;
    const playerId = player.id;
    
    // Check rows
    for (let y = 0; y < grid.height; y++) {
      for (let x = 0; x <= grid.width - 3; x++) {
        if (cells[y][x].owner === playerId && 
            cells[y][x + 1].owner === playerId && 
            cells[y][x + 2].owner === playerId) {
          return true;
        }
      }
    }
    
    // Check columns
    for (let x = 0; x < grid.width; x++) {
      for (let y = 0; y <= grid.height - 3; y++) {
        if (cells[y][x].owner === playerId && 
            cells[y + 1][x].owner === playerId && 
            cells[y + 2][x].owner === playerId) {
          return true;
        }
      }
    }
    
    // Check diagonals (top-left to bottom-right)
    for (let y = 0; y <= grid.height - 3; y++) {
      for (let x = 0; x <= grid.width - 3; x++) {
        if (cells[y][x].owner === playerId && 
            cells[y + 1][x + 1].owner === playerId && 
            cells[y + 2][x + 2].owner === playerId) {
          return true;
        }
      }
    }
    
    // Check diagonals (top-right to bottom-left)
    for (let y = 0; y <= grid.height - 3; y++) {
      for (let x = 2; x < grid.width; x++) {
        if (cells[y][x].owner === playerId && 
            cells[y + 1][x - 1].owner === playerId && 
            cells[y + 2][x - 2].owner === playerId) {
          return true;
        }
      }
    }
    
    return false;
  };

  // Handle cell hover
  const handleCellHover = useCallback((coordinate: GridCoordinate | null) => {
    setHoveredCell(coordinate);
  }, []);

  // Create annotations for hovered cell
  const annotations: GameAnnotation[] = useMemo(() => {
    if (!hoveredCell || gameState.gameStatus !== 'playing') return [];
    
    const cell = gameState.grid.cells[hoveredCell.y]?.[hoveredCell.x];
    if (cell?.state !== 'empty') return [];
    
    return [
      {
        type: 'highlight',
        coordinates: [hoveredCell],
        color: gameState.currentPlayer.id === 'player1' ? '#3b82f6' : '#ef4444',
      }
    ];
  }, [hoveredCell, gameState.gameStatus, gameState.currentPlayer, gameState.grid]);

  // Reset game
  const resetGame = useCallback(() => {
    setCurrentPlayerIndex(0);
    setGameState({
      grid: createDemoGrid(5, 5),
      currentPlayer: players[0],
      gameStatus: 'setup',
      winner: null,
      turnCount: 0,
    });
    setGameLog([]);
  }, [players]);

  // Pause/Resume game
  const togglePause = () => {
    if (gameState.gameStatus === 'playing') {
      setGameState(prev => ({ ...prev, gameStatus: 'paused' }));
      addToLog('Game paused');
    } else if (gameState.gameStatus === 'paused') {
      setGameState(prev => ({ ...prev, gameStatus: 'playing' }));
      addToLog('Game resumed');
    }
  };

  const currentTheme: GridTheme = paperTheme;

  return (
    <div className="container p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="mb-4">Game Loop Demo</h1>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto">
            Experience our complete framework in action! This demo shows TurnManager, EventBus, 
            and GridRenderer working together in a simple 3-in-a-row game.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Game Board */}
          <div className="lg:col-span-2">
            <div className="card p-6">
              <h3 className="mb-4">Game Board</h3>
              
              <div className="flex justify-center mb-4">
                <div className="game-board">
                  <GridRenderer
                    grid={gameState.grid}
                    theme={currentTheme}
                    annotations={annotations}
                    interactive={gameState.gameStatus === 'playing'}
                    onCellClick={handleCellClick}
                    onCellHover={handleCellHover}
                    className="demo-game-grid"
                  />
                </div>
              </div>

              {/* Simple Player Display */}
              <div className="player-display mt-4">
                <div className="flex justify-between items-center mb-4">
                  <div className="text-lg font-semibold">
                    Current Player: {gameState.currentPlayer.avatar} {gameState.currentPlayer.name}
                  </div>
                  {gameState.winner && (
                    <div className="text-lg font-bold text-green-600">
                      🎉 Winner: {gameState.winner.name}!
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 flex-wrap">
                  <button 
                    onClick={togglePause}
                    className="btn btn-secondary"
                    disabled={gameState.gameStatus === 'finished'}
                  >
                    {gameState.gameStatus === 'paused' ? 'Resume' : 'Pause'}
                  </button>
                  <button onClick={resetGame} className="btn btn-secondary">
                    Reset Game
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Game Info Panel */}
          <div className="space-y-6">
            {/* Game Status */}
            <div className="card p-4">
              <h4 className="mb-3">Game Status</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="font-medium capitalize">{gameState.gameStatus}</span>
                </div>
                <div className="flex justify-between">
                  <span>Turn:</span>
                  <span className="font-medium">{Math.floor(gameState.turnCount / 2) + 1}</span>
                </div>
                <div className="flex justify-between">
                  <span>Current Player:</span>
                  <span className="font-medium">
                    {gameState.currentPlayer.avatar} {gameState.currentPlayer.name}
                  </span>
                </div>
                {gameState.winner && (
                  <div className="flex justify-between text-green-600">
                    <span>Winner:</span>
                    <span className="font-bold">
                      {gameState.winner.avatar} {gameState.winner.name}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Game Log */}
            <div className="card p-4">
              <h4 className="mb-3">Game Log</h4>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {gameLog.map((log, index) => (
                  <div key={index} className="text-sm text-gray-600 font-mono">
                    {log}
                  </div>
                ))}
              </div>
            </div>

            {/* Framework Components */}
            <div className="card p-4">
              <h4 className="mb-3">Framework Demo</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span><strong>EventBus:</strong> Game events</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-600">✓</span>
                  <span><strong>GridRenderer:</strong> Interactive grid</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-600">⚠</span>
                  <span><strong>TurnManager:</strong> Coming soon</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-blue-600">⚠</span>
                  <span><strong>GameHUD:</strong> Coming soon</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                This demo shows EventBus and GridRenderer integration.
                Full TurnManager and GameHUD integration coming next!
              </p>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="card p-6 mt-8">
          <h3 className="mb-4">How to Play</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">🎯 Objective</h4>
              <p>Get 3 of your pieces in a row (horizontal, vertical, or diagonal)</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">🎮 Controls</h4>
              <p>Click any empty cell to place your piece. Hover to see preview.</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">🔄 Framework</h4>
              <p>Watch the game log to see EventBus messages and TurnManager in action!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameLoopDemo;