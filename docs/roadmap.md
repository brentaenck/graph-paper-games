# Roadmap

## Phase 0: Foundations (Week 1-2)
- Project scaffolding and repo setup
- Docs: overview, architecture, framework spec, multiplayer/AI design
- CI: lint, typecheck, test, build

## Phase 1: Framework MVP (Week 3-6)
- packages/framework: GridRenderer, TurnManager, EventBus, theme system
- packages/shared: types and utilities
- apps/web: Hub shell (navigation, profiles mock), demo grid
- Basic local pass-and-play loop

Milestones:
- Render square grid with pan/zoom
- Implement turn transitions and undo policy hooks
- Serialize/deserialize game state

## Phase 2: First Game - Dots and Boxes (Week 7-9)
- Implement rules, UI, scoring, end detection
- Local 2P and basic AI (heuristic)
- Replay and save/load

Milestones:
- Box completion detection with animations
- AI can play full game on small board

## Phase 3: Realtime Multiplayer (Week 10-12)
- WS gateway, rooms, presence, move protocol
- Server-side validation; Redis cache; Postgres schema v1
- Spectator read-only

Milestones:
- Two browsers playing Dots and Boxes in realtime
- Resync works after reload

## Phase 4: Additional Games + AI Service (Week 13-16)
- Battleship and Tic-Tac-Toe variants
- AI service with pluggable strategies; difficulty scaling

Milestones:
- Battleship with fog-of-war and async mode
- Ultimate Tic-Tac-Toe with minimax AI

## Phase 5: Hardening & Hub Features (Week 17-20)
- Profiles, leaderboards, settings, PWA install
- Accessibility pass and mobile polish
- Load/stress testing; monitoring setup

Exit Criteria:
- 3 games stable; AI for each; realtime and async work reliably
- P95 move-to-render under 150ms on modern devices