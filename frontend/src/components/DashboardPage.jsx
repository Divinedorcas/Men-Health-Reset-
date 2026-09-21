import { useAuth } from '../context/AuthContext';
import './DashboardPage.css';

/**
 * DashboardPage — Personal protected space.
 *
 * This is the authenticated user's private area (AC-01, AC-02, AC-03).
 * No unauthenticated visitor can reach this component — AuthContext and
 * App.jsx's route guard redirect them to AuthPage instead (AC-04).
 *
 * The Sign Out button is accessible from the header on every screen (AC-03).
 */
export default function DashboardPage() {
  const { user, signout } = useAuth();

  async function handleSignOut() {
    await signout();
    // AuthContext clears state → App re-renders and shows AuthPage.
  }

  // Derive a friendly display name from the email.
  const displayName = user?.email ? user.email.split('@')[0] : 'there';

  return (
    <div className="dash-root">
      {/* Background decoration */}
      <div className="dash-bg-blob dash-bg-blob--1" aria-hidden="true" />
      <div className="dash-bg-blob dash-bg-blob--2" aria-hidden="true" />

      {/* Top navigation bar */}
      <header className="dash-nav">
        <div className="dash-nav__brand">
          <div className="dash-nav__icon" aria-hidden="true">
            <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="20" fill="url(#navGrad)" />
              <path
                d="M20 9 C14 9 10 13 10 18 C10 24 16 28 20 31 C24 28 30 24 30 18 C30 13 26 9 20 9Z"
                fill="white"
                opacity="0.9"
              />
              <defs>
                <linearGradient id="navGrad" x1="0" y1="0" x2="40" y2="40">
                  <stop offset="0%" stopColor="#22d3ee" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="dash-nav__title">Men's Health Reset</span>
        </div>

        <div className="dash-nav__actions">
          {/* User pill */}
          <div className="dash-user-pill" aria-label={`Signed in as ${user?.email}`}>
            <div className="dash-user-pill__avatar" aria-hidden="true">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <span className="dash-user-pill__email">{user?.email}</span>
          </div>

          {/* Sign out button — accessible from anywhere in the protected space (AC-03) */}
          <button
            id="sign-out-btn"
            type="button"
            className="dash-signout-btn"
            onClick={handleSignOut}
          >
            <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M3 4.25A2.25 2.25 0 015.25 2h5.5A2.25 2.25 0 0113 4.25v2a.75.75 0 01-1.5 0v-2a.75.75 0 00-.75-.75h-5.5a.75.75 0 00-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 00.75-.75v-2a.75.75 0 011.5 0v2A2.25 2.25 0 0110.75 18h-5.5A2.25 2.25 0 013 15.75V4.25z"
                clipRule="evenodd"
              />
              <path
                fillRule="evenodd"
                d="M6 10a.75.75 0 01.75-.75h9.546l-1.048-.943a.75.75 0 111.004-1.114l2.5 2.25a.75.75 0 010 1.114l-2.5 2.25a.75.75 0 11-1.004-1.114l1.048-.943H6.75A.75.75 0 016 10z"
                clipRule="evenodd"
              />
            </svg>
            Sign Out
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="dash-main">
        {/* Welcome section */}
        <section className="dash-welcome" aria-labelledby="welcome-heading">
          <h1 id="welcome-heading" className="dash-welcome__heading">
            Welcome back, <span className="dash-welcome__name">{displayName}</span> 👋
          </h1>
          <p className="dash-welcome__sub">
            Your personal health command centre. Your data lives here — private, secure, yours.
          </p>
        </section>

        {/* Status indicator */}
        <div className="dash-status-bar">
          <div className="dash-status-item">
            <span className="dash-status-dot dash-status-dot--green" aria-hidden="true" />
            <span>Session active</span>
          </div>
          <div className="dash-status-item">
            <span className="dash-status-dot dash-status-dot--cyan" aria-hidden="true" />
            <span>Secure connection</span>
          </div>
          <div className="dash-status-item">
            <span className="dash-status-dot dash-status-dot--purple" aria-hidden="true" />
            <span>Data encrypted</span>
          </div>
        </div>

        {/* Dashboard cards grid */}
        <div className="dash-grid">
          {/* Health Snapshot — placeholder ready for the next sprint */}
          <article className="dash-card dash-card--featured" aria-labelledby="card-health">
            <div className="dash-card__badge">Coming Soon</div>
            <div className="dash-card__icon dash-card__icon--health" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
            </div>
            <h2 id="card-health" className="dash-card__title">Health Snapshot</h2>
            <p className="dash-card__desc">Your first real health metric lands here in the next sprint.</p>
          </article>

          {/* Habits */}
          <article className="dash-card" aria-labelledby="card-habits">
            <div className="dash-card__badge">Coming Soon</div>
            <div className="dash-card__icon dash-card__icon--habits" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 id="card-habits" className="dash-card__title">Daily Habits</h2>
            <p className="dash-card__desc">Track sleep, hydration, exercise and more.</p>
          </article>

          {/* Goals */}
          <article className="dash-card" aria-labelledby="card-goals">
            <div className="dash-card__badge">Coming Soon</div>
            <div className="dash-card__icon dash-card__icon--goals" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
            </div>
            <h2 id="card-goals" className="dash-card__title">Health Goals</h2>
            <p className="dash-card__desc">Set targets and track your progress over time.</p>
          </article>

          {/* Assessment */}
          <article className="dash-card" aria-labelledby="card-assess">
            <div className="dash-card__badge">Coming Soon</div>
            <div className="dash-card__icon dash-card__icon--assess" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" />
              </svg>
            </div>
            <h2 id="card-assess" className="dash-card__title">Health Assessment</h2>
            <p className="dash-card__desc">Get a personalised risk profile based on your data.</p>
          </article>
        </div>
      </main>
    </div>
  );
}
