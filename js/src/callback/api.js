import { CosmosClient } from '@azure/cosmos';

const client = new CosmosClient(process.env.COSMOS_CONNECTION_STRING);
const DEFENDER_URL = process.env.DEFENDER_URL;
const DATABASE_NAME = process.env.DATABASE_NAME;

export const retrieveScore = async (prompt) => {
  return await fetch(`${DEFENDER_URL}/score`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: prompt
    })
  })
  .then(res => res.json())
  .then(data => data.response);
};

export const SUBSCRIPTIONS_CONTAINER = 'Subscriptions';
export const REPOSITORY_ACCESS_CONTAINER = 'RepositoryAccess';
export const USAGE_CONTAINER = 'Usage';
export const INSTALLATIONS_CONTAINER = 'Installations';

export async function saveToCosmosDB(context, container, data) {

  const database = client.database(DATABASE_NAME);

  const containerClient = database.container(container);

  if (!containerClient || !containerClient.items) {
    context.error('Invalid container client or items property is undefined', { containerClient });
    throw new Error('Invalid container client or items property is undefined');
  }

  try {
    const { resource: createdItem } = await containerClient.items.create(data);
    context.log(`Created item: ${createdItem.id}`);
  } catch (error) {
    context.error('Error creating item in CosmosDB', error);
    throw error;
  }
}

export async function fetchFromCosmosDB(context, containerName, query) {
  const database = client.database(DATABASE_NAME);
  context.log("Fetching from CosmosDB", query);

  const containerClient = database.container(containerName);
  const { resources } = await containerClient.items.query({query: `SELECT * FROM c`}).fetchAll();
  return resources[0];
}
