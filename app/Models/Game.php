<?php

namespace App\Models;

use App\Models\Traits\HasSlug;
use Database\Factories\GameFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Game extends Model
{
    /** @use HasFactory<GameFactory> */
    use HasFactory, HasSlug;

    protected function slugSource()
    {
        return 'name';
    }

    protected $fillable = [
        'name',
        'slug',
        'folder',
        'description',
        'thumbnail',
        'config',
        'is_active',
        'sort_order',
        'is_featured',
        'rating',
        'ranking_order',
        'min_age',
        'difficulty',
    ];

    protected $casts = [
        'config' => 'array',
    ];

    public function categories(): BelongsToMany
    {
        return $this->belongsToMany(Category::class);
    }

    public function genres(): BelongsToMany
    {
        return $this->belongsToMany(Genre::class);
    }

    public function scores(): HasMany
    {
        return $this->hasMany(GameUserScore::class);
    }

    /**
     * Determine whether a new score beats a current one, honoring the game's ranking order.
     */
    public function isBetterScore(int $newScore, int $currentScore): bool
    {
        return $this->ranking_order === 'asc'
            ? $newScore < $currentScore
            : $newScore > $currentScore;
    }

    public function difficultyLabel(): string
    {
        return match ($this->difficulty) {
            'easy' => 'Dễ',
            'medium' => 'Trung bình',
            'hard' => 'Khó',
            default => $this->difficulty,
        };
    }

    public function difficultyBadgeClass(): string
    {
        return match ($this->difficulty) {
            'easy' => 'text-bg-success',
            'medium' => 'text-bg-warning',
            'hard' => 'text-bg-danger',
            default => 'text-bg-secondary',
        };
    }
}
