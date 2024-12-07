output "storage_account_name" {
  value = azurerm_storage_account.main.name
}

output "nodejs_function_app_name" {
  value = azurerm_function_app.nodejs.name
}

output "key_vault_name" {
  value = azurerm_key_vault.main.name
}

output "app_insights_instrumentation_key" {
  value = azurerm_application_insights.main.instrumentation_key
}
