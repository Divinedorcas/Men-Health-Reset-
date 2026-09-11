<?php

namespace App\Services\Auth;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\TooManyRequestsHttpException;

class AuthService
{
    /**
     * Number of allowed failed login attempts before throttling.
     */
    private const MAX_ATTEMPTS = 5;

    /**
     * Seconds to lock out a throttled account (5 minutes).
     */
    private const DECAY_SECONDS = 300;

    /**
     * Register a new user and return their Sanctum token.
     *
     * @return array{user: User, token: string}
     */
    public function register(string $email, string $password): array
    {
        $user = User::create([
            'email' => strtolower(trim($email)),
            'name' => explode('@', trim($email))[0], // default display name
            'password' => Hash::make($password),
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return ['user' => $user, 'token' => $token];
    }

    /**
     * Attempt to authenticate a user by email and password.
     *
     * Applies rate-limiting: after 5 consecutive failures the account is
     * locked for DECAY_SECONDS and a 429 exception is raised.
     *
     * @return array{user: User, token: string}
     *
     * @throws ValidationException
     * @throws TooManyRequestsHttpException
     */
    public function login(string $email, string $password, string $ipAddress): array
    {
        $throttleKey = $this->throttleKey($email, $ipAddress);

        // Check rate limit BEFORE attempting credentials.
        if (RateLimiter::tooManyAttempts($throttleKey, self::MAX_ATTEMPTS)) {
            $seconds = RateLimiter::availableIn($throttleKey);

            abort(429, 'Too many attempts. Please try again in a few minutes.');
        }

        $user = User::where('email', strtolower(trim($email)))->first();

        if (! $user || ! Hash::check($password, $user->password)) {
            // Record a failed attempt against the throttle key.
            RateLimiter::hit($throttleKey, self::DECAY_SECONDS);

            throw ValidationException::withMessages([
                'email' => 'Email or password is incorrect',
            ]);
        }

        // Successful login — clear the throttle counter.
        RateLimiter::clear($throttleKey);

        $token = $user->createToken('auth_token')->plainTextToken;

        return ['user' => $user, 'token' => $token];
    }

    /**
     * Revoke the current user's token (sign out).
     */
    public function logout(User $user): void
    {
        // Revoke only the current token, not all tokens.
        $user->currentAccessToken()->delete();
    }

    /**
     * Build a unique throttle key combining the email and IP address.
     */
    private function throttleKey(string $email, string $ipAddress): string
    {
        return 'login:'.strtolower(trim($email)).'|'.$ipAddress;
    }
}
