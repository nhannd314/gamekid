<?php

namespace App\Models;

use Database\Factories\GameUserScoreFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GameUserScore extends Model
{
    /** @use HasFactory<GameUserScoreFactory> */
    use HasFactory;

    protected $fillable = [
        'game_id',
        'user_id',
        'best_score',
    ];

    protected $casts = [
        'best_score' => 'integer',
    ];

    public function game(): BelongsTo
    {
        return $this->belongsTo(Game::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Record a player's score, keeping only their best result for the game.
     */
    public static function recordScore(Game $game, User $user, int $score): self
    {
        $record = static::firstOrNew([
            'game_id' => $game->id,
            'user_id' => $user->id,
        ]);

        if (! $record->exists || $game->isBetterScore($score, $record->best_score)) {
            $record->best_score = $score;
            $record->save();
        }

        return $record;
    }
}
