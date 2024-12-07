provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "main" {
  name     = var.resource_group_name
  location = var.location
}

resource "azurerm_storage_account" "main" {
  name                     = var.storage_account_name
  resource_group_name      = azurerm_resource_group.main.name
  location                 = azurerm_resource_group.main.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
}

resource "azurerm_storage_queue" "main" {
  name                 = var.queue_name
  storage_account_name = azurerm_storage_account.main.name
}

resource "azurerm_function_app" "nodejs" {
  name                       = var.nodejs_function_app_name
  resource_group_name        = azurerm_resource_group.main.name
  location                   = azurerm_resource_group.main.location
  storage_account_name       = azurerm_storage_account.main.name
  storage_account_access_key = azurerm_storage_account.main.primary_access_key
  os_type                    = "linux"
  runtime_stack              = "node"
  version                    = "~14"
  app_settings = {
    "FUNCTIONS_WORKER_RUNTIME" = "node"
    "WEBSITE_NODE_DEFAULT_VERSION" = "~14"
    "DEFENDER_URL" = var.defender_url
  }
}

resource "azurerm_key_vault" "main" {
  name                = var.key_vault_name
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  tenant_id           = var.tenant_id
  sku_name            = "standard"
}

resource "azurerm_key_vault_secret" "webhook_secret" {
  name         = "WEBHOOK-SECRET"
  value        = var.webhook_secret
  key_vault_id = azurerm_key_vault.main.id
}

resource "azurerm_key_vault_secret" "private_key" {
  name         = "PRIVATE-KEY"
  value        = var.private_key
  key_vault_id = azurerm_key_vault.main.id
}

resource "azurerm_application_insights" "main" {
  name                = var.app_insights_name
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  application_type    = "web"
}

resource "azurerm_function_app" "python" {
  name                       = var.python_function_app_name
  resource_group_name        = azurerm_resource_group.main.name
  location                   = azurerm_resource_group.main.location
  storage_account_name       = azurerm_storage_account.main.name
  storage_account_access_key = azurerm_storage_account.main.primary_access_key
  os_type                    = "linux"
  runtime_stack              = "python"
  version                    = "~3.8"
  app_settings = {
    "FUNCTIONS_WORKER_RUNTIME" = "python"
    "APPINSIGHTS_INSTRUMENTATIONKEY" = azurerm_application_insights.main.instrumentation_key
    "DEFENDER_URL" = var.defender_url
  }
}
