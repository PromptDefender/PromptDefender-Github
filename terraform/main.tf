terraform {
   required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "4.13.0"
    }
  }

  backend "remote" {
    organization = "PromptShield"

    workspaces {
      name = "PromptDefender-Github"
    }
  }
}

provider "azurerm" {
  features {}
  subscription_id = var.subscriptionId
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

resource "azurerm_service_plan" "main" {
  name                = "${var.nodejs_function_app_name}-plan"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  os_type             = "Linux"
  sku_name            = "Y1"
}

resource "azurerm_linux_function_app" "nodejs" {
  name                       = var.nodejs_function_app_name
  resource_group_name        = azurerm_resource_group.main.name
  location                   = azurerm_resource_group.main.location
  storage_account_name       = azurerm_storage_account.main.name
  storage_account_access_key = azurerm_storage_account.main.primary_access_key
  service_plan_id            = azurerm_service_plan.main.id
  identity {
    type = "SystemAssigned"
  }

  site_config {
    application_stack {
      node_version = "22"
    }
  }
  app_settings = {
    "FUNCTIONS_WORKER_RUNTIME" = "node"
    "WEBSITE_NODE_DEFAULT_VERSION" = "~22"
    "DEFENDER_URL" = var.defender_url
  }
}

resource "random_string" "suffix" {
  length  = 8
  special = false
}

resource "azurerm_key_vault" "main" {
  name                =  "${var.key_vault_name}-${random_string.suffix.result}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  tenant_id           = var.tenant_id
  sku_name            = "standard"

  depends_on = [
    azurerm_linux_function_app.nodejs
  ]

  access_policy {
    tenant_id = data.azurerm_client_config.current.tenant_id
    object_id = azurerm_linux_function_app.nodejs.identity[0].principal_id

    secret_permissions = [
      "Get",
    ]
  }

  access_policy {
    tenant_id = data.azurerm_client_config.current.tenant_id
    object_id = data.azurerm_client_config.current.object_id

    secret_permissions = [
      "Get",
      "List",
      "Set",
    ]
  }

  network_acls {
    default_action = "Deny"
    bypass         = "AzureServices"

    ip_rules = [
      "0.0.0.0/0"
    ]
  }
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