@extends('layouts.app-sidebar')

@section('title', $genre->name . ' — KiddoPlay')
@section('meta_description', 'Khám phá danh sách ' . $genre->name . ' tại KiddoPlay. Các trò chơi giúp bé rèn luyện trí tuệ và tư duy.')

@section('content')

    <h2 class="mb-4">
        {{ $genre->name }}
    </h2>
    <div class="row g-4">

        @forelse ($games as $game)
            @include('partials.game-item')
        @empty

        @endforelse

    </div>

    @include('partials.benefits')

@endsection
