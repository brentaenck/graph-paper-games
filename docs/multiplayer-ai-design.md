# Multiplayer and AI Design

## Multiplayer Modes
- Local pass-and-play (same device)
- Online real-time (WebSocket rooms)
- Online async (turns persisted; notifications)

## Matchmaking & Lobbies
- Quick Play: auto-match by ELO/MMR per game
- Custom Lobby: invite link, seat configuration, AI slots
- Private vs Public rooms; max spectators per game type

## Turn Protocol
- Server authoritative; clients propose moves
- Move payload: { gameId, byPlayerId, turnNumber, moveData, clientTs }
- Server validates turnNumber and move legality; rejects with reasons
- On accept: emit StateDelta and TurnChanged to all participants
- Include checksum/version to detect desync; server sends re-sync snapshot if needed

## Persistence
- Redis: active matches, presence, rate limits
- PostgreSQL: users, games, moves, results, ELO history
- S3-like storage: replays (compressed), assets

## Anti-Cheat
- Server-side validation only; no hidden information sent to clients
- Fog-of-war masking (e.g., Battleship)
- Turn rate limiting and cooldowns
- Suspicious pattern detection (duplicate IPs, perfect-play anomalies)

## Reconnects & Resilience
- Heartbeats; server closes stale sessions
- On reconnect: restore seat, send snapshot and pending diffs
- Idempotent move submission with client-generated UUIDs

## Spectators & Chat
- Read-only subscription to StateDelta
- Delayed chat for public rooms if needed; moderation tools

## Notifications
- Web Push for async turns (opt-in)
- Email summaries (optional)

---

## AI System

### Goals
- Playable AI in all games at launch
- Scale difficulty with minimal per-game code

### Architecture
- AI Service exposes endpoint: POST /ai/:gameType/move
- Stateless service uses game rules to simulate and pick a move
- Strategy plugins per game; shared search utilities

### Algorithms
- Heuristics: fast rules-based (difficulty 1-2)
- Minimax with alpha-beta (difficulty 2-4)
- Monte Carlo Tree Search (difficulty 4-6)
- Playout policies customizable per game

### Determinism & Fairness
- Seeded RNG per match; AI receives seed for reproducibility
- Time budgets per move (e.g., 50ms easy, 500ms hard)
- Fallback to heuristic if budget exceeded

### Hints & Training
- getHint uses light-depth search to illustrate options
- Optional explanation string for why a move is chosen

### API Contract
```typescript
interface AIMoveRequest {
  gameType: string;
  state: GameState;
  difficulty: number; // 1..6
  playerId: string;
  rngSeed: string;
}

interface AIMoveResponse {
  move: Move;
  evaluations?: Record<string, number>; // optional score per candidate
  hint?: string;
}
```

### Scaling
- Queue heavy requests with a worker pool
- Horizontal scale AI service independently from game server