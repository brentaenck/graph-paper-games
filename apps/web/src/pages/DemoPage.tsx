import { useState, useCallback, useMemo } from 'react';
import { GridRenderer, paperTheme, highContrastTheme } from '@gpg/framework';
import type { GridTheme } from '@gpg/shared';
import type { Grid, GridCell, GridCoordinate, GameAnnotation } from '@gpg/shared';

// Create a demo grid
const createDemoGrid = (width: number, height: number): Grid => {
  const cells: GridCell[][] = [];

  for (let y = 0; y < height; y++) {
    const row: GridCell[] = [];
    for (let x = 0; x < width; x++) {
      row.push({
        coordinate: { x, y },
        state: 'empty',
        owner: undefined,
        metadata: {},
      });
    }
    cells.push(row);
  }

  return {
    width,
    height,
    cells,
    type: 'square',
  };
};

const DemoPage = () => {
  const [gridSize, setGridSize] = useState({ width: 8, height: 6 });
  const [selectedTheme, setSelectedTheme] = useState<'paper' | 'contrast'>('paper');
  const [clickedCells, setClickedCells] = useState<Set<string>>(new Set());
  const [hoveredCell, setHoveredCell] = useState<GridCoordinate | null>(null);

  // Create demo grid based on size
  const demoGrid = useMemo(() => {
    const grid = createDemoGrid(gridSize.width, gridSize.height);

    // Update cells based on clicked state
    const newCells = grid.cells.map((row: readonly GridCell[]) =>
      row.map((cell: GridCell) => {
        const cellKey = `${cell.coordinate.x}-${cell.coordinate.y}`;
        if (clickedCells.has(cellKey)) {
          return {
            ...cell,
            state: 'occupied' as const,
            owner: 'demo-player',
          };
        }
        return cell;
      })
    );

    return { ...grid, cells: newCells };
  }, [gridSize, clickedCells]);

  // Handle cell clicks
  const handleCellClick = useCallback((coordinate: GridCoordinate, _cell: GridCell) => {
    const cellKey = `${coordinate.x}-${coordinate.y}`;

    setClickedCells(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cellKey)) {
        newSet.delete(cellKey);
      } else {
        newSet.add(cellKey);
      }
      return newSet;
    });
  }, []);

  // Handle cell hover
  const handleCellHover = useCallback((coordinate: GridCoordinate | null) => {
    setHoveredCell(coordinate);
  }, []);

  // Get current theme
  const currentTheme: GridTheme = selectedTheme === 'paper' ? paperTheme : highContrastTheme;

  // Create annotations for hovered cell
  const annotations: GameAnnotation[] = useMemo(() => {
    if (!hoveredCell) return [];

    return [
      {
        type: 'highlight',
        coordinates: [hoveredCell],
        color: '#10b981',
      },
    ];
  }, [hoveredCell]);

  // Clear all clicked cells
  const clearGrid = () => {
    setClickedCells(new Set());
  };

  return (
    <div className="container p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="mb-4">Framework Demo</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Try out our GridRenderer component with different themes and grid sizes. Click on cells
            to toggle them, hover to see highlighting.
          </p>
        </div>

        {/* Controls */}
        <div className="card p-6 mb-6">
          <h3 className="mb-4">Demo Controls</h3>

          <div className="game-controls mb-4">
            {/* Grid Size Controls */}
            <div className="flex items-center gap-4">
              <label className="font-medium">Grid Size:</label>
              <div className="flex items-center gap-2">
                <label className="text-sm">Width:</label>
                <input
                  type="range"
                  min="3"
                  max="12"
                  value={gridSize.width}
                  onChange={e =>
                    setGridSize(prev => ({ ...prev, width: parseInt(e.target.value) }))
                  }
                  className="w-20"
                />
                <span className="text-sm w-8">{gridSize.width}</span>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm">Height:</label>
                <input
                  type="range"
                  min="3"
                  max="10"
                  value={gridSize.height}
                  onChange={e =>
                    setGridSize(prev => ({ ...prev, height: parseInt(e.target.value) }))
                  }
                  className="w-20"
                />
                <span className="text-sm w-8">{gridSize.height}</span>
              </div>
            </div>

            {/* Theme Selector */}
            <div className="theme-selector">
              <label className="font-medium">Theme:</label>
              <button
                className={`theme-option ${selectedTheme === 'paper' ? 'active' : ''}`}
                onClick={() => setSelectedTheme('paper')}
              >
                Paper
              </button>
              <button
                className={`theme-option ${selectedTheme === 'contrast' ? 'active' : ''}`}
                onClick={() => setSelectedTheme('contrast')}
              >
                High Contrast
              </button>
            </div>

            {/* Action Buttons */}
            <button className="btn btn-secondary" onClick={clearGrid}>
              Clear Grid
            </button>
          </div>

          {/* Info Display */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="font-medium">Grid:</span>
              <span>
                {gridSize.width} × {gridSize.height}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Clicked Cells:</span>
              <span>{clickedCells.size}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">Hovered:</span>
              <span>{hoveredCell ? `(${hoveredCell.x}, ${hoveredCell.y})` : 'None'}</span>
            </div>
          </div>
        </div>

        {/* Grid Demo */}
        <div className="card p-6">
          <h3 className="mb-4">Interactive Grid</h3>

          <div className="flex justify-center">
            <div className="game-board">
              <GridRenderer
                grid={demoGrid}
                theme={currentTheme}
                annotations={annotations}
                interactive={true}
                onCellClick={handleCellClick}
                onCellHover={handleCellHover}
                className="demo-grid"
              />
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600 text-center">
            <p>
              Click cells to toggle occupation • Hover to highlight • Try different themes and sizes
            </p>
          </div>
        </div>

        {/* Framework Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="card p-6">
            <h3 className="mb-4">GridRenderer Features</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>Canvas-based rendering for performance</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>Multiple theme support</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>Interactive cell clicking and hovering</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>Annotation system for highlights</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>Coordinate conversion utilities</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span>Accessibility features</span>
              </li>
            </ul>
          </div>

          <div className="card p-6">
            <h3 className="mb-4">Framework Components</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <span className="text-blue-600">📦</span>
                <span>
                  <strong>GridRenderer</strong> - Canvas-based grid display
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-600">📦</span>
                <span>
                  <strong>TurnManager</strong> - Turn-based game logic
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-600">📦</span>
                <span>
                  <strong>EventBus</strong> - Component communication
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-600">📦</span>
                <span>
                  <strong>GameHUD</strong> - UI overlays and controls
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-600">📦</span>
                <span>
                  <strong>Theme System</strong> - Customizable styling
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-blue-600">📦</span>
                <span>
                  <strong>TypeScript</strong> - Full type safety
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemoPage;
