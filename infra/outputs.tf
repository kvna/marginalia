output "resource_group_name" {
  value = azurerm_resource_group.main.name
}

output "container_app_fqdn" {
  value = azurerm_container_app.api.latest_revision_fqdn
}

output "static_web_app_default_hostname" {
  value = azurerm_static_web_app.web.default_host_name
}

output "cosmosdb_account_name" {
  value = azurerm_cosmosdb_account.main.name
}

output "onedrive_consent_app_client_id" {
  value       = azuread_application.onedrive_consent.client_id
  description = "Set as the OAuth client ID in the frontend's OneDrive connect flow."
}

output "github_actions_client_id" {
  value       = azuread_application.github_actions.client_id
  description = "Set as the AZURE_CLIENT_ID repository variable for the infra-plan workflow."
}
