# Versioning and Release Strategy

This document outlines the versioning and release strategy for the Graph Paper Games project.

## Table of Contents

- [Overview](#overview)
- [Semantic Versioning](#semantic-versioning)
- [Release Types](#release-types)
- [Branching Strategy](#branching-strategy)
- [Release Process](#release-process)
- [Version Synchronization](#version-synchronization)
- [Changelog Management](#changelog-management)
- [Pre-release Strategy](#pre-release-strategy)
- [Breaking Changes](#breaking-changes)
- [Tooling and Automation](#tooling-and-automation)

## Overview

Graph Paper Games follows a **modified Semantic Versioning (SemVer)** approach aligned with our development phases and community-first open source strategy. This ensures predictable releases, clear communication of changes, and stable APIs for contributors and users.

## Semantic Versioning

We use **Semantic Versioning 2.0.0** with the format: `MAJOR.MINOR.PATCH`

### Version Components

- **MAJOR** (`X.0.0`): Breaking changes to public APIs, major architectural changes, or completion of major development phases
- **MINOR** (`0.X.0`): New features, new games, significant enhancements that maintain backward compatibility
- **PATCH** (`0.0.X`): Bug fixes, documentation updates, performance improvements, minor UI updates

### Pre-release Identifiers

- **Alpha** (`0.1.0-alpha.1`): Early development, unstable, internal testing
- **Beta** (`0.1.0-beta.1`): Feature-complete for a release, external testing
- **Release Candidate** (`0.1.0-rc.1`): Final testing before release, no new features

## Release Types

### Phase-Based Major Releases

Our major releases align with development phases:

- **0.x.x**: Pre-1.0 development (current)
- **1.0.0**: Framework stable, first complete game with AI
- **2.0.0**: Multiplayer system stable
- **3.0.0**: Full game library with hardened platform

### Feature Releases (Minor)

- New games added to the library
- Major framework enhancements
- New platform capabilities (PWA, mobile support)
- Significant UI/UX improvements

### Maintenance Releases (Patch)

- Bug fixes and stability improvements
- Security patches
- Documentation updates
- Performance optimizations
- Minor UI adjustments

## Branching Strategy

### Main Branches

- **`main`**: Production-ready code, always stable
- **`develop`**: Integration branch for ongoing development
- **`release/X.Y.Z`**: Release preparation branches

### Feature Branches

- **`feature/description`**: New features and enhancements
- **`game/game-name`**: New game implementations
- **`fix/description`**: Bug fixes
- **`hotfix/description`**: Critical fixes for production

### Release Flow

```
develop → release/X.Y.Z → main → tag vX.Y.Z
    ↑                         ↓
feature branches          hotfix branches
```

## Release Process

### 1. Pre-Release Planning

- [ ] Review roadmap alignment
- [ ] Assess breaking changes
- [ ] Update documentation
- [ ] Ensure test coverage targets met
- [ ] Performance benchmarks validated

### 2. Release Branch Creation

```bash
# Create release branch from develop
git checkout develop
git checkout -b release/X.Y.Z

# Update versions across monorepo
pnpm version:update X.Y.Z

# Update CHANGELOG.md
pnpm changelog:generate
```

### 3. Release Testing

- [ ] Full test suite passes (`pnpm test`)
- [ ] Build successful (`pnpm build`)
- [ ] TypeScript compilation clean (`pnpm typecheck`)
- [ ] Linting passes (`pnpm lint`)
- [ ] Manual testing of key features
- [ ] Cross-browser compatibility check
- [ ] Mobile responsiveness verification

### 4. Release Finalization

```bash
# Merge release branch to main
git checkout main
git merge --no-ff release/X.Y.Z

# Create and push tag
git tag -a vX.Y.Z -m "Release version X.Y.Z"
git push origin main --tags

# Merge back to develop
git checkout develop
git merge --no-ff release/X.Y.Z

# Clean up release branch
git branch -d release/X.Y.Z
```

### 5. Post-Release

- [ ] GitHub Release created with changelog
- [ ] Documentation updated
- [ ] Demo deployment updated
- [ ] Community announcement
- [ ] NPM packages published (if applicable)

## Version Synchronization

### Monorepo Versioning

All packages in the monorepo share the same version number to maintain consistency:

- `@gpg/framework`: Core framework package
- `@gpg/shared`: Shared types and utilities
- `@gpg/apps-web`: Web application (private, not published)

### Workspace Dependencies

- Framework packages use `workspace:*` for internal dependencies
- This ensures local development always uses latest versions
- Published packages resolve to specific versions

## Changelog Management

### Format

We follow [Keep a Changelog](https://keepachangelog.com/) format:

```markdown
## [X.Y.Z] - YYYY-MM-DD

### Added
- New features and games

### Changed
- Changes in existing functionality

### Deprecated
- Soon-to-be removed features

### Removed
- Features removed in this release

### Fixed
- Bug fixes

### Security
- Security improvements
```

### Categories

- **Added**: New features, games, components
- **Changed**: Modifications to existing features
- **Deprecated**: Features planned for removal
- **Removed**: Features removed in this release
- **Fixed**: Bug fixes and corrections
- **Security**: Security-related changes

## Pre-release Strategy

### Development Phases

- **Phase 0-1**: `0.x.x-alpha.x` - Core framework development
- **Phase 2**: `1.0.0-beta.x` - First complete game integration
- **Phase 3**: `2.0.0-alpha.x` - Multiplayer system development

### Beta Testing

- Framework API stability testing
- Game balance and AI testing  
- Performance and compatibility testing
- Community feedback integration

### Release Candidates

- Final testing before major releases
- No new features, only critical fixes
- Minimum 1 week testing period

## Breaking Changes

### Communication Strategy

- **Advance Notice**: Breaking changes announced at least one minor version early
- **Migration Guides**: Detailed guides for upgrading between major versions
- **Deprecation Warnings**: Clear warnings in code and documentation
- **Backward Compatibility**: Maintained where possible during transition periods

### API Stability

- **Framework APIs**: Stable from v1.0.0
- **Game Interfaces**: Stable per game from initial release
- **Internal APIs**: May change without notice in pre-1.0 releases

## Tooling and Automation

### Version Management

```bash
# Update all package versions
pnpm version:update <version>

# Generate changelog
pnpm changelog:generate

# Create release tag
pnpm release:tag <version>
```

### CI/CD Integration

- Automated testing on all branches
- Build validation on release branches
- Automatic deployment of tagged releases
- NPM package publishing (future)

### Release Checklist

Each release follows a comprehensive checklist:

- [ ] Code freeze on release branch
- [ ] Version numbers updated
- [ ] Changelog updated
- [ ] Documentation current
- [ ] Tests passing (100% on critical paths)
- [ ] Performance benchmarks met
- [ ] Security audit clean
- [ ] Cross-platform testing complete
- [ ] Community notification prepared

## Current Release Status

### Version 0.1.0 (Framework MVP)

**Status**: Ready for release  
**Target Date**: Current  
**Scope**: Complete framework foundation with web application

**Includes**:
- ✅ Core framework components (EventBus, GridRenderer, TurnManager, GameHUD)
- ✅ Shared types and utilities
- ✅ Web application shell with navigation
- ✅ Interactive demos and game loop
- ✅ Comprehensive test coverage
- ✅ Documentation and examples

### Next Planned Releases

- **0.2.0**: Complete Tic-Tac-Toe game with AI (Phase 2.1)
- **0.3.0**: Additional games (Connect Four, Dots and Boxes)
- **1.0.0**: Stable framework API, complete local gameplay
- **2.0.0**: Multiplayer system integration

---

This versioning strategy ensures predictable releases, clear communication of changes, and a stable foundation for the growing Graph Paper Games community.