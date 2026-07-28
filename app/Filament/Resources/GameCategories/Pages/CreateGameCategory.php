<?php

namespace App\Filament\Resources\GameCategories\Pages;

use App\Filament\Resources\GameCategories\GameCategoryResource;
use Filament\Resources\Pages\CreateRecord;

class CreateGameCategory extends CreateRecord
{
    protected static string $resource = GameCategoryResource::class;
}
