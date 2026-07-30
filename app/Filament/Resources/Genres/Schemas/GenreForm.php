<?php

namespace App\Filament\Resources\Genres\Schemas;

use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class GenreForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('name')
                    ->required(),
                TextInput::make('slug')
                    ->disabled()
                    ->dehydrated(false),
                TextInput::make('icon')
                    ->label('Icon')
                    ->helperText('Emoji hiển thị cho thể loại, vd: 🧠')
                    ->maxLength(255),
                TextInput::make('sort_order')
                    ->required()
                    ->numeric()
                    ->default(0),
            ]);
    }
}
