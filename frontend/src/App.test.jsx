import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import App from './App';
import * as authService from './services/auth';

describe('Men\'s Health Reset OS - Authentication & Protected Space', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('AC-04: shows sign-in screen by default when not authenticated (no blank screen)', () => {
    render(<App />);

    expect(screen.getByRole('heading', { name: /Welcome Back/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/you@example\.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Enter your password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In to Dashboard/i })).toBeInTheDocument();
  });

  it('AC-07: shows inline validation errors when submitting empty form without network call', async () => {
    const fetchSpy = vi.spyOn(window, 'fetch');
    render(<App />);

    const submitBtn = screen.getByRole('button', { name: /Sign In to Dashboard/i });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
    expect(screen.getByText(/Password is required/i)).toBeInTheDocument();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('AC-08: switches to signup tab and enforces minimum 8 character password', async () => {
    const user = userEvent.setup();
    render(<App />);

    // Switch to Create Account tab
    const signupTab = screen.getByRole('tab', { name: /Create Account/i });
    await user.click(signupTab);

    expect(screen.getByRole('heading', { name: /Claim Your Space/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Account & Enter Space/i })).toBeInTheDocument();

    // Type valid email and short password (7 chars)
    const emailInput = screen.getByPlaceholderText(/you@example\.com/i);
    const passInput = screen.getByPlaceholderText(/At least 8 characters/i);

    await user.type(emailInput, 'test@example.com');
    await user.type(passInput, 'short12');

    const submitBtn = screen.getByRole('button', { name: /Create Account & Enter Space/i });
    await user.click(submitBtn);

    expect(screen.getByText(/Password must be at least 8 characters/i)).toBeInTheDocument();
  });

  it('AC-01 & AC-02: successful authentication enters the protected personal space', async () => {
    const user = userEvent.setup();

    vi.spyOn(authService, 'signinUser').mockResolvedValue({
      message: 'Signed in successfully.',
      user: {
        id: 1,
        name: 'Alex',
        email: 'alex@example.com',
      },
      token: 'mock-valid-sanctum-token',
    });

    render(<App />);

    const emailInput = screen.getByPlaceholderText(/you@example\.com/i);
    const passInput = screen.getByPlaceholderText(/Enter your password/i);
    const submitBtn = screen.getByRole('button', { name: /Sign In to Dashboard/i });

    await user.type(emailInput, 'alex@example.com');
    await user.type(passInput, 'validpassword123');
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Welcome to your private space, Alex/i)).toBeInTheDocument();
      expect(screen.getByText('alex@example.com')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Sign Out/i })).toBeInTheDocument();
    });
  });

  it('AC-03: signed-in user can sign out and returns immediately to sign-in form', async () => {
    const user = userEvent.setup();

    // Seed local storage with active session
    authService.setStoredAuth('existing-token', {
      id: 2,
      name: 'Marcus',
      email: 'marcus@example.com',
    });

    vi.spyOn(authService, 'signoutUser').mockResolvedValue();

    render(<App />);

    // Authenticated dashboard is rendered
    expect(screen.getByText('marcus@example.com')).toBeInTheDocument();

    const signoutBtn = screen.getByRole('button', { name: /Sign Out/i });
    await user.click(signoutBtn);

    // Redirected back to sign in
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Welcome Back/i })).toBeInTheDocument();
      expect(screen.queryByText(/Welcome to your private space/i)).not.toBeInTheDocument();
    });
  });

  it('AC-09: renders rate-limiting alert banner when server returns 429', async () => {
    const user = userEvent.setup();

    const error429 = new Error('Too many attempts. Please try again in a few minutes.');
    error429.status = 429;
    vi.spyOn(authService, 'signinUser').mockRejectedValue(error429);

    render(<App />);

    const emailInput = screen.getByPlaceholderText(/you@example\.com/i);
    const passInput = screen.getByPlaceholderText(/Enter your password/i);
    const submitBtn = screen.getByRole('button', { name: /Sign In to Dashboard/i });

    await user.type(emailInput, 'victim@example.com');
    await user.type(passInput, 'wrongpassword');
    await user.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Too many attempts. Please try again in a few minutes.')).toBeInTheDocument();
    });
  });
});
