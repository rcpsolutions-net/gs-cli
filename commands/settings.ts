import { Command } from 'commander';
import chalk from 'chalk';
import apiClient from '../lib/api.ts';
import config from '../lib/config.js';

function createEmployeeSettingCommands() {
  const payroll = new Command('details')   
    .description('View Employee specific data via the Greenshades API (pay-details, earn-codes, tax-details, pay-schedule, time-off, benefits, deductions)');

  payroll.command('pay-details <employeeId>')
    .description('Get details for a specific employee\'s payroll direct deposit setting.')
    .option('-o, --output <output>', 'Specify output format (json, table)', 'table')
    .action(async (employeeId, options) => {
      try {
        const workspaceId = config.get('GsWorkspaceId');
        
        console.log(chalk.cyanBright(`Fetching payroll details for employee with Id: ${employeeId} in workspace ${workspaceId}...`));        

        const response = await apiClient.get(`/employees/${employeeId}/directdeposit`);
        
        if( options?.output === 'table' ) {
          
          console.table(response.data);
          console.log(chalk.green('✅ Successfully retrieved payroll details in table format.'));

          return;
        }
        else {
          console.log(chalk.blueBright('Outputting payroll details in JSON format:\n'));
          console.log(JSON.stringify(response.data, null, 2));
        }        

        console.log(chalk.green('✅ Successfully retrieved payroll details.'));

      } catch (error: any) {
        console.error(chalk.red('Error fetching payroll details:', error.message));

        process.exit(1);
      }
    });

  payroll.command('earn-codes <employeeId>')
    .description('Get an employee\'s earn codes for payroll settings.')
    .option('-o, --output <output>', 'Specify output format (json, table)', 'table')
    .action(async (employeeId, options) => {
      try {
        console.log(chalk.blue(`Fetching earn codes for employee with Id: ${employeeId}...`));

        const response = await apiClient.get(`/employees/${employeeId}/payroll/earnings`);

        if( options?.output === 'table' ) {
          console.table(response.data);
          console.log(chalk.green('✅ Successfully retrieved earn codes in table format.'));

          return;
        }
        else {
          console.log(chalk.blueBright('Outputting earn codes in JSON format:\n'));
          console.log(JSON.stringify(response.data, null, 2));
        }

        console.log(chalk.green(`✅ Successfully retrieved earn codes for employee ${employeeId}.`));
      } catch (error: any) {
        console.error(chalk.red(`Error fetching earn codes for employee ${employeeId}:`, error.message));

        process.exit(1);
      }
    });


    payroll.command('tax-details <employeeId>')
      .description('Get all tax details for a specific employee')
      .option('-t, --taxid <taxid>', 'Specify a specific tax code to retrieve details for (optional)', 'SS')
      .option('-o, --output <output>', 'Specify output format (json, table)', 'table')
      .action(async (employeeId, options) => {
        try {         
          const workspaceId = config.get('GsWorkspaceId');

          console.log(chalk.blueBright(`Fetching tax details for employee with Id: ${employeeId} in workspace ${workspaceId}`));

          const response = await apiClient.get(`/employees/${employeeId}/payroll/taxes/${options.taxid}`);

          if( options?.output === 'table' ) {
            console.table(response.data);

            return console.log(chalk.green('✅ Successfully retrieved tax details in table format.'));
          }
          else {
            console.log(chalk.blueBright('Outputting tax details in JSON format:\n'));
            console.log(JSON.stringify(response.data, null, 2));
          }

          console.log(chalk.green(`✅ Successfully retrieved tax details for employee ${employeeId}.`));
        } catch (error: any) {
          console.error(chalk.red(`Error fetching tax details for employee ${employeeId}:`, error.message));

          process.exit(1);
        }
      });

      payroll.command('pay-schedule <employeeId>')
      .description('Get all pay-schedules for a specific employee')
      .option('-o, --output <output>', 'Specify output format (json, table)', 'table')
      .action(async (employeeId, options) => {
        try {        
          const workspaceId = config.get('GsWorkspaceId');

          console.log(chalk.blueBright(`Fetching pay-schedules for employee with Id: ${employeeId} in workspace ${workspaceId}`));

          const response = await apiClient.get(`/employees/${employeeId}/payroll/payschedule`);

          if( options?.output === 'table' ) {
            if( !Array.isArray(response.data) ) {
                 const formattedData = Object.entries(response.data).map(([key, value]) => ({
                          Field: key,
                          Value: typeof value === 'object' && value !== null ? JSON.stringify(value) : value,
                        }));
                 console.table(formattedData);
            } else {
                 console.table(response.data);
            }
            console.log(chalk.green('✅ Successfully retrieved pay-schedules in table format.'));

            return;
          }
          else {
            console.log(chalk.blueBright('Outputting pay-schedules in JSON format:\n'));
            console.log(JSON.stringify(response.data, null, 2));
          }

          console.log(chalk.green(`✅ Successfully retrieved pay-schedules for employee ${employeeId}.`));
        } catch (error: any) {
          console.error(chalk.red(`Error fetching pay-schedules for employee ${employeeId}:`, error.message));

          process.exit(1);
        }
      });

     payroll.command('time-off <employeeId>')
      .description('Get all time-off balance details for a specific employee')
      .option('-o, --output <output>', 'Specify output format (json, table)', 'table')
      .action(async (employeeId, options) => {
        try {         
          const workspaceId = config.get('GsWorkspaceId');

          console.log(chalk.redBright(`Fetching time-off balance details for employee with Id: ${employeeId} in workspace ${workspaceId}`));

          const response = await apiClient.get(`/employees/${employeeId}/payroll/time-off/balances`);

          if( options?.output === 'table' ) {
            console.table(response.data);
            console.log(chalk.green('✅ Successfully retrieved time-off balance details in table format.'));

            return;
          }
          else {
            console.log(chalk.blueBright('Outputting time-off balance details in JSON format:\n'));
            console.log(JSON.stringify(response.data, null, 2));
          }          

          console.log(chalk.green(`✅ Successfully retrieved time-off balance details for employee ${employeeId}.`));
        } catch (error: any) {
          console.error(chalk.red(`Error fetching time-off balance details for employee ${employeeId}:`, error.message));

          process.exit(1);
        }
      });

      payroll.command('benefits <employeeId>')
      .description('Get all benefit code details for a specific employee')
      .option('-o, --output <output>', 'Specify output format (json, table)', 'table')
      .action(async (employeeId, options) => {
        try {         
          const workspaceId = config.get('GsWorkspaceId');

          console.log(chalk.blueBright(`Fetching benefit code details for employee with Id: ${employeeId} in workspace ${workspaceId}`));

          const response = await apiClient.get(`/employees/${employeeId}/payroll/benefits`);

          if( options?.output === 'table' ) {
            console.table(response.data);
            console.log(chalk.green('✅ Successfully retrieved benefit code details in table format.'));

            return;
          }
          else {
            console.log(chalk.blueBright('Outputting benefit code details in JSON format:\n'));
            console.log(JSON.stringify(response.data, null, 2));
          }

          console.log(chalk.green(`✅ Successfully retrieved benefit code details for employee ${employeeId}.`));
        } catch (error: any) {
          console.error(chalk.red(`Error fetching benefit code details for employee ${employeeId}:`, error.message));

          process.exit(1);
        }
      });

      payroll.command('deductions <employeeId>')
      .description('Get all deduction code details for a specific employee')
      .option('-o, --output <output>', 'Specify output format (json, table)', 'table')
      .action(async (employeeId, options) => {
        try {         
          const workspaceId = config.get('GsWorkspaceId');

          console.log(chalk.blueBright(`Fetching deduction code details for employee with Id: ${employeeId} in workspace ${workspaceId}`));

          const response = await apiClient.get(`/employees/${employeeId}/payroll/deductions`);

          
          if( options?.output === 'table' ) {
            console.table(response.data);
            console.log(chalk.green('✅ Successfully retrieved deduction code details in table format.'));

            return;
          }
          else {
            console.log(chalk.blueBright('Outputting deduction code details in JSON format:\n'));
            console.log(JSON.stringify(response.data, null, 2));
          }

          console.log(chalk.green(`✅ Successfully retrieved deduction details for employee ${employeeId}.`));
        } catch (error: any) {
          console.error(chalk.red(`Error fetching deduction code details for employee ${employeeId}:`, error.message));

          process.exit(1);
        }
      });


      return payroll;
}

export default createEmployeeSettingCommands;