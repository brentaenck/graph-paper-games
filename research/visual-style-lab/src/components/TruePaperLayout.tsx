import React, { useState } from 'react';

const TruePaperLayout: React.FC = () => {
  const [gameState, setGameState] = useState({
    currentPlayer: 'X',
    moves: 3,
    gameStatus: 'in-progress',
    timeElapsed: '02:47',
    playerXScore: 2,
    playerOScore: 1
  });

  const [board, setBoard] = useState(Array(9).fill(null));

  const handleCellClick = (index: number) => {
    if (board[index] || gameState.gameStatus !== 'in-progress') return;
    
    const newBoard = [...board];
    newBoard[index] = gameState.currentPlayer;
    setBoard(newBoard);
    
    setGameState(prev => ({
      ...prev,
      currentPlayer: prev.currentPlayer === 'X' ? 'O' : 'X',
      moves: prev.moves + 1
    }));
  };

  return (
    <div className="space-y-6">
      {/* Concept Description */}
      <div className="ui-card">
        <div className="ui-card-header">
          <h2 className="ui-card-title">🎯 True Paper Reality Layout</h2>
        </div>
        <div className="ui-card-body">
          <div className="ui-alert ui-alert-info mb-4">
            <strong>New Approach:</strong> The paper contains ONLY the game - just like real life. 
            All UI elements (turn indicators, scores, timers) live in the modern digital interface surrounding the paper.
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="ui-text font-bold mb-3">📄 On the Paper (Hand-drawn)</h4>
              <ul className="ui-text-sm ui-text-muted space-y-1">
                <li>• Game board/grid only</li>
                <li>• Game pieces (X, O, dots, lines)</li>
                <li>• Nothing else - pure game state</li>
              </ul>
            </div>
            
            <div>
              <h4 className="ui-text font-bold mb-3">🖥️ Modern UI Interface</h4>
              <ul className="ui-text-sm ui-text-muted space-y-1">
                <li>• Player names and scores</li>
                <li>• Current turn indicator</li>
                <li>• Game controls and settings</li>
                <li>• Timer and move counter</li>
                <li>• Status messages</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Game Layout Demo */}
      <div className="ui-card">
        <div className="ui-card-header">
          <div className="flex justify-between items-center">
            <h3 className="ui-card-title">Tic-Tac-Toe - True Paper Layout</h3>
            <div className="flex gap-3">
              <span className="ui-badge ui-badge-primary">Move {gameState.moves}</span>
              <span className="ui-badge ui-badge-secondary">{gameState.timeElapsed}</span>
            </div>
          </div>
        </div>
        
        {/* Modern UI Game Controls - Top */}
        <div className="border-b border-gray-200 p-4 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            {/* Player X Info */}
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg
                ${gameState.currentPlayer === 'X' ? 'bg-blue-100 border-2 border-blue-400 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                ×
              </div>
              <div>
                <p className="ui-text font-medium">Player 1</p>
                <p className="ui-text-sm ui-text-muted">Score: {gameState.playerXScore}</p>
              </div>
            </div>
            
            {/* Game Status */}
            <div className="text-center">
              <p className="ui-text font-medium">
                {gameState.currentPlayer === 'X' ? 'Player 1' : 'Player 2'}'s Turn
              </p>
              <p className="ui-text-sm ui-text-muted">Make your move</p>
            </div>
            
            {/* Player O Info */}
            <div className="flex items-center gap-3 md:justify-end">
              <div className="order-2 md:order-1">
                <p className="ui-text font-medium">Player 2</p>
                <p className="ui-text-sm ui-text-muted">Score: {gameState.playerOScore}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg order-1 md:order-2
                ${gameState.currentPlayer === 'O' ? 'bg-red-100 border-2 border-red-400 text-red-700' : 'bg-gray-100 text-gray-500'}`}>
                O
              </div>
            </div>
          </div>
        </div>

        {/* The Pure Paper Game Area */}
        <div className="flex justify-center p-8 bg-gray-100">
          <div className="paper-sheet">
            {/* This is the "sheet of graph paper" - only contains the game */}
            <div className="graph-paper p-8 shadow-lg" style={{
              width: '400px',
              height: '400px',
              transform: 'rotate(-0.5deg)',
              background: 'var(--paper-white)',
              backgroundImage: `
                linear-gradient(var(--grid-light-blue) 1px, transparent 1px),
                linear-gradient(90deg, var(--grid-light-blue) 1px, transparent 1px)
              `,
              backgroundSize: '20px 20px'
            }}>
              {/* Pure game board - no UI elements */}
              <div className="flex items-center justify-center h-full">
                <div className="sketch-grid">
                  <div className="grid grid-cols-3 gap-0">
                    {board.map((cell, i) => (
                      <div
                        key={i}
                        className="sketch-cell w-20 h-20 flex items-center justify-center text-3xl cursor-pointer
                                 hover:bg-blue-50 transition-colors"
                        onClick={() => handleCellClick(i)}
                        style={{ background: cell ? 'transparent' : 'rgba(255,255,255,0.5)' }}
                      >
                        {cell === 'X' && <span className="hand-x">×</span>}
                        {cell === 'O' && <span className="hand-o">O</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modern UI Game Controls - Bottom */}
        <div className="border-t border-gray-200 p-4 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="flex gap-3">
              <button className="ui-button ui-button-secondary ui-button-sm">
                ↶ Undo Move
              </button>
              <button className="ui-button ui-button-secondary ui-button-sm">
                💾 Save Game
              </button>
            </div>
            
            <div className="flex gap-3">
              <button className="ui-button ui-button-warning ui-button-sm">
                ⏸ Pause
              </button>
              <button className="ui-button ui-button-danger ui-button-sm">
                🏳 Resign
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Layout Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Benefits */}
        <div className="ui-card">
          <div className="ui-card-header">
            <h3 className="ui-card-title">✅ Benefits of True Paper Layout</h3>
          </div>
          <div className="ui-card-body">
            <ul className="ui-text-sm space-y-2">
              <li><strong>Authentic Reality:</strong> Matches real pencil-and-paper experience</li>
              <li><strong>Clear Mental Model:</strong> Paper = game, Interface = controls</li>
              <li><strong>Focus on Game:</strong> Paper draws attention to gameplay</li>
              <li><strong>Scalable Design:</strong> Works for any game type/size</li>
              <li><strong>Professional Feel:</strong> Clean interface, beautiful game</li>
              <li><strong>Mobile Friendly:</strong> UI can adapt around fixed paper size</li>
            </ul>
          </div>
        </div>
        
        {/* Layout Variations */}
        <div className="ui-card">
          <div className="ui-card-header">
            <h3 className="ui-card-title">🎨 Layout Pattern Options</h3>
          </div>
          <div className="ui-card-body">
            <ul className="ui-text-sm space-y-2">
              <li><strong>Header + Footer:</strong> Controls above/below paper</li>
              <li><strong>Side Panels:</strong> UI flanking left/right of paper</li>
              <li><strong>Floating Panels:</strong> Overlay UI that can be moved</li>
              <li><strong>Tablet Mode:</strong> Portrait layout with stacked UI</li>
              <li><strong>Desktop Mode:</strong> Landscape with side panels</li>
              <li><strong>Minimal Mode:</strong> Hide all UI, just show paper</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Different Paper Sizes Demo */}
      <div className="ui-card">
        <div className="ui-card-header">
          <h3 className="ui-card-title">📏 Paper Size Variations</h3>
        </div>
        <div className="ui-card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Small Paper */}
            <div className="text-center">
              <h4 className="ui-text font-medium mb-3">Small Games</h4>
              <div className="inline-block graph-paper p-4 shadow-md" style={{
                width: '200px',
                height: '200px',
                transform: 'rotate(0.3deg)',
                backgroundSize: '10px 10px'
              }}>
                <div className="flex items-center justify-center h-full">
                  <div className="text-xs handwritten pencil-color">
                    5×5 Grid<br/>Quick Games
                  </div>
                </div>
              </div>
            </div>

            {/* Medium Paper */}
            <div className="text-center">
              <h4 className="ui-text font-medium mb-3">Standard Games</h4>
              <div className="inline-block graph-paper p-4 shadow-md" style={{
                width: '250px',
                height: '250px',
                transform: 'rotate(-0.2deg)',
                backgroundSize: '15px 15px'
              }}>
                <div className="flex items-center justify-center h-full">
                  <div className="text-sm handwritten pencil-color">
                    8×8 Grid<br/>Classic Games
                  </div>
                </div>
              </div>
            </div>

            {/* Large Paper */}
            <div className="text-center">
              <h4 className="ui-text font-medium mb-3">Complex Games</h4>
              <div className="inline-block graph-paper p-4 shadow-md" style={{
                width: '300px',
                height: '200px',
                transform: 'rotate(0.1deg)',
                backgroundSize: '20px 20px'
              }}>
                <div className="flex items-center justify-center h-full">
                  <div className="text-sm handwritten pencil-color">
                    Large Boards<br/>Strategy Games
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Implementation Notes */}
      <div className="ui-card">
        <div className="ui-card-header">
          <h3 className="ui-card-title">🛠 Implementation Considerations</h3>
        </div>
        <div className="ui-card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="ui-text font-bold mb-3">CSS Layout Structure</h4>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
{`.game-layout {
  display: grid;
  grid-template-areas: 
    "header header header"
    "sidebar paper sidebar"
    "footer footer footer";
  gap: 1rem;
}

.paper-area {
  grid-area: paper;
  display: flex;
  justify-content: center;
  align-items: center;
}

.paper-sheet {
  /* Fixed size, authentic paper */
  background: graph-paper;
  transform: rotate(-0.2deg);
  box-shadow: realistic-paper;
}`}
              </pre>
            </div>
            
            <div>
              <h4 className="ui-text font-bold mb-3">Responsive Behavior</h4>
              <ul className="ui-text-sm space-y-2">
                <li>• <strong>Mobile:</strong> Stack UI vertically around paper</li>
                <li>• <strong>Tablet:</strong> Side-by-side with paper centered</li>
                <li>• <strong>Desktop:</strong> Full layout with side panels</li>
                <li>• <strong>Paper size:</strong> Scales but maintains aspect ratio</li>
                <li>• <strong>UI adapts:</strong> Controls reorganize around paper</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TruePaperLayout;