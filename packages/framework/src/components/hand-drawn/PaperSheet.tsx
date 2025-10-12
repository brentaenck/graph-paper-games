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
 * @fileoverview PaperSheet - Authentic graph paper component for the dual design system
 *
 * This component provides the foundation for all hand-drawn game experiences.
 * It ensures perfect grid alignment, authentic paper appearance, and integrates
 * with the pen style system for consistent visual effects.
 */

import React, { useEffect, ReactNode } from 'react';
import { useDualSystem } from '../dual-system/DualSystemProvider';
import { withHandDrawn } from '../dual-system/SystemBoundary';
import type { HandDrawnProps, PaperType } from '@gpg/shared';

// ============================================================================
// Component Interface
// ============================================================================

interface PaperSheetProps extends HandDrawnProps {
  /** Width of the game area in grid units (20px each) */
  gameWidth: number;
  /** Height of the game area in grid units (20px each) */
  gameHeight: number;
  /** Size of each grid square in pixels (default: 20) */
  gridSize?: number;
  /** Padding around the game area in grid units (default: 6) */
  padding?: number;
  /** Rotation angle for the paper sheet (default: from theme) */
  rotation?: number;
  /** Paper type override (default: from context) */
  paperType?: PaperType;
  /** Children components (the actual game elements) */
  children: ReactNode;
}

// ============================================================================
// Grid Calculation Utilities
// ============================================================================

interface GridDimensions {
  gameAreaWidth: number;
  gameAreaHeight: number;
  paperWidth: number;
  paperHeight: number;
  offsetX: number;
  offsetY: number;
}

function calculateGridDimensions(
  gameWidth: number,
  gameHeight: number,
  gridSize: number,
  padding: number
): GridDimensions {
  const gameAreaWidth = gameWidth * gridSize;
  const gameAreaHeight = gameHeight * gridSize;
  const paperWidth = gameAreaWidth + padding * 2 * gridSize;
  const paperHeight = gameAreaHeight + padding * 2 * gridSize;
  const offsetX = padding * gridSize;
  const offsetY = padding * gridSize;

  return {
    gameAreaWidth,
    gameAreaHeight,
    paperWidth,
    paperHeight,
    offsetX,
    offsetY,
  };
}

// ============================================================================
// Paper Type Configurations
// ============================================================================

interface PaperConfig {
  backgroundImage: (gridSize: number, penStyle: string) => string;
  backgroundColor: string;
  gridColor: string;
}

const PAPER_CONFIGS: Record<PaperType, PaperConfig> = {
  graph: {
    backgroundImage: (_gridSize: number) => `
      linear-gradient(var(--grid-light-blue) 1px, transparent 1px),
      linear-gradient(90deg, var(--grid-light-blue) 1px, transparent 1px)
    `,
    backgroundColor: 'var(--paper-white)',
    gridColor: 'var(--grid-light-blue)',
  },

  engineering: {
    backgroundImage: (_gridSize: number) => `
      linear-gradient(var(--grid-green) 1px, transparent 1px),
      linear-gradient(90deg, var(--grid-green) 1px, transparent 1px),
      linear-gradient(var(--grid-green) 2px, transparent 2px),
      linear-gradient(90deg, var(--grid-green) 2px, transparent 2px)
    `,
    backgroundColor: 'var(--paper-engineering)',
    gridColor: 'var(--grid-green)',
  },

  notebook: {
    backgroundImage: (_gridSize: number) => `
      linear-gradient(180deg, var(--grid-blue) 1px, transparent 1px)
    `,
    backgroundColor: 'var(--paper-notebook)',
    gridColor: 'var(--grid-blue)',
  },

  dot: {
    backgroundImage: (_gridSize: number) => `
      radial-gradient(circle at center, var(--grid-dot) 1px, transparent 1px)
    `,
    backgroundColor: 'var(--paper-white)',
    gridColor: 'var(--grid-dot)',
  },
};

// ============================================================================
// Main Component
// ============================================================================

const PaperSheetComponent: React.FC<PaperSheetProps> = ({
  gameWidth,
  gameHeight,
  gridSize = 20,
  padding = 6,
  rotation,
  paperType: propPaperType,
  children,
  className = '',
  onPaper: _, // Required by HandDrawnProps - unused
  penStyle: _propPenStyle, // Currently unused - for future pen style integration
  animate: _animate, // Currently unused - for future animation integration
  onAnimationComplete: _onAnimationComplete, // Currently unused - for future animation integration
}) => {
  const { setIsPaperContext, theme } = useDualSystem();

  // Use prop values or fall back to theme values
  const actualPaperType = propPaperType || theme.handDrawn.paperType;
  const actualRotation = rotation !== undefined ? rotation : theme.handDrawn.paperRotation;
  const actualGridSize = theme.handDrawn.gridSize || gridSize;

  // Set paper context when component mounts
  useEffect(() => {
    setIsPaperContext(true);
    return () => setIsPaperContext(false);
  }, [setIsPaperContext]);

  // Calculate dimensions
  const dimensions = calculateGridDimensions(gameWidth, gameHeight, actualGridSize, padding);

  // Get paper configuration
  const paperConfig = PAPER_CONFIGS[actualPaperType];

  return (
    <div className={`paper-sheet-container ${className}`}>
      <div
        className={`paper-sheet paper-${actualPaperType}`}
        data-paper-type={actualPaperType}
        data-grid-size={actualGridSize}
      >
        <div
          className="graph-paper shadow-lg"
          style={{
            width: `${dimensions.paperWidth}px`,
            height: `${dimensions.paperHeight}px`,
            transform: `rotate(${actualRotation}deg)`,
            background: paperConfig.backgroundColor,
            backgroundImage: paperConfig.backgroundImage(actualGridSize, 'ballpoint'),
            backgroundSize: `${actualGridSize}px ${actualGridSize}px`,
            backgroundPosition: '0px 0px',
            position: 'relative',
            // Add paper texture and aging effects
            filter: theme.handDrawn.showImperfections
              ? `sepia(5%) saturate(95%) brightness(98%) contrast(102%)`
              : 'none',
          }}
        >
          {/* Game content positioned to align with grid lines */}
          <div
            className="paper-game-content"
            style={{
              position: 'absolute',
              left: `${dimensions.offsetX}px`,
              top: `${dimensions.offsetY}px`,
              width: `${dimensions.gameAreaWidth}px`,
              height: `${dimensions.gameAreaHeight}px`,
            }}
          >
            {children}
          </div>

          {/* Paper corner fold effect */}
          {theme.handDrawn.showImperfections && (
            <div
              className="paper-corner-fold"
              style={{
                position: 'absolute',
                top: '5px',
                right: '5px',
                width: '20px',
                height: '20px',
                background: 'linear-gradient(135deg, rgba(0,0,0,0.1) 0%, transparent 100%)',
                clipPath: 'polygon(0 0, 100% 0, 0 100%)',
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Grid Alignment Hook
// ============================================================================

/**
 * Hook for creating grid-aligned game cells within PaperSheet
 */
export const useGridCell = (gridSize?: number) => {
  const { theme } = useDualSystem();
  const actualGridSize = gridSize || theme.handDrawn.gridSize;

  return {
    /**
     * Creates style object for a game cell that spans multiple grid units
     */
    cellStyle: (
      gridUnits: number,
      options?: {
        rotation?: number;
        highlight?: boolean;
        border?: boolean;
      }
    ) => {
      const size = actualGridSize * gridUnits;
      return {
        width: `${size}px`,
        height: `${size}px`,
        border: options?.border
          ? `1px solid ${options.highlight ? 'var(--pencil-eraser)' : 'var(--sketch-primary)'}`
          : 'none',
        borderRadius: '2px',
        transform: options?.rotation ? `rotate(${options.rotation}deg)` : 'none',
        background: options?.highlight ? 'var(--paper-aged)' : 'rgba(255,255,255,0.05)',
        boxShadow: options?.highlight
          ? '1px 1px 0px var(--pencil-eraser)'
          : '0.5px 0.5px 0px var(--pencil-light)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      };
    },

    /**
     * Grid size for calculations
     */
    gridSize: actualGridSize,

    /**
     * Calculate absolute position for cell at grid coordinates
     */
    positionAt: (gridX: number, gridY: number) => ({
      position: 'absolute' as const,
      left: `${gridX * actualGridSize}px`,
      top: `${gridY * actualGridSize}px`,
    }),
  };
};

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Calculate grid alignment for any game size
 */
export const calculateGridAlignment = (
  gameWidth: number,
  gameHeight: number,
  gridSize: number = 20,
  padding: number = 6
) => calculateGridDimensions(gameWidth, gameHeight, gridSize, padding);

/**
 * Convert pixel coordinates to grid coordinates
 */
export const pixelToGrid = (pixelX: number, pixelY: number, gridSize: number = 20) => ({
  x: Math.floor(pixelX / gridSize),
  y: Math.floor(pixelY / gridSize),
});

/**
 * Convert grid coordinates to pixel coordinates
 */
export const gridToPixel = (gridX: number, gridY: number, gridSize: number = 20) => ({
  x: gridX * gridSize,
  y: gridY * gridSize,
});

// ============================================================================
// Export
// ============================================================================

// Wrap with boundary enforcement
export const PaperSheet = withHandDrawn(PaperSheetComponent, 'PaperSheet');

export default PaperSheet;