@extends('layouts.app-sidebar')

@section('title', 'Tất cả trò chơi — KiddoPlay')
@section('meta_description', 'Khám phá toàn bộ trò chơi tại KiddoPlay. Các trò chơi giúp bé rèn luyện trí tuệ và tư duy.')

@section('content')

    <h1 class="h2 mb-3">
        Tất cả trò chơi
    </h1>

    @include('partials.game-grid')

    @include('partials.benefits')

@endsection
