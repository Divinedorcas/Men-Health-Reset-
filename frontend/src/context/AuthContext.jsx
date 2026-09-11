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
  const [user, setUser]           = useState(null);
  const [token, setToken]         = useState(() => localStorage.getItem('mhr_token'));
  const [isLoading, setIsLoading] = useState(true); // true until bootstrap finishes
  const inactivityTimer           = useRef(null);

  // ── Persist / clear session ───────────────────────────────────────────────

  const persistSession = useCallback((newUser, newToken) => {
    localStorage.setItem('mhr_token', newToken);
    setToken(newToken);
    setUser(newUser);
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem('mhr_token');
    setToken(null);
    setUser(null);
    if (inactivityTimer.current) {
      clearTimeout(inactivityTimer.current);
    }
  }, []);

  // ── Sign out action (always reads latest token from storage) ───────────────

  const signout = useCallback(async () => {
    try {
      const activeToken = localStorage.getItem('mhr_token');
      if (activeToken) {
        await authApi.logout();
      }
    } catch {
      // Even if API call fails or server is unreachable, clear local state.
    } finally {
      clearSession();
    }
  }, [clearSession]);

  // Keep a ref to the latest signout function so timers never capture a stale closure.
  const signoutRef = useRef(signout);
  useEffect(() => {
    signoutRef.current = signout;
  }, [signout]);

  // ── Inactivity timer & user activity listeners (AC-10) ────────────────────

  useEffect(() => {
    if (!token) {
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }
      return;
    }

    const resetTimer = () => {
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }
      inactivityTimer.current = setTimeout(() => {
        // Session expired due to inactivity — sign out and revoke token on server (AC-10).
        signoutRef.current?.();
      }, INACTIVITY_TIMEOUT_MS);
    };

    const events = ['mousemove', 'keydown', 'pointerdown', 'scroll'];
    events.forEach((e) => window.addEventListener(e, resetTimer, { passive: true }));
    resetTimer();

    return () => {
      events.forEach((e) => window.removeEventListener(e, resetTimer));
      if (inactivityTimer.current) {
        clearTimeout(inactivityTimer.current);
      }
    };
  }, [token]);

  // ── Bootstrap: verify token on mount (AC-04 — no flash of protected content) ──

  useEffect(() => {
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
      } catch {
        // Token invalid / expired — clear state (AC-04, AC-10).
        clearSession();
      } finally {
        setIsLoading(false);
      }
    }

    bootstrap();
  }, [clearSession]);

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
    return newUser;
  }

  /** Sign in an existing user (AC-02). */
  async function login(email, password) {
    const { user: newUser, token: newToken } = await authApi.login(email, password);
    persistSession(newUser, newToken);
    return newUser;
  }

  const isAuthenticated = Boolean(user && token);

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
