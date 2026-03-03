# Agent Usage Guide - Whale Market CLI

## Overview

The Whale Market CLI provides comprehensive token information for agents to analyze and place orders. Use the appropriate output format based on your needs.

## Output Formats

### 1. Table Format (Default) - Human Readable

Shows key fields in a formatted table:

```bash
whales tokens list --limit 5
```

**Fields displayed:**
- **ID**: Full UUID (e.g., `7bf8b558-1ff2-4f9e-8966-8fec26d4f9ca`)
- **Name**: Token name
- **Symbol**: Token symbol
- **Status**: active, settle, ended, etc.
- **Price**: Current price (uses last_price if price is 0)
- **Last Price**: Last traded price
- **Chain**: Chain name with ID (e.g., `Ethereum(1)`, `Arbitrum(42161)`)
- **Token ID/Address**: Token contract address or token_id (truncated if >50 chars)
- **Type**: pre_market, token, ex_token

**Best for:** Quick visual scanning, human review

### 2. Detailed Format - Full Information

Shows all fields for each token in detail:

```bash
whales tokens list --limit 5 --detailed
```

**Fields displayed:**
- All fields from table format PLUS:
- **Token ID**: Full token_id (for placing orders)
- **Address**: Full contract address
- **Pre Token Address**: Pre-market token address
- **Short ID**: Short identifier
- **Network ID**: Network UUID
- **Decimals**: Token decimals
- **Settle Rate**: Settlement rate
- **Total Volume Ask/Bid**: Trading volumes
- **Average Bid/Ask**: Average prices

**Best for:** Detailed analysis, when you need all fields

### 3. JSON Format - Machine Readable (Recommended for Agents)

Shows complete data structure without truncation:

```bash
whales --format json tokens list --limit 5
```

**Advantages:**
- ✅ No data truncation
- ✅ Full addresses and IDs
- ✅ Complete nested objects (network, price_change, volume, etc.)
- ✅ Easy to parse programmatically
- ✅ All fields available for analysis

**Best for:** Agents, automation, data analysis, order placement

## Key Fields for Order Placement

When placing orders, you'll need:

1. **Token ID** (`token_id` or `id`): Use `token_id` field for API calls
2. **Network/Chain**: Use `network.chain_id` or `network_id`
3. **Address**: Use `address` or `pre_token_address` depending on token type
4. **Price Information**: `price`, `last_price`, `average_bid`, `average_ask`

## Example: Getting Full Token Data for Analysis

```bash
# Get JSON output with all fields (best for agents)
whales --format json tokens list --limit 10 > tokens.json

# Get specific token details
whales --format json tokens get <token-id>

# Search tokens
whales --format json tokens search "example" --limit 5
```

## Example JSON Output Structure

```json
[
  {
    "id": "7bf8b558-1ff2-4f9e-8966-8fec26d4f9ca",
    "name": "USD.AI",
    "symbol": "CHIP",
    "status": "active",
    "price": 0,
    "last_price": 0,
    "token_id": "0x3833353100000000000000000000000000000000000000000000000000000000",
    "address": null,
    "pre_token_address": null,
    "network": {
      "id": "25766665-eff0-445e-b3b2-1d25d1825a28",
      "name": "Arbitrum",
      "chain_id": 42161
    },
    "network_id": "25766665-eff0-445e-b3b2-1d25d1825a28",
    "type": "pre_market",
    "category": "pre_market",
    "short_id": "8351",
    "total_volume_ask": 6893.1508,
    "total_volume_bid": 0,
    "average_bid": 0,
    "average_ask": 0
  }
]
```

## Recommended Workflow for Agents

1. **Discovery**: Use JSON format to get all tokens
   ```bash
   whales --format json tokens list --limit 50
   ```

2. **Analysis**: Parse JSON to extract:
   - Token IDs for order placement
   - Prices and volumes
   - Network information
   - Addresses

3. **Order Placement**: Use extracted `token_id` and `network.chain_id` for API calls

4. **Monitoring**: Use table format for quick status checks
   ```bash
   whales tokens list --status active --limit 10
   ```

## Field Mapping for Orders

| Order API Field | Token JSON Field | Notes |
|----------------|------------------|-------|
| `token_id` | `token.token_id` | Use this for placing orders |
| `chain_id` | `token.network.chain_id` | Network chain ID |
| `address` | `token.address` or `token.pre_token_address` | Contract address |
| `amount` | - | User input |
| `price` | `token.last_price` or `token.price` | Reference price |

## Tips

- Always use `--format json` for programmatic access
- Use `--detailed` flag for human-readable full information
- Token IDs are in the `token_id` field (hex format)
- Network information is in the `network` object
- Prices may be 0 - check `last_price` as fallback
