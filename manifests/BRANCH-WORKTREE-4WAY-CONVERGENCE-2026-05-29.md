# Branch and Worktree 4-Way Convergence

Status: active convergence plan  
Generated: 2026-05-29  
Scope: local repo branches, PR refs, worktrees, and dirty source trees  
Style spine: `docs/ORION-MOOKMANREPORT4-STYLE.md`

---

## Simple Answer

Lantern OS now has a cross-platform convergence pass for agents that cannot run
Windows PowerShell. The pass keeps the first-screen answer human-readable, then
surveys the repo in four lanes: newest open issues, PR refs, newest branches,
and dirty worktrees.

This is a validation and planning lane. It does not rewrite branches, reset
worktrees, force-push, or import dirty source repos.

---

## What It Actually Does

| Lane | Action | Boundary |
|---|---|---|
| Newest open issues | Keep `manifests/github-open-issues-master-backlog.md` as the issue intake map | Do not close issues until the underlying work is done |
| PR refs | Surface local PR-style refs when present | Do not fabricate PR state when no remote refs exist |
| Newest branches | Sort local and remote branches by newest commit date | Do not force-update branches without an operator gate |
| Dirty worktrees | Count current repo dirt and attached worktrees | Do not reset, stash, or overwrite unreviewed state |

The executable path is `scripts/Invoke-LanternConvergenceLoop.py`. It mirrors the
PowerShell convergence checks and adds a Git survey for cloud/Linux work.

---

## Evidence / Source Discipline

- Source path: `scripts/Invoke-LanternConvergenceLoop.py`.
- Receipt path: `manifests/validation/CONVERGENCE-LOOP-LATEST.json`.
- PowerShell source retained: `scripts/Invoke-LanternConvergenceLoop.ps1`.
- Local source repos remain evidence-only until inspected on the operator
  machine:
  - `C:\tmp\human-flourishing-frameworks-scan`
  - `C:\Users\alexp\Documents\gm-agent-orchestrator`

---

## Proven / Held / Local-Only

| State | Item | Notes |
|---|---|---|
| Proven in repo | Cross-platform loop script | Runs with Python 3 in this Linux/cloud checkout |
| Proven in repo | Branch/worktree survey | Reports current branch, worktree list, PR-style refs, and dirty count |
| Held local-only | Windows source repos | Paths are not visible from this container |
| Held local-only | Live MCP health and private disks | Requires operator-machine validation |
| Blocked | Boot mutation | Disk, BCD, firmware, and bootloader mutation remain forbidden |

---

## Next Safe Action

Run the Python loop in cloud/Linux agents and the PowerShell loop on the Windows
operator machine. If either loop reports actionable issues, fix the first 2-4 in
priority order before starting expansion work.

---

## Validation Path

```bash
python3 scripts/Invoke-LanternConvergenceLoop.py --cloud-virtualization --write-json manifests/validation/CONVERGENCE-LOOP-LATEST.json
```

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\Invoke-LanternConvergenceLoop.ps1
```

```bash
git worktree list --porcelain
git branch --all --verbose --verbose --sort=-committerdate
git status --porcelain=v1 --branch
```

---

## Appendices, Raw Commands, Paths, And Receipts

The latest cloud/Linux receipt is stored at
`manifests/validation/CONVERGENCE-LOOP-LATEST.json`. It is a receipt of this
agent run, not proof that the operator's Windows source repos are clean.
