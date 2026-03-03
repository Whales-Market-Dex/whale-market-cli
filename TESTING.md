# Testing Whale Market CLI Locally

## Quick Start

### 1. Install Dependencies

```bash
cd /Users/chinhvuong/Desktop/lab3/whale-market-cli
npm install
```

### 2. Build the Project

```bash
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` directory.

### 3. Test Methods

#### Method 1: Using npm scripts (Recommended for Development)

```bash
# Run directly with ts-node (no build needed)
npm run dev -- tokens list --limit 5

# Or run compiled version
npm start -- tokens list --limit 5
```

#### Method 2: Link Locally (Best for Testing as End User)

```bash
# Link the package globally (makes 'whales' command available)
npm link

# Now you can use 'whales' command from anywhere
whales --help
whales tokens list --limit 5
whales --format json tokens list --limit 2
```

#### Method 3: Run Directly with Node

```bash
# Run the compiled JavaScript directly
node dist/index.js --help
node dist/index.js tokens list --limit 5
node dist/index.js --format json tokens list --limit 2
```

#### Method 4: Use the Binary Directly

```bash
# Make sure bin/whales is executable
chmod +x bin/whales

# Run directly
./bin/whales --help
./bin/whales tokens list --limit 5
```

## Testing Commands

### Basic Commands

```bash
# Show help
whales --help
whales help

# Show version
whales --version

# Check status
whales status
```

### Format Testing

```bash
# Table format (default)
whales tokens list --limit 3

# JSON format
whales --format json tokens list --limit 2

# Plain format
whales --format plain tokens list --limit 2
```

### Command Testing

```bash
# Tokens
whales tokens list --limit 5
whales tokens search "example"
whales tokens highlight
whales tokens stats

# Networks
whales networks list

# Wallet (requires setup first)
whales wallet show
whales wallet address

# Offers
whales offers list --limit 5
whales offers my

# Orders
whales orders list --limit 5
whales orders my

# Portfolio
whales portfolio show
whales portfolio positions

# Orderbook
whales orderbook snapshot

# Referral
whales referral summary
```

### Setup Testing

```bash
# Run setup wizard
whales setup

# This will prompt you to:
# 1. Create or import a wallet
# 2. Set API URL
# 3. Save configuration
```

## Testing with Different API Endpoints

```bash
# Test with local server
whales --api-url http://localhost:3000 tokens list

# Test with production
whales --api-url https://api.whales.market tokens list

# Test with custom chain ID
whales --chain-id 1 tokens list
```

## Testing Wallet Operations

```bash
# Create a new wallet (for testing)
whales wallet create --type solana
whales wallet create --type evm

# Import a wallet (use test private key)
whales wallet import <private-key> --type solana

# Show wallet info
whales wallet show
whales wallet address
```

## Development Workflow

### Watch Mode (for active development)

```bash
# Install nodemon for auto-rebuild
npm install -g nodemon

# Watch and rebuild on changes
nodemon --watch src --exec "npm run build"
```

### Run Tests

```bash
# Run Jest tests
npm test

# Run tests in watch mode
npm test -- --watch

# Run with coverage
npm test -- --coverage
```

## Troubleshooting

### Issue: Command not found after npm link

```bash
# Check if link was successful
npm list -g --depth=0 | grep whale-market-cli

# Re-link if needed
npm unlink -g whale-market-cli
npm link
```

### Issue: TypeScript errors

```bash
# Clean and rebuild
rm -rf dist
npm run build
```

### Issue: Module not found

```bash
# Reinstall dependencies
rm -rf node_modules
npm install
```

### Issue: Permission denied on bin/whales

```bash
chmod +x bin/whales
```

## Example Test Session

```bash
# 1. Build the project
npm run build

# 2. Link locally
npm link

# 3. Test basic commands
whales --help
whales --version
whales help

# 4. Test format options
whales tokens list --limit 3
whales --format json tokens list --limit 2
whales --format plain tokens list --limit 2

# 5. Test specific commands
whales networks list
whales status

# 6. Test with different options
whales tokens list --status active --limit 5
whales tokens search "test" --limit 3

# 7. Test error handling
whales tokens get invalid-id
whales invalid-command
```

## Testing Checklist

- [ ] Help command works (`whales --help`, `whales help`)
- [ ] Version command works (`whales --version`)
- [ ] All format options work (table, json, plain)
- [ ] All commands are accessible
- [ ] Error handling works correctly
- [ ] Setup wizard works
- [ ] Wallet operations work
- [ ] API calls work (if server is running)
- [ ] Configuration is saved correctly
- [ ] Environment variables are respected
