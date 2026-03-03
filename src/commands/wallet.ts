import { Command } from 'commander';
import chalk from 'chalk';
import { config } from '../config';
import { auth } from '../auth';
import { createSolanaWallet, createEvmWallet, importSolanaWallet, importEvmWallet } from '../utils/wallet';
import { handleOutput, handleError, printDetailTable } from '../output';

export const walletCommand = new Command('wallet')
  .description('Wallet management');

// Create wallet
walletCommand
  .command('create')
  .description('Generate new wallet')
  .option('--type <type>', 'Wallet type (solana|evm)', 'solana')
  .action(async (options, command) => {
    const globalOpts = command.optsWithGlobals();
    
    try {
      let wallet: { privateKey: string; address: string; mnemonic: string };
      
      if (options.type === 'solana') {
        wallet = createSolanaWallet();
      } else if (options.type === 'evm') {
        wallet = createEvmWallet();
      } else {
        throw new Error('Invalid wallet type. Use "solana" or "evm"');
      }
      
      if (globalOpts.format === 'json') {
        console.log(JSON.stringify({
          address: wallet.address,
          privateKey: wallet.privateKey,
          mnemonic: wallet.mnemonic,
          type: options.type
        }, null, 2));
      } else {
        console.log(chalk.green('\n✓ Wallet created!\n'));
        console.log(chalk.yellow('IMPORTANT: Save your mnemonic securely!'));
        console.log(chalk.white(`Mnemonic: ${wallet.mnemonic}`));
        console.log(chalk.white(`Address: ${wallet.address}`));
        console.log(chalk.white(`Type: ${options.type}\n`));
      }
    } catch (error: any) {
      handleError(error, globalOpts.format);
    }
  });

// Import wallet
walletCommand
  .command('import <private-key>')
  .description('Import existing wallet')
  .option('--type <type>', 'Wallet type (solana|evm)', 'solana')
  .action(async (privateKey, options, command) => {
    const globalOpts = command.optsWithGlobals();
    
    try {
      let address: string;
      
      if (options.type === 'solana') {
        const wallet = importSolanaWallet(privateKey);
        address = wallet.address;
      } else if (options.type === 'evm') {
        const wallet = importEvmWallet(privateKey);
        address = wallet.address;
      } else {
        throw new Error('Invalid wallet type. Use "solana" or "evm"');
      }
      
      if (globalOpts.format === 'json') {
        console.log(JSON.stringify({
          address,
          type: options.type
        }, null, 2));
      } else {
        console.log(chalk.green(`\n✓ Wallet imported! Address: ${address}\n`));
      }
    } catch (error: any) {
      handleError(error, globalOpts.format);
    }
  });

// Show wallet
walletCommand
  .command('show')
  .description('Display wallet details')
  .action(async (options, command) => {
    const globalOpts = command.optsWithGlobals();
    
    try {
      const wallet = auth.getWallet();
      const walletType = config.get('walletType') as string;
      
      if (globalOpts.format === 'json') {
        console.log(JSON.stringify({
          address: wallet.address,
          type: walletType
        }, null, 2));
      } else {
        printDetailTable([
          ['Address', wallet.address],
          ['Type', walletType || 'Not configured']
        ]);
      }
    } catch (error: any) {
      handleError(error, globalOpts.format);
    }
  });

// Get address
walletCommand
  .command('address')
  .description('Show wallet address')
  .action(async (options, command) => {
    const globalOpts = command.optsWithGlobals();
    
    try {
      const address = auth.getAddress();
      
      if (globalOpts.format === 'json') {
        console.log(JSON.stringify({ address }, null, 2));
      } else {
        console.log(address);
      }
    } catch (error: any) {
      handleError(error, globalOpts.format);
    }
  });

// Link wallet (placeholder - would need API endpoint)
walletCommand
  .command('link <target-address>')
  .description('Link multiple wallets together')
  .action(async (targetAddress, options, command) => {
    const globalOpts = command.optsWithGlobals();
    
    try {
      const wallet = auth.getWallet();
      
      // This would call the API endpoint /auth/link-wallet
      // For now, just show a message
      if (globalOpts.format === 'json') {
        console.log(JSON.stringify({
          message: 'Wallet linking not yet implemented',
          currentAddress: wallet.address,
          targetAddress
        }, null, 2));
      } else {
        console.log(chalk.yellow('\nWallet linking not yet implemented'));
        console.log(chalk.white(`Current address: ${wallet.address}`));
        console.log(chalk.white(`Target address: ${targetAddress}\n`));
      }
    } catch (error: any) {
      handleError(error, globalOpts.format);
    }
  });
