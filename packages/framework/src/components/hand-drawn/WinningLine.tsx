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
 * @fileoverview WinningLine component for hand-drawn game victory animations
 *
 * This component provides animated winning line visualizations with hand-drawn aesthetics,
 * supporting various pen styles and responsive grid systems. Designed for integration
 * with games like tic-tac-toe, connect-four, and similar grid-based games.
 */

import React from 'react';
import { withHandDrawn } from '../dual-system/SystemBoundary';
import type { PenStyle, HandDrawnProps } from '@gpg/shared';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface WinningLineData {
  start: { x: number; y: number };
  end: { x: number; y: number };
  type?: 'horizontal' | 'vertical' | 'diagonal';
  cells?: number[]; // Alternative: array of cell indices for games like tic-tac-toe
}

export interface WinningLineProps extends HandDrawnProps {
  /** Winning line configuration - can be coordinate-based or cell-index-based */
  winningLine: WinningLineData | number[] | null;

  /** Pen style for the line appearance */
  penStyle?: PenStyle;

  /** Size of each grid cell (for cell-index-based lines) */
  cellSize?: number;

  /** Number of columns in the grid (for cell-index-based lines) */
  gridColumns?: number;

  /** Animation duration in seconds */
  animationDuration?: number;

  /** Animation delay in seconds */
  animationDelay?: number;

  /** Custom line color override */
  color?: string;

  /** Line thickness override */
  strokeWidth?: number;

  /** Whether to show hand-drawn wobble effect */
  wobbleEffect?: boolean;

  /** Container dimensions (for coordinate normalization) */
  containerWidth?: number;
  containerHeight?: number;

  /** Custom CSS class for additional styling */
  className?: string;
}

// ============================================================================
// Pen Style Utilities
// ============================================================================

const getPenStyleProperties = (penStyle: PenStyle = 'ballpoint', color?: string) => {
  const baseColor = color || '#f59e0b'; // Default amber/yellow for victory

  switch (penStyle) {
    case 'pencil':
      return {
        stroke: baseColor,
        strokeWidth: '4',
        opacity: '0.9',
        filter: 'url(#pencilTexture)',
      };
    case 'marker':
      return {
        stroke: baseColor,
        strokeWidth: '5',
        opacity: '0.95',
        filter: 'url(#markerTexture)',
      };
    case 'fountain':
      return {
        stroke: baseColor,
        strokeWidth: '3',
        opacity: '0.95',
        filter: 'url(#fountainTexture)',
      };
    default: // ballpoint
      return {
        stroke: baseColor,
        strokeWidth: '3',
        opacity: '1',
        filter: 'url(#roughPaper)',
      };
  }
};

// ============================================================================
// Coordinate Calculation Utilities
// ============================================================================

const calculateLineCoordinates = (
  winningLine: WinningLineData | number[],
  cellSize: number = 60,
  gridColumns: number = 3,
  wobbleEffect: boolean = true
) => {
  let startX: number, startY: number, endX: number, endY: number;

  if (Array.isArray(winningLine)) {
    // Cell-index-based calculation (e.g., [0, 1, 2] for top row)
    const startCell = winningLine[0];
    const endCell = winningLine[winningLine.length - 1];

    startX = (startCell % gridColumns) * cellSize + cellSize / 2;
    startY = Math.floor(startCell / gridColumns) * cellSize + cellSize / 2;
    endX = (endCell % gridColumns) * cellSize + cellSize / 2;
    endY = Math.floor(endCell / gridColumns) * cellSize + cellSize / 2;
  } else {
    // Coordinate-based calculation
    const offset = cellSize / 2; // Center of cell
    startX = winningLine.start.x * cellSize + offset;
    startY = winningLine.start.y * cellSize + offset;
    endX = winningLine.end.x * cellSize + offset;
    endY = winningLine.end.y * cellSize + offset;
  }

  // Add hand-drawn wobble effect
  if (wobbleEffect) {
    const wobbleX = (Math.random() - 0.5) * 4;
    const wobbleY = (Math.random() - 0.5) * 4;

    return {
      x1: startX + wobbleX,
      y1: startY + wobbleY,
      x2: endX - wobbleX,
      y2: endY - wobbleY,
    };
  }

  return { x1: startX, y1: startY, x2: endX, y2: endY };
};

// ============================================================================
// Main Component
// ============================================================================

const WinningLineComponent: React.FC<WinningLineProps> = ({
  winningLine,
  penStyle = 'ballpoint',
  cellSize = 60,
  gridColumns = 3,
  animationDuration = 0.8,
  animationDelay = 0.3,
  color,
  strokeWidth,
  wobbleEffect = true,
  containerWidth,
  containerHeight,
  className = '',
  ...props
}) => {
  if (!winningLine) return null;

  const coordinates = calculateLineCoordinates(winningLine, cellSize, gridColumns, wobbleEffect);
  const pathLength = Math.sqrt(
    Math.pow(coordinates.x2 - coordinates.x1, 2) + Math.pow(coordinates.y2 - coordinates.y1, 2)
  );

  const penProps = getPenStyleProperties(penStyle, color);
  const finalStrokeWidth = strokeWidth || penProps.strokeWidth;

  // Create SVG viewBox based on container dimensions or grid size
  const viewBoxWidth = containerWidth || gridColumns * cellSize;
  const viewBoxHeight = containerHeight || gridColumns * cellSize;

  return (
    <svg
      className={`winning-line ${className}`}
      viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 10,
      }}
      {...props}
    >
      <defs>
        {/* Hand-drawn texture filters */}
        <filter id="roughPaper" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence baseFrequency="0.04" numOctaves="5" result="noise" seed="1" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.8" />
        </filter>
        <filter id="pencilTexture" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence baseFrequency="0.3" numOctaves="4" result="grain" seed="2" />
          <feDisplacementMap in="SourceGraphic" in2="grain" scale="1.2" />
          <feGaussianBlur stdDeviation="0.3" />
        </filter>
        <filter id="markerTexture" x="0%" y="0%" width="100%" height="100%">
          <feGaussianBlur stdDeviation="0.2" result="blur" />
          <feTurbulence baseFrequency="0.08" numOctaves="3" result="texture" seed="3" />
          <feDisplacementMap in="blur" in2="texture" scale="0.3" />
        </filter>
        <filter id="fountainTexture" x="0%" y="0%" width="100%" height="100%">
          <feTurbulence baseFrequency="0.15" numOctaves="3" result="flow" seed="4" />
          <feDisplacementMap in="SourceGraphic" in2="flow" scale="0.6" />
        </filter>
      </defs>

      <line
        x1={coordinates.x1}
        y1={coordinates.y1}
        x2={coordinates.x2}
        y2={coordinates.y2}
        stroke={penProps.stroke}
        strokeWidth={finalStrokeWidth}
        opacity={penProps.opacity}
        filter={penProps.filter}
        strokeLinecap="round"
        strokeDasharray={pathLength}
        strokeDashoffset={pathLength}
        style={{
          animation: `drawWinningLine ${animationDuration}s ease-out ${animationDelay}s forwards`,
        }}
      />

      {/* CSS Keyframes for animation */}
      <style>
        {`
          @keyframes drawWinningLine {
            from {
              stroke-dashoffset: ${pathLength};
            }
            to {
              stroke-dashoffset: 0;
            }
          }
        `}
      </style>
    </svg>
  );
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Determine line type from winning cells
 */
const determineLineType = (cells: number[]): 'horizontal' | 'vertical' | 'diagonal' => {
  if (cells.length < 2) return 'horizontal';

  const rowStart = Math.floor(cells[0] / 3);
  const rowEnd = Math.floor(cells[cells.length - 1] / 3);
  const colStart = cells[0] % 3;
  const colEnd = cells[cells.length - 1] % 3;

  if (rowStart === rowEnd) return 'horizontal';
  if (colStart === colEnd) return 'vertical';
  return 'diagonal';
};

/**
 * Generate winning line path for tic-tac-toe games
 */
const generateTicTacToeWinningLine = (
  winningCells: number[],
  _cellSize: number = 60
): WinningLineData => {
  if (winningCells.length < 2) {
    throw new Error('WinningLine requires at least 2 cells');
  }

  const startCell = winningCells[0];
  const endCell = winningCells[winningCells.length - 1];

  return {
    start: {
      x: startCell % 3,
      y: Math.floor(startCell / 3),
    },
    end: {
      x: endCell % 3,
      y: Math.floor(endCell / 3),
    },
    type: determineLineType(winningCells),
    cells: winningCells,
  };
};

/**
 * Create custom winning line from coordinates
 */
const createWinningLine = (
  startX: number,
  startY: number,
  endX: number,
  endY: number
): WinningLineData => ({
  start: { x: startX, y: startY },
  end: { x: endX, y: endY },
  type: startY === endY ? 'horizontal' : startX === endX ? 'vertical' : 'diagonal',
});

// ============================================================================
// Exports
// ============================================================================

// Export with boundary enforcement
export const WinningLine = withHandDrawn(WinningLineComponent, 'WinningLine');

// Export with default styling for convenience
export const TicTacToeWinningLine: React.FC<
  Omit<WinningLineProps, 'gridColumns' | 'cellSize'>
> = props => (
  <WinningLine gridColumns={3} cellSize={60} penStyle="marker" color="#f59e0b" {...props} />
);

// Export utility functions
export { generateTicTacToeWinningLine, createWinningLine };