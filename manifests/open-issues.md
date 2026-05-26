# Open Issues

The convergence loop fixes the first 2-4 actionable issues before expansion.

## Fixed In Loop 1

1. `LANTERN-OS-001`: Repo stopped at skeleton-only staging.
   - Fix: added `docs/CONVERGENCE-LOOP.md`.
   - Status: fixed.

2. `LANTERN-OS-002`: Legacy Seven language could be mistaken for the release
   method.
   - Fix: deprecated Seven path in `docs/INNOVATOR-EVIDENCE-METHOD.md`.
   - Status: fixed.

3. `LANTERN-OS-003`: No runnable local loop existed.
   - Fix: added `scripts/Invoke-LanternConvergenceLoop.ps1`.
   - Status: fixed.

4. `LANTERN-OS-004`: No explicit retire-old-stuff step existed.
   - Fix: added convergence step 5 and readiness gate 7.
   - Status: fixed.

## Held

1. `LANTERN-OS-BOOT-001`: Actual dual boot installation.
   - Reason: requires physical operator action and disk/bootloader mutation.
   - Status: held.

## Fixed in Loop 2

1. `LANTERN-OS-WINDOWS-001`: Convert installed Windows shortcut bundle into a
   reproducible script.
   - Fix: Created `scripts/Invoke-WindowsSurfaceSetup.ps1` for reproducible Windows surface setup.
   - Status: fixed.

2. `LANTERN-OS-DUALBOOT-001`: Create complete dual boot installer bundle.
   - Fix: Created `dual-boot/` directory with:
     - INSTALL-CHECKLIST.md (step-by-step operator guide)
     - Test-DualBootReadiness.ps1 (pre-flight validation)
     - HARDWARE-ASSUMPTIONS.md (compatibility reference)
     - ROLLBACK-GUIDE.md (recovery procedures)
     - NIXOS-CONFIGS.md (config usage guide)
     - README.md (overview and structure)
   - Status: fixed.

## Open

1. `LANTERN-OS-PROMOTE-001`: Promote selected COMET LEAP artifacts into
   `artifacts/` after operator approval.
   - Status: candidate.
   - Next: Review artifacts using Innovator Evidence Method.

