<?php

use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// Health check — used as smoke test to confirm the environment is running correctly
Route::get('/health', function () {
    return response()->json(['status' => 'ok']);
});

// Authentication routes
Route::prefix('auth')->group(function () {
    Route::post('/signup', [AuthController::class, 'signup']);
    Route::post('/signin', [AuthController::class, 'signin']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/signout', [AuthController::class, 'signout']);
        Route::get('/user', [AuthController::class, 'user']);
    });
});

// Backwards-compatible /api/user route
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
