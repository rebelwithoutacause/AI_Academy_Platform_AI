<?php

namespace Database\Factories;

use App\Models\Tool;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Tool>
 */
class ToolFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $difficulties = ['Beginner', 'Intermediate', 'Advanced'];

        return [
            'name' => $this->faker->words(3, true),
            'link' => $this->faker->url(),
            'documentation' => $this->faker->optional()->url(),
            'description' => $this->faker->paragraph(),
            'usage' => $this->faker->paragraph(),
            'examples' => $this->faker->optional()->paragraph(),
            'difficulty_level' => $this->faker->optional()->randomElement($difficulties),
            'video_links' => $this->faker->optional()->randomElements([
                'https://youtube.com/watch?v=' . $this->faker->regexify('[A-Za-z0-9_-]{11}'),
                'https://vimeo.com/' . $this->faker->numberBetween(100000, 999999)
            ], $this->faker->numberBetween(0, 2)),
            'rating' => $this->faker->optional()->randomFloat(1, 0, 5),
            'images' => $this->faker->optional()->randomElements([
                'tools/' . $this->faker->uuid() . '.jpg',
                'tools/' . $this->faker->uuid() . '.png',
                'tools/' . $this->faker->uuid() . '.webp'
            ], $this->faker->numberBetween(0, 3)),
            'created_by' => User::factory(),
        ];
    }

    /**
     * Indicate that the tool is for beginners.
     */
    public function beginner(): static
    {
        return $this->state(fn (array $attributes) => [
            'difficulty_level' => 'Beginner',
        ]);
    }

    /**
     * Indicate that the tool is intermediate level.
     */
    public function intermediate(): static
    {
        return $this->state(fn (array $attributes) => [
            'difficulty_level' => 'Intermediate',
        ]);
    }

    /**
     * Indicate that the tool is advanced level.
     */
    public function advanced(): static
    {
        return $this->state(fn (array $attributes) => [
            'difficulty_level' => 'Advanced',
        ]);
    }

    /**
     * Indicate that the tool has a high rating.
     */
    public function highRated(): static
    {
        return $this->state(fn (array $attributes) => [
            'rating' => $this->faker->randomFloat(1, 4.0, 5.0),
        ]);
    }

    /**
     * Indicate that the tool has video tutorials.
     */
    public function withVideos(): static
    {
        return $this->state(fn (array $attributes) => [
            'video_links' => [
                'https://youtube.com/watch?v=' . $this->faker->regexify('[A-Za-z0-9_-]{11}'),
                'https://vimeo.com/' . $this->faker->numberBetween(100000, 999999)
            ],
        ]);
    }
}