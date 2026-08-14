ADR-001: Men's Health Reset OS Technology Stack Decision
Status: Accepted
Date: 2026-08-14
Decision Owner: Dorcas Oguche
Project: Men's Health Reset OS
________________________________________
1. Decision Summary
Men's Health Reset OS will use the following technology stack for the MVP:
Area	Decision
Frontend	React + Vite + JavaScript
Backend	Laravel API + PHP
Database	PostgreSQL
Authentication	Laravel Sanctum
Hosting	Render
Source Control	GitHub
CI/CD	GitHub Actions
AI	OpenAI API
File Storage	S3-compatible object storage when required
The application will initially be developed as a modular monolithic application rather than a microservices architecture.
________________________________________
2. Product Context
Men's Health Reset OS is a preventive men's health platform designed to help men monitor their health, assess potential risks, build healthier habits, receive personalized exercise and meal guidance, track progress, receive reminders, and stay accountable.
The first release must establish a reliable foundation for future features including:
•	Health assessments
•	Personal health dashboards
•	Habit tracking
•	Exercise plans
•	Meal plans
•	Screening reminders
•	Health appointments
•	Coaching
•	AI-assisted health guidance
•	Health records
•	Community and accountability
•	Future wearable integrations
Sprint 01 specifically requires a working vertical slice where a man can:
1.	Create an account.
2.	Sign in securely.
3.	Access his own authenticated dashboard.
4.	See at least one real health metric.
5.	Use the application in a real deployed environment.
The selected stack must therefore prioritize delivery speed, maintainability, security, developer familiarity, and the ability to grow beyond the MVP.
________________________________________
3. Frontend Decision
Chosen: React + Vite + JavaScript
React with Vite will be used for the web application's frontend.
Alternatives considered
•	Next.js
•	Vue.js
•	Angular
•	React with another build system
Why React was selected
React is selected because the project owner already has practical experience with React and the application will contain many interactive components:
•	Health dashboards
•	Assessment forms
•	Habit trackers
•	Charts
•	Progress indicators
•	Personalized recommendations
•	Appointment interfaces
•	AI chat
•	Notifications
•	User profiles
The project also needs to move from decision to working software quickly during Sprint 01.
Using React reduces unnecessary learning and implementation overhead and allows the AI-assisted development team to work within a technology the project owner already understands.
Vite provides a lightweight and fast development experience suitable for an MVP.
Rejected alternative: Next.js
Next.js is capable and could be appropriate for a future public-facing marketing platform. However, the core application is primarily an authenticated dashboard/application rather than an SEO-dependent content website.
Introducing Next.js at this stage would add framework decisions and complexity without solving a critical Sprint 01 requirement.
If SEO-heavy public content becomes a major product requirement, this decision can be revisited.
Accepted trade-off
We accept that a React/Vite application does not provide the same built-in server-side rendering capabilities as Next.js.
For the MVP, application simplicity and development speed are more important than SSR.
________________________________________
4. Backend Decision
Chosen: Laravel API + PHP
Laravel will provide the backend REST API and core application services.
Alternatives considered
•	Node.js + Express/NestJS
•	ASP.NET Core
•	Django
•	Laravel Blade monolith
Why Laravel was selected
Laravel is selected because the project owner already has experience with PHP and Laravel, reducing implementation risk.
Laravel also provides mature solutions for:
•	Authentication
•	Authorization
•	Validation
•	Database access
•	Queues
•	Notifications
•	Scheduled jobs
•	API development
•	Testing
•	Email
•	File handling
•	Background processing
These capabilities directly support the product roadmap.
The Sprint 01 requirement for authentication and a personalized dashboard can be implemented quickly without building foundational infrastructure from scratch.
Rejected alternative: Node.js
Node.js is a strong option, especially for AI-heavy applications. However, the project already has Laravel experience and there is no Sprint 01 requirement that makes Node.js materially superior.
Choosing Node.js would introduce an unnecessary technology switch.
Rejected alternative: ASP.NET Core
ASP.NET Core is technically strong and appropriate for large-scale systems, but it would increase the project's learning and implementation overhead relative to Laravel for this specific project.
Accepted trade-off
We accept that Laravel/PHP may require additional architectural consideration if specific high-throughput real-time services become major components of the platform.
If that happens, those services can be introduced separately rather than prematurely turning the entire application into microservices.
________________________________________
5. Database Decision
Chosen: PostgreSQL
PostgreSQL will be the primary relational database.
Alternatives considered
•	MySQL
•	SQL Server
•	MongoDB
Why PostgreSQL was selected
Men's Health Reset OS will eventually contain structured relationships between:
•	Users
•	Health profiles
•	Assessments
•	Health metrics
•	Habits
•	Goals
•	Exercise plans
•	Meal plans
•	Appointments
•	Reminders
•	Coaching programs
•	Health records
•	Progress history
A relational database is therefore the appropriate foundation.
PostgreSQL provides strong relational modelling, transactions, constraints, indexing, JSON support, and mature production capabilities.
It also provides room for future analytics and increasingly sophisticated health-data queries.
Rejected alternative: MySQL
MySQL is a valid option and would work with Laravel.
However, PostgreSQL provides broader capabilities and is the preferred database for this project because we are designing for a health platform rather than only the Sprint 01 MVP.
Rejected alternative: MongoDB
MongoDB is not selected because the core domain contains strongly related structured data where relational integrity is important.
Accepted trade-off
The team accepts slightly greater database complexity compared with a very simple MVP using a less capable datastore.
The benefit is a stronger foundation for health records, longitudinal metrics, assessments, and reporting.
________________________________________
6. Hosting Decision
Chosen: Render
Render will be used for the initial production deployment.
Alternatives considered
•	AWS
•	DigitalOcean
•	Railway
•	Vercel
•	Traditional cPanel/shared hosting
Why Render was selected
Sprint 01 explicitly requires deployment to a real environment.
The project is currently being developed by a solo human project owner supported by AI-assisted development agents. The hosting platform therefore needs to minimize infrastructure management.
Render provides a practical path to deploy:
•	Laravel backend
•	React frontend
•	PostgreSQL database
•	Environment variables
•	Automated deployments
This allows the team to focus on building the product rather than spending Sprint 01 managing servers.
Rejected alternative: AWS
AWS provides substantially more infrastructure flexibility and can become appropriate at scale.
However, configuring AWS correctly introduces additional infrastructure and operational complexity that is not necessary to validate the MVP.
AWS can be reconsidered when traffic, compliance, operational requirements, or enterprise partnerships justify the additional complexity.
Rejected alternative: cPanel/shared hosting
Traditional shared hosting may be inexpensive, but it is not the preferred foundation for a modern health application requiring APIs, background jobs, CI/CD, scalable infrastructure, and future integrations.
Accepted trade-off
We accept that Render provides less infrastructure control than a fully managed AWS architecture.
For the MVP, operational simplicity and deployment speed are more valuable than maximum infrastructure control.
________________________________________
7. Authentication Decision
Chosen: Laravel Sanctum
Laravel Sanctum will be used for authentication between the React frontend and Laravel API.
The application must ensure that authenticated users can only access their own health information unless they have explicitly authorized another person or professional to access it.
This is particularly important because the application will eventually handle sensitive health-related information.
Sprint 01 requirement
Authentication must support:
•	Registration
•	Login
•	Logout
•	Authenticated API requests
•	User-specific dashboard access
•	Server-side authorization
________________________________________
8. CI/CD Decision
Chosen: GitHub Actions
GitHub Actions will run automated checks before changes are merged into the default branch.
The initial pipeline should include:
•	Backend tests
•	Frontend tests
•	Linting
•	Build verification
•	Migration checks where appropriate
The goal is to prevent broken code from becoming the new baseline.
________________________________________
9. Architecture Decision
The initial application will use a modular monolith.
The system will not begin as microservices.
The backend will be organized around clear domain boundaries such as:
•	Authentication
•	Health Profile
•	Assessments
•	Health Metrics
•	Habits
•	Plans
•	Appointments
•	Notifications
•	AI Services
These boundaries should exist in the codebase without requiring separate deployable services.
Why
A solo developer with AI-assisted engineering support needs architectural clarity without unnecessary operational complexity.
Microservices would increase:
•	Deployment complexity
•	Debugging complexity
•	Infrastructure requirements
•	Monitoring requirements
•	Authentication complexity
•	Data synchronization concerns
without providing meaningful MVP value.
Accepted trade-off
We accept that a modular monolith may eventually need to be split if specific components demonstrate independent scaling or operational requirements.
That decision will be based on evidence rather than speculation.
________________________________________
10. Security and Health Data Consideration
Men's Health Reset OS will eventually process sensitive health-related information.
Therefore, security is a product requirement rather than an optional enhancement.
The application will follow these principles from the beginning:
•	HTTPS in production
•	Secure authentication
•	Server-side authorization
•	Input validation
•	Least-privilege access
•	Secrets stored in environment variables
•	No health information stored in source control
•	Auditability for sensitive operations where appropriate
•	Secure file storage
•	Database backups
•	Protection against common web vulnerabilities
•	Clear distinction between wellness education and medical diagnosis
The MVP will not claim to diagnose disease.
Risk assessments and AI-generated recommendations will be presented as educational or screening-support information and should direct users to qualified healthcare professionals where appropriate.
Before the platform is expanded into clinical decision support, telemedicine, or regulated medical functionality, the legal, privacy, regulatory, and clinical requirements will be reviewed separately.
________________________________________
11. Why This Stack Fits Sprint 01
The selected stack directly supports the first required vertical slice:
React
→ Provides the authenticated user interface.
Laravel
→ Provides authentication, API endpoints, validation, and business logic.
PostgreSQL
→ Stores users and the first real health metric.
Sanctum
→ Secures authenticated access.
GitHub Actions
→ Provides automated quality checks.
Render
→ Provides a real deployment environment without requiring the team to build infrastructure from scratch.
This allows the team to move from stack decision to:
Repository → Authentication → Health Metric → Dashboard → Production Deployment
without introducing unnecessary technology.
________________________________________
12. Future Technology Decisions
The following technologies are intentionally NOT part of the initial stack decision:
•	React Native
•	Flutter
•	Kubernetes
•	Microservices
•	AWS
•	Wearable APIs
•	Real-time infrastructure
•	Dedicated analytics infrastructure
•	Advanced machine-learning infrastructure
These may be evaluated later when a concrete product requirement justifies them.
________________________________________
13. Decision Review Process
This ADR is the canonical record of the initial technology-stack decision.
The team will not change the stack simply because another technology becomes popular or appears interesting.
A stack change requires a concrete reason.
If a new requirement invalidates an important trade-off documented here, the team will:
1.	Document the new constraint.
2.	Identify which current decision is affected.
3.	Evaluate alternatives.
4.	Create an ADR amendment or new ADR.
5.	Record the impact of the change.
6.	Obtain project-owner approval.
7.	Update the README and affected documentation.
The original decision will remain in the repository so the project's architectural history is preserved.
________________________________________
14. Team Agreement
Decision owner: Dorcas Oguche
Human project owner: Dorcas Oguche
AI-assisted engineering team: Add the names/handles of the AI engineering agents or team members participating in this decision before merging.
By merging this ADR into the default branch, the project owner and participating team members acknowledge that this is the agreed starting technology stack for the MVP.
________________________________________
15. Final Decision
The Men's Health Reset OS MVP will be built with:
React + Vite + JavaScript
Laravel + PHP API
PostgreSQL
Laravel Sanctum
GitHub + GitHub Actions
Render
The architecture will begin as a modular monolith.
This decision prioritizes delivery speed, maintainability, security, existing project-owner expertise, AI-assisted development efficiency, and the Sprint 01 requirement to deliver a real authenticated health dashboard in production.

