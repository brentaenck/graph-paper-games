# Agent Contributor Guide

This document provides specific guidance for Warp AI agents contributing to the
Graph Paper Games project.

## Project Context Summary

**Project**: Graph Paper Games - Web-based suite of classic pencil-and-paper
games **Architecture**: TypeScript monorepo with React frontend, Node.js
backend, shared game framework **SDLC**: Modified GitFlow with community-first
open source approach **Current Phase**: Foundation setup (Phase 0) - framework
development

## Key Project Principles

1. **Framework-First**: All games implement the standardized `GameInterface`
2. **Community-Driven**: Open source with contributor-friendly architecture
3. **Quality-First**: 80%+ test coverage, TypeScript strict mode, comprehensive
   CI/CD
4. **Accessibility**: Games must work on mobile, desktop, with screen readers
5. **Multiplayer**: Support local, real-time online, and async play modes

## Repository Structure

```
GraphPaperGames/
├── apps/web/                 # Game hub frontend (React/Vite)
├── packages/framework/       # Shared game framework
├── packages/shared/          # Common types and utilities
├── services/game-server/     # Backend API and WebSocket server
├── services/ai-service/      # AI opponents service
├── games/                    # Individual game implementations
│   ├── dots-and-boxes/
│   ├── battleship/
│   └── tic-tac-toe/
├── docs/                     # Project documentation
└── .github/workflows/        # CI/CD automation
```

## Development Workflow for Agents

### 1. Understanding Current State

**Always check these first:**

```bash
# Check current branch and status
git status
git branch

# Check if dependencies are installed
ls node_modules/ || echo "Need to run pnpm install"

# Check build status
pnpm build

# Run tests to understand current state
pnpm test
```

### 2. Code Standards

#### TypeScript Standards

- Use strict mode TypeScript
- Prefer interfaces over types for object shapes
- Use proper JSDoc comments for public APIs
- Implement proper error handling with Result types

#### React/Frontend Standards

- Use functional components with hooks
- Implement proper prop types and validation
- Follow accessibility guidelines (WCAG 2.1)
- Use CSS-in-JS with styled-components or emotion

#### Testing Standards

- Write unit tests for all business logic
- Use integration tests for API endpoints
- E2E tests for critical user flows
- Aim for 80%+ code coverage

### 3. Game Implementation Pattern

When implementing new games, follow this structure:

```typescript
// games/[game-name]/src/index.ts
export { GameModule } from './game-module';

// games/[game-name]/src/game-module.ts
import { GameModule } from '@gpg/framework';

export const GameModule: GameModule = {
  id: 'game-name',
  name: 'Game Display Name',
  version: '1.0.0',
  categories: ['strategy'],
  capabilities: {
    grid: 'square',
    minPlayers: 2,
    maxPlayers: 2,
    supportsAI: true,
    supportsOnline: true,
    supportsLocal: true,
  },
  component: GameComponent,
  engine: gameEngine,
  ai: gameAI,
};
```

### 4. Framework Integration

#### Required Interfaces

Every game must implement:

- `GameEngineAPI` - Core game rules and state management
- `GameAI` - AI opponent implementation
- React component following framework patterns

#### Grid System

Use the standardized coordinate system:

```typescript
interface GridCoordinate {
  x: number;
  y: number;
}
```

### 5. Testing Strategy

#### Unit Tests

```bash
# Run tests for specific game
pnpm --filter @gpg/games-dots-and-boxes test

# Run framework tests
pnpm --filter @gpg/framework test
```

#### Integration Testing

- Test game state transitions
- Verify multiplayer message handling
- Check AI move generation

### 6. Common Commands

```bash
# Start development
pnpm dev

# Build specific package
pnpm --filter @gpg/framework build

# Run linting
pnpm lint

# Type checking
pnpm typecheck

# Add dependency to specific package
pnpm --filter @gpg/apps-web add react-query

# Create new game from template
pnpm create-game [game-name]
```

## Agent-Specific Guidelines

### When Writing Code

1. **Read existing code first** - Look at similar implementations
2. **Check interfaces** - Ensure compatibility with framework contracts
3. **Write tests alongside code** - Don't defer testing
4. **Use TypeScript strictly** - No `any` types without justification
5. **Follow existing patterns** - Consistency over innovation

### When Debugging

1. **Check build output** - Look for TypeScript errors
2. **Review test failures** - Understand what broke
3. **Check browser console** - Look for runtime errors
4. **Verify dependencies** - Ensure correct package versions

### When Implementing Features

1. **Start with tests** - Write failing tests first
2. **Implement incrementally** - Small, working changes
3. **Update documentation** - Keep docs current
4. **Consider accessibility** - Screen readers, keyboard nav
5. **Test on multiple devices** - Mobile responsive design

## Framework APIs for Agents

### Core Framework Exports

```typescript
// From @gpg/framework
import {
  GridRenderer, // Canvas-based grid rendering
  GameEngine, // State management
  TurnManager, // Turn-based logic
  EventBus, // Component communication
  UIComponents, // Shared UI elements
} from '@gpg/framework';

// From @gpg/shared
import {
  GameState, // Base game state type
  Move, // Move representation
  Player, // Player information
  GameSettings, // Configuration
} from '@gpg/shared';
```

### Game Implementation Checklist

- [ ] Implements `GameEngineAPI` interface
- [ ] Has React component with proper props
- [ ] Includes AI implementation
- [ ] Has comprehensive unit tests
- [ ] Includes integration tests
- [ ] Documentation with game rules
- [ ] Supports all required grid interactions
- [ ] Handles multiplayer state synchronization
- [ ] Implements proper error states
- [ ] Follows accessibility guidelines

## Common Pitfalls to Avoid

1. **Don't bypass the framework** - Use provided APIs
2. **Don't hardcode values** - Use configuration and constants
3. **Don't skip error handling** - Games should be resilient
4. **Don't ignore TypeScript errors** - Fix them, don't suppress
5. **Don't forget mobile** - Design responsive from start
6. **Don't skip tests** - They catch regressions
7. **Don't break existing APIs** - Maintain backward compatibility

## Debugging Tips for Agents

### Check Framework State

```typescript
// Access current game state
const state = gameEngine.getCurrentState();
console.log('Current state:', state);

// Check valid moves
const validMoves = gameEngine.legalMoves?.(state, currentPlayer);
console.log('Valid moves:', validMoves);
```

### Grid Debugging

```typescript
// Visualize grid state
const grid = state.grid;
console.table(grid.cells.map(row => row.map(cell => cell.state)));
```

### Event Debugging

```typescript
// Listen to framework events
EventBus.subscribe('game/*', event => {
  console.log('Game event:', event);
});
```

## AI Implementation Guidelines

### AI Difficulty Scaling

```typescript
// AI should scale difficulty 1-6
interface GameAI {
  getMove(state: GameState, difficulty: 1 | 2 | 3 | 4 | 5 | 6): Move;
  getHint?(state: GameState): Hint | null;
}
```

### AI Algorithms by Difficulty

- **1-2**: Random valid moves with basic heuristics
- **3-4**: Minimax with alpha-beta pruning (depth 3-5)
- **5-6**: Monte Carlo Tree Search or advanced minimax

## Performance Guidelines

- Games should load in < 3 seconds
- Moves should render in < 150ms (P95)
- AI should respond in < 500ms for normal difficulty
- Memory usage should be reasonable for mobile devices

## Security Considerations

- Validate all moves server-side
- Never trust client state for game logic
- Sanitize user inputs
- Implement rate limiting for move submissions

---

**Remember**: When in doubt, look at existing implementations and follow
established patterns. The framework is designed to make game development
straightforward while maintaining consistency across all games.
