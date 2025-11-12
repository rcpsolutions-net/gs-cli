// Authentication Commands for Greenshades API
// lham@netplug
// src/commands/auth.js

import dotenv from 'dotenv';
dotenv.config();

import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { login, logout, getTokenInfo } from '../lib/auth.js';
import config from '../lib/config.js';

export default function createAuthCommand() {
  const auth = new Command('auth')
    .description('Manage Bullhorn authentication (login, logout, status)');

  // Subcommand: auth login
  auth
    .command('login')
    .description('Authenticate with the Greenshades API and save the session.')
    .action(async () => {
      const questions = [      
        {
          type: 'input',
          name: 'clientId',
          default: process.env.GREENSHADES_CLIENT_ID || 'jgjgjgjg-fd-dfasfdsafsa',
          message: 'Enter your GS API Client ID:',
        },
        {
          type: 'password',
          name: 'clientSecret',
          default: process.env.GREENSHADES_CLIENT_SECRET || 'KDFGJKLAJSALDF9jf4r8',
          message: 'Enter your GS API Client Secret:',
          mask: '*',
        },
        {
          type: 'input',
          name: 'workspaceId',
          default: process.env.GREENSHADES_WORKSPACE_ID || '367437',
          message: 'Enter your GS Workspace ID:',
        }
      ];
      
      const credentials = await inquirer.prompt(questions);

      await login(credentials);
    });

  // Subcommand: auth logout
  auth
    .command('logout')
    .description('Clear stored credentials and end the current session.')
    .action(() => {
        logout();
    });

  // Subcommand: auth status
  auth
    .command('status')
    .description('Check the current authentication status.')
    .action(async() => {
      const token = config.get('GsAccessToken');    


      if (token) {
        console.log(chalk.blue('✅ Stored API token found in configuration.'));

        await getTokenInfo(token);

      } else {
        console.log(chalk.yellow('❌ No stored API token found in configuration.'));
        console.log(`   Run ${chalk.cyan('bh auth login')} to authenticate.`);
      }
    });

  return auth;
}











/********************

const { Command } = require('commander');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const inquirer = require('inquirer');

const authUrl = 'https://auth.greenshadesonline.com/connect/token';
const clientId = process.env.GREENSHADES_CLIENT_ID;
const clientSecret = process.env.GREENSHADES_CLIENT_SECRET;

const createAuthCommands = async function createAuthCommands() {
        const auth = new Command().name('auth').description('Authenticate and save a new API access token to the .env file.');

        auth.command('login').description('Authenticate and save a new Greenshades API access token to the .env file.')
        .action(async () => {

            const questions = [{
                type: 'input',
                name: 'clientId',
                default: process.env.GREENSHADES_CLIENT_ID || 'd00kie1-78ab-5656-1b5a-9d54f3e123ae',
                message: 'Enter your Greenshades API Client ID:',
            },
            {
                type: 'password',
                name: 'clientSecret',
                default: process.env.GREENSHADES_CLIENT_SECRET || 'd00kie1-78ab-5656-1b5a-9de4f3e123ae',
                message: 'Enter your Greenshades API Client Secret:',
                mask: '*',
            }];

        const credentials = await inquirer.prompt(questions);
        const clientId = credentials.clientId;
        const clientSecret = credentials.clientSecret;

        if (!clientId || !clientSecret) {
            console.error('Error: Please set GREENSHADES_CLIENT_ID and GREENSHADES_CLIENT_SECRET in your .env file.');
            return;
        }   

        try {
            console.log('Requesting a new access token...');
      
            const response = await axios.post(authUrl, new URLSearchParams({
                'grant_type': 'client_credentials',
                'client_id': clientId,
                'client_secret': clientSecret,
                'audience': 'https://api.greenshades.com'
            }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });    

            const newToken = response.data.access_token;

            if (newToken) console.log('\n✅ Success! Token received.');
            else console.error('\n❌ Error: No token received in the response.');

            const envFilePath = path.join(__dirname, '.env');
            try {
                let envFileContent = fs.readFileSync(envFilePath, 'utf8');
                const tokenRegex = /GREENSHADES_API_TOKEN=.*;

                if (envFileContent.match(tokenRegex)) {      
                  envFileContent = envFileContent.replace(tokenRegex, `GREENSHADES_API_TOKEN="${newToken}"`);
              } else {
                  envFileContent += `\nGREENSHADES_API_TOKEN="${newToken}"`;
              }

            fs.writeFileSync(envFilePath, envFileContent);
            console.log('✅ .env file has been updated with the new access token.');
            console.log(`The token expires in ${response.data.expires_in} seconds.`);

            } catch (fileError) {
                console.error('\n❌ Error updating .env file.');
                console.error('Please manually add the following line to your .env file:');
                console.error(`GREENSHADES_API_TOKEN="${newToken}"`);
            }
    } catch (error) {
      if (error.response) {
        console.error(`\n❌ Error: Authentication failed with status ${error.response.status}.`);
        console.error('Response Data:', error.response.data);
      } else {
        console.error('An unexpected error occurred:', error.message);
      }
    }
    });

 
    cmd.command('logout').description('Remove the Greenshades API access token from the .env file.')
    .action(() => {
        const envFilePath = path.join(__dirname, '.env');
        try {
            let envFileContent = fs.readFileSync(envFilePath, 'utf8');
            const tokenRegex = /GREENSHADES_API_TOKEN=.*$/;
            
            if (envFileContent.match(tokenRegex)) {
                envFileContent = envFileContent.replace(tokenRegex, 'GREENSHADES_API_TOKEN=');
                fs.writeFileSync(envFilePath, envFileContent);
                console.log('✅ Successfully removed the access token from the .env file.');
            } else {
                console.log('ℹ️ No access token found in the .env file.');
            }
        } catch (error) {
            console.error('❌ Error reading .env file:', error.message);
        }
    });

    cmd.command('status').description('Check the status of the Greenshades API access token in the .env file.')
    .action(() => {
        const envFilePath = path.join(__dirname, '.env');
        try {
            const envFileContent = fs.readFileSync(envFilePath, 'utf8');
            const tokenRegex = /GREENSHADES_API_TOKEN=(.*)/;
            const match = envFileContent.match(tokenRegex);
            
            if (match && match[1]) {
                console.log('✅ Access token is set in the .env file.');
            } else {
                console.log('❌ No access token found in the .env file.');
            }
        } catch (error) {
            console.error('❌ Error reading .env file:', error.message);
        }
    });

 

    return auth;    
}

module.exports = {
    createAuthCommands,
};

 */