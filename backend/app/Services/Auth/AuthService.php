<?php

namespace App\Services\Auth;

use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Database\UniqueConstraintViolationException;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
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
        try {
            $user = User::create([
                'email' => strtolower(trim($email)),
                'name' => explode('@', trim($email))[0], // default display name
                'password' => Hash::make($password),
            ]);
        } catch (QueryException $e) {
            // Only catch the specific duplicate-email database constraint error (AC-05).
            // All other database failures must surface as actual server errors (500).
            if ($this->isDuplicateEmailException($e)) {
                throw ValidationException::withMessages([
                    'email' => 'This email is already registered.',
                ]);
            }

            throw $e;
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return ['user' => $user, 'token' => $token];
    }

    /**
     * Attempt to authenticate a user by email and password.
     *
     * Applies rate-limiting: after 5 consecutive failures the account is
     * locked for DECAY_SECONDS and a 429 exception is raised (AC-09).
     * Keyed per account so rotating source IP does not bypass lockout.
     *
     * @return array{user: User, token: string}
     *
     * @throws ValidationException
     * @throws TooManyRequestsHttpException
     */
    public function login(string $email, string $password, ?string $ipAddress = null): array
    {
        $throttleKey = $this->throttleKey($email);

        // Check rate limit BEFORE attempting credentials (AC-09).
        if (RateLimiter::tooManyAttempts($throttleKey, self::MAX_ATTEMPTS)) {
            abort(429, 'Too many attempts. Please try again in a few minutes.');
        }

        $user = User::where('email', strtolower(trim($email)))->first();

        // Mitigation against timing attacks / user enumeration (OWASP):
        // Always run Hash::check() even when $user is not found so the response time
        // does not leak account existence.
        $dummyHash = '$2y$10$x88EYib.0.ofFObWFfR1CeUqcG10MtCtZVlZZ0H17Jeu/ZzN/8b12';
        $passwordMatches = Hash::check($password, $user?->password ?? $dummyHash);

        if (! $user || ! $passwordMatches) {
            // Record a failed attempt against the account throttle key.
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
     * Revoke the current bearer token (sign out).
     *
     * Accepts the full Request so we can call currentAccessToken() on the
     * Sanctum-authenticated user — guaranteeing a real DB-backed
     * PersonalAccessToken is deleted, never a no-op TransientToken.
     */
    public function logout(Request $request): void
    {
        // Revoke only the token that was used for this request.
        $request->user()->currentAccessToken()->delete();

        // Clear cached guard instances and the authenticated user so subsequent
        // requests in the same process (e.g. tests) must re-authenticate.
        Auth::guard('sanctum')->forgetUser();
        Auth::forgetGuards();
    }

    /**
     * Build a unique throttle key keyed by account to protect against credential stuffing (AC-09).
     *
     * Tradeoff Decision (see docs/decisions/002-account-lockout-tradeoff.md):
     * Keying strictly by email prevents attackers from bypassing lockout via IP/proxy rotation.
     * The accepted tradeoff is that a malicious actor who knows a victim's email could intentionally
     * submit 5 bad passwords to temporarily lock the account for 5 minutes. This is accepted
     * in favor of absolute protection against automated password brute-forcing.
     */
    private function throttleKey(string $email): string
    {
        return 'login:'.strtolower(trim($email));
    }

    /**
     * Determine if a QueryException was specifically caused by a duplicate email constraint.
     */
    private function isDuplicateEmailException(QueryException $e): bool
    {
        $message = strtolower($e->getMessage());

        $isUniqueViolation = $e instanceof UniqueConstraintViolationException
            || str_contains($message, 'unique')
            || str_contains($message, 'duplicate entry')
            || $e->getCode() === '23000'
            || $e->getCode() === 23000
            || $e->getCode() === '23505';

        $isEmailField = str_contains($message, 'email')
            || str_contains($message, 'users.email')
            || str_contains($message, 'users_email_unique');

        return $isUniqueViolation && $isEmailField;
    }
}
