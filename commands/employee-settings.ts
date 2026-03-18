import { Command } from 'commander';
import chalk from 'chalk';
import apiClient from '../lib/api.ts';
import config from '../lib/config.js';

function createEmployeeSettingCommands() {
  const payroll = new Command('settings')
    .description('View Employee Payroll Settings in the Greenshades API (pay-details, earn-codes, tax-details, pay-schedule, time-off, benefits, deductions)');

  payroll.command('pay-details <employeeId>')
    .description('Get details for a specific employee\'s payroll direct deposit setting.')
    .action(async (employeeId) => {
      try {
        const workspaceId = config.get('GsWorkspaceId');
        
        console.log(chalk.cyanBright(`Fetching payroll details for employee with Id: ${employeeId} in workspace ${workspaceId}...`));        

        const response = await apiClient.get(`/employees/${employeeId}/directdeposit`);
        
        console.log(JSON.stringify(response.data, null, 2));

        console.log(chalk.green('✅ Successfully retrieved payroll details.'));

      } catch (error: any) {
        console.error(chalk.red('Error fetching payroll details:', error.message));

        process.exit(1);
      }
    });

  payroll.command('earn-codes <employeeId>')
    .description('Get an employee\'s earn codes for payroll settings.')
    .action(async (employeeId) => {
      try {
        console.log(chalk.blue(`Fetching earn codes for employee with Id: ${employeeId}...`));

        const response = await apiClient.get(`/employees/${employeeId}/payroll/earnings`);

        console.log(JSON.stringify(response.data, null, 2));

        console.log(chalk.green(`✅ Successfully retrieved earn codes for employee ${employeeId}.`));
      } catch (error: any) {
        console.error(chalk.red(`Error fetching earn codes for employee ${employeeId}:`, error.message));

        process.exit(1);
      }
    });


    payroll.command('tax-details <employeeId>')
      .description('Get all tax details for a specific employee')
      .action(async (employeeId) => {
        try {         
          const workspaceId = config.get('GsWorkspaceId');

          console.log(chalk.blueBright(`Fetching tax details for employee with Id: ${employeeId} in workspace ${workspaceId}`));

          const response = await apiClient.get(`/employees/${employeeId}/payroll/taxes`);

          console.log(JSON.stringify(response.data, null, 2));

          console.log(chalk.green(`✅ Successfully retrieved tax details for employee ${employeeId}.`));
        } catch (error: any) {
          console.error(chalk.red(`Error fetching tax details for employee ${employeeId}:`, error.message));

          process.exit(1);
        }
      });

      payroll.command('pay-schedule <employeeId>')
      .description('Get all pay-schedules for a specific employee')
      .action(async (employeeId) => {
        try {        
          const workspaceId = config.get('GsWorkspaceId');

          console.log(chalk.blueBright(`Fetching pay-schedules for employee with Id: ${employeeId} in workspace ${workspaceId}`));

          const response = await apiClient.get(`/employees/${employeeId}/payroll/payschedule`);

          console.log(JSON.stringify(response.data, null, 2));

          console.log(chalk.green(`✅ Successfully retrieved pay-schedules for employee ${employeeId}.`));
        } catch (error: any) {
          console.error(chalk.red(`Error fetching pay-schedules for employee ${employeeId}:`, error.message));

          process.exit(1);
        }
      });

     payroll.command('time-off <employeeId>')
      .description('Get all time-off balance details for a specific employee')
      .action(async (employeeId) => {
        try {         
          const workspaceId = config.get('GsWorkspaceId');

          console.log(chalk.redBright(`Fetching time-off balance details for employee with Id: ${employeeId} in workspace ${workspaceId}`));

          const response = await apiClient.get(`/employees/${employeeId}/payroll/time-off/balances`);

          console.log(JSON.stringify(response.data, null, 2));

          console.log(chalk.green(`✅ Successfully retrieved time-off balance details for employee ${employeeId}.`));
        } catch (error: any) {
          console.error(chalk.red(`Error fetching time-off balance details for employee ${employeeId}:`, error.message));

          process.exit(1);
        }
      });

      payroll.command('benefits <employeeId>')
      .description('Get all benefit code details for a specific employee')
      .action(async (employeeId) => {
        try {         
          const workspaceId = config.get('GsWorkspaceId');

          console.log(chalk.blueBright(`Fetching benefit code details for employee with Id: ${employeeId} in workspace ${workspaceId}`));

          const response = await apiClient.get(`/employees/${employeeId}/payroll/benefits`);

          console.log(JSON.stringify(response.data, null, 2));

          console.log(chalk.green(`✅ Successfully retrieved benefit code details for employee ${employeeId}.`));
        } catch (error: any) {
          console.error(chalk.red(`Error fetching benefit code details for employee ${employeeId}:`, error.message));

          process.exit(1);
        }
      });

      payroll.command('deductions <employeeId>')
      .description('Get all deduction code details for a specific employee')
      .action(async (employeeId) => {
        try {         
          const workspaceId = config.get('GsWorkspaceId');

          console.log(chalk.blueBright(`Fetching deduction code details for employee with Id: ${employeeId} in workspace ${workspaceId}`));

          const response = await apiClient.get(`/employees/${employeeId}/payroll/deductions`);

          console.log(JSON.stringify(response.data, null, 2));

          console.log(chalk.green(`✅ Successfully retrieved deduction details for employee ${employeeId}.`));
        } catch (error: any) {
          console.error(chalk.red(`Error fetching deduction code details for employee ${employeeId}:`, error.message));

          process.exit(1);
        }
      });


      return payroll;
}

export default createEmployeeSettingCommands;