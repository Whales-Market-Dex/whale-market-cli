import { printJson, printError as printJsonError } from './json';
import { printPlain } from './plain';
import chalk from 'chalk';
import { OutputFormat } from '../types';

export function handleOutput(
  data: any,
  format: OutputFormat,
  tablePrinter: (data: any) => void
): void {
  if (format === 'json') {
    printJson(data);
  } else if (format === 'plain') {
    printPlain(data);
  } else {
    // Default: table format
    tablePrinter(data);
  }
}

export function handleError(error: Error, format: OutputFormat): void {
  if (format === 'json') {
    printJsonError(error.message);
  } else if (format === 'plain') {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  } else {
    console.error(chalk.red('Error:'), error.message);
    process.exit(1);
  }
}

export * from './table';
export * from './json';
export * from './plain';
