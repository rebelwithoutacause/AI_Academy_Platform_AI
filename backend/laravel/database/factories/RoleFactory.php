<?php

namespace Database\Factories;

use App\Models\Role;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Role>
 */
class RoleFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $roles = [
            'Frontend Developer',
            'Backend Developer',
            'Full Stack Developer',
            'DevOps Engineer',
            'QA Engineer',
            'Designer',
            'Project Manager',
            'Data Engineer',
            'Mobile Developer',
            'Security Engineer',
            'ML Engineer',
            'Product Manager'
        ];

        return [
            'name' => $this->faker->unique()->randomElement($roles),
        ];
    }
}