import React, { useState } from 'react';

const HandDrawnComponents: React.FC = () => {
  const [formData, setFormData] = useState({
    playerName: '',
    gameMode: 'easy',
    enableSound: true
  });

  return (
    <div className="space-y-8">
      {/* Form Elements */}
      <section className="sketch-border p-6">
        <h2 className="mb-6">Hand-drawn Form Elements</h2>
        
        <div className="space-y-6 max-w-lg">
          <div>
            <label className="handwritten block mb-2">Player Name:</label>
            <input
              type="text"
              value={formData.playerName}
              onChange={(e) => setFormData({...formData, playerName: e.target.value})}
              placeholder="Enter your name..."
              className="w-full p-3 border-2 border-gray-400 rounded-lg handwritten text-lg
                         focus:border-blue-500 focus:outline-none transform rotate-slight
                         bg-paper-white"
              style={{
                fontFamily: 'var(--font-handwritten)',
                border: '3px solid var(--sketch-primary)',
                borderRadius: '8px',
                transform: 'rotate(-0.2deg)',
                boxShadow: '2px 2px 0px var(--pencil-light)'
              }}
            />
          </div>
          
          <div>
            <label className="handwritten block mb-3">Difficulty Level:</label>
            <div className="space-y-2">
              {['easy', 'medium', 'hard'].map((mode) => (
                <label key={mode} className="flex items-center gap-3 handwritten cursor-pointer">
                  <input
                    type="radio"
                    name="gameMode"
                    value={mode}
                    checked={formData.gameMode === mode}
                    onChange={(e) => setFormData({...formData, gameMode: e.target.value})}
                    className="w-5 h-5"
                    style={{
                      accentColor: 'var(--sketch-primary)'
                    }}
                  />
                  <span className="capitalize">{mode}</span>
                </label>
              ))}
            </div>
          </div>
          
          <div>
            <label className="flex items-center gap-3 handwritten cursor-pointer">
              <input
                type="checkbox"
                checked={formData.enableSound}
                onChange={(e) => setFormData({...formData, enableSound: e.target.checked})}
                className="w-5 h-5"
                style={{
                  accentColor: 'var(--sketch-success)'
                }}
              />
              <span>Enable Sound Effects</span>
            </label>
          </div>
        </div>
      </section>

      {/* Card Components */}
      <section className="space-y-6">
        <h2 className="sketch-border p-4 bg-white">Hand-drawn Cards & Panels</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Game Stats Card */}
          <div className="sketch-border p-6 paper-texture rotate-slight">
            <h3 className="mb-4">Game Statistics</h3>
            <div className="space-y-3 handwritten">
              <div className="flex justify-between">
                <span>Games Played:</span>
                <span className="ink-color font-bold">42</span>
              </div>
              <div className="flex justify-between">
                <span>Wins:</span>
                <span className="text-green-600 font-bold">28</span>
              </div>
              <div className="flex justify-between">
                <span>Losses:</span>
                <span className="text-red-600 font-bold">14</span>
              </div>
              <div className="flex justify-between border-t-2 border-dashed border-gray-300 pt-2">
                <span>Win Rate:</span>
                <span className="ink-color font-bold">67%</span>
              </div>
            </div>
          </div>
          
          {/* Player Info Card */}
          <div className="sketch-border p-6 rotate-slight-right">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center
                              border-2 border-blue-400">
                <span className="text-xl">🎮</span>
              </div>
              <div>
                <h3 className="mb-1">Player Profile</h3>
                <p className="handwritten text-sm pencil-color">Level 15 Strategist</p>
              </div>
            </div>
            <div className="space-y-2 handwritten text-sm">
              <p>• Favorite Game: Tic-Tac-Toe</p>
              <p>• Joined: March 2024</p>
              <p>• Best Streak: 8 wins</p>
            </div>
          </div>
          
          {/* Achievement Card */}
          <div className="sketch-border p-6 bg-yellow-50">
            <div className="text-center">
              <div className="text-4xl mb-3">🏆</div>
              <h3 className="mb-2">Achievement Unlocked!</h3>
              <p className="handwritten text-sm">
                "Master Strategist" - Won 25 games in a row
              </p>
              <div className="mt-4">
                <span className="bg-yellow-200 px-3 py-1 rounded-full text-xs handwritten">
                  +500 XP
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Game Board Components */}
      <section className="sketch-border p-6">
        <h2 className="mb-6">Game Board Elements</h2>
        
        <div className="space-y-8">
          {/* Score Display */}
          <div className="flex justify-center">
            <div className="sketch-border p-4 bg-white flex items-center gap-8">
              <div className="text-center">
                <div className="hand-x text-3xl mb-2">×</div>
                <p className="handwritten">Player 1</p>
                <p className="text-2xl font-bold ink-color">3</p>
              </div>
              <div className="text-4xl pencil-color">VS</div>
              <div className="text-center">
                <div className="hand-o text-3xl mb-2">O</div>
                <p className="handwritten">AI Easy</p>
                <p className="text-2xl font-bold ink-color">1</p>
              </div>
            </div>
          </div>
          
          {/* Game Controls */}
          <div className="flex justify-center gap-4">
            <button className="sketch-button">
              ↶ Undo Move
            </button>
            <button className="sketch-button" style={{
              background: 'var(--sketch-warning)',
              color: 'white',
              borderColor: 'var(--sketch-warning)'
            }}>
              ⏸ Pause Game
            </button>
            <button className="sketch-button" style={{
              background: 'var(--sketch-danger)',
              color: 'white', 
              borderColor: 'var(--sketch-danger)'
            }}>
              🏳 Resign
            </button>
          </div>
          
          {/* Turn Indicator */}
          <div className="flex justify-center">
            <div className="sketch-border p-4 bg-blue-50 text-center">
              <p className="handwritten mb-2">Current Turn:</p>
              <div className="flex items-center justify-center gap-2">
                <div className="hand-x text-2xl">×</div>
                <span className="handwritten text-lg">Player 1's turn</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Loading & Progress */}
      <section className="sketch-border p-6">
        <h2 className="mb-6">Loading & Progress Elements</h2>
        
        <div className="space-y-6">
          {/* AI Thinking */}
          <div className="text-center">
            <div className="sketch-border p-6 bg-gray-50 inline-block">
              <div className="flex items-center gap-3">
                <div className="animate-spin text-2xl">🤔</div>
                <span className="handwritten">AI is thinking...</span>
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="max-w-md mx-auto">
            <p className="handwritten mb-2">Loading Game Assets:</p>
            <div className="sketch-border p-2 bg-white">
              <div 
                className="h-4 bg-blue-400 rounded transition-all duration-300"
                style={{ 
                  width: '75%',
                  background: 'var(--sketch-primary)',
                  borderRadius: '4px',
                  transform: 'rotate(-0.1deg)'
                }}
              ></div>
            </div>
            <p className="text-center text-sm pencil-color mt-2">75% Complete</p>
          </div>
          
          {/* Status Messages */}
          <div className="space-y-3 max-w-md mx-auto">
            <div className="sketch-border p-3 bg-green-50 border-green-400">
              <div className="flex items-center gap-2">
                <span className="text-green-600">✓</span>
                <span className="handwritten text-green-700">Move validated successfully!</span>
              </div>
            </div>
            
            <div className="sketch-border p-3 bg-red-50 border-red-400">
              <div className="flex items-center gap-2">
                <span className="text-red-600">✗</span>
                <span className="handwritten text-red-700">Invalid move - space already occupied</span>
              </div>
            </div>
            
            <div className="sketch-border p-3 bg-yellow-50 border-yellow-400">
              <div className="flex items-center gap-2">
                <span className="text-yellow-600">!</span>
                <span className="handwritten text-yellow-700">Your opponent is taking a long time...</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tooltip & Popup */}
      <section className="sketch-border p-6">
        <h2 className="mb-6">Tooltips & Popups</h2>
        
        <div className="space-y-6">
          {/* Tooltip Example */}
          <div className="text-center">
            <div className="relative inline-block">
              <button className="sketch-button">
                Hover for Help
              </button>
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2
                              sketch-border p-3 bg-white text-sm handwritten whitespace-nowrap
                              opacity-0 hover:opacity-100 transition-opacity pointer-events-none">
                This button demonstrates a hand-drawn tooltip
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 
                                border-l-8 border-r-8 border-t-8 border-transparent border-t-gray-400"></div>
              </div>
            </div>
          </div>
          
          {/* Modal/Dialog */}
          <div className="flex justify-center">
            <div className="sketch-border p-6 bg-white max-w-md">
              <h3 className="mb-4 text-center">Game Over!</h3>
              
              <div className="text-center mb-6">
                <div className="text-6xl mb-3">🎉</div>
                <p className="handwritten text-lg mb-2">Congratulations!</p>
                <p className="handwritten">You won in 7 moves</p>
              </div>
              
              <div className="flex gap-3 justify-center">
                <button className="sketch-button">
                  Play Again
                </button>
                <button className="sketch-button" style={{
                  background: 'var(--paper-cream)',
                  color: 'var(--pencil-graphite)'
                }}>
                  Main Menu
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Design System Notes */}
      <section className="notebook-lines notebook-margin p-6">
        <h2 className="mb-4">Component Design Notes</h2>
        
        <div className="space-y-4 handwritten">
          <p>
            ✓ Form elements maintain the hand-drawn aesthetic while
            staying functional and accessible.
          </p>
          <p>
            ✓ Cards use subtle rotations (-0.5deg to 0.5deg) to feel
            naturally placed rather than perfectly aligned.
          </p>
          <p>
            ✓ Status messages use appropriate colors (green/red/yellow)
            but maintain the sketch border style for consistency.
          </p>
          <p>
            ✓ Interactive elements have hover states that enhance
            the hand-drawn feeling with slight transforms.
          </p>
          <p>
            💡 Could add subtle "pencil stroke" animations when
            drawing borders or filling progress bars.
          </p>
          <p>
            ⚠ Need to ensure all components meet WCAG accessibility
            standards despite the decorative styling.
          </p>
        </div>
      </section>
    </div>
  );
};

export default HandDrawnComponents;