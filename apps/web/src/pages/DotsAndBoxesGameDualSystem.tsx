import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import type { GameState, Player, AIDifficulty, GameSettings } from '@gpg/shared';
import { DotsAndBoxesEngine, DotsAndBoxesAI, createMove } from '@gpg/dots-and-boxes';
import type { DotsAndBoxesMetadata } from '@gpg/dots-and-boxes';

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

// Interactive Game Board Component
interface DotsAndBoxesGameBoardProps {
  gameState: GameState;
  onLineClick: (lineType: 'horizontal' | 'vertical', row: number, col: number) => void;
  newMoves: Set<string>;
  isThinking: boolean;
}

/*
 * COORDINATE SYSTEM DOCUMENTATION:
 * 
 * For a 3x3 dot grid:
 * - Dots: (0,0) to (2,2) - 9 dots total
 * - Boxes: (0,0) to (1,1) - 4 boxes total
 * - Horizontal lines: 3 rows x 2 cols = 6 lines
 *   - horizontalLines[row][col] - line from dot(row,col) to dot(row,col+1)
 * - Vertical lines: 2 rows x 3 cols = 6 lines  
 *   - verticalLines[row][col] - line from dot(row,col) to dot(row+1,col)
 *
 * CONSISTENT [row][col] INDEXING:
 * - row = vertical position (Y-axis)
 * - col = horizontal position (X-axis)
 * - All data structures use this same indexing pattern
 */
const DotsAndBoxesGameBoard: React.FC<DotsAndBoxesGameBoardProps> = ({
  gameState,
  onLineClick,
  newMoves,
  isThinking
}) => {
  const metadata = gameState.metadata as unknown as DotsAndBoxesMetadata;
  const { gridSize, horizontalLines, verticalLines, completedBoxes } = metadata;
  
  const cellSize = 80;
  const dotRadius = 4;
  const lineThickness = 3;
  const padding = 40;
  
  const boardWidth = (gridSize.width - 1) * cellSize;
  const boardHeight = (gridSize.height - 1) * cellSize;
  const totalWidth = boardWidth + (padding * 2);
  const totalHeight = boardHeight + (padding * 2);
  
  // Helper to get line position
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
      // Vertical lines: consistent [row][col] indexing
      return verticalLines[row] && verticalLines[row][col] === true;
    }
  };
  
  // Check if a line is newly animated
  const isLineNew = (lineType: 'horizontal' | 'vertical', row: number, col: number): boolean => {
    const lineKey = `${lineType === 'horizontal' ? 'h' : 'v'}-${row}-${col}`;
    return newMoves.has(lineKey);
  };
  
  return (
    <div className="game-board" style={{ 
      display: 'flex', 
      justifyContent: 'center',
      padding: '20px',
      backgroundColor: '#fafafa'
    }}>
      <svg 
        key={`game-board-${gameState.turnNumber}`}
        width={totalWidth} 
        height={totalHeight}
        style={{ 
          border: '2px solid #ddd',
          backgroundColor: 'white',
          borderRadius: '8px',
          cursor: isThinking ? 'wait' : 'pointer'
        }}
      >
        {/* Background grid dots */}
        {Array.from({ length: gridSize.height }, (_, row) => 
          Array.from({ length: gridSize.width }, (_, col) => (
            <circle
              key={`dot-${row}-${col}`}
              cx={padding + col * cellSize}
              cy={padding + row * cellSize}
              r={dotRadius}
              fill="#374151"
              className="game-dot"
            />
          ))
        )}
        
        {/* Horizontal lines */}
        {Array.from({ length: gridSize.height }, (_, row) => 
          Array.from({ length: gridSize.width - 1 }, (_, col) => {
            const drawn = isLineDrawn('horizontal', row, col);
            const isNew = isLineNew('horizontal', row, col);
            const pos = getLinePosition('horizontal', row, col);
            
            
            return (
              <g key={`h-line-${row}-${col}-${gameState.turnNumber}-${drawn}`}>
                {/* Invisible clickable area - adjusted to avoid overlap with vertical lines */}
                <line
                  x1={pos.x1 + 8}
                  y1={pos.y1}
                  x2={pos.x2 - 8}
                  y2={pos.y2}
                  stroke="transparent"
                  strokeWidth={16}
                  style={{ cursor: isThinking ? 'wait' : 'pointer' }}
                  onClick={(e) => {
                    if (!drawn && !isThinking) {
                      onLineClick('horizontal', row, col);
                    }
                    e.stopPropagation();
                  }}
                />
                
                {/* Visible line */}
                {drawn && (
                  <line
                    x1={pos.x1}
                    y1={pos.y1}
                    x2={pos.x2}
                    y2={pos.y2}
                    stroke={isNew ? '#ef4444' : '#374151'}
                    strokeWidth={lineThickness}
                    strokeLinecap="round"
                    style={{
                      opacity: isNew ? 0.8 : 1,
                      animation: isNew ? 'drawLine 0.3s ease-out' : undefined
                    }}
                  />
                )}
                
                {/* Hover indicator */}
                {!drawn && (
                  <line
                    x1={pos.x1}
                    y1={pos.y1}
                    x2={pos.x2}
                    y2={pos.y2}
                    stroke="#94a3b8"
                    strokeWidth={1}
                    strokeDasharray="4,4"
                    opacity={0.5}
                    className="hover-line"
                    style={{ pointerEvents: 'none' }}
                  />
                )}
              </g>
            );
          })
        )}
        
        {/* Vertical lines */}
        {Array.from({ length: gridSize.height - 1 }, (_, row) => 
          Array.from({ length: gridSize.width }, (_, col) => {
            // For vertical lines, we need to check if there's a line from dot (row, col) to dot (row+1, col)
            const drawn = isLineDrawn('vertical', row, col);
            const isNew = isLineNew('vertical', row, col);
            const pos = getLinePosition('vertical', row, col);
            
            
            
            return (
              <g key={`v-line-${row}-${col}-${gameState.turnNumber}-${drawn}`}>
                {/* Invisible clickable area - adjusted to avoid overlap with horizontal lines */}
                <line
                  x1={pos.x1}
                  y1={pos.y1 + 8}
                  x2={pos.x2}
                  y2={pos.y2 - 8}
                  stroke="transparent"
                  strokeWidth={16}
                  style={{ cursor: isThinking ? 'wait' : 'pointer' }}
                  onClick={(e) => {
                    if (!drawn && !isThinking) {
                      onLineClick('vertical', row, col);
                    }
                    e.stopPropagation();
                  }}
                />
                
                {/* Visible line */}
                {drawn && (
                  <line
                    x1={pos.x1}
                    y1={pos.y1}
                    x2={pos.x2}
                    y2={pos.y2}
                    stroke={isNew ? '#3b82f6' : '#374151'}
                    strokeWidth={lineThickness}
                    strokeLinecap="round"
                    style={{
                      opacity: isNew ? 0.8 : 1,
                      animation: isNew ? 'drawLine 0.3s ease-out' : undefined
                    }}
                  />
                )}
                
                {/* Hover indicator */}
                {!drawn && (
                  <line
                    x1={pos.x1}
                    y1={pos.y1}
                    x2={pos.x2}
                    y2={pos.y2}
                    stroke="#94a3b8"
                    strokeWidth={1}
                    strokeDasharray="4,4"
                    opacity={0.5}
                    className="hover-line"
                    style={{ pointerEvents: 'none' }}
                  />
                )}
              </g>
            );
          })
        )}
        
        {/* Completed boxes */}
        {Array.from({ length: gridSize.height - 1 }, (_, row) => 
          Array.from({ length: gridSize.width - 1 }, (_, col) => {
            const owner = completedBoxes[row] && completedBoxes[row][col];
            if (!owner) return null;
            
            const player = gameState.players.find(p => p.id === owner);
            const color = player?.color || '#ef4444';
            
            return (
              <rect
                key={`box-${row}-${col}`}
                x={padding + col * cellSize + 8}
                y={padding + row * cellSize + 8}
                width={cellSize - 16}
                height={cellSize - 16}
                fill={color}
                opacity={0.2}
                rx={4}
                style={{
                  animation: newMoves.has(`box-${row}-${col}`) ? 'boxComplete 0.5s ease-out' : undefined
                }}
              />
            );
          })
        )}
        
        {/* Add some CSS animations */}
        <defs>
          <style>{`
            @keyframes drawLine {
              from { opacity: 0; transform: scaleX(0); }
              to { opacity: 0.8; transform: scaleX(1); }
            }
            @keyframes boxComplete {
              from { opacity: 0; transform: scale(0.8); }
              to { opacity: 0.2; transform: scale(1); }
            }
            .hover-line {
              transition: opacity 0.2s ease;
            }
            .game-board:hover .hover-line {
              opacity: 0.8;
            }
          `}</style>
        </defs>
      </svg>
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
  
  try {
    return (
      <div style={{ padding: '2rem', background: 'white', minHeight: '100vh' }}>
        <h1>Dots and Boxes Game</h1>
        <div style={{ marginBottom: '1rem', padding: '1rem', background: '#f0f0f0' }}>
          <p><strong>Game Status:</strong> {isGameOver ? 'Game Over' : `${currentPlayer.name}'s Turn`}</p>
          <p><strong>Grid Size:</strong> {metadata.gridSize.width}×{metadata.gridSize.height}</p>
          <p><strong>Current Player:</strong> {currentPlayer.name} {currentPlayer.isAI ? '(AI)' : ''}</p>
          <p><strong>Scores:</strong> {metadata.playerScores.join(' - ')}</p>
          {isThinking && <p><strong>Status:</strong> AI is thinking...</p>}
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <button onClick={handleNewGame} style={{ marginRight: '10px', padding: '10px 20px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            New Game
          </button>
          {canGetHint && (
            <button onClick={handleGetHint} disabled={isThinking} style={{ marginRight: '10px', padding: '10px 20px', background: '#10b981', color: 'white', border: 'none', borderRadius: '5px', cursor: isThinking ? 'not-allowed' : 'pointer', opacity: isThinking ? 0.5 : 1 }}>
              Get Hint
            </button>
          )}
          <button onClick={() => navigate('/games')} style={{ padding: '10px 20px', background: '#6b7280', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
            Back to Games
          </button>
        </div>
        
        <div style={{ background: '#f9fafb', border: '2px solid #d1d5db', borderRadius: '8px', padding: '1rem' }}>
          <h3>Game Board</h3>
          <DotsAndBoxesGameBoard
            gameState={gameState}
            onLineClick={handleLineClick}
            newMoves={newMoves}
            isThinking={isThinking}
          />
        </div>
        
        {isGameOver && (
          <div style={{ marginTop: '2rem', padding: '2rem', background: '#f3f4f6', borderRadius: '8px', textAlign: 'center' }}>
            <h2>{terminal?.winner ? `🎉 ${gameState.players.find(p => p.id === terminal.winner)?.name} Wins!` : '🤝 It\'s a Draw!'}</h2>
            <p>Final Score: {metadata.playerScores.join(' - ')}</p>
            <button onClick={handleNewGame} style={{ padding: '15px 30px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '16px' }}>
              Play Again
            </button>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error('DotsAndBoxes - Error rendering component:', error);
    return (
      <div style={{ padding: '2rem', background: 'red', color: 'white', minHeight: '100vh' }}>
        <h1>Error Rendering Game</h1>
        <p>Error: {error instanceof Error ? error.message : String(error)}</p>
        <p>Stack: {error instanceof Error ? error.stack : 'No stack trace'}</p>
        <button onClick={() => navigate('/games')} style={{ padding: '10px 20px', background: 'white', color: 'black', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>
          Back to Games
        </button>
      </div>
    );
  }
};

export default DotsAndBoxesGameDualSystem;