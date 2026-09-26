# Container Apps environments require a Log Analytics workspace. The first
# 5GB/month of ingestion is a standing Azure Monitor free grant per
# workspace; a personal app's logs won't come close. See architecture doc
# for why this is the one line-item worth re-checking if usage grows.
resource "azurerm_log_analytics_workspace" "main" {
  name                = "log-marginalia"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  sku                 = "PerGB2018"
  retention_in_days   = 30
  tags                = var.tags
}

resource "azurerm_container_app_environment" "main" {
  name                       = "cae-marginalia"
  resource_group_name        = azurerm_resource_group.main.name
  location                   = azurerm_resource_group.main.location
  log_analytics_workspace_id = azurerm_log_analytics_workspace.main.id
  tags                       = var.tags
}

# The API and hub-view backend. minReplicas = 0 is the whole point: no
# request, no running container, no compute bill between visits.
resource "azurerm_container_app" "api" {
  name                         = "ca-marginalia-api"
  container_app_environment_id = azurerm_container_app_environment.main.id
  resource_group_name          = azurerm_resource_group.main.name
  revision_mode                = "Single"
  tags                         = var.tags

  template {
    min_replicas = 0
    max_replicas = 2

    container {
      name   = "api"
      image  = var.container_image
      cpu    = 0.5
      memory = "1Gi"
    }
  }

  ingress {
    external_enabled = true
    target_port      = 8000

    traffic_weight {
      percentage      = 100
      latest_revision = true
    }
  }

  identity {
    type = "SystemAssigned"
  }
}

# On-demand PDF reference extraction, run as a Job rather than a service.
# A book triggers one run; there is no replica sitting idle between books,
# and nothing here bills outside the seconds a run actually takes.
resource "azurerm_container_app_job" "extraction" {
  name                         = "caj-marginalia-extract"
  resource_group_name          = azurerm_resource_group.main.name
  location                     = azurerm_resource_group.main.location
  container_app_environment_id = azurerm_container_app_environment.main.id
  tags                         = var.tags

  replica_timeout_in_seconds = 900
  replica_retry_limit        = 1

  manual_trigger_config {
    parallelism              = 1
    replica_completion_count = 1
  }

  template {
    container {
      name   = "extract"
      image  = var.extraction_job_image
      cpu    = var.extraction_job_cpu
      memory = var.extraction_job_memory
    }
  }

  identity {
    type = "SystemAssigned"
  }
}
