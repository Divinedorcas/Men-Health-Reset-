/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { authApi } from '../services/api';

/**
 * Authentication Context for Men's Health Reset OS.
 *
 * Responsibilities:
 *  - Bootstrap: verify stored token on mount before rendering anything (AC-04)
 *  - Provide signup / login / logout helpers
 *  - Auto-signout on 401 / session-expired event (AC-03, AC-10)
 *  - Session inactivity timeout: 30 minutes (AC-10)
 *  - Never store or log plain passwords (AC-11)
 */

/** Session inactivity timeout: 30 minutes (1 800 000 ms). */
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000;

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]             = useState(null);
  const [token, setToken]           = useState(() => localStorage.getItem('mhr_token'));
  const [isLoading, setIsLoading]   = useState(true); // true until bootstrap finishes
  const inactivityTimer             = useRef(null);

  // ── Inactivity timer ──────────────────────────────────────────────────────

  const resetInactivityTimer = useCallback(() => {
    clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(() => {
      // Session expired due to inactivity — sign out silently (AC-10).
      signout();
    }, INACTIVITY_TIMEOUT_MS);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const startActivityListeners = useCallback(() => {
    const events = ['mousemove', 'keydown', 'pointerdown', 'scroll'];
    const handler = () => resetInactivityTimer();
    events.forEach((e) => window.addEventListener(e, handler, { passive: true }));
    resetInactivityTimer();

    return () => {
      events.forEach((e) => window.removeEventListener(e, handler));
      clearTimeout(inactivityTimer.current);
    };
  }, [resetInactivityTimer]);

  // ── Persist / clear token ─────────────────────────────────────────────────

  const persistSession = useCallback((newUser, newToken) => {
    localStorage.setItem('mhr_token', newToken);
    setToken(newToken);
    setUser(newUser);
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem('mhr_token');
    setToken(null);
    setUser(null);
    clearTimeout(inactivityTimer.current);
  }, []);

  // ── Bootstrap: verify token on mount (AC-04 — no flash of protected content) ──

  useEffect(() => {
    let stopListeners;

    async function bootstrap() {
      const storedToken = localStorage.getItem('mhr_token');

      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const userData = await authApi.me();
        setUser(userData);
        setToken(storedToken);
        stopListeners = startActivityListeners();
      } catch {
        // Token invalid / expired — clear state (AC-04, AC-10).
        clearSession();
      } finally {
        setIsLoading(false);
      }
    }

    bootstrap();

    return () => {
      if (stopListeners) stopListeners();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Listen for 401 session-expired events from the API client (AC-10) ─────

  useEffect(() => {
    const handler = () => clearSession();
    window.addEventListener('mhr:session-expired', handler);
    return () => window.removeEventListener('mhr:session-expired', handler);
  }, [clearSession]);

  // ── Auth actions ──────────────────────────────────────────────────────────

  /** Register and immediately sign in the user (AC-01). */
  async function signup(email, password) {
    const { user: newUser, token: newToken } = await authApi.register(email, password);
    persistSession(newUser, newToken);
    startActivityListeners();
    return newUser;
  }

  /** Sign in an existing user (AC-02). */
  async function login(email, password) {
    const { user: newUser, token: newToken } = await authApi.login(email, password);
    persistSession(newUser, newToken);
    startActivityListeners();
    return newUser;
  }

  /** Sign out, revoke token, clear local state (AC-03). */
  async function signout() {
    try {
      if (token) await authApi.logout();
    } catch {
      // Even if the API call fails, clear local state.
    } finally {
      clearSession();
    }
  }

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, isLoading, signup, login, signout }}>
      {children}
    </AuthContext.Provider>
  );
}

/** Hook for consuming auth context in any component. */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
