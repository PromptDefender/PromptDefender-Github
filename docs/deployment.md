# Deployment

To deploy this Probot app to Azure using Bicep, follow these steps:

1. Install the Azure CLI, Bicep CLI and deploy:

Set the following environment variables

```sh
export RESOURCE_GROUP=<your-resource-group>
export LOCATION=<your-location>
export KEY_VAULT_NAME=<your-key-vault-name>
export WEBHOOK_SECRET=<your-webhook-secret>
export PRIVATE_KEY=<your-private-key>
export FUNCTION_APP_NAME=<your-function-app-name>
export STORAGE_ACCOUNT_NAME=<your-storage-account-name>
```

```sh
brew tap azure/functions
brew install azure-functions-core-tools@4

az bicep install

bash deploy.sh 

func azure functionapp publish $FUNCTION_APP_NAME
