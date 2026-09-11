<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
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
    // AC-09 — 5 consecutive failed logins trigger a rate-limit block
    // ─────────────────────────────────────────────────────────────

    public function test_too_many_failed_logins_are_rate_limited(): void
    {
        // Clear any lingering rate-limit state from other tests.
        RateLimiter::clear('login:ratelimit@example.com|127.0.0.1');

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
}
