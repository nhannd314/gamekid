@extends('layouts.app-sidebar')

@section('content')

    @if ($featuredGames->isNotEmpty())
        <div class="featured-band rounded-4 p-3 p-md-4 mb-5">
            @include('partials.section-heading', ['icon' => '🔥', 'title' => 'Trò chơi nổi bật'])

            <div class="row g-4">
                @foreach ($featuredGames as $game)
                    @include('partials.game-item', ['game' => $game, 'featured' => true])
                @endforeach
            </div>
        </div>
    @endif

    @foreach ($genres as $genre)
        @continue ($genre->games->isEmpty())

        <div class="mb-5">
            @include('partials.section-heading', [
                'icon' => match ($genre->slug) {
                    'tro-choi-tri-nho' => '🧠',
                    'tro-choi-tri-tue' => '🧩',
                    'tro-choi-hoc-tieng-anh' => '🔤',
                    default => '🎮',
                },
                'title' => $genre->name,
                'href' => route('game.genre', $genre->slug),
            ])

            <div class="row g-4">
                @foreach ($genre->games as $game)
                    @include('partials.game-item')
                @endforeach
            </div>
        </div>
    @endforeach

    @if ($otherGames->isNotEmpty())
        <div class="mb-5">
            @include('partials.section-heading', ['icon' => '✨', 'title' => 'Trò chơi khác'])

            <div class="row g-4">
                @foreach ($otherGames as $game)
                    @include('partials.game-item')
                @endforeach
            </div>
        </div>
    @endif

    @include('partials.benefits')

@endsection
