# Agent Onboarding Checklist

This checklist helps Warp AI agents get oriented and productive on the Graph Paper Games project.

## 🚀 Getting Started (5 minutes)

### Environment Setup
- [ ] **Verify location**: Confirm you're in the Graph Paper Games directory
- [ ] **Run setup script**: Execute `./scripts/agent-setup.sh` to verify environment
- [ ] **Check dependencies**: Ensure Node.js 18+, pnpm 8+, and git are available
- [ ] **Install packages**: Run `pnpm install` if needed

### Project Understanding
- [ ] **Read project overview**: Review `docs/project-overview.md`
- [ ] **Understand architecture**: Scan `docs/system-architecture.md`
- [ ] **Check current phase**: We're in Phase 0 (Foundation Setup)
- [ ] **Review rules**: Read `.warp/rules.md` for project constraints

## 📚 Essential Documentation (10 minutes)

### Core Documents
- [ ] **Agent Guide**: Read `docs/agent-guide.md` (comprehensive guide)
- [ ] **Quick Reference**: Bookmark `docs/agent-quick-reference.md`
- [ ] **Framework Spec**: Understand `docs/framework-spec.md` (API contracts)
- [ ] **SDLC Strategy**: Review `docs/sdlc-strategy.md` (development process)

### Technical Context
- [ ] **Repository structure**: Understand monorepo layout
- [ ] **TypeScript config**: Check `tsconfig.json` and strict mode settings
- [ ] **Package structure**: Review workspace configuration in `pnpm-workspace.yaml`
- [ ] **CI/CD**: Examine `.github/workflows/ci.yml`

## 🎯 Key Interfaces to Remember

### GameModule Pattern
```typescript
export const GameModule: GameModule = {
  id: 'game-name',
  name: 'Display Name',
  capabilities: { /* ... */ },
  component: GameComponent,
  engine: gameEngine,
  ai: gameAI,
};
```

### GameEngineAPI (Required for all games)
```typescript
interface GameEngineAPI {
  createInitialState(settings, players): GameState;
  validateMove(state, move, player): boolean;
  applyMove(state, move): GameState;
  isTerminal(state): GameOver | null;
  evaluate(state): Scoreboard;
}
```

## 🛠️ Common Commands to Test

### Basic Commands
- [ ] `pnpm install` - Install dependencies
- [ ] `pnpm build` - Build all packages
- [ ] `pnpm test` - Run test suite
- [ ] `pnpm lint` - Check code quality
- [ ] `pnpm typecheck` - TypeScript validation

### Development Commands
- [ ] `pnpm dev` - Start development server
- [ ] `pnpm --filter @gpg/framework build` - Build framework
- [ ] `pnpm --filter @gpg/apps-web dev` - Start web app

## 🧪 Testing Your Understanding

### Quick Checks
- [ ] **Can you explain the GameInterface?** All games must implement it
- [ ] **What are the 5 key principles?** Framework-first, community-driven, quality-first, accessibility, multiplayer
- [ ] **What's the current project phase?** Phase 0 - Foundation setup
- [ ] **What testing is required?** 80%+ coverage, unit + integration + E2E tests

### Practical Tasks
- [ ] **Navigate the codebase**: Find the framework, shared, and games directories
- [ ] **Check build status**: Verify what builds successfully vs. what needs implementation
- [ ] **Find templates**: Locate `templates/` directory for game scaffolding
- [ ] **Test a command**: Try running a package-specific command

## 🎮 Game Development Readiness

### Framework Understanding
- [ ] **Grid system**: Understand standardized coordinate system
- [ ] **State management**: Know how game state flows through framework
- [ ] **Event system**: Understand EventBus for component communication
- [ ] **AI integration**: Know the 6-difficulty AI scaling approach

### Implementation Patterns
- [ ] **File structure**: Know the standard game package layout
- [ ] **Testing strategy**: Understand unit/integration/E2E test requirements
- [ ] **UI patterns**: Know React component conventions
- [ ] **Error handling**: Understand Result types and error boundaries

## 🚦 Development Workflow

### Before Starting Work
1. [ ] Check current branch: `git branch --show-current`
2. [ ] Pull latest changes: `git pull`
3. [ ] Install dependencies: `pnpm install`
4. [ ] Verify build: `pnpm build`
5. [ ] Run tests: `pnpm test`

### During Development
1. [ ] Follow TDD: Write tests first
2. [ ] Use TypeScript strictly: No `any` types
3. [ ] Write JSDoc for public APIs
4. [ ] Test on mobile and desktop
5. [ ] Check accessibility

### Before Submitting
1. [ ] Tests pass: `pnpm test`
2. [ ] No lint errors: `pnpm lint`
3. [ ] Types valid: `pnpm typecheck`
4. [ ] Build succeeds: `pnpm build`
5. [ ] Documentation updated

## ⚡ Performance and Quality Gates

### Performance Expectations
- [ ] **Games load in < 3 seconds**
- [ ] **Moves render in < 150ms (P95)**
- [ ] **AI responds in < 500ms (normal difficulty)**
- [ ] **Works on mobile devices**

### Quality Standards
- [ ] **80%+ test coverage**
- [ ] **TypeScript strict mode**
- [ ] **Accessibility WCAG 2.1**
- [ ] **No console errors**

## 🔧 Troubleshooting

### Common Issues
- [ ] **Build fails**: Check TypeScript errors first
- [ ] **Tests fail**: Look at test output for specific failures
- [ ] **Runtime errors**: Check browser console
- [ ] **Dependency issues**: Verify pnpm lockfile integrity

### Debugging Resources
- [ ] **Setup script**: `./scripts/agent-setup.sh` for environment check
- [ ] **Agent guide**: `docs/agent-guide.md` for detailed debugging tips
- [ ] **Framework debugging**: Use EventBus and state logging
- [ ] **Git status**: Check for uncommitted changes affecting build

## 🎯 Ready to Contribute!

Once you've completed this checklist, you should be ready to:

- **Understand the project** structure and goals
- **Use the framework** APIs correctly
- **Write quality code** that meets project standards
- **Test thoroughly** with comprehensive coverage
- **Debug effectively** when issues arise

### Next Steps
1. **Pick a task** from the current roadmap phase
2. **Follow the patterns** established in existing code
3. **Write tests first** (TDD approach)
4. **Ask questions** through the appropriate channels
5. **Contribute meaningfully** to the open source community

---

**Welcome to the Graph Paper Games development team! 🎲**

For questions or clarification, refer to the comprehensive documentation in the `docs/` directory.