import { CosmosClient } from '@azure/cosmos';

const client = new CosmosClient(process.env.COSMOS_CONNECTION_STRING);
const DEFENDER_URL = process.env.DEFENDER_URL;
const DATABASE_NAME = process.env.DATABASE_NAME;

export const retrieveScore = async (prompt, logFunction) => {
  try {
    logFunction.info('Retrieving score for prompt to URL ' + DEFENDER_URL);
    const response = await fetch(`${DEFENDER_URL}/score`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: prompt
      })
    });

    if (!response.ok) {
      logFunction.error('Error retrieving score', response.statusText);
      throw new Error(`Error retrieving score: ${response.statusText}`);
    }

    const r = JSON.stringify(await response.json());
    return JSON.parse(r);

  } catch (error) {
    logFunction.error('Fetch error', error);
    throw error;
  }
};

export const SUBSCRIPTIONS_CONTAINER = 'Subscriptions';
export const REPOSITORY_ACCESS_CONTAINER = 'RepositoryAccess';
export const USAGE_CONTAINER = 'Usage';
export const INSTALLATIONS_CONTAINER = 'Installations';

export async function updateCosmosDB(logger, container, id, installationId, data) {
  const database = client.database(DATABASE_NAME);
  const containerClient = database.container(container);

  logger.info(`Updating item in CosmosDB: ${id}`);

  if (!containerClient || !containerClient.items) {
    logger.error('Invalid container client or items property is undefined', { containerClient });
    throw new Error('Invalid container client or items property is undefined');
  }

  data = { ...data, id, installationId };
  try {
    const { resource: updatedItem } = await containerClient.item(id, installationId).replace(data);
    logger.info(`Updated item: ${updatedItem.id}`);
  } catch (error) {
    logger.error('Error updating item in CosmosDB', error);
    throw error;
  }
}

export async function saveToCosmosDB(logger, container, data) {

  const database = client.database(DATABASE_NAME);

  const containerClient = database.container(container);

  if (!containerClient || !containerClient.items) {
    logger.error('Invalid container client or items property is undefined', { containerClient });
    throw new Error('Invalid container client or items property is undefined');
  }

  try {
    const { resource: createdItem } = await containerClient.items.create(data);
    logger.info(`Created item: ${createdItem.id}`);
  } catch (error) {
    logger.error('Error creating item in CosmosDB', error);
    throw error;
  }
}

export async function fetchFromCosmosDB(logger, containerName, parameters) {
  const database = client.database(DATABASE_NAME);
  logger.info("Fetching from CosmosDB", parameters);

  const containerClient = database.container(containerName);
  const { resources } = await containerClient.items.query({ query: `SELECT * FROM c WHERE c.installationId = @installationId AND c.month = @month`, parameters: parameters }).fetchAll();
  return resources[0];
}
