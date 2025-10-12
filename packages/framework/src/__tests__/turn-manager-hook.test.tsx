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
 * @fileoverview Tests for useTurnManager React hook
 */

import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { GameState, Player, Move, GameEngineAPI } from '@gpg/shared';
import { EventBus } from '../event-bus';
import { useTurnManager, type TurnManagerConfig } from '../turn-manager';

// Mock EventBus
vi.mock('../event-bus', () => ({
  EventBus: {
    emit: vi.fn(),
    subscribe: vi.fn(() => vi.fn()), // Return unsubscribe function
    unsubscribe: vi.fn(),
  },
  createEvent: {
    gameState: vi.fn((type: string, data: any) => ({ type, data })),
    system: vi.fn((type: string, data: any) => ({ type, data })),
  },
}));

describe('useTurnManager', () => {
  // Mock game engine
  const mockGameEngine: GameEngineAPI = {
    validateMove: vi.fn(),
    applyMove: vi.fn(),
    isTerminal: vi.fn(),
    getLegalMoves: vi.fn(),
    getWinner: vi.fn(),
    getScore: vi.fn(),
  };

  // Mock players
  const mockPlayers: Player[] = [
    { id: 'player1', name: 'Alice', isActive: true },
    { id: 'player2', name: 'Bob', isActive: true },
  ];

  // Mock initial game state
  const mockInitialGameState: GameState = {
    id: 'test-game',
    players: mockPlayers,
    currentPlayer: 0,
    turnNumber: 1,
    phase: 'playing',
    isComplete: false,
    metadata: {},
  };

  // Mock move
  const mockMove: Move = {
    playerId: 'player1',
    type: 'place',
    data: { x: 0, y: 0 },
    timestamp: new Date().toISOString(),
  };

  beforeEach(() => {
    // Reset all mocks
    vi.clearAllMocks();

    // Setup default mock return values
    (mockGameEngine.validateMove as any).mockReturnValue({ isValid: true });
    (mockGameEngine.applyMove as any).mockReturnValue({
      success: true,
      data: { ...mockInitialGameState, turnNumber: 2 },
    });
    (mockGameEngine.isTerminal as any).mockReturnValue(null);
    (mockGameEngine.getLegalMoves as any).mockReturnValue([mockMove]);
  });

  describe('Hook Initialization', () => {
    it('should initialize with correct initial state', () => {
      const { result } = renderHook(() => useTurnManager(mockGameEngine, mockInitialGameState));

      expect(result.current.turnManager).toBeDefined();
      expect(result.current.gameState).toEqual(mockInitialGameState);
      expect(result.current.turnInfo.currentPlayer).toEqual(mockPlayers[0]);
      expect(result.current.turnInfo.phase).toBe('pre-turn');
    });

    it('should initialize with custom config', () => {
      const customConfig: TurnManagerConfig = {
        allowUndo: false,
        maxUndoDepth: 1,
        enableTimer: true,
        skipInactivePlayers: false,
        timerConfig: {
          enabled: true,
          timePerTurn: 30,
        },
      };

      const { result } = renderHook(() =>
        useTurnManager(mockGameEngine, mockInitialGameState, customConfig)
      );

      expect(result.current.turnManager).toBeDefined();
      expect(result.current.turnInfo.canUndo).toBe(false);
    });
  });

  describe('Hook Event Subscription', () => {
    it('should subscribe to game events on mount', () => {
      renderHook(() => useTurnManager(mockGameEngine, mockInitialGameState));

      expect(EventBus.subscribe).toHaveBeenCalledWith('game:*', expect.any(Function));
    });

    it('should unsubscribe on unmount', () => {
      const unsubscribe = vi.fn();
      (EventBus.subscribe as any).mockReturnValue(unsubscribe);

      const { unmount } = renderHook(() => useTurnManager(mockGameEngine, mockInitialGameState));

      unmount();

      expect(unsubscribe).toHaveBeenCalled();
    });

    it('should update state when game events occur', () => {
      let eventCallback: Function | undefined;
      (EventBus.subscribe as any).mockImplementation((eventType: string, callback: Function) => {
        eventCallback = callback;
        return vi.fn();
      });

      const { result } = renderHook(() => useTurnManager(mockGameEngine, mockInitialGameState));

      // Initially in pre-turn phase
      expect(result.current.turnInfo.phase).toBe('pre-turn');

      // Start turn to change phase
      act(() => {
        result.current.turnManager.startTurn();
      });

      // Simulate event emission that should update state
      act(() => {
        if (eventCallback) {
          eventCallback();
        }
      });

      // State should be updated
      expect(result.current.turnInfo.phase).toBe('move');
    });
  });

  describe('Hook Methods', () => {
    it('should provide makeMove method', async () => {
      const { result } = renderHook(() => useTurnManager(mockGameEngine, mockInitialGameState));

      // Start turn first
      act(() => {
        result.current.turnManager.startTurn();
      });

      let moveResult: any;
      await act(async () => {
        moveResult = await result.current.makeMove(mockMove);
      });

      expect(moveResult.success).toBe(true);
      expect(mockGameEngine.validateMove).toHaveBeenCalled();
      expect(mockGameEngine.applyMove).toHaveBeenCalled();
    });

    it('should provide undoMove method', () => {
      const { result } = renderHook(() => useTurnManager(mockGameEngine, mockInitialGameState));

      act(() => {
        const undoResult = result.current.undoMove();
        expect(undoResult.success).toBe(false); // No moves to undo initially
        expect(undoResult.error?.message).toContain('No moves to undo');
      });
    });

    it('should provide skipTurn method', () => {
      const { result } = renderHook(() => useTurnManager(mockGameEngine, mockInitialGameState));

      // Verify the method exists and is callable
      expect(typeof result.current.skipTurn).toBe('function');

      act(() => {
        result.current.turnManager.startTurn();
      });

      // Should not throw when called
      expect(() => {
        act(() => {
          result.current.skipTurn();
        });
      }).not.toThrow();
    });
  });

  describe('Hook Cleanup', () => {
    it('should dispose turn manager on unmount', () => {
      const { result, unmount } = renderHook(() =>
        useTurnManager(mockGameEngine, mockInitialGameState)
      );

      const disposeSpy = vi.spyOn(result.current.turnManager, 'dispose');

      unmount();

      expect(disposeSpy).toHaveBeenCalled();
    });
  });

  describe('Hook State Updates', () => {
    it('should update turnInfo and gameState when underlying state changes', async () => {
      let eventCallback: Function | undefined;
      (EventBus.subscribe as any).mockImplementation((eventType: string, callback: Function) => {
        eventCallback = callback;
        return vi.fn();
      });

      const { result } = renderHook(() => useTurnManager(mockGameEngine, mockInitialGameState));

      // Initial state
      expect(result.current.turnInfo.turnNumber).toBe(1);
      expect(result.current.turnInfo.currentPlayer.id).toBe('player1');

      // Start turn and make a move
      act(() => {
        result.current.turnManager.startTurn();
      });

      await act(async () => {
        await result.current.makeMove(mockMove);
      });

      // Trigger the event callback to update state
      act(() => {
        if (eventCallback) {
          eventCallback();
        }
      });

      // State should be updated to reflect the move (turn number gets incremented by startTurn + makeMove)
      expect(result.current.turnInfo.turnNumber).toBe(3);
      expect(result.current.turnInfo.currentPlayer.id).toBe('player2');
    });

    it('should maintain stable callback references', () => {
      const { result, rerender } = renderHook(() =>
        useTurnManager(mockGameEngine, mockInitialGameState)
      );

      const initialMakeMove = result.current.makeMove;
      const initialUndoMove = result.current.undoMove;
      const initialSkipTurn = result.current.skipTurn;

      // Force rerender
      rerender();

      // Callback references should be stable
      expect(result.current.makeMove).toBe(initialMakeMove);
      expect(result.current.undoMove).toBe(initialUndoMove);
      expect(result.current.skipTurn).toBe(initialSkipTurn);
    });
  });

  describe('Hook Error Handling', () => {
    it('should handle invalid moves gracefully', async () => {
      (mockGameEngine.validateMove as any).mockReturnValue({
        isValid: false,
        error: 'Invalid move',
      });

      const { result } = renderHook(() => useTurnManager(mockGameEngine, mockInitialGameState));

      act(() => {
        result.current.turnManager.startTurn();
      });

      let moveResult: any;
      await act(async () => {
        moveResult = await result.current.makeMove(mockMove);
      });

      expect(moveResult.success).toBe(false);
      expect(moveResult.error?.code).toBe('INVALID_MOVE');
    });

    it('should handle game engine errors', async () => {
      (mockGameEngine.applyMove as any).mockReturnValue({
        success: false,
        error: { code: 'ENGINE_ERROR', message: 'Something went wrong' },
      });

      const { result } = renderHook(() => useTurnManager(mockGameEngine, mockInitialGameState));

      act(() => {
        result.current.turnManager.startTurn();
      });

      let moveResult: any;
      await act(async () => {
        moveResult = await result.current.makeMove(mockMove);
      });

      expect(moveResult.success).toBe(false);
      expect(moveResult.error?.code).toBe('ENGINE_ERROR');
    });
  });

  describe('Hook Integration', () => {
    it('should work with timer configuration', () => {
      const timerConfig: TurnManagerConfig = {
        allowUndo: true,
        maxUndoDepth: 3,
        enableTimer: true,
        skipInactivePlayers: true,
        timerConfig: {
          enabled: true,
          timePerTurn: 30,
        },
      };

      // Should initialize without errors with timer config
      const { result } = renderHook(() =>
        useTurnManager(mockGameEngine, mockInitialGameState, timerConfig)
      );

      expect(result.current.turnManager).toBeDefined();
      expect(result.current.turnInfo).toBeDefined();

      // Should not crash when starting turn with timer
      expect(() => {
        act(() => {
          result.current.turnManager.startTurn();
        });
      }).not.toThrow();
    });

    it('should handle game completion', async () => {
      (mockGameEngine.isTerminal as any).mockReturnValue({
        isComplete: true,
        winner: 'player1',
      });

      let eventCallback: Function | undefined;
      (EventBus.subscribe as any).mockImplementation((eventType: string, callback: Function) => {
        eventCallback = callback;
        return vi.fn();
      });

      const { result } = renderHook(() => useTurnManager(mockGameEngine, mockInitialGameState));

      act(() => {
        result.current.turnManager.startTurn();
      });

      await act(async () => {
        await result.current.makeMove(mockMove);
      });

      // Trigger event callback to update state
      act(() => {
        if (eventCallback) {
          eventCallback();
        }
      });

      // Game should be ended
      expect(result.current.turnInfo.phase).toBe('ended');
    });
  });

  describe('Hook Memory Management', () => {
    it('should not cause memory leaks with multiple rerenders', () => {
      const { result, rerender, unmount } = renderHook(() =>
        useTurnManager(mockGameEngine, mockInitialGameState)
      );

      const turnManager = result.current.turnManager;

      // Multiple rerenders
      for (let i = 0; i < 10; i++) {
        rerender();
      }

      // Should still have the same turn manager instance
      expect(result.current.turnManager).toBe(turnManager);

      // Should dispose properly
      const disposeSpy = vi.spyOn(turnManager, 'dispose');
      unmount();
      expect(disposeSpy).toHaveBeenCalled();
    });
  });
});