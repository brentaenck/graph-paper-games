/**
 * @fileoverview Utility functions for common game operations
 */
import type { GridCoordinate, GridCell, Grid, Player, Move, GameState, Result, GameError } from './types';
/**
 * Create a new grid with the specified dimensions and type
 */
export declare function createGrid(width: number, height: number, type?: Grid['type']): Grid;
/**
 * Get a cell from the grid at the specified coordinate
 */
export declare function getCellAt(grid: Grid, coordinate: GridCoordinate): GridCell | null;
/**
 * Update a cell in the grid (returns new grid)
 */
export declare function updateCell(grid: Grid, coordinate: GridCoordinate, updates: Partial<Omit<GridCell, 'coordinate'>>): Grid;
/**
 * Get all neighboring coordinates for a given position
 */
export declare function getNeighbors(coordinate: GridCoordinate, gridType?: Grid['type']): readonly GridCoordinate[];
/**
 * Check if two coordinates are equal
 */
export declare function coordinatesEqual(a: GridCoordinate, b: GridCoordinate): boolean;
/**
 * Calculate Manhattan distance between two coordinates
 */
export declare function manhattanDistance(a: GridCoordinate, b: GridCoordinate): number;
/**
 * Calculate Euclidean distance between two coordinates
 */
export declare function euclideanDistance(a: GridCoordinate, b: GridCoordinate): number;
/**
 * Find a player by ID
 */
export declare function findPlayer(players: readonly Player[], playerId: string): Player | null;
/**
 * Get the next player in turn order
 */
export declare function getNextPlayer(players: readonly Player[], currentPlayerIndex: number): number;
/**
 * Check if it's a player's turn
 */
export declare function isPlayerTurn(gameState: GameState, playerId: string): boolean;
/**
 * Generate a unique move ID
 */
export declare function generateMoveId(): string;
/**
 * Create a move with standard fields
 */
export declare function createMove(playerId: string, type: string, data: Record<string, unknown>): Move;
/**
 * Get the last move from a game state
 */
export declare function getLastMove(gameState: GameState): Move | null;
/**
 * Get moves by a specific player
 */
export declare function getMovesByPlayer(gameState: GameState, playerId: string): readonly Move[];
/**
 * Generate a unique game ID
 */
export declare function generateGameId(): string;
/**
 * Create a deep copy of game state (for immutable updates)
 */
export declare function cloneGameState(state: GameState): GameState;
/**
 * Create a successful result
 */
export declare function ok<T>(data: T): Result<T>;
/**
 * Create an error result
 */
export declare function err(code: GameError['code'], message: string, context?: Record<string, unknown>): Result<never>;
/**
 * Transform a result's data if successful
 */
export declare function mapResult<T, U>(result: Result<T>, mapper: (data: T) => U): Result<U>;
/**
 * Chain result operations
 */
export declare function flatMapResult<T, U>(result: Result<T>, mapper: (data: T) => Result<U>): Result<U>;
/**
 * Validate that a coordinate is within grid bounds
 */
export declare function isValidCoordinate(coordinate: GridCoordinate, grid: Grid): boolean;
/**
 * Validate that a player exists and is active
 */
export declare function validatePlayer(players: readonly Player[], playerId: string): Result<Player>;
/**
 * Shuffle an array (Fisher-Yates algorithm)
 */
export declare function shuffle<T>(array: readonly T[]): T[];
/**
 * Get a random element from an array
 */
export declare function randomElement<T>(array: readonly T[]): T | null;
/**
 * Check if two arrays are equal (shallow comparison)
 */
export declare function arraysEqual<T>(a: readonly T[], b: readonly T[]): boolean;
