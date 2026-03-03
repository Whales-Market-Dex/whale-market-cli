import { Keypair } from '@solana/web3.js';
import { Wallet } from 'ethers';
import * as bip39 from 'bip39';
import bs58 from 'bs58';

export function createSolanaWallet(): { privateKey: string; address: string; mnemonic: string } {
  const mnemonic = bip39.generateMnemonic();
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  // Use first 32 bytes for Solana keypair
  const keypair = Keypair.fromSeed(seed.slice(0, 32));
  
  return {
    privateKey: bs58.encode(keypair.secretKey),
    address: keypair.publicKey.toBase58(),
    mnemonic
  };
}

export function createEvmWallet(): { privateKey: string; address: string; mnemonic: string } {
  const wallet = Wallet.createRandom();
  
  return {
    privateKey: wallet.privateKey,
    address: wallet.address,
    mnemonic: wallet.mnemonic!.phrase
  };
}

export function importSolanaWallet(privateKey: string): { address: string } {
  try {
    const keypair = Keypair.fromSecretKey(bs58.decode(privateKey));
    return { address: keypair.publicKey.toBase58() };
  } catch (error) {
    throw new Error('Invalid Solana private key format');
  }
}

export function importEvmWallet(privateKey: string): { address: string } {
  try {
    const wallet = new Wallet(privateKey);
    return { address: wallet.address };
  } catch (error) {
    throw new Error('Invalid EVM private key format');
  }
}
