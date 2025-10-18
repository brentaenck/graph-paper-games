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
 * @fileoverview Main exports for the Graph Paper Games framework package
 *
 * This package contains the core framework components, utilities, and hooks
 * that provide the foundation for building games in the Graph Paper Games platform.
 *
 * NEW: Now includes the dual design system with modern UI and hand-drawn components!
 */

// ============================================================================
// DUAL DESIGN SYSTEM - NEW!
// ============================================================================

// Core dual system providers and context
export {
  DualSystemProvider,
  useDualSystem,
  useModernUI,
  useHandDrawn,
  useLayout,
} from './components/dual-system/DualSystemProvider';

// System boundary enforcement
export {
  withModernUI,
  withHandDrawn,
  ModernUIBoundary,
  PaperBoundary,
  BoundaryChecker,
  isModernUIComponent,
  isHandDrawnComponent,
  validateModernUI,
  validateHandDrawn,
} from './components/dual-system/SystemBoundary';

// Modern UI System Components
export { PlayerDisplay, PlayerList, PlayerSummary } from './components/modern-ui/PlayerDisplay';

// Hand-drawn Paper System Components
export {
  PaperSheet,
  useGridCell,
  calculateGridAlignment,
  pixelToGrid,
  gridToPixel,
} from './components/hand-drawn/PaperSheet';

export {
  HandDrawnGrid,
  HandDrawnGridWithStyles,
  createTicTacToeGrid,
  createChessGrid,
  createCustomGrid,
  createDotsAndBoxesGrid,
  createSproutsGrid,
  generateWinningLinePath,
  generateHandDrawnDots,
  generateHandDrawnLinePath,
} from './components/hand-drawn/HandDrawnGrid';

export {
  GameSymbol,
  XSymbol,
  OSymbol,
  DotSymbol,
  LineSymbol,
  ShipSymbol,
  createCustomSymbol,
  useGameSymbolAnimation,
  useGameAnimations,
  PenStyleFilters,
} from './components/hand-drawn/GameSymbol';

export {
  WinningLine,
  TicTacToeWinningLine,
  generateTicTacToeWinningLine,
  createWinningLine,
  type WinningLineData,
  type WinningLineProps,
} from './components/hand-drawn/WinningLine';

// Layout System
export {
  TruePaperLayout,
  HeaderFooterLayout,
  SidebarLayout,
  MinimalLayout,
  useResponsiveLayout,
} from './components/layout/TruePaperLayout';

// ============================================================================
// LEGACY FRAMEWORK COMPONENTS
// ============================================================================

// Export EventBus system
export * from './event-bus';
export { EventBus } from './event-bus';

// Export TurnManager
export * from './turn-manager';
export { TurnManager } from './turn-manager';

// Export legacy core components
export * from './components/GridRenderer';
export { GridRenderer, paperTheme, highContrastTheme } from './components/GridRenderer';

export * from './components/GameHUD';
export { GameHUD } from './components/GameHUD';

// ============================================================================
// TYPE EXPORTS
// ============================================================================

// Re-export shared types for convenience
export type {
  // Legacy types
  GameEngineAPI,
  GameModule,
  GameProps,
  Result,
  GameState,
  Player,
  Move,
  Grid,
  GridCoordinate,
  GridCell,

  // NEW: Dual system types
  PenStyle,
  PenStyleConfig,
  UITheme,
  PaperType,
  HandDrawnGridTheme,
  DualSystemTheme,
  ModernUIProps,
  HandDrawnProps,
  AnimationState,
  GridTheme,
} from '@gpg/shared';

// Component type utilities
export type {
  ModernUIComponent,
  HandDrawnComponent,
  DualSystemComponent,
} from './components/dual-system/SystemBoundary';