# Men's Health Reset OS - Verification Script (Windows PowerShell)
# Runs the full backend and frontend test & lint suite with clear PASS/FAIL reporting.

$ErrorActionPreference = "Continue"
$failedStages = @()

function Run-Stage {
    param (
        [string]$StageName,
        [scriptblock]$Action
    )

    Write-Host "`n========================================================" -ForegroundColor Cyan
    Write-Host "  Running: $StageName" -ForegroundColor Cyan
    Write-Host "========================================================" -ForegroundColor Cyan

    & $Action
    if ($LASTEXITCODE -ne 0 -and $? -eq $false) {
        Write-Host "[-] $StageName FAILED" -ForegroundColor Red
        $script:failedStages += $StageName
    } else {
        Write-Host "[+] $StageName PASSED" -ForegroundColor Green
    }
}

$rootDir = Split-Path -Parent $PSScriptRoot

# 1. Backend Lint (Pint)
Run-Stage "Backend Linting (Laravel Pint)" {
    Set-Location "$rootDir\backend"
    if (Test-Path "vendor\bin\pint.bat") {
        & "vendor\bin\pint.bat" --test
    } elseif (Test-Path "vendor\bin\pint") {
        & php vendor/bin/pint --test
    } else {
        Write-Host "Pint not yet installed. Run 'composer install' first." -ForegroundColor Yellow
    }
}

# 2. Backend Tests (PHPUnit)
Run-Stage "Backend Tests (PHPUnit)" {
    Set-Location "$rootDir\backend"
    & php artisan test --testdox
}

# 3. Frontend Lint (ESLint)
Run-Stage "Frontend Linting (ESLint)" {
    Set-Location "$rootDir\frontend"
    & npm run lint
}

# 4. Frontend Production Build
Run-Stage "Frontend Build (Vite)" {
    Set-Location "$rootDir\frontend"
    & npm run build
}

Set-Location $rootDir

Write-Host "`n========================================================" -ForegroundColor Cyan
Write-Host "  Verification Summary" -ForegroundColor Cyan
Write-Host "========================================================" -ForegroundColor Cyan

if ($failedStages.Count -eq 0) {
    Write-Host "[SUCCESS] All verification stages passed cleanly!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "[FAILURE] The following stage(s) failed:" -ForegroundColor Red
    foreach ($stage in $failedStages) {
        Write-Host "  - $stage" -ForegroundColor Red
    }
    exit 1
}
