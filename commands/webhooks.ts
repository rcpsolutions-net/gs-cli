// file: src/commands/employees.ts

import { Command } from 'commander';
import chalk from 'chalk';
import apiClient from '../lib/api.ts';

function createWebhooksCommand() {
  const webhooks = new Command('webhooks')
    .description('Manage webhooks in the Greenshades API (list, details)');

  webhooks  
    .command('list')  
    .description('Get all webhooks for the workspace')  
    .action(async () => {
      try {        
        console.log(chalk.blue('--- Fetching all webhooks...'));

        const response = await apiClient.get('/webhooks');
        
        console.log(JSON.stringify(response.data, null, 2));
        console.log(chalk.green('✅ Successfully retrieved webhooks.'));

      } catch (error: any) {
        console.error(chalk.red('Error fetching webhooks:', error.message));
        
        process.exit(1);
      }
    });

  webhooks.command('details <webhook-id>')
    .description('Get a single webhook subscription by their Greenshades webhookId')
    .action(async (webhookId) => {
      try {
        console.log(chalk.blue(`Fetching webhook subscription details with subscription Id: ${webhookId}...`));

        const response = await apiClient.get(`/webhooks/subscriptions/${webhookId}`);

        console.log(JSON.stringify(response.data, null, 2));

        console.log(chalk.green(`✅ Successfully retrieved webhook subscription ${webhookId}.`));
      } catch (error: any) {
        console.error(chalk.red(`Error fetching webhook subscription ${webhookId}:`, error.message));

        process.exit(1);
      }
    });

    return webhooks;
}

export default createWebhooksCommand;