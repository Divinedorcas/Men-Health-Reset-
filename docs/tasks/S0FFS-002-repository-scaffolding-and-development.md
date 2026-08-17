S0FFS-002: Repository Scaffolding and Development Harness Implementation Plan
This plan details the steps to scaffold the Men's Health Reset OS repository according to ADR-001, the S0FFS-002 requirements, and the approved revisions. The scope is strictly limited to infrastructure and development harness (no product functionality).
Version Management
•	Laravel: The latest Laravel 11 requires PHP 8.2+. I will verify the exact scaffolded version and document it.
•	Vite/React: The latest Vite requires Node.js 18+ or 20+ (LTS versions). I will verify and document the exact required Node LTS version based on the scaffolded Vite package.
•	These specific versions will be explicitly documented in the README.md and enforced in the .github/workflows/ci.yml.
Proposed Changes
Frontend (React + Vite + JavaScript)
•	Use npm create vite@latest frontend --template react to scaffold the React application.
•	Retain frontend/package-lock.json and ensure it is committed.
•	Configure vite.config.js for testing (Vitest).
•	Add ESLint with strict linting rules.
•	Add a basic test (src/App.test.jsx) to prove Vitest works.
•	Configure package.json with scripts for lint, test, and build.
•	Ensure ESLint is configured to fail the process on violations.
Backend (Laravel API + PHP)
•	Use composer create-project laravel/laravel backend to scaffold the Laravel API.
•	Retain backend/composer.lock and ensure it is committed.
•	Ensure all CI workflows use composer install and npm ci (relying on lockfiles).
•	Update .env.example to use PostgreSQL settings.
•	Add a minimal health endpoint in routes/api.php: GET /api/health returning {"status": "ok"}.
•	Add an automated PHPUnit/Pest test (tests/Feature/HealthTest.php) that asserts the health endpoint returns HTTP 200 and the exact JSON response {"status": "ok"}.
Verification Scripts
•	Create cross-platform orchestration scripts: scripts/verify.ps1 (Windows) and scripts/verify.sh (macOS/Linux).
•	The scripts will sequentially orchestrate the following:
1.	Backend tests (cd backend && php artisan test)
2.	Frontend linting (cd frontend && npm run lint)
3.	Frontend tests (cd frontend && npm run test)
4.	Frontend production build (cd frontend && npm run build)
5.	Backend health endpoint check (via the automated test that hits the endpoint, acting as our smoke test).
•	Each stage will print a clear PASS/FAIL result to the terminal.
•	The scripts will exit with 0 ONLY when all stages pass, and a non-zero exit code if ANY stage fails.
CI/CD Pipeline
•	Create .github/workflows/ci.yml.
•	Trigger on push to all branches and pull_request targeting main.
•	Set up PostgreSQL as a service in the GitHub Action so the backend tests run against a real PostgreSQL database (not SQLite).
•	The CI pipeline will explicitly list and run the verification expectations used in local development.
•	The CI output will clearly expose failing test names, error messages, file/line information, and the failed stage.
Documentation (README.md)
•	Update README.md to comprehensively detail the 15-minute setup process for a fresh engineer.
•	Include:
•	Project purpose & technology stack
•	Required versions (PHP and Node.js)
•	Prerequisites & cloning instructions
•	Dependency installation (frontend and backend)
•	Environment configuration & PostgreSQL setup
•	Starting the frontend and backend locally
•	Running the full verification command
•	Running individual checks (tests, linting)
•	Performing the smoke test
•	Expected successful output & troubleshooting
Security
•	Ensure .env is listed in .gitignore.
•	Verify .env.example contains only safe placeholder values.
•	Ensure generated dependency directories (vendor, node_modules) are ignored.
•	Confirm no health information, secrets, or API keys are committed in fixtures or source control.
Constraints & Scope
•	DO NOT add: Docker, microservices, Kubernetes, Redis, Next.js, TypeScript, authentication, dashboard functionality, health assessments, AI functionality, appointments, payments, or wearable integrations.
•	Follow ADR-001 strictly.
Final Verification Plan
Before reporting completion, I will physically execute and verify:
1.	Dependency installation from lockfiles.
2.	Backend tests running successfully against PostgreSQL.
3.	Frontend linting and tests passing.
4.	Frontend production build succeeding.
5.	The full scripts/verify.ps1 orchestration script correctly running all stages, printing PASS/FAIL, and exiting with 0.
6.	Confirming the CI workflow file correctly matches the local verification suite.
7.	Confirming security guidelines are met (no secrets or unignored vendor folders).
User Review Required
Please review the updated plan ensuring it incorporates all 10 of your revisions. If approved, I will immediately begin execution.



