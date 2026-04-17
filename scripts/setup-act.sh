#!/bin/bash
set -e

echo "GitHub Actions Local Testing Setup"
echo "===================================="
echo ""

# Check Docker
echo "1. Checking Docker installation..."
if ! command -v docker &> /dev/null; then
    echo "   ERROR: Docker not found. Install from https://www.docker.com"
    exit 1
fi
echo "   ✓ Docker: $(docker --version)"

# Check act
echo ""
echo "2. Checking act installation..."
if ! command -v act &> /dev/null; then
    echo "   ERROR: act not found."
    echo "   Install: brew install act"
    exit 1
fi
echo "   ✓ act: $(act --version)"

# Check Docker daemon
echo ""
echo "3. Checking Docker daemon..."
if ! docker ps > /dev/null 2>&1; then
    echo "   ERROR: Docker daemon not running. Start Docker Desktop or daemon."
    exit 1
fi
echo "   ✓ Docker daemon is running"

# Check .actrc
echo ""
echo "4. Checking .actrc configuration..."
if [ ! -f ".actrc" ]; then
    echo "   WARNING: .actrc not found"
    echo ""
    echo "   Create .actrc with your GitHub token:"
    echo "   1. Go to https://github.com/settings/tokens"
    echo "   2. Generate new token (classic) with 'repo' and 'workflow' scopes"
    echo "   3. Create .actrc file:"
    echo ""
    echo "   cat > .actrc << 'EOF'"
    echo "   -s GITHUB_TOKEN=ghp_your_token_here"
    echo "   -P ubuntu-latest=ghcr.io/catthehacker/ubuntu:full-latest"
    echo "   --verbose"
    echo "   --reuse"
    echo "   EOF"
    echo ""
    echo "   Then add to .gitignore:"
    echo "   echo '.actrc' >> .gitignore"
    exit 1
fi
echo "   ✓ .actrc exists"

# Check test event
echo ""
echo "5. Checking test event file..."
if [ ! -f ".github/workflows/test-event.json" ]; then
    echo "   ERROR: .github/workflows/test-event.json not found"
    exit 1
fi
echo "   ✓ test-event.json exists"

# Check workflow file
echo ""
echo "6. Checking workflow files..."
if [ ! -f ".github/workflows/pr-review.yml" ]; then
    echo "   ERROR: .github/workflows/pr-review.yml not found"
    exit 1
fi
echo "   ✓ pr-review.yml exists"

if [ ! -f ".github/workflows/test-pr-review-local.yml" ]; then
    echo "   WARNING: test-pr-review-local.yml not found (optional)"
else
    echo "   ✓ test-pr-review-local.yml exists"
fi

echo ""
echo "===================================="
echo "✓ Setup complete! Ready to test."
echo ""
echo "Run the workflow:"
echo "  ./scripts/test-act-local.sh"
echo ""
echo "Or use act directly:"
echo "  act pull_request --eventpath .github/workflows/test-event.json"
