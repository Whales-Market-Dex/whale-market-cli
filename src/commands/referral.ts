import { Command } from 'commander';
import ora from 'ora';
import { apiClient } from '../api';
import { auth } from '../auth';
import { handleOutput, handleError, printDetailTable } from '../output';

export const referralCommand = new Command('referral')
  .description('Referral system');

// Summary
referralCommand
  .command('summary')
  .description('Get campaign summary')
  .option('--address <addr>', 'Wallet address (defaults to configured wallet)')
  .action(async (options, command) => {
    const globalOpts = command.optsWithGlobals();
    const spinner = ora('Fetching summary...').start();
    
    try {
      const address = options.address || auth.getAddress();
      const response = await apiClient.getReferralSummary(address);
      spinner.stop();
      
      const summary = response.data || response;
      
      if (globalOpts.format === 'json') {
        handleOutput(summary, globalOpts.format, () => {});
      } else {
        printDetailTable(Object.entries(summary).map(([k, v]) => [k, String(v)]));
      }
    } catch (error: any) {
      spinner.stop();
      handleError(error, globalOpts.format);
    }
  });

// Campaigns
referralCommand
  .command('campaigns')
  .description('List my campaigns')
  .option('--address <addr>', 'Wallet address (defaults to configured wallet)')
  .action(async (options, command) => {
    const globalOpts = command.optsWithGlobals();
    const spinner = ora('Fetching campaigns...').start();
    
    try {
      const address = options.address || auth.getAddress();
      const response = await apiClient.getReferralCampaigns(address);
      spinner.stop();
      
      const campaigns = response.data || [];
      
      if (globalOpts.format === 'json') {
        handleOutput(campaigns, globalOpts.format, () => {});
      } else {
        if (campaigns.length === 0) {
          console.log('No campaigns found');
        } else {
          campaigns.forEach((campaign: any, index: number) => {
            console.log(`\nCampaign ${index + 1}:`);
            printDetailTable(Object.entries(campaign).map(([k, v]) => [k, String(v)]));
          });
        }
      }
    } catch (error: any) {
      spinner.stop();
      handleError(error, globalOpts.format);
    }
  });

// Earnings
referralCommand
  .command('earnings')
  .description('Show referral earnings')
  .option('--address <addr>', 'Wallet address (defaults to configured wallet)')
  .action(async (options, command) => {
    const globalOpts = command.optsWithGlobals();
    const spinner = ora('Fetching earnings...').start();
    
    try {
      const address = options.address || auth.getAddress();
      const response = await apiClient.getReferralPerformance(address);
      spinner.stop();
      
      const performance = response.data || [];
      
      if (globalOpts.format === 'json') {
        handleOutput(performance, globalOpts.format, () => {});
      } else {
        if (performance.length === 0) {
          console.log('No earnings data found');
        } else {
          performance.forEach((item: any, index: number) => {
            console.log(`\nEarning ${index + 1}:`);
            printDetailTable(Object.entries(item).map(([k, v]) => [k, String(v)]));
          });
        }
      }
    } catch (error: any) {
      spinner.stop();
      handleError(error, globalOpts.format);
    }
  });

// Transactions
referralCommand
  .command('transactions')
  .description('Get referral transactions')
  .option('--address <addr>', 'Wallet address (defaults to configured wallet)')
  .action(async (options, command) => {
    const globalOpts = command.optsWithGlobals();
    const spinner = ora('Fetching transactions...').start();
    
    try {
      const address = options.address || auth.getAddress();
      const response = await apiClient.getReferralTransactions(address);
      spinner.stop();
      
      const transactions = response.data || [];
      
      if (globalOpts.format === 'json') {
        handleOutput(transactions, globalOpts.format, () => {});
      } else {
        if (transactions.length === 0) {
          console.log('No transactions found');
        } else {
          transactions.forEach((tx: any, index: number) => {
            console.log(`\nTransaction ${index + 1}:`);
            printDetailTable(Object.entries(tx).map(([k, v]) => [k, String(v)]));
          });
        }
      }
    } catch (error: any) {
      spinner.stop();
      handleError(error, globalOpts.format);
    }
  });
