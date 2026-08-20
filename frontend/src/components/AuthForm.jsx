import { useState } from 'react';
import { useAuth } from '../context/useAuth';

export default function AuthForm({ initialMode = 'signin' }) {
  const { signIn, signUp, isLoading, error: serverError, clearError } = useAuth();
  const [mode, setMode] = useState(initialMode); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [rateLimited, setRateLimited] = useState(false);

  const validateField = (name, value) => {
    let errorMsg = '';
    const trimmed = (value || '').trim();

    if (name === 'email') {
      if (!trimmed) {
        errorMsg = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
        errorMsg = 'Please enter a valid email address';
      }
    }

    if (name === 'password') {
      if (!value) {
        errorMsg = 'Password is required';
      } else if (mode === 'signup' && value.length < 8) {
        errorMsg = 'Password must be at least 8 characters';
      } else if (mode === 'signup' && value.length > 64) {
        errorMsg = 'Password cannot exceed 64 characters';
      }
    }

    return errorMsg;
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const val = field === 'email' ? email : password;
    const errorMsg = validateField(field, val);
    setErrors((prev) => ({ ...prev, [field]: errorMsg }));
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setErrors({});
    setTouched({});
    clearError();
    setRateLimited(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Run client-side validation before sending any network request (AC-07, AC-08)
    const emailError = validateField('email', email);
    const passwordError = validateField('password', password);

    setTouched({ email: true, password: true });
    setErrors({ email: emailError, password: passwordError });

    if (emailError || passwordError) {
      return;
    }

    clearError();
    setRateLimited(false);

    try {
      if (mode === 'signup') {
        await signUp(email.trim(), password);
      } else {
        await signIn(email.trim(), password);
      }
    } catch (err) {
      if (err.status === 429 || (err.message && err.message.includes('Too many attempts'))) {
        setRateLimited(true);
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Brand Header */}
        <div className="auth-brand">
          <div className="brand-badge">Men&apos;s Health Reset</div>
          <h1 className="auth-title">
            {mode === 'signin' ? 'Welcome Back' : 'Claim Your Space'}
          </h1>
          <p className="auth-subtitle">
            {mode === 'signin'
              ? 'Sign in to access your preventive health dashboard.'
              : 'Create your account to start tracking personal health metrics.'}
          </p>
        </div>

        {/* Mode Tabs */}
        <div className="auth-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'signin'}
            className={`auth-tab ${mode === 'signin' ? 'active' : ''}`}
            onClick={() => handleModeChange('signin')}
            id="tab-signin"
          >
            Sign In
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'signup'}
            className={`auth-tab ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => handleModeChange('signup')}
            id="tab-signup"
          >
            Create Account
          </button>
        </div>

        {/* Rate Limiting Alert (AC-09) */}
        {rateLimited && (
          <div className="auth-alert rate-limit" role="alert">
            <span className="alert-icon">⏱️</span>
            <div>
              <strong>Rate Limit Reached</strong>
              <p>Too many attempts. Please try again in a few minutes.</p>
            </div>
          </div>
        )}

        {/* General Server Error Alert (AC-05, AC-06) */}
        {serverError && !rateLimited && (
          <div className="auth-alert error" role="alert">
            <span className="alert-icon">⚠️</span>
            <p>{serverError}</p>
          </div>
        )}

        {/* Auth Form */}
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {/* Email Input */}
          <div className="form-group">
            <label htmlFor="auth-email" className="form-label">
              Email Address
            </label>
            <input
              id="auth-email"
              type="email"
              name="email"
              className={`form-input ${touched.email && errors.email ? 'invalid' : ''}`}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (touched.email) {
                  setErrors((prev) => ({
                    ...prev,
                    email: validateField('email', e.target.value),
                  }));
                }
              }}
              onBlur={() => handleBlur('email')}
              autoComplete="email"
              disabled={isLoading}
            />
            {touched.email && errors.email && (
              <span className="field-error" role="alert" id="email-error">
                {errors.email}
              </span>
            )}
          </div>

          {/* Password Input (AC-11: never plaintext) */}
          <div className="form-group">
            <div className="label-wrapper">
              <label htmlFor="auth-password" className="form-label">
                Password
              </label>
              {mode === 'signup' && (
                <span className="helper-text">Min 8 characters</span>
              )}
            </div>
            <input
              id="auth-password"
              type="password"
              name="password"
              className={`form-input ${touched.password && errors.password ? 'invalid' : ''}`}
              placeholder={mode === 'signup' ? 'At least 8 characters' : 'Enter your password'}
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (touched.password) {
                  setErrors((prev) => ({
                    ...prev,
                    password: validateField('password', e.target.value),
                  }));
                }
              }}
              onBlur={() => handleBlur('password')}
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              disabled={isLoading}
            />
            {touched.password && errors.password && (
              <span className="field-error" role="alert" id="password-error">
                {errors.password}
              </span>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="auth-submit-btn"
            disabled={isLoading}
            id="auth-submit-button"
          >
            {isLoading ? (
              <span className="spinner-text">
                <span className="spinner"></span> Processing...
              </span>
            ) : mode === 'signin' ? (
              'Sign In to Dashboard'
            ) : (
              'Create Account & Enter Space'
            )}
          </button>
        </form>

        {/* Security / Privacy Trust Footer */}
        <div className="auth-footer">
          <div className="security-notice">
            <span className="shield-icon">🛡️</span>
            <span>Encrypted credentials • HIPAA-ready foundation • Private health data</span>
          </div>
        </div>
      </div>
    </div>
  );
}

