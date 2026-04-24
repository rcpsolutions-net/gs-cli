// src/lib/api.js

import axios from 'axios';
import chalk from 'chalk';
import { login, touchlessLogin } from './auth.js';
import config from './config.js';

let GsAccessToken = config.get('GsAccessToken');
let GsWorkspaceId = config.get('GsWorkspaceId');

if (!GsAccessToken ) {
  const isAuthCommand = process.argv.includes('auth');
  const isHelpCommand = process.argv.includes('--help');

  if (!isAuthCommand && !isHelpCommand) {
    console.error(chalk.red('Authentication error: You are not logged in.'));
    console.error(`Please run ${chalk.cyan('greenshades auth login')} to start a session.`);
    process.exit(1);
  }
}

const apiClient = axios.create({
            baseURL: 'https://api.greenshadesonline.com',
            params: {
                'workspaceId': GsWorkspaceId,
            },
            headers: {
                'Authorization': `Bearer ${GsAccessToken}`,
                'accept': '*/*'
            }
        });

async function handleTokenRefresh() {
  try {
    console.log(chalk.yellow('🔄 Access token expired. Need to refresh token...')) 
 
    const oldToken = config.get('GsAccessToken'); 

    console.log(chalk.green(`Current token: ${chalk.blue(oldToken)}`));
    
    await touchlessLogin();
    
    const newToken = config.get('GsAccessToken'); // Retrieve the newly refreshed token from the config

    if( newToken !== GsAccessToken ) {
      GsAccessToken = newToken; // Update the in-memory token variable
      console.log(chalk.green(`- Token updated in memory: ${chalk.blue(GsAccessToken)}`));
    }
    else {
      console.warn(chalk.yellow('⚠️  Warning: Token refresh completed but the token value did not change. This may indicate an issue with the token refresh process.'));
    }

    return newToken;

  } catch (error:any) {

    console.error(chalk.red('❌ Failed to refresh token:', error?.message));

    throw error;
  }
}

apiClient.interceptors.response.use(
  (response) => response, // On success, just pass the response through
  async (error) => {
    const originalRequest = error.config;
 
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Mark this request to prevent infinite loops

      try {
        const newGsAccessToken = await handleTokenRefresh();

        apiClient.defaults.headers.common['Authorization'] = `Bearer ${newGsAccessToken}`;
        originalRequest.headers['Authorization'] = `Bearer ${newGsAccessToken}`;
        
        return apiClient(originalRequest);
      } catch (refreshError) {
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);


export default apiClient;