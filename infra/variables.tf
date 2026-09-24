variable "location" {
  type        = string
  description = "Azure region for data and compute. uksouth: lowest latency to the user, and where Cosmos DB, Container Apps and Log Analytics are all available."
  default     = "uksouth"
}

variable "static_web_app_location" {
  type        = string
  description = "Azure Static Web Apps is only offered in a handful of regions; uksouth isn't one. westeurope is the nearest supported region — the CDN in front of it still serves the UK at the edge."
  default     = "westeurope"
}

variable "resource_group_name" {
  type    = string
  default = "rg-marginalia"
}

variable "container_image" {
  type        = string
  description = "API container image. Defaults to a public placeholder so `plan` and `validate` work before the API exists; swap for ghcr.io/kvna/marginalia-api:<tag> once it's built."
  default     = "mcr.microsoft.com/azuredocs/containerapps-helloworld:latest"
}

variable "extraction_job_image" {
  type        = string
  description = "Reference-extraction job image. Same placeholder-default reasoning as container_image."
  default     = "mcr.microsoft.com/azuredocs/containerapps-helloworld:latest"
}

variable "extraction_job_cpu" {
  type        = number
  description = "vCPU allocated per extraction job run. Provisional pending the Backend & Data Engineer's measured figure from the extraction spike (SUP-4) — 1 vCPU / 2Gi is a generous placeholder for a pypdf/pdfplumber pass plus an LLM call over one book, not a measured number."
  default     = 1.0
}

variable "extraction_job_memory" {
  type        = string
  description = "Memory allocated per extraction job run, Container Apps format (e.g. \"2Gi\"). See extraction_job_cpu for provenance."
  default     = "2Gi"
}

variable "github_repository" {
  type        = string
  description = "GitHub org/repo, used in the OIDC federated credential's subject claim."
  default     = "kvna/marginalia"
}

variable "state_resource_group_name" {
  type        = string
  description = "Resource group from bootstrap/ holding the Terraform state storage account — looked up so the GitHub Actions identity can be granted access to it."
  default     = "rg-marginalia-state"
}

variable "state_storage_account_name" {
  type        = string
  description = "Storage account name from bootstrap/ (must match what was passed to bootstrap's state_storage_account_name)."
}

variable "tags" {
  type = map(string)
  default = {
    project    = "marginalia"
    managed_by = "terraform"
  }
}
