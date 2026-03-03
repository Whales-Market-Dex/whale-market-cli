import { Command } from 'commander';
import ora from 'ora';
import chalk from 'chalk';
import { apiClient } from '../api';
import { config } from '../config';
import { auth } from '../auth';
import { handleOutput, handleError } from '../output';

export const statusCommand = new Command('status')
  .description('Check API connectivity and wallet status')
  .action(async (options, command) => {
    const globalOpts = command.optsWithGlobals();
    const spinner = ora('Checking status...').start();
    
    try {
      // Check API connectivity
      try {
        await apiClient.get('/network-chains');
        spinner.succeed('API: Connected');
      } catch (error) {
        spinner.fail('API: Connection failed');
        throw error;
      }
      
      // Check wallet config
      const walletType = config.get('walletType') as string;
      const apiUrl = config.get('apiUrl') as string;
      
      let address = 'Not configured';
      try {
        address = auth.getAddress();
      } catch (error) {
        // Wallet not configured
      }
      
      if (globalOpts.format === 'json') {
        console.log(JSON.stringify({
          api: { connected: true, url: apiUrl },
          wallet: { configured: address !== 'Not configured', address, type: walletType }
        }, null, 2));
      } else {
        console.log(chalk.cyan('\nStatus:'));
        console.log(chalk.white(`  API URL: ${apiUrl}`));
        console.log(chalk.white(`  Wallet Type: ${walletType || 'Not configured'}`));
        console.log(chalk.white(`  Wallet Address: ${address}\n`));
      }
    } catch (error: any) {
      spinner.stop();
      handleError(error, globalOpts.format);
    }
  });
