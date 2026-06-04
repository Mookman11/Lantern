# Lantern OS

Lantern OS is a local-first Dream Journal and operator cockpit. The release
runtime is the Node.js Lantern Garage app in `apps/lantern-garage`.

## Current Release Surface

| Surface | Status | Notes |
|---|---|---|
| Lantern Garage | Active | Local HTTP app on `http://127.0.0.1:4177` |
| Dream Journal | Active | Journal UI plus `/dream-chat.html` agent chat backed by local JSONL files. Chat must return a configured-provider or local fallback agent response, or fail explicitly with evidence. |
| Public mirror | Read-only | Static GitHub Pages mirror for public surfaces only |
| MCP/orchestrator | Local-held | Verify local health and exposed tools before trusting any remote route |

Private journal entries, notes, RAG cache records, and runtime receipts are
written under `data/` and ignored by Git.

## Requirements

- Node.js 20 or newer
- npm
- Python 3.11 or newer for Python/MCP tests and scripts

## Run Locally

```bash
npm install
npm start
```

Open `http://127.0.0.1:4177` for the journal dashboard.

Open `http://127.0.0.1:4177/dream-chat.html` for Dream Journal chat. AI
interpretation is required for chat requests: it must answer through a
configured provider or local fallback agent, or report an explicit failure.

Useful npm commands:

```bash
npm run dev
npm run check
npm run validate
npm test
npm run test:api
npm run test:chat
npm run test:ui
```

`npm test` starts Lantern Garage if needed, waits for `/api/health`, runs the
API/chat/UI tests, and shuts down the server it started.

## Local Data

`data/` is local runtime state, not release source. The app recreates needed
subdirectories when it writes journal entries, conversations, RAG cache records,
or validation receipts.

## Public Mirror

The GitHub Pages mirror serves static public files. It is not the private app
runtime and does not carry local journal data.

## What Is Not In Scope

- No live trading or financial execution.
- No production payment integration.
- No private journal sync by default.
- No remote dispatch without local MCP/tool verification.

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).
