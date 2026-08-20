<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    /**
     * Maximum allowed signin attempts per window.
     */
    private const MAX_ATTEMPTS = 5;

    /**
     * Rate limit decay window in seconds.
     */
    private const DECAY_SECONDS = 60;

    /**
     * Handle user registration.
     */
    public function signup(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'max:64'],
            'name' => ['nullable', 'string', 'max:255'],
        ], [
            'email.required' => 'Email is required.',
            'email.email' => 'Please provide a valid email address.',
            'email.unique' => 'This email is already registered.',
            'password.required' => 'Password is required.',
            'password.min' => 'Password must be at least 8 characters.',
            'password.max' => 'Password may not exceed 64 characters.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors(),
            ], 422);
        }

        $email = Str::lower(trim($request->input('email')));
        $name = $request->input('name') ? trim($request->input('name')) : Str::before($email, '@');

        $user = User::create([
            'name' => $name,
            'email' => $email,
            'password' => Hash::make($request->input('password')),
        ]);

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Account created successfully.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'created_at' => $user->created_at,
            ],
            'token' => $token,
        ], 201);
    }

    /**
     * Handle user sign in with rate limiting.
     */
    public function signin(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string'],
        ], [
            'email.required' => 'Email is required.',
            'password.required' => 'Password is required.',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => $validator->errors()->first(),
                'errors' => $validator->errors(),
            ], 422);
        }

        $email = Str::lower(trim($request->input('email')));
        $throttleKey = $this->throttleKey($request, $email);

        if (RateLimiter::tooManyAttempts($throttleKey, self::MAX_ATTEMPTS)) {
            return response()->json([
                'message' => 'Too many attempts. Please try again in a few minutes.',
            ], 429);
        }

        $user = User::where('email', $email)->first();

        if (! $user || ! Hash::check($request->input('password'), $user->password)) {
            RateLimiter::hit($throttleKey, self::DECAY_SECONDS);

            // If this attempt reached the limit, return 429 immediately
            if (RateLimiter::tooManyAttempts($throttleKey, self::MAX_ATTEMPTS)) {
                return response()->json([
                    'message' => 'Too many attempts. Please try again in a few minutes.',
                ], 429);
            }

            return response()->json([
                'message' => 'Email or password is incorrect',
            ], 401);
        }

        RateLimiter::clear($throttleKey);

        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Signed in successfully.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'created_at' => $user->created_at,
            ],
            'token' => $token,
        ], 200);
    }

    /**
     * Handle user sign out.
     */
    public function signout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Signed out successfully.',
        ], 200);
    }

    /**
     * Get the authenticated user's profile.
     */
    public function user(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'created_at' => $user->created_at,
            ],
        ], 200);
    }

    /**
     * Get the rate limiting throttle key.
     */
    private function throttleKey(Request $request, string $email): string
    {
        return 'signin:'.Str::transliterate($email.'|'.$request->ip());
    }
}
