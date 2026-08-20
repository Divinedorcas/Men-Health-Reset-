import { useState, useEffect, useCallback } from 'react';
import { AuthContext } from './authContextInstance';
import {
  getStoredAuth,
  clearStoredAuth,
  signinUser,
  signupUser,
  signoutUser,
  fetchCurrentUser,
  recordActivity,
} from '../services/auth';

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(() => {
    const { token: savedToken, user: savedUser } = getStoredAuth();
    if (savedToken && savedUser) {
      return { token: savedToken, user: savedUser };
    }
    clearStoredAuth();
    return { token: null, user: null };
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const user = authState.user;
  const token = authState.token;

  // Listeners for global 401 events and user activity (AC-10)
  useEffect(() => {
    const handleUnauthorized = () => {
      setAuthState({ token: null, user: null });
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);

    const handleActivity = () => {
      recordActivity();
    };

    window.addEventListener('click', handleActivity);
    window.addEventListener('keydown', handleActivity);

    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('keydown', handleActivity);
    };
  }, []);

  const signIn = useCallback(async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await signinUser(email, password);
      setAuthState({ user: data.user, token: data.token });
      return data.user;
    } catch (err) {
      setError(err.message || 'Email or password is incorrect');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signUp = useCallback(async (email, password, name = '') => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await signupUser(email, password, name);
      setAuthState({ user: data.user, token: data.token });
      return data.user;
    } catch (err) {
      setError(err.message || 'Unable to create account');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    setIsLoading(true);
    try {
      await signoutUser();
    } finally {
      setAuthState({ user: null, token: null });
      setError(null);
      setIsLoading(false);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    try {
      const data = await fetchCurrentUser();
      setAuthState((prev) => ({ ...prev, user: data.user }));
    } catch {
      signOut();
    }
  }, [signOut]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = {
    user,
    token,
    isAuthenticated: Boolean(token && user),
    isLoading,
    error,
    signIn,
    signUp,
    signOut,
    refreshProfile,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
