#!/usr/bin/env bash

# Graph Paper Games Release Script
# This script automates the release process following our versioning strategy

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_step() {
    echo -e "${BLUE}==== $1 ====${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
    exit 1
}

# Check if version argument is provided
if [ $# -eq 0 ]; then
    print_error "Usage: $0 <version> [--dry-run]"
    echo "Example: $0 0.1.0"
    echo "         $0 0.2.0-beta.1"
    echo "         $0 0.1.1 --dry-run"
    exit 1
fi

VERSION=$1
DRY_RUN=false

if [ "$2" = "--dry-run" ]; then
    DRY_RUN=true
    print_warning "DRY RUN MODE - No changes will be made"
fi

# Validate version format (basic semver check)
if ! [[ $VERSION =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
    print_error "Invalid version format. Use semantic versioning (e.g., 0.1.0, 1.0.0-beta.1)"
fi

print_step "Starting release process for version $VERSION"

# Check if we're on main branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    print_error "Must be on 'main' branch to start release. Current branch: $CURRENT_BRANCH"
fi

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
    print_error "There are uncommitted changes. Please commit or stash them first."
fi

# Check if version tag already exists
if git tag -l | grep -q "^v$VERSION$"; then
    print_error "Version tag v$VERSION already exists"
fi

print_step "Pre-release validation"

# Run tests
print_step "Running test suite"
if [ "$DRY_RUN" = false ]; then
    pnpm test || print_error "Tests failed"
    print_success "All tests passed"
else
    print_warning "DRY RUN: Skipping test execution"
fi

# Run build
print_step "Running build"
if [ "$DRY_RUN" = false ]; then
    pnpm build || print_error "Build failed"
    print_success "Build successful"
else
    print_warning "DRY RUN: Skipping build"
fi

# Run linting
print_step "Running linter"
if [ "$DRY_RUN" = false ]; then
    pnpm lint || print_error "Linting failed"
    print_success "Linting passed"
else
    print_warning "DRY RUN: Skipping linting"
fi

# Run type checking
print_step "Running type check"
if [ "$DRY_RUN" = false ]; then
    pnpm typecheck || print_error "Type checking failed"
    print_success "Type checking passed"
else
    print_warning "DRY RUN: Skipping type checking"
fi

print_step "Creating release branch"

RELEASE_BRANCH="release/$VERSION"

if [ "$DRY_RUN" = false ]; then
    # Create release branch
    git checkout -b "$RELEASE_BRANCH" || print_error "Failed to create release branch"
    print_success "Created release branch: $RELEASE_BRANCH"
else
    print_warning "DRY RUN: Would create branch $RELEASE_BRANCH"
fi

print_step "Updating package versions"

# Update package.json versions
PACKAGE_FILES=(
    "package.json"
    "packages/framework/package.json"
    "packages/shared/package.json"
    "apps/web/package.json"
)

for package_file in "${PACKAGE_FILES[@]}"; do
    if [ "$DRY_RUN" = false ]; then
        # Use jq to update version if available, otherwise use sed
        if command -v jq > /dev/null; then
            tmp=$(mktemp)
            jq ".version = \"$VERSION\"" "$package_file" > "$tmp" && mv "$tmp" "$package_file"
        else
            # Fallback to sed (less reliable but works without jq)
            sed -i.bak "s/\"version\": \".*\"/\"version\": \"$VERSION\"/" "$package_file" && rm "$package_file.bak"
        fi
        print_success "Updated $package_file to version $VERSION"
    else
        print_warning "DRY RUN: Would update $package_file to version $VERSION"
    fi
done

print_step "Updating changelog"

# Get current date
CURRENT_DATE=$(date +%Y-%m-%d)

if [ "$DRY_RUN" = false ]; then
    # Update CHANGELOG.md - replace [Unreleased] section with version
    if [ -f "CHANGELOG.md" ]; then
        # Create a temporary file for the updated changelog
        {
            # Print everything before [Unreleased]
            sed '/^## \[Unreleased\]/,$d' CHANGELOG.md
            
            # Add the new version section
            echo "## [Unreleased]"
            echo ""
            echo "### Added"
            echo "- Preparation for next release"
            echo ""
            echo "## [$VERSION] - $CURRENT_DATE"
            echo ""
            
            # Print the content that was under [Unreleased], skipping the header
            sed -n '/^## \[Unreleased\]/,/^## \[/p' CHANGELOG.md | sed '1d' | sed '$d'
            
            # Print everything after the first version section
            sed -n '/^## \[[0-9]/,$p' CHANGELOG.md | tail -n +2
        } > CHANGELOG.tmp && mv CHANGELOG.tmp CHANGELOG.md
        
        print_success "Updated CHANGELOG.md for version $VERSION"
    else
        print_warning "CHANGELOG.md not found, skipping changelog update"
    fi
else
    print_warning "DRY RUN: Would update CHANGELOG.md for version $VERSION"
fi

print_step "Committing release changes"

if [ "$DRY_RUN" = false ]; then
    # Commit version bump
    git add .
    git commit -m "chore: bump version to $VERSION

- Update all package.json files to version $VERSION
- Update CHANGELOG.md with release notes
- Prepare for release $VERSION"
    
    print_success "Committed release changes"
else
    print_warning "DRY RUN: Would commit release changes"
fi

print_step "Release branch ready"

if [ "$DRY_RUN" = false ]; then
    echo -e "${GREEN}"
    echo "Release branch '$RELEASE_BRANCH' has been created successfully!"
    echo "Next steps:"
    echo "1. Review the changes:"
    echo "   git log --oneline -10"
    echo ""
    echo "2. Test the release build:"
    echo "   pnpm build && pnpm test"
    echo ""
    echo "3. If everything looks good, merge to main:"
    echo "   git checkout main"
    echo "   git merge --no-ff $RELEASE_BRANCH"
    echo ""
    echo "4. Tag the release:"
    echo "   git tag -a v$VERSION -m 'Release version $VERSION'"
    echo ""
    echo "5. Push the release:"
    echo "   git push origin main --tags"
    echo ""
    echo "6. Clean up release branch:"
    echo "   git branch -d $RELEASE_BRANCH"
    echo ""
    echo "7. Create GitHub release with changelog"
    echo -e "${NC}"
else
    echo -e "${YELLOW}"
    echo "DRY RUN COMPLETE"
    echo "This was a dry run - no actual changes were made."
    echo "Run without --dry-run to execute the release process."
    echo -e "${NC}"
fi

print_success "Release script completed successfully!"