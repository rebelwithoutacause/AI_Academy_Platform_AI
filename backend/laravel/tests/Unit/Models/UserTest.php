<?php

namespace Tests\Unit\Models;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class UserTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Test user creation
     */
    public function test_user_can_be_created(): void
    {
        $userData = [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => bcrypt('password'),
            'role' => 'user',
        ];

        $user = User::create($userData);

        $this->assertInstanceOf(User::class, $user);
        $this->assertEquals($userData['name'], $user->name);
        $this->assertEquals($userData['email'], $user->email);
        $this->assertEquals($userData['role'], $user->role);
    }

    /**
     * Test user role display names
     */
    public function test_user_role_display_names(): void
    {
        $user = User::factory()->create(['role' => 'owner']);
        $this->assertEquals('Owner', $user->getRoleDisplayName());

        $user->role = 'frontend';
        $this->assertEquals('Frontend Developer', $user->getRoleDisplayName());

        $user->role = 'backend';
        $this->assertEquals('Backend Developer', $user->getRoleDisplayName());
    }

    /**
     * Test user role colors
     */
    public function test_user_role_colors(): void
    {
        $user = User::factory()->create(['role' => 'owner']);
        $this->assertEquals('green', $user->getRoleColor());

        $user->role = 'qa';
        $this->assertEquals('red', $user->getRoleColor());
    }
}