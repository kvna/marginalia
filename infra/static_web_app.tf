# Free tier: 100GB bandwidth/month, free managed SSL, two custom domains.
# A personal app's frontend traffic will never touch that ceiling.
resource "azurerm_static_web_app" "web" {
  name                = "swa-marginalia"
  resource_group_name = azurerm_resource_group.main.name
  location            = var.static_web_app_location
  sku_tier            = "Free"
  sku_size            = "Free"
  tags                = var.tags
}
