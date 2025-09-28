/**
 * @fileoverview Tests for utility functions
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
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
  // Result utilities
  ok,
  err,
  mapResult,
  flatMapResult,
  // Validation utilities
  isValidCoordinate,
  validatePlayer,
  // Array utilities
  shuffle,
} from './utils';
import type { Grid, Player, GameState, Move } from './types';

describe('Grid Utilities', () => {
  describe('createGrid', () => {
    it('should create a grid with correct dimensions', () => {
      const grid = createGrid(3, 2);
      
      expect(grid.width).toBe(3);
      expect(grid.height).toBe(2);
      expect(grid.type).toBe('square');
      expect(grid.cells).toHaveLength(2);
      expect(grid.cells[0]).toHaveLength(3);
    });

    it('should create grid with specified type', () => {
      const hexGrid = createGrid(3, 3, 'hexagonal');
      expect(hexGrid.type).toBe('hexagonal');
    });

    it('should initialize all cells as empty', () => {
      const grid = createGrid(2, 2);
      
      for (let y = 0; y < 2; y++) {
        for (let x = 0; x < 2; x++) {
          const cell = grid.cells[y][x];
          expect(cell.coordinate).toEqual({ x, y });
          expect(cell.state).toBe('empty');
        }
      }
    });

    it('should freeze cell rows', () => {
      const grid = createGrid(2, 2);
      expect(Object.isFrozen(grid.cells[0])).toBe(true);
    });
  });

  describe('getCellAt', () => {
    const grid = createGrid(3, 3);

    it('should return cell at valid coordinate', () => {
      const cell = getCellAt(grid, { x: 1, y: 1 });
      expect(cell).not.toBeNull();
      expect(cell!.coordinate).toEqual({ x: 1, y: 1 });
    });

    it('should return null for out-of-bounds coordinates', () => {
      expect(getCellAt(grid, { x: -1, y: 0 })).toBeNull();
      expect(getCellAt(grid, { x: 0, y: -1 })).toBeNull();
      expect(getCellAt(grid, { x: 3, y: 0 })).toBeNull();
      expect(getCellAt(grid, { x: 0, y: 3 })).toBeNull();
    });
  });

  describe('updateCell', () => {
    it('should update cell state and return new grid', () => {
      const grid = createGrid(2, 2);
      const updated = updateCell(grid, { x: 0, y: 0 }, { state: 'occupied', owner: 'player1' });
      
      const cell = getCellAt(updated, { x: 0, y: 0 })!;
      expect(cell.state).toBe('occupied');
      expect(cell.owner).toBe('player1');
      
      // Original grid should be unchanged
      const originalCell = getCellAt(grid, { x: 0, y: 0 })!;
      expect(originalCell.state).toBe('empty');
      expect(originalCell.owner).toBeUndefined();
    });

    it('should throw error for invalid coordinate', () => {
      const grid = createGrid(2, 2);
      expect(() => {
        updateCell(grid, { x: 5, y: 5 }, { state: 'occupied' });
      }).toThrow('Invalid coordinate: 5, 5');
    });

    it('should freeze updated rows', () => {
      const grid = createGrid(2, 2);
      const updated = updateCell(grid, { x: 0, y: 0 }, { state: 'occupied' });
      expect(Object.isFrozen(updated.cells[0])).toBe(true);
    });
  });

  describe('getNeighbors', () => {
    it('should return 8 neighbors for square grid', () => {
      const neighbors = getNeighbors({ x: 1, y: 1 }, 'square');
      expect(neighbors).toHaveLength(8);
      expect(neighbors).toContainEqual({ x: 0, y: 0 }); // top-left
      expect(neighbors).toContainEqual({ x: 2, y: 2 }); // bottom-right
    });

    it('should return 6 neighbors for hexagonal grid', () => {
      const neighbors = getNeighbors({ x: 1, y: 1 }, 'hexagonal');
      expect(neighbors).toHaveLength(6);
    });

    it('should return 4 neighbors for triangular grid', () => {
      const neighbors = getNeighbors({ x: 1, y: 1 }, 'triangular');
      expect(neighbors).toHaveLength(4);
    });

    it('should return empty array for unknown grid type', () => {
      const neighbors = getNeighbors({ x: 1, y: 1 }, 'unknown' as any);
      expect(neighbors).toHaveLength(0);
    });
  });

  describe('coordinatesEqual', () => {
    it('should return true for equal coordinates', () => {
      expect(coordinatesEqual({ x: 1, y: 2 }, { x: 1, y: 2 })).toBe(true);
    });

    it('should return false for different coordinates', () => {
      expect(coordinatesEqual({ x: 1, y: 2 }, { x: 2, y: 1 })).toBe(false);
      expect(coordinatesEqual({ x: 1, y: 2 }, { x: 1, y: 3 })).toBe(false);
    });
  });

  describe('manhattanDistance', () => {
    it('should calculate correct Manhattan distance', () => {
      expect(manhattanDistance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(7);
      expect(manhattanDistance({ x: 1, y: 1 }, { x: 1, y: 1 })).toBe(0);
      expect(manhattanDistance({ x: -1, y: -1 }, { x: 1, y: 1 })).toBe(4);
    });
  });

  describe('euclideanDistance', () => {
    it('should calculate correct Euclidean distance', () => {
      expect(euclideanDistance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
      expect(euclideanDistance({ x: 1, y: 1 }, { x: 1, y: 1 })).toBe(0);
      expect(euclideanDistance({ x: 0, y: 0 }, { x: 1, y: 1 })).toBeCloseTo(Math.sqrt(2));
    });
  });
});

describe('Player Utilities', () => {
  const players: Player[] = [
    { id: 'p1', name: 'Player 1', isAI: false, score: 0, isActive: true },
    { id: 'p2', name: 'Player 2', isAI: true, difficulty: 3, score: 0, isActive: true },
    { id: 'p3', name: 'Player 3', isAI: false, score: 0, isActive: false },
  ];

  describe('findPlayer', () => {
    it('should find existing player', () => {
      const player = findPlayer(players, 'p2');
      expect(player).not.toBeNull();
      expect(player!.name).toBe('Player 2');
    });

    it('should return null for non-existing player', () => {
      const player = findPlayer(players, 'nonexistent');
      expect(player).toBeNull();
    });
  });

  describe('getNextPlayer', () => {
    it('should return next active player', () => {
      const nextIndex = getNextPlayer(players, 0);
      expect(nextIndex).toBe(1);
    });

    it('should skip inactive players', () => {
      const nextIndex = getNextPlayer(players, 1);
      expect(nextIndex).toBe(0); // Skip inactive p3, wrap to p1
    });

    it('should return current index if no active players', () => {
      const inactivePlayers = players.map(p => ({ ...p, isActive: false }));
      const nextIndex = getNextPlayer(inactivePlayers, 0);
      expect(nextIndex).toBe(0);
    });

    it('should handle wraparound correctly', () => {
      const activePlayers = players.filter(p => p.isActive);
      const nextIndex = getNextPlayer(activePlayers, 1);
      expect(nextIndex).toBe(0);
    });
  });

  describe('isPlayerTurn', () => {
    const gameState: GameState = {
      id: 'game1',
      currentPlayer: 1,
      players,
      moves: [],
      turnNumber: 1,
      metadata: {},
    };

    it('should return true for current player', () => {
      expect(isPlayerTurn(gameState, 'p2')).toBe(true);
    });

    it('should return false for other players', () => {
      expect(isPlayerTurn(gameState, 'p1')).toBe(false);
      expect(isPlayerTurn(gameState, 'p3')).toBe(false);
    });

    it('should return false for non-existent player', () => {
      expect(isPlayerTurn(gameState, 'nonexistent')).toBe(false);
    });
  });
});

describe('Move Utilities', () => {
  const mockDate = new Date('2023-01-01T00:00:00Z');

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);
    vi.spyOn(Math, 'random').mockReturnValue(0.123456789);
  });

  describe('generateMoveId', () => {
    it('should generate move IDs with correct format', () => {
      const id = generateMoveId();
      expect(id).toMatch(/^move_\d+_[a-z0-9]+$/);
    });

    it('should generate different IDs with different timestamps', () => {
      const id1 = generateMoveId();
      vi.advanceTimersByTime(1);
      const id2 = generateMoveId();
      expect(id1).not.toBe(id2);
    });
  });

  describe('createMove', () => {
    it('should create move with all required fields', () => {
      const move = createMove('p1', 'place', { x: 1, y: 2 });
      
      expect(move.playerId).toBe('p1');
      expect(move.type).toBe('place');
      expect(move.data).toEqual({ x: 1, y: 2 });
      expect(move.timestamp).toEqual(mockDate);
      expect(move.id).toMatch(/^move_/);
    });
  });

  describe('getLastMove', () => {
    it('should return last move from game state', () => {
      const moves: Move[] = [
        { id: '1', playerId: 'p1', timestamp: mockDate, type: 'move1', data: {} },
        { id: '2', playerId: 'p2', timestamp: mockDate, type: 'move2', data: {} },
      ];
      
      const gameState: GameState = {
        id: 'game1',
        currentPlayer: 0,
        players: [],
        moves,
        turnNumber: 2,
        metadata: {},
      };

      const lastMove = getLastMove(gameState);
      expect(lastMove?.id).toBe('2');
    });

    it('should return null for empty moves array', () => {
      const gameState: GameState = {
        id: 'game1',
        currentPlayer: 0,
        players: [],
        moves: [],
        turnNumber: 0,
        metadata: {},
      };

      expect(getLastMove(gameState)).toBeNull();
    });
  });

  describe('getMovesByPlayer', () => {
    it('should filter moves by player ID', () => {
      const moves: Move[] = [
        { id: '1', playerId: 'p1', timestamp: mockDate, type: 'move1', data: {} },
        { id: '2', playerId: 'p2', timestamp: mockDate, type: 'move2', data: {} },
        { id: '3', playerId: 'p1', timestamp: mockDate, type: 'move3', data: {} },
      ];
      
      const gameState: GameState = {
        id: 'game1',
        currentPlayer: 0,
        players: [],
        moves,
        turnNumber: 3,
        metadata: {},
      };

      const playerMoves = getMovesByPlayer(gameState, 'p1');
      expect(playerMoves).toHaveLength(2);
      expect(playerMoves.map(m => m.id)).toEqual(['1', '3']);
    });
  });
});

describe('Game State Utilities', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2023-01-01T00:00:00Z'));
    vi.spyOn(Math, 'random').mockReturnValue(0.123456789);
  });

  describe('generateGameId', () => {
    it('should generate game IDs with correct format', () => {
      const id = generateGameId();
      expect(id).toMatch(/^game_\d+_[a-z0-9]+$/);
    });

    it('should generate different IDs with different timestamps', () => {
      const id1 = generateGameId();
      vi.advanceTimersByTime(1);
      const id2 = generateGameId();
      expect(id1).not.toBe(id2);
    });
  });

  describe('cloneGameState', () => {
    it('should create deep copy of game state', () => {
      const grid = createGrid(2, 2);
      const gameState: GameState = {
        id: 'game1',
        currentPlayer: 0,
        players: [{ id: 'p1', name: 'Player 1', isAI: false, score: 10, isActive: true }],
        grid,
        moves: [{ id: 'm1', playerId: 'p1', timestamp: new Date(), type: 'move', data: {} }],
        turnNumber: 1,
        metadata: { custom: 'data' },
      };

      const cloned = cloneGameState(gameState);
      
      // Should be different objects
      expect(cloned).not.toBe(gameState);
      expect(cloned.players).not.toBe(gameState.players);
      expect(cloned.moves).not.toBe(gameState.moves);
      expect(cloned.metadata).not.toBe(gameState.metadata);
      
      // But should have same values
      expect(cloned).toEqual(gameState);
      
      // Mutating clone shouldn't affect original
      cloned.players[0].score = 20;
      expect(gameState.players[0].score).toBe(10);
    });

    it('should handle game state without grid', () => {
      const gameState: GameState = {
        id: 'game1',
        currentPlayer: 0,
        players: [],
        moves: [],
        turnNumber: 0,
        metadata: {},
      };

      const cloned = cloneGameState(gameState);
      expect(cloned.grid).toBeUndefined();
      expect(cloned).toEqual(gameState);
    });
  });
});

describe('Result Utilities', () => {
  describe('ok', () => {
    it('should create successful result', () => {
      const result = ok('success data');
      expect(result.success).toBe(true);
      expect(result.data).toBe('success data');
    });
  });

  describe('err', () => {
    it('should create error result', () => {
      const result = err('INVALID_MOVE', 'Move is invalid');
      expect(result.success).toBe(false);
      expect(result.error.code).toBe('INVALID_MOVE');
      expect(result.error.message).toBe('Move is invalid');
    });

    it('should include context when provided', () => {
      const result = err('INVALID_MOVE', 'Move is invalid', { coordinate: { x: 1, y: 1 } });
      expect(result.error.context).toEqual({ coordinate: { x: 1, y: 1 } });
    });
  });

  describe('mapResult', () => {
    it('should transform successful result', () => {
      const result = ok(5);
      const mapped = mapResult(result, x => x * 2);
      
      expect(mapped.success).toBe(true);
      expect(mapped.data).toBe(10);
    });

    it('should pass through error result unchanged', () => {
      const result = err('ERROR', 'Something went wrong');
      const mapped = mapResult(result, x => x * 2);
      
      expect(mapped.success).toBe(false);
      expect(mapped.error.code).toBe('ERROR');
    });
  });

  describe('flatMapResult', () => {
    it('should chain successful results', () => {
      const result = ok(5);
      const chained = flatMapResult(result, x => ok(x * 2));
      
      expect(chained.success).toBe(true);
      expect(chained.data).toBe(10);
    });

    it('should return error from chain', () => {
      const result = ok(5);
      const chained = flatMapResult(result, () => err('CHAIN_ERROR', 'Failed in chain'));
      
      expect(chained.success).toBe(false);
      expect(chained.error.code).toBe('CHAIN_ERROR');
    });

    it('should pass through original error', () => {
      const result = err('ORIGINAL_ERROR', 'Original failed');
      const chained = flatMapResult(result, x => ok(x * 2));
      
      expect(chained.success).toBe(false);
      expect(chained.error.code).toBe('ORIGINAL_ERROR');
    });
  });
});

describe('Validation Utilities', () => {
  describe('isValidCoordinate', () => {
    const grid = createGrid(3, 3);

    it('should return true for valid coordinates', () => {
      expect(isValidCoordinate({ x: 0, y: 0 }, grid)).toBe(true);
      expect(isValidCoordinate({ x: 2, y: 2 }, grid)).toBe(true);
      expect(isValidCoordinate({ x: 1, y: 1 }, grid)).toBe(true);
    });

    it('should return false for invalid coordinates', () => {
      expect(isValidCoordinate({ x: -1, y: 0 }, grid)).toBe(false);
      expect(isValidCoordinate({ x: 0, y: -1 }, grid)).toBe(false);
      expect(isValidCoordinate({ x: 3, y: 0 }, grid)).toBe(false);
      expect(isValidCoordinate({ x: 0, y: 3 }, grid)).toBe(false);
    });
  });

  describe('validatePlayer', () => {
    const players: Player[] = [
      { id: 'p1', name: 'Player 1', isAI: false, score: 0, isActive: true },
      { id: 'p2', name: 'Player 2', isAI: false, score: 0, isActive: false },
    ];

    it('should return ok result for valid active player', () => {
      const result = validatePlayer(players, 'p1');
      expect(result.success).toBe(true);
      expect(result.data.id).toBe('p1');
    });

    it('should return error for non-existent player', () => {
      const result = validatePlayer(players, 'nonexistent');
      expect(result.success).toBe(false);
      expect(result.error.code).toBe('PLAYER_NOT_FOUND');
      expect(result.error.message).toContain('nonexistent');
    });

    it('should return error for inactive player', () => {
      const result = validatePlayer(players, 'p2');
      expect(result.success).toBe(false);
      expect(result.error.code).toBe('PLAYER_NOT_FOUND');
      expect(result.error.message).toContain('not active');
    });
  });
});

describe('Array Utilities', () => {
  describe('shuffle', () => {
    beforeEach(() => {
      vi.spyOn(Math, 'random')
        .mockReturnValueOnce(0.8) // For first swap
        .mockReturnValueOnce(0.5) // For second swap
        .mockReturnValueOnce(0.2); // For third swap
    });

    it('should shuffle array elements', () => {
      const original = [1, 2, 3, 4];
      const shuffled = shuffle(original);
      
      // Original should be unchanged
      expect(original).toEqual([1, 2, 3, 4]);
      
      // Shuffled should have same elements but potentially different order
      expect(shuffled).toHaveLength(4);
      expect(shuffled).toContain(1);
      expect(shuffled).toContain(2);
      expect(shuffled).toContain(3);
      expect(shuffled).toContain(4);
    });

    it('should handle empty array', () => {
      const shuffled = shuffle([]);
      expect(shuffled).toEqual([]);
    });

    it('should handle single element array', () => {
      const shuffled = shuffle([42]);
      expect(shuffled).toEqual([42]);
    });
  });
});