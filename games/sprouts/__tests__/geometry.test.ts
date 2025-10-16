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

import { describe, it, expect } from 'vitest';
import {
  distance,
  distanceSquared,
  dotProduct,
  crossProduct,
  subtract,
  add,
  scale,
  normalize,
  generateInitialPoints,
  findPointOnPath,
  lineSegmentsIntersect,
  curvesIntersect,
  generateCurvePath,
} from '../src/geometry';

describe('Geometry Utilities', () => {
  describe('Basic Vector Operations', () => {
    it('should calculate distance correctly', () => {
      expect(distance({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(5);
      expect(distance({ x: 1, y: 1 }, { x: 1, y: 1 })).toBe(0);
    });

    it('should calculate squared distance correctly', () => {
      expect(distanceSquared({ x: 0, y: 0 }, { x: 3, y: 4 })).toBe(25);
      expect(distanceSquared({ x: 1, y: 1 }, { x: 1, y: 1 })).toBe(0);
    });

    it('should calculate dot product correctly', () => {
      expect(dotProduct({ x: 1, y: 2 }, { x: 3, y: 4 })).toBe(11);
      expect(dotProduct({ x: 1, y: 0 }, { x: 0, y: 1 })).toBe(0);
    });

    it('should calculate cross product correctly', () => {
      expect(crossProduct({ x: 1, y: 0 }, { x: 0, y: 1 })).toBe(1);
      expect(crossProduct({ x: 1, y: 2 }, { x: 3, y: 4 })).toBe(-2);
    });

    it('should subtract vectors correctly', () => {
      const result = subtract({ x: 5, y: 7 }, { x: 2, y: 3 });
      expect(result).toEqual({ x: 3, y: 4 });
    });

    it('should add vectors correctly', () => {
      const result = add({ x: 1, y: 2 }, { x: 3, y: 4 });
      expect(result).toEqual({ x: 4, y: 6 });
    });

    it('should scale vectors correctly', () => {
      const result = scale({ x: 2, y: 3 }, 2);
      expect(result).toEqual({ x: 4, y: 6 });
    });

    it('should normalize vectors correctly', () => {
      const result = normalize({ x: 3, y: 4 });
      expect(result.x).toBeCloseTo(0.6);
      expect(result.y).toBeCloseTo(0.8);
    });

    it('should handle zero vector normalization', () => {
      const result = normalize({ x: 0, y: 0 });
      expect(result).toEqual({ x: 0, y: 0 });
    });
  });

  describe('Initial Point Generation', () => {
    it('should generate correct number of points', () => {
      for (let n = 2; n <= 6; n++) {
        const points = generateInitialPoints(n);
        expect(points).toHaveLength(n);
      }
    });

    it('should generate points within canvas bounds', () => {
      const points = generateInitialPoints(3, 400, 300);
      for (const point of points) {
        expect(point.x).toBeGreaterThanOrEqual(0);
        expect(point.x).toBeLessThanOrEqual(400);
        expect(point.y).toBeGreaterThanOrEqual(0);
        expect(point.y).toBeLessThanOrEqual(300);
      }
    });

    it('should handle single point case', () => {
      const points = generateInitialPoints(1, 400, 300);
      expect(points).toHaveLength(1);
      expect(points[0]).toEqual({ x: 200, y: 150 });
    });
  });

  describe('Path Operations', () => {
    it('should find point on path correctly', () => {
      const path = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 10, y: 10 },
      ];

      const start = findPointOnPath(path, 0);
      expect(start).toEqual({ x: 0, y: 0 });

      const end = findPointOnPath(path, 1);
      expect(end).toEqual({ x: 10, y: 10 });

      const middle = findPointOnPath(path, 0.5);
      expect(middle.x).toBeCloseTo(10);
      expect(middle.y).toBeCloseTo(0);
    });

    it('should handle single point path', () => {
      const path = [{ x: 5, y: 5 }];
      const result = findPointOnPath(path, 0.5);
      expect(result).toEqual({ x: 5, y: 5 });
    });

    it('should clamp t parameter to valid range', () => {
      const path = [{ x: 0, y: 0 }, { x: 10, y: 0 }];
      
      const beforeStart = findPointOnPath(path, -0.5);
      expect(beforeStart).toEqual({ x: 0, y: 0 });

      const afterEnd = findPointOnPath(path, 1.5);
      expect(afterEnd).toEqual({ x: 10, y: 0 });
    });
  });

  describe('Line Intersection', () => {
    it('should detect intersection of crossing lines', () => {
      const result = lineSegmentsIntersect(
        { x: 0, y: 0 },
        { x: 10, y: 10 },
        { x: 0, y: 10 },
        { x: 10, y: 0 }
      );

      expect(result.intersects).toBe(true);
      expect(result.point).toBeDefined();
      expect(result.point!.x).toBeCloseTo(5);
      expect(result.point!.y).toBeCloseTo(5);
    });

    it('should not detect intersection of parallel lines', () => {
      const result = lineSegmentsIntersect(
        { x: 0, y: 0 },
        { x: 10, y: 0 },
        { x: 0, y: 5 },
        { x: 10, y: 5 }
      );

      expect(result.intersects).toBe(false);
    });

    it('should not detect intersection of non-overlapping segments', () => {
      const result = lineSegmentsIntersect(
        { x: 0, y: 0 },
        { x: 5, y: 0 },
        { x: 10, y: 0 },
        { x: 15, y: 0 }
      );

      expect(result.intersects).toBe(false);
    });
  });

  describe('Curve Operations', () => {
    it('should generate curve path between two points', () => {
      const start = { x: 0, y: 0 };
      const end = { x: 100, y: 0 };
      
      const path = generateCurvePath(start, end);
      
      expect(path.length).toBeGreaterThan(0);
      expect(path[0]).toEqual(start);
      expect(path[path.length - 1]).toEqual(end);
    });

    it('should detect curve intersections', () => {
      const curve1 = [
        { x: 0, y: 0 },
        { x: 10, y: 10 },
      ];
      const curve2 = [
        { x: 0, y: 10 },
        { x: 10, y: 0 },
      ];

      const result = curvesIntersect(curve1, curve2);
      expect(result.hasIntersection).toBe(true);
      expect(result.intersectionPoints.length).toBeGreaterThan(0);
    });

    it('should not detect intersection of non-crossing curves', () => {
      const curve1 = [
        { x: 0, y: 0 },
        { x: 10, y: 0 },
      ];
      const curve2 = [
        { x: 0, y: 10 },
        { x: 10, y: 10 },
      ];

      const result = curvesIntersect(curve1, curve2);
      expect(result.hasIntersection).toBe(false);
    });
  });
});