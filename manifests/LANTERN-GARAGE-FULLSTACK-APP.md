# Lantern Garage Full-Stack App

Generated: 2026-05-26.

## Purpose

Turn the Tony Garage cockpit into a local full-stack app with APIs backed by
Lantern repo files.

## Path

```text
apps/lantern-garage/
```

## Commands

Start:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\Start-LanternGarageApp.ps1
```

Validate while running:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\Test-LanternGarageApp.ps1
```

Open:

```text
http://127.0.0.1:4177
```

## APIs

| Endpoint | Use |
|---|---|
| `/api/health` | app health |
| `/api/status` | combined app status |
| `/api/arc-reactor` | confidence state |
| `/api/wallet` | wallet and ledger |
| `/api/readiness` | dual boot readiness |
| `/api/access-model` | public/auth/$20/$200/founder access contract |
| `/api/action-capabilities` | button truth: real, live-link, held, founder-held |
| `/api/operator-feedback` | summarized operator-note and restart-memory feedback receipts |
| `/api/rag-cache` | filtered RAG cache |
| `/api/actions/run-loop` | run convergence loop |
| `/api/actions/local-controls` | run local controls bridge |

## Boundary

This is a local app. It does not mutate disks, fake cash, publish stores, or tag
v1.0.0. It reads repo state and can run existing safe scripts. Buttons must
state whether they are real route-backed actions, live links, held actions, or
founder-held controls; unavailable PowerShell/local controls stay disabled instead
of pretending to run.
