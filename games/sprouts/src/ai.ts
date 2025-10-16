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
 * @fileoverview Sprouts AI system implementation
 */

import type {
  GameAI,
  GameState,
  Move,
  AIDifficulty,
  Result,
  Hint,
} from '@gpg/shared';

import { ok, err } from '@gpg/shared';

import type {
  SproutsPoint,
  SproutsMove,
  SproutsMetadata,
  EvaluationFactors,
  Point2D,
} from './types';

import {
  generateCurvePath,
  generateStraightLineWithPoint,
  findPointOnPath,
} from './geometry';

import {
  getValidConnectionPairs,
  countLegalMoves,
  hasLegalMoves,
  validateSproutsMove,
} from './validation';

import { createSproutsMove } from './engine';

// ============================================================================
// Sprouts AI Implementation
// ============================================================================

export class SproutsAI implements GameAI {

  /**
   * Generate an AI move for the given game state
   */
  async getMove(
    state: GameState,
    difficulty: AIDifficulty,
    playerId: string,
    _timeLimit?: number
  ): Promise<Result<Move>> {
    try {
      console.log('AI getMove called - difficulty:', difficulty, 'playerId:', playerId);
      const metadata = state.metadata as unknown as SproutsMetadata;
      if (!metadata) {
        console.error('AI: Invalid game state metadata');
        return err({ code: 'INVALID_GAME_STATE', message: 'Invalid game state metadata' });
      }

      // Check if it's actually the AI's turn
      const currentPlayer = state.players[state.currentPlayer];
      if (!currentPlayer || currentPlayer.id !== playerId) {
        console.error('AI: Not AI turn - currentPlayer:', currentPlayer?.id, 'expected:', playerId);
        return err({ code: 'NOT_YOUR_TURN', message: 'Not AI turn' });
      }

      // Check if game is over
      if (!hasLegalMoves(metadata.points, metadata.curves)) {
        console.error('AI: No legal moves available');
        return err({ code: 'GAME_OVER', message: 'No legal moves available' });
      }

      console.log('AI: Generating move for difficulty', difficulty);
      const startTime = Date.now();
      // const effectiveTimeLimit = timeLimit || 5000; // 5 second default - unused for now

      let move: SproutsMove;

      // For now, use simpler strategies to avoid infinite loops
      switch (difficulty) {
        case 1:
        case 2:
        case 3:
        case 4:
        case 5:
        case 6:
        default:
          move = await this.getRandomMove(state, playerId);
          break;
      }

      const elapsed = Date.now() - startTime;
      console.log('AI: Generated move in', elapsed, 'ms:', move);
      return ok(move);
    } catch (error) {
      console.error('AI Error:', error);
      return err({
        code: 'AI_ERROR',
        message: `AI move generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  }

  /**
   * Get a hint for human players
   */
  async getHint(state: GameState, playerId: string): Promise<Hint | null> {
    try {
      const metadata = state.metadata as unknown as SproutsMetadata;
      if (!metadata || !hasLegalMoves(metadata.points, metadata.curves)) {
        return null;
      }

      // Use random AI to generate a move for hints
      const move = await this.getRandomMove(state, playerId);
      const explanation = 'Try connecting these points for a good strategic position.';

      return {
        suggestion: move,
        explanation: explanation,
        confidence: 0.7,
      };
    } catch {
      return null;
    }
  }

  /**
   * Evaluate a position for the AI
   */
  evaluatePosition(state: GameState, playerId: string): number {
    const metadata = state.metadata as unknown as SproutsMetadata;
    if (!metadata) return 0;

    const factors = this.calculateEvaluationFactors(state, playerId);
    
    // Weight the different factors
    const weights = {
      mobility: 1.0,
      control: 0.8,
      blocking: 0.6,
      endgame: 1.2,
    };

    return (
      factors.mobility * weights.mobility +
      factors.control * weights.control +
      factors.blocking * weights.blocking +
      factors.endgame * weights.endgame
    );
  }

  // ============================================================================
  // AI Strategy Methods
  // ============================================================================

  /**
   * Level 1: Random legal moves
   */
  private async getRandomMove(state: GameState, playerId: string): Promise<SproutsMove> {
    console.log('AI: getRandomMove called');
    const metadata = state.metadata as unknown as SproutsMetadata;
    console.log('AI: metadata points:', metadata.points.length);
    
    const validPairs = getValidConnectionPairs(metadata.points);
    console.log('AI: validPairs found:', validPairs.length);
    
    if (validPairs.length === 0) {
      console.error('AI: No valid connection pairs available');
      throw new Error('No valid moves available');
    }

    // Try multiple random pairs until we find one that creates a valid move
    const maxAttempts = Math.min(validPairs.length, 20); // Don't try forever
    const triedPairs = new Set<string>();
    
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const randomIndex = Math.floor(Math.random() * validPairs.length);
      const randomPair = validPairs[randomIndex];
      const pairKey = `${randomPair[0].id}-${randomPair[1].id}`;
      
      // Skip if we've already tried this pair
      if (triedPairs.has(pairKey)) {
        continue;
      }
      triedPairs.add(pairKey);
      
      console.log('AI: Attempting pair (', attempt + 1, '/', maxAttempts, '):', randomPair[0].id, '->', randomPair[1].id);
      
      const move = this.createMoveFromPair(
        randomPair[0], 
        randomPair[1], 
        playerId,
        metadata
      );
      
      // Validate the move before returning it
      const validation = validateSproutsMove(move, metadata.points, metadata.curves);
      if (validation.isValid) {
        console.log('AI: Created valid move:', move);
        return move;
      } else {
        console.log('AI: Move invalid:', validation.error, '- trying another pair');
      }
    }
    
    // If we get here, no valid moves were found - AI should resign
    console.log('AI: Could not generate valid move after', maxAttempts, 'attempts - AI resigns');
    throw new Error('AI_RESIGN');
  }

  // Other AI difficulty methods temporarily removed for testing

  // ============================================================================
  // Helper Methods
  // ============================================================================
  
  /**
   * Create a move from a pair of points
   */
  private createMoveFromPair(
    point1: SproutsPoint, 
    point2: SproutsPoint, 
    playerId: string,
    metadata: SproutsMetadata
  ): SproutsMove {
    const startPoint = { x: point1.x, y: point1.y };
    const endPoint = { x: point2.x, y: point2.y };
    
    let curvePath: Point2D[];
    let newPointPosition: Point2D;
    
    // Check if this is a self-connection (loop)
    const isLoop = point1.id === point2.id;
    
    if (isLoop) {
      // For loops, generate a random position around the point for the AI to "click"
      const angle = Math.random() * 2 * Math.PI;
      const distance = 30 + Math.random() * 20; // Random distance from 30-50 pixels
      const aiClickPosition = {
        x: startPoint.x + distance * Math.cos(angle),
        y: startPoint.y + distance * Math.sin(angle)
      };
      
      // Use the same logic as human players for loop generation
      curvePath = generateStraightLineWithPoint(
        startPoint,
        endPoint, 
        aiClickPosition,
        metadata.points,
        metadata.curves
      );
      
      // Find the inserted new point in the curve path (same logic as human player)
      let bestPoint = aiClickPosition;
      let minDistToClick = Infinity;
      
      for (const point of curvePath) {
        // Skip the start point (should appear twice - at beginning and end)
        const distToStart = Math.sqrt((point.x - startPoint.x) ** 2 + (point.y - startPoint.y) ** 2);
        if (distToStart < 5) continue; // This is the start point, skip it
        
        // Check how close this point is to our AI's "click"
        const distToClick = Math.sqrt((point.x - aiClickPosition.x) ** 2 + (point.y - aiClickPosition.y) ** 2);
        if (distToClick < minDistToClick) {
          minDistToClick = distToClick;
          bestPoint = point;
        }
      }
      
      newPointPosition = bestPoint;
    } else {
      // For regular connections, use the old method
      curvePath = generateCurvePath(startPoint, endPoint);
      
      // Choose new point position with slight randomness
      const t = 0.4 + Math.random() * 0.2; // Between 40% and 60% along curve
      newPointPosition = findPointOnPath(curvePath, t);
    }
    
    return createSproutsMove(playerId, point1.id, point2.id, curvePath, newPointPosition);
  }


  // Strategic methods temporarily removed - using only random AI for testing

  /**
   * Calculate evaluation factors for position assessment
   */
  private calculateEvaluationFactors(state: GameState, _playerId: string): EvaluationFactors {
    const metadata = state.metadata as unknown as SproutsMetadata;
    
    // Mobility: number of available moves
    const mobility = countLegalMoves(metadata.points, metadata.curves);
    
    // Control: based on connections and point positions
    const control = metadata.points.reduce((sum, point) => {
      return sum + (3 - point.connections.length) * 2;
    }, 0);
    
    // Blocking: potential to limit opponent
    const blocking = metadata.points.reduce((sum, point) => {
      if (point.connections.length === 2) return sum + 10; // About to be exhausted
      if (point.connections.length === 1) return sum + 5;  // Half exhausted
      return sum;
    }, 0);
    
    // Endgame: advantage in final moves
    const totalConnections = metadata.points.reduce((sum, p) => sum + p.connections.length, 0);
    const maxPossibleConnections = metadata.points.length * 3;
    const endgameProgress = totalConnections / maxPossibleConnections;
    const endgame = endgameProgress > 0.7 ? mobility * 2 : mobility;

    return {
      mobility: mobility,
      control: control,
      blocking: blocking,
      endgame: endgame,
    };
  }
}
