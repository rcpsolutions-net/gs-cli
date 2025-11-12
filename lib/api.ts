// src/lib/api.js

import axios from 'axios';
import chalk from 'chalk';
import config from './config.js';

let GsAccessToken = config.get('GsAccessToken');
let GsWorkspaceId = config.get('GsWorkspaceId');

if (!GsAccessToken ) {
  const isAuthCommand = process.argv.includes('auth');
  const isHelpCommand = process.argv.includes('--help');

  if (!isAuthCommand && !isHelpCommand) {
    console.error(chalk.red('Authentication error: You are not logged in.'));
    console.error(`Please run ${chalk.cyan('bh auth login')} to start a session.`);
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
                'Accept': 'application/json'
            }
        });

// --- AXIOS INTERCEPTOR FOR TOKEN REFRESH ---
async function handleTokenRefresh() {
  try {
    console.log(chalk.yellow('🔄 Access token expired. Refreshing token...')) 
    // Here you would implement the logic to refresh the token.
    // For demonstration, we'll just simulate a delay and return a new token.
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate async token refresh
    const newToken = 'newly_refreshed_token'; // Replace with actual token retrieval logic
    config.set('GsAccessToken', newToken);
    console.log(chalk.green('✅ Token refreshed successfully.'));
    return newToken;
  } catch (error:any) {
    console.error(chalk.red('❌ Failed to refresh token:', error?.message));
    throw error;
  }
}

/****
apiClient.interceptors.response.use(
  (response) => response, // On success, just pass the response through
  async (error) => {
    const originalRequest = error.config;

    // Check if the error is a 401 and we haven't already retried this request
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

    // For all other errors, just reject the promise
    return Promise.reject(error);
  }
);
 *****/


export default apiClient;