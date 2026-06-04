# AGENTS.md - Lantern OS

A focused guide for AI coding agents.

Core principle: be honest about what is real vs. designed. Never fabricate
state.

## Quick Start

```bash
npm install
npm run check
npm test
npm start
```

Python checks, when relevant:

```bash
python -m pip install -r requirements.txt
python -m pytest tests -q --tb=short
```

## Real vs. Design Contract

Real implementations:

- `dream_journal`
- `lucid_dreaming`
- `archive_curator`
- `voice_curator`

Design contract only unless implementation/status proves otherwise:

- Other `skills/*/SKILL.md` entries
- `super_jarvis_fleet`
- `kalshi_bridge`

Do not claim a skill, fleet slot, public route, or MCP tool is live unless it
has been verified from local repo state, local service health, or actual exposed
tool lists.

## Agent Rules

1. Inspect state before edits: git status, relevant files, local service/MCP
   status, queue/task state, and recent logs when applicable.
2. Treat dirty worktrees as high risk. Preserve user changes.
3. Prefer npm for Lantern Garage launch and tests.
4. Keep release source lean. Runtime data stays under ignored `data/`.
5. Make the smallest useful change and validate it.
6. Never commit secrets, tokens, private journal data, or local session files.
7. Streaming uses `/api/dream/stream`.

## Validation

Use the cheapest relevant checks first:

```bash
npm run check
npm run test:api
npm run test:chat
npm run test:ui
npm run validate
```

Report the command evidence, remaining risks, and next action.
