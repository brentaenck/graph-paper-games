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

### Pre-Release Validation (On Main Branch)

```bash
# Ensure you're on main branch with all changes
git checkout main
git pull origin main

# Run full validation
pnpm test
pnpm typecheck
pnpm lint
pnpm build
```

**Pre-Release Checklist:**

- [ ] All automated tests pass
- [ ] Build succeeds without warnings
- [ ] TypeScript compilation clean
- [ ] Linting passes with no errors
- [ ] Web app builds successfully
- [ ] All features ready for release

### Manual Testing

**Framework Components:**

- [ ] EventBus: Events emit and subscribe correctly
- [ ] GridRenderer: Canvas renders, themes work, interactions respond
- [ ] TurnManager: API functions correctly (if integrated)
- [ ] GameHUD: UI displays correctly (if integrated)

**Web Application:**

- [ ] Navigation works between all pages
- [ ] HomePage loads and displays correctly
- [ ] DemoPage: GridRenderer demo functional
- [ ] Game demos: All games playable end-to-end
- [ ] GamesPage: Information accurate and up-to-date
- [ ] AboutPage: Project information current

**Responsive Design:**

- [ ] Desktop: 1920x1080 and 1366x768
- [ ] Tablet: iPad (1024x768) and Android tablet
- [ ] Mobile: iPhone (375x667) and Android phone

### Release Creation

```bash
# Ensure main branch is ready
git checkout main
git pull origin main

# Create and push release tag
git tag -a v0.X.Y -m "Release version 0.X.Y: [Brief description]"
git push origin main --tags

# CI/CD will handle deployment automatically
```

**Release Validation:**

- [ ] Release tag created correctly
- [ ] CI/CD pipeline triggered successfully
- [ ] Deployment completed without errors
- [ ] Live site reflects new version

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

### Communication (Future)

- [ ] **When ready for public releases:**
  - GitHub release notes
  - Development blog posts
  - Community announcements
  - Social media updates

### Package Publishing (Future)

- [ ] **NPM Package Publishing (when API stable)**
  - Verify npm credentials
  - Run `npm publish` for framework packages
  - Verify packages available on npmjs.com
  - Test installation and usage

## Hotfix Procedure

If critical issues are discovered post-release:

### Immediate Actions

1. **Create Hotfix Branch**
   ```bash
   git checkout main
   git checkout -b hotfix/critical-fix-description
   ```

2. **Apply Fix**
   - Make minimal, targeted changes
   - Test thoroughly
   - Update version number
   - Update CHANGELOG.md

3. **Deploy Hotfix**
   ```bash
   git checkout main
   git merge --no-ff hotfix/critical-fix-description
   git tag -a v0.X.Y+1 -m "Hotfix v0.X.Y+1: Fix critical issue"
   git push origin main --tags
   
   # Clean up
   git branch -d hotfix/critical-fix-description
   ```

### Communication

- [ ] GitHub release with fix details
- [ ] Update documentation if needed
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
