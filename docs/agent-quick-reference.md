# Agent Quick Reference

This is a condensed reference guide for Warp agents working on Graph Paper Games. For detailed information, see the [full Agent Guide](agent-guide.md).

## 🚀 Quick Start Commands

```bash
# Initial setup
pnpm install
pnpm build

# Development
pnpm dev              # Start dev server
pnpm test             # Run all tests  
pnpm lint             # Lint and format
pnpm typecheck        # Type checking

# Package-specific commands
pnpm --filter @gpg/framework build
pnpm --filter @gpg/apps-web dev
```

## 🎯 Key Interfaces

### GameModule Structure
```typescript
export const GameModule: GameModule = {
  id: 'game-name',
  name: 'Display Name',
  capabilities: {
    grid: 'square',
    minPlayers: 2,
    maxPlayers: 4,
    supportsAI: true,
    supportsOnline: true,
  },
  component: GameComponent,
  engine: gameEngine,
  ai: gameAI,
};
```

### GameEngineAPI Implementation
```typescript
interface GameEngineAPI {
  createInitialState(settings: GameSettings, players: Player[]): GameState;
  validateMove(state: GameState, move: Move, by: Player): boolean;
  applyMove(state: GameState, move: Move): GameState;
  isTerminal(state: GameState): GameOver | null;
  evaluate(state: GameState): Scoreboard;
}
```

## 📁 File Structure Patterns

```
games/[game-name]/
├── package.json           # Package config
├── src/
│   ├── index.ts          # Main export
│   ├── game-module.ts    # GameModule implementation
│   ├── engine.ts         # Game rules (GameEngineAPI)
│   ├── component.tsx     # React component
│   ├── ai.ts             # AI implementation
│   └── types.ts          # Game-specific types
├── __tests__/
│   ├── engine.test.ts    # Game logic tests
│   ├── ai.test.ts        # AI tests
│   └── component.test.tsx # UI tests
└── README.md             # Game rules and docs
```

## 🧪 Testing Patterns

```bash
# Test specific game
pnpm --filter @gpg/games-dots-and-boxes test

# Test with coverage
pnpm test --coverage

# Watch mode
pnpm test --watch
```

### Test Structure
```typescript
describe('GameEngine', () => {
  test('creates valid initial state', () => {
    const state = engine.createInitialState(settings, players);
    expect(state).toBeDefined();
    expect(state.currentPlayer).toBe(0);
  });

  test('validates moves correctly', () => {
    const move = { type: 'place', x: 0, y: 0 };
    expect(engine.validateMove(state, move, player)).toBe(true);
  });
});
```

## 🎮 AI Implementation Pattern

```typescript
export const gameAI: GameAI = {
  getMove(state: GameState, difficulty: number): Move {
    switch(difficulty) {
      case 1:
      case 2:
        return getRandomMove(state);
      case 3:
      case 4:
        return getMinimaxMove(state, difficulty);
      case 5:
      case 6:
        return getMCTSMove(state, difficulty);
    }
  },
  
  getHint(state: GameState): Hint | null {
    // Return helpful hint for current state
  }
};
```

## 🎨 React Component Pattern

```typescript
interface GameProps {
  gameState: GameState;
  currentPlayer: Player;
  onMove: (move: Move) => void;
  isMyTurn: boolean;
}

export function GameComponent({ gameState, currentPlayer, onMove, isMyTurn }: GameProps) {
  return (
    <div className="game-container">
      <GridRenderer 
        grid={gameState.grid}
        onCellClick={handleCellClick}
        theme="paper"
      />
      <GameHUD 
        players={gameState.players}
        currentPlayer={currentPlayer}
        score={gameState.score}
      />
    </div>
  );
}
```

## 🔍 Debugging Checklist

1. **Build Issues**
   - Check TypeScript errors: `pnpm typecheck`
   - Check linting: `pnpm lint`
   - Verify dependencies: `ls node_modules/`

2. **Test Failures**
   - Run specific test file
   - Check test output for clues
   - Verify game state structure

3. **Runtime Issues**  
   - Check browser console
   - Verify prop types
   - Check network requests in dev tools

## 🌟 Framework Utilities

```typescript
// Grid operations
import { GridRenderer, createGrid, getCellAt } from '@gpg/framework';

// Event handling
import { EventBus } from '@gpg/framework';
EventBus.emit('game:move', { player, move });

// UI Components
import { GameHUD, PlayerList, ScorePanel } from '@gpg/framework/ui';
```

## 🚨 Common Pitfalls

- ❌ Don't use `any` types
- ❌ Don't skip writing tests  
- ❌ Don't bypass framework APIs
- ❌ Don't forget mobile responsiveness
- ❌ Don't hardcode grid dimensions
- ❌ Don't trust client-side game state

## ✅ Best Practices

- ✅ Use framework-provided components
- ✅ Implement comprehensive move validation
- ✅ Write tests first (TDD)
- ✅ Follow TypeScript strict mode
- ✅ Support keyboard navigation
- ✅ Handle loading and error states

---

💡 **Tip**: When stuck, look at existing game implementations for patterns and examples.