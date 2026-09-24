# Marginalia

Marginalia is a personal book-notes app: you write notes against the books you
read, and it extracts the references between them — citations, mentions, and
borrowed ideas — into a graph, so clusters like a book and everything that
cites it become visible rather than buried across separate PDFs. Files live in
OneDrive; the app never duplicates them into paid storage.

## Repo layout

This is a monorepo — frontend, backend, and infrastructure all live in one
tree so they version and PR together.

```
web/    Next.js + TypeScript frontend (Azure Static Web Apps)
api/    Python backend — PDF reference extraction, data API (Azure Container Apps)
infra/  Terraform for all Azure resources
docs/   Product spec and design notes
```

## Running the pieces

### web/

```
cd web
npm install
npm run dev       # local dev server
npm run lint       # eslint
npm run typecheck  # tsc --noEmit
npm test           # vitest
```

### api/

```
cd api
pip install -e ".[dev]"
ruff check .        # lint
mypy src            # typecheck
pytest               # test
```

### infra/

Terraform lands here once the architecture is settled (see `docs/`). Nothing
in this directory is applied without explicit approval on a specific plan —
see the infra engineer's remit for the cost and scale-to-zero constraints
that govern every resource here.

## Status

This is a skeleton: CI runs lint/typecheck/test on both `web/` and `api/`,
but there's no product code yet. See `docs/` for the product spec as it lands.
