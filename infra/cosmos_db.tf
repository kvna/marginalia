# Free tier (1000 RU/s + 25GB storage, one per subscription, forever free)
# rather than serverless. A personal library's query volume sits nowhere
# near 1000 RU/s, so free tier is a hard £0 where serverless still meters
# every request past its own low volume — see architecture doc for the
# request-unit estimate behind that call.
resource "azurerm_cosmosdb_account" "main" {
  name                = "cosmos-marginalia"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  offer_type          = "Standard"
  kind                = "GlobalDocumentDB"
  free_tier_enabled   = true
  tags                = var.tags

  consistency_policy {
    consistency_level = "Session"
  }

  geo_location {
    location          = azurerm_resource_group.main.location
    failover_priority = 0
  }
}

# Shared database-level throughput (1000 RU/s = the entire free grant)
# rather than per-container throughput, so both containers below draw from
# the same free pool instead of needing 1000 RU/s each.
resource "azurerm_cosmosdb_sql_database" "marginalia" {
  name                = "marginalia"
  resource_group_name = azurerm_resource_group.main.name
  account_name        = azurerm_cosmosdb_account.main.name
  throughput          = 1000
}

resource "azurerm_cosmosdb_sql_container" "works" {
  name                = "works"
  resource_group_name = azurerm_resource_group.main.name
  account_name        = azurerm_cosmosdb_account.main.name
  database_name       = azurerm_cosmosdb_sql_database.marginalia.name
  partition_key_paths = ["/id"]
}

# Edges partitioned by the work they point AT, not the work they come
# from. "Referenced by" / hub-detection — sizing graph nodes by inbound
# count — is the query the hub views actually run, so it should be the
# cheap single-partition read, not a cross-partition fan-out.
resource "azurerm_cosmosdb_sql_container" "edges" {
  name                = "edges"
  resource_group_name = azurerm_resource_group.main.name
  account_name        = azurerm_cosmosdb_account.main.name
  database_name       = azurerm_cosmosdb_sql_database.marginalia.name
  partition_key_paths = ["/toWorkId"]
}
