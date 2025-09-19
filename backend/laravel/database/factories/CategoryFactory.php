<?php

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Category>
 */
class CategoryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $categories = [
            'Frontend Development',
            'Backend Development',
            'Database',
            'DevOps',
            'Testing',
            'Design',
            'Project Management',
            'API Development',
            'Mobile Development',
            'Cloud Services',
            'Security',
            'Machine Learning',
            'Data Science',
            'Quality Assurance'
        ];

        return [
            'name' => $this->faker->unique()->randomElement($categories),
        ];
    }
}