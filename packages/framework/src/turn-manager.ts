/**
 * @fileoverview TurnManager for handling turn-based game logic
 *
 * Manages turn transitions, timers, validation, and player state
 * with support for async operations and events.
 */

import type { GameState, Player, Move, Result, GameEngineAPI } from '@gpg/shared';
import { getNextPlayer, isPlayerTurn } from '@gpg/shared';
import { EventBus, createEvent } from './event-bus';

/**
 * Turn phase enum
 */
export type TurnPhase = 'pre-turn' | 'move' | 'post-turn' | 'ended';

/**
 * Turn timer configuration
 */
export interface TurnTimerConfig {
  readonly enabled: boolean;
  readonly timePerTurn: number; // seconds
  readonly timePerGame?: number; // seconds (optional total time limit)
  readonly increment?: number; // seconds added per move
}

/**
 * Turn manager configuration
 */
export interface TurnManagerConfig {
  readonly allowUndo: boolean;
  readonly maxUndoDepth: number;
  readonly enableTimer: boolean;
  readonly timerConfig?: TurnTimerConfig;
  readonly skipInactivePlayers: boolean;
}

/**
 * Default turn manager configuration
 */
export const defaultTurnManagerConfig: TurnManagerConfig = {
  allowUndo: true,
  maxUndoDepth: 3,
  enableTimer: false,
  skipInactivePlayers: true,
};

/**
 * Turn information interface
 */
export interface TurnInfo {
  readonly currentPlayer: Player;
  readonly playerIndex: number;
  readonly turnNumber: number;
  readonly phase: TurnPhase;
  readonly timeRemaining?: number;
  readonly canUndo: boolean;
  readonly validMoves?: readonly Move[];
}

/**
 * Turn manager class for handling turn-based game logic
 */
export class TurnManager {
  private gameEngine: GameEngineAPI;
  private config: TurnManagerConfig;
  private gameState: GameState;
  private phase: TurnPhase = 'pre-turn';
  private undoStack: GameState[] = [];
  private timer: ReturnType<typeof setTimeout> | null = null;
  private turnStartTime: Date | null = null;

  constructor(
    gameEngine: GameEngineAPI,
    initialGameState: GameState,
    config: TurnManagerConfig = defaultTurnManagerConfig
  ) {
    this.gameEngine = gameEngine;
    this.gameState = initialGameState;
    this.config = config;
  }

  /**
   * Get current turn information
   */
  getTurnInfo(): TurnInfo {
    const currentPlayer = this.gameState.players[this.gameState.currentPlayer];
    const canUndo = this.config.allowUndo && this.undoStack.length > 0;

    let validMoves: readonly Move[] | undefined;
    if (this.gameEngine.getLegalMoves) {
      validMoves = this.gameEngine.getLegalMoves(this.gameState, currentPlayer.id);
    }

    let timeRemaining: number | undefined;
    if (this.config.enableTimer && this.config.timerConfig && this.turnStartTime) {
      const elapsed = (Date.now() - this.turnStartTime.getTime()) / 1000;
      timeRemaining = Math.max(0, this.config.timerConfig.timePerTurn - elapsed);
    }

    return {
      currentPlayer,
      playerIndex: this.gameState.currentPlayer,
      turnNumber: this.gameState.turnNumber,
      phase: this.phase,
      timeRemaining,
      canUndo,
      validMoves,
    };
  }

  /**
   * Get current game state
   */
  getGameState(): GameState {
    return this.gameState;
  }

  /**
   * Start a new turn
   */
  startTurn(): void {
    this.phase = 'pre-turn';
    this.turnStartTime = new Date();

    // Skip inactive players
    if (this.config.skipInactivePlayers) {
      while (!this.gameState.players[this.gameState.currentPlayer].isActive) {
        this.nextPlayer();
      }
    }

    // Start timer if enabled
    if (this.config.enableTimer && this.config.timerConfig) {
      this.startTimer();
    }

    // Emit turn start event
    EventBus.emit(
      createEvent.gameState('game:turn-changed', {
        turnInfo: this.getTurnInfo(),
        gameState: this.gameState,
      })
    );

    this.phase = 'move';
  }

  /**
   * Attempt to make a move
   */
  async makeMove(move: Move): Promise<Result<GameState>> {
    if (this.phase !== 'move') {
      return {
        success: false,
        error: {
          code: 'INVALID_GAME_STATE',
          message: `Cannot make move during ${this.phase} phase`,
        },
      };
    }

    // Validate the move
    const validation = this.gameEngine.validateMove(this.gameState, move, move.playerId);

    if (!validation.isValid) {
      return {
        success: false,
        error: {
          code: 'INVALID_MOVE',
          message: validation.error ?? 'Invalid move',
        },
      };
    }

    // Check if it's the player's turn
    if (!isPlayerTurn(this.gameState, move.playerId)) {
      return {
        success: false,
        error: {
          code: 'NOT_YOUR_TURN',
          message: 'It is not your turn',
        },
      };
    }

    this.phase = 'post-turn';

    // Save current state for undo
    if (this.config.allowUndo) {
      this.undoStack.push({ ...this.gameState });

      // Limit undo stack size
      if (this.undoStack.length > this.config.maxUndoDepth) {
        this.undoStack.shift();
      }
    }

    // Apply the move
    const moveResult = this.gameEngine.applyMove(this.gameState, move);
    if (!moveResult.success) {
      this.phase = 'move';
      return moveResult;
    }

    this.gameState = moveResult.data;

    // Clear timer
    this.clearTimer();

    // Emit move event
    EventBus.emit(
      createEvent.gameState('game:move', {
        move,
        gameState: this.gameState,
        turnInfo: this.getTurnInfo(),
      })
    );

    // Check if game has ended
    const gameOver = this.gameEngine.isTerminal(this.gameState);
    if (gameOver) {
      this.phase = 'ended';

      EventBus.emit(
        createEvent.gameState('game:ended', {
          gameOver,
          finalState: this.gameState,
        })
      );
    } else {
      // Move to next player
      this.nextPlayer();
      this.startTurn();
    }

    // Emit state change event
    EventBus.emit(
      createEvent.gameState('game:state-changed', {
        gameState: this.gameState,
        move,
      })
    );

    return moveResult;
  }

  /**
   * Undo the last move
   */
  undoMove(): Result<GameState> {
    if (!this.config.allowUndo) {
      return {
        success: false,
        error: {
          code: 'INVALID_MOVE',
          message: 'Undo is not allowed',
        },
      };
    }

    if (this.undoStack.length === 0) {
      return {
        success: false,
        error: {
          code: 'INVALID_MOVE',
          message: 'No moves to undo',
        },
      };
    }

    const previousState = this.undoStack.pop()!;
    this.gameState = previousState;
    this.phase = 'move';

    // Clear timer and restart turn
    this.clearTimer();
    this.startTurn();

    return { success: true, data: this.gameState };
  }

  /**
   * Skip current player's turn
   */
  skipTurn(): void {
    this.clearTimer();
    this.nextPlayer();
    this.startTurn();
  }

  /**
   * Force end the current turn (timeout)
   */
  forceEndTurn(): void {
    this.clearTimer();

    // Emit timeout event
    EventBus.emit(
      createEvent.system('system:warning', {
        message: 'Turn timed out',
        playerId: this.gameState.players[this.gameState.currentPlayer].id,
      })
    );

    this.nextPlayer();
    this.startTurn();
  }

  /**
   * Get available moves for current player
   */
  getValidMoves(): readonly Move[] | null {
    if (!this.gameEngine.getLegalMoves) {
      return null;
    }

    const currentPlayer = this.gameState.players[this.gameState.currentPlayer];
    return this.gameEngine.getLegalMoves(this.gameState, currentPlayer.id);
  }

  /**
   * Check if the game has ended
   */
  isGameOver(): boolean {
    return this.phase === 'ended' || this.gameEngine.isTerminal(this.gameState) !== null;
  }

  /**
   * Reset the turn manager with a new game state
   */
  reset(newGameState: GameState): void {
    this.gameState = newGameState;
    this.phase = 'pre-turn';
    this.undoStack = [];
    this.clearTimer();
    this.turnStartTime = null;
  }

  /**
   * Dispose of the turn manager (cleanup)
   */
  dispose(): void {
    this.clearTimer();
  }

  /**
   * Move to the next player
   */
  private nextPlayer(): void {
    const nextPlayerIndex = getNextPlayer(this.gameState.players, this.gameState.currentPlayer);

    this.gameState = {
      ...this.gameState,
      currentPlayer: nextPlayerIndex,
      turnNumber: this.gameState.turnNumber + 1,
    };
  }

  /**
   * Start the turn timer
   */
  private startTimer(): void {
    if (!this.config.timerConfig) return;

    this.timer = setTimeout(() => {
      this.forceEndTurn();
    }, this.config.timerConfig.timePerTurn * 1000);
  }

  /**
   * Clear the turn timer
   */
  private clearTimer(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
}

/**
 * React hook for using TurnManager in components
 */
export function useTurnManager(
  gameEngine: GameEngineAPI,
  initialGameState: GameState,
  config?: TurnManagerConfig
): {
  turnManager: TurnManager;
  turnInfo: TurnInfo;
  gameState: GameState;
  makeMove: (move: Move) => Promise<Result<GameState>>;
  undoMove: () => Result<GameState>;
  skipTurn: () => void;
} {
  const [turnManager] = React.useState(() => new TurnManager(gameEngine, initialGameState, config));
  const [turnInfo, setTurnInfo] = React.useState(() => turnManager.getTurnInfo());
  const [gameState, setGameState] = React.useState(() => turnManager.getGameState());

  // Update turn info when game state changes
  React.useEffect(() => {
    const unsubscribe = EventBus.subscribe('game:*', () => {
      setTurnInfo(turnManager.getTurnInfo());
      setGameState(turnManager.getGameState());
    });

    return unsubscribe;
  }, [turnManager]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => turnManager.dispose();
  }, [turnManager]);

  const makeMove = React.useCallback((move: Move) => turnManager.makeMove(move), [turnManager]);

  const undoMove = React.useCallback(() => turnManager.undoMove(), [turnManager]);

  const skipTurn = React.useCallback(() => turnManager.skipTurn(), [turnManager]);

  return {
    turnManager,
    turnInfo,
    gameState,
    makeMove,
    undoMove,
    skipTurn,
  };
}

// Import React for the hook
import * as React from 'react';
