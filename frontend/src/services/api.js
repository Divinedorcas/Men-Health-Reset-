/**
 * Centralized API client for Men's Health Reset OS.
 *
 * - Attaches the Sanctum bearer token on every request.
 * - Intercepts 401 responses and triggers signout via a custom event.
 * - Passwords are never logged, echoed, or stored (AC-11).
 */

const API_BASE = '/api';

/** Read the stored auth token from localStorage. */
function getToken() {
  return localStorage.getItem('mhr_token');
}

/**
 * Generic JSON fetch wrapper.
 *
 * @param {string} path     - e.g. '/auth/login'
 * @param {object} [opts]   - fetch options (method, body, etc.)
 * @returns {Promise<object>}
 */
async function request(path, opts = {}) {
  const token = getToken();

  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...opts.headers,
  };

  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers,
  });

  if (res.status === 401) {
    // Token is invalid / expired — broadcast a session-expired event so
    // AuthContext can clear state and redirect to sign-in (AC-03, AC-10).
    window.dispatchEvent(new CustomEvent('mhr:session-expired'));
    throw new Error('Session expired');
  }

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    // Surface the structured error from Laravel's validation response.
    const err = new Error(data.message || 'Request failed');
    err.status = res.status;
    err.errors = data.errors || {};
    throw err;
  }

  return data;
}

// ─── Auth endpoints ───────────────────────────────────────────────────────────

export const authApi = {
  /**
   * POST /api/auth/register
   * Returns { user: { id, email }, token }
   */
  register: (email, password) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  /**
   * POST /api/auth/login
   * Returns { user: { id, email }, token }
   */
  login: (email, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  /**
   * POST /api/auth/logout  (requires bearer token)
   */
  logout: () =>
    request('/auth/logout', { method: 'POST' }),

  /**
   * GET /api/auth/me  (requires bearer token)
   * Returns { id, email }
   */
  me: () => request('/auth/me'),
};
