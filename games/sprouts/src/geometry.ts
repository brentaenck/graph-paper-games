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
 * @fileoverview Geometric utility functions for Sprouts game
 */

import type {
  Point2D,
  BoundingBox,
  IntersectionResult,
  SproutsPoint,
  SproutsCurve,
} from './types';

import { SPROUTS_CONSTANTS } from './types';

// ============================================================================
// Basic Geometric Operations
// ============================================================================

/**
 * Calculate distance between two points
 */
export function distance(p1: Point2D, p2: Point2D): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculate squared distance between two points (more efficient when comparing distances)
 */
export function distanceSquared(p1: Point2D, p2: Point2D): number {
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return dx * dx + dy * dy;
}

/**
 * Calculate dot product of two vectors
 */
export function dotProduct(v1: Point2D, v2: Point2D): number {
  return v1.x * v2.x + v1.y * v2.y;
}

/**
 * Calculate cross product of two 2D vectors (returns scalar)
 */
export function crossProduct(v1: Point2D, v2: Point2D): number {
  return v1.x * v2.y - v1.y * v2.x;
}

/**
 * Subtract two points to get a vector
 */
export function subtract(p1: Point2D, p2: Point2D): Point2D {
  return { x: p1.x - p2.x, y: p1.y - p2.y };
}

/**
 * Add two points/vectors
 */
export function add(p1: Point2D, p2: Point2D): Point2D {
  return { x: p1.x + p2.x, y: p1.y + p2.y };
}

/**
 * Scale a vector by a scalar
 */
export function scale(point: Point2D, scalar: number): Point2D {
  return { x: point.x * scalar, y: point.y * scalar };
}

/**
 * Normalize a vector to unit length
 */
export function normalize(point: Point2D): Point2D {
  const len = Math.sqrt(point.x * point.x + point.y * point.y);
  if (len === 0) return { x: 0, y: 0 };
  return { x: point.x / len, y: point.y / len };
}

/**
 * Check if a point is within a circular area
 */
export function isPointInCircle(point: Point2D, center: Point2D, radius: number): boolean {
  return distanceSquared(point, center) <= radius * radius;
}

// ============================================================================
// Bezier Curve Operations
// ============================================================================

/**
 * Generate a smooth Bezier curve through a series of points
 * Uses cubic Bezier segments with automatic control point generation
 */
export function generateSmoothCurve(points: readonly Point2D[]): Point2D[] {
  if (points.length < 2) return [...points];
  if (points.length === 2) return [...points];

  const result: Point2D[] = [];
  result.push(points[0]);

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];
    const p_prev = i > 0 ? points[i - 1] : p0;
    const p_next = i < points.length - 2 ? points[i + 2] : p1;

    // Calculate control points for smooth curve
    const d01 = distance(p0, p1);
    const direction0 = normalize(subtract(p1, p_prev));
    const direction1 = normalize(subtract(p_next, p0));

    const cp1 = add(p0, scale(direction0, d01 * SPROUTS_CONSTANTS.CURVE_SMOOTHNESS));
    const cp2 = subtract(p1, scale(direction1, d01 * SPROUTS_CONSTANTS.CURVE_SMOOTHNESS));

    // Sample points along the Bezier curve
    const segments = Math.max(8, Math.ceil(d01 / 10));
    for (let j = 1; j <= segments; j++) {
      const t = j / segments;
      const point = evaluateCubicBezier(p0, cp1, cp2, p1, t);
      result.push(point);
    }
  }

  return result;
}

/**
 * Evaluate a cubic Bezier curve at parameter t (0 <= t <= 1)
 */
export function evaluateCubicBezier(
  p0: Point2D,
  p1: Point2D,
  p2: Point2D,
  p3: Point2D,
  t: number
): Point2D {
  const u = 1 - t;
  const tt = t * t;
  const uu = u * u;
  const uuu = uu * u;
  const ttt = tt * t;

  return {
    x: uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x,
    y: uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y,
  };
}

/**
 * Find a point along a curve path at a given parameter (0 <= t <= 1)
 */
export function findPointOnPath(path: readonly Point2D[], t: number): Point2D {
  if (path.length === 0) throw new Error('Path cannot be empty');
  if (path.length === 1) return path[0];

  t = Math.max(0, Math.min(1, t)); // Clamp t to [0, 1]

  // Calculate total path length
  let totalLength = 0;
  const segments: number[] = [];
  
  for (let i = 0; i < path.length - 1; i++) {
    const segmentLength = distance(path[i], path[i + 1]);
    segments.push(segmentLength);
    totalLength += segmentLength;
  }

  if (totalLength === 0) return path[0];

  // Find the target distance
  const targetDistance = t * totalLength;
  let currentDistance = 0;

  // Find which segment contains the target point
  for (let i = 0; i < segments.length; i++) {
    const nextDistance = currentDistance + segments[i];
    
    if (nextDistance >= targetDistance) {
      // Interpolate within this segment
      const segmentT = segments[i] === 0 ? 0 : (targetDistance - currentDistance) / segments[i];
      const p1 = path[i];
      const p2 = path[i + 1];
      return {
        x: p1.x + (p2.x - p1.x) * segmentT,
        y: p1.y + (p2.y - p1.y) * segmentT,
      };
    }
    
    currentDistance = nextDistance;
  }

  // Return the last point if we somehow get here
  return path[path.length - 1];
}

// ============================================================================
// Line Segment Operations
// ============================================================================

/**
 * Check if two line segments intersect
 */
export function lineSegmentsIntersect(
  p1: Point2D,
  q1: Point2D,
  p2: Point2D,
  q2: Point2D
): { intersects: boolean; point?: Point2D } {
  const d1 = subtract(q1, p1);
  const d2 = subtract(q2, p2);
  const d3 = subtract(p2, p1);

  const cross1 = crossProduct(d1, d2);
  
  // Lines are parallel
  if (Math.abs(cross1) < SPROUTS_CONSTANTS.INTERSECTION_TOLERANCE) {
    return { intersects: false };
  }

  const t1 = crossProduct(d3, d2) / cross1;
  const t2 = crossProduct(d3, d1) / cross1;

  // Check if intersection is within both line segments
  if (t1 >= 0 && t1 <= 1 && t2 >= 0 && t2 <= 1) {
    const intersection = add(p1, scale(d1, t1));
    return { intersects: true, point: intersection };
  }

  return { intersects: false };
}

/**
 * Find the closest point on a line segment to a given point
 */
export function closestPointOnLineSegment(
  point: Point2D,
  segmentStart: Point2D,
  segmentEnd: Point2D
): Point2D {
  const segment = subtract(segmentEnd, segmentStart);
  const toPoint = subtract(point, segmentStart);
  
  const segmentLengthSquared = dotProduct(segment, segment);
  if (segmentLengthSquared === 0) return segmentStart;

  const projection = dotProduct(toPoint, segment) / segmentLengthSquared;
  const clampedProjection = Math.max(0, Math.min(1, projection));

  return add(segmentStart, scale(segment, clampedProjection));
}

/**
 * Project a point onto a line segment (alias for closestPointOnLineSegment)
 */
export function projectPointOntoLineSegment(
  point: Point2D,
  segmentStart: Point2D,
  segmentEnd: Point2D
): Point2D {
  return closestPointOnLineSegment(point, segmentStart, segmentEnd);
}

// ============================================================================
// Curve Intersection Detection
// ============================================================================

/**
 * Check if a path intersects with itself
 */
function checkSelfIntersection(path: readonly Point2D[]): IntersectionResult {
  const intersectionPoints: Point2D[] = [];
  
  // Check if this is a closed loop (starts and ends at the same point)
  const isClosedLoop = path.length > 2 && distance(path[0], path[path.length - 1]) < 0.1;
  
  // Check each segment against every other non-adjacent segment
  for (let i = 0; i < path.length - 1; i++) {
    for (let j = i + 2; j < path.length - 1; j++) {
      // Skip adjacent segments (they naturally share endpoints)
      
      // For closed loops, also skip the case where the first and last segments
      // might legitimately connect (this is normal for a proper loop)
      if (isClosedLoop && ((i === 0 && j === path.length - 2) || (i === 1 && j === path.length - 1))) {
        continue;
      }
      
      const seg1Start = path[i];
      const seg1End = path[i + 1];
      const seg2Start = path[j];
      const seg2End = path[j + 1];
      
      const intersection = lineSegmentsIntersect(seg1Start, seg1End, seg2Start, seg2End);
      
      if (intersection.intersects && intersection.point) {
        // For self-intersection, allow intersections only at exact shared endpoints
        const EXACT_TOLERANCE = 0.1;
        
        const isSharedEndpoint = (
          distance(seg1Start, seg2Start) < EXACT_TOLERANCE ||
          distance(seg1Start, seg2End) < EXACT_TOLERANCE ||
          distance(seg1End, seg2Start) < EXACT_TOLERANCE ||
          distance(seg1End, seg2End) < EXACT_TOLERANCE
        );
        
        if (!isSharedEndpoint) {
          intersectionPoints.push(intersection.point);
        }
      }
    }
  }
  
  return {
    hasIntersection: intersectionPoints.length > 0,
    intersectionPoints,
  };
}

/**
 * Check if two line segments are parallel or collinear
 */
function areSegmentsParallelOrOverlapping(
  seg1Start: Point2D,
  seg1End: Point2D,
  seg2Start: Point2D,
  seg2End: Point2D
): boolean {
  const vec1 = subtract(seg1End, seg1Start);
  const vec2 = subtract(seg2End, seg2Start);
  
  // Check if vectors are parallel (cross product near zero)
  const crossProduct = vec1.x * vec2.y - vec1.y * vec2.x;
  const isParallel = Math.abs(crossProduct) < 1e-6;
  
  if (!isParallel) return false;
  
  // If parallel, check if they're collinear (one point of seg2 is on the line of seg1)
  const seg1ToSeg2Start = subtract(seg2Start, seg1Start);
  const crossProductCollinear = vec1.x * seg1ToSeg2Start.y - vec1.y * seg1ToSeg2Start.x;
  const isCollinear = Math.abs(crossProductCollinear) < 5; // 5 pixel tolerance for "on the same line"
  
  if (!isCollinear) return false;
  
  // If collinear, check if segments overlap
  const seg1Length = Math.sqrt(vec1.x * vec1.x + vec1.y * vec1.y);
  const seg2Length = Math.sqrt(vec2.x * vec2.x + vec2.y * vec2.y);
  
  if (seg1Length === 0 || seg2Length === 0) return false;
  
  // Project seg2 points onto seg1 line
  const seg1Unit = { x: vec1.x / seg1Length, y: vec1.y / seg1Length };
  
  const proj2Start = dotProduct(seg1ToSeg2Start, seg1Unit);
  const proj2End = proj2Start + dotProduct(vec2, seg1Unit);
  
  // Check if projections overlap with seg1 (which goes from 0 to seg1Length)
  const overlapStart = Math.max(0, Math.min(proj2Start, proj2End));
  const overlapEnd = Math.min(seg1Length, Math.max(proj2Start, proj2End));
  
  return overlapStart < overlapEnd - 1; // At least 1 pixel of overlap
}

/**
 * Check if two line paths intersect (strict detection for Phase 1)
 */
export function curvesIntersect(
  curve1Path: readonly Point2D[],
  curve2Path: readonly Point2D[]
): IntersectionResult {
  const intersectionPoints: Point2D[] = [];

  // First, check for self-intersection within each path
  // This is important for complex loops
  const selfIntersection1 = checkSelfIntersection(curve1Path);
  if (selfIntersection1.hasIntersection) {
    intersectionPoints.push(...selfIntersection1.intersectionPoints);
  }
  
  const selfIntersection2 = checkSelfIntersection(curve2Path);
  if (selfIntersection2.hasIntersection) {
    intersectionPoints.push(...selfIntersection2.intersectionPoints);
  }

  // Then check each segment of path1 against each segment of path2
  for (let i = 0; i < curve1Path.length - 1; i++) {
    for (let j = 0; j < curve2Path.length - 1; j++) {
      const seg1Start = curve1Path[i];
      const seg1End = curve1Path[i + 1];
      const seg2Start = curve2Path[j];
      const seg2End = curve2Path[j + 1];
      
      // Check for parallel/overlapping segments (this is illegal in Sprouts)
      const isOverlapping = areSegmentsParallelOrOverlapping(seg1Start, seg1End, seg2Start, seg2End);
      
      if (isOverlapping) {
        // For overlapping segments, add a point to indicate intersection
        const midpoint = {
          x: (seg1Start.x + seg1End.x) / 2,
          y: (seg1Start.y + seg1End.y) / 2
        };
        intersectionPoints.push(midpoint);
        continue;
      }
      
      // Check for traditional crossing intersections
      const intersection = lineSegmentsIntersect(seg1Start, seg1End, seg2Start, seg2End);

      if (intersection.intersects && intersection.point) {
        // Only allow intersections if the segments share an exact endpoint
        // This is much stricter than the previous tolerance-based approach
        const EXACT_ENDPOINT_TOLERANCE = 0.1; // Very small tolerance for floating point precision
        
        const isSharedEndpoint = (
          distance(seg1Start, seg2Start) < EXACT_ENDPOINT_TOLERANCE ||
          distance(seg1Start, seg2End) < EXACT_ENDPOINT_TOLERANCE ||
          distance(seg1End, seg2Start) < EXACT_ENDPOINT_TOLERANCE ||
          distance(seg1End, seg2End) < EXACT_ENDPOINT_TOLERANCE
        );
        
        if (!isSharedEndpoint) {
          // This is a middle intersection - not allowed in Sprouts
          intersectionPoints.push(intersection.point);
        }
      }
    }
  }

  return {
    hasIntersection: intersectionPoints.length > 0,
    intersectionPoints,
  };
}

/**
 * Check if a curve passes through any existing points (except at endpoints)
 */
export function curvePassesThroughPoint(
  curvePath: readonly Point2D[],
  point: SproutsPoint,
  allowedEndpoints: readonly string[] = []
): boolean {
  // If this point is an allowed endpoint, don't consider it a violation
  if (allowedEndpoints.includes(point.id)) {
    return false;
  }

  const pointLocation = { x: point.x, y: point.y };
  const threshold = 12; // Reduced threshold for straight lines - be more lenient

  for (let i = 0; i < curvePath.length - 1; i++) {
    const closest = closestPointOnLineSegment(
      pointLocation,
      curvePath[i],
      curvePath[i + 1]
    );

    if (distance(pointLocation, closest) < threshold) {
      return true;
    }
  }

  return false;
}

// ============================================================================
// Bounding Box Operations
// ============================================================================

/**
 * Calculate bounding box for a set of points
 */
export function calculateBoundingBox(points: readonly Point2D[]): BoundingBox {
  if (points.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
  }

  let minX = points[0].x;
  let minY = points[0].y;
  let maxX = points[0].x;
  let maxY = points[0].y;

  for (const point of points) {
    minX = Math.min(minX, point.x);
    minY = Math.min(minY, point.y);
    maxX = Math.max(maxX, point.x);
    maxY = Math.max(maxY, point.y);
  }

  return { minX, minY, maxX, maxY };
}

/**
 * Check if two bounding boxes intersect
 */
export function boundingBoxesIntersect(box1: BoundingBox, box2: BoundingBox): boolean {
  return !(
    box1.maxX < box2.minX ||
    box2.maxX < box1.minX ||
    box1.maxY < box2.minY ||
    box2.maxY < box1.minY
  );
}

/**
 * Expand a bounding box by a given margin
 */
export function expandBoundingBox(box: BoundingBox, margin: number): BoundingBox {
  return {
    minX: box.minX - margin,
    minY: box.minY - margin,
    maxX: box.maxX + margin,
    maxY: box.maxY + margin,
  };
}

// ============================================================================
// Enhanced Multi-Segment Curve Generation (Phase 1)
// ============================================================================

/**
 * Generate a smooth curve approximation using multiple line segments
 * This replaces the simple 2-point lines with visually appealing curves
 * while maintaining exact line-segment intersection detection
 */
export function generateSmootherLinePath(
  startPoint: Point2D,
  endPoint: Point2D,
  config: {
    segments?: number;
    curvature?: number;
    adaptiveSegments?: boolean;
    minSegments?: number;
    maxSegments?: number;
    segmentThreshold?: number;
  } = {}
): Point2D[] {
  // Default configuration
  const {
    segments = 6,
    curvature = 0.2,
    adaptiveSegments = true,
    minSegments = 4,
    maxSegments = 12,
    segmentThreshold = 80,
  } = config;

  // Check if this is a self-connection (loop)
  const dist = distance(startPoint, endPoint);
  if (dist < 10) {
    return generateSmootherLoop(startPoint, {
      segments: adaptiveSegments ? Math.max(8, segments) : segments,
      radius: Math.max(30, dist * 3),
    });
  }

  // For very short connections, use minimal segments
  if (dist < 20) {
    return [startPoint, endPoint];
  }

  // Calculate adaptive segment count based on distance
  let actualSegments = segments;
  if (adaptiveSegments) {
    actualSegments = Math.round(
      minSegments + 
      ((maxSegments - minSegments) * Math.min(1, dist / segmentThreshold))
    );
  }

  // Ensure minimum of 2 segments (start and end points)
  actualSegments = Math.max(2, actualSegments);

  // If segments is 2, return straight line
  if (actualSegments === 2 || curvature === 0) {
    return [startPoint, endPoint];
  }

  // Calculate control point for quadratic curve
  const direction = normalize(subtract(endPoint, startPoint));
  const perpendicular = { x: -direction.y, y: direction.x };
  const midpoint = {
    x: (startPoint.x + endPoint.x) / 2,
    y: (startPoint.y + endPoint.y) / 2,
  };

  // Apply curvature with some randomness for natural look
  const curveHeight = dist * curvature;
  const variation = curveHeight * 0.3 * (Math.random() - 0.5); // ±15% variation
  const controlPoint = add(
    midpoint,
    scale(perpendicular, curveHeight + variation)
  );

  // Sample the quadratic Bézier curve at regular intervals
  const points: Point2D[] = [];
  for (let i = 0; i <= actualSegments; i++) {
    const t = i / actualSegments;
    const point = evaluateQuadraticBezier(startPoint, controlPoint, endPoint, t);
    points.push(point);
  }

  return points;
}

/**
 * Evaluate a quadratic Bézier curve at parameter t (0 <= t <= 1)
 */
function evaluateQuadraticBezier(
  p0: Point2D,
  p1: Point2D,
  p2: Point2D,
  t: number
): Point2D {
  const u = 1 - t;
  return {
    x: u * u * p0.x + 2 * u * t * p1.x + t * t * p2.x,
    y: u * u * p0.y + 2 * u * t * p1.y + t * t * p2.y,
  };
}

/**
 * Generate a smoother loop approximation using multiple segments
 */
export function generateSmootherLoop(
  centerPoint: Point2D,
  config: {
    segments?: number;
    radius?: number;
    angleOffset?: number;
  } = {}
): Point2D[] {
  const {
    segments = 12,
    radius = 30,
    angleOffset = 0,
  } = config;

  const points: Point2D[] = [];
  
  // Generate points around a circle
  for (let i = 0; i <= segments; i++) {
    const angle = angleOffset + (i / segments) * 2 * Math.PI;
    const point = {
      x: centerPoint.x + radius * Math.cos(angle),
      y: centerPoint.y + radius * Math.sin(angle),
    };
    points.push(point);
  }

  return points;
}

/**
 * Enhanced version of generateStraightLineWithPoint that uses multi-segment curves
 */
export function generateEnhancedLineWithPoint(
  startPoint: Point2D,
  endPoint: Point2D,
  newPointPosition: Point2D,
  existingCurves: readonly SproutsCurve[] = [],
  config: {
    segments?: number;
    curvature?: number;
    adaptiveSegments?: boolean;
  } = {}
): Point2D[] {
  // Check if this is a self-connection (loop)
  const dist = distance(startPoint, endPoint);
  if (dist < 10) {
    return generateEnhancedLoop(
      startPoint,
      newPointPosition,
      existingCurves,
      config
    );
  }

  // For regular connections, generate smooth curve through the new point
  const path = generateSmootherLinePath(startPoint, endPoint, config);
  
  // Insert the new point at the closest position on the generated curve
  return insertPointOnPath(path, newPointPosition);
}

/**
 * Generate an enhanced loop that avoids intersections using multi-segment approach
 */
function generateEnhancedLoop(
  startPoint: Point2D,
  targetPoint: Point2D,
  existingCurves: readonly SproutsCurve[],
  config: { segments?: number } = {}
): Point2D[] {
  const segments = config.segments || 12;
  
  // Calculate direction to target for loop orientation
  const dx = targetPoint.x - startPoint.x;
  const dy = targetPoint.y - startPoint.y;
  const targetDistance = Math.sqrt(dx * dx + dy * dy);
  
  // Determine loop size
  const baseRadius = Math.max(30, targetDistance * 0.8);
  const angleToTarget = Math.atan2(dy, dx);
  
  // Try different loop configurations
  const configurations = [
    { radius: baseRadius, angleOffset: angleToTarget },
    { radius: baseRadius * 1.2, angleOffset: angleToTarget },
    { radius: baseRadius * 1.5, angleOffset: angleToTarget + Math.PI / 4 },
    { radius: baseRadius * 0.8, angleOffset: angleToTarget - Math.PI / 4 },
  ];
  
  for (const { radius, angleOffset } of configurations) {
    const loopPath = generateSmootherLoop(startPoint, {
      segments,
      radius,
      angleOffset,
    });
    
    // Insert target point at closest position
    const pathWithPoint = insertPointOnPath(loopPath, targetPoint);
    
    // Check if this configuration avoids intersections
    if (existingCurves.length === 0 || isValidPath(pathWithPoint, existingCurves)) {
      return pathWithPoint;
    }
  }
  
  // Fallback: return simple loop with target point
  const fallbackLoop = generateSmootherLoop(startPoint, { segments, radius: baseRadius });
  return insertPointOnPath(fallbackLoop, targetPoint);
}

/**
 * Insert a point at the closest position along a path
 */
function insertPointOnPath(path: readonly Point2D[], newPoint: Point2D): Point2D[] {
  if (path.length < 2) return [...path];
  
  let bestSegmentIndex = 0;
  let closestPoint = newPoint;
  let minDistance = Infinity;
  
  // Find the closest segment
  for (let i = 0; i < path.length - 1; i++) {
    const segmentStart = path[i];
    const segmentEnd = path[i + 1];
    const closest = closestPointOnLineSegment(newPoint, segmentStart, segmentEnd);
    const dist = distance(newPoint, closest);
    
    if (dist < minDistance) {
      minDistance = dist;
      bestSegmentIndex = i;
      closestPoint = closest;
    }
  }
  
  // Insert the point at the best position
  const newPath = [...path];
  newPath.splice(bestSegmentIndex + 1, 0, closestPoint);
  return newPath;
}

/**
 * Quick validation check for path feasibility
 */
function isValidPath(
  path: readonly Point2D[],
  existingCurves: readonly SproutsCurve[]
): boolean {
  // Quick intersection check (simplified)
  for (const curve of existingCurves) {
    const intersection = curvesIntersect(path, curve.controlPoints);
    if (intersection.hasIntersection) {
      return false;
    }
  }
  return true;
}

// ============================================================================
// Game-Specific Geometric Functions
// ============================================================================

/**
 * Generate initial point positions for a new Sprouts game
 */
export function generateInitialPoints(
  numPoints: number,
  canvasWidth: number = 400,
  canvasHeight: number = 300
): Point2D[] {
  const points: Point2D[] = [];
  const padding = SPROUTS_CONSTANTS.CANVAS_PADDING;
  const usableWidth = canvasWidth - 2 * padding;
  const usableHeight = canvasHeight - 2 * padding;

  if (numPoints === 1) {
    points.push({
      x: canvasWidth / 2,
      y: canvasHeight / 2,
    });
  } else if (numPoints === 2) {
    points.push(
      { x: padding + usableWidth * 0.3, y: canvasHeight / 2 },
      { x: padding + usableWidth * 0.7, y: canvasHeight / 2 }
    );
  } else if (numPoints === 3) {
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    const radius = Math.min(usableWidth, usableHeight) * 0.25;
    
    for (let i = 0; i < 3; i++) {
      const angle = (i * 2 * Math.PI) / 3 - Math.PI / 2; // Start from top
      points.push({
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      });
    }
  } else {
    // For 4+ points, arrange in a circle
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;
    const radius = Math.min(usableWidth, usableHeight) * 0.3;
    
    for (let i = 0; i < numPoints; i++) {
      const angle = (i * 2 * Math.PI) / numPoints - Math.PI / 2; // Start from top
      points.push({
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      });
    }
  }

  return points;
}

/**
 * Generate a curve path between two points (Phase 1 with enhancement options)
 * Can generate either simple straight lines or enhanced multi-segment curves
 */
export function generateCurvePath(
  startPoint: Point2D,
  endPoint: Point2D,
  intermediatePoints: readonly Point2D[] = [],
  useEnhanced: boolean = false,
  config?: {
    segments?: number;
    curvature?: number;
    adaptiveSegments?: boolean;
    minSegments?: number;
    maxSegments?: number;
    segmentThreshold?: number;
  }
): Point2D[] {
  // If enhanced mode is enabled, use the new multi-segment approach
  if (useEnhanced) {
    if (intermediatePoints.length === 0) {
      return generateSmootherLinePath(startPoint, endPoint, config);
    } else {
      // For paths with intermediate points, enhance each segment
      const points: Point2D[] = [startPoint];
      const allPoints = [startPoint, ...intermediatePoints, endPoint];
      
      for (let i = 0; i < allPoints.length - 1; i++) {
        const segmentPath = generateSmootherLinePath(
          allPoints[i],
          allPoints[i + 1],
          { ...config, segments: Math.max(2, (config?.segments || 6) / 2) }
        );
        // Skip the first point to avoid duplication
        points.push(...segmentPath.slice(1));
      }
      
      return points;
    }
  }

  // Original behavior for compatibility
  if (intermediatePoints.length === 0) {
    // Check if this is a self-connection (loop)
    const dist = distance(startPoint, endPoint);
    if (dist < 10) { // Points are the same (self-connection)
      return generateSimpleLoop(startPoint);
    }
    
    // Regular straight line between different points
    return [startPoint, endPoint];
  }

  // With intermediate points: create straight line segments
  return [startPoint, ...intermediatePoints, endPoint];
}

/**
 * Generate a simple circular loop around a point for straight-line gameplay
 */
export function generateSimpleLoop(
  centerPoint: Point2D,
  radius: number = 30
): Point2D[] {
  // Create a simple circular loop with several points for smooth rendering
  const points: Point2D[] = [];
  const numSegments = 12; // 12 segments for smooth circle
  
  for (let i = 0; i <= numSegments; i++) {
    const angle = (i / numSegments) * 2 * Math.PI;
    points.push({
      x: centerPoint.x + radius * Math.cos(angle),
      y: centerPoint.y + radius * Math.sin(angle)
    });
  }
  
  return points;
}

/**
 * Generate a straight line path with a manually placed point (Phase 1)
 */
export function generateStraightLineWithPoint(
  startPoint: Point2D,
  endPoint: Point2D,
  newPointPosition: Point2D,
  existingPoints: readonly SproutsPoint[] = [],
  existingCurves: readonly SproutsCurve[] = []
): Point2D[] {
  // Check if this is a self-connection (loop)
  const dist = distance(startPoint, endPoint);
  if (dist < 10) { // Points are the same (self-connection)
    // Always use manual loop generation for proper Sprouts loop structure
    // The generateValidCurvePath creates circular paths that don't start/end at the original point
    console.log('generateStraightLineWithPoint: Using manual loop generation for proper Sprouts loop structure');
    
    // Note: We could use generateValidCurvePath for intersection checking, but its loop structure
    // doesn't match Sprouts rules where loops must start and end at the same point
    
    // Generate a simple loop that starts and ends at the original point
    // Calculate the direction from the original point to the user's click
    const dx = newPointPosition.x - startPoint.x;
    const dy = newPointPosition.y - startPoint.y;
    const clickDistance = Math.sqrt(dx * dx + dy * dy);
    
    // Determine loop size based on click distance, with minimum safe distance
    const minLoopSize = 40; // Minimum loop radius to avoid other points
    const loopRadius = Math.max(minLoopSize, clickDistance * 0.8);
    
    // Create a simple oval/circular loop that goes out from the start point
    // and comes back to it, passing through approximately where the user clicked
    const numSegments = 8; // Fewer segments for simpler loop
    const points: Point2D[] = [];
    
    // Start at the original point
    points.push(startPoint);
    
    // Create the loop path - we'll make it roughly circular
    // but ensure it passes reasonably close to the user's click
    const angleToClick = Math.atan2(dy, dx);
    
    for (let i = 1; i <= numSegments; i++) {
      const angle = angleToClick + (i / numSegments) * 2 * Math.PI;
      const radius = loopRadius;
      
      points.push({
        x: startPoint.x + radius * Math.cos(angle),
        y: startPoint.y + radius * Math.sin(angle)
      });
    }
    
    // End back at the original point
    points.push(startPoint);
    
    // Find the closest position on the loop path for the new point
    let bestSegmentIndex = 0;
    let closestPointOnLoop = newPointPosition;
    let minDistanceToLoop = Infinity;
    
    for (let i = 0; i < points.length - 1; i++) {
      const segmentStart = points[i];
      const segmentEnd = points[i + 1];
      
      const closestOnSegment = closestPointOnLineSegment(
        newPointPosition,
        segmentStart,
        segmentEnd
      );
      
      const distToSegment = distance(newPointPosition, closestOnSegment);
      if (distToSegment < minDistanceToLoop) {
        minDistanceToLoop = distToSegment;
        bestSegmentIndex = i;
        closestPointOnLoop = closestOnSegment;
      }
    }
    
    console.log('Loop generation:', {
      startPoint,
      newPointPosition,
      bestSegmentIndex,
      loopRadius,
      closestPointOnLoop,
      existingPointsCount: existingPoints.length,
      clickDistance
    });
    
    // Insert the new point at the closest position on the loop
    const modifiedLoop = [...points];
    modifiedLoop.splice(bestSegmentIndex + 1, 0, closestPointOnLoop);
    
    // Check if this loop intersects with existing curves and try alternatives
    if (existingCurves.length > 0) {
      console.log('Checking loop validity. Loop starts at:', modifiedLoop[0], 'ends at:', modifiedLoop[modifiedLoop.length - 1]);
      console.log('Distance between start/end:', distance(modifiedLoop[0], modifiedLoop[modifiedLoop.length - 1]));
      console.log('Existing curves count:', existingCurves.length);
      
      // For loops, we need to allow the start/end point as a valid endpoint
      // since the loop legitimately starts and ends at this point
      const startPointId = existingPoints.find(p => 
        distance({x: p.x, y: p.y}, modifiedLoop[0]) < 0.1
      )?.id;
      
      const allowedEndpoints = startPointId ? [startPointId] : [];
      console.log('Allowing endpoint for loop:', allowedEndpoints);
      
      const validation = isValidCurvePath(modifiedLoop, existingCurves, existingPoints, allowedEndpoints);
      console.log('Initial validation result:', validation);
      
      if (!validation.isValid) {
        console.log('Manual loop intersects with existing curves, trying alternative strategies');
        
        // Strategy 1: Try multiple larger radii
        const radiusMultipliers = [1.5, 2.0, 2.5, 3.0];
        
        for (const multiplier of radiusMultipliers) {
          const testRadius = loopRadius * multiplier;
          const testPoints: Point2D[] = [startPoint];
          
          for (let i = 1; i <= numSegments; i++) {
            const angle = angleToClick + (i / numSegments) * 2 * Math.PI;
            testPoints.push({
              x: startPoint.x + testRadius * Math.cos(angle),
              y: startPoint.y + testRadius * Math.sin(angle)
            });
          }
          
          testPoints.push(startPoint);
          
          // Find best position for new point
          let bestTestSegmentIndex = 0;
          let closestOnTestLoop = newPointPosition;
          let minDistanceToTestLoop = Infinity;
          
          for (let i = 0; i < testPoints.length - 1; i++) {
            const segmentStart = testPoints[i];
            const segmentEnd = testPoints[i + 1];
            
            const closestOnSegment = closestPointOnLineSegment(
              newPointPosition,
              segmentStart,
              segmentEnd
            );
            
            const distToSegment = distance(newPointPosition, closestOnSegment);
            if (distToSegment < minDistanceToTestLoop) {
              minDistanceToTestLoop = distToSegment;
              bestTestSegmentIndex = i;
              closestOnTestLoop = closestOnSegment;
            }
          }
          
          const modifiedTestLoop = [...testPoints];
          modifiedTestLoop.splice(bestTestSegmentIndex + 1, 0, closestOnTestLoop);
          
          // Check if this radius works
          const testValidation = isValidCurvePath(modifiedTestLoop, existingCurves, existingPoints, allowedEndpoints);
          if (testValidation.isValid) {
            console.log(`Using ${multiplier}x larger loop radius to avoid intersections`);
            return modifiedTestLoop;
          }
        }
        
        // Strategy 2: Try different starting angles (rotate the loop)
        console.log('Larger radii failed, trying different loop orientations');
        const angleOffsets = [Math.PI/4, Math.PI/2, 3*Math.PI/4, Math.PI, 5*Math.PI/4, 3*Math.PI/2, 7*Math.PI/4];
        
        for (const angleOffset of angleOffsets) {
          const rotatedPoints: Point2D[] = [startPoint];
          
          for (let i = 1; i <= numSegments; i++) {
            const angle = angleToClick + angleOffset + (i / numSegments) * 2 * Math.PI;
            rotatedPoints.push({
              x: startPoint.x + loopRadius * Math.cos(angle),
              y: startPoint.y + loopRadius * Math.sin(angle)
            });
          }
          
          rotatedPoints.push(startPoint);
          
          // Find best position for new point
          let bestRotatedSegmentIndex = 0;
          let closestOnRotatedLoop = newPointPosition;
          let minDistanceToRotatedLoop = Infinity;
          
          for (let i = 0; i < rotatedPoints.length - 1; i++) {
            const segmentStart = rotatedPoints[i];
            const segmentEnd = rotatedPoints[i + 1];
            
            const closestOnSegment = closestPointOnLineSegment(
              newPointPosition,
              segmentStart,
              segmentEnd
            );
            
            const distToSegment = distance(newPointPosition, closestOnSegment);
            if (distToSegment < minDistanceToRotatedLoop) {
              minDistanceToRotatedLoop = distToSegment;
              bestRotatedSegmentIndex = i;
              closestOnRotatedLoop = closestOnSegment;
            }
          }
          
          const modifiedRotatedLoop = [...rotatedPoints];
          modifiedRotatedLoop.splice(bestRotatedSegmentIndex + 1, 0, closestOnRotatedLoop);
          
          // Check if this orientation works
          const rotatedValidation = isValidCurvePath(modifiedRotatedLoop, existingCurves, existingPoints, allowedEndpoints);
          if (rotatedValidation.isValid) {
            console.log(`Using rotated loop orientation to avoid intersections`);
            return modifiedRotatedLoop;
          }
        }
        
        console.log('All loop strategies failed, returning original (validation will reject this)');
      }
    }
    
    return modifiedLoop;
  }
  
  // Regular straight line: start -> newPoint -> end
  return [startPoint, newPointPosition, endPoint];
}

/**
 * Generate a curve path that avoids existing curves and points
 */
export function generateValidCurvePath(
  startPoint: Point2D,
  endPoint: Point2D,
  existingCurves: readonly SproutsCurve[],
  existingPoints: readonly SproutsPoint[],
  allowedEndpoints: readonly string[] = []
): Point2D[] | null {
  console.log('generateValidCurvePath called:', {
    startPoint, 
    endPoint, 
    existingCurvesCount: existingCurves.length, 
    existingPointsCount: existingPoints.length
  });
  const dist = distance(startPoint, endPoint);
  
  // Handle self-connection (loop) - try different loop positions
  if (dist < 10) {
    const loopSteps = 16;
    
    // Find the minimum distance to existing curves/points to determine safe loop radius
    let minDistanceToObstacle = 50; // Default minimum
    
    // Check distance to existing curves
    for (const curve of existingCurves) {
      for (const point of curve.controlPoints) {
        const distToObstacle = distance(startPoint, point);
        if (distToObstacle > 5 && distToObstacle < minDistanceToObstacle) { // Ignore the point itself
          minDistanceToObstacle = distToObstacle;
        }
      }
    }
    
    // Check distance to existing points
    for (const point of existingPoints) {
      const distToObstacle = distance(startPoint, { x: point.x, y: point.y });
      if (distToObstacle > 5 && distToObstacle < minDistanceToObstacle) { // Ignore the point itself
        minDistanceToObstacle = distToObstacle;
      }
    }
    
    // Try different loop radii - start smaller and increase
    const baseRadius = Math.min(30, minDistanceToObstacle * 0.3);
    const loopRadii = [baseRadius, baseRadius * 1.2, baseRadius * 1.5, baseRadius * 2];
    
    // Try loops in different directions for each radius
    const directionOffsets = [
      { x: 1, y: 0 },     // Right
      { x: -1, y: 0 },    // Left  
      { x: 0, y: 1 },     // Down
      { x: 0, y: -1 },    // Up
      { x: 0.7, y: 0.7 },   // Down-right
      { x: -0.7, y: 0.7 },  // Down-left
      { x: 0.7, y: -0.7 },  // Up-right
      { x: -0.7, y: -0.7 }, // Up-left
    ];
    
    for (const loopRadius of loopRadii) {
      for (const direction of directionOffsets) {
        const loopPoints: Point2D[] = [];
        const offset = { x: direction.x * loopRadius, y: direction.y * loopRadius };
        const loopCenter = add(startPoint, offset);
        
        for (let i = 0; i <= loopSteps; i++) {
          const angle = (i / loopSteps) * 2 * Math.PI;
          const x = loopCenter.x + loopRadius * Math.cos(angle);
          const y = loopCenter.y + loopRadius * Math.sin(angle);
          loopPoints.push({ x, y });
        }
        
        const validation = isValidCurvePath(loopPoints, existingCurves, existingPoints, allowedEndpoints);
        if (validation.isValid) {
          console.log(`Generated valid loop with radius ${loopRadius} in direction`, direction);
          return loopPoints;
        }
      }
    }
    
    // If no loop worked, return a simple loop as fallback
    return generateCurvePath(startPoint, endPoint);
  }
  
  // For normal connections, try multiple curve variations
  const direction = normalize(subtract(endPoint, startPoint));
  const perpendicular = { x: -direction.y, y: direction.x };
  const midpoint = {
    x: (startPoint.x + endPoint.x) / 2,
    y: (startPoint.y + endPoint.y) / 2,
  };
  
  // Try different curve heights and directions
  const baseHeight = Math.min(30, dist * 0.2);
  const curveVariations = [
    baseHeight,      // Normal height
    baseHeight * 1.5, // Higher curve
    baseHeight * 0.5, // Lower curve
    -baseHeight,     // Curve in opposite direction
    -baseHeight * 1.5, // Higher opposite curve
    baseHeight * 2,   // Much higher curve
    -baseHeight * 2,  // Much higher opposite curve
  ];
  
  for (let i = 0; i < curveVariations.length; i++) {
    const height = curveVariations[i];
    const controlPoint = add(midpoint, scale(perpendicular, height));
    const curvePath = generateSmoothCurve([startPoint, controlPoint, endPoint]);
    
    console.log(`Trying curve variation ${i + 1}/${curveVariations.length} with height ${height}`);
    const validation = isValidCurvePath(curvePath, existingCurves, existingPoints, allowedEndpoints);
    console.log('Validation result:', validation);
    if (validation.isValid) {
      console.log('Found valid curve path!');
      return curvePath;
    }
  }
  
  // Try with two control points for more complex curves
  const quarterPoint1 = {
    x: startPoint.x + (endPoint.x - startPoint.x) * 0.25,
    y: startPoint.y + (endPoint.y - startPoint.y) * 0.25,
  };
  const quarterPoint2 = {
    x: startPoint.x + (endPoint.x - startPoint.x) * 0.75,
    y: startPoint.y + (endPoint.y - startPoint.y) * 0.75,
  };
  
  const complexVariations = [
    [baseHeight * 0.5, -baseHeight * 0.5],  // S-curve
    [-baseHeight * 0.5, baseHeight * 0.5],  // Reverse S-curve
    [baseHeight, baseHeight],                // Same-side curve
    [-baseHeight, -baseHeight],              // Same-side opposite
  ];
  
  for (const [height1, height2] of complexVariations) {
    const control1 = add(quarterPoint1, scale(perpendicular, height1));
    const control2 = add(quarterPoint2, scale(perpendicular, height2));
    const curvePath = generateSmoothCurve([startPoint, control1, control2, endPoint]);
    
    const validation = isValidCurvePath(curvePath, existingCurves, existingPoints, allowedEndpoints);
    if (validation.isValid) {
      return curvePath;
    }
  }
  
  // Last resort: try a completely straight line
  const straightLine = [startPoint, endPoint];
  const straightValidation = isValidCurvePath(straightLine, existingCurves, existingPoints, allowedEndpoints);
  if (straightValidation.isValid) {
    return straightLine;
  }
  
  // If all attempts fail, return null to indicate no valid path found
  return null;
}

/**
 * Check if a proposed curve path is valid (doesn't create topology violations)
 */
export function isValidCurvePath(
  path: readonly Point2D[],
  existingCurves: readonly SproutsCurve[],
  existingPoints: readonly SproutsPoint[],
  allowedEndpoints: readonly string[] = []
): { isValid: boolean; reason?: string } {
  // Check intersections with existing curves
  for (const existingCurve of existingCurves) {
    const intersection = curvesIntersect(path, existingCurve.controlPoints);
    if (intersection.hasIntersection) {
      return { isValid: false, reason: 'Curve intersects with existing curve' };
    }
  }

  // Check if curve passes through existing points
  for (const existingPoint of existingPoints) {
    if (curvePassesThroughPoint(path, existingPoint, allowedEndpoints)) {
      return { isValid: false, reason: 'Curve passes through existing point' };
    }
  }

  return { isValid: true };
}

// ============================================================================
// Hand-Drawn Style Curve Generation (Phase 2A)
// ============================================================================

/**
 * Apply hand-drawn imperfections to a point
 */
function addHandDrawnVariation(
  point: Point2D, 
  intensity: number,
  pathProgress: number,
  enableTremor: boolean = true
): Point2D {
  // Natural tremor effect - subtle random variations
  const tremorIntensity = enableTremor ? intensity * 0.5 : 0;
  const tremorX = (Math.random() - 0.5) * tremorIntensity * 2;
  const tremorY = (Math.random() - 0.5) * tremorIntensity * 2;
  
  // Pressure variation effect - varies along the path
  const pressureVariation = Math.sin(pathProgress * Math.PI) * intensity * 0.3;
  
  return {
    x: point.x + tremorX + Math.cos(pathProgress * 4) * pressureVariation,
    y: point.y + tremorY + Math.sin(pathProgress * 4) * pressureVariation,
  };
}

/**
 * Convert a smooth multi-segment path to a hand-drawn SVG path
 */
export function generateHandDrawnPath(
  points: readonly Point2D[],
  config: {
    roughnessIntensity: number;
    naturalTremor: boolean;
    pressureVariation: boolean;
  }
): string {
  if (points.length < 2) return '';
  
  const { roughnessIntensity, naturalTremor } = config;
  
  // Start the path
  let pathString = `M ${points[0].x} ${points[0].y}`;
  
  // Add hand-drawn variations to each segment
  for (let i = 1; i < points.length; i++) {
    const progress = i / (points.length - 1);
    const currentPoint = points[i];
    
    // Apply hand-drawn variations
    const variedPoint = addHandDrawnVariation(
      currentPoint,
      roughnessIntensity,
      progress,
      naturalTremor
    );
    
    if (i === 1) {
      // First segment - simple line
      pathString += ` L ${variedPoint.x} ${variedPoint.y}`;
    } else {
      // Create slightly curved segments for more natural look
      const prevPoint = points[i - 1];
      const controlOffset = roughnessIntensity * 0.8;
      const midX = (prevPoint.x + variedPoint.x) / 2 + (Math.random() - 0.5) * controlOffset;
      const midY = (prevPoint.y + variedPoint.y) / 2 + (Math.random() - 0.5) * controlOffset;
      
      pathString += ` Q ${midX} ${midY} ${variedPoint.x} ${variedPoint.y}`;
    }
  }
  
  return pathString;
}

/**
 * Get pen style properties for hand-drawn curves (matches framework)
 */
export function getPenStyleProperties(penStyle: 'ballpoint' | 'pencil' | 'marker' | 'fountain') {
  switch (penStyle) {
    case 'pencil':
      return {
        stroke: '#374151',
        strokeWidth: '2.5',
        opacity: '0.8',
        filter: 'url(#pencilTexture)',
      };
    case 'marker':
      return {
        stroke: '#1e40af',
        strokeWidth: '3.5',
        opacity: '0.85',
        filter: 'url(#markerTexture)',
      };
    case 'fountain':
      return {
        stroke: '#1e3a8a',
        strokeWidth: '2',
        opacity: '0.9',
        filter: 'url(#fountainTexture)',
      };
    default: // ballpoint
      return {
        stroke: 'var(--sketch-primary, #374151)',
        strokeWidth: '2',
        opacity: '1',
        filter: 'url(#roughPaper)',
      };
  }
}

/**
 * Generate hand-drawn imperfections (small dots and marks)
 */
export function generateCurveImperfections(
  path: readonly Point2D[],
  intensity: number
): Point2D[] {
  if (path.length < 3) return [];
  
  const imperfections: Point2D[] = [];
  const numImperfections = Math.floor(path.length * intensity * 0.1);
  
  for (let i = 0; i < numImperfections; i++) {
    // Random point along the path
    const pathIndex = Math.floor(Math.random() * (path.length - 1));
    const basePoint = path[pathIndex];
    
    // Small offset from the path
    const offsetDistance = 2 + Math.random() * 3;
    const offsetAngle = Math.random() * Math.PI * 2;
    
    imperfections.push({
      x: basePoint.x + Math.cos(offsetAngle) * offsetDistance,
      y: basePoint.y + Math.sin(offsetAngle) * offsetDistance,
    });
  }
  
  return imperfections;
}
