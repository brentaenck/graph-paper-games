import React, { useState } from 'react';

type CellValue = 'X' | 'O' | null;
type Player = 'X' | 'O';

const TicTacToeDemo: React.FC = () => {
  const [board, setBoard] = useState<CellValue[]>(new Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X');
  const [winner, setWinner] = useState<Player | 'draw' | null>(null);
  const [winningLine, setWinningLine] = useState<number[]>([]);
  const [gameHistory, setGameHistory] = useState<string[]>([]);

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

    const moveDescription = `${currentPlayer} played position ${index + 1}`;
    setGameHistory(prev => [...prev, moveDescription]);

    const gameResult = checkWinner(newBoard);
    if (gameResult) {
      setWinner(gameResult);
      if (gameResult !== 'draw') {
        setGameHistory(prev => [...prev, `${gameResult} wins!`]);
      } else {
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
  };

  const getCellVariation = (index: number) => {
    // Create slight variations in rotation for each cell to feel more hand-drawn
    const rotations = [-1.5, 0.8, -0.3, 1.2, -0.7, 0.5, -1.1, 0.9, -0.4];
    return rotations[index];
  };

  return (
    <div className="space-y-8">
      {/* Game Header */}
      <section className="text-center">
        <h1 className="text-4xl mb-4">Hand-drawn Tic-Tac-Toe</h1>
        <p className="handwritten text-lg pencil-color">
          A demonstration of the graph paper aesthetic in an actual game
        </p>
      </section>

      {/* Game Status */}
      <section className="sketch-border p-6 text-center">
        {winner ? (
          <div className="space-y-4">
            {winner === 'draw' ? (
              <div>
                <h2 className="text-3xl mb-2">🤝</h2>
                <p className="handwritten text-xl">It's a draw!</p>
                <p className="casual-text text-sm pencil-color">
                  A perfectly balanced game - no one wins, no one loses
                </p>
              </div>
            ) : (
              <div>
                <h2 className="text-3xl mb-2">🎉</h2>
                <p className="handwritten text-xl">
                  Player <span className={winner === 'X' ? 'hand-x text-3xl' : 'hand-o text-3xl'}>{winner}</span> wins!
                </p>
                <p className="casual-text text-sm pencil-color">
                  Congratulations on your victory!
                </p>
              </div>
            )}
          </div>
        ) : (
          <div>
            <p className="handwritten text-lg mb-3">Current Turn:</p>
            <div className="flex items-center justify-center gap-3">
              <span className="handwritten text-xl">Player</span>
              <div className={currentPlayer === 'X' ? 'hand-x text-4xl' : 'hand-o text-4xl'}>
                {currentPlayer}
              </div>
              <span className="handwritten text-xl">to move</span>
            </div>
          </div>
        )}
      </section>

      {/* Game Board */}
      <section className="flex justify-center">
        <div className="graph-paper p-8 sketch-border bg-white">
          <div className="grid grid-cols-3 gap-2 w-80 h-80">
            {board.map((cell, index) => (
              <button
                key={index}
                onClick={() => handleCellClick(index)}
                disabled={!!cell || !!winner}
                className={`
                  w-24 h-24 border-3 border-gray-400 bg-white bg-opacity-90
                  hover:bg-opacity-100 hover:scale-105 transition-all duration-200
                  flex items-center justify-center text-5xl
                  disabled:cursor-not-allowed
                  ${winningLine.includes(index) ? 'bg-yellow-100 border-yellow-400' : ''}
                `}
                style={{
                  borderRadius: '6px',
                  transform: `rotate(${getCellVariation(index)}deg)`,
                  border: '3px solid var(--sketch-primary)',
                  boxShadow: '2px 2px 0px var(--pencil-light)',
                  ...(winningLine.includes(index) && {
                    borderColor: 'var(--pencil-eraser)',
                    backgroundColor: 'var(--paper-aged)',
                    boxShadow: '3px 3px 0px var(--pencil-eraser)'
                  })
                }}
              >
                {cell === 'X' && (
                  <span 
                    className="hand-x animate-hand-drawn" 
                    style={{ transform: `rotate(${getCellVariation(index) + 2}deg)` }}
                  >
                    ×
                  </span>
                )}
                {cell === 'O' && (
                  <span 
                    className="hand-o animate-hand-drawn"
                    style={{ transform: `rotate(${getCellVariation(index) - 1}deg)` }}
                  >
                    O
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Game Controls */}
      <section className="flex justify-center gap-4">
        <button 
          onClick={resetGame}
          className="sketch-button text-lg px-6 py-3"
        >
          🔄 New Game
        </button>
        <button 
          onClick={() => {
            setBoard(new Array(9).fill(null));
            setWinner(null);
            setWinningLine([]);
            setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
          }}
          className="sketch-button text-lg px-6 py-3"
          style={{
            background: 'var(--sketch-warning)',
            color: 'white',
            borderColor: 'var(--sketch-warning)'
          }}
        >
          ↶ Clear Board
        </button>
      </section>

      {/* Game Statistics */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Move History */}
        <div className="sketch-border p-6">
          <h3 className="mb-4">Game History</h3>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {gameHistory.length > 0 ? (
              gameHistory.map((move, index) => (
                <p key={index} className="handwritten text-sm pencil-color">
                  {index + 1}. {move}
                </p>
              ))
            ) : (
              <p className="handwritten text-sm pencil-color italic">
                No moves yet - start playing!
              </p>
            )}
          </div>
        </div>

        {/* Game Analysis */}
        <div className="sketch-border p-6 paper-texture">
          <h3 className="mb-4">Game Analysis</h3>
          <div className="space-y-3 handwritten">
            <div className="flex justify-between">
              <span>Total Moves:</span>
              <span className="ink-color font-bold">
                {board.filter(cell => cell !== null).length}
              </span>
            </div>
            <div className="flex justify-between">
              <span>X Moves:</span>
              <span className="font-bold" style={{ color: 'var(--sketch-danger)' }}>
                {board.filter(cell => cell === 'X').length}
              </span>
            </div>
            <div className="flex justify-between">
              <span>O Moves:</span>
              <span className="font-bold" style={{ color: 'var(--sketch-primary)' }}>
                {board.filter(cell => cell === 'O').length}
              </span>
            </div>
            <div className="flex justify-between border-t-2 border-dashed border-gray-300 pt-2">
              <span>Empty Spaces:</span>
              <span className="pencil-color font-bold">
                {board.filter(cell => cell === null).length}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Style Notes */}
      <section className="sketch-border p-6 bg-yellow-50">
        <h3 className="mb-4">🎨 Style Demonstration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="handwritten space-y-3">
            <h4 className="ink-color">What's working well:</h4>
            <p>✓ Hand-drawn X and O symbols feel natural and playful</p>
            <p>✓ Subtle cell rotations create authentic hand-placed appearance</p>
            <p>✓ Graph paper background enhances the paper game feeling</p>
            <p>✓ Winning line highlight uses eraser-yellow color effectively</p>
            <p>✓ Typography mixing (Caveat, Kalam, Indie Flower) adds personality</p>
          </div>
          
          <div className="handwritten space-y-3">
            <h4 className="pencil-color">Areas to refine:</h4>
            <p>⚠ Button hover effects could be more paper-like</p>
            <p>⚠ Consider adding pencil stroke animation when symbols appear</p>
            <p>💡 Could add paper crinkle sound effects</p>
            <p>💡 Eraser animation for clearing moves could be fun</p>
            <p>💡 Hand-drawn arrow pointing to current player's turn</p>
          </div>
        </div>
        
        <div className="mt-6 p-4 notebook-lines notebook-margin">
          <p className="handwritten text-sm">
            <strong>Design Note:</strong> This demonstrates how the graph paper aesthetic works 
            in a real game context. The hand-drawn elements maintain the playful feel 
            while keeping the interface functional and clear.
          </p>
        </div>
      </section>
    </div>
  );
};

export default TicTacToeDemo;