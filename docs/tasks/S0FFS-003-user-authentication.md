# S0FFS-003: User Authentication & Protected Personal Space

This specification details the user authentication and protected personal space implementation for Men's Health Reset OS in accordance with [ADR-001](../decisions/001-stack-decision.md).

---

## 1. Goal & Context

Men's Health Reset OS is an AI-powered preventive health platform. To transition from an anonymous visitor to an authenticated user with private health metrics and longitudinal tracking, a secure authentication gateway is required.

This implementation delivers:
- User signup with email and password, automatic sign-in, and immediate routing to protected personal space.
- User signin with credentials validation.
- User signout invalidating active tokens.
- Strict route guarding on protected spaces preventing blank pages or flash of protected content.
- Inline client-side validation for empty fields and minimum password length.
- Rate limiting against credential brute-forcing (5 attempts per minute).
- Session inactivity detection (30-minute auto-timeout).
- Strict security controls (bcrypt password hashing, no plaintext passwords in payloads or logs).

---

## 2. API Contract

### `POST /api/auth/signup`
- **Request**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "name": "Optional Name"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "message": "Account created successfully.",
    "user": {
      "id": 1,
      "name": "user",
      "email": "user@example.com",
      "created_at": "2026-08-20T00:00:00.000000Z"
    },
    "token": "1|sanctum_plain_text_token..."
  }
  ```
- **Error (422 Unprocessable)**:
  ```json
  {
    "message": "This email is already registered."
  }
  ```

### `POST /api/auth/signin`
- **Request**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "message": "Signed in successfully.",
    "user": {
      "id": 1,
      "name": "user",
      "email": "user@example.com",
      "created_at": "2026-08-20T00:00:00.000000Z"
    },
    "token": "2|sanctum_plain_text_token..."
  }
  ```
- **Error (401 Unauthorized)**:
  ```json
  {
    "message": "Email or password is incorrect"
  }
  ```
- **Error (429 Too Many Requests)**:
  ```json
  {
    "message": "Too many attempts. Please try again in a few minutes."
  }
  ```

### `POST /api/auth/signout`
- **Headers**: `Authorization: Bearer <token>`
- **Response (200 OK)**:
  ```json
  {
    "message": "Signed out successfully."
  }
  ```

### `GET /api/auth/user`
- **Headers**: `Authorization: Bearer <token>`
- **Response (200 OK)**:
  ```json
  {
    "user": {
      "id": 1,
      "name": "user",
      "email": "user@example.com",
      "created_at": "2026-08-20T00:00:00.000000Z"
    }
  }
  ```

---

## 3. Acceptance Criteria Mapping

| Criterion | Implementation | Test Coverage |
|---|---|---|
| **AC-01** (Signup → Protected Space) | `AuthController::signup` creates user & token; `AuthContext::signUp` updates state | `AuthTest::test_new_user_can_sign_up_and_receive_token`, `App.test.jsx` |
| **AC-02** (Signin → Protected Space) | `AuthController::signin` verifies password via `Hash::check` and returns token | `AuthTest::test_existing_user_can_sign_in`, `App.test.jsx` |
| **AC-03** (Signout & Redirect) | `AuthController::signout` deletes personal access token; `clearStoredAuth` resets frontend state | `AuthTest::test_signed_in_user_can_sign_out`, `App.test.jsx` |
| **AC-04** (Protected Route Guard) | `MainRouter` checks `isLoading` and `isAuthenticated` before rendering | `App.test.jsx` ("shows sign-in screen by default") |
| **AC-05** (Duplicate Email Friendly Error) | `unique:users,email` rule mapped to `"This email is already registered."` | `AuthTest::test_signing_up_with_existing_email_returns_friendly_error` |
| **AC-06** (Invalid Credentials Generic Error) | Mismatches return exact `"Email or password is incorrect"` (HTTP 401) | `AuthTest::test_invalid_credentials_returns_exact_generic_error` |
| **AC-07** (Inline Empty Field Validation) | `validateField` checks empty inputs before dispatching fetch | `App.test.jsx` ("shows inline validation errors") |
| **AC-08** (Password Length 8-64 Chars) | Client validation + backend `min:8|max:64` returns `"Password must be at least 8 characters"` | `AuthTest::test_password_length_validation_on_signup`, `App.test.jsx` |
| **AC-09** (Brute-Force Rate Limiting) | `RateLimiter` enforces 5 attempts/minute, returns 429 `"Too many attempts. Please try again in a few minutes."` | `AuthTest::test_rate_limiting_after_five_failed_attempts`, `App.test.jsx` |
| **AC-10** (Session Inactivity Timeout) | Client tracks activity timestamp; expires session after 30m; 401 listener triggers logout | `auth.js:isSessionActive`, `AuthContext.jsx` |
| **AC-11** (Password Privacy & Security) | Passwords hashed with bcrypt; hidden on User model; never in JSON responses or logs | `AuthTest::test_password_is_never_exposed_in_responses` |

---

## 4. Status

| Field | Value |
|---|---|
| Task ID | S0FFS-003 |
| Sprint | S0FFS (Sprint 01 Foundation) |
| Owner | Dorcas Oguche |
| Status | Completed & Verified |
| ADR Reference | [ADR-001](../decisions/001-stack-decision.md) |
