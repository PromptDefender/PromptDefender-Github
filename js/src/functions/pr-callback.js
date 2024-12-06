import { app } from '@azure/functions';
import pkg from '@probot/adapter-azure-functions';
import probotapp from '../callback/app.js';

const { createAzureFunctionV4, createProbot } = pkg;

app.http('probot', {
    methods: ['POST'],
    authLevel: 'anonymous',
    handler: createAzureFunctionV4(probotapp, {
        probot: createProbot(),
    }),
});