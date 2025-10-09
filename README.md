# Graph Paper Games

A web-based suite of classic pencil-and-paper games with a shared framework, AI
opponents, and multiplayer.

[![CI](https://github.com/your-org/graph-paper-games/workflows/CI/badge.svg)](https://github.com/your-org/graph-paper-games/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

## 🎯 Vision

Bring classic graph paper and pencil games to the web with a modern, accessible,
and extensible platform that supports both casual players and competitive
gaming.

## 🎮 Available Games

- **Dots and Boxes** ✅ - Complete squares by drawing lines *(Production Ready)*
- **Tic-Tac-Toe** ✅ - Classic game with 6-level AI *(Completed v0.2.0)*

## 🎯 Planned Games

- **Battleship** - Strategic ship placement and discovery
- **Connect Four** - Drop pieces to form four-in-a-row
- **Snake** - Competitive multiplayer snake growing
- **Hex** - Connection strategy game
- **Paper Soccer** - Goal-based grid movement
- **Sprouts** - Topological connection game

## 🏗️ Architecture

Modern monorepo with TypeScript, React frontend, Node.js backend, and pluggable
game framework.

### Packages

- `apps/web` - Game hub and frontend
- `packages/framework` - Shared engine and UI components
- `packages/shared` - Common types and utilities
- `services/game-server` - Realtime multiplayer backend
- `services/ai-service` - AI opponents and difficulty scaling
- `games/*` - Individual game implementations

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and pnpm 8+
- Git

### Quick Start

```bash
git clone https://github.com/your-org/graph-paper-games.git
cd graph-paper-games
pnpm install
pnpm dev
```

### Development Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build all packages
- `pnpm test` - Run test suite
- `pnpm lint` - Lint and format code
- `pnpm typecheck` - Type checking

## 🤝 Contributing

We welcome contributions! This is an open source project designed for community
collaboration.

### Ways to Contribute

- 🐛 **Bug Reports** - Help us find and fix issues
- ✨ **Feature Requests** - Suggest new features or improvements
- 🎮 **New Games** - Implement classic paper games
- 📚 **Documentation** - Improve guides and documentation
- 🎨 **UI/UX** - Enhance the visual design and user experience

### Getting Started as a Contributor

1. Read our [Contributing Guidelines](CONTRIBUTING.md)
2. Check out
   [Good First Issues](https://github.com/your-org/graph-paper-games/labels/good%20first%20issue)
3. Join our [Discord Community](https://discord.gg/graph-paper-games)
4. Review the [Code of Conduct](CODE_OF_CONDUCT.md)

### Development Process

- **Branching**: Modified GitFlow with `main`, `develop`, and feature branches
- **Quality**: Automated testing, linting, and type checking
- **Reviews**: All changes require PR review and automated checks
- **Community**: Open discussions and RFC process for major features

## 📚 Documentation

### Planning & Architecture

- [Project Overview](docs/project-overview.md) - Vision, requirements, success
  criteria
- [System Architecture](docs/system-architecture.md) - Technical design and data
  models
- [Framework Specification](docs/framework-spec.md) - Shared component APIs
- [Multiplayer & AI Design](docs/multiplayer-ai-design.md) - Networking and AI
  systems
- [SDLC Strategy](docs/sdlc-strategy.md) - Development process and community
  governance
- [Roadmap](docs/roadmap.md) - Development phases and milestones

### Development

- [Contributing Guide](CONTRIBUTING.md) - How to contribute
- [Code of Conduct](CODE_OF_CONDUCT.md) - Community standards
- [Game Development Guide](CONTRIBUTING.md#game-development-guide) - Creating
  new games

## 🏆 Community

### Recognition

- All contributors are listed in our contributors page
- Monthly contributor highlights
- Achievement badges for different contribution types
- Speaking opportunities at conferences

### Communication Channels

- **GitHub Discussions** - Feature requests and general discussion
- **Discord** - Real-time chat and community support
- **Monthly Calls** - Community updates and Q&A sessions

## 📊 Project Status

**Current Phase**: Game Library Expansion (Phase 3) 🎆

**Major Achievements**:
- ✅ **Framework MVP** - Complete foundation with grid rendering, turn management, and theming
- ✅ **Tic-Tac-Toe** - Full implementation with 6-level AI system
- ✅ **Dots and Boxes** - Production-ready with scalable grid support and advanced AI

**Next Milestones**:

- [ ] Connect Four implementation with gravity mechanics
- [ ] Battleship with fog-of-war and strategic AI
- [ ] Enhanced multiplayer with real-time synchronization
- [ ] Tournament system and leaderboards

See our [Roadmap](docs/roadmap.md) for detailed development phases.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file
for details.

## ⭐ Support the Project

If you find this project interesting:

- ⭐ Star the repository
- 🍴 Fork and contribute
- 💬 Join our Discord community
- 📢 Share with friends who love games

---

**Built with ❤️ by the open source community**
