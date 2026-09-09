import { Command } from 'commander';
import chalk from 'chalk';
import inquirer from 'inquirer';
import { readFileSync, existsSync } from 'node:fs';
import apiClient from '../lib/api.ts';

export interface DirectDepositEntry {
  ordinal?: number;
  routingNumber: string;
  accountNumber: string;
  amount?: number;
  percent?: number;
  accountType: 'Checking' | 'Savings';
  isRemainder: boolean;
  isPrenote?: boolean;
  paycardType?: 'rapid!' | null;
}

function formatErrorMessage(error: any): string {
  if (error.response?.data) {
    if (typeof error.response.data === 'string') {
      return error.response.data;
    }
    return JSON.stringify(error.response.data, null, 2);
  }
  return error.message || 'Unknown error';
}

function validateRoutingNumber(routing: string): boolean {
  return /^\d{9}$/.test(routing.trim());
}

function validateEntries(entries: DirectDepositEntry[]): void {
  if (!Array.isArray(entries)) {
    throw new Error('Direct deposit payload must be an array of entries.');
  }

  let remainderCount = 0;

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const indexStr = `Entry #${i + 1}`;

    if (!entry.routingNumber || !validateRoutingNumber(String(entry.routingNumber))) {
      throw new Error(`${indexStr}: Routing number must be exactly 9 digits (got "${entry.routingNumber}").`);
    }

    if (!entry.accountNumber || String(entry.accountNumber).trim().length === 0) {
      throw new Error(`${indexStr}: Account number is required.`);
    }

    if (String(entry.accountNumber).length > 25) {
      throw new Error(`${indexStr}: Account number cannot exceed 25 characters.`);
    }

    const type = String(entry.accountType).toLowerCase();
    if (type !== 'checking' && type !== 'savings') {
      throw new Error(`${indexStr}: Account type must be either 'Checking' or 'Savings' (got "${entry.accountType}").`);
    }

    if (entry.isRemainder) {
      remainderCount++;
    }

    // Default ordinal if missing
    if (entry.ordinal === undefined || entry.ordinal === null) {
      entry.ordinal = i + 1;
    }
  }

  if (remainderCount > 1) {
    throw new Error('Only one entry may be designated as the remainder entry.');
  }
}

export default function createDirectDepositCommands(): Command {
  const dd = new Command('direct-deposit')
    .alias('dd')
    .description("Manage employee direct deposit settings via the Greenshades API (get, update, delete)");

  // --- GET ---
  dd.command('get <employeeId>')
    .alias('pull')
    .description("Get an employee's direct deposit settings")
    .option('-o, --output <output>', 'Specify output format (table, json)', 'table')
    .action(async (employeeId: string, options: { output: string }) => {
      try {
        console.log(chalk.blue(`Fetching direct deposit settings for employee ${chalk.cyan(employeeId)}...`));

        const response = await apiClient.get(`/employees/${encodeURIComponent(employeeId)}/directdeposit`);
        const data = response.data;

        if (!data || (Array.isArray(data) && data.length === 0)) {
          console.log(chalk.yellow(`No direct deposit accounts configured for employee ${employeeId}.`));
          return;
        }

        if (options.output === 'json') {
          console.log(JSON.stringify(data, null, 2));
        } else {
          console.table(data);
        }

        console.log(chalk.green(`✅ Successfully retrieved direct deposit settings for employee ${employeeId}.`));
      } catch (error: any) {
        console.error(chalk.red(`Error fetching direct deposit settings for employee ${employeeId}:`, formatErrorMessage(error)));
        process.exit(1);
      }
    });

  // --- UPDATE (PUT) ---
  dd.command('update <employeeId>')
    .alias('put')
    .alias('set')
    .description("Update an employee's direct deposit settings (overwrites existing; use --clear or empty list to clear)")
    .option('-f, --file <filePath>', 'Path to JSON file containing direct deposit entries array')
    .option('-d, --data <jsonData>', 'Raw JSON string of direct deposit entries array')
    .option('--clear', 'Clear all direct deposit accounts (sends an empty list)')
    .option('-r, --routing <routingNumber>', 'Routing number (9 digits)')
    .option('-a, --account <accountNumber>', 'Account number (up to 25 chars)')
    .option('-t, --type <accountType>', 'Account type: Checking or Savings', 'Checking')
    .option('--amount <amount>', 'Fixed dollar amount for deposit', parseFloat)
    .option('-p, --percent <percent>', 'Percentage of pay for deposit', parseFloat)
    .option('--remainder', 'Designate this account for remainder of pay', false)
    .option('--prenote', 'Mark account as prenote', false)
    .option('--paycard-type <type>', 'Paycard type (e.g. rapid!)')
    .action(async (employeeId: string, options: any) => {
      try {
        let entries: DirectDepositEntry[] = [];

        if (options.clear) {
          entries = [];
        } else if (options.file) {
          if (!existsSync(options.file)) {
            console.error(chalk.red(`File not found: ${options.file}`));
            process.exit(1);
          }
          const raw = readFileSync(options.file, 'utf-8');
          entries = JSON.parse(raw);
        } else if (options.data) {
          entries = JSON.parse(options.data);
        } else if (options.routing || options.account) {
          if (!options.routing || !options.account) {
            console.error(chalk.red('Both --routing and --account are required when configuring via flags.'));
            process.exit(1);
          }

          if (options.type && !['checking', 'savings'].includes(options.type.toLowerCase())) {
            console.error(chalk.red(`Account type must be 'Checking' or 'Savings' (got "${options.type}").`));
            process.exit(1);
          }

          const normalizedType = options.type?.toLowerCase() === 'savings' ? 'Savings' : 'Checking';
          const singleEntry: DirectDepositEntry = {
            ordinal: 1,
            routingNumber: String(options.routing).trim(),
            accountNumber: String(options.account).trim(),
            accountType: normalizedType,
            isRemainder: !!options.remainder,
            isPrenote: !!options.prenote,
            paycardType: options.paycardType || null,
          };

          if (options.amount !== undefined && !isNaN(options.amount)) {
            singleEntry.amount = options.amount;
          }
          if (options.percent !== undefined && !isNaN(options.percent)) {
            singleEntry.percent = options.percent;
          }

          entries = [singleEntry];
        } else {
          // Interactive prompt mode
          console.log(chalk.blue(`Direct deposit interactive setup for employee ${chalk.cyan(employeeId)}:`));

          const { action } = await inquirer.prompt([
            {
              type: 'list',
              name: 'action',
              message: 'What would you like to do?',
              choices: [
                { name: 'Add/configure a single direct deposit account', value: 'add' },
                { name: 'Clear all direct deposit accounts', value: 'clear' },
                { name: 'Cancel', value: 'cancel' }
              ]
            }
          ]);

          if (action === 'cancel') {
            console.log(chalk.yellow('Operation cancelled.'));
            return;
          }

          if (action === 'clear') {
            entries = [];
          } else {
            const answers = await inquirer.prompt([
              {
                type: 'input',
                name: 'routingNumber',
                message: 'Enter 9-digit Routing Number:',
                validate: (input: string) => validateRoutingNumber(input) ? true : 'Routing number must be exactly 9 digits'
              },
              {
                type: 'input',
                name: 'accountNumber',
                message: 'Enter Account Number (max 25 characters):',
                validate: (input: string) => input.trim().length > 0 && input.trim().length <= 25 ? true : 'Account number required (max 25 characters)'
              },
              {
                type: 'list',
                name: 'accountType',
                message: 'Account Type:',
                choices: ['Checking', 'Savings']
              },
              {
                type: 'list',
                name: 'splitType',
                message: 'Deposit allocation:',
                choices: [
                  { name: 'Remainder (entire remaining net pay)', value: 'remainder' },
                  { name: 'Fixed dollar amount', value: 'amount' },
                  { name: 'Percentage of net pay', value: 'percent' }
                ]
              },
              {
                type: 'input',
                name: 'amount',
                message: 'Enter dollar amount:',
                when: (ans: any) => ans.splitType === 'amount',
                validate: (input: string) => !isNaN(Number(input)) && Number(input) > 0 ? true : 'Please enter a valid amount'
              },
              {
                type: 'input',
                name: 'percent',
                message: 'Enter percentage (e.g. 50 for 50%):',
                when: (ans: any) => ans.splitType === 'percent',
                validate: (input: string) => !isNaN(Number(input)) && Number(input) > 0 && Number(input) <= 100 ? true : 'Please enter a percentage between 1 and 100'
              },
              {
                type: 'confirm',
                name: 'isPrenote',
                message: 'Is this account a prenote verification?',
                default: false
              }
            ]);

            const newEntry: DirectDepositEntry = {
              ordinal: 1,
              routingNumber: answers.routingNumber.trim(),
              accountNumber: answers.accountNumber.trim(),
              accountType: answers.accountType,
              isRemainder: answers.splitType === 'remainder',
              isPrenote: answers.isPrenote,
              paycardType: null
            };

            if (answers.splitType === 'amount') {
              newEntry.amount = Number(answers.amount);
            } else if (answers.splitType === 'percent') {
              newEntry.percent = Number(answers.percent);
            }

            entries = [newEntry];
          }
        }

        // Validate payload
        validateEntries(entries);

        console.log(chalk.blue(`Updating direct deposit settings for employee ${chalk.cyan(employeeId)} (${entries.length} account(s))...`));

        await apiClient.put(`/employees/${encodeURIComponent(employeeId)}/directdeposit`, entries);

        if (entries.length === 0) {
          console.log(chalk.green(`✅ Successfully cleared all direct deposit settings for employee ${employeeId}.`));
        } else {
          console.log(chalk.green(`✅ Successfully updated direct deposit settings for employee ${employeeId}.`));
        }
      } catch (error: any) {
        console.error(chalk.red(`Error updating direct deposit settings for employee ${employeeId}:`, formatErrorMessage(error)));
        process.exit(1);
      }
    });

  // --- DELETE ---
  dd.command('delete <employeeId>')
    .alias('clear')
    .alias('del')
    .description("Delete an employee's direct deposit settings (clears all accounts)")
    .option('-y, --yes', 'Skip confirmation prompt', false)
    .option('--force', 'Skip confirmation prompt', false)
    .action(async (employeeId: string, options: { yes: boolean; force: boolean }) => {
      try {
        const skipPrompt = options.yes || options.force;

        if (!skipPrompt) {
          const { confirm } = await inquirer.prompt([
            {
              type: 'confirm',
              name: 'confirm',
              message: `Are you sure you want to delete all direct deposit settings for employee ${chalk.cyan(employeeId)}?`,
              default: false
            }
          ]);

          if (!confirm) {
            console.log(chalk.yellow('Operation cancelled.'));
            return;
          }
        }

        console.log(chalk.blue(`Deleting direct deposit settings for employee ${chalk.cyan(employeeId)}...`));

        await apiClient.delete(`/employees/${encodeURIComponent(employeeId)}/directdeposit`);

        console.log(chalk.green(`✅ Successfully deleted all direct deposit accounts for employee ${employeeId}.`));
      } catch (error: any) {
        console.error(chalk.red(`Error deleting direct deposit settings for employee ${employeeId}:`, formatErrorMessage(error)));
        process.exit(1);
      }
    });

  return dd;
}
