<?php

namespace Database\Factories;

use App\Models\Game;
use App\Models\GameUserScore;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<GameUserScore>
 */
class GameUserScoreFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'game_id' => Game::factory(),
            'user_id' => User::factory(),
            'best_score' => fake()->numberBetween(0, 10000),
        ];
    }
}
