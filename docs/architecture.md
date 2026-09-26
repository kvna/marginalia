# Marginalia — Azure architecture and costed Terraform design

**Status: paper design only. Nothing in `infra/` has been applied. No Azure
resource exists because of this document.** Every number below is either a
live Azure retail price (**North Europe**, pulled from `prices.azure.com` on
2026-09-24) or a stated assumption, never a guess presented as a fact.
GBP figures use the live USD→GBP rate on that date, **1 USD = 0.754513 GBP**.

## Region: North Europe (Ireland)

Per the explicit instruction on SUP-5, **every resource in this design is in
`northeurope`**, with exactly one exception, called out rather than buried:

> **Static Web Apps is deployed to `westeurope`.** Azure Static Web Apps is
> offered in only five regions — Central US, East US 2, West US 2, West
> Europe, East Asia — and North Europe is not one of them. Confirmed against
> the live subscription: `az provider show -n Microsoft.Web
> --query "resourceTypes[?resourceType=='staticSites'].locations"` returns
> exactly those five. West Europe is the nearest supported region. This is a
> control-plane region only — Static Web Apps serves content from a global
> CDN edge regardless — and the resource is free in either region, so there
> is no cost or latency consequence. If a future Azure release adds North
> Europe, it is a one-line change to `static_web_app_location`.

North Europe is also the *cheaper* choice for the meter that matters most
here: Container Apps active vCPU is **$0.000024/vCPU-second** in North Europe
against **$0.000034** in UK South (~29% lower), and active memory
**$0.000003/GiB-second** against **$0.000004**. Nothing about this design is
worse for being in Ireland.

**Nothing has been deployed to any region.** There is no installation to
move or delete — no `terraform apply` has been run at any point in this task,
so there is no resource in UK South, North Europe, or anywhere else.

## Bottom line

**Steady-state Azure spend: £0.00/month**, for a personal-scale library
(tens of books, occasional browsing, one extraction run per book added).
The only genuinely variable cost is LLM calls during reference extraction,
and those are billed by the LLM provider directly — not through Azure —
unless a future decision routes them through Azure OpenAI, which nothing
here currently does. That lands inside the £0–2/month target with margin
to spare; the honest caveat is *how much* margin depends on usage actually
staying personal-scale, detailed resource by resource below.

## Table: monthly cost per resource

| Resource | Monthly cost | Free alternative rejected, and why |
|---|---|---|
| Container Apps (API), `minReplicas=0` | £0.00 | — this *is* the free-tier-shaped choice |
| Container Apps Job (extraction), on-demand | £0.00 | Dedicated VM/VMSS — bills 24/7 whether a book is being parsed or not |
| Static Web Apps (frontend) | £0.00 | — Free tier is the free alternative |
| Cosmos DB, free tier | £0.00 | Serverless (still £0 at this volume, but meters every request past a threshold); Postgres Flexible Server B1MS (**£9.91/month** compute alone in North Europe, cannot scale to zero) |
| Log Analytics workspace | £0.00 (within 5GB/month free grant) | Disabling logging entirely — rejected, you'd lose the only visibility into cold starts and job failures |
| Entra ID app registrations ×2 | £0.00 | — Entra ID Free tier covers app registrations, delegated consent, and federated credentials |
| Budget alert + action group | £0.00 | — no paid alternative exists; Azure Monitor budgets are free |
| Terraform state storage (Blob, Hot LRS) | £0.00 (a ~100KB state file at $0.022/GB-month in North Europe is $0.000002/month) | Terraform Cloud free tier — rejected only because it adds a second platform/account to manage for one state file |
| Container image registry | £0.00 (GHCR, public repo) | Azure Container Registry Basic — £3.83/month for something GHCR does free here |
| GitHub Actions CI/CD | £0.00 (public repo = unlimited free minutes) | — |
| **Total, steady state** | **£0.00/month** | |
| LLM calls during extraction | variable, outside Azure billing | — |

Every line is computed below, not asserted.

---

## Compute — Azure Container Apps, `minReplicas = 0`

**Rejected alternative: App Service (even the free F1 tier) or a VM.** App
Service's free tier has no scale-to-zero — it's a shared-compute quota, not
a request-triggered runtime, and the paid tiers bill 24/7 regardless of
traffic. A VM bills for every hour it exists. Container Apps' Consumption
plan is the only Azure compute option that is both a public HTTPS endpoint
*and* genuinely bills nothing while idle.

**Pricing (North Europe, confirmed via the Azure Retail Prices API):**

| Meter | Price (North Europe) | UK South, for comparison |
|---|---|---|
| vCPU, active | $0.000024 / vCPU-second | $0.000034 |
| Memory, active | $0.000003 / GiB-second | $0.000004 |
| Requests | $0.40 / million | $0.40 |
| vCPU / memory, idle (allocated but not processing a request) | $0.000003 / vCPU-second, $0.000003 / GiB-second | $0.000004 / $0.000004 |

**Free grant, per subscription per month** (confirmed against the current
Azure Container Apps pricing page): the first **180,000 vCPU-seconds**,
**360,000 GiB-seconds**, and **2,000,000 requests** are free. This grant is
shared across every Container App *and* Container App Job in the
subscription — it isn't per-resource.

**Cold start.** `minReplicas = 0` means the first request after idle pays a
cold-start latency — typically low single-digit seconds for a small image
on the Consumption plan. That's the deliberate trade the issue calls
acceptable for a personal app; there is no cost implication either way,
since idle replicas at `minReplicas=0` are not allocated at all (no idle
vCPU/memory charge — that idle meter above applies to a warm-but-unused
*allocated* replica, which doesn't exist when replica count is zero).

**Worked estimate — API (hub views, notes, search):** even a generous
personal-use figure of 10,000 requests/month, each doing 0.5 vCPU / 1GiB
of work for 200ms:

- vCPU-seconds: 10,000 × 0.5 × 0.2 = 1,000 (0.6% of the 180,000 free grant)
- GiB-seconds: 10,000 × 1 × 0.2 = 2,000 (0.6% of the 360,000 free grant)
- Requests: 10,000 (0.5% of the 2M free grant)

Comfortably inside the free grant on its own. **Cost: £0.00.**

## Reference extraction — Container Apps Job, on-demand

This is a Job, not a service: it runs once per book added, and exits. No
replica idles between books — there is nothing to bill in the gap.

**CPU/memory figure — provisional, flagged clearly.** The Backend & Data
Engineer's extraction spike (SUP-4) hasn't reported a measured figure yet
at the time of writing. The Terraform (`infra/variables.tf`,
`extraction_job_cpu` / `extraction_job_memory`) defaults to **1 vCPU / 2Gi**
as a deliberately generous placeholder for a `pypdf`/`pdfplumber` pass plus
one LLM call over a single book — swap the default for their measured
number before the job is first actually run. Whatever the real number
turns out to be, the free-grant headroom below is wide enough to absorb a
meaningfully bigger figure without leaving £0.

**Worked estimate at the placeholder spec**, 20 books added in a month
(a fast pace for a personal library), 3 minutes (180s) parse+LLM time each:

- vCPU-seconds: 20 × 1 × 180 = 3,600
- GiB-seconds: 20 × 2 × 180 = 7,200

Added to the API's usage above (1,000 / 2,000), total subscription usage
is ~4,600 vCPU-seconds (2.6% of 180,000) and ~9,200 GiB-seconds (2.6% of
360,000). **Cost: £0.00**, with roughly 35× headroom left in the vCPU-second
grant before this job alone would need a genuinely heavier spec (e.g. 4
vCPU, 10-minute parses, 100 books/month) to spill into paid usage. That
headroom is the actual answer to "what if the real CPU/memory number from
SUP-4 is bigger than the placeholder" — it would need to be dramatically
bigger, not just somewhat bigger, before this stops being free.

**The sanity check that doesn't rely on the free grant at all.** If Azure
withdrew the monthly grant tomorrow, that same combined usage priced at
North Europe retail would be: 4,600 vCPU-s × $0.000024 = **$0.110**, 9,200
GiB-s × $0.000003 = **$0.028**, 10,000 requests = **$0.004**. Total
**$0.142/month ≈ £0.11/month**. So the £0.00 headline isn't balanced on the
free grant being permanent — the underlying compute is worth about eleven
pence a month at this usage. That is the number to hold onto if the grant
ever changes.

**Rejected alternative: Azure Batch or a dedicated VM for parsing.** Both
bill for provisioned compute whether or not a book is being parsed; a Job
on the Consumption plan bills only the seconds it actually runs.

---

## Hosting — Azure Static Web Apps, Free tier

£0.00. 100GB bandwidth/month, free managed SSL, two custom domains, a
personal app's traffic will not approach that ceiling.

**The one region exception, repeated here where it applies:** Static Web
Apps is only offered in five regions — Central US, East US 2, West US 2,
West Europe, East Asia — and **North Europe is not one of them** (confirmed
via `az provider show -n Microsoft.Web` against the live subscription).
Every other resource in this design sits in `northeurope`; the Static Web
App is deployed to **West Europe**, the nearest supported region. Its global
CDN serves from the edge regardless of control-plane region, and the
resource is free either way, so this costs nothing and changes no latency
the user would notice. See the Region section at the top for the full
reasoning.

**Rejected alternative: none, really** — Static Web Apps free tier already
*is* the free alternative to itself. The only other option (Container Apps
serving a built frontend) would trade a genuinely free static host for one
metered by requests, for no benefit.

---

## Data — Cosmos DB, free tier vs serverless vs Postgres

**Recommendation: free tier, not serverless.**

Confirmed via the Retail Prices API: Cosmos DB's free tier gives **1000
RU/s of provisioned throughput and 25GB of storage, entirely free,
indefinitely, one account per subscription** (`100 RU/s | Free Tier |
$0.00` and `Data Stored | Free Tier | $0.00/GB-month`, both real meter
rows, not marketing copy; both confirmed present in `northeurope`).
Serverless is priced per request unit consumed — `1M RUs | $0.283` in North
Europe (it was $0.297 in UK South), plus `$0.25/GB-month` storage —
and is genuinely close to free at personal-library volume too, but it's
*metered* rather than *free*, and the free tier is available at no cost up
to a ceiling a personal note-and-graph app won't reach. Free tier wins on
the actual criterion (cost), not on architectural purity.

**Graph-query pattern check** (per the collaboration note to take this from
the Backend & Data Engineer): the hub views need two query shapes —
*References out* (from a work, fetch its outbound edges) and *Referenced
by* (from a work, fetch inbound edges — the query that makes hub nodes
visible by inbound count). The Terraform models this as two containers on
shared database throughput:

- `works` — partitioned by `/id`.
- `edges` — partitioned by **`/toWorkId`**, not `/fromWorkId`. "Referenced
  by" is the query the graph view actually runs to size nodes, and
  partitioning by the edge's target makes that a single-partition point
  query rather than a cross-partition fan-out. "References out" (by
  `fromWorkId`) becomes a cross-partition query, which is the right
  trade — it's the less critical direction per the product spec, and at
  this data volume (a personal library's edge count) a cross-partition
  query still costs single-digit RUs, nowhere near 1000 RU/s.

This is a plain NoSQL container design, not Cosmos DB's Gremlin (graph)
API. **Rejected: Gremlin API** — it requires a dedicated throughput
allocation with a materially higher RU floor for the same free-tier ceiling
to matter, for a graph this small; a document container with an
edge-list and the right partition key answers the same two queries more
cheaply.

**Rejected: Postgres Flexible Server**, per the issue's own steer, now with
a real North Europe number rather than "roughly": Burstable **B1MS** is
**$0.018/hour** in North Europe (confirmed via Retail Prices API,
`Azure Database for PostgreSQL Flexible Server Burstable`) — $0.018 × 730
hours/month = **$13.14/month ≈ £9.91/month** for the compute alone, before
its mandatory minimum storage allocation and backup storage
(`$0.095/GB-month` beyond the free allowance) add more. So the issue's
"roughly £10–12/month" estimate was accurate; the real floor is just under
£10. It also **cannot scale to zero** — it's billed by the hour whether the
app is used or not, which is disqualifying against this design's hard
scale-to-zero requirement, independent of cost.

---

## Book files — OneDrive via Microsoft Graph, not Azure Storage

£0.00 marginal cost. The app stores a file *reference* (a Graph drive-item
ID), not the bytes — the PDF stays in OneDrive, in whatever quota the user
already pays for outside Azure. **Rejected: Azure Blob Storage** for the
PDFs themselves — it would duplicate a file the user already has stored
elsewhere, at real (if small) additional storage cost, and lock the file
inside an app-managed account instead of a folder the user can open
directly in Explorer or the OneDrive app.

**Entra ID app registration** (`infra/entra_id.tf`) — free. One app
registration, delegated Microsoft Graph scopes only (`Files.ReadWrite`,
`User.Read`), `sign_in_audience =
"AzureADandPersonalMicrosoftAccount"` so it works whether the OneDrive in
question is a personal Microsoft account or a Microsoft 365 / Entra tenant
account. The app never receives storage account keys or app-only Graph
permissions — only a delegated token scoped to what the signed-in user
consents to.

---

## CI/CD — GitHub Actions with OIDC, no long-lived secrets

£0.00. The repo (`kvna/marginalia`) is public (a decision the
Infrastructure Engineer made and flagged during the CI-skeleton task, to
get branch protection without paying for GitHub Pro), which means GitHub
Actions minutes are **unlimited and free**, not just within a monthly
quota.

**No client secret anywhere.** `infra/github_oidc.tf` creates a second,
separate Entra ID app registration (deliberately not the same one used for
OneDrive consent — a workload identity and a user-consent client are
different concerns) with a **federated identity credential**: GitHub's own
OIDC token, issued per workflow run, is exchanged directly for an Azure
token. `.github/workflows/infra-plan.yml` runs `terraform plan` (never
apply) on every PR touching `infra/`, authenticating via
`ARM_USE_OIDC=true` and repo *variables* (not secrets — a client ID and
tenant ID aren't sensitive once federation restricts them to this repo's
own OIDC subject claim).

The role assignment for this identity is scoped to the two resource groups
Marginalia actually uses (`rg-marginalia`, plus `Storage Blob Data
Contributor` on the state storage account) — not subscription-wide —
so a compromised workflow run can't reach outside this project's own
resources.

**Rejected: a stored `AZURE_CLIENT_SECRET` in repo secrets.** Works, but is
exactly the long-lived-secret pattern the issue asks to avoid — it doesn't
expire on its own, has to be rotated by hand, and is a stored credential
sitting in GitHub rather than a token minted per run.

---

## Budget alert — the first resource

`infra/bootstrap/main.tf` creates, in this order: a resource group for
state + budget infra, an `azurerm_monitor_action_group` (email), and an
`azurerm_consumption_budget_subscription` with three notification
thresholds — 50% and 90% of actual spend, and 100% of *forecasted* spend,
so a runaway LLM loop during extraction would surface as a forecast alert
before it becomes an actual overspend. £0.00 — Azure Monitor budgets and
action groups carry no charge; there is no paid alternative to reject
here, only the option of skipping it, which the issue rules out as a hard
requirement.

This lives in a **separate Terraform state** from the rest of the
infrastructure (`infra/bootstrap/`, not `infra/`), specifically so it can
be applied first, standing alone, before anything that costs money exists
to alert on.

---

## Remote state backend, and reproducibility from empty

**Sequence, to stand this up from an empty subscription:**

1. `cd infra/bootstrap && terraform init && terraform plan` — review, then
   (on approval) `terraform apply`. Creates the budget alert and the
   storage account + container that will hold the root module's state.
   This step necessarily uses **local state** — a remote backend can't
   point at a storage account that doesn't exist yet.
2. `cd infra && terraform init -backend-config="resource_group_name=<from
   step 1 output>" -backend-config="storage_account_name=<ditto>"` — wires
   the root module to remote state in the account just created.
3. `terraform plan`, review, then (on approval) `terraform apply`. Creates
   the resource group, Container Apps environment + API + extraction Job,
   Static Web App, Cosmos DB account + database + containers, both Entra
   ID app registrations, and the GitHub Actions role assignments.

**`terraform destroy` leaves nothing billable behind** in the root module —
everything under `rg-marginalia` goes, plus the two Entra ID app
registrations and their service principals (Entra ID objects aren't billed
regardless, but they shouldn't linger). The bootstrap state/budget stack is
deliberately **not** torn down by the same destroy — it's cheap enough
(effectively £0, per the table above) that leaving it standing between
experiments is the safer default, and it holds the state file for
everything else.

---

## What was actually validated this task

Both Terraform configurations (`infra/bootstrap/` and `infra/`) are real
HCL, not sketches — `terraform validate` passes on both, provider versions
are pinned (`azurerm ~> 4.0`, `azuread ~> 3.0`) with lock files committed
for `linux_amd64` and `darwin_arm64`, and:

- **`infra/bootstrap`**: `terraform plan` ran against the real Azure
  subscription (read-only — a plan does not create anything). Result:
  **5 to add, 0 to change, 0 to destroy** — resource group, action group,
  budget, storage account, container. Clean, with `location = "northeurope"`
  confirmed in the planned output.
- **`infra/`** (root module): planned against the same subscription with a
  temporary local backend override (removed before commit — the committed
  config still points at the real remote backend, which doesn't exist
  until step 1 above runs). Result: **18 to add, 0 to change, 0 to destroy,
  and no errors.** Planned locations, read straight out of the plan:
  `northeurope` for the resource group, Container Apps environment,
  extraction Job, Cosmos DB account and Log Analytics workspace;
  `westeurope` for the Static Web App only, for the region-support reason
  documented above. The Container App's own `location` is
  `(known after apply)` because it inherits from its environment, which is
  `northeurope`.

**Two real bugs were found and fixed by planning** — the reason this was
worth doing rather than writing HCL and calling it designed:

1. `azuread_application` requires `requested_access_token_version = 2` once
   `sign_in_audience` includes personal Microsoft accounts. The plan
   rejected the config until that was added.
2. The GitHub Actions role assignment on the state storage account used a
   `data "azurerm_storage_account"` lookup, which **fails at plan time
   against an empty subscription** — so the root module could only be
   planned *after* bootstrap had been applied, quietly breaking the
   reproducible-from-empty requirement. Replaced with a resource ID
   constructed from subscription + resource group + account name (all
   deterministic). That is what took the root module from "17 to add plus
   an error" to a clean 18.

**No `terraform apply` was run. No resource exists in any region because of
this task.**

## Open items for the user

1. **Confirm the £5/month `budget_amount_gbp` default** in
   `infra/bootstrap/variables.tf` — set to something that would alert well
   before it matters, adjust to taste.
2. **LLM billing path** — this design assumes reference-extraction LLM
   calls go direct to the provider (Anthropic/OpenAI/etc.), not through
   Azure OpenAI, so they sit outside every number above. Confirm that's
   still the plan before the extraction job is built.
3. **`extraction_job_cpu`/`extraction_job_memory`** are placeholders — swap
   for the Backend & Data Engineer's measured figure from SUP-4 once it
   lands.
4. **State storage account name** (`stmarginaliatfstate` used during
   validation) must be globally unique — pick the real value before
   step 1 of the apply sequence above.
5. **`alert_email`** in `infra/bootstrap/` has no default, deliberately —
   the budget alert is worthless going to an address you don't read. Set it
   at apply time.

**Settled, not open:** the region. North Europe (Ireland) throughout, per
the instruction on SUP-5, with Static Web Apps in West Europe as the single
documented exception because Azure does not offer it in North Europe. No
resource has been deployed to any region, so there is nothing to move or
delete.
