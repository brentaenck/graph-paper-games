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

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SproutsGame } from '../src/component';
import { SproutsEngine } from '../src/engine';
import type { GameSettings, Player } from '@gpg/shared';

describe('SproutsGame Component', () => {
  let engine: SproutsEngine;
  let players: Player[];
  let settings: GameSettings;

  beforeEach(() => {
    engine = new SproutsEngine();
    players = [
      { id: 'player1', name: 'Player 1', color: 'blue', avatar: '', isAI: false, difficulty: undefined, score: 0, isActive: true },
      { id: 'player2', name: 'Player 2', color: 'red', avatar: '', isAI: false, difficulty: undefined, score: 0, isActive: true },
    ];
    settings = {
      gameType: 'sprouts',
      playerCount: 2,
      enableAI: false,
      gridSize: { width: 3, height: 3 }, // 3 starting points
    };
  });

  it('should render without crashing', () => {
    const stateResult = engine.createInitialState(settings, players);
    expect(stateResult.success).toBe(true);

    if (stateResult.success) {
      const gameState = stateResult.data;
      const mockOnMove = vi.fn();

      render(
        <SproutsGame
          gameState={gameState}
          currentPlayer={players[0]}
          isMyTurn={true}
          onMove={mockOnMove}
          settings={settings}
        />
      );

      // Check that key elements are present
      expect(screen.getByText('Sprouts')).toBeInTheDocument();
      expect(screen.getByText(/points available/)).toBeInTheDocument();
      expect(screen.getByText(/How to Play/)).toBeInTheDocument();
    }
  });

  it('should display correct game status', () => {
    const stateResult = engine.createInitialState(settings, players);
    expect(stateResult.success).toBe(true);

    if (stateResult.success) {
      const gameState = stateResult.data;
      const mockOnMove = vi.fn();

      render(
        <SproutsGame
          gameState={gameState}
          currentPlayer={players[0]}
          isMyTurn={true}
          onMove={mockOnMove}
          settings={settings}
        />
      );

      // Check game stats
      expect(screen.getByText('3')).toBeInTheDocument(); // Points count
      expect(screen.getByText('0')).toBeInTheDocument(); // Curves count
      expect(screen.getByText('1')).toBeInTheDocument(); // Turn number
    }
  });

  it('should display turn information correctly', () => {
    const stateResult = engine.createInitialState(settings, players);
    expect(stateResult.success).toBe(true);

    if (stateResult.success) {
      const gameState = stateResult.data;
      const mockOnMove = vi.fn();

      render(
        <SproutsGame
          gameState={gameState}
          currentPlayer={players[0]}
          isMyTurn={true}
          onMove={mockOnMove}
          settings={settings}
        />
      );

      expect(screen.getByText(/Your turn - Click and drag/)).toBeInTheDocument();
    }
  });

  it('should display opponent turn correctly', () => {
    const stateResult = engine.createInitialState(settings, players);
    expect(stateResult.success).toBe(true);

    if (stateResult.success) {
      const gameState = stateResult.data;
      const mockOnMove = vi.fn();

      render(
        <SproutsGame
          gameState={gameState}
          currentPlayer={players[1]}
          isMyTurn={false}
          onMove={mockOnMove}
          settings={settings}
        />
      );

      expect(screen.getByText(/Player 2's turn/)).toBeInTheDocument();
    }
  });

  it('should have a canvas element', () => {
    const stateResult = engine.createInitialState(settings, players);
    expect(stateResult.success).toBe(true);

    if (stateResult.success) {
      const gameState = stateResult.data;
      const mockOnMove = vi.fn();

      render(
        <SproutsGame
          gameState={gameState}
          currentPlayer={players[0]}
          isMyTurn={true}
          onMove={mockOnMove}
          settings={settings}
        />
      );

      const canvas = document.querySelector('canvas');
      expect(canvas).toBeInTheDocument();
      expect(canvas?.tagName).toBe('CANVAS');
    }
  });

  it('should show control buttons', () => {
    const stateResult = engine.createInitialState(settings, players);
    expect(stateResult.success).toBe(true);

    if (stateResult.success) {
      const gameState = stateResult.data;
      const mockOnMove = vi.fn();
      const mockOnUndo = vi.fn();
      const mockOnResign = vi.fn();

      render(
        <SproutsGame
          gameState={gameState}
          currentPlayer={players[0]}
          isMyTurn={true}
          onMove={mockOnMove}
          onUndo={mockOnUndo}
          onResign={mockOnResign}
          settings={settings}
        />
      );

      expect(screen.getByText(/Undo/)).toBeInTheDocument();
      expect(screen.getByText(/Resign/)).toBeInTheDocument();
    }
  });
});