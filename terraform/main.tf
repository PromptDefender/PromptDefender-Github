provider "azurerm" {
  features {}
}

resource "azurerm_resource_group" "main" {
  name     = "github-app-resources"
  location = "East US"
}

resource "azurerm_cosmosdb_account" "main" {
  name                = "githubappcosmosdb"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  offer_type          = "Standard"
  kind                = "GlobalDocumentDB"

  consistency_policy {
    consistency_level = "Session"
  }

  geo_location {
    location          = azurerm_resource_group.main.location
    failover_priority = 0
  }

  capabilities {
    name = "EnableFreeTier"
  }
}

resource "azurerm_cosmosdb_sql_database" "main" {
  name                = "githubAppDatabase"
  resource_group_name = azurerm_resource_group.main.name
  account_name        = azurerm_cosmosdb_account.main.name
}

resource "azurerm_cosmosdb_sql_container" "installations" {
  name                = "Installations"
  resource_group_name = azurerm_resource_group.main.name
  account_name        = azurerm_cosmosdb_account.main.name
  database_name       = azurerm_cosmosdb_sql_database.main.name

  partition_key_path = "/installationId"
  throughput         = 400
}

resource "azurerm_cosmosdb_sql_container" "subscriptions" {
  name                = "Subscriptions"
  resource_group_name = azurerm_resource_group.main.name
  account_name        = azurerm_cosmosdb_account.main.name
  database_name       = azurerm_cosmosdb_sql_database.main.name

  partition_key_path = "/subscriptionId"
  throughput         = 400
}

resource "azurerm_cosmosdb_sql_container" "repository_access" {
  name                = "RepositoryAccess"
  resource_group_name = azurerm_resource_group.main.name
  account_name        = azurerm_cosmosdb_account.main.name
  database_name       = azurerm_cosmosdb_sql_database.main.name

  partition_key_path = "/installationId"
  throughput         = 400
}

resource "azurerm_cosmosdb_sql_container" "usage" {
  name                = "Usage"
  resource_group_name = azurerm_resource_group.main.name
  account_name        = azurerm_cosmosdb_account.main.name
  database_name       = azurerm_cosmosdb_sql_database.main.name

  partition_key_path = "/installationId"
  throughput         = 400
}

resource "azurerm_role_assignment" "cosmosdb_role" {
  scope                = azurerm_cosmosdb_account.main.id
  role_definition_name = "Cosmos DB Account Reader Role"
  principal_id         = azurerm_function_app.main.identity.principal_id
}

resource "azurerm_function_app" "main" {
  name                       = "github-app-function"
  location                   = azurerm_resource_group.main.location
  resource_group_name        = azurerm_resource_group.main.name
  app_service_plan_id        = azurerm_app_service_plan.main.id
  storage_account_name       = azurerm_storage_account.main.name
  storage_account_access_key = azurerm_storage_account.main.primary_access_key
  os_type                    = "linux"
  runtime_stack              = "node"
  identity {
    type = "SystemAssigned"
  }
}

resource "azurerm_app_service_plan" "main" {
  name                = "github-app-service-plan"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  kind                = "FunctionApp"
  reserved            = true

  sku {
    tier = "Dynamic"
    size = "Y1"
  }
}

resource "azurerm_storage_account" "main" {
  name                     = "githubappstorage"
  resource_group_name      = azurerm_resource_group.main.name
  location                 = azurerm_resource_group.main.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
}
