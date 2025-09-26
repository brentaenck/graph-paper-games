/**
 * @fileoverview Utility functions for common game operations
 */

import type {
  GridCoordinate,
  GridCell,
  Grid,
  Player,
  Move,
  GameState,
  Result,
  GameError,
} from './types';

// ============================================================================
// Grid Utilities
// ============================================================================

/**
 * Create a new grid with the specified dimensions and type
 */
export function createGrid(width: number, height: number, type: Grid['type'] = 'square'): Grid {
  const cells: GridCell[][] = [];

  for (let y = 0; y < height; y++) {
    const row: GridCell[] = [];
    for (let x = 0; x < width; x++) {
      row.push({
        coordinate: { x, y },
        state: 'empty',
      });
    }
    cells.push(row);
  }

  return {
    width,
    height,
    cells: cells.map(row => Object.freeze(row)),
    type,
  };
}

/**
 * Get a cell from the grid at the specified coordinate
 */
export function getCellAt(grid: Grid, coordinate: GridCoordinate): GridCell | null {
  if (
    coordinate.x < 0 ||
    coordinate.x >= grid.width ||
    coordinate.y < 0 ||
    coordinate.y >= grid.height
  ) {
    return null;
  }
  return grid.cells[coordinate.y][coordinate.x];
}

/**
 * Update a cell in the grid (returns new grid)
 */
export function updateCell(
  grid: Grid,
  coordinate: GridCoordinate,
  updates: Partial<Omit<GridCell, 'coordinate'>>
): Grid {
  const currentCell = getCellAt(grid, coordinate);
  if (!currentCell) {
    throw new Error(`Invalid coordinate: ${coordinate.x}, ${coordinate.y}`);
  }

  const newCells = grid.cells.map((row, y) =>
    row.map((cell, x) => {
      if (x === coordinate.x && y === coordinate.y) {
        return Object.freeze({ ...cell, ...updates });
      }
      return cell;
    })
  );

  return {
    ...grid,
    cells: newCells.map(row => Object.freeze(row)),
  };
}

/**
 * Get all neighboring coordinates for a given position
 */
export function getNeighbors(
  coordinate: GridCoordinate,
  gridType: Grid['type'] = 'square'
): readonly GridCoordinate[] {
  const { x, y } = coordinate;

  switch (gridType) {
    case 'square':
      return [
        { x: x - 1, y: y - 1 }, // top-left
        { x: x, y: y - 1 }, // top
        { x: x + 1, y: y - 1 }, // top-right
        { x: x - 1, y: y }, // left
        { x: x + 1, y: y }, // right
        { x: x - 1, y: y + 1 }, // bottom-left
        { x: x, y: y + 1 }, // bottom
        { x: x + 1, y: y + 1 }, // bottom-right
      ];

    case 'hexagonal':
      // Hexagonal neighbors (simplified - actual implementation would depend on specific hex layout)
      return [
        { x: x, y: y - 1 }, // top
        { x: x + 1, y: y - 1 }, // top-right
        { x: x + 1, y: y }, // right
        { x: x, y: y + 1 }, // bottom
        { x: x - 1, y: y + 1 }, // bottom-left
        { x: x - 1, y: y }, // left
      ];

    case 'triangular':
      // Triangular grid neighbors (simplified)
      return [
        { x: x - 1, y: y }, // left
        { x: x + 1, y: y }, // right
        { x: x, y: y - 1 }, // top
        { x: x, y: y + 1 }, // bottom
      ];

    default:
      return [];
  }
}

/**
 * Check if two coordinates are equal
 */
export function coordinatesEqual(a: GridCoordinate, b: GridCoordinate): boolean {
  return a.x === b.x && a.y === b.y;
}

/**
 * Calculate Manhattan distance between two coordinates
 */
export function manhattanDistance(a: GridCoordinate, b: GridCoordinate): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

/**
 * Calculate Euclidean distance between two coordinates
 */
export function euclideanDistance(a: GridCoordinate, b: GridCoordinate): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

// ============================================================================
// Player Utilities
// ============================================================================

/**
 * Find a player by ID
 */
export function findPlayer(players: readonly Player[], playerId: string): Player | null {
  return players.find(p => p.id === playerId) ?? null;
}

/**
 * Get the next player in turn order
 */
export function getNextPlayer(players: readonly Player[], currentPlayerIndex: number): number {
  const activePlayers = players.filter(p => p.isActive);
  if (activePlayers.length === 0) return currentPlayerIndex;

  let nextIndex = (currentPlayerIndex + 1) % players.length;
  while (nextIndex !== currentPlayerIndex && !players[nextIndex].isActive) {
    nextIndex = (nextIndex + 1) % players.length;
  }

  return nextIndex;
}

/**
 * Check if it's a player's turn
 */
export function isPlayerTurn(gameState: GameState, playerId: string): boolean {
  const currentPlayer = gameState.players[gameState.currentPlayer];
  return currentPlayer?.id === playerId;
}

// ============================================================================
// Move Utilities
// ============================================================================

/**
 * Generate a unique move ID
 */
export function generateMoveId(): string {
  return `move_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a move with standard fields
 */
export function createMove(playerId: string, type: string, data: Record<string, unknown>): Move {
  return {
    id: generateMoveId(),
    playerId,
    timestamp: new Date(),
    type,
    data,
  };
}

/**
 * Get the last move from a game state
 */
export function getLastMove(gameState: GameState): Move | null {
  return gameState.moves[gameState.moves.length - 1] ?? null;
}

/**
 * Get moves by a specific player
 */
export function getMovesByPlayer(gameState: GameState, playerId: string): readonly Move[] {
  return gameState.moves.filter(move => move.playerId === playerId);
}

// ============================================================================
// Game State Utilities
// ============================================================================

/**
 * Generate a unique game ID
 */
export function generateGameId(): string {
  return `game_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a deep copy of game state (for immutable updates)
 */
export function cloneGameState(state: GameState): GameState {
  return {
    ...state,
    players: state.players.map(p => ({ ...p })),
    grid: state.grid
      ? {
          ...state.grid,
          cells: state.grid.cells.map(row => row.map(cell => ({ ...cell }))),
        }
      : undefined,
    moves: [...state.moves],
    metadata: { ...state.metadata },
  };
}

// ============================================================================
// Result Utilities
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
export function err(
  code: GameError['code'],
  message: string,
  context?: Record<string, unknown>
): Result<never> {
  return {
    success: false,
    error: { code, message, context },
  };
}

/**
 * Transform a result's data if successful
 */
export function mapResult<T, U>(result: Result<T>, mapper: (data: T) => U): Result<U> {
  if (result.success) {
    return ok(mapper(result.data));
  }
  return result;
}

/**
 * Chain result operations
 */
export function flatMapResult<T, U>(result: Result<T>, mapper: (data: T) => Result<U>): Result<U> {
  if (result.success) {
    return mapper(result.data);
  }
  return result;
}

// ============================================================================
// Validation Utilities
// ============================================================================

/**
 * Validate that a coordinate is within grid bounds
 */
export function isValidCoordinate(coordinate: GridCoordinate, grid: Grid): boolean {
  return (
    coordinate.x >= 0 &&
    coordinate.x < grid.width &&
    coordinate.y >= 0 &&
    coordinate.y < grid.height
  );
}

/**
 * Validate that a player exists and is active
 */
export function validatePlayer(players: readonly Player[], playerId: string): Result<Player> {
  const player = findPlayer(players, playerId);
  if (!player) {
    return err('PLAYER_NOT_FOUND', `Player ${playerId} not found`);
  }
  if (!player.isActive) {
    return err('PLAYER_NOT_FOUND', `Player ${playerId} is not active`);
  }
  return ok(player);
}

// ============================================================================
// Array Utilities
// ============================================================================

/**
 * Shuffle an array (Fisher-Yates algorithm)
 */
export function shuffle<T>(array: readonly T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Get a random element from an array
 */
export function randomElement<T>(array: readonly T[]): T | null {
  if (array.length === 0) return null;
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Check if two arrays are equal (shallow comparison)
 */
export function arraysEqual<T>(a: readonly T[], b: readonly T[]): boolean {
  if (a.length !== b.length) return false;
  return a.every((item, index) => item === b[index]);
}
