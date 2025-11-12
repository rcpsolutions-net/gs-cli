import { Command } from 'commander';
import chalk from 'chalk';
import pkg from './package.json' with { type: 'json' };

import createAuthCommand from './commands/auth.js';
import createEmployeesCommand from './commands/employees.ts';

const program = new Command();

program
  .name('gs')
  .version(pkg.version)
  .description(chalk.cyan.bold(pkg.description));

program.addCommand(createAuthCommand()); 
program.addCommand(createEmployeesCommand());

program
  .command('test')
  .description('A simple test command to check if the CLI is working.')
  .action(() => {
    console.log(chalk.green('✅ Bullhorn CLI is set up correctly!'));
  });

async function main() {
  try {
    await program.parseAsync(process.argv);
  } catch (error) {
    console.error(chalk.red('An unexpected error occurred:', error.message));

    process.exit(1);
  }
}

main();


