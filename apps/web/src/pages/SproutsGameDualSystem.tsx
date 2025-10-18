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
import type { GameState, Player, AIDifficulty } from '@gpg/shared';
import { SproutsEngine, SproutsAI, SproutsGame } from '@gpg/sprouts';
import type { SproutsMetadata, SproutsMove } from '@gpg/sprouts';
import { 
  DualSystemProvider, 
  TruePaperLayout, 
  PlayerDisplay
} from '@gpg/framework';

interface GameConfig {
  gameMode: 'human-vs-human' | 'human-vs-ai';
  player1Name: string;
  player2Name: string;
  aiDifficulty: AIDifficulty;
  initialPoints: 3 | 4 | 5;
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

// Enhanced Game Controls Component
const SproutsGameControls: React.FC<{
  gameConfig: GameConfig;
  gameStats: GameStats;
  gameState: GameState | null;
  isThinking: boolean;
  canGetHint: boolean;
  lastAIThinkTime: number;
  onBackToGames: () => void;
  onNewGame: () => void;
  onGetHint: () => void;
}> = ({
  gameConfig,
  gameStats,
  gameState,
  isThinking,
  canGetHint,
  lastAIThinkTime,
  onBackToGames,
  onNewGame,
  onGetHint,
}) => {
  const metadata = gameState?.metadata as unknown as SproutsMetadata | undefined;

  // Game status display
  const getGameStatus = () => {
    if (!gameState || !metadata) return 'Setting up game...';

    if (metadata.gamePhase === 'finished') {
      const winner = metadata.winner;
      if (winner) {
        const winnerName = gameState.players.find(p => p.id === winner)?.name || 'Unknown';
        return `🎉 ${winnerName} wins!`;
      }
      return '🤝 Game ended in a draw!';
    }

    const currentPlayer = gameState.players[gameState.currentPlayer];
    if (isThinking && currentPlayer.isAI) {
      return '🤖 AI is thinking...';
    }

    return `${currentPlayer.name}'s turn`;
  };

  const getTurnInfo = () => {
    if (!metadata) return '';
    
    const availablePoints = metadata.points.filter(p => p.connections.length < 3).length;
    const movesRemaining = metadata.legalMovesRemaining;
    
    return `${availablePoints} points available • ${movesRemaining} moves remaining`;
  };

  return (
    <div className="space-y-4">
      {/* PRIMARY STATUS - Game State */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        {/* Game Status */}
        <div className="flex-1">
          <div className="text-lg font-bold text-gray-900">{getGameStatus()}</div>
          <div className="text-sm text-gray-600">{getTurnInfo()}</div>
        </div>

        {/* Action Buttons */}
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

      {/* SECONDARY CONTROLS - Game Tools + Stats */}
      <div
        className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 
                      pt-4 border-t border-gray-200"
      >
        {/* Game Tools */}
        <div className="flex items-center gap-6">
          {/* Hint Button */}
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

          {/* Game Info */}
          <div className="text-sm text-gray-500">
            {gameConfig.initialPoints} starting points • Level {gameConfig.aiDifficulty} AI
          </div>
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
const SproutsGameDualSystem: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Get game config from navigation state
  const gameConfig = location.state?.gameConfig as GameConfig;

  // Redirect to setup if no config
  useEffect(() => {
    if (!gameConfig) {
      navigate('/games/sprouts');
    }
  }, [gameConfig, navigate]);

  // Game state management
  const engine = useMemo(() => new SproutsEngine(), []);
  const ai = useMemo(() => new SproutsAI(), []);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [gameHistory, setGameHistory] = useState<GameState[]>([]);
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
  const [hintMove, setHintMove] = useState<SproutsMove | null>(null);

  // Initialize game
  const initializeGame = useCallback(() => {
    if (!gameConfig) return;

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

    const settings = {
      gameType: 'sprouts' as const,
      playerCount: 2,
      enableAI: gameConfig.gameMode === 'human-vs-ai',
      difficulty: gameConfig.aiDifficulty,
      initialPointCount: gameConfig.initialPoints,
    };

    const initialResult = engine.createInitialState(settings, players);

    if (initialResult.success) {
      setGameState(initialResult.data);
      setGameHistory([initialResult.data]);
      setHintMove(null);
      setGameStats(prev => ({
        ...prev,
        movesPlayed: 0,
        gameStartTime: Date.now(),
        isDraw: false,
      }));
    } else {
      console.error('Failed to initialize game:', initialResult.error);
    }
  }, [gameConfig, engine]);

  // Initialize on mount
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  // Handle move
  const handleMove = useCallback(
    async (move: SproutsMove) => {
      console.log('handleMove called with:', move);
      
      if (!gameState || isThinking) {
        console.log('Early return - gameState:', !!gameState, 'isThinking:', isThinking);
        return;
      }

      const currentPlayer = gameState.players[gameState.currentPlayer];
      console.log('Current player:', currentPlayer);
      console.log('Game mode:', gameConfig.gameMode);

      // Validate move
      const validation = engine.validateMove(gameState, move, currentPlayer.id);
      if (!validation.isValid) {
        console.warn('Invalid move:', validation.error);
        return;
      }

      console.log('Move validated successfully');

      // Apply move
      const moveResult = engine.applyMove(gameState, move);
      if (!moveResult.success) {
        console.error('Move failed:', 'error' in moveResult ? moveResult.error : 'Unknown error');
        return;
      }

      console.log('Move applied successfully');
      const newGameState = moveResult.data;
      console.log('New game state current player index:', newGameState.currentPlayer);
      console.log('Next player:', newGameState.players[newGameState.currentPlayer]);
      
      setGameState(newGameState);
      setGameHistory(prev => [...prev, newGameState]);
      setGameStats(prev => ({ ...prev, movesPlayed: prev.movesPlayed + 1 }));
      setHintMove(null); // Clear any hint

      // Handle game end
      const metadata = newGameState.metadata as unknown as SproutsMetadata;
      if (metadata.gamePhase === 'finished') {
        console.log('Game finished, winner:', metadata.winner);
        const winner = metadata.winner;
        const gameDuration = Date.now() - gameStats.gameStartTime;
        
        setGameStats(prev => ({
          ...prev,
          winner,
          isDraw: !winner,
          lastGameDuration: gameDuration,
          gamesPlayed: prev.gamesPlayed + 1,
          playerWins: winner === 'player1' ? prev.playerWins + 1 : prev.playerWins,
          aiWins: winner === 'player2' ? prev.aiWins + 1 : prev.aiWins,
          draws: !winner ? prev.draws + 1 : prev.draws,
        }));
      }
      // Handle AI turn
      else if (gameConfig.gameMode === 'human-vs-ai' && newGameState.players[newGameState.currentPlayer].isAI) {
        console.log('AI turn detected - starting AI move generation...');
        setIsThinking(true);
        const aiStartTime = Date.now();
        const aiPlayer = newGameState.players[newGameState.currentPlayer];
        
        console.log('AI player info:', { id: aiPlayer.id, name: aiPlayer.name, isAI: aiPlayer.isAI });

        try {
          console.log('Calling AI.getMove...');
          const aiMoveResult = await ai.getMove(newGameState, gameConfig.aiDifficulty, aiPlayer.id);
          const aiThinkTime = Date.now() - aiStartTime;
          console.log('AI move result:', aiMoveResult);
          setLastAIThinkTime(aiThinkTime);

          if (aiMoveResult.success) {
            console.log('AI move successful, applying with delay...');
            const aiMove = aiMoveResult.data as SproutsMove;
            
            // Add slight delay for better UX, then apply the AI move directly
            setTimeout(() => {
              console.log('Applying AI move:', aiMove);
              setIsThinking(false);
              
              // Validate AI move
              const aiValidation = engine.validateMove(newGameState, aiMove, aiPlayer.id);
              if (!aiValidation.isValid) {
                console.error('AI generated invalid move:', aiValidation.error);
                return;
              }

              // Apply AI move directly (non-recursively)
              const aiMoveResult = engine.applyMove(newGameState, aiMove);
              if (!aiMoveResult.success) {
                console.error('AI move application failed:', 'error' in aiMoveResult ? aiMoveResult.error : 'Unknown error');
                return;
              }

              console.log('AI move applied successfully');
              const finalGameState = aiMoveResult.data;
              setGameState(finalGameState);
              setGameHistory(prev => [...prev, finalGameState]);
              setGameStats(prev => ({ ...prev, movesPlayed: prev.movesPlayed + 1 }));
              
              // Check if game ended after AI move
              const finalMetadata = finalGameState.metadata as unknown as SproutsMetadata;
              if (finalMetadata.gamePhase === 'finished') {
                console.log('Game finished after AI move, winner:', finalMetadata.winner);
                const winner = finalMetadata.winner;
                const gameDuration = Date.now() - gameStats.gameStartTime;
                
                setGameStats(prev => ({
                  ...prev,
                  winner,
                  isDraw: !winner,
                  lastGameDuration: gameDuration,
                  gamesPlayed: prev.gamesPlayed + 1,
                  playerWins: winner === 'player1' ? prev.playerWins + 1 : prev.playerWins,
                  aiWins: winner === 'player2' ? prev.aiWins + 1 : prev.aiWins,
                  draws: !winner ? prev.draws + 1 : prev.draws,
                }));
              }
            }, Math.max(500, aiThinkTime)); // Minimum 500ms thinking time
          } else {
            console.error('AI move failed:', aiMoveResult.error);
            setIsThinking(false);
            
            // Check if this is a resignation due to no valid moves
            if (aiMoveResult.error?.message === 'AI move generation failed: AI_RESIGN') {
              console.log('AI is resigning due to no valid moves available');
              
              // Trigger AI resignation
              const humanPlayer = newGameState.players.find(p => !p.isAI);
              if (humanPlayer) {
                console.log('AI resigns, human player wins:', humanPlayer.name);
                
                setGameStats(prev => ({
                  ...prev,
                  winner: humanPlayer.id,
                  gamesPlayed: prev.gamesPlayed + 1,
                  playerWins: humanPlayer.id === 'player1' ? prev.playerWins + 1 : prev.playerWins,
                  aiWins: humanPlayer.id === 'player2' ? prev.aiWins + 1 : prev.aiWins,
                }));
                
                // Create a finished game state with human as winner
                const metadata = newGameState.metadata as unknown as SproutsMetadata;
                const resignedGameState: GameState = {
                  ...newGameState,
                  metadata: {
                    ...metadata,
                    gamePhase: 'finished' as const,
                    winner: humanPlayer.id,
                  } as unknown as Record<string, unknown>,
                };
                
                setGameState(resignedGameState);
              }
            }
          }
        } catch (error) {
          console.error('AI error:', error);
          setIsThinking(false);
          
          // Check if this is a resignation error
          if ((error as Error)?.message === 'AI_RESIGN') {
            console.log('AI is resigning due to no valid moves available');
            
            // Trigger AI resignation
            const humanPlayer = newGameState.players.find(p => !p.isAI);
            if (humanPlayer) {
              console.log('AI resigns, human player wins:', humanPlayer.name);
              
              setGameStats(prev => ({
                ...prev,
                winner: humanPlayer.id,
                gamesPlayed: prev.gamesPlayed + 1,
                playerWins: humanPlayer.id === 'player1' ? prev.playerWins + 1 : prev.playerWins,
                aiWins: humanPlayer.id === 'player2' ? prev.aiWins + 1 : prev.aiWins,
              }));
              
              // Create a finished game state with human as winner
              const metadata = newGameState.metadata as unknown as SproutsMetadata;
              const resignedGameState: GameState = {
                ...newGameState,
                metadata: {
                  ...metadata,
                  gamePhase: 'finished' as const,
                  winner: humanPlayer.id,
                } as unknown as Record<string, unknown>,
              };
              
              setGameState(resignedGameState);
            }
          }
        }
      }
    },
    [gameState, gameStats.gameStartTime, gameConfig, engine, ai, isThinking]
  );

  // Handle hint request
  const handleGetHint = useCallback(async () => {
    if (!gameState || isThinking) return;

    const currentPlayer = gameState.players[gameState.currentPlayer];
    if (currentPlayer.isAI) return; // No hints during AI turn

    try {
      setIsThinking(true);
      const hintResult = await ai.getHint(gameState, currentPlayer.id);
      setIsThinking(false);

      if (hintResult) {
        setHintMove(hintResult.suggestion as SproutsMove);
        // Clear hint after 5 seconds
        setTimeout(() => setHintMove(null), 5000);
      } else {
        console.warn('Failed to get hint');
      }
    } catch (error) {
      console.error('Hint error:', error);
      setIsThinking(false);
    }
  }, [gameState, ai, isThinking]);

  // Handle undo (if needed)
  const handleUndo = useCallback(() => {
    if (gameHistory.length <= 1) return;
    
    const previousState = gameHistory[gameHistory.length - 2];
    setGameState(previousState);
    setGameHistory(prev => prev.slice(0, -1));
    setHintMove(null);
  }, [gameHistory]);

  // Handle resign
  const handleResign = useCallback(() => {
    if (!gameState) return;
    
    const opponent = gameState.players[1 - gameState.currentPlayer];
    
    setGameStats(prev => ({
      ...prev,
      winner: opponent.id,
      gamesPlayed: prev.gamesPlayed + 1,
      playerWins: opponent.id === 'player1' ? prev.playerWins + 1 : prev.playerWins,
      aiWins: opponent.id === 'player2' ? prev.aiWins + 1 : prev.aiWins,
    }));
    
    // Create a finished game state
    const metadata = gameState.metadata as unknown as SproutsMetadata;
    const finishedGameState: GameState = {
      ...gameState,
      metadata: {
        ...metadata,
        gamePhase: 'finished',
        winner: opponent.id,
      },
    };
    
    setGameState(finishedGameState);
  }, [gameState]);

  // Handle new game
  const handleNewGame = useCallback(() => {
    initializeGame();
  }, [initializeGame]);

  // Handle back to games
  const handleBackToGames = useCallback(() => {
    navigate('/games');
  }, [navigate]);

  // Determine if we can get hints
  const canGetHint = useMemo(() => {
    if (!gameState) return false;
    
    const currentPlayer = gameState.players[gameState.currentPlayer];
    const metadata = gameState.metadata as unknown as SproutsMetadata;
    
    return !currentPlayer.isAI && metadata.gamePhase === 'playing' && !isThinking;
  }, [gameState, isThinking]);

  // Don't render if no config
  if (!gameConfig) {
    return <div>Redirecting...</div>;
  }

  // Don't render if no game state
  if (!gameState) {
    return <div className="flex items-center justify-center h-64">Loading game...</div>;
  }

  const currentPlayer = gameState.players[gameState.currentPlayer];
  const isMyTurn = !currentPlayer.isAI && !isThinking;

  // GameContent component that has access to DualSystem context
  const GameContent: React.FC = () => {
    const metadata = gameState.metadata as unknown as SproutsMetadata;

    const getGameStatus = () => {
      if (metadata.gamePhase === 'finished') {
        const winner = metadata.winner;
        if (winner) {
          const winnerName = gameState.players.find(p => p.id === winner)?.name || 'Unknown';
          return `🎉 ${winnerName} wins!`;
        }
        return '🤝 Game ended in a draw!';
      }

      const currentPlayer = gameState.players[gameState.currentPlayer];
      if (isThinking && currentPlayer.isAI) {
        return '🤖 AI is thinking...';
      }

      return `${currentPlayer.name}'s turn`;
    };

    const isGameOver = metadata.gamePhase === 'finished';

    return (
      <TruePaperLayout
        header={
          <div className="bg-white border-b border-gray-200 p-6">
            <div className="max-w-4xl mx-auto">
              <SproutsGameControls
                gameConfig={gameConfig}
                gameStats={gameStats}
                gameState={gameState}
                isThinking={isThinking}
                canGetHint={canGetHint}
                lastAIThinkTime={lastAIThinkTime}
                onBackToGames={handleBackToGames}
                onNewGame={handleNewGame}
                onGetHint={handleGetHint}
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
                  <div className="text-xs text-center mt-1 text-gray-500">
                    {gameStats.playerWins} wins
                  </div>
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
                  <div className="text-xs text-center mt-1 text-gray-500">
                    {gameStats.aiWins} wins
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

              {/* Game Rules Helper */}
              <div className="mt-4 text-center">
                <div className="text-xs text-gray-500 space-x-4">
                  <span>• Draw curves between points</span>
                  <span>• Max 3 connections per point</span>
                  <span>• No crossing curves</span>
                </div>
              </div>
            </div>
          </div>
        }
        paper={
          <div className="flex-1 bg-gray-100 p-8 flex flex-col items-center justify-center min-h-96">
            {/* Game Status */}
            <div className="mb-8 text-center">
              <div className="text-xl font-semibold text-gray-700">
                {getGameStatus()}
              </div>
              {!isGameOver && metadata && (
                <div className="text-sm text-gray-500 mt-1">
                  {metadata.points.filter(p => p.connections.length < 3).length} points available • 
                  {metadata.legalMovesRemaining} moves remaining
                </div>
              )}
            </div>

            {/* Enhanced Paper Game Area with Subtle Grid */}
            <div className="framework-paper-sheet">
              <div
                className="graph-paper shadow-lg"
                style={{
                  width: '900px',
                  height: '850px', // Increased to match larger game container
                  transform: 'rotate(-0.1deg)',
                  background: 'var(--paper-white, #fefcf8)',
                  backgroundImage: `
                    linear-gradient(var(--grid-light-blue, rgba(59, 130, 246, 0.15)) 1px, transparent 1px),
                    linear-gradient(90deg, var(--grid-light-blue, rgba(59, 130, 246, 0.15)) 1px, transparent 1px)
                  `,
                  backgroundSize: '40px 40px',
                  backgroundPosition: '0px 0px',
                  position: 'relative',
                  borderRadius: '4px',
                }}
              >
                {/* Canvas Game Container */}
                <div
                  style={{
                    position: 'absolute',
                    left: '50px',
                    top: '25px',
                    width: '800px',
                    height: '800px', // Increased height to accommodate visual controls
                    borderRadius: '4px',
                    overflow: 'visible', // Allow visual controls to be visible
                  }}
                >
                  <SproutsGame
                    gameState={gameState}
                    currentPlayer={currentPlayer}
                    isMyTurn={isMyTurn}
                    onMove={(move) => handleMove(move as SproutsMove)}
                    onUndo={gameHistory.length > 1 ? handleUndo : undefined}
                    onResign={handleResign}
                    settings={{ 
                      gameType: 'sprouts' as const, 
                      playerCount: 2,
                      enableAI: gameConfig.gameMode === 'human-vs-ai',
                      difficulty: gameConfig.aiDifficulty,
                    }}
                  />
                </div>
                
                {/* Hint display overlay */}
                {hintMove && (
                  <div 
                    className="absolute bottom-4 left-1/2 transform -translate-x-1/2"
                    style={{
                      background: 'rgba(59, 130, 246, 0.1)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '6px',
                      padding: '8px 16px',
                    }}
                  >
                    <div className="text-sm text-blue-800">
                      💡 <strong>Hint:</strong> Try connecting points for a strategic advantage!
                    </div>
                  </div>
                )}
              </div>
            </div>
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
          paperRotation: 0.1,
          gridSize: 40,
          showGridAnimation: false, // Subtle background for freeform drawing
          symbolAnimationDuration: 400,
          gridAnimationDelay: [0],
          showImperfections: false, // Clean for freeform curves
          roughnessIntensity: 0.3,
        },
        layout: { type: 'header-footer', responsive: true },
      }}
    >
      <GameContent />
    </DualSystemProvider>
  );
};

export default SproutsGameDualSystem;