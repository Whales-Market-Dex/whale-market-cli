import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { createSolanaWallet, createEvmWallet, importSolanaWallet, importEvmWallet } from '../utils/wallet';
import { config } from '../config';
import { auth } from '../auth';

export const setupCommand = new Command('setup')
  .description('Interactive first-time setup wizard')
  .action(async () => {
    console.log(chalk.cyan.bold('\n🐋 Welcome to Whales Market CLI!\n'));
    
    // 1. Choose wallet type
    const { walletAction } = await inquirer.prompt([
      {
        type: 'list',
        name: 'walletAction',
        message: 'Choose wallet setup:',
        choices: [
          { name: 'Create new Solana wallet', value: 'create-solana' },
          { name: 'Create new EVM wallet', value: 'create-evm' },
          { name: 'Import existing wallet', value: 'import' }
        ]
      }
    ]);
    
    let privateKey: string;
    let address: string;
    let walletType: 'solana' | 'evm';
    
    if (walletAction === 'create-solana') {
      const wallet = createSolanaWallet();
      privateKey = wallet.privateKey;
      address = wallet.address;
      walletType = 'solana';
      
      console.log(chalk.green('\n✓ Wallet created!'));
      console.log(chalk.yellow('\nIMPORTANT: Save your mnemonic securely!'));
      console.log(chalk.white(`Mnemonic: ${wallet.mnemonic}`));
      console.log(chalk.white(`Address: ${address}\n`));
      
      const { confirmed } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirmed',
          message: 'Have you saved your mnemonic?',
          default: false
        }
      ]);
      
      if (!confirmed) {
        console.log(chalk.red('Setup cancelled. Please save your mnemonic first.'));
        process.exit(0);
      }
    } else if (walletAction === 'create-evm') {
      const wallet = createEvmWallet();
      privateKey = wallet.privateKey;
      address = wallet.address;
      walletType = 'evm';
      
      console.log(chalk.green('\n✓ Wallet created!'));
      console.log(chalk.yellow('\nIMPORTANT: Save your mnemonic securely!'));
      console.log(chalk.white(`Mnemonic: ${wallet.mnemonic}`));
      console.log(chalk.white(`Address: ${address}\n`));
      
      const { confirmed } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'confirmed',
          message: 'Have you saved your mnemonic?',
          default: false
        }
      ]);
      
      if (!confirmed) {
        console.log(chalk.red('Setup cancelled. Please save your mnemonic first.'));
        process.exit(0);
      }
    } else {
      // Import existing wallet
      const answers = await inquirer.prompt([
        {
          type: 'list',
          name: 'type',
          message: 'Wallet type:',
          choices: ['Solana', 'EVM']
        },
        {
          type: 'password',
          name: 'key',
          message: 'Enter private key:',
          mask: '*'
        }
      ]);
      
      privateKey = answers.key;
      walletType = answers.type.toLowerCase() as 'solana' | 'evm';
      
      try {
        if (walletType === 'solana') {
          const wallet = importSolanaWallet(privateKey);
          address = wallet.address;
        } else {
          const wallet = importEvmWallet(privateKey);
          address = wallet.address;
        }
        console.log(chalk.green(`\n✓ Wallet imported! Address: ${address}\n`));
      } catch (error: any) {
        console.log(chalk.red(`\n✗ Error: ${error.message}\n`));
        process.exit(1);
      }
    }
    
    // 2. API URL
    const { apiUrl } = await inquirer.prompt([
      {
        type: 'input',
        name: 'apiUrl',
        message: 'API URL:',
        default: 'https://api.whales.market'
      }
    ]);
    
    // 3. Save config
    config.set('privateKey', privateKey);
    config.set('walletType', walletType);
    config.set('apiUrl', apiUrl);
    config.set('chainId', walletType === 'solana' ? 666666 : 1);
    
    console.log(chalk.green('\n✓ Setup complete!\n'));
    console.log(chalk.cyan('Your wallet address: ') + chalk.white(address));
    console.log(chalk.gray('Config saved to: ' + config.getPath() + '\n'));
    console.log(chalk.cyan('Try these commands:'));
    console.log(chalk.white('  whales tokens list'));
    console.log(chalk.white('  whales offers my'));
    console.log(chalk.white('  whales portfolio show\n'));
    console.log(chalk.yellow('Note: Private key is only used when signing transactions'));
  });
