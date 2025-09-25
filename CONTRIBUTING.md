# Contributing to Graph Paper Games

Thank you for your interest in contributing to Graph Paper Games! This document provides guidelines and information for contributors.

## 🚀 Quick Start

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/graph-paper-games.git`
3. Install dependencies: `pnpm install`
4. Create a feature branch: `git checkout -b feature/your-feature-name`
5. Make your changes and commit them
6. Push to your fork and submit a pull request

## 📋 Types of Contributions

### 🐛 Bug Reports
- Use the bug report template
- Include steps to reproduce
- Provide environment details
- Add screenshots if applicable

### ✨ Feature Requests
- Use the feature request template
- Explain the use case and benefits
- Consider implementation complexity
- Discuss with the community first for major features

### 🎮 New Games
- Review existing games for patterns
- Follow the game implementation guide
- Include comprehensive tests
- Document game rules and strategy
- Ensure AI implementation

### 📚 Documentation
- Fix typos and improve clarity
- Add missing documentation
- Create tutorials and guides
- Update outdated information

## 🔧 Development Setup

### Prerequisites
- Node.js 18+ and pnpm 8+
- Git
- Modern browser for testing

### Environment Setup
```bash
# Clone the repository
git clone https://github.com/your-org/graph-paper-games.git
cd graph-paper-games

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run tests
pnpm test

# Type check
pnpm typecheck

# Lint code
pnpm lint
```

### Development Scripts
- `pnpm dev` - Start development server
- `pnpm build` - Build all packages
- `pnpm test` - Run all tests
- `pnpm test:watch` - Run tests in watch mode
- `pnpm lint` - Lint code
- `pnpm lint:fix` - Fix linting issues
- `pnpm typecheck` - Type checking

## 📝 Code Standards

### Code Style
- Use TypeScript for all code
- Follow ESLint and Prettier configurations
- Write meaningful commit messages (conventional commits)
- Add JSDoc comments for public APIs

### Testing Requirements
- Write unit tests for all new functionality
- Maintain or improve code coverage
- Add integration tests for game logic
- Include E2E tests for critical flows

### Game Implementation Standards
- Implement the `GameInterface`
- Follow the framework patterns
- Include comprehensive AI implementation
- Provide clear game documentation
- Add visual tests for UI components

## 🎯 Pull Request Process

### Before Submitting
- [ ] Tests pass locally
- [ ] Code follows style guidelines
- [ ] Documentation is updated
- [ ] Commit messages follow conventional commits
- [ ] Branch is up to date with develop

### PR Requirements
- Use the appropriate PR template
- Link related issues
- Add screenshots for UI changes
- Request review from maintainers
- Respond to feedback promptly

### Review Process
1. Automated checks must pass
2. At least one maintainer review required
3. Address feedback and update PR
4. Maintainer merges when approved

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

## 🤝 Community Guidelines

### Communication
- Be respectful and inclusive
- Ask questions in GitHub Discussions
- Join our Discord for real-time chat
- Participate in community calls

### Code of Conduct
- Follow our Code of Conduct
- Report issues to maintainers
- Help create a welcoming environment

### Getting Help
- Check existing documentation
- Search GitHub issues and discussions
- Ask questions in Discord
- Attend community calls

## 🏷️ Issue Labels

- `good first issue` - Good for newcomers
- `help wanted` - Community help needed
- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements to documentation
- `game` - Related to specific games
- `framework` - Framework/core changes
- `priority:high` - High priority issues

## 📊 Recognition

### Contributors
- All contributors listed in README
- Monthly contributor highlights
- Conference speaking opportunities
- Project swag for regular contributors

### Achievement System
- 🥇 First PR merged
- 🎮 Game creator (implemented new game)
- 🐛 Bug hunter (found and fixed bugs)
- 📚 Documentarian (documentation contributions)
- 🤝 Helper (answered questions, helped others)

## 📈 Progression Path

### New Contributor
- Start with `good first issue`
- Fix documentation or small bugs
- Learn codebase and conventions

### Regular Contributor
- Implement game features
- Review other PRs
- Help with community support

### Maintainer
- Merge PRs and manage releases
- Guide project direction
- Mentor new contributors

## 📞 Getting in Touch

- GitHub Discussions: General questions and ideas
- Discord: Real-time chat and support
- Email: security@graphpapergames.dev (security issues)
- Twitter: @GraphPaperGames (updates and announcements)

## 📄 License

By contributing, you agree that your contributions will be licensed under the same license as the project (MIT License).

---

Thank you for contributing to Graph Paper Games! 🎲