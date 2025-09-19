<?php

namespace Database\Factories;

use App\Models\Tag;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Tag>
 */
class TagFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $tags = [
            'ai', 'machine-learning', 'javascript', 'typescript', 'react', 'vue', 'angular',
            'nodejs', 'python', 'java', 'csharp', 'php', 'ruby', 'go', 'rust',
            'docker', 'kubernetes', 'aws', 'azure', 'gcp', 'devops', 'ci-cd',
            'testing', 'unit-testing', 'integration-testing', 'security', 'performance',
            'database', 'sql', 'nosql', 'api', 'rest', 'graphql', 'microservices',
            'productivity', 'automation', 'monitoring', 'logging', 'analytics'
        ];

        return [
            'name' => $this->faker->unique()->randomElement($tags),
        ];
    }
}