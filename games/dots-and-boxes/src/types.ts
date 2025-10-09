/**
 * @fileoverview Types for Dots and Boxes game implementation
 */

import type { Move, AIDifficulty, GameSettings } from '@gpg/shared';

// ============================================================================
// GAME CONFIGURATION
// ============================================================================

export interface DotsAndBoxesConfig extends GameSettings {
  gridSize: { width: number; height: number }; // Number of dots (boxes will be width-1 x height-1)
  gameMode: 'human-vs-human' | 'human-vs-ai';
  player1Name: string;
  player2Name: string;
  aiDifficulty?: AIDifficulty;
}

// ============================================================================
// GAME STATE & MOVES
// ============================================================================

export interface DotsAndBoxesMetadata {
  gridSize: { width: number; height: number };
  
  // CONSISTENT [row][col] INDEXING FOR ALL DATA STRUCTURES:
  // - row = vertical position (Y-axis, 0 = top)
  // - col = horizontal position (X-axis, 0 = left)
  
  // Horizontal lines: [row][col] - line from dot(row,col) to dot(row,col+1)
  // Dimensions: height rows × (width-1) columns
  horizontalLines: boolean[][];
  
  // Vertical lines: [row][col] - line from dot(row,col) to dot(row+1,col)  
  // Dimensions: (height-1) rows × width columns
  verticalLines: boolean[][];
  // Completed boxes: [row][col] - owner of box at (row,col) to (row+1,col+1)
  completedBoxes: (string | null)[][];
  // Player scores
  playerScores: number[];
  // Track if last move completed any boxes (for extra turns)
  lastMoveCompletedBoxes: number;
  // Track available moves for AI optimization
  availableMoves: DotsAndBoxesMove[];
}

export interface DotsAndBoxesMove extends Move {
  type: 'horizontal' | 'vertical';
  position: { row: number; col: number };
  playerId: string;
  data: {
    lineType: 'horizontal' | 'vertical';
    position: { row: number; col: number };
    playerId: string;
    expectedBoxCompletions?: number; // For AI planning
  };
}

// ============================================================================
// GAME ANALYSIS
// ============================================================================

export interface BoxStatus {
  position: { row: number; col: number };
  completedSides: number; // 0-4
  owner: string | null;
  isCompletable: boolean; // Has 3 sides, can be completed in one move
  completingMove: DotsAndBoxesMove | null;
}

export interface GameAnalysis {
  totalBoxes: number;
  completedBoxes: number;
  availableBoxes: BoxStatus[];
  completableBoxes: BoxStatus[]; // Boxes with 3 sides (dangerous to give to opponent)
  safeBoxes: BoxStatus[]; // Boxes with 0-2 sides (safe to work on)
  chainPotential: number; // Number of boxes that could be completed in chains
}

// ============================================================================
// AI TYPES
// ============================================================================

export interface MoveEvaluation {
  move: DotsAndBoxesMove;
  score: number;
  immediateBoxes: number; // Boxes completed by this move
  giveawayBoxes: number; // Boxes this move gives to opponent
  strategicValue: number; // Long-term strategic value
  confidence: number;
  reasoning: string;
}

export interface AIHint {
  move: DotsAndBoxesMove;
  explanation: string;
  confidence: number;
  strategicReason: 'safe_move' | 'box_completion' | 'chain_setup' | 'defensive' | 'endgame';
}

// ============================================================================
// GAME EVENTS
// ============================================================================

export interface DotsAndBoxesEvents {
  'line-drawn': {
    move: DotsAndBoxesMove;
    newBoxes: { row: number; col: number; owner: string }[];
    chainLength: number;
  };
  'box-completed': {
    position: { row: number; col: number };
    owner: string;
    isChain: boolean;
  };
  'chain-completed': {
    boxes: { row: number; col: number; owner: string }[];
    player: string;
    totalBoxes: number;
  };
  'game-ended': {
    winner: string | null;
    finalScores: number[];
    gameStats: {
      totalMoves: number;
      longestChain: number;
      boxCompletionRate: number;
    };
  };
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type LineType = 'horizontal' | 'vertical';
export type BoxCoordinate = { row: number; col: number };
export type LineCoordinate = { row: number; col: number; type: LineType };

// Helper type for creating moves
export interface CreateMoveParams {
  lineType: LineType;
  position: BoxCoordinate;
  playerId: string;
}
