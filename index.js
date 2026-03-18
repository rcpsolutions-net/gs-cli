import { Command } from 'commander';
import chalk from 'chalk';
import pkg from './package.json' with { type: 'json' };

import createAuthCommand from './commands/auth.js';
import createEmployeeCommands from './commands/employees.ts';
import createPayrecordCommands from './commands/payrecord.ts';
import createPayrollCommands from './commands/employee-settings.ts';
import createDepartmentCommands from './commands/department.ts';
import createWebhookCommands from './commands/webhooks.ts';
import createLocationCommands from './commands/locations.ts';
import createPositionCommands from './commands/positions.ts';
import createPlacementCommands from './commands/placements.ts';

const program = new Command();

program.name('greenshades')
  .version(pkg.version)
  .description(chalk.whiteBright(pkg.description + ' created by ') + chalk.cyanBright('Lawrence Ham\n\n') + 
             chalk.blueBright('Note: All commands require authentication. Please run "' + chalk.greenBright('greenshades auth login') + 
             chalk.blueBright('" to authenticate before using other commands.\n')));

program.addCommand(createAuthCommand()); 
program.addCommand(createEmployeeCommands());
program.addCommand(createPayrecordCommands());
program.addCommand(createPayrollCommands());
program.addCommand(createDepartmentCommands());
program.addCommand(createWebhookCommands());
program.addCommand(createLocationCommands());
program.addCommand(createPositionCommands());
program.addCommand(createPlacementCommands());

program.command('test')
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


