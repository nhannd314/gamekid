<?php

namespace App\Console\Commands;

use App\Models\Game;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Str;

#[Signature('games:sync')]
#[Description('Scan resources/games for directories missing from the games table and add them')]
class SyncGamesFromDisk extends Command
{
    private const DEFAULT_DIFFICULTY = 'easy';

    private const DEFAULT_RANKING_ORDER = 'desc';

    /**
     * Execute the console command.
     */
    public function handle(): int
    {
        $gamesPath = resource_path('games');

        if (! is_dir($gamesPath)) {
            $this->error("Directory not found: {$gamesPath}");

            return self::FAILURE;
        }

        $folders = collect(scandir($gamesPath))
            ->reject(fn (string $entry) => in_array($entry, ['.', '..'], true))
            ->filter(fn (string $entry) => is_dir($gamesPath.DIRECTORY_SEPARATOR.$entry))
            ->values();

        $existingFolders = Game::whereIn('folder', $folders)->pluck('folder');
        $missingFolders = $folders->diff($existingFolders)->values();

        if ($missingFolders->isEmpty()) {
            $this->info("All {$folders->count()} game directories already exist in the database.");

            return self::SUCCESS;
        }

        foreach ($missingFolders as $folder) {
            $meta = $this->readMeta($gamesPath.DIRECTORY_SEPARATOR.$folder, $folder);

            $game = Game::create([
                'name' => $meta['name'],
                'folder' => $folder,
                'description' => $meta['description'],
                'thumbnail' => "https://picsum.photos/seed/{$folder}/400/300",
                'is_active' => true,
                'sort_order' => 0,
                'is_featured' => false,
                'ranking_order' => $meta['ranking_order'],
                'rating' => 5,
                'min_age' => $meta['min_age'],
                'difficulty' => $meta['difficulty'],
            ]);

            $this->line("Created: {$folder} -> slug \"{$game->slug}\" ({$meta['name']})");
        }

        $this->info(sprintf(
            'Done. Added %d game(s), %d already existed.',
            $missingFolders->count(),
            $existingFolders->count()
        ));

        return self::SUCCESS;
    }

    /**
     * Reads per-game metadata from game.json when present, falling back to
     * sensible defaults derived from the folder name for anything missing.
     *
     * @return array{name: string, min_age: ?int, difficulty: string, description: ?string, ranking_order: string}
     */
    private function readMeta(string $path, string $folder): array
    {
        $defaults = [
            'name' => Str::title(str_replace('-', ' ', $folder)),
            'min_age' => null,
            'difficulty' => self::DEFAULT_DIFFICULTY,
            'description' => null,
            'ranking_order' => self::DEFAULT_RANKING_ORDER,
        ];

        $jsonPath = $path.DIRECTORY_SEPARATOR.'game.json';

        if (! is_file($jsonPath)) {
            return $defaults;
        }

        $data = json_decode(file_get_contents($jsonPath), true);

        if (! is_array($data)) {
            $this->warn("  ⚠ {$folder}/game.json is invalid JSON — using defaults.");

            return $defaults;
        }

        return array_merge($defaults, array_intersect_key($data, $defaults));
    }
}
