/**
 * @fileoverview Dots and Boxes Game Engine
 *
 * Implements the core game logic for Dots and Boxes following the same
 * patterns established by TicTacToeEngine.
 */

import { GameEngineAPI, GameState, Player, Result, GameSettings, ValidationResult, GameOver, Scoreboard } from '@gpg/shared';
import { ok, err } from '@gpg/shared';

import type {
  DotsAndBoxesMetadata,
  DotsAndBoxesMove,
  DotsAndBoxesConfig,
  BoxStatus,
  GameAnalysis,
  CreateMoveParams,
} from './types';

export class DotsAndBoxesEngine implements GameEngineAPI {
  readonly gameType = 'dots-and-boxes';
  readonly supportedPlayers = [2];

  /**
   * Create initial game state for Dots and Boxes
   */
  createInitialState(settings: GameSettings, players: readonly Player[]): Result<GameState> {
    if (players.length !== 2) {
      return err({
        code: 'INVALID_GAME_STATE',
        message: 'Dots and Boxes requires exactly 2 players'
      });
    }

    const gameConfig = settings as DotsAndBoxesConfig;
    const { width, height } = gameConfig.gridSize || { width: 4, height: 4 };

    // Validate grid size
    if (width < 2 || height < 2 || width > 8 || height > 8) {
      return err({
        code: 'INVALID_GAME_STATE',
        message: 'Grid size must be between 2x2 and 8x8 dots'
      });
    }

    // Initialize line arrays - all false (no lines drawn)
    // Both arrays use consistent [row][col] indexing
    const horizontalLines = Array(height)
      .fill(null)
      .map(() => Array(width - 1).fill(false));
    // Vertical lines: [row][col] where row < height-1, col < width
    const verticalLines = Array(height - 1)
      .fill(null)
      .map(() => Array(width).fill(false));

    // Initialize box ownership - all null (no boxes completed)
    const completedBoxes = Array(height - 1)
      .fill(null)
      .map(() => Array(width - 1).fill(null));

    // Calculate all available moves initially
    const availableMoves = this.calculateAvailableMoves(horizontalLines, verticalLines);

    // Debug: Verify consistent data structure dimensions
    console.log('Engine - Creating consistent [row][col] data structures:');
    console.log(`  Grid: ${width}x${height} dots`);
    console.log(`  HorizontalLines: ${horizontalLines.length} rows x ${horizontalLines[0].length} cols`);
    console.log(`  VerticalLines: ${verticalLines.length} rows x ${verticalLines[0].length} cols`);

    const metadata: DotsAndBoxesMetadata = {
      gridSize: { width, height },
      horizontalLines,
      verticalLines,
      completedBoxes,
      playerScores: [0, 0],
      lastMoveCompletedBoxes: 0,
      availableMoves,
    };

    const gameState: GameState = {
      id: `dots-and-boxes-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      players: [...players],
      currentPlayer: 0,
      moves: [],
      turnNumber: 1,
      metadata: metadata as unknown as Record<string, unknown>,
    };

    return ok(gameState);
  }

  /**
   * Validate a move before applying it
   */
  validateMove(gameState: GameState, move: DotsAndBoxesMove, playerId: string): ValidationResult {
    const metadata = gameState.metadata as unknown as DotsAndBoxesMetadata;
    const { position, data } = move;
    const { row, col } = position;
    const { lineType } = data;

    // Check if it's the player's turn
    if (gameState.players[gameState.currentPlayer].id !== playerId) {
      return { isValid: false, error: 'Not your turn' };
    }

    // Check if game is over
    if (this.isTerminal(gameState)) {
      return { isValid: false, error: 'Game is already over' };
    }

    // Validate line position bounds
    if (lineType === 'horizontal') {
      if (
        row < 0 ||
        row >= metadata.gridSize.height ||
        col < 0 ||
        col >= metadata.gridSize.width - 1
      ) {
        return { isValid: false, error: 'Invalid horizontal line position' };
      }
      // Check if line already exists
      if (metadata.horizontalLines[row][col]) {
        return { isValid: false, error: 'Line already drawn' };
      }
    } else {
      // vertical
      if (
        row < 0 ||
        row >= metadata.gridSize.height - 1 ||
        col < 0 ||
        col >= metadata.gridSize.width
      ) {
        return { isValid: false, error: 'Invalid vertical line position' };
      }
      // Check if line already exists - using [row][col] indexing
      if (metadata.verticalLines[row][col]) {
        return { isValid: false, error: 'Line already drawn' };
      }
    }

    return { isValid: true };
  }

  /**
   * Apply a move to the game state
   */
  applyMove(gameState: GameState, move: DotsAndBoxesMove): Result<GameState> {
    const validation = this.validateMove(gameState, move, move.data.playerId);
    if (!validation.isValid) {
      return err({
        code: 'INVALID_MOVE',
        message: validation.error || 'Invalid move'
      });
    }

    const newState = JSON.parse(JSON.stringify(gameState)) as GameState;
    const metadata = newState.metadata as unknown as DotsAndBoxesMetadata;
    const { position, data } = move;
    const { row, col } = position;
    const { lineType, playerId } = data;

    // Draw the line - both use consistent [row][col] indexing
    if (lineType === 'horizontal') {
      metadata.horizontalLines[row][col] = true;
    } else {
      metadata.verticalLines[row][col] = true;
    }

    // Check for completed boxes and update scores
    const completedBoxes = this.checkCompletedBoxes(metadata, row, col, lineType);
    let boxesCompleted = 0;

    completedBoxes.forEach(boxPos => {
      if (metadata.completedBoxes[boxPos.row][boxPos.col] === null) {
        metadata.completedBoxes[boxPos.row][boxPos.col] = playerId;
        boxesCompleted++;
      }
    });

    // Update player score
    const currentPlayerIndex = newState.currentPlayer;
    metadata.playerScores[currentPlayerIndex] += boxesCompleted;
    metadata.lastMoveCompletedBoxes = boxesCompleted;

    // Update available moves
    metadata.availableMoves = this.calculateAvailableMoves(
      metadata.horizontalLines,
      metadata.verticalLines
    );

    // Create new state with move added and turn incremented
    const stateWithMove = {
      ...newState,
      moves: [...newState.moves, move],
      turnNumber: newState.turnNumber + 1,
      metadata: metadata as unknown as Record<string, unknown>
    };

    // Check if player gets another turn (completed at least one box)
    const finalState = boxesCompleted === 0 ? {
      ...stateWithMove,
      currentPlayer: (stateWithMove.currentPlayer + 1) % stateWithMove.players.length
    } : stateWithMove;

    return ok(finalState);
  }

  /**
   * Check if the game is over and who won
   */
  isTerminal(gameState: GameState): GameOver | null {
    const metadata = gameState.metadata as unknown as DotsAndBoxesMetadata;
    const totalPossibleBoxes = (metadata.gridSize.width - 1) * (metadata.gridSize.height - 1);
    const completedBoxes = metadata.playerScores.reduce((sum, score) => sum + score, 0);

    // Game ends when all boxes are completed
    if (completedBoxes >= totalPossibleBoxes) {
      const [player1Score, player2Score] = metadata.playerScores;
      
      const finalScores: Scoreboard = {
        players: [
          { playerId: gameState.players[0].id, score: player1Score, rank: player1Score > player2Score ? 1 : (player1Score === player2Score ? 1 : 2) },
          { playerId: gameState.players[1].id, score: player2Score, rank: player2Score > player1Score ? 1 : (player1Score === player2Score ? 1 : 2) }
        ],
        winner: player1Score > player2Score ? gameState.players[0].id : (player2Score > player1Score ? gameState.players[1].id : undefined),
        isDraw: player1Score === player2Score
      };

      return {
        isGameOver: true,
        winner: finalScores.winner,
        reason: finalScores.isDraw ? 'draw' : 'victory',
        finalScores
      };
    }

    return null;
  }

  /**
   * Get all available moves for the current game state
   */
  getAvailableMoves(gameState: GameState): DotsAndBoxesMove[] {
    const metadata = gameState.metadata as unknown as DotsAndBoxesMetadata;
    return metadata.availableMoves;
  }

  /**
   * Calculate current scores for all players (required by GameEngineAPI)
   */
  evaluate(gameState: GameState): Scoreboard {
    const metadata = gameState.metadata as unknown as DotsAndBoxesMetadata;
    const [player1Score, player2Score] = metadata.playerScores;
    
    return {
      players: [
        { playerId: gameState.players[0].id, score: player1Score, rank: player1Score > player2Score ? 1 : (player1Score === player2Score ? 1 : 2) },
        { playerId: gameState.players[1].id, score: player2Score, rank: player2Score > player1Score ? 1 : (player1Score === player2Score ? 1 : 2) }
      ],
      winner: player1Score > player2Score ? gameState.players[0].id : (player2Score > player1Score ? gameState.players[1].id : undefined),
      isDraw: player1Score === player2Score
    };
  }

  /**
   * Analyze the current game state for strategic insights
   */
  analyzeGameState(gameState: GameState): GameAnalysis {
    const metadata = gameState.metadata as unknown as DotsAndBoxesMetadata;
    const { width, height } = metadata.gridSize;
    const totalBoxes = (width - 1) * (height - 1);

    const availableBoxes: BoxStatus[] = [];
    const completableBoxes: BoxStatus[] = [];
    const safeBoxes: BoxStatus[] = [];

    let completedBoxes = 0;
    let chainPotential = 0;

    // Analyze each box
    for (let row = 0; row < height - 1; row++) {
      for (let col = 0; col < width - 1; col++) {
        const boxStatus = this.analyzeBox(metadata, row, col);

        if (boxStatus.owner) {
          completedBoxes++;
        } else {
          availableBoxes.push(boxStatus);

          if (boxStatus.isCompletable) {
            completableBoxes.push(boxStatus);
            chainPotential += this.calculateChainPotential(metadata, row, col);
          } else if (boxStatus.completedSides <= 2) {
            safeBoxes.push(boxStatus);
          }
        }
      }
    }

    return {
      totalBoxes,
      completedBoxes,
      availableBoxes,
      completableBoxes,
      safeBoxes,
      chainPotential,
    };
  }

  // ============================================================================
  // PRIVATE HELPER METHODS
  // ============================================================================

  private calculateAvailableMoves(
    horizontalLines: boolean[][],
    verticalLines: boolean[][]
  ): DotsAndBoxesMove[] {
    const moves: DotsAndBoxesMove[] = [];
    const height = horizontalLines.length;
    const width = horizontalLines[0].length + 1;

    // Add available horizontal lines
    for (let row = 0; row < height; row++) {
      for (let col = 0; col < width - 1; col++) {
        if (!horizontalLines[row][col]) {
          moves.push(createMove({ lineType: 'horizontal', position: { row, col }, playerId: '' }));
        }
      }
    }

    // Add available vertical lines - using [row][col] indexing
    for (let row = 0; row < height - 1; row++) {
      for (let col = 0; col < width; col++) {
        if (!verticalLines[row][col]) {
          moves.push(createMove({ lineType: 'vertical', position: { row, col }, playerId: '' }));
        }
      }
    }

    return moves;
  }

  private checkCompletedBoxes(
    metadata: DotsAndBoxesMetadata,
    lineRow: number,
    lineCol: number,
    lineType: 'horizontal' | 'vertical'
  ): { row: number; col: number }[] {
    const completedBoxes: { row: number; col: number }[] = [];
    const { width, height } = metadata.gridSize;

    if (lineType === 'horizontal') {
      // Check boxes above and below the horizontal line
      const boxesAbove = lineRow > 0 ? [{ row: lineRow - 1, col: lineCol }] : [];
      const boxesBelow = lineRow < height - 1 ? [{ row: lineRow, col: lineCol }] : [];

      [...boxesAbove, ...boxesBelow].forEach(boxPos => {
        if (this.isBoxComplete(metadata, boxPos.row, boxPos.col)) {
          completedBoxes.push(boxPos);
        }
      });
    } else {
      // vertical
      // Check boxes left and right of the vertical line
      const boxesLeft = lineCol > 0 ? [{ row: lineRow, col: lineCol - 1 }] : [];
      const boxesRight = lineCol < width - 1 ? [{ row: lineRow, col: lineCol }] : [];

      [...boxesLeft, ...boxesRight].forEach(boxPos => {
        if (this.isBoxComplete(metadata, boxPos.row, boxPos.col)) {
          completedBoxes.push(boxPos);
        }
      });
    }

    return completedBoxes;
  }

  private isBoxComplete(metadata: DotsAndBoxesMetadata, boxRow: number, boxCol: number): boolean {
    const { horizontalLines, verticalLines } = metadata;

    // Check all 4 sides of the box - consistent [row][col] indexing
    const topLine = horizontalLines[boxRow][boxCol];
    const bottomLine = horizontalLines[boxRow + 1][boxCol];
    const leftLine = verticalLines[boxRow][boxCol];
    const rightLine = verticalLines[boxRow][boxCol + 1];

    return topLine && bottomLine && leftLine && rightLine;
  }

  private analyzeBox(metadata: DotsAndBoxesMetadata, boxRow: number, boxCol: number): BoxStatus {
    const { horizontalLines, verticalLines, completedBoxes } = metadata;
    const owner = completedBoxes[boxRow][boxCol];

    // Count completed sides
    let completedSides = 0;
    let missingMove: DotsAndBoxesMove | null = null;

    const sides = [
      { type: 'horizontal', row: boxRow, col: boxCol, exists: horizontalLines[boxRow][boxCol] },
      {
        type: 'horizontal',
        row: boxRow + 1,
        col: boxCol,
        exists: horizontalLines[boxRow + 1][boxCol],
      },
      // Consistent [row][col] indexing for vertical lines
      { type: 'vertical', row: boxRow, col: boxCol, exists: verticalLines[boxRow][boxCol] },
      { type: 'vertical', row: boxRow, col: boxCol + 1, exists: verticalLines[boxRow][boxCol + 1] },
    ];

    sides.forEach(side => {
      if (side.exists) {
        completedSides++;
      } else if (completedSides === 2 && !missingMove) {
        // This could be the completing move if it's the only missing side
        missingMove = createMove({
          lineType: side.type as 'horizontal' | 'vertical',
          position: { row: side.row, col: side.col },
          playerId: '',
        });
      }
    });

    // Box is completable if it has exactly 3 sides
    const isCompletable = completedSides === 3;
    if (isCompletable && !missingMove) {
      // Find the missing side
      sides.forEach(side => {
        if (!side.exists) {
          missingMove = createMove({
            lineType: side.type as 'horizontal' | 'vertical',
            position: { row: side.row, col: side.col },
            playerId: '',
          });
        }
      });
    }

    return {
      position: { row: boxRow, col: boxCol },
      completedSides,
      owner,
      isCompletable,
      completingMove: isCompletable ? missingMove : null,
    };
  }

  private calculateChainPotential(
    metadata: DotsAndBoxesMetadata,
    boxRow: number,
    boxCol: number
  ): number {
    // Simplified chain calculation - count adjacent boxes that are also completable
    let chainLength = 1;
    const { width, height } = metadata.gridSize;

    // Check adjacent boxes (simplified for now)
    const adjacent = [
      { row: boxRow - 1, col: boxCol },
      { row: boxRow + 1, col: boxCol },
      { row: boxRow, col: boxCol - 1 },
      { row: boxRow, col: boxCol + 1 },
    ];

    adjacent.forEach(adj => {
      if (adj.row >= 0 && adj.row < height - 1 && adj.col >= 0 && adj.col < width - 1) {
        const adjBox = this.analyzeBox(metadata, adj.row, adj.col);
        if (adjBox.isCompletable) {
          chainLength++;
        }
      }
    });

    return Math.max(1, chainLength - 1); // Don't count the original box
  }
}

/**
 * Utility function to create a DotsAndBoxesMove
 */
export function createMove(params: CreateMoveParams): DotsAndBoxesMove {
  const { lineType, position, playerId } = params;
  const moveId = `${lineType}-${position.row}-${position.col}-${Date.now()}`;

  return {
    id: moveId,
    type: lineType,
    position,
    playerId,
    timestamp: new Date(),
    data: {
      lineType,
      position,
      playerId,
    },
  } as DotsAndBoxesMove;
}
