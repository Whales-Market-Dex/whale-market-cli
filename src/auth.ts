import { Keypair } from '@solana/web3.js';
import { Wallet } from 'ethers';
import nacl from 'tweetnacl';
import bs58 from 'bs58';
import { config } from './config';

export class Auth {
  // Get wallet from config or CLI flag
  getWallet(privateKey?: string): { address: string; type: 'solana' | 'evm' } {
    const key = privateKey || config.get('privateKey') as string;
    const type = config.get('walletType') as 'solana' | 'evm' || 'solana';
    
    if (!key) {
      throw new Error('No wallet configured. Run: whales setup');
    }
    
    if (type === 'solana') {
      try {
        const keypair = Keypair.fromSecretKey(bs58.decode(key));
        return { address: keypair.publicKey.toBase58(), type: 'solana' };
      } catch (error) {
        throw new Error('Invalid Solana private key format');
      }
    } else {
      try {
        const wallet = new Wallet(key);
        return { address: wallet.address, type: 'evm' };
      } catch (error) {
        throw new Error('Invalid EVM private key format');
      }
    }
  }
  
  // Sign transaction/message (for when transactions are needed)
  async signTransaction(transaction: any, privateKey?: string): Promise<string> {
    const key = privateKey || config.get('privateKey') as string;
    const type = config.get('walletType') as 'solana' | 'evm' || 'solana';
    
    if (!key) {
      throw new Error('No private key provided');
    }
    
    if (type === 'solana') {
      const keypair = Keypair.fromSecretKey(bs58.decode(key));
      // Sign Solana transaction
      transaction.sign([keypair]);
      return transaction.serialize().toString('base64');
    } else {
      const wallet = new Wallet(key);
      // Sign EVM transaction
      return await wallet.signTransaction(transaction);
    }
  }
  
  // Sign message for authentication
  async signMessage(message: string, privateKey?: string): Promise<string> {
    const key = privateKey || config.get('privateKey') as string;
    const type = config.get('walletType') as 'solana' | 'evm' || 'solana';
    
    if (!key) {
      throw new Error('No private key provided');
    }
    
    if (type === 'solana') {
      const keypair = Keypair.fromSecretKey(bs58.decode(key));
      const messageBytes = Buffer.from(message);
      const signature = nacl.sign.detached(messageBytes, keypair.secretKey);
      return bs58.encode(signature);
    } else {
      const wallet = new Wallet(key);
      return await wallet.signMessage(message);
    }
  }
  
  // Get wallet address without private key (for read-only operations)
  getAddress(privateKey?: string): string {
    return this.getWallet(privateKey).address;
  }
}

export const auth = new Auth();
