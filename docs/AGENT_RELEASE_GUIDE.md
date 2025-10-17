# Agent Release Guide - Graph Paper Games

This guide provides **step-by-step instructions for Warp AI agents** to consistently handle releases and versioning for the Graph Paper Games project.

## 🎯 Quick Reference for Agents

### Current Versioning Strategy
- **Hybrid Monorepo Approach**: Core packages synchronized, games independent
- **Semantic Versioning**: MAJOR.MINOR.PATCH for all packages
- **GitHub Flow**: Work on main branch, use feature branches, tag releases
- **Automated Release Script**: Use `scripts/release.sh` for consistency

### Current Version State
```
Core Framework (Synchronized):
@gpg/root, @gpg/apps-web, @gpg/framework, @gpg/shared: 0.7.0

Games (Independent):
@gpg/dots-and-boxes: 1.0.0 (Production Ready)
@gpg/tic-tac-toe: 0.2.0 (Feature Complete)  
@gpg/sprouts: 1.0.0 (Production Ready)
```

## 📋 Agent Decision Matrix

### When to Increment Versions

| Change Type | Core Framework | Games | Version Type | Example |
|-------------|---------------|--------|-------------|---------|
| New game added | MINOR | - | 0.7.0 → 0.8.0 | Add Connect Four |
| Game bug fix | - | PATCH | 1.0.0 → 1.0.1 | Fix AI move validation |
| Game feature | - | MINOR | 0.2.0 → 0.3.0 | Add difficulty levels |
| Framework enhancement | MINOR | - | 0.7.0 → 0.8.0 | New grid renderer |
| Breaking framework change | MAJOR | - | 0.7.0 → 1.0.0 | API restructure |
| Critical security fix | PATCH | PATCH | Any → +0.0.1 | Security patch |

### Version Number Guidelines

**For Core Framework Packages:**
- Stay synchronized across `@gpg/root`, `@gpg/apps-web`, `@gpg/framework`, `@gpg/shared`
- Increment for framework changes, new features, or when games are integrated

**For Individual Games:**
- Version independently based on game maturity
- Use 1.0.0 for production-ready games with full features
- Use 0.x.x for games in development

## 🚀 Step-by-Step Release Process

### 1. Pre-Release Assessment

**ALWAYS CHECK THESE FIRST:**

```bash
# Verify you're on main branch
git branch --show-current
# Should output: main

# Check for uncommitted changes
git status
# Should be clean working directory

# Verify all quality checks pass
pnpm typecheck && pnpm lint && pnpm test && pnpm build
# All must pass before proceeding
```

### 2. Determine Version Type

**Ask yourself:**
1. What type of changes are included?
2. Are there breaking changes?
3. Is this a new game or core framework change?
4. Which packages need version updates?

**Examples:**
- Bug fix in Tic-Tac-Toe: Update only `@gpg/tic-tac-toe` PATCH
- New framework feature: Update core packages MINOR
- New complete game: Update core packages MINOR + game to 1.0.0

### 3. Update CHANGELOG First

**CRITICAL**: Always update CHANGELOG.md before running release script.

```markdown
## [Unreleased]

### Added
- New Connect Four game with 6-level AI system
- Advanced move validation system
- Mobile-responsive game board

### Enhanced  
- Framework grid renderer performance improvements
- Better error handling in game engine

### Fixed
- Fixed AI move selection bug in Tic-Tac-Toe
- Corrected responsive design issues on tablet
```

### 4. Manual Version Updates (If Needed)

**For Game-Only Updates:**
```bash
# Update specific game version
cd games/tic-tac-toe
# Edit package.json version manually
# 0.2.0 → 0.2.1 for bug fix
# 0.2.0 → 0.3.0 for new feature
```

**For Core Framework Updates:**
Use the release script (next step) which handles core package synchronization.

### 5. Run Release Script (For Core Updates)

```bash
# For synchronized core package updates
bash scripts/release.sh 0.8.0

# This will:
# - Validate you're on main branch
# - Run all quality checks
# - Update core package.json files
# - Update CHANGELOG.md
# - Create commit with version changes
# - Provide next steps
```

### 6. Create Git Tag

**For All Releases (Core or Game-Only):**

```bash
# After manual updates or release script
git tag -a v0.8.0 -m "Release v0.8.0: Add Connect Four game"
git push origin main --tags
```

**Tag Naming Convention:**
- Use `vX.Y.Z` format (lowercase 'v')
- Single tag per release
- Descriptive message explaining the release

### 7. Post-Release Verification

```bash
# Verify tag was created
git tag --list --sort=-version:refname | head -5

# Check package versions match expectations
find . -name "package.json" -not -path "./node_modules/*" | xargs grep '"version"' | sort

# Verify build still works
pnpm typecheck && pnpm lint && pnpm build
```

## ⚡ Common Agent Scenarios

### Scenario 1: Bug Fix in Single Game

```bash
# 1. Fix the bug in games/tic-tac-toe/src/
# 2. Update version
cd games/tic-tac-toe
# Edit package.json: 0.2.0 → 0.2.1

# 3. Update CHANGELOG.md
# Add bug fix to [Unreleased] section

# 4. Commit and tag
git add .
git commit -m "fix(tic-tac-toe): correct AI move selection bug"
git tag -a v0.2.1-tic-tac-toe -m "Fix: Tic-Tac-Toe AI move selection"
git push origin main --tags
```

### Scenario 2: New Complete Game

```bash
# 1. Implement complete game in games/new-game/
# 2. Set game version to 1.0.0 in package.json
# 3. Update CHANGELOG.md with game details
# 4. Use release script for core framework
bash scripts/release.sh 0.8.0
# 5. Follow release script instructions
# 6. Tag will be created as part of process
```

### Scenario 3: Framework Enhancement

```bash
# 1. Implement framework changes in packages/framework/
# 2. Update CHANGELOG.md
# 3. Use release script
bash scripts/release.sh 0.8.0
# 4. All core packages will be synchronized
# 5. Follow release script instructions
```

### Scenario 4: Hotfix for Critical Issue

```bash
# 1. Create hotfix branch
git checkout -b hotfix/critical-security-fix

# 2. Apply minimal fix
# 3. Update affected package versions (+0.0.1)
# 4. Update CHANGELOG.md

# 5. Merge to main
git checkout main
git merge --no-ff hotfix/critical-security-fix

# 6. Tag immediately
git tag -a v0.7.1 -m "Hotfix v0.7.1: Critical security fix"
git push origin main --tags

# 7. Clean up
git branch -d hotfix/critical-security-fix
```

## 🛡️ Agent Safety Checks

### Before Any Release

- [ ] All tests pass (`pnpm test`)
- [ ] TypeScript compiles (`pnpm typecheck`)
- [ ] Linting passes (`pnpm lint`) 
- [ ] Build succeeds (`pnpm build`)
- [ ] CHANGELOG.md is updated
- [ ] Version numbers follow semantic versioning
- [ ] No uncommitted changes

### Version Consistency Checks

```bash
# Check version consistency
npm run version:check # (if script exists)

# Manual verification
echo "Core packages should be synchronized:"
grep '"version"' package.json packages/*/package.json apps/*/package.json

echo "Game packages can be independent:"
grep '"version"' games/*/package.json
```

## 🚨 Common Pitfalls & Solutions

### ❌ Don't: Mix Core and Game Updates
```bash
# Wrong: Updating both core and game versions inconsistently
```

### ✅ Do: Separate Updates Clearly
```bash
# Right: Update games independently, core packages together
```

### ❌ Don't: Skip CHANGELOG Updates
```bash
# Wrong: Creating releases without documenting changes
```

### ✅ Do: Always Update CHANGELOG First
```bash
# Right: Document changes before versioning
```

### ❌ Don't: Use Inconsistent Tag Names
```bash
git tag framework-v0.8.0  # Wrong
git tag v0.8.0-beta       # Wrong format
```

### ✅ Do: Follow Standard Tag Naming
```bash
git tag -a v0.8.0 -m "Release v0.8.0"  # Correct
```

## 📚 Reference Documents

- **VERSIONING.md**: Detailed versioning strategy
- **RELEASE_CHECKLIST.md**: Comprehensive release checklist
- **CONTRIBUTING.md**: Development and quality standards
- **WARP.md**: Project-specific agent rules
- **scripts/release.sh**: Automated release script

## 🔍 When in Doubt

1. **Check existing patterns**: Look at git log and previous releases
2. **Use release script**: For core updates, always use `scripts/release.sh`
3. **Verify with commands**: Run quality checks before and after
4. **Follow semantic versioning**: When unsure, err on the side of smaller increments
5. **Document everything**: Update CHANGELOG.md thoroughly

## 📞 Quick Command Reference

```bash
# Check current state
git status && git branch --show-current

# Quality checks
pnpm typecheck && pnpm lint && pnpm test && pnpm build

# Version verification  
find . -name "package.json" -not -path "./node_modules/*" | xargs grep '"version"'

# Create release
bash scripts/release.sh X.Y.Z  # For core updates
git tag -a vX.Y.Z -m "Release description"  # For all releases

# Push release
git push origin main --tags
```

---

**Remember**: This project values consistency and quality. When in doubt, take time to verify your changes follow established patterns and pass all quality checks before releasing.