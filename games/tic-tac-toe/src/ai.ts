/**
 * @fileoverview Tic-Tac-Toe AI implementation with 6 difficulty levels
 */

import type {
  GameAI,
  GameState,
  Move,
  Result,
  Hint,
  AIDifficulty
} from '@gpg/shared';

import { createOk as ok, createErr as err } from '@gpg/shared';

import type {
  TicTacToeMetadata,
  TicTacToeSymbol,
  BoardState
} from './types';

import { WINNING_LINES, GAME_CONSTANTS } from './types';

import {
  getPlayerSymbol,
  getOpponentSymbol,
  getEmptyPositions,
  createMove,
  cloneBoard,
  checkWin,
  isBoardFull,
  getBoardHash,
  indexToCoord
} from './utils';

/**
 * Minimax result with additional metadata
 */
interface MinimaxResult {
  score: number;
  bestMove?: import('@gpg/shared').GridCoordinate;
  nodesEvaluated: number;
  depth: number;
}

/**
 * Tic-Tac-Toe AI implementation with progressive difficulty levels
 */
export class TicTacToeAI implements GameAI {
  private memoCache = new Map<string, MinimaxResult>();
  private evaluationStats = {
    cacheHits: 0,
    cacheMisses: 0,
    totalEvaluations: 0
  };

  /**
   * Generate an AI move for the given game state
   */
  async getMove(
    state: GameState,
    difficulty: AIDifficulty,
    playerId: string,
    timeLimit?: number
  ): Promise<Result<Move>> {
    try {
      const startTime = performance.now();
      const metadata = state.metadata as unknown as TicTacToeMetadata;
      const symbol = getPlayerSymbol(state, playerId);
      
      // Check if it's actually the AI's turn
      const currentPlayer = state.players[state.currentPlayer];
      if (currentPlayer.id !== playerId) {
        return err('NOT_YOUR_TURN', 'Not AI player turn');
      }

      // Get available moves
      const emptyPositions = getEmptyPositions(metadata.boardState);
      if (emptyPositions.length === 0) {
        return err('INVALID_GAME_STATE', 'No moves available');
      }

      let chosenPosition: import('@gpg/shared').GridCoordinate;

      // Apply time limit if specified
      const effectiveTimeLimit = timeLimit || this.getDefaultTimeLimit(difficulty);

      // Choose move based on difficulty level
      switch (difficulty) {
        case 1:
          chosenPosition = await this.getRandomMove(metadata.boardState);
          break;
        case 2:
          chosenPosition = await this.getDefensiveMove(metadata.boardState, symbol, effectiveTimeLimit);
          break;
        case 3:
          chosenPosition = await this.getBasicStrategyMove(metadata.boardState, symbol, effectiveTimeLimit);
          break;
        case 4:
          chosenPosition = await this.getMinimaxMove(metadata.boardState, symbol, 3, effectiveTimeLimit);
          break;
        case 5:
          chosenPosition = await this.getMinimaxMove(metadata.boardState, symbol, 5, effectiveTimeLimit);
          break;
        case 6:
          chosenPosition = await this.getMinimaxMove(metadata.boardState, symbol, 9, effectiveTimeLimit);
          break;
        default:
          return err('AI_ERROR', `Invalid difficulty level: ${difficulty}`);
      }

      const elapsedTime = performance.now() - startTime;
      console.log(`AI (Level ${difficulty}) took ${elapsedTime.toFixed(2)}ms to decide`);

      const move = createMove(chosenPosition, symbol, playerId);
      return ok(move);

    } catch (error) {
      return err('AI_ERROR', `AI move generation failed: ${String(error)}`);
    }
  }

  /**
   * Get a hint for human players
   */
  async getHint(state: GameState, playerId: string): Promise<Hint | null> {
    try {
      const metadata = state.metadata as unknown as TicTacToeMetadata;
      const symbol = getPlayerSymbol(state, playerId);
      
      // Use level 6 AI to find the best move
      const position = await this.getMinimaxMove(metadata.boardState, symbol, 9, 5000);
      const evaluation = this.evaluatePosition(state, playerId);
      
      // Create explanation based on position evaluation
      let explanation: string;
      let confidence: number;

      if (evaluation > 50) {
        explanation = "This move leads to a winning position! Take it.";
        confidence = 0.95;
      } else if (evaluation > 0) {
        explanation = "This move gives you a slight advantage.";
        confidence = 0.75;
      } else if (evaluation === 0) {
        explanation = "This move maintains balance - it's a safe choice.";
        confidence = 0.6;
      } else if (evaluation > -50) {
        explanation = "This move helps defend against opponent threats.";
        confidence = 0.7;
      } else {
        explanation = "This move prevents immediate loss.";
        confidence = 0.9;
      }

      const hintMove = createMove(position, symbol, playerId);

      return {
        suggestion: hintMove,
        explanation,
        confidence
      };

    } catch (error) {
      console.warn('Hint generation failed:', error);
      return null;
    }
  }

  /**
   * Evaluate a position for the AI
   */
  evaluatePosition(state: GameState, playerId: string): number {
    const metadata = state.metadata as unknown as TicTacToeMetadata;
    const symbol = getPlayerSymbol(state, playerId);
    
    return this.staticEvaluateBoard(metadata.boardState, symbol);
  }

  // ============================================================================
  // Private AI Implementation Methods
  // ============================================================================

  /**
   * Get default time limit for each difficulty level (milliseconds)
   */
  private getDefaultTimeLimit(difficulty: AIDifficulty): number {
    const timeLimits: Record<AIDifficulty, number> = {
      1: 50,    // Random - very fast
      2: 100,   // Defensive - fast
      3: 200,   // Basic strategy - moderate
      4: 500,   // Minimax depth 3 - slower
      5: 1000,  // Minimax depth 5 - slow
      6: 2000   // Perfect play - slowest
    };
    return timeLimits[difficulty];
  }

  /**
   * Level 1: Random move selection
   */
  private async getRandomMove(board: BoardState): Promise<import('@gpg/shared').GridCoordinate> {
    const emptyPositions = getEmptyPositions(board);
    const randomIndex = Math.floor(Math.random() * emptyPositions.length);
    return emptyPositions[randomIndex];
  }

  /**
   * Level 2: Defensive AI - blocks opponent wins, otherwise random
   */
  private async getDefensiveMove(
    board: BoardState, 
    symbol: TicTacToeSymbol, 
    timeLimit: number
  ): Promise<import('@gpg/shared').GridCoordinate> {
    const startTime = performance.now();
    const opponent = getOpponentSymbol(symbol);
    
    // Check if opponent can win next turn and block it
    for (let y = 0; y < GAME_CONSTANTS.BOARD_SIZE; y++) {
      for (let x = 0; x < GAME_CONSTANTS.BOARD_SIZE; x++) {
        if (board[y][x] === null) {
          const testBoard = cloneBoard(board);
          testBoard[y][x] = opponent;
          
          if (checkWin(testBoard).winner === opponent) {
            return { x, y };
          }
        }
        
        // Time limit check
        if (performance.now() - startTime > timeLimit) {
          break;
        }
      }
    }
    
    // Otherwise random move
    return this.getRandomMove(board);
  }

  /**
   * Level 3: Basic Strategy - win if possible, block if necessary, otherwise strategic
   */
  private async getBasicStrategyMove(
    board: BoardState, 
    symbol: TicTacToeSymbol, 
    timeLimit: number
  ): Promise<import('@gpg/shared').GridCoordinate> {
    const startTime = performance.now();
    const opponent = getOpponentSymbol(symbol);
    
    // 1. Take winning move if available
    for (let y = 0; y < GAME_CONSTANTS.BOARD_SIZE; y++) {
      for (let x = 0; x < GAME_CONSTANTS.BOARD_SIZE; x++) {
        if (board[y][x] === null) {
          const testBoard = cloneBoard(board);
          testBoard[y][x] = symbol;
          
          if (checkWin(testBoard).winner === symbol) {
            return { x, y };
          }
        }
        
        if (performance.now() - startTime > timeLimit) {
          return this.getRandomMove(board);
        }
      }
    }
    
    // 2. Block opponent win
    for (let y = 0; y < GAME_CONSTANTS.BOARD_SIZE; y++) {
      for (let x = 0; x < GAME_CONSTANTS.BOARD_SIZE; x++) {
        if (board[y][x] === null) {
          const testBoard = cloneBoard(board);
          testBoard[y][x] = opponent;
          
          if (checkWin(testBoard).winner === opponent) {
            return { x, y };
          }
        }
        
        if (performance.now() - startTime > timeLimit) {
          return this.getRandomMove(board);
        }
      }
    }
    
    // 3. Take center if available
    if (board[1][1] === null) {
      return GAME_CONSTANTS.CENTER_POSITION;
    }
    
    // 4. Take corners
    for (const corner of GAME_CONSTANTS.CORNER_POSITIONS) {
      if (board[corner.y][corner.x] === null) {
        return corner;
      }
    }
    
    // 5. Take edges
    for (const edge of GAME_CONSTANTS.EDGE_POSITIONS) {
      if (board[edge.y][edge.x] === null) {
        return edge;
      }
    }
    
    // 6. Fallback to random
    return this.getRandomMove(board);
  }

  /**
   * Levels 4-6: Minimax with alpha-beta pruning
   */
  private async getMinimaxMove(
    board: BoardState,
    symbol: TicTacToeSymbol,
    maxDepth: number,
    timeLimit: number
  ): Promise<import('@gpg/shared').GridCoordinate> {
    const startTime = performance.now();
    this.evaluationStats.totalEvaluations++;
    
    // Clear cache periodically to prevent memory leaks
    if (this.memoCache.size > 10000) {
      this.memoCache.clear();
    }
    
    const result = this.minimax(
      board,
      maxDepth,
      true, // maximizing player
      -Infinity,
      Infinity,
      symbol,
      startTime,
      timeLimit
    );
    
    if (!result.bestMove) {
      // Fallback to random if minimax fails
      console.warn('Minimax failed to find best move, falling back to random');
      return this.getRandomMove(board);
    }
    
    const elapsedTime = performance.now() - startTime;
    console.log(
      `Minimax (depth ${maxDepth}): evaluated ${result.nodesEvaluated} nodes in ${elapsedTime.toFixed(2)}ms. ` +
      `Cache: ${this.evaluationStats.cacheHits} hits, ${this.evaluationStats.cacheMisses} misses`
    );
    
    return result.bestMove;
  }

  /**
   * Minimax algorithm with alpha-beta pruning and memoization
   */
  private minimax(
    board: BoardState,
    depth: number,
    isMaximizing: boolean,
    alpha: number,
    beta: number,
    maximizingSymbol: TicTacToeSymbol,
    startTime: number,
    timeLimit: number
  ): MinimaxResult {
    // Time limit check
    if (performance.now() - startTime > timeLimit) {
      return {
        score: 0,
        nodesEvaluated: 1,
        depth: depth
      };
    }
    
    // Create cache key
    const cacheKey = `${getBoardHash(board)}-${depth}-${isMaximizing}-${maximizingSymbol}`;
    if (this.memoCache.has(cacheKey)) {
      this.evaluationStats.cacheHits++;
      return this.memoCache.get(cacheKey)!;
    }
    this.evaluationStats.cacheMisses++;
    
    const winResult = checkWin(board);
    
    // Terminal states
    if (winResult.winner === maximizingSymbol) {
      const result = { score: GAME_CONSTANTS.WINNING_SCORE + depth, nodesEvaluated: 1, depth };
      this.memoCache.set(cacheKey, result);
      return result;
    }
    
    if (winResult.winner && winResult.winner !== maximizingSymbol) {
      const result = { score: GAME_CONSTANTS.LOSING_SCORE - depth, nodesEvaluated: 1, depth };
      this.memoCache.set(cacheKey, result);
      return result;
    }
    
    if (isBoardFull(board)) {
      const result = { score: GAME_CONSTANTS.DRAW_SCORE, nodesEvaluated: 1, depth };
      this.memoCache.set(cacheKey, result);
      return result;
    }
    
    // Depth limit reached - use static evaluation
    if (depth === 0) {
      const score = this.staticEvaluateBoard(board, maximizingSymbol);
      const result = { score, nodesEvaluated: 1, depth };
      this.memoCache.set(cacheKey, result);
      return result;
    }
    
    let bestMove: import('@gpg/shared').GridCoordinate | undefined;
    let totalNodes = 1;
    
    if (isMaximizing) {
      let maxScore = -Infinity;
      
      const moves = this.getOrderedMoves(board);
      for (const position of moves) {
        const testBoard = cloneBoard(board);
        testBoard[position.y][position.x] = maximizingSymbol;
        
        const result = this.minimax(
          testBoard,
          depth - 1,
          false,
          alpha,
          beta,
          maximizingSymbol,
          startTime,
          timeLimit
        );
        
        totalNodes += result.nodesEvaluated;
        
        if (result.score > maxScore) {
          maxScore = result.score;
          bestMove = position;
        }
        
        alpha = Math.max(alpha, result.score);
        if (beta <= alpha) {
          break; // Alpha-beta pruning
        }
        
        // Time limit check
        if (performance.now() - startTime > timeLimit) {
          break;
        }
      }
      
      const finalResult = { score: maxScore, bestMove, nodesEvaluated: totalNodes, depth };
      this.memoCache.set(cacheKey, finalResult);
      return finalResult;
      
    } else {
      let minScore = Infinity;
      const opponentSymbol = getOpponentSymbol(maximizingSymbol);
      
      const moves = this.getOrderedMoves(board);
      for (const position of moves) {
        const testBoard = cloneBoard(board);
        testBoard[position.y][position.x] = opponentSymbol;
        
        const result = this.minimax(
          testBoard,
          depth - 1,
          true,
          alpha,
          beta,
          maximizingSymbol,
          startTime,
          timeLimit
        );
        
        totalNodes += result.nodesEvaluated;
        
        if (result.score < minScore) {
          minScore = result.score;
        }
        
        beta = Math.min(beta, result.score);
        if (beta <= alpha) {
          break; // Alpha-beta pruning
        }
        
        // Time limit check
        if (performance.now() - startTime > timeLimit) {
          break;
        }
      }
      
      const finalResult = { score: minScore, nodesEvaluated: totalNodes, depth };
      this.memoCache.set(cacheKey, finalResult);
      return finalResult;
    }
  }

  /**
   * Get moves in a good order for alpha-beta pruning (move ordering heuristic)
   */
  private getOrderedMoves(board: BoardState): import('@gpg/shared').GridCoordinate[] {
    const emptyPositions = getEmptyPositions(board);
    
    // Order moves by strategic value: center > corners > edges
    return emptyPositions.sort((a, b) => {
      const scoreA = this.getMoveOrderScore(a);
      const scoreB = this.getMoveOrderScore(b);
      return scoreB - scoreA; // Higher score first
    });
  }

  /**
   * Get ordering score for move ordering heuristic
   */
  private getMoveOrderScore(position: import('@gpg/shared').GridCoordinate): number {
    // Center is best
    if (position.x === 1 && position.y === 1) return 4;
    
    // Corners are good
    if ((position.x === 0 || position.x === 2) && (position.y === 0 || position.y === 2)) return 3;
    
    // Edges are okay
    return 1;
  }

  /**
   * Static board evaluation for non-terminal positions
   */
  private staticEvaluateBoard(board: BoardState, symbol: TicTacToeSymbol): number {
    let score = 0;
    const opponent = getOpponentSymbol(symbol);
    
    // Evaluate each winning line
    for (const line of WINNING_LINES) {
      const [a, b, c] = line;
      const posA = indexToCoord(a);
      const posB = indexToCoord(b);
      const posC = indexToCoord(c);
      
      const cellA = board[posA.y][posA.x];
      const cellB = board[posB.y][posB.x];
      const cellC = board[posC.y][posC.x];
      
      score += this.evaluateLine(cellA, cellB, cellC, symbol, opponent);
    }
    
    return score;
  }

  /**
   * Evaluate a single line (row, column, or diagonal)
   */
  private evaluateLine(
    cellA: TicTacToeSymbol | null,
    cellB: TicTacToeSymbol | null,
    cellC: TicTacToeSymbol | null,
    symbol: TicTacToeSymbol,
    opponent: TicTacToeSymbol
  ): number {
    let score = 0;
    
    // Count our pieces and opponent pieces in this line
    const ourCount = [cellA, cellB, cellC].filter(cell => cell === symbol).length;
    const oppCount = [cellA, cellB, cellC].filter(cell => cell === opponent).length;
    
    // Line is blocked if both players have pieces in it
    if (ourCount > 0 && oppCount > 0) {
      return 0;
    }
    
    // Evaluate based on our pieces
    if (ourCount === 3) score += 100;      // We win
    else if (ourCount === 2) score += 10; // Good position
    else if (ourCount === 1) score += 1;  // Slight advantage
    
    // Evaluate based on opponent pieces (negative for us)
    if (oppCount === 3) score -= 100;      // We lose
    else if (oppCount === 2) score -= 10; // Bad for us
    else if (oppCount === 1) score -= 1;  // Slight disadvantage
    
    return score;
  }

  /**
   * Clear the memoization cache
   */
  public clearCache(): void {
    this.memoCache.clear();
    this.evaluationStats = {
      cacheHits: 0,
      cacheMisses: 0,
      totalEvaluations: 0
    };
  }

  /**
   * Get AI performance statistics
   */
  public getStats() {
    return {
      ...this.evaluationStats,
      cacheSize: this.memoCache.size,
      hitRate: this.evaluationStats.cacheHits / 
               (this.evaluationStats.cacheHits + this.evaluationStats.cacheMisses)
    };
  }
}