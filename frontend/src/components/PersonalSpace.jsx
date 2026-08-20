import { useAuth } from '../context/useAuth';

export default function PersonalSpace() {
  const { user, signOut, isLoading } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="personal-space" id="protected-space-root">
      {/* Top Navigation Bar */}
      <header className="space-header">
        <div className="header-brand">
          <span className="brand-logo-icon">🌿</span>
          <div>
            <h2 className="brand-title">Men&apos;s Health Reset OS</h2>
            <span className="brand-badge-small">Protected Personal Space</span>
          </div>
        </div>

        <div className="header-actions">
          <div className="user-pill" id="user-profile-badge">
            <span className="user-avatar">
              {(user?.name || user?.email || 'M').charAt(0).toUpperCase()}
            </span>
            <div className="user-details">
              <span className="user-email">{user?.email}</span>
              <span className="session-status">● Session Active</span>
            </div>
          </div>

          <button
            type="button"
            className="signout-button"
            onClick={handleSignOut}
            disabled={isLoading}
            id="signout-button"
          >
            {isLoading ? 'Signing out...' : 'Sign Out'}
          </button>
        </div>
      </header>

      {/* Main Dashboard Surface */}
      <main className="space-main">
        {/* Personalized Welcome Banner */}
        <section className="welcome-banner">
          <div className="welcome-text">
            <h1>Welcome to your private space, {user?.name || 'Friend'}</h1>
            <p>
              Your personal health baseline and biometric dashboard are secured under your account.
              No unauthenticated visitor or third party can access this data.
            </p>
          </div>
          <div className="welcome-stats">
            <div className="stat-badge">
              <span className="stat-label">Security Tier</span>
              <span className="stat-val">Sanctum Token</span>
            </div>
            <div className="stat-badge">
              <span className="stat-label">Auto-Lock</span>
              <span className="stat-val">30m Inactivity</span>
            </div>
          </div>
        </section>

        {/* Dashboard Grid */}
        <div className="dashboard-grid">
          {/* Health Metric Slice Readiness Card */}
          <div className="dashboard-card primary">
            <div className="card-header">
              <span className="card-icon">📊</span>
              <div>
                <h3>Personal Health Metric</h3>
                <span className="card-sub">Sprint 01 Vertical Slice</span>
              </div>
            </div>
            <div className="card-body">
              <div className="metric-placeholder">
                <div className="metric-icon-large">❤️</div>
                <div className="metric-info">
                  <span className="metric-status-tag">Ready for Connection</span>
                  <h4>Baseline Heart Rate &amp; Vitals</h4>
                  <p>
                    Your authenticated account is now connected and ready to record real health data in the next sprint task.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Account & Security Card */}
          <div className="dashboard-card">
            <div className="card-header">
              <span className="card-icon">🛡️</span>
              <div>
                <h3>Account Security</h3>
                <span className="card-sub">Credential Protection</span>
              </div>
            </div>
            <div className="card-body">
              <ul className="security-checklist">
                <li className="check-item">
                  <span className="check-bullet">✓</span>
                  <span>Bcrypt password hashing active</span>
                </li>
                <li className="check-item">
                  <span className="check-bullet">✓</span>
                  <span>5-attempt brute force rate limiting enforced</span>
                </li>
                <li className="check-item">
                  <span className="check-bullet">✓</span>
                  <span>Bearer token authenticated sessions</span>
                </li>
                <li className="check-item">
                  <span className="check-bullet">✓</span>
                  <span>30-minute inactivity auto-lock active</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Quick Habits & Lifestyle Card */}
          <div className="dashboard-card">
            <div className="card-header">
              <span className="card-icon">🎯</span>
              <div>
                <h3>Health Focus Areas</h3>
                <span className="card-sub">Preventive OS Modules</span>
              </div>
            </div>
            <div className="card-body">
              <div className="focus-tags">
                <span className="focus-tag">Metabolic Health</span>
                <span className="focus-tag">Sleep Recovery</span>
                <span className="focus-tag">Cardiovascular Baseline</span>
                <span className="focus-tag">Nutrition Architecture</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
