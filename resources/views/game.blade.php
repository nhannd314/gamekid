@extends('layouts.app-sidebar')

@section('title', $game->name . ' — KiddoPlay')
@section('meta_description', $game->description)
@section('meta_image', asset('storage/' . $game->thumbnail))

@section('content')

    <div class="ps-md-2">
        <div class="row g-0 g-md-4">
            <div class="col-12 col-md-8 mb-4 mb-md-0">
                @php
                    $breadcrumbItems = [];
                    $category = $game->categories->first();

                    if ($category) {
                        $breadcrumbItems[$category->name] = route('game.category', $category);
                    }

                    $breadcrumbItems[$game->name] = null;
                @endphp
                @include('partials.breadcrumbs', ['items' => $breadcrumbItems])

                <div class="d-flex justify-content-between align-items-start mb-2">
                    <div>
                        <h1 class="h2">{{ $game->name }}</h1>
                        <div class="mb-3 d-flex gap-2 flex-wrap">
                            @if ($game->min_age)
                                <span class="text-bg-light border rounded py-1 px-2">👶 {{ $game->min_age }}+ tuổi</span>
                            @endif
                            <span class="rounded text-white py-1 px-2 {{ $game->difficultyBadgeClass() }}">🎯 Độ khó: {{ $game->difficultyLabel() }}</span>
                        </div>
                        <div class="fs-6">{{ $game->description }}</div>
                    </div>
                    <button id="bg-music-toggle" type="button" class="bg-music-toggle btn btn-primary btn-sm px-3 py-2 text-nowrap" aria-pressed="true" aria-label="Tắt nhạc nền">
                        🔊 Tắt nhạc
                    </button>
                </div>
                @guest
                    <div class="fs-6 mb-4">
                        ⏩ <a href="{{ route('login', ['redirect' => url()->full()]) }}" class="border-bottom border-2 text-danger">Đăng nhập</a> để ghi tên mình vào bảng xếp hạng
                    </div>
                @endguest
                <div class="">
                    <button class="btn btn-secondary btn-lg" style="padding: 9px 16px 7px" id="play-game-btn">
                        PLAY GAME <x-heroicon-s-play class="heroicon" />
                    </button>
                </div>

                <div class="rounded-3 overflow-hidden bg-white p-3 p-md-4 shadow-sm d-none pb-md-5 position-relative" id="game-container" data-game-slug="{{ $game->slug }}"></div>

                <audio id="bg-music" src="{{ asset('audio/bg.mp3') }}" loop preload="auto"></audio>

                @vite('resources/games/' . $game->folder . '/index.js')
            </div>
            <!--/ relative games -->
            <div class="col-12 col-md-4">

                @include('partials.game-leaderboard')

                @include('partials.sidebar-games')

            </div>
        </div>

        @include('partials.benefits')

    </div>

@endsection
