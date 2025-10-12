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