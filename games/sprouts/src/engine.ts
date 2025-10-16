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

/**
 * @fileoverview Sprouts game engine implementation
 */

import type {
  GameEngineAPI,
  GameState,
  GameSettings,
  Move,
  Player,
  ValidationResult,
  GameOver,
  Scoreboard,
  Result,
} from '@gpg/shared';

import { ok, err } from '@gpg/shared';

import type {
  SproutsPoint,
  SproutsCurve,
  SproutsMove,
  SproutsMetadata,
  Point2D,
} from './types';

import { SPROUTS_CONSTANTS } from './types';

import { 
  generateInitialPoints,
  generateCurvePath,
  findPointOnPath,
} from './geometry';

import {
  validateSproutsMove,
  hasLegalMoves,
  countLegalMoves,
  getValidConnectionPairs,
  validateGameState,
} from './validation';

import { isSproutsMove } from './types';

// ============================================================================
// Sprouts Game Engine
// ============================================================================

export class SproutsEngine implements GameEngineAPI {
  
  // ============================================================================
  // Game Lifecycle Methods
  // ============================================================================

  /**
   * Create the initial game state for Sprouts
   */
  createInitialState(settings: GameSettings, players: readonly Player[]): Result<GameState> {
    try {
      // Validate settings
      if (players.length !== 2) {
        return err({ 
          code: 'INVALID_GAME_STATE', 
          message: 'Sprouts requires exactly 2 players' 
        });
      }

      // Determine number of starting points
      const numPoints = settings.gridSize?.width ?? SPROUTS_CONSTANTS.DEFAULT_STARTING_POINTS;
      if (numPoints < SPROUTS_CONSTANTS.MIN_POINTS_TO_START || 
          numPoints > SPROUTS_CONSTANTS.MAX_POINTS_TO_START) {
        return err({ 
          code: 'INVALID_GAME_STATE', 
          message: `Number of points must be between ${SPROUTS_CONSTANTS.MIN_POINTS_TO_START} and ${SPROUTS_CONSTANTS.MAX_POINTS_TO_START}` 
        });
      }

      // Generate initial point positions
      const canvasWidth = settings.gridSize?.width ? settings.gridSize.width * 100 : 600;
      const canvasHeight = settings.gridSize?.height ? settings.gridSize.height * 100 : 400;
      const initialPositions = generateInitialPoints(numPoints, canvasWidth, canvasHeight);

      // Create initial points
      const initialPoints: SproutsPoint[] = initialPositions.map((pos, index) => ({
        id: `point-${index}`,
        x: pos.x,
        y: pos.y,
        connections: [],
        createdAtMove: 0,
      }));

      // Create metadata
      const metadata: SproutsMetadata = {
        points: initialPoints,
        curves: [],
        legalMovesRemaining: countLegalMoves(initialPoints, []),
        gamePhase: 'playing',
        moveHistory: [],
      };

      // Create game state
      const gameState: GameState = {
        id: `sprouts-${Date.now()}`,
        currentPlayer: 0,
        players: players,
        moves: [],
        turnNumber: 0,
        metadata: metadata as unknown as Record<string, unknown>,
      };

      return ok(gameState);
    } catch (error) {
      return err({
        code: 'INVALID_GAME_STATE',
        message: `Failed to create initial state: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  }

  /**
   * Validate a move before applying it
   */
  validateMove(state: GameState, move: Move, playerId: string): ValidationResult {
    try {
      // Check if it's the player's turn
      const currentPlayerIndex = state.currentPlayer;
      const currentPlayer = state.players[currentPlayerIndex];
      if (!currentPlayer || currentPlayer.id !== playerId) {
        return { isValid: false, error: 'Not your turn', code: 'NOT_YOUR_TURN' };
      }

      // Check if game is over
      if (this.isTerminal(state)) {
        return { isValid: false, error: 'Game is over', code: 'GAME_OVER' };
      }

      // Validate move type
      if (!isSproutsMove(move)) {
        return { isValid: false, error: 'Invalid move type for Sprouts', code: 'INVALID_MOVE' };
      }

      // Get game metadata
      const metadata = state.metadata as unknown as SproutsMetadata;
      if (!metadata) {
        return { isValid: false, error: 'Invalid game state metadata', code: 'INVALID_GAME_STATE' };
      }

      // Validate the Sprouts-specific move
      return validateSproutsMove(move, metadata.points, metadata.curves);
    } catch (error) {
      return {
        isValid: false,
        error: `Move validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        code: 'VALIDATION_ERROR',
      };
    }
  }

  /**
   * Apply a validated move to the game state
   */
  applyMove(state: GameState, move: Move): Result<GameState> {
    try {
      if (!isSproutsMove(move)) {
        return err({ code: 'INVALID_MOVE', message: 'Invalid move type for Sprouts' });
      }

      const metadata = state.metadata as unknown as SproutsMetadata;
      if (!metadata) {
        return err({ code: 'INVALID_GAME_STATE', message: 'Invalid game state metadata' });
      }

      const { fromPointId, toPointId, curvePath, newPointPosition, curveId, newPointId } = move.data;

      // Create new curve
      const newCurve: SproutsCurve = {
        id: curveId,
        startPointId: fromPointId,
        endPointId: toPointId,
        controlPoints: curvePath,
        newPointId: newPointId,
        createdAtMove: state.turnNumber + 1,
      };

      // Create new point
      // A new point on a curve should have 2 connections because the curve passes through it
      // In Sprouts, when you draw a line through a point, it uses up 2 of its 3 possible connections
      const newPoint: SproutsPoint = {
        id: newPointId,
        x: newPointPosition.x,
        y: newPointPosition.y,
        connections: [curveId, curveId], // The curve uses 2 connections of the new point
        createdAtMove: state.turnNumber + 1,
      };

      // Update existing points to reference the new curve
      const isLoop = fromPointId === toPointId;
      
      const updatedPoints = metadata.points.map(point => {
        if (point.id === fromPointId) {
          if (isLoop) {
            // For loops: the same point gets 2 connections from the single curve
            return {
              ...point,
              connections: [...point.connections, curveId, curveId],
            };
          } else {
            // For regular connections: add one connection
            return {
              ...point,
              connections: [...point.connections, curveId],
            };
          }
        } else if (point.id === toPointId && !isLoop) {
          // For regular connections: add connection to the end point
          return {
            ...point,
            connections: [...point.connections, curveId],
          };
        }
        return point;
      });

      // Create updated collections
      const allPoints = [...updatedPoints, newPoint];
      const allCurves = [...metadata.curves, newCurve];

      // Validate the resulting game state
      const stateValidation = validateGameState(allPoints, allCurves);
      if (!stateValidation.isValid) {
        return err({
          code: 'INVALID_GAME_STATE',
          message: `Move would create invalid state: ${stateValidation.violations[0]?.message}`,
        });
      }

      // Check for game termination
      const isGameOver = !hasLegalMoves(allPoints, allCurves);
      const winner = isGameOver ? state.players[state.currentPlayer].id : undefined;

      // Update metadata
      const newMetadata: SproutsMetadata = {
        points: allPoints,
        curves: allCurves,
        winner: winner,
        legalMovesRemaining: countLegalMoves(allPoints, allCurves),
        gamePhase: isGameOver ? 'finished' : 'playing',
        moveHistory: [...metadata.moveHistory, move],
        lastMove: move,
      };

      // Create new game state
      const newState: GameState = {
        ...state,
        currentPlayer: (state.currentPlayer + 1) % state.players.length,
        moves: [...state.moves, move],
        turnNumber: state.turnNumber + 1,
        metadata: newMetadata as unknown as Record<string, unknown>,
      };

      return ok(newState);
    } catch (error) {
      return err({
        code: 'INVALID_GAME_STATE',
        message: `Failed to apply move: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  }

  /**
   * Check if the game has ended
   */
  isTerminal(state: GameState): GameOver | null {
    const metadata = state.metadata as unknown as SproutsMetadata;
    if (!metadata) return null;

    if (metadata.gamePhase === 'finished' || !hasLegalMoves(metadata.points, metadata.curves)) {
      // In Sprouts, the last player to move wins
      const winnerIndex = state.turnNumber > 0 ? (state.currentPlayer + 1) % 2 : 0;
      const winner = state.players[winnerIndex];

      return {
        isGameOver: true,
        winner: winner.id,
        reason: 'victory',
        finalScores: this.evaluate(state),
      };
    }

    return null;
  }

  /**
   * Calculate current scores for all players
   */
  evaluate(state: GameState): Scoreboard {
    const metadata = state.metadata as unknown as SproutsMetadata;
    const players = state.players;
    
    // Determine winner if game is over
    let winner: string | undefined;
    if (metadata?.gamePhase === 'finished' || (metadata && !hasLegalMoves(metadata.points, metadata.curves))) {
      // Last player to move wins
      const winnerIndex = state.turnNumber > 0 ? (state.currentPlayer + 1) % 2 : 0;
      winner = players[winnerIndex].id;
    }

    // Create player scores
    const playerScores = players.map((player) => ({
      playerId: player.id,
      score: winner === player.id ? 1 : 0,
      rank: winner === player.id ? 1 : 2,
    }));

    return {
      players: playerScores,
      winner: winner,
      isDraw: false, // Sprouts cannot end in a draw
    };
  }

  // ============================================================================
  // Optional Helper Methods
  // ============================================================================

  /**
   * Get all legal moves for a player
   */
  getLegalMoves(state: GameState, playerId: string): readonly Move[] {
    const metadata = state.metadata as unknown as SproutsMetadata;
    if (!metadata) return [];

    // Check if it's the player's turn
    const currentPlayer = state.players[state.currentPlayer];
    if (!currentPlayer || currentPlayer.id !== playerId) return [];

    // Check if game is over
    if (this.isTerminal(state)) return [];

    const moves: SproutsMove[] = [];
    const validPairs = getValidConnectionPairs(metadata.points);

    for (const [point1, point2] of validPairs) {
      // Generate a simple curve path between the points
      const curvePath = generateCurvePath(
        { x: point1.x, y: point1.y },
        { x: point2.x, y: point2.y }
      );

      // Find midpoint for new point placement
      const midpoint = findPointOnPath(curvePath, 0.5);

      // Create move
      const move: SproutsMove = {
        id: `move-${Date.now()}-${Math.random()}`,
        playerId: playerId,
        timestamp: new Date(),
        type: 'connect',
        data: {
          fromPointId: point1.id,
          toPointId: point2.id,
          curvePath: curvePath,
          newPointPosition: midpoint,
          curveId: `curve-${Date.now()}-${Math.random()}`,
          newPointId: `point-${Date.now()}-${Math.random()}`,
        },
      };

      // Validate the move before including it
      const validation = this.validateMove(state, move, playerId);
      if (validation.isValid) {
        moves.push(move);
      }
    }

    return moves;
  }

  /**
   * Serialize game state for storage/transmission
   */
  serializeState(state: GameState): string {
    try {
      // Create a simplified representation for serialization
      const serializable = {
        id: state.id,
        currentPlayer: state.currentPlayer,
        players: state.players,
        moves: state.moves,
        turnNumber: state.turnNumber,
        metadata: state.metadata,
      };

      return JSON.stringify(serializable);
    } catch (error) {
      throw new Error(`Failed to serialize game state: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Deserialize game state from storage/transmission
   */
  deserializeState(serialized: string): Result<GameState> {
    try {
      const parsed = JSON.parse(serialized);
      
      // Validate required fields
      if (!parsed.id || typeof parsed.currentPlayer !== 'number' || !parsed.players || !parsed.metadata) {
        return err({
          code: 'INVALID_GAME_STATE',
          message: 'Invalid serialized game state format',
        });
      }

      // Reconstruct game state
      const gameState: GameState = {
        id: parsed.id,
        currentPlayer: parsed.currentPlayer,
        players: parsed.players,
        moves: parsed.moves || [],
        turnNumber: parsed.turnNumber || 0,
        metadata: parsed.metadata,
      };

      // Validate the reconstructed state
      const metadata = gameState.metadata as unknown as SproutsMetadata;
      if (metadata) {
        const validation = validateGameState(metadata.points, metadata.curves);
        if (!validation.isValid) {
          return err({
            code: 'INVALID_GAME_STATE',
            message: `Deserialized state is invalid: ${validation.violations[0]?.message}`,
          });
        }
      }

      return ok(gameState);
    } catch (error) {
      return err({
        code: 'INVALID_GAME_STATE',
        message: `Failed to deserialize game state: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  }
}

// ============================================================================
// Utility Functions for Engine
// ============================================================================

/**
 * Create a new Sprouts move
 */
export function createSproutsMove(
  playerId: string,
  fromPointId: string,
  toPointId: string,
  curvePath: readonly Point2D[],
  newPointPosition: Point2D
): SproutsMove {
  return {
    id: `move-${Date.now()}-${Math.random()}`,
    playerId: playerId,
    timestamp: new Date(),
    type: 'connect',
    data: {
      fromPointId: fromPointId,
      toPointId: toPointId,
      curvePath: curvePath,
      newPointPosition: newPointPosition,
      curveId: `curve-${Date.now()}-${Math.random()}`,
      newPointId: `point-${Date.now()}-${Math.random()}`,
    },
  };
}

/**
 * Get game statistics from current state
 */
export function getGameStatistics(state: GameState): {
  totalPoints: number;
  totalCurves: number;
  movesPlayed: number;
  legalMovesRemaining: number;
  gamePhase: 'playing' | 'finished';
  estimatedMovesRemaining: [number, number]; // [min, max]
} {
  const metadata = state.metadata as unknown as SproutsMetadata;
  if (!metadata) {
    return {
      totalPoints: 0,
      totalCurves: 0,
      movesPlayed: 0,
      legalMovesRemaining: 0,
      gamePhase: 'finished',
      estimatedMovesRemaining: [0, 0],
    };
  }

  const initialPointCount = metadata.points.filter(p => p.createdAtMove === 0).length;
  const minPossibleMoves = SPROUTS_CONSTANTS.MIN_MOVES_FORMULA(initialPointCount);
  const maxPossibleMoves = SPROUTS_CONSTANTS.MAX_MOVES_FORMULA(initialPointCount);

  return {
    totalPoints: metadata.points.length,
    totalCurves: metadata.curves.length,
    movesPlayed: state.turnNumber,
    legalMovesRemaining: metadata.legalMovesRemaining,
    gamePhase: metadata.gamePhase,
    estimatedMovesRemaining: [
      Math.max(0, minPossibleMoves - state.turnNumber),
      Math.max(0, maxPossibleMoves - state.turnNumber),
    ],
  };
}