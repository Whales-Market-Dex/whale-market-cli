import { Command } from 'commander';
import ora from 'ora';
import chalk from 'chalk';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export const upgradeCommand = new Command('upgrade')
  .description('Self-update from npm registry')
  .action(async () => {
    const spinner = ora('Checking for updates...').start();
    
    try {
      // Get current version
      const packageJson = require('../../package.json');
      const currentVersion = packageJson.version;
      
      spinner.text = 'Checking npm registry...';
      
      // Check latest version from npm
      try {
        const { stdout } = await execAsync('npm view whale-market-cli version');
        const latestVersion = stdout.trim();
        
        if (latestVersion === currentVersion) {
          spinner.succeed(`Already up to date (v${currentVersion})`);
          return;
        }
        
        spinner.text = `Updating from v${currentVersion} to v${latestVersion}...`;
        
        // Install latest version
        await execAsync('npm install -g whale-market-cli@latest');
        
        spinner.succeed(`Updated to v${latestVersion}`);
        console.log(chalk.green('\n✓ Upgrade complete!'));
      } catch (error: any) {
        spinner.fail('Failed to check/install updates');
        console.log(chalk.yellow('\nNote: Package may not be published yet.'));
        console.log(chalk.gray('For local development, use: npm run build\n'));
      }
    } catch (error: any) {
      spinner.stop();
      console.error(chalk.red('Error:'), error.message);
      process.exit(1);
    }
  });
