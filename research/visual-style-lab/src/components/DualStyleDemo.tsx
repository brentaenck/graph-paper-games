import React, { useState } from 'react';

const DualStyleDemo: React.FC = () => {
  const [gameSetup, setGameSetup] = useState({
    playerName: 'Player 1',
    opponentType: 'ai',
    difficulty: 3,
    boardSize: 'standard'
  });

  const [gameInProgress, setGameInProgress] = useState(false);

  return (
    <div className="space-y-8">
      {/* Header explaining the concept */}
      <div className="ui-card">
        <div className="ui-card-header">
          <h2 className="ui-card-title">Dual Design System Concept</h2>
        </div>
        <div className="ui-card-body">
          <div className="ui-alert ui-alert-info mb-4">
            <strong>New Approach:</strong> Digital interface elements (menus, controls, settings) use modern UI design, 
            while game elements on the "paper" use hand-drawn styling.
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="ui-text font-bold mb-3">🖥️ Modern UI Style</h3>
              <ul className="ui-text-sm ui-text-muted space-y-1">
                <li>• Navigation and menus</li>
                <li>• Settings panels</li>
                <li>• Form inputs and controls</li>
                <li>• System notifications</li>
                <li>• Player setup screens</li>
              </ul>
            </div>
            
            <div>
              <h3 className="ui-text font-bold mb-3">✏️ Hand-drawn Style</h3>
              <ul className="ui-text-sm ui-text-muted space-y-1">
                <li>• Game board and grid</li>
                <li>• Game pieces (X, O, etc.)</li>
                <li>• Scores on the paper</li>
                <li>• Turn indicators in game area</li>
                <li>• Move history as written notes</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Game Setup Panel - Modern UI */}
      <div className="ui-card">
        <div className="ui-card-header">
          <h3 className="ui-card-title">🖥️ Game Setup (Modern UI)</h3>
        </div>
        <div className="ui-card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="ui-label">Player Name</label>
                <input
                  type="text"
                  value={gameSetup.playerName}
                  onChange={(e) => setGameSetup({...gameSetup, playerName: e.target.value})}
                  className="ui-input"
                  placeholder="Enter your name"
                />
              </div>
              
              <div>
                <label className="ui-label">Opponent Type</label>
                <div className="flex gap-2 mt-1">
                  <button
                    onClick={() => setGameSetup({...gameSetup, opponentType: 'human'})}
                    className={`ui-button ${gameSetup.opponentType === 'human' ? 'ui-button-primary' : 'ui-button-secondary'}`}
                  >
                    Human
                  </button>
                  <button
                    onClick={() => setGameSetup({...gameSetup, opponentType: 'ai'})}
                    className={`ui-button ${gameSetup.opponentType === 'ai' ? 'ui-button-primary' : 'ui-button-secondary'}`}
                  >
                    AI
                  </button>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              {gameSetup.opponentType === 'ai' && (
                <div>
                  <label className="ui-label">AI Difficulty: Level {gameSetup.difficulty}</label>
                  <input
                    type="range"
                    min="1"
                    max="6"
                    value={gameSetup.difficulty}
                    onChange={(e) => setGameSetup({...gameSetup, difficulty: parseInt(e.target.value)})}
                    className="w-full mt-1"
                  />
                  <div className="flex justify-between ui-text-sm ui-text-muted mt-1">
                    <span>Easy</span>
                    <span>Hard</span>
                  </div>
                </div>
              )}
              
              <div>
                <label className="ui-label">Board Style</label>
                <select
                  value={gameSetup.boardSize}
                  onChange={(e) => setGameSetup({...gameSetup, boardSize: e.target.value})}
                  className="ui-input"
                >
                  <option value="standard">Standard Graph Paper</option>
                  <option value="engineering">Engineering Paper</option>
                  <option value="notebook">Notebook Lines</option>
                </select>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
            <div className="flex gap-2">
              <span className="ui-badge ui-badge-secondary">Quick Setup</span>
              <span className="ui-badge ui-badge-success">Local Play</span>
            </div>
            <button
              onClick={() => setGameInProgress(true)}
              className="ui-button ui-button-primary"
            >
              Start Game →
            </button>
          </div>
        </div>
      </div>

      {/* Game Area - Hand-drawn Style */}
      {gameInProgress && (
        <div className="ui-card">
          <div className="ui-card-header">
            <div className="flex justify-between items-center">
              <h3 className="ui-card-title">✏️ Game in Progress</h3>
              <div className="flex gap-2">
                <button className="ui-button ui-button-secondary ui-button-sm">⏸ Pause</button>
                <button className="ui-button ui-button-warning ui-button-sm">🏳 Resign</button>
                <button 
                  onClick={() => setGameInProgress(false)}
                  className="ui-button ui-button-secondary ui-button-sm"
                >
                  ← Back to Setup
                </button>
              </div>
            </div>
          </div>
          
          {/* The Paper Game Area */}
          <div className="paper-game-area">
            <div className="flex justify-center mb-6">
              {/* Score display on the paper */}
              <div className="sketch-border p-4 bg-white">
                <div className="flex items-center gap-8">
                  <div className="text-center paper-game-section">
                    <div className="hand-x text-2xl mb-2">×</div>
                    <p className="handwritten">{gameSetup.playerName}</p>
                    <p className="text-xl font-bold ink-color">2</p>
                  </div>
                  <div className="text-2xl pencil-color">VS</div>
                  <div className="text-center paper-game-section">
                    <div className="hand-o text-2xl mb-2">O</div>
                    <p className="handwritten">
                      {gameSetup.opponentType === 'ai' ? `AI Level ${gameSetup.difficulty}` : 'Player 2'}
                    </p>
                    <p className="text-xl font-bold ink-color">1</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Game Board on Paper */}
            <div className="flex justify-center mb-6">
              <div className="sketch-grid">
                <div className="grid grid-cols-3 gap-0">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="sketch-cell w-16 h-16 flex items-center justify-center text-2xl">
                      {i === 0 && <span className="hand-x">×</span>}
                      {i === 4 && <span className="hand-o">O</span>}
                      {i === 8 && <span className="hand-x">×</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Turn indicator on paper */}
            <div className="flex justify-center">
              <div className="sketch-border p-3 bg-white">
                <div className="flex items-center gap-2 paper-game-section">
                  <span className="handwritten">Current turn:</span>
                  <span className="hand-x text-xl">×</span>
                  <span className="handwritten">{gameSetup.playerName}</span>
                </div>
              </div>
            </div>
            
            {/* Game notes on paper */}
            <div className="absolute bottom-4 right-4">
              <div className="paper-game-section">
                <div className="handwritten text-sm pencil-color space-y-1">
                  <p>Move 1: X center</p>
                  <p>Move 2: O corner</p>
                  <p>Move 3: X top-left</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Side-by-side Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Modern UI Example */}
        <div className="ui-card">
          <div className="ui-card-header">
            <h3 className="ui-card-title">🖥️ Modern UI Elements</h3>
          </div>
          <div className="ui-card-body space-y-4">
            <div>
              <label className="ui-label">Settings Panel</label>
              <div className="space-y-2">
                <label className="flex items-center gap-2 ui-text-sm">
                  <input type="checkbox" defaultChecked />
                  Enable sound effects
                </label>
                <label className="flex items-center gap-2 ui-text-sm">
                  <input type="checkbox" />
                  Show move hints
                </label>
                <label className="flex items-center gap-2 ui-text-sm">
                  <input type="checkbox" defaultChecked />
                  Auto-save games
                </label>
              </div>
            </div>
            
            <div className="flex gap-2">
              <button className="ui-button ui-button-primary ui-button-sm">Save</button>
              <button className="ui-button ui-button-secondary ui-button-sm">Cancel</button>
            </div>
            
            <div className="ui-alert ui-alert-success">
              <strong>Success!</strong> Settings saved successfully.
            </div>
          </div>
        </div>

        {/* Hand-drawn Game Elements */}
        <div className="ui-card">
          <div className="ui-card-header">
            <h3 className="ui-card-title">✏️ Hand-drawn Game Elements</h3>
          </div>
          <div className="ui-card-body">
            <div className="paper-game-area" style={{ padding: '1.5rem', minHeight: 'auto' }}>
              <div className="space-y-4">
                {/* Game pieces */}
                <div className="flex justify-center gap-6">
                  <div className="text-center">
                    <div className="hand-x text-3xl mb-1">×</div>
                    <p className="handwritten text-sm">Player X</p>
                  </div>
                  <div className="text-center">
                    <div className="hand-o text-3xl mb-1">O</div>
                    <p className="handwritten text-sm">Player O</p>
                  </div>
                </div>
                
                {/* Mini game board */}
                <div className="sketch-border p-2 bg-white mx-auto" style={{ width: 'fit-content' }}>
                  <div className="grid grid-cols-3 gap-0">
                    {[0,1,2,3,4,5,6,7,8].map(i => (
                      <div key={i} className="w-8 h-8 border border-gray-300 flex items-center justify-center text-sm">
                        {i === 1 && <span className="hand-x text-xs">×</span>}
                        {i === 4 && <span className="hand-o text-xs">O</span>}
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Handwritten notes */}
                <div className="handwritten text-sm pencil-color text-center">
                  <p>Game #47 - Practice Match</p>
                  <p className="doodle-arrow">X wins in 5 moves</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Analysis */}
      <div className="ui-card">
        <div className="ui-card-header">
          <h3 className="ui-card-title">🎯 Benefits of Dual Design System</h3>
        </div>
        <div className="ui-card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="ui-text font-bold mb-3 text-green-600">✅ Pros</h4>
              <ul className="ui-text-sm space-y-1">
                <li>• Clear functional hierarchy</li>
                <li>• Game elements feel special</li>
                <li>• Better usability for settings</li>
                <li>• Maintains nostalgic game feel</li>
                <li>• Professional app appearance</li>
              </ul>
            </div>
            
            <div>
              <h4 className="ui-text font-bold mb-3 text-yellow-600">⚠️ Considerations</h4>
              <ul className="ui-text-sm space-y-1">
                <li>• Two design systems to maintain</li>
                <li>• Need clear boundaries</li>
                <li>• Consistent color coordination</li>
                <li>• Transition between styles</li>
                <li>• Development complexity</li>
              </ul>
            </div>
            
            <div>
              <h4 className="ui-text font-bold mb-3 text-blue-600">💡 Implementation</h4>
              <ul className="ui-text-sm space-y-1">
                <li>• CSS class prefixes (ui- vs hand-)</li>
                <li>• Component-level styling</li>
                <li>• Clear documentation</li>
                <li>• Style guide examples</li>
                <li>• Developer tooling</li>
              </ul>
            </div>
          </div>
          
          <div className="ui-alert ui-alert-info mt-6">
            <strong>Recommendation:</strong> This dual approach creates a sophisticated user experience that feels both 
            professional and playful. The clear separation makes the hand-drawn elements more impactful while keeping 
            the interface highly functional.
          </div>
        </div>
      </div>
    </div>
  );
};

export default DualStyleDemo;