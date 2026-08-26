<?php

namespace Tests\Feature;

use Tests\TestCase;

/**
 * Smoke-test for the API health-check endpoint.
 *
 * Confirms that:
 *  - The application boots correctly
 *  - The API routing is registered
 *  - JSON responses are well-formed
 *
 * This is the first test a new engineer should see pass after cloning
 * and running the setup steps in the README.
 */
class HealthCheckTest extends TestCase
{
    public function test_health_endpoint_returns_ok(): void
    {
        $response = $this->getJson('/api/health');

        $response->assertStatus(200)
                 ->assertJson([
                     'status'  => 'ok',
                     'service' => 'men-health-reset-api',
                 ]);
    }

    public function test_health_response_contains_required_keys(): void
    {
        $response = $this->getJson('/api/health');

        $response->assertStatus(200)
                 ->assertJsonStructure(['status', 'service']);
    }
}
