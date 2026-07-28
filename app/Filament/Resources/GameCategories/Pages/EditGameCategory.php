<?php

namespace App\Filament\Resources\GameCategories\Pages;

use App\Filament\Resources\GameCategories\GameCategoryResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditGameCategory extends EditRecord
{
    protected static string $resource = GameCategoryResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
