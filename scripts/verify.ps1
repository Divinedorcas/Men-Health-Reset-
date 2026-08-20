# scripts/verify.ps1 - Full suite runner for Windows PowerShell
# Usage: .\scripts\verify.ps1  (run from repo root)
$ErrorActionPreference = "Continue"

$global:overall = 0

function Run-Step {
    param(
        [string]$Label,
        [scriptblock]$Command
    )
    Write-Host ""
    Write-Host "------------------------------------------"
    Write-Host ">> $Label"
    Write-Host "------------------------------------------"
    
    & $Command
    $exitCode = $LASTEXITCODE
    if ($null -eq $exitCode) { $exitCode = 0 }

    if ($exitCode -eq 0) {
        Write-Host "  [PASS] $Label" -ForegroundColor Green
    } else {
        Write-Host "  [FAIL] $Label" -ForegroundColor Red
        $global:overall = 1
    }
}

Write-Host ""
Write-Host "=========================================="
Write-Host "  Men's Health Reset OS - Verify Suite   "
Write-Host "=========================================="

# Frontend
Set-Location frontend
Run-Step "Frontend: lint"                 { npm run lint }
Run-Step "Frontend: tests"                { npm run test -- --reporter=verbose }
Run-Step "Frontend: production build"     { npm run build }
Set-Location ..

# Backend
Set-Location backend
Run-Step "Backend: lint"                 { php vendor/bin/pint --test }
Run-Step "Backend: tests"                { php vendor/phpunit/phpunit/phpunit }
Set-Location ..

# Summary
Write-Host ""
Write-Host "=========================================="
if ($global:overall -eq 0) {
    Write-Host "  RESULT: [PASS] All checks passed." -ForegroundColor Green
} else {
    Write-Host "  RESULT: [FAIL] One or more checks failed." -ForegroundColor Red
}
Write-Host "=========================================="
Write-Host ""

exit $global:overall
