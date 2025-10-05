/**
 * @fileoverview Hand-Drawn Tic-Tac-Toe - A clean implementation showcasing the dual design system
 * 
 * This component demonstrates the dual design system framework with:
 * - Modern UI in header/footer (player info, controls, status)
 * - Pure hand-drawn game on paper (board, symbols, interactions)
 * - Clean separation between digital UI and paper-based game
 */

import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DualSystemProvider,
  TruePaperLayout,
  PaperSheet,
  HandDrawnGrid,
  PlayerDisplay,
  XSymbol,
  OSymbol
} from '@gpg/framework';

// ============================================================================
// Types & Constants
// ============================================================================

type Player = 'X' | 'O';
type CellState = Player | null;
type Board = CellState[];
type GameStatus = 'playing' | 'won' | 'draw';

interface GameState {
  board: Board;
  currentPlayer: Player;
  status: GameStatus;
  winner: Player | null;
  moves: number;
}

interface PlayerInfo {
  id: string;
  name: string;
  symbol: Player;
  color: string;
  score: number;
}

const INITIAL_BOARD: Board = Array(9).fill(null);
const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
  [0, 4, 8], [2, 4, 6]             // diagonals
];

// ============================================================================
// Game Logic Utilities
// ============================================================================

function checkWinner(board: Board): { winner: Player | null; winningLine: number[] | null } {
  for (const line of WINNING_COMBINATIONS) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a] as Player, winningLine: line };
    }
  }
  return { winner: null, winningLine: null };
}

function getGameStatus(board: Board): GameStatus {
  const { winner } = checkWinner(board);
  if (winner) return 'won';
  if (board.every(cell => cell !== null)) return 'draw';
  return 'playing';
}

// ============================================================================
// Hand-Drawn Game Board Component
// ============================================================================

interface HandDrawnGameBoardProps {
  gameState: GameState;
  onCellClick: (index: number) => void;
}

const HandDrawnGameBoard: React.FC<HandDrawnGameBoardProps> = ({ gameState, onCellClick }) => {
  const { board, status } = gameState;
  const { winningLine } = checkWinner(board);

  return (
    <PaperSheet
      gameWidth={9}
      gameHeight={9}
      onPaper={true}
      className="shadow-xl"
    >
      <div style={{ position: 'relative', width: '180px', height: '180px' }}>
        {/* Hand-drawn grid */}
        <HandDrawnGrid
          columns={3}
          rows={3}
          cellSize={60}
          onPaper={true}
          animate={true}
          winningLinePath={winningLine ? `M 30,30 L 150,150` : undefined}
        />
        
        {/* Game cells - clickable areas */}
        <div className="absolute inset-0 grid grid-cols-3 gap-0">
          {board.map((cell, index) => (
            <button
              key={index}
              onClick={() => onCellClick(index)}
              disabled={cell !== null || status !== 'playing'}
              className="w-full h-full flex items-center justify-center 
                         hover:bg-white hover:bg-opacity-20 
                         disabled:cursor-not-allowed
                         transition-colors duration-200
                         border-none bg-transparent"
              style={{ width: '60px', height: '60px' }}
            >
              {cell === 'X' && (
                <XSymbol
                  onPaper={true}
                  size={35}
                  cellPosition={index}
                  autoStart={true}
                />
              )}
              {cell === 'O' && (
                <OSymbol
                  onPaper={true}
                  size={35}
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
// Main Game Component
// ============================================================================

const HandDrawnTicTacToe: React.FC = () => {
  const navigate = useNavigate();
  
  // Player information
  const [players] = useState<[PlayerInfo, PlayerInfo]>([
    { id: 'player1', name: 'Player 1', symbol: 'X', color: '#ef4444', score: 0 },
    { id: 'player2', name: 'Player 2', symbol: 'O', color: '#3b82f6', score: 0 }
  ]);

  // Game state
  const [gameState, setGameState] = useState<GameState>({
    board: INITIAL_BOARD,
    currentPlayer: 'X',
    status: 'playing',
    winner: null,
    moves: 0
  });

  // Handle cell click
  const handleCellClick = useCallback((index: number) => {
    if (gameState.board[index] !== null || gameState.status !== 'playing') {
      return;
    }

    const newBoard = [...gameState.board];
    newBoard[index] = gameState.currentPlayer;
    
    const newStatus = getGameStatus(newBoard);
    const { winner } = checkWinner(newBoard);

    setGameState(prev => ({
      ...prev,
      board: newBoard,
      currentPlayer: prev.currentPlayer === 'X' ? 'O' : 'X',
      status: newStatus,
      winner,
      moves: prev.moves + 1
    }));
  }, [gameState.board, gameState.currentPlayer, gameState.status]);

  // Reset game
  const handleReset = () => {
    setGameState({
      board: INITIAL_BOARD,
      currentPlayer: 'X',
      status: 'playing',
      winner: null,
      moves: 0
    });
  };

  // Get current player info
  const currentPlayerInfo = players.find(p => p.symbol === gameState.currentPlayer) || players[0];
  const winnerPlayerInfo = gameState.winner ? players.find(p => p.symbol === gameState.winner) : null;

  return (
    <DualSystemProvider
      initialTheme={{
        handDrawn: {
          penStyle: 'pencil',
          enablePenSwitching: true,
          paperType: 'graph',
          paperRotation: -0.8,
          gridSize: 20,
          showGridAnimation: true,
          symbolAnimationDuration: 800,
          gridAnimationDelay: [0, 0.1, 0.2],
          showImperfections: true,
          roughnessIntensity: 0.6
        },
        layout: { type: 'header-footer', responsive: true }
      }}
    >
      <TruePaperLayout
        header={
          <div className="bg-white border-b border-gray-200 shadow-sm">
            <div className="max-w-4xl mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">
                  ✏️ Hand-Drawn Tic-Tac-Toe
                </h1>
                
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => navigate('/games/tic-tac-toe')}
                    className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    ← Back to Games
                  </button>
                  
                  <button
                    onClick={handleReset}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    New Game 🎮
                  </button>
                </div>
              </div>
            </div>
          </div>
        }
        
        footer={
          <div className="bg-white border-t border-gray-200">
            <div className="max-w-4xl mx-auto px-6 py-4">
              {/* Player displays */}
              <div className="flex items-center justify-center gap-8 mb-4">
                <PlayerDisplay
                  player={{
                    id: players[0].id,
                    name: players[0].name,
                    color: players[0].color,
                    isAI: false,
                    score: players[0].score,
                    isActive: gameState.currentPlayer === 'X' && gameState.status === 'playing'
                  }}
                  isActive={gameState.currentPlayer === 'X' && gameState.status === 'playing'}
                  variant="compact"
                  showScore={false}
                  accessible={true}
                />
                
                <div className="text-2xl font-bold text-gray-400">VS</div>
                
                <PlayerDisplay
                  player={{
                    id: players[1].id,
                    name: players[1].name,
                    color: players[1].color,
                    isAI: false,
                    score: players[1].score,
                    isActive: gameState.currentPlayer === 'O' && gameState.status === 'playing'
                  }}
                  isActive={gameState.currentPlayer === 'O' && gameState.status === 'playing'}
                  variant="compact"
                  showScore={false}
                  accessible={true}
                />
              </div>

              {/* Game status */}
              <div className="text-center">
                {gameState.status === 'playing' && (
                  <p className="text-lg text-gray-700">
                    <span className="font-semibold" style={{ color: currentPlayerInfo.color }}>
                      {currentPlayerInfo.name}
                    </span>'s turn
                  </p>
                )}
                
                {gameState.status === 'won' && winnerPlayerInfo && (
                  <p className="text-xl font-bold text-green-600">
                    🎉 {winnerPlayerInfo.name} wins!
                  </p>
                )}
                
                {gameState.status === 'draw' && (
                  <p className="text-xl font-bold text-gray-600">
                    🤝 It's a draw!
                  </p>
                )}
                
                <p className="text-sm text-gray-500 mt-2">
                  Moves: {gameState.moves}
                </p>
              </div>
            </div>
          </div>
        }
        
        paper={
          <div className="flex items-center justify-center min-h-96 p-8">
            <HandDrawnGameBoard
              gameState={gameState}
              onCellClick={handleCellClick}
            />
          </div>
        }
      />
    </DualSystemProvider>
  );
};

export default HandDrawnTicTacToe;