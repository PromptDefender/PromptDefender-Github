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
  os_type             = "Windows"
  sku_name            = "Y1"
}

resource "azurerm_linux_function_app" "nodejs" {
  name                       = var.nodejs_function_app_name
  resource_group_name        = azurerm_resource_group.main.name
  location                   = azurerm_resource_group.main.location
  storage_account_name       = azurerm_storage_account.main.name
  storage_account_access_key = azurerm_storage_account.main.primary_access_key
  service_plan_id            = azurerm_service_plan.main.id
  https_only = true

  identity {
    type = "SystemAssigned"
  }

  site_config {
    application_stack {
      node_version = "~20"
    }
  }
  app_settings = {
    "DEFENDER_URL" = var.defender_url
    "APP_ID" = var.app_id
    "WEBHOOK_SECRET" = var.webhook_secret
    "PRIVATE_KEY" = var.private_key
    "COSMOS_CONNECTION_STRING" = azurerm_cosmosdb_account.main.primary_sql_connection_string
    "DATABASE_NAME" = azurerm_cosmosdb_sql_database.main.name
    "APPINSIGHTS_INSTRUMENTATIONKEY" = azurerm_application_insights.main.instrumentation_key
  }
} 

resource "azurerm_application_insights" "main" {
  name                = var.app_insights_name
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  application_type    = "web"
}