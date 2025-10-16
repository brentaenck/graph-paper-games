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
 * @fileoverview Sprouts game module exports
 */

// Export types
export type {
  Point2D,
  BoundingBox,
  SproutsPoint,
  SproutsCurve,
  SproutsMove,
  SproutsMetadata,
  IntersectionResult,
  TopologyValidationResult,
  TopologyViolation,
  TopologyViolationType,
  SproutsPositionEvaluation,
  EvaluationFactors,
  MoveGenerationContext,
  StrategicPriority,
  DrawingState,
  SproutsCanvasContext,
  SproutsVisualStyle,
  SproutsAnimationState,
} from './types';

export { 
  SPROUTS_CONSTANTS,
  DEFAULT_VISUAL_STYLE,
  AI_DIFFICULTY_CONFIG,
  isSproutsMove,
  isPoint2D,
  canAcceptConnection,
} from './types';

// Export geometry utilities
export {
  distance,
  distanceSquared,
  dotProduct,
  crossProduct,
  subtract,
  add,
  scale,
  normalize,
  isPointInCircle,
  generateSmoothCurve,
  evaluateCubicBezier,
  findPointOnPath,
  lineSegmentsIntersect,
  closestPointOnLineSegment,
  curvesIntersect,
  curvePassesThroughPoint,
  calculateBoundingBox,
  boundingBoxesIntersect,
  expandBoundingBox,
  generateInitialPoints,
  generateCurvePath,
  isValidCurvePath,
} from './geometry';

// Export validation utilities
export {
  canConnectPoints,
  validateSproutsMove,
  validateCurvePath,
  validateNewPointPosition,
  isPointExhausted,
  hasLegalMoves,
  countLegalMoves,
  getValidConnectionPairs,
  validateGameState,
  wouldMoveBeValid,
} from './validation';

// Export engine
export { 
  SproutsEngine,
  createSproutsMove,
  getGameStatistics,
} from './engine';

// Export AI
export { SproutsAI } from './ai';

// Export React component
export { SproutsGame } from './component';

// Export complete game module
export { SproutsModule } from './module';
