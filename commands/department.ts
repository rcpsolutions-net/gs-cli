// file: src/commands/employees.ts

import { Command } from 'commander';
import chalk from 'chalk';
import apiClient from '../lib/api.ts';

function createDepartmentCommand() {
  const department = new Command('department')
    .description('View departments in the Greenshades API (list, details)');

  department
    .command('list')  
    .description('Get all departments for the workspace')  
    .action(async () => {
      try {        
        console.log(chalk.blue('--- Fetching all departments...'));

        const response = await apiClient.get('/departments');
        
        console.log(JSON.stringify(response.data, null, 2));
        console.log(chalk.green('✅ Successfully retrieved departments.'));

      } catch (error: any) {
        console.error(chalk.red('Error fetching departments:', error.message));
        
        process.exit(1);
      }
    });

  department
    .command('details <department-code>')
    .description('Get a single department by their Greenshades departmentCode')
    .action(async (departmentCode) => {
      try {
        console.log(chalk.blue(`Fetching department with code: ${departmentCode}...`));

        const response = await apiClient.get(`/departments/${departmentCode}`);

        console.log(JSON.stringify(response.data, null, 2));

        console.log(chalk.green(`✅ Successfully retrieved department ${departmentCode}.`));
      } catch (error: any) {
        console.error(chalk.red(`Error fetching department ${departmentCode}:`, error.message));

        process.exit(1);
      }
    });

    return department;
}

export default createDepartmentCommand;