import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './AuthPage.css';

/**
 * AuthPage — Sign In / Create Account form.
 *
 * Handles:
 *  - Toggle between sign-in and registration (AC-01, AC-02)
 *  - Pre-submission inline validation for empty fields (AC-07)
 *  - Password length client-side check (AC-08)
 *  - Server error display: duplicate email (AC-05), bad credentials (AC-06),
 *    rate-limit lockout (AC-09)
 *  - Password field is always type="password" — never plaintext (AC-11)
 */
export default function AuthPage() {
  const { signup, login } = useAuth();

  const [mode, setMode]         = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [fieldErrors, setFieldErrors] = useState({}); // inline validation
  const [serverError, setServerError] = useState('');  // banner-level error

  const isSignup = mode === 'signup';

  // ── Client-side validation (AC-07, AC-08) ─────────────────────────────────

  function validate() {
    const errs = {};

    if (!email.trim()) {
      errs.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errs.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errs.password = 'Password is required.';
    } else if (isSignup && password.length < 8) {
      errs.password = 'Password must be at least 8 characters';
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  }

  // ── Form submission ────────────────────────────────────────────────────────

  async function handleSubmit(e) {
    e.preventDefault();
    setServerError('');

    if (!validate()) return; // stop before any network request (AC-07)

    setLoading(true);

    try {
      if (isSignup) {
        await signup(email, password);
      } else {
        await login(email, password);
      }
      // On success AuthContext updates isAuthenticated → App renders Dashboard.
    } catch (err) {
      if (err.status === 429) {
        // Rate-limit lockout (AC-09)
        setServerError('Too many attempts. Please try again in a few minutes.');
      } else if (err.errors) {
        // Map server-side field validation errors to inline display.
        const mapped = {};
        if (err.errors.email)    mapped.email    = err.errors.email[0];
        if (err.errors.password) mapped.password = err.errors.password[0];
        setFieldErrors(mapped);
      } else {
        setServerError(err.message || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }

  function switchMode() {
    setMode(isSignup ? 'signin' : 'signup');
    setFieldErrors({});
    setServerError('');
    setPassword('');
  }

  return (
    <div className="auth-root">
      {/* Background decorative blobs */}
      <div className="auth-blob auth-blob--1" aria-hidden="true" />
      <div className="auth-blob auth-blob--2" aria-hidden="true" />

      <div className="auth-card" role="main">
        {/* Logo / Brand */}
        <header className="auth-brand">
          <div className="auth-brand__icon" aria-hidden="true">
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="20" fill="url(#brandGrad)" />
              <path
                d="M20 9 C14 9 10 13 10 18 C10 24 16 28 20 31 C24 28 30 24 30 18 C30 13 26 9 20 9Z"
                fill="white"
                opacity="0.9"
              />
              <defs>
                <linearGradient id="brandGrad" x1="0" y1="0" x2="40" y2="40">
                  <stop offset="0%" stopColor="#22d3ee" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div>
            <h1 className="auth-brand__title">Men's Health Reset</h1>
            <p className="auth-brand__subtitle">Your personal health command centre</p>
          </div>
        </header>

        {/* Tab switcher */}
        <div className="auth-tabs" role="tablist">
          <button
            id="tab-signin"
            role="tab"
            aria-selected={!isSignup}
            className={`auth-tab${!isSignup ? ' auth-tab--active' : ''}`}
            onClick={() => !isSignup || switchMode()}
            type="button"
          >
            Sign In
          </button>
          <button
            id="tab-signup"
            role="tab"
            aria-selected={isSignup}
            className={`auth-tab${isSignup ? ' auth-tab--active' : ''}`}
            onClick={() => isSignup || switchMode()}
            type="button"
          >
            Create Account
          </button>
        </div>

        {/* Server-level error banner (rate limit, unexpected errors) */}
        {serverError && (
          <div className="auth-alert" role="alert" id="auth-server-error">
            <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z"
                clipRule="evenodd"
              />
            </svg>
            {serverError}
          </div>
        )}

        {/* Auth form */}
        <form
          className="auth-form"
          onSubmit={handleSubmit}
          noValidate
          aria-label={isSignup ? 'Create account form' : 'Sign in form'}
        >
          {/* Email */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="auth-email">
              Email address
            </label>
            <input
              id="auth-email"
              className={`auth-input${fieldErrors.email ? ' auth-input--error' : ''}`}
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: '' }));
              }}
              aria-describedby={fieldErrors.email ? 'email-error' : undefined}
              aria-invalid={!!fieldErrors.email}
              disabled={loading}
            />
            {fieldErrors.email && (
              <p className="auth-field-error" id="email-error" role="alert">
                {fieldErrors.email}
              </p>
            )}
          </div>

          {/* Password */}
          <div className="auth-field">
            <label className="auth-label" htmlFor="auth-password">
              Password{isSignup && <span className="auth-label__hint"> — min. 8 characters</span>}
            </label>
            <div className="auth-input-wrap">
              <input
                id="auth-password"
                className={`auth-input auth-input--password${fieldErrors.password ? ' auth-input--error' : ''}`}
                type={showPass ? 'text' : 'password'}
                autoComplete={isSignup ? 'new-password' : 'current-password'}
                placeholder={isSignup ? 'Create a strong password' : 'Enter your password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: '' }));
                }}
                aria-describedby={fieldErrors.password ? 'password-error' : undefined}
                aria-invalid={!!fieldErrors.password}
                disabled={loading}
              />
              <button
                type="button"
                className="auth-toggle-pass"
                onClick={() => setShowPass((v) => !v)}
                aria-label={showPass ? 'Hide password' : 'Show password'}
                tabIndex={-1}
              >
                {showPass ? (
                  <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path
                      fillRule="evenodd"
                      d="M3.28 2.22a.75.75 0 00-1.06 1.06l14.5 14.5a.75.75 0 101.06-1.06l-1.745-1.745a10.029 10.029 0 003.3-4.38 1.651 1.651 0 000-1.185A10.004 10.004 0 009.999 3a9.956 9.956 0 00-4.744 1.194L3.28 2.22zM7.752 6.69l1.092 1.092a2.5 2.5 0 013.374 3.373l1.091 1.092a4 4 0 00-5.557-5.557z"
                      clipRule="evenodd"
                    />
                    <path d="M10.748 13.93l2.523 2.523a9.987 9.987 0 01-3.27.547c-4.258 0-7.894-2.66-9.337-6.41a1.651 1.651 0 010-1.186A10.007 10.007 0 012.839 6.02L6.07 9.252a4 4 0 004.678 4.678z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                    <path
                      fillRule="evenodd"
                      d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="auth-field-error" id="password-error" role="alert">
                {fieldErrors.password}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            id="auth-submit-btn"
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading ? (
              <span className="auth-spinner" aria-label="Loading" />
            ) : isSignup ? (
              'Create Account'
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Mode switch link */}
        <p className="auth-switch">
          {isSignup ? 'Already have an account? ' : "Don't have an account? "}
          <button type="button" className="auth-switch__link" onClick={switchMode}>
            {isSignup ? 'Sign In' : 'Create one — it\'s free'}
          </button>
        </p>

        <p className="auth-footer">
          Your health data is encrypted and private.
        </p>
      </div>
    </div>
  );
}
