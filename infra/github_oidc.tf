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

data "azurerm_storage_account" "tfstate" {
  name                = var.state_storage_account_name
  resource_group_name = var.state_resource_group_name
}

resource "azurerm_role_assignment" "github_actions_state" {
  scope                = data.azurerm_storage_account.tfstate.id
  role_definition_name = "Storage Blob Data Contributor"
  principal_id         = azuread_service_principal.github_actions.object_id
}
