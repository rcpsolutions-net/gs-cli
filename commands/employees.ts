// file: src/commands/employees.ts

import { Command } from 'commander';
import chalk from 'chalk';
import apiClient from '../lib/api.ts';

function createEmployeeCommands() {
  const employees = new Command('employee')
    .description('View employees in the Greenshades API (list, pull, dependents, contacts, customFields)');

  employees
    .command('list')
    .option('-n, --nativeId [nativeId]', 'filter list by nativeId', false)
    .description('Get all employees for the workspace')
    .action(async (options) => {
      try {        
        console.log(chalk.blue('--- Fetching all employees...'));

        if (options.nativeId) {
          console.log(chalk.yellow(`^ --- Filtering employees by nativeId: ${options.nativeId}`));
        }

        let args = options.nativeId ? { params: { nativeId: options.nativeId } } : undefined;

        const response = await apiClient.get('/employees', args);
        
        console.log(JSON.stringify(response.data, null, 2));
        console.log(chalk.green('✅ Successfully retrieved employees.'));

      } catch (error: any) {
        console.error(chalk.red('Error fetching employees:', error.message));
        
        process.exit(1);
      }
    });

  employees
    .command('pull <employee-id>')
    .description('Get a single employee by their Greenshades employeeID')
    .action(async (employeeId) => {
      try {
        console.log(chalk.blue(`Fetching employee with ID: ${employeeId}...`));

        const response = await apiClient.get(`/employees/${employeeId}`);
        console.log(JSON.stringify(response.data, null, 2));

        console.log(chalk.green(`✅ Successfully retrieved employee ${employeeId}.`));
      } catch (error: any) {
        console.error(chalk.red(`Error fetching employee ${employeeId}:`, error.message));

        process.exit(1);
      }
    });


    employees.command('dependents <employee-id>')
    .description('Get a single employee\'s dependents by their Greenshades employeeID')
    .action(async (employeeId) => {
      try {
        console.log(chalk.blue(`Fetching dependents for employee with ID: ${employeeId}...`));

        const response = await apiClient.get(`/employees/${employeeId}/dependents`);

        console.log(JSON.stringify(response.data, null, 2));

        console.log(chalk.green(`✅ Successfully retrieved dependents for employee ${employeeId}.`));
      } catch (error: any) {
        console.error(chalk.red(`Error fetching dependents for employee ${employeeId}:`, error.message));

        process.exit(1);
      }
    });

    employees.command('contacts <employee-id>')
    .description('Get a single employee\'s contacts by their Greenshades employeeID')
    .action(async (employeeId) => {
      try {
        console.log(chalk.blue(`Fetching contacts for employee with ID: ${employeeId}...`));

        const response = await apiClient.get(`/employees/${employeeId}/contacts`);

        console.log(JSON.stringify(response.data, null, 2));

        console.log(chalk.green(`✅ Successfully retrieved contacts for employee ${employeeId}.`));
      } catch (error: any) {
        console.error(chalk.red(`Error fetching contacts for employee ${employeeId}:`, error.message));

        process.exit(1);
      }
    });

    employees.command('customFields <employee-id>')
    .description('Get a single employee\'s custom fields by their Greenshades employeeID')
    .action(async (employeeId) => {
      try {
        console.log(chalk.blue(`Fetching custom fields for employee with ID: ${employeeId}...`));

        const response = await apiClient.get(`/employees/${employeeId}/customfields`);

        console.log(JSON.stringify(response.data, null, 2));

        console.log(chalk.green(`✅ Successfully retrieved custom fields for employee ${employeeId}.`));
      } catch (error: any) {
        console.error(chalk.red(`Error fetching custom fields for employee ${employeeId}:`, error.message));
        process.exit(1);
      }
    });


  

  return employees;
}

export default createEmployeeCommands;