<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Laravel\Sanctum\PersonalAccessToken;
use Laravel\Sanctum\Sanctum;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // Enforce 30-minute inactivity timeout on personal access tokens (AC-10).
        // Each authenticated request updates last_used_at, sliding the 30-minute window.
        // If a token remains inactive for more than 30 minutes, it is rejected (401).
        Sanctum::authenticateAccessTokensUsing(function (PersonalAccessToken $accessToken, bool $isValid) {
            if (! $isValid) {
                return false;
            }

            $inactivityMinutes = config('sanctum.inactivity_timeout', 30);
            if (! $inactivityMinutes) {
                return true;
            }

            $lastActivity = $accessToken->last_used_at ?? $accessToken->created_at;

            return $lastActivity ? $lastActivity->gt(now()->subMinutes($inactivityMinutes)) : false;
        });
    }
}
