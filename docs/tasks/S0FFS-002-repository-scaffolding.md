# S0FFS-002 — Repository Scaffolding & Development Harness

**Status:** Ready  
**Priority:** Critical  
**Sprint:** Sprint 01  
**Depends on:** S0FFS-001 — Technology Stack Decision  
**Owner:** Dorcas Oguche

---

## Objective

Create a working development foundation for Men's Health Reset OS that a new engineer can clone, configure, run, test, and verify locally within 15 minutes.

The repository must include the frontend, backend, PostgreSQL configuration, automated tests, linting, verification scripts, documentation, and GitHub Actions CI.

The implementation must follow:

`docs/decisions/001-stack-decision.md`

---

## Context

The repository currently contains project documentation but does not yet provide a complete development environment.

Until this task is complete, subsequent Sprint 01 work such as authentication, the health dashboard, and deployment has no reliable foundation.

This task establishes the minimum engineering harness required to answer:

> Can a new engineer clone this repository, run it, and know that it works?

---

# Technology Stack

According to ADR-001:

### Frontend

- React
- Vite
- JavaScript
- ESLint
- Vitest

### Backend

- Laravel
- PHP
- PostgreSQL

### CI/CD

- GitHub Actions

### Architecture

- Modular monolith

Do not introduce additional architectural technologies without creating or amending an ADR.

---

# Implementation Requirements

## 1. Frontend

Create a React + Vite JavaScript application.

Configure:

- ESLint
- Vitest
- Testing Library where appropriate
- Production build

Create a minimal frontend smoke test proving that the frontend testing environment works.

The frontend must support:

```bash
npm install
npm run lint
npm run test
npm run build