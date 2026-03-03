#!/bin/bash
# Quick test script for local testing

echo "🐋 Testing Whale Market CLI Locally"
echo "===================================="
echo ""

# Check if built
if [ ! -d "dist" ]; then
    echo "Building project..."
    npm run build
fi

echo ""
echo "1. Testing help command:"
echo "-------------------------"
node dist/index.js --help

echo ""
echo "2. Testing version:"
echo "-------------------"
node dist/index.js --version

echo ""
echo "3. Testing comprehensive help:"
echo "--------------------------------"
node dist/index.js help | head -50

echo ""
echo "4. Testing format options:"
echo "--------------------------"
echo "Table format (default):"
node dist/index.js tokens list --limit 2 2>&1 | head -15

echo ""
echo "JSON format:"
node dist/index.js --format json tokens list --limit 1 2>&1 | head -10

echo ""
echo "Plain format:"
node dist/index.js --format plain tokens list --limit 1 2>&1 | head -5

echo ""
echo "✅ Basic tests complete!"
echo ""
echo "To test more commands, use:"
echo "  node dist/index.js <command> [options]"
echo ""
echo "Examples:"
echo "  node dist/index.js networks list"
echo "  node dist/index.js status"
echo "  node dist/index.js tokens search 'test' --limit 5"
