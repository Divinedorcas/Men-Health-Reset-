#!/usr/bin/env bash
# Men's Health Reset OS - Verification Script (macOS / Linux)
# Runs the full backend and frontend test & lint suite with clear PASS/FAIL reporting.

set -e

FAILED_STAGES=()
ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

run_stage() {
    local stage_name="$1"
    shift
    echo ""
    echo "========================================================"
    echo "  Running: ${stage_name}"
    echo "========================================================"
    if "$@"; then
        echo "[+] ${stage_name} PASSED"
    else
        echo "[-] ${stage_name} FAILED"
        FAILED_STAGES+=("${stage_name}")
    fi
}

# 1. Backend Linting
run_stage "Backend Linting (Laravel Pint)" bash -c "cd '${ROOT_DIR}/backend' && ./vendor/bin/pint --test" || true

# 2. Backend Tests
run_stage "Backend Tests (PHPUnit)" bash -c "cd '${ROOT_DIR}/backend' && php artisan test --testdox" || true

# 3. Frontend Linting
run_stage "Frontend Linting (ESLint)" bash -c "cd '${ROOT_DIR}/frontend' && npm run lint" || true

# 4. Frontend Build
run_stage "Frontend Build (Vite)" bash -c "cd '${ROOT_DIR}/frontend' && npm run build" || true

echo ""
echo "========================================================"
echo "  Verification Summary"
echo "========================================================"

if [ ${#FAILED_STAGES[@]} -eq 0 ]; then
    echo "[SUCCESS] All verification stages passed cleanly!"
    exit 0
else
    echo "[FAILURE] The following stage(s) failed:"
    for stage in "${FAILED_STAGES[@]}"; do
        echo "  - ${stage}"
    done
    exit 1
fi
