import { AuthProvider, useAuth } from './context/AuthContext';
import AuthPage from './components/AuthPage';
import DashboardPage from './components/DashboardPage';
import './App.css';

/**
 * Main application content router/switcher.
 *
 * Guarantees:
 *  - When session is bootstrapping, displays a sleek loading state (AC-04 — prevents flash of content)
 *  - When authenticated, renders DashboardPage (AC-01, AC-02, AC-03)
 *  - When unauthenticated, renders AuthPage (AC-01, AC-02, AC-04)
 */
function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="app-loading" role="status" aria-live="polite" aria-label="Loading session">
        <div className="app-loading__spinner" />
        <p>Verifying secure session...</p>
      </div>
    );
  }

  return (
    <div className="app-root">
      {isAuthenticated ? <DashboardPage /> : <AuthPage />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
