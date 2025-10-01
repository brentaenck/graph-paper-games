import React from 'react';

interface GraphPaperSheetProps {
  /** Width of the game area in grid units (20px each) */
  gameWidth: number;
  /** Height of the game area in grid units (20px each) */
  gameHeight: number;
  /** Size of each grid square in pixels (default: 20) */
  gridSize?: number;
  /** Padding around the game area in grid units (default: 6) */
  padding?: number;
  /** Rotation angle for the paper sheet (default: -0.3) */
  rotation?: number;
  /** Children components (the actual game) */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
}

/**
 * A reusable graph paper sheet component that ensures perfect grid alignment
 * for any board game components placed on it.
 * 
 * Key Features:
 * - Automatically calculates paper size based on game dimensions
 * - Perfectly aligns background grid with game elements
 * - Maintains authentic paper appearance with subtle rotation
 * - Handles grid math automatically
 */
const GraphPaperSheet: React.FC<GraphPaperSheetProps> = ({
  gameWidth,
  gameHeight,
  gridSize = 20,
  padding = 6,
  rotation = -0.3,
  children,
  className = ''
}) => {
  // Calculate dimensions
  const gameAreaWidth = gameWidth * gridSize;
  const gameAreaHeight = gameHeight * gridSize;
  const paperWidth = gameAreaWidth + (padding * 2 * gridSize);
  const paperHeight = gameAreaHeight + (padding * 2 * gridSize);
  const offsetX = padding * gridSize;
  const offsetY = padding * gridSize;

  return (
    <div className={`paper-sheet ${className}`}>
      <div 
        className="graph-paper shadow-lg" 
        style={{
          width: `${paperWidth}px`,
          height: `${paperHeight}px`,
          transform: `rotate(${rotation}deg)`,
          background: 'var(--paper-white)',
          backgroundImage: `
            linear-gradient(var(--grid-light-blue) 1px, transparent 1px),
            linear-gradient(90deg, var(--grid-light-blue) 1px, transparent 1px)
          `,
          backgroundSize: `${gridSize}px ${gridSize}px`,
          backgroundPosition: '0px 0px', // Always start grid at 0,0
          position: 'relative'
        }}
      >
        {/* Game content positioned to align with grid lines */}
        <div 
          style={{
            position: 'absolute',
            left: `${offsetX}px`,
            top: `${offsetY}px`,
            width: `${gameAreaWidth}px`,
            height: `${gameAreaHeight}px`
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

/**
 * Helper hook for creating grid-aligned game cells
 */
export const useGridCell = (gridSize: number = 20) => {
  return {
    /**
     * Creates style object for a game cell that spans multiple grid units
     */
    cellStyle: (gridUnits: number, options?: {
      rotation?: number;
      highlight?: boolean;
      border?: boolean;
    }) => {
      const size = gridSize * gridUnits;
      return {
        width: `${size}px`,
        height: `${size}px`,
        border: options?.border 
          ? `1px solid ${options.highlight ? 'var(--pencil-eraser)' : 'var(--sketch-primary)'}`
          : 'none',
        borderRadius: '2px',
        transform: options?.rotation ? `rotate(${options.rotation}deg)` : 'none',
        background: options?.highlight 
          ? 'var(--paper-aged)' 
          : 'rgba(255,255,255,0.05)',
        boxShadow: options?.highlight
          ? '1px 1px 0px var(--pencil-eraser)'
          : '0.5px 0.5px 0px var(--pencil-light)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      };
    },
    
    /**
     * Grid size for calculations
     */
    gridSize
  };
};

export default GraphPaperSheet;