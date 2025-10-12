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

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GameHUD } from '../components/GameHUD';
import type { Player, Scoreboard } from '@gpg/shared';
import type { TurnInfo } from '../turn-manager';

// Helper function to create a test player
const createTestPlayer = (id: string, name: string, overrides?: Partial<Player>): Player => ({
  id,
  name,
  avatar: `avatar-${id}`,
  isAI: false,
  difficulty: 1,
  score: 0,
  isActive: true,
  color: '#000000',
  ...overrides,
});

// Helper function to create test turn info
const createTestTurnInfo = (overrides?: Partial<TurnInfo>): TurnInfo => ({
  currentPlayer: createTestPlayer('player1', 'Alice'),
  playerIndex: 0,
  turnNumber: 1,
  phase: 'move',
  timeRemaining: undefined,
  canUndo: false,
  validMoves: undefined,
  ...overrides,
});

// Helper function to create test scoreboard
const createTestScoreboard = (overrides?: Partial<Scoreboard>): Scoreboard => ({
  players: [
    { playerId: 'player1', score: 100, rank: 1 },
    { playerId: 'player2', score: 80, rank: 2 },
  ],
  winner: undefined,
  isDraw: false,
  ...overrides,
});

describe('GameHUD', () => {
  describe('Basic rendering', () => {
    it('should render the HUD with required sections', () => {
      const turnInfo = createTestTurnInfo();

      render(<GameHUD turnInfo={turnInfo} />);

      // Should have main HUD container
      expect(document.querySelector('.game-hud')).toBeDefined();
    });

    it('should display current player information', () => {
      const turnInfo = createTestTurnInfo({
        currentPlayer: createTestPlayer('player1', 'Alice', { score: 150 }),
      });

      render(<GameHUD turnInfo={turnInfo} />);

      expect(screen.getAllByText('Alice')).toHaveLength(2); // Current player + all players sections
      expect(screen.getAllByText('Current Turn')).toHaveLength(2);
    });

    it('should display turn number and phase', () => {
      const turnInfo = createTestTurnInfo({
        turnNumber: 5,
        phase: 'move',
      });

      render(<GameHUD turnInfo={turnInfo} />);

      expect(screen.getByText('Turn 5')).toBeDefined();
      expect(screen.getByText('Phase: move')).toBeDefined();
    });
  });

  describe('Player information display', () => {
    it.skip('should show player name and avatar placeholder', () => {
      const turnInfo = createTestTurnInfo({
        currentPlayer: createTestPlayer('player1', 'Alice'),
      });

      render(<GameHUD turnInfo={turnInfo} />);

      expect(screen.getAllByText('Alice')).toHaveLength(2);
      expect(screen.getAllByText('A')).toHaveLength(2); // Avatar placeholder appears twice
    });

    it('should display AI indicator for AI players', () => {
      const turnInfo = createTestTurnInfo({
        currentPlayer: createTestPlayer('ai-player', 'AI Bot', { isAI: true, difficulty: 3 }),
      });

      render(<GameHUD turnInfo={turnInfo} />);

      expect(screen.getAllByText('AI Bot')).toHaveLength(2);
      expect(screen.getAllByText('AI')).toHaveLength(2);
    });

    it('should display player score when scoreboard is provided', () => {
      const turnInfo = createTestTurnInfo({
        currentPlayer: createTestPlayer('player1', 'Alice'),
      });
      const scoreboard = createTestScoreboard({
        players: [{ playerId: 'player1', score: 250, rank: 1 }],
      });

      render(<GameHUD turnInfo={turnInfo} scoreboard={scoreboard} />);

      expect(screen.getAllByText('Score: 250')).toHaveLength(2);
      expect(screen.getAllByText('Rank: #1')).toHaveLength(2);
    });

    it('should render actual avatar image when provided', () => {
      const turnInfo = createTestTurnInfo({
        currentPlayer: createTestPlayer('player1', 'Alice', {
          avatar: 'https://example.com/avatar.png',
        }),
      });

      render(<GameHUD turnInfo={turnInfo} />);

      const avatars = screen.getAllByRole('img', { name: 'Alice' });
      expect(avatars).toHaveLength(2);
      expect(avatars[0].getAttribute('src')).toBe('https://example.com/avatar.png');
    });
  });

  describe('Turn timer', () => {
    it('should not display timer when showTimer is false', () => {
      const turnInfo = createTestTurnInfo({ timeRemaining: 30 });

      render(<GameHUD turnInfo={turnInfo} showTimer={false} />);

      expect(screen.queryByText('Time Remaining')).toBeNull();
    });

    it('should display timer when enabled and time remaining is provided', () => {
      const turnInfo = createTestTurnInfo({ timeRemaining: 30 });

      render(<GameHUD turnInfo={turnInfo} showTimer={true} />);

      expect(screen.getByText('Time Remaining')).toBeDefined();
      expect(screen.getByText('30s')).toBeDefined();
    });

    it('should mark timer as urgent when time is low', () => {
      const turnInfo = createTestTurnInfo({ timeRemaining: 5 });

      render(<GameHUD turnInfo={turnInfo} showTimer={true} />);

      const timerElement = document.querySelector('.turn-timer');
      expect(timerElement?.classList.contains('urgent')).toBe(true);
    });

    it('should not mark timer as urgent when time is sufficient', () => {
      const turnInfo = createTestTurnInfo({ timeRemaining: 20 });

      render(<GameHUD turnInfo={turnInfo} showTimer={true} />);

      const timerElement = document.querySelector('.turn-timer');
      expect(timerElement?.classList.contains('urgent')).toBe(false);
    });

    it('should display timer progress bar with correct width', () => {
      const turnInfo = createTestTurnInfo({ timeRemaining: 30 });

      render(<GameHUD turnInfo={turnInfo} showTimer={true} />);

      const progressBar = document.querySelector('.timer-progress');
      expect(progressBar).toBeDefined();
      expect(progressBar?.getAttribute('style')).toContain('width: 50%'); // 30/60 * 100
    });

    it('should not display timer when timeRemaining is undefined', () => {
      const turnInfo = createTestTurnInfo({ timeRemaining: undefined });

      render(<GameHUD turnInfo={turnInfo} showTimer={true} />);

      expect(screen.queryByText('Time Remaining')).toBeNull();
    });
  });

  describe('Game controls', () => {
    it('should display all control buttons by default', () => {
      const turnInfo = createTestTurnInfo({ canUndo: true });

      render(<GameHUD turnInfo={turnInfo} />);

      expect(screen.getByRole('button', { name: /undo/i })).toBeDefined();
      expect(screen.getByRole('button', { name: /resign/i })).toBeDefined();
    });

    it('should hide undo button when showUndoButton is false', () => {
      const turnInfo = createTestTurnInfo({ canUndo: true });

      render(<GameHUD turnInfo={turnInfo} showUndoButton={false} />);

      expect(screen.queryByRole('button', { name: /undo/i })).toBeNull();
    });

    it('should show skip button when showSkipButton is true', () => {
      const turnInfo = createTestTurnInfo();

      render(<GameHUD turnInfo={turnInfo} showSkipButton={true} />);

      expect(screen.getByRole('button', { name: /skip turn/i })).toBeDefined();
    });

    it('should disable undo button when canUndo is false', () => {
      const turnInfo = createTestTurnInfo({ canUndo: false });

      render(<GameHUD turnInfo={turnInfo} />);

      const undoButton = screen.getByRole('button', { name: /undo/i });
      expect(undoButton.hasAttribute('disabled')).toBe(true);
    });

    it('should enable undo button when canUndo is true', () => {
      const turnInfo = createTestTurnInfo({ canUndo: true });

      render(<GameHUD turnInfo={turnInfo} />);

      const undoButton = screen.getByRole('button', { name: /undo/i });
      expect(undoButton.hasAttribute('disabled')).toBe(false);
    });
  });

  describe('Control button interactions', () => {
    it.skip('should call onUndo when undo button is clicked', async () => {
      const onUndo = vi.fn();
      const turnInfo = createTestTurnInfo({ canUndo: true });

      render(<GameHUD turnInfo={turnInfo} onUndo={onUndo} />);

      const undoButton = screen.getByRole('button', { name: /undo/i });
      await userEvent.click(undoButton);

      expect(onUndo).toHaveBeenCalledOnce();
    });

    it.skip('should call onSkipTurn when skip button is clicked', async () => {
      const onSkipTurn = vi.fn();
      const turnInfo = createTestTurnInfo();

      render(<GameHUD turnInfo={turnInfo} showSkipButton={true} onSkipTurn={onSkipTurn} />);

      const skipButton = screen.getByRole('button', { name: /skip turn/i });
      await userEvent.click(skipButton);

      expect(onSkipTurn).toHaveBeenCalledOnce();
    });

    it.skip('should call onResign when resign button is clicked', async () => {
      const onResign = vi.fn();
      const turnInfo = createTestTurnInfo();

      render(<GameHUD turnInfo={turnInfo} onResign={onResign} />);

      const resignButton = screen.getByRole('button', { name: /resign/i });
      await userEvent.click(resignButton);

      expect(onResign).toHaveBeenCalledOnce();
    });

    it.skip('should not call onUndo when undo button is disabled and clicked', async () => {
      const onUndo = vi.fn();
      const turnInfo = createTestTurnInfo({ canUndo: false });

      render(<GameHUD turnInfo={turnInfo} onUndo={onUndo} />);

      const undoButton = screen.getByRole('button', { name: /undo/i });
      await userEvent.click(undoButton);

      expect(onUndo).not.toHaveBeenCalled();
    });
  });

  describe('Game status and results', () => {
    it('should display winner message when game has winner', () => {
      const turnInfo = createTestTurnInfo();
      const scoreboard = createTestScoreboard({
        winner: 'player1',
        players: [{ playerId: 'player1', score: 100, rank: 1 }],
      });

      render(<GameHUD turnInfo={turnInfo} scoreboard={scoreboard} />);

      expect(screen.getByText(/winner/i)).toBeDefined();
    });

    it('should display draw message when game is a draw', () => {
      const turnInfo = createTestTurnInfo();
      const scoreboard = createTestScoreboard({
        isDraw: true,
        winner: 'draw',
      });

      render(<GameHUD turnInfo={turnInfo} scoreboard={scoreboard} />);

      expect(screen.getByText(/draw/i)).toBeDefined();
    });

    it('should not display game result when game is still in progress', () => {
      const turnInfo = createTestTurnInfo();
      const scoreboard = createTestScoreboard({
        winner: undefined,
        isDraw: false,
      });

      render(<GameHUD turnInfo={turnInfo} scoreboard={scoreboard} />);

      expect(screen.queryByText(/winner/i)).toBeNull();
      expect(screen.queryByText(/draw/i)).toBeNull();
    });
  });

  describe('Custom styling and CSS classes', () => {
    it('should apply custom className', () => {
      const turnInfo = createTestTurnInfo();

      render(<GameHUD turnInfo={turnInfo} className="custom-hud" />);

      const hudElement = document.querySelector('.game-hud');
      expect(hudElement?.classList.contains('custom-hud')).toBe(true);
    });

    it('should apply custom styles', () => {
      const turnInfo = createTestTurnInfo();
      const customStyle = { backgroundColor: 'red', padding: '20px' };

      render(<GameHUD turnInfo={turnInfo} style={customStyle} />);

      const hudElement = document.querySelector('.game-hud');
      expect(hudElement?.style.backgroundColor).toBe('red');
      expect(hudElement?.style.padding).toBe('20px');
    });

    it('should have current-turn class on current player', () => {
      const turnInfo = createTestTurnInfo();

      render(<GameHUD turnInfo={turnInfo} />);

      const playerInfo = document.querySelector('.player-info.current-turn');
      expect(playerInfo).toBeDefined();
    });
  });

  describe('Button titles and accessibility', () => {
    it('should have appropriate titles on control buttons', () => {
      const turnInfo = createTestTurnInfo({ canUndo: true });

      render(<GameHUD turnInfo={turnInfo} showSkipButton={true} />);

      expect(screen.getByRole('button', { name: /undo/i }).getAttribute('title')).toBe(
        'Undo last move'
      );
      expect(screen.getByRole('button', { name: /skip/i }).getAttribute('title')).toBe(
        'Skip current turn'
      );
      expect(screen.getByRole('button', { name: /resign/i }).getAttribute('title')).toBe(
        'Resign from game'
      );
    });

    it('should have proper button text with icons', () => {
      const turnInfo = createTestTurnInfo({ canUndo: true });

      render(<GameHUD turnInfo={turnInfo} showSkipButton={true} />);

      expect(screen.getByText('↶ Undo')).toBeDefined();
      expect(screen.getByText('⏭ Skip Turn')).toBeDefined();
      expect(screen.getByText('🏳 Resign')).toBeDefined();
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle missing scoreboard gracefully', () => {
      const turnInfo = createTestTurnInfo();

      expect(() => {
        render(<GameHUD turnInfo={turnInfo} />);
      }).not.toThrow();

      // Should not display score or rank without scoreboard
      expect(screen.queryByText(/score/i)).toBeNull();
      expect(screen.queryByText(/rank/i)).toBeNull();
    });

    it('should handle undefined callback functions gracefully', async () => {
      const turnInfo = createTestTurnInfo({ canUndo: true });

      render(
        <GameHUD
          turnInfo={turnInfo}
          showSkipButton={true}
          onUndo={undefined}
          onSkipTurn={undefined}
          onResign={undefined}
        />
      );

      // Buttons should still render and be clickable without errors
      const undoButton = screen.getByRole('button', { name: /undo/i });
      const skipButton = screen.getByRole('button', { name: /skip/i });
      const resignButton = screen.getByRole('button', { name: /resign/i });

      expect(async () => {
        await userEvent.click(undoButton);
        await userEvent.click(skipButton);
        await userEvent.click(resignButton);
      }).not.toThrow();
    });

    it('should handle player with no avatar gracefully', () => {
      const turnInfo = createTestTurnInfo({
        currentPlayer: createTestPlayer('player1', 'Alice', { avatar: undefined }),
      });

      render(<GameHUD turnInfo={turnInfo} />);

      // Should show avatar placeholder in both sections
      expect(screen.getAllByText('A')).toHaveLength(2);
    });

    it('should handle empty player name gracefully', () => {
      const turnInfo = createTestTurnInfo({
        currentPlayer: createTestPlayer('player1', '', { avatar: undefined }),
      });

      render(<GameHUD turnInfo={turnInfo} />);

      // Should not crash and show empty player name
      const hudElement = document.querySelector('.game-hud');
      expect(hudElement).toBeDefined();
    });
  });

  describe('Component sections structure', () => {
    it('should have all expected HUD sections', () => {
      const turnInfo = createTestTurnInfo();
      const scoreboard = createTestScoreboard();

      render(<GameHUD turnInfo={turnInfo} scoreboard={scoreboard} showTimer={true} />);

      expect(document.querySelector('.current-player-section')).toBeDefined();
      expect(document.querySelector('.players-section')).toBeDefined();
      expect(document.querySelector('.status-section')).toBeDefined();
      expect(document.querySelector('.controls-section')).toBeDefined();
    });

    it('should conditionally show timer section', () => {
      const turnInfo = createTestTurnInfo({ timeRemaining: 30 });

      // With timer enabled
      const { rerender } = render(<GameHUD turnInfo={turnInfo} showTimer={true} />);
      expect(document.querySelector('.timer-section')).toBeDefined();

      // With timer disabled
      rerender(<GameHUD turnInfo={turnInfo} showTimer={false} />);
      expect(document.querySelector('.timer-section')).toBeNull();
    });

    it('should have proper section headings', () => {
      const turnInfo = createTestTurnInfo();

      render(<GameHUD turnInfo={turnInfo} />);

      expect(screen.getByText('Current Player')).toBeDefined();
      expect(screen.getByText('Players')).toBeDefined();
    });
  });
});