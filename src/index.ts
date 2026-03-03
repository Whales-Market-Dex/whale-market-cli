#!/usr/bin/env node
import { Command } from 'commander';
import { setupCommand } from './commands/setup';
import { walletCommand } from './commands/wallet';
import { tokensCommand } from './commands/tokens';
import { offersCommand } from './commands/offers';
import { ordersCommand } from './commands/orders';
import { portfolioCommand } from './commands/portfolio';
import { orderbookCommand } from './commands/orderbook';
import { referralCommand } from './commands/referral';
import { networksCommand } from './commands/networks';
import { statusCommand } from './commands/status';
import { shellCommand } from './commands/shell';
import { upgradeCommand } from './commands/upgrade';
import { helpCommand } from './commands/help';

const program = new Command();

program
  .name('whales')
  .description('CLI for Whales Market trading platform')
  .version('0.1.0')
  .addHelpText('after', '\nFor comprehensive documentation with all commands and options, run: whales help');

// Global options
program
  .option('-f, --format <format>', 'Output format (table|json|plain)', 'table')
  .option('-k, --private-key <key>', 'Private key (overrides config)')
  .option('--api-url <url>', 'API endpoint URL')
  .option('--chain-id <id>', 'Chain ID', '666666');

// Commands
program.addCommand(setupCommand);
program.addCommand(walletCommand);
program.addCommand(tokensCommand);
program.addCommand(offersCommand);
program.addCommand(ordersCommand);
program.addCommand(portfolioCommand);
program.addCommand(orderbookCommand);
program.addCommand(referralCommand);
program.addCommand(networksCommand);
program.addCommand(statusCommand);
program.addCommand(shellCommand);
program.addCommand(upgradeCommand);
program.addCommand(helpCommand);

// Enhance default help output
program.configureHelp({
  sortSubcommands: true,
  subcommandTerm: (cmd) => cmd.name(),
  commandUsage: (cmd) => {
    const parentCmd = cmd.parent;
    const cmdPath = parentCmd ? `${parentCmd.name()} ${cmd.name()}` : cmd.name();
    return `${cmdPath} [options]`;
  }
});

program.parse();
