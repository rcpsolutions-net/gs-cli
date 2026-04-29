import { Command } from 'commander';
import chalk from 'chalk';
import apiClient from '../lib/api.ts';
import { subDays, format } from 'date-fns';
import config from '../lib/config.js';
import { writeFileSync } from 'node:fs';

function createReportCommands() {
  const report = new Command('report')   
    .description('View report results in the Greenshades API');

  report.command('timeoff-balances')
    .option('-o, --output <output>', 'Specify output format (json, table)', 'json')
    .description('Get all time-off balances for the workspace')
    .action(async (options) => {

      console.log(chalk.blue('Fetching time-off balances with options:', Object.keys(options)));  

      try {   
        const workspaceId = config.get('GsWorkspaceId');
        const pageSize = 2000;

        let currentPage = 1;
        let lastPage = false;
        let allRecords: any[] = [];
        let totalAnomalyCount = 0;
        let startDate = subDays(new Date(), 1);
        let endDate = new Date();


        console.log(chalk.blue(`Fetching all time-off balances  for workspace ${workspaceId}`));        

        const response = await apiClient.get('/payroll/time-off/balances',  {
          params: { pageSize }
        }).catch((error: any) => {
            console.error(chalk.red('Error fetching time-off balances:', error.message));

            process.exit(1);
           });

          let GsCursor = response.headers['x-gs-cursor'] || response.headers['X-GS-CURSOR'];              

          allRecords = [...response.data]; 

          console.log('(first) Received ' + response.data.length + ' records. ' + allRecords.length + ' records total. ' + 'X-GS-CURSOR response:', GsCursor ?? '(none)');

          if( GsCursor ) currentPage++;
          else lastPage = true;


          while (!lastPage) {
            console.log(chalk.blue(`Fetching page ${currentPage} of time-off balances...`));

            const pageResponse = await apiClient.get('/payroll/time-off/balances',  {
              params: {
                pageSize,
                after: GsCursor,
              }
            }).catch((error: any) => {
              console.error(chalk.red(`Error fetching page ${currentPage} of time-off balances:`, error.message));
              process.exit(1);
             });

             let allRecordsCountBefore = allRecords.length;

            let newRecords = pageResponse.data.filter((record: any) => {              
              return !allRecords.some((existingRecord) => existingRecord.employeeId === record.employeeId && existingRecord.codeId === record.codeId);              
            });

            allRecords = allRecords.concat(newRecords);

            GsCursor = pageResponse.headers['x-gs-cursor'] || pageResponse.headers['X-GS-CURSOR'];           

            console.log(currentPage + ': Received ' + pageResponse.data.length + ' records. ' + allRecords.length + ' records total. ' + 'X-GS-CURSOR response:', GsCursor ?? '(none)');

            let allRecordsCountAfter = allRecords.length;       

            writeFileSync(`timeoff-balances-${format(startDate, 'yyyy-MM-dd')}.json`, JSON.stringify(allRecords, null, 2));

            if( allRecordsCountBefore === allRecordsCountAfter && GsCursor) {
              totalAnomalyCount++;

              console.log(chalk.yellow(`⚠️  Warning: No new records found on page ${currentPage}, possible duplicate page.`));

              if( totalAnomalyCount > 2 ) break;
            }
        

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
          writeFileSync(`timeoff-balances-${format(startDate, 'yyyy-MM-dd')}.json`, JSON.stringify(allRecords, null, 2));

          console.log(chalk.green(`✅ Successfully wrote paystubs to file: timeoff-balances-${format(startDate, 'yyyy-MM-dd')}.json`));             
        }        

      } catch (error: any) {
        console.error(chalk.red('Error fetching paystubs:', error.message));

        process.exit(1);
      }
    });


     report.command('benefits-deductions')
       .option('-o, --output <output>', 'Specify output format (json, table)', 'json')
       .option('-s, --start-date <startDate>', 'Start date for the report (YYYY-MM-DD)')
       .option('-e, --end-date <endDate>', 'End date for the report (YYYY-MM-DD)')
       .description('Get all benefits deductions for the workspace')
       .action(async (options) => {

         console.log(chalk.blue('Fetching benefits deductions with options:', Object.keys(options)));  

      try {   
        const workspaceId = config.get('GsWorkspaceId');
        const pageSize = 2000;

        let currentPage = 1;
        let lastPage = false;
        let allRecords: any[] = [];
        let totalAnomalyCount = 0;
        let startDate = subDays(options.startDate ? new Date(options.startDate) : new Date(), 1);
        let endDate = options.endDate ? new Date(options.endDate) : new Date();


        console.log(chalk.blue(`Fetching all benefits deductions for workspace ${workspaceId}`));        

        const response = await apiClient.get('/payroll/reports/benefits-deductions',  {
          params: { 
            pageSize,
            startDate: format(startDate, 'yyyy-MM-dd'),
            endDate: format(endDate, 'yyyy-MM-dd'),
            after: null,
          }
        }).catch((error: any) => {
            console.error(chalk.red('Error fetching benefits deductions:', error.message));

            process.exit(1);
        });

          let GsCursor = response.headers['x-gs-cursor'] || response.headers['X-GS-CURSOR'];              

          allRecords = [...response.data]; 

          console.log('(first) Received ' + response.data.length + ' records. ' + allRecords.length + ' records total. ' + 'X-GS-CURSOR response:', GsCursor ?? '(none)');

          if( GsCursor ) currentPage++;
          else lastPage = true;


          while (!lastPage) {
            console.log(chalk.blue(`Fetching page ${currentPage} of benefits deductions...`));

            const pageResponse = await apiClient.get('/payroll/reports/benefits-deductions',  {
              params: {
                pageSize,
                startDate: format(startDate, 'yyyy-MM-dd'),
                endDate: format(endDate, 'yyyy-MM-dd'),
                after: GsCursor,
              }
            }).catch((error: any) => {
              console.error(chalk.red(`Error fetching page ${currentPage} of benefits deductions:`, error.message));
              process.exit(1);
             });

             let allRecordsCountBefore = allRecords.length;

            let newRecords = pageResponse.data.filter((record: any) => {              
              return true;
              //return !allRecords.some((existingRecord) => existingRecord.employeeId === record.employeeId && existingRecord.codeId === record.codeId);              
            });

            allRecords = allRecords.concat(newRecords);

            GsCursor = pageResponse.headers['x-gs-cursor'] || pageResponse.headers['X-GS-CURSOR'];           

            console.log(currentPage + ': Received ' + pageResponse.data.length + ' records. ' + allRecords.length + ' records total. ' + 'X-GS-CURSOR response:', GsCursor ?? '(none)');

            let allRecordsCountAfter = allRecords.length;       

            writeFileSync(`benefits-deductions-${format(startDate, 'yyyy-MM-dd')}.json`, JSON.stringify(allRecords, null, 2));

            if( allRecordsCountBefore === allRecordsCountAfter && GsCursor) {
              totalAnomalyCount++;

              console.log(chalk.yellow(`⚠️  Warning: No new records found on page ${currentPage}, possible duplicate page.`));

              if( totalAnomalyCount > 2 ) break;
            }
        

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
          writeFileSync(`benefits-deductions-${format(startDate, 'yyyy-MM-dd')}.json`, JSON.stringify(allRecords, null, 2));

          console.log(chalk.green(`✅ Successfully wrote paystubs to file: benefits-deductions-${format(startDate, 'yyyy-MM-dd')}.json`));             
        }        

      } catch (error: any) {
        console.error(chalk.red('Error fetching paystubs:', error.message));

        process.exit(1);
      }
    });


    
     report.command('costs')
       .option('-o, --output <output>', 'Specify output format (json, table)', 'json')
       .option('-s, --start-date <startDate>', 'Start date for the report (YYYY-MM-DD)')
       .option('-e, --end-date <endDate>', 'End date for the report (YYYY-MM-DD)')
       .description('Get cost report for the workspace within a specified date range')
       .action(async (options) => {

         console.log(chalk.blue('Fetching cost report with options:', Object.keys(options)));  

      try {   
        const workspaceId = config.get('GsWorkspaceId');
    
        let allRecords: any[] = [];
        let startDate = subDays(options.startDate ? new Date(options.startDate) : new Date(), 5);
        let endDate = options.endDate ? new Date(options.endDate) : new Date();


        console.log(chalk.blue(`Fetching all cost report data for workspace ${workspaceId}`));        

        const response = await apiClient.get('/payroll/reports/cost',  {
          params: {      
            startDate: format(startDate, 'yyyy-MM-dd'),
            endDate: format(endDate, 'yyyy-MM-dd'),            
          }
        }).catch((error: any) => {
            console.error(chalk.red('Error fetching cost report data:', error.message));

            process.exit(1);
        });


        console.log(response.data)     

          allRecords = response.data 

          console.log('(first) Received ' + response.data.length + ' records. ' + allRecords.length + ' records total. ');
                
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
          
          return console.log(chalk.green('✅ Successfully retrieved cost report data in table format.'));
        }
        else {        
          writeFileSync(`cost-report-${format(startDate, 'yyyy-MM-dd')}.json`, JSON.stringify(allRecords, null, 2));

          console.log(chalk.green(`✅ Successfully wrote cost report data to file: cost-report-${format(startDate, 'yyyy-MM-dd')}.json`));             
        }        

      } catch (error: any) {
        console.error(chalk.red('Error fetching cost report data:', error.message));

        process.exit(1);
      }
    });
    
    return report;
}

export default createReportCommands;