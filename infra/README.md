# infra

Terraform for Marginalia's Azure resources. See
[`docs/architecture.md`](../docs/architecture.md) for the costed design this
implements, the free alternative rejected for each resource, and what's been
validated so far.

**Nothing here has been applied.** `terraform plan` has been run against the
real subscription for both modules below; `terraform apply` requires
explicit user approval on the specific plan first.

**Region: `northeurope` (Ireland)** for everything, with one exception —
the Static Web App is in `westeurope`, because Azure offers Static Web Apps
in only five regions and North Europe isn't one of them. See the Region
section of `docs/architecture.md`.

## Layout

- `bootstrap/` — a separate Terraform state, applied first. Creates the
  budget alert (the first resource created against this subscription) and
  the storage account that holds the root module's remote state. Uses
  local state itself, out of necessity: a backend can't point at a storage
  account that doesn't exist yet.
- `.` (root) — everything else: Container Apps environment, the API app
  (`minReplicas = 0`) and the on-demand extraction Job, Static Web App,
  Cosmos DB (free tier), both Entra ID app registrations (OneDrive consent,
  GitHub Actions OIDC), and the role assignments tying GitHub Actions to
  this subscription without a stored secret.

## Applying (once approved)

```
cd infra/bootstrap
terraform init
terraform plan -var="alert_email=you@example.com" \
  -var="budget_start_date=2026-10-01T00:00:00Z" \
  -var="state_storage_account_name=<globally-unique-name>"
# review, then on approval:
terraform apply <the same plan>

cd ../
terraform init \
  -backend-config="resource_group_name=$(terraform -chdir=bootstrap output -raw state_resource_group_name)" \
  -backend-config="storage_account_name=$(terraform -chdir=bootstrap output -raw state_storage_account_name)"
terraform plan -var="state_storage_account_name=<same name as above>"
# review, then on approval:
terraform apply <the same plan>
```

## Planning the root module before bootstrap exists

The committed backend block points at a storage account that doesn't exist
until bootstrap is applied, so `terraform init` can't reach it. To plan the
root module standalone, drop a local backend override in (it is gitignored):

```
printf 'terraform {\n  backend "local" {}\n}\n' > infra/backend_override.tf
terraform init && terraform plan -var="state_storage_account_name=<name>"
rm infra/backend_override.tf
```

This plans cleanly from a completely empty subscription — 18 to add, no
errors — which is the property being protected.
