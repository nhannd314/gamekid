@extends('layouts.app-sidebar')

@section('title', $genre->name . ' — KiddoPlay')
@section('meta_description', 'Khám phá danh sách ' . $genre->name . ' tại KiddoPlay. Các trò chơi giúp bé rèn luyện trí tuệ và tư duy.')

@section('content')

    <h1 class="h2 mb-3">
        {{ $genre->name }}
    </h1>

    @include('partials.game-grid')

    @include('partials.benefits')

@endsection
