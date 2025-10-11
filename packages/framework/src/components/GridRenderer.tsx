/**
 * @fileoverview GridRenderer component for rendering game grids
 *
 * Provides a flexible Canvas-based grid rendering system that supports
 * square, hexagonal, and triangular grids with customizable themes.
 */

import React, { useRef, useCallback, useEffect } from 'react';
import type { Grid, GridCoordinate, GridCell, GameAnnotation } from '@gpg/shared';
import { EventBus, createEvent } from '../event-bus';

/**
 * Theme configuration for grid rendering
 */
export interface GridTheme {
  // Grid appearance
  readonly gridColor: string;
  readonly gridWidth: number;
  readonly backgroundColor: string;

  // Cell appearance
  readonly cellSize: number;
  readonly cellPadding: number;

  // Cell states
  readonly emptyCellColor: string;
  readonly occupiedCellColor: string;
  readonly highlightedCellColor: string;
  readonly disabledCellColor: string;

  // Text and borders
  readonly textColor: string;
  readonly fontSize: number;
  readonly borderRadius: number;

  // Paper texture
  readonly paperTexture?: boolean;
  readonly paperColor?: string;
}



// Import the shared GridTheme type
import type { GridTheme as SharedGridTheme } from '@gpg/shared';

/**
 * Exported themes that match the shared GridTheme interface
 */
export const paperTheme: SharedGridTheme = {
  renderer: 'canvas',
  cellSize: 32,
  borderColor: '#d4d4d8',
  backgroundColor: '#fafafa',
  highlightColor: '#fbbf24',
};

export const highContrastTheme: SharedGridTheme = {
  renderer: 'canvas',
  cellSize: 32,
  borderColor: '#000000',
  backgroundColor: '#ffffff',
  highlightColor: '#ffff00',
};

/**
 * Props for GridRenderer component
 */
export interface GridRendererProps {
  /** The grid data to render */
  grid: Grid;

  /** Theme configuration */
  theme?: SharedGridTheme;

  /** Additional annotations to render */
  annotations?: readonly GameAnnotation[];

  /** Whether grid interactions are enabled */
  interactive?: boolean;

  /** Callback for cell clicks */
  onCellClick?: (coordinate: GridCoordinate, cell: GridCell) => void;

  /** Callback for cell hover */
  onCellHover?: (coordinate: GridCoordinate | null, cell: GridCell | null) => void;

  /** Custom cell renderer */
  renderCell?: (
    ctx: CanvasRenderingContext2D,
    cell: GridCell,
    x: number,
    y: number,
    size: number,
    theme: GridTheme
  ) => void;

  /** Canvas size and scaling */
  width?: number;
  height?: number;
  scale?: number;

  /** Additional CSS classes */
  className?: string;

  /** Additional styles */
  style?: React.CSSProperties;
}

/**
 * GridRenderer component
 */
export const GridRenderer: React.FC<GridRendererProps> = ({
  grid,
  theme = paperTheme,
  annotations = [],
  interactive = true,
  onCellClick,
  onCellHover,
  renderCell,
  width,
  height,
  scale = 1,
  className,
  style,
}) => {
  // Convert SharedGridTheme to internal GridTheme format
  const internalTheme: GridTheme = {
    gridColor: theme.borderColor,
    gridWidth: 1,
    backgroundColor: theme.backgroundColor,
    cellSize: theme.cellSize,
    cellPadding: 2,
    emptyCellColor: 'transparent',
    occupiedCellColor: '#3b82f6',
    highlightedCellColor: theme.highlightColor,
    disabledCellColor: '#9ca3af',
    textColor: '#374151',
    fontSize: 12,
    borderRadius: 2,
    paperTexture: true,
    paperColor: theme.backgroundColor,
  };
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hoveredCellRef = useRef<GridCoordinate | null>(null);

  // Calculate canvas dimensions
  const canvasWidth = width ?? (grid.width * internalTheme.cellSize + internalTheme.cellPadding * 2) * scale;
  const canvasHeight = height ?? (grid.height * internalTheme.cellSize + internalTheme.cellPadding * 2) * scale;

  /**
   * Convert canvas coordinates to grid coordinates
   */
  const canvasToGrid = useCallback(
    (canvasX: number, canvasY: number): GridCoordinate | null => {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return null;

      const x = (canvasX - rect.left) / scale - internalTheme.cellPadding;
      const y = (canvasY - rect.top) / scale - internalTheme.cellPadding;

      const gridX = Math.floor(x / internalTheme.cellSize);
      const gridY = Math.floor(y / internalTheme.cellSize);

      if (gridX >= 0 && gridX < grid.width && gridY >= 0 && gridY < grid.height) {
        return { x: gridX, y: gridY };
      }

      return null;
    },
    [grid.width, grid.height, internalTheme.cellSize, internalTheme.cellPadding, scale]
  );

  /**
   * Convert grid coordinates to canvas coordinates
   */
  const gridToCanvas = useCallback(
    (coordinate: GridCoordinate): { x: number; y: number } => {
      return {
        x: (coordinate.x * internalTheme.cellSize + internalTheme.cellPadding) * scale,
        y: (coordinate.y * internalTheme.cellSize + internalTheme.cellPadding) * scale,
      };
    },
    [internalTheme.cellSize, internalTheme.cellPadding, scale]
  );

  /**
   * Default cell renderer
   */
  const defaultRenderCell = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      cell: GridCell,
      x: number,
      y: number,
      size: number,
      cellTheme: GridTheme
    ) => {
      const colors = {
        empty: cellTheme.emptyCellColor,
        occupied: cellTheme.occupiedCellColor,
        highlighted: cellTheme.highlightedCellColor,
        disabled: cellTheme.disabledCellColor,
      };

      // Fill cell based on state
      const fillColor = colors[cell.state as keyof typeof colors];
      if (fillColor && fillColor !== 'transparent') {
        ctx.fillStyle = fillColor;

        if (cellTheme.borderRadius > 0) {
          // Rounded rectangle
          ctx.beginPath();
          ctx.roundRect(x, y, size, size, cellTheme.borderRadius);
          ctx.fill();
        } else {
          // Regular rectangle
          ctx.fillRect(x, y, size, size);
        }
      }

      // Draw cell owner indicator if present
      if (cell.owner) {
        ctx.fillStyle = cellTheme.textColor;
        ctx.font = `${cellTheme.fontSize}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(cell.owner.charAt(0).toUpperCase(), x + size / 2, y + size / 2);
      }
    },
    []
  );

  /**
   * Render the entire grid
   */
  const renderGrid = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Apply scaling
    ctx.save();
    ctx.scale(scale, scale);

    // Draw background
    if (internalTheme.backgroundColor) {
      ctx.fillStyle = internalTheme.backgroundColor;
      ctx.fillRect(0, 0, canvasWidth / scale, canvasHeight / scale);
    }

    // Draw paper texture if enabled
    if (internalTheme.paperTexture && internalTheme.paperColor) {
      ctx.fillStyle = internalTheme.paperColor;
      ctx.fillRect(0, 0, canvasWidth / scale, canvasHeight / scale);

      // Simple texture pattern
      ctx.globalAlpha = 0.1;
      ctx.fillStyle = internalTheme.gridColor;
      for (let x = 0; x < canvasWidth / scale; x += 8) {
        for (let y = 0; y < canvasHeight / scale; y += 8) {
          if ((x + y) % 16 === 0) {
            ctx.fillRect(x, y, 1, 1);
          }
        }
      }
      ctx.globalAlpha = 1;
    }

    // Draw grid lines
    ctx.strokeStyle = internalTheme.gridColor;
    ctx.lineWidth = internalTheme.gridWidth;

    // Vertical lines
    for (let x = 0; x <= grid.width; x++) {
      const canvasX = x * internalTheme.cellSize + internalTheme.cellPadding;
      ctx.beginPath();
      ctx.moveTo(canvasX, internalTheme.cellPadding);
      ctx.lineTo(canvasX, grid.height * internalTheme.cellSize + internalTheme.cellPadding);
      ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y <= grid.height; y++) {
      const canvasY = y * internalTheme.cellSize + internalTheme.cellPadding;
      ctx.beginPath();
      ctx.moveTo(internalTheme.cellPadding, canvasY);
      ctx.lineTo(grid.width * internalTheme.cellSize + internalTheme.cellPadding, canvasY);
      ctx.stroke();
    }

    // Draw cells
    const cellRenderer = renderCell ?? defaultRenderCell;
    grid.cells.forEach((row: readonly GridCell[], y: number) => {
      row.forEach((cell: GridCell, x: number) => {
        const canvasPos = gridToCanvas({ x, y });
        cellRenderer(ctx, cell, canvasPos.x / scale, canvasPos.y / scale, internalTheme.cellSize, internalTheme);
      });
    });

    // Draw annotations
    annotations.forEach(annotation => {
      switch (annotation.type) {
        case 'highlight':
          annotation.coordinates.forEach((coord: { x: number; y: number }) => {
            const pos = gridToCanvas(coord);
            ctx.strokeStyle = annotation.color ?? internalTheme.highlightedCellColor;
            ctx.lineWidth = 3;
            ctx.strokeRect(
              pos.x / scale - 1,
              pos.y / scale - 1,
              internalTheme.cellSize + 2,
              internalTheme.cellSize + 2
            );
          });
          break;

        case 'text':
          if (annotation.coordinates.length > 0 && annotation.text) {
            const pos = gridToCanvas(annotation.coordinates[0]);
            ctx.fillStyle = annotation.color ?? internalTheme.textColor;
            ctx.font = `${internalTheme.fontSize}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(
              annotation.text,
              pos.x / scale + internalTheme.cellSize / 2,
              pos.y / scale + internalTheme.cellSize / 2
            );
          }
          break;
      }
    });

    ctx.restore();
  }, [
    grid,
    internalTheme,
    annotations,
    canvasWidth,
    canvasHeight,
    scale,
    renderCell,
    defaultRenderCell,
    gridToCanvas,
  ]);

  /**
   * Handle mouse clicks
   */
  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      if (!interactive || !onCellClick) return;

      const coordinate = canvasToGrid(event.clientX, event.clientY);
      if (coordinate) {
        const cell = grid.cells[coordinate.y][coordinate.x];
        onCellClick(coordinate, cell);

        // Emit UI event
        EventBus.emit(
          createEvent.ui('ui:click', {
            coordinate,
            cell,
            timestamp: new Date().toISOString(),
          })
        );
      }
    },
    [interactive, onCellClick, canvasToGrid, grid.cells]
  );

  /**
   * Handle mouse hover
   */
  const handleMouseMove = useCallback(
    (event: React.MouseEvent<HTMLCanvasElement>) => {
      if (!interactive) return;

      const coordinate = canvasToGrid(event.clientX, event.clientY);
      const cell = coordinate ? grid.cells[coordinate.y][coordinate.x] : null;

      // Only call handler if coordinate changed
      if (
        coordinate?.x !== hoveredCellRef.current?.x ||
        coordinate?.y !== hoveredCellRef.current?.y
      ) {
        hoveredCellRef.current = coordinate;
        onCellHover?.(coordinate, cell);

        // Emit hover event
        EventBus.emit(
          createEvent.ui('ui:hover', {
            coordinate,
            cell,
            timestamp: new Date().toISOString(),
          })
        );
      }
    },
    [interactive, onCellHover, canvasToGrid, grid.cells]
  );

  /**
   * Handle mouse leave
   */
  const handleMouseLeave = useCallback(() => {
    if (hoveredCellRef.current !== null) {
      hoveredCellRef.current = null;
      onCellHover?.(null, null);
    }
  }, [onCellHover]);

  // Render grid when dependencies change
  useEffect(() => {
    renderGrid();
  }, [renderGrid]);

  return (
    <canvas
      ref={canvasRef}
      width={canvasWidth}
      height={canvasHeight}
      onClick={handleClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
      style={{
        cursor: interactive ? 'pointer' : 'default',
        imageRendering: 'pixelated',
        ...style,
      }}
    />
  );
};
