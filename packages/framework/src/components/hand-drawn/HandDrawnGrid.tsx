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
 * @fileoverview HandDrawnGrid - SVG-based grid renderer with hand-drawn animations
 *
 * This component renders game grids using SVG paths with authentic hand-drawn effects,
 * including animated drawing, pen style variations, and natural imperfections.
 * Part of the Dual Style System for authentic graph paper game experiences.
 */

import React, { useState, useEffect } from 'react';
import { useHandDrawn } from '../dual-system/DualSystemProvider';
import { withHandDrawn } from '../dual-system/SystemBoundary';
import type { HandDrawnProps, PenStyle } from '@gpg/shared';

// ============================================================================
// Component Interface
// ============================================================================

interface HandDrawnGridProps extends HandDrawnProps {
  /** Number of columns in the grid */
  columns: number;

  /** Number of rows in the grid */
  rows: number;

  /** Grid cell size in pixels */
  cellSize?: number;

  /** Whether to show drawing animation */
  showAnimation?: boolean;

  /** Custom animation delays for each line */
  animationDelays?: number[];

  /** Show small imperfections (dots, variations) */
  showImperfections?: boolean;

  /** Grid line variations for hand-drawn effect */
  lineVariations?: GridLineVariation[];

  /** Optional winning line path for games like tic-tac-toe */
  winningLinePath?: string;

  /** Container dimensions */
  width?: number;
  height?: number;
}

interface GridLineVariation {
  path: string;
  strokeWidth?: number;
  dashArray?: number;
  delay?: number;
}

// ============================================================================
// SVG Filter Definitions
// ============================================================================

const SVGFilters: React.FC<{ penStyle: PenStyle }> = ({ penStyle: _ }) => (
  <defs>
    {/* Ballpoint pen - smooth with slight texture */}
    <filter id="roughPaper" x="0%" y="0%" width="100%" height="100%">
      <feTurbulence baseFrequency="0.04" numOctaves="5" result="noise" seed="1" />
      <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.8" />
    </filter>

    {/* Pencil - grainy texture */}
    <filter id="pencilTexture" x="0%" y="0%" width="100%" height="100%">
      <feTurbulence baseFrequency="0.3" numOctaves="4" result="grain" seed="2" />
      <feDisplacementMap in="SourceGraphic" in2="grain" scale="1.2" />
      <feGaussianBlur stdDeviation="0.3" />
    </filter>

    {/* Marker - bold with slight bleed */}
    <filter id="markerTexture" x="0%" y="0%" width="100%" height="100%">
      <feGaussianBlur stdDeviation="0.2" result="blur" />
      <feTurbulence baseFrequency="0.08" numOctaves="3" result="texture" seed="3" />
      <feDisplacementMap in="blur" in2="texture" scale="0.3" />
    </filter>

    {/* Fountain pen - smooth with ink flow variation */}
    <filter id="fountainTexture" x="0%" y="0%" width="100%" height="100%">
      <feTurbulence baseFrequency="0.15" numOctaves="3" result="flow" seed="4" />
      <feDisplacementMap in="SourceGraphic" in2="flow" scale="0.6" />
    </filter>
  </defs>
);

// ============================================================================
// Pen Style Configurations
// ============================================================================

const getPenStyleProps = (penStyle: PenStyle) => {
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
        stroke: 'var(--sketch-primary)',
        strokeWidth: '2',
        opacity: '1',
        filter: 'url(#roughPaper)',
      };
  }
};

// ============================================================================
// Grid Line Generation
// ============================================================================

const generateHandDrawnLines = (
  columns: number,
  rows: number,
  cellSize: number,
  penStyle: PenStyle
): GridLineVariation[] => {
  const lines: GridLineVariation[] = [];
  const width = columns * cellSize;
  const height = rows * cellSize;

  // Generate vertical lines
  for (let i = 1; i < columns; i++) {
    const x = i * cellSize;
    const variation = (i % 2) * 2 - 1; // Alternate left/right curve

    lines.push({
      path: `M ${x + variation * 1.5} 3 Q ${x + variation * 0.5} ${height * 0.3} ${x + variation * 0.8} ${height * 0.6} Q ${x + variation * 1.2} ${height * 0.8} ${x + variation * 0.5} ${height - 3}`,
      strokeWidth: penStyle === 'marker' ? 3.2 : penStyle === 'pencil' ? 2.7 : 2,
      dashArray: height - 6,
      delay: i * 0.2,
    });
  }

  // Generate horizontal lines
  for (let i = 1; i < rows; i++) {
    const y = i * cellSize;
    const variation = (i % 2) * 2 - 1; // Alternate up/down curve

    lines.push({
      path: `M 3 ${y + variation * 1.5} Q ${width * 0.3} ${y + variation * 0.5} ${width * 0.6} ${y + variation * 0.8} Q ${width * 0.8} ${y + variation * 1.2} ${width - 3} ${y + variation * 0.5}`,
      strokeWidth: penStyle === 'marker' ? 3.1 : penStyle === 'pencil' ? 2.6 : 2.1,
      dashArray: width - 6,
      delay: (columns - 1) * 0.2 + i * 0.2,
    });
  }

  return lines;
};

// ============================================================================
// Main Component
// ============================================================================

const HandDrawnGridComponent: React.FC<HandDrawnGridProps> = ({
  columns,
  rows,
  cellSize = 60,
  showAnimation = true,
  animationDelays,
  showImperfections = true,
  lineVariations: customLineVariations,
  winningLinePath,
  width: customWidth,
  height: customHeight,
  onPaper: _, // Required by HandDrawnProps - unused
  penStyle: propPenStyle,
  animate = true,
  onAnimationComplete,
  className = '',
}) => {
  const { penStyle: contextPenStyle, config } = useHandDrawn();
  const [isVisible, setIsVisible] = useState(!showAnimation);

  // Use prop pen style or fall back to context
  const actualPenStyle = propPenStyle || contextPenStyle;
  const actualAnimate = animate && config.showGridAnimation;

  // Calculate dimensions
  const width = customWidth || columns * cellSize;
  const height = customHeight || rows * cellSize;

  // Generate or use custom line variations
  const lineVariations =
    customLineVariations || generateHandDrawnLines(columns, rows, cellSize, actualPenStyle);

  // Get pen style properties
  const penStyleProps = getPenStyleProps(actualPenStyle);

  // Animation trigger
  useEffect(() => {
    if (actualAnimate && !isVisible) {
      const timer = setTimeout(() => {
        setIsVisible(true);
        if (onAnimationComplete) {
          // Call completion after all lines are drawn
          const maxDelay = Math.max(...lineVariations.map(line => line.delay || 0));
          setTimeout(onAnimationComplete, (maxDelay + 1.5) * 1000);
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [actualAnimate, isVisible, lineVariations, onAnimationComplete]);

  // Reset visibility when animate prop changes
  useEffect(() => {
    if (actualAnimate) {
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }
  }, [actualAnimate]);

  return (
    <svg
      width={width}
      height={height}
      className={`hand-drawn-grid ${className}`}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
      }}
      data-pen-style={actualPenStyle}
      data-grid-size={`${columns}x${rows}`}
    >
      <SVGFilters penStyle={actualPenStyle} />

      {/* Grid Lines */}
      <g className="grid-lines">
        {lineVariations.map((line, index) => (
          <path
            key={`line-${index}`}
            d={line.path}
            {...penStyleProps}
            fill="none"
            strokeLinecap="round"
            strokeWidth={line.strokeWidth || penStyleProps.strokeWidth}
            style={{
              strokeDasharray: line.dashArray || 0,
              strokeDashoffset: isVisible ? '0' : line.dashArray || 0,
              transition: actualAnimate
                ? `stroke-dashoffset 1.2s ease-out ${animationDelays?.[index] || line.delay || 0}s`
                : 'none',
            }}
          />
        ))}
      </g>

      {/* Grid Imperfections */}
      {showImperfections && config.showImperfections && (
        <g className="grid-imperfections">
          {/* Small dots and marks that appear after lines are drawn */}
          {lineVariations.slice(0, 2).map((_, index) => (
            <circle
              key={`imperfection-${index}`}
              cx={width * (0.3 + index * 0.4)}
              cy={height * (0.2 + index * 0.6)}
              r={actualPenStyle === 'marker' ? '1.2' : '0.8'}
              fill={penStyleProps.stroke}
              style={{
                opacity: isVisible ? penStyleProps.opacity : '0',
                transition: `opacity 0.3s ease-out ${1.5 + index * 0.2}s`,
                filter: penStyleProps.filter,
              }}
            />
          ))}
        </g>
      )}

      {/* Winning Line (for games like tic-tac-toe) */}
      {winningLinePath && (
        <path
          d={winningLinePath}
          stroke="var(--pencil-eraser)"
          strokeWidth="4.5"
          fill="none"
          filter="url(#roughPaper)"
          strokeLinecap="round"
          style={{
            strokeDasharray: '150',
            strokeDashoffset: '0',
            animation: 'drawWinningLine 0.8s ease-out',
          }}
        />
      )}
    </svg>
  );
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Generate a 3x3 tic-tac-toe grid configuration
 */
export const createTicTacToeGrid = (cellSize: number = 60): HandDrawnGridProps => ({
  columns: 3,
  rows: 3,
  cellSize,
  showAnimation: true,
  showImperfections: true,
  onPaper: true,
});

/**
 * Generate a standard chess/checkers 8x8 grid configuration
 */
export const createChessGrid = (cellSize: number = 40): HandDrawnGridProps => ({
  columns: 8,
  rows: 8,
  cellSize,
  showAnimation: true,
  showImperfections: false, // Too many imperfections on large grids
  onPaper: true,
});

/**
 * Generate a custom grid configuration
 */
export const createCustomGrid = (
  columns: number,
  rows: number,
  options?: Partial<HandDrawnGridProps>
): HandDrawnGridProps => ({
  columns,
  rows,
  cellSize: 50,
  showAnimation: true,
  showImperfections: columns * rows <= 16, // Only for smaller grids
  onPaper: true,
  ...options,
});

/**
 * Generate winning line path for tic-tac-toe
 */
export const generateWinningLinePath = (winningCells: number[], cellSize: number = 60): string => {
  if (winningCells.length < 2) return '';

  const startCell = winningCells[0];
  const endCell = winningCells[winningCells.length - 1];

  const startX = (startCell % 3) * cellSize + cellSize / 2;
  const startY = Math.floor(startCell / 3) * cellSize + cellSize / 2;
  const endX = (endCell % 3) * cellSize + cellSize / 2;
  const endY = Math.floor(endCell / 3) * cellSize + cellSize / 2;

  // Add slight curve for hand-drawn effect
  const midX = (startX + endX) / 2 + (Math.random() - 0.5) * 10;
  const midY = (startY + endY) / 2 + (Math.random() - 0.5) * 10;

  return `M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`;
};

// ============================================================================
// Styled Keyframes (for winning line animation)
// ============================================================================

const GridStyles = () => (
  <style>{`
    @keyframes drawWinningLine {
      from {
        stroke-dashoffset: 150;
      }
      to {
        stroke-dashoffset: 0;
      }
    }
  `}</style>
);

// ============================================================================
// Export
// ============================================================================

// Wrap with boundary enforcement
export const HandDrawnGrid = withHandDrawn(HandDrawnGridComponent, 'HandDrawnGrid');

// Export with styles
export const HandDrawnGridWithStyles: React.FC<HandDrawnGridProps> = props => (
  <>
    <GridStyles />
    <HandDrawnGrid {...props} />
  </>
);

export default HandDrawnGrid;