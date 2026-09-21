<?php

use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned the "api" middleware group.
|
*/

/**
 * Health-check endpoint.
 *
 * Used as a post-setup smoke test to confirm the API is reachable and
 * the application has bootstrapped correctly.
 *
 * GET /api/health
 * Response: { "status": "ok", "service": "men-health-reset-api" }
 */
Route::get('/health', function () {
    return response()->json([
        'status' => 'ok',
        'service' => 'men-health-reset-api',
    ]);
});

/*
|--------------------------------------------------------------------------
| Authentication Routes
|--------------------------------------------------------------------------
|
| Public routes (no auth required):
|   POST /api/auth/register  — create a new account (AC-01)
|   POST /api/auth/login     — sign in (AC-02, AC-06, AC-09)
|
| Protected routes (Sanctum bearer token required):
|   POST /api/auth/logout    — revoke current token (AC-03)
|   GET  /api/auth/me        — return authenticated user profile (AC-04, AC-11)
|
*/
Route::prefix('auth')->group(function () {
    // Public
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);

    // Protected — requires a valid Sanctum bearer token
    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
    });
});
