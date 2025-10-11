# Sprouts Game Implementation Specification

## Overview

**Sprouts** is a topological pencil-and-paper game invented by mathematicians John Conway and Michael Paterson in 1967. This specification outlines the complete implementation plan for adding Sprouts to the GraphPaperGames framework.

## Game Rules

### Basic Rules
- Start with a small number of dots (typically 2-6)
- Players alternate turns
- On each turn, a player must:
  1. Draw a curve connecting two dots (or a dot to itself as a loop)
  2. Place a new dot somewhere along the newly drawn curve
- **Constraints:**
  - No curve can cross existing curves
  - No curve can pass through existing dots (except at endpoints)
  - Each dot can have at most 3 connections
- **Victory:** The last player able to make a legal move wins

### Mathematical Properties
- Game always ends (finite number of possible moves)
- For n starting dots, the game lasts at most 3n-1 moves
- For n starting dots, the game lasts at least 2n moves
- With optimal play, games have deterministic outcomes

## Implementation Plan

### Phase 1: Research & Design

#### 1.1 Game Rules Analysis
- [x] Study complete Sprouts ruleset
- [x] Analyze topology constraints
- [x] Research optimal representation strategies
- [x] Document mathematical properties

#### 1.2 Data Structure Design
```typescript
// Core types for Sprouts implementation
interface SproutsPoint {
  readonly id: string;
  readonly x: number;
  readonly y: number;
  readonly connections: readonly string[]; // max 3 connection IDs
}

interface SproutsCurve {
  readonly id: string;
  readonly startPointId: string;
  readonly endPointId: string;
  readonly controlPoints: readonly Point2D[]; // Bezier curve control points
  readonly newPointId: string; // dot placed along this curve
}

interface SproutsMove extends Move {
  readonly type: 'connect';
  readonly data: {
    readonly fromPointId: string;
    readonly toPointId: string;
    readonly curvePath: readonly Point2D[];
    readonly newPointPosition: Point2D;
  };
}

interface SproutsMetadata {
  readonly points: readonly SproutsPoint[];
  readonly curves: readonly SproutsCurve[];
  readonly winner?: string;
  readonly legalMovesRemaining: number;
}
```

### Phase 2: Core Implementation

#### 2.1 Project Structure Setup
```
games/sprouts/
├── package.json              # NPM package configuration
├── tsconfig.json             # TypeScript configuration  
├── eslint.config.js          # ESLint configuration
├── vitest.config.ts          # Test configuration
├── vitest.setup.ts           # Test setup
├── README.md                 # Game documentation
├── src/
│   ├── index.ts              # Module exports
│   ├── types.ts              # Type definitions
│   ├── engine.ts             # SproutsEngine implementation
│   ├── ai.ts                 # SproutsAI implementation
│   ├── component.tsx         # React component
│   ├── geometry.ts           # Geometric utility functions
│   └── validation.ts         # Topology validation logic
└── __tests__/
    ├── engine.test.ts        # Engine unit tests
    ├── ai.test.ts            # AI behavior tests
    ├── geometry.test.ts      # Geometry utilities tests
    ├── validation.test.ts    # Validation logic tests
    ├── component.test.tsx    # Component tests
    └── integration.test.ts   # End-to-end tests
```

#### 2.2 Package Configuration
```json
{
  "name": "@gpg/sprouts",
  "version": "0.1.0",
  "description": "Topological connection game with curve drawing",
  "keywords": ["game", "sprouts", "topology", "strategy", "curves"],
  "dependencies": {
    "@gpg/framework": "workspace:*",
    "@gpg/shared": "workspace:*",
    "react": "^18.2.0"
  },
  "devDependencies": {
    "@types/node": "^22.20.0"
  }
}
```

### Phase 3: Engine Implementation

#### 3.1 Core Engine (SproutsEngine)
```typescript
export class SproutsEngine implements GameEngineAPI {
  createInitialState(settings: GameSettings, players: readonly Player[]): Result<GameState> {
    // Create initial dots based on settings.gridSize or default to 3 dots
    // Position dots to allow for good gameplay
  }

  validateMove(state: GameState, move: Move, playerId: string): ValidationResult {
    // 1. Verify it's the player's turn
    // 2. Check source and target points exist and can accept connections
    // 3. Validate curve path doesn't intersect existing curves
    // 4. Ensure new dot placement is valid along the curve
  }

  applyMove(state: GameState, move: Move): Result<GameState> {
    // 1. Add new curve to game state
    // 2. Create new dot along the curve
    // 3. Update connection counts for involved points
    // 4. Check for game termination
    // 5. Advance to next player
  }

  isTerminal(state: GameState): GameOver | null {
    // Check if any legal moves remain by testing all point pairs
    // Return winner (last player to move) if no moves available
  }

  getLegalMoves(state: GameState, playerId: string): readonly Move[] {
    // Generate all possible connections between available points
    // Filter out moves that would create invalid topology
  }
}
```

#### 3.2 Topology Validation System
```typescript
export class TopologyValidator {
  static validateCurvePath(
    path: readonly Point2D[],
    existingCurves: readonly SproutsCurve[],
    existingPoints: readonly SproutsPoint[]
  ): ValidationResult {
    // Check for curve intersections using line segment intersection algorithms
    // Verify path doesn't pass through existing points
  }

  static canConnectPoints(
    point1: SproutsPoint,
    point2: SproutsPoint
  ): boolean {
    // Check if both points have available connections (< 3 each)
  }

  static findCurveIntersections(
    newPath: readonly Point2D[],
    existingCurve: SproutsCurve
  ): readonly Point2D[] {
    // Implement curve intersection detection
    // Use appropriate geometric algorithms for splines/bezier curves
  }
}
```

### Phase 4: AI Implementation

#### 4.1 AI Strategy System
```typescript
export class SproutsAI implements GameAI {
  async getMove(
    state: GameState,
    difficulty: AIDifficulty,
    playerId: string
  ): Promise<Result<Move>> {
    switch (difficulty) {
      case 1: return this.getRandomMove(state, playerId);
      case 2: return this.getBlockingMove(state, playerId);
      case 3: return this.getBasicStrategyMove(state, playerId);
      case 4: return this.getAdvancedStrategyMove(state, playerId);
      case 5: return this.getMinimaxMove(state, playerId, 3);
      case 6: return this.getMinimaxMove(state, playerId, 5);
    }
  }

  private evaluatePosition(state: GameState, playerId: string): number {
    // Heuristics for position evaluation:
    // 1. Count available connections per player
    // 2. Evaluate area control and blocking potential
    // 3. Consider endgame tactical advantages
  }
}
```

#### 4.2 AI Difficulty Levels
- **Level 1:** Random legal moves
- **Level 2:** Prefer moves that reduce opponent options
- **Level 3:** Basic connection strategy (favor creating loops)
- **Level 4:** Advanced tactics (area control, blocking)
- **Level 5:** Limited depth minimax search
- **Level 6:** Deep minimax with alpha-beta pruning

### Phase 5: UI Component

#### 5.1 React Component (SproutsGame)
```typescript
export const SproutsGame: React.FC<GameProps> = ({
  gameState,
  currentPlayer,
  isMyTurn,
  onMove,
  settings
}) => {
  // State for interactive curve drawing
  const [drawingState, setDrawingState] = useState<DrawingState | null>(null);
  const [selectedPoint, setSelectedPoint] = useState<string | null>(null);

  // Handle point selection and curve drawing
  const handlePointClick = (pointId: string) => {
    // Start or complete curve drawing
  };

  const handleCanvasMouseMove = (event: MouseEvent) => {
    // Update curve preview during drawing
  };

  return (
    <div className="sprouts-game">
      <SproutsCanvas
        metadata={metadata}
        onPointClick={handlePointClick}
        onCanvasClick={handleCanvasClick}
        drawingState={drawingState}
        interactive={isMyTurn}
      />
      <GameControls />
    </div>
  );
};
```

#### 5.2 Custom Canvas Renderer
```typescript
interface SproutsCanvasProps {
  metadata: SproutsMetadata;
  onPointClick: (pointId: string) => void;
  drawingState?: DrawingState;
  interactive: boolean;
}

export const SproutsCanvas: React.FC<SproutsCanvasProps> = ({
  metadata,
  onPointClick,
  drawingState,
  interactive
}) => {
  // Render dots as circles
  // Render curves as smooth bezier paths
  // Handle interactive curve drawing with mouse/touch
  // Provide visual feedback for legal/illegal moves
};
```

### Phase 6: Testing Strategy

#### 6.1 Unit Tests
- **Engine Tests:** Move validation, state transitions, win detection
- **AI Tests:** Move selection at different difficulty levels
- **Geometry Tests:** Curve intersection algorithms, point-in-curve calculations
- **Validation Tests:** Topology constraint enforcement

#### 6.2 Integration Tests
- Complete game scenarios from start to finish
- Edge cases with complex curve configurations
- AI vs AI games for different difficulty combinations
- Undo/redo functionality with complex game states

#### 6.3 Performance Tests
- Large number of curves and points
- Complex intersection calculations
- AI move generation time limits
- Canvas rendering performance

## Technical Challenges & Solutions

### Challenge 1: Curve Representation
**Problem:** Efficiently represent and manipulate arbitrary curves
**Solution:** Use Bezier curves with control points, provide utility functions for common operations

### Challenge 2: Intersection Detection
**Problem:** Detecting intersections between complex curves
**Solution:** Implement robust geometric algorithms, consider using existing geometry libraries

### Challenge 3: State Serialization
**Problem:** Storing complex geometric data for save/load functionality
**Solution:** Design compact serialization format, use JSON with structured curve data

### Challenge 4: User Interface
**Problem:** Intuitive curve drawing on various devices
**Solution:** Multi-input support (mouse, touch), visual feedback, curve smoothing algorithms

## Game Module Configuration

```typescript
export const SproutsModule: GameModule = {
  id: 'sprouts',
  name: 'Sprouts',
  version: '1.0.0',
  description: 'Topological connection game invented by John Conway',
  categories: ['strategy', 'mathematical', 'topology', 'expert'],
  capabilities: {
    grid: 'square', // Uses canvas area, not true grid
    minPlayers: 2,
    maxPlayers: 2,
    supportsAI: true,
    supportsOnline: false, // Phase 2 scope
    supportsLocal: true,
    estimatedDuration: 15, // minutes - longer than grid games
  },
  engine: new SproutsEngine(),
  ai: new SproutsAI(),
  component: SproutsGame,
};
```

## Development Timeline

- **Week 1-2:** Research, design, project setup
- **Week 3-4:** Core engine implementation
- **Week 5-6:** Topology validation system
- **Week 7-8:** AI implementation
- **Week 9-10:** React component and UI
- **Week 11-12:** Testing, documentation, polish

## Future Enhancements

1. **Visual Improvements:** Animated curve drawing, particle effects
2. **Analysis Tools:** Move history visualization, game analysis
3. **Variants:** Different starting configurations, rule modifications
4. **Educational Mode:** Interactive tutorials explaining topology concepts
5. **Online Multiplayer:** Real-time curve drawing synchronization

---

*This specification provides a complete roadmap for implementing Sprouts in the GraphPaperGames framework, showcasing the system's flexibility beyond traditional grid-based games.*