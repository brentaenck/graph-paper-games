# Dual Design System Integration Guide

## Overview

This guide walks you through integrating the Graph Paper Games Dual Design System into your game projects, whether you're creating a new game from scratch or migrating an existing one.

## Prerequisites

- React 18+
- TypeScript (recommended)
- Access to the `@gpg/framework` package

## Installation & Setup

### 1. Install Dependencies

```bash
# If using the monorepo workspace
pnpm add @gpg/framework @gpg/shared

# If using external package (when published)
npm install @gpg/framework
```

### 2. Basic Project Structure

```
your-game/
├── src/
│   ├── components/
│   │   ├── GameBoard.tsx      # Hand-drawn components
│   │   ├── GameControls.tsx   # Modern UI components
│   │   └── Game.tsx           # Main game component
│   ├── hooks/
│   │   └── useGameLogic.ts    # Game state management
│   ├── types/
│   │   └── game.types.ts      # Game-specific types
│   └── styles/
│       └── game.css           # Additional game styles
└── package.json
```

## Step-by-Step Integration

### Step 1: Set Up the Root Component

Create your main game component with the dual system provider:

```tsx
// src/components/Game.tsx
import React from 'react';
import { 
  DualSystemProvider,
  TruePaperLayout 
} from '@gpg/framework';
import { GameBoard } from './GameBoard';
import { GameControls } from './GameControls';
import { useGameLogic } from '../hooks/useGameLogic';

export const MyGame: React.FC = () => {
  const gameLogic = useGameLogic();

  return (
    <DualSystemProvider
      initialPenStyle="pencil"
      initialTheme="light"
      onPenStyleChange={(style) => {
        console.log('Pen style changed to:', style);
        // Optional: save to localStorage
        localStorage.setItem('preferredPenStyle', style);
      }}
    >
      <TruePaperLayout variant="header-footer" responsive>
        {/* Modern UI Header */}
        <header className="modern-ui-header">
          <GameControls gameLogic={gameLogic} />
        </header>

        {/* Hand-drawn Game Surface */}
        <main className="paper-surface">
          <GameBoard gameLogic={gameLogic} />
        </main>

        {/* Modern UI Footer */}
        <footer className="modern-ui-footer">
          {/* Additional controls, status, etc. */}
        </footer>
      </TruePaperLayout>
    </DualSystemProvider>
  );
};
```

### Step 2: Create the Game Board (Hand-drawn)

Build your game board using hand-drawn components:

```tsx
// src/components/GameBoard.tsx
import React, { useState, useEffect } from 'react';
import { 
  PaperSheet,
  HandDrawnGrid,
  GameSymbol,
  WinningLine,
  useDualSystem 
} from '@gpg/framework';

interface GameBoardProps {
  gameLogic: ReturnType<typeof useGameLogic>;
}

export const GameBoard: React.FC<GameBoardProps> = ({ gameLogic }) => {
  const { penStyle } = useDualSystem();
  const [gridDrawn, setGridDrawn] = useState(false);
  
  const {
    board,
    currentPlayer,
    winner,
    winningLine,
    onCellClick,
    isValidMove
  } = gameLogic;

  return (
    <PaperSheet 
      gameWidth={320} 
      gameHeight={320}
      paperType="graph"
      gridSize={20}
      rotation={-0.8}
    >
      {/* Animated hand-drawn grid */}
      <HandDrawnGrid
        columns={3}
        rows={3}
        cellSize={80}
        penStyle={penStyle}
        animate
        showImperfections
        onAnimationComplete={() => {
          setGridDrawn(true);
          console.log('Grid animation complete');
        }}
      />

      {/* Game symbols - only show after grid is drawn */}
      {gridDrawn && board.map((cell, index) => (
        cell && (
          <GameSymbol
            key={`${index}-${cell}`}
            symbol={cell as 'X' | 'O'}
            cellPosition={index}
            size={50}
            penStyle={penStyle}
            animate
            autoStart
            onAnimationComplete={() => {
              console.log(`Symbol ${cell} drawn at position ${index}`);
            }}
          />
        )
      ))}

      {/* Winning line animation */}
      {winner && winningLine && (
        <WinningLine
          winningLine={winningLine}
          penStyle="marker"
          cellSize={80}
          gridColumns={3}
          color="#f59e0b"
          animationDelay={0.5}
          wobbleEffect
        />
      )}

      {/* Invisible clickable overlay */}
      <div 
        className="absolute inset-0 grid grid-cols-3 gap-0"
        style={{
          width: '240px',
          height: '240px',
          top: '40px',
          left: '40px'
        }}
      >
        {Array.from({ length: 9 }, (_, index) => (
          <button
            key={index}
            className="w-full h-full border-0 bg-transparent cursor-pointer
                     hover:bg-black hover:bg-opacity-5 transition-colors
                     disabled:cursor-not-allowed"
            onClick={() => onCellClick(index)}
            disabled={!isValidMove(index) || !gridDrawn}
            aria-label={`Cell ${index + 1}, ${board[index] || 'empty'}`}
          />
        ))}
      </div>
    </PaperSheet>
  );
};
```

### Step 3: Create Game Controls (Modern UI)

Build your modern UI controls:

```tsx
// src/components/GameControls.tsx
import React from 'react';
import { 
  PlayerDisplay,
  useDualSystem,
  useLayout 
} from '@gpg/framework';
import type { Player } from '@gpg/shared';

interface GameControlsProps {
  gameLogic: ReturnType<typeof useGameLogic>;
}

export const GameControls: React.FC<GameControlsProps> = ({ gameLogic }) => {
  const { penStyle, setPenStyle, theme, setTheme } = useDualSystem();
  const { isMobile } = useLayout();
  
  const {
    players,
    currentPlayer,
    gameStatus,
    resetGame,
    undoMove,
    canUndo
  } = gameLogic;

  return (
    <div className={`game-controls ${isMobile ? 'mobile' : 'desktop'}`}>
      {/* Player Information */}
      <div className="players-section">
        {players.map((player) => (
          <PlayerDisplay
            key={player.id}
            player={player}
            isActive={player.id === currentPlayer?.id}
            variant={isMobile ? 'compact' : 'default'}
            showScore
            accessible
            aria-label={`Player ${player.name}${
              player.isActive ? ' - current turn' : ''
            }`}
          />
        ))}
      </div>

      {/* Game Status */}
      <div className="game-status">
        <h2 className="text-lg font-semibold">
          {gameStatus === 'playing' && `${currentPlayer?.name}'s Turn`}
          {gameStatus === 'won' && `${currentPlayer?.name} Wins!`}
          {gameStatus === 'draw' && "It's a Draw!"}
        </h2>
      </div>

      {/* Controls */}
      <div className="controls-section">
        <div className="control-group">
          <label htmlFor="pen-style-select">Pen Style:</label>
          <select
            id="pen-style-select"
            value={penStyle}
            onChange={(e) => setPenStyle(e.target.value as any)}
            className="modern-select"
          >
            <option value="ballpoint">Ballpoint Pen</option>
            <option value="pencil">Pencil</option>
            <option value="marker">Marker</option>
            <option value="fountain">Fountain Pen</option>
          </select>
        </div>

        <div className="control-group">
          <label htmlFor="theme-select">Theme:</label>
          <select
            id="theme-select"
            value={theme}
            onChange={(e) => setTheme(e.target.value as any)}
            className="modern-select"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </select>
        </div>
      </div>

      {/* Game Actions */}
      <div className="actions-section">
        <button
          onClick={undoMove}
          disabled={!canUndo}
          className="modern-button secondary"
          aria-label="Undo last move"
        >
          ↶ Undo
        </button>
        
        <button
          onClick={resetGame}
          className="modern-button primary"
          aria-label="Start new game"
        >
          🔄 New Game
        </button>
      </div>
    </div>
  );
};
```

### Step 4: Implement Game Logic Hook

Create a custom hook for your game logic:

```tsx
// src/hooks/useGameLogic.ts
import { useState, useCallback } from 'react';
import type { Player } from '@gpg/shared';

export interface GameLogic {
  // Game State
  board: (string | null)[];
  players: Player[];
  currentPlayer: Player | null;
  gameStatus: 'playing' | 'won' | 'draw';
  winner: Player | null;
  winningLine: number[] | null;
  moveHistory: number[];
  
  // Game Actions
  onCellClick: (index: number) => void;
  resetGame: () => void;
  undoMove: () => void;
  
  // Utilities
  isValidMove: (index: number) => boolean;
  canUndo: boolean;
}

export const useGameLogic = (): GameLogic => {
  // Initialize state
  const [board, setBoard] = useState<(string | null)[]>(Array(9).fill(null));
  const [players] = useState<Player[]>([
    {
      id: 'player1',
      name: 'Player 1',
      isAI: false,
      score: 0,
      isActive: true,
      color: '#3b82f6'
    },
    {
      id: 'player2', 
      name: 'Player 2',
      isAI: false,
      score: 0,
      isActive: false,
      color: '#ef4444'
    }
  ]);
  
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'draw'>('playing');
  const [winner, setWinner] = useState<Player | null>(null);
  const [winningLine, setWinningLine] = useState<number[] | null>(null);
  const [moveHistory, setMoveHistory] = useState<number[]>([]);

  const currentPlayer = players[currentPlayerIndex];

  // Check for winner
  const checkWinner = useCallback((board: (string | null)[]) => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6]             // diagonals
    ];

    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return { winner: board[a], line: [a, b, c] };
      }
    }

    return { winner: null, line: null };
  }, []);

  // Handle cell click
  const onCellClick = useCallback((index: number) => {
    if (board[index] || gameStatus !== 'playing') return;

    const newBoard = [...board];
    newBoard[index] = currentPlayerIndex === 0 ? 'X' : 'O';
    
    const { winner: gameWinner, line } = checkWinner(newBoard);
    
    setBoard(newBoard);
    setMoveHistory(prev => [...prev, index]);

    if (gameWinner) {
      setWinner(players[currentPlayerIndex]);
      setWinningLine(line);
      setGameStatus('won');
    } else if (newBoard.every(cell => cell !== null)) {
      setGameStatus('draw');
    } else {
      setCurrentPlayerIndex(prev => prev === 0 ? 1 : 0);
    }
  }, [board, currentPlayerIndex, gameStatus, checkWinner, players]);

  // Reset game
  const resetGame = useCallback(() => {
    setBoard(Array(9).fill(null));
    setCurrentPlayerIndex(0);
    setGameStatus('playing');
    setWinner(null);
    setWinningLine(null);
    setMoveHistory([]);
  }, []);

  // Undo move
  const undoMove = useCallback(() => {
    if (moveHistory.length === 0) return;

    const newHistory = [...moveHistory];
    const lastMoveIndex = newHistory.pop()!;
    const newBoard = [...board];
    newBoard[lastMoveIndex] = null;

    setBoard(newBoard);
    setMoveHistory(newHistory);
    setCurrentPlayerIndex(prev => prev === 0 ? 1 : 0);
    setGameStatus('playing');
    setWinner(null);
    setWinningLine(null);
  }, [moveHistory, board]);

  // Utility functions
  const isValidMove = useCallback((index: number) => {
    return !board[index] && gameStatus === 'playing';
  }, [board, gameStatus]);

  const canUndo = moveHistory.length > 0 && gameStatus === 'playing';

  return {
    board,
    players,
    currentPlayer,
    gameStatus,
    winner,
    winningLine,
    moveHistory,
    onCellClick,
    resetGame,
    undoMove,
    isValidMove,
    canUndo
  };
};
```

### Step 5: Add Styling

Create styles that work with the dual system:

```css
/* src/styles/game.css */

/* Modern UI Styles */
.game-controls {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background: var(--ui-background);
  border-radius: var(--ui-border-radius);
}

.game-controls.mobile {
  flex-direction: row;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.5rem;
}

.players-section {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.game-status h2 {
  text-align: center;
  margin: 0;
  color: var(--ui-text-primary);
}

.controls-section {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.control-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 120px;
}

.control-group label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--ui-text-secondary);
}

.modern-select,
.modern-button {
  padding: 0.5rem 0.75rem;
  border-radius: 0.375rem;
  border: 1px solid var(--ui-border);
  background: var(--ui-background);
  color: var(--ui-text-primary);
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.modern-select:focus,
.modern-button:focus {
  outline: 2px solid var(--ui-primary);
  outline-offset: 2px;
}

.modern-button {
  cursor: pointer;
  font-weight: 500;
}

.modern-button.primary {
  background: var(--ui-primary);
  color: white;
  border-color: var(--ui-primary);
}

.modern-button.secondary {
  background: var(--ui-secondary);
  color: var(--ui-text-primary);
}

.modern-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.modern-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.actions-section {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
}

/* Paper Surface */
.paper-surface {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  padding: 2rem;
  background: var(--paper-background, #f8f9fa);
}

/* Responsive Design */
@media (max-width: 768px) {
  .paper-surface {
    padding: 1rem;
    min-height: 320px;
  }
  
  .game-controls.desktop {
    flex-direction: column;
    align-items: center;
  }
  
  .controls-section {
    flex-direction: column;
    align-items: center;
  }
}

/* Dark Theme Support */
@media (prefers-color-scheme: dark) {
  :root {
    --ui-background: #1f2937;
    --ui-text-primary: #f9fafb;
    --ui-text-secondary: #d1d5db;
    --ui-border: #374151;
    --ui-primary: #3b82f6;
    --ui-secondary: #6b7280;
    --paper-background: #111827;
  }
}
```

### Step 6: Add TypeScript Types

Define your game-specific types:

```typescript
// src/types/game.types.ts
import type { Player } from '@gpg/shared';

export interface GameState {
  board: (string | null)[];
  currentPlayer: Player;
  players: Player[];
  winner: Player | null;
  status: 'playing' | 'won' | 'draw';
}

export interface GameMove {
  playerId: string;
  position: number;
  symbol: 'X' | 'O';
  timestamp: Date;
}

export interface GameSettings {
  penStyle: 'ballpoint' | 'pencil' | 'marker' | 'fountain';
  theme: 'light' | 'dark' | 'system';
  animations: boolean;
  soundEnabled: boolean;
}

// Extend the base WinningLine type for your game
export interface TicTacToeWinningLine {
  cells: [number, number, number];
  type: 'row' | 'column' | 'diagonal';
  player: Player;
}
```

## Advanced Integration Patterns

### 1. AI Player Integration

```tsx
// Add AI support to your game logic
import { useEffect } from 'react';

export const useGameLogicWithAI = () => {
  const gameLogic = useGameLogic();
  
  useEffect(() => {
    if (gameLogic.currentPlayer?.isAI && gameLogic.gameStatus === 'playing') {
      // Simulate AI thinking time
      const timer = setTimeout(() => {
        const availableMoves = gameLogic.board
          .map((cell, index) => cell === null ? index : null)
          .filter(index => index !== null) as number[];
        
        if (availableMoves.length > 0) {
          // Simple random AI - replace with your AI logic
          const randomMove = availableMoves[
            Math.floor(Math.random() * availableMoves.length)
          ];
          gameLogic.onCellClick(randomMove);
        }
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [gameLogic.currentPlayer, gameLogic.gameStatus, gameLogic.board]);
  
  return gameLogic;
};
```

### 2. Sound Integration

```tsx
// Add sound effects
import { useEffect, useRef } from 'react';
import { useDualSystem } from '@gpg/framework';

export const useSoundEffects = () => {
  const { penStyle } = useDualSystem();
  const audioContext = useRef<AudioContext>();
  
  const playDrawingSound = useCallback((penStyle: string) => {
    // Different sounds for different pen styles
    const soundMap = {
      pencil: 'pencil-draw.mp3',
      marker: 'marker-draw.mp3',
      ballpoint: 'pen-draw.mp3',
      fountain: 'fountain-draw.mp3'
    };
    
    // Implement sound playing logic
  }, []);
  
  return { playDrawingSound };
};
```

### 3. Animation Sequences

```tsx
// Coordinate complex animation sequences
export const useAnimationSequence = () => {
  const [animationPhase, setAnimationPhase] = useState<
    'idle' | 'drawing-grid' | 'drawing-symbols' | 'victory' | 'complete'
  >('idle');
  
  const startGameAnimation = useCallback(() => {
    setAnimationPhase('drawing-grid');
  }, []);
  
  const onGridComplete = useCallback(() => {
    setAnimationPhase('drawing-symbols');
  }, []);
  
  const onSymbolsComplete = useCallback(() => {
    setAnimationPhase('complete');
  }, []);
  
  const onVictory = useCallback(() => {
    setAnimationPhase('victory');
  }, []);
  
  return {
    animationPhase,
    startGameAnimation,
    onGridComplete,
    onSymbolsComplete,
    onVictory
  };
};
```

## Testing Your Integration

### 1. Component Testing

```tsx
// __tests__/Game.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { MyGame } from '../src/components/Game';

describe('MyGame', () => {
  test('renders game board and controls', () => {
    render(<MyGame />);
    
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByLabelText(/pen style/i)).toBeInTheDocument();
  });
  
  test('allows making moves', () => {
    render(<MyGame />);
    
    const firstCell = screen.getByLabelText(/cell 1/i);
    fireEvent.click(firstCell);
    
    expect(screen.getByLabelText(/cell 1.*X/i)).toBeInTheDocument();
  });
});
```

### 2. Integration Testing

```tsx
// __tests__/integration.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MyGame } from '../src/components/Game';

describe('Game Integration', () => {
  test('complete game flow', async () => {
    const user = userEvent.setup();
    render(<MyGame />);
    
    // Wait for grid animation
    await waitFor(() => {
      expect(screen.getByLabelText(/cell 1/i)).toBeEnabled();
    });
    
    // Play a complete game
    await user.click(screen.getByLabelText(/cell 1/i)); // X
    await user.click(screen.getByLabelText(/cell 2/i)); // O
    await user.click(screen.getByLabelText(/cell 4/i)); // X
    await user.click(screen.getByLabelText(/cell 5/i)); // O
    await user.click(screen.getByLabelText(/cell 7/i)); // X wins
    
    expect(screen.getByText(/wins/i)).toBeInTheDocument();
  });
});
```

## Performance Considerations

### 1. Lazy Loading

```tsx
// Lazy load heavy components
const HandDrawnGrid = React.lazy(() => 
  import('@gpg/framework').then(module => ({ 
    default: module.HandDrawnGrid 
  }))
);

// Use with Suspense
<React.Suspense fallback={<div>Loading game board...</div>}>
  <HandDrawnGrid columns={3} rows={3} />
</React.Suspense>
```

### 2. Memoization

```tsx
// Memoize expensive components
const GameBoard = React.memo<GameBoardProps>(({ gameLogic }) => {
  // Component implementation
}, (prevProps, nextProps) => {
  // Custom comparison logic
  return (
    prevProps.gameLogic.board === nextProps.gameLogic.board &&
    prevProps.gameLogic.gameStatus === nextProps.gameLogic.gameStatus
  );
});
```

### 3. Virtual Rendering

For games with large grids, consider virtual rendering:

```tsx
// For large game boards
import { FixedSizeGrid } from 'react-window';

const VirtualGameBoard = ({ rows, columns, cellData }) => (
  <FixedSizeGrid
    height={400}
    width={400}
    columnCount={columns}
    rowCount={rows}
    columnWidth={40}
    rowHeight={40}
    itemData={cellData}
  >
    {({ columnIndex, rowIndex, style, data }) => (
      <div style={style}>
        <GameSymbol 
          symbol={data[rowIndex][columnIndex]}
          cellPosition={rowIndex * columns + columnIndex}
        />
      </div>
    )}
  </FixedSizeGrid>
);
```

## Deployment Considerations

### 1. Bundle Size Optimization

```typescript
// Use tree shaking to reduce bundle size
import { DualSystemProvider } from '@gpg/framework/dual-system';
import { PaperSheet } from '@gpg/framework/hand-drawn';
import { PlayerDisplay } from '@gpg/framework/modern-ui';
```

### 2. CSS Optimization

```css
/* Include only the CSS you need */
@import '@gpg/framework/styles/dual-system.css';
@import '@gpg/framework/styles/modern-ui.css';
/* Skip hand-drawn styles if not using animations */
```

### 3. Performance Monitoring

```tsx
// Add performance monitoring
import { useDualSystem } from '@gpg/framework';

export const usePerformanceMonitoring = () => {
  const { penStyle } = useDualSystem();
  
  useEffect(() => {
    // Monitor animation performance
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        console.log('Animation performance:', entry.duration);
      });
    });
    
    observer.observe({ entryTypes: ['measure'] });
    
    return () => observer.disconnect();
  }, [penStyle]);
};
```

## Next Steps

1. **Customize Components**: Extend the base components for your game's specific needs
2. **Add Multiplayer**: Integrate with your multiplayer infrastructure
3. **Implement AI**: Add sophisticated AI opponents
4. **Add Sounds**: Enhance with audio feedback
5. **Create Tutorials**: Build interactive tutorials using the dual system
6. **Performance Tune**: Optimize for your target devices
7. **A11y Enhancement**: Add comprehensive accessibility features

## Getting Help

- **Documentation**: Check the complete [API Reference](./API_REFERENCE.md)
- **Examples**: See working implementations in the `examples/` directory
- **Issues**: Report bugs or request features in the project repository
- **Community**: Join discussions in the project forums

## Migration from Legacy Systems

See the [Migration Guide](./MIGRATION_GUIDE.md) for detailed instructions on migrating from existing game frameworks to the dual design system.

---

This integration guide provides everything you need to successfully implement the dual design system in your games. Start with the basic setup and gradually add more advanced features as needed!