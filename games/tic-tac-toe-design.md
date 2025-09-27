# Tic-Tac-Toe Game Design Document

## Overview

This document outlines the design for our complete Tic-Tac-Toe implementation, which will be the first complete game built on the Graph Paper Games framework. This implementation will demonstrate all framework capabilities and serve as a reference for future games.

## Game Specifications

### Basic Rules
- 3x3 grid with alternating turns (X and O)
- First player to get 3 in a row (horizontal, vertical, or diagonal) wins
- Game ends in a draw if all cells are filled with no winner
- X always goes first

### Enhanced Features
- AI opponents with 6 difficulty levels (1-6)
- Move hints and analysis
- Game persistence (save/load)
- Move history and undo
- Replay system
- Performance analytics

## Architecture Design

### Directory Structure
```
games/tic-tac-toe/
├── package.json                 # Game package definition
├── src/
│   ├── engine.ts               # GameEngineAPI implementation
│   ├── ai.ts                   # GameAI implementation  
│   ├── component.tsx           # React game component
│   ├── types.ts                # Game-specific types
│   ├── utils.ts                # Game utilities
│   └── constants.ts            # Game constants
├── __tests__/
│   ├── engine.test.ts          # Engine unit tests
│   ├── ai.test.ts              # AI unit tests
│   ├── component.test.tsx      # Component tests
│   └── integration.test.ts     # Integration tests
└── README.md                   # Game documentation
```

## Type Definitions

### Game-Specific Types

```typescript
// Tic-Tac-Toe specific move
export interface TicTacToeMove extends Move {
  readonly type: 'place';
  readonly data: {
    readonly position: GridCoordinate;
    readonly symbol: 'X' | 'O';
  };
}

// Game state metadata
export interface TicTacToeMetadata {
  readonly boardState: ('X' | 'O' | null)[][];
  readonly winner?: 'X' | 'O';
  readonly winningLine?: {
    readonly start: GridCoordinate;
    readonly end: GridCoordinate;
    readonly type: 'horizontal' | 'vertical' | 'diagonal';
  };
  readonly isDraw: boolean;
  readonly moveHistory: readonly TicTacToeMove[];
}

// AI evaluation context
export interface PositionEvaluation {
  readonly score: number;
  readonly depth: number;
  readonly bestMove?: GridCoordinate;
  readonly principalVariation: readonly GridCoordinate[];
}
```

## Framework Integration

### GameEngineAPI Implementation

```typescript
export class TicTacToeEngine implements GameEngineAPI {
  createInitialState(settings: GameSettings, players: readonly Player[]): Result<GameState> {
    // Create 3x3 empty grid
    // Initialize metadata with empty board
    // Set first player (X)
  }

  validateMove(state: GameState, move: Move, playerId: string): ValidationResult {
    // Check if it's player's turn
    // Check if position is empty
    // Check if game is not over
  }

  applyMove(state: GameState, move: Move): Result<GameState> {
    // Place symbol on board
    // Update grid cells
    // Check for win/draw
    // Switch turns
    // Update metadata
  }

  isTerminal(state: GameState): GameOver | null {
    // Check for 3 in a row
    // Check for draw
    // Return game over result or null
  }

  evaluate(state: GameState): Scoreboard {
    // Calculate current scores
    // Determine winner/draw status
    // Return scoreboard
  }

  getLegalMoves(state: GameState, playerId: string): readonly Move[] {
    // Return all empty positions as valid moves
  }

  getAnnotations(state: GameState): readonly GameAnnotation[] {
    // Highlight winning line if game is over
    // Show last move
    // Show hints if enabled
  }
}
```

### GameAI Implementation

```typescript
export class TicTacToeAI implements GameAI {
  async getMove(
    state: GameState,
    difficulty: AIDifficulty,
    playerId: string,
    timeLimit?: number
  ): Promise<Result<Move>> {
    // Difficulty-based strategy:
    // 1: Random moves
    // 2: Block obvious wins, otherwise random
    // 3: Block and take obvious wins
    // 4: Minimax depth 2-3
    // 5: Minimax depth 4-5
    // 6: Perfect play (minimax full depth)
  }

  async getHint(state: GameState, playerId: string): Promise<Hint | null> {
    // Analyze position
    // Return best move with explanation
  }

  evaluatePosition(state: GameState, playerId: string): number {
    // Position evaluation for AI
    // +100 for win, -100 for loss, 0 for draw
    // Intermediate values for positions
  }
}
```

### React Component

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
  // Use GridRenderer for the 3x3 board
  // Handle cell clicks to make moves
  // Show game status and controls
  // Display winning line when game ends
};
```

## AI Difficulty Levels

### Level 1: Random (Beginner)
- Makes completely random legal moves
- No strategy or pattern recognition
- Perfect for absolute beginners

### Level 2: Defensive (Easy)  
- Random moves but will block obvious wins
- No offensive strategy
- Still makes many suboptimal moves

### Level 3: Basic Strategy (Medium-Easy)
- Will take winning moves when available
- Will block opponent wins
- Otherwise plays randomly
- Good for learning players

### Level 4: Smart Play (Medium)
- Uses minimax algorithm with depth 2-3
- Considers center and corner advantages
- Makes strategic opening moves
- Challenging for casual players

### Level 5: Expert (Hard)
- Minimax with depth 4-5
- Advanced position evaluation
- Strategic opening repertoire
- Difficult for experienced players

### Level 6: Perfect (Expert)
- Perfect play using full minimax
- Never loses, always wins or draws
- Optimal opening theory
- Impossible to beat

## Game States & Flow

### State Transitions
```
SETUP → PLAYING → (WIN | DRAW) → END

SETUP:
- Configure game settings
- Select AI difficulty
- Choose symbols/colors

PLAYING:
- Alternate turns
- Validate moves
- Update game state
- Check win conditions

WIN/DRAW:
- Display result
- Show winning line
- Update scores
- Offer replay

END:
- Game over
- Save to history
- Return to menu
```

### Move Validation Rules
1. Game must be in PLAYING state
2. Must be the player's turn
3. Target position must be empty
4. Move must be within grid bounds

### Win Conditions
- 3 in a row: horizontal, vertical, or diagonal
- Check all 8 possible lines:
  - Rows: (0,0)-(2,0), (0,1)-(2,1), (0,2)-(2,2)
  - Cols: (0,0)-(0,2), (1,0)-(1,2), (2,0)-(2,2)
  - Diagonals: (0,0)-(2,2), (2,0)-(0,2)

## Framework Component Integration

### GridRenderer Integration
- 3x3 grid with square cells
- Custom cell rendering for X/O symbols
- Highlight winning line
- Show hover effects for valid moves
- Theme support (paper, high contrast)

### TurnManager Integration
- Handle turn switching
- Move validation integration
- Timer support (optional)
- Undo functionality

### EventBus Integration
- Emit move events
- Game state change events
- AI thinking events
- Win/draw events

### GameHUD Integration
- Show current player
- Display game status
- Show move history
- Control buttons (undo, resign, hint)

## Performance Requirements

### Response Times
- Human moves: <50ms validation
- AI Level 1-3: <100ms response
- AI Level 4-5: <500ms response  
- AI Level 6: <1000ms response

### Memory Usage
- Minimal state storage
- Efficient board representation
- Optimal minimax with memoization

## Testing Strategy

### Unit Tests
- Engine logic (80+ tests)
- AI algorithm validation (30+ tests)
- Move validation (20+ tests)
- Win detection (15+ tests)

### Integration Tests
- Framework component interaction
- UI component integration
- Event system integration
- Persistence system

### Performance Tests
- AI response time benchmarks
- Memory usage profiling
- UI responsiveness testing

## Accessibility

### Visual Accessibility
- High contrast theme support
- Clear symbol differentiation
- Color-blind friendly indicators
- Screen reader support

### Input Accessibility
- Keyboard navigation
- Touch/click equivalence
- Focus management
- ARIA labels

## Internationalization

### Text Elements
- Game instructions
- Status messages
- Error messages
- AI difficulty labels

### Cultural Considerations
- Symbol preferences (X/O vs other)
- Right-to-left layout support
- Regional AI naming

## Implementation Phases

### Phase 2a: Core Engine (Week 1)
- Basic game engine implementation
- Move validation and state management
- Win/draw detection
- Unit test coverage

### Phase 2b: AI System (Week 2)  
- AI implementation for all 6 levels
- Minimax algorithm with pruning
- Performance optimization
- AI testing and validation

### Phase 2c: UI Integration (Week 3)
- React component implementation
- Framework integration
- GridRenderer customization
- Event handling

### Phase 2d: Polish & Testing (Week 4)
- Comprehensive testing
- Performance optimization
- Documentation
- Release preparation

## Success Metrics

### Technical Metrics
- 90%+ test coverage
- All AI levels respond within time limits
- Zero memory leaks
- Framework API compliance

### User Experience Metrics
- Intuitive gameplay
- Responsive interactions
- Clear game status
- Satisfying AI difficulty progression

### Quality Metrics
- No critical bugs
- Consistent visual design
- Accessibility compliance
- Professional documentation

This design will serve as our blueprint for implementing the first complete game on the Graph Paper Games framework, demonstrating all the capabilities we built in Phase 1.