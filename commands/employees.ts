// file: src/commands/employees.ts

import { Command } from 'commander';
import chalk from 'chalk';
import apiClient from '../lib/api.ts';

function createEmployeesCommand() {
  const employees = new Command('employees')
    .description('Manage employees in the Greenshades API');

  employees
    .command('list')
    .description('Get all employees for the workspace')
    .action(async () => {
      try {
        console.log(chalk.blue('Fetching all employees...'));

        const response = await apiClient.get('/employees');
        
        console.log(JSON.stringify(response.data, null, 2));
        console.log(chalk.green('✅ Successfully retrieved employees.'));

      } catch (error: any) {
        console.error(chalk.red('Error fetching employees:', error.message));
        process.exit(1);
      }
    });

  employees
    .command('get <employee-id>')
    .description('Get a single employee by their ID')
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

  return employees;
}

export default createEmployeesCommand;