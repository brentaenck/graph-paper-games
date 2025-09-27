/**
 * @fileoverview Unit tests for Tic-Tac-Toe AI implementation
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import type { GameSettings, Player, GameState } from '@gpg/shared';
import { TicTacToeEngine } from '../src/engine';
import { TicTacToeAI } from '../src/ai';
import { createMove, createEmptyBoard, applyMoveToBoard } from '../src/utils';
import type { TicTacToeMetadata, BoardState } from '../src/types';

describe('TicTacToeAI', () => {
  let ai: TicTacToeAI;
  let engine: TicTacToeEngine;
  let gameSettings: GameSettings;
  let players: Player[];
  let initialState: GameState;

  beforeEach(() => {
    ai = new TicTacToeAI();
    engine = new TicTacToeEngine();
    
    gameSettings = {
      gameType: 'tic-tac-toe',
      playerCount: 2,
      enableAI: true,
      difficulty: 3
    };

    players = [
      {
        id: 'human',
        name: 'Human Player',
        isAI: false,
        score: 0,
        isActive: true
      },
      {
        id: 'ai-player',
        name: 'AI Player',
        isAI: true,
        difficulty: 3,
        score: 0,
        isActive: true
      }
    ];

    const result = engine.createInitialState(gameSettings, players);
    if (!result.success) throw new Error('Failed to create initial state');
    initialState = result.data;
  });

  describe('getMove', () => {
    it('should generate a valid move for each difficulty level', async () => {
      // Create a state where it's the AI's turn
      const aiTurnState = {
        ...initialState,
        currentPlayer: 1 // AI's turn
      };
      
      for (let difficulty = 1; difficulty <= 6; difficulty++) {
        const result = await ai.getMove(aiTurnState, difficulty as any, 'ai-player');
        
        expect(result.success).toBe(true);
        if (!result.success) continue;

        const move = result.data as any;
        expect(move.type).toBe('place');
        expect(move.playerId).toBe('ai-player');
        expect(move.data.symbol).toBe('O'); // AI is second player
        expect(move.data.position.x).toBeGreaterThanOrEqual(0);
        expect(move.data.position.x).toBeLessThan(3);
        expect(move.data.position.y).toBeGreaterThanOrEqual(0);
        expect(move.data.position.y).toBeLessThan(3);
      }
    });

    it('should fail when not AI player turn', async () => {
      // In initialState, it's the human's turn (currentPlayer: 0)
      // Ask AI to make a move as 'ai-player' when it's not AI's turn
      const result = await ai.getMove(initialState, 3, 'ai-player');
      
      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error.code).toBe('NOT_YOUR_TURN');
    });

    it('should fail when no moves available', async () => {
      // Create a full board state
      const fullBoard: BoardState = [
        ['X', 'O', 'X'],
        ['O', 'X', 'O'],
        ['O', 'X', 'O']
      ];

      const fullBoardState = {
        ...initialState,
        currentPlayer: 1, // AI's turn
        metadata: {
          boardState: fullBoard,
          isDraw: true,
          moveHistory: [],
          lastMove: undefined
        } as unknown as Record<string, unknown>
      };

      const result = await ai.getMove(fullBoardState, 3, 'ai-player');
      
      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error.code).toBe('INVALID_GAME_STATE');
    });

    it('should handle invalid difficulty level', async () => {
      // Create a state where it's the AI's turn
      const aiTurnState = {
        ...initialState,
        currentPlayer: 1 // AI's turn
      };
      
      const result = await ai.getMove(aiTurnState, 10 as any, 'ai-player');
      
      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error.code).toBe('AI_ERROR');
    });
  });

  describe('Difficulty Level 1: Random', () => {
    it('should make random moves', async () => {
      const moves = new Set();
      const testRuns = 20;

      // Make the AI's turn
      const humanMoveState = engine.applyMove(
        initialState, 
        createMove({ x: 1, y: 1 }, 'X', 'human')
      );
      if (!humanMoveState.success) throw new Error('Failed to apply human move');

      for (let i = 0; i < testRuns; i++) {
        const result = await ai.getMove(humanMoveState.data, 1, 'ai-player');
        expect(result.success).toBe(true);
        
        if (result.success) {
          const move = result.data as any;
          const posKey = `${move.data.position.x},${move.data.position.y}`;
          moves.add(posKey);
        }
      }

      // Should have some variety in moves (not always the same)
      expect(moves.size).toBeGreaterThan(1);
    });
  });

  describe('Difficulty Level 2: Defensive', () => {
    it('should block obvious wins', async () => {
      // Set up a state where human can win
      const testBoard: BoardState = [
        ['X', 'X', null],
        ['O', null, null],
        [null, null, null]
      ];

      const testState = {
        ...initialState,
        currentPlayer: 1, // AI's turn
        metadata: {
          boardState: testBoard,
          isDraw: false,
          moveHistory: [],
          lastMove: undefined
        } as unknown as Record<string, unknown>
      };

      const result = await ai.getMove(testState, 2, 'ai-player');
      expect(result.success).toBe(true);
      
      if (result.success) {
        const move = result.data as any;
        // Should block at (2,0) to prevent human win
        expect(move.data.position).toEqual({ x: 2, y: 0 });
      }
    });
  });

  describe('Difficulty Level 3: Basic Strategy', () => {
    it('should take winning moves when available', async () => {
      // Set up a state where AI can win
      const testBoard: BoardState = [
        ['O', 'O', null],
        ['X', 'X', null],
        [null, null, null]
      ];

      const testState = {
        ...initialState,
        currentPlayer: 1, // AI's turn
        metadata: {
          boardState: testBoard,
          isDraw: false,
          moveHistory: [],
          lastMove: undefined
        } as unknown as Record<string, unknown>
      };

      const result = await ai.getMove(testState, 3, 'ai-player');
      expect(result.success).toBe(true);
      
      if (result.success) {
        const move = result.data as any;
        // Should take winning move at (2,0)
        expect(move.data.position).toEqual({ x: 2, y: 0 });
      }
    });

    it('should block opponent wins', async () => {
      // Set up a state where human can win but AI should block
      const testBoard: BoardState = [
        ['X', 'X', null],
        ['O', null, null],
        [null, null, null]
      ];

      const testState = {
        ...initialState,
        currentPlayer: 1, // AI's turn
        metadata: {
          boardState: testBoard,
          isDraw: false,
          moveHistory: [],
          lastMove: undefined
        } as unknown as Record<string, unknown>
      };

      const result = await ai.getMove(testState, 3, 'ai-player');
      expect(result.success).toBe(true);
      
      if (result.success) {
        const move = result.data as any;
        // Should block at (2,0)
        expect(move.data.position).toEqual({ x: 2, y: 0 });
      }
    });

    it('should prefer center when no immediate threats', async () => {
      // Set up an early game state
      const testBoard: BoardState = [
        ['X', null, null],
        [null, null, null],
        [null, null, null]
      ];

      const testState = {
        ...initialState,
        currentPlayer: 1, // AI's turn
        metadata: {
          boardState: testBoard,
          isDraw: false,
          moveHistory: [],
          lastMove: undefined
        } as unknown as Record<string, unknown>
      };

      const result = await ai.getMove(testState, 3, 'ai-player');
      expect(result.success).toBe(true);
      
      if (result.success) {
        const move = result.data as any;
        // Should take center
        expect(move.data.position).toEqual({ x: 1, y: 1 });
      }
    });
  });

  describe('Difficulty Levels 4-6: Minimax', () => {
    it('should never lose when playing optimally (Level 6)', async () => {
      // Test multiple games to ensure AI never loses
      const testRuns = 5;
      let aiLosses = 0;

      for (let run = 0; run < testRuns; run++) {
        let currentState = initialState;
        let gameOver = false;
        let moveCount = 0;
        const maxMoves = 9;

        while (!gameOver && moveCount < maxMoves) {
          const currentPlayer = currentState.players[currentState.currentPlayer];
          
          if (currentPlayer.isAI) {
            // AI move with perfect play
            const aiMoveResult = await ai.getMove(currentState, 6, currentPlayer.id);
            expect(aiMoveResult.success).toBe(true);
            
            if (aiMoveResult.success) {
              const newStateResult = engine.applyMove(currentState, aiMoveResult.data);
              expect(newStateResult.success).toBe(true);
              if (newStateResult.success) {
                currentState = newStateResult.data;
              }
            }
          } else {
            // Human makes random legal moves
            const legalMoves = engine.getLegalMoves(currentState, currentPlayer.id);
            if (legalMoves.length > 0) {
              const randomMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
              const newStateResult = engine.applyMove(currentState, randomMove);
              if (newStateResult.success) {
                currentState = newStateResult.data;
              }
            }
          }

          const terminal = engine.isTerminal(currentState);
          if (terminal) {
            gameOver = true;
            if (terminal.winner === 'human') {
              aiLosses++;
            }
          }
          
          moveCount++;
        }
      }

      // AI should never lose at perfect play
      expect(aiLosses).toBe(0);
    });

    it('should evaluate positions correctly', () => {
      // Test position evaluation on different board states
      const winningBoard: BoardState = [
        ['O', 'O', 'O'],
        ['X', 'X', null],
        [null, null, null]
      ];

      const winningState = {
        ...initialState,
        metadata: {
          boardState: winningBoard,
          isDraw: false,
          moveHistory: [],
          lastMove: undefined
        } as unknown as Record<string, unknown>
      };

      const evaluation = ai.evaluatePosition(winningState, 'ai-player');
      expect(evaluation).toBeGreaterThan(50); // Should be a very positive evaluation
    });

    it('should use time limits appropriately', async () => {
      // Create a state where it's the AI's turn
      const aiTurnState = {
        ...initialState,
        currentPlayer: 1 // AI's turn
      };
      
      const startTime = performance.now();
      const result = await ai.getMove(aiTurnState, 6, 'ai-player', 100); // 100ms limit
      const elapsed = performance.now() - startTime;

      expect(result.success).toBe(true);
      expect(elapsed).toBeLessThan(150); // Should respect time limit with some buffer
    });
  });

  describe('getHint', () => {
    it('should provide helpful hints', async () => {
      // Set up a state where there's a good move available
      const testBoard: BoardState = [
        ['X', null, null],
        [null, 'O', null],
        [null, null, null]
      ];

      const testState = {
        ...initialState,
        metadata: {
          boardState: testBoard,
          isDraw: false,
          moveHistory: [],
          lastMove: undefined
        } as unknown as Record<string, unknown>
      };

      const hint = await ai.getHint(testState, 'human');

      expect(hint).not.toBeNull();
      if (hint) {
        expect(hint.suggestion.type).toBe('place');
        expect(hint.explanation).toBeTruthy();
        expect(hint.confidence).toBeGreaterThan(0);
        expect(hint.confidence).toBeLessThanOrEqual(1);
      }
    });

    it('should return null on error', async () => {
      // Test with invalid state
      const invalidState = { ...initialState, metadata: null as any };
      const hint = await ai.getHint(invalidState, 'human');
      expect(hint).toBeNull();
    });
  });

  describe('Performance and Caching', () => {
    it('should cache results effectively', async () => {
      const testState = {
        ...initialState,
        currentPlayer: 1
      };

      // Make several moves with the same state
      const results = [];
      const startTime = performance.now();

      for (let i = 0; i < 5; i++) {
        const result = await ai.getMove(testState, 4, 'ai-player');
        results.push(result);
      }

      const elapsed = performance.now() - startTime;
      const stats = ai.getStats();

      // All results should be successful
      results.forEach(result => expect(result.success).toBe(true));

      // Should have some cache hits after first calculation
      expect(stats.cacheHits).toBeGreaterThan(0);
      expect(stats.hitRate).toBeGreaterThan(0);
    });

    it('should clear cache when requested', () => {
      ai.clearCache();
      const stats = ai.getStats();
      
      expect(stats.cacheSize).toBe(0);
      expect(stats.cacheHits).toBe(0);
      expect(stats.cacheMisses).toBe(0);
      expect(stats.totalEvaluations).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle near-full boards', async () => {
      // Set up a nearly full board
      const nearFullBoard: BoardState = [
        ['X', 'O', 'X'],
        ['O', 'X', 'O'],
        ['O', null, null]
      ];

      const testState = {
        ...initialState,
        currentPlayer: 1, // AI's turn
        metadata: {
          boardState: nearFullBoard,
          isDraw: false,
          moveHistory: [],
          lastMove: undefined
        } as unknown as Record<string, unknown>
      };

      const result = await ai.getMove(testState, 6, 'ai-player');
      expect(result.success).toBe(true);
      
      if (result.success) {
        const move = result.data as any;
        // Should choose one of the two remaining positions
        const validPositions = [{ x: 1, y: 2 }, { x: 2, y: 2 }];
        expect(validPositions).toContainEqual(move.data.position);
      }
    });

    it('should handle corrupted game state gracefully', async () => {
      const corruptedState = {
        ...initialState,
        currentPlayer: 1, // AI's turn
        metadata: { boardState: 'invalid' } as any
      };

      const result = await ai.getMove(corruptedState, 3, 'ai-player');
      expect(result.success).toBe(false);
      if (!result.success) {
        // The AI will try to get empty positions and fail, resulting in AI_ERROR or INVALID_GAME_STATE
        expect(['AI_ERROR', 'INVALID_GAME_STATE']).toContain(result.error.code);
      }
    });
  });
});