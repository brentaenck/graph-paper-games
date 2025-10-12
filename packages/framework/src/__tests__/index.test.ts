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
 * @fileoverview Tests for main framework package exports
 */

import { describe, it, expect } from 'vitest';
import * as frameworkExports from '../index';

describe('Framework Package Exports', () => {
  describe('Core Components', () => {
    it('should export EventBus', () => {
      expect(frameworkExports.EventBus).toBeDefined();
      expect(typeof frameworkExports.EventBus).toBe('object');
    });

    it('should export TurnManager', () => {
      expect(frameworkExports.TurnManager).toBeDefined();
      expect(typeof frameworkExports.TurnManager).toBe('function');
    });

    it('should export GridRenderer', () => {
      expect(frameworkExports.GridRenderer).toBeDefined();
      expect(typeof frameworkExports.GridRenderer).toBe('function');
    });

    it('should export GameHUD', () => {
      expect(frameworkExports.GameHUD).toBeDefined();
      expect(typeof frameworkExports.GameHUD).toBe('function');
    });

    it('should export themes', () => {
      expect(frameworkExports.paperTheme).toBeDefined();
      expect(frameworkExports.highContrastTheme).toBeDefined();
      expect(typeof frameworkExports.paperTheme).toBe('object');
      expect(typeof frameworkExports.highContrastTheme).toBe('object');
    });
  });

  describe('Dual System Components', () => {
    it('should export dual system provider', () => {
      expect(frameworkExports.DualSystemProvider).toBeDefined();
      expect(typeof frameworkExports.DualSystemProvider).toBe('function');
    });

    it('should export dual system hooks', () => {
      expect(frameworkExports.useDualSystem).toBeDefined();
      expect(frameworkExports.useModernUI).toBeDefined();
      expect(frameworkExports.useHandDrawn).toBeDefined();
      expect(frameworkExports.useLayout).toBeDefined();
      expect(typeof frameworkExports.useDualSystem).toBe('function');
    });

    it('should export system boundaries', () => {
      expect(frameworkExports.withModernUI).toBeDefined();
      expect(frameworkExports.withHandDrawn).toBeDefined();
      expect(frameworkExports.ModernUIBoundary).toBeDefined();
      expect(frameworkExports.PaperBoundary).toBeDefined();
      expect(typeof frameworkExports.withModernUI).toBe('function');
    });
  });

  describe('Hand-drawn Components', () => {
    it('should export paper system components', () => {
      expect(frameworkExports.PaperSheet).toBeDefined();
      expect(frameworkExports.HandDrawnGrid).toBeDefined();
      expect(frameworkExports.GameSymbol).toBeDefined();
      expect(frameworkExports.WinningLine).toBeDefined();
      expect(typeof frameworkExports.PaperSheet).toBe('object'); // Wrapped component
    });

    it('should export symbol components', () => {
      expect(frameworkExports.XSymbol).toBeDefined();
      expect(frameworkExports.OSymbol).toBeDefined();
      expect(frameworkExports.DotSymbol).toBeDefined();
      expect(frameworkExports.LineSymbol).toBeDefined();
      expect(typeof frameworkExports.XSymbol).toBe('function');
    });

    it('should export hand-drawn utilities', () => {
      expect(frameworkExports.useGridCell).toBeDefined();
      expect(frameworkExports.calculateGridAlignment).toBeDefined();
      expect(frameworkExports.pixelToGrid).toBeDefined();
      expect(frameworkExports.gridToPixel).toBeDefined();
      expect(typeof frameworkExports.useGridCell).toBe('function');
    });
  });

  describe('Modern UI Components', () => {
    it('should export player display components', () => {
      expect(frameworkExports.PlayerDisplay).toBeDefined();
      expect(frameworkExports.PlayerList).toBeDefined();
      expect(frameworkExports.PlayerSummary).toBeDefined();
      expect(typeof frameworkExports.PlayerDisplay).toBe('object'); // Wrapped component
    });
  });

  describe('Layout Components', () => {
    it('should export layout components', () => {
      expect(frameworkExports.TruePaperLayout).toBeDefined();
      expect(frameworkExports.HeaderFooterLayout).toBeDefined();
      expect(frameworkExports.SidebarLayout).toBeDefined();
      expect(frameworkExports.MinimalLayout).toBeDefined();
      expect(typeof frameworkExports.TruePaperLayout).toBe('function');
    });

    it('should export layout hooks', () => {
      expect(frameworkExports.useResponsiveLayout).toBeDefined();
      expect(typeof frameworkExports.useResponsiveLayout).toBe('function');
    });
  });

  describe('Event System', () => {
    it('should export createEvent helpers', () => {
      expect(frameworkExports.createEvent).toBeDefined();
      expect(typeof frameworkExports.createEvent).toBe('object');
    });
  });

  describe('Theme Validation', () => {
    it('should have valid paperTheme structure', () => {
      expect(frameworkExports.paperTheme).toHaveProperty('renderer');
      expect(frameworkExports.paperTheme).toHaveProperty('cellSize');
      expect(frameworkExports.paperTheme).toHaveProperty('borderColor');
      expect(frameworkExports.paperTheme).toHaveProperty('backgroundColor');
      expect(frameworkExports.paperTheme).toHaveProperty('highlightColor');
    });

    it('should have valid highContrastTheme structure', () => {
      expect(frameworkExports.highContrastTheme).toHaveProperty('renderer');
      expect(frameworkExports.highContrastTheme).toHaveProperty('cellSize');
      expect(frameworkExports.highContrastTheme).toHaveProperty('borderColor');
      expect(frameworkExports.highContrastTheme).toHaveProperty('backgroundColor');
      expect(frameworkExports.highContrastTheme).toHaveProperty('highlightColor');
    });
  });
});