# Men's Health Reset OS

Men's Health Reset OS is an AI-powered preventive health platform that helps men monitor their health, assess risks, build healthy habits, receive personalized meal and exercise plans, track progress, and stay accountable with reminders and coaching. It promotes early detection and healthier lifestyles before chronic diseases develop.

---

## Architecture Decisions

- [ADR-001: Technology Stack Decision](docs/decisions/001-stack-decision.md)

---

## Prerequisites

Before cloning, ensure the following are installed on your machine:

| Tool | Minimum version | How to check |
|---|---|---|
| PHP | 8.2 | `php -v` |
| Composer | 2.x | `composer -V` |
| Node.js | 20.x | `node -v` |
| npm | 10.x | `npm -v` |
| Git | any recent | `git --version` |

> **Windows users**: PHP 8.2+ is included with [XAMPP](https://www.apachefriends.org/). Make sure `C:\xampp\php` is on your `PATH`.

---

## Clone & Setup

```bash
git clone https://github.com/Divinedorcas/Men-Health-Reset-.git
cd Men-Health-Reset-
```

### Backend (Laravel)

```bash
cd backend

# 1. Install PHP dependencies
composer install

# 2. Create your local environment file
cp .env.example .env

# 3. Generate the application encryption key
php artisan key:generate

# 4. Create the local SQLite database and run migrations
php artisan migrate
```

> **Note**: Local development uses SQLite (no database server required). Production uses PostgreSQL — see [ADR-001](docs/decisions/001-stack-decision.md).

### Frontend (React + Vite)

```bash
cd ../frontend

# Install Node dependencies
npm install
```

---

## Smoke Test — Confirm Your Setup Is Healthy

After completing setup, run this command to confirm the full stack is wired correctly **before writing any code**:

```bash
# Terminal 1 — start the Laravel backend
cd backend
php artisan serve

# Terminal 2 — hit the health endpoint
curl http://localhost:8000/api/health
```

**Expected response:**

```json
{"status":"ok","service":"men-health-reset-api"}
```

If you see that response, your environment is correctly configured. ✓

---

## Run the Full Test Suite

```bash
cd backend
php artisan test
```

This runs the complete PHPUnit test suite against an in-memory SQLite database. You should see a clear `PASS` / `FAIL` summary with test names and any failure details.

**Expected output on a clean setup:**

```
   PASS  Tests\Feature\HealthCheckTest
  ✓ health endpoint returns ok
  ✓ health response contains required keys

   PASS  Tests\Feature\ExampleTest
  ✓ the application returns a successful response

  Tests:    3 passed
  Duration: <1s
```

---

## Run the Linters

### Backend (Laravel Pint)

```bash
cd backend
./vendor/bin/pint --test
```

`--test` mode reports violations without modifying files. Exit code is non-zero on any violation. To auto-fix:

```bash
./vendor/bin/pint
```

### Frontend (ESLint)

```bash
cd frontend
npm run lint
```

To lint **and** verify the production build compiles cleanly:

```bash
npm run check
```

---

## Start Local Development Servers

```bash
# Terminal 1 — Laravel API on http://localhost:8000
cd backend && php artisan serve

# Terminal 2 — React frontend on http://localhost:5173
cd frontend && npm run dev
```

The Vite dev server proxies all `/api/*` requests to `localhost:8000`, so the frontend and backend work together without any CORS configuration.

---

## Continuous Integration

Every push to every branch and every pull request triggers the CI pipeline defined in [`.github/workflows/ci.yml`](.github/workflows/ci.yml).

**CI jobs:**

| Job | What it runs |
|---|---|
| `backend` | `composer install` → Pint lint → `php artisan test --testdox` |
| `frontend` | `npm ci` → ESLint → `vite build` |

Both jobs run in parallel. A failing test in CI includes the test name, failure message, and line reference so you can reproduce it locally immediately.

### Enforce CI on Pull Requests

To prevent merging a branch with a failing CI run, enable branch protection on `main`:

1. Go to your GitHub repo → **Settings → Branches**.
2. Click **Add branch protection rule**.
3. Set **Branch name pattern** to `main`.
4. Check **Require status checks to pass before merging**.
5. Search for and add both `Backend (PHP 8.2)` and `Frontend (Node 20)` as required checks.
6. Click **Save changes**.

---

## Project Structure

```
Men-Health-Reset-/
├── .github/
│   └── workflows/
│       └── ci.yml          # GitHub Actions CI pipeline
├── backend/                # Laravel 12 API
│   ├── app/
│   ├── database/
│   ├── routes/
│   │   ├── api.php         # API routes (GET /api/health, auth, ...)
│   │   └── web.php
│   ├── tests/
│   │   └── Feature/
│   │       └── HealthCheckTest.php
│   ├── .env.example        # Copy this to .env before running
│   └── phpunit.xml
├── frontend/               # React + Vite SPA
│   ├── src/
│   ├── vite.config.js      # Proxies /api → localhost:8000 in dev
│   └── package.json
└── docs/
    └── decisions/
        └── 001-stack-decision.md
```
