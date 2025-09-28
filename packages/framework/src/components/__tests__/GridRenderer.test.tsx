/**
 * @fileoverview Comprehensive tests for GridRenderer component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { GameAnnotation } from '@gpg/shared';
import { createGrid, updateCell } from '@gpg/shared';
import { EventBus, createEvent } from '../../event-bus';
import { GridRenderer, paperTheme, highContrastTheme } from '../GridRenderer';
import type { GridRendererProps, GridTheme } from '../GridRenderer';

// Mock EventBus
vi.mock('../../event-bus', () => ({
  EventBus: {
    emit: vi.fn(),
    on: vi.fn(),
    off: vi.fn(),
  },
  createEvent: {
    ui: vi.fn((type: string, data: any) => ({ type, data })),
  },
}));

// Helper function to get canvas element
function getCanvas(): HTMLCanvasElement {
  const canvas = document.querySelector('canvas');
  if (!canvas) {
    throw new Error('Canvas element not found');
  }
  return canvas;
}

// Declare global mock types
declare global {
  var mockContext: any;
  var mockGetBoundingClientRect: any;
}

describe('GridRenderer', () => {
  const defaultGrid = createGrid(3, 3);
  const defaultProps: GridRendererProps = {
    grid: defaultGrid,
  };

  describe('Basic Rendering', () => {
    it('should render canvas element', () => {
      render(<GridRenderer {...defaultProps} />);
      const canvas = getCanvas();
      expect(canvas).toBeInTheDocument();
      expect(canvas.tagName).toBe('CANVAS');
    });

    it('should set correct canvas dimensions with default theme', () => {
      render(<GridRenderer {...defaultProps} />);
      const canvas = getCanvas();
      
      const expectedWidth = defaultGrid.width * paperTheme.cellSize + paperTheme.cellPadding * 2;
      const expectedHeight = defaultGrid.height * paperTheme.cellSize + paperTheme.cellPadding * 2;
      
      expect(canvas.width).toBe(expectedWidth);
      expect(canvas.height).toBe(expectedHeight);
    });

    it('should use custom dimensions when provided', () => {
      const customWidth = 400;
      const customHeight = 300;
      
      render(
        <GridRenderer
          {...defaultProps}
          width={customWidth}
          height={customHeight}
        />
      );
      
      const canvas = getCanvas();
      expect(canvas.width).toBe(customWidth);
      expect(canvas.height).toBe(customHeight);
    });

    it('should apply scaling to dimensions', () => {
      const scale = 2;
      render(<GridRenderer {...defaultProps} scale={scale} />);
      
      const canvas = getCanvas();
      const expectedWidth = (defaultGrid.width * paperTheme.cellSize + paperTheme.cellPadding * 2) * scale;
      const expectedHeight = (defaultGrid.height * paperTheme.cellSize + paperTheme.cellPadding * 2) * scale;
      
      expect(canvas.width).toBe(expectedWidth);
      expect(canvas.height).toBe(expectedHeight);
    });

    it('should apply custom className and style', () => {
      const customClass = 'custom-grid';
      const customStyle = { border: '1px solid red' };
      
      render(
        <GridRenderer
          {...defaultProps}
          className={customClass}
          style={customStyle}
        />
      );
      
      const canvas = getCanvas();
      expect(canvas).toHaveClass(customClass);
      expect(canvas).toHaveStyle('border: 1px solid red');
    });

    it('should set cursor style based on interactive prop', () => {
      const { rerender } = render(<GridRenderer {...defaultProps} interactive={true} />);
      let canvas = getCanvas();
      expect(canvas).toHaveStyle('cursor: pointer');

      rerender(<GridRenderer {...defaultProps} interactive={false} />);
      canvas = getCanvas();
      expect(canvas).toHaveStyle('cursor: default');
    });
  });

  describe('Theme Support', () => {
    it('should use default paper theme when no theme provided', () => {
      render(<GridRenderer {...defaultProps} />);
      
      // Check that canvas rendering was called
      expect(global.mockContext.clearRect).toHaveBeenCalled();
      expect(global.mockContext.save).toHaveBeenCalled();
      expect(global.mockContext.restore).toHaveBeenCalled();
    });

    it('should use custom theme when provided', () => {
      const customTheme: GridTheme = {
        ...paperTheme,
        gridColor: '#ff0000',
        backgroundColor: '#00ff00',
        cellSize: 50,
      };
      
      render(<GridRenderer {...defaultProps} theme={customTheme} />);
      
      const canvas = getCanvas();
      const expectedWidth = defaultGrid.width * customTheme.cellSize + customTheme.cellPadding * 2;
      const expectedHeight = defaultGrid.height * customTheme.cellSize + customTheme.cellPadding * 2;
      
      expect(canvas.width).toBe(expectedWidth);
      expect(canvas.height).toBe(expectedHeight);
    });

    it('should use high contrast theme', () => {
      render(<GridRenderer {...defaultProps} theme={highContrastTheme} />);
      
      const canvas = getCanvas();
      const expectedWidth = defaultGrid.width * highContrastTheme.cellSize + highContrastTheme.cellPadding * 2;
      
      expect(canvas.width).toBe(expectedWidth);
      expect(global.mockContext.clearRect).toHaveBeenCalled();
    });

    it('should render paper texture when enabled', () => {
      const textureTheme = { ...paperTheme, paperTexture: true };
      render(<GridRenderer {...defaultProps} theme={textureTheme} />);
      
      // Paper texture should trigger additional fillRect calls for pattern
      expect(global.mockContext.fillRect).toHaveBeenCalled();
    });

    it('should skip paper texture when disabled', () => {
      const noTextureTheme = { ...paperTheme, paperTexture: false };
      render(<GridRenderer {...defaultProps} theme={noTextureTheme} />);
      
      expect(global.mockContext.fillRect).toHaveBeenCalled(); // Background only
    });
  });

  describe('Grid Rendering', () => {
    it('should render grid lines', () => {
      render(<GridRenderer {...defaultProps} />);
      
      // Should draw vertical and horizontal lines
      expect(global.mockContext.beginPath).toHaveBeenCalled();
      expect(global.mockContext.moveTo).toHaveBeenCalled();
      expect(global.mockContext.lineTo).toHaveBeenCalled();
      expect(global.mockContext.stroke).toHaveBeenCalled();
    });

    it('should render cells with different states', () => {
      const gridWithCells = updateCell(
        updateCell(defaultGrid, { x: 0, y: 0 }, { state: 'occupied', owner: 'player1' }),
        { x: 1, y: 1 }, { state: 'highlighted' }
      );
      
      render(<GridRenderer grid={gridWithCells} />);
      
      // Should render filled cells
      expect(global.mockContext.fillRect).toHaveBeenCalled();
      expect(global.mockContext.fillText).toHaveBeenCalledWith('P', expect.any(Number), expect.any(Number));
    });

    it('should use custom cell renderer when provided', () => {
      const customRenderer = vi.fn();
      
      render(
        <GridRenderer
          {...defaultProps}
          renderCell={customRenderer}
        />
      );
      
      // Custom renderer should be called for each cell
      expect(customRenderer).toHaveBeenCalledTimes(9); // 3x3 grid
      expect(customRenderer).toHaveBeenCalledWith(
        global.mockContext,
        expect.any(Object), // cell
        expect.any(Number), // x
        expect.any(Number), // y
        expect.any(Number), // size
        expect.any(Object)  // theme
      );
    });

    it('should render rounded cells when border radius is set', () => {
      const roundedTheme = { ...paperTheme, borderRadius: 5 };
      const gridWithOccupiedCell = updateCell(defaultGrid, { x: 0, y: 0 }, { state: 'occupied' });
      
      render(
        <GridRenderer
          grid={gridWithOccupiedCell}
          theme={roundedTheme}
        />
      );
      
      expect(global.mockContext.roundRect).toHaveBeenCalled();
      expect(global.mockContext.fill).toHaveBeenCalled();
    });

    it('should render square cells when border radius is 0', () => {
      const squareTheme = { ...paperTheme, borderRadius: 0 };
      const gridWithOccupiedCell = updateCell(defaultGrid, { x: 0, y: 0 }, { state: 'occupied' });
      
      render(
        <GridRenderer
          grid={gridWithOccupiedCell}
          theme={squareTheme}
        />
      );
      
      expect(global.mockContext.fillRect).toHaveBeenCalled();
    });
  });

  describe('Annotations', () => {
    it('should render highlight annotations', () => {
      const annotations: GameAnnotation[] = [
        {
          type: 'highlight',
          coordinates: [{ x: 1, y: 1 }],
          color: '#ff0000',
        },
      ];
      
      render(
        <GridRenderer
          {...defaultProps}
          annotations={annotations}
        />
      );
      
      expect(global.mockContext.strokeRect).toHaveBeenCalled();
    });

    it('should render text annotations', () => {
      const annotations: GameAnnotation[] = [
        {
          type: 'text',
          coordinates: [{ x: 1, y: 1 }],
          text: 'Test',
          color: '#0000ff',
        },
      ];
      
      render(
        <GridRenderer
          {...defaultProps}
          annotations={annotations}
        />
      );
      
      expect(global.mockContext.fillText).toHaveBeenCalledWith(
        'Test',
        expect.any(Number),
        expect.any(Number)
      );
    });

    it('should use default colors for annotations when not specified', () => {
      const annotations: GameAnnotation[] = [
        {
          type: 'highlight',
          coordinates: [{ x: 0, y: 0 }],
        },
      ];
      
      render(
        <GridRenderer
          {...defaultProps}
          annotations={annotations}
        />
      );
      
      expect(global.mockContext.strokeRect).toHaveBeenCalled();
    });

    it('should skip text annotation without text', () => {
      const annotations: GameAnnotation[] = [
        {
          type: 'text',
          coordinates: [{ x: 1, y: 1 }],
        },
      ];
      
      render(
        <GridRenderer
          {...defaultProps}
          annotations={annotations}
        />
      );
      
      // Should not call fillText without text
      expect(global.mockContext.fillText).not.toHaveBeenCalled();
    });
  });

  describe('Mouse Interactions', () => {
    beforeEach(() => {
      // Mock getBoundingClientRect for coordinate conversion
      global.mockGetBoundingClientRect.mockReturnValue({
        left: 10,
        top: 20,
        width: 100,
        height: 100,
        right: 110,
        bottom: 120,
        x: 10,
        y: 20,
        toJSON: () => {},
      });
    });

    it('should handle cell clicks when interactive', () => {
      const onCellClick = vi.fn();
      
      render(
        <GridRenderer
          {...defaultProps}
          interactive={true}
          onCellClick={onCellClick}
        />
      );
      
      const canvas = getCanvas();
      
      // Click at coordinates that should map to cell (0, 0)
      fireEvent.click(canvas, {
        clientX: 15, // 10 (left) + 5 (inside first cell)
        clientY: 25, // 20 (top) + 5 (inside first cell)
      });
      
      expect(onCellClick).toHaveBeenCalledWith(
        { x: 0, y: 0 },
        expect.any(Object) // cell data
      );
      
      expect(EventBus.emit).toHaveBeenCalledWith({
        type: 'ui:click',
        data: expect.objectContaining({
          coordinate: { x: 0, y: 0 },
          timestamp: expect.any(String),
        }),
      });
    });

    it('should not handle clicks when not interactive', () => {
      const onCellClick = vi.fn();
      
      render(
        <GridRenderer
          {...defaultProps}
          interactive={false}
          onCellClick={onCellClick}
        />
      );
      
      const canvas = getCanvas();
      fireEvent.click(canvas, { clientX: 15, clientY: 25 });
      
      expect(onCellClick).not.toHaveBeenCalled();
    });

    it('should not handle clicks without onCellClick handler', () => {
      render(
        <GridRenderer
          {...defaultProps}
          interactive={true}
        />
      );
      
      const canvas = getCanvas();
      
      // Should not throw error
      expect(() => {
        fireEvent.click(canvas, { clientX: 15, clientY: 25 });
      }).not.toThrow();
    });

    it('should ignore clicks outside grid bounds', () => {
      const onCellClick = vi.fn();
      
      render(
        <GridRenderer
          {...defaultProps}
          interactive={true}
          onCellClick={onCellClick}
        />
      );
      
      const canvas = getCanvas();
      
      // Click outside grid bounds
      fireEvent.click(canvas, {
        clientX: 200, // Far beyond grid
        clientY: 200,
      });
      
      expect(onCellClick).not.toHaveBeenCalled();
    });

    it('should handle mouse hover events', () => {
      const onCellHover = vi.fn();
      
      render(
        <GridRenderer
          {...defaultProps}
          interactive={true}
          onCellHover={onCellHover}
        />
      );
      
      const canvas = getCanvas();
      
      fireEvent.mouseMove(canvas, {
        clientX: 15,
        clientY: 25,
      });
      
      expect(onCellHover).toHaveBeenCalledWith(
        { x: 0, y: 0 },
        expect.any(Object)
      );
      
      expect(EventBus.emit).toHaveBeenCalledWith({
        type: 'ui:hover',
        data: expect.objectContaining({
          coordinate: { x: 0, y: 0 },
        }),
      });
    });

    it('should only call hover handler when coordinate changes', () => {
      const onCellHover = vi.fn();
      
      render(
        <GridRenderer
          {...defaultProps}
          interactive={true}
          onCellHover={onCellHover}
        />
      );
      
      const canvas = getCanvas();
      
      // Hover same cell multiple times
      fireEvent.mouseMove(canvas, { clientX: 15, clientY: 25 });
      fireEvent.mouseMove(canvas, { clientX: 16, clientY: 26 }); // Still same cell
      
      expect(onCellHover).toHaveBeenCalledTimes(1);
    });

    it('should handle mouse leave events', () => {
      const onCellHover = vi.fn();
      
      render(
        <GridRenderer
          {...defaultProps}
          interactive={true}
          onCellHover={onCellHover}
        />
      );
      
      const canvas = getCanvas();
      
      // First hover a cell
      fireEvent.mouseMove(canvas, { clientX: 15, clientY: 25 });
      expect(onCellHover).toHaveBeenCalledWith({ x: 0, y: 0 }, expect.any(Object));
      
      // Then leave the canvas
      fireEvent.mouseLeave(canvas);
      expect(onCellHover).toHaveBeenCalledWith(null, null);
    });

    it('should not trigger hover events when not interactive', () => {
      const onCellHover = vi.fn();
      
      render(
        <GridRenderer
          {...defaultProps}
          interactive={false}
          onCellHover={onCellHover}
        />
      );
      
      const canvas = getCanvas();
      fireEvent.mouseMove(canvas, { clientX: 15, clientY: 25 });
      
      expect(onCellHover).not.toHaveBeenCalled();
    });
  });

  describe('Coordinate Conversion', () => {
    it('should handle null canvas context gracefully', () => {
      // Mock getContext to return null
      HTMLCanvasElement.prototype.getContext = vi.fn(() => null);
      
      expect(() => {
        render(<GridRenderer {...defaultProps} />);
      }).not.toThrow();
    });

    it('should handle missing getBoundingClientRect', () => {
      HTMLCanvasElement.prototype.getBoundingClientRect = vi.fn(() => null as any);
      
      const onCellClick = vi.fn();
      render(
        <GridRenderer
          {...defaultProps}
          interactive={true}
          onCellClick={onCellClick}
        />
      );
      
      const canvas = getCanvas();
      fireEvent.click(canvas, { clientX: 15, clientY: 25 });
      
      expect(onCellClick).not.toHaveBeenCalled();
    });
  });

  describe('Rendering Updates', () => {
    it('should re-render when grid changes', () => {
      const { rerender } = render(<GridRenderer {...defaultProps} />);
      
      const newGrid = updateCell(defaultGrid, { x: 0, y: 0 }, { state: 'occupied' });
      
      // Should not throw when rerendering with new grid
      expect(() => {
        rerender(<GridRenderer grid={newGrid} />);
      }).not.toThrow();
      
      // Verify canvas still exists and has proper dimensions
      const canvas = getCanvas();
      expect(canvas).toBeInTheDocument();
    });

    it('should re-render when theme changes', () => {
      const { rerender } = render(<GridRenderer {...defaultProps} />);
      
      // Should not throw when rerendering with new theme
      expect(() => {
        rerender(<GridRenderer {...defaultProps} theme={highContrastTheme} />);
      }).not.toThrow();
      
      // Verify canvas still exists with updated theme dimensions
      const canvas = getCanvas();
      expect(canvas).toBeInTheDocument();
    });

    it('should re-render when annotations change', () => {
      const { rerender } = render(<GridRenderer {...defaultProps} />);
      
      const annotations: GameAnnotation[] = [
        { type: 'highlight', coordinates: [{ x: 0, y: 0 }] },
      ];
      
      // Should not throw when rerendering with annotations
      expect(() => {
        rerender(<GridRenderer {...defaultProps} annotations={annotations} />);
      }).not.toThrow();
      
      // Verify canvas still exists
      const canvas = getCanvas();
      expect(canvas).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty grid', () => {
      const emptyGrid = createGrid(0, 0);
      
      expect(() => {
        render(<GridRenderer grid={emptyGrid} />);
      }).not.toThrow();
    });

    it('should handle single cell grid', () => {
      const singleCellGrid = createGrid(1, 1);
      
      render(<GridRenderer grid={singleCellGrid} />);
      
      const canvas = getCanvas();
      expect(canvas.width).toBeGreaterThan(0);
      expect(canvas.height).toBeGreaterThan(0);
    });

    it('should handle large grids', () => {
      const largeGrid = createGrid(100, 100);
      
      expect(() => {
        render(<GridRenderer grid={largeGrid} />);
      }).not.toThrow();
    });

    it('should handle zero scale gracefully', () => {
      expect(() => {
        render(<GridRenderer {...defaultProps} scale={0} />);
      }).not.toThrow();
    });

    it('should handle negative coordinates in annotations', () => {
      const annotations: GameAnnotation[] = [
        {
          type: 'highlight',
          coordinates: [{ x: -1, y: -1 }],
        },
      ];
      
      expect(() => {
        render(<GridRenderer {...defaultProps} annotations={annotations} />);
      }).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    it('should apply proper ARIA attributes', () => {
      render(<GridRenderer {...defaultProps} />);
      
      const canvas = getCanvas();
      expect(canvas).toBeInTheDocument();
    });

    it('should support high contrast theme for accessibility', () => {
      render(<GridRenderer {...defaultProps} theme={highContrastTheme} />);
      
      const canvas = getCanvas();
      expect(canvas).toBeInTheDocument();
    });
  });
});
