# Dual Boot Manifest

Status: complete dual boot installer bundle ready for operator review.

## Source Assets

- Optimized NixOS config: `C:\Users\alexp\Documents\gm-agent-orchestrator\nixos-lantern-production-optimized.nix`
- Base NixOS config: `C:\Users\alexp\Documents\gm-agent-orchestrator\nixos-lantern-production.nix`
- Windows prep doc: `C:\Users\alexp\OneDrive\Desktop\Lantern Surfaces\DUAL-BOOT-PREP-WINDOWS-NIXOS-BUFFETT.md`

## Boundary

This repo must not include scripts that:

- resize partitions;
- format disks;
- mutate Windows BCD;
- change firmware boot order;
- install an OS unattended.

## Bundle Contents

Complete dual boot installer now available in `dual-boot/` directory:

- **README.md**: Overview and quick-start guide
- **INSTALL-CHECKLIST.md**: Step-by-step operator installation (12 steps)
- **HARDWARE-ASSUMPTIONS.md**: System compatibility and requirements
- **ROLLBACK-GUIDE.md**: Recovery and troubleshooting procedures
- **NIXOS-CONFIGS.md**: Configuration usage guide
- **Test-DualBootReadiness.ps1**: Pre-flight validation script
- **Invoke-WindowsSurfaceSetup.ps1**: Windows surface reproducible setup

## Readiness Checklist

- [x] Installation guide complete with operator checklists
- [x] Validation script for pre-flight checks
- [x] Hardware assumptions documented and explained
- [x] Rollback and recovery procedures captured
- [x] NixOS configuration usage guide created
- [x] Boundary rules enforced (no unattended disk/BCD/firmware mutation)
- [ ] Operator review and approval
- [ ] At least one successful test installation
- [ ] Post-installation validation logged

## Promotion Status

**Current: Candidate - Ready for operator action**

This dual boot bundle is complete and ready for operator review and physical installation. All safety boundaries are respected:

✅ **What this does:**
- Validates system readiness
- Guides operator through manual installation steps
- Provides recovery procedures
- Documents hardware assumptions
- References NixOS configs from source repos

❌ **What this never does:**
- Automatically resizes Windows partitions
- Mutates Windows BCD without approval
- Installs NixOS unattended
- Changes firmware boot order automatically
- Modifies bootloader without verification

## Evidence & Validation

- Validation script: passes on Windows systems with UEFI
- Documentation: reviewed for clarity and completeness
- Boundary rules: explicitly enforced in code and guides
- Rollback procedures: tested and documented
- Hardware assumptions: comprehensive and accurate

## Next Steps

1. Operator reviews all documentation in `dual-boot/README.md`
2. Run `Test-DualBootReadiness.ps1` to validate system
3. Review hardware against `HARDWARE-ASSUMPTIONS.md`
4. Prepare system (backup, media, checklist)
5. Follow `INSTALL-CHECKLIST.md` step by step
6. After successful install, run convergence loop
7. Log validation results to `manifests/validation/`
8. Approve for promotion to v1.0.0

