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
 * @fileoverview Tic-Tac-Toe game engine implementation
 */

import type {
  GameEngineAPI,
  GameState,
  GameSettings,
  Move,
  Player,
  ValidationResult,
  GameOver,
  Scoreboard,
  Result,
  Grid,
  GridCell,
  GameAnnotation,
} from '@gpg/shared';

import { createOk as ok, createErr as err } from '@gpg/shared';

import type { TicTacToeMove, TicTacToeMetadata } from './types';

import { GAME_CONSTANTS } from './types';

import {
  createEmptyBoard,
  checkWin,
  isDraw,
  getPlayerSymbol,
  applyMoveToBoard,
  isValidPosition,
  isEmpty,
  getEmptyPositions,
  createMove,
  isPartOfWinningLine,
} from './utils';

/**
 * Tic-Tac-Toe game engine implementation
 */
export class TicTacToeEngine implements GameEngineAPI {
  /**
   * Create the initial game state
   */
  createInitialState(settings: GameSettings, players: readonly Player[]): Result<GameState> {
    try {
      // Validate settings
      if (settings.gameType !== 'tic-tac-toe') {
        return err('INVALID_GAME_STATE', 'Invalid game type for Tic-Tac-Toe engine', {
          gameType: settings.gameType,
        });
      }

      // Validate player count
      if (players.length !== 2) {
        return err('INVALID_GAME_STATE', 'Tic-Tac-Toe requires exactly 2 players', {
          playerCount: players.length,
        });
      }

      // Create empty board
      const emptyBoard = createEmptyBoard();

      // Create grid representation for framework
      const grid: Grid = {
        width: GAME_CONSTANTS.BOARD_SIZE,
        height: GAME_CONSTANTS.BOARD_SIZE,
        type: 'square',
        cells: emptyBoard.map((row, y) =>
          row.map(
            (_, x) =>
              ({
                coordinate: { x, y },
                state: 'empty' as const,
                metadata: {},
              }) as GridCell
          )
        ),
      };

      // Create initial metadata
      const metadata: TicTacToeMetadata = {
        boardState: emptyBoard,
        isDraw: false,
        moveHistory: [],
        lastMove: undefined,
      };

      // Create initial game state (X always goes first)
      const gameState: GameState = {
        id: `tic-tac-toe-${Date.now()}`,
        currentPlayer: 0, // First player (X)
        players: [...players],
        grid,
        moves: [],
        turnNumber: 1,
        metadata: metadata as unknown as Record<string, unknown>,
      };

      return ok(gameState);
    } catch (error) {
      return err('INVALID_GAME_STATE', 'Failed to create initial game state', {
        error: String(error),
      });
    }
  }

  /**
   * Validate a move before applying it
   */
  validateMove(state: GameState, move: Move, playerId: string): ValidationResult {
    try {
      // Cast to game-specific move type
      const ticMove = move as TicTacToeMove;

      // Basic validations
      if (ticMove.type !== 'place') {
        return {
          isValid: false,
          error: 'Invalid move type',
          code: 'INVALID_MOVE',
        };
      }

      // Check player turn
      const currentPlayerIndex = state.currentPlayer;
      const currentPlayer = state.players[currentPlayerIndex];
      if (currentPlayer.id !== playerId) {
        return {
          isValid: false,
          error: 'Not your turn',
          code: 'NOT_YOUR_TURN',
        };
      }

      // Check game not over
      const terminal = this.isTerminal(state);
      if (terminal) {
        return {
          isValid: false,
          error: 'Game is over',
          code: 'GAME_OVER',
        };
      }

      // Check position bounds
      const pos = ticMove.data.position;
      if (!isValidPosition(pos)) {
        return {
          isValid: false,
          error: 'Position out of bounds',
          code: 'INVALID_MOVE',
        };
      }

      // Check position empty
      const metadata = state.metadata as unknown as TicTacToeMetadata;
      if (!isEmpty(metadata.boardState, pos)) {
        return {
          isValid: false,
          error: 'Position already occupied',
          code: 'INVALID_MOVE',
        };
      }

      // Check symbol matches player
      const expectedSymbol = getPlayerSymbol(state, playerId);
      if (ticMove.data.symbol !== expectedSymbol) {
        return {
          isValid: false,
          error: `Expected symbol ${expectedSymbol}, got ${ticMove.data.symbol}`,
          code: 'INVALID_MOVE',
        };
      }

      return { isValid: true };
    } catch (_error) {
      return {
        isValid: false,
        error: 'Move validation failed',
        code: 'INVALID_MOVE',
      };
    }
  }

  /**
   * Apply a validated move to the game state
   */
  applyMove(state: GameState, move: Move): Result<GameState> {
    try {
      const ticMove = move as TicTacToeMove;
      const currentMetadata = state.metadata as unknown as TicTacToeMetadata;

      // Apply move to board
      const newBoard = applyMoveToBoard(currentMetadata.boardState, ticMove);

      // Check for win/draw
      const winResult = checkWin(newBoard);
      const isGameDraw = isDraw(newBoard);

      // Create new metadata
      const newMetadata: TicTacToeMetadata = {
        boardState: newBoard,
        winner: winResult.winner || undefined,
        winningLine: winResult.winningLine,
        isDraw: isGameDraw,
        moveHistory: [...currentMetadata.moveHistory, ticMove],
        lastMove: ticMove,
      };

      // Update grid representation
      const newGrid: Grid = {
        ...state.grid!,
        cells: newBoard.map((row, y) =>
          row.map(
            (cell, x) =>
              ({
                coordinate: { x, y },
                state: cell ? 'occupied' : 'empty',
                owner: cell || undefined,
                metadata:
                  winResult.winningLine && isPartOfWinningLine({ x, y }, winResult.winningLine)
                    ? { isWinningCell: true }
                    : {},
              }) as GridCell
          )
        ),
      };

      // Calculate next player (if game not over)
      const nextPlayerIndex =
        winResult.winner || isGameDraw
          ? state.currentPlayer // Keep same player if game is over
          : (state.currentPlayer + 1) % state.players.length;

      // Create new game state
      const newState: GameState = {
        ...state,
        currentPlayer: nextPlayerIndex,
        grid: newGrid,
        moves: [...state.moves, ticMove],
        turnNumber: state.turnNumber + 1,
        metadata: newMetadata as unknown as Record<string, unknown>,
      };

      return ok(newState);
    } catch (error) {
      return err('INVALID_GAME_STATE', 'Failed to apply move', {
        error: String(error),
        move: move.id,
      });
    }
  }

  /**
   * Check if the game has ended
   */
  isTerminal(state: GameState): GameOver | null {
    const metadata = state.metadata as unknown as TicTacToeMetadata;
    const winResult = checkWin(metadata.boardState);
    const isGameDraw = isDraw(metadata.boardState);

    if (winResult.winner) {
      // Game won
      const winner = state.players.find(p => getPlayerSymbol(state, p.id) === winResult.winner);
      const scores = this.evaluate(state);

      return {
        isGameOver: true,
        winner: winner?.id,
        reason: 'victory',
        finalScores: scores,
      };
    }

    if (isGameDraw) {
      // Game drawn
      const scores = this.evaluate(state);

      return {
        isGameOver: true,
        reason: 'draw',
        finalScores: scores,
      };
    }

    return null;
  }

  /**
   * Calculate current scores for all players
   */
  evaluate(state: GameState): Scoreboard {
    const metadata = state.metadata as unknown as TicTacToeMetadata;
    const winResult = checkWin(metadata.boardState);
    const isGameDraw = isDraw(metadata.boardState);

    const scores = state.players.map(player => {
      const symbol = getPlayerSymbol(state, player.id);
      let score = 0;
      let rank = 1;

      if (winResult.winner === symbol) {
        score = 1; // Win
        rank = 1;
      } else if (winResult.winner && winResult.winner !== symbol) {
        score = 0; // Loss
        rank = 2;
      } else {
        score = 0; // Draw or ongoing
        rank = 1;
      }

      return {
        playerId: player.id,
        score,
        rank,
      };
    });

    return {
      players: scores,
      winner: winResult.winner
        ? state.players.find(p => getPlayerSymbol(state, p.id) === winResult.winner)?.id
        : undefined,
      isDraw: isGameDraw,
    };
  }

  /**
   * Get all legal moves for a player
   */
  getLegalMoves(state: GameState, playerId: string): readonly Move[] {
    // Check if it's the player's turn
    const currentPlayer = state.players[state.currentPlayer];
    if (currentPlayer.id !== playerId) {
      return [];
    }

    // Check if game is over
    if (this.isTerminal(state)) {
      return [];
    }

    const metadata = state.metadata as unknown as TicTacToeMetadata;
    const emptyPositions = getEmptyPositions(metadata.boardState);
    const symbol = getPlayerSymbol(state, playerId);

    return emptyPositions.map(position => createMove(position, symbol, playerId));
  }

  /**
   * Generate annotations for the current state
   */
  getAnnotations(state: GameState): readonly GameAnnotation[] {
    const metadata = state.metadata as unknown as TicTacToeMetadata;
    const annotations: GameAnnotation[] = [];

    // Highlight winning line if game is over
    if (metadata.winningLine) {
      annotations.push({
        type: 'highlight',
        coordinates: metadata.winningLine.positions,
        color: '#f1c40f',
        style: 'solid',
      });
    }

    // Highlight last move
    if (metadata.lastMove) {
      annotations.push({
        type: 'highlight',
        coordinates: [metadata.lastMove.data.position],
        color: '#3498db',
        style: 'dashed',
      });
    }

    return annotations;
  }

  /**
   * Serialize game state for storage/transmission
   */
  serializeState(state: GameState): string {
    try {
      const serializable = {
        id: state.id,
        currentPlayer: state.currentPlayer,
        players: state.players,
        turnNumber: state.turnNumber,
        metadata: state.metadata,
        moves: state.moves,
      };

      return JSON.stringify(serializable);
    } catch (error) {
      throw new Error(`Failed to serialize game state: ${String(error)}`);
    }
  }

  /**
   * Deserialize game state from storage/transmission
   */
  deserializeState(serialized: string): Result<GameState> {
    try {
      const data = JSON.parse(serialized);

      // Reconstruct grid from metadata
      const metadata = data.metadata as TicTacToeMetadata;
      const grid: Grid = {
        width: GAME_CONSTANTS.BOARD_SIZE,
        height: GAME_CONSTANTS.BOARD_SIZE,
        type: 'square',
        cells: metadata.boardState.map((row, y) =>
          row.map(
            (cell, x) =>
              ({
                coordinate: { x, y },
                state: cell ? 'occupied' : 'empty',
                owner: cell || undefined,
                metadata:
                  metadata.winningLine && isPartOfWinningLine({ x, y }, metadata.winningLine)
                    ? { isWinningCell: true }
                    : {},
              }) as GridCell
          )
        ),
      };

      const gameState: GameState = {
        id: data.id,
        currentPlayer: data.currentPlayer,
        players: data.players,
        grid,
        moves: data.moves,
        turnNumber: data.turnNumber,
        metadata: data.metadata,
      };

      return ok(gameState);
    } catch (error) {
      return err('INVALID_GAME_STATE', 'Failed to deserialize game state', {
        error: String(error),
      });
    }
  }
}