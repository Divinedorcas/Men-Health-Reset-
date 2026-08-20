# S0FFS-002: Repository Scaffolding and Development Harness

This plan details the steps to scaffold the Men's Health Reset OS repository according to [ADR-001](../decisions/001-stack-decision.md), the S0FFS-002 requirements, and the approved revisions. The scope is strictly limited to infrastructure and development harness — **no product functionality**.

---

## Version Management

- **Laravel**: Requires PHP 8.2+. Exact scaffolded version documented in README.
- **Vite / React**: Requires Node.js 20 LTS. Exact required version documented in README and enforced in CI.
- These specific versions are explicitly documented in `README.md` and enforced in `.github/workflows/ci.yml`.

---

## Proposed Changes

### Frontend (React + Vite + JavaScript)

- Use `npm create vite@latest frontend --template react` to scaffold the React application.
- Retain `frontend/package-lock.json` and ensure it is committed.
- Configure `vite.config.js` for testing (Vitest).
- Add ESLint with strict linting rules.
- Add a basic test (`src/App.test.jsx`) to prove Vitest works.
- Configure `package.json` with scripts for `lint`, `test`, `check` (lint + test combined), `smoke`, and `build`.
- Ensure ESLint is configured to fail the process on violations.

### Backend (Laravel API + PHP)

- Use `composer create-project laravel/laravel backend` to scaffold the Laravel API.
- Retain `backend/composer.lock` and ensure it is committed.
- Ensure all CI workflows use `composer install` and `npm ci` (relying on lockfiles).
- Update `.env.example` to default to SQLite for local dev; PostgreSQL settings documented for production.
- Add a minimal health endpoint in `routes/api.php`: `GET /api/health` returning `{"status": "ok"}`.
- Add an automated PHPUnit test (`tests/Feature/HealthTest.php`) that asserts the health endpoint returns HTTP 200 and the exact JSON response `{"status": "ok"}`.
- Wire Laravel Pint (`vendor/bin/pint --test`) as the lint step in both CI and the `check` Composer script.

### Verification Scripts

- Cross-platform orchestration scripts: `scripts/verify.ps1` (Windows) and `scripts/verify.sh` (macOS/Linux).
- Scripts sequentially orchestrate:
  1. Frontend lint (`npm run lint`)
  2. Frontend tests (`npm run test -- --run`)
  3. Frontend production build (`npm run build`)
  4. Backend lint (`vendor/bin/pint --test`)
  5. Backend tests (`php artisan test`) — health endpoint test acts as smoke test
- Each stage prints a clear `PASS` / `FAIL` result to the terminal.
- Scripts exit `0` only when **all** stages pass; non-zero on any failure.

### CI/CD Pipeline

- `.github/workflows/ci.yml` triggers on **push to all branches** and `pull_request` targeting `main`.
- Two parallel jobs: `frontend` and `backend`.
- Frontend job: `npm ci` → `npm run lint` → `npm run test -- --run --reporter=junit` → `npm run build` → upload JUnit artifact.
- Backend job: `composer install` → `vendor/bin/pint --test` → `php artisan test --log-junit storage/logs/junit.xml` → upload JUnit artifact.
- No unused Postgres service container — tests run against SQLite in-memory (per `phpunit.xml`).
- CI output clearly exposes failing test names, error messages, file/line references, and which stage failed.

### Documentation (`README.md`)

Updated root `README.md` covers the complete 15-minute onboarding path:

- Project purpose & technology stack
- Required versions (PHP 8.2+, Node 20 LTS, Composer 2)
- Prerequisites & cloning instructions
- Dependency installation (frontend and backend)
- Environment configuration
- Starting frontend and backend locally
- **Smoke-test command** — run after setup to confirm environment is healthy
- Running the full verification suite (`npm run check` / `composer check`)
- Running individual checks (tests, linting)
- Expected successful output & troubleshooting tips
- CI badge link

### Security

- `.env` listed in `.gitignore` ✅
- `.env.example` contains only safe placeholder values ✅
- Generated dependency directories (`vendor`, `node_modules`) are git-ignored ✅
- No health information, secrets, or API keys committed in fixtures or source control ✅

---

## Constraints & Scope

> [!IMPORTANT]
> **Do NOT add**: Docker, microservices, Kubernetes, Redis, Next.js, TypeScript, authentication, dashboard functionality, health assessments, AI functionality, appointments, payments, or wearable integrations.
>
> Follow [ADR-001](../decisions/001-stack-decision.md) strictly.

---

## Final Verification Checklist

Before marking complete, the following are physically executed and verified:

- [ ] Dependency installation from lockfiles (`npm ci`, `composer install`) succeeds on a clean environment
- [ ] Backend tests pass against SQLite in-memory (`php artisan test`)
- [ ] Backend Pint lint passes (`vendor/bin/pint --test`)
- [ ] Frontend lint passes (`npm run lint`)
- [ ] Frontend tests pass (`npm run test -- --run`)
- [ ] Frontend production build succeeds (`npm run build`)
- [ ] Full `scripts/verify.ps1` / `verify.sh` runs all stages, prints `PASS/FAIL`, exits `0`
- [ ] CI workflow triggers on a non-`main` branch push and reports pass/fail on the commit
- [ ] A deliberate lint violation fails CI with file name and rule
- [ ] A deliberate test failure produces a downloadable JUnit artifact with test name, message, and line reference
- [ ] Security guidelines met (no secrets, no unignored vendor folders)

---

## Status

| Field | Value |
|-------|-------|
| Task ID | S0FFS-002 |
| Sprint | S0FFS (Sprint 01 Foundation) |
| Owner | Dorcas Oguche |
| Status | In Progress |
| ADR reference | [ADR-001](../decisions/001-stack-decision.md) |
