<?php

namespace Tests\Feature;

use Tests\TestCase;

class HealthTest extends TestCase
{
    /**
     * Test that the health endpoint returns HTTP 200 and expected status.
     */
    public function test_health_check_endpoint(): void
    {
        $response = $this->getJson('/api/health');

        $response->assertStatus(200)
            ->assertJson([
                'status' => 'ok',
            ]);
    }
}
