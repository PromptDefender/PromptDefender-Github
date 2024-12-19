import { app } from '@azure/functions';
import { fetchFromCosmosDB, saveToCosmosDB, INSTALLATIONS_CONTAINER, USAGE_CONTAINER } from '../callback/api.js';

async function status(request, context) {
  context.log(`Http function processed request for url "${request.url}"`);

  try {
    await saveToCosmosDB(context, USAGE_CONTAINER, {
      installationId: '123',
      month: '2022-01',
      status: 'active'
    });

    const data = await fetchFromCosmosDB(context, USAGE_CONTAINER, [
      { name: '@installationId', value: '123' },
      { name: '@month', value: '2022-01' }
    ]);

    return {
      status: 200,
      jsonBody: {
        ok: data
      }
    };
  } catch (error) {
    context.error('Error in status function', error);
    return {
      status: 500,
      jsonBody: {
        error: 'Internal Server Error'
      }
    };
  }
}

app.http('status', {
    route: "status",
    methods: ['GET'],
    authLevel: 'anonymous',
    handler: status
});
