/**
 * @fileoverview FrameworkDemo - Showcase of the new dual design system framework
 * 
 * This demo shows what the new framework components will look like and how
 * they enforce the dual design system boundaries. This is a preview of the
 * production framework components we just built.
 */

import React, { useState } from 'react';

type CellValue = 'X' | 'O' | null;
type Player = 'X' | 'O';
type PenStyle = 'ballpoint' | 'pencil' | 'marker' | 'fountain';

const FrameworkDemo: React.FC = () => {
  // Game state
  const [board, setBoard] = useState<CellValue[]>(new Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X');
  const [winner, setWinner] = useState<Player | 'draw' | null>(null);
  const [penStyle, setPenStyle] = useState<PenStyle>('ballpoint');
  const [gameCount, setGameCount] = useState(1);

  // Mock players (representing framework PlayerDisplay component)
  const mockPlayers = [
    { id: 'player1', name: 'Alice', score: 2, isActive: currentPlayer === 'X' },
    { id: 'player2', name: 'Bob (AI)', score: 1, isActive: currentPlayer === 'O' }
  ];

  const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
    [0, 4, 8], [2, 4, 6] // diagonals
  ];

  const checkWinner = (boardState: CellValue[]): Player | 'draw' | null => {
    for (const combination of winningCombinations) {
      const [a, b, c] = combination;
      if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
        return boardState[a] as Player;
      }
    }
    return boardState.every(cell => cell !== null) ? 'draw' : null;
  };

  const handleCellClick = (index: number) => {
    if (board[index] || winner) return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);

    const gameResult = checkWinner(newBoard);
    if (gameResult) {
      setWinner(gameResult);
    } else {
      setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
    }
  };

  const resetGame = () => {
    setBoard(new Array(9).fill(null));
    setCurrentPlayer('X');
    setWinner(null);
    setGameCount(prev => prev + 1);
  };

  // Get pen style for SVG
  const getPenStyle = () => {
    switch (penStyle) {
      case 'pencil':
        return { stroke: '#374151', strokeWidth: '2.5', opacity: '0.8', filter: 'url(#pencilTexture)' };
      case 'marker':
        return { stroke: '#1e40af', strokeWidth: '3.5', opacity: '0.85', filter: 'url(#markerTexture)' };
      case 'fountain':
        return { stroke: '#1e3a8a', strokeWidth: '2', opacity: '0.9', filter: 'url(#fountainTexture)' };
      default: // ballpoint
        return { stroke: 'var(--sketch-primary)', strokeWidth: '2', opacity: '1', filter: 'url(#roughPaper)' };
    }
  };

  return (
    <div className="space-y-6">
      {/* Framework Architecture Explanation */}
      <div className="ui-card">
        <div className="ui-card-header">
          <h1 className="ui-card-title text-2xl">🏗️ Framework Dual System Preview</h1>
        </div>
        <div className="ui-card-body">
          <div className="ui-alert ui-alert-info mb-4">
            <strong>Framework Components:</strong> This demo shows what games will look like using the new 
            framework components we just built. Notice the strict separation between modern UI and hand-drawn elements!
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="ui-text font-bold mb-3">🎨 Framework Architecture</h4>
              <ul className="ui-text-sm space-y-1">
                <li><strong>DualSystemProvider</strong> - Context managing both systems</li>
                <li><strong>TruePaperLayout</strong> - Enforces physical separation</li>
                <li><strong>PlayerDisplay</strong> - Modern UI player components</li>
                <li><strong>PaperSheet</strong> - Authentic graph paper foundation</li>
                <li><strong>HandDrawnGrid</strong> - SVG grid with animations</li>
                <li><strong>GameSymbol</strong> - Animated game pieces (X, O, etc.)</li>
              </ul>
            </div>
            
            <div>
              <h4 className="ui-text font-bold mb-3">✅ System Boundaries</h4>
              <ul className="ui-text-sm space-y-1">
                <li><strong>TypeScript Guards</strong> - Compile-time boundary enforcement</li>
                <li><strong>CSS Namespaces</strong> - `ui-*` vs `paper-*` classes</li>
                <li><strong>Context Isolation</strong> - Separate hooks and providers</li>
                <li><strong>Visual Boundaries</strong> - Clear UI vs game separation</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Framework Game Demo - True Paper Layout */}
      <div className="ui-card">
        <div className="ui-card-header">
          <div className="flex justify-between items-center">
            <h2 className="ui-card-title">🎮 Framework Game Demo</h2>
            <span className="ui-badge ui-badge-info">Game #{gameCount}</span>
          </div>
        </div>

        {/* MODERN UI HEADER - PlayerDisplay Components */}
        <div className="border-b border-gray-200 p-4 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            {/* Framework PlayerDisplay - Player X */}
            <div className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
              mockPlayers[0].isActive ? 'bg-blue-50 border-2 border-blue-200' : 'bg-gray-50 border border-gray-200'
            }`}>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg ${
                mockPlayers[0].isActive ? 'bg-red-100 border-2 border-red-400 text-red-700' : 'bg-gray-100 text-gray-500'
              }`}>
                ×
              </div>
              <div>
                <p className="ui-text font-medium">{mockPlayers[0].name}</p>
                <p className="ui-text-sm ui-text-muted">Score: {mockPlayers[0].score}</p>
                {mockPlayers[0].isActive && <span className="ui-badge ui-badge-primary ui-badge-sm">Active</span>}
              </div>
            </div>

            {/* Game Status */}
            <div className="text-center">
              {winner ? (
                winner === 'draw' ? (
                  <div>
                    <span className="ui-badge ui-badge-warning ui-badge-lg">🤝 Draw!</span>
                    <p className="ui-text-sm ui-text-muted mt-1">Well played!</p>
                  </div>
                ) : (
                  <div>
                    <span className="ui-badge ui-badge-success ui-badge-lg">🎉 {winner} Wins!</span>
                    <p className="ui-text-sm ui-text-muted mt-1">Congratulations!</p>
                  </div>
                )
              ) : (
                <div>
                  <span className="ui-badge ui-badge-primary ui-badge-lg">
                    Player {currentPlayer}'s Turn
                  </span>
                  <p className="ui-text-sm ui-text-muted mt-1">Make your move</p>
                </div>
              )}
            </div>

            {/* Framework PlayerDisplay - Player O */}
            <div className={`flex items-center gap-3 md:justify-end p-3 rounded-lg transition-all duration-200 ${
              mockPlayers[1].isActive ? 'bg-blue-50 border-2 border-blue-200' : 'bg-gray-50 border border-gray-200'
            }`}>
              <div className="order-2 md:order-1">
                <p className="ui-text font-medium">{mockPlayers[1].name}</p>
                <p className="ui-text-sm ui-text-muted">Score: {mockPlayers[1].score}</p>
                {mockPlayers[1].isActive && <span className="ui-badge ui-badge-primary ui-badge-sm">Active</span>}
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg order-1 md:order-2 ${
                mockPlayers[1].isActive ? 'bg-blue-100 border-2 border-blue-400 text-blue-700' : 'bg-gray-100 text-gray-500'
              }`}>
                O
              </div>
            </div>
          </div>
        </div>

        {/* PURE PAPER GAME AREA - Framework PaperSheet + HandDrawnGrid + GameSymbol */}
        <div className="flex justify-center p-8 bg-gray-100" style={{ minHeight: '500px' }}>
          <div className="paper-sheet">
            {/* Framework PaperSheet Component */}
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
                backgroundPosition: '0px 0px',
                position: 'relative'
              }}
            >
              {/* Framework HandDrawnGrid Component */}
              <div 
                style={{
                  position: 'absolute',
                  left: '140px',
                  top: '140px',
                  width: '180px',
                  height: '180px'
                }}
              >
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
                    {/* Framework SVG Filters */}
                    <filter id="roughPaper" x="0%" y="0%" width="100%" height="100%">
                      <feTurbulence baseFrequency="0.04" numOctaves="5" result="noise" seed="1"/>
                      <feDisplacementMap in="SourceGraphic" in2="noise" scale="0.8"/>
                    </filter>
                    <filter id="pencilTexture" x="0%" y="0%" width="100%" height="100%">
                      <feTurbulence baseFrequency="0.3" numOctaves="4" result="grain" seed="2"/>
                      <feDisplacementMap in="SourceGraphic" in2="grain" scale="1.2"/>
                      <feGaussianBlur stdDeviation="0.3"/>
                    </filter>
                    <filter id="markerTexture" x="0%" y="0%" width="100%" height="100%">
                      <feGaussianBlur stdDeviation="0.2" result="blur"/>
                      <feTurbulence baseFrequency="0.08" numOctaves="3" result="texture" seed="3"/>
                      <feDisplacementMap in="blur" in2="texture" scale="0.3"/>
                    </filter>
                    <filter id="fountainTexture" x="0%" y="0%" width="100%" height="100%">
                      <feTurbulence baseFrequency="0.15" numOctaves="3" result="flow" seed="4"/>
                      <feDisplacementMap in="SourceGraphic" in2="flow" scale="0.6"/>
                    </filter>
                  </defs>
                  
                  {/* Hand-drawn grid lines with pen style */}
                  <g>
                    <path d="M 61 3 Q 59.5 45 60.8 87 Q 61.2 130 59.5 177" {...getPenStyle()} fill="none" strokeLinecap="round" />
                    <path d="M 119 4 Q 120.8 40 119.2 85 Q 120.5 125 121 176" {...getPenStyle()} fill="none" strokeLinecap="round" />
                    <path d="M 3 59.5 Q 45 61 87 59.8 Q 130 60.5 177 61.2" {...getPenStyle()} fill="none" strokeLinecap="round" />
                    <path d="M 4 120.5 Q 42 119 88 120.8 Q 132 119.5 176 120" {...getPenStyle()} fill="none" strokeLinecap="round" />
                  </g>
                </svg>
                
                {/* Framework GameSymbol Components - Clickable game cells */}
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
                        border: 'none',
                        background: 'transparent',
                        borderRadius: '4px'
                      }}
                    >
                      {/* Framework GameSymbol - X */}
                      {cell === 'X' && (
                        <svg width="40" height="40" viewBox="0 0 40 40">
                          <path d="M 8 8 L 32 32" {...getPenStyle()} fill="none" strokeLinecap="round" />
                          <path d="M 32 8 L 8 32" {...getPenStyle()} fill="none" strokeLinecap="round" />
                        </svg>
                      )}
                      {/* Framework GameSymbol - O */}
                      {cell === 'O' && (
                        <svg width="40" height="40" viewBox="0 0 40 40">
                          <circle cx="20" cy="20" r="14" {...getPenStyle()} fill="none" strokeLinecap="round" />
                        </svg>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MODERN UI FOOTER - Game Controls */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="flex gap-3 items-center">
              <button 
                onClick={resetGame}
                className="ui-button ui-button-primary"
              >
                🔄 New Game
              </button>
              
              {/* Framework PenStyleSelector Component */}
              <div className="flex items-center gap-2">
                <label className="ui-text-sm font-medium">Framework Pen Style:</label>
                <select 
                  value={penStyle}
                  onChange={(e) => setPenStyle(e.target.value as PenStyle)}
                  className="ui-input ui-text-sm"
                  style={{ width: 'auto', minWidth: '140px' }}
                >
                  <option value="ballpoint">🖊️ Ballpoint Pen</option>
                  <option value="pencil">✏️ Pencil</option>
                  <option value="marker">🖍️ Marker</option>
                  <option value="fountain">🖋️ Fountain Pen</option>
                </select>
              </div>
            </div>
            
            <div className="ui-text-sm ui-text-muted">
              Moves: {board.filter(cell => cell !== null).length}
            </div>
          </div>
        </div>
      </div>

      {/* Framework Components Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="ui-card">
          <div className="ui-card-header">
            <h3 className="ui-card-title">🖥️ Modern UI System (Framework)</h3>
          </div>
          <div className="ui-card-body">
            <ul className="ui-text-sm space-y-2">
              <li><strong>PlayerDisplay:</strong> Accessible player info with avatars and status</li>
              <li><strong>TruePaperLayout:</strong> Physical separation of UI and game areas</li>
              <li><strong>UI Components:</strong> Buttons, badges, alerts with consistent styling</li>
              <li><strong>Theme System:</strong> Light/dark themes with CSS variables</li>
              <li><strong>Responsive Design:</strong> Mobile-first layouts that adapt</li>
            </ul>
          </div>
        </div>

        <div className="ui-card">
          <div className="ui-card-header">
            <h3 className="ui-card-title">✏️ Hand-drawn System (Framework)</h3>
          </div>
          <div className="ui-card-body">
            <ul className="ui-text-sm space-y-2">
              <li><strong>PaperSheet:</strong> Graph paper with perfect grid alignment</li>
              <li><strong>HandDrawnGrid:</strong> SVG grid with animated drawing effects</li>
              <li><strong>GameSymbol:</strong> Animated symbols (X, O, dots, ships, etc.)</li>
              <li><strong>Pen Styles:</strong> 4 authentic pen types with SVG filters</li>
              <li><strong>Animation Engine:</strong> Progressive drawing with timing control</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="ui-card">
        <div className="ui-card-header">
          <h3 className="ui-card-title">🚀 Framework Status & Next Steps</h3>
        </div>
        <div className="ui-card-body">
          <div className="ui-alert ui-alert-success mb-4">
            <strong>Phase 1 Complete!</strong> All 10 framework components have been scaffolded and are ready for production use.
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="ui-text font-bold mb-3">✅ What's Ready</h4>
              <ul className="ui-text-sm space-y-1">
                <li>• Complete dual system architecture</li>
                <li>• TypeScript boundary enforcement</li>
                <li>• All major components implemented</li>
                <li>• Responsive layouts and themes</li>
                <li>• Animation system with pen styles</li>
                <li>• Production-ready framework exports</li>
              </ul>
            </div>
            
            <div>
              <h4 className="ui-text font-bold mb-3">📈 Phase 2 - Migration</h4>
              <ul className="ui-text-sm space-y-1">
                <li>• Migrate existing tic-tac-toe game</li>
                <li>• Build framework as npm package</li>
                <li>• Add comprehensive documentation</li>
                <li>• Create additional game examples</li>
                <li>• Performance optimization</li>
                <li>• Advanced animation features</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FrameworkDemo;