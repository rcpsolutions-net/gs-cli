import { Command } from 'commander';
import chalk from 'chalk';
import pkg from './package.json' with { type: 'json' };

import createAuthCommand from './commands/auth.js';
import createEmployeesCommand from './commands/employees.ts';
import createPayrecordCommand from './commands/payrecord.ts';
import createPayrollCommand from './commands/employee-settings.ts';
import createDepartmentCommand from './commands/department.ts';
import createWebhooksCommand from './commands/webhooks.ts';
import createLocationsCommand from './commands/locations.ts';
import createPositionsCommand from './commands/positions.ts';

const program = new Command();

program
  .name('greenshades')
  .version(pkg.version)
  .description(chalk.whiteBright(pkg.description + ' created by ') + chalk.cyanBright('Lawrence Ham\n\n') + 
             chalk.blueBright('Note: All commands require authentication. Please run "' + chalk.greenBright('greenshades auth login') + 
             chalk.blueBright('" to authenticate before using other commands.\n')));

program.addCommand(createAuthCommand()); 
program.addCommand(createEmployeesCommand());
program.addCommand(createPayrecordCommand());
program.addCommand(createPayrollCommand());
program.addCommand(createDepartmentCommand());
program.addCommand(createWebhooksCommand());
program.addCommand(createLocationsCommand());
program.addCommand(createPositionsCommand());

program
  .command('test')
  .description('Use this command to verify that the CLI is set up correctly and can execute commands without errors.\n')
  .action(() => {
    console.log(chalk.green('✅ GreenShades CLI is set up correctly!'));
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


