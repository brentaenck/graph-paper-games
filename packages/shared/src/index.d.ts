/**
 * @fileoverview Main exports for the Graph Paper Games shared package
 *
 * This package contains all the shared types, interfaces, and utilities
 * that are used across the framework, games, and applications.
 */
export * from './types';
export * from './game-engine';
export { createGrid, getCellAt, updateCell, getNeighbors, coordinatesEqual, manhattanDistance, euclideanDistance, findPlayer, getNextPlayer, isPlayerTurn, generateMoveId, createMove, getLastMove, getMovesByPlayer, generateGameId, cloneGameState, mapResult, flatMapResult, isValidCoordinate, validatePlayer, shuffle, randomElement, arraysEqual, ok as createOk, err as createErr, } from './utils';
export type { GridCoordinate as Coordinate, GridCell as Cell, ValidationResult as Validation, } from './types';
export type { GameEngineAPI as GameEngine, GameModule as Game, GameProps as GameComponentProps, } from './game-engine';
