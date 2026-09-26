terraform {
  required_version = ">= 1.9.0"
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 4.0"
    }
    azuread = {
      source  = "hashicorp/azuread"
      version = "~> 3.0"
    }
  }

  # Filled in at `terraform init` time with -backend-config flags, using
  # the outputs from bootstrap/. Left partial here so no account-specific
  # values are committed to the repo.
  backend "azurerm" {
    container_name = "tfstate"
    key            = "marginalia.tfstate"
  }
}

provider "azurerm" {
  features {}
}

provider "azuread" {}
