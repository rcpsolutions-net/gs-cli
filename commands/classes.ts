import { Command } from 'commander';
import chalk from 'chalk';
import apiClient from '../lib/api.ts';

function createClassCommands() {
  const classes = new Command('classes')
    .description('View employee classes in the Greenshades API (list, details)');

  classes
    .command('list')  
    .description('Get all employee classes for the workspace')  
    .action(async () => {
      try {        
        console.log(chalk.blue('--- Fetching all employee classes...'));

        const response = await apiClient.get('/employees/classes');
        
        console.log(JSON.stringify(response.data, null, 2));
        console.log(chalk.green('✅ Successfully retrieved employee classes.'));

      } catch (error: any) {
        console.error(chalk.red('Error fetching employee classes:', error.message));
        
        process.exit(1);
      }
    });

  classes
    .command('details <class-code>')
    .description('Get a single employee class by their Greenshades classCode')
    .action(async (classCode) => {
      try {
        console.log(chalk.blue(`Fetching employee class with code: ${classCode}...`));

        const response = await apiClient.get(`employees/classes/${classCode}`);

        console.log(JSON.stringify(response.data, null, 2));

        console.log(chalk.green(`✅ Successfully retrieved employee class code ${classCode}.`));
      } catch (error: any) {
        console.error(chalk.red(`Error fetching employee class code ${classCode}:`, error.message));

        process.exit(1);
      }
    });

    return classes;
}

export default createClassCommands;