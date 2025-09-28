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
