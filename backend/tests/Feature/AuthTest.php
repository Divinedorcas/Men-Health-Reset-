<?php

namespace Tests\Feature;

use App\Models\User;
use App\Services\Auth\AuthService;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;
use Tests\TestCase;

/**
 * Authentication Feature Tests
 *
 * Covers all Acceptance Criteria (AC-01 through AC-11) for the
 * Men's Health Reset authentication sprint.
 */
class AuthTest extends TestCase
{
    use RefreshDatabase;

    // ─────────────────────────────────────────────────────────────
    // AC-01 — New user can register and is immediately signed in
    // ─────────────────────────────────────────────────────────────

    public function test_new_user_can_register_and_receives_token(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'email' => 'john@example.com',
            'password' => 'SecurePass1!',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'user' => ['id', 'email'],
                'token',
            ])
            ->assertJsonPath('user.email', 'john@example.com');

        $this->assertDatabaseHas('users', ['email' => 'john@example.com']);
    }

    // ─────────────────────────────────────────────────────────────
    // AC-02 — Existing user can sign in and receives token
    // ─────────────────────────────────────────────────────────────

    public function test_existing_user_can_sign_in(): void
    {
        User::factory()->create([
            'email' => 'john@example.com',
            'password' => Hash::make('SecurePass1!'),
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'john@example.com',
            'password' => 'SecurePass1!',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'user' => ['id', 'email'],
                'token',
            ]);
    }

    // ─────────────────────────────────────────────────────────────
    // AC-03 — Signed-in user can sign out; token is revoked
    // ─────────────────────────────────────────────────────────────

    public function test_user_can_sign_out_and_token_is_revoked(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('auth_token')->plainTextToken;

        $this->withToken($token)
            ->postJson('/api/auth/logout')
            ->assertStatus(200)
            ->assertJsonPath('message', 'Signed out successfully.');

        // Token is now invalid — protected route must reject it.
        $this->withToken($token)
            ->getJson('/api/auth/me')
            ->assertStatus(401);
    }

    // ─────────────────────────────────────────────────────────────
    // AC-04 — Accessing protected space without token returns 401
    //         (no flash of protected content, no blank page)
    // ─────────────────────────────────────────────────────────────

    public function test_unauthenticated_request_to_protected_route_returns_401(): void
    {
        $this->getJson('/api/auth/me')->assertStatus(401);
    }

    // ─────────────────────────────────────────────────────────────
    // AC-05 — Duplicate email shows a friendly error on signup
    // ─────────────────────────────────────────────────────────────

    public function test_registering_with_duplicate_email_shows_friendly_error(): void
    {
        User::factory()->create(['email' => 'john@example.com']);

        $response = $this->postJson('/api/auth/register', [
            'email' => 'john@example.com',
            'password' => 'SecurePass1!',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email'])
            ->assertJsonPath('errors.email.0', 'This email is already registered.');
    }

    // ─────────────────────────────────────────────────────────────
    // AC-06 — Wrong password returns the exact required message
    //         (does NOT distinguish between bad email vs bad password)
    // ─────────────────────────────────────────────────────────────

    public function test_wrong_password_returns_uniform_error(): void
    {
        User::factory()->create([
            'email' => 'john@example.com',
            'password' => Hash::make('CorrectPassword1!'),
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'john@example.com',
            'password' => 'WrongPassword!',
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('errors.email.0', 'Email or password is incorrect');
    }

    public function test_nonexistent_email_returns_same_uniform_error(): void
    {
        $response = $this->postJson('/api/auth/login', [
            'email' => 'nobody@example.com',
            'password' => 'SomePassword1!',
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('errors.email.0', 'Email or password is incorrect');
    }

    // ─────────────────────────────────────────────────────────────
    // AC-07 — Empty fields show inline validation errors (no request sent)
    // ─────────────────────────────────────────────────────────────

    public function test_signup_with_empty_email_shows_inline_error(): void
    {
        $this->postJson('/api/auth/register', [
            'email' => '',
            'password' => 'SecurePass1!',
        ])->assertStatus(422)->assertJsonValidationErrors(['email']);
    }

    public function test_signup_with_empty_password_shows_inline_error(): void
    {
        $this->postJson('/api/auth/register', [
            'email' => 'john@example.com',
            'password' => '',
        ])->assertStatus(422)->assertJsonValidationErrors(['password']);
    }

    public function test_login_with_empty_fields_shows_inline_errors(): void
    {
        $this->postJson('/api/auth/login', [
            'email' => '',
            'password' => '',
        ])->assertStatus(422)->assertJsonValidationErrors(['email', 'password']);
    }

    // ─────────────────────────────────────────────────────────────
    // AC-08 — Password minimum length (8 chars) and at least 64 accepted
    // ─────────────────────────────────────────────────────────────

    public function test_short_password_returns_exact_required_message(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'email' => 'john@example.com',
            'password' => 'short',          // 5 chars — under minimum
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('errors.password.0', 'Password must be at least 8 characters');
    }

    public function test_password_of_64_characters_is_accepted(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'email' => 'john@example.com',
            'password' => str_repeat('A1!b', 16), // 64 chars
        ]);

        $response->assertStatus(201);
    }

    // ─────────────────────────────────────────────────────────────
    // AC-09 — 5 consecutive failed logins trigger a rate-limit block (per account)
    // ─────────────────────────────────────────────────────────────

    public function test_too_many_failed_logins_are_rate_limited(): void
    {
        // Clear any lingering rate-limit state from other tests.
        RateLimiter::clear('login:ratelimit@example.com');

        User::factory()->create([
            'email' => 'ratelimit@example.com',
            'password' => Hash::make('CorrectPassword1!'),
        ]);

        // Exhaust 5 allowed attempts.
        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/auth/login', [
                'email' => 'ratelimit@example.com',
                'password' => 'WrongPassword!',
            ]);
        }

        // The 6th attempt must be blocked.
        $response = $this->postJson('/api/auth/login', [
            'email' => 'ratelimit@example.com',
            'password' => 'WrongPassword!',
        ]);

        $response->assertStatus(429)
            ->assertJsonPath('message', 'Too many attempts. Please try again in a few minutes.');
    }

    public function test_lockout_protects_account_even_when_attacker_rotates_ip(): void
    {
        RateLimiter::clear('login:rotating@example.com');

        User::factory()->create([
            'email' => 'rotating@example.com',
            'password' => Hash::make('CorrectPassword1!'),
        ]);

        // Attacker sends 5 wrong passwords from 5 different IP addresses
        for ($i = 1; $i <= 5; $i++) {
            $this->withServerVariables(['REMOTE_ADDR' => "198.51.100.{$i}"])
                ->postJson('/api/auth/login', [
                    'email' => 'rotating@example.com',
                    'password' => 'WrongPassword!',
                ])
                ->assertStatus(422);
        }

        // 6th attempt from yet another IP must still be blocked by account lockout
        $this->withServerVariables(['REMOTE_ADDR' => '203.0.113.99'])
            ->postJson('/api/auth/login', [
                'email' => 'rotating@example.com',
                'password' => 'WrongPassword!',
            ])
            ->assertStatus(429)
            ->assertJsonPath('message', 'Too many attempts. Please try again in a few minutes.');
    }

    // ─────────────────────────────────────────────────────────────
    // AC-11 — Password is never exposed in any response payload
    // ─────────────────────────────────────────────────────────────

    public function test_password_is_never_returned_in_registration_response(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'email' => 'john@example.com',
            'password' => 'SecurePass1!',
        ]);

        $response->assertStatus(201)
            ->assertJsonMissingPath('user.password');

        $this->assertStringNotContainsString('SecurePass1!', $response->getContent());
        $this->assertStringNotContainsString('password', $response->getContent());
    }

    public function test_password_is_never_returned_in_login_response(): void
    {
        User::factory()->create([
            'email' => 'john@example.com',
            'password' => Hash::make('SecurePass1!'),
        ]);

        $response = $this->postJson('/api/auth/login', [
            'email' => 'john@example.com',
            'password' => 'SecurePass1!',
        ]);

        $response->assertStatus(200)
            ->assertJsonMissingPath('user.password');

        $this->assertStringNotContainsString('SecurePass1!', $response->getContent());
        $this->assertStringNotContainsString('password', $response->getContent());
    }

    public function test_password_is_never_returned_in_me_response(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('auth_token')->plainTextToken;

        $response = $this->withToken($token)->getJson('/api/auth/me');

        $response->assertStatus(200)
            ->assertJsonMissingPath('password');
    }

    // ─────────────────────────────────────────────────────────────
    // AC-10 — Session and bearer token expire after 30 minutes
    // ─────────────────────────────────────────────────────────────

    public function test_bearer_token_is_valid_within_30_minutes(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('auth_token')->plainTextToken;

        // Within the 30-minute inactivity window, token is accepted.
        $this->travel(29)->minutes();
        $this->withToken($token)
            ->getJson('/api/auth/me')
            ->assertStatus(200);
    }

    public function test_bearer_token_expires_after_30_minutes_of_inactivity(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('auth_token')->plainTextToken;

        // After 30 minutes of complete inactivity, token is expired and rejected with 401.
        $this->travel(31)->minutes();
        $this->withToken($token)
            ->getJson('/api/auth/me')
            ->assertStatus(401);
    }

    public function test_continuous_activity_extends_session_beyond_initial_30_minutes(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('auth_token')->plainTextToken;

        // 20 minutes in: make a request to refresh last_used_at
        $this->travel(20)->minutes();
        $this->withToken($token)
            ->getJson('/api/auth/me')
            ->assertStatus(200);

        // Reset auth guards so next test request re-evaluates token
        Auth::guard('sanctum')->forgetUser();
        Auth::forgetGuards();

        // 45 minutes total (25 minutes after last request): token remains valid because user was active
        $this->travel(25)->minutes();
        $this->withToken($token)
            ->getJson('/api/auth/me')
            ->assertStatus(200);

        Auth::guard('sanctum')->forgetUser();
        Auth::forgetGuards();

        // 80 minutes total (35 minutes of inactivity since last request): token expires
        $this->travel(35)->minutes();
        $this->withToken($token)
            ->getJson('/api/auth/me')
            ->assertStatus(401);
    }

    // ─────────────────────────────────────────────────────────────
    // AC-05 — Database unique constraint race condition handling
    // ─────────────────────────────────────────────────────────────

    public function test_concurrent_registration_race_condition_returns_friendly_validation_error(): void
    {
        User::factory()->create(['email' => 'race@example.com']);

        $authService = app(AuthService::class);

        $this->expectException(ValidationException::class);

        try {
            $authService->register('race@example.com', 'SecurePass1!');
        } catch (ValidationException $e) {
            $this->assertSame('This email is already registered.', $e->errors()['email'][0]);
            throw $e;
        }
    }

    public function test_unrelated_database_failure_during_registration_surfaces_as_server_error(): void
    {
        $authService = app(AuthService::class);

        // A QueryException that is NOT a duplicate email error (e.g. disk failure)
        // must NOT be caught as a duplicate email validation error.
        $pdoException = new \PDOException('Disk full or connection severed', 500);
        $unrelatedException = new QueryException(
            'sqlite',
            'insert into users ...',
            [],
            $pdoException
        );

        // Mock User model create to throw unrelated exception
        $this->expectException(QueryException::class);
        $this->expectExceptionMessage('Disk full or connection severed');

        User::creating(function () use ($unrelatedException) {
            throw $unrelatedException;
        });

        $authService->register('unrelated@example.com', 'SecurePass1!');
    }
}
