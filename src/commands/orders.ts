import { Command } from 'commander';
import ora from 'ora';
import { apiClient } from '../api';
import { auth } from '../auth';
import { handleOutput, handleError, printOrdersTable, printDetailTable } from '../output';

export const ordersCommand = new Command('orders')
  .description('Order operations');

// List orders
ordersCommand
  .command('list')
  .description('List all orders')
  .option('--token <id>', 'Filter by token ID')
  .option('--status <status>', 'Filter by status')
  .option('--limit <n>', 'Limit results', '20')
  .option('--page <n>', 'Page number', '1')
  .action(async (options, command) => {
    const globalOpts = command.optsWithGlobals();
    const spinner = ora('Fetching orders...').start();
    
    try {
      const params: any = {
        take: parseInt(options.limit),
        page: parseInt(options.page)
      };
      
      if (options.token) params.token_id = options.token;
      if (options.status) params.status = options.status;
      
      const response = await apiClient.getOrders(params);
      spinner.stop();
      
      const orders = response.data || [];
      
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

// My orders
ordersCommand
  .command('my')
  .description('List my orders')
  .option('--side <side>', 'Filter by side (buy|sell)')
  .action(async (options, command) => {
    const globalOpts = command.optsWithGlobals();
    const spinner = ora('Fetching your orders...').start();
    
    try {
      const address = auth.getAddress();
      const response = await apiClient.getOrdersByAddress(address);
      spinner.stop();
      
      let orders = response.data || [];
      
      if (options.side) {
        // Filter by side if needed
        orders = orders.filter((order: any) => {
          // This would depend on API structure
          return true;
        });
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

// Get order
ordersCommand
  .command('get <order-id>')
  .description('Get order details')
  .action(async (orderId, options, command) => {
    const globalOpts = command.optsWithGlobals();
    const spinner = ora('Fetching order...').start();
    
    try {
      const response = await apiClient.getOrder(orderId);
      spinner.stop();
      
      const order = response.data || response;
      
      if (globalOpts.format === 'json') {
        handleOutput(order, globalOpts.format, () => {});
      } else {
        printDetailTable([
          ['ID', order.id || '-'],
          ['Offer ID', order.offer_id || '-'],
          ['Buyer', order.buyer_address || '-'],
          ['Seller', order.seller_address || '-'],
          ['Amount', order.amount || '-'],
          ['Status', order.status || '-']
        ]);
      }
    } catch (error: any) {
      spinner.stop();
      handleError(error, globalOpts.format);
    }
  });

// Orders by offer
ordersCommand
  .command('by-offer <address>')
  .description('Get orders for my offers')
  .action(async (address, options, command) => {
    const globalOpts = command.optsWithGlobals();
    const spinner = ora('Fetching orders...').start();
    
    try {
      const response = await apiClient.getOrdersByOffer(address);
      spinner.stop();
      
      const orders = response.data || [];
      
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
