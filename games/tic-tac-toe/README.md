# Tic-Tac-Toe Game

Classic 3x3 Tic-Tac-Toe implementation for the Graph Paper Games framework.

## Overview

This is a complete implementation of Tic-Tac-Toe featuring:

- **Complete GameEngineAPI Implementation**: Full compliance with the framework's game engine interface
- **AI Support**: Ready for AI opponents (AI implementation in separate module)
- **Framework Integration**: Uses GridRenderer, EventBus, and TurnManager
- **Comprehensive Testing**: 90%+ test coverage with unit and integration tests
- **TypeScript**: Fully typed with strict mode compliance
- **Serialization**: Save/load game state support

## Features

### Core Gameplay
- Standard 3x3 grid Tic-Tac-Toe rules
- X always goes first
- Win detection for rows, columns, and diagonals
- Draw detection when board is full
- Move validation and error handling

### Framework Integration
- Uses framework's Grid system for rendering
- Events emitted via EventBus for game state changes
- Compatible with TurnManager for turn handling
- Annotations for highlighting winning lines and last moves

### Developer Features
- Comprehensive API following GameEngineAPI specification
- Utility functions for board manipulation and analysis
- Serialization/deserialization for game persistence
- Extensive test coverage

## Installation

```bash
# Install dependencies
pnpm install

# Build the package
pnpm build

# Run tests
pnpm test

# Run with coverage
pnpm test:coverage

# Type checking
pnpm typecheck

# Linting
pnpm lint
```

## Usage

### Basic Game Engine

```typescript
import { TicTacToeEngine } from '@gpg/tic-tac-toe';

const engine = new TicTacToeEngine();

// Create initial state
const settings = {
  gameType: 'tic-tac-toe',
  playerCount: 2,
  enableAI: false
};

const players = [
  { id: 'player1', name: 'Player 1', isAI: false, score: 0, isActive: true },
  { id: 'player2', name: 'Player 2', isAI: false, score: 0, isActive: true }
];

const initialState = engine.createInitialState(settings, players);

// Make a move
const move = createMove({ x: 1, y: 1 }, 'X', 'player1');
const validation = engine.validateMove(initialState.data, move, 'player1');

if (validation.isValid) {
  const newState = engine.applyMove(initialState.data, move);
  // Game state updated
}
```

### Utility Functions

```typescript
import { 
  createEmptyBoard, 
  checkWin, 
  isDraw, 
  getEmptyPositions 
} from '@gpg/tic-tac-toe';

// Create empty board
const board = createEmptyBoard();

// Check for wins
const winResult = checkWin(board);
if (winResult.winner) {
  console.log(`${winResult.winner} wins!`);
  console.log(`Winning line: ${winResult.winningLine?.type}`);
}

// Check for draw
if (isDraw(board)) {
  console.log('Game is a draw!');
}

// Get available moves
const emptyPositions = getEmptyPositions(board);
```

## API Reference

### TicTacToeEngine

Implements `GameEngineAPI` interface with the following methods:

#### Core Methods
- `createInitialState(settings, players)`: Creates initial game state
- `validateMove(state, move, playerId)`: Validates a proposed move
- `applyMove(state, move)`: Applies a validated move to the game state
- `isTerminal(state)`: Checks if game has ended (win/draw)
- `evaluate(state)`: Returns current scoreboard

#### Optional Methods
- `getLegalMoves(state, playerId)`: Returns all valid moves for a player
- `getAnnotations(state)`: Returns UI annotations (winning lines, last move)
- `serializeState(state)`: Converts game state to string
- `deserializeState(serialized)`: Recreates game state from string

### Types

#### TicTacToeMove
```typescript
interface TicTacToeMove extends Move {
  readonly type: 'place';
  readonly data: {
    readonly position: GridCoordinate;
    readonly symbol: 'X' | 'O';
  };
}
```

#### TicTacToeMetadata
```typescript
interface TicTacToeMetadata {
  readonly boardState: BoardState;
  readonly winner?: 'X' | 'O';
  readonly winningLine?: WinningLine;
  readonly isDraw: boolean;
  readonly moveHistory: readonly TicTacToeMove[];
  readonly lastMove?: TicTacToeMove;
}
```

#### BoardState
```typescript
type BoardState = ('X' | 'O' | null)[][];
```

## Testing

The package includes comprehensive tests:

- **Engine Tests**: Complete GameEngineAPI compliance
- **Utility Tests**: All helper functions
- **Integration Tests**: Framework integration
- **Coverage**: 90%+ test coverage target

Run tests with:

```bash
pnpm test          # Run all tests
pnpm test:watch    # Watch mode
pnpm test:coverage # With coverage report
```

## Performance

### Benchmarks
- Move validation: <10ms
- Move application: <20ms
- Win detection: <5ms
- State serialization: <50ms

### Memory Usage
- Empty game state: ~2KB
- Full game with history: ~8KB
- Minimal memory allocations during gameplay

## Framework Compliance

This implementation fully complies with the Graph Paper Games framework:

- ✅ Implements GameEngineAPI interface
- ✅ Uses standardized Grid and GridCoordinate types
- ✅ Compatible with EventBus for game events
- ✅ Works with TurnManager for turn handling
- ✅ Supports GridRenderer for visualization
- ✅ Provides annotations for UI overlays
- ✅ Includes serialization for game persistence

## Contributing

When contributing to this game implementation:

1. Maintain 90%+ test coverage
2. Follow TypeScript strict mode
3. Add JSDoc documentation for public APIs
4. Test framework integration
5. Ensure performance benchmarks are met

## License

MIT License - see the main project LICENSE file.