# Lantern OS Architecture

Current release shape: local-first Node.js app, static public mirror, local
runtime data.

## Lantern Garage

`apps/lantern-garage/server.js` is the canonical runtime. It serves the UI from
`apps/lantern-garage/public/` and exposes Dream Journal, status, RAG cache,
conversation, and operator note routes.

Default local address:

```text
http://127.0.0.1:4177
```

Launch from the repo root:

```bash
npm start
```

## Public Mirror

`apps/lantern-garage/cloud-server.js` is a reduced public mirror server used for
read-only/public routes. Local controls and dispatch actions remain held there.

Static public files are also published from `apps/lantern-garage/public/` and
`surfaces/` to GitHub Pages.

## Data Model

There is no database. Runtime state is append-only local JSON/JSONL under
ignored `data/` paths:

- dream journal entries
- conversation logs
- RAG cache records
- operator notes
- validation receipts

The release repo tracks `data/README.md` only.

## Validation

Primary checks:

```bash
npm run check
npm test
npm run validate
```

Python/MCP checks are run only when the touched code requires them.
