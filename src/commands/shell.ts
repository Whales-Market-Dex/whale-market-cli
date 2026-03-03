import { Command } from 'commander';
import * as readline from 'readline';
import chalk from 'chalk';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export const shellCommand = new Command('shell')
  .description('Interactive REPL mode')
  .action(async () => {
    console.log(chalk.cyan('Whales Market Interactive Shell'));
    console.log(chalk.gray('Type "exit" or press Ctrl+C to quit\n'));
    
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      prompt: chalk.green('whales> ')
    });
    
    rl.prompt();
    
    rl.on('line', async (line) => {
      const trimmed = line.trim();
      
      if (trimmed === 'exit' || trimmed === 'quit') {
        rl.close();
        return;
      }
      
      if (trimmed) {
        try {
          // Execute command using the compiled CLI
          const { stdout, stderr } = await execAsync(`node ${__dirname}/../../dist/index.js ${trimmed}`);
          if (stdout) console.log(stdout);
          if (stderr) console.error(chalk.red(stderr));
        } catch (error: any) {
          // Command errors are expected, just show output
          if (error.stdout) console.log(error.stdout);
          if (error.stderr) console.error(chalk.red(error.stderr));
        }
      }
      
      rl.prompt();
    });
    
    rl.on('close', () => {
      console.log(chalk.gray('\nGoodbye!'));
      process.exit(0);
    });
  });
