@extends('layouts.app-sidebar')

@section('content')

    <div class="ps-md-2">
        <div class="row g-4 g-md-5">
            <div class="col-12 col-md-8">
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
                        <div class="mb-3 fs-6">{{ $game->description }}</div>
                    </div>
                    <button id="bg-music-toggle" type="button" class="bg-music-toggle btn btn-primary btn-sm px-3 py-2 text-nowrap" aria-pressed="true" aria-label="Tắt nhạc nền">
                        🔊 Tắt nhạc
                    </button>
                </div>
                <div>
                    <button class="btn btn-secondary btn-lg" style="padding: 9px 16px 7px" id="play-game-btn">
                        PLAY GAME <svg style="position: relative; top: -1px" width="1em" height="1em" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <path d="M21.4086 9.35258C23.5305 10.5065 23.5305 13.4935 21.4086 14.6474L8.59662 21.6145C6.53435 22.736 4 21.2763 4 18.9671L4 5.0329C4 2.72368 6.53435 1.26402 8.59661 2.38548L21.4086 9.35258Z" fill="#1C274C"></path> </g></svg>
                    </button>
                </div>

                <div class="game-content position-relative">
                    <div class="d-none" id="game-container"></div>
                </div>

                <audio id="bg-music" src="{{ asset('audio/bg.mp3') }}" loop preload="auto"></audio>
            </div>
            <!--/ relative games -->
            <div class="col-12 col-md-4">

                @include('partials.sidebar-games')

            </div>
        </div>

        @include('partials.benefits')

    </div>

@endsection

@vite('resources/games/' . $game->slug . '/index.js')
