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
 * @fileoverview Sprouts-specific types and interfaces
 */

import type { Move } from '@gpg/shared';

// ============================================================================
// Geometric Types
// ============================================================================

/**
 * 2D point coordinate
 */
export interface Point2D {
  readonly x: number;
  readonly y: number;
}

/**
 * Bounding box for geometric calculations
 */
export interface BoundingBox {
  readonly minX: number;
  readonly minY: number;
  readonly maxX: number;
  readonly maxY: number;
}

// ============================================================================
// Core Sprouts Types
// ============================================================================

/**
 * A point in the Sprouts game
 * Each point can have at most 3 connections
 */
export interface SproutsPoint {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly connections: readonly string[]; // IDs of connected curves (max 3)
  readonly createdAtMove?: number; // Turn when this point was created (for new points)
}

/**
 * A curve connecting two points in Sprouts
 * Represented as a Bezier curve with control points
 */
export interface SproutsCurve {
  readonly id: string;
  readonly startPointId: string;
  readonly endPointId: string;
  readonly controlPoints: readonly Point2D[]; // Bezier curve control points
  readonly newPointId: string; // ID of the point placed along this curve
  readonly createdAtMove: number; // Turn when this curve was created
}

/**
 * Sprouts-specific move
 */
export interface SproutsMove extends Move {
  readonly type: 'connect';
  readonly data: {
    readonly fromPointId: string;
    readonly toPointId: string;
    readonly curvePath: readonly Point2D[]; // Path of the curve
    readonly newPointPosition: Point2D; // Position of new point along curve
    readonly curveId: string; // ID of the created curve
    readonly newPointId: string; // ID of the created point
  };
}

/**
 * Game state metadata specific to Sprouts
 */
export interface SproutsMetadata {
  readonly points: readonly SproutsPoint[];
  readonly curves: readonly SproutsCurve[];
  readonly winner?: string;
  readonly legalMovesRemaining: number;
  readonly gamePhase: 'playing' | 'finished';
  readonly moveHistory: readonly SproutsMove[];
  readonly lastMove?: SproutsMove;
}

// ============================================================================
// Validation Types
// ============================================================================

/**
 * Result of curve intersection detection
 */
export interface IntersectionResult {
  readonly hasIntersection: boolean;
  readonly intersectionPoints: readonly Point2D[];
  readonly intersectionDetails?: {
    readonly curve1Id: string;
    readonly curve2Id: string;
    readonly parameters: readonly number[]; // Parameter values where intersections occur
  };
}

/**
 * Topology validation result
 */
export interface TopologyValidationResult {
  readonly isValid: boolean;
  readonly violations: readonly TopologyViolation[];
}

/**
 * Types of topology violations in Sprouts
 */
export type TopologyViolationType = 
  | 'curve_intersection'
  | 'point_limit_exceeded'
  | 'curve_through_point'
  | 'invalid_endpoints';

/**
 * A specific topology violation
 */
export interface TopologyViolation {
  readonly type: TopologyViolationType;
  readonly message: string;
  readonly affectedElements: readonly string[]; // IDs of points/curves involved
}

// ============================================================================
// AI Types
// ============================================================================

/**
 * AI evaluation of a position
 */
export interface SproutsPositionEvaluation {
  readonly score: number;
  readonly depth: number;
  readonly bestMove?: SproutsMove;
  readonly principalVariation: readonly SproutsMove[];
  readonly nodesEvaluated: number;
  readonly movesRemaining: number;
  readonly connectionOpportunities: number;
}

/**
 * Heuristic evaluation factors
 */
export interface EvaluationFactors {
  readonly mobility: number; // Number of available moves
  readonly control: number; // Area/connection control
  readonly blocking: number; // Ability to block opponent
  readonly endgame: number; // Endgame advantages
}

/**
 * AI move generation context
 */
export interface MoveGenerationContext {
  readonly availablePoints: readonly SproutsPoint[];
  readonly legalConnections: readonly [string, string][]; // Pairs of point IDs
  readonly strategicPriorities: readonly StrategicPriority[];
}

/**
 * Strategic priorities for AI decision making
 */
export type StrategicPriority = 
  | 'maximize_moves'
  | 'minimize_opponent_moves'
  | 'create_loops'
  | 'block_opponent'
  | 'control_center'
  | 'isolate_regions';

// ============================================================================
// UI/Rendering Types
// ============================================================================

/**
 * State of interactive curve drawing
 */
export interface DrawingState {
  readonly isDrawing: boolean;
  readonly startPointId: string;
  readonly currentPath: readonly Point2D[];
  readonly previewPoint?: Point2D;
  readonly isValid: boolean;
}

/**
 * Canvas rendering context for Sprouts
 */
export interface SproutsCanvasContext {
  readonly canvas: HTMLCanvasElement;
  readonly ctx: CanvasRenderingContext2D;
  readonly scale: number;
  readonly offset: Point2D;
}

/**
 * Visual style configuration
 */
export interface SproutsVisualStyle {
  readonly pointRadius: number;
  readonly pointColor: string;
  readonly pointBorderColor: string;
  readonly curveColor: string;
  readonly curveWidth: number;
  readonly newPointColor: string;
  readonly previewColor: string;
  readonly highlightColor: string;
  readonly backgroundColor: string;
}

/**
 * Animation state for visual feedback
 */
export interface SproutsAnimationState {
  readonly animatingElements: ReadonlySet<string>;
  readonly completedAnimations: ReadonlySet<string>;
  readonly currentAnimation?: {
    readonly elementId: string;
    readonly type: 'curve_draw' | 'point_place' | 'highlight';
    readonly startTime: number;
    readonly duration: number;
  };
}

// ============================================================================
// Game Constants
// ============================================================================

/**
 * Sprouts game constants
 */
export const SPROUTS_CONSTANTS = {
  MAX_CONNECTIONS_PER_POINT: 3,
  MIN_POINTS_TO_START: 2,
  MAX_POINTS_TO_START: 6,
  DEFAULT_STARTING_POINTS: 3,
  MAX_MOVES_FORMULA: (n: number) => 3 * n - 1, // For n starting points
  MIN_MOVES_FORMULA: (n: number) => 2 * n,     // For n starting points
  CURVE_SMOOTHNESS: 0.4, // Bezier curve control point distance factor
  INTERSECTION_TOLERANCE: 1e-6, // Numerical tolerance for intersections
  POINT_SELECTION_RADIUS: 15, // Reduced for smaller points - easier to click precisely
  CANVAS_PADDING: 50, // Padding around game area
} as const;

/**
 * Default visual styling
 */
export const DEFAULT_VISUAL_STYLE: SproutsVisualStyle = {
  pointRadius: 5, // Much smaller for better precision
  pointColor: '#2563eb',
  pointBorderColor: '#1e40af',
  curveColor: '#374151',
  curveWidth: 2,
  newPointColor: '#dc2626',
  previewColor: '#9ca3af',
  highlightColor: '#fbbf24',
  backgroundColor: '#ffffff',
} as const;

/**
 * AI difficulty configurations
 */
export const AI_DIFFICULTY_CONFIG = {
  1: { name: 'Random', description: 'Makes random legal moves', searchDepth: 0 },
  2: { name: 'Blocking', description: 'Prefers moves that limit opponent', searchDepth: 0 },
  3: { name: 'Basic Strategy', description: 'Uses basic strategic principles', searchDepth: 1 },
  4: { name: 'Advanced Strategy', description: 'Advanced tactical play', searchDepth: 2 },
  5: { name: 'Expert', description: 'Limited depth minimax search', searchDepth: 3 },
  6: { name: 'Master', description: 'Deep search with pruning', searchDepth: 5 },
} as const;

// ============================================================================
// Utility Type Guards
// ============================================================================

/**
 * Type guard for SproutsMove
 */
export function isSproutsMove(move: Move): move is SproutsMove {
  return move.type === 'connect' && 
    typeof move.data === 'object' &&
    'fromPointId' in move.data &&
    'toPointId' in move.data &&
    'curvePath' in move.data &&
    'newPointPosition' in move.data;
}

/**
 * Type guard for Point2D
 */
export function isPoint2D(obj: unknown): obj is Point2D {
  return typeof obj === 'object' &&
    obj !== null &&
    'x' in obj &&
    'y' in obj &&
    typeof (obj as Point2D).x === 'number' &&
    typeof (obj as Point2D).y === 'number';
}

/**
 * Type guard for valid point connections
 */
export function canAcceptConnection(point: SproutsPoint): boolean {
  return point.connections.length < SPROUTS_CONSTANTS.MAX_CONNECTIONS_PER_POINT;
}