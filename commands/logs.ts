import { Command } from 'commander';
import chalk from 'chalk';
import apiClient from '../lib/api.ts';
import { format, subDays } from 'date-fns';

function createLogCommands() {
  const logs = new Command('logs')
    .description('View request logs in the Greenshades API (list, details)');

  logs
    .command('list')  
    .description('Get all request logs within the given date range for the current workspace, defaults to the last 24 hours')  
    .option('-s, --start-date <startDate>', 'Specify start date for request logs (YYYY-MM-DD)')
    .option('-e, --end-date <endDate>', 'Specify end date for request logs (YYYY-MM-DD)')
    .action(async (options) => {
      try {        
        const pageSize = 500;
        const startDate = options?.startDate ? format(subDays(new Date(options.startDate), 1), 'yyyy-MM-dd') : format(subDays(new Date(), 1), 'yyyy-MM-dd'); 
        const endDate = options?.endDate ? format(new Date(options.endDate), 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');

        console.log(chalk.blue(`--- Fetching all request logs ${startDate}-${endDate}...`));          

        const response = await apiClient.get('/logs/requests', { params: { startDate, endDate, pageSize } });        

        console.log(JSON.stringify(response.data, null, 2));

        console.log(chalk.green('✅ Successfully retrieved request logs.'));
      } catch (error: any) {
        console.error(chalk.red('Error fetching request logs:', error.message));
        
        process.exit(1);
      }
    });

  logs
    .command('details <request-id>')
    .description('Get a single request log by its ID')
    .action(async (requestId) => {
      try {
        console.log(chalk.blue(`Fetching request log with ID: ${requestId}...`));
        const response = await apiClient.get(`/logs/requests/${requestId}`);
        console.log(JSON.stringify(response.data, null, 2));

        console.log(chalk.green(`✅ Successfully retrieved request log with ID ${requestId}.`));
      } catch (error: any) {
        console.error(chalk.red(`Error fetching request log with ID ${requestId}:`, error.message));

        process.exit(1);
      }
    });

    return logs;
}

export default createLogCommands;