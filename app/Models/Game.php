<?php

namespace App\Models;

use App\Models\Traits\HasSlug;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Game extends Model
{
    use HasSlug;

    protected function slugSource()
    {
        return 'name';
    }

    protected $fillable = [
        'name',
        'slug',
        'description',
        'thumbnail',
        'config',
        'is_active',
        'sort_order',
        'is_featured',
        'rating'
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
}
