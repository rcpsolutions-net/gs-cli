// file: src/commands/employees.ts

import { Command } from 'commander';
import chalk from 'chalk';
import apiClient from '../lib/api.ts';

function createPlacementsCommand() {
  const placements = new Command('placements')
    .description('View placements in the Greenshades API (list, details, employee)');

   placements.command('list')  
    .description('Get all placements for the current workspace')  
    .action(async () => {
      try {        
        console.log(chalk.blue('--- Fetching all placements...'));

        const response = await apiClient.get('/placements');
        
        console.log(JSON.stringify(response.data, null, 2));

        console.log(chalk.green('✅ Successfully retrieved placements.'));

      } catch (error: any) {
        console.error(chalk.red('Error fetching placements:', error.message));
        
        process.exit(1);
      }
    });

   placements.command('employee <employeeId>')  
    .description('Get all placements for a specific employee in the current workspace')  
    .action(async (employeeId) => {
      try {        
        console.log(chalk.blue(`--- Fetching all placements for employee ${employeeId}...`));

        const response = await apiClient.get(`/employees/${employeeId}/placements`);
        
        console.log(JSON.stringify(response.data, null, 2));
        
        console.log(chalk.green('✅ Successfully retrieved placements.'));

      } catch (error: any) {
        console.error(chalk.red(`Error fetching placements for employee ${employeeId}:`, error.message));
        
        process.exit(1);
      }
    });    

   placements.command('details <placement-id>')
    .description('Get specific placement details by their Greenshades placementId')
    .action(async (placementId) => {
      try {
        console.log(chalk.blue(`Fetching placement details with placement Id: ${placementId}...`));

        const response = await apiClient.get(`/placements/${placementId}`);

        console.log(JSON.stringify(response.data, null, 2));

        console.log(chalk.green(`✅ Successfully retrieved placement ${placementId}.`));
      } catch (error: any) {
        console.error(chalk.red(`Error fetching placement ${placementId}:`, error.message));

        process.exit(1);
      }
    });

    return placements;
}

export default createPlacementsCommand;