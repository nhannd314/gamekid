<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Game;
use App\Models\Genre;
use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::updateOrCreate(
            ['email' => 'nhannd314@gmail.com'],
            ['name' => 'Nhan', 'password' => '01051992']
        );

        $categoryNames = ['Hành Động', 'Phiêu Lưu', 'Giải Đố', 'Đua Xe', 'Thể Thao'];

        $categories = collect($categoryNames)->map(fn (string $name, int $index) => Category::updateOrCreate(
            ['name' => $name],
            ['sort_order' => $index]
        ));

        $genreNames = ['Trò chơi trí nhớ', 'Trò chơi trí tuệ', 'Trò chơi học tiếng Anh'];

        $genres = collect($genreNames)->map(fn (string $name, int $index) => Genre::updateOrCreate(
            ['name' => $name],
            ['sort_order' => $index]
        ));

        $gameNames = [
            'Ninja Runner', 'Kho Báu Bí Ẩn', 'Mê Cung Trí Tuệ', 'Đua Xe Tốc Độ',
            'Bóng Đá Sân Cỏ', 'Chiến Binh Rồng', 'Đảo Hoang Sinh Tồn', 'Xếp Hình Kim Cương',
            'Đua Xe Địa Hình', 'Bóng Rổ Đường Phố',
        ];

        foreach ($gameNames as $index => $name) {
            $game = Game::updateOrCreate(
                ['name' => $name],
                [
                    'description' => "Trò chơi {$name} hấp dẫn dành cho mọi lứa tuổi.",
                    'thumbnail' => "https://picsum.photos/seed/game-{$index}/400/300",
                    'is_active' => true,
                    'sort_order' => $index,
                    'is_featured' => $index < 3,
                    'rating' => random_int(1, 5),
                ]
            );

            $game->categories()->sync([$categories->get($index % $categories->count())->id]);
            $game->genres()->sync([$genres->get($index % $genres->count())->id]);
        }
    }
}
