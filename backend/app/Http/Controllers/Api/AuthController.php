<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Services\Auth\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function __construct(private readonly AuthService $authService) {}

    /**
     * POST /api/auth/register
     *
     * Creates a new user account. On success the user is signed in immediately
     * and a Sanctum bearer token is returned (AC-01).
     */
    public function register(RegisterRequest $request): JsonResponse
    {
        ['user' => $user, 'token' => $token] = $this->authService->register(
            email: $request->string('email')->lower()->trim()->toString(),
            password: $request->string('password')->toString(),
        );

        return response()->json([
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
            ],
            'token' => $token,
        ], 201);
    }

    /**
     * POST /api/auth/login
     *
     * Authenticates an existing user. Returns a Sanctum bearer token (AC-02).
     * Rate-limited to 5 failed attempts (AC-09).
     * Returns a uniform error on bad credentials (AC-06).
     */
    public function login(LoginRequest $request): JsonResponse
    {
        // AuthService raises a 429 abort or a ValidationException on failure.
        ['user' => $user, 'token' => $token] = $this->authService->login(
            email: $request->string('email')->lower()->trim()->toString(),
            password: $request->string('password')->toString(),
            ipAddress: $request->ip() ?? '0.0.0.0',
        );

        return response()->json([
            'user' => [
                'id' => $user->id,
                'email' => $user->email,
            ],
            'token' => $token,
        ]);
    }

    /**
     * POST /api/auth/logout
     *
     * Revokes the current Sanctum token (AC-03).
     * Requires auth:sanctum middleware.
     */
    public function logout(Request $request): JsonResponse
    {
        // Pass the full request so AuthService can resolve the Sanctum token
        // directly from the authenticated request context.
        $this->authService->logout($request);

        return response()->json(['message' => 'Signed out successfully.']);
    }

    /**
     * GET /api/auth/me
     *
     * Returns the authenticated user's profile — never exposes password (AC-11).
     * Requires auth:sanctum middleware.
     */
    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'id' => $user->id,
            'email' => $user->email,
        ]);
    }
}
