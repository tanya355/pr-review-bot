#!/bin/bash
set -e

echo "Starting GitHub Actions local workflow test..."
echo ""

# Check if Docker is running
if ! docker ps > /dev/null 2>&1; then
    echo "ERROR: Docker is not running. Start Docker and try again."
    exit 1
fi

# Check if act is installed
if ! command -v act &> /dev/null; then
    echo "ERROR: act is not installed. Run: brew install act"
    exit 1
fi

# Check if .actrc exists
if [ ! -f ".actrc" ]; then
    echo "ERROR: .actrc not found. Create it with your GitHub token."
    exit 1
fi

# Check if test event file exists
if [ ! -f ".github/workflows/test-event.json" ]; then
    echo "ERROR: .github/workflows/test-event.json not found."
    exit 1
fi

echo "Configuration:"
echo "  Docker: $(docker --version)"
echo "  act: $(act --version)"
echo "  Node: $(node --version)"
echo ""

# Run act with the test event
echo "Running GitHub Actions workflow locally..."
echo "================================================"
act pull_request \
    --eventpath .github/workflows/test-event.json \
    --job review \
    --verbose

echo "================================================"
echo "Workflow test completed!"
echo ""
echo "Expected output:"
echo "  - Dependencies installed"
echo "  - Configuration displayed"
echo "  - AI review process ran"
echo ""
echo "If you see 'Review posted successfully', the workflow works!"
