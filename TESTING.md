# Whale Market CLI - Self Testing Guide

Hướng dẫn test các chức năng **hiện có** trong CLI.

---

## Chuẩn bị

### 1. Build CLI
```bash
cd whale-market-cli
npm install
npm run build
npm link  # hoặc dùng npm run dev
```

### 2. Kiểm tra CLI hoạt động
```bash
whales --version
whales --help
```

---

## Test Phase 1: Read-Only Commands (Không cần wallet)

### Test 1: Tokens List
```bash
# Basic list
whales tokens list

# Với filters
whales tokens list --status active
whales tokens list --limit 5
whales tokens list --page 2

# Với chain filter
whales tokens list --chain 666666

# JSON output
whales tokens list --format json

# Plain output
whales tokens list --format plain
```

**Kiểm tra:**
- [ ] Table hiển thị đẹp với columns: ID, Name, Symbol, Status, Price, Last Price, Chain, Token ID/Address, Type
- [ ] `--status` filter hoạt động (active/ended)
- [ ] `--limit` giới hạn số dòng đúng
- [ ] `--format json` trả về valid JSON
- [ ] `--format plain` trả về plain text

**Kiểm tra JSON structure:**
```bash
whales tokens list --format json | jq '.data[0] | keys'
# Expect: id, name, symbol, status, price, chain_id, etc.
```

### Test 2: Tokens Search
```bash
# Search by name/symbol
whales tokens search "PENGU"
whales tokens search "BTC"

# Với limit
whales tokens search "ETH" --limit 5

# JSON output
whales tokens search "SOL" --format json
```

**Kiểm tra:**
- [ ] Search trả về kết quả liên quan
- [ ] `--limit` hoạt động
- [ ] JSON format valid

### Test 3: Token Detail
```bash
# Get token by ID (lấy ID từ tokens list)
whales tokens list --limit 1 --format json | jq -r '.data[0].id'
# Copy ID và dùng:
whales tokens get <TOKEN_ID>

# JSON output
whales tokens get <TOKEN_ID> --format json
```

**Kiểm tra:**
- [ ] Hiển thị detail table với: ID, Name, Symbol, Status, Price, Chain ID, Description
- [ ] JSON có đủ fields

### Test 4: Tokens Highlight
```bash
whales tokens highlight
whales tokens highlight --format json
```

**Kiểm tra:**
- [ ] Trả về danh sách highlighted/trending tokens
- [ ] Format đúng

### Test 5: Tokens Stats
```bash
whales tokens stats
whales tokens stats --format json
```

**Kiểm tra:**
- [ ] Trả về prediction stats
- [ ] Format đúng

### Test 6: Networks List
```bash
whales networks list
whales networks list --format json
```

**Kiểm tra:**
- [ ] Hiển thị danh sách networks: ID, Name, Chain ID, RPC URL
- [ ] JSON valid

### Test 7: Status Check
```bash
whales status
whales status --format json
```

**Kiểm tra:**
- [ ] Hiển thị API URL
- [ ] Hiển thị connection status
- [ ] Có thể check API health

### Test 8: Order Book Snapshot
```bash
# Lấy snapshot statistics
whales orderbook snapshot
whales orderbook snapshot --format json
```

**Kiểm tra:**
- [ ] Trả về aggregated stats (buy/sell orders count, volume, value, avg prices)
- [ ] JSON structure đúng

---

## Test Phase 2: Commands Cần Wallet

### Setup Wallet (Chỉ làm 1 lần)

#### Option 1: Create new wallet
```bash
whales setup
# Chọn: Create new Solana wallet
# LƯU MNemonic vào file an toàn!
```

#### Option 2: Import existing wallet
```bash
whales wallet import <YOUR_PRIVATE_KEY> --type solana
# hoặc
whales wallet import <YOUR_PRIVATE_KEY> --type evm
```

### Test 9: Wallet Commands
```bash
# Show wallet info
whales wallet show
whales wallet show --format json

# Get address only
whales wallet address
whales wallet address --format json

# Create new wallet (test only, don't save)
whales wallet create --type solana
whales wallet create --type evm
```

**Kiểm tra:**
- [ ] `wallet show` hiển thị address và type
- [ ] `wallet address` chỉ hiển thị address
- [ ] `wallet create` tạo wallet mới với mnemonic

### Test 10: My Offers
```bash
# List my offers
whales offers my
whales offers my --format json

# Filter by status
whales offers my --status open
whales offers my --status filled
```

**Kiểm tra:**
- [ ] Chỉ hiển thị offers của wallet đã config
- [ ] Filter status hoạt động
- [ ] Table format: ID, Type, Token ID, Amount, Price, Status, Address

### Test 11: Offers List (All)
```bash
# List all offers
whales offers list
whales offers list --limit 10

# Filter by type
whales offers list --type buy
whales offers list --type sell

# Filter by token
whales offers list --token <TOKEN_ID>
```

**Kiểm tra:**
- [ ] Hiển thị tất cả offers (không chỉ của mình)
- [ ] Filters hoạt động

### Test 12: Offer Detail
```bash
# Get offer by ID
whales offers get <OFFER_ID>
whales offers get <OFFER_ID> --format json
```

**Kiểm tra:**
- [ ] Hiển thị chi tiết offer
- [ ] JSON có đủ fields

### Test 13: My Orders
```bash
# List my orders
whales orders my
whales orders my --format json

# Filter by side (nếu API support)
whales orders my --side buy
whales orders my --side sell
```

**Kiểm tra:**
- [ ] Hiển thị orders của wallet
- [ ] Table format: ID, Offer ID, Buyer, Seller, Amount, Status

### Test 14: Orders List (All)
```bash
# List all orders
whales orders list
whales orders list --limit 10

# Filter by token
whales orders list --token <TOKEN_ID>

# Filter by status
whales orders list --status filled
```

**Kiểm tra:**
- [ ] Hiển thị tất cả orders
- [ ] Filters hoạt động

### Test 15: Order Detail
```bash
# Get order by ID
whales orders get <ORDER_ID>
whales orders get <ORDER_ID> --format json
```

**Kiểm tra:**
- [ ] Hiển thị chi tiết order
- [ ] JSON có đủ fields

### Test 16: Orders by Offer
```bash
# Get orders for a specific offer address
whales orders by-offer <OFFER_ADDRESS>
```

**Kiểm tra:**
- [ ] Hiển thị orders liên quan đến offer address

### Test 17: Portfolio
```bash
# Show portfolio summary
whales portfolio show
whales portfolio show --format json

# Show positions
whales portfolio positions
whales portfolio positions --type open
whales portfolio positions --type filled
```

**Kiểm tra:**
- [ ] Portfolio summary hiển thị: Total Offers, Total Orders, Open Offers, Filled Orders
- [ ] Positions list hiển thị đúng
- [ ] Filter type hoạt động

### Test 18: Referral (nếu có address với referral data)
```bash
# Summary
whales referral summary
whales referral summary --format json

# Campaigns
whales referral campaigns

# Earnings
whales referral earnings

# Transactions
whales referral transactions
```

**Kiểm tra:**
- [ ] Hiển thị referral data nếu có
- [ ] Hoặc thông báo "no data" nếu không có

---

## Test Cross-Cutting Features

### Test 19: Output Formats
```bash
# Table (default)
whales tokens list

# JSON
whales tokens list --format json

# Plain
whales tokens list --format plain
```

**Kiểm tra:**
- [ ] Table: có màu, align đẹp, dễ đọc
- [ ] JSON: valid, parseable với jq
- [ ] Plain: không màu, text thuần

### Test 20: Global Options
```bash
# Override API URL
whales --api-url https://api.whales.market tokens list

# Override private key (không khuyến khích, chỉ test)
whales --private-key <KEY> wallet show

# Override chain ID
whales --chain-id 1 tokens list
```

**Kiểm tra:**
- [ ] `--api-url` override config
- [ ] `--private-key` override config
- [ ] `--chain-id` override config

### Test 21: Environment Variables
```bash
# Set env vars
export WHALES_API_URL="https://api.whales.market"
export WHALES_CHAIN_ID="666666"

# Run command
whales tokens list

# Unset
unset WHALES_API_URL
unset WHALES_CHAIN_ID
```

**Kiểm tra:**
- [ ] Env vars override config file
- [ ] Priority: CLI flag > Env var > Config file

### Test 22: Config File
```bash
# Check config path
whales wallet show
# Xem dòng "Config saved to: ..."

# View config (macOS)
cat ~/Library/Preferences/whales-market-cli-nodejs/config.json

# View config (Linux)
cat ~/.config/whales-market-cli-nodejs/config.json
```

**Kiểm tra:**
- [ ] Config file tồn tại
- [ ] Có privateKey, walletType, apiUrl, chainId

### Test 23: Help Text
```bash
# Main help
whales --help
whales -h

# Command help
whales tokens --help
whales wallet --help
whales offers --help
whales orders --help
whales portfolio --help
whales orderbook --help
whales referral --help
whales networks --help

# Subcommand help
whales tokens list --help
whales wallet create --help
```

**Kiểm tra:**
- [ ] Help text hiển thị đầy đủ
- [ ] Có description cho mỗi command
- [ ] Có list options

### Test 24: Error Handling
```bash
# Invalid command
whales invalid-command

# Invalid token ID
whales tokens get invalid-id

# No wallet configured (nếu chưa setup)
whales offers my
# Expect: "No wallet configured. Run: whales setup"

# Invalid format
whales tokens list --format invalid
```

**Kiểm tra:**
- [ ] Error messages rõ ràng
- [ ] Không crash CLI
- [ ] Exit code != 0 khi có error

---

## Test với jq (JSON parsing)

```bash
# Count tokens
whales tokens list --format json | jq '.data | length'

# Get first token name
whales tokens list --format json | jq -r '.data[0].name'

# Filter active tokens
whales tokens list --format json | jq '.data[] | select(.status == "active") | .symbol'

# Get all symbols
whales tokens list --format json | jq -r '.data[].symbol'

# Check if wallet is configured
whales wallet address --format json | jq -r '.address'
```

**Kiểm tra:**
- [ ] jq parse thành công
- [ ] Data structure đúng

---

## Test Performance

```bash
# Measure response time
time whales tokens list

# Large limit
time whales tokens list --limit 100

# Multiple requests
for i in {1..5}; do
  echo "Request $i"
  time whales tokens list --limit 10
done
```

**Kiểm tra:**
- [ ] Response time < 5s cho list
- [ ] Không có timeout
- [ ] Consistent performance

---

## Checklist Tổng Hợp

### Phase 1 (Read-only) - Đã có
- [ ] `whales tokens list` - OK
- [ ] `whales tokens search` - OK
- [ ] `whales tokens get` - OK
- [ ] `whales tokens highlight` - OK
- [ ] `whales tokens stats` - OK
- [ ] `whales networks list` - OK
- [ ] `whales status` - OK
- [ ] `whales orderbook snapshot` - OK (aggregated stats)
- [ ] `--format json|table|plain` - OK

### Phase 2 (Wallet required) - Đã có
- [ ] `whales setup` - OK
- [ ] `whales wallet create/import/show/address` - OK
- [ ] `whales offers list/my/get` - OK
- [ ] `whales orders list/my/get/by-offer` - OK
- [ ] `whales portfolio show/positions` - OK
- [ ] `whales referral summary/campaigns/earnings/transactions` - OK

### Chưa có (cần implement)
- [ ] `whales book <symbol>` - Order book với levels
- [ ] `whales book --depth N` - Limit depth
- [ ] `whales book --live` - WebSocket stream
- [ ] `whales buy/sell` - Create orders
- [ ] `whales fill` - Fill orders
- [ ] `whales cancel` - Cancel orders
- [ ] `whales cancel-all` - Cancel all orders
- [ ] `--yes` flag - Skip confirmation

---

## Troubleshooting

### "No wallet configured"
```bash
whales setup
# hoặc
whales wallet import <PRIVATE_KEY> --type solana
```

### "API connection failed"
```bash
# Check status
whales status

# Try với API URL khác
whales --api-url https://api.whales.market tokens list
```

### "Invalid private key format"
- Solana: Cần Base58 encoded private key
- EVM: Cần hex private key (có hoặc không có 0x prefix)

### Config file không tìm thấy
```bash
# macOS
ls ~/Library/Preferences/whales-market-cli-nodejs/

# Linux
ls ~/.config/whales-market-cli-nodejs/

# Nếu không có, chạy setup
whales setup
```

---

## Next Steps

Sau khi test xong các chức năng hiện có, bạn có thể:

1. **Implement `whales book <symbol>`** - Priority cao nhất cho Phase 1
2. **Cải thiện output** - Thêm Implied FDV, 24h Vol vào tokens list
3. **Implement trading commands** - buy, sell, fill, cancel cho Phase 2
4. **Add WebSocket support** - Cho `book --live`
5. **Improve error handling** - Actionable error messages
6. **Add `--yes` flag** - Cho agent mode

---

## Report Issues

Nếu gặp bug hoặc issue, ghi lại:
- Command đã chạy
- Expected output
- Actual output
- Error message (nếu có)
- Environment (OS, Node version)

Example:
```
Command: whales tokens list --format json
Expected: Valid JSON
Actual: SyntaxError: Unexpected token
Error: ...
OS: macOS 14.1
Node: v18.0.0
```
