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
 * @fileoverview Unit tests for Tic-Tac-Toe utility functions
 */

import { describe, it, expect } from 'vitest';
import {
  coordToIndex,
  indexToCoord,
  createEmptyBoard,
  cloneBoard,
  isValidPosition,
  isEmpty,
  isBoardFull,
  getEmptyPositions,
  checkWin,
  isDraw,
  getPlayerSymbol,
  getOpponentSymbol,
  createMove,
  applyMoveToBoard,
  getBoardHash,
  isPartOfWinningLine,
} from '../src/utils';
import type { GameState } from '@gpg/shared';

describe('Utility Functions', () => {
  describe('coordToIndex and indexToCoord', () => {
    it('should convert coordinates correctly', () => {
      expect(coordToIndex({ x: 0, y: 0 })).toBe(0);
      expect(coordToIndex({ x: 1, y: 0 })).toBe(1);
      expect(coordToIndex({ x: 2, y: 0 })).toBe(2);
      expect(coordToIndex({ x: 0, y: 1 })).toBe(3);
      expect(coordToIndex({ x: 1, y: 1 })).toBe(4);
      expect(coordToIndex({ x: 2, y: 2 })).toBe(8);
    });

    it('should convert indices correctly', () => {
      expect(indexToCoord(0)).toEqual({ x: 0, y: 0 });
      expect(indexToCoord(1)).toEqual({ x: 1, y: 0 });
      expect(indexToCoord(4)).toEqual({ x: 1, y: 1 });
      expect(indexToCoord(8)).toEqual({ x: 2, y: 2 });
    });

    it('should be inverse operations', () => {
      for (let i = 0; i < 9; i++) {
        expect(coordToIndex(indexToCoord(i))).toBe(i);
      }
    });
  });

  describe('createEmptyBoard and cloneBoard', () => {
    it('should create empty 3x3 board', () => {
      const board = createEmptyBoard();
      expect(board).toHaveLength(3);
      expect(board[0]).toHaveLength(3);
      expect(board.every(row => row.every(cell => cell === null))).toBe(true);
    });

    it('should clone board correctly', () => {
      const original = createEmptyBoard();
      original[1][1] = 'X';

      const clone = cloneBoard(original);
      clone[0][0] = 'O';

      expect(original[0][0]).toBe(null);
      expect(original[1][1]).toBe('X');
      expect(clone[0][0]).toBe('O');
      expect(clone[1][1]).toBe('X');
    });
  });

  describe('isValidPosition', () => {
    it('should validate positions correctly', () => {
      expect(isValidPosition({ x: 0, y: 0 })).toBe(true);
      expect(isValidPosition({ x: 1, y: 1 })).toBe(true);
      expect(isValidPosition({ x: 2, y: 2 })).toBe(true);
      expect(isValidPosition({ x: -1, y: 0 })).toBe(false);
      expect(isValidPosition({ x: 0, y: -1 })).toBe(false);
      expect(isValidPosition({ x: 3, y: 0 })).toBe(false);
      expect(isValidPosition({ x: 0, y: 3 })).toBe(false);
    });
  });

  describe('isEmpty and isBoardFull', () => {
    it('should check empty positions correctly', () => {
      const board = createEmptyBoard();
      expect(isEmpty(board, { x: 1, y: 1 })).toBe(true);

      board[1][1] = 'X';
      expect(isEmpty(board, { x: 1, y: 1 })).toBe(false);
    });

    it('should detect full board', () => {
      const board = createEmptyBoard();
      expect(isBoardFull(board)).toBe(false);

      // Fill board
      for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 3; x++) {
          board[y][x] = 'X';
        }
      }
      expect(isBoardFull(board)).toBe(true);
    });
  });

  describe('getEmptyPositions', () => {
    it('should return all positions for empty board', () => {
      const board = createEmptyBoard();
      const empty = getEmptyPositions(board);
      expect(empty).toHaveLength(9);
    });

    it('should return correct empty positions', () => {
      const board = createEmptyBoard();
      board[1][1] = 'X';
      board[0][0] = 'O';

      const empty = getEmptyPositions(board);
      expect(empty).toHaveLength(7);
      expect(empty).not.toContainEqual({ x: 1, y: 1 });
      expect(empty).not.toContainEqual({ x: 0, y: 0 });
    });
  });

  describe('checkWin', () => {
    it('should detect horizontal win', () => {
      const board = createEmptyBoard();
      board[0][0] = 'X';
      board[0][1] = 'X';
      board[0][2] = 'X';

      const result = checkWin(board);
      expect(result.winner).toBe('X');
      expect(result.winningLine?.type).toBe('horizontal');
      expect(result.winningLine?.positions).toHaveLength(3);
    });

    it('should detect vertical win', () => {
      const board = createEmptyBoard();
      board[0][1] = 'O';
      board[1][1] = 'O';
      board[2][1] = 'O';

      const result = checkWin(board);
      expect(result.winner).toBe('O');
      expect(result.winningLine?.type).toBe('vertical');
    });

    it('should detect diagonal win', () => {
      const board = createEmptyBoard();
      board[0][0] = 'X';
      board[1][1] = 'X';
      board[2][2] = 'X';

      const result = checkWin(board);
      expect(result.winner).toBe('X');
      expect(result.winningLine?.type).toBe('diagonal');
    });

    it('should return null for no win', () => {
      const board = createEmptyBoard();
      board[0][0] = 'X';
      board[0][1] = 'O';

      const result = checkWin(board);
      expect(result.winner).toBe(null);
      expect(result.winningLine).toBeUndefined();
    });
  });

  describe('isDraw', () => {
    it('should detect draw state', () => {
      const board = [
        ['X', 'O', 'X'],
        ['O', 'O', 'X'],
        ['O', 'X', 'O'],
      ] as any;

      expect(isDraw(board)).toBe(true);
    });

    it('should not detect draw when game not full', () => {
      const board = createEmptyBoard();
      board[0][0] = 'X';

      expect(isDraw(board)).toBe(false);
    });
  });

  describe('getOpponentSymbol', () => {
    it('should return opposite symbol', () => {
      expect(getOpponentSymbol('X')).toBe('O');
      expect(getOpponentSymbol('O')).toBe('X');
    });
  });

  describe('createMove', () => {
    it('should create valid move', () => {
      const move = createMove({ x: 1, y: 1 }, 'X', 'player1');

      expect(move.type).toBe('place');
      expect(move.playerId).toBe('player1');
      expect(move.data.position).toEqual({ x: 1, y: 1 });
      expect(move.data.symbol).toBe('X');
      expect(move.id).toBeTruthy();
      expect(move.timestamp).toBeInstanceOf(Date);
    });
  });

  describe('applyMoveToBoard', () => {
    it('should apply move to board', () => {
      const board = createEmptyBoard();
      const move = createMove({ x: 1, y: 1 }, 'X', 'player1');

      const newBoard = applyMoveToBoard(board, move);

      expect(board[1][1]).toBe(null); // Original unchanged
      expect(newBoard[1][1]).toBe('X'); // New board updated
    });
  });

  describe('getBoardHash', () => {
    it('should create consistent hash', () => {
      const board1 = createEmptyBoard();
      const board2 = createEmptyBoard();

      expect(getBoardHash(board1)).toBe(getBoardHash(board2));

      board1[1][1] = 'X';
      expect(getBoardHash(board1)).not.toBe(getBoardHash(board2));
    });
  });

  describe('isPartOfWinningLine', () => {
    it('should detect if coordinate is in winning line', () => {
      const winningLine = {
        start: { x: 0, y: 0 },
        end: { x: 2, y: 0 },
        type: 'horizontal' as const,
        positions: [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
          { x: 2, y: 0 },
        ],
      };

      expect(isPartOfWinningLine({ x: 1, y: 0 }, winningLine)).toBe(true);
      expect(isPartOfWinningLine({ x: 1, y: 1 }, winningLine)).toBe(false);
    });
  });
});