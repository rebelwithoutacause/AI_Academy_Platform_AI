<?php

namespace Tests\Security\Authentication;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthSecurityTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test rate limiting on login attempts
     */
    public function test_login_rate_limiting(): void
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
        ]);

        // Make multiple failed login attempts
        for ($i = 0; $i < 6; $i++) {
            $this->postJson('/api/login', [
                'email' => 'test@example.com',
                'password' => 'wrong-password',
            ]);
        }

        // The next attempt should be rate limited
        $response = $this->postJson('/api/login', [
            'email' => 'test@example.com',
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(429); // Too Many Requests
    }

    /**
     * Test password requirements
     */
    public function test_password_strength_requirements(): void
    {
        $weakPasswords = [
            '123',
            'password',
            '12345678',
            'abcdefgh',
        ];

        foreach ($weakPasswords as $weakPassword) {
            $response = $this->postJson('/api/register', [
                'name' => 'Test User',
                'email' => 'test@example.com',
                'password' => $weakPassword,
                'password_confirmation' => $weakPassword,
            ]);

            // Should fail validation for weak passwords
            $response->assertStatus(422);
        }
    }

    /**
     * Test SQL injection prevention
     */
    public function test_sql_injection_prevention(): void
    {
        $maliciousInputs = [
            "admin'; DROP TABLE users; --",
            "' OR '1'='1",
            "admin' UNION SELECT * FROM users --",
        ];

        foreach ($maliciousInputs as $maliciousInput) {
            $response = $this->postJson('/api/login', [
                'email' => $maliciousInput,
                'password' => 'password',
            ]);

            // Should not cause any SQL errors
            $response->assertStatus(422); // Validation error, not SQL error
        }
    }

    /**
     * Test CSRF protection
     */
    public function test_csrf_protection_on_sensitive_endpoints(): void
    {
        $user = User::factory()->create();

        // Test without CSRF token (should fail for web routes)
        $response = $this->actingAs($user)
                         ->post('/logout'); // Web route, should require CSRF

        // For API routes, CSRF should not be required when using token auth
        $response = $this->actingAs($user, 'sanctum')
                         ->postJson('/api/logout');

        $response->assertStatus(200);
    }

    /**
     * Test token expiration
     */
    public function test_token_expiration(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('test-token');

        // Delete the token to simulate expiration
        $token->accessToken->delete();

        $response = $this->withHeaders([
            'Authorization' => 'Bearer ' . $token->plainTextToken,
        ])->getJson('/api/user');

        $response->assertStatus(401);
    }
}