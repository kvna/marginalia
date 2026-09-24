# Separate app registration from the OneDrive consent app: this one is a
# workload identity for GitHub Actions, not a user-facing consent client.
# A federated credential lets GitHub exchange its own OIDC token for an
# Azure token per workflow run — no client secret is ever generated,
# stored, or rotated.
resource "azuread_application" "github_actions" {
  display_name = "marginalia-github-actions"
}

resource "azuread_service_principal" "github_actions" {
  client_id = azuread_application.github_actions.client_id
}

resource "azuread_application_federated_identity_credential" "github_actions_main" {
  application_id = azuread_application.github_actions.id
  display_name   = "github-actions-main-branch"
  audiences      = ["api://AzureADTokenExchange"]
  issuer         = "https://token.actions.githubusercontent.com"
  subject        = "repo:${var.github_repository}:ref:refs/heads/main"
}

resource "azuread_application_federated_identity_credential" "github_actions_pr" {
  application_id = azuread_application.github_actions.id
  display_name   = "github-actions-pull-request"
  audiences      = ["api://AzureADTokenExchange"]
  issuer         = "https://token.actions.githubusercontent.com"
  subject        = "repo:${var.github_repository}:pull_request"
}

# Scoped to the two resource groups this identity actually needs to touch —
# not subscription-wide — so a compromised workflow run can't reach outside
# Marginalia's own resources.
resource "azurerm_role_assignment" "github_actions_rg" {
  scope                = azurerm_resource_group.main.id
  role_definition_name = "Contributor"
  principal_id         = azuread_service_principal.github_actions.object_id
}

data "azurerm_client_config" "current" {}

# The state storage account is created by infra/bootstrap/, in a separate
# state file. A `data "azurerm_storage_account"` lookup here would read it at
# plan time and fail against an empty subscription — which breaks the
# reproducible-from-empty requirement, since this module could then only be
# planned *after* bootstrap was applied. A storage account's resource ID is
# fully deterministic from subscription + resource group + name, so we build
# it rather than look it up. The role assignment still fails at apply time if
# the account genuinely doesn't exist, which is the correct ordering anyway.
locals {
  state_storage_account_id = "/subscriptions/${data.azurerm_client_config.current.subscription_id}/resourceGroups/${var.state_resource_group_name}/providers/Microsoft.Storage/storageAccounts/${var.state_storage_account_name}"
}

resource "azurerm_role_assignment" "github_actions_state" {
  scope                = local.state_storage_account_id
  role_definition_name = "Storage Blob Data Contributor"
  principal_id         = azuread_service_principal.github_actions.object_id
}
