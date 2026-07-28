<?php

namespace Database\Factories;

use App\Models\Game;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Game>
 */
class GameFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->words(3, true),
            'description' => fake()->sentence(),
            'thumbnail' => 'games/placeholder.jpg',
            'is_active' => true,
            'sort_order' => 0,
            'is_featured' => false,
            'rating' => fake()->numberBetween(1, 5),
        ];
    }
}
