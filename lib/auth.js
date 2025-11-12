import axios from 'axios';
import chalk from 'chalk';
import ora from 'ora';
import config from './config.js';

const authUrl = 'https://auth.greenshadesonline.com/connect/token';

export async function login({ clientId, clientSecret }) {
  const spinner = ora('Authenticating with Greenshades...').start();

  try {
        if (!clientId || !clientSecret ) {
            console.error('Error: Please set GREENSHADES_CLIENT_ID, GREENSHADES_CLIENT_SECRET, and GREENSHADES_WORKSPACE_ID in your .env file.');
            return;
        }   

        try {
           spinner.text = 'Step 1 of 1: Requesting API access token for clientId: ' + clientId;
      
            const response = await axios.post(authUrl, new URLSearchParams({
                'grant_type': 'client_credentials',
                'client_id': clientId,
                'client_secret': clientSecret,
                'audience': 'https://api.greenshades.com'
            }), 
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });    

            const newToken = response.data.access_token;            

            if (newToken) {
                console.log('\n✅ Success! Token received.');

                config.set('GsAccessToken', newToken);
                

                spinner.succeed(chalk.green('Successfully authenticated with Greenshades!'));
                console.log(chalk.blue(`--- Your API session is now active.`));

                spinner.start('Getting authorized workspace information...');

                const apiClient = axios.create({
                    baseURL: 'https://api.greenshadesonline.com',                  
                    headers: {
                        'Authorization': `Bearer ${newToken}`,
                        'Accept': 'application/json'
                    }
                });

                const workspaceResponse = await apiClient.get('/workspaces');

                const workspaceName = workspaceResponse.data.name || 'Unknown Workspace Name';
                const workspaceId = workspaceResponse.data.id || 'Unknown Workspace ID';

                console.log(workspaceResponse)

                let fnd = workspaceResponse.data.find(w => w.name === 'Midway Staffing Inc');

                if( fnd ) {
                    console.log('Found workspace: ', fnd);
                    config.set('GsWorkspaceId', fnd.workspaceId.toString());
                } else {
                    console.log('Workspace not found in response data.');
                }
                

                spinner.succeed(chalk.green(`✅ You are now logged in to workspace: ${workspaceName} (ID: ${workspaceId})`));

                spinner.stop();

                console.log(chalk.blue('--- Your API session is now active and ready for use.'));
            }
            else {
                console.error('\n❌ Error: No token received in the response.');
                spinner.fail(chalk.red('Authentication failed.'));
                return;
            }

        }
        catch (error) {
            console.error('\n❌ Error during authentication request:', error.response ? error.response.data : error.message);
            spinner.fail(chalk.red('Authentication failed.'));
            return;
        } 

  } catch (error) {
    spinner.fail(chalk.red('Authentication failed.'));
    
    if (error.response) {
      const status = error.response.status;
      const errorMsg = error.response.data?.errorMessage || error.response.data?.error_description || 'No description provided.';
      console.error(chalk.red(`Error ${status}: ${errorMsg}`));
      console.error(chalk.yellow('Please check your credentials and API keys.'));
    } else {
      console.error(chalk.red('An unexpected error occurred:', error.message));
    }

    process.exit(1);
  }
}

export function logout() {
    const spinner = ora('Logging out...').start();

    spinner.text = 'Removing stored API token...';
    config.delete('GsAccessToken');
    config.clear();

    spinner.succeed(chalk.green('✅ You have been logged out successfully. The API token has been removed from the configuration.'));
}

export async function getTokenInfo(token) {
    const spinner = ora('Fetching token information...').start();

    try {
        const apiClient = axios.create({
            baseURL: 'https://api.greenshadesonline.com',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json'
            }
        });

        spinner.text = 'Requesting token details from Greenshades...';

        const response = await apiClient.get('/identity');

        spinner.succeed(chalk.green('Success! API Token is valid...'));
        console.log(chalk.blue('Token Information:'));
        console.log(JSON.stringify(response.data, null, 2));

    } catch (error) {
        spinner.fail(chalk.red('Error: Failed to fetch token information.'));
        
        if (error.response) {
            console.error(chalk.red(`API request failed with status ${error.response.status}.`));
            if (error.response.status === 401) {
                console.error(chalk.red('This is an "Unauthorized" error. The token may be invalid or expired. Please run the "auth login" command again.'));
            }
            console.error(chalk.red('Response Data:'), error.response.data);
        } else {
            console.error(chalk.red('An unexpected error occurred:', error.message));
        }
    }
}