import React, { useState } from 'react';

type CellValue = 'X' | 'O' | null;
type Player = 'X' | 'O';

const TicTacToeDemo: React.FC = () => {
  const [board, setBoard] = useState<CellValue[]>(new Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X');
  const [winner, setWinner] = useState<Player | 'draw' | null>(null);
  const [winningLine, setWinningLine] = useState<number[]>([]);
  const [gameHistory, setGameHistory] = useState<string[]>(['New game started']);
  const [gamesPlayed, setGamesPlayed] = useState(0);
  const [playerXWins, setPlayerXWins] = useState(0);
  const [playerOWins, setPlayerOWins] = useState(0);
  const [draws, setDraws] = useState(0);
  const [showGrid, setShowGrid] = useState(false);
  const [penStyle, setPenStyle] = useState<'ballpoint' | 'pencil' | 'marker' | 'fountain'>('ballpoint');
  const [animatingCells, setAnimatingCells] = useState<Set<number>>(new Set());
  const [drawnCells, setDrawnCells] = useState<Set<number>>(new Set());

  const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6] // diagonals
  ];

  const checkWinner = (boardState: CellValue[]): Player | 'draw' | null => {
    // Check for winner
    for (const combination of winningCombinations) {
      const [a, b, c] = combination;
      if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
        setWinningLine(combination);
        return boardState[a] as Player;
      }
    }

    // Check for draw
    if (boardState.every(cell => cell !== null)) {
      return 'draw';
    }

    return null;
  };

  const handleCellClick = (index: number) => {
    if (board[index] || winner) return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);

    // Trigger animation by adding to animatingCells AFTER board is updated
    setTimeout(() => {
      setAnimatingCells(prev => new Set([...prev, index]));
    }, 50); // Small delay to ensure board state is updated
    
    // After animation completes, move to drawn cells (keep visible)
    setTimeout(() => {
      setAnimatingCells(prev => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
      setDrawnCells(prev => new Set([...prev, index]));
    }, 1250); // Match animation duration + delay

    const moveDescription = `${currentPlayer} played position ${index + 1}`;
    setGameHistory(prev => [...prev, moveDescription]);

    const gameResult = checkWinner(newBoard);
    if (gameResult) {
      setWinner(gameResult);
      setGamesPlayed(prev => prev + 1);
      
      if (gameResult === 'X') {
        setPlayerXWins(prev => prev + 1);
        setGameHistory(prev => [...prev, `${gameResult} wins!`]);
      } else if (gameResult === 'O') {
        setPlayerOWins(prev => prev + 1);
        setGameHistory(prev => [...prev, `${gameResult} wins!`]);
      } else {
        setDraws(prev => prev + 1);
        setGameHistory(prev => [...prev, "It's a draw!"]);
      }
    } else {
      setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
    }
  };

  const resetGame = () => {
    setBoard(new Array(9).fill(null));
    setCurrentPlayer('X');
    setWinner(null);
    setWinningLine([]);
    setGameHistory(['New game started']);
    setAnimatingCells(new Set());
    setDrawnCells(new Set());
    // Trigger grid drawing animation
    setShowGrid(false);
    setTimeout(() => setShowGrid(true), 100);
  };

  // Get pen style properties
  const getPenStyle = () => {
    switch (penStyle) {
      case 'pencil':
        return {
          stroke: '#374151',
          strokeWidth: '2.5',
          opacity: '0.8',
          filter: 'url(#pencilTexture)'
        };
      case 'marker':
        return {
          stroke: '#1e40af',
          strokeWidth: '3.5',
          opacity: '0.85',
          filter: 'url(#markerTexture)'
        };
      case 'fountain':
        return {
          stroke: '#1e3a8a',
          strokeWidth: '2',
          opacity: '0.9',
          filter: 'url(#fountainTexture)'
        };
      default: // ballpoint
        return {
          stroke: 'var(--sketch-primary)',
          strokeWidth: '2',
          opacity: '1',
          filter: 'url(#roughPaper)'
        };
    }
  };

  // Initialize grid on component mount
  React.useEffect(() => {
    setShowGrid(true);
  }, []);

  const getCellVariation = (index: number) => {
    // Create slight variations in rotation for each cell to feel more hand-drawn
    const rotations = [-1.5, 0.8, -0.3, 1.2, -0.7, 0.5, -1.1, 0.9, -0.4];
    return rotations[index];
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="ui-card">
        <div className="ui-card-header">
          <h1 className="ui-card-title text-2xl">🎮 True Paper Tic-Tac-Toe Demo</h1>
        </div>
        <div className="ui-card-body">
          <div className="ui-alert ui-alert-info">
            <strong>True Paper Layout:</strong> The graph paper contains only the game board and pieces. 
            All UI elements (scores, turn indicators, controls) are in the modern interface surrounding the paper.
          </div>
        </div>
      </div>

      {/* Game Interface */}
      <div className="ui-card">
        {/* Header UI - Player info, scores, game status */}
        <div className="ui-card-header">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            {/* Player X */}
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-2xl
                ${currentPlayer === 'X' && !winner ? 'bg-red-100 border-2 border-red-400 text-red-700' : 'bg-gray-100 text-gray-500'}`}>
                ×
              </div>
              <div>
                <p className="ui-text font-medium">Player X</p>
                <p className="ui-text-sm ui-text-muted">Wins: {playerXWins}</p>
              </div>
            </div>
            
            {/* Game Status */}
            <div className="text-center">
              {winner ? (
                <div>
                  {winner === 'draw' ? (
                    <div>
                      <p className="ui-text font-bold text-yellow-600 mb-1">🤝 Draw!</p>
                      <p className="ui-text-sm ui-text-muted">Perfectly balanced</p>
                    </div>
                  ) : (
                    <div>
                      <p className="ui-text font-bold text-green-600 mb-1">🎉 Player {winner} Wins!</p>
                      <p className="ui-text-sm ui-text-muted">Congratulations!</p>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <p className="ui-text font-medium">Player {currentPlayer}'s Turn</p>
                  <p className="ui-text-sm ui-text-muted">Make your move</p>
                </div>
              )}
            </div>
            
            {/* Player O */}
            <div className="flex items-center gap-3 md:justify-end">
              <div className="order-2 md:order-1">
                <p className="ui-text font-medium">Player O</p>
                <p className="ui-text-sm ui-text-muted">Wins: {playerOWins}</p>
              </div>
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center font-bold text-2xl order-1 md:order-2
                ${currentPlayer === 'O' && !winner ? 'bg-blue-100 border-2 border-blue-400 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                O
              </div>
            </div>
          </div>
        </div>

        {/* Pure Paper Game Area - ONLY contains the game */}
        <div className="flex justify-center p-8 bg-gray-100">
          <div className="paper-sheet">
            <div 
              className="graph-paper shadow-lg" 
              style={{
                width: '480px',
                height: '480px',
                transform: 'rotate(-0.3deg)',
                background: 'var(--paper-white)',
                backgroundImage: `
                  linear-gradient(var(--grid-light-blue) 1px, transparent 1px),
                  linear-gradient(90deg, var(--grid-light-blue) 1px, transparent 1px)
                `,
                backgroundSize: '20px 20px',
                // Start grid at 0,0 - no offset needed
                backgroundPosition: '0px 0px',
                position: 'relative'
              }}
            >
              {/* Hand-drawn tic-tac-toe grid */}
              <div 
                style={{
                  position: 'absolute',
                  // Position game area to start at grid line intersections
                  left: '140px',
                  top: '140px',
                  width: '180px',
                  height: '180px'
                }}
              >
                {/* Advanced hand-drawn grid lines */}
                <svg
                  width="180"
                  height="180"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    pointerEvents: 'none'
                  }}
                >
                  <defs>
                    {/* Ballpoint pen - smooth with slight texture */}
                    <filter id="roughPaper" x="0%" y="0%" width="100%" height="100%">
                      <feTurbulence baseFrequency="0.04" numOctaves="5" result="noise" seed="1"/>
                      <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.8"/>
                    </filter>
                    
                    {/* Pencil - grainy texture */}
                    <filter id="pencilTexture" x="0%" y="0%" width="100%" height="100%">
                      <feTurbulence baseFrequency="0.3" numOctaves="4" result="grain" seed="2"/>
                      <feDisplacementMap in="SourceGraphic" in2="grain" scale="1.2"/>
                      <feGaussianBlur stdDeviation="0.3"/>
                    </filter>
                    
                    {/* Marker - bold with slight bleed */}
                    <filter id="markerTexture" x="0%" y="0%" width="100%" height="100%">
                      <feGaussianBlur stdDeviation="0.2" result="blur"/>
                      <feTurbulence baseFrequency="0.08" numOctaves="3" result="texture" seed="3"/>
                      <feDisplacementMap in="blur" in2="texture" scale="0.3"/>
                    </filter>
                    
                    {/* Fountain pen - smooth with ink flow variation */}
                    <filter id="fountainTexture" x="0%" y="0%" width="100%" height="100%">
                      <feTurbulence baseFrequency="0.15" numOctaves="3" result="flow" seed="4"/>
                      <feDisplacementMap in="SourceGraphic" in2="flow" scale="0.6"/>
                    </filter>
                  </defs>
                  
                  {showGrid && (
                    <g>
                      {/* First vertical line - slightly curved with variable thickness */}
                      <path
                        d="M 61 3 Q 59.5 45 60.8 87 Q 61.2 130 59.5 177"
                        {...getPenStyle()}
                        fill="none"
                        style={{
                          strokeDasharray: '168',
                          strokeDashoffset: showGrid ? '0' : '168',
                          transition: 'stroke-dashoffset 1.2s ease-out 0.1s',
                          strokeLinecap: 'round'
                        }}
                      />
                      
                      {/* Second vertical line - different curve and timing */}
                      <path
                        d="M 119 4 Q 120.8 40 119.2 85 Q 120.5 125 121 176"
                        {...getPenStyle()}
                        fill="none"
                        style={{
                          strokeDasharray: '165',
                          strokeDashoffset: showGrid ? '0' : '165',
                          transition: 'stroke-dashoffset 1.4s ease-out 0.3s',
                          strokeLinecap: 'round',
                          strokeWidth: penStyle === 'marker' ? '3.2' : penStyle === 'pencil' ? '2.7' : getPenStyle().strokeWidth
                        }}
                      />
                      
                      {/* First horizontal line - wavy with pen pressure simulation */}
                      <path
                        d="M 3 59.5 Q 45 61 87 59.8 Q 130 60.5 177 61.2"
                        {...getPenStyle()}
                        fill="none"
                        style={{
                          strokeDasharray: '172',
                          strokeDashoffset: showGrid ? '0' : '172',
                          transition: 'stroke-dashoffset 1.3s ease-out 0.5s',
                          strokeLinecap: 'round',
                          strokeWidth: penStyle === 'marker' ? '3.0' : penStyle === 'pencil' ? '2.3' : '1.8'
                        }}
                      />
                      
                      {/* Second horizontal line - different character */}
                      <path
                        d="M 4 120.5 Q 42 119 88 120.8 Q 132 119.5 176 120"
                        {...getPenStyle()}
                        fill="none"
                        style={{
                          strokeDasharray: '170',
                          strokeDashoffset: showGrid ? '0' : '170',
                          transition: 'stroke-dashoffset 1.1s ease-out 0.7s',
                          strokeLinecap: 'round',
                          strokeWidth: penStyle === 'marker' ? '3.1' : penStyle === 'pencil' ? '2.6' : '2.1'
                        }}
                      />
                      
                      {/* Small imperfections - like pen slips or dots */}
                      <circle 
                        cx="61" 
                        cy="59" 
                        r={penStyle === 'marker' ? '1.2' : '0.8'}
                        fill={getPenStyle().stroke} 
                        style={{
                          opacity: showGrid ? getPenStyle().opacity : '0',
                          transition: 'opacity 0.3s ease-out 1.5s',
                          filter: getPenStyle().filter
                        }}
                      />
                      <circle 
                        cx="120" 
                        cy="121" 
                        r={penStyle === 'marker' ? '0.8' : '0.5'}
                        fill={getPenStyle().stroke}
                        style={{
                          opacity: showGrid ? (parseFloat(getPenStyle().opacity) * 0.7).toString() : '0',
                          transition: 'opacity 0.3s ease-out 1.7s',
                          filter: getPenStyle().filter
                        }}
                      />
                    </g>
                  )}
                  
                  {/* Enhanced winning line with hand-drawn effect */}
                  {winner && winner !== 'draw' && winningLine.length > 0 && (
                    <path
                      d={`M ${winningLine[0] % 3 === 0 ? '28' : winningLine[0] % 3 === 1 ? '88' : '148'} ${Math.floor(winningLine[0] / 3) === 0 ? '32' : Math.floor(winningLine[0] / 3) === 1 ? '92' : '152'} 
                           Q ${(winningLine[0] % 3 + winningLine[2] % 3) * 30 + 15} ${(Math.floor(winningLine[0] / 3) + Math.floor(winningLine[2] / 3)) * 30 + 45} 
                           ${winningLine[2] % 3 === 0 ? '32' : winningLine[2] % 3 === 1 ? '92' : '152'} ${Math.floor(winningLine[2] / 3) === 0 ? '28' : Math.floor(winningLine[2] / 3) === 1 ? '88' : '148'}`}
                      stroke="var(--pencil-eraser)"
                      strokeWidth="4.5"
                      fill="none"
                      filter="url(#roughPaper)"
                      style={{
                        strokeDasharray: '150',
                        strokeDashoffset: '0',
                        animation: 'drawWinningLine 0.8s ease-out',
                        strokeLinecap: 'round'
                      }}
                    />
                  )}
                </svg>
                
                {/* Invisible clickable cells */}
                <div 
                  className="grid grid-cols-3"
                  style={{
                    width: '100%',
                    height: '100%',
                    gap: '0px'
                  }}
                >
                  {board.map((cell, index) => (
                    <button
                      key={index}
                      onClick={() => handleCellClick(index)}
                      disabled={!!cell || !!winner}
                      className="flex items-center justify-center text-3xl cursor-pointer
                               hover:bg-white hover:bg-opacity-10 transition-colors
                               disabled:cursor-not-allowed"
                      style={{
                        width: '60px',
                        height: '60px',
                        border: 'none', // No borders - just the hand-drawn lines
                        background: 'transparent',
                        borderRadius: '4px' // Small radius for hover effect
                      }}
                    >
                      {cell === 'X' && (
                        <div style={{ 
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transform: `rotate(${getCellVariation(index) * 0.8}deg)`
                        }}>
                          <svg width="40" height="40" viewBox="0 0 40 40">
                            {/* Animated X symbol */}
                            <path
                              d="M 8 8 L 32 32"
                              {...getPenStyle()}
                              fill="none"
                              strokeLinecap="round"
                              style={{
                                ...getPenStyle(),
                                strokeDasharray: '34',
                                strokeDashoffset: (animatingCells.has(index) || drawnCells.has(index)) ? '0' : '34',
                                transition: 'stroke-dashoffset 0.6s ease-out'
                              }}
                            />
                            <path
                              d="M 32 8 L 8 32"
                              {...getPenStyle()}
                              fill="none"
                              strokeLinecap="round"
                              style={{
                                ...getPenStyle(),
                                strokeDasharray: '34',
                                strokeDashoffset: (animatingCells.has(index) || drawnCells.has(index)) ? '0' : '34',
                                transition: 'stroke-dashoffset 0.6s ease-out 0.3s'
                              }}
                            />
                          </svg>
                        </div>
                      )}
                      {cell === 'O' && (
                        <div style={{ 
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transform: `rotate(${getCellVariation(index) * 0.8}deg)`
                        }}>
                          <svg width="40" height="40" viewBox="0 0 40 40">
                            {/* Animated O symbol */}
                            <circle
                              cx="20"
                              cy="20"
                              r="14"
                              {...getPenStyle()}
                              fill="none"
                              strokeLinecap="round"
                              style={{
                                ...getPenStyle(),
                                strokeDasharray: '88',
                                strokeDashoffset: (animatingCells.has(index) || drawnCells.has(index)) ? '0' : '88',
                                transition: 'stroke-dashoffset 0.8s ease-out'
                              }}
                            />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer UI - Controls and statistics */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex justify-between items-center mb-4">
            {/* Game Controls */}
            <div className="flex gap-3 items-center">
              <button 
                onClick={resetGame}
                className="ui-button ui-button-primary ui-button-sm"
              >
                🔄 New Game
              </button>
              <button 
                onClick={() => {
                  setBoard(new Array(9).fill(null));
                  setWinner(null);
                  setWinningLine([]);
                  setCurrentPlayer('X');
                  setGameHistory(['Board cleared']);
                  setAnimatingCells(new Set());
                  setDrawnCells(new Set());
                }}
                className="ui-button ui-button-secondary ui-button-sm"
              >
                ↶ Clear Board
              </button>
              
              {/* Pen Style Selector */}
              <div className="flex items-center gap-2 ml-4">
                <label className="ui-text-sm font-medium">Pen Style:</label>
                <select 
                  value={penStyle}
                  onChange={(e) => setPenStyle(e.target.value as any)}
                  className="ui-input ui-text-sm"
                  style={{ width: 'auto', minWidth: '120px', padding: '0.25rem 0.5rem' }}
                >
                  <option value="ballpoint">🖊️ Ballpoint</option>
                  <option value="pencil">✏️ Pencil</option>
                  <option value="marker">🖍️ Marker</option>
                  <option value="fountain">🖋️ Fountain Pen</option>
                </select>
              </div>
            </div>
            
            {/* Game Statistics */}
            <div className="flex gap-6 ui-text-sm">
              <span>Games: <strong>{gamesPlayed}</strong></span>
              <span>Draws: <strong>{draws}</strong></span>
              <span>Moves: <strong>{board.filter(cell => cell !== null).length}</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Analysis and History */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Move History */}
        <div className="ui-card">
          <div className="ui-card-header">
            <h3 className="ui-card-title">📝 Game History</h3>
          </div>
          <div className="ui-card-body">
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {gameHistory.length > 0 ? (
                gameHistory.map((move, index) => (
                  <p key={index} className="ui-text-sm ui-text-muted">
                    {index + 1}. {move}
                  </p>
                ))
              ) : (
                <p className="ui-text-sm ui-text-muted italic">
                  No moves yet - start playing!
                </p>
              )}
            </div>
          </div>
        </div>

        {/* True Paper Layout Benefits */}
        <div className="ui-card">
          <div className="ui-card-header">
            <h3 className="ui-card-title">✅ True Paper Layout Benefits</h3>
          </div>
          <div className="ui-card-body">
            <ul className="ui-text-sm space-y-2">
              <li><strong>Pure Game Focus:</strong> The paper shows only the game state</li>
              <li><strong>Authentic Feel:</strong> Like looking down at real graph paper</li>
              <li><strong>Clear Hierarchy:</strong> UI vs. game elements are distinct</li>
              <li><strong>Professional Interface:</strong> Clean controls around the paper</li>
              <li><strong>Scalable Pattern:</strong> Works for any board game size</li>
              <li><strong>Mobile Friendly:</strong> UI adapts around fixed paper size</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Grid Alignment Technical Details */}
      <div className="ui-card">
        <div className="ui-card-header">
          <h3 className="ui-card-title">📏 Grid Alignment System</h3>
        </div>
        <div className="ui-card-body">
          <div className="ui-alert ui-alert-info mb-4">
            <strong>Perfect Grid Alignment:</strong> Game elements are now precisely aligned with the graph paper grid lines 
            for an authentic "drawn on paper" appearance.
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="ui-text font-bold mb-3">📏 Grid Math</h4>
              <ul className="ui-text-sm space-y-1 ui-text-muted">
                <li>• Paper background: <code>20px × 20px</code> grid</li>
                <li>• Each game cell: <code>60px × 60px</code> (3 grid squares)</li>
                <li>• Total game area: <code>180px × 180px</code> (9 grid squares)</li>
                <li>• Game position: <code>140px, 140px</code> from paper edge</li>
                <li>• Paper size: <code>480px × 480px</code> (24 grid squares)</li>
                <li>• Background starts at <code>0, 0</code> (no offset)</li>
              </ul>
            </div>
            
            <div>
              <h4 className="ui-text font-bold mb-3">✨ Advanced Hand-drawn Effects</h4>
              <ul className="ui-text-sm space-y-1 ui-text-muted">
                <li>• <strong>Animated SVG symbols:</strong> X and O draw themselves when placed</li>
                <li>• <strong>4 different pen styles:</strong> Ballpoint, Pencil, Marker, Fountain</li>
                <li>• <strong>Pen-specific textures:</strong> Each style has unique SVG filters</li>
                <li>• <strong>Variable stroke width:</strong> Simulates real pen pressure</li>
                <li>• <strong>Drawing animation:</strong> Grid and symbols animate progressively</li>
                <li>• <strong>Curved grid lines:</strong> Natural hand-drawn paths</li>
                <li>• <strong>Authentic imperfections:</strong> Ink dots and pen variations</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-4 p-3 bg-gray-50 rounded">
            <h5 className="ui-text font-medium mb-2">Reusable Pattern:</h5>
            <pre className="ui-text-sm text-gray-600">
{`// Grid-aligned game component formula:
// backgroundSize: '20px 20px'           (base grid)
// gameCell: 20px * gridUnits              (cell size)
// backgroundOffset: (paperSize - gameArea) / 2`}
            </pre>
          </div>
        </div>
      </div>

      {/* Pen Style Comparison */}
      <div className="ui-card">
        <div className="ui-card-header">
          <h3 className="ui-card-title">🖊️ Pen Style System</h3>
        </div>
        <div className="ui-card-body">
          <div className="ui-alert ui-alert-info mb-4">
            <strong>Try different pen styles!</strong> Use the pen selector above to see how each writing instrument 
            affects the grid lines, X/O symbols, and overall feel of the game.
          </div>
          
          <div className="ui-alert ui-alert-success mb-4">
            <strong>Marker Improvements:</strong> The marker filter has been refined to maintain recognizable X/O shapes 
            while still providing that authentic thick marker feel with subtle texture and slight bleeding.
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="ui-text font-bold mb-3">🖊️ Ballpoint Pen</h4>
              <ul className="ui-text-sm ui-text-muted space-y-1">
                <li>• <strong>Stroke:</strong> Clean blue ink, 2px width</li>
                <li>• <strong>Feel:</strong> Smooth, consistent lines</li>
                <li>• <strong>Effect:</strong> Slight paper texture filter</li>
                <li>• <strong>Best for:</strong> Precise, everyday writing</li>
              </ul>
            </div>
            
            <div>
              <h4 className="ui-text font-bold mb-3">✏️ Pencil</h4>
              <ul className="ui-text-sm ui-text-muted space-y-1">
                <li>• <strong>Stroke:</strong> Gray graphite, 2.5px width</li>
                <li>• <strong>Feel:</strong> Soft, slightly faded</li>
                <li>• <strong>Effect:</strong> Grainy texture with blur</li>
                <li>• <strong>Best for:</strong> Sketching, casual games</li>
              </ul>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
            <div>
              <h4 className="ui-text font-bold mb-3">🖍️ Marker</h4>
              <ul className="ui-text-sm ui-text-muted space-y-1">
                <li>• <strong>Stroke:</strong> Bold blue, 3.5px width</li>
                <li>• <strong>Feel:</strong> Thick with subtle texture</li>
                <li>• <strong>Effect:</strong> Light blur with displacement</li>
                <li>• <strong>Best for:</strong> Bold, clearly visible gameplay</li>
              </ul>
            </div>
            
            <div>
              <h4 className="ui-text font-bold mb-3">🖋️ Fountain Pen</h4>
              <ul className="ui-text-sm ui-text-muted space-y-1">
                <li>• <strong>Stroke:</strong> Rich navy ink, 2px width</li>
                <li>• <strong>Feel:</strong> Elegant with ink flow variation</li>
                <li>• <strong>Effect:</strong> Flow displacement filter</li>
                <li>• <strong>Best for:</strong> Sophisticated, classic feel</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Hand-drawn Techniques */}
      <div className="ui-card">
        <div className="ui-card-header">
          <h3 className="ui-card-title">🎨 Advanced Hand-drawn Techniques</h3>
        </div>
        <div className="ui-card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="ui-text font-bold mb-3">📝 SVG Path Curves</h4>
              <p className="ui-text-sm ui-text-muted mb-2">
                Using quadratic Bézier curves (<code>Q</code> commands) instead of straight lines:
              </p>
              <pre className="bg-gray-100 p-2 rounded text-xs ui-text-muted">
{`// Curved vertical line
M 61 3 Q 59.5 45 60.8 87 Q 61.2 130 59.5 177`}
              </pre>
              <p className="ui-text-sm ui-text-muted mt-2">
                Each line has 2-3 curve points with slight deviations for natural hand movement.
              </p>
            </div>
            
            <div>
              <h4 className="ui-text font-bold mb-3">✨ Drawing Animation</h4>
              <p className="ui-text-sm ui-text-muted mb-2">
                Everything draws progressively using <code>stroke-dasharray</code> animation:
              </p>
              <ul className="ui-text-sm ui-text-muted space-y-1">
                <li>• <strong>Grid lines:</strong> Each line has different timing (0.1s to 0.7s delays)</li>
                <li>• <strong>X symbols:</strong> Two strokes draw sequentially (0.6s + 0.3s delay)</li>
                <li>• <strong>O symbols:</strong> Circle draws in single motion (0.8s)</li>
                <li>• <strong>State management:</strong> Symbols remain visible after drawing completes</li>
                <li>• <strong>Positioning:</strong> Each symbol draws in its correct grid cell</li>
                <li>• <strong>Winning line:</strong> Highlighted stroke draws in 0.8s</li>
              </ul>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <h4 className="ui-text font-bold mb-3">🌊 Texture & Imperfections</h4>
              <ul className="ui-text-sm ui-text-muted space-y-1">
                <li>• <strong>SVG Turbulence Filter:</strong> Adds paper fiber roughness</li>
                <li>• <strong>Variable Stroke Width:</strong> 1.8px to 2.2px simulates pressure</li>
                <li>• <strong>Small Ink Dots:</strong> Circles at line intersections</li>
                <li>• <strong>Rounded Caps:</strong> <code>strokeLinecap="round"</code> for pen tips</li>
              </ul>
            </div>
            
            <div>
              <h4 className="ui-text font-bold mb-3">🔄 Reset Animation</h4>
              <p className="ui-text-sm ui-text-muted mb-2">
                Try clicking "🔄 New Game" to see the drawing animation:
              </p>
              <ul className="ui-text-sm ui-text-muted space-y-1">
                <li>• Grid disappears instantly</li>
                <li>• 100ms delay before redrawing starts</li>
                <li>• Lines appear in sequence over ~2 seconds</li>
                <li>• Small details (dots) appear last</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Layout Comparison */}
      <div className="ui-card">
        <div className="ui-card-header">
          <h3 className="ui-card-title">🎯 True Paper vs. Previous Approach</h3>
        </div>
        <div className="ui-card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="ui-text font-bold mb-3 text-red-600">❌ Previous Approach</h4>
              <ul className="ui-text-sm space-y-1 ui-text-muted">
                <li>• Turn indicators mixed on the paper</li>
                <li>• CSS borders created boxy appearance</li>
                <li>• Game elements floating above grid</li>
                <li>• Perfect rectangles looked too digital</li>
                <li>• Inconsistent styling boundaries</li>
                <li>• Less authentic hand-drawn feeling</li>
              </ul>
            </div>
            
            <div>
              <h4 className="ui-text font-bold mb-3 text-green-600">✅ True Paper + Hand-drawn Grid</h4>
              <ul className="ui-text-sm space-y-1 ui-text-muted">
                <li>• Paper contains only game board + pieces</li>
                <li>• All UI in clean modern interface areas</li>
                <li>• Hand-drawn SVG lines instead of CSS borders</li>
                <li>• Each line slightly rotated for authentic feel</li>
                <li>• Game elements perfectly aligned to grid</li>
                <li>• Matches real pencil-on-paper drawing</li>
                <li>• Professional interface, authentic game</li>
              </ul>
            </div>
          </div>
          
          <div className="ui-alert ui-alert-success mt-6">
            <strong>Result:</strong> Advanced hand-drawn SVG effects with 4 authentic pen styles, animated X/O symbols, 
            curved grid lines, and pen-specific textures create an incredibly authentic "sketched directly on graph paper" 
            experience. Watch as the grid draws itself line by line, then see X and O symbols animate as you place them - 
            each pen style (ballpoint, pencil, marker, fountain) has its own unique character, thickness, and texture effects.
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicTacToeDemo;