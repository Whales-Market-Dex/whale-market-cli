# Whale Market CLI — Danh sách lệnh & Hướng dẫn Self Test

File này liệt kê **tất cả commands hiện có** kèm ý nghĩa và cách test thủ công.

---

## Chuẩn bị

```bashp
cd whale-market-cli
npm install && npm run build
npm link   # hoặc dùng: node dist/index.js
```

---

## Phase 1: Read-Only (không cần wallet)

### 1. `whales tokens list`

**Ý nghĩa:** Liệt kê tokens pre-market, mặc định sort theo volume 24h.

| Option | Ý nghĩa |
|--------|---------|
| `--limit <n>` | Giới hạn số dòng |
| `--status <active\|ended\|settling>` | Lọc theo trạng thái |
| `--chain <id>` | Lọc theo chain ID |
| `--sort <vol\|price\|created>` | Sắp xếp: vol, price, created |
| `--no-fdv` | Ẩn cột Implied FDV |
| `--no-volume` | Ẩn cột 24h Vol |
| `--format json\|plain` | Xuất JSON hoặc plain text |

**Cách test:**
```bash
whales tokens list --limit 5
whales tokens list --limit 3 --format json
```
- [ ] Có cột: Name, Symbol, Price, Implied FDV, 24h Vol, Status
- [ ] `--format json` trả về mảng JSON hợp lệ

---

### 2. `whales tokens search <query>`

**Ý nghĩa:** Tìm token theo tên hoặc symbol.

| Option | Ý nghĩa |
|--------|---------|
| `--limit <n>` | Giới hạn kết quả |
| `--format json\|plain` | Xuất JSON hoặc plain |

**Cách test:**
```bash
whales tokens search MEGA --limit 5
whales tokens search PENGU --format json
```
- [ ] Kết quả chứa từ khóa tìm kiếm
- [ ] JSON hợp lệ

---

### 3. `whales tokens get <token-id>`

**Ý nghĩa:** Xem chi tiết 1 token theo ID.

| Option | Ý nghĩa |
|--------|---------|
| `--format json\|plain` | Xuất JSON hoặc plain |

**Cách test:**
```bash
# Lấy ID từ list
whales tokens list --limit 1 --format json | jq -r '.[0].id'
# Thay <ID> bằng ID vừa lấy
whales tokens get <ID>
whales tokens get <ID> --format json
```
- [ ] Hiển thị: ID, Name, Symbol, Status, Price, Chain ID, Description
- [ ] JSON có đủ fields

---

### 4. `whales tokens highlight`

**Ý nghĩa:** Lấy danh sách tokens được highlight/trending.

**Cách test:**
```bash
whales tokens highlight
whales tokens highlight --format json
```
- [ ] Trả về danh sách tokens
- [ ] Format đúng

---

### 5. `whales tokens stats`

**Ý nghĩa:** Thống kê prediction (volume, count, v.v.).

**Cách test:**
```bash
whales tokens stats
whales tokens stats --format json
```
- [ ] Có số liệu thống kê
- [ ] JSON hợp lệ

---

### 6. `whales book <symbol>`

**Ý nghĩa:** Xem order book (sổ lệnh) của token theo symbol — SELL ORDERS (asks) và BUY ORDERS (bids).

| Option | Ý nghĩa |
|--------|---------|
| `--depth <n>` | Số dòng mỗi bên (mặc định 10) |
| `--chain-id <id>` | Lọc theo chain |
| `--live` | WebSocket real-time (chưa implement) |
| `--format json\|plain` | Xuất JSON hoặc plain |

**Cách test:**
```bash
whales book MEGA --depth 5
whales book PENGU --depth 3 --format json
```
- [ ] Có section **SELL ORDERS** và **BUY ORDERS**
- [ ] Có cột: Price, Size, Filled, Remaining, Fill (Open/Partial/Filled), Value
- [ ] Có **Spread**
- [ ] `--format json` có `sell_orders`, `buy_orders`, `spread`, `symbol`

---

### 7. `whales networks list`

**Ý nghĩa:** Liệt kê networks hỗ trợ (chain ID, RPC, v.v.).

**Cách test:**
```bash
whales networks list
whales networks list --format json
```
- [ ] Có thông tin chain
- [ ] JSON hợp lệ

---

### 8. `whales status`

**Ý nghĩa:** Kiểm tra kết nối API và trạng thái hệ thống.

**Cách test:**
```bash
whales status
whales status --format json
```
- [ ] Hiển thị API URL và trạng thái
- [ ] JSON hợp lệ

---

### 9. `whales orderbook snapshot`

**Ý nghĩa:** Thống kê tổng hợp order book (số lệnh, volume, giá trung bình).

**Cách test:**
```bash
whales orderbook snapshot
whales orderbook snapshot --format json
```
- [ ] Có số liệu buy/sell, volume, value
- [ ] JSON hợp lệ

---

### 10. `whales orderbook positions` / `pairs` / `filled`

**Ý nghĩa:** Các lệnh phụ của orderbook (positions, pairs, filled order).

**Cách test:**
```bash
whales orderbook positions
whales orderbook pairs
whales orderbook filled <id>
```
- [ ] Chạy không lỗi hoặc báo lỗi rõ ràng (có thể cần tham số)

---

## Phase 2: Cần wallet (setup trước)

### Setup wallet (1 lần)

```bash
whales setup
# hoặc
whales wallet import <PRIVATE_KEY> --type solana
```

---

### 11. `whales wallet create` / `import` / `show` / `address` / `link`

**Ý nghĩa:** Quản lý ví — tạo, import, xem thông tin, lấy địa chỉ, link.

| Command | Ý nghĩa |
|---------|---------|
| `wallet create --type solana\|evm` | Tạo ví mới |
| `wallet import <key> --type solana\|evm` | Import từ private key |
| `wallet show` | Hiển thị thông tin ví |
| `wallet address` | Chỉ hiển thị địa chỉ |
| `wallet link <address>` | Link địa chỉ |

**Cách test:**
```bash
whales wallet show
whales wallet address --format json
```
- [ ] Hiển thị address và type
- [ ] JSON hợp lệ

---

### 12. `whales offers list` / `my` / `get` / `react`

**Ý nghĩa:** Quản lý offers — xem tất cả, xem của mình, chi tiết, react.

| Command | Ý nghĩa |
|---------|---------|
| `offers list` | Danh sách tất cả offers |
| `offers my` | Offers của wallet mình |
| `offers get <id>` | Chi tiết 1 offer |
| `offers react <id>` | React với offer |

**Cách test:**
```bash
whales offers list --limit 5
whales offers my
whales offers get <OFFER_ID>
```
- [ ] `offers my` cần wallet đã setup
- [ ] Table/JSON đúng format

---

### 13. `whales orders list` / `my` / `get` / `by-offer`

**Ý nghĩa:** Quản lý orders — danh sách, của mình, chi tiết, theo offer.

| Command | Ý nghĩa |
|---------|---------|
| `orders list` | Danh sách tất cả orders |
| `orders my` | Orders của wallet mình |
| `orders get <id>` | Chi tiết 1 order |
| `orders by-offer <address>` | Orders theo offer address |

**Cách test:**
```bash
whales orders list --limit 5
whales orders my
whales orders get <ORDER_ID>
```
- [ ] `orders my` cần wallet
- [ ] Output đúng format

---

### 14. `whales portfolio show` / `positions` / `balance`

**Ý nghĩa:** Xem portfolio — tổng quan, positions, balance.

**Cách test:**
```bash
whales portfolio show
whales portfolio positions
whales portfolio balance
```
- [ ] Cần wallet
- [ ] Có số liệu hoặc thông báo rõ ràng

---

### 15. `whales referral summary` / `campaigns` / `earnings` / `transactions`

**Ý nghĩa:** Thông tin referral — tổng quan, campaigns, earnings, transactions.

**Cách test:**
```bash
whales referral summary
whales referral campaigns
whales referral earnings
whales referral transactions
```
- [ ] Có data hoặc thông báo "no data"

---

## Global options (dùng với mọi command)

| Option | Ý nghĩa |
|--------|---------|
| `--format table\|json\|plain` | Định dạng output |
| `--api-url <url>` | Override API URL |
| `--private-key <key>` | Override private key |
| `--chain-id <id>` | Override chain ID |

---

## Help

```bash
whales --help
whales tokens --help
whales book --help
whales wallet --help
# ... tương tự cho từng command
```

---

## Cách test tổng quát

1. **Phase 1:** Chạy lần lượt các lệnh Phase 1, không cần wallet.
2. **Phase 2:** Chạy `whales setup` hoặc `wallet import`, rồi test các lệnh Phase 2.
3. **Format:** Với mỗi lệnh quan trọng, thử `--format json` và dùng `jq` để kiểm tra cấu trúc.
4. **Lỗi:** Thử lệnh sai (ví dụ `whales tokens get invalid-id`) để xem thông báo lỗi có rõ ràng không.

---

## Ví dụ dùng jq kiểm tra JSON

```bash
# Tokens list — kiểm tra là mảng
whales tokens list --limit 2 --format json | jq 'type == "array"'

# Tokens list — kiểm tra phần tử đầu có id, name, symbol
whales tokens list --limit 1 --format json | jq '.[0] | has("id") and has("name") and has("symbol")'

# Book — kiểm tra có sell_orders, buy_orders
whales book MEGA --format json | jq 'has("sell_orders") and has("buy_orders")'
```
