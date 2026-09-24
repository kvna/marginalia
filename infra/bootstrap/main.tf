terraform {
  required_version = ">= 1.9.0"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
  }
}

provider "azurerm" {
  features {}
}

data "azurerm_subscription" "current" {}

resource "azurerm_resource_group" "state" {
  name     = "rg-marginalia-state"
  location = var.location
  tags     = var.tags
}

# The first resource created against this subscription for Marginalia: an
# email alert at three spend thresholds, so a runaway resource is caught
# before it matters. Everything else — here and in the root module — is
# applied after this exists.
resource "azurerm_monitor_action_group" "budget_alert" {
  name                = "ag-marginalia-budget"
  resource_group_name = azurerm_resource_group.state.name
  short_name          = "marginbudget"

  email_receiver {
    name          = "owner"
    email_address = var.alert_email
  }
}

resource "azurerm_consumption_budget_subscription" "marginalia" {
  name            = "budget-marginalia-monthly"
  subscription_id = data.azurerm_subscription.current.id

  amount     = var.budget_amount_gbp
  time_grain = "Monthly"

  time_period {
    start_date = var.budget_start_date
  }

  # Azure budgets have no spend-stop primitive — these are alerts, not caps.
  # Three rungs: half of budget actually spent, 90% actually spent, and the
  # month's forecast alone crossing the limit, so a bad LLM loop during
  # extraction shows up before the invoice does.
  notification {
    enabled        = true
    threshold      = 50
    operator       = "GreaterThan"
    threshold_type = "Actual"
    contact_emails = [var.alert_email]
  }

  notification {
    enabled        = true
    threshold      = 90
    operator       = "GreaterThan"
    threshold_type = "Actual"
    contact_emails = [var.alert_email]
  }

  notification {
    enabled        = true
    threshold      = 100
    operator       = "GreaterThan"
    threshold_type = "Forecasted"
    contact_emails = [var.alert_email]
  }
}

# Remote state storage for the root module. Bootstrapped with local state
# because a backend can't point at a storage account that doesn't exist
# yet — this is the one piece of Marginalia infra deliberately left on
# local state, and it should change rarely if ever after first apply.
resource "azurerm_storage_account" "tfstate" {
  name                     = var.state_storage_account_name
  resource_group_name      = azurerm_resource_group.state.name
  location                 = var.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
  min_tls_version          = "TLS1_2"

  blob_properties {
    versioning_enabled = true
  }

  tags = var.tags
}

resource "azurerm_storage_container" "tfstate" {
  name                  = "tfstate"
  storage_account_id    = azurerm_storage_account.tfstate.id
  container_access_type = "private"
}
