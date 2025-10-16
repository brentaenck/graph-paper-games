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

import { describe, it, expect, beforeEach } from 'vitest';
import { SproutsEngine, createSproutsMove } from '../src/engine';
import type { GameSettings, Player } from '@gpg/shared';
import type { SproutsMetadata } from '../src/types';

describe('SproutsEngine', () => {
  let engine: SproutsEngine;
  let players: Player[];
  let settings: GameSettings;

  beforeEach(() => {
    engine = new SproutsEngine();
    players = [
      { id: 'player1', name: 'Player 1', color: 'blue', avatar: '', isAI: false, difficulty: undefined, score: 0, isActive: true },
      { id: 'player2', name: 'Player 2', color: 'red', avatar: '', isAI: false, difficulty: undefined, score: 0, isActive: true },
    ];
    settings = {
      gameType: 'sprouts',
      playerCount: 2,
      enableAI: false,
      gridSize: { width: 3, height: 3 }, // 3 starting points
    };
  });

  describe('Initial State Creation', () => {
    it('should create valid initial state', () => {
      const result = engine.createInitialState(settings, players);
      
      expect(result.success).toBe(true);
      if (result.success) {
        const state = result.data;
        expect(state.id).toBeDefined();
        expect(state.currentPlayer).toBe(0);
        expect(state.players).toEqual(players);
        expect(state.moves).toEqual([]);
        expect(state.turnNumber).toBe(0);
        expect(state.metadata).toBeDefined();

        const metadata = state.metadata as SproutsMetadata;
        expect(metadata.points).toHaveLength(3);
        expect(metadata.curves).toHaveLength(0);
        expect(metadata.gamePhase).toBe('playing');
        expect(metadata.moveHistory).toEqual([]);

        // Each initial point should have no connections
        for (const point of metadata.points) {
          expect(point.connections).toEqual([]);
          expect(point.createdAtMove).toBe(0);
        }
      }
    });

    it('should reject invalid player count', () => {
      const invalidSettings = { ...settings, playerCount: 1 };
      const result = engine.createInitialState(invalidSettings, [players[0]]);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('exactly 2 players');
      }
    });

    it('should reject invalid point count', () => {
      const invalidSettings = { ...settings, gridSize: { width: 10, height: 10 } };
      const result = engine.createInitialState(invalidSettings, players);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('Number of points must be between');
      }
    });
  });

  describe('Move Validation', () => {
    it('should validate legal moves', () => {
      const stateResult = engine.createInitialState(settings, players);
      expect(stateResult.success).toBe(true);
      
      if (stateResult.success) {
        const state = stateResult.data;
        const metadata = state.metadata as SproutsMetadata;
        
        const move = createSproutsMove(
          'player1',
          metadata.points[0].id,
          metadata.points[1].id,
          [
            { x: metadata.points[0].x, y: metadata.points[0].y },
            { x: metadata.points[1].x, y: metadata.points[1].y }
          ],
          {
            x: (metadata.points[0].x + metadata.points[1].x) / 2,
            y: (metadata.points[0].y + metadata.points[1].y) / 2
          }
        );

        const validation = engine.validateMove(state, move, 'player1');
        expect(validation.isValid).toBe(true);
      }
    });

    it('should reject moves from wrong player', () => {
      const stateResult = engine.createInitialState(settings, players);
      expect(stateResult.success).toBe(true);
      
      if (stateResult.success) {
        const state = stateResult.data;
        const metadata = state.metadata as SproutsMetadata;
        
        const move = createSproutsMove(
          'player2', // Wrong player
          metadata.points[0].id,
          metadata.points[1].id,
          [
            { x: metadata.points[0].x, y: metadata.points[0].y },
            { x: metadata.points[1].x, y: metadata.points[1].y }
          ],
          {
            x: (metadata.points[0].x + metadata.points[1].x) / 2,
            y: (metadata.points[0].y + metadata.points[1].y) / 2
          }
        );

        const validation = engine.validateMove(state, move, 'player2');
        expect(validation.isValid).toBe(false);
        expect(validation.code).toBe('NOT_YOUR_TURN');
      }
    });

    it('should reject invalid move types', () => {
      const stateResult = engine.createInitialState(settings, players);
      expect(stateResult.success).toBe(true);
      
      if (stateResult.success) {
        const state = stateResult.data;
        
        const invalidMove = {
          id: 'invalid-move',
          playerId: 'player1',
          timestamp: new Date(),
          type: 'invalid-type',
          data: {}
        };

        const validation = engine.validateMove(state, invalidMove, 'player1');
        expect(validation.isValid).toBe(false);
        expect(validation.code).toBe('INVALID_MOVE');
      }
    });
  });

  describe('Move Application', () => {
    it('should apply valid moves correctly', () => {
      const stateResult = engine.createInitialState(settings, players);
      expect(stateResult.success).toBe(true);
      
      if (stateResult.success) {
        const state = stateResult.data;
        const metadata = state.metadata as SproutsMetadata;
        
        const move = createSproutsMove(
          'player1',
          metadata.points[0].id,
          metadata.points[1].id,
          [
            { x: metadata.points[0].x, y: metadata.points[0].y },
            { x: metadata.points[1].x, y: metadata.points[1].y }
          ],
          {
            x: (metadata.points[0].x + metadata.points[1].x) / 2,
            y: (metadata.points[0].y + metadata.points[1].y) / 2
          }
        );

        const result = engine.applyMove(state, move);
        expect(result.success).toBe(true);
        
        if (result.success) {
          const newState = result.data;
          expect(newState.currentPlayer).toBe(1); // Should switch to player 2
          expect(newState.turnNumber).toBe(1);
          expect(newState.moves).toHaveLength(1);

          const newMetadata = newState.metadata as SproutsMetadata;
          expect(newMetadata.points).toHaveLength(4); // Original 3 + 1 new point
          expect(newMetadata.curves).toHaveLength(1);
          expect(newMetadata.moveHistory).toHaveLength(1);

          // Check that the connected points now reference the new curve
          const connectedPoints = newMetadata.points.filter(p => 
            p.id === metadata.points[0].id || p.id === metadata.points[1].id
          );
          for (const point of connectedPoints) {
            expect(point.connections).toHaveLength(1);
            expect(point.connections[0]).toBe(move.data.curveId);
          }

          // Check that the new point exists and references the curve
          const newPoint = newMetadata.points.find(p => p.id === move.data.newPointId);
          expect(newPoint).toBeDefined();
          expect(newPoint!.connections).toHaveLength(1);
          expect(newPoint!.connections[0]).toBe(move.data.curveId);
        }
      }
    });
  });

  describe('Game Termination', () => {
    it('should detect non-terminal state', () => {
      const stateResult = engine.createInitialState(settings, players);
      expect(stateResult.success).toBe(true);
      
      if (stateResult.success) {
        const state = stateResult.data;
        const gameOver = engine.isTerminal(state);
        expect(gameOver).toBeNull();
      }
    });
  });

  describe('Score Evaluation', () => {
    it('should provide correct scores for ongoing game', () => {
      const stateResult = engine.createInitialState(settings, players);
      expect(stateResult.success).toBe(true);
      
      if (stateResult.success) {
        const state = stateResult.data;
        const scoreboard = engine.evaluate(state);
        
        expect(scoreboard.players).toHaveLength(2);
        expect(scoreboard.winner).toBeUndefined();
        expect(scoreboard.isDraw).toBe(false);
        
        // In an ongoing game, all players should have score 0
        for (const playerScore of scoreboard.players) {
          expect(playerScore.score).toBe(0);
          expect(playerScore.rank).toBe(2);
        }
      }
    });
  });

  describe('Legal Move Generation', () => {
    it('should generate legal moves for current player', () => {
      const stateResult = engine.createInitialState(settings, players);
      expect(stateResult.success).toBe(true);
      
      if (stateResult.success) {
        const state = stateResult.data;
        const moves = engine.getLegalMoves!(state, 'player1');
        
        expect(moves.length).toBeGreaterThan(0);
        
        // All moves should be valid
        for (const move of moves) {
          const validation = engine.validateMove(state, move, 'player1');
          expect(validation.isValid).toBe(true);
        }
      }
    });

    it('should return empty array for wrong player', () => {
      const stateResult = engine.createInitialState(settings, players);
      expect(stateResult.success).toBe(true);
      
      if (stateResult.success) {
        const state = stateResult.data;
        const moves = engine.getLegalMoves!(state, 'player2');
        expect(moves).toHaveLength(0);
      }
    });
  });

  describe('State Serialization', () => {
    it('should serialize and deserialize state correctly', () => {
      const stateResult = engine.createInitialState(settings, players);
      expect(stateResult.success).toBe(true);
      
      if (stateResult.success) {
        const originalState = stateResult.data;
        
        const serialized = engine.serializeState!(originalState);
        expect(typeof serialized).toBe('string');
        
        const deserializeResult = engine.deserializeState!(serialized);
        expect(deserializeResult.success).toBe(true);
        
        if (deserializeResult.success) {
          const restoredState = deserializeResult.data;
          expect(restoredState.id).toBe(originalState.id);
          expect(restoredState.currentPlayer).toBe(originalState.currentPlayer);
          expect(restoredState.turnNumber).toBe(originalState.turnNumber);
          expect(restoredState.players).toEqual(originalState.players);
          
          const originalMetadata = originalState.metadata as SproutsMetadata;
          const restoredMetadata = restoredState.metadata as SproutsMetadata;
          expect(restoredMetadata.points).toEqual(originalMetadata.points);
          expect(restoredMetadata.curves).toEqual(originalMetadata.curves);
        }
      }
    });
  });
});