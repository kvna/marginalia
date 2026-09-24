# App registration for the OneDrive / Microsoft Graph consent flow.
# Delegated scopes only — the app reads a token via standard OAuth consent,
# never handles storage account keys, and never sees more of OneDrive than
# the user grants.
resource "azuread_application" "onedrive_consent" {
  display_name     = "Marginalia"
  sign_in_audience = "AzureADandPersonalMicrosoftAccount"

  # v2 tokens are mandatory once personal Microsoft accounts are in the
  # sign-in audience — the v1 endpoint doesn't support them.
  api {
    requested_access_token_version = 2
  }

  required_resource_access {
    resource_app_id = "00000003-0000-0000-c000-000000000000" # Microsoft Graph

    resource_access {
      id   = "5c28f0bf-8a70-41f1-8ab2-9032436ddb65" # Files.ReadWrite (delegated)
      type = "Scope"
    }

    resource_access {
      id   = "e1fe6dd8-ba31-4d61-89e7-88639da4683d" # User.Read (delegated)
      type = "Scope"
    }
  }

  web {
    redirect_uris = ["https://${azurerm_static_web_app.web.default_host_name}/auth/callback"]
  }
}

resource "azuread_service_principal" "onedrive_consent" {
  client_id = azuread_application.onedrive_consent.client_id
}
