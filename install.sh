#!/bin/bash
set -e

echo "Installing Whales Market CLI..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is required. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "Error: Node.js 18+ is required. Current version: $(node -v)"
    exit 1
fi

# Install via npm
npm install -g whale-market-cli

echo "✓ Installation complete!"
echo "Run: whales setup"
