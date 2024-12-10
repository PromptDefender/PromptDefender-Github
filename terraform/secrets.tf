resource "random_string" "suffix" {
  length  = 8
  special = false
}

# resource "azurerm_key_vault" "main" {
#   name                =  "${var.key_vault_name}-${random_string.suffix.result}"
#   location            = azurerm_resource_group.main.location
#   resource_group_name = azurerm_resource_group.main.name
#   tenant_id           = var.tenant_id
#   sku_name            = "standard"

#   depends_on = [
#     azurerm_linux_function_app.nodejs
#   ]

#   access_policy {
#     tenant_id = data.azurerm_client_config.current.tenant_id
#     object_id = azurerm_linux_function_app.nodejs.identity[0].principal_id

#     secret_permissions = [
#       "Get",
#     ]
#   }

#   access_policy {
#     tenant_id = data.azurerm_client_config.current.tenant_id
#     object_id = data.azurerm_client_config.current.object_id

#     secret_permissions = [
#       "Get",
#       "List",
#       "Set",
#       "Delete",
#     ]
#   }

#   network_acls {
#     default_action = "Deny"
#     bypass         = "AzureServices"

#     ip_rules = [
#       "0.0.0.0/0"
#     ]
#   }
# }

# resource "azurerm_key_vault_secret" "webhook_secret" {
#   name         = "WEBHOOK-SECRET"
#   value        = var.webhook_secret
#   key_vault_id = azurerm_key_vault.main.id
# }

# resource "azurerm_key_vault_secret" "private_key" {
#   name         = "PRIVATE-KEY"
#   value        = var.private_key
#   key_vault_id = azurerm_key_vault.main.id
# }

