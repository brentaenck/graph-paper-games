/**
 * @fileoverview Core types and interfaces for the Graph Paper Games framework
 */

// ============================================================================
// Grid System Types
// ============================================================================

/**
 * Standardized coordinate system for all grid-based games
 */
export interface GridCoordinate {
  readonly x: number;
  readonly y: number;
}

/**
 * Supported grid types for different games
 */
export type GridType = 'square' | 'hexagonal' | 'triangular';

/**
 * Cell state representation
 */
export type CellState = 'empty' | 'occupied' | 'highlighted' | 'disabled';

/**
 * Grid cell with coordinate and state information
 */
export interface GridCell {
  readonly coordinate: GridCoordinate;
  readonly state: CellState;
  readonly owner?: string;
  readonly metadata?: Record<string, unknown>;
}

/**
 * Grid configuration and structure
 */
export interface Grid {
  readonly width: number;
  readonly height: number;
  readonly cells: readonly (readonly GridCell[])[];
  readonly type: GridType;
}

// ============================================================================
// Player System Types
// ============================================================================

/**
 * Player identification and reference
 */
export interface PlayerRef {
  readonly id: string;
  readonly name: string;
  readonly color?: string;
  readonly avatar?: string;
}

/**
 * Player with extended information
 */
export interface Player extends PlayerRef {
  readonly isAI: boolean;
  readonly difficulty?: number; // 1-6 for AI players
  readonly score: number;
  readonly isActive: boolean;
}

/**
 * Player score information
 */
export interface PlayerScore {
  readonly playerId: string;
  readonly score: number;
  readonly rank: number;
}

/**
 * Scoreboard for game results
 */
export interface Scoreboard {
  readonly players: readonly PlayerScore[];
  readonly winner?: string;
  readonly isDraw: boolean;
}

// ============================================================================
// Game Move and State Types
// ============================================================================

/**
 * Base move interface - extended by specific games
 */
export interface Move {
  readonly id: string;
  readonly playerId: string;
  readonly timestamp: Date;
  readonly type: string;
  readonly data: Record<string, unknown>;
}

/**
 * Move validation result
 */
export interface ValidationResult {
  readonly isValid: boolean;
  readonly error?: string;
  readonly code?: string;
}

/**
 * Game state interface
 */
export interface GameState {
  readonly id: string;
  readonly currentPlayer: number;
  readonly players: readonly Player[];
  readonly grid?: Grid;
  readonly moves: readonly Move[];
  readonly turnNumber: number;
  readonly metadata: Record<string, unknown>;
}

/**
 * Game over result
 */
export interface GameOver {
  readonly isGameOver: true;
  readonly winner?: string;
  readonly reason: 'victory' | 'draw' | 'forfeit' | 'timeout';
  readonly finalScores: Scoreboard;
}

// ============================================================================
// Game Configuration Types
// ============================================================================

/**
 * Game settings and configuration
 */
export interface GameSettings {
  readonly gameType: string;
  readonly playerCount: number;
  readonly timeLimit?: number; // seconds per move
  readonly enableAI: boolean;
  readonly difficulty?: number; // 1-6
  readonly gridSize?: {
    readonly width: number;
    readonly height: number;
  };
  readonly customRules?: Record<string, unknown>;
}

/**
 * Game capabilities and metadata
 */
export interface GameCapabilities {
  readonly grid: GridType;
  readonly minPlayers: number;
  readonly maxPlayers: number;
  readonly supportsAI: boolean;
  readonly supportsOnline: boolean;
  readonly supportsLocal: boolean;
  readonly estimatedDuration: number; // minutes
}

// ============================================================================
// AI System Types
// ============================================================================

/**
 * AI difficulty levels (1-6)
 */
export type AIDifficulty = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * AI hint for training mode
 */
export interface Hint {
  readonly suggestion: Move;
  readonly explanation: string;
  readonly confidence: number; // 0-1
}

/**
 * AI move evaluation
 */
export interface MoveEvaluation {
  readonly move: Move;
  readonly score: number;
  readonly depth: number;
  readonly principalVariation?: readonly Move[];
}

// ============================================================================
// Event System Types
// ============================================================================

/**
 * Base event interface
 */
export interface GameEvent {
  readonly type: string;
  readonly timestamp: Date;
  readonly data: Record<string, unknown>;
}

/**
 * Event listener function
 */
export type EventListener<T extends GameEvent = GameEvent> = (event: T) => void;

// ============================================================================
// Error Types
// ============================================================================

/**
 * Game-specific error types
 */
export type GameErrorCode =
  | 'INVALID_MOVE'
  | 'GAME_OVER'
  | 'NOT_YOUR_TURN'
  | 'PLAYER_NOT_FOUND'
  | 'INVALID_GAME_STATE'
  | 'NETWORK_ERROR'
  | 'AI_ERROR'
  | 'TIMEOUT';

/**
 * Game error with context
 */
export interface GameError {
  readonly code: GameErrorCode;
  readonly message: string;
  readonly context?: Record<string, unknown>;
}

// ============================================================================
// Result Types (for error handling)
// ============================================================================

/**
 * Success result
 */
export interface Ok<T> {
  readonly success: true;
  readonly data: T;
}

/**
 * Error result
 */
export interface Err<E = GameError> {
  readonly success: false;
  readonly error: E;
}

/**
 * Result type for error handling
 */
export type Result<T, E = GameError> = Ok<T> | Err<E>;

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Make all properties optional recursively
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Make all properties required recursively
 */
export type DeepRequired<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequired<T[P]> : T[P];
};

/**
 * Extract keys of T that are of type U
 */
export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];