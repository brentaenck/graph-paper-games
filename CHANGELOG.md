# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Phase 3: Game Library Expansion
- Planning additional games (Connect Four, Dots and Boxes, Battleship)
- Enhanced UI/UX improvements
- Performance optimizations

## [0.4.2] - 2025-10-06

### Fixed
- **🚀 GitHub CI Pipeline Fixes**
  - Added missing ESLint dependencies (@eslint/js, @typescript-eslint/*)
  - Created ESLint configurations for research and dots-and-boxes packages
  - Fixed TypeScript build output issues in shared and tic-tac-toe packages
  - Exported missing paperTheme and highContrastTheme from framework package
  - Fixed type annotations in web app event handlers
  - Removed compiled files from source directories (proper dist output)
  - Relaxed ESLint rules for research/experimental code

### Technical
- **CI Status**: 5 out of 6 CI steps now passing (build, lint, typecheck, prettier, audit)
- **Build System**: Fixed TypeScript compilation issues preventing proper dist generation
- **Code Quality**: ESLint v9 compatibility across all packages
- **Development Experience**: Resolved blocking issues for continuous integration

## [0.4.1] - 2025-10-04

### Added
- **📚 Complete Dual Design System Documentation Suite**
  - DUAL_DESIGN_SYSTEM.md (731 lines) - Complete system guide with philosophy, architecture, and usage patterns
  - INTEGRATION_GUIDE.md (945 lines) - Step-by-step tutorial with working examples for new and existing games
  - API_REFERENCE.md (838 lines) - Complete technical reference for all components, hooks, and utilities
  - README.md (301 lines) - Documentation hub with quick start guides and navigation
  - Total: 2,800+ lines of comprehensive developer documentation

- **🏆 WinningLine Component**
  - Animated victory lines with hand-drawn aesthetics
  - Support for coordinate-based and cell-index-based winning lines
  - All four pen styles (ballpoint, pencil, marker, fountain)
  - Configurable animation timing, wobble effects, and colors
  - TypeScript types and utility functions
  - Integration with existing HandDrawnGrid system

### Enhanced
- **Framework Exports**: Updated to include WinningLine component and utilities
- **Type System**: Complete TypeScript definitions for all new APIs
- **Developer Experience**: Production-ready documentation for team onboarding
- **Architecture**: Completed framework extraction phase with all visual-style-lab components

### Documentation
- **System Philosophy**: "The paper holds only the game, the interface surrounds the paper"
- **Component Categories**: Clear separation between Modern UI and Hand-drawn components
- **Integration Patterns**: Complete working examples with game logic, styling, and testing
- **Best Practices**: Comprehensive guidelines for component usage and architecture
- **Troubleshooting**: Common issues and solutions for development teams

### Technical
- **Framework Version**: @gpg/framework bumped to 0.4.2
- **API Surface**: Expanded exports for complete dual design system
- **Bundle Size**: Optimized imports with tree-shaking support
- **Type Safety**: Enhanced TypeScript definitions and boundary enforcement

This release completes the framework extraction milestone, making the dual design system
production-ready for game development across the entire GraphPaperGames ecosystem.

## [0.4.0] - 2025-09-28

### Changed
- **🔧 Major Development Tooling Upgrades**
  - ESLint: 8.x → 9.x with flat config migration
  - Vite: 4.x → 7.x for improved build performance and security
  - @types/node: 20.x → 22.x to match Node.js 22.20.0 runtime
  - All ESLint dependencies updated to latest compatible versions

- **⚙️ Configuration Modernization**
  - Migrated all `.eslintrc.cjs` files to modern `eslint.config.js` format
  - Updated ESLint plugins for ESLint 9 compatibility
  - Removed deprecated `--ext` flags from lint scripts
  - Enhanced TypeScript support with latest Node.js type definitions

### Technical Improvements
- **Better Developer Experience**: Modern tooling with improved performance
- **Enhanced Security**: Latest versions include security patches and improvements
- **Improved Build Performance**: Vite 7.x provides faster builds and HMR
- **Better TypeScript Support**: Enhanced IntelliSense for Node.js APIs
- **Zero Breaking Changes**: All upgrades maintain full backward compatibility

### Testing
- All existing functionality verified post-upgrade
- TypeScript compilation successful with zero errors
- Full test suite passes (84 tests passing)
- Build and development processes function normally

## [0.3.0] - 2025-09-28

### Added
- **🧪 Comprehensive Test Coverage Expansion**
  - TurnManager: Complete test suite with 100% coverage
  - GridRenderer: Extensive canvas rendering tests
  - Framework integration tests for component interactions
  - Total test count increased to 84 tests
  - Enhanced test infrastructure and utilities

### Enhanced
- **Code Quality**: Improved test coverage across framework components
- **Reliability**: Better validation of core game mechanics
- **Developer Confidence**: Comprehensive test safety net for future development

## [0.2.0] - 2025-09-27

### Added
- **🎮 Complete Tic-Tac-Toe Game Implementation**
  - Full game engine with move validation and win detection
  - Six-level progressive AI system (Random → Unbeatable)
  - Interactive web UI with responsive design
  - Game setup with mode selection (Human vs Human / Human vs AI)
  - Real-time gameplay with visual feedback

- **🤖 Advanced AI System**
  - Level 1: Random moves for beginners
  - Level 2: Defensive play - blocks opponent wins
  - Level 3: Basic strategy - win/block/center/corner priority
  - Level 4-6: Minimax algorithm with increasing depth
  - Alpha-beta pruning for optimal performance
  - Move ordering heuristics and memoization caching
  - Hint system for human players

- **💻 Complete Web Integration**
  - Game setup page with intuitive difficulty selection
  - Interactive 3×3 game board with click handling
  - Real-time game status and player turn indicators
  - AI "thinking" animations and performance metrics
  - Mobile-responsive design with touch support
  - Accessibility features (ARIA labels, keyboard navigation)

- **🏗️ Technical Implementation**
  - TypeScript strict mode with comprehensive type safety
  - 87.63% test coverage with 59 passing tests
  - Framework integration using GameEngineAPI interface
  - Clean architecture with separation of concerns
  - ESM build system with proper module exports

### Enhanced
- **Games Page**: Updated to show Tic-Tac-Toe as "Ready to Play!"
- **Routing System**: Added `/games/tic-tac-toe` and `/games/tic-tac-toe/play` routes
- **CSS Framework**: Comprehensive styling system for game components
- **Package Structure**: Added `@gpg/tic-tac-toe` game package

### Technical Details
- **Game Engine**: Complete rule validation, win/draw detection
- **AI Performance**: Level 6 AI is mathematically unbeatable
- **UI/UX**: Smooth animations, visual feedback, responsive design
- **Testing**: Unit tests for engine, AI, and utilities
- **Architecture**: Clean integration with existing framework

### Performance Improvements
- AI responses under 500ms for all difficulty levels
- Efficient minimax with caching (avg 91.8% cache hit rate)
- Smooth UI transitions and hover effects
- Optimized bundle size with tree-shaking

### Game Features
- Human vs Human local multiplayer
- Human vs AI with 6 difficulty levels
- Game statistics (moves, time, AI performance)
- Hint system powered by Level 6 AI
- Visual win/draw announcements
- Play again functionality

## [0.1.0] - 2025-09-26


### Added
- Framework MVP release preparation
- Comprehensive versioning and release strategy


### Added
- **Framework MVP - Complete foundation for graph paper games**
- Core framework components:
  - EventBus system with typed events and wildcard subscriptions
  - GridRenderer with canvas-based rendering and theme support
  - TurnManager for turn-based game logic and validation
  - GameHUD for player interfaces and game controls
  - Theme system with paper texture and high contrast themes
- Shared type system with comprehensive interfaces:
  - Grid system types (coordinate, cell state, grid configuration)
  - Player system types (player refs, scores, capabilities)
  - Game state and move validation types
  - Event system types and error handling
- Web application shell:
  - Complete navigation with React Router
  - HomePage with feature showcase
  - DemoPage with interactive GridRenderer demonstration
  - Game Loop Demo with full turn-based gameplay
  - GamesPage with development roadmap
  - AboutPage with project information
- Interactive game loop demonstration:
  - Complete 3-in-a-row gameplay
  - Turn management and win condition detection
  - EventBus integration with real-time logging
  - Game controls (pause, resume, reset)
  - Player state management
- Comprehensive test coverage:
  - EventBus tests with 100% statement coverage
  - GameHUD tests with comprehensive UI validation
  - Grid renderer test infrastructure
  - Framework integration testing
- Development infrastructure:
  - TypeScript strict mode configuration
  - ESLint and Prettier setup
  - Vite build system with React
  - pnpm workspace management
  - Vitest testing framework
- Documentation:
  - Project README with overview and getting started
  - Architecture documentation
  - Framework API documentation
  - Development guidelines
  - Versioning and release strategy

### Technical Details
- **TypeScript**: Full type safety with strict mode
- **React 18**: Modern React patterns with hooks and functional components
- **Canvas Rendering**: High-performance grid rendering with theme support
- **Event-Driven Architecture**: Decoupled component communication
- **Monorepo Structure**: Clean separation of concerns across packages
- **Test Coverage**: 96%+ coverage on critical framework components
- **Build System**: Vite for fast development and optimized production builds

### Performance
- Sub-150ms move rendering (P95)
- Responsive design supporting mobile, tablet, and desktop
- Optimized canvas rendering with efficient redraw cycles
- Lightweight bundle size with tree-shaking

### Browser Support
- Modern browsers with ES2022 support
- Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

---

## Development Phase Summary

### Phase 0: Foundations ✅
- Repository setup and development tooling
- CI/CD pipeline with GitHub Actions
- Documentation structure and guidelines

### Phase 1: Framework MVP ✅  
- Core framework components implemented and tested
- Web application shell with complete navigation
- Interactive demonstrations and game loop
- Comprehensive test coverage and documentation
- **Release 0.1.0** - Framework MVP

### Phase 2: First Complete Game ✅
- Complete Tic-Tac-Toe implementation with AI
- Advanced 6-level AI system with minimax
- Web integration with responsive design
- **Release 0.2.0** - First Complete Game

### Phase 3: Game Library Expansion 📋
- Additional games (Connect Four, Dots and Boxes, Battleship)
- Improved AI system with multiple difficulty levels
- Enhanced UI/UX and animations
- **Target: Release 0.3.0 - 0.5.0**

### Phase 4: Platform Maturity 📋
- Stable framework APIs
- Complete local gameplay experience
- Performance optimization and accessibility improvements
- **Target: Release 1.0.0** - Stable framework API

---

[Unreleased]: https://github.com/brentaenck/graph-paper-games/compare/v0.4.0...HEAD
[0.4.0]: https://github.com/brentaenck/graph-paper-games/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/brentaenck/graph-paper-games/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/brentaenck/graph-paper-games/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/brentaenck/graph-paper-games/releases/tag/v0.1.0
