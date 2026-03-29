# whale-market-cli

CLI for the [Whales Market](https://whales.market) pre-market trading platform. Supports multi-chain wallet management, offer creation/filling/settling, OTC trading, and order book queries across EVM, Solana, Sui, and Aptos.

## Commands

```bash
npm run build       # Compile TypeScript → dist/
npm run dev         # Run via ts-node (development)
npm test            # Jest
npm start           # Run compiled output
```

No lint command configured.

## Project Layout

```
src/
├── index.ts                      # CLI entry point — registers all commands, suppresses punycode warnings
├── types.ts                      # Shared types: Token, Offer, Order, ApiResponse, OutputFormat
├── api.ts                        # ApiClient singleton (axios, V2 endpoints, error interceptor)
├── config.ts                     # Persistent config via `conf` (wallets, RPC overrides, settings)
├── auth.ts                       # JWT/token management
├── load-env.ts                   # Loads ~/.whales-cli.env into process.env
│
├── commands/                     # One file per top-level CLI command group
│   ├── wallet.ts                 # `whales wallet` — create, import, list, use, show, remove
│   ├── trade.ts                  # `whales trade` — create-offer, fill-offer, close-offer, settle, claim-collateral
│   ├── otc.ts                    # `whales otc` — create, fill, cancel OTC positions
│   ├── offers.ts                 # `whales offers` — list, my, get, react
│   ├── orders.ts                 # `whales orders` — list, my, get, by-offer
│   ├── tokens.ts                 # `whales tokens` — list, get, search, highlight, stats
│   ├── book.ts                   # `whales book` — order book with depth option
│   ├── orderbook.ts              # `whales orderbook` — V2 aggregated order book (snapshot, positions, pairs)
│   ├── portfolio.ts              # `whales portfolio` — show, positions, balance
│   ├── referral.ts               # `whales referral` — summary, campaigns, earnings, transactions
│   ├── config.ts                 # `whales config` — get/set config + RPC subcommands
│   ├── networks.ts               # `whales networks` — list supported chains
│   ├── status.ts                 # `whales status` — API health + active wallet info
│   ├── setup.ts                  # `whales setup` — interactive first-time setup wizard
│   ├── shell.ts                  # `whales shell` — REPL mode
│   ├── completion.ts             # `whales completion` — zsh/bash shell completion
│   ├── upgrade.ts                # `whales upgrade` — self-update from npm
│   ├── help.ts                   # `whales help` — extended help docs
│   └── helpers/
│       ├── chain.ts              # Chain resolution: getChainType, is*Chain, getPreMarket, resolveRpc
│       ├── resolve.ts            # UUID → on-chain ID: resolveToken, resolveOffer, resolveOrder, resolveOtcOffer
│       └── confirm.ts            # confirmTx() — interactive confirmation prompt, respects --yes
│
├── blockchain/                   # Chain-specific contract implementations
│   ├── types.ts                  # Shared interfaces: ChainAdapter, TxResult, OfferData, DiscountData
│   ├── evm/
│   │   ├── constants.ts          # EVM_CHAINS: chain configs, default RPC URLs, explorer links
│   │   ├── signer.ts             # deriveEvmWallet(), EvmAdapter
│   │   ├── utils.ts              # parseUnits, formatUnits, encodeSettleData, isReferralNetwork, ETH_ADDRESS
│   │   ├── ex-tokens.ts          # Supported exchange tokens (USDC/USDT) per EVM chain
│   │   └── contracts/
│   │       ├── PreMarket.ts      # EvmPreMarket — create/fill/close/settle/claim via ethers.js
│   │       ├── OtcPreMarket.ts   # EvmOtcPreMarket — OTC operations
│   │       └── abis/             # ABI JSON for PreMarket, PreMarketRef, OtcPreMarket, ERC20
│   ├── solana/
│   │   ├── constants.ts          # SOLANA_RPC URLs, Anchor program IDs
│   │   ├── signer.ts             # deriveSolanaKeypair(), SolanaAdapter
│   │   ├── utils.ts              # Solana-specific utilities
│   │   └── programs/
│   │       ├── PreMarket.ts      # SolanaPreMarket — Anchor-based contract calls
│   │       ├── OtcPreMarket.ts   # SolanaOtcPreMarket
│   │       └── idl/              # Anchor IDL definitions (pre_market.ts, otc_pre_market.ts)
│   ├── sui/
│   │   ├── constants.ts          # SUI_RPC URLs, Move package IDs
│   │   ├── signer.ts             # deriveSuiKeypair(), SuiAdapter
│   │   └── contracts/
│   │       ├── PreMarket.ts      # SuiPreMarket — Move contract calls via @mysten/sui
│   │       └── OtcPreMarket.ts   # Stub — throws (not yet implemented)
│   └── aptos/
│       ├── constants.ts          # APTOS_RPC URLs, Move module addresses
│       ├── signer.ts             # deriveAptosAccount(), AptosAdapter
│       └── contracts/
│           ├── PreMarket.ts      # AptosPreMarket — Move contract calls via @aptos-labs/ts-sdk
│           └── OtcPreMarket.ts   # Stub — throws (not yet implemented)
│
├── output/                       # Output formatting layer
│   ├── index.ts                  # handleOutput(data, format, tableFn), handleError(error, format)
│   ├── table.ts                  # cli-table3 formatters: printTokensTable, printTxResultTable, etc.
│   ├── json.ts                   # JSON serialization + error formatting
│   └── plain.ts                  # Plain text output
│
└── utils/
    ├── wallet.ts                 # BIP-39: generateMnemonic, deriveEvmAddress, deriveSolanaAddress, deriveAllAddresses
    └── format.ts                 # String/number formatting helpers
```

## Architecture

### Chain abstraction

All chain-specific logic lives under `src/blockchain/{evm,solana,sui,aptos}/`. Each chain exposes:
- A `*Adapter` implementing the `ChainAdapter` interface (`src/blockchain/types.ts`)
- A `*PreMarket` contract class
- A `*OtcPreMarket` contract class (EVM + Solana only; Sui/Aptos throw)

Chain resolution entry point: `src/commands/helpers/chain.ts`
- Use `isSolanaChain()`, `isEvmChain()`, `isSuiChain()`, `isAptosChain()` — never hardcode chain IDs
- `getPreMarket(chainId, mnemonic)` and `getOtcPreMarket(chainId, mnemonic)` return the correct implementation

### Chain ID conventions

| Chain | IDs |
|---|---|
| EVM (Ethereum, Arbitrum, Base, BSC, etc.) | Standard EVM chain IDs |
| Solana mainnet / devnet | 666666 / 999999 |
| Sui mainnet / testnet | 900000 / 900002 |
| Aptos mainnet / testnet | 900001 / 900003 |

### ID formats by chain

- EVM + Solana: numeric offer/order IDs
- Sui + Aptos: string addresses
- `parseOfferId(chainId, value)` and `parseOrderId(chainId, value)` handle conversion

### UUID resolution

Token, offer, and order UUIDs (from the API/UI) resolve to `{chainId, on-chain-id}` via the helpers in `src/commands/helpers/resolve.ts`. Pass UUIDs or raw on-chain IDs + `--chain-id`.

### Command structure

All commands use Commander.js. Global options (`--format`, `--yes`, `--chain-id`, `--api-url`, `--private-key`) are accessed via `command.optsWithGlobals()`. Output is dispatched via `handleOutput(data, format, tablePrinterFn)`.

```typescript
.action(async (options, command) => {
  const globalOpts = command.optsWithGlobals();
  try {
    handleOutput(data, globalOpts.format, printFn);
  } catch (error: any) {
    handleError(error, globalOpts.format);
  }
});
```

### Configuration precedence

1. CLI flags
2. Environment variables (`~/.whales-cli.env`)
3. Config file (`conf` store)
4. Hardcoded defaults

## Key conventions

- Use `isSolanaChain(chainId)` etc. instead of comparing chain IDs directly
- `--ex-token` is optional; collateral checks handle its absence gracefully
- `--yes` / `-y` skips `confirmTx()` prompts for non-interactive use
- Output format is always `table` | `json` | `plain` — never print directly to stdout in command actions
- EVM referral networks use `PreMarketRef` ABI; selected automatically in `EvmPreMarket.init()`

## Gotchas

- **Punycode warnings** are suppressed in `src/index.ts` — these come from Solana SDK transitive deps, not our code
- **API response shape**: V2 returns `{data: {count, list: [...]}}`, V1 returns a flat array — code handles both
- **OTC UUID resolution** uses `exit_position_index`, not `offer_index` — handled in `resolveOtcOffer()`
- **Collateral minimum**: $10 USD minimum enforced on create/fill; falls back gracefully if price API unavailable
- **EVM contract lazy init**: `EvmPreMarket` doesn't resolve chainId until `init()` is called — contract instance can be created before chainId is known

## Key files

| File | Purpose |
|---|---|
| `src/commands/helpers/chain.ts` | Chain type resolution, adapter/contract factory functions |
| `src/commands/helpers/resolve.ts` | UUID → on-chain ID resolution |
| `src/commands/trade.ts` | Trading operations (most complex command) |
| `src/blockchain/evm/contracts/PreMarket.ts` | EVM contract implementation reference |
| `src/api.ts` | Axios API client, all endpoint calls |
| `src/config.ts` | Persistent config (wallets, RPC overrides, settings) |
| `src/output/` | Table, JSON, plain text formatters |
