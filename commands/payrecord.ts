import { Command } from 'commander';
import chalk from 'chalk';
import apiClient from '../lib/api.ts';
import { format, subDays, addDays, endOfDay, startOfDay } from 'date-fns';
import config from '../lib/config.js';
import { writeFileSync } from 'node:fs';

function createPayrecordCommands() {
  const payrecord = new Command('paystubs')   
    .description('View paystub records in the Greenshades API (list, details, employee, payrun)');

  payrecord.command('list')
    .option('-o, --output <output>', 'Specify output format (json, table)', 'json')
    .option('-s, --start-date <startDate>', 'Specify start date for paystubs (YYYY-MM-DD)')
    .option('-e, --end-date <endDate>', 'Specify end date for paystubs (YYYY-MM-DD)')
    .description('Get all paystubs for the workspace within startDate and endDate, defaults to the last 1 day')
    .action(async (options) => {

      console.log(chalk.blue('Fetching paystubs with options:', Object.keys(options)));  

      try {
        const startDate = options?.startDate ? addDays(startOfDay(new Date(options.startDate)), 1) : startOfDay(subDays(new Date(), 1));
        const endDate = options?.endDate ? addDays(endOfDay(new Date(options.endDate)), 1) : endOfDay(new Date());
        const workspaceId = config.get('GsWorkspaceId');

        const pageSize = 100;

        let currentPage = 1;
        let lastPage = false;
        let allRecords: any[] = [];

        console.log(chalk.blue(`Fetching all paystubs for workspace ${workspaceId} from ${format(startDate, 'yyyy-MM-dd')} to ${format(endDate, 'yyyy-MM-dd')}...`));        

        const response = await apiClient.get('/pay-records',  {
          params: {
            pageSize,
            startDate: format(startDate, 'yyyy-MM-dd'),
            endDate: format(endDate, 'yyyy-MM-dd'),
            after: null, 
          }
          });

          let GsCursor = response.headers['x-gs-cursor'] || response.headers['X-GS-CURSOR']; 
          console.log('(first) X-GS-CURSOR from response header:', GsCursor || '(none)');

          allRecords = allRecords.concat(response.data);

          while (!lastPage) {
            console.log(chalk.blue(`Fetching page ${currentPage} of paystubs...`));

            const pageResponse = await apiClient.get('/pay-records',  {
              params: {
                pageSize,
                startDate: format(startDate, 'yyyy-MM-dd'),
                endDate: format(endDate, 'yyyy-MM-dd'),
                after: GsCursor,
              }
            });

            allRecords = allRecords.concat(pageResponse.data);

            GsCursor = pageResponse.headers['x-gs-cursor'] || pageResponse.headers['X-GS-CURSOR']; // Handle case-insensitive header            

            console.log('Received ' + pageResponse.data.length + ' records. X-GS-CURSOR from response header:', GsCursor ?? '(none)');

            if (!GsCursor) {
              lastPage = true;
            } else {
              currentPage++;
            }
        }
                
        if( options?.output === 'table' ) {
          const formattedData = allRecords.map((record: any) => ({   
            id: record.id,         
            EmployeeId: record.employeeID,
            RecordType: record.recordType,
            PayRunId: record.payRunId,
            CheckDate: record.checkDate,
            GrossPay: record.grossWages,
            NetPay: record.netWages,
            TotalDeductions: record.totalDeductions,
            TotalTax: record.totalTaxes,
            CheckNumber: record.checkNumber,
            TaxingEntityTotal: record.taxes.length,
          }));

          console.table(formattedData);
          
          return console.log(chalk.green('✅ Successfully retrieved paystubs in table format.'));
        }
        else {        
          writeFileSync(`paystubs-${format(startDate, 'yyyy-MM-dd')}-${format(endDate, 'yyyy-MM-dd')}.json`, JSON.stringify(allRecords, null, 2));

          console.log(chalk.green(`✅ Successfully wrote paystubs to file: paystubs-${format(startDate, 'yyyy-MM-dd')}-${format(endDate, 'yyyy-MM-dd')}.json`));             
        }        

      } catch (error: any) {
        console.error(chalk.red('Error fetching paystubs:', error.message));

        process.exit(1);
      }
    });

  payrecord.command('details <pay-record-id>')
    .description('Get a single paystub by its payRecordId')
    .option('-o, --output <output>', 'Specify output format (json, table)', 'table')
    .option('-s, --start-date <startDate>', 'Specify start date for paystubs (YYYY-MM-DD)')
    .option('-e, --end-date <endDate>', 'Specify end date for paystubs (YYYY-MM-DD)')
    .action(async (payRecordId, options) => {
      try {
        console.log(chalk.blue(`Fetching paystub with Id: ${payRecordId}...`));

        const response = await apiClient.get(`/payroll/pay-records/${payRecordId}`);

        if( options?.output === 'table' ) {
          if( typeof response.data === 'object' && response.data !== null ) {
            const formattedData = Object.entries(response.data).map(([key, value]) => ({
              Field: key,
              Value: typeof value === 'object' && value !== null ? JSON.stringify(value) : value,
            }));
            console.table(formattedData);
          }
        }
        else {
          console.log(chalk.blueBright('Outputting paystub in JSON format:\n'));
          console.log(JSON.stringify(response.data, null, 2));
        }

        console.log(chalk.green(`✅ Successfully retrieved paystub ${payRecordId}.`));
      } catch (error: any) {
        console.error(chalk.red(`Error fetching paystub ${payRecordId}:`, error.message));

        process.exit(1);
      }
    });

    payrecord.command('employee <employeeId>')
      .option('-o, --output <output>', 'Specify output format (json, table)', 'table')
      .option('-s, --start-date <startDate>', 'Specify start date for paystubs (YYYY-MM-DD)')
      .option('-e, --end-date <endDate>', 'Specify end date for paystubs (YYYY-MM-DD)')
      .description('Get all paystubs for a specific employee')
      .action(async (employeeId, options) => {
        try {
          const startDate = options?.startDate ? startOfDay(new Date(options.startDate)) : startOfDay(subDays(new Date(), 2));
          const endDate = options?.endDate ? endOfDay(new Date(options.endDate)) : endOfDay(new Date());
          const workspaceId = config.get('GsWorkspaceId');

          console.log(chalk.blue(`Fetching paystubs for employee with Id: ${employeeId} in workspace ${workspaceId} from ${format(startDate, 'yyyy-MM-dd')} to ${format(endDate, 'yyyy-MM-dd')}...`));

          const response = await apiClient.get(`/employees/${employeeId}/pay-records`, {
            params: {
              startDate: format(startDate, 'yyyy-MM-dd'),
              endDate: format(endDate, 'yyyy-MM-dd'),
            }
          });

          if( options?.output === 'table' ) {
            console.table(response.data);

            return console.log(chalk.green('✅ Successfully retrieved pay-records in table format.'));
          }
          else {
            console.log(chalk.blueBright('Outputting pay-records in JSON format:\n'));
            console.log(JSON.stringify(response.data, null, 2));
          }

          console.log(chalk.green(`✅ Successfully retrieved pay-records for employee ${employeeId}.`));
        } catch (error: any) {
          console.error(chalk.red(`Error fetching pay-records for employee ${employeeId}:`, error.message));

          process.exit(1);
        }
      });

      payrecord.command('payrun <payRunId>')
      .description('Get all pay-records for a specific pay-run id')
      .option('-o, --output <output>', 'Specify output format (json, table)', 'table')
      .option('-s, --start-date <startDate>', 'Specify start date for paystubs (YYYY-MM-DD)')
      .option('-e, --end-date <endDate>', 'Specify end date for paystubs (YYYY-MM-DD)')
      .action(async (payRunId, options) => {
        try {        
          const workspaceId = config.get('GsWorkspaceId');

          console.log(chalk.blue(`Fetching pay-records for pay-run with Id: ${payRunId} in workspace ${workspaceId}`));

          const response = await apiClient.get(`/payroll/pay-runs/${payRunId}/pay-records`);

          if( options?.output === 'table' ) {
            console.table(response.data);
            return console.log(chalk.green('✅ Successfully retrieved pay-records in table format.'));
          }
          else {
            console.log(chalk.blueBright('Outputting pay-records in JSON format:\n'));
            console.log(JSON.stringify(response.data, null, 2));
          }

          console.log(chalk.green(`✅ Successfully retrieved pay-records for pay-run ${payRunId}.`));
        } catch (error: any) {
          console.error(chalk.red(`Error fetching pay-records for pay-run ${payRunId}:`, error.message));

          process.exit(1);
        }
      });         

      return payrecord;
}

export default createPayrecordCommands;