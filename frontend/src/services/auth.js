/**
 * Authentication Service & API Client for Men's Health Reset OS
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const TOKEN_KEY = 'mhr_auth_token';
const USER_KEY = 'mhr_auth_user';
const LAST_ACTIVE_KEY = 'mhr_last_active';
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes (AC-10)

/**
 * Update the last active timestamp
 */
export function recordActivity() {
  localStorage.setItem(LAST_ACTIVE_KEY, Date.now().toString());
}

/**
 * Check if the current local session is still valid
 */
export function isSessionActive() {
  const token = localStorage.getItem(TOKEN_KEY);
  const lastActiveStr = localStorage.getItem(LAST_ACTIVE_KEY);

  if (!token || !lastActiveStr) {
    return false;
  }

  const lastActive = parseInt(lastActiveStr, 10);
  if (isNaN(lastActive)) {
    return false;
  }

  if (Date.now() - lastActive > INACTIVITY_TIMEOUT_MS) {
    // Session expired due to inactivity
    clearStoredAuth();
    return false;
  }

  return true;
}

/**
 * Save auth data to storage
 */
export function setStoredAuth(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  recordActivity();
}

/**
 * Retrieve stored auth data
 */
export function getStoredAuth() {
  if (!isSessionActive()) {
    return { token: null, user: null };
  }

  const token = localStorage.getItem(TOKEN_KEY);
  const userJson = localStorage.getItem(USER_KEY);
  let user = null;

  if (userJson) {
    try {
      user = JSON.parse(userJson);
    } catch {
      user = null;
    }
  }

  return { token, user };
}

/**
 * Clear stored auth data
 */
export function clearStoredAuth() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(LAST_ACTIVE_KEY);
}

/**
 * Unified API request wrapper
 */
async function request(endpoint, options = {}) {
  const { token } = getStoredAuth();
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle 401 Unauthorized globally (AC-10)
  if (response.status === 401 && token) {
    clearStoredAuth();
    window.dispatchEvent(new CustomEvent('auth:unauthorized'));
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.message || 'An error occurred during request.');
    error.status = response.status;
    error.errors = data.errors || {};
    throw error;
  }

  recordActivity();
  return data;
}

/**
 * Register a new user
 */
export async function signupUser(email, password, name = '') {
  const data = await request('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, name }),
  });

  if (data.token && data.user) {
    setStoredAuth(data.token, data.user);
  }

  return data;
}

/**
 * Authenticate existing user
 */
export async function signinUser(email, password) {
  const data = await request('/api/auth/signin', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  if (data.token && data.user) {
    setStoredAuth(data.token, data.user);
  }

  return data;
}

/**
 * Sign out user
 */
export async function signoutUser() {
  try {
    await request('/api/auth/signout', {
      method: 'POST',
    });
  } catch {
    // Even if the network call fails, clear local credentials
  } finally {
    clearStoredAuth();
  }
}

/**
 * Fetch current user profile
 */
export async function fetchCurrentUser() {
  return request('/api/auth/user');
}
