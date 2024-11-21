# prompt-defender-webhook

> A GitHub App built with [Probot](https://github.com/probot/probot) that A github application which will allow pull requests and  code repepositories to interact with prompt defender, integrating prLLM Security practices into the CI/CD pipeline

## Setup

```sh
# Install dependencies
npm install

# Run the bot
npm start
```

## Deployment

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
```

## Contributing

If you have suggestions for how prompt-defender-webhook could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## License

[ISC](LICENSE) © 2024 dllewellyn
