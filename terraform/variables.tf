variable "resource_group_name" {
  description = "The name of the resource group"
  type        = string
}

variable "location" {
  description = "The location of the resources"
  type        = string
}

variable "storage_account_name" {
  description = "The name of the storage account"
  type        = string
}

variable "nodejs_function_app_name" {
  description = "The name of the Node.js function app"
  type        = string
  default    = "prompt-shield-github-app"
}

variable "key_vault_name" {
  description = "The name of the Key Vault"
  type        = string
  default    = "ghactionskv"
}

variable "tenant_id" {
  description = "The tenant ID for the Key Vault"
  type        = string
}

variable "webhook_secret" {
  description = "The webhook secret"
  type        = string
}

variable "private_key" {
  description = "The private key"
  type        = string
}

variable "app_insights_name" {
  description = "The name of the Application Insights resource"
  type        = string
}

variable "defender_url" {
  description = "The URL for the Defender service"
  type        = string
}
