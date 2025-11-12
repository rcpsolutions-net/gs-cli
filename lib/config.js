// src/lib/config.js

import Conf from 'conf';

// Define the structure and validation rules for our configuration data.
// This ensures that we always store data in a consistent format.
const schema = {
	GsAccessToken: {
		type: 'string',
		description: 'The session token (access_token) for the Greenshades API.'
	},
	GsWorkspaceId: {
		type: 'string',
		description: 'The unique identifier for the Greenshades workspace.'
	},
	restUrl: {
		type: 'string',
		format: 'uri',
		description: 'The unique base URL for API requests, received after login.'
	},
	refreshToken: {
		type: 'string',
		description: 'The refresh token used to obtain a new GsAccessToken when the current one expires.'
	}
};


const config = new Conf({
    projectName: 'gs-cli',
    schema: schema,
});

export default config;