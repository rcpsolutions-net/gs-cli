// Authentication Commands for Greenshades API
// lham@netplug

import dotenv from 'dotenv';

dotenv.config();

import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { login, logout, getTokenInfo } from '../lib/auth.js';
import config from '../lib/config.js';

export default function createAuthCommands() {
  const auth = new Command('auth')
    .description('Manage Greenshades authentication (login, logout, status)');

  auth.command('login')
    .description('Authenticate with the Greenshades API and save the session.')
    .action(async () => {
      const questions = [      
        {
          type: 'input',
          name: 'clientId',
          default: process.env.GREENSHADES_CLIENT_ID || 'client-id-placeholder',
          message: 'Enter your GS API Client ID:',
        },
        {
          type: 'password',
          name: 'clientSecret',
          default: process.env.GREENSHADES_CLIENT_SECRET || 'client-secret-placeholder',
          message: 'Enter your GS API Client Secret:',
          mask: '*',
        },
        {
          type: 'input',
          name: 'workspaceId',
          default: process.env.GREENSHADES_WORKSPACE_ID || 'workspace-id-placeholder',
          message: 'Enter your GS Workspace ID:',
        }
      ];
      
      const credentials = await inquirer.prompt(questions);

      await login(credentials);
    });

  auth.command('logout')
    .description('Clear stored credentials and end the current session.')
    .action(() => {
        logout();
    });

  auth.command('status')
    .description('Check the current authentication status.')
    .action(async() => {
      const token = config.get('GsAccessToken');    

      if (token) {
        console.log(chalk.blue('✅ Stored API token found in configuration.'));

        await getTokenInfo(token);

      } else {
        console.log(chalk.yellow('❌ No stored API token found in configuration.'));
        console.log(`   Run ${chalk.cyan('greenshades auth login')} to authenticate.`);
      }
    });

  return auth;
}
