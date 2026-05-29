#!/usr/bin/env python3
"""Cross-platform Lantern OS convergence loop validator.

This mirrors scripts/Invoke-LanternConvergenceLoop.ps1 for cloud/Linux agents that
do not have Windows PowerShell installed, and adds a Git convergence survey for
branches, PR refs, and worktrees without mutating them.
"""

from __future__ import annotations

import argparse
import json
import subprocess
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


def run_git(root: Path, args: list[str]) -> tuple[int, str]:
    proc = subprocess.run(
        ["git", *args],
        cwd=root,
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=False,
    )
    output = proc.stdout.strip()
    if proc.stderr.strip():
        output = f"{output}\n{proc.stderr.strip()}".strip()
    return proc.returncode, output


def add_issue(
    issues: list[dict[str, str]], issue_id: str, severity: str, summary: str, fix: str
) -> None:
    issues.append(
        {"id": issue_id, "severity": severity, "summary": summary, "fix": fix}
    )


def file_contains(root: Path, relative: str, phrase: str) -> bool:
    path = root / relative
    return path.exists() and phrase in path.read_text(
        encoding="utf-8", errors="replace"
    )


def git_survey(root: Path) -> dict[str, Any]:
    status_code, status = run_git(root, ["status", "--porcelain=v1", "--branch"])
    branch_code, branches = run_git(
        root, ["branch", "--all", "--verbose", "--verbose", "--sort=-committerdate"]
    )
    worktree_code, worktrees = run_git(root, ["worktree", "list", "--porcelain"])
    remote_code, remotes = run_git(root, ["remote", "--verbose"])

    branch_lines = (
        [line.strip() for line in branches.splitlines() if line.strip()]
        if branch_code == 0
        else []
    )
    pr_refs = [
        line
        for line in branch_lines
        if "/pull/" in line or "/pr/" in line or " pull/" in line
    ]
    dirty_entries = (
        [line for line in status.splitlines() if line and not line.startswith("##")]
        if status_code == 0
        else []
    )

    worktree_records: list[dict[str, str]] = []
    current: dict[str, str] = {}
    for line in worktrees.splitlines() if worktree_code == 0 else []:
        if not line.strip():
            if current:
                worktree_records.append(current)
                current = {}
            continue
        key, _, value = line.partition(" ")
        current[key] = value
    if current:
        worktree_records.append(current)

    return {
        "status": status,
        "dirtyCount": len(dirty_entries),
        "dirtyEntries": dirty_entries[:20],
        "branchesNewestFirst": branch_lines[:20],
        "branchCountObserved": len(branch_lines),
        "prRefsNewestFirst": pr_refs[:20],
        "prRefCountObserved": len(pr_refs),
        "worktrees": worktree_records,
        "worktreeCountObserved": len(worktree_records),
        "remotes": remotes.splitlines() if remote_code == 0 and remotes else [],
        "priorityOrder": [
            "dirty worktrees",
            "PR refs",
            "newest branches",
            "remotes / source repos",
        ],
        "mutationBoundary": "survey only; no branch, remote, or worktree mutation without operator gate",
    }


def build_result(
    root: Path, fix_window: int, cloud_virtualization: bool
) -> dict[str, Any]:
    issues: list[dict[str, str]] = []
    held: list[dict[str, str]] = []

    required = [
        "README.md",
        "AGENTS.md",
        "docs/CONVERGENCE-LOOP.md",
        "docs/INNOVATOR-EVIDENCE-METHOD.md",
        "docs/V1-READINESS-GATES.md",
        "docs/LANTERN-OS-RECEPTIONIST-CALL-LIST.md",
        "manifests/comet-leap-30day-artifacts.md",
        "manifests/windows-surfaces.md",
        "manifests/dual-boot.md",
        "manifests/open-issues.md",
        "manifests/retired-surfaces.md",
        "manifests/CONVERGENCE-LOOP-AGENT-FLEET.md",
        "manifests/MCP-WORK-SPLIT.md",
        "manifests/validation/CONVERGENCE-FLEET-LATEST.json",
        "scripts/Test-ConvergenceAgentFleet.py",
    ]

    for relative in required:
        if not (root / relative).exists():
            add_issue(
                issues,
                f"MISSING-{relative}",
                "high",
                f"Missing required repo surface: {relative}",
                f"Create {relative} before expansion.",
            )

    phrase_checks = {
        "docs/CONVERGENCE-LOOP.md": [
            "Retire old stuff",
            "fix the first 2-4",
            "12 Steps",
            "Promote, hold, or reject",
        ],
        "manifests/CONVERGENCE-LOOP-AGENT-FLEET.md": [
            "12 convergence-loop steps x 3 agents per step = 36 ring agents",
            "Always-Waiting Ring Contract",
            "poolTarget = 64",
            "design_contract_not_live_worker_proof",
        ],
        "manifests/MCP-WORK-SPLIT.md": [
            "Split Lanes",
            "Private Dependency Boundary",
            "OS Review Gate",
            "No Bulk Remote Push Without Gate",
        ],
        "docs/LANTERN-OS-RECEPTIONIST-CALL-LIST.md": [
            "organization switchboards",
            "Do not add personal phone numbers",
            "Call Receipt",
            "Evidence class: operator_call_receipt",
        ],
    }
    for relative, phrases in phrase_checks.items():
        for phrase in phrases:
            if not file_contains(root, relative, phrase):
                add_issue(
                    issues,
                    f"{Path(relative).stem.upper()}-MISSING-{phrase.replace(' ', '-')}",
                    "medium",
                    f"{relative} missing phrase: {phrase}",
                    f"Update {relative}.",
                )

    if not file_contains(
        root, "docs/INNOVATOR-EVIDENCE-METHOD.md", "Seven smoke check is deprecated"
    ):
        add_issue(
            issues,
            "LEGACY-SEVEN-NOT-RETIRED",
            "high",
            "Legacy Seven path is not clearly deprecated.",
            "Mark Seven as deprecated and point to the convergence loop.",
        )

    for gate in ["Gate 7", "Gate 8", "Gate 9"]:
        if not file_contains(root, "docs/V1-READINESS-GATES.md", gate):
            add_issue(
                issues,
                f"READINESS-MISSING-{gate}",
                "medium",
                f"Readiness gates missing {gate}.",
                "Add the gate to docs/V1-READINESS-GATES.md.",
            )

    source_repos = [
        r"C:\tmp\human-flourishing-frameworks-scan",
        r"C:\Users\alexp\Documents\gm-agent-orchestrator",
    ]
    source_states = []
    for repo in source_repos:
        exists = Path(repo).exists()
        if exists:
            proc = subprocess.run(
                ["git", "-C", repo, "status", "--short"],
                text=True,
                stdout=subprocess.PIPE,
                stderr=subprocess.DEVNULL,
                check=False,
            )
            changed = [line for line in proc.stdout.splitlines() if line.strip()]
            source_states.append(
                {
                    "repo": repo,
                    "exists": True,
                    "dirty": bool(changed),
                    "changedCount": len(changed),
                    "state": "local_dirty" if changed else "local_clean",
                }
            )
        else:
            if not cloud_virtualization:
                add_issue(
                    issues,
                    f"SOURCE-MISSING-{repo}",
                    "medium",
                    f"Source repo missing: {repo}",
                    "Update manifests to current source paths or rerun in cloud mode.",
                )
            source_states.append(
                {
                    "repo": repo,
                    "exists": False,
                    "dirty": False,
                    "changedCount": 0,
                    "state": (
                        "cloud_metadata_only" if cloud_virtualization else "missing"
                    ),
                    "boundary": "Local source tree is not visible here; inspect locally before mutation.",
                }
            )

    held.append(
        {
            "id": "LANTERN-OS-BOOT-001",
            "severity": "blocked",
            "summary": "Actual dual boot installation requires physical operator action.",
            "fix": "Keep held; do not automate disk, BCD, firmware, or bootloader mutation.",
        }
    )
    if cloud_virtualization:
        held.append(
            {
                "id": "LANTERN-OS-CLOUD-LOCAL-001",
                "severity": "held",
                "summary": "Cloud/Linux agents cannot see local-only MCP endpoints, dirty source worktrees, Windows Store apps, or private disks.",
                "fix": "Validate repo invariants here; validate local runtime through Start-LanternLocalControls.ps1 on the operator machine.",
            }
        )

    git_state = git_survey(root)
    return {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "root": str(root),
        "mode": "cloud_virtualization" if cloud_virtualization else "local",
        "method": "Lantern OS 12-step convergence loop",
        "designedRingSlots": 36,
        "elasticPoolTarget": 64,
        "fourWayPriority": [
            "newest open issues",
            "PR refs",
            "newest branches",
            "dirty worktrees",
        ],
        "fleetClaimBoundary": "design contract only; live worker counts require local orchestrator evidence",
        "fixWindow": fix_window,
        "issueCount": len(issues),
        "leadingIssues": issues[:fix_window],
        "held": held,
        "sourceRepos": source_states,
        "gitSurvey": git_state,
        "nextAction": (
            f"Fix the first {min(fix_window, len(issues))} actionable issue(s), then rerun."
            if issues
            else (
                "Cloud repo invariants passed. Run local controls on the operator machine before MCP/local runtime mutation."
                if cloud_virtualization
                else "No local loop issues found. Review held issues and choose the next promotion candidate."
            )
        ),
    }


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Run the cross-platform Lantern OS convergence loop."
    )
    parser.add_argument(
        "--root", default=Path(__file__).resolve().parents[1], type=Path
    )
    parser.add_argument("--fix-window", default=4, type=int)
    parser.add_argument("--cloud-virtualization", action="store_true")
    parser.add_argument("--write-json", type=Path)
    args = parser.parse_args()

    result = build_result(
        args.root.resolve(), args.fix_window, args.cloud_virtualization
    )
    text = json.dumps(result, indent=2)
    if args.write_json:
        target = args.write_json
        if not target.is_absolute():
            target = args.root.resolve() / target
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(text + "\n", encoding="utf-8")
    print(text)
    return 1 if result["issueCount"] else 0


if __name__ == "__main__":
    raise SystemExit(main())
