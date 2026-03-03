import { Command } from 'commander';
import ora from 'ora';
import { apiClient } from '../api';
import { auth } from '../auth';
import { handleOutput, handleError, printDetailTable, printOrdersTable } from '../output';

export const portfolioCommand = new Command('portfolio')
  .description('Portfolio & positions');

// Show portfolio
portfolioCommand
  .command('show')
  .description('Show portfolio summary')
  .option('--address <addr>', 'Wallet address (defaults to configured wallet)')
  .action(async (options, command) => {
    const globalOpts = command.optsWithGlobals();
    const spinner = ora('Fetching portfolio...').start();
    
    try {
      const address = options.address || auth.getAddress();
      
      // Get offers and orders for this address
      const [offersResponse, ordersResponse] = await Promise.all([
        apiClient.getOffersByAddress(address).catch(() => ({ data: [] })),
        apiClient.getOrdersByAddress(address).catch(() => ({ data: [] }))
      ]);
      
      const offers = offersResponse.data || [];
      const orders = ordersResponse.data || [];
      
      spinner.stop();
      
      if (globalOpts.format === 'json') {
        handleOutput({
          address,
          offers: offers.length,
          orders: orders.length,
          offersList: offers,
          ordersList: orders
        }, globalOpts.format, () => {});
      } else {
        console.log(`\nPortfolio for ${address}\n`);
        printDetailTable([
          ['Total Offers', String(offers.length)],
          ['Total Orders', String(orders.length)],
          ['Open Offers', String(offers.filter((o: any) => o.status === 'open').length)],
          ['Filled Orders', String(orders.filter((o: any) => o.status === 'filled').length)]
        ]);
      }
    } catch (error: any) {
      spinner.stop();
      handleError(error, globalOpts.format);
    }
  });

// Positions
portfolioCommand
  .command('positions')
  .description('List positions')
  .option('--type <type>', 'Filter by type (open|filled)')
  .action(async (options, command) => {
    const globalOpts = command.optsWithGlobals();
    const spinner = ora('Fetching positions...').start();
    
    try {
      const address = auth.getAddress();
      const response = await apiClient.getOrdersByAddress(address);
      spinner.stop();
      
      let orders = response.data || [];
      
      if (options.type) {
        orders = orders.filter((order: any) => order.status === options.type);
      }
      
      handleOutput(
        orders,
        globalOpts.format,
        printOrdersTable
      );
    } catch (error: any) {
      spinner.stop();
      handleError(error, globalOpts.format);
    }
  });

// Balance (placeholder - would need balance endpoint)
portfolioCommand
  .command('balance')
  .description('Show token balances')
  .option('--token <symbol>', 'Filter by token symbol')
  .action(async (options, command) => {
    const globalOpts = command.optsWithGlobals();
    
    try {
      if (globalOpts.format === 'json') {
        console.log(JSON.stringify({
          message: 'Balance feature not yet implemented',
          note: 'This would require blockchain RPC calls'
        }, null, 2));
      } else {
        console.log('Balance feature not yet implemented');
        console.log('This would require blockchain RPC calls to check token balances');
      }
    } catch (error: any) {
      handleError(error, globalOpts.format);
    }
  });
