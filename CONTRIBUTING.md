# Contributing to Lantern OS

## Development Setup

Requirements:

- Node.js 20 or newer
- npm
- Python 3.11 or newer for Python/MCP work
- Ollama is optional for local model fallback

Start the app from the repo root:

```bash
npm install
npm start
```

Lantern Garage runs at `http://127.0.0.1:4177`.

## Testing

Use npm as the primary validation path:

```bash
npm run check
npm test
npm run validate
```

Focused checks:

```bash
npm run test:api
npm run test:chat
npm run test:ui
```

Python tests can be run from the repo root when touching Python code:

```bash
python -m pip install -r requirements.txt
python -m pytest tests -q --tb=short
```

## Repo Contract

Keep release source small and reviewable.

- `apps/` contains application code.
- `src/` contains source modules.
- `tests/` contains automated tests.
- `scripts/` contains active utility scripts.
- `docs/` contains durable documentation.
- `manifests/` contains system manifests.
- `surfaces/` contains static public surfaces.
- `skills/` contains operator skills.
- `data/` is local runtime state and is ignored except `data/README.md`.

Root should stay limited to repo metadata, npm/Python config, README,
CONTRIBUTING, AGENTS, and lockfiles.

## Privacy

Never commit secrets, tokens, private journal entries, local session files, or
operator-specific runtime receipts. Generated journal, conversation, RAG, and
validation files belong under ignored `data/`.

## Branches

- Branch from `master`.
- Open PRs targeting `master`.
- Keep PRs small enough to review.
- Use names such as `fix/dream-journal-test-runner` or
  `chore/release-cleanup`.
