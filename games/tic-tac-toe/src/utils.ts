/**
 * @fileoverview Utility functions for Tic-Tac-Toe game
 */

import type { GridCoordinate, GameState } from '@gpg/shared';
import type {
  TicTacToeSymbol,
  BoardState,
  WinningLine,
  TicTacToeMove,
  TicTacToeMetadata,
} from './types';
import { WINNING_LINES, GAME_CONSTANTS } from './types';

/**
 * Convert 2D coordinate to 1D index
 */
export function coordToIndex(coord: GridCoordinate): number {
  return coord.y * GAME_CONSTANTS.BOARD_SIZE + coord.x;
}

/**
 * Convert 1D index to 2D coordinate
 */
export function indexToCoord(index: number): GridCoordinate {
  return {
    x: index % GAME_CONSTANTS.BOARD_SIZE,
    y: Math.floor(index / GAME_CONSTANTS.BOARD_SIZE),
  };
}

/**
 * Create an empty 3x3 board
 */
export function createEmptyBoard(): BoardState {
  return Array(GAME_CONSTANTS.BOARD_SIZE)
    .fill(null)
    .map(() => Array(GAME_CONSTANTS.BOARD_SIZE).fill(null));
}

/**
 * Create a deep copy of a board state
 */
export function cloneBoard(board: BoardState): BoardState {
  return board.map(row => [...row]);
}

/**
 * Check if a position is within board bounds
 */
export function isValidPosition(coord: GridCoordinate): boolean {
  return (
    coord.x >= 0 &&
    coord.x < GAME_CONSTANTS.BOARD_SIZE &&
    coord.y >= 0 &&
    coord.y < GAME_CONSTANTS.BOARD_SIZE
  );
}

/**
 * Check if a position is empty on the board
 */
export function isEmpty(board: BoardState, coord: GridCoordinate): boolean {
  if (!isValidPosition(coord)) return false;
  return board[coord.y][coord.x] === null;
}

/**
 * Check if the board is full
 */
export function isBoardFull(board: BoardState): boolean {
  for (let y = 0; y < GAME_CONSTANTS.BOARD_SIZE; y++) {
    for (let x = 0; x < GAME_CONSTANTS.BOARD_SIZE; x++) {
      if (board[y][x] === null) return false;
    }
  }
  return true;
}

/**
 * Get all empty positions on the board
 */
export function getEmptyPositions(board: BoardState): GridCoordinate[] {
  const positions: GridCoordinate[] = [];
  for (let y = 0; y < GAME_CONSTANTS.BOARD_SIZE; y++) {
    for (let x = 0; x < GAME_CONSTANTS.BOARD_SIZE; x++) {
      if (board[y][x] === null) {
        positions.push({ x, y });
      }
    }
  }
  return positions;
}

/**
 * Get the line type based on start and end positions
 */
export function getLineType(start: number, end: number): 'horizontal' | 'vertical' | 'diagonal' {
  // Row: same y coordinate
  if (
    Math.floor(start / GAME_CONSTANTS.BOARD_SIZE) === Math.floor(end / GAME_CONSTANTS.BOARD_SIZE)
  ) {
    return 'horizontal';
  }
  // Column: same x coordinate
  if (start % GAME_CONSTANTS.BOARD_SIZE === end % GAME_CONSTANTS.BOARD_SIZE) {
    return 'vertical';
  }
  // Diagonal
  return 'diagonal';
}

/**
 * Check for winning conditions and return winner info
 */
export function checkWin(board: BoardState): {
  winner: TicTacToeSymbol | null;
  winningLine?: WinningLine;
} {
  // Check each winning line
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    const coordA = indexToCoord(a);
    const coordB = indexToCoord(b);
    const coordC = indexToCoord(c);

    const cellA = board[coordA.y][coordA.x];
    const cellB = board[coordB.y][coordB.x];
    const cellC = board[coordC.y][coordC.x];

    if (cellA && cellA === cellB && cellB === cellC) {
      return {
        winner: cellA,
        winningLine: {
          start: coordA,
          end: coordC,
          type: getLineType(a, c),
          positions: [coordA, coordB, coordC],
        },
      };
    }
  }

  return { winner: null };
}

/**
 * Check if the game is in a draw state
 */
export function isDraw(board: BoardState): boolean {
  return isBoardFull(board) && checkWin(board).winner === null;
}

/**
 * Get the player's symbol from the game state
 */
export function getPlayerSymbol(state: GameState, playerId: string): TicTacToeSymbol {
  const playerIndex = state.players.findIndex(p => p.id === playerId);
  return playerIndex === 0 ? 'X' : 'O';
}

/**
 * Get the opposite symbol
 */
export function getOpponentSymbol(symbol: TicTacToeSymbol): TicTacToeSymbol {
  return symbol === 'X' ? 'O' : 'X';
}

/**
 * Generate a unique move ID
 */
export function generateMoveId(): string {
  return `move-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a Tic-Tac-Toe move
 */
export function createMove(
  position: GridCoordinate,
  symbol: TicTacToeSymbol,
  playerId: string,
  timestamp: Date = new Date()
): TicTacToeMove {
  return {
    id: generateMoveId(),
    playerId,
    timestamp,
    type: 'place',
    data: { position, symbol },
  };
}

/**
 * Apply a move to a board state (returns new board)
 */
export function applyMoveToBoard(board: BoardState, move: TicTacToeMove): BoardState {
  const newBoard = cloneBoard(board);
  const { position, symbol } = move.data;
  newBoard[position.y][position.x] = symbol;
  return newBoard;
}

/**
 * Check if a coordinate is part of the winning line
 */
export function isPartOfWinningLine(coord: GridCoordinate, winningLine: WinningLine): boolean {
  return winningLine.positions.some(pos => pos.x === coord.x && pos.y === coord.y);
}

/**
 * Create a hash string for board state (for memoization)
 */
export function getBoardHash(board: BoardState): string {
  return board
    .flat()
    .map(cell => cell || '_')
    .join('');
}

/**
 * Count the number of symbols in a line
 */
export function countSymbolsInLine(
  board: BoardState,
  line: readonly [number, number, number],
  symbol: TicTacToeSymbol
): number {
  const [a, b, c] = line;
  const positions = [indexToCoord(a), indexToCoord(b), indexToCoord(c)];
  return positions.reduce((count, pos) => {
    return count + (board[pos.y][pos.x] === symbol ? 1 : 0);
  }, 0);
}

/**
 * Check if a line is still winnable (no opponent symbols)
 */
export function isLineWinnable(
  board: BoardState,
  line: readonly [number, number, number],
  symbol: TicTacToeSymbol
): boolean {
  const [a, b, c] = line;
  const positions = [indexToCoord(a), indexToCoord(b), indexToCoord(c)];
  const opponent = getOpponentSymbol(symbol);

  return !positions.some(pos => board[pos.y][pos.x] === opponent);
}

/**
 * Get detailed game state analysis
 */
export function analyzeGameState(state: GameState): {
  isTerminal: boolean;
  winner?: TicTacToeSymbol;
  isDraw: boolean;
  moveCount: number;
  emptyPositions: GridCoordinate[];
} {
  const metadata = state.metadata as unknown as TicTacToeMetadata;
  const winResult = checkWin(metadata.boardState);
  const emptyPositions = getEmptyPositions(metadata.boardState);
  const moveCount = GAME_CONSTANTS.MAX_MOVES - emptyPositions.length;
  const isDraw = isBoardFull(metadata.boardState) && !winResult.winner;

  return {
    isTerminal: !!winResult.winner || isDraw,
    winner: winResult.winner || undefined,
    isDraw,
    moveCount,
    emptyPositions,
  };
}
