/**
 * @fileoverview Main exports for the Graph Paper Games shared package
 *
 * This package contains all the shared types, interfaces, and utilities
 * that are used across the framework, games, and applications.
 */

// Export all types and interfaces
export * from './types';

// Export game engine interfaces and utilities
export * from './game-engine';

// Export utility functions (exclude ok/err to avoid conflicts)
export {
  // Grid utilities
  createGrid,
  getCellAt,
  updateCell,
  getNeighbors,
  coordinatesEqual,
  manhattanDistance,
  euclideanDistance,
  // Player utilities
  findPlayer,
  getNextPlayer,
  isPlayerTurn,
  // Move utilities
  generateMoveId,
  createMove,
  getLastMove,
  getMovesByPlayer,
  // Game state utilities
  generateGameId,
  cloneGameState,
  // Result utilities (aliased to avoid conflicts)
  mapResult,
  flatMapResult,
  // Validation utilities
  isValidCoordinate,
  validatePlayer,
  // Array utilities
  shuffle,
  randomElement,
  arraysEqual,
  // Result utilities with different names to avoid conflicts
  ok as createOk,
  err as createErr,
} from './utils';

// Re-export commonly used types with shorter names for convenience
export type {
  GridCoordinate as Coordinate,
  GridCell as Cell,
  ValidationResult as Validation,
} from './types';

export type {
  GameEngineAPI as GameEngine,
  GameModule as Game,
  GameProps as GameComponentProps,
} from './game-engine';
