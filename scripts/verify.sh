#!/usr/bin/env bash
# scripts/verify.sh - Full suite runner for macOS / Linux
# Usage: bash scripts/verify.sh (run from repo root)
set -euo pipefail

PASS="\033[0;32mPASS\033[0m"
FAIL="\033[0;31mFAIL\033[0m"
overall=0

run_step() {
  local label="$1"
  shift
  echo ""
  echo "──────────────────────────────────────────"
  echo "▶  $label"
  echo "──────────────────────────────────────────"
  if "$@"; then
    echo -e "  [$PASS] $label"
  else
    echo -e "  [$FAIL] $label"
    overall=1
  fi
}

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║  Men's Health Reset OS — Verify Suite   ║"
echo "╚══════════════════════════════════════════╝"

# ── Frontend ──────────────────────────────────
pushd frontend > /dev/null
run_step "Frontend: lint"             npm run lint
run_step "Frontend: tests (Vitest)"   npm run test -- --reporter=verbose
run_step "Frontend: production build" npm run build
popd > /dev/null

# ── Backend ───────────────────────────────────
pushd backend > /dev/null
run_step "Backend: lint (Pint)"       vendor/bin/pint --test
run_step "Backend: tests (PHPUnit)"   php vendor/phpunit/phpunit/phpunit
popd > /dev/null

# ── Summary ───────────────────────────────────
echo ""
echo "══════════════════════════════════════════"
if [ "$overall" -eq 0 ]; then
  echo -e "  RESULT: [$PASS] All checks passed."
else
  echo -e "  RESULT: [$FAIL] One or more checks failed — see output above."
fi
echo "══════════════════════════════════════════"
echo ""

exit "$overall"
