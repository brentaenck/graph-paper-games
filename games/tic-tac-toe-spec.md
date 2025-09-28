# Tic-Tac-Toe Technical Implementation Specification

## Overview

Technical specification for implementing Tic-Tac-Toe game following the Graph
Paper Games framework architecture.

## GameModule Configuration

```typescript
export const TicTacToeModule: GameModule = {
  id: 'tic-tac-toe',
  name: 'Tic-Tac-Toe',
  version: '1.0.0',
  description: 'Classic 3x3 grid game with AI opponents',
  categories: ['classic', 'strategy', 'quick-play'],
  capabilities: {
    grid: 'square',
    minPlayers: 1, // vs AI
    maxPlayers: 2, // PvP
    supportsAI: true,
    supportsOnline: false, // Phase 2 scope
    supportsLocal: true,
    estimatedDuration: 2, // minutes
  },
  engine: new TicTacToeEngine(),
  ai: new TicTacToeAI(),
  component: TicTacToeGame,
};
```

## Core Engine Implementation Details

### Board Representation

```typescript
// Internal board state (efficient for AI)
type BoardState = ('X' | 'O' | null)[][];

// Winning line patterns (0-indexed positions)
const WINNING_LINES: readonly [number, number, number][] = [
  // Rows
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  // Columns
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  // Diagonals
  [0, 4, 8],
  [2, 4, 6],
];

// Convert 2D coordinate to 1D index
function coordToIndex(coord: GridCoordinate): number {
  return coord.y * 3 + coord.x;
}

// Convert 1D index to 2D coordinate
function indexToCoord(index: number): GridCoordinate {
  return { x: index % 3, y: Math.floor(index / 3) };
}
```

### Move Validation Logic

```typescript
validateMove(state: GameState, move: Move, playerId: string): ValidationResult {
  // Cast to game-specific move type
  const ticMove = move as TicTacToeMove;

  // Basic validations
  if (ticMove.type !== 'place') {
    return { isValid: false, error: 'Invalid move type', code: 'INVALID_MOVE' };
  }

  // Check player turn
  const currentPlayerIndex = state.currentPlayer;
  const currentPlayer = state.players[currentPlayerIndex];
  if (currentPlayer.id !== playerId) {
    return { isValid: false, error: 'Not your turn', code: 'NOT_YOUR_TURN' };
  }

  // Check game not over
  if (this.isTerminal(state)) {
    return { isValid: false, error: 'Game is over', code: 'GAME_OVER' };
  }

  // Check position bounds
  const pos = ticMove.data.position;
  if (pos.x < 0 || pos.x > 2 || pos.y < 0 || pos.y > 2) {
    return { isValid: false, error: 'Position out of bounds', code: 'INVALID_MOVE' };
  }

  // Check position empty
  const metadata = state.metadata as TicTacToeMetadata;
  if (metadata.boardState[pos.y][pos.x] !== null) {
    return { isValid: false, error: 'Position already occupied', code: 'INVALID_MOVE' };
  }

  return { isValid: true };
}
```

### Win Detection Algorithm

```typescript
function checkWin(boardState: BoardState): {
  winner: 'X' | 'O' | null;
  winningLine?: { start: GridCoordinate; end: GridCoordinate; type: string };
} {
  // Check each winning line
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    const coordA = indexToCoord(a);
    const coordB = indexToCoord(b);
    const coordC = indexToCoord(c);

    const cellA = boardState[coordA.y][coordA.x];
    const cellB = boardState[coordB.y][coordB.x];
    const cellC = boardState[coordC.y][coordC.x];

    if (cellA && cellA === cellB && cellB === cellC) {
      return {
        winner: cellA,
        winningLine: {
          start: coordA,
          end: coordC,
          type: getLineType(a, c),
        },
      };
    }
  }

  return { winner: null };
}

function getLineType(start: number, end: number): string {
  // Row: same y coordinate
  if (Math.floor(start / 3) === Math.floor(end / 3)) return 'horizontal';
  // Column: same x coordinate
  if (start % 3 === end % 3) return 'vertical';
  // Diagonal
  return 'diagonal';
}
```

## AI Implementation Details

### Minimax Algorithm

```typescript
interface MinimaxResult {
  score: number;
  move?: GridCoordinate;
  nodesEvaluated: number;
}

class TicTacToeAI implements GameAI {
  private memoCache = new Map<string, MinimaxResult>();

  async getMove(
    state: GameState,
    difficulty: AIDifficulty,
    playerId: string
  ): Promise<Result<Move>> {
    const metadata = state.metadata as TicTacToeMetadata;
    const symbol = this.getPlayerSymbol(state, playerId);

    let move: GridCoordinate;

    switch (difficulty) {
      case 1:
        move = this.getRandomMove(metadata.boardState);
        break;
      case 2:
        move = this.getDefensiveMove(metadata.boardState, symbol);
        break;
      case 3:
        move = this.getBasicStrategyMove(metadata.boardState, symbol);
        break;
      case 4:
        move = this.getMinimaxMove(metadata.boardState, symbol, 3);
        break;
      case 5:
        move = this.getMinimaxMove(metadata.boardState, symbol, 5);
        break;
      case 6:
        move = this.getMinimaxMove(metadata.boardState, symbol, 9); // Full depth
        break;
    }

    return ok(this.createMove(move, symbol, playerId));
  }

  private minimax(
    board: BoardState,
    depth: number,
    isMaximizing: boolean,
    alpha: number,
    beta: number,
    maximizingSymbol: 'X' | 'O'
  ): MinimaxResult {
    // Create cache key
    const cacheKey = this.getBoardHash(board) + depth + isMaximizing;
    if (this.memoCache.has(cacheKey)) {
      return this.memoCache.get(cacheKey)!;
    }

    const winner = checkWin(board).winner;

    // Terminal states
    if (winner === maximizingSymbol)
      return { score: 10 + depth, nodesEvaluated: 1 };
    if (winner && winner !== maximizingSymbol)
      return { score: -10 - depth, nodesEvaluated: 1 };
    if (this.isBoardFull(board)) return { score: 0, nodesEvaluated: 1 };
    if (depth === 0)
      return {
        score: this.evaluatePosition(board, maximizingSymbol),
        nodesEvaluated: 1,
      };

    let bestMove: GridCoordinate | undefined;
    let totalNodes = 1;

    if (isMaximizing) {
      let maxScore = -Infinity;

      for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 3; x++) {
          if (board[y][x] === null) {
            board[y][x] = maximizingSymbol;
            const result = this.minimax(
              board,
              depth - 1,
              false,
              alpha,
              beta,
              maximizingSymbol
            );
            board[y][x] = null;

            totalNodes += result.nodesEvaluated;

            if (result.score > maxScore) {
              maxScore = result.score;
              bestMove = { x, y };
            }

            alpha = Math.max(alpha, result.score);
            if (beta <= alpha) break; // Pruning
          }
        }
      }

      const result = {
        score: maxScore,
        move: bestMove,
        nodesEvaluated: totalNodes,
      };
      this.memoCache.set(cacheKey, result);
      return result;
    } else {
      let minScore = Infinity;
      const opponentSymbol = maximizingSymbol === 'X' ? 'O' : 'X';

      for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 3; x++) {
          if (board[y][x] === null) {
            board[y][x] = opponentSymbol;
            const result = this.minimax(
              board,
              depth - 1,
              true,
              alpha,
              beta,
              maximizingSymbol
            );
            board[y][x] = null;

            totalNodes += result.nodesEvaluated;

            if (result.score < minScore) {
              minScore = result.score;
            }

            beta = Math.min(beta, result.score);
            if (beta <= alpha) break; // Pruning
          }
        }
      }

      const result = { score: minScore, nodesEvaluated: totalNodes };
      this.memoCache.set(cacheKey, result);
      return result;
    }
  }
}
```

### AI Strategy Implementation

```typescript
// Level 2: Defensive AI
private getDefensiveMove(board: BoardState, symbol: 'X' | 'O'): GridCoordinate {
  const opponent = symbol === 'X' ? 'O' : 'X';

  // Check if opponent can win next turn and block
  for (let y = 0; y < 3; y++) {
    for (let x = 0; x < 3; x++) {
      if (board[y][x] === null) {
        board[y][x] = opponent;
        if (checkWin(board).winner === opponent) {
          board[y][x] = null;
          return { x, y };
        }
        board[y][x] = null;
      }
    }
  }

  // Otherwise random move
  return this.getRandomMove(board);
}

// Level 3: Basic Strategy
private getBasicStrategyMove(board: BoardState, symbol: 'X' | 'O'): GridCoordinate {
  const opponent = symbol === 'X' ? 'O' : 'X';

  // 1. Take winning move if available
  for (let y = 0; y < 3; y++) {
    for (let x = 0; x < 3; x++) {
      if (board[y][x] === null) {
        board[y][x] = symbol;
        if (checkWin(board).winner === symbol) {
          board[y][x] = null;
          return { x, y };
        }
        board[y][x] = null;
      }
    }
  }

  // 2. Block opponent win
  for (let y = 0; y < 3; y++) {
    for (let x = 0; x < 3; x++) {
      if (board[y][x] === null) {
        board[y][x] = opponent;
        if (checkWin(board).winner === opponent) {
          board[y][x] = null;
          return { x, y };
        }
        board[y][x] = null;
      }
    }
  }

  // 3. Take center if available
  if (board[1][1] === null) {
    return { x: 1, y: 1 };
  }

  // 4. Take corners
  const corners = [{ x: 0, y: 0 }, { x: 2, y: 0 }, { x: 0, y: 2 }, { x: 2, y: 2 }];
  for (const corner of corners) {
    if (board[corner.y][corner.x] === null) {
      return corner;
    }
  }

  // 5. Random move
  return this.getRandomMove(board);
}
```

## React Component Implementation

### Main Game Component

```typescript
export const TicTacToeGame: React.FC<GameProps> = ({
  gameState,
  currentPlayer,
  isMyTurn,
  onMove,
  onUndo,
  onResign,
  settings
}) => {
  const metadata = gameState.metadata as TicTacToeMetadata;
  const [selectedCell, setSelectedCell] = useState<GridCoordinate | null>(null);
  const [showHint, setShowHint] = useState(false);

  // Handle cell clicks
  const handleCellClick = useCallback((coordinate: GridCoordinate) => {
    if (!isMyTurn) return;
    if (metadata.boardState[coordinate.y][coordinate.x] !== null) return;

    const symbol = getPlayerSymbol(gameState, currentPlayer.id);
    const move: TicTacToeMove = {
      id: generateMoveId(),
      playerId: currentPlayer.id,
      timestamp: new Date(),
      type: 'place',
      data: { position: coordinate, symbol }
    };

    onMove(move);
  }, [isMyTurn, metadata.boardState, gameState, currentPlayer.id, onMove]);

  // Custom cell renderer for X/O symbols
  const renderCell = useCallback((
    ctx: CanvasRenderingContext2D,
    cell: GridCell,
    x: number,
    y: number,
    size: number,
    theme: GridTheme
  ) => {
    // Draw base cell
    ctx.fillStyle = theme.emptyCellColor;
    ctx.fillRect(x, y, size, size);

    // Get symbol from metadata
    const coord = cell.coordinate;
    const symbol = metadata.boardState[coord.y][coord.x];

    if (symbol) {
      ctx.fillStyle = symbol === 'X' ? '#e74c3c' : '#3498db';
      ctx.font = `bold ${size * 0.6}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(symbol, x + size / 2, y + size / 2);
    }

    // Highlight winning line
    if (metadata.winningLine && isPartOfWinningLine(coord, metadata.winningLine)) {
      ctx.strokeStyle = '#f1c40f';
      ctx.lineWidth = 4;
      ctx.strokeRect(x + 2, y + 2, size - 4, size - 4);
    }
  }, [metadata]);

  return (
    <div className="tic-tac-toe-game">
      <div className="game-header">
        <h2>Tic-Tac-Toe</h2>
        <div className="current-player">
          Current Player: {currentPlayer.name} ({getPlayerSymbol(gameState, currentPlayer.id)})
        </div>
      </div>

      <GridRenderer
        grid={gameState.grid!}
        interactive={isMyTurn}
        onCellClick={handleCellClick}
        renderCell={renderCell}
        theme={THEME_CONFIGS.paper}
        annotations={[]}
      />

      <div className="game-controls">
        <button onClick={onUndo} disabled={!canUndo(gameState)}>
          Undo Move
        </button>
        <button onClick={() => setShowHint(!showHint)}>
          {showHint ? 'Hide' : 'Show'} Hint
        </button>
        <button onClick={onResign}>
          Resign
        </button>
      </div>

      {metadata.winner && (
        <div className="game-result">
          {metadata.isDraw ? "It's a draw!" : `${metadata.winner} wins!`}
        </div>
      )}
    </div>
  );
};
```

## File Structure Implementation

```
games/tic-tac-toe/
├── package.json
├── src/
│   ├── index.ts                 # Export game module
│   ├── engine.ts               # TicTacToeEngine class
│   ├── ai.ts                   # TicTacToeAI class
│   ├── component.tsx           # TicTacToeGame component
│   ├── types.ts                # Game-specific type definitions
│   ├── utils.ts                # Utility functions
│   └── constants.ts            # Game constants and configs
└── __tests__/
    ├── engine.test.ts          # Engine unit tests
    ├── ai.test.ts              # AI behavior tests
    ├── component.test.tsx      # Component tests
    └── integration.test.ts     # End-to-end tests
```

This specification provides the detailed implementation blueprint for our
complete Tic-Tac-Toe game, ensuring it fully integrates with our Graph Paper
Games framework while demonstrating all the capabilities we built in Phase 1.
