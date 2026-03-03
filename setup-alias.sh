#!/bin/bash
# Script to set up whales CLI alias

CLI_DIR="/Users/chinhvuong/Desktop/lab3/whale-market-cli"
SHELL_RC=""

# Detect shell
if [ -n "$ZSH_VERSION" ]; then
    SHELL_RC="$HOME/.zshrc"
elif [ -n "$BASH_VERSION" ]; then
    SHELL_RC="$HOME/.bashrc"
else
    echo "Could not detect shell. Please add manually to your shell config."
    exit 1
fi

# Check if alias already exists
if grep -q "alias whales=" "$SHELL_RC" 2>/dev/null; then
    echo "Alias already exists in $SHELL_RC"
    echo "Updating..."
    # Remove old alias
    sed -i.bak '/alias whales=/d' "$SHELL_RC"
fi

# Add alias
echo "" >> "$SHELL_RC"
echo "# Whale Market CLI alias" >> "$SHELL_RC"
echo "alias whales='node $CLI_DIR/dist/index.js'" >> "$SHELL_RC"

echo "✅ Alias added to $SHELL_RC"
echo ""
echo "To use it now, run:"
echo "  source $SHELL_RC"
echo ""
echo "Or open a new terminal window."
echo ""
echo "Then you can use:"
echo "  whales --version"
echo "  whales --help"
echo "  whales tokens list"
