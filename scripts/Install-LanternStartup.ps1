<#
.SYNOPSIS
    Registers Lantern OS as a Windows startup task (runs at logon, auto-restarts on crash).

.DESCRIPTION
    Two modes:
      1. PM2 mode (default if pm2 is installed) — uses PM2 for process supervision
         and registers a single at-logon task that invokes 'pm2 resurrect'.
      2. Direct mode — registers a task that starts node directly.

    Either way the task runs as the current user, starts minimised, and
    restarts up to 3 times on failure.

.PARAMETER Uninstall
    Remove the LanternOS scheduled task instead of creating it.

.EXAMPLE
    # Install (auto-detects PM2)
    powershell -ExecutionPolicy Bypass -File .\scripts\Install-LanternStartup.ps1

    # Uninstall
    powershell -ExecutionPolicy Bypass -File .\scripts\Install-LanternStartup.ps1 -Uninstall
#>
param(
    [switch]$Uninstall
)

$ErrorActionPreference = 'Stop'
$TaskName = 'LanternOS'
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot  = Split-Path -Parent $ScriptDir

# ── Uninstall ────────────────────────────────────────────────────────────────
if ($Uninstall) {
    Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue
    Write-Host "LanternOS startup task removed."
    exit 0
}

# ── Detect PM2 ───────────────────────────────────────────────────────────────
$pm2 = Get-Command pm2 -ErrorAction SilentlyContinue

if ($pm2) {
    Write-Host "PM2 detected — saving process list and registering PM2 resurrect task."

    # Save current PM2 process list so 'pm2 resurrect' can restore it
    & pm2 start "$RepoRoot\config\ecosystem.config.js" 2>$null
    & pm2 save

    $pm2Path = $pm2.Source
    $Action   = New-ScheduledTaskAction -Execute $pm2Path -Argument 'resurrect' -WorkingDirectory $RepoRoot
} else {
    Write-Host "PM2 not found — registering direct node startup task."
    Write-Host "Tip: 'npm install -g pm2' for crash-restart and log management."

    $nodePath = (Get-Command node -ErrorAction Stop).Source

    # Wrapper batch that sets Ollama env vars then starts node
    $wrapperBat = Join-Path $RepoRoot 'scripts\lantern-autostart.bat'
    @"
@echo off
SET OLLAMA_FIRST=true
SET OLLAMA_BASE_URL=http://localhost:11434
SET OLLAMA_MODEL=qwen2.5-coder
cd /d "$RepoRoot"
"$nodePath" apps\lantern-garage\server.js
"@ | Set-Content -Encoding ASCII $wrapperBat

    $Action = New-ScheduledTaskAction -Execute 'cmd.exe' -Argument "/c `"$wrapperBat`"" -WorkingDirectory $RepoRoot
}

# ── Register task ────────────────────────────────────────────────────────────
$Trigger  = New-ScheduledTaskTrigger -AtLogOn
$Settings = New-ScheduledTaskSettingsSet `
    -ExecutionTimeLimit  (New-TimeSpan)       `
    -RestartCount        3                    `
    -RestartInterval     (New-TimeSpan -Minutes 1) `
    -StartWhenAvailable                       `
    -MultipleInstances   IgnoreNew

Register-ScheduledTask `
    -TaskName  $TaskName `
    -Action    $Action   `
    -Trigger   $Trigger  `
    -Settings  $Settings `
    -RunLevel  Highest   `
    -Force

Write-Host ""
Write-Host "LanternOS startup task installed."
Write-Host "  Start now : Start-ScheduledTask -TaskName '$TaskName'"
Write-Host "  Check     : Get-ScheduledTask -TaskName '$TaskName' | Select-Object State"
Write-Host "  Logs (PM2): pm2 logs lantern-os"
Write-Host "  Uninstall : .\scripts\Install-LanternStartup.ps1 -Uninstall"
