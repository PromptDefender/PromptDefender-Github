# prompt-defender-webhook

> A GitHub App built with [Probot](https://github.com/probot/probot) that A github application which will allow pull requests and  code repepositories to interact with prompt defender, integrating prLLM Security practices into the CI/CD pipeline

## Setup

```sh
# Install dependencies
npm install

# Run the bot
npm start
```

## Project Structure

```sh
.
├── js
│   ├── src
│   │   ├── callback
│   │   │   ├── api.js
│   │   │   └── app.js
│   │   ├── functions
│   │   │   └── pr-callback.js
│   │   └── index.js
│   └── test
│       └── index.test.js
└── py
    ├── src
    │   └── sample_app.py
    └── test
        └── test_sample_app.py
```

## Running the JavaScript Project

```sh
func start 
```

## Running the Sample Python Application

To run the sample Python application, navigate to the `py/src` directory and execute the following command:

```sh
python sample_app.py
```

## Terraform Setup and Deployment

### Prerequisites

- Install [Terraform](https://www.terraform.io/downloads.html)
- Install [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli)

### Steps

1. Clone the repository and navigate to the project directory.

2. Initialize Terraform:

```sh
terraform init
```

3. Apply the Terraform configuration:

```sh
terraform apply -var "resource_group_name=<your-resource-group>" -var "location=<your-location>" -var "key_vault_name=<your-key-vault-name>" -var "webhook_secret=<your-webhook-secret>" -var "private_key=<your-private-key>" -var "nodejs_function_app_name=<your-nodejs-function-app-name>" -var "storage_account_name=<your-storage-account-name>" -var "defender_url=https://defender.safetorun.com" -auto-approve
```

4. Deploy the function app using the Azure Functions Core Tools:

```sh
func azure functionapp publish <your-function-app-name>
```

## Contributing

If you have suggestions for how prompt-defender-webhook could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## License

[ISC](LICENSE) © 2024 dllewellyn
