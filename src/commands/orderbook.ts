import { Command } from 'commander';
import ora from 'ora';
import { apiClient } from '../api';
import { handleOutput, handleError, printDetailTable } from '../output';

export const orderbookCommand = new Command('orderbook')
  .description('Order book v2 operations');

// Snapshot
orderbookCommand
  .command('snapshot')
  .description('Get order book snapshot statistics')
  .action(async (options, command) => {
    const globalOpts = command.optsWithGlobals();
    const spinner = ora('Fetching snapshot...').start();
    
    try {
      const response = await apiClient.getOrderBookSnapshot();
      spinner.stop();
      
      const snapshot = response.data || response;
      
      if (globalOpts.format === 'json') {
        handleOutput(snapshot, globalOpts.format, () => {});
      } else {
        if (Array.isArray(snapshot)) {
          snapshot.forEach((item: any, index: number) => {
            console.log(`\nSnapshot ${index + 1}:`);
            printDetailTable(Object.entries(item).map(([k, v]) => [k, String(v)]));
          });
        } else {
          printDetailTable(Object.entries(snapshot).map(([k, v]) => [k, String(v)]));
        }
      }
    } catch (error: any) {
      spinner.stop();
      handleError(error, globalOpts.format);
    }
  });

// Positions (requires telegram ID - placeholder)
orderbookCommand
  .command('positions')
  .description('Get order book positions')
  .option('--telegram-id <id>', 'Telegram ID')
  .action(async (options, command) => {
    const globalOpts = command.optsWithGlobals();
    
    if (!options.telegramId) {
      handleError(new Error('Telegram ID is required. Use --telegram-id <id>'), globalOpts.format);
      return;
    }
    
    const spinner = ora('Fetching positions...').start();
    
    try {
      const response = await apiClient.getOrderBookPositions(options.telegramId);
      spinner.stop();
      
      const positions = response.data || [];
      
      handleOutput(
        positions,
        globalOpts.format,
        (data) => {
          if (Array.isArray(data) && data.length > 0) {
            printDetailTable(Object.entries(data[0]).map(([k, v]) => [k, String(v)]));
          } else {
            console.log('No positions found');
          }
        }
      );
    } catch (error: any) {
      spinner.stop();
      handleError(error, globalOpts.format);
    }
  });

// Pairs (requires telegram ID - placeholder)
orderbookCommand
  .command('pairs')
  .description('List trading pairs')
  .option('--telegram-id <id>', 'Telegram ID')
  .action(async (options, command) => {
    const globalOpts = command.optsWithGlobals();
    
    if (!options.telegramId) {
      handleError(new Error('Telegram ID is required. Use --telegram-id <id>'), globalOpts.format);
      return;
    }
    
    const spinner = ora('Fetching pairs...').start();
    
    try {
      const response = await apiClient.getOrderBookPairs(options.telegramId);
      spinner.stop();
      
      const pairs = response.data || [];
      
      handleOutput(
        pairs,
        globalOpts.format,
        (data) => {
          if (Array.isArray(data)) {
            data.forEach((pair: any) => {
              console.log(`\nPair:`);
              printDetailTable(Object.entries(pair).map(([k, v]) => [k, String(v)]));
            });
          }
        }
      );
    } catch (error: any) {
      spinner.stop();
      handleError(error, globalOpts.format);
    }
  });

// Filled order
orderbookCommand
  .command('filled <id>')
  .description('Get filled order details')
  .action(async (id, options, command) => {
    const globalOpts = command.optsWithGlobals();
    const spinner = ora('Fetching filled order...').start();
    
    try {
      const response = await apiClient.get(`/order-books/filled/${id}`) as any;
      spinner.stop();
      
      const order = response.data || response;
      
      if (globalOpts.format === 'json') {
        handleOutput(order, globalOpts.format, () => {});
      } else {
        printDetailTable(Object.entries(order).map(([k, v]) => [k, String(v)]));
      }
    } catch (error: any) {
      spinner.stop();
      handleError(error, globalOpts.format);
    }
  });
