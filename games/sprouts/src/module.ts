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
 * @fileoverview Complete Sprouts game module for framework integration
 */

import type { GameModule } from '@gpg/shared';
import { SproutsEngine } from './engine';
import { SproutsAI } from './ai';
import { SproutsGame } from './component';

/**
 * Complete Sprouts game module
 */
export const SproutsModule: GameModule = {
  id: 'sprouts',
  name: 'Sprouts',
  version: '1.0.0',
  description: 'Topological connection game with curve drawing invented by John Conway and Michael Paterson',
  categories: ['strategy', 'mathematical', 'topology', 'expert', 'two-player'],
  capabilities: {
    grid: 'square', // Uses canvas area, not true grid
    minPlayers: 2,
    maxPlayers: 2,
    supportsAI: true,
    supportsOnline: false, // Not implemented yet
    supportsLocal: true,
    estimatedDuration: 15, // minutes - longer than typical grid games
  },
  assets: [], // No additional assets needed
  
  // Core implementations
  engine: new SproutsEngine(),
  ai: new SproutsAI(),
  
  // React component for rendering the game
  component: SproutsGame,
};