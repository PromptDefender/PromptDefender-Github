output "storage_account_name" {
  value = azurerm_storage_account.main.name
}

output "queue_name" {
  value = azurerm_storage_queue.main.name
}

output "nodejs_function_app_name" {
  value = azurerm_function_app.nodejs.name
}

output "python_function_app_name" {
  value = azurerm_function_app.python.name
}

output "key_vault_name" {
  value = azurerm_key_vault.main.name
}

output "app_insights_instrumentation_key" {
  value = azurerm_application_insights.main.instrumentation_key
}
