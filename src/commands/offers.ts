import { Command } from 'commander';
import ora from 'ora';
import { apiClient } from '../api';
import { auth } from '../auth';
import { handleOutput, handleError, printOffersTable, printDetailTable } from '../output';

export const offersCommand = new Command('offers')
  .description('Offer management');

// List offers
offersCommand
  .command('list')
  .description('List all offers')
  .option('--type <type>', 'Filter by type (buy|sell)')
  .option('--token <id>', 'Filter by token ID')
  .option('--limit <n>', 'Limit results', '20')
  .option('--page <n>', 'Page number', '1')
  .action(async (options, command) => {
    const globalOpts = command.optsWithGlobals();
    const spinner = ora('Fetching offers...').start();
    
    try {
      const params: any = {
        take: parseInt(options.limit),
        page: parseInt(options.page)
      };
      
      if (options.type) params.type = options.type;
      if (options.token) params.token_id = options.token;
      
      const response = await apiClient.getOffers(params);
      spinner.stop();
      
      const offers = response.data || [];
      
      handleOutput(
        offers,
        globalOpts.format,
        printOffersTable
      );
    } catch (error: any) {
      spinner.stop();
      handleError(error, globalOpts.format);
    }
  });

// My offers
offersCommand
  .command('my')
  .description('List my offers')
  .option('--status <status>', 'Filter by status (open|filled|cancelled)')
  .action(async (options, command) => {
    const globalOpts = command.optsWithGlobals();
    const spinner = ora('Fetching your offers...').start();
    
    try {
      const address = auth.getAddress();
      const response = await apiClient.getOffersByAddress(address);
      spinner.stop();
      
      let offers = response.data || [];
      
      if (options.status) {
        offers = offers.filter((offer: any) => offer.status === options.status);
      }
      
      handleOutput(
        offers,
        globalOpts.format,
        printOffersTable
      );
    } catch (error: any) {
      spinner.stop();
      handleError(error, globalOpts.format);
    }
  });

// Get offer
offersCommand
  .command('get <offer-id>')
  .description('Get offer details')
  .action(async (offerId, options, command) => {
    const globalOpts = command.optsWithGlobals();
    const spinner = ora('Fetching offer...').start();
    
    try {
      const response = await apiClient.getOffer(offerId);
      spinner.stop();
      
      const offer = response.data || response;
      
      if (globalOpts.format === 'json') {
        handleOutput(offer, globalOpts.format, () => {});
      } else {
        printDetailTable([
          ['ID', offer.id || '-'],
          ['Type', offer.type || '-'],
          ['Token ID', offer.token_id || '-'],
          ['Amount', offer.amount || '-'],
          ['Price', offer.price || '-'],
          ['Status', offer.status || '-'],
          ['Address', offer.address || '-']
        ]);
      }
    } catch (error: any) {
      spinner.stop();
      handleError(error, globalOpts.format);
    }
  });

// React to offer (placeholder)
offersCommand
  .command('react <offer-id>')
  .description('React to an offer')
  .action(async (offerId, options, command) => {
    const globalOpts = command.optsWithGlobals();
    
    try {
      // This would call POST /transactions/reaction-offer/:offerId
      // For now, just show a message
      if (globalOpts.format === 'json') {
        console.log(JSON.stringify({
          message: 'Offer reaction not yet implemented',
          offerId
        }, null, 2));
      } else {
        console.log('Offer reaction not yet implemented');
      }
    } catch (error: any) {
      handleError(error, globalOpts.format);
    }
  });
