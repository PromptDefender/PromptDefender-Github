const DEFENDER_URL = process.env.DEFENDER_URL;

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

const { CosmosClient } = require('@azure/cosmos');
const client = new CosmosClient(process.env.COSMOS_CONNECTION_STRING);

export async function saveToCosmosDB(containerName, data) {
  const { container } = client.database('YourDatabaseName').container(containerName);
  await container.items.create(data);
}

export async function fetchFromCosmosDB(containerName, query) {
  const { container } = client.database('YourDatabaseName').container(containerName);
  const { resources } = await container.items.query({ query: `SELECT * FROM c WHERE c.installationId = @installationId AND c.month = @month`, parameters: query }).fetchAll();
  return resources[0];
}
