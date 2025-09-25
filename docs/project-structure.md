# Project Structure (Planned)

- apps/
  - web/
- packages/
  - framework/
  - shared/
- services/
  - game-server/
  - ai-service/
- games/
  - dots-and-boxes/
  - battleship/
  - tic-tac-toe/
- docs/
  - project-overview.md
  - system-architecture.md
  - framework-spec.md
  - multiplayer-ai-design.md
  - roadmap.md
  - project-structure.md
- .github/
  - workflows/
- tools/
  - scripts/

Notes:
- Monorepo managed with pnpm workspaces
- TypeScript across frontend and services
- Jest/Vitest for tests; ESLint + Prettier