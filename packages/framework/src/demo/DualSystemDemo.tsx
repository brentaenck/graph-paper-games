/**
 * @fileoverview DualSystemDemo - Complete showcase of the dual design system
 * 
 * This demo shows how to use all the new dual system components together:
 * - DualSystemProvider managing both systems
 * - TruePaperLayout enforcing separation
 * - Modern UI components (PlayerDisplay, etc.)
 * - Hand-drawn components (PaperSheet, HandDrawnGrid, GameSymbol)
 * - SystemBoundary enforcement
 */

import React, { useState } from 'react';
import {
  DualSystemProvider,
  TruePaperLayout,
  PlayerDisplay,
  PaperSheet,
  HandDrawnGrid,
  GameSymbol,
  XSymbol,
  OSymbol,
  createTicTacToeGrid,
  useGameSymbolAnimation
} from '../index';
import type { Player, PenStyle } from '@gpg/shared';

// ============================================================================
// Demo Game State
// ============================================================================

type CellValue = 'X' | 'O' | null;

const mockPlayers: Player[] = [
  {
    id: 'player1',
    name: 'Alice',
    color: '#ef4444',
    isAI: false,
    difficulty: undefined,
    score: 2,
    isActive: true
  },
  {
    id: 'player2', 
    name: 'Bob',
    color: '#3b82f6',
    isAI: true,
    difficulty: 3,
    score: 1,
    isActive: false
  }
];

// ============================================================================
// Game Board Component
// ============================================================================

const GameBoard: React.FC<{
  board: CellValue[];
  onCellClick: (index: number) => void;
  currentPlayer: 'X' | 'O';
  disabled: boolean;
}> = ({ board, onCellClick, currentPlayer, disabled }) => {
  const gridConfig = createTicTacToeGrid(60);
  
  return (
    <PaperSheet 
      gameWidth={9} 
      gameHeight={9} 
      onPaper={true}
      className="mx-auto"
    >
      <div style={{ 
        position: 'relative',
        width: '180px', 
        height: '180px' 
      }}>
        {/* Hand-drawn grid lines */}
        <HandDrawnGrid
          {...gridConfig}
          onPaper={true}
          animate={true}
        />
        
        {/* Clickable game cells */}
        <div 
          className="grid grid-cols-3"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            gap: '0px'
          }}
        >
          {board.map((cell, index) => (
            <button
              key={index}
              onClick={() => onCellClick(index)}
              disabled={!!cell || disabled}
              className="flex items-center justify-center hover:bg-white hover:bg-opacity-10 transition-colors disabled:cursor-not-allowed"
              style={{
                width: '60px',
                height: '60px',
                border: 'none',
                background: 'transparent',
                borderRadius: '4px'
              }}
            >
              {cell === 'X' && (
                <XSymbol 
                  onPaper={true}
                  size={40}
                  cellPosition={index}
                  autoStart={true}
                />
              )}
              {cell === 'O' && (
                <OSymbol 
                  onPaper={true}
                  size={40}
                  cellPosition={index}
                  autoStart={true}
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </PaperSheet>
  );
};

// ============================================================================
// Main Demo Component
// ============================================================================

const DualSystemDemo: React.FC = () => {
  // Game state
  const [board, setBoard] = useState<CellValue[]>(new Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<'X' | 'O'>('X');
  const [winner, setWinner] = useState<'X' | 'O' | 'draw' | null>(null);
  const [gameCount, setGameCount] = useState(0);
  
  // System state
  const [penStyle, setPenStyle] = useState<PenStyle>('ballpoint');
  
  // Check for winner
  const checkWinner = (boardState: CellValue[]): 'X' | 'O' | 'draw' | null => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6] // diagonals
    ];
    
    for (const [a, b, c] of lines) {
      if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
        return boardState[a] as 'X' | 'O';
      }
    }
    
    return boardState.every(cell => cell !== null) ? 'draw' : null;
  };
  
  // Handle cell click
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
  
  // Reset game
  const resetGame = () => {
    setBoard(new Array(9).fill(null));
    setCurrentPlayer('X');
    setWinner(null);
    setGameCount(prev => prev + 1);
  };
  
  // Update mock players
  const updatedPlayers = mockPlayers.map(player => ({
    ...player,
    isActive: (player.id === 'player1' && currentPlayer === 'X') || 
              (player.id === 'player2' && currentPlayer === 'O')
  }));
  
  return (
    <DualSystemProvider
      initialTheme={{
        handDrawn: { penStyle },
        layout: { type: 'header-footer' }
      }}
      enableAnimations={true}
      enablePenSwitching={true}
    >
      <div className="min-h-screen bg-gray-50">
        <TruePaperLayout
          // Modern UI Header
          header={
            <div className="flex justify-between items-center">
              <h1 className="ui-text ui-text-2xl font-bold">
                🎨 Dual System Demo
              </h1>
              <div className="flex gap-4 items-center">
                {updatedPlayers.map(player => (
                  <PlayerDisplay
                    key={player.id}
                    player={player}
                    variant="compact"
                    showScore={false}
                  />
                ))}
              </div>
            </div>
          }
          
          // Pure Paper Game Area
          paper={
            <GameBoard
              board={board}
              onCellClick={handleCellClick}
              currentPlayer={currentPlayer}
              disabled={!!winner}
            />
          }
          
          // Modern UI Footer
          footer={
            <div className="flex justify-between items-center">
              {/* Game Controls */}
              <div className="flex gap-3">
                <button 
                  onClick={resetGame}
                  className="ui-button ui-button-primary"
                >
                  🔄 New Game
                </button>
                
                <div className="flex items-center gap-2">
                  <label className="ui-text ui-text-sm font-medium">
                    Pen Style:
                  </label>
                  <select 
                    value={penStyle}
                    onChange={(e) => setPenStyle(e.target.value as PenStyle)}
                    className="ui-input ui-text-sm"
                    style={{ width: 'auto', minWidth: '120px' }}
                  >
                    <option value="ballpoint">🖊️ Ballpoint</option>
                    <option value="pencil">✏️ Pencil</option>
                    <option value="marker">🖍️ Marker</option>
                    <option value="fountain">🖋️ Fountain Pen</option>
                  </select>
                </div>
              </div>
              
              {/* Game Status */}
              <div className="text-right">
                {winner ? (
                  <div>
                    {winner === 'draw' ? (
                      <span className="ui-badge ui-badge-warning">🤝 Draw!</span>
                    ) : (
                      <span className="ui-badge ui-badge-success">
                        🎉 Player {winner} Wins!
                      </span>
                    )}
                  </div>
                ) : (
                  <div>
                    <span className="ui-badge ui-badge-primary">
                      Player {currentPlayer}'s Turn
                    </span>
                  </div>
                )}
                <div className="ui-text ui-text-sm ui-text-muted mt-1">
                  Game #{gameCount + 1}
                </div>
              </div>
            </div>
          }
          
          layoutType="header-footer"
          responsive={true}
        />
      </div>
    </DualSystemProvider>
  );
};

export default DualSystemDemo;