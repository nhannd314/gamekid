<?php

use App\Models\Game;
use App\Models\GameUserScore;
use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;

uses(LazilyRefreshDatabase::class);

test('guests cannot save a score', function () {
    $game = Game::factory()->create();

    $response = $this->postJson(route('game.score.store', $game), ['score' => 10]);

    $response->assertStatus(401);
    $this->assertDatabaseCount('game_user_scores', 0);
});

test('an authenticated player can save their first score', function () {
    $user = User::factory()->create();
    $game = Game::factory()->create(['ranking_order' => 'desc']);

    $response = $this->actingAs($user)->postJson(route('game.score.store', $game), ['score' => 42]);

    $response->assertOk();
    $response->assertJson(['best_score' => 42]);

    $this->assertDatabaseHas('game_user_scores', [
        'game_id' => $game->id,
        'user_id' => $user->id,
        'best_score' => 42,
    ]);
});

test('a higher score replaces the best score when ranking_order is desc', function () {
    $user = User::factory()->create();
    $game = Game::factory()->create(['ranking_order' => 'desc']);
    GameUserScore::factory()->create(['game_id' => $game->id, 'user_id' => $user->id, 'best_score' => 10]);

    $response = $this->actingAs($user)->postJson(route('game.score.store', $game), ['score' => 20]);

    $response->assertOk();
    $response->assertJson(['best_score' => 20]);

    $this->assertDatabaseHas('game_user_scores', [
        'game_id' => $game->id,
        'user_id' => $user->id,
        'best_score' => 20,
    ]);
});

test('a lower score is ignored when ranking_order is desc', function () {
    $user = User::factory()->create();
    $game = Game::factory()->create(['ranking_order' => 'desc']);
    GameUserScore::factory()->create(['game_id' => $game->id, 'user_id' => $user->id, 'best_score' => 10]);

    $response = $this->actingAs($user)->postJson(route('game.score.store', $game), ['score' => 5]);

    $response->assertOk();
    $response->assertJson(['best_score' => 10]);

    $this->assertDatabaseHas('game_user_scores', [
        'game_id' => $game->id,
        'user_id' => $user->id,
        'best_score' => 10,
    ]);
});

test('a lower score replaces the best score when ranking_order is asc', function () {
    $user = User::factory()->create();
    $game = Game::factory()->create(['ranking_order' => 'asc']);
    GameUserScore::factory()->create(['game_id' => $game->id, 'user_id' => $user->id, 'best_score' => 10]);

    $response = $this->actingAs($user)->postJson(route('game.score.store', $game), ['score' => 3]);

    $response->assertOk();
    $response->assertJson(['best_score' => 3]);
});

test('a higher score is ignored when ranking_order is asc', function () {
    $user = User::factory()->create();
    $game = Game::factory()->create(['ranking_order' => 'asc']);
    GameUserScore::factory()->create(['game_id' => $game->id, 'user_id' => $user->id, 'best_score' => 10]);

    $response = $this->actingAs($user)->postJson(route('game.score.store', $game), ['score' => 15]);

    $response->assertOk();
    $response->assertJson(['best_score' => 10]);
});

test('score is required and must be a non-negative integer', function () {
    $user = User::factory()->create();
    $game = Game::factory()->create();

    $response = $this->actingAs($user)->postJson(route('game.score.store', $game), ['score' => -1]);

    $response->assertJsonValidationErrors('score');
});
