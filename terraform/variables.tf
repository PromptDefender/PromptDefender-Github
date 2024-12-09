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
}

variable "tenant_id" {
  description = "The tenant ID for the Key Vault"
  type        = string
}

variable "subscriptionId" {
  description = "The subscription ID for azure"
  type        = string
}

variable "app_insights_name" {
  description = "The name of the Application Insights resource"
  type        = string
  default = "prompt-shield-app-insights"
}

variable "defender_url" {
  description = "The URL for the Defender service"
  type        = string
}

variable "app_id" {
  description = "The app ID for the Github application service"
  type        = string
}

variable "private_key" {
  description = "The private key for the github application"
  type        = string
}

variable "webhook_secret" {
  description = "The webhook secret for the github application"
  type        = string
}