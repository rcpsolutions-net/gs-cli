import { Command } from 'commander';
import chalk from 'chalk';
import apiClient from '../lib/api.ts';

function createCustomFieldCommands() {
  const customFields = new Command('custom')
    .description('View custom fields in the Greenshades API (list, details)');

  customFields
    .command('list')  
    .description('Get all custom fields for the workspace')  
    .action(async () => {
      try {        
        console.log(chalk.blue('--- Fetching all custom fields...'));

        const response = await apiClient.get('/employees/customfields');
        
        console.log(JSON.stringify(response.data, null, 2));
        console.log(chalk.green('✅ Successfully retrieved custom fields.'));

      } catch (error: any) {
        console.error(chalk.red('Error fetching custom fields:', error.message));
        
        process.exit(1);
      }
    });

  customFields
    .command('details <field-id>')
    .description('Get a single custom field by their Greenshades fieldId')
    .action(async (fieldId) => {
      try {
        console.log(chalk.blue(`Fetching custom field with ID: ${fieldId}...`));

        const response = await apiClient.get(`employees/customfields/${fieldId}`);

        console.log(JSON.stringify(response.data, null, 2));

        console.log(chalk.green(`✅ Successfully retrieved custom field ID ${fieldId}.`));
      } catch (error: any) {
        console.error(chalk.red(`Error fetching custom field ID ${fieldId}:`, error.message));

        process.exit(1);
      }
    });

    customFields
    .command('employee <employee-id>')
    .description('Get all custom fields for a specific employee')
    .action(async (employeeId) => {
        try {        
        console.log(chalk.blue(`--- Fetching all custom fields for employee ID ${employeeId}...`));

        const response = await apiClient.get(`/employees/${employeeId}/customfields`);
        
        console.log(JSON.stringify(response.data, null, 2));
        console.log(chalk.green(`✅ Successfully retrieved custom fields for employee ID ${employeeId}.`));

      } catch (error: any) {
        console.error(chalk.red(`Error fetching custom fields for employee ID ${employeeId}:`, error.message));
        
        process.exit(1);
      }
    });


    return customFields;
}

export default createCustomFieldCommands;