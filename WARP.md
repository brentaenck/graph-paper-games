# Graph Paper Games - Warp Agent Rules

These rules provide context and constraints for Warp AI agents working on the
Graph Paper Games project.

## Project Context Rules

### Repository Information

- This is a TypeScript monorepo using pnpm workspaces
- Current phase: Foundation setup (Phase 0) - framework development
- Architecture: React frontend + Node.js backend + shared game framework
- SDLC: Modified GitFlow with community-first open source approach

### Development Standards

- Use TypeScript strict mode - no `any` types without explicit justification
- Maintain 80%+ test coverage for all new code
- Follow conventional commit format: `type(scope): description`
- All public APIs must have JSDoc documentation
- Games must implement the standardized `GameInterface`

### Code Organization Rules

- Framework code goes in `packages/framework/`
- Shared types and utilities in `packages/shared/`
- Individual games in `games/[game-name]/`
- Web app code in `apps/web/`
- Documentation in `docs/`

### Testing Requirements

- Write unit tests alongside implementation code
- Use integration tests for API endpoints and game state transitions
- Include E2E tests for critical user flows
- Test files should be in `__tests__/` or `*.test.ts` files
- Use Jest/Vitest for testing framework

### Game Implementation Rules

- All games must implement `GameEngineAPI` interface
- Include AI opponent implementation for all difficulties (1-6)
- Support grid-based interactions using standardized coordinate system
- Handle multiplayer state synchronization properly
- Follow accessibility guidelines (WCAG 2.1)
- Support mobile, tablet, and desktop screen sizes

## Command Guidelines

### Preferred Commands

- Use `pnpm` instead of `npm` or `yarn`
- Use `pnpm --filter [package]` for package-specific commands
- Use `pnpm -r` for recursive operations across all packages
- Use TypeScript compilation before running code

### Build and Development

- `pnpm dev` - Start development server
- `pnpm build` - Build all packages
- `pnpm test` - Run test suite
- `pnpm lint` - Run linting and formatting
- `pnpm typecheck` - Type checking

### Package Management

- Add dependencies with `pnpm --filter @gpg/[package] add [dependency]`
- Check for outdated dependencies with `pnpm outdated`
- Update dependencies cautiously and test thoroughly

## Code Quality Rules

### TypeScript Standards

- Use interfaces for object shapes, types for unions/aliases
- Prefer readonly arrays and objects where appropriate
- Use proper error handling with Result/Either patterns
- Implement proper null/undefined checking

### React Standards

- Use functional components with hooks
- Implement proper prop validation with TypeScript
- Use CSS-in-JS for styling (styled-components or emotion)
- Follow React accessibility guidelines

### Framework Integration

- Always use framework-provided APIs instead of reinventing
- Follow established patterns from existing game implementations
- Use the EventBus for component communication
- Leverage GridRenderer for all grid-based rendering

## Security and Performance Rules

### Security Requirements

- Validate all inputs server-side
- Never trust client state for game logic
- Sanitize user inputs to prevent XSS
- Implement proper rate limiting

### Performance Requirements

- Games should load in under 3 seconds
- Moves should render in under 150ms (P95)
- AI responses should be under 500ms for normal difficulty
- Code should work efficiently on mobile devices

## Documentation Rules

### Required Documentation

- All public APIs must have JSDoc comments
- Game rules must be documented in game README
- Architecture decisions should be recorded as ADRs
- Keep CHANGELOG.md updated for releases

### Documentation Style

- Use clear, concise language
- Include code examples for complex APIs
- Document both happy path and error cases
- Keep documentation up-to-date with code changes

## Git and Version Control Rules

### Branch Naming

- Feature branches: `feature/description-of-feature`
- Game branches: `game/game-name-feature`
- Bug fixes: `fix/description-of-fix`
- Hotfixes: `hotfix/critical-issue`

### Commit Guidelines

- Use conventional commits: `type(scope): description`
- Types: feat, fix, docs, style, refactor, test, chore
- Keep commits atomic and focused
- Write clear commit messages

### Pull Request Requirements

- Link to related issues
- Include tests for new functionality
- Update documentation as needed
- Ensure CI checks pass
- Request appropriate reviewers

## AI-Specific Guidelines

### When Implementing Features

1. Read existing similar implementations first
2. Check interface compatibility
3. Write tests alongside code
4. Follow established patterns
5. Update relevant documentation

### When Debugging

1. Check TypeScript compilation errors first
2. Review test failures for clues
3. Check browser console for runtime errors
4. Verify package dependencies are correct
5. Test across different screen sizes

### When Working with Games

1. Understand the game rules thoroughly
2. Implement game state immutably
3. Ensure move validation is comprehensive
4. Test edge cases and invalid states
5. Implement proper win/lose/draw detection

## Error Handling Rules

### Frontend Error Handling

- Use React Error Boundaries for component errors
- Implement proper loading and error states
- Show user-friendly error messages
- Log errors for debugging

### Backend Error Handling

- Return structured error responses
- Use appropriate HTTP status codes
- Log errors with proper context
- Implement graceful fallbacks

### Game Logic Error Handling

- Validate moves before applying them
- Handle invalid game states gracefully
- Provide clear feedback for invalid actions
- Implement proper game recovery

## Accessibility Rules

### UI Accessibility

- Use semantic HTML elements
- Implement proper ARIA labels
- Ensure keyboard navigation works
- Test with screen readers
- Maintain color contrast ratios

### Game Accessibility

- Provide alternative input methods
- Include text descriptions for visual elements
- Support high contrast mode
- Implement proper focus management
- Ensure games work without color differentiation

---

These rules should guide all development work on the Graph Paper Games project.
When in doubt, prioritize code quality, user experience, and maintainability.
