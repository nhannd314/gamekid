<?php

use App\Models\Game;
use App\Models\GameUserScore;
use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;

uses(LazilyRefreshDatabase::class);

beforeEach(function () {
    $this->withoutVite();
});

test('game page shows the top scores ordered from highest to lowest', function () {
    $game = Game::factory()->create();

    $topUser = User::factory()->create(['name' => 'Người Điểm Cao']);
    GameUserScore::factory()->create(['game_id' => $game->id, 'user_id' => $topUser->id, 'score' => 9999]);

    $lowUser = User::factory()->create(['name' => 'Người Điểm Thấp']);
    GameUserScore::factory()->create(['game_id' => $game->id, 'user_id' => $lowUser->id, 'score' => 10]);

    $response = $this->get(route('game.show', $game->slug));

    $response->assertOk();
    $response->assertSeeInOrder(['Người Điểm Cao', 'Người Điểm Thấp']);
});

test('game page shows at most 10 scores even when more exist', function () {
    $game = Game::factory()->create();

    GameUserScore::factory()->count(15)->create(['game_id' => $game->id]);

    $response = $this->get(route('game.show', $game->slug));

    $response->assertOk();
    expect($game->scores()->count())->toBe(15);
});

test('scores from other games are not shown on the leaderboard', function () {
    $game = Game::factory()->create();
    $otherGame = Game::factory()->create();

    $user = User::factory()->create(['name' => 'Người Chơi Game Khác']);
    GameUserScore::factory()->create(['game_id' => $otherGame->id, 'user_id' => $user->id, 'score' => 500]);

    $response = $this->get(route('game.show', $game->slug));

    $response->assertOk();
    $response->assertDontSee('Người Chơi Game Khác');
});

test('game page shows an empty state when there are no scores yet', function () {
    $game = Game::factory()->create();

    $response = $this->get(route('game.show', $game->slug));

    $response->assertOk();
    $response->assertSee('Chưa có điểm số nào cho game này.');
});
