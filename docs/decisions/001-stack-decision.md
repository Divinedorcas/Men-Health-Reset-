


# ADR-001: Men's Health Reset OS Technology Stack Decision

**Status:** Accepted
**Date:** 2026-08-14
**Decision Owner:** Dorcas Oguche
**Project:** Men's Health Reset OS

---

## 1. Decision Summary

Men's Health Reset OS will use the following technology stack for the MVP:

| Area           | Decision                  |
| -------------- | ------------------------- |
| Frontend       | React + Vite + JavaScript |
| Backend        | Laravel API + PHP         |
| Database       | PostgreSQL                |
| Authentication | Laravel Sanctum           |
| Hosting        | Render                    |
| Source Control | GitHub                    |
| CI/CD          | GitHub Actions            |
| Architecture   | Modular monolith          |

The application will initially be developed as a modular monolith rather than a microservices architecture.

The following are intentionally **not finalized stack decisions for Sprint 01** because they are not required to deliver the first vertical slice:

* AI provider
* Object/file storage provider
* Wearable integrations
* Real-time infrastructure
* Dedicated analytics infrastructure

These technologies will be evaluated when the corresponding product requirements enter scope.

---

## 2. Product Context

Men's Health Reset OS is a preventive men's health platform designed to help men monitor their health, assess potential risks, build healthier habits, receive personalized exercise and meal guidance, track progress, receive reminders, and stay accountable.

The first release is intended to establish a reliable foundation for future features including:

* Health assessments
* Personal health dashboards
* Habit tracking
* Exercise plans
* Meal plans
* Screening reminders
* Health appointments
* Coaching
* AI-assisted health guidance
* Health records
* Community and accountability
* Future wearable integrations

Sprint 01 specifically requires a working vertical slice where a man can:

1. Create an account.
2. Sign in securely.
3. Access his own authenticated dashboard.
4. See at least one real health metric.
5. Use the application in a real deployed environment.

The selected stack must therefore prioritize:

* Delivery speed
* Maintainability
* Security
* Developer familiarity
* Local development simplicity
* Production deployment simplicity
* Ability to evolve beyond the MVP

---

## 3. Frontend Decision

### Chosen: React + Vite + JavaScript

React with Vite will be used for the web application's frontend.

### Alternatives considered

* Next.js
* Vue.js
* Angular
* React with another build system

### Why React was selected

React is selected because the project owner already has practical experience with React and the application will contain many interactive components, including:

* Health dashboards
* Assessment forms
* Habit trackers
* Charts
* Progress indicators
* Personalized recommendations
* Appointment interfaces
* AI chat
* Notifications
* User profiles

The project also needs to move from decision to working software quickly during Sprint 01.

Using React reduces unnecessary learning and implementation overhead and allows the AI-assisted development team to work within a technology the project owner already understands.

Vite provides a lightweight development and build experience suitable for the MVP.

### Rejected alternative: Next.js

Next.js is capable and could become appropriate for a future public-facing, SEO-heavy content platform.

It is not selected for the MVP because the core product is primarily an authenticated application rather than an SEO-dependent website. React + Vite is sufficient for the Sprint 01 dashboard and reduces framework complexity.

**Trade-off accepted:** The MVP will not receive Next.js's built-in server-side rendering capabilities. This is acceptable because application simplicity and delivery speed are more important than SSR at this stage.

### Rejected alternative: Vue.js

Vue.js is a capable frontend framework and could support the required dashboard and forms.

It is not selected because the project owner already has practical React experience. Switching to Vue would introduce unnecessary framework learning and implementation overhead without solving a Sprint 01 requirement that React cannot satisfy.

**Trade-off accepted:** The team gives up Vue-specific ergonomics in exchange for continuity with the project owner's existing React knowledge.

### Rejected alternative: Angular

Angular provides a comprehensive frontend framework but introduces a larger framework footprint and more conventions than are necessary for the MVP.

It is rejected because the project requires rapid development of an interactive health dashboard and the project owner already has stronger practical experience with React.

**Trade-off accepted:** The team gives up Angular's more opinionated structure in exchange for a lighter and more familiar frontend development model.

### Rejected alternative: React with another build system

Other React build configurations could work, but Vite is selected because it provides a modern, lightweight development and build workflow with minimal configuration.

**Trade-off accepted:** The team chooses the simplicity of Vite rather than maintaining a custom or more complex build configuration.

---

## 4. Backend Decision

### Chosen: Laravel API + PHP

Laravel will provide the backend REST API and core application services.

### Alternatives considered

* Node.js + Express/NestJS
* ASP.NET Core
* Django
* Laravel Blade monolith

### Why Laravel was selected

Laravel is selected because the project owner already has experience with PHP and Laravel, reducing implementation risk.

Laravel also provides mature solutions for:

* Authentication
* Authorization
* Validation
* Database access
* Queues
* Notifications
* Scheduled jobs
* API development
* Testing
* Email
* File handling
* Background processing

These capabilities directly support the product roadmap.

The Sprint 01 requirement for authentication and a personalized dashboard can be implemented without building foundational backend infrastructure from scratch.

### Rejected alternative: Node.js + Express/NestJS

Node.js is a strong option, particularly for applications with extensive JavaScript across the stack.

It is rejected because the project owner already has practical Laravel/PHP experience and Sprint 01 does not contain a requirement that makes Node.js materially superior.

Choosing Node.js would introduce an unnecessary technology switch.

**Trade-off accepted:** The project does not use a JavaScript-only stack in exchange for leveraging the project owner's existing Laravel expertise.

### Rejected alternative: ASP.NET Core

ASP.NET Core is technically strong and suitable for large-scale systems.

It is rejected because adopting it would introduce additional implementation and learning overhead relative to Laravel without providing a Sprint 01 benefit that justifies the change.

**Trade-off accepted:** The team gives up some .NET ecosystem capabilities in exchange for faster delivery using the project owner's existing Laravel skills.

### Rejected alternative: Django

Django is a mature Python web framework and could support the platform.

It is rejected because the project owner has stronger existing experience with Laravel/PHP and Sprint 01 prioritizes rapid implementation of authentication and the health dashboard.

**Trade-off accepted:** The team does not use Python/Django for the core API in exchange for reduced learning and implementation overhead.

### Rejected alternative: Laravel Blade monolith

A Laravel Blade application would simplify having frontend and backend in one Laravel application.

It is rejected because the project requires a modern interactive application with dashboards, charts, personalized plans, AI interactions, and future mobile/client integrations.

Separating the React frontend from the Laravel API gives the product a cleaner client/API boundary.

**Trade-off accepted:** The project takes on frontend/API coordination that a Blade monolith would avoid.

---

## 5. Database Decision

### Chosen: PostgreSQL

PostgreSQL will be the primary relational database.

### Alternatives considered

* MySQL
* SQL Server
* MongoDB

### Why PostgreSQL was selected

Men's Health Reset OS will contain structured relationships between:

* Users
* Health profiles
* Assessments
* Health metrics
* Habits
* Goals
* Exercise plans
* Meal plans
* Appointments
* Reminders
* Coaching programs
* Health records
* Progress history

A relational database is therefore appropriate.

PostgreSQL provides strong relational modelling, transactions, constraints, indexing, JSON support, and mature production capabilities.

It also provides a strong foundation for longitudinal health metrics and reporting.

### Rejected alternative: MySQL

MySQL is a valid Laravel-compatible relational database.

It is rejected because PostgreSQL provides capabilities and extensibility that better fit the project's anticipated health-data and analytics requirements.

**Trade-off accepted:** PostgreSQL may introduce some database-specific operational considerations, but the team accepts this in exchange for the stronger long-term relational foundation.

### Rejected alternative: SQL Server

SQL Server is a mature relational database and is suitable for enterprise applications.

It is rejected because it would introduce unnecessary ecosystem and hosting considerations for this MVP, while PostgreSQL provides the required relational capabilities with a simpler fit for the selected Laravel deployment approach.

**Trade-off accepted:** The project does not use Microsoft's SQL Server ecosystem in exchange for a simpler PostgreSQL-based deployment.

### Rejected alternative: MongoDB

MongoDB is not selected because the core domain contains strongly related structured data where relational integrity, transactions, and relationships between entities are important.

**Trade-off accepted:** The team gives up some document-oriented flexibility in exchange for stronger relational modelling.

---

## 6. Hosting Decision

### Chosen: Render

Render will be used for the initial production deployment.

### Alternatives considered

* AWS
* DigitalOcean
* Railway
* Vercel
* Traditional cPanel/shared hosting

### Why Render was selected

Sprint 01 explicitly requires deployment to a real environment.

The project is being developed by a solo human project owner supported by AI-assisted development agents. The hosting platform therefore needs to minimize infrastructure management.

Render provides a practical path for deploying the selected application stack while allowing the team to focus on product development rather than server administration.

### Rejected alternative: AWS

AWS provides substantially more infrastructure flexibility and can become appropriate at scale.

It is rejected for Sprint 01 because configuring and operating AWS infrastructure would introduce additional complexity that is not necessary to validate the MVP.

AWS may be reconsidered when traffic, compliance, operational requirements, or enterprise partnerships justify the additional complexity.

**Trade-off accepted:** The project gives up some infrastructure-level control in exchange for faster deployment and lower operational overhead.

### Rejected alternative: DigitalOcean

DigitalOcean provides straightforward virtual servers and managed infrastructure.

It is rejected because using it would require the team to take on more server and deployment management than is necessary for Sprint 01.

**Trade-off accepted:** The project gives up some infrastructure control in exchange for simpler managed deployment.

### Rejected alternative: Railway

Railway offers convenient application deployment and managed services.

It is rejected for Sprint 01 because the project prioritizes a predictable deployment workflow with the selected Laravel, React, and PostgreSQL stack, while Railway would introduce another hosting platform to evaluate and maintain without providing a capability that is required by the first production vertical slice.

**Trade-off accepted:** The project gives up Railway's alternative deployment and developer-experience options in exchange for keeping the initial hosting decision focused on the minimum operational requirements needed for Sprint 01.

### Rejected alternative: Vercel

Vercel is excellent for frontend and Next.js deployments.

It is not selected as the primary platform because the MVP requires deployment of a Laravel backend and PostgreSQL database in addition to the React frontend.

**Trade-off accepted:** The project does not optimize for a frontend-only hosting workflow.

### Rejected alternative: Traditional cPanel/shared hosting

Traditional shared hosting may be inexpensive, but it is not selected because the application requires an API backend, database services, CI/CD, background processing, and a deployment model that can evolve with the platform.

**Trade-off accepted:** The project accepts potentially higher initial hosting costs in exchange for a deployment environment better suited to a modern application.

---

## 7. Authentication Decision

### Chosen: Laravel Sanctum

Laravel Sanctum will be used for authentication between the React frontend and Laravel API.

The application must ensure that authenticated users can only access their own health information unless they have explicitly authorized another person or professional to access it.

This is particularly important because the platform will eventually handle sensitive health-related information.

### Alternatives considered

* Laravel Passport
* Third-party authentication provider
* Custom JWT authentication

### Why Laravel Sanctum was selected

Sanctum provides an appropriate authentication mechanism for the React frontend and Laravel API without requiring a separate authentication platform for the MVP.

### Rejected alternative: Laravel Passport

Passport provides OAuth2 capabilities and is useful when the application needs to act as a full OAuth authorization server.

It is rejected for Sprint 01 because the MVP does not require a complex third-party OAuth authorization server.

**Trade-off accepted:** The project does not receive Passport's full OAuth2 capabilities in exchange for simpler authentication.

### Rejected alternative: Third-party authentication provider

Third-party authentication providers can reduce some authentication implementation work.

They are rejected for Sprint 01 because introducing another external dependency is unnecessary when Laravel already provides a suitable authentication solution.

**Trade-off accepted:** The project retains more responsibility for authentication infrastructure in exchange for reduced vendor dependency.

### Rejected alternative: Custom JWT authentication

Custom JWT authentication is possible but would require the team to make additional security and token-management decisions.

It is rejected because Sanctum already provides the required authentication functionality without unnecessary custom security infrastructure.

**Trade-off accepted:** The project accepts Sanctum's model rather than maintaining a custom token system.

---

## 8. CI/CD Decision

### Chosen: GitHub Actions

GitHub Actions will run automated checks before changes are merged into the default branch.

The initial pipeline should include:

* Backend tests
* Frontend tests
* Linting
* Build verification
* Migration checks where appropriate

### Alternatives considered

* GitLab CI/CD
* CircleCI
* Manual deployment

### Why GitHub Actions was selected

The project source code is hosted on GitHub, so GitHub Actions provides direct integration with the repository and pull-request workflow.

This supports the Sprint 01 requirement for a reliable development workflow without introducing another CI platform.

### Rejected alternative: GitLab CI/CD

GitLab CI/CD is capable but would introduce a separate CI platform from the project's GitHub repository.

**Trade-off accepted:** The project does not use GitLab's CI ecosystem in exchange for keeping source control and CI in the same platform.

### Rejected alternative: CircleCI

CircleCI is a capable third-party CI service.

It is rejected because it introduces another external service when GitHub Actions already provides the required CI functionality.

**Trade-off accepted:** The project gives up CircleCI-specific capabilities in exchange for simpler platform integration.

### Rejected alternative: Manual deployment

Manual deployment would initially appear simpler but would increase the risk of inconsistent deployments and reduce confidence in changes.

It is rejected because Sprint 01 explicitly includes repository quality practices and deployment to a real environment.

**Trade-off accepted:** The team spends some initial effort creating CI/CD in exchange for repeatable quality checks and deployments.

---

## 9. Architecture Decision

The initial application will use a **modular monolith**.

The system will not begin as microservices.

The backend will be organized around clear domain boundaries such as:

* Authentication
* Health Profile
* Assessments
* Health Metrics
* Habits
* Plans
* Appointments
* Notifications
* AI Integration

These boundaries should exist in the codebase without requiring separate deployable services.

### Why

A solo developer with AI-assisted engineering support needs architectural clarity without unnecessary operational complexity.

Microservices would increase:

* Deployment complexity
* Debugging complexity
* Infrastructure requirements
* Monitoring requirements
* Authentication complexity
* Data synchronization concerns

without providing meaningful MVP value.

### Rejected alternative: Microservices

Microservices are rejected for the MVP because there is no demonstrated Sprint 01 requirement for independent service scaling or independent deployment.

**Trade-off accepted:** The project gives up independent service scaling in exchange for substantially lower operational and development complexity.

Microservices may be introduced later if measured requirements justify extracting a specific service.

---

## 10. Security and Health Data Consideration

Men's Health Reset OS will eventually process sensitive health-related information.

Therefore, security is a product requirement rather than an optional enhancement.

The application will follow these principles from the beginning:

* HTTPS in production
* Secure authentication
* Server-side authorization
* Input validation
* Least-privilege access
* Secrets stored in environment variables
* No health information stored in source control
* Auditability for sensitive operations where appropriate
* Secure file storage when file storage is introduced
* Database backups
* Protection against common web vulnerabilities
* Clear distinction between wellness education and medical diagnosis

The MVP will not claim to diagnose disease.

Risk assessments and AI-generated recommendations will be presented as educational or screening-support information and should direct users to qualified healthcare professionals where appropriate.

Before the platform is expanded into clinical decision support, telemedicine, or other regulated medical functionality, the legal, privacy, regulatory, security, and clinical requirements will be reviewed separately.

---

## 11. Why This Stack Fits Sprint 01

The selected stack directly supports the first required vertical slice:

**React + Vite**

Provides the authenticated user interface.

**Laravel**

Provides authentication, API endpoints, validation, and business logic.

**PostgreSQL**

Stores users and the first real health metric.

**Laravel Sanctum**

Secures authenticated access.

**GitHub Actions**

Provides automated quality checks.

**Render**

Provides a real deployment environment without requiring the team to build and operate infrastructure from scratch.

This allows the team to move from:

**Repository → Authentication → Health Metric → Dashboard → Production Deployment**

without introducing unnecessary technology.

---

## 12. Future Technology Decisions

The following technologies are intentionally **not finalized as part of the Sprint 01 stack**:

* AI provider
* Object/file storage provider
* React Native
* Flutter
* Kubernetes
* Wearable APIs
* Real-time infrastructure
* Dedicated analytics infrastructure
* Advanced machine-learning infrastructure
* Microservices

These will only be evaluated when a concrete product requirement justifies them.

For example, an AI provider will be selected when the AI Coach or personalized plan generation enters implementation scope. The selection will consider:

* Security
* Privacy
* Cost
* Reliability
* Model quality
* Data handling
* Integration complexity

Similarly, an object-storage provider will be selected when health-document or media storage enters scope.

---

## 13. Decision Review Process

This ADR is the canonical record of the initial technology-stack decision.

The team will not change the stack simply because another technology becomes popular or appears interesting.

A stack change requires a concrete reason.

If a new requirement invalidates an important trade-off documented here, the team will:

1. Document the new constraint.
2. Identify which current decision is affected.
3. Evaluate alternatives.
4. Create an ADR amendment or new ADR.
5. Record the impact of the change.
6. Obtain project-owner approval.
7. Update the README and affected documentation.

The original decision will remain in the repository so the project's architectural history is preserved.

---

## 14. Team Agreement

**Decision owner:** Dorcas Oguche
**Human project owner:** Dorcas Oguche

This technology-stack decision was reviewed and approved by the project owner for the Men's Health Reset OS MVP.

The AI-assisted engineering team will implement against this decision. AI agents are implementation assistants and do not independently approve architectural decisions.

**Approval recorded:** 2026-08-14

Future architectural changes will follow the decision-review process described in this ADR.

---

## 15. Final Decision

The Men's Health Reset OS MVP will be built with:

* React + Vite + JavaScript
* Laravel + PHP API
* PostgreSQL
* Laravel Sanctum
* GitHub
* GitHub Actions
* Render
* Modular monolith architecture

AI provider and object/file storage provider remain intentionally undecided until their respective product requirements enter scope.

This decision prioritizes delivery speed, maintainability, security, existing project-owner expertise, AI-assisted development efficiency, and the Sprint 01 requirement to deliver a real authenticated health dashboard in production.
