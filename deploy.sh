#!/bin/bash

# Ensure all required environment variables are set
if [ -z "$RESOURCE_GROUP" ] || [ -z "$LOCATION" ] || [ -z "$KEY_VAULT_NAME" ] || [ -z "$WEBHOOK_SECRET" ] || [ -z "$PRIVATE_KEY" ] || [ -z "$FUNCTION_APP_NAME" ] || [ -z "$STORAGE_ACCOUNT_NAME" ] || [ -z "$GH_APP_ID" ]; then
  echo "One or more required environment variables are missing."
  echo "Please set RESOURCE_GROUP, LOCATION, KEY_VAULT_NAME, WEBHOOK_SECRET, PRIVATE_KEY, FUNCTION_APP_NAME, and STORAGE_ACCOUNT_NAME."
  exit 1
fi

# Get the logged in user ID
USER_ID=$(az ad signed-in-user show --query id -o tsv)

if [ -z "$USER_ID" ]; then
    echo "Failed to retrieve the logged in user ID."
    exit 1
fi

# Deploy the Key Vault and secrets using main.bicep
echo "Deploying Key Vault and secrets..."
az deployment group create --resource-group "$RESOURCE_GROUP" --template-file azure/secrets/main.bicep --parameters keyVaultName="$KEY_VAULT_NAME" webhookSecret="$WEBHOOK_SECRET" privateKey="$PRIVATE_KEY" userId="$USER_ID"

# Give the function app access to the Key Vault
az functionapp identity assign --resource-group $RESOURCE_GROUP --name $FUNCTION_APP_NAME --scope "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.KeyVault/vaults/$KEY_VAULT_NAME"
az functionapp identity assign --name $FUNCTION_APP_NAME --resource-group  $RESOURCE_GROUP

APP_ID=$(az functionapp identity show --name $FUNCTION_APP_NAME --resource-group $RESOURCE_GROUP --query principalId --output tsv)

az keyvault set-policy --name $KEY_VAULT_NAME --object-id $APP_ID --secret-permissions get list

# Update the function app settings with the Key Vault URL
KEY_VAULT_URL=$(az keyvault show --name $KEY_VAULT_NAME --query properties.vaultUri -o tsv)

az functionapp config appsettings set --name $FUNCTION_APP_NAME --resource-group $RESOURCE_GROUP --settings "WEBHOOK_SECRET=@Microsoft.KeyVault(VaultName=$KEY_VAULT_NAME;SecretName=WEBHOOK-SECRET)" "PRIVATE_KEY=@Microsoft.KeyVault(VaultName=$KEY_VAULT_NAME;SecretName=PRIVATE-KEY)" "APP_ID=$GH_APP_ID" "DEFENDER_URL=https://defender.safetoru.com"

# Deploy the function app using the Azure Functions Core Tools
func azure functionapp publish $FUNCTION_APP_NAME

# Deploy the JavaScript project
echo "Deploying JavaScript project..."
pushd js
npm install --only=prod
npm run build --if-present
popd

# Deploy the Python project
echo "Deploying Python project..."
pushd py
pip install -r requirements.txt
popd
