import { ethers } from 'ethers';
import { Options } from '@layerzerolabs/lz-v2-utilities';
import { getLzEid } from '../oft-constants';
import { MyOFTAbi } from '../abis/MyOFTAbi';
import { MyOFTAdapterAbi } from '../abis/MyOFTAdapterAbi';
import { ERC20_ABI } from './abis/ERC20';

export interface OFTBridgeConfig {
  originProvider: ethers.JsonRpcProvider;
  tradingProvider: ethers.JsonRpcProvider;
  signer: ethers.HDNodeWallet;
  oftAdapterAddress: string;
  oftAddress: string;
  /** null when origin token is a native coin (ETH, BNB, etc.) */
  originTokenAddress: string | null;
  originChainId: number;
  tradingChainId: number;
  isNative: boolean;
}

export interface BridgeFee {
  nativeFee: bigint;
}

export interface BridgeTxResult {
  txHash: string;
}

export class OFTBridge {
  readonly cfg: OFTBridgeConfig;

  constructor(config: OFTBridgeConfig) {
    this.cfg = config;
  }

  /** Encode LayerZero executor options for a bridge send. */
  static buildExtraOptions(gasLimit: number = 200_000): string {
    return Options.newOptions().addExecutorLzReceiveOption(gasLimit, 0).toHex();
  }

  /** OFT token balance on the trading chain. */
  async getOFTBalance(address: string): Promise<bigint> {
    const oft = new ethers.Contract(this.cfg.oftAddress, MyOFTAbi, this.cfg.tradingProvider);
    return BigInt(await oft.balanceOf(address));
  }

  /** Origin token balance on the origin chain (native or ERC-20). */
  async getOriginTokenBalance(address: string): Promise<bigint> {
    if (this.cfg.isNative) {
      return this.cfg.originProvider.getBalance(address);
    }
    const token = new ethers.Contract(this.cfg.originTokenAddress!, ERC20_ABI, this.cfg.originProvider);
    return BigInt(await token.balanceOf(address));
  }

  /** Get OFT token decimals from the trading chain. */
  async getOFTDecimals(): Promise<number> {
    const oft = new ethers.Contract(this.cfg.oftAddress, MyOFTAbi, this.cfg.tradingProvider);
    return Number(await oft.decimals());
  }

  /** Get origin token decimals (native = 18). */
  async getOriginDecimals(): Promise<number> {
    if (this.cfg.isNative) return 18;
    const token = new ethers.Contract(this.cfg.originTokenAddress!, ERC20_ABI, this.cfg.originProvider);
    return Number(await token.decimals());
  }

  /** Quote the LayerZero fee to bridge origin → OFT. */
  async quoteBridgeToOFT(amountLD: bigint): Promise<BridgeFee> {
    const dstEid = getLzEid(this.cfg.tradingChainId);
    const sendParam = this.buildSendParam(dstEid, amountLD);
    const adapter = new ethers.Contract(this.cfg.oftAdapterAddress, MyOFTAdapterAbi, this.cfg.originProvider);
    const fee = await adapter.quoteSend(sendParam, false);
    return { nativeFee: BigInt(fee.nativeFee) };
  }

  /** Quote the LayerZero fee to bridge OFT → origin. */
  async quoteBridgeToOrigin(amountLD: bigint): Promise<BridgeFee> {
    const dstEid = getLzEid(this.cfg.originChainId);
    const sendParam = this.buildSendParam(dstEid, amountLD);
    const oft = new ethers.Contract(this.cfg.oftAddress, MyOFTAbi, this.cfg.tradingProvider);
    const fee = await oft.quoteSend(sendParam, false);
    return { nativeFee: BigInt(fee.nativeFee) };
  }

  /**
   * Bridge origin token → OFT on trading chain.
   * If amount is omitted, bridges the full origin token balance.
   */
  async bridgeToOFT(amount?: bigint): Promise<BridgeTxResult> {
    const originSigner = this.cfg.signer.connect(this.cfg.originProvider);
    const walletAddress = await originSigner.getAddress();

    const amountLD = amount ?? (await this.getOriginTokenBalance(walletAddress));
    if (amountLD === 0n) throw new Error('Origin token balance is zero.');

    const { nativeFee } = await this.quoteBridgeToOFT(amountLD);
    const nativeBalance = await this.cfg.originProvider.getBalance(walletAddress);

    if (this.cfg.isNative) {
      if (nativeBalance < amountLD + nativeFee) {
        throw new Error(
          `Insufficient balance. Need ${ethers.formatEther(amountLD + nativeFee)} ETH (amount + fee), have ${ethers.formatEther(nativeBalance)}.`
        );
      }
    } else {
      const tokenBalance = await this.getOriginTokenBalance(walletAddress);
      if (tokenBalance < amountLD) {
        throw new Error(`Insufficient origin token balance. Need ${amountLD}, have ${tokenBalance}.`);
      }
      if (nativeBalance < nativeFee) {
        throw new Error(
          `Insufficient native token for LayerZero fee. Need ${ethers.formatEther(nativeFee)} ETH, have ${ethers.formatEther(nativeBalance)}.`
        );
      }
      // Approve MyOFTAdapter to spend origin tokens if needed
      const tokenContract = new ethers.Contract(this.cfg.originTokenAddress!, ERC20_ABI, originSigner);
      const allowance = BigInt(await tokenContract.allowance(walletAddress, this.cfg.oftAdapterAddress));
      if (allowance < amountLD) {
        const approveTx = await tokenContract.approve(this.cfg.oftAdapterAddress, ethers.MaxUint256);
        await approveTx.wait();
      }
    }

    const dstEid = getLzEid(this.cfg.tradingChainId);
    const sendParam = {
      ...this.buildSendParam(dstEid, amountLD),
      to: ethers.zeroPadValue(walletAddress, 32),
    };
    const value = this.cfg.isNative ? amountLD + nativeFee : nativeFee;

    const adapter = new ethers.Contract(this.cfg.oftAdapterAddress, MyOFTAdapterAbi, originSigner);
    const tx = await adapter.send(sendParam, { nativeFee, lzTokenFee: 0n }, walletAddress, { value });
    return { txHash: tx.hash };
  }

  /**
   * Bridge OFT → origin token.
   * If amount is omitted, bridges the full OFT balance.
   */
  async bridgeToOrigin(amount?: bigint): Promise<BridgeTxResult> {
    const tradingSigner = this.cfg.signer.connect(this.cfg.tradingProvider);
    const walletAddress = await tradingSigner.getAddress();

    const amountLD = amount ?? (await this.getOFTBalance(walletAddress));
    if (amountLD === 0n) throw new Error('OFT token balance is zero.');

    const { nativeFee } = await this.quoteBridgeToOrigin(amountLD);
    const nativeBalance = await this.cfg.tradingProvider.getBalance(walletAddress);
    if (nativeBalance < nativeFee) {
      throw new Error(
        `Insufficient native token for LayerZero fee. Need ${ethers.formatEther(nativeFee)}, have ${ethers.formatEther(nativeBalance)}.`
      );
    }

    const dstEid = getLzEid(this.cfg.originChainId);
    const sendParam = {
      ...this.buildSendParam(dstEid, amountLD),
      to: ethers.zeroPadValue(walletAddress, 32),
    };

    const oft = new ethers.Contract(this.cfg.oftAddress, MyOFTAbi, tradingSigner);
    const tx = await oft.send(sendParam, { nativeFee, lzTokenFee: 0n }, walletAddress, { value: nativeFee });
    return { txHash: tx.hash };
  }

  private buildSendParam(dstEid: number, amountLD: bigint) {
    return {
      dstEid,
      to: ethers.zeroPadValue('0x0000000000000000000000000000000000000001', 32),
      amountLD,
      minAmountLD: amountLD,
      extraOptions: OFTBridge.buildExtraOptions(),
      composeMsg: '0x',
      oftCmd: '0x',
    };
  }
}
