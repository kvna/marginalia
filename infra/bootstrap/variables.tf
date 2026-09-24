variable "location" {
  type        = string
  description = "Azure region for the state storage account and budget's resource group."
  default     = "uksouth"
}

variable "alert_email" {
  type        = string
  description = "Where budget threshold notifications are sent."
}

variable "budget_amount_gbp" {
  type        = number
  description = "Monthly spend, in GBP, that trips the alert thresholds. Not an enforced cap — Azure budgets alert, they don't stop spend."
  default     = 5
}

variable "budget_start_date" {
  type        = string
  description = "RFC3339 timestamp for the first day of the month the budget period starts from, e.g. \"2026-10-01T00:00:00Z\"."
}

variable "state_storage_account_name" {
  type        = string
  description = "Globally-unique storage account name for Terraform state. 3-24 lowercase alphanumeric characters."
}

variable "tags" {
  type = map(string)
  default = {
    project    = "marginalia"
    managed_by = "terraform"
  }
}
