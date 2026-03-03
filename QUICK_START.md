# Quick Start - Use `whales` Command Directly

## Option 1: Setup Alias (Easiest)

Run this script to add an alias to your shell:

```bash
cd /Users/chinhvuong/Desktop/lab3/whale-market-cli
./setup-alias.sh
source ~/.zshrc  # or source ~/.bashrc
```

Then you can use:
```bash
whales --version
whales --help
whales tokens list
```

## Option 2: Manual Alias Setup

Add this line to your `~/.zshrc` (or `~/.bashrc`):

```bash
alias whales='node /Users/chinhvuong/Desktop/lab3/whale-market-cli/dist/index.js'
```

Then reload:
```bash
source ~/.zshrc
```

## Option 3: Add to PATH

Create a symlink or add to PATH:

```bash
# Create a symlink in a directory that's in your PATH
ln -s /Users/chinhvuong/Desktop/lab3/whale-market-cli/dist/index.js /usr/local/bin/whales
chmod +x /usr/local/bin/whales
```

## Option 4: Use npm link (Requires permissions)

```bash
cd /Users/chinhvuong/Desktop/lab3/whale-market-cli
npm link
```

## Option 5: Use Directly Without Alias

You can always use the full path:

```bash
node /Users/chinhvuong/Desktop/lab3/whale-market-cli/dist/index.js --version
node /Users/chinhvuong/Desktop/lab3/whale-market-cli/dist/index.js --help
node /Users/chinhvuong/Desktop/lab3/whale-market-cli/dist/index.js tokens list
```

Or create a simple wrapper script:

```bash
# Create /usr/local/bin/whales
cat > /usr/local/bin/whales << 'EOF'
#!/bin/bash
node /Users/chinhvuong/Desktop/lab3/whale-market-cli/dist/index.js "$@"
EOF
chmod +x /usr/local/bin/whales
```

## Recommended: Use Option 1 (Alias)

The alias method is the easiest and doesn't require special permissions. Just run:

```bash
cd /Users/chinhvuong/Desktop/lab3/whale-market-cli
./setup-alias.sh
source ~/.zshrc
whales --version
```
