<?php

use App\Models\Game;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;

uses(LazilyRefreshDatabase::class);

test('search finds games by name', function () {
    $match = Game::factory()->create(['name' => 'Xếp hình khủng long']);
    Game::factory()->create(['name' => 'Đua xe tốc độ']);

    $response = $this->get(route('search', ['q' => 'khủng long']));

    $response->assertOk();
    $response->assertSee($match->name);
    $response->assertDontSee('Đua xe tốc độ');
});

test('search finds games by description', function () {
    $match = Game::factory()->create(['name' => 'Ghép hình', 'description' => 'Trò chơi giúp bé rèn luyện trí nhớ']);
    Game::factory()->create(['name' => 'Toán học', 'description' => 'Luyện phép cộng trừ']);

    $response = $this->get(route('search', ['q' => 'trí nhớ']));

    $response->assertOk();
    $response->assertSee($match->name);
    $response->assertDontSee('Toán học');
});

test('search excludes inactive games', function () {
    Game::factory()->create(['name' => 'Trò chơi ẩn', 'is_active' => false]);

    $response = $this->get(route('search', ['q' => 'ẩn']));

    $response->assertOk();
    $response->assertSee('Không tìm thấy trò chơi nào phù hợp');
});

test('search without a query shows all active games', function () {
    $game = Game::factory()->create();

    $response = $this->get(route('search'));

    $response->assertOk();
    $response->assertSee($game->name);
});

test('search shows a message when nothing matches', function () {
    Game::factory()->create(['name' => 'Trò chơi có sẵn']);

    $response = $this->get(route('search', ['q' => 'khong ton tai']));

    $response->assertOk();
    $response->assertSee('Không tìm thấy trò chơi nào phù hợp');
});
