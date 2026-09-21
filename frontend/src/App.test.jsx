import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { authApi } from './services/api';

describe('App Root Wiring & Authentication Routing', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('renders loading state initially during bootstrap to prevent flash of content (AC-04)', () => {
    // Return a pending promise to keep it in loading state
    vi.spyOn(authApi, 'me').mockImplementation(() => new Promise(() => {}));
    localStorage.setItem('mhr_token', 'test-token');

    render(<App />);

    expect(screen.getByRole('status')).toBeDefined();
    expect(screen.getByText('Verifying secure session...')).toBeDefined();
  });

  it('mounts and renders AuthPage when unauthenticated (no Vite demo)', async () => {
    render(<App />);

    // Waits for bootstrap to finish and verifies real Auth UI is rendered
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: /Men's Health Reset/i })).toBeDefined();
    });

    // Form inputs and buttons exist
    expect(screen.getByLabelText(/Email Address/i)).toBeDefined();
    expect(screen.getByLabelText(/^Password$/i)).toBeDefined();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeDefined();

    // Verify Vite demo elements are completely absent
    expect(screen.queryByText('Count is 0')).toBeNull();
    expect(screen.queryByText(/Get started/i)).toBeNull();
  });

  it('renders DashboardPage with user info and Sign Out button when authenticated', async () => {
    localStorage.setItem('mhr_token', 'valid-sanctum-token');
    vi.spyOn(authApi, 'me').mockResolvedValue({
      id: 1,
      email: 'member@example.com',
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: /Welcome back/i })).toBeDefined();
    });

    expect(screen.getByText('member@example.com')).toBeDefined();
    expect(screen.getByRole('button', { name: /Sign Out/i })).toBeDefined();
    expect(screen.queryByText(/Sign in to Men's Health Reset/i)).toBeNull();
  });
});
