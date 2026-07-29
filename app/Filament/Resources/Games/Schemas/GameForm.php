<?php

namespace App\Filament\Resources\Games\Schemas;

use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Radio;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class GameForm
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
                TextInput::make('folder')
                    ->label('Thư mục game')
                    ->helperText('Tên thư mục thực tế trong resources/games/, vd: ai-bien-mat')
                    ->required(),
                Select::make('categories')
                    ->relationship('categories', 'name')
                    ->multiple()
                    ->preload(),
                Select::make('genres')
                    ->relationship('genres', 'name')
                    ->multiple()
                    ->preload(),
                Textarea::make('description')->rows(7),
                FileUpload::make('thumbnail')
                    ->image()
                    ->directory('games')
                    ->disk('public')
                    ->required(),
                Toggle::make('is_active')
                    ->required(),
                Toggle::make('is_featured')
                    ->required(),
                TextInput::make('sort_order')
                    ->required()
                    ->numeric()
                    ->default(0),
                TextInput::make('rating')
                    ->required()
                    ->numeric()
                    ->default(5),
                Radio::make('ranking_order')
                    ->options([
                        'desc' => 'Điểm cao nhất',
                        'asc' => 'Điểm thấp nhất',
                    ])
                    ->label('Cách xếp hạng')
                    ->inline()->columnSpanFull()
                    ->required()
                    ->default('desc'),
                TextInput::make('min_age')
                    ->label('Độ tuổi từ')
                    ->numeric()
                    ->minValue(0)
                    ->maxValue(255)
                    ->suffix('tuổi')
                    ->placeholder('Vd: 5'),
                Radio::make('difficulty')
                    ->options([
                        'easy' => 'Dễ',
                        'medium' => 'Trung bình',
                        'hard' => 'Khó',
                    ])
                    ->label('Độ khó')
                    ->inline()->columnSpanFull()
                    ->required()
                    ->default('easy'),

            ]);
    }
}
