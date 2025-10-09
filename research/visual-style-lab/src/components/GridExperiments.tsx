import React, { useState } from 'react';

const GridExperiments: React.FC = () => {
  const [activeGrid, setActiveGrid] = useState<string>('standard');
  const [gridSize, setGridSize] = useState<number>(20);
  const [gridColor, setGridColor] = useState<string>('#dbeafe');

  const gridOptions = [
    { id: 'standard', name: 'Standard Graph Paper', class: 'graph-paper' },
    { id: 'small', name: 'Fine Grid', class: 'graph-paper graph-paper-small' },
    { id: 'large', name: 'Large Grid', class: 'graph-paper graph-paper-large' },
    { id: 'faint', name: 'Faint Grid', class: 'graph-paper graph-paper-faint' },
    { id: 'notebook', name: 'Notebook Lines', class: 'notebook-lines' },
  ];

  return (
    <div className="space-y-8">
      {/* Grid Controls */}
      <section className="sketch-border p-6">
        <h2 className="mb-4">Graph Paper Experiments</h2>

        <div className="space-y-4">
          <div>
            <h3 className="handwritten mb-3">Grid Type</h3>
            <div className="flex flex-wrap gap-2">
              {gridOptions.map(option => (
                <button
                  key={option.id}
                  onClick={() => setActiveGrid(option.id)}
                  className={`sketch-button ${
                    activeGrid === option.id ? 'bg-blue-500 text-white border-blue-500' : ''
                  }`}
                  style={
                    activeGrid === option.id
                      ? {
                          background: 'var(--sketch-primary)',
                          color: 'white',
                          borderColor: 'var(--sketch-primary)',
                        }
                      : {}
                  }
                >
                  {option.name}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="handwritten block mb-2">Grid Size: {gridSize}px</label>
              <input
                type="range"
                min="8"
                max="40"
                value={gridSize}
                onChange={e => setGridSize(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            <div>
              <label className="handwritten block mb-2">Grid Color: {gridColor}</label>
              <input
                type="color"
                value={gridColor}
                onChange={e => setGridColor(e.target.value)}
                className="w-full h-10 rounded border-2 border-gray-300"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Grid Preview */}
      <section className="sketch-border p-6">
        <h3 className="mb-4">Preview: {gridOptions.find(g => g.id === activeGrid)?.name}</h3>

        <div
          className={`${gridOptions.find(g => g.id === activeGrid)?.class} p-8 border-2 border-gray-300 rounded-lg min-h-96`}
          style={{
            backgroundSize: `${gridSize}px ${gridSize}px`,
            backgroundImage: `
              linear-gradient(${gridColor} 1px, transparent 1px),
              linear-gradient(90deg, ${gridColor} 1px, transparent 1px)
            `,
          }}
        >
          {/* Sample game elements */}
          <div className="space-y-8">
            <div className="sketch-border p-4 bg-white inline-block">
              <p className="handwritten mb-0">Sample game board area</p>
            </div>

            <div className="flex gap-4">
              <div className="hand-x text-4xl">×</div>
              <div className="hand-o text-4xl">O</div>
            </div>

            <div className="sketch-grid inline-block">
              <div className="grid grid-cols-3 gap-0">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="sketch-cell w-12 h-12 flex items-center justify-center">
                    {i === 0 && <div className="hand-x text-lg">×</div>}
                    {i === 4 && <div className="hand-o text-lg">O</div>}
                    {i === 8 && <div className="hand-x text-lg">×</div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Different Paper Types */}
      <section className="space-y-6">
        <h2 className="sketch-border p-4 bg-white">Paper Type Variations</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Engineering Paper */}
          <div className="sketch-border p-4">
            <h3 className="handwritten mb-3">Engineering Paper Style</h3>
            <div
              className="graph-paper h-32 p-4"
              style={{
                backgroundSize: '20px 20px',
                backgroundImage: `
                  linear-gradient(#2563eb 0.5px, transparent 0.5px),
                  linear-gradient(90deg, #2563eb 0.5px, transparent 0.5px),
                  linear-gradient(#2563eb 2px, transparent 2px),
                  linear-gradient(90deg, #2563eb 2px, transparent 2px)
                `,
                backgroundPosition: '0 0, 0 0, 0 0, 0 0',
              }}
            >
              <div className="hand-x text-2xl ink-color">×</div>
            </div>
          </div>

          {/* Dot Grid */}
          <div className="sketch-border p-4">
            <h3 className="handwritten mb-3">Dot Grid Style</h3>
            <div
              className="h-32 p-4 bg-white"
              style={{
                backgroundSize: '20px 20px',
                backgroundImage: `radial-gradient(circle at center, #64748b 1px, transparent 1px)`,
              }}
            >
              <div className="hand-o text-2xl text-blue-500">O</div>
            </div>
          </div>

          {/* Isometric Grid */}
          <div className="sketch-border p-4">
            <h3 className="handwritten mb-3">Isometric Grid</h3>
            <div
              className="h-32 p-4 bg-white"
              style={{
                backgroundSize: '40px 40px',
                backgroundImage: `
                  linear-gradient(60deg, #e5e7eb 1px, transparent 1px),
                  linear-gradient(-60deg, #e5e7eb 1px, transparent 1px),
                  linear-gradient(0deg, #e5e7eb 1px, transparent 1px)
                `,
              }}
            >
              <div className="text-2xl pencil-color">◊</div>
            </div>
          </div>

          {/* Hexagonal Grid */}
          <div className="sketch-border p-4">
            <h3 className="handwritten mb-3">Hexagonal Pattern</h3>
            <div
              className="h-32 p-4 bg-white"
              style={{
                backgroundSize: '60px 52px',
                backgroundImage: `
                  repeating-linear-gradient(0deg, transparent, transparent 25px, #e5e7eb 25px, #e5e7eb 26px),
                  repeating-linear-gradient(60deg, transparent, transparent 25px, #e5e7eb 25px, #e5e7eb 26px),
                  repeating-linear-gradient(-60deg, transparent, transparent 25px, #e5e7eb 25px, #e5e7eb 26px)
                `,
              }}
            >
              <div className="text-2xl eraser-color">⬢</div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Grid */}
      <section className="sketch-border p-6">
        <h2 className="mb-4">Interactive Grid Test</h2>
        <p className="handwritten mb-4">
          Click cells to test interaction with different grid styles
        </p>

        <InteractiveGrid gridStyle={activeGrid} gridSize={gridSize} />
      </section>

      {/* Usage Notes */}
      <section className="notebook-lines notebook-margin p-6">
        <h2 className="mb-4">Grid Design Notes</h2>

        <div className="space-y-4 handwritten">
          <p>
            ✓ Standard 20px grid works well for most game boards. Aligns nicely with typical UI
            element sizes.
          </p>
          <p>
            ✓ Faint grids (lower opacity) work better as backgrounds, while standard grids are good
            for active game areas.
          </p>
          <p>
            ✓ Engineering paper style with major/minor grid lines could be useful for more complex
            games.
          </p>
          <p>
            ✓ Dot grids are less distracting but still provide alignment guidance for game pieces.
          </p>
          <p>
            💡 Consider animated grid lines that "draw themselves" when game boards first appear.
          </p>
          <p>
            ⚠ Need to ensure grid doesn't interfere with text readability or accessibility for
            users with visual impairments.
          </p>
        </div>
      </section>
    </div>
  );
};

// Interactive grid component
const InteractiveGrid: React.FC<{
  gridStyle: string;
  gridSize: number;
}> = ({ gridStyle, gridSize }) => {
  const [cells, setCells] = useState<Array<'X' | 'O' | null>>(new Array(25).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<'X' | 'O'>('X');

  const handleCellClick = (index: number) => {
    if (cells[index]) return;

    const newCells = [...cells];
    newCells[index] = currentPlayer;
    setCells(newCells);
    setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
  };

  const resetGrid = () => {
    setCells(new Array(25).fill(null));
    setCurrentPlayer('X');
  };

  const gridClass =
    gridStyle === 'standard'
      ? 'graph-paper'
      : gridStyle === 'small'
        ? 'graph-paper graph-paper-small'
        : gridStyle === 'large'
          ? 'graph-paper graph-paper-large'
          : gridStyle === 'faint'
            ? 'graph-paper graph-paper-faint'
            : 'notebook-lines';

  return (
    <div>
      <div className="flex items-center gap-4 mb-4">
        <p className="handwritten">
          Current Player:{' '}
          {currentPlayer === 'X' ? (
            <span className="hand-x text-xl">×</span>
          ) : (
            <span className="hand-o text-xl">O</span>
          )}
        </p>
        <button onClick={resetGrid} className="sketch-button">
          Reset Grid
        </button>
      </div>

      <div
        className={`${gridClass} p-4 border-2 border-gray-300 rounded-lg inline-block`}
        style={{
          backgroundSize: `${gridSize}px ${gridSize}px`,
        }}
      >
        <div className="grid grid-cols-5 gap-1">
          {cells.map((cell, index) => (
            <button
              key={index}
              onClick={() => handleCellClick(index)}
              className="w-12 h-12 border border-gray-300 bg-white bg-opacity-80 hover:bg-opacity-100 
                         flex items-center justify-center transition-all duration-200
                         hover:scale-105 hover:shadow-md"
              style={{
                borderRadius: '4px',
                transform: `rotate(${Math.random() * 2 - 1}deg)`,
              }}
            >
              {cell === 'X' && <span className="hand-x text-lg">×</span>}
              {cell === 'O' && <span className="hand-o text-lg">O</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GridExperiments;
