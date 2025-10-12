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
 * @fileoverview Unit tests for Tic-Tac-Toe game engine
 */

import { describe, it, expect, beforeEach } from 'vitest';
import type { GameSettings, Player, GameState } from '@gpg/shared';
import { TicTacToeEngine } from '../src/engine';
import { createMove, getPlayerSymbol } from '../src/utils';
import type { TicTacToeMetadata } from '../src/types';

describe('TicTacToeEngine', () => {
  let engine: TicTacToeEngine;
  let gameSettings: GameSettings;
  let players: Player[];

  beforeEach(() => {
    engine = new TicTacToeEngine();

    gameSettings = {
      gameType: 'tic-tac-toe',
      playerCount: 2,
      enableAI: false,
    };

    players = [
      {
        id: 'player1',
        name: 'Player 1',
        isAI: false,
        score: 0,
        isActive: true,
      },
      {
        id: 'player2',
        name: 'Player 2',
        isAI: false,
        score: 0,
        isActive: true,
      },
    ];
  });

  describe('createInitialState', () => {
    it('should create a valid initial game state', () => {
      const result = engine.createInitialState(gameSettings, players);

      expect(result.success).toBe(true);
      if (!result.success) return;

      const state = result.data;
      expect(state.currentPlayer).toBe(0); // X goes first
      expect(state.players).toHaveLength(2);
      expect(state.turnNumber).toBe(1);
      expect(state.moves).toHaveLength(0);
      expect(state.grid?.width).toBe(3);
      expect(state.grid?.height).toBe(3);
      expect(state.grid?.type).toBe('square');

      const metadata = state.metadata as TicTacToeMetadata;
      expect(metadata.boardState).toEqual([
        [null, null, null],
        [null, null, null],
        [null, null, null],
      ]);
      expect(metadata.isDraw).toBe(false);
      expect(metadata.moveHistory).toHaveLength(0);
      expect(metadata.winner).toBeUndefined();
      expect(metadata.winningLine).toBeUndefined();
    });

    it('should fail with invalid game type', () => {
      const invalidSettings = { ...gameSettings, gameType: 'chess' };
      const result = engine.createInitialState(invalidSettings, players);

      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error.code).toBe('INVALID_GAME_STATE');
    });

    it('should fail with wrong number of players', () => {
      const result = engine.createInitialState(gameSettings, [players[0]]);

      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error.code).toBe('INVALID_GAME_STATE');
      expect(result.error.message).toContain('exactly 2 players');
    });
  });

  describe('validateMove', () => {
    let initialState: GameState;

    beforeEach(() => {
      const result = engine.createInitialState(gameSettings, players);
      if (!result.success) throw new Error('Failed to create initial state');
      initialState = result.data;
    });

    it('should validate a valid move', () => {
      const move = createMove({ x: 1, y: 1 }, 'X', 'player1');
      const validation = engine.validateMove(initialState, move, 'player1');

      expect(validation.isValid).toBe(true);
    });

    it('should reject wrong player turn', () => {
      const move = createMove({ x: 1, y: 1 }, 'O', 'player2');
      const validation = engine.validateMove(initialState, move, 'player2');

      expect(validation.isValid).toBe(false);
      expect(validation.code).toBe('NOT_YOUR_TURN');
    });

    it('should reject invalid move type', () => {
      const invalidMove = {
        id: 'test-move',
        playerId: 'player1',
        timestamp: new Date(),
        type: 'invalid',
        data: {},
      };

      const validation = engine.validateMove(initialState, invalidMove as any, 'player1');

      expect(validation.isValid).toBe(false);
      expect(validation.code).toBe('INVALID_MOVE');
    });

    it('should reject out of bounds position', () => {
      const move = createMove({ x: 5, y: 5 }, 'X', 'player1');
      const validation = engine.validateMove(initialState, move, 'player1');

      expect(validation.isValid).toBe(false);
      expect(validation.code).toBe('INVALID_MOVE');
      expect(validation.error).toContain('out of bounds');
    });

    it('should reject occupied position', () => {
      // First, apply a valid move
      const firstMove = createMove({ x: 1, y: 1 }, 'X', 'player1');
      const stateResult = engine.applyMove(initialState, firstMove);
      if (!stateResult.success) throw new Error('Failed to apply move');

      // Try to move to the same position
      const secondMove = createMove({ x: 1, y: 1 }, 'O', 'player2');
      const validation = engine.validateMove(stateResult.data, secondMove, 'player2');

      expect(validation.isValid).toBe(false);
      expect(validation.code).toBe('INVALID_MOVE');
      expect(validation.error).toContain('occupied');
    });

    it('should reject wrong symbol for player', () => {
      const move = createMove({ x: 1, y: 1 }, 'O', 'player1'); // Player 1 should be X
      const validation = engine.validateMove(initialState, move, 'player1');

      expect(validation.isValid).toBe(false);
      expect(validation.code).toBe('INVALID_MOVE');
      expect(validation.error).toContain('Expected symbol');
    });
  });

  describe('applyMove', () => {
    let initialState: GameState;

    beforeEach(() => {
      const result = engine.createInitialState(gameSettings, players);
      if (!result.success) throw new Error('Failed to create initial state');
      initialState = result.data;
    });

    it('should apply a valid move and update state', () => {
      const move = createMove({ x: 1, y: 1 }, 'X', 'player1');
      const result = engine.applyMove(initialState, move);

      expect(result.success).toBe(true);
      if (!result.success) return;

      const newState = result.data;
      expect(newState.currentPlayer).toBe(1); // Switch to player 2
      expect(newState.turnNumber).toBe(2);
      expect(newState.moves).toHaveLength(1);

      const metadata = newState.metadata as TicTacToeMetadata;
      expect(metadata.boardState[1][1]).toBe('X');
      expect(metadata.lastMove).toEqual(move);
      expect(metadata.moveHistory).toHaveLength(1);
    });

    it('should detect a winning move', () => {
      // Create a state with X about to win
      let state = initialState;

      // X: (0,0), (0,1) - one move away from winning top row
      const moves = [
        createMove({ x: 0, y: 0 }, 'X', 'player1'),
        createMove({ x: 1, y: 1 }, 'O', 'player2'),
        createMove({ x: 0, y: 1 }, 'X', 'player1'),
        createMove({ x: 2, y: 2 }, 'O', 'player2'),
      ];

      // Apply moves
      for (const move of moves) {
        const result = engine.applyMove(state, move);
        if (!result.success) throw new Error('Failed to apply move');
        state = result.data;
      }

      // Winning move
      const winningMove = createMove({ x: 0, y: 2 }, 'X', 'player1');
      const result = engine.applyMove(state, winningMove);

      expect(result.success).toBe(true);
      if (!result.success) return;

      const finalState = result.data;
      const metadata = finalState.metadata as TicTacToeMetadata;
      expect(metadata.winner).toBe('X');
      expect(metadata.winningLine).toBeDefined();
      expect(metadata.winningLine?.type).toBe('vertical');
    });

    it('should detect a draw', () => {
      // Create a drawn game state
      let state = initialState;

      const drawMoves = [
        createMove({ x: 0, y: 0 }, 'X', 'player1'), // X
        createMove({ x: 1, y: 1 }, 'O', 'player2'), // O
        createMove({ x: 2, y: 2 }, 'X', 'player1'), // X
        createMove({ x: 0, y: 1 }, 'O', 'player2'), // O
        createMove({ x: 0, y: 2 }, 'X', 'player1'), // X
        createMove({ x: 2, y: 0 }, 'O', 'player2'), // O
        createMove({ x: 1, y: 0 }, 'X', 'player1'), // X
        createMove({ x: 1, y: 2 }, 'O', 'player2'), // O
        createMove({ x: 2, y: 1 }, 'X', 'player1'), // X - final move, draw
      ];

      // Apply all moves
      for (const move of drawMoves) {
        const result = engine.applyMove(state, move);
        if (!result.success) throw new Error('Failed to apply move');
        state = result.data;
      }

      const metadata = state.metadata as TicTacToeMetadata;
      expect(metadata.isDraw).toBe(true);
      expect(metadata.winner).toBeUndefined();
    });
  });

  describe('isTerminal', () => {
    let initialState: GameState;

    beforeEach(() => {
      const result = engine.createInitialState(gameSettings, players);
      if (!result.success) throw new Error('Failed to create initial state');
      initialState = result.data;
    });

    it('should return null for ongoing game', () => {
      const terminal = engine.isTerminal(initialState);
      expect(terminal).toBeNull();
    });

    it('should detect victory', () => {
      // Create winning state
      let state = initialState;
      const moves = [
        createMove({ x: 0, y: 0 }, 'X', 'player1'),
        createMove({ x: 1, y: 0 }, 'O', 'player2'),
        createMove({ x: 0, y: 1 }, 'X', 'player1'),
        createMove({ x: 1, y: 1 }, 'O', 'player2'),
        createMove({ x: 0, y: 2 }, 'X', 'player1'), // X wins
      ];

      for (const move of moves) {
        const result = engine.applyMove(state, move);
        if (!result.success) throw new Error('Failed to apply move');
        state = result.data;
      }

      const terminal = engine.isTerminal(state);
      expect(terminal).not.toBeNull();
      expect(terminal?.isGameOver).toBe(true);
      expect(terminal?.reason).toBe('victory');
      expect(terminal?.winner).toBe('player1');
    });
  });

  describe('getLegalMoves', () => {
    let initialState: GameState;

    beforeEach(() => {
      const result = engine.createInitialState(gameSettings, players);
      if (!result.success) throw new Error('Failed to create initial state');
      initialState = result.data;
    });

    it('should return all 9 positions for empty board', () => {
      const moves = engine.getLegalMoves(initialState, 'player1');
      expect(moves).toHaveLength(9);

      // Check all positions are covered
      const positions = moves.map(m => (m as any).data.position);
      for (let x = 0; x < 3; x++) {
        for (let y = 0; y < 3; y++) {
          expect(positions).toContainEqual({ x, y });
        }
      }
    });

    it('should return empty for wrong player turn', () => {
      const moves = engine.getLegalMoves(initialState, 'player2');
      expect(moves).toHaveLength(0);
    });

    it('should return reduced moves after some moves are played', () => {
      const firstMove = createMove({ x: 1, y: 1 }, 'X', 'player1');
      const result = engine.applyMove(initialState, firstMove);
      if (!result.success) throw new Error('Failed to apply move');

      const moves = engine.getLegalMoves(result.data, 'player2');
      expect(moves).toHaveLength(8); // 9 - 1 occupied
    });
  });

  describe('getAnnotations', () => {
    it('should return empty annotations for initial state', () => {
      const result = engine.createInitialState(gameSettings, players);
      if (!result.success) throw new Error('Failed to create initial state');

      const annotations = engine.getAnnotations(result.data);
      expect(annotations).toHaveLength(0);
    });

    it('should return last move annotation', () => {
      const result = engine.createInitialState(gameSettings, players);
      if (!result.success) throw new Error('Failed to create initial state');

      const move = createMove({ x: 1, y: 1 }, 'X', 'player1');
      const stateResult = engine.applyMove(result.data, move);
      if (!stateResult.success) throw new Error('Failed to apply move');

      const annotations = engine.getAnnotations(stateResult.data);
      expect(annotations).toHaveLength(1);
      expect(annotations[0].type).toBe('highlight');
      expect(annotations[0].coordinates).toContainEqual({ x: 1, y: 1 });
    });
  });

  describe('serializeState and deserializeState', () => {
    it('should serialize and deserialize state correctly', () => {
      const result = engine.createInitialState(gameSettings, players);
      if (!result.success) throw new Error('Failed to create initial state');

      const serialized = engine.serializeState(result.data);
      expect(typeof serialized).toBe('string');

      const deserializedResult = engine.deserializeState(serialized);
      expect(deserializedResult.success).toBe(true);

      if (!deserializedResult.success) return;

      const deserializedState = deserializedResult.data;
      expect(deserializedState.id).toBe(result.data.id);
      expect(deserializedState.currentPlayer).toBe(result.data.currentPlayer);
      expect(deserializedState.turnNumber).toBe(result.data.turnNumber);
      expect(deserializedState.players).toEqual(result.data.players);
    });
  });
});