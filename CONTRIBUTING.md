# Contributing to Graph Paper Games

Thank you for your interest in Graph Paper Games! This project is currently in
rapid development phase with a simplified workflow optimized for speed and
quality.

## 🚀 Current Development Status

**Phase**: Solo Development (Phase 1)

- Direct commits to main branch
- Streamlined workflow for rapid iteration
- Quality maintained through automated testing
- Future-ready for community contributions

## 📋 Current Workflow (Solo Development)

```bash
# Create feature branch
git checkout -b feature/new-game-name

# Implement feature with tests
# ... code, test, commit ...

# Merge when ready (no PR required)
git checkout main
git merge feature/new-game-name --no-ff
git push origin main

# Tag releases when appropriate
git tag v0.3.0 -m "Release v0.3.0: Add new game"
git push origin main --tags

# Clean up
git branch -d feature/new-game-name
```

## 🔮 Future Community Contributions

**When we scale to Phase 2**, external contributions will be welcome:

### 🐛 Bug Reports

- GitHub Issues with reproduction steps
- Environment details and screenshots
- Clear description of expected vs actual behavior

### ✨ Feature Requests

- GitHub Discussions for ideas and feedback
- Well-defined use cases and benefits
- Consider implementation complexity

### 🎮 New Games

- Follow the established game framework patterns
- Include comprehensive tests and AI implementation
- Document game rules and strategy
- Ensure responsive design and accessibility

### 📚 Documentation

- Improve clarity and fix typos
- Add missing documentation
- Create tutorials and implementation guides

**Note**: Currently in solo development mode - these will become relevant when
we scale to community contributions.

## 🔧 Development Environment

### Prerequisites

- Node.js 18+ and pnpm 8+
- Git
- Modern browser for testing

### Local Setup

```bash
# Clone the repository
git clone https://github.com/your-org/graph-paper-games.git
cd graph-paper-games

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

### Essential Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build all packages
- `pnpm test` - Run all tests
- `pnpm lint` - Lint and format code
- `pnpm typecheck` - Type checking

## 📝 Code Standards

### Code Style

- TypeScript strict mode (no `any` types)
- ESLint and Prettier configurations enforced
- Conventional commit messages: `type(scope): description`
- JSDoc comments for public APIs

### Quality Requirements

- Unit tests for all new functionality
- Maintain >80% code coverage
- Integration tests for game logic
- All automated checks must pass before merge

### Game Implementation Standards

- Implement the `GameEngineAPI` interface
- Follow established framework patterns
- Include AI implementation for all difficulty levels
- Comprehensive documentation with game rules
- Responsive design and accessibility support

## ⚙️ Quality Assurance

### Pre-merge Checklist

- [ ] All tests pass (`pnpm test`)
- [ ] Code compiles without errors (`pnpm typecheck`)
- [ ] Linting passes (`pnpm lint`)
- [ ] Build succeeds (`pnpm build`)
- [ ] Documentation updated if needed

### Automated Checks (CI/CD)

- TypeScript compilation
- ESLint and Prettier formatting
- Unit and integration tests
- Code coverage analysis
- Security vulnerability scanning

## 🎮 Game Development Guide

### Creating a New Game

1. **Plan the Game**
   - Document rules and objectives
   - Design the game state structure
   - Plan the AI strategy
   - Consider multiplayer aspects

2. **Implementation Steps**

   ```bash
   # Create game package
   mkdir games/your-game-name
   cd games/your-game-name
   # Copy template from existing game
   ```

3. **Required Files**
   - `package.json` - Package configuration
   - `src/index.ts` - Main game export
   - `src/engine.ts` - Game rules implementation
   - `src/component.tsx` - React component
   - `src/ai.ts` - AI implementation
   - `README.md` - Game documentation
   - `__tests__/` - Test files

4. **Implementation Checklist**
   - [ ] Game engine implements `GameEngineAPI`
   - [ ] React component follows framework patterns
   - [ ] AI can play complete games
   - [ ] Unit tests for game logic
   - [ ] Integration tests for user interactions
   - [ ] Documentation includes rules and strategy

### Game Testing

- Test all game rules and edge cases
- Verify AI makes valid moves
- Test multiplayer synchronization
- Check responsive design
- Validate accessibility features

## 🔮 Future Community Guidelines

**When scaling to Phase 2 (Community Contributions):**

### Communication Channels

- GitHub Issues for bug reports and feature requests
- GitHub Discussions for general questions and ideas
- Documentation site for comprehensive guides

### Issue Labels (Future)

- `good first issue` - Good for newcomers
- `bug` - Something isn't working
- `enhancement` - New feature or request
- `game` - Related to specific games
- `framework` - Framework/core changes

## 📞 Contact

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions (when active)
- **Security**: security@graphpapergames.dev

## 📄 License

By contributing, you agree that your contributions will be licensed under the
same license as the project (MIT License).

## 🎯 Current Focus

**Phase 1 Priorities:**

- Framework stabilization
- Core game implementations
- Documentation and testing
- Performance optimization

**Ready for Community Scaling When:**

- Framework API is stable
- Comprehensive documentation exists
- Multiple games are implemented
- Clear contribution patterns established

---

Thank you for your interest in Graph Paper Games! 🎲
