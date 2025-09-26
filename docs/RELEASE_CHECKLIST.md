# Release Checklist

This checklist ensures consistent and reliable releases for Graph Paper Games.

## Pre-Release Preparation

### Planning Phase

- [ ] **Review Roadmap Alignment**
  - Ensure release aligns with planned milestones
  - Verify all intended features are complete
  - Check that no critical features are missing

- [ ] **Breaking Changes Assessment**
  - Document any breaking changes
  - Update migration guides if needed
  - Ensure backward compatibility where possible
  - Add deprecation warnings for future breaking changes

- [ ] **Documentation Review**
  - README.md is current and accurate
  - API documentation is up to date
  - Architecture docs reflect current state
  - Examples and demos are working
  - CHANGELOG.md has all changes documented

### Quality Assurance

- [ ] **Test Coverage Validation**
  - Framework tests: 95%+ coverage target
  - Critical path tests: 100% coverage
  - Integration tests passing
  - Manual testing of key features completed

- [ ] **Performance Benchmarks**
  - Move rendering: < 150ms (P95)
  - Initial load: < 3 seconds
  - Memory usage within acceptable limits
  - No performance regressions detected

- [ ] **Cross-Platform Testing**
  - Chrome 90+ ✓
  - Firefox 88+ ✓
  - Safari 14+ ✓
  - Edge 90+ ✓
  - Mobile Safari (iOS) ✓
  - Chrome Mobile (Android) ✓

- [ ] **Accessibility Validation**
  - Screen reader compatibility tested
  - Keyboard navigation functional
  - Color contrast ratios verified
  - ARIA labels and roles correct

## Release Process

### Step 1: Release Branch Creation

```bash
# Ensure you're on develop branch with latest changes
git checkout develop
git pull origin develop

# Run dry run to validate
pnpm release:dry-run 0.X.Y

# If dry run passes, create release branch
pnpm release:prepare 0.X.Y
```

**Validation Checklist:**

- [ ] Release script completed without errors
- [ ] All package.json files updated to new version
- [ ] CHANGELOG.md updated with release notes
- [ ] Release branch created: `release/0.X.Y`

### Step 2: Release Testing

```bash
# Switch to release branch
git checkout release/0.X.Y

# Full test suite
pnpm test

# Build validation
pnpm build

# TypeScript validation
pnpm typecheck

# Linting validation
pnpm lint
```

**Testing Checklist:**

- [ ] All automated tests pass
- [ ] Build succeeds without warnings
- [ ] TypeScript compilation clean
- [ ] Linting passes with no errors
- [ ] Web app preview works (`pnpm --filter @gpg/apps-web preview`)

### Step 3: Manual Testing

**Framework Components:**

- [ ] EventBus: Events emit and subscribe correctly
- [ ] GridRenderer: Canvas renders, themes work, interactions respond
- [ ] TurnManager: API functions correctly (if integrated)
- [ ] GameHUD: UI displays correctly (if integrated)

**Web Application:**

- [ ] Navigation works between all pages
- [ ] HomePage loads and displays correctly
- [ ] DemoPage: GridRenderer demo functional
- [ ] Game Loop Demo: Full gameplay works end-to-end
- [ ] GamesPage: Information accurate and up-to-date
- [ ] AboutPage: Project information current

**Responsive Design:**

- [ ] Desktop: 1920x1080 and 1366x768
- [ ] Tablet: iPad (1024x768) and Android tablet
- [ ] Mobile: iPhone (375x667) and Android phone

### Step 4: Release Finalization

```bash
# Merge release branch to main
git checkout main
git pull origin main
git merge --no-ff release/0.X.Y

# Create and push tag
git tag -a v0.X.Y -m "Release version 0.X.Y"
git push origin main --tags

# Merge back to develop
git checkout develop
git merge --no-ff release/0.X.Y
git push origin develop

# Clean up release branch
git branch -d release/0.X.Y
git push origin --delete release/0.X.Y
```

**Git Validation:**

- [ ] Main branch updated with release
- [ ] Release tagged correctly
- [ ] Develop branch merged with release changes
- [ ] Release branch cleaned up
- [ ] Remote repositories updated

## Post-Release Activities

### GitHub Release

- [ ] **Create GitHub Release**
  - Go to GitHub repository releases page
  - Click "Create a new release"
  - Select tag: `v0.X.Y`
  - Release title: `Version 0.X.Y - [Release Name]`
  - Description: Copy relevant section from CHANGELOG.md
  - Mark as pre-release if version < 1.0.0

### Documentation Updates

- [ ] **Update Documentation Site** (if applicable)
  - Deploy latest docs
  - Update API reference
  - Refresh examples and tutorials

- [ ] **Demo Deployment**
  - Update live demo with latest version
  - Verify demo functionality
  - Update demo version indicator

### Community Communication

- [ ] **Internal Notification**
  - Team notification of release
  - Update project status boards
  - Note any follow-up items

- [ ] **External Communication** (when ready for public)
  - Social media announcement
  - Development blog post
  - Community forum notification
  - Contributor thank you

### Package Publishing (Future)

- [ ] **NPM Package Publishing** (when stable)
  - Verify npm credentials
  - Run `npm publish` for @gpg/framework
  - Run `npm publish` for @gpg/shared
  - Verify packages available on npmjs.com
  - Test installation: `npm install @gpg/framework`

## Rollback Procedure

If critical issues are discovered post-release:

### Immediate Actions

1. **Create Hotfix Branch**

   ```bash
   git checkout main
   git checkout -b hotfix/0.X.Y+1
   ```

2. **Fix Critical Issues**
   - Apply minimal fix
   - Test thoroughly
   - Update version to patch release

3. **Emergency Release**
   ```bash
   git checkout main
   git merge --no-ff hotfix/0.X.Y+1
   git tag -a v0.X.Y+1 -m "Hotfix version 0.X.Y+1"
   git push origin main --tags
   ```

### Communication

- [ ] Immediate notification to users
- [ ] GitHub release with fix details
- [ ] Update documentation with known issues
- [ ] Post-mortem analysis for prevention

## Release Types

### Major Release (X.0.0)

- Full checklist required
- Extended testing period (minimum 1 week)
- Migration guide required
- Community announcement required

### Minor Release (0.X.0)

- Full checklist required
- Standard testing period
- Feature announcement recommended

### Patch Release (0.0.X)

- Abbreviated checklist (focus on regression testing)
- Fast-track for critical fixes
- Minimal testing period (1-2 days)

---

## Release History Template

### Version 0.X.Y - [Date]

**Release Manager:** [Name] **Duration:** [Preparation to deployment time]

**Testing Summary:**

- Automated tests: ✓ Passed
- Manual testing: ✓ Completed
- Cross-browser testing: ✓ Verified
- Performance testing: ✓ Benchmarks met

**Issues Found:**

- [List any issues found and resolved]

**Post-Release Issues:**

- [List any issues reported after release]

**Lessons Learned:**

- [Key takeaways for future releases]
