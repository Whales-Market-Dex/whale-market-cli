# Plan: OFT Bridge for Cross-Chain Pre-Market Settlement

## Background

Some tokens trade pre-market on one chain (e.g., BSC) but officially launch on another (e.g., Ethereum). When settlement happens, the seller must deliver the official token. To do this on-chain via the BSC contract, the seller needs the OFT-wrapped version of the token on BSC — not the original ERC-20 on Ethereum.

The bridge is powered by **LayerZero OFT** (Omnichain Fungible Token). Two contracts are involved:

| Contract | Chain | Role |
|---|---|---|
| `MyOFTAdapter` | Origin chain (e.g. Ethereum) | Locks/unlocks origin tokens, sends cross-chain |
| `MyOFT` | Trading chain (e.g. BSC) | Mints/burns OFT-wrapped tokens, receives cross-chain |

The API returns these per-token fields when a bridge is applicable:

| Field | Meaning |
|---|---|
| `tge_oft_address` | OFT token address on the trading chain (BSC) |
| `tge_network_id` | Chain ID of the origin token (e.g. 1 for Ethereum) |
| `tge_adapter_address` | MyOFTAdapter address on origin chain (ERC-20 tokens) |
| `tge_native_adapter_address` | MyOFTAdapter address on origin chain (native tokens) |
| `tge_token_address` | Original ERC-20 token address on origin chain |

A token requires bridging when `tge_oft_address` is non-empty.

---

## Two User Flows

### Seller flow — bridge before settle

The seller holds the origin token (e.g., ETH on Ethereum). Before they can call `settle` on BSC, they need:
1. The origin token approved + locked in `MyOFTAdapter` on Ethereum
2. OFT tokens minted on BSC via LayerZero
3. Then call `settleOrder` on BSC using the OFT token address

During `whales trade settle <order-id>`:
- Detect bridge token from order/token API data (`tge_oft_address` present)
- Check if seller already has enough OFT tokens on BSC
- If not: prompt user to bridge, execute bridge flow, poll until delivered, then proceed to settle

### Buyer flow — bridge OFT back to origin

After settlement the buyer holds OFT tokens on BSC. They may want to convert them back to the real token on Ethereum. This is a standalone command: `whales bridge to-origin`.

- Check OFT balance on trading chain
- Bridge OFT → origin via `MyOFT.send()` (no approval needed, MyOFT is the token itself)
- Poll LayerZero status until delivered on origin chain

---

## Scope

- EVM chains only (LayerZero OFT is EVM-native)
- Solana, Sui, Aptos: not in scope
- No changes to non-OFT settlement paths

---

## New Files

### `src/blockchain/evm/contracts/OFTBridge.ts`

Port of `EvmOFTContract.ts` from the frontend, adapted for ethers v6 (CLI uses ethers, frontend uses viem). No React dependencies.

**Class: `OFTBridge`**

Constructor:
```typescript
constructor(
  provider: ethers.Provider,
  signer: ethers.Signer,
  oftAdapterAddress: string,   // MyOFTAdapter on origin chain
  oftAddress: string,          // MyOFT on trading chain
  oftAdapterChainId: number,   // Origin chain ID (e.g. 1)
  oftChainId: number,          // Trading chain ID (e.g. 56)
  isNative: boolean = false    // Origin token is native coin (ETH)
)
```

Methods:

**`quoteBridgeToOFT(params: BridgeQuoteParams): Promise<BridgeFee>`**
- Calls `MyOFTAdapter.quoteSend(sendParam, false)` on origin chain
- Returns `{ nativeFee: bigint, lzTokenFee: bigint }`
- Needed so CLI can show user the fee before confirming

**`bridgeToOFT(params: BridgeParams): Promise<BridgeTxResult>`**
- Origin chain → trading chain (seller flow)
- Steps:
  1. Parse amount to bigint using token decimals
  2. Check origin token balance (ERC-20 or native)
  3. Check native balance covers fee + amount (if native) or fee only (if ERC-20)
  4. If ERC-20: approve MyOFTAdapter if allowance insufficient
  5. Build `SendParam`: `{ dstEid, to: zeroPad(recipient, 32), amountLD, minAmountLD, extraOptions, composeMsg: "0x", oftCmd: "0x" }`
  6. Call `quoteSend` on MyOFTAdapter to get `messagingFee`
  7. Call `MyOFTAdapter.send(sendParam, messagingFee, refundAddress, { value: nativeFee [+ amountLD if native] })`
  8. Return `{ txHash }`

**`quoteBridgeToOrigin(params: BridgeQuoteParams): Promise<BridgeFee>`**
- Calls `MyOFT.quoteSend(sendParam, false)` on trading chain

**`bridgeToOrigin(params: BridgeParams): Promise<BridgeTxResult>`**
- Trading chain → origin chain (buyer flow)
- Same steps but uses `MyOFT` directly (no approval, MyOFT is the token)
- Provider/signer connect to trading chain instead of origin chain

**`getOFTBalance(address: string): Promise<bigint>`**
- Reads OFT token balance on trading chain

**`getOriginTokenBalance(address: string): Promise<bigint>`**
- Reads origin ERC-20 (or native) balance on origin chain

Helper: `buildExtraOptions(gasLimit: number = 200000): string`
- Uses `@layerzerolabs/lz-v2-utilities` `Options.newOptions().addExecutorLzReceiveOption(gasLimit, 0).toHex()`

### `src/blockchain/evm/oft-constants.ts`

LayerZero Endpoint ID mapping (required for `dstEid` in SendParam):

```typescript
export const LZ_EID: Record<number, number> = {
  // Mainnet
  1:    30101,  // Ethereum
  56:   30102,  // BSC
  8453: 30184,  // Base
  42161: 30110, // Arbitrum
  // Testnet
  11155111: 40161, // Sepolia
  97:       40102, // BSC testnet
};

export function getLzEid(chainId: number): number {
  const eid = LZ_EID[chainId];
  if (!eid) throw new Error(`No LayerZero endpoint ID for chain ${chainId}`);
  return eid;
}
```

### `src/blockchain/evm/abis/MyOFTAbi.ts` and `MyOFTAdapterAbi.ts`

Copy ABI arrays from the frontend reference. Only the following functions are needed:
- `send(SendParam, MessagingFee, address) payable`
- `quoteSend(SendParam, bool) view returns (MessagingFee)`
- `balanceOf(address) view returns (uint256)`
- `allowance(address, address) view returns (uint256)`
- `approve(address, uint256)`

### `src/commands/bridge.ts`

New top-level command group: `whales bridge`

**`whales bridge to-oft <order-id>`**

Seller: bridge origin token → OFT token on trading chain.

Options:
- `--amount <n>` — amount to bridge (default: full settlement amount from order)
- `--gas-limit <n>` — LayerZero executor gas limit (default: 200000)
- `--slippage <pct>` — slippage % for minAmountLD (default: 0.5)
- `--quote` — show fee quote and exit without executing

Flow:
1. Resolve order UUID → `{ chainId, tokenData }`
2. Validate token has `tge_oft_address` (throw if not a bridge token)
3. Derive seller wallet address
4. Call `OFTBridge.getOFTBalance(sellerAddress)` on trading chain
5. Show current OFT balance and required amount
6. If `--quote`: call `quoteBridgeToOFT`, print fee, exit
7. Confirm: "Bridge X [TOKEN] from Ethereum to BSC. LayerZero fee: ~0.0015 ETH. Proceed?"
8. Execute `OFTBridge.bridgeToOFT(...)`
9. Print tx hash with Etherscan link
10. Poll LayerZero status until DELIVERED (see polling below)
11. Print: "Bridge complete. You can now run: whales trade settle <order-id>"

**`whales bridge to-origin <order-id>`**

Buyer: bridge OFT tokens back to origin token.

Options:
- `--amount <n>` — amount to bridge (default: full OFT balance)
- `--gas-limit <n>` — LayerZero executor gas limit (default: 200000)
- `--slippage <pct>` — slippage % (default: 0.5)
- `--quote` — show fee quote and exit

Flow:
1. Resolve order UUID → `{ chainId, tokenData }`
2. Validate `tge_oft_address` present
3. Derive buyer wallet address
4. Call `OFTBridge.getOFTBalance(buyerAddress)` on trading chain
5. If `--quote`: call `quoteBridgeToOrigin`, print fee, exit
6. Confirm: "Bridge X OFT tokens from BSC back to Ethereum. Proceed?"
7. Execute `OFTBridge.bridgeToOrigin(...)`
8. Print tx hash with LayerZero scan link
9. Poll LayerZero status until DELIVERED
10. Print: "Bridge complete. Your [TOKEN] is now available on Ethereum."

**`whales bridge status <tx-hash>`**

Poll and print LayerZero message status for a bridge transaction.

---

## Modifications to Existing Files

### `src/commands/trade.ts` — `settle` command

Add pre-settlement bridge check for EVM orders with OFT tokens.

After resolving `chainId` and order data (step where `tokenAddressFromApi` is set), add:

```
if isEvmChain(chainId) AND order.token.tge_oft_address is set:
  1. Set tokenAddress = tge_oft_address (use OFT token for settlement, not origin)
  2. Check seller's OFT balance on trading chain
  3. If balance >= required amount → proceed normally
  4. If balance < required amount:
     a. Print: "You need X [TOKEN_OFT] to settle but only have Y."
     b. Print: "Bridge required: transfer origin token from [tge_network_id chain] to this chain first."
     c. Prompt: "Run bridge now? (requires origin token on [origin chain])"
     d. If yes → execute inline bridge flow (same as bridge to-oft command)
     e. If no → print bridge command hint and exit
```

The settlement itself does not change — it calls `settleOrder(orderId, tge_oft_address, amount)` using the OFT address as the token address. The PreMarket contract on BSC accepts OFT tokens the same way it accepts any ERC-20.

### `src/types.ts` — Token interface

Add TGE fields so they are typed (currently covered by `[key: string]: any` but worth making explicit):

```typescript
export interface Token {
  // ... existing fields ...
  tge_oft_address?: string;
  tge_network_id?: number;
  tge_adapter_address?: string;
  tge_token_address?: string;
  tge_native_adapter_address?: string;
}
```

### `src/commands/helpers/resolve.ts` — `resolveOrder`

Ensure resolved order data includes token TGE fields. The API response for `/v2/orders/{uuid}` should already include `token.tge_*` fields. Verify the return type carries them through.

---

## LayerZero Status Polling

The frontend polls `https://scan.layerzero-api.com/v1/messages/tx/{txHash}` until status is `DELIVERED`.

In the CLI, implement as a spinner loop in a helper function `waitForLayerZeroDelivery(txHash, options?)`:

```
Poll every 4 seconds.
Status values: INFLIGHT → CONFIRMING → DELIVERED
Print spinner text: "LayerZero: INFLIGHT..." / "LayerZero: CONFIRMING..."
On DELIVERED: stop spinner, print success.
Timeout after 20 minutes (configurable via --timeout flag).
Print LayerZero scan link: https://layerzeroscan.com/tx/{txHash}
```

This helper lives in `src/commands/helpers/layerzero.ts`.

---

## RPC Handling

The bridge involves **two chains** simultaneously:
- Origin chain (e.g. Ethereum, `tge_network_id`): for `OFTAdapter` operations
- Trading chain (e.g. BSC, `chainId`): for balance check and settlement

The `OFTBridge` class needs two providers:
- `originProvider`: `new ethers.JsonRpcProvider(resolveRpc(tge_network_id))`
- `tradingProvider`: `new ethers.JsonRpcProvider(resolveRpc(chainId))`

The signer (from mnemonic) connects to origin chain for `bridgeToOFT` and trading chain for `bridgeToOrigin`.

Custom RPC for origin chain is configurable via `whales config rpc set <tge_network_id> <url>`.

---

## Native Token Handling

If the origin token is a native coin (ETH, BNB), use `tge_native_adapter_address` instead of `tge_adapter_address`. The distinction is:
- `isNative = !tge_adapter_address && !!tge_native_adapter_address`
- Native: no ERC-20 approval needed; `msg.value = amountLD + nativeFee`
- ERC-20: approve MyOFTAdapter; `msg.value = nativeFee` only

---

## New Dependency

`@layerzerolabs/lz-v2-utilities` — for building `extraOptions` (executor options encoding).

```bash
npm install @layerzerolabs/lz-v2-utilities
```

This is the same package used in the frontend reference.

---

## Error Cases to Handle

| Error | Message to user |
|---|---|
| `tge_oft_address` missing | "This token does not require bridging. Settle directly." |
| Insufficient origin token balance | "Insufficient [TOKEN] on Ethereum. Need X, have Y." |
| Insufficient native gas for LZ fee | "Insufficient ETH for LayerZero fee (~X ETH). Top up wallet on Ethereum." |
| Origin chain not in `LZ_EID` map | "Chain [ID] does not have a LayerZero endpoint configured." |
| LayerZero polling timeout | "Bridge not confirmed after 20 minutes. Check status: whales bridge status <txHash>" |
| Wrong chain RPC | "RPC for chain [ID] unavailable. Set custom RPC: whales config rpc set [ID] <url>" |

---

## File Summary

| File | Action |
|---|---|
| `src/blockchain/evm/contracts/OFTBridge.ts` | New — bridge logic (port from EvmOFTContract.ts) |
| `src/blockchain/evm/oft-constants.ts` | New — LayerZero EID mapping |
| `src/blockchain/evm/abis/MyOFTAbi.ts` | New — minimal OFT ABI |
| `src/blockchain/evm/abis/MyOFTAdapterAbi.ts` | New — minimal OFTAdapter ABI |
| `src/commands/bridge.ts` | New — `whales bridge to-oft / to-origin / status` |
| `src/commands/helpers/layerzero.ts` | New — `waitForLayerZeroDelivery()` polling helper |
| `src/commands/trade.ts` | Modify — OFT balance check + bridge prompt in `settle` |
| `src/types.ts` | Modify — add `tge_*` fields to Token interface |
| `src/index.ts` | Modify — register `bridgeCommand` |

---

## Out of Scope

- Solana, Sui, Aptos bridge (not OFT-based)
- Partial bridge amounts with auto-top-up logic
- Bridging tokens other than the settlement token
- Gas estimation for the settlement tx itself (existing logic handles that)
- UI for tracking pending bridges across sessions (not persisted)
