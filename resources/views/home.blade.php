@extends('layouts.app-sidebar')

@section('content')

    @if ($featuredGames->isNotEmpty())
        <div class="mb-5">
            <x-section-heading>
                <span class="icon">🎯</span> Trò chơi nổi bật
            </x-section-heading>
            <div class="row g-3 g-md-4">
                @foreach ($featuredGames as $game)
                    @include('partials.game-item', ['game' => $game, 'featured' => true])
                @endforeach
            </div>
        </div>
    @endif

    @foreach ($genres as $genre)
        @continue ($genre->games->isEmpty())

        <div class="mb-5">
            <x-section-heading :link="route('game.genre', $genre->slug)">
                <span class="icon">{{ $genre->icon }}</span> {{ $genre->name }}
            </x-section-heading>
            <div class="row g-3 g-md-4">
                @foreach ($genre->games as $game)
                    @include('partials.game-item')
                @endforeach
            </div>
        </div>
    @endforeach

    @include('partials.benefits')

@endsection
