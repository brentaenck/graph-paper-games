/**
 * @fileoverview Main exports for the Graph Paper Games framework package
 *
 * This package contains the core framework components, utilities, and hooks
 * that provide the foundation for building games in the Graph Paper Games platform.
 */

// Export EventBus system
export * from './event-bus';
export { EventBus } from './event-bus';

// Export TurnManager
export * from './turn-manager';
export { TurnManager } from './turn-manager';

// Export core components
export * from './components/GridRenderer';
export { GridRenderer } from './components/GridRenderer';

export * from './components/GameHUD';
export { GameHUD } from './components/GameHUD';

// Re-export shared types for convenience
export type {
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
} from '@gpg/shared';
