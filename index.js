#!/usr/bin/env node

const { Command } = require('commander');
const axios = require('axios');
require('dotenv').config();
const fs = require('fs'); // Import the File System module
const path = require('path'); // Import the Path module

const program = new Command();

// --- API Configuration ---
const apiBaseUrl = 'https://api.greenshadesonline.com';

const authUrl = 'https://auth.greenshadesonline.com/connect/token';

const clientId = process.env.GREENSHADES_CLIENT_ID;
const clientSecret = process.env.GREENSHADES_CLIENT_SECRET;
// We read the token fresh for each command that needs it.
let apiToken = process.env.GREENSHADES_API_TOKEN; 

// Axios instance for regular API calls (uses Bearer Token)
const apiClient = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    'Authorization': `Bearer ${apiToken}`,
    'Accept': 'application/json'
  }
});

// --- CLI Program Definition ---
program
  .name('gs-cli')
  .description('A command-line tool for the Greenshades API')
  .version('1.0.0');

// --- 'auth' Command ---
program
  .command('auth')
  .description('Authenticate and save a new API access token to the .env file.')
  .action(async () => {
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
      }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      const newToken = response.data.access_token;
      console.log('\n✅ Success! Token received.');

      // --- NEW: Automatically update the .env file ---
      const envFilePath = path.join(__dirname, '.env');
      try {
        let envFileContent = fs.readFileSync(envFilePath, 'utf8');
        const tokenRegex = /GREENSHADES_API_TOKEN=.*/;

        if (envFileContent.match(tokenRegex)) {
          // If the token variable exists, replace it
          envFileContent = envFileContent.replace(tokenRegex, `GREENSHADES_API_TOKEN="${newToken}"`);
        } else {
          // If it doesn't exist, add it to the end of the file
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
      // --- End of new section ---

    } catch (error) {
      if (error.response) {
        console.error(`\n❌ Error: Authentication failed with status ${error.response.status}.`);
        console.error('Response Data:', error.response.data);
      } else {
        console.error('An unexpected error occurred:', error.message);
      }
    }
  });

// --- 'get-token-info' Command ---
program
  .command('get-token-info')
  .alias('token')
  .description('Get information about the current API security token.')
  .action(async () => {
    // Refresh the token from the environment for this command
    require('dotenv').config({ override: true });
    apiToken = process.env.GREENSHADES_API_TOKEN;

    if (!apiToken) {
      console.error('Error: API Token not found. Please run the "auth" command first.');
      return;
    }

    // We must update the apiClient instance with the new token
    apiClient.defaults.headers['Authorization'] = `Bearer ${apiToken}`;

    try {
      console.log('Fetching token information...');
      const response = await apiClient.get('/identity');
      
      console.log('\n✅ Success! API Token is valid.');
      console.log('Token Information:');
      console.log(JSON.stringify(response.data, null, 2));

    } catch (error) {
      if (error.response) {
        console.error(`\n❌ Error: API request failed with status ${error.response.status}.`);
        if (error.response.status === 401) {
          console.error('This is an "Unauthorized" error. The token may be invalid or expired. Please run the "auth" command again.');
        }
        console.error('Response Data:', error.response.data);
      } else {
        console.error('An unexpected error occurred:', error.message);
      }
    }
  });

// Parse the command-line arguments
program.parse(process.argv);