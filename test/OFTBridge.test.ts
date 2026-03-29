import { OFTBridge } from '../src/blockchain/evm/contracts/OFTBridge';

describe('OFTBridge.buildExtraOptions', () => {
  it('returns a hex string', () => {
    const result = OFTBridge.buildExtraOptions();
    expect(result).toMatch(/^0x[0-9a-f]+$/i);
  });

  it('returns a non-empty hex string for default gas limit', () => {
    const result = OFTBridge.buildExtraOptions(200_000);
    expect(result.length).toBeGreaterThan(2);
  });

  it('returns different values for different gas limits', () => {
    const a = OFTBridge.buildExtraOptions(100_000);
    const b = OFTBridge.buildExtraOptions(300_000);
    expect(a).not.toBe(b);
  });
});
