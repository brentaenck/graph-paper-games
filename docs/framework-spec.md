# Graph Paper Games - Framework Specification

## Goals
- Provide a consistent look and feel across all games
- Standardize how games handle turns, moves, rendering, and persistence
- Make it easy to add new games with minimal boilerplate
- Enable single-player (with AI), local pass-and-play, and online multiplayer

## Core Modules

1) Rendering Layer
- GridRenderer: draws square/hex/triangular grids using Canvas (primary) with optional SVG fallback
- Theme system: paper textures, pen colors, line weight presets, accessibility high-contrast theme
- Interaction helpers: pointer capture, drag lines, tap-to-select cells/nodes/edges

2) State & Turn Engine
- GameState container with immutable updates
- TurnManager with phases (pre-turn, move, post-turn), timers, and skip/undo policy hooks
- RuleEngine integration for validate/apply/check-end

3) Networking Abstractions
- RealtimeClient: WebSocket wrapper with reconnect, backoff, heartbeat, and auth token support
- Action protocol: client emits MoveAction; server emits StateDelta and TurnChanged events
- Offline/async mode support with queued actions

4) AI Interface
- GameAI interface: getMove(state, difficulty, rng)
- Deterministic RNG injection for reproducible simulations
- Pluggable strategy adapters (Minimax, MCTS, heuristics, scripted)

5) Persistence & Replay
- Serializer for compact, versioned game state snapshots
- Move log and timeline controls (step, scrub, export)
- Save slots per user and autosave on turn end

6) UI Components
- Shared HUD: turn banner, score panel, timer, player list
- Modal dialogs: settings, resign, draw offer, confirm undo
- Toasts and notifications
- In-game chat widget (when multiplayer enabled)

## Framework API Contracts

### Game Registration
- Each game exports a GameModule registered with the hub registry:
- GameModule metadata controls routing, assets, and capabilities

```typescript
export interface GameModule {
  id: string;                // 'dots-and-boxes'
  name: string;              // 'Dots and Boxes'
  version: string;           // semver
  categories: string[];      // ['strategy','paper-classic']
  capabilities: {
    grid: 'square' | 'hex' | 'tri';
    minPlayers: number;
    maxPlayers: number;
    supportsAI: boolean;
    supportsOnline: boolean;
    supportsLocal: boolean;
  };
  assets?: string[];         // preloaded images/sounds
  component: React.ComponentType<GameProps>;
  engine: GameEngineAPI;     // rules and state
  ai?: GameAI;               // optional AI
}
```

### Game Engine API
```typescript
export interface GameEngineAPI {
  // lifecycle
  createInitialState(settings: GameSettings, players: PlayerRef[]): GameState;
  validateMove(state: GameState, move: Move, by: PlayerRef): ValidationResult;
  applyMove(state: GameState, move: Move): GameState;
  isTerminal(state: GameState): GameOver | null;
  evaluate(state: GameState): Scoreboard; // for UI and AI heuristics

  // helpers (optional)
  legalMoves?(state: GameState, forPlayer: PlayerRef): Move[];
  annotate?(state: GameState): Annotation[]; // overlays for UI
}
```

### Event Bus
- Topics: ui/*, game/*, net/*, ai/*
- Examples: ui/click, game/turn-start, net/disconnected, ai/hint-ready

### Theming
- Design tokens: colors, spacing, typography, paper textures, grid density
- Light and Dark paper presets; high contrast palette

## Error Handling & Telemetry
- Centralized error boundary in hub and per game
- Structured logs with correlation IDs per match
- Client perf metrics: FCP, TTI, frame time, WS RTT

## Accessibility
- Keyboard navigable grids and controls
- Focus indicators and screen reader labels for board elements
- Color-blind safe palettes and patterns

## Versioning & Compatibility
- Framework semver; games declare peer range
- Migration hooks for game state version bumps

## Example Folder Structure
- apps/web (hub)
- packages/framework (shared core)
- games/dots-and-boxes
- games/battleship
- packages/shared (types, utils)

## Definition of Done for a Game
- Implements GameEngineAPI; passes unit tests
- Renders on GridRenderer with theme
- Supports at least local 2-player and AI v0
- Docs: rules, controls, and strategy notes