# Running Tests Directly

## Quick Start

```bash
cd /Users/chinhvuong/Desktop/lab3/whale-market-cli

# Run all tests
npm test

# Run tests in watch mode (auto-rerun on file changes)
npm test -- --watch

# Run tests with coverage report
npm test -- --coverage

# Run a specific test file
npm test -- test/commands.test.ts

# Run tests matching a pattern
npm test -- --testNamePattern="version"
```

## Test Commands

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm test -- --watch
```
This will automatically rerun tests when you change files.

### Run Tests with Coverage
```bash
npm test -- --coverage
```
This shows code coverage report.

### Run Specific Test
```bash
# Run only tests matching "version"
npm test -- --testNamePattern="version"

# Run only tests matching "help"
npm test -- --testNamePattern="help"
```

### Run Tests Verbosely
```bash
npm test -- --verbose
```

## Complete Command Reference Table

All available commands and their variants:

| Command | Subcommand | Options | Description | Example |
|---------|------------|---------|-------------|---------|
| **Global Options** | | `-f, --format <format>` | Output format (table\|json\|plain) | `--format json` |
| | | `-k, --private-key <key>` | Private key override | `--private-key 0x...` |
| | | `--api-url <url>` | API endpoint URL | `--api-url http://localhost:3000` |
| | | `--chain-id <id>` | Chain ID | `--chain-id 1` |
| | | `-V, --version` | Show version | `--version` |
| | | `-h, --help` | Show help | `--help` |
| **setup** | | | Interactive setup wizard | `whales setup` |
| **wallet** | `create` | `--type <solana\|evm>` | Generate new wallet | `whales wallet create --type solana` |
| | `import <private-key>` | `--type <solana\|evm>` | Import existing wallet | `whales wallet import 0x... --type evm` |
| | `show` | | Display wallet details | `whales wallet show` |
| | `address` | | Show wallet address | `whales wallet address` |
| | `link <target-address>` | | Link multiple wallets | `whales wallet link 0x...` |
| **tokens** | `list` | `--status <active\|ended>` | Filter by status | `whales tokens list --status active` |
| | | `--chain <id>` | Filter by chain ID | `whales tokens list --chain 1` |
| | | `--limit <n>` | Limit results (default: 20) | `whales tokens list --limit 10` |
| | | `--page <n>` | Page number (default: 1) | `whales tokens list --page 2` |
| | | `--detailed` | Show detailed information | `whales tokens list --detailed` |
| | `get <token-id>` | | Get token details | `whales tokens get <uuid>` |
| | `search <query>` | `--limit <n>` | Search tokens | `whales tokens search "example" --limit 5` |
| | `highlight` | | Get highlighted tokens | `whales tokens highlight` |
| | `stats` | | Get prediction stats | `whales tokens stats` |
| **offers** | `list` | `--type <buy\|sell>` | Filter by type | `whales offers list --type buy` |
| | | `--token <id>` | Filter by token ID | `whales offers list --token <uuid>` |
| | | `--limit <n>` | Limit results (default: 20) | `whales offers list --limit 10` |
| | | `--page <n>` | Page number (default: 1) | `whales offers list --page 2` |
| | `my` | `--status <open\|filled\|cancelled>` | List my offers | `whales offers my --status open` |
| | `get <offer-id>` | | Get offer details | `whales offers get <id>` |
| | `react <offer-id>` | | React to an offer | `whales offers react <id>` |
| **orders** | `list` | `--token <id>` | Filter by token ID | `whales orders list --token <uuid>` |
| | | `--status <status>` | Filter by status | `whales orders list --status filled` |
| | | `--limit <n>` | Limit results (default: 20) | `whales orders list --limit 10` |
| | | `--page <n>` | Page number (default: 1) | `whales orders list --page 2` |
| | `my` | `--side <buy\|sell>` | List my orders | `whales orders my --side buy` |
| | `get <order-id>` | | Get order details | `whales orders get <id>` |
| | `by-offer <address>` | | Orders for my offers | `whales orders by-offer <address>` |
| **portfolio** | `show` | `--address <addr>` | Show portfolio summary | `whales portfolio show --address 0x...` |
| | `positions` | `--type <open\|filled>` | List positions | `whales portfolio positions --type open` |
| | `balance` | `--token <symbol>` | Show token balances | `whales portfolio balance --token ETH` |
| **orderbook** | `snapshot` | | Get order book snapshot | `whales orderbook snapshot` |
| | `positions` | `--telegram-id <id>` | Get positions | `whales orderbook positions --telegram-id <id>` |
| | `pairs` | `--telegram-id <id>` | List trading pairs | `whales orderbook pairs --telegram-id <id>` |
| | `filled <id>` | | Get filled order details | `whales orderbook filled <id>` |
| **referral** | `summary` | `--address <addr>` | Campaign summary | `whales referral summary --address 0x...` |
| | `campaigns` | `--address <addr>` | List campaigns | `whales referral campaigns` |
| | `earnings` | `--address <addr>` | Show earnings | `whales referral earnings` |
| | `transactions` | `--address <addr>` | Get transactions | `whales referral transactions` |
| **networks** | `list` | | List supported networks | `whales networks list` |
| **status** | | | Check API and wallet status | `whales status` |
| **shell** | | | Interactive REPL mode | `whales shell` |
| **upgrade** | | | Self-update from npm | `whales upgrade` |
| **help** | `[command]` | | Show comprehensive help | `whales help` or `whales help tokens` |

## Current Test Suite

The test suite (`test/commands.test.ts`) includes:

✅ **12 tests** covering:
- Version command
- Help commands (main and subcommands)
- Format options (json, plain)
- All major command groups (tokens, wallet, offers, orders, portfolio, networks, status)

## Test Results

```
✓ whales --version
✓ whales --help
✓ whales tokens --help
✓ whales tokens list --format json
✓ whales tokens list --format plain
✓ whales help command
✓ whales wallet --help
✓ whales offers --help
✓ whales orders --help
✓ whales portfolio --help
✓ whales networks --help
✓ whales status --help
```

## Test Command Examples

### Basic Commands
```bash
# Version
whales --version

# Help
whales --help
whales help
whales tokens --help
whales wallet create --help
```

### Format Testing
```bash
# Table format (default)
whales tokens list --limit 5

# JSON format
whales --format json tokens list --limit 5

# Plain format
whales --format plain tokens list --limit 5
```

### Token Commands
```bash
# List tokens
whales tokens list
whales tokens list --status active --limit 10
whales tokens list --chain 1 --limit 5
whales tokens list --detailed

# Get token
whales tokens get <token-id>

# Search
whales tokens search "example" --limit 5

# Highlight
whales tokens highlight

# Stats
whales tokens stats
```

### Wallet Commands
```bash
# Create wallet
whales wallet create
whales wallet create --type solana
whales wallet create --type evm

# Import wallet
whales wallet import <private-key>
whales wallet import <private-key> --type evm

# Show wallet
whales wallet show
whales wallet address
whales wallet link <target-address>
```

### Offer Commands
```bash
# List offers
whales offers list
whales offers list --type buy --limit 10
whales offers list --token <token-id>

# My offers
whales offers my
whales offers my --status open

# Get offer
whales offers get <offer-id>
whales offers react <offer-id>
```

### Order Commands
```bash
# List orders
whales orders list
whales orders list --token <token-id>
whales orders list --status filled

# My orders
whales orders my
whales orders my --side buy

# Get order
whales orders get <order-id>
whales orders by-offer <address>
```

### Portfolio Commands
```bash
# Portfolio
whales portfolio show
whales portfolio show --address <address>
whales portfolio positions
whales portfolio positions --type open
whales portfolio balance
```

### Orderbook Commands
```bash
# Orderbook
whales orderbook snapshot
whales orderbook positions --telegram-id <id>
whales orderbook pairs --telegram-id <id>
whales orderbook filled <id>
```

### Referral Commands
```bash
# Referral
whales referral summary
whales referral summary --address <address>
whales referral campaigns
whales referral earnings
whales referral transactions
```

### Utility Commands
```bash
# Networks
whales networks list

# Status
whales status

# Shell
whales shell

# Upgrade
whales upgrade
```

## Adding New Tests

To add new tests, edit `test/commands.test.ts`:

```typescript
test('description', async () => {
  const { stdout } = await execAsync(`${CLI_PATH} <command>`);
  expect(stdout).toContain('expected output');
});
```

## Troubleshooting

### Tests fail with "command not found"
Make sure you've built the project:
```bash
npm run build
```

### Tests timeout
Some tests make API calls. If the API is slow or unavailable, tests may timeout. This is expected behavior.

### Want to test without API calls
You can mock API responses or test only commands that don't require API access (like `--help`, `--version`).
