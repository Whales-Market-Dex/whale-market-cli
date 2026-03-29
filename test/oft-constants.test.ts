import { getLzEid, LZ_EID } from '../src/blockchain/evm/oft-constants';

describe('getLzEid', () => {
  it('returns EID for Ethereum mainnet', () => {
    expect(getLzEid(1)).toBe(30101);
  });

  it('returns EID for BSC mainnet', () => {
    expect(getLzEid(56)).toBe(30102);
  });

  it('returns EID for Base mainnet', () => {
    expect(getLzEid(8453)).toBe(30184);
  });

  it('returns EID for Arbitrum mainnet', () => {
    expect(getLzEid(42161)).toBe(30110);
  });

  it('returns EID for Sepolia testnet', () => {
    expect(getLzEid(11155111)).toBe(40161);
  });

  it('returns EID for BSC testnet', () => {
    expect(getLzEid(97)).toBe(40102);
  });

  it('throws for unknown chain', () => {
    expect(() => getLzEid(999999)).toThrow('No LayerZero endpoint ID for chain 999999');
  });

  it('LZ_EID map contains all expected mainnet chains', () => {
    expect(Object.keys(LZ_EID).map(Number)).toEqual(
      expect.arrayContaining([1, 56, 8453, 42161])
    );
  });
});
