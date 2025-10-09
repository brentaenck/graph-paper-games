/**
 * @fileoverview TicTacToeFrameworkDebug - Simplified debug version to identify issues
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { TicTacToeEngine } from '../../../../games/tic-tac-toe/src/engine';
import { TicTacToeAI } from '../../../../games/tic-tac-toe/src/ai';
import { createMove } from '../../../../games/tic-tac-toe/src/utils';
import type { GameState, Player, GameSettings, GridCoordinate } from '@gpg/shared';
import type {
  TicTacToeMove,
  TicTacToeSymbol,
  TicTacToeMetadata,
} from '../../../../games/tic-tac-toe/src/types';

type PenStyle = 'ballpoint' | 'pencil' | 'marker' | 'fountain';

// Simple GameSymbol without complex animations
const GameSymbol: React.FC<{
  symbol: TicTacToeSymbol;
  penStyle: PenStyle;
  size?: number;
}> = ({ symbol, penStyle, size = 40 }) => {
  console.log('GameSymbol rendering:', symbol, 'with pen style:', penStyle);

  const getPenStyle = () => {
    switch (penStyle) {
      case 'pencil':
        return { stroke: '#374151', strokeWidth: '2.5', opacity: '0.8' };
      case 'marker':
        return { stroke: '#1e40af', strokeWidth: '3.5', opacity: '0.85' };
      case 'fountain':
        return { stroke: '#1e3a8a', strokeWidth: '2', opacity: '0.9' };
      default: // ballpoint
        return { stroke: '#2563eb', strokeWidth: '2', opacity: '1' };
    }
  };

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {symbol === 'X' && (
        <g>
          <path
            d={`M ${size * 0.2} ${size * 0.2} L ${size * 0.8} ${size * 0.8}`}
            {...getPenStyle()}
            fill="none"
            strokeLinecap="round"
          />
          <path
            d={`M ${size * 0.8} ${size * 0.2} L ${size * 0.2} ${size * 0.8}`}
            {...getPenStyle()}
            fill="none"
            strokeLinecap="round"
          />
        </g>
      )}
      {symbol === 'O' && (
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size * 0.35}
          {...getPenStyle()}
          fill="none"
          strokeLinecap="round"
        />
      )}
    </svg>
  );
};

const TicTacToeFrameworkDebug: React.FC = () => {
  // Game engine and AI instances
  const engine = useMemo(() => {
    console.log('Creating TicTacToeEngine...');
    return new TicTacToeEngine();
  }, []);

  const ai = useMemo(() => {
    console.log('Creating TicTacToeAI...');
    return new TicTacToeAI();
  }, []);

  // Game state
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [penStyle, setPenStyle] = useState<PenStyle>('ballpoint');
  const [players] = useState<Player[]>([
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
    console.log('Initializing game...');

    const gameSettings: GameSettings = {
      gameType: 'tic-tac-toe',
      playerCount: 2,
      enableAI: true,
      difficulty: 3,
    };

    console.log('Game settings:', gameSettings);
    console.log('Players:', players);

    const result = engine.createInitialState(gameSettings, players);
    console.log('Engine createInitialState result:', result);

    if (result.success) {
      console.log('Game initialized successfully:', result.data);
      setGameState(result.data);
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
    (position: GridCoordinate) => {
      console.log('Cell clicked:', position);
      console.log('Current game state:', gameState);

      if (!gameState) {
        console.error('No game state!');
        return;
      }

      const currentPlayer = gameState.players[gameState.currentPlayer];
      console.log('Current player:', currentPlayer);

      if (currentPlayer.isAI) {
        console.log('Blocking AI player click');
        return;
      }

      try {
        // Get symbol for current player
        const symbol: TicTacToeSymbol = gameState.currentPlayer === 0 ? 'X' : 'O';
        console.log('Player symbol:', symbol);

        // Create move (position, symbol, playerId)
        const move: TicTacToeMove = createMove(position, symbol, currentPlayer.id);
        console.log('Created move:', move);

        // Validate move
        const validation = engine.validateMove(gameState, move, currentPlayer.id);
        console.log('Move validation:', validation);

        if (!validation.isValid) {
          console.warn('Invalid move:', validation.error);
          return;
        }

        // Apply move
        const result = engine.applyMove(gameState, move);
        console.log('Apply move result:', result);

        if (!result.success) {
          console.error('Failed to apply move:', result.error);
          return;
        }

        const newGameState = result.data;
        console.log('New game state after move:', newGameState);
        console.log('New metadata:', newGameState.metadata);

        setGameState(newGameState);

        // Check if it's now AI's turn
        const nextPlayer = newGameState.players[newGameState.currentPlayer];
        console.log('Next player:', nextPlayer);

        if (nextPlayer && nextPlayer.isAI) {
          console.log('🤖 AI turn detected! Making AI move...');

          // Simple timeout for AI move (just for debug)
          setTimeout(async () => {
            try {
              console.log('🤖 Calling AI.getMove...');
              const aiMoveResult = await ai.getMove(newGameState, 3, nextPlayer.id);
              console.log('🤖 AI move result:', aiMoveResult);

              if (aiMoveResult.success) {
                // The AI.getMove already returns a complete move object
                const aiMove = aiMoveResult.data;
                console.log('🤖 AI returned move:', aiMove);

                const aiResult = engine.applyMove(newGameState, aiMove);
                console.log('🤖 AI move applied:', aiResult);

                if (aiResult.success) {
                  setGameState(aiResult.data);
                  console.log('🤖 AI move complete!');
                } else {
                  console.error('🤖 Failed to apply AI move:', aiResult.error);
                }
              } else {
                console.error('🤖 AI failed to find move:', aiMoveResult.error);
              }
            } catch (error) {
              console.error('🤖 AI move error:', error);
            }
          }, 1000); // 1 second delay for AI move
        }
      } catch (error) {
        console.error('Move handling failed:', error);
      }
    },
    [gameState, engine]
  );

  // Render debug info
  if (!gameState) {
    return (
      <div className="space-y-6">
        <div className="ui-card">
          <div className="ui-card-header">
            <h1 className="ui-card-title">🐛 Debug: Game Loading...</h1>
          </div>
          <div className="ui-card-body">
            <p>Initializing game engine and state...</p>
          </div>
        </div>
      </div>
    );
  }

  const metadata = gameState.metadata as unknown as TicTacToeMetadata;
  console.log('Rendering with metadata:', metadata);

  return (
    <div className="space-y-6">
      <div className="ui-card">
        <div className="ui-card-header">
          <h1 className="ui-card-title">🐛 Framework Debug Version</h1>
        </div>
        <div className="ui-card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium mb-2">Game State Debug</h3>
              <div className="ui-text-sm space-y-1">
                <div>Turn: {gameState.turnNumber}</div>
                <div>
                  Current Player: {gameState.currentPlayer} (
                  {gameState.players[gameState.currentPlayer]?.name})
                </div>
                <div>Moves Made: {gameState.moves.length}</div>
                <div>Board State Available: {metadata?.boardState ? 'Yes' : 'No'}</div>
                {metadata?.boardState && <div>Board: {JSON.stringify(metadata.boardState)}</div>}
              </div>
            </div>
            <div>
              <label className="ui-text-sm font-medium">Pen Style:</label>
              <select
                value={penStyle}
                onChange={e => setPenStyle(e.target.value as PenStyle)}
                className="ui-input ui-text-sm ml-2"
              >
                <option value="ballpoint">Ballpoint</option>
                <option value="pencil">Pencil</option>
                <option value="marker">Marker</option>
                <option value="fountain">Fountain</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="ui-card">
        <div className="ui-card-header">
          <h2 className="ui-card-title">Game Board</h2>
        </div>
        <div className="ui-card-body">
          <div className="flex justify-center">
            <div
              className="graph-paper shadow-lg"
              style={{
                width: '300px',
                height: '300px',
                background: '#fefcf8',
                backgroundImage: `
                  linear-gradient(rgba(59, 130, 246, 0.3) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(59, 130, 246, 0.3) 1px, transparent 1px)
                `,
                backgroundSize: '20px 20px',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div className="grid grid-cols-3 gap-1" style={{ width: '180px', height: '180px' }}>
                {metadata?.boardState ? (
                  metadata.boardState.flat().map((cell, index) => {
                    const x = index % 3;
                    const y = Math.floor(index / 3);
                    const position: GridCoordinate = { x, y };

                    console.log(`Rendering cell ${index} (${x},${y}):`, cell);

                    return (
                      <button
                        key={index}
                        onClick={() => handleCellClick(position)}
                        disabled={!!cell}
                        className="flex items-center justify-center border border-gray-300 hover:bg-gray-100 transition-colors disabled:cursor-not-allowed"
                        style={{
                          width: '60px',
                          height: '60px',
                          backgroundColor: cell ? '#f3f4f6' : 'transparent',
                        }}
                      >
                        {cell && (
                          <GameSymbol
                            symbol={cell as TicTacToeSymbol}
                            penStyle={penStyle}
                            size={30}
                          />
                        )}
                      </button>
                    );
                  })
                ) : (
                  <div className="col-span-3 text-center">No board state available</div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-center">
            <button onClick={initializeGame} className="ui-button ui-button-primary">
              🔄 Reset Game
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicTacToeFrameworkDebug;
