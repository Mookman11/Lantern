#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Validate that the CI/CD pipeline is release-ready.
.DESCRIPTION
    Batch job that validates the npm-first CI/CD surface. This allows batch
    jobs to verify that CI, static publishing, and local launch expectations
    still match the release contract.
.PARAMETER GitHubRepo
    GitHub repo in format "owner/repo".
#>

param(
    [string]$GitHubRepo = "alex-place/lantern-os"
)

$ErrorActionPreference = "Continue"
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
$results = @{
    passed = @()
    failed = @()
    warnings = @()
}

Write-Host "`n[$timestamp] === CI/CD Pipeline Validation ===" -ForegroundColor Cyan
Write-Host "Repo: $GitHubRepo" -ForegroundColor DarkGray

Write-Host "[1/4] Checking workflow files..." -NoNewline
$ciWorkflow = ".github/workflows/ci.yml"
$deployWorkflow = ".github/workflows/deploy.yml"

if ((Test-Path $ciWorkflow) -and (Test-Path $deployWorkflow)) {
    Write-Host " OK" -ForegroundColor Green
    $results.passed += "CI and deploy workflows present"
} else {
    Write-Host " FAIL" -ForegroundColor Red
    $missingFiles = @()
    if (!(Test-Path $ciWorkflow)) { $missingFiles += $ciWorkflow }
    if (!(Test-Path $deployWorkflow)) { $missingFiles += $deployWorkflow }
    $results.failed += "Missing workflow files: $($missingFiles -join ', ')"
}

Write-Host "[2/4] Validating workflow structure..." -NoNewline
try {
    $ciContent = Get-Content $ciWorkflow -Raw
    $deployContent = Get-Content $deployWorkflow -Raw

    $ciHasJobs = $ciContent -match "jobs:"
    $deployHasSteps = $deployContent -match "steps:"
    $deployPublishesPages = $deployContent -match "actions/deploy-pages"

    if ($ciHasJobs -and $deployHasSteps -and $deployPublishesPages) {
        Write-Host " OK" -ForegroundColor Green
        $results.passed += "Workflow structure valid"
    } else {
        Write-Host " FAIL" -ForegroundColor Red
        $results.failed += "Workflow structure does not match the static mirror release contract"
    }
} catch {
    Write-Host " FAIL" -ForegroundColor Red
    $results.failed += "Could not read workflow files: $_"
}

Write-Host "[3/4] Checking npm release readiness..." -NoNewline
$rootPackage = "package.json"
$rootLock = "package-lock.json"
$appPackage = "apps/lantern-garage/package.json"
$appServer = "apps/lantern-garage/cloud-server.js"

if ((Test-Path $rootPackage) -and (Test-Path $rootLock) -and (Test-Path $appPackage) -and (Test-Path $appServer)) {
    Write-Host " OK" -ForegroundColor Green
    $results.passed += "Root npm scripts, lockfile, and Lantern Garage entrypoint present"
} else {
    Write-Host " FAIL" -ForegroundColor Red
    $missingNpm = @()
    foreach ($file in @($rootPackage, $rootLock, $appPackage, $appServer)) {
        if (!(Test-Path $file)) { $missingNpm += $file }
    }
    $results.failed += "Missing npm release files: $($missingNpm -join ', ')"
}

Write-Host "[4/4] Checking critical repo files..." -NoNewline
$criticalFiles = @(
    "README.md",
    "AGENTS.md",
    "docs/ARCHITECTURE.md",
    "manifests/cloud-mirrors.json"
)

$missingCritical = @()
foreach ($file in $criticalFiles) {
    if (!(Test-Path $file)) {
        $missingCritical += $file
    }
}

if ($missingCritical.Count -eq 0) {
    Write-Host " OK" -ForegroundColor Green
    $results.passed += "All critical files present"
} else {
    Write-Host " FAIL" -ForegroundColor Red
    $results.failed += "Critical files missing: $($missingCritical -join ', ')"
}

Write-Host "`n[$timestamp] === Summary ===" -ForegroundColor Cyan
Write-Host "Passed: $($results.passed.Count)" -ForegroundColor Green
Write-Host "Failed: $($results.failed.Count)" -ForegroundColor Red
Write-Host "Warnings: $($results.warnings.Count)" -ForegroundColor Yellow

if ($results.passed.Count -gt 0) {
    Write-Host "`nPassed checks:" -ForegroundColor Green
    $results.passed | ForEach-Object { Write-Host "  - $_" }
}

if ($results.failed.Count -gt 0) {
    Write-Host "`nFailed checks:" -ForegroundColor Red
    $results.failed | ForEach-Object { Write-Host "  - $_" }
}

if ($results.warnings.Count -gt 0) {
    Write-Host "`nWarnings:" -ForegroundColor Yellow
    $results.warnings | ForEach-Object { Write-Host "  - $_" }
}

$outDir = "data\validation"
if (!(Test-Path $outDir)) {
    New-Item -ItemType Directory -Force -Path $outDir | Out-Null
}

$results | ConvertTo-Json -Depth 10 | Out-File "$outDir\cicd-validation.json" -Encoding utf8
Write-Host "`nResults saved to: $outDir\cicd-validation.json" -ForegroundColor Cyan

if ($results.failed.Count -gt 0) {
    exit 1
}

exit 0
