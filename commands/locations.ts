// file: src/commands/employees.ts

import { Command } from 'commander';
import chalk from 'chalk';
import apiClient from '../lib/api.ts';

function createLocationsCommand() {
  const locations = new Command('locations')
    .description('View client work locations in the Greenshades API (list, details)');

  locations  
    .command('list')  
    .description('Get all work locations for the workspace')  
    .action(async () => {
      try {        
        console.log(chalk.greenBright('--- Fetching all work locations...'));

        const response = await apiClient.get('/worklocations');
        
        console.log(JSON.stringify(response.data, null, 2));
        console.log(chalk.green('✅ Successfully retrieved work locations.'));

      } catch (error: any) {
        console.error(chalk.red('Error fetching work locations:', error.message));
        
        process.exit(1);
      }
    });

  locations.command('details <location-code>')
    .description('Get a single work location by their Greenshades locationCode')
    .action(async (locationCode) => {
      try {
        console.log(chalk.blueBright(`Fetching work location details with location Code: ${locationCode}...`));

        const response = await apiClient.get(`/worklocations/${locationCode}`);

        console.log(JSON.stringify(response.data, null, 2));

        console.log(chalk.blue(`✅ Successfully retrieved work location ${locationCode}.`));
      } catch (error: any) {
        console.error(chalk.red(`Error fetching work location ${locationCode}:`, error.message));

        process.exit(1);
      }
    });

    return locations;
}

export default createLocationsCommand;