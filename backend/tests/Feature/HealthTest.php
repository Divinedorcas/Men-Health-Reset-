<?php

namespace Tests\Feature;

use Tests\TestCase;

class HealthTest extends TestCase
{
    /**
     * Smoke test: the /api/health endpoint returns HTTP 200 and {"status":"ok"}.
     *
     * This is the canonical check that the environment is correctly configured.
     * If this test fails, the setup steps in the README have not been completed
     * successfully.
     */
    public function test_health_endpoint_returns_ok(): void
    {
        $response = $this->getJson('/api/health');

        $response
            ->assertStatus(200)
            ->assertExactJson(['status' => 'ok']);
    }
}
