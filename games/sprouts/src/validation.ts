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
 * @fileoverview Topology validation system for Sprouts game
 */

import type {
  Point2D,
  SproutsPoint,
  SproutsCurve,
  SproutsMove,
  TopologyValidationResult,
  TopologyViolation,
} from './types';

import { SPROUTS_CONSTANTS } from './types';

import {
  distance,
  curvesIntersect,
  curvePassesThroughPoint,
} from './geometry';

import { ValidationResult } from '@gpg/shared';

// ============================================================================
// Core Validation Functions
// ============================================================================

/**
 * Validate if two points can be connected according to Sprouts rules
 */
export function canConnectPoints(
  point1: SproutsPoint,
  point2: SproutsPoint
): { canConnect: boolean; reason?: string } {
  // Check if both points have available connections
  if (point1.connections.length >= SPROUTS_CONSTANTS.MAX_CONNECTIONS_PER_POINT) {
    return { canConnect: false, reason: `Point ${point1.id} already has maximum connections` };
  }

  if (point2.connections.length >= SPROUTS_CONSTANTS.MAX_CONNECTIONS_PER_POINT) {
    return { canConnect: false, reason: `Point ${point2.id} already has maximum connections` };
  }

  // Special case: Self-connections (loops) use 2 connections from the same point
  if (point1.id === point2.id) {
    if (point1.connections.length >= SPROUTS_CONSTANTS.MAX_CONNECTIONS_PER_POINT - 1) {
      return { canConnect: false, reason: `Point ${point1.id} needs at least 2 free connections for a loop` };
    }
  }

  // Points can connect if they both have available connection slots
  return { canConnect: true };
}

/**
 * Validate a complete move according to Sprouts topology rules
 */
export function validateSproutsMove(
  move: SproutsMove,
  existingPoints: readonly SproutsPoint[],
  existingCurves: readonly SproutsCurve[]
): ValidationResult {
  const { fromPointId, toPointId, curvePath, newPointPosition } = move.data;

  // Find the points being connected
  const fromPoint = existingPoints.find(p => p.id === fromPointId);
  const toPoint = existingPoints.find(p => p.id === toPointId);

  if (!fromPoint) {
    return { isValid: false, error: 'Start point not found', code: 'INVALID_POINT' };
  }

  if (!toPoint) {
    return { isValid: false, error: 'End point not found', code: 'INVALID_POINT' };
  }

  // Check if points can be connected (connection limit)
  const connectionCheck = canConnectPoints(fromPoint, toPoint);
  if (!connectionCheck.canConnect) {
    return { 
      isValid: false, 
      error: connectionCheck.reason || 'Cannot connect points',
      code: 'CONNECTION_LIMIT_EXCEEDED'
    };
  }

  // Validate the curve path
  const pathValidation = validateCurvePath(
    curvePath,
    existingCurves,
    existingPoints,
    [fromPointId, toPointId]
  );

  if (!pathValidation.isValid) {
    return {
      isValid: false,
      error: pathValidation.violations[0]?.message || 'Invalid curve path',
      code: 'INVALID_CURVE'
    };
  }

  // Validate new point position
  const newPointValidation = validateNewPointPosition(
    newPointPosition,
    curvePath,
    existingPoints,
    [fromPointId, toPointId]
  );

  if (!newPointValidation.isValid) {
    return {
      isValid: false,
      error: newPointValidation.reason || 'Invalid new point position',
      code: 'INVALID_NEW_POINT'
    };
  }

  return { isValid: true };
}

/**
 * Validate a curve path for topology violations
 */
export function validateCurvePath(
  path: readonly Point2D[],
  existingCurves: readonly SproutsCurve[],
  existingPoints: readonly SproutsPoint[],
  allowedEndpoints: readonly string[] = []
): TopologyValidationResult {
  const violations: TopologyViolation[] = [];

  // Check for curve intersections
  for (const existingCurve of existingCurves) {
    const intersection = curvesIntersect(path, existingCurve.controlPoints);
    if (intersection.hasIntersection) {
      violations.push({
        type: 'curve_intersection',
        message: `Curve intersects with existing curve ${existingCurve.id}`,
        affectedElements: [existingCurve.id],
      });
    }
  }

  // Check if curve passes through existing points (except endpoints)
  for (const point of existingPoints) {
    if (curvePassesThroughPoint(path, point, allowedEndpoints)) {
      violations.push({
        type: 'curve_through_point',
        message: `Curve passes through existing point ${point.id}`,
        affectedElements: [point.id],
      });
    }
  }

  return {
    isValid: violations.length === 0,
    violations,
  };
}

/**
 * Validate new point position along a curve
 */
export function validateNewPointPosition(
  newPointPosition: Point2D,
  curvePath: readonly Point2D[],
  existingPoints: readonly SproutsPoint[],
  _allowedEndpoints: readonly string[] = []
): { isValid: boolean; reason?: string } {
  // Check if new point is too close to existing points
  const minSeparation = 15; // Consistent minimum distance for Phase 1
  
  for (const existingPoint of existingPoints) {
    const dist = distance(newPointPosition, { x: existingPoint.x, y: existingPoint.y });
    if (dist < minSeparation) {
      return {
        isValid: false,
        reason: `New point too close to existing point ${existingPoint.id}`,
      };
    }
  }

  // Phase 1: Validate new point placement for both 2-point and 3-point paths
  let isOnPath = false;
  
  if (curvePath.length === 2) {
    // For AI's 2-point paths: check if new point is on the line segment
    const segmentStart = curvePath[0];
    const segmentEnd = curvePath[1];
    const distToSegment = distanceToLineSegment(newPointPosition, segmentStart, segmentEnd);
    
    // Allow reasonable tolerance for AI-generated positions
    if (distToSegment <= 5) {
      isOnPath = true;
    }
  } else if (curvePath.length === 3) {
    // For human's 3-point paths: the new point should be the middle point
    const middlePoint = curvePath[1];
    const distToMiddle = distance(newPointPosition, middlePoint);
    
    // Very tight tolerance since it should be exact
    if (distToMiddle <= 1) {
      isOnPath = true;
    }
  } else {
    // For any other path length, check all segments
    const tolerance = 15;
    for (let i = 0; i < curvePath.length - 1; i++) {
      const segmentStart = curvePath[i];
      const segmentEnd = curvePath[i + 1];
      
      const distToSegment = distanceToLineSegment(newPointPosition, segmentStart, segmentEnd);
      if (distToSegment <= tolerance) {
        isOnPath = true;
        break;
      }
    }
  }

  if (!isOnPath) {
    return {
      isValid: false,
      reason: 'New point must be placed along the curve path',
    };
  }

  return { isValid: true };
}

/**
 * Check if a point has reached its maximum connections
 */
export function isPointExhausted(point: SproutsPoint): boolean {
  return point.connections.length >= SPROUTS_CONSTANTS.MAX_CONNECTIONS_PER_POINT;
}

/**
 * Check if any legal moves remain in the game
 */
export function hasLegalMoves(
  points: readonly SproutsPoint[],
  _curves: readonly SproutsCurve[]
): boolean {
  // Get all points that can still accept connections
  const availablePoints = points.filter(point => !isPointExhausted(point));
  
  if (availablePoints.length === 0) {
    return false;
  }

  // Check if any pair of available points can be connected (including self-connections)
  for (let i = 0; i < availablePoints.length; i++) {
    for (let j = i; j < availablePoints.length; j++) { // Include self-connections (i === j)
      const point1 = availablePoints[i];
      const point2 = availablePoints[j];

      // Check if these points can be connected
      const connectionCheck = canConnectPoints(point1, point2);
      if (connectionCheck.canConnect) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Calculate the number of legal moves remaining (approximate)
 */
export function countLegalMoves(
  points: readonly SproutsPoint[],
  _curves: readonly SproutsCurve[]
): number {
  let count = 0;
  const availablePoints = points.filter(point => !isPointExhausted(point));

  for (let i = 0; i < availablePoints.length; i++) {
    for (let j = i; j < availablePoints.length; j++) { // Include self-connections (i === j)
      const point1 = availablePoints[i];
      const point2 = availablePoints[j];

      const connectionCheck = canConnectPoints(point1, point2);
      if (connectionCheck.canConnect) {
        count++;
      }
    }
  }

  return count;
}

/**
 * Get all valid connection pairs
 */
export function getValidConnectionPairs(
  points: readonly SproutsPoint[]
): Array<[SproutsPoint, SproutsPoint]> {
  const pairs: Array<[SproutsPoint, SproutsPoint]> = [];
  const availablePoints = points.filter(point => !isPointExhausted(point));

  for (let i = 0; i < availablePoints.length; i++) {
    for (let j = i; j < availablePoints.length; j++) { // Include self-connections (i === j)
      const point1 = availablePoints[i];
      const point2 = availablePoints[j];

      const connectionCheck = canConnectPoints(point1, point2);
      if (connectionCheck.canConnect) {
        pairs.push([point1, point2]);
      }
    }
  }

  return pairs;
}

// ============================================================================
// Comprehensive Game State Validation
// ============================================================================

/**
 * Perform comprehensive validation of an entire game state
 */
export function validateGameState(
  points: readonly SproutsPoint[],
  curves: readonly SproutsCurve[]
): TopologyValidationResult {
  const violations: TopologyViolation[] = [];

  // Check point connection limits
  for (const point of points) {
    if (point.connections.length > SPROUTS_CONSTANTS.MAX_CONNECTIONS_PER_POINT) {
      violations.push({
        type: 'point_limit_exceeded',
        message: `Point ${point.id} has ${point.connections.length} connections (max ${SPROUTS_CONSTANTS.MAX_CONNECTIONS_PER_POINT})`,
        affectedElements: [point.id],
      });
    }

    // Check that all referenced connections exist
    for (const connectionId of point.connections) {
      const curve = curves.find(c => c.id === connectionId);
      if (!curve) {
        violations.push({
          type: 'invalid_endpoints',
          message: `Point ${point.id} references non-existent curve ${connectionId}`,
          affectedElements: [point.id, connectionId],
        });
      }
    }
  }

  // Check curve consistency
  for (const curve of curves) {
    const startPoint = points.find(p => p.id === curve.startPointId);
    const endPoint = points.find(p => p.id === curve.endPointId);
    const newPoint = points.find(p => p.id === curve.newPointId);

    if (!startPoint || !endPoint || !newPoint) {
      violations.push({
        type: 'invalid_endpoints',
        message: `Curve ${curve.id} references invalid points`,
        affectedElements: [curve.id, curve.startPointId, curve.endPointId, curve.newPointId].filter(Boolean),
      });
    }

    // Check that start and end points reference this curve
    if (startPoint && !startPoint.connections.includes(curve.id)) {
      violations.push({
        type: 'invalid_endpoints',
        message: `Curve ${curve.id} not referenced by start point ${startPoint.id}`,
        affectedElements: [curve.id, startPoint.id],
      });
    }

    if (endPoint && !endPoint.connections.includes(curve.id)) {
      violations.push({
        type: 'invalid_endpoints',
        message: `Curve ${curve.id} not referenced by end point ${endPoint.id}`,
        affectedElements: [curve.id, endPoint.id],
      });
    }
  }

  // Check for curve intersections
  for (let i = 0; i < curves.length; i++) {
    for (let j = i + 1; j < curves.length; j++) {
      const curve1 = curves[i];
      const curve2 = curves[j];
      
      const intersection = curvesIntersect(curve1.controlPoints, curve2.controlPoints);
      if (intersection.hasIntersection) {
        violations.push({
          type: 'curve_intersection',
          message: `Curves ${curve1.id} and ${curve2.id} intersect`,
          affectedElements: [curve1.id, curve2.id],
        });
      }
    }
  }

  return {
    isValid: violations.length === 0,
    violations,
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Calculate distance from a point to a line segment
 */
function distanceToLineSegment(point: Point2D, lineStart: Point2D, lineEnd: Point2D): number {
  const A = point.x - lineStart.x;
  const B = point.y - lineStart.y;
  const C = lineEnd.x - lineStart.x;
  const D = lineEnd.y - lineStart.y;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;
  
  if (lenSq === 0) {
    // Line segment is actually a point
    return Math.sqrt(A * A + B * B);
  }

  const param = dot / lenSq;

  let xx, yy;

  if (param < 0) {
    xx = lineStart.x;
    yy = lineStart.y;
  } else if (param > 1) {
    xx = lineEnd.x;
    yy = lineEnd.y;
  } else {
    xx = lineStart.x + param * C;
    yy = lineStart.y + param * D;
  }

  const dx = point.x - xx;
  const dy = point.y - yy;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Check if a move would create a valid game state
 */
export function wouldMoveBeValid(
  move: SproutsMove,
  points: readonly SproutsPoint[],
  curves: readonly SproutsCurve[]
): ValidationResult {
  // First validate the move itself
  const moveValidation = validateSproutsMove(move, points, curves);
  if (!moveValidation.isValid) {
    return moveValidation;
  }

  // Simulate applying the move to check resulting state
  try {
    const { fromPointId, toPointId, curveId, newPointId, newPointPosition } = move.data;
    
    // Create new curve
    const newCurve: SproutsCurve = {
      id: curveId,
      startPointId: fromPointId,
      endPointId: toPointId,
      controlPoints: move.data.curvePath,
      newPointId: newPointId,
      createdAtMove: 0, // Placeholder
    };

    // Create new point
    const newPoint: SproutsPoint = {
      id: newPointId,
      x: newPointPosition.x,
      y: newPointPosition.y,
      connections: [curveId],
      createdAtMove: 0, // Placeholder
    };

    // Update existing points
    const updatedPoints = points.map(point => {
      if (point.id === fromPointId || point.id === toPointId) {
        return {
          ...point,
          connections: [...point.connections, curveId],
        };
      }
      return point;
    });

    // Create new state
    const newPoints = [...updatedPoints, newPoint];
    const newCurves = [...curves, newCurve];

    // Validate the resulting state
    const stateValidation = validateGameState(newPoints, newCurves);
    if (!stateValidation.isValid) {
      return {
        isValid: false,
        error: `Move would create invalid state: ${stateValidation.violations[0]?.message}`,
        code: 'INVALID_RESULTING_STATE',
      };
    }

    return { isValid: true };
  } catch (error) {
    return {
      isValid: false,
      error: `Error validating move: ${error instanceof Error ? error.message : 'Unknown error'}`,
      code: 'VALIDATION_ERROR',
    };
  }
}