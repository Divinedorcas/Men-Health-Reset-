import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/useAuth';
import AuthForm from './components/AuthForm';
import PersonalSpace from './components/PersonalSpace';
import './App.css';

function MainRouter() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="loading-screen" role="status" aria-label="Loading session">
        <div className="loading-spinner"></div>
        <p className="loading-text">Verifying secure session...</p>
      </div>
    );
  }

  // AC-04: Visiting protected space while unauthenticated shows sign-in screen without content flash
  if (!isAuthenticated) {
    return <AuthForm />;
  }

  // AC-01, AC-02: Authenticated user is in their protected personal space
  return <PersonalSpace />;
}

export default function App() {
  return (
    <AuthProvider>
      <div className="app-root">
        <MainRouter />
      </div>
    </AuthProvider>
  );
}
