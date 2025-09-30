# Graph Paper Games Framework Design

## Overview

The Graph Paper Games framework is a sophisticated, modular TypeScript/React framework designed to accelerate the development of turn-based, grid-based games. It provides a unified architecture that separates game logic from presentation, enabling rapid game development while maintaining consistency across all games.

## Core Architecture

### 🏗️ **Layered Architecture**

```
┌─────────────────────────────────────────────────────┐
│                   Web Applications                  │
│                  (apps/web)                        │
├─────────────────────────────────────────────────────┤
│                  Game Packages                      │
│              (games/tic-tac-toe, etc.)             │
├─────────────────────────────────────────────────────┤
│                    Framework                        │
│                (packages/framework)                 │
├─────────────────────────────────────────────────────┤
│                 Shared Utilities                    │
│                 (packages/shared)                   │
├─────────────────────────────────────────────────────┤
│              Backend Services (Future)              │
│          (services/game-server, ai-service)         │
└─────────────────────────────────────────────────────┘
```

### 🎯 **Design Principles**

1. **Separation of Concerns**: Game logic is isolated from presentation layer
2. **Type Safety**: Strict TypeScript with comprehensive type definitions
3. **Composability**: Modular components that can be mixed and matched
4. **Extensibility**: Plugin architecture for adding new games
5. **Consistency**: Standardized APIs and UI patterns across all games
6. **Performance**: Efficient rendering and state management
7. **Accessibility**: WCAG 2.1 compliant components and interactions

---

## 🔧 **Core Framework Components**

### 1. EventBus System (`packages/framework/src/event-bus.ts`)

**Purpose**: Provides decoupled communication between framework components, games, and UI elements.

**Key Features**:
- **Typed Events**: Strongly typed event system with topic-based organization
- **Wildcard Subscriptions**: Subscribe to event patterns (`game:*`, `ui:*`)
- **Error Handling**: Automatic error isolation in event listeners
- **React Integration**: `useEventBus` hook for component subscriptions

**Event Topics**:
- `game:*` - Game state changes, moves, turn changes
- `ui:*` - UI interactions, clicks, hovers  
- `net:*` - Network events, connections (future)
- `ai:*` - AI moves, hints, evaluations
- `system:*` - System events, errors, warnings

**Usage Example**:
```typescript
// Subscribe to game state changes
EventBus.subscribe('game:state-changed', (event) => {
  console.log('Game state updated:', event.data.gameState);
});

// Emit a UI event
EventBus.emit(createEvent.ui('ui:click', {
  coordinate: { x: 1, y: 2 },
  timestamp: new Date().toISOString()
}));

// React hook usage
useEventBus('game:*', (event) => {
  // Handle all game events
}, []);
```

### 2. TurnManager (`packages/framework/src/turn-manager.ts`)

**Purpose**: Manages turn-based game flow, including turn transitions, timers, validation, and undo functionality.

**Key Features**:
- **Phase Management**: Pre-turn, move, post-turn, and ended phases
- **Turn Timers**: Configurable per-turn and per-game time limits
- **Undo System**: Configurable undo stack with depth limits
- **Move Validation**: Integration with game engine for move validation
- **Player Management**: Automatic turn progression and inactive player handling
- **Event Integration**: Emits events for all turn transitions

**Configuration**:
```typescript
const config: TurnManagerConfig = {
  allowUndo: true,
  maxUndoDepth: 3,
  enableTimer: true,
  timerConfig: {
    enabled: true,
    timePerTurn: 30, // seconds
    timePerGame: 600, // 10 minutes total
    increment: 5 // 5 seconds added per move
  },
  skipInactivePlayers: true
};
```

**React Hook Usage**:
```typescript
const {
  turnManager,
  turnInfo,
  gameState,
  makeMove,
  undoMove,
  skipTurn
} = useTurnManager(gameEngine, initialState, config);
```

### 3. GridRenderer (`packages/framework/src/components/GridRenderer.tsx`)

**Purpose**: High-performance Canvas-based grid rendering system supporting various grid types and themes.

**Key Features**:
- **Multiple Grid Types**: Square, hexagonal, triangular (extensible)
- **Theme System**: Customizable colors, sizes, and visual styles
- **Paper Texture**: Optional paper-like background for authentic feel
- **Interactive**: Click and hover event handling with coordinate mapping
- **Annotations**: Support for highlights, text, arrows, and areas
- **Accessibility**: High contrast themes and keyboard navigation support
- **Custom Renderers**: Pluggable cell rendering functions

**Theme Example**:
```typescript
const customTheme: GridTheme = {
  gridColor: '#d4d4d8',
  gridWidth: 1,
  backgroundColor: '#fafafa',
  cellSize: 32,
  cellPadding: 2,
  emptyCellColor: 'transparent',
  occupiedCellColor: '#3b82f6',
  highlightedCellColor: '#fbbf24',
  disabledCellColor: '#9ca3af',
  textColor: '#374151',
  fontSize: 12,
  borderRadius: 2,
  paperTexture: true
};
```

**Usage**:
```tsx
<GridRenderer
  grid={gameState.grid}
  theme={paperTheme}
  annotations={gameEngine.getAnnotations?.(gameState)}
  onCellClick={(coord, cell) => handleCellClick(coord)}
  onCellHover={(coord, cell) => showCellInfo(coord)}
  renderCell={customCellRenderer}
  interactive={isMyTurn}
/>
```

### 4. GameHUD (`packages/framework/src/components/GameHUD.tsx`)

**Purpose**: Standardized heads-up display for game information, controls, and player status.

**Key Features**:
- **Player Information**: Avatar, name, AI indicator, scores, rankings
- **Turn Timer**: Visual countdown with urgency indicators
- **Game Controls**: Undo, skip turn, resign buttons
- **Game Status**: Turn number, phase, winner announcements
- **Responsive Design**: Adapts to different screen sizes

**Usage**:
```tsx
<GameHUD
  turnInfo={turnInfo}
  scoreboard={gameEngine.evaluate(gameState)}
  showTimer={config.enableTimer}
  showUndoButton={config.allowUndo}
  onUndo={() => undoMove()}
  onSkipTurn={() => skipTurn()}
  onResign={() => handleResign()}
/>
```

---

## 📦 **Shared Package Architecture**

### Type System (`packages/shared/src/types.ts`)

**Core Types**:
- **Grid System**: `GridCoordinate`, `GridCell`, `Grid`, `GridType`
- **Player System**: `Player`, `PlayerRef`, `PlayerScore`, `Scoreboard`
- **Game State**: `GameState`, `Move`, `GameSettings`, `GameOver`
- **AI System**: `AIDifficulty`, `Hint`, `MoveEvaluation`
- **Events**: `GameEvent`, `EventListener`
- **Error Handling**: `Result<T>`, `GameError`, `ValidationResult`

### Game Engine API (`packages/shared/src/game-engine.ts`)

**Core Interface**: All games must implement `GameEngineAPI`

**Required Methods**:
```typescript
interface GameEngineAPI {
  // Lifecycle
  createInitialState(settings: GameSettings, players: Player[]): Result<GameState>;
  validateMove(state: GameState, move: Move, playerId: string): ValidationResult;
  applyMove(state: GameState, move: Move): Result<GameState>;
  isTerminal(state: GameState): GameOver | null;
  evaluate(state: GameState): Scoreboard;
  
  // Optional
  getLegalMoves?(state: GameState, playerId: string): readonly Move[];
  getAnnotations?(state: GameState): readonly GameAnnotation[];
  getHint?(state: GameState, playerId: string): Hint | null;
  serializeState?(state: GameState): string;
  deserializeState?(serialized: string): Result<GameState>;
}
```

**Game Module Interface**:
```typescript
interface GameModule {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly capabilities: GameCapabilities;
  
  readonly engine: GameEngineAPI;
  readonly ai?: GameAI;
  readonly component: ComponentType<GameProps>;
}
```

---

## 🎮 **Game Development Guide**

### Step 1: Define Game-Specific Types

Create a `types.ts` file with game-specific interfaces:

```typescript
// games/my-game/src/types.ts
import type { Move, GridCoordinate } from '@gpg/shared';

export interface MyGameMove extends Move {
  type: 'place' | 'move' | 'special';
  data: {
    from?: GridCoordinate;
    to: GridCoordinate;
    piece?: string;
  };
}

export interface MyGameMetadata {
  board: MyGameBoard;
  lastMove?: MyGameMove;
  winner?: string;
  // ... other game-specific data
}
```

### Step 2: Implement Game Engine

Create an `engine.ts` file implementing `GameEngineAPI`:

```typescript
// games/my-game/src/engine.ts
import type { GameEngineAPI, GameState, /* ... */ } from '@gpg/shared';

export class MyGameEngine implements GameEngineAPI {
  createInitialState(settings: GameSettings, players: Player[]): Result<GameState> {
    // Create initial board state
    // Validate settings and players
    // Return initial GameState
  }
  
  validateMove(state: GameState, move: Move, playerId: string): ValidationResult {
    // Check if move is legal
    // Validate player turn
    // Return validation result
  }
  
  applyMove(state: GameState, move: Move): Result<GameState> {
    // Apply move to create new state
    // Update grid representation
    // Check for game end conditions
    // Return new GameState
  }
  
  isTerminal(state: GameState): GameOver | null {
    // Check win conditions
    // Check draw conditions
    // Return GameOver or null
  }
  
  evaluate(state: GameState): Scoreboard {
    // Calculate scores for all players
    // Determine rankings
    // Return scoreboard
  }
  
  // Optional methods
  getLegalMoves(state: GameState, playerId: string): readonly Move[] {
    // Return all valid moves for player
  }
  
  getAnnotations(state: GameState): readonly GameAnnotation[] {
    // Return UI annotations (highlights, etc.)
  }
}
```

### Step 3: Implement AI (Optional)

Create an `ai.ts` file implementing `GameAI`:

```typescript
// games/my-game/src/ai.ts
import type { GameAI, GameState, AIDifficulty } from '@gpg/shared';

export class MyGameAI implements GameAI {
  async getMove(
    state: GameState, 
    difficulty: AIDifficulty, 
    playerId: string, 
    timeLimit?: number
  ): Promise<Result<Move>> {
    // Implement AI algorithms (minimax, MCTS, etc.)
    // Scale difficulty (depth, randomness, etc.)
    // Return best move within time limit
  }
  
  async getHint(state: GameState, playerId: string): Promise<Hint | null> {
    // Generate helpful hint for human players
    // Include explanation and confidence
  }
}
```

### Step 4: Create Game Component

Create a React component for game rendering:

```tsx
// games/my-game/src/GameComponent.tsx
import React from 'react';
import type { GameProps } from '@gpg/shared';
import { GridRenderer, useEventBus } from '@gpg/framework';

const MyGameComponent: React.FC<GameProps> = ({
  gameState,
  currentPlayer,
  isMyTurn,
  onMove,
  settings
}) => {
  const handleCellClick = (coord: GridCoordinate, cell: GridCell) => {
    if (!isMyTurn) return;
    
    // Create and validate move
    const move = createMyGameMove(coord, currentPlayer.id);
    onMove(move);
  };
  
  return (
    <div className="my-game">
      <GridRenderer
        grid={gameState.grid!}
        onCellClick={handleCellClick}
        interactive={isMyTurn}
        annotations={getGameAnnotations(gameState)}
      />
      {/* Additional game-specific UI */}
    </div>
  );
};
```

### Step 5: Create Game Module

Export the complete game module:

```typescript
// games/my-game/src/index.ts
import type { GameModule } from '@gpg/shared';
import { MyGameEngine } from './engine';
import { MyGameAI } from './ai';
import { MyGameComponent } from './GameComponent';

export const MyGameModule: GameModule = {
  id: 'my-game',
  name: 'My Game',
  version: '1.0.0',
  description: 'Description of my awesome game',
  categories: ['strategy', 'grid'],
  capabilities: {
    grid: 'square',
    minPlayers: 2,
    maxPlayers: 4,
    supportsAI: true,
    supportsOnline: true,
    supportsLocal: true,
    estimatedDuration: 15 // minutes
  },
  engine: new MyGameEngine(),
  ai: new MyGameAI(),
  component: MyGameComponent
};

// Export everything for external use
export * from './types';
export * from './engine';
export * from './ai';
```

---

## 🔄 **Integration Patterns**

### Web App Integration

Games integrate with the web application through:

1. **Route Configuration**:
```tsx
// apps/web/src/App.tsx
<Route path="/games/my-game" element={<MyGameSetup />} />
<Route path="/games/my-game/play" element={<MyGamePlay />} />
```

2. **Game Setup Pages**:
```tsx
// apps/web/src/pages/MyGameSetup.tsx
const MyGameSetup: React.FC = () => {
  // Configure game settings
  // Select players and AI difficulty
  // Navigate to game play page
};
```

3. **Game Play Pages**:
```tsx
// apps/web/src/pages/MyGamePlay.tsx
const MyGamePlay: React.FC = () => {
  const [engine] = useState(() => new MyGameEngine());
  const [ai] = useState(() => new MyGameAI());
  
  const {
    turnManager,
    turnInfo,
    gameState,
    makeMove
  } = useTurnManager(engine, initialState);
  
  return (
    <div className="game-layout">
      <GameHUD turnInfo={turnInfo} />
      <MyGameComponent 
        gameState={gameState}
        onMove={makeMove}
        // ... other props
      />
    </div>
  );
};
```

### Framework Usage Patterns

**1. State Management**:
```typescript
// Use TurnManager for automatic turn handling
const { makeMove, undoMove } = useTurnManager(engine, initialState);

// Or manage manually for custom flows
const [gameState, setGameState] = useState(initialState);
const handleMove = async (move: Move) => {
  const result = engine.applyMove(gameState, move);
  if (result.success) {
    setGameState(result.data);
  }
};
```

**2. Event Handling**:
```typescript
// Listen for game events
useEventBus('game:move', (event) => {
  // Update UI, play sounds, etc.
});

// Emit custom events
EventBus.emit(createEvent.ui('ui:cell-hover', {
  coordinate: { x, y },
  piece: 'queen'
}));
```

**3. AI Integration**:
```typescript
// Trigger AI moves
const handleAIMove = async () => {
  const aiMove = await ai.getMove(gameState, difficulty, playerId);
  if (aiMove.success) {
    await makeMove(aiMove.data);
  }
};

// Get hints for human players
const hint = await ai.getHint(gameState, playerId);
if (hint) {
  showHintDialog(hint.explanation);
}
```

---

## 🎨 **Styling and Theming**

### CSS Architecture

The framework uses a modular CSS approach:

```scss
// Base framework styles
@import '@gpg/framework/styles/base';
@import '@gpg/framework/styles/components';

// Game-specific styles
.my-game {
  .board {
    // Game board styles
  }
  
  .piece {
    // Game piece styles
  }
}
```

### Theme System

Games can customize appearance through themes:

```typescript
const darkTheme: GridTheme = {
  ...paperTheme,
  backgroundColor: '#1a1a1a',
  gridColor: '#404040',
  textColor: '#ffffff',
  paperTexture: false
};

const gameTheme = settings.darkMode ? darkTheme : paperTheme;
```

---

## 🧪 **Testing Patterns**

### Engine Testing

```typescript
// games/my-game/__tests__/engine.test.ts
describe('MyGameEngine', () => {
  let engine: MyGameEngine;
  
  beforeEach(() => {
    engine = new MyGameEngine();
  });
  
  it('creates valid initial state', () => {
    const result = engine.createInitialState(settings, players);
    expect(result.success).toBe(true);
    expect(result.data.players).toHaveLength(2);
  });
  
  it('validates moves correctly', () => {
    const validation = engine.validateMove(state, validMove, playerId);
    expect(validation.isValid).toBe(true);
    
    const invalidValidation = engine.validateMove(state, invalidMove, playerId);
    expect(invalidValidation.isValid).toBe(false);
  });
  
  it('detects game end conditions', () => {
    const terminal = engine.isTerminal(winningState);
    expect(terminal).not.toBeNull();
    expect(terminal!.winner).toBe('player1');
  });
});
```

### Component Testing

```typescript
// games/my-game/__tests__/GameComponent.test.tsx
describe('MyGameComponent', () => {
  it('renders game board correctly', () => {
    render(
      <MyGameComponent
        gameState={mockGameState}
        currentPlayer={mockPlayer}
        isMyTurn={true}
        onMove={jest.fn()}
        settings={mockSettings}
      />
    );
    
    expect(screen.getByRole('grid')).toBeInTheDocument();
  });
  
  it('handles cell clicks when it\'s player turn', () => {
    const onMove = jest.fn();
    render(<MyGameComponent {...props} onMove={onMove} isMyTurn={true} />);
    
    fireEvent.click(screen.getByTestId('cell-0-0'));
    expect(onMove).toHaveBeenCalledWith(expect.objectContaining({
      type: 'place',
      data: { position: { x: 0, y: 0 } }
    }));
  });
});
```

---

## 🚀 **Performance Considerations**

### Rendering Optimization

1. **Canvas Rendering**: GridRenderer uses Canvas for efficient grid rendering
2. **Event Throttling**: Mouse events are throttled to prevent excessive updates
3. **Memoization**: React components use `useMemo` and `useCallback` appropriately
4. **State Immutability**: Game states are immutable to enable efficient diffing

### Memory Management

1. **Event Cleanup**: EventBus subscriptions are automatically cleaned up
2. **Timer Management**: TurnManager clears timers on component unmount
3. **AI Resource Limits**: AI calculations respect time limits and can be cancelled

### Scalability

1. **Lazy Loading**: Games are loaded on-demand
2. **Code Splitting**: Each game package is separately bundled
3. **Progressive Enhancement**: Basic functionality works without JavaScript

---

## 🔮 **Future Extensions**

### Planned Framework Enhancements

1. **Multiplayer Support**:
   - Real-time synchronization via WebSockets
   - Spectator mode
   - Tournament systems

2. **Enhanced AI**:
   - Pluggable AI strategies
   - Machine learning integration
   - Difficulty adaptation

3. **Analytics**:
   - Game performance metrics
   - Player behavior tracking
   - A/B testing framework

4. **Mobile Optimization**:
   - Touch gesture support
   - Responsive design improvements
   - PWA capabilities

---

## 📚 **Resources and Examples**

### Reference Implementation

The **Tic-Tac-Toe** game (`games/tic-tac-toe/`) serves as the canonical reference implementation, demonstrating:
- Complete GameEngineAPI implementation
- AI with multiple difficulty levels
- Comprehensive test coverage
- React component integration
- Move validation and game end detection
- State serialization/deserialization

### Framework Components

Study these components for advanced usage:
- `EventBus` - Event-driven architecture
- `TurnManager` - Turn-based game flow
- `GridRenderer` - High-performance grid rendering
- `GameHUD` - Standardized game UI

### Development Tools

- **TypeScript Strict Mode**: Enforces type safety
- **ESLint + Prettier**: Code quality and formatting
- **Vitest**: Fast unit testing
- **Testing Library**: Component testing
- **Storybook** (planned): Component documentation

The framework provides a robust foundation for rapid game development while maintaining consistency, performance, and extensibility across all games in the Graph Paper Games suite.