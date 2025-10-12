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
 * @fileoverview Tic-Tac-Toe specific types and interfaces
 */

import type { Move, GridCoordinate } from '@gpg/shared';

/**
 * Tic-Tac-Toe game symbols
 */
export type TicTacToeSymbol = 'X' | 'O';

/**
 * Tic-Tac-Toe specific move
 */
export interface TicTacToeMove extends Move {
  readonly type: 'place';
  readonly data: {
    readonly position: GridCoordinate;
    readonly symbol: TicTacToeSymbol;
  };
}

/**
 * Board state representation (efficient for AI)
 */
export type BoardState = (TicTacToeSymbol | null)[][];

/**
 * Winning line information
 */
export interface WinningLine {
  readonly start: GridCoordinate;
  readonly end: GridCoordinate;
  readonly type: 'horizontal' | 'vertical' | 'diagonal';
  readonly positions: readonly GridCoordinate[];
}

/**
 * Game state metadata specific to Tic-Tac-Toe
 */
export interface TicTacToeMetadata {
  readonly boardState: BoardState;
  readonly winner?: TicTacToeSymbol;
  readonly winningLine?: WinningLine;
  readonly isDraw: boolean;
  readonly moveHistory: readonly TicTacToeMove[];
  readonly lastMove?: TicTacToeMove;
}

/**
 * AI evaluation context
 */
export interface PositionEvaluation {
  readonly score: number;
  readonly depth: number;
  readonly bestMove?: GridCoordinate;
  readonly principalVariation: readonly GridCoordinate[];
  readonly nodesEvaluated: number;
}

/**
 * Game analysis result
 */
export interface GameAnalysis {
  readonly bestMove: GridCoordinate;
  readonly evaluation: PositionEvaluation;
  readonly confidence: number;
  readonly explanation: string;
}

/**
 * Winning line patterns (positions as 1D indices for 3x3 board)
 */
export const WINNING_LINES: readonly [number, number, number][] = [
  // Rows
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  // Columns
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  // Diagonals
  [0, 4, 8],
  [2, 4, 6],
] as const;

/**
 * Game constants
 */
export const GAME_CONSTANTS = {
  BOARD_SIZE: 3,
  EMPTY_CELL: null,
  WINNING_SCORE: 100,
  LOSING_SCORE: -100,
  DRAW_SCORE: 0,
  MAX_MOVES: 9,
  CENTER_POSITION: { x: 1, y: 1 },
  CORNER_POSITIONS: [
    { x: 0, y: 0 },
    { x: 2, y: 0 },
    { x: 0, y: 2 },
    { x: 2, y: 2 },
  ] as readonly GridCoordinate[],
  EDGE_POSITIONS: [
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: 2, y: 1 },
    { x: 1, y: 2 },
  ] as readonly GridCoordinate[],
} as const;