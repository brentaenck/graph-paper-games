/**
 * @fileoverview Game Engine API interface - must be implemented by all games
 */

import type {
  GameState,
  GameSettings,
  Move,
  Player,
  ValidationResult,
  GameOver,
  Scoreboard,
  Result,
  Hint,
  AIDifficulty,
} from './types';

/**
 * Core game engine interface that all games must implement
 * This provides the standardized API for game logic across all games
 */
export interface GameEngineAPI {
  // ============================================================================
  // Game Lifecycle Methods
  // ============================================================================

  /**
   * Create the initial game state
   * @param settings - Game configuration and settings
   * @param players - Array of players participating in the game
   * @returns Initial game state
   */
  createInitialState(settings: GameSettings, players: readonly Player[]): Result<GameState>;

  /**
   * Validate a move before applying it
   * @param state - Current game state
   * @param move - Proposed move
   * @param playerId - ID of the player making the move
   * @returns Validation result with success/error information
   */
  validateMove(state: GameState, move: Move, playerId: string): ValidationResult;

  /**
   * Apply a validated move to the game state
   * @param state - Current game state
   * @param move - Valid move to apply
   * @returns New game state after applying the move
   */
  applyMove(state: GameState, move: Move): Result<GameState>;

  /**
   * Check if the game has ended
   * @param state - Current game state
   * @returns Game over information if ended, null if still in progress
   */
  isTerminal(state: GameState): GameOver | null;

  /**
   * Calculate current scores for all players
   * @param state - Current game state
   * @returns Scoreboard with player scores and rankings
   */
  evaluate(state: GameState): Scoreboard;

  // ============================================================================
  // Optional Helper Methods
  // ============================================================================

  /**
   * Get all legal moves for a player (optional - used for AI and hints)
   * @param state - Current game state
   * @param playerId - Player to get moves for
   * @returns Array of valid moves, or undefined if not implemented
   */
  getLegalMoves?(state: GameState, playerId: string): readonly Move[];

  /**
   * Generate annotations for the current state (optional - for UI overlays)
   * @param state - Current game state
   * @returns Array of annotations for rendering
   */
  getAnnotations?(state: GameState): readonly GameAnnotation[];

  /**
   * Get a hint for the current player (optional - for training mode)
   * @param state - Current game state
   * @param playerId - Player to get hint for
   * @returns Hint suggestion or null if none available
   */
  getHint?(state: GameState, playerId: string): Hint | null;

  /**
   * Serialize game state for storage/transmission (optional)
   * @param state - Game state to serialize
   * @returns Serialized state string
   */
  serializeState?(state: GameState): string;

  /**
   * Deserialize game state from storage/transmission (optional)
   * @param serialized - Serialized state string
   * @returns Deserialized game state
   */
  deserializeState?(serialized: string): Result<GameState>;
}

/**
 * AI interface that games can implement for computer opponents
 */
export interface GameAI {
  /**
   * Generate an AI move for the given game state
   * @param state - Current game state
   * @param difficulty - AI difficulty level (1-6)
   * @param playerId - ID of the AI player
   * @param timeLimit - Maximum time to think (milliseconds)
   * @returns AI-generated move
   */
  getMove(
    state: GameState,
    difficulty: AIDifficulty,
    playerId: string,
    timeLimit?: number
  ): Promise<Result<Move>>;

  /**
   * Get a hint for human players (optional)
   * @param state - Current game state
   * @param playerId - Player to get hint for
   * @returns Hint suggestion or null
   */
  getHint?(state: GameState, playerId: string): Promise<Hint | null>;

  /**
   * Evaluate a position for the AI (optional - for debugging/analysis)
   * @param state - Game state to evaluate
   * @param playerId - Player perspective for evaluation
   * @returns Evaluation score (positive = good for player)
   */
  evaluatePosition?(state: GameState, playerId: string): number;
}

/**
 * Game module interface - complete game package
 */
export interface GameModule {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly categories: readonly string[];
  readonly capabilities: import('./types').GameCapabilities;
  readonly assets?: readonly string[];

  // Core implementations
  readonly engine: GameEngineAPI;
  readonly ai?: GameAI;

  // React component for rendering the game
  readonly component: import('react').ComponentType<GameProps>;
}

/**
 * Props passed to game components
 */
export interface GameProps {
  readonly gameState: GameState;
  readonly currentPlayer: Player;
  readonly isMyTurn: boolean;
  readonly onMove: (move: Move) => void;
  readonly onUndo?: () => void;
  readonly onResign?: () => void;
  readonly settings: GameSettings;
}

/**
 * Annotation for UI overlays (highlights, arrows, etc.)
 */
export interface GameAnnotation {
  readonly type: 'highlight' | 'arrow' | 'text' | 'area';
  readonly coordinates: readonly import('./types').GridCoordinate[];
  readonly color?: string;
  readonly text?: string;
  readonly style?: 'solid' | 'dashed' | 'dotted';
}

// ============================================================================
// Utility Functions for Game Engines
// ============================================================================

/**
 * Create a successful result
 */
export function ok<T>(data: T): Result<T> {
  return { success: true, data };
}

/**
 * Create an error result
 */
export function err<E = import('./types').GameError>(error: E): Result<never, E> {
  return { success: false, error };
}

/**
 * Type guard to check if result is successful
 */
export function isOk<T, E>(result: Result<T, E>): result is import('./types').Ok<T> {
  return result.success === true;
}

/**
 * Type guard to check if result is an error
 */
export function isErr<T, E>(result: Result<T, E>): result is import('./types').Err<E> {
  return result.success === false;
}