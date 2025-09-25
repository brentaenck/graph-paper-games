#!/bin/bash

# Graph Paper Games - Agent Development Environment Setup
# This script helps Warp AI agents set up and verify the development environment

set -e

echo "🎮 Graph Paper Games - Agent Environment Setup"
echo "=============================================="

# Check if we're in the right directory
if [[ ! -f "package.json" ]] || [[ ! -d "docs" ]]; then
    echo "❌ Error: Not in the Graph Paper Games root directory"
    echo "Please run this script from the project root"
    exit 1
fi

echo "✅ In correct directory"

# Check Node.js version
echo ""
echo "🔍 Checking Node.js version..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    NODE_MAJOR=$(echo $NODE_VERSION | sed 's/v\([0-9]*\).*/\1/')
    if [ "$NODE_MAJOR" -ge 18 ]; then
        echo "✅ Node.js $NODE_VERSION (compatible)"
    else
        echo "⚠️  Node.js $NODE_VERSION (requires 18+)"
        echo "Please upgrade Node.js to version 18 or higher"
    fi
else
    echo "❌ Node.js not found"
    echo "Please install Node.js 18+ from https://nodejs.org"
    exit 1
fi

# Check pnpm
echo ""
echo "🔍 Checking pnpm..."
if command -v pnpm &> /dev/null; then
    PNPM_VERSION=$(pnpm -v)
    echo "✅ pnpm $PNPM_VERSION"
else
    echo "❌ pnpm not found"
    echo "Installing pnpm..."
    npm install -g pnpm
    echo "✅ pnpm installed"
fi

# Check git status
echo ""
echo "🔍 Checking git status..."
if git rev-parse --git-dir > /dev/null 2>&1; then
    BRANCH=$(git branch --show-current)
    echo "✅ Git repository (branch: $BRANCH)"
    
    # Show uncommitted changes
    if ! git diff --quiet; then
        echo "📝 Uncommitted changes detected:"
        git status --porcelain
    fi
else
    echo "⚠️  Not a git repository"
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
if [ -d "node_modules" ]; then
    echo "ℹ️  node_modules exists, checking if install is needed..."
fi

pnpm install

echo "✅ Dependencies installed"

# Run type checking
echo ""
echo "🔍 Running type check..."
if pnpm typecheck; then
    echo "✅ Type checking passed"
else
    echo "⚠️  Type checking failed - this is expected during initial setup"
fi

# Run linting
echo ""
echo "🔍 Running linter..."
if pnpm lint; then
    echo "✅ Linting passed"
else
    echo "⚠️  Linting issues found - run 'pnpm lint --fix' to auto-fix"
fi

# Try to build
echo ""
echo "🏗️  Attempting to build..."
if pnpm build; then
    echo "✅ Build successful"
else
    echo "⚠️  Build failed - this is expected during initial setup"
fi

# Run tests
echo ""
echo "🧪 Running tests..."
if pnpm test; then
    echo "✅ Tests passed"
else
    echo "⚠️  Some tests failed - this is expected during initial setup"
fi

# Check project structure
echo ""
echo "🗂️  Checking project structure..."
EXPECTED_DIRS=("apps" "packages" "games" "docs" "services")
for dir in "${EXPECTED_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        echo "✅ $dir/ directory exists"
    else
        echo "⚠️  $dir/ directory missing"
    fi
done

# Show current project status
echo ""
echo "📊 Project Status Summary"
echo "========================="
echo "Phase: Foundation Setup (Phase 0)"
echo "Architecture: TypeScript monorepo with React + Node.js"
echo "Package Manager: pnpm $(pnpm -v)"
echo "Node.js: $(node -v)"

if [ -d "packages/framework" ]; then
    echo "Framework: Skeleton structure exists"
else
    echo "Framework: Not yet implemented"
fi

if [ -d "games/dots-and-boxes" ]; then
    echo "Games: Development started"
else
    echo "Games: Not yet implemented"
fi

# Show useful commands
echo ""
echo "🚀 Useful Commands for Agents"
echo "============================="
echo "pnpm dev              # Start development server"
echo "pnpm build            # Build all packages"
echo "pnpm test             # Run all tests"
echo "pnpm lint             # Run linter"
echo "pnpm typecheck        # Type checking"
echo ""
echo "# Package-specific commands:"
echo "pnpm --filter @gpg/framework build"
echo "pnpm --filter @gpg/apps-web dev"
echo ""
echo "# Documentation:"
echo "docs/agent-guide.md          # Comprehensive agent guide"
echo "docs/agent-quick-reference.md # Quick reference"
echo ".warp/rules.md              # Project rules for Warp"

echo ""
echo "🎯 Ready to start development!"
echo "See docs/agent-guide.md for detailed guidance"