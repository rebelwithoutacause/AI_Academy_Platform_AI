<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\User>
 */
class UserFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = User::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'email_verified_at' => now(),
            'password' => Hash::make('password'),
            'role' => fake()->randomElement(['owner', 'frontend', 'backend', 'pm', 'qa', 'designer']),
            'remember_token' => Str::random(10),
        ];
    }

    /**
     * Indicate that the model's email address should be unverified.
     */
    public function unverified(): static
    {
        return $this->state(fn (array $attributes) => [
            'email_verified_at' => null,
        ]);
    }

    /**
     * Indicate that the user should be an owner.
     */
    public function owner(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'owner',
        ]);
    }

    /**
     * Indicate that the user should be a frontend developer.
     */
    public function frontend(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'frontend',
        ]);
    }

    /**
     * Indicate that the user should be a backend developer.
     */
    public function backend(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'backend',
        ]);
    }

    /**
     * Indicate that the user should be a QA engineer.
     */
    public function qa(): static
    {
        return $this->state(fn (array $attributes) => [
            'role' => 'qa',
        ]);
    }
}