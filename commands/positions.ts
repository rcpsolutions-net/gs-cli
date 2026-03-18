// file: src/commands/employees.ts

import { Command } from 'commander';
import chalk from 'chalk';
import apiClient from '../lib/api.ts';

function createPositionCommands() {
  const positions = new Command('positions')
    .description('View positions in the Greenshades API (list, details, worker-compensation-codes)');

  positions.command('list')  
    .description('Get all positions for the workspace')  
    .action(async () => {
      try {        
        console.log(chalk.blue('--- Fetching all positions...'));

        const response = await apiClient.get('/positions');
        
        console.log(JSON.stringify(response.data, null, 2));
        console.log(chalk.green('✅ Successfully retrieved positions.'));

      } catch (error: any) {
        console.error(chalk.red('Error fetching positions:', error.message));
        
        process.exit(1);
      }
    });

  positions.command('worker-compensation-codes')  
    .description('Get all worker compensation codes for the current workspace')  
    .action(async () => {
      try {        
        console.log(chalk.blue('--- Fetching all worker compensation codes...'));

        const response = await apiClient.get('/workerscompcodes');
        
        console.log(JSON.stringify(response.data, null, 2));
        console.log(chalk.green('✅ Successfully retrieved worker compensation codes.'));

      } catch (error: any) {
        console.error(chalk.red('Error fetching worker compensation codes:', error.message));
        
        process.exit(1);
      }
    });    

  positions.command('details <position-code>')
    .description('Get position details by their Greenshades positionCode')
    .action(async (positionCode) => {
      try {
        console.log(chalk.blue(`Fetching position details with position code: ${positionCode}...`));

        const response = await apiClient.get(`/positions/${positionCode}`);

        console.log(JSON.stringify(response.data, null, 2));

        console.log(chalk.green(`✅ Successfully retrieved position code ${positionCode}.`));
      } catch (error: any) {
        console.error(chalk.red(`Error fetching position code ${positionCode}:`, error.message));

        process.exit(1);
      }
    });

    return positions;
}

export default createPositionCommands;