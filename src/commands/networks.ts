import { Command } from 'commander';
import ora from 'ora';
import { apiClient } from '../api';
import { handleOutput, handleError, printNetworksTable } from '../output';

export const networksCommand = new Command('networks')
  .description('List supported blockchain networks')
  .action(async (options, command) => {
    const globalOpts = command.optsWithGlobals();
    const spinner = ora('Fetching networks...').start();
    
    try {
      const response = await apiClient.getNetworks();
      spinner.stop();
      
      const networks = response.data || [];
      
      handleOutput(
        networks,
        globalOpts.format,
        printNetworksTable
      );
    } catch (error: any) {
      spinner.stop();
      handleError(error, globalOpts.format);
    }
  });
