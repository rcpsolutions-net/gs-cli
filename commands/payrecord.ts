import { Command } from 'commander';
import chalk from 'chalk';
import apiClient from '../lib/api.ts';
import { format, subDays, endOfDay, startOfDay } from 'date-fns';
import config from '../lib/config.js';

function createPayrecordCommands() {
  const payrecord = new Command('paystubs')
    .description('View paystub records in the Greenshades API (list, details, employee, payrun)');

  payrecord.command('list')
    .description('Get all paystubs for the workspace within the last 2 days')
    .action(async () => {
      try {
        const startDate = startOfDay(subDays(new Date(), 2));
        const endDate = endOfDay(new Date());
        const workspaceId = config.get('GsWorkspaceId');

        console.log(chalk.blue(`Fetching all paystubs for workspace ${workspaceId} from ${format(startDate, 'yyyy-MM-dd')} to ${format(endDate, 'yyyy-MM-dd')}...`));        

        const response = await apiClient.get('/pay-records',  {
          params: {
            startDate: format(startDate, 'yyyy-MM-dd'),
            endDate: format(endDate, 'yyyy-MM-dd'),           
          }
          });
        
        console.log(JSON.stringify(response.data, null, 2));

        console.log(chalk.green('✅ Successfully retrieved paystubs.'));

      } catch (error: any) {
        console.error(chalk.red('Error fetching paystubs:', error.message));

        process.exit(1);
      }
    });

  payrecord.command('details <pay-record-id>')
    .description('Get a single paystub by its payRecordId')
    .action(async (payRecordId) => {
      try {
        console.log(chalk.blue(`Fetching paystub with Id: ${payRecordId}...`));

        const response = await apiClient.get(`/payroll/pay-records/${payRecordId}`);

        console.log(JSON.stringify(response.data, null, 2));

        console.log(chalk.green(`✅ Successfully retrieved paystub ${payRecordId}.`));
      } catch (error: any) {
        console.error(chalk.red(`Error fetching paystub ${payRecordId}:`, error.message));

        process.exit(1);
      }
    });


    payrecord.command('employee <employeeId>')
      .description('Get all paystubs for a specific employee')
      .action(async (employeeId) => {
        try {
          const startDate = startOfDay(subDays(new Date(), 2));
          const endDate = endOfDay(new Date());
          const workspaceId = config.get('GsWorkspaceId');

          console.log(chalk.blue(`Fetching paystubs for employee with Id: ${employeeId} in workspace ${workspaceId} from ${format(startDate, 'yyyy-MM-dd')} to ${format(endDate, 'yyyy-MM-dd')}...`));

          const response = await apiClient.get(`/employees/${employeeId}/pay-records`, {
            params: {
              startDate: format(startDate, 'yyyy-MM-dd'),
              endDate: format(endDate, 'yyyy-MM-dd'),
            }
          });

          console.log(JSON.stringify(response.data, null, 2));

          console.log(chalk.green(`✅ Successfully retrieved pay-records for employee ${employeeId}.`));
        } catch (error: any) {
          console.error(chalk.red(`Error fetching pay-records for employee ${employeeId}:`, error.message));

          process.exit(1);
        }
      });

      payrecord.command('payrun <payRunId>')
      .description('Get all pay-records for a specific pay-run id')
      .action(async (payRunId) => {
        try {        
          const workspaceId = config.get('GsWorkspaceId');

          console.log(chalk.blue(`Fetching pay-records for pay-run with Id: ${payRunId} in workspace ${workspaceId}`));

          const response = await apiClient.get(`/payroll/pay-runs/${payRunId}/pay-records`);

          console.log(JSON.stringify(response.data, null, 2));

          console.log(chalk.green(`✅ Successfully retrieved pay-records for pay-run ${payRunId}.`));
        } catch (error: any) {
          console.error(chalk.red(`Error fetching pay-records for pay-run ${payRunId}:`, error.message));

          process.exit(1);
        }
      });

      return payrecord;
}

export default createPayrecordCommands;