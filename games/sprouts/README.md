# Sprouts Game

A topological connection game with curve drawing invented by mathematicians John Conway and Michael Paterson in 1967.

## Game Overview

**Sprouts** is a fascinating mathematical game that combines topology, strategy, and visual artistry. Players take turns drawing curves between points, creating an ever-evolving network of connections until no more legal moves remain.

### Game Rules

1. **Setup**: Start with a small number of dots (typically 2-6)
2. **Turn Structure**: Players alternate turns
3. **Move Requirements**: On each turn, a player must:
   - Draw a curve connecting two dots (or a dot to itself as a loop)
   - Place a new dot somewhere along the newly drawn curve
4. **Constraints**:
   - No curve can cross existing curves
   - No curve can pass through existing dots (except at endpoints)
   - Each dot can have at most 3 connections
5. **Victory**: The last player able to make a legal move wins

### Mathematical Properties

- Game always terminates (finite number of possible moves)
- For n starting dots, the game lasts at most 3n-1 moves
- For n starting dots, the game lasts at least 2n moves
- With optimal play, games have deterministic outcomes

## Technical Implementation

### Architecture

The Sprouts implementation follows the Graph Paper Games framework architecture:

- **Engine**: `SproutsEngine` - Implements `GameEngineAPI` for core game logic
- **AI**: `SproutsAI` - Implements `GameAI` with 6 difficulty levels
- **Types**: Comprehensive TypeScript type definitions
- **Geometry**: Advanced geometric utilities for curve operations
- **Validation**: Topology constraint enforcement
- **Component**: React component for interactive gameplay (TODO)

### Key Features

#### Geometric System
- **Bezier Curve Generation**: Smooth curve paths between points
- **Intersection Detection**: Robust algorithm for curve intersections
- **Topology Validation**: Ensures all game rules are enforced
- **Point-on-Path Calculation**: Precise positioning for new dots

#### AI System
1. **Random (Level 1)**: Makes random legal moves
2. **Blocking (Level 2)**: Prefers moves that reduce opponent options
3. **Basic Strategy (Level 3)**: Uses fundamental strategic principles
4. **Advanced Strategy (Level 4)**: Sophisticated tactical play with game phase awareness
5. **Expert (Level 5)**: Limited depth minimax search
6. **Master (Level 6)**: Deep search with alpha-beta pruning

#### Game State Management
- **Immutable State**: All game states are immutable for reliability
- **Serialization**: Complete save/load functionality
- **Move History**: Full game replay capability
- **Validation**: Comprehensive move validation before application

### File Structure

```
games/sprouts/
├── package.json              # NPM package configuration
├── tsconfig.json             # TypeScript configuration  
├── eslint.config.js          # ESLint configuration
├── vitest.config.ts          # Test configuration
├── vitest.setup.ts           # Test setup
├── README.md                 # This file
├── src/
│   ├── index.ts              # Module exports
│   ├── types.ts              # Type definitions
│   ├── engine.ts             # SproutsEngine implementation
│   ├── ai.ts                 # SproutsAI implementation
│   ├── geometry.ts           # Geometric utility functions
│   └── validation.ts         # Topology validation logic
└── __tests__/
    ├── engine.test.ts        # Engine unit tests
    ├── geometry.test.ts      # Geometry utilities tests
    └── ...                   # Additional test files
```

### Core Types

#### Game Elements
```typescript
interface SproutsPoint {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly connections: readonly string[]; // max 3
  readonly createdAtMove?: number;
}

interface SproutsCurve {
  readonly id: string;
  readonly startPointId: string;
  readonly endPointId: string;
  readonly controlPoints: readonly Point2D[];
  readonly newPointId: string;
  readonly createdAtMove: number;
}

interface SproutsMove extends Move {
  readonly type: 'connect';
  readonly data: {
    readonly fromPointId: string;
    readonly toPointId: string;
    readonly curvePath: readonly Point2D[];
    readonly newPointPosition: Point2D;
    readonly curveId: string;
    readonly newPointId: string;
  };
}
```

#### Game State
```typescript
interface SproutsMetadata {
  readonly points: readonly SproutsPoint[];
  readonly curves: readonly SproutsCurve[];
  readonly winner?: string;
  readonly legalMovesRemaining: number;
  readonly gamePhase: 'playing' | 'finished';
  readonly moveHistory: readonly SproutsMove[];
  readonly lastMove?: SproutsMove;
}
```

### Usage Examples

#### Creating a Game
```typescript
import { SproutsEngine, SproutsAI } from '@gpg/sprouts';

const engine = new SproutsEngine();
const ai = new SproutsAI();

const settings = {
  gameType: 'sprouts',
  playerCount: 2,
  enableAI: false,
  gridSize: { width: 3, height: 3 }, // 3 starting points
};

const players = [
  { id: 'player1', name: 'Player 1', /* ... */ },
  { id: 'player2', name: 'Player 2', /* ... */ },
];

const initialState = engine.createInitialState(settings, players);
```

#### Making Moves
```typescript
const move = createSproutsMove(
  'player1',
  'point-0',
  'point-1',
  [{ x: 100, y: 100 }, { x: 200, y: 100 }],
  { x: 150, y: 100 }
);

const validation = engine.validateMove(state, move, 'player1');
if (validation.isValid) {
  const newState = engine.applyMove(state, move);
}
```

#### AI Integration
```typescript
const aiMove = await ai.getMove(state, 4, 'ai-player'); // Level 4 AI
if (aiMove.success) {
  const newState = engine.applyMove(state, aiMove.data);
}
```

## Development

### Building
```bash
pnpm build
```

### Testing
```bash
pnpm test              # Run all tests
pnpm test:watch        # Run tests in watch mode
pnpm test:coverage     # Run tests with coverage
```

### Linting
```bash
pnpm lint              # Run ESLint
```

### Type Checking
```bash
pnpm typecheck         # Run TypeScript compiler
```

## Game Strategy

### Basic Concepts

1. **Connection Management**: Each point can only have 3 connections
2. **Blocking**: Prevent opponent from making advantageous connections
3. **Loop Creation**: Self-connections can be strategically valuable
4. **Endgame Timing**: The player making the last move wins

### Strategic Principles

#### Opening Phase
- Control central areas
- Create opportunities for future connections
- Avoid immediately exhausting points

#### Middle Game
- Balance offense and defense
- Block opponent's high-value connections
- Maintain flexibility in point connections

#### Endgame
- Count remaining moves carefully
- Force opponent into disadvantageous positions
- Prioritize moves that guarantee the last move

### AI Difficulty Progression

The AI system provides a smooth difficulty curve:

- **Levels 1-2**: Learning phase, random and basic blocking
- **Levels 3-4**: Strategic play with increasing sophistication  
- **Levels 5-6**: Expert-level play with deep search algorithms

## Mathematical Background

Sprouts is rich in mathematical properties:

### Topology
- Game demonstrates concepts from graph theory
- Euler characteristic relationships
- Planar graph constraints

### Game Theory
- Finite, zero-sum, perfect information game
- Deterministic outcomes with optimal play
- Complex strategy despite simple rules

### Complexity
- Move generation is computationally challenging
- Large branching factor makes deep search difficult
- Geometric constraints add unique complexity

## Future Enhancements

### Planned Features
1. **React Component**: Interactive canvas-based UI
2. **Animation System**: Smooth curve drawing animations
3. **Analysis Tools**: Move history visualization
4. **Variants**: Different starting configurations
5. **Tutorial Mode**: Interactive learning system

### Technical Improvements
1. **Performance**: Optimize geometric calculations
2. **AI Enhancement**: Deeper search algorithms
3. **Visualization**: Better curve rendering
4. **Multiplayer**: Online play support

## Credits

- **Original Game**: John Conway and Michael Paterson (1967)
- **Implementation**: Graph Paper Games Framework
- **Mathematics**: Based on topological game theory

## License

This implementation is part of the Graph Paper Games project and is licensed under the MIT License.