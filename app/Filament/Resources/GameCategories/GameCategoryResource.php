<?php

namespace App\Filament\Resources\GameCategories;

use App\Filament\Resources\GameCategories\Pages\CreateGameCategory;
use App\Filament\Resources\GameCategories\Pages\EditGameCategory;
use App\Filament\Resources\GameCategories\Pages\ListGameCategories;
use App\Filament\Resources\GameCategories\Schemas\GameCategoryForm;
use App\Filament\Resources\GameCategories\Tables\GameCategoriesTable;
use App\Models\GameCategory;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class GameCategoryResource extends Resource
{
    protected static ?string $model = GameCategory::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    protected static ?string $recordTitleAttribute = 'name';

    public static function form(Schema $schema): Schema
    {
        return GameCategoryForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return GameCategoriesTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListGameCategories::route('/'),
            'create' => CreateGameCategory::route('/create'),
            'edit' => EditGameCategory::route('/{record}/edit'),
        ];
    }
}
