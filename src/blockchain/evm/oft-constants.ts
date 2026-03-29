/** LayerZero Endpoint IDs by EVM chain ID. */
export const LZ_EID: Record<number, number> = {
  // Mainnet
  1: 30101,        // Ethereum
  56: 30102,       // BSC
  8453: 30184,     // Base
  42161: 30110,    // Arbitrum
  // Testnet
  11155111: 40161, // Sepolia
  97: 40102,       // BSC testnet
};

export function getLzEid(chainId: number): number {
  const eid = LZ_EID[chainId];
  if (eid == null) throw new Error(`No LayerZero endpoint ID for chain ${chainId}`);
  return eid;
}
