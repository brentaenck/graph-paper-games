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
 * @fileoverview Tic-Tac-Toe game module exports
 */

// Export types
export type {
  TicTacToeSymbol,
  TicTacToeMove,
  BoardState,
  WinningLine,
  TicTacToeMetadata,
  PositionEvaluation,
  GameAnalysis,
} from './types';

export { WINNING_LINES, GAME_CONSTANTS } from './types';

// Export engine
export { TicTacToeEngine } from './engine';

// Export AI
export { TicTacToeAI } from './ai';

// Export utilities
export * from './utils';