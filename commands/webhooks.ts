// file: src/commands/employees.ts

import { Command } from 'commander';
import chalk from 'chalk';
import apiClient from '../lib/api.ts';

const validEventNames = [
    "payRun.completed",
    "payRun.costReportingTransactions.completed",
    "payRun.payRecord.voided",
    "payRun.payRecords.completed",
    "paySchedule.updated",
    "employee.updated",
    "employee.directDeposit.updated",
    "employee.paySchedule.updated",
    "employee.earningCode.added",
    "employee.earningCode.updated",
    "employee.earningCode.deleted"
];


function createWebhookCommands() {
  const webhooks = new Command('webhooks')
    .description('Manage webhooks in the Greenshades API (list, details, create, delete, subscribe, unsubscribe)');

  webhooks  
    .command('list')  
    .description('Get all webhooks for the workspace')  
    .action(async () => {
      try {        
        console.log(chalk.blue('--- Fetching all webhooks...'));

        const response = await apiClient.get('/webhooks/subscriptions');
        
        console.log(JSON.stringify(response.data, null, 2));
        console.log(chalk.green('✅ Successfully retrieved webhooks.'));

      } catch (error: any) {
        console.error(chalk.red('Error fetching webhooks:', error.message));
        
        process.exit(1);
      }
    });

  webhooks.command('details <webhook-id>')
    .description('Get a single webhook subscription by their Greenshades webhookId')
    .action(async (webhookId) => {
      try {
        console.log(chalk.blue(`Fetching webhook subscription details with subscription Id: ${webhookId}...`));

        const response = await apiClient.get(`/webhooks/subscriptions/${webhookId}`);

        console.log('WebHook Record: ', JSON.stringify(response.data, null, 2));

        console.log(chalk.green(`✅ Successfully retrieved webhook subscription ${webhookId}.`));
      } catch (error: any) {
        console.error(chalk.red(`Error fetching webhook subscription ${webhookId}:`, error.message));

        process.exit(1);
      }
    });

    webhooks.command('create <eventName> <callback-url> [hmac-key]')
    .description('Create a new webhook subscription for a given event name, callback URL, and HMAC key')
    .action(async (eventName, callbackUrl, hmacKey = null) => {
      try {
        const hmacKeyToUse = hmacKey || process.env.GREENSHADES_WEBHOOK_HMAC_KEY;

        console.log(chalk.blue(`--- Creating new webhook subscription for event: ${eventName} with callback URL: ${callbackUrl}...`));
        console.log(chalk.blue(`--- Using HMAC key: ${hmacKeyToUse || 'No HMAC key provided'} (if not provided as argument, will use GREENSHADES_WEBHOOK_HMAC_KEY env variable)`));  
      
        const response = await apiClient.post(`/webhooks/subscriptions?eventName=${eventName}`, {                                     
            id: 1,
            url: callbackUrl,
            hmacKey: hmacKeyToUse,
            subscribedEvents: [ 'payRun.completed' ], // Example events - replace with actual events you want to subscribe to
          });

        console.log(JSON.stringify(response.data, null, 2));

        console.log(chalk.green(`✅ Successfully created webhook subscription for event ${eventName}.`));
      } catch (error: any) {              
        console.error(chalk.red(`Error creating webhook subscription for event ${eventName}:`, error.message));

        process.exit(1);
      }
    });

    webhooks.command('delete <id>')
    .description('Delete a webhook subscription by their Greenshades webhookId')
    .action(async (id) => {
      try {
        console.log(chalk.blue(`--- Deleting webhook subscription with subscription Id: ${id}...`));

        await apiClient.delete(`/webhooks/subscriptions/${id}`);

        console.log(chalk.green(`✅ Successfully deleted webhook subscription with Id ${id}.`));
      } catch (error: any) {
        console.error(chalk.red(`Error deleting webhook subscription with Id ${id}:`, error.message));

        process.exit(1);
      }
    });

    webhooks.command('subscribe <id> <eventName>')
    .description('Add an event subscription to an existing webhook subscription by their Greenshades webhookId and event name')
    .action(async (id, eventName) => {
      try {

        if( !validEventNames.includes(eventName) ) {          
          return console.log(chalk.yellow(`⚠️ Event name ${eventName} is not in the list of valid event names. Please provide a valid event name and try again.`) + ' ' + chalk.blue(`Valid event names are: ${validEventNames.join(', ')}`));          
        }
 
        const wh = await getWebhookById(id);
        if( !wh ) 
          return console.log(chalk.yellow(`⚠️ No existing webhook subscription found with Id ${id}. Cannot add event subscription. Please check the Id and try again.`));
        
        const events = wh.subscribedEvents || [];

        console.log(chalk.redBright(`Current subscribed events for webhook subscription ${id}: ${events.join(', ')}`));

        if( events.includes(eventName) ) {
          return console.log(chalk.yellow(`⚠️ Webhook subscription with Id ${id} is ALREADY subscribed to event ${eventName}. No action taken.`));          
        }
        else {
          console.log(chalk.blue(`Webhook subscription ${id} is not currently subscribed to event ${eventName}. Proceeding to add subscription...`));

          const resp = await putWebhookById(id, wh.url, wh.hmacKey, [...events, eventName]);

          console.log(chalk.green(`✅ Successfully added event subscription for event ${eventName} to webhook subscription with Id ${id}.`));
        }
      } catch (error: any) {
        console.error(chalk.red(`Error adding event subscription for event ${eventName} to webhook subscription with Id ${id}:`, error.message));

        process.exit(1);
      }
    });

    webhooks.command('tap <id> <eventName>')
    .description('Send a test webhook event to the callback URL for a given webhook subscription Id and event name')
    .action(async (id, eventName) => {
      try {
        console.log(chalk.blue(`--- Sending test webhook event ${eventName} for webhook subscription with Id ${id}...`));

        await apiClient.post(`/webhooks/subscriptions/${id}/test/${eventName}`);

        console.log(chalk.green(`✅ Successfully sent test webhook event ${eventName} for webhook subscription with Id ${id}.`));
      } catch (error: any) {
        console.error(chalk.red(`Error sending test webhook event ${eventName} for webhook subscription with Id ${id}:`, error.message));

        process.exit(1);
      }
    });

    webhooks.command('unsubscribe <id> <eventName>')
    .description('Remove an event subscription from an existing webhook subscription by their Greenshades webhookId and event name')
    .action(async (id, eventName) => {
      try 
      {
        if( !validEventNames.includes(eventName) ) {          
          return console.log(chalk.yellow(`⚠️ Event name ${eventName} is not in the list of valid event names. Please provide a valid event name and try again.`) + ' ' + chalk.blue(`Valid event names are: ${validEventNames.join(', ')}`));        
        }
 
        const wh = await getWebhookById(id);
        if( !wh ) 
          return console.log(chalk.yellow(`⚠️ No existing webhook subscription found with Id ${id}. Cannot remove event subscription. Please check the Id and try again.`));                
        
        const events = wh.subscribedEvents || [];
        console.log(chalk.redBright(`Current subscribed events for webhook subscription ${id}: ${events.join(', ')}`));

        if( !events.includes(eventName) ) {
          return console.log(chalk.yellow(`⚠️ Webhook subscription with Id ${id} is NOT subscribed to event ${eventName}. No action taken.`));
        }
        else {
          console.log(chalk.blue(`Webhook subscription ${id} is currently subscribed to event ${eventName}. Proceeding to remove subscription...`));

          await putWebhookById(id, wh.url, wh.hmacKey, events.filter((e:any) => e !== eventName));

          console.log(chalk.green(`✅ Successfully removed event subscription for event ${eventName} from webhook subscription with Id ${id}.`));
        }
      } catch (error: any) {
        console.error(chalk.red(`Error removing event subscription for event ${eventName} from webhook subscription with Id ${id}:`, error.message));

        process.exit(1);
      }
    });
          
    return webhooks;
}

// Helper functions to get existing webhook subscription details and update webhook subscription with new event subscriptions

async function getWebhookById(webhookId: string) {
  try {
    console.log(chalk.redBright('Retrieving existing webhook subscription details to get current subscribed events...'));

    const resp = await apiClient.get(`/webhooks/subscriptions/${webhookId}`);

    return resp.data;
  } catch (error: any) {
    console.error(chalk.red(`Error fetching webhook subscription ${webhookId}:`, error.message));

    process.exit(1);
  }
}

async function putWebhookById(webhookId: string, url: string, hmacKey: string, subscribedEvents: string[]) {
  try {
    console.log(chalk.redBright('Updating webhook subscription with new subscribed events...'));

    const resp = await apiClient.put(`/webhooks/subscriptions/${webhookId}`, {
      id: webhookId,
      url: url,
      hmacKey: hmacKey,
      subscribedEvents: subscribedEvents
    });
    
    return resp;
  } catch (error: any) {
    console.error(chalk.red(`Error updating webhook subscription ${webhookId}:`, error.message));

    process.exit(1);
  }
}

export default createWebhookCommands;

/***
 * Example code for generating HMAC signature for incoming webhook requests (to verify authenticity of incoming webhook requests from Greenshades API):
 * 
 * 
const crypto = require('crypto');

const timestamp = "{{timestamp from RequestHeaders 'X-GS-TIMESTAMP'}}";
const jsonBody = "{{json from RequestBody}}";
const content = timestamp + "\n" + jsonBody;
const key = asciiToHex("my secret key");

const signature = signKey(key, content);

console.log(signature);

function asciiToHex(str) {
	const arr1 = [];
	for (let n = 0, l = str.length; n < l; n++) 
  {
  	const hex = Number(str.charCodeAt(n)).toString(16);
		arr1.push(hex);
	 }
	return arr1.join('');
}

function signKey (clientKey, msg) {
    const key = new Buffer.from(clientKey, 'hex');
    return crypto.createHmac('sha256', key).update(msg).digest('hex');
}

*****/