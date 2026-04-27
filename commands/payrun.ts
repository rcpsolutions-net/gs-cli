import { Command } from 'commander';
import chalk from 'chalk';
import apiClient from '../lib/api.ts';

function createPayrunCommands() {
  const department = new Command('payruns')
    .description('View departments in the Greenshades API (list, details)');

  department
    .command('list')  
    .description('Get all payruns for the workspace')  
    .action(async () => {
      try {        
        console.log(chalk.blue('--- Fetching all payruns...'));

        const response = await apiClient.get('/payroll/pay-runs');
        
        console.log(JSON.stringify(response.data, null, 2));
        console.log(chalk.green('✅ Successfully retrieved payruns.'));

      } catch (error: any) {
        console.error(chalk.red('Error fetching payruns:', error.message));
        
        process.exit(1);
      }
    });

  department
    .command('info <payrun-id>')
    .description('Get a single payruns earning codes by their Greenshades payrun ID')
    .action(async (payrunId) => {
      try {
        console.log(chalk.blue(`Fetching payrun with ID: ${payrunId}...`));
        
        const response = await apiClient.get(`/payroll/pay-runs/${payrunId}/earnings`);

        console.log(JSON.stringify(response.data, null, 2));

        console.log(chalk.green(`✅ Successfully retrieved payrun ${payrunId}.`));
      } catch (error: any) {
        console.error(chalk.red(`Error fetching payrun ${payrunId}:`, error.message));

        process.exit(1);
      }
    });

    return department;
}

export default createPayrunCommands;