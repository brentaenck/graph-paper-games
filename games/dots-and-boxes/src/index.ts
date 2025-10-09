/**
 * @fileoverview Main exports for @gpg/dots-and-boxes package
 */

// Core engine and types
export { DotsAndBoxesEngine, createMove } from './engine';
export * from './types';

// AI implementation
export { DotsAndBoxesAI } from './ai';

// Re-export shared types for convenience
export type { GameState, Player, AIDifficulty, GameSettings } from '@gpg/shared';
