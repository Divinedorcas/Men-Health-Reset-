# Men's Health Reset OS

Men's Health Reset OS is an AI-powered preventive health platform that helps men monitor their health, assess risks, build healthy habits, receive personalized meal and exercise plans, track progress, and stay accountable with reminders and coaching. It promotes early detection and healthier lifestyles before chronic diseases develop.

![CI](https://github.com/Divinedorcas/Men-Health-Reset-/actions/workflows/ci.yml/badge.svg)

---

## Architecture Decisions

- [ADR-001: Technology Stack Decision](docs/decisions/001-stack-decision.md)

## Sprint Tasks

- [S0FFS-002: Repository Scaffolding and Development Harness](docs/tasks/S0FFS-002-repository-scaffolding-and-development.md)
- [S0FFS-003: User Authentication & Protected Personal Space](docs/tasks/S0FFS-003-user-authentication.md)

---

## Prerequisites

Before you begin, confirm these are installed on your machine:

| Tool | Required version | Check |
|------|-----------------|-------|
| [Node.js](https://nodejs.org/) | **20 LTS** | `node --version` |
| [npm](https://www.npmjs.com/) | 10+ (bundled with Node 20) | `npm --version` |
| [PHP](https://www.php.net/) | **8.2 or higher** | `php --version` |
| [Composer](https://getcomposer.org/) | **2.x** | `composer --version` |
| [Git](https://git-scm.com/) | Any recent | `git --version` |

> **SQLite** is used automatically for local development — no database server required.

---

## Clone the repository

```bash
git clone https://github.com/Divinedorcas/Men-Health-Reset-.git
cd Men-Health-Reset-
```

---

## Frontend setup (React + Vite)

```bash
cd frontend
npm ci
```

### Smoke test — confirm the frontend environment is healthy

Run this immediately after `npm ci`. A clean pass means your Node environment is correctly configured:

```bash
npm run smoke
```

Expected output: all tests listed as **PASS**, no errors, exit code 0.

---

## Backend setup (Laravel)

```bash
cd ../backend
composer install

# Copy the example environment file
cp .env.example .env          # macOS / Linux
copy .env.example .env        # Windows PowerShell

# Generate the application key
php artisan key:generate

# Run database migrations (uses SQLite by default)
php artisan migrate
```

### Smoke test — confirm the backend environment is healthy

```bash
php artisan test --filter=HealthTest
```

Expected output: `PASS  Tests\Feature\HealthTest` — 1 test, 1 assertion. This confirms PHP, Composer dependencies, and the database connection are all working.

---

## Running the app locally

Open two terminal tabs from the repo root:

**Terminal 1 — Backend API**
```bash
cd backend
php artisan serve
# Listening on http://127.0.0.1:8000
```

**Terminal 2 — Frontend dev server**
```bash
cd frontend
npm run dev
# Local: http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Running the full test suite

### Option A — Single combined command (recommended)

From the repo root, the verification scripts run lint + tests for both layers and print a clear PASS/FAIL summary:

```bash
# macOS / Linux
bash scripts/verify.sh

# Windows PowerShell
.\scripts\verify.ps1
```

Exit code `0` = everything passed. Any non-zero exit code means a step failed — the script prints which one.

### Option B — Run each layer independently

**Frontend** (lint → tests):
```bash
cd frontend
npm run check
```

**Backend** (lint → tests):
```bash
cd backend
composer check
```

---

## Running only tests or only lint

```bash
# Frontend tests only
cd frontend && npm run test -- --run

# Frontend lint only
cd frontend && npm run lint

# Backend tests only
cd backend && php artisan test

# Backend lint only
cd backend && vendor/bin/pint --test
```

---

## CI / Continuous Integration

Every push to **any branch** and every pull request targeting `main` triggers automated CI via GitHub Actions. CI runs the identical lint + test suite as your local `check` commands.

- CI result is visible on the pull request before merge is possible.
- A failing test produces a downloadable JUnit report artifact (test name, failure message, line reference) in the Actions run summary.
- A lint violation fails the build and points to the offending file and rule.

---

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `php: command not found` | Install PHP 8.2+ and ensure it is on your `PATH` |
| `composer: command not found` | Install Composer 2 globally |
| `node: command not found` | Install Node.js 20 LTS |
| `npm ci` fails with missing lockfile | Run `npm install` once to generate `package-lock.json`, then `npm ci` |
| `php artisan migrate` fails | Check that `DB_CONNECTION=sqlite` is in your `.env` file |
| Frontend test fails on `hero.png` not found | Run `npm run build` once to ensure assets are available |
| Port 8000 or 5173 already in use | Kill the existing process or change the port via `php artisan serve --port=8001` / `npm run dev -- --port=5174` |

---

## Project structure

```
Men-Health-Reset-/
├── frontend/          # React + Vite application
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.test.jsx
│   │   └── setupTests.js
│   ├── package.json
│   └── vite.config.js
├── backend/           # Laravel API
│   ├── app/
│   ├── routes/
│   │   └── api.php    # GET /api/health
│   ├── tests/
│   │   ├── Feature/
│   │   └── Unit/
│   └── composer.json
├── scripts/
│   ├── verify.sh      # macOS/Linux full-suite runner
│   └── verify.ps1     # Windows full-suite runner
├── docs/
│   ├── decisions/     # Architecture Decision Records
│   └── tasks/         # Sprint task plans
└── .github/
    └── workflows/
        └── ci.yml     # GitHub Actions CI pipeline
```
