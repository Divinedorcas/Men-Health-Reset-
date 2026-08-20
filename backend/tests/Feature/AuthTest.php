<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        RateLimiter::clear('signin:test@example.com|127.0.0.1');
    }

    /**
     * AC-01: A new user can create an account by providing email and password,
     * is signed in immediately, and receives an auth token.
     */
    public function test_new_user_can_sign_up_and_receive_token(): void
    {
        $response = $this->postJson('/api/auth/signup', [
            'email' => 'newuser@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'message',
                'user' => ['id', 'email', 'name'],
                'token',
            ])
            ->assertJson([
                'user' => [
                    'email' => 'newuser@example.com',
                ],
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'newuser@example.com',
        ]);

        $user = User::where('email', 'newuser@example.com')->first();
        $this->assertTrue(Hash::check('password123', $user->password));
    }

    /**
     * AC-02: An existing user can sign in with their email and password.
     */
    public function test_existing_user_can_sign_in(): void
    {
        $user = User::factory()->create([
            'email' => 'existing@example.com',
            'password' => Hash::make('secret12345'),
        ]);

        $response = $this->postJson('/api/auth/signin', [
            'email' => 'existing@example.com',
            'password' => 'secret12345',
        ]);

        $response->assertStatus(200)
            ->assertJsonStructure([
                'message',
                'user' => ['id', 'email', 'name'],
                'token',
            ])
            ->assertJson([
                'user' => [
                    'email' => 'existing@example.com',
                ],
            ]);
    }

    /**
     * AC-03: A signed-in user can sign out, invalidating their token.
     */
    public function test_signed_in_user_can_sign_out(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token')->plainTextToken;

        $response = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/auth/signout');

        $response->assertStatus(200)
            ->assertJson([
                'message' => 'Signed out successfully.',
            ]);

        // Verify token was deleted from database
        $this->assertDatabaseCount('personal_access_tokens', 0);

        // Reset auth guards in test container and attempt request with deleted token
        $this->app['auth']->forgetGuards();

        $subsequentResponse = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/auth/user');

        $subsequentResponse->assertStatus(401);
    }

    /**
     * AC-04: Visiting protected user endpoint without auth token fails with 401.
     */
    public function test_unauthenticated_request_to_protected_endpoint_is_rejected(): void
    {
        $response = $this->getJson('/api/auth/user');

        $response->assertStatus(401);
    }

    /**
     * AC-05: Signing up with an already registered email returns a friendly 422 error.
     */
    public function test_signing_up_with_existing_email_returns_friendly_error(): void
    {
        User::factory()->create([
            'email' => 'duplicate@example.com',
        ]);

        $response = $this->postJson('/api/auth/signup', [
            'email' => 'duplicate@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'message' => 'This email is already registered.',
            ]);
    }

    /**
     * AC-06: Wrong password or non-existent email returns exact message:
     * "Email or password is incorrect" with status 401.
     */
    public function test_invalid_credentials_returns_exact_generic_error(): void
    {
        $user = User::factory()->create([
            'email' => 'valid@example.com',
            'password' => Hash::make('correctpassword'),
        ]);

        // Wrong password for existing user
        $responseWrongPass = $this->postJson('/api/auth/signin', [
            'email' => 'valid@example.com',
            'password' => 'wrongpassword',
        ]);

        $responseWrongPass->assertStatus(401)
            ->assertJson([
                'message' => 'Email or password is incorrect',
            ]);

        // Non-existent email
        $responseWrongEmail = $this->postJson('/api/auth/signin', [
            'email' => 'nonexistent@example.com',
            'password' => 'anypassword',
        ]);

        $responseWrongEmail->assertStatus(401)
            ->assertJson([
                'message' => 'Email or password is incorrect',
            ]);
    }

    /**
     * AC-08: Password minimum length of 8 characters enforced with exact message:
     * "Password must be at least 8 characters".
     */
    public function test_password_length_validation_on_signup(): void
    {
        $response = $this->postJson('/api/auth/signup', [
            'email' => 'shortpass@example.com',
            'password' => '1234567', // 7 chars
        ]);

        $response->assertStatus(422)
            ->assertJson([
                'message' => 'Password must be at least 8 characters.',
            ]);
    }

    /**
     * AC-09: 5 consecutive failed signin attempts triggers rate limiting with exact message:
     * "Too many attempts. Please try again in a few minutes." (HTTP 429).
     */
    public function test_rate_limiting_after_five_failed_attempts(): void
    {
        $email = 'target@example.com';
        User::factory()->create([
            'email' => $email,
            'password' => Hash::make('realpassword123'),
        ]);

        for ($i = 1; $i <= 4; $i++) {
            $response = $this->postJson('/api/auth/signin', [
                'email' => $email,
                'password' => 'badpassword',
            ]);
            $response->assertStatus(401);
        }

        // 5th failed attempt breaches the limit
        $response5th = $this->postJson('/api/auth/signin', [
            'email' => $email,
            'password' => 'badpassword',
        ]);
        $response5th->assertStatus(429)
            ->assertJson([
                'message' => 'Too many attempts. Please try again in a few minutes.',
            ]);

        // 6th attempt should also be blocked immediately
        $response6th = $this->postJson('/api/auth/signin', [
            'email' => $email,
            'password' => 'badpassword',
        ]);
        $response6th->assertStatus(429)
            ->assertJson([
                'message' => 'Too many attempts. Please try again in a few minutes.',
            ]);
    }

    /**
     * AC-11: Password is never exposed in response payloads or profile endpoints.
     */
    public function test_password_is_never_exposed_in_responses(): void
    {
        $user = User::factory()->create([
            'email' => 'security@example.com',
            'password' => Hash::make('supersecretpassword'),
        ]);

        $token = $user->createToken('auth-token')->plainTextToken;

        $profileResponse = $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/auth/user');

        $profileResponse->assertStatus(200);
        $this->assertArrayNotHasKey('password', $profileResponse->json('user'));

        $signupResponse = $this->postJson('/api/auth/signup', [
            'email' => 'newsecurity@example.com',
            'password' => 'supersecretpassword',
        ]);

        $signupResponse->assertStatus(201);
        $this->assertArrayNotHasKey('password', $signupResponse->json('user'));
    }
}
