---
description: Clean up rogue branches, stale tags, and git sprawl. Never run more than 3 diagnostic commands before acting.
---

## Rule: No Audit Loops
After reading branch/tag state **once**, you must either:
1. **Execute** the cleanup script, or
2. **Commit** the audit results to a file and stop.

Do not run `git status`, `git log`, `git diff`, or `git branch -a` more than twice in the same session.

## Steps

1. **Capture state once.**
   ```bash
   git branch -a > /tmp/branch-audit.txt
   git tag -l > /tmp/tag-audit.txt
   git stash list > /tmp/stash-audit.txt
   ```

2. **Classify branches immediately.**
   - `keep` — `master`, `rebase`, active feature branches you own
   - `delete` — orphaned agent branches (`claude/*`, `codex/*`, `devin/*`, `gemini/*`), merged PR branches
   - `review` — feature branches with open PRs

3. **Run the deletion script.**
   ```bash
   node scripts/delete-rogue-branches.js /tmp/branch-audit.txt
   ```
   This script reads the audit file, filters by pattern, and deletes remotes in one batch.

4. **Handle local master divergence.**
   - If local `master` != `origin/master`, reset: `git reset --hard origin/master`
   - Then merge `rebase` via PR (pre-push hook blocks direct push)

5. **Move or retag releases.**
   - Delete old tag: `git push --delete origin v1.0.0` + `git tag -d v1.0.0`
   - Recreate on new HEAD: `git tag v1.0.0 <commit>` + `git push origin v1.0.0`

6. **Clear stashes older than 14 days.**
   - `git stash clear` if all stashes are >14 days old
   - Otherwise `git stash drop stash@{N}` individually with user confirmation

7. **Stop.** Do not run another status check.
