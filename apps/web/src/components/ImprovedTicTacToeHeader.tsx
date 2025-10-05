/**
 * @fileoverview Improved TicTacToe Header Layout
 * 
 * This component demonstrates a cleaner, more organized header layout for the
 * TicTacToe game with better information hierarchy and responsive design.
 */

import React from 'react';
import type { GameConfig, GameStats } from '../types';

interface ImprovedTicTacToeHeaderProps {
  gameConfig: GameConfig;
  gameStats: GameStats;
  isThinking: boolean;
  lastAIThinkTime: number;
  onNewGame: () => void;
  onBackToGames: () => void;
  onGetHint: () => void;
  canGetHint: boolean;
  penStyle: string;
  setPenStyle: (style: string) => void;
}

const ImprovedTicTacToeHeader: React.FC<ImprovedTicTacToeHeaderProps> = ({
  gameConfig,
  gameStats,
  isThinking,
  lastAIThinkTime,
  onNewGame,
  onBackToGames,
  onGetHint,
  canGetHint,
  penStyle,
  setPenStyle
}) => {
  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-4xl mx-auto px-6 py-4 space-y-4">
        
        {/* PRIMARY HEADER - Game Title + Main Actions */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tic-Tac-Toe</h1>
              <div className="text-sm text-gray-600">
                {gameConfig.gameMode === 'human-vs-ai'
                  ? `Playing against AI Level ${gameConfig.aiDifficulty}`
                  : 'Human vs Human Mode'}
              </div>
            </div>
            
            {/* Quick Game Info */}
            <div className="hidden sm:flex items-center gap-3 text-sm text-gray-500">
              <span>Move {gameStats.movesPlayed}</span>
              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
              <span>{Math.floor((Date.now() - gameStats.gameStartTime) / 1000)}s</span>
              {isThinking && (
                <>
                  <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                  <span className="text-blue-600">🤖 AI thinking...</span>
                </>
              )}
            </div>
          </div>

          {/* Main Action Buttons */}
          <div className="flex gap-2">
            <button 
              className="px-3 py-2 text-sm text-gray-700 hover:text-gray-900 
                         hover:bg-gray-100 rounded-md transition-colors"
              onClick={onBackToGames}
            >
              ← Back
            </button>
            <button 
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 
                         hover:bg-blue-700 rounded-md transition-colors"
              onClick={onNewGame}
            >
              New Game
            </button>
          </div>
        </div>

        {/* SECONDARY CONTROLS - Game Tools + Stats */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 
                        pt-3 border-t border-gray-100">
          
          {/* Game Tools */}
          <div className="flex items-center gap-4">
            {/* Pen Style Selector - Prominent placement */}
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Style:</label>
              <select 
                value={penStyle} 
                onChange={(e) => setPenStyle(e.target.value)}
                className="text-sm bg-white border border-gray-300 rounded px-2 py-1 
                           focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="ballpoint">🖊️ Ballpoint</option>
                <option value="pencil">✏️ Pencil</option>
                <option value="marker">🖍️ Marker</option>
                <option value="fountain">🖋️ Fountain</option>
              </select>
            </div>

            {/* Hint Button - Close to game tools */}
            {canGetHint && (
              <button
                className="px-3 py-1.5 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 
                           rounded-md transition-colors disabled:opacity-50"
                onClick={onGetHint}
                disabled={isThinking}
                title="Get a hint for your next move"
              >
                💡 Hint
              </button>
            )}
          </div>

          {/* Compact Session Stats - Only show if meaningful */}
          {gameStats.gamesPlayed > 0 && (
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>Session: {gameStats.gamesPlayed} games</span>
              <span className="text-green-600">{gameStats.playerWins}W</span>
              <span className="text-red-600">{gameStats.aiWins}L</span>
              {gameStats.draws > 0 && (
                <span className="text-gray-600">{gameStats.draws}D</span>
              )}
            </div>
          )}
        </div>

        {/* OPTIONAL: AI Performance Indicator */}
        {gameConfig.gameMode === 'human-vs-ai' && lastAIThinkTime > 0 && (
          <div className="flex justify-end">
            <div className="text-xs text-gray-400">
              AI response: {lastAIThinkTime}ms
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImprovedTicTacToeHeader;

/**
 * KEY IMPROVEMENTS:
 * 
 * 1. CLEAR INFORMATION HIERARCHY
 *    - Primary: Game title + main actions
 *    - Secondary: Game tools + essential stats
 *    - Tertiary: Technical details
 * 
 * 2. BETTER MOBILE EXPERIENCE
 *    - Logical stacking on small screens
 *    - Essential info always visible
 *    - Reduced cognitive load
 * 
 * 3. ENHANCED USABILITY
 *    - Pen style selector prominent (key feature)
 *    - Hint button near other game tools
 *    - Stats only show when meaningful
 * 
 * 4. CLEANER VISUAL DESIGN
 *    - Consistent spacing with Tailwind
 *    - Better use of visual hierarchy
 *    - Subtle borders and separators
 * 
 * 5. RESPONSIVE LAYOUT
 *    - Graceful degradation on mobile
 *    - Flexible but structured spacing
 *    - Context-aware information display
 */